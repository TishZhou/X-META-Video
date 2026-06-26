# Dependencies

This document records the initial dependency boundary for the X-META Video monorepo.

## Runtime Stack

| Area | Dependency | Reason |
|---|---|---|
| Frontend | Next.js App Router + React + TypeScript | Page routing, layouts, SSR/static rendering, and canvas workflow UI |
| Web BFF | Next.js Route Handlers / Server Components | Thin browser-safe proxy and rendering layer over FastAPI; no direct domain persistence |
| UI | Tailwind CSS + component approach selected in Feature 1 | Enterprise UI primitives and reusable product-specific page patterns |
| UI motion | Framer Motion or selected motion approach | Motion and feedback support route, panel, canvas, node, task, and generation states when selected by the design system |
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

## Component Library Note

Feature 1 Web Design owns the component approach decision. `web-design-001` installed the user-provided TriplD shadcn component set as the approved component baseline for future design and page implementation. The concise usage record lives in `docs/TRIPLED_COMPONENT_GUIDE.md`.

This is a source-install strategy, not a runtime UI kit dependency. TriplD source lives under `apps/web/src/components/uitripled`; required base shadcn source lives under `apps/web/src/components/ui`.

Do not assume the deleted local shadcn primitives or deleted UI TripleD redo files are the new baseline.

The installed strategy uses:

- `apps/web/components.json`
- Tailwind config and global CSS variables
- Runtime dependencies such as Radix primitives, `class-variance-authority`, `clsx`, `tailwind-merge`, and `lucide-react`

The shadcn CLI also installed required base source components: `avatar`, `badge`, `button`, `card`, and `dialog`.

## Install Later

Do not commit generated dependency folders or local secrets.

Expected future install commands:

```powershell
pnpm install
cd services/api; python -m venv .venv; .\.venv\Scripts\pip install -e ".[dev]"
cd services/worker; python -m venv .venv; .\.venv\Scripts\pip install -e ".[dev]"
docker compose up -d postgres redis minio
```
