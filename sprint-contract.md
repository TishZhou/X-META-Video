# Sprint Contract - Feature 15 Account Planning

## Sprint Overview

**Sprint:** feature-15-auth-account-001
**Feature:** Feature 15, Production Auth And Workspace Management
**Status:** in_progress
**Goal:** Decompose the production account system into small, verifiable slices before writing auth code, while preserving the active Feature 4 storyboard/canvas context.

## Write Scope

- `feature_tasks/15.json`
- `feature_list.json`
- `sprint-contract.md`
- `evaluator-rubric.md`
- `progress.md`
- `session-handoff.md`

Protected scope:

- Do not edit application source code in `apps/`, `services/`, or `packages/` during `auth-account-001`.
- Do not implement auth routes, database migrations, account UI, or RBAC in this slice.
- Do not erase Feature 4 storyboard/canvas context while recording account-branch work.
- Do not commit, push, or create a PR unless explicitly requested.

## In Scope

- Decompose Feature 15 into `auth-account-001` through `auth-account-007`.
- Record the agreed account defaults:
  - email/password registration is the first real login path.
  - registration creates a default workspace and owner membership.
  - roles are organization membership roles: owner, admin, editor, viewer.
  - invited members default to editor.
  - sessions use HttpOnly cookies.
  - GitHub and Google OAuth are disabled UI placeholders first.
  - invitation, verification, and password reset flows use a development outbox first.
  - Billing is owner-visible Coming soon UI only.
- Define verification expectations for backend, frontend, Browser E2E, JSON validation, git diff, and final startup.
- Initialize evaluator rubric for the account planning slice.

## Out of Scope

- Real auth API implementation.
- PostgreSQL/Alembic migrations.
- Login, registration, workspace selection, or account-center UI.
- Real OAuth provider integration.
- Real email provider integration.
- Billing or payment provider integration.
- Mobile-specific UI work.
- Cleanup of `.env.example` real local provider values; this remains a recorded risk, not a blocker for this requested slice.

## Acceptance Criteria

1. `feature_tasks/15.json` contains seven account-system small features with scope, acceptance criteria, and verification guidance.
2. `feature_list.json` records `auth-account-001` as Feature 15 branch work and preserves Feature 4 context.
3. `progress.md` and `session-handoff.md` record the account-system branch start on `zheng`.
4. `evaluator-rubric.md` is initialized and then filled with evaluator evidence for this planning slice.
5. Standard startup, JSON parsing, and `git diff --check` pass after artifact updates.
6. Evaluator score is over 140 before this slice is accepted.

## Verification Plan

- Baseline: `.\init.ps1`
- JSON validation:
  - `Get-Content -Raw feature_list.json | ConvertFrom-Json | Out-Null`
  - `Get-Content -Raw feature_tasks/15.json | ConvertFrom-Json | Out-Null`
- Rubric initialization: `.\scripts\initialize-evaluator-rubric.ps1 -Updated 2026-07-07`
- Diff hygiene: `git diff --check`
- Final startup: `.\init.ps1`

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | Confirmed `D:\xmeta video\X-META-Video`, branch `zheng`, and read AGENTS, product, architecture, feature list, progress, and recent commits. |
| Startup | `.\init.ps1` passed before artifact work and reran web tests: 9 files / 40 tests. |
| Planning | Feature 15 account system scope was decomposed into account planning, persistence, auth APIs, RBAC integration, auth UI, account center, and closure slices. |
| Branch context | Feature 15 branch work is recorded on `zheng` while Feature 4 remains active in the shared storyboard/canvas context. |
| Risk | `.env.example` currently carries real local provider configuration; user explicitly said not to handle it in this slice. |
| Final verification | JSON validation passed for `feature_tasks/15.json`; `git diff --check` passed with CRLF warnings only; final `.\init.ps1` passed after artifact narrowing and reran web tests: 9 files / 40 tests. |
