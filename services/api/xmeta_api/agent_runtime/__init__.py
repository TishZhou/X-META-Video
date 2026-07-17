from __future__ import annotations

from ..providers import ScriptProvider
from ..schemas import ScriptNodeState, TaskState
from ..store import InMemoryScriptStore
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
from .prompts import build_script_dialogue_prompt, build_script_prompt
from .registry import (
    TaskProfileNotFoundError,
    TaskProfileRegistry,
    create_default_task_registry,
)
from .retry import run_with_task_retry
from .runtime import AgentRuntime


agent_runtime = AgentRuntime()


def run_script_task_sync(
    *,
    store: InMemoryScriptStore,
    provider: ScriptProvider,
    task: TaskState,
    node: ScriptNodeState,
) -> TaskState:
    return agent_runtime.run_script_task_sync(
        store=store,
        provider=provider,
        task=task,
        node=node,
    )


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
    "build_script_dialogue_prompt",
    "build_script_prompt",
    "create_default_task_registry",
    "run_script_task_sync",
    "run_with_task_retry",
]
