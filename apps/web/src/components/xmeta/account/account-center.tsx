"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Github, Mail, ShieldCheck, Users } from "lucide-react";
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
      <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-5xl items-center justify-center px-4 py-12 text-sm text-muted-foreground">
        Loading account center...
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-lg items-center justify-center px-4 py-12">
        <Card className="w-full rounded-lg border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Account required</CardTitle>
            <CardDescription>
              {error ?? "Sign in before opening the account center."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/account/login">Sign in</a>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const managersOnly = canManageMembers(session);
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
            Account center
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {session.active_organization.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Signed in as {session.user.email} with{" "}
            {session.active_organization.role} access.
          </p>
        </div>
        <Button onClick={() => void handleSignOut()} type="button" variant="outline">
          Sign out
        </Button>
      </section>

      {message ? (
        <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
          {message}
        </p>
      ) : null}
      {error ? (
        <p
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your display name.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3" onSubmit={handleProfileSubmit}>
              <label className="grid gap-1.5 text-sm font-medium">
                Name
                <input
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  defaultValue={session.user.name}
                  name="name"
                  required
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Email
                <input
                  className="h-10 rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground"
                  defaultValue={session.user.email}
                  disabled
                  type="email"
                />
              </label>
              <Button type="submit">Save profile</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Workspace settings</CardTitle>
            <CardDescription>
              Owner and Admin roles can update the active workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3" onSubmit={handleWorkspaceSubmit}>
              <label className="grid gap-1.5 text-sm font-medium">
                Workspace name
                <input
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  defaultValue={session.active_organization.name}
                  disabled={!managersOnly}
                  name="workspace_name"
                  required
                />
              </label>
              <Button disabled={!managersOnly} type="submit">
                Save workspace
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users aria-hidden="true" />
            Members
          </CardTitle>
          <CardDescription>
            Invited members default to Editor unless another role is selected.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          {!managersOnly ? (
            <p className="rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              Owner or Admin role is required to invite members, list all
              members, change roles, or remove members.
            </p>
          ) : null}

          <form className="grid gap-3 sm:grid-cols-[1fr_10rem_auto]" onSubmit={handleInviteSubmit}>
            <input
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              disabled={!managersOnly}
              name="invite_email"
              placeholder="editor@example.com"
              required
              type="email"
            />
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
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
            <Button disabled={!managersOnly} type="submit">
              Invite member
            </Button>
          </form>

          <div className="grid gap-2">
            {members.map((member) => (
              <div
                className="grid gap-3 rounded-md border border-border/60 p-3 sm:grid-cols-[1fr_auto_auto]"
                key={member.membership_id}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{member.email}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.name}
                  </p>
                </div>
                <select
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
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
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck aria-hidden="true" />
              Security
            </CardTitle>
            <CardDescription>
              Change password or use the development reset outbox.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <form className="grid gap-3" onSubmit={handlePasswordChange}>
              <input
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                name="current_password"
                placeholder="Current password"
                required
                type="password"
              />
              <input
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                minLength={8}
                name="new_password"
                placeholder="New password"
                required
                type="password"
              />
              <Button type="submit">Change password</Button>
            </form>

            <Separator />

            <form className="grid gap-3" onSubmit={handleResetRequest}>
              <input
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                defaultValue={session.user.email}
                name="reset_email"
                required
                type="email"
              />
              <Button type="submit" variant="outline">
                Request development reset
              </Button>
            </form>
            <form className="grid gap-3" onSubmit={handleResetConfirm}>
              <input
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                defaultValue={resetToken ?? ""}
                name="reset_token"
                placeholder="Development reset token"
                required
              />
              <input
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                minLength={8}
                name="reset_new_password"
                placeholder="Reset password"
                required
                type="password"
              />
              <Button type="submit" variant="outline">
                Confirm reset
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="rounded-lg border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>OAuth</CardTitle>
              <CardDescription>
                Provider sign-in is shown honestly and is not wired yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button disabled type="button" variant="outline">
                <Github aria-hidden="true" />
                GitHub Coming soon
              </Button>
              <Button disabled type="button" variant="outline">
                <Mail aria-hidden="true" />
                Google Coming soon
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3">
                Billing
                <Badge variant="outline">Owner only</Badge>
              </CardTitle>
              <CardDescription>
                Billing is a Coming soon placeholder for Owner workspaces.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled type="button" variant="outline">
                Billing Coming soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
