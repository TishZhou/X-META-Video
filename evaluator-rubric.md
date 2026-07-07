# Evaluator Rubric - Feature 3 Task 10 Script Direct Text Outcome

Updated: 2026-07-07

## Evaluation Scope

- Role: Evaluator subagent for Feature 3 `script-node-010`.
- Scope reviewed: shared Script dialogue contract, FastAPI chat mode and prompt path, provider configuration, workflow graph output-node foundation, Script canvas UI, focused tests, API docs and feature artifacts.
- Acceptance target: Script node Generate produces direct natural text through AI chat mode, does not request structured JSON text, still renders the result as an editable output node, creates reusable output-node plumbing for future node types, and removes product fallback provider paths/options.

## Scorecard

| Criterion | Points | Current | Evidence |
| --- | ---: | ---: | --- |
| Explicit Requirements | 30 | 30 | `direct_output` mode added to shared/FastAPI contracts; Generate uses `runScriptDirectOutput`; Browser QA rendered one editable Script outcome node with natural text, no JSON fence/shape, and backend evidence. |
| Implicit Requirements | 20 | 18 | Reusable `WorkflowNodeRole`, `WorkflowNodeOutput`, deterministic `upsertOutputNode`, and `createWorkflowOutputNodeId` support later node outputs. Local edit persistence remains explicitly deferred and should be revisited when durable output storage lands. |
| Regression Checks | 25 | 25 | Backend focused tests, API lint, frontend focused tests, typecheck, production build, and `init.ps1` all passed. |
| Edge Cases | 20 | 18 | Invalid dialogue mode is rejected with 422, direct-output prompt forbids JSON/fixed sections, UI omits product fallback choices. Provider-failure rendering for the new direct Generate path was not browser-exercised. |
| Time/Space Complexity | 15 | 15 | Changes are state-local and deterministic; output-node upsert is linear over current graph nodes like existing reducer operations. |
| Program Format | 20 | 20 | Code is scoped and aligns with existing React/FastAPI patterns. Main-agent post-evaluation cleanup cleared the example text-model key before final verification. |
| Visual Design (if applicable) | 20 | 20 | Browser QA confirms the outcome card appears as a canvas node, selected state is clear, provider evidence is present, textarea is editable, and no console warnings/errors were logged. |

Current score: 146 / 150

## Acceptance Evidence

- Direct-output backend mode is implemented in `packages/shared-contracts/src/index.ts`, `services/api/xmeta_api/schemas.py`, `services/api/xmeta_api/main.py`, and `services/api/xmeta_api/prompt.py`.
- Product fallback provider path is removed from `services/api/xmeta_api/providers.py`; supported text providers are `openai` and `openai-compatible`.
- Frontend Generate now calls chat with `mode: "direct_output"` through `apps/web/src/lib/script-node/api.ts` and renders the returned assistant content as local editable text in `ScriptOutcomeNodeEditor`.
- Reusable graph foundation exists in `apps/web/src/lib/workflow-canvas/types.ts` and `apps/web/src/lib/workflow-canvas/graph.ts`: nodes now have `role`, output metadata is generic, and `upsertOutputNode` creates/updates deterministic outcome nodes.
- UI fallback-provider cleanup is verified in product-facing source and docs. Scoped search over `services`, `apps`, `packages`, `docs/API.md`, `.env.example`, `sprint-contract.md`, `feature_list.json`, and `feature_tasks/3.json` found no product fallback provider path/options.

## Verification Evidence

- `.\.venv\Scripts\python.exe -m ruff check services\api` -> passed.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests\test_script_node.py` -> 25 passed, 1 Starlette deprecation warning.
- `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx graph.test.ts` -> 2 files passed, 22 tests passed.
- `corepack pnpm --filter @xmeta/web typecheck` -> passed.
- `corepack pnpm --filter @xmeta/web build` -> passed; `/workspace` built.
- `.\init.ps1` -> passed; full web suite 9 files / 41 tests.
- Post-cleanup final `.\init.ps1` -> passed; full web suite 9 files / 41 tests.
- Post-cleanup scoped provider-name search over product code/docs/task artifacts -> no legacy fallback-provider matches.
- `.env.example` `TEXT_MODEL_API_KEY` -> empty; no secret value was printed.
- Browser QA on `http://localhost:3000/workspace` with Browser plugin:
  - Page title: `Workspace Canvas | X-META Video`.
  - Initial page had no visible fallback-provider model labels or framework overlay; console warn/error log count was 0.
  - Clicking `Generate Script node` created `4 nodes / 2 edges`, exactly one `[data-script-outcome-node="true"]`, exactly one editable `[data-script-outcome-textarea="true"]`, and provider evidence `Backend: openai / gpt-5.4-mini`.
  - The generated textarea content was natural Chinese prose, did not start with `{` or `[`, and contained no markdown code fence.
  - Filling the textarea with evaluator text updated its value, proving the outcome is editable.
  - Final console warn/error log count remained 0.
  - Browser `domSnapshot()` was blocked by the known `incrementalAriaSnapshot` runtime issue, so QA used Browser read-only DOM evaluation plus screenshots instead.

## Findings

- No task10 functional blocker found. The direct-text outcome path works end to end in the rendered app and uses backend-confirmed provider/model metadata.
- Post-evaluation cleanup completed: `.env.example` now leaves `TEXT_MODEL_API_KEY` empty and no secret value was printed during cleanup.
- Follow-up risk: direct-output local edits are not durable yet. The UI labels this as deferred, which is acceptable for task10, but future output persistence needs a shared storage contract.
- Follow-up risk: provider-unavailable/error rendering for direct Generate should get one Browser regression once config can be safely forced unavailable without touching production code.

## Verdict

Accepted for Feature 3 task10 at 146 / 150 after main-agent cleanup. Functional acceptance is above threshold.
