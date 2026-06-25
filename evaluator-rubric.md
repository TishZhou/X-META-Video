# Evaluator Rubric - Feature 3 Project Foundation And Motion App Shell

## Review Scope

- **Selected feature/task:** Feature 3, Project Foundation And Motion App Shell
- **Current task slice:** `motion-shell-001`, `motion-shell-002`, and `motion-shell-003`
- **Acceptance sources:** `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/DEPENDENCIES.md`, `docs/INTERFACE_DESIGN.md`, `feature_tasks/3.json`, and `sprint-contract.md`
- **Current status:** Task 1-3 passing; Feature 3 remains in progress because `motion-shell-004` through `motion-shell-007` are not started.
- **Evaluator result:** Passing for `motion-shell-001` through `motion-shell-003` only.

## Required Evidence Before Passing

- Baseline `.\init.ps1` evidence.
- Selected UI TripleD shadcn block list and product mapping.
- Local adapted source for selected blocks/components.
- Tests covering route rendering, motion-state markers, reduced-motion behavior where practical, and product-specific copy.
- `corepack pnpm --filter @xmeta/web test`.
- `corepack pnpm --filter @xmeta/web typecheck`.
- `corepack pnpm --filter @xmeta/web build`.
- Rendered desktop QA.
- Rendered mobile QA.
- Console/page-error check.
- No horizontal overflow check.
- Final `.\init.ps1`.
- Evidence that unfinished functions use compact labels plus click-to-reveal detail instead of long always-visible placeholder descriptions.

## Scorecard

| Category | Score | Passing expectation |
| --- | ---: | --- |
| Product direction | 2 / 2 | Implementation clearly moves beyond static mockups toward a motion-first creative workspace. |
| UI TripleD adoption | 1 / 2 | Local UI TripleD-style shadcn/Radix + Framer Motion patterns are mapped and implemented, but upstream block provenance is not yet recorded. |
| Motion quality | 2 / 2 | Shell, route, navigation, dashboard, route-card, and project-card surfaces use purposeful motion markers and reduced-motion fallbacks. |
| Accessibility | 2 / 2 | Reduced-motion behavior, keyboard access, focus states, semantic labels, and text status labels remain intact. |
| Product fit | 2 / 2 | Demo component content is replaced with X-META Video project, canvas, asset, task, history, export, and account data. |
| Placeholder discipline | 2 / 2 | Unfinished functions are honest but compact, with click-to-reveal explanations instead of page-cluttering long descriptions. |
| Verification | 2 / 2 | Required commands and rendered QA pass with evidence. |

## Review Notes

- Current Feature 2 pages are intentionally static/local prototypes. They may be used as structural scaffolding, but they should not be accepted as the Feature 3 visual or interaction target.
- Basic shadcn primitives remain acceptable as underlying primitives, but Feature 3 should not look like only Card/Button/Badge composition.
- Motion must clarify state and preserve task speed. Decorative motion alone does not satisfy this rubric.
- Missing backend or unfinished feature messaging should be visible enough to prevent false claims, but not so verbose that every page becomes documentation.
- Baseline `.\init.ps1` passed on 2026-06-25 before this task 1-3 implementation slice; Vitest passed 3 files / 16 tests.
- This session must not score `motion-shell-004` through `motion-shell-007` as passing unless those tasks are explicitly implemented and verified later.
- Planning subagent recommended Radix/shadcn UI TripleD-style patterns only and no Base UI variants.
- Coding subagent implemented the first pass and identified a Next static prerender failure caused by passing Lucide component functions through a broad client boundary. Main thread resolved it by isolating Framer Motion wrappers in `apps/web/src/app/workspace/workspace-motion.tsx` while keeping icon-bearing workspace components server-safe.
- Evaluation subagent scored task 1-3 as 13 / 14 and found no blocking issues. P3 follow-up: avoid overclaiming copied upstream UI TripleD blocks unless upstream block provenance is recorded; artifacts were revised to say local UI TripleD-style shadcn/Radix + Framer Motion adaptations.
- Verification evidence: JSON validation passed; `corepack pnpm --filter @xmeta/web test` passed 3 files / 18 tests; `corepack pnpm --filter @xmeta/web typecheck` passed; `corepack pnpm --filter @xmeta/web build` passed; `git diff --check` passed; Chrome headless/CDP rendered QA passed desktop `/workspace`, mobile `/workspace`, and mobile `/workspace/canvas` with no console warnings/errors and no horizontal overflow.
- Screenshot evidence: `C:\Users\AI\AppData\Local\Temp\xmeta-feature3-qa\workspace-desktop.png`, `C:\Users\AI\AppData\Local\Temp\xmeta-feature3-qa\workspace-mobile.png`, and `C:\Users\AI\AppData\Local\Temp\xmeta-feature3-qa\canvas-mobile.png`.

## Verdict

**Total:** 13 / 14

**Evaluator verdict:** Passing for `motion-shell-001` through `motion-shell-003` only. Feature 3 remains `in_progress`; `motion-shell-004` through `motion-shell-007` remain `not_started`.
