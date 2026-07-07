# Sprint Contract - Feature 9 Video Node

## Sprint Overview

**Sprint:** feature-9-video-node
**Feature:** Feature 9, Video Node
**Task:** video-node-001
**Status:** passing
**Goal:** Build the first Video node generation path: prompt plus optional upstream images/audio in, local FastAPI video backend request out, and one playable draggable video outcome node on the canvas.

## Write Scope

- `packages/shared-contracts/src/index.ts`
- `services/api/xmeta_api/schemas.py`
- `services/api/xmeta_api/providers.py`
- `services/api/xmeta_api/main.py`
- `services/api/tests/test_video_node.py`
- `apps/web/src/lib/video-node/api.ts`
- `apps/web/src/lib/workflow-canvas/types.ts`
- `apps/web/src/lib/workflow-canvas/graph.ts`
- `apps/web/src/lib/workflow-canvas/graph.test.ts`
- `apps/web/src/components/xmeta/workflow-canvas/workflow-canvas-workspace.tsx`
- `apps/web/src/components/xmeta/workflow-canvas/workflow-canvas-workspace.test.tsx`
- `docs/API.md`
- `feature_tasks/9.json`
- `feature_list.json`
- `sprint-contract.md`
- `evaluator-rubric.md`
- `progress.md`
- `session-handoff.md`
- `.env`
- `.env.example`

Protected boundaries:

- Feature 5 text-to-image is already in progress with uncommitted edits in shared contracts, FastAPI provider/schema/main, and workflow canvas files. Video changes must be additive and must not remove, rename, or alter SeedDream behavior.
- Feature 8 text-to-music/audio has an in-progress sprint contract and dirty `music-node`/MiniMax changes. Video changes must preserve current Audio node APIs, audio output rendering, and MiniMax config.
- Do not move provider secrets into frontend code, committed docs, tests, or final notes.
- Do not claim durable asset persistence, object storage, signed URLs, queue workers, task polling, Video Library persistence, or export rendering.
- Keep the backend boundary local: the web app calls FastAPI only. Provider-specific Seedance/Evolink details stay in backend provider code and env config.
- Preserve unrelated working-tree edits and existing dirty state.

## In Scope

- Add shared video-generation request/response contracts for `video` nodes.
- Add a FastAPI video-generation route under the local backend boundary.
- Support the repository-local path `POST /api/v1/projects/{project_id}/nodes/{node_id}/generate-video`; document compatibility with the user's provided `POST /api/generate-video` payload shape at the backend/provider boundary.
- Add Evolink/Seedance provider configuration using `EVOLINK_BASE_URL`, `EVOLINK_API_KEY`, `EVOLINK_VIDEO_MODEL`, `EVOLINK_TEXT_TO_VIDEO_MODEL`, `EVOLINK_VIDEO_QUALITY`, `EVOLINK_VIDEO_ASPECT_RATIO`, `EVOLINK_GENERATE_AUDIO`, `EVOLINK_VIDEO_TIMEOUT_SECONDS`, and `EVOLINK_VIDEO_MAX_RETRIES`.
- Implement backend Evolink video wrapper functions that post to `/videos/generations`, use `seedance-2.0-reference-to-video` when images are present, and use `seedance-2.0-text-to-video` for prompt-only fallback.
- Add a Video node editor for prompt and duration.
- Seed prompt, image URLs, and audio URLs from connected upstream outcome nodes when available; preserve manual editing.
- Create or update one deterministic video outcome node on success with one `video` output port.
- Render playback controls from returned video URL without implying durable storage.
- Label no-persistence and unavailable future capabilities honestly.
- Add focused backend and frontend tests for config, route response shape, provider payloads, output-node creation, video preview rendering, and unsupported/missing capabilities.

## Out of Scope

- Polling async provider tasks to completion if the backend/provider returns only a task ID without a playable URL.
- Durable project/workflow persistence, production auth, object storage, signed URLs, asset versioning, queue workers, task polling, and history timeline writes.
- Full Video Library management.
- Image generation, audio generation, export rendering, and existing Feature 5/8 behavior changes.
- Mobile UI polish.

## Acceptance Criteria

