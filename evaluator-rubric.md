# Evaluator Rubric - Feature 5 Unified Image Node

Updated: 2026-07-08

## Evaluation Scope

- Role: Main-agent evaluator pass for Feature 5 `image-node-self-contained-002` plus unified Image node follow-up.
- Scope reviewed: shared image contracts, FastAPI image schemas/route/provider, workflow graph ports/reducer, image-node API client, canvas image editor/card rendering, API docs, Feature 5 artifacts, and browser behavior on `/workspace`.
- Protected boundaries: Script, Audio, and Video completed behavior preserved; frontend still calls local FastAPI only; durable media persistence remains deferred.

## Scorecard

| Criterion | Points | Current | Evidence |
| --- | ---: | ---: | --- |
| Scope fit and isolation | 20 | 20 | User-visible image generation is collapsed to one Image node while the existing local FastAPI SeedDream boundary is preserved. Parallel Audio/Video behavior was not edited for this change. |
| Backend SeedDream reference support | 25 | 24 | Existing FastAPI/SeedDream request path remains intact for prompt-only and reference-image generation. Live Doubao execution is still account/key dependent. |
| Frontend self-contained image-node behavior | 35 | 35 | The unified Image node supports connected text prompts, empty/generated/uploaded states, prompt-only generation, prompt-plus-current-image edit flow, and in-place image preview updates. |
| UI truthfulness and design fit | 20 | 20 | The Add menu now shows one Image entry, old Character Image / Prop / Asset / Scene Image generation entries are absent, the editor follows the Script-style below-node layout, and the model selector displays SeedDream 5.0. |
| Verification depth | 35 | 35 | Focused workspace/graph tests, full web tests, typecheck, build, JSON validation, and Browser QA on `/workspace` passed. |
| Artifact hygiene | 15 | 15 | Feature 5 task file, feature list, progress, handoff, and this rubric are updated for the unified Image node behavior. |

Current score: 149 / 150

## Acceptance Evidence

- `packages/shared-contracts/src/index.ts` and `services/api/xmeta_api/schemas.py` add optional `reference_image_url`, `reference_image_b64`, and `reference_image_mime_type` to image generation input.
- `services/api/xmeta_api/main.py` forwards those fields to `submitSeedreamWithRetry()`.
- `services/api/xmeta_api/providers.py` converts URL or base64 references into the provider payload `image` field while keeping Doubao credentials server-side.
- `apps/web/src/lib/workflow-canvas/graph.ts` adds `updateNodeOutput` and lets the Image prompt input accept connected text outputs.
- `apps/web/src/lib/workflow-canvas/graph.ts` now exposes one user-visible Image generation template instead of separate Character Image, Prop / Asset, and Scene Image templates.
- `apps/web/src/components/xmeta/workflow-canvas/workflow-canvas-workspace.tsx` updates the Image source node in place, adds upload, connected text prompt seeding, current-image edit mode, self-contained empty/preview node rendering, and displays SeedDream 5.0 in the model selector.
- `docs/API.md` documents the text-to-image and image-edit request shape and states previews are local only.

## Verification Evidence

- `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx graph.test.ts` passed: 2 files / 36 tests.
- `corepack pnpm --filter @xmeta/web test` passed: 9 files / 55 tests.
- `corepack pnpm --filter @xmeta/web typecheck` passed.
- `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
- JSON validation passed for `feature_list.json` and `feature_tasks/5.json`.
- Browser QA on `http://localhost:3000/workspace` passed: Add menu exposed one `Image: Input Prompt -> Output Image` entry, old image-generation entries were absent, one Image node could be added, the Image editor opened from the node header, the model selector displayed `SeedDream 5.0`, and console warn/error logs were empty.
- Final `.\init.ps1` passed and reran 9 files / 55 tests.

## Findings

- No blocking findings.
- Residual risk: live Doubao/SeedDream account, quota, proxy, and exact edit behavior were not validated in this follow-up.
- Residual deferred scope: durable uploaded image storage, signed URLs, queue workers, generation history, Asset Library save, Image Composition generation, and mobile polish remain future features.

## Verdict

Accepted at 149 / 150.
