# Sprint Contract - Text Node Task Choice V1

## Sprint Overview

**Sprint:** feature-3-text-node-task-choice-v1

**Feature:** Feature 3, Text Node (internal workflow type remains `script` for contract compatibility)

**Task:** script-node-011

**Status:** passing

**Goal:** Let users choose and execute two production Text Node tasks: (1) turn a brief idea into an IP narrative/world view with character positioning, and (2) turn Task 1 output into per-character appearance, personality, and voice profiles.

## Product Decisions

- AI modify/dialogue is unchanged and out of scope for this sprint.
- Task execution uses a dedicated `generate-text` API and Agent Runtime profiles instead of overloading dialogue mode.
- User-visible output and agent-to-agent content share one canonical editable `content` value. Transfer adds only compact task/data/source metadata, avoiding duplicate long payloads and drift.
- Shared text-generation rules live once in the common prompt layer; each task profile owns only its task-specific instructions.
- Task 2 input priority is: connected Task 1 outcome, same-node Task 1 outcome, then manually entered/pasted content.
- The internal workflow node type remains `script` in V1 to preserve downstream canvas/API compatibility; user-visible naming becomes Text.
- A generated Text outcome is a first-class graph result: generation creates or preserves one deterministic source-to-outcome edge instead of relying on visual proximity alone.
- A Text source node shows `Input connected` whenever an incoming edge carries the pure `text` data type; it must not imply a connection for another compatible non-text input.

## Write Scope

- `packages/shared-contracts/src/index.ts`
- `services/api/xmeta_api/schemas.py`
- `services/api/xmeta_api/main.py`
- `services/api/xmeta_api/agent_runtime/contracts.py`
- `services/api/xmeta_api/agent_runtime/profiles.py`
- `services/api/xmeta_api/agent_runtime/prompts.py`
- `services/api/xmeta_api/agent_runtime/validators.py`
- `services/api/xmeta_api/agent_runtime/nodes/text.py`
- `services/api/xmeta_api/agent_runtime/runtime.py`
- focused API/Agent Runtime tests
- `apps/web/src/components/ui/select.tsx` installed through the shadcn CLI
- `apps/web/src/lib/text-node/api.ts`
- `apps/web/src/lib/workflow-canvas/types.ts`
- `apps/web/src/lib/workflow-canvas/graph.ts`
- `apps/web/src/components/xmeta/workflow-canvas/workflow-canvas-workspace.tsx`
- focused workflow graph/workspace tests
- Feature 3 planning, evaluation, progress, and handoff artifacts
- `docs/API.md`
- focused DOM interaction-test dependencies/configuration if required
- deterministic Text outcome-edge reducer coverage and Text-input connection rendering coverage

Protected boundaries:

- Do not change AI modify/dialogue behavior.
- Do not change Image, Audio, Video, Storyboard, Composition, or Export provider behavior.
- Do not add persistence, project memory, workers, queues, provider polling, or graph auto-execution claims.
- Do not print or commit provider credentials.
- Preserve the user-owned uncommitted `AGENTS.md` change without editing or committing it.

## Acceptance Criteria

1. The selected Text Node shows an accessible shadcn Select labeled `Text task` with exactly the two requested tasks and node-local selection state.
2. Task 1 accepts a brief idea and returns editable natural text covering IP narrative positioning, core world view/rules, and named character positioning.
3. Task 2 accepts Task 1 output and returns editable per-character sections covering stable appearance language, personality/action language, and distinct voice/timbre language.
4. FastAPI exposes a typed `POST /api/v1/projects/{project_id}/nodes/{node_id}/generate-text` route with provider/model evidence and honest `persisted: false` metadata.
5. Agent Runtime registers separate stable task profiles, prompt-template IDs, output metadata, and validators for both tasks; common rules are not duplicated across task prompts.
6. One canonical output `content` value drives both the user-visible outcome editor and downstream Text Node input. Compact metadata identifies task, data type, and source without copying the long text.
7. Task 2 prioritizes connected Task 1 output, then same-node Task 1 output, then manual input, and visibly identifies the effective input source.
8. Text inputs and task choices are isolated per source node; adding/selecting a second Text Node does not overwrite the first node's draft or task selection.
9. Task 1 produces a `script` text outcome; Task 2 produces a `character` text outcome; both remain editable and reusable by compatible downstream ports.
10. Relevant API/Agent Runtime/Web tests, typecheck, build, Ruff, JSON validation, diff check, local API smoke, and final `init.ps1` pass.
11. Browser E2E is performed click by click with normal user controls: select each task, enter/use input, generate, inspect outcome, connect/use Task 1 for Task 2, edit output, verify provider/model evidence, error state, keyboard Select behavior, viewport fit, screenshots, console errors, and failed requests.
12. Independent evaluator score exceeds 140/160, and mandatory Codex in-app Browser E2E completes.
13. Generating Task 1 or Task 2 automatically renders exactly one deterministic edge from the Text source to its matching outcome node; regeneration does not duplicate that edge.
14. A Text source node with an incoming pure `text` edge visibly says `Input connected`, while an unconnected Text source retains its existing empty-input wording.

