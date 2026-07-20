# Evaluator Rubric - Image Task 1 Character Views V1

Updated: 2026-07-20 independent evaluation

## Evaluation Scope

- Reviewed the working-tree diff for the Image Task 1 character base/three-view implementation, including `docs/API.md`, shared TypeScript contracts, FastAPI schemas/runtime, canvas graph/outcome UI, and focused tests.
- Did not modify product code, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, or the user-owned `docs/node_design.md`.
- Verification used the repository startup path, focused frontend/backend suites, typecheck, production build, lint, and diff whitespace validation.
- The required in-app-browser click-by-click E2E could not run: the current session reports `Browser is not available: iab`. No other browser was substituted.

## Scorecard

| Criterion | Maximum | Score | Evidence |
| --- | ---: | ---: | --- |
| Scope and protected boundaries | 20 | 20 | The implementation keeps the four node kinds, preserves `image.character.generate`, uses the browser-to-FastAPI-to-provider boundary, and does not change Product, Architecture, or `node_design.md`. |
| Typed API, schema, and runtime behavior | 35 | 35 | `ImageGenerationResponse.images` carries typed `character_base` and `character_three_view` variants. The runtime makes two configured-provider executions for the character task and fails the request if either result fails; the legacy top-level `image` remains the base-image convenience field. |
| Graph outputs, automatic edges, and reruns | 30 | 30 | Variant-aware output IDs create two distinct pure Data outcomes. Graph tests prove one automatic source-result image edge for each outcome and no duplicate edges after rerun. |
| Outcome presentation and truthful UI | 20 | 20 | Each result is an unframed Data outcome with its own accessible label, source/result ports, provider/model execution text, and `object-contain` natural-aspect preview. The UI rejects a partial character response rather than implying completion. |
| Automated and startup verification | 30 | 30 | `init.ps1`, web tests (10 files/70 tests), web typecheck, web production build, focused backend pytest (28 passed), Ruff, and `git diff --check` all passed. The backend tests include the second-call failure path; frontend tests assert both labelled outputs, URLs, uncropped class, and graph edges. |
| In-app-browser click-by-click E2E and live configured-provider evidence | 25 | 0 | Not independently reproduced. The required in-app browser is unavailable in this session, and no live configured-provider generation evidence was supplied. Mocked/injected tests are useful regression evidence but are not a substitute for this acceptance item. |

**Current score: 135 / 160**

## Verification Evidence

- `corepack pnpm --filter @xmeta/web test` - passed: 10 files, 70 tests.
- `corepack pnpm --filter @xmeta/web typecheck` - passed.
- `corepack pnpm --filter @xmeta/web build` - passed.
- `.venv\\Scripts\\python.exe -m pytest tests/test_image_node.py tests/test_agent_runtime.py` - passed: 28 tests (one existing Starlette `TestClient` deprecation warning).
- `.venv\\Scripts\\python.exe -m ruff check xmeta_api tests/test_image_node.py tests/test_agent_runtime.py` - passed.
- `git diff --check` - passed (only non-failing line-ending notices).
- `.\\init.ps1` - passed, including the web test suite.
- Browser attempt: the supplied in-app Browser binding returned `Browser is not available: iab`; therefore no click-by-click claim is made.

## Required Closure

1. Re-run the character task in an available in-app Browser against a configured provider, selecting Task 1, entering appearance and personality text, clicking generate, and capturing evidence of both distinct Data outcomes and their automatic edges.
2. Confirm the actual provider/model shown for both results and that a rerun updates the same two outcomes without duplicate edges.
3. After that real E2E evidence is available, re-score the final 25-point criterion.

## Verdict

**NOT ACCEPTED YET.** The implementation and automated coverage are strong, but the independently required in-app-browser click-by-click/live-provider acceptance is missing. **135/160 does not exceed 140.**
