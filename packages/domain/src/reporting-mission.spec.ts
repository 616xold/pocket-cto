import { describe, expect, it } from "vitest";
import {
  BoardPacketArtifactMetadataSchema,
  CreateBoardPacketMissionInputSchema,
  CreateDiligencePacketMissionInputSchema,
  CreateLenderUpdateMissionInputSchema,
  CreateReportingMissionInputSchema,
  DiligencePacketArtifactMetadataSchema,
  EvidenceAppendixArtifactMetadataSchema,
  FinanceMemoArtifactMetadataSchema,
  LenderUpdateArtifactMetadataSchema,
  ReportingMissionViewSchema,
  readReportingMissionReportKindLabel,
} from "./reporting-mission";

describe("Reporting mission domain schemas", () => {
  it("parses the narrow reporting creation input", () => {
    const parsed = CreateReportingMissionInputSchema.parse({
      sourceDiscoveryMissionId: "11111111-1111-4111-8111-111111111111",
      reportKind: "finance_memo",
      requestedBy: "finance-operator",
    });

    expect(parsed.reportKind).toBe("finance_memo");
    expect(parsed.requestedBy).toBe("finance-operator");
  });

  it("parses the dedicated board-packet creation input", () => {
    const parsed = CreateBoardPacketMissionInputSchema.parse({
      sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
      requestedBy: "finance-operator",
    });

    expect(parsed.sourceReportingMissionId).toBe(
      "11111111-1111-4111-8111-111111111111",
    );
    expect(parsed.requestedBy).toBe("finance-operator");
  });

  it("parses the dedicated lender-update creation input", () => {
    const parsed = CreateLenderUpdateMissionInputSchema.parse({
      sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
      requestedBy: "finance-operator",
    });

    expect(parsed.sourceReportingMissionId).toBe(
      "11111111-1111-4111-8111-111111111111",
    );
    expect(parsed.requestedBy).toBe("finance-operator");
  });

  it("parses the dedicated diligence-packet creation input", () => {
    const parsed = CreateDiligencePacketMissionInputSchema.parse({
      sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
      requestedBy: "finance-operator",
    });

    expect(parsed.sourceReportingMissionId).toBe(
      "11111111-1111-4111-8111-111111111111",
    );
    expect(parsed.requestedBy).toBe("finance-operator");
  });

  it("parses finance memo and evidence appendix metadata", () => {
    const financeMemo = FinanceMemoArtifactMetadataSchema.parse({
      source: "stored_discovery_evidence",
      summary:
        "Cash posture remains constrained by stale bank coverage and visible working-capital gaps.",
      reportKind: "finance_memo",
      draftStatus: "draft_only",
      sourceDiscoveryMissionId: "11111111-1111-4111-8111-111111111111",
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
      memoSummary:
        "Cash posture remains constrained by stale bank coverage and visible working-capital gaps.",
      freshnessSummary:
        "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
      limitationsSummary:
        "This memo is draft-only and carries source discovery freshness and limitation posture forward.",
      relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
      relatedWikiPageKeys: ["metrics/cash-posture"],
      sourceArtifacts: [
        {
          artifactId: "22222222-2222-4222-8222-222222222222",
          kind: "discovery_answer",
        },
      ],
      bodyMarkdown:
        "# Draft Finance Memo\n\n## Memo Summary\n\nCash posture remains constrained.",
    });
    const appendix = EvidenceAppendixArtifactMetadataSchema.parse({
      source: "stored_discovery_evidence",
      summary:
        "Evidence appendix for source discovery mission 11111111-1111-4111-8111-111111111111.",
      reportKind: "finance_memo",
      draftStatus: "draft_only",
      sourceDiscoveryMissionId: "11111111-1111-4111-8111-111111111111",
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
      appendixSummary:
        "Stored evidence appendix for discovery mission 11111111-1111-4111-8111-111111111111.",
      freshnessSummary:
        "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
      limitationsSummary:
        "This memo is draft-only and carries source discovery freshness and limitation posture forward.",
      limitations: [
        "The source discovery proof bundle is incomplete with missing evidence kinds: discovery_answer.",
      ],
      relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
      relatedWikiPageKeys: ["metrics/cash-posture"],
      sourceArtifacts: [
        {
          artifactId: "22222222-2222-4222-8222-222222222222",
          kind: "discovery_answer",
        },
      ],
      bodyMarkdown: "# Evidence Appendix\n\n## Source Discovery Lineage\n",
    });

    expect(financeMemo.reportKind).toBe("finance_memo");
    expect(appendix.sourceArtifacts).toHaveLength(1);
  });

  it("parses board-packet metadata", () => {
    const parsed = BoardPacketArtifactMetadataSchema.parse({
      source: "stored_reporting_evidence",
      summary:
        "Draft board packet for acme from the completed cash posture reporting mission.",
      reportKind: "board_packet",
      draftStatus: "draft_only",
      sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
      sourceDiscoveryMissionId: "11111111-1111-4111-8111-111111111111",
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
      packetSummary:
        "Draft board packet for acme from the completed cash posture reporting mission.",
      freshnessSummary:
        "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
      limitationsSummary:
        "This board packet is draft-only and carries source reporting freshness and limitations forward.",
      relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
      relatedWikiPageKeys: ["metrics/cash-posture"],
      sourceFinanceMemo: {
        artifactId: "44444444-4444-4444-8444-444444444444",
        kind: "finance_memo",
      },
      sourceEvidenceAppendix: {
        artifactId: "55555555-5555-4555-8555-555555555555",
        kind: "evidence_appendix",
      },
      bodyMarkdown:
        "# Draft Board Packet\n\n## Packet Summary\n\nCash posture remains constrained.",
    });

    expect(parsed.reportKind).toBe("board_packet");
    expect(parsed.sourceReportingMissionId).toBe(
      "33333333-3333-4333-8333-333333333333",
    );
    expect(parsed.sourceFinanceMemo.kind).toBe("finance_memo");
  });

  it("parses lender-update metadata", () => {
    const parsed = LenderUpdateArtifactMetadataSchema.parse({
      source: "stored_reporting_evidence",
      summary:
        "Draft lender update for acme from the completed cash posture reporting mission.",
      reportKind: "lender_update",
      draftStatus: "draft_only",
      sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
      sourceDiscoveryMissionId: "11111111-1111-4111-8111-111111111111",
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
      updateSummary:
        "Draft lender update for acme from the completed cash posture reporting mission.",
      freshnessSummary:
        "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
      limitationsSummary:
        "This lender update is draft-only and carries source reporting freshness and limitations forward.",
      relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
      relatedWikiPageKeys: ["metrics/cash-posture"],
      sourceFinanceMemo: {
        artifactId: "44444444-4444-4444-8444-444444444444",
        kind: "finance_memo",
      },
      sourceEvidenceAppendix: {
        artifactId: "55555555-5555-4555-8555-555555555555",
        kind: "evidence_appendix",
      },
      bodyMarkdown:
        "# Draft Lender Update\n\n## Update Summary\n\nCash posture remains constrained.",
    });

    expect(parsed.reportKind).toBe("lender_update");
    expect(parsed.sourceReportingMissionId).toBe(
      "33333333-3333-4333-8333-333333333333",
    );
    expect(parsed.sourceEvidenceAppendix.kind).toBe("evidence_appendix");
  });

  it("parses diligence-packet metadata", () => {
    const parsed = DiligencePacketArtifactMetadataSchema.parse({
      source: "stored_reporting_evidence",
      summary:
        "Draft diligence packet for acme from the completed cash posture reporting mission.",
      reportKind: "diligence_packet",
      draftStatus: "draft_only",
      sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
      sourceDiscoveryMissionId: "11111111-1111-4111-8111-111111111111",
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
      packetSummary:
        "Draft diligence packet for acme from the completed cash posture reporting mission.",
      freshnessSummary:
        "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
      limitationsSummary:
        "This diligence packet is draft-only and carries source reporting freshness and limitations forward.",
      relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
      relatedWikiPageKeys: ["metrics/cash-posture"],
      sourceFinanceMemo: {
        artifactId: "44444444-4444-4444-8444-444444444444",
        kind: "finance_memo",
      },
      sourceEvidenceAppendix: {
        artifactId: "55555555-5555-4555-8555-555555555555",
        kind: "evidence_appendix",
      },
      bodyMarkdown:
        "# Draft Diligence Packet\n\n## Packet Summary\n\nCash posture remains constrained.",
    });

    expect(parsed.reportKind).toBe("diligence_packet");
    expect(parsed.sourceReportingMissionId).toBe(
      "33333333-3333-4333-8333-333333333333",
    );
    expect(parsed.sourceFinanceMemo.kind).toBe("finance_memo");
  });

  it("parses the reporting read model view", () => {
    const parsed = ReportingMissionViewSchema.parse({
      reportKind: "finance_memo",
      draftStatus: "draft_only",
      sourceDiscoveryMissionId: "11111111-1111-4111-8111-111111111111",
      sourceReportingMissionId: null,
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
      reportSummary:
        "Cash posture remains constrained by stale bank coverage and visible working-capital gaps.",
      freshnessSummary:
        "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
      limitationsSummary:
        "This memo is draft-only and carries source discovery freshness and limitation posture forward.",
      relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
      relatedWikiPageKeys: ["metrics/cash-posture"],
      appendixPresent: true,
      financeMemo: null,
      evidenceAppendix: null,
      boardPacket: null,
      publication: {
        storedDraft: true,
        filedMemo: null,
        filedEvidenceAppendix: null,
        latestMarkdownExport: null,
        summary:
          "Draft memo and evidence appendix are stored. Neither draft artifact has been filed into the CFO Wiki yet. No markdown export run has been recorded yet.",
      },
    });

    expect(parsed.appendixPresent).toBe(true);
    expect(parsed.publication?.storedDraft).toBe(true);
    expect(readReportingMissionReportKindLabel(parsed.reportKind)).toBe(
      "Finance memo",
    );
  });

  it("parses the board-packet reporting read model view", () => {
    const parsed = ReportingMissionViewSchema.parse({
      reportKind: "board_packet",
      draftStatus: "draft_only",
      sourceDiscoveryMissionId: "11111111-1111-4111-8111-111111111111",
      sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
      reportSummary:
        "Draft board packet for acme from the completed cash posture reporting mission.",
      freshnessSummary:
        "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
      limitationsSummary:
        "This board packet is draft-only and carries source reporting freshness and limitations forward.",
      relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
      relatedWikiPageKeys: ["metrics/cash-posture"],
      appendixPresent: true,
      financeMemo: null,
      evidenceAppendix: null,
      boardPacket: {
        source: "stored_reporting_evidence",
        summary:
          "Draft board packet for acme from the completed cash posture reporting mission.",
        reportKind: "board_packet",
        draftStatus: "draft_only",
        sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
        sourceDiscoveryMissionId: "11111111-1111-4111-8111-111111111111",
        companyKey: "acme",
        questionKind: "cash_posture",
        policySourceId: null,
        policySourceScope: null,
        packetSummary:
          "Draft board packet for acme from the completed cash posture reporting mission.",
        freshnessSummary:
          "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
        limitationsSummary:
          "This board packet is draft-only and carries source reporting freshness and limitations forward.",
        relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
        relatedWikiPageKeys: ["metrics/cash-posture"],
        sourceFinanceMemo: {
          artifactId: "44444444-4444-4444-8444-444444444444",
          kind: "finance_memo",
        },
        sourceEvidenceAppendix: {
          artifactId: "55555555-5555-4555-8555-555555555555",
          kind: "evidence_appendix",
        },
        bodyMarkdown:
          "# Draft Board Packet\n\n## Packet Summary\n\nCash posture remains constrained.",
      },
      publication: null,
    });

    expect(parsed.boardPacket?.sourceEvidenceAppendix.kind).toBe(
      "evidence_appendix",
    );
    expect(parsed.publication).toBeNull();
    expect(readReportingMissionReportKindLabel(parsed.reportKind)).toBe(
      "Board packet",
    );
  });

  it("parses the lender-update reporting read model view", () => {
    const parsed = ReportingMissionViewSchema.parse({
      reportKind: "lender_update",
      draftStatus: "draft_only",
      sourceDiscoveryMissionId: "11111111-1111-4111-8111-111111111111",
      sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
      reportSummary:
        "Draft lender update for acme from the completed cash posture reporting mission.",
      freshnessSummary:
        "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
      limitationsSummary:
        "This lender update is draft-only and carries source reporting freshness and limitations forward.",
      relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
      relatedWikiPageKeys: ["metrics/cash-posture"],
      appendixPresent: true,
      financeMemo: null,
      evidenceAppendix: null,
      boardPacket: null,
      lenderUpdate: {
        source: "stored_reporting_evidence",
        summary:
          "Draft lender update for acme from the completed cash posture reporting mission.",
        reportKind: "lender_update",
        draftStatus: "draft_only",
        sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
        sourceDiscoveryMissionId: "11111111-1111-4111-8111-111111111111",
        companyKey: "acme",
        questionKind: "cash_posture",
        policySourceId: null,
        policySourceScope: null,
        updateSummary:
          "Draft lender update for acme from the completed cash posture reporting mission.",
        freshnessSummary:
          "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
        limitationsSummary:
          "This lender update is draft-only and carries source reporting freshness and limitations forward.",
        relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
        relatedWikiPageKeys: ["metrics/cash-posture"],
        sourceFinanceMemo: {
          artifactId: "44444444-4444-4444-8444-444444444444",
          kind: "finance_memo",
        },
        sourceEvidenceAppendix: {
          artifactId: "55555555-5555-4555-8555-555555555555",
          kind: "evidence_appendix",
        },
        bodyMarkdown:
          "# Draft Lender Update\n\n## Update Summary\n\nCash posture remains constrained.",
      },
      publication: null,
    });

    expect(parsed.lenderUpdate?.sourceEvidenceAppendix.kind).toBe(
      "evidence_appendix",
    );
    expect(parsed.publication).toBeNull();
    expect(readReportingMissionReportKindLabel(parsed.reportKind)).toBe(
      "Lender update",
    );
  });

  it("parses the diligence-packet reporting read model view", () => {
    const parsed = ReportingMissionViewSchema.parse({
      reportKind: "diligence_packet",
      draftStatus: "draft_only",
      sourceDiscoveryMissionId: "11111111-1111-4111-8111-111111111111",
      sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
      reportSummary:
        "Draft diligence packet for acme from the completed cash posture reporting mission.",
      freshnessSummary:
        "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
      limitationsSummary:
        "This diligence packet is draft-only and carries source reporting freshness and limitations forward.",
      relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
      relatedWikiPageKeys: ["metrics/cash-posture"],
      appendixPresent: true,
      financeMemo: null,
      evidenceAppendix: null,
      boardPacket: null,
      lenderUpdate: null,
      diligencePacket: {
        source: "stored_reporting_evidence",
        summary:
          "Draft diligence packet for acme from the completed cash posture reporting mission.",
        reportKind: "diligence_packet",
        draftStatus: "draft_only",
        sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
        sourceDiscoveryMissionId: "11111111-1111-4111-8111-111111111111",
        companyKey: "acme",
        questionKind: "cash_posture",
        policySourceId: null,
        policySourceScope: null,
        packetSummary:
          "Draft diligence packet for acme from the completed cash posture reporting mission.",
        freshnessSummary:
          "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
        limitationsSummary:
          "This diligence packet is draft-only and carries source reporting freshness and limitations forward.",
        relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
        relatedWikiPageKeys: ["metrics/cash-posture"],
        sourceFinanceMemo: {
          artifactId: "44444444-4444-4444-8444-444444444444",
          kind: "finance_memo",
        },
        sourceEvidenceAppendix: {
          artifactId: "55555555-5555-4555-8555-555555555555",
          kind: "evidence_appendix",
        },
        bodyMarkdown:
          "# Draft Diligence Packet\n\n## Packet Summary\n\nCash posture remains constrained.",
      },
      publication: null,
    });

    expect(parsed.diligencePacket?.sourceEvidenceAppendix.kind).toBe(
      "evidence_appendix",
    );
    expect(parsed.publication).toBeNull();
    expect(readReportingMissionReportKindLabel(parsed.reportKind)).toBe(
      "Diligence packet",
    );
  });
});
