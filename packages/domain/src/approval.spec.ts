import { describe, expect, it } from "vitest";
import {
  ApprovalKindSchema,
  ReportReleaseApprovalPayloadSchema,
  isReportReleaseApprovalPayload,
} from "./approval";

describe("Approval domain schema", () => {
  it("parses the report_release approval kind", () => {
    expect(ApprovalKindSchema.parse("report_release")).toBe("report_release");
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
});
