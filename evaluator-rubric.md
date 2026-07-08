# Evaluator Rubric - Feature 9 Ark Seedance Video API

Updated: 2026-07-08

## Evaluation Scope

- Role: Main-agent evaluator pass for Feature 9 `video-node-001-api-switch`.
- Scope reviewed: shared/FastAPI video contracts, Ark Seedance provider payload, reference-video input support, Video node editor evidence, task-only truthfulness, Feature 5/8 boundary preservation, and rendered Browser E2E.
- Protected boundaries: Feature 5 Image node and Feature 8 Audio node provider behavior remain outside this revision.

## Scorecard

| Criterion | Points | Current | Evidence |
| --- | ---: | ---: | --- |
| Scope fit and isolation | 20 | 19 | Changes stayed in Video node contracts, provider, docs, env, and tests; Image/Audio provider code unchanged. |
| Ark backend contract | 35 | 34 | FastAPI posts raw HTTP to Ark `contents/generations/tasks` with `model`, `content`, `generate_audio`, `ratio`, `duration`, and `watermark`; no Python SDK path. |
| Reference media mapping | 25 | 24 | `image_urls`, `video_urls`, and `audio_urls` map to Ark `reference_image`, `reference_video`, and `reference_audio`; audio requires image or video. |
| Video node UX truthfulness | 25 | 24 | Editor labels Ark Seedance, shows reference-video count, keeps local FastAPI boundary, and marks task-id-only responses as not playable until polling exists. |
| Verification depth | 35 | 34 | Backend focused/full tests, ruff, focused/full web tests, typecheck, build, and rendered Browser E2E passed. |
| Artifact hygiene | 10 | 9 | API docs, env example, sprint contract, feature task/list, progress, and handoff updated; `.env` was updated without printing values. |

Current score: 144 / 150

## Acceptance Evidence

- `VideoGenerationInput` and `VideoGenerationResponse` now include `video_urls`.
- FastAPI `/api/v1/projects/{project_id}/nodes/{node_id}/generate-video` resolves `ArkSeedanceVideoProviderSettings` and calls `submitArkSeedanceVideoWithRetry()`.
- The Ark provider builds a `content` array with text, reference image, reference video, and reference audio entries matching the supplied curl-style API.
- `.env.example` and gitignored `.env` now use `VIDEO_MODEL_PROVIDER=volcengine-ark`, `ARK_BASE_URL`, `ARK_API_KEY`, `ARK_VIDEO_MODEL`, `ARK_VIDEO_RATIO`, `ARK_VIDEO_GENERATE_AUDIO`, `ARK_VIDEO_WATERMARK`, timeout, and retry keys.
- The Video source node has a `Reference video` input port and sends collected upstream video output URLs as `video_urls`.
- Task-id-only responses remain visible as accepted provider tasks without rendering a fake video player.

## Verification Evidence

- Baseline `.\init.ps1` passed before implementation and reran web tests: 9 files / 58 tests.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests\test_video_node.py` passed: 10 tests.
- `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx graph.test.ts` passed: 2 files / 39 tests.
- `corepack pnpm --filter @xmeta/web typecheck` passed.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests` passed: 55 tests.
- `.\.venv\Scripts\python.exe -m ruff check services\api` passed.
- `corepack pnpm --filter @xmeta/web test` passed: 9 files / 58 tests.
- `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
- Browser E2E passed on `http://localhost:3000/workspace`: Add Video via the new `Reference video` menu label, open the Video editor, confirm Ark Seedance and `0 reference videos`, generate through intercepted local FastAPI `/generate-video`, request body contained `video_urls: []`, Ark task-only response showed provider task evidence, no playable preview rendered, and console warn/error logs were empty.
- Final `.\init.ps1` passed after artifact updates and reran web tests: 9 files / 58 tests.

## Findings

- No open P1/P2 findings. Residual risk: `ARK_API_KEY` is an empty local placeholder, so live provider execution was not attempted; durable polling/storage remains later scope.

## Verdict

Accepted at 144 / 150 for Feature 9 `video-node-001-api-switch`.
