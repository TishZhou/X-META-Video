import type { Metadata } from "next";

import { AuthPanel } from "@/components/xmeta/account/auth-panel";

export const metadata: Metadata = {
  title: "Sign in | X-META Video",
  description: "Sign in to your X-META Video workspace.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <AuthPanel mode="login" />
    </div>
  );
}
