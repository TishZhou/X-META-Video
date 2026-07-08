import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type {
  ImageGenerationResponse,
  MusicGenerationResponse,
  ScriptDialogueMessage,
  ScriptNodeOutput,
  ScriptTaskStatusResponse,
  VideoGenerationResponse,
} from "@xmeta/shared-contracts";

import {
  createInitialWorkflowGraphState,
  createWorkflowOutputNodeId,
  workflowGraphReducer,
  workflowNodeTemplates,
} from "@/lib/workflow-canvas/graph";
import type { WorkflowNode } from "@/lib/workflow-canvas/types";

import {
  audioSourceFromGeneratedAudio,
  audioReferenceFromWorkflowOutput,
  audioSourceFromWorkflowOutput,
  base64FromHexAudio,
  buildScriptDirectOutputMessage,
  calculateDraggedNodePosition,
  clampImageEditorFrame,
  createScriptBackendExecution,
  formatScriptBackendExecutionLabel,
  formatScriptNodePreview,
  formatWorkflowOutputExecutionLabel,
  formatTemplateIoLabel,
  getConnectedAudioLyrics,
  getConnectedImagePrompt,
  getConnectedVideoInputs,
  getImageGenerationNodeType,
  imageReferenceFromWorkflowOutput,
  imageSourceFromGeneratedImage,
  imageSourceFromWorkflowOutput,
  getInlineEditorCompensationScale,
  getScriptResponseModeForAction,
  getScriptResponseStatusLabel,
  ImageNodeFloatingEditor,
  isEditableKeyboardTarget,
  isFloatingImageEditorNodeType,
  ScriptOutcomeNodeEditor,
  ScriptNodeInlineEditor,
  ScriptOutputTabs,
  MusicNodeInlineEditor,
  VideoNodeFloatingEditor,
  videoSourceFromGeneratedVideo,
  videoSourceFromWorkflowOutput,
  WorkflowNodeCard,
  WorkflowCanvasWorkspace,
} from "./workflow-canvas-workspace";

