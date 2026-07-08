# Evaluator Rubric - Feature 15 Account System Closure

Updated: 2026-07-08

## Evaluation Context

- Role: Evaluator for Feature 15 `auth-account-007`.
- Scope reviewed: final account-system status, evidence freshness, unavailable-action honesty, handoff quality, and restartability after account foundation, auth/session APIs, RBAC, auth UI, and account center MVP slices.
- Out of scope: real OAuth provider integration, real production email delivery, real billing provider integration, durable project persistence, project membership tables, and mobile-specific UI.

## Scorecard

| Criterion | Points | Current | Evidence |
| --- | ---: | ---: | --- |
| Feature 15 status and task records accurately reflect all account slices | 25 | 22 | Feature 15 is correctly on `auth-account-007` and remains `in_progress` pending manual page QA. |
| Final backend tests and lint are fresh and passing | 25 | 25 | Backend full pytest passed 42 tests with one Starlette warning; backend ruff passed. |
| Final web tests, typecheck, and build are fresh and passing | 30 | 30 | Web tests passed 12 files / 48 tests; typecheck passed; build passed and includes account routes. |
| Browser E2E covers the critical account workflow and unavailable states | 30 | 6 | API smoke covers the server-side account workflow, but user manual QA found rendered-flow issues, so browser QA is not accepted. |
| UI does not imply unavailable OAuth, Billing, or member-management capability is live | 20 | 12 | Tests cover disabled placeholders, but manual QA found account and workspace UI/flow problems that need a later fix pass. |
| Sprint, progress, handoff, and rubric evidence are complete and consistent | 25 | 22 | Closure evidence now records the manual QA failures and deferred follow-up scope honestly. |
| Repository restartability and diff hygiene are verified | 25 | 25 | `git diff --check` passed with CRLF warnings only; final `.\init.ps1` passed. |

Current score: 140 / 180

## Findings

- The evaluator cannot accept `auth-account-007` because user manual QA found rendered interaction, routing, workspace-concept, and visual-design issues.
- Non-page verification and API smoke are fresh and passing.
- The local manual QA environment is available at `http://localhost:3000` with API at `http://127.0.0.1:8000`.
- User asked to defer actual debug/UI implementation and only record analysis conclusions for a later pass.
- Manual QA findings to carry forward:
  - Password fields show both a browser/native reveal icon and the custom reveal icon; clicking the custom icon changes the input type and makes the native icon disappear. Likely fix: suppress native reveal controls for password inputs or use only native reveal consistently.
  - Sign in currently routes to `/account/workspaces`; target should be `/account`, with workspace/project entry handled inside the account center.
  - The current workspace selector conflates workspace/organization selection with opening the canvas. Product conclusion: workspace should mean a project-management area; canvas/studio should be opened from a project/workspace entry, not be the workspace itself.
  - Account top-bar chip, account center, workspace selector, and workspace management surface need a dedicated UI polish pass.

## Verification Evidence

- Baseline `.\init.ps1`: passed and reran web tests 12 files / 48 tests.
- From `services/api`, `.\.venv\Scripts\python.exe -m pytest tests -q`: 42 passed, 1 Starlette warning.
- From `services/api`, `.\.venv\Scripts\python.exe -m ruff check xmeta_api tests`: passed.
- `corepack pnpm --filter @xmeta/web test`: 12 files / 48 tests passed.
- `corepack pnpm --filter @xmeta/web typecheck`: passed.
- `corepack pnpm --filter @xmeta/web build`: passed and includes `/account`, `/account/login`, `/account/register`, `/account/workspaces`, and `/workspace`.
- Focused unavailable-action coverage: `corepack pnpm --filter @xmeta/web test -- src/components/xmeta/account/auth-panel.test.tsx src/components/xmeta/account/account-center.test.tsx src/lib/auth/api.test.ts` passed 3 files / 7 tests after adding disabled-state assertions.
- Post-test-change full web tests: `corepack pnpm --filter @xmeta/web test` passed 12 files / 48 tests.
- Post-test-change web typecheck: `corepack pnpm --filter @xmeta/web typecheck` passed.
- API smoke against temporary FastAPI: register, owner workspace creation, profile update, workspace rename, member list, invite token, password change, logout, login with changed password, accounts list, and active workspace selection passed.
- JSON validation for `feature_list.json` and `feature_tasks/15.json`: passed.
- `git diff --check`: passed with CRLF warnings only.
- Final `.\init.ps1`: passed and reran web tests 12 files / 48 tests.
- Manual page QA: delegated to user per explicit request; not yet accepted.

## Verdict

Not accepted. Automated non-page verification plus API smoke are complete, but rendered manual QA found issues that must be fixed before Feature 15 can be marked passing.
