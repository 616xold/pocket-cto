import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const getMissionList = vi.fn();
const getGitHubIssueIntakeList = vi.fn();

vi.mock("../../lib/api", () => ({
  getGitHubIssueIntakeList,
  getMissionList,
}));

vi.mock("../../components/mission-intake-form", () => ({
  MissionIntakeForm() {
    return <div>mission-intake-form</div>;
  },
}));

vi.mock("../../components/discovery-mission-intake-form", () => ({
  DiscoveryMissionIntakeForm() {
    return <div>discovery-mission-intake-form</div>;
  },
}));

vi.mock("../../components/github-issue-intake-list", () => ({
  GitHubIssueIntakeList(props: {
    issues: Array<{
      issueTitle: string;
      isBound: boolean;
    }>;
  }) {
    return (
      <div>
        {props.issues.map((issue) => (
          <article key={issue.issueTitle}>
            <span>{issue.issueTitle}</span>
            <span>{issue.isBound ? "Open mission" : "Create mission"}</span>
          </article>
        ))}
      </div>
    );
  },
}));

describe("MissionsPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders real summary cards from the mission-list route", async () => {
    getMissionList.mockResolvedValue({
      filters: {
        limit: 20,
        sourceKind: null,
        status: null,
      },
      missions: [
        {
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
          sourceKind: "manual_text",
          sourceRef: null,
          status: "running",
          title: "Implement passkeys for sign-in",
          updatedAt: "2026-03-16T01:05:00.000Z",
        },
        {
          createdAt: "2026-03-15T23:00:00.000Z",
          id: "22222222-2222-4222-8222-222222222222",
          latestTask: null,
          objectiveExcerpt: "Draft rollback notes for a staged release.",
          pendingApprovalCount: 0,
          primaryRepo: "ops",
          proofBundleStatus: "placeholder",
          pullRequestNumber: null,
          pullRequestUrl: null,
          sourceKind: "github_issue",
          sourceRef: "https://github.com/acme/ops/issues/7",
          status: "queued",
          title: "Prepare rollback notes",
          updatedAt: "2026-03-15T23:00:00.000Z",
        },
      ],
    });
    getGitHubIssueIntakeList.mockResolvedValue({
      issues: [
        {
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
        },
      ],
    });

    const mod = await import("./page");
    const html = renderToStaticMarkup(await mod.default());

    expect(getMissionList).toHaveBeenCalledWith({ limit: 20 });
    expect(getGitHubIssueIntakeList).toHaveBeenCalledOnce();
    expect(html).toContain("Implement passkeys for sign-in");
    expect(html).toContain("Prepare rollback notes");
    expect(html).toContain("mission-intake-form");
    expect(html).toContain("discovery-mission-intake-form");
    expect(html).toContain("Legacy GitHub connector");
    expect(html).toContain("Ship issue intake");
    expect(html).toContain("Create mission");
    expect(html).toContain("Open mission");
    expect(html).toContain("PR #19");
  });
});
