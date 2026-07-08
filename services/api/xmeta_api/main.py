from __future__ import annotations

import os
from collections.abc import Generator
from dataclasses import dataclass

from fastapi import Cookie, Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .account_database import iter_account_db
from .account_models import Membership, MembershipRole, Organization, RefreshSession, User
from .account_service import (
    AccountConflictError,
    AccountService,
    InvalidCredentialsError,
    UnauthorizedSessionError,
)
from .prompt import build_script_dialogue_prompt
from .providers import (
    ProviderConfigurationError,
    ProviderExecutionError,
    ScriptProviderSettings,
    get_script_provider,
)
from .runner import run_script_task_sync
from .schemas import (
    AccountInviteRequest,
    AccountInviteResponse,
    AccountMemberResponse,
    AccountMemberRoleUpdateRequest,
    AccountMembersResponse,
    AccountPasswordChangeRequest,
    AccountPasswordResetConfirmRequest,
    AccountPasswordResetRequest,
    AccountPasswordResetResponse,
    ScriptDialogueMessage,
    ScriptDialogueRequest,
    ScriptDialogueResponse,
    ScriptDialogueRole,
    ScriptNodeSaveRequest,
    ScriptNodeState,
    ScriptSettings,
    TaskResult,
    TaskState,
    TaskStatus,
    AccountOrganizationResponse,
    AccountsResponse,
    AccountProfileUpdateRequest,
    AccountUserResponse,
    ActiveAccountRequest,
    AuthLoginRequest,
    AuthRegisterRequest,
    AuthSessionResponse,
    AccountWorkspaceUpdateRequest,
)
from .store import store


app = FastAPI(title="X-META Video API", version="0.1.0")

frontend_origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SESSION_COOKIE_NAME = "xmeta_session"
EDITOR_ROLES = {MembershipRole.OWNER, MembershipRole.ADMIN, MembershipRole.EDITOR}
ACCOUNT_MANAGER_ROLES = {MembershipRole.OWNER, MembershipRole.ADMIN}


@dataclass(frozen=True)
class ActorContext:
    user_id: str
    organization_id: str
    role: MembershipRole
    membership: Membership


def get_account_db() -> Generator[Session, None, None]:
    yield from iter_account_db()


def _user_response(user: User) -> AccountUserResponse:
    return AccountUserResponse(user_id=user.id, email=user.email, name=user.name)


def _organization_response(
    organization: Organization,
    membership: Membership,
) -> AccountOrganizationResponse:
    return AccountOrganizationResponse(
        org_id=organization.id,
        name=organization.name,
        role=membership.role.value,
    )


def _member_response(membership: Membership) -> AccountMemberResponse:
    user = membership.user
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Membership user not found.",
        )
    return AccountMemberResponse(
        membership_id=membership.id,
        user_id=user.id,
        email=user.email,
        name=user.name,
        role=membership.role.value,
    )


def _membership_role(value: str) -> MembershipRole:
    try:
        return MembershipRole(value.strip().lower())
    except ValueError as exc:
        allowed = ", ".join(role.value for role in MembershipRole)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Role must be one of: {allowed}.",
        ) from exc


def _require_account_manager(membership: Membership) -> None:
    if membership.role not in ACCOUNT_MANAGER_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Owner or Admin role is required.",
        )


def _set_session_cookie(response: Response, raw_token: str) -> None:
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=raw_token,
        httponly=True,
        samesite=os.getenv("COOKIE_SAMESITE", "lax"),
        secure=os.getenv("COOKIE_SECURE", "false").lower() == "true",
        max_age=60 * 60 * 24 * 30,
        path="/",
    )


def _clear_session_cookie(response: Response) -> None:
    response.delete_cookie(key=SESSION_COOKIE_NAME, path="/")


def _session_response(
    *,
    service: AccountService,
    user: User,
    membership: Membership,
) -> AuthSessionResponse:
    organization = membership.organization or service.get_organization(membership.organization_id)
    if organization is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Active organization not found.",
        )
    return AuthSessionResponse(
        user=_user_response(user),
        active_organization=_organization_response(organization, membership),
    )


def _current_session(
    db: Session,
    raw_token: str | None,
) -> tuple[AccountService, RefreshSession, User, Membership]:
    service = AccountService(db)
    try:
        refresh_session = service.get_session(raw_token)
    except UnauthorizedSessionError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc

    user = service.get_user(refresh_session.user_id)
    membership = service.get_membership(
        refresh_session.user_id,
        refresh_session.active_organization_id,
    )
    if user is None or membership is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )
    return service, refresh_session, user, membership


