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
});
