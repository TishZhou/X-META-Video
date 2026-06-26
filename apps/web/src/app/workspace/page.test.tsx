import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import WorkspacePage, { metadata } from "./page";

describe("WorkspacePage", () => {
  it("renders the workflow canvas foundation route", () => {
    const html = renderToStaticMarkup(<WorkspacePage />);

    expect(metadata.title).toBe("Workspace Canvas | X-META Video");
    expect(html).toContain("Comic drama and MV workflow canvas");
    expect(html).toContain("Node palette");
    expect(html).toContain("Save local snapshot");
  });
});
