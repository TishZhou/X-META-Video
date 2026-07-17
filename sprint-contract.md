# Sprint Contract - Feature 16 Agent Runtime Foundation

## Sprint Overview

**Sprint:** feature-16-agent-runtime-foundation

**Feature:** Feature 16, Agent Runtime Foundation

**Task:** agent-runtime-001

**Status:** passing
**Goal:** Organize the existing backend text, image, audio, and video node execution behind a reusable Agent Runtime module so future canvas-node task profiles, prompt compilation, memory selection, validation, and model routing can evolve without duplicating route or provider logic.

## Write Scope

- `services/api/xmeta_api/agent_runtime/**`
- `services/api/xmeta_api/main.py`
- `services/api/xmeta_api/prompt.py`
- `services/api/xmeta_api/runner.py`
- `services/api/tests/test_agent_runtime.py`
- Existing backend node tests only when imports must follow the new ownership boundary
- `docs/ARCHITECTURE.md`
- `feature_tasks/16.json`
- `feature_list.json`
- `sprint-contract.md`
- `evaluator-rubric.md`
- `progress.md`
- `session-handoff.md`

Protected boundaries:

- Do not change the canvas UI or frontend node behavior.
- Do not change public FastAPI route paths or request/response payloads.
- Do not change provider HTTP payload semantics, credentials, retry behavior, or supported model names.
- Do not claim durable project memory, PostgreSQL persistence, worker execution, one-click workflow orchestration, or automatic canvas rewiring exists.
- Keep user-authored canvas connections authoritative; Agent Runtime executes a selected node task and does not alter graph topology.

## In Scope

- Add one reusable Agent Runtime package with task profiles for currently implemented node tasks.
- Define explicit task identity, node kind, required inputs, memory scopes, prompt-template identity, output identity, validator identity, and retry limits.
- Add a replaceable project-memory reader contract and a truthful empty/default implementation for the current MVP.
- Move Script prompt compilation and Script task execution into the new module.
- Route current text, image, audio, and video generation through typed Agent Runtime handlers.
- Preserve compatibility for existing imports and all existing backend/frontend behavior.
- Add focused contract and route-regression tests.

## Acceptance Criteria

1. `xmeta_api.agent_runtime` is the single backend entry point for current node-agent execution and exposes registered task profiles for text, image, audio, and video.
2. Every registered task profile declares its node kind, prompt template, memory reads, output type, validator, and bounded retry policy.
3. Prompt compilation reads only the memory scopes declared by the selected profile.
4. Current FastAPI endpoints retain their exact paths and response shapes and still call the existing providers with equivalent inputs.
5. Provider-specific implementation remains outside Agent Runtime and existing provider tests continue to pass.
6. No frontend files change and full web tests remain passing.
7. Focused Agent Runtime tests, full API tests, Ruff, JSON validation, diff checks, and final startup verification pass with evidence recorded.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | Confirmed `D:\\X-META-Video`, read required product/architecture/state files, and verified a clean `main` branch. |
| Startup | `./init.ps1` passed before implementation and reran web tests: 9 files / 58 tests. |
| Planning | Scoped one backend-only feature around organizing existing execution, preserving public contracts and provider behavior. |
| Implementation | Round 1 created the Agent Runtime package, moved Script prompt/execution ownership, and routed existing generation endpoints through typed handlers. |
| Evaluation round 1 | Scored 137/150. Functional checks passed; revision required for task-level retry semantics, focused handler/validator coverage, and sprint-contract whitespace. |
| Revision round 2 | Runtime now consumes bounded retry metadata; current profiles use zero Runtime retries to preserve provider behavior; focused coverage expanded to 15 tests. |
| Verification | Agent Runtime 15 passed; full API 70 passed; Ruff passed; web 58 passed; JSON, live local Uvicorn smoke, full diff check, and final `./init.ps1` passed. |
| Evaluation round 2 | Accepted at 147/150 with no open acceptance-blocking findings. |
