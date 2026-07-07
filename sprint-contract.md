# Sprint Contract - Feature 15 Actor Context And RBAC

## Sprint Overview

**Sprint:** feature-15-auth-account-004
**Feature:** Feature 15, Production Auth And Workspace Management
**Status:** in_progress
**Goal:** Apply authenticated actor context and role checks to the existing Script Node and Task APIs while keeping local development usable through registration/login test fixtures.

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
- `services/api/tests/test_script_node.py`
- `services/api/tests/test_script_node_auth.py`
- `services/api/xmeta_api/account_database.py`
- `services/api/xmeta_api/account_models.py`
- `services/api/xmeta_api/account_service.py`
- `services/api/xmeta_api/main.py`
- `services/api/xmeta_api/schemas.py`
- `services/api/xmeta_api/store.py`

Protected scope:

- Do not edit frontend source in `apps/` during this backend slice.
- Do not implement account center UI, OAuth providers, production email delivery, billing, or frontend auth UI in this slice.
- Do not erase Feature 4 storyboard/canvas context while recording account-branch work.
- Do not commit, push, or create a PR unless explicitly requested.

## In Scope

- Add backend actor context resolution for `user_id`, `org_id`, role, and request-bound membership.
- Protect existing Script Node save, chat, and run routes with editor-or-higher checks.
- Protect existing Task read/result routes with authenticated member checks for the owning project organization.
- Bind in-memory Script Node project state to the active organization on first write so another organization cannot access the same project ID.
- Update existing Script Node tests to use authenticated fixtures without weakening provider/model evidence.

## Out of Scope

- Login, registration, workspace selection, or account-center UI.
- Real OAuth provider integration.
- Real email provider integration.
- Billing or payment provider integration.
- Mobile-specific UI work.
- Durable project persistence, project membership tables, object storage, task events, retry/cancel implementation, and frontend auth UI.
- Cleanup of `.env.example` real local provider values; this remains a recorded risk, not a blocker for this requested slice.

## Acceptance Criteria

1. Unauthenticated Script Node and Task API requests fail with 401 before touching node/task behavior.
2. Owner/Admin/Editor can save Script node input, send Script dialogue, and run generation tasks in their active workspace.
3. Viewer can read existing task status/result for their organization but cannot save, chat, or run generation.
4. A user from another organization cannot access a project or task bound to a different organization, even by guessing IDs.
5. Existing Script Node provider/model verification remains intact after authenticated fixtures are added.
6. Backend tests, backend lint, web tests/build/typecheck, JSON validation, diff hygiene, evaluator score, and final `.\init.ps1` evidence are recorded.

## Verification Plan

- Baseline: `.\init.ps1`
- Focused backend tests: `.\.venv\Scripts\python.exe -m pytest tests\test_auth_accounts.py`
- Focused RBAC tests: `.\.venv\Scripts\python.exe -m pytest tests\test_script_node_auth.py`
- Script Node regression tests: `.\.venv\Scripts\python.exe -m pytest tests\test_script_node.py`
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
| auth-account-004 planning | Started actor context/RBAC slice. Existing backend account foundation is the baseline; next implementation must protect Script Node and Task APIs without frontend account UI or durable project persistence. |
| auth-account-004 verification | Focused RBAC plus Script Node regression passed 29 tests; full backend pytest passed 37 tests with one StarletteDeprecationWarning; ruff, Alembic smoke, JSON validation, web tests, web build, web typecheck, `git diff --check`, and final `.\init.ps1` passed. Evaluator accepted the slice at 145 / 150. |