def get_actor_context(
    db: Session = Depends(get_account_db),
    session_token: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
) -> ActorContext:
    _service, _refresh_session, user, membership = _current_session(db, session_token)
    return ActorContext(
        user_id=user.id,
        organization_id=membership.organization_id,
        role=membership.role,
        membership=membership,
    )


def _require_project_membership(project_id: str, actor: ActorContext) -> None:
    project_org = store.get_project_organization(project_id)
    if project_org is not None and project_org != actor.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this project.",
        )


def _require_project_editor(project_id: str, actor: ActorContext) -> None:
    _require_project_membership(project_id, actor)
    if actor.role not in EDITOR_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Editor role or higher is required.",
        )


def _require_task_membership(task_id: str, actor: ActorContext) -> None:
    task_org = store.get_task_organization(task_id)
    if task_org is not None and task_org != actor.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this task.",
        )


@app.post(
    "/api/v1/auth/register",
    response_model=AuthSessionResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_account(
    request: AuthRegisterRequest,
    response: Response,
    db: Session = Depends(get_account_db),
) -> AuthSessionResponse:
    service = AccountService(db)
    try:
        user, organization, membership = service.register_user(
            email=request.email,
            password=request.password,
            name=request.name,
        )
    except AccountConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    session_token = service.create_session(user_id=user.id, organization_id=organization.id)
    _set_session_cookie(response, session_token.raw_token)
    return AuthSessionResponse(
        user=_user_response(user),
        active_organization=_organization_response(organization, membership),
    )


@app.post("/api/v1/auth/login", response_model=AuthSessionResponse)
def login_account(
    request: AuthLoginRequest,
    response: Response,
    db: Session = Depends(get_account_db),
) -> AuthSessionResponse:
    service = AccountService(db)
    try:
        user, membership = service.authenticate_user(email=request.email, password=request.password)
    except InvalidCredentialsError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    session_token = service.create_session(
        user_id=user.id,
        organization_id=membership.organization_id,
    )
    _set_session_cookie(response, session_token.raw_token)
    return _session_response(service=service, user=user, membership=membership)


@app.post("/api/v1/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout_account(
    response: Response,
    db: Session = Depends(get_account_db),
    session_token: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
) -> Response:
    AccountService(db).revoke_session(session_token)
    _clear_session_cookie(response)
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@app.post("/api/v1/auth/refresh", response_model=AuthSessionResponse)
def refresh_account_session(
    response: Response,
    db: Session = Depends(get_account_db),
    session_token: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
) -> AuthSessionResponse:
    service, refresh_session, user, membership = _current_session(db, session_token)
    new_session = service.create_session(
        user_id=refresh_session.user_id,
        organization_id=refresh_session.active_organization_id,
    )
    service.revoke_session(session_token)
    _set_session_cookie(response, new_session.raw_token)
    return _session_response(service=service, user=user, membership=membership)


@app.get("/api/v1/auth/me", response_model=AuthSessionResponse)
def get_current_account(
    db: Session = Depends(get_account_db),
    session_token: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
) -> AuthSessionResponse:
    service, _refresh_session, user, membership = _current_session(db, session_token)
    return _session_response(service=service, user=user, membership=membership)


@app.get("/api/v1/accounts", response_model=AccountsResponse)
def list_accounts(
    db: Session = Depends(get_account_db),
    session_token: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
) -> AccountsResponse:
    service, _refresh_session, user, _membership = _current_session(db, session_token)
    organizations = [
        _organization_response(membership.organization, membership)
        for membership in service.list_memberships(user.id)
        if membership.organization is not None
    ]
    return AccountsResponse(organizations=organizations)


@app.post("/api/v1/accounts/active", response_model=AuthSessionResponse)
def set_active_account(
    request: ActiveAccountRequest,
    db: Session = Depends(get_account_db),
    session_token: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
) -> AuthSessionResponse:
    service, refresh_session, user, _current_membership = _current_session(db, session_token)
    membership = service.get_membership(refresh_session.user_id, request.org_id)
    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this workspace.",
        )
    refresh_session, membership = service.set_active_organization(
        raw_token=session_token or "",
        organization_id=request.org_id,
    )
    return _session_response(service=service, user=user, membership=membership)


@app.patch("/api/v1/account/profile", response_model=AuthSessionResponse)
def update_account_profile(
    request: AccountProfileUpdateRequest,
    db: Session = Depends(get_account_db),
    session_token: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
) -> AuthSessionResponse:
    service, _refresh_session, user, membership = _current_session(db, session_token)
    user = service.update_user_name(user_id=user.id, name=request.name)
    return _session_response(service=service, user=user, membership=membership)


