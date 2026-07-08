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
      globalThis.window?.location.assign("/project");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Workspace selection failed.",
      );
    }
  }

  return (
    <Card className="mx-auto w-full max-w-2xl rounded-none border-border bg-background shadow-none">
      <CardHeader className="gap-2 px-8 pt-8">
        <CardTitle className="text-3xl tracking-tight text-foreground">Select Workspace</CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Signed in as {session.user.email}. Select a workspace to enter the canvas.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 px-8 pb-8">
        {workspaces.length > 0 ? (
          <div className="grid gap-4">
            {workspaces.map((workspace) => {
              const isActive = workspace.org_id === activeOrgId;

              return (
                <div
                  className="group flex flex-col justify-between gap-4 rounded-sm border border-border bg-card p-5 transition-colors hover:border-foreground sm:flex-row sm:items-center"
                  key={workspace.org_id}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="truncate text-lg font-medium tracking-tight text-foreground">
                        {workspace.name}
                      </h2>
                      <Badge variant={isActive ? "default" : "secondary"} className="rounded-sm font-normal">
                        {workspace.role}
                      </Badge>
                      {isActive ? <Badge variant="outline" className="rounded-sm font-normal">Active</Badge> : null}
                    </div>
                    <p className="mt-2 font-mono text-xs text-muted-foreground opacity-70">
                      ID: {workspace.org_id}
                    </p>
                  </div>

                  <Button
                    onClick={() => void handleSelect(workspace.org_id)}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    className="rounded-sm"
                  >
                    {isActive ? "Enter Canvas" : "Select"}
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-sm border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No workspaces available.
          </div>
        )}

        {error ? (
          <div
            className="rounded-sm bg-destructive/10 p-4 text-sm font-medium text-destructive"
            role="alert"
          >
            {error}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
