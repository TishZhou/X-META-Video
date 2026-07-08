# Evaluator Rubric - Feature 8 Audio Edit Completion

Updated: 2026-07-08

## Evaluation Scope

- Role: Main-agent evaluator pass for Feature 8 `text-to-music-audio-node-003`.
- Scope reviewed: shared/FastAPI music reference-audio contracts, MiniMax `music-cover-free` provider payload, Audio node edit UX, source-node replacement behavior, Feature 5/9 boundary preservation, and live Browser E2E.
- Protected boundaries: Feature 5 self-contained Image node and Feature 9 Video node remain outside this revision.

## Scorecard

| Criterion | Points | Current | Evidence |
| --- | ---: | ---: | --- |
| Scope fit and isolation | 20 | 19 | Audio-only changes; Image and Video behavior untouched except shared tests still passing. |
| MiniMax backend contract | 30 | 29 | Text-to-music still uses `music-2.6-free`; existing-audio edit sends reference audio through `music-cover-free` with `audio_url` or `audio_base64`. |
| Self-contained Audio node UX | 35 | 34 | Empty nodes generate on-node audio; existing nodes execute Edit audio and replace the same source node with playable controls and Download. |
| UI truthfulness and missing-capability labels | 20 | 19 | The normal edit path no longer claims audio editing is unimplemented; persistence/storage/edit-history limitations remain labeled. |
| Verification depth | 35 | 34 | Backend tests, frontend tests, typecheck, and live Browser E2E for generate-then-edit passed. |
| Artifact hygiene | 10 | 10 | Feature task/status/progress/handoff/sprint records updated; final startup passed after artifact updates. |

Current score: 145 / 150

## Acceptance Evidence

- Shared music input contracts now accept `reference_audio_url`, `reference_audio_b64`, and `reference_audio_mime_type`.
- FastAPI passes reference audio into `submitMiniMaxMusicWithRetry()`.
- `submitMiniMaxMusicWithRetry()` supports MiniMax cover models, requires reference audio for cover mode, sends `audio_url` or `audio_base64`, and does not require lyrics for cover requests at the local validation layer.
- The Audio node frontend derives MiniMax edit references from remote URLs, uploaded data URLs, generated base64, or generated hex audio.
- Edit audio calls local FastAPI with `settings.model = music-cover-free`, then replaces the selected source Audio node output in place.
- The normal existing-audio edit UI no longer renders the old “AI audio editing is not implemented yet” message.

## Verification Evidence

- Baseline `.\init.ps1` passed before implementation and reran web tests: 9 files / 57 tests.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests\test_music_node.py` passed: 10 tests.
- `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx graph.test.ts` passed: 2 files / 39 tests.
- `corepack pnpm --filter @xmeta/web typecheck` passed.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests` passed: 54 tests.
- `.\.venv\Scripts\python.exe -m ruff check services\api` passed.
- `corepack pnpm --filter @xmeta/web test` passed: 9 files / 58 tests.
- `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
- Live Browser E2E passed on `http://localhost:3000/workspace`: Add Audio, Generate via `music-2.6-free`, source Audio node rendered playable controls and Download, Edit audio with prompt, backend evidence switched to `minimax / music-cover-free`, source audio data URL length changed from `7626231` to `7440103`, duration changed from `178.642721` to `174.27737`, `readyState=4`, the old audio-edit not-implemented text was absent, and console warn/error logs were empty.
- Final `.\init.ps1` passed after artifact updates and reran web tests: 9 files / 58 tests.

## Findings

- No open P1/P2 findings. Residual risk: MiniMax cover output duration is provider-controlled and can remain longer than the prompt asks; durable persistence, storage, generation history, and waveform/stem editing remain later scope.

## Verdict

Accepted at 145 / 150 for Feature 8 `text-to-music-audio-node-003`.
