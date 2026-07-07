# Evaluator Rubric - Feature 9 Video Node

Updated: 2026-07-07

## Evaluation Scope

- Role: Evaluator subagent for Feature 9 `video-node-001`.
- Scope reviewed: shared video contracts, FastAPI video schemas/provider/route, web Video node API helper, workflow graph ports/media output, Video editor/outcome rendering, API/env docs, Feature 9 task/status artifacts, and current dirty diff limited to Video-relevant behavior.
- Acceptance target: over 140 / 150.
- Protected parallel workstreams: Feature 5 text-to-image and Feature 8 audio changes were left untouched.

## Scorecard

| Criterion | Points | Current | Evidence |
| --- | ---: | ---: | --- |
| Scope fit and isolation | 20 | 20 | Video changes are additive and preserve the existing image/audio surfaces in shared backend/frontend files. Dirty Feature 5/8 files were not reverted. |
| Shared contracts and backend API | 30 | 29 | `VideoGenerationRequest/Response` contracts, Pydantic schemas, route `POST /api/v1/projects/{project_id}/nodes/{node_id}/generate-video`, duration/media validation, and backend provider/model evidence are present. |
| Evolink/Seedance provider behavior | 30 | 28 | Env-backed `EvolinkVideoProviderSettings`, missing-config errors, retry behavior, `/videos/generations` URL building, reference-to-video payload, text-to-video payload, URL extraction, and task-id-only normalization are covered by tests. Live Evolink execution is not verified because the key is intentionally empty. |
| Frontend Video workflow | 30 | 27 | Video source nodes collect connected prompt/image/audio inputs, use the local FastAPI helper only, expose prompt/duration controls, and create/update one deterministic playable Video outcome when a URL is returned. A task-id-only backend response is labeled in the editor, but the generation handler still marks the source ready and upserts an outcome node with no playable URL, so that async-provider edge needs a follow-up. |
| UI truthfulness and missing capability labels | 15 | 14 | Video preview and outcome labels state local preview/no persistence and task polling is not implemented. Future storage, signed URLs, Video Library, queue workers, and task polling are not claimed. |
| Verification depth | 20 | 19 | Evaluator reran focused backend test, focused canvas test, and web typecheck successfully. Existing artifacts record full API tests, ruff, full web tests, web build, and Playwright rendered E2E. Evaluator did not rerun browser E2E in this pass. |
| Artifact and repo hygiene | 5 | 4 | `feature_list.json`, `feature_tasks/9.json`, `progress.md`, and `session-handoff.md` record Feature 9 as passing with evidence. `sprint-contract.md` still has top-level Feature 9 status `in_progress`; evaluator write scope forbids fixing it here. |

Current score: 141 / 150

## Pass/Fail Criteria

| Criterion | Result | Notes |
| --- | --- | --- |
| Video source nodes open a Video editor and generate from prompt/duration | Pass | Editor exposes prompt and numeric duration. Frontend validates duration range before request. |
| Connected upstream image/audio outcome nodes seed Video inputs without overwriting manual edits | Pass | `getConnectedVideoInputs()` collects connected prompt/image/audio sources, while manual prompt state remains user-controlled. |
| Frontend sends browser-safe local FastAPI request only | Pass | `apps/web/src/lib/video-node/api.ts` posts to `/api/v1/.../generate-video`; static scan found no Evolink endpoint or secret key usage in frontend code. |
| Backend resolves Evolink/Seedance config and fails clearly when required config is missing | Pass | Missing API key returns 503 detail naming `EVOLINK_API_KEY` without leaking secret values. |
| Provider posts reference-to-video for images and text-to-video for prompt-only | Pass | Focused provider tests assert both payload shapes and endpoint URL. |
| Successful playable generation creates or updates one Video outcome node with one video output port | Pass | Tested and E2E-recorded for returned playable URL. Task-id-only response needs follow-up so an empty ready outcome is not created. |
| Video outcome renders `<video controls>` from returned playable URL and labels no persistence | Pass | Focused test asserts video player, backend evidence, and no-persistence copy. |
| Unimplemented future capabilities are labeled honestly | Pass | UI labels no persistence and missing task polling. |
| Tests cover backend route/provider and frontend generation/output rendering | Pass | Backend focused tests and workflow canvas tests cover the target behavior. |
| Verification includes backend, web, typecheck/build, and rendered interaction | Pass with caveat | Evaluator reran focused backend/web/typecheck. Existing task/handoff evidence records build and Playwright E2E; evaluator did not rerun E2E. |

