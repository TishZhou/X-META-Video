# Interface Design

Feature 2 defines the first static interface shape for X-META Video. The web app pages in this feature are local prototypes only: they show navigation, hierarchy, status language, and page intent, but they do not create projects, authenticate users, call model providers, persist assets, enqueue jobs, stream task updates, or render exports.

## Page Function Map

| Surface | Route or region | User goal | Primary task | Prototype status and backend boundary |
| --- | --- | --- | --- | --- |
| Entry | `/` | Understand the product and enter production work. | Choose a production direction or open the workspace prototype. | Implemented as a product entry page. Project creation remains static/local until project persistence exists. |
| Workspace overview | `/workspace` | See the active production plan and where to continue. | Open canvas, assets, tasks, history, export, or account preview. | Static project summary only. No saved workspace state or project service is connected. |
| Workflow canvas | `/workspace/canvas` | See the node-based production chain. | Review script, storyboard, asset, audio, video, and export nodes plus inspector guidance. | Static canvas and inspector. No drag, zoom, edge persistence, dependency execution, or model orchestration is implemented. |
| Node configuration | Canvas inspector region | Understand what a selected node needs and produces. | Review inputs, outputs, task feedback, and reuse links for the selected script node example. | Static configuration preview. Real validation, autosave, generation, retry, and version selection belong to later API-backed features. |
| Asset library | `/workspace/assets` | Find reusable character, scene, prop, audio, video, and export assets. | Browse local example assets and inspect source metadata expectations. | Static asset cards. No storage, signed URLs, rights metadata persistence, or project-scoped lookup is connected. |
| Task status and retry | `/workspace/tasks` | See generation progress and recover from failures. | Review queued, running, succeeded, and failed task states. | Static status rows. No Redis queue, worker, SSE, retry mutation, cancellation, or task event API is connected. |
| Generation history and version timeline | `/workspace/history` | Understand creative lineage and selected versions. | Review generation attempts, version changes, and recoverable timeline events. | Static timeline. No audit log, immutable generation attempts, version rollback, or history API is connected. |
| Export readiness | `/workspace/export` | Check whether the production is ready to assemble. | Review clip/audio/readiness gates and planned export settings. | Static readiness checklist. No export renderer, media assembly, file storage, or delivery link is implemented. |
| Auth preview | `/workspace/account` | Understand login and membership boundaries. | Review planned account, role, and workspace-management model. | Static preview only. Production auth, RBAC, billing, invitations, and membership changes remain backend-owned. |
| Workspace management | `/workspace/account` | Manage organization context and project access. | Review workspace roles, project access, and handoff boundaries. | Static organization preview. No membership mutation or project access API is connected. |

## MVP Screen Inventory

### Entry Page

- Purpose: introduce X-META Video as a node-based AI production workspace for comic drama, MV, and short-form video creation.
- Primary action: enter `/workspace`.
- Secondary actions: choose a static project direction, review production modes, inspect the creation workflow preview.
- Empty/loading/error notes: recent work uses local examples plus an honest "no saved cloud projects yet" state. No loading or error state is shown because no remote data is requested.

### Workspace Overview

- Purpose: orient the user after entry and make the MVP surfaces reachable.
- Primary action: open the workflow canvas.
- Secondary actions: open asset library, task status, history, export, and account preview.
- Empty/loading/error notes: active project summary is local sample content. Missing project persistence is labeled in a visible boundary note.

### Workflow Canvas

- Purpose: make the canvas the central creative workspace.
- Primary action: review the selected script node and its downstream dependencies.
- Secondary actions: inspect node status, planned inputs, planned outputs, and downstream surfaces.
- Empty/loading/error notes: canvas is a static layout. Future empty state should show "add first node" and "start from brief"; future error state should be task-scoped, not page-scoped.

### Node Inspector

- Purpose: show how users configure, generate, retry, save, and reuse node output once backend services exist.
- Primary action: review the selected node configuration.
- Secondary actions: inspect inputs, outputs, dependencies, version expectations, and missing capabilities.
- Empty/loading/error notes: missing input and failed generation states must be attached to the selected node. Error copy must explain what failed and what the user can retry.

### Asset Library

- Purpose: collect reusable generated assets by type and source.
- Primary action: inspect local example assets.
- Secondary actions: filter by asset class, trace prompt/model metadata, and plan reuse.
- Empty/loading/error notes: future empty states should invite generating from the canvas; future loading states should use card skeletons; future errors should preserve known local filters.

### Task Status and Retry

- Purpose: let users monitor async generation without losing upstream work.
- Primary action: identify blocked or failed work and planned retry path.
- Secondary actions: review queued/running/succeeded tasks and read status details.
- Empty/loading/error notes: future empty state means no active generation tasks. Failure states must not imply upstream assets were deleted.

### Generation History and Version Timeline

- Purpose: expose generation attempts, selected outputs, and creative lineage.
- Primary action: review selected version and recent changes.
- Secondary actions: compare prompt/model metadata and plan rollback or selection.
- Empty/loading/error notes: future empty state starts after first saved creative event. Error state should say history could not be loaded and leave current project view intact.

### Export

