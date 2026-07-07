# Sprint Contract - Feature 3 Script Node Dual Mode

## Sprint Overview

**Sprint:** feature-3-script-dual-mode
**Feature:** Feature 3, Script Node
**Status:** passing
**Goal:** Correct the Script node interaction model so professional users can directly Generate from a prompt, while users who click AI modify enter a separate multi-turn conversation mode before generating.

## Write Scope

- `apps/web/src/components/xmeta/workflow-canvas/workflow-canvas-workspace.tsx`
- `apps/web/src/components/xmeta/workflow-canvas/workflow-canvas-workspace.test.tsx`
- `feature_tasks/3.json`
- `feature_list.json`
- `sprint-contract.md`
- `evaluator-rubric.md`
- `progress.md`
- `session-handoff.md`

Protected existing edits:

- Preserved unrelated pre-existing working tree changes, including `.env.example`, `AGENTS.md`, `docs/PRODUCT.md`, `pnpm-workspace.yaml`, and untracked `scripts/`.

## In Scope

- Make `AI modify` a mode entry button, not the send action.
- Show conversation/history mode after `AI modify` is clicked.
- Add an explicit send action inside conversation mode that calls the existing backend chat route.
- Keep Generate as a direct one-click structured ScriptOutput action from the current prompt.
- Keep existing backend chat and generation routes unchanged.
- Verify both modes in tests and Browser E2E.

## Out of Scope

- Streaming/SSE performance.
- Durable chat persistence.
- Prompt-memory synthesis from full dialogue into structured generation.
- Mobile UI polish.

## Acceptance Criteria

1. Initial Script composer shows `AI modify` and `Generate`; no conversation send control is shown before entering conversation mode.
2. Clicking `AI modify` opens the history/conversation panel and does not send a backend chat turn.
3. Conversation mode shows a separate send control that calls backend chat and appends user/assistant turns.
4. Generate remains available in both modes and still runs structured ScriptOutput generation.
5. Browser E2E verifies direct Generate and conversation-mode Send as separate flows.
6. Required artifacts record the task, evidence, and final status.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | Confirmed `D:\X-META-Video`, read startup docs, product, architecture, Feature 3 task state, recent commits, verify/browser/frontend/shadcn/uiux skill guidance. |
| Startup | `.\init.ps1` passed before implementation and reran web tests: 9 files / 38 tests. |
| Planning | User clarified there are two modes: direct Generate from prompt, or AI modify conversation mode followed by Generate. Current implementation incorrectly treated `AI modify` like a send action. |
| Frontend | Added `scriptConversationMode`; `AI modify` now opens `AI对话` with an assistant guidance message and no backend send; conversation mode shows a separate `发送` button that calls backend chat; Generate exits conversation mode and runs structured ScriptOutput generation. |
| Focused verification | `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx` passed: 1 file / 15 tests. `corepack pnpm --filter @xmeta/web typecheck` passed. |
| Full verification | `corepack pnpm --filter @xmeta/web test` passed: 9 files / 39 tests. `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`. Backend chat preflight returned a mock assistant reply. |
| Browser E2E | Passed on the user's already-open in-app browser tab at `http://localhost:3000/workspace`: initial composer had no Send control; direct Generate produced Ready structured ScriptOutput; AI modify opened conversation mode with guidance and no `Script AI turn` before Send; Send produced `Script AI turn 1`; Generate remained visible; console warn/error logs were empty. Browser `domSnapshot()` still hit the known `incrementalAriaSnapshot` issue, so locators/evaluate plus screenshot were used. |
| Evaluation | Main evaluation accepts `script-node-008` at 146 / 150. Remaining gap is future synthesis from full dialogue history into generation prompt and production streaming/persistence, both out of scope. |
| Final startup | Final `.\init.ps1` passed after artifact updates and reran web tests: 9 files / 39 tests. |