@app.patch("/api/v1/account/workspace", response_model=AuthSessionResponse)
def update_active_workspace(
    request: AccountWorkspaceUpdateRequest,
    db: Session = Depends(get_account_db),
    session_token: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
) -> AuthSessionResponse:
    service, _refresh_session, user, membership = _current_session(db, session_token)
    _require_account_manager(membership)
    service.update_organization_name(
        organization_id=membership.organization_id,
        name=request.name,
    )
    refreshed_membership = service.get_membership(user.id, membership.organization_id)
    if refreshed_membership is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )
    return _session_response(service=service, user=user, membership=refreshed_membership)


@app.get("/api/v1/account/members", response_model=AccountMembersResponse)
def list_account_members(
    db: Session = Depends(get_account_db),
    session_token: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
) -> AccountMembersResponse:
    service, _refresh_session, _user, membership = _current_session(db, session_token)
    _require_account_manager(membership)
    members = [
        _member_response(member)
        for member in service.list_organization_memberships(membership.organization_id)
    ]
    return AccountMembersResponse(members=members)


@app.post(
    "/api/v1/account/invites",
    response_model=AccountInviteResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_account_invite(
    request: AccountInviteRequest,
    db: Session = Depends(get_account_db),
    session_token: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
) -> AccountInviteResponse:
    service, _refresh_session, user, membership = _current_session(db, session_token)
    _require_account_manager(membership)
    role = _membership_role(request.role)
    delivery = service.create_invite_delivery(
        organization_id=membership.organization_id,
        email=request.email,
        invited_by_user_id=user.id,
        role=role,
    )
    return AccountInviteResponse(
        invite_id=delivery.token.id,
        email=delivery.token.email,
        role=(delivery.token.role or MembershipRole.EDITOR).value,
        development_token=delivery.raw_token,
    )


@app.patch("/api/v1/account/members/{membership_id}", response_model=AccountMemberResponse)
def update_account_member_role(
    membership_id: str,
    request: AccountMemberRoleUpdateRequest,
    db: Session = Depends(get_account_db),
    session_token: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
) -> AccountMemberResponse:
    service, _refresh_session, _user, actor_membership = _current_session(db, session_token)
    _require_account_manager(actor_membership)
    target = service.get_membership_by_id(membership_id)
    if target is None or target.organization_id != actor_membership.organization_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found.")

    role = _membership_role(request.role)
    if (
        target.role == MembershipRole.OWNER
        and role != MembershipRole.OWNER
        and service.count_owners(actor_membership.organization_id) <= 1
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The last Owner cannot be demoted.",
        )

    updated = service.update_membership_role(membership_id=target.id, role=role)
    return _member_response(updated)


@app.delete("/api/v1/account/members/{membership_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_account_member(
    membership_id: str,
    db: Session = Depends(get_account_db),
    session_token: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
) -> Response:
    service, _refresh_session, _user, actor_membership = _current_session(db, session_token)
    _require_account_manager(actor_membership)
    target = service.get_membership_by_id(membership_id)
    if target is None or target.organization_id != actor_membership.organization_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found.")
    if (
        target.role == MembershipRole.OWNER
        and service.count_owners(actor_membership.organization_id) <= 1
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The last Owner cannot be removed.",
        )

    service.remove_membership(target.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.post("/api/v1/account/password/change", status_code=status.HTTP_204_NO_CONTENT)
def change_account_password(
    request: AccountPasswordChangeRequest,
    db: Session = Depends(get_account_db),
    session_token: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
) -> Response:
    service, _refresh_session, user, _membership = _current_session(db, session_token)
    try:
        service.change_password(
            user_id=user.id,
            current_password=request.current_password,
            new_password=request.new_password,
        )
    except InvalidCredentialsError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.post(
    "/api/v1/account/password/reset/request",
    response_model=AccountPasswordResetResponse,
)
def request_account_password_reset(
    request: AccountPasswordResetRequest,
    db: Session = Depends(get_account_db),
) -> AccountPasswordResetResponse:
    delivery = AccountService(db).create_password_reset_delivery(email=request.email)
    return AccountPasswordResetResponse(
        email=AccountService.normalize_email(request.email),
        development_token=delivery.raw_token if delivery is not None else None,
    )


@app.post(
    "/api/v1/account/password/reset/confirm",
    status_code=status.HTTP_204_NO_CONTENT,
)
def confirm_account_password_reset(
    request: AccountPasswordResetConfirmRequest,
    db: Session = Depends(get_account_db),
) -> Response:
    try:
        AccountService(db).reset_password(
            raw_token=request.token,
            new_password=request.new_password,
        )
    except UnauthorizedSessionError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.patch(
    "/api/v1/projects/{project_id}/nodes/{node_id}",
    response_model=ScriptNodeState,
)
def save_script_node(
    project_id: str,
    node_id: str,
    request: ScriptNodeSaveRequest,
    actor: ActorContext = Depends(get_actor_context),
) -> ScriptNodeState:
    _require_project_editor(project_id, actor)
    store.bind_project(project_id, actor.organization_id)
    return store.save_node(project_id, node_id, request.input, request.settings)


@app.post(
    "/api/v1/projects/{project_id}/nodes/{node_id}/run",
    response_model=TaskState,
    status_code=status.HTTP_202_ACCEPTED,
)
def run_script_node(
    project_id: str,
    node_id: str,
    actor: ActorContext = Depends(get_actor_context),
) -> TaskState:
    _require_project_editor(project_id, actor)
    node = store.get_node(project_id, node_id)
    if node is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Script node input not found. Save node input before running.",
        )

    try:
        settings = _resolve_script_provider_settings(node.settings)
        provider = get_script_provider(settings)
    except ProviderConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    task = store.create_task(
        project_id=project_id,
        node_id=node_id,
        input_version=node.version,
        provider=settings.provider,
        organization_id=actor.organization_id,
        model=settings.model,
    )
    return run_script_task_sync(store=store, provider=provider, task=task, node=node)


@app.post(
    "/api/v1/projects/{project_id}/nodes/{node_id}/chat",
    response_model=ScriptDialogueResponse,
)
def chat_script_node(
    project_id: str,
    node_id: str,
    request: ScriptDialogueRequest,
    actor: ActorContext = Depends(get_actor_context),
) -> ScriptDialogueResponse:
    _require_project_editor(project_id, actor)
    store.bind_project(project_id, actor.organization_id)
    node = store.save_node(project_id, node_id, request.input, request.settings)
    user_message = ScriptDialogueMessage(
        role=ScriptDialogueRole.USER,
        content=request.message,
    )

    try:
        settings = _resolve_script_provider_settings(node.settings)
        provider = get_script_provider(settings)
        prompt = build_script_dialogue_prompt(
            script_input=node.input,
            history=request.history,
            user_message=request.message,
        )
        assistant_text = provider.chat(
            script_input=node.input,
            history=request.history,
            user_message=request.message,
            prompt=prompt,
        )
    except ProviderConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except ProviderExecutionError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

    assistant_message = ScriptDialogueMessage(
        role=ScriptDialogueRole.ASSISTANT,
        content=assistant_text,
    )
    return ScriptDialogueResponse(
        project_id=project_id,
        node_id=node_id,
        provider=settings.provider,
        model=settings.model,
        message=assistant_message,
        history=[*request.history, user_message, assistant_message],
    )


def _resolve_script_provider_settings(
    node_settings: ScriptSettings,
) -> ScriptProviderSettings:
    env_settings = ScriptProviderSettings.from_env()
    provider = (
        node_settings.provider.strip().lower()
        if node_settings.provider and node_settings.provider.strip()
        else env_settings.provider
    )
    model = (
        node_settings.model.strip()
        if node_settings.model and node_settings.model.strip()
        else env_settings.model
    )

    return ScriptProviderSettings(
        provider=provider,
        base_url=env_settings.base_url,
        api_key=env_settings.api_key,
        model=model,
        temperature=(
            node_settings.temperature
            if node_settings.temperature is not None
            else env_settings.temperature
        ),
        timeout_seconds=env_settings.timeout_seconds,
        max_retries=env_settings.max_retries,
    )


@app.get("/api/v1/tasks/{task_id}", response_model=TaskState)
def get_task(
    task_id: str,
    actor: ActorContext = Depends(get_actor_context),
) -> TaskState:
    task = store.get_task(task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
    _require_task_membership(task_id, actor)
    return task


@app.get("/api/v1/tasks/{task_id}/result", response_model=TaskResult)
def get_task_result(
    task_id: str,
    actor: ActorContext = Depends(get_actor_context),
) -> TaskResult:
    task = store.get_task(task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
    _require_task_membership(task_id, actor)

    result = store.get_result(task_id)
    if task.status == TaskStatus.FAILED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Task failed: {task.error}",
        )
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Task result is not ready. Current status: {task.status.value}.",
        )

    return TaskResult(
        task_id=task.task_id,
        project_id=task.project_id,
        node_id=task.node_id,
        status=task.status,
        error=task.error,
        output=result,
    )
