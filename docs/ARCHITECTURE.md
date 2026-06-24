# Architecture -- X-META AI Comic / MV Creation Platform

## System Overview
X-META Video is an enterprise AI creation platform for comic-style video and MV production. A user enters a creative request, then the system generates script planning, structured storyboards, characters, props, scenes, audio, video segments, reusable assets, history records, and final exports.

This document is the architecture contract for the repository. Agents should use it to understand data flow, layer ownership, account isolation, task boundaries, and verification scope before implementing features.

Backend route contracts live in `docs/API.md`. Keep route names, request/response shapes, permissions, and task response details there instead of duplicating them in this file.

Core rules:
- The Next.js web app owns user experience, page routing, rendering, local interaction state, and status display.
- Next.js route handlers may act as a thin BFF/proxy layer for the web app, but they must not become the source of truth for domain state.
- The web app never calls model providers directly.
- FastAPI owns authentication, authorization, validation, project state, task creation, and task queries.
- FastAPI remains the final authority for membership, RBAC, project/task/asset/history mutations, and generation orchestration.
- AI generation, media processing, and export rendering always run asynchronously.
- PostgreSQL is the source of truth for accounts, projects, tasks, assets, lineage, and history.
- Object storage stores binary artifacts; PostgreSQL stores metadata and references.
- Every project, asset, task, and history query must respect `user_id`, `org_id`, and usually `project_id`.

## Layer Diagram
```txt
+------------------------------------------------------------------+
|                  Web App (Next.js App Router + React)            |
|  Layouts, Server Components, Route Handlers/BFF, Auth UI,        |
|  AccountSwitcher, ProjectBrowser, WorkflowCanvas, AssetLibrary   |
+------------------------------------------------------------------+
        | HTTPS JSON API + SSE/WebSocket task status updates
        v
+------------------------------------------------------------------+
|                         API Layer (FastAPI)                      |
|  auth, accounts, projects, workflows, assets, tasks, history     |
+------------------------------------------------------------------+
        | service calls with actor context:
        | user_id, org_id, role, request_id, project_id
        v
+------------------------------------------------------------------+
|                         Domain Services                          |
|  Account | Project | Storyboard | Asset | Workflow | Task        |
+--------------------------+---------------------------------------+
        | DB/object refs   | enqueue jobs
        v                  v
+----------------------+   +---------------------------------------+
| PostgreSQL + Storage |   | Redis Queue -> Workers -> Providers   |
| metadata + artifacts |   | ModelGateway: text, image, audio, vid |
+----------------------+   +---------------------------------------+
```

## Application Layers
### Web App (`apps/web`)
Next.js App Router + React frontend with Tailwind CSS, shadcn/ui, and selected UI TripleD shadcn blocks.

Owns:
- Page routing, layouts, metadata, loading states, and SSR/static rendering where useful.
- Thin BFF/proxy route handlers for browser-safe API access to FastAPI.
- Login UX, active organization selection UX, and project navigation UX.
- Workflow canvas for script, storyboard, character, scene, audio, video, and export nodes. Canvas-heavy surfaces should be client components and may use dynamic imports.
- Asset library, task status, version history, preview, export, autosave indicators, and confirmation UI.
- Design-system composition using local shadcn/ui source components first, with UI TripleD shadcn blocks copied and adapted as local source when they fit the product surface.

Must not:
- Store provider keys, storage credentials, or final authorization logic.
- Call Seedream, Seedance, TTS, or any model provider directly.
- Write project, task, asset, history, or membership state directly to PostgreSQL.
- Create generation tasks outside the FastAPI task APIs.
- Treat local state as source of truth after refresh or re-login.
- Import UI TripleD as an opaque runtime dependency or use its Base UI variants without an explicit architecture update.

### API Layer (`services/api`)
Python FastAPI application exposing versioned routes under `/api/v1`.

Route groups and request/response contracts are defined in `docs/API.md`.

Owns:
- Authentication, membership checks, RBAC, Pydantic validation, transactions, task creation, and task queries.
- Actor context resolution: `user_id`, `org_id`, role, request ID, and optional `project_id`.
- Fast responses for generation operations by returning task IDs.

Must not:
- Run long model generation inside request handlers.
- Store raw binary media in database rows.
- Trust frontend-supplied ownership, role, or account fields.
- Mix admin operations with normal project operations.

### Domain Services
Domain services own product rules and state transitions.

