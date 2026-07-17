# Evaluator Rubric - Feature 16 Agent Runtime Foundation

Updated: 2026-07-17 round 2

## Evaluation Scope

- Role: independent evaluator for Feature 16 `agent-runtime-001`.
- Scope reviewed: the complete Agent Runtime package, FastAPI route integration, compatibility imports, task profiles, memory selection, prompt compilation, typed validation, bounded Runtime retry, existing provider boundary, focused/regression tests, architecture documentation, and repository hygiene.
- Protected boundaries: canvas topology remains user-authored; no frontend behavior, public route, provider HTTP payload, credential, retry, or supported-model changes are permitted.
- `AGENTS.md` is treated as an external shared change and was not modified or scored as Feature 16 implementation.

## Scorecard

| Criterion | Points | Current | Evidence |
| --- | ---: | ---: | --- |
| Scope fit and boundary isolation | 15 | 15 | No frontend files changed. Runtime executes only the user-selected node task and does not mutate canvas topology. Provider HTTP and credential logic remains in `providers.py`. |
| Module organization and contracts | 20 | 19 | Contracts, profiles, registry, memory, compiler, prompts, retry, validators, and handlers have clear ownership, with compatibility exports for old imports. Typed handlers still reference current provider-specific settings classes rather than a provider-neutral gateway protocol. |
| Task-profile completeness | 20 | 19 | Seven profiles cover all current Script/dialogue, character/prop/scene image, music, and video tasks across all four node kinds. Each declares inputs, memory scopes, template, output, validator, and retry limit; focused tests assert identity coverage and default retry policy, though not every exact field tuple. |
| Memory-scope enforcement and truthfulness | 20 | 20 | Compiler requests only declared scopes and filters an over-returning reader. The default reader returns no memory and does not imply approved, durable, or database-backed project memory exists. |
| Prompt and API compatibility | 20 | 19 | Empty-memory Script prompt equality, dialogue compilation, image/audio/video passthrough inputs, response shapes, Script failed-state behavior, and task-id-only video behavior are covered. Durable or non-empty production memory remains intentionally unavailable. |
| Provider and route contract preservation | 20 | 20 | All current FastAPI paths and response contracts remain unchanged. Existing SeedDream, MiniMax, Ark Seedance, and Script tests pass; dialogue provider failures still map to 502. No provider implementation changed. |
| Validation and retry truthfulness | 15 | 15 | `run_with_task_retry` consumes an explicitly configured bounded retry limit. All shipped profiles use zero Runtime retries, preserving existing provider retry semantics and call counts. Empty text/image/audio/video results are rejected by typed validators. |
| Verification and test depth | 15 | 15 | Focused Runtime tests expanded from 5 to 15 and now cover retry, dialogue, Script failure state, route 502, audio, queued video, and invalid validators. Full API, Ruff, web, JSON, diff, live-server smoke, and final startup checks passed. |
| Repository and artifact hygiene | 5 | 5 | Full `git diff --check` passes, JSON is valid, no temporary files or frontend edits were introduced, and the external `AGENTS.md` change remains untouched. |

Current score: 147 / 150

## Acceptance Evidence

- `xmeta_api.agent_runtime` is the route-level execution entry point for current Text, Image, Audio, and Video node tasks.
- `TaskId`, `NodeKind`, `MemoryScope`, `PromptTemplateId`, `ValidatorId`, immutable `TaskProfile`, registry, compiler, validators, and retry runner establish reusable contracts.
- The default registry contains all seven currently implemented task identities and all four current node kinds.
- Prompt compilation rejects missing declared inputs and injects only memory returned for the selected profile's declared scopes.
- `EmptyProjectMemoryReader` truthfully represents the current non-durable MVP; PostgreSQL memory, approval workflows, worker execution, one-click generation, and graph rewiring are not claimed.
- Script prompt/execution ownership is in Agent Runtime, while `xmeta_api.prompt` and `xmeta_api.runner` preserve previous imports.
- FastAPI resolves current settings and injects existing provider operations into typed Runtime handlers; provider payload construction and provider-level retry remain unchanged.
- Runtime retry is executable and bounded for a custom profile, while all production profiles set `retry_limit=0` to avoid stacking retries over existing providers.
- Focused tests prove dialogue prompt compilation, Script failed task state, HTTP 502 mapping, audio input preservation, task-id-only video honesty, and rejection of empty typed outputs.
- No `apps/web` file changed, and the complete frontend suite remains green.

## Verification Evidence

- `\.venv\Scripts\python.exe -m pytest services\api\tests\test_agent_runtime.py -q` passed: 15 tests, with one existing Starlette/httpx deprecation warning.
- `\.venv\Scripts\python.exe -m pytest services\api\tests -q` passed: 70 tests, with the same existing deprecation warning.
- `\.venv\Scripts\python.exe -m ruff check services\api` passed.
- `corepack pnpm --filter @xmeta/web test` passed: 9 files / 58 tests.
- PowerShell `ConvertFrom-Json` validation passed for `feature_list.json` and `feature_tasks/16.json`.
- Full `git diff --check` passed; line-ending conversion notices were informational only.
- Live local Uvicorn smoke passed with dotenv disabled: `/openapi.json` returned 200 with 8 paths, and Image generation returned the expected truthful 503 naming missing `DOUBAO_API_KEY` without leaking a key.
- Final `.\init.ps1` passed: dependencies were current and the standard verification reran 9 web test files / 58 tests successfully.

## Findings

- No open acceptance-blocking findings.
- Residual: all external model executions in verification used injected fakes/custom HTTP transports, or the live local server's deliberate missing-config path. No production provider credential was used and no live external generation is claimed.
- Residual: project memory remains empty and non-durable by design. Future persistent memory must enforce approval, tenant/project scope, and exact asset versions before replacing the current reader.
- Residual: if a future profile enables Runtime retries, exception classification should be considered so permanent configuration/client errors are not retried; current profiles are zero, so current behavior and provider retry semantics are preserved.
- Residual: handlers currently use provider-specific settings types. A provider-neutral gateway protocol may be useful when multiple model adapters are introduced, but it is not required for this compatibility-focused foundation.

## Verdict

Accepted at 147 / 150 for Feature 16 `agent-runtime-001`. The second round resolves the prior mandatory diff failure, makes bounded Runtime retry executable without changing current provider retry behavior, and adds the missing handler, failure, route-mapping, queued-video, and validator coverage.
