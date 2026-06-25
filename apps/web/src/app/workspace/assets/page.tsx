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
import { assetItems } from "../workspace-data";

export const metadata: Metadata = {
  title: "Asset Library Prototype | X-META Video",
  description: "Static asset library prototype for generated production assets.",
};

export default function WorkspaceAssetsPage() {
  return (
    <WorkspaceShell
      activeHref="/workspace/assets"
      description="Static library for character, scene, prop, audio, video, and export asset expectations."
      eyebrow="Asset library"
      title="Reusable asset library"
    >
      <BoundaryNotice
        items={[
          "Static asset cards only",
          "No object storage, signed URLs, source-rights persistence, or asset queries",
          "Asset versions and metadata are local examples",
          "Reuse links route to prototype pages only",
        ]}
      />

      <section
        aria-labelledby="asset-library-title"
        className="flex flex-col gap-4"
      >
        <SectionHeader
          description="Assets are grouped by production use so future generated media can be reused across storyboard, composition, audio, video, and export work."
          id="asset-library-title"
          title="Asset inventory"
        />
        <div className="flex flex-wrap gap-2" aria-label="Asset classes">
          {["Character", "Scene", "Prop", "Audio", "Video", "Export"].map(
            (assetClass) => (
              <Badge key={assetClass} variant="secondary">
                {assetClass}
              </Badge>
            ),
          )}
        </div>
        <div
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          data-asset-library="static-local-assets"
        >
          {assetItems.map((asset) => (
            <Card data-asset-type={asset.type} key={asset.title}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{asset.type}</Badge>
                      <Badge variant="outline">{asset.status}</Badge>
                    </div>
                    <CardTitle className="text-base">{asset.title}</CardTitle>
                    <CardDescription>{asset.source}</CardDescription>
                  </div>
                  <Badge className="shrink-0" variant="outline">
                    {asset.version}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="aspect-video rounded-md border bg-muted/35" />
                <div className="grid gap-2 text-sm leading-6 text-muted-foreground">
                  <div>Prompt metadata: planned</div>
                  <div>Model parameters: planned</div>
                  <div>Usage rights: planned</div>
                </div>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/workspace/canvas">Review on canvas</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </WorkspaceShell>
  );
}
