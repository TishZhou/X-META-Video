# Sprint Contract - Feature 3 Script Node

## Sprint Overview

**Sprint:** feature-3-script-node-io-contract
**Feature:** Feature 3, Script Node
**Status:** passing
**Goal:** Implement a verified Script Node workflow where users enter one MV world-view description through the AI chat UI, run generation through backend API contracts, and review structured storyboard direction, character profiles, and scene descriptions while prompt wording remains centrally adjustable.

## Write Scope

- `packages/shared-contracts/**`
- `services/api/**`
- `apps/web/src/components/xmeta/workflow-canvas/**`
- `apps/web/src/components/uitripled/ai-chat-interface-shadcnui.tsx`
- `apps/web/src/lib/workflow-canvas/**`
- `apps/web/src/lib/script-node/**`
- `apps/web/package.json`
- Root and web environment examples
- `docs/API.md`
- Focused tests for changed backend/frontend/shared behavior
- `feature_tasks/3.json`
- `feature_list.json`
- `sprint-contract.md`
- `evaluator-rubric.md`
- `progress.md`
- `session-handoff.md`

Protected user edit:

- `AGENTS.md` is already modified and must not be reverted.

## In Scope

- Stable Script Node input, output, and task contracts.
- Single-input `world_description` contract for the first MV world-view prompt.
- Structured Script Node output split into storyboard direction, character profiles, and scene descriptions.
- FastAPI routes for saving Script Node input, creating a generation task, reading task status, and reading structured results.
- Server-owned prompt builder and provider adapter boundary.
- Mock script provider as the default end-to-end verification path.
- OpenAI-compatible provider settings read from server-only environment variables.
- `/workspace` Script Node editor for desktop input, run state, and structured output tabs.
- Honest labels for mock provider, dev in-memory backend state, deferred production auth, and deferred downstream media generation.

## Out of Scope

- Final prompt quality tuning.
- Production auth and multi-user workspace management.
- Durable PostgreSQL task/workflow persistence beyond the minimal API scaffold.
- Worker queue execution, object storage writes, generated media assets, and history timeline persistence.
- Separate editable Storyboard Node implementation.
- Image, audio, video, export, or asset library generation.

## Acceptance Criteria

1. Script input and output contracts exist in shared TypeScript and FastAPI/Pydantic equivalents.
2. Root environment example exposes `SCRIPT_MODEL_PROVIDER`, `SCRIPT_MODEL_BASE_URL`, `SCRIPT_MODEL_API_KEY`, `SCRIPT_MODEL_NAME`, `SCRIPT_MODEL_TIMEOUT_SECONDS`, and `SCRIPT_MODEL_MAX_RETRIES`.
3. `PATCH /api/v1/projects/{project_id}/nodes/{node_id}` validates and saves Script Node input/settings.
4. `POST /api/v1/projects/{project_id}/nodes/{node_id}/run` returns a task response and generates schema-valid mock output.
5. `GET /api/v1/tasks/{task_id}` and `GET /api/v1/tasks/{task_id}/result` return task status and normalized Script Node output.
6. Non-mock provider selection fails clearly when required provider env values are missing.
7. Selecting the Script node in `/workspace` opens an editor with one AI chat-style MV world description input and a run action.
8. Successful generation renders Overview, Storyboard, Characters, and Scenes tabs.
9. The Script node status changes to `ready` only after validated output exists.
10. Verification evidence is recorded in `feature_list.json`, `sprint-contract.md`, `evaluator-rubric.md`, `progress.md`, and `session-handoff.md`.

## Verification Plan

