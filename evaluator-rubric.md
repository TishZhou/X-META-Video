# Evaluator Rubric - Feature 15 Actor Context And RBAC

Updated: 2026-07-07

## Evaluation Scope

- Role: Evaluator for Feature 15 `auth-account-004`.
- Scope reviewed: backend actor context, Script Node route RBAC, Task read/result membership checks, MVP in-memory project organization binding, Script Node auth tests, API docs, sprint contract, progress, and handoff evidence.
- Out of scope: frontend auth UI, Browser account E2E, durable project persistence, project membership tables, retry/cancel task routes, OAuth providers, production email delivery, and Billing.

## Scorecard

| Criterion | Points | Current | Evidence |
| --- | ---: | ---: | --- |
| Explicit Requirements | 30 | 29 | Script Node save/chat/run require authenticated owner/admin/editor; Task read/result require same-org authenticated membership; viewer is read-only; cross-workspace task/project guesses return 403. |
| Implicit Requirements | 20 | 19 | Work stayed inside Feature 15 backend scope, did not edit frontend source, and preserved existing Script Node provider/model behavior with authenticated fixtures. |
| Regression Checks | 25 | 25 | RBAC tests, Script Node regressions, full backend pytest, ruff, Alembic smoke, JSON validation, web tests, web build, web typecheck, `git diff --check`, and final startup passed. |
| Edge Cases | 20 | 18 | Tests cover unauthenticated 401, owner/editor/admin write/generate, viewer task read and write denial, cross-workspace task/project denial, and existing provider error paths. |
| Time/Space Complexity | 15 | 15 | Actor checks are constant-time session, role, and in-memory org binding lookups; no new long-running request work. |
| Program Format | 20 | 19 | Actor context and RBAC helpers are centralized in FastAPI route helpers; store owns the temporary project-org binding; durable persistence is honestly deferred. |
| Visual Design (if applicable) | 20 | 20 | No frontend UI is changed in this backend slice; Browser account E2E remains deferred until account UI exists. |

Current score: 145 / 150

## Findings

- No P1/P2 findings.
- P3: `ActorContext` does not yet carry `request_id`; this remains a broader observability concern and is outside the current sprint contract.
- P3: Project/task authorization relies on MVP in-memory project-org binding until durable project persistence and project membership tables are implemented.
- P3: Browser account E2E is not meaningful until `auth-account-005` adds login/register/workspace UI.

## Verification Evidence

- `services/api`: `.\.venv\Scripts\python.exe -m pytest tests\test_script_node_auth.py -q` passed: 4 tests before admin/editor evidence was added.
- `services/api`: `.\.venv\Scripts\python.exe -m pytest tests\test_script_node_auth.py tests\test_script_node.py -q` passed: 29 tests after explicit admin/editor tests.
- `services/api`: `.\.venv\Scripts\python.exe -m pytest tests -q` passed: 37 tests, 1 StarletteDeprecationWarning.
- `services/api`: `.\.venv\Scripts\python.exe -m ruff check xmeta_api tests` passed.
- `services/api`: `$env:DATABASE_URL='sqlite:///:memory:'; .\.venv\Scripts\python.exe -m alembic upgrade head` passed.
- Repo root JSON validation passed for `feature_list.json` and `feature_tasks/15.json`.
- Repo root `git diff --check` passed with CRLF warnings only.
- Repo root `corepack pnpm --filter @xmeta/web test` passed: 9 files / 40 tests.
- Repo root `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
- `apps/web`: `corepack pnpm exec tsc --noEmit` passed cleanly.
- Repo root final `.\init.ps1` passed and reran web tests: 9 files / 40 tests.

## Verdict

Accepted for `auth-account-004`. Feature 15 remains `in_progress` because auth UI, account center, and final closure slices are not started.
