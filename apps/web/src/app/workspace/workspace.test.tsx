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
  it("renders a static workspace shell with all planned route links", () => {
    const html = render(<WorkspaceOverviewPage />);

    expect(html).toContain('data-workspace-prototype="static-local"');
    expect(html).toContain('data-workspace-navigation="route-list"');
    expect(html).toContain("Workspace overview");
    expect(html).toContain("Feature 2 interface prototype");
    expect(html).toContain("No backend calls");
    expect(html).toContain("No persistence");
    expect(html).toContain('href="/workspace/canvas"');
    expect(html).toContain('href="/workspace/assets"');
    expect(html).toContain('href="/workspace/tasks"');
    expect(html).toContain('href="/workspace/history"');
    expect(html).toContain('href="/workspace/export"');
    expect(html).toContain('href="/workspace/account"');
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
