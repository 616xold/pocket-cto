import { describe, expect, it } from "vitest";
import { MissionListViewSchema } from "./mission-list";

describe("Mission list domain schema", () => {
  it("parses finance discovery mission summaries", () => {
    const parsed = MissionListViewSchema.parse({
      filters: {
        limit: 20,
        status: null,
        sourceKind: null,
      },
      missions: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          title: "Review payables pressure for acme",
          objectiveExcerpt:
            "Answer the stored payables pressure question for acme.",
          companyKey: "acme",
          questionKind: "payables_pressure",
          policySourceId: null,
          policySourceScope: null,
          answerSummary:
            "Stored payables pressure is available with limitations.",
          freshnessState: "stale",
          status: "succeeded",
          sourceKind: "manual_discovery",
          sourceRef: null,
          primaryRepo: null,
          createdAt: "2026-04-14T23:48:00.000Z",
          updatedAt: "2026-04-14T23:49:00.000Z",
          latestTask: {
            id: "22222222-2222-4222-8222-222222222222",
            role: "scout",
            sequence: 0,
            status: "succeeded",
            updatedAt: "2026-04-14T23:49:00.000Z",
          },
          proofBundleStatus: "ready",
          pendingApprovalCount: 0,
          pullRequestNumber: null,
          pullRequestUrl: null,
        },
      ],
    });

    expect(parsed.missions[0]?.companyKey).toBe("acme");
    expect(parsed.missions[0]?.questionKind).toBe("payables_pressure");
    expect(parsed.missions[0]?.policySourceId).toBeNull();
    expect(parsed.missions[0]?.freshnessState).toBe("stale");
  });

  it("parses policy lookup mission summaries with explicit policy source scope", () => {
    const parsed = MissionListViewSchema.parse({
      filters: {
        limit: 20,
        status: null,
        sourceKind: null,
      },
      missions: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          title:
            "Review policy lookup for acme from 22222222-2222-4222-8222-222222222222",
          objectiveExcerpt:
            "Answer the stored policy lookup question for acme from scoped policy source 22222222-2222-4222-8222-222222222222.",
          companyKey: "acme",
          questionKind: "policy_lookup",
          policySourceId: "22222222-2222-4222-8222-222222222222",
          policySourceScope: {
            policySourceId: "22222222-2222-4222-8222-222222222222",
            sourceName: "Travel and expense policy",
            documentRole: "policy_document",
            includeInCompile: true,
            latestExtractStatus: null,
            latestSnapshotVersion: 2,
          },
          answerSummary:
            "Stored policy lookup is limited by a missing deterministic extract.",
          freshnessState: "missing",
          status: "succeeded",
          sourceKind: "manual_discovery",
          sourceRef: null,
          primaryRepo: null,
          createdAt: "2026-04-14T23:48:00.000Z",
          updatedAt: "2026-04-14T23:49:00.000Z",
          latestTask: {
            id: "22222222-2222-4222-8222-222222222222",
            role: "scout",
            sequence: 0,
            status: "succeeded",
            updatedAt: "2026-04-14T23:49:00.000Z",
          },
          proofBundleStatus: "ready",
          pendingApprovalCount: 0,
          pullRequestNumber: null,
          pullRequestUrl: null,
        },
      ],
    });

    expect(parsed.missions[0]?.questionKind).toBe("policy_lookup");
    expect(parsed.missions[0]?.policySourceId).toBe(
      "22222222-2222-4222-8222-222222222222",
    );
    expect(parsed.missions[0]?.policySourceScope?.sourceName).toBe(
      "Travel and expense policy",
    );
  });

  it("parses reporting mission summaries with explicit draft reporting fields", () => {
    const parsed = MissionListViewSchema.parse({
      filters: {
        limit: 20,
        status: null,
        sourceKind: null,
      },
      missions: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          title: "Draft finance memo for acme from cash posture discovery",
          objectiveExcerpt:
            "Compile one draft finance memo plus one linked evidence appendix from completed discovery mission 22222222-2222-4222-8222-222222222222.",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          sourceReportingMissionId: null,
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          answerSummary: null,
          reportKind: "finance_memo",
          reportDraftStatus: "draft_only",
          reportSummary:
            "Cash posture remains constrained by stale bank coverage and visible working-capital gaps.",
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
          status: "succeeded",
          sourceKind: "manual_reporting",
          sourceRef: null,
          primaryRepo: null,
          createdAt: "2026-04-18T12:00:00.000Z",
          updatedAt: "2026-04-18T12:03:00.000Z",
          latestTask: {
            id: "33333333-3333-4333-8333-333333333333",
            role: "scout",
            sequence: 0,
            status: "succeeded",
            updatedAt: "2026-04-18T12:03:00.000Z",
          },
          proofBundleStatus: "ready",
          pendingApprovalCount: 0,
          pullRequestNumber: null,
          pullRequestUrl: null,
        },
      ],
    });

    expect(parsed.missions[0]?.reportKind).toBe("finance_memo");
    expect(parsed.missions[0]?.sourceDiscoveryMissionId).toBe(
      "22222222-2222-4222-8222-222222222222",
    );
    expect(parsed.missions[0]?.reportPublication?.storedDraft).toBe(true);
    expect(parsed.missions[0]?.appendixPresent).toBe(true);
  });

  it("parses board-packet mission summaries with source-report lineage", () => {
    const parsed = MissionListViewSchema.parse({
      filters: {
        limit: 20,
        status: null,
        sourceKind: null,
      },
      missions: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          title: "Draft board packet for acme from cash posture reporting",
          objectiveExcerpt:
            "Compile one draft board packet from completed reporting mission 33333333-3333-4333-8333-333333333333 and its stored finance memo plus evidence appendix.",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          answerSummary: null,
          reportKind: "board_packet",
          reportDraftStatus: "draft_only",
          reportPublication: null,
          circulationReadiness: {
            circulationApprovalStatus: "pending_review",
            circulationReady: false,
            approvalId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            approvalStatus: "pending",
            requestedAt: "2026-04-19T12:04:00.000Z",
            requestedBy: "finance-operator",
            resolvedAt: null,
            resolvedBy: null,
            rationale: null,
            summary:
              "Circulation approval was requested by finance-operator; the stored board packet is not yet approved for internal circulation.",
          },
          reportSummary:
            "Draft board packet for acme from the completed cash posture reporting mission.",
          appendixPresent: true,
          freshnessState: "stale",
          status: "succeeded",
          sourceKind: "manual_reporting",
          sourceRef: null,
          primaryRepo: null,
          createdAt: "2026-04-19T12:00:00.000Z",
          updatedAt: "2026-04-19T12:03:00.000Z",
          latestTask: {
            id: "44444444-4444-4444-8444-444444444444",
            role: "scout",
            sequence: 0,
            status: "succeeded",
            updatedAt: "2026-04-19T12:03:00.000Z",
          },
          proofBundleStatus: "ready",
          pendingApprovalCount: 0,
          pullRequestNumber: null,
          pullRequestUrl: null,
        },
      ],
    });

    expect(parsed.missions[0]?.reportKind).toBe("board_packet");
    expect(parsed.missions[0]?.sourceReportingMissionId).toBe(
      "33333333-3333-4333-8333-333333333333",
    );
    expect(
      parsed.missions[0]?.circulationReadiness?.circulationApprovalStatus,
    ).toBe("pending_review");
    expect(parsed.missions[0]?.reportPublication).toBeNull();
    expect(parsed.missions[0]?.appendixPresent).toBe(true);
  });

  it("parses diligence-packet mission summaries with source-report lineage", () => {
    const parsed = MissionListViewSchema.parse({
      filters: {
        limit: 20,
        status: null,
        sourceKind: null,
      },
      missions: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          title: "Draft diligence packet for acme from cash posture reporting",
          objectiveExcerpt:
            "Compile one draft diligence packet from completed reporting mission 33333333-3333-4333-8333-333333333333 and its stored finance memo plus evidence appendix.",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          answerSummary: null,
          reportKind: "diligence_packet",
          reportDraftStatus: "draft_only",
          reportPublication: null,
          reportSummary:
            "Draft diligence packet for acme from the completed cash posture reporting mission.",
          appendixPresent: true,
          freshnessState: "stale",
          status: "succeeded",
          sourceKind: "manual_reporting",
          sourceRef: null,
          primaryRepo: null,
          createdAt: "2026-04-19T12:00:00.000Z",
          updatedAt: "2026-04-19T12:03:00.000Z",
          latestTask: {
            id: "44444444-4444-4444-8444-444444444444",
            role: "scout",
            sequence: 0,
            status: "succeeded",
            updatedAt: "2026-04-19T12:03:00.000Z",
          },
          proofBundleStatus: "ready",
          pendingApprovalCount: 0,
          pullRequestNumber: null,
          pullRequestUrl: null,
        },
      ],
    });

    expect(parsed.missions[0]?.reportKind).toBe("diligence_packet");
    expect(parsed.missions[0]?.sourceReportingMissionId).toBe(
      "33333333-3333-4333-8333-333333333333",
    );
    expect(parsed.missions[0]?.reportPublication).toBeNull();
    expect(parsed.missions[0]?.appendixPresent).toBe(true);
  });

  it("parses lender-update mission summaries with release-readiness posture", () => {
    const parsed = MissionListViewSchema.parse({
      filters: {
        limit: 20,
        status: null,
        sourceKind: null,
      },
      missions: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          title: "Draft lender update for acme from cash posture reporting",
          objectiveExcerpt:
            "Compile one draft lender update from completed reporting mission 22222222-2222-4222-8222-222222222222 and its stored finance memo plus evidence appendix.",
          sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
          sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          answerSummary: null,
          reportKind: "lender_update",
          reportDraftStatus: "draft_only",
          reportPublication: null,
          releaseReadiness: {
            releaseApprovalStatus: "approved_for_release",
            releaseReady: true,
            approvalId: "44444444-4444-4444-8444-444444444444",
            approvalStatus: "approved",
            requestedAt: "2026-04-20T08:10:00.000Z",
            requestedBy: "finance-operator",
            resolvedAt: "2026-04-20T08:12:00.000Z",
            resolvedBy: "finance-reviewer",
            rationale: "Looks release-ready.",
            summary:
              "Release approval was granted by finance-reviewer; the stored lender update is approved for release, but no delivery has been recorded.",
          },
          reportSummary:
            "Draft lender update for acme from the completed finance memo.",
          appendixPresent: true,
          freshnessState: "stale",
          status: "succeeded",
          sourceKind: "manual_reporting",
          sourceRef: null,
          primaryRepo: null,
          createdAt: "2026-04-20T08:00:00.000Z",
          updatedAt: "2026-04-20T08:12:00.000Z",
          latestTask: {
            id: "55555555-5555-4555-8555-555555555555",
            role: "scout",
            sequence: 0,
            status: "succeeded",
            updatedAt: "2026-04-20T08:05:00.000Z",
          },
          proofBundleStatus: "ready",
          pendingApprovalCount: 0,
          pullRequestNumber: null,
          pullRequestUrl: null,
        },
      ],
    });

    expect(parsed.missions[0]?.reportKind).toBe("lender_update");
    expect(parsed.missions[0]?.releaseReadiness?.releaseReady).toBe(true);
    expect(parsed.missions[0]?.releaseReadiness?.releaseApprovalStatus).toBe(
      "approved_for_release",
    );
  });

  it("parses diligence-packet mission summaries with release-readiness posture and no release record", () => {
    const parsed = MissionListViewSchema.parse({
      filters: {
        limit: 20,
        status: null,
        sourceKind: null,
      },
      missions: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          title:
            "Draft diligence packet for acme from cash posture reporting",
          objectiveExcerpt:
            "Compile one draft diligence packet from completed reporting mission 22222222-2222-4222-8222-222222222222 and its stored finance memo plus evidence appendix.",
          sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
          sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          answerSummary: null,
          reportKind: "diligence_packet",
          reportDraftStatus: "draft_only",
          reportPublication: null,
          releaseRecord: null,
          releaseReadiness: {
            releaseApprovalStatus: "approved_for_release",
            releaseReady: true,
            approvalId: "44444444-4444-4444-8444-444444444444",
            approvalStatus: "approved",
            requestedAt: "2026-04-21T08:10:00.000Z",
            requestedBy: "finance-operator",
            resolvedAt: "2026-04-21T08:12:00.000Z",
            resolvedBy: "finance-reviewer",
            rationale: "Looks release-ready.",
            summary:
              "Release approval was granted by finance-reviewer; the stored diligence packet is approved for release, but no delivery has been recorded.",
          },
          reportSummary:
            "Draft diligence packet for acme from the completed finance memo.",
          appendixPresent: true,
          freshnessState: "stale",
          status: "succeeded",
          sourceKind: "manual_reporting",
          sourceRef: null,
          primaryRepo: null,
          createdAt: "2026-04-21T08:00:00.000Z",
          updatedAt: "2026-04-21T08:12:00.000Z",
          latestTask: {
            id: "55555555-5555-4555-8555-555555555555",
            role: "scout",
            sequence: 0,
            status: "succeeded",
            updatedAt: "2026-04-21T08:05:00.000Z",
          },
          proofBundleStatus: "ready",
          pendingApprovalCount: 0,
          pullRequestNumber: null,
          pullRequestUrl: null,
        },
      ],
    });

    expect(parsed.missions[0]?.reportKind).toBe("diligence_packet");
    expect(parsed.missions[0]?.releaseReadiness?.releaseReady).toBe(true);
    expect(parsed.missions[0]?.releaseReadiness?.releaseApprovalStatus).toBe(
      "approved_for_release",
    );
    expect(parsed.missions[0]?.releaseRecord).toBeNull();
  });

  it("parses lender-update mission summaries with an explicit release record", () => {
    const parsed = MissionListViewSchema.parse({
      filters: {
        limit: 20,
        status: null,
        sourceKind: null,
      },
      missions: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          title: "Draft lender update for acme from cash posture reporting",
          objectiveExcerpt:
            "Compile one draft lender update from completed reporting mission 22222222-2222-4222-8222-222222222222 and its stored finance memo plus evidence appendix.",
          sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
          sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          answerSummary: null,
          reportKind: "lender_update",
          reportDraftStatus: "draft_only",
          reportPublication: null,
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
            requestedAt: "2026-04-20T08:10:00.000Z",
            requestedBy: "finance-operator",
            resolvedAt: "2026-04-20T08:12:00.000Z",
            resolvedBy: "finance-reviewer",
            rationale: "Looks release-ready.",
            summary:
              "Release approval was granted by finance-reviewer; the stored lender update is approved for release, but no delivery has been recorded.",
          },
          reportSummary:
            "Draft lender update for acme from the completed finance memo.",
          appendixPresent: true,
          freshnessState: "stale",
          status: "succeeded",
          sourceKind: "manual_reporting",
          sourceRef: null,
          primaryRepo: null,
          createdAt: "2026-04-20T08:00:00.000Z",
          updatedAt: "2026-04-20T09:10:00.000Z",
          latestTask: {
            id: "55555555-5555-4555-8555-555555555555",
            role: "scout",
            sequence: 0,
            status: "succeeded",
            updatedAt: "2026-04-20T08:05:00.000Z",
          },
          proofBundleStatus: "ready",
          pendingApprovalCount: 0,
          pullRequestNumber: null,
          pullRequestUrl: null,
        },
      ],
    });

    expect(parsed.missions[0]?.releaseRecord?.released).toBe(true);
    expect(parsed.missions[0]?.releaseRecord?.releasedBy).toBe(
      "finance-operator",
    );
  });
});
