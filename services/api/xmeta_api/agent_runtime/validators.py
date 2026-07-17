from __future__ import annotations

from ..providers import VideoGenerationProviderResult
from ..schemas import GeneratedAudio, GeneratedImage, ScriptOutput
from .contracts import ValidatorId


class RuntimeOutputValidationError(ValueError):
    pass


def validate_output(validator_id: ValidatorId, output: object) -> None:
    if validator_id == ValidatorId.SCRIPT_OUTPUT:
        if not isinstance(output, ScriptOutput):
            raise RuntimeOutputValidationError("Script task must return ScriptOutput.")
        return

    if validator_id == ValidatorId.NON_EMPTY_TEXT:
        if not isinstance(output, str) or not output.strip():
            raise RuntimeOutputValidationError("Text task must return non-empty text.")
        return

    if validator_id == ValidatorId.GENERATED_IMAGE:
        if not isinstance(output, GeneratedImage) or not (output.url or output.b64_json):
            raise RuntimeOutputValidationError("Image task did not return an image.")
        return

    if validator_id == ValidatorId.GENERATED_AUDIO:
        if not isinstance(output, GeneratedAudio) or not (
            output.url or output.hex or output.b64_audio
        ):
            raise RuntimeOutputValidationError("Audio task did not return audio.")
        return

    if validator_id == ValidatorId.GENERATED_VIDEO:
        if not isinstance(output, VideoGenerationProviderResult) or not (
            output.video.url or output.provider_task_id
        ):
            raise RuntimeOutputValidationError(
                "Video task did not return a video URL or provider task id."
            )
        return

    raise RuntimeOutputValidationError(f"Unknown validator '{validator_id}'.")
