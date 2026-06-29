from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class ContentType(StrEnum):
    COMIC_DRAMA = "comic_drama"
    MV = "mv"
    SHORT_VIDEO = "short_video"


class TaskStatus(StrEnum):
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLED = "cancelled"
    RETRYING = "retrying"


class ScriptInput(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    creative_brief: str = Field(..., min_length=1)
    content_type: ContentType
    style: str = Field(..., min_length=1)
    theme: str = Field(..., min_length=1)
    world_setting: str = Field(..., min_length=1)
    duration_seconds: int = Field(..., ge=1, le=7200)
    language: str = Field(..., min_length=1)
    target_platform: str = Field(..., min_length=1)
    audience: str = Field(..., min_length=1)
    constraints: list[str] = Field(default_factory=list)
    references: list[str] = Field(default_factory=list)


class ScriptSettings(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    provider: str | None = None
    model: str | None = None
    temperature: float | None = Field(default=None, ge=0, le=2)


class ScriptNodeSaveRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    input: ScriptInput
    settings: ScriptSettings = Field(default_factory=ScriptSettings)
    base_version: int | None = None


class CharacterProfile(BaseModel):
    name: str
    role: str
    personality: str
    visual_prompt: str
    dialogue_style: str


class StoryBeat(BaseModel):
    beat: str
    purpose: str
    summary: str


class ShotPlanItem(BaseModel):
    shot_number: int
    scene: str
    action: str
    characters: list[str]
    dialogue: str
    camera: str
    duration_seconds: int
    image_prompt: str


class DialogueLine(BaseModel):
    speaker: str
    text: str
    delivery: str


class ScriptOutput(BaseModel):
    title: str
    logline: str
    plot_summary: str
    characters: list[CharacterProfile]
    story_beats: list[StoryBeat]
    shot_plan: list[ShotPlanItem]
    dialogue_or_lyrics: list[DialogueLine]
    camera_notes: list[str]
    scene_prompts: list[str]
    audio_notes: list[str]
    production_checklist: list[str]
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
    created_at: datetime
    updated_at: datetime


class TaskResult(BaseModel):
    task_id: str
    project_id: str
    node_id: str
    status: TaskStatus
    error: str | None = None
    output: ScriptOutput | None = None
