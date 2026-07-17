# Evaluator Rubric - Feature 16 Compatibility Shim Removal

Updated: 2026-07-17 agent-runtime-003 independent evaluation round 1

## Evaluation Scope

- Role: independent evaluator for Feature 16 `agent-runtime-003`.
- Scope reviewed: deletion of `agent_runtime/handlers.py`, `xmeta_api/prompt.py`, and `xmeta_api/runner.py`; cleanup of package exports; focused tests; architecture wording; and protected-boundary diffs.
- Protected boundaries: no frontend behavior, public FastAPI route, provider implementation, Task Profile, prompt content, Memory, validator, retry, or persistent-state changes were permitted.
- `AGENTS.md` was treated as the user's external uncommitted change and was neither modified nor scored as implementation.

## Scorecard

| Criterion | Points | Current | Evidence |
| --- | ---: | ---: | --- |
| Scope fit and boundary isolation | 15 | 15 | The implementation diff is limited to the three planned deletions, package export cleanup, focused tests, architecture wording, and sprint artifacts; every protected implementation boundary has an empty diff. |
| Module organization and contracts | 20 | 20 | `runtime.py` remains the single Runtime facade and the four node executors remain in `nodes/text.py`, `image.py`, `audio.py`, and `video.py`; all three obsolete modules are physically absent. |
| Task-profile completeness | 20 | 20 | Registry and profile files are unchanged; focused and full API suites prove the seven existing task identities still resolve and execute through the final layout. |
| Memory-scope enforcement and truthfulness | 20 | 20 | Compiler and Memory code is unchanged, scoped reads remain tested, and the architecture still states that the current reader is empty/process-local rather than durable project memory. |
| Prompt and API compatibility | 20 | 20 | Tests now import `agent_runtime.prompts` directly; the prompt implementation itself is unchanged, all eight OpenAPI paths remain available, and the Script PATCH/run route boundary behaves as before. |
| Provider and route contract preservation | 20 | 20 | `main.py` and `providers.py` have empty diffs; Runtime/provider arguments and route status mappings are covered by the unchanged behavior tests and local API smoke. |
| Validation and retry truthfulness | 15 | 15 | Validator and retry files are unchanged; focused tests still prove typed responses, failed Script state, and bounded Runtime retry behavior. |
| Verification and test depth | 15 | 15 | Focused Runtime, full API, Ruff, full Web, JSON, exact import/spec searches, diff check, local Uvicorn route smoke, and final startup verification all passed. |
| Repository and artifact hygiene | 5 | 4 | No stale source import or temporary Uvicorn process remains and diff check is clean; final status artifacts and commit are intentionally left to the main agent. |

Current score: 149 / 150

## Acceptance Evidence

- `services/api/xmeta_api/agent_runtime/handlers.py`, `services/api/xmeta_api/prompt.py`, and `services/api/xmeta_api/runner.py` do not exist.
- Exact Python import search found no reference to any deleted compatibility path; a fresh Python process returned `None` for all three old module specs.
- `agent_runtime/__init__.py` exports the final `runtime.AgentRuntime` and package-owned Runtime instance without the former `run_script_task_sync` wrapper, prompt helper forwarding, or retry forwarding.
- `runtime.py` and `nodes/*` have no implementation diff from the accepted node split; node execution ownership therefore remains separated by Text, Image, Audio, and Video.
- No `apps/web`, `main.py`, `providers.py`, profile, prompt-content, Memory, validator, or retry implementation changed.
- Architecture documentation now describes only the final Runtime/node layout and no longer claims a compatibility import exists.

## Verification Evidence

- Focused Agent Runtime: `.\.venv\Scripts\python.exe -m pytest services\api\tests\test_agent_runtime.py -q` -> 17 passed.
- Full API: `.\.venv\Scripts\python.exe -m pytest services\api\tests -q` -> 72 passed.
- Ruff: `.\.venv\Scripts\python.exe -m ruff check services\api` -> all checks passed.
- Full Web: `pnpm --filter @xmeta/web test` -> 9 files / 58 tests passed.
- JSON: `feature_list.json` and `feature_tasks/16.json` parsed successfully with `python -m json.tool`.
- Removal proof: all three deleted paths returned `Test-Path=False`; exact source-import search returned no matches; fresh-process module specs were all `None`.
- Protected-boundary check: frontend, `main.py`, provider, profiles, prompt content, Memory, validators, and retry had empty diffs.
- Whitespace: `git diff --check` passed; only Git line-ending conversion notices were emitted.
- Local Uvicorn smoke: OpenAPI returned 200 with 8 paths; a real Script-node PATCH returned 200 and version 1; its POST run reached the route and truthfully returned 503 for an intentionally unsupported provider.
- Final startup: `.\init.ps1` passed and reran 9 Web files / 58 tests.

## Findings

- No acceptance-blocking defect found.
- The Uvicorn smoke verified the real local API/Runtime integration and error mapping. It intentionally used an unsupported provider, made no external model call, and is not evidence of live provider-backed generation.
- The only uncommitted file outside sprint scope is the user-owned `AGENTS.md`; the main agent must keep it out of the feature commit.

## Verdict

ACCEPTED. Score 149/150 exceeds the required threshold of strictly greater than 140. The obsolete compatibility layer is removed, all active callers use the final Agent Runtime layout, behavior and protected boundaries are preserved, and the change is ready for artifact finalization and commit.
