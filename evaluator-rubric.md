# Evaluator Rubric - Feature 5 Self-Contained Image Node

Updated: 2026-07-08

## Evaluation Scope

- Role: Main-agent evaluator pass for Feature 5 `image-node-self-contained-002`.
- Scope reviewed: shared image contracts, FastAPI image schemas/route/provider, workflow graph ports/reducer, image-node API client, canvas image editor/card rendering, API docs, Feature 5 artifacts, and browser behavior on `/workspace`.
- Protected boundaries: Script, Audio, and Video completed behavior preserved; frontend still calls local FastAPI only; durable media persistence remains deferred.

## Scorecard

| Criterion | Points | Current | Evidence |
| --- | ---: | ---: | --- |
| Scope fit and isolation | 20 | 20 | Changes are limited to image-node contracts, image route/provider, workflow graph/canvas image behavior, docs, tests, and artifacts. Video/Evolink and Audio/MiniMax paths were not changed. |
| Backend SeedDream reference support | 25 | 24 | FastAPI accepts optional reference image fields and provider posts the reference as SeedDream `image`; route/provider tests cover prompt-only and reference-image paths. Live Doubao execution remains unverified without a real key. |
| Frontend self-contained image-node behavior | 35 | 35 | Character Image, Prop / Asset, and Scene Image nodes can show empty/current image state, upload a local image, seed prompt from connected text, and update the selected source node instead of creating an outcome node. |
| UI truthfulness and design fit | 20 | 20 | The editor follows the Script-style below-node composer, shows local-only/no-persistence evidence, uses Generate/Edit image based on current image state, and avoids claiming Asset Library/storage/history support. |
| Verification depth | 35 | 35 | Backend focused/full tests, focused workspace/graph tests, full web tests, typecheck, build, browser QA, and final startup verification all passed. |
| Artifact hygiene | 15 | 15 | Feature list, Feature 5 task file, sprint contract, rubric, progress, and handoff are updated for the current behavior. |

Current score: 149 / 150

## Acceptance Evidence

- `packages/shared-contracts/src/index.ts` and `services/api/xmeta_api/schemas.py` add optional `reference_image_url`, `reference_image_b64`, and `reference_image_mime_type` to image generation input.
- `services/api/xmeta_api/main.py` forwards those fields to `submitSeedreamWithRetry()`.
- `services/api/xmeta_api/providers.py` converts URL or base64 references into the provider payload `image` field while keeping Doubao credentials server-side.
- `apps/web/src/lib/workflow-canvas/graph.ts` adds `updateNodeOutput` and lets Prop / Asset accept connected Script text.
- `apps/web/src/components/xmeta/workflow-canvas/workflow-canvas-workspace.tsx` updates image source nodes in place, adds upload, connected text prompt seeding, current-image edit mode, and self-contained empty/preview node rendering.
- `docs/API.md` documents the text-to-image and image-edit request shape and states previews are local only.

## Verification Evidence

- `.\init.ps1` passed before implementation: 9 files / 52 web tests.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests\test_image_node.py` passed: 10 tests, 1 existing Starlette warning.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests` passed: 52 tests, 1 existing Starlette warning.
- `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx` passed: 1 file / 29 tests.
- `corepack pnpm --filter @xmeta/web test -- graph.test.ts` passed: 1 file / 7 tests.
- `corepack pnpm --filter @xmeta/web test` passed: 9 files / 55 tests.
- `corepack pnpm --filter @xmeta/web typecheck` passed.
- `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
- Browser QA on `http://localhost:3000/workspace` with system Chrome passed: added Scene Image, verified empty image-node state and below-node composer, uploaded the provided PNG, saw one in-node image preview, zero image outcome nodes, local-upload provider evidence, Edit image mode, and Use connected text after connecting Script output to Scene Image input.
- Final `.\init.ps1` passed and reran 9 files / 55 web tests.

## Findings

- No blocking findings.
- Residual risk: live Doubao/SeedDream account, quota, proxy, and exact edit behavior are not validated because `DOUBAO_API_KEY` is empty.
- Residual deferred scope: durable uploaded image storage, signed URLs, queue workers, generation history, Asset Library save, Image Composition generation, and mobile polish remain future features.

## Verdict

Accepted at 149 / 150.
