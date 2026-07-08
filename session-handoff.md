# Session Handoff

## Verified Now

- Repository root: `D:\xmeta video\X-META-Video`
- Feature 1 `Web Design`, Feature 2 `Workflow Canvas Foundation`, and Feature 3 `Script Node` are recorded as `passing`.
- Feature 3 current task is `script-node-009`, recorded as `passing`.
- Current active feature on branch `zheng` is Feature 15 `Production Auth And Workspace Management`; `auth-account-002`, `auth-account-003`, `auth-account-004`, and `auth-account-005` are recorded as `passing`.
- Feature 4 `Storyboard Node` is paused for branch coordination and should resume in its own workstream.
- Pre-existing unrelated working tree edits were preserved: `.env.example`, `AGENTS.md`, `docs/PRODUCT.md`, `pnpm-workspace.yaml`, and untracked `scripts/`.

## Feature 3 Provider Truth State

- Direct mode: users type a prompt and click Generate to run structured ScriptOutput generation.
- Conversation mode: users click `AI modify` to open `AI对话`; this does not send the prompt.
- Conversation mode shows a separate `发送` button. Only `发送` calls `POST /api/v1/projects/{project_id}/nodes/{node_id}/chat` and appends user/assistant turns.
- Script dialogue responses and Script generation tasks now return backend-resolved `provider` and `model`.
- The response panel shows backend evidence beside AI replies. Mock replies are labeled `AI修改 · mock backend`; live replies show `Backend: openai / gpt-5.4-mini`.
- FastAPI reads provider config from process env, root `.env`, `services/api/.env`, or this repo's current real-env `.env.example` fallback.
- The verify skill was updated: future AI/provider verification must compare visible reply content with backend provider/model metadata and record whether the path was mock, unavailable, or live provider-backed.

## Feature 15 Account Backend State

- Branch `zheng` now contains the Feature 15 backend account foundation for `auth-account-002` and `auth-account-003`.
- Added account persistence for users, organizations, memberships, refresh sessions, and development outbox tokens through SQLAlchemy and Alembic.
- Added `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`, `GET /api/v1/accounts`, and `POST /api/v1/accounts/active`.
- Registration creates a default workspace and owner membership. Sessions use the HttpOnly `xmeta_session` cookie and auth responses do not expose access or refresh tokens.
- Membership roles are durable lowercase values: owner, admin, editor, viewer. Development outbox invite tokens default to editor.
- `auth-account-004` adds backend actor context and RBAC for existing Script Node and Task APIs.
- Script Node save/chat/run now require owner/admin/editor. Viewer can read same-workspace task status/result but cannot write or generate.
- MVP in-memory project/task state is bound to the active organization on first write so another workspace cannot access a guessed project ID or task ID.
- Account UI, OAuth provider routes, production email delivery, Billing, durable project persistence, and task retry/cancel routes remain future slices.
- `auth-account-005` scope is limited to login, registration, workspace selection, real top-bar account state, disabled OAuth Coming soon controls, and frontend API cookie-session compatibility.
- `auth-account-005` added `/account/login`, `/account/register`, and `/account/workspaces`; added a frontend auth API client; connected `AuthAwareTopBar`; removed the fake `Studio Admin` top-bar state; added shared account contracts; and added `credentials: include` to protected Script/Task frontend requests.
- `auth-account-006` is recorded as passing and includes backend-backed account center APIs plus `/account` UI for profile, workspace settings, members, security/password flows, disabled OAuth placeholders, Owner-only Billing Coming soon, and sign out.
- Registration UX has been corrected: users enter email, name, password, and confirm password; both password fields can be shown/hidden; registration no longer asks for workspace name; successful registration goes to `/account`, not workspace selection or the canvas. The backend still creates a default workspace and Owner membership for account context, and workspace naming is handled later in workspace settings.

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
- Feature 15 backend verification: `.\.venv\Scripts\python.exe -m pytest tests` passed 31 tests with one StarletteDeprecationWarning; `.\.venv\Scripts\python.exe -m ruff check xmeta_api tests` passed; Alembic upgrade smoke passed with SQLite in-memory `DATABASE_URL`; JSON validation passed for `feature_list.json` and `feature_tasks/15.json`; `corepack pnpm --filter @xmeta/web test` passed 9 files / 40 tests; `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`; `apps/web` direct `corepack pnpm exec tsc --noEmit` passed; `git diff --check` passed with CRLF warnings only; final `.\init.ps1` passed with 9 web files / 40 tests.
- Feature 15 evaluator round 2 accepted the backend slice at 145 / 150.
- Feature 15 RBAC verification: `.\.venv\Scripts\python.exe -m pytest tests\test_script_node_auth.py tests\test_script_node.py -q` passed 29 tests; `.\.venv\Scripts\python.exe -m pytest tests -q` passed 37 tests with one StarletteDeprecationWarning; `.\.venv\Scripts\python.exe -m ruff check xmeta_api tests` passed; Alembic smoke, JSON validation, git diff hygiene, web tests, web build, web typecheck, and final `.\init.ps1` passed.
- Feature 15 evaluator accepted `auth-account-004` at 145 / 150.
- Feature 15 auth UI verification: Focused auth/top-bar tests passed 4 files / 9 tests; full web tests passed 11 files / 45 tests; standalone web typecheck passed; web build passed with account routes; Browser E2E passed register -> workspace selection -> workspace; JSON validation passed; `git diff --check` passed with CRLF warnings only; explicit shared-contracts file typecheck passed; final `.\init.ps1` passed with 11 web files / 45 tests.
- Feature 15 evaluator fallback accepted `auth-account-005` at 144 / 150 after evaluator subagent failed due platform usage limit.
- Feature 15 account center verification: backend full pytest passed 42 tests; web full tests passed 12 files / 48 tests; web typecheck passed; web build passed; backend ruff passed; revised register/account Browser E2E passed with temporary SQLite FastAPI and Next dev servers; final `.\init.ps1` passed with 12 files / 48 tests.
- Feature 15 account center evaluator: round 1 failed at 136 / 170, fix round closed the non-manager `/account` loading bug and stale artifact issues, round 2 failed due platform usage limit, and main-agent fallback accepted at 160 / 170.

## Boundaries

- Live OpenAI-compatible Script dialogue works through `.env.example` in the current local runtime. Tests disable dotenv loading so unit tests do not call the live provider.
- Current dialogue remains request/response from the UI perspective, not SSE/WebSocket streaming.
- Conversation history is not yet automatically summarized into the generation prompt; users can refine the main prompt before Generate.
- Durable chat persistence, queue workers, task event streaming, object storage, asset lineage, generated media, and export remain later feature scope.
- Feature 15 remaining slice: `auth-account-007` closure evidence.

## Next Commands

- Startup: `.\init.ps1`
- Backend tests: `.\.venv\Scripts\python.exe -m pytest services\api\tests`
- Backend lint: `.\.venv\Scripts\python.exe -m ruff check services\api`
- Web test: `corepack pnpm --filter @xmeta/web test`
- Web typecheck: `corepack pnpm --filter @xmeta/web typecheck`
- Web build: `corepack pnpm --filter @xmeta/web build`