1. Video source nodes can open a video editor and generate from prompt plus duration.
2. Connected upstream image/audio outcome nodes can seed Video inputs without silently overwriting user edits.
3. Generate sends a browser-safe request to the local FastAPI backend; frontend code never calls Evolink or Seedance directly.
4. Backend provider configuration resolves Evolink/Seedance values from environment and fails clearly when required config is missing.
5. The provider wrapper posts to the configured Evolink `/videos/generations` endpoint with reference-to-video when images are present and text-to-video when only prompt is available.
6. A successful video generation creates or updates one Video outcome node on the canvas with provider/model metadata and one output port.
7. The Video outcome node renders `<video controls>` from a returned playable URL and clearly labels local-preview/no-persistence limits.
8. Buttons or functions that are not implemented are explicitly labeled through visible messages.
9. Tests cover backend route/provider behavior and frontend Video-node generation/output rendering.
10. Verification includes backend tests, web tests, typecheck/build, and an end-to-end browser or equivalent rendered interaction check.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | Confirmed `D:\X-META-Video`, read `AGENTS.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `feature_list.json`, `feature_tasks/9.json`, current handoff/progress/API docs, and recent commits. |
| Startup | `.\init.ps1` passed before implementation and reran web tests: 9 files / 48 tests. |
| Git review | Recent commits are short descriptive entries ending at `48dd27e Simplify workflow node cards`; current branch is ahead of `origin/main` by 4 commits and has Feature 5/8 uncommitted edits. |
| Planning | Scope is constrained to Video node local-backend generation, one playable outcome node, and additive backend/provider contracts. Feature 5 text-to-image and Feature 8 audio remain protected parallel dirty workstreams. |
| Implementation | Added shared Video generation contracts, FastAPI Evolink/Seedance config/provider/route/tests, a web video-node API helper, Video source-node editor, connected prompt/image/audio input collection, and a standalone playable Video outcome node. |
| Environment | Added non-secret Evolink/Seedance video settings to `.env` and `.env.example`; `EVOLINK_API_KEY` remains empty for local secret entry. |
| Verification | Passed backend video tests (9), full backend tests (50), API ruff, focused workflow canvas tests (26), full web tests (51), web typecheck, web build, and Playwright Chrome E2E on `/workspace`. |
| Rendered QA | Playwright E2E intercepted the local FastAPI `/generate-video` request, verified payload `{ node_type: "video", input: { prompt, duration, image_urls, audio_urls } }`, and confirmed one Video outcome node, one `<video controls>` player, backend evidence, no-persistence label, and no console errors. |

## Feature 8 Audio Completion Addendum

This file is currently owned by the parallel Feature 9 Video planning sprint. To avoid overwriting that work, the completed Feature 8 Audio node evidence is recorded here as an addendum.

**Feature:** Feature 8, Audio Node
**Task:** text-to-music-audio-node-001
**Status:** passing
**Goal achieved:** Users can use a Script-style inline Audio composer for music style text plus lyrics, send generation through local FastAPI, and receive one draggable playable Audio outcome node with backend-confirmed `minimax / music-2.6-free` evidence.

Completed:

- Added shared MiniMax music-generation contracts in `packages/shared-contracts/src/index.ts`.
- Added FastAPI schemas, provider settings, retry wrapper, response normalization, and `POST /api/v1/projects/{project_id}/nodes/{node_id}/generate-audio`.
- Added `apps/web/src/lib/music-node/api.ts`, which calls only the local FastAPI backend.
- Extended workflow media output to support `audio` without changing SeedDream image semantics.
- Added a Script-style inline Audio composer for style prompt and lyrics, including connected upstream Script/Storyboard text seeding.
- Added deterministic Audio outcome node creation with one `audio` output port and browser `<audio controls>` playback.
- Added `.env.example` and gitignored `.env` MiniMax music config keys with `MINIMAX_MUSIC_MODEL=music-2.6-free`; no secret value was printed.
- Labeled Audio previews as local only; persistence, signed URLs, queues, task polling, Audio Library, and durable storage remain later scope.

Verification:

- Baseline `.\init.ps1` passed before implementation: 9 web test files / 43 tests.
- `.\.venv\Scripts\python.exe -m ruff check services\api` passed.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests\test_music_node.py` passed: 8 tests.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests\test_script_node.py services\api\tests\test_image_node.py services\api\tests\test_music_node.py` passed: 41 tests.
- `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx graph.test.ts` passed: 2 files / 29 tests.
- `corepack pnpm --filter @xmeta/web test` passed: 9 files / 48 tests.
- `corepack pnpm --filter @xmeta/web typecheck` passed.
- `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
- Browser E2E passed on `http://localhost:3000/workspace` using a temporary local fake backend on 8000: Add Audio, fill style/lyrics, Generate, one playable Audio outcome node, `Backend: minimax / music-2.6-free`, no-persistence label, drag moved the outcome node from `860px/520px` to `950px/570px`, and console warn/error logs were empty.
- Final `.\init.ps1` passed after artifact updates and reran web tests: 9 files / 48 tests.
- Audio inline composer follow-up passed: focused workflow tests 2 files / 32 tests, web typecheck, browser QA on `http://localhost:3000/workspace` confirming `data-music-node-inline-editor` under the Audio node and no `data-music-node-editor`, and final `.\init.ps1` rerunning 9 files / 51 tests.

