import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AppTopBar } from "./app-top-bar";

describe("AppTopBar", () => {
  it("renders reusable page navigation and a truthful unauthenticated account entry", () => {
    const html = renderToStaticMarkup(<AppTopBar />);

    expect(html).toContain("X-META Video");
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/#creation-entries"');
    expect(html).toContain('href="/tripled-test"');
    expect(html).toContain('href="/account/login"');
    expect(html).toContain("Sign in");
    expect(html).not.toContain("Studio Admin");
  });

  it("renders real account, workspace, and role state when provided", () => {
    const html = renderToStaticMarkup(
      <AppTopBar
        account={{
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
        }}
      />,
    );

    expect(html).toContain("creator@example.com");
    expect(html).toContain("Creator Studio");
    expect(html).toContain("owner");
    expect(html).not.toContain("Studio Admin");
  });
});
