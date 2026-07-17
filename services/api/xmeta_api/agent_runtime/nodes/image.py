from __future__ import annotations

from collections.abc import Callable

from ...providers import SeedDreamProviderSettings
from ...schemas import (
    GeneratedImage,
    ImageGenerationNodeType,
    ImageGenerationRequest,
    ImageGenerationResponse,
)
from ..compiler import PromptCompiler
from ..contracts import TaskId, TaskProfile
from ..retry import run_with_task_retry
from ..validators import validate_output


ImageExecutor = Callable[..., GeneratedImage]
ProfileResolver = Callable[[TaskId | str], TaskProfile]

_IMAGE_TASKS = {
    ImageGenerationNodeType.CHARACTER_IMAGE: TaskId.IMAGE_CHARACTER_GENERATE,
    ImageGenerationNodeType.PROP_ASSET: TaskId.IMAGE_PROP_GENERATE,
    ImageGenerationNodeType.SCENE_IMAGE: TaskId.IMAGE_SCENE_GENERATE,
}


class ImageNodeExecutor:
    """Executes the Image tasks selected by a user-authored canvas node."""

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
        request: ImageGenerationRequest,
        settings: SeedDreamProviderSettings,
        execute: ImageExecutor,
    ) -> ImageGenerationResponse:
        profile = self._profile_resolver(_IMAGE_TASKS[request.node_type])
        compiled_prompt = self._prompt_compiler.compile(
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
