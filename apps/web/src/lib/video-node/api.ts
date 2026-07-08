import type {
  VideoGenerationResponse,
  VideoGenerationSettings,
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

export type RunVideoGenerationOptions = {
  projectId: string;
  nodeId: string;
  prompt: string;
  duration: number;
  imageUrls?: string[];
  videoUrls?: string[];
  audioUrls?: string[];
  settings?: VideoGenerationSettings;
};

export async function runVideoGeneration({
  projectId,
  nodeId,
  prompt,
  duration,
  imageUrls,
  videoUrls,
  audioUrls,
  settings,
}: RunVideoGenerationOptions): Promise<VideoGenerationResponse> {
  return requestJson<VideoGenerationResponse>(
    `/projects/${projectId}/nodes/${nodeId}/generate-video`,
    {
      method: "POST",
      body: JSON.stringify({
        node_type: "video",
        input: {
          prompt,
          duration,
          image_urls: imageUrls ?? [],
          video_urls: videoUrls ?? [],
          audio_urls: audioUrls ?? [],
        },
        settings,
      }),
    },
  );
}
