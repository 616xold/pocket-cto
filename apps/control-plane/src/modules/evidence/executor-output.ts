import type { RuntimeCodexRunTurnResult } from "../runtime-codex/types";
import type { ExecutorValidationReport } from "../validation";

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

function buildValidationPassedSentence(validation: ExecutorValidationReport) {
  if (validation.changedPaths.length === 0) {
    return "Validation passed with no changed paths and a clean git diff check.";
  }

  return `Validation passed for ${formatChangedPathSummary(
    validation.changedPaths,
  )} and a clean git diff check.`;
}

function buildValidationFailureReason(validation: ExecutorValidationReport) {
  const reasons: string[] = [];

  if (validation.escapedPaths.length > 0) {
    reasons.push(
      `changed paths escaped the allowed-path boundary (${formatChangedPathSummary(
        validation.escapedPaths,
      )})`,
    );
  }

  if (!validation.diffCheckPassed) {
    reasons.push("git diff --check reported whitespace or merge-marker issues");
  }

  return reasons.join("; ") || "a local executor validation hook failed";
}

function extractSection(text: string | null, heading: string) {
  if (!text) {
    return null;
  }

  const escapedHeading = escapeRegExp(heading);
  const match = text.match(
    new RegExp(
      `(?:^|\\n)##\\s*${escapedHeading}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`,
      "i",
    ),
  );

  const section = match?.[1]
    ?.split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ");

  return section?.trim() || null;
}

function formatChangedPathSummary(paths: string[]) {
  if (paths.length === 1) {
    return paths[0] ?? "1 changed path";
  }

  const [firstPath] = paths;

  return firstPath
    ? `${firstPath} (+${paths.length - 1} more)`
    : `${paths.length} changed paths`;
}

function normalizeSentence(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return "Executor completed workspace changes.";
  }

  return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
}

function truncate(value: string, maxLength: number) {
  return value.length <= maxLength
    ? value
    : `${value.slice(0, maxLength - 3).trimEnd()}...`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
