"use client";

import {
  ArrowDownToLine,
  Box,
  CircleDot,
  Film,
  FolderDown,
  Frame,
  HelpCircle,
  Image,
  Layers3,
  Mic2,
  Plus,
  Save,
  Scissors,
  Share2,
  Sparkles,
  Trash2,
  UserRound,
  Video,
  Wand2,
  Search,
  X,
} from "lucide-react";
import {
  DEFAULT_SCRIPT_NODE_INPUT,
  type ScriptDialogueMessage,
  type ScriptNodeInput,
  type ScriptNodeOutput,
  type ScriptTaskStatusResponse,
} from "@xmeta/shared-contracts";
import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { ReactFlowProvider } from "@xyflow/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AIResponseTyping } from "@/components/uitripled/ai-response-typing-shadcnui";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  connectionDataTypeLabel,
  createInitialWorkflowGraphState,
  findEdge,
  findNode,
  findPort,
  workflowGraphReducer,
  workflowNodeTemplates,
} from "@/lib/workflow-canvas/graph";
import type {
  WorkflowGraphState,
  WorkflowNode,
  WorkflowNodeType,
  WorkflowPoint,
  WorkflowPort,
  WorkflowSelection,
} from "@/lib/workflow-canvas/types";
import { runScriptDialogue, runScriptGeneration } from "@/lib/script-node/api";
import { cn } from "@/lib/utils";

const NODE_WIDTH = 288;
const NODE_HEIGHT = 178;
const SCRIPT_INLINE_EDITOR_WIDTH = 820;
const SCRIPT_INLINE_EDITOR_GAP = 72;
const SCRIPT_RESPONSE_PANEL_HEIGHT = 288;
const IMAGE_EDITOR_MIN_WIDTH = 360;
const IMAGE_EDITOR_MIN_HEIGHT = 360;
const IMAGE_EDITOR_VIEWPORT_PADDING = 16;
const PORT_TOP = 76;
const PORT_GAP = 30;
const CANVAS_WIDTH = 2200;
const CANVAS_HEIGHT = 1280;
const INITIAL_GRAPH_BOUNDS = {
  minX: 160,
  minY: 210,
  maxX: 1128,
  maxY: 528,
};
const INITIAL_GRAPH_MARGIN_X = 32;
const INITIAL_GRAPH_TOP_Y = 112;
const INITIAL_GRAPH_BOTTOM_RESERVED = 132;
const MIN_INITIAL_ZOOM = 0.5;
const MAX_INITIAL_ZOOM = 1;

const nodeIcons = {
  script: Wand2,
  storyboard: Frame,
  character: Sparkles,
  asset: Box,
  scene: Image,
  composition: Scissors,
  audio: Mic2,
  video: Video,
  export: FolderDown,
} satisfies Record<WorkflowNodeType, typeof Wand2>;

const nodeTitles = {
  script: "Script node",
  storyboard: "Storyboard node",
  character: "Character image node",
  asset: "Prop / asset node",
  scene: "Image node",
  composition: "Composition node",
  audio: "Audio node",
  video: "Video node",
  export: "Export node",
} satisfies Record<WorkflowNodeType, string>;

type DragState = {
  nodeId: string;
  offset: WorkflowPoint;
} | null;

type PanState = {
  startClient: WorkflowPoint;
  startViewport: { x: number; y: number; zoom: number };
} | null;

type ConnectionDragState = {
  sourcePortId: string;
  pointer: WorkflowPoint;
} | null;

type ScriptDialogueRunner = typeof runScriptDialogue;
type ScriptGenerationRunner = typeof runScriptGeneration;

const DEFAULT_SCRIPT_WORLD_DESCRIPTION =
  "\u751f\u6210\u4e00\u4e2a\u51b0\u96ea\u76f8\u5173\u7684mv\u7684\u4e16\u754c\u89c2";
const SCRIPT_WORLD_DESCRIPTION_PLACEHOLDER =
  "\u63cf\u8ff0\u4f60\u7684\u5267\u60c5\u7247\u6bb5\u3001\u6545\u4e8b\u548c\u4e16\u754c\u89c2\u6784\u60f3";
const SCRIPT_WORLD_DESCRIPTION_LABEL =
  "\u5267\u60c5\u7247\u6bb5\u3001\u6545\u4e8b\u548c\u4e16\u754c\u89c2\u6784\u60f3";
const SCRIPT_REVISE_STATUS_LABEL = "AI\u4fee\u6539\u4e2d";
const SCRIPT_DIALOGUE_READY_LABEL = "AI\u5bf9\u8bdd";
const SCRIPT_REVISE_LABEL = "AI\u4fee\u6539";
const SCRIPT_GENERATE_LABEL = "\u751f\u6210";
const SCRIPT_GENERATING_LABEL = "\u751f\u6210\u4e2d";

const defaultScriptInput: ScriptNodeInput = {
  ...DEFAULT_SCRIPT_NODE_INPUT,
  world_description: DEFAULT_SCRIPT_WORLD_DESCRIPTION,
};

const emptyScriptTask: ScriptTaskStatusResponse = {
  task_id: "not_started",
  project_id: "local-project",
  node_id: "script-1",
  status: "queued",
  error: null,
};

type ScriptModelSelection = "mock" | "configured";
type ScriptResponseMode = "generation" | "revise";
type ScriptGenerationAction = "generate" | "revise";
type ImageEditorFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};
type ImageEditorInteraction = {
  mode: "drag" | "resize";
  startClient: WorkflowPoint;
  startFrame: ImageEditorFrame;
} | null;

const defaultImageEditorFrame: ImageEditorFrame = {
  x: 880,
  y: 88,
  width: 430,
  height: 520,
};

const scriptModelOptions = [
  {
    id: "configured",
    label: "gpt-5.4-mini",
    settings: {},
  },
  {
    id: "mock",
    label: "Mock local model",
    settings: { provider: "mock", model: "storyboard-browser-polish" },
  },
] as const satisfies Array<{
  id: ScriptModelSelection;
  label: string;
  settings: { provider?: string; model?: string };
}>;

function findScriptModelOption(id: ScriptModelSelection) {
  return (
    scriptModelOptions.find((model) => model.id === id) ?? scriptModelOptions[0]
  );
}

export function getScriptResponseModeForAction(
  action: ScriptGenerationAction,
): ScriptResponseMode {
  return action === "revise" ? "revise" : "generation";
}

export function calculateDraggedNodePosition(
  point: WorkflowPoint,
  offset: WorkflowPoint,
) {
  return {
    x: point.x - offset.x,
    y: Math.max(16, point.y - offset.y),
  };
}

export function getInlineEditorCompensationScale(zoom: number) {
  if (zoom <= 0) {
    return 1;
  }

  return Number((1 / zoom).toFixed(3));
}

export function isEditableKeyboardTarget(target: EventTarget | null) {
  const element = target as { closest?: (selector: string) => unknown } | null;

  if (!element || typeof element.closest !== "function") {
    return false;
  }

  return Boolean(
    element.closest(
      "textarea, input, select, [contenteditable='true'], [role='textbox']",
    ),
  );
}

export function isFloatingImageEditorNodeType(type: WorkflowNodeType) {
  return type === "character" || type === "scene" || type === "composition";
}

