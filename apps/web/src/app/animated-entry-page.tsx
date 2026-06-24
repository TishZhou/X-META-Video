"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, MonitorPlay, Sparkles } from "lucide-react";

import { mainPageContent } from "./main-page-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const reveal = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.11,
      delayChildren: 0.08,
    },
  },
};

const nodeMotion = {
  hidden: { opacity: 0, scale: 0.92, y: 14 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

export function AnimatedEntryPage() {
  return (
    <main
      className="min-h-screen overflow-hidden bg-background text-foreground"
      data-animation-runtime="framer-motion"
      data-source-pattern={mainPageContent.sourcePattern}
      data-uitripled-source="hero-block"
    >
      <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden border-b bg-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.55)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.55)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <motion.div
          aria-hidden="true"
          animate={{ opacity: [0.28, 0.55, 0.28], scale: [1, 1.08, 1] }}
          className="absolute left-[-18rem] top-[-16rem] size-[38rem] rounded-full bg-primary/10 blur-3xl"
          transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.div
          aria-hidden="true"
          animate={{ opacity: [0.2, 0.42, 0.2], x: [0, -24, 0] }}
          className="absolute bottom-[-20rem] right-[-18rem] size-[40rem] rounded-full bg-muted blur-3xl"
          transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
        />

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
          <motion.header
            animate="visible"
            className="flex items-center justify-between gap-4"
            initial="hidden"
            variants={container}
          >
            <motion.a
              className="flex items-center gap-3"
              href="/"
              aria-label="X-META Video home"
              variants={reveal}
            >
              <motion.span
                animate={{ rotate: [0, -4, 4, 0] }}
                className="flex size-9 items-center justify-center rounded-md border bg-background shadow-sm"
                transition={{ delay: 1.2, duration: 2.6, repeat: Infinity }}
              >
                <MonitorPlay aria-hidden="true" className="size-4" />
              </motion.span>
              <span className="text-sm font-semibold tracking-normal">
                {mainPageContent.productName}
              </span>
            </motion.a>
            <motion.div variants={reveal}>
              <Badge variant="secondary">{mainPageContent.eyebrow}</Badge>
            </motion.div>
          </motion.header>

          <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.85fr)] lg:py-16">
            <motion.div
              animate="visible"
              className="flex max-w-3xl flex-col gap-8"
              initial="hidden"
              variants={container}
            >
              <motion.div className="flex flex-col gap-5" variants={reveal}>
                <Badge className="w-fit" variant="outline">
                  <Sparkles aria-hidden="true" data-icon="inline-start" />
                  Creative workflow platform
                </Badge>
                <div className="flex flex-col gap-5">
                  <motion.h1
                    className="max-w-3xl text-5xl font-semibold leading-tight tracking-normal sm:text-6xl lg:text-7xl"
                    variants={reveal}
                  >
                    {mainPageContent.heroTitle}
                  </motion.h1>
                  <motion.p
                    className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl"
                    variants={reveal}
                  >
                    {mainPageContent.heroDescription}
                  </motion.p>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col gap-3 sm:flex-row"
                variants={reveal}
              >
                <Button asChild size="lg">
                  <motion.a
                    href="#production-modes"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {mainPageContent.primaryAction}
                    <ArrowRight data-icon="inline-end" aria-hidden="true" />
                  </motion.a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <motion.a
                    href="#canvas-preview"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {mainPageContent.secondaryAction}
                  </motion.a>
                </Button>
              </motion.div>

              <motion.div
                className="grid gap-3 sm:grid-cols-3"
                id="production-modes"
                variants={container}
              >
                {mainPageContent.productionModes.map((mode) => {
                  const Icon = mode.icon;

                  return (
                    <motion.div
                      key={mode.title}
                      variants={nodeMotion}
                      whileHover={{ y: -6, scale: 1.02 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Card className="h-full bg-background/85 backdrop-blur">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <span className="flex size-8 items-center justify-center rounded-md border bg-muted">
                              <Icon aria-hidden="true" className="size-4" />
                            </span>
                            <CardTitle className="text-base">
                              {mode.title}
                            </CardTitle>
                          </div>
                          <CardDescription>{mode.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>

            <motion.div
              animate="visible"
              id="canvas-preview"
              initial="hidden"
              variants={container}
            >
              <motion.div variants={reveal}>
                <Card className="overflow-hidden bg-background/85 shadow-lg backdrop-blur">
                  <CardHeader>
                    <CardTitle>{mainPageContent.previewTitle}</CardTitle>
                    <CardDescription>
                      {mainPageContent.previewDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-5">
                    <motion.div
                      className="rounded-lg border bg-background p-4"
                      variants={container}
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        {mainPageContent.canvasNodes.map((node) => (
                          <motion.div
                            key={node.title}
                            className="rounded-md border bg-card p-4 shadow-sm"
                            variants={nodeMotion}
                            whileHover={{ y: -4 }}
                          >
                            <div className="text-sm font-medium">
                              {node.title}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {node.label}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                    <motion.div
                      className="flex flex-wrap gap-2"
                      variants={reveal}
                    >
                      {mainPageContent.capabilityBadges.map((capability) => (
                        <Badge key={capability} variant="secondary">
                          {capability}
                        </Badge>
                      ))}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <motion.a
          aria-label="Jump to canvas direction"
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 rounded-full border bg-background/85 p-2 text-muted-foreground shadow-sm backdrop-blur sm:block"
          href="#canvas-preview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{
            opacity: { delay: 1, duration: 0.6 },
            y: { delay: 1.4, duration: 1.6, repeat: Infinity },
          }}
        >
          <ArrowDown aria-hidden="true" className="size-5" />
        </motion.a>
      </section>
    </main>
  );
}
