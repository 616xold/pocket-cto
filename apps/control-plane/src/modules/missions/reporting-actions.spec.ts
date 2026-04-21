import type {
  ProofBundleManifest,
  ReportingFiledArtifactsResult,
  ReportingMarkdownExportResult,
} from "@pocket-cto/domain";
import { describe, expect, it, vi } from "vitest";
import { MissionReportingActionsService } from "./reporting-actions";

describe("MissionReportingActionsService", () => {
  it("refreshes proof posture after filing draft artifacts", async () => {
    const refreshProofBundle = vi.fn(
      async (): Promise<ProofBundleManifest> => buildProofBundleManifest(),
    );
    const fileDraftArtifacts = vi.fn(
      async (): Promise<ReportingFiledArtifactsResult> =>
        buildFiledArtifactsResult(),
    );
    const service = new MissionReportingActionsService({
      approvalService: {
        recordReportReleaseLog: vi.fn(async () => {
          throw new Error("not used");
        }),
        requestReportReleaseApproval: vi.fn(async () => {
          throw new Error("not used");
        }),
      },
      proofBundleAssembly: {
        refreshProofBundle,
      },
      reportingService: {
        exportMarkdownBundle: vi.fn(async () => {
          throw new Error("not used");
        }),
        fileDraftArtifacts,
        prepareReportingReleaseLog: vi.fn(async () => {
          throw new Error("not used");
        }),
        prepareReportReleaseApproval: vi.fn(async () => {
          throw new Error("not used");
        }),
      },
    });

    const filed = await service.fileDraftArtifacts(
      "11111111-1111-4111-8111-111111111111",
      {
        filedBy: "finance-operator",
      },
    );

    expect(fileDraftArtifacts).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      {
        filedBy: "finance-operator",
      },
    );
    expect(refreshProofBundle).toHaveBeenCalledWith({
      details: {
        reportFiledPageKeys: [
          "filed/reporting-11111111-1111-4111-8111-111111111111-finance_memo",
          "filed/reporting-11111111-1111-4111-8111-111111111111-evidence_appendix",
        ],
        reportPublicationSummary: filed.publication.summary,
      },
      missionId: "11111111-1111-4111-8111-111111111111",
      trigger: "reporting_filed_artifacts",
    });
  });

  it("refreshes proof posture after markdown export", async () => {
    const refreshProofBundle = vi.fn(
      async (): Promise<ProofBundleManifest> => buildProofBundleManifest(),
    );
    const exportMarkdownBundle = vi.fn(
      async (): Promise<ReportingMarkdownExportResult> =>
        buildMarkdownExportResult(),
    );
    const service = new MissionReportingActionsService({
      approvalService: {
        recordReportReleaseLog: vi.fn(async () => {
          throw new Error("not used");
        }),
        requestReportReleaseApproval: vi.fn(async () => {
          throw new Error("not used");
        }),
      },
      proofBundleAssembly: {
        refreshProofBundle,
      },
      reportingService: {
        exportMarkdownBundle,
        fileDraftArtifacts: vi.fn(async () => {
          throw new Error("not used");
        }),
        prepareReportingReleaseLog: vi.fn(async () => {
          throw new Error("not used");
        }),
        prepareReportReleaseApproval: vi.fn(async () => {
          throw new Error("not used");
        }),
      },
    });

    const exported = await service.exportMarkdownBundle(
      "11111111-1111-4111-8111-111111111111",
      {
        triggeredBy: "finance-operator",
      },
    );

    expect(exportMarkdownBundle).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      {
        triggeredBy: "finance-operator",
      },
    );
    expect(refreshProofBundle).toHaveBeenCalledWith({
      details: {
        reportExportRunId: "22222222-2222-4222-8222-222222222222",
        reportFiledPageKeys: [
          "filed/reporting-11111111-1111-4111-8111-111111111111-finance_memo",
          "filed/reporting-11111111-1111-4111-8111-111111111111-evidence_appendix",
        ],
        reportPublicationSummary: exported.publication.summary,
      },
      missionId: "11111111-1111-4111-8111-111111111111",
      trigger: "reporting_export",
    });
  });

  it("refreshes proof posture after requesting lender-update release approval", async () => {
    const refreshProofBundle = vi.fn(
      async (): Promise<ProofBundleManifest> => buildProofBundleManifest(),
    );
    const prepareReportReleaseApproval = vi.fn(async () => ({
      missionId: "11111111-1111-4111-8111-111111111111",
      reportKind: "lender_update" as const,
      sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
      sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
      artifactId: "44444444-4444-4444-8444-444444444444",
      companyKey: "acme" as const,
      draftOnlyStatus: "draft_only" as const,
      summary: "Draft lender update for acme from the completed finance memo.",
      freshnessSummary: "Cash posture remains stale.",
      limitationsSummary: "Draft-only posture remains explicit.",
      resolution: null,
      releaseRecord: null,
    }));
    const requestReportReleaseApproval = vi.fn(async () => ({
      approval: {
        id: "55555555-5555-4555-8555-555555555555",
        missionId: "11111111-1111-4111-8111-111111111111",
        taskId: null,
        kind: "report_release" as const,
        status: "pending" as const,
        requestedBy: "finance-operator",
        resolvedBy: null,
        rationale: null,
        payload: {},
        createdAt: "2026-04-20T09:00:00.000Z",
        updatedAt: "2026-04-20T09:00:00.000Z",
      },
      created: true,
    }));
    const service = new MissionReportingActionsService({
      approvalService: {
        recordReportReleaseLog: vi.fn(async () => {
          throw new Error("not used");
        }),
        requestReportReleaseApproval,
      },
      proofBundleAssembly: {
        refreshProofBundle,
      },
      reportingService: {
        exportMarkdownBundle: vi.fn(async () => {
          throw new Error("not used");
        }),
        fileDraftArtifacts: vi.fn(async () => {
          throw new Error("not used");
        }),
        prepareReportingReleaseLog: vi.fn(async () => {
          throw new Error("not used");
        }),
        prepareReportReleaseApproval,
      },
    });

    const result = await service.requestReleaseApproval(
      "11111111-1111-4111-8111-111111111111",
      {
        requestedBy: "finance-operator",
      },
    );

    expect(prepareReportReleaseApproval).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
    );
    expect(requestReportReleaseApproval).toHaveBeenCalledWith({
      missionId: "11111111-1111-4111-8111-111111111111",
      payload: {
        artifactId: "44444444-4444-4444-8444-444444444444",
        companyKey: "acme",
        draftOnlyStatus: "draft_only",
        freshnessSummary: "Cash posture remains stale.",
        limitationsSummary: "Draft-only posture remains explicit.",
        missionId: "11111111-1111-4111-8111-111111111111",
        releaseRecord: null,
        reportKind: "lender_update",
        resolution: null,
        sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
        sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
        summary:
          "Draft lender update for acme from the completed finance memo.",
      },
      requestedBy: "finance-operator",
    });
    expect(refreshProofBundle).toHaveBeenCalledWith({
      missionId: "11111111-1111-4111-8111-111111111111",
      trigger: "approval_requested",
    });
    expect(result).toEqual({
      missionId: "11111111-1111-4111-8111-111111111111",
      approvalId: "55555555-5555-4555-8555-555555555555",
      created: true,
      approvalStatus: "pending",
      releaseApprovalStatus: "pending_review",
      releaseReady: false,
    });
  });

  it("refreshes proof posture after logging one external lender-update release", async () => {
    const refreshProofBundle = vi.fn(
      async (): Promise<ProofBundleManifest> => buildProofBundleManifest(),
    );
    const prepareReportingReleaseLog = vi.fn(async () => ({
      approvalId: "55555555-5555-4555-8555-555555555555",
      releaseRecord: {
        releasedAt: "2026-04-20T09:10:00.000Z",
        releasedBy: "finance-operator",
        releaseChannel: "email",
        releaseNote: "Sent from treasury mailbox after approval.",
        summary:
          "External release was logged by finance-operator at 2026-04-20T09:10:00.000Z via email. Release note: Sent from treasury mailbox after approval..",
      },
    }));
    const recordReportReleaseLog = vi.fn(async () => ({
      approval: {
        id: "55555555-5555-4555-8555-555555555555",
        missionId: "11111111-1111-4111-8111-111111111111",
        taskId: null,
        kind: "report_release" as const,
        status: "approved" as const,
        requestedBy: "finance-operator",
        resolvedBy: "finance-reviewer",
        rationale: "Approved for release readiness.",
        payload: {
          artifactId: "44444444-4444-4444-8444-444444444444",
          companyKey: "acme",
          draftOnlyStatus: "draft_only",
          freshnessSummary: "Cash posture remains stale.",
          limitationsSummary: "Draft-only posture remains explicit.",
          missionId: "11111111-1111-4111-8111-111111111111",
          reportKind: "lender_update" as const,
          sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
          sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
          summary:
            "Draft lender update for acme from the completed finance memo.",
          resolution: {
            decision: "accept" as const,
            rationale: "Approved for release readiness.",
            resolvedBy: "finance-reviewer",
          },
          releaseRecord: {
            releasedAt: "2026-04-20T09:10:00.000Z",
            releasedBy: "finance-operator",
            releaseChannel: "email",
            releaseNote: "Sent from treasury mailbox after approval.",
            summary:
              "External release was logged by finance-operator at 2026-04-20T09:10:00.000Z via email. Release note: Sent from treasury mailbox after approval..",
          },
        },
        createdAt: "2026-04-20T09:00:00.000Z",
        updatedAt: "2026-04-20T09:10:00.000Z",
      },
      created: true,
    }));
    const service = new MissionReportingActionsService({
      approvalService: {
        recordReportReleaseLog,
        requestReportReleaseApproval: vi.fn(async () => {
          throw new Error("not used");
        }),
      },
      proofBundleAssembly: {
        refreshProofBundle,
      },
      reportingService: {
        exportMarkdownBundle: vi.fn(async () => {
          throw new Error("not used");
        }),
        fileDraftArtifacts: vi.fn(async () => {
          throw new Error("not used");
        }),
        prepareReportReleaseApproval: vi.fn(async () => {
          throw new Error("not used");
        }),
        prepareReportingReleaseLog,
      },
    });

    const result = await service.recordReleaseLog(
      "11111111-1111-4111-8111-111111111111",
      {
        releasedAt: null,
        releasedBy: "finance-operator",
        releaseChannel: "email",
        releaseNote: "Sent from treasury mailbox after approval.",
      },
    );

    expect(prepareReportingReleaseLog).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      {
        releasedAt: null,
        releasedBy: "finance-operator",
        releaseChannel: "email",
        releaseNote: "Sent from treasury mailbox after approval.",
      },
    );
    expect(recordReportReleaseLog).toHaveBeenCalledWith({
      approvalId: "55555555-5555-4555-8555-555555555555",
      releaseRecord: {
        releasedAt: "2026-04-20T09:10:00.000Z",
        releasedBy: "finance-operator",
        releaseChannel: "email",
        releaseNote: "Sent from treasury mailbox after approval.",
        summary:
          "External release was logged by finance-operator at 2026-04-20T09:10:00.000Z via email. Release note: Sent from treasury mailbox after approval..",
      },
    });
    expect(refreshProofBundle).toHaveBeenCalledWith({
      missionId: "11111111-1111-4111-8111-111111111111",
      trigger: "release_logged",
    });
    expect(result).toEqual({
      missionId: "11111111-1111-4111-8111-111111111111",
      approvalId: "55555555-5555-4555-8555-555555555555",
      created: true,
      releaseRecord: {
        released: true,
        releasedAt: "2026-04-20T09:10:00.000Z",
        releasedBy: "finance-operator",
        releaseChannel: "email",
        releaseNote: "Sent from treasury mailbox after approval.",
        approvalId: "55555555-5555-4555-8555-555555555555",
        summary:
          "External release was logged by finance-operator at 2026-04-20T09:10:00.000Z via email. Release note: Sent from treasury mailbox after approval..",
      },
    });
  });
});

