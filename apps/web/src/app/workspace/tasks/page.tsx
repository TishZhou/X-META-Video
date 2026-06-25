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
import { recoveryRules, taskItems } from "../workspace-data";

export const metadata: Metadata = {
  title: "Task Status Prototype | X-META Video",
  description: "Static task status and retry prototype.",
};

export default function WorkspaceTasksPage() {
  return (
    <WorkspaceShell
      activeHref="/workspace/tasks"
      description="Static task status view for queued, running, succeeded, and failed generation work."
      eyebrow="Task status"
      title="Task status and retry"
    >
      <BoundaryNotice
        items={[
          "Static task rows only",
          "No Redis queue, worker, SSE, WebSocket, retry mutation, or cancellation",
          "Retry language is a design contract, not an active command",
          "Failed downstream tasks must not imply upstream output loss",
        ]}
      />

      <section aria-labelledby="task-status-title" className="flex flex-col gap-4">
        <SectionHeader
          description="Async generation should stay visible and recoverable. These rows model the state language without creating tasks."
          id="task-status-title"
          title="Generation task states"
        />
        <div
          className="grid gap-4 lg:grid-cols-2"
          data-task-status="static-retry-preview"
        >
          {taskItems.map((task) => {
            const Icon = task.icon;

            return (
              <Card data-task-state={task.state} key={task.title}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-col gap-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{task.state}</Badge>
                        <Badge variant="outline">{task.node}</Badge>
                      </div>
                      <CardTitle className="text-base">{task.title}</CardTitle>
                      <CardDescription>{task.detail}</CardDescription>
                    </div>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted">
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="rounded-md border bg-muted/35 px-3 py-2 text-sm leading-6 text-muted-foreground">
                    {task.nextStep}
                  </div>
                  <Button asChild className="w-full" variant="outline">
                    <Link href="/workspace/history">Trace in history</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="retry-rules-title"
        className="flex flex-col gap-4"
      >
        <SectionHeader
          description="Retry behavior belongs to the backend task service. The prototype keeps the rules visible for later implementation."
          id="retry-rules-title"
          title="Retry and recovery rules"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {recoveryRules.map((rule) => {
            const Icon = rule.icon;

            return (
              <Card key={rule.title}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted">
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <div className="flex min-w-0 flex-col gap-2">
                      <CardTitle className="text-base">{rule.title}</CardTitle>
                      <CardDescription>{rule.detail}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>
    </WorkspaceShell>
  );
}
