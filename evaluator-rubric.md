# Evaluator Rubric - Feature 2 Workflow Canvas Foundation

Updated: 2026-06-26

## Evaluation Scope

- Role: Evaluation subagent, with main-agent artifact recording.
- Target: Feature 2 `Workflow Canvas Foundation` implementation.
- Required read set: `AGENTS.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `feature_list.json`, `feature_tasks/2.json`, `sprint-contract.md`, `progress.md`, `session-handoff.md`, and relevant `apps/web` implementation files.
- Evaluation basis: sprint acceptance criteria, Feature 2 task file, UIUX references, architecture boundaries, and actual verification output.

## Scorecard

| Criterion | Points | Current | Evidence Required |
| --- | ---: | --- | --- |
| Canvas workspace route and shell | 15 | 15 | `/workspace` renders toolbar, palette, graph viewport, inspector tabs, status badges, deferred backend labels, and no horizontal overflow in desktop/mobile Browser QA. |
| Composed toolbar and node palette | 15 | 15 | Palette includes all nine placeholder node types and supports click/drag creation; toolbar includes select/move/add/fit/zoom/save/restore/delete controls with accessible icon labels/tooltips. |
| Typed graph state | 15 | 15 | `graph.ts` and `types.ts` define deterministic node, port, edge, selection, viewport, draft, and snapshot records; reducer tests cover add/move/select/delete/restore. |
| Ports and compatible connections | 15 | 15 | Connection reducer stores source/target node and port ids, data type, label, and edge id; tests verify compatible connection plus invalid and duplicate rejection without hidden execution. |
| Selectable edge editing | 10 | 10 | SVG edges have selectable hit paths, selected styling, inspector handoff, and selected-edge deletion through reducer state. |
| Reusable node UI design | 10 | 10 | Node cards include icons, titles, ids, status badges, descriptions, input/output counts, ports, selected states, and disabled `Generate later` actions. |
| Structured save/restore boundary | 10 | 10 | Snapshot tests round-trip structured payloads without DOM HTML; UI labels FastAPI durable persistence as unavailable/deferred. |
| Verification and artifacts | 10 | 10 | Baseline startup, tests, typecheck, build, Browser QA, JSON validation, `git diff --check`, and final startup evidence are recorded. |

Current score: 100 / 100 by main rubric; independent evaluator re-score was 96 / 100 before this final stale-evidence cleanup.

## Initial Findings

- Independent evaluator initially scored 70 / 100 and reported: P1 toolbar add-node interaction failed in rendered QA; P2 toolbar mode/help/context/panel scope was incomplete; P2 mobile canvas was clipped without internal reachability; P2 artifacts were stale during evaluation; P3 stale/missing ports could throw instead of returning visible feedback.
- Fixes applied after evaluator pass: toolbar add-node verified 3 -> 4 nodes in Browser QA, toolbar now has mode state, all-node quick-add buttons, and command/help/context/inspector toggles, mobile canvas has internal scroll reachability at 390x844, and `connectPorts` now rejects missing ports with a visible reason.
- Independent evaluator re-score after fixes: 96 / 100 with only P3 stale artifact wording remaining; this cleanup updates the stale 25-test and older Browser QA references.
- `AGENTS.md` is modified before this session and should remain protected as user work.
- Backend persistence, AI generation, provider calls, and orchestration are out of scope and must be labeled honestly.

## Verification Evidence

- Baseline `.\init.ps1` passed before implementation: 6 test files / 18 tests.
- shadcn docs were checked for `button`, `badge`, `card`, `dialog`, `tooltip`, `tabs`, and `separator`.
- shadcn local components added: `tooltip.tsx`, `tabs.tsx`, and `separator.tsx`.
- `corepack pnpm --filter @xmeta/web test` passed after evaluator fixes: 9 test files / 26 tests.
- `corepack pnpm --filter @xmeta/web typecheck` passed.
- `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
- Browser QA desktop passed: `http://localhost:3000/workspace`, title `Workspace Canvas | X-META Video`, canvas/palette/inspector present, no console warn/error logs, toolbar Add Script changed node count from 3 to 4, all-node quick-add controls existed, and no horizontal overflow.
- Browser QA mobile passed at 390x844: workspace loaded, palette and inspector present, no console warn/error logs, document overflow was false, and the canvas viewport had internal scrollability with clientWidth 326 and scrollWidth 1320.
- `feature_list.json` and `feature_tasks/2.json` parsed successfully as JSON.
- `git diff --check` passed with CRLF warnings only.
- Final `.\init.ps1` passed after artifact updates and reran web verification: 9 test files / 26 tests.
- Post-evaluator fix tests passed: 9 test files / 26 tests.
- Post-evaluator fix typecheck and build passed.
- Post-evaluator desktop Browser QA passed: toolbar `Add script node` changed node count from 3 to 4, all quick-add labels existed, console warn/error logs were empty, and document overflow was false.
- Post-evaluator mobile Browser QA passed at 390x844: document overflow false, canvas had internal scrollability with clientWidth 326 and scrollWidth 1320, inspector and quick-add controls existed, and console warn/error logs were empty.

## Verdict

Passing after evaluator fix pass and stale-evidence cleanup.
