import { afterEach, describe, expect, it, vi } from "vitest";

const missionId = "11111111-1111-4111-8111-111111111111";
const approvalId = "22222222-2222-4222-8222-222222222222";
const taskId = "33333333-3333-4333-8333-333333333333";

describe("web api module", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("parses mission detail with approvals and artifacts", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      async json() {
        return buildMissionDetailPayload();
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await import("./api");
    const detail = await mod.getMissionDetail(missionId);

    expect(detail).not.toBeNull();
    expect(detail?.approvals).toHaveLength(1);
    expect(detail?.artifacts.map((artifact) => artifact.kind)).toEqual([
      "proof_bundle_manifest",
      "diff_summary",
    ]);
    expect(detail?.liveControl.mode).toBe("embedded_worker");
    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:4000/missions/${missionId}`,
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

    const mod = await import("./api");

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
      `http://localhost:4000/approvals/${approvalId}/resolve`,
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
      `http://localhost:4000/tasks/${taskId}/interrupt`,
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

    const mod = await import("./api");

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
  });
});

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
      artifactIds: [
        "66666666-6666-4666-8666-666666666666",
        "77777777-7777-4777-8777-777777777777",
      ],
      changeSummary: "Updated the mission detail read model for approvals and artifacts.",
      decisionTrace: [
        "Executor task 1 produced diff_summary artifact 77777777-7777-4777-8777-777777777777.",
      ],
      missionId,
      objective: "Ship passkeys without breaking email login.",
      replayEventCount: 14,
      riskSummary: "Action controls still require embedded-worker mode.",
      rollbackSummary: "Disable the action panel and fall back to the API route surface.",
      status: "ready",
      verificationSummary: "API parsing and render tests cover the new view.",
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
    artifacts: [
      {
        createdAt: "2026-03-14T10:00:00.000Z",
        id: "66666666-6666-4666-8666-666666666666",
        kind: "proof_bundle_manifest",
        summary: "Proof bundle ready with 2 linked artifacts.",
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
