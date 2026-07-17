import type {
  ScriptNodeSettings,
  TextGenerationInputSource,
  TextGenerationResponse,
  TextGenerationTask,
} from "@xmeta/shared-contracts";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const apiBasePath = process.env.NEXT_PUBLIC_API_BASE_PATH ?? "/api/v1";

function endpoint(path: string) {
  return `${apiUrl}${apiBasePath}${path}`;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(endpoint(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      body?.detail ??
      body?.error?.message ??
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export type RunTextGenerationOptions = {
  projectId: string;
  nodeId: string;
  task: TextGenerationTask;
  content: string;
  source: TextGenerationInputSource;
  settings?: ScriptNodeSettings;
};

export async function runTextGeneration({
  projectId,
  nodeId,
  task,
  content,
  source,
  settings,
}: RunTextGenerationOptions): Promise<TextGenerationResponse> {
  return requestJson<TextGenerationResponse>(
    `/projects/${projectId}/nodes/${nodeId}/generate-text`,
    {
      method: "POST",
      body: JSON.stringify({
        task,
        input: { content, source },
        settings,
      }),
    },
  );
}
