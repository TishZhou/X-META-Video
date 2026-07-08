# Sprint Contract - Feature 8 Audio Edit Completion

## Sprint Overview

**Sprint:** feature-8-audio-edit-completion
**Feature:** Feature 8, Audio Node
**Task:** text-to-music-audio-node-003
**Status:** passing
**Goal:** Complete the existing-audio branch of the Audio node. Empty Audio nodes continue to generate music from connected lyrics plus the inline prompt. Audio nodes with generated or uploaded audio must execute Edit audio through the local FastAPI backend by using the current audio as a MiniMax cover reference, then replace the source Audio node preview with the edited playable result.

## Write Scope

- `packages/shared-contracts/src/index.ts`
- `services/api/xmeta_api/schemas.py`
- `services/api/xmeta_api/providers.py`
- `services/api/xmeta_api/main.py`
- `services/api/tests/test_music_node.py`
- `apps/web/src/lib/music-node/api.ts`
- `apps/web/src/components/xmeta/workflow-canvas/workflow-canvas-workspace.tsx`
- `apps/web/src/components/xmeta/workflow-canvas/workflow-canvas-workspace.test.tsx`
- `.env.example`
- `docs/API.md`
- `feature_tasks/8.json`
- `feature_list.json`
- `sprint-contract.md`
- `evaluator-rubric.md`
- `progress.md`
- `session-handoff.md`

Protected boundaries:

- Do not change Feature 5 Image node behavior or SeedDream route contracts.
- Preserve completed Video node behavior.
- The web app must call only local FastAPI; MiniMax keys and provider URLs stay server-side.
- Durable audio persistence, object storage, signed URLs, task polling, Audio Library save, and true waveform/stem editing remain later scope.
- Mobile UI polish is out of scope.

## In Scope

- Add reference audio fields to shared/FastAPI music-generation contracts.
- When reference audio is present, use MiniMax `music-cover-free` through the existing local `/generate-audio` route.
- Support current audio references from URL, base64/data URL, or hex-generated Audio node media.
- Make Edit audio execute generation and replace the selected Audio source node in place.
- Remove the visible “AI audio editing is not implemented yet” message from the normal existing-audio edit path.
- Keep upload replacement and local download behavior.
- Add backend/frontend tests and live Browser E2E for the edit path.

## Acceptance Criteria

1. Empty Audio node generation still uses `music-2.6-free`, connected lyrics plus prompt, and renders playable output on the source node.
2. Existing Audio node edit uses current audio as reference and `music-cover-free` through local FastAPI only.
3. Edit audio replaces the selected Audio source node output in place with a playable `<audio controls>` preview.
4. Edit audio retains visible provider/model evidence and local Download.
5. Uploading audio still updates the selected source Audio node locally.
6. If provider/API fails, Browser E2E pauses with the exact error instead of using a mock.
7. Feature 5 Image and Feature 9 Video tests remain passing.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | Confirmed `D:\X-META-Video`, read `AGENTS.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `feature_list.json`, `feature_tasks/8.json`, and recent commits. |
| Startup | `.\init.ps1` passed before implementation and reran web tests: 9 files / 57 tests. |
| Planning | MiniMax docs show `music-cover-free` supports reference audio via `audio_url` or `audio_base64`; this sprint completes Audio edit by routing existing audio through that model. |
| Implementation | Added music reference-audio contracts, routed FastAPI cover/edit requests to MiniMax `music-cover-free`, derived edit references from current Audio node media in the frontend, and made Edit audio replace the same source node with the edited playable result. |
| Verification | Passed focused music pytest, focused workflow tests, web typecheck, full API pytest, API ruff, full web tests, web build, live Browser E2E for generate-then-edit, and final `.\init.ps1`. |
| Browser E2E | Passed on `http://localhost:3000/workspace` with local FastAPI on 8000 and domestic MiniMax: Generate produced `minimax / music-2.6-free`; Edit audio then returned `minimax / music-cover-free`, replaced the source Audio node data URL length from `7626231` to `7440103`, kept playable controls/download, and produced no console warn/error logs. |
