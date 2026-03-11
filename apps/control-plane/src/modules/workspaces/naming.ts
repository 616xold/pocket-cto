import { isAbsolute, relative, resolve } from "node:path";
import type { WorkspaceDefinition, WorkspaceTaskTarget } from "./types";

export function buildWorkspaceDefinition(input: {
  sourceRepoRoot: string;
  task: WorkspaceTaskTarget;
  workspaceRoot: string;
}): WorkspaceDefinition {
  const workspaceRoot = resolve(input.workspaceRoot);
  const workspacePath = resolve(
    workspaceRoot,
    input.task.missionId,
    buildWorkspaceTaskSegment(input.task),
  );

  assertPathWithinRoot(workspaceRoot, workspacePath);

  return {
    branchName: `pocket-cto/${input.task.missionId}/${buildWorkspaceTaskSegment(input.task)}`,
    repo: resolve(input.sourceRepoRoot),
    rootPath: workspacePath,
  };
}

export function buildWorkspaceTaskSegment(task: WorkspaceTaskTarget) {
  return `${task.sequence}-${task.role}`;
}

function assertPathWithinRoot(rootPath: string, candidatePath: string) {
  const relativePath = relative(rootPath, candidatePath);

  if (
    relativePath === "" ||
    (!relativePath.startsWith("..") && !isAbsolute(relativePath))
  ) {
    return;
  }

  throw new Error(
    `Workspace path ${candidatePath} escapes workspace root ${rootPath}`,
  );
}

