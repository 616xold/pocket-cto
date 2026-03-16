import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MissionListCard } from "./mission-list-card";

describe("MissionListCard", () => {
  it("renders summary-shaped mission evidence and links into detail", () => {
    const html = renderToStaticMarkup(
      <MissionListCard
        mission={{
          createdAt: "2026-03-16T01:00:00.000Z",
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
          primaryRepo: "web",
          proofBundleStatus: "incomplete",
          pullRequestNumber: 19,
          pullRequestUrl: "https://github.com/acme/web/pull/19",
          sourceKind: "github_issue",
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
});
