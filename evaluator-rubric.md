# Evaluator Rubric - Canvas Interaction And Node Menu V1

Updated: 2026-07-17

## Evaluation Scope

- Role: independent evaluator for `workspace-canvas-012`.
- Reviewed: the selected-Text inline-editor hit-area fix and the Add node menu restriction to Text, Image, Audio, and Video.
- Protected boundaries: no backend/provider behavior was changed. The pre-existing unrelated Text-outcome graph changes and user-owned `AGENTS.md` edit were not scored as this round's implementation.

## Scorecard

| Criterion | Points | Current | Evidence |
| --- | ---: | ---: | --- |
| Scope and boundary isolation | 20 | 20 | The UI diff is confined to the canvas workspace plus focused tests. |
| Blank-canvas interaction fix | 30 | 30 | The editor wrapper is now `pointer-events-none`, while the visible editor card is `pointer-events-auto`; this removes the wrapper's hit area. Static rendering coverage proves the classes, and the main-agent in-app Browser E2E dragged the blank canvas area and observed the stage translation change. |
| Add node menu correctness | 25 | 25 | An explicit allowlist filters the menu to `script`, `image`, `audio`, and `video`; the real DOM test opens the menu, asserts exactly four buttons, and excludes Storyboard and Image Composition. |
| Regression and accessibility coverage | 15 | 15 | Full suite is green and keeps the existing keyboard Text task flow. The Browser run also confirmed the visible editor controls remain interactive after the wrapper becomes pointer-transparent. |
| Build and restartability | 20 | 20 | Standard `init.ps1`, Web typecheck, and production build all passed; `/workspace` is emitted. |
| Real browser E2E | 30 | 29 | My own browser binding was unavailable, but I audited the main-agent's Codex in-app Browser evidence: the menu showed exactly Text, Image, Audio, and Video, and dragging a formerly blocked blank area changed the stage translation. One point reserved because the browser binding was not independently available to replay the gestures. |
| Documentation and hygiene | 20 | 17 | `sprint-contract.md` documents this round and `git diff --check` passes. The evaluator rubric was reset for this evaluation; source code was not changed by the evaluator. |

Current score: 156 / 160

## Verification Evidence

- Applied `C:/Users/AI/.codex/skills/verify/SKILL.md`; reviewed the current implementation diff, graph/workspace tests, the product and architecture contracts, and the sprint contract.
- `./init.ps1`: passed; dependency install completed and the Web suite passed (10 files, 65 tests).
- `corepack pnpm --filter @xmeta/web test`: passed (10 files, 65 tests), including the four-item Add node DOM interaction test.
- `corepack pnpm --filter @xmeta/web typecheck`: passed.
- `corepack pnpm --filter @xmeta/web build`: passed; `/workspace` is statically generated.
- `git diff --check`: passed (only non-failing LF-to-CRLF notices).
- `Invoke-WebRequest http://localhost:3000/workspace`: HTTP 200; the server-rendered page contains the Add node control.
- Audited main-agent Codex in-app Browser E2E: opening Add node showed exactly Text, Image, Audio, and Video; Storyboard and Image Composition were absent. A drag through the previously blocked blank canvas region changed the canvas stage translation. The visible Text editor controls remained usable and no console error was reported.

## Findings

- No automated failure was found. The CSS change is correctly shaped to remove the invisible editor-wrapper hit box while retaining interactivity on the visible editor card.
- The test suite proves that the menu contains exactly Text, Image, Audio, and Video. The audited Browser E2E supplements the structural pointer-events assertion with a real canvas drag that changed the stage translation.
- My independent browser binding was unavailable (`No browser is available`), so the browser portion above is audited main-agent evidence rather than a replay. This does not affect the passing automated, typecheck, build, startup, or HTTP checks.

## Verdict

**ACCEPTED — 156/160.** The score exceeds the required 140/160 threshold. The invisible canvas hit-area regression is fixed and Browser-verified; Add node is limited to the four supported models; focused/full tests, typecheck, build, standard startup, and the local workspace HTTP smoke check all pass.
