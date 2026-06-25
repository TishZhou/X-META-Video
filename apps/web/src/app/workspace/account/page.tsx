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
import { accountBoundaries, rolePreview } from "../workspace-data";

export const metadata: Metadata = {
  title: "Account Prototype | X-META Video",
  description: "Static account and workspace management prototype.",
};

export default function WorkspaceAccountPage() {
  return (
    <WorkspaceShell
      activeHref="/workspace/account"
      description="Static account, organization, membership, and workspace boundary preview for future backend-owned auth and RBAC."
      eyebrow="Account and workspace"
      title="Account and workspace management"
    >
      <BoundaryNotice
        items={[
          "Static account preview only",
          "No production login, sessions, invitations, billing, membership mutation, or RBAC enforcement",
          "Roles are documentation-backed examples",
          "Backend must validate every future project, asset, task, and history request",
        ]}
      />

      <section
        aria-labelledby="account-boundaries-title"
        className="flex flex-col gap-4"
      >
        <SectionHeader
          description="Feature 2 shows the account model so later features can connect auth without moving authorization into the frontend."
          id="account-boundaries-title"
          title="Auth and workspace boundaries"
        />
        <div
          className="grid gap-4 md:grid-cols-2"
          data-account-boundaries="static-auth-preview"
        >
          {accountBoundaries.map((item) => {
            const Icon = item.icon;

            return (
              <Card data-account-boundary={item.label} key={item.label}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted">
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <div className="flex min-w-0 flex-col gap-2">
                      <CardTitle className="text-base">{item.label}</CardTitle>
                      <CardDescription>{item.value}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="role-preview-title"
        className="grid gap-4 lg:grid-cols-[minmax(0,0.75fr)_minmax(320px,0.45fr)]"
      >
        <Card>
          <CardHeader>
            <CardTitle id="role-preview-title">Role matrix preview</CardTitle>
            <CardDescription>
              Roles reflect the architecture contract. This page does not grant
              or revoke access.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {rolePreview.map((role) => (
              <div
                className="grid gap-2 rounded-md border bg-muted/35 p-3 text-sm leading-6 md:grid-cols-[120px_minmax(0,1fr)_160px]"
                data-role-preview={role.role}
                key={role.role}
              >
                <div className="font-medium">{role.role}</div>
                <div className="text-muted-foreground">{role.access}</div>
                <Badge className="w-fit" variant="outline">
                  {role.scope}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workspace exit path</CardTitle>
            <CardDescription>
              Account preview remains connected to production work and never
              traps the user.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild className="w-full" variant="outline">
              <Link href="/workspace">Back to overview</Link>
            </Button>
            <Button asChild className="w-full" variant="ghost">
              <Link href="/workspace/canvas">Open canvas</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </WorkspaceShell>
  );
}
