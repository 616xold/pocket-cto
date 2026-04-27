import type {
  CreateMonitorInvestigationMissionInput,
  MissionRecord,
  MissionSpec,
  MonitorInvestigationMonitorKind,
  MonitorInvestigationSeed,
  ProofBundleManifest,
} from "@pocket-cto/domain";
import {
  MissionSpecSchema,
  MonitorInvestigationSeedSchema,
  MonitorResultSchema,
  ProofBundleManifestSchema,
} from "@pocket-cto/domain";
import { AppHttpError } from "../../lib/http-errors";

const MONITOR_INVESTIGATION_KIND_LABELS = {
  cash_posture: "cash-posture",
  collections_pressure: "collections-pressure",
} satisfies Record<MonitorInvestigationMonitorKind, string>;

const SUPPORTED_MONITOR_INVESTIGATION_KINDS = new Set<string>(
  Object.keys(MONITOR_INVESTIGATION_KIND_LABELS),
);

export function buildMonitorResultSourceRef(monitorResultId: string) {
  return `pocket-cfo://monitor-results/${monitorResultId}`;
}

export function buildMonitorInvestigationSeed(input: {
  request: CreateMonitorInvestigationMissionInput;
  result: unknown;
}): MonitorInvestigationSeed {
  const rawResult = asRecord(input.result);

  if (!rawResult) {
    throw invalidMonitorInvestigationRequest(
      "monitorResultId",
      "Monitor result payload was not readable.",
    );
  }

  if (
    typeof rawResult.monitorKind !== "string" ||
    !SUPPORTED_MONITOR_INVESTIGATION_KINDS.has(rawResult.monitorKind)
  ) {
    throw invalidMonitorInvestigationRequest(
      "monitorKind",
      "Monitor-alert investigation handoff only supports cash_posture and collections_pressure monitor results.",
    );
  }

  const parsedResult = MonitorResultSchema.safeParse(input.result);

  if (!parsedResult.success) {
    throw invalidMonitorInvestigationRequest(
      "monitorResultId",
      "Stored monitor result is malformed and cannot seed an investigation.",
    );
  }

  const result = parsedResult.data;

  if (result.id !== input.request.monitorResultId) {
    throw invalidMonitorInvestigationRequest(
      "monitorResultId",
      "Stored monitor result id does not match the requested id.",
    );
  }

  if (result.companyKey !== input.request.companyKey) {
    throw invalidMonitorInvestigationRequest(
      "companyKey",
      "Requested companyKey does not match the stored monitor result.",
    );
  }

  if (result.status !== "alert") {
    throw invalidMonitorInvestigationRequest(
      "monitorResultId",
      "Only persisted alert monitor results can create an investigation handoff.",
    );
  }

  if (!result.alertCard) {
    throw invalidMonitorInvestigationRequest(
      "alertCard",
      "Alert investigation handoff requires the stored monitor alert card.",
    );
  }

  if (result.alertCard.companyKey !== result.companyKey) {
    throw invalidMonitorInvestigationRequest(
      "alertCard.companyKey",
      "Stored alert card companyKey must match the monitor result companyKey.",
    );
  }

  if (result.alertCard.monitorKind !== result.monitorKind) {
    throw invalidMonitorInvestigationRequest(
      "alertCard.monitorKind",
      "Stored alert card monitorKind must match the monitor result monitorKind.",
    );
  }

  if (result.alertCard.severity !== result.severity) {
    throw invalidMonitorInvestigationRequest(
      "alertCard.severity",
      "Stored alert card severity must match the monitor result severity.",
    );
  }

  if (
    result.limitations.length === 0 ||
    result.alertCard.limitations.length === 0
  ) {
    throw invalidMonitorInvestigationRequest(
      "limitations",
      "Alert investigation handoff requires stored monitor limitations.",
    );
  }

  const sourceRef = buildMonitorResultSourceRef(result.id);

  return MonitorInvestigationSeedSchema.parse({
    monitorResultId: result.id,
    companyKey: result.companyKey,
    monitorKind: result.monitorKind,
    monitorResultStatus: "alert",
    alertSeverity: result.alertCard.severity,
    deterministicSeverityRationale:
      result.alertCard.deterministicSeverityRationale,
    conditions: result.conditions,
    conditionSummaries: result.alertCard.conditionSummaries,
    sourceFreshnessPosture: result.alertCard.sourceFreshnessPosture,
    sourceLineageRefs: result.alertCard.sourceLineageRefs,
    sourceLineageSummary: result.alertCard.sourceLineageSummary,
    limitations: result.alertCard.limitations,
    proofBundlePosture: result.alertCard.proofBundlePosture,
    humanReviewNextStep: result.alertCard.humanReviewNextStep,
    runtimeBoundary: {
      monitorResultRuntimeBoundary: result.runtimeBoundary,
      monitorRerunUsed: false,
      runtimeCodexUsed: false,
      deliveryActionUsed: false,
      scheduledAutomationUsed: false,
      reportArtifactCreated: false,
      approvalCreated: false,
      autonomousFinanceActionUsed: false,
      summary:
        "The manual monitor-alert investigation handoff created or opened a deterministic mission without rerunning the monitor, invoking runtime-Codex, creating delivery, creating reports, creating approvals, or taking autonomous finance action.",
    },
    sourceRef,
    monitorResultCreatedAt: result.createdAt,
    alertCardCreatedAt: result.alertCard.createdAt,
  });
}

