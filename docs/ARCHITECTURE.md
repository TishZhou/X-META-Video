# X-META Video Architecture

## Architecture Contract

X-META separates user-authored workflow state from model execution. The web app owns canvas interaction; FastAPI owns trusted request boundaries; Agent Runtime executes one explicit Node Task; providers own model-specific I/O; persistence services own durable state.

Backend route shapes belong in `docs/API.md`. This document defines ownership and data flow.

```txt
Canvas Node (`node.kind`, `node.taskId`, input Artifact IDs)
  -> FastAPI Router
  -> AgentRuntime
  -> TaskProfile registry
  -> Text | Image | Audio | Video NodeExecutor
  -> Model Provider
  -> typed Validator
  -> Artifact / Task result
```

## Layer Boundaries

| Layer | Owns | Must not own |
| --- | --- | --- |
| Web (`apps/web`) | Canvas state, explicit Task selection, connections, previews, status and approval UI | Provider credentials, final authorization, model calls, durable truth |
| Router (`services/api/xmeta_api/main.py`) | HTTP parsing, authentication/authorization boundary, request validation, dependency construction, status/error mapping | Prompt composition, creative rules, retries, provider payloads |
| Agent Runtime | Task lookup, allowed memory selection, prompt compilation, strategy dispatch, Node execution and output validation | Canvas mutation, hidden Task/model selection, HTTP concerns, durable binary storage |
| Provider / Model Gateway | Credentials, provider payloads, timeouts, provider retries and response normalization | Workflow topology, product Task meaning, project authorization |
| Domain services | Workflow, Task, Artifact, project and history state transitions | Route objects, frontend state, provider-specific payloads |
| Persistence / workers | PostgreSQL metadata, object storage binaries, queued execution and progress | Product decisions or unapproved downstream execution |

Routes currently live together in `xmeta_api/main.py`. They may later be split into focused `routers/` modules, but routers stay thin and always delegate Task behavior to Runtime/domain services.

## Four-Node Agent Runtime

`services/api/xmeta_api/agent_runtime/runtime.py` is the single facade used by FastAPI. It resolves a registered profile and delegates to exactly one executor:

```txt
agent_runtime/
  runtime.py                 # facade and dispatch boundary
  contracts.py               # NodeKind, TaskId, TaskProfile, memory/prompt/validator IDs
  profiles.py                # registered Task definitions
  registry.py                # registration and lookup
  compiler.py / prompts.py   # typed prompt construction
  memory.py                  # allowed project-memory read boundary
  validators.py / retry.py   # output checks and bounded task retry
  nodes/
    text.py
    image.py
    audio.py
    video.py
```

The four `NodeKind` values are `text`, `image`, `audio`, and `video`. Product steps such as storyboard, character, scene, composition, or clip generation are Task identities within those kinds, not new Runtime Node types.

## Task Model

The architecture distinguishes four records:

| Concept | Meaning | Source of truth |
| --- | --- | --- |
| `TaskId` | Stable business operation, for example `image.character.generate` | `agent_runtime/contracts.py` |
| `TaskProfile` | Node kind, required inputs, allowed memory, prompt, output type, validator, retry/strategy contract | `agent_runtime/profiles.py`, resolved by `registry.py` |
| Node Task selection | The Task chosen for one canvas Node | `node.taskId` in persisted workflow-node state |
| `TaskRun` | One execution attempt with project/node/input versions, status, provider/model, cost/error and output references | Target: `TaskService` and PostgreSQL `tasks` / `task_events` |

Profiles define capability; they never contain user run history or generated media. Unknown or disabled `taskId` values fail closed. Runtime verifies that the selected profile matches the Node kind and connected input types before execution.

## Execution Strategies

The target `TaskProfile` contract supports:

```txt
direct         input -> prompt -> provider -> validator -> Artifact
pipeline       fixed engineering steps -> provider call(s) -> validator -> Artifact
bounded_agent  approved tools + max steps/cost/retries -> validator -> Artifact
```

Most media Tasks are `direct`. Storyboard structure, deterministic repair, and batch fan-out are `pipeline`. `bounded_agent` is reserved for Tasks whose steps cannot be fixed safely in advance; it cannot change `taskId`, graph edges, provider spend, or approval state. These strategies are the target contract and are not yet fully implemented in the current profile schema.

One-click generation is a versioned Workflow Preset: a deterministic DAG of visible Nodes, Tasks, edges, approval gates, and fan-out rules. Runtime still executes one explicit Task at a time; it is not a free-form workflow planner in Phase 1.

## Runtime Data Flow

```txt
1. Router receives project ID, node ID, selected Task and input references.
2. Runtime loads the TaskProfile from the registry.
3. Runtime resolves connected inputs and only the memory scopes allowed by that profile.
4. PromptCompiler produces a versioned provider-neutral prompt.
5. The matching NodeExecutor invokes the injected provider operation.
6. Validator checks the declared output contract; bounded repair/retry runs only if configured.
7. TaskService records the attempt and ArtifactService stores output metadata and lineage.
8. Binary media is uploaded to object storage; the API returns normalized references and status.
```

Artifacts use immutable versions. PostgreSQL stores identity, lineage, source input versions, provider/model/prompt parameters, timestamps, and object references; object storage holds image, audio, and video binaries. Downstream Nodes reference exact Artifact version IDs rather than copy media or search by display name.

## Current Implementation vs Target

The current repository has the Runtime facade, four executors, ten Task Profiles, prompt compilation, typed validation, provider adapters, and an empty replaceable `ProjectMemoryReader`.

Important Phase 1 gaps remain:

- Routes are still defined directly in `main.py`; authentication, RBAC, focused routers, and durable domain services are not implemented.
- Current endpoints derive a Task from a request enum or a fixed media profile; general `node.taskId` persistence and dispatch are not implemented yet.
- Only the legacy Script path creates Task state, stored process-locally in `xmeta_api/store.py`; restart loses it.
- Text, image, audio, and video generation currently execute in the request path. Media responses are synchronous/provider-task responses and explicitly return `persisted=false`.
- The current process-local Memory boundary uses `EmptyProjectMemoryReader` and returns no entries. Approved durable memory and exact asset-version retrieval do not exist yet.
- `TaskService`, Redis workers, PostgreSQL Task/Artifact tables, object storage, durable Workflow state, and the one-click preset orchestrator are target architecture, not current capability.

No UI or API should imply these missing layers are production-ready.

## Durable Platform Boundary

The production path is:

```txt
Router -> TaskService -> PostgreSQL TaskRun -> Redis queue -> Worker
       -> AgentRuntime -> Provider -> Validator
       -> object storage + PostgreSQL Artifact metadata -> status event
```

Workers load exact workflow, input, memory, and Artifact versions; retry creates a new attempt without deleting successful upstream output. Every project-owned row and object reference carries `user_id`, `org_id`, and `project_id` scope. API and worker logs include request/task/project identifiers but never provider secrets or raw private media.

## Phase Boundaries

Phase 2 adds durable Assets, LoRA provider/model variants, and a 3D character/world adapter behind existing Runtime and storage boundaries. Phase 3 adds music/voice providers plus an IP operations assistant and community workflows; publishing, campaigns, approvals, and other consequential actions remain human-in-the-loop.
