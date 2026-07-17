# Evaluator Rubric - Text Node Task Choice V1

Updated: 2026-07-17

## Evaluation Scope

- Role: independent evaluator for Feature 3 `script-node-011`, revision rounds 3 and 4.
- Scope reviewed: two-task Text Select; node-local drafts; Task 1 world-view output; free-form Task 2 character output; canonical editable content transfer; connected/same-node/manual source priority; Agent Runtime profiles, prompts, validators, and typed FastAPI contract; editable outcome cards; loading/error/provider states; automated and Codex in-app Browser evidence.
- User clarification applied: input presentation is not scored, and Task 2 does not need JSON, a fixed schema, exact labels, or delimiter tags. Acceptance is based on the generated output containing the requested appearance, personality/action, and voice/timbre elements.
- Protected boundaries: AI modify/dialogue and image/audio/video provider behavior remain outside this revision. The user-owned uncommitted `AGENTS.md` change was not modified or scored as implementation.
- Mandatory browser surface: Codex in-app Browser only. The evaluator did not use Computer Use, Chrome control, standalone Playwright, or another substitute, and did not disturb the finalized `/workspace` deliverable tab.

## Scorecard

| Criterion | Points | Current | Evidence |
| --- | ---: | ---: | --- |
| Scope fit and boundary isolation | 12 | 12 | Dedicated `/generate-text` path and Text profiles are isolated from AI modify/dialogue and media providers; persistence remains honestly deferred. |
| Task Select and node-local state | 18 | 18 | Accessible shadcn/Radix Select exposes exactly `ip_worldview` and `character_profiles`; reducer and real jsdom interaction prove per-node drafts and keyboard selection. |
| Task 1 output quality and contract | 16 | 16 | Prompt/validator require narrative positioning, world view/rules, and character positioning; live provider Browser run returned editable Chinese output with Mira, Luna, Iris, and Zora. |
| Task 2 output quality and contract | 16 | 15 | Natural text prompt covers every named character and all three semantic families; live retry produced 1,651 characters with all four names and no rigid tags. One point retained because validation checks element families globally rather than attributing each family to every character. |
| Canonical content and upstream transfer | 18 | 18 | One editable `content` value feeds UI and downstream requests; compact metadata records task/data/source; priority and deleted-outcome fallback tests pass, and Browser proved edited same-node Task 1 handoff. |
| Runtime profiles, prompts, and validation | 16 | 15 | Separate task/profile/template/validator IDs, centralized common rules, natural bilingual synonym coverage, and 422/502 paths are tested. Marker matching remains intentionally lightweight rather than semantic per-character validation. |
| Typed API and provider truthfulness | 14 | 14 | Typed OpenAPI request/response refs, provider/model metadata, prompt-template/source metadata, and `persisted: false` are verified; Browser showed `openai / gpt-5.4-mini` on both outcomes. |
| UI states, editability, accessibility, and layout | 14 | 14 | Loading, live failure, retry success, editable results, honest source/persistence copy, provider labels, distinct outcome positions, and 1280x720/1600x900 visual fit were exercised. |
| Automated verification and test depth | 14 | 14 | Focused backend 8/8, full backend 80/80, full Web 63/63, interaction handoff, stale-cache fallback, layout, Ruff, typecheck, and build all pass. |
| Click-by-click Codex Browser E2E | 16 | 14 | Real in-app Browser drove Task 1, editing, task selection, same-node handoff, live error, Revision 4 retry, provider evidence, screenshots, both viewports, and console/network inspection. The live run did not additionally drag a connected edge, and keyboard Select is proven by jsdom rather than this Browser run. |
| Documentation and repository hygiene | 6 | 6 | `docs/API.md` matches the free-form contract; JSON and `git diff --check` pass; only expected feature/artifact paths plus the protected `AGENTS.md` edit are present; standard init passes. |

Current score: 156 / 160

## Verification Evidence

- Read and applied `C:/Users/AI/.codex/skills/verify/SKILL.md`, then reviewed `AGENTS.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/API.md`, `sprint-contract.md`, Feature 3 state, implementation, tests, and the complete relevant diff.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests\test_text_generation.py -q`: 8 passed; only the existing Starlette/httpx deprecation warning.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests -q`: 80 passed; only the same deprecation warning.
- `.\.venv\Scripts\python.exe -m ruff check services\api`: passed.
- `corepack pnpm --filter @xmeta/web test`: 10 files / 63 tests passed, including the real `WorkflowCanvasWorkspace` jsdom interaction.
- `corepack pnpm --filter @xmeta/web typecheck`: passed.
- `corepack pnpm --filter @xmeta/web build`: passed; `/workspace` was generated in the production build.
- OpenAPI inspection resolved the route request and 200 response to `TextGenerationRequest` and `TextGenerationResponse`.
- JSON parsing passed for `feature_list.json` and `feature_tasks/3.json`.
- `git diff --check`: passed; only expected LF-to-CRLF informational warnings were emitted.
- Prompt/docs truth search confirmed no runtime `[Character: ...]` delimiter contract; the only match is a negative test assertion. Prompt and API docs explicitly reject fixed labels, delimiters, JSON, and schemas.
- Final `.\init.ps1`: passed and reran 10 Web files / 63 tests, confirming the repository remains restartable through the standard workflow.

