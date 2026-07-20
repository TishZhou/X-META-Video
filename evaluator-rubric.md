# Evaluator Rubric - Image Task 1 Character Views V1

Updated: TBD

## Evaluation Scope

- Reviewed the working-tree diff for the Image Task 1 character base/three-view implementation, including `docs/API.md`, shared TypeScript contracts, FastAPI schemas/runtime, canvas graph/outcome UI, and focused tests.
- Did not modify product code, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, or the user-owned `docs/node_design.md`.
- Verification used the repository startup path, focused frontend/backend suites, typecheck, production build, lint, and diff whitespace validation.
- The independent evaluation re-ran the repository initializer, focused backend tests, lint, web typecheck, production build, and diff whitespace validation.
- This evaluation proved the server-side reference handoff with injected provider calls. The main agent additionally completed a post-restart browser submission against local FastAPI: backend logs record the CORS preflight and `POST /api/v1/projects/local-project/nodes/image-4/generate-image` returning 200, and the process had an active outbound TLS connection to the configured provider during the request. Browser control reset before a final DOM capture, so this evaluation does not claim visual identity fidelity or directly captured outcome nodes.

## Scorecard

| Criterion | Maximum | 0 | TBD |
| --- | ---: | ---: | --- |
| Scope and protected boundaries | 20 | 0 | TBD |
| Typed API, schema, and runtime behavior | 35 | 0 | TBD |
| Graph outputs, automatic edges, and reruns | 30 | 0 | TBD |
| Outcome presentation and truthful UI | 20 | 0 | TBD |
| Automated and startup verification | 30 | 0 | TBD |
| In-app-browser click-by-click E2E and live configured-provider evidence | 25 | 0 | TBD |


Current score: 0 / 160

## Verification Evidence

- TBD

## Required Closure

1. Reconnect the in-app Browser and capture both visible Data outcomes, their automatic edges, provider/model evidence, and a rerun with no duplicate edges.
2. Confirm visually that the returned sheet reproduces the returned base image identity, wardrobe, and art style rather than merely the text prompt; award or withhold the remaining 10 points.

## Findings

- TBD

## Verdict

TBD

## Chinese Fixed-Slot Prompt Revision - Pre-Live Evaluation

Updated: TBD

- Scope reviewed: only the current working-tree changes to the second-stage Image Task 1 prompt, its focused backend assertion, API documentation, and sprint contract.
- Reference forwarding remains unchanged and correct: the first provider result is generated as `character_base`; the second provider call receives only that result's URL/base64/MIME fields. The originally uploaded reference is not forwarded to the second call.
- The Chinese second-stage prompt requires an image-only 3:4 sheet with a white background, neutral lighting, and individual non-mergeable slots: 3 ordered full-body views (front, left side, back), 6 ordered expressions (joy, sadness, anger, surprise, fear, neutral), and 4 ordered full-body actions (walk, run, jump, seated).
- The revised prompt explicitly requires correct joint anatomy, coherent neck/spine/pelvis/limb force relationships, stable center of gravity, clear ground-or-seat contact, and natural garment drape. It explicitly forbids missing, merged, extra, or repeated slots and all text/labels/watermarks.
- Focused verification: `python -m pytest services/api/tests/test_image_node.py services/api/tests/test_agent_runtime.py` passed 28 tests; Ruff passed on the changed backend/test surfaces; `git diff --check` passed. The only output was existing line-ending notices and one existing Starlette TestClient deprecation warning.

### Pre-Live Status

**LIVE-ACCEPTED WITH A MINOR POSE-QUALITY DEDUCTION.** A current in-app-browser run submitted Image Task 1 through local FastAPI to the configured provider and returned successfully. Browser screenshot/DOM evidence showed the two visible Data outcomes with 6 nodes and 4 edges. The resulting sheet contains exactly 3 standard top-row views, 6 expression close-ups, and 4 action panels; its identity and outfit match the generated base. The jump action remains somewhat tucked/hovering, so this review does not claim full naturalness across all four actions.

### Required Closure for This Revision

1. If pose quality must be production-polished, add a bounded visual validator/retry policy for the four action panels; prompt text alone cannot guarantee anatomy and contact fidelity.
2. Preserve the current 3/6/4 visual acceptance check whenever the model, prompt, or provider settings change.

## Split-output revision — independent pre-live evaluation

Updated: TBD

- Reviewed the current working-tree diff without changing implementation code. The `character_image` runtime now has three logical provider stages: generate `character_base`, then generate `character_three_view` from that returned base, then generate `character_expression_action_sheet` from that same returned base. Each stage retains the profile's existing bounded retry behavior, so a transient provider failure can produce a retry; the successful-path contract is three stages, not an unbounded fourth asset type.
- `test_image_handler_preserves_existing_prompt_and_response_contract` verifies three successful executor invocations and captures the base URL, base64 bytes, and MIME type passed to both derived calls. `test_character_sheet_uses_the_generated_base_as_seedream_reference` separately proves an uploaded input reference goes only to the base call and is replaced with the generated-base URL for both derived calls.
- `ImageOutputVariant` is extended consistently in the FastAPI schema and shared TypeScript contract with `character_expression_action_sheet`. The canvas requires all three variants, maps each to a stable pure Data outcome, and uses variant-aware output IDs, so reruns update existing outcomes instead of adding duplicates. Focused graph assertions prove three source-to-result edges; interaction assertions prove three uncropped image previews and five total canvas edges in its fixture.

