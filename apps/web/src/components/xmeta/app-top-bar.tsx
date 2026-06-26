import Link from "next/link";
import { Home, UserCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { xmetaLayoutClassNames } from "@/lib/design-system";
import { cn } from "@/lib/utils";

export function AppTopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
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
            <Link href="/tripled-test">TriplD</Link>
          </Button>
        </nav>

        <div className="flex min-w-0 items-center gap-2 rounded-md border border-border/50 bg-background/70 px-2.5 py-1.5 text-xs text-muted-foreground">
          <UserCircle aria-hidden="true" />
          <span className="hidden sm:inline">Studio Admin</span>
          <span className="sm:hidden">Admin</span>
        </div>
      </div>
    </header>
  );
}
