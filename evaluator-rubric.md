# Evaluator Rubric - Feature 1 Small Task 2 Create Project Entry

## Review Scope

- **Selected feature/task:** Feature 1, Main Page Design / `main-page-002`
- **Acceptance criteria or source:** `feature_tasks/1.json` and `sprint-contract.md`
- **Session reviewed:** 2026-06-25 create-project entry update
- **Changed files:** `apps/web/src/app/animated-entry-page.tsx`, `apps/web/src/app/main-page-content.ts`, `apps/web/src/app/page.test.tsx`, `feature_tasks/1.json`, `progress.md`, `sprint-contract.md`, `evaluator-rubric.md`, `session-handoff.md`
- **Agent's claimed result:** The app root now has a primary `Create Project` action that opens frontend-only project-start choices for AI comic drama, MV creation, and short-form video.

## Defects And Missing Evidence

- No product defect found for `main-page-002`.
- Real project creation, persistence, workspace routing, backend calls, auth, and canvas execution are intentionally out of scope and labeled as Feature 2 work.
- Feature 1 remains incomplete beyond `main-page-002`; recent work, workspace entry, full workflow preview, responsive completion, and accessibility basics remain separate child tasks.
- Browser QA used Playwright fallback against the existing local dev server because no callable in-app Browser tool was exposed for this turn.

## Scorecard

| Category | Score | Evidence |
| --- | ---: | --- |
| Correctness | 2 | Root page renders `X-META Video`; `Create Project` is visible; clicking it reveals `AI comic drama`, `MV creation`, and `Short-form video` choices. |
| Verification | 2 | Unit tests, typecheck, production build, Playwright desktop/mobile interaction QA, diff check, and final startup verification were run. |
| Scope discipline | 2 | Work stayed frontend-only and did not add backend, auth, persistence, project routes, canvas execution, task queue, or AI generation behavior. |
| Reliability | 2 | `next build` statically generated `/` and `/icon.svg`; browser QA reported no console errors, page errors, or horizontal overflow. |
| Maintainability | 2 | Project-start copy lives in `main-page-content.ts`; page state is local to `AnimatedEntryPage`; UI reuses existing shadcn and `triple-motion` components. |
| Handoff readiness | 2 | `feature_tasks/1.json`, `progress.md`, `sprint-contract.md`, and `session-handoff.md` identify completed task state and next task. |

## Required Evidence

- Exact command: `.\init.ps1`
- Exact command: `npx shadcn@latest info --json`
- Exact command: `corepack pnpm --filter @xmeta/web test`
- Exact command: `corepack pnpm --filter @xmeta/web typecheck`
- Exact command: `corepack pnpm --filter @xmeta/web build`
- Exact command/API: Playwright against `http://localhost:3000`
- Exact command: `git diff --check`
- Render evidence: desktop 1440x900 and mobile 390x844 reported title `X-META Video`, `Create Project` action present, no generic starter/chat content, no console errors, no page errors, and no horizontal overflow.
- Interaction evidence: before click, `Create Project` had `aria-expanded=false`; after click, it had `aria-expanded=true`, `data-project-start-state="open"` was present, and choices for `AI comic drama`, `MV creation`, and `Short-form video` were visible.
- Boundary evidence: visible copy states that real project creation, persistence, and workspace routing arrive in Feature 2.
- Startup evidence: final `.\init.ps1` passed with Vitest running 2 files and 6 tests.

## Verdict

**Total:** 12 / 12

**Verdict:** Accept `main-page-002`; keep Feature 1 overall `in_progress`.
