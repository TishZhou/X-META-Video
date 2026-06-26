import type { WorkflowSnapshot } from "./types";

export const workflowCanvasStorageKey = "xmeta.workflowCanvas.localSnapshot";

export function serializeWorkflowGraphSnapshot(
  snapshot: WorkflowSnapshot,
): string {
  return JSON.stringify(snapshot, null, 2);
}

export function parseWorkflowGraphSnapshot(
  payload: string,
): WorkflowSnapshot {
  const parsed = JSON.parse(payload) as Partial<WorkflowSnapshot>;

  if (parsed.version !== 1) {
    throw new Error("Unsupported workflow snapshot version.");
  }

  if (!parsed.projectId || !parsed.workflowId) {
    throw new Error("Workflow snapshot is missing required identifiers.");
  }

  if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
    throw new Error("Workflow snapshot is missing graph records.");
  }

  if (!parsed.selection || !parsed.viewport) {
    throw new Error("Workflow snapshot is missing selection or viewport records.");
  }

  return parsed as WorkflowSnapshot;
}
