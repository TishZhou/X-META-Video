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
  Send,
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
  type GeneratedAudio,
  type GeneratedImage,
  type GeneratedVideo,
  type ImageGenerationNodeType,
  type ImageGenerationResponse,
  type MusicGenerationResponse,
  type ScriptDialogueMessage,
  type ScriptNodeInput,
  type ScriptNodeOutput,
  type ScriptTaskStatusResponse,
  type VideoGenerationResponse,
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
  createWorkflowOutputNodeId,
  findEdge,
  findNode,
  findPort,
  workflowGraphReducer,
  workflowNodeTemplates,
} from "@/lib/workflow-canvas/graph";
import type {
  WorkflowGraphState,
  WorkflowNode,
  WorkflowNodeOutput,
  WorkflowNodeType,
  WorkflowPoint,
  WorkflowPort,
  WorkflowSelection,
} from "@/lib/workflow-canvas/types";
import { runImageGeneration } from "@/lib/image-node/api";
import { runMusicGeneration } from "@/lib/music-node/api";
import { runScriptDialogue, runScriptDirectOutput } from "@/lib/script-node/api";
import { runVideoGeneration } from "@/lib/video-node/api";
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
type ScriptGenerationRunner = typeof runScriptDirectOutput;
type ImageGenerationRunner = typeof runImageGeneration;
type MusicGenerationRunner = typeof runMusicGeneration;
type VideoGenerationRunner = typeof runVideoGeneration;
type ScriptOutcomeMap = Record<string, string>;
type ImageGenerationMap = Record<string, ImageGenerationResponse>;
type ImagePromptMap = Record<string, string>;
type MusicGenerationMap = Record<string, MusicGenerationResponse>;
type MusicInputMap = Record<string, string>;
type VideoGenerationMap = Record<string, VideoGenerationResponse>;
type VideoInputMap = Record<string, string>;

const DEFAULT_SCRIPT_WORLD_DESCRIPTION =
  "\u751f\u6210\u4e00\u4e2a\u51b0\u96ea\u76f8\u5173\u7684mv\u7684\u4e16\u754c\u89c2";
const SCRIPT_WORLD_DESCRIPTION_PLACEHOLDER =
  "\u63cf\u8ff0\u4f60\u7684\u5267\u60c5\u7247\u6bb5\u3001\u6545\u4e8b\u548c\u4e16\u754c\u89c2\u6784\u60f3";
const SCRIPT_WORLD_DESCRIPTION_LABEL =
  "\u5267\u60c5\u7247\u6bb5\u3001\u6545\u4e8b\u548c\u4e16\u754c\u89c2\u6784\u60f3";
const SCRIPT_REVISE_STATUS_LABEL = "AI\u4fee\u6539\u4e2d";
const SCRIPT_DIALOGUE_READY_LABEL = "AI\u5bf9\u8bdd";
const SCRIPT_REVISE_LABEL = "AI\u4fee\u6539";
const SCRIPT_SEND_LABEL = "\u53d1\u9001";
const SCRIPT_GENERATE_LABEL = "\u751f\u6210";
const SCRIPT_GENERATING_LABEL = "\u751f\u6210\u4e2d";
const SCRIPT_CONVERSATION_GUIDE =
  "\u6211\u4f1a\u5148\u5e2e\u4f60\u628a\u6545\u4e8b\u6838\u5fc3\u3001\u89d2\u8272\u5173\u7cfb\u548c\u60c5\u7eea\u8f6c\u6298\u95ee\u6e05\u695a\u3002\u5148\u544a\u8bc9\u6211\u4f60\u60f3\u5f3a\u5316\u54ea\u4e00\u90e8\u5206\uff1a\u4e16\u754c\u89c2\u3001\u4eba\u7269\u51b2\u7a81\u3001\u5206\u955c\u8282\u594f\uff0c\u8fd8\u662f\u7ed3\u5c3e\u60c5\u7eea\uff1f";
const SCRIPT_OUTCOME_TITLE = "Script outcome";
const SCRIPT_OUTCOME_DESCRIPTION =
  "Editable direct text generated from the Script node.";
const SCRIPT_OUTCOME_PORTS = [
  {
    key: "script-out",
    label: "Script",
    direction: "output",
    dataType: "script",
  },
  {
    key: "profiles-out",
    label: "Characters",
    direction: "output",
    dataType: "character",
  },
] as const;

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

type ScriptModelSelection = "configured";
type ScriptResponseMode = "generation" | "revise";
type ScriptGenerationAction = "generate" | "revise";
type ScriptBackendExecution = {
  provider: string;
  model?: string | null;
} | null;
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

const defaultImagePrompts = {
  character:
    "Full-body cinematic character photo, front view, clear face, wardrobe, accessories, consistent MV styling.",
  asset:
    "Studio product photo of the prop, isolated object, clean lighting, visible shape and material details.",
  scene:
    "Wide cinematic background photo, location establishing shot, clear lighting, atmosphere, no main character.",
  composition:
    "Composition node image prompt rewriting is not implemented yet.",
} satisfies Record<"character" | "asset" | "scene" | "composition", string>;

const IMAGE_AI_MODIFY_NOT_IMPLEMENTED =
  "AI modify for image prompts is not implemented yet. Edit the prompt and use Generate for the live SeedDream backend path.";
const IMAGE_COMPOSITION_GENERATE_NOT_IMPLEMENTED =
  "Image Composition generation is not implemented in this text-to-image pass. Use Character Image, Prop / Asset, or Scene Image nodes for SeedDream text-to-image.";

const DEFAULT_MUSIC_PROMPT =
  "K-pop cinematic MV theme, bright synths, emotional chorus, 120 BPM, polished female vocal production.";
const DEFAULT_MUSIC_LYRICS =
  "[Verse]\nSnow lights fall around me\nFootsteps echo through the glow\n[Chorus]\nWe run into the night\nSinging until the stars ignite";
const MUSIC_NO_PERSISTENCE_LABEL =
  "Local audio preview only. Audio persistence, signed URLs, and Audio Library save are not implemented yet.";
const DEFAULT_VIDEO_PROMPT =
  "Cinematic MV clip, smooth camera movement, use the connected visual references, polished short-form video pacing.";
const DEFAULT_VIDEO_DURATION_SECONDS = 15;
const MIN_VIDEO_DURATION_SECONDS = 1;
const MAX_VIDEO_DURATION_SECONDS = 60;
const VIDEO_NO_PERSISTENCE_LABEL =
  "Local video preview only. Video persistence, signed URLs, task polling, and Video Library save are not implemented yet.";

