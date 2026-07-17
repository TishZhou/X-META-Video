from __future__ import annotations

from collections.abc import Callable

from ...providers import MiniMaxMusicProviderSettings
from ...schemas import GeneratedAudio, MusicGenerationRequest, MusicGenerationResponse
from ..compiler import PromptCompiler
from ..contracts import TaskId, TaskProfile
from ..retry import run_with_task_retry
from ..validators import validate_output


AudioExecutor = Callable[..., GeneratedAudio]
ProfileResolver = Callable[[TaskId | str], TaskProfile]


class AudioNodeExecutor:
    """Executes the Audio tasks selected by a user-authored canvas node."""

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
        request: MusicGenerationRequest,
        settings: MiniMaxMusicProviderSettings,
        execute: AudioExecutor,
    ) -> MusicGenerationResponse:
        profile = self._profile_resolver(TaskId.AUDIO_MUSIC_GENERATE)
        compiled_prompt = self._prompt_compiler.compile(
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
