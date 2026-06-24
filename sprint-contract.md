# Sprint Contract - Feature 1 Task Decomposition

## Sprint Overview

**Sprint:** Planning-03  
**Feature:** Feature 1, Main Page Design  
**Duration:** 1 focused planning update

## Scope

### In Scope

- Replace the placeholder `feature_tasks/1.json` content with a small-feature breakdown.
- Use the requested child-task schema:
  - `id`
  - `title`
  - `user_visible_behavior`
  - `status`
  - `verification`
  - `evidence`
  - `notes`
- Keep the decomposition focused on Main Page Design.
- Split the feature into minimal user-visible steps that can be implemented one at a time.
- Explicitly exclude unrelated messaging behavior and generic starter content.
- Label UI-only placeholders honestly where backend, persistence, workspace shell, or canvas behavior belongs to later features.
- Update session handoff with current planning status and verification evidence.

### Out of Scope

- Product implementation.
- App shell, canvas, backend, auth, persistence, AI generation, or asset library work.
- Decomposing any `feature_tasks/*.json` file other than `feature_tasks/1.json`.
- Changing the Feature 1 status in `feature_list.json`.
- Committing changes.

## Acceptance Criteria

1. `feature_tasks/1.json` contains a `features` array.
2. Every child task uses only the requested per-task fields.
3. Every child task status is `not_started`.
4. Every child task includes an empty `evidence` array.
5. Every child task is specific to Main Page Design.
6. No child task references unrelated messaging or generic product behavior.
7. JSON validation passes.
8. `.\init.ps1` passes after the artifact update.

## Verification Plan

1. Parse `feature_tasks/1.json` with PowerShell `ConvertFrom-Json`.
2. Programmatically confirm every child task contains exactly the requested fields.
3. Programmatically confirm every child task status is `not_started`.
4. Programmatically confirm no child task mentions unrelated messaging product terms.
5. Run `git diff --check -- feature_tasks/1.json sprint-contract.md progress.md evaluator-rubric.md session-handoff.md`.
6. Run `.\init.ps1`.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Scope update | User requested Feature 1 decomposition into minimal child tasks using the provided schema. |
| Artifact update | `feature_tasks/1.json` now contains 7 Main Page Design child tasks using the requested per-task fields; session evidence artifacts were updated. |
| Verification | Schema check passed, `git diff --check` reported no whitespace errors, and `.\init.ps1` passed. |