export function buildMonitorInvestigationMissionSpec(
  seed: MonitorInvestigationSeed,
): MissionSpec {
  const monitorLabel = readMonitorInvestigationMonitorLabel(seed.monitorKind);

  return MissionSpecSchema.parse({
    type: "discovery",
    title: `Investigate ${monitorLabel} alert for ${seed.companyKey}`,
    objective:
      `Manual monitor-alert investigation handoff from stored ${seed.monitorKind} ` +
      `monitor result ${seed.monitorResultId}. The mission preserves the alert ` +
      "seed posture for human review and does not run finance discovery, reports, delivery, or runtime-Codex.",
    repos: [],
    constraints: {
      allowedPaths: [],
      mustNot: [
        `rerun the ${seed.monitorKind} monitor`,
        "invoke runtime-Codex",
        "create report artifacts",
        "create approvals",
        "send notifications",
        "create delivery or external actions",
        "perform autonomous finance, accounting, banking, tax, or legal action",
      ],
    },
    acceptance: [
      "open one deterministic investigation handoff from the persisted alert monitor result",
      "carry source freshness, lineage, limitations, proof posture, and human-review next step",
      "remain taskless, runtime-free, delivery-free, report-free, approval-free, and non-autonomous",
    ],
    riskBudget: {
      sandboxMode: "read-only",
      maxWallClockMinutes: 5,
      maxCostUsd: 1,
      allowNetwork: false,
      requiresHumanApprovalFor: [],
    },
    deliverables: [
      "monitor alert investigation seed",
      "monitor alert proof posture",
    ],
    evidenceRequirements: [
      "stored monitor_result",
      "stored monitor alert card",
      "source freshness posture",
      "source lineage summary",
      "limitations and human-review next step",
    ],
    input: {
      monitorInvestigation: seed,
    },
  });
}

export function buildMonitorInvestigationProofBundle(input: {
  mission: MissionRecord;
  replayEventCount: number;
  seed: MonitorInvestigationSeed;
}): ProofBundleManifest {
  const seed = input.seed;

  return ProofBundleManifestSchema.parse({
    missionId: input.mission.id,
    missionTitle: input.mission.title,
    objective: input.mission.objective,
    sourceDiscoveryMissionId: null,
    sourceReportingMissionId: null,
    companyKey: seed.companyKey,
    questionKind: null,
    policySourceId: null,
    policySourceScope: null,
    answerSummary: "",
    reportKind: null,
    reportDraftStatus: null,
    reportSummary: "",
    monitorInvestigation: seed,
    appendixPresent: false,
    freshnessState: seed.sourceFreshnessPosture.state,
    freshnessSummary: seed.sourceFreshnessPosture.summary,
    limitationsSummary: seed.limitations.join(" "),
    relatedRoutePaths: [
      `/monitoring?companyKey=${encodeURIComponent(seed.companyKey)}`,
    ],
    relatedWikiPageKeys: [],
    targetRepoFullName: null,
    branchName: null,
    pullRequestNumber: null,
    pullRequestUrl: null,
    changeSummary:
      `Opened deterministic monitor-alert investigation handoff from stored ${seed.monitorKind} ` +
      `alert result ${seed.monitorResultId}.`,
    validationSummary:
      "The handoff was assembled from the persisted monitor result and alert card without rerunning the monitor or invoking runtime-Codex.",
    verificationSummary: buildMonitorInvestigationVerificationSummary(seed),
    riskSummary: `${seed.proofBundlePosture.summary} No delivery, report artifact, approval, or autonomous finance action was created.`,
    rollbackSummary:
      "Cancel or supersede only this mission handoff if needed; the raw sources and persisted monitor result remain unchanged.",
    latestApproval: null,
    evidenceCompleteness: {
      status: "complete",
      expectedArtifactKinds: [],
      presentArtifactKinds: [],
      missingArtifactKinds: [],
      notes: [],
    },
    decisionTrace: [
      `Stored monitor result ${seed.monitorResultId} is the investigation source of truth.`,
      `Source ref: ${seed.sourceRef}.`,
      `Alert severity ${seed.alertSeverity} and ${seed.conditions.length} condition(s) were copied from stored monitor evidence.`,
      "No runtime-Codex, delivery, report artifact, approval, notification, scheduler, or autonomous finance action was created.",
    ],
    artifactIds: [],
    artifacts: [],
    replayEventCount: input.replayEventCount,
    timestamps: {
      missionCreatedAt: input.mission.createdAt,
      latestPlannerEvidenceAt: null,
      latestExecutorEvidenceAt: null,
      latestPullRequestAt: null,
      latestApprovalAt: null,
      latestArtifactAt: null,
    },
    status: "ready",
  });
}

export function invalidMonitorInvestigationRequest(
  path: string,
  message: string,
) {
  return new AppHttpError(400, {
    error: {
      code: "invalid_request",
      message: "Invalid request",
      details: [
        {
          path,
          message,
        },
      ],
    },
  });
}

function readMonitorInvestigationMonitorLabel(
  monitorKind: MonitorInvestigationMonitorKind,
) {
  return MONITOR_INVESTIGATION_KIND_LABELS[monitorKind];
}

function buildMonitorInvestigationVerificationSummary(
  seed: MonitorInvestigationSeed,
) {
  if (seed.monitorKind === "collections_pressure") {
    return "Review collections alert source posture, freshness, lineage, limitations, proof posture, and human-review next step before deciding any follow-up.";
  }

  return "Review the stored monitor-alert source freshness, lineage, limitations, proof posture, and human-review next step before deciding any follow-up.";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
