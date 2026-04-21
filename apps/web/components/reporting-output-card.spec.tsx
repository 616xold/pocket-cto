import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ReportingOutputCard } from "./reporting-output-card";

describe("ReportingOutputCard", () => {
  it("renders stored memo and appendix bodies plus explicit filed and export posture", () => {
    const html = renderToStaticMarkup(
      <ReportingOutputCard
        proofBundle={{
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
          releaseRecord: null,
          releaseReadiness: null,
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
              "Draft memo and evidence appendix are stored. Both filed pages exist in the CFO Wiki and the latest markdown export includes them.",
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
        }}
        reporting={{
          reportKind: "finance_memo",
          draftStatus: "draft_only",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          sourceReportingMissionId: null,
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          reportSummary: "Cash posture remains constrained.",
          freshnessSummary: "Cash posture remains stale.",
          limitationsSummary: "Draft-only posture remains explicit.",
          relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
          relatedWikiPageKeys: ["metrics/cash-posture"],
          appendixPresent: true,
          lenderUpdate: null,
          financeMemo: {
            source: "stored_discovery_evidence",
            summary: "Cash posture remains constrained.",
            reportKind: "finance_memo",
            draftStatus: "draft_only",
            sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
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
                artifactId: "44444444-4444-4444-8444-444444444444",
                kind: "discovery_answer",
              },
            ],
            bodyMarkdown:
              "# Draft Finance Memo\n\n## Memo Summary\n\nCash posture remains constrained.",
          },
          evidenceAppendix: {
            source: "stored_discovery_evidence",
            summary: "Evidence appendix for stored discovery evidence.",
            reportKind: "finance_memo",
            draftStatus: "draft_only",
            sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
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
                artifactId: "44444444-4444-4444-8444-444444444444",
                kind: "discovery_answer",
              },
            ],
            bodyMarkdown:
              "# Evidence Appendix\n\n## Source Discovery Lineage\n\nStored lineage.",
          },
          boardPacket: null,
          diligencePacket: null,
          releaseRecord: null,
          releaseReadiness: null,
          publication: {
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
              "Draft memo and evidence appendix are stored. Both filed pages exist in the CFO Wiki and the latest markdown export includes them.",
          },
        }}
      />,
    );

    expect(html).toContain("Draft memo body");
    expect(html).toContain("Evidence appendix body");
    expect(html).toContain("## Memo Summary");
    expect(html).toContain("## Source Discovery Lineage");
    expect(html).toContain(
      "filed/reporting-11111111-1111-4111-8111-111111111111-finance_memo",
    );
    expect(html).toContain("33333333-3333-4333-8333-333333333333");
    expect(html).toContain("Draft memo and evidence appendix are stored.");
  });

  it("renders a board packet with source reporting lineage and linked appendix posture", () => {
    const html = renderToStaticMarkup(
      <ReportingOutputCard
        proofBundle={{
          missionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          missionTitle: "Draft board packet for acme",
          objective:
            "Compile one draft board packet from stored finance memo and evidence appendix artifacts.",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          answerSummary: "",
          reportKind: "board_packet",
          reportDraftStatus: "draft_only",
          reportPublication: null,
          releaseRecord: null,
          releaseReadiness: null,
          reportSummary:
            "Draft board packet for acme from the completed cash posture reporting mission.",
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
          evidenceCompleteness: {
            status: "complete",
            expectedArtifactKinds: ["board_packet"],
            presentArtifactKinds: ["board_packet"],
            missingArtifactKinds: [],
            notes: [],
          },
          decisionTrace: [],
          artifactIds: [],
          artifacts: [],
          replayEventCount: 0,
          timestamps: {
            missionCreatedAt: "2026-04-19T13:00:00.000Z",
            latestPlannerEvidenceAt: null,
            latestExecutorEvidenceAt: null,
            latestPullRequestAt: null,
            latestApprovalAt: null,
            latestArtifactAt: "2026-04-19T13:02:00.000Z",
          },
          status: "ready",
        }}
        reporting={{
          reportKind: "board_packet",
          draftStatus: "draft_only",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          reportSummary:
            "Draft board packet for acme from the completed cash posture reporting mission.",
          freshnessSummary: "Cash posture remains stale.",
          limitationsSummary: "Draft-only posture remains explicit.",
          relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
          relatedWikiPageKeys: ["metrics/cash-posture"],
          appendixPresent: true,
          lenderUpdate: null,
          financeMemo: null,
          evidenceAppendix: null,
          boardPacket: {
            source: "stored_reporting_evidence",
            summary:
              "Draft board packet for acme from the completed cash posture reporting mission.",
            reportKind: "board_packet",
            draftStatus: "draft_only",
            sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
            sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
            companyKey: "acme",
            questionKind: "cash_posture",
            policySourceId: null,
            policySourceScope: null,
            packetSummary:
              "Draft board packet for acme from the completed cash posture reporting mission.",
            freshnessSummary: "Cash posture remains stale.",
            limitationsSummary: "Draft-only posture remains explicit.",
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
              "# Draft Board Packet\n\n## Linked Evidence Appendix Posture\n\n- Appendix remains linked.",
          },
          diligencePacket: null,
          releaseRecord: null,
          releaseReadiness: null,
          publication: null,
        }}
      />,
    );

    expect(html).toContain("Draft board packet body");
    expect(html).toContain("Source reporting mission");
    expect(html).toContain("33333333-3333-4333-8333-333333333333");
    expect(html).toContain("Linked from source reporting mission");
    expect(html).toContain("44444444-4444-4444-8444-444444444444");
    expect(html).toContain("55555555-5555-4555-8555-555555555555");
    expect(html).not.toContain("Markdown export");
  });

  it("renders a lender update with source reporting lineage and linked appendix posture", () => {
    const html = renderToStaticMarkup(
      <ReportingOutputCard
        proofBundle={{
          missionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          missionTitle: "Draft lender update for acme",
          objective:
            "Compile one draft lender update from stored finance memo and evidence appendix artifacts.",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          answerSummary: "",
          reportKind: "lender_update",
          reportDraftStatus: "draft_only",
          reportPublication: null,
          releaseRecord: null,
          releaseReadiness: null,
          reportSummary:
            "Draft lender update for acme from the completed cash posture reporting mission.",
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
          evidenceCompleteness: {
            status: "complete",
            expectedArtifactKinds: ["lender_update"],
            presentArtifactKinds: ["lender_update"],
            missingArtifactKinds: [],
            notes: [],
          },
          decisionTrace: [],
          artifactIds: [],
          artifacts: [],
          replayEventCount: 0,
          timestamps: {
            missionCreatedAt: "2026-04-19T13:30:00.000Z",
            latestPlannerEvidenceAt: null,
            latestExecutorEvidenceAt: null,
            latestPullRequestAt: null,
            latestApprovalAt: null,
            latestArtifactAt: "2026-04-19T13:32:00.000Z",
          },
          status: "ready",
        }}
        reporting={{
          reportKind: "lender_update",
          draftStatus: "draft_only",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          reportSummary:
            "Draft lender update for acme from the completed cash posture reporting mission.",
          freshnessSummary: "Cash posture remains stale.",
          limitationsSummary: "Draft-only posture remains explicit.",
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
            sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
            companyKey: "acme",
            questionKind: "cash_posture",
            policySourceId: null,
            policySourceScope: null,
            updateSummary:
              "Draft lender update for acme from the completed cash posture reporting mission.",
            freshnessSummary: "Cash posture remains stale.",
            limitationsSummary: "Draft-only posture remains explicit.",
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
          diligencePacket: null,
          releaseRecord: null,
          releaseReadiness: null,
          publication: null,
        }}
      />,
    );

    expect(html).toContain("Draft lender update body");
    expect(html).toContain("Source reporting mission");
    expect(html).toContain("33333333-3333-4333-8333-333333333333");
    expect(html).toContain("Linked from source reporting mission");
    expect(html).toContain("44444444-4444-4444-8444-444444444444");
    expect(html).toContain("55555555-5555-4555-8555-555555555555");
    expect(html).not.toContain("Markdown export");
  });

  it("renders a diligence packet with source reporting lineage and linked appendix posture", () => {
    const html = renderToStaticMarkup(
      <ReportingOutputCard
        proofBundle={{
          missionId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
          missionTitle: "Draft diligence packet for acme",
          objective:
            "Compile one draft diligence packet from stored finance memo and evidence appendix artifacts.",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          answerSummary: "",
          reportKind: "diligence_packet",
          reportDraftStatus: "draft_only",
          reportPublication: null,
          releaseRecord: null,
          releaseReadiness: null,
          reportSummary:
            "Draft diligence packet for acme from the completed cash posture reporting mission.",
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
          evidenceCompleteness: {
            status: "complete",
            expectedArtifactKinds: ["diligence_packet"],
            presentArtifactKinds: ["diligence_packet"],
            missingArtifactKinds: [],
            notes: [],
          },
          decisionTrace: [],
          artifactIds: [],
          artifacts: [],
          replayEventCount: 0,
          timestamps: {
            missionCreatedAt: "2026-04-19T14:00:00.000Z",
            latestPlannerEvidenceAt: null,
            latestExecutorEvidenceAt: null,
            latestPullRequestAt: null,
            latestApprovalAt: null,
            latestArtifactAt: "2026-04-19T14:02:00.000Z",
          },
          status: "ready",
        }}
        reporting={{
          reportKind: "diligence_packet",
          draftStatus: "draft_only",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          reportSummary:
            "Draft diligence packet for acme from the completed cash posture reporting mission.",
          freshnessSummary: "Cash posture remains stale.",
          limitationsSummary: "Draft-only posture remains explicit.",
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
            sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
            companyKey: "acme",
            questionKind: "cash_posture",
            policySourceId: null,
            policySourceScope: null,
            packetSummary:
              "Draft diligence packet for acme from the completed cash posture reporting mission.",
            freshnessSummary: "Cash posture remains stale.",
            limitationsSummary: "Draft-only posture remains explicit.",
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
          releaseRecord: null,
          releaseReadiness: null,
          publication: null,
        }}
      />,
    );

    expect(html).toContain("Draft diligence packet body");
    expect(html).toContain("Source reporting mission");
    expect(html).toContain("33333333-3333-4333-8333-333333333333");
    expect(html).toContain("Linked from source reporting mission");
    expect(html).toContain("44444444-4444-4444-8444-444444444444");
    expect(html).toContain("55555555-5555-4555-8555-555555555555");
    expect(html).not.toContain("Markdown export");
  });

  it("renders lender-update release-readiness posture without implying delivery", () => {
    const html = renderToStaticMarkup(
      <ReportingOutputCard
        proofBundle={{
          missionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          missionTitle: "Draft lender update for acme",
          objective:
            "Compile one draft lender update from stored finance memo and evidence appendix artifacts.",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          answerSummary: "",
          reportKind: "lender_update",
          reportDraftStatus: "draft_only",
          reportSummary:
            "Draft lender update for acme from the completed cash posture reporting mission.",
          reportPublication: null,
          releaseRecord: null,
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
          evidenceCompleteness: {
            status: "complete",
            expectedArtifactKinds: ["lender_update"],
            presentArtifactKinds: ["lender_update"],
            missingArtifactKinds: [],
            notes: [],
          },
          decisionTrace: [],
          artifactIds: [],
          artifacts: [],
          replayEventCount: 0,
          timestamps: {
            missionCreatedAt: "2026-04-20T09:00:00.000Z",
            latestPlannerEvidenceAt: null,
            latestExecutorEvidenceAt: null,
            latestPullRequestAt: null,
            latestApprovalAt: "2026-04-20T09:05:00.000Z",
            latestArtifactAt: "2026-04-20T09:02:00.000Z",
          },
          status: "ready",
        }}
        reporting={{
          reportKind: "lender_update",
          draftStatus: "draft_only",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          reportSummary:
            "Draft lender update for acme from the completed cash posture reporting mission.",
          freshnessSummary: "Cash posture remains stale.",
          limitationsSummary: "Draft-only posture remains explicit.",
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
            sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
            companyKey: "acme",
            questionKind: "cash_posture",
            policySourceId: null,
            policySourceScope: null,
            updateSummary:
              "Draft lender update for acme from the completed cash posture reporting mission.",
            freshnessSummary: "Cash posture remains stale.",
            limitationsSummary: "Draft-only posture remains explicit.",
            relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
            relatedWikiPageKeys: ["metrics/cash-posture"],
            sourceFinanceMemo: {
              artifactId: "55555555-5555-4555-8555-555555555555",
              kind: "finance_memo",
            },
            sourceEvidenceAppendix: {
              artifactId: "66666666-6666-4666-8666-666666666666",
              kind: "evidence_appendix",
            },
            bodyMarkdown:
              "# Draft Lender Update\n\n## Release Review\n\nApproved for release.",
          },
          diligencePacket: null,
          publication: null,
          releaseRecord: null,
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
      />,
    );

    expect(html).toContain("approved_for_release");
    expect(html).toContain("Release ready");
    expect(html).toContain("no delivery has been recorded");
  });

  it("renders diligence-packet release-readiness posture with explicit release-log placeholders", () => {
    const html = renderToStaticMarkup(
      <ReportingOutputCard
        proofBundle={{
          missionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          missionTitle: "Draft diligence packet for acme",
          objective:
            "Compile one draft diligence packet from stored finance memo and evidence appendix artifacts.",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          answerSummary: "",
          reportKind: "diligence_packet",
          reportDraftStatus: "draft_only",
          reportSummary:
            "Draft diligence packet for acme from the completed cash posture reporting mission.",
          releaseRecord: null,
          releaseReadiness: {
            releaseApprovalStatus: "approved_for_release",
            releaseReady: true,
            approvalId: "44444444-4444-4444-8444-444444444444",
            approvalStatus: "approved",
            requestedAt: "2026-04-21T09:00:00.000Z",
            requestedBy: "finance-operator",
            resolvedAt: "2026-04-21T09:05:00.000Z",
            resolvedBy: "finance-reviewer",
            rationale: "Looks release-ready.",
            summary:
              "Release approval was granted by finance-reviewer; the stored diligence packet is approved for release, but no delivery has been recorded.",
          },
          reportPublication: null,
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
          evidenceCompleteness: {
            status: "complete",
            expectedArtifactKinds: ["diligence_packet"],
            presentArtifactKinds: ["diligence_packet"],
            missingArtifactKinds: [],
            notes: [],
          },
          decisionTrace: [],
          artifactIds: [],
          artifacts: [],
          replayEventCount: 0,
          timestamps: {
            missionCreatedAt: "2026-04-21T09:00:00.000Z",
            latestPlannerEvidenceAt: null,
            latestExecutorEvidenceAt: null,
            latestPullRequestAt: null,
            latestApprovalAt: "2026-04-21T09:05:00.000Z",
            latestArtifactAt: "2026-04-21T09:02:00.000Z",
          },
          status: "ready",
        }}
        reporting={{
          reportKind: "diligence_packet",
          draftStatus: "draft_only",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          reportSummary:
            "Draft diligence packet for acme from the completed cash posture reporting mission.",
          freshnessSummary: "Cash posture remains stale.",
          limitationsSummary: "Draft-only posture remains explicit.",
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
            sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
            companyKey: "acme",
            questionKind: "cash_posture",
            policySourceId: null,
            policySourceScope: null,
            packetSummary:
              "Draft diligence packet for acme from the completed cash posture reporting mission.",
            freshnessSummary: "Cash posture remains stale.",
            limitationsSummary: "Draft-only posture remains explicit.",
            relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
            relatedWikiPageKeys: ["metrics/cash-posture"],
            sourceFinanceMemo: {
              artifactId: "55555555-5555-4555-8555-555555555555",
              kind: "finance_memo",
            },
            sourceEvidenceAppendix: {
              artifactId: "66666666-6666-4666-8666-666666666666",
              kind: "evidence_appendix",
            },
            bodyMarkdown:
              "# Draft Diligence Packet\n\n## Release Review\n\nApproved for release.",
          },
          publication: null,
          releaseRecord: null,
          releaseReadiness: {
            releaseApprovalStatus: "approved_for_release",
            releaseReady: true,
            approvalId: "44444444-4444-4444-8444-444444444444",
            approvalStatus: "approved",
            requestedAt: "2026-04-21T09:00:00.000Z",
            requestedBy: "finance-operator",
            resolvedAt: "2026-04-21T09:05:00.000Z",
            resolvedBy: "finance-reviewer",
            rationale: "Looks release-ready.",
            summary:
              "Release approval was granted by finance-reviewer; the stored diligence packet is approved for release, but no delivery has been recorded.",
          },
        }}
      />,
    );

    expect(html).toContain("approved_for_release");
    expect(html).toContain("Release ready");
    expect(html).toContain("no delivery has been recorded");
    expect(html).toContain("Release logged");
    expect(html).toContain("Not logged yet.");
  });

  it("renders diligence-packet release-record posture after external release is logged", () => {
    const html = renderToStaticMarkup(
      <ReportingOutputCard
        proofBundle={{
          missionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          missionTitle: "Draft diligence packet for acme",
          objective:
            "Compile one draft diligence packet from stored finance memo and evidence appendix artifacts.",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          answerSummary: "",
          reportKind: "diligence_packet",
          reportDraftStatus: "draft_only",
          reportSummary:
            "Draft diligence packet for acme from the completed cash posture reporting mission.",
          releaseRecord: {
            released: true,
            releasedAt: "2026-04-21T09:10:00.000Z",
            releasedBy: "finance-operator",
            releaseChannel: "secure_portal",
            releaseNote: "Released after diligence counsel review.",
            approvalId: "44444444-4444-4444-8444-444444444444",
            summary:
              "External release was logged by finance-operator at 2026-04-21T09:10:00.000Z via secure_portal. Release note: Released after diligence counsel review..",
          },
          releaseReadiness: {
            releaseApprovalStatus: "approved_for_release",
            releaseReady: true,
            approvalId: "44444444-4444-4444-8444-444444444444",
            approvalStatus: "approved",
            requestedAt: "2026-04-21T09:00:00.000Z",
            requestedBy: "finance-operator",
            resolvedAt: "2026-04-21T09:05:00.000Z",
            resolvedBy: "finance-reviewer",
            rationale: "Looks release-ready.",
            summary:
              "Release approval was granted by finance-reviewer; the stored diligence packet is approved for release, but no delivery has been recorded.",
          },
          reportPublication: null,
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
          evidenceCompleteness: {
            status: "complete",
            expectedArtifactKinds: ["diligence_packet"],
            presentArtifactKinds: ["diligence_packet"],
            missingArtifactKinds: [],
            notes: [],
          },
          decisionTrace: [],
          artifactIds: [],
          artifacts: [],
          replayEventCount: 0,
          timestamps: {
            missionCreatedAt: "2026-04-21T09:00:00.000Z",
            latestPlannerEvidenceAt: null,
            latestExecutorEvidenceAt: null,
            latestPullRequestAt: null,
            latestApprovalAt: "2026-04-21T09:10:00.000Z",
            latestArtifactAt: "2026-04-21T09:02:00.000Z",
          },
          status: "ready",
        }}
        reporting={{
          reportKind: "diligence_packet",
          draftStatus: "draft_only",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          reportSummary:
            "Draft diligence packet for acme from the completed cash posture reporting mission.",
          freshnessSummary: "Cash posture remains stale.",
          limitationsSummary: "Draft-only posture remains explicit.",
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
            sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
            companyKey: "acme",
            questionKind: "cash_posture",
            policySourceId: null,
            policySourceScope: null,
            packetSummary:
              "Draft diligence packet for acme from the completed cash posture reporting mission.",
            freshnessSummary: "Cash posture remains stale.",
            limitationsSummary: "Draft-only posture remains explicit.",
            relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
            relatedWikiPageKeys: ["metrics/cash-posture"],
            sourceFinanceMemo: {
              artifactId: "55555555-5555-4555-8555-555555555555",
              kind: "finance_memo",
            },
            sourceEvidenceAppendix: {
              artifactId: "66666666-6666-4666-8666-666666666666",
              kind: "evidence_appendix",
            },
            bodyMarkdown:
              "# Draft Diligence Packet\n\n## Release Review\n\nApproved for release.",
          },
          publication: null,
          releaseRecord: {
            released: true,
            releasedAt: "2026-04-21T09:10:00.000Z",
            releasedBy: "finance-operator",
            releaseChannel: "secure_portal",
            releaseNote: "Released after diligence counsel review.",
            approvalId: "44444444-4444-4444-8444-444444444444",
            summary:
              "External release was logged by finance-operator at 2026-04-21T09:10:00.000Z via secure_portal. Release note: Released after diligence counsel review..",
          },
          releaseReadiness: {
            releaseApprovalStatus: "approved_for_release",
            releaseReady: true,
            approvalId: "44444444-4444-4444-8444-444444444444",
            approvalStatus: "approved",
            requestedAt: "2026-04-21T09:00:00.000Z",
            requestedBy: "finance-operator",
            resolvedAt: "2026-04-21T09:05:00.000Z",
            resolvedBy: "finance-reviewer",
            rationale: "Looks release-ready.",
            summary:
              "Release approval was granted by finance-reviewer; the stored diligence packet is approved for release, but no delivery has been recorded.",
          },
        }}
      />,
    );

    expect(html).toContain("Release logged");
    expect(html).toContain("2026-04-21T09:10:00.000Z");
    expect(html).toContain("finance-operator");
    expect(html).toContain("secure_portal");
    expect(html).toContain("Released after diligence counsel review.");
  });

  it("renders lender-update release-record posture after external release is logged", () => {
    const html = renderToStaticMarkup(
      <ReportingOutputCard
        proofBundle={{
          missionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          missionTitle: "Draft lender update for acme",
          objective:
            "Compile one draft lender update from stored finance memo and evidence appendix artifacts.",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          answerSummary: "",
          reportKind: "lender_update",
          reportDraftStatus: "draft_only",
          reportSummary:
            "Draft lender update for acme from the completed cash posture reporting mission.",
          releaseRecord: {
            released: true,
            releasedAt: "2026-04-20T09:10:00.000Z",
            releasedBy: "finance-operator",
            releaseChannel: "email",
            releaseNote: "Sent from treasury mailbox after approval.",
            approvalId: "44444444-4444-4444-8444-444444444444",
            summary:
              "External release was logged by finance-operator at 2026-04-20T09:10:00.000Z via email. Release note: Sent from treasury mailbox after approval..",
          },
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
          reportPublication: null,
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
          evidenceCompleteness: {
            status: "complete",
            expectedArtifactKinds: ["lender_update"],
            presentArtifactKinds: ["lender_update"],
            missingArtifactKinds: [],
            notes: [],
          },
          decisionTrace: [],
          artifactIds: [],
          artifacts: [],
          replayEventCount: 0,
          timestamps: {
            missionCreatedAt: "2026-04-20T09:00:00.000Z",
            latestPlannerEvidenceAt: null,
            latestExecutorEvidenceAt: null,
            latestPullRequestAt: null,
            latestApprovalAt: "2026-04-20T09:10:00.000Z",
            latestArtifactAt: "2026-04-20T09:02:00.000Z",
          },
          status: "ready",
        }}
        reporting={{
          reportKind: "lender_update",
          draftStatus: "draft_only",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          reportSummary:
            "Draft lender update for acme from the completed cash posture reporting mission.",
          freshnessSummary: "Cash posture remains stale.",
          limitationsSummary: "Draft-only posture remains explicit.",
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
            sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
            companyKey: "acme",
            questionKind: "cash_posture",
            policySourceId: null,
            policySourceScope: null,
            updateSummary:
              "Draft lender update for acme from the completed cash posture reporting mission.",
            freshnessSummary: "Cash posture remains stale.",
            limitationsSummary: "Draft-only posture remains explicit.",
            relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
            relatedWikiPageKeys: ["metrics/cash-posture"],
            sourceFinanceMemo: {
              artifactId: "55555555-5555-4555-8555-555555555555",
              kind: "finance_memo",
            },
            sourceEvidenceAppendix: {
              artifactId: "66666666-6666-4666-8666-666666666666",
              kind: "evidence_appendix",
            },
            bodyMarkdown:
              "# Draft Lender Update\n\n## Release Review\n\nApproved for release.",
          },
          diligencePacket: null,
          publication: null,
          releaseRecord: {
            released: true,
            releasedAt: "2026-04-20T09:10:00.000Z",
            releasedBy: "finance-operator",
            releaseChannel: "email",
            releaseNote: "Sent from treasury mailbox after approval.",
            approvalId: "44444444-4444-4444-8444-444444444444",
            summary:
              "External release was logged by finance-operator at 2026-04-20T09:10:00.000Z via email. Release note: Sent from treasury mailbox after approval..",
          },
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
      />,
    );

    expect(html).toContain("Release logged");
    expect(html).toContain("2026-04-20T09:10:00.000Z");
    expect(html).toContain("finance-operator");
    expect(html).toContain("email");
    expect(html).toContain("Sent from treasury mailbox after approval.");
  });
});
