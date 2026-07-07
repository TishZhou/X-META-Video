# Session Handoff

## Verified Now

- Repository root: `D:\X-META-Video`
- Feature 1 `Web Design`, Feature 2 `Workflow Canvas Foundation`, and Feature 3 `Script Node` are recorded as `passing`.
- Feature 3 current task is `script-node-008`, recorded as `passing`.
- Current broader unfinished feature remains Feature 4 `Storyboard Node`; full editable shot-list schema, shot editing, durable persistence, queue workers, and generated storyboard assets remain future work.
- Pre-existing unrelated working tree edits were preserved: `.env.example`, `AGENTS.md`, `docs/PRODUCT.md`, `pnpm-workspace.yaml`, and untracked `scripts/`.

## Feature 3 Dual-Mode State

- The selected Script node now has two explicit modes.
- Direct mode: users type a prompt and click Generate to run structured ScriptOutput generation.
- Conversation mode: users click `AI modify` to open `AI对话`; this does not send the prompt.
- Conversation mode shows a separate `发送` button. Only `发送` calls the backend chat route and appends user/assistant turns.
- Generate remains visible in conversation mode and exits the conversation state when running structured generation.
- The backend chat route remains `POST /api/v1/projects/{project_id}/nodes/{node_id}/chat`; no backend contract changed in this pass.

## Verification Evidence

- Baseline `.\init.ps1` passed before implementation and reran web tests: 9 files / 38 tests.
- `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx` passed: 1 file / 15 tests.
- `corepack pnpm --filter @xmeta/web typecheck` passed.
- `corepack pnpm --filter @xmeta/web test` passed: 9 files / 39 tests.
- `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
- Backend chat preflight against `POST /api/v1/projects/local-project/nodes/script-1/chat` returned a mock assistant reply.
- Browser E2E passed on the user's in-app browser tab at `http://localhost:3000/workspace`: no Send before AI modify; direct Generate produced Ready ScriptOutput; AI modify opened AI dialogue guidance without sending; Send produced `Script AI turn 1`; Generate remained visible; no framework overlay or console warn/error logs.
- Final `.\init.ps1` passed after artifact updates and reran web tests: 9 files / 39 tests.

## Boundaries

- No live OpenAI request was made because no API key was supplied; OpenAI-compatible chat and generation remain covered with mocked HTTP tests from `script-node-007`.
- The current dialogue is request/response from the UI perspective, not SSE/WebSocket streaming.
- Conversation history is not yet automatically summarized into the generation prompt; users can refine the main prompt before Generate.
- Durable chat persistence, production auth, queue workers, task event streaming, object storage, asset lineage, generated media, and export remain later feature scope.

## Next Commands

- Startup: `.\init.ps1`
- Backend tests: `.\\.venv\\Scripts\\python.exe -m pytest services\\api\\tests`
- Backend lint: `.\\.venv\\Scripts\\python.exe -m ruff check services\\api`
- Web test: `corepack pnpm --filter @xmeta/web test`
- Web typecheck: `corepack pnpm --filter @xmeta/web typecheck`
- Web build: `corepack pnpm --filter @xmeta/web build`
