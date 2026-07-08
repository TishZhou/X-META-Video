import type { Metadata } from "next";

import { AccountCenter } from "@/components/xmeta/account/account-center";

export const metadata: Metadata = {
  title: "Account center | X-META Video",
  description: "Manage your X-META Video account and workspace.",
};

export default function AccountPage() {
  return <AccountCenter />;
}
