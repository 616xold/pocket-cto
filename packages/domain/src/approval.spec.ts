import { describe, expect, it } from "vitest";
import {
  ApprovalKindSchema,
  ReportCirculationApprovalPayloadSchema,
  ReportReleaseApprovalPayloadSchema,
  isReportCirculationApprovalPayload,
  isReportReleaseApprovalPayload,
} from "./approval";

describe("Approval domain schema", () => {
  it("parses the report_release approval kind", () => {
    expect(ApprovalKindSchema.parse("report_release")).toBe("report_release");
  });

  it("parses the report_circulation approval kind", () => {
    expect(ApprovalKindSchema.parse("report_circulation")).toBe(
      "report_circulation",
    );
  });

  it("parses the lender-update report release approval payload", () => {
    const parsed = ReportReleaseApprovalPayloadSchema.parse({
      missionId: "11111111-1111-4111-8111-111111111111",
      reportKind: "lender_update",
      sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
      sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
      artifactId: "44444444-4444-4444-8444-444444444444",
      companyKey: "acme",
      draftOnlyStatus: "draft_only",
      summary: "Draft lender update for acme from the completed finance memo.",
      freshnessSummary:
        "Cash posture remains stale because bank coverage is stale.",
      limitationsSummary:
        "This lender update remains draft-only until release approval is granted.",
    });

    expect(parsed.reportKind).toBe("lender_update");
    expect(parsed.companyKey).toBe("acme");
    expect(parsed.resolution).toBeNull();
    expect(parsed.releaseRecord).toBeNull();
    expect(isReportReleaseApprovalPayload(parsed)).toBe(true);
  });

  it("parses a lender-update report release payload with a persisted release record", () => {
    const parsed = ReportReleaseApprovalPayloadSchema.parse({
      missionId: "11111111-1111-4111-8111-111111111111",
      reportKind: "lender_update",
      sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
      sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
      artifactId: "44444444-4444-4444-8444-444444444444",
      companyKey: "acme",
      draftOnlyStatus: "draft_only",
      summary: "Draft lender update for acme from the completed finance memo.",
      freshnessSummary:
        "Cash posture remains stale because bank coverage is stale.",
      limitationsSummary:
        "This lender update remains draft-only until release approval is granted.",
      resolution: {
        decision: "accept",
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
    });

    expect(parsed.resolution?.decision).toBe("accept");
    expect(parsed.releaseRecord?.releaseChannel).toBe("email");
  });

  it("parses the diligence-packet report release approval payload", () => {
    const parsed = ReportReleaseApprovalPayloadSchema.parse({
      missionId: "11111111-1111-4111-8111-111111111111",
      reportKind: "diligence_packet",
      sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
      sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
      artifactId: "44444444-4444-4444-8444-444444444444",
      companyKey: "acme",
      draftOnlyStatus: "draft_only",
      summary:
        "Draft diligence packet for acme from the completed finance memo.",
      freshnessSummary:
        "Cash posture remains stale because bank coverage is stale.",
      limitationsSummary:
        "This diligence packet remains delivery-free until release approval is granted.",
    });

    expect(parsed.reportKind).toBe("diligence_packet");
    expect(parsed.releaseRecord).toBeNull();
    expect(isReportReleaseApprovalPayload(parsed)).toBe(true);
  });

  it("parses a diligence-packet report release payload with a persisted release record", () => {
    const parsed = ReportReleaseApprovalPayloadSchema.parse({
      missionId: "11111111-1111-4111-8111-111111111111",
      reportKind: "diligence_packet",
      sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
      sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
      artifactId: "44444444-4444-4444-8444-444444444444",
      companyKey: "acme",
      draftOnlyStatus: "draft_only",
      summary:
        "Draft diligence packet for acme from the completed finance memo.",
      freshnessSummary:
        "Cash posture remains stale because bank coverage is stale.",
      limitationsSummary:
        "This diligence packet remains delivery-free until release approval is granted.",
      resolution: {
        decision: "accept",
        rationale: "Approved for release readiness.",
        resolvedBy: "finance-reviewer",
      },
      releaseRecord: {
        releasedAt: "2026-04-21T09:10:00.000Z",
        releasedBy: "finance-operator",
        releaseChannel: "secure_portal",
        releaseNote: "Released after diligence counsel review.",
        summary:
          "External release was logged by finance-operator at 2026-04-21T09:10:00.000Z via secure_portal. Release note: Released after diligence counsel review..",
      },
    });

    expect(parsed.resolution?.decision).toBe("accept");
    expect(parsed.releaseRecord?.releaseChannel).toBe("secure_portal");
  });

  it("parses the board-packet report circulation approval payload", () => {
    const parsed = ReportCirculationApprovalPayloadSchema.parse({
      missionId: "11111111-1111-4111-8111-111111111111",
      reportKind: "board_packet",
      sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
      sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
      artifactId: "44444444-4444-4444-8444-444444444444",
      companyKey: "acme",
      draftOnlyStatus: "draft_only",
      summary: "Draft board packet for acme from the completed finance memo.",
      freshnessSummary:
        "Cash posture remains stale because bank coverage is stale.",
      limitationsSummary:
        "This board packet remains delivery-free and circulation-log-free until circulation approval is granted.",
    });

    expect(parsed.reportKind).toBe("board_packet");
    expect(parsed.companyKey).toBe("acme");
    expect(parsed.resolution).toBeNull();
    expect(parsed.circulationRecord).toBeNull();
    expect(parsed.circulationCorrections).toEqual([]);
    expect(isReportCirculationApprovalPayload(parsed)).toBe(true);
  });

  it("parses a board-packet report circulation payload with a persisted circulation record", () => {
    const parsed = ReportCirculationApprovalPayloadSchema.parse({
      missionId: "11111111-1111-4111-8111-111111111111",
      reportKind: "board_packet",
      sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
      sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
      artifactId: "44444444-4444-4444-8444-444444444444",
      companyKey: "acme",
      draftOnlyStatus: "draft_only",
      summary: "Draft board packet for acme from the completed finance memo.",
      freshnessSummary:
        "Cash posture remains stale because bank coverage is stale.",
      limitationsSummary:
        "This board packet remains delivery-free and circulation-log-free until circulation approval is granted.",
      resolution: {
        decision: "accept",
        rationale: "Approved for internal circulation readiness.",
        resolvedBy: "finance-reviewer",
      },
      circulationRecord: {
        circulatedAt: "2026-04-21T09:10:00.000Z",
        circulatedBy: "finance-operator",
        circulationChannel: "email",
        circulationNote: "Circulated from the finance mailbox after approval.",
        summary:
          "External circulation was logged by finance-operator at 2026-04-21T09:10:00.000Z via email. Circulation note: Circulated from the finance mailbox after approval.",
      },
    });

    expect(parsed.resolution?.decision).toBe("accept");
    expect(parsed.circulationRecord?.circulationChannel).toBe("email");
    expect(parsed.circulationCorrections).toEqual([]);
  });

  it("parses a board-packet report circulation payload with append-only corrections", () => {
    const parsed = ReportCirculationApprovalPayloadSchema.parse({
      missionId: "11111111-1111-4111-8111-111111111111",
      reportKind: "board_packet",
      sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
      sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
      artifactId: "44444444-4444-4444-8444-444444444444",
      companyKey: "acme",
      draftOnlyStatus: "draft_only",
      summary: "Draft board packet for acme from the completed finance memo.",
      freshnessSummary:
        "Cash posture remains stale because bank coverage is stale.",
      limitationsSummary:
        "This board packet remains delivery-free and circulation-log-free until circulation approval is granted.",
      resolution: {
        decision: "accept",
        rationale: "Approved for internal circulation readiness.",
        resolvedBy: "finance-reviewer",
      },
      circulationRecord: {
        circulatedAt: "2026-04-21T09:10:00.000Z",
        circulatedBy: "finance-operator",
        circulationChannel: "email",
        circulationNote: "Circulated from the finance mailbox after approval.",
        summary:
          "External circulation was logged by finance-operator at 2026-04-21T09:10:00.000Z via email. Circulation note: Circulated from the finance mailbox after approval.",
      },
      circulationCorrections: [
        {
          correctionKey: "board-circulation-correction-1",
          correctedAt: "2026-04-21T09:15:00.000Z",
          correctedBy: "finance-operator",
          correctionReason: "Original timestamp used the send-draft time.",
          circulatedAt: "2026-04-21T09:12:00.000Z",
          circulatedBy: "board-chair@example.com",
          circulationChannel: null,
          circulationNote: "Corrected to the actual external circulation time.",
          summary:
            "Circulation record correction was appended by finance-operator at 2026-04-21T09:15:00.000Z. Corrected values: circulatedAt -> 2026-04-21T09:12:00.000Z; circulatedBy -> board-chair@example.com; circulationNote -> Corrected to the actual external circulation time.. Reason: Original timestamp used the send-draft time.",
        },
      ],
    });

    expect(parsed.circulationCorrections).toHaveLength(1);
    expect(parsed.circulationCorrections[0]?.correctionKey).toBe(
      "board-circulation-correction-1",
    );
    expect(parsed.circulationCorrections[0]?.circulatedAt).toBe(
      "2026-04-21T09:12:00.000Z",
    );
    expect(parsed.circulationCorrections[0]?.circulatedBy).toBe(
      "board-chair@example.com",
    );
  });
});
