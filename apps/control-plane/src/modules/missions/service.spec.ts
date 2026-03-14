import { describe, expect, it } from "vitest";
import type { ApprovalRecord } from "@pocket-cto/domain";
import { InMemoryMissionRepository } from "./repository";
import { StubMissionCompiler } from "./compiler";
import { InMemoryReplayRepository } from "../replay/repository";
import { ReplayService } from "../replay/service";
import { EvidenceService } from "../evidence/service";
import { MissionService } from "./service";

function createService(options?: { approvals?: ApprovalRecord[] }) {
  const repository = new InMemoryMissionRepository();
  const replayRepository = new InMemoryReplayRepository();
  const replayService = new ReplayService(replayRepository, repository);
  const evidenceService = new EvidenceService();
  const compiler = new StubMissionCompiler();

  return {
    replayService,
    repository,
    service: new MissionService(
      compiler,
      repository,
      replayService,
      evidenceService,
      {
        approvalReader: {
          async listMissionApprovals() {
            return options?.approvals ?? [];
          },
        },
      },
    ),
  };
}

describe("MissionService", () => {
  it("creates a mission, tasks, and replay events from text", async () => {
    const { service, replayService } = createService();

    const created = await service.createFromText({
      text: "Implement passkeys for sign-in",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });

    expect(created.mission.title).toContain("Implement passkeys");
    expect(created.mission.status).toBe("queued");
    expect(created.tasks.length).toBe(2);
    expect(created.proofBundle.status).toBe("placeholder");

    const events = await replayService.listByMissionId(created.mission.id);
    expect(events.map((event) => event.type)).toEqual([
      "mission.created",
      "task.created",
      "task.created",
      "mission.status_changed",
      "artifact.created",
    ]);
    expect(events.map((event) => event.sequence)).toEqual([1, 2, 3, 4, 5]);
    expect(events[3]?.payload).toEqual({
      from: "planned",
      to: "queued",
      reason: "tasks_materialized",
    });
  });

  it("returns summary-shaped approvals and artifacts in mission detail", async () => {
    const approval: ApprovalRecord = {
      createdAt: "2026-03-14T10:00:00.000Z",
      id: "44444444-4444-4444-8444-444444444444",
      kind: "file_change",
      missionId: "11111111-1111-4111-8111-111111111111",
      payload: {
        requestId: "approval_file_change_1",
      },
      rationale: null,
      requestedBy: "system",
      resolvedBy: null,
      status: "pending",
      taskId: "33333333-3333-4333-8333-333333333333",
      updatedAt: "2026-03-14T10:00:00.000Z",
    };
    const { repository, service } = createService({
      approvals: [approval],
    });
    const created = await service.createFromText({
      text: "Implement passkeys for sign-in",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const executorTask = created.tasks.find((task) => task.role === "executor");

    expect(executorTask).toBeDefined();

    await repository.saveArtifact({
      kind: "diff_summary",
      metadata: {
        summary: "Workspace changes touched README.md and apps/web/lib/api.ts.",
      },
      missionId: created.mission.id,
      mimeType: "text/markdown",
      taskId: executorTask?.id,
      uri: `pocket-cto://missions/${created.mission.id}/tasks/${executorTask?.id}/diff-summary`,
    });

    const detail = await service.getMissionDetail(created.mission.id);

    expect(detail.approvals).toEqual([
      {
        createdAt: "2026-03-14T10:00:00.000Z",
        id: "44444444-4444-4444-8444-444444444444",
        kind: "file_change",
        rationale: null,
        requestedBy: "system",
        resolvedBy: null,
        status: "pending",
        updatedAt: "2026-03-14T10:00:00.000Z",
      },
    ]);
    expect(detail.artifacts.map((artifact) => artifact.kind).sort()).toEqual([
      "diff_summary",
      "proof_bundle_manifest",
    ]);
    expect(
      detail.artifacts.find((artifact) => artifact.kind === "diff_summary")
        ?.summary,
    ).toContain("README.md");
  });
});
