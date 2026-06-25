"use client";

import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";
import { ChevronDown, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const spring = { type: "spring", stiffness: 360, damping: 30 } as const;

export const tripleContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.11,
      delayChildren: 0.08,
    },
  },
};

export const tripleRevealVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

export const tripleItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 14 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

type TripleMotionRootProps = React.ComponentPropsWithoutRef<"main"> & {
  sourcePattern: string;
};

export function TripleMotionRoot({
  children,
  className,
  sourcePattern,
  ...props
}: TripleMotionRootProps) {
  return (
    <main
      className={cn(
        "min-h-screen overflow-hidden bg-background text-foreground",
        className,
      )}
      data-animation-runtime="framer-motion"
      data-source-pattern={sourcePattern}
      data-uitripled-motion-system="triple-motion"
      data-uitripled-source="hero-block"
      {...props}
    >
      {children}
    </main>
  );
}

type TripleMotionBackgroundProps = React.ComponentPropsWithoutRef<"section">;

export function TripleMotionBackground({
  children,
  className,
  ...props
}: TripleMotionBackgroundProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      className={cn(
        "relative flex min-h-dvh w-full items-center justify-center overflow-hidden border-b bg-background",
        className,
      )}
      data-uitripled-component="animated-background"
      {...props}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.55)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.55)_1px,transparent_1px)] bg-[size:28px_28px]"
      />
      <motion.div
        aria-hidden="true"
        animate={
          shouldReduceMotion
            ? { opacity: 0.38 }
            : { opacity: [0.28, 0.55, 0.28], scale: [1, 1.08, 1] }
        }
        className="absolute left-[-18rem] top-[-16rem] size-[38rem] rounded-full bg-primary/10 blur-3xl"
        transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        aria-hidden="true"
        animate={
          shouldReduceMotion
            ? { opacity: 0.26 }
            : { opacity: [0.2, 0.42, 0.2], x: [0, -24, 0] }
        }
        className="absolute bottom-[-20rem] right-[-18rem] size-[40rem] rounded-full bg-muted blur-3xl"
        transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
      />
      {children}
    </section>
  );
}

type TripleStaggerProps = HTMLMotionProps<"div">;

