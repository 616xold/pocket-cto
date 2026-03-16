import { afterEach, describe, expect, it, vi } from "vitest";

const missionId = "11111111-1111-4111-8111-111111111111";
const approvalId = "22222222-2222-4222-8222-222222222222";
const taskId = "33333333-3333-4333-8333-333333333333";

describe("web api module", () => {
  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("falls back to the default control-plane URL when no env override is set", async () => {
    const mod = await loadApiModuleWithEnv({});

    expect(
      mod.resolveControlPlaneUrl({
        NEXT_PUBLIC_CONTROL_PLANE_URL: undefined,
        CONTROL_PLANE_URL: undefined,
      }),
    ).toBe("http://localhost:4000");
  });

  it("prefers NEXT_PUBLIC_CONTROL_PLANE_URL over CONTROL_PLANE_URL", async () => {
    const mod = await loadApiModuleWithEnv({
      controlPlaneUrl: "http://control-plane.internal:4200",
      nextPublicControlPlaneUrl: "http://public-control-plane.example:4100",
    });

    expect(
      mod.resolveControlPlaneUrl({
        NEXT_PUBLIC_CONTROL_PLANE_URL: "http://public-control-plane.example:4100",
        CONTROL_PLANE_URL: "http://control-plane.internal:4200",
      }),
    ).toBe("http://public-control-plane.example:4100");
  });

  it("uses CONTROL_PLANE_URL when NEXT_PUBLIC_CONTROL_PLANE_URL is absent", async () => {
    const mod = await loadApiModuleWithEnv({
      controlPlaneUrl: "http://control-plane.internal:4200",
    });

    expect(
      mod.resolveControlPlaneUrl({
        NEXT_PUBLIC_CONTROL_PLANE_URL: undefined,
        CONTROL_PLANE_URL: "http://control-plane.internal:4200",
      }),
    ).toBe("http://control-plane.internal:4200");
  });

  it("parses mission detail with approvals and artifacts", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      async json() {
        return buildMissionDetailPayload();
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({});
    const detail = await mod.getMissionDetail(missionId);

    expect(detail).not.toBeNull();
    expect(detail?.approvals).toHaveLength(1);
    expect(detail?.approvalCards).toHaveLength(1);
    expect(detail?.artifacts.map((artifact) => artifact.kind)).toEqual([
      "proof_bundle_manifest",
      "diff_summary",
    ]);
    expect(detail?.liveControl.mode).toBe("embedded_worker");
    expect(fetchMock).toHaveBeenCalledWith(
      `${mod.resolveControlPlaneUrl()}/missions/${missionId}`,
      {
        cache: "no-store",
      },
    );
  });

  it("parses the mission-list route and forwards list filters", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      async json() {
        return buildMissionListPayload();
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({});
    const list = await mod.getMissionList({
      limit: 6,
      sourceKind: "github_issue",
      status: "queued",
    });

    expect(list).not.toBeNull();
    expect(list?.filters).toEqual({
      limit: 6,
      sourceKind: "github_issue",
      status: "queued",
    });
    expect(list?.missions.map((mission) => mission.id)).toEqual([
      missionId,
      "44444444-4444-4444-8444-444444444444",
    ]);
    expect(list?.missions[0]).toMatchObject({
      latestTask: {
        role: "executor",
        sequence: 1,
        status: "running",
      },
      pendingApprovalCount: 1,
      proofBundleStatus: "incomplete",
      pullRequestUrl: "https://github.com/acme/web/pull/19",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `${mod.resolveControlPlaneUrl()}/missions?limit=6&status=queued&sourceKind=github_issue`,
      {
        cache: "no-store",
      },
    );
  });

  it("forms approval-resolution and task-interrupt requests correctly", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        async json() {
          return {
            approval: {
              createdAt: "2026-03-14T10:01:00.000Z",
              id: approvalId,
              kind: "file_change",
              missionId,
              payload: {
                resolution: {
                  decision: "accept",
                },
              },
              rationale: null,
              requestedBy: "system",
              resolvedBy: "web-operator",
              status: "approved",
              taskId,
              updatedAt: "2026-03-14T10:02:00.000Z",
            },
            liveControl: {
              enabled: true,
              limitation: "single_process_only",
              mode: "embedded_worker",
            },
          };
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        async json() {
          return {
            interrupt: {
              cancelledApprovals: [],
              taskId,
              threadId: "thread_live_1",
              turnId: "turn_live_1",
            },
            liveControl: {
              enabled: true,
              limitation: "single_process_only",
              mode: "embedded_worker",
            },
          };
        },
      });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({
      controlPlaneUrl: "http://control-plane.internal:4200",
      nextPublicControlPlaneUrl: "http://public-control-plane.example:4100",
    });

    const approvalResult = await mod.resolveMissionApproval({
      approvalId,
      decision: "accept",
      resolvedBy: "web-operator",
    });
    const interruptResult = await mod.interruptMissionTask({
      requestedBy: "web-operator",
      taskId,
    });

    expect(approvalResult).toMatchObject({
      ok: true,
      statusCode: 200,
    });
    expect(interruptResult).toMatchObject({
      ok: true,
      statusCode: 200,
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `http://public-control-plane.example:4100/approvals/${approvalId}/resolve`,
      {
        body: JSON.stringify({
          decision: "accept",
          rationale: undefined,
          resolvedBy: "web-operator",
        }),
        cache: "no-store",
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      },
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `http://public-control-plane.example:4100/tasks/${taskId}/interrupt`,
      {
        body: JSON.stringify({
          rationale: undefined,
          requestedBy: "web-operator",
        }),
        cache: "no-store",
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      },
    );
  });

  it("returns typed route failures instead of throwing for normal operator-action errors", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 501,
        async json() {
          return {
            error: {
              code: "live_control_unavailable",
              message:
                "Live approval and interrupt control is unavailable in this process",
            },
          };
        },
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        async json() {
          return {
            error: {
              code: "task_conflict",
              message: `Task ${taskId} has no active live turn to interrupt`,
            },
          };
        },
      });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({
      controlPlaneUrl: "http://control-plane.internal:4200",
    });

    await expect(
      mod.resolveMissionApproval({
        approvalId,
        decision: "accept",
        resolvedBy: "web-operator",
      }),
    ).resolves.toEqual({
      ok: false,
      statusCode: 501,
      errorCode: "live_control_unavailable",
      message: "Live approval and interrupt control is unavailable in this process",
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `http://control-plane.internal:4200/approvals/${approvalId}/resolve`,
      expect.any(Object),
    );

    await expect(
      mod.interruptMissionTask({
        requestedBy: "web-operator",
        taskId,
      }),
    ).resolves.toEqual({
      ok: false,
      statusCode: 409,
      errorCode: "task_conflict",
      message: `Task ${taskId} has no active live turn to interrupt`,
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `http://control-plane.internal:4200/tasks/${taskId}/interrupt`,
      expect.any(Object),
    );
  });
});

