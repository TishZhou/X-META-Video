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
  DetailList,
  NodeCard,
  SectionHeader,
  WorkspaceShell,
} from "../workspace-components";
import { selectedNode, workspaceNodes } from "../workspace-data";

export const metadata: Metadata = {
  title: "Workflow Canvas Prototype | X-META Video",
  description: "Static workflow canvas and node inspector prototype.",
};

export default function WorkspaceCanvasPage() {
  return (
    <WorkspaceShell
      activeHref="/workspace/canvas"
      description="Static workflow canvas plus selected-node inspector for the planned script-to-export production chain."
      eyebrow="Workflow canvas"
      title="Canvas and node inspector"
    >
      <BoundaryNotice
        items={[
          "Static canvas layout only",
          "No drag, zoom, edge persistence, autosave, or dependency execution",
          "No model provider calls or task creation",
          "Node inspector values are local examples",
        ]}
      />

      <section
        aria-labelledby="canvas-layout-title"
        className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]"
      >
        <div className="flex flex-col gap-4">
          <SectionHeader
            description="The canvas remains the central production surface. Mobile views collapse this into a readable node sequence until full canvas editing exists."
            id="canvas-layout-title"
            title="Static production chain"
          />
          <div
            aria-label="Static workflow node sequence"
            className="grid gap-4 lg:grid-cols-2"
            data-workspace-canvas="static-node-chain"
          >
            {workspaceNodes.map((node) => (
              <NodeCard
                key={node.title}
                node={node}
                selected={node.title === selectedNode.title}
              />
            ))}
          </div>
        </div>

        <aside
          aria-labelledby="node-inspector-title"
          className="flex flex-col gap-4"
          data-node-inspector="selected-script-node"
        >
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2">
                <Badge className="w-fit" variant="secondary">
                  Inspector
                </Badge>
                <CardTitle id="node-inspector-title">
                  {selectedNode.title} node
                </CardTitle>
                <CardDescription>{selectedNode.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <DetailList items={selectedNode.inputs} label="Required inputs" />
              <DetailList
                items={selectedNode.dependencies}
                label="Dependencies"
              />
              <div className="rounded-md border bg-muted/35 p-3">
                <div className="text-sm font-medium">Expected output</div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {selectedNode.output}
                </p>
              </div>
              <div className="rounded-md border bg-muted/35 p-3">
                <div className="text-sm font-medium">Task status</div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Preview only. Real generation should create a backend task ID,
                  then stream queued, running, succeeded, or failed status.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button asChild className="w-full" variant="outline">
                  <Link href="/workspace/tasks">Open task status preview</Link>
                </Button>
                <Button asChild className="w-full" variant="ghost">
                  <Link href="/workspace/assets">Open asset library</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inspector boundaries</CardTitle>
              <CardDescription>
                Configuration UI is visible before execution services exist.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm leading-6 text-muted-foreground">
              <p>Validation, autosave, version selection, and regenerate are planned.</p>
              <p>Hidden auto-execution is not part of this prototype.</p>
            </CardContent>
          </Card>
        </aside>
      </section>
    </WorkspaceShell>
  );
}
