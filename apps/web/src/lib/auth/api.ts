import type {
  AccountsResponse,
  ActiveAccountRequest,
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthSessionResponse,
} from "@xmeta/shared-contracts";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const apiBasePath = process.env.NEXT_PUBLIC_API_BASE_PATH ?? "/api/v1";

function endpoint(path: string) {
  return `${apiUrl}${apiBasePath}${path}`;
}

async function parseError(response: Response) {
  const body = await response.json().catch(() => null);

  if (typeof body?.detail === "string") {
    return body.detail;
  }

  if (typeof body?.error?.message === "string") {
    return body.error.message;
  }

  return `Request failed with status ${response.status}`;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(endpoint(path), {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function loginAccount(payload: AuthLoginRequest) {
  return requestJson<AuthSessionResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function registerAccount(payload: AuthRegisterRequest) {
  return requestJson<AuthSessionResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCurrentAccount() {
  return requestJson<AuthSessionResponse>("/auth/me");
}

export function listWorkspaces() {
  return requestJson<AccountsResponse>("/accounts");
}

export function selectWorkspace(orgId: string) {
  const payload: ActiveAccountRequest = { org_id: orgId };

  return requestJson<AuthSessionResponse>("/accounts/active", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logoutAccount() {
  return requestJson<void>("/auth/logout", {
    method: "POST",
  });
}
