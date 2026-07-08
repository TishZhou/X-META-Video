import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AccountCenter } from "./account-center";

const session = {
  user: {
    user_id: "user-1",
    email: "creator@example.com",
    name: "Creator",
  },
  active_organization: {
    org_id: "org-1",
    name: "Creator Studio",
    role: "owner",
  },
};

const members = [
  {
    membership_id: "member-1",
    user_id: "user-1",
    email: "creator@example.com",
    name: "Creator",
    role: "owner",
  },
  {
    membership_id: "member-2",
    user_id: "user-2",
    email: "editor@example.com",
    name: "Editor",
    role: "editor",
  },
] as const;

describe("AccountCenter", () => {
  it("renders the full account center MVP with honest placeholders", () => {
    const html = renderToStaticMarkup(
      <AccountCenter initialMembers={members} initialSession={session} />,
    );

    expect(html).toContain("Account center");
    expect(html).toContain("Profile");
    expect(html).toContain("Workspace settings");
    expect(html).toContain("Members");
    expect(html).toContain("editor@example.com");
    expect(html).toContain("Invite member");
    expect(html).toContain("Security");
    expect(html).toContain("Change password");
    expect(html).toContain("OAuth");
    expect(html).toContain("Coming soon");
    expect(html).toContain("Billing");
    expect(html).toContain("Owner only");
    expect(html).toContain("Sign out");
  });

  it("renders non-manager sessions with unavailable member and billing controls", () => {
    const html = renderToStaticMarkup(
      <AccountCenter
        initialMembers={[]}
        initialSession={{
          ...session,
          active_organization: {
            ...session.active_organization,
            role: "viewer",
          },
        }}
      />,
    );

    expect(html).toContain("Account center");
    expect(html).toContain("viewer access");
    expect(html).toContain("Members");
    expect(html).toContain("Owner or Admin role is required");
    expect(html).toContain("Billing Coming soon");
    expect(html).toContain("disabled");
    expect(html).not.toContain("Account required");
  });
});
