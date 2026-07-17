import { describe, expect, it } from "vitest";

import {
  connectPorts,
  createInitialWorkflowGraphState,
  createWorkflowOutputNodeId,
  createWorkflowSnapshot,
  workflowGraphReducer,
} from "./graph";

describe("workflow graph state", () => {
  it("frames the default three-node graph within a 1280px desktop canvas", () => {
    const state = createInitialWorkflowGraphState();
    const nodeWidth = 288;
    const portReach = 10;
    const composition = state.nodes.find((node) => node.type === "composition");
    const left = Math.min(...state.nodes.map((node) => node.position.x));
    const right = Math.max(
      ...state.nodes.map((node) => node.position.x + nodeWidth + portReach),
    );

    expect(state.nodes.map((node) => node.type)).toEqual([
      "script",
      "storyboard",
      "composition",
    ]);
    expect(composition?.position.x).toBeLessThanOrEqual(840);
    expect(left).toBeGreaterThanOrEqual(120);
    expect(right).toBeLessThanOrEqual(1160);
  });

  it("adds, selects, moves, and deletes placeholder nodes deterministically", () => {
    const initial = createInitialWorkflowGraphState();
    const added = workflowGraphReducer(initial, {
      type: "addNode",
      nodeType: "audio",
      position: { x: 240, y: 320 },
    });

    expect(added.nodes).toHaveLength(initial.nodes.length + 1);
    expect(added.selection).toEqual({ kind: "node", id: "audio-4" });
    expect(added.notice).toContain("Generation is deferred");

    const moved = workflowGraphReducer(added, {
      type: "moveNode",
      nodeId: "audio-4",
      position: { x: 360, y: 420 },
    });

    expect(moved.nodes.find((node) => node.id === "audio-4")?.position).toEqual({
      x: 360,
      y: 420,
    });

    const deleted = workflowGraphReducer(moved, { type: "deleteSelection" });

    expect(deleted.nodes.some((node) => node.id === "audio-4")).toBe(false);
    expect(deleted.selection).toEqual({ kind: "empty" });
  });

  it("creates compatible first-class edges and rejects duplicates or invalid ports", () => {
    const state = createInitialWorkflowGraphState();
    const scriptOutput = "script-1:script-out";
    const storyboardInput = "storyboard-2:script-in";
    const sceneInput = "composition-3:scene-in";

    const duplicate = connectPorts(
      state.nodes,
      state.edges,
      scriptOutput,
      storyboardInput,
      state.nextEdgeIndex,
    );

    expect(duplicate).toEqual({ ok: false, reason: "That connection already exists." });

    const invalid = connectPorts(
      state.nodes,
      state.edges,
      scriptOutput,
      sceneInput,
      state.nextEdgeIndex,
    );

    expect(invalid.ok).toBe(false);
    if (invalid.ok) {
      throw new Error("Expected incompatible ports to be rejected.");
    }
    expect(invalid.reason).toContain("cannot connect");

    const image = workflowGraphReducer(state, {
      type: "addNode",
      nodeType: "image",
      position: { x: 180, y: 300 },
    });
    const connected = workflowGraphReducer(image, {
      type: "connect",
      sourcePortId: "script-1:script-out",
      targetPortId: "image-4:image-prompt-in",
    });

    expect(connected.edges.at(-1)).toMatchObject({
      id: "edge-3",
      sourceNodeId: "script-1",
      sourcePortId: "script-1:script-out",
      targetNodeId: "image-4",
      targetPortId: "image-4:image-prompt-in",
      dataType: "script",
    });
    expect(connected.notice).toContain("No generation task was started");
  });

  it("allows Script text outcomes to feed Image nodes", () => {
    const state = createInitialWorkflowGraphState();
    const withScriptOutcome = workflowGraphReducer(state, {
      type: "upsertOutputNode",
      sourceNodeId: "script-1",
      nodeType: "script",
      title: "Script outcome",
      description: "Editable structured script generated from the Script node.",
      position: { x: 500, y: 120 },
      output: {
        sourceNodeId: "script-1",
        dataType: "script",
        label: "Script output",
        provider: "openai",
        model: "gpt-live",
        editable: true,
      },
      ports: [
        {
          key: "script-out",
          label: "Script",
          direction: "output",
          dataType: "script",
        },
      ],
    });
    const withImage = workflowGraphReducer(withScriptOutcome, {
      type: "addNode",
      nodeType: "image",
      position: { x: 820, y: 120 },
    });
    const scriptOutcomeNodeId = createWorkflowOutputNodeId("script-1", "script");
    const connected = workflowGraphReducer(withImage, {
      type: "connect",
      sourcePortId: `${scriptOutcomeNodeId}:script-out`,
      targetPortId: "image-4:image-prompt-in",
    });

    expect(connected.edges.at(-1)).toMatchObject({
      sourceNodeId: scriptOutcomeNodeId,
      targetNodeId: "image-4",
      dataType: "script",
    });
  });

  it("upserts reusable output nodes with editable output metadata", () => {
    const state = createInitialWorkflowGraphState();
    const outputNodeId = createWorkflowOutputNodeId("script-1", "script");
    const withOutput = workflowGraphReducer(state, {
      type: "upsertOutputNode",
      sourceNodeId: "script-1",
      nodeType: "script",
      title: "Script outcome",
      description: "Editable structured script generated from the Script node.",
      position: { x: 500, y: 120 },
      output: {
        sourceNodeId: "script-1",
        dataType: "script",
        label: "Script output",
        provider: "openai",
        model: "gpt-live",
        editable: true,
      },
      ports: [
        {
          key: "script-out",
          label: "Script",
          direction: "output",
          dataType: "script",
        },
      ],
    });

    expect(withOutput.nodes).toHaveLength(state.nodes.length + 1);
    expect(withOutput.edges).toHaveLength(state.edges.length + 1);
    expect(withOutput.edges.at(-1)).toMatchObject({
      sourceNodeId: "script-1",
      sourcePortId: "script-1:script-out",
      targetNodeId: outputNodeId,
      targetPortId: `${outputNodeId}:source-in`,
      dataType: "script",
    });
    expect(withOutput.selection).toEqual({ kind: "node", id: outputNodeId });
    expect(withOutput.nodes.find((node) => node.id === outputNodeId)).toMatchObject({
      role: "outcome",
      title: "Script outcome",
      output: {
        sourceNodeId: "script-1",
        dataType: "script",
        provider: "openai",
        model: "gpt-live",
        editable: true,
      },
      ports: [
        {
          id: `${outputNodeId}:source-in`,
          nodeId: outputNodeId,
          dataType: "script",
          direction: "input",
        },
        {
          id: `${outputNodeId}:script-out`,
          nodeId: outputNodeId,
          dataType: "script",
          direction: "output",
        },
      ],
    });

    const updated = workflowGraphReducer(withOutput, {
      type: "upsertOutputNode",
      sourceNodeId: "script-1",
      nodeType: "script",
      title: "Updated Script outcome",
      description: "Updated structured script output.",
      position: { x: 999, y: 999 },
      output: {
        sourceNodeId: "script-1",
        dataType: "script",
        label: "Script output",
        provider: "openai-compatible",
        model: "gpt-5.4-mini",
        editable: true,
      },
      ports: [
        {
          key: "script-out",
          label: "Script",
          direction: "output",
          dataType: "script",
        },
      ],
    });

    expect(updated.nodes).toHaveLength(withOutput.nodes.length);
    expect(updated.edges).toHaveLength(withOutput.edges.length);
    expect(updated.nextEdgeIndex).toBe(withOutput.nextEdgeIndex);
    expect(updated.nodes.find((node) => node.id === outputNodeId)).toMatchObject({
      title: "Updated Script outcome",
      position: { x: 500, y: 120 },
      output: {
        provider: "openai-compatible",
        model: "gpt-5.4-mini",
      },
    });
  });

  it("rejects stale connection requests that reference missing ports", () => {
    const state = createInitialWorkflowGraphState();
    const result = connectPorts(
      state.nodes,
      state.edges,
      "script-1:missing-output",
      "storyboard-2:script-in",
      state.nextEdgeIndex,
    );

    expect(result).toEqual({
      ok: false,
      reason:
        "That connection references a missing port. Refresh the canvas state and try again.",
    });
  });

  it("round-trips structured snapshots without DOM HTML", () => {
    const state = workflowGraphReducer(createInitialWorkflowGraphState(), {
      type: "addNode",
      nodeType: "export",
      position: { x: 960, y: 260 },
    });
    const snapshot = createWorkflowSnapshot(state);
    const saved = workflowGraphReducer(state, { type: "saveSnapshot" });
    const restored = workflowGraphReducer(
      {
        ...saved,
        nodes: [],
        edges: [],
        selection: { kind: "empty" },
      },
      { type: "restoreSnapshot", snapshot },
    );

    expect(snapshot).not.toHaveProperty("html");
    expect(JSON.stringify(snapshot)).not.toContain("<div");
    expect(restored.nodes).toEqual(snapshot.nodes);
    expect(restored.edges).toEqual(snapshot.edges);
    expect(restored.draftStatus).toBe("restored");
  });
});
