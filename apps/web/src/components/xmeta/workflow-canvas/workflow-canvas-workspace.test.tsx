import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type {
  ScriptDialogueMessage,
  ScriptNodeOutput,
  ScriptTaskStatusResponse,
} from "@xmeta/shared-contracts";

import {
  createInitialWorkflowGraphState,
  workflowNodeTemplates,
} from "@/lib/workflow-canvas/graph";

import {
  calculateDraggedNodePosition,
  clampImageEditorFrame,
  createScriptBackendExecution,
  formatScriptBackendExecutionLabel,
  formatScriptOutputConversationReply,
  formatScriptNodePreview,
  formatTemplateIoLabel,
  getInlineEditorCompensationScale,
  getScriptResponseModeForAction,
  getScriptResponseStatusLabel,
  ImageNodeFloatingEditor,
  isEditableKeyboardTarget,
  isFloatingImageEditorNodeType,
  ScriptOutputTabs,
  WorkflowCanvasWorkspace,
} from "./workflow-canvas-workspace";

function makeScriptOutput(): ScriptNodeOutput {
  return {
    title: "Mock Script Title",
    agent_output: "Agent generated answer for the chat history.",
    world_overview: "A structured MV world summary.",
    storyboard_direction: {
      pov: "third-person cinematic POV",
      visual_rhythm: "soft opening, travel beat, neon performance payoff",
      shots: [
        {
          shot_number: 1,
          pov: "third-person observer",
          framing: "wide frame",
          action: "Reveal the world.",
          camera_movement: "Push in.",
          duration_seconds: 8,
        },
      ],
    },
    characters: [
      {
        name: "Lead",
        overview: "Sweet visual direction",
        style: "soft idol styling",
        clothing: "white jacket",
        height: "165 cm",
        appearance: "bright eyes",
        personality: "Decisive",
        visual_prompt: "Strong silhouette",
      },
    ],
    scene_descriptions: [
      {
        scene_number: 1,
        shot_reference: 1,
        characters: ["Lead"],
        location: "desert jeep",
        description: "A concrete scene description.",
        visual_prompt: "Opening frame",
      },
    ],
    missing_inputs: [],
  };
}

