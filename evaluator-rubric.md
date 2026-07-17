# Evaluator Rubric — Image Task 1 Model Generation V1

Updated: 2026-07-17

## Evaluation Scope

- Role: independent evaluator for `image-task-1-model-generation-v1`, including Revision 1 Data-output presentation.
- Reviewed: Task 1 prompt compilation; browser-to-FastAPI contract; `character_image` Agent Runtime route; real provider/model response handling; pure Data image outcome rendering; provider accessibility; automatic ports/edge; and fixture removal from runtime code.
- Protected boundaries: provider credentials remain server-only. No persistence, polling, browser-to-provider call, or graph auto-execution claim is permitted.

## Scorecard

| Criterion | Points | Score | Evidence |
| --- | ---: | ---: | --- |
| Scope and boundary isolation | 20 | 20 | Task 1 delegates to the already-established Image API and Runtime contract. No client credential, provider configuration, persistence, or queue path was added. |
| Server-side model integration | 35 | 35 | Both task fields compile into one prompt; the client calls `/generate-image` with `node_type: character_image` and null reference-image fields. The FastAPI/Runtime focused suite verifies the typed provider/model/media response and clear missing-key behavior. |
| Pure Data outcome presentation | 35 | 35 | Completion upserts a `data` outcome containing image media. Its dedicated `figure` has no card/image border or decorative wrapper; the image uses exactly `block h-auto w-full object-contain`, preserving natural aspect ratio without cropping. |
| Accessibility, ports, and edge semantics | 25 | 25 | The result has an accessible figure label and screen-reader caption containing provider/model plus no-persistence evidence. The reducer creates `source-in` and output ports for the Data outcome, and the source-to-result image edge remains deterministic and deduplicated. |
| Automated verification and restartability | 25 | 25 | Web 10 files / 70 tests, focused API/Runtime 27 tests, Ruff, Web typecheck, production build, `init.ps1`, and `git diff --check` passed. |
| Real provider Browser E2E | 15 | 14 | Audited main-agent Codex in-app Browser evidence: configured FastAPI returned a real `doubao-seedream / doubao-seedream-5-0-260128` remote image; the uncropped borderless Data outcome and one visible source-to-result edge appeared at 5 nodes / 3 edges. One point reserved because my Browser binding was unavailable to replay it. |
| Repository hygiene | 5 | 3 | Runtime source contains no fixture/provided-local reference. A legacy `provided-character-base-task-1.png` remains untracked under `apps/web/public` and is still exempted in `.gitignore`; it is not loaded by the product but should be removed, together with the exception, before commit. |

Current score: 157 / 160

## Verification Evidence

- Applied `C:/Users/AI/.codex/skills/verify/SKILL.md`; reviewed the current sprint contract, Task 1 frontend execution path, FastAPI image route, Image Runtime contract, reducer behavior, focused tests, and pure Data rendering branch.
- `corepack pnpm --filter @xmeta/web test`: passed, 10 files / 70 tests. The injected Task 1 API test confirms `character_image`, both prompt inputs, remote provider/model output, pure `data` outcome, no nested card, `object-contain`, and 3 total edges.
- `D:/X-META-Video/.venv/Scripts/python.exe -m pytest tests/test_image_node.py tests/test_agent_runtime.py`: passed, 27 tests. The only output was the existing Starlette TestClient deprecation warning.
- Focused API Ruff check: passed.
- Web typecheck and production build: passed; `/workspace` is statically generated.
- `./init.ps1`: passed with the complete Web suite (70 tests).
- `git diff --check`: passed; only non-failing line-ending notices were emitted.
- Fixture search: no runtime product-source reference to `provided-character-base-task-1.png`, `provided-local-preview`, or `character-base-task-1-fixture` remains. The only references are the legacy gitignore exception and historical task records.
- Audited main-agent Browser E2E evidence supplied for this evaluation: configured FastAPI returned a real Doubao Seedream image, displayed uncropped and borderless in the Data outcome with provider/model evidence, a visible source edge, and final canvas state of 5 nodes / 3 edges.

## Findings

- No blocking implementation defect found. Task 1 has no local fallback image path: a failed API call follows the explicit error state and does not upsert an output result.
- The result is intentionally a pure Data image outcome rather than another Image/model card; this preserves output reuse while making the generated asset visually primary.
- Before commit, remove the stale untracked local fixture and its `.gitignore` exception. This is non-blocking because no runtime code references it.

## Verdict

**ACCEPTED — 157/160.** The score exceeds the required 140/160 threshold. Task 1 uses the real server-side model path, presents its result as an uncropped borderless Data image outcome with accessible execution metadata, and preserves the one-edge graph contract.
