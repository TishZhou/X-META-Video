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
});
