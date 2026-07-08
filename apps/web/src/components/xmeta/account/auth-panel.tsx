"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Github, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { loginAccount, registerAccount } from "@/lib/auth/api";
import { cn } from "@/lib/utils";

type AuthPanelProps = {
  mode: "login" | "register";
};

function getFormValue(form: HTMLFormElement, name: string) {
  return String(new FormData(form).get(name) ?? "").trim();
}

export function AuthPanel({ mode }: AuthPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const form = event.currentTarget;

      if (isRegister) {
        await registerAccount({
          email: getFormValue(form, "email"),
          password: getFormValue(form, "password"),
          name: getFormValue(form, "name"),
          workspace_name: getFormValue(form, "workspace_name"),
        });
      } else {
        await loginAccount({
          email: getFormValue(form, "email"),
          password: getFormValue(form, "password"),
        });
      }

      globalThis.localStorage?.setItem("xmeta_has_account_session", "true");
      globalThis.window?.location.assign("/account/workspaces");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Account request failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md rounded-lg border-border/60 bg-card/95 shadow-sm">
      <CardHeader className="gap-2">
        <CardTitle className="text-2xl">
          {isRegister ? "Create your X-META account" : "Sign in to X-META"}
        </CardTitle>
        <CardDescription>
          {isRegister
            ? "Register with email and create your first workspace."
            : "Use your email and password to continue to your workspace."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {isRegister ? (
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Name
              <input
                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                name="name"
                required
                type="text"
              />
            </label>
          ) : null}

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Email
            <input
              autoComplete="email"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
              name="email"
              required
              type="email"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Password
            <input
              autoComplete={isRegister ? "new-password" : "current-password"}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
              minLength={isRegister ? 8 : 1}
              name="password"
              required
              type="password"
            />
          </label>

          {isRegister ? (
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Workspace name
              <input
                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                name="workspace_name"
                required
                type="text"
              />
            </label>
          ) : null}

          {error ? (
            <p
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <Button disabled={isSubmitting} type="submit">
            {isSubmitting
              ? "Submitting..."
              : isRegister
                ? "Create account"
                : "Sign in"}
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">Provider login</span>
          <Separator className="flex-1" />
        </div>

        <div className="grid gap-2">
          <Button disabled type="button" variant="outline">
            <Github aria-hidden="true" />
            GitHub Coming soon
          </Button>
          <Button disabled type="button" variant="outline">
            <Mail aria-hidden="true" />
            Google Coming soon
          </Button>
          <p className="text-xs leading-5 text-muted-foreground">
            Provider login is not implemented yet. Use email and password for
            this auth slice.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          {isRegister ? "Already have an account?" : "Need an account?"}{" "}
          <Link
            className={cn("font-medium text-primary hover:underline")}
            href={isRegister ? "/account/login" : "/account/register"}
          >
            {isRegister ? "Sign in" : "Create one"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
