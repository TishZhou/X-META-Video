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
from xmeta_api.providers import _load_dotenv_values
from xmeta_api.store import store


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
def client(db_session: Session, monkeypatch: pytest.MonkeyPatch) -> Generator[TestClient, None, None]:
    store.reset()
    monkeypatch.setenv("X_META_DISABLE_DOTENV", "1")
    _load_dotenv_values.cache_clear()

    def override_db() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[get_account_db] = override_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    _load_dotenv_values.cache_clear()


def script_payload() -> dict[str, object]:
    return {
        "input": {
            "world_description": (
                "A sweet summer MV world with two girls, a desert jeep, and a neon stage."
            )
        },
        "settings": {"provider": "mock"},
    }


def register_owner(
    client: TestClient,
    *,
    email: str = "owner@example.com",
) -> dict[str, object]:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "correct horse battery staple",
            "name": "Owner",
        },
    )
    assert response.status_code == 201
    return response.json()


def save_script_node(
    client: TestClient,
    *,
    project_id: str = "project-1",
    node_id: str = "script-1",
) -> dict[str, object]:
    response = client.patch(
        f"/api/v1/projects/{project_id}/nodes/{node_id}",
        json=script_payload(),
    )
    assert response.status_code == 200
    return response.json()


def run_script_node(
    client: TestClient,
    *,
    project_id: str = "project-1",
    node_id: str = "script-1",
) -> dict[str, object]:
    response = client.post(f"/api/v1/projects/{project_id}/nodes/{node_id}/run")
    assert response.status_code == 202
    return response.json()


def client_for_member(
    db_session: Session,
    *,
    organization_id: str,
    role: MembershipRole,
    email: str,
) -> TestClient:
    service = AccountService(db_session)
    user = User(
        email=service.normalize_email(email),
        name=email.split("@", 1)[0],
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
    session_token = service.create_session(user_id=user.id, organization_id=organization_id)

    member_client = TestClient(app)
    member_client.cookies.set("xmeta_session", session_token.raw_token)
    return member_client


def test_script_and_task_routes_require_authentication(client: TestClient) -> None:
    register_owner(client)
    save_script_node(client)
    task = run_script_node(client)

    unauthenticated = TestClient(app)

    assert (
        unauthenticated.patch(
            "/api/v1/projects/project-1/nodes/script-1",
            json=script_payload(),
        ).status_code
        == 401
    )
    assert (
        unauthenticated.post(
            "/api/v1/projects/project-1/nodes/script-1/chat",
            json=script_payload() | {"message": "Make it brighter."},
        ).status_code
        == 401
    )
    assert unauthenticated.post("/api/v1/projects/project-1/nodes/script-1/run").status_code == 401
    assert unauthenticated.get(f"/api/v1/tasks/{task['task_id']}").status_code == 401
    assert unauthenticated.get(f"/api/v1/tasks/{task['task_id']}/result").status_code == 401


def test_editor_role_can_save_chat_run_and_read_tasks(client: TestClient) -> None:
    register_owner(client)

    saved = save_script_node(client)
    chat = client.post(
        "/api/v1/projects/project-1/nodes/script-1/chat",
        json=script_payload() | {"message": "Make the two leads argue before the chorus."},
    )
    task = run_script_node(client)
    task_lookup = client.get(f"/api/v1/tasks/{task['task_id']}")
    result_lookup = client.get(f"/api/v1/tasks/{task['task_id']}/result")

    assert saved["version"] == 1
    assert chat.status_code == 200
    assert task_lookup.status_code == 200
    assert result_lookup.status_code == 200


@pytest.mark.parametrize("role", [MembershipRole.ADMIN, MembershipRole.EDITOR])
def test_admin_and_editor_members_can_write_and_generate(
    client: TestClient,
    db_session: Session,
    role: MembershipRole,
) -> None:
    owner = register_owner(client)
    organization_id = owner["active_organization"]["org_id"]
    member = client_for_member(
        db_session,
        organization_id=organization_id,
        role=role,
        email=f"{role.value}@example.com",
    )
    project_id = f"project-{role.value}"

    save = member.patch(
        f"/api/v1/projects/{project_id}/nodes/script-1",
        json=script_payload(),
    )
    chat = member.post(
        f"/api/v1/projects/{project_id}/nodes/script-1/chat",
        json=script_payload() | {"message": "Make the chorus brighter."},
    )
    run = member.post(f"/api/v1/projects/{project_id}/nodes/script-1/run")

    assert save.status_code == 200
    assert chat.status_code == 200
    assert run.status_code == 202


def test_viewer_can_read_same_workspace_task_but_cannot_write_or_generate(
    client: TestClient,
    db_session: Session,
) -> None:
    owner = register_owner(client)
    organization_id = owner["active_organization"]["org_id"]
    save_script_node(client)
    task = run_script_node(client)
    viewer = client_for_member(
        db_session,
        organization_id=organization_id,
        role=MembershipRole.VIEWER,
        email="viewer@example.com",
    )

    assert viewer.get(f"/api/v1/tasks/{task['task_id']}").status_code == 200
    assert viewer.get(f"/api/v1/tasks/{task['task_id']}/result").status_code == 200
    assert (
        viewer.patch(
            "/api/v1/projects/project-1/nodes/script-1",
            json=script_payload(),
        ).status_code
        == 403
    )
    assert (
        viewer.post(
            "/api/v1/projects/project-1/nodes/script-1/chat",
            json=script_payload() | {"message": "Try another hook."},
        ).status_code
        == 403
    )
    assert viewer.post("/api/v1/projects/project-1/nodes/script-1/run").status_code == 403


def test_other_workspace_cannot_access_bound_project_or_task(
    client: TestClient,
) -> None:
    register_owner(client, email="owner@example.com")
    save_script_node(client)
    task = run_script_node(client)
    outsider = TestClient(app)
    register_owner(
        outsider,
        email="outsider@example.com",
    )

    assert outsider.get(f"/api/v1/tasks/{task['task_id']}").status_code == 403
    assert outsider.get(f"/api/v1/tasks/{task['task_id']}/result").status_code == 403
    assert (
        outsider.patch(
            "/api/v1/projects/project-1/nodes/script-1",
            json=script_payload(),
        ).status_code
        == 403
    )
    assert outsider.post("/api/v1/projects/project-1/nodes/script-1/run").status_code == 403
