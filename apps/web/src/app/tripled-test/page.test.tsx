import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import TriplDTestPage from "./page";

const tripledSamples = [
  "glowy-waves-hero",
  "native-controls",
  "text-and-tags",
  "command-palette",
  "ai-response-typing",
  "ai-chat-interface",
  "native-hover-card",
  "preview-details-card",
  "image-slider-card",
  "cards-slider",
];

describe("TriplDTestPage", () => {
  it("renders a TriplD-only component gallery shell", () => {
    const html = renderToStaticMarkup(<TriplDTestPage />);

    expect(html).toContain('data-tripled-gallery="all-components"');
    expect(html).toContain('data-tripled-ui="original"');
    expect(html).toContain("TriplD UI");
    expect(html).toContain("Imported component samples");
  });

  it("renders every imported TriplD sample section", () => {
    const html = renderToStaticMarkup(<TriplDTestPage />);

    for (const sample of tripledSamples) {
      expect(html).toContain(`data-tripled-sample="${sample}"`);
    }
  });

  it("keeps samples free from the previous XMeta foundation wrappers", () => {
    const html = renderToStaticMarkup(<TriplDTestPage />);

    expect(html).not.toContain("Production workspace foundation");
    expect(html).not.toContain('data-xmeta-foundation="states"');
    expect(html).not.toContain('data-xmeta-foundation="rules"');
    expect(html).not.toContain('data-web-design-sequence="feature-1"');
  });

  it("includes the interactive native controls", () => {
    const html = renderToStaticMarkup(<TriplDTestPage />);

    expect(html).toContain("Native Button");
    expect(html).toContain("Native Start Now");
    expect(html).toContain("Native Tooltip");
    expect(html).toContain("Native Magnetic");
    expect(html).toContain("Native Dialog");
    expect(html).toContain("Command Palette");
    expect(html).toContain("AI Response Typing");
    expect(html).toContain("AI Chat Interface");
  });
});
