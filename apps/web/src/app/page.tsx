import {
  XMetaStateBadge,
  XMetaStatePanel,
  XMetaSurface,
  XMetaTokenList,
} from "@/components/xmeta/design-primitives";
import {
  xmetaDesignSystem,
  xmetaLayoutClassNames,
  xmetaSurfaceClassNames,
} from "@/lib/design-system";
import { cn } from "@/lib/utils";

const resetSteps = [
  "Foundational component selection",
  "Interface design system",
  "Wireframing and screen inventory",
  "Page-by-page detailed implementation",
];

export default function HomePage() {
  return (
    <main
      className={cn("dark min-h-screen", "xmeta-app-frame", xmetaSurfaceClassNames.app)}
      data-web-design-system="code-defined"
      data-web-reset="true"
    >
      <section
        aria-labelledby="workspace-foundation-title"
        className={xmetaLayoutClassNames.page}
      >
        <div className="flex flex-col gap-4">
          <div className={xmetaLayoutClassNames.toolbar}>
            <XMetaStateBadge domain="project" showDomain state="draft" />
            <XMetaStateBadge domain="generation" showDomain state="blocked" />
            <XMetaStateBadge domain="export" showDomain state="notReady" />
            <a
              className={cn(
                "xmeta-control-size inline-flex items-center justify-center rounded-md border border-xmeta-border bg-xmeta-inset px-3 text-sm font-medium text-foreground",
                "hover:bg-xmeta-raised",
                xmetaDesignSystem.motion.classNames.focus,
                xmetaDesignSystem.motion.classNames.interactive,
              )}
              href="#state-language"
            >
              Review states
            </a>
          </div>

          <div className="flex max-w-3xl flex-col gap-3">
            <p className={xmetaDesignSystem.typography.scale.detail}>
              X-META Video
            </p>
            <h1
              className={xmetaDesignSystem.typography.scale.display}
              id="workspace-foundation-title"
            >
              Production workspace foundation
            </h1>
            <p className="text-base leading-7 text-xmeta-muted">
              Code-defined interface rules now cover the canvas workflow,
              generated asset surfaces, task feedback, history states, and
              export readiness without restoring the removed prototypes.
            </p>
          </div>
        </div>

        <div className={xmetaLayoutClassNames.appGrid}>
          <XMetaSurface
            aria-label="New Feature 1 design sequence"
            data-web-design-sequence="feature-1"
            surface="raised"
          >
            <div className="flex flex-col gap-2">
              <h2 className={xmetaDesignSystem.typography.scale.title}>
                Feature 1 sequence
              </h2>
              <p className="text-sm leading-6 text-xmeta-muted">
                The working baseline stays product-specific while page tasks
                can reuse one shared density, surface, and state model.
              </p>
            </div>
            <div className={xmetaLayoutClassNames.denseGrid}>
              {resetSteps.map((step, index) => (
                <article
                  className="flex min-h-28 flex-col justify-between rounded-md border border-xmeta-border bg-xmeta-inset p-3"
                  data-web-design-step={step}
                  key={step}
                >
                  <div className="text-xs font-medium text-xmeta-muted">
                    Step {index + 1}
                  </div>
                  <div className="text-sm font-semibold leading-5">{step}</div>
                </article>
              ))}
            </div>
          </XMetaSurface>

          <XMetaSurface
            as="aside"
            data-xmeta-foundation="states"
            id="state-language"
          >
            <div className="flex flex-col gap-2">
              <h2 className={xmetaDesignSystem.typography.scale.title}>
                Production states
              </h2>
              <p className="text-sm leading-6 text-xmeta-muted">
                Missing backend, persistence, and render execution remain
                visibly unavailable in the shared state model.
              </p>
            </div>
            <div className="grid gap-3">
              <XMetaStatePanel domain="node" limit={4} />
              <XMetaStatePanel domain="generation" limit={4} />
              <XMetaStatePanel domain="export" />
            </div>
          </XMetaSurface>
        </div>

        <XMetaSurface data-xmeta-foundation="rules" surface="canvas">
          <div className={xmetaLayoutClassNames.denseGrid}>
            <XMetaTokenList
              items={xmetaDesignSystem.responsive.rules}
              title="Responsive shell"
            />
            <XMetaTokenList
              items={xmetaDesignSystem.accessibility.rules}
              title="Accessible feedback"
            />
            <div className="flex flex-col gap-3">
              <h2 className={xmetaDesignSystem.typography.scale.section}>
                State domains
              </h2>
              <div className="flex flex-wrap gap-2">
                <XMetaStateBadge domain="project" showDomain state="scoped" />
                <XMetaStateBadge domain="node" showDomain state="selected" />
                <XMetaStateBadge domain="asset" showDomain state="available" />
                <XMetaStateBadge
                  domain="generation"
                  showDomain
                  state="running"
                />
                <XMetaStateBadge domain="history" showDomain state="current" />
                <XMetaStateBadge domain="export" showDomain state="ready" />
              </div>
            </div>
          </div>
        </XMetaSurface>
      </section>
    </main>
  );
}
