import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, MonitorPlay } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import {
  MotionNavItem,
  MotionProjectArticle,
  MotionRouteFrame,
  MotionShellHeader,
  MotionSurface,
  UnavailableDisclosure,
} from "./workspace-motion";
import {
  defaultProjectContext,
  prototypeBoundaries,
  workspaceRoutes,
  type DashboardMetric,
  type DashboardProject,
  type WorkspaceNode,
  type WorkspaceRoute,
} from "./workspace-data";

type WorkspaceShellProps = {
  activeHref: string;
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
};

type SectionHeaderProps = {
  description: string;
  id?: string;
  title: string;
};

type BoundaryNoticeProps = {
  items?: string[];
  title?: string;
};

type RouteCardProps = {
  route: WorkspaceRoute;
};

type NodeCardProps = {
  node: WorkspaceNode;
  selected?: boolean;
};

type DashboardMetricTileProps = {
  metric: DashboardMetric;
};

type ProjectMotionCardProps = {
  project: DashboardProject;
};

export function WorkspaceShell({
  activeHref,
  children,
  description,
  eyebrow,
  title,
}: WorkspaceShellProps) {
  return (
    <main
      className="min-h-screen overflow-x-hidden bg-background text-foreground"
      data-animation-runtime="framer-motion"
      data-motion-shell="framer-route-transition"
      data-reduced-motion-behavior="transform-disabled-labels-preserved"
      data-source-pattern="UI TripleD animated-navigation app-shell pattern"
      data-workspace-prototype="static-local"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-5 sm:px-8 lg:px-10">
        <MotionShellHeader
          className="flex flex-col gap-4 border-b pb-5"
          data-animated-navigation="workspace-route-list"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex max-w-3xl flex-col gap-3">
              <Link
                className="flex w-fit items-center gap-2 text-sm font-semibold tracking-normal text-muted-foreground hover:text-foreground"
                href="/"
              >
                <span className="flex size-8 items-center justify-center rounded-md border bg-background shadow-sm">
                  <MonitorPlay aria-hidden="true" className="size-4" />
                </span>
                X-META Video
              </Link>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  <Badge className="w-fit" variant="outline">
                    {eyebrow}
                  </Badge>
                  <Badge
                    aria-label="Motion runtime: Framer Motion with reduced-motion fallback"
                    className="w-fit"
                    variant="secondary"
                  >
                    Motion shell
                  </Badge>
                </div>
                <h1 className="text-3xl font-semibold leading-tight tracking-normal sm:text-4xl">
                  {title}
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                  {description}
                </p>
              </div>
            </div>
            <div
              className="flex w-full max-w-sm flex-col gap-2 rounded-lg border bg-muted/35 p-3 text-sm lg:mt-1"
              data-default-project-context={defaultProjectContext.name}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="font-medium">{defaultProjectContext.name}</div>
                  <div className="text-muted-foreground">
                    {defaultProjectContext.workspace}
                  </div>
                </div>
                <Badge className="shrink-0" variant="outline">
                  {defaultProjectContext.status}
                </Badge>
              </div>
              <div className="text-muted-foreground">
                {defaultProjectContext.mode}
              </div>
            </div>
          </div>
          <nav
            aria-label="Workspace routes"
            className="flex flex-wrap gap-2"
            data-workspace-navigation="route-list"
          >
            {workspaceRoutes.map((route) => {
              const Icon = route.icon;
              const active = route.href === activeHref;

              return (
                <MotionNavItem active={active} key={route.href}>
                  <Button
                    asChild
                    size="sm"
                    variant={active ? "secondary" : "ghost"}
                  >
                    <Link
                      aria-current={active ? "page" : undefined}
                      className="relative"
                      data-motion-nav-item={route.href}
                      href={route.href}
                    >
                      <Icon aria-hidden="true" data-icon="inline-start" />
                      {route.label}
                    </Link>
                  </Button>
                </MotionNavItem>
              );
            })}
          </nav>
        </MotionShellHeader>
        <MotionRouteFrame activeHref={activeHref}>{children}</MotionRouteFrame>
      </div>
    </main>
  );
}

