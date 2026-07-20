# Sprint Contract - Image Task 1 Reference-Grounded Character Views

## Scope

- Feature: 5 Image Node
- Task: `image-task-1-character-views-v1`
- Status: `in_progress`
- Goal: make Image Task 1 generate its character sheet from the newly returned base image, not independently from the same text prompt.

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

1. Completing Image Task 1 makes the configured Image API generate a base image from the submitted appearance and personality/action text, then passes that returned base image to the character-sheet generation as its reference input.
2. The character-sheet prompt requests a text-free 3:4 multi-panel reference sheet with the approved front/side/back, expression, and action modules while preserving the base image identity, wardrobe, and art style.
3. The backend returns both typed image results with provider/model metadata and fails the Task honestly if either required image is unavailable.
4. The canvas creates two distinct, rerunnable pure Data outcome nodes: “Character base image” and “Character three-view image”.
5. Each Data outcome has an unframed, uncropped original image preview and its own automatic source-to-result edge; rerunning updates results without duplicate nodes or edges.
6. The UI keeps provider/model execution evidence and the existing non-persistence disclosure without claiming asset-library storage.
7. Focused backend, graph, frontend interaction, typecheck/build, and in-app browser click-by-click verification pass with the live configured model path where credentials are available.
8. Independent evaluator score exceeds 140/150.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | Previous Task 1 generated only one `image` output. Output node IDs are derived only from source ID and data type, so a second image would overwrite the base result. |
| Plan | Add explicit output variants and server-side multi-image response handling while preserving the Image Task and four-Node architecture. |
| Implementation | The server-side `image.character.generate` path now returns `character_base` and `character_three_view`; the canvas maps them to distinct pure Data outcomes with stable variant IDs and automatic edges. |
| Revision plan | Change the second provider call to use the first `character_base` output as its only reference image and replace its independent-turnaround instruction with the approved 3:4 character-sheet prompt. |
| Automated verification | Focused Web tests passed (51), current backend tests passed (28), and Ruff plus `git diff --check` passed before the local dependency cache was disrupted. |
| Live E2E | After a clean dependency reinstall and FastAPI restart, an in-app-browser Task 1 submission reached the local route and the configured provider; the completed POST returned `200 OK`. The tab-control connection reset before the final DOM read, so this log does not overclaim a visual identity judgment beyond the returned live call. |
