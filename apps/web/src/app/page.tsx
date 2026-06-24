import { ArrowRight, MonitorPlay } from "lucide-react";

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

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b bg-muted/30">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between gap-4">
            <a
              className="flex items-center gap-3"
              href="/"
              aria-label="X-META Video home"
            >
              <span className="flex size-9 items-center justify-center rounded-md border bg-background">
                <MonitorPlay aria-hidden="true" className="size-4" />
              </span>
              <span className="text-sm font-semibold tracking-normal">
                {mainPageContent.productName}
              </span>
            </a>
            <Badge variant="secondary">{mainPageContent.eyebrow}</Badge>
          </header>

          <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)] lg:py-16">
            <div className="flex max-w-3xl flex-col gap-8">
              <div className="flex flex-col gap-5">
                <Badge className="w-fit" variant="outline">
                  Creative workflow platform
                </Badge>
                <div className="flex flex-col gap-5">
                  <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-normal sm:text-6xl">
                    {mainPageContent.heroTitle}
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                    {mainPageContent.heroDescription}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <a href="#production-modes">
                    {mainPageContent.primaryAction}
                    <ArrowRight data-icon="inline-end" aria-hidden="true" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#canvas-preview">
                    {mainPageContent.secondaryAction}
                  </a>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3" id="production-modes">
                {mainPageContent.productionModes.map((mode) => {
                  const Icon = mode.icon;

                  return (
                    <Card key={mode.title}>
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
                  );
                })}
              </div>
            </div>

            <Card className="overflow-hidden" id="canvas-preview">
              <CardHeader>
                <CardTitle>{mainPageContent.previewTitle}</CardTitle>
                <CardDescription>
                  {mainPageContent.previewDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="rounded-lg border bg-background p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {mainPageContent.canvasNodes.map((node) => (
                      <div
                        key={node.title}
                        className="rounded-md border bg-card p-4 shadow-sm"
                      >
                        <div className="text-sm font-medium">{node.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {node.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mainPageContent.capabilityBadges.map((capability) => (
                    <Badge key={capability} variant="secondary">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
