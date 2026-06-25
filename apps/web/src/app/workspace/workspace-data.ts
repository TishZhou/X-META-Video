import {
  AlertTriangle,
  BookOpenText,
  CheckCircle2,
  Clock3,
  Database,
  Download,
  Film,
  Gauge,
  Grid3X3,
  History,
  Image as ImageIcon,
  Layers3,
  LayoutDashboard,
  Library,
  ListChecks,
  Mic2,
  Package,
  PenLine,
  RefreshCw,
  ServerOff,
  Share2,
  ShieldCheck,
  UserRound,
  UsersRound,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type WorkspaceRoute = {
  description: string;
  href: string;
  icon: LucideIcon;
  label: string;
};

export type WorkspaceNode = {
  dependencies: string[];
  description: string;
  icon: LucideIcon;
  inputs: string[];
  output: string;
  status: string;
  title: string;
};

export type AssetItem = {
  source: string;
  status: string;
  title: string;
  type: string;
  version: string;
};

export type TaskItem = {
  detail: string;
  icon: LucideIcon;
  node: string;
  nextStep: string;
  state: string;
  title: string;
};

export type HistoryEvent = {
  detail: string;
  meta: string;
  title: string;
  version: string;
};

export type ExportGate = {
  detail: string;
  state: string;
  title: string;
};

export type RolePreview = {
  access: string;
  role: string;
  scope: string;
};

export const workspaceRoutes: WorkspaceRoute[] = [
  {
    description: "Project orientation and route map.",
    href: "/workspace",
    icon: LayoutDashboard,
    label: "Overview",
  },
  {
    description: "Static workflow canvas and node inspector.",
    href: "/workspace/canvas",
    icon: Workflow,
    label: "Canvas",
  },
  {
    description: "Reusable generated asset previews.",
    href: "/workspace/assets",
    icon: Library,
    label: "Assets",
  },
  {
    description: "Queued, running, failed, and retry states.",
    href: "/workspace/tasks",
    icon: ListChecks,
    label: "Tasks",
  },
  {
    description: "Generation attempts and version lineage.",
    href: "/workspace/history",
    icon: History,
    label: "History",
  },
  {
    description: "Readiness gates and export settings.",
    href: "/workspace/export",
    icon: Download,
    label: "Export",
  },
  {
    description: "Account, role, and workspace boundary preview.",
    href: "/workspace/account",
    icon: ShieldCheck,
    label: "Account",
  },
];

export const prototypeBoundaries = [
  "Static/local page prototype only",
  "No backend calls; No persistence, autosave, or organization switching",
  "No model gateway, provider queue, workers, or export rendering",
];

export const overviewHighlights = [
  {
    label: "Production mode",
    value: "AI comic drama",
    detail: "Local sample project direction",
  },
  {
    label: "Primary workspace",
    value: "Node canvas",
    detail: "Canvas is the central production surface",
  },
  {
    label: "Backend state",
    value: "Planned",
    detail: "FastAPI remains source of truth in later features",
  },
];

export const workspaceNodes: WorkspaceNode[] = [
  {
    dependencies: ["Creative brief"],
    description: "Converts a production idea into plot, dialogue, lyrics, camera notes, and character profiles.",
    icon: PenLine,
    inputs: ["Brief", "Theme", "Duration", "Format"],
    output: "Script plan and storyboard seed",
    status: "Static input preview",
    title: "Script",
  },
  {
    dependencies: ["Script"],
    description: "Turns script structure into shot beats, panel notes, scene actions, and timing direction.",
    icon: BookOpenText,
    inputs: ["Script version", "Shot count", "Panel rhythm"],
    output: "Editable storyboard draft",
    status: "Planned conversion",
    title: "Storyboard",
  },
  {
    dependencies: ["Script", "Storyboard"],
    description: "Defines reusable character references for consistency across scenes and shots.",
    icon: UserRound,
    inputs: ["Profile", "Appearance", "Outfit", "Reference"],
    output: "Character asset",
    status: "Asset service missing",
    title: "Character",
  },
  {
    dependencies: ["Storyboard"],
    description: "Creates reusable scene backgrounds that can be attached to composed shots.",
    icon: ImageIcon,
    inputs: ["Scene brief", "Mood", "Lighting", "Style"],
    output: "Scene asset",
    status: "Provider call missing",
    title: "Scene",
  },
  {
    dependencies: ["Storyboard"],
    description: "Captures objects, accessories, and props that need reusable source metadata.",
    icon: Package,
    inputs: ["Object brief", "Material", "Scale", "Usage"],
    output: "Prop asset",
    status: "Optional node",
    title: "Prop",
  },
  {
    dependencies: ["Character", "Scene", "Prop"],
    description: "Combines selected asset versions into production keyframes and panel images.",
    icon: Layers3,
    inputs: ["Character version", "Scene version", "Shot direction"],
    output: "Composed keyframe",
    status: "Composition planned",
    title: "Image Composition",
  },
  {
    dependencies: ["Script", "Storyboard"],
    description: "Prepares dialogue, narration, lyrics, or singing direction for timed generation.",
    icon: Mic2,
    inputs: ["Text", "Voice style", "Timing notes"],
    output: "Audio asset",
    status: "Audio provider missing",
    title: "Audio",
  },
  {
    dependencies: ["Image Composition", "Audio"],
    description: "Uses keyframes, motion notes, and optional audio to plan short generated clips.",
    icon: Film,
    inputs: ["Keyframes", "Audio", "Duration", "Motion notes"],
    output: "Video clip",
    status: "Video worker missing",
    title: "Video",
  },
  {
    dependencies: ["Storyboard", "Image Composition"],
    description: "Collects selected panels into a nine-cell storyboard board for review.",
    icon: Grid3X3,
    inputs: ["Nine selected panels", "Captions", "Order"],
    output: "9-grid storyboard",
    status: "Reuse planned",
    title: "9-Grid Storyboard",
  },
  {
    dependencies: ["Video", "Audio", "History"],
    description: "Checks selected clips, audio, rights notes, and output settings before final assembly.",
    icon: Share2,
    inputs: ["Selected clips", "Audio mix", "Format", "Rights notes"],
    output: "Final video artifact",
    status: "Renderer missing",
    title: "Export",
  },
];

export const selectedNode = workspaceNodes[0];

export const assetItems: AssetItem[] = [
  {
    source: "Character node",
    status: "Local example",
    title: "Lead detective full-body reference",
    type: "Character",
    version: "v0.1",
  },
  {
    source: "Scene node",
    status: "Local example",
    title: "Rainy neon alley background",
    type: "Scene",
    version: "v0.1",
  },
  {
    source: "Prop node",
    status: "Metadata slot",
    title: "Signal bracelet close-up prop",
    type: "Prop",
    version: "v0.0",
  },
  {
    source: "Audio node",
    status: "Planned asset",
    title: "Opening narration guide track",
    type: "Audio",
    version: "pending",
  },
  {
    source: "Video node",
    status: "Planned asset",
    title: "Alley reveal clip",
    type: "Video",
    version: "pending",
  },
  {
    source: "Export node",
    status: "Renderer missing",
    title: "Pilot teaser export",
    type: "Export",
    version: "pending",
  },
];

export const taskItems: TaskItem[] = [
  {
    detail: "Waiting for a production API to create the first script task.",
    icon: Clock3,
    node: "Script",
    nextStep: "Create task through FastAPI in a later feature.",
    state: "Queued preview",
    title: "Script planning",
  },
  {
    detail: "Worker progress will stream through task status updates when queue support exists.",
    icon: Gauge,
    node: "Image Composition",
    nextStep: "Connect Redis queue, workers, and status fanout later.",
    state: "Running preview",
    title: "Keyframe composition",
  },
  {
    detail: "Successful upstream outputs remain available for downstream nodes.",
    icon: CheckCircle2,
    node: "Scene",
    nextStep: "Persist asset versions through the Asset Service later.",
    state: "Succeeded preview",
    title: "Scene asset generation",
  },
  {
    detail: "Retry should create a new attempt without deleting the previous input version.",
    icon: AlertTriangle,
    node: "Video",
    nextStep: "Retry mutation and provider failure rules are backend work.",
    state: "Failed preview",
    title: "Video clip generation",
  },
];

export const historyEvents: HistoryEvent[] = [
  {
    detail: "Creative brief drafted for a noir comic drama pilot with MV-style pacing.",
    meta: "Local sample event",
    title: "Project direction created",
    version: "v0.1",
  },
  {
    detail: "Script node produced plot, dialogue beats, camera notes, and character seeds.",
    meta: "Generation attempt placeholder",
    title: "Script plan selected",
    version: "v0.2",
  },
  {
    detail: "Scene and character examples were attached to the composition path.",
    meta: "Asset lineage placeholder",
    title: "Asset versions attached",
    version: "v0.3",
  },
  {
    detail: "Failed video attempt remains recoverable through task retry and history.",
    meta: "Retry path placeholder",
    title: "Video attempt failed",
    version: "v0.4",
  },
];

export const exportReadiness: ExportGate[] = [
  {
    detail: "Storyboard and composition placeholders are visible in the canvas prototype.",
    state: "Preview ready",
    title: "Visual sequence",
  },
  {
    detail: "Dialogue and narration audio generation are planned but not connected.",
    state: "Missing backend",
    title: "Audio mix",
  },
  {
    detail: "Clip selection needs persisted video assets before rendering can begin.",
    state: "Missing assets",
    title: "Video clips",
  },
  {
    detail: "Rights and source metadata slots are documented for asset service work.",
    state: "Metadata planned",
    title: "Usage rights",
  },
];

export const exportSettings = [
  "Format: short-form video or MV",
  "Aspect ratio: 9:16, 16:9, or storyboard board",
  "Inputs: selected clip versions and audio version",
  "Output: final video artifact after renderer exists",
];

export const accountBoundaries = [
  {
    icon: ShieldCheck,
    label: "Production auth",
    value: "Planned FastAPI-owned login and session validation",
  },
  {
    icon: UsersRound,
    label: "Workspace membership",
    value: "Owner, Admin, Editor, and Viewer roles remain backend-enforced",
  },
  {
    icon: Database,
    label: "Account-scoped data",
    value: "Projects, assets, tasks, and history must filter by org and project",
  },
  {
    icon: ServerOff,
    label: "Feature 2 boundary",
    value: "No membership mutation, billing, invitation, or production login",
  },
];

export const rolePreview: RolePreview[] = [
  {
    access: "Organization, users, billing, all projects",
    role: "Owner",
    scope: "Backend enforced later",
  },
  {
    access: "Users and project administration",
    role: "Admin",
    scope: "Backend enforced later",
  },
  {
    access: "Create and edit projects and generation tasks",
    role: "Editor",
    scope: "Backend enforced later",
  },
  {
    access: "View projects, assets, tasks, and history",
    role: "Viewer",
    scope: "Backend enforced later",
  },
];

export const recoveryRules = [
  {
    icon: RefreshCw,
    title: "Retry creates a new attempt",
    detail: "A failed node retry should reference the exact node and input version.",
  },
  {
    icon: CheckCircle2,
    title: "Upstream outputs stay available",
    detail: "Successful script, scene, character, or audio output must not be deleted by downstream failure.",
  },
  {
    icon: History,
    title: "History records visible changes",
    detail: "Selected versions and generation attempts belong in persistent history later.",
  },
];
