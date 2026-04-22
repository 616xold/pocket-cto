import { describe, expect, it } from "vitest";
import type { MissionRecord, ProofBundleManifest } from "@pocket-cto/domain";
import { buildMissionDetailView } from "./detail-view";

describe("buildMissionDetailView", () => {
  it("normalizes reporting proof-bundle publication summary from stored filed and export posture", () => {
    const view = buildMissionDetailView({
      approvals: [],
      artifacts: [],
      liveControl: {
        enabled: false,
        limitation: "single_process_only",
        mode: "api_only",
      },
      mission: buildReportingMission(),
      proofBundle: buildReportingProofBundle(),
      tasks: [],
    });

    expect(
      view.proofBundle.reportPublication?.latestMarkdownExport?.exportRunId,
    ).toBe("33333333-3333-4333-8333-333333333333");
    expect(view.proofBundle.reportPublication?.summary).toContain(
      "includes the latest filed report pages",
    );
  });
});

function buildReportingMission(): MissionRecord {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    type: "reporting",
    status: "succeeded",
    title: "Draft finance memo for acme",
    objective: "Compile one draft finance memo from stored evidence.",
    sourceKind: "manual_reporting",
    sourceRef: null,
    createdBy: "finance-operator",
    primaryRepo: null,
    spec: {
      type: "reporting",
      title: "Draft finance memo for acme",
      objective: "Compile one draft finance memo from stored evidence.",
      repos: [],
      constraints: {
        allowedPaths: [],
        mustNot: [],
      },
      acceptance: [],
      riskBudget: {
        sandboxMode: "read-only",
        maxWallClockMinutes: 5,
        maxCostUsd: 1,
        allowNetwork: false,
        requiresHumanApprovalFor: [],
      },
      deliverables: ["finance_memo", "evidence_appendix", "proof_bundle"],
      evidenceRequirements: ["stored discovery_answer artifact"],
      input: {
        reportingRequest: {
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          sourceReportingMissionId: null,
          reportKind: "finance_memo",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
        },
      },
    },
    createdAt: "2026-04-18T12:00:00.000Z",
    updatedAt: "2026-04-18T12:00:00.000Z",
  };
}

function buildReportingProofBundle(): ProofBundleManifest {
  return {
    missionId: "11111111-1111-4111-8111-111111111111",
    missionTitle: "Draft finance memo for acme",
    objective: "Compile one draft finance memo from stored evidence.",
    sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
    sourceReportingMissionId: null,
    companyKey: "acme",
    questionKind: "cash_posture",
    policySourceId: null,
    policySourceScope: null,
    answerSummary: "",
    reportKind: "finance_memo",
    reportDraftStatus: "draft_only",
    reportSummary: "Cash posture remains constrained.",
    reportPublication: {
      storedDraft: true,
      filedMemo: {
        artifactKind: "finance_memo",
        pageKey:
          "filed/reporting-11111111-1111-4111-8111-111111111111-finance_memo",
        title:
          "Draft finance memo for acme (11111111-1111-4111-8111-111111111111)",
        filedAt: "2026-04-18T13:05:00.000Z",
        filedBy: "finance-operator",
        provenanceSummary:
          "Draft-only reporting artifact filed into the CFO Wiki.",
      },
      filedEvidenceAppendix: {
        artifactKind: "evidence_appendix",
        pageKey:
          "filed/reporting-11111111-1111-4111-8111-111111111111-evidence_appendix",
        title:
          "Evidence appendix for acme draft finance memo (11111111-1111-4111-8111-111111111111)",
        filedAt: "2026-04-18T13:05:00.000Z",
        filedBy: "finance-operator",
        provenanceSummary:
          "Draft-only reporting artifact filed into the CFO Wiki.",
      },
      latestMarkdownExport: {
        exportRunId: "33333333-3333-4333-8333-333333333333",
        status: "succeeded",
        completedAt: "2026-04-18T13:06:00.000Z",
        includesLatestFiledArtifacts: true,
      },
      summary:
        "Draft memo and evidence appendix are stored. Both filed pages exist in the CFO Wiki: `filed/reporting-11111111-1111-4111-8111-111111111111-finance_memo` and `filed/reporting-11111111-1111-4111-8111-111111111111-evidence_appendix`. No markdown export run has been recorded yet.",
    },
    appendixPresent: true,
    freshnessState: "stale",
    freshnessSummary: "Cash posture remains stale.",
    limitationsSummary: "Draft-only posture remains explicit.",
    relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
    relatedWikiPageKeys: ["metrics/cash-posture"],
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
    circulationRecord: null,
    circulationChronology: null,
    circulationReadiness: null,
    releaseRecord: null,
    releaseReadiness: null,
    evidenceCompleteness: {
      status: "complete",
      expectedArtifactKinds: ["finance_memo", "evidence_appendix"],
      presentArtifactKinds: ["finance_memo", "evidence_appendix"],
      missingArtifactKinds: [],
      notes: [],
    },
    decisionTrace: [],
    artifactIds: [],
    artifacts: [],
    replayEventCount: 0,
    timestamps: {
      missionCreatedAt: "2026-04-18T13:00:00.000Z",
      latestPlannerEvidenceAt: null,
      latestExecutorEvidenceAt: null,
      latestPullRequestAt: null,
      latestApprovalAt: null,
      latestArtifactAt: "2026-04-18T13:02:00.000Z",
    },
    status: "ready",
  };
}
