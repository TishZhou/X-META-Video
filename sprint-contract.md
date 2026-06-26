# Sprint Contract - Feature 2 Task Format Alignment

## Sprint Overview

**Sprint:** feature-2-task-format-alignment
**Role:** Acting subagent for planning artifacts only
**Status:** passing for planning-artifact scope
**Goal:** Rewrite `feature_tasks/2.json` so Feature 2 uses the same top-level task-file format as `feature_tasks/1.json` while preserving the requested Workflow Canvas Foundation planning scope.

## Write Scope

- `feature_tasks/2.json`
- `sprint-contract.md`
- `evaluator-rubric.md`
- `progress.md`
- `session-handoff.md`

## In Scope

- Rewrite `feature_tasks/2.json` with exactly these top-level keys: `parent_feature`, `planning_status`, `notes`, and `small_features`.
- Plan the Feature 2 canvas foundation around a composed shadcn toolbar, drag-to-canvas placeholder node creation, first-class ports, freely connectable node inputs/outputs, selectable edges, reusable node UI design, and structured persistence payloads.
- Keep actual AI node functionality, generation execution, provider calls, orchestration, asset generation, and export rendering deferred to later features.
- Incorporate demo analysis from `D:/kpop/docs/canvas-node-connections.md`: the legacy DOM plus SVG `app.js` model is weak for X-META and should be replaced by typed React graph state, first-class ports, selectable edges, and structured persistence payloads.
- Record shadcn evidence: docs confirmed `command`, `resizable`, `sidebar`, `toggle-group`, `tooltip`, `tabs`, `menubar`, `context-menu`, `sheet`, `scroll-area`, and `separator`; registry search was blocked by the `@uitripled` catalog parse issue and found no standalone toolbar item, so toolbar should be composed.
- Update operational artifacts for this planning-only pass.

## Out of Scope

- App/source code edits.
- `feature_list.json` edits.
- Product docs, architecture docs, or other documentation edits.
- Other `feature_tasks/*.json` edits.
- Implementing Workflow Canvas Foundation.
- Committing or pushing.

## Acceptance Criteria

1. `feature_tasks/2.json` has exactly the same top-level key pattern as Feature 1: `parent_feature`, `planning_status`, `notes`, and `small_features`.
2. Feature 2 remains `Workflow Canvas Foundation` with parent feature id `2` and status `not_started`.
3. The plan includes a composed toolbar using shadcn primitives/registry findings.
4. The toolbar plan lets users drag different placeholder node types onto the canvas.
5. The plan includes first-class input/output ports and freely connectable node-port edges.
6. The plan includes reusable node UI design while deferring actual node functionality to later features.
7. The plan incorporates the demo doc analysis and explicitly improves on the legacy DOM plus SVG approach.
8. The five allowed planning artifacts record the update and verification evidence.
9. JSON validation passes for `feature_tasks/2.json`.

## Verification Plan

1. Run `.\init.ps1` before artifact work and record the result.
2. Run shadcn docs/search commands needed for the toolbar evidence.
3. Validate `feature_tasks/2.json` with PowerShell JSON parsing.
4. Review the scoped diff for the five allowed files.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | Confirmed working directory `D:\X-META-Video`; read `AGENTS.md`, `docs/PRODUCT.md`, and `docs/ARCHITECTURE.md`. |
| Startup | Ran `.\init.ps1`; it passed and reported 6 web test files / 18 tests passing. |
| Context | Read `feature_tasks/1.json`, existing `feature_tasks/2.json`, current sprint/evaluator/progress/handoff artifacts, `package.json`, and `D:/kpop/docs/canvas-node-connections.md`. |
| shadcn evidence | Used the shadcn skill. `corepack pnpm dlx shadcn@latest docs command resizable sidebar toggle-group tooltip tabs menubar context-menu sheet scroll-area separator` returned docs/examples/API links for all requested primitives. |
| Registry evidence | `apps/web/components.json` contains `@uitripled`; searching from `apps/web` with `corepack pnpm dlx shadcn@latest search -q toolbar` failed to parse the `@uitripled` catalog because `name` and `homepage` were required, and returned no `toolbar` item. |
| Task rewrite | Replaced `feature_tasks/2.json` with Feature 1-compatible top-level shape and eight small features covering workspace shell, composed toolbar/palette, typed graph state, ports/connections, selectable edges, node UI, structured persistence payloads, and verification closure. |
| Artifact updates | Updated this sprint contract, evaluator rubric, progress log, and session handoff for the planning update. |
| Validation | `Get-Content -Raw feature_tasks/2.json \| ConvertFrom-Json \| Out-Null` passed; top-level keys resolved to `parent_feature, planning_status, notes, small_features`. |
