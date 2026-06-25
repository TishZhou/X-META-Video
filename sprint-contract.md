# Sprint Contract - Feature 3 Project Foundation And Motion App Shell

## Sprint Overview

**Sprint:** Feature-3-project-foundation-motion-app-shell  
**Feature:** Feature 3, Project Foundation And Motion App Shell  
**Status:** Planning initialized after product direction update.  
**Goal:** Replace the static Feature 2 workspace scaffolding with a motion-first project workspace foundation that uses real selected UI TripleD shadcn block patterns, Framer Motion page/shell transitions, and local project/workspace context.

## Scope

### In Scope

- Keep shadcn/ui as local source primitives, but move beyond basic Card/Button/Badge-only layouts.
- Select and adapt real UI TripleD shadcn block patterns as local source where they fit the product:
  - Hero or entry shell: `glowy-waves-hero`, `glassmorphism-hero-block`, or equivalent.
  - Workspace overview: `dashboard` or metric/dashboard block pattern.
  - Project/recent work: `project-card` or projects block pattern.
  - Canvas/workflow preview: `n8n-workflow-block`, workflow block, task card, or animated node pattern.
  - Account/workspace settings: `glass-account-settings-card` or account settings block pattern.
  - AI generation states: `ai-glow-input`, `ai-loading-skeleton`, `ai-response-typing`, or equivalent.
- Add Framer Motion route/shell transitions for entry, workspace, canvas, assets, tasks, history, export, and account surfaces.
- Add animated state changes for selected nodes, panels, asset cards, project cards, task rows, loading/progress states, retry/failure, and export readiness.
- Preserve reduced-motion behavior and text status labels so motion supports usability rather than replacing information.
- Introduce default development project/workspace context as local state or structured local data until backend persistence exists.
- Keep backend, persistence, auth, queue, worker, provider, audit, and export-rendering boundaries honest when not implemented.
- Handle unfinished functions with compact interaction patterns: show a short disabled/preview state, tooltip, modal, drawer, or expandable detail on click. Do not dump long missing-capability descriptions directly into the main page layout.
- Verify desktop and mobile rendered behavior, including no horizontal overflow and no console/page errors.

### Out of Scope

- Production auth, persisted projects, FastAPI routes, model provider calls, queue workers, object storage, audit persistence, and export rendering unless explicitly moved into this feature later.
- Importing UI TripleD as an opaque runtime dependency.
- Using Base UI variants without architecture approval.
- Merely adding `data-uitripled-*` markers while keeping static placeholder cards.
- Motion that hides state, delays common tasks, breaks keyboard access, or ignores reduced-motion preferences.
- Long always-visible explanatory paragraphs for every unfinished function or placeholder.

## Acceptance Criteria

1. Feature 3 has a concrete selected block list before implementation begins, with rationale for where each block maps in the product.
2. The entry/workspace shell uses at least one real adapted UI TripleD shadcn block pattern, not only local basic cards.
3. Workspace overview includes animated dashboard/project context states and a clear default development workspace/project.
4. Canvas/workflow surface includes animated node/workflow presentation, selected-node state, and panel transitions.
5. Asset/project cards use a richer selected block/card pattern with hover/focus/selection states.
6. Task/generation surfaces include animated loading, progress, success, failure, and retry states with text labels.
7. Route or shell transitions exist between the major workspace surfaces and respect reduced-motion.
8. Keyboard navigation, focus visibility, accessible labels, and text status labels remain intact.
9. Unfinished functions use concise visible labels with click-to-reveal detail, such as "Not built yet", "Requires backend", or "Coming in Feature X"; they do not clutter the primary workflow with full descriptions.
10. Tests, typecheck, build, rendered desktop QA, rendered mobile QA, and final `.\init.ps1` pass before Feature 3 is marked passing.

## Verification Plan