async function loadApiModuleWithEnv(input: {
  controlPlaneUrl?: string;
  nextPublicControlPlaneUrl?: string;
}) {
  vi.resetModules();
  vi.unstubAllEnvs();

  delete process.env.CONTROL_PLANE_URL;
  delete process.env.NEXT_PUBLIC_CONTROL_PLANE_URL;

  if (input.controlPlaneUrl) {
    vi.stubEnv("CONTROL_PLANE_URL", input.controlPlaneUrl);
  }

  if (input.nextPublicControlPlaneUrl) {
    vi.stubEnv(
      "NEXT_PUBLIC_CONTROL_PLANE_URL",
      input.nextPublicControlPlaneUrl,
    );
  }

  return import("./api");
}

function buildMissionDetailPayload() {
  return {
    mission: {
      createdAt: "2026-03-14T10:00:00.000Z",
      createdBy: "operator",
      id: missionId,
      objective: "Ship passkeys without breaking email login.",
      primaryRepo: "web",
      sourceKind: "manual_text",
      sourceRef: null,
      spec: {
        acceptance: ["Ship passkeys without breaking email login."],
        constraints: {
          allowedPaths: [],
          mustNot: [],
        },
        deliverables: [
          "Updated mission detail route with approvals and artifacts.",
        ],
        evidenceRequirements: ["approval ledger", "artifact ledger"],
        objective: "Ship passkeys without breaking email login.",
        repos: ["web"],
        riskBudget: {
          allowNetwork: false,
          maxCostUsd: 5,
          maxWallClockMinutes: 30,
          requiresHumanApprovalFor: [],
          sandboxMode: "patch-only",
        },
        title: "Implement passkeys for sign-in",
        type: "build",
      },
      status: "running",
      title: "Implement passkeys for sign-in",
      type: "build",
      updatedAt: "2026-03-14T10:05:00.000Z",
    },
    tasks: [
      {
        attemptCount: 1,
        codexThreadId: "thread_live_1",
        codexTurnId: "turn_live_1",
        createdAt: "2026-03-14T10:00:00.000Z",
        dependsOnTaskId: null,
        id: taskId,
        missionId,
        role: "executor",
        sequence: 1,
        status: "running",
        summary: "Applying the operator read-model change.",
        updatedAt: "2026-03-14T10:05:00.000Z",
        workspaceId: null,
      },
    ],
    proofBundle: {
      artifactIds: ["77777777-7777-4777-8777-777777777777"],
      artifacts: [
        {
          id: "77777777-7777-4777-8777-777777777777",
          kind: "diff_summary",
        },
      ],
      branchName: null,
      changeSummary: "Updated the mission detail read model for approvals and artifacts.",
      decisionTrace: [
        "Executor task 1 produced diff_summary artifact 77777777-7777-4777-8777-777777777777.",
      ],
      evidenceCompleteness: {
        status: "partial",
        expectedArtifactKinds: ["plan", "diff_summary", "test_report", "pr_link"],
        presentArtifactKinds: ["diff_summary"],
        missingArtifactKinds: ["plan", "test_report", "pr_link"],
        notes: [
          "Planner evidence is missing.",
          "Validation evidence is missing.",
          "GitHub pull request evidence is missing.",
        ],
      },
      latestApproval: {
        createdAt: "2026-03-14T10:01:00.000Z",
        id: approvalId,
        kind: "file_change",
        rationale: null,
        requestedBy: "system",
        resolvedBy: null,
        status: "pending",
        updatedAt: "2026-03-14T10:01:00.000Z",
      },
      missionId,
      missionTitle: "Implement passkeys for sign-in",
      objective: "Ship passkeys without breaking email login.",
      pullRequestNumber: null,
      pullRequestUrl: null,
      replayEventCount: 14,
      riskSummary: "Action controls still require embedded-worker mode.",
      rollbackSummary: "Disable the action panel and fall back to the API route surface.",
      status: "incomplete",
      targetRepoFullName: null,
      timestamps: {
        missionCreatedAt: "2026-03-14T10:00:00.000Z",
        latestPlannerEvidenceAt: null,
        latestExecutorEvidenceAt: "2026-03-14T10:04:00.000Z",
        latestPullRequestAt: null,
        latestApprovalAt: "2026-03-14T10:01:00.000Z",
        latestArtifactAt: "2026-03-14T10:04:00.000Z",
      },
      validationSummary: "Pending local executor validation evidence.",
      verificationSummary:
        "A runtime approval is still pending, so the proof bundle is not final yet.",
    },
    approvals: [
      {
        createdAt: "2026-03-14T10:01:00.000Z",
        id: approvalId,
        kind: "file_change",
        rationale: null,
        requestedBy: "system",
        resolvedBy: null,
        status: "pending",
        updatedAt: "2026-03-14T10:01:00.000Z",
      },
    ],
    approvalCards: [
      {
        actionHint:
          "Review the requested file-edit scope, then approve only if this task should change those files.",
        approvalId,
        kind: "file_change",
        requestedAt: "2026-03-14T10:01:00.000Z",
        requestedBy: "system",
        repoContext: {
          repoLabel: "web",
          branchName: null,
          pullRequestNumber: null,
          pullRequestUrl: null,
        },
        resolutionSummary: null,
        resolvedAt: null,
        resolvedBy: null,
        status: "pending",
        summary:
          "Allow file edits in the task workspace. Why it matters: the runtime needs workspace write access to continue.",
        task: {
          id: taskId,
          label: "Task 1 · executor",
          role: "executor",
          sequence: 1,
        },
        title: "Approve workspace file changes",
      },
    ],
    artifacts: [
      {
        createdAt: "2026-03-14T10:00:00.000Z",
        id: "66666666-6666-4666-8666-666666666666",
        kind: "proof_bundle_manifest",
        summary: "Proof bundle incomplete: plan, test_report, pr_link.",
        taskId: null,
        uri: `pocket-cto://missions/${missionId}/proof-bundle-manifest`,
      },
      {
        createdAt: "2026-03-14T10:04:00.000Z",
        id: "77777777-7777-4777-8777-777777777777",
        kind: "diff_summary",
        summary: "Workspace changes touched apps/web and apps/control-plane.",
        taskId,
        uri: `pocket-cto://missions/${missionId}/tasks/${taskId}/diff-summary`,
      },
    ],
    liveControl: {
      enabled: true,
      limitation: "single_process_only",
      mode: "embedded_worker",
    },
  };
}

