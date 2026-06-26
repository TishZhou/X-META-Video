# Sprint Contract - Feature 1 Web Design

## Sprint Overview

**Sprint:** feature-1-web-design-002-code-foundation
**Feature:** Feature 1, Web Design
**Status:** `web-design-002` passing; Feature 1 remains in progress.
**Goal:** Implement the interface design system as reusable web app code, not as product/design documentation.

## Scope

### In Scope

- Define the X-META typography, surface, color, density, layout, motion, responsive, and accessibility contract in shared frontend code.
- Define project, node, asset, generation, history, and export readiness state language in typed code definitions.
- Wire the reset foundation page to consume the shared definitions.
- Add tests proving the code-defined design system and state domains exist.
- Verify rendered desktop and mobile behavior.

### Out of Scope

- Adding style or layout guidance to product/design docs.
- Implementing detailed workspace, canvas, assets, tasks, history, export, or account pages.
- Restoring deleted Feature 2 or Feature 3 prototypes.
- Claiming production backend, persistence, generation, asset storage, history, or export behavior.

## Acceptance Criteria

1. `apps/web/src/lib/design-system.ts` exports reusable X-META design and state-language definitions.
2. `apps/web/src/components/xmeta/design-primitives.tsx` provides shared primitives using those definitions.
3. `apps/web/src/index.css` and `apps/web/tailwind.config.ts` expose the semantic tokens required by the code definitions.
4. The reset foundation page uses the shared definitions and includes reachable state-language UI.
5. Tests, typecheck, build, diff check, startup verification, and rendered desktop/mobile QA pass.

## Verification Plan

1. Run `.\init.ps1`.
2. Run `corepack pnpm --filter @xmeta/web test`.
3. Run `corepack pnpm --filter @xmeta/web typecheck`.
4. Run `corepack pnpm --filter @xmeta/web build`.
5. Run `git diff --check`.
6. Render `http://localhost:3001` in the in-app browser at desktop and mobile widths.
7. Check page identity, nonblank content, no framework overlay, console health, one interaction, and horizontal overflow.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | Initial `.\init.ps1` passed before implementation. |
| Code foundation | Added typed design-system definitions and X-META primitives. |
| Styling runtime | Added semantic CSS/Tailwind tokens for surfaces, tones, shadows, motion, and reduced-motion behavior. |
| Page wiring | Root reset page now consumes shared code definitions and exposes a state-language anchor interaction. |
| Automated verification | Web tests passed 3 files / 11 tests; typecheck passed; build passed; `git diff --check` passed with line-ending warnings only. |
| Rendered QA | Browser QA passed on desktop and mobile: content rendered, state anchor click worked, console errors were empty, and no horizontal overflow was detected. |
| Final startup | Final `.\init.ps1` passed after artifact updates and reran web tests: 3 files / 11 tests. |
