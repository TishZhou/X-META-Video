import { Clapperboard, Film, Music2, type LucideIcon } from "lucide-react";

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
};

export type ProjectStartChoice = {
  title: string;
  description: string;
  icon: LucideIcon;
  output: string;
};

export const mainPageContent = {
  productName: "X-META Video",
  eyebrow: "Node-based AI production workspace",
  heroTitle: "X-META Video",
  heroDescription:
    "A visual AI creation platform for AI comic drama, MV, and short-form video creation, built around reusable script, asset, audio, video, and export workflows.",
  primaryAction: "Create Project",
  secondaryAction: "Review production modes",
  tertiaryAction: "See canvas direction",
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
      title: "Brief",
      label: "Creative intent",
      detail: "Capture tone, audience, IP setting, and output goal.",
    },
    {
      title: "Script",
      label: "Plot and shots",
      detail: "Convert intent into scenes, dialogue, and camera notes.",
    },
    {
      title: "Assets",
      label: "Characters and scenes",
      detail: "Generate reusable visual ingredients for the workflow.",
    },
    {
      title: "Output",
      label: "Audio and video",
      detail: "Track downstream voice, music, video, and export nodes.",
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
  previewTitle: "Canvas-first production",
  previewDescription:
    "The workspace direction is a Figma-like AI workflow canvas where every generation step is represented as a reusable node.",
  sourcePattern: "UI TripleD Hero Block motion pattern",
};