Residual risks:

- Browser E2E used a temporary local fake MiniMax-compatible backend; live MiniMax account, quota, proxy, and generated-audio URL expiry behavior still need environment validation with a real `MINIMAX_API_KEY`.
- Current generation is synchronous local preview only, following the current image-node MVP pattern. The architecture target remains async task creation plus persisted storage.
- Feature 9 Video planning is active in this same file; preserve the Feature 8 code and artifact evidence when continuing Video work.

## Protected Completion Addendum - Feature 5 Text-to-Image Graph Foundation

This addendum records the completed Feature 5 work without overwriting the active Feature 9 Video Node sprint contract above. Video work must preserve the SeedDream image contracts, route, wrappers, and image outcome-node behavior.

### Feature 5 Scope

- Feature: Feature 5, Character Image Node.
- Task: `text-to-image-nodes-001`.
- Status: passing.
- Goal: Build the reusable text-to-image graph foundation for Character Image, Prop / Asset, and Scene Image source nodes, using the local backend SeedDream path and producing one image outcome node.

### Feature 5 Acceptance Evidence

1. Character Image, Prop / Asset, and Scene Image source nodes open the shared image editor with prompt defaults.
2. Generate calls the local FastAPI backend; the web client never calls Doubao directly or exposes credentials.
3. Backend SeedDream config uses `DOUBAO_API_KEY`, `DOUBAO_BASE_URL`, `SEEDREAM_MODEL`, and optional `DOUBAO_HTTPS_PROXY`.
4. Provider code exposes the required `submitSeedreamWithRetry()` to `submitSeedreamGenerationOnce()` wrapper chain.
5. Successful generation creates or updates one deterministic image outcome node with preview media, provider/model metadata, and one output port.
6. Image output is labeled as local preview only; asset-library persistence, signed URLs, task history, and queue workers remain future scope.
7. Unavailable image functions such as AI modify and Image Composition generation show visible not-implemented messages.
8. Evaluator accepted the scope at 140 / 150.

### Feature 5 Verification

| Phase | Outcome |
| --- | --- |
| Baseline | `.\init.ps1` passed before implementation and reran web tests: 9 files / 43 tests. |
| Backend focused | `.\.venv\Scripts\python.exe -m pytest services\api\tests\test_image_node.py` passed: 8 tests with one Starlette warning. |
| Backend full | `.\.venv\Scripts\python.exe -m pytest services\api\tests` passed during implementation: 33 tests with one Starlette warning; final closure passed 41 tests after parallel media tests appeared. |
| API lint | `.\.venv\Scripts\python.exe -m ruff check services\api` passed. |
| Web focused | `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx` passed after final UI boundary update: 1 file / 22 tests. |
| Web full | `corepack pnpm --filter @xmeta/web test` passed during implementation: 9 files / 45 tests; final closure passed 9 files / 48 tests after parallel media tests appeared. |
| Typecheck | `corepack pnpm --filter @xmeta/web typecheck` passed. |
| Build | `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`. |
| Browser E2E | Passed on `http://127.0.0.1:3002/workspace` with FastAPI on 8011 and fake SeedDream on 8899: Add Scene Image, Generate, one loaded image outcome node, provider/model evidence visible, local-preview/no-asset-library label visible, no console warn/error logs, and selecting the outcome did not reopen a source editor. |
| Final startup | `.\init.ps1` passed after artifact updates and reran web tests: 9 files / 48 tests. |
| UI follow-up | Image node AI editor was aligned with the Script below-node inline composer pattern. Focused workspace test passed 1 file / 26 tests, full web tests passed 9 files / 51 tests, typecheck passed, build passed with `/workspace`, and Browser QA on `http://127.0.0.1:3002/workspace` confirmed the inline editor renders inside the canvas stage below Image Composition with no floating drag/resize controls and no console warn/error logs. |
