import type { ComponentPropsWithoutRef, ReactNode } from "react";

import {
  getXMetaState,
  listXMetaStates,
  xmetaDensityClassNames,
  xmetaDesignSystem,
  xmetaMotionClassNames,
  xmetaSurfaceClassNames,
  xmetaToneClasses,
  type XMetaStateDomain,
  type XMetaStateName,
} from "@/lib/design-system";
import { cn } from "@/lib/utils";

type SurfaceElement = "article" | "aside" | "div" | "section";

type XMetaSurfaceProps = ComponentPropsWithoutRef<"section"> & {
  as?: SurfaceElement;
  children: ReactNode;
  density?: keyof typeof xmetaDensityClassNames;
  surface?: keyof typeof xmetaSurfaceClassNames;
};

export function XMetaSurface({
  as = "section",
  children,
  className,
  density = "comfortable",
  surface = "panel",
  ...props
}: XMetaSurfaceProps) {
  const Component = as;

  return (
    <Component
      className={cn(
        "flex flex-col",
        xmetaSurfaceClassNames[surface],
        xmetaDensityClassNames[density],
        xmetaMotionClassNames.enter,
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

type XMetaStateBadgeProps<Domain extends XMetaStateDomain> = {
  className?: string;
  domain: Domain;
  showDomain?: boolean;
  state: XMetaStateName<Domain>;
};

export function XMetaStateBadge<Domain extends XMetaStateDomain>({
  className,
  domain,
  showDomain = false,
  state,
}: XMetaStateBadgeProps<Domain>) {
  const definition = getXMetaState(domain, state);
  const tone = xmetaToneClasses[definition.tone];

  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-medium leading-none",
        xmetaMotionClassNames.state,
        tone.badge,
        className,
      )}
      data-xmeta-readiness={definition.readiness}
      data-xmeta-state-domain={domain}
      data-xmeta-state-name={String(state)}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", tone.dot)}
      />
      {showDomain ? `${domain}: ${definition.label}` : definition.label}
    </span>
  );
}

type XMetaTokenListProps = {
  items: readonly string[];
  title: string;
};

export function XMetaTokenList({ items, title }: XMetaTokenListProps) {
  return (
    <div className="flex flex-col gap-2" data-xmeta-token-list={title}>
      <h2 className={xmetaDesignSystem.typography.scale.section}>{title}</h2>
      <ul className="grid gap-2 text-sm leading-6 text-xmeta-muted">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            <span aria-hidden="true" className="mt-2 size-1 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type XMetaStatePanelProps = {
  domain: XMetaStateDomain;
  limit?: number;
};

export function XMetaStatePanel({ domain, limit }: XMetaStatePanelProps) {
  const states = listXMetaStates(domain).slice(0, limit);

  return (
    <div
      className="flex flex-col gap-2 rounded-md border border-xmeta-border bg-xmeta-inset p-3"
      data-xmeta-state-panel={domain}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold capitalize leading-5">{domain}</h3>
        <span className="text-xs font-medium text-xmeta-muted">
          {states.length} states
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {states.map((state) => {
          const tone = xmetaToneClasses[state.tone];

          return (
            <span
              className={cn(
                "inline-flex min-h-7 items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-medium leading-none",
                tone.badge,
              )}
              data-xmeta-readiness={state.readiness}
              data-xmeta-state-domain={domain}
              data-xmeta-state-name={state.name}
              key={state.name}
            >
              <span
                aria-hidden="true"
                className={cn("size-1.5 rounded-full", tone.dot)}
              />
              {state.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
