import { buildExecutorValidationHooks } from "./hooks";
import type { WorkspaceValidationGitClient } from "./git-client";
import type {
  ExecutorValidationFailureCode,
  ExecutorValidationHook,
  ExecutorValidationHookState,
  ExecutorValidationReport,
  ExecutorValidationService,
} from "./types";

export class LocalExecutorValidationService
  implements ExecutorValidationService
{
  private readonly hooks: ExecutorValidationHook[];

  constructor(
    gitClient: WorkspaceValidationGitClient,
    hooks: ExecutorValidationHook[] = buildExecutorValidationHooks(gitClient),
  ) {
    this.hooks = hooks;
  }

  async validateExecutorTurn(
    context: Parameters<ExecutorValidationService["validateExecutorTurn"]>[0],
  ): Promise<ExecutorValidationReport> {
    const state: ExecutorValidationHookState = {
      changedPaths: [],
      diffCheckOutput: null,
      diffCheckPassed: true,
      escapedPaths: [],
    };
    const checks: ExecutorValidationReport["checks"] = [];

    for (const hook of this.hooks) {
      try {
        checks.push(await hook.run(context, state));
      } catch (error) {
        checks.push({
          code: "hook_error",
          details: {
            error: formatValidationError(error),
          },
          name: hook.name,
          status: "failed" as const,
          summary: `${hook.name} failed unexpectedly.`,
        });
      }
    }

    return {
      changedPaths: [...state.changedPaths],
      checks,
      diffCheckOutput: state.diffCheckOutput,
      diffCheckPassed: state.diffCheckPassed,
      escapedPaths: [...state.escapedPaths],
      failureCode: resolveFailureCode(checks),
      status: checks.some((check) => check.status === "failed")
        ? "failed"
        : "passed",
    };
  }
}

function resolveFailureCode(
  checks: ExecutorValidationReport["checks"],
): ExecutorValidationFailureCode {
  if (!checks.some((check) => check.status === "failed")) {
    return "none";
  }

  if (checks.some((check) => check.code === "no_changes")) {
    return "no_changes";
  }

  return "guardrail_failed";
}

function formatValidationError(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
    };
  }

  return {
    message: String(error),
    name: "UnknownValidationError",
  };
}
