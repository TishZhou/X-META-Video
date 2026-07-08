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
  "provider": "openai-compatible",
  "model": "gpt-5.4-mini"
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
| `POST` | `/auth/login` | Login and create session/JWT | public |
| `POST` | `/auth/refresh` | Refresh session/JWT | session |
| `POST` | `/auth/logout` | Revoke current session | session |
| `GET` | `/auth/me` | Current user profile | user |
| `GET` | `/accounts` | Organizations/workspaces visible to user | user |
| `POST` | `/accounts/active` | Set or confirm active organization | user |

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
| `POST` | `/projects/{project_id}/nodes/{node_id}/generate-image` | Generate or edit one image preview for Character Image, Prop / Asset, or Scene Image nodes | editor |
| `POST` | `/projects/{project_id}/nodes/{node_id}/generate-audio` | Generate one text-to-music or reference-audio edit preview for Audio nodes | editor |
| `POST` | `/projects/{project_id}/nodes/{node_id}/generate-video` | Generate one video preview for Video nodes from prompt plus optional image/audio references | editor |
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
    "provider": "openai-compatible",
    "model": "gpt-5.4-mini"
  },
  "history": [
    { "role": "user", "content": "Make the chorus feel more dramatic." },
    { "role": "assistant", "content": "Add a conflict beat before the chorus payoff." }
  ],
  "message": "Make the two leads argue before the chorus.",
  "mode": "dialogue"
}
```

Response:

```json
{
  "project_id": "project_123",
  "node_id": "node_script_1",
  "provider": "openai-compatible",
  "model": "gpt-5.4-mini",
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

The web app must display the returned `provider` and `model` beside Script AI replies and generated direct-text output. A frontend model selector label is not proof of live LLM execution.

The dialogue endpoint is a request/response backend AI chat path for Feature 3. Use `mode=dialogue` for normal AI modify turns and `mode=direct_output` when Generate should produce editable natural text for a canvas outcome node. It does not ask the model for JSON in direct-output mode.

### Script Node Direct Text Outcome
The current web Generate action uses `POST /chat` with `mode=direct_output` and renders the returned assistant message as editable natural text in a canvas outcome node. The direct-output path must not ask the model for JSON or a fixed schema.

Direct-output request:

```json
{
  "input": {
    "world_description": "A sweet summer MV world with two girls, a desert jeep, and a neon stage."
  },
  "settings": {
    "provider": "openai-compatible",
    "model": "gpt-5.4-mini"
  },
  "history": [
    { "role": "user", "content": "Make the chorus feel more dramatic." },
    { "role": "assistant", "content": "Add a conflict beat before the chorus payoff." }
  ],
  "message": "Directly write the Script node result as editable natural text. Do not return JSON.",
  "mode": "direct_output"
}
```

### Script Node Structured Output Contract
The older `/run` task path still returns structured JSON under `output` for compatibility and backend tests, but the current task10 web Generate flow does not use this path because direct text avoids JSON truncation risk:

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

Model provider configuration is server-only:

```txt
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1

TEXT_MODEL_PROVIDER=openai
TEXT_MODEL_BASE_URL=https://api.openai.com/v1
TEXT_MODEL_API_KEY=
TEXT_MODEL_NAME=
TEXT_MODEL_TEMPERATURE=
TEXT_MODEL_TIMEOUT_SECONDS=60
TEXT_MODEL_MAX_RETRIES=1

IMAGE_MODEL_PROVIDER=doubao-seedream
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com
DOUBAO_API_KEY=
DOUBAO_HTTPS_PROXY=
SEEDREAM_MODEL=doubao-seedream-5-0-260128
SEEDREAM_SIZE=2K
SEEDREAM_RESPONSE_FORMAT=url
SEEDREAM_WATERMARK=false
SEEDREAM_TIMEOUT_SECONDS=120
SEEDREAM_MAX_RETRIES=1

VIDEO_MODEL_PROVIDER=evolink
EVOLINK_BASE_URL=https://api.evolink.ai/v1
EVOLINK_API_KEY=
EVOLINK_VIDEO_MODEL=seedance-2.0-reference-to-video
EVOLINK_TEXT_TO_VIDEO_MODEL=seedance-2.0-text-to-video
EVOLINK_VIDEO_QUALITY=720p
EVOLINK_VIDEO_ASPECT_RATIO=16:9
EVOLINK_GENERATE_AUDIO=true
EVOLINK_VIDEO_TIMEOUT_SECONDS=240
EVOLINK_VIDEO_MAX_RETRIES=1

MUSIC_MODEL_PROVIDER=minimax
MUSIC_MODEL_BASE_URL=https://api.minimaxi.com/v1/music_generation
MUSIC_MODEL_API_KEY=
MUSIC_MODEL_NAME=music-2.6-free
MINIMAX_BASE_URL=https://api.minimaxi.com/v1/music_generation
MINIMAX_API_KEY=
MINIMAX_HTTPS_PROXY=
MINIMAX_MUSIC_MODEL=music-2.6-free
MINIMAX_MUSIC_COVER_MODEL=music-cover-free
MINIMAX_MUSIC_OUTPUT_FORMAT=hex
MINIMAX_MUSIC_SAMPLE_RATE=44100
MINIMAX_MUSIC_BITRATE=256000
MINIMAX_MUSIC_FORMAT=mp3
MINIMAX_MUSIC_LYRICS_OPTIMIZER=false
MINIMAX_MUSIC_IS_INSTRUMENTAL=false
MINIMAX_MUSIC_TIMEOUT_SECONDS=180
MINIMAX_MUSIC_MAX_RETRIES=1
```

For Feature 3, only the text category is executed: set `TEXT_MODEL_PROVIDER=openai` or `TEXT_MODEL_PROVIDER=openai-compatible`, provide `OPENAI_API_KEY` or `TEXT_MODEL_API_KEY`, and the Script Node will call the configured OpenAI-compatible `/responses` endpoint. `TEXT_MODEL_BASE_URL` defaults to OpenAI's API base URL; live OpenAI-compatible providers default `TEXT_MODEL_NAME` to the low-cost `gpt-5.4-mini` model when no model name is supplied. Legacy `SCRIPT_MODEL_*` names remain a compatibility fallback for the Script Node only.

Provider config is read from process environment first, then local `.env`, then `services/api/.env`, then `.env.example` for this repository's current local workflow. Tests disable dotenv loading so unit tests do not accidentally call a live provider.

### Image Node Text-to-Image / Image Edit Generation

For `node_type=character_image`, `node_type=prop_asset`, or `node_type=scene_image`, the web app calls the local FastAPI route:

```txt
POST /api/v1/projects/{project_id}/nodes/{node_id}/generate-image
```

Request:

```json
{
  "node_type": "character_image",
  "input": {
    "prompt": "Full-body character reference, front view, clear face and wardrobe.",
    "reference_image_url": null,
    "reference_image_b64": null,
    "reference_image_mime_type": null
  },
  "settings": {
    "provider": "doubao-seedream",
    "model": "doubao-seedream-5-0-260128",
    "size": "2K",
    "response_format": "url",
    "watermark": false
  }
}
```

Response:

```json
{
  "project_id": "project_123",
  "node_id": "character-1",
  "node_type": "character_image",
  "provider": "doubao-seedream",
  "model": "doubao-seedream-5-0-260128",
  "prompt": "Full-body character reference, front view, clear face and wardrobe.",
  "image": {
    "url": "https://example.com/generated-image.png",
    "b64_json": null,
    "mime_type": "image/png",
    "width": 1024,
    "height": 1024
  },
  "persisted": false
}
```

When the selected image node already contains a generated or uploaded image, the web app sends that image as `reference_image_url` or `reference_image_b64` with the prompt. The backend wrapper is `submitSeedreamWithRetry()` -> `submitSeedreamGenerationOnce()` and posts to the configured Doubao Ark `/api/v3/images/generations` endpoint, including the reference as the SeedDream `image` payload field for image editing. The web app never calls Doubao directly and never receives provider credentials.

Image generation and editing currently update the selected image node as a local preview only. It does not claim object storage, signed URLs, reusable asset versions, queue workers, or generation history writes yet.

### Audio Node Text-to-Music Generation

For `node_type=audio`, the web app calls the local FastAPI route:

```txt
POST /api/v1/projects/{project_id}/nodes/{node_id}/generate-audio
```

Request:

```json
{
  "node_type": "audio",
  "input": {
    "prompt": "10-15 second test clip, K-pop cinematic MV hook, bright synths, 120 BPM",
    "lyrics": "[Verse]\nSnow lights fall\n[Hook]\nWe run into the glow",
    "reference_audio_url": null,
    "reference_audio_b64": null,
    "reference_audio_mime_type": null
  },
  "settings": {
    "provider": "minimax",
    "model": "music-2.6-free",
    "output_format": "hex",
    "sample_rate": 44100,
    "bitrate": 256000,
    "format": "mp3",
    "lyrics_optimizer": false,
    "is_instrumental": false
  }
}
```

Response:

```json
{
  "project_id": "project_123",
  "node_id": "audio-1",
  "node_type": "audio",
  "provider": "minimax",
  "model": "music-2.6-free",
  "prompt": "10-15 second test clip, K-pop cinematic MV hook, bright synths, 120 BPM",
  "lyrics": "[Verse]\nSnow lights fall\n[Hook]\nWe run into the glow",
  "audio": {
    "url": null,
    "hex": "fffb906400...",
    "b64_audio": null,
    "mime_type": "audio/mpeg",
    "duration_ms": 25364,
    "sample_rate": 44100,
    "channels": 2,
    "bitrate": 256000,
    "size_bytes": 813651
  },
  "persisted": false
}
```

For existing audio edit, the same local route sends the current Audio node media as a MiniMax cover reference. The frontend passes exactly one of `reference_audio_url` or `reference_audio_b64`, sets `settings.model` to `music-cover-free`, and keeps the edit prompt in `input.prompt`:

```json
{
  "node_type": "audio",
  "input": {
    "prompt": "Make the current track brighter and more cinematic.",
    "lyrics": "",
    "reference_audio_url": null,
    "reference_audio_b64": "UklGRg...",
    "reference_audio_mime_type": "audio/mpeg"
  },
  "settings": {
    "model": "music-cover-free",
    "output_format": "hex"
  }
}
```

The backend wrapper is `submitMiniMaxMusicWithRetry()` -> `submitMiniMaxMusicGenerationOnce()` and posts to the configured MiniMax `/v1/music_generation` endpoint. For text-to-music it uses `music-2.6-free`; for existing-audio edit it uses `music-cover-free` plus `audio_url` or `audio_base64`. The web app never calls MiniMax directly and never receives provider credentials.

Audio generation currently returns a local playback preview only. MiniMax URL outputs can expire, and this route does not claim object storage, signed URLs, reusable asset versions, queue workers, Audio Library persistence, or generation history writes yet.

### Video Node Generation

For `node_type=video`, the web app calls the local FastAPI route:

```txt
POST /api/v1/projects/{project_id}/nodes/{node_id}/generate-video
```

Request:

```json
{
  "node_type": "video",
  "input": {
    "prompt": "Turn the keyframe into a cinematic MV shot with a slow push-in.",
    "image_urls": ["https://example.com/keyframe.png"],
    "audio_urls": ["https://example.com/music.mp3"],
    "duration": 6
  },
  "settings": {
    "provider": "evolink",
    "model": "seedance-2.0-reference-to-video",
    "text_to_video_model": "seedance-2.0-text-to-video",
    "quality": "720p",
    "aspect_ratio": "16:9",
    "generate_audio": true
  }
}
```

Response:

```json
{
  "task_id": null,
  "project_id": "project_123",
  "node_id": "video-1",
  "node_type": "video",
  "provider": "evolink",
  "model": "seedance-2.0-reference-to-video",
  "prompt": "Turn the keyframe into a cinematic MV shot with a slow push-in.",
  "image_urls": ["https://example.com/keyframe.png"],
  "audio_urls": ["https://example.com/music.mp3"],
  "duration": 6,
  "duration_seconds": 6,
  "video": {
    "url": "https://example.com/generated-video.mp4",
    "mime_type": "video/mp4",
    "duration_ms": 6000,
    "width": 1280,
    "height": 720,
    "thumbnail_url": "https://example.com/generated-video.jpg"
  },
  "provider_task_id": null,
  "persisted": false
}
```

Validation rules:
- `audio_urls` require at least one `image_url`.
- `image_urls` accepts at most 9 references.
- `audio_urls` accepts at most 3 references.
- `duration` and `duration_seconds` are both accepted request names; duration must be between 1 and 60 seconds.

The backend wrapper is `submitEvolinkVideoWithRetry()` -> `submitEvolinkVideoGenerationOnce()` and posts to the configured Evolink `{EVOLINK_BASE_URL}/videos/generations` endpoint. When `image_urls` are present it uses `seedance-2.0-reference-to-video` by default and sends prompt, image URLs, optional audio URLs, duration, `quality=720p`, `aspect_ratio=16:9`, and `generate_audio=true`. For prompt-only requests it uses `seedance-2.0-text-to-video` by default and sends prompt plus duration.

Video generation currently returns a local playback preview or a provider task id only. This route does not poll provider tasks and does not claim object storage, signed URLs, reusable asset versions, queue workers, Video Library persistence, or generation history writes yet.

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
