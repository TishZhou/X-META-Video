export const TASK_STATUSES = [
  "queued",
  "running",
  "succeeded",
  "failed",
  "cancelled",
  "retrying",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const NODE_TYPES = [
  "script",
  "storyboard",
  "character_image",
  "prop_asset",
  "scene_image",
  "image_composition",
  "audio",
  "video",
  "export",
] as const;

export type NodeType = (typeof NODE_TYPES)[number];

export type ScriptNodeInput = {
  world_description: string;
};

export type ScriptNodeSettings = {
  provider?: string;
  model?: string;
  temperature?: number;
};

export type ScriptCharacterProfile = {
  name: string;
  overview: string;
  style: string;
  clothing: string;
  height: string;
  appearance: string;
  personality: string;
  visual_prompt: string;
};

export type ScriptStoryboardShot = {
  shot_number: number;
  pov: string;
  framing: string;
  action: string;
  camera_movement: string;
  duration_seconds: number;
};

export type ScriptStoryboardDirection = {
  pov: string;
  visual_rhythm: string;
  shots: ScriptStoryboardShot[];
};

export type ScriptSceneDescription = {
  scene_number: number;
  shot_reference: number;
  characters: string[];
  location: string;
  description: string;
  visual_prompt: string;
};

export type ScriptNodeOutput = {
  title: string;
  agent_output?: string | null;
  world_overview: string;
  storyboard_direction: ScriptStoryboardDirection;
  characters: ScriptCharacterProfile[];
  scene_descriptions: ScriptSceneDescription[];
  missing_inputs: string[];
};

export type ScriptDialogueRole = "user" | "assistant";
export type ScriptDialogueMode = "dialogue" | "direct_output";

export type ScriptDialogueMessage = {
  role: ScriptDialogueRole;
  content: string;
};

export type ScriptDialogueRequest = {
  input: ScriptNodeInput;
  settings?: ScriptNodeSettings;
  history?: ScriptDialogueMessage[];
  message: string;
  mode?: ScriptDialogueMode;
};

export type ScriptDialogueResponse = {
  project_id: string;
  node_id: string;
  provider: string;
  model?: string | null;
  message: ScriptDialogueMessage;
  history: ScriptDialogueMessage[];
};

export type ScriptNodeSaveRequest = {
  input: ScriptNodeInput;
  settings?: ScriptNodeSettings;
  base_version?: number;
};

export type ScriptNodeStateResponse = {
  project_id: string;
  node_id: string;
  node_type: "script";
  input: ScriptNodeInput;
  settings: ScriptNodeSettings;
  version: number;
  output: ScriptNodeOutput | null;
};

export type TaskResponse = {
  task_id: string;
  project_id: string;
  node_id: string;
  status: TaskStatus;
};

export type ScriptTaskStatusResponse = TaskResponse & {
  error?: string | null;
  provider?: string;
  model?: string | null;
};

export type ScriptTaskResultResponse = ScriptTaskStatusResponse & {
  output: ScriptNodeOutput | null;
};

export const DEFAULT_SCRIPT_NODE_INPUT: ScriptNodeInput = {
  world_description: "",
};

export const IMAGE_GENERATION_NODE_TYPES = [
  "character_image",
  "prop_asset",
  "scene_image",
] as const;

export type ImageGenerationNodeType =
  (typeof IMAGE_GENERATION_NODE_TYPES)[number];

export type ImageGenerationInput = {
  prompt: string;
  reference_image_url?: string | null;
  reference_image_b64?: string | null;
  reference_image_mime_type?: string | null;
};

export type ImageGenerationSettings = {
  provider?: string;
  model?: string;
  size?: string;
  response_format?: "url" | "b64_json";
  watermark?: boolean;
};

export type GeneratedImage = {
  url?: string | null;
  b64_json?: string | null;
  mime_type?: string | null;
  width?: number | null;
  height?: number | null;
};

export type ImageGenerationRequest = {
  node_type: ImageGenerationNodeType;
  input: ImageGenerationInput;
  settings?: ImageGenerationSettings;
};

export type ImageGenerationResponse = {
  project_id: string;
  node_id: string;
  node_type: ImageGenerationNodeType;
  provider: string;
  model: string;
  prompt: string;
  image: GeneratedImage;
  persisted: boolean;
};

export const MUSIC_GENERATION_NODE_TYPES = ["audio"] as const;

export type MusicGenerationNodeType =
  (typeof MUSIC_GENERATION_NODE_TYPES)[number];

export type MusicGenerationInput = {
  prompt: string;
  lyrics: string;
};

export type MusicGenerationSettings = {
  provider?: string;
  model?: string;
  output_format?: "url" | "hex";
  sample_rate?: number;
  bitrate?: number;
  format?: "mp3" | "wav" | "flac";
  lyrics_optimizer?: boolean;
  is_instrumental?: boolean;
};

export type GeneratedAudio = {
  url?: string | null;
  hex?: string | null;
  b64_audio?: string | null;
  mime_type?: string | null;
  duration_ms?: number | null;
  sample_rate?: number | null;
  channels?: number | null;
  bitrate?: number | null;
  size_bytes?: number | null;
};

export type MusicGenerationRequest = {
  node_type: MusicGenerationNodeType;
  input: MusicGenerationInput;
  settings?: MusicGenerationSettings;
};

export type MusicGenerationResponse = {
  project_id: string;
  node_id: string;
  node_type: MusicGenerationNodeType;
  provider: string;
  model: string;
  prompt: string;
  lyrics: string;
  audio: GeneratedAudio;
  persisted: boolean;
};

export const VIDEO_GENERATION_NODE_TYPES = ["video"] as const;

export type VideoGenerationNodeType =
  (typeof VIDEO_GENERATION_NODE_TYPES)[number];

export type VideoGenerationInput = {
  prompt: string;
  duration?: number;
  image_urls?: string[];
  audio_urls?: string[];
  duration_seconds?: number;
};

export type VideoGenerationSettings = {
  provider?: string;
  model?: string;
  text_to_video_model?: string;
  quality?: string;
  aspect_ratio?: string;
  generate_audio?: boolean;
};

export type GeneratedVideo = {
  url?: string | null;
  mime_type?: string | null;
  duration_ms?: number | null;
  width?: number | null;
  height?: number | null;
  thumbnail_url?: string | null;
};

export type VideoGenerationRequest = {
  node_type: VideoGenerationNodeType;
  input: VideoGenerationInput;
  settings?: VideoGenerationSettings;
};

export type VideoGenerationResponse = {
  task_id?: string | null;
  project_id: string;
  node_id: string;
  node_type: VideoGenerationNodeType;
  provider: string;
  model: string;
  prompt: string;
  image_urls: string[];
  audio_urls: string[];
  duration: number;
  duration_seconds?: number;
  video: GeneratedVideo;
  provider_task_id?: string | null;
  persisted: boolean;
};
