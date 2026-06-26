# Wireframing Guidelines

These guidelines apply to the Feature 1 Web Design rebuild. They are planning rules for screens before high-fidelity implementation.

The previous Feature 2 and Feature 3 wireframes are retired. Future page work should start from this document plus `feature_tasks/1.json`.

## Global Principles

- Map each primary user task to a screen or page section.
- Give every screen a single dominant job.
- Define entry paths, exit paths, completion paths, and recovery paths.
- Put the most important content and controls in the early scan path.
- Group related controls with proximity and consistent visual treatment.
- Split overloaded screens instead of cramming unrelated functions into one page.
- Prefer familiar web app patterns for navigation, forms, tables, tabs, dialogs, drawers, filters, and status displays.
- Avoid long explanatory placeholder copy in primary layouts. Use compact labels with short detail in a dialog, drawer, popover, or expandable region when needed.

## App Shell

- Persistent regions: product/workspace identity, primary navigation, current project context, page status, and user/account access.
- Primary routes: entry, project start, workspace dashboard, canvas, assets, tasks, history, export, and account/workspace management.
- Shell navigation should never strand users; every route links back to dashboard or another next useful route.
- Route-level unavailable states should be compact and visible near the page title.

## Page Wireframe Requirements

Each page task must define:

- Primary user goal.
- Primary action.
- Secondary actions.
- Input controls.
- Output/status elements.
- Navigation elements.
- Empty state.
- Loading state.
- Error state.
- Disabled/unavailable state.
- Desktop layout.
- Mobile layout.
- Accessibility expectations.

## Canvas And Node Surfaces

- Keep the canvas as the main creative workspace.
- Represent the default production order clearly: Script, Storyboard, Character, Scene, Prop, Image Composition, Audio, Video, 9-Grid Storyboard, Export.
- A selected node must reveal inspector details without duplicating all details inside the canvas card.
- Node states need text labels for waiting, ready, generating, succeeded, failed, blocked, and missing input.
- Full drag/zoom/execution behavior belongs to later functional features unless a Web Design task explicitly pulls it into scope.

## Inspector

- Inspector sections: purpose, inputs, outputs, dependencies, generation status, version history, and unavailable production behavior.
- Validation and failure messages belong near the affected input or status row.
- Retry and regenerate controls should explain what retry creates and what upstream outputs remain safe.
- On mobile, stack the inspector below the selected node summary.

## Lists, Tables, And Cards

- Use compact lists for recent work and small task sets.
- Use tables only when comparison is important and headers remain readable.
- Convert small tables to stacked cards on mobile.
- Left-align text and right-align counts, durations, and other numeric values.
- Asset cards need stable preview dimensions for future generated media.
- Empty states should guide users to the next useful action.

## Forms And Controls

- Prefer one-column forms for readability.
- Use visible labels and field boundaries.
- Use segmented controls or tabs for a small number of mutually exclusive choices.
- Use checkboxes for independent multiple selections.
- Pair icon buttons with labels or tooltips where meaning is not universal.
- Use visible focus states and touch-friendly target sizes.

## Responsive Rules

- Desktop: allow dense work surfaces such as canvas plus inspector, dashboard plus side panel, or table plus detail panel.
- Tablet: stack secondary panels below the primary work region.
- Mobile: prioritize review and lightweight action; convert canvas/table regions into readable sequences.
- Long labels must wrap without creating horizontal overflow.
- Primary actions should remain visible near the top of each screen.

## Accessibility Rules

- Use one clear page heading per route.
- Navigation labels must match destinations.
- Status and errors must be text, not color alone.
- Important requirements must be visible near controls, not hidden only in tooltips.
- Future live generation status should use polite announcements.
- Disabled controls must state why the action is unavailable.
