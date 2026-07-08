# Sprint Contract - Feature 15 Auth Workspace UI

## Sprint Overview

**Sprint:** feature-15-auth-account-005
**Feature:** Feature 15, Production Auth And Workspace Management
**Status:** in_progress
**Goal:** Build the login, registration, workspace selection, and top-bar account context UI on top of the existing FastAPI account/session APIs.

## Write Scope

- `feature_tasks/15.json`
- `feature_list.json`
- `sprint-contract.md`
- `evaluator-rubric.md`
- `progress.md`
- `session-handoff.md`
- `packages/shared-contracts/src/index.ts`
- `apps/web/src/app/account/**`
- `apps/web/src/components/xmeta/app-top-bar.tsx`
- `apps/web/src/components/xmeta/app-top-bar.test.tsx`
- `apps/web/src/components/xmeta/account/**`
- `apps/web/src/lib/auth/**`
- `apps/web/src/lib/script-node/api.ts`

Protected scope:

- Do not implement the full account center, member management, password reset, OAuth provider backend routes, production email delivery, billing, or mobile-specific UI in this slice.
- Do not change database schema or backend auth route behavior unless a frontend integration blocker proves it is required.
- Do not erase Feature 4 storyboard/canvas context while recording account-branch work.
- Do not push or create a PR unless explicitly requested.

## In Scope

- Add frontend auth contracts and a browser-safe auth API client that uses HttpOnly cookie sessions via `credentials: "include"`.
- Add login and registration routes that call `POST /api/v1/auth/login` and `POST /api/v1/auth/register`.
- Add workspace confirmation/selection UI backed by `GET /api/v1/accounts` and `POST /api/v1/accounts/active`.
- Replace the top-bar fake `Studio Admin` label with real account/workspace/role state when available, and a sign-in entry when unauthenticated.
- Show GitHub and Google OAuth controls as disabled Coming soon actions with visible unavailable-state explanation.
- Keep existing workspace Script Node API calls compatible with the cookie session model.

## Out of Scope

- Account center MVP beyond entry links/placeholders needed for navigation clarity.
- Member invite/list/role/remove flows.
- Password reset, password change, email verification, or development outbox UI.
- Real OAuth backend integration.
- Billing or payment provider integration.
- Durable project persistence and project membership tables.
- Mobile-specific redesign or viewport tuning.
- Cleanup of `.env.example` real local provider values; this remains a recorded risk, not a blocker for this requested slice.

## Acceptance Criteria

1. Login and registration forms submit to the backend auth APIs and render validation or backend errors without hiding the form.
2. Successful login or registration records an active account state in the UI and routes the user toward workspace selection or the workspace.
3. Workspace selection lists only backend-returned memberships and calls the active-workspace endpoint with credentials included.
4. The global top bar no longer implies a fake `Studio Admin`; it shows real user email, workspace name, and role when known, otherwise it shows a clear sign-in action.
5. GitHub and Google OAuth controls are visibly disabled or unavailable and explain that provider login is Coming soon.
6. Existing Script Node frontend API calls include credentials so authenticated workspace usage can reach protected backend routes.
7. Focused web tests, full web tests, web typecheck, web build, Browser E2E, JSON validation, diff hygiene, evaluator score, and final `.\init.ps1` evidence are recorded.

## Verification Plan

- Baseline: `.\init.ps1`
- Focused RED/GREEN web tests:
  - `corepack pnpm --filter @xmeta/web test -- src/lib/auth/api.test.ts src/components/xmeta/account/auth-panel.test.tsx src/components/xmeta/app-top-bar.test.tsx`
- Full web tests: `corepack pnpm --filter @xmeta/web test`
- Web typecheck: `corepack pnpm --filter @xmeta/web typecheck`
- Web build: `corepack pnpm --filter @xmeta/web build`
- Backend smoke if Browser E2E starts FastAPI: `.\.venv\Scripts\python.exe -m alembic upgrade head`
- Browser E2E: register -> active workspace confirmation -> workspace entry -> top-bar account state -> logout/sign-in state where feasible.
- JSON validation:
  - `Get-Content -Raw feature_list.json | ConvertFrom-Json | Out-Null`
  - `Get-Content -Raw feature_tasks/15.json | ConvertFrom-Json | Out-Null`
- Diff hygiene: `git diff --check`
- Final startup: `.\init.ps1`

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | Confirmed `D:\xmeta video\X-META-Video`, branch `zheng`, and read AGENTS, product, architecture, feature list, task file, progress, handoff, and recent commits. |
| Startup | `.\init.ps1` passed before 005 work and reran web tests: 9 files / 40 tests. |
| Scope | Current slice is `auth-account-005`: login/register/workspace selection UI, real top-bar account state, OAuth Coming soon controls, and cookie-session frontend API compatibility. |
| Constraints | Full account center, member management, password flows, OAuth backend routes, billing, database schema changes, and mobile-specific UI remain out of scope. |
| RED | Focused auth/top-bar tests failed before implementation because auth client/auth panel were missing and `AppTopBar` still rendered `Studio Admin`. |
| Implementation | Added `/account/login`, `/account/register`, and `/account/workspaces`; added auth API client; added auth and workspace UI components; connected `AuthAwareTopBar`; added shared account contracts; added cookie credentials to protected Script/Task frontend requests. |
| Focused verification | `corepack pnpm --filter @xmeta/web test -- src/lib/auth/api.test.ts src/components/xmeta/account/auth-panel.test.tsx src/components/xmeta/app-top-bar.test.tsx src/components/xmeta/app-shell.test.tsx` passed: 4 files / 9 tests. |
| Regression verification | Full web tests passed 11 files / 45 tests; standalone web typecheck passed; web build passed and included `/account/login`, `/account/register`, `/account/workspaces`, and `/workspace`. |
| Browser E2E | Playwright CLI passed register -> workspace selection -> workspace against web dev server `http://localhost:3002` and temporary FastAPI `http://localhost:8000`; verified disabled OAuth Coming soon controls, real email/workspace/role, no `Studio Admin`, and no console warning/error beyond dev-only React/HMR messages. |
| Final verification | JSON validation passed; `git diff --check` passed with CRLF warnings only; explicit shared-contracts file typecheck passed; final `.\init.ps1` passed with 11 web files / 45 tests. |
| Evaluation | Evaluator subagent failed due platform usage limit. Main fallback evaluator recorded 144 / 150 in `evaluator-rubric.md` and accepted `auth-account-005`; rerun independent evaluator when quota is available if strict separation is required before review. |
