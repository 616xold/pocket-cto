import { describe, expect, it } from "vitest";
import type {
  ApprovalRecord,
  MissionRecord,
  MissionTaskRecord,
  ProofBundleManifest,
} from "@pocket-cto/domain";
import {
  buildMissionApprovalCard,
  buildMissionApprovalCards,
} from "./card-formatter";

const mission: Pick<MissionRecord, "primaryRepo"> = {
  primaryRepo: "acme/web",
};

const proofBundle: Pick<
  ProofBundleManifest,
  "branchName" | "pullRequestNumber" | "pullRequestUrl" | "targetRepoFullName"
> = {
  branchName: "pocket-cto/mission-1/1-executor",
  pullRequestNumber: 41,
  pullRequestUrl: "https://github.com/acme/web/pull/41",
  targetRepoFullName: "acme/web",
};

const task: MissionTaskRecord = {
  attemptCount: 1,
  codexThreadId: "thread_live_1",
  codexTurnId: "turn_live_1",
  createdAt: "2026-03-16T10:00:00.000Z",
  dependsOnTaskId: null,
  id: "33333333-3333-4333-8333-333333333333",
  missionId: "11111111-1111-4111-8111-111111111111",
  role: "executor",
  sequence: 1,
  status: "awaiting_approval",
  summary: "Waiting for operator approval.",
  updatedAt: "2026-03-16T10:01:00.000Z",
  workspaceId: null,
};

