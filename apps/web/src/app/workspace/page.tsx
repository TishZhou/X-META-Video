"use client";

import { useEffect, useState } from "react";
import type {
  AccountOrganizationResponse,
  AuthSessionResponse,
} from "@xmeta/shared-contracts";

import { Button } from "@/components/ui/button";
import { WorkspaceSelector } from "@/components/xmeta/account/workspace-selector";
import { getCurrentAccount, listWorkspaces } from "@/lib/auth/api";

export default function WorkspacePage() {
  const [session, setSession] = useState<AuthSessionResponse | null>(null);
  const [workspaces, setWorkspaces] = useState<AccountOrganizationResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadAccountState() {
      try {
        const [currentSession, workspaceResponse] = await Promise.all([
          getCurrentAccount(),
          listWorkspaces(),
        ]);

        if (isMounted) {
          setSession(currentSession);
          setWorkspaces(workspaceResponse.organizations);
        }
      } catch (caught) {
        if (isMounted) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Unable to load account workspaces.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAccountState();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12 text-sm text-muted-foreground">
        Loading workspace memberships...
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
        <div className="flex max-w-md flex-col gap-4 rounded-lg border border-border/60 bg-card p-6 text-card-foreground shadow-sm">
          <div>
            <h1 className="text-2xl font-semibold">Account required</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {error ?? "Sign in before choosing a workspace."}
            </p>
          </div>
          <Button asChild>
            <a href="/account/login">Sign in</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <WorkspaceSelector session={session} workspaces={workspaces} />
    </div>
  );
}
