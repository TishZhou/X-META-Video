# API Contract -- X-META AI Comic / MV Creation Platform

## Purpose
This document defines the first backend API contract between the Next.js web app/BFF layer and the FastAPI backend. It is intentionally compact so agents can implement routes without inventing new boundaries.

Architecture reference: `docs/ARCHITECTURE.md`.

Global rules:
- Base path is `/api/v1`.
- All authenticated requests resolve `user_id`, `org_id`, role, and `request_id` on the server.
- The Next.js web app or browser client may send active organization context, but FastAPI must validate membership.
- Generation endpoints return `task_id`; they do not return final media.
- Final media is retrieved through task results, asset versions, or signed object URLs.
- All project-owned reads and writes must filter by `org_id` and relevant `project_id`.
- Request and response bodies should use Pydantic schemas and stable enum values.

## Common Shapes

### Error Response
```json
{
  "error": {
    "code": "permission_denied",
    "message": "You do not have access to this project.",
    "request_id": "req_123"
  }
}
```

### Task Response
```json
{
  "task_id": "task_123",
  "project_id": "project_123",
  "node_id": "node_script_1",
  "status": "queued",
  "provider": "mock",
  "model": "local-script-mock"
}
```

### Asset Reference
```json
{
  "asset_id": "asset_123",
  "asset_version_id": "asset_version_456",
  "type": "character",
  "storage_object_id": "storage_789"
}
```

## Auth and Accounts

| Method | Path | Purpose | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Register user, create default workspace, and create session cookie | public |
| `POST` | `/auth/login` | Login and create HttpOnly cookie session | public |
| `POST` | `/auth/refresh` | Refresh HttpOnly cookie session | session |
| `POST` | `/auth/logout` | Revoke current session | session |
| `GET` | `/auth/me` | Current user profile | user |
| `GET` | `/accounts` | Organizations/workspaces visible to user | user |
| `POST` | `/accounts/active` | Set or confirm active organization | user |

Auth sessions use the `xmeta_session` HttpOnly cookie. Auth responses do not return access or refresh tokens to browser JavaScript.

`POST /auth/register` request:
```json
{
  "email": "creator@example.com",
  "password": "correct horse battery staple",
  "name": "Creator One"
}
```

Registration creates a default organization/workspace, assigns the registering user the `owner` membership role, and does not ask the browser to provide a workspace name during registration. Workspace naming is handled later through workspace settings.

`POST /auth/login` request:
```json
{
  "email": "creator@example.com",
  "password": "correct horse battery staple"
}
```

Auth session response:
```json
{
  "user": {
    "user_id": "user_123",
    "email": "creator@example.com",
    "name": "Creator One"
  },
  "active_organization": {
    "org_id": "org_123",
    "name": "Creator Studio",
    "role": "owner"
  }
}
```

`GET /accounts` response:
```json
{
  "organizations": [
    { "org_id": "org_123", "name": "Studio A", "role": "editor" }
  ]
}
```

## Projects

| Method | Path | Purpose | Auth |
|---|---|---|---|
| `GET` | `/projects` | List projects in active organization | member |
| `POST` | `/projects` | Create project and default workflow | editor |
| `GET` | `/projects/{project_id}` | Get project shell and summary state | member |
| `PATCH` | `/projects/{project_id}` | Rename/update project metadata | editor |
| `DELETE` | `/projects/{project_id}` | Soft delete project | admin/editor-owner |

Create project request:
```json
{
  "name": "Spring MV",
  "type": "mv"
}
```

Project responses should include current `version` or `updated_at` for optimistic concurrency.

## Workflow Nodes

Workflow APIs support the canvas-based node editor.

| Method | Path | Purpose | Auth |
|---|---|---|---|
| `GET` | `/projects/{project_id}/workflow` | Load node graph and edges | member |
| `PUT` | `/projects/{project_id}/workflow` | Save graph layout, edges, and node order | editor |
| `GET` | `/projects/{project_id}/nodes/{node_id}` | Load node input/output state | member |
| `PATCH` | `/projects/{project_id}/nodes/{node_id}` | Save node input, settings, or selected output | editor |
| `POST` | `/projects/{project_id}/nodes/{node_id}/chat` | Send one backend-connected Script node AI dialogue turn | editor |
| `POST` | `/projects/{project_id}/nodes/{node_id}/run` | Create generation task for one node | editor |

Node types:
```txt
script
storyboard
character_image
prop_asset
scene_image
image_composition
audio
video
export
```

