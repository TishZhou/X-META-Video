/** @vitest-environment jsdom */

import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type {
  ImageGenerationResponse,
  TextGenerationResponse,
} from "@xmeta/shared-contracts";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import type { RunImageGenerationOptions } from "@/lib/image-node/api";
import type { RunTextGenerationOptions } from "@/lib/text-node/api";

import { WorkflowCanvasWorkspace } from "./workflow-canvas-workspace";

beforeAll(() => {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: 1280,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: 720,
  });
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(Element.prototype, "hasPointerCapture", {
    configurable: true,
    value: () => false,
  });
  Object.defineProperty(Element.prototype, "setPointerCapture", {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(Element.prototype, "releasePointerCapture", {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
});

function textGenerationResult(
  options: RunTextGenerationOptions,
): TextGenerationResponse {
  const task1 = options.task === "ip_worldview";

  return {
    project_id: options.projectId,
    node_id: options.nodeId,
    node_type: "script",
    provider: "test-provider",
    model: "test-model",
    content: task1
      ? "IP叙事定位：冰核梦境。\n世界观规则：记忆通过冰层裂痕苏醒。\n人物定位：Mira 负责突破。"
      : "Mira 有红棕色长辫，外貌冷艳利落。她的性格坚定果敢，动作沉稳；声线是成熟中低音，音色厚实。",
    metadata: {
      task: options.task,
      data_type: task1 ? "script" : "character",
      input_source: options.source,
      prompt_template_id: task1
        ? "text.ip_worldview.v1"
        : "text.character_profiles.v1",
    },
    persisted: false,
  };
}

function imageGenerationResult(
  options: RunImageGenerationOptions,
): ImageGenerationResponse {
  return {
    project_id: options.projectId,
    node_id: options.nodeId,
    node_type: options.nodeType,
    provider: "doubao-seedream",
    model: "doubao-seedream-5-0-260128",
    prompt: options.prompt,
    image: {
      url: "https://image.example/character-base.png",
      b64_json: null,
      mime_type: "image/png",
      width: 1024,
      height: 1536,
    },
    persisted: false,
  };
}

describe("WorkflowCanvasWorkspace Text node interactions", () => {
  it("limits Add node to the supported Text, Image, Audio, and Video models", async () => {
    const user = userEvent.setup();
    const { container } = render(<WorkflowCanvasWorkspace />);

    await user.click(screen.getByRole("button", { name: "Add node" }));

    const menu = container.querySelector<HTMLElement>(
      '[data-workspace-add-menu="true"]',
    );
    expect(menu).not.toBeNull();
    expect(within(menu!).getAllByRole("button")).toHaveLength(5);
    expect(within(menu!).getByRole("button", { name: /Add Data:/ })).toBeTruthy();
    expect(within(menu!).getByRole("button", { name: /Add Text:/ })).toBeTruthy();
    expect(within(menu!).getByRole("button", { name: /Add Image:/ })).toBeTruthy();
    expect(within(menu!).getByRole("button", { name: /Add Audio:/ })).toBeTruthy();
    expect(within(menu!).getByRole("button", { name: /Add Video:/ })).toBeTruthy();
    expect(within(menu!).queryByText(/Storyboard:/)).toBeNull();
    expect(within(menu!).queryByText(/Image Composition:/)).toBeNull();
  });

  it("keeps the current canvas viewport stable when the window resizes", async () => {
    const originalWidth = window.innerWidth;
    const originalHeight = window.innerHeight;
    const { container } = render(<WorkflowCanvasWorkspace />);
    const stage = container.querySelector<HTMLElement>(
      '[data-workflow-canvas-stage="true"]',
    );
    const initialTransform = stage?.style.transform;

    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 640,
    });
    window.dispatchEvent(new Event("resize"));

    await waitFor(() => {
      expect(stage?.style.transform).toBe(initialTransform);
    });

    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: originalWidth,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: originalHeight,
    });
  });

  it("keeps each Data node's local text and attachment status isolated", async () => {
    const user = userEvent.setup();
    const { container } = render(<WorkflowCanvasWorkspace />);

    await user.click(screen.getByRole("button", { name: "Add node" }));
    await user.click(screen.getByRole("button", { name: /Add Data:/ }));
    const firstEditor = await screen.findByLabelText("Data node editor");
    await user.type(
      within(firstEditor).getByRole("textbox", { name: "Data text content" }),
      "Reusable opening brief",
    );
    expect(container.querySelector('[data-data-node-preview="text"]')?.textContent).toContain(
      "Reusable opening brief",
    );

    await user.selectOptions(screen.getByRole("combobox", { name: "Data type" }), "image");
    expect(screen.getByText(/file attachment is not implemented yet/i)).toBeTruthy();
    expect(screen.getByText(/No media is attached or ready to use/i)).toBeTruthy();
    const unavailablePort = container.querySelector<HTMLButtonElement>(
      '[data-workflow-port-unavailable="true"]',
    );
    expect(unavailablePort?.disabled).toBe(true);
    expect(unavailablePort?.getAttribute("aria-label")).toContain("unavailable");

    await user.click(screen.getByRole("button", { name: "Add node" }));
    await user.click(screen.getByRole("button", { name: /Add Data:/ }));
    expect(
      (screen.getByRole("combobox", { name: "Data type" }) as HTMLSelectElement).value,
    ).toBe("text");
    expect(
      (screen.getByRole("textbox", { name: "Data text content" }) as HTMLTextAreaElement).value,
    ).toBe("");
  });

  it("generates Image Task 1 through the injected Image API runner and creates one result edge", async () => {
    const user = userEvent.setup();
    const imageGenerationRunner = vi.fn(
      async (options: RunImageGenerationOptions) => imageGenerationResult(options),
    );
    const { container } = render(
      <WorkflowCanvasWorkspace imageGenerationRunner={imageGenerationRunner} />,
    );

    await user.click(screen.getByRole("button", { name: "Add node" }));
    await user.click(screen.getByRole("button", { name: /Add Image:/ }));
    const sourceCard = container.querySelector<HTMLElement>(
      '[data-workflow-node="image"][data-workflow-node-role="source"]',
    );
    await user.click(within(sourceCard!).getAllByRole("button")[0]!);

    const taskSelect = await screen.findByRole("combobox", {
      name: "Image task",
    });
    await user.click(taskSelect);
    await user.click(
      await screen.findByRole("option", {
        name: "Task 1 · Character base image",
      }),
    );

    const appearance = screen.getByRole("textbox", {
      name: "Character appearance",
    });
    const personality = screen.getByRole("textbox", {
      name: "Personality / action description",
    });
    await user.type(appearance, "Sharp face, red-brown braids, cyber-baroque outfit.");
    await user.type(personality, "Composed, protective, elegant movement with fierce stage presence.");
    await user.click(
      screen.getByRole("button", { name: "Complete Image Task 1" }),
    );

    await waitFor(() => expect(imageGenerationRunner).toHaveBeenCalledTimes(1));
    expect(imageGenerationRunner.mock.calls[0]?.[0]).toMatchObject({
      nodeType: "character_image",
      referenceImageUrl: null,
      referenceImageB64: null,
      referenceImageMimeType: null,
    });
    expect(imageGenerationRunner.mock.calls[0]?.[0].prompt).toContain(
      "Character appearance: Sharp face, red-brown braids, cyber-baroque outfit.",
    );
    expect(imageGenerationRunner.mock.calls[0]?.[0].prompt).toContain(
      "Personality and action language: Composed, protective, elegant movement with fierce stage presence.",
    );

    const result = await screen.findByLabelText(
      "Character base image result data outcome",
    );
    expect(
      result
        .querySelector('[data-data-image-outcome-preview="true"]')
        ?.getAttribute("src"),
    ).toBe("https://image.example/character-base.png");
    expect(result.getAttribute("data-workflow-node")).toBe("data");
    expect(result.getAttribute("data-workflow-node-role")).toBe("outcome");
    expect(result.querySelector("article")).toBeNull();
    expect(result.querySelector("img")?.className).toContain("object-contain");
    expect(result.textContent).toContain(
      "Backend: doubao-seedream / doubao-seedream-5-0-260128",
    );
    expect(result.textContent).toContain("not saved to the asset library yet");
    expect(container.querySelectorAll('[data-workflow-edge-hit="true"]')).toHaveLength(3);

    await user.click(screen.getByRole("button", { name: "Add node" }));
    await user.click(screen.getByRole("button", { name: /Add Image:/ }));
    const secondSourceCard = container.querySelectorAll<HTMLElement>(
      '[data-workflow-node="image"][data-workflow-node-role="source"]',
    )[1];
    await user.click(within(secondSourceCard!).getAllByRole("button")[0]!);
    expect(screen.getByRole("combobox", { name: "Image task" }).textContent).toContain(
      "Prompt generation & edit",
    );
  });

  it("selects tasks with the keyboard and hands edited Task 1 text into Task 2", async () => {
    const user = userEvent.setup();
    const textGenerationRunner = vi.fn(
      async (options: RunTextGenerationOptions) =>
        textGenerationResult(options),
    );
    const { container } = render(
      <WorkflowCanvasWorkspace
        textGenerationRunner={textGenerationRunner}
      />,
    );

    const briefInput = screen.getByRole("textbox", { name: "Brief idea" });
    await user.clear(briefInput);
    await user.type(briefInput, "Four girls awaken a frozen dream world.");
    await user.click(
      screen.getByRole("button", { name: "Generate Text node" }),
    );

    await waitFor(() => expect(textGenerationRunner).toHaveBeenCalledTimes(1));
    expect(textGenerationRunner.mock.calls[0]?.[0]).toMatchObject({
      task: "ip_worldview",
      content: "Four girls awaken a frozen dream world.",
      source: { type: "manual" },
    });
    expect(
      container.querySelectorAll('[data-workflow-edge-hit="true"]'),
    ).toHaveLength(3);

    const task1Card = container.querySelector<HTMLElement>(
      '[data-workflow-node-role="outcome"][data-workflow-output-data-type="script"]',
    );
    expect(task1Card).not.toBeNull();
    const task1Outcome = within(task1Card!).getByRole("textbox", {
      name: "Text outcome",
    });
    expect((task1Outcome as HTMLTextAreaElement).value).toContain(
      "冰核梦境",
    );
    await user.clear(task1Outcome);
    await user.type(task1Outcome, "Edited canonical Task 1 outcome.");
    expect((task1Outcome as HTMLTextAreaElement).value).toBe(
      "Edited canonical Task 1 outcome.",
    );

    const sourceCard = container.querySelector<HTMLElement>(
      '[data-workflow-node="script"][data-workflow-node-role="source"]',
    );
    expect(sourceCard).not.toBeNull();
    await user.click(within(sourceCard!).getAllByRole("button")[0]!);

    const taskSelect = screen.getByRole("combobox", { name: "Text task" });
    await user.click(taskSelect);
    await user.keyboard("{ArrowDown}{Enter}");

    await screen.findByText("Input source: Same-node Task 1 outcome");
    expect(taskSelect.textContent).toContain("Character profiles & voices");
    await user.click(
      screen.getByRole("button", { name: "Generate Text node" }),
    );

    await waitFor(() => expect(textGenerationRunner).toHaveBeenCalledTimes(2));
    expect(textGenerationRunner.mock.calls[1]?.[0]).toMatchObject({
      task: "character_profiles",
      content: "Edited canonical Task 1 outcome.",
      source: {
        type: "same_node_task_1",
        source_node_id: "script-1:script-outcome",
        source_task: "ip_worldview",
      },
    });

    const task2Card = container.querySelector<HTMLElement>(
      '[data-workflow-node-role="outcome"][data-workflow-output-data-type="character"]',
    );
    expect(task2Card).not.toBeNull();
    const task2Outcome = within(task2Card!).getByRole("textbox", {
      name: "Text outcome",
    });
    expect((task2Outcome as HTMLTextAreaElement).value).toContain(
      "Mira 有红棕色长辫",
    );
    await user.clear(task2Outcome);
    await user.type(task2Outcome, "Edited Task 2 character profile.");
    expect((task2Outcome as HTMLTextAreaElement).value).toBe(
      "Edited Task 2 character profile.",
    );

    expect(task1Card!.style.left).not.toBe(task2Card!.style.left);
    expect(task1Card!.style.top).toBe(task2Card!.style.top);
    expect(within(task1Card!).getByText(/Backend: test-provider/)).toBeTruthy();
    expect(within(task2Card!).getByText(/Backend: test-provider/)).toBeTruthy();
  });
});
