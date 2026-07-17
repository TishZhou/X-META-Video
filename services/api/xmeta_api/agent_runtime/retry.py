from __future__ import annotations

from collections.abc import Callable
from typing import TypeVar

from .contracts import TaskProfile


ResultT = TypeVar("ResultT")


def run_with_task_retry(
    *,
    profile: TaskProfile,
    operation: Callable[[], ResultT],
) -> ResultT:
    """Run once plus the bounded Runtime retries declared by the task profile."""

    attempts = 0
    while True:
        try:
            return operation()
        except Exception:
            if attempts >= profile.retry_limit:
                raise
            attempts += 1
