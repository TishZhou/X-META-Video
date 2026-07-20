# Sprint Contract - Image Task 1 Reference-Grounded Character Views

## Scope

- Feature: 5 Image Node
- Task: `image-task-1-character-views-v1`
- Status: `passing`
- Goal: make Image Task 1 generate a base image, a dedicated full-body three-view image, and a separate expression/action sheet, each downstream result grounded only in that returned base image.

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

1. Completing Image Task 1 makes the configured Image API generate a base image from the submitted appearance and personality/action text, then passes only that returned base image to each derived generation as its reference input.
2. The dedicated Chinese three-view prompt requests only three complete full-body standard views: front, left side, and back, with no expression or action panels competing for its image area.
3. The Chinese expression/action prompt requests six expression close-ups and four natural full-body actions in fixed cells while preserving the base image identity, wardrobe, and art style.
4. The backend returns all three typed image results with provider/model metadata and fails the Task honestly if any required image is unavailable.
5. The canvas creates three distinct, rerunnable pure Data outcome nodes: character base image, character three-view image, and character expression/action sheet.
6. Each Data outcome has an unframed, uncropped original image preview and its own automatic source-to-result edge; rerunning updates results without duplicate nodes or edges.
7. The UI keeps provider/model execution evidence and the existing non-persistence disclosure without claiming asset-library storage.
8. Focused backend, graph, frontend interaction, typecheck/build, and in-app browser click-by-click verification pass with the live configured model path where credentials are available.
9. Independent evaluator score exceeds 140/150.

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
