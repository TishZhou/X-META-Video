import type {
  ConnectionResult,
  WorkflowDataType,
  WorkflowEdge,
  WorkflowGraphState,
  WorkflowNode,
  WorkflowNodeOutput,
  WorkflowNodeStatus,
  WorkflowNodeType,
  WorkflowPoint,
  WorkflowPort,
  WorkflowPortDefinition,
  WorkflowSelection,
  WorkflowSnapshot,
  WorkflowViewport,
} from "./types";

type NodeTemplate = {
  type: WorkflowNodeType;
  title: string;
  description: string;
  ports: WorkflowPortDefinition[];
};

export const workflowNodeTemplates = [
  {
    type: "script",
    title: "Text",
    description:
      "Runs a selected text task and creates reusable editable outcomes.",
    ports: [
      {
        key: "brief-in",
        label: "Text",
        direction: "input",
        dataType: "brief",
        accepts: ["brief", "script"],
      },
      {
        key: "script-out",
        label: "World view",
        direction: "output",
        dataType: "script",
      },
      {
        key: "profiles-out",
        label: "Characters",
        direction: "output",
        dataType: "character",
      },
    ],
  },
  {
    type: "storyboard",
    title: "Storyboard",
    description: "Shapes script output into editable shots and visual beats.",
    ports: [
      {
        key: "script-in",
        label: "Script",
        direction: "input",
        dataType: "script",
        accepts: ["script"],
      },
      {
        key: "storyboard-out",
        label: "Shots",
        direction: "output",
        dataType: "storyboard",
      },
    ],
  },
  {
    type: "image",
    title: "Image",
    description:
      "Generates or edits one image from connected text, prompt, or image reference.",
    ports: [
      {
        key: "image-prompt-in",
        label: "Prompt",
        direction: "input",
        dataType: "brief",
        accepts: [
          "brief",
          "script",
          "storyboard",
          "character",
          "asset",
          "scene",
        ],
      },
      {
        key: "image-out",
        label: "Image",
        direction: "output",
        dataType: "image",
      },
    ],
  },
  {
    type: "composition",
    title: "Image Composition",
    description:
      "Combines characters, assets, and scenes into storyboard keyframes.",
    ports: [
      {
        key: "character-in",
        label: "Character",
        direction: "input",
        dataType: "character",
        accepts: ["character", "image"],
      },
      {
        key: "scene-in",
        label: "Scene",
        direction: "input",
        dataType: "scene",
        accepts: ["scene", "image"],
      },
      {
        key: "asset-in",
        label: "Asset",
        direction: "input",
        dataType: "asset",
        accepts: ["asset", "image"],
      },
      {
        key: "image-out",
        label: "Keyframe",
        direction: "output",
        dataType: "image",
      },
    ],
  },
  {
    type: "audio",
    title: "Audio",
    description: "Generates one music track from lyrics and style text.",
    ports: [
      {
        key: "script-audio-in",
        label: "Lyrics",
        direction: "input",
        dataType: "script",
        accepts: ["script", "storyboard"],
      },
      {
        key: "audio-out",
        label: "Audio",
        direction: "output",
        dataType: "audio",
      },
    ],
  },
  {
    type: "video",
    title: "Video",
    description:
      "Generates one video clip from prompt, images, and optional audio.",
    ports: [
      {
        key: "prompt-in",
        label: "Prompt",
        direction: "input",
        dataType: "script",
        accepts: ["script", "storyboard", "brief"],
      },
      {
        key: "image-in",
        label: "Image",
        direction: "input",
        dataType: "image",
        accepts: ["image", "character", "scene", "asset"],
      },
      {
        key: "reference-video-in",
        label: "Reference video",
        direction: "input",
        dataType: "video",
        accepts: ["video"],
      },
      {
        key: "audio-in",
        label: "Audio",
        direction: "input",
        dataType: "audio",
      },
      {
        key: "video-out",
        label: "Clip",
        direction: "output",
        dataType: "video",
      },
    ],
  },
  {
    type: "export",
    title: "Export",
    description: "Collects selected clips and audio for later final rendering.",
    ports: [
      { key: "video-in", label: "Clip", direction: "input", dataType: "video" },
      {
        key: "audio-mix-in",
        label: "Audio",
        direction: "input",
        dataType: "audio",
      },
      {
        key: "export-out",
        label: "Final",
        direction: "output",
        dataType: "export",
      },
    ],
  },
] as const satisfies NodeTemplate[];

export const workflowNodeTypes = workflowNodeTemplates.map(
  (template) => template.type,
);

