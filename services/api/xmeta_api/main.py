from __future__ import annotations

import os

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from .providers import ProviderConfigurationError, ScriptProviderSettings, get_script_provider
from .runner import run_script_task_sync
from .schemas import ScriptNodeSaveRequest, ScriptNodeState, TaskResult, TaskState, TaskStatus
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
        settings = ScriptProviderSettings.from_env()
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
    )
    return run_script_task_sync(store=store, provider=provider, task=task, node=node)


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
