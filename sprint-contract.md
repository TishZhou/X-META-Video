# Sprint Contract - Feature 3 Script Node API Hookup

## Sprint Overview

**Sprint:** feature-3-openai-provider-hookup
**Feature:** Feature 3, Script Node
**Status:** in_progress
**Goal:** Keep the Script Node agent/provider interface generic while wiring the text path to OpenAI's API and adding server-side environment configuration for text, image, video, and music model categories.

## Write Scope

- `services/api/xmeta_api/providers.py`
- `services/api/tests/test_script_node.py`
- `.env.example`
- `docs/API.md` only for provider/env contract updates
- `feature_tasks/3.json`
- `feature_list.json`
- `sprint-contract.md`
- `evaluator-rubric.md`
- `progress.md`
- `session-handoff.md`

Protected existing edits:

- `AGENTS.md` and `pnpm-workspace.yaml` are already modified in the working tree and must not be reverted.

## In Scope

- Preserve `ScriptProvider.generate(...) -> ScriptOutput` as the Script Node's generic provider interface.
- Keep `mock` as the default verification provider.
- Add an OpenAI text provider path for Script Node generation through the Responses API.
- Parse provider text as JSON and validate it into the existing `ScriptOutput` Pydantic contract.
- Add `.env.example` slots for four model categories: text, image, video, and music.
- Ensure image, video, and music are configuration-only in this pass; no new generation routes or user-visible claims are added.
- Fail clearly when OpenAI text generation is selected but required credentials or model settings are missing.

## Out of Scope

- Implementing Character Image, Scene Image, Audio, Video, Export, Asset Library, queue workers, durable persistence, or object storage.
- Frontend UI changes.
- Real end-to-end provider execution with a live API key.
- Claiming OpenAI music generation is production-ready. OpenAI docs cover audio/speech, while a dedicated music generation endpoint is not documented in the checked official pages.

## Acceptance Criteria

1. Script Node still passes with the mock provider by default.
2. Setting the text provider to OpenAI requires only server-side env plus a user-supplied API key.
3. OpenAI text calls use the configured text model, base URL, timeout, and retry settings.
4. OpenAI provider output is parsed as structured JSON and validated into `ScriptOutput`.
5. Missing OpenAI provider config returns a clear `503` message without leaking secrets.
6. `.env.example` documents text, image, video, and music model configuration using OpenAI-first defaults where the API is documented, and explicit placeholders where not implemented.
7. Verification evidence is recorded in `feature_list.json`, `feature_tasks/3.json`, `sprint-contract.md`, `evaluator-rubric.md`, `progress.md`, and `session-handoff.md`.

## Verification Plan

1. Baseline: `.\init.ps1` before implementation.
2. Backend tests: bundled Python pytest under `services/api`.
3. Backend lint: bundled Python ruff under `services/api`.
4. Frontend safety: `corepack pnpm --filter @xmeta/web test`.
5. Typecheck/build if source impact reaches shared/frontend contracts.
6. JSON validation: parse `feature_list.json` and `feature_tasks/3.json`.
7. Whitespace check: `git diff --check`.
8. Final restart path: `.\init.ps1`.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | Confirmed working directory `D:\X-META-Video`; read `AGENTS.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `feature_list.json`, `progress.md`, `feature_tasks/3.json`, `sprint-contract.md`, `evaluator-rubric.md`, and recent commits. |
| Startup | `.\init.ps1` passed before implementation and reran web tests: 9 files / 33 tests. |
| Official docs | Checked current OpenAI docs: text generation uses Responses API examples with `client.responses.create`; model guidance recommends smaller variants such as `gpt-5.4-mini` or `gpt-5.4-nano` for latency/cost; image generation is documented separately; video generation is documented under Sora; no dedicated music generation endpoint was found in the checked official audio docs. |
| Subagents | Acting subagent assigned to provider/env/test implementation scope; evaluation subagent reserved for post-implementation review. |
| Implementation | Replaced the non-executing OpenAI-compatible Script Node provider stub with a real server-side text provider using the configured `/responses` endpoint, `TEXT_MODEL_*` env, `OPENAI_API_KEY` fallback, legacy `SCRIPT_MODEL_*` compatibility, JSON/fenced-JSON parsing, and `ScriptOutput` validation. |
| Env contract | `.env.example` and `docs/API.md` now define text, image, video, and music model categories. Text defaults to OpenAI API base URL and `gpt-5.4-mini` when selected; image/video/music remain configuration slots only. |
| Backend verification | `.\\.venv-api\\Scripts\\python.exe -m pytest services/api/tests` passed 17 tests with one upstream Starlette TestClient deprecation warning; `.\\.venv-api\\Scripts\\python.exe -m ruff check services/api` passed. |
| Frontend safety | `corepack pnpm --filter @xmeta/web test` passed 9 files / 33 tests. |
| JSON and diff | JSON validation passed for `feature_list.json` and `feature_tasks/3.json`; `git diff --check` passed with LF/CRLF warnings only. |
| Evaluation loop | Evaluation subagent initially scored 82/100 and flagged stale artifacts plus invalid numeric env and unsupported-provider behavior. The source fixes now return clear provider config errors, reject unsupported providers, and add failure-path coverage for invalid env, unsupported provider, missing output text, invalid JSON, schema-invalid JSON, and HTTP failure. Re-evaluation scored source behavior 96/100 with no open P1/P2 findings. |
| Final startup | Final `.\init.ps1` passed after artifact updates and reran web tests: 9 files / 33 tests. |
