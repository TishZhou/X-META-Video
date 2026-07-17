from __future__ import annotations

from collections.abc import Callable

from ...providers import ScriptProvider
from ...schemas import (
    ScriptDialogueMessage,
    ScriptDialogueMode,
    ScriptInput,
    ScriptNodeState,
    TaskState,
)
from ...store import InMemoryScriptStore
from ..compiler import PromptCompiler
from ..contracts import TaskId, TaskProfile
from ..retry import run_with_task_retry
from ..validators import validate_output


ProfileResolver = Callable[[TaskId | str], TaskProfile]


class TextNodeExecutor:
    """Executes the Text tasks selected by a user-authored canvas node."""

    def __init__(
        self,
        *,
        profile_resolver: ProfileResolver,
        prompt_compiler: PromptCompiler,
    ) -> None:
        self._profile_resolver = profile_resolver
        self._prompt_compiler = prompt_compiler

    def run_script_task_sync(
        self,
        *,
        store: InMemoryScriptStore,
        provider: ScriptProvider,
        task: TaskState,
        node: ScriptNodeState,
    ) -> TaskState:
        profile = self._profile_resolver(TaskId.TEXT_SCRIPT_GENERATE)
        store.set_task_running(task.task_id)
        try:
            prompt = self._prompt_compiler.compile(
                profile=profile,
                project_id=node.project_id,
                inputs={"script_input": node.input},
            ).text
            result = run_with_task_retry(
                profile=profile,
                operation=lambda: provider.generate(node.input, prompt),
            )
            validate_output(profile.validator_id, result)
        except Exception as exc:
            return store.fail_task(task.task_id, str(exc))

        return store.succeed_task(task.task_id, result)

    def run_script_dialogue(
        self,
        *,
        project_id: str,
        provider: ScriptProvider,
        script_input: ScriptInput,
        history: list[ScriptDialogueMessage],
        user_message: str,
        mode: ScriptDialogueMode,
    ) -> str:
        profile = self._profile_resolver(TaskId.TEXT_SCRIPT_DIALOGUE)
        prompt = self._prompt_compiler.compile(
            profile=profile,
            project_id=project_id,
            inputs={
                "script_input": script_input,
                "history": history,
                "user_message": user_message,
                "mode": mode,
            },
        ).text
        assistant_text = run_with_task_retry(
            profile=profile,
            operation=lambda: provider.chat(
                script_input=script_input,
                history=history,
                user_message=user_message,
                prompt=prompt,
            ),
        )
        validate_output(profile.validator_id, assistant_text)
        return assistant_text
