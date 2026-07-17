from __future__ import annotations

import os

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from .agent_runtime import agent_runtime
from .providers import (
    ArkSeedanceVideoProviderSettings,
    MiniMaxMusicProviderSettings,
    ProviderConfigurationError,
    ProviderExecutionError,
    SeedDreamProviderSettings,
    ScriptProviderSettings,
    get_script_provider,
    submitArkSeedanceVideoWithRetry,
    submitMiniMaxMusicWithRetry,
    submitSeedreamWithRetry,
)
from .schemas import (
    ImageGenerationRequest,
    ImageGenerationResponse,
    ImageGenerationSettings,
    MusicGenerationRequest,
    MusicGenerationResponse,
    MusicGenerationSettings,
    ScriptDialogueMessage,
    ScriptDialogueRequest,
    ScriptDialogueResponse,
    ScriptDialogueRole,
    ScriptNodeSaveRequest,
    ScriptNodeState,
    ScriptSettings,
    TaskResult,
    TaskState,
    TaskStatus,
    VideoGenerationRequest,
    VideoGenerationResponse,
    VideoGenerationSettings,
)
from .store import store


app = FastAPI(title="X-META Video API", version="0.1.0")

frontend_origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.patch(
    "/api/v1/projects/{project_id}/nodes/{node_id}",
    response_model=ScriptNodeState,
)
def save_script_node(
    project_id: str,
    node_id: str,
    request: ScriptNodeSaveRequest,
) -> ScriptNodeState:
    return store.save_node(project_id, node_id, request.input, request.settings)


@app.post(
    "/api/v1/projects/{project_id}/nodes/{node_id}/run",
    response_model=TaskState,
    status_code=status.HTTP_202_ACCEPTED,
)
def run_script_node(project_id: str, node_id: str) -> TaskState:
    node = store.get_node(project_id, node_id)
    if node is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Script node input not found. Save node input before running.",
        )

    try:
        settings = _resolve_script_provider_settings(node.settings)
        provider = get_script_provider(settings)
    except ProviderConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    task = store.create_task(
        project_id=project_id,
        node_id=node_id,
        input_version=node.version,
        provider=settings.provider,
        model=settings.model,
    )
    return agent_runtime.run_script_task_sync(
        store=store,
        provider=provider,
        task=task,
        node=node,
    )


@app.post(
    "/api/v1/projects/{project_id}/nodes/{node_id}/chat",
    response_model=ScriptDialogueResponse,
)
def chat_script_node(
    project_id: str,
    node_id: str,
    request: ScriptDialogueRequest,
) -> ScriptDialogueResponse:
    node = store.save_node(project_id, node_id, request.input, request.settings)
    user_message = ScriptDialogueMessage(
        role=ScriptDialogueRole.USER,
        content=request.message,
    )

    try:
        settings = _resolve_script_provider_settings(node.settings)
        provider = get_script_provider(settings)
        assistant_text = agent_runtime.run_script_dialogue(
            project_id=project_id,
            provider=provider,
            script_input=node.input,
            history=request.history,
            user_message=request.message,
            mode=request.mode,
        )
    except ProviderConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except ProviderExecutionError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

    assistant_message = ScriptDialogueMessage(
        role=ScriptDialogueRole.ASSISTANT,
        content=assistant_text,
    )
    return ScriptDialogueResponse(
        project_id=project_id,
        node_id=node_id,
        provider=settings.provider,
        model=settings.model,
        message=assistant_message,
        history=[*request.history, user_message, assistant_message],
    )


@app.post(
    "/api/v1/projects/{project_id}/nodes/{node_id}/generate-image",
    response_model=ImageGenerationResponse,
)
def generate_image_node(
    project_id: str,
    node_id: str,
    request: ImageGenerationRequest,
) -> ImageGenerationResponse:
    try:
        settings = _resolve_seedream_provider_settings(request.settings)
        return agent_runtime.run_image_generation(
            project_id=project_id,
            node_id=node_id,
            request=request,
            settings=settings,
            execute=submitSeedreamWithRetry,
        )
    except ProviderConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except ProviderExecutionError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc


