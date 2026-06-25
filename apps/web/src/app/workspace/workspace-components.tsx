import Link from "next/link";
import type { ReactNode } from "react";

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
  prototypeBoundaries,
  workspaceRoutes,
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

export function WorkspaceShell({
  activeHref,
  children,
  description,
  eyebrow,
  title,
}: WorkspaceShellProps) {
  return (
    <main
      className="min-h-screen bg-background text-foreground"
      data-workspace-prototype="static-local"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-5 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-5 border-b pb-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex max-w-3xl flex-col gap-3">
              <Link
                className="text-sm font-semibold tracking-normal text-muted-foreground hover:text-foreground"
                href="/"
              >
                X-META Video
              </Link>
              <div className="flex flex-col gap-2">
                <Badge className="w-fit" variant="outline">
                  {eyebrow}
                </Badge>
                <h1 className="text-3xl font-semibold leading-tight tracking-normal sm:text-4xl">
                  {title}
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                  {description}
                </p>
              </div>
            </div>
            <div
              aria-label="Prototype boundary"
              className="flex flex-wrap gap-2 lg:max-w-sm lg:justify-end"
            >
              <Badge variant="secondary">Static/local</Badge>
              <Badge variant="outline">No backend calls</Badge>
              <Badge variant="outline">No persistence</Badge>
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
                <Button
                  asChild
                  key={route.href}
                  size="sm"
                  variant={active ? "secondary" : "ghost"}
                >
                  <Link
                    aria-current={active ? "page" : undefined}
                    href={route.href}
                  >
                    <Icon aria-hidden="true" data-icon="inline-start" />
                    {route.label}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </header>
        {children}
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
  title = "Feature 2 prototype boundary",
}: BoundaryNoticeProps) {
  return (
    <section
      aria-labelledby="prototype-boundary-title"
      className="rounded-lg border bg-muted/35 p-4"
      data-capability-boundary="static-local"
    >
      <div className="flex flex-col gap-3">
        <div className="text-sm font-medium" id="prototype-boundary-title">
          {title}
        </div>
        <ul className="grid gap-2 text-sm leading-6 text-muted-foreground md:grid-cols-2">
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

export function RouteCard({ route }: RouteCardProps) {
  const Icon = route.icon;

  return (
    <Card data-workspace-route-card={route.href}>
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
            <span aria-hidden="true">-&gt;</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
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
