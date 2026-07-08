# Sprint Contract - Feature 15 Account System UI Fixes

## Sprint Overview

**Sprint:** feature-15-auth-account-007
**Feature:** Feature 15, Production Auth And Workspace Management
**Status:** passing
**Goal:** Address the manual QA failures in `auth-account-007`. Fix the double password icon, correct login routing, decouple the workspace dashboard from the canvas, keep Email input visibly disabled until reopened while Name + Password remains usable, and apply a clean "Minimalist & Tech" redesign to the account and workspace interfaces.

## Write Scope

- `feature_tasks/15.json`
- `feature_list.json`
- `sprint-contract.md`
- `evaluator-rubric.md`
- `progress.md`
- `session-handoff.md`
- `apps/web/src/index.css`
- `apps/web/src/components/xmeta/account/auth-panel.tsx`
- `apps/web/src/components/xmeta/account/account-center.tsx`
- `apps/web/src/components/xmeta/account/workspace-selector.tsx`
- `apps/web/src/app/workspace/page.tsx`
- `apps/web/src/app/project/[id]/page.tsx` (new routing for canvas)

Protected scope:
- Do not implement real GitHub/Google OAuth provider routes.
- Do not implement Billing or payment provider integration.
- Do not change database schema.

## In Scope

- **Password Icon Fix**: Add CSS in `index.css` to hide native edge/webkit password reveal icons (`::-ms-reveal`, `::-webkit-credentials-auto-fill-button`).
- **Sign-in Routing**: In `auth-panel.tsx`, update login/register success to redirect to `/account` directly.
- **Routing Restructure**: Move the `WorkflowCanvasWorkspace` from `/workspace` to `/project/[id]/page.tsx` (or `/project/page.tsx` for MVP). Make `/workspace` the project list dashboard using `WorkspaceSelector`.
- **UI Redesign**: Redesign `AccountCenter` to include a prominent "Enter Workspace" CTA. Redesign `WorkspaceSelector` into a clean dashboard. Apply minimalist tech aesthetics (high contrast, good spacing, clean borders).
- **Email Placeholder**: Keep Email input disabled with clear Coming soon copy while temporary Name + Password registration and sign-in remain usable.
- Record final verification evidence and run evaluator review.

## Out of Scope

- New product features beyond closure evidence.
- Real OAuth providers and callbacks.
- Real email provider delivery.

## Acceptance Criteria

1. Password input has only one (custom) eye icon.
2. Sign-in routes directly to `/account`.
3. Account Center has a clear entry point to "Workspace" (Project Management).
4. `/workspace` shows the Workspace/Project dashboard, not the canvas.
5. Canvas is safely moved to `/project/page.tsx` or similar.
6. Email input is disabled and labelled Coming soon while Name and Password remain editable.
7. Evaluator score is over 140 before the slice is accepted.
8. Final verification covers frontend tests, typecheck, build, Browser E2E.
9. Repository remains restartable from `.\init.ps1`.

## Verification Plan

- Baseline startup: `.\init.ps1`
- Full web tests: `corepack pnpm --filter @xmeta/web test`
- Web typecheck: `corepack pnpm --filter @xmeta/web typecheck`
- Web build: `corepack pnpm --filter @xmeta/web build`
- Diff hygiene: `git diff --check`
- Final startup: `.\init.ps1`

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | `auth-account-007` failed manual QA. Continuing `auth-account-007` to fix UI issues. `.\init.ps1` passed 12 files / 48 tests. |