@app.post(
    "/api/v1/projects/{project_id}/nodes/{node_id}/generate-audio",
    response_model=MusicGenerationResponse,
)
def generate_audio_node(
    project_id: str,
    node_id: str,
    request: MusicGenerationRequest,
) -> MusicGenerationResponse:
    try:
        settings = _resolve_minimax_music_provider_settings(request.settings)
        has_reference_audio = bool(
            request.input.reference_audio_url or request.input.reference_audio_b64
        )
        if has_reference_audio and not request.settings.model:
            settings = settings.with_cover_model()
        return agent_runtime.run_audio_generation(
            project_id=project_id,
            node_id=node_id,
            request=request,
            settings=settings,
            execute=submitMiniMaxMusicWithRetry,
        )
    except ProviderConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except ProviderExecutionError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc


@app.post(
    "/api/v1/projects/{project_id}/nodes/{node_id}/generate-video",
    response_model=VideoGenerationResponse,
)
def generate_video_node(
    project_id: str,
    node_id: str,
    request: VideoGenerationRequest,
) -> VideoGenerationResponse:
    try:
        settings = _resolve_ark_seedance_video_provider_settings(request.settings)
        return agent_runtime.run_video_generation(
            project_id=project_id,
            node_id=node_id,
            request=request,
            settings=settings,
            execute=submitArkSeedanceVideoWithRetry,
        )
    except ProviderConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except ProviderExecutionError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc


def _resolve_script_provider_settings(
    node_settings: ScriptSettings,
) -> ScriptProviderSettings:
    env_settings = ScriptProviderSettings.from_env()
    provider = (
        node_settings.provider.strip().lower()
        if node_settings.provider and node_settings.provider.strip()
        else env_settings.provider
    )
    model = (
        node_settings.model.strip()
        if node_settings.model and node_settings.model.strip()
        else env_settings.model
    )

    return ScriptProviderSettings(
        provider=provider,
        base_url=env_settings.base_url,
        api_key=env_settings.api_key,
        model=model,
        temperature=(
            node_settings.temperature
            if node_settings.temperature is not None
            else env_settings.temperature
        ),
        timeout_seconds=env_settings.timeout_seconds,
        max_retries=env_settings.max_retries,
    )


def _resolve_seedream_provider_settings(
    node_settings: ImageGenerationSettings,
) -> SeedDreamProviderSettings:
    env_settings = SeedDreamProviderSettings.from_env()
    return env_settings.with_overrides(node_settings)


def _resolve_minimax_music_provider_settings(
    node_settings: MusicGenerationSettings,
) -> MiniMaxMusicProviderSettings:
    env_settings = MiniMaxMusicProviderSettings.from_env()
    return env_settings.with_overrides(node_settings)


def _resolve_ark_seedance_video_provider_settings(
    node_settings: VideoGenerationSettings,
) -> ArkSeedanceVideoProviderSettings:
    env_settings = ArkSeedanceVideoProviderSettings.from_env()
    return env_settings.with_overrides(node_settings)


@app.get("/api/v1/tasks/{task_id}", response_model=TaskState)
def get_task(task_id: str) -> TaskState:
    task = store.get_task(task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
    return task


@app.get("/api/v1/tasks/{task_id}/result", response_model=TaskResult)
def get_task_result(task_id: str) -> TaskResult:
    task = store.get_task(task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")

    result = store.get_result(task_id)
    if task.status == TaskStatus.FAILED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Task failed: {task.error}",
        )
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Task result is not ready. Current status: {task.status.value}.",
        )

    return TaskResult(
        task_id=task.task_id,
        project_id=task.project_id,
        node_id=task.node_id,
        status=task.status,
        error=task.error,
        output=result,
    )