function buildProofBundleManifest(): ProofBundleManifest {
  return {
    missionId: "11111111-1111-4111-8111-111111111111",
    missionTitle: "Draft finance memo for acme payables pressure",
    objective:
      "Compile one draft finance memo from the stored payables pressure evidence for acme.",
    sourceDiscoveryMissionId: "99999999-9999-4999-8999-999999999999",
    sourceReportingMissionId: null,
    companyKey: "acme",
    questionKind: "payables_pressure",
    policySourceId: null,
    policySourceScope: null,
    answerSummary: "",
    reportKind: "finance_memo",
    reportDraftStatus: "draft_only",
    reportPublication: buildPublication(true),
    reportSummary:
      "Draft finance memo summarizing stored payables pressure and carried evidence posture.",
    appendixPresent: true,
    freshnessState: "stale",
    freshnessSummary:
      "Stored payables aging evidence is stale for acme and is carried forward into the memo draft.",
    limitationsSummary:
      "Stored payables aging omits one vendor feed and remains scoped to uploaded evidence.",
    relatedRoutePaths: ["/finance-twin/companies/acme/payables-aging"],
    relatedWikiPageKeys: ["metrics/payables-aging"],
    targetRepoFullName: null,
    branchName: null,
    pullRequestNumber: null,
    pullRequestUrl: null,
    changeSummary:
      "Draft finance memo summarizing stored payables pressure with linked evidence appendix.",
    validationSummary: "",
    verificationSummary:
      "Review the linked evidence appendix before sharing the draft memo outside the operator surface.",
    riskSummary: "",
    rollbackSummary: "",
    latestApproval: null,
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
    replayEventCount: 6,
    timestamps: {
      missionCreatedAt: "2026-04-18T13:00:00.000Z",
      latestPlannerEvidenceAt: null,
      latestExecutorEvidenceAt: null,
      latestPullRequestAt: null,
      latestApprovalAt: null,
      latestArtifactAt: "2026-04-18T13:05:00.000Z",
    },
    status: "ready",
  };
}