const nodeTemplateByType = new Map(
  workflowNodeTemplates.map((template) => [template.type, template]),
);

export type WorkflowGraphAction =
  | { type: "addNode"; nodeType: WorkflowNodeType; position: WorkflowPoint }
  | {
      type: "upsertOutputNode";
      sourceNodeId: string;
      nodeType: WorkflowNodeType;
      title: string;
      description: string;
      position: WorkflowPoint;
      output: WorkflowNodeOutput;
      ports: WorkflowPortDefinition[];
      notice?: string;
    }
  | {
      type: "updateNodeOutput";
      nodeId: string;
      status?: WorkflowNodeStatus;
      output: WorkflowNodeOutput;
      notice?: string;
    }
  | { type: "moveNode"; nodeId: string; position: WorkflowPoint }
  | { type: "select"; selection: WorkflowSelection }
  | { type: "deleteSelection" }
  | { type: "connect"; sourcePortId: string; targetPortId: string }
  | { type: "setViewport"; viewport: WorkflowViewport; markDirty?: boolean }
  | { type: "fitView" }
  | { type: "saveSnapshot" }
  | { type: "restoreSnapshot"; snapshot?: WorkflowSnapshot }
  | { type: "setNotice"; notice: string }
  | {
      type: "setNodeStatus";
      nodeId: string;
      status: WorkflowNodeStatus;
      notice?: string;
    };

export function createWorkflowNode(
  nodeType: WorkflowNodeType,
  position: WorkflowPoint,
  index: number,
): WorkflowNode {
  const template = nodeTemplateByType.get(nodeType);

  if (!template) {
    throw new Error(`Unknown workflow node type: ${nodeType}`);
  }

  const nodeId = `${nodeType}-${index}`;

  return {
    id: nodeId,
    type: template.type,
    role: "source",
    title: template.title,
    description: template.description,
    status: "placeholder",
    position,
    ports: template.ports.map((port) => ({
      ...port,
      id: `${nodeId}:${port.key}`,
      nodeId,
    })),
  };
}

export function createWorkflowSnapshot(
  state: Pick<
    WorkflowGraphState,
    | "version"
    | "projectId"
    | "workflowId"
    | "nodes"
    | "edges"
    | "selection"
    | "viewport"
  >,
): WorkflowSnapshot {
  return {
    version: state.version,
    projectId: state.projectId,
    workflowId: state.workflowId,
    nodes: state.nodes,
    edges: state.edges,
    selection: state.selection,
    viewport: state.viewport,
  };
}

export function createInitialWorkflowGraphState(): WorkflowGraphState {
  const script = createWorkflowNode("script", { x: 160, y: 210 }, 1);
  const storyboard = createWorkflowNode("storyboard", { x: 500, y: 230 }, 2);
  const composition = createWorkflowNode("composition", { x: 840, y: 350 }, 3);
  const initialNodes = [script, storyboard, composition];
  const scriptOut = findPort(initialNodes, `${script.id}:script-out`);
  const storyboardIn = findPort(initialNodes, `${storyboard.id}:script-in`);
  const storyboardOut = findPort(
    initialNodes,
    `${storyboard.id}:storyboard-out`,
  );
  const compositionIn = findPort(initialNodes, `${composition.id}:scene-in`);
  const edges = [
    makeEdge(scriptOut, storyboardIn, 1),
    makeEdge(storyboardOut, compositionIn, 2),
  ];

  return {
    version: 1,
    projectId: "local-project",
    workflowId: "workflow-canvas-foundation",
    nodes: initialNodes,
    edges,
    selection: { kind: "node", id: script.id },
    viewport: { x: 0, y: 0, zoom: 1 },
    draftStatus: "clean",
    notice:
      "Local draft canvas. FastAPI workflow persistence is not connected yet.",
    savedSnapshot: null,
    nextNodeIndex: 4,
    nextEdgeIndex: 3,
  };
}