function makeScriptOutput(): ScriptNodeOutput {
  return {
    title: "Sample Script Title",
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
    expect(html).toContain("Script + media AI enabled");
    expect(html).toContain("persistence deferred");
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
      "Audio: Input Lyrics -> Output Audio",
    );
    expect(formatTemplateIoLabel(videoTemplate!)).toBe(
      "Video: Input Prompt + Image + Reference video + Audio -> Output Video",
    );
    const imageTemplate = workflowNodeTemplates.find(
      (template) => template.type === "image",
    );

    expect(imageTemplate).toBeDefined();
    expect(formatTemplateIoLabel(imageTemplate!)).toBe(
      "Image: Input Prompt -> Output Image",
    );
    const templateTitles = workflowNodeTemplates.map(
      (template) => template.title as string,
    );
    expect(templateTitles).not.toContain("Character Image");
    expect(templateTitles).not.toContain("Prop / Asset");
    expect(templateTitles).not.toContain("Scene Image");
  });

  it("renders initial typed graph nodes and the selected Script node inline input", () => {
    const html = renderToStaticMarkup(<WorkflowCanvasWorkspace />);

    expect(html).toContain('data-workflow-node="script"');
    expect(html).toContain('data-workflow-node="storyboard"');
    expect(html).toContain('data-workflow-node="composition"');
    expect(html).not.toContain("-top-7");
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
    expect(html).not.toContain("gpt-5.4-mini");
    expect(html).toContain('data-script-ai-revise="true"');
    expect(html).toContain(
      "\u63cf\u8ff0\u4f60\u7684\u5267\u60c5\u7247\u6bb5\u3001\u6545\u4e8b\u548c\u4e16\u754c\u89c2\u6784\u60f3",
    );
    expect(html).toContain("AI\u4fee\u6539");
    expect(html).toContain("\u751f\u6210");
    expect(html).not.toContain('data-script-dialogue-send="true"');
    expect(html).toContain("Storyboard");
    expect(html).not.toContain("Configured storyboard model");
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
        createScriptBackendExecution("openai-compatible", "test-model"),
      ),
    ).toBe("Backend: openai-compatible / test-model");
    expect(
      formatScriptBackendExecutionLabel(
        createScriptBackendExecution("openai", "gpt-live"),
      ),
    ).toBe("Backend: openai / gpt-live");
  });

  it("renders the SeedDream image editor states for image-class nodes", () => {
    const graph = workflowGraphReducer(createInitialWorkflowGraphState(), {
      type: "addNode",
      nodeType: "image",
      position: { x: 880, y: 120 },
    });
    const imageNode = graph.nodes.find((candidate) => candidate.type === "image");
    const generation = {
      project_id: "local-project",
      node_id: "scene-4",
      node_type: "scene_image",
      provider: "doubao-seedream",
      model: "doubao-seedream-5-0-260128",
      prompt: "A neon jeep frame",
      image: {
        url: "https://image.example/scene.png",
        b64_json: null,
        mime_type: "image/png",
        width: 1024,
        height: 1024,
      },
      persisted: false,
    } satisfies ImageGenerationResponse;

    expect(imageNode).toBeDefined();
    expect(isFloatingImageEditorNodeType("image")).toBe(true);
    expect(isFloatingImageEditorNodeType("composition")).toBe(false);
    expect(isFloatingImageEditorNodeType("script")).toBe(false);
    expect(getImageGenerationNodeType("image")).toBe("scene_image");
    expect(getImageGenerationNodeType("composition")).toBeNull();
    expect(imageSourceFromGeneratedImage(generation.image)).toBe(
      "https://image.example/scene.png",
    );
    expect(
      clampImageEditorFrame(
        { x: -200, y: -120, width: 100, height: 100 },
        { width: 1000, height: 800 },
      ),
    ).toEqual({ x: 16, y: 16, width: 360, height: 360 });

    const html = renderToStaticMarkup(
      <ImageNodeFloatingEditor
        frame={{ x: 880, y: 88, width: 430, height: 520 }}
        busy={false}
        connectedPrompt="Connected character profile text"
        currentImageSource="https://image.example/current.png"
        error={null}
        generation={generation}
        node={imageNode!}
        prompt="A neon jeep frame"
        responseOpen={true}
        viewportZoom={1}
        onClose={() => undefined}
        onFrameChange={() => undefined}
        onGenerate={() => undefined}
        onPromptChange={() => undefined}
        onResponseOpenChange={() => undefined}
        onUpload={() => undefined}
        onUseConnectedPrompt={() => undefined}
      />,
    );

    expect(html).toContain('data-image-node-editor="true"');
    expect(html).toContain('data-image-node-inline-editor="true"');
    expect(html).toContain('data-image-node-input-composer="true"');
    expect(html).toContain('data-image-node-response="true"');
    expect(html).toContain('data-image-model-select="true"');
    expect(html).toContain('data-image-upload-reference="true"');
    expect(html).toContain('data-image-upload-input="true"');
    expect(html).toContain('data-image-use-connected-prompt="true"');
    expect(html).toContain('data-image-reference-edit="true"');
    expect(html).not.toContain('data-image-node-drag-handle="true"');
    expect(html).not.toContain('aria-label="Close Image node editor"');
    expect(html).not.toContain('aria-label="Resize Image node editor"');
    expect(html).toContain("SeedDream 5.0");
    expect(html).toContain("Use connected text");
    expect(html).toContain("Edit image");
    expect(html).toContain('data-generated-image-preview="true"');
    expect(html).toContain("https://image.example/scene.png");
    expect(html).toContain("Backend: doubao-seedream / doubao-seedream-5-0-260128");
    expect(html).toContain("Asset persistence is not implemented yet");
  });

  it("reads connected Script outcome text as Audio node lyrics", () => {
    const graph = createInitialWorkflowGraphState();
    const withScriptOutcome = workflowGraphReducer(graph, {
      type: "upsertOutputNode",
      sourceNodeId: "script-1",
      nodeType: "script",
      title: "Script outcome",
      description: "Editable direct text generated from the Script node.",
      position: { x: 520, y: 120 },
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
    const withAudio = workflowGraphReducer(withScriptOutcome, {
      type: "addNode",
      nodeType: "audio",
      position: { x: 860, y: 120 },
    });
    const audioNode = withAudio.nodes.find((node) => node.type === "audio");
    const scriptOutcomeNodeId = createWorkflowOutputNodeId("script-1", "script");

    expect(audioNode).toBeDefined();

    const connected = workflowGraphReducer(withAudio, {
      type: "connect",
      sourcePortId: `${scriptOutcomeNodeId}:script-out`,
      targetPortId: `${audioNode!.id}:script-audio-in`,
    });

    expect(
      getConnectedAudioLyrics(
        audioNode!,
        connected,
        { world_description: "fallback script input" },
        {
          [scriptOutcomeNodeId]: "[Chorus]\nWe run into the glow",
        },
      ),
    ).toBe("[Chorus]\nWe run into the glow");
  });

  it("reads connected Script outcome text as an Image node prompt", () => {
    const graph = createInitialWorkflowGraphState();
    const withScriptOutcome = workflowGraphReducer(graph, {
      type: "upsertOutputNode",
      sourceNodeId: "script-1",
      nodeType: "script",
      title: "Script outcome",
      description: "Editable direct text generated from the Script node.",
      position: { x: 520, y: 120 },
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
      position: { x: 860, y: 120 },
    });
    const imageNode = withImage.nodes.find((node) => node.type === "image");
    const scriptOutcomeNodeId = createWorkflowOutputNodeId("script-1", "script");

    expect(imageNode).toBeDefined();

    const connected = workflowGraphReducer(withImage, {
      type: "connect",
      sourcePortId: `${scriptOutcomeNodeId}:script-out`,
      targetPortId: `${imageNode!.id}:image-prompt-in`,
    });

    expect(connected.edges.at(-1)?.dataType).toBe("script");
    expect(
      getConnectedImagePrompt(
        imageNode!,
        connected,
        { world_description: "fallback script input" },
        {
          [scriptOutcomeNodeId]: "A brass key prop with frosted edges",
        },
      ),
    ).toBe("A brass key prop with frosted edges");
  });

  it("renders the MiniMax music inline composer with connected lyrics and audio preview", () => {
    const graph = workflowGraphReducer(createInitialWorkflowGraphState(), {
      type: "addNode",
      nodeType: "audio",
      position: { x: 860, y: 120 },
    });
    const audioNode = graph.nodes.find((node) => node.type === "audio");
    const generation = {
      project_id: "local-project",
      node_id: "audio-4",
      node_type: "audio",
      provider: "minimax",
      model: "music-2.6-free",
      prompt: "K-pop cinematic MV chorus",
      lyrics: "[Chorus]\nWe run into the glow",
      audio: {
        url: "https://audio.example/generated.mp3",
        hex: null,
        b64_audio: null,
        mime_type: "audio/mpeg",
        duration_ms: 25364,
        sample_rate: 44100,
        channels: 2,
        bitrate: 256000,
        size_bytes: 813651,
      },
      persisted: false,
    } satisfies MusicGenerationResponse;

    expect(audioNode).toBeDefined();
    expect(audioSourceFromGeneratedAudio(generation.audio)).toBe(
      "https://audio.example/generated.mp3",
    );
    expect(base64FromHexAudio("4869")).toBe("SGk=");

    const html = renderToStaticMarkup(
      <MusicNodeInlineEditor
        busy={false}
        connectedLyrics="[Chorus]\nWe run into the glow"
        currentAudioSource={null}
        error={null}
        generation={generation}
        lyrics="[Chorus]\nWe run into the glow"
        node={audioNode!}
        prompt="K-pop cinematic MV chorus"
        responseOpen={true}
        viewportZoom={1}
        onEdit={() => undefined}
        onGenerate={() => undefined}
        onLyricsChange={() => undefined}
        onPromptChange={() => undefined}
        onResponseOpenChange={() => undefined}
        onUpload={() => undefined}
        onUseConnectedLyrics={() => undefined}
      />,
    );

    expect(html).toContain('data-music-node-inline-editor="true"');
    expect(html).toContain('data-music-node-input-composer="true"');
    expect(html).toContain('data-music-node-output-panel="true"');
    expect(html).toContain("MiniMax Music");
    expect(html).toContain('data-music-use-connected-lyrics="true"');
    expect(html).toContain('data-music-upload-audio="true"');
    expect(html).toContain('data-generated-audio-preview="true"');
    expect(html).toContain("https://audio.example/generated.mp3");
    expect(html).toContain("Backend: minimax / music-2.6-free");
    expect(html).toContain("Audio persistence, signed URLs, and Audio Library save");
    expect(html).not.toContain('data-music-node-drag-handle="true"');
    expect(html).not.toContain('data-music-node-resize-handle="true"');
  });

  it("builds MiniMax cover references from current Audio node media", () => {
    expect(
      audioReferenceFromWorkflowOutput({
        sourceNodeId: "audio-1",
        dataType: "audio",
        label: "Generated audio",
        editable: false,
        media: {
          kind: "audio",
          hex: "4869",
          mimeType: "audio/mpeg",
          alt: "Generated audio",
        },
      }),
    ).toEqual({
      referenceAudioUrl: null,
      referenceAudioB64: "SGk=",
      referenceAudioMimeType: "audio/mpeg",
    });

    expect(
      audioReferenceFromWorkflowOutput({
        sourceNodeId: "audio-1",
        dataType: "audio",
        label: "Uploaded audio",
        editable: false,
        media: {
          kind: "audio",
          url: "data:audio/mpeg;base64,UklGRg==",
          mimeType: "audio/mpeg",
          alt: "Uploaded audio",
        },
      }),
    ).toEqual({
      referenceAudioUrl: null,
      referenceAudioB64: "UklGRg==",
      referenceAudioMimeType: "audio/mpeg",
    });

    expect(
      audioReferenceFromWorkflowOutput({
        sourceNodeId: "audio-1",
        dataType: "audio",
        label: "Remote audio",
        editable: false,
        media: {
          kind: "audio",
          url: "https://audio.example/current.mp3",
          mimeType: "audio/mpeg",
          alt: "Remote audio",
        },
      }),
    ).toEqual({
      referenceAudioUrl: "https://audio.example/current.mp3",
      referenceAudioB64: null,
      referenceAudioMimeType: "audio/mpeg",
    });
  });

  it("renders Audio edit mode when current audio exists", () => {
    const graph = workflowGraphReducer(createInitialWorkflowGraphState(), {
      type: "addNode",
      nodeType: "audio",
      position: { x: 860, y: 120 },
    });
    const audioNode = graph.nodes.find((node) => node.type === "audio");

    expect(audioNode).toBeDefined();

    const html = renderToStaticMarkup(
      <MusicNodeInlineEditor
        busy={false}
        connectedLyrics="[Chorus]\nWe run into the glow"
        currentAudioSource="https://audio.example/current.mp3"
        error={null}
        generation={null}
        lyrics="[Chorus]\nWe run into the glow"
        node={audioNode!}
        prompt="Make the chorus brighter"
        responseOpen={true}
        viewportZoom={1}
        onEdit={() => undefined}
        onGenerate={() => undefined}
        onLyricsChange={() => undefined}
        onPromptChange={() => undefined}
        onResponseOpenChange={() => undefined}
        onUpload={() => undefined}
        onUseConnectedLyrics={() => undefined}
      />,
    );

    expect(html).toContain('data-music-reference-edit="true"');
    expect(html).toContain("Edit audio");
    expect(html).toContain("Upload");
    expect(html).not.toContain("not implemented");
    expect(html).not.toContain('data-music-lyrics-input="true"');
    expect(html).not.toContain('data-music-use-connected-lyrics="true"');
  });

  it("collects connected Script, image, video, and audio outputs for Video node inputs", () => {
    const graph = createInitialWorkflowGraphState();
    const withScriptOutcome = workflowGraphReducer(graph, {
      type: "upsertOutputNode",
      sourceNodeId: "script-1",
      nodeType: "script",
      title: "Script outcome",
      description: "Editable direct text generated from the Script node.",
      position: { x: 520, y: 120 },
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
    const withImageOutcome = workflowGraphReducer(withScriptOutcome, {
      type: "upsertOutputNode",
      sourceNodeId: "image-4",
      nodeType: "image",
      title: "Image outcome",
      description: "SeedDream text-to-image result.",
      position: { x: 620, y: 280 },
      output: {
        sourceNodeId: "image-4",
        dataType: "image",
        label: "Image",
        provider: "doubao-seedream",
        model: "doubao-seedream-5-0-260128",
        editable: false,
        media: {
          kind: "image",
          url: "https://image.example/scene.png",
          mimeType: "image/png",
          alt: "Image generated image",
        },
      },
      ports: [
        {
          key: "image-out",
          label: "Image",
          direction: "output",
          dataType: "image",
        },
      ],
    });
    const withAudioOutcome = workflowGraphReducer(withImageOutcome, {
      type: "upsertOutputNode",
      sourceNodeId: "audio-5",
      nodeType: "audio",
      title: "Audio outcome",
      description: "MiniMax text-to-music result.",
      position: { x: 620, y: 440 },
      output: {
        sourceNodeId: "audio-5",
        dataType: "audio",
        label: "Audio music",
        provider: "minimax",
        model: "music-2.6-free",
        editable: false,
        media: {
          kind: "audio",
          url: "https://audio.example/music.mp3",
          mimeType: "audio/mpeg",
          alt: "Audio music",
        },
      },
      ports: [
        {
          key: "audio-out",
          label: "Audio",
          direction: "output",
          dataType: "audio",
        },
      ],
    });
    const withVideoOutcome = workflowGraphReducer(withAudioOutcome, {
      type: "upsertOutputNode",
      sourceNodeId: "video-6",
      nodeType: "video",
      title: "Video outcome",
      description: "Ark Seedance video result.",
      position: { x: 620, y: 600 },
      output: {
        sourceNodeId: "video-6",
        dataType: "video",
        label: "Video clip",
        provider: "volcengine-ark",
        model: "doubao-seedance-2-0-mini-260615",
        editable: false,
        media: {
          kind: "video",
          url: "https://video.example/reference.mp4",
          mimeType: "video/mp4",
          alt: "Video clip",
        },
      },
      ports: [
        {
          key: "video-out",
          label: "Video",
          direction: "output",
          dataType: "video",
        },
      ],
    });
    const withVideo = workflowGraphReducer(withVideoOutcome, {
      type: "addNode",
      nodeType: "video",
      position: { x: 980, y: 260 },
    });
    const videoNode = withVideo.nodes.find(
      (node) => node.type === "video" && node.role === "source",
    );
    const scriptOutcomeNodeId = createWorkflowOutputNodeId("script-1", "script");
    const imageOutcomeNodeId = createWorkflowOutputNodeId("image-4", "image");
    const audioOutcomeNodeId = createWorkflowOutputNodeId("audio-5", "audio");
    const videoOutcomeNodeId = createWorkflowOutputNodeId("video-6", "video");

    expect(videoNode).toBeDefined();

    const withPrompt = workflowGraphReducer(withVideo, {
      type: "connect",
      sourcePortId: `${scriptOutcomeNodeId}:script-out`,
      targetPortId: `${videoNode!.id}:prompt-in`,
    });
    const withImage = workflowGraphReducer(withPrompt, {
      type: "connect",
      sourcePortId: `${imageOutcomeNodeId}:image-out`,
      targetPortId: `${videoNode!.id}:image-in`,
    });
    const withReferenceVideo = workflowGraphReducer(withImage, {
      type: "connect",
      sourcePortId: `${videoOutcomeNodeId}:video-out`,
      targetPortId: `${videoNode!.id}:reference-video-in`,
    });
    const connected = workflowGraphReducer(withReferenceVideo, {
      type: "connect",
      sourcePortId: `${audioOutcomeNodeId}:audio-out`,
      targetPortId: `${videoNode!.id}:audio-in`,
    });

    expect(
      getConnectedVideoInputs(
        videoNode!,
        connected,
        { world_description: "fallback script input" },
        {
          [scriptOutcomeNodeId]: "Use this script as the video prompt",
        },
      ),
    ).toEqual({
      prompt: "Use this script as the video prompt",
      imageUrls: ["https://image.example/scene.png"],
      videoUrls: ["https://video.example/reference.mp4"],
      audioUrls: ["https://audio.example/music.mp3"],
    });
  });

  it("renders the Ark video editor with connected media and video preview", () => {
    const graph = workflowGraphReducer(createInitialWorkflowGraphState(), {
      type: "addNode",
      nodeType: "video",
      position: { x: 980, y: 120 },
    });
    const videoNode = graph.nodes.find((node) => node.type === "video");
    const generation = {
      task_id: "video-task-1",
      provider_task_id: "ark-task-1",
      project_id: "local-project",
      node_id: "video-4",
      node_type: "video",
      provider: "volcengine-ark",
      model: "doubao-seedance-2-0-mini-260615",
      prompt: "Cinematic MV clip",
      duration: 15,
      image_urls: ["https://image.example/scene.png"],
      video_urls: ["https://video.example/reference.mp4"],
      audio_urls: ["https://audio.example/music.mp3"],
      video: {
        url: "https://video.example/generated.mp4",
        mime_type: "video/mp4",
        duration_ms: 15000,
      },
      persisted: false,
    } satisfies VideoGenerationResponse;

    expect(videoNode).toBeDefined();
    expect(videoSourceFromGeneratedVideo(generation.video)).toBe(
      "https://video.example/generated.mp4",
    );

    const html = renderToStaticMarkup(
      <VideoNodeFloatingEditor
        frame={{ x: 920, y: 128, width: 480, height: 560 }}
        audioUrlCount={1}
        busy={false}
        connectedPrompt="Cinematic MV clip"
        duration="15"
        error={null}
        generation={generation}
        imageUrlCount={1}
        videoUrlCount={1}
        node={videoNode!}
        prompt="Cinematic MV clip"
        responseOpen={true}
        onClose={() => undefined}
        onDurationChange={() => undefined}
        onFrameChange={() => undefined}
        onGenerate={() => undefined}
        onPromptChange={() => undefined}
        onResponseOpenChange={() => undefined}
        onUseConnectedPrompt={() => undefined}
      />,
    );

    expect(html).toContain('data-video-node-editor="true"');
    expect(html).toContain("Ark Seedance video");
    expect(html).toContain('data-video-use-connected-prompt="true"');
    expect(html).toContain('data-video-connected-images="true"');
    expect(html).toContain('data-video-connected-videos="true"');
    expect(html).toContain('data-video-connected-audio="true"');
    expect(html).toContain('data-generated-video-preview="true"');
    expect(html).toContain("https://video.example/generated.mp4");
    expect(html).toContain(
      "Backend: volcengine-ark / doubao-seedance-2-0-mini-260615",
    );
    expect(html).toContain("Video persistence, signed URLs, task polling");
  });

  it("labels task-id-only Video responses without implying playback is ready", () => {
    const graph = workflowGraphReducer(createInitialWorkflowGraphState(), {
      type: "addNode",
      nodeType: "video",
      position: { x: 980, y: 120 },
    });
    const videoNode = graph.nodes.find((node) => node.type === "video");
    const generation = {
      task_id: "video-task-queued",
      provider_task_id: "ark-task-queued",
      project_id: "local-project",
      node_id: "video-4",
      node_type: "video",
      provider: "volcengine-ark",
      model: "doubao-seedance-2-0-mini-260615",
      prompt: "Cinematic MV clip",
      duration: 15,
      image_urls: [],
      video_urls: [],
      audio_urls: [],
      video: {
        url: null,
        mime_type: null,
        duration_ms: null,
      },
      persisted: false,
    } satisfies VideoGenerationResponse;

    const html = renderToStaticMarkup(
      <VideoNodeFloatingEditor
        frame={{ x: 920, y: 128, width: 480, height: 560 }}
        audioUrlCount={0}
        busy={false}
        connectedPrompt={null}
        duration="15"
        error={null}
        generation={generation}
        imageUrlCount={0}
        videoUrlCount={0}
        node={videoNode!}
        prompt="Cinematic MV clip"
        responseOpen={true}
        onClose={() => undefined}
        onDurationChange={() => undefined}
        onFrameChange={() => undefined}
        onGenerate={() => undefined}
        onPromptChange={() => undefined}
        onResponseOpenChange={() => undefined}
        onUseConnectedPrompt={() => undefined}
      />,
    );

    expect(html).toContain('data-video-provider-task="true"');
    expect(html).toContain("Provider task ark-task-queued was accepted");
    expect(html).toContain("Task polling is not implemented");
    expect(html).not.toContain('data-generated-video-preview="true"');
  });

  it("keeps generated direct output out of the Script chat panel", () => {
    const task: ScriptTaskStatusResponse = {
      task_id: "task-1",
      project_id: "local-project",
      node_id: "script-1",
      status: "succeeded",
      error: null,
    };
    const html = renderToStaticMarkup(
      <ScriptOutputTabs
        backendExecution={createScriptBackendExecution("openai", "gpt-live")}
        conversationMode={false}
        input={{ world_description: "A generated snow MV world" }}
        messages={[]}
        responseMode="generation"
        task={task}
      />,
    );

    expect(html).toContain("A generated snow MV world");
    expect(html).toContain("Ready");
    expect(html).toContain("Backend: openai / gpt-live");
    expect(html).toContain('data-script-node-output-scroll="true"');
    expect(html).not.toContain("Agent generated answer for the chat history.");
    expect(html).not.toContain("A structured MV world summary.");
    expect(html).not.toContain("soft opening, travel beat, neon performance payoff");
    expect(html).not.toContain("Shot 1");
    expect(html).not.toContain("Direction");
    expect(html).not.toContain(
      "\u5df2\u6839\u636e\u4f60\u7684\u5267\u60c5\u7247\u6bb5\u3001\u6545\u4e8b\u548c\u4e16\u754c\u89c2\u6784\u60f3\u751f\u6210 Script Node \u7ed3\u679c",
    );
    expect(html).not.toContain("Choose output");
  });

  it("builds direct text generation prompts without asking for structured output", () => {
    expect(
      buildScriptDirectOutputMessage(
        { world_description: "A snow MV world" },
        true,
      ),
    ).toContain("Use the AI conversation history as context");
    expect(
      buildScriptDirectOutputMessage(
        { world_description: "A snow MV world" },
        false,
      ),
    ).toContain("Use only the current MV world description");
    expect(
      buildScriptDirectOutputMessage(
        { world_description: "A snow MV world" },
        false,
      ),
    ).toContain("Do not return JSON");
  });

  it("renders editable direct text Script outcome nodes as one text frame", () => {
    const nodeId = createWorkflowOutputNodeId("script-1", "script");
    const node = {
      id: nodeId,
      type: "script",
      role: "outcome",
      title: "Script outcome",
      description: "Editable direct text generated from the Script node.",
      status: "ready",
      position: { x: 520, y: 120 },
      ports: [],
      output: {
        sourceNodeId: "script-1",
        dataType: "script",
        label: "Script output",
        provider: "openai-compatible",
        model: "test-model",
        editable: true,
      },
    } satisfies WorkflowNode;
    const html = renderToStaticMarkup(
      <WorkflowNodeCard
        node={node}
        scriptInput={null}
        scriptOutcomeText="A direct editable script result without JSON."
        selected={true}
        pendingPort={null}
        onScriptOutcomeTextChange={() => undefined}
        onDragStart={() => undefined}
        onSelect={() => undefined}
        onPortConnectionStart={() => undefined}
      />,
    );

    expect(formatWorkflowOutputExecutionLabel(node.output)).toBe(
      "Backend: openai-compatible / test-model",
    );
    expect(html).toContain('data-script-outcome-node="true"');
    expect(html).toContain('data-script-outcome-textarea="true"');
    expect(html).toContain("A direct editable script result without JSON.");
    expect(html).toContain("Backend: openai-compatible / test-model");
    expect(html).not.toContain("Local editable output");
    expect(html).toContain("border-0 bg-transparent p-0");
  });

  it("renders image generation outcome nodes as canvas image previews", () => {
    const nodeId = createWorkflowOutputNodeId("image-4", "image");
    const node = {
      id: nodeId,
      type: "image",
      role: "outcome",
      title: "Image outcome",
      description: "SeedDream text-to-image result.",
      status: "ready",
      position: { x: 520, y: 240 },
      ports: [],
      output: {
        sourceNodeId: "image-4",
        dataType: "image",
        label: "Image",
        provider: "doubao-seedream",
        model: "doubao-seedream-5-0-260128",
        editable: false,
        media: {
          kind: "image",
          url: null,
          b64Json: "iVBORw0KGgo=",
          mimeType: "image/png",
          alt: "Image generated image",
        },
      },
    } satisfies WorkflowNode;
    const html = renderToStaticMarkup(
      <WorkflowNodeCard
        node={node}
        scriptInput={null}
        scriptOutcomeText={null}
        selected={true}
        pendingPort={null}
        onScriptOutcomeTextChange={() => undefined}
        onDragStart={() => undefined}
        onSelect={() => undefined}
        onPortConnectionStart={() => undefined}
      />,
    );

    expect(formatWorkflowOutputExecutionLabel(node.output)).toBe(
      "Backend: doubao-seedream / doubao-seedream-5-0-260128",
    );
    expect(imageSourceFromWorkflowOutput(node.output)).toBe(
      "data:image/png;base64,iVBORw0KGgo=",
    );
    expect(html).toContain('data-image-outcome-node="true"');
    expect(html).toContain('data-image-outcome-preview="true"');
    expect(html).toContain("data:image/png;base64,iVBORw0KGgo=");
    expect(html).toContain("Backend: doubao-seedream / doubao-seedream-5-0-260128");
    expect(html).toContain("Local preview only; not saved to the asset library yet.");
  });

  it("renders self-contained source image nodes with generated previews", () => {
    const graph = workflowGraphReducer(createInitialWorkflowGraphState(), {
      type: "addNode",
      nodeType: "image",
      position: { x: 520, y: 240 },
    });
    const imageNode = graph.nodes.find((candidate) => candidate.type === "image");

    expect(imageNode).toBeDefined();

    const withPreview = workflowGraphReducer(graph, {
      type: "updateNodeOutput",
      nodeId: imageNode!.id,
      status: "ready",
      output: {
        sourceNodeId: imageNode!.id,
        dataType: "image",
        label: "Image",
        provider: "doubao-seedream",
        model: "doubao-seedream-5-0-260128",
        editable: false,
        media: {
          kind: "image",
          url: "https://image.example/self-contained-scene.png",
          mimeType: "image/png",
          alt: "Image generated image",
        },
      },
      notice: "Image generated on this node.",
    });
    const updatedNode = withPreview.nodes.find(
      (candidate) => candidate.id === imageNode!.id,
    );
    const outputNodeId = createWorkflowOutputNodeId(imageNode!.id, "image");

    expect(withPreview.nodes).toHaveLength(graph.nodes.length);
    expect(withPreview.selection).toEqual({ kind: "node", id: imageNode!.id });
    expect(
      withPreview.nodes.find((candidate) => candidate.id === outputNodeId),
    ).toBeUndefined();
    expect(updatedNode?.output?.media?.kind).toBe("image");
    expect(imageReferenceFromWorkflowOutput(updatedNode?.output)).toEqual({
      referenceImageUrl: "https://image.example/self-contained-scene.png",
      referenceImageB64: null,
      referenceImageMimeType: "image/png",
    });

    const html = renderToStaticMarkup(
      <WorkflowNodeCard
        node={updatedNode!}
        scriptInput={null}
        scriptOutcomeText={null}
        selected={true}
        pendingPort={null}
        onScriptOutcomeTextChange={() => undefined}
        onDragStart={() => undefined}
        onSelect={() => undefined}
        onPortConnectionStart={() => undefined}
      />,
    );

    expect(html).toContain('data-image-node-current="true"');
    expect(html).toContain('data-image-node-current-preview="true"');
    expect(html).not.toContain('data-image-outcome-node="true"');
    expect(html).toContain("https://image.example/self-contained-scene.png");
  });

  it("renders playable Audio outcome nodes with backend evidence", () => {
    const node = {
      id: createWorkflowOutputNodeId("audio-4", "audio"),
      type: "audio",
      role: "outcome",
      title: "Audio outcome",
      description: "MiniMax text-to-music result.",
      status: "ready",
      position: { x: 900, y: 120 },
      ports: [],
      output: {
        sourceNodeId: "audio-4",
        dataType: "audio",
        label: "Audio music",
        provider: "minimax",
        model: "music-2.6-free",
        editable: false,
        media: {
          kind: "audio",
          url: "https://audio.example/generated.mp3",
          mimeType: "audio/mpeg",
          alt: "Generated music",
        },
      },
    } satisfies WorkflowNode;

    expect(audioSourceFromWorkflowOutput(node.output)).toBe(
      "https://audio.example/generated.mp3",
    );

    const html = renderToStaticMarkup(
      <WorkflowNodeCard
        node={node}
        scriptInput={null}
        scriptOutcomeText={null}
        selected={true}
        pendingPort={null}
        onScriptOutcomeTextChange={() => undefined}
        onDragStart={() => undefined}
        onSelect={() => undefined}
        onPortConnectionStart={() => undefined}
      />,
    );

    expect(formatWorkflowOutputExecutionLabel(node.output)).toBe(
      "Backend: minimax / music-2.6-free",
    );
    expect(html).toContain('data-audio-outcome-node="true"');
    expect(html).toContain('data-audio-outcome-player="true"');
    expect(html).toContain('data-audio-outcome-download="true"');
    expect(html).toContain('download="audio-outcome.mp3"');
    expect(html).toContain("https://audio.example/generated.mp3");
    expect(html).toContain("Backend: minimax / music-2.6-free");
    expect(html).toContain("Audio persistence, signed URLs, and Audio Library save");
  });

  it("renders self-contained source Audio nodes with playable generated audio", () => {
    const graph = workflowGraphReducer(createInitialWorkflowGraphState(), {
      type: "addNode",
      nodeType: "audio",
      position: { x: 520, y: 240 },
    });
    const audioNode = graph.nodes.find((candidate) => candidate.type === "audio");

    expect(audioNode).toBeDefined();

    const withPreview = workflowGraphReducer(graph, {
      type: "updateNodeOutput",
      nodeId: audioNode!.id,
      status: "ready",
      output: {
        sourceNodeId: audioNode!.id,
        dataType: "audio",
        label: "Audio node audio",
        provider: "minimax",
        model: "music-2.6-free",
        editable: false,
        media: {
          kind: "audio",
          hex: "4869",
          mimeType: "audio/mpeg",
          alt: "Audio node generated audio",
        },
      },
      notice: "Audio generated on this node.",
    });
    const updatedNode = withPreview.nodes.find(
      (candidate) => candidate.id === audioNode!.id,
    );
    const outputNodeId = createWorkflowOutputNodeId(audioNode!.id, "audio");

    expect(withPreview.nodes).toHaveLength(graph.nodes.length);
    expect(withPreview.selection).toEqual({ kind: "node", id: audioNode!.id });
    expect(
      withPreview.nodes.find((candidate) => candidate.id === outputNodeId),
    ).toBeUndefined();
    expect(audioSourceFromWorkflowOutput(updatedNode?.output)).toBe(
      "data:audio/mpeg;base64,SGk=",
    );

    const html = renderToStaticMarkup(
      <WorkflowNodeCard
        node={updatedNode!}
        scriptInput={null}
        scriptOutcomeText={null}
        selected={true}
        pendingPort={null}
        onScriptOutcomeTextChange={() => undefined}
        onDragStart={() => undefined}
        onSelect={() => undefined}
        onPortConnectionStart={() => undefined}
      />,
    );

    expect(html).toContain('data-audio-node-current="true"');
    expect(html).toContain('data-audio-node-player="true"');
    expect(html).toContain('data-audio-node-download="true"');
    expect(html).toContain('download="audio.mp3"');
    expect(html).not.toContain('data-audio-outcome-node="true"');
    expect(html).toContain("data:audio/mpeg;base64,SGk=");
    expect(html).toContain("Backend: minimax / music-2.6-free");
  });

  it("renders playable Video outcome nodes with backend evidence", () => {
    const node = {
      id: createWorkflowOutputNodeId("video-4", "video"),
      type: "video",
      role: "outcome",
      title: "Video outcome",
      description: "Ark Seedance video result.",
      status: "ready",
      position: { x: 900, y: 120 },
      ports: [],
      output: {
        sourceNodeId: "video-4",
        dataType: "video",
        label: "Video clip",
        provider: "volcengine-ark",
        model: "doubao-seedance-2-0-mini-260615",
        editable: false,
        media: {
          kind: "video",
          url: "https://video.example/generated.mp4",
          mimeType: "video/mp4",
          durationMs: 15000,
          alt: "Generated video",
        },
      },
    } satisfies WorkflowNode;

    expect(videoSourceFromWorkflowOutput(node.output)).toBe(
      "https://video.example/generated.mp4",
    );

    const html = renderToStaticMarkup(
      <WorkflowNodeCard
        node={node}
        scriptInput={null}
        scriptOutcomeText={null}
        selected={true}
        pendingPort={null}
        onScriptOutcomeTextChange={() => undefined}
        onDragStart={() => undefined}
        onSelect={() => undefined}
        onPortConnectionStart={() => undefined}
      />,
    );

    expect(formatWorkflowOutputExecutionLabel(node.output)).toBe(
      "Backend: volcengine-ark / doubao-seedance-2-0-mini-260615",
    );
    expect(html).toContain('data-video-outcome-node="true"');
    expect(html).toContain('data-video-outcome-player="true"');
    expect(html).toContain("https://video.example/generated.mp4");
    expect(html).toContain(
      "Backend: volcengine-ark / doubao-seedance-2-0-mini-260615",
    );
    expect(html).toContain("Video persistence, signed URLs, task polling");
  });

  it("renders image generation errors as visible messages", () => {
    const graph = createInitialWorkflowGraphState();
    const imageNode = graph.nodes.find(
      (candidate) => candidate.type === "composition",
    );
    const html = renderToStaticMarkup(
      <ImageNodeFloatingEditor
        frame={{ x: 880, y: 88, width: 430, height: 520 }}
        busy={false}
        connectedPrompt={null}
        currentImageSource={null}
        error="SeedDream API key is missing."
        generation={null}
        node={imageNode!}
        prompt="A neon jeep frame"
        responseOpen={true}
        viewportZoom={1}
        onClose={() => undefined}
        onFrameChange={() => undefined}
        onGenerate={() => undefined}
        onPromptChange={() => undefined}
        onResponseOpenChange={() => undefined}
        onUpload={() => undefined}
        onUseConnectedPrompt={() => undefined}
      />,
    );

    expect(html).toContain('data-image-node-error="true"');
    expect(html).toContain("SeedDream API key is missing.");
  });

  it("renders a loading animation on the Script node while generation runs", () => {
    const graph = createInitialWorkflowGraphState();
    const scriptNode = graph.nodes.find((candidate) => candidate.type === "script");

    expect(scriptNode).toBeDefined();

    const html = renderToStaticMarkup(
      <WorkflowNodeCard
        node={{ ...scriptNode!, status: "running" }}
        scriptInput={{ world_description: "A snow MV world" }}
        scriptOutcomeText={null}
        selected={true}
        pendingPort={null}
        onScriptOutcomeTextChange={() => undefined}
        onDragStart={() => undefined}
        onSelect={() => undefined}
        onPortConnectionStart={() => undefined}
      />,
    );
    const articleClass = html.match(/<article[^>]*class="([^"]*)"/)?.[1] ?? "";

    expect(html).toContain('data-workflow-node-running="true"');
    expect(html).toContain('data-workflow-node-loading="true"');
    expect(html).toContain("animate-spin");
    expect(articleClass).not.toContain("overflow-hidden");
  });

  it("renders direct Generate button loading state only for direct output generation", () => {
    const graph = createInitialWorkflowGraphState();
    const scriptNode = graph.nodes.find((candidate) => candidate.type === "script");
    const task: ScriptTaskStatusResponse = {
      task_id: "direct-output-pending",
      project_id: "local-project",
      node_id: "script-1",
      status: "running",
      error: null,
    };

    expect(scriptNode).toBeDefined();

    const html = renderToStaticMarkup(
      <ScriptNodeInlineEditor
        backendExecution={null}
        busy={true}
        conversationMode={false}
        error={null}
        historyOpen={false}
        input={{ world_description: "A snow MV world" }}
        messages={[]}
        responseMode="generation"
        model="configured"
        node={scriptNode!}
        task={task}
        viewportZoom={1}
        onGenerate={() => undefined}
        onHistoryOpenChange={() => undefined}
        onInputChange={() => undefined}
        onModelChange={() => undefined}
        onRevise={() => undefined}
        onSendMessage={() => undefined}
      />,
    );

    expect(html).toContain('data-script-generate-loading="true"');
    expect(html).toContain("\u751f\u6210\u4e2d");
    expect(html).toContain("animate-spin");
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
        content: "Provider reply: I would add conflict before the chorus payoff.",
      },
    ];
    const html = renderToStaticMarkup(
      <ScriptOutputTabs
        backendExecution={createScriptBackendExecution(
          "openai-compatible",
          "test-model",
        )}
        conversationMode={true}
        input={{ world_description: "A generated snow MV world" }}
        messages={messages}
        responseMode="revise"
        task={task}
      />,
    );

    expect(html).toContain("AI\u5bf9\u8bdd");
    expect(html).toContain("AI\u4fee\u6539");
    expect(html).toContain("Backend: openai-compatible / test-model");
    expect(html).toContain("Make the two leads argue before the chorus.");
    expect(html).toContain(
      "Provider reply: I would add conflict before the chorus payoff.",
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
        responseMode="revise"
        task={task}
      />,
    );

    expect(html).toContain("AI\u5bf9\u8bdd");
    expect(html).toContain("AI\u4fee\u6539");
    expect(html).toContain("\u6545\u4e8b\u6838\u5fc3");
    expect(html).not.toContain("Provider reply:");
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
      body: "Sample Script Title: A structured MV world summary. 1 storyboard shots ready.",
    });
  });
});