export function clampImageEditorFrame(
  frame: ImageEditorFrame,
  viewport: { width: number; height: number },
) {
  const width = Math.min(
    Math.max(frame.width, IMAGE_EDITOR_MIN_WIDTH),
    Math.max(
      IMAGE_EDITOR_MIN_WIDTH,
      viewport.width - IMAGE_EDITOR_VIEWPORT_PADDING * 2,
    ),
  );
  const height = Math.min(
    Math.max(frame.height, IMAGE_EDITOR_MIN_HEIGHT),
    Math.max(
      IMAGE_EDITOR_MIN_HEIGHT,
      viewport.height - IMAGE_EDITOR_VIEWPORT_PADDING * 2,
    ),
  );
  const maxX = Math.max(
    IMAGE_EDITOR_VIEWPORT_PADDING,
    viewport.width - width - IMAGE_EDITOR_VIEWPORT_PADDING,
  );
  const maxY = Math.max(
    IMAGE_EDITOR_VIEWPORT_PADDING,
    viewport.height - height - IMAGE_EDITOR_VIEWPORT_PADDING,
  );

  return {
    x: Math.min(Math.max(frame.x, IMAGE_EDITOR_VIEWPORT_PADDING), maxX),
    y: Math.min(Math.max(frame.y, IMAGE_EDITOR_VIEWPORT_PADDING), maxY),
    width,
    height,
  };
}

export function formatScriptNodePreview(
  input: ScriptNodeInput | null,
  output: ScriptNodeOutput | null,
) {
  if (output) {
    const shotCount = output.storyboard_direction.shots.length;

    return {
      heading: "Confirmed Script",
      body: `${output.title}: ${output.world_overview} ${shotCount} storyboard shots ready.`,
    };
  }

  return {
    heading: "World view",
    body: input?.world_description.trim() || "No world prompt yet.",
  };
}

export function getScriptResponseStatusLabel(
  task: ScriptTaskStatusResponse,
  output: ScriptNodeOutput | null,
  error?: string | null,
) {
  if (error || task.status === "failed") {
    return "Error";
  }

  if (task.status === "running" || task.status === "retrying") {
    return "Generating";
  }

  if (output || task.status === "succeeded") {
    return "Ready";
  }

  return "Waiting";
}

