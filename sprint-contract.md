# Sprint Contract - Image Task 1 Model Generation V1

## Current Round

**Sprint:** image-task-1-model-generation-v1

**Feature:** Feature 5, Image Node

**Status:** passing

**Goal:** Replace Image Task 1's provided local fixture with a real server-side image-model invocation, using the supplied appearance and personality/action inputs as the generation prompt.

**Plan:**

1. Compile Task 1's two inputs into one character-image model prompt.
2. Invoke the existing FastAPI `generate-image` route using the `character_image` node type, with provider credentials remaining solely on the server.
3. Create or update the deterministic Task 1 result node from the returned provider/model/media payload and preserve exactly one source-to-result edge.
4. Remove all fixture/provided-local claims from Task 1 and show actionable API failures without fallback media.
5. Add focused interaction coverage with an injected API runner, then verify the actual backend/UI route in the in-app Browser.

**Acceptance criteria:**

1. Task 1 sends one server-side model request containing both user inputs; no local fixture image is used.
2. The result node displays the returned image with truthful provider/model evidence and non-persistence wording.
3. A failed or unconfigured provider leaves no misleading local result and presents the backend error.
4. Existing Image prompt/upload/edit behavior and deterministic output-edge semantics remain intact.
5. Relevant API/Web checks, typecheck, build, standard startup, and in-app Browser E2E pass.

**Protected boundaries:** do not expose or change provider credentials, do not add browser-to-provider calls, and do not claim persistence, polling, or graph auto-execution.

**Revision 1 — Data output presentation:** Image Task 1's model result is a downstream pure `Data` outcome node rather than a second Image/model card. Its image surface has no decorative card or image border and preserves the returned image's natural aspect ratio without cropping. This revision applies to Image Task 1 only; existing Text, Audio, Video, and general Data-source behavior remain unchanged.

**Final evidence:** Task 1 sent both character inputs through `POST /api/v1/projects/{project_id}/nodes/{node_id}/generate-image` with `node_type: character_image`; the live FastAPI result identified `doubao-seedream / doubao-seedream-5-0-260128`. The browser showed 5 nodes / 3 edges, with the result as a pure Data image output using its uncropped original aspect ratio and no visual frame. Web 70/70, API/Runtime 27/27, Ruff, typecheck, production build, `init.ps1`, and `git diff --check` passed. Independent evaluation accepted at 157/160.

# Sprint Contract - Canvas Viewport Stability V1

## Current Round

**Sprint:** canvas-viewport-stability-v1

**Feature:** Workflow Canvas

**Status:** passing

**Goal:** Prevent the canvas from recentering or offsetting nodes after a browser or visual-viewport resize, including the resize that can follow completing an Image task.

**Plan:**

1. Initialize the canvas viewport once when the workspace mounts.
2. Keep later resize handling limited to responsive inline-editor layout, preserving the user's current pan and zoom.
3. Add a focused regression test for viewport stability across resize.
4. Re-run Web verification and a click-by-click Image Task 1 browser flow, inspecting the result node and automatic edge after completion.

**Acceptance criteria:**

1. A window or visual-viewport resize does not reset the canvas stage transform.
2. Completing Image Task 1 retains the visible source/result relationship and its single automatic edge.
3. Existing responsive inline-editor sizing continues to use the current window width.
4. Focused/full Web tests, typecheck, build, and in-app Browser E2E pass without console errors.

**Protected boundaries:** no graph-output contract, task behavior, provider, persistence, queue, or backend route changes.

**Final evidence:** Focused viewport regression coverage and the full Web suite passed (10 files / 70 tests). `init.ps1`, Web typecheck, production build, and `git diff --check` passed. A click-by-click Codex in-app Browser Task 1 run completed at 5 nodes / 3 edges with the Image source, supplied local result, and automatic edge visible after the browser became visible (a visual-viewport change); console warnings/errors were empty. Independent evaluation accepted the change at 158/160.

