import type { Metadata } from "next";

import { AuthPanel } from "@/components/xmeta/account/auth-panel";

export const metadata: Metadata = {
  title: "Create account | X-META Video",
  description: "Create an X-META Video account and workspace.",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <AuthPanel mode="register" />
    </div>
  );
}
