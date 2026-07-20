# Evaluator Rubric - Four-Node Product and Runtime Documentation

Updated: 2026-07-20 agent-runtime-004 independent evaluation

## Evaluation Scope

- Reviewed `docs/PRODUCT.md` and `docs/ARCHITECTURE.md` against `sprint-contract.md`, `feature_tasks/16.json`, the current Agent Runtime, FastAPI routes, process-local store, schemas, and canvas Node contracts.
- Protected boundaries held: no implementation, target-document, `AGENTS.md`, or user-owned `docs/node_design.md` edits were made by the evaluator.
- This documentation-only change does not claim a live model E2E. Repository startup and existing Web behavior were verified through the standard project command.

## Scorecard

| Criterion | Maximum | Score | Evidence |
| --- | ---: | ---: | --- |
| Four-Node Phase 1 product contract and IPMV Task coverage | 30 | 29 | Product defines exactly Text, Image, Audio, and Video creation Nodes; character, scene, storyboard, clip, input, export, and assets are correctly represented as Tasks, data, workflow, or platform capabilities rather than extra Agent Node kinds. It also distinguishes the ten registered backend profiles from the broader Phase 1 target. |
| Manual Task, Workflow Preset, and Agentic boundaries | 25 | 25 | Manual selection is the default; one-click is a visible deterministic preset; `direct`, `pipeline`, and exceptional `bounded_agent` behavior are explicit; Agents cannot silently change Task, topology, model spend, generation count, or approval state. |
| Router, Runtime, Task Profile, executor, provider, validator flow | 35 | 34 | The ownership table, module map, Runtime facade, four executor boundary, registry lookup, prompt compilation, provider normalization, validation, and target durable worker path are concise and consistent with source. Target-only strategy dispatch is explicitly labeled as not yet implemented. |
| Task definition, Node selection, TaskRun, Artifact, Memory, and persistence separation | 30 | 28 | The four record types and storage boundaries are separated accurately. Current process-local Script state, empty Memory reader, synchronous request-path media calls, `persisted=false`, and missing Task/Artifact services are stated honestly. Minor omission: the current Web canvas still retains legacy internal `data/script/storyboard/composition/export` types and component-local task drafts; the documents define the target four-creation-Node contract but do not call out that migration gap explicitly. |
| Concision, terminology, Phase 2/3 restraint, and encoding | 20 | 20 | Product is 61 lines and Architecture 126 lines, with centralized sections and one terminology set. Phase 2/3 are each one short roadmap item. Searches found no replacement characters or corrupted text; old Node names appear only in an explicit negation of Phase 1 Agent Node taxonomy. |
| Verification and repository health | 10 | 10 | JSON parsing, terminology/encoding searches, `git diff --check`, and final `init.ps1` passed. Standard startup ran 10 Web test files / 70 tests successfully. |

**Current score: 146 / 150**

## Verification Evidence

- Source cross-check: `NodeKind` has exactly four values and `DEFAULT_TASK_PROFILES` contains five Text, three Image, one Audio, and one Video profile.
- Runtime cross-check: `runtime.py` is one facade delegating to `nodes/text.py`, `image.py`, `audio.py`, and `video.py`; providers remain outside Agent Runtime.
- Route/state cross-check: generation routes remain in `main.py`; only the legacy Script path uses `InMemoryScriptStore`; media responses return `persisted=False`; `EmptyProjectMemoryReader` returns no entries.
- Canvas cross-check: current `WorkflowNode` has no general persisted `taskId`; Text/Image choices are presently UI draft state. Architecture correctly labels general `node.taskId` persistence and dispatch as target work.
- Documentation search: no Unicode replacement-character markers, common mojibake tokens, or competing positive multi-Node taxonomy found.
- `feature_list.json` and `feature_tasks/16.json`: parsed successfully.
- `git diff --check`: passed; only line-ending warnings were emitted.
- `.\init.ps1`: passed; 10 Web files / 70 tests passed.

## Findings

- No blocking defect.
- Non-blocking follow-up: when canvas persistence work begins, explicitly track removal or migration of the current legacy internal Node taxonomy and move task choice from component-local draft state into persisted `node.taskId` state. The documents already avoid claiming that this exists today.

## Verdict

**ACCEPTED.** Score 146/150 exceeds the required strict threshold of 140. The documents are concise, technically grounded, and suitable as the shared Phase 1 contract for humans and Agents.
