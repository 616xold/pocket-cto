import { describe, expect, it } from "vitest";
import { MissionListViewSchema } from "./mission-list";

describe("Mission list domain schema", () => {
  it("parses monitor-alert investigation mission summaries", () => {
    const parsed = MissionListViewSchema.parse({
      filters: {
        limit: 20,
        status: null,
        sourceKind: null,
      },
      missions: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          title: "Investigate cash-posture alert for acme",
          objectiveExcerpt:
            "Manual F6B investigation handoff from stored cash_posture alert.",
          companyKey: "acme",
          monitorInvestigation: buildMonitorInvestigationSeed(),
          answerSummary: null,
          freshnessState: "missing",
          status: "succeeded",
          sourceKind: "alert",
          sourceRef:
            "pocket-cfo://monitor-results/66666666-6666-4666-8666-666666666666",
          primaryRepo: null,
          createdAt: "2026-04-26T12:00:00.000Z",
          updatedAt: "2026-04-26T12:01:00.000Z",
          latestTask: null,
          proofBundleStatus: "ready",
          pendingApprovalCount: 0,
          pullRequestNumber: null,
          pullRequestUrl: null,
        },
        {
          id: "22222222-2222-4222-8222-222222222222",
          title: "Investigate collections-pressure alert for acme",
          objectiveExcerpt:
            "Manual monitor-alert investigation handoff from stored collections_pressure alert.",
          companyKey: "acme",
          monitorInvestigation: buildMonitorInvestigationSeed(
            "collections_pressure",
          ),
          answerSummary: null,
          freshnessState: "missing",
          status: "succeeded",
          sourceKind: "alert",
          sourceRef:
            "pocket-cfo://monitor-results/77777777-7777-4777-8777-777777777777",
          primaryRepo: null,
          createdAt: "2026-04-26T12:00:00.000Z",
          updatedAt: "2026-04-26T12:01:00.000Z",
          latestTask: null,
          proofBundleStatus: "ready",
          pendingApprovalCount: 0,
          pullRequestNumber: null,
          pullRequestUrl: null,
        },
      ],
    });

    expect(parsed.missions[0]?.sourceKind).toBe("alert");
    expect(parsed.missions[0]?.monitorInvestigation?.alertSeverity).toBe(
      "critical",
    );
    expect(parsed.missions[0]?.questionKind).toBeNull();
    expect(parsed.missions[1]?.monitorInvestigation?.monitorKind).toBe(
      "collections_pressure",
    );
    expect(parsed.missions[1]?.latestTask).toBeNull();
  });

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
          circulationRecord: {
            circulated: false,
            circulatedAt: null,
            circulatedBy: null,
            circulationChannel: null,
            circulationNote: null,
            approvalId: null,
            summary:
              "Circulation approval is still pending review, so no external circulation has been logged yet.",
          },
          circulationChronology: {
            hasCorrections: false,
            correctionCount: 0,
            latestCorrectionSummary: null,
            latestCorrection: null,
            effectiveRecord: null,
            corrections: [],
            summary:
              "The original circulation record remains the current effective circulation fact. No corrections have been appended.",
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
    expect(parsed.missions[0]?.circulationRecord?.circulated).toBe(false);
    expect(parsed.missions[0]?.circulationChronology?.correctionCount).toBe(0);
    expect(parsed.missions[0]?.reportPublication).toBeNull();
    expect(parsed.missions[0]?.appendixPresent).toBe(true);
  });

  it("parses board-packet mission summaries with actor-correction chronology", () => {
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
            circulationApprovalStatus: "approved_for_circulation",
            circulationReady: true,
            approvalId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            approvalStatus: "approved",
            requestedAt: "2026-04-21T09:00:00.000Z",
            requestedBy: "finance-operator",
            resolvedAt: "2026-04-21T09:05:00.000Z",
            resolvedBy: "finance-reviewer",
            rationale: "Ready for internal board circulation.",
            summary:
              "Circulation approval was granted by finance-reviewer; the stored board packet is approved for internal circulation and one circulation record has been logged.",
          },
          circulationRecord: {
            circulated: true,
            circulatedAt: "2026-04-21T09:10:00.000Z",
            circulatedBy: "finance-operator",
            circulationChannel: "email",
            circulationNote:
              "Circulated from the finance mailbox after approval.",
            approvalId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            summary:
              "External circulation was logged by finance-operator at 2026-04-21T09:10:00.000Z via email. Circulation note: Circulated from the finance mailbox after approval.",
          },
          circulationChronology: {
            hasCorrections: true,
            correctionCount: 1,
            latestCorrectionSummary:
              "Circulation record correction was appended by finance-operator at 2026-04-21T09:20:00.000Z. Corrected values: circulatedBy -> board-chair@example.com. Reason: Updated the operator attribution after board office review.",
            latestCorrection: {
              correctionKey: "board-packet-correction-1",
              correctedAt: "2026-04-21T09:20:00.000Z",
              correctedBy: "finance-operator",
              correctionReason:
                "Updated the operator attribution after board office review",
              circulatedAt: null,
              circulatedBy: "board-chair@example.com",
              circulationChannel: null,
              circulationNote: null,
              effectiveRecord: {
                source: "latest_correction",
                circulated: true,
                circulatedAt: "2026-04-21T09:10:00.000Z",
                circulatedBy: "board-chair@example.com",
                circulationChannel: "email",
                circulationNote:
                  "Circulated from the finance mailbox after approval.",
                approvalId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
                summary:
                  "Current effective circulation reflects the latest correction logged by finance-operator at 2026-04-21T09:20:00.000Z: circulated by board-chair@example.com at 2026-04-21T09:10:00.000Z via email. Effective note: Circulated from the finance mailbox after approval.",
              },
              summary:
                "Circulation record correction was appended by finance-operator at 2026-04-21T09:20:00.000Z. Corrected values: circulatedBy -> board-chair@example.com. Reason: Updated the operator attribution after board office review.",
            },
            effectiveRecord: {
              source: "latest_correction",
              circulated: true,
              circulatedAt: "2026-04-21T09:10:00.000Z",
              circulatedBy: "board-chair@example.com",
              circulationChannel: "email",
              circulationNote:
                "Circulated from the finance mailbox after approval.",
              approvalId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
              summary:
                "Current effective circulation reflects the latest correction logged by finance-operator at 2026-04-21T09:20:00.000Z: circulated by board-chair@example.com at 2026-04-21T09:10:00.000Z via email. Effective note: Circulated from the finance mailbox after approval.",
            },
            corrections: [
              {
                correctionKey: "board-packet-correction-1",
                correctedAt: "2026-04-21T09:20:00.000Z",
                correctedBy: "finance-operator",
                correctionReason:
                  "Updated the operator attribution after board office review",
                circulatedAt: null,
                circulatedBy: "board-chair@example.com",
                circulationChannel: null,
                circulationNote: null,
                effectiveRecord: {
                  source: "latest_correction",
                  circulated: true,
                  circulatedAt: "2026-04-21T09:10:00.000Z",
                  circulatedBy: "board-chair@example.com",
                  circulationChannel: "email",
                  circulationNote:
                    "Circulated from the finance mailbox after approval.",
                  approvalId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
                  summary:
                    "Current effective circulation reflects the latest correction logged by finance-operator at 2026-04-21T09:20:00.000Z: circulated by board-chair@example.com at 2026-04-21T09:10:00.000Z via email. Effective note: Circulated from the finance mailbox after approval.",
                },
                summary:
                  "Circulation record correction was appended by finance-operator at 2026-04-21T09:20:00.000Z. Corrected values: circulatedBy -> board-chair@example.com. Reason: Updated the operator attribution after board office review.",
              },
            ],
            summary:
              "1 circulation correction has been appended. The latest effective circulation fact reflects the correction logged by finance-operator at 2026-04-21T09:20:00.000Z.",
          },
          reportSummary:
            "Draft board packet for acme from the completed cash posture reporting mission.",
          appendixPresent: true,
          freshnessState: "stale",
          status: "succeeded",
          sourceKind: "manual_reporting",
          sourceRef: null,
          primaryRepo: null,
          createdAt: "2026-04-21T09:00:00.000Z",
          updatedAt: "2026-04-21T09:20:00.000Z",
          latestTask: {
            id: "44444444-4444-4444-8444-444444444444",
            role: "scout",
            sequence: 0,
            status: "succeeded",
            updatedAt: "2026-04-21T09:20:00.000Z",
          },
          proofBundleStatus: "ready",
          pendingApprovalCount: 0,
          pullRequestNumber: null,
          pullRequestUrl: null,
        },
      ],
    });

    expect(parsed.missions[0]?.circulationRecord?.circulatedBy).toBe(
      "finance-operator",
    );
    expect(
      parsed.missions[0]?.circulationChronology?.effectiveRecord?.circulatedBy,
    ).toBe("board-chair@example.com");
    expect(parsed.missions[0]?.circulationChronology?.correctionCount).toBe(1);
    expect(
      parsed.missions[0]?.circulationChronology?.latestCorrectionSummary,
    ).toContain("circulatedBy -> board-chair@example.com");
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
          title: "Draft diligence packet for acme from cash posture reporting",
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

