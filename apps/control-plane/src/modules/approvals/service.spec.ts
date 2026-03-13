import { describe, expect, it, vi } from "vitest";
import { EvidenceService } from "../evidence/service";
import { StubMissionCompiler } from "../missions/compiler";
import { InMemoryMissionRepository } from "../missions/repository";
import { MissionService } from "../missions/service";
import { ReplayService } from "../replay/service";
import { InMemoryReplayRepository } from "../replay/repository";
import type { InMemoryRuntimeSessionRegistry } from "../runtime-codex/live-session-registry";
import { ApprovalService } from "./service";
import { InMemoryApprovalRepository } from "./repository";

describe("ApprovalService", () => {
  it("records a durable continuation failure when approval delivery to the live session is lost", async () => {
    const missionRepository = new InMemoryMissionRepository();
    const approvalRepository = new InMemoryApprovalRepository();
    const replayService = new ReplayService(
      new InMemoryReplayRepository(),
      missionRepository,
    );
    const missionService = new MissionService(
      new StubMissionCompiler(),
      missionRepository,
      replayService,
      new EvidenceService(),
    );
    const liveSessionRegistry = {
      awaitApprovalResolution: vi.fn(),
      hasTaskSession: vi.fn(() => true),
      tryResolveApproval: vi.fn(() => ({
        delivered: false as const,
        error: new Error("Task live session disappeared before the response handoff"),
      })),
    } satisfies Pick<
      InMemoryRuntimeSessionRegistry,
      "awaitApprovalResolution" | "hasTaskSession" | "tryResolveApproval"
    >;
    const approvalService = new ApprovalService(
      approvalRepository,
      missionRepository,
      replayService,
      liveSessionRegistry,
    );

    const created = await missionService.createFromText({
      text: "Accept the approval, but lose the live continuation before resume",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const executorTask = created.tasks[1]!;

    await missionRepository.updateMissionStatus(created.mission.id, "awaiting_approval");
    await missionRepository.updateTaskStatus(executorTask.id, "awaiting_approval");

    const approval = await approvalRepository.createApproval({
      kind: "file_change",
      missionId: created.mission.id,
      payload: {
        details: {
          reason: "Need workspace write access",
        },
        itemId: "item_file_change_1",
        requestId: "approval_file_change_1",
        requestMethod: "item/fileChange/requestApproval",
        threadId: "thread_fake_123",
        turnId: "turn_fake_123",
      },
      requestedBy: "system",
      status: "pending",
      taskId: executorTask.id,
    });

    await expect(
      approvalService.resolveApproval({
        approvalId: approval.id,
        decision: "accept",
        rationale: "Approved, but the live handoff disappeared",
        resolvedBy: "operator",
      }),
    ).rejects.toThrow(
      "live runtime continuation could not be resumed",
    );

    const updatedApproval = await approvalRepository.getApprovalById(approval.id);
    const updatedTask = await missionRepository.getTaskById(executorTask.id);
    const updatedMission = await missionRepository.getMissionById(created.mission.id);
    const replay = await replayService.getMissionEvents(created.mission.id);

    expect(updatedApproval).toMatchObject({
      id: approval.id,
      status: "approved",
      payload: expect.objectContaining({
        liveContinuation: expect.objectContaining({
          errorMessage:
            "Task live session disappeared before the response handoff",
          status: "delivery_failed",
        }),
      }),
    });
    expect(updatedTask).toMatchObject({
      id: executorTask.id,
      status: "awaiting_approval",
    });
    expect(updatedMission).toMatchObject({
      id: created.mission.id,
      status: "awaiting_approval",
    });
    expect(replay).toContainEqual(
      expect.objectContaining({
        type: "approval.resolved",
        payload: expect.objectContaining({
          approvalId: approval.id,
          decision: "accept",
          status: "approved",
        }),
      }),
    );
    expect(replay).not.toContainEqual(
      expect.objectContaining({
        type: "task.status_changed",
        payload: {
          from: "awaiting_approval",
          to: "running",
          reason: "approval_resolved",
        },
      }),
    );
  });
});
