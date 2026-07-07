from __future__ import annotations

import os
from collections.abc import Generator
from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker


DEFAULT_ACCOUNT_DATABASE_URL = "postgresql+psycopg://xmeta:xmeta@localhost:5432/xmeta_video"


@lru_cache(maxsize=1)
def get_account_engine() -> Engine:
    database_url = os.getenv("DATABASE_URL", DEFAULT_ACCOUNT_DATABASE_URL)
    connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
    return create_engine(database_url, connect_args=connect_args)


def get_session_factory() -> sessionmaker[Session]:
    return sessionmaker(bind=get_account_engine(), autoflush=False, expire_on_commit=False)


def iter_account_db() -> Generator[Session, None, None]:
    SessionLocal = get_session_factory()
    with SessionLocal() as session:
        yield session
