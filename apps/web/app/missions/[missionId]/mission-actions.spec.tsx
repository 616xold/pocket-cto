import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { MissionDetailView } from "@pocket-cto/domain";
import { MissionActions } from "./mission-actions";

describe("MissionActions", () => {
  it("renders diligence-packet creation from completed finance-memo reporting", () => {
    const html = renderToStaticMarkup(
      <MissionActions
        approvalCards={[]}
        discoveryAnswer={null}
        liveControl={{
          enabled: false,
          limitation: "single_process_only",
          mode: "api_only",
        }}
        mission={{
          id: "11111111-1111-4111-8111-111111111111",
          type: "reporting",
          sourceKind: "manual_reporting",
          sourceRef: null,
          title: "Draft finance memo for acme",
          objective:
            "Compile one draft finance memo plus one linked evidence appendix from completed discovery mission 22222222-2222-4222-8222-222222222222.",
          status: "succeeded",
          primaryRepo: null,
          createdBy: "operator",
          createdAt: "2026-04-19T12:00:00.000Z",
          updatedAt: "2026-04-19T12:05:00.000Z",
          spec: {
            type: "reporting",
            title: "Draft finance memo for acme",
            objective:
              "Compile one draft finance memo plus one linked evidence appendix from completed discovery mission 22222222-2222-4222-8222-222222222222.",
            repos: [],
            constraints: {
              mustNot: [],
              allowedPaths: [],
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
            evidenceRequirements: [],
          },
        }}
        reporting={buildFinanceMemoReportingView()}
        tasks={[]}
      />,
    );

    expect(html).toContain("Create draft board packet");
    expect(html).toContain("Create draft lender update");
    expect(html).toContain("Create draft diligence packet");
  });

  it("renders lender-update-specific draft-only follow-on copy", () => {
    const html = renderToStaticMarkup(
      <MissionActions
        approvalCards={[]}
        discoveryAnswer={null}
        liveControl={{
          enabled: false,
          limitation: "single_process_only",
          mode: "api_only",
        }}
        mission={{
          id: "11111111-1111-4111-8111-111111111111",
          type: "reporting",
          sourceKind: "manual_reporting",
          sourceRef: null,
          title: "Draft lender update for acme",
          objective:
            "Compile one draft lender update from completed reporting mission 22222222-2222-4222-8222-222222222222 and its stored finance memo plus evidence appendix only.",
          status: "succeeded",
          primaryRepo: null,
          createdBy: "operator",
          createdAt: "2026-04-19T12:00:00.000Z",
          updatedAt: "2026-04-19T12:05:00.000Z",
          spec: {
            type: "reporting",
            title: "Draft lender update for acme",
            objective:
              "Compile one draft lender update from completed reporting mission 22222222-2222-4222-8222-222222222222 and its stored finance memo plus evidence appendix only.",
            repos: [],
            constraints: {
              mustNot: [],
              allowedPaths: [],
            },
            acceptance: [],
            riskBudget: {
              sandboxMode: "read-only",
              maxWallClockMinutes: 5,
              maxCostUsd: 1,
              allowNetwork: false,
              requiresHumanApprovalFor: [],
            },
            deliverables: ["lender_update", "proof_bundle"],
            evidenceRequirements: [],
          },
        }}
        reporting={buildLenderUpdateReportingView()}
        tasks={[]}
      />,
    );

    expect(html).toContain(
      "This first real F5C4B slice keeps lender updates delivery-free and runtime-free, but it does allow one persisted release-approval path plus one external release-log path from one completed lender-update reporting mission with one stored lender_update artifact.",
    );
    expect(html).toContain("Request lender update release approval");
    expect(html).not.toContain(
      "Board packet missions remain draft-only in F5C1.",
    );
  });

  it("renders diligence-packet-specific release-approval action copy", () => {
    const html = renderToStaticMarkup(
      <MissionActions
        approvalCards={[]}
        discoveryAnswer={null}
        liveControl={{
          enabled: false,
          limitation: "single_process_only",
          mode: "api_only",
        }}
        mission={{
          id: "11111111-1111-4111-8111-111111111111",
          type: "reporting",
          sourceKind: "manual_reporting",
          sourceRef: null,
          title: "Draft diligence packet for acme",
          objective:
            "Compile one draft diligence packet from completed reporting mission 22222222-2222-4222-8222-222222222222 and its stored finance memo plus evidence appendix only.",
          status: "succeeded",
          primaryRepo: null,
          createdBy: "operator",
          createdAt: "2026-04-19T12:00:00.000Z",
          updatedAt: "2026-04-19T12:05:00.000Z",
          spec: {
            type: "reporting",
            title: "Draft diligence packet for acme",
            objective:
              "Compile one draft diligence packet from completed reporting mission 22222222-2222-4222-8222-222222222222 and its stored finance memo plus evidence appendix only.",
            repos: [],
            constraints: {
              mustNot: [],
              allowedPaths: [],
            },
            acceptance: [],
            riskBudget: {
              sandboxMode: "read-only",
              maxWallClockMinutes: 5,
              maxCostUsd: 1,
              allowNetwork: false,
              requiresHumanApprovalFor: [],
            },
            deliverables: ["diligence_packet", "proof_bundle"],
            evidenceRequirements: [],
          },
        }}
        reporting={buildDiligencePacketReportingView()}
        tasks={[]}
      />,
    );

    expect(html).toContain(
      "This first real F5C4C slice keeps diligence packets delivery-free and runtime-free, but it does allow one persisted release-approval path from one completed diligence-packet reporting mission with one stored diligence_packet artifact.",
    );
    expect(html).toContain("Request diligence packet release approval");
    expect(html).not.toContain("Record lender update as released");
  });

  it("renders lender-update release-log action after release approval is granted", () => {
    const html = renderToStaticMarkup(
      <MissionActions
        approvalCards={[]}
        discoveryAnswer={null}
        liveControl={{
          enabled: false,
          limitation: "single_process_only",
          mode: "api_only",
        }}
        mission={{
          id: "11111111-1111-4111-8111-111111111111",
          type: "reporting",
          sourceKind: "manual_reporting",
          sourceRef: null,
          title: "Draft lender update for acme",
          objective:
            "Compile one draft lender update from completed reporting mission 22222222-2222-4222-8222-222222222222 and its stored finance memo plus evidence appendix only.",
          status: "succeeded",
          primaryRepo: null,
          createdBy: "operator",
          createdAt: "2026-04-19T12:00:00.000Z",
          updatedAt: "2026-04-19T12:05:00.000Z",
          spec: {
            type: "reporting",
            title: "Draft lender update for acme",
            objective:
              "Compile one draft lender update from completed reporting mission 22222222-2222-4222-8222-222222222222 and its stored finance memo plus evidence appendix only.",
            repos: [],
            constraints: {
              mustNot: [],
              allowedPaths: [],
            },
            acceptance: [],
            riskBudget: {
              sandboxMode: "read-only",
              maxWallClockMinutes: 5,
              maxCostUsd: 1,
              allowNetwork: false,
              requiresHumanApprovalFor: [],
            },
            deliverables: ["lender_update", "proof_bundle"],
            evidenceRequirements: [],
          },
        }}
        reporting={{
          ...buildLenderUpdateReportingView(),
          releaseReadiness: {
            releaseApprovalStatus: "approved_for_release",
            releaseReady: true,
            approvalId: "44444444-4444-4444-8444-444444444444",
            approvalStatus: "approved",
            requestedAt: "2026-04-20T09:00:00.000Z",
            requestedBy: "finance-operator",
            resolvedAt: "2026-04-20T09:05:00.000Z",
            resolvedBy: "finance-reviewer",
            rationale: "Looks release-ready.",
            summary:
              "Release approval was granted by finance-reviewer; the stored lender update is approved for release, but no delivery has been recorded.",
          },
        }}
        tasks={[]}
      />,
    );

    expect(html).toContain("Record lender update as released");
    expect(html).toContain(
      "Pocket CFO still does not send or distribute the lender update. This action only records that release happened externally after approval.",
    );
    expect(html).not.toContain("Request lender update release approval");
  });
});

function buildFinanceMemoReportingView(): NonNullable<
  MissionDetailView["reporting"]
> {
  return {
    reportKind: "finance_memo",
    draftStatus: "draft_only",
    sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
    sourceReportingMissionId: null,
    companyKey: "acme",
    questionKind: "cash_posture",
    policySourceId: null,
    policySourceScope: null,
    reportSummary:
      "Draft finance memo for acme from the completed cash posture discovery mission.",
    freshnessSummary: "Fresh through the stored discovery mission.",
    limitationsSummary:
      "This memo is draft-only and carries source discovery freshness and limitations forward.",
    relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
    relatedWikiPageKeys: ["metrics/cash-posture"],
    appendixPresent: true,
    financeMemo: {
      source: "stored_discovery_evidence",
      summary:
        "Draft finance memo for acme from the completed cash posture discovery mission.",
      reportKind: "finance_memo",
      draftStatus: "draft_only",
      sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
      memoSummary:
        "Draft finance memo for acme from the completed cash posture discovery mission.",
      freshnessSummary: "Fresh through the stored discovery mission.",
      limitationsSummary:
        "This memo is draft-only and carries source discovery freshness and limitations forward.",
      relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
      relatedWikiPageKeys: ["metrics/cash-posture"],
      sourceArtifacts: [
        {
          artifactId: "44444444-4444-4444-8444-444444444444",
          kind: "discovery_answer",
        },
      ],
      bodyMarkdown: "# Draft Finance Memo",
    },
    evidenceAppendix: {
      source: "stored_discovery_evidence",
      summary: "Evidence appendix for stored discovery evidence.",
      reportKind: "finance_memo",
      draftStatus: "draft_only",
      sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
      appendixSummary: "Stored appendix.",
      freshnessSummary: "Fresh through the stored discovery mission.",
      limitationsSummary:
        "This memo is draft-only and carries source discovery freshness and limitations forward.",
      limitations: ["Visible limitations remain preserved."],
      relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
      relatedWikiPageKeys: ["metrics/cash-posture"],
      sourceArtifacts: [
        {
          artifactId: "44444444-4444-4444-8444-444444444444",
          kind: "discovery_answer",
        },
      ],
      bodyMarkdown: "# Evidence Appendix",
    },
    boardPacket: null,
    lenderUpdate: null,
    diligencePacket: null,
    releaseRecord: null,
    releaseReadiness: null,
    publication: {
      storedDraft: true,
      filedMemo: null,
      filedEvidenceAppendix: null,
      latestMarkdownExport: null,
      summary:
        "Draft memo and evidence appendix are stored. Neither draft artifact has been filed into the CFO Wiki yet. No markdown export run has been recorded yet.",
    },
  } satisfies NonNullable<MissionDetailView["reporting"]>;
}

function buildLenderUpdateReportingView(): NonNullable<
  MissionDetailView["reporting"]
> {
  return {
    reportKind: "lender_update",
    draftStatus: "draft_only",
    sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
    sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
    companyKey: "acme",
    questionKind: "cash_posture",
    policySourceId: null,
    policySourceScope: null,
    reportSummary:
      "Draft lender update for acme from the completed cash posture reporting mission.",
    freshnessSummary: "Fresh through the stored source reporting mission.",
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
      sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
      sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
      updateSummary:
        "Draft lender update for acme from the completed cash posture reporting mission.",
      freshnessSummary: "Fresh through the stored source reporting mission.",
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
      bodyMarkdown: "# Draft Lender Update",
    },
    diligencePacket: null,
    publication: null,
    releaseRecord: null,
    releaseReadiness: {
      releaseApprovalStatus: "not_requested",
      releaseReady: false,
      approvalId: null,
      approvalStatus: null,
      requestedAt: null,
      requestedBy: null,
      resolvedAt: null,
      resolvedBy: null,
      rationale: null,
      summary:
        "Stored lender update exists, but release approval has not been requested yet.",
    },
  } satisfies NonNullable<MissionDetailView["reporting"]>;
}

function buildDiligencePacketReportingView(): NonNullable<
  MissionDetailView["reporting"]
> {
  return {
    reportKind: "diligence_packet",
    draftStatus: "draft_only",
    sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
    sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
    companyKey: "acme",
    questionKind: "cash_posture",
    policySourceId: null,
    policySourceScope: null,
    reportSummary:
      "Draft diligence packet for acme from the completed cash posture reporting mission.",
    freshnessSummary: "Fresh through the stored source reporting mission.",
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
      sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
      sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
      packetSummary:
        "Draft diligence packet for acme from the completed cash posture reporting mission.",
      freshnessSummary: "Fresh through the stored source reporting mission.",
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
      bodyMarkdown: "# Draft Diligence Packet",
    },
    publication: null,
    releaseRecord: null,
    releaseReadiness: {
      releaseApprovalStatus: "not_requested",
      releaseReady: false,
      approvalId: null,
      approvalStatus: null,
      requestedAt: null,
      requestedBy: null,
      resolvedAt: null,
      resolvedBy: null,
      rationale: null,
      summary:
        "Stored diligence packet exists, but release approval has not been requested yet.",
    },
  } satisfies NonNullable<MissionDetailView["reporting"]>;
}
