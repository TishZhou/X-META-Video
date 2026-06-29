# Sprint Contract - Feature 4 Storyboard Node

## Sprint Overview

**Sprint:** feature-4-storyboard-inline-composer-polish
**Feature:** Feature 4, Storyboard Node
**Status:** in_progress
**Goal:** Address the eight browser comments on the existing `/workspace` Storyboard interaction without expanding into backend storyboard generation or durable shot-list persistence.

## Write Scope

- `apps/web/src/components/xmeta/workflow-canvas/**`
- `apps/web/src/lib/workflow-canvas/**` only if required for canvas bounds behavior
- Focused tests for changed workspace behavior
- `feature_tasks/4.json`
- `feature_list.json`
- `sprint-contract.md`
- `evaluator-rubric.md`
- `progress.md`
- `session-handoff.md`

Protected user edit:

- `AGENTS.md` is already modified and must not be reverted.

## In Scope

- Show confirmed Script output in the Script node card preview.
- Make the Storyboard response/history panel align with the input composer width, use a fixed-height scrollable chatbox treatment, and allow the user to hide/show it.
- Keep the response/composer group at stable canvas-world dimensions while canvas zoom changes.
- Remove the left-side invisible drag wall so nodes can move to the far-left canvas area.
- Remove the redundant small Storyboard output target control near the Generate button.
- Change the composer selector from output target selection to model selection.
- Move generation errors into the Storyboard response/status panel near the Ready state instead of rendering a detached red strip.
- Preserve honest local/FastAPI/AI-disabled boundaries.

## Out of Scope

- Production Storyboard Node backend, database persistence, queue workers, or model-provider execution.
- Full editable shot-list data model.
- Character, scene, image, audio, video, export, asset library, or history feature work.
- Mobile-specific UI polish.

## Acceptance Criteria

1. Script node preview displays the confirmed/generated world-view output, not only draft input.
2. Storyboard response/history appears as a fixed-size scrollable chatbox aligned to the composer width.
3. Users can hide and restore the Storyboard response/history panel.
4. Composer and response sizing remains stable relative to the canvas world when zoom changes.
5. A selected node can be dragged to the far-left canvas area without being blocked by an invisible boundary.
6. The small output-target badge/button near Generate is removed.
7. The left composer dropdown is a model selector.
8. Generation errors render inside the response/status area near Ready.
9. Verification evidence is recorded in `feature_list.json`, `sprint-contract.md`, `evaluator-rubric.md`, `progress.md`, and `session-handoff.md`.

## Verification Plan

1. Baseline: `.\init.ps1` before implementation.
2. Focused frontend tests: workspace component test file.
3. Full frontend tests: `corepack pnpm --filter @xmeta/web test`.
4. Typecheck: `corepack pnpm --filter @xmeta/web typecheck`.
5. Build: `corepack pnpm --filter @xmeta/web build`.
6. Browser QA: desktop `/workspace` click-by-click verification for response hide/show, model selector, Generate error placement, zoom stability, and far-left node dragging.
7. JSON validation: parse `feature_list.json` and `feature_tasks/4.json`.
8. Whitespace check: `git diff --check`.
9. Final restart path: `.\init.ps1`.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | Confirmed working directory `D:\X-META-Video`; read `AGENTS.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `feature_list.json`, `progress.md`, `feature_tasks/4.json`, `sprint-contract.md`, and `evaluator-rubric.md`. |
| Startup | `.\init.ps1` passed before implementation and reported 9 web test files / 29 tests. |
| Recent commits | Reviewed `git log --oneline -5`: `396604d`, `65cf5b4`, `94ae773`, `61d8580`, and `18d22c3`. |
| Skill setup | Used shadcn rules, UI/UX evaluator references, and Browser/frontend testing guidance for the workspace UI pass. |
| Subagents | Acting subagent assigned to the workspace source/test implementation slice; evaluation subagent reserved for post-implementation review. |
| Implementation | Updated the workspace inline Script/Storyboard interaction so confirmed Script output appears in the Script node preview, Storyboard AI history is fixed-height/scrollable/hideable, the composer selector is a model selector, the redundant output-target badge is removed, errors render inside the response panel, zoom compensation keeps the panel/composer stable, and node drag allows negative x placement. |
| Focused verification | `corepack pnpm --filter @xmeta/web test -- src/components/xmeta/workflow-canvas/workflow-canvas-workspace.test.tsx` passed 1 file / 9 tests. |
| Full verification | `corepack pnpm --filter @xmeta/web test` passed 9 files / 33 tests; `corepack pnpm --filter @xmeta/web typecheck` passed; `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`; JSON validation passed for `feature_list.json` and `feature_tasks/4.json`; `git diff --check` passed with line-ending warnings only. |
| Browser QA | On `http://localhost:3000/workspace`, click-by-click Browser QA verified selecting Script reveals the composer, `AI修改` opens the Storyboard AI panel, Hide removes the panel while keeping the composer, the model selector changes to configured, configured-model failure shows `Failed to fetch` inside the panel with no detached strip, mock generation returns Ready and changes the Script preview to Confirmed Script, 50% zoom keeps panel/composer at 820px wide with a 288px response panel, and Script node drag reaches a negative canvas left position. |
| Evaluation | Evaluation subagent recorded 90/100 with no source behavior findings; only P2 was missing final artifact/closure evidence, which this artifact update is resolving before the final startup run. |
| Final startup | Final `.\init.ps1` passed after artifact updates and reran web tests: 9 files / 33 tests. A direct focused rerun also passed: 1 file / 9 tests. |