# Sprint Contract - General Data Source Node V1

## Current Round

**Sprint:** image-node-character-base-task-v1

**Feature:** Feature 5, Image Node

**Status:** passing

**Goal:** Let creators select a character-base-image task on the existing Image node, provide the character appearance and personality/action inputs as Text-node-style inputs, and receive the provided character base image as a connected canvas result.

**Plan:**

1. Extend the Image node's node-local task selection with a clearly named Character base image task while retaining its current prompt, upload, and edit behavior.
2. Render only the task selector as Image-specific UI; reuse the established Text node input pattern for the task's appearance and personality/action text inputs.
3. Use the supplied character reference image as the initial local result for this task, clearly labelled as a provided local preview rather than model-generated or persisted media.
4. Create one deterministic result node and a source-to-result edge automatically; repeated task completion must update it without duplicating the edge.
5. Add reducer, render, interaction, and browser click-by-click coverage, then complete the evaluator/artifact loop.

**Acceptance criteria:**

1. A selected Image node offers an accessible task selector that includes `Task 1 · Character base image`.
2. Task 1 exposes two labeled, independently editable text inputs: character appearance and personality/action description.
3. Completing Task 1 shows the supplied base image in a dedicated image result node with truthful `provided local preview` / no-persistence evidence.
4. Completion automatically creates exactly one visible compatible edge from the Image source to the result; rerun does not duplicate it.
5. Existing Image node prompt generation, upload, and image-edit flows remain available and unaffected.
6. Focused/full Web tests, typecheck/build, standard startup, and in-app Browser click-by-click E2E pass without console errors.

**Protected boundaries:** no provider credential, backend route, persistence, queue, or automatic graph execution changes; the supplied image is a local task fixture, not a claim of a live model result.

**Final evidence:** `./init.ps1` passed with the full Web suite (10 files / 69 tests); Web typecheck, production build, and `git diff --check` passed. In the Codex in-app Browser, the flow added Image, selected Task 1, entered both character descriptions, completed the task, rendered `/provided-character-base-task-1.png` (229×406), created one source-to-result edge (4 nodes / 2 edges to 5 nodes / 3 edges), and reran without duplication. Independent evaluation accepted the sprint at 160/160.

## Current Round

**Sprint:** general-data-source-node-v1

**Feature:** Feature 2, Workflow Canvas Foundation

**Status:** passing

**Goal:** Let a creator add a standalone Data node to the canvas as a reusable upstream source, select Text, Image, or Audio, and connect the typed output to compatible node inputs.

**Plan:**

1. Add a `data` source-node type and typed graph support for its current data kind and editable content/label.
2. Add `Data` to the existing bottom Add node menu, using the established node-card, port, and canvas-selection behavior.
3. Provide a compact node-local editor: Text supports real manual input; Image and Audio expose an honest unavailable upload action rather than implying a file has been attached.
4. Ensure Text data provides an output compatible with Text Node input; Image and Audio ports are visibly marked as awaiting upload and cannot masquerade as ready media values.
5. Add reducer/render/interaction coverage, then run frontend verification and click-by-click in-app Browser E2E.

**Acceptance criteria:**

1. Add node exposes a General Data entry alongside the current node types.
2. A new Data node can be selected and changed between Text, Image, and Audio.
3. Text data is editable, produces a typed output port, and can be connected to a compatible downstream input.
4. Image/Audio show their data types but label local file attachment as not implemented; no false persistence, upload, or generation claim is made.
5. Node state is isolated, survives selection changes in the local canvas state, and existing node workflows continue to work.
6. Focused/full Web tests, typecheck/build, standard startup, and in-app Browser E2E pass.

**Final evidence:** Focused graph/interaction tests (11), full Web suite (67), typecheck, production build, `git diff --check`, and final `init.ps1` passed. Main-agent in-app Browser E2E added Data, entered reusable text, connected its `brief` output to the Text input, and verified that switching a Data node to Image removes stale edges and renders the `unavailable` output disabled with the explicit no-attachment message. Independent re-evaluation accepted at 151/160.

