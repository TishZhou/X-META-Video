# Sprint Contract - Feature 1 Small Task 1 Animated Component Foundation

## Sprint Overview

**Sprint:** Feature-1.1-animation-foundation
**Feature:** Feature 1, Main Page Design
**Small task:** `main-page-001` - Render the product entry page
**Correction:** Convert the one-off UI TripleD-inspired page animation into reusable animated UI components and apply click-to-expand information cards.

## Scope

### In Scope

- Keep the app root as the X-META Video product entry page.
- Preserve the required product copy for AI comic drama, MV, and short-form video creation.
- Use UI TripleD as the visual/source reference, copying or adapting source patterns locally instead of adding it as a runtime package.
- Add a reusable local animated component layer for motion background, buttons, cards, panels, and expandable info cards.
- Use Framer Motion for hover, tap, reveal, background, and expand/collapse effects.
- Use shadcn/Radix primitives where they fit the component behavior.
- Keep the work frontend-only and static.
- Record verification evidence after the correction.

### Out of Scope

- Implementing `main-page-002` create-project choices.
- Recent work, workspace routing, full canvas execution, backend, auth, project persistence, AI generation, asset library, tasks, or workers.
- Importing UI TripleD as an opaque runtime dependency.
- Switching to UI TripleD Base UI variants.
- Building a complete design system or every future app component.

## Acceptance Criteria

1. Opening the app root still renders an X-META Video entry page.
2. The page visibly includes the `X-META Video` name.
3. The page describes AI comic drama, MV, and short-form video creation.
4. Most visible homepage UI primitives are driven by reusable local animated components, not one-off `motion.div` wrappers scattered through the page.
5. Production mode cards support click-to-expand info with real open/closed state.
6. The page does not show unrelated chat, messaging, or generic starter content.
7. Verification evidence is recorded in `feature_tasks/1.json`, `progress.md`, and `evaluator-rubric.md`.
8. `.\init.ps1` passes after the correction.

## Verification Plan

1. Inspect UI TripleD and shadcn/Radix docs enough to identify the selected animation/source pattern.
2. Run focused content and marker tests.
3. Run `corepack pnpm --filter @xmeta/web typecheck`.
4. Run `corepack pnpm --filter @xmeta/web build`.
5. Run rendered Browser QA at desktop and mobile viewports, checking content, no framework overlay, no console errors, visible animated treatment, hover/tap behavior, and expand/collapse info state.
6. Run `git diff --check`.
7. Run final `.\init.ps1`.

## Sprint Log

| Phase           | Outcome                                                                                                                                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User correction | User rejected the basic shadcn-only version and requested UI TripleD because it has animation effects.                                                                                                    |
| Scope update    | Correction remains scoped to `main-page-001`; no `main-page-002` behavior will be added.                                                                                                                  |
| Implementation  | Added reusable local `triple-motion` components for animated background, links, buttons, cards, panels, and expandable info cards; added Radix Collapsible and migrated the homepage to these primitives. |
| Verification    | `corepack pnpm --filter @xmeta/web test`, typecheck, build, Browser desktop/mobile QA, expand/collapse interaction checks, `git diff --check`, and final `.\init.ps1` passed.                             |
