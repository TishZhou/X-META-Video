# Sprint Contract - Feature 1 Small Task 2 Create Project Entry

## Sprint Overview

**Sprint:** Feature-1.2-create-project-entry
**Feature:** Feature 1, Main Page Design
**Small task:** `main-page-002` - Add the create-project entry point
**Goal:** Add a primary Create Project action that opens clear UI-only project-start choices for comic drama, MV, and short-form video.

## Scope

### In Scope

- Keep the app root as the X-META Video product entry page.
- Change the primary homepage action to a Create Project interaction.
- Show three project-start choices after the user clicks Create Project: comic drama, MV, and short-form video.
- Reuse existing local shadcn/ui and `triple-motion` components where they fit.
- Keep all behavior frontend-only and static.
- Label the choices honestly as start templates or entry choices, not persisted projects.
- Record verification evidence after implementation.

### Out of Scope

- Creating real projects, routes, workspace records, or project persistence.
- Backend, auth, account selection, API calls, canvas execution, AI generation, asset library, task queue, or workers.
- Recent work, workspace entry route, full workflow preview expansion, complete responsive pass, or accessibility audit beyond this interaction.
- Importing UI TripleD as an opaque runtime dependency or switching to UI TripleD Base UI variants.

## Acceptance Criteria

1. Opening the app root still renders an X-META Video entry page.
2. A primary `Create Project` action is visible.
3. Clicking `Create Project` reveals project-start choices.
4. The choices are specific to AI comic drama, MV creation, and short-form video.
5. The UI communicates this is a frontend-only start choice until Feature 2 adds real project creation.
6. The page does not show unrelated chat, messaging, or generic starter content.
7. Verification evidence is recorded in `feature_tasks/1.json`, `progress.md`, and `evaluator-rubric.md`.
8. `.\init.ps1` passes after implementation.

## Verification Plan

1. Run shadcn project inspection and use existing installed components before adding new ones.
2. Run focused render tests for required copy, markers, and closed/open create-project state.
3. Run `corepack pnpm --filter @xmeta/web test`.
4. Run `corepack pnpm --filter @xmeta/web typecheck`.
5. Run `corepack pnpm --filter @xmeta/web build`.
6. Run rendered browser QA at desktop and mobile viewports, checking click behavior, visible choices, no console/page errors, and no horizontal overflow.
7. Run `git diff --check`.
8. Run final `.\init.ps1`.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Scope update | Selected `main-page-002` from `feature_tasks/1.json`; implementation will remain UI-only and avoid Feature 2 project persistence. |
| Implementation | Added local create-project state to `AnimatedEntryPage`; changed the primary action to `Create Project`; rendered three frontend-only project-start choices for AI comic drama, MV creation, and short-form video using existing shadcn/ui and `triple-motion` components. |
| Verification | `corepack pnpm --filter @xmeta/web test`, typecheck, build, Playwright desktop/mobile QA, `git diff --check`, and final `.\init.ps1` passed. |