## Task 3 Round

**Sprint:** text-node-task-3-mv-look-development-v1

**Feature:** Feature 3, Text Node

**Status:** passing

**Goal:** Add a third node-local Text task that transforms a character's concrete appearance, personality, and voice/timbre description plus an MV brief into a reusable, editable MV-specific outfit, styling, and visual-character description.

**Plan:**

1. Extend the typed Text task contracts, prompt profile, validator, API metadata, and frontend task options with `mv_look_development` while retaining Task 1 and Task 2 behavior.
2. Accept both supplied inputs as natural text; never require pre-existing outfits or accessories in the character description.
3. Produce natural Chinese/English-compatible text focused on MV-integrated costume, hair/makeup, accessories/props when appropriate, silhouette/material/color, and stable visual identity.
4. Keep the Task 3 result editable and reusable as a dedicated `mv_look` text outcome with the same truthful local/no-persistence metadata model as the existing Text tasks.
5. Add focused API, Agent Runtime, reducer/render, and interaction coverage. Verify with the Web/API suites, lint/type/build/startup checks, and a real in-app Browser flow.

**Acceptance criteria:**

1. The existing accessible `Text task` Select presents exactly three tasks, including `Task 3 · MV outfit & visual look`.
2. Task 3 has separate labeled inputs for character profile and MV brief; concise briefs such as “废土风 MV” are valid.
3. Task 3 output includes MV-integrated costume/styling and visual characteristics, preserving the supplied face/hair/identity anchors and adapting or adding apparel/accessories only when useful to the MV brief.
4. The task does not invent a claim that backend persistence, asset generation, or image locking already exists.
5. Existing Task 1/Task 2 input priority and outputs remain unchanged; task/draft state stays isolated per Text node.
6. Required automated verification and in-app Browser E2E pass without console errors, and evaluator acceptance exceeds 140/160.

**Protected boundaries:**

- Do not alter Image, Audio, Video, provider credentials, queue/persistence behavior, or graph auto-execution.
- Do not remove the existing Task 1/Task 2 API or outcome contracts.
- Do not create an image asset: Task 3 is a Text Node prompt-development result only.

**Final evidence:** Full API suite (82), focused Text API (10), Ruff, Web suite (65), focused interaction suite (39), typecheck, production build, `git diff --check`, and final `init.ps1` passed. In-app Browser E2E generated a live `mv_look` outcome through `openai / gpt-5.4-mini` from a Mira profile plus `废土风 MV`; the editable result retained her red-brown braids and facial anchors while supplying wasteland silhouette, materials, makeup, and functional accessories. Independent evaluator accepted at 147/160.

## Sprint Overview

**Sprint:** canvas-interaction-and-node-menu-v1

**Feature:** Feature 3, Text Node (internal workflow type remains `script` for contract compatibility)

**Task:** workspace-canvas-012

**Status:** passing

**Goal:** Remove the invisible interaction layer around a selected Text node and keep the bottom Add node menu focused on the four currently supported creation models: Text, Image, Audio, and Video.

**Revision 2 Goal:** Keep SVG connections and the in-progress connection preview visible when nodes are dragged or the viewport is panned beyond the original fixed canvas dimensions.

## Current Round Plan

1. Make the inline Text editor's structural wrapper ignore pointer events, while its visible controls continue to receive them, so blank overlay space remains usable canvas.
2. Define the Add node menu from an explicit supported-model allowlist rather than exposing every graph template; retain existing templates for the initial workflow and connection contracts.
3. Add focused render and interaction coverage for the four-item menu and canvas interaction through the formerly blocked blank area.
4. Run the Web tests, typecheck/build as appropriate, standard startup verification, and a click-by-click in-app Browser E2E pass.
5. Remove SVG viewport clipping from workflow edges, then reproduce a long-distance node/connection drag in the Browser and verify the complete line remains visible.

