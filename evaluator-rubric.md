# Evaluator Rubric - Feature 1 Main Page Pro Layout Reflow

## Review Scope

- **Selected feature/task:** Feature 1, Main Page Design / layout correction after `main-page-002`
- **Acceptance criteria or source:** user request, `feature_tasks/1.json`, `sprint-contract.md`, and `ui-ux-pro-max` priority rules
- **Session reviewed:** 2026-06-25 `ui-ux-pro-max` layout reflow
- **Changed files:** `apps/web/src/app/animated-entry-page.tsx`, `apps/web/src/app/main-page-content.ts`, `apps/web/src/app/page.test.tsx`, `apps/web/src/components/ui/triple-motion.tsx`, `feature_tasks/1.json`, `progress.md`, `sprint-contract.md`, `evaluator-rubric.md`, `session-handoff.md`
- **Agent's claimed result:** The main page has been re-laid out with a clearer pro information hierarchy while preserving the existing shadcn/UI TripleD visual style and frontend-only behavior.

## Defects And Missing Evidence

- No product defect found for the layout correction.
- The requested `ui-ux-pro-max` skill could not be installed through its Python helper because the local `python` command is a Windows Store placeholder. The GitHub repo was cloned to a temp directory and its `SKILL.md` plus data guidance were read directly.
- Browser/IAB tools were not exposed for this turn, so rendered QA used Playwright fallback against `http://localhost:3000`.
- Feature 1 remains incomplete beyond the current entry/create-project work; recent work, workspace entry, fuller workflow preview, responsive completion, and accessibility basics remain separate child tasks.

## Scorecard

| Category | Score | Evidence |
| --- | ---: | --- |
| Correctness | 2 | Root page still renders `X-META Video`, `Create Project`, canvas preview, and production modes; project choices and production mode expansion still work. |
| Verification | 2 | Baseline startup, unit tests, typecheck, production build, Playwright desktop/mobile QA, diff check, and final startup verification passed. |
| Scope discipline | 2 | Work stayed within Feature 1 page layout and did not add backend, auth, persistence, routes, canvas execution, or AI generation. |
| Reliability | 2 | `next build` statically generated `/` and `/icon.svg`; browser QA reported no console errors, page errors, horizontal overflow, or lingering floating overlay. |
| Maintainability | 2 | Reflow reuses existing `triple-motion` and shadcn components; new copy remains centralized in `main-page-content.ts`; test marker guards the layout variant. |
| UX quality | 2 | Applied `ui-ux-pro-max` priorities: one primary CTA, clearer first viewport, stable open/closed hero position, touch-manipulation on controls, responsive mobile stack, and preserved semantic tokens. |

## Required Evidence

- Exact command: `.\init.ps1`
- Exact command: `npx shadcn@latest info --json`
- Exact source: `nextlevelbuilder/ui-ux-pro-max-skill` cloned to temp and read directly
- Exact command: `corepack pnpm --filter @xmeta/web test`
- Exact command: `corepack pnpm --filter @xmeta/web typecheck`
- Exact command: `corepack pnpm --filter @xmeta/web build`
- Exact command/API: Playwright against `http://localhost:3000`
- Exact command: `git diff --check`
- Render evidence: desktop 1440x900 and mobile 390x844 showed title `X-META Video`, layout marker `data-uiux-pro-max-layout="pro-reflow"`, visible `Create Project`, no generic starter/chat content, no console errors, no page errors, no horizontal overflow, and no floating scroll overlay.
- Interaction evidence: `Create Project` changed from `aria-expanded=false` to `aria-expanded=true`; choices for `AI comic drama`, `MV creation`, and `Short-form video` became visible; one production mode card expanded in both desktop and mobile QA.
- Stability evidence: browser QA confirmed H1 y-position stayed stable between closed and open states on desktop and mobile.
- Startup evidence: final `.\init.ps1` passed with Vitest running 2 files and 6 tests.

## Verdict

**Total:** 12 / 12

**Verdict:** Accept the `ui-ux-pro-max` layout reflow; keep Feature 1 overall `in_progress`.
