# Session Handoff

## Verified Now

- Repository root: `D:\X-META-Video`
- Feature 1 `Web Design`, Feature 2 `Workflow Canvas Foundation`, and Feature 3 `Script Node` are recorded as `passing`.
- Feature 3 current task is `script-node-009`, recorded as `passing`.
- Current broader unfinished feature remains Feature 4 `Storyboard Node`; full editable shot-list schema, shot editing, durable persistence, queue workers, and generated storyboard assets remain future work.
- Pre-existing unrelated working tree edits were preserved: `.env.example`, `AGENTS.md`, `docs/PRODUCT.md`, `pnpm-workspace.yaml`, and untracked `scripts/`.

## Feature 3 Provider Truth State

- Direct mode: users type a prompt and click Generate to run structured ScriptOutput generation.
- Conversation mode: users click `AI modify` to open `AI对话`; this does not send the prompt.
- Conversation mode shows a separate `发送` button. Only `发送` calls `POST /api/v1/projects/{project_id}/nodes/{node_id}/chat` and appends user/assistant turns.
- Script dialogue responses and Script generation tasks now return backend-resolved `provider` and `model`.
- The response panel shows backend evidence beside AI replies. Mock replies are labeled `AI修改 · mock backend`; live replies show `Backend: openai / gpt-5.4-mini`.
- FastAPI reads provider config from process env, root `.env`, `services/api/.env`, or this repo's current real-env `.env.example` fallback.
- The verify skill was updated: future AI/provider verification must compare visible reply content with backend provider/model metadata and record whether the path was mock, unavailable, or live provider-backed.

## Verification Evidence

- Baseline `.\init.ps1` passed before implementation and reran web tests: 9 files / 39 tests.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests\test_script_node.py` passed: 23 tests with one Starlette TestClient deprecation warning.
- `.\.venv\Scripts\python.exe -m ruff check services\api` passed.
- `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx` passed: 1 file / 16 tests.
- `corepack pnpm --filter @xmeta/web typecheck` passed.
- `corepack pnpm --filter @xmeta/web test` passed: 9 files / 40 tests.
- `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
- API preflight against `POST /api/v1/projects/local-project/nodes/script-1/chat` read `.env.example`, called the live OpenAI-compatible provider, and returned assistant content with `provider: openai` and `model: gpt-5.4-mini`.
- Browser E2E passed on the user's in-app browser tab at `http://localhost:3000/workspace`: initial UI had no static `gpt-5.4-mini` claim; `AI modify` opened backend-waiting conversation state; Send produced a natural-language assistant reply with `Backend: openai / gpt-5.4-mini`; no `Script AI turn` mock text, mock backend label, or console warn/error logs.

## Boundaries

- Live OpenAI-compatible Script dialogue works through `.env.example` in the current local runtime. Tests disable dotenv loading so unit tests do not call the live provider.
- Current dialogue remains request/response from the UI perspective, not SSE/WebSocket streaming.
- Conversation history is not yet automatically summarized into the generation prompt; users can refine the main prompt before Generate.
- Durable chat persistence, production auth, queue workers, task event streaming, object storage, asset lineage, generated media, and export remain later feature scope.

## Next Commands

- Startup: `.\init.ps1`
- Backend tests: `.\.venv\Scripts\python.exe -m pytest services\api\tests`
- Backend lint: `.\.venv\Scripts\python.exe -m ruff check services\api`
- Web test: `corepack pnpm --filter @xmeta/web test`
- Web typecheck: `corepack pnpm --filter @xmeta/web typecheck`
- Web build: `corepack pnpm --filter @xmeta/web build`