function buildMonitorInvestigationSeed(
  monitorKind: "cash_posture" | "collections_pressure" = "cash_posture",
) {
  const isCollections = monitorKind === "collections_pressure";
  const monitorResultId = isCollections
    ? "77777777-7777-4777-8777-777777777777"
    : "66666666-6666-4666-8666-666666666666";

  return {
    monitorResultId,
    companyKey: "acme",
    monitorKind,
    monitorResultStatus: "alert" as const,
    alertSeverity: "critical" as const,
    deterministicSeverityRationale:
      "Critical because missing_source was detected from stored cash-posture freshness.",
    conditions: [
      {
        kind: "missing_source" as const,
        severity: "critical" as const,
        summary: "No successful bank-account-summary slice exists.",
        evidencePath: "freshness.state",
      },
    ],
    conditionSummaries: ["No successful bank-account-summary slice exists."],
    sourceFreshnessPosture: {
      state: "missing" as const,
      latestAttemptedSyncRunId: null,
      latestSuccessfulSyncRunId: null,
      latestSuccessfulSource: null,
      missingSource: true,
      failedSource: false,
      summary: "No successful cash-posture source is stored.",
    },
    sourceLineageRefs: [],
    sourceLineageSummary:
      "No bank-account-summary source lineage is available.",
    limitations: [
      "The monitor reports source posture only and does not infer runway.",
    ],
    proofBundlePosture: {
      state: "limited_by_missing_source" as const,
      summary:
        "The monitor proof is limited because no bank-account-summary source backs the cash posture.",
    },
    humanReviewNextStep:
      "Review cash-posture source coverage and refresh bank-account-summary ingest if needed.",
    runtimeBoundary: {
      monitorResultRuntimeBoundary: {
        runtimeCodexUsed: false as const,
        deliveryActionUsed: false as const,
        investigationMissionCreated: false as const,
        autonomousFinanceActionUsed: false as const,
        summary:
          "The result was produced by deterministic stored-state evaluation only.",
      },
      monitorRerunUsed: false as const,
      runtimeCodexUsed: false as const,
      deliveryActionUsed: false as const,
      scheduledAutomationUsed: false as const,
      reportArtifactCreated: false as const,
      approvalCreated: false as const,
      autonomousFinanceActionUsed: false as const,
      summary:
        "The handoff opened a deterministic investigation mission without runtime or delivery action.",
    },
    sourceRef: `pocket-cfo://monitor-results/${monitorResultId}`,
    monitorResultCreatedAt: "2026-04-26T12:00:00.000Z",
    alertCardCreatedAt: "2026-04-26T12:00:00.000Z",
  };
}
