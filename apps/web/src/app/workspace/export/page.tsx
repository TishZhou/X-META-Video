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
  SectionHeader,
  WorkspaceShell,
} from "../workspace-components";
import { exportReadiness, exportSettings } from "../workspace-data";

export const metadata: Metadata = {
  title: "Export Prototype | X-META Video",
  description: "Static export readiness and settings prototype.",
};

export default function WorkspaceExportPage() {
  return (
    <WorkspaceShell
      activeHref="/workspace/export"
      description="Static export readiness view for checking selected clips, audio, storyboard state, source metadata, and renderer boundaries."
      eyebrow="Export readiness"
      title="Export and delivery preview"
    >
      <BoundaryNotice
        items={[
          "Static export checklist only",
          "No export renderer, media assembly, object storage write, download, or delivery link",
          "Readiness gates are local examples",
          "Final render remains a future async backend job",
        ]}
      />

      <section
        aria-labelledby="export-readiness-title"
        className="flex flex-col gap-4"
      >
        <SectionHeader
          description="Export stays blocked until visual sequence, audio, video clips, metadata, and renderer services exist."
          id="export-readiness-title"
          title="Readiness gates"
        />
        <div
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          data-export-readiness="static-checklist"
        >
          {exportReadiness.map((gate) => (
            <Card data-export-gate={gate.title} key={gate.title}>
              <CardHeader>
                <div className="flex flex-col gap-2">
                  <Badge className="w-fit" variant="secondary">
                    {gate.state}
                  </Badge>
                  <CardTitle className="text-base">{gate.title}</CardTitle>
                  <CardDescription>{gate.detail}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="export-settings-title"
        className="grid gap-4 lg:grid-cols-[minmax(0,0.75fr)_minmax(320px,0.45fr)]"
      >
        <Card>
          <CardHeader>
            <CardTitle id="export-settings-title">
              Planned export settings
            </CardTitle>
            <CardDescription>
              Settings describe the future contract without starting a render.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DetailList items={exportSettings} label="Settings preview" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview-only action</CardTitle>
            <CardDescription>
              Export starts only after backend task creation and renderer
              support exist.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button className="w-full" disabled>
              Start export render unavailable
            </Button>
            <Button asChild className="w-full" variant="outline">
              <Link href="/workspace/history">Review selected versions</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </WorkspaceShell>
  );
}
