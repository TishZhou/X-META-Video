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
  Mic2,
  MousePointer2,
  Move,
  PanelRight,
  Plus,
  Save,
  Scissors,
  Sparkles,
  Trash2,
  Video,
  Wand2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  type PointerEvent as ReactPointerEvent,
  type DragEvent,
  type ReactNode,
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

const NODE_WIDTH = 272;
const NODE_HEIGHT = 172;
const PORT_TOP = 72;
const PORT_GAP = 30;
const CANVAS_WIDTH = 1320;
const CANVAS_HEIGHT = 780;

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

type DragState = {
  nodeId: string;
  offset: WorkflowPoint;
} | null;

export function WorkflowCanvasWorkspace() {
  const [state, dispatch] = useReducer(
    workflowGraphReducer,
    undefined,
    createInitialWorkflowGraphState,
  );
  const [mode, setMode] = useState<"select" | "move">("select");
  const [panelState, setPanelState] = useState({
    command: false,
    help: false,
    context: false,
    inspector: true,
  });
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

  function addNode(nodeType: WorkflowNodeType) {
    const offset = state.nodes.length * 28;

    dispatch({
      type: "addNode",
      nodeType,
      position: { x: 120 + offset, y: 160 + offset },
    });
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

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const nodeType = event.dataTransfer.getData(
      "application/x-xmeta-node-type",
    ) as WorkflowNodeType;

    if (!nodeType) {
      return;
    }

    dispatch({
      type: "addNode",
      nodeType,
      position: getCanvasPoint(event),
    });
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
        x: Math.max(12, point.x - dragState.offset.x),
        y: Math.max(12, point.y - dragState.offset.y),
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
    const zoom = Math.min(1.4, Math.max(0.68, state.viewport.zoom + delta));

    dispatch({
      type: "setViewport",
      viewport: { ...state.viewport, zoom },
    });
  }

  return (
    <TooltipProvider>
      <ReactFlowProvider>
        <section
          className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-background"
          aria-labelledby="workspace-title"
        >
        <div className="border-b border-border bg-background/95 px-4 py-3 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Workflow Canvas Foundation
                </p>
                <h1
                  id="workspace-title"
                  className="text-xl font-semibold tracking-normal text-foreground"
                >
                  Comic drama and MV workflow canvas
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{state.draftStatus}</Badge>
                <Badge variant="outline">Local only</Badge>
                <Badge variant="outline">AI execution deferred</Badge>
              </div>
            </div>

            <CanvasToolbar
              mode={mode}
              panelState={panelState}
              state={state}
              onAddNode={addNode}
              onDelete={() => dispatch({ type: "deleteSelection" })}
              onFit={() => dispatch({ type: "fitView" })}
              onModeChange={setMode}
              onSave={() => dispatch({ type: "saveSnapshot" })}
              onRestore={() => dispatch({ type: "restoreSnapshot" })}
              onTogglePanel={(panel) =>
                setPanelState((current) => ({
                  ...current,
                  [panel]: !current[panel],
                }))
              }
              onZoomIn={() => adjustZoom(0.1)}
              onZoomOut={() => adjustZoom(-0.1)}
            />
            <CanvasToolbarStatus panelState={panelState} />
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-[88rem] flex-1 gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[17rem_minmax(0,1fr)_20rem] lg:px-8">
          <NodePalette onAddNode={addNode} />

          <div
            className="min-h-[34rem] overflow-hidden rounded-lg border border-border bg-xmeta-canvas shadow-xmeta-panel"
            data-workflow-canvas="viewport"
          >
            <div
              ref={canvasRef}
              className={cn(
                "relative h-[34rem] min-h-[34rem] overflow-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                mode === "move" ? "cursor-grab" : "cursor-default",
              )}
              role="application"
              aria-label="Workflow node canvas"
              tabIndex={0}
              onDrop={handleDrop}
              onDragOver={(event) => event.preventDefault()}
              onPointerMove={handlePointerMove}
              onPointerUp={() => setDragState(null)}
              onKeyDown={(event) => {
                if (event.key === "Delete" || event.key === "Backspace") {
                  dispatch({ type: "deleteSelection" });
                }
              }}
            >
              <div
                className="absolute inset-0 opacity-70"
                aria-hidden="true"
                style={{
                  backgroundImage:
                    "linear-gradient(hsl(var(--border-hsl) / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border-hsl) / 0.5) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
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
                      state.selection.kind === "node" &&
                      state.selection.id === node.id
                    }
                    pendingPort={pendingPort}
                    onDragStart={startNodeDrag}
                    onSelect={(selection) => dispatch({ type: "select", selection })}
                    onPortSelect={selectPort}
                  />
                ))}
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background/90 px-3 py-2 text-xs text-muted-foreground shadow-sm">
                <span>{state.notice}</span>
                <span>
                  {state.nodes.length} nodes / {state.edges.length} edges / zoom{" "}
                  {Math.round(state.viewport.zoom * 100)}%
                </span>
              </div>
            </div>
          </div>

          <WorkflowInspector
            state={state}
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
          />
        </div>
        </section>
      </ReactFlowProvider>
    </TooltipProvider>
  );
}

