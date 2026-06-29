# Evaluator Rubric - Feature 2 Workflow Canvas Foundation

Updated: 2026-06-29

## Evaluation Scope

- Role: Evaluation subagent, with main-agent artifact recording.
- Target: Feature 2 `Workflow Canvas Foundation` implementation.
- Required read set: `AGENTS.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `feature_list.json`, `feature_tasks/2.json`, `sprint-contract.md`, `progress.md`, `session-handoff.md`, and relevant `apps/web` implementation files.
- Evaluation basis: sprint acceptance criteria, Feature 2 task file, UIUX references, architecture boundaries, and actual verification output.

## Scorecard

| Criterion | Points | Current | Evidence Required |
| --- | ---: | --- | --- |
| Canvas workspace route and shell | 15 | 15 | `/workspace` renders a dark dotted canvas as the primary surface, floating project/status controls, graph viewport, bottom dock, deferred backend labels, and no document overflow in desktop Browser QA. |
| Composed toolbar and node add entry | 15 | 15 | One bottom `Add node` entry exposes all nine placeholder node types on demand; duplicate left palette and default toolbar node list are removed. |
| Typed graph state | 15 | 15 | `graph.ts` and `types.ts` define deterministic node, port, edge, selection, viewport, draft, and snapshot records; reducer tests cover add/move/select/delete/restore. |
| Ports and compatible connections | 15 | 15 | Connection reducer stores source/target node and port ids, data type, label, and edge id; tests verify compatible connection plus invalid and duplicate rejection without hidden execution. |
| Selectable edge editing | 10 | 10 | SVG edges have selectable hit paths, selected styling, compact in-canvas status handoff, and selected-edge deletion through reducer state. |
| Reusable node UI design | 10 | 10 | Node cards include icons, titles, ids, status badges, descriptions, input/output counts, ports, selected states, and disabled `Generate later` actions. |
| Structured save/restore boundary | 10 | 10 | Snapshot tests round-trip structured payloads without DOM HTML; UI labels FastAPI durable persistence as unavailable/deferred. |
| Verification and artifacts | 10 | 10 | Baseline startup, tests, typecheck, build, Browser QA, JSON validation, `git diff --check`, and final startup evidence are recorded. |

Current score: 100 / 100 after the 2026-06-29 Feature 2 tailoring pass.

## Initial Findings

- Independent evaluator initially scored 70 / 100 and reported: P1 toolbar add-node interaction failed in rendered QA; P2 toolbar mode/help/context/panel scope was incomplete; P2 mobile canvas was clipped without internal reachability; P2 artifacts were stale during evaluation; P3 stale/missing ports could throw instead of returning visible feedback.
- Fixes applied after evaluator pass: toolbar add-node verified 3 -> 4 nodes in Browser QA, toolbar now has mode state, all-node quick-add buttons, and command/help/context/inspector toggles, mobile canvas has internal scroll reachability at 390x844, and `connectPorts` now rejects missing ports with a visible reason.
- Independent evaluator re-score after fixes: 96 / 100 with only P3 stale artifact wording remaining; this cleanup updates the stale 25-test and older Browser QA references.
- `AGENTS.md` is modified before this session and should remain protected as user work.
- Backend persistence, AI generation, provider calls, and orchestration are out of scope and must be labeled honestly.
- User-requested visual revision removed the duplicated left node palette and right monitoring/Inspector panel; desktop canvas QA is the acceptance target for this revision.
- 2026-06-29 evaluator subagent initially scored the tailoring pass 88 / 100 and flagged: P2 missing persistent visible backend/AI boundary label, P2 dirty relevant implementation files pending integration, and P3 live Browser interaction QA needing rerun after tooling instability.
- 2026-06-29 main/acting fix pass resolved those findings: `/workspace` now shows `Local only / FastAPI deferred / AI disabled` persistently, implementation edits were reviewed and verified, and fresh Browser QA reran Add node -> Add Audio with no warn/error logs during the QA window.

## Verification Evidence

- Baseline `.\init.ps1` passed before implementation: 6 test files / 18 tests.
- shadcn docs were checked for `button`, `badge`, `card`, `dialog`, `tooltip`, `tabs`, and `separator`.
- shadcn local components added: `tooltip.tsx`, `tabs.tsx`, and `separator.tsx`.
- `corepack pnpm --filter @xmeta/web test` passed after evaluator fixes: 9 test files / 26 tests.
- `corepack pnpm --filter @xmeta/web typecheck` passed.
- `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
- Browser QA desktop revision passed: `http://localhost:3000/workspace`, title `Workspace Canvas | X-META Video`, nonblank dark canvas, hidden global top bar, floating project/status controls, bottom dock present, no left node palette, no right Inspector/monitoring text, no console warn/error logs, and no document overflow.
- Browser interaction QA passed before final visual revision: bottom `Add node` opened the menu, `Add Audio node` increased rendered node count from 3 to 4, menu closed after creation, and duplicate palette/Inspector text remained absent.
- `feature_list.json` and `feature_tasks/2.json` parsed successfully as JSON.
- `git diff --check` passed with CRLF warnings only.
- Final `.\init.ps1` passed after artifact updates and reran web verification: 9 test files / 26 tests.
- Post-evaluator fix tests passed: 9 test files / 26 tests.
- Post-evaluator fix typecheck and build passed.
- Post-revision verification passed: `corepack pnpm --filter @xmeta/web test`, `corepack pnpm --filter @xmeta/web typecheck`, and `corepack pnpm --filter @xmeta/web build`.
- Final revision startup passed: `.\init.ps1` reran web verification with 9 test files / 26 tests.
- 2026-06-29 focused tailoring tests passed: `corepack pnpm --filter @xmeta/web test -- src/lib/workflow-canvas/graph.test.ts src/components/xmeta/workflow-canvas/workflow-canvas-workspace.test.tsx` reported 2 files / 8 tests.
- 2026-06-29 full tailoring verification passed: `corepack pnpm --filter @xmeta/web test` reported 9 files / 27 tests; `corepack pnpm --filter @xmeta/web typecheck` passed; `corepack pnpm --filter @xmeta/web build` passed.
- 2026-06-29 fresh Browser QA passed on `http://localhost:3000/workspace`: title `Workspace Canvas | X-META Video`, default node bounds stayed within the 1254px viewport (`script` right 431, `storyboard` right 771, `composition` right 1111), boundary label was visible, no Node palette/Quick add/Inspector text, no framework overlay, no document overflow, Add Audio changed node count 3 -> 4, the menu closed, the Audio node did not overlap the default graph, and no warn/error logs occurred during the QA window.
- 2026-06-29 final closure passed: JSON validation for `feature_list.json` and `feature_tasks/2.json`, `git diff --check` with line-ending warnings only, and final `.\init.ps1` rerunning 9 files / 27 tests.
- 2026-06-29 browser-comment tailoring passed code and partial rendered verification: Select/Move/Fit view labels and separate Zoom in/Zoom out labels were removed; `Canvas zoom` and `data-workspace-zoom-range` render as one combined control; Add node renders a compact node-name list when opened; blank-canvas Browser drag moved the Script card from left 364/top 112 to left 244/top 42; output-to-input Browser drag changed status from 4 nodes / 2 edges to 4 nodes / 3 edges; final short Browser health check had no warn/error logs. In-app Browser drag automation timed out while exercising the zoom slider, so zoom interaction was verified through focused tests, typecheck, build, and DOM/console health rather than a completed Browser drag loop.
- 2026-06-29 follow-up browser-comment verification improved the prior zoom evidence: `Canvas zoom` is now a toolbar-inline native `input[type=range]` with min 50, max 140, and step 1; Browser QA changed the canvas stage to `scale(0.56)` and showed a visible 56% zoom range; Add node labels now expose explicit flow text such as `Audio: Input Dialogue -> Output Audio` and `Video: Input Image + Audio -> Output Video`, with no bare `Audio` menu item. Focused workspace tests passed 1 file / 4 tests; full web tests passed 9 files / 28 tests; typecheck and build passed; JSON validation and final `.\init.ps1` passed.

## Verdict

Passing after evaluator fix pass, stale-evidence cleanup, and 2026-06-29 tailoring QA.
