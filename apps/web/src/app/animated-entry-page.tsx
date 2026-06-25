"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  DoorOpen,
  FolderOpen,
  MonitorPlay,
  Plus,
  Sparkles,
} from "lucide-react";
import * as React from "react";

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
  const [showProjectChoices, setShowProjectChoices] = React.useState(false);

  return (
    <TripleMotionRoot sourcePattern={mainPageContent.sourcePattern}>
      <TripleMotionBackground>
        <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-5 py-5 sm:px-8 sm:py-6 lg:px-10">
          <TripleStagger
            className="flex shrink-0 items-center justify-between gap-4"
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

          <div
            className="grid flex-1 gap-7 py-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1fr)] lg:items-stretch lg:py-10"
            data-uiux-pro-max-layout="pro-reflow"
          >
            <TripleStagger
              className="flex min-w-0 flex-col justify-start gap-7 pt-8 lg:pt-28 lg:pr-4"
              variants={tripleContainerVariants}
            >
              <TripleReveal
                className="flex max-w-3xl flex-col gap-5"
                variants={tripleRevealVariants}
              >
                <Badge className="w-fit" variant="outline">
                  <Sparkles aria-hidden="true" data-icon="inline-start" />
                  Creative workflow platform
                </Badge>
                <div className="flex flex-col gap-5">
                  <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal sm:text-6xl lg:text-7xl">
                    {mainPageContent.heroTitle}
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                    {mainPageContent.heroDescription}
                  </p>
                </div>
              </TripleReveal>

              <TripleReveal
                className="flex flex-col gap-3 sm:flex-row sm:flex-wrap"
                variants={tripleRevealVariants}
              >
                <TripleMotionButton
                  aria-label="Create a project direction"
                  aria-controls="project-start-choices"
                  aria-expanded={showProjectChoices}
                  onClick={() => setShowProjectChoices((current) => !current)}
                  size="lg"
                >
                  <Plus data-icon="inline-start" aria-hidden="true" />
                  {mainPageContent.primaryAction}
                  <ArrowRight data-icon="inline-end" aria-hidden="true" />
                </TripleMotionButton>
                <TripleMotionButton
                  aria-label="Enter the workspace placeholder"
                  href="#workspace-entry"
                  size="lg"
                  variant="outline"
                >
                  <DoorOpen data-icon="inline-start" aria-hidden="true" />
                  {mainPageContent.workspaceAction}
                </TripleMotionButton>
                <TripleMotionButton
                  aria-label="Review production modes"
                  href="#production-modes"
                  size="lg"
                  variant="secondary"
                >
                  {mainPageContent.secondaryAction}
                </TripleMotionButton>
                <TripleMotionButton
                  aria-label="See creation workflow preview"
                  href="#canvas-preview"
                  size="lg"
                  variant="ghost"
                >
                  {mainPageContent.tertiaryAction}
                </TripleMotionButton>
              </TripleReveal>
            </TripleStagger>

            <TripleStagger
              className="flex min-w-0 flex-col justify-center"
              aria-labelledby="workflow-preview-title"
              id="canvas-preview"
              role="region"
              variants={tripleContainerVariants}
            >
              <TripleMotionPanel cardClassName="h-full">
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 flex-col gap-2">
                      <CardTitle id="workflow-preview-title">
                        {mainPageContent.previewTitle}
                      </CardTitle>
                      <CardDescription>
                        {mainPageContent.previewDescription}
                      </CardDescription>
                    </div>
                    <Badge className="w-fit" variant="outline">
                      {mainPageContent.previewMeta}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  {showProjectChoices ? (
                    <TripleReveal
                      className="flex flex-col gap-3 rounded-lg border bg-muted/35 p-4"
                      id="project-start-choices"
                      variants={tripleRevealVariants}
                    >
                      <div
                        className="flex flex-col gap-1"
                        data-project-start-state="open"
                      >
                        <div className="text-sm font-medium">
                          {mainPageContent.projectStartTitle}
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {mainPageContent.projectStartDescription}
                        </p>
                      </div>
                      <div className="grid gap-3 lg:grid-cols-1 2xl:grid-cols-3">
                        {mainPageContent.projectStartChoices.map((choice) => {
                          const Icon = choice.icon;

                          return (
                            <TripleMotionCard
                              key={choice.title}
                              cardClassName="shadow-sm"
                              data-project-start-choice={choice.title}
                              interactive={false}
                            >
                              <CardContent className="flex h-full flex-col gap-4 p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted">
                                    <Icon
                                      aria-hidden="true"
                                      className="size-4"
                                    />
                                  </span>
                                  <Badge variant="outline">UI-only</Badge>
                                </div>
                                <div className="flex flex-1 flex-col gap-2">
                                  <div className="text-base font-medium">
                                    {choice.title}
                                  </div>
                                  <p className="text-sm leading-6 text-muted-foreground">
                                    {choice.description}
                                  </p>
                                </div>
                                <div className="rounded-md border bg-muted/45 px-3 py-2 text-xs text-muted-foreground">
                                  {choice.output}
                                </div>
                              </CardContent>
                            </TripleMotionCard>
                          );
                        })}
                      </div>
                    </TripleReveal>
                  ) : (
                    <div
                      data-project-start-state="closed"
                      hidden
                      id="project-start-choices"
                    />
                  )}

                  <TripleStagger
                    className="rounded-lg border bg-background p-4"
                    data-workflow-preview="production-pipeline"
                    variants={tripleContainerVariants}
                  >
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {mainPageContent.canvasNodes.map((node, index) => {
                        const Icon = node.icon;

                        return (
                          <TripleMotionCard
                            key={node.title}
                            cardClassName="shadow-sm"
                            data-workflow-step={node.title}
                            interactive={false}
                          >
                            <CardContent className="flex h-full flex-col gap-3 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted">
                                  <Icon aria-hidden="true" className="size-4" />
                                </span>
                                <Badge variant="secondary">
                                  {String(index + 1).padStart(2, "0")}
                                </Badge>
                              </div>
                              <div className="flex flex-col gap-1">
                                <div className="text-sm font-medium">
                                  {node.title}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {node.label}
                                </div>
                              </div>
                              <p className="text-xs leading-5 text-muted-foreground">
                                {node.detail}
                              </p>
                            </CardContent>
                          </TripleMotionCard>
                        );
                      })}
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

          <TripleStagger
            aria-labelledby="recent-work-title"
            className="grid gap-5 pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.55fr)] lg:items-stretch"
            id="recent-work"
            role="region"
            variants={tripleContainerVariants}
          >
            <TripleMotionPanel cardClassName="h-full">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 flex-col gap-2">
                    <CardTitle id="recent-work-title">
                      {mainPageContent.recentWorkTitle}
                    </CardTitle>
                    <CardDescription>
                      {mainPageContent.recentWorkDescription}
                    </CardDescription>
                  </div>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted">
                    <FolderOpen aria-hidden="true" className="size-4" />
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div
                  className="grid gap-3 md:grid-cols-2"
                  data-recent-work-state="local-examples"
                >
                  {mainPageContent.recentWorkItems.map((item) => (
                    <TripleMotionCard
                      key={item.title}
                      cardClassName="shadow-sm"
                      data-recent-work-entry={item.title}
                      interactive={false}
                    >
                      <CardContent className="flex h-full flex-col gap-4 p-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{item.format}</Badge>
                          <Badge variant="outline">{item.status}</Badge>
                        </div>
                        <div className="flex flex-1 flex-col gap-2">
                          <div className="text-base font-medium">
                            {item.title}
                          </div>
                          <p className="text-sm leading-6 text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <TripleMotionButton
                          aria-label={`${item.action}: ${item.title}`}
                          className="w-full justify-between"
                          href="#workspace-entry"
                          size="sm"
                          variant="outline"
                        >
                          {item.action}
                          <ArrowRight
                            data-icon="inline-end"
                            aria-hidden="true"
                          />
                        </TripleMotionButton>
                      </CardContent>
                    </TripleMotionCard>
                  ))}
                </div>
                <div
                  className="rounded-lg border bg-muted/35 p-4"
                  data-recent-work-empty-state="available"
                >
                  <div className="text-sm font-medium">
                    {mainPageContent.recentWorkEmptyLabel}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {mainPageContent.recentWorkEmptyDescription}
                  </p>
                </div>
              </CardContent>
            </TripleMotionPanel>

            <TripleMotionPanel
              aria-labelledby="workspace-entry-title"
              cardClassName="h-full"
              id="workspace-entry"
              role="region"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-col gap-2">
                    <CardTitle id="workspace-entry-title">
                      {mainPageContent.workspaceTitle}
                    </CardTitle>
                    <CardDescription>
                      {mainPageContent.workspaceDescription}
                    </CardDescription>
                  </div>
                  <Badge className="shrink-0" variant="outline">
                    {mainPageContent.workspaceStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  {mainPageContent.workspaceActionsNote}
                </p>
                <TripleMotionButton
                  aria-label="Create a project direction from the workspace placeholder"
                  className="w-full justify-between"
                  onClick={() => setShowProjectChoices(true)}
                  size="lg"
                >
                  Create project direction
                  <Plus data-icon="inline-end" aria-hidden="true" />
                </TripleMotionButton>
              </CardContent>
            </TripleMotionPanel>
          </TripleStagger>

          <TripleStagger
            className="grid gap-5 pb-10 lg:grid-cols-[minmax(220px,0.42fr)_minmax(0,1fr)] lg:items-start"
            id="production-modes"
            variants={tripleContainerVariants}
          >
            <TripleReveal
              className="flex max-w-xl flex-col gap-2"
              variants={tripleRevealVariants}
            >
              <h2 className="text-2xl font-semibold tracking-normal sm:text-3xl">
                {mainPageContent.productionModesTitle}
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                {mainPageContent.productionModesDescription}
              </p>
            </TripleReveal>
            <TripleStagger
              className="grid gap-3 sm:grid-cols-3"
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
        </div>
      </TripleMotionBackground>
    </TripleMotionRoot>
  );
}
