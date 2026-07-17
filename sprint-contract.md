# Sprint Contract - Feature 16 Compatibility Shim Removal

## Sprint Overview

**Sprint:** feature-16-agent-runtime-final-migration

**Feature:** Feature 16, Agent Runtime Foundation

**Task:** agent-runtime-003

**Status:** passing

**Goal:** Complete the Agent Runtime migration in one step by deleting obsolete compatibility modules and moving every live import to the final `runtime.py`, `prompts.py`, and `nodes/*` layout.

## Write Scope

- `services/api/xmeta_api/agent_runtime/__init__.py`
- `services/api/xmeta_api/agent_runtime/handlers.py` (delete)
- `services/api/xmeta_api/prompt.py` (delete)
- `services/api/xmeta_api/runner.py` (delete)
- `services/api/tests/test_agent_runtime.py`
- `docs/ARCHITECTURE.md`
- Feature 16 planning, evaluation, progress, and handoff artifacts

Protected boundaries:

- Do not modify frontend code or canvas behavior.
- Do not modify provider implementations, Task Profiles, prompt content, Memory, validators, retries, persistence, or public FastAPI routes.
- Preserve the external uncommitted `AGENTS.md` change without editing or committing it.

## Acceptance Criteria

1. `agent_runtime/handlers.py`, `xmeta_api/prompt.py`, and `xmeta_api/runner.py` no longer exist.
2. No production or test import references any deleted compatibility module.
3. `agent_runtime/__init__.py` contains no compatibility execution wrapper.
4. `runtime.py` remains the unified Runtime facade and `nodes/*.py` retain node-specific execution.
5. Script prompt generation and all existing API/provider behavior remain unchanged.
6. Focused/full API tests, Ruff, full Web tests, JSON validation, repository search, diff check, local API smoke, and final startup verification pass.
7. Independent evaluator score exceeds 140/150.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | `./init.ps1` passed with 9 Web files / 58 tests; only the user-owned `AGENTS.md` change was uncommitted. |
| Planning | Scoped deletion of the three compatibility modules and obsolete package wrapper without changing behavior. |
| Implementation | Deleted all three compatibility modules, removed the package execution wrapper and unused Prompt/Retry forwarding exports, and migrated tests/documentation to final module paths. |
| Verification | Exact import search and fresh-process module discovery proved the old paths absent; focused Runtime 17, full API 72, Ruff, Web 58, JSON, diff check, local API smoke, and final startup all passed. |
| Evaluation | Independent evaluator accepted round 1 at 149/150. |
