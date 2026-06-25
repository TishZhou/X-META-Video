# Wireframing Guidelines

Use these guidelines for X-META Video screen and node wireframes. They are reusable rules for static prototypes now and API-backed implementation later.

## Global Principles

- Keep the canvas as the primary workspace for creative production.
- Use app surfaces, not chat surfaces: navigation, canvas, inspector, assets, tasks, history, and export are the core regions.
- Put planned or missing backend capability labels next to the affected control or status.
- Prefer shadcn/ui primitives already present in the app: Button, Badge, Card, and Collapsible.
- Use lucide icons consistently. Pair icons with text when the action or state is not obvious.
- Keep repeated content in shared data so node names, status labels, and route labels remain consistent.
- Use concise operational copy. Do not explain the UI when labels and hierarchy can make the function clear.

## App Shell

- Header: product name, active project/workspace label, and a visible prototype boundary badge.
- Primary navigation: overview, canvas, assets, tasks, history, export, account. Labels should match route names.
- Main region: one route goal per screen. Avoid combining canvas editing, task recovery, and account management into one overloaded screen.
- Boundary region: every prototype route needs a short static/local note that identifies missing production services.
- Exit paths: every route links back to overview and at least one next useful production surface.

## Toolbar

- Group controls by task: navigation, canvas view, node actions, generation actions, and export actions.
- Use text buttons for commands that change production state. Icon-only buttons are reserved for familiar view tools after tooltips exist.
- Primary action appears once per screen. Secondary actions use quieter button variants.
- Disabled or preview-only controls must name why they are unavailable.
- Future async actions should show queued/running/succeeded/failed feedback within 400 ms using text status.

## Node Cards

- Card header: node type, status, and short output label.
- Body: one sentence for what the node produces and one compact list of required inputs.
- Footer or trailing row: next surface, task state, and missing capability label when applicable.
- Keep card radius at the shared shadcn radius. Do not nest cards inside node cards.
- Use consistent node ordering: Script -> Storyboard -> Character/Scene/Prop -> Image Composition -> Audio -> Video -> 9-grid Storyboard -> Export.

## Inspector

- Use the inspector for selected-node details, not global project settings.
- Sections: purpose, inputs, outputs, dependencies, task status, version expectations, and planned API ownership.
- Validation errors should appear next to the affected input section.
- Retry and regenerate controls belong near task status and must preserve upstream output language.
- On mobile, the inspector stacks below the selected node summary.

## Asset Cards

- Show asset type, title, source node, version, status, and planned reuse path.
- Include prompt/model/parameters/source-rights metadata slots even when values are static examples.
- Keep image or media preview areas stable with aspect ratio constraints once real media exists.
- Empty state should direct users back to the node that can create the first asset.
- Error state should preserve filters and say which asset class failed to load.

## Tables And Lists

- Use lists or cards for small MVP datasets. Reserve wide tables for later large asset/task/history views.
- Text aligns left. Numbers, durations, and counts align right when in table form.
- On mobile, convert tables into stacked cards with the value more prominent than the label.
- Sort task lists by urgency first, then recency. Sort history by newest event first unless comparing versions.
- Every row needs a clear destination or recovery action.

## Status Regions

- Status cannot rely on color alone. Always include text such as Static, Planned, Queued, Running, Succeeded, Failed, Missing backend, or Preview only.
- Put route-level boundary notes near the page title.
- Put node/task-level errors next to the affected node or task.
- Use `aria-live="polite"` for future live task status regions.
- Failed generation copy should say what failed, what remains safe, and what retry will create.

## Node Surface Guidelines

### Script Node

- Inputs: creative brief, IP setting, style, theme, duration, target format.
- Outputs: plot summary, character profiles, dialogue or lyrics, camera notes, storyboard seed.
- Primary control: generate script plan. Feature 2 labels this as planned only.
- Status states: missing brief, ready to generate, generating, generated, failed with retry.

### Storyboard Node

- Inputs: script output, shot count, rhythm, panel format, camera intent.
- Outputs: editable shot list, scene beats, panel notes, timing.
- Primary control: build storyboard from selected script version.
- Status states: waiting for script, draft ready, needs review, failed conversion.

### Character Node

- Inputs: profile, appearance, outfit, accessories, consistency reference.
- Outputs: character image, full-body view, reusable character asset.
- Primary control: generate character asset.
- Status states: missing profile, ready, generated, consistency risk, failed.

### Scene Node

- Inputs: scene description, mood, lighting, visual style, aspect ratio.
- Outputs: background image and reusable scene asset.
- Primary control: generate scene image.
- Status states: waiting for storyboard scene, ready, generated, failed.

### Prop Node

- Inputs: prop description, style, material, scale, usage shot.
- Outputs: isolated prop asset and source metadata.
- Primary control: generate prop asset.
- Status states: optional, ready, generated, failed.

### Image Composition Node

- Inputs: character asset version, scene asset version, prop asset version, shot direction.
- Outputs: composed keyframe or character-in-scene image.
- Primary control: compose shot image.
- Status states: missing asset references, ready, composed, failed.

### Audio Node

- Inputs: dialogue, lyrics, narrator role, voice style, timing notes.
- Outputs: voice, singing, narration, or timing reference.
- Primary control: generate audio.
- Status states: missing text, ready, generated, failed provider call.

### Video Node

- Inputs: keyframes, image grid, audio, duration, motion notes.
- Outputs: short video clip and clip metadata.
- Primary control: generate clip.
- Status states: waiting for composition/audio, ready, rendering, generated, failed.

### 9-Grid Storyboard Node

- Inputs: selected shots, composed keyframes, panel order, caption rules.
- Outputs: nine-panel storyboard image or review board.
- Primary control: build 9-grid storyboard.
- Status states: missing nine panels, ready, generated, failed.

### Export Node

- Inputs: selected clips, audio track, storyboard or timeline order, format, rights checks.
- Outputs: final comic drama, MV, or short-form video artifact.
- Primary control: start export render.
- Status states: missing clips, ready, rendering, exported, renderer failed.

## Responsive And Accessibility Rules

- Desktop wireframes may show canvas and inspector side by side.
- Tablet wireframes should keep route navigation visible and stack support panels below core content.
- Mobile wireframes should present canvas as a readable node sequence with inspector details below.
- Maintain visible focus rings, descriptive link text, and clear headings.
- Avoid hidden requirements in tooltips. Put important constraints near the related control or status region.
- Use moderate density for operational screens: compact enough for scanning, spacious enough for touch targets.