type CanvasToolbarProps = {
  mode: "select" | "move";
  panelState: {
    command: boolean;
    help: boolean;
    context: boolean;
    inspector: boolean;
  };
  state: WorkflowGraphState;
  onAddNode: (nodeType: WorkflowNodeType) => void;
  onDelete: () => void;
  onFit: () => void;
  onModeChange: (mode: "select" | "move") => void;
  onSave: () => void;
  onRestore: () => void;
  onTogglePanel: (
    panel: "command" | "help" | "context" | "inspector",
  ) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

function CanvasToolbar({
  mode,
  panelState,
  state,
  onAddNode,
  onDelete,
  onFit,
  onModeChange,
  onSave,
  onRestore,
  onTogglePanel,
  onZoomIn,
  onZoomOut,
}: CanvasToolbarProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-sm"
      aria-label="Canvas toolbar"
    >
      <ToolbarButton
        active={mode === "select"}
        label="Select mode"
        onClick={() => onModeChange("select")}
      >
        <MousePointer2 aria-hidden="true" data-icon="inline-start" />
      </ToolbarButton>
      <ToolbarButton
        active={mode === "move"}
        label="Move mode"
        onClick={() => onModeChange("move")}
      >
        <Move aria-hidden="true" data-icon="inline-start" />
      </ToolbarButton>
      <Separator orientation="vertical" className="hidden h-7 sm:block" />
      <ToolbarButton label="Add script node" onClick={() => onAddNode("script")}>
        <Plus aria-hidden="true" data-icon="inline-start" />
      </ToolbarButton>
      <div className="flex flex-wrap items-center gap-1">
        {workflowNodeTemplates
          .filter((template) => template.type !== "script")
          .map((template) => (
            <Button
              key={template.type}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onAddNode(template.type)}
              aria-label={`Quick add ${template.title}`}
            >
              {template.title}
            </Button>
          ))}
      </div>
      <ToolbarButton label="Fit canvas" onClick={onFit}>
        <Frame aria-hidden="true" data-icon="inline-start" />
      </ToolbarButton>
      <ToolbarButton label="Zoom out" onClick={onZoomOut}>
        <ZoomOut aria-hidden="true" data-icon="inline-start" />
      </ToolbarButton>
      <ToolbarButton label="Zoom in" onClick={onZoomIn}>
        <ZoomIn aria-hidden="true" data-icon="inline-start" />
      </ToolbarButton>
      <Separator orientation="vertical" className="hidden h-7 sm:block" />
      <ToolbarButton label="Save local snapshot" onClick={onSave}>
        <Save aria-hidden="true" data-icon="inline-start" />
      </ToolbarButton>
      <ToolbarButton
        label="Restore local snapshot"
        onClick={onRestore}
        disabled={!state.savedSnapshot}
      >
        <ArrowDownToLine aria-hidden="true" data-icon="inline-start" />
      </ToolbarButton>
      <ToolbarButton
        label="Delete selected graph item"
        onClick={onDelete}
        disabled={state.selection.kind === "empty"}
      >
        <Trash2 aria-hidden="true" data-icon="inline-start" />
      </ToolbarButton>
      <Separator orientation="vertical" className="hidden h-7 sm:block" />
      <ToolbarButton
        active={panelState.command}
        label="Toggle command actions"
        onClick={() => onTogglePanel("command")}
      >
        <PanelRight aria-hidden="true" data-icon="inline-start" />
      </ToolbarButton>
      <ToolbarButton
        active={panelState.help}
        label="Toggle help"
        onClick={() => onTogglePanel("help")}
      >
        <HelpCircle aria-hidden="true" data-icon="inline-start" />
      </ToolbarButton>
      <ToolbarButton
        active={panelState.context}
        label="Toggle context menu preview"
        onClick={() => onTogglePanel("context")}
      >
        <Film aria-hidden="true" data-icon="inline-start" />
      </ToolbarButton>
      <ToolbarButton
        active={panelState.inspector}
        label="Toggle inspector panel"
        onClick={() => onTogglePanel("inspector")}
      >
        <PanelRight aria-hidden="true" data-icon="inline-start" />
      </ToolbarButton>
      <div className="flex min-h-9 items-center rounded-md bg-muted px-3 text-xs text-muted-foreground">
        Backend persistence unavailable
      </div>
    </div>
  );
}

