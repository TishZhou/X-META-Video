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


@dataclass(frozen=True)
class OutboxTokenDelivery:
    raw_token: str
    token: AccountOutboxToken


class AccountService:
    def __init__(self, db: Session) -> None:
        self._db = db

    def register_user(
        self,
        *,
        email: str,
        password: str,
        name: str,
        workspace_name: str | None = None,
    ) -> tuple[User, Organization, Membership]:
        normalized_email = self.normalize_email(email)
        display_name = name.strip()
        existing = self.get_user_by_email(normalized_email)
        if existing is not None:
            raise AccountConflictError("Email is already registered.")

        user = User(
            email=normalized_email,
            name=display_name,
            password_hash=self.hash_password(password),
        )
        organization = Organization(
            name=(workspace_name.strip() if workspace_name else f"{display_name} Workspace")
        )
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

    def list_organization_memberships(self, organization_id: str) -> list[Membership]:
        return list(
            self._db.scalars(
                select(Membership).where(Membership.organization_id == organization_id)
            )
        )

    def get_membership_by_id(self, membership_id: str) -> Membership | None:
        return self._db.get(Membership, membership_id)

    def count_owners(self, organization_id: str) -> int:
        return len(
            list(
                self._db.scalars(
                    select(Membership).where(
                        Membership.organization_id == organization_id,
                        Membership.role == MembershipRole.OWNER,
                    )
                )
            )
        )

    def update_user_name(self, *, user_id: str, name: str) -> User:
        user = self.get_user(user_id)
        if user is None:
            raise UnauthorizedSessionError("Authentication required.")
        user.name = name.strip()
        self._db.commit()
        self._db.refresh(user)
        return user

    def update_organization_name(self, *, organization_id: str, name: str) -> Organization:
        organization = self.get_organization(organization_id)
        if organization is None:
            raise UnauthorizedSessionError("Active organization not found.")
        organization.name = name.strip()
        self._db.commit()
        self._db.refresh(organization)
        return organization

    def update_membership_role(
        self,
        *,
        membership_id: str,
        role: MembershipRole,
    ) -> Membership:
        membership = self.get_membership_by_id(membership_id)
        if membership is None:
            raise UnauthorizedSessionError("Membership not found.")
        membership.role = role
        self._db.commit()
        self._db.refresh(membership)
        return membership

    def remove_membership(self, membership_id: str) -> None:
        membership = self.get_membership_by_id(membership_id)
        if membership is None:
            raise UnauthorizedSessionError("Membership not found.")
        self._db.delete(membership)
        self._db.commit()

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

    def create_invite_delivery(
        self,
        *,
        organization_id: str,
        email: str,
        invited_by_user_id: str,
        role: MembershipRole = MembershipRole.EDITOR,
    ) -> OutboxTokenDelivery:
        return self._create_outbox_token(
            organization_id=organization_id,
            email=email,
            purpose=AccountTokenPurpose.INVITE,
            invited_by_user_id=invited_by_user_id,
            role=role,
        )

    def create_password_reset_delivery(self, *, email: str) -> OutboxTokenDelivery | None:
        normalized_email = self.normalize_email(email)
        user = self.get_user_by_email(normalized_email)
        if user is None:
            return None
        return self._create_outbox_token(
            organization_id=None,
            email=normalized_email,
            purpose=AccountTokenPurpose.PASSWORD_RESET,
            invited_by_user_id=None,
            role=None,
        )

    def change_password(
        self,
        *,
        user_id: str,
        current_password: str,
        new_password: str,
    ) -> None:
        user = self.get_user(user_id)
        if user is None or not self.verify_password(current_password, user.password_hash):
            raise InvalidCredentialsError("Invalid current password.")
        user.password_hash = self.hash_password(new_password)
        self._db.commit()

    def reset_password(self, *, raw_token: str, new_password: str) -> None:
        token = self._db.scalar(
            select(AccountOutboxToken).where(
                AccountOutboxToken.token_hash == self.hash_token(raw_token),
                AccountOutboxToken.purpose == AccountTokenPurpose.PASSWORD_RESET,
            )
        )
        now = datetime.now(UTC)
        if (
            token is None
            or token.consumed_at is not None
            or self._ensure_aware(token.expires_at) <= now
        ):
            raise UnauthorizedSessionError("Invalid or expired password reset token.")

        user = self.get_user_by_email(token.email)
        if user is None:
            raise UnauthorizedSessionError("Invalid or expired password reset token.")
        user.password_hash = self.hash_password(new_password)
        token.consumed_at = now
        self._db.commit()

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

    def _create_outbox_token(
        self,
        *,
        organization_id: str | None,
        email: str,
        purpose: AccountTokenPurpose,
        invited_by_user_id: str | None,
        role: MembershipRole | None,
    ) -> OutboxTokenDelivery:
        raw_token = secrets.token_urlsafe(32)
        token = AccountOutboxToken(
            organization_id=organization_id,
            email=self.normalize_email(email),
            purpose=purpose,
            role=role,
            token_hash=self.hash_token(raw_token),
            invited_by_user_id=invited_by_user_id,
            expires_at=datetime.now(UTC) + OUTBOX_TOKEN_TTL,
        )
        self._db.add(token)
        self._db.commit()
        self._db.refresh(token)
        return OutboxTokenDelivery(raw_token=raw_token, token=token)
