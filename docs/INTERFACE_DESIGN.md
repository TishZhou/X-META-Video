# Interface Design

Feature 1 owns the rebuilt web design foundation for X-META Video.

## Current Component Baseline

`web-design-001` installed the selected TriplD shadcn source components under `apps/web/src/components/uitripled`; required base shadcn source components live under `apps/web/src/components/ui`.

Use `docs/TRIPLED_COMPONENT_GUIDE.md` as the concise map for where each installed TriplD component belongs.

## Assumptions

- Primary user: a creator or production operator building AI comic dramas, MVs, or short-form videos.
- Product type: dense creative production web app, not a marketing-only site.
- Core task: move from MV world-view prompt to node workflow, generated assets, task status, history, and export readiness.
- Missing backend capabilities must stay clearly labeled and disabled until later feature work implements them.

## Screen Set

| Screen | Primary task |
| --- | --- |
| Entry and project start | Choose a production direction and start a project context. |
| Workspace dashboard | Review active project context, recent work, readiness, and next actions. |
| Workflow canvas | Build and inspect the script-to-export node chain. |
| Asset library | Browse generated/planned characters, scenes, props, audio, video, and exports. |
| Export readiness | Check creative and technical gates before final output. |
| Account | Review auth, organization, personal info. |

## Implementation Notes

- Use installed TriplD components first for interactive visual patterns.
- Keep dense production pages readable and restrained; reserve stronger hero/motion treatments for entry and project-start surfaces.
- Do not restore deleted Feature 2/3 prototypes as the active UI baseline.
- Do not imply backend, persistence, generation, storage, history, or export behavior exists before later features implement it.
