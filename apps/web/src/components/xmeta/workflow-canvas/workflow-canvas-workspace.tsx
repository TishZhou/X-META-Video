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
  Loader2,
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
} from "lucide-react";
import {
  DEFAULT_SCRIPT_NODE_INPUT,
  SCRIPT_CONTENT_TYPES,
  type ScriptContentType,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { runScriptGeneration } from "@/lib/script-node/api";
import { cn } from "@/lib/utils";

const NODE_WIDTH = 288;
const NODE_HEIGHT = 178;
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

type ScriptGenerationRunner = typeof runScriptGeneration;

const defaultScriptInput: ScriptNodeInput = {
  ...DEFAULT_SCRIPT_NODE_INPUT,
  creative_brief:
    "A time-travel strategist wakes inside a palace court and must turn one rumor into a survival plan before sunrise.",
  theme: "identity, ambition, and trust",
  world_setting: "Tang-inspired palace court with comic tension",
  constraints: ["3 main characters", "60-90 second pacing", "no explicit violence"],
  references: ["fast hook", "palace intrigue", "clear cliffhanger"],
};

const contentTypeLabels = {
  comic_drama: "Comic drama",
  mv: "MV",
  short_video: "Short video",
} satisfies Record<ScriptContentType, string>;

const emptyScriptTask: ScriptTaskStatusResponse = {
  task_id: "not_started",
  project_id: "local-project",
  node_id: "script-1",
  status: "queued",
  error: null,
};

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
  scriptGenerationRunner = runScriptGeneration,
}: {
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
  const [connectionDrag, setConnectionDrag] = useState<ConnectionDragState>(null);
  const [scriptInput, setScriptInput] = useState<ScriptNodeInput>(defaultScriptInput);
  const [scriptOutput, setScriptOutput] = useState<ScriptNodeOutput | null>(null);
  const [scriptTask, setScriptTask] =
    useState<ScriptTaskStatusResponse>(emptyScriptTask);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [scriptBusy, setScriptBusy] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const selectedNode =
    state.selection.kind === "node"
      ? findNode(state.nodes, state.selection.id)
      : null;
  const selectedEdge =
    state.selection.kind === "edge" ? findEdge(state.edges, state.selection.id) : null;
  const selectedScriptNode = selectedNode?.type === "script" ? selectedNode : null;
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
        viewport: calculateInitialCanvasViewport(window.innerWidth, window.innerHeight),
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
      window.visualViewport?.removeEventListener("resize", applyResponsiveViewport);
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
        position: {
          x: Math.max(16, point.x - dragState.offset.x),
          y: Math.max(16, point.y - dragState.offset.y),
        },
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
        "[data-workflow-node], [data-workflow-edge-hit], button, [data-workspace-bottom-toolbar], [data-workspace-floating-topbar]",
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
          .closest<HTMLButtonElement>('button[data-workflow-port-direction="input"]')
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
          notice: "Connection cancelled. Drop the line on a compatible input port.",
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

  function updateScriptListInput(
    field: "constraints" | "references",
    value: string,
  ) {
    updateScriptInput(
      field,
      value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    );
  }

  async function generateScriptNode() {
    if (!selectedScriptNode) {
      setScriptError("Select a Script node before running generation.");
      return;
    }

    if (!scriptInput.creative_brief.trim()) {
      setScriptError("Creative brief is required before generation.");
      dispatch({
        type: "setNodeStatus",
        nodeId: selectedScriptNode.id,
        status: "blocked",
        notice: "Script generation blocked: creative brief is required.",
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
        settings: { provider: "mock" },
      });

      setScriptTask(result.task);
      setScriptOutput(result.output);
      dispatch({
        type: "setNodeStatus",
        nodeId: selectedScriptNode.id,
        status: "ready",
        notice: "Script output is ready. Downstream media nodes remain deferred.",
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

  return (
    <TooltipProvider>
      <ReactFlowProvider>
        <section
          aria-label="Workflow canvas"
          className="relative min-h-screen overflow-hidden bg-[#0b0b0c] text-neutral-100"
          data-workspace-canvas-page="true"
        >
          <div
            className="absolute inset-0"
            aria-hidden="true"
            style={{
              backgroundImage:
                "radial-gradient(circle at center, rgba(255,255,255,0.13) 1px, transparent 1.3px)",
              backgroundSize: "18px 18px",
            }}
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.035),transparent_42%)]"
            aria-hidden="true"
          />

          <WorkspaceTopBar
            draftStatus={state.draftStatus}
            edgeCount={state.edges.length}
            nodeCount={state.nodes.length}
          />
          <div
            className="pointer-events-none absolute left-4 top-16 z-30 max-w-[calc(100vw-2rem)] rounded-lg border border-white/10 bg-neutral-900/85 px-3 py-1.5 text-xs text-neutral-300 shadow-2xl backdrop-blur"
            data-workspace-boundary-label="true"
          >
            Local only / FastAPI deferred / AI disabled
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
                onSelect={(selection) => dispatch({ type: "select", selection })}
              />
              {state.nodes.map((node) => (
                <WorkflowNodeCard
                  key={node.id}
                  node={node}
                  scriptOutput={node.type === "script" ? scriptOutput : null}
                  selected={
                    state.selection.kind === "node" && state.selection.id === node.id
                  }
                  pendingPort={pendingPort}
                  onDragStart={startNodeDrag}
                  onSelect={(selection) => dispatch({ type: "select", selection })}
                  onPortConnectionStart={startPortConnection}
                />
              ))}
            </div>
          </div>

          <CanvasStatusBar
            edge={selectedEdge}
            node={selectedNode}
            notice={state.notice}
            zoom={state.viewport.zoom}
          />

          {selectedScriptNode ? (
            <ScriptNodeEditor
              busy={scriptBusy}
              error={scriptError}
              input={scriptInput}
              output={scriptOutput}
              task={scriptTask}
              onGenerate={generateScriptNode}
              onListInputChange={updateScriptListInput}
              onInputChange={updateScriptInput}
            />
          ) : null}

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
      <div className="pointer-events-auto flex items-center gap-2 rounded-xl border border-white/10 bg-neutral-900/90 px-3 py-2 shadow-2xl backdrop-blur">
        <div className="flex size-7 items-center justify-center rounded-md bg-white text-neutral-950">
          <Layers3 aria-hidden="true" />
        </div>
        <span className="text-sm font-semibold">Untitled project</span>
        <Separator orientation="vertical" className="h-5 bg-white/10" />
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs text-neutral-200 hover:bg-white/10 hover:text-white"
        >
          Canvas 1
        </Button>
      </div>

      <div className="pointer-events-auto flex items-center gap-2">
        <Badge className="border-white/10 bg-neutral-900/90 text-neutral-200">
          {draftStatus}
        </Badge>
        <Badge className="border-white/10 bg-neutral-900/90 text-neutral-200">
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
          className="absolute bottom-14 left-0 w-72 overflow-hidden rounded-xl border border-white/10 bg-neutral-900/95 p-1.5 shadow-2xl backdrop-blur sm:left-1/2 sm:-translate-x-1/2"
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
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-100 transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  onClick={() => onAddNode(template.type)}
                >
                  {ioLabel}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-white/10 bg-neutral-900/95 p-2 shadow-2xl backdrop-blur">
        <ToolbarButton active={showAddMenu} label="Add node" onClick={onToggleAddMenu}>
          <Plus aria-hidden="true" data-icon="inline-start" />
        </ToolbarButton>
        <Separator orientation="vertical" className="mx-1 h-7 bg-white/10" />
        <ZoomControl
          open={showZoomControl}
          zoom={zoom}
          onToggle={onZoomToggle}
          onZoomChange={onZoomChange}
        />
        <Separator orientation="vertical" className="mx-1 h-7 bg-white/10" />
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
          "pointer-events-none flex w-0 items-center gap-2 overflow-hidden rounded-lg border border-transparent opacity-0 transition-all group-focus-within:pointer-events-auto group-focus-within:w-56 group-focus-within:border-white/10 group-focus-within:bg-white/[0.04] group-focus-within:px-2 group-focus-within:py-1.5 group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:w-56 group-hover:border-white/10 group-hover:bg-white/[0.04] group-hover:px-2 group-hover:py-1.5 group-hover:opacity-100",
          open &&
            "pointer-events-auto w-56 border-white/10 bg-white/[0.04] px-2 py-1.5 opacity-100",
        )}
        data-workspace-zoom-slider="true"
      >
        <span className="w-9 text-right text-xs tabular-nums text-neutral-300">
          {zoomPercent}%
        </span>
        <input
          aria-label="Canvas zoom"
          className="h-2 min-w-0 flex-1 cursor-ew-resize accent-white"
          data-workspace-zoom-range="true"
          max={140}
          min={50}
          onChange={(event) => onZoomChange(Number(event.currentTarget.value) / 100)}
          onInput={(event) => onZoomChange(Number(event.currentTarget.value) / 100)}
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

export function formatTemplateIoLabel(template: (typeof workflowNodeTemplates)[number]) {
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
            "size-9 rounded-lg text-neutral-300 hover:bg-white/10 hover:text-white",
            active && "bg-white text-neutral-950 hover:bg-white hover:text-neutral-950",
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
    <div className="pointer-events-none absolute bottom-5 left-5 z-30 flex max-w-[calc(50vw-8rem)] items-center gap-3 text-xs text-neutral-400">
      <span className="rounded-lg bg-neutral-900/80 px-2 py-1 backdrop-blur">
        Asset manager
      </span>
      <span className="rounded-lg bg-neutral-900/80 px-2 py-1 backdrop-blur">
        {Math.round(zoom * 100)}%
      </span>
      <span className="hidden rounded-lg bg-neutral-900/80 px-2 py-1 backdrop-blur md:inline">
        {node
          ? `Selected: ${node.title}`
          : edge
            ? `Selected: ${connectionDataTypeLabel(edge.dataType)} edge`
            : notice}
      </span>
    </div>
  );
}

