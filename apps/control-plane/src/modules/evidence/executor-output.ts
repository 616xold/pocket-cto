import type { RuntimeCodexRunTurnResult } from "../runtime-codex/types";
import type { ExecutorValidationReport } from "../validation";
import {
  extractMarkdownSection,
  normalizeSentence,
  truncate,
} from "./text";
import {
  buildValidationFailureReason,
  buildValidationPassedSentence,
} from "./validation-summary";

const EXECUTOR_SUMMARY_MAX_LENGTH = 240;

export function buildExecutorTaskSummary(input: {
  turn: RuntimeCodexRunTurnResult;
  validation: ExecutorValidationReport;
}) {
  const intendedChange =
    extractSection(input.turn.finalAgentMessageText, "Intended change") ??
    "Executor completed workspace changes.";

  if (input.validation.status === "passed") {
    return truncate(
      `${normalizeSentence(intendedChange)} ${buildValidationPassedSentence(
        input.validation,
      )}`,
      EXECUTOR_SUMMARY_MAX_LENGTH,
    );
  }

  return truncate(
    `${normalizeSentence(intendedChange)} Validation failed: ${buildValidationFailureReason(
      input.validation,
    )}.`,
    EXECUTOR_SUMMARY_MAX_LENGTH,
  );
}

export function buildMissingPlannerArtifactSummary() {
  return "Executor could not start because no planner plan artifact was available for handoff.";
}

export function buildExecutorTerminalizationFailureSummary(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return truncate(
    `Executor completed a runtime turn, but local validation or terminalization failed: ${message}.`,
    EXECUTOR_SUMMARY_MAX_LENGTH,
  );
}

function extractSection(text: string | null, heading: string) {
  return extractMarkdownSection(text, heading)
    ?.split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .trim() ?? null;
}