const scriptModelOptions = [
  {
    id: "configured",
    label: "Server configured model",
    settings: {},
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

export function createScriptBackendExecution(
  provider?: string | null,
  model?: string | null,
): ScriptBackendExecution {
  const trimmedProvider = provider?.trim();

  if (!trimmedProvider) {
    return null;
  }

  const trimmedModel = model?.trim();

  return {
    provider: trimmedProvider,
    model: trimmedModel || null,
  };
}

export function formatScriptBackendExecutionLabel(
  execution: ScriptBackendExecution,
) {
  if (!execution) {
    return "Backend: waiting for server confirmation";
  }

  const model = execution.model ?? "server default";

  return `Backend: ${execution.provider} / ${model}`;
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
  return (
    type === "character" ||
    type === "asset" ||
    type === "scene" ||
    type === "composition"
  );
}

export function getImageGenerationNodeType(
  type: WorkflowNodeType,
): ImageGenerationNodeType | null {
  if (type === "character") {
    return "character_image";
  }
  if (type === "asset") {
    return "prop_asset";
  }
  if (type === "scene") {
    return "scene_image";
  }
  return null;
}

export function getImageOutputDataType(type: WorkflowNodeType) {
  if (type === "character" || type === "asset" || type === "scene") {
    return type;
  }
  return "image";
}

export function getDefaultImagePrompt(type: WorkflowNodeType) {
  if (
    type === "character" ||
    type === "asset" ||
    type === "scene" ||
    type === "composition"
  ) {
    return defaultImagePrompts[type];
  }
  return "";
}

export function imageSourceFromGeneratedImage(image: GeneratedImage) {
  if (image.url?.trim()) {
    return image.url.trim();
  }

  const b64Json = image.b64_json?.trim();
  if (!b64Json) {
    return null;
  }
  if (b64Json.startsWith("data:image/")) {
    return b64Json;
  }

  return `data:${image.mime_type ?? "image/png"};base64,${b64Json}`;
}

export function imageSourceFromWorkflowOutput(output?: WorkflowNodeOutput) {
  if (output?.media?.kind !== "image") {
    return null;
  }

  if (output.media.url?.trim()) {
    return output.media.url.trim();
  }

  const b64Json = output.media.b64Json?.trim();
  if (!b64Json) {
    return null;
  }
  if (b64Json.startsWith("data:image/")) {
    return b64Json;
  }

  return `data:${output.media.mimeType ?? "image/png"};base64,${b64Json}`;
}

export function audioSourceFromGeneratedAudio(audio: GeneratedAudio) {
  if (audio.url?.trim()) {
    return audio.url.trim();
  }

  const b64Audio = audio.b64_audio?.trim();
  if (b64Audio) {
    if (b64Audio.startsWith("data:audio/")) {
      return b64Audio;
    }
    return `data:${audio.mime_type ?? "audio/mpeg"};base64,${b64Audio}`;
  }

  const hexAudio = audio.hex?.trim();
  if (!hexAudio) {
    return null;
  }

  const encoded = base64FromHexAudio(hexAudio);
  if (!encoded) {
    return null;
  }

  return `data:${audio.mime_type ?? "audio/mpeg"};base64,${encoded}`;
}

export function audioSourceFromWorkflowOutput(output?: WorkflowNodeOutput) {
  if (output?.media?.kind !== "audio") {
    return null;
  }

  if (output.media.url?.trim()) {
    return output.media.url.trim();
  }

  const b64Audio = output.media.b64Audio?.trim();
  if (b64Audio) {
    if (b64Audio.startsWith("data:audio/")) {
      return b64Audio;
    }
    return `data:${output.media.mimeType ?? "audio/mpeg"};base64,${b64Audio}`;
  }

  const hexAudio = output.media.hex?.trim();
  if (!hexAudio) {
    return null;
  }

  const encoded = base64FromHexAudio(hexAudio);
  if (!encoded) {
    return null;
  }

  return `data:${output.media.mimeType ?? "audio/mpeg"};base64,${encoded}`;
}

export function videoSourceFromGeneratedVideo(video: GeneratedVideo) {
  return video.url?.trim() || null;
}

export function videoSourceFromWorkflowOutput(output?: WorkflowNodeOutput) {
  if (output?.media?.kind !== "video") {
    return null;
  }

  return output.media.url?.trim() || null;
}

export function base64FromHexAudio(hexAudio: string) {
  const normalized = hexAudio.replace(/\s+/g, "");
  if (
    normalized.length < 2 ||
    normalized.length % 2 !== 0 ||
    /[^0-9a-f]/i.test(normalized)
  ) {
    return null;
  }

  let binary = "";
  for (let index = 0; index < normalized.length; index += 2) {
    binary += String.fromCharCode(
      Number.parseInt(normalized.slice(index, index + 2), 16),
    );
  }

  return typeof globalThis.btoa === "function"
    ? globalThis.btoa(binary)
    : null;
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

export function getConnectedAudioLyrics(
  node: WorkflowNode,
  state: WorkflowGraphState,
  scriptInput: ScriptNodeInput,
  scriptOutcomes: ScriptOutcomeMap,
) {
  const incomingTextEdge = state.edges.find(
    (edge) =>
      edge.targetNodeId === node.id &&
      (edge.dataType === "script" || edge.dataType === "storyboard"),
  );

  if (!incomingTextEdge) {
    return null;
  }

  const sourceNode = findNode(state.nodes, incomingTextEdge.sourceNodeId);
  if (!sourceNode) {
    return null;
  }

  if (sourceNode.output?.dataType === "script") {
    return scriptOutcomes[sourceNode.id]?.trim() || null;
  }

  if (sourceNode.type === "script") {
    const scriptOutcomeNodeId = createWorkflowOutputNodeId(
      sourceNode.id,
      "script",
    );
    return (
      scriptOutcomes[scriptOutcomeNodeId]?.trim() ||
      scriptInput.world_description.trim() ||
      null
    );
  }

  if (sourceNode.output?.label) {
    return sourceNode.output.label.trim() || null;
  }

  return null;
}

export function getConnectedVideoInputs(
  node: WorkflowNode,
  state: WorkflowGraphState,
  scriptInput: ScriptNodeInput,
  scriptOutcomes: ScriptOutcomeMap,
) {
  const promptEdge = state.edges.find(
    (edge) =>
      edge.targetNodeId === node.id &&
      (edge.dataType === "script" ||
        edge.dataType === "storyboard" ||
        edge.dataType === "brief"),
  );
  const promptSourceNode = promptEdge
    ? findNode(state.nodes, promptEdge.sourceNodeId)
    : null;
  const prompt = promptSourceNode
    ? getConnectedTextFromNode(promptSourceNode, scriptInput, scriptOutcomes)
    : null;
  const imageUrls = new Set<string>();
  const audioUrls = new Set<string>();

  for (const edge of state.edges) {
    if (edge.targetNodeId !== node.id) {
      continue;
    }

    const sourceNode = findNode(state.nodes, edge.sourceNodeId);
    if (!sourceNode?.output?.media) {
      continue;
    }

    if (sourceNode.output.media.kind === "image") {
      const imageUrl = imageSourceFromWorkflowOutput(sourceNode.output);
      if (imageUrl) {
        imageUrls.add(imageUrl);
      }
    }

    if (sourceNode.output.media.kind === "audio") {
      const audioUrl = audioSourceFromWorkflowOutput(sourceNode.output);
      if (audioUrl) {
        audioUrls.add(audioUrl);
      }
    }
  }

  return {
    prompt,
    imageUrls: Array.from(imageUrls).slice(0, 9),
    audioUrls: Array.from(audioUrls).slice(0, 3),
  };
}

function getConnectedTextFromNode(
  sourceNode: WorkflowNode,
  scriptInput: ScriptNodeInput,
  scriptOutcomes: ScriptOutcomeMap,
) {
  if (sourceNode.output?.dataType === "script") {
    return scriptOutcomes[sourceNode.id]?.trim() || null;
  }

  if (sourceNode.type === "script") {
    const scriptOutcomeNodeId = createWorkflowOutputNodeId(
      sourceNode.id,
      "script",
    );
    return (
      scriptOutcomes[scriptOutcomeNodeId]?.trim() ||
      scriptInput.world_description.trim() ||
      null
    );
  }

  if (sourceNode.output?.label) {
    return sourceNode.output.label.trim() || null;
  }

  return null;
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

export function buildScriptDirectOutputMessage(
  input: ScriptNodeInput,
  usesConversationHistory: boolean,
) {
  return [
    "Directly write the Script node result as editable natural text. Do not return JSON, markdown fences, or a fixed section template.",
    usesConversationHistory
      ? "Use the AI conversation history as context and resolve it into one coherent output."
      : "Use only the current MV world description and expand it into one coherent output.",
    `MV world description: ${input.world_description.trim()}`,
  ].join("\n");
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
  imageGenerationRunner = runImageGeneration,
  musicGenerationRunner = runMusicGeneration,
  scriptDialogueRunner = runScriptDialogue,
  scriptGenerationRunner = runScriptDirectOutput,
  videoGenerationRunner = runVideoGeneration,
}: {
  imageGenerationRunner?: ImageGenerationRunner;
  musicGenerationRunner?: MusicGenerationRunner;
  scriptDialogueRunner?: ScriptDialogueRunner;
  scriptGenerationRunner?: ScriptGenerationRunner;
  videoGenerationRunner?: VideoGenerationRunner;
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
  const [scriptOutcomes, setScriptOutcomes] = useState<ScriptOutcomeMap>({});
  const [scriptDialogueMessages, setScriptDialogueMessages] = useState<
    ScriptDialogueMessage[]
  >([]);
  const [scriptBackendExecution, setScriptBackendExecution] =
    useState<ScriptBackendExecution>(null);
  const [scriptTask, setScriptTask] =
    useState<ScriptTaskStatusResponse>(emptyScriptTask);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [scriptBusy, setScriptBusy] = useState(false);
  const [scriptConversationMode, setScriptConversationMode] = useState(false);
  const [scriptHistoryOpen, setScriptHistoryOpen] = useState(false);
  const [scriptResponseMode, setScriptResponseMode] =
    useState<ScriptResponseMode>("generation");
  const [scriptModel, setScriptModel] =
    useState<ScriptModelSelection>("configured");
  const [imageEditorOpen, setImageEditorOpen] = useState(false);
  const [imageEditorFrame, setImageEditorFrame] = useState<ImageEditorFrame>(
    defaultImageEditorFrame,
  );
  const [imagePrompts, setImagePrompts] = useState<ImagePromptMap>({});
  const [imageGenerations, setImageGenerations] = useState<ImageGenerationMap>(
    {},
  );
  const [imageErrors, setImageErrors] = useState<Record<string, string>>({});
  const [imageBusyNodeId, setImageBusyNodeId] = useState<string | null>(null);
  const [imageResponseOpen, setImageResponseOpen] = useState(false);
  const [musicPrompts, setMusicPrompts] = useState<MusicInputMap>({});
  const [musicLyrics, setMusicLyrics] = useState<MusicInputMap>({});
  const [musicGenerations, setMusicGenerations] = useState<MusicGenerationMap>(
    {},
  );
  const [musicErrors, setMusicErrors] = useState<Record<string, string>>({});
  const [musicBusyNodeId, setMusicBusyNodeId] = useState<string | null>(null);
  const [musicResponseOpen, setMusicResponseOpen] = useState(false);
  const [videoEditorOpen, setVideoEditorOpen] = useState(false);
  const [videoEditorFrame, setVideoEditorFrame] = useState<ImageEditorFrame>({
    x: 920,
    y: 128,
    width: 480,
    height: 560,
  });
  const [videoPrompts, setVideoPrompts] = useState<VideoInputMap>({});
  const [videoDurations, setVideoDurations] = useState<VideoInputMap>({});
  const [videoGenerations, setVideoGenerations] = useState<VideoGenerationMap>(
    {},
  );
  const [videoErrors, setVideoErrors] = useState<Record<string, string>>({});
  const [videoBusyNodeId, setVideoBusyNodeId] = useState<string | null>(null);
  const [videoResponseOpen, setVideoResponseOpen] = useState(false);
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
    selectedNode?.type === "script" && selectedNode.role === "source"
      ? selectedNode
      : null;
  const selectedImageEditorNode =
    selectedNode?.role === "source" && isFloatingImageEditorNodeType(selectedNode.type)
      ? selectedNode
      : null;
  const selectedImagePrompt = selectedImageEditorNode
    ? (imagePrompts[selectedImageEditorNode.id] ??
      getDefaultImagePrompt(selectedImageEditorNode.type))
    : "";
  const selectedImageGeneration = selectedImageEditorNode
    ? (imageGenerations[selectedImageEditorNode.id] ?? null)
    : null;
  const selectedImageError = selectedImageEditorNode
    ? (imageErrors[selectedImageEditorNode.id] ?? null)
    : null;
  const selectedImageBusy = selectedImageEditorNode
    ? imageBusyNodeId === selectedImageEditorNode.id
    : false;
  const selectedMusicEditorNode =
    selectedNode?.type === "audio" && selectedNode.role === "source"
      ? selectedNode
      : null;
  const selectedConnectedLyrics = selectedMusicEditorNode
    ? getConnectedAudioLyrics(
        selectedMusicEditorNode,
        state,
        scriptInput,
        scriptOutcomes,
      )
    : null;
  const selectedMusicPrompt = selectedMusicEditorNode
    ? (musicPrompts[selectedMusicEditorNode.id] ?? DEFAULT_MUSIC_PROMPT)
    : "";
  const selectedMusicLyrics = selectedMusicEditorNode
    ? (musicLyrics[selectedMusicEditorNode.id] ??
      selectedConnectedLyrics ??
      DEFAULT_MUSIC_LYRICS)
    : "";
  const selectedMusicGeneration = selectedMusicEditorNode
    ? (musicGenerations[selectedMusicEditorNode.id] ?? null)
    : null;
  const selectedMusicError = selectedMusicEditorNode
    ? (musicErrors[selectedMusicEditorNode.id] ?? null)
    : null;
  const selectedMusicBusy = selectedMusicEditorNode
    ? musicBusyNodeId === selectedMusicEditorNode.id
    : false;
  const selectedVideoEditorNode =
    selectedNode?.type === "video" && selectedNode.role === "source"
      ? selectedNode
      : null;
  const selectedConnectedVideoInputs = selectedVideoEditorNode
    ? getConnectedVideoInputs(
        selectedVideoEditorNode,
        state,
        scriptInput,
        scriptOutcomes,
      )
    : null;
  const selectedVideoPrompt = selectedVideoEditorNode
    ? (videoPrompts[selectedVideoEditorNode.id] ??
      selectedConnectedVideoInputs?.prompt ??
      DEFAULT_VIDEO_PROMPT)
    : "";
  const selectedVideoDuration = selectedVideoEditorNode
    ? (videoDurations[selectedVideoEditorNode.id] ??
      String(DEFAULT_VIDEO_DURATION_SECONDS))
    : String(DEFAULT_VIDEO_DURATION_SECONDS);
  const selectedVideoGeneration = selectedVideoEditorNode
    ? (videoGenerations[selectedVideoEditorNode.id] ?? null)
    : null;
  const selectedVideoError = selectedVideoEditorNode
    ? (videoErrors[selectedVideoEditorNode.id] ?? null)
    : null;
  const selectedVideoBusy = selectedVideoEditorNode
    ? videoBusyNodeId === selectedVideoEditorNode.id
    : false;
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
  const hasScriptOutcome = Object.keys(scriptOutcomes).length > 0;

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
        "[data-workflow-node], [data-workflow-edge-hit], [data-script-node-inline-editor], [data-music-node-inline-editor], [data-video-node-editor], button, textarea, input, select, [data-workspace-bottom-toolbar], [data-workspace-floating-topbar]",
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
    if (node.role === "source" && isFloatingImageEditorNodeType(node.type)) {
      setImageEditorOpen(true);
    }
    if (node.type === "video" && node.role === "source") {
      setVideoEditorOpen(true);
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

    const conversationHistory = scriptConversationMode ? scriptDialogueMessages : [];
    const directOutputMessage = buildScriptDirectOutputMessage(
      scriptInput,
      conversationHistory.length > 0,
    );

    setScriptBusy(true);
    setScriptError(null);
    setScriptBackendExecution(null);
    setScriptHistoryOpen(scriptConversationMode && scriptDialogueMessages.length > 0);
    setScriptTask({
      task_id: "direct-output-pending",
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
        history: conversationHistory,
        message: directOutputMessage,
      });
      const backendExecution = createScriptBackendExecution(
        result.provider,
        result.model,
      );
      const outcomeNodeId = createWorkflowOutputNodeId(
        selectedScriptNode.id,
        "script",
      );

      setScriptTask({
        task_id: "direct-output-succeeded",
        project_id: result.project_id,
        node_id: result.node_id,
        status: "succeeded",
        error: null,
        provider: result.provider,
        model: result.model,
      });
      setScriptBackendExecution(backendExecution);
      setScriptOutcomes((current) => ({
        ...current,
        [outcomeNodeId]: result.message.content,
      }));
      dispatch({
        type: "setNodeStatus",
        nodeId: selectedScriptNode.id,
        status: "ready",
        notice:
          "Script direct output is ready as an editable canvas node.",
      });
      dispatch({
        type: "upsertOutputNode",
        sourceNodeId: selectedScriptNode.id,
        nodeType: "script",
        title: SCRIPT_OUTCOME_TITLE,
        description: SCRIPT_OUTCOME_DESCRIPTION,
        position: {
          x: selectedScriptNode.position.x + 360,
          y: Math.max(80, selectedScriptNode.position.y - 96),
        },
        output: {
          sourceNodeId: selectedScriptNode.id,
          dataType: "script",
          label: "Script output",
          provider: backendExecution?.provider ?? result.provider,
          model: backendExecution?.model ?? result.model,
          editable: true,
        },
        ports: SCRIPT_OUTCOME_PORTS.map((port) => ({ ...port })),
        notice:
          "Script direct output node updated. Local edits are not persisted yet.",
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

  function updateImagePrompt(nodeId: string, value: string) {
    setImagePrompts((current) => ({ ...current, [nodeId]: value }));
  }

  function showImageNotImplemented(node: WorkflowNode, message: string) {
    setImageErrors((current) => ({ ...current, [node.id]: message }));
    setImageResponseOpen(true);
    dispatch({
      type: "setNotice",
      notice: message,
    });
  }

  async function generateImageNode(node: WorkflowNode) {
    const nodeType = getImageGenerationNodeType(node.type);

    if (!nodeType) {
      showImageNotImplemented(node, IMAGE_COMPOSITION_GENERATE_NOT_IMPLEMENTED);
      return;
    }

    const prompt = (
      imagePrompts[node.id] ?? getDefaultImagePrompt(node.type)
    ).trim();

    if (!prompt) {
      const message = "Image prompt is required before generation.";
      setImageErrors((current) => ({ ...current, [node.id]: message }));
      setImageResponseOpen(true);
      dispatch({
        type: "setNodeStatus",
        nodeId: node.id,
        status: "blocked",
        notice: message,
      });
      return;
    }

    setImageBusyNodeId(node.id);
    setImageErrors((current) => {
      const next = { ...current };
      delete next[node.id];
      return next;
    });
    setImageResponseOpen(true);
    dispatch({
      type: "setNodeStatus",
      nodeId: node.id,
      status: "running",
      notice: `${node.title} generation started through FastAPI SeedDream.`,
    });

    try {
      const result = await imageGenerationRunner({
        projectId: state.projectId,
        nodeId: node.id,
        nodeType,
        prompt,
      });
      const dataType = getImageOutputDataType(node.type);
      const outcomeTitle = `${node.title} outcome`;
      const outcomeNodeId = createWorkflowOutputNodeId(node.id, dataType);

      setImageGenerations((current) => ({ ...current, [node.id]: result }));
      dispatch({
        type: "setNodeStatus",
        nodeId: node.id,
        status: "ready",
        notice: `${outcomeTitle} is ready as a local image node.`,
      });
      dispatch({
        type: "upsertOutputNode",
        sourceNodeId: node.id,
        nodeType: node.type,
        title: outcomeTitle,
        description:
          "SeedDream text-to-image result. Local preview only; asset persistence is deferred.",
        position: {
          x: node.position.x + 360,
          y: Math.max(80, node.position.y - 40),
        },
        output: {
          sourceNodeId: node.id,
          dataType,
          label: `${node.title} image`,
          provider: result.provider,
          model: result.model,
          editable: false,
          media: {
            kind: "image",
            url: result.image.url,
            b64Json: result.image.b64_json,
            mimeType: result.image.mime_type,
            alt: `${node.title} generated image`,
          },
        },
        ports: [
          {
            key: `${dataType}-out`,
            label: connectionDataTypeLabel(dataType),
            direction: "output",
            dataType,
          },
        ],
        notice:
          `${outcomeTitle} updated. Image preview is not persisted to the asset library yet.`,
      });
      setImageGenerations((current) => ({
        ...current,
        [outcomeNodeId]: result,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Image generation failed.";

      setImageErrors((current) => ({ ...current, [node.id]: message }));
      dispatch({
        type: "setNodeStatus",
        nodeId: node.id,
        status: "blocked",
        notice: message,
      });
    } finally {
      setImageBusyNodeId(null);
    }
  }

  function updateMusicPrompt(nodeId: string, value: string) {
    setMusicPrompts((current) => ({ ...current, [nodeId]: value }));
  }

  function updateMusicLyrics(nodeId: string, value: string) {
    setMusicLyrics((current) => ({ ...current, [nodeId]: value }));
  }

  async function generateMusicNode(node: WorkflowNode) {
    const prompt = (musicPrompts[node.id] ?? DEFAULT_MUSIC_PROMPT).trim();
    const lyrics = (
      musicLyrics[node.id] ??
      getConnectedAudioLyrics(node, state, scriptInput, scriptOutcomes) ??
      DEFAULT_MUSIC_LYRICS
    ).trim();

    if (!prompt || !lyrics) {
      const message = "Music style prompt and lyrics are required before generation.";
      setMusicErrors((current) => ({ ...current, [node.id]: message }));
      setMusicResponseOpen(true);
      dispatch({
        type: "setNodeStatus",
        nodeId: node.id,
        status: "blocked",
        notice: message,
      });
      return;
    }

    setMusicBusyNodeId(node.id);
    setMusicErrors((current) => {
      const next = { ...current };
      delete next[node.id];
      return next;
    });
    setMusicResponseOpen(true);
    dispatch({
      type: "setNodeStatus",
      nodeId: node.id,
      status: "running",
      notice: `${node.title} generation started through FastAPI MiniMax Music.`,
    });

    try {
      const result = await musicGenerationRunner({
        projectId: state.projectId,
        nodeId: node.id,
        prompt,
        lyrics,
      });
      const outcomeTitle = `${node.title} outcome`;
      const outcomeNodeId = createWorkflowOutputNodeId(node.id, "audio");

      setMusicGenerations((current) => ({ ...current, [node.id]: result }));
      dispatch({
        type: "setNodeStatus",
        nodeId: node.id,
        status: "ready",
        notice: `${outcomeTitle} is ready as a local audio node.`,
      });
      dispatch({
        type: "upsertOutputNode",
        sourceNodeId: node.id,
        nodeType: "audio",
        title: outcomeTitle,
        description:
          "MiniMax text-to-music result. Local playback only; asset persistence is deferred.",
        position: {
          x: node.position.x + 360,
          y: Math.max(80, node.position.y - 40),
        },
        output: {
          sourceNodeId: node.id,
          dataType: "audio",
          label: `${node.title} music`,
          provider: result.provider,
          model: result.model,
          editable: false,
          media: {
            kind: "audio",
            url: result.audio.url,
            hex: result.audio.hex,
            b64Audio: result.audio.b64_audio,
            mimeType: result.audio.mime_type,
            durationMs: result.audio.duration_ms,
            alt: `${node.title} generated audio`,
          },
        },
        ports: [
          {
            key: "audio-out",
            label: "Audio",
            direction: "output",
            dataType: "audio",
          },
        ],
        notice:
          `${outcomeTitle} updated. Audio preview is not persisted to the asset library yet.`,
      });
      setMusicGenerations((current) => ({
        ...current,
        [outcomeNodeId]: result,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Music generation failed.";

      setMusicErrors((current) => ({ ...current, [node.id]: message }));
      dispatch({
        type: "setNodeStatus",
        nodeId: node.id,
        status: "blocked",
        notice: message,
      });
    } finally {
      setMusicBusyNodeId(null);
    }
  }

  function updateVideoPrompt(nodeId: string, value: string) {
    setVideoPrompts((current) => ({ ...current, [nodeId]: value }));
  }

  function updateVideoDuration(nodeId: string, value: string) {
    setVideoDurations((current) => ({ ...current, [nodeId]: value }));
  }

  async function generateVideoNode(node: WorkflowNode) {
    const connectedInputs = getConnectedVideoInputs(
      node,
      state,
      scriptInput,
      scriptOutcomes,
    );
    const prompt = (
      videoPrompts[node.id] ??
      connectedInputs.prompt ??
      DEFAULT_VIDEO_PROMPT
    ).trim();
    const parsedDuration = Number.parseInt(
      videoDurations[node.id] ?? String(DEFAULT_VIDEO_DURATION_SECONDS),
      10,
    );
    const duration = Number.isFinite(parsedDuration)
      ? parsedDuration
      : DEFAULT_VIDEO_DURATION_SECONDS;
    const imageUrls = connectedInputs.imageUrls;
    const audioUrls = connectedInputs.audioUrls;

    if (!prompt && imageUrls.length === 0) {
      const message =
        "Video prompt or at least one connected image URL is required before generation.";
      setVideoErrors((current) => ({ ...current, [node.id]: message }));
      setVideoResponseOpen(true);
      dispatch({
        type: "setNodeStatus",
        nodeId: node.id,
        status: "blocked",
        notice: message,
      });
      return;
    }

    if (
      duration < MIN_VIDEO_DURATION_SECONDS ||
      duration > MAX_VIDEO_DURATION_SECONDS
    ) {
      const message = `Video duration must be between ${MIN_VIDEO_DURATION_SECONDS} and ${MAX_VIDEO_DURATION_SECONDS} seconds.`;
      setVideoErrors((current) => ({ ...current, [node.id]: message }));
      setVideoResponseOpen(true);
      dispatch({
        type: "setNodeStatus",
        nodeId: node.id,
        status: "blocked",
        notice: message,
      });
      return;
    }

    if (audioUrls.length > 0 && imageUrls.length === 0) {
      const message =
        "Audio input requires at least one connected image URL for video generation.";
      setVideoErrors((current) => ({ ...current, [node.id]: message }));
      setVideoResponseOpen(true);
      dispatch({
        type: "setNodeStatus",
        nodeId: node.id,
        status: "blocked",
        notice: message,
      });
      return;
    }

    setVideoBusyNodeId(node.id);
    setVideoErrors((current) => {
      const next = { ...current };
      delete next[node.id];
      return next;
    });
    setVideoResponseOpen(true);
    dispatch({
      type: "setNodeStatus",
      nodeId: node.id,
      status: "running",
      notice: `${node.title} generation started through FastAPI Evolink Seedance.`,
    });

    try {
      const result = await videoGenerationRunner({
        projectId: state.projectId,
        nodeId: node.id,
        prompt,
        duration,
        imageUrls,
        audioUrls,
      });
      const outcomeTitle = `${node.title} outcome`;
      const outcomeNodeId = createWorkflowOutputNodeId(node.id, "video");

      setVideoGenerations((current) => ({ ...current, [node.id]: result }));
      if (!result.video.url?.trim()) {
        dispatch({
          type: "setNodeStatus",
          nodeId: node.id,
          status: "blocked",
          notice:
            "Video provider task accepted, but no playable video URL is available yet. Task polling is not implemented.",
        });
        return;
      }

      dispatch({
        type: "setNodeStatus",
        nodeId: node.id,
        status: "ready",
        notice: `${outcomeTitle} is ready as a local video node.`,
      });
      dispatch({
        type: "upsertOutputNode",
        sourceNodeId: node.id,
        nodeType: "video",
        title: outcomeTitle,
        description:
          "Evolink Seedance video result. Local playback only; asset persistence is deferred.",
        position: {
          x: node.position.x + 360,
          y: Math.max(80, node.position.y - 40),
        },
        output: {
          sourceNodeId: node.id,
          dataType: "video",
          label: `${node.title} clip`,
          provider: result.provider,
          model: result.model,
          editable: false,
          media: {
            kind: "video",
            url: result.video.url,
            mimeType: result.video.mime_type,
            durationMs: result.video.duration_ms,
            alt: `${node.title} generated video`,
          },
        },
        ports: [
          {
            key: "video-out",
            label: "Video",
            direction: "output",
            dataType: "video",
          },
        ],
        notice:
          `${outcomeTitle} updated. Video preview is not persisted to the asset library yet.`,
      });
      setVideoGenerations((current) => ({
        ...current,
        [outcomeNodeId]: result,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Video generation failed.";

      setVideoErrors((current) => ({ ...current, [node.id]: message }));
      dispatch({
        type: "setNodeStatus",
        nodeId: node.id,
        status: "blocked",
        notice: message,
      });
    } finally {
      setVideoBusyNodeId(null);
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
    setScriptConversationMode(true);
    setScriptError(null);
    setScriptBackendExecution(null);
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
      setScriptBackendExecution(
        createScriptBackendExecution(result.provider, result.model),
      );
      setScriptTask({
        task_id: "dialogue-succeeded",
        project_id: result.project_id,
        node_id: result.node_id,
        status: "succeeded",
        error: null,
        provider: result.provider,
        model: result.model,
      });
      dispatch({
        type: "setNodeStatus",
        nodeId: selectedScriptNode.id,
        status: hasScriptOutcome ? "ready" : "placeholder",
        notice:
          "Script AI dialogue reply received. Use Generate for direct text output.",
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

  function openScriptConversationMode() {
    setScriptConversationMode(true);
    setScriptHistoryOpen(true);
    setScriptResponseMode("revise");
    setScriptError(null);
    setScriptTask((current) =>
      current.status === "running" ? emptyScriptTask : current,
    );
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
                  scriptInput={
                    node.type === "script" && node.role === "source"
                      ? scriptInput
                      : null
                  }
                  scriptOutcomeText={
                    node.output?.dataType === "script"
                      ? scriptOutcomes[node.id] ?? null
                      : null
                  }
                  selected={
                    state.selection.kind === "node" &&
                    state.selection.id === node.id
                  }
                  pendingPort={pendingPort}
                  onScriptOutcomeTextChange={(nodeId, value) => {
                    setScriptOutcomes((current) => ({
                      ...current,
                      [nodeId]: value,
                    }));
                    dispatch({
                      type: "setNotice",
                      notice:
                        "Script direct output edited locally. Durable persistence is deferred.",
                    });
                  }}
                  onDragStart={startNodeDrag}
                  onSelect={(selection) => {
                    dispatch({ type: "select", selection });
                    if (
                      selection.kind === "node" &&
                      node.role === "source" &&
                      isFloatingImageEditorNodeType(node.type)
                    ) {
                      setImageEditorOpen(true);
                    }
                    if (
                      selection.kind === "node" &&
                      node.role === "source" &&
                      node.type === "video"
                    ) {
                      setVideoEditorOpen(true);
                    }
                  }}
                  onPortConnectionStart={startPortConnection}
                />
              ))}
              {selectedScriptNode ? (
                <ScriptNodeInlineEditor
                  busy={scriptBusy}
                  conversationMode={scriptConversationMode}
                  error={scriptError}
                  historyOpen={scriptHistoryOpen}
                  input={scriptInput}
                  messages={scriptDialogueMessages}
                  backendExecution={scriptBackendExecution}
                  responseMode={scriptResponseMode}
                  node={selectedScriptNode}
                  model={scriptModel}
                  task={scriptTask}
                  viewportZoom={state.viewport.zoom}
                  onGenerate={() => {
                    setScriptResponseMode("generation");
                    void generateScriptNode();
                  }}
                  onHistoryOpenChange={setScriptHistoryOpen}
                  onInputChange={updateScriptInput}
                  onModelChange={setScriptModel}
                  onRevise={openScriptConversationMode}
                  onSendMessage={() => {
                    void sendScriptDialogueMessage();
                  }}
                />
              ) : null}
              {selectedMusicEditorNode ? (
                <MusicNodeInlineEditor
                  busy={selectedMusicBusy}
                  connectedLyrics={selectedConnectedLyrics}
                  error={selectedMusicError}
                  generation={selectedMusicGeneration}
                  lyrics={selectedMusicLyrics}
                  node={selectedMusicEditorNode}
                  prompt={selectedMusicPrompt}
                  responseOpen={musicResponseOpen}
                  viewportZoom={state.viewport.zoom}
                  onGenerate={() => {
                    void generateMusicNode(selectedMusicEditorNode);
                  }}
                  onLyricsChange={(value) =>
                    updateMusicLyrics(selectedMusicEditorNode.id, value)
                  }
                  onPromptChange={(value) =>
                    updateMusicPrompt(selectedMusicEditorNode.id, value)
                  }
                  onResponseOpenChange={setMusicResponseOpen}
                  onUseConnectedLyrics={(value) =>
                    updateMusicLyrics(selectedMusicEditorNode.id, value)
                  }
                />
              ) : null}
              {selectedImageEditorNode && imageEditorOpen ? (
                <ImageNodeFloatingEditor
                  frame={imageEditorFrame}
                  busy={selectedImageBusy}
                  error={selectedImageError}
                  generation={selectedImageGeneration}
                  node={selectedImageEditorNode}
                  prompt={selectedImagePrompt}
                  responseOpen={imageResponseOpen}
                  viewportZoom={state.viewport.zoom}
                  onClose={() => setImageEditorOpen(false)}
                  onFrameChange={setImageEditorFrame}
                  onGenerate={() => {
                    void generateImageNode(selectedImageEditorNode);
                  }}
                  onPromptChange={(value) =>
                    updateImagePrompt(selectedImageEditorNode.id, value)
                  }
                  onResponseOpenChange={setImageResponseOpen}
                  onRevise={() =>
                    showImageNotImplemented(
                      selectedImageEditorNode,
                      IMAGE_AI_MODIFY_NOT_IMPLEMENTED,
                    )
                  }
                />
              ) : null}
            </div>
          </div>

          {selectedVideoEditorNode && videoEditorOpen ? (
            <VideoNodeFloatingEditor
              frame={videoEditorFrame}
              audioUrlCount={
                selectedConnectedVideoInputs?.audioUrls.length ?? 0
              }
              busy={selectedVideoBusy}
              connectedPrompt={selectedConnectedVideoInputs?.prompt ?? null}
              duration={selectedVideoDuration}
              error={selectedVideoError}
              generation={selectedVideoGeneration}
              imageUrlCount={
                selectedConnectedVideoInputs?.imageUrls.length ?? 0
              }
              node={selectedVideoEditorNode}
              prompt={selectedVideoPrompt}
              responseOpen={videoResponseOpen}
              onClose={() => setVideoEditorOpen(false)}
              onDurationChange={(value) =>
                updateVideoDuration(selectedVideoEditorNode.id, value)
              }
              onFrameChange={setVideoEditorFrame}
              onGenerate={() => {
                void generateVideoNode(selectedVideoEditorNode);
              }}
              onPromptChange={(value) =>
                updateVideoPrompt(selectedVideoEditorNode.id, value)
              }
              onResponseOpenChange={setVideoResponseOpen}
              onUseConnectedPrompt={(value) =>
                updateVideoPrompt(selectedVideoEditorNode.id, value)
              }
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
  backendExecution: ScriptBackendExecution;
  busy: boolean;
  conversationMode: boolean;
  error: string | null;
  historyOpen: boolean;
  input: ScriptNodeInput;
  messages: ScriptDialogueMessage[];
  responseMode: ScriptResponseMode;
  model: ScriptModelSelection;
  node: WorkflowNode;
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
  onSendMessage: () => void;
};

export function ScriptNodeInlineEditor({
  backendExecution,
  busy,
  conversationMode,
  error,
  historyOpen,
  input,
  messages,
  responseMode,
  model,
  node,
  task,
  viewportZoom,
  onGenerate,
  onHistoryOpenChange,
  onInputChange,
  onModelChange,
  onRevise,
  onSendMessage,
}: ScriptNodeInlineEditorProps) {
  const promptReady = input.world_description.trim().length > 0;
  const directOutputPending =
    busy && task.status === "running" && task.task_id === "direct-output-pending";
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
            backendExecution={backendExecution}
            conversationMode={conversationMode}
            error={error}
            input={input}
            messages={messages}
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
              disabled={busy}
              onClick={handleAiRevise}
              type="button"
              variant={conversationMode ? "default" : "outline"}
            >
              {SCRIPT_REVISE_LABEL}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {conversationMode ? (
              <Button
                aria-label="Send Script dialogue message"
                className="h-9 rounded-lg px-3 text-xs"
                data-script-dialogue-send="true"
                disabled={busy || !promptReady}
                onClick={onSendMessage}
                type="button"
                variant="outline"
              >
                {SCRIPT_SEND_LABEL}
                <Send aria-hidden="true" className="size-4" />
              </Button>
            ) : null}
            <Button
              aria-label="Generate Script node"
              className="h-9 rounded-lg px-4 text-xs"
              data-script-generate-loading={directOutputPending ? "true" : undefined}
              disabled={busy || !promptReady}
              onClick={onGenerate}
              type="button"
            >
              {directOutputPending ? SCRIPT_GENERATING_LABEL : SCRIPT_GENERATE_LABEL}
              {directOutputPending ? (
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <Sparkles aria-hidden="true" className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

type ImageNodeFloatingEditorProps = {
  frame: ImageEditorFrame;
  busy: boolean;
  error: string | null;
  generation: ImageGenerationResponse | null;
  node: WorkflowNode;
  prompt: string;
  responseOpen: boolean;
  viewportZoom: number;
  onClose: () => void;
  onFrameChange: (frame: ImageEditorFrame) => void;
  onGenerate: () => void;
  onPromptChange: (prompt: string) => void;
  onResponseOpenChange: (open: boolean) => void;
  onRevise: () => void;
};

export function ImageNodeFloatingEditor({
  busy,
  error,
  generation,
  node,
  prompt,
  responseOpen,
  viewportZoom,
  onGenerate,
  onPromptChange,
  onResponseOpenChange,
  onRevise,
}: ImageNodeFloatingEditorProps) {
  const promptReady = prompt.trim().length > 0;
  const imageSource = generation
    ? imageSourceFromGeneratedImage(generation.image)
    : null;
  const left = node.position.x - (SCRIPT_INLINE_EDITOR_WIDTH - NODE_WIDTH) / 2;
  const top = node.position.y + NODE_HEIGHT + SCRIPT_INLINE_EDITOR_GAP;

  return (
    <div
      aria-label="Image node editor"
      className="absolute z-30 flex flex-col"
      data-image-node-editor="true"
      data-image-node-inline-editor="true"
      onPointerDown={(event) => event.stopPropagation()}
      style={{
        left,
        top,
        width: SCRIPT_INLINE_EDITOR_WIDTH,
        transform: `scale(${getInlineEditorCompensationScale(viewportZoom)})`,
        transformOrigin: "top center",
      }}
    >
      {responseOpen ? (
        <section
          className="mb-3 rounded-xl border border-neutral-200 bg-white/95 p-3 text-neutral-950 shadow-[0_20px_60px_rgba(15,23,42,0.14)] backdrop-blur"
          data-image-node-response="true"
        >
          <div className="max-h-[24rem] overflow-y-auto rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            {busy ? (
              <AssistantResponseBubble title="SeedDream">
                <div className="flex items-center gap-2 text-neutral-700">
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  <span>Generating image through the backend...</span>
                </div>
              </AssistantResponseBubble>
            ) : error ? (
              <AssistantResponseBubble title="Image Agent">
                <p className="text-red-700" data-image-node-error="true">
                  {error}
                </p>
              </AssistantResponseBubble>
            ) : generation && imageSource ? (
              <div className="flex gap-3">
                <div className="w-48 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white">
                  <img
                    alt={`${node.title} generated preview`}
                    className="aspect-square w-full object-cover"
                    data-generated-image-preview="true"
                    src={imageSource}
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center rounded-lg border border-neutral-200 bg-white p-3 text-xs leading-5 text-neutral-600">
                  <p
                    className="font-medium text-neutral-950"
                    data-image-backend-execution="true"
                  >
                    Backend: {generation.provider} / {generation.model}
                  </p>
                  <p className="mt-1" data-image-not-persisted="true">
                    Local preview only. Asset persistence is not implemented yet.
                  </p>
                </div>
              </div>
            ) : (
              <AssistantResponseBubble title="Image Agent">
                <p>No image response is available yet.</p>
              </AssistantResponseBubble>
            )}
          </div>
        </section>
      ) : null}

      <section
        className="rounded-xl border border-neutral-200 bg-white/95 p-3 text-neutral-950 shadow-[0_20px_60px_rgba(15,23,42,0.14)] backdrop-blur"
        data-image-node-input-composer="true"
      >
        <label htmlFor={`image-node-prompt-${node.id}`} className="sr-only">
          Image prompt
        </label>
        <Textarea
          id={`image-node-prompt-${node.id}`}
          aria-label="Image prompt"
          className="min-h-20 resize-none border-0 bg-transparent px-0 text-sm shadow-none placeholder:text-neutral-400 focus-visible:ring-0"
          onChange={(event) => onPromptChange(event.target.value)}
          placeholder="Describe the image frame, location, character pose, wardrobe, lighting, and mood..."
          value={prompt}
        />

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-neutral-200 pt-3">
          <div className="flex items-center gap-2">
            <label htmlFor={`image-model-select-${node.id}`} className="sr-only">
              Image model
            </label>
            <select
              id={`image-model-select-${node.id}`}
              aria-label="Image model"
              className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 shadow-sm"
              data-image-model-select="true"
              defaultValue="configured"
              disabled={busy}
            >
              <option value="configured">Configured image model</option>
            </select>
            <Button
              className="h-9 rounded-lg px-3 text-xs"
              data-image-ai-revise="true"
              disabled={busy}
              onClick={() => {
                onResponseOpenChange(true);
                onRevise();
              }}
              type="button"
              variant="outline"
            >
              {"AI\u4fee\u6539"}
            </Button>
          </div>

          <Button
            aria-label="Generate Image node"
            className="h-9 rounded-lg px-4 text-xs"
            data-image-generate-loading={busy ? "true" : undefined}
            disabled={busy || !promptReady}
            onClick={() => {
              onResponseOpenChange(true);
              onGenerate();
            }}
            type="button"
          >
            {busy ? "Generating" : "Generate"}
            {busy ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Sparkles aria-hidden="true" className="size-4" />
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}

type MusicNodeInlineEditorProps = {
  busy: boolean;
  connectedLyrics: string | null;
  error: string | null;
  generation: MusicGenerationResponse | null;
  lyrics: string;
  node: WorkflowNode;
  prompt: string;
  responseOpen: boolean;
  viewportZoom: number;
  onGenerate: () => void;
  onLyricsChange: (lyrics: string) => void;
  onPromptChange: (prompt: string) => void;
  onResponseOpenChange: (open: boolean) => void;
  onUseConnectedLyrics: (lyrics: string) => void;
};

export function MusicNodeInlineEditor({
  busy,
  connectedLyrics,
  error,
  generation,
  lyrics,
  node,
  prompt,
  responseOpen,
  viewportZoom,
  onGenerate,
  onLyricsChange,
  onPromptChange,
  onResponseOpenChange,
  onUseConnectedLyrics,
}: MusicNodeInlineEditorProps) {
  const promptReady = prompt.trim().length > 0;
  const lyricsReady = lyrics.trim().length > 0;
  const audioSource = generation
    ? audioSourceFromGeneratedAudio(generation.audio)
    : null;
  const left = node.position.x - (SCRIPT_INLINE_EDITOR_WIDTH - NODE_WIDTH) / 2;
  const top = node.position.y + NODE_HEIGHT + SCRIPT_INLINE_EDITOR_GAP;
  const statusLabel = busy ? "Generating" : error ? "Error" : "Ready";

  return (
    <div
      aria-label="Audio node inline music editor"
      className="absolute z-30 flex flex-col"
      data-music-node-inline-editor="true"
      onPointerDown={(event) => event.stopPropagation()}
      style={{
        left,
        top,
        width: SCRIPT_INLINE_EDITOR_WIDTH,
        transform: `scale(${getInlineEditorCompensationScale(viewportZoom)})`,
        transformOrigin: "top center",
      }}
    >
      {responseOpen ? (
        <section
          className="mb-3 flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white/95 text-neutral-950 shadow-[0_20px_60px_rgba(15,23,42,0.14)] backdrop-blur"
          data-music-node-output-panel="true"
          style={{ height: SCRIPT_RESPONSE_PANEL_HEIGHT }}
        >
          <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">MiniMax Music</p>
                <Badge
                  className={cn(
                    "border-neutral-200 bg-neutral-50 text-neutral-600",
                    statusLabel === "Ready" &&
                      "border-emerald-200 bg-emerald-50 text-emerald-700",
                    statusLabel === "Generating" &&
                      "border-sky-200 bg-sky-50 text-sky-700",
                    statusLabel === "Error" &&
                      "border-red-200 bg-red-50 text-red-700",
                  )}
                  data-music-node-response-status="true"
                >
                  {statusLabel}
                </Badge>
              </div>
              {error ? (
                <p className="mt-1 truncate text-xs text-red-700">{error}</p>
              ) : (
                <p
                  className="mt-1 truncate text-xs text-neutral-500"
                  data-music-backend-execution="true"
                >
                  Backend: {generation?.provider ?? "minimax"} /{" "}
                  {generation?.model ?? "music-2.6-free"}
                </p>
              )}
            </div>
            <Button
              aria-label="Hide Audio response"
              className="h-8 rounded-lg px-3 text-xs"
              onClick={() => onResponseOpenChange(false)}
              type="button"
              variant="ghost"
            >
              Hide
            </Button>
          </div>

          <div
            className="flex-1 overflow-y-auto p-4"
            data-music-node-response="true"
          >
            {busy ? (
              <AssistantResponseBubble title="MiniMax">
                <div className="flex items-center gap-2 text-neutral-700">
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  <span>Generating music through the backend...</span>
                </div>
              </AssistantResponseBubble>
            ) : error ? (
              <AssistantResponseBubble title="Audio Agent">
                <p className="text-red-700" data-music-node-error="true">
                  {error}
                </p>
              </AssistantResponseBubble>
            ) : generation && audioSource ? (
              <div className="flex flex-col gap-3">
                <div
                  className="rounded-lg border border-neutral-200 bg-white p-3"
                  data-generated-audio-preview="true"
                >
                  <audio
                    aria-label={`${node.title} generated audio preview`}
                    className="w-full"
                    controls
                    src={audioSource}
                  />
                </div>
                <div className="rounded-lg border border-neutral-200 bg-white p-3 text-xs leading-5 text-neutral-600">
                  <p
                    className="font-medium text-neutral-950"
                    data-music-backend-execution="true"
                  >
                    Backend: {generation.provider} / {generation.model}
                  </p>
                  <p className="mt-1" data-music-not-persisted="true">
                    {MUSIC_NO_PERSISTENCE_LABEL}
                  </p>
                </div>
              </div>
            ) : (
              <AssistantResponseBubble title="Audio Agent">
                <p>No audio response is available yet.</p>
              </AssistantResponseBubble>
            )}
          </div>
        </section>
      ) : null}

      <section
        className="rounded-xl border border-neutral-200 bg-white/95 p-3 text-neutral-950 shadow-[0_20px_60px_rgba(15,23,42,0.14)] backdrop-blur"
        data-music-node-input-composer="true"
      >
        <label htmlFor="music-node-prompt" className="sr-only">
          Music style prompt
        </label>
        <Textarea
          id="music-node-prompt"
          aria-label="Music style prompt"
          className="min-h-16 resize-none border-0 bg-transparent px-0 text-sm shadow-none placeholder:text-neutral-400 focus-visible:ring-0"
          data-music-prompt-input="true"
          disabled={busy}
          onChange={(event) => onPromptChange(event.target.value)}
          onKeyDown={(event) => event.stopPropagation()}
          placeholder="Describe genre, mood, tempo, vocal style, and scene..."
          value={prompt}
        />

        <label htmlFor="music-node-lyrics" className="sr-only">
          Lyrics
        </label>
        <Textarea
          id="music-node-lyrics"
          aria-label="Lyrics"
          className="mt-2 min-h-24 resize-none border-0 border-t border-neutral-200 bg-transparent px-0 pt-2 text-sm shadow-none placeholder:text-neutral-400 focus-visible:ring-0"
          data-music-lyrics-input="true"
          disabled={busy}
          onChange={(event) => onLyricsChange(event.target.value)}
          onKeyDown={(event) => event.stopPropagation()}
          placeholder="[Verse]\nWrite lyrics or connect Script output..."
          value={lyrics}
        />

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-neutral-200 pt-3">
          <div className="flex min-w-0 items-center gap-2">
            <label htmlFor="music-model-select" className="sr-only">
              Music model
            </label>
            <select
              id="music-model-select"
              aria-label="Music model"
              className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 shadow-sm"
              data-music-model-select="true"
              defaultValue="configured"
              disabled={busy}
            >
              <option value="configured">Configured music model</option>
            </select>
            {connectedLyrics ? (
              <Button
                className="h-9 rounded-lg px-3 text-xs"
                data-music-use-connected-lyrics="true"
                disabled={busy}
                onClick={() => onUseConnectedLyrics(connectedLyrics)}
                type="button"
                variant="outline"
              >
                Use connected lyrics
              </Button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Button
              aria-label="Generate Audio node"
              className="h-9 rounded-lg px-4 text-xs"
              data-music-generate-loading={busy ? "true" : undefined}
              disabled={busy || !promptReady || !lyricsReady}
              onClick={() => {
                onResponseOpenChange(true);
                onGenerate();
              }}
              type="button"
            >
              {busy ? "Generating" : "Generate"}
              {busy ? (
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <Sparkles aria-hidden="true" className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

type ScriptOutputTabsProps = {
  backendExecution?: ScriptBackendExecution;
  conversationMode: boolean;
  error?: string | null;
  input: ScriptNodeInput;
  messages: ScriptDialogueMessage[];
  responseMode: ScriptResponseMode;
  task: ScriptTaskStatusResponse;
  onHide?: () => void;
};

export function ScriptOutputTabs({
  backendExecution = null,
  conversationMode,
  error,
  input,
  messages,
  responseMode,
  task,
  onHide,
}: ScriptOutputTabsProps) {
  const promptText = input.world_description.trim();
  const hasDialogueMessages = messages.length > 0;
  const statusLabel =
    responseMode === "revise" && !error && task.status === "running"
      ? SCRIPT_REVISE_STATUS_LABEL
      : responseMode === "revise" && !error && (conversationMode || hasDialogueMessages)
        ? SCRIPT_DIALOGUE_READY_LABEL
        : getScriptResponseStatusLabel(task, null, error);
  const statusDetail = error ?? task.error ?? null;
  const backendExecutionLabel = formatScriptBackendExecutionLabel(backendExecution);
  const assistantTitle = SCRIPT_REVISE_LABEL;

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
          ) : (
            <p
              className="mt-1 truncate text-xs text-neutral-500"
              data-script-backend-execution="true"
            >
              {backendExecutionLabel}
            </p>
          )}
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
                  subtitle={backendExecutionLabel}
                  title={assistantTitle}
                >
                  <p className="whitespace-pre-line">{message.content}</p>
                </AssistantResponseBubble>
              ),
            )
          : promptText ? (
              <UserPromptBubble>{promptText}</UserPromptBubble>
            ) : null}

        {conversationMode && !hasDialogueMessages && !statusDetail ? (
          <AssistantResponseBubble title={SCRIPT_REVISE_LABEL}>
            <p className="whitespace-pre-line">{SCRIPT_CONVERSATION_GUIDE}</p>
          </AssistantResponseBubble>
        ) : null}

        {statusLabel === "Error" && statusDetail ? (
          <AssistantResponseBubble title="AI">
            <p className="text-red-700">{statusDetail}</p>
          </AssistantResponseBubble>
        ) : null}

        {task.status === "running" ? (
          <AssistantResponseBubble title="AI" subtitle={backendExecutionLabel}>
            <AIResponseTyping
              showCursor
              speed={12}
              text=""
              thinkingState="thinking"
            />
          </AssistantResponseBubble>
        ) : null}

      </div>
    </section>
  );
}

type VideoNodeFloatingEditorProps = {
  frame: ImageEditorFrame;
  audioUrlCount: number;
  busy: boolean;
  connectedPrompt: string | null;
  duration: string;
  error: string | null;
  generation: VideoGenerationResponse | null;
  imageUrlCount: number;
  node: WorkflowNode;
  prompt: string;
  responseOpen: boolean;
  onClose: () => void;
  onDurationChange: (duration: string) => void;
  onFrameChange: (frame: ImageEditorFrame) => void;
  onGenerate: () => void;
  onPromptChange: (prompt: string) => void;
  onResponseOpenChange: (open: boolean) => void;
  onUseConnectedPrompt: (prompt: string) => void;
};

export function VideoNodeFloatingEditor({
  frame,
  audioUrlCount,
  busy,
  connectedPrompt,
  duration,
  error,
  generation,
  imageUrlCount,
  node,
  prompt,
  responseOpen,
  onClose,
  onDurationChange,
  onFrameChange,
  onGenerate,
  onPromptChange,
  onResponseOpenChange,
  onUseConnectedPrompt,
}: VideoNodeFloatingEditorProps) {
  const [interaction, setInteraction] = useState<ImageEditorInteraction>(null);
  const promptReady = prompt.trim().length > 0;
  const videoSource = generation
    ? videoSourceFromGeneratedVideo(generation.video)
    : null;

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

  return (
    <aside
      aria-label="Video node generation editor"
      className="absolute z-50 flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white/95 text-neutral-950 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur"
      data-video-node-editor="true"
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
        data-video-node-drag-handle="true"
        onPointerDown={(event) => startInteraction(event, "drag")}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{node.title}</p>
          <p className="truncate text-xs text-neutral-500">
            Evolink Seedance video
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="border-neutral-200 bg-neutral-50 text-neutral-600">
            {node.status}
          </Badge>
          <Button
            aria-label="Close Video node editor"
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
            data-video-node-response="true"
          >
            {busy ? (
              <AssistantResponseBubble title="Seedance">
                <div className="flex items-center gap-2 text-neutral-700">
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  <span>Generating video through the backend...</span>
                </div>
              </AssistantResponseBubble>
            ) : error ? (
              <AssistantResponseBubble title="Video Agent">
                <p className="text-red-700" data-video-node-error="true">
                  {error}
                </p>
              </AssistantResponseBubble>
            ) : generation && videoSource ? (
              <div className="flex flex-col gap-3">
                <div
                  className="overflow-hidden rounded-lg border border-neutral-200 bg-black"
                  data-generated-video-preview="true"
                >
                  <video
                    aria-label={`${node.title} generated video preview`}
                    className="aspect-video w-full bg-black"
                    controls
                    src={videoSource}
                  />
                </div>
                <div className="rounded-lg border border-neutral-200 bg-white p-3 text-xs leading-5 text-neutral-600">
                  <p
                    className="font-medium text-neutral-950"
                    data-video-backend-execution="true"
                  >
                    Backend: {generation.provider} / {generation.model}
                  </p>
                  <p className="mt-1" data-video-not-persisted="true">
                    {VIDEO_NO_PERSISTENCE_LABEL}
                  </p>
                </div>
              </div>
            ) : generation ? (
              <AssistantResponseBubble
                title="Video Agent"
                subtitle={`Backend: ${generation.provider} / ${generation.model}`}
              >
                <p data-video-provider-task="true">
                  Provider task {generation.provider_task_id ?? generation.task_id} was
                  accepted, but no playable video URL is available yet. Task polling is
                  not implemented in this Video node pass.
                </p>
              </AssistantResponseBubble>
            ) : (
              <AssistantResponseBubble title="Video Agent">
                <p>No video response is available yet.</p>
              </AssistantResponseBubble>
            )}
          </section>
        ) : (
          <section className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-6 text-center text-xs leading-5 text-neutral-500">
            Generate a video clip to preview backend-confirmed playback here.
          </section>
        )}

        <section className="shrink-0 rounded-xl border border-neutral-200 bg-white p-3">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
            <Badge
              className="border-neutral-200 bg-neutral-50 text-neutral-600"
              data-video-connected-images="true"
            >
              {imageUrlCount} image URLs
            </Badge>
            <Badge
              className="border-neutral-200 bg-neutral-50 text-neutral-600"
              data-video-connected-audio="true"
            >
              {audioUrlCount} audio URLs
            </Badge>
            {connectedPrompt ? (
              <Button
                className="h-7 rounded-lg px-2 text-[11px]"
                data-video-use-connected-prompt="true"
                disabled={busy}
                onClick={() => onUseConnectedPrompt(connectedPrompt)}
                type="button"
                variant="outline"
              >
                Use connected prompt
              </Button>
            ) : null}
          </div>

          <label htmlFor="video-node-prompt" className="sr-only">
            Video prompt
          </label>
          <Textarea
            id="video-node-prompt"
            aria-label="Video prompt"
            className="min-h-20 resize-none border-0 bg-transparent px-0 text-sm shadow-none placeholder:text-neutral-400 focus-visible:ring-0"
            data-video-prompt-input="true"
            disabled={busy}
            onChange={(event) => onPromptChange(event.target.value)}
            placeholder="Describe camera movement, action, style, and timing..."
            value={prompt}
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <label
              htmlFor="video-node-duration"
              className="text-xs font-medium text-neutral-700"
            >
              Duration
            </label>
            <input
              id="video-node-duration"
              aria-label="Video duration seconds"
              className="h-9 w-24 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-950 outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
              data-video-duration-input="true"
              disabled={busy}
              max={MAX_VIDEO_DURATION_SECONDS}
              min={MIN_VIDEO_DURATION_SECONDS}
              onChange={(event) => onDurationChange(event.target.value)}
              type="number"
              value={duration}
            />
            <Button
              aria-label="Generate Video node"
              className="h-9 rounded-lg px-4 text-xs"
              data-video-generate-loading={busy ? "true" : undefined}
              disabled={busy || (!promptReady && imageUrlCount === 0)}
              onClick={() => {
                onResponseOpenChange(true);
                onGenerate();
              }}
              type="button"
            >
              {busy ? "Generating" : "Generate"}
              {busy ? (
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <Video aria-hidden="true" className="size-4" />
              )}
            </Button>
          </div>
        </section>
      </div>

      <button
        aria-label="Resize Video node editor"
        className="absolute bottom-1 right-1 size-5 cursor-nwse-resize rounded-sm border-b-2 border-r-2 border-neutral-300"
        data-video-node-resize-handle="true"
        onPointerDown={(event) => startInteraction(event, "resize")}
        type="button"
      />
    </aside>
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

type ScriptOutcomeNodeEditorProps = {
  node: WorkflowNode;
  text: string | null;
  onTextChange: (value: string) => void;
};

export function ScriptOutcomeNodeEditor({
  node,
  text,
  onTextChange,
}: ScriptOutcomeNodeEditorProps) {
  const outputText = text ?? "";

  return (
    <div data-script-outcome-node="true">
      <label htmlFor={`${node.id}-text`} className="sr-only">
        Script direct output
      </label>
      <Textarea
        id={`${node.id}-text`}
        aria-label="Script direct output"
        className="min-h-40 resize-none border-0 bg-transparent p-0 text-xs leading-5 text-neutral-800 shadow-none focus-visible:ring-0"
        data-script-outcome-textarea="true"
        onChange={(event) => onTextChange(event.target.value)}
        onKeyDown={(event) => event.stopPropagation()}
        placeholder="Generate direct Script text to edit it here."
        value={outputText}
      />
    </div>
  );
}

export function formatWorkflowOutputExecutionLabel(output?: WorkflowNodeOutput) {
  if (!output?.provider) {
    return "Backend: waiting for server confirmation";
  }

  const model = output.model ?? "server default";

  return `Backend: ${output.provider} / ${model}`;
}

type WorkflowNodeCardProps = {
  node: WorkflowNode;
  scriptInput: ScriptNodeInput | null;
  scriptOutcomeText: string | null;
  selected: boolean;
  pendingPort: WorkflowPort | null;
  onScriptOutcomeTextChange: (nodeId: string, value: string) => void;
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

export function WorkflowNodeCard({
  node,
  scriptInput,
  scriptOutcomeText,
  selected,
  pendingPort,
  onScriptOutcomeTextChange,
  onDragStart,
  onSelect,
  onPortConnectionStart,
}: WorkflowNodeCardProps) {
  const Icon = nodeIcons[node.type];
  const inputs = node.ports.filter((port) => port.direction === "input");
  const outputs = node.ports.filter((port) => port.direction === "output");
  const scriptPreview = formatScriptNodePreview(scriptInput, null);
  const nodeSubtitle = node.output?.provider
    ? formatWorkflowOutputExecutionLabel(node.output)
    : node.id;
  const running = node.status === "running";
  const imageOutputSource = imageSourceFromWorkflowOutput(node.output);
  const audioOutputSource = audioSourceFromWorkflowOutput(node.output);
  const videoOutputSource = videoSourceFromWorkflowOutput(node.output);

  return (
    <article
      className={cn(
        "absolute rounded-lg border bg-white text-neutral-950 shadow-[0_18px_50px_rgba(15,23,42,0.12)] transition",
        selected
          ? "border-neutral-950/70"
          : "border-neutral-200 hover:border-neutral-300",
        running && "ring-2 ring-neutral-950/10",
      )}
      data-workflow-node={node.type}
      data-workflow-node-running={running ? "true" : undefined}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: NODE_WIDTH,
        minHeight: NODE_HEIGHT,
      }}
    >
      <button
        type="button"
        className="flex w-full cursor-grab items-start gap-3 rounded-t-lg px-4 py-4 text-left active:cursor-grabbing"
        onPointerDown={(event) => onDragStart(event, node)}
        onClick={() => onSelect({ kind: "node", id: node.id })}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
          {running ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Icon aria-hidden="true" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">
            {node.title}
          </span>
          <span
            className="block truncate text-xs text-neutral-500"
            data-script-outcome-provider={
              node.output?.dataType === "script" ? "true" : undefined
            }
          >
            {nodeSubtitle}
          </span>
        </span>
        <Badge className="border-neutral-200 bg-neutral-50 text-neutral-700">
          {node.status}
        </Badge>
      </button>

      <div className="px-4 pb-4">
        {running ? (
          <div
            aria-label={`${node.title} generation is running`}
            className="mb-3 overflow-hidden rounded-full bg-neutral-100"
            data-workflow-node-loading="true"
          >
            <span className="block h-1.5 w-1/2 animate-pulse rounded-full bg-neutral-950" />
          </div>
        ) : null}

        {node.output?.dataType === "script" ? (
          <ScriptOutcomeNodeEditor
            node={node}
            text={scriptOutcomeText}
            onTextChange={(value) => onScriptOutcomeTextChange(node.id, value)}
          />
        ) : videoOutputSource ? (
          <div
            className="rounded-md border border-neutral-200 bg-neutral-50 p-3"
            data-video-outcome-node="true"
          >
            <video
              aria-label={`${node.title} video preview`}
              className="aspect-video w-full rounded bg-black"
              controls
              data-video-outcome-player="true"
              src={videoOutputSource}
            />
            <p
              className="mt-2 text-[11px] leading-4 text-neutral-500"
              data-video-outcome-not-persisted="true"
            >
              {VIDEO_NO_PERSISTENCE_LABEL}
            </p>
          </div>
        ) : audioOutputSource ? (
          <div
            className="rounded-md border border-neutral-200 bg-neutral-50 p-3"
            data-audio-outcome-node="true"
          >
            <audio
              aria-label={`${node.title} audio preview`}
              className="w-full"
              controls
              data-audio-outcome-player="true"
              src={audioOutputSource}
            />
            <p
              className="mt-2 text-[11px] leading-4 text-neutral-500"
              data-audio-outcome-not-persisted="true"
            >
              {MUSIC_NO_PERSISTENCE_LABEL}
            </p>
          </div>
        ) : imageOutputSource ? (
          <div data-image-outcome-node="true">
            <div className="overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
              <img
                alt={node.output?.media?.alt ?? `${node.title} generated image`}
                className="aspect-square w-full object-cover"
                data-image-outcome-preview="true"
                src={imageOutputSource}
              />
            </div>
            <p className="mt-2 text-[11px] leading-4 text-neutral-500">
              Local preview only; not saved to the asset library yet.
            </p>
          </div>
        ) : node.type === "script" ? (
          <div className="max-h-28 overflow-hidden text-xs leading-5 text-neutral-700">
            <p className="font-semibold text-neutral-950">
              {scriptPreview.heading}
            </p>
            <p>{scriptPreview.body}</p>
          </div>
        ) : node.type === "storyboard" ? (
          <div>
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
          <div className="flex h-24 items-center justify-center">
            <Film aria-hidden="true" className="text-neutral-500" />
          </div>
        ) : node.type === "audio" ? (
          <div className="flex h-24 flex-col items-center justify-center gap-2 text-xs text-neutral-500">
            <Mic2 aria-hidden="true" />
            <span>Text to music</span>
          </div>
        ) : (
          <div className="flex h-24 items-center justify-center">
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
