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

export const SCRIPT_CONTENT_TYPES = [
  "comic_drama",
  "mv",
  "short_video",
] as const;

export type ScriptContentType = (typeof SCRIPT_CONTENT_TYPES)[number];

export type ScriptNodeInput = {
  creative_brief: string;
  content_type: ScriptContentType;
  style: string;
  theme: string;
  world_setting: string;
  duration_seconds: number;
  language: string;
  target_platform: string;
  audience: string;
  constraints: string[];
  references: string[];
};

export type ScriptNodeSettings = {
  provider?: string;
  model?: string;
  temperature?: number;
};

export type ScriptCharacterProfile = {
  name: string;
  role: string;
  personality: string;
  visual_prompt: string;
  dialogue_style: string;
};

export type ScriptStoryBeat = {
  beat: string;
  purpose: string;
  summary: string;
};

export type ScriptShot = {
  shot_number: number;
  scene: string;
  action: string;
  characters: string[];
  dialogue: string;
  camera: string;
  duration_seconds: number;
  image_prompt: string;
};

export type ScriptLine = {
  speaker: string;
  text: string;
  delivery: string;
};

export type ScriptNodeOutput = {
  title: string;
  logline: string;
  plot_summary: string;
  characters: ScriptCharacterProfile[];
  story_beats: ScriptStoryBeat[];
  shot_plan: ScriptShot[];
  dialogue_or_lyrics: ScriptLine[];
  camera_notes: string[];
  scene_prompts: string[];
  audio_notes: string[];
  production_checklist: string[];
  missing_inputs: string[];
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
  creative_brief: "",
  content_type: "comic_drama",
  style: "cinematic comic drama",
  theme: "",
  world_setting: "",
  duration_seconds: 90,
  language: "Chinese",
  target_platform: "short_video",
  audience: "general audience",
  constraints: [],
  references: [],
};
