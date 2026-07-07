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

export type ScriptDialogueMessage = {
  role: ScriptDialogueRole;
  content: string;
};

export type ScriptDialogueRequest = {
  input: ScriptNodeInput;
  settings?: ScriptNodeSettings;
  history?: ScriptDialogueMessage[];
  message: string;
};

export type ScriptDialogueResponse = {
  project_id: string;
  node_id: string;
  provider: string;
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
};

export type ScriptTaskResultResponse = ScriptTaskStatusResponse & {
  output: ScriptNodeOutput | null;
};

export const DEFAULT_SCRIPT_NODE_INPUT: ScriptNodeInput = {
  world_description: "",
};
