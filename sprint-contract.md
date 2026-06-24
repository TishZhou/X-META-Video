# Sprint Contract - Feature 1 Small Task 1 UI TripleD Correction

## Sprint Overview

**Sprint:** Feature-1.1-correction
**Feature:** Feature 1, Main Page Design
**Small task:** `main-page-001` - Render the product entry page
**Correction:** Replace the basic shadcn-only visual treatment with a UI TripleD-inspired animated shadcn implementation.

## Scope

### In Scope

- Keep the app root as the X-META Video product entry page.
- Preserve the required product copy for AI comic drama, MV, and short-form video creation.
- Use UI TripleD as the visual/source reference, copying or adapting source locally instead of adding it as a runtime package.
- Add animation effects appropriate for a premium product entry page.
- Add only the animation dependency required by the selected UI TripleD-style implementation.
- Keep the work frontend-only and static.
- Record verification evidence after the correction.

### Out of Scope

- Implementing `main-page-002` create-project choices.
- Recent work, workspace routing, full canvas execution, backend, auth, project persistence, AI generation, asset library, tasks, or workers.
- Importing UI TripleD as an opaque runtime dependency.
- Switching to UI TripleD Base UI variants.

## Acceptance Criteria

1. Opening the app root still renders an X-META Video entry page.
2. The page visibly includes the `X-META Video` name.
3. The page describes AI comic drama, MV, and short-form video creation.
4. The page uses local animated UI inspired by UI TripleD shadcn source, not only basic static shadcn primitives.
5. The page does not show unrelated chat, messaging, or generic starter content.
6. Verification evidence is recorded in `feature_tasks/1.json`, `progress.md`, and `evaluator-rubric.md`.
7. `.\init.ps1` passes after the correction.

## Verification Plan

1. Inspect UI TripleD source/docs enough to identify the selected animation/source pattern.
2. Run focused content tests.
3. Run `corepack pnpm --filter @xmeta/web typecheck`.
4. Run `corepack pnpm --filter @xmeta/web build`.
5. Run rendered browser QA at desktop and mobile viewports, checking content, no framework overlay, no console errors, and visible animated treatment.
6. Run `git diff --check`.
7. Run final `.\init.ps1`.

## Sprint Log

| Phase           | Outcome                                                                                                                                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User correction | User rejected the basic shadcn-only version and requested UI TripleD because it has animation effects.                                                                                                   |
| Scope update    | Correction remains scoped to `main-page-001`; no `main-page-002` behavior will be added.                                                                                                                 |
| Implementation  | Added a local `AnimatedEntryPage` adapted from the UI TripleD Hero Block shadcn/Framer Motion source pattern; added `framer-motion`; preserved X-META Video product copy and local shadcn/ui primitives. |
| Verification    | `corepack pnpm --filter @xmeta/web test`, typecheck, build, Playwright desktop/mobile QA, animation movement probe, `git diff --check`, and final `.\init.ps1` passed.                                   |
