from __future__ import annotations

from collections.abc import Callable

from ...providers import SeedDreamProviderSettings
from ...schemas import (
    GeneratedImage,
    GeneratedImageOutput,
    ImageGenerationNodeType,
    ImageGenerationInput,
    ImageOutputVariant,
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

_CHARACTER_BASE_PROMPT = (
    "Output variant: character base image. Produce one full-body, front-facing "
    "character reference with a clean, readable silhouette."
)

_CHARACTER_SHEET_PROMPT = """Output variant: character three-view image. Use the supplied base image as the sole visual reference and faithfully reproduce its character identity, facial features, skin tone, hair texture, body type, wardrobe, accessories, and art style.

Create a clean 3:4 character design sheet with no words, labels, captions, or typography. Use a white background with subtle physically plausible shadows and neutral global lighting. Arrange three horizontal rows: first row has full-body standing front, side, and back views at consistent proportions; second row has six close-up facial expressions (joy, sadness, anger, surprise, fear, neutral) with realistic facial-muscle linkage, skin texture, and pore detail; third row has four full-body poses (walking, running, jumping, seated) that keep the exact wardrobe and accessories while showing garment drape, muscle force, and candid realism. Keep a tidy multi-panel composition."""


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
        def generate(
            variant_instruction: str,
            reference: ImageGenerationInput | GeneratedImage,
        ) -> GeneratedImage:
            prompt = "\n\n".join(
                part for part in (compiled_prompt, variant_instruction) if part
            )
            generated_image = run_with_task_retry(
                profile=profile,
                operation=lambda prompt=prompt: execute(
                    settings=settings,
                    prompt=prompt,
                    reference_image_url=reference.reference_image_url
                    if isinstance(reference, ImageGenerationInput)
                    else reference.url,
                    reference_image_b64=reference.reference_image_b64
                    if isinstance(reference, ImageGenerationInput)
                    else reference.b64_json,
                    reference_image_mime_type=reference.reference_image_mime_type
                    if isinstance(reference, ImageGenerationInput)
                    else reference.mime_type,
                ),
            )
            validate_output(profile.validator_id, generated_image)
            return generated_image

        if request.node_type == ImageGenerationNodeType.CHARACTER_IMAGE:
            character_base = generate(_CHARACTER_BASE_PROMPT, request.input)
            character_sheet = generate(_CHARACTER_SHEET_PROMPT, character_base)
            outputs = [
                GeneratedImageOutput(
                    variant=ImageOutputVariant.CHARACTER_BASE,
                    image=character_base,
                ),
                GeneratedImageOutput(
                    variant=ImageOutputVariant.CHARACTER_THREE_VIEW,
                    image=character_sheet,
                ),
            ]
        else:
            image = generate("", request.input)
            outputs = [GeneratedImageOutput(variant=ImageOutputVariant.IMAGE, image=image)]
        assert settings.model is not None
        return ImageGenerationResponse(
            project_id=project_id,
            node_id=node_id,
            node_type=request.node_type,
            provider=settings.provider,
            model=settings.model,
            prompt=request.input.prompt,
            image=outputs[0].image,
            images=outputs,
            persisted=False,
        )
