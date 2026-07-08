"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Github, Mail, ShieldCheck, Users } from "lucide-react";
import type {
  AccountMemberResponse,
  AccountRole,
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
import { Separator } from "@/components/ui/separator";
import {
  changeAccountPassword,
  confirmPasswordReset,
  getCurrentAccount,
  inviteAccountMember,
  listAccountMembers,
  logoutAccount,
  removeAccountMember,
  requestPasswordReset,
  updateAccountMemberRole,
  updateAccountProfile,
  updateWorkspaceSettings,
} from "@/lib/auth/api";

type AccountCenterProps = {
  initialSession?: AuthSessionResponse;
  initialMembers?: readonly AccountMemberResponse[];
};

const roleOptions: AccountRole[] = ["owner", "admin", "editor", "viewer"];

function valueFrom(form: HTMLFormElement, name: string) {
  return String(new FormData(form).get(name) ?? "").trim();
}

function canManageMembers(session: AuthSessionResponse | null) {
  const role = session?.active_organization.role;
  return role === "owner" || role === "admin";
}

export function AccountCenter({
  initialMembers,
  initialSession,
}: AccountCenterProps) {
  const [session, setSession] = useState<AuthSessionResponse | null>(
    initialSession ?? null,
  );
  const [members, setMembers] = useState<AccountMemberResponse[]>(
    initialMembers ? [...initialMembers] : [],
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!initialSession);
  const [resetToken, setResetToken] = useState<string | null>(null);

  async function refreshMembers() {
    const memberResponse = await listAccountMembers();
    setMembers(memberResponse.members);
  }

  useEffect(() => {
    let isMounted = true;

    if (initialSession) {
      return undefined;
    }

    async function loadAccountCenter() {
      try {
        const currentSession = await getCurrentAccount();
        const memberResponse = canManageMembers(currentSession)
          ? await listAccountMembers()
          : { members: [] };

        if (isMounted) {
          setSession(currentSession);
          setMembers(memberResponse.members);
        }
      } catch (caught) {
        if (isMounted) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Unable to load account center.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAccountCenter();

    return () => {
      isMounted = false;
    };
  }, [initialSession]);

  function setFailure(caught: unknown, fallback: string) {
    setMessage(null);
    setError(caught instanceof Error ? caught.message : fallback);
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const updated = await updateAccountProfile({
        name: valueFrom(event.currentTarget, "name"),
      });
      setSession(updated);
      setError(null);
      setMessage("Profile updated.");
    } catch (caught) {
      setFailure(caught, "Profile update failed.");
    }
  }

  async function handleWorkspaceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const updated = await updateWorkspaceSettings({
        name: valueFrom(event.currentTarget, "workspace_name"),
      });
      setSession(updated);
      setError(null);
      setMessage("Workspace settings updated.");
    } catch (caught) {
      setFailure(caught, "Workspace update failed.");
    }
  }

  async function handleInviteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const invite = await inviteAccountMember({
        email: valueFrom(event.currentTarget, "invite_email"),
        role: valueFrom(event.currentTarget, "invite_role") as AccountRole,
      });
      await refreshMembers();
      setError(null);
      setMessage(`Invite member token: ${invite.development_token}`);
    } catch (caught) {
      setFailure(caught, "Invite failed.");
    }
  }

  async function handleRoleChange(membershipId: string, role: AccountRole) {
    try {
      await updateAccountMemberRole(membershipId, { role });
      await refreshMembers();
      setError(null);
      setMessage("Member role updated.");
    } catch (caught) {
      setFailure(caught, "Role update failed.");
    }
  }

  async function handleRemoveMember(membershipId: string) {
    try {
      await removeAccountMember(membershipId);
      await refreshMembers();
      setError(null);
      setMessage("Member removed.");
    } catch (caught) {
      setFailure(caught, "Member removal failed.");
    }
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await changeAccountPassword({
        current_password: valueFrom(event.currentTarget, "current_password"),
        new_password: valueFrom(event.currentTarget, "new_password"),
      });
      setError(null);
      setMessage("Password changed.");
    } catch (caught) {
      setFailure(caught, "Password change failed.");
    }
  }

  async function handleResetRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const response = await requestPasswordReset({
        email: valueFrom(event.currentTarget, "reset_email"),
      });
      setResetToken(response.development_token ?? null);
      setError(null);
      setMessage("Password reset request recorded in development outbox.");
    } catch (caught) {
      setFailure(caught, "Password reset request failed.");
    }
  }

  async function handleResetConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await confirmPasswordReset({
        token: valueFrom(event.currentTarget, "reset_token"),
        new_password: valueFrom(event.currentTarget, "reset_new_password"),
      });
      setError(null);
      setMessage("Password reset confirmed.");
    } catch (caught) {
      setFailure(caught, "Password reset confirmation failed.");
    }
  }

  async function handleSignOut() {
    try {
      await logoutAccount();
    } finally {
      globalThis.localStorage?.removeItem("xmeta_has_account_session");
      globalThis.window?.location.assign("/account/login");
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-5xl items-center justify-center px-4 py-12 text-sm font-medium tracking-tight text-muted-foreground">
        Initializing...
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-lg items-center justify-center px-4 py-12">
        <Card className="w-full rounded-sm border-border bg-card shadow-none">
          <CardHeader>
            <CardTitle className="text-xl tracking-tight">Account required</CardTitle>
            <CardDescription className="text-sm">
              {error ?? "Authentication is required to proceed."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full rounded-sm">
              <a href="/account/login">Authenticate</a>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const managersOnly = canManageMembers(session);
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
      {/* Header section with CTA */}
      <section className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            {session.active_organization.name}
          </h1>
          <p className="text-base text-muted-foreground">
            Authenticated as <span className="text-foreground">{session.user.email}</span> &mdash;{" "}
            <span className="capitalize">{session.active_organization.role}</span> access.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="rounded-sm px-8">
            <Link href="/workspace">
              Enter Workspace <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button onClick={() => void handleSignOut()} type="button" variant="outline" size="lg" className="rounded-sm">
            Sign out
          </Button>
        </div>
      </section>

      {message ? (
        <div className="rounded-sm bg-primary/10 p-4 text-sm font-medium text-primary">
          {message}
        </div>
      ) : null}
      {error ? (
        <div
          className="rounded-sm bg-destructive/10 p-4 text-sm font-medium text-destructive"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-sm border-border bg-card shadow-none">
          <CardHeader>
            <CardTitle className="text-xl tracking-tight">Profile</CardTitle>
            <CardDescription className="text-sm">Update your identity parameters.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleProfileSubmit}>
              <label className="grid gap-2 text-sm font-medium">
                Name
                <input
                  className="h-10 rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  defaultValue={session.user.name}
                  name="name"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Email
                <input
                  className="h-10 rounded-sm border border-input bg-muted px-3 text-sm text-muted-foreground opacity-70"
                  defaultValue={session.user.email}
                  disabled
                  type="email"
                />
              </label>
              <div className="mt-2">
                <Button type="submit" variant="secondary" className="rounded-sm">Save Profile</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-sm border-border bg-card shadow-none">
          <CardHeader>
            <CardTitle className="text-xl tracking-tight">Workspace configuration</CardTitle>
            <CardDescription className="text-sm">
              Manage current workspace settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleWorkspaceSubmit}>
              <label className="grid gap-2 text-sm font-medium">
                Workspace name
                <input
                  className="h-10 rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  defaultValue={session.active_organization.name}
                  disabled={!managersOnly}
                  name="workspace_name"
                  required
                />
              </label>
              <div className="mt-2">
                <Button disabled={!managersOnly} type="submit" variant="secondary" className="rounded-sm">
                  Save Workspace
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-sm border-border bg-card shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl tracking-tight">
            <Users className="h-5 w-5" aria-hidden="true" />
            Access control
          </CardTitle>
          <CardDescription className="text-sm">
            Manage members and role delegations.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {!managersOnly ? (
            <div className="rounded-sm border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Elevated privileges required to manage members.
            </div>
          ) : null}

          <form className="grid gap-4 sm:grid-cols-[1fr_12rem_auto]" onSubmit={handleInviteSubmit}>
            <input
              className="h-10 rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              disabled={!managersOnly}
              name="invite_email"
              placeholder="user@example.com"
              required
              type="email"
            />
            <select
              className="h-10 rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              defaultValue="editor"
              disabled={!managersOnly}
              name="invite_role"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <Button disabled={!managersOnly} type="submit" className="rounded-sm">
              Provision Access
            </Button>
          </form>

          <div className="grid gap-3">
            {members.map((member) => (
              <div
                className="flex flex-col gap-4 rounded-sm border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                key={member.membership_id}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{member.email}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.name}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    className="h-9 w-32 rounded-sm border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    defaultValue={member.role}
                    disabled={!managersOnly}
                    onChange={(event) =>
                      void handleRoleChange(
                        member.membership_id,
                        event.currentTarget.value as AccountRole,
                      )
                    }
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <Button
                    disabled={!managersOnly}
                    onClick={() => void handleRemoveMember(member.membership_id)}
                    type="button"
                    variant="outline"
                    className="h-9 rounded-sm"
                  >
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-sm border-border bg-card shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl tracking-tight">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              Security credentials
            </CardTitle>
            <CardDescription className="text-sm">
              Update authentication factors.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8">
            <form className="grid gap-4" onSubmit={handlePasswordChange}>
              <div className="grid gap-2">
                <input
                  className="h-10 rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  name="current_password"
                  placeholder="Current password"
                  required
                  type="password"
                />
                <input
                  className="h-10 rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  minLength={8}
                  name="new_password"
                  placeholder="New password"
                  required
                  type="password"
                />
              </div>
              <div>
                <Button type="submit" variant="secondary" className="rounded-sm">Rotate Password</Button>
              </div>
            </form>

            <Separator />

            <div className="grid gap-6">
              <form className="grid gap-3" onSubmit={handleResetRequest}>
                <p className="text-sm font-medium text-foreground">Development Reset</p>
                <div className="flex gap-2">
                  <input
                    className="h-10 flex-1 rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    defaultValue={session.user.email}
                    name="reset_email"
                    required
                    type="email"
                  />
                  <Button type="submit" variant="outline" className="rounded-sm">
                    Request
                  </Button>
                </div>
              </form>
              <form className="grid gap-3" onSubmit={handleResetConfirm}>
                <input
                  className="h-10 rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  defaultValue={resetToken ?? ""}
                  name="reset_token"
                  placeholder="Reset token"
                  required
                />
                <input
                  className="h-10 rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  minLength={8}
                  name="reset_new_password"
                  placeholder="New password"
                  required
                  type="password"
                />
                <div>
                  <Button type="submit" variant="outline" className="rounded-sm">
                    Confirm Reset
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="rounded-sm border-border bg-card shadow-none">
            <CardHeader>
              <CardTitle className="text-xl tracking-tight">Identity providers</CardTitle>
              <CardDescription className="text-sm">
                OAuth connections (Placeholder).
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button disabled type="button" variant="outline" className="justify-start rounded-sm">
                <Github className="mr-2 h-4 w-4" aria-hidden="true" />
                GitHub (Pending)
              </Button>
              <Button disabled type="button" variant="outline" className="justify-start rounded-sm">
                <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                Google (Pending)
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-sm border-border bg-card shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl tracking-tight">Billing</CardTitle>
                <Badge variant="secondary" className="rounded-sm font-normal">Owner only</Badge>
              </div>
              <CardDescription className="text-sm">
                Subscription and usage (Placeholder).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled type="button" variant="outline" className="w-full rounded-sm">
                Billing (Pending)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
