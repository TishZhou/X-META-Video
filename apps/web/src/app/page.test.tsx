import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("HomePage reset skeleton", () => {
  it("renders the code-defined workspace foundation", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("X-META Video");
    expect(html).toContain("Production workspace foundation");
    expect(html).toContain('data-web-reset="true"');
    expect(html).toContain('data-web-design-system="code-defined"');
    expect(html).toContain('data-web-design-sequence="feature-1"');
    expect(html).toContain('href="#state-language"');
  });

  it("shows the new Feature 1 design sequence", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("Foundational component selection");
    expect(html).toContain("Interface design system");
    expect(html).toContain("Wireframing and screen inventory");
    expect(html).toContain("Page-by-page detailed implementation");
  });

  it("renders shared production state language for every required domain", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain('data-xmeta-state-domain="project"');
    expect(html).toContain('data-xmeta-state-domain="node"');
    expect(html).toContain('data-xmeta-state-domain="asset"');
    expect(html).toContain('data-xmeta-state-domain="generation"');
    expect(html).toContain('data-xmeta-state-domain="history"');
    expect(html).toContain('data-xmeta-state-domain="export"');
    expect(html).toContain("Node selected");
    expect(html).toContain("Generation blocked");
    expect(html).toContain("Export ready");
  });

  it("uses shared layout and feedback primitives", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain('data-xmeta-foundation="states"');
    expect(html).toContain('data-xmeta-foundation="rules"');
    expect(html).toContain('data-xmeta-token-list="Responsive shell"');
    expect(html).toContain('data-xmeta-token-list="Accessible feedback"');
    expect(html).toContain("Missing backend, persistence");
  });

  it("does not render removed Feature 2 or Feature 3 prototype content", () => {
    const html = renderToStaticMarkup(<HomePage />).toLowerCase();

    expect(html).not.toContain("workspace dashboard");
    expect(html).not.toContain("stock portfolio dashboard");
    expect(html).not.toContain("ui tripled copied shadcn");
    expect(html).not.toContain("motion workspace");
    expect(html).not.toContain("static workspace prototype");
  });
});