Node save request:
```json
{
  "input": {},
  "settings": {},
  "selected_asset_version_id": "asset_version_456",
  "base_version": 7
}
```

Node run response is the common Task Response.

### Script Node Input
For `node_type=script`, `input` uses this shape:

```json
{
  "world_description": "A sweet summer MV world with two girls, a desert jeep, and a neon stage."
}
```

The MVP Script Node intentionally accepts one world-view description from the AI chat input. The backend prompt builder expands that single input into downstream-ready structure.

### Script Node Dialogue
For `node_type=script`, the chat endpoint accepts the current input, optional text-provider settings, prior dialogue history, and the latest user message:

```json
{
  "input": {
    "world_description": "A sweet summer MV world with two girls, a desert jeep, and a neon stage."
  },
  "settings": {
    "provider": "mock",
    "model": "local-script-mock"
  },
  "history": [
    { "role": "user", "content": "Make the chorus feel more dramatic." },
    { "role": "assistant", "content": "Add a conflict beat before the chorus payoff." }
  ],
  "message": "Make the two leads argue before the chorus."
}
```

Response:

```json
{
  "project_id": "project_123",
  "node_id": "node_script_1",
  "provider": "mock",
  "model": "local-script-mock",
  "message": {
    "role": "assistant",
    "content": "Natural-language assistant reply."
  },
  "history": [
    { "role": "user", "content": "Make the chorus feel more dramatic." },
    { "role": "assistant", "content": "Add a conflict beat before the chorus payoff." },
    { "role": "user", "content": "Make the two leads argue before the chorus." },
    { "role": "assistant", "content": "Natural-language assistant reply." }
  ]
}
```

The web app must display the returned `provider` and `model` beside Script AI replies and generation output. A frontend model selector label is not proof of live LLM execution; `mock` replies must be visibly identified as mock backend replies.

The dialogue endpoint is a request/response backend AI chat path for Feature 3. It does not create downstream-ready `ScriptOutput`; users run `/run` when the dialogue should be converted into structured output for later nodes.

Feature 15 `auth-account-004` protects the MVP Script Node routes with active-workspace actor context. `PATCH /projects/{project_id}/nodes/{node_id}`, `/chat`, and `/run` require `owner`, `admin`, or `editor`; `viewer` is read-only. Until durable project persistence lands, the in-memory Script Node store binds a project ID to the active organization on first write and uses that binding for Script/Task access checks.

### Script Node Output
Script generation task results return structured JSON under `output`, not assistant prose:

```json
{
  "title": "MV World: A sweet summer MV world",
  "world_overview": "string",
  "storyboard_direction": {
    "pov": "third-person cinematic POV with occasional first-person inserts",
    "visual_rhythm": "soft opening, kinetic travel beat, neon performance payoff",
    "shots": [
      {
        "shot_number": 1,
        "pov": "third-person observer",
        "framing": "wide establishing frame",
        "action": "string",
        "camera_movement": "slow push-in from environment to faces",
        "duration_seconds": 8
      }
    ]
  },
  "characters": [
    {
      "name": "string",
      "overview": "sweet visual direction",
      "style": "string",
      "clothing": "string",
      "height": "string",
      "appearance": "string",
      "personality": "string",
      "visual_prompt": "string"
    }
  ],
  "scene_descriptions": [
    {
      "scene_number": 1,
      "shot_reference": 1,
      "characters": ["string"],
      "location": "desert highway beside a vintage jeep",
      "description": "string",
      "visual_prompt": "string"
    }
  ],
  "missing_inputs": []
}
```

Script provider configuration is server-only:

```txt
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1

TEXT_MODEL_PROVIDER=mock
TEXT_MODEL_BASE_URL=https://api.openai.com/v1
TEXT_MODEL_API_KEY=
TEXT_MODEL_NAME=
TEXT_MODEL_TEMPERATURE=
TEXT_MODEL_TIMEOUT_SECONDS=60
TEXT_MODEL_MAX_RETRIES=1

IMAGE_MODEL_PROVIDER=mock
IMAGE_MODEL_BASE_URL=https://api.openai.com/v1
IMAGE_MODEL_API_KEY=
IMAGE_MODEL_NAME=gpt-image-1-mini

VIDEO_MODEL_PROVIDER=mock
VIDEO_MODEL_BASE_URL=https://api.openai.com/v1
VIDEO_MODEL_API_KEY=
VIDEO_MODEL_NAME=sora-2

MUSIC_MODEL_PROVIDER=mock
MUSIC_MODEL_BASE_URL=https://api.openai.com/v1
MUSIC_MODEL_API_KEY=
MUSIC_MODEL_NAME=
MUSIC_MODEL_IMPLEMENTATION_STATUS=config_only_no_openai_dedicated_music_endpoint
```

