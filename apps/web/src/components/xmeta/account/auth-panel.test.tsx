import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthPanel } from "./auth-panel";
import { WorkspaceSelector } from "./workspace-selector";

vi.mock("@/lib/auth/api", () => ({
  loginAccount: vi.fn(),
  registerAccount: vi.fn(),
}));

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

function expectDisabledButton(html: string, label: string) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(
    new RegExp(`<button[^>]*>[\\s\\S]*?${escapedLabel}[\\s\\S]*?</button>`),
  );

  expect(match).not.toBeNull();
  expect(match?.[0]).toContain('disabled=""');
}

function expectDisabledInput(html: string, name: string) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(`<input[^>]*name="${escapedName}"[^>]*>`));

  expect(match).not.toBeNull();
  expect(match?.[0]).toContain('disabled=""');
}

function expectEnabledInput(html: string, name: string) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(`<input[^>]*name="${escapedName}"[^>]*>`));

  expect(match).not.toBeNull();
  expect(match?.[0]).not.toContain("disabled");
}

function expectEnabledButton(html: string, label: string) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(
    new RegExp(`<button[^>]*>[\\s\\S]*?${escapedLabel}[\\s\\S]*?</button>`),
  );

  expect(match).not.toBeNull();
  expect(match?.[0]).not.toContain('disabled=""');
}

describe("AuthPanel", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders login and registration forms plus disabled OAuth coming soon actions", () => {
    const html = renderToStaticMarkup(<AuthPanel mode="register" />);

    expect(html).toContain("Create your X-META account");
    expect(html).toContain('name="email"');
    expect(html).toContain('name="password"');
    expect(html).toContain('name="confirm_password"');
    expect(html).toContain("Create a temporary account with name and password");
    expect(html).toContain("Email Coming soon");
    expectEnabledInput(html, "name");
    expectDisabledInput(html, "email");
    expectEnabledInput(html, "password");
    expectEnabledInput(html, "confirm_password");
    expectEnabledButton(html, "Create account");
    expect(html).toContain("Show password");
    expect(html).toContain("Show confirm password");
    expect(html).not.toContain('name="workspace_name"');
    expect(html).not.toContain("Workspace name");
    expect(html).toContain("GitHub");
    expect(html).toContain("Google");
    expect(html).toContain("Coming soon");
    expectDisabledButton(html, "GitHub Coming soon");
    expectDisabledButton(html, "Google Coming soon");
    expect(html).toContain("Email, GitHub, and Google account identifiers");
  });

  it("renders login with editable name and password but disabled email", () => {
    const html = renderToStaticMarkup(<AuthPanel mode="login" />);

    expect(html).toContain("Sign in to X-META");
    expect(html).toContain("Sign in with name and password");
    expect(html).toContain('name="name"');
    expect(html).toContain('name="email"');
    expect(html).toContain('name="password"');
    expectEnabledInput(html, "name");
    expectDisabledInput(html, "email");
    expectEnabledInput(html, "password");
    expectEnabledButton(html, "Sign in");
  });
});

describe("WorkspaceSelector", () => {
  it("renders backend workspace memberships and active account context", () => {
    const html = renderToStaticMarkup(
      <WorkspaceSelector
        session={session}
        workspaces={[
          session.active_organization,
          { org_id: "org-2", name: "Client Studio", role: "editor" },
        ]}
      />,
    );

    expect(html).toContain("Creator Studio");
    expect(html).toContain("owner");
    expect(html).toContain("Client Studio");
    expect(html).toContain("editor");
    expect(html).toContain("Enter Canvas");
  });
});