describe("WorkflowCanvasWorkspace", () => {
  it("renders the workspace route regions and honest deferred states", () => {
    const html = renderToStaticMarkup(<WorkflowCanvasWorkspace />);

    expect(html).toContain("Untitled project");
    expect(html).toContain("Canvas 1");
    expect(html).toContain('data-workflow-canvas="viewport"');
    expect(html).toContain('data-workspace-bottom-toolbar="true"');
    expect(html).toContain('data-workspace-boundary-label="true"');
    expect(html).toContain("Local workflow only");
    expect(html).toContain("Script AI enabled");
    expect(html).toContain("media AI and persistence deferred");
    expect(html).not.toContain("AI disabled");
    expect(html).not.toContain("Node palette");
    expect(html).not.toContain("Inspector");
  });

  it("keeps node creation behind one bottom add entry", () => {
    const html = renderToStaticMarkup(<WorkflowCanvasWorkspace />);

    expect(html).toContain('aria-label="Add node"');
    expect(html).toContain('data-workspace-bottom-toolbar="true"');
    expect(html).toContain('aria-label="Canvas zoom"');
    expect(html).toContain('data-workspace-zoom-range="true"');
    expect(html).toContain('type="range"');
    expect(html).toContain('min="50"');
    expect(html).toContain('max="140"');
    expect(html).toContain('step="1"');
    expect(html).not.toContain('aria-label="Select"');
    expect(html).not.toContain('aria-label="Move"');
    expect(html).not.toContain('aria-label="Fit view"');
    expect(html).not.toContain('aria-label="Zoom in"');
    expect(html).not.toContain('aria-label="Zoom out"');
    expect(html).not.toContain('data-workspace-add-menu="true"');
    expect(html).not.toContain("Node palette");
    expect(html).not.toContain("Quick add");
  });

  it("formats add-node menu labels with explicit input and output flow", () => {
    const audioTemplate = workflowNodeTemplates.find(
      (template) => template.type === "audio",
    );
    const videoTemplate = workflowNodeTemplates.find(
      (template) => template.type === "video",
    );

    expect(audioTemplate).toBeDefined();
    expect(videoTemplate).toBeDefined();
    expect(formatTemplateIoLabel(audioTemplate!)).toBe(
      "Audio: Input Dialogue -> Output Audio",
    );
    expect(formatTemplateIoLabel(videoTemplate!)).toBe(
      "Video: Input Image + Audio -> Output Video",
    );
  });

  it("renders initial typed graph nodes and the selected Script node inline input", () => {
    const html = renderToStaticMarkup(<WorkflowCanvasWorkspace />);

    expect(html).toContain('data-workflow-node="script"');
    expect(html).toContain('data-workflow-node="storyboard"');
    expect(html).toContain('data-workflow-node="composition"');
    expect(html).toContain("Workflow connections");
    expect(html).toContain("World view");
    expect(html).toContain(
      "\u751f\u6210\u4e00\u4e2a\u51b0\u96ea\u76f8\u5173\u7684mv\u7684\u4e16\u754c\u89c2",
    );
    expect(html).not.toContain("Script Node API Ready");
    expect(html).toContain('data-script-node-inline-editor="true"');
    expect(html).toContain('data-script-node-input-composer="true"');
    expect(html).toContain('data-script-model-select="true"');
    expect(html).toContain("Server configured model");
    expect(html).toContain("Mock backend model");
    expect(html).not.toContain("gpt-5.4-mini");
    expect(html).toContain('data-script-ai-revise="true"');
    expect(html).toContain(
      "\u63cf\u8ff0\u4f60\u7684\u5267\u60c5\u7247\u6bb5\u3001\u6545\u4e8b\u548c\u4e16\u754c\u89c2\u6784\u60f3",
    );
    expect(html).toContain("AI\u4fee\u6539");
    expect(html).toContain("\u751f\u6210");
    expect(html).not.toContain('data-script-dialogue-send="true"');
    expect(html).toContain("Storyboard");
    expect(html).not.toContain("Mock storyboard model");
    expect(html).not.toContain("Configured model");
    expect(html).not.toContain('data-script-output-select="true"');
    expect(html).not.toContain("Script output target");
    expect(html).not.toContain('data-script-node-history="true"');
    expect(html).not.toContain('data-script-node-editor="true"');
    expect(html).not.toContain('data-image-node-editor="true"');
    expect(html).not.toContain('aria-label="Close Script node editor"');
    expect(html).not.toContain("Choose output");
    expect(html).not.toContain("Storyboard + characters composed together");
  });

  it("maps Script AI modify and Generate actions to distinct response modes", () => {
    expect(getScriptResponseModeForAction("revise")).toBe("revise");
    expect(getScriptResponseModeForAction("generate")).toBe("generation");
  });

  it("formats Script backend execution evidence for AI replies", () => {
    expect(formatScriptBackendExecutionLabel(null)).toBe(
      "Backend: waiting for server confirmation",
    );
    expect(
      formatScriptBackendExecutionLabel(
        createScriptBackendExecution("mock", "local-script-mock"),
      ),
    ).toBe("Mock backend: mock / local-script-mock");
    expect(
      formatScriptBackendExecutionLabel(
        createScriptBackendExecution("openai", "gpt-live"),
      ),
    ).toBe("Backend: openai / gpt-live");
  });

  it("renders the previous floating editor behavior for image-class nodes", () => {
    const graph = createInitialWorkflowGraphState();
    const imageNode = graph.nodes.find(
      (candidate) => candidate.type === "composition",
    );

    expect(imageNode).toBeDefined();
    expect(isFloatingImageEditorNodeType("composition")).toBe(true);
    expect(isFloatingImageEditorNodeType("scene")).toBe(true);
    expect(isFloatingImageEditorNodeType("character")).toBe(true);
    expect(isFloatingImageEditorNodeType("script")).toBe(false);
    expect(
      clampImageEditorFrame(
        { x: -200, y: -120, width: 100, height: 100 },
        { width: 1000, height: 800 },
      ),
    ).toEqual({ x: 16, y: 16, width: 360, height: 360 });

    const html = renderToStaticMarkup(
      <ImageNodeFloatingEditor
        frame={{ x: 880, y: 88, width: 430, height: 520 }}
        node={imageNode!}
        prompt="A neon jeep frame"
        responseOpen={true}
        onClose={() => undefined}
        onFrameChange={() => undefined}
        onPromptChange={() => undefined}
        onResponseOpenChange={() => undefined}
      />,
    );

    expect(html).toContain('data-image-node-editor="true"');
    expect(html).toContain('data-image-node-drag-handle="true"');
    expect(html).toContain('aria-label="Close Image node editor"');
    expect(html).toContain('data-image-node-response="true"');
    expect(html).toContain('data-image-model-select="true"');
    expect(html).toContain('data-image-ai-revise="true"');
    expect(html).toContain('aria-label="Resize Image node editor"');
    expect(html).toContain("Mock image model");
    expect(html).toContain("Image Agent");
    expect(html).toContain("A neon jeep frame");
  });

  it("renders selectable structured Script output responses", () => {
    const task: ScriptTaskStatusResponse = {
      task_id: "task-1",
      project_id: "local-project",
      node_id: "script-1",
      status: "succeeded",
      error: null,
    };
    const output = makeScriptOutput();
    const html = renderToStaticMarkup(
      <ScriptOutputTabs
        backendExecution={createScriptBackendExecution("openai", "gpt-live")}
        conversationMode={false}
        input={{ world_description: "A generated snow MV world" }}
        messages={[]}
        output={output}
        responseMode="generation"
        task={task}
      />,
    );

    expect(html).toContain("A generated snow MV world");
    expect(html).toContain("Ready");
    expect(html).toContain("Backend: openai / gpt-live");
    expect(html).toContain('data-script-node-output-scroll="true"');
    expect(html).toContain("Agent generated answer for the chat history.");
    expect(html).not.toContain("A structured MV world summary.");
    expect(html).not.toContain("soft opening, travel beat, neon performance payoff");
    expect(html).not.toContain("Shot 1");
    expect(html).not.toContain("Direction");
    expect(html).not.toContain(
      "\u5df2\u6839\u636e\u4f60\u7684\u5267\u60c5\u7247\u6bb5\u3001\u6545\u4e8b\u548c\u4e16\u754c\u89c2\u6784\u60f3\u751f\u6210 Script Node \u7ed3\u679c",
    );
    expect(html).not.toContain("Choose output");
  });

  it("formats Script output as an AI conversation reply from returned data", () => {
    expect(formatScriptOutputConversationReply(makeScriptOutput())).toBe(
      "Agent generated answer for the chat history.",
    );
  });

  it("falls back to a readable Script output reply when agent output is absent", () => {
    const { agent_output: _agentOutput, ...output } = makeScriptOutput();

    expect(formatScriptOutputConversationReply(output)).toBe(
      "Mock Script Title\n\nA structured MV world summary.\n\nthird-person cinematic POV\n\nsoft opening, travel beat, neon performance payoff\n\n\u89d2\u8272\uff1aLead\n\n\u573a\u666f\uff1adesert jeep",
    );
  });

  it("shows generation errors in the response panel status area", () => {
    const task: ScriptTaskStatusResponse = {
      task_id: "task-1",
      project_id: "local-project",
      node_id: "script-1",
      status: "failed",
      error: "Provider unavailable",
    };
    const html = renderToStaticMarkup(
      <ScriptOutputTabs
        conversationMode={false}
        error="Provider unavailable"
        input={{ world_description: "A generated snow MV world" }}
        messages={[]}
        output={null}
        responseMode="generation"
        task={task}
        onHide={() => undefined}
      />,
    );

    expect(html).toContain('data-script-node-response-status="true"');
    expect(html).toContain("Error");
    expect(html).toContain("Provider unavailable");
    expect(html).toContain('aria-label="Hide Script response"');
    expect(getScriptResponseStatusLabel(task, null, task.error)).toBe("Error");
  });

  it("renders backend AI dialogue turns without structured shots", () => {
    const task: ScriptTaskStatusResponse = {
      task_id: "task-1",
      project_id: "local-project",
      node_id: "script-1",
      status: "succeeded",
      error: null,
    };
    const messages: ScriptDialogueMessage[] = [
      {
        role: "user",
        content: "Make the two leads argue before the chorus.",
      },
      {
        role: "assistant",
        content:
          "Script AI turn 1: I would add conflict before the chorus payoff.",
      },
    ];
    const html = renderToStaticMarkup(
      <ScriptOutputTabs
        backendExecution={createScriptBackendExecution(
          "mock",
          "storyboard-browser-polish",
        )}
        conversationMode={true}
        input={{ world_description: "A generated snow MV world" }}
        messages={messages}
        output={makeScriptOutput()}
        responseMode="revise"
        task={task}
      />,
    );

    expect(html).toContain("AI\u5bf9\u8bdd");
    expect(html).toContain("AI\u4fee\u6539 · mock backend");
    expect(html).toContain("Mock backend: mock / storyboard-browser-polish");
    expect(html).toContain("Make the two leads argue before the chorus.");
    expect(html).toContain(
      "Script AI turn 1: I would add conflict before the chorus payoff.",
    );
    expect(html).not.toContain("Agent generated answer for the chat history.");
    expect(html).not.toContain("Shot 1");
    expect(html).not.toContain("Direction");
  });

  it("renders conversation guidance before any Script dialogue turn is sent", () => {
    const task: ScriptTaskStatusResponse = {
      task_id: "not-started",
      project_id: "local-project",
      node_id: "script-1",
      status: "queued",
      error: null,
    };
    const html = renderToStaticMarkup(
      <ScriptOutputTabs
        conversationMode={true}
        input={{ world_description: "A generated snow MV world" }}
        messages={[]}
        output={null}
        responseMode="revise"
        task={task}
      />,
    );

    expect(html).toContain("AI\u5bf9\u8bdd");
    expect(html).toContain("AI\u4fee\u6539");
    expect(html).toContain("\u6545\u4e8b\u6838\u5fc3");
    expect(html).not.toContain("Script AI turn");
  });

  it("keeps inline composer usable under zoom and permits far-left node dragging", () => {
    expect(getInlineEditorCompensationScale(0.5)).toBe(2);
    expect(getInlineEditorCompensationScale(1.25)).toBe(0.8);
    expect(
      calculateDraggedNodePosition({ x: -180, y: 8 }, { x: 40, y: 80 }),
    ).toEqual({ x: -220, y: 16 });
  });

  it("treats form controls as editable keyboard targets", () => {
    const textareaTarget = {
      closest: (selector: string) =>
        selector.includes("textarea") ? {} : null,
    } as unknown as EventTarget;
    const canvasTarget = {
      closest: () => null,
    } as unknown as EventTarget;

    expect(isEditableKeyboardTarget(textareaTarget)).toBe(true);
    expect(isEditableKeyboardTarget(canvasTarget)).toBe(false);
  });

  it("formats the Script node preview from confirmed output when available", () => {
    expect(
      formatScriptNodePreview(
        { world_description: "Draft world prompt" },
        makeScriptOutput(),
      ),
    ).toEqual({
      heading: "Confirmed Script",
      body: "Mock Script Title: A structured MV world summary. 1 storyboard shots ready.",
    });
  });
});
