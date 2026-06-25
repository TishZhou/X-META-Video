# Evaluator Rubric - Feature 2 Interface Design

## Review Scope

- **Selected feature/task:** Feature 2, Interface Design / `interface-design-001` through `interface-design-008`
- **Acceptance sources:** `feature_tasks/2.json`, `feature_list.json`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, implemented `apps/web` pages, and `sprint-contract.md`
- **Session reviewed:** 2026-06-25 Feature 2 scope expansion
- **Evaluated by:** pending evaluation subagent
- **Result:** Scope expanded. Feature 2 must now include design artifacts and initial web page implementation before it can pass.

## Defects And Missing Evidence

- Feature 2 design artifacts are not implemented yet.
- Feature 2 initial web page prototypes are not implemented yet.
- `feature_tasks/2.json` is initialized with child task definitions and empty evidence arrays.
- Old Feature 2, Project Foundation And App Shell, remains Feature 3.
- `AGENTS.md` still has a pre-existing user-owned diff outside this feature scope and was not reverted.

## Scorecard

| Category | Score | Evidence |
| --- | ---: | --- |
| Correctness | 0 | Feature 2 design artifacts and initial web page prototypes have not been created yet. |
| Verification | 0 | Completion verification is pending future implementation. |
| Scope discipline | 1 | Scope now correctly includes initial web pages while excluding real backend, persistence, AI execution, queue, worker, and production auth behavior. |
| Reliability | 0 | Prototype reliability cannot be evaluated until pages exist and rendered QA runs. |
| Maintainability | 1 | Task decomposition separates design, implementation, responsive/accessibility, and handoff, but no final reusable artifact or code exists yet. |
| UX quality | 1 | Planned tasks follow UI sketching, wireframing, and UI-detail principles, but UX quality cannot be accepted until concrete pages are produced and reviewed. |

## Required Evidence Before Passing

- Exact command: `.\init.ps1`
- Exact check: JSON syntax validation for `feature_list.json` and `feature_tasks/*.json`
- Artifact review: Feature 2 page-function map
- Artifact review: MVP screen inventory
- Artifact review: information architecture and entry/exit paths
- Artifact review: UI sketching or wireframe descriptions
- Artifact review: reusable wireframing guidelines
- Code review: initial web pages or sections in `apps/web`
- Exact command: `corepack pnpm --filter @xmeta/web test`
- Exact command: `corepack pnpm --filter @xmeta/web typecheck`
- Exact command: `corepack pnpm --filter @xmeta/web build`
- Rendered QA: desktop and mobile checks for Feature 2 pages
- Accessibility evidence: keyboard/focus/label/status basics
- Boundary evidence: no backend, persistence, provider, queue, worker, or export-rendering claims
- Final exact command: `.\init.ps1`

## Verdict

**Total:** 3 / 12

**Verdict:** Scope is now aligned with the user's clarification. Do not mark Feature 2 passing until both design artifacts and initial web page implementation are complete, reviewed, and verified.

## Solutions

- Implement `interface-design-001` through `interface-design-008` in order.
- Store design artifacts in the repository and make the initial pages visible in the web app.
- Re-run evaluation after artifacts and pages exist, then record concrete evidence in this file and `feature_tasks/2.json`.
