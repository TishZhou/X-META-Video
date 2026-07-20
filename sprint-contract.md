# Sprint Contract - Four-Node Product and Runtime Documentation

## Scope

- Feature: 16 Agent Runtime Foundation
- Task: `agent-runtime-004`
- Status: `passing`
- Goal: make `PRODUCT.md` and `ARCHITECTURE.md` the concise source of truth for the accepted four-Node Phase 1 design and its Router, Runtime, Task, Provider, Memory, and persistence boundaries.

## Write Scope

- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`
- Feature 16 planning, evaluation, progress, and handoff artifacts

Protected boundaries:

- No application, frontend, API, provider, Runtime, schema, test, or dependency changes.
- Preserve the user-owned untracked `docs/node_design.md` and any unrelated worktree changes.

## Acceptance Criteria

1. Product documentation defines exactly four creation Node kinds: Text, Image, Audio, and Video.
2. Phase 1 Tasks cover the accepted IPMV chain without inventing Input, Clip, Export, Asset, or 3D Agent Node kinds.
3. Manual canvas Task selection is the default; one-click generation is a visible deterministic Workflow Preset; no Agent silently changes Tasks, graph topology, models, or spend.
4. Architecture defines Router -> Runtime -> Task Profile -> Node Executor -> Provider -> Validator -> Artifact flow and separates Task definition, node configuration, Task Run, and output storage.
5. Current implementation gaps are labeled honestly, especially `main.py` routing, process-local Memory/task state, synchronous media responses, and absent durable Task/Asset services.
6. Phase 2 and Phase 3 are each summarized briefly without diluting Phase 1.
7. The two documents are concise, scan-friendly, consistently named, and free of stale or corrupted Node taxonomy.
8. Independent evaluator score exceeds 140/150.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | `./init.ps1` passed with 10 Web files / 70 tests; `docs/node_design.md` is an existing user-owned untracked file and remains protected. |
| Source audit | Confirmed four `NodeKind` values, ten current Task Profiles, one Runtime facade/four executors, FastAPI routes in `main.py`, and process-local Script task storage. |
| Documentation | Replaced stale multi-Node product taxonomy with the four-Node/Task contract and recorded Router, Runtime, Task, Provider, Memory, TaskRun, and Artifact boundaries. |
| Verification | Source cross-check, legacy taxonomy and encoding searches, JSON, diff check, and final startup passed; independent evaluator accepted at 146/150. |
