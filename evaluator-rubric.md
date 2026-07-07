# Evaluator Rubric - Feature 3 Script Provider Truth

Updated: 2026-07-07

## Evaluation Scope

- Role: Main-agent evaluator for Feature 3 `script-node-009`.
- Scope reviewed: Script dialogue backend response metadata, generation task metadata, response-panel copy, workspace tests, API preflight, Browser E2E, and verify-skill update.
- Verification posture: applied the updated verify-skill checklist by checking visible AI reply content against backend-returned provider/model evidence.

## Scorecard

| Criterion | Points | Current | Evidence |
| --- | ---: | ---: | --- |
| Explicit Requirements | 30 | 30 | The AI modify dialogue reply now shows backend-confirmed provider/model beside the assistant content; live replies show `Backend: openai / gpt-5.4-mini` and mock replies are labeled `mock backend`. |
| Implicit Requirements | 20 | 20 | The web app still calls FastAPI only; no frontend provider call or static model label is treated as proof of live LLM execution. |
| Regression Checks | 25 | 25 | Backend tests, ruff, focused web test, typecheck, full web test, build, API preflight, and Browser E2E passed. |
| Edge Cases | 20 | 20 | The project currently uses `.env.example` as real local env; backend reads it after `.env` fallbacks while tests disable dotenv loading to avoid accidental live calls. |
| Time/Space Complexity | 15 | 15 | Provider metadata is carried with existing response objects and constant-size UI state. |
| Program Format | 20 | 20 | Changes stay within Script provider contracts, FastAPI route state, and the Script workspace component. |
| Visual Design (if applicable) | 20 | 20 | The response panel shows compact backend evidence without adding a new modal or distracting UI surface. |

Current score: 150 / 150

## Findings

- No P1/P2 findings.
- No open findings.

## Verification Evidence

- Baseline `.\init.ps1` passed before implementation: web tests 9 files / 39 tests.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests\test_script_node.py` passed: 23 tests with one Starlette TestClient deprecation warning.
- `.\.venv\Scripts\python.exe -m ruff check services\api` passed.
- `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx` passed: 1 file / 16 tests.
- `corepack pnpm --filter @xmeta/web typecheck` passed.
- `corepack pnpm --filter @xmeta/web test` passed: 9 files / 40 tests.
- `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
- API preflight against `POST /api/v1/projects/local-project/nodes/script-1/chat` read `.env.example`, called the live OpenAI-compatible provider, and returned assistant content with `provider: openai` and `model: gpt-5.4-mini`.
- Browser E2E passed on the in-app browser tab at `http://localhost:3000/workspace`: initial UI had no static `gpt-5.4-mini` claim; `AI modify` opened conversation mode with backend waiting state; Send produced a natural-language assistant reply with `Backend: openai / gpt-5.4-mini`; no `Script AI turn` mock text or mock backend label appeared; console warn/error logs were empty.

## Verdict

Accepted. Feature 3 no longer presents the Script AI dialogue reply as a frontend placeholder or unlabeled model response; the visible reply content is tied to live backend provider/model evidence when `.env.example` supplies the configured provider.
