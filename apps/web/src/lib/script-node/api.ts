import type {
  ScriptNodeInput,
  ScriptNodeOutput,
  ScriptNodeSaveRequest,
  ScriptNodeSettings,
  ScriptNodeStateResponse,
  ScriptTaskResultResponse,
  ScriptTaskStatusResponse,
  TaskResponse,
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

export type SaveScriptNodeInput = {
  projectId: string;
  nodeId: string;
  input: ScriptNodeInput;
  settings?: ScriptNodeSettings;
  baseVersion?: number;
};

export async function saveScriptNodeInput({
  projectId,
  nodeId,
  input,
  settings,
  baseVersion,
}: SaveScriptNodeInput) {
  const payload: ScriptNodeSaveRequest = {
    input,
    settings,
    base_version: baseVersion,
  };

  return requestJson<ScriptNodeStateResponse>(
    `/projects/${projectId}/nodes/${nodeId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function runScriptNode(projectId: string, nodeId: string) {
  return requestJson<TaskResponse>(`/projects/${projectId}/nodes/${nodeId}/run`, {
    method: "POST",
    body: JSON.stringify({ node_type: "script" }),
  });
}

export async function getScriptTaskStatus(taskId: string) {
  return requestJson<ScriptTaskStatusResponse>(`/tasks/${taskId}`);
}

export async function getScriptTaskResult(taskId: string) {
  return requestJson<ScriptTaskResultResponse>(`/tasks/${taskId}/result`);
}

export type RunScriptGenerationOptions = {
  projectId: string;
  nodeId: string;
  input: ScriptNodeInput;
  settings?: ScriptNodeSettings;
};

export async function runScriptGeneration({
  projectId,
  nodeId,
  input,
  settings,
}: RunScriptGenerationOptions): Promise<{
  task: ScriptTaskStatusResponse;
  output: ScriptNodeOutput;
}> {
  await saveScriptNodeInput({ projectId, nodeId, input, settings });
  const task = await runScriptNode(projectId, nodeId);
  const status = await getScriptTaskStatus(task.task_id);
  const result = await getScriptTaskResult(task.task_id);

  if (result.status !== "succeeded" || !result.output) {
    throw new Error(result.error ?? "Script generation did not return output.");
  }

  return {
    task: status,
    output: result.output,
  };
}
