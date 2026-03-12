import { readFile } from "node:fs/promises";
import { join } from "node:path";

const WORKFLOW_EXCERPT_MAX_CHARS = 1_600;
const WORKFLOW_EXCERPT_MAX_LINES = 24;

export type WorkflowPolicyContext = {
  excerpt: string;
  path: string;
  truncated: boolean;
};

export async function readWorkflowPolicyContext(
  workspaceRoot: string,
): Promise<WorkflowPolicyContext | null> {
  const workflowPath = join(workspaceRoot, "WORKFLOW.md");

  try {
    const content = await readFile(workflowPath, "utf8");
    const excerpt = buildWorkflowPolicyExcerpt(content);

    return {
      ...excerpt,
      path: workflowPath,
    };
  } catch (error) {
    if (isMissingFileError(error)) {
      return null;
    }

    throw error;
  }
}

export function buildWorkflowPolicyExcerpt(source: string): {
  excerpt: string;
  truncated: boolean;
} {
  const normalized = source.replace(/\r\n/g, "\n").trim();

  if (!normalized) {
    return {
      excerpt: "(WORKFLOW.md exists but is empty.)",
      truncated: false,
    };
  }

  const lines = normalized.split("\n");
  const limitedByLines = lines.slice(0, WORKFLOW_EXCERPT_MAX_LINES).join("\n");
  let excerpt = limitedByLines;
  let truncated = lines.length > WORKFLOW_EXCERPT_MAX_LINES;

  if (excerpt.length > WORKFLOW_EXCERPT_MAX_CHARS) {
    excerpt = excerpt.slice(0, WORKFLOW_EXCERPT_MAX_CHARS).trimEnd();
    truncated = true;
  }

  if (truncated) {
    excerpt = `${excerpt.trimEnd()}\n...`;
  }

  return {
    excerpt,
    truncated,
  };
}

function isMissingFileError(error: unknown) {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
