# Sprint Contract - Feature 15 Account Center MVP

## Sprint Overview

**Sprint:** feature-15-auth-account-006
**Feature:** Feature 15, Production Auth And Workspace Management
**Status:** passing
**Goal:** Build the full account center MVP with backend-backed profile, workspace, member, role, invite, and password/security flows plus honest OAuth/Billing placeholders.

## Write Scope

- `feature_tasks/15.json`
- `feature_list.json`
- `sprint-contract.md`
- `evaluator-rubric.md`
- `progress.md`
- `session-handoff.md`
- `docs/API.md`
- `packages/shared-contracts/src/index.ts`
- `services/api/tests/test_account_center.py`
- `services/api/tests/test_auth_accounts.py`
- `services/api/xmeta_api/account_service.py`
- `services/api/xmeta_api/main.py`
- `services/api/xmeta_api/schemas.py`
- `apps/web/src/app/account/**`
- `apps/web/src/components/xmeta/account/**`
- `apps/web/src/lib/auth/**`

Protected scope:

- Do not implement real GitHub/Google OAuth provider backend routes.
- Do not implement real production email delivery.
- Do not implement Billing or payment provider integration; Billing remains owner-visible Coming soon UI only.
- Do not add database migrations unless current account tables cannot support the MVP.
- Do not change project/canvas/video work owned by other workstreams.
- Do not push or create a PR unless explicitly requested.

## In Scope

- Backend current account profile update.
- Backend active workspace settings update.
- Backend member list, invite, role update, and member removal for active organization.
- Backend password change for authenticated users.
- Backend development password reset request/confirm using account outbox tokens and returning a development token only for local MVP verification.
- Frontend account center route with profile, workspace settings, members, security, OAuth placeholder, and Billing placeholder surfaces.
- Registration UX requires a repeated confirm-password field, password visibility toggles, no workspace-name field, and redirects to account center instead of workspace/canvas after account creation.
- UI must make unavailable OAuth and Billing actions clear at click time or with disabled Coming soon copy.
- Role behavior: Owner/Admin can invite, list, change roles, and remove members; Editor/Viewer cannot manage members or Billing. Guard against removing or demoting the last Owner.

## Out of Scope

- Real OAuth providers and callbacks.
- Real email provider delivery.
- Billing provider, invoices, subscription state, or payment methods.
- Durable project persistence, project membership tables, asset/task/history persistence beyond existing account tables.
- Mobile-specific redesign.
- Cleanup of `.env.example` real local provider values; this remains a recorded risk, not a blocker for this requested slice.

## Acceptance Criteria

1. Authenticated users can update their displayed profile name through backend API and account UI.
2. Owner/Admin can update active workspace name; Editor/Viewer cannot.
3. Owner/Admin can list members, invite a member through development outbox, change roles, and remove members within the active workspace.
4. Editor/Viewer member-management attempts fail clearly with 403 and the UI shows disabled or unavailable management controls honestly.
5. The backend prevents removing or demoting the last Owner.
6. Users can change password with current password; wrong current password fails clearly.
7. Password reset request creates a development outbox reset token for known users without exposing browser bearer tokens; confirm can update password using that development token.
8. Account center UI shows OAuth providers and Owner-only Billing as Coming soon / unavailable without implying live provider or billing backend.
9. Registration UI confirms matching passwords, can reveal/hide password fields, does not ask for workspace name, and lands in `/account` after account creation.
10. Backend tests, web tests, typecheck, build, Browser E2E, JSON validation, diff hygiene, evaluator score, and final `.\init.ps1` evidence are recorded.

## Verification Plan

- Baseline: `.\init.ps1`
- Backend RED/GREEN tests: from `services/api`, `.\.venv\Scripts\python.exe -m pytest tests\test_account_center.py tests\test_auth_accounts.py -q`
- Backend regression: from `services/api`, `.\.venv\Scripts\python.exe -m pytest tests -q`
- Backend lint: from `services/api`, `.\.venv\Scripts\python.exe -m ruff check xmeta_api tests`
- Web focused tests: `corepack pnpm --filter @xmeta/web test -- src/components/xmeta/account/account-center.test.tsx src/lib/auth/api.test.ts`
- Full web tests: `corepack pnpm --filter @xmeta/web test`
- Web typecheck: `corepack pnpm --filter @xmeta/web typecheck`
- Web build: `corepack pnpm --filter @xmeta/web build`
- Browser E2E: register/login -> account center -> update profile/workspace -> invite/list/change/remove member -> security placeholders/password flow -> Billing/OAuth unavailable-state checks.
- JSON validation:
  - `Get-Content -Raw feature_list.json | ConvertFrom-Json | Out-Null`
  - `Get-Content -Raw feature_tasks/15.json | ConvertFrom-Json | Out-Null`
- Diff hygiene: `git diff --check`
- Final startup: `.\init.ps1`

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | Confirmed `D:\xmeta video\X-META-Video`, branch `zheng`, and read AGENTS, product, architecture, feature list, Feature 15 task file, progress, and recent commits. |
| Startup | `.\init.ps1` passed before 006 work and reran web tests: 11 files / 45 tests. |
| Scope | Current slice is `auth-account-006`: backend-backed account center MVP for profile, workspace, members, security/password flows, OAuth disabled placeholders, and Owner-only Billing Coming soon. |
| Constraint | Evaluator/coding subagent usage is currently constrained by platform quota; if subagents are unavailable, main agent must record the deviation and keep verification evidence explicit. |
| Backend | Added account center APIs for profile update, workspace rename, member listing/invite/role/remove, password change, and development password reset request/confirm. Backend full pytest passed 42 tests and ruff passed. |
| Frontend | Added `/account` account center UI, shared account contracts, auth API client methods, top-bar account-center link, and registration UX correction: confirm password, password visibility toggles, no workspace-name field, register redirects to `/account`. |
| Browser E2E | Passed revised register flow in headless Chrome against temporary FastAPI/Next servers: no workspace-name input, confirm-password mismatch blocks submit, password visibility toggles work, successful register lands on `/account`, default workspace is shown in account center, password change/logout/login/workspace entry works. |
| Verification | Passed backend full pytest 42 tests, web full tests 12 files / 47 tests, web typecheck, web build, backend ruff, and `git diff --check` with CRLF warnings only. |
| Evaluator round 1 | Failed at 136 / 170 because Editor/Viewer `/account` loading called member-list API unconditionally, frontend tests missed non-manager UI, rubric was stale, and backend command paths were unclear from repo root. |
| Fix round | Account center now loads member lists only for Owner/Admin, keeps Editor/Viewer on `/account`, shows explicit Owner/Admin-required copy for member management, and has a non-manager account center test. |
| Final evaluator fallback | Evaluator round 2 failed due platform usage limit. Main-agent fallback reviewed the fix and fresh verification, recorded 160 / 170 in `evaluator-rubric.md`, and accepted `auth-account-006`. |
