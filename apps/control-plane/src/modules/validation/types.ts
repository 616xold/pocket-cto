import type { MissionRecord, MissionTaskRecord } from "@pocket-cto/domain";

export type ExecutorValidationContext = {
  mission: MissionRecord;
  task: MissionTaskRecord;
  workspaceRoot: string;
};

export type ExecutorValidationCheckResult = {
  code?: string;
  details?: Record<string, unknown>;
  name: string;
  status: "passed" | "failed";
  summary: string;
};

export type ExecutorValidationFailureCode =
  | "none"
  | "no_changes"
  | "guardrail_failed";

export type ExecutorValidationHookState = {
  changedPaths: string[];
  diffCheckOutput: string | null;
  diffCheckPassed: boolean;
  escapedPaths: string[];
};

export type ExecutorValidationReport = {
  changedPaths: string[];
  checks: ExecutorValidationCheckResult[];
  diffCheckOutput: string | null;
  diffCheckPassed: boolean;
  escapedPaths: string[];
  failureCode: ExecutorValidationFailureCode;
  status: "passed" | "failed";
};

export interface ExecutorValidationHook {
  name: string;
  run(
    context: ExecutorValidationContext,
    state: ExecutorValidationHookState,
  ): Promise<ExecutorValidationCheckResult>;
}

export interface ExecutorValidationService {
  validateExecutorTurn(
    context: ExecutorValidationContext,
  ): Promise<ExecutorValidationReport>;
}
