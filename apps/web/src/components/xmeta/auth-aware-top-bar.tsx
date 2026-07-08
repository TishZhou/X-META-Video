"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { AuthSessionResponse } from "@xmeta/shared-contracts";

import { getCurrentAccount } from "@/lib/auth/api";

import { AppTopBar } from "./app-top-bar";

export function AuthAwareTopBar() {
  const [account, setAccount] = useState<AuthSessionResponse | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;
    const shouldCheckSession =
      pathname === "/account/workspaces" ||
      globalThis.localStorage?.getItem("xmeta_has_account_session") === "true";

    if (!shouldCheckSession) {
      setAccount(null);
      return undefined;
    }

    async function loadAccount() {
      try {
        const session = await getCurrentAccount();

        if (isMounted) {
          setAccount(session);
          globalThis.localStorage?.setItem("xmeta_has_account_session", "true");
        }
      } catch {
        if (isMounted) {
          setAccount(null);
          globalThis.localStorage?.removeItem("xmeta_has_account_session");
        }
      }
    }

    void loadAccount();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  return <AppTopBar account={account} />;
}
