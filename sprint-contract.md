# Sprint Contract - Feature 1 Small Task 1

## Sprint Overview

**Sprint:** Feature-1.1
**Feature:** Feature 1, Main Page Design
**Small task:** `main-page-001` - Render the product entry page
**Duration:** 1 focused UI implementation

## Scope

### In Scope

- Render an X-META Video product entry page at the app root.
- Show the product name as a first-viewport signal.
- Describe AI comic drama, MV, and short-form video creation.
- Replace any blank, generic starter, or unrelated conversation UI.
- Keep implementation frontend-only with static content.
- Use the existing Tailwind/shadcn token setup and local source patterns.
- Add focused verification for rendered main-page copy.

### Out of Scope

- Create-project interaction choices; reserved for `main-page-002`.
- Recent work cards or empty state; reserved for `main-page-003`.
- Workspace route or placeholder; reserved for `main-page-004`.
- Full workflow preview; reserved for `main-page-005`.
- Full responsive/accessibility completion criteria; reserved for `main-page-006` and `main-page-007`.
- Backend, auth, project persistence, canvas, AI generation, asset library, task status, or worker behavior.
- Adding UI TripleD as a runtime dependency.

## Acceptance Criteria

1. Opening the app root renders an X-META Video entry page.
2. The page visibly includes the `X-META Video` name.
3. The page describes AI comic drama, MV, and short-form video creation.
4. The page does not show unrelated chat, messaging, or generic starter content.
5. Static UI only; no backend, auth, persistence, or generation behavior is implied.
6. Verification evidence is recorded in `feature_tasks/1.json`, `progress.md`, and `evaluator-rubric.md`.
7. `.\init.ps1` passes after the implementation.

## Verification Plan

1. Add or update a focused test for the main-page content.
2. Run `corepack pnpm --filter @xmeta/web test`.
3. Run `git diff --check` for changed files.
4. Run `.\init.ps1`.
5. If a browser/dev-server path is available, open the app root and inspect the rendered page.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Scope update | Selected exactly one child task: `main-page-001`. |
| Baseline verification | `.\init.ps1` passed before implementation; Vitest ran 1 test file with 2 passing tests. |
| Implementation | Added a static App Router product entry page, local shadcn button/badge/card components, focused render tests, and a favicon/icon route. |
| Verification | `corepack pnpm --filter @xmeta/web test`, `typecheck`, and `build` passed; Playwright fallback with system Chrome passed desktop/mobile smoke checks and anchor interactions; final `.\init.ps1` passed. |
