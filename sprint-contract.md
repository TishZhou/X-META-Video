# Sprint Contract - UI TripleD Adoption

## Sprint Overview

**Sprint:** Planning-05
**Feature:** Frontend UI source guidance
**Duration:** 1 focused documentation update

## Scope

### In Scope

- Record UI TripleD as the preferred external source for polished shadcn/ui blocks and page sections.
- Keep shadcn/ui as the base local component system.
- Clarify that UI TripleD blocks should be copied and adapted as local source code, not installed as an opaque runtime library.
- Clarify that Base UI variants are out of scope unless the architecture is explicitly changed later.
- Document that `framer-motion` should be added only when a selected copied block requires it.

### Out of Scope

- Copying UI TripleD components into the repo.
- Adding `framer-motion` or Base UI dependencies.
- Implementing Feature 1 UI.
- Changing feature tracker status.
- Backend, task, asset, worker, or API behavior changes.
- Committing changes.

## Acceptance Criteria

1. `docs/ARCHITECTURE.md` names UI TripleD as a source for selected shadcn blocks.
2. `docs/ARCHITECTURE.md` keeps shadcn/ui as local source components and blocks Base UI unless explicitly approved later.
3. `docs/DEPENDENCIES.md` documents UI TripleD usage and copy/adapt rules.
4. `docs/DEPENDENCIES.md` does not imply that UI TripleD is a normal npm runtime dependency.
5. `git diff --check` passes.
6. `.\init.ps1` passes after the documentation update.

## Verification Plan

1. Search docs for `UI TripleD`, `Base UI`, `framer-motion`, and `shadcn` to confirm the intended boundaries.
2. Run `git diff --check`.
3. Run `.\init.ps1`.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Scope update | User selected `moumen-soliman/uitripled` as the project component/block source. |
| Artifact update | `docs/ARCHITECTURE.md`, `docs/DEPENDENCIES.md`, `progress.md`, and `session-handoff.md` now document UI TripleD as a shadcn block source. |
| Verification | UI boundary search passed, `git diff --check` passed, and `.\init.ps1` passed. |
