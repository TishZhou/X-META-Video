from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from pydantic import (
    AliasChoices,
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)


class TaskStatus(StrEnum):
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLED = "cancelled"
    RETRYING = "retrying"


class ScriptInput(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    world_description: str = Field(..., min_length=1)


class ScriptSettings(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    provider: str | None = None
    model: str | None = None
    temperature: float | None = Field(default=None, ge=0, le=2)


class TextGenerationTask(StrEnum):
    IP_WORLDVIEW = "ip_worldview"
    CHARACTER_PROFILES = "character_profiles"


class TextDataType(StrEnum):
    SCRIPT = "script"
    CHARACTER = "character"


class TextInputSourceType(StrEnum):
    MANUAL = "manual"
    SAME_NODE_TASK_1 = "same_node_task_1"
    CONNECTED_TASK_1 = "connected_task_1"


class TextGenerationInputSource(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    type: TextInputSourceType
    source_node_id: str | None = Field(default=None, min_length=1)
    source_task: TextGenerationTask | None = None

    @model_validator(mode="after")
    def validate_task_1_source(self) -> "TextGenerationInputSource":
        if self.type == TextInputSourceType.MANUAL:
            return self
        if not self.source_node_id:
            raise ValueError("Task 1 input sources require source_node_id.")
        if self.source_task != TextGenerationTask.IP_WORLDVIEW:
            raise ValueError("Task 1 input sources must identify the ip_worldview task.")
        return self


class TextGenerationInput(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    content: str = Field(..., min_length=1, max_length=50000)
    source: TextGenerationInputSource


class TextGenerationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    task: TextGenerationTask
    input: TextGenerationInput
    settings: ScriptSettings = Field(default_factory=ScriptSettings)


class TextGenerationMetadata(BaseModel):
    task: TextGenerationTask
    data_type: TextDataType
    input_source: TextGenerationInputSource
    prompt_template_id: str


class TextGenerationResponse(BaseModel):
    project_id: str
    node_id: str
    node_type: str = "script"
    provider: str
    model: str | None = None
    content: str
    metadata: TextGenerationMetadata
    persisted: bool = False


class ScriptNodeSaveRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    input: ScriptInput
    settings: ScriptSettings = Field(default_factory=ScriptSettings)
    base_version: int | None = None


class ScriptDialogueRole(StrEnum):
    USER = "user"
    ASSISTANT = "assistant"


class ScriptDialogueMode(StrEnum):
    DIALOGUE = "dialogue"
    DIRECT_OUTPUT = "direct_output"


class ScriptDialogueMessage(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    role: ScriptDialogueRole
    content: str = Field(..., min_length=1)


class ScriptDialogueRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    input: ScriptInput
    settings: ScriptSettings = Field(default_factory=ScriptSettings)
    history: list[ScriptDialogueMessage] = Field(default_factory=list, max_length=40)
    message: str = Field(..., min_length=1)
    mode: ScriptDialogueMode = ScriptDialogueMode.DIALOGUE


class ScriptDialogueResponse(BaseModel):
    project_id: str
    node_id: str
    provider: str
    model: str | None = None
    message: ScriptDialogueMessage
    history: list[ScriptDialogueMessage]


class ImageGenerationNodeType(StrEnum):
    CHARACTER_IMAGE = "character_image"
    PROP_ASSET = "prop_asset"
    SCENE_IMAGE = "scene_image"


class ImageGenerationInput(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    prompt: str = Field(..., min_length=1)
    reference_image_url: str | None = Field(default=None, min_length=1)
    reference_image_b64: str | None = Field(default=None, min_length=1)
    reference_image_mime_type: str | None = Field(default=None, min_length=1)


class ImageGenerationSettings(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    provider: str | None = None
    model: str | None = None
    size: str | None = None
    response_format: str | None = Field(default=None, pattern="^(url|b64_json)$")
    watermark: bool | None = None


class ImageGenerationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    node_type: ImageGenerationNodeType
    input: ImageGenerationInput
    settings: ImageGenerationSettings = Field(default_factory=ImageGenerationSettings)


class GeneratedImage(BaseModel):
    url: str | None = None
    b64_json: str | None = None
    mime_type: str | None = None
    width: int | None = None
    height: int | None = None


class ImageGenerationResponse(BaseModel):
    project_id: str
    node_id: str
    node_type: ImageGenerationNodeType
    provider: str
    model: str
    prompt: str
    image: GeneratedImage
    persisted: bool = False


class MusicGenerationNodeType(StrEnum):
    AUDIO = "audio"


class MusicGenerationInput(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    prompt: str = Field(..., min_length=1, max_length=2000)
    lyrics: str = Field(default="", max_length=3500)
    reference_audio_url: str | None = Field(default=None, min_length=1)
    reference_audio_b64: str | None = Field(default=None, min_length=1)
    reference_audio_mime_type: str | None = Field(default=None, min_length=1)


class MusicGenerationSettings(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    provider: str | None = None
    model: str | None = None
    output_format: str | None = Field(default=None, pattern="^(url|hex)$")
    sample_rate: int | None = Field(default=None, gt=0)
    bitrate: int | None = Field(default=None, gt=0)
    format: str | None = Field(default=None, pattern="^(mp3|wav|flac)$")
    lyrics_optimizer: bool | None = None
    is_instrumental: bool | None = None


class MusicGenerationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    node_type: MusicGenerationNodeType
    input: MusicGenerationInput
    settings: MusicGenerationSettings = Field(default_factory=MusicGenerationSettings)


class GeneratedAudio(BaseModel):
    url: str | None = None
    hex: str | None = None
    b64_audio: str | None = None
    mime_type: str | None = None
    duration_ms: int | None = None
    sample_rate: int | None = None
    channels: int | None = None
    bitrate: int | None = None
    size_bytes: int | None = None


class MusicGenerationResponse(BaseModel):
    project_id: str
    node_id: str
    node_type: MusicGenerationNodeType
    provider: str
    model: str
    prompt: str
    lyrics: str
    audio: GeneratedAudio
    persisted: bool = False


class VideoGenerationNodeType(StrEnum):
    VIDEO = "video"


class VideoGenerationInput(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    prompt: str = Field(..., min_length=1, max_length=4000)
    image_urls: list[str] = Field(default_factory=list, max_length=9)
    video_urls: list[str] = Field(default_factory=list, max_length=3)
    audio_urls: list[str] = Field(default_factory=list, max_length=3)
    duration_seconds: int = Field(
        default=5,
        ge=1,
        le=60,
        validation_alias=AliasChoices("duration_seconds", "duration"),
    )

    @field_validator("image_urls", "video_urls", "audio_urls")
    @classmethod
    def strip_media_urls(cls, values: list[str]) -> list[str]:
        cleaned: list[str] = []
        for value in values:
            stripped = value.strip()
            if not stripped:
                raise ValueError("Media URLs must not be empty.")
            cleaned.append(stripped)
        return cleaned

    @model_validator(mode="after")
    def validate_media_dependencies(self) -> "VideoGenerationInput":
        if self.audio_urls and not (self.image_urls or self.video_urls):
            raise ValueError(
                "audio_urls require at least one image_url or video_url for video generation."
            )
        return self


class VideoGenerationSettings(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    provider: str | None = None
    model: str | None = None
    ratio: str | None = None
    aspect_ratio: str | None = None
    generate_audio: bool | None = None
    watermark: bool | None = None


class VideoGenerationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    node_type: VideoGenerationNodeType
    input: VideoGenerationInput
    settings: VideoGenerationSettings = Field(default_factory=VideoGenerationSettings)


class GeneratedVideo(BaseModel):
    url: str | None = None
    mime_type: str | None = None
    duration_ms: int | None = None
    width: int | None = None
    height: int | None = None
    thumbnail_url: str | None = None


class VideoGenerationResponse(BaseModel):
    task_id: str | None = None
    project_id: str
    node_id: str
    node_type: VideoGenerationNodeType
    provider: str
    model: str
    prompt: str
    image_urls: list[str]
    video_urls: list[str]
    audio_urls: list[str]
    duration: int
    duration_seconds: int
    video: GeneratedVideo
    provider_task_id: str | None = None
    persisted: bool = False


class CharacterProfile(BaseModel):
    name: str
    overview: str
    style: str
    clothing: str
    height: str
    appearance: str
    personality: str
    visual_prompt: str


class StoryboardShot(BaseModel):
    shot_number: int
    pov: str
    framing: str
    action: str
    camera_movement: str
    duration_seconds: int


class StoryboardDirection(BaseModel):
    pov: str
    visual_rhythm: str
    shots: list[StoryboardShot]


class SceneDescription(BaseModel):
    scene_number: int
    shot_reference: int
    characters: list[str]
    location: str
    description: str
    visual_prompt: str


class ScriptOutput(BaseModel):
    title: str
    agent_output: str | None = None
    world_overview: str
    storyboard_direction: StoryboardDirection
    characters: list[CharacterProfile]
    scene_descriptions: list[SceneDescription]
    missing_inputs: list[str]


class ScriptNodeState(BaseModel):
    project_id: str
    node_id: str
    node_type: str = "script"
    version: int
    input: ScriptInput
    settings: ScriptSettings = Field(default_factory=ScriptSettings)
    output: ScriptOutput | None = None
    updated_at: datetime


class TaskResponse(BaseModel):
    task_id: str
    project_id: str
    node_id: str
    status: TaskStatus
    error: str | None = None


class TaskState(TaskResponse):
    task_type: str = "script_node"
    input_version: int
    provider: str
    model: str | None = None
    created_at: datetime
    updated_at: datetime


class TaskResult(BaseModel):
    task_id: str
    project_id: str
    node_id: str
    status: TaskStatus
    error: str | None = None
    output: ScriptOutput | None = None