function buildFiledArtifactsResult(): ReportingFiledArtifactsResult {
  return {
    missionId: "11111111-1111-4111-8111-111111111111",
    companyKey: "acme",
    publication: buildPublication(false),
  };
}

function buildMarkdownExportResult(): ReportingMarkdownExportResult {
  return {
    missionId: "11111111-1111-4111-8111-111111111111",
    companyKey: "acme",
    publication: buildPublication(true),
  };
}

function buildPublication(includeExport: boolean) {
  return {
    storedDraft: true,
    filedMemo: {
      artifactKind: "finance_memo" as const,
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
      artifactKind: "evidence_appendix" as const,
      pageKey:
        "filed/reporting-11111111-1111-4111-8111-111111111111-evidence_appendix",
      title:
        "Evidence appendix for acme draft finance memo (11111111-1111-4111-8111-111111111111)",
      filedAt: "2026-04-18T13:05:00.000Z",
      filedBy: "finance-operator",
      provenanceSummary:
        "Draft-only reporting artifact filed into the CFO Wiki.",
    },
    latestMarkdownExport: includeExport
      ? {
          exportRunId: "22222222-2222-4222-8222-222222222222",
          status: "succeeded" as const,
          completedAt: "2026-04-18T13:06:00.000Z",
          includesLatestFiledArtifacts: true,
        }
      : null,
    summary: includeExport
      ? "Draft memo and evidence appendix are stored. Both filed pages exist in the CFO Wiki: `filed/reporting-11111111-1111-4111-8111-111111111111-finance_memo` and `filed/reporting-11111111-1111-4111-8111-111111111111-evidence_appendix`. Markdown export run 22222222-2222-4222-8222-222222222222 includes the latest filed report pages."
      : "Draft memo and evidence appendix are stored. Both filed pages exist in the CFO Wiki: `filed/reporting-11111111-1111-4111-8111-111111111111-finance_memo` and `filed/reporting-11111111-1111-4111-8111-111111111111-evidence_appendix`. No markdown export run has been recorded yet.",
  };
}
