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
| In-app-browser click-by-click E2E and live configured-provider evidence | 25 | 15 | A post-restart in-app-browser Task 1 submission reached local FastAPI and returned 200 while the backend held an outbound TLS connection to the configured provider. The browser control reset before final outcome capture, so the evidence does not verify visible nodes, rerun stability, or visual identity fidelity. |


Current score: 150 / 160

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

**ACCEPTED WITH FOLLOW-UP EVIDENCE REQUIRED.** The reference handoff, prompt contract, graph behavior, automated coverage, and live configured-provider request path meet the required score threshold. A reconnect-and-capture pass is still required to prove visible outcome nodes and visual identity fidelity. **150/160.**
