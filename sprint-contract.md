# Sprint Contract - Feature 16 Agent Runtime Node Split

## Sprint Overview

**Sprint:** feature-16-agent-runtime-node-split

**Feature:** Feature 16, Agent Runtime Foundation

**Task:** agent-runtime-002

**Status:** passing

**Goal:** Split the current aggregated Agent Runtime node handlers into dedicated Text, Image, Audio, and Video executor modules while preserving the unified Runtime entry point and every existing API/provider behavior.

## Write Scope

- `services/api/xmeta_api/agent_runtime/runtime.py`
- `services/api/xmeta_api/agent_runtime/handlers.py`
- `services/api/xmeta_api/agent_runtime/nodes/**`
- `services/api/xmeta_api/agent_runtime/__init__.py`
- `services/api/tests/test_agent_runtime.py`
- `docs/ARCHITECTURE.md`
- `feature_tasks/16.json`
- `feature_list.json`
- `sprint-contract.md`
- `evaluator-rubric.md`
- `progress.md`
- `session-handoff.md`

Protected boundaries:

- Do not modify frontend code or canvas behavior.
- Do not modify provider implementations, settings, payloads, credentials, supported models, or retry semantics.
- Do not modify public FastAPI route paths or request/response contracts.
- Do not add persistent Memory, one-click workflow execution, automatic graph rewiring, or new business Task Profiles.
- Preserve the external uncommitted `AGENTS.md` change without editing or committing it.

## In Scope

- Move the `AgentRuntime` facade into `runtime.py`.
- Move Text, Image, Audio, and Video execution logic into one dedicated module per node kind under `nodes/`.
- Keep dependency injection explicit so node modules receive profiles, Prompt Compiler, providers/executors, stores, and typed requests.
- Reduce `handlers.py` to a compatibility re-export.
- Add import-boundary and behavior-regression tests.

## Acceptance Criteria

1. `runtime.py` is the unified Agent Runtime facade used by package exports and FastAPI.
2. Text, Image, Audio, and Video execution logic lives in separate `nodes/*.py` files.
3. `handlers.py` contains no node execution implementation and preserves the previous import path.
4. Existing task profile lookup, Memory scoping, Prompt compilation, bounded Runtime retries, typed validation, and response construction remain equivalent.
5. Current provider call counts and request arguments remain unchanged.
6. No frontend or provider implementation files change.
7. Focused/full API tests, Ruff, full web tests, JSON validation, diff check, local API smoke, and final startup verification pass.
8. Independent evaluator score exceeds 140/150.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | Confirmed repository root, read required product/architecture/state files, and preserved the external `AGENTS.md` change. |
| Startup | `./init.ps1` passed before implementation and reran 9 web test files / 58 tests. |
| Planning | Scoped a behavior-preserving node-module split inside Feature 16. |
| Implementation | Added `runtime.py` as the stable facade, split Text/Image/Audio/Video execution into dedicated `nodes/*.py` modules, and reduced `handlers.py` to compatibility exports. |
| Verification | Focused Runtime 17 passed; full API 72 passed; Ruff passed; Web 9 files / 58 tests passed; JSON, diff check, local API smoke, and final startup passed. |
| Evaluation | Independent evaluator accepted round 1 at 148/150. |
