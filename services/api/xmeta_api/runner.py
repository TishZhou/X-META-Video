from __future__ import annotations

from .prompt import build_script_prompt
from .providers import ScriptProvider
from .schemas import ScriptNodeState, TaskState
from .store import InMemoryScriptStore


def run_script_task_sync(
    *,
    store: InMemoryScriptStore,
    provider: ScriptProvider,
    task: TaskState,
    node: ScriptNodeState,
) -> TaskState:
    store.set_task_running(task.task_id)
    try:
        prompt = build_script_prompt(node.input)
        result = provider.generate(node.input, prompt)
    except Exception as exc:
        return store.fail_task(task.task_id, str(exc))

    return store.succeed_task(task.task_id, result)