export function TripleStagger({
  children,
  className,
  variants,
  ...props
}: TripleStaggerProps) {
  return (
    <motion.div
      animate="visible"
      className={className}
      initial="hidden"
      variants={variants ?? tripleContainerVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type TripleRevealProps = HTMLMotionProps<"div">;

export function TripleReveal({
  children,
  className,
  variants,
  ...props
}: TripleRevealProps) {
  return (
    <motion.div
      className={className}
      variants={variants ?? tripleRevealVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type TripleMotionLinkProps = HTMLMotionProps<"a">;

export function TripleMotionLink({
  children,
  className,
  variants,
  ...props
}: TripleMotionLinkProps) {
  return (
    <motion.a
      className={className}
      data-uitripled-component="motion-link"
      variants={variants ?? tripleRevealVariants}
      {...props}
    >
      {children}
    </motion.a>
  );
}

type TripleMotionButtonProps = Omit<
  HTMLMotionProps<"button">,
  "children" | "className" | "type"
> &
  VariantProps<typeof buttonVariants> & {
    children: React.ReactNode;
    className?: string;
    href?: string;
    type?: "button" | "submit" | "reset";
  };

export function TripleMotionButton({
  children,
  className,
  href,
  size,
  type = "button",
  variant,
  ...props
}: TripleMotionButtonProps) {
  const shouldReduceMotion = useReducedMotion();
  const classes = cn(
    buttonVariants({ size, variant }),
    "cursor-pointer touch-manipulation will-change-transform",
    className,
  );
  const hover = shouldReduceMotion ? undefined : { y: -2 };
  const tap = shouldReduceMotion ? undefined : { scale: 0.98 };

  if (href) {
    const anchorProps = props as HTMLMotionProps<"a">;

    return (
      <motion.a
        className={classes}
        data-uitripled-component="motion-button"
        href={href}
        whileHover={hover}
        whileTap={tap}
        {...anchorProps}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      className={classes}
      data-uitripled-component="motion-button"
      type={type}
      whileHover={hover}
      whileTap={tap}
      {...props}
    >
      {children}
    </motion.button>
  );
}

type TripleMotionCardProps = Omit<
  HTMLMotionProps<"div">,
  "children" | "className"
> & {
  cardClassName?: string;
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
};

export function TripleMotionCard({
  cardClassName,
  children,
  className,
  interactive = true,
  variants,
  ...props
}: TripleMotionCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      data-uitripled-component="motion-card"
      variants={variants ?? tripleItemVariants}
      whileHover={
        interactive && !shouldReduceMotion ? { y: -5, scale: 1.02 } : undefined
      }
      whileTap={
        interactive && !shouldReduceMotion ? { scale: 0.99 } : undefined
      }
      {...props}
    >
      <Card
        className={cn(
          "group relative h-full overflow-hidden bg-background/85 backdrop-blur transition-colors hover:border-primary/40",
          cardClassName,
        )}
      >
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        <div className="relative z-10">{children}</div>
      </Card>
    </motion.div>
  );
}

type TripleMotionPanelProps = Omit<
  HTMLMotionProps<"div">,
  "children" | "className"
> & {
  cardClassName?: string;
  children: React.ReactNode;
  className?: string;
};

export function TripleMotionPanel({
  cardClassName,
  children,
  className,
  variants,
  ...props
}: TripleMotionPanelProps) {
  return (
    <motion.div
      className={className}
      data-uitripled-component="motion-panel"
      variants={variants ?? tripleRevealVariants}
      {...props}
    >
      <Card
        className={cn(
          "overflow-hidden bg-background/85 shadow-lg backdrop-blur",
          cardClassName,
        )}
      >
        {children}
      </Card>
    </motion.div>
  );
}

type TripleExpandableInfoCardProps = {
  className?: string;
  defaultOpen?: boolean;
  description: string;
  icon: LucideIcon;
  infoDescription: string;
  infoItems: string[];
  infoTitle: string;
  title: string;
};

export function TripleExpandableInfoCard({
  className,
  defaultOpen = false,
  description,
  icon: Icon,
  infoDescription,
  infoItems,
  infoTitle,
  title,
}: TripleExpandableInfoCardProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const contentId = React.useId();
  const shouldReduceMotion = useReducedMotion();

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <motion.article
        className={className}
        data-state={open ? "open" : "closed"}
        data-uitripled-component="expandable-info-card"
        tabIndex={-1}
        variants={tripleItemVariants}
        whileHover={shouldReduceMotion ? undefined : { y: -6, scale: 1.02 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
      >
        <Card
          className="group relative h-full overflow-hidden bg-background/85 backdrop-blur transition-colors hover:border-primary/40 data-[state=open]:border-primary/50"
          data-state={open ? "open" : "closed"}
        >
          <motion.div
            aria-hidden="true"
            animate={{ opacity: open ? 1 : 0 }}
            className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-muted/50"
            transition={{ duration: 0.25 }}
          />
          <CardHeader className="relative z-10 p-0">
            <CollapsibleTrigger asChild>
              <button
                aria-controls={contentId}
                aria-expanded={open}
                className="flex w-full cursor-pointer touch-manipulation items-start gap-3 p-6 text-left outline-none focus-visible:ring-1 focus-visible:ring-ring"
                type="button"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                  <span className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base">{title}</CardTitle>
                    <motion.span
                      animate={{ rotate: open ? 180 : 0 }}
                      className="flex size-6 shrink-0 items-center justify-center rounded-full border bg-background/80 text-muted-foreground"
                      transition={spring}
                    >
                      <ChevronDown aria-hidden="true" className="size-3.5" />
                    </motion.span>
                  </span>
                  <CardDescription>{description}</CardDescription>
                </span>
              </button>
            </CollapsibleTrigger>
          </CardHeader>
          <AnimatePresence initial={false}>
            {open ? (
              <CollapsibleContent forceMount asChild>
                <motion.div
                  animate={{ height: "auto", opacity: 1 }}
                  className="relative z-10 overflow-hidden"
                  exit={{ height: 0, opacity: 0 }}
                  id={contentId}
                  initial={{ height: 0, opacity: 0 }}
                  transition={spring}
                >
                  <CardContent className="flex flex-col gap-3 border-t bg-background/55 px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-medium">{infoTitle}</div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {infoDescription}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {infoItems.map((item) => (
                        <Badge key={item} variant="secondary">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </motion.div>
              </CollapsibleContent>
            ) : null}
          </AnimatePresence>
        </Card>
      </motion.article>
    </Collapsible>
  );
}
