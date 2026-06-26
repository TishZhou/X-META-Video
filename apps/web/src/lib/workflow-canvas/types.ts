export type WorkflowNodeType =
  | "script"
  | "storyboard"
  | "character"
  | "asset"
  | "scene"
  | "composition"
  | "audio"
  | "video"
  | "export";

export type WorkflowDataType =
  | "brief"
  | "script"
  | "storyboard"
  | "character"
  | "asset"
  | "scene"
  | "image"
  | "audio"
  | "video"
  | "export";

export type WorkflowPortDirection = "input" | "output";

export type WorkflowNodeStatus = "placeholder" | "ready" | "blocked";

export type WorkflowPoint = {
  x: number;
  y: number;
};

export type WorkflowPortDefinition = {
  key: string;
  label: string;
  direction: WorkflowPortDirection;
  dataType: WorkflowDataType;
  accepts?: WorkflowDataType[];
};

export type WorkflowPort = WorkflowPortDefinition & {
  id: string;
  nodeId: string;
};

export type WorkflowNode = {
  id: string;
  type: WorkflowNodeType;
  title: string;
  description: string;
  status: WorkflowNodeStatus;
  position: WorkflowPoint;
  ports: WorkflowPort[];
};

export type WorkflowEdgeStatus = "valid" | "selected" | "invalid" | "disabled";

export type WorkflowEdge = {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  dataType: WorkflowDataType;
  status: WorkflowEdgeStatus;
  label: string;
};

export type WorkflowSelection =
  | { kind: "node"; id: string }
  | { kind: "edge"; id: string }
  | { kind: "empty" };

export type WorkflowViewport = {
  x: number;
  y: number;
  zoom: number;
};

export type WorkflowDraftStatus = "clean" | "dirty" | "saved" | "restored";

export type WorkflowSnapshot = {
  version: 1;
  projectId: string;
  workflowId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selection: WorkflowSelection;
  viewport: WorkflowViewport;
};

export type WorkflowGraphState = WorkflowSnapshot & {
  draftStatus: WorkflowDraftStatus;
  notice: string;
  savedSnapshot: WorkflowSnapshot | null;
  nextNodeIndex: number;
  nextEdgeIndex: number;
};

export type ConnectionResult =
  | { ok: true; edge: WorkflowEdge }
  | { ok: false; reason: string };