function buildMissionListPayload() {
  return {
    filters: {
      limit: 6,
      sourceKind: "github_issue",
      status: "queued",
    },
    missions: [
      {
        createdAt: "2026-03-14T10:00:00.000Z",
        id: missionId,
        latestTask: {
          id: taskId,
          role: "executor",
          sequence: 1,
          status: "running",
          updatedAt: "2026-03-14T10:05:00.000Z",
        },
        objectiveExcerpt: "Ship passkeys without breaking email login.",
        pendingApprovalCount: 1,
        primaryRepo: "web",
        proofBundleStatus: "incomplete",
        pullRequestNumber: 19,
        pullRequestUrl: "https://github.com/acme/web/pull/19",
        sourceKind: "github_issue",
        sourceRef: "https://github.com/acme/web/issues/19",
        status: "queued",
        title: "Implement passkeys for sign-in",
        updatedAt: "2026-03-14T10:05:00.000Z",
      },
      {
        createdAt: "2026-03-13T09:00:00.000Z",
        id: "44444444-4444-4444-8444-444444444444",
        latestTask: null,
        objectiveExcerpt: "Draft the rollback notes for a staged release.",
        pendingApprovalCount: 0,
        primaryRepo: "ops",
        proofBundleStatus: "placeholder",
        pullRequestNumber: null,
        pullRequestUrl: null,
        sourceKind: "github_issue",
        sourceRef: null,
        status: "queued",
        title: "Prepare rollback notes",
        updatedAt: "2026-03-13T09:00:00.000Z",
      },
    ],
  };
}