function CanvasToolbarStatus({
  panelState,
}: {
  panelState: {
    command: boolean;
    help: boolean;
    context: boolean;
    inspector: boolean;
  };
}) {
  const activePanels = Object.entries(panelState)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name);

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <Badge variant="outline">Mode and panel controls are local UI state</Badge>
      <span>
        Active panels: {activePanels.length ? activePanels.join(", ") : "none"}
      </span>
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
          variant={active ? "secondary" : "ghost"}
          size="icon"
          aria-label={label}
          aria-pressed={active}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

type NodePaletteProps = {
  onAddNode: (nodeType: WorkflowNodeType) => void;
};

function NodePalette({ onAddNode }: NodePaletteProps) {
  return (
    <aside className="flex min-h-0 flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-sm">
      <div>
        <h2 className="text-sm font-semibold">Node palette</h2>
        <p className="text-xs text-muted-foreground">
          Drag or click placeholders. Node execution is deferred.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {workflowNodeTemplates.map((template) => {
          const Icon = nodeIcons[template.type];

          return (
            <button
              key={template.type}
              type="button"
              draggable
              className="flex min-h-16 items-start gap-3 rounded-md border border-border bg-background p-3 text-left text-sm transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => onAddNode(template.type)}
              onDragStart={(event) => {
                event.dataTransfer.setData(
                  "application/x-xmeta-node-type",
                  template.type,
                );
                event.dataTransfer.effectAllowed = "copy";
              }}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                <Icon aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-medium">{template.title}</span>
                <span className="line-clamp-2 block text-xs text-muted-foreground">
                  {template.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </aside>
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
        "absolute rounded-lg border bg-background shadow-sm transition",
        selected ? "border-ring shadow-xmeta-raised" : "border-border",
      )}
      data-workflow-node={node.type}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: NODE_WIDTH,
        minHeight: NODE_HEIGHT,
      }}
    >
      <button
        type="button"
        className="flex w-full cursor-grab items-start gap-3 rounded-t-lg px-3 py-3 text-left active:cursor-grabbing"
        onPointerDown={(event) => onDragStart(event, node)}
        onClick={() => onSelect({ kind: "node", id: node.id })}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
          <Icon aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{node.title}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {node.id}
          </span>
        </span>
        <Badge variant="outline">{node.status}</Badge>
      </button>
      <p className="px-3 pb-3 text-xs leading-5 text-muted-foreground">
        {node.description}
      </p>
      <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
        <span>{inputs.length} inputs</span>
        <span>{outputs.length} outputs</span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mx-3 mb-3 w-[calc(100%-1.5rem)] justify-start"
        disabled
      >
        Generate later
      </Button>
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
        "absolute flex size-5 items-center justify-center rounded-full border bg-background text-[0px] shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        leftSide ? "-left-2.5" : "-right-2.5",
        compatible ? "border-ring bg-primary" : "border-border hover:border-ring",
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
              stroke={selected ? "hsl(var(--ring-hsl))" : "hsl(var(--foreground-hsl))"}
              strokeWidth={selected ? "3" : "2"}
              fill="none"
              strokeDasharray={edge.status === "disabled" ? "6 6" : undefined}
              opacity={selected ? 0.95 : 0.55}
              pointerEvents="none"
            />
            <text
              x={midX}
              y={(sourcePoint.y + targetPoint.y) / 2 - 8}
              textAnchor="middle"
              className="fill-muted-foreground text-[11px]"
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

type WorkflowInspectorProps = {
  state: WorkflowGraphState;
  selectedNode: WorkflowNode | null;
  selectedEdge: ReturnType<typeof findEdge>;
};

function WorkflowInspector({
  state,
  selectedNode,
  selectedEdge,
}: WorkflowInspectorProps) {
  return (
    <aside className="flex min-h-0 flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Inspector</h2>
          <p className="text-xs text-muted-foreground">
            Selection, status, and persistence boundary.
          </p>
        </div>
        <PanelRight aria-hidden="true" />
      </div>

      <Tabs defaultValue="selection" className="min-w-0">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="selection">Select</TabsTrigger>
          <TabsTrigger value="graph">Graph</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>
        <TabsContent value="selection" className="flex flex-col gap-3">
          {selectedNode ? (
            <div className="flex flex-col gap-3 rounded-md border border-border bg-background p-3">
              <Badge variant="secondary">Node</Badge>
              <div>
                <h3 className="text-sm font-semibold">{selectedNode.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedNode.description}
                </p>
              </div>
              <div className="grid gap-2 text-xs">
                {selectedNode.ports.map((port) => (
                  <div
                    key={port.id}
                    className="flex items-center justify-between gap-2 rounded-md bg-muted px-2 py-1.5"
                  >
                    <span>{port.label}</span>
                    <span className="text-muted-foreground">
                      {port.direction} / {port.dataType}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : selectedEdge ? (
            <div className="flex flex-col gap-3 rounded-md border border-border bg-background p-3">
              <Badge variant="secondary">Edge</Badge>
              <h3 className="text-sm font-semibold">{selectedEdge.id}</h3>
              <p className="text-xs text-muted-foreground">
                {connectionDataTypeLabel(selectedEdge.dataType)} connection from{" "}
                {selectedEdge.sourcePortId} to {selectedEdge.targetPortId}.
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-border bg-background p-3 text-xs text-muted-foreground">
              Select a node or edge to inspect it. Delete removes only the selected
              graph object.
            </div>
          )}
        </TabsContent>
        <TabsContent value="graph" className="grid gap-2 text-xs">
          <MetricRow label="Nodes" value={String(state.nodes.length)} />
          <MetricRow label="Edges" value={String(state.edges.length)} />
          <MetricRow label="Zoom" value={`${Math.round(state.viewport.zoom * 100)}%`} />
          <MetricRow label="Snapshot" value={state.savedSnapshot ? "saved" : "none"} />
        </TabsContent>
        <TabsContent value="status" className="flex flex-col gap-3 text-xs">
          <div className="rounded-md border border-border bg-background p-3">
            <p className="font-medium text-foreground">FastAPI persistence</p>
            <p className="mt-1 text-muted-foreground">
              Not connected in Feature 2. Local snapshots define the payload shape for
              later backend-owned persistence.
            </p>
          </div>
          <div className="rounded-md border border-border bg-background p-3">
            <p className="font-medium text-foreground">AI execution</p>
            <p className="mt-1 text-muted-foreground">
              Script, image, audio, video, and export actions are disabled until their
              dedicated features implement API-backed tasks.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
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
