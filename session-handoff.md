# Session Handoff

## Verified Now

- Feature 2 `Workflow Canvas Foundation` is implemented and recorded as `passing`.
- Feature 1 `Web Design` is also recorded as `passing`; no feature is currently active.
- Current highest-priority unfinished feature is Feature 3, `Script Node`.
- `AGENTS.md` had pre-existing user edits and was not reverted.
- Baseline `.\init.ps1` passed before the 2026-06-29 tailoring pass and reported 9 web test files / 26 tests.
- Post-tailoring verification passed: focused workflow canvas tests 2 files / 8 tests, full web tests 9 files / 27 tests, typecheck, build, fresh Browser QA, JSON validation, `git diff --check`, final `.\init.ps1`, and artifact evidence updates.
- A later browser-comment pass is in progress/verified at code level: focused workflow canvas tests, typecheck, full web tests, and build passed after the toolbar, zoom, Add node, pan, and drag-connection changes.
- The dev server is intentionally running at `http://localhost:3000`, and the in-app browser is open on `/workspace`.

## Feature 2 Implementation State

- `/workspace` renders a canvas-first dark dotted work surface with hidden global top bar, floating project/status controls, graph viewport, bottom toolbar, local-only draft status, and the persistent boundary label `Local only / FastAPI deferred / AI disabled`.
- The default Script, Storyboard, and Composition nodes are framed into the first desktop viewport through calculated initial/Fit view viewport logic.
- Users can add placeholder nodes for script, storyboard, character image, prop/asset, scene image, image composition, audio, video, and export from the single bottom `Add node` menu, now displayed as a compact list of node names.
- Blank-canvas pointer drag pans the viewport; the old Select/Move/Fit toolbar cluster has been removed.
- Zoom is one combined `Canvas zoom` control with a hover/focus/click slider instead of separate zoom-in and zoom-out buttons.
- Users create connections by dragging a line from an output port to a compatible input port; compatible input ports still highlight during the drag.
- Newly added placeholder nodes start below the default graph instead of overlapping the visible starting flow.
- Typed graph state lives under `apps/web/src/lib/workflow-canvas/` with first-class node, port, edge, selection, viewport, draft, and snapshot records.
- Connections store source/target node and port ids, edge id, data type, status, and label; invalid, duplicate, and self connections are rejected.
- Edges render from state as selectable SVG objects and can be inspected/deleted separately from nodes.
- Local save/restore uses structured graph snapshots and avoids DOM HTML persistence.

## Evidence

- `corepack pnpm --filter @xmeta/web test` passed after evaluator fixes: 9 test files / 26 tests.
- `corepack pnpm --filter @xmeta/web typecheck` passed.
- `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
- Desktop Browser QA at `http://localhost:3000/workspace`: correct title, nonblank dark canvas, hidden global top bar, floating project/status controls, bottom toolbar present, no duplicated `Node palette`, no `Inspector`/right monitoring panel, no `Quick add` duplicate list, console warn/error logs empty, and no document overflow.
- Bottom-add interaction QA: `Add node` opened the node-type menu, `Add Audio node` increased rendered node count from 3 to 4, and the menu closed after creation.
- 2026-06-29 fresh Browser QA: default node bounds stayed within the 1254px viewport (`script` right 431, `storyboard` right 771, `composition` right 1111), boundary label was visible, no Node palette/Quick add/Inspector text, no document overflow, Add Audio changed node count 3 -> 4, the Audio node did not overlap the default graph, and no warn/error logs occurred during the QA window.
- 2026-06-29 verification: focused workflow canvas tests passed 2 files / 8 tests; full web tests passed 9 files / 27 tests; typecheck passed; build passed; JSON validation passed; `git diff --check` passed with line-ending warnings only.
- 2026-06-29 browser-comment verification: focused workflow canvas tests passed 2 files / 8 tests; typecheck passed; full web tests passed 9 files / 27 tests; build passed. Browser interaction QA verified Add node list-only menu, blank-canvas panning, and drag connection edge count 2 -> 3 before in-app Browser drag automation timed out on zoom. Final short Browser health check verified `Canvas zoom` and slider DOM exist, old toolbar labels are absent, no framework overlay appears, and no warn/error logs occurred.
- Final `.\init.ps1` passed after artifact updates and reran web verification: 9 test files / 27 tests.
- Evaluator fix pass: toolbar Add Script now changes rendered node count from 3 to 4, all-node quick-add buttons exist, mode/help/context/inspector toggles are stateful, mobile canvas has internal scrollability at 390x844 without document overflow, and missing/stale ports reject with a visible reason. Post-fix tests passed 9 files / 26 tests, typecheck passed, build passed, and desktop/mobile Browser QA had empty console warn/error logs.

## Boundaries

- FastAPI durable workflow persistence remains future backend-owned work.
- Script, image, audio, video, and export generation remain future features.
- The web app does not call model providers directly.
- Do not restore the deleted old Feature 2/3 implementation or the rejected XYFlow draft unless a future task explicitly decides to replace the current typed reducer renderer.

## Next Commands

- Startup: `.\init.ps1`
- Next feature prep: read `feature_tasks/3.json`
- Test: `corepack pnpm --filter @xmeta/web test`
- Typecheck: `corepack pnpm --filter @xmeta/web typecheck`
- Build: `corepack pnpm --filter @xmeta/web build`