## Interaction and Regression Evidence

- The real `WorkflowCanvasWorkspace` jsdom test clears/types the brief, clicks Generate, verifies the exact Task 1 request, edits the rendered Task 1 outcome, reselects the source node, opens the shadcn combobox, chooses Task 2 with keyboard arrows/Enter, and proves the second request uses the edited canonical content with `same_node_task_1` metadata.
- The same interaction creates separate `script` and `character` outcome cards, edits both, confirms both backend labels, and asserts distinct horizontal positions.
- Resolver/reducer coverage proves connected Task 1 has priority over same-node Task 1 and manual content. It also deletes a same-node graph outcome while leaving stale text in the local outcome map and proves Task 2 falls back honestly to manual content.
- Position coverage proves default Task 1/Task 2 slots do not overlap each other or initial nodes, fit the computed 1280x720 canvas viewport, and use a non-overlapping vertical fallback near the right canvas edge.
- Backend negatives cover empty content, incomplete source provenance, missing required Task 1 elements, and missing Task 2 voice/timbre. Revision 4 adds positive coverage for natural Chinese synonyms without fixed labels.

## Codex Browser E2E Evidence

The main-agent E2E used the repaired in-app Browser client from `C:/Users/AI/.codex/plugins/cache/openai-bundled/browser/26.715.21425/scripts/browser-client.mjs`; the evaluator audited the recorded interaction and did not reopen or alter the finalized deliverable tab.

1. Browser runtime setup succeeded, claimed the user-opened `http://localhost:3000/workspace` tab, and verified the Text task Select contains exactly two options.
2. Task 1 accepted the four-character ice-dream brief, showed the live loading state, and returned a real `openai / gpt-5.4-mini` editable outcome containing narrative/world/character elements and Mira, Luna, Iris, and Zora.
3. The Task 1 outcome was edited in place. Selecting `Character profiles & voices` visibly resolved `Input source: Same-node Task 1 outcome`, proving the edited canonical content was reused.
4. The first Task 2 live request produced a visible 502 error, `Character profiles task is missing required elements: appearance.` This exposed the natural-Chinese-synonym false negative rather than hiding it.
5. After Revision 4 broadened bilingual synonym families and the API restarted, the same UI retry returned HTTP 200 and a 1,651-character free-form result containing all four names plus appearance, personality/action, and voice/timbre concepts. `[Character: ...]` and `[/Character]` were absent.
6. Both outcome text areas remained editable; both cards displayed backend provider/model evidence and occupied non-overlapping positions.
7. 1280x720 and 1600x900 screenshots were inspected for the selected node, inline editor, outcome cards, controls, ports, and clipping/overlap. No blocking visual defect was found.
8. Final Browser console warn/error inspection returned an empty list, and the successful retry request plus the earlier failed request were both inspected.

## Findings

- No blocking product, contract, regression, provider-truth, or repository-restart defect was found.
- Non-blocking: Task 2 validation is a global substring-family guard. It correctly matches the user's relaxed output-element requirement and the live result covered all four people, but it does not prove that every element family is attached to every named character. If the product later restores a strict per-character guarantee, add name extraction or a semantic evaluator instead of reintroducing rigid display syntax.
- Non-blocking: the Browser run proved the valid same-node Task 1 fallback, while connected-edge priority/deletion behavior is covered at reducer level rather than by a second live drag gesture. Keyboard Select is likewise covered by real DOM/jsdom interaction rather than the finalized Browser run.
- Informational: the backend suite emits one existing Starlette/httpx deprecation warning and `init.ps1` emits Node's `url.parse()` deprecation warning; neither affects this feature.

## Verdict

**ACCEPTED — 156/160.** The score exceeds the required 140/160 threshold, the mandatory Codex in-app Browser E2E completed against a live provider, the user's free-form-output clarification is implemented, and no blocking defect remains. Main agent may mark `script-node-011` passing and close the sprint after synchronizing the remaining status/progress artifacts.
