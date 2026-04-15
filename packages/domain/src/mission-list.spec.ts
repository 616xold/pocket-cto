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
    expect(parsed.missions[0]?.freshnessState).toBe("stale");
  });
});
