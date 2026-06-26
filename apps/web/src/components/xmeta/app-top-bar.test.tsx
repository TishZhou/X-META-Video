import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AppTopBar } from "./app-top-bar";

describe("AppTopBar", () => {
  it("renders reusable page navigation and account context", () => {
    const html = renderToStaticMarkup(<AppTopBar />);

    expect(html).toContain("X-META Video");
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/#creation-entries"');
    expect(html).toContain('href="/tripled-test"');
    expect(html).toContain("Studio Admin");
  });
});