## QA Inventory

User-visible claims and required evidence:

- Task dropdown visibly offers the two requested choices; mouse and keyboard selection both work.
- Task 1 generated result is editable and carries backend-confirmed provider/model metadata.
- Task 2 consumes the connected or same-node Task 1 content rather than silently using the original brief.
- Switching among Text Nodes preserves each node's own task/input.
- Empty Task 2 input blocks generation with an actionable message.
- Loading, success, and failure states are visible and no unimplemented action implies completion.
- The relevant canvas/editor/result regions fit at 1600x900 and a smaller realistic desktop viewport without clipping or overlap.
- Exploratory scenarios: switch tasks repeatedly after generating both outcomes; disconnect/delete an upstream outcome and confirm Task 2 falls back honestly.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | `./init.ps1` passed with 9 Web files / 58 tests; only the user-owned `AGENTS.md` change was uncommitted. |
| Planning | Main agent defined two dedicated Text tasks, canonical content transfer, node-local state, and full click-by-click QA inventory. |
| Implementation | Round 1 implemented the dedicated route, two task profiles, canonical transfer, shadcn Select, node-local drafts, and editable typed outcomes. |
| Verification | Round 1 automated suites and a real provider Task 1 -> Task 2 chain passed. Codex Browser bootstrap failed before navigation with `Cannot redefine property: process`; no substitute browser was used. |
| Evaluation | Round 1: 126/160, rejected. Required revisions: API docs, per-character Task 2 validation, interaction-level Web coverage; main review also found stale deleted outcome data and overlapping Task 1/Task 2 outcome placement. |
| Revision 2 | Closed every Round 1 product defect; backend 79/79, Web 10 files / 63 tests, focused jsdom interaction, Ruff, typecheck, build, JSON, docs truth search, OpenAPI, final init, and a restarted live four-character Task 1 -> Task 2 chain passed. |
| Final evaluation | Round 2 finalized at 143/160 and met the numeric threshold, but remained rejected because the mandatory Codex in-app Browser failed before navigation with `Cannot redefine property: process`. No browser substitute was used. |
| Revision 3 | Removed rigid `[Character: name]` blocks and exact field labels. Task 2 now requests natural editable prose and validates only the required semantic element families. |
| Revision 4 | Expanded semantic validation for natural Chinese/English synonyms after the live Browser exposed a false negative for `视觉造型`; focused/full backend and Web suites, Ruff, typecheck, build, OpenAPI/docs/JSON/diff checks, and final `init.ps1` passed. |
| Codex Browser E2E | The repaired in-app Browser client controlled the user-opened `/workspace` tab. A real `openai / gpt-5.4-mini` Task 1 -> edited same-node Task 1 -> Task 2 path passed; Task 2 returned 1,651 characters with all four names and the appearance, personality/action, and voice families, without rigid character tags. Both outcomes were editable, provider-labelled, and non-overlapping. Loading and live error states, 1280x720 and 1600x900 layouts, screenshots, empty console warn/error logs, and the successful final API request were inspected. |
| Final evaluation | Independent Revision 3/4 evaluation accepted the feature at 156/160 with no blocking defect. Focused backend 8/8, full backend 80/80, Ruff, Web 63/63, typecheck, build, OpenAPI, JSON, diff-check, and final `init.ps1` all passed. |

## Revision Round 2 Plan

1. Update `docs/API.md` to make `/generate-text` the current Text Generate contract while retaining `/chat` only for AI modify/dialogue compatibility.
2. Define a stable natural-text character-profile section boundary and validate every emitted character section for appearance, personality/action, and voice/timbre; add negative multi-character tests.
3. Add interaction-level Web tests that operate the real task Select, input, Generate, editable outcome, and Task 1 -> Task 2 handoff path as far as the test DOM supports.
4. Require a live outcome node to use cached Task 1 content so deleting an outcome falls back honestly instead of reading stale local state.
5. Place Task 1 and Task 2 outcome nodes at distinct non-overlapping coordinates and cover the placement rule.
6. Re-run all verification, then repeat independent evaluator review. Browser E2E remains restricted to Codex in-app Browser and cannot be replaced by Computer Use, Chrome, or standalone Playwright.

## Revision Round 3 Plan

User clarification: input formatting is not part of acceptance, and generated text does not need rigid structural delimiters. Acceptance is based on the required output elements.

1. Remove the mandatory `[Character: name] ... [/Character]` boundary and exact bilingual field-label contract from Task 2 prompts, validators, docs, tests, and mocks.
2. Keep Task 2 natural and editable while requiring coverage of every named character and the output elements appearance, personality/action, and voice/timbre; validator checks required element presence without enforcing presentation format.
3. Preserve canonical content transfer, compact metadata, typed task/data/source contracts, editable outcomes, source priority, and all current canvas behavior.
4. Re-run focused/full automated and live-provider verification.
5. Use the newly working Codex in-app Browser connection to execute the click-by-click E2E on the user-opened `/workspace` tab, including both tasks, editable outcomes, source evidence, error state, viewport, screenshot, console, and failed requests.
