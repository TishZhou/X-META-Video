# Session Handoff

## Verified Now

- Feature 2 `Workflow Canvas Foundation` is implemented and recorded as `passing`.
- Feature 1 `Web Design` is also recorded as `passing`; no feature is currently active.
- Current highest-priority unfinished feature is Feature 3, `Script Node`.
- `AGENTS.md` had pre-existing user edits and was not reverted.
- Baseline `.\init.ps1` passed before implementation and reported 6 web test files / 18 tests.
- Post-revision verification passed: web tests 9 files / 26 tests, typecheck, build, desktop Browser QA, JSON validation, `git diff --check`, and final `.\init.ps1`.

## Feature 2 Implementation State

- `/workspace` renders a canvas-first dark dotted work surface with hidden global top bar, floating project/status controls, graph viewport, bottom toolbar, local-only draft status, and honest unavailable backend/AI labels.
- Users can add placeholder nodes for script, storyboard, character image, prop/asset, scene image, image composition, audio, video, and export from the single bottom `Add node` menu.
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
- Final `.\init.ps1` passed after artifact updates and reran web verification: 9 test files / 26 tests.
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
