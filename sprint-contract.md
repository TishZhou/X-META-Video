# Sprint Contract - Feature 3 Script Outcome Node

## Sprint Overview

**Sprint:** feature-3-script-outcome-node
**Feature:** Feature 3, Script Node
**Task:** script-node-010
**Status:** passing
**Goal:** Complete the first reusable AI node pattern: Script node chat stays conversational, while Generate creates an editable direct-text Script outcome node on the canvas. When AI conversation mode is active, Generate includes the dialogue history as context. Structured JSON output is intentionally deferred to avoid truncation issues.

## Write Scope

- `packages/shared-contracts/src/index.ts`
- `services/api/xmeta_api/schemas.py`
- `services/api/xmeta_api/prompt.py`
- `services/api/xmeta_api/main.py`
- `services/api/tests/test_script_node.py`
- `apps/web/src/lib/script-node/api.ts`
- `apps/web/src/lib/workflow-canvas/types.ts`
- `apps/web/src/lib/workflow-canvas/graph.ts`
- `apps/web/src/lib/workflow-canvas/graph.test.ts`
- `apps/web/src/components/xmeta/workflow-canvas/workflow-canvas-workspace.tsx`
- `apps/web/src/components/xmeta/workflow-canvas/workflow-canvas-workspace.test.tsx`
- `docs/API.md`
- `feature_tasks/3.json`
- `feature_list.json`
- `sprint-contract.md`
- `evaluator-rubric.md`
- `progress.md`
- `session-handoff.md`

Protected existing edits:

- Preserve the pre-existing uncommitted `feature_tasks/3.json` task10 draft and build on it.
- Preserve unrelated working tree changes unless they directly block this task.

## In Scope

- Add reusable workflow node output metadata so generated outputs can live on canvas nodes, not inside chat history.
- Add a direct-text generation path that can use optional dialogue history without asking the model for JSON.
- Update the backend Script prompt so direct text generation can use prior AI conversation context when supplied.
- On Generate success, create or update one editable Script outcome node on the canvas with direct text output.
- Keep AI modify / Send as conversational chat only; chat history should not show the generated direct text output reply.
- Make the Script outcome node editable enough for MVP: the generated text can be changed locally and reflected in the node preview.
- Keep backend/provider truth visible and remove non-live fallback provider options from this path.
- Keep implementation reusable for later image/video/audio nodes by separating common node-output behavior from Script-specific output rendering.

## Out of Scope

- Durable workflow persistence, production auth, queue workers, SSE/WebSocket streaming, object storage, and asset lineage.
- Full Storyboard Node editing, image generation, audio generation, video generation, or export rendering.
- Mobile UI polish.
- Replacing the existing canvas engine or broad visual redesign.

## Acceptance Criteria

1. `script-node-010` is the only active Feature 3 task and has concrete criteria/evidence recorded.
2. Direct Generate from the Script composer creates a new editable direct-text Script outcome node on the canvas instead of showing generated output as an AI chat-history reply.
3. If AI conversation mode is active, Generate sends dialogue history to the backend direct-output path and generation is based on that context.
4. If AI conversation mode is not active, Generate uses the current world description directly and does not require chat history.
5. The Script chat panel still opens for AI modify, Send appends backend dialogue turns, and the panel no longer renders generated output after generation.
6. The Script outcome node shows backend-confirmed provider/model metadata and honest local persistence boundaries.
7. The common output-node model can be reused by later image/video/audio nodes with different input/output payloads.
8. Tests cover backend direct-output prompt history, frontend generation request payload, output-node creation/update, local editing, and absence of generated output in chat history.
9. End-to-end browser verification proves Generate creates/updates the outcome node and AI modify history can feed generation.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | Confirmed `D:\X-META-Video`, read `AGENTS.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `feature_list.json`, `feature_tasks/3.json`, existing handoff/progress, and recent commits. |
| Startup | `.\init.ps1` passed before implementation and reran web tests: 9 files / 40 tests. |
| Git review | Recent commits were short and pushed on `main...origin/main`; the only pre-existing working-tree change was `feature_tasks/3.json` with the user task10 draft. |
| Planning | Task10 scope is the reusable first AI-node pattern: chat is conversational, Generate produces a separate editable direct-text outcome node, and conversation history feeds direct text generation only when AI modify mode is active. Structured JSON output is deferred because the user flagged JSON truncation risk. |
| Implementation | Added Script chat `mode: "direct_output"`, plain-text direct-output prompt guidance, reusable workflow source/outcome node metadata, deterministic Script outcome node creation/update, editable outcome rendering, and product provider support limited to configured live providers. |
| Backend verification | `.\.venv\Scripts\python.exe -m pytest services\api\tests\test_script_node.py` passed: 25 tests. `.\.venv\Scripts\python.exe -m pytest services\api\tests` passed: 25 tests. `.\.venv\Scripts\python.exe -m ruff check services\api` passed. |
| Frontend verification | `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx` passed: 1 file / 16 tests. `corepack pnpm --filter @xmeta/web test` passed: 9 files / 41 tests. `corepack pnpm --filter @xmeta/web typecheck` passed. `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`. |
| Browser QA | Playwright/Chrome E2E against `http://localhost:3000/workspace` and FastAPI on `localhost:8000` passed: Generate sent `/chat` with `mode: "direct_output"`, created one Script outcome node, rendered 768 characters of editable direct text, showed `Backend: openai / gpt-5.4-mini`, and had no console errors or failed requests. |
| Artifact verification | JSON validation passed for `feature_list.json`, `feature_tasks/3.json`, and `feature_tasks/4.json`. Scoped provider-cleanup search over product code/docs/task artifacts returned no legacy fallback-provider matches. `.env.example` has an empty `TEXT_MODEL_API_KEY`. Current state was recorded in `progress.md`, `session-handoff.md`, `feature_list.json`, `feature_tasks/3.json`, and `evaluator-rubric.md`. |
| Final startup | Final `.\init.ps1` passed at session close and reran web tests: 9 files / 41 tests. |
