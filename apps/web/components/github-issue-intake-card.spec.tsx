import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { GitHubIssueIntakeCard } from "./github-issue-intake-card";

vi.mock("../app/missions/actions", () => ({
  submitGitHubIssueMissionCreate: vi.fn(),
}));

describe("GitHubIssueIntakeCard", () => {
  it("renders a create-mission action for an unbound issue", () => {
    const html = renderToStaticMarkup(
      <GitHubIssueIntakeCard
        issue={{
          deliveryId: "delivery-issue-42",
          repoFullName: "acme/web",
          issueNumber: 42,
          issueTitle: "Ship issue intake",
          issueState: "open",
          senderLogin: "octo-operator",
          sourceRef: "https://github.com/acme/web/issues/42",
          receivedAt: "2026-03-16T01:55:00.000Z",
          commentCount: 2,
          hasCommentActivity: true,
          isBound: false,
          boundMissionId: null,
          boundMissionStatus: null,
        }}
      />,
    );

    expect(html).toContain("Ship issue intake");
    expect(html).toContain("Create mission");
    expect(html).toContain("delivery-issue-42");
    expect(html).toContain("Open issue");
  });

  it("renders an existing mission link for a bound issue", () => {
    const html = renderToStaticMarkup(
      <GitHubIssueIntakeCard
        issue={{
          deliveryId: "delivery-issue-43",
          repoFullName: "acme/ops",
          issueNumber: 43,
          issueTitle: "Already bound issue",
          issueState: "open",
          senderLogin: "octo-reviewer",
          sourceRef: "https://github.com/acme/ops/issues/43",
          receivedAt: "2026-03-16T01:50:00.000Z",
          commentCount: 0,
          hasCommentActivity: false,
          isBound: true,
          boundMissionId: "11111111-1111-4111-8111-111111111111",
          boundMissionStatus: "queued",
        }}
      />,
    );

    expect(html).toContain("Open mission");
    expect(html).toContain("/missions/11111111-1111-4111-8111-111111111111");
    expect(html).not.toContain("Create mission");
  });
});
