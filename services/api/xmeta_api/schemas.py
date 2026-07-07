from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


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


class ScriptNodeSaveRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    input: ScriptInput
    settings: ScriptSettings = Field(default_factory=ScriptSettings)
    base_version: int | None = None


class ScriptDialogueRole(StrEnum):
    USER = "user"
    ASSISTANT = "assistant"


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


class ScriptDialogueResponse(BaseModel):
    project_id: str
    node_id: str
    provider: str
    model: str | None = None
    message: ScriptDialogueMessage
    history: list[ScriptDialogueMessage]


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


class AuthRegisterRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=8)
    name: str = Field(..., min_length=1)
    workspace_name: str = Field(..., min_length=1)


class AuthLoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=1)


class ActiveAccountRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    org_id: str = Field(..., min_length=1)


class AccountUserResponse(BaseModel):
    user_id: str
    email: str
    name: str


class AccountOrganizationResponse(BaseModel):
    org_id: str
    name: str
    role: str


class AuthSessionResponse(BaseModel):
    user: AccountUserResponse
    active_organization: AccountOrganizationResponse


class AccountsResponse(BaseModel):
    organizations: list[AccountOrganizationResponse]
