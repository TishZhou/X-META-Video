"use client";

import {
  ArrowDownToLine,
  Box,
  CircleDot,
  Film,
  FolderDown,
  Frame,
  Grid3X3,
  HelpCircle,
  Image,
  Layers3,
  Mic2,
  MousePointer2,
  Move,
  Plus,
  Save,
  Scissors,
  Share2,
  Sparkles,
  Trash2,
  UserRound,
  Video,
  Wand2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
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

export function WorkflowCanvasWorkspace() {
  const [state, dispatch] = useReducer(
    workflowGraphReducer,
    undefined,
    createInitialWorkflowGraphState,
  );
  const [mode, setMode] = useState<"select" | "move">("select");
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [pendingPortId, setPendingPortId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const selectedNode =
    state.selection.kind === "node"
      ? findNode(state.nodes, state.selection.id)
      : null;
  const selectedEdge =
    state.selection.kind === "edge" ? findEdge(state.edges, state.selection.id) : null;
  const pendingPort = useMemo(() => {
    if (!pendingPortId) {
      return null;
    }

    try {
      return findPort(state.nodes, pendingPortId);
    } catch {
      return null;
    }
  }, [pendingPortId, state.nodes]);

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
    if (!dragState) {
      return;
    }

    const point = getCanvasPoint(event);

    dispatch({
      type: "moveNode",
      nodeId: dragState.nodeId,
      position: {
        x: Math.max(16, point.x - dragState.offset.x),
        y: Math.max(16, point.y - dragState.offset.y),
      },
    });
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

  function selectPort(port: WorkflowPort) {
    if (port.direction === "output") {
      setPendingPortId(port.id);
      dispatch({
        type: "setNotice",
        notice: `Connect ${port.label} to a compatible input port.`,
      });
      return;
    }

    if (!pendingPortId) {
      dispatch({
        type: "setNotice",
        notice: "Start a connection from an output port first.",
      });
      return;
    }

    dispatch({
      type: "connect",
      sourcePortId: pendingPortId,
      targetPortId: port.id,
    });
    setPendingPortId(null);
  }

  function adjustZoom(delta: number) {
    const zoom = Math.min(1.4, Math.max(MIN_INITIAL_ZOOM, state.viewport.zoom + delta));

    dispatch({
      type: "setViewport",
      viewport: { ...state.viewport, zoom },
    });
  }

  function fitCanvasView() {
    dispatch({
      type: "setViewport",
      viewport: calculateInitialCanvasViewport(window.innerWidth, window.innerHeight),
      markDirty: false,
    });
    dispatch({
      type: "setNotice",
      notice: "Canvas fitted to current placeholder graph.",
    });
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
              mode === "move" ? "cursor-grab" : "cursor-default",
            )}
            data-workflow-canvas="viewport"
            role="application"
            aria-label="Figma-like workflow node canvas"
            tabIndex={0}
            onPointerMove={handlePointerMove}
            onPointerUp={() => setDragState(null)}
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
            >
              <WorkflowEdges
                state={state}
                onSelect={(selection) => dispatch({ type: "select", selection })}
              />
              {state.nodes.map((node) => (
                <WorkflowNodeCard
                  key={node.id}
                  node={node}
                  selected={
                    state.selection.kind === "node" && state.selection.id === node.id
                  }
                  pendingPort={pendingPort}
                  onDragStart={startNodeDrag}
                  onSelect={(selection) => dispatch({ type: "select", selection })}
                  onPortSelect={selectPort}
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

          <CanvasDock
            mode={mode}
            selection={state.selection}
            showAddMenu={showAddMenu}
            templates={workflowNodeTemplates}
            onAddNode={addNode}
            onDelete={() => dispatch({ type: "deleteSelection" })}
            onFit={fitCanvasView}
            onModeChange={setMode}
            onSave={() => dispatch({ type: "saveSnapshot" })}
            onRestore={() => dispatch({ type: "restoreSnapshot" })}
            onToggleAddMenu={() => setShowAddMenu((value) => !value)}
            onZoomIn={() => adjustZoom(0.1)}
            onZoomOut={() => adjustZoom(-0.1)}
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
  mode: "select" | "move";
  selection: WorkflowSelection;
  showAddMenu: boolean;
  templates: typeof workflowNodeTemplates;
  restoreDisabled: boolean;
  onAddNode: (nodeType: WorkflowNodeType) => void;
  onDelete: () => void;
  onFit: () => void;
  onModeChange: (mode: "select" | "move") => void;
  onSave: () => void;
  onRestore: () => void;
  onToggleAddMenu: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

function CanvasDock({
  mode,
  selection,
  showAddMenu,
  templates,
  restoreDisabled,
  onAddNode,
  onDelete,
  onFit,
  onModeChange,
  onSave,
  onRestore,
  onToggleAddMenu,
  onZoomIn,
  onZoomOut,
}: CanvasDockProps) {
  return (
    <div
      className="absolute bottom-5 left-2 right-2 z-40 sm:left-1/2 sm:right-auto sm:-translate-x-1/2"
      data-workspace-bottom-toolbar="true"
    >
      {showAddMenu ? (
        <div
          className="absolute bottom-14 left-0 right-0 grid max-h-[60vh] grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-white/10 bg-neutral-900/95 p-3 shadow-2xl backdrop-blur sm:left-1/2 sm:right-auto sm:w-[min(42rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:grid-cols-2 md:grid-cols-3"
          data-workspace-add-menu="true"
        >
          {templates.map((template) => {
            const Icon = nodeIcons[template.type];

            return (
              <button
                key={template.type}
                type="button"
                aria-label={`Add ${template.title} node`}
                className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-left text-sm text-neutral-100 transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                onClick={() => onAddNode(template.type)}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white/10">
                  <Icon aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block font-medium">{template.title}</span>
                  <span className="line-clamp-2 block text-xs text-neutral-400">
                    {template.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-white/10 bg-neutral-900/95 p-2 shadow-2xl backdrop-blur">
        <ToolbarButton active={showAddMenu} label="Add node" onClick={onToggleAddMenu}>
          <Plus aria-hidden="true" data-icon="inline-start" />
        </ToolbarButton>
        <Separator orientation="vertical" className="mx-1 h-7 bg-white/10" />
        <ToolbarButton
          active={mode === "select"}
          label="Select"
          onClick={() => onModeChange("select")}
        >
          <MousePointer2 aria-hidden="true" data-icon="inline-start" />
        </ToolbarButton>
        <ToolbarButton
          active={mode === "move"}
          label="Move"
          onClick={() => onModeChange("move")}
        >
          <Move aria-hidden="true" data-icon="inline-start" />
        </ToolbarButton>
        <ToolbarButton label="Fit view" onClick={onFit}>
          <Grid3X3 aria-hidden="true" data-icon="inline-start" />
        </ToolbarButton>
        <ToolbarButton label="Zoom out" onClick={onZoomOut}>
          <ZoomOut aria-hidden="true" data-icon="inline-start" />
        </ToolbarButton>
        <ToolbarButton label="Zoom in" onClick={onZoomIn}>
          <ZoomIn aria-hidden="true" data-icon="inline-start" />
        </ToolbarButton>
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

type WorkflowNodeCardProps = {
  node: WorkflowNode;
  selected: boolean;
  pendingPort: WorkflowPort | null;
  onDragStart: (
    event: ReactPointerEvent<HTMLButtonElement>,
    node: WorkflowNode,
  ) => void;
  onSelect: (selection: WorkflowSelection) => void;
  onPortSelect: (port: WorkflowPort) => void;
};

function WorkflowNodeCard({
  node,
  selected,
  pendingPort,
  onDragStart,
  onSelect,
  onPortSelect,
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
            <p className="font-semibold">《我在盛唐写天下》</p>
            <p>Type: historical / time-travel / comic drama</p>
            <p>Duration: 60-90 seconds</p>
            <p>Beat: cold open / palace conflict / reveal hook</p>
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
          onSelect={onPortSelect}
        />
      ))}
      {outputs.map((port, index) => (
        <PortButton
          key={port.id}
          port={port}
          index={index}
          compatible={pendingPort?.id === port.id}
          onSelect={onPortSelect}
        />
      ))}
    </article>
  );
}

type PortButtonProps = {
  port: WorkflowPort;
  index: number;
  compatible: boolean;
  onSelect: (port: WorkflowPort) => void;
};

function PortButton({ port, index, compatible, onSelect }: PortButtonProps) {
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
      onClick={() => onSelect(port)}
    >
      <CircleDot aria-hidden="true" />
    </button>
  );
}

type WorkflowEdgesProps = {
  state: WorkflowGraphState;
  onSelect: (selection: WorkflowSelection) => void;
};

function WorkflowEdges({ state, onSelect }: WorkflowEdgesProps) {
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
    </svg>
  );
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
