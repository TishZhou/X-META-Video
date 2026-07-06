# Evaluator Rubric - Feature 3 Script Node API Hookup

Updated: 2026-07-06

## Evaluation Scope

- Role: Evaluation subagent, with main-agent artifact recording.
- Target: Feature 3 `Script Node` OpenAI text-provider hookup and four-category model env contract.
- Required read set: `AGENTS.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/API.md`, `feature_list.json`, `feature_tasks/3.json`, `sprint-contract.md`, `progress.md`, and changed backend/provider files.
- Evaluation basis: sprint acceptance criteria, architecture boundaries, provider neutrality, secret safety, mock-provider continuity, and actual verification output.

## Scorecard

| Criterion | Points | Current | Evidence |
| --- | ---: | ---: | --- |
| Generic provider boundary | 15 | 15 | Script Node still calls `ScriptProvider.generate(...) -> ScriptOutput`; route logic is not OpenAI-specific. |
| OpenAI text execution | 25 | 25 | `OpenAICompatibleScriptProvider` posts to `{base_url}/responses`, uses configured model/input/temperature, parses output text, strips fenced JSON, and validates `ScriptOutput`. |
| Env contract clarity | 20 | 19 | `.env.example` and `docs/API.md` expose text, image, video, and music slots; image/video/music are labeled config-only. One minor precision gap remains for legacy temperature env error naming. |
| Mock and failure behavior | 15 | 14 | Mock remains default; missing key, invalid numeric env, unsupported provider, invalid provider output, missing output text, and HTTP failures are covered. |
| Verification coverage | 20 | 20 | Backend pytest, backend ruff, web test, JSON validation, `git diff --check`, and final startup path are recorded. |
| Artifact evidence | 5 | 5 | Feature list, feature task, sprint contract, rubric, progress, and handoff are updated for this Feature 3 optimization. |

Current score: 98 / 100 after artifact closure.

## Findings

- Initial P1 artifact finding resolved: current evidence is recorded in `feature_list.json`, `feature_tasks/3.json`, `sprint-contract.md`, `evaluator-rubric.md`, `progress.md`, and `session-handoff.md`.
- Initial P2 invalid env finding resolved: invalid numeric text-model env values now raise `ProviderConfigurationError` and route responses return clear `503` configuration errors.
- Initial P2 unsupported provider finding resolved: non-mock providers are limited to `openai` and `openai-compatible`.
- Initial P3 failure-coverage gap resolved for invalid numeric env, unsupported provider, missing output text, invalid JSON, schema-invalid JSON, and HTTP failure.
- Remaining P3: when a bad legacy `SCRIPT_MODEL_TEMPERATURE` fallback is used, the error message names the new `TEXT_MODEL_TEMPERATURE` env. This is acceptable for the new contract and does not affect normal setup.

## Verification Evidence

- Baseline `.\init.ps1` passed before implementation and reran web tests: 9 files / 33 tests.
- `.\\.venv-api\\Scripts\\python.exe -m pytest services/api/tests` passed: 17 tests with one upstream Starlette TestClient deprecation warning.
- `.\\.venv-api\\Scripts\\python.exe -m ruff check services/api` passed.
- `corepack pnpm --filter @xmeta/web test` passed: 9 files / 33 tests.
- JSON validation passed for `feature_list.json` and `feature_tasks/3.json`.
- `git diff --check` passed with LF/CRLF warnings only.
- Evaluation subagent re-scored source behavior at 96/100 with no open P1/P2 findings before final artifact closure.
- Final `.\init.ps1` passed after artifact updates and reran web tests: 9 files / 33 tests.

## Verdict

Passing for the approved Feature 3 OpenAI text-provider hookup scope. Image, video, and music generation remain unimplemented and are documented as configuration slots only.
