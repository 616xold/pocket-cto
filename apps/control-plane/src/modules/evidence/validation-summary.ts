import type { ExecutorValidationReport } from "../validation";

export function buildValidationPassedSentence(
  validation: ExecutorValidationReport,
) {
  return `Validation passed for ${formatChangedPathSummary(
    validation.changedPaths,
  )} and a clean git diff check.`;
}

export function buildValidationFailureReason(
  validation: ExecutorValidationReport,
) {
  if (validation.failureCode === "no_changes") {
    return "the executor turn completed without changing any files";
  }

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

  const unexpectedHookFailure = validation.checks.find(
    (check) => check.code === "hook_error",
  );

  if (unexpectedHookFailure) {
    reasons.push(
      `${unexpectedHookFailure.name} failed unexpectedly during local validation`,
    );
  }

  return reasons.join("; ") || "a local executor validation hook failed";
}

export function formatChangedPathSummary(paths: string[]) {
  if (paths.length === 1) {
    return paths[0] ?? "1 changed path";
  }

  const [firstPath] = paths;

  return firstPath
    ? `${firstPath} (+${paths.length - 1} more)`
    : `${paths.length} changed paths`;
}
