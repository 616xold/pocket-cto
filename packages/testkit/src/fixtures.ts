import type {
  MissionRecord,
  MissionSpec,
  MonitorInvestigationSeed,
  ProofBundleManifest,
  ReplayEvent,
} from "@pocket-cto/domain";

export function buildMissionFixture(): MissionSpec {
  return {
    type: "build",
    title: "Implement passkeys",
    objective: "Implement passkey sign-in without breaking email login",
    repos: ["web", "auth-service"],
    constraints: {
      mustNot: ["disable email login"],
      allowedPaths: [],
      targetBranch: "main",
    },
    acceptance: [
      "users can register and sign in with passkeys",
      "existing email login still works",
    ],
    riskBudget: {
      sandboxMode: "patch-only",
      maxWallClockMinutes: 60,
      maxCostUsd: 12,
      allowNetwork: false,
      requiresHumanApprovalFor: ["merge"],
    },
    deliverables: ["plan", "pull_request", "proof_bundle", "approval_card"],
    evidenceRequirements: ["test report", "screenshot", "rollback note"],
  };
}

export function proofBundlePlaceholderFixture(
  missionId: string,
): ProofBundleManifest {
  return {
    missionId,
    missionTitle: "",
    objective: "Placeholder objective",
    sourceDiscoveryMissionId: null,
    companyKey: null,
    questionKind: null,
    policySourceId: null,
    policySourceScope: null,
    answerSummary: "",
    reportKind: null,
    sourceReportingMissionId: null,
    reportDraftStatus: null,
    reportSummary: "",
    monitorInvestigation: null,
    reportPublication: null,
    circulationReadiness: null,
    circulationRecord: null,
    circulationChronology: null,
    releaseReadiness: null,
    releaseRecord: null,
    appendixPresent: false,
    freshnessState: null,
    freshnessSummary: "",
    limitationsSummary: "",
    relatedRoutePaths: [],
    relatedWikiPageKeys: [],
    targetRepoFullName: null,
    branchName: null,
    pullRequestNumber: null,
    pullRequestUrl: null,
    changeSummary: "",
    validationSummary: "",
    verificationSummary: "",
    riskSummary: "",
    rollbackSummary: "",
    latestApproval: null,
    evidenceCompleteness: {
      status: "missing",
      expectedArtifactKinds: [],
      presentArtifactKinds: [],
      missingArtifactKinds: [],
      notes: [],
    },
    decisionTrace: [],
    artifactIds: [],
    artifacts: [],
    replayEventCount: 0,
    timestamps: {
      missionCreatedAt: "",
      latestPlannerEvidenceAt: null,
      latestExecutorEvidenceAt: null,
      latestPullRequestAt: null,
      latestApprovalAt: null,
      latestArtifactAt: null,
    },
    status: "placeholder",
  };
}

export function buildMonitorInvestigationSeedFixture(): MonitorInvestigationSeed {
  return {
    monitorResultId: "66666666-6666-4666-8666-666666666666",
    companyKey: "acme",
    monitorKind: "cash_posture",
    monitorResultStatus: "alert",
    alertSeverity: "critical",
    deterministicSeverityRationale:
      "Critical because missing_source was detected from stored cash-posture freshness.",
    conditions: [
      {
        kind: "missing_source",
        severity: "critical",
        summary: "No successful bank-account-summary slice exists.",
        evidencePath: "freshness.state",
      },
    ],
    conditionSummaries: ["No successful bank-account-summary slice exists."],
    sourceFreshnessPosture: {
      state: "missing",
      latestAttemptedSyncRunId: null,
      latestSuccessfulSyncRunId: null,
      latestSuccessfulSource: null,
      missingSource: true,
      failedSource: false,
      summary: "No successful cash-posture source is stored.",
    },
    sourceLineageRefs: [],
    sourceLineageSummary:
      "No bank-account-summary source lineage is available.",
    limitations: [
      "The monitor reports source posture only and does not infer runway.",
    ],
    proofBundlePosture: {
      state: "limited_by_missing_source",
      summary:
        "The monitor proof is limited because no bank-account-summary source backs the cash posture.",
    },
    humanReviewNextStep:
      "Review cash-posture source coverage and refresh bank-account-summary ingest if needed.",
    runtimeBoundary: {
      monitorResultRuntimeBoundary: {
        runtimeCodexUsed: false,
        deliveryActionUsed: false,
        investigationMissionCreated: false,
        autonomousFinanceActionUsed: false,
        summary:
          "The result was produced by deterministic stored-state evaluation only.",
      },
      monitorRerunUsed: false,
      runtimeCodexUsed: false,
      deliveryActionUsed: false,
      scheduledAutomationUsed: false,
      reportArtifactCreated: false,
      approvalCreated: false,
      autonomousFinanceActionUsed: false,
      summary:
        "The handoff opened a deterministic investigation mission without runtime or delivery action.",
    },
    sourceRef:
      "pocket-cfo://monitor-results/66666666-6666-4666-8666-666666666666",
    monitorResultCreatedAt: "2026-04-26T12:00:00.000Z",
    alertCardCreatedAt: "2026-04-26T12:00:00.000Z",
  };
}