export function workflowGraphReducer(
  state: WorkflowGraphState,
  action: WorkflowGraphAction,
): WorkflowGraphState {
  switch (action.type) {
    case "addNode": {
      const node = createWorkflowNode(
        action.nodeType,
        action.position,
        state.nextNodeIndex,
      );

      return {
        ...state,
        nodes: [...state.nodes, node],
        selection: { kind: "node", id: node.id },
        draftStatus: "dirty",
        notice:
          node.type === "script"
            ? "Text node added. Choose a text task and enter or connect its input."
            : `${node.title} placeholder added. Generation is deferred to later features.`,
        nextNodeIndex: state.nextNodeIndex + 1,
      };
    }

    case "upsertOutputNode": {
      const outputNodeId = createWorkflowOutputNodeId(
        action.sourceNodeId,
        action.output.dataType,
      );
      const existing = state.nodes.find((node) => node.id === outputNodeId);
      const sourceNode = findNode(state.nodes, action.sourceNodeId);
      const shouldAutoConnectTextOutcome =
        sourceNode?.role === "source" &&
        sourceNode.type === "script" &&
        action.nodeType === "script";
      const portDefinitions =
        shouldAutoConnectTextOutcome &&
        !action.ports.some((port) => port.key === "source-in")
          ? [
              {
                key: "source-in",
                label: "Source",
                direction: "input" as const,
                dataType: action.output.dataType,
                accepts: [action.output.dataType],
              },
              ...action.ports,
            ]
          : action.ports;
      const outputNode: WorkflowNode = {
        id: outputNodeId,
        type: action.nodeType,
        role: "outcome",
        title: action.title,
        description: action.description,
        status: "ready",
        position: existing?.position ?? action.position,
        output: action.output,
        ports: portDefinitions.map((port) => ({
          ...port,
          id: `${outputNodeId}:${port.key}`,
          nodeId: outputNodeId,
        })),
      };
      const sourcePort = shouldAutoConnectTextOutcome
        ? sourceNode.ports.find(
            (port) =>
              port.direction === "output" &&
              port.dataType === action.output.dataType,
          )
        : undefined;
      const targetPort = outputNode.ports.find(
        (port) => port.direction === "input" && port.key === "source-in",
      );
      const alreadyConnected =
        sourcePort &&
        targetPort &&
        state.edges.some(
          (edge) =>
            edge.sourcePortId === sourcePort.id &&
            edge.targetPortId === targetPort.id,
        );
      const generatedEdge =
        sourcePort && targetPort && !alreadyConnected
          ? makeEdge(sourcePort, targetPort, state.nextEdgeIndex)
          : null;

      return {
        ...state,
        nodes: existing
          ? state.nodes.map((node) =>
              node.id === outputNodeId ? outputNode : node,
            )
          : [...state.nodes, outputNode],
        edges: generatedEdge ? [...state.edges, generatedEdge] : state.edges,
        selection: { kind: "node", id: outputNodeId },
        draftStatus: "dirty",
        notice:
          action.notice ??
          `${action.title} is ready as a local editable output node.`,
        nextEdgeIndex: generatedEdge
          ? state.nextEdgeIndex + 1
          : state.nextEdgeIndex,
      };
    }

    case "updateNodeOutput":
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          node.id === action.nodeId
            ? {
                ...node,
                status: action.status ?? node.status,
                output: action.output,
              }
            : node,
        ),
        selection: { kind: "node", id: action.nodeId },
        draftStatus: "dirty",
        notice: action.notice ?? "Node output updated locally.",
      };

    case "moveNode":
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          node.id === action.nodeId
            ? { ...node, position: action.position }
            : node,
        ),
        draftStatus: "dirty",
      };

    case "select":
      return {
        ...state,
        selection: action.selection,
        notice:
          action.selection.kind === "empty"
            ? "Selection cleared."
            : `${action.selection.kind === "node" ? "Node" : "Edge"} selected for inspection.`,
      };

    case "deleteSelection": {
      if (state.selection.kind === "empty") {
        return {
          ...state,
          notice: "Nothing selected to delete.",
        };
      }

      if (state.selection.kind === "edge") {
        const deletedEdgeId = state.selection.id;

        return {
          ...state,
          edges: state.edges.filter((edge) => edge.id !== deletedEdgeId),
          selection: { kind: "empty" },
          draftStatus: "dirty",
          notice: "Selected connection removed.",
        };
      }

      const deletedNodeId = state.selection.id;

      return {
        ...state,
        nodes: state.nodes.filter((node) => node.id !== deletedNodeId),
        edges: state.edges.filter(
          (edge) =>
            edge.sourceNodeId !== deletedNodeId &&
            edge.targetNodeId !== deletedNodeId,
        ),
        selection: { kind: "empty" },
        draftStatus: "dirty",
        notice: "Selected node and its connections removed.",
      };
    }

    case "connect": {
      const result = connectPorts(
        state.nodes,
        state.edges,
        action.sourcePortId,
        action.targetPortId,
        state.nextEdgeIndex,
      );

      if (!result.ok) {
        return {
          ...state,
          notice: result.reason,
        };
      }

      return {
        ...state,
        edges: [...state.edges, result.edge],
        selection: { kind: "edge", id: result.edge.id },
        draftStatus: "dirty",
        notice: "Compatible ports connected. No generation task was started.",
        nextEdgeIndex: state.nextEdgeIndex + 1,
      };
    }

    case "setViewport":
      return {
        ...state,
        viewport: action.viewport,
        draftStatus: action.markDirty === false ? state.draftStatus : "dirty",
      };

    case "fitView":
      return {
        ...state,
        viewport: { x: 0, y: 0, zoom: 0.86 },
        notice: "Canvas fitted to current placeholder graph.",
      };

    case "saveSnapshot": {
      const snapshot = createWorkflowSnapshot(state);

      return {
        ...state,
        savedSnapshot: snapshot,
        draftStatus: "saved",
        notice:
          "Local graph snapshot saved. Durable FastAPI persistence is deferred.",
      };
    }

    case "restoreSnapshot": {
      const snapshot = action.snapshot ?? state.savedSnapshot;

      if (!snapshot) {
        return {
          ...state,
          notice: "No local snapshot is available to restore.",
        };
      }

      return {
        ...state,
        ...snapshot,
        draftStatus: "restored",
        notice: "Local graph snapshot restored from structured payload.",
        savedSnapshot: state.savedSnapshot,
      };
    }

    case "setNotice":
      return {
        ...state,
        notice: action.notice,
      };

    case "setNodeStatus":
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          node.id === action.nodeId ? { ...node, status: action.status } : node,
        ),
        notice: action.notice ?? state.notice,
      };
  }
}

