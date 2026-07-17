/** @vitest-environment jsdom */

import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TextGenerationResponse } from "@xmeta/shared-contracts";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

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

describe("WorkflowCanvasWorkspace Text node interactions", () => {
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
