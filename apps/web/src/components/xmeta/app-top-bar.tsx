import Link from "next/link";
import { Home, UserCircle } from "lucide-react";
import type { AuthSessionResponse } from "@xmeta/shared-contracts";

import { Button } from "@/components/ui/button";
import { xmetaLayoutClassNames } from "@/lib/design-system";
import { cn } from "@/lib/utils";

type AppTopBarProps = {
  account?: AuthSessionResponse | null;
};

export function AppTopBar({ account }: AppTopBarProps) {
  return (
    <header
      className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl"
      data-xmeta-top-bar="true"
    >
      <div
        className={cn(
          xmetaLayoutClassNames.appChrome,
          "flex h-14 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 xl:px-10",
        )}
      >
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 text-sm font-semibold tracking-normal text-foreground"
        >
          <span className="flex size-8 items-center justify-center rounded-md border border-border/60 bg-background/80">
            <Home aria-hidden="true" />
          </span>
          <span className="truncate">X-META Video</span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 text-sm text-muted-foreground sm:flex"
        >
          <Button asChild variant="ghost" size="sm">
            <Link href="/">Home</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a href="/#creation-entries">Studio</a>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/workspace">Workspace</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/tripled-test">TriplD</Link>
          </Button>
        </nav>

        {account ? (
          <Link
            className="flex min-w-0 items-center gap-2 rounded-md border border-border/50 bg-background/70 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            href="/account"
          >
            <UserCircle aria-hidden="true" />
            <span className="hidden max-w-44 truncate sm:inline">
              {account.user.email}
            </span>
            <span className="max-w-28 truncate">
              {account.active_organization.name}
            </span>
            <span className="rounded-md border border-border/60 px-1.5 py-0.5">
              {account.active_organization.role}
            </span>
          </Link>
        ) : (
          <Button asChild size="sm" variant="outline">
            <Link href="/account/login">
              <UserCircle aria-hidden="true" />
              Sign in
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
