import { describe, expect, it } from "vitest";
import {
  buildCfoWikiMarkdownPath,
  type ArtifactRecord,
  type CfoWikiExportDetailView,
  type CfoWikiExportListView,
  type CfoWikiExportRunRecord,
  type CfoWikiFiledPageListView,
  type CfoWikiPageRecord,
  type CfoWikiPageView,
  type MissionRecord,
  type ProofBundleManifest,
} from "@pocket-cto/domain";
import { ReportingService } from "./service";

type StoredWikiPageStub = CfoWikiPageRecord;

describe("ReportingService", () => {
  it("compiles one draft finance memo plus one linked evidence appendix from stored discovery evidence", async () => {
    const sourceMission = buildSourceDiscoveryMission();
    const reportingMission = buildReportingMission(sourceMission.id);
    const discoveryAnswerArtifact = buildDiscoveryAnswerArtifact(sourceMission.id);
    const sourceProofBundle = buildSourceProofBundle(sourceMission.id);
    const repository = createMissionRepositoryStub({
      artifactsByMissionId: {
        [sourceMission.id]: [
          discoveryAnswerArtifact,
          buildProofBundleArtifact(sourceMission.id),
        ],
      },
      missionsById: {
        [sourceMission.id]: sourceMission,
      },
      proofBundlesByMissionId: {
        [sourceMission.id]: sourceProofBundle,
      },
    });

    const service = new ReportingService({
      missionRepository: repository,
    });
    const compiled = requireFinanceMemoArtifacts(
      await service.compileDraftReport(reportingMission),
    );

    expect(compiled.financeMemo.reportKind).toBe("finance_memo");
    expect(compiled.financeMemo.draftStatus).toBe("draft_only");
    expect(compiled.financeMemo.sourceDiscoveryMissionId).toBe(sourceMission.id);
    expect(compiled.financeMemo.memoSummary).toContain("Cash posture");
    expect(compiled.financeMemo.relatedRoutePaths).toEqual([
      "/finance-twin/companies/acme/cash-posture",
      "/finance-twin/companies/acme/bank-accounts",
    ]);
    expect(compiled.financeMemo.bodyMarkdown).toContain("## Memo Summary");
    expect(compiled.evidenceAppendix.sourceArtifacts).toEqual([
      {
        artifactId: discoveryAnswerArtifact.id,
        kind: "discovery_answer",
      },
      {
        artifactId: "99999999-9999-4999-8999-999999999999",
        kind: "proof_bundle_manifest",
      },
    ]);
    expect(compiled.evidenceAppendix.bodyMarkdown).toContain(
      "## Source Discovery Lineage",
    );
    expect(compiled.evidenceAppendix.limitations).toContain(
      "Working-capital timing remains approximate because no payment calendar inference is performed.",
    );
  });

  it("carries source-proof gaps forward instead of inventing completeness", async () => {
    const sourceMission = buildSourceDiscoveryMission();
    const reportingMission = buildReportingMission(sourceMission.id);
    const repository = createMissionRepositoryStub({
      artifactsByMissionId: {
        [sourceMission.id]: [buildDiscoveryAnswerArtifact(sourceMission.id)],
      },
      missionsById: {
        [sourceMission.id]: sourceMission,
      },
      proofBundlesByMissionId: {},
    });

    const service = new ReportingService({
      missionRepository: repository,
    });
    const compiled = requireFinanceMemoArtifacts(
      await service.compileDraftReport(reportingMission),
    );

    expect(compiled.financeMemo.sourceArtifacts).toEqual([
      {
        artifactId: "66666666-6666-4666-8666-666666666666",
        kind: "discovery_answer",
      },
    ]);
    expect(compiled.financeMemo.limitationsSummary).toContain(
      "additional limitation",
    );
    expect(compiled.evidenceAppendix.limitations).toContain(
      "The source discovery proof bundle is missing, so this draft memo compiles from the stored discovery answer plus its persisted route and wiki evidence only.",
    );
  });

  it("compiles one draft board packet from stored finance memo and evidence appendix artifacts only", async () => {
    const sourceDiscoveryMissionId = "11111111-1111-4111-8111-111111111111";
    const sourceReportingMission = buildSucceededReportingMission(
      sourceDiscoveryMissionId,
    );
    const boardPacketMission = buildBoardPacketMission(
      sourceDiscoveryMissionId,
      sourceReportingMission.id,
    );
    const repository = createMissionRepositoryStub({
      artifactsByMissionId: {
        [sourceReportingMission.id]: buildReportingArtifacts(
          sourceReportingMission.id,
          sourceDiscoveryMissionId,
        ),
      },
      missionsById: {
        [sourceReportingMission.id]: sourceReportingMission,
      },
      proofBundlesByMissionId: {
        [sourceReportingMission.id]: buildReportingProofBundle(
          sourceReportingMission.id,
          sourceDiscoveryMissionId,
        ),
      },
    });

    const service = new ReportingService({
      missionRepository: repository,
    });
    const compiled = requireBoardPacketArtifacts(
      await service.compileDraftReport(boardPacketMission),
    );

    expect(compiled.boardPacket.reportKind).toBe("board_packet");
    expect(compiled.boardPacket.sourceReportingMissionId).toBe(
      sourceReportingMission.id,
    );
    expect(compiled.boardPacket.sourceDiscoveryMissionId).toBe(
      sourceDiscoveryMissionId,
    );
    expect(compiled.boardPacket.sourceFinanceMemo.kind).toBe("finance_memo");
    expect(compiled.boardPacket.sourceEvidenceAppendix.kind).toBe(
      "evidence_appendix",
    );
    expect(compiled.boardPacket.bodyMarkdown).toContain(
      "## Source Finance Memo Draft",
    );
    expect(compiled.boardPacket.bodyMarkdown).toContain(
      "## Linked Evidence Appendix Posture",
    );
  });

  it("compiles one draft lender update from stored finance memo and evidence appendix artifacts only", async () => {
    const sourceDiscoveryMissionId = "11111111-1111-4111-8111-111111111111";
    const sourceReportingMission = buildSucceededReportingMission(
      sourceDiscoveryMissionId,
    );
    const lenderUpdateMission = buildLenderUpdateMission(
      sourceDiscoveryMissionId,
      sourceReportingMission.id,
    );
    const repository = createMissionRepositoryStub({
      artifactsByMissionId: {
        [sourceReportingMission.id]: buildReportingArtifacts(
          sourceReportingMission.id,
          sourceDiscoveryMissionId,
        ),
      },
      missionsById: {
        [sourceReportingMission.id]: sourceReportingMission,
      },
      proofBundlesByMissionId: {
        [sourceReportingMission.id]: buildReportingProofBundle(
          sourceReportingMission.id,
          sourceDiscoveryMissionId,
        ),
      },
    });

    const service = new ReportingService({
      missionRepository: repository,
    });
    const compiled = requireLenderUpdateArtifacts(
      await service.compileDraftReport(lenderUpdateMission),
    );

    expect(compiled.lenderUpdate.reportKind).toBe("lender_update");
    expect(compiled.lenderUpdate.sourceReportingMissionId).toBe(
      sourceReportingMission.id,
    );
    expect(compiled.lenderUpdate.sourceDiscoveryMissionId).toBe(
      sourceDiscoveryMissionId,
    );
    expect(compiled.lenderUpdate.sourceFinanceMemo.kind).toBe("finance_memo");
    expect(compiled.lenderUpdate.sourceEvidenceAppendix.kind).toBe(
      "evidence_appendix",
    );
    expect(compiled.lenderUpdate.bodyMarkdown).toContain(
      "## Source Finance Memo Draft",
    );
    expect(compiled.lenderUpdate.bodyMarkdown).toContain(
      "## Linked Evidence Appendix Posture",
    );
  });

  it("files draft memo and appendix into deterministic CFO Wiki page keys", async () => {
    const sourceMission = buildSourceDiscoveryMission();
    const reportingMission = buildSucceededReportingMission(sourceMission.id);
    const reportingProofBundle = buildReportingProofBundle(
      reportingMission.id,
      sourceMission.id,
    );
    const cfoWikiPages = new Map<string, StoredWikiPageStub>();
    const service = new ReportingService({
      cfoWikiService: {
        async createFiledPage(_companyKey, input) {
          const pageId = input.pageKey?.includes("finance_memo")
            ? "aaaa1111-1111-4111-8111-111111111111"
            : "bbbb2222-2222-4222-8222-222222222222";
          const pageKey = input.pageKey ?? "filed/reporting-test-artifact";
          const page = {
            id: pageId,
            companyId: "99999999-9999-4999-8999-999999999999",
            compileRunId: null,
            pageKey,
            pageKind: "filed_artifact",
            ownershipKind: "filed_artifact",
            temporalStatus: "current",
            title: input.title,
            summary: input.provenanceSummary,
            markdownBody: input.markdownBody,
            freshnessSummary: {
              state: "missing",
              summary: "Filed artifact pages do not carry compiler freshness.",
            },
            limitations: [],
            lastCompiledAt: "2026-04-18T13:05:00.000Z",
            filedMetadata: {
              filedAt: "2026-04-18T13:05:00.000Z",
              filedBy: input.filedBy,
              provenanceKind: "manual_markdown_artifact",
              provenanceSummary: input.provenanceSummary,
            },
            createdAt: "2026-04-18T13:05:00.000Z",
            updatedAt: "2026-04-18T13:05:00.000Z",
          } satisfies StoredWikiPageStub;
          cfoWikiPages.set(page.pageKey, page);
          return buildPageView(page);
        },
        async exportCompanyWiki() {
          throw new Error("not used in this test");
        },
        async getPage(_companyKey, pageKey) {
          return buildPageView(requireStoredPage(cfoWikiPages, pageKey));
        },
        async listCompanyExports() {
          return buildExportListView([]);
        },
        async listFiledPages() {
          return buildFiledPageListView([...cfoWikiPages.values()]);
        },
      },
      missionRepository: createMissionRepositoryStub({
        artifactsByMissionId: {
          [reportingMission.id]: buildReportingArtifacts(
            reportingMission.id,
            sourceMission.id,
          ),
          [sourceMission.id]: [
            buildDiscoveryAnswerArtifact(sourceMission.id),
            buildProofBundleArtifact(sourceMission.id),
          ],
        },
        missionsById: {
          [reportingMission.id]: reportingMission,
          [sourceMission.id]: sourceMission,
        },
        proofBundlesByMissionId: {
          [reportingMission.id]: reportingProofBundle,
          [sourceMission.id]: buildSourceProofBundle(sourceMission.id),
        },
      }),
    });

    const filed = await service.fileDraftArtifacts(reportingMission.id, {
      filedBy: "finance-operator",
    });

    expect(filed.companyKey).toBe("acme");
    expect(filed.publication.filedMemo?.pageKey).toBe(
      "filed/reporting-55555555-5555-4555-8555-555555555555-finance_memo",
    );
    expect(filed.publication.filedEvidenceAppendix?.pageKey).toBe(
      "filed/reporting-55555555-5555-4555-8555-555555555555-evidence_appendix",
    );
    expect(filed.publication.summary).toContain("Both filed pages exist");
  });

  it("reuses the existing company export seam for markdown bundle export after filing", async () => {
    const sourceMission = buildSourceDiscoveryMission();
    const reportingMission = buildSucceededReportingMission(sourceMission.id);
    const reportingProofBundle = buildReportingProofBundle(
      reportingMission.id,
      sourceMission.id,
    );
    const cfoWikiPages = new Map<string, StoredWikiPageStub>([
      [
        "filed/reporting-55555555-5555-4555-8555-555555555555-finance_memo",
        buildFiledPageRecord({
          filedAt: "2026-04-18T13:05:00.000Z",
          pageKey:
            "filed/reporting-55555555-5555-4555-8555-555555555555-finance_memo",
          title:
            "Draft finance memo for acme (55555555-5555-4555-8555-555555555555)",
        }),
      ],
      [
        "filed/reporting-55555555-5555-4555-8555-555555555555-evidence_appendix",
        buildFiledPageRecord({
          filedAt: "2026-04-18T13:05:00.000Z",
          pageKey:
            "filed/reporting-55555555-5555-4555-8555-555555555555-evidence_appendix",
          title:
            "Evidence appendix for acme draft finance memo (55555555-5555-4555-8555-555555555555)",
        }),
      ],
    ]);
    let exportRunCount = 0;
    const service = new ReportingService({
      cfoWikiService: {
        async createFiledPage() {
          throw new Error("not used in this test");
        },
        async exportCompanyWiki() {
          exportRunCount += 1;
          return buildExportDetailView(
            buildExportRunRecord({
              id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
              status: "succeeded",
              completedAt: "2026-04-18T13:06:00.000Z",
            }),
          );
        },
        async getPage(_companyKey, pageKey) {
          return buildPageView(requireStoredPage(cfoWikiPages, pageKey));
        },
        async listCompanyExports() {
          return buildExportListView(
            exportRunCount
              ? [
                  buildExportRunRecord({
                    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
                    status: "succeeded",
                    completedAt: "2026-04-18T13:06:00.000Z",
                  }),
                ]
              : [],
          );
        },
        async listFiledPages() {
          return buildFiledPageListView([...cfoWikiPages.values()]);
        },
      },
      missionRepository: createMissionRepositoryStub({
        artifactsByMissionId: {
          [reportingMission.id]: buildReportingArtifacts(
            reportingMission.id,
            sourceMission.id,
          ),
          [sourceMission.id]: [
            buildDiscoveryAnswerArtifact(sourceMission.id),
            buildProofBundleArtifact(sourceMission.id),
          ],
        },
        missionsById: {
          [reportingMission.id]: reportingMission,
          [sourceMission.id]: sourceMission,
        },
        proofBundlesByMissionId: {
          [reportingMission.id]: reportingProofBundle,
          [sourceMission.id]: buildSourceProofBundle(sourceMission.id),
        },
      }),
    });

    const exported = await service.exportMarkdownBundle(reportingMission.id, {
      triggeredBy: "finance-operator",
    });

    expect(exportRunCount).toBe(1);
    expect(exported.publication.latestMarkdownExport?.exportRunId).toBe(
      "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    );
    expect(
      exported.publication.latestMarkdownExport?.includesLatestFiledArtifacts,
    ).toBe(true);
  });
});

function createMissionRepositoryStub(input: {
  artifactsByMissionId: Record<string, ArtifactRecord[]>;
  missionsById: Record<string, MissionRecord>;
  proofBundlesByMissionId: Record<string, ProofBundleManifest>;
}) {
  return {
    async getMissionById(missionId: string) {
      return input.missionsById[missionId] ?? null;
    },
    async getProofBundleByMissionId(missionId: string) {
      return input.proofBundlesByMissionId[missionId] ?? null;
    },
    async listArtifactsByMissionId(missionId: string) {
      return input.artifactsByMissionId[missionId] ?? [];
    },
  };
}

function requireFinanceMemoArtifacts(
  compiled: Awaited<ReturnType<ReportingService["compileDraftReport"]>>,
) {
  if (compiled.reportKind !== "finance_memo") {
    throw new Error("Expected finance-memo reporting artifacts.");
  }

  return compiled;
}

function requireBoardPacketArtifacts(
  compiled: Awaited<ReturnType<ReportingService["compileDraftReport"]>>,
) {
  if (compiled.reportKind !== "board_packet") {
    throw new Error("Expected board-packet reporting artifacts.");
  }

  return compiled;
}

function requireLenderUpdateArtifacts(
  compiled: Awaited<ReturnType<ReportingService["compileDraftReport"]>>,
) {
  if (compiled.reportKind !== "lender_update") {
    throw new Error("Expected lender-update reporting artifacts.");
  }

  return compiled;
}

function buildReportingMission(sourceDiscoveryMissionId: string): MissionRecord {
  return {
    id: "55555555-5555-4555-8555-555555555555",
    type: "reporting",
    status: "queued",
    title: "Draft finance memo for acme from cash posture discovery",
    objective:
      "Compile one draft finance memo plus one linked evidence appendix from completed discovery mission and its stored evidence only.",
    sourceKind: "manual_reporting",
    sourceRef: null,
    createdBy: "finance-operator",
    primaryRepo: null,
    spec: {
      type: "reporting",
      title: "Draft finance memo for acme from cash posture discovery",
      objective:
        "Compile one draft finance memo plus one linked evidence appendix from completed discovery mission and its stored evidence only.",
      repos: [],
      constraints: {
        mustNot: ["do not invoke the codex runtime"],
        allowedPaths: [],
      },
      acceptance: [
        "persist one draft finance_memo artifact",
        "persist one linked evidence_appendix artifact",
      ],
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
          sourceDiscoveryMissionId,
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

function buildSucceededReportingMission(
  sourceDiscoveryMissionId: string,
): MissionRecord {
  return {
    ...buildReportingMission(sourceDiscoveryMissionId),
    status: "succeeded",
  };
}

function buildBoardPacketMission(
  sourceDiscoveryMissionId: string,
  sourceReportingMissionId: string,
): MissionRecord {
  return {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    type: "reporting",
    status: "queued",
    title: "Draft board packet for acme from cash posture reporting",
    objective:
      "Compile one draft board packet from completed reporting mission and its stored finance memo plus evidence appendix only.",
    sourceKind: "manual_reporting",
    sourceRef: null,
    createdBy: "finance-operator",
    primaryRepo: null,
    spec: {
      type: "reporting",
      title: "Draft board packet for acme from cash posture reporting",
      objective:
        "Compile one draft board packet from completed reporting mission and its stored finance memo plus evidence appendix only.",
      repos: [],
      constraints: {
        mustNot: [
          "do not invoke the codex runtime",
          "do not add approval workflow, release workflow, lender packets, diligence packets, PDF export, or slide export",
        ],
        allowedPaths: [],
      },
      acceptance: ["persist one draft board_packet artifact"],
      riskBudget: {
        sandboxMode: "read-only",
        maxWallClockMinutes: 5,
        maxCostUsd: 1,
        allowNetwork: false,
        requiresHumanApprovalFor: [],
      },
      deliverables: ["board_packet", "proof_bundle"],
      evidenceRequirements: [
        "stored finance_memo artifact",
        "stored evidence_appendix artifact",
      ],
      input: {
        reportingRequest: {
          sourceDiscoveryMissionId,
          sourceReportingMissionId,
          reportKind: "board_packet",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
        },
      },
    },
    createdAt: "2026-04-19T12:00:00.000Z",
    updatedAt: "2026-04-19T12:00:00.000Z",
  };
}

function buildLenderUpdateMission(
  sourceDiscoveryMissionId: string,
  sourceReportingMissionId: string,
): MissionRecord {
  return {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    type: "reporting",
    status: "queued",
    title: "Draft lender update for acme from cash posture reporting",
    objective:
      "Compile one draft lender update from completed reporting mission and its stored finance memo plus evidence appendix only.",
    sourceKind: "manual_reporting",
    sourceRef: null,
    createdBy: "finance-operator",
    primaryRepo: null,
    spec: {
      type: "reporting",
      title: "Draft lender update for acme from cash posture reporting",
      objective:
        "Compile one draft lender update from completed reporting mission and its stored finance memo plus evidence appendix only.",
      repos: [],
      constraints: {
        mustNot: [
          "do not invoke the codex runtime",
          "do not add approval workflow, release workflow, diligence packets, PDF export, or slide export",
        ],
        allowedPaths: [],
      },
      acceptance: ["persist one draft lender_update artifact"],
      riskBudget: {
        sandboxMode: "read-only",
        maxWallClockMinutes: 5,
        maxCostUsd: 1,
        allowNetwork: false,
        requiresHumanApprovalFor: [],
      },
      deliverables: ["lender_update", "proof_bundle"],
      evidenceRequirements: [
        "stored finance_memo artifact",
        "stored evidence_appendix artifact",
      ],
      input: {
        reportingRequest: {
          sourceDiscoveryMissionId,
          sourceReportingMissionId,
          reportKind: "lender_update",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
        },
      },
    },
    createdAt: "2026-04-19T12:30:00.000Z",
    updatedAt: "2026-04-19T12:30:00.000Z",
  };
}

function buildReportingArtifacts(
  missionId: string,
  sourceDiscoveryMissionId: string,
): ArtifactRecord[] {
  return [
    {
      id: "33333333-3333-4333-8333-333333333333",
      missionId,
      taskId: "44444444-4444-4444-8444-444444444444",
      kind: "finance_memo",
      uri: `pocket-cto://missions/${missionId}/tasks/44444444-4444-4444-8444-444444444444/finance-memo`,
      mimeType: "text/markdown",
      sha256: null,
      metadata: {
        source: "stored_discovery_evidence",
        summary: "Cash posture remains constrained.",
        reportKind: "finance_memo",
        draftStatus: "draft_only",
        sourceDiscoveryMissionId,
        companyKey: "acme",
        questionKind: "cash_posture",
        policySourceId: null,
        policySourceScope: null,
        memoSummary: "Cash posture remains constrained.",
        freshnessSummary: "Cash posture remains stale.",
        limitationsSummary: "Draft-only posture remains explicit.",
        relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
        relatedWikiPageKeys: ["metrics/cash-posture"],
        sourceArtifacts: [
          {
            artifactId: "66666666-6666-4666-8666-666666666666",
            kind: "discovery_answer",
          },
        ],
        bodyMarkdown: "# Draft Finance Memo\n\n## Memo Summary\n\nCash posture remains constrained.",
      },
      createdAt: "2026-04-18T13:02:00.000Z",
    },
    {
      id: "55555555-5555-4555-8555-555555555556",
      missionId,
      taskId: "44444444-4444-4444-8444-444444444444",
      kind: "evidence_appendix",
      uri: `pocket-cto://missions/${missionId}/tasks/44444444-4444-4444-8444-444444444444/evidence-appendix`,
      mimeType: "text/markdown",
      sha256: null,
      metadata: {
        source: "stored_discovery_evidence",
        summary: "Evidence appendix for stored discovery evidence.",
        reportKind: "finance_memo",
        draftStatus: "draft_only",
        sourceDiscoveryMissionId,
        companyKey: "acme",
        questionKind: "cash_posture",
        policySourceId: null,
        policySourceScope: null,
        appendixSummary: "Stored appendix.",
        freshnessSummary: "Cash posture remains stale.",
        limitationsSummary: "Draft-only posture remains explicit.",
        limitations: ["No release workflow exists in F5B."],
        relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
        relatedWikiPageKeys: ["metrics/cash-posture"],
        sourceArtifacts: [
          {
            artifactId: "66666666-6666-4666-8666-666666666666",
            kind: "discovery_answer",
          },
        ],
        bodyMarkdown:
          "# Evidence Appendix\n\n## Source Discovery Lineage\n\nStored lineage.",
      },
      createdAt: "2026-04-18T13:02:00.000Z",
    },
  ];
}

function buildReportingProofBundle(
  missionId: string,
  sourceDiscoveryMissionId: string,
): ProofBundleManifest {
  return {
    missionId,
    missionTitle: "Draft finance memo for acme from cash posture discovery",
    objective: "Compile one draft finance memo from stored evidence.",
    sourceDiscoveryMissionId,
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
      filedMemo: null,
      filedEvidenceAppendix: null,
      latestMarkdownExport: null,
      summary:
        "Draft memo and evidence appendix are stored. Neither draft artifact has been filed into the CFO Wiki yet. No markdown export run has been recorded yet.",
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
    changeSummary: "Cash posture remains constrained.",
    validationSummary: "Draft finance memo compiled deterministically.",
    verificationSummary: "Review the linked appendix and limitations.",
    riskSummary: "Draft-only posture remains explicit.",
    rollbackSummary: "No release side effect was produced.",
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

function buildFiledPageRecord(input: {
  filedAt: string;
  pageKey: string;
  title: string;
}): StoredWikiPageStub {
  const pageId = input.pageKey.includes("finance_memo")
    ? "cccc3333-3333-4333-8333-333333333333"
    : "dddd4444-4444-4444-8444-444444444444";

  return {
    id: pageId,
    companyId: "99999999-9999-4999-8999-999999999999",
    compileRunId: null,
    pageKey: input.pageKey,
    pageKind: "filed_artifact",
    ownershipKind: "filed_artifact",
    temporalStatus: "current",
    title: input.title,
    summary: "Draft-only reporting artifact filed.",
    markdownBody: "# Filed page",
    freshnessSummary: {
      state: "missing",
      summary: "Filed artifact pages do not carry compiler freshness.",
    },
    limitations: [],
    lastCompiledAt: input.filedAt,
    filedMetadata: {
      filedAt: input.filedAt,
      filedBy: "finance-operator",
      provenanceKind: "manual_markdown_artifact",
      provenanceSummary: "Draft-only reporting artifact filed.",
    },
    createdAt: input.filedAt,
    updatedAt: input.filedAt,
  };
}

function buildSourceDiscoveryMission(): MissionRecord {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    type: "discovery",
    status: "succeeded",
    title: "Review cash posture for acme",
    objective:
      "Answer the stored cash posture question for acme from persisted Finance Twin and CFO Wiki state only.",
    sourceKind: "manual_discovery",
    sourceRef: null,
    createdBy: "finance-operator",
    primaryRepo: null,
    spec: {
      type: "discovery",
      title: "Review cash posture for acme",
      objective:
        "Answer the stored cash posture question for acme from persisted Finance Twin and CFO Wiki state only.",
      repos: [],
      constraints: {
        mustNot: [],
        allowedPaths: [],
      },
      acceptance: ["persist one durable finance discovery answer artifact"],
      riskBudget: {
        sandboxMode: "read-only",
        maxWallClockMinutes: 5,
        maxCostUsd: 1,
        allowNetwork: false,
        requiresHumanApprovalFor: [],
      },
      deliverables: ["discovery_answer", "proof_bundle"],
      evidenceRequirements: ["stored finance discovery answer"],
      input: {
        discoveryQuestion: {
          companyKey: "acme",
          questionKind: "cash_posture",
        },
      },
    },
    createdAt: "2026-04-18T11:55:00.000Z",
    updatedAt: "2026-04-18T11:58:00.000Z",
  };
}

function buildDiscoveryAnswerArtifact(missionId: string): ArtifactRecord {
  return {
    id: "66666666-6666-4666-8666-666666666666",
    missionId,
    taskId: "77777777-7777-4777-8777-777777777777",
    kind: "discovery_answer",
    uri: `pocket-cto://missions/${missionId}/tasks/77777777-7777-4777-8777-777777777777/discovery-answer`,
    mimeType: "application/json",
    sha256: null,
    metadata: {
      source: "stored_finance_twin_and_cfo_wiki",
      summary:
        "Cash posture remains constrained by stale bank coverage and visible working-capital gaps.",
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
      answerSummary:
        "Cash posture remains constrained by stale bank coverage and visible working-capital gaps.",
      freshnessPosture: {
        state: "stale",
        reasonSummary:
          "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
      },
      limitations: [
        "Working-capital timing remains approximate because no payment calendar inference is performed.",
      ],
      relatedRoutes: [
        {
          label: "Cash posture",
          routePath: "/finance-twin/companies/acme/cash-posture",
        },
        {
          label: "Bank accounts",
          routePath: "/finance-twin/companies/acme/bank-accounts",
        },
      ],
      relatedWikiPages: [
        {
          pageKey: "metrics/cash-posture",
          title: "Cash posture",
        },
        {
          pageKey: "concepts/cash",
          title: "Cash",
        },
      ],
      evidenceSections: [
        {
          key: "cash_posture_route",
          title: "Cash posture route-backed evidence",
          summary: "Stored Finance Twin cash posture output.",
          routePath: "/finance-twin/companies/acme/cash-posture",
        },
      ],
      bodyMarkdown: "# Cash posture\n\nStored finance answer.",
      structuredData: {},
    },
    createdAt: "2026-04-18T11:58:00.000Z",
  };
}

function buildProofBundleArtifact(missionId: string): ArtifactRecord {
  return {
    id: "99999999-9999-4999-8999-999999999999",
    missionId,
    taskId: null,
    kind: "proof_bundle_manifest",
    uri: `pocket-cto://missions/${missionId}/proof-bundle-manifest`,
    mimeType: "application/json",
    sha256: null,
    metadata: {
      manifest: buildSourceProofBundle(missionId),
    },
    createdAt: "2026-04-18T11:58:30.000Z",
  };
}

function buildSourceProofBundle(missionId: string): ProofBundleManifest {
  return {
    missionId,
    missionTitle: "Review cash posture for acme",
    objective:
      "Answer the stored cash posture question for acme from persisted Finance Twin and CFO Wiki state only.",
    sourceDiscoveryMissionId: null,
    sourceReportingMissionId: null,
    companyKey: "acme",
    questionKind: "cash_posture",
    policySourceId: null,
    policySourceScope: null,
    answerSummary:
      "Cash posture remains constrained by stale bank coverage and visible working-capital gaps.",
    reportKind: null,
    reportDraftStatus: null,
    reportPublication: null,
    reportSummary: "",
    appendixPresent: false,
    freshnessState: "stale",
    freshnessSummary:
      "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
    limitationsSummary:
      "Working-capital timing remains approximate because no payment calendar inference is performed.",
    relatedRoutePaths: [
      "/finance-twin/companies/acme/cash-posture",
      "/finance-twin/companies/acme/bank-accounts",
    ],
    relatedWikiPageKeys: ["metrics/cash-posture", "concepts/cash"],
    targetRepoFullName: null,
    branchName: null,
    pullRequestNumber: null,
    pullRequestUrl: null,
    changeSummary:
      "Cash posture remains constrained by stale bank coverage and visible working-capital gaps.",
    validationSummary:
      "Finance discovery answer was assembled deterministically from stored Finance Twin and CFO Wiki state without running the Codex runtime.",
    verificationSummary:
      "Review the stored freshness, route-backed evidence, and visible limitations before acting on the answer.",
    riskSummary:
      "The answer is grounded only in stored Finance Twin and CFO Wiki state, so stale evidence must be weighed before taking follow-up action.",
    rollbackSummary:
      "No code, branch, pull request, or deploy side effect was produced.",
    latestApproval: null,
    evidenceCompleteness: {
      status: "complete",
      expectedArtifactKinds: ["discovery_answer"],
      presentArtifactKinds: ["discovery_answer"],
      missingArtifactKinds: [],
      notes: [],
    },
    decisionTrace: [
      "Scout task 0 terminalized as succeeded with persisted discovery evidence.",
    ],
    artifactIds: ["66666666-6666-4666-8666-666666666666"],
    artifacts: [
      {
        id: "66666666-6666-4666-8666-666666666666",
        kind: "discovery_answer",
      },
    ],
    replayEventCount: 6,
    timestamps: {
      missionCreatedAt: "2026-04-18T11:55:00.000Z",
      latestPlannerEvidenceAt: null,
      latestExecutorEvidenceAt: null,
      latestPullRequestAt: null,
      latestApprovalAt: null,
      latestArtifactAt: "2026-04-18T11:58:00.000Z",
    },
    status: "ready",
  };
}

function requireStoredPage(
  pages: Map<string, StoredWikiPageStub>,
  pageKey: string,
): StoredWikiPageStub {
  const page = pages.get(pageKey);

  if (!page) {
    throw new Error(`Expected filed page ${pageKey} to exist in test state.`);
  }

  return page;
}

function buildPageView(page: StoredWikiPageStub): CfoWikiPageView {
  return {
    companyId: page.companyId,
    companyKey: "acme",
    companyDisplayName: "Acme, Inc.",
    page: {
      ...page,
      markdownPath: buildCfoWikiMarkdownPath(page.pageKey),
    },
    links: [],
    backlinks: [],
    refs: [],
    latestCompileRun: null,
    freshnessSummary: page.freshnessSummary,
    limitations: page.limitations,
  };
}

function buildFiledPageListView(
  pages: StoredWikiPageStub[],
): CfoWikiFiledPageListView {
  return {
    companyId: "99999999-9999-4999-8999-999999999999",
    companyKey: "acme",
    companyDisplayName: "Acme, Inc.",
    pageCount: pages.length,
    pages: pages.map((page) => ({
      pageKey: page.pageKey,
      markdownPath: buildCfoWikiMarkdownPath(page.pageKey),
      pageKind: page.pageKind,
      temporalStatus: page.temporalStatus,
      title: page.title,
      summary: page.summary,
      freshnessSummary: page.freshnessSummary,
      limitations: page.limitations,
      lastCompiledAt: page.lastCompiledAt,
    })),
    limitations: [],
  };
}

function buildExportListView(
  exports: CfoWikiExportRunRecord[],
): CfoWikiExportListView {
  return {
    companyId: "99999999-9999-4999-8999-999999999999",
    companyKey: "acme",
    companyDisplayName: "Acme, Inc.",
    exportCount: exports.length,
    exports,
    limitations: [],
  };
}

function buildExportDetailView(
  exportRun: CfoWikiExportRunRecord,
): CfoWikiExportDetailView {
  return {
    companyId: "99999999-9999-4999-8999-999999999999",
    companyKey: "acme",
    companyDisplayName: "Acme, Inc.",
    exportRun,
    limitations: [],
  };
}

function buildExportRunRecord(input: {
  completedAt: string | null;
  id: string;
  status: CfoWikiExportRunRecord["status"];
}): CfoWikiExportRunRecord {
  const startedAt = "2026-04-18T13:06:00.000Z";

  return {
    id: input.id,
    companyId: "99999999-9999-4999-8999-999999999999",
    status: input.status,
    startedAt,
    completedAt: input.completedAt,
    triggeredBy: "finance-operator",
    exporterVersion: "f3c-wiki-export-v1",
    bundleRootPath: "acme-cfo-wiki",
    pageCount: 5,
    fileCount: 6,
    manifest: null,
    files: [],
    errorSummary: null,
    createdAt: startedAt,
    updatedAt: input.completedAt ?? startedAt,
  };
}
