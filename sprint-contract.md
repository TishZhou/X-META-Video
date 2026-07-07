# Sprint Contract - Feature 3 Script Node Realtime AI Dialogue

## Sprint Overview

**Sprint:** feature-3-realtime-ai-dialogue-backend
**Feature:** Feature 3, Script Node
**Status:** passing
**Goal:** Complete the user-reported gap where the Script node composer could generate one-shot output but could not hold a backend-connected multi-turn AI dialogue.

## Write Scope

- `packages/shared-contracts/src/index.ts`
- `apps/web/src/components/xmeta/workflow-canvas/workflow-canvas-workspace.tsx`
- `apps/web/src/components/xmeta/workflow-canvas/workflow-canvas-workspace.test.tsx`
- `apps/web/src/lib/script-node/api.ts`
- `services/api/xmeta_api/main.py`
- `services/api/xmeta_api/prompt.py`
- `services/api/xmeta_api/providers.py`
- `services/api/xmeta_api/schemas.py`
- `services/api/tests/test_script_node.py`
- `docs/API.md`
- `feature_tasks/3.json`
- `feature_list.json`
- `sprint-contract.md`
- `evaluator-rubric.md`
- `progress.md`
- `session-handoff.md`

Protected existing edits:

- Preserved unrelated pre-existing working tree changes, including `.env.example`, `AGENTS.md`, `docs/PRODUCT.md`, `pnpm-workspace.yaml`, and untracked `scripts/` content.

## In Scope

- Add a backend Script-node dialogue contract and route for multi-turn user/assistant messages.
- Connect the canvas Script composer `AI modify` action to that backend dialogue route instead of only revealing a local/generated single response.
- Keep Generate available for full structured ScriptOutput generation.
- Render visible multi-turn user and assistant messages in the selected Script node response area.
- Keep the mock provider deterministic for local verification while preserving OpenAI-compatible provider behavior.
- Record the new task and evidence in the required Feature 3 artifacts.
- Run backend, frontend, and Browser end-to-end verification.

## Out of Scope

- Durable PostgreSQL chat persistence, queue workers, auth, asset lineage, media generation, storyboard editing, and production SSE/WebSocket infrastructure.
- Mobile UI polish.
- Live OpenAI execution without user-supplied credentials.

## Acceptance Criteria

1. Feature 3 task coverage explicitly includes backend-connected multi-turn AI dialogue for the Script node.
2. The backend exposes a typed Script dialogue route that accepts history plus a new user message and returns an assistant message.
3. `AI modify` sends the user's text to the backend dialogue route, appends the user turn, appends the assistant turn, and can repeat for another turn without losing prior context.
4. Generate still runs the structured Script generation task/result flow for downstream nodes.
5. Local mock mode succeeds without external credentials and does not pretend media/persistence features exist.
6. Focused backend and frontend tests cover the chat route and UI state.
7. Browser E2E verifies the open `/workspace` tab can complete two AI dialogue turns through the UI with no relevant console errors.
8. Evidence is recorded in `feature_list.json`, `feature_tasks/3.json`, `sprint-contract.md`, `evaluator-rubric.md`, `progress.md`, and `session-handoff.md`.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | Confirmed working directory `D:\X-META-Video`; read startup docs, architecture, product, API, Feature 3 task file, current sprint/progress, and recent commits. |
| Startup | `.\init.ps1` passed before implementation and reran web tests: 9 files / 38 tests. |
| Planning | User browser evidence showed the selected Script composer still lacked real conversation behavior. Scope was set to backend-connected request/response multi-turn dialogue; durable streaming/SSE remains a later platform realtime feature. |
| Backend | Added Script dialogue message/request/response schemas, `build_script_dialogue_prompt`, `ScriptProvider.chat`, deterministic mock chat replies, OpenAI-compatible chat output_text handling, and `POST /api/v1/projects/{project_id}/nodes/{node_id}/chat`. |
| Frontend | Added shared dialogue contracts and `runScriptDialogue`; changed `AI modify` to send backend chat turns and render multi-turn user/assistant history; kept Generate on the existing structured ScriptOutput task flow. |
| Focused verification | Backend focused pytest passed: 23 tests. API ruff passed. Focused workspace test passed: 1 file / 14 tests. Full web test passed: 9 files / 38 tests. Web typecheck passed. |
| Rendered QA | Restarted stale local uvicorn on port 8000 after `/chat` returned 404, then preflighted `/chat` successfully. Browser E2E passed on the user's current in-app browser tab at `http://localhost:3000/workspace`: two `AI modify` turns returned `Script AI turn 1` and `Script AI turn 2`, both user messages remained in history, `AI disabled` copy was absent, no framework overlay appeared, and console warn/error logs were empty. Browser `domSnapshot()` still hit the known `incrementalAriaSnapshot` runtime issue, so page state was verified with targeted locators/evaluate plus screenshot evidence. |
| Build and static checks | `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`; JSON validation passed for `feature_list.json` and `feature_tasks/3.json`; `git diff --check` passed with LF/CRLF warnings only. |
| Evaluation | Main evaluation records 146 / 150: the requested backend-connected multi-turn dialogue is implemented and verified; remaining gap is that realtime transport is request/response rather than SSE/WebSocket, which is intentionally deferred by architecture. |
| Final startup | Final `.\init.ps1` passed after artifact updates and reran web tests: 9 files / 38 tests. |
