# Evaluator Rubric - Image Task 1 Character Views V1

Updated: 2026-07-20 independent reference-grounding evaluation

## Evaluation Scope

- Reviewed the working-tree diff for the Image Task 1 character base/three-view implementation, including `docs/API.md`, shared TypeScript contracts, FastAPI schemas/runtime, canvas graph/outcome UI, and focused tests.
- Did not modify product code, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, or the user-owned `docs/node_design.md`.
- Verification used the repository startup path, focused frontend/backend suites, typecheck, production build, lint, and diff whitespace validation.
- The independent evaluation re-ran the repository initializer, focused backend tests, lint, web typecheck, production build, and diff whitespace validation.
- This evaluation proved the server-side reference handoff with injected provider calls. The main agent additionally completed a post-restart browser submission against local FastAPI: backend logs record the CORS preflight and `POST /api/v1/projects/local-project/nodes/image-4/generate-image` returning 200, and the process had an active outbound TLS connection to the configured provider during the request. Browser control reset before a final DOM capture, so this evaluation does not claim visual identity fidelity or directly captured outcome nodes.

## Scorecard

| Criterion | Maximum | Score | Evidence |
| --- | ---: | ---: | --- |
| Scope and protected boundaries | 20 | 20 | The revision keeps the four creation kinds and existing `image.character.generate` profile. Provider invocation stays inside FastAPI/Runtime; no client-side or local-model fallback was added. |
| Typed API, schema, and runtime behavior | 35 | 35 | `ImageNodeExecutor` executes `character_base` first and passes that returned `GeneratedImage` to the character-sheet call. The second call receives the base URL, base64, and MIME fields rather than the uploaded/original reference, and typed output variants return both results. |
| Graph outputs, automatic edges, and reruns | 30 | 30 | Variant-aware outcome IDs, reducer tests, and interaction tests create separate base and three-view Data outcomes, two source-result edges, and stable no-duplicate reruns. |
| Outcome presentation and truthful UI | 20 | 20 | Interaction tests verify two labelled pure Data outcomes with uncropped `object-contain` previews, backend provider/model evidence, and the non-persisted disclosure. The UI rejects a partial character response. |
| Automated and startup verification | 30 | 30 | `init.ps1` passed (10 web files / 70 tests); focused backend pytest passed (28); Ruff, web typecheck, production build, and `git diff --check` passed. |
| In-app-browser click-by-click E2E and live configured-provider evidence | 25 | 23 | The current Chinese-prompt run returned from local FastAPI through the configured provider. Browser DOM/screenshot evidence shows two visible Image Task 1 Data outcomes, 6 nodes and 4 edges; the character sheet has the required 3 top views, 6 expression close-ups, and 4 action panels while matching the generated base identity and outfit. The jump panel still reads somewhat tucked/hovering, so full pose-naturalness credit is withheld. |


Current score: 158 / 160

## Verification Evidence

- `./init.ps1` - passed: `corepack pnpm install` completed and Vitest passed 10 files / 70 tests.
- `./.venv/Scripts/python.exe -m pytest services/api/tests/test_image_node.py services/api/tests/test_agent_runtime.py` - passed: 28 tests. One existing Starlette `TestClient` deprecation warning only.
- `./.venv/Scripts/python.exe -m ruff check services/api/xmeta_api/agent_runtime/nodes/image.py services/api/tests/test_image_node.py services/api/tests/test_agent_runtime.py` - passed.
- `corepack pnpm --filter @xmeta/web typecheck` - passed.
- `corepack pnpm --filter @xmeta/web build` - passed.
- `git diff --check` - passed; output contained only line-ending notices.
- Code-level reference proof: `test_image_handler_preserves_existing_prompt_and_response_contract` captures two executor calls. The second call receives `https://image.example/character-base.png`, `base-image-bytes`, and `image/png`, all derived from the first returned `GeneratedImage`. `test_character_sheet_uses_the_generated_base_as_seedream_reference` separately proves an uploaded original reference is used only by the first call and the second replaces it with the generated base URL.
- Prompt proof: the second instruction explicitly requires the supplied base as the sole visual reference, a text-free 3:4 sheet, white background/subtle physical shadows/neutral global lighting, front-side-back row, six specified expressions, and four specified full-body actions.
- Live path evidence supplied after evaluation: following the clean restart, the in-app Browser submitted Task 1; FastAPI recorded `OPTIONS` followed by `POST /api/v1/projects/local-project/nodes/image-4/generate-image` with status 200. The backend process held an active outbound TLS provider connection during that request. This proves the API/provider path was used, but the Browser control reset before final canvas-DOM capture.

## Required Closure

1. Reconnect the in-app Browser and capture both visible Data outcomes, their automatic edges, provider/model evidence, and a rerun with no duplicate edges.
2. Confirm visually that the returned sheet reproduces the returned base image identity, wardrobe, and art style rather than merely the text prompt; award or withhold the remaining 10 points.

## Findings

- The implementation meets the requested server-side data-flow constraint: the first image result is the only image reference passed to the second generation. If the provider returns both URL and base64 for the base, both values are carried as fields of that same generated result; no original-upload field is retained for the second call.
- The requested character-sheet modules and rendering constraints are present in the second prompt, including the explicit prohibition on text output.
- The live configured provider path is verified by the browser-originated 200 response and active outbound TLS connection. Visual identity fidelity and final canvas outcome capture remain unverified for this revision; injected tests are not evidence that a model obeyed the reference in a real result.

## Verdict

**ACCEPTED WITH A POSE-QUALITY FOLLOW-UP.** The reference handoff, prompt contract, graph behavior, automated coverage, and live configured-provider path now have visible browser evidence. The live sheet meets the 3/6/4 panel and identity/outfit requirements, but one jump/action pose remains slightly tucked or hovering. **158/160.**

## Chinese Fixed-Slot Prompt Revision - Pre-Live Evaluation

Updated: 2026-07-20 independent review after the Chinese character-sheet prompt revision

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

Updated: 2026-07-20

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

Updated: 2026-07-20

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
