from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
import hashlib
import hmac
import secrets

from sqlalchemy import select
from sqlalchemy.orm import Session

from .account_models import (
    AccountOutboxToken,
    AccountTokenPurpose,
    Membership,
    MembershipRole,
    Organization,
    RefreshSession,
    User,
)


SESSION_TTL = timedelta(days=30)
OUTBOX_TOKEN_TTL = timedelta(days=7)


class AccountConflictError(ValueError):
    pass


class InvalidCredentialsError(ValueError):
    pass


class UnauthorizedSessionError(ValueError):
    pass


@dataclass(frozen=True)
class SessionToken:
    raw_token: str
    session: RefreshSession


class AccountService:
    def __init__(self, db: Session) -> None:
        self._db = db

    def register_user(
        self,
        *,
        email: str,
        password: str,
        name: str,
        workspace_name: str,
    ) -> tuple[User, Organization, Membership]:
        normalized_email = self.normalize_email(email)
        existing = self.get_user_by_email(normalized_email)
        if existing is not None:
            raise AccountConflictError("Email is already registered.")

        user = User(
            email=normalized_email,
            name=name.strip(),
            password_hash=self.hash_password(password),
        )
        organization = Organization(name=workspace_name.strip())
        membership = Membership(
            user=user,
            organization=organization,
            role=MembershipRole.OWNER,
        )
        self._db.add_all([user, organization, membership])
        self._db.commit()
        self._db.refresh(user)
        self._db.refresh(organization)
        self._db.refresh(membership)
        return user, organization, membership

    def authenticate_user(self, *, email: str, password: str) -> tuple[User, Membership]:
        user = self.get_user_by_email(self.normalize_email(email))
        if user is None or not self.verify_password(password, user.password_hash):
            raise InvalidCredentialsError("Invalid email or password.")

        membership = self.get_default_membership(user.id)
        if membership is None:
            raise InvalidCredentialsError("User has no workspace membership.")
        return user, membership

    def create_session(self, *, user_id: str, organization_id: str) -> SessionToken:
        raw_token = secrets.token_urlsafe(32)
        refresh_session = RefreshSession(
            user_id=user_id,
            active_organization_id=organization_id,
            token_hash=self.hash_token(raw_token),
            expires_at=datetime.now(UTC) + SESSION_TTL,
        )
        self._db.add(refresh_session)
        self._db.commit()
        self._db.refresh(refresh_session)
        return SessionToken(raw_token=raw_token, session=refresh_session)

    def get_session(self, raw_token: str | None) -> RefreshSession:
        if not raw_token:
            raise UnauthorizedSessionError("Authentication required.")
        token_hash = self.hash_token(raw_token)
        refresh_session = self._db.scalar(
            select(RefreshSession).where(RefreshSession.token_hash == token_hash)
        )
        if refresh_session is None:
            raise UnauthorizedSessionError("Authentication required.")
        now = datetime.now(UTC)
        expires_at = self._ensure_aware(refresh_session.expires_at)
        if refresh_session.revoked_at is not None or expires_at <= now:
            raise UnauthorizedSessionError("Authentication required.")
        return refresh_session

    def revoke_session(self, raw_token: str | None) -> None:
        if not raw_token:
            return
        refresh_session = self._db.scalar(
            select(RefreshSession).where(RefreshSession.token_hash == self.hash_token(raw_token))
        )
        if refresh_session is None:
            return
        refresh_session.revoked_at = datetime.now(UTC)
        self._db.commit()

    def get_user(self, user_id: str) -> User | None:
        return self._db.get(User, user_id)

    def get_user_by_email(self, email: str) -> User | None:
        return self._db.scalar(select(User).where(User.email == email))

    def get_organization(self, organization_id: str) -> Organization | None:
        return self._db.get(Organization, organization_id)

    def get_default_membership(self, user_id: str) -> Membership | None:
        return self._db.scalars(select(Membership).where(Membership.user_id == user_id)).first()

    def get_membership(self, user_id: str, organization_id: str) -> Membership | None:
        return self._db.scalar(
            select(Membership).where(
                Membership.user_id == user_id,
                Membership.organization_id == organization_id,
            )
        )

    def list_memberships(self, user_id: str) -> list[Membership]:
        return list(self._db.scalars(select(Membership).where(Membership.user_id == user_id)))

    def set_active_organization(
        self,
        *,
        raw_token: str,
        organization_id: str,
    ) -> tuple[RefreshSession, Membership]:
        refresh_session = self.get_session(raw_token)
        membership = self.get_membership(refresh_session.user_id, organization_id)
        if membership is None:
            raise UnauthorizedSessionError("You do not have access to this workspace.")
        refresh_session.active_organization_id = organization_id
        self._db.commit()
        self._db.refresh(refresh_session)
        return refresh_session, membership

    def invite_member(
        self,
        *,
        organization_id: str,
        email: str,
        invited_by_user_id: str,
        role: MembershipRole = MembershipRole.EDITOR,
    ) -> AccountOutboxToken:
        raw_token = secrets.token_urlsafe(32)
        token = AccountOutboxToken(
            organization_id=organization_id,
            email=self.normalize_email(email),
            purpose=AccountTokenPurpose.INVITE,
            role=role,
            token_hash=self.hash_token(raw_token),
            invited_by_user_id=invited_by_user_id,
            expires_at=datetime.now(UTC) + OUTBOX_TOKEN_TTL,
        )
        self._db.add(token)
        self._db.commit()
        self._db.refresh(token)
        return token

    @staticmethod
    def normalize_email(email: str) -> str:
        return email.strip().lower()

    @staticmethod
    def hash_password(password: str) -> str:
        salt = secrets.token_hex(16)
        digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 390000)
        return f"pbkdf2_sha256${salt}${digest.hex()}"

    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        try:
            algorithm, salt, digest = password_hash.split("$", 2)
        except ValueError:
            return False
        if algorithm != "pbkdf2_sha256":
            return False
        candidate = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 390000)
        return hmac.compare_digest(candidate.hex(), digest)

    @staticmethod
    def hash_token(raw_token: str) -> str:
        return hashlib.sha256(raw_token.encode()).hexdigest()

    @staticmethod
    def _ensure_aware(value: datetime) -> datetime:
        if value.tzinfo is None:
            return value.replace(tzinfo=UTC)
        return value