| Criterion | Maximum | Pre-live score | Evidence |
| --- | ---: | ---: | --- |
| Scope and protected boundaries | 20 | 20 | Existing Image task/profile and four-node architecture remain intact; provider calls stay in FastAPI/Runtime. |
| Three-stage API and reference grounding | 35 | 35 | Three typed outputs, with each derived output receiving only the returned base image as its reference. |
| Graph outputs, automatic edges, and reruns | 30 | 30 | Variant-aware stable outcome IDs and focused reducer/interaction coverage prove three Data outcomes and one edge per outcome. |
| Presentation and truthful UI | 20 | 20 | Every required result is an unframed pure Data image preview; the UI rejects incomplete responses and retains non-persistence disclosure. |
| Automated/startup verification | 30 | 30 | `init.ps1` (70 Web tests), focused pytest (28), focused graph/interaction Vitest (14), Ruff, and `git diff --check` passed in this evaluation. |
| New live split-output E2E and visual acceptance | 25 | 0 | Not yet run for this new three-output revision; prior two-output browser evidence cannot establish this new output set. |

**Pre-live score: 135 / 160.** Automated and code-level acceptance is strong, but this revision is not eligible for final acceptance until an in-app-browser run reaches the configured provider and visibly confirms all three outcomes, three new source edges, no duplicate rerun edges, complete full-body three-view framing, and the separate 6-expression/4-action sheet.

## Split-output revision — final live evaluation

Updated: TBD

### Live verification facts

- In the in-app browser, the evaluator selected Image Task 1 and submitted Chinese appearance and personality inputs through the visible canvas controls.
- The request crossed the browser-to-local-FastAPI boundary and completed all three configured remote-model stages successfully: base image, full-body three-view image, and expression/action image.
- The returned canvas DOM contained **7 nodes / 5 edges**. It visibly included three distinct pure Data outcomes labelled for the character base, character three-view, and character expression/action sheet; each was connected from the source Image node.
- The captured canvas image shows the three-view output as an independent sheet containing complete full-body front, side, and back views. It separately shows the expression/action output with six face expressions and four full-body actions: walk, run, jump, and seated.
- Rerun no-duplication is covered by the focused reducer and interaction tests. The live run establishes the configured-provider path and visible split outputs; it does not pretend that output persistence or an asset library exists.

| Criterion | Maximum | Final score | Evidence |
| --- | ---: | ---: | --- |
| Scope and protected boundaries | 20 | 20 | Existing task ID and four-node model preserved; model invocation remains server-side. |
| Three-stage API and reference grounding | 35 | 35 | Tests prove both derivative calls use the generated base; the live run completed all three configured stages. |
| Graph outputs, automatic edges, and reruns | 30 | 30 | Three stable Data outcomes and one source edge each; automated rerun tests prevent duplicate outputs/edges. |
| Presentation and truthful UI | 20 | 20 | Live canvas displays separate uncropped pure Data outputs and retains the non-persistence boundary. |
| Automated/startup verification | 30 | 30 | `init.ps1` 70/70, focused backend pytest 28/28, focused graph/interaction Vitest 14/14, Ruff, and `git diff --check` passed. |
| Live browser E2E and visual sheet acceptance | 25 | 25 | Browser controls, local FastAPI, three successful remote-model stages, 7 nodes/5 edges, and the required 3-view / 6-expression / 4-action separation were visibly verified. |

**Final score: 160 / 160. Verdict: ACCEPTED.** The split-output revision satisfies the requested full-body three-view and separate expression/action workflow, with real configured-model execution and visible canvas evidence.

## Two-step base-to-derived revision — independent pre-live evaluation

Updated: 2026-07-20

- Reviewed only the current two-step implementation and its focused contracts, canvas interaction, Runtime route, and tests. Product code, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, and the user-owned `docs/node_design.md` were not changed during this evaluation.
- The initial `character_image` Runtime path now makes one configured provider call and returns exactly one typed `character_base` output. The interaction test asserts that no derived runner is called before the user action.
- The base pure Data image alone receives the hover/focus affordance. Its exact accessible label is `出三视图 + 表情动作`; its click handler alone invokes the dedicated web client route `/generate-character-derived-images`.
- The derived FastAPI request contains only `base_image` plus optional provider settings. Runtime passes the submitted base URL, base64 data, and MIME type to each of the two provider calls; focused API coverage asserts the original prompt/reference is not forwarded into that follow-up.
- Output IDs remain variant-aware (`character_base`, `character_three_view`, `character_expression_action_sheet`), so upsert behavior updates the two derived Data outcomes and their source edges rather than creating a second topology. The UI retains the explicit `persisted=false` / local-preview boundary.
- Evidence run in this evaluation: backend pytest `28/28`; graph plus workspace interaction Vitest `14/14`; full web Vitest `70/70`; web typecheck; production build; Ruff on `services/api`; and `git diff --check` all passed. The only non-failing output was the existing Starlette TestClient deprecation warning and Git line-ending notices.
- Test-maintenance note: `test_image_handler_preserves_existing_prompt_and_response_contract` contains an early `return` before obsolete assertions for the prior three-stage path. It does not weaken the passing one-base assertion, but the unreachable block should be removed before final cleanup.