1. Run baseline `.\init.ps1`.
2. Validate JSON syntax for `feature_list.json` and `feature_tasks/*.json`.
3. Run `corepack pnpm --filter @xmeta/web test`.
4. Run `corepack pnpm --filter @xmeta/web typecheck`.
5. Run `corepack pnpm --filter @xmeta/web build`.
6. Run rendered desktop QA on the modified routes.
7. Run rendered mobile QA on the modified routes.
8. Verify selected UI TripleD block adaptations are present as local source and are not name-only imitations.
9. Verify reduced-motion and text status labels exist for animated states.
10. Run final `.\init.ps1`.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Direction update | User rejected static preview/model work and requested the product purpose shift to complete motion. |
| Scope reset | Feature 3 renamed to `Project Foundation And Motion App Shell`; product, architecture, dependency, handoff, and progress docs now describe motion-first UI as the target. |
| Current implementation reality | Existing `/workspace` pages remain Feature 2 static/local prototypes and should be treated as scaffolding to replace. |
| Task 1-3 slice | Current session scope is limited to `motion-shell-001`, `motion-shell-002`, and `motion-shell-003`: selected UI TripleD-style shadcn/Radix + Framer Motion pattern mapping, motion-first workspace shell, and upgraded workspace dashboard/project cards. |
| Baseline verification | `.\init.ps1` passed on 2026-06-25 before Feature 3 task 1-3 edits; Vitest passed 3 files / 16 tests. |

## Current Task 1-3 Contract

### Selected UI TripleD-Style shadcn/Radix Pattern Candidates

| Pattern | Local adaptation target | Product mapping | Base UI status |
| --- | --- | --- | --- |
| `animated navigation` / app-shell block | `WorkspaceShell`, `MotionShellHeader`, `MotionRouteFrame`, `MotionNavItem` | Persistent creative workspace navigation, active route state, route transition wrapper | No Base UI variant selected |
| `dashboard` / metric dashboard block | `DashboardMetricTile` and readiness rail | Default local project context, workspace metrics, readiness signals, route progress summary | No Base UI variant selected |
| `project-card` / animated project card block | `ProjectMotionCard` and `UnavailableDisclosure` | Recent project cards, selected local project, continue-work actions, compact missing-persistence disclosure | No Base UI variant selected |

### Task 1-3 Acceptance

- `motion-shell-001`: selected block names and product mappings are recorded here and in `feature_tasks/3.json` evidence after implementation.
- `motion-shell-002`: `/workspace` and shared workspace shell render with Framer Motion route/shell/card transitions, reduced-motion markers, current route state, and a default local project/workspace context.
- `motion-shell-003`: workspace overview replaces shallow route/static cards with product-specific dashboard, project, readiness, and recent-work surfaces using richer local UI TripleD-inspired source.
- Unfinished actions stay compact and honest; details are revealed through click-to-expand patterns or disabled labels instead of long always-visible placeholder paragraphs.
- Required verification for this slice: JSON validation, web tests, typecheck, build, rendered desktop/mobile QA where feasible, and final `.\init.ps1` before marking all three child tasks passing.

### Task 1-3 Evidence

- Implementation files: `apps/web/src/app/workspace/workspace-motion.tsx`, `apps/web/src/app/workspace/workspace-components.tsx`, `apps/web/src/app/workspace/workspace-data.ts`, `apps/web/src/app/workspace/page.tsx`, and `apps/web/src/app/workspace/workspace.test.tsx`.
- Evaluator note: task 1-3 implementation is recorded as local UI TripleD-style shadcn/Radix + Framer Motion adaptations. It should not be described as copied upstream UI TripleD block source unless upstream provenance is recorded later.
- Verification passed: JSON validation; `corepack pnpm --filter @xmeta/web test` passed 3 files / 18 tests; `corepack pnpm --filter @xmeta/web typecheck` passed after build/typecheck were run sequentially; `corepack pnpm --filter @xmeta/web build` passed and statically generated all workspace routes; final `.\init.ps1` passed; `git diff --check` passed.
- Rendered QA with Chrome headless/CDP against `http://127.0.0.1:3004`: desktop `/workspace` 1440x900, mobile `/workspace` 390x844, and mobile `/workspace/canvas` 390x844 had no console warnings/errors, no page errors, and no horizontal overflow.
- Screenshot evidence: `C:\Users\AI\AppData\Local\Temp\xmeta-feature3-qa\workspace-desktop.png`, `C:\Users\AI\AppData\Local\Temp\xmeta-feature3-qa\workspace-mobile.png`, and `C:\Users\AI\AppData\Local\Temp\xmeta-feature3-qa\canvas-mobile.png`.
