# Sprint Contract - Feature 3 Script Provider Truth

## Sprint Overview

**Sprint:** feature-3-script-provider-truth
**Feature:** Feature 3, Script Node
**Status:** in_progress
**Goal:** Make Script node AI interactions prove and display the actual backend text provider/model used, so the product no longer presents a frontend model label as if it were a live LLM connection.

## Write Scope

- `packages/shared-contracts/src/index.ts`
- `services/api/xmeta_api/schemas.py`
- `services/api/xmeta_api/store.py`
- `services/api/xmeta_api/main.py`
- `services/api/tests/test_script_node.py`
- `apps/web/src/lib/script-node/api.ts`
- `apps/web/src/components/xmeta/workflow-canvas/workflow-canvas-workspace.tsx`
- `apps/web/src/components/xmeta/workflow-canvas/workflow-canvas-workspace.test.tsx`
- `docs/API.md`
- `feature_tasks/3.json`
- `feature_list.json`
- `sprint-contract.md`
- `evaluator-rubric.md`
- `progress.md`
- `session-handoff.md`
- `C:/Users/AI/.codex/skills/verify/SKILL.md`

Protected existing edits:

- Preserve unrelated pre-existing working tree changes including `.env.example`, `AGENTS.md`, `docs/PRODUCT.md`, `pnpm-workspace.yaml`, and untracked `scripts/`.

## In Scope

- Add backend-returned `model` evidence to Script generation tasks and Script dialogue responses.
- Keep the web app calling FastAPI only; no frontend model-provider calls.
- Replace the misleading default `gpt-5.4-mini` frontend selector label with a server-configured label.
- Display backend-confirmed provider/model in the Script response panel after chat or generation.
- Show mock execution honestly when the backend falls back to the mock provider.
- Add tests and Browser E2E evidence that validate the UI against backend-returned provider/model, not static frontend copy.
- Update the verify skill with this rule for future AI/provider work.

## Out of Scope

- Supplying real production credentials in this repo.
- Streaming/SSE performance.
- Durable chat persistence.
- Full dialogue-history synthesis into the final generation prompt.
- Media model execution.
- Mobile UI polish.

## Acceptance Criteria

1. Script chat response includes `provider` and `model` from resolved backend settings.
2. Script generation task status includes `provider` and `model` from resolved backend settings.
3. The initial UI no longer claims `gpt-5.4-mini` as a frontend-selected model before backend confirmation.
4. After Send or Generate, the response panel shows backend-confirmed provider/model; mock provider is visibly identified as mock backend execution.
5. Tests cover backend response metadata, frontend rendering, and the absence of misleading static model claims.
6. Browser E2E verifies the open `/workspace` product against the backend response path.
7. `verify` skill records the new AI/provider verification rule.

## Sprint Log

| Phase | Outcome |
| --- | --- |
| Baseline | Confirmed `D:\X-META-Video`, read startup docs, product, architecture, Feature 3 task state, recent commits, and verify skill. |
| Startup | `.\init.ps1` passed before implementation and reran web tests: 9 files / 39 tests. |
| Planning | User reported the product still looked like a frontend placeholder and was not visibly connected to their LLM. The missing piece was the AI modify reply content itself: the response panel needed to prove whether the assistant text came from mock or a live backend provider. User clarified `.env.example` is the current real local env file. |
| Backend | Added `model` to Script dialogue responses and Script generation task state; changed mock defaults to `local-script-mock`; added process env, `.env`, `services/api/.env`, and `.env.example` reading for FastAPI provider config, with tests disabling dotenv loading to avoid accidental live calls. |
| Frontend | The Script response panel now shows backend-confirmed provider/model beside AI modify replies and generated ScriptOutput. Mock replies use `AI修改 · mock backend`; live provider replies show `Backend: openai / gpt-5.4-mini`. |
| Verify skill | Added an AI/provider verification rule requiring visible AI reply content to be checked against backend provider/model metadata and current config. |
| Focused verification | `.\.venv\Scripts\python.exe -m pytest services\api\tests\test_script_node.py` passed: 23 tests. `.\.venv\Scripts\python.exe -m ruff check services\api` passed. `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx` passed: 1 file / 16 tests. `corepack pnpm --filter @xmeta/web typecheck` passed. |
| Full verification | `corepack pnpm --filter @xmeta/web test` passed: 9 files / 40 tests. `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`. |
| API preflight | Restarted the local FastAPI process and confirmed `POST /api/v1/projects/local-project/nodes/script-1/chat` reads `.env.example`, calls the live OpenAI-compatible provider, and returns assistant content with `provider: openai` and `model: gpt-5.4-mini`. |
| Browser E2E | Passed on the user's already-open in-app browser tab at `http://localhost:3000/workspace`: initial UI had no static `gpt-5.4-mini` claim; AI modify opened conversation mode with backend waiting state; Send produced a natural-language assistant reply with `Backend: openai / gpt-5.4-mini`; no `Script AI turn` mock text or mock backend label appeared; console warn/error logs were empty. |
| Evaluation | Main evaluation accepts `script-node-009` at 150 / 150 after live provider preflight and Browser E2E. |
| Final startup | Final `.\init.ps1` passed after artifact updates and reran web tests: 9 files / 40 tests. |
