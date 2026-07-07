# Evaluator Rubric - Feature 3 Script Node Realtime AI Dialogue

Updated: 2026-07-07

## Evaluation Scope

- Role: Main-agent evaluator for Feature 3 `script-node-007`.
- Scope reviewed: backend chat route, provider boundary, shared contracts, frontend Script composer behavior, workspace tests, API docs, and Feature 3 artifacts.
- Verification posture: applied the verify-skill checklist with backend tests, frontend tests, typecheck, build, API preflight, and Browser end-to-end on the open `/workspace` tab.

## Scorecard

| Criterion | Points | Current | Evidence |
| --- | ---: | ---: | --- |
| Explicit Requirements | 30 | 29 | User asked for backend-connected AI dialogue. `POST /chat` now exists, `AI modify` calls it, and Browser E2E proved two turns. One point reserved because transport is request/response, not SSE/WebSocket streaming. |
| Implicit Requirements | 20 | 19 | Generate remains structured ScriptOutput for downstream nodes; chat does not falsely mark downstream media/persistence done. |
| Regression Checks | 25 | 25 | Backend tests, full web tests, typecheck, build, JSON validation, and diff check passed. |
| Edge Cases | 20 | 18 | Empty chat message validates; mock and OpenAI-compatible chat paths are tested. Durable chat persistence and auth remain later scope. |
| Time/Space Complexity | 15 | 15 | Chat history is bounded in backend schema and prompt builder reads only recent turns. |
| Program Format | 20 | 20 | Contracts are typed in shared TS and Pydantic; provider separation remains intact; docs and artifacts updated. |
| Visual Design (if applicable) | 20 | 20 | Existing compact canvas composer is preserved; multi-turn messages render in the response panel with visible user/assistant grouping and no console errors. |

Current score: 146 / 150

## Findings

- No P1/P2 findings.
- P3: The dialogue is realtime from the user's interaction perspective through immediate backend request/response, but it is not an SSE/WebSocket streaming transport. This matches current architecture deferral for production realtime events.

## Verification Evidence

- `.\init.ps1` baseline passed before implementation: web tests 9 files / 38 tests.
- `.\\.venv\\Scripts\\python.exe -m pytest services\\api\\tests\\test_script_node.py` passed: 23 tests.
- `.\\.venv\\Scripts\\python.exe -m pytest services\\api\\tests` passed: 23 tests.
- `.\\.venv\\Scripts\\python.exe -m ruff check services\\api` passed.
- `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx` passed: 1 file / 14 tests.
- `corepack pnpm --filter @xmeta/web test` passed: 9 files / 38 tests.
- `corepack pnpm --filter @xmeta/web typecheck` passed.
- `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
- JSON validation passed for `feature_list.json` and `feature_tasks/3.json`.
- `git diff --check` passed with LF/CRLF warnings only.
- Local API preflight passed against `POST /api/v1/projects/local-project/nodes/script-1/chat` after restarting the stale uvicorn process on port 8000.
- Browser E2E passed on the user's in-app browser tab at `http://localhost:3000/workspace`: two `AI modify` turns showed both user messages and `Script AI turn 1` / `Script AI turn 2`, `AI disabled` copy was absent, no framework overlay appeared, and console warn/error logs were empty.
- Final `.\init.ps1` passed after artifact updates and reran web tests: 9 files / 38 tests.

## Verdict

Accepted. Feature 3 now satisfies the requirement that the Script node includes both the node UI and backend-connected AI dialogue behavior, with Generate still responsible for producing structured downstream ScriptOutput.
