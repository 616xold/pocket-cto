import type { MissionRecord, MissionTaskRecord, MissionTaskStatus } from "@pocket-cto/domain";
import type { RuntimeCodexRunTurnResult } from "../runtime-codex/types";
import type { ExecutorValidationReport } from "../validation";
import type { EvidenceArtifactDraft } from "./service";
import {
  extractMarkdownSection,
  flattenMarkdownText,
  normalizeSentence,
  truncate,
} from "./text";
import {
  buildValidationFailureReason,
  formatChangedPathSummary,
} from "./validation-summary";

const DIFF_SUMMARY_MAX_LENGTH = 240;

export function buildDiffSummaryArtifact(input: {
  mission: MissionRecord;
  task: MissionTaskRecord;
  terminalSummary: string | null;
  terminalTaskStatus: MissionTaskStatus;
  turn: RuntimeCodexRunTurnResult;
  validation: ExecutorValidationReport;
}): {
  artifactDraft: EvidenceArtifactDraft;
  summary: string;
} | null {
  if (input.validation.changedPaths.length === 0) {
    return null;
  }

  const intendedChange =
    flattenMarkdownText(
      extractMarkdownSection(input.turn.finalAgentMessageText, "Intended change"),
    ) ?? flattenMarkdownText(input.terminalSummary);
  const summary = buildDiffSummary(input.validation, intendedChange);
  const body = [
    "# Diff Summary Placeholder",
    `Pocket CTO M1.7 captured this local diff summary for executor task ${input.task.sequence}.`,
    "",
    "## Intended change",
    intendedChange ?? "No explicit intended change was captured.",
    "",
    "## Changed paths",
    ...input.validation.changedPaths.map((path) => `- ${path}`),
    "",
    "## Validation posture",
    `- validation status: ${input.validation.status}`,
    `- git diff --check: ${input.validation.diffCheckPassed ? "passed" : "failed"}`,
    ...(input.validation.escapedPaths.length > 0
      ? [`- escaped paths: ${input.validation.escapedPaths.join(", ")}`]
      : []),
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
      kind: "diff_summary",
      uri: `pocket-cto://missions/${input.mission.id}/tasks/${input.task.id}/diff-summary`,
      mimeType: "text/markdown",
      sha256: null,
      metadata: {
        body,
        changedPaths: input.validation.changedPaths,
        diffCheckOutput: input.validation.diffCheckOutput,
        diffCheckPassed: input.validation.diffCheckPassed,
        escapedPaths: input.validation.escapedPaths,
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

function buildDiffSummary(
  validation: ExecutorValidationReport,
  intendedChange: string | null,
) {
  const changeScope = `Workspace changes touched ${formatChangedPathSummary(
    validation.changedPaths,
  )}.`;
  const summaryStart =
    normalizeSentence(intendedChange) ??
    normalizeSentence(`Executor updated ${formatChangedPathSummary(validation.changedPaths)}`) ??
    "Executor updated local workspace files.";

  if (validation.status === "passed") {
    return truncate(
      `${summaryStart} ${changeScope} Local diff guardrails passed.`,
      DIFF_SUMMARY_MAX_LENGTH,
    );
  }

  return truncate(
    `${summaryStart} ${changeScope} Validation failed: ${buildValidationFailureReason(
      validation,
    )}.`,
    DIFF_SUMMARY_MAX_LENGTH,
  );
}
