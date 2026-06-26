# Sprint Contract - Feature 2 Workflow Canvas Foundation

## Sprint Overview

**Sprint:** feature-2-workflow-canvas-foundation
**Feature:** Feature 2, Workflow Canvas Foundation
**Status:** passing
**Goal:** Implement a verified Figma-like workflow canvas foundation where the canvas is the primary work surface, users can add/move/select/connect/delete/save/restore placeholder AI workflow nodes from a single bottom add entry, and the UI does not imply backend persistence or AI execution exists.

## Write Scope

- `apps/web/src/app/workspace/**`
- `apps/web/src/components/xmeta/workflow-canvas/**`
- `apps/web/src/lib/workflow-canvas/**`
- `apps/web/src/components/ui/tooltip.tsx`
- `apps/web/src/components/ui/tabs.tsx`
- `apps/web/src/components/ui/separator.tsx`
- Focused tests for the files above
- `feature_tasks/2.json`
- `feature_list.json`
- `sprint-contract.md`
- `evaluator-rubric.md`
- `progress.md`
- `session-handoff.md`

Protected user edit:

- `AGENTS.md` is already modified and must not be reverted.

## In Scope

- Canvas-first `/workspace` route with the global top bar hidden and a floating canvas project bar.
- Composed bottom dock using local shadcn-style primitives where available.
- Drag-to-canvas placeholder node creation for script, storyboard, character image, prop/asset, scene image, image composition, audio, video, and export.
- Typed React graph state for nodes, ports, edges, selection, viewport, draft status, and structured snapshots.
- First-class compatible port connections with invalid, self, and duplicate rejection.
- Selectable nodes and edges with delete behavior and compact in-canvas status feedback.
- Reusable compact node UI with icons, status labels, input/output ports, selected states, and disabled deferred execution controls.
- Local save/restore boundary that round-trips graph payloads without serializing DOM HTML.
- Honest labels for missing FastAPI durable persistence and missing AI execution.

## Out of Scope

- Actual script/image/audio/video/export generation.
- Provider calls, worker orchestration, storage upload, task queue execution, and generated assets.
- Production auth/workspace membership enforcement.
- Durable backend workflow persistence endpoints.
- Restoring deleted legacy Feature 2/3 code.

## Acceptance Criteria

1. `/workspace` renders a production work surface with a dark dotted canvas, floating project bar, bottom toolbar, graph viewport, and persistence status signals.
2. Users can add every planned placeholder node type from one bottom `Add node` entry; duplicate left-palette or toolbar node lists are not present by default.
3. Users can move, select, and delete nodes; selected state is reflected in compact in-canvas status copy.
4. Ports are typed records, and compatible output-to-input connections create first-class edges.
5. Invalid, self, and duplicate connections are rejected with visible status feedback and no hidden generation.
6. Edges are selectable, inspectable, and removable independently from nodes.
7. Save/restore uses structured graph snapshots and local fixture/state only, with FastAPI persistence clearly deferred.
8. Tests cover graph reducer/store behavior, connection compatibility, snapshot round-trip, and route-visible canvas content.
9. Verification runs include baseline `.\init.ps1`, focused web tests, typecheck, build, rendered QA, JSON validation, and final `.\init.ps1`.

## Verification Plan

1. Baseline: `.\init.ps1` before implementation.
2. Focused tests: `corepack pnpm --filter @xmeta/web test`.
3. Typecheck: `corepack pnpm --filter @xmeta/web typecheck`.
4. Build: `corepack pnpm --filter @xmeta/web build`.
5. Rendered QA: desktop workspace checks for nonblank canvas, controls, no console errors, no duplicate node-add surfaces, and no right monitoring/inspector panel.
6. JSON validation: `Get-Content -Raw feature_list.json | ConvertFrom-Json | Out-Null` and `Get-Content -Raw feature_tasks/2.json | ConvertFrom-Json | Out-Null`.
7. Final restart path: `.\init.ps1`.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | Confirmed working directory `D:\X-META-Video`; read `AGENTS.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `feature_list.json`, `progress.md`, `session-handoff.md`, `sprint-contract.md`, `evaluator-rubric.md`, and `feature_tasks/2.json`. |
| Startup | Ran `.\init.ps1`; it passed and reported 6 web test files / 18 tests passing. |
| Recent commits | Reviewed `git log --oneline -5`: `6e2aa53`, `74abd95`, `22dce0e`, `7cc7489`, and `2088e13`. |
| Skill setup | Used shadcn and uiux-design-evaluator skills; read required UI planning, UI detail, Laws of UX, and usability references for the workspace implementation. |
| shadcn setup | `corepack pnpm dlx shadcn@latest docs button badge card dialog tooltip tabs separator` returned component docs/examples/API links. `corepack pnpm dlx shadcn@latest add tooltip tabs separator` failed on pnpm version mismatch; direct `pnpm dlx shadcn@latest add tooltip tabs separator` succeeded and created local component source files. |
| Subagents | Started separate planning and acting subagents. Acting is allowed to proceed without waiting for evaluation; evaluator feedback will be applied near the end. |
| Implementation | Added `/workspace`, a composed toolbar, draggable/clickable node palette, typed graph reducer, first-class ports/edges, selected edge inspection/deletion, reusable compact node cards, local snapshots, and explicit deferred backend/AI labels. |
| Integration | Removed the alternate incompatible XYFlow draft generated during parallel acting and kept one typed reducer plus state-driven SVG edge renderer to avoid conflicting graph models. |
| Tests | `corepack pnpm --filter @xmeta/web test` passed after evaluator fixes: 9 test files / 26 tests. |
| Typecheck | `corepack pnpm --filter @xmeta/web typecheck` passed. |
| Build | `corepack pnpm --filter @xmeta/web build` passed and generated `/workspace`. |
| Rendered QA | Browser QA passed on desktop and 390x844 mobile: workspace route loaded, canvas/palette/inspector present, console warn/error logs empty, toolbar Add Script changed node count from 3 to 4, all-node quick-add controls existed, mobile canvas had internal scrollability, and no document horizontal overflow. |
| JSON and whitespace | `feature_list.json` and `feature_tasks/2.json` parsed successfully; `git diff --check` passed with CRLF warnings only. |
| Final startup | Final `.\init.ps1` passed after artifact updates and reran web verification: 9 test files / 26 tests. |
| Evaluator fix pass | Fixed evaluator findings: toolbar add now works in Browser QA, all-node quick-add buttons and mode/panel toggles exist, mobile canvas has internal scroll reachability without document overflow, and stale/missing ports are rejected with a visible reason. |
| Post-fix verification | `corepack pnpm --filter @xmeta/web test` passed 9 files / 26 tests; typecheck passed; build passed; desktop Browser QA verified toolbar add 3 -> 4 nodes; mobile Browser QA verified scrollable canvas with no console warn/error logs. |
| User visual revision | Updated `/workspace` to match the reference direction: dark Figma-like canvas as the main surface, floating top project/status controls, one bottom add entry, no left node palette, and no right monitoring/Inspector panel. |
| Revision verification | `corepack pnpm --filter @xmeta/web test` passed 9 files / 26 tests; typecheck passed; build passed; desktop Browser QA on `http://localhost:3000/workspace` showed nonblank canvas, hidden global top bar, bottom toolbar, no node palette text, no Inspector text, empty console warn/error logs, and no document overflow. |
| Final restart | `.\init.ps1` passed after artifact updates and reran web verification: 9 test files / 26 tests. |
