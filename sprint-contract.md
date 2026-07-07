# Sprint Contract - Feature 3 Script Node AI Dialogue Closure

## Sprint Overview

**Sprint:** feature-3-ai-dialogue-script-closure
**Feature:** Feature 3, Script Node
**Status:** passing
**Goal:** Verify that Feature 3 task coverage matches the current requirement and close the remaining implementation gaps for a Script node that can generate a full script through the AI dialogue composer.

## Write Scope

- `apps/web/src/components/xmeta/workflow-canvas/workflow-canvas-workspace.tsx`
- `apps/web/src/components/xmeta/workflow-canvas/workflow-canvas-workspace.test.tsx`
- `services/api/xmeta_api/main.py`
- `services/api/xmeta_api/providers.py`
- `services/api/tests/test_script_node.py`
- `feature_tasks/3.json`
- `feature_list.json`
- `sprint-contract.md`
- `evaluator-rubric.md`
- `progress.md`
- `session-handoff.md`

Protected existing edits:

- Preserve unrelated pre-existing working tree changes, including `AGENTS.md`, `pnpm-workspace.yaml`, and any user-authored artifact edits not required by this Feature 3 closure.

## In Scope

- Check `feature_tasks/3.json` against the current Feature 3 requirement: the feature must include both the canvas Script node and the AI dialogue flow that generates script output.
- Keep the selected Script node as the inline canvas composer, not a detached modal or floating editor.
- Keep a single MV world-view prompt as the Script node input.
- Make `AI modify` open the conversation panel and run the same Script generation path as the Generate action.
- Ensure generated output appears as an assistant-style dialogue reply while the structured `ScriptOutput` remains available for downstream nodes.
- Ensure server-side Script generation can honor saved Script node settings for provider/model/temperature while still defaulting safely to env/mock configuration.
- Remove misleading global UI copy that says all AI is disabled now that Feature 3 has a real Script AI path; keep deferred media/backend boundaries honest.
- Add focused tests for the settings/provider behavior and the visible boundary text.

## Out of Scope

- Durable PostgreSQL persistence, queue workers, object storage, auth, asset lineage, and multi-user permission boundaries.
- Storyboard node editing, image generation, audio generation, video generation, export rendering, and asset library behavior.
- Live provider execution with a real API key.
- Mobile UI polish.

## Acceptance Criteria

1. `feature_tasks/3.json` explicitly records the Script node plus AI dialogue script-generation requirement.
2. `/workspace` shows Feature 3 honestly: Script AI can generate a response, while media AI and production persistence remain deferred.
3. `AI modify` and Generate both route through the Script generation flow and reveal the conversation history panel.
4. Backend generation uses the saved Script node provider/model/temperature settings when present, with env defaults as fallback.
5. Mock remains the default verification provider and succeeds without external credentials.
6. OpenAI/openai-compatible still require server-side credentials and fail clearly without leaking secrets.
7. Focused frontend and backend tests cover the closure.
8. Final evidence is recorded in `feature_list.json`, `feature_tasks/3.json`, `sprint-contract.md`, `evaluator-rubric.md`, `progress.md`, and `session-handoff.md`.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | Confirmed working directory `D:\X-META-Video`; read `AGENTS.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `feature_list.json`, `feature_tasks/3.json`, `progress.md`, `session-handoff.md`, `sprint-contract.md`, and recent commits. |
| Startup | `.\init.ps1` passed before implementation and reran web tests: 9 files / 37 tests. |
| Task audit | `feature_tasks/3.json` already covers the canvas Script node, inline AI composer, AI response history, structured script output, and OpenAI text provider hookup, but the implementation still had two closure gaps: misleading `AI disabled` boundary copy and backend run behavior ignoring saved node settings. |
| Frontend closure | `AI修改` now calls the same Script generation handler as Generate while preserving `revise` response mode; Generate preserves `generation` response mode. The workspace boundary label now says `Local workflow only / Script AI enabled / media AI and persistence deferred`. |
| Backend closure | `run_script_node` resolves saved Script node provider/model/temperature settings before creating the provider, with server env supplying base URL, credentials, timeout, and retry defaults. |
| Verification | Backend pytest passed with `.\\.venv\\Scripts\\python.exe -m pytest services\\api\\tests`: 20 tests. Focused workspace test passed: 1 file / 14 tests. Full web test passed: 9 files / 38 tests. Web typecheck passed. API ruff passed. JSON validation passed for `feature_list.json` and `feature_tasks/3.json`. |
| Rendered QA | HTTP route smoke for `http://127.0.0.1:3000/workspace` returned 200. The first Browser attempt was blocked because direct tool navigation to `localhost:3000` hit Browser use URL policy. Follow-up Browser E2E passed on the user's already-open in-app browser tab at `http://localhost:3000/workspace`: page identity matched, Script AI boundary was visible, old `AI disabled` copy was absent, `AI修改` accepted a new prompt, the response panel showed revise mode and generated mock Script reply, the Script node stayed ready, no framework overlay appeared, and no new warn/error logs were recorded. |
| Build | `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`. |
| Evaluation | Evaluation subagent accepted Feature 3 closure at 143 / 150. Main follow-up corrected the current-state progress boundary label and added successful Browser E2E evidence; final recorded rubric score is 147 / 150. |
| Final startup | Final `.\init.ps1` passed after artifact updates and reran web tests: 9 files / 38 tests. |