| Service | Responsibility |
|---|---|
| `AccountService` | users, organizations, memberships, account routing |
| `ProjectService` | projects, access, autosave checkpoints |
| `StoryboardService` | script, outline, shot list, input versions |
| `AssetService` | asset metadata, asset versions, reuse rules |
| `WorkflowService` | node graph, dependencies, runnable node calculation |
| `TaskService` | task state, retry, cancellation, failure rules |
| `HistoryService` | audit trail, generation attempts, selected outputs |
| `ModelGateway` | provider-neutral model interface |

Rules:
- Services receive actor context and enforce account/project boundaries before writes.
- Services write history when user-visible creative state changes.
- Services use repositories for persistence and do not import React or route objects.

### Persistence, Queue, Worker, and Storage
PostgreSQL stores durable business state. Redis stores queue and short-lived state. Object storage stores binary artifacts. Workers execute long-running jobs.

Worker responsibilities:
- Claim jobs from Redis.
- Load task, project, node input, and exact asset version references.
- Check that the task is still runnable and not cancelled.
- Call ModelGateway, upload artifacts, and write results.
- Mark tasks succeeded or failed through controlled state transitions.

Worker rules:
- Retried jobs must not corrupt existing project state.
- Downstream failures must not delete successful upstream outputs.
- Workers must not expose provider secrets in logs or task payloads.

## Account and Multi-user Boundaries
```txt
User -> Membership -> Organization -> Projects -> Assets / Tasks / History
```

Rules:
- User logs in, then selects active organization/workspace.
- All project, asset, task, and history APIs infer or receive `org_id`.
- Backend validates membership and role on every request.
- Queries must filter by `org_id` and relevant `project_id`.
- Users cannot access assets by guessing IDs.
- Concurrent editors use optimistic concurrency with `version` or `updated_at`.
- Autosave must patch/checkpoint current node state, not overwrite unrelated node outputs.
- Task retry must reference exact `node_id` and input version.

Roles: Owner manages organization/users/billing/all projects; Admin manages users and projects; Editor creates and edits projects and generation tasks; Viewer can view only.

## Full Data Flow
### Account Routing Flow
```txt
1. User logs in through the Next.js web app.
2. API validates identity and creates a session/JWT.
3. Next.js web app requests available organizations/workspaces through FastAPI.
4. User selects the active organization.
5. Project, asset, task, and history requests carry or infer org context.
6. API validates membership and role before returning data.
```

### Universal Generation Flow
```txt
1. User edits a workflow node input.
2. Next.js web app saves the input version through the FastAPI API.
3. User starts generation.
4. API creates a task and enqueues a Redis job.
5. Worker loads the exact input version and asset version references.
6. Worker calls ModelGateway.
7. Worker uploads artifacts to object storage.
8. Worker writes generation attempts, asset versions, task events, and history.
9. Next.js web app receives status updates and reloads normalized outputs.
```

### Product Chain Flow
```txt
Text planning -> character/scene/prop assets -> nine-grid composition
-> audio generation -> video generation -> export rendering.
```

### Asset, History, and Retry Flow
```txt
1. Asset library returns assets visible to the active organization/project.
2. User attaches an exact asset_version_id to a workflow node.
3. User-visible changes write history events.
4. Generations write immutable generation attempts.
5. Refresh or re-login reloads project state, selected versions, active tasks, and history.
6. Retry creates a new task for the target node and input version.
7. Upstream successful outputs remain available; new outputs create new versions.
```

## API Contract Reference
Task types and API response shapes are defined in `docs/API.md`.

Architecture-level rule: generation APIs return task IDs, not final media. Task result APIs return normalized asset and storage references, not provider raw responses.

## Data Storage
```txt
PostgreSQL
  users, organizations, memberships
  projects, project_members
  storyboards, storyboard_versions, workflow_nodes
  assets, asset_versions, storage_objects
  tasks, task_events
  generation_attempts, history_events, model_invocations

Object Storage
  orgs/{org_id}/projects/{project_id}/assets|tasks|exports/...

Redis
  task queue, task progress cache, SSE/WebSocket fanout state, rate limits
```

Persistence rules:
- Every project-owned row includes `org_id` and usually `project_id`.
- Every generated asset records source input, model, provider, parameters, time, and parent task.
- User-facing creative objects use soft delete by default.
- Backend issues short-lived signed URLs for object access.

## Logging
All backend and worker logs should be structured JSON.

Required fields: `timestamp`, `level`, `service`, `message`, `request_id`, `user_id`, `org_id`, `project_id`, `task_id`, and relevant `data`.

Log levels:
- `INFO`: task creation, task completion, user-visible successful actions.
- `WARN`: retryable provider errors, missing optional data, slow calls.
- `ERROR`: failed transactions, permission failures, non-retryable provider errors.
