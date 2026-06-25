import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";

import WorkspaceAccountPage from "./account/page";
import WorkspaceAssetsPage from "./assets/page";
import WorkspaceCanvasPage from "./canvas/page";
import WorkspaceExportPage from "./export/page";
import WorkspaceHistoryPage from "./history/page";
import WorkspaceOverviewPage from "./page";
import WorkspaceTasksPage from "./tasks/page";

const render = (page: ReactElement) => renderToStaticMarkup(page);

describe("Workspace prototype routes", () => {
  it("renders a motion workspace shell with all planned route links", () => {
    const html = render(<WorkspaceOverviewPage />);

    expect(html).toContain('data-workspace-prototype="static-local"');
    expect(html).toContain('data-motion-shell="framer-route-transition"');
    expect(html).toContain('data-animation-runtime="framer-motion"');
    expect(html).toContain('data-animated-navigation="workspace-route-list"');
    expect(html).toContain('data-route-transition="/workspace"');
    expect(html).toContain(
      'data-reduced-motion-behavior="transform-disabled-labels-preserved"',
    );
    expect(html).toContain('data-workspace-navigation="route-list"');
    expect(html).toContain("Workspace dashboard");
    expect(html).toContain("Feature 3 motion shell");
    expect(html).toContain("Motion shell");
    expect(html).toContain(
      'data-default-project-context="Neon alley comic pilot"',
    );
    expect(html).toContain("No backend calls");
    expect(html).toContain("No persistence");
    expect(html).toContain('href="/workspace/canvas"');
    expect(html).toContain('href="/workspace/assets"');
    expect(html).toContain('href="/workspace/tasks"');
    expect(html).toContain('href="/workspace/history"');
    expect(html).toContain('href="/workspace/export"');
    expect(html).toContain('href="/workspace/account"');
  });

  it("records selected UI TripleD shadcn pattern mappings without Base UI variants", () => {
    const html = render(<WorkspaceOverviewPage />);

    expect(html).toContain(
      'data-motion-pattern-map="selected-ui-tripled-shadcn-patterns"',
    );
    expect(html).toContain(
      'data-motion-pattern-selection="UI TripleD animated-navigation app-shell pattern"',
    );
    expect(html).toContain(
      'data-motion-pattern-selection="UI TripleD dashboard block"',
    );
    expect(html).toContain(
      'data-motion-pattern-selection="UI TripleD project-card block"',
    );
    expect(html).toContain(
      "Selected local shadcn source for this task slice: shell",
    );
    expect(html).not.toContain(
      'data-motion-pattern-selection="UI TripleD workflow block"',
    );
    expect(html).not.toContain(
      'data-motion-pattern-selection="UI TripleD AI generation-state block"',
    );
    expect(html).toContain("Radix shadcn local source");
    expect(html).not.toContain("Base UI");
  });

  it("renders animated dashboard metrics and project card states", () => {
    const html = render(<WorkspaceOverviewPage />);

    expect(html).toContain('data-dashboard-shell="motion-first-overview"');
    expect(html).toContain('data-dashboard-metrics="animated-local-metrics"');
    expect(html).toContain('data-dashboard-metric="Workspace surfaces"');
    expect(html).toContain('data-dashboard-metric="Storyboard beats"');
    expect(html).toContain('data-dashboard-readiness="motion-signals"');
    expect(html).toContain('data-readiness-signal="Motion fallback"');
    expect(html).toContain(
      'data-project-card-baseline="animated-local-projects"',
    );
    expect(html).toContain('data-project-card="Neon alley comic pilot"');
    expect(html).toContain('data-project-card="Midnight chorus MV"');
    expect(html).toContain('data-selected-project="true"');
    expect(html).toContain('data-motion-state="hover-focus-selected"');
    expect(html).toContain('data-reduced-motion-card="transform-disabled"');
    expect(html).toContain("Project persistence missing");
    expect(html).toContain("Project persistence requires the backend Project Service");
  });

  it("renders the workflow canvas and selected node inspector", () => {
    const html = render(<WorkspaceCanvasPage />);

    expect(html).toContain("Canvas and node inspector");
    expect(html).toContain('data-workspace-canvas="static-node-chain"');
    expect(html).toContain('data-node-inspector="selected-script-node"');
    expect(html).toContain('data-node-surface="Script"');
    expect(html).toContain('data-node-surface="Storyboard"');
    expect(html).toContain('data-node-surface="Image Composition"');
    expect(html).toContain('data-node-surface="9-Grid Storyboard"');
    expect(html).toContain("No drag, zoom, edge persistence");
    expect(html).toContain("No model provider calls or task creation");
  });

  it("renders asset, task, and history prototype states", () => {
    const assetsHtml = render(<WorkspaceAssetsPage />);
    const tasksHtml = render(<WorkspaceTasksPage />);
    const historyHtml = render(<WorkspaceHistoryPage />);

    expect(assetsHtml).toContain("Reusable asset library");
    expect(assetsHtml).toContain('data-asset-library="static-local-assets"');
    expect(assetsHtml).toContain('data-asset-type="Character"');
    expect(assetsHtml).toContain('data-asset-type="Scene"');
    expect(assetsHtml).toContain("No object storage, signed URLs");

    expect(tasksHtml).toContain("Task status and retry");
    expect(tasksHtml).toContain('data-task-status="static-retry-preview"');
    expect(tasksHtml).toContain('data-task-state="Failed preview"');
    expect(tasksHtml).toContain("No Redis queue, worker");
    expect(tasksHtml).toContain("Retry creates a new attempt");

    expect(historyHtml).toContain("History and version timeline");
    expect(historyHtml).toContain('data-history-timeline="static-version-preview"');
    expect(historyHtml).toContain('data-history-version="v0.4"');
    expect(historyHtml).toContain("No audit persistence");
  });

  it("renders export readiness and account management boundaries", () => {
    const exportHtml = render(<WorkspaceExportPage />);
    const accountHtml = render(<WorkspaceAccountPage />);

    expect(exportHtml).toContain("Export and delivery preview");
    expect(exportHtml).toContain('data-export-readiness="static-checklist"');
    expect(exportHtml).toContain('data-export-gate="Video clips"');
    expect(exportHtml).toContain("Start export render unavailable");
    expect(exportHtml).toContain("No export renderer");

    expect(accountHtml).toContain("Account and workspace management");
    expect(accountHtml).toContain('data-account-boundaries="static-auth-preview"');
    expect(accountHtml).toContain('data-role-preview="Owner"');
    expect(accountHtml).toContain('data-role-preview="Viewer"');
    expect(accountHtml).toContain("No production login");
    expect(accountHtml).toContain("Backend must validate every future project");
  });

  it("keeps prototype copy product-specific and avoids generic chat surfaces", () => {
    const combinedHtml = [
      render(<WorkspaceOverviewPage />),
      render(<WorkspaceCanvasPage />),
      render(<WorkspaceAssetsPage />),
      render(<WorkspaceTasksPage />),
      render(<WorkspaceHistoryPage />),
      render(<WorkspaceExportPage />),
      render(<WorkspaceAccountPage />),
    ].join("\n").toLowerCase();

    expect(combinedHtml).toContain("x-meta video");
    expect(combinedHtml).toContain("comic drama");
    expect(combinedHtml).toContain("node canvas");
    expect(combinedHtml).not.toContain("next.js starter");
    expect(combinedHtml).not.toContain("chat");
    expect(combinedHtml).not.toContain("messaging");
    expect(combinedHtml).not.toContain("conversation");
  });

  it("includes accessibility landmarks and text status labels", () => {
    const html = render(<WorkspaceTasksPage />);

    expect(html).toContain('aria-label="Workspace routes"');
    expect(html).toContain('aria-labelledby="prototype-boundary-title"');
    expect(html).toContain('aria-labelledby="task-status-title"');
    expect(html).toContain("Queued preview");
    expect(html).toContain("Running preview");
    expect(html).toContain("Succeeded preview");
    expect(html).toContain("Failed preview");
  });
});
