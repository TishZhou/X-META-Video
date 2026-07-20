# X-META Video Product

## Product Goal

X-META Video is a canvas-based AI creation platform for comic dramas, MVs, and short-form video. Users connect visible nodes, choose each node's task, inspect intermediate artifacts, and reuse approved results. The product should make complex creation controllable and repeatable rather than hide it behind an opaque autonomous agent.

## Phase 1: Four Creation Nodes

Phase 1 has exactly four creation Node kinds. A Node defines the media capability; its `taskId` defines the concrete operation. Different steps in an IPMV workflow reuse the same Node kind with different Tasks.

| Node | Phase 1 Task groups | Output |
| --- | --- | --- |
| **Text** | IP world view, character profiles, MV look, script, shot list/storyboard, image/video prompt compilation, music brief and lyrics, revision | Editable structured text and shot data |
| **Image** | Character base/face/full-body/look, props and scenes, storyboard/keyframes and candidates, image edit and consistency repair | Image artifacts with source metadata |
| **Audio** | Music generation and preview; music edit or cover when the provider supports it | Playable audio artifacts |
| **Video** | Image-to-video, first/last-frame, reference-guided clip, regenerate/extend; deterministic batch generation over approved shots | Playable clips or provider task references |

The Task registry is the source of truth for what is currently enabled. The present backend implements a smaller subset of this Phase 1 plan: five Text profiles, three Image profiles, one Audio profile, and one Video profile. Unregistered Tasks must not appear as available.

## Canvas and Task Control

Manual canvas operation is the default:

1. The user adds and connects Nodes.
2. The user explicitly selects a Task on each Node.
3. The Node stores that `taskId` with its workflow state.
4. Generate runs only the selected Task against connected inputs and approved memory.
5. The result becomes a versioned Artifact that can feed downstream Nodes.

The model may reason about content inside a Task, but it does not silently select another Task, edit graph topology, choose a paid model, increase generation count, or start downstream work.

One-click generation is a visible, deterministic Workflow Preset, not an autonomous canvas agent. It creates a known Text -> Image -> Audio -> Video graph with predefined Tasks and dependencies. Users can inspect or edit the graph, and costly or consequential stages remain explicit approval points.

## Execution Strategies

The Phase 1 Task contract assigns one execution strategy; the strategy field and dispatch are target Runtime work:

- `direct`: compile inputs and prompt, call one model capability, validate, and save. This is the default for image, audio, and video generation.
- `pipeline`: run fixed engineering steps such as generation, schema validation, duration calculation, and bounded repair. Storyboard planning and batch fan-out fit here.
- `bounded_agent`: allow an approved Task to choose only from declared tools within step, cost, and retry limits. This is exceptional in Phase 1, not the default.

Model reasoning produces content. Agentic execution coordinates tools and corrective steps around that model call. If the steps are known in advance, X-META uses `direct` or `pipeline` rather than adding an Agent loop.

## Data and Platform Capabilities

Inputs and outputs are Data/Artifacts, not additional Agent Node kinds. An Artifact records its project, source Node and Task, input/output versions, provider/model/prompt metadata, lineage, and content or storage reference.

Clip/shot splitting is structured Text output plus deterministic workflow processing. Export is a platform rendering action. Input capture, Artifact display, history, task status, and retry are canvas/platform capabilities. None creates an Input, Clip, Export, Asset, Composition, Storyboard, or 3D Agent Node in Phase 1.

## Later Phases

- **Phase 2:** add a durable Asset Library, LoRA-backed model options, and a 3D character/world adapter. These extend storage, providers, and existing Tasks; they do not require a fifth creation Node.
- **Phase 3:** add music/voice models when stable interfaces exist, plus an IP operations assistant and community features. Publishing, campaigns, approvals, and other consequential actions require visible human confirmation.

## Phase 1 Success Criteria

- A user can build or load a visible IPMV workflow using only the four creation Node kinds.
- Every run has an explicit Task, exact inputs, inspectable status, and a traceable Artifact.
- Successful upstream results survive downstream failure and can be regenerated or reused by version.
- One-click generation remains editable and deterministic; no hidden graph or spending changes occur.
- Missing provider, persistence, orchestration, or model capabilities are labeled honestly.
