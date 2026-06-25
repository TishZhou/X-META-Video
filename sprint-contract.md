# Sprint Contract - Feature 2 Interface Design

## Sprint Overview

**Sprint:** Feature-2-interface-design
**Feature:** Feature 2, Interface Design
**Small tasks:** `interface-design-001` through `interface-design-008`
**Goal:** Design the X-META Video interface and then implement the initial web page prototypes that make the planned page set visible in `apps/web` before Feature 3 turns the shell into functional project foundation behavior.

## Scope

### In Scope

- Map every MVP product function from `docs/PRODUCT.md` into a page, screen, panel, drawer, modal, or canvas region.
- Define the screen set for main entry, project/workspace shell, workflow canvas, node configuration, asset library, task status/retry, generation history/version timeline, export, auth, and workspace management.
- Write User Interface Sketching and Wireframing Guidelines using task-to-screen mapping, screen content inventories, information architecture, entry/exit paths, hierarchy, grouping, and no-dead-end review.
- Implement initial static/local web pages or sections in `apps/web` that represent the planned interface: workspace overview, canvas preview, node inspector, asset library, task status, history, export, and account/workspace management.
- Preserve shadcn/ui as the base local component system and use the existing UI TripleD-inspired direction where it fits the product surface.
- Implement responsive desktop/mobile behavior and accessibility basics for the initial page prototypes.
- Keep backend, connector, orchestration, persistence, audit, and AI generation capabilities labeled as planned or missing unless already implemented.
- Record evidence in `feature_tasks/2.json`, `feature_list.json`, `progress.md`, `sprint-contract.md`, `evaluator-rubric.md`, and `session-handoff.md` when the feature is implemented.

### Out of Scope

- Real project creation, persisted project/workspace state, production auth, FastAPI route implementation, task queue, workers, model calls, export rendering, generated asset persistence, or production-ready canvas execution.
- Completing Feature 3 Project Foundation And App Shell; Feature 3 should build on the static/prototype pages from Feature 2.
- Completing Feature 4 Workflow Canvas Foundation; Feature 2 may show a static canvas preview or non-executing prototype only.
- Changing product architecture boundaries in `docs/ARCHITECTURE.md` unless a documented contradiction is found.
- Marking Feature 2 passing before both the design artifacts and initial web page implementation exist and verification has run.

## Acceptance Criteria

1. `interface-design-001`: Page functions are defined for every major X-META Video surface and do not imply unimplemented backend or AI execution behavior.
2. `interface-design-002`: The MVP screen inventory lists titles, purposes, primary and secondary actions, and empty/loading/error state notes.
3. `interface-design-003`: Information architecture documents screen relationships, entry points, exit points, navigation regions, contextual panels, and no dead ends.
4. `interface-design-004`: Core sketches or wireframe descriptions label regions, interactions, and feedback while keeping the canvas as the central creative workspace.
5. `interface-design-005`: Wireframing guidelines define reusable layout patterns for app shell, toolbar, node cards, inspectors, asset cards, tables, status regions, and all planned node surfaces.
6. `interface-design-006`: Initial web pages or sections are implemented in `apps/web` for workspace overview, workflow canvas, node configuration, asset library, task status, history, export, and account/workspace management using static/local data only.
7. `interface-design-007`: Desktop and mobile prototype states keep primary actions reachable, communicate missing backend capabilities honestly, and meet basic keyboard/focus/label/status requirements.
8. `interface-design-008`: Tests, typecheck, build, and rendered QA run, and the handoff gives Feature 3 enough design and prototype context without relying on chat history.
9. `.\init.ps1` passes before any feature status is marked passing.

## Verification Plan

1. Baseline already run this session: `.\init.ps1` passed before artifact updates.
2. Validate JSON syntax for `feature_list.json` and every `feature_tasks/*.json` file.
3. Verify Feature 2 states both design artifacts and initial web page implementation are in scope.
4. Run focused render tests with `corepack pnpm --filter @xmeta/web test`.
5. Run `corepack pnpm --filter @xmeta/web typecheck`.
6. Run `corepack pnpm --filter @xmeta/web build`.
7. Run rendered QA at desktop `1440x900` and mobile `390x844` for the implemented Feature 2 pages.
8. Verify there are no backend/model/provider calls, no hidden persistence claims, no generic chat/starter content, no console/page errors, and no horizontal overflow.
9. Run `git diff --check`, noting any pre-existing user-owned `AGENTS.md` whitespace separately if still present.
10. Run final `.\init.ps1`.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Scope update | Updated Feature 2 so Interface Design includes both design artifacts and initial web page implementation. |
| User clarification | User clarified that Feature 2 should include page implementation on the web after design, not only planning artifacts. |
| Baseline | `.\init.ps1` passed on 2026-06-25 before Feature 2 implementation. |
| Planning subagent | Recommended `docs/INTERFACE_DESIGN.md`, `docs/WIREFRAMING_GUIDELINES.md`, `/workspace` prototype routes, shared workspace prototype components, route render tests, desktop/mobile QA, and explicit non-goal labels for backend, persistence, providers, queue, workers, auth, and export rendering. |
| Implementation | Completed Feature 2 design artifacts and static/local workspace prototype pages: `docs/INTERFACE_DESIGN.md`, `docs/WIREFRAMING_GUIDELINES.md`, `/workspace`, `/workspace/canvas`, `/workspace/assets`, `/workspace/tasks`, `/workspace/history`, `/workspace/export`, and `/workspace/account`. |
| Verification | JSON validation passed; `corepack pnpm --filter @xmeta/web test` passed 3 files / 16 tests; `corepack pnpm --filter @xmeta/web typecheck` passed; `corepack pnpm --filter @xmeta/web build` passed and generated all Feature 2 workspace routes; Browser QA passed desktop `/workspace`, Export navigation interaction, and mobile `/workspace/canvas` with no console warnings/errors, no framework overlay, and no horizontal overflow. |
| Evaluation | Evaluation subagent updated `evaluator-rubric.md` with a 12 / 12 score and passing recommendation. |

## Current Implementation Plan

1. Create repository-backed design artifacts:
   - `docs/INTERFACE_DESIGN.md` for page functions, screen inventory, information architecture, entry/exit paths, wireframe descriptions, responsive/accessibility notes, and implementation boundaries.
   - `docs/WIREFRAMING_GUIDELINES.md` for reusable app shell, canvas, node card, inspector, asset card, task status, history, export, and account/workspace patterns.
2. Implement static/local web prototypes:
   - Add a real `/workspace` entry from the main page.
   - Add static routes for workspace overview, workflow canvas, asset library, task status, history, export, and account/workspace management.
   - Use local content data only; do not call or imply backend, persistence, provider, queue, worker, auth, or export-rendering capabilities.
3. Add tests:
   - Extend main-page assertions for the `/workspace` entry point.
   - Add workspace route static render tests covering product language, route visibility, node surfaces, capability boundary labels, accessibility markers, and no generic chat/starter content.
4. Evaluate and verify:
   - Run JSON validation, web tests, typecheck, build, rendered desktop/mobile QA, `git diff --check`, and final `.\init.ps1`.
