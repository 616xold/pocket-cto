import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MissionListCard } from "./mission-list-card";

describe("MissionListCard", () => {
  it("renders summary-shaped mission evidence and links into detail", () => {
    const html = renderToStaticMarkup(
      <MissionListCard
        mission={{
          appendixPresent: false,
          answerSummary: null,
          companyKey: null,
          createdAt: "2026-03-16T01:00:00.000Z",
          freshnessState: null,
          id: "11111111-1111-4111-8111-111111111111",
          latestTask: {
            id: "33333333-3333-4333-8333-333333333333",
            role: "executor",
            sequence: 1,
            status: "running",
            updatedAt: "2026-03-16T01:05:00.000Z",
          },
          objectiveExcerpt: "Ship passkeys without breaking email login.",
          pendingApprovalCount: 1,
          policySourceId: null,
          policySourceScope: null,
          primaryRepo: "web",
          proofBundleStatus: "incomplete",
          pullRequestNumber: 19,
          pullRequestUrl: "https://github.com/acme/web/pull/19",
          questionKind: null,
          reportDraftStatus: null,
          reportKind: null,
          reportPublication: null,
          releaseRecord: null,
          releaseReadiness: null,
          reportSummary: null,
          sourceKind: "github_issue",
          sourceDiscoveryMissionId: null,
          sourceReportingMissionId: null,
          sourceRef: "https://github.com/acme/web/issues/19",
          status: "running",
          title: "Implement passkeys for sign-in",
          updatedAt: "2026-03-16T01:05:00.000Z",
        }}
      />,
    );

    expect(html).toContain("Implement passkeys for sign-in");
    expect(html).toContain("Ship passkeys without breaking email login.");
    expect(html).toContain("github issue");
    expect(html).toContain("1 pending approval");
    expect(html).toContain("PR #19");
    expect(html).toContain("/missions/11111111-1111-4111-8111-111111111111");
  });

  it("renders finance mission summaries with company scope and supported family metadata", () => {
    const html = renderToStaticMarkup(
      <MissionListCard
        mission={{
          appendixPresent: false,
          answerSummary:
            "Stored payables pressure is available with limitations.",
          companyKey: "acme",
          createdAt: "2026-04-15T01:00:00.000Z",
          freshnessState: "stale",
          id: "22222222-2222-4222-8222-222222222222",
          latestTask: {
            id: "33333333-3333-4333-8333-333333333333",
            role: "scout",
            sequence: 0,
            status: "succeeded",
            updatedAt: "2026-04-15T01:05:00.000Z",
          },
          objectiveExcerpt:
            "Answer the stored payables pressure question for acme.",
          pendingApprovalCount: 0,
          policySourceId: null,
          policySourceScope: null,
          primaryRepo: null,
          proofBundleStatus: "ready",
          pullRequestNumber: null,
          pullRequestUrl: null,
          questionKind: "payables_pressure",
          reportDraftStatus: null,
          reportKind: null,
          reportPublication: null,
          releaseRecord: null,
          releaseReadiness: null,
          reportSummary: null,
          sourceKind: "manual_discovery",
          sourceDiscoveryMissionId: null,
          sourceReportingMissionId: null,
          sourceRef: null,
          status: "succeeded",
          title: "Review payables pressure for acme",
          updatedAt: "2026-04-15T01:05:00.000Z",
        }}
      />,
    );

    expect(html).toContain("Review payables pressure for acme");
    expect(html).toContain("Payables pressure");
    expect(html).toContain("acme");
    expect(html).toContain(
      "Stored payables pressure is available with limitations.",
    );
    expect(html).toContain("Stale");
    expect(html).not.toContain(">stale<");
    expect(html).toContain("proof ready");
  });

  it("renders policy lookup mission summaries with explicit source scope", () => {
    const html = renderToStaticMarkup(
      <MissionListCard
        mission={{
          appendixPresent: false,
          answerSummary:
            "Stored policy lookup is scoped to the requested policy source.",
          companyKey: "acme",
          createdAt: "2026-04-15T01:00:00.000Z",
          freshnessState: "missing",
          id: "22222222-2222-4222-8222-222222222222",
          latestTask: {
            id: "33333333-3333-4333-8333-333333333333",
            role: "scout",
            sequence: 0,
            status: "succeeded",
            updatedAt: "2026-04-15T01:05:00.000Z",
          },
          objectiveExcerpt:
            "Answer the stored policy lookup question for acme from scoped policy source only.",
          pendingApprovalCount: 0,
          policySourceId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          policySourceScope: {
            policySourceId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            sourceName: "Travel and expense policy",
            documentRole: "policy_document",
            includeInCompile: true,
            latestExtractStatus: null,
            latestSnapshotVersion: 2,
          },
          primaryRepo: null,
          proofBundleStatus: "ready",
          pullRequestNumber: null,
          pullRequestUrl: null,
          questionKind: "policy_lookup",
          reportDraftStatus: null,
          reportKind: null,
          reportPublication: null,
          releaseRecord: null,
          releaseReadiness: null,
          reportSummary: null,
          sourceKind: "manual_discovery",
          sourceDiscoveryMissionId: null,
          sourceReportingMissionId: null,
          sourceRef: null,
          status: "succeeded",
          title: "Review policy lookup for acme",
          updatedAt: "2026-04-15T01:05:00.000Z",
        }}
      />,
    );

    expect(html).toContain("Policy lookup");
    expect(html).toContain("Policy source");
    expect(html).toContain("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    expect(html).toContain("Travel and expense policy");
    expect(html).toContain("Policy Document");
    expect(html).toContain("Missing");
    expect(html).toContain("v2");
    expect(html).toContain("proof ready");
  });

  it("renders reporting mission summaries with explicit draft memo posture", () => {
    const sourceDiscoveryMissionId = "33333333-3333-4333-8333-333333333333";
    const html = renderToStaticMarkup(
      <MissionListCard
        mission={{
          appendixPresent: true,
          answerSummary: null,
          companyKey: "acme",
          createdAt: "2026-04-18T01:00:00.000Z",
          freshnessState: "fresh",
          id: "44444444-4444-4444-8444-444444444444",
          latestTask: {
            id: "55555555-5555-4555-8555-555555555555",
            role: "scout",
            sequence: 0,
            status: "succeeded",
            updatedAt: "2026-04-18T01:05:00.000Z",
          },
          objectiveExcerpt:
            "Compile one draft finance memo from the stored payables pressure evidence.",
          pendingApprovalCount: 0,
          policySourceId: null,
          policySourceScope: null,
          primaryRepo: null,
          proofBundleStatus: "ready",
          pullRequestNumber: null,
          pullRequestUrl: null,
          questionKind: "payables_pressure",
          reportDraftStatus: "draft_only",
          reportKind: "finance_memo",
          reportPublication: {
            storedDraft: true,
            filedMemo: {
              artifactKind: "finance_memo",
              pageKey:
                "filed/reporting-44444444-4444-4444-8444-444444444444-finance_memo",
              title:
                "Draft finance memo for acme (44444444-4444-4444-8444-444444444444)",
              filedAt: "2026-04-18T01:06:00.000Z",
              filedBy: "finance-operator",
              provenanceSummary:
                "Draft-only reporting artifact filed into the CFO Wiki.",
            },
            filedEvidenceAppendix: {
              artifactKind: "evidence_appendix",
              pageKey:
                "filed/reporting-44444444-4444-4444-8444-444444444444-evidence_appendix",
              title:
                "Evidence appendix for acme draft finance memo (44444444-4444-4444-8444-444444444444)",
              filedAt: "2026-04-18T01:06:00.000Z",
              filedBy: "finance-operator",
              provenanceSummary:
                "Draft-only reporting artifact filed into the CFO Wiki.",
            },
            latestMarkdownExport: {
              exportRunId: "66666666-6666-4666-8666-666666666666",
              status: "succeeded",
              completedAt: "2026-04-18T01:07:00.000Z",
              includesLatestFiledArtifacts: true,
            },
            summary:
              "Draft memo and evidence appendix are stored. Both filed pages exist in the CFO Wiki: `filed/reporting-44444444-4444-4444-8444-444444444444-finance_memo` and `filed/reporting-44444444-4444-4444-8444-444444444444-evidence_appendix`. Markdown export run 66666666-6666-4666-8666-666666666666 includes the latest filed report pages.",
          },
          releaseRecord: null,
          releaseReadiness: null,
          reportSummary:
            "Draft finance memo summarizing stored payables pressure and evidence posture.",
          sourceDiscoveryMissionId,
          sourceReportingMissionId: null,
          sourceKind: "manual_reporting",
          sourceRef: null,
          status: "succeeded",
          title: "Create finance memo for acme payables pressure",
          updatedAt: "2026-04-18T01:05:00.000Z",
        }}
      />,
    );

    expect(html).toContain("Finance memo");
    expect(html).toContain("draft_only");
    expect(html).toContain("Stored");
    expect(html).toContain(
      "filed/reporting-44444444-4444-4444-8444-444444444444-finance_memo",
    );
    expect(html).toContain(sourceDiscoveryMissionId);
    expect(html).toContain(
      "Draft finance memo summarizing stored payables pressure and evidence posture.",
    );
    expect(html).toContain("Markdown export");
    expect(html).toContain("proof ready");
  });

  it("renders board-packet mission summaries with source-report lineage", () => {
    const sourceReportingMissionId = "77777777-7777-4777-8777-777777777777";
    const html = renderToStaticMarkup(
      <MissionListCard
        mission={{
          appendixPresent: true,
          answerSummary: null,
          companyKey: "acme",
          createdAt: "2026-04-19T01:00:00.000Z",
          freshnessState: "stale",
          id: "88888888-8888-4888-8888-888888888888",
          latestTask: {
            id: "99999999-9999-4999-8999-999999999999",
            role: "scout",
            sequence: 0,
            status: "succeeded",
            updatedAt: "2026-04-19T01:05:00.000Z",
          },
          objectiveExcerpt:
            "Compile one draft board packet from completed reporting mission and its stored finance memo plus evidence appendix.",
          pendingApprovalCount: 0,
          policySourceId: null,
          policySourceScope: null,
          primaryRepo: null,
          proofBundleStatus: "ready",
          pullRequestNumber: null,
          pullRequestUrl: null,
          questionKind: "cash_posture",
          reportDraftStatus: "draft_only",
          reportKind: "board_packet",
          reportPublication: null,
          releaseRecord: null,
          releaseReadiness: null,
          reportSummary:
            "Draft board packet for acme from the completed cash posture reporting mission.",
          sourceDiscoveryMissionId: "66666666-6666-4666-8666-666666666666",
          sourceReportingMissionId,
          sourceKind: "manual_reporting",
          sourceRef: null,
          status: "succeeded",
          title: "Draft board packet for acme from cash posture reporting",
          updatedAt: "2026-04-19T01:05:00.000Z",
        }}
      />,
    );

    expect(html).toContain("Board packet");
    expect(html).toContain("Linked");
    expect(html).toContain(sourceReportingMissionId);
    expect(html).toContain("66666666-6666-4666-8666-666666666666");
    expect(html).not.toContain("Markdown export");
    expect(html).toContain("proof ready");
  });

  it("renders diligence-packet mission summaries with source-report lineage", () => {
    const sourceReportingMissionId = "77777777-7777-4777-8777-777777777777";
    const html = renderToStaticMarkup(
      <MissionListCard
        mission={{
          appendixPresent: true,
          answerSummary: null,
          companyKey: "acme",
          createdAt: "2026-04-19T01:00:00.000Z",
          freshnessState: "stale",
          id: "99999999-9999-4999-8999-999999999999",
          latestTask: {
            id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            role: "scout",
            sequence: 0,
            status: "succeeded",
            updatedAt: "2026-04-19T01:05:00.000Z",
          },
          objectiveExcerpt:
            "Compile one draft diligence packet from completed reporting mission and its stored finance memo plus evidence appendix.",
          pendingApprovalCount: 0,
          policySourceId: null,
          policySourceScope: null,
          primaryRepo: null,
          proofBundleStatus: "ready",
          pullRequestNumber: null,
          pullRequestUrl: null,
          questionKind: "cash_posture",
          reportDraftStatus: "draft_only",
          reportKind: "diligence_packet",
          reportPublication: null,
          releaseRecord: null,
          releaseReadiness: null,
          reportSummary:
            "Draft diligence packet for acme from the completed cash posture reporting mission.",
          sourceDiscoveryMissionId: "66666666-6666-4666-8666-666666666666",
          sourceReportingMissionId,
          sourceKind: "manual_reporting",
          sourceRef: null,
          status: "succeeded",
          title: "Draft diligence packet for acme from cash posture reporting",
          updatedAt: "2026-04-19T01:05:00.000Z",
        }}
      />,
    );

    expect(html).toContain("Diligence packet");
    expect(html).toContain("Linked");
    expect(html).toContain(sourceReportingMissionId);
    expect(html).toContain("66666666-6666-4666-8666-666666666666");
    expect(html).not.toContain("Markdown export");
    expect(html).toContain("proof ready");
  });

  it("renders diligence-packet mission summaries with approved release-readiness posture", () => {
    const html = renderToStaticMarkup(
      <MissionListCard
        mission={{
          appendixPresent: true,
          answerSummary: null,
          companyKey: "acme",
          createdAt: "2026-04-21T01:00:00.000Z",
          freshnessState: "stale",
          id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          latestTask: {
            id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
            role: "scout",
            sequence: 0,
            status: "succeeded",
            updatedAt: "2026-04-21T01:05:00.000Z",
          },
          objectiveExcerpt:
            "Compile one draft diligence packet from completed reporting mission and its stored finance memo plus evidence appendix.",
          pendingApprovalCount: 0,
          policySourceId: null,
          policySourceScope: null,
          primaryRepo: null,
          proofBundleStatus: "ready",
          pullRequestNumber: null,
          pullRequestUrl: null,
          questionKind: "cash_posture",
          reportDraftStatus: "draft_only",
          reportKind: "diligence_packet",
          reportPublication: null,
          releaseRecord: null,
          releaseReadiness: {
            releaseApprovalStatus: "approved_for_release",
            releaseReady: true,
            approvalId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
            approvalStatus: "approved",
            requestedAt: "2026-04-21T01:02:00.000Z",
            requestedBy: "finance-operator",
            resolvedAt: "2026-04-21T01:04:00.000Z",
            resolvedBy: "finance-reviewer",
            rationale: "Looks release-ready.",
            summary:
              "Release approval was granted by finance-reviewer; the stored diligence packet is approved for release, but no delivery has been recorded.",
          },
          reportSummary:
            "Draft diligence packet for acme from the completed cash posture reporting mission.",
          sourceDiscoveryMissionId: "66666666-6666-4666-8666-666666666666",
          sourceReportingMissionId: "77777777-7777-4777-8777-777777777777",
          sourceKind: "manual_reporting",
          sourceRef: null,
          status: "succeeded",
          title: "Draft diligence packet for acme from cash posture reporting",
          updatedAt: "2026-04-21T01:04:00.000Z",
        }}
      />,
    );

    expect(html).toContain("approved_for_release");
    expect(html).toContain("Release ready");
    expect(html).toContain("no delivery has been recorded");
    expect(html).toContain("Release logged");
    expect(html).toContain("No");
  });
});