describe("card-formatter", () => {
  it("formats a pending file-change approval as a compact operator card", () => {
    const card = buildMissionApprovalCards({
      approvals: [
        buildApproval({
          kind: "file_change",
          payload: {
            details: {
              grantRoot: "/tmp/workspaces/mission-1/apps/web/src",
              reason: "Need to update the sign-in form and passkey settings UI",
            },
          },
          taskId: task.id,
        }),
      ],
      mission,
      proofBundle,
      tasks: [task],
    })[0]!;

    expect(card).toMatchObject({
      actionHint:
        "Review the requested file-edit scope, then approve only if this task should change those files.",
      approvalId: "22222222-2222-4222-8222-222222222222",
      kind: "file_change",
      requestedBy: "system",
      status: "pending",
      task: {
        id: task.id,
        label: "Task 1 · executor",
      },
      title: "Approve file changes in .../apps/web/src",
    });
    expect(card.summary).toContain("Allow file edits under .../apps/web/src.");
    expect(card.summary).toContain("Why it matters:");
    expect(card.repoContext).toEqual({
      repoLabel: "acme/web",
      branchName: "pocket-cto/mission-1/1-executor",
      pullRequestNumber: 41,
      pullRequestUrl: "https://github.com/acme/web/pull/41",
    });
    expect(card.resolutionSummary).toBeNull();
  });

  it("formats a pending command approval with command and cwd context", () => {
    const card = buildMissionApprovalCard({
      approval: buildApproval({
        kind: "command",
        payload: {
          details: {
            command: "pnpm --filter @pocket-cto/web test",
            cwd: "/tmp/workspaces/mission-1/apps/web",
            reason:
              "Need to verify the updated mission detail UI before publishing",
          },
        },
        taskId: task.id,
      }),
      context: buildContext(),
    });

    expect(card.title).toContain("Approve command:");
    expect(card.summary).toContain("Run pnpm --filter @pocket-cto/web test.");
    expect(card.summary).toContain(
      "Working directory: .../mission-1/apps/web.",
    );
    expect(card.actionHint).toBe(
      "Review the command and working directory before approving execution.",
    );
  });

  it("formats a pending network escalation with explicit network-policy context", () => {
    const card = buildMissionApprovalCard({
      approval: buildApproval({
        kind: "network_escalation",
        payload: {
          details: {
            command: "pnpm audit --prod",
            proposedNetworkPolicyAmendments: [{ host: "registry.npmjs.org" }],
            reason:
              "Need package metadata from npm to verify the dependency posture",
          },
        },
        taskId: task.id,
      }),
      context: buildContext(),
    });

    expect(card.title).toContain("Approve networked command:");
    expect(card.summary).toContain(
      "Allow networked command pnpm audit --prod.",
    );
    expect(card.summary).toContain(
      "The runtime proposed 1 network policy amendment.",
    );
    expect(card.actionHint).toBe(
      "Approve only if this task should use network access or adjust network policy to finish the requested work.",
    );
  });

  it("keeps unsupported kinds explicit and honest", () => {
    const card = buildMissionApprovalCard({
      approval: buildApproval({
        kind: "merge",
        payload: {
          details: {
            reason: "Merge remains blocked until the release freeze lifts",
          },
        },
        taskId: task.id,
      }),
      context: buildContext(),
    });

    expect(card.title).toBe("Review merge");
    expect(card.summary).toContain(
      "does not yet know how to summarize its payload in more detail",
    );
    expect(card.summary).toContain("Stored reason:");
  });

  it("shows pending and resolved cards differently", () => {
    const pendingCard = buildMissionApprovalCard({
      approval: buildApproval({
        kind: "command",
        payload: {
          details: {
            command: "pnpm lint",
          },
        },
        taskId: task.id,
      }),
      context: buildContext(),
    });
    const resolvedCard = buildMissionApprovalCard({
      approval: buildApproval({
        kind: "command",
        rationale: "The audit passed and the command is safe to rerun.",
        resolvedBy: "Alicia",
        status: "approved",
        updatedAt: "2026-03-16T10:06:00.000Z",
        payload: {
          details: {
            command: "pnpm lint",
          },
        },
        taskId: task.id,
      }),
      context: buildContext(),
    });

    expect(pendingCard.actionHint).not.toBeNull();
    expect(pendingCard.resolutionSummary).toBeNull();
    expect(resolvedCard.actionHint).toBeNull();
    expect(resolvedCard.resolutionSummary).toBe(
      "Approved by Alicia at 2026-03-16T10:06:00.000Z. Rationale: The audit passed and the command is safe to rerun.",
    );
    expect(resolvedCard.resolvedAt).toBe("2026-03-16T10:06:00.000Z");
  });

  it("formats a pending diligence-packet release approval as a posture-only approval card", () => {
    const card = buildMissionApprovalCard({
      approval: buildApproval({
        kind: "report_release",
        requestedBy: "finance-operator",
        payload: {
          artifactId: "44444444-4444-4444-8444-444444444444",
          companyKey: "acme",
          draftOnlyStatus: "draft_only",
          freshnessSummary: "Cash posture remains stale.",
          limitationsSummary:
            "This diligence packet remains delivery-free while review is pending.",
          missionId: "11111111-1111-4111-8111-111111111111",
          reportKind: "diligence_packet",
          sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
          sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
          summary:
            "Draft diligence packet for acme from the completed finance memo.",
          resolution: null,
          releaseRecord: null,
        },
        taskId: null,
      }),
      context: buildContext(),
    });

    expect(card.title).toBe("Review diligence packet release approval for acme");
    expect(card.summary).toContain(
      "Review diligence packet release readiness for acme",
    );
    expect(card.summary).toContain("Draft diligence packet for acme");
    expect(card.requiresLiveControl).toBe(false);
    expect(card.actionHint).toContain("does not deliver the report");
  });

  it("formats a pending board-packet circulation approval as a posture-only approval card", () => {
    const card = buildMissionApprovalCard({
      approval: buildApproval({
        kind: "report_circulation",
        requestedBy: "finance-operator",
        payload: {
          artifactId: "44444444-4444-4444-8444-444444444444",
          companyKey: "acme",
          draftOnlyStatus: "draft_only",
          freshnessSummary: "Cash posture remains stale.",
          limitationsSummary:
            "This board packet remains delivery-free while review is pending.",
          missionId: "11111111-1111-4111-8111-111111111111",
          reportKind: "board_packet",
          sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
          sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
          summary:
            "Draft board packet for acme from the completed finance memo.",
          resolution: null,
        },
        taskId: null,
      }),
      context: buildContext(),
    });

    expect(card.title).toBe("Review board packet circulation approval for acme");
    expect(card.summary).toContain(
      "Review board packet circulation readiness for acme",
    );
    expect(card.summary).toContain("Draft board packet for acme");
    expect(card.requiresLiveControl).toBe(false);
    expect(card.actionHint).toContain("does not log circulation");
  });

  it("formats a logged lender-update release as a non-delivery approval card", () => {
    const card = buildMissionApprovalCard({
      approval: buildApproval({
        kind: "report_release",
        rationale: "Approved for release readiness.",
        requestedBy: "finance-operator",
        resolvedBy: "finance-reviewer",
        status: "approved",
        updatedAt: "2026-04-20T09:10:00.000Z",
        payload: {
          artifactId: "44444444-4444-4444-8444-444444444444",
          companyKey: "acme",
          draftOnlyStatus: "draft_only",
          freshnessSummary: "Cash posture remains stale.",
          limitationsSummary: "Draft-only posture remains explicit.",
          missionId: "11111111-1111-4111-8111-111111111111",
          reportKind: "lender_update",
          sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
          sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
          summary:
            "Draft lender update for acme from the completed finance memo.",
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
        },
        taskId: null,
      }),
      context: buildContext(),
    });

    expect(card.title).toBe("Lender update release logged for acme");
    expect(card.summary).toContain("External lender-update release is logged");
    expect(card.summary).toContain("Original approval");
    expect(card.requiresLiveControl).toBe(false);
    expect(card.actionHint).toBeNull();
  });

  it("formats a logged diligence-packet release as a non-delivery approval card", () => {
    const card = buildMissionApprovalCard({
      approval: buildApproval({
        kind: "report_release",
        rationale: "Approved for release readiness.",
        requestedBy: "finance-operator",
        resolvedBy: "finance-reviewer",
        status: "approved",
        updatedAt: "2026-04-21T09:10:00.000Z",
        payload: {
          artifactId: "44444444-4444-4444-8444-444444444444",
          companyKey: "acme",
          draftOnlyStatus: "draft_only",
          freshnessSummary: "Cash posture remains stale.",
          limitationsSummary: "Draft-only posture remains explicit.",
          missionId: "11111111-1111-4111-8111-111111111111",
          reportKind: "diligence_packet",
          sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
          sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
          summary:
            "Draft diligence packet for acme from the completed finance memo.",
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
        },
        taskId: null,
      }),
      context: buildContext(),
    });

    expect(card.title).toBe("Diligence packet release logged for acme");
    expect(card.summary).toContain("External diligence packet release is logged");
    expect(card.summary).toContain("Original app");
    expect(card.requiresLiveControl).toBe(false);
    expect(card.actionHint).toBeNull();
  });
});

function buildContext() {
  return {
    repoContext: {
      repoLabel: "acme/web",
      branchName: "pocket-cto/mission-1/1-executor",
      pullRequestNumber: 41,
      pullRequestUrl: "https://github.com/acme/web/pull/41",
    },
    task: {
      id: task.id,
      label: "Task 1 · executor",
      role: "executor" as const,
      sequence: 1,
    },
  };
}

function buildApproval(
  overrides: Partial<ApprovalRecord> & {
    kind: ApprovalRecord["kind"];
    payload: ApprovalRecord["payload"];
    taskId: string | null;
  },
): ApprovalRecord {
  return {
    createdAt: "2026-03-16T10:01:00.000Z",
    id: "22222222-2222-4222-8222-222222222222",
    kind: overrides.kind,
    missionId: "11111111-1111-4111-8111-111111111111",
    payload: overrides.payload,
    rationale: overrides.rationale ?? null,
    requestedBy: overrides.requestedBy ?? "system",
    resolvedBy: overrides.resolvedBy ?? null,
    status: overrides.status ?? "pending",
    taskId: overrides.taskId,
    updatedAt: overrides.updatedAt ?? "2026-03-16T10:01:00.000Z",
  };
}
