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

    if validator_id == ValidatorId.IP_WORLDVIEW_TEXT:
        _validate_text_elements(
            output,
            validator_label="IP world-view",
            required_elements={
                "narrative positioning": ("narrative", "叙事"),
                "world view": ("world", "世界"),
                "character positioning": ("character", "角色", "人物"),
            },
        )
        return

    if validator_id == ValidatorId.CHARACTER_PROFILES_TEXT:
        _validate_text_elements(
            output,
            validator_label="Character profiles",
            required_elements={
                "appearance": (
                    "appearance",
                    "visual",
                    "look",
                    "外貌",
                    "外观",
                    "视觉",
                    "造型",
                    "形象",
                    "发型",
                    "穿搭",
                    "服装",
                    "服饰",
                    "妆容",
                ),
                "personality/action": (
                    "personality",
                    "action",
                    "temperament",
                    "movement",
                    "demeanor",
                    "gesture",
                    "性格",
                    "动作",
                    "个性",
                    "气质",
                    "肢体",
                    "姿态",
                    "举止",
                ),
                "voice/timbre": (
                    "voice",
                    "timbre",
                    "vocal",
                    "tone",
                    "声线",
                    "音色",
                    "嗓音",
                    "唱腔",
                    "人声",
                    "声部",
                ),
            },
        )
        return

    if validator_id == ValidatorId.MV_LOOK_TEXT:
        _validate_text_elements(
            output,
            validator_label="MV look development",
            required_elements={
                "outfit/styling": (
                    "outfit", "wardrobe", "costume", "styling", "look", "attire",
                    "穿搭", "服装", "造型", "装造", "服饰", "衣", "妆",
                ),
                "visual identity": (
                    "visual", "identity", "silhouette", "palette", "material", "hair",
                    "外形", "视觉", "轮廓", "色彩", "材质", "发型", "妆容", "五官",
                ),
            },
        )
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


def _validate_text_elements(
    output: object,
    *,
    validator_label: str,
    required_elements: dict[str, tuple[str, ...]],
) -> None:
    if not isinstance(output, str) or not output.strip():
        raise RuntimeOutputValidationError(f"{validator_label} task must return non-empty text.")
    normalized = output.casefold()
    missing = [
        label
        for label, markers in required_elements.items()
        if not any(marker.casefold() in normalized for marker in markers)
    ]
    if missing:
        raise RuntimeOutputValidationError(
            f"{validator_label} task is missing required elements: {', '.join(missing)}."
        )
