# Sprint Contract - Feature 2 Interface Design

## Sprint Overview

**Sprint:** Feature-2-interface-design
**Feature:** Feature 2, Interface Design
**Small tasks:** `interface-design-001` through `interface-design-008`
**Goal:** Define the page functions, screen inventory, information architecture, UI sketching direction, wireframing guidelines, responsive behavior, accessibility requirements, and implementation handoff for the X-META Video product before Feature 3 app-shell implementation starts.

## Scope

### In Scope

- Map every MVP product function from `docs/PRODUCT.md` into a page, screen, panel, drawer, modal, or canvas region.
- Define the screen set for main entry, project/workspace shell, workflow canvas, node configuration, asset library, task status/retry, generation history/version timeline, export, auth, and workspace management.
- Write User Interface Sketching and Wireframing Guidelines using task-to-screen mapping, screen content inventories, information architecture, entry/exit paths, hierarchy, grouping, and no-dead-end review.
- Plan responsive desktop, tablet, and mobile behavior for the app shell, canvas, inspectors, asset panels, task status, and export flow.
- Document accessibility expectations for keyboard use, focus states, labels, landmarks, contrast, reduced motion, node selection, edge editing, async status, and export controls.
- Keep backend, connector, orchestration, persistence, audit, and AI generation capabilities labeled as planned or missing unless already implemented.
- Record evidence in `feature_tasks/2.json`, `feature_list.json`, `progress.md`, `sprint-contract.md`, `evaluator-rubric.md`, and `session-handoff.md` when the feature is implemented.

### Out of Scope

- Implementing frontend routes, React components, UI TripleD assets, shadcn components, canvas behavior, backend APIs, auth, persistence, queues, workers, model calls, or export rendering.
- Completing Feature 3 Project Foundation And App Shell.
- Changing product architecture boundaries in `docs/ARCHITECTURE.md` unless a documented contradiction is found.
- Marking Feature 2 passing before the design artifacts exist and verification has run.

## Acceptance Criteria

1. `interface-design-001`: Page functions are defined for every major X-META Video surface and do not imply unimplemented backend or AI execution behavior.
2. `interface-design-002`: The MVP screen inventory lists titles, purposes, primary and secondary actions, and empty/loading/error state notes.
3. `interface-design-003`: Information architecture documents screen relationships, entry points, exit points, navigation regions, contextual panels, and no dead ends.
4. `interface-design-004`: Core sketches or wireframe descriptions label regions, interactions, and feedback while keeping the canvas as the central creative workspace.
5. `interface-design-005`: Wireframing guidelines define reusable layout patterns for app shell, toolbar, node cards, inspectors, asset cards, tables, status regions, and all planned node surfaces.
6. `interface-design-006`: Responsive states describe desktop, tablet, and mobile behavior with honest mobile constraints for canvas editing.
7. `interface-design-007`: Accessibility requirements cover keyboard order, focus, labels, landmarks, contrast, reduced motion, accessible canvas alternatives, and non-color-only async status.
8. `interface-design-008`: Handoff artifacts give Feature 3 enough design scope and implementation boundaries without relying on chat history.
9. `.\init.ps1` passes before any feature status is marked passing.

## Verification Plan

1. Baseline already run this session: `.\init.ps1` passed before artifact updates.
2. Validate JSON syntax for `feature_list.json` and every `feature_tasks/*.json` file.
3. Verify Feature 2 exists between Feature 1 and the shifted Project Foundation feature.
4. Verify `feature_tasks/2.json` follows the detailed Feature 1 task-file shape: parent feature, child task IDs, user-visible behavior, status, verification, evidence, and notes.
5. Verify shifted feature task files `3.json` through `17.json` have matching `parent_feature.id` values.
6. Run final `.\init.ps1`.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Scope update | Inserted Feature 2, Interface Design, between Feature 1 and the prior Project Foundation feature. |
| Planning subagent | Recommended shifting old Feature 2-16 to Feature 3-17, replacing stale chat-task content, and keeping Interface Design artifact-only. |
| Coding subagent | Drafted `interface-design-001` through `interface-design-008` task decomposition for page functions, screen inventory, IA, sketches, wireframing, responsive states, accessibility, and handoff. |
| Implementation | Pending. This sprint contract defines the next feature plan; it does not complete the Interface Design artifacts. |
