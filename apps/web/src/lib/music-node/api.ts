import type {
  MusicGenerationNodeType,
  MusicGenerationResponse,
  MusicGenerationSettings,
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

export type RunMusicGenerationOptions = {
  projectId: string;
  nodeId: string;
  nodeType?: MusicGenerationNodeType;
  prompt: string;
  lyrics: string;
  settings?: MusicGenerationSettings;
};

export async function runMusicGeneration({
  projectId,
  nodeId,
  nodeType = "audio",
  prompt,
  lyrics,
  settings,
}: RunMusicGenerationOptions): Promise<MusicGenerationResponse> {
  return requestJson<MusicGenerationResponse>(
    `/projects/${projectId}/nodes/${nodeId}/generate-audio`,
    {
      method: "POST",
      body: JSON.stringify({
        node_type: nodeType,
        input: { prompt, lyrics },
        settings,
      }),
    },
  );
}
