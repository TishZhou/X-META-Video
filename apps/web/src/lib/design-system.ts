export const xmetaSurfaceClassNames = {
  app: "bg-background text-foreground",
  panel:
    "rounded-lg border border-xmeta-border bg-xmeta-panel text-foreground shadow-xmeta-panel",
  raised:
    "rounded-lg border border-xmeta-border bg-xmeta-raised text-foreground shadow-xmeta-raised",
  inset:
    "rounded-md border border-xmeta-border bg-xmeta-inset text-xmeta-muted",
  canvas:
    "rounded-lg border border-xmeta-border bg-xmeta-canvas text-foreground shadow-xmeta-panel",
} as const;

export const xmetaDensityClassNames = {
  compact: "gap-3 p-3",
  comfortable: "gap-4 p-4 sm:p-5",
  spacious: "gap-5 p-5 sm:p-6",
} as const;

export const xmetaLayoutClassNames = {
  page: "mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8",
  appGrid: "grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]",
  denseGrid: "grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
  toolbar: "flex flex-wrap items-center gap-2",
  readable: "max-w-3xl",
} as const;

export const xmetaMotionClassNames = {
  interactive:
    "motion-safe:transition motion-safe:duration-xmeta-fast motion-safe:ease-xmeta",
  enter:
    "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-xmeta-base motion-reduce:animate-none",
  state:
    "motion-safe:transition-colors motion-safe:duration-xmeta-fast motion-safe:ease-xmeta",
  focus:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
} as const;

export const xmetaToneClasses = {
  neutral: {
    badge: "border-xmeta-border bg-xmeta-inset text-xmeta-muted",
    dot: "bg-xmeta-muted",
    surface: "border-xmeta-border bg-xmeta-inset",
    text: "text-xmeta-muted",
  },
  info: {
    badge: "border-xmeta-info-border bg-xmeta-info-bg text-xmeta-info",
    dot: "bg-xmeta-info",
    surface: "border-xmeta-info-border bg-xmeta-info-bg",
    text: "text-xmeta-info",
  },
  progress: {
    badge:
      "border-xmeta-progress-border bg-xmeta-progress-bg text-xmeta-progress",
    dot: "bg-xmeta-progress",
    surface: "border-xmeta-progress-border bg-xmeta-progress-bg",
    text: "text-xmeta-progress",
  },
  success: {
    badge:
      "border-xmeta-success-border bg-xmeta-success-bg text-xmeta-success",
    dot: "bg-xmeta-success",
    surface: "border-xmeta-success-border bg-xmeta-success-bg",
    text: "text-xmeta-success",
  },
  warning: {
    badge:
      "border-xmeta-warning-border bg-xmeta-warning-bg text-xmeta-warning",
    dot: "bg-xmeta-warning",
    surface: "border-xmeta-warning-border bg-xmeta-warning-bg",
    text: "text-xmeta-warning",
  },
  danger: {
    badge: "border-xmeta-danger-border bg-xmeta-danger-bg text-xmeta-danger",
    dot: "bg-xmeta-danger",
    surface: "border-xmeta-danger-border bg-xmeta-danger-bg",
    text: "text-xmeta-danger",
  },
  selected: {
    badge:
      "border-xmeta-selected-border bg-xmeta-selected-bg text-xmeta-selected",
    dot: "bg-xmeta-selected",
    surface: "border-xmeta-selected-border bg-xmeta-selected-bg",
    text: "text-xmeta-selected",
  },
} as const;

export type XMetaTone = keyof typeof xmetaToneClasses;
export type XMetaReadiness =
  | "neutral"
  | "ready"
  | "attention"
  | "blocked"
  | "inProgress";

export type XMetaStateDefinition = {
  label: string;
  description: string;
  tone: XMetaTone;
  readiness: XMetaReadiness;
};