export function connectPorts(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  sourcePortId: string,
  targetPortId: string,
  edgeIndex: number,
): ConnectionResult {
  const sourcePort = findPortOrNull(nodes, sourcePortId);
  const targetPort = findPortOrNull(nodes, targetPortId);

  if (!sourcePort || !targetPort) {
    return {
      ok: false,
      reason:
        "That connection references a missing port. Refresh the canvas state and try again.",
    };
  }

  if (sourcePort.direction !== "output" || targetPort.direction !== "input") {
    return {
      ok: false,
      reason: "Connections must start at an output and end at an input.",
    };
  }

  if (sourcePort.nodeId === targetPort.nodeId) {
    return {
      ok: false,
      reason: "Self connections are blocked for placeholder nodes.",
    };
  }

  const accepts = targetPort.accepts ?? [targetPort.dataType];
  const compatible = accepts.includes(sourcePort.dataType);

  if (!compatible) {
    return {
      ok: false,
      reason: `${sourcePort.label} cannot connect to ${targetPort.label}. Choose a compatible port.`,
    };
  }

  const duplicate = edges.some(
    (edge) =>
      edge.sourcePortId === sourcePort.id &&
      edge.targetPortId === targetPort.id,
  );

  if (duplicate) {
    return { ok: false, reason: "That connection already exists." };
  }

  return {
    ok: true,
    edge: makeEdge(sourcePort, targetPort, edgeIndex),
  };
}

export function findPort(nodes: WorkflowNode[], portId: string): WorkflowPort {
  const port = findPortOrNull(nodes, portId);

  if (port) {
    return port;
  }

  throw new Error(`Unknown workflow port: ${portId}`);
}

function findPortOrNull(
  nodes: WorkflowNode[],
  portId: string,
): WorkflowPort | null {
  for (const node of nodes) {
    const port = node.ports.find((candidate) => candidate.id === portId);

    if (port) {
      return port;
    }
  }

  return null;
}

export function findNode(nodes: WorkflowNode[], nodeId: string) {
  return nodes.find((node) => node.id === nodeId) ?? null;
}

export function findEdge(edges: WorkflowEdge[], edgeId: string) {
  return edges.find((edge) => edge.id === edgeId) ?? null;
}

export function connectionDataTypeLabel(dataType: WorkflowDataType) {
  return dataType.replace("-", " ");
}

export function createWorkflowOutputNodeId(
  sourceNodeId: string,
  dataType: WorkflowDataType,
) {
  return `${sourceNodeId}:${dataType}-outcome`;
}

function makeEdge(
  sourcePort: WorkflowPort,
  targetPort: WorkflowPort,
  edgeIndex: number,
): WorkflowEdge {
  return {
    id: `edge-${edgeIndex}`,
    sourceNodeId: sourcePort.nodeId,
    sourcePortId: sourcePort.id,
    targetNodeId: targetPort.nodeId,
    targetPortId: targetPort.id,
    dataType: sourcePort.dataType,
    status: "valid",
    label: connectionDataTypeLabel(sourcePort.dataType),
  };
}
