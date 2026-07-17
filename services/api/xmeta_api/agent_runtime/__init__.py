from __future__ import annotations

from .compiler import PromptCompiler, TaskInputError
from .contracts import (
    CompiledPrompt,
    MemoryScope,
    NodeKind,
    PromptTemplateId,
    TaskId,
    TaskProfile,
    ValidatorId,
)
from .memory import EmptyProjectMemoryReader, ProjectMemoryReader
from .registry import (
    TaskProfileNotFoundError,
    TaskProfileRegistry,
    create_default_task_registry,
)
from .runtime import AgentRuntime


agent_runtime = AgentRuntime()


__all__ = [
    "AgentRuntime",
    "CompiledPrompt",
    "EmptyProjectMemoryReader",
    "MemoryScope",
    "NodeKind",
    "ProjectMemoryReader",
    "PromptCompiler",
    "PromptTemplateId",
    "TaskId",
    "TaskInputError",
    "TaskProfile",
    "TaskProfileNotFoundError",
    "TaskProfileRegistry",
    "ValidatorId",
    "agent_runtime",
    "create_default_task_registry",
]
