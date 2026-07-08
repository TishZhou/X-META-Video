"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Github, Mail } from "lucide-react";

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

function emailFromName(name: string) {
  const trimmedName = name.trim();
  const slug = trimmedName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (slug.length > 0) {
    return `${slug}@xmeta.local`;
  }

  let hash = 0;
  for (const character of trimmedName) {
    hash = (hash * 31 + (character.codePointAt(0) ?? 0)) >>> 0;
  }

  return `user-${hash.toString(16)}@xmeta.local`;
}

export function AuthPanel({ mode }: AuthPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isRegister = mode === "register";
  const isEmailInputAvailable = false;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const form = event.currentTarget;
      const name = getFormValue(form, "name");
      const email = emailFromName(name);

      if (isRegister) {
        const password = getFormValue(form, "password");
        const confirmPassword = getFormValue(form, "confirm_password");

        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        await registerAccount({
          email,
          password,
          name,
        });
      } else {
        await loginAccount({
          email,
          password: getFormValue(form, "password"),
        });
      }

      globalThis.localStorage?.setItem("xmeta_has_account_session", "true");
      globalThis.window?.location.assign("/account");
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
            ? "Create a temporary account with name and password. Email entry opens later."
            : "Sign in with name and password. Email entry opens later."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Name
            <input
              autoComplete="username"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
              name="name"
              required
              type="text"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Email
            <input
              autoComplete="email"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
              disabled={!isEmailInputAvailable}
              name="email"
              placeholder="Email Coming soon"
              type="email"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Password
            <span className="flex h-10 overflow-hidden rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring">
              <input
                autoComplete={isRegister ? "new-password" : "current-password"}
                className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
                minLength={isRegister ? 8 : 1}
                name="password"
                required
                type={showPassword ? "text" : "password"}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((value) => !value)}
                type="button"
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" />
                ) : (
                  <Eye aria-hidden="true" />
                )}
              </button>
            </span>
          </label>

          {isRegister ? (
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Confirm password
              <span className="flex h-10 overflow-hidden rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring">
                <input
                  autoComplete="new-password"
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
                  minLength={8}
                  name="confirm_password"
                  required
                  type={showConfirmPassword ? "text" : "password"}
                />
                <button
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  className="flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  type="button"
                >
                  {showConfirmPassword ? (
                    <EyeOff aria-hidden="true" />
                  ) : (
                    <Eye aria-hidden="true" />
                  )}
                </button>
              </span>
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
            Email, GitHub, and Google account identifiers are not user-editable
            yet. Use name and password for this auth slice.
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