type ScriptNodeEditorProps = {
  busy: boolean;
  error: string | null;
  input: ScriptNodeInput;
  output: ScriptNodeOutput | null;
  task: ScriptTaskStatusResponse;
  onGenerate: () => void;
  onInputChange: <Field extends keyof ScriptNodeInput>(
    field: Field,
    value: ScriptNodeInput[Field],
  ) => void;
  onListInputChange: (field: "constraints" | "references", value: string) => void;
};

function ScriptNodeEditor({
  busy,
  error,
  input,
  output,
  task,
  onGenerate,
  onInputChange,
  onListInputChange,
}: ScriptNodeEditorProps) {
  const briefReady = input.creative_brief.trim().length > 0;

  return (
    <aside
      className="absolute right-5 top-20 z-40 flex max-h-[calc(100vh-8rem)] w-[32rem] max-w-[calc(100vw-2.5rem)] flex-col gap-3 overflow-hidden rounded-lg border border-white/10 bg-neutral-950/95 p-4 text-neutral-100 shadow-2xl backdrop-blur"
      data-script-node-editor="true"
      aria-label="Script node editor"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Script Node</p>
          <p className="text-xs text-neutral-400">
            Input/output API flow. Prompt wording stays backend-owned.
          </p>
        </div>
        <Badge className="border-white/10 bg-white/5 text-neutral-200">
          {task.status}
        </Badge>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[1fr_1.1fr] gap-3 overflow-hidden">
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto pr-1">
          <ScriptField label="Creative brief" required>
            <Textarea
              aria-label="Creative brief"
              className="min-h-28 border-white/10 bg-white/[0.03] text-neutral-100 placeholder:text-neutral-500"
              value={input.creative_brief}
              onChange={(event) =>
                onInputChange("creative_brief", event.currentTarget.value)
              }
            />
          </ScriptField>

          <ScriptField label="Content type">
            <div className="flex flex-wrap gap-1.5">
              {SCRIPT_CONTENT_TYPES.map((contentType) => (
                <Button
                  key={contentType}
                  type="button"
                  size="sm"
                  variant={input.content_type === contentType ? "default" : "outline"}
                  className={cn(
                    "h-8 border-white/10",
                    input.content_type !== contentType &&
                      "bg-transparent text-neutral-200 hover:bg-white/10 hover:text-white",
                  )}
                  onClick={() => onInputChange("content_type", contentType)}
                >
                  {contentTypeLabels[contentType]}
                </Button>
              ))}
            </div>
          </ScriptField>

          <div className="grid grid-cols-2 gap-2">
            <CompactTextField
              label="Style"
              value={input.style}
              onChange={(value) => onInputChange("style", value)}
            />
            <CompactTextField
              label="Theme"
              value={input.theme}
              onChange={(value) => onInputChange("theme", value)}
            />
          </div>

          <CompactTextField
            label="World setting"
            value={input.world_setting}
            onChange={(value) => onInputChange("world_setting", value)}
          />

          <div className="grid grid-cols-2 gap-2">
            <ScriptField label="Duration">
              <input
                aria-label="Duration seconds"
                className="h-9 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                min={15}
                max={7200}
                type="number"
                value={input.duration_seconds}
                onChange={(event) =>
                  onInputChange(
                    "duration_seconds",
                    Math.max(1, Number(event.currentTarget.value) || 1),
                  )
                }
              />
            </ScriptField>
            <CompactTextField
              label="Language"
              value={input.language}
              onChange={(value) => onInputChange("language", value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <CompactTextField
              label="Platform"
              value={input.target_platform}
              onChange={(value) => onInputChange("target_platform", value)}
            />
            <CompactTextField
              label="Audience"
              value={input.audience}
              onChange={(value) => onInputChange("audience", value)}
            />
          </div>

          <ScriptField label="Constraints">
            <Textarea
              aria-label="Constraints"
              className="min-h-20 border-white/10 bg-white/[0.03] text-neutral-100"
              value={input.constraints.join("\n")}
              onChange={(event) =>
                onListInputChange("constraints", event.currentTarget.value)
              }
            />
          </ScriptField>

          <ScriptField label="References">
            <Textarea
              aria-label="References"
              className="min-h-20 border-white/10 bg-white/[0.03] text-neutral-100"
              value={input.references.join("\n")}
              onChange={(event) =>
                onListInputChange("references", event.currentTarget.value)
              }
            />
          </ScriptField>

          {error ? (
            <p className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-100">
              {error}
            </p>
          ) : null}

          <Button
            type="button"
            className="w-full"
            disabled={busy || !briefReady}
            onClick={onGenerate}
          >
            {busy ? <Loader2 aria-hidden="true" data-icon="inline-start" /> : null}
            Generate structured script
          </Button>
        </div>

        <ScriptOutputTabs output={output} task={task} />
      </div>
    </aside>
  );
}

type ScriptFieldProps = {
  label: string;
  required?: boolean;
  children: ReactNode;
};

function ScriptField({ label, required, children }: ScriptFieldProps) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-medium text-neutral-300">
      <span>
        {label}
        {required ? <span className="text-neutral-500"> required</span> : null}
      </span>
      {children}
    </label>
  );
}

type CompactTextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function CompactTextField({ label, value, onChange }: CompactTextFieldProps) {
  return (
    <ScriptField label={label}>
      <input
        aria-label={label}
        className="h-9 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </ScriptField>
  );
}

type ScriptOutputTabsProps = {
  output: ScriptNodeOutput | null;
  task: ScriptTaskStatusResponse;
};

export function ScriptOutputTabs({ output, task }: ScriptOutputTabsProps) {
  if (!output) {
    return (
      <div
        className="flex min-h-0 flex-col justify-between rounded-lg border border-white/10 bg-white/[0.03] p-4"
        data-script-node-empty-output="true"
      >
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Structured output</p>
          <p className="text-xs leading-5 text-neutral-400">
            Run generation to receive plot, character, shot, dialogue, camera, and
            production fields as JSON-backed sections.
          </p>
        </div>
        <div className="rounded-md border border-white/10 bg-neutral-950/70 p-3 text-xs text-neutral-400">
          Task: {task.task_id} / {task.status}
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="overview" className="flex min-h-0 flex-col overflow-hidden">
      <TabsList className="grid h-auto grid-cols-5 bg-white/[0.06] text-neutral-300">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="characters">Characters</TabsTrigger>
        <TabsTrigger value="shots">Shots</TabsTrigger>
        <TabsTrigger value="lines">Lines</TabsTrigger>
        <TabsTrigger value="camera">Camera</TabsTrigger>
      </TabsList>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-b-lg border border-t-0 border-white/10 bg-white/[0.03] p-3">
        <TabsContent forceMount value="overview" className="m-0 flex flex-col gap-3">
          <OutputSection title={output.title}>
            <p>{output.logline}</p>
            <p>{output.plot_summary}</p>
            <Checklist items={output.story_beats.map((beat) => `${beat.beat}: ${beat.summary}`)} />
          </OutputSection>
        </TabsContent>
        <TabsContent forceMount value="characters" className="m-0 flex flex-col gap-3">
          {output.characters.map((character) => (
            <OutputSection key={character.name} title={character.name}>
              <p>{character.role}</p>
              <p>{character.personality}</p>
              <p>{character.visual_prompt}</p>
            </OutputSection>
          ))}
        </TabsContent>
        <TabsContent forceMount value="shots" className="m-0 flex flex-col gap-3">
          {output.shot_plan.map((shot) => (
            <OutputSection key={shot.shot_number} title={`Shot ${shot.shot_number}: ${shot.scene}`}>
              <p>{shot.action}</p>
              <p>{shot.dialogue}</p>
              <p>{shot.camera}</p>
              <p>{shot.image_prompt}</p>
            </OutputSection>
          ))}
        </TabsContent>
        <TabsContent forceMount value="lines" className="m-0 flex flex-col gap-3">
          {output.dialogue_or_lyrics.map((line) => (
            <OutputSection key={`${line.speaker}-${line.text}`} title={line.speaker}>
              <p>{line.text}</p>
              <p>{line.delivery}</p>
            </OutputSection>
          ))}
        </TabsContent>
        <TabsContent forceMount value="camera" className="m-0 flex flex-col gap-3">
          <OutputSection title="Camera notes">
            <Checklist items={output.camera_notes} />
          </OutputSection>
          <OutputSection title="Scene prompts">
            <Checklist items={output.scene_prompts} />
          </OutputSection>
          <OutputSection title="Audio notes">
            <Checklist items={output.audio_notes} />
          </OutputSection>
          <OutputSection title="Production checklist">
            <Checklist items={output.production_checklist} />
          </OutputSection>
        </TabsContent>
      </div>
    </Tabs>
  );
}

type OutputSectionProps = {
  title: string;
  children: ReactNode;
};

function OutputSection({ title, children }: OutputSectionProps) {
  return (
    <section className="flex flex-col gap-2 rounded-md border border-white/10 bg-neutral-950/70 p-3 text-xs leading-5 text-neutral-300">
      <h3 className="text-sm font-semibold text-neutral-100">{title}</h3>
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

  return (
    <article
      className={cn(
        "absolute rounded-lg border bg-[#242424] text-neutral-100 shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition",
        selected ? "border-white/70" : "border-white/10 hover:border-white/25",
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
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white/10 text-neutral-300">
          <Icon aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{node.title}</span>
          <span className="block truncate text-xs text-neutral-500">{node.id}</span>
        </span>
        <Badge className="border-white/10 bg-white/5 text-neutral-300">
          {node.status}
        </Badge>
      </button>

      <div className="px-4 pb-4">
        {node.type === "script" ? (
          <div className="max-h-28 overflow-hidden rounded-md border border-white/10 bg-[#111]/80 p-3 text-xs leading-5 text-neutral-200">
            <p className="font-semibold">
              {scriptOutput?.title ?? "Script Node API Ready"}
            </p>
            <p>
              {scriptOutput
                ? scriptOutput.logline
                : "Input brief -> structured plot, characters, shots, dialogue, and camera notes."}
            </p>
            <p>
              {scriptOutput
                ? `${scriptOutput.shot_plan.length} shots / ${scriptOutput.characters.length} characters`
                : "Provider: FastAPI mock by default"}
            </p>
          </div>
        ) : node.type === "storyboard" ? (
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-3 flex items-center justify-center">
              <div className="flex flex-col gap-1.5">
                <span className="block h-1 w-8 rounded bg-neutral-500" />
                <span className="block h-1 w-8 rounded bg-neutral-500" />
                <span className="block h-1 w-8 rounded bg-neutral-500" />
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-2 text-center text-[11px] text-neutral-400">
              <span>Confirm shot</span>
              <span className="font-semibold text-neutral-100">Draw assets</span>
              <span>Compose lines</span>
            </div>
          </div>
        ) : node.type === "composition" || node.type === "video" ? (
          <div className="flex h-24 items-center justify-center rounded-md border border-white/10 bg-white/[0.03]">
            <Film aria-hidden="true" className="text-neutral-500" />
          </div>
        ) : (
          <div className="flex h-24 items-center justify-center rounded-md border border-white/10 bg-white/[0.03]">
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

function PortButton({ port, index, compatible, onConnectionStart }: PortButtonProps) {
  const leftSide = port.direction === "input";

  return (
    <button
      type="button"
      className={cn(
        "absolute flex size-5 items-center justify-center rounded-full border bg-[#242424] text-[0px] shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
        leftSide ? "-left-2.5" : "-right-2.5",
        compatible ? "border-white bg-white" : "border-white/40 hover:border-white",
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

function WorkflowEdges({ connectionPreview, state, onSelect }: WorkflowEdgesProps) {
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
              stroke={selected ? "rgba(255,255,255,0.95)" : "rgba(148,163,184,0.62)"}
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
          stroke="rgba(255,255,255,0.9)"
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
  const midX = sourcePoint.x + (connectionPreview.pointer.x - sourcePoint.x) / 2;

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
    x: port.direction === "input" ? node.position.x : node.position.x + NODE_WIDTH,
    y: node.position.y + PORT_TOP + index * PORT_GAP + 10,
  };
}