## Acceptance Criteria For This Round

1. A click and drag on blank canvas space around a selected Text node can pan or clear the selection; no invisible editor wrapper intercepts that interaction.
2. Visible Text-editor controls remain fully interactive.
3. The Add node menu exposes exactly Text, Image, Audio, and Video, each with its current input/output label.
4. Existing initial Storyboard and Image Composition nodes remain intact; this change only limits new-node choices.
5. Focused tests, the Web suite, typecheck, build, `init.ps1`, and in-app Browser E2E pass without console errors.

## Current Round Evidence

- The Text inline-editor wrapper and empty SVG connection surface now pass pointer events through to the canvas; visible editor controls and transparent edge hit paths remain interactive.
- The browser menu exposed exactly Text, Image, Audio, and Video. A real blank-canvas drag changed the stage transform from `translate(546px, -508px)` to `translate(506px, -538px)`.
- Web suite: 10 files / 65 tests passed; typecheck, production build, and `init.ps1` passed.
- Revision 2 live Browser E2E: after panning the canvas, the Text output port was dragged to x=1237 while the original SVG right boundary was x=1060. The connection remained visible outside that boundary; blank-canvas panning still worked.

## Product Decisions

- AI modify/dialogue is unchanged and out of scope for this sprint.
- Task execution uses a dedicated `generate-text` API and Agent Runtime profiles instead of overloading dialogue mode.
- User-visible output and agent-to-agent content share one canonical editable `content` value. Transfer adds only compact task/data/source metadata, avoiding duplicate long payloads and drift.
- Shared text-generation rules live once in the common prompt layer; each task profile owns only its task-specific instructions.
- Task 2 input priority is: connected Task 1 outcome, same-node Task 1 outcome, then manually entered/pasted content.
- The internal workflow node type remains `script` in V1 to preserve downstream canvas/API compatibility; user-visible naming becomes Text.
- A generated Text outcome is a first-class graph result: generation creates or preserves one deterministic source-to-outcome edge instead of relying on visual proximity alone.
- A Text source node shows `Input connected` whenever an incoming edge carries the pure `text` data type; it must not imply a connection for another compatible non-text input.

## Write Scope

- `packages/shared-contracts/src/index.ts`
- `services/api/xmeta_api/schemas.py`
- `services/api/xmeta_api/main.py`
- `services/api/xmeta_api/agent_runtime/contracts.py`
- `services/api/xmeta_api/agent_runtime/profiles.py`
- `services/api/xmeta_api/agent_runtime/prompts.py`
- `services/api/xmeta_api/agent_runtime/validators.py`
- `services/api/xmeta_api/agent_runtime/nodes/text.py`
- `services/api/xmeta_api/agent_runtime/runtime.py`
- focused API/Agent Runtime tests
- `apps/web/src/components/ui/select.tsx` installed through the shadcn CLI
- `apps/web/src/lib/text-node/api.ts`
- `apps/web/src/lib/workflow-canvas/types.ts`
- `apps/web/src/lib/workflow-canvas/graph.ts`
- `apps/web/src/components/xmeta/workflow-canvas/workflow-canvas-workspace.tsx`
- focused workflow graph/workspace tests
- Feature 3 planning, evaluation, progress, and handoff artifacts
- `docs/API.md`
- focused DOM interaction-test dependencies/configuration if required
- deterministic Text outcome-edge reducer coverage and Text-input connection rendering coverage

Protected boundaries:

- Do not change AI modify/dialogue behavior.
- Do not change Image, Audio, Video, Storyboard, Composition, or Export provider behavior.
- Do not add persistence, project memory, workers, queues, provider polling, or graph auto-execution claims.
- Do not print or commit provider credentials.
- Preserve the user-owned uncommitted `AGENTS.md` change without editing or committing it.

