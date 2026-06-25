import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  BoundaryNotice,
  SectionHeader,
  WorkspaceShell,
} from "../workspace-components";
import { historyEvents } from "../workspace-data";

export const metadata: Metadata = {
  title: "History Prototype | X-META Video",
  description: "Static generation history and version timeline prototype.",
};

export default function WorkspaceHistoryPage() {
  return (
    <WorkspaceShell
      activeHref="/workspace/history"
      description="Static generation history and version timeline for selected outputs, failed attempts, and recoverable creative decisions."
      eyebrow="Generation history"
      title="History and version timeline"
    >
      <BoundaryNotice
        items={[
          "Static timeline only",
          "No audit persistence, immutable generation attempts, selected-output mutation, or rollback",
          "Version labels are local examples",
          "History must later filter by organization and project",
        ]}
      />

      <section
        aria-labelledby="history-timeline-title"
        className="flex flex-col gap-4"
      >
        <SectionHeader
          description="History gives users confidence that generation attempts, selected versions, and failed outputs remain traceable."
          id="history-timeline-title"
          title="Creative lineage"
        />
        <div
          className="grid gap-4"
          data-history-timeline="static-version-preview"
        >
          {historyEvents.map((event) => (
            <Card data-history-version={event.version} key={event.title}>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{event.version}</Badge>
                      <Badge variant="outline">{event.meta}</Badge>
                    </div>
                    <CardTitle className="text-base">{event.title}</CardTitle>
                    <CardDescription>{event.detail}</CardDescription>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/workspace/canvas">Review source node</Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="history-recovery-title"
        className="grid gap-4 lg:grid-cols-2"
      >
        <Card>
          <CardHeader>
            <CardTitle id="history-recovery-title">
              Recovery expectation
            </CardTitle>
            <CardDescription>
              Future history should make selected outputs recoverable without
              hiding failed attempts.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm leading-6 text-muted-foreground">
            <p>Prompt, model, parameters, source inputs, and task IDs belong in persistent generation attempts.</p>
            <p>Rollback or select-version actions require backend history and asset-version APIs.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next useful surface</CardTitle>
            <CardDescription>
              Export should read selected versions after history and asset
              persistence exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link href="/workspace/export">Open export readiness</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </WorkspaceShell>
  );
}
