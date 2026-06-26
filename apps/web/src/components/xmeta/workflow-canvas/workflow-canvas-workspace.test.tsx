import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { WorkflowCanvasWorkspace } from "./workflow-canvas-workspace";

describe("WorkflowCanvasWorkspace", () => {
  it("renders the workspace route regions and honest deferred states", () => {
    const html = renderToStaticMarkup(<WorkflowCanvasWorkspace />);

    expect(html).toContain("Workflow Canvas Foundation");
    expect(html).toContain("Node palette");
    expect(html).toContain('data-workflow-canvas="viewport"');
    expect(html).toContain("Inspector");
    expect(html).toContain("Backend persistence unavailable");
    expect(html).toContain("AI execution deferred");
  });

  it("renders all planned placeholder node types in the palette", () => {
    const html = renderToStaticMarkup(<WorkflowCanvasWorkspace />);

    expect(html).toContain("Script");
    expect(html).toContain("Storyboard");
    expect(html).toContain("Character Image");
    expect(html).toContain("Prop / Asset");
    expect(html).toContain("Scene Image");
    expect(html).toContain("Image Composition");
    expect(html).toContain("Audio");
    expect(html).toContain("Video");
    expect(html).toContain("Export");
  });

  it("renders initial typed graph nodes and selectable connection labels", () => {
    const html = renderToStaticMarkup(<WorkflowCanvasWorkspace />);

    expect(html).toContain('data-workflow-node="script"');
    expect(html).toContain('data-workflow-node="storyboard"');
    expect(html).toContain('data-workflow-node="composition"');
    expect(html).toContain("Workflow connections");
    expect(html).toContain("Generate later");
  });
});
