import type { MissionRecord, MissionTaskRecord, MissionTaskStatus } from "@pocket-cto/domain";
import type { RuntimeCodexRunTurnResult } from "../runtime-codex/types";
import type { ExecutorValidationReport } from "../validation";
import type { EvidenceArtifactDraft } from "./service";
import { normalizeTextBlock, truncate } from "./text";

const LOG_EXCERPT_BODY_MAX_LENGTH = 1200;
const LOG_EXCERPT_SUMMARY_MAX_LENGTH = 240;

export function buildLogExcerptArtifact(input: {
  mission: MissionRecord;
  task: MissionTaskRecord;
  terminalSummary: string | null;
  terminalTaskStatus: MissionTaskStatus;
  turn: RuntimeCodexRunTurnResult;
  validation: ExecutorValidationReport | null;
}): {
  artifactDraft: EvidenceArtifactDraft;
  summary: string;
} | null {
  const finalReportExcerpt = input.turn.finalAgentMessageText
    ? truncate(normalizeTextBlock(input.turn.finalAgentMessageText), LOG_EXCERPT_BODY_MAX_LENGTH)
    : null;
  const diffCheckExcerpt = input.validation?.diffCheckOutput
    ? truncate(normalizeTextBlock(input.validation.diffCheckOutput), LOG_EXCERPT_BODY_MAX_LENGTH)
    : null;

  if (!input.terminalSummary && !finalReportExcerpt && !diffCheckExcerpt) {
    return null;
  }

  const summary = truncate(
    input.terminalTaskStatus === "failed"
      ? "Captured executor failure excerpts from runtime output and local validation."
      : "Captured executor runtime excerpts for operator review.",
    LOG_EXCERPT_SUMMARY_MAX_LENGTH,
  );
  const body = [
    "# Log Excerpt Placeholder",
    input.terminalTaskStatus === "failed"
      ? "Pocket CTO captured this concise failure-oriented runtime excerpt for review."
      : "Pocket CTO captured this concise runtime excerpt for review.",
    "",
    "## Terminal summary",
    input.terminalSummary ?? `Executor terminalized as ${input.terminalTaskStatus}.`,
    ...(finalReportExcerpt
      ? ["", "## Final report excerpt", finalReportExcerpt]
      : []),
    ...(diffCheckExcerpt
      ? ["", "## Validation output excerpt", diffCheckExcerpt]
      : []),
    "",
    "## Runtime provenance",
    `- mission id: ${input.mission.id}`,
    `- task id: ${input.task.id}`,
    `- task terminal status: ${input.terminalTaskStatus}`,
    `- runtime terminal status: ${input.turn.status}`,
    `- thread id: ${input.turn.threadId}`,
    `- turn id: ${input.turn.turnId}`,
  ].join("\n");

  return {
    artifactDraft: {
      missionId: input.mission.id,
      taskId: input.task.id,
      kind: "log_excerpt",
      uri: `pocket-cto://missions/${input.mission.id}/tasks/${input.task.id}/log-excerpt`,
      mimeType: "text/markdown",
      sha256: null,
      metadata: {
        body,
        diffCheckOutput: input.validation?.diffCheckOutput ?? null,
        generatedAt: new Date().toISOString(),
        source: "runtime_executor_output",
        summary,
        taskRole: input.task.role,
        terminalTaskStatus: input.terminalTaskStatus,
        threadId: input.turn.threadId,
        turnId: input.turn.turnId,
        validationStatus: input.validation?.status ?? null,
      },
    },
    summary,
  };
}
