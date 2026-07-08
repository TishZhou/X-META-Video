import { afterEach, describe, expect, it, vi } from "vitest";

import {
  changeAccountPassword,
  confirmPasswordReset,
  getCurrentAccount,
  inviteAccountMember,
  listWorkspaces,
  loginAccount,
  registerAccount,
  removeAccountMember,
  requestPasswordReset,
  selectWorkspace,
  updateAccountMemberRole,
  updateAccountProfile,
  updateWorkspaceSettings,
  listAccountMembers,
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
    const registerInit = fetchMock.mock.calls[1]?.[1] as RequestInit;
    const registerBody = JSON.parse(String(registerInit.body));

    expect(registerBody).toEqual({
      email: "new@example.com",
      password: "password123",
      name: "New Creator",
    });
    expect(registerBody).not.toHaveProperty("workspace_name");
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

  it("sends account center requests with session credentials", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ members: [] }),
      } as Response);

    await updateAccountProfile({ name: "Creator Prime" });
    await updateWorkspaceSettings({ name: "Prime Studio" });
    await listAccountMembers();
    await inviteAccountMember({ email: "editor@example.com" });
    await updateAccountMemberRole("member-2", { role: "viewer" });
    await removeAccountMember("member-2");
    await changeAccountPassword({
      current_password: "password123",
      new_password: "password456",
    });
    await requestPasswordReset({ email: "creator@example.com" });
    await confirmPasswordReset({
      token: "reset-token",
      new_password: "password789",
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://localhost:8000/api/v1/account/profile",
      expect.objectContaining({
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({ name: "Creator Prime" }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8000/api/v1/account/workspace",
      expect.objectContaining({
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({ name: "Prime Studio" }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "http://localhost:8000/api/v1/account/members",
      expect.objectContaining({ credentials: "include" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "http://localhost:8000/api/v1/account/invites",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email: "editor@example.com" }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      5,
      "http://localhost:8000/api/v1/account/members/member-2",
      expect.objectContaining({
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({ role: "viewer" }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      6,
      "http://localhost:8000/api/v1/account/members/member-2",
      expect.objectContaining({
        method: "DELETE",
        credentials: "include",
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      7,
      "http://localhost:8000/api/v1/account/password/change",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      8,
      "http://localhost:8000/api/v1/account/password/reset/request",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      9,
      "http://localhost:8000/api/v1/account/password/reset/confirm",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    );
  });
});
