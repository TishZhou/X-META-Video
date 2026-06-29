from __future__ import annotations

from datetime import UTC, datetime
from threading import Lock
from uuid import uuid4

from .schemas import ScriptInput, ScriptNodeState, ScriptOutput, ScriptSettings, TaskState, TaskStatus


class InMemoryScriptStore:
    """Process-local storage for the Feature 3 backend MVP."""

    def __init__(self) -> None:
        self._lock = Lock()
        self._nodes: dict[tuple[str, str], ScriptNodeState] = {}
        self._tasks: dict[str, TaskState] = {}
        self._results: dict[str, ScriptOutput] = {}

    def reset(self) -> None:
        with self._lock:
            self._nodes.clear()
            self._tasks.clear()
            self._results.clear()

    def save_node(
        self,
        project_id: str,
        node_id: str,
        script_input: ScriptInput,
        settings: ScriptSettings,
    ) -> ScriptNodeState:
        with self._lock:
            key = (project_id, node_id)
            previous = self._nodes.get(key)
            version = 1 if previous is None else previous.version + 1
            node = ScriptNodeState(
                project_id=project_id,
                node_id=node_id,
                version=version,
                input=script_input,
                settings=settings,
                output=previous.output if previous else None,
                updated_at=datetime.now(UTC),
            )
            self._nodes[key] = node
            return node

    def get_node(self, project_id: str, node_id: str) -> ScriptNodeState | None:
        with self._lock:
            return self._nodes.get((project_id, node_id))

    def create_task(
        self,
        *,
        project_id: str,
        node_id: str,
        input_version: int,
        provider: str,
    ) -> TaskState:
        with self._lock:
            now = datetime.now(UTC)
            task = TaskState(
                task_id=str(uuid4()),
                project_id=project_id,
                node_id=node_id,
                status=TaskStatus.QUEUED,
                input_version=input_version,
                provider=provider,
                created_at=now,
                updated_at=now,
            )
            self._tasks[task.task_id] = task
            return task

    def set_task_running(self, task_id: str) -> TaskState:
        with self._lock:
            task = self._tasks[task_id].model_copy(
                update={"status": TaskStatus.RUNNING, "updated_at": datetime.now(UTC)}
            )
            self._tasks[task_id] = task
            return task

    def succeed_task(self, task_id: str, result: ScriptOutput) -> TaskState:
        with self._lock:
            current = self._tasks[task_id]
            task = current.model_copy(
                update={"status": TaskStatus.SUCCEEDED, "updated_at": datetime.now(UTC)}
            )
            self._tasks[task_id] = task
            self._results[task_id] = result
            node = self._nodes.get((task.project_id, task.node_id))
            if node:
                self._nodes[(task.project_id, task.node_id)] = node.model_copy(
                    update={"output": result, "updated_at": datetime.now(UTC)}
                )
            return task

    def fail_task(self, task_id: str, message: str) -> TaskState:
        with self._lock:
            task = self._tasks[task_id].model_copy(
                update={
                    "status": TaskStatus.FAILED,
                    "updated_at": datetime.now(UTC),
                    "error": message,
                }
            )
            self._tasks[task_id] = task
            return task

    def get_task(self, task_id: str) -> TaskState | None:
        with self._lock:
            return self._tasks.get(task_id)

    def get_result(self, task_id: str) -> ScriptOutput | None:
        with self._lock:
            return self._results.get(task_id)


store = InMemoryScriptStore()
