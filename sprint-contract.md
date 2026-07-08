# Sprint Contract - Feature 5 Self-Contained Image Node

## Sprint Overview

**Sprint:** feature-5-self-contained-image-node
**Feature:** Feature 5, Character Image Node
**Task:** image-node-self-contained-002
**Status:** passing
**Goal:** Convert Character Image, Prop / Asset, and Scene Image into self-contained image nodes. The node itself displays the current image and updates in place from connected text, typed prompt-only generation, local upload, or image-plus-prompt SeedDream edit.

## Write Scope

- `packages/shared-contracts/src/index.ts`
- `services/api/xmeta_api/schemas.py`
- `services/api/xmeta_api/providers.py`
- `services/api/xmeta_api/main.py`
- `services/api/tests/test_image_node.py`
- `apps/web/src/lib/image-node/api.ts`
- `apps/web/src/lib/workflow-canvas/types.ts`
- `apps/web/src/lib/workflow-canvas/graph.ts`
- `apps/web/src/components/xmeta/workflow-canvas/workflow-canvas-workspace.tsx`
- `apps/web/src/components/xmeta/workflow-canvas/workflow-canvas-workspace.test.tsx`
- `docs/API.md`
- `feature_tasks/5.json`
- `feature_list.json`
- `sprint-contract.md`
- `evaluator-rubric.md`
- `progress.md`
- `session-handoff.md`

Protected boundaries:

- Preserve completed Script, Audio, and Video behavior unless a type-level change is strictly needed for image nodes.
- Keep web-to-provider boundary local: frontend calls FastAPI only and never calls Doubao/SeedDream directly.
- Do not expose provider secrets in frontend code, tests, docs, logs, or final notes.
- Do not claim durable asset persistence, object storage, signed URLs, queue workers, generation history, or Asset Library save.
- Image Composition full composition/9-grid generation remains later feature scope; only the shared image-node editor behavior is allowed here.
- Mobile UI is out of scope.

## In Scope

- Treat source image nodes as the result-bearing image nodes instead of creating separate image outcome nodes.
- Display empty, uploaded, generated, editing, and error states directly inside the image node card.
- Seed image prompts from connected upstream text outputs when available.
- Keep prompt-only generation for empty image nodes through the existing local SeedDream backend route.
- Add local upload for a reference/current image, stored only in browser state as a data URL.
- Add request fields for reference/current image data so existing-image nodes can send prompt plus image to the backend for SeedDream image editing.
- Update backend schemas/provider tests so reference image fields are accepted and sent to SeedDream without exposing credentials.
- Update focused tests and Browser QA around in-place image node behavior.

## Out of Scope

- Durable upload storage, object storage, signed URLs, Asset Library persistence, reusable asset IDs, generation history, task polling, and queue workers.
- Live Doubao validation with a real API key.
- Full Image Composition generation, storyboard 9-grid output, video generation, audio generation, export rendering, and mobile polish.

## Acceptance Criteria

1. Character Image, Prop / Asset, and Scene Image source nodes show an empty image placeholder when no image exists.
2. Connected upstream text can seed the prompt used by the image node without overwriting user edits unexpectedly.
3. Empty image nodes generate an image from typed/connected prompt and update the same node.
4. Existing generated or uploaded image nodes send prompt plus current image reference for SeedDream image editing and update the same node.
5. Local upload updates the selected image node preview and is labeled local-only/not persisted.
6. Generate does not create a separate image outcome node.
7. Backend request/contract supports reference image data and still returns provider/model evidence.
8. All unimplemented persistence/storage/history capabilities are visibly labeled.
9. Verification includes backend image tests, focused/full web tests, typecheck/build, and rendered Browser QA.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | Confirmed `D:\X-META-Video`, read startup docs, Feature 5 task state, recent commits, and reference screenshots. |
| Startup | `.\init.ps1` passed before implementation and reran web tests: 9 files / 52 tests. |
| Planning | Scope is constrained to self-contained image-node behavior and SeedDream text/image request shape. Completed Feature 8 Audio and Feature 9 Video surfaces are protected. |
| Implementation | Added optional reference image fields to shared/FastAPI contracts, forwarded references to SeedDream as the backend `image` payload field, made image generation update the selected source node output, added local upload, connected text prompt seeding, source-node image empty/current states, and removed the old separate image outcome creation path for Character Image, Prop / Asset, and Scene Image nodes. |
| Verification | Passed image-node pytest 10 tests, full API pytest 52 tests, focused workspace test 29 tests, graph test 7 tests, full web tests 55 tests, web typecheck, web build, Browser QA on `http://localhost:3000/workspace`, and final `.\init.ps1`. |
| Closeout | Feature 5 task `image-node-self-contained-002` accepted as passing. Durable asset persistence, signed URLs, queue workers, generation history, Asset Library save, live Doubao execution, Image Composition generation, and mobile polish remain later scope. |
