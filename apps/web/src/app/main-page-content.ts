import {
  Clapperboard,
  Film,
  Layers3,
  Music2,
  PenLine,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type CreationMode = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type CanvasNode = {
  title: string;
  label: string;
};

export const mainPageContent = {
  productName: "X-META Video",
  eyebrow: "Node-based AI production workspace",
  heroTitle: "X-META Video",
  heroDescription:
    "A visual AI creation platform for AI comic drama, MV, and short-form video creation, built around reusable script, asset, audio, video, and export workflows.",
  primaryAction: "Review production modes",
  secondaryAction: "See canvas direction",
  productionModes: [
    {
      title: "AI comic drama",
      description:
        "Plan episodic scenes, characters, dialogue, and storyboard beats from one creative brief.",
      icon: Clapperboard,
    },
    {
      title: "MV creation",
      description:
        "Shape lyrics, mood boards, vocal direction, shot rhythm, and video-ready sequences.",
      icon: Music2,
    },
    {
      title: "Short-form video",
      description:
        "Turn campaign or story ideas into fast, reusable visual production pipelines.",
      icon: Film,
    },
  ] satisfies CreationMode[],
  canvasNodes: [
    { title: "Brief", label: "Creative intent" },
    { title: "Script", label: "Plot and shots" },
    { title: "Assets", label: "Characters and scenes" },
    { title: "Output", label: "Audio and video" },
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
};
