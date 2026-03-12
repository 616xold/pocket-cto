import { posix as pathPosix } from "node:path";
import type { WorkspaceValidationGitClient } from "./git-client";
import type { ExecutorValidationHook } from "./types";

export function buildExecutorValidationHooks(
  gitClient: WorkspaceValidationGitClient,
): ExecutorValidationHook[] {
  return [
    {
      name: "changed_paths",
      async run(context, state) {
        state.changedPaths = await gitClient.collectChangedPaths(context.workspaceRoot);
        state.escapedPaths = findEscapedPaths(
          state.changedPaths,
          context.mission.spec.constraints.allowedPaths,
        );

        if (state.escapedPaths.length > 0) {
          return {
            details: {
              allowedPaths: context.mission.spec.constraints.allowedPaths,
              changedPaths: state.changedPaths,
              escapedPaths: state.escapedPaths,
            },
            name: "changed_paths",
            status: "failed",
            summary: `Changed paths escaped the allowed-path boundary: ${state.escapedPaths.join(", ")}`,
          };
        }

        return {
          details: {
            allowedPaths: context.mission.spec.constraints.allowedPaths,
            changedPaths: state.changedPaths,
          },
          name: "changed_paths",
          status: "passed",
          summary:
            state.changedPaths.length > 0
              ? `Captured changed paths: ${state.changedPaths.join(", ")}`
              : "Captured changed paths: none",
        };
      },
    },
    {
      name: "git_diff_check",
      async run(context, state) {
        const result = await gitClient.runDiffCheck(context.workspaceRoot);
        state.diffCheckPassed = result.ok;
        state.diffCheckOutput = result.output;

        return result.ok
          ? {
              name: "git_diff_check",
              status: "passed",
              summary: "git diff --check passed.",
            }
          : {
              details: {
                output: result.output,
              },
              name: "git_diff_check",
              status: "failed",
              summary: "git diff --check failed.",
            };
      },
    },
  ];
}

function findEscapedPaths(changedPaths: string[], allowedPaths: string[]) {
  if (allowedPaths.length === 0) {
    return [];
  }

  const normalizedAllowedPaths = allowedPaths.map(normalizeRelativePath);

  return changedPaths.filter((changedPath) => {
    const normalizedChangedPath = normalizeRelativePath(changedPath);

    return !normalizedAllowedPaths.some((allowedPath) => {
      return (
        normalizedChangedPath === allowedPath ||
        normalizedChangedPath.startsWith(`${allowedPath}/`)
      );
    });
  });
}

function normalizeRelativePath(value: string) {
  const normalized = pathPosix.normalize(value.replace(/\\/g, "/")).trim();
  return normalized.replace(/^\.\/+/, "").replace(/\/$/, "");
}
