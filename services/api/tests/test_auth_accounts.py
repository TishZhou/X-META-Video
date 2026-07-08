from __future__ import annotations

from collections.abc import Generator
from pathlib import Path

from alembic import command
from alembic.config import Config
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from xmeta_api.account_models import AccountBase, Membership, MembershipRole, Organization
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


def test_register_creates_owner_workspace_and_http_only_session_cookie(
    client: TestClient,
) -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "creator@example.com",
            "password": "correct horse battery staple",
            "name": "Creator One",
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["user"]["email"] == "creator@example.com"
    assert body["active_organization"]["name"] == "Creator One Workspace"
    assert body["active_organization"]["role"] == "owner"
    assert "access_token" not in body
    assert "refresh_token" not in body
    assert "xmeta_session=" in response.headers["set-cookie"]
    assert "httponly" in response.headers["set-cookie"].lower()

    accounts_response = client.get("/api/v1/accounts")

    assert accounts_response.status_code == 200
    assert accounts_response.json() == {
        "organizations": [
            {
                "org_id": body["active_organization"]["org_id"],
                "name": "Creator One Workspace",
                "role": "owner",
            }
        ]
    }


def test_register_rejects_duplicate_email(client: TestClient) -> None:
    payload = {
        "email": "creator@example.com",
        "password": "correct horse battery staple",
        "name": "Creator One",
    }
    assert client.post("/api/v1/auth/register", json=payload).status_code == 201

    response = client.post("/api/v1/auth/register", json=payload)

    assert response.status_code == 409
    assert response.json()["detail"] == "Email is already registered."


def test_login_me_and_logout_session_flow(client: TestClient) -> None:
    register = client.post(
        "/api/v1/auth/register",
        json={
            "email": "creator@example.com",
            "password": "correct horse battery staple",
            "name": "Creator One",
        },
    )
    assert register.status_code == 201
    client.post("/api/v1/auth/logout")

    login = client.post(
        "/api/v1/auth/login",
        json={
            "email": "creator@example.com",
            "password": "correct horse battery staple",
        },
    )

    assert login.status_code == 200
    me = client.get("/api/v1/auth/me")
    assert me.status_code == 200
    assert me.json()["user"]["email"] == "creator@example.com"
    assert me.json()["active_organization"]["role"] == "owner"

    logout = client.post("/api/v1/auth/logout")
    assert logout.status_code == 204
    assert client.get("/api/v1/auth/me").status_code == 401


def test_refresh_rotates_session_cookie_and_revokes_old_cookie(client: TestClient) -> None:
    register = client.post(
        "/api/v1/auth/register",
        json={
            "email": "creator@example.com",
            "password": "correct horse battery staple",
            "name": "Creator One",
        },
    )
    assert register.status_code == 201
    old_cookie = client.cookies.get("xmeta_session")
    assert old_cookie is not None

    refresh = client.post("/api/v1/auth/refresh")

    assert refresh.status_code == 200
    new_cookie = client.cookies.get("xmeta_session")
    assert new_cookie is not None
    assert new_cookie != old_cookie
    assert "access_token" not in refresh.json()
    assert "refresh_token" not in refresh.json()

    old_session_client = TestClient(app)
    old_session_client.cookies.set("xmeta_session", old_cookie)
    me_with_old_cookie = old_session_client.get("/api/v1/auth/me")

    assert me_with_old_cookie.status_code == 401


def test_active_workspace_selection_validates_membership(
    client: TestClient,
    db_session: Session,
) -> None:
    register = client.post(
        "/api/v1/auth/register",
        json={
            "email": "creator@example.com",
            "password": "correct horse battery staple",
            "name": "Creator One",
        },
    )
    assert register.status_code == 201
    user_id = register.json()["user"]["user_id"]

    second_workspace = Organization(name="Second Workspace")
    inaccessible_workspace = Organization(name="Inaccessible Workspace")
    second_membership = Membership(
        user_id=user_id,
        organization=second_workspace,
        role=MembershipRole.EDITOR,
    )
    db_session.add_all([second_workspace, inaccessible_workspace, second_membership])
    db_session.commit()
    db_session.refresh(second_workspace)
    db_session.refresh(inaccessible_workspace)

    unauthenticated = TestClient(app).post(
        "/api/v1/accounts/active",
        json={"org_id": second_workspace.id},
    )
    inaccessible = client.post(
        "/api/v1/accounts/active",
        json={"org_id": inaccessible_workspace.id},
    )
    selected = client.post(
        "/api/v1/accounts/active",
        json={"org_id": second_workspace.id},
    )

    assert unauthenticated.status_code == 401
    assert inaccessible.status_code == 403
    assert selected.status_code == 200
    assert selected.json()["active_organization"] == {
        "org_id": second_workspace.id,
        "name": "Second Workspace",
        "role": "editor",
    }
    assert client.get("/api/v1/auth/me").json()["active_organization"]["org_id"] == second_workspace.id


def test_login_rejects_wrong_password(client: TestClient) -> None:
    assert (
        client.post(
            "/api/v1/auth/register",
            json={
                "email": "creator@example.com",
                "password": "correct horse battery staple",
                "name": "Creator One",
            },
        ).status_code
        == 201
    )

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "creator@example.com", "password": "wrong password"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password."


def test_account_service_hashes_password_and_defaults_invites_to_editor(
    db_session: Session,
) -> None:
    service = AccountService(db_session)

    user, organization, membership = service.register_user(
        email="owner@example.com",
        password="correct horse battery staple",
        name="Owner",
        workspace_name="Owner Workspace",
    )
    invited = service.invite_member(
        organization_id=organization.id,
        email="teammate@example.com",
        invited_by_user_id=user.id,
    )

    assert user.password_hash != "correct horse battery staple"
    assert service.verify_password("correct horse battery staple", user.password_hash)
    assert membership.role is MembershipRole.OWNER
    assert invited.role is MembershipRole.EDITOR


def test_alembic_upgrade_creates_account_tables_with_lowercase_role_values(
    tmp_path: Path,
) -> None:
    api_root = Path(__file__).resolve().parents[1]
    database_path = tmp_path / "account_migration.sqlite3"
    database_url = f"sqlite:///{database_path.as_posix()}"
    config = Config(str(api_root / "alembic.ini"))
    config.set_main_option("script_location", str(api_root / "alembic"))
    config.set_main_option("sqlalchemy.url", database_url)

    command.upgrade(config, "head")

    engine = create_engine(database_url)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    with SessionLocal() as session:
        service = AccountService(session)
        user, organization, membership = service.register_user(
            email="owner@example.com",
            password="correct horse battery staple",
            name="Owner",
            workspace_name="Owner Workspace",
        )
        outbox = service.invite_member(
            organization_id=organization.id,
            email="teammate@example.com",
            invited_by_user_id=user.id,
        )

        membership_role = session.execute(
            text("select role from memberships where id = :id"),
            {"id": membership.id},
        ).scalar_one()
        token_row = session.execute(
            text("select purpose, role from account_outbox_tokens where id = :id"),
            {"id": outbox.id},
        ).one()

    assert membership_role == "owner"
    assert token_row == ("invite", "editor")
