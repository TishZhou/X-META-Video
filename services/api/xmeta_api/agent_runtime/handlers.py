from __future__ import annotations

from collections.abc import Callable

from ..providers import (
    ArkSeedanceVideoProviderSettings,
    MiniMaxMusicProviderSettings,
    ScriptProvider,
    SeedDreamProviderSettings,
    VideoGenerationProviderResult,
)
from ..schemas import (
    GeneratedAudio,
    GeneratedImage,
    ImageGenerationNodeType,
    ImageGenerationRequest,
    ImageGenerationResponse,
    MusicGenerationRequest,
    MusicGenerationResponse,
    ScriptDialogueMessage,
    ScriptDialogueMode,
    ScriptInput,
    ScriptNodeState,
    TaskState,
    VideoGenerationRequest,
    VideoGenerationResponse,
)
from ..store import InMemoryScriptStore
from .compiler import PromptCompiler
from .contracts import TaskId, TaskProfile
from .memory import EmptyProjectMemoryReader, ProjectMemoryReader
from .registry import TaskProfileRegistry, create_default_task_registry
from .retry import run_with_task_retry
from .validators import validate_output


ImageExecutor = Callable[..., GeneratedImage]
AudioExecutor = Callable[..., GeneratedAudio]
VideoExecutor = Callable[..., VideoGenerationProviderResult]


_IMAGE_TASKS = {
    ImageGenerationNodeType.CHARACTER_IMAGE: TaskId.IMAGE_CHARACTER_GENERATE,
    ImageGenerationNodeType.PROP_ASSET: TaskId.IMAGE_PROP_GENERATE,
    ImageGenerationNodeType.SCENE_IMAGE: TaskId.IMAGE_SCENE_GENERATE,
}


class AgentRuntime:
    """Executes one user-selected canvas-node task without changing graph topology."""

    def __init__(
        self,
        *,
        registry: TaskProfileRegistry | None = None,
        memory_reader: ProjectMemoryReader | None = None,
    ) -> None:
        self.registry = registry or create_default_task_registry()
        self.memory_reader = memory_reader or EmptyProjectMemoryReader()
        self.prompt_compiler = PromptCompiler(self.memory_reader)

    def profile(self, task_id: TaskId | str) -> TaskProfile:
        return self.registry.get(task_id)

    def run_script_task_sync(
        self,
        *,
        store: InMemoryScriptStore,
        provider: ScriptProvider,
        task: TaskState,
        node: ScriptNodeState,
    ) -> TaskState:
        profile = self.profile(TaskId.TEXT_SCRIPT_GENERATE)
        store.set_task_running(task.task_id)
        try:
            prompt = self.prompt_compiler.compile(
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
        profile = self.profile(TaskId.TEXT_SCRIPT_DIALOGUE)
        prompt = self.prompt_compiler.compile(
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

    def run_image_generation(
        self,
        *,
        project_id: str,
        node_id: str,
        request: ImageGenerationRequest,
        settings: SeedDreamProviderSettings,
        execute: ImageExecutor,
    ) -> ImageGenerationResponse:
        profile = self.profile(_IMAGE_TASKS[request.node_type])
        compiled_prompt = self.prompt_compiler.compile(
            profile=profile,
            project_id=project_id,
            inputs={"prompt": request.input.prompt},
        ).text
        image = run_with_task_retry(
            profile=profile,
            operation=lambda: execute(
                settings=settings,
                prompt=compiled_prompt,
                reference_image_url=request.input.reference_image_url,
                reference_image_b64=request.input.reference_image_b64,
                reference_image_mime_type=request.input.reference_image_mime_type,
            ),
        )
        validate_output(profile.validator_id, image)
        assert settings.model is not None
        return ImageGenerationResponse(
            project_id=project_id,
            node_id=node_id,
            node_type=request.node_type,
            provider=settings.provider,
            model=settings.model,
            prompt=request.input.prompt,
            image=image,
            persisted=False,
        )

    def run_audio_generation(
        self,
        *,
        project_id: str,
        node_id: str,
        request: MusicGenerationRequest,
        settings: MiniMaxMusicProviderSettings,
        execute: AudioExecutor,
    ) -> MusicGenerationResponse:
        profile = self.profile(TaskId.AUDIO_MUSIC_GENERATE)
        compiled_prompt = self.prompt_compiler.compile(
            profile=profile,
            project_id=project_id,
            inputs={"prompt": request.input.prompt, "lyrics": request.input.lyrics},
        ).text
        audio = run_with_task_retry(
            profile=profile,
            operation=lambda: execute(
                settings=settings,
                prompt=compiled_prompt,
                lyrics=request.input.lyrics,
                reference_audio_url=request.input.reference_audio_url,
                reference_audio_b64=request.input.reference_audio_b64,
            ),
        )
        validate_output(profile.validator_id, audio)
        assert settings.model is not None
        return MusicGenerationResponse(
            project_id=project_id,
            node_id=node_id,
            node_type=request.node_type,
            provider=settings.provider,
            model=settings.model,
            prompt=request.input.prompt,
            lyrics=request.input.lyrics,
            audio=audio,
            persisted=False,
        )

    def run_video_generation(
        self,
        *,
        project_id: str,
        node_id: str,
        request: VideoGenerationRequest,
        settings: ArkSeedanceVideoProviderSettings,
        execute: VideoExecutor,
    ) -> VideoGenerationResponse:
        profile = self.profile(TaskId.VIDEO_CLIP_GENERATE)
        compiled_prompt = self.prompt_compiler.compile(
            profile=profile,
            project_id=project_id,
            inputs={"prompt": request.input.prompt},
        ).text
        result = run_with_task_retry(
            profile=profile,
            operation=lambda: execute(
                settings=settings,
                prompt=compiled_prompt,
                image_urls=request.input.image_urls,
                video_urls=request.input.video_urls,
                audio_urls=request.input.audio_urls,
                duration_seconds=request.input.duration_seconds,
            ),
        )
        validate_output(profile.validator_id, result)
        return VideoGenerationResponse(
            task_id=result.provider_task_id,
            project_id=project_id,
            node_id=node_id,
            node_type=request.node_type,
            provider=settings.provider,
            model=settings.model or "",
            prompt=request.input.prompt,
            image_urls=request.input.image_urls,
            video_urls=request.input.video_urls,
            audio_urls=request.input.audio_urls,
            duration=request.input.duration_seconds,
            duration_seconds=request.input.duration_seconds,
            video=result.video,
            provider_task_id=result.provider_task_id,
            persisted=False,
        )
