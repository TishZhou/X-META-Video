from __future__ import annotations

from collections.abc import Callable

from ...providers import ArkSeedanceVideoProviderSettings, VideoGenerationProviderResult
from ...schemas import VideoGenerationRequest, VideoGenerationResponse
from ..compiler import PromptCompiler
from ..contracts import TaskId, TaskProfile
from ..retry import run_with_task_retry
from ..validators import validate_output


VideoExecutor = Callable[..., VideoGenerationProviderResult]
ProfileResolver = Callable[[TaskId | str], TaskProfile]


class VideoNodeExecutor:
    """Executes the Video tasks selected by a user-authored canvas node."""

    def __init__(
        self,
        *,
        profile_resolver: ProfileResolver,
        prompt_compiler: PromptCompiler,
    ) -> None:
        self._profile_resolver = profile_resolver
        self._prompt_compiler = prompt_compiler

    def run_generation(
        self,
        *,
        project_id: str,
        node_id: str,
        request: VideoGenerationRequest,
        settings: ArkSeedanceVideoProviderSettings,
        execute: VideoExecutor,
    ) -> VideoGenerationResponse:
        profile = self._profile_resolver(TaskId.VIDEO_CLIP_GENERATE)
        compiled_prompt = self._prompt_compiler.compile(
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
