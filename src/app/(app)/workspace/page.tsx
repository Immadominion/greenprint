import type { Metadata } from "next";
import { WorkspaceClient } from "@/components/app/workspace-client";

export const metadata: Metadata = { title: "Analyze" };

export default function WorkspacePage() {
  return <WorkspaceClient />;
}
