# Dependencies

This document records the initial dependency boundary for the X-META Video monorepo.

## Runtime Stack

| Area | Dependency | Reason |
|---|---|---|
| Frontend | React + Vite + TypeScript | Canvas workflow UI and fast local dev |
| UI | Tailwind CSS + shadcn/ui source components | Enterprise UI primitives |
| Canvas | `@xyflow/react` | Node-based workflow editor |
| Frontend data | `@tanstack/react-query`, `axios`, `zustand` | API cache, request client, local UI state |
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
| `apps/web/package.json` | React frontend dependencies |
| `apps/web/.env.example` | Browser-safe Vite variables only |
| `apps/web/components.json` | shadcn/ui project configuration |
| `services/api/pyproject.toml` | FastAPI backend dependencies |
| `services/worker/pyproject.toml` | Async worker dependencies |
| `docker-compose.yml` | Local PostgreSQL, Redis, and MinIO |

## Environment Files

There are two `.env.example` files on purpose:

- Root `.env.example`: backend, worker, database, Redis, S3/MinIO, auth secrets, model provider keys.
- `apps/web/.env.example`: browser-exposed Vite variables only. These must use `VITE_` and must never contain secrets.

Do not add separate API or worker `.env.example` files unless those services need a different deployment contract later.

## shadcn/ui Note

`shadcn/ui` is not used like a normal component library dependency. The CLI copies component source into the app. The project therefore needs:

- `apps/web/components.json`
- Tailwind config and global CSS variables
- Runtime dependencies such as Radix primitives, `class-variance-authority`, `clsx`, `tailwind-merge`, and `lucide-react`

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