## Acceptance Criteria

1. The selected Text Node shows an accessible shadcn Select labeled `Text task` with exactly the two requested tasks and node-local selection state.
2. Task 1 accepts a brief idea and returns editable natural text covering IP narrative positioning, core world view/rules, and named character positioning.
3. Task 2 accepts Task 1 output and returns editable per-character sections covering stable appearance language, personality/action language, and distinct voice/timbre language.
4. FastAPI exposes a typed `POST /api/v1/projects/{project_id}/nodes/{node_id}/generate-text` route with provider/model evidence and honest `persisted: false` metadata.
5. Agent Runtime registers separate stable task profiles, prompt-template IDs, output metadata, and validators for both tasks; common rules are not duplicated across task prompts.
6. One canonical output `content` value drives both the user-visible outcome editor and downstream Text Node input. Compact metadata identifies task, data type, and source without copying the long text.
7. Task 2 prioritizes connected Task 1 output, then same-node Task 1 output, then manual input, and visibly identifies the effective input source.
8. Text inputs and task choices are isolated per source node; adding/selecting a second Text Node does not overwrite the first node's draft or task selection.
9. Task 1 produces a `script` text outcome; Task 2 produces a `character` text outcome; both remain editable and reusable by compatible downstream ports.
10. Relevant API/Agent Runtime/Web tests, typecheck, build, Ruff, JSON validation, diff check, local API smoke, and final `init.ps1` pass.
11. Browser E2E is performed click by click with normal user controls: select each task, enter/use input, generate, inspect outcome, connect/use Task 1 for Task 2, edit output, verify provider/model evidence, error state, keyboard Select behavior, viewport fit, screenshots, console errors, and failed requests.
12. Independent evaluator score exceeds 140/160, and mandatory Codex in-app Browser E2E completes.
13. Generating Task 1 or Task 2 automatically renders exactly one deterministic edge from the Text source to its matching outcome node; regeneration does not duplicate that edge.
14. A Text source node with an incoming pure `text` edge visibly says `Input connected`, while an unconnected Text source retains its existing empty-input wording.

## QA Inventory

User-visible claims and required evidence:

- Task dropdown visibly offers the two requested choices; mouse and keyboard selection both work.
- Task 1 generated result is editable and carries backend-confirmed provider/model metadata.
- Task 2 consumes the connected or same-node Task 1 content rather than silently using the original brief.
- Switching among Text Nodes preserves each node's own task/input.
- Empty Task 2 input blocks generation with an actionable message.
- Loading, success, and failure states are visible and no unimplemented action implies completion.
- The relevant canvas/editor/result regions fit at 1600x900 and a smaller realistic desktop viewport without clipping or overlap.
- Exploratory scenarios: switch tasks repeatedly after generating both outcomes; disconnect/delete an upstream outcome and confirm Task 2 falls back honestly.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | `./init.ps1` passed with 9 Web files / 58 tests; only the user-owned `AGENTS.md` change was uncommitted. |
| Planning | Main agent defined two dedicated Text tasks, canonical content transfer, node-local state, and full click-by-click QA inventory. |
| Implementation | Round 1 implemented the dedicated route, two task profiles, canonical transfer, shadcn Select, node-local drafts, and editable typed outcomes. |
| Verification | Round 1 automated suites and a real provider Task 1 -> Task 2 chain passed. Codex Browser bootstrap failed before navigation with `Cannot redefine property: process`; no substitute browser was used. |
| Evaluation | Round 1: 126/160, rejected. Required revisions: API docs, per-character Task 2 validation, interaction-level Web coverage; main review also found stale deleted outcome data and overlapping Task 1/Task 2 outcome placement. |
| Revision 2 | Closed every Round 1 product defect; backend 79/79, Web 10 files / 63 tests, focused jsdom interaction, Ruff, typecheck, build, JSON, docs truth search, OpenAPI, final init, and a restarted live four-character Task 1 -> Task 2 chain passed. |
| Final evaluation | Round 2 finalized at 143/160 and met the numeric threshold, but remained rejected because the mandatory Codex in-app Browser failed before navigation with `Cannot redefine property: process`. No browser substitute was used. |
| Revision 3 | Removed rigid `[Character: name]` blocks and exact field labels. Task 2 now requests natural editable prose and validates only the required semantic element families. |
| Revision 4 | Expanded semantic validation for natural Chinese/English synonyms after the live Browser exposed a false negative for `视觉造型`; focused/full backend and Web suites, Ruff, typecheck, build, OpenAPI/docs/JSON/diff checks, and final `init.ps1` passed. |
| Codex Browser E2E | The repaired in-app Browser client controlled the user-opened `/workspace` tab. A real `openai / gpt-5.4-mini` Task 1 -> edited same-node Task 1 -> Task 2 path passed; Task 2 returned 1,651 characters with all four names and the appearance, personality/action, and voice families, without rigid character tags. Both outcomes were editable, provider-labelled, and non-overlapping. Loading and live error states, 1280x720 and 1600x900 layouts, screenshots, empty console warn/error logs, and the successful final API request were inspected. |
| Final evaluation | Independent Revision 3/4 evaluation accepted the feature at 156/160 with no blocking defect. Focused backend 8/8, full backend 80/80, Ruff, Web 63/63, typecheck, build, OpenAPI, JSON, diff-check, and final `init.ps1` all passed. |

