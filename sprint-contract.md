# Sprint Contract - Image Task 1 Reference-Grounded Character Views

## Scope

- Feature: 5 Image Node
- Task: `image-task-1-base-then-derived-views-v1`
- Status: `passing`
- Goal: make Image Task 1 generate only the character base first; expose an explicit hover action on that base Data node which, when clicked, generates the dedicated full-body three-view image and separate expression/action sheet from that base.

## Write Scope

- Image Task 1 API request/result contracts and runtime execution
- Image Task 1 canvas outcome identity, layout, and pure Data image presentation
- Focused API, graph, and interaction tests
- Feature 5 planning, evaluation, progress, and handoff evidence

Protected boundaries:

- Keep the four creation Node kinds and the existing `image.character.generate` Task ID; do not introduce a Graph Node kind.
- Provider credentials and model calls remain server-side. No local fixture or browser-side model fallback is permitted.
- Preserve the updated `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, and user-owned `docs/node_design.md`.

## Acceptance Criteria

1. Completing Image Task 1 calls the configured Image API only for the character base image and creates only that base Data outcome plus its source edge.
2. Hovering the returned base image exposes one explicit, keyboard-accessible action labelled “出三视图 + 表情动作”; no downstream generation starts merely from hover or base completion.
3. Clicking that action passes only the generated base image to the configured server-side derived-generation path, which returns a dedicated full-body front/left-side/back sheet and a separate six-expression/four-action sheet.
4. The Chinese derived prompts retain the existing full-body and natural-pose constraints, and the backend returns typed provider/model metadata or an honest error.
5. The canvas adds or updates the two derived pure Data outcome nodes and their automatic source-to-result edges without duplicating them on rerun.
6. Every Data outcome retains an unframed, uncropped original image preview and truthful non-persistence/provider metadata.
7. Focused backend, graph, frontend interaction, typecheck/build, and in-app-browser click-by-click verification pass with the live configured model path where credentials are available.
8. Independent evaluator score exceeds 140/150.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | Previous Task 1 generated only one `image` output. Output node IDs are derived only from source ID and data type, so a second image would overwrite the base result. |
| Plan | Add explicit output variants and server-side multi-image response handling while preserving the Image Task and four-Node architecture. |
| Implementation | The server-side `image.character.generate` path returns `character_base`, `character_three_view`, and `character_expression_action_sheet`; the canvas maps them to distinct pure Data outcomes with stable variant IDs and automatic edges. |
| Revision plan | Change the second provider call to use the first `character_base` output as its only reference image and replace its independent-turnaround instruction with the approved 3:4 character-sheet prompt. |
| Chinese-prompt revision | Replace the second-stage instruction with a Chinese fixed-slot character-sheet prompt that explicitly prohibits omitted expression/action panels and strengthens pose anatomy, center of gravity, ground contact, and garment dynamics. |
| Split-output revision | Split the overloaded character sheet into a complete-full-body three-view provider call and a separate expression/action provider call. Both receive only the generated base as their reference and appear as their own pure Data outcomes and automatic edges. |
| Automated verification | Focused Web tests passed (51), current backend tests passed (28), and Ruff plus `git diff --check` passed before the local dependency cache was disrupted. |
| Live E2E | In-app-browser Task 1 click-by-click verification submitted Chinese appearance and personality inputs through local FastAPI to the configured provider. The completed POST returned `200 OK`; the canvas showed 7 nodes and 5 edges, with three labelled Data outcomes. Visual review confirmed an uncropped full-body base, a distinct front/left-side/back full-body sheet, and a separate six-expression/four-action sheet. |
| Two-step revision plan | Task 1 will stop after the base result. The base Data node will offer an explicit hover-and-click action that starts the two remaining server-side generations only after user approval. |
