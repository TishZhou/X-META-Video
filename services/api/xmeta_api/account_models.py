from __future__ import annotations

from datetime import UTC, datetime
from enum import StrEnum
from uuid import uuid4

from sqlalchemy import DateTime, Enum, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid4().hex}"


class AccountBase(DeclarativeBase):
    pass


class MembershipRole(StrEnum):
    OWNER = "owner"
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"


class AccountTokenPurpose(StrEnum):
    INVITE = "invite"
    EMAIL_VERIFICATION = "email_verification"
    PASSWORD_RESET = "password_reset"


def enum_values(enum_class: type[StrEnum]) -> list[str]:
    return [member.value for member in enum_class]


class User(AccountBase):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: new_id("user"))
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(160))
    password_hash: Mapped[str] = mapped_column(String(256))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

    memberships: Mapped[list[Membership]] = relationship(back_populates="user")
    sessions: Mapped[list[RefreshSession]] = relationship(back_populates="user")


class Organization(AccountBase):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: new_id("org"))
    name: Mapped[str] = mapped_column(String(160))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

    memberships: Mapped[list[Membership]] = relationship(back_populates="organization")


class Membership(AccountBase):
    __tablename__ = "memberships"
    __table_args__ = (UniqueConstraint("user_id", "organization_id"),)

    id: Mapped[str] = mapped_column(
        String(64),
        primary_key=True,
        default=lambda: new_id("membership"),
    )
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), index=True)
    role: Mapped[MembershipRole] = mapped_column(
        Enum(MembershipRole, native_enum=False, values_callable=enum_values),
        default=MembershipRole.EDITOR,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )

    user: Mapped[User] = relationship(back_populates="memberships")
    organization: Mapped[Organization] = relationship(back_populates="memberships")


class RefreshSession(AccountBase):
    __tablename__ = "refresh_sessions"

    id: Mapped[str] = mapped_column(
        String(64),
        primary_key=True,
        default=lambda: new_id("session"),
    )
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    active_organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"))
    token_hash: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )

    user: Mapped[User] = relationship(back_populates="sessions")
    active_organization: Mapped[Organization] = relationship()


class AccountOutboxToken(AccountBase):
    __tablename__ = "account_outbox_tokens"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: new_id("token"))
    organization_id: Mapped[str | None] = mapped_column(ForeignKey("organizations.id"))
    email: Mapped[str] = mapped_column(String(320), index=True)
    purpose: Mapped[AccountTokenPurpose] = mapped_column(
        Enum(AccountTokenPurpose, native_enum=False, values_callable=enum_values)
    )
    role: Mapped[MembershipRole | None] = mapped_column(
        Enum(MembershipRole, native_enum=False, values_callable=enum_values),
        default=None,
    )
    token_hash: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    invited_by_user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    consumed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
