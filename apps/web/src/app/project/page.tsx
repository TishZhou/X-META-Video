import type { Metadata } from "next";

import { WorkflowCanvasWorkspace } from "@/components/xmeta/workflow-canvas";

export const metadata: Metadata = {
  title: "Workspace Canvas | X-META Video",
  description: "Figma-like AI workflow canvas foundation for X-META Video.",
};

export default function ProjectPage() {
  return <WorkflowCanvasWorkspace />;
}
