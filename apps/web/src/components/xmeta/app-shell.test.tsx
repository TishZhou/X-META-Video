import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AppShell, PageContainer, PageSection } from "./app-shell";

describe("AppShell", () => {
  it("keeps the global top bar and renders page content in the app frame", () => {
    const html = renderToStaticMarkup(
      <AppShell>
        <div>Shell content</div>
      </AppShell>,
    );

    expect(html).toContain("X-META Video");
    expect(html).toContain("Shell content");
    expect(html).toContain('data-xmeta-app-shell="true"');
    expect(html).toContain("min-h-[calc(100vh-3.5rem)]");
  });

  it("provides a wider production page container with readable variants", () => {
    const wideHtml = renderToStaticMarkup(
      <PageContainer>Wide content</PageContainer>,
    );
    const readableHtml = renderToStaticMarkup(
      <PageContainer width="readable">Readable content</PageContainer>,
    );

    expect(wideHtml).toContain("max-w-[88rem]");
    expect(wideHtml).toContain('data-xmeta-page-container="wide"');
    expect(readableHtml).toContain("max-w-3xl");
    expect(readableHtml).toContain('data-xmeta-page-container="readable"');
  });

  it("wraps page sections in the shared desktop layout rhythm", () => {
    const html = renderToStaticMarkup(
      <PageSection aria-labelledby="test-title">
        <h2 id="test-title">Section title</h2>
      </PageSection>,
    );

    expect(html).toContain("Section title");
    expect(html).toContain("max-w-[88rem]");
    expect(html).toContain('data-xmeta-page-section="true"');
    expect(html).toContain('aria-labelledby="test-title"');
  });
});
