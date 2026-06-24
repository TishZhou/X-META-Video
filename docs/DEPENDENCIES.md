# Dependencies

This document records the initial dependency boundary for the X-META Video monorepo.

## Runtime Stack

| Area | Dependency | Reason |
|---|---|---|
| Frontend | Next.js App Router + React + TypeScript | Page routing, layouts, SSR/static rendering, and canvas workflow UI |
| Web BFF | Next.js Route Handlers / Server Components | Thin browser-safe proxy and rendering layer over FastAPI; no direct domain persistence |
| UI | Tailwind CSS + shadcn/ui source components + UI TripleD shadcn blocks | Enterprise UI primitives and polished reusable page/block patterns |
| UI motion | Framer Motion | Add only when a selected UI TripleD block requires motion primitives |
| Canvas | `@xyflow/react` | Node-based workflow editor |
| Frontend data | Server Components, Next.js Route Handlers, `@tanstack/react-query`, `axios`, `zustand` | Server rendering, browser cache, request client, local UI state |
| Forms | `react-hook-form`, `zod` | Typed validation and form state |
| Backend API | FastAPI, Uvicorn, Pydantic | Python API layer |
| Database | PostgreSQL, SQLAlchemy, Alembic, Psycopg | Durable project/account/task state |
| Queue/cache | Redis, RQ | Async task queue and status cache |
| Storage | S3/MinIO, Boto3 | Generated media artifacts |
| Observability | structlog | Structured logs |

## Files

| File | Purpose |
|---|---|
| `.env.example` | Server, worker, database, queue, storage, and model provider environment contract |
| `.gitignore` | Keeps secrets, dependencies, generated media, and build output out of Git |
| `package.json` | Root PNPM workspace scripts |
| `pnpm-workspace.yaml` | Frontend/shared package workspace |
| `apps/web/package.json` | Next.js web app dependencies |
| `apps/web/.env.example` | Browser-safe Next.js public variables only |
| `apps/web/components.json` | shadcn/ui project configuration |
| `services/api/pyproject.toml` | FastAPI backend dependencies |
| `services/worker/pyproject.toml` | Async worker dependencies |
| `docker-compose.yml` | Local PostgreSQL, Redis, and MinIO |

## Environment Files

There are two `.env.example` files on purpose:

- Root `.env.example`: backend, worker, database, Redis, S3/MinIO, auth secrets, model provider keys.
- `apps/web/.env.example`: browser-exposed Next.js public variables only. These must use `NEXT_PUBLIC_` and must never contain secrets.
- Server-only Next.js variables may exist for BFF/proxy behavior, but provider keys, database URLs, storage credentials, and queue credentials belong to FastAPI, workers, or deployment secrets, not browser-exposed variables.

Do not add separate API or worker `.env.example` files unless those services need a different deployment contract later.

## shadcn/ui And UI TripleD Note

`shadcn/ui` is not used like a normal component library dependency. The CLI copies component source into the app. The project therefore needs:

- `apps/web/components.json`
- Tailwind config and global CSS variables
- Runtime dependencies such as Radix primitives, `class-variance-authority`, `clsx`, `tailwind-merge`, and `lucide-react`

UI TripleD is also source-oriented for this project. Use it as a curated block and component reference, not as a full runtime dependency:

- Source: `https://github.com/moumen-soliman/uitripled`
- Docs: `https://ui.tripled.work`
- Prefer its shadcn/ui implementations.
- Do not use Base UI variants unless the architecture is deliberately changed to include Base UI.
- Copy only selected blocks/components into `apps/web`, then normalize imports, aliases, icons, Tailwind tokens, accessibility labels, and responsive behavior.
- Add `framer-motion` only when the selected copied block actually imports it.
- Keep copied UI TripleD code local and reviewable; do not treat upstream examples as trusted project code until they pass local lint, typecheck, and visual review.

When adding actual UI components later, use:

```powershell
pnpm dlx shadcn@latest add button card dialog input select tabs sheet dropdown-menu
```

## Install Later

Do not commit generated dependency folders or local secrets.

Expected future install commands:

```powershell
pnpm install
cd services/api; python -m venv .venv; .\.venv\Scripts\pip install -e ".[dev]"
cd services/worker; python -m venv .venv; .\.venv\Scripts\pip install -e ".[dev]"
docker compose up -d postgres redis minio
```
