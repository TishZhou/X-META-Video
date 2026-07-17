from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from types import MappingProxyType
from typing import Mapping


class NodeKind(StrEnum):
    TEXT = "text"
    IMAGE = "image"
    AUDIO = "audio"
    VIDEO = "video"


class TaskId(StrEnum):
    TEXT_SCRIPT_GENERATE = "text.script.generate"
    TEXT_SCRIPT_DIALOGUE = "text.script.dialogue"
    TEXT_IP_WORLDVIEW_GENERATE = "text.ip_worldview.generate"
    TEXT_CHARACTER_PROFILES_GENERATE = "text.character_profiles.generate"
    IMAGE_CHARACTER_GENERATE = "image.character.generate"
    IMAGE_PROP_GENERATE = "image.prop.generate"
    IMAGE_SCENE_GENERATE = "image.scene.generate"
    AUDIO_MUSIC_GENERATE = "audio.music.generate"
    VIDEO_CLIP_GENERATE = "video.clip.generate"


class MemoryScope(StrEnum):
    PROJECT_BIBLE = "project_bible"
    CHARACTER_BIBLE = "character_bible"
    MV_BIBLE = "mv_bible"
    STYLE_RULES = "style_rules"
    MUSIC_BRIEF = "music_brief"
    SHOT_CONTEXT = "shot_context"
    SELECTED_ASSETS = "selected_assets"
    CONTINUITY = "continuity"


class PromptTemplateId(StrEnum):
    SCRIPT_GENERATE_V1 = "script.generate.v1"
    SCRIPT_DIALOGUE_V1 = "script.dialogue.v1"
    TEXT_IP_WORLDVIEW_V1 = "text.ip_worldview.v1"
    TEXT_CHARACTER_PROFILES_V1 = "text.character_profiles.v1"
    IMAGE_PASSTHROUGH_V1 = "image.passthrough.v1"
    AUDIO_PASSTHROUGH_V1 = "audio.passthrough.v1"
    VIDEO_PASSTHROUGH_V1 = "video.passthrough.v1"


class ValidatorId(StrEnum):
    SCRIPT_OUTPUT = "script_output"
    NON_EMPTY_TEXT = "non_empty_text"
    IP_WORLDVIEW_TEXT = "ip_worldview_text"
    CHARACTER_PROFILES_TEXT = "character_profiles_text"
    GENERATED_IMAGE = "generated_image"
    GENERATED_AUDIO = "generated_audio"
    GENERATED_VIDEO = "generated_video"


@dataclass(frozen=True)
class TaskProfile:
    task_id: TaskId
    node_kind: NodeKind
    required_inputs: tuple[str, ...]
    memory_reads: tuple[MemoryScope, ...]
    prompt_template_id: PromptTemplateId
    output_type: str
    validator_id: ValidatorId
    retry_limit: int

    def __post_init__(self) -> None:
        if not self.required_inputs:
            raise ValueError("Task profiles must declare at least one required input.")
        if not 0 <= self.retry_limit <= 3:
            raise ValueError("Task profile retry_limit must be between 0 and 3.")


@dataclass(frozen=True)
class CompiledPrompt:
    task_id: TaskId
    template_id: PromptTemplateId
    text: str
    memory: Mapping[MemoryScope, object]

    @classmethod
    def create(
        cls,
        *,
        profile: TaskProfile,
        text: str,
        memory: Mapping[MemoryScope, object],
    ) -> "CompiledPrompt":
        return cls(
            task_id=profile.task_id,
            template_id=profile.prompt_template_id,
            text=text,
            memory=MappingProxyType(dict(memory)),
        )