export const xmetaStateLanguage = {
  project: {
    draft: {
      label: "Project draft",
      description: "A local planning surface before production project APIs exist.",
      tone: "neutral",
      readiness: "neutral",
    },
    scoped: {
      label: "Scope ready",
      description: "The brief, route, and design target are clear enough to continue.",
      tone: "success",
      readiness: "ready",
    },
    blocked: {
      label: "Project blocked",
      description: "A missing brief, route, or permission boundary needs attention.",
      tone: "warning",
      readiness: "blocked",
    },
  },
  node: {
    idle: {
      label: "Node idle",
      description: "Inputs are present but no generation task is active.",
      tone: "neutral",
      readiness: "neutral",
    },
    selected: {
      label: "Node selected",
      description: "Inspector, handles, and local controls should visibly focus here.",
      tone: "selected",
      readiness: "attention",
    },
    waiting: {
      label: "Waiting on input",
      description: "A dependency or required field must be resolved first.",
      tone: "warning",
      readiness: "attention",
    },
    running: {
      label: "Node running",
      description: "Async generation is in progress and needs visible feedback.",
      tone: "progress",
      readiness: "inProgress",
    },
    succeeded: {
      label: "Node complete",
      description: "The latest output is available for downstream review.",
      tone: "success",
      readiness: "ready",
    },
    failed: {
      label: "Node failed",
      description: "The output is unavailable and recovery copy should be specific.",
      tone: "danger",
      readiness: "blocked",
    },
  },
  asset: {
    empty: {
      label: "Asset empty",
      description: "No reusable media exists in this local view yet.",
      tone: "neutral",
      readiness: "neutral",
    },
    generating: {
      label: "Asset generating",
      description: "A placeholder or skeleton should reserve the media slot.",
      tone: "progress",
      readiness: "inProgress",
    },
    available: {
      label: "Asset available",
      description: "The item can be inspected, selected, or reused in a planned flow.",
      tone: "success",
      readiness: "ready",
    },
    selected: {
      label: "Asset selected",
      description: "The chosen version should be distinct without relying on color alone.",
      tone: "selected",
      readiness: "attention",
    },
    missing: {
      label: "Asset missing",
      description: "The referenced media is absent or outside the current view.",
      tone: "warning",
      readiness: "blocked",
    },
  },
  generation: {
    queued: {
      label: "Queued",
      description: "The task is waiting for an execution slot.",
      tone: "info",
      readiness: "neutral",
    },
    running: {
      label: "Generating",
      description: "Progress feedback should appear within the current task surface.",
      tone: "progress",
      readiness: "inProgress",
    },
    succeeded: {
      label: "Generation complete",
      description: "The resulting asset or output can be reviewed.",
      tone: "success",
      readiness: "ready",
    },
    failed: {
      label: "Generation failed",
      description: "The error state needs recovery guidance and should preserve inputs.",
      tone: "danger",
      readiness: "blocked",
    },
    retryable: {
      label: "Retry available",
      description: "A new attempt can be represented without hiding the previous result.",
      tone: "warning",
      readiness: "attention",
    },
    blocked: {
      label: "Generation blocked",
      description: "Required inputs or backend capability are unavailable.",
      tone: "warning",
      readiness: "blocked",
    },
  },
  history: {
    checkpoint: {
      label: "Checkpoint",
      description: "A restorable moment in the creative timeline.",
      tone: "info",
      readiness: "neutral",
    },
    current: {
      label: "Current version",
      description: "The active version should be clear in any timeline surface.",
      tone: "selected",
      readiness: "attention",
    },
    restored: {
      label: "Restored",
      description: "A previous version has been brought back into view.",
      tone: "success",
      readiness: "ready",
    },
    unavailable: {
      label: "History unavailable",
      description: "Version records are not available in the current implementation.",
      tone: "neutral",
      readiness: "blocked",
    },
  },
  export: {
    notReady: {
      label: "Export not ready",
      description: "Required clips, audio, or review gates are still missing.",
      tone: "warning",
      readiness: "attention",
    },
    ready: {
      label: "Export ready",
      description: "The visible checklist is complete enough for a planned render action.",
      tone: "success",
      readiness: "ready",
    },
    rendering: {
      label: "Export rendering",
      description: "Final assembly is represented as a long-running task.",
      tone: "progress",
      readiness: "inProgress",
    },
    blocked: {
      label: "Export blocked",
      description: "A missing dependency or unavailable renderer prevents export.",
      tone: "danger",
      readiness: "blocked",
    },
  },
} as const satisfies Record<string, Record<string, XMetaStateDefinition>>;

export type XMetaStateDomain = keyof typeof xmetaStateLanguage;
export type XMetaStateName<Domain extends XMetaStateDomain> =
  keyof (typeof xmetaStateLanguage)[Domain];

export const xmetaStateDomains = Object.keys(
  xmetaStateLanguage,
) as XMetaStateDomain[];

export function getXMetaState<Domain extends XMetaStateDomain>(
  domain: Domain,
  state: XMetaStateName<Domain>,
): XMetaStateDefinition {
  return xmetaStateLanguage[domain][state] as XMetaStateDefinition;
}

export function listXMetaStates<Domain extends XMetaStateDomain>(
  domain: Domain,
) {
  return Object.entries(xmetaStateLanguage[domain]).map(([name, value]) => {
    const state = value as XMetaStateDefinition;

    return {
      name,
      ...state,
    };
  });
}

export const xmetaDesignSystem = {
  typography: {
    family: {
      sans: "Inter, ui-sans-serif, system-ui, sans-serif",
      mono: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace",
    },
    scale: {
      display: "text-3xl font-semibold leading-tight tracking-normal sm:text-4xl",
      title: "text-xl font-semibold leading-7 tracking-normal",
      section: "text-base font-semibold leading-6 tracking-normal",
      body: "text-sm leading-6 tracking-normal",
      detail: "text-xs font-medium leading-5 tracking-normal",
    },
    rule:
      "Use regular, medium, and semibold weights. Keep letter spacing normal and reserve large type for page-level structure.",
  },
  color: {
    surfaces: xmetaSurfaceClassNames,
    tones: xmetaToneClasses,
    rule:
      "Use neutral production surfaces with cyan action, amber warning, rose danger, emerald success, and fuchsia selected accents.",
  },
  spacing: {
    density: xmetaDensityClassNames,
    layout: xmetaLayoutClassNames,
    rule:
      "Use 8px-based rhythm, compact controls for tool surfaces, and larger gaps only between major groups.",
  },
  motion: {
    classNames: xmetaMotionClassNames,
    durations: {
      fast: "140ms",
      base: "220ms",
      slow: "360ms",
    },
    rule:
      "Motion should clarify hover, selection, progress, and recovery while respecting reduced-motion preferences.",
  },
  responsive: {
    breakpoints: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    rules: [
      "Toolbars wrap before controls shrink below touch-safe targets.",
      "Inspector and asset panels stack under the canvas on narrow screens.",
      "Dense tables become readable card or row summaries on mobile.",
      "Fixed-format canvas controls keep stable dimensions across states.",
    ],
  },
  accessibility: {
    minTarget: "min-h-11 min-w-11",
    focus: xmetaMotionClassNames.focus,
    rules: [
      "Do not communicate state with color alone.",
      "Disabled or unavailable actions must remain readable and explain the blocker nearby.",
      "Every loading or async state needs text feedback plus visible progress language.",
    ],
  },
  stateLanguage: xmetaStateLanguage,
} as const;
