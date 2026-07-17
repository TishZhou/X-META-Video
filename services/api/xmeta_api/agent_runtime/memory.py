from __future__ import annotations

from typing import Mapping, Protocol

from .contracts import MemoryScope, TaskProfile


class ProjectMemoryReader(Protocol):
    """Replaceable read boundary for approved, project-scoped agent memory."""

    def read(
        self,
        *,
        project_id: str,
        scopes: tuple[MemoryScope, ...],
    ) -> Mapping[MemoryScope | str, object]:
        raise NotImplementedError


class EmptyProjectMemoryReader:
    """Truthful MVP reader: durable project memory is not implemented yet."""

    def read(
        self,
        *,
        project_id: str,
        scopes: tuple[MemoryScope, ...],
    ) -> Mapping[MemoryScope, object]:
        del project_id, scopes
        return {}


def read_profile_memory(
    *,
    reader: ProjectMemoryReader,
    project_id: str,
    profile: TaskProfile,
) -> dict[MemoryScope, object]:
    requested_scopes = profile.memory_reads
    loaded = reader.read(project_id=project_id, scopes=requested_scopes)
    selected: dict[MemoryScope, object] = {}
    for scope in requested_scopes:
        if scope in loaded:
            selected[scope] = loaded[scope]
        elif scope.value in loaded:
            selected[scope] = loaded[scope.value]
    return selected
