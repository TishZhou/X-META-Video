"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, MonitorPlay, Sparkles } from "lucide-react";

import { mainPageContent } from "./main-page-content";
import { Badge } from "@/components/ui/badge";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TripleExpandableInfoCard,
  TripleMotionBackground,
  TripleMotionButton,
  TripleMotionCard,
  TripleMotionLink,
  TripleMotionPanel,
  TripleMotionRoot,
  TripleReveal,
  TripleStagger,
  tripleContainerVariants,
  tripleRevealVariants,
} from "@/components/ui/triple-motion";

export function AnimatedEntryPage() {
  return (
    <TripleMotionRoot sourcePattern={mainPageContent.sourcePattern}>
      <TripleMotionBackground>
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
          <TripleStagger
            className="flex items-center justify-between gap-4"
            role="banner"
            variants={tripleContainerVariants}
          >
            <TripleMotionLink
              aria-label="X-META Video home"
              className="flex items-center gap-3"
              href="/"
              variants={tripleRevealVariants}
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
            </TripleMotionLink>
            <TripleReveal variants={tripleRevealVariants}>
              <Badge variant="secondary">{mainPageContent.eyebrow}</Badge>
            </TripleReveal>
          </TripleStagger>

          <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.85fr)] lg:py-16">
            <TripleStagger
              className="flex max-w-3xl flex-col gap-8"
              variants={tripleContainerVariants}
            >
              <TripleReveal
                className="flex flex-col gap-5"
                variants={tripleRevealVariants}
              >
                <Badge className="w-fit" variant="outline">
                  <Sparkles aria-hidden="true" data-icon="inline-start" />
                  Creative workflow platform
                </Badge>
                <div className="flex flex-col gap-5">
                  <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-normal sm:text-6xl lg:text-7xl">
                    {mainPageContent.heroTitle}
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                    {mainPageContent.heroDescription}
                  </p>
                </div>
              </TripleReveal>

              <TripleReveal
                className="flex flex-col gap-3 sm:flex-row"
                variants={tripleRevealVariants}
              >
                <TripleMotionButton href="#production-modes" size="lg">
                  {mainPageContent.primaryAction}
                  <ArrowRight data-icon="inline-end" aria-hidden="true" />
                </TripleMotionButton>
                <TripleMotionButton
                  href="#canvas-preview"
                  size="lg"
                  variant="outline"
                >
                  {mainPageContent.secondaryAction}
                </TripleMotionButton>
              </TripleReveal>

              <TripleStagger
                className="grid gap-3 sm:grid-cols-3"
                id="production-modes"
                variants={tripleContainerVariants}
              >
                {mainPageContent.productionModes.map((mode) => (
                  <TripleExpandableInfoCard
                    key={mode.title}
                    description={mode.description}
                    icon={mode.icon}
                    infoDescription={mode.infoDescription}
                    infoItems={mode.infoItems}
                    infoTitle={mode.infoTitle}
                    title={mode.title}
                  />
                ))}
              </TripleStagger>
            </TripleStagger>

            <TripleStagger
              id="canvas-preview"
              variants={tripleContainerVariants}
            >
              <TripleMotionPanel>
                <CardHeader>
                  <CardTitle>{mainPageContent.previewTitle}</CardTitle>
                  <CardDescription>
                    {mainPageContent.previewDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <TripleStagger
                    className="rounded-lg border bg-background p-4"
                    variants={tripleContainerVariants}
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      {mainPageContent.canvasNodes.map((node) => (
                        <TripleMotionCard
                          key={node.title}
                          cardClassName="shadow-sm"
                        >
                          <CardContent className="flex flex-col gap-1 p-4">
                            <div className="text-sm font-medium">
                              {node.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {node.label}
                            </div>
                            <p className="text-xs leading-5 text-muted-foreground">
                              {node.detail}
                            </p>
                          </CardContent>
                        </TripleMotionCard>
                      ))}
                    </div>
                  </TripleStagger>
                  <TripleReveal
                    className="flex flex-wrap gap-2"
                    variants={tripleRevealVariants}
                  >
                    {mainPageContent.capabilityBadges.map((capability) => (
                      <Badge key={capability} variant="secondary">
                        {capability}
                      </Badge>
                    ))}
                  </TripleReveal>
                </CardContent>
              </TripleMotionPanel>
            </TripleStagger>
          </div>
        </div>

        <TripleMotionButton
          aria-label="Jump to canvas direction"
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 rounded-full border bg-background/85 p-2 text-muted-foreground shadow-sm backdrop-blur sm:inline-flex"
          href="#canvas-preview"
          size="icon"
          transition={{
            opacity: { delay: 1, duration: 0.6 },
            y: { delay: 1.4, duration: 1.6, repeat: Infinity },
          }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          initial={{ opacity: 0 }}
          variant="outline"
        >
          <ArrowDown aria-hidden="true" data-icon="inline-start" />
        </TripleMotionButton>
      </TripleMotionBackground>
    </TripleMotionRoot>
  );
}
