import type {
  ProofBundleManifest,
  ReportingFiledArtifactsResult,
  ReportingMarkdownExportResult,
} from "@pocket-cto/domain";
import { describe, expect, it, vi } from "vitest";
import { MissionReportingActionsService } from "./reporting-actions";

describe("MissionReportingActionsService", () => {
  it("refreshes proof posture after filing draft artifacts", async () => {
    const refreshProofBundle = vi.fn(async (): Promise<ProofBundleManifest> =>
      buildProofBundleManifest(),
    );
    const fileDraftArtifacts = vi.fn(
      async (): Promise<ReportingFiledArtifactsResult> =>
        buildFiledArtifactsResult(),
    );
    const service = new MissionReportingActionsService({
      proofBundleAssembly: {
        refreshProofBundle,
      },
      reportingService: {
        exportMarkdownBundle: vi.fn(async () => {
          throw new Error("not used");
        }),
        fileDraftArtifacts,
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
    const refreshProofBundle = vi.fn(async (): Promise<ProofBundleManifest> =>
      buildProofBundleManifest(),
    );
    const exportMarkdownBundle = vi.fn(
      async (): Promise<ReportingMarkdownExportResult> =>
        buildMarkdownExportResult(),
    );
    const service = new MissionReportingActionsService({
      proofBundleAssembly: {
        refreshProofBundle,
      },
      reportingService: {
        exportMarkdownBundle,
        fileDraftArtifacts: vi.fn(async () => {
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
      title: "Draft finance memo for acme (11111111-1111-4111-8111-111111111111)",
      filedAt: "2026-04-18T13:05:00.000Z",
      filedBy: "finance-operator",
      provenanceSummary: "Draft-only reporting artifact filed into the CFO Wiki.",
    },
    filedEvidenceAppendix: {
      artifactKind: "evidence_appendix" as const,
      pageKey:
        "filed/reporting-11111111-1111-4111-8111-111111111111-evidence_appendix",
      title:
        "Evidence appendix for acme draft finance memo (11111111-1111-4111-8111-111111111111)",
      filedAt: "2026-04-18T13:05:00.000Z",
      filedBy: "finance-operator",
      provenanceSummary: "Draft-only reporting artifact filed into the CFO Wiki.",
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
