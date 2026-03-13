import type { MissionRecord, MissionTaskRecord, MissionTaskStatus } from "@pocket-cto/domain";
import type { RuntimeCodexRunTurnResult } from "../runtime-codex/types";
import type { ExecutorValidationReport } from "../validation";
import type { EvidenceArtifactDraft } from "./service";
import { truncate } from "./text";
import {
  buildValidationFailureReason,
  buildValidationPassedSentence,
} from "./validation-summary";

const TEST_REPORT_MAX_LENGTH = 240;

export function buildTestReportArtifact(input: {
  mission: MissionRecord;
  task: MissionTaskRecord;
  terminalTaskStatus: MissionTaskStatus;
  turn: RuntimeCodexRunTurnResult;
  validation: ExecutorValidationReport;
}): {
  artifactDraft: EvidenceArtifactDraft;
  summary: string;
} {
  const summary =
    input.validation.status === "passed"
      ? truncate(
          `Local executor validation passed. ${buildValidationPassedSentence(
            input.validation,
          )}`,
          TEST_REPORT_MAX_LENGTH,
        )
      : truncate(
          `Local executor validation failed: ${buildValidationFailureReason(
            input.validation,
          )}.`,
          TEST_REPORT_MAX_LENGTH,
        );
  const body = [
    "# Test Report Placeholder",
    "Pocket CTO M1.7 uses local executor validation as verification evidence until richer test-runner and CI integrations land.",
    "",
    "## Overall status",
    input.validation.status,
    "",
    "## Checks",
    ...input.validation.checks.map(
      (check) => `- ${check.name}: ${check.status} - ${check.summary}`,
    ),
    "",
    "## Diff check output",
    input.validation.diffCheckOutput ?? "No diff-check output was emitted.",
    "",
    "## Runtime provenance",
    `- mission id: ${input.mission.id}`,
    `- task id: ${input.task.id}`,
    `- task terminal status: ${input.terminalTaskStatus}`,
    `- thread id: ${input.turn.threadId}`,
    `- turn id: ${input.turn.turnId}`,
  ].join("\n");

  return {
    artifactDraft: {
      missionId: input.mission.id,
      taskId: input.task.id,
      kind: "test_report",
      uri: `pocket-cto://missions/${input.mission.id}/tasks/${input.task.id}/test-report`,
      mimeType: "text/markdown",
      sha256: null,
      metadata: {
        body,
        changedPaths: input.validation.changedPaths,
        checks: input.validation.checks,
        diffCheckOutput: input.validation.diffCheckOutput,
        diffCheckPassed: input.validation.diffCheckPassed,
        escapedPaths: input.validation.escapedPaths,
        failureCode: input.validation.failureCode,
        generatedAt: new Date().toISOString(),
        source: "executor_validation",
        summary,
        taskRole: input.task.role,
        terminalTaskStatus: input.terminalTaskStatus,
        threadId: input.turn.threadId,
        turnId: input.turn.turnId,
        validationStatus: input.validation.status,
      },
    },
    summary,
  };
}
