# Session Handoff

## Verified Now

- What is currently working: root PowerShell startup verification path.
- What verification actually ran: `.\init.ps1` completed successfully after the Next.js config alignment and UI TripleD documentation updates.
- Evidence: Vitest ran `apps/web/src/lib/utils.test.ts` with 2 passing tests.

## Changed This Session

- Code or behavior added: none; this was documentation and configuration alignment only.
- Frontend platform guidance: `apps/web` is now documented as a Next.js App Router + React app.
- UI source guidance: shadcn/ui remains the base local component system; UI TripleD shadcn blocks are the preferred external source for polished sections and components.
- Dependency guidance: UI TripleD should be copied and adapted as local source, not installed as an opaque runtime package. Add `framer-motion` only when a selected copied block imports it.

## Broken Or Unverified

- Known defect: no Next.js app scaffold exists yet, so `next build` is not expected to pass until the app directory structure is migrated.
- Unverified path: no UI TripleD component has been copied or visually inspected yet.
- Risk for the next session: choose the shadcn/ui variant from UI TripleD, not Base UI, unless architecture is changed first.
- Commit status: not committed.

## Next Best Step

- Highest-priority unfinished task: implement `main-page-001` from `feature_tasks/1.json`.
- Why it is next: it creates the visible product entry page before adding create-project, recent-work, workspace-entry, workflow-preview, responsive, and accessibility refinements.
- Recommended UI approach: choose one UI TripleD shadcn block or page section, copy only the needed source into `apps/web`, normalize aliases/tokens/icons, and verify locally.
- What must not change during that step: backend, canvas, project persistence, AI generation, asset library, and unrelated task files.

## Commands

- Startup: `.\init.ps1`
- Verification: `corepack pnpm --filter @xmeta/web test`
- Next binary check: `.\apps\web\node_modules\.bin\next.CMD --version`