- Purpose: make final assembly readiness visible before users start export rendering.
- Primary action: review readiness gates.
- Secondary actions: review planned format, duration, clip, audio, and rights checks.
- Empty/loading/error notes: future export errors should separate missing inputs from renderer failure. Feature 2 does not render or download media.

### Account and Workspace Management

- Purpose: preview production auth, roles, and organization boundaries.
- Primary action: review workspace and role model.
- Secondary actions: inspect planned login, active organization, members, and access notes.
- Empty/loading/error notes: no production login is implemented. Future auth failure should route users back to login without exposing project data.

## Information Architecture

Primary entry starts at `/`. The entry page links to `/workspace`, which is the first app surface. Every workspace route includes a persistent route list back to overview, canvas, assets, tasks, history, export, and account preview so no screen is a dead end.

The workspace hierarchy is:

1. `/workspace` as the orientation hub.
2. `/workspace/canvas` as the central production surface.
3. Contextual support routes: `/workspace/assets`, `/workspace/tasks`, `/workspace/history`, `/workspace/export`.
4. Organization and auth preview: `/workspace/account`.

Core paths:

- Entry path: `/` -> `/workspace` -> `/workspace/canvas`.
- Asset reuse path: `/workspace/canvas` -> `/workspace/assets` -> `/workspace/canvas`.
- Task recovery path: `/workspace/canvas` -> `/workspace/tasks` -> `/workspace/history` or back to `/workspace/canvas`.
- Export path: `/workspace/canvas` -> `/workspace/export` -> `/workspace/history`.
- Account path: any workspace route -> `/workspace/account` -> `/workspace`.

The app shell owns navigation and local UI state. FastAPI remains the future authority for authentication, membership, RBAC, project state, task creation, asset queries, history, and export jobs.

## Wireframe Descriptions

### Entry

Layout: product identity and production workflow preview first, with clear buttons for project direction and workspace entry. Recent work sits below the first viewport as local examples, followed by the Feature 2 workspace bridge.

Feedback: all non-production actions are labeled as static or UI-only.

### Workspace Overview

Layout: compact app header, route navigation, project summary, production mode cards, readiness highlights, and boundary note. The main action opens the canvas. Secondary route cards link to the supporting surfaces.

Feedback: missing persistence and backend services are visible in a dedicated status region.

### Workflow Canvas and Inspector

Layout: two-column desktop layout with a canvas preview on the left and selected-node inspector on the right. The canvas uses node cards and dependency connectors represented as static grouped rows. The inspector lists inputs, outputs, task status, and missing execution capabilities.

Feedback: node states use labels and descriptive text, not color alone.

### Asset Library

Layout: filter summary row, asset card grid, and metadata expectations. Cards show type, status, source node, version, and planned reuse path.

Feedback: local examples are marked static. Storage and signed URL support are labeled missing.

### Tasks

Layout: status summary, task rows, retry rules, and failure handling notes. Rows preserve upstream-result language so users understand retry creates a new attempt.

Feedback: status copy names queued, running, succeeded, and failed states.

### History

Layout: vertical timeline with version badges, event titles, metadata, selected-output markers, and recovery notes.

Feedback: history is shown as static lineage, with audit persistence labeled planned.

### Export

Layout: readiness checklist, planned export settings, missing renderer boundary, and final action disabled or labeled preview-only.

Feedback: readiness separates missing creative inputs from missing backend export rendering.

### Account and Workspace Management

Layout: account boundary summary, active organization preview, role matrix, and planned auth flow. Login and membership management are shown as future backend-backed surfaces.

Feedback: no production auth claim is made; preview data is local.

## Responsive Notes

- Desktop: use a two-column canvas plus inspector and dense route navigation.
- Tablet: stack inspector below canvas and keep route links visible in a wrapping row.
- Mobile: prioritize review and light editing. Canvas editing is represented as a readable node list because full drag/zoom editing belongs to later canvas work.
- Tables become cards on narrow screens. Long labels wrap instead of forcing horizontal overflow.
- Primary actions remain near the top of each screen; secondary actions appear after context.

## Accessibility Notes

- Each route uses one main landmark and section headings tied to visible content.
- Navigation links use clear names that match destination pages.
- Status is communicated with text labels plus badges, not color alone.
- Prototype-only and missing-capability notes are visible text, not tooltips.
- Buttons and links use descriptive labels. Icon-only controls are avoided in Feature 2.
- Future async regions should use `aria-live="polite"` for task progress and error recovery messages.

## Planned And Missing Backend Boundaries

Feature 2 intentionally does not implement:

- Production authentication, sessions, organization switching, invitations, RBAC, or billing.
- Project creation, autosave, persistence, optimistic concurrency, or account-scoped queries.
- Workflow graph persistence, drag and zoom canvas behavior, dependency execution, or node input validation.
- Model gateway calls for text, image, audio, or video generation.
- Redis queue, workers, task mutation, cancellation, retries, SSE, or WebSocket updates.
- Asset storage, signed URLs, source rights persistence, or cross-project reuse queries.
- History persistence, audit trails, immutable generation attempts, or rollback.
- Export rendering, media assembly, downloads, or delivery links.

Those capabilities remain future work owned by the architecture layers described in `docs/ARCHITECTURE.md`.
