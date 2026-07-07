# Sprint Contract - Feature 15 Account Backend Foundation

## Sprint Overview

**Sprint:** feature-15-auth-account-002-003
**Feature:** Feature 15, Production Auth And Workspace Management
**Status:** in_progress
**Goal:** Implement the account persistence foundation plus core registration, login, session, current-user, account-list, and active-workspace APIs while keeping `/workspace` and existing Script Node tests working.

## Write Scope

- `feature_tasks/15.json`
- `feature_list.json`
- `sprint-contract.md`
- `evaluator-rubric.md`
- `progress.md`
- `session-handoff.md`
- `docs/API.md`
- `services/api/alembic.ini`
- `services/api/alembic/**`
- `services/api/tests/test_auth_accounts.py`
- `services/api/xmeta_api/account_database.py`
- `services/api/xmeta_api/account_models.py`
- `services/api/xmeta_api/account_service.py`
- `services/api/xmeta_api/main.py`
- `services/api/xmeta_api/schemas.py`

Protected scope:

- Do not edit frontend source in `apps/` during this backend slice.
- Do not implement account center UI, OAuth providers, production email delivery, billing, or Script/Task RBAC in this slice.
- Do not erase Feature 4 storyboard/canvas context while recording account-branch work.
- Do not commit, push, or create a PR unless explicitly requested.

## In Scope

- Add SQLAlchemy and Alembic account persistence foundation.
- Add users, organizations, memberships, refresh sessions, and account outbox token persistence.
- Implement email/password registration and login.
- Registration creates a default workspace and owner membership.
- Use HttpOnly `xmeta_session` cookie transport; do not expose tokens in JSON.
- Implement `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`, `/accounts`, and `/accounts/active`.
- Preserve existing Script Node routes and tests until the dedicated RBAC slice.

## Out of Scope

- Login, registration, workspace selection, or account-center UI.
- Real OAuth provider integration.
- Real email provider integration.
- Billing or payment provider integration.
- Mobile-specific UI work.
- Applying actor context/RBAC to existing Script/Task APIs; this remains `auth-account-004`.
- Cleanup of `.env.example` real local provider values; this remains a recorded risk, not a blocker for this requested slice.

## Acceptance Criteria

1. Account tables and initial migration exist for users, organizations, memberships, refresh sessions, and account outbox tokens.
2. Passwords are hashed and plaintext passwords are never stored.
3. Registration creates a default workspace and owner membership.
4. Login and registration set HttpOnly session cookies without returning access or refresh tokens in JSON.
5. `/auth/me`, `/accounts`, `/auth/refresh`, `/accounts/active`, logout, duplicate registration, wrong password, migration persistence, lowercase role values, and role defaults are covered by tests.
6. Existing Script Node backend tests still pass.
7. Standard startup, JSON parsing, backend lint, backend tests, and `git diff --check` pass after artifact updates.

## Verification Plan

- Baseline: `.\init.ps1`
- Focused backend tests: `.\.venv\Scripts\python.exe -m pytest tests\test_auth_accounts.py`
- Backend regression tests: `.\.venv\Scripts\python.exe -m pytest tests`
- Backend lint: `.\.venv\Scripts\python.exe -m ruff check xmeta_api tests`
- Alembic smoke: `$env:DATABASE_URL='sqlite:///:memory:'; .\.venv\Scripts\python.exe -m alembic upgrade head`
- Web verification: `corepack pnpm --filter @xmeta/web test`, `corepack pnpm --filter @xmeta/web build`, and `corepack pnpm exec tsc --noEmit` from `apps/web`
- JSON validation:
  - `Get-Content -Raw feature_list.json | ConvertFrom-Json | Out-Null`
  - `Get-Content -Raw feature_tasks/15.json | ConvertFrom-Json | Out-Null`
- Diff hygiene: `git diff --check`
- Final startup: `.\init.ps1`

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | Confirmed `D:\xmeta video\X-META-Video`, branch `zheng`, and read AGENTS, product, architecture, feature list, progress, and recent commits. |
| Startup | `.\init.ps1` passed before artifact work and reran web tests: 9 files / 40 tests. |
| Planning | Feature 15 account system scope was decomposed into account planning, persistence, auth APIs, RBAC integration, auth UI, account center, and closure slices. |
| Backend persistence | Added SQLAlchemy account models, session dependency, Alembic scaffold, and first account migration. |
| Backend APIs | Added registration, login, refresh, logout, current account, account listing, and active workspace selection APIs. |
| Branch context | Feature 15 is active on branch `zheng`; Feature 4 is paused for branch coordination in `feature_list.json`. |
| Risk | `.env.example` currently carries real local provider configuration; user explicitly said not to handle it in this slice. |
| Evaluator round 1 | Scored 136 / 150 and required fixes for DB default alignment, lowercase durable enum values, refresh/active workspace test coverage, and final evidence freshness. |
| Evaluator fixes | Aligned app and Alembic default DB URL, stored enum values as lowercase, added migration persistence proof, added refresh rotation and active workspace membership tests, and removed route access to service private DB state. |
| Focused verification | `.\.venv\Scripts\python.exe -m pytest tests\test_auth_accounts.py` passed: 8 tests. |
| Regression verification | `.\.venv\Scripts\python.exe -m pytest tests` passed: 31 tests with one StarletteDeprecationWarning. `.\.venv\Scripts\python.exe -m ruff check xmeta_api tests` passed. |
| Final verification | Alembic smoke passed with SQLite in-memory `DATABASE_URL`; JSON validation passed; web tests passed 9 files / 40 tests; web build passed and included `/workspace`; `apps/web` direct `corepack pnpm exec tsc --noEmit` passed; `git diff --check` passed with CRLF warnings only; final `.\init.ps1` passed with 9 web files / 40 tests. Evaluator round 2 accepted at 145 / 150. |
