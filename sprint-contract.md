# Sprint Contract - Feature 1 Main Page Completion

## Sprint Overview

**Sprint:** Feature-1-main-page-completion
**Feature:** Feature 1, Main Page Design
**Small tasks:** `main-page-003` through `main-page-007`
**Goal:** Complete the remaining main page entry experience in order: recent work, workspace entry placeholder, full workflow preview, responsive behavior, and accessibility basics.

## Scope

### In Scope

- Add recent-work entry points using static/local placeholder data only.
- Add an `Enter Workspace` action that reaches a clear UI-only workspace entry placeholder.
- Expand the workflow preview so users can scan the planned pipeline from brief to script, storyboard, assets, audio, video, and export.
- Preserve the current shadcn/ui plus local UI TripleD-inspired `triple-motion` visual system.
- Improve desktop and mobile layout so primary actions, recent work, and workflow preview stay readable and reachable.
- Verify keyboard focus order and accessible labels for main page actions.
- Record evidence in `feature_tasks/1.json`, `feature_list.json`, `progress.md`, `sprint-contract.md`, `evaluator-rubric.md`, and `session-handoff.md`.

### Out of Scope

- Real project creation, project persistence, auth, account routing, backend APIs, FastAPI changes, queues, workers, AI generation, asset library, task status, or canvas execution.
- Full workspace shell implementation; that belongs to Feature 2.
- Full workflow canvas behavior; that belongs to Feature 3.
- Any unrelated feature task files.

## Acceptance Criteria

1. `main-page-003`: The main page shows a recent work area with project cards or an empty state, and actions point toward opening or creating project work.
2. `main-page-004`: `Enter Workspace` leads to a visible workspace entry placeholder that states the full workspace shell is later work.
3. `main-page-005`: The workflow preview includes script, storyboard, character or scene assets, audio, video, and export with concise user-facing copy.
4. `main-page-006`: Desktop and mobile layouts have no clipped text, overlapping controls, horizontal overflow, or hidden primary actions.
5. `main-page-007`: Keyboard tab order is sensible and interactive elements have clear labels or text.
6. The page remains product-specific to X-META Video and does not show unrelated chat, messaging, or starter-template content.
7. `.\init.ps1` passes after implementation.

## Verification Plan

1. Baseline already run: `.\init.ps1` passed before implementation.
2. Run focused render tests with `corepack pnpm --filter @xmeta/web test`.
3. Run `corepack pnpm --filter @xmeta/web typecheck`.
4. Run `corepack pnpm --filter @xmeta/web build`.
5. Run rendered QA at desktop `1440x900` and mobile `390x844`.
6. During rendered QA verify recent work, workspace entry placeholder, workflow preview content, create-project interaction, production card expansion, no console/page errors, no horizontal overflow, and keyboard tab order.
7. Run `git diff --check`.
8. Run final `.\init.ps1`.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Scope update | Selected Feature 1 remaining tasks `main-page-003` through `main-page-007`; work stays in the main page UI and harness artifacts. |
| Baseline | `.\init.ps1` passed before implementation with Vitest running 2 files and 6 tests. |
| Planning subagent | Confirmed ordered plan, likely files, verification commands, and risks. |
| Implementation | Added recent-work local entries, workspace entry placeholder, expanded workflow preview, responsive layout coverage, and keyboard/accessibility fixes for Framer Motion focus behavior. |
| Evaluation pass 1 | Evaluation subagent accepted UI implementation at 10 / 12 and identified stale status artifacts plus unrelated pre-existing `AGENTS.md` diff. |
| Artifact update | Updated `feature_list.json`, `feature_tasks/1.json`, `progress.md`, and `session-handoff.md` to record Feature 1 completion evidence. |
| Verification | Vitest, typecheck, Next build, rendered desktop/mobile QA, keyboard focus QA, `git diff --check`, and final `.\init.ps1` passed. |
