# Session Handoff

## Verified Now

- Current active feature remains Feature 1, Web Design, with `web-design-004` previously passing.
- Current planning update: Feature 2 `Workflow Canvas Foundation` task plan was rewritten in `feature_tasks/2.json` to match `feature_tasks/1.json` top-level format exactly.
- `feature_tasks/2.json` now has only these top-level keys: `parent_feature`, `planning_status`, `notes`, and `small_features`.
- Planning write scope for this session was limited to `feature_tasks/2.json`, `sprint-contract.md`, `evaluator-rubric.md`, `progress.md`, and `session-handoff.md`.
- `.\init.ps1` passed before artifact work and reported 6 web test files / 18 tests passing.
- JSON validation passed for `feature_tasks/2.json`; top-level keys resolved to `parent_feature, planning_status, notes, small_features`.

## Feature 2 Plan State

- Feature 2 remains `Workflow Canvas Foundation`, parent id `2`, status `not_started`.
- The plan covers a canvas-first workspace route, composed toolbar and node palette, typed React graph state, first-class ports, free compatible connections, selectable edge rendering, reusable node UI design, structured persistence payloads, and final verification.
- The toolbar should be composed from shadcn primitives because no standalone toolbar item was found.
- Users should be able to drag placeholder node types onto the canvas: script, storyboard, character image, prop/asset, scene image, image composition, audio, video, and export.
- Actual node functionality is deferred: no AI execution, provider calls, backend orchestration, generated asset creation, or export rendering belongs in this Feature 2 planning update.

## Evidence

- shadcn skill was used for the toolbar/component planning requirement.
- `corepack pnpm dlx shadcn@latest docs command resizable sidebar toggle-group tooltip tabs menubar context-menu sheet scroll-area separator` returned docs/examples/API links for all requested primitives.
- `apps/web/components.json` configures `@uitripled`.
- shadcn toolbar registry search from `apps/web` with `corepack pnpm dlx shadcn@latest search -q toolbar` failed to parse the `@uitripled` catalog because `name` and `homepage` are required, and returned no standalone `toolbar` item.
- Demo doc analyzed: `D:/kpop/docs/canvas-node-connections.md`.
- Demo weakness recorded: legacy connection state lives in DOM plus SVG `app.js`, uses `{ fromId, toId }` connections, DOM class ports, imperative SVG redraw, non-selectable edge overlay, and HTML-coupled persistence.
- Feature 2 improvement recorded: typed React graph state, first-class node/port/edge records, selectable edges, deterministic state tests, and structured persistence payloads.

## Boundaries

- Do not edit app/source code for this planning-only task.
- Do not edit `feature_list.json`, docs, or other task files for this planning-only task.
- Do not restore deleted old Feature 2/3 implementation files.
- Keep architecture boundaries explicit: Web owns canvas UX/local draft graph state; FastAPI later owns durable workflow/project/task state; web does not call AI providers directly.

## Verification To Carry Forward

- Future Feature 2 implementation should run `.\init.ps1` first, then focused web tests for workspace route, toolbar composition, graph state, port connection behavior, edge selection, node UI, and save/restore fixtures.
- Before Feature 2 can be marked passing, run typecheck, build, rendered desktop/mobile QA, JSON validation, and final `.\init.ps1`.

## Commands

- Startup: `.\init.ps1`
- Validate Feature 2 JSON: `Get-Content -Raw feature_tasks/2.json | ConvertFrom-Json | Out-Null`
- Test: `corepack pnpm --filter @xmeta/web test`
- Typecheck: `corepack pnpm --filter @xmeta/web typecheck`
- Build: `corepack pnpm --filter @xmeta/web build`
