# Sprint Contract - Feature 15 Account System Closure

## Sprint Overview

**Sprint:** feature-15-auth-account-007
**Feature:** Feature 15, Production Auth And Workspace Management
**Status:** in_progress
**Goal:** Close Feature 15 with fresh verification, final evidence, evaluator scoring, and accurate handoff notes after the account-system implementation slices.

## Write Scope

- `feature_tasks/15.json`
- `feature_list.json`
- `sprint-contract.md`
- `evaluator-rubric.md`
- `progress.md`
- `session-handoff.md`

Protected scope:

- Do not add new account functionality unless final verification exposes a blocking defect.
- Do not change video canvas, storyboard, media generation, or other workstream code.
- Do not implement real GitHub/Google OAuth provider routes.
- Do not implement real production email delivery.
- Do not implement Billing or payment provider integration.
- Do not change database schema unless existing verified account behavior cannot restart.
- Do not push or create a PR unless explicitly requested.

## In Scope

- Reconfirm current account behavior after `auth-account-006`.
- Record final verification evidence for backend, frontend, typecheck, build, Browser E2E, JSON, diff hygiene, and startup.
- Confirm unavailable account actions are honestly labeled: OAuth disabled Coming soon, Billing owner-visible Coming soon, and non-manager member controls disabled with Owner/Admin-required copy.
- Update status artifacts so Feature 15 accurately reflects the completed account-system state and remaining deferred capabilities.
- Run evaluator review and record a score over 140 before accepting the slice.

## Out of Scope

- New product features beyond closure evidence.
- Real OAuth providers and callbacks.
- Real email provider delivery.
- Billing provider, invoices, subscription state, or payment methods.
- Durable project persistence, project membership tables, asset/task/history persistence beyond existing account tables.
- Mobile-specific redesign.
- Cleanup of `.env.example` real local provider values; this remains a recorded risk, not a blocker for this requested slice.

## Acceptance Criteria

1. `feature_list.json` records Feature 15 and `auth-account-007` status accurately after fresh verification.
2. `feature_tasks/15.json` records all account slices through closure with evidence and known limitations.
3. `sprint-contract.md`, `evaluator-rubric.md`, `progress.md`, and `session-handoff.md` contain final evidence.
4. Account UI exposes no unavailable action without clear disabled or Coming soon state.
5. Final verification covers backend tests, backend lint, frontend tests, frontend typecheck, frontend build, Browser E2E, JSON validation, `git diff --check`, and final `.\init.ps1`.
6. Evaluator score is over 140 before the slice is accepted.
7. Repository remains restartable from `.\init.ps1`.

## Verification Plan

- Baseline startup: `.\init.ps1`
- Backend tests: from `services/api`, `.\.venv\Scripts\python.exe -m pytest tests -q`
- Backend lint: from `services/api`, `.\.venv\Scripts\python.exe -m ruff check xmeta_api tests`
- Full web tests: `corepack pnpm --filter @xmeta/web test`
- Web typecheck: `corepack pnpm --filter @xmeta/web typecheck`
- Web build: `corepack pnpm --filter @xmeta/web build`
- Browser E2E: register -> account center -> profile/workspace update -> member invite/role/remove -> password change -> sign out -> login -> workspace entry, plus disabled OAuth/Billing/non-manager checks where practical.
- JSON validation:
  - `Get-Content -Raw feature_list.json | ConvertFrom-Json | Out-Null`
  - `Get-Content -Raw feature_tasks/15.json | ConvertFrom-Json | Out-Null`
- Diff hygiene: `git diff --check`
- Final startup: `.\init.ps1`

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | Confirmed `D:\xmeta video\X-META-Video`, branch `zheng`, recent commit `7e794ce feature 15 05: add account center`, and Feature 15 current state. |
| Startup | `.\init.ps1` passed before 007 edits and reran web tests: 12 files / 48 tests. |
| Scope | Current slice is `auth-account-007`: final evidence and status closure for the already implemented account system. |
| Constraint | Evaluator subagent quota has failed in prior rounds; evaluator review will be attempted, and any platform failure must be recorded with main-agent fallback evidence. |
| Backend verification | From `services/api`, `.\.venv\Scripts\python.exe -m pytest tests -q` passed 42 tests with one Starlette warning; `.\.venv\Scripts\python.exe -m ruff check xmeta_api tests` passed. |
| Frontend verification | `corepack pnpm --filter @xmeta/web test` passed 12 files / 48 tests; `corepack pnpm --filter @xmeta/web typecheck` passed; `corepack pnpm --filter @xmeta/web build` passed and included account/workspace routes. |
| Unavailable action coverage | Added focused frontend assertions that Coming soon OAuth/Billing controls and non-manager account controls render disabled; focused account tests passed 3 files / 7 tests, then full web tests and typecheck passed. |
| API smoke | Temporary FastAPI API smoke passed register, owner workspace creation, profile update, workspace rename, member list, invite token, password change, logout, login with changed password, accounts list, and active workspace selection. |
| Hygiene | JSON validation for `feature_list.json` and `feature_tasks/15.json` passed; `git diff --check` passed with CRLF warnings only. |
| Final startup | `.\init.ps1` passed after 007 edits and reran 12 web files / 48 tests. |
| Manual page QA | User tested the rendered pages and found unresolved issues: duplicate password reveal icons, login routing to `/account/workspaces` instead of account center, workspace semantics conflated with canvas entry, and poor account/workspace UI quality. |
| Follow-up decision | User asked to defer actual debug/UI implementation and only record conclusions now. |
| Current status | Automated non-page closure evidence is complete, but rendered manual QA failed; `auth-account-007` remains `in_progress` and Feature 15 is not accepted. |
