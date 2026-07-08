# Sprint Contract - Feature 9 Ark Seedance Video API

## Sprint Overview

**Sprint:** feature-9-ark-seedance-video-api
**Feature:** Feature 9, Video Node
**Task:** video-node-001-api-switch
**Status:** passing
**Goal:** Replace the completed Video node's old Evolink Seedance provider call with the Volcengine Ark `contents/generations/tasks` HTTP API supplied by the user, while preserving the local FastAPI boundary and the existing draggable/playable Video outcome behavior when a video URL is returned.

## Write Scope

- `packages/shared-contracts/src/index.ts`
- `services/api/xmeta_api/schemas.py`
- `services/api/xmeta_api/providers.py`
- `services/api/xmeta_api/main.py`
- `services/api/tests/test_video_node.py`
- `apps/web/src/lib/video-node/api.ts`
- `apps/web/src/lib/workflow-canvas/graph.ts`
- `apps/web/src/lib/workflow-canvas/graph.test.ts`
- `apps/web/src/components/xmeta/workflow-canvas/workflow-canvas-workspace.tsx`
- `apps/web/src/components/xmeta/workflow-canvas/workflow-canvas-workspace.test.tsx`
- `.env`
- `.env.example`
- `docs/API.md`
- `feature_tasks/9.json`
- `feature_list.json`
- `sprint-contract.md`
- `evaluator-rubric.md`
- `progress.md`
- `session-handoff.md`

Protected boundaries:

- Do not change Feature 5 Image node provider behavior or SeedDream route contracts.
- Do not change Feature 8 Audio node provider behavior or MiniMax route contracts.
- The web app must call only local FastAPI; Ark credentials stay server-side.
- Use raw HTTP from the FastAPI provider wrapper, not a Python SDK.
- Durable video persistence, object storage, signed URLs, task polling, Video Library save, and export assembly remain later scope.
- Mobile UI polish is out of scope.

## In Scope

- Replace Evolink video settings and payload construction with Ark Seedance `POST /api/v3/contents/generations/tasks`.
- Build Ark `content` entries from prompt text, reference images, reference videos, and reference audio.
- Add `video_urls` to shared/FastAPI/local frontend contracts for reference-video inputs.
- Keep local `POST /api/v1/projects/{project_id}/nodes/{node_id}/generate-video` as the only browser-facing route.
- Update `.env.example` and gitignored `.env` to use `ARK_API_KEY`, `ARK_BASE_URL`, and `ARK_VIDEO_MODEL`.
- Preserve existing task-only honesty: if Ark returns only a task ID, show provider task evidence instead of implying a playable video is ready.
- Add focused backend/frontend tests plus rendered interaction verification.

## Acceptance Criteria

1. Video generation sends the Ark request shape with `model`, `content`, `generate_audio`, `ratio`, `duration`, and `watermark`.
2. Reference image, reference video, and reference audio URLs map to Ark roles `reference_image`, `reference_video`, and `reference_audio`.
3. Browser requests still go only to local FastAPI and never directly to Ark.
4. Missing `ARK_API_KEY` and provider failures produce clear backend errors without leaking secret values.
5. Existing prompt-only, image/audio-fed, and returned-video frontend behavior remains compatible.
6. Feature 5 Image and Feature 8 Audio tests remain passing.
7. Verification evidence is recorded before the session ends.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | Confirmed `D:\X-META-Video`, read `AGENTS.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `feature_list.json`, `feature_tasks/9.json`, and recent commits. |
| Startup | `.\init.ps1` passed before implementation and reran web tests: 9 files / 58 tests. |
| Planning | Scope narrowed to the Video node API switch and reference-video input support, preserving the local FastAPI boundary and avoiding Feature 5/8 provider code. |
| Implementation | Replaced Evolink provider settings and calls with raw HTTP Ark Seedance `contents/generations/tasks`, added `video_urls` contracts, mapped text/images/videos/audio into Ark `content` roles, added the Video node `Reference video` input, and updated `.env.example`, `.env`, and API docs. |
| Verification | Passed focused video pytest, focused workflow tests, web typecheck, full API pytest, API ruff, full web tests, web build, Browser E2E, and final `.\init.ps1`. |
| Browser E2E | Passed on `http://localhost:3000/workspace`: Add Video showed the new `Reference video` input label, the editor showed Ark Seedance and `0 reference videos`, Generate posted only to local FastAPI with `video_urls: []`, task-id-only response rendered provider task evidence without a video player, and console warn/error logs were empty. |
