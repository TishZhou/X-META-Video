import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("HomePage", () => {
  it("renders the X-META Video product entry page", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("X-META Video");
    expect(html).toContain("AI comic drama");
    expect(html).toContain("MV");
    expect(html).toContain("short-form video creation");
  });

  it("does not render generic starter or messaging content", () => {
    const html = renderToStaticMarkup(<HomePage />).toLowerCase();

    expect(html).not.toContain("vite");
    expect(html).not.toContain("next.js starter");
    expect(html).not.toContain("chat");
    expect(html).not.toContain("messaging");
    expect(html).not.toContain("conversation");
  });

  it("uses the UI TripleD-inspired Framer Motion treatment", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain('data-uiux-pro-max-layout="pro-reflow"');
    expect(html).toContain('data-uitripled-source="hero-block"');
    expect(html).toContain('data-animation-runtime="framer-motion"');
    expect(html).toContain('data-uitripled-motion-system="triple-motion"');
    expect(html).toContain('data-uitripled-component="animated-background"');
    expect(html).toContain('data-uitripled-component="motion-button"');
    expect(html).toContain('data-uitripled-component="expandable-info-card"');
    expect(html.match(/aria-expanded="false"/g)?.length).toBe(4);
  });

  it("starts with a closed create-project entry point", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("Create Project");
    expect(html).toContain('aria-controls="project-start-choices"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('data-project-start-state="closed"');
    expect(html).not.toContain("Real project creation, persistence");
  });

  it("renders recent-work entry points that lead to project work", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("Recent work");
    expect(html).toContain('data-recent-work-state="local-examples"');
    expect(html).toContain('data-recent-work-entry="Neon alley comic pilot"');
    expect(html).toContain('data-recent-work-entry="Midnight chorus MV"');
    expect(html).toContain("Open project outline");
    expect(html).toContain("Open production plan");
    expect(html).toContain('href="#workspace-entry"');
    expect(html).toContain("No saved cloud projects yet");
  });

  it("renders an enter-workspace path to a clear placeholder", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("Enter Workspace");
    expect(html).toContain('aria-label="Enter the workspace placeholder"');
    expect(html).toContain('href="#workspace-entry"');
    expect(html).toContain('id="workspace-entry"');
    expect(html).toContain("Workspace entry placeholder");
    expect(html).toContain("full workspace shell");
    expect(html).toContain("later Feature 2 and Feature 3 work");
    expect(html).toContain("UI-only entry point");
  });

  it("renders the full production workflow preview", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("Creation workflow preview");
    expect(html).toContain('data-workflow-preview="production-pipeline"');
    expect(html).toContain('data-workflow-step="Script"');
    expect(html).toContain('data-workflow-step="Storyboard"');
    expect(html).toContain(
      'data-workflow-step="Character and scene assets"',
    );
    expect(html).toContain('data-workflow-step="Audio"');
    expect(html).toContain('data-workflow-step="Video"');
    expect(html).toContain('data-workflow-step="Export"');
    expect(html).toContain("Static orientation only");
  });

  it("includes accessibility and responsive section markers", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain('role="banner"');
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-labelledby="workflow-preview-title"');
    expect(html).toContain('aria-labelledby="recent-work-title"');
    expect(html).toContain('aria-labelledby="workspace-entry-title"');
    expect(html).toContain('aria-label="Create a project direction"');
    expect(html).toContain('aria-label="See creation workflow preview"');
  });
});
