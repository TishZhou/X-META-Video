# Evaluator Rubric - Feature 15 Account Backend Foundation

Updated: 2026-07-07

## Evaluation Scope

- Role: Evaluator for Feature 15 `auth-account-002` and `auth-account-003`.
- Scope reviewed: account persistence foundation, Alembic migration, registration/login/session/account APIs, API docs, tests, sprint contract, task status, progress, and handoff evidence.
- Out of scope: frontend account UI, Browser account E2E, OAuth provider routes, production email delivery, Billing, and applying actor context/RBAC to existing Script/Task APIs.

## Scorecard

| Criterion | Points | Current | Evidence |
| --- | ---: | ---: | --- |
| Explicit Requirements | 30 | 29 | SQLAlchemy/Alembic account tables exist; register/login/refresh/logout/me/accounts/active routes exist; registration creates default workspace and owner membership; cookie session responses do not expose tokens. |
| Implicit Requirements | 20 | 18 | Work stayed on Feature 15 backend scope, did not edit `apps/`, and preserved existing Script Node behavior. Account UI and RBAC are correctly deferred. |
| Regression Checks | 25 | 24 | Backend full tests, ruff, Alembic smoke, JSON parse, web tests, web build, web typecheck, `git diff --check`, and final `.\init.ps1` passed. |
| Edge Cases | 20 | 18 | Duplicate registration, wrong password, logout revocation, refresh rotation, old-cookie rejection, membership-validated workspace selection, 401 unauthenticated active selection, 403 inaccessible workspace, password hashing, invite default role, migration-created tables, and lowercase enum persistence are covered. |
| Time/Space Complexity | 15 | 15 | Auth lookups are direct indexed DB queries; password hashing and session token hashing are bounded per request. |
| Program Format | 20 | 19 | Route, service, model, migration, schema, and test responsibilities are separated; route layer no longer reaches into service private DB state. |
| Visual Design (if applicable) | 20 | 20 | No frontend account UI is implemented in this backend slice; Browser E2E is deferred until `auth-account-005`. |

Current score: 145 / 150

## Findings

- No P1/P2 findings.
- P3: Account UI and Browser account E2E are still absent by design; keep them as `auth-account-005`.
- P3: Existing Script/Task APIs are not yet protected by actor context/RBAC; keep this as `auth-account-004`.
- P3: The first failed web typecheck during verification was caused by stale Next generated `.next` route types; `next build` regenerated them and `apps/web` direct `corepack pnpm exec tsc --noEmit` passed cleanly.

## Verification Evidence

- `services/api`: `.\.venv\Scripts\python.exe -m pytest tests` passed: 31 tests, 1 StarletteDeprecationWarning.
- `services/api`: `.\.venv\Scripts\python.exe -m ruff check xmeta_api tests` passed.
- `services/api`: `$env:DATABASE_URL='sqlite:///:memory:'; .\.venv\Scripts\python.exe -m alembic upgrade head` passed.
- Repo root JSON validation passed for `feature_list.json` and `feature_tasks/15.json`.
- Repo root `corepack pnpm --filter @xmeta/web test` passed: 9 files / 40 tests.
- Repo root `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
- `apps/web`: `corepack pnpm exec tsc --noEmit` passed cleanly.
- Repo root `git diff --check` passed with CRLF warnings only.
- Repo root final `.\init.ps1` passed and reran web tests: 9 files / 40 tests.

## Verdict

Accepted for the backend account foundation slice. Feature 15 remains `in_progress` because `auth-account-004` through `auth-account-007` are not started.
