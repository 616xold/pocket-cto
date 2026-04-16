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
          objectiveExcerpt: "Answer the stored payables pressure question for acme.",
          companyKey: "acme",
          questionKind: "payables_pressure",
          policySourceId: null,
          policySourceScope: null,
          answerSummary: "Stored payables pressure is available with limitations.",
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
});
