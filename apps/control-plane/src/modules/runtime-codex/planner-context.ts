import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { MissionRecord, MissionTaskRecord } from "@pocket-cto/domain";
import type { WorkspaceRecord } from "../workspaces";

const WORKFLOW_EXCERPT_MAX_CHARS = 1_600;
const WORKFLOW_EXCERPT_MAX_LINES = 24;

export type PlannerWorkflowPolicyContext = {
  excerpt: string;
  path: string;
  truncated: boolean;
};

export type PlannerPromptContext = {
  mission: {
    acceptance: string[];
    constraints: MissionRecord["spec"]["constraints"];
    evidenceRequirements: string[];
    objective: string;
    type: MissionRecord["type"];
  };
  task: {
    role: MissionTaskRecord["role"];
    sequence: number;
  };
  workflowPolicy: PlannerWorkflowPolicyContext | null;
  workspace: {
    branchName: string | null;
    repo: string;
    rootPath: string;
  };
};

export async function loadPlannerPromptContext(input: {
  mission: MissionRecord;
  task: MissionTaskRecord;
  workspace: WorkspaceRecord;
}): Promise<PlannerPromptContext> {
  return {
    mission: {
      acceptance: [...input.mission.spec.acceptance],
      constraints: input.mission.spec.constraints,
      evidenceRequirements: [...input.mission.spec.evidenceRequirements],
      objective: input.mission.objective,
      type: input.mission.type,
    },
    task: {
      role: input.task.role,
      sequence: input.task.sequence,
    },
    workflowPolicy: await readWorkflowPolicyContext(input.workspace.rootPath),
    workspace: {
      branchName: input.workspace.branchName,
      repo: input.workspace.repo,
      rootPath: input.workspace.rootPath,
    },
  };
}

export async function readWorkflowPolicyContext(
  workspaceRoot: string,
): Promise<PlannerWorkflowPolicyContext | null> {
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
  return (
    error instanceof Error &&
    "code" in error &&
    error.code === "ENOENT"
  );
}