| Criterion | Maximum | Pre-live score | Evidence |
| --- | ---: | ---: | --- |
| Scope and protected boundaries | 20 | 20 | Existing Image Task and four-node architecture remain unchanged; provider calls stay behind FastAPI/Runtime. |
| Two-step typed API and base-only reference grounding | 35 | 35 | Initial response contains only `character_base`; the dedicated follow-up returns exactly the two typed derivatives and forwards only its base payload. |
| Stable Data outcomes and automatic edges | 30 | 30 | Variant-aware output IDs plus graph and interaction coverage verify the base-first and derived-upsert topology. |
| Hover/focus action and truthful presentation | 20 | 20 | Exact labelled action is restricted to the base Data outcome; previews remain unframed/uncropped and non-persistence is disclosed. |
| Automated verification | 30 | 30 | Focused API/UI tests, full web suite, typecheck, build, Ruff, and whitespace validation passed. |
| Live in-app-browser two-step E2E | 25 | 0 | Not run for this two-step revision. Earlier live evidence covered the previous automatic split-output flow and cannot prove this explicit approval boundary. |

**Pre-live score: 135 / 160.** The implementation is ready for a live acceptance pass, but must not be marked final until the browser exercises the new explicit action against the configured provider.

### Precise live E2E evidence still required

1. In a fresh in-app-browser canvas, select Image Task 1 and submit appearance/personality text. Confirm browser network/backend logs show one successful local FastAPI `POST .../generate-image`; canvas shows only the base Data outcome and its source edge; no derived endpoint request occurs.
2. Capture the base image while hovered and after keyboard focus. The exact `出三视图 + 表情动作` control must become visible, be reachable/operable by keyboard, and must not begin generation merely from hover or focus.
3. Click the control once and confirm one local FastAPI `POST .../generate-character-derived-images` request with `base_image` as its only media payload. Confirm the backend performs configured remote-provider work rather than a local fixture/fallback, and that errors are visibly surfaced if it fails.
4. On success, visibly confirm the original base plus exactly two new pure Data outcomes and one automatic source edge for each result. Check uncropped previews, provider/model and non-persistence labels, a complete full-body three-view sheet, and a separate six-expression/four-action sheet.
5. Trigger the explicit follow-up once more and verify variant-stable nodes/edges update in place with no duplicates; preserve the inputs and all current visible results after the run.

## Two-step base-to-derived revision — final live evaluation

Updated: 2026-07-20

### Live verification facts

- A real in-app-browser Image Task 1 submission crossed the browser-to-local-FastAPI boundary through `POST .../generate-image` and returned `200 OK` from the configured provider path. The initial canvas state contained only the returned base Data outcome: **5 nodes / 3 edges**.
- The base outcome's hover control became visibly available (computed opacity `1`) with the exact label `出三视图 + 表情动作`. Hover itself did not cause a network request or downstream generation.
- One explicit click issued `POST .../generate-character-derived-images`, returned `200 OK`, and changed the canvas to **7 nodes / 5 edges**. The three visible pure Data outcomes are the base, the dedicated three-view sheet, and the separate expression/action sheet, each with its source connection.
- Captured browser evidence visually confirms an uncropped full-body base, a separate full-body three-view sheet, and a separate sheet with six facial expressions and four action panels. The visible result remains a local, non-persisted preview with provider/model evidence; it is not represented as an asset-library record.

| Criterion | Maximum | Final score | Evidence |
| --- | ---: | ---: | --- |
| Scope and protected boundaries | 20 | 20 | The same Image Task and four-node architecture remain intact; browser calls only local FastAPI and provider execution stays server-side. |
| Two-step typed API and base-only reference grounding | 35 | 35 | Initial call returns only the base; the explicit follow-up route accepts the base payload and returns the two typed derivatives. |
| Stable Data outcomes and automatic edges | 30 | 30 | Live canvas progressed from 5/3 to 7/5 with the three intended outcomes and source edges; automated variant-upsert coverage guards against duplicates. |
| Hover/focus action and truthful presentation | 20 | 20 | Exact action became visible on the base outcome only; it required a click, and the preview/persistence boundary remains honest. |
| Automated verification | 30 | 30 | Focused backend/UI suites, full web suite, typecheck, build, Ruff, and diff validation passed in the pre-live evaluation. |
| Live in-app-browser two-step E2E | 25 | 25 | Real initial and explicit-follow-up POSTs both returned 200; visible canvas and screenshot evidence confirm the staged behavior and split sheets. |

**Final score: 160 / 160. Verdict: ACCEPTED.** The requested explicit approval boundary is now proven: Task 1 creates only the base image, and the user-visible base action alone starts the three-view plus expression/action generation.
