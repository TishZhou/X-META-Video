from __future__ import annotations

from collections.abc import Callable

from ...providers import ScriptProvider
from ...schemas import (
    ScriptDialogueMessage,
    ScriptDialogueMode,
    ScriptInput,
    ScriptNodeState,
    TaskState,
    TextDataType,
    TextGenerationMetadata,
    TextGenerationRequest,
    TextGenerationResponse,
    TextGenerationTask,
)
from ...store import InMemoryScriptStore
from ..compiler import PromptCompiler
from ..contracts import TaskId, TaskProfile
from ..retry import run_with_task_retry
from ..validators import validate_output


ProfileResolver = Callable[[TaskId | str], TaskProfile]

TEXT_GENERATION_PROFILES = {
    TextGenerationTask.IP_WORLDVIEW: TaskId.TEXT_IP_WORLDVIEW_GENERATE,
    TextGenerationTask.CHARACTER_PROFILES: TaskId.TEXT_CHARACTER_PROFILES_GENERATE,
}

TEXT_GENERATION_DATA_TYPES = {
    TextGenerationTask.IP_WORLDVIEW: TextDataType.SCRIPT,
    TextGenerationTask.CHARACTER_PROFILES: TextDataType.CHARACTER,
}


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

    def run_text_generation(
        self,
        *,
        project_id: str,
        node_id: str,
        provider: ScriptProvider,
        provider_name: str,
        model: str | None,
        request: TextGenerationRequest,
    ) -> TextGenerationResponse:
        profile = self._profile_resolver(TEXT_GENERATION_PROFILES[request.task])
        prompt = self._prompt_compiler.compile(
            profile=profile,
            project_id=project_id,
            inputs={"content": request.input.content},
        ).text
        content = run_with_task_retry(
            profile=profile,
            operation=lambda: provider.chat(
                script_input=ScriptInput(world_description=request.input.content),
                history=[],
                user_message=request.input.content,
                prompt=prompt,
            ),
        )
        validate_output(profile.validator_id, content)
        return TextGenerationResponse(
            project_id=project_id,
            node_id=node_id,
            provider=provider_name,
            model=model,
            content=content.strip(),
            metadata=TextGenerationMetadata(
                task=request.task,
                data_type=TEXT_GENERATION_DATA_TYPES[request.task],
                input_source=request.input.source,
                prompt_template_id=profile.prompt_template_id.value,
            ),
            persisted=False,
        )