## Revision Round 2 Plan

1. Update `docs/API.md` to make `/generate-text` the current Text Generate contract while retaining `/chat` only for AI modify/dialogue compatibility.
2. Define a stable natural-text character-profile section boundary and validate every emitted character section for appearance, personality/action, and voice/timbre; add negative multi-character tests.
3. Add interaction-level Web tests that operate the real task Select, input, Generate, editable outcome, and Task 1 -> Task 2 handoff path as far as the test DOM supports.
4. Require a live outcome node to use cached Task 1 content so deleting an outcome falls back honestly instead of reading stale local state.
5. Place Task 1 and Task 2 outcome nodes at distinct non-overlapping coordinates and cover the placement rule.
6. Re-run all verification, then repeat independent evaluator review. Browser E2E remains restricted to Codex in-app Browser and cannot be replaced by Computer Use, Chrome, or standalone Playwright.

## Revision Round 3 Plan

User clarification: input formatting is not part of acceptance, and generated text does not need rigid structural delimiters. Acceptance is based on the required output elements.

1. Remove the mandatory `[Character: name] ... [/Character]` boundary and exact bilingual field-label contract from Task 2 prompts, validators, docs, tests, and mocks.
2. Keep Task 2 natural and editable while requiring coverage of every named character and the output elements appearance, personality/action, and voice/timbre; validator checks required element presence without enforcing presentation format.
3. Preserve canonical content transfer, compact metadata, typed task/data/source contracts, editable outcomes, source priority, and all current canvas behavior.
4. Re-run focused/full automated and live-provider verification.
5. Use the newly working Codex in-app Browser connection to execute the click-by-click E2E on the user-opened `/workspace` tab, including both tasks, editable outcomes, source evidence, error state, viewport, screenshot, console, and failed requests.

## Revision Round 5 Plan

1. Extend the graph reducer so `upsertOutputNode` creates a deterministic edge from the source Text output port to the generated outcome input port, without duplicating it on regeneration.
2. Derive the source Text node preview from incoming graph edges: display `Input connected` only for a connected `text` edge, and preserve the existing empty-input copy otherwise.
3. Add reducer, render, and interaction coverage for the generated edge, deduplication, connected state, and unconnected state.
4. Verify in the Codex in-app Browser using the real Generate control, including the visible edge and connected-state copy, then complete the required evaluator/artifact loop.
