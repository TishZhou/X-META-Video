# Evaluator Rubric - Feature 16 Agent Runtime Node Split

Updated: 2026-07-17 agent-runtime-002 independent evaluation round 1

## Evaluation Scope

- Role: independent evaluator for Feature 16 `agent-runtime-002`.
- Scope reviewed: `runtime.py`, `nodes/text.py`, `nodes/image.py`, `nodes/audio.py`, `nodes/video.py`, compatibility imports, focused regression tests, architecture documentation, and protected-boundary diffs.
- Protected boundaries: no frontend behavior, public FastAPI route, provider implementation, Task Profile, prompt, Memory, validator, or persistent-state changes were permitted.
- `AGENTS.md` was treated as the user's external uncommitted change and was neither modified nor scored as implementation.

## Scorecard

| Criterion | Points | Current | Evidence |
| --- | ---: | ---: | --- |
| Scope fit and boundary isolation | 15 | 15 | The diff is limited to the planned Agent Runtime split, tests, architecture, and sprint artifacts; protected code has no diff. |
| Module organization and contracts | 20 | 20 | `runtime.py` is the unified facade; four node kinds have dedicated executors; `handlers.py` is compatibility-only. |
| Task-profile completeness | 20 | 20 | Registry and profiles are unchanged; the full API suite proves all seven existing task identities remain usable. |
| Memory-scope enforcement and truthfulness | 20 | 20 | The existing compiler and Memory reader are injected unchanged into every executor; no persistence or one-click orchestration is claimed. |
| Prompt and API compatibility | 20 | 20 | Prompt input maps, response construction, facade method names, and root/legacy imports are preserved. |
| Provider and route contract preservation | 20 | 20 | Provider and `main.py` diffs are empty; existing executors receive the same settings and keyword arguments. |
| Validation and retry truthfulness | 15 | 15 | Each node executor retains `run_with_task_retry` and typed validation in the same execution order. |
| Verification and test depth | 15 | 14 | Focused, full API, full Web, Ruff, JSON, diff, startup, and local-process API smoke all passed; no live provider call was needed for this structural refactor. |
| Repository and artifact hygiene | 5 | 4 | Diff check is clean and no temporary process remains; final status/artifact completion and commit are intentionally left to the main agent. |

Current score: 148 / 150

## Acceptance Evidence

- `xmeta_api.agent_runtime.runtime.AgentRuntime` is the package-level Runtime class and delegates Text, Image, Audio, and Video work without implementing node-specific generation.
- `TextNodeExecutor`, `ImageNodeExecutor`, `AudioNodeExecutor`, and `VideoNodeExecutor` own the corresponding execution methods in separate modules.
- `xmeta_api.agent_runtime.handlers.AgentRuntime` remains identical to the facade class, preserving the previous import path.
- Script task state transitions, dialogue calls, prompt compilation, profile lookup, Runtime retries, typed validation, response fields, and provider call arguments remain equivalent to the previous aggregated handler.
- No `apps/web`, `providers.py`, `main.py`, profiles, prompts, Memory, or validator file changed.
- Architecture documentation truthfully describes the facade/delegation boundary and retains the non-durable Memory/provider limitations.

## Verification Evidence

- Focused Agent Runtime: `.\.venv\Scripts\python.exe -m pytest services\api\tests\test_agent_runtime.py -q` -> 17 passed.
- Full API: `.\.venv\Scripts\python.exe -m pytest services\api\tests -q` -> 72 passed.
- Ruff: `.\.venv\Scripts\python.exe -m ruff check services\api` -> all checks passed.
- Full Web: `pnpm --filter @xmeta/web test` -> 9 files / 58 tests passed.
- JSON: `feature_list.json` and `feature_tasks/16.json` parsed successfully with `python -m json.tool`.
- Whitespace: `git diff --check` passed; only line-ending conversion warnings were emitted.
- Protected-boundary check: frontend, provider, main API, profiles, prompts, Memory, and validators all had empty diffs.
- Local-process API smoke: Uvicorn served OpenAPI 200 with 8 paths; a real PATCH saved Script node version 1; POST run returned the expected truthful 503 for an explicitly unsupported provider. No model/provider request was made.
- Final startup: `.\init.ps1` passed and reran 9 Web files / 58 tests.

## Findings

- No acceptance-blocking defects found.
- The local smoke deliberately tested the API integration and error boundary without external credentials; it is not evidence of live model execution and is not represented as such.
- The only uncommitted file outside sprint scope is the user-owned `AGENTS.md`; it must remain excluded from the feature commit.

## Verdict

ACCEPTED. Score 148/150 exceeds the required threshold of strictly greater than 140. The node-file split is behavior-preserving, appropriately bounded, independently verified, and ready for the main agent to finalize artifacts and commit.