## Evaluator Verification Evidence

- `pwd` confirmed `D:\X-META-Video`.
- Read `AGENTS.md`, `sprint-contract.md`, `feature_tasks/9.json`, existing `evaluator-rubric.md`, `docs/ARCHITECTURE.md`, and `C:\Users\AI\.codex\skills\verify\SKILL.md`.
- Inspected Video-relevant dirty diff and symbols across shared contracts, FastAPI schemas/provider/route, web API helper, workflow graph/types, canvas component/tests, docs/API, Feature 9 task state, and feature list.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests\test_video_node.py` passed: 9 tests, 1 existing Starlette deprecation warning.
- `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx` passed: 1 file / 26 tests.
- `corepack pnpm --filter @xmeta/web typecheck` passed.
- Static scan found Evolink/Seedance provider endpoint/config keys only in backend docs/env docs and UI labels, not as frontend provider calls.

## Recorded Main-Agent Evidence Reviewed

- `feature_tasks/9.json`, `progress.md`, and `session-handoff.md` record: full API pytest passed 50 tests, API ruff passed, full web tests passed 9 files / 51 tests, web build passed and included `/workspace`.
- Recorded Playwright Chrome E2E on `http://localhost:3000/workspace` passed with local `/generate-video` route interception: Add Video, open Video editor, Generate, one playable Video outcome node, one `<video controls>` player, backend evidence, no-persistence label, and no console errors.

## Open Risks

- Live Evolink account, quota, proxy, response shape, URL expiry, and real media playback were not validated because `EVOLINK_API_KEY` is empty.
- If Evolink returns only a provider task id, the editor labels missing task polling, but `generateVideoNode()` still marks the source ready and upserts an outcome node whose media URL is null. This should be changed before relying on async/task-only provider responses.
- `sprint-contract.md` top-level status still says `in_progress` for Feature 9. The main agent should close that artifact because this evaluator pass may write only `evaluator-rubric.md`.
- The architecture target remains async task creation plus persisted assets; Feature 9 intentionally ships a synchronous local preview MVP and labels persistence/task polling as deferred.

## Verdict

Accepted at 141 / 150 for the sprint implementation threshold. Before final session closure, the main agent should update `sprint-contract.md` from `in_progress` to passing/accepted and decide whether to fix the task-id-only empty outcome edge now or defer it explicitly to the task-status feature.

## Main-Agent Follow-Up

- `sprint-contract.md` top-level status was updated to `passing`.
- The task-id-only Video response edge was fixed after evaluator review: `generateVideoNode()` now stores the provider response for the editor, marks the source node blocked with an explicit task-polling notice, and returns without creating an empty unplayable Video outcome node when `result.video.url` is missing.
- Added focused test coverage for task-id-only Video responses so the editor shows `data-video-provider-task="true"` and does not render `data-generated-video-preview="true"`.
- Follow-up verification passed:
  - `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx`: 1 file / 27 tests.
  - `corepack pnpm --filter @xmeta/web typecheck`.
  - `corepack pnpm --filter @xmeta/web build`.

Post-follow-up assessment: accepted. The live Evolink/provider-account caveat remains until a real `EVOLINK_API_KEY` is configured and exercised.

---

# Evaluator Rubric - Feature 5 Text-to-Image Graph Foundation

Updated: 2026-07-07

## Evaluation Scope

