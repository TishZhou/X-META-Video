from __future__ import annotations

from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from xmeta_api.account_models import AccountBase, Membership, MembershipRole, User
from xmeta_api.account_service import AccountService
from xmeta_api.main import app, get_account_db


@pytest.fixture()
def db_session() -> Generator[Session, None, None]:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    AccountBase.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    with SessionLocal() as session:
        yield session


@pytest.fixture()
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def override_db() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[get_account_db] = override_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def register_owner(client: TestClient) -> dict:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "owner@example.com",
            "password": "correct horse battery staple",
            "name": "Owner One",
        },
    )
    assert response.status_code == 201
    return response.json()


def create_member_client(
    *,
    db_session: Session,
    organization_id: str,
    role: MembershipRole,
    email: str = "member@example.com",
) -> TestClient:
    service = AccountService(db_session)
    user = User(
        email=email,
        name="Member",
        password_hash=service.hash_password("correct horse battery staple"),
    )
    membership = Membership(
        user=user,
        organization_id=organization_id,
        role=role,
    )
    db_session.add_all([user, membership])
    db_session.commit()
    db_session.refresh(user)
    db_session.refresh(membership)

    session_token = service.create_session(
        user_id=user.id,
        organization_id=organization_id,
    )
    member_client = TestClient(app)
    member_client.cookies.set("xmeta_session", session_token.raw_token)
    return member_client


def test_profile_and_workspace_settings_are_backend_backed(
    client: TestClient,
    db_session: Session,
) -> None:
    owner = register_owner(client)
    organization_id = owner["active_organization"]["org_id"]
    editor_client = create_member_client(
        db_session=db_session,
        organization_id=organization_id,
        role=MembershipRole.EDITOR,
    )

    profile = client.patch("/api/v1/account/profile", json={"name": "Updated Owner"})
    workspace = client.patch(
        "/api/v1/account/workspace",
        json={"name": "Updated Studio"},
    )
    editor_workspace = editor_client.patch(
        "/api/v1/account/workspace",
        json={"name": "Editor Rename"},
    )

    assert profile.status_code == 200
    assert profile.json()["user"]["name"] == "Updated Owner"
    assert workspace.status_code == 200
    assert workspace.json()["active_organization"]["name"] == "Updated Studio"
    assert editor_workspace.status_code == 403


def test_owner_can_invite_list_update_and_remove_members(
    client: TestClient,
    db_session: Session,
) -> None:
    owner = register_owner(client)
    organization_id = owner["active_organization"]["org_id"]
    member_client = create_member_client(
        db_session=db_session,
        organization_id=organization_id,
        role=MembershipRole.EDITOR,
        email="teammate@example.com",
    )
    assert member_client.get("/api/v1/auth/me").status_code == 200

    members = client.get("/api/v1/account/members")
    teammate = next(
        item for item in members.json()["members"] if item["email"] == "teammate@example.com"
    )
    invite = client.post(
        "/api/v1/account/invites",
        json={"email": "new-member@example.com"},
    )
    role_update = client.patch(
        f"/api/v1/account/members/{teammate['membership_id']}",
        json={"role": "viewer"},
    )
    remove = client.delete(f"/api/v1/account/members/{teammate['membership_id']}")
    members_after_remove = client.get("/api/v1/account/members")

    assert members.status_code == 200
    assert invite.status_code == 201
    assert invite.json()["email"] == "new-member@example.com"
    assert invite.json()["role"] == "editor"
    assert invite.json()["development_token"]
    assert role_update.status_code == 200
    assert role_update.json()["role"] == "viewer"
    assert remove.status_code == 204
    assert "teammate@example.com" not in {
        item["email"] for item in members_after_remove.json()["members"]
    }


def test_editor_cannot_manage_members(client: TestClient, db_session: Session) -> None:
    owner = register_owner(client)
    organization_id = owner["active_organization"]["org_id"]
    editor_client = create_member_client(
        db_session=db_session,
        organization_id=organization_id,
        role=MembershipRole.EDITOR,
    )

    invite = editor_client.post(
        "/api/v1/account/invites",
        json={"email": "blocked@example.com"},
    )
    members = editor_client.get("/api/v1/account/members")

    assert invite.status_code == 403
    assert members.status_code == 403


def test_last_owner_cannot_be_demoted_or_removed(client: TestClient) -> None:
    owner = register_owner(client)
    members = client.get("/api/v1/account/members")
    owner_member = next(
        item for item in members.json()["members"] if item["email"] == owner["user"]["email"]
    )

    demote = client.patch(
        f"/api/v1/account/members/{owner_member['membership_id']}",
        json={"role": "admin"},
    )
    remove = client.delete(f"/api/v1/account/members/{owner_member['membership_id']}")

    assert demote.status_code == 409
    assert remove.status_code == 409


def test_password_change_and_development_reset_flow(client: TestClient) -> None:
    register_owner(client)

    wrong_current = client.post(
        "/api/v1/account/password/change",
        json={
            "current_password": "wrong password",
            "new_password": "new correct horse battery staple",
        },
    )
    changed = client.post(
        "/api/v1/account/password/change",
        json={
            "current_password": "correct horse battery staple",
            "new_password": "new correct horse battery staple",
        },
    )
    client.post("/api/v1/auth/logout")
    old_login = client.post(
        "/api/v1/auth/login",
        json={
            "email": "owner@example.com",
            "password": "correct horse battery staple",
        },
    )
    new_login = client.post(
        "/api/v1/auth/login",
        json={
            "email": "owner@example.com",
            "password": "new correct horse battery staple",
        },
    )
    reset = client.post(
        "/api/v1/account/password/reset/request",
        json={"email": "owner@example.com"},
    )
    reset_token = reset.json()["development_token"]
    client.post("/api/v1/auth/logout")
    confirmed = client.post(
        "/api/v1/account/password/reset/confirm",
        json={
            "token": reset_token,
            "new_password": "reset correct horse battery staple",
        },
    )
    reset_login = client.post(
        "/api/v1/auth/login",
        json={
            "email": "owner@example.com",
            "password": "reset correct horse battery staple",
        },
    )

    assert wrong_current.status_code == 401
    assert changed.status_code == 204
    assert old_login.status_code == 401
    assert new_login.status_code == 200
    assert reset.status_code == 200
    assert confirmed.status_code == 204
    assert reset_login.status_code == 200
