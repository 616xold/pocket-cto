import type {
  MissionRecord,
  MissionTaskRecord,
  MissionTaskStatus,
  ProofBundleManifest,
} from "@pocket-cto/domain";
import type { PersistenceSession } from "../../lib/persistence";
import type { MissionRepository } from "../missions/repository";
import type { ReplayService } from "../replay/service";
import type { RuntimeCodexRunTurnResult } from "../runtime-codex/types";
import type { ExecutorValidationReport } from "../validation";
import { buildDiffSummaryArtifact } from "./diff-summary";
import { buildLogExcerptArtifact } from "./log-excerpt";
import type { EvidenceArtifactDraft, EvidenceService } from "./service";
import { extractMarkdownSection, flattenMarkdownText, truncate } from "./text";
import { buildTestReportArtifact } from "./test-report";

const PROOF_BUNDLE_SUMMARY_MAX_LENGTH = 240;

export type PreparedRuntimeArtifactEvidence = {
  artifactDrafts: EvidenceArtifactDraft[];
  changeSummary: string | null;
  proofBundle: ProofBundleManifest | null;
  riskSummary: string | null;
  rollbackSummary: string | null;
  terminalTaskStatus: MissionTaskStatus;
  verificationSummary: string | null;
};

type RuntimeArtifactDeps = {
  evidenceService: Pick<EvidenceService, "attachRuntimeArtifactsToProofBundle">;
  missionRepository: Pick<
    MissionRepository,
    | "saveArtifact"
    | "upsertProofBundle"
  >;
  replayService: Pick<ReplayService, "append">;
};

export function prepareExecutorRuntimeEvidence(input: {
  mission: MissionRecord;
  proofBundle: ProofBundleManifest | null;
  task: MissionTaskRecord;
  terminalSummary: string | null;
  terminalTaskStatus: MissionTaskStatus;
  turn: RuntimeCodexRunTurnResult;
  validation: ExecutorValidationReport | null;
}): PreparedRuntimeArtifactEvidence | null {
  if (input.task.role !== "executor") {
    return null;
  }

  const diffSummaryArtifact = input.validation
    ? buildDiffSummaryArtifact({
        mission: input.mission,
        task: input.task,
        terminalSummary: input.terminalSummary,
        terminalTaskStatus: input.terminalTaskStatus,
        turn: input.turn,
        validation: input.validation,
      })
    : null;
  const testReportArtifact = input.validation
    ? buildTestReportArtifact({
        mission: input.mission,
        task: input.task,
        terminalTaskStatus: input.terminalTaskStatus,
        turn: input.turn,
        validation: input.validation,
      })
    : null;
  const logExcerptArtifact =
    input.terminalTaskStatus === "succeeded"
      ? null
      : buildLogExcerptArtifact({
          mission: input.mission,
          task: input.task,
          terminalSummary: input.terminalSummary,
          terminalTaskStatus: input.terminalTaskStatus,
          turn: input.turn,
          validation: input.validation,
        });

  const artifactDrafts = [
    diffSummaryArtifact?.artifactDraft,
    testReportArtifact?.artifactDraft,
    logExcerptArtifact?.artifactDraft,
  ].filter((artifact): artifact is EvidenceArtifactDraft => Boolean(artifact));

  if (artifactDrafts.length === 0) {
    return null;
  }

  return {
    artifactDrafts,
    changeSummary:
      diffSummaryArtifact?.summary ??
      buildFallbackChangeSummary(input.turn, input.terminalSummary),
    proofBundle: input.proofBundle,
    riskSummary: buildRiskSummary(input.turn, input.terminalSummary),
    rollbackSummary: buildRollbackSummary(input.terminalTaskStatus),
    terminalTaskStatus: input.terminalTaskStatus,
    verificationSummary: testReportArtifact?.summary ?? null,
  };
}

export async function persistExecutorRuntimeEvidence(input: {
  deps: RuntimeArtifactDeps;
  preparedEvidence: PreparedRuntimeArtifactEvidence;
  session: PersistenceSession;
  task: MissionTaskRecord;
}): Promise<void> {
  if (input.task.role !== "executor") {
    return;
  }

  const persistedArtifacts = [];

  for (const artifactDraft of input.preparedEvidence.artifactDrafts) {
    const artifact = await input.deps.missionRepository.saveArtifact(
      artifactDraft,
      input.session,
    );
    persistedArtifacts.push(artifact);

    await input.deps.replayService.append(
      {
        missionId: input.task.missionId,
        taskId: input.task.id,
        type: "artifact.created",
        payload: {
          artifactId: artifact.id,
          kind: artifact.kind,
        },
      },
      input.session,
    );
  }

  if (
    input.preparedEvidence.proofBundle &&
    persistedArtifacts.length > 0
  ) {
    await input.deps.missionRepository.upsertProofBundle(
      input.deps.evidenceService.attachRuntimeArtifactsToProofBundle(
        input.preparedEvidence.proofBundle,
        {
          artifacts: persistedArtifacts,
          changeSummary: input.preparedEvidence.changeSummary,
          riskSummary: input.preparedEvidence.riskSummary,
          rollbackSummary: input.preparedEvidence.rollbackSummary,
          task: input.task,
          terminalTaskStatus: input.preparedEvidence.terminalTaskStatus,
          verificationSummary: input.preparedEvidence.verificationSummary,
        },
      ),
      input.session,
    );
  }
}

function buildFallbackChangeSummary(
  turn: RuntimeCodexRunTurnResult,
  terminalSummary: string | null,
) {
  const intendedChange = flattenMarkdownText(
    extractMarkdownSection(turn.finalAgentMessageText, "Intended change"),
  );

  if (intendedChange) {
    return truncate(intendedChange, PROOF_BUNDLE_SUMMARY_MAX_LENGTH);
  }

  if (terminalSummary) {
    return truncate(terminalSummary, PROOF_BUNDLE_SUMMARY_MAX_LENGTH);
  }

  return null;
}

function buildRiskSummary(
  turn: RuntimeCodexRunTurnResult,
  terminalSummary: string | null,
) {
  const remainingRisks = flattenMarkdownText(
    extractMarkdownSection(turn.finalAgentMessageText, "Remaining risks"),
  );

  if (remainingRisks) {
    return truncate(remainingRisks, PROOF_BUNDLE_SUMMARY_MAX_LENGTH);
  }

  if (terminalSummary) {
    return truncate(terminalSummary, PROOF_BUNDLE_SUMMARY_MAX_LENGTH);
  }

  return null;
}

function buildRollbackSummary(terminalTaskStatus: MissionTaskStatus) {
  if (terminalTaskStatus === "failed") {
    return "Safe fallback: inspect the log excerpt and test report, then retry the executor task after fixing the local validation issue.";
  }

  return "No GitHub PR exists yet. Review the diff summary and local workspace before any manual follow-up.";
}
