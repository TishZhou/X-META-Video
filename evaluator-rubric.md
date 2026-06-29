# Evaluator Rubric - Feature 3 Script Node

Updated: 2026-06-29

## Evaluation Scope

- Role: Evaluation subagent, with main-agent artifact recording.
- Target: Feature 3 `Script Node` revised MV world-description input/output API and workspace interaction.
- Required read set: `AGENTS.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/API.md`, `feature_list.json`, `feature_tasks/3.json`, `sprint-contract.md`, `progress.md`, and changed implementation files.
- Evaluation basis: sprint acceptance criteria, architecture boundaries, UIUX references, shadcn composition guidance, backend route behavior, and actual verification output.

## Scorecard

| Criterion | Points | Current | Evidence Required |
| --- | ---: | --- | --- |
| Shared Script Node contracts | 15 | 15 | Typed frontend/backend contracts cover single world-description input, storyboard direction, characters, scenes, task, and status shapes. |
| Backend API behavior | 20 | 20 | FastAPI routes validate save/run/status/result behavior and return structured MV expansion task/output responses. |
| Provider and prompt boundary | 15 | 15 | Mock provider works by default; OpenAI-compatible provider env validation fails clearly when incomplete; prompt builder is centralized. |
| Workspace Script editor | 20 | 20 | Selecting Script node opens a desktop editor, accepts one AI chat-style MV world prompt, runs generation, and renders structured output tabs. |
| Honest product boundaries | 10 | 10 | UI/API labels mock/dev state honestly and do not imply image/audio/video/export generation or production auth is complete. |
| Verification coverage | 15 | 15 | Backend tests, web tests, typecheck, build, Browser QA, JSON validation, `git diff --check`, and final `.\init.ps1` pass. |
| Artifact evidence | 5 | 5 | `feature_list.json`, `sprint-contract.md`, `evaluator-rubric.md`, `progress.md`, and `session-handoff.md` record final evidence. |

Current score: 100 / 100 after the revised MV world-description workflow implementation and verification.

## Initial Findings

- Feature 3 task decomposition was empty at session start and has been initialized for Script Node only.
- Baseline `.\init.ps1` passed before source changes with 9 web test files / 28 tests.
- `AGENTS.md` has pre-existing user edits and remains protected from reverts.
- Backend currently has only dependency scaffold before Feature 3 implementation.
- Prompt quality is explicitly not the acceptance target; stable input/output plumbing is.
- Evaluation pass found no open P1/P2/P3 issues after CORS integration and production Browser QA.
- Remaining deferred capabilities are explicit: production auth, durable PostgreSQL persistence, queue workers, asset/history storage, final prompt tuning, and downstream media generation.
- Revision pass replaced the earlier multi-field creative brief form with the user-approved single MV world-view description flow.
- Revision pass found no open P1/P2/P3 issues in the updated contract after backend pytest, frontend tests, typecheck, build, Browser QA, JSON validation, and final startup verification.

## Verification Evidence

- Baseline `.\init.ps1` passed before implementation and reran web tests: 9 files / 28 tests.
- Backend verification passed with bundled Python: `python -m pytest services/api/tests` reported 5 passed with one upstream Starlette TestClient deprecation warning.
- Backend lint passed: `python -m ruff check services/api`.
- Focused frontend verification passed: `corepack pnpm --filter @xmeta/web test -- src/components/xmeta/workflow-canvas/workflow-canvas-workspace.test.tsx src/lib/workflow-canvas/graph.test.ts` reported 2 files / 10 tests.
- Full frontend verification passed: `corepack pnpm --filter @xmeta/web test` reported 9 files / 29 tests.
- `corepack pnpm --filter @xmeta/web typecheck` passed.
- `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
- Production Browser QA passed on `http://127.0.0.1:3000/workspace`: Script editor visible, input-to-output flow called PATCH/run/task/result endpoints with 200/202/200/200, Script node became `ready`, structured output tabs rendered, no console errors, no failed requests, no document overflow, and no misleading video generation claim.
- Final closure passed: `feature_list.json` and `feature_tasks/3.json` JSON validation, `git diff --check` with line-ending warnings only, and final `.\init.ps1` rerunning 9 web test files / 29 tests.
- Revised workflow backend verification passed: `python -m pytest services/api/tests` reported 5 passed with one upstream Starlette TestClient deprecation warning.
- Revised workflow backend lint passed: `python -m ruff check services/api`.
- Revised workflow focused frontend verification passed: `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace` reported 1 file / 5 tests.
- Revised workflow full frontend verification passed: `corepack pnpm --filter @xmeta/web test` reported 9 files / 29 tests.
- Revised workflow typecheck passed: `corepack pnpm --filter @xmeta/web typecheck`.
- Revised workflow build passed: `corepack pnpm --filter @xmeta/web build`.
- Revised workflow Browser QA passed on `http://127.0.0.1:3000/workspace`: AI chat-style MV world input visible, `Generate` endpoint sequence returned 200/202/200/200, Script node became `ready`, Overview/Storyboard/Characters/Scenes tabs rendered, console errors empty, failed requests empty, no horizontal overflow, and no misleading media-generation claim.
- Revised workflow final closure passed: `feature_list.json` and `feature_tasks/3.json` JSON validation, `git diff --check` with line-ending warnings only, and final `.\init.ps1` rerunning 9 web test files / 29 tests.

## Verdict

Passing. No open evaluator findings for the approved Feature 3 scope.
