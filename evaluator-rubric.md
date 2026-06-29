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
| Workspace Script interaction | 20 | 20 | Selecting Script node shows one AI chat-style MV world input bound under the node, exposes Storyboard/Characters/Scene in the input footer, uses AI修改 to reveal or create response history between node and input, runs generation, and renders structured response targets without a detached editor. |
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
- Browser-comment revision changed the workspace to a white Figma-like canvas, moved Script Node input/output into a vertical chat flow, added Storyboard/Characters/Scene output selection, and made the Script node card display only the user's world view.
- Follow-up browser-comment revision removed the separate Choose output card, moved Storyboard/Characters/Scene into the Generate-row dropdown, placed the response above the input, reused the TriplD response typing component for no-output/running state, and added draggable, resizable, closable/reopenable Script editor behavior.
- Latest inline-composer revision removed the detached Script editor entirely and binds the Script input composer under the selected node. `AI修改` reveals or creates response history between the node and input.

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
- Browser-comment verification passed: baseline `.\init.ps1`, focused workspace plus TriplD chat tests 2 files / 9 tests, backend pytest 5 tests, backend ruff, full web tests 9 files / 29 tests, `corepack pnpm --filter @xmeta/web typecheck`, and `corepack pnpm --filter @xmeta/web build`.
- Browser-comment QA passed on `http://127.0.0.1:3000/workspace`: white canvas and editor backgrounds measured, vertical input/response flow confirmed, Storyboard/Characters/Scene output buttons worked, Script node preview contained only the submitted world view, endpoint sequence returned 200/202/200/200, console errors empty, failed requests empty, and no horizontal overflow.
- Browser-comment final closure passed: `feature_list.json` and `feature_tasks/3.json` JSON validation, `git diff --check` with line-ending warnings only, and final `.\init.ps1` rerunning 9 web test files / 29 tests.
- Follow-up browser-comment baseline passed: `.\init.ps1` reran 9 web test files / 29 tests before source changes.
- Follow-up focused frontend verification passed: `corepack pnpm --filter @xmeta/web test -- src/components/xmeta/workflow-canvas/workflow-canvas-workspace.test.tsx src/app/tripled-test/page.test.tsx` reported 2 files / 9 tests.
- Follow-up full frontend verification passed: `corepack pnpm --filter @xmeta/web test` reported 9 files / 29 tests; `corepack pnpm --filter @xmeta/web typecheck` passed; `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
- Follow-up backend verification passed with bundled Python: `python -m pytest services/api/tests` reported 5 passed with one upstream Starlette TestClient deprecation warning; `python -m ruff check services/api` passed.
- Follow-up production Browser QA passed on `http://localhost:3002/workspace`: Choose output text absent, dropdown options exactly Storyboard/Characters/Scene, Characters selection updated the response, response stayed above input, drag and resize changed editor geometry, close/reopen worked, mock generation returned 200 PATCH / 202 POST / 200 task / 200 result, Script node became ready, console errors empty, failed requests empty, and document width equaled scrollWidth.
- Inline-composer focused frontend verification passed: `corepack pnpm --filter @xmeta/web test -- src/components/xmeta/workflow-canvas/workflow-canvas-workspace.test.tsx` reported 1 file / 5 tests.
- Inline-composer full frontend verification passed: `corepack pnpm --filter @xmeta/web test` reported 9 files / 29 tests; `corepack pnpm --filter @xmeta/web typecheck` passed after `next build` regenerated `.next/types`; `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
- Inline-composer backend verification passed with bundled Python: `python -m pytest services/api/tests` reported 5 passed with one upstream Starlette TestClient deprecation warning; `python -m ruff check services/api` passed.
- Inline-composer production Browser QA passed on `http://localhost:3002/workspace`: no floating Script editor, inline composer initially below the node, history initially hidden, `AI修改` generated response history between the node and input, Characters output selection persisted, generation returned 200 PATCH / 202 POST / 200 task / 200 result, Script node became ready, console errors empty, failed requests empty, and document width equaled scrollWidth.

## Verdict

Passing. No open evaluator findings for the approved Feature 3 scope.
