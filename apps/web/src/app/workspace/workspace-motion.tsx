"use client";

import type { ReactNode } from "react";
import * as React from "react";
import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

import {
  motionPatternSelections,
  type MotionPatternSelection,
} from "./workspace-data";

export const motionSpring = {
  damping: 32,
  stiffness: 340,
  type: "spring",
} as const;

export const shellVariants: Variants = {
  hidden: { opacity: 0.88, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0.9, y: 12 },
  visible: { opacity: 1, y: 0 },
};

type MotionSurfaceProps = HTMLMotionProps<"div"> & {
  interactive?: boolean;
};

type MotionShellHeaderProps = HTMLMotionProps<"header">;

type MotionRouteFrameProps = {
  activeHref: string;
  children: ReactNode;
};

type MotionNavItemProps = {
  active: boolean;
  children: ReactNode;
};

type MotionProjectArticleProps = HTMLMotionProps<"article"> & {
  selected?: boolean;
};

type MotionPatternDisclosureProps = {
  patterns?: MotionPatternSelection[];
};

type UnavailableDisclosureProps = {
  detail: string;
  label: string;
};

export function MotionShellHeader({
  children,
  className,
  ...props
}: MotionShellHeaderProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.header
      animate="visible"
      className={className}
      initial={shouldReduceMotion ? false : "hidden"}
      variants={shellVariants}
      {...props}
    >
      {children}
    </motion.header>
  );
}

export function MotionRouteFrame({
  activeHref,
  children,
}: MotionRouteFrameProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate="visible"
      className="flex flex-col gap-5"
      data-route-transition={activeHref}
      initial={shouldReduceMotion ? false : "hidden"}
      key={activeHref}
      transition={shouldReduceMotion ? { duration: 0.01 } : { duration: 0.34 }}
      variants={shellVariants}
    >
      {children}
    </motion.div>
  );
}

export function MotionNavItem({ active, children }: MotionNavItemProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      layout
      transition={shouldReduceMotion ? { duration: 0.01 } : { duration: 0.34 }}
      whileHover={shouldReduceMotion ? undefined : { y: -1 }}
    >
      {children}
      {active ? (
        <motion.span
          aria-hidden="true"
          className="absolute inset-x-3 -bottom-1 h-px rounded-full bg-primary"
          layoutId="workspace-active-route"
        />
      ) : null}
    </motion.div>
  );
}

export function MotionSurface({
  children,
  className,
  interactive = true,
  variants,
  ...props
}: MotionSurfaceProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      data-motion-surface="framer-motion-card"
      transition={motionSpring}
      variants={variants ?? itemVariants}
      whileHover={
        interactive && !shouldReduceMotion ? { y: -4, scale: 1.01 } : undefined
      }
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionProjectArticle({
  children,
  selected,
  ...props
}: MotionProjectArticleProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      data-reduced-motion-card="transform-disabled"
      data-selected-project={selected ? "true" : "false"}
      transition={motionSpring}
      variants={itemVariants}
      whileHover={shouldReduceMotion ? undefined : { y: -6, scale: 1.01 }}
      {...props}
    >
      {children}
    </motion.article>
  );
}

export function MotionPatternDisclosure({
  patterns = motionPatternSelections,
}: MotionPatternDisclosureProps) {
  const [open, setOpen] = React.useState(false);
  const contentId = React.useId();

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <section
        aria-labelledby="motion-pattern-map-title"
        className="rounded-lg border bg-background/85"
        data-motion-pattern-map="selected-ui-tripled-shadcn-patterns"
      >
        <CollapsibleTrigger asChild>
          <button
            aria-controls={contentId}
            aria-expanded={open}
            className="flex w-full touch-manipulation items-start justify-between gap-4 p-4 text-left outline-none focus-visible:ring-1 focus-visible:ring-ring"
            type="button"
          >
            <span className="flex min-w-0 flex-col gap-1">
              <span
                className="text-sm font-medium"
                id="motion-pattern-map-title"
              >
                UI TripleD pattern map
              </span>
              <span className="text-sm leading-6 text-muted-foreground">
                Selected local shadcn source for this task slice: shell,
                dashboard, and project cards.
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <Badge variant="outline">Radix shadcn local source</Badge>
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                className="flex size-7 items-center justify-center rounded-md border bg-muted"
                transition={motionSpring}
              >
                <ChevronDown aria-hidden="true" className="size-4" />
              </motion.span>
            </span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent forceMount asChild>
          <motion.div
            animate={open ? "visible" : "hidden"}
            className="overflow-hidden border-t"
            hidden={!open}
            id={contentId}
            variants={{
              hidden: { height: 0, opacity: 0 },
              visible: { height: "auto", opacity: 1 },
            }}
          >
            <div className="grid gap-3 p-4 md:grid-cols-2">
              {patterns.map((pattern) => (
                <div
                  className="rounded-md border bg-muted/30 p-3"
                  data-motion-pattern-selection={pattern.blockName}
                  key={pattern.blockName}
                >
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{pattern.status}</Badge>
                    <Badge variant="outline">{pattern.selectedVariant}</Badge>
                  </div>
                  <div className="mt-3 text-sm font-medium">
                    {pattern.blockName}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {pattern.productSurface}
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Local source: {pattern.localSource}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}

export function UnavailableDisclosure({
  detail,
  label,
}: UnavailableDisclosureProps) {
  const [open, setOpen] = React.useState(false);
  const contentId = React.useId();

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          aria-controls={contentId}
          aria-expanded={open}
          className="w-full justify-between"
          size="sm"
          type="button"
          variant="ghost"
        >
          {label}
          <ChevronDown aria-hidden="true" data-icon="inline-end" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent forceMount asChild>
        <motion.div
          animate={open ? "visible" : "hidden"}
          className="overflow-hidden rounded-md border bg-muted/35 px-3 text-sm leading-6 text-muted-foreground"
          hidden={!open}
          id={contentId}
          variants={{
            hidden: { height: 0, opacity: 0, paddingBottom: 0, paddingTop: 0 },
            visible: {
              height: "auto",
              opacity: 1,
              paddingBottom: 8,
              paddingTop: 8,
            },
          }}
        >
          {detail}
        </motion.div>
      </CollapsibleContent>
    </Collapsible>
  );
}
