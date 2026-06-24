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