- Role: Evaluator subagent for Feature 5 `text-to-image-nodes-001`.
- Scope reviewed: shared image-generation contracts, FastAPI SeedDream provider wrappers and route, workflow canvas image editor/output-node behavior, frontend API client, API/env docs, and task/status artifacts.
- Acceptance target: Character Image, Prop / Asset, and Scene Image source nodes can generate one image outcome node from text prompts through the local backend SeedDream path, while unavailable adjacent image functions and missing asset persistence are labeled honestly.

## Scorecard

| Criterion | Points | Current | Evidence |
| --- | ---: | ---: | --- |
| Scope fit / Feature 5 isolation | 25 | 25 | Shared text-to-image foundation is scoped to Character Image first, with Prop / Asset and Scene Image reuse; image-to-video and durable asset persistence remain out of scope. |
| Backend API + SeedDream wrapper behavior | 35 | 31 | Local FastAPI route, SeedDream env config, retry wrapper chain, provider tests, response normalization, and missing-config errors are covered. Live Doubao execution remains an integration risk because tests used mocked/fake providers. |
| Frontend node workflow + UI truthfulness | 35 | 31 | Character, asset, and scene source nodes expose the shared editor; Generate calls backend; AI modify and composition generation show visible not-implemented messages. |
| Outcome node creation + metadata evidence | 25 | 24 | Successful generation creates one deterministic image outcome node with image preview, provider/model evidence, and no-persistence labeling. |
| Verification depth | 25 | 25 | Backend focused/full tests, API lint, frontend focused/full tests, typecheck, build, and Browser E2E with fake SeedDream all passed. |
| Repo hygiene / residual warnings | 5 | 4 | Starlette warning remains non-blocking; parallel Feature 8/9 media edits are present in the dirty worktree and were not overwritten. |

Current score: 140 / 150

## Acceptance Evidence

- `packages/shared-contracts/src/index.ts` defines image-generation contracts for `character_image`, `prop_asset`, and `scene_image`.
- `services/api/xmeta_api/schemas.py`, `services/api/xmeta_api/providers.py`, and `services/api/xmeta_api/main.py` add the local image-generation request/response contract, SeedDream provider settings, required `submitSeedreamWithRetry()` to `submitSeedreamGenerationOnce()` wrapper chain, and the FastAPI route.
- `.env.example` and gitignored `.env` include SeedDream configuration keys: `IMAGE_MODEL_PROVIDER=doubao-seedream`, `DOUBAO_BASE_URL`, `DOUBAO_API_KEY`, `DOUBAO_HTTPS_PROXY`, `SEEDREAM_MODEL`, `SEEDREAM_SIZE`, `SEEDREAM_RESPONSE_FORMAT`, `SEEDREAM_WATERMARK`, `SEEDREAM_TIMEOUT_SECONDS`, and `SEEDREAM_MAX_RETRIES`.
- `apps/web/src/lib/image-node/api.ts` calls only the local FastAPI backend. Frontend code does not expose Doubao credentials.
- `apps/web/src/components/xmeta/workflow-canvas/workflow-canvas-workspace.tsx` applies the shared image editor to Character Image, Prop / Asset, and Scene Image nodes; successful generations create/update one image outcome node with a preview and provider/model metadata.
- `docs/API.md`, `feature_tasks/5.json`, and this rubric record that image previews are local only and not yet persisted into an asset library.

## Verification Evidence

- Baseline `.\init.ps1` passed before implementation and reran web tests: 9 files / 43 tests.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests\test_image_node.py` passed: 8 tests with one Starlette warning.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests` passed during implementation: 33 tests with one Starlette warning.
- `.\.venv\Scripts\python.exe -m ruff check services\api` passed.
- `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx` passed after final UI boundary update: 1 file / 22 tests.
- `corepack pnpm --filter @xmeta/web test` passed during implementation: 9 files / 45 tests.
- `corepack pnpm --filter @xmeta/web typecheck` passed.
- `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
- Browser E2E passed on `http://127.0.0.1:3002/workspace` with FastAPI on 8011 and a fake SeedDream provider on 8899: Add Scene Image, Generate, one loaded image outcome node, provider/model evidence visible, local-preview/no-asset-library label visible, outcome selection did not reopen the source editor, and console warn/error logs were empty.
- Final closure sweep also passed after artifact updates: JSON validation for `feature_list.json`, `feature_tasks/5.json`, and `feature_tasks/8.json`; backend pytest 41 tests with one Starlette warning; API ruff; web tests 9 files / 48 tests; web typecheck; web build with `/workspace`; and final `.\init.ps1` rerunning web tests 9 files / 48 tests.

