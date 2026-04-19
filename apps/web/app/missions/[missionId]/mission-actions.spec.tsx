import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { MissionDetailView } from "@pocket-cto/domain";
import { MissionActions } from "./mission-actions";

describe("MissionActions", () => {
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
      "Lender update missions remain draft-only in F5C2. Filing, markdown export, approval, release, PDF, and slide actions stay out of scope here.",
    );
    expect(html).not.toContain(
      "Board packet missions remain draft-only in F5C1.",
    );
  });
});

function buildLenderUpdateReportingView(): MissionDetailView["reporting"] {
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
    publication: null,
  } satisfies NonNullable<MissionDetailView["reporting"]>;
}
