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
  RouteCard,
  SectionHeader,
  WorkspaceShell,
} from "./workspace-components";
import {
  overviewHighlights,
  workspaceRoutes,
} from "./workspace-data";

export const metadata: Metadata = {
  title: "Workspace Prototype | X-META Video",
  description: "Static X-META Video workspace overview prototype.",
};

export default function WorkspaceOverviewPage() {
  const supportRoutes = workspaceRoutes.filter(
    (route) => route.href !== "/workspace",
  );

  return (
    <WorkspaceShell
      activeHref="/workspace"
      description="A static/local overview of the planned production workspace. It gives Feature 3 a route map without claiming real projects, saved state, or backend execution."
      eyebrow="Feature 2 interface prototype"
      title="Workspace overview"
    >
      <BoundaryNotice />

      <section
        aria-labelledby="workspace-summary-title"
        className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(320px,0.45fr)]"
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-col gap-2">
                <CardTitle id="workspace-summary-title">
                  Neon alley comic pilot
                </CardTitle>
                <CardDescription>
                  Local sample project for comic drama, MV rhythm, storyboard,
                  asset, task, history, and export route planning.
                </CardDescription>
              </div>
              <Badge className="w-fit" variant="outline">
                Sample only
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="grid gap-3 md:grid-cols-3">
              {overviewHighlights.map((item) => (
                <div
                  className="rounded-lg border bg-muted/35 p-4"
                  key={item.label}
                >
                  <div className="text-xs font-medium text-muted-foreground">
                    {item.label}
                  </div>
                  <div className="mt-2 text-lg font-semibold">
                    {item.value}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg">
                <Link href="/workspace/canvas">Open canvas prototype</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/workspace/tasks">Review task states</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Planned source of truth</CardTitle>
            <CardDescription>
              The page is static. Later features must load project, task, asset,
              history, and membership state from the backend contract.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm leading-6 text-muted-foreground">
            <p>FastAPI owns auth, RBAC, project state, task creation, and task queries.</p>
            <p>PostgreSQL owns durable metadata. Object storage owns generated media.</p>
            <p>Redis and workers own async generation and export jobs.</p>
          </CardContent>
        </Card>
      </section>

      <section
        aria-labelledby="workspace-route-map-title"
        className="flex flex-col gap-4"
      >
        <SectionHeader
          description="Each route is reachable from the workspace shell and links back through the same navigation."
          id="workspace-route-map-title"
          title="MVP route map"
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {supportRoutes.map((route) => (
            <RouteCard key={route.href} route={route} />
          ))}
        </div>
      </section>
    </WorkspaceShell>
  );
}
