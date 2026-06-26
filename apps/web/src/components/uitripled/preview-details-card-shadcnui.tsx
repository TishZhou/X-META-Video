"use client";

import { motion, useReducedMotion, type Transition } from "framer-motion";
import { ArrowUpRight, Film, PanelsTopLeft, Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NativeStartNow } from "@/components/uitripled/native-start-now-shadcnui";
import { cn } from "@/lib/utils";

interface PreviewDetailsCardProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  summary?: string;
  ctaLabel?: string;
  href?: string;
  icon?: "sparkles" | "panels" | "film";
  className?: string;
}

const iconMap = {
  sparkles: Sparkles,
  panels: PanelsTopLeft,
  film: Film,
};

export function PreviewDetailsCard({
  eyebrow = "Workspace",
  title = "Preview Details Card",
  description = "Hover or focus to surface key workspace traits before diving into the full view.",
  summary = "Creation entry",
  ctaLabel = "Open preview",
  href = "#",
  icon = "sparkles",
  className,
}: PreviewDetailsCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const Icon = iconMap[icon];
  const hoverMotion = shouldReduceMotion ? undefined : { scale: 1.01, y: -2 };
  const hoverTransition: Transition = shouldReduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 420, damping: 34, mass: 0.7 };
  const handleStart = () => {
    if (!href.startsWith("#")) return;

    const target = document.querySelector(href);
    if (!target) return;

    target.scrollIntoView({
      behavior: shouldReduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <motion.section
      className={cn("group h-full", className)}
      whileHover={hoverMotion}
      transition={hoverTransition}
    >
      <Card
        className="flex h-full min-h-[18rem] flex-col overflow-hidden rounded-lg border-border/80 bg-card/95 shadow-sm transition-colors hover:border-primary/40 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
        tabIndex={0}
      >
        <CardHeader className="gap-5 p-6">
          <div className="flex items-center justify-between gap-4 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon aria-hidden="true" />
              </span>
              {eyebrow}
            </span>
            <ArrowUpRight
              className="text-muted-foreground transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-focus-within:-translate-y-1 group-focus-within:translate-x-1"
              aria-hidden="true"
            />
          </div>

          <div className="flex flex-col gap-3">
            <CardTitle className="text-2xl leading-tight text-foreground">
              {title}
            </CardTitle>
            <CardDescription className="text-sm leading-6">
              {summary}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col justify-end p-6 pt-0">
          <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-300 group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100">
            <p className="min-h-0 overflow-hidden text-sm leading-7 text-muted-foreground">
              {description}
            </p>
          </div>
        </CardContent>

        <CardFooter className="grid grid-rows-[0fr] p-6 pt-0 opacity-0 transition-all duration-300 group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100">
          <div className="min-h-0 overflow-hidden">
            <NativeStartNow
              label={ctaLabel}
              loadingLabel="Opening..."
              successLabel="Ready"
              onStart={handleStart}
              size="md"
              variant="outline"
              className="w-full"
              icon={<ArrowUpRight aria-hidden="true" />}
            />
          </div>
        </CardFooter>
      </Card>
    </motion.section>
  );
}
