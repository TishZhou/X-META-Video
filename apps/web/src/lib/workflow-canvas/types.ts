import type {
  TextGenerationInputSource,
  TextGenerationTask,
} from "@xmeta/shared-contracts";

export type WorkflowNodeType =
  | "data"
  | "script"
  | "storyboard"
  | "image"
  | "composition"
  | "audio"
  | "video"
  | "export";

export type WorkflowDataType =
  | "brief"
  | "script"
  | "storyboard"
  | "character"
  | "mv_look"
  | "asset"
  | "scene"
  | "image"
  | "audio"
  | "video"
  | "export";

export type DataNodeKind = "text" | "image" | "audio";

export type WorkflowPortDirection = "input" | "output";

export type WorkflowNodeStatus =
  | "placeholder"
  | "running"
  | "ready"
  | "blocked";
export type WorkflowNodeRole = "source" | "outcome";

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
  available?: boolean;
};

export type WorkflowPort = WorkflowPortDefinition & {
  id: string;
  nodeId: string;
};

export type WorkflowNode = {
  id: string;
  type: WorkflowNodeType;
  role: WorkflowNodeRole;
  title: string;
  description: string;
  status: WorkflowNodeStatus;
  position: WorkflowPoint;
  ports: WorkflowPort[];
  output?: WorkflowNodeOutput;
};

export type WorkflowNodeOutput = {
  sourceNodeId: string;
  dataType: WorkflowDataType;
  label: string;
  task?: TextGenerationTask;
  inputSource?: TextGenerationInputSource;
  promptTemplateId?: string;
  provider?: string | null;
  model?: string | null;
  outputVariant?: string;
  editable: boolean;
  media?: WorkflowMediaOutput;
};

export type WorkflowMediaOutput = {
  kind: "image" | "audio" | "video";
  url?: string | null;
  b64Json?: string | null;
  b64Audio?: string | null;
  hex?: string | null;
  mimeType?: string | null;
  durationMs?: number | null;
  alt: string;
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
