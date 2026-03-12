import { buildExecutorValidationHooks } from "./hooks";
import type { WorkspaceValidationGitClient } from "./git-client";
import type {
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
    const checks = [];

    for (const hook of this.hooks) {
      checks.push(await hook.run(context, state));
    }

    return {
      changedPaths: [...state.changedPaths],
      checks,
      diffCheckOutput: state.diffCheckOutput,
      diffCheckPassed: state.diffCheckPassed,
      escapedPaths: [...state.escapedPaths],
      status: checks.some((check) => check.status === "failed")
        ? "failed"
        : "passed",
    };
  }
}
