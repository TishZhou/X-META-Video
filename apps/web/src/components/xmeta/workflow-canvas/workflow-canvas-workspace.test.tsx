import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { WorkflowCanvasWorkspace } from "./workflow-canvas-workspace";

describe("WorkflowCanvasWorkspace", () => {
  it("renders the workspace route regions and honest deferred states", () => {
    const html = renderToStaticMarkup(<WorkflowCanvasWorkspace />);

    expect(html).toContain("Untitled project");
    expect(html).toContain("Canvas 1");
    expect(html).toContain('data-workflow-canvas="viewport"');
    expect(html).toContain('data-workspace-bottom-toolbar="true"');
    expect(html).not.toContain("Node palette");
    expect(html).not.toContain("Inspector");
  });

  it("keeps node creation behind one bottom add entry", () => {
    const html = renderToStaticMarkup(<WorkflowCanvasWorkspace />);

    expect(html).toContain('aria-label="Add node"');
    expect(html).toContain('data-workspace-bottom-toolbar="true"');
    expect(html).not.toContain('data-workspace-add-menu="true"');
    expect(html).not.toContain("Node palette");
    expect(html).not.toContain("Quick add");
  });

  it("renders initial typed graph nodes and selectable connection labels", () => {
    const html = renderToStaticMarkup(<WorkflowCanvasWorkspace />);

    expect(html).toContain('data-workflow-node="script"');
    expect(html).toContain('data-workflow-node="storyboard"');
    expect(html).toContain('data-workflow-node="composition"');
    expect(html).toContain("Workflow connections");
    expect(html).toContain("《我在盛唐写天下》");
  });
});
