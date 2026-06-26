import { describe, expect, it } from "vitest";

import {
  getXMetaState,
  listXMetaStates,
  xmetaDesignSystem,
  xmetaStateDomains,
  xmetaStateLanguage,
} from "./design-system";

describe("xmetaDesignSystem", () => {
  it("defines reusable visual foundations for the web app", () => {
    expect(xmetaDesignSystem.typography.scale.display).toContain("tracking-normal");
    expect(xmetaDesignSystem.color.surfaces.panel).toContain("bg-xmeta-panel");
    expect(xmetaDesignSystem.spacing.layout.page).toContain("max-w-6xl");
    expect(xmetaDesignSystem.motion.classNames.interactive).toContain(
      "motion-safe:transition",
    );
    expect(xmetaDesignSystem.responsive.breakpoints.lg).toBe("1024px");
    expect(xmetaDesignSystem.accessibility.minTarget).toBe("min-h-11 min-w-11");
  });

  it("covers product state language across every required domain", () => {
    expect(xmetaStateDomains).toEqual([
      "project",
      "node",
      "asset",
      "generation",
      "history",
      "export",
    ]);

    for (const domain of xmetaStateDomains) {
      expect(listXMetaStates(domain).length).toBeGreaterThan(0);
    }
  });

  it("maps common production states to stable tones and readiness", () => {
    expect(getXMetaState("node", "selected")).toMatchObject({
      label: "Node selected",
      tone: "selected",
      readiness: "attention",
    });
    expect(getXMetaState("generation", "running")).toMatchObject({
      tone: "progress",
      readiness: "inProgress",
    });
    expect(getXMetaState("export", "ready")).toMatchObject({
      label: "Export ready",
      tone: "success",
      readiness: "ready",
    });
    expect(getXMetaState("export", "blocked")).toMatchObject({
      tone: "danger",
      readiness: "blocked",
    });
  });

  it("keeps unavailable capability language honest", () => {
    const allDescriptions = Object.values(xmetaStateLanguage)
      .flatMap((states) => Object.values(states))
      .map((state) => state.description.toLowerCase());

    expect(allDescriptions).toContain(
      "required inputs or backend capability are unavailable.",
    );
    expect(allDescriptions.join(" ")).not.toContain("auto-executes");
    expect(allDescriptions.join(" ")).not.toContain("stored permanently");
  });
});
