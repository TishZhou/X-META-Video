from __future__ import annotations

from collections.abc import Iterable

from .contracts import TaskId, TaskProfile
from .profiles import DEFAULT_TASK_PROFILES


class TaskProfileNotFoundError(LookupError):
    pass


class TaskProfileRegistry:
    def __init__(self, profiles: Iterable[TaskProfile] = ()) -> None:
        self._profiles: dict[TaskId, TaskProfile] = {}
        for profile in profiles:
            self.register(profile)

    def register(self, profile: TaskProfile) -> None:
        if profile.task_id in self._profiles:
            raise ValueError(f"Task profile '{profile.task_id}' is already registered.")
        self._profiles[profile.task_id] = profile

    def get(self, task_id: TaskId | str) -> TaskProfile:
        try:
            normalized = TaskId(task_id)
        except ValueError as exc:
            raise TaskProfileNotFoundError(f"Unknown agent task '{task_id}'.") from exc
        try:
            return self._profiles[normalized]
        except KeyError as exc:
            raise TaskProfileNotFoundError(f"Unknown agent task '{task_id}'.") from exc

    def all(self) -> tuple[TaskProfile, ...]:
        return tuple(self._profiles.values())


def create_default_task_registry() -> TaskProfileRegistry:
    return TaskProfileRegistry(DEFAULT_TASK_PROFILES)
