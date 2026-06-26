import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import WorkspacePage, { metadata } from "./page";

describe("WorkspacePage", () => {
  it("renders the workflow canvas foundation route", () => {
    const html = renderToStaticMarkup(<WorkspacePage />);

    expect(metadata.title).toBe("Workspace Canvas | X-META Video");
    expect(html).toContain("Untitled project");
    expect(html).toContain("Canvas 1");
    expect(html).toContain("Save local snapshot");
    expect(html).not.toContain("Node palette");
  });
});
