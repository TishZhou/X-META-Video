# Evaluator Rubric - Feature 2 Interface Design

## Review Scope

- **Selected feature/task:** Feature 2, Interface Design / `interface-design-001` through `interface-design-008`
- **Acceptance sources:** `feature_tasks/2.json`, `feature_list.json`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, and `sprint-contract.md`
- **Session reviewed:** 2026-06-25 Feature 2 insertion and planning setup
- **Evaluated by:** evaluation subagent
- **Result:** Accepted for feature insertion and planning setup. Feature 2 is planned but not implemented.

## Defects And Missing Evidence

- Feature 2 design artifacts are not implemented yet.
- `feature_tasks/2.json` is initialized with child task definitions and empty evidence arrays.
- Old Feature 2, Project Foundation And App Shell, has moved to Feature 3.
- The prior stale chat-oriented `feature_tasks/2.json` content has been replaced.
- `AGENTS.md` still has a pre-existing user-owned diff outside this feature scope and was not reverted.
- Evaluation subagent confirmed Feature 2 insertion, task-file format, stale chat-task removal, and shifted task-file alignment.

## Scorecard

| Category | Score | Evidence |
| --- | ---: | --- |
| Correctness | 0 | Feature 2 implementation artifacts have not been created yet. |
| Verification | 0 | Only planning/setup verification is expected for this insertion pass; completion verification is pending future implementation. |
| Scope discipline | 2 | The inserted feature is artifact/design-only and explicitly excludes frontend implementation, backend APIs, persistence, orchestration, and AI generation. |
| Reliability | 0 | Design artifact reliability cannot be evaluated until artifacts exist. |
| Maintainability | 1 | Task decomposition is reusable and references Feature 3 handoff, but no final design handoff artifact exists yet. |
| UX quality | 1 | The planned tasks follow UI sketching and wireframing principles, but UX quality cannot be accepted until concrete page maps and wireframes are produced. |

## Required Evidence Before Passing

- Exact command: `.\init.ps1`
- Exact check: JSON syntax validation for `feature_list.json` and `feature_tasks/*.json`
- Artifact review: Feature 2 page-function map
- Artifact review: MVP screen inventory
- Artifact review: information architecture and entry/exit paths
- Artifact review: UI sketching or wireframe descriptions
- Artifact review: reusable wireframing guidelines
- Artifact review: responsive states
- Artifact review: accessibility requirements
- Artifact review: implementation handoff and non-goals
- Final exact command: `.\init.ps1`

## Verdict

**Total:** 5 / 12

**Verdict:** Accept the Feature 2 insertion and planning setup. Do not mark Feature 2 passing until the Interface Design artifacts are implemented, reviewed, and verified.

## Solutions

- Implement `interface-design-001` through `interface-design-008` in order.
- Keep the work in repository artifacts so Feature 3 can start without relying on chat history.
- Re-run evaluation after artifacts exist and record concrete evidence in this file and `feature_tasks/2.json`.