1. Baseline: `.\init.ps1` before implementation.
2. Backend tests: run pytest under `services/api`.
3. Frontend tests: `corepack pnpm --filter @xmeta/web test`.
4. Typecheck: `corepack pnpm --filter @xmeta/web typecheck`.
5. Build: `corepack pnpm --filter @xmeta/web build`.
6. Browser QA: desktop `/workspace` Script Node input-to-output flow with FastAPI mock provider running.
7. JSON validation: parse `feature_list.json` and `feature_tasks/3.json`.
8. Whitespace check: `git diff --check`.
9. Final restart path: `.\init.ps1`.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Revised workflow | User clarified the Script Node workflow: one MV world-view description input, then AI expands into storyboard direction/POV/shots, character profiles with style/wardrobe/body details, and concrete scene descriptions derived from characters plus storyboard. |
| Revised implementation | Updated shared contracts, FastAPI/Pydantic schemas, prompt builder, deterministic mock provider, backend tests, workspace editor, AI chat component props, output tabs, and API docs for the single-input MV workflow. |
| Revised verification | Backend pytest passed 5 tests with one upstream Starlette TestClient deprecation warning; backend ruff passed; focused workspace test passed 1 file / 5 tests; full web tests passed 9 files / 29 tests; `corepack pnpm --filter @xmeta/web typecheck` passed; `corepack pnpm --filter @xmeta/web build` passed. |
| Revised Browser QA | Production Browser QA on `http://127.0.0.1:3000/workspace` passed: AI chat-style MV world description input visible, `Generate` called PATCH/run/task/result endpoints with 200/202/200/200, Script node became `ready`, Overview/Storyboard/Characters/Scenes tabs rendered, no console errors, no failed requests, no horizontal overflow, and no misleading media-generation claim. |
| Revised final closure | `feature_list.json` and `feature_tasks/3.json` parsed successfully; `git diff --check` passed with line-ending warnings only; final `.\init.ps1` passed and reran web tests: 9 files / 29 tests. |
| Baseline | Confirmed working directory `D:\X-META-Video`; read `AGENTS.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `feature_list.json`, `progress.md`, `feature_tasks/3.json`, `sprint-contract.md`, and `evaluator-rubric.md`. |
| Startup | `.\init.ps1` passed before implementation and reported 9 web test files / 28 tests. |
| Recent commits | Reviewed `git log --oneline -5`: `5a8bb3a`, `f4931d0`, `c817efc`, `2a23d74`, and `f01d7b6`. |
| Skill setup | Used shadcn, uiux-design-evaluator, and React best-practices guidance for the frontend implementation. |
| Subagents | Spawned backend worker subagent for the `services/api/**` implementation slice with a disjoint write set. |
| Contracts | Added shared TypeScript Script Node input, settings, output, task, and default input contracts in `packages/shared-contracts/src/index.ts`; documented Script Node request/output and `SCRIPT_MODEL_*` provider env values in `docs/API.md` and `.env.example`. |
| Backend implementation | Added FastAPI Script Node PATCH/run/task/result routes, Pydantic schemas, in-memory dev node/task/result store, centralized prompt builder, deterministic mock provider, OpenAI-compatible provider config validation, CORS for frontend origins, and backend tests. |
| Frontend implementation | Added `/workspace` selected Script node editor with the AI chat-style MV world input, FastAPI save/run/status/result client, task state display, structured output tabs, and ready/blocked/running node status updates. |
| Backend verification | Bundled Python setup installed `services/api[dev]`; `python -m pytest services/api/tests` passed 5 tests with one upstream Starlette TestClient deprecation warning; `python -m ruff check services/api` passed. |
| Frontend verification | Focused workspace tests passed 2 files / 10 tests; full web tests passed 9 files / 29 tests; `corepack pnpm --filter @xmeta/web typecheck` passed; `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`. |
| Browser QA | Production Browser QA on `http://127.0.0.1:3000/workspace` passed for the original implementation. Revised MV-world Browser QA must verify the AI chat input, `Generate` action, Overview/Storyboard/Characters/Scenes tabs, no console errors, no failed requests, no horizontal overflow, and no misleading media-generation claim. |
| Final closure | `feature_list.json` and `feature_tasks/3.json` parsed successfully; `git diff --check` passed with line-ending warnings only; final `.\init.ps1` passed and reran web tests: 9 files / 29 tests. |
