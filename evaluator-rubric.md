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
| Canvas workspace route and shell | 15 | 15 | `/workspace` renders a dark dotted canvas as the primary surface, floating project/status controls, graph viewport, bottom dock, deferred backend labels, and no document overflow in desktop Browser QA. |
| Composed toolbar and node add entry | 15 | 15 | One bottom `Add node` entry exposes all nine placeholder node types on demand; duplicate left palette and default toolbar node list are removed. |
| Typed graph state | 15 | 15 | `graph.ts` and `types.ts` define deterministic node, port, edge, selection, viewport, draft, and snapshot records; reducer tests cover add/move/select/delete/restore. |
| Ports and compatible connections | 15 | 15 | Connection reducer stores source/target node and port ids, data type, label, and edge id; tests verify compatible connection plus invalid and duplicate rejection without hidden execution. |
| Selectable edge editing | 10 | 10 | SVG edges have selectable hit paths, selected styling, compact in-canvas status handoff, and selected-edge deletion through reducer state. |
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
- User-requested visual revision removed the duplicated left node palette and right monitoring/Inspector panel; desktop canvas QA is the acceptance target for this revision.

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

## Verdict

Passing after evaluator fix pass and stale-evidence cleanup.
