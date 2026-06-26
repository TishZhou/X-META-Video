import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("HomePage", () => {
  it("renders the landing prototype hero and launch anchor", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("X-META Video");
    expect(html).toContain("AI comic drama and MV");
    expect(html).toContain("creation workspace");
    expect(html).toContain('href="#creation-entries"');
    expect(html).toContain("Launch Studio");
    expect(html).toContain("Creative paths");
    expect(html).toContain('aria-label="Hero feature tag cloud"');
    expect(html).not.toContain("Prototype boundary");
    expect(html).not.toContain("Prototype entry surface");
    expect(html).not.toContain("Feature 2");
    expect(html).not.toContain("Feature 3");
    expect(html).not.toContain("UI TripleD redo");
    expect(html).not.toContain("static workspace");
  });

  it("renders exactly three feature slider entries", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("Fast");
    expect(html).toContain("Assets Library");
    expect(html).toContain("Block-Based Pipeline");
    expect(html.match(/role="tab"/g)).toHaveLength(3);
    expect(html).toContain('<span class="sr-only">Assets Library</span>');
  });

  it("renders the two creation entry cards with revealed-detail content in markup", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("Comic Drama Creation");
    expect(html).toContain("MV Creation");
    expect(html).toContain("Start Comic Drama");
    expect(html).toContain("Start MV");
    expect(html).toContain("do not create, store, or export media");
  });

  it("does not render the TriplD test gallery on the root route", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain('href="/tripled-test"');
    expect(html).toContain("Open TriplD gallery");
    expect(html).not.toContain('data-tripled-gallery="all-components"');
    expect(html).not.toContain("Imported component samples");
  });
});
