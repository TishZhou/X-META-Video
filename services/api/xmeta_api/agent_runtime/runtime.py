from __future__ import annotations

from ..providers import (
    ArkSeedanceVideoProviderSettings,
    MiniMaxMusicProviderSettings,
    ScriptProvider,
    SeedDreamProviderSettings,
)
from ..schemas import (
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
from .nodes import (
    AudioExecutor,
    AudioNodeExecutor,
    ImageExecutor,
    ImageNodeExecutor,
    TextNodeExecutor,
    VideoExecutor,
    VideoNodeExecutor,
)
from .registry import TaskProfileRegistry, create_default_task_registry


class AgentRuntime:
    """Unified facade for one user-selected canvas-node task."""

    def __init__(
        self,
        *,
        registry: TaskProfileRegistry | None = None,
        memory_reader: ProjectMemoryReader | None = None,
    ) -> None:
        self.registry = registry or create_default_task_registry()
        self.memory_reader = memory_reader or EmptyProjectMemoryReader()
        self.prompt_compiler = PromptCompiler(self.memory_reader)
        self._text = TextNodeExecutor(
            profile_resolver=self.profile,
            prompt_compiler=self.prompt_compiler,
        )
        self._image = ImageNodeExecutor(
            profile_resolver=self.profile,
            prompt_compiler=self.prompt_compiler,
        )
        self._audio = AudioNodeExecutor(
            profile_resolver=self.profile,
            prompt_compiler=self.prompt_compiler,
        )
        self._video = VideoNodeExecutor(
            profile_resolver=self.profile,
            prompt_compiler=self.prompt_compiler,
        )

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
        return self._text.run_script_task_sync(
            store=store,
            provider=provider,
            task=task,
            node=node,
        )

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
        return self._text.run_script_dialogue(
            project_id=project_id,
            provider=provider,
            script_input=script_input,
            history=history,
            user_message=user_message,
            mode=mode,
        )

    def run_image_generation(
        self,
        *,
        project_id: str,
        node_id: str,
        request: ImageGenerationRequest,
        settings: SeedDreamProviderSettings,
        execute: ImageExecutor,
    ) -> ImageGenerationResponse:
        return self._image.run_generation(
            project_id=project_id,
            node_id=node_id,
            request=request,
            settings=settings,
            execute=execute,
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
        return self._audio.run_generation(
            project_id=project_id,
            node_id=node_id,
            request=request,
            settings=settings,
            execute=execute,
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
        return self._video.run_generation(
            project_id=project_id,
            node_id=node_id,
            request=request,
            settings=settings,
            execute=execute,
        )