export function formatScriptOutputConversationReply(output: ScriptNodeOutput) {
  if (output.agent_output?.trim()) {
    return output.agent_output.trim();
  }

  const characterNames = output.characters
    .map((character) => character.name.trim())
    .filter(Boolean)
    .join("\u3001");
  const sceneLocations = output.scene_descriptions
    .map((scene) => scene.location.trim())
    .filter(Boolean)
    .join("\u3001");

  return [
    output.title,
    output.world_overview,
    output.storyboard_direction.pov,
    output.storyboard_direction.visual_rhythm,
    characterNames ? `\u89d2\u8272\uff1a${characterNames}` : null,
    sceneLocations ? `\u573a\u666f\uff1a${sceneLocations}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function calculateInitialCanvasViewport(
  viewportWidth: number,
  viewportHeight: number,
) {
  const graphWidth = INITIAL_GRAPH_BOUNDS.maxX - INITIAL_GRAPH_BOUNDS.minX;
  const graphHeight = INITIAL_GRAPH_BOUNDS.maxY - INITIAL_GRAPH_BOUNDS.minY;
  const availableWidth = Math.max(
    320,
    viewportWidth - INITIAL_GRAPH_MARGIN_X * 2,
  );
  const availableHeight = Math.max(
    240,
    viewportHeight - INITIAL_GRAPH_TOP_Y - INITIAL_GRAPH_BOTTOM_RESERVED,
  );
  const zoom = Math.min(
    MAX_INITIAL_ZOOM,
    Math.max(
      MIN_INITIAL_ZOOM,
      Math.min(availableWidth / graphWidth, availableHeight / graphHeight),
    ),
  );
  const fittedWidth = graphWidth * zoom;
  const x =
    Math.round((viewportWidth - fittedWidth) / 2) -
    Math.round(INITIAL_GRAPH_BOUNDS.minX * zoom);
  const y = Math.round(INITIAL_GRAPH_TOP_Y - INITIAL_GRAPH_BOUNDS.minY * zoom);

  return { x, y, zoom };
}

export function WorkflowCanvasWorkspace({
  scriptDialogueRunner = runScriptDialogue,
  scriptGenerationRunner = runScriptGeneration,
}: {
  scriptDialogueRunner?: ScriptDialogueRunner;
  scriptGenerationRunner?: ScriptGenerationRunner;
} = {}) {
  const [state, dispatch] = useReducer(
    workflowGraphReducer,
    undefined,
    createInitialWorkflowGraphState,
  );
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showZoomControl, setShowZoomControl] = useState(false);
  const [dragState, setDragState] = useState<DragState>(null);
  const [panState, setPanState] = useState<PanState>(null);
  const [connectionDrag, setConnectionDrag] =
    useState<ConnectionDragState>(null);
  const [scriptInput, setScriptInput] =
    useState<ScriptNodeInput>(defaultScriptInput);
  const [scriptOutput, setScriptOutput] = useState<ScriptNodeOutput | null>(
    null,
  );
  const [scriptDialogueMessages, setScriptDialogueMessages] = useState<
    ScriptDialogueMessage[]
  >([]);
  const [scriptTask, setScriptTask] =
    useState<ScriptTaskStatusResponse>(emptyScriptTask);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [scriptBusy, setScriptBusy] = useState(false);
  const [scriptHistoryOpen, setScriptHistoryOpen] = useState(false);
  const [scriptResponseMode, setScriptResponseMode] =
    useState<ScriptResponseMode>("generation");
  const [scriptModel, setScriptModel] =
    useState<ScriptModelSelection>("configured");
  const [imageEditorOpen, setImageEditorOpen] = useState(false);
  const [imageEditorFrame, setImageEditorFrame] = useState<ImageEditorFrame>(
    defaultImageEditorFrame,
  );
  const [imagePrompt, setImagePrompt] = useState(
    "A cinematic desert jeep frame with two summer MV leads and neon reflections.",
  );
  const [imageResponseOpen, setImageResponseOpen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const selectedNode =
    state.selection.kind === "node"
      ? findNode(state.nodes, state.selection.id)
      : null;
  const selectedEdge =
    state.selection.kind === "edge"
      ? findEdge(state.edges, state.selection.id)
      : null;
  const selectedScriptNode =
    selectedNode?.type === "script" ? selectedNode : null;
  const selectedImageEditorNode =
    selectedNode && isFloatingImageEditorNodeType(selectedNode.type)
      ? selectedNode
      : null;
  const pendingPort = useMemo(() => {
    if (!connectionDrag) {
      return null;
    }

    try {
      return findPort(state.nodes, connectionDrag.sourcePortId);
    } catch {
      return null;
    }
  }, [connectionDrag, state.nodes]);

  useEffect(() => {
    function applyResponsiveViewport() {
      dispatch({
        type: "setViewport",
        viewport: calculateInitialCanvasViewport(
          window.innerWidth,
          window.innerHeight,
        ),
        markDirty: false,
      });
    }

    applyResponsiveViewport();
    const firstCalibration = window.setTimeout(applyResponsiveViewport, 0);
    const secondCalibration = window.setTimeout(applyResponsiveViewport, 250);
    window.addEventListener("resize", applyResponsiveViewport);
    window.visualViewport?.addEventListener("resize", applyResponsiveViewport);

    return () => {
      window.clearTimeout(firstCalibration);
      window.clearTimeout(secondCalibration);
      window.removeEventListener("resize", applyResponsiveViewport);
      window.visualViewport?.removeEventListener(
        "resize",
        applyResponsiveViewport,
      );
    };
  }, []);

  function addNode(nodeType: WorkflowNodeType) {
    const addedNodeIndex = Math.max(0, state.nodes.length - 3);
    const column = addedNodeIndex % 2;
    const row = Math.floor(addedNodeIndex / 2);

    dispatch({
      type: "addNode",
      nodeType,
      position: { x: 500 + column * 340, y: 560 + row * 230 },
    });
    setShowAddMenu(false);
    setShowZoomControl(false);
  }

  function getCanvasPoint(event: { clientX: number; clientY: number }) {
    const rect = canvasRef.current?.getBoundingClientRect();

    if (!rect) {
      return { x: 0, y: 0 };
    }

    return {
      x: (event.clientX - rect.left - state.viewport.x) / state.viewport.zoom,
      y: (event.clientY - rect.top - state.viewport.y) / state.viewport.zoom,
    };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragState) {
      const point = getCanvasPoint(event);

      dispatch({
        type: "moveNode",
        nodeId: dragState.nodeId,
        position: calculateDraggedNodePosition(point, dragState.offset),
      });
      return;
    }

    if (connectionDrag) {
      setConnectionDrag({
        ...connectionDrag,
        pointer: getCanvasPoint(event),
      });
      return;
    }

    if (panState) {
      dispatch({
        type: "setViewport",
        viewport: {
          ...panState.startViewport,
          x: panState.startViewport.x + event.clientX - panState.startClient.x,
          y: panState.startViewport.y + event.clientY - panState.startClient.y,
        },
        markDirty: false,
      });
    }
  }

  function startCanvasPan(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement;

    if (
      target.closest(
        "[data-workflow-node], [data-workflow-edge-hit], [data-script-node-inline-editor], button, textarea, input, select, [data-workspace-bottom-toolbar], [data-workspace-floating-topbar]",
      )
    ) {
      return;
    }

    setShowAddMenu(false);
    setShowZoomControl(false);
    setPanState({
      startClient: { x: event.clientX, y: event.clientY },
      startViewport: state.viewport,
    });
    dispatch({ type: "select", selection: { kind: "empty" } });
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (connectionDrag) {
      const target = event.target as HTMLElement;
      const inputPortId =
        target
          .closest<HTMLButtonElement>(
            'button[data-workflow-port-direction="input"]',
          )
          ?.getAttribute("data-workflow-port-id") ?? null;

      if (inputPortId) {
        dispatch({
          type: "connect",
          sourcePortId: connectionDrag.sourcePortId,
          targetPortId: inputPortId,
        });
      } else {
        dispatch({
          type: "setNotice",
          notice:
            "Connection cancelled. Drop the line on a compatible input port.",
        });
      }
    }

    setConnectionDrag(null);
    setDragState(null);
    setPanState(null);
  }

  function startNodeDrag(
    event: ReactPointerEvent<HTMLButtonElement>,
    node: WorkflowNode,
  ) {
    const point = getCanvasPoint(event);

    setDragState({
      nodeId: node.id,
      offset: {
        x: point.x - node.position.x,
        y: point.y - node.position.y,
      },
    });
    dispatch({ type: "select", selection: { kind: "node", id: node.id } });
    if (isFloatingImageEditorNodeType(node.type)) {
      setImageEditorOpen(true);
    }
  }

  function startPortConnection(
    event: ReactPointerEvent<HTMLButtonElement>,
    port: WorkflowPort,
  ) {
    event.stopPropagation();

    if (port.direction !== "output") {
      dispatch({
        type: "setNotice",
        notice: "Drag from an output port to create a connection.",
      });
      return;
    }

    setConnectionDrag({
      sourcePortId: port.id,
      pointer: getCanvasPoint(event),
    });
    dispatch({
      type: "setNotice",
      notice: `Drag ${port.label} to a compatible input port.`,
    });
  }

  function setZoom(zoomValue: number) {
    const zoom = Math.min(1.4, Math.max(MIN_INITIAL_ZOOM, zoomValue));

    dispatch({
      type: "setViewport",
      viewport: { ...state.viewport, zoom },
      markDirty: false,
    });
  }

  function updateScriptInput<Field extends keyof ScriptNodeInput>(
    field: Field,
    value: ScriptNodeInput[Field],
  ) {
    setScriptInput((current) => ({ ...current, [field]: value }));
  }

  async function generateScriptNode() {
    if (!selectedScriptNode) {
      setScriptError("Select a Script node before running generation.");
      return;
    }

    if (!scriptInput.world_description.trim()) {
      setScriptError("MV world description is required before generation.");
      dispatch({
        type: "setNodeStatus",
        nodeId: selectedScriptNode.id,
        status: "blocked",
        notice: "Script generation blocked: MV world description is required.",
      });
      return;
    }

    setScriptBusy(true);
    setScriptError(null);
    setScriptTask({
      task_id: "pending",
      project_id: state.projectId,
      node_id: selectedScriptNode.id,
      status: "running",
      error: null,
    });
    dispatch({
      type: "setNodeStatus",
      nodeId: selectedScriptNode.id,
      status: "running",
      notice: "Script generation task started through FastAPI.",
    });

    try {
      const result = await scriptGenerationRunner({
        projectId: state.projectId,
        nodeId: selectedScriptNode.id,
        input: scriptInput,
        settings: findScriptModelOption(scriptModel).settings,
      });

      setScriptTask(result.task);
      setScriptOutput(result.output);
      setScriptHistoryOpen(true);
      dispatch({
        type: "setNodeStatus",
        nodeId: selectedScriptNode.id,
        status: "ready",
        notice:
          "Script output is ready. Downstream media nodes remain deferred.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Script generation failed.";

      setScriptTask({
        task_id: "failed",
        project_id: state.projectId,
        node_id: selectedScriptNode.id,
        status: "failed",
        error: message,
      });
      setScriptError(message);
      dispatch({
        type: "setNodeStatus",
        nodeId: selectedScriptNode.id,
        status: "blocked",
        notice: message,
      });
    } finally {
      setScriptBusy(false);
    }
  }

  async function sendScriptDialogueMessage() {
    if (!selectedScriptNode) {
      setScriptError("Select a Script node before starting AI dialogue.");
      return;
    }

    const messageText = scriptInput.world_description.trim();
    if (!messageText) {
      setScriptError("MV world description is required before AI dialogue.");
      dispatch({
        type: "setNodeStatus",
        nodeId: selectedScriptNode.id,
        status: "blocked",
        notice: "Script AI dialogue blocked: message is required.",
      });
      return;
    }

    const userMessage: ScriptDialogueMessage = {
      role: "user",
      content: messageText,
    };
    const pendingMessages = [...scriptDialogueMessages, userMessage];

    setScriptBusy(true);
    setScriptError(null);
    setScriptHistoryOpen(true);
    setScriptResponseMode("revise");
    setScriptDialogueMessages(pendingMessages);
    setScriptTask({
      task_id: "dialogue-pending",
      project_id: state.projectId,
      node_id: selectedScriptNode.id,
      status: "running",
      error: null,
    });
    dispatch({
      type: "setNodeStatus",
      nodeId: selectedScriptNode.id,
      status: "running",
      notice: "Script AI dialogue request sent to FastAPI.",
    });

    try {
      const result = await scriptDialogueRunner({
        projectId: state.projectId,
        nodeId: selectedScriptNode.id,
        input: scriptInput,
        settings: findScriptModelOption(scriptModel).settings,
        history: scriptDialogueMessages,
        message: messageText,
      });

      setScriptDialogueMessages(result.history);
      setScriptTask({
        task_id: "dialogue-succeeded",
        project_id: result.project_id,
        node_id: result.node_id,
        status: "succeeded",
        error: null,
      });
      dispatch({
        type: "setNodeStatus",
        nodeId: selectedScriptNode.id,
        status: scriptOutput ? "ready" : "placeholder",
        notice:
          "Script AI dialogue reply received. Use Generate for structured ScriptOutput.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Script AI dialogue failed.";

      setScriptTask({
        task_id: "dialogue-failed",
        project_id: state.projectId,
        node_id: selectedScriptNode.id,
        status: "failed",
        error: message,
      });
      setScriptError(message);
      dispatch({
        type: "setNodeStatus",
        nodeId: selectedScriptNode.id,
        status: "blocked",
        notice: message,
      });
    } finally {
      setScriptBusy(false);
    }
  }

  return (
    <TooltipProvider>
      <ReactFlowProvider>
        <section
          aria-label="Workflow canvas"
          className="relative min-h-screen overflow-hidden bg-[#f8fafc] text-neutral-950"
          data-workspace-canvas-page="true"
        >
          <div
            className="absolute inset-0"
            aria-hidden="true"
            style={{
              backgroundImage:
                "radial-gradient(circle at center, rgba(15,23,42,0.14) 1px, transparent 1.3px)",
              backgroundSize: "18px 18px",
            }}
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.72),transparent_46%)]"
            aria-hidden="true"
          />

          <WorkspaceTopBar
            draftStatus={state.draftStatus}
            edgeCount={state.edges.length}
            nodeCount={state.nodes.length}
          />
          <div
            className="pointer-events-none absolute left-4 top-16 z-30 max-w-[calc(100vw-2rem)] rounded-lg border border-neutral-200 bg-white/90 px-3 py-1.5 text-xs text-neutral-600 shadow-sm backdrop-blur"
            data-workspace-boundary-label="true"
          >
            Local workflow only / Script AI enabled / media AI and persistence deferred
          </div>

          <div
            ref={canvasRef}
            className={cn(
              "absolute inset-0 overflow-hidden focus-visible:outline-none",
              panState ? "cursor-grabbing" : "cursor-grab",
            )}
            data-workflow-canvas="viewport"
            role="application"
            aria-label="Figma-like workflow node canvas"
            tabIndex={0}
            onPointerDown={startCanvasPan}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onKeyDown={(event) => {
              if (isEditableKeyboardTarget(event.target)) {
                return;
              }

              if (event.key === "Delete" || event.key === "Backspace") {
                dispatch({ type: "deleteSelection" });
              }
            }}
          >
            <div
              className="relative origin-top-left"
              style={{
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                transform: `translate(${state.viewport.x}px, ${state.viewport.y}px) scale(${state.viewport.zoom})`,
              }}
              data-workflow-canvas-stage="true"
            >
              <WorkflowEdges
                connectionPreview={connectionDrag}
                state={state}
                onSelect={(selection) =>
                  dispatch({ type: "select", selection })
                }
              />
              {state.nodes.map((node) => (
                <WorkflowNodeCard
                  key={node.id}
                  node={node}
                  scriptInput={node.type === "script" ? scriptInput : null}
                  scriptOutput={node.type === "script" ? scriptOutput : null}
                  selected={
                    state.selection.kind === "node" &&
                    state.selection.id === node.id
                  }
                  pendingPort={pendingPort}
                  onDragStart={startNodeDrag}
                  onSelect={(selection) => {
                    dispatch({ type: "select", selection });
                    if (
                      selection.kind === "node" &&
                      isFloatingImageEditorNodeType(node.type)
                    ) {
                      setImageEditorOpen(true);
                    }
                  }}
                  onPortConnectionStart={startPortConnection}
                />
              ))}
              {selectedScriptNode ? (
                <ScriptNodeInlineEditor
                  busy={scriptBusy}
                  error={scriptError}
                  historyOpen={scriptHistoryOpen}
                  input={scriptInput}
                  messages={scriptDialogueMessages}
                  responseMode={scriptResponseMode}
                  node={selectedScriptNode}
                  output={scriptOutput}
                  model={scriptModel}
                  task={scriptTask}
                  viewportZoom={state.viewport.zoom}
                  onGenerate={() => {
                    setScriptResponseMode("generation");
                    setScriptHistoryOpen(true);
                    void generateScriptNode();
                  }}
                  onHistoryOpenChange={setScriptHistoryOpen}
                  onInputChange={updateScriptInput}
                  onModelChange={setScriptModel}
                  onRevise={() => {
                    setScriptResponseMode("revise");
                    setScriptHistoryOpen(true);
                    void sendScriptDialogueMessage();
                  }}
                />
              ) : null}
            </div>
          </div>

          {selectedImageEditorNode && imageEditorOpen ? (
            <ImageNodeFloatingEditor
              frame={imageEditorFrame}
              node={selectedImageEditorNode}
              prompt={imagePrompt}
              responseOpen={imageResponseOpen}
              onClose={() => setImageEditorOpen(false)}
              onFrameChange={setImageEditorFrame}
              onPromptChange={setImagePrompt}
              onResponseOpenChange={setImageResponseOpen}
            />
          ) : null}

          <CanvasStatusBar
            edge={selectedEdge}
            node={selectedNode}
            notice={state.notice}
            zoom={state.viewport.zoom}
          />

          <CanvasDock
            selection={state.selection}
            showAddMenu={showAddMenu}
            showZoomControl={showZoomControl}
            templates={workflowNodeTemplates}
            zoom={state.viewport.zoom}
            onAddNode={addNode}
            onDelete={() => dispatch({ type: "deleteSelection" })}
            onSave={() => dispatch({ type: "saveSnapshot" })}
            onRestore={() => dispatch({ type: "restoreSnapshot" })}
            onToggleAddMenu={() => {
              setShowAddMenu((value) => !value);
              setShowZoomControl(false);
            }}
            onZoomChange={setZoom}
            onZoomToggle={() => {
              setShowZoomControl((value) => !value);
              setShowAddMenu(false);
            }}
            restoreDisabled={!state.savedSnapshot}
          />
        </section>
      </ReactFlowProvider>
    </TooltipProvider>
  );
}

type WorkspaceTopBarProps = {
  draftStatus: string;
  edgeCount: number;
  nodeCount: number;
};

function WorkspaceTopBar({
  draftStatus,
  edgeCount,
  nodeCount,
}: WorkspaceTopBarProps) {
  return (
    <div
      className="pointer-events-none absolute left-0 right-0 top-0 z-30 flex items-start justify-between gap-4 p-4"
      data-workspace-floating-topbar="true"
    >
      <div className="pointer-events-auto flex items-center gap-2 rounded-xl border border-neutral-200 bg-white/95 px-3 py-2 text-neutral-950 shadow-sm backdrop-blur">
        <div className="flex size-7 items-center justify-center rounded-md bg-neutral-950 text-white">
          <Layers3 aria-hidden="true" />
        </div>
        <span className="text-sm font-semibold">Untitled project</span>
        <Separator orientation="vertical" className="h-5 bg-neutral-200" />
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
        >
          Canvas 1
        </Button>
      </div>

      <div className="pointer-events-auto flex items-center gap-2">
        <Badge className="border-neutral-200 bg-white/95 text-neutral-700">
          {draftStatus}
        </Badge>
        <Badge className="border-neutral-200 bg-white/95 text-neutral-700">
          {nodeCount} nodes / {edgeCount} edges
        </Badge>
        <ToolbarButton label="Share">
          <Share2 aria-hidden="true" data-icon="inline-start" />
        </ToolbarButton>
        <ToolbarButton label="Account">
          <UserRound aria-hidden="true" data-icon="inline-start" />
        </ToolbarButton>
      </div>
    </div>
  );
}

type CanvasDockProps = {
  selection: WorkflowSelection;
  showAddMenu: boolean;
  showZoomControl: boolean;
  templates: typeof workflowNodeTemplates;
  restoreDisabled: boolean;
  zoom: number;
  onAddNode: (nodeType: WorkflowNodeType) => void;
  onDelete: () => void;
  onSave: () => void;
  onRestore: () => void;
  onToggleAddMenu: () => void;
  onZoomChange: (zoom: number) => void;
  onZoomToggle: () => void;
};

function CanvasDock({
  selection,
  showAddMenu,
  showZoomControl,
  templates,
  restoreDisabled,
  zoom,
  onAddNode,
  onDelete,
  onSave,
  onRestore,
  onToggleAddMenu,
  onZoomChange,
  onZoomToggle,
}: CanvasDockProps) {
  return (
    <div
      className="absolute bottom-5 left-2 right-2 z-40 sm:left-1/2 sm:right-auto sm:-translate-x-1/2"
      data-workspace-bottom-toolbar="true"
    >
      {showAddMenu ? (
        <div
          className="absolute bottom-14 left-0 w-72 overflow-hidden rounded-xl border border-neutral-200 bg-white/95 p-1.5 shadow-lg backdrop-blur sm:left-1/2 sm:-translate-x-1/2"
          data-workspace-add-menu="true"
        >
          <div className="flex flex-col gap-1">
            {templates.map((template) => {
              const ioLabel = formatTemplateIoLabel(template);

              return (
                <button
                  key={template.type}
                  type="button"
                  aria-label={`Add ${ioLabel} node`}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
                  onClick={() => onAddNode(template.type)}
                >
                  {ioLabel}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-neutral-200 bg-white/95 p-2 shadow-lg backdrop-blur">
        <ToolbarButton
          active={showAddMenu}
          label="Add node"
          onClick={onToggleAddMenu}
        >
          <Plus aria-hidden="true" data-icon="inline-start" />
        </ToolbarButton>
        <Separator orientation="vertical" className="mx-1 h-7 bg-neutral-200" />
        <ZoomControl
          open={showZoomControl}
          zoom={zoom}
          onToggle={onZoomToggle}
          onZoomChange={onZoomChange}
        />
        <Separator orientation="vertical" className="mx-1 h-7 bg-neutral-200" />
        <ToolbarButton label="Save local snapshot" onClick={onSave}>
          <Save aria-hidden="true" data-icon="inline-start" />
        </ToolbarButton>
        <ToolbarButton
          label="Restore local snapshot"
          onClick={onRestore}
          disabled={restoreDisabled}
        >
          <ArrowDownToLine aria-hidden="true" data-icon="inline-start" />
        </ToolbarButton>
        <ToolbarButton
          label="Delete selected graph item"
          onClick={onDelete}
          disabled={selection.kind === "empty"}
        >
          <Trash2 aria-hidden="true" data-icon="inline-start" />
        </ToolbarButton>
        <ToolbarButton label="Help">
          <HelpCircle aria-hidden="true" data-icon="inline-start" />
        </ToolbarButton>
      </div>
    </div>
  );
}

type ZoomControlProps = {
  open: boolean;
  zoom: number;
  onToggle: () => void;
  onZoomChange: (zoom: number) => void;
};

function ZoomControl({ open, zoom, onToggle, onZoomChange }: ZoomControlProps) {
  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="group flex items-center gap-2">
      <ToolbarButton active={open} label="Canvas zoom" onClick={onToggle}>
        <Search aria-hidden="true" data-icon="inline-start" />
      </ToolbarButton>
      <div
        className={cn(
          "pointer-events-none flex w-0 items-center gap-2 overflow-hidden rounded-lg border border-transparent opacity-0 transition-all group-focus-within:pointer-events-auto group-focus-within:w-56 group-focus-within:border-neutral-200 group-focus-within:bg-neutral-50 group-focus-within:px-2 group-focus-within:py-1.5 group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:w-56 group-hover:border-neutral-200 group-hover:bg-neutral-50 group-hover:px-2 group-hover:py-1.5 group-hover:opacity-100",
          open &&
            "pointer-events-auto w-56 border-neutral-200 bg-neutral-50 px-2 py-1.5 opacity-100",
        )}
        data-workspace-zoom-slider="true"
      >
        <span className="w-9 text-right text-xs tabular-nums text-neutral-600">
          {zoomPercent}%
        </span>
        <input
          aria-label="Canvas zoom"
          className="h-2 min-w-0 flex-1 cursor-ew-resize accent-neutral-950"
          data-workspace-zoom-range="true"
          max={140}
          min={50}
          onChange={(event) =>
            onZoomChange(Number(event.currentTarget.value) / 100)
          }
          onInput={(event) =>
            onZoomChange(Number(event.currentTarget.value) / 100)
          }
          onPointerDown={(event) => event.stopPropagation()}
          step={1}
          type="range"
          value={zoomPercent}
        />
        <span className="text-[0.68rem] text-neutral-500">140%</span>
      </div>
    </div>
  );
}

export function formatTemplateIoLabel(
  template: (typeof workflowNodeTemplates)[number],
) {
  const inputs = template.ports
    .filter((port) => port.direction === "input")
    .map((port) => formatPortDisplayLabel(port.label));
  const outputs = template.ports
    .filter((port) => port.direction === "output")
    .map((port) => formatPortDisplayLabel(port.label));

  return `${template.title}: Input ${formatPortSummary(inputs)} -> Output ${formatPortSummary(outputs)}`;
}

function formatPortSummary(labels: string[]) {
  return labels.length > 0 ? labels.join(" + ") : "None";
}

function formatPortDisplayLabel(label: string) {
  if (label === "Lines") {
    return "Dialogue";
  }

  if (label === "Clip") {
    return "Video";
  }

  return label;
}

type ToolbarButtonProps = {
  label: string;
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

function ToolbarButton({
  label,
  children,
  active,
  disabled,
  onClick,
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          aria-pressed={active}
          disabled={disabled}
          onClick={onClick}
          className={cn(
            "size-9 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950",
            active &&
              "bg-neutral-950 text-white hover:bg-neutral-900 hover:text-white",
          )}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

type CanvasStatusBarProps = {
  edge: ReturnType<typeof findEdge>;
  node: WorkflowNode | null;
  notice: string;
  zoom: number;
};

function CanvasStatusBar({ edge, node, notice, zoom }: CanvasStatusBarProps) {
  return (
    <div className="pointer-events-none absolute bottom-5 left-5 z-30 flex max-w-[calc(50vw-8rem)] items-center gap-3 text-xs text-neutral-600">
      <span className="rounded-lg border border-neutral-200 bg-white/90 px-2 py-1 shadow-sm backdrop-blur">
        Asset manager
      </span>
      <span className="rounded-lg border border-neutral-200 bg-white/90 px-2 py-1 shadow-sm backdrop-blur">
        {Math.round(zoom * 100)}%
      </span>
      <span className="hidden rounded-lg border border-neutral-200 bg-white/90 px-2 py-1 shadow-sm backdrop-blur md:inline">
        {node
          ? `Selected: ${node.title}`
          : edge
            ? `Selected: ${connectionDataTypeLabel(edge.dataType)} edge`
            : notice}
      </span>
    </div>
  );
}

type ScriptNodeInlineEditorProps = {
  busy: boolean;
  error: string | null;
  historyOpen: boolean;
  input: ScriptNodeInput;
  messages: ScriptDialogueMessage[];
  responseMode: ScriptResponseMode;
  model: ScriptModelSelection;
  node: WorkflowNode;
  output: ScriptNodeOutput | null;
  task: ScriptTaskStatusResponse;
  viewportZoom: number;
  onGenerate: () => void;
  onHistoryOpenChange: (open: boolean) => void;
  onInputChange: <Field extends keyof ScriptNodeInput>(
    field: Field,
    value: ScriptNodeInput[Field],
  ) => void;
  onModelChange: (model: ScriptModelSelection) => void;
  onRevise: () => void;
};

function ScriptNodeInlineEditor({
  busy,
  error,
  historyOpen,
  input,
  messages,
  responseMode,
  model,
  node,
  output,
  task,
  viewportZoom,
  onGenerate,
  onHistoryOpenChange,
  onInputChange,
  onModelChange,
  onRevise,
}: ScriptNodeInlineEditorProps) {
  const promptReady = input.world_description.trim().length > 0;
  const left = node.position.x - (SCRIPT_INLINE_EDITOR_WIDTH - NODE_WIDTH) / 2;
  const top = node.position.y + NODE_HEIGHT + SCRIPT_INLINE_EDITOR_GAP;

  function handleAiRevise() {
    onRevise();
  }

  return (
    <div
      className="absolute z-30 flex flex-col"
      style={{
        left,
        top,
        width: SCRIPT_INLINE_EDITOR_WIDTH,
        transform: `scale(${getInlineEditorCompensationScale(viewportZoom)})`,
        transformOrigin: "top center",
      }}
      data-script-node-inline-editor="true"
      aria-label="Script node inline editor"
      onPointerDown={(event) => event.stopPropagation()}
    >
      {historyOpen ? (
        <div className="mb-3" data-script-node-history="true">
          <ScriptOutputTabs
            error={error}
            input={input}
            messages={messages}
            output={output}
            responseMode={responseMode}
            task={task}
            onHide={() => onHistoryOpenChange(false)}
          />
        </div>
      ) : null}

      <section
        className="rounded-xl border border-neutral-200 bg-white/95 p-3 text-neutral-950 shadow-[0_20px_60px_rgba(15,23,42,0.14)] backdrop-blur"
        data-script-node-input-composer="true"
      >
        <label htmlFor="script-node-world-input" className="sr-only">
          {SCRIPT_WORLD_DESCRIPTION_LABEL}
        </label>
        <Textarea
          id="script-node-world-input"
          value={input.world_description}
          onChange={(event) =>
            onInputChange("world_description", event.target.value)
          }
          placeholder={SCRIPT_WORLD_DESCRIPTION_PLACEHOLDER}
          disabled={busy}
          aria-label={SCRIPT_WORLD_DESCRIPTION_LABEL}
          onKeyDown={(event) => event.stopPropagation()}
          className="min-h-20 resize-none border-0 bg-transparent px-0 text-sm shadow-none placeholder:text-neutral-400 focus-visible:ring-0"
        />

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-neutral-200 pt-3">
          <div className="flex items-center gap-2">
            <label htmlFor="script-model-select" className="sr-only">
              Script model
            </label>
            <select
              id="script-model-select"
              aria-label="Script model"
              className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 shadow-sm"
              data-script-model-select="true"
              disabled={busy}
              value={model}
              onChange={(event) =>
                onModelChange(event.target.value as ScriptModelSelection)
              }
            >
              {scriptModelOptions.map((modelOption) => (
                <option key={modelOption.id} value={modelOption.id}>
                  {modelOption.label}
                </option>
              ))}
            </select>
            <Button
              className="h-9 rounded-lg px-3 text-xs"
              data-script-ai-revise="true"
              disabled={busy || !promptReady}
              onClick={handleAiRevise}
              type="button"
              variant="outline"
            >
              {SCRIPT_REVISE_LABEL}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              aria-label="Generate Script node"
              className="h-9 rounded-lg px-4 text-xs"
              disabled={busy || !promptReady}
              onClick={onGenerate}
              type="button"
            >
              {busy ? SCRIPT_GENERATING_LABEL : SCRIPT_GENERATE_LABEL}
              <Sparkles aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

type ImageNodeFloatingEditorProps = {
  frame: ImageEditorFrame;
  node: WorkflowNode;
  prompt: string;
  responseOpen: boolean;
  onClose: () => void;
  onFrameChange: (frame: ImageEditorFrame) => void;
  onPromptChange: (prompt: string) => void;
  onResponseOpenChange: (open: boolean) => void;
};

export function ImageNodeFloatingEditor({
  frame,
  node,
  prompt,
  responseOpen,
  onClose,
  onFrameChange,
  onPromptChange,
  onResponseOpenChange,
}: ImageNodeFloatingEditorProps) {
  const [interaction, setInteraction] = useState<ImageEditorInteraction>(null);
  const promptReady = prompt.trim().length > 0;

  useEffect(() => {
    if (!interaction) {
      return;
    }

    const activeInteraction = interaction;

    function handlePointerMove(event: PointerEvent) {
      const deltaX = event.clientX - activeInteraction.startClient.x;
      const deltaY = event.clientY - activeInteraction.startClient.y;
      const nextFrame =
        activeInteraction.mode === "drag"
          ? {
              ...activeInteraction.startFrame,
              x: activeInteraction.startFrame.x + deltaX,
              y: activeInteraction.startFrame.y + deltaY,
            }
          : {
              ...activeInteraction.startFrame,
              width: activeInteraction.startFrame.width + deltaX,
              height: activeInteraction.startFrame.height + deltaY,
            };

      onFrameChange(
        clampImageEditorFrame(nextFrame, {
          width: window.innerWidth,
          height: window.innerHeight,
        }),
      );
    }

    function handlePointerUp() {
      setInteraction(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [interaction, onFrameChange]);

  function startInteraction(
    event: ReactPointerEvent<HTMLElement>,
    mode: NonNullable<ImageEditorInteraction>["mode"],
  ) {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setInteraction({
      mode,
      startClient: { x: event.clientX, y: event.clientY },
      startFrame: frame,
    });
  }

  function showResponse() {
    onResponseOpenChange(true);
  }

  return (
    <aside
      aria-label="Image node editor"
      className="absolute z-50 flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white/95 text-neutral-950 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur"
      data-image-node-editor="true"
      onPointerDown={(event) => event.stopPropagation()}
      style={{
        left: frame.x,
        top: frame.y,
        width: frame.width,
        height: frame.height,
      }}
    >
      <div
        className="flex cursor-grab items-start justify-between gap-3 border-b border-neutral-200 px-4 py-3 active:cursor-grabbing"
        data-image-node-drag-handle="true"
        onPointerDown={(event) => startInteraction(event, "drag")}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{node.title}</p>
          <p className="truncate text-xs text-neutral-500">
            Image popup comparison
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="border-neutral-200 bg-neutral-50 text-neutral-600">
            {node.status}
          </Badge>
          <Button
            aria-label="Close Image node editor"
            className="size-8 rounded-lg"
            onClick={onClose}
            type="button"
            variant="ghost"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4">
        {responseOpen ? (
          <section
            className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-50 p-4"
            data-image-node-response="true"
          >
            <AssistantResponseBubble title="Image Agent">
              <AIResponseTyping
                showCursor={false}
                speed={12}
                text={`Image prompt draft for ${node.title}: ${promptReady ? prompt.trim() : "No prompt yet."} Image generation is still deferred.`}
                thinkingState="typing"
              />
            </AssistantResponseBubble>
          </section>
        ) : (
          <section className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-6 text-center text-xs leading-5 text-neutral-500">
            Select AI modify or Generate to show the image-node response here.
          </section>
        )}

        <section className="shrink-0 rounded-xl border border-neutral-200 bg-white p-3">
          <label htmlFor="image-node-prompt" className="sr-only">
            Image prompt
          </label>
          <Textarea
            id="image-node-prompt"
            aria-label="Image prompt"
            className="min-h-20 resize-none border-0 bg-transparent px-0 text-sm shadow-none placeholder:text-neutral-400 focus-visible:ring-0"
            onChange={(event) => onPromptChange(event.target.value)}
            placeholder="Describe the image frame, location, character pose, wardrobe, lighting, and mood..."
            value={prompt}
          />

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-neutral-200 pt-3">
            <div className="flex items-center gap-2">
              <label htmlFor="image-model-select" className="sr-only">
                Image model
              </label>
              <select
                id="image-model-select"
                aria-label="Image model"
                className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 shadow-sm"
                data-image-model-select="true"
                defaultValue="mock"
              >
                <option value="mock">Mock image model</option>
                <option value="configured">Configured model</option>
              </select>
              <Button
                className="h-9 rounded-lg px-3 text-xs"
                data-image-ai-revise="true"
                disabled={!promptReady}
                onClick={showResponse}
                type="button"
                variant="outline"
              >
                {"AI\u4fee\u6539"}
              </Button>
            </div>

            <Button
              aria-label="Generate Image node"
              className="h-9 rounded-lg px-4 text-xs"
              disabled={!promptReady}
              onClick={showResponse}
              type="button"
            >
              Generate
              <Sparkles aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </section>
      </div>

      <button
        aria-label="Resize Image node editor"
        className="absolute bottom-1 right-1 size-5 cursor-nwse-resize rounded-sm border-b-2 border-r-2 border-neutral-300"
        data-image-node-resize-handle="true"
        onPointerDown={(event) => startInteraction(event, "resize")}
        type="button"
      />
    </aside>
  );
}

type ScriptOutputTabsProps = {
  error?: string | null;
  input: ScriptNodeInput;
  messages: ScriptDialogueMessage[];
  output: ScriptNodeOutput | null;
  responseMode: ScriptResponseMode;
  task: ScriptTaskStatusResponse;
  onHide?: () => void;
};

export function ScriptOutputTabs({
  error,
  input,
  messages,
  output,
  responseMode,
  task,
  onHide,
}: ScriptOutputTabsProps) {
  const promptText = input.world_description.trim();
  const hasDialogueMessages = messages.length > 0;
  const statusLabel =
    responseMode === "revise" && !error && task.status === "running"
      ? SCRIPT_REVISE_STATUS_LABEL
      : responseMode === "revise" && !error && hasDialogueMessages
        ? SCRIPT_DIALOGUE_READY_LABEL
        : getScriptResponseStatusLabel(task, output, error);
  const statusDetail = error ?? task.error ?? null;

  return (
    <section
      className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white/95 text-neutral-950 shadow-[0_20px_60px_rgba(15,23,42,0.14)] backdrop-blur"
      style={{ height: SCRIPT_RESPONSE_PANEL_HEIGHT }}
      data-script-node-output-panel="true"
    >
      <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">Storyboard AI</p>
            <Badge
              className={cn(
                "border-neutral-200 bg-neutral-50 text-neutral-600",
                statusLabel === "Ready" &&
                  "border-emerald-200 bg-emerald-50 text-emerald-700",
                statusLabel === SCRIPT_REVISE_STATUS_LABEL &&
                  "border-sky-200 bg-sky-50 text-sky-700",
                statusLabel === SCRIPT_DIALOGUE_READY_LABEL &&
                  "border-sky-200 bg-sky-50 text-sky-700",
                statusLabel === "Error" &&
                  "border-red-200 bg-red-50 text-red-700",
              )}
              data-script-node-response-status="true"
            >
              {statusLabel}
            </Badge>
          </div>
          {statusDetail ? (
            <p className="mt-1 truncate text-xs text-red-700">{statusDetail}</p>
          ) : null}
        </div>
        {onHide ? (
          <Button
            aria-label="Hide Script response"
            className="h-8 rounded-lg px-3 text-xs"
            onClick={onHide}
            type="button"
            variant="ghost"
          >
            Hide
          </Button>
        ) : null}
      </div>

      <div
        className="flex-1 overflow-y-auto p-4"
        data-script-node-output-scroll="true"
      >
        {hasDialogueMessages
          ? messages.map((message, index) =>
              message.role === "user" ? (
                <UserPromptBubble key={`${message.role}-${index}`}>
                  {message.content}
                </UserPromptBubble>
              ) : (
                <AssistantResponseBubble
                  key={`${message.role}-${index}`}
                  title={SCRIPT_REVISE_LABEL}
                >
                  <p className="whitespace-pre-line">{message.content}</p>
                </AssistantResponseBubble>
              ),
            )
          : promptText ? (
              <UserPromptBubble>{promptText}</UserPromptBubble>
            ) : null}

        {statusLabel === "Error" && statusDetail ? (
          <AssistantResponseBubble title="AI">
            <p className="text-red-700">{statusDetail}</p>
          </AssistantResponseBubble>
        ) : null}

        {task.status === "running" ? (
          <AssistantResponseBubble title="AI">
            <AIResponseTyping
              showCursor
              speed={12}
              text=""
              thinkingState="thinking"
            />
          </AssistantResponseBubble>
        ) : null}

        {output &&
        task.status !== "running" &&
        !statusDetail &&
        responseMode === "generation" ? (
          <AssistantResponseBubble title="AI">
            <p className="whitespace-pre-line">
              {formatScriptOutputConversationReply(output)}
            </p>
          </AssistantResponseBubble>
        ) : null}
      </div>
    </section>
  );
}

type AssistantResponseBubbleProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

function AssistantResponseBubble({
  title,
  subtitle,
  children,
}: AssistantResponseBubbleProps) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl rounded-tl-md border border-neutral-200 bg-white p-4 text-xs leading-5 text-neutral-700 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-neutral-950">{title}</p>
        {subtitle ? (
          <p className="text-xs text-neutral-500">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function UserPromptBubble({ children }: { children: ReactNode }) {
  return (
    <section className="mb-3 ml-auto max-w-[82%] rounded-2xl rounded-tr-md bg-neutral-950 px-4 py-3 text-xs leading-5 text-white shadow-sm">
      {children}
    </section>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => (
        <li key={item}>- {item}</li>
      ))}
    </ul>
  );
}

type WorkflowNodeCardProps = {
  node: WorkflowNode;
  scriptInput: ScriptNodeInput | null;
  scriptOutput: ScriptNodeOutput | null;
  selected: boolean;
  pendingPort: WorkflowPort | null;
  onDragStart: (
    event: ReactPointerEvent<HTMLButtonElement>,
    node: WorkflowNode,
  ) => void;
  onSelect: (selection: WorkflowSelection) => void;
  onPortConnectionStart: (
    event: ReactPointerEvent<HTMLButtonElement>,
    port: WorkflowPort,
  ) => void;
};

function WorkflowNodeCard({
  node,
  scriptInput,
  scriptOutput,
  selected,
  pendingPort,
  onDragStart,
  onSelect,
  onPortConnectionStart,
}: WorkflowNodeCardProps) {
  const Icon = nodeIcons[node.type];
  const inputs = node.ports.filter((port) => port.direction === "input");
  const outputs = node.ports.filter((port) => port.direction === "output");
  const scriptPreview = formatScriptNodePreview(scriptInput, scriptOutput);

  return (
    <article
      className={cn(
        "absolute rounded-lg border bg-white text-neutral-950 shadow-[0_18px_50px_rgba(15,23,42,0.12)] transition",
        selected
          ? "border-neutral-950/70"
          : "border-neutral-200 hover:border-neutral-300",
      )}
      data-workflow-node={node.type}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: NODE_WIDTH,
        minHeight: NODE_HEIGHT,
      }}
    >
      <div className="absolute -top-7 left-0 flex items-center gap-1 text-xs font-medium text-neutral-500">
        <Icon aria-hidden="true" />
        <span>{nodeTitles[node.type]}</span>
      </div>

      <button
        type="button"
        className="flex w-full cursor-grab items-start gap-3 rounded-t-lg px-4 py-4 text-left active:cursor-grabbing"
        onPointerDown={(event) => onDragStart(event, node)}
        onClick={() => onSelect({ kind: "node", id: node.id })}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
          <Icon aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">
            {node.title}
          </span>
          <span className="block truncate text-xs text-neutral-500">
            {node.id}
          </span>
        </span>
        <Badge className="border-neutral-200 bg-neutral-50 text-neutral-700">
          {node.status}
        </Badge>
      </button>

      <div className="px-4 pb-4">
        {node.type === "script" ? (
          <div className="max-h-28 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs leading-5 text-neutral-700">
            <p className="font-semibold text-neutral-950">
              {scriptPreview.heading}
            </p>
            <p>{scriptPreview.body}</p>
          </div>
        ) : node.type === "storyboard" ? (
          <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
            <div className="mb-3 flex items-center justify-center">
              <div className="flex flex-col gap-1.5">
                <span className="block h-1 w-8 rounded bg-neutral-400" />
                <span className="block h-1 w-8 rounded bg-neutral-400" />
                <span className="block h-1 w-8 rounded bg-neutral-400" />
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-2 text-center text-[11px] text-neutral-500">
              <span>Confirm shot</span>
              <span className="font-semibold text-neutral-950">
                Draw assets
              </span>
              <span>Compose lines</span>
            </div>
          </div>
        ) : node.type === "composition" || node.type === "video" ? (
          <div className="flex h-24 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50">
            <Film aria-hidden="true" className="text-neutral-500" />
          </div>
        ) : (
          <div className="flex h-24 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50">
            <Image aria-hidden="true" className="text-neutral-500" />
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
          <span>{inputs.length} inputs</span>
          <span>{outputs.length} outputs</span>
        </div>
      </div>

      {inputs.map((port, index) => (
        <PortButton
          key={port.id}
          port={port}
          index={index}
          compatible={
            pendingPort?.direction === "output" &&
            pendingPort.nodeId !== port.nodeId &&
            (port.accepts ?? [port.dataType]).includes(pendingPort.dataType)
          }
          onConnectionStart={onPortConnectionStart}
        />
      ))}
      {outputs.map((port, index) => (
        <PortButton
          key={port.id}
          port={port}
          index={index}
          compatible={pendingPort?.id === port.id}
          onConnectionStart={onPortConnectionStart}
        />
      ))}
    </article>
  );
}

type PortButtonProps = {
  port: WorkflowPort;
  index: number;
  compatible: boolean;
  onConnectionStart: (
    event: ReactPointerEvent<HTMLButtonElement>,
    port: WorkflowPort,
  ) => void;
};

function PortButton({
  port,
  index,
  compatible,
  onConnectionStart,
}: PortButtonProps) {
  const leftSide = port.direction === "input";

  return (
    <button
      type="button"
      className={cn(
        "absolute flex size-5 items-center justify-center rounded-full border bg-white text-[0px] shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20",
        leftSide ? "-left-2.5" : "-right-2.5",
        compatible
          ? "border-neutral-950 bg-neutral-950 text-white"
          : "border-neutral-300 hover:border-neutral-950",
      )}
      style={{ top: PORT_TOP + index * PORT_GAP }}
      aria-label={`${port.direction} ${port.label} ${port.dataType} port`}
      data-workflow-port-direction={port.direction}
      data-workflow-port-id={port.id}
      onPointerDown={(event) => onConnectionStart(event, port)}
    >
      <CircleDot aria-hidden="true" />
    </button>
  );
}

type WorkflowEdgesProps = {
  connectionPreview: ConnectionDragState;
  state: WorkflowGraphState;
  onSelect: (selection: WorkflowSelection) => void;
};

function WorkflowEdges({
  connectionPreview,
  state,
  onSelect,
}: WorkflowEdgesProps) {
  const previewPath = connectionPreview
    ? makeConnectionPreviewPath(state, connectionPreview)
    : null;

  return (
    <svg
      className="absolute left-0 top-0"
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      aria-label="Workflow connections"
    >
      {state.edges.map((edge) => {
        const sourceNode = findNode(state.nodes, edge.sourceNodeId);
        const targetNode = findNode(state.nodes, edge.targetNodeId);

        if (!sourceNode || !targetNode) {
          return null;
        }

        const sourcePort = findPort(state.nodes, edge.sourcePortId);
        const targetPort = findPort(state.nodes, edge.targetPortId);
        const sourcePoint = portPoint(sourceNode, sourcePort);
        const targetPoint = portPoint(targetNode, targetPort);
        const selected =
          state.selection.kind === "edge" && state.selection.id === edge.id;
        const midX = sourcePoint.x + (targetPoint.x - sourcePoint.x) / 2;
        const path = `M ${sourcePoint.x} ${sourcePoint.y} C ${midX} ${sourcePoint.y}, ${midX} ${targetPoint.y}, ${targetPoint.x} ${targetPoint.y}`;

        return (
          <g key={edge.id}>
            <path
              d={path}
              stroke="transparent"
              strokeWidth="18"
              fill="none"
              className="cursor-pointer"
              data-workflow-edge-hit="true"
              onClick={() => onSelect({ kind: "edge", id: edge.id })}
            />
            <path
              d={path}
              stroke={
                selected ? "rgba(15,23,42,0.9)" : "rgba(100,116,139,0.55)"
              }
              strokeWidth={selected ? "3" : "2"}
              fill="none"
              pointerEvents="none"
            />
            <text
              x={midX}
              y={(sourcePoint.y + targetPoint.y) / 2 - 8}
              textAnchor="middle"
              className="fill-neutral-500 text-[11px]"
              pointerEvents="none"
            >
              {edge.label}
            </text>
          </g>
        );
      })}
      {previewPath ? (
        <path
          d={previewPath}
          stroke="rgba(15,23,42,0.82)"
          strokeDasharray="7 7"
          strokeWidth="2.5"
          fill="none"
          pointerEvents="none"
        />
      ) : null}
    </svg>
  );
}

function makeConnectionPreviewPath(
  state: WorkflowGraphState,
  connectionPreview: NonNullable<ConnectionDragState>,
) {
  const sourcePort = findPort(state.nodes, connectionPreview.sourcePortId);
  const sourceNode = findNode(state.nodes, sourcePort.nodeId);

  if (!sourceNode) {
    return null;
  }

  const sourcePoint = portPoint(sourceNode, sourcePort);
  const midX =
    sourcePoint.x + (connectionPreview.pointer.x - sourcePoint.x) / 2;

  return `M ${sourcePoint.x} ${sourcePoint.y} C ${midX} ${sourcePoint.y}, ${midX} ${connectionPreview.pointer.y}, ${connectionPreview.pointer.x} ${connectionPreview.pointer.y}`;
}

function portPoint(node: WorkflowNode, port: WorkflowPort) {
  const directionPorts = node.ports.filter(
    (candidate) => candidate.direction === port.direction,
  );
  const index = Math.max(
    0,
    directionPorts.findIndex((candidate) => candidate.id === port.id),
  );

  return {
    x:
      port.direction === "input"
        ? node.position.x
        : node.position.x + NODE_WIDTH,
    y: node.position.y + PORT_TOP + index * PORT_GAP + 10,
  };
}
