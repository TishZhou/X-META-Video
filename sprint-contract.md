# Sprint Contract - Feature 1 Main Page Pro Layout Reflow

## Sprint Overview

**Sprint:** Feature-1-layout-pro-reflow
**Feature:** Feature 1, Main Page Design
**Small task:** Main page layout correction after `main-page-002`
**Goal:** Use the `ui-ux-pro-max` design rules to reflow the main page while preserving the existing shadcn/UI TripleD visual style and current frontend-only behavior.

## Scope

### In Scope

- Keep the app root as the X-META Video product entry page.
- Preserve the existing shadcn/ui + local UI TripleD-inspired `triple-motion` visual language.
- Improve first-viewport information hierarchy, spacing, line length, touch targets, and desktop/mobile layout balance.
- Keep the `Create Project` interaction and its three frontend-only project-start choices.
- Keep production mode expandable cards, but move them into a clearer page rhythm.
- Use `ui-ux-pro-max` priority checks: accessibility, touch/interaction, responsive layout, style consistency, typography/color, and meaningful motion.
- Record verification evidence after implementation.

### Out of Scope

- Changing the product brand, color system, component library, or UI TripleD/shadcn style.
- Creating real projects, routes, workspace records, backend calls, persistence, auth, canvas execution, AI generation, asset library, task queue, or workers.
- Completing `main-page-003` recent work, `main-page-004` workspace path, or later Feature 1 tasks.
- Importing UI TripleD as an opaque runtime dependency or switching to UI TripleD Base UI variants.

## Acceptance Criteria

1. Opening the app root still renders an X-META Video entry page.
2. The page keeps the existing UI TripleD/shadcn motion style and component markers.
3. The first viewport has clearer layout hierarchy than the previous stacked-left-column treatment.
4. `Create Project` still reveals project-start choices for AI comic drama, MV creation, and short-form video.
5. Production mode cards remain reachable and expandable.
6. Desktop and mobile layouts have no horizontal overflow, clipped text, overlapping controls, or hidden primary actions.
7. The page does not show unrelated chat, messaging, or generic starter content.
8. Verification evidence is recorded in `progress.md`, `sprint-contract.md`, `evaluator-rubric.md`, and `session-handoff.md`.
9. `.\init.ps1` passes after implementation.

## Verification Plan

1. Run baseline `.\init.ps1`.
2. Inspect shadcn project config and existing installed components.
3. Apply `ui-ux-pro-max` design checks manually because local Python is unavailable for its search CLI.
4. Run focused render tests for required content, style markers, and layout marker.
5. Run `corepack pnpm --filter @xmeta/web test`.
6. Run `corepack pnpm --filter @xmeta/web typecheck`.
7. Run `corepack pnpm --filter @xmeta/web build`.
8. Run rendered QA at desktop and mobile viewports, checking page identity, layout, Create Project interaction, production card expansion, console/page errors, and horizontal overflow.
9. Run `git diff --check`.
10. Run final `.\init.ps1`.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Scope update | Selected Feature 1 main page layout correction; work stays inside the already-active Main Page Design feature and does not advance unrelated feature tasks. |
| Design rules | Applied `ui-ux-pro-max` priorities manually: accessibility, touch target clarity, responsive breakpoints, consistent style, semantic tokens, one primary CTA, and motion continuity. |
| Implementation | Reflowed the page into a stable left hero/action column, right canvas preview/create-project panel, and separate production modes band; removed the floating scroll hint that overlapped content. |
| Verification | Vitest, typecheck, Next build, Playwright desktop/mobile QA, `git diff --check`, and final `.\init.ps1` passed. |
