import type {
  ImageGenerationNodeType,
  ImageGenerationResponse,
  ImageGenerationSettings,
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

export type RunImageGenerationOptions = {
  projectId: string;
  nodeId: string;
  nodeType: ImageGenerationNodeType;
  prompt: string;
  settings?: ImageGenerationSettings;
};

export async function runImageGeneration({
  projectId,
  nodeId,
  nodeType,
  prompt,
  settings,
}: RunImageGenerationOptions): Promise<ImageGenerationResponse> {
  return requestJson<ImageGenerationResponse>(
    `/projects/${projectId}/nodes/${nodeId}/generate-image`,
    {
      method: "POST",
      body: JSON.stringify({
        node_type: nodeType,
        input: { prompt },
        settings,
      }),
    },
  );
}
