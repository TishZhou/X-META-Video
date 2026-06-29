import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type {
  ScriptNodeOutput,
  ScriptTaskStatusResponse,
} from "@xmeta/shared-contracts";

import { workflowNodeTemplates } from "@/lib/workflow-canvas/graph";

import {
  formatTemplateIoLabel,
  ScriptOutputTabs,
  WorkflowCanvasWorkspace,
} from "./workflow-canvas-workspace";

describe("WorkflowCanvasWorkspace", () => {
  it("renders the workspace route regions and honest deferred states", () => {
    const html = renderToStaticMarkup(<WorkflowCanvasWorkspace />);

    expect(html).toContain("Untitled project");
    expect(html).toContain("Canvas 1");
    expect(html).toContain('data-workflow-canvas="viewport"');
    expect(html).toContain('data-workspace-bottom-toolbar="true"');
    expect(html).toContain('data-workspace-boundary-label="true"');
    expect(html).toContain("Local only");
    expect(html).toContain("FastAPI deferred");
    expect(html).toContain("AI disabled");
    expect(html).not.toContain("Node palette");
    expect(html).not.toContain("Inspector");
  });

  it("keeps node creation behind one bottom add entry", () => {
    const html = renderToStaticMarkup(<WorkflowCanvasWorkspace />);

    expect(html).toContain('aria-label="Add node"');
    expect(html).toContain('data-workspace-bottom-toolbar="true"');
    expect(html).toContain('aria-label="Canvas zoom"');
    expect(html).toContain('data-workspace-zoom-range="true"');
    expect(html).toContain('type="range"');
    expect(html).toContain('min="50"');
    expect(html).toContain('max="140"');
    expect(html).toContain('step="1"');
    expect(html).not.toContain('aria-label="Select"');
    expect(html).not.toContain('aria-label="Move"');
    expect(html).not.toContain('aria-label="Fit view"');
    expect(html).not.toContain('aria-label="Zoom in"');
    expect(html).not.toContain('aria-label="Zoom out"');
    expect(html).not.toContain('data-workspace-add-menu="true"');
    expect(html).not.toContain("Node palette");
    expect(html).not.toContain("Quick add");
  });

  it("formats add-node menu labels with explicit input and output flow", () => {
    const audioTemplate = workflowNodeTemplates.find(
      (template) => template.type === "audio",
    );
    const videoTemplate = workflowNodeTemplates.find(
      (template) => template.type === "video",
    );

    expect(audioTemplate).toBeDefined();
    expect(videoTemplate).toBeDefined();
    expect(formatTemplateIoLabel(audioTemplate!)).toBe(
      "Audio: Input Dialogue -> Output Audio",
    );
    expect(formatTemplateIoLabel(videoTemplate!)).toBe(
      "Video: Input Image + Audio -> Output Video",
    );
  });

  it("renders initial typed graph nodes and the selected Script node editor", () => {
    const html = renderToStaticMarkup(<WorkflowCanvasWorkspace />);

    expect(html).toContain('data-workflow-node="script"');
    expect(html).toContain('data-workflow-node="storyboard"');
    expect(html).toContain('data-workflow-node="composition"');
    expect(html).toContain("Workflow connections");
    expect(html).toContain("Script Node API Ready");
    expect(html).toContain('data-script-node-editor="true"');
    expect(html).toContain("MV world prompt");
    expect(html).toContain("MV world description");
    expect(html).toContain("Generate");
    expect(html).toContain("Structured output");
  });

  it("renders structured Script output tabs", () => {
    const task: ScriptTaskStatusResponse = {
      task_id: "task-1",
      project_id: "local-project",
      node_id: "script-1",
      status: "succeeded",
      error: null,
    };
    const output: ScriptNodeOutput = {
      title: "Mock Script Title",
      world_overview: "A structured MV world summary.",
      storyboard_direction: {
        pov: "third-person cinematic POV",
        visual_rhythm: "soft opening, travel beat, neon performance payoff",
        shots: [
          {
            shot_number: 1,
            pov: "third-person observer",
            framing: "wide frame",
            action: "Reveal the world.",
            camera_movement: "Push in.",
            duration_seconds: 8,
          },
        ],
      },
      characters: [
        {
          name: "Lead",
          overview: "Sweet visual direction",
          style: "soft idol styling",
          clothing: "white jacket",
          height: "165 cm",
          appearance: "bright eyes",
          personality: "Decisive",
          visual_prompt: "Strong silhouette",
        },
      ],
      scene_descriptions: [
        {
          scene_number: 1,
          shot_reference: 1,
          characters: ["Lead"],
          location: "desert jeep",
          description: "A concrete scene description.",
          visual_prompt: "Opening frame",
        },
      ],
      missing_inputs: [],
    };
    const html = renderToStaticMarkup(
      <ScriptOutputTabs output={output} task={task} />,
    );

    expect(html).toContain("Overview");
    expect(html).toContain("Storyboard");
    expect(html).toContain("Characters");
    expect(html).toContain("Scenes");
    expect(html).toContain("Mock Script Title");
    expect(html).toContain("Lead");
    expect(html).toContain("third-person cinematic POV");
    expect(html).toContain("desert jeep");
    expect(html).toContain("Opening frame");
  });
});