export function buildMonitorInvestigationMissionFixture(
  seed: MonitorInvestigationSeed = buildMonitorInvestigationSeedFixture(),
): MissionRecord {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    type: "discovery",
    status: "succeeded",
    title: "Investigate cash-posture alert for acme",
    objective:
      "Manual F6B handoff from a stored cash-posture alert without runtime execution.",
    sourceKind: "alert",
    sourceRef: seed.sourceRef,
    createdBy: "finance-operator",
    primaryRepo: null,
    spec: {
      type: "discovery",
      title: "Investigate cash-posture alert for acme",
      objective:
        "Manual F6B handoff from a stored cash-posture alert without runtime execution.",
      repos: [],
      constraints: {
        allowedPaths: [],
        mustNot: ["invoke runtime-Codex", "create report artifacts"],
      },
      acceptance: ["Open one deterministic alert handoff."],
      riskBudget: {
        sandboxMode: "read-only",
        maxWallClockMinutes: 5,
        maxCostUsd: 1,
        allowNetwork: false,
        requiresHumanApprovalFor: [],
      },
      deliverables: ["monitor alert investigation seed"],
      evidenceRequirements: ["stored monitor_result"],
      input: {
        monitorInvestigation: seed,
      },
    },
    createdAt: "2026-04-26T12:00:00.000Z",
    updatedAt: "2026-04-26T12:01:00.000Z",
  };
}

export function buildMonitorInvestigationProofBundleFixture(
  seed: MonitorInvestigationSeed = buildMonitorInvestigationSeedFixture(),
): ProofBundleManifest {
  return {
    missionId: "11111111-1111-4111-8111-111111111111",
    missionTitle: "Investigate cash-posture alert for acme",
    objective:
      "Manual F6B handoff from a stored cash-posture alert without runtime execution.",
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
    reportPublication: null,
    circulationReadiness: null,
    circulationRecord: null,
    circulationChronology: null,
    releaseRecord: null,
    releaseReadiness: null,
    appendixPresent: false,
    freshnessState: seed.sourceFreshnessPosture.state,
    freshnessSummary: seed.sourceFreshnessPosture.summary,
    limitationsSummary: seed.limitations.join(" "),
    relatedRoutePaths: ["/monitoring?companyKey=acme"],
    relatedWikiPageKeys: [],
    targetRepoFullName: null,
    branchName: null,
    pullRequestNumber: null,
    pullRequestUrl: null,
    changeSummary:
      "Opened deterministic F6B investigation handoff from stored cash_posture alert result.",
    validationSummary:
      "Handoff assembled from persisted monitor result without rerun.",
    verificationSummary:
      "Review source freshness, lineage, limitations, and human-review next step.",
    riskSummary:
      "No delivery, report artifact, approval, or autonomous finance action was created.",
    rollbackSummary:
      "Cancel only this handoff; raw sources and monitor result remain unchanged.",
    latestApproval: null,
    evidenceCompleteness: {
      status: "complete",
      expectedArtifactKinds: [],
      presentArtifactKinds: [],
      missingArtifactKinds: [],
      notes: [],
    },
    decisionTrace: [
      "Stored monitor result is the investigation source of truth.",
    ],
    artifactIds: [],
    artifacts: [],
    replayEventCount: 3,
    timestamps: {
      missionCreatedAt: "2026-04-26T12:00:00.000Z",
      latestPlannerEvidenceAt: null,
      latestExecutorEvidenceAt: null,
      latestPullRequestAt: null,
      latestApprovalAt: null,
      latestArtifactAt: null,
    },
    status: "ready",
  };
}

export function replayEventFixture(missionId: string): ReplayEvent {
  return {
    id: crypto.randomUUID(),
    missionId,
    taskId: null,
    sequence: 1,
    type: "mission.created",
    actor: "system",
    occurredAt: new Date().toISOString(),
    payload: { reason: "fixture" },
  };
}
