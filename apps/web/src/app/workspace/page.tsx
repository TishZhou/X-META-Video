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
  DashboardMetricTile,
  ProjectMotionCard,
  RouteCard,
  SectionHeader,
  WorkspaceShell,
} from "./workspace-components";
import { MotionPatternDisclosure, MotionSurface } from "./workspace-motion";
import {
  dashboardMetrics,
  dashboardProjects,
  defaultProjectContext,
  readinessSignals,
  workspaceRoutes,
} from "./workspace-data";

export const metadata: Metadata = {
  title: "Motion Workspace | X-META Video",
  description: "Motion-first X-META Video workspace shell and dashboard.",
};

export default function WorkspaceOverviewPage() {
  const supportRoutes = workspaceRoutes.filter(
    (route) => route.href !== "/workspace",
  );

  return (
    <WorkspaceShell
      activeHref="/workspace"
      description="A motion-first local workspace shell for the active node canvas project context, animated route navigation, dashboard cards, and clear backend boundaries."
      eyebrow="Feature 3 motion shell"
      title="Workspace dashboard"
    >
      <BoundaryNotice />

      <MotionPatternDisclosure />

      <section
        aria-labelledby="workspace-summary-title"
        className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(320px,0.45fr)]"
      >
        <MotionSurface>
          <Card
            className="h-full overflow-hidden bg-background/90"
            data-dashboard-shell="motion-first-overview"
          >
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 flex-col gap-2">
                  <CardTitle id="workspace-summary-title">
                    {defaultProjectContext.name}
                  </CardTitle>
                  <CardDescription>
                    Active local context for comic drama, MV rhythm,
                    storyboard, assets, task recovery, history, and export
                    readiness.
                  </CardDescription>
                </div>
                <Badge className="w-fit" variant="outline">
                  {defaultProjectContext.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div
                className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
                data-dashboard-metrics="animated-local-metrics"
              >
                {dashboardMetrics.map((metric) => (
                  <DashboardMetricTile key={metric.label} metric={metric} />
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild size="lg">
                  <Link href="/workspace/canvas">Open motion canvas route</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/workspace/tasks">Review task states</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </MotionSurface>

        <MotionSurface interactive={false}>
          <Card className="h-full" data-dashboard-readiness="motion-signals">
            <CardHeader>
              <CardTitle>Readiness signals</CardTitle>
              <CardDescription>
                Motion supports state comprehension while labels keep the
                missing backend and persistence boundaries explicit.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {readinessSignals.map((signal) => (
                <div
                  className="rounded-md border bg-muted/35 p-3"
                  data-readiness-signal={signal.label}
                  key={signal.label}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-medium">{signal.label}</div>
                    <Badge variant="secondary">{signal.state}</Badge>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {signal.detail}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </MotionSurface>
      </section>

      <section
        aria-labelledby="workspace-projects-title"
        className="flex flex-col gap-4"
      >
        <SectionHeader
          description="Project cards use selected, hover, focus, and reduced-motion markers while keeping unbuilt persistence detail behind a compact disclosure."
          id="workspace-projects-title"
          title="Animated project cards"
        />
        <div
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          data-project-card-baseline="animated-local-projects"
        >
          {dashboardProjects.map((project) => (
            <ProjectMotionCard key={project.title} project={project} />
          ))}
        </div>
      </section>

      <section
        aria-labelledby="workspace-foundation-title"
        className="grid gap-4 lg:grid-cols-[minmax(0,0.75fr)_minmax(320px,0.45fr)]"
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-col gap-2">
                <CardTitle id="workspace-foundation-title">
                  Project foundation boundary
                </CardTitle>
                <CardDescription>
                  The app shell can animate local route state now. Real saved
                  project state remains backend-owned.
                </CardDescription>
              </div>
              <Badge className="w-fit" variant="outline">
                Backend planned
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <p className="text-sm leading-6 text-muted-foreground">
              FastAPI owns auth, RBAC, project state, task creation, and task
              queries. PostgreSQL, object storage, Redis, and workers remain
              future production layers.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next useful surface</CardTitle>
            <CardDescription>
              The motion shell keeps every route reachable without implying
              generation or export execution already works.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild className="w-full" variant="outline">
              <Link href="/workspace/canvas">Open canvas route</Link>
            </Button>
            <Button asChild className="w-full" variant="ghost">
              <Link href="/workspace/assets">Open asset library</Link>
            </Button>
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