export function SectionHeader({ description, id, title }: SectionHeaderProps) {
  return (
    <div className="flex max-w-3xl flex-col gap-2">
      <h2
        className="text-xl font-semibold leading-tight tracking-normal"
        id={id}
      >
        {title}
      </h2>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

export function BoundaryNotice({
  items = prototypeBoundaries,
  title = "Prototype limits",
}: BoundaryNoticeProps) {
  return (
    <section
      aria-labelledby="prototype-boundary-title"
      className="rounded-lg border bg-muted/30 px-4 py-3"
      data-capability-boundary="static-local"
    >
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:gap-4">
        <div
          className="shrink-0 text-sm font-medium"
          id="prototype-boundary-title"
        >
          {title}
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm leading-6 text-muted-foreground">
          {items.map((item) => (
            <li className="flex gap-2" key={item}>
              <span aria-hidden="true">-</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function DashboardMetricTile({ metric }: DashboardMetricTileProps) {
  return (
    <MotionSurface data-dashboard-metric={metric.label}>
      <div className="h-full rounded-lg border bg-background/85 p-4 shadow-sm">
        <div className="text-xs font-medium text-muted-foreground">
          {metric.label}
        </div>
        <div className="mt-2 text-3xl font-semibold tracking-normal">
          {metric.value}
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {metric.detail}
        </p>
      </div>
    </MotionSurface>
  );
}

export function ProjectMotionCard({ project }: ProjectMotionCardProps) {
  return (
    <MotionProjectArticle
      data-motion-state={project.motionState}
      data-project-card={project.title}
      selected={project.selected}
    >
      <Card className="group h-full overflow-hidden bg-background/90 transition-colors hover:border-primary/40 focus-within:ring-1 focus-within:ring-ring">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant={project.selected ? "default" : "secondary"}>
                  {project.status}
                </Badge>
                <Badge variant="outline">{project.mode}</Badge>
              </div>
              <CardTitle className="text-base">{project.title}</CardTitle>
              <CardDescription>{project.detail}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div
            aria-hidden="true"
            className="grid aspect-video grid-cols-3 gap-2 rounded-md border bg-muted/25 p-3"
          >
            {[0, 1, 2, 3, 4, 5].map((lane) => (
              <span
                className={cn(
                  "rounded-md border bg-background",
                  lane === 0 || (project.selected && lane === 3)
                    ? "bg-primary/10"
                    : "bg-muted/40",
                )}
                key={lane}
              />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full justify-between" variant="outline">
              <Link href={project.href}>
                {project.action}
                <ArrowRight aria-hidden="true" data-icon="inline-end" />
              </Link>
            </Button>
            <UnavailableDisclosure
              detail={project.missingCapability}
              label="Project persistence missing"
            />
          </div>
        </CardContent>
      </Card>
    </MotionProjectArticle>
  );
}

export function RouteCard({ route }: RouteCardProps) {
  const Icon = route.icon;

  return (
    <MotionSurface data-workspace-route-card={route.href}>
      <Card className="h-full overflow-hidden bg-background/90 transition-colors hover:border-primary/40 focus-within:ring-1 focus-within:ring-ring">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-2">
              <CardTitle className="text-base">{route.label}</CardTitle>
              <CardDescription>{route.description}</CardDescription>
            </div>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted">
              <Icon aria-hidden="true" className="size-4" />
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full justify-between" variant="outline">
            <Link href={route.href}>
              Open {route.label}
              <ArrowRight aria-hidden="true" data-icon="inline-end" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </MotionSurface>
  );
}

export function NodeCard({ node, selected = false }: NodeCardProps) {
  const Icon = node.icon;

  return (
    <Card
      data-node-surface={node.title}
      data-selected-node={selected ? "true" : "false"}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant={selected ? "default" : "secondary"}>
                {selected ? "Selected" : node.status}
              </Badge>
              {selected ? <Badge variant="outline">{node.status}</Badge> : null}
            </div>
            <CardTitle className="text-base">{node.title}</CardTitle>
            <CardDescription>{node.description}</CardDescription>
          </div>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted">
            <Icon aria-hidden="true" className="size-4" />
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {selected ? (
          <div className="rounded-md border bg-muted/35 px-3 py-2 text-sm leading-6 text-muted-foreground">
            Inputs, dependencies, output, and task status are shown in the
            inspector to avoid repeating selected-node detail on the canvas.
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium">Inputs</div>
              <div className="flex flex-wrap gap-2">
                {node.inputs.map((input) => (
                  <Badge key={input} variant="outline">
                    {input}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="rounded-md border bg-muted/35 px-3 py-2 text-sm text-muted-foreground">
              Output: {node.output}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function DetailList({
  items,
  label,
}: {
  items: string[];
  label: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium">{label}</div>
      <ul className="flex flex-col gap-2 text-sm leading-6 text-muted-foreground">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            <span aria-hidden="true">-</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
