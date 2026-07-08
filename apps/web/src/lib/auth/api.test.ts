import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getCurrentAccount,
  listWorkspaces,
  loginAccount,
  registerAccount,
  selectWorkspace,
} from "./api";

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

describe("auth api client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends login and registration requests with HttpOnly cookie credentials", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({
        ok: true,
        json: async () => session,
      } as Response);

    await loginAccount({ email: "creator@example.com", password: "password123" });
    await registerAccount({
      email: "new@example.com",
      password: "password123",
      name: "New Creator",
      workspace_name: "New Studio",
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://localhost:8000/api/v1/auth/login",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8000/api/v1/auth/register",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    );
  });

  it("loads account state and selects workspaces with session credentials", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({
        ok: true,
        json: async () => ({ organizations: [session.active_organization] }),
      } as Response);

    await listWorkspaces();
    await getCurrentAccount().catch(() => undefined);
    await selectWorkspace("org-1").catch(() => undefined);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://localhost:8000/api/v1/accounts",
      expect.objectContaining({ credentials: "include" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8000/api/v1/auth/me",
      expect.objectContaining({ credentials: "include" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "http://localhost:8000/api/v1/accounts/active",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ org_id: "org-1" }),
      }),
    );
  });
});
