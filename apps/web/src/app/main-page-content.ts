import {
  BookOpenText,
  Clapperboard,
  Film,
  Image,
  Mic2,
  Music2,
  PenLine,
  Share2,
  type LucideIcon,
} from "lucide-react";

export type CreationMode = {
  title: string;
  description: string;
  icon: LucideIcon;
  infoTitle: string;
  infoDescription: string;
  infoItems: string[];
};

export type CanvasNode = {
  title: string;
  label: string;
  detail: string;
  icon: LucideIcon;
};

export type ProjectStartChoice = {
  title: string;
  description: string;
  icon: LucideIcon;
  output: string;
};

export type RecentWork = {
  title: string;
  format: string;
  status: string;
  description: string;
  action: string;
};

export const mainPageContent = {
  productName: "X-META Video",
  eyebrow: "Node-based AI production workspace",
  heroTitle: "X-META Video",
  heroDescription:
    "A visual AI creation platform for AI comic drama, MV, and short-form video creation, built around reusable script, asset, audio, video, and export workflows.",
  primaryAction: "Create Project",
  workspaceAction: "Enter Workspace",
  secondaryAction: "Review production modes",
  tertiaryAction: "See canvas direction",
  recentWorkTitle: "Recent work",
  recentWorkDescription:
    "Static local examples show where existing projects will reopen once project persistence is added.",
  recentWorkEmptyLabel: "No saved cloud projects yet",
  recentWorkEmptyDescription:
    "Create a project direction or enter the workspace placeholder to continue shaping production work. Inbox-style entry points are intentionally not part of this surface.",
  recentWorkItems: [
    {
      title: "Neon alley comic pilot",
      format: "AI comic drama",
      status: "Storyboard draft",
      description:
        "Open a saved-style entry for scenes, characters, dialogue beats, and nine-grid planning.",
      action: "Open project outline",
    },
    {
      title: "Midnight chorus MV",
      format: "MV creation",
      status: "Audio direction",
      description:
        "Return to lyrics, rhythm notes, visual references, and clip sequencing.",
      action: "Open production plan",
    },
  ] satisfies RecentWork[],
  workspaceTitle: "Workspace entry placeholder",
  workspaceDescription:
    "Enter Workspace lands here for now. The full workspace shell, saved projects, canvas routing, and execution controls are later Feature 2 and Feature 3 work.",
  workspaceStatus: "UI-only entry point",
  workspaceActionsNote:
    "Use this placeholder to confirm the entry path before real project state, backend persistence, and canvas execution exist.",
  projectStartTitle: "Choose a project starting point",
  projectStartDescription:
    "These are frontend-only start choices for planning the first creative direction. Real project creation, persistence, and workspace routing arrive in Feature 2.",
  projectStartChoices: [
    {
      title: "AI comic drama",
      description:
        "Start from story arcs, characters, scenes, dialogue, and storyboard planning.",
      icon: Clapperboard,
      output: "Script and storyboard direction",
    },
    {
      title: "MV creation",
      description:
        "Start from lyrics, mood, vocal direction, shot rhythm, and visual references.",
      icon: Music2,
      output: "Music-video production brief",
    },
    {
      title: "Short-form video",
      description:
        "Start from hook, audience, campaign angle, shot variants, and export intent.",
      icon: Film,
      output: "Reusable short-form pipeline",
    },
  ] satisfies ProjectStartChoice[],
  productionModes: [
    {
      title: "AI comic drama",
      description:
        "Plan episodic scenes, characters, dialogue, and storyboard beats from one creative brief.",
      icon: Clapperboard,
      infoTitle: "Expanded production context",
      infoDescription:
        "Designed for serialized story planning where one brief branches into plot arcs, character notes, scene beats, and revision-ready storyboard material.",
      infoItems: ["Scenes", "Dialogue", "Characters"],
    },
    {
      title: "MV creation",
      description:
        "Shape lyrics, mood boards, vocal direction, shot rhythm, and video-ready sequences.",
      icon: Music2,
      infoTitle: "Expanded production context",
      infoDescription:
        "Keeps music-video planning tied to rhythm, vocal direction, visual references, and shot pacing before audio and video generation begins.",
      infoItems: ["Lyrics", "Mood", "Rhythm"],
    },
    {
      title: "Short-form video",
      description:
        "Turn campaign or story ideas into fast, reusable visual production pipelines.",
      icon: Film,
      infoTitle: "Expanded production context",
      infoDescription:
        "Supports compact visual pipelines where a campaign or story idea becomes reusable hooks, shots, assets, and export-ready variants.",
      infoItems: ["Hooks", "Variants", "Exports"],
    },
  ] satisfies CreationMode[],
  productionModesTitle: "Production modes",
  productionModesDescription:
    "Each mode keeps its own creative starting point while staying connected to the same node-based production chain.",
  canvasNodes: [
    {
      title: "Script",
      label: "Plot, dialogue, and camera notes",
      detail: "Turn the creative brief into scene structure and usable writing material.",
      icon: PenLine,
    },
    {
      title: "Storyboard",
      label: "Shot list and production beats",
      detail: "Map story moments into panels, shot timing, and visual direction.",
      icon: BookOpenText,
    },
    {
      title: "Character and scene assets",
      label: "Reusable production library",
      detail: "Generate characters, locations, props, and scene references for reuse.",
      icon: Image,
    },
    {
      title: "Audio",
      label: "Voice, narration, or singing",
      detail: "Convert dialogue, lyrics, or narration into timed audio direction.",
      icon: Mic2,
    },
    {
      title: "Video",
      label: "Clips from images and audio",
      detail: "Prepare generated keyframes and sound for short video sequences.",
      icon: Film,
    },
    {
      title: "Export",
      label: "Final comic drama, MV, or short",
      detail: "Assemble selected clips, audio, and versions into a deliverable.",
      icon: Share2,
    },
  ] satisfies CanvasNode[],
  capabilityBadges: [
    "Script",
    "Storyboard",
    "Assets",
    "Audio",
    "Video",
    "Export",
  ],
  previewTitle: "Creation workflow preview",
  previewDescription:
    "A production pipeline preview for how future workspace nodes move work from writing to assets, audio, video, and export.",
  previewMeta: "Static orientation only",
  sourcePattern: "UI TripleD Hero Block motion pattern",
};
