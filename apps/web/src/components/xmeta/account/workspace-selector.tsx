"use client";

import Link from "next/link";
import { useState } from "react";
import type {
  AccountOrganizationResponse,
  AuthSessionResponse,
} from "@xmeta/shared-contracts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { selectWorkspace } from "@/lib/auth/api";

type WorkspaceSelectorProps = {
  session: AuthSessionResponse;
  workspaces: AccountOrganizationResponse[];
};

export function WorkspaceSelector({
  session,
  workspaces,
}: WorkspaceSelectorProps) {
  const [error, setError] = useState<string | null>(null);
  const activeOrgId = session.active_organization.org_id;

  async function handleSelect(orgId: string) {
    setError(null);

    try {
      await selectWorkspace(orgId);
      globalThis.window?.location.assign("/workspace");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Workspace selection failed.",
      );
    }
  }

  return (
    <Card className="mx-auto w-full max-w-2xl rounded-lg border-border/60 bg-card/95 shadow-sm">
      <CardHeader className="gap-2">
        <CardTitle className="text-2xl">Choose workspace</CardTitle>
        <CardDescription>
          Signed in as {session.user.email}. Select a backend workspace
          membership before entering the canvas.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {workspaces.length > 0 ? (
          <div className="grid gap-3">
            {workspaces.map((workspace) => {
              const isActive = workspace.org_id === activeOrgId;

              return (
                <div
                  className="flex items-center justify-between gap-4 rounded-md border border-border/60 bg-background/70 p-3"
                  key={workspace.org_id}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-sm font-semibold">
                        {workspace.name}
                      </h2>
                      <Badge variant={isActive ? "default" : "secondary"}>
                        {workspace.role}
                      </Badge>
                      {isActive ? <Badge variant="outline">Active</Badge> : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Workspace ID: {workspace.org_id}
                    </p>
                  </div>

                  <Button
                    onClick={() => void handleSelect(workspace.org_id)}
                    type="button"
                    variant={isActive ? "secondary" : "outline"}
                  >
                    {isActive ? "Use active" : "Select"}
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="rounded-md border border-border/60 bg-background/70 p-3 text-sm text-muted-foreground">
            No workspace memberships were returned by the backend.
          </p>
        )}

        {error ? (
          <p
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <Button asChild>
          <Link href="/workspace">Continue to workspace</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