`mock` is the default development provider and reports `local-script-mock` when no text model name is configured. For Feature 3, only the text category is executed: set `TEXT_MODEL_PROVIDER=openai` or `TEXT_MODEL_PROVIDER=openai-compatible`, provide `OPENAI_API_KEY` or `TEXT_MODEL_API_KEY`, and the Script Node will call the configured OpenAI-compatible `/responses` endpoint. `TEXT_MODEL_BASE_URL` defaults to OpenAI's API base URL; live OpenAI-compatible providers default `TEXT_MODEL_NAME` to the low-cost `gpt-5.4-mini` model when no model name is supplied. Legacy `SCRIPT_MODEL_*` names remain a compatibility fallback for the Script Node only.

Provider config is read from process environment first, then local `.env`, then `services/api/.env`, then `.env.example` for this repository's current local workflow. Tests disable dotenv loading so unit tests do not accidentally call a live provider.

Image and video model env values are configuration slots for later nodes. Music is also a configuration slot; the checked OpenAI docs cover audio/speech models, but this API contract does not claim a dedicated OpenAI music-generation endpoint is implemented.

## Tasks

| Method | Path | Purpose | Auth |
|---|---|---|---|
| `GET` | `/tasks/{task_id}` | Get task state and summary | member |
| `GET` | `/tasks/{task_id}/events` | Get task event timeline | member |
| `GET` | `/tasks/{task_id}/result` | Get normalized result references | member |
| `POST` | `/tasks/{task_id}/retry` | Retry failed task or create rerun task | editor |
| `POST` | `/tasks/{task_id}/cancel` | Cancel queued/running task if supported | editor |

Task statuses:
```txt
queued
running
succeeded
failed
cancelled
retrying
```

Task result response:
```json
{
  "task_id": "task_123",
  "status": "succeeded",
  "outputs": [
    {
      "asset_id": "asset_123",
      "asset_version_id": "asset_version_456",
      "storage_object_id": "storage_789",
      "media_type": "image/png"
    }
  ]
}
```

## Assets

| Method | Path | Purpose | Auth |
|---|---|---|---|
| `GET` | `/assets` | Search visible asset library | member |
| `GET` | `/assets/{asset_id}` | Get asset metadata and versions | member |
| `PATCH` | `/assets/{asset_id}` | Update name, tags, library metadata | editor |
| `POST` | `/assets/{asset_id}/versions/{version_id}/select` | Mark selected version | editor |
| `POST` | `/assets/{asset_id}/attach` | Attach asset version to project node | editor |
| `DELETE` | `/assets/{asset_id}` | Soft delete asset | editor/admin |

Asset query filters:
```txt
type=character|scene|prop|audio|video|grid|export
project_id=...
q=...
tag=...
```

Asset metadata must preserve source prompt/input, provider, model, parameters, generation time, parent task, and project link.

## Storyboards and History

| Method | Path | Purpose | Auth |
|---|---|---|---|
| `GET` | `/projects/{project_id}/storyboard` | Load current script/storyboard state | member |
| `POST` | `/projects/{project_id}/storyboard/versions` | Save explicit storyboard version | editor |
| `GET` | `/projects/{project_id}/history` | List project history events | member |
| `GET` | `/projects/{project_id}/generation-attempts` | List immutable model attempts | member |

History is normally written by backend services as side effect of user-visible changes and generation completions. Frontend should not create arbitrary history events directly.

## Exports

| Method | Path | Purpose | Auth |
|---|---|---|---|
| `POST` | `/projects/{project_id}/exports` | Create export render task | editor |
| `GET` | `/projects/{project_id}/exports` | List export artifacts | member |
| `GET` | `/exports/{export_id}` | Get export metadata and status | member |
| `GET` | `/exports/{export_id}/download-url` | Get short-lived signed download URL | member |

Export creation returns the common Task Response.

## Status Updates

Preferred realtime path:
```txt
GET /api/v1/projects/{project_id}/events
```

This endpoint may use SSE or WebSocket later. It should publish task status changes, node output readiness, and project version changes. Polling `/tasks/{task_id}` is acceptable for MVP fallback.
