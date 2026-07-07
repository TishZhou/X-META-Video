# Evaluator Rubric - Feature 3 Script Node Dual Mode

Updated: 2026-07-07

## Evaluation Scope

- Role: Main-agent evaluator for Feature 3 `script-node-008`.
- Scope reviewed: Script node inline composer, response panel behavior, workspace component tests, Browser E2E, and Feature 3 artifacts.
- Verification posture: applied the verify-skill checklist with focused tests, typecheck, full web tests, build, backend chat preflight, and Browser end-to-end on `/workspace`.

## Scorecard

| Criterion | Points | Current | Evidence |
| --- | ---: | ---: | --- |
| Explicit Requirements | 30 | 29 | `AI modify` is now mode entry, not send; direct Generate remains one-click generation; conversation mode has a separate Send. One point reserved because generation still uses the current prompt, not synthesized full dialogue memory. |
| Implicit Requirements | 20 | 19 | Backend chat route remains connected and Generate still produces structured ScriptOutput. No media/persistence overclaim. |
| Regression Checks | 25 | 25 | Focused test, full web test, typecheck, build, backend chat preflight, and Browser E2E passed. |
| Edge Cases | 20 | 18 | Initial no-Send state, empty conversation guidance, chat send, and direct generation are covered. Full conversation-to-final prompt synthesis remains later scope. |
| Time/Space Complexity | 15 | 15 | Frontend state split is constant overhead and reuses existing backend chat route. |
| Program Format | 20 | 20 | Scoped React state and props; no backend contract churn; artifacts updated. |
| Visual Design (if applicable) | 20 | 20 | Controls now match user mental model: secondary mode entry, explicit Send, primary Generate. Browser screenshot verified layout. |

Current score: 146 / 150

## Findings

- No P1/P2 findings.
- P3: Conversation history is not yet automatically summarized into the generation prompt. Users can still edit the main prompt before Generate, and durable synthesis can be addressed in a later prompt/performance pass.

## Verification Evidence

- `.\init.ps1` baseline passed before implementation: web tests 9 files / 38 tests.
- `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx` passed: 1 file / 15 tests.
- `corepack pnpm --filter @xmeta/web typecheck` passed.
- `corepack pnpm --filter @xmeta/web test` passed: 9 files / 39 tests.
- `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
- Backend chat preflight against `POST /api/v1/projects/local-project/nodes/script-1/chat` returned a mock assistant reply.
- Browser E2E passed on the in-app browser tab at `http://localhost:3000/workspace`: no Send before AI modify; direct Generate produced Ready ScriptOutput; AI modify opened AI dialogue guidance without sending; Send produced `Script AI turn 1`; Generate remained visible; no framework overlay or console warn/error logs.
- Final `.\init.ps1` passed after artifact updates and reran web tests: 9 files / 39 tests.

## Verdict

Accepted. Feature 3 now presents the two intended Script node modes: direct prompt-to-script generation and optional AI-guided conversation mode with an explicit send action.
