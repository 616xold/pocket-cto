import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const getControlPlaneHealth = vi.fn();
const getMissionList = vi.fn();
const getGitHubIssueIntakeList = vi.fn();

vi.mock("../lib/api", () => ({
  getControlPlaneHealth,
  getGitHubIssueIntakeList,
  getMissionList,
}));

vi.mock("../components/mission-intake-form", () => ({
  MissionIntakeForm() {
    return <div>mission-intake-form</div>;
  },
}));

vi.mock("../components/discovery-mission-intake-form", () => ({
  DiscoveryMissionIntakeForm() {
    return <div>discovery-mission-intake-form</div>;
  },
}));

vi.mock("../components/github-issue-intake-list", () => ({
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

describe("HomePage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders build and discovery intake cards alongside health and recent work", async () => {
    getControlPlaneHealth.mockResolvedValue({
      ok: true,
      service: "control-plane",
      now: "2026-03-20T03:30:00.000Z",
    });
    getMissionList.mockResolvedValue({
      filters: {
        limit: 6,
        sourceKind: null,
        status: null,
      },
      missions: [
        {
          createdAt: "2026-03-20T03:00:00.000Z",
          id: "11111111-1111-4111-8111-111111111111",
          latestTask: null,
          objectiveExcerpt:
            "Answer the stored auth-change blast radius for 616xold/pocket-cto.",
          pendingApprovalCount: 0,
          primaryRepo: "616xold/pocket-cto",
          proofBundleStatus: "ready",
          pullRequestNumber: null,
          pullRequestUrl: null,
          sourceKind: "manual_discovery",
          sourceRef: null,
          status: "succeeded",
          title: "Assess auth-change blast radius for 616xold/pocket-cto",
          updatedAt: "2026-03-20T03:05:00.000Z",
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
          receivedAt: "2026-03-20T03:10:00.000Z",
          commentCount: 1,
          hasCommentActivity: true,
          isBound: false,
          boundMissionId: null,
          boundMissionStatus: null,
        },
      ],
    });

    const mod = await import("./page");
    const html = renderToStaticMarkup(await mod.default());

    expect(getControlPlaneHealth).toHaveBeenCalledOnce();
    expect(getMissionList).toHaveBeenCalledWith({ limit: 6 });
    expect(getGitHubIssueIntakeList).toHaveBeenCalledOnce();
    expect(html).toContain("mission-intake-form");
    expect(html).toContain("discovery-mission-intake-form");
    expect(html).toContain("reachable");
    expect(html).toContain("Assess auth-change blast radius for 616xold/pocket-cto");
    expect(html).toContain("Ship issue intake");
  });
});