## Findings

- No blocking findings.
- Residual risk: E2E used a fake SeedDream provider, not a live Doubao call, so live account, proxy, and quota behavior still need environment-level validation.
- Residual risk: Starlette TestClient warning remains non-blocking.
- Residual product gap: durable asset persistence, signed URLs, task history, queue workers, and Asset Library integration remain later feature scope and are labeled in the UI/docs.

## Verdict

Accepted at 140 / 150. This meets the evaluator threshold.

## Feature 8 Audio Evaluation Addendum

Updated: 2026-07-07

Scope reviewed: Feature 8 `text-to-music-audio-node-001`, including shared contracts, FastAPI MiniMax provider/route, Audio node canvas UI, connected lyrics seeding, playable Audio outcome rendering, config/docs, and verification evidence.

Score: 141 / 150

Blocking findings: none.

Evidence:

- Shared contracts define `MusicGenerationRequest`, `MusicGenerationResponse`, `GeneratedAudio`, `persisted`, and the `audio` node type in `packages/shared-contracts/src/index.ts`.
- FastAPI adds `POST /api/v1/projects/{project_id}/nodes/{node_id}/generate-audio`, resolves MiniMax settings server-side, returns provider/model evidence, and sets `persisted=false`.
- MiniMax provider defaults to `music-2.6-free`, reads `MINIMAX_*` / `MUSIC_MODEL_*` env config, and posts `/v1/music_generation` with `prompt`, `lyrics`, `output_format`, `audio_setting`, `lyrics_optimizer`, and `is_instrumental`.
- Frontend `apps/web/src/lib/music-node/api.ts` calls only the local FastAPI route; no MiniMax secret or direct provider URL appears in frontend source.
- Audio uses a Script-style inline composer under the selected node for music prompt, lyrics, connected Script/Storyboard lyric seeding, backend-confirmed preview, and no-persistence labeling.
- Successful generation creates one deterministic Audio outcome node with one `audio` output port, provider/model metadata, and `<audio controls>`.
- Feature 5 SeedDream route/provider symbols remain present, and Feature 9 planning remains isolated from Feature 8 implementation.

Verification evidence:

- `.\.venv\Scripts\python.exe -m pytest services\api\tests\test_music_node.py` passed: 8 tests with one Starlette warning.
- `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx graph.test.ts` passed: 2 files / 29 tests.
- Main verification also passed API ruff, combined script/image/music API tests, full web tests, web typecheck, web build, and Browser E2E for the Audio node success path.
- Final `.\init.ps1` passed after artifact updates and reran web tests: 9 files / 48 tests.
- Audio inline composer follow-up passed focused workflow tests 2 files / 32 tests, web typecheck, browser QA on `http://localhost:3000/workspace` confirming the inline composer under the Audio node and no old floating Music editor, and final `.\init.ps1` rerunning 9 files / 51 tests.

Remaining risks:

- Browser E2E used a temporary fake MiniMax-compatible backend, not a live MiniMax call. Live `MINIMAX_API_KEY`, quota, proxy, and returned URL expiry behavior remain unverified.
- Architecture target is async generation/task persistence, but Feature 8 intentionally implements synchronous local preview only and labels persistence as deferred.
- Artifacts are mixed because Feature 9 planning currently owns `sprint-contract.md`; Feature 8 completion evidence is recorded as an addendum instead of replacing that plan.
