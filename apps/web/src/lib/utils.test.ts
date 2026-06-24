import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("merges conditional class names", () => {
    expect(cn("flex", false && "hidden", "items-center")).toBe("flex items-center");
  });

  it("resolves Tailwind class conflicts with the later value", () => {
    expect(cn("p-2 text-sm", "p-4")).toBe("text-sm p-4");
  });
});
