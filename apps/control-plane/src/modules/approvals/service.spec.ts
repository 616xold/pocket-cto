import type { ProofBundleManifest } from "@pocket-cto/domain";
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
        error: new Error(
          "Task live session disappeared before the response handoff",
        ),
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

    await missionRepository.updateMissionStatus(
      created.mission.id,
      "awaiting_approval",
    );
    await missionRepository.updateTaskStatus(
      executorTask.id,
      "awaiting_approval",
    );

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
    ).rejects.toThrow("live runtime continuation could not be resumed");

    const updatedApproval = await approvalRepository.getApprovalById(
      approval.id,
    );
    const updatedTask = await missionRepository.getTaskById(executorTask.id);
    const updatedMission = await missionRepository.getMissionById(
      created.mission.id,
    );
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

  it("persists and resolves lender-update release approvals without live runtime continuation", async () => {
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
    const refreshProofBundle = vi.fn(
      async (): Promise<ProofBundleManifest> =>
        buildProofBundleManifest(createdMissionId),
    );
    const liveSessionRegistry = {
      awaitApprovalResolution: vi.fn(),
      hasTaskSession: vi.fn(() => false),
      tryResolveApproval: vi.fn(() => ({
        delivered: true as const,
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
      {
        refreshProofBundle,
      },
    );
    const created = await missionService.createFromText({
      text: "Review lender update release approval posture",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const createdMissionId = created.mission.id;
    const payload = {
      missionId: createdMissionId,
      reportKind: "lender_update" as const,
      sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
      sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
      artifactId: "33333333-3333-4333-8333-333333333333",
      companyKey: "acme" as const,
      draftOnlyStatus: "draft_only" as const,
      summary: "Draft lender update for acme from the completed finance memo.",
      freshnessSummary: "Cash posture remains stale.",
      limitationsSummary:
        "This lender update remains delivery-free until review is completed.",
      resolution: null,
      releaseRecord: null,
    };

    const firstRequest = await approvalService.requestReportReleaseApproval({
      missionId: createdMissionId,
      payload,
      requestedBy: "finance-operator",
    });
    const secondRequest = await approvalService.requestReportReleaseApproval({
      missionId: created.mission.id,
      payload,
      requestedBy: "finance-operator",
    });

    expect(firstRequest.created).toBe(true);
    expect(secondRequest).toEqual({
      approval: firstRequest.approval,
      created: false,
    });

    const resolved = await approvalService.resolveApproval({
      approvalId: firstRequest.approval.id,
      decision: "accept",
      rationale: "Approved for release readiness.",
      resolvedBy: "finance-reviewer",
    });
    const replay = await replayService.getMissionEvents(createdMissionId);

    expect(resolved).toMatchObject({
      id: firstRequest.approval.id,
      kind: "report_release",
      rationale: "Approved for release readiness.",
      requestedBy: "finance-operator",
      resolvedBy: "finance-reviewer",
      status: "approved",
      taskId: null,
    });
    expect(liveSessionRegistry.tryResolveApproval).not.toHaveBeenCalled();
    expect(refreshProofBundle).toHaveBeenCalledWith({
      missionId: createdMissionId,
      trigger: "approval_resolution",
    });
    expect(replay).toContainEqual(
      expect.objectContaining({
        type: "approval.requested",
        payload: expect.objectContaining({
          approvalId: firstRequest.approval.id,
          kind: "report_release",
          requestMethod: null,
          taskId: null,
          threadId: null,
          turnId: null,
        }),
      }),
    );
    expect(replay).toContainEqual(
      expect.objectContaining({
        type: "approval.resolved",
        payload: expect.objectContaining({
          approvalId: firstRequest.approval.id,
          decision: "accept",
          kind: "report_release",
          requestMethod: null,
          status: "approved",
          taskId: null,
          threadId: null,
          turnId: null,
        }),
      }),
    );

    const approvedReuse = await approvalService.requestReportReleaseApproval({
      missionId: createdMissionId,
      payload,
      requestedBy: "finance-operator",
    });

    expect(approvedReuse).toEqual({
      approval: resolved,
      created: false,
    });
  });

  it("persists and resolves diligence-packet release approvals without live runtime continuation", async () => {
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
    const refreshProofBundle = vi.fn(
      async (): Promise<ProofBundleManifest> =>
        buildProofBundleManifest(createdMissionId, "diligence_packet"),
    );
    const liveSessionRegistry = {
      awaitApprovalResolution: vi.fn(),
      hasTaskSession: vi.fn(() => false),
      tryResolveApproval: vi.fn(() => ({
        delivered: true as const,
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
      {
        refreshProofBundle,
      },
    );
    const created = await missionService.createFromText({
      text: "Review diligence packet release approval posture",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const createdMissionId = created.mission.id;
    const payload = {
      missionId: createdMissionId,
      reportKind: "diligence_packet" as const,
      sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
      sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
      artifactId: "33333333-3333-4333-8333-333333333333",
      companyKey: "acme" as const,
      draftOnlyStatus: "draft_only" as const,
      summary:
        "Draft diligence packet for acme from the completed finance memo.",
      freshnessSummary: "Cash posture remains stale.",
      limitationsSummary:
        "This diligence packet remains delivery-free until review is completed.",
      resolution: null,
      releaseRecord: null,
    };

    const firstRequest = await approvalService.requestReportReleaseApproval({
      missionId: createdMissionId,
      payload,
      requestedBy: "finance-operator",
    });
    const secondRequest = await approvalService.requestReportReleaseApproval({
      missionId: created.mission.id,
      payload,
      requestedBy: "finance-operator",
    });

    expect(firstRequest.created).toBe(true);
    expect(secondRequest).toEqual({
      approval: firstRequest.approval,
      created: false,
    });

    const resolved = await approvalService.resolveApproval({
      approvalId: firstRequest.approval.id,
      decision: "accept",
      rationale: "Approved for release readiness.",
      resolvedBy: "finance-reviewer",
    });
    const replay = await replayService.getMissionEvents(createdMissionId);

    expect(resolved).toMatchObject({
      id: firstRequest.approval.id,
      kind: "report_release",
      rationale: "Approved for release readiness.",
      requestedBy: "finance-operator",
      resolvedBy: "finance-reviewer",
      status: "approved",
      taskId: null,
    });
    expect(liveSessionRegistry.tryResolveApproval).not.toHaveBeenCalled();
    expect(refreshProofBundle).toHaveBeenCalledWith({
      missionId: createdMissionId,
      trigger: "approval_resolution",
    });
    expect(replay).toContainEqual(
      expect.objectContaining({
        type: "approval.requested",
        payload: expect.objectContaining({
          approvalId: firstRequest.approval.id,
          kind: "report_release",
          requestMethod: null,
          taskId: null,
          threadId: null,
          turnId: null,
        }),
      }),
    );
    expect(replay).toContainEqual(
      expect.objectContaining({
        type: "approval.resolved",
        payload: expect.objectContaining({
          approvalId: firstRequest.approval.id,
          decision: "accept",
          kind: "report_release",
          requestMethod: null,
          status: "approved",
          taskId: null,
          threadId: null,
          turnId: null,
        }),
      }),
    );

    const approvedReuse = await approvalService.requestReportReleaseApproval({
      missionId: createdMissionId,
      payload,
      requestedBy: "finance-operator",
    });

    expect(approvedReuse).toEqual({
      approval: resolved,
      created: false,
    });
  });

  it("persists and resolves board-packet circulation approvals without live runtime continuation", async () => {
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
    const refreshProofBundle = vi.fn(
      async (): Promise<ProofBundleManifest> =>
        buildProofBundleManifest(createdMissionId, "board_packet"),
    );
    const liveSessionRegistry = {
      awaitApprovalResolution: vi.fn(),
      hasTaskSession: vi.fn(() => false),
      tryResolveApproval: vi.fn(() => ({
        delivered: true as const,
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
      {
        refreshProofBundle,
      },
    );
    const created = await missionService.createFromText({
      text: "Review board packet circulation approval posture",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const createdMissionId = created.mission.id;
    const payload = {
      missionId: createdMissionId,
      reportKind: "board_packet" as const,
      sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
      sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
      artifactId: "33333333-3333-4333-8333-333333333333",
      companyKey: "acme" as const,
      draftOnlyStatus: "draft_only" as const,
      summary: "Draft board packet for acme from the completed finance memo.",
      freshnessSummary: "Cash posture remains stale.",
      limitationsSummary:
        "This board packet remains delivery-free until review is completed.",
      resolution: null,
      circulationRecord: null,
      circulationCorrections: [],
    };

    const firstRequest = await approvalService.requestReportCirculationApproval({
      missionId: createdMissionId,
      payload,
      requestedBy: "finance-operator",
    });
    const secondRequest =
      await approvalService.requestReportCirculationApproval({
        missionId: created.mission.id,
        payload,
        requestedBy: "finance-operator",
      });

    expect(firstRequest.created).toBe(true);
    expect(secondRequest).toEqual({
      approval: firstRequest.approval,
      created: false,
    });

    const resolved = await approvalService.resolveApproval({
      approvalId: firstRequest.approval.id,
      decision: "accept",
      rationale: "Approved for internal circulation readiness.",
      resolvedBy: "finance-reviewer",
    });
    const replay = await replayService.getMissionEvents(createdMissionId);

    expect(resolved).toMatchObject({
      id: firstRequest.approval.id,
      kind: "report_circulation",
      rationale: "Approved for internal circulation readiness.",
      requestedBy: "finance-operator",
      resolvedBy: "finance-reviewer",
      status: "approved",
      taskId: null,
    });
    expect(liveSessionRegistry.tryResolveApproval).not.toHaveBeenCalled();
    expect(refreshProofBundle).toHaveBeenCalledWith({
      missionId: createdMissionId,
      trigger: "approval_resolution",
    });
    expect(replay).toContainEqual(
      expect.objectContaining({
        type: "approval.requested",
        payload: expect.objectContaining({
          approvalId: firstRequest.approval.id,
          kind: "report_circulation",
          requestMethod: null,
          taskId: null,
          threadId: null,
          turnId: null,
        }),
      }),
    );
    expect(replay).toContainEqual(
      expect.objectContaining({
        type: "approval.resolved",
        payload: expect.objectContaining({
          approvalId: firstRequest.approval.id,
          decision: "accept",
          kind: "report_circulation",
          requestMethod: null,
          status: "approved",
          taskId: null,
          threadId: null,
          turnId: null,
        }),
      }),
    );

    const approvedReuse =
      await approvalService.requestReportCirculationApproval({
        missionId: createdMissionId,
        payload,
        requestedBy: "finance-operator",
      });

    expect(approvedReuse).toEqual({
      approval: resolved,
      created: false,
    });
  });

  it("allows lender-update release approvals to be re-requested after decline or cancel while keeping pending requests idempotent", async () => {
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
    const refreshProofBundle = vi.fn(
      async (): Promise<ProofBundleManifest> =>
        buildProofBundleManifest(createdMissionId),
    );
    const liveSessionRegistry = {
      awaitApprovalResolution: vi.fn(),
      hasTaskSession: vi.fn(() => false),
      tryResolveApproval: vi.fn(() => ({
        delivered: true as const,
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
      {
        refreshProofBundle,
      },
    );
    const created = await missionService.createFromText({
      text: "Re-request lender update release approval after non-approval outcomes",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const createdMissionId = created.mission.id;
    const payload = {
      missionId: createdMissionId,
      reportKind: "lender_update" as const,
      sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
      sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
      artifactId: "33333333-3333-4333-8333-333333333333",
      companyKey: "acme" as const,
      draftOnlyStatus: "draft_only" as const,
      summary: "Draft lender update for acme from the completed finance memo.",
      freshnessSummary: "Cash posture remains stale.",
      limitationsSummary:
        "This lender update remains delivery-free until review is completed.",
      resolution: null,
      releaseRecord: null,
    };

    const firstRequest = await approvalService.requestReportReleaseApproval({
      missionId: createdMissionId,
      payload,
      requestedBy: "finance-operator",
    });
    const duplicatePending =
      await approvalService.requestReportReleaseApproval({
        missionId: createdMissionId,
        payload,
        requestedBy: "finance-operator",
      });

    expect(firstRequest.created).toBe(true);
    expect(duplicatePending).toEqual({
      approval: firstRequest.approval,
      created: false,
    });

    await approvalService.resolveApproval({
      approvalId: firstRequest.approval.id,
      decision: "decline",
      rationale: "Need clearer evidence before release.",
      resolvedBy: "finance-reviewer",
    });

    const secondRequest = await approvalService.requestReportReleaseApproval({
      missionId: createdMissionId,
      payload,
      requestedBy: "finance-operator",
    });
    const duplicateSecond =
      await approvalService.requestReportReleaseApproval({
        missionId: createdMissionId,
        payload,
        requestedBy: "finance-operator",
      });

    expect(secondRequest.created).toBe(true);
    expect(secondRequest.approval.id).not.toBe(firstRequest.approval.id);
    expect(duplicateSecond).toEqual({
      approval: secondRequest.approval,
      created: false,
    });

    await approvalService.resolveApproval({
      approvalId: secondRequest.approval.id,
      decision: "cancel",
      rationale: "Operator withdrew this review request.",
      resolvedBy: "finance-operator",
    });

    const thirdRequest = await approvalService.requestReportReleaseApproval({
      missionId: createdMissionId,
      payload,
      requestedBy: "finance-operator",
    });
    const approvals = await approvalRepository.listApprovalsByMissionId(
      createdMissionId,
    );

    expect(thirdRequest.created).toBe(true);
    expect(thirdRequest.approval.id).not.toBe(secondRequest.approval.id);
    expect(approvals.map((approval) => approval.status)).toEqual([
      "declined",
      "cancelled",
      "pending",
    ]);
  });

  it("allows board-packet circulation approvals to be re-requested after decline or cancel while keeping pending requests idempotent", async () => {
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
    const refreshProofBundle = vi.fn(
      async (): Promise<ProofBundleManifest> =>
        buildProofBundleManifest(createdMissionId, "board_packet"),
    );
    const liveSessionRegistry = {
      awaitApprovalResolution: vi.fn(),
      hasTaskSession: vi.fn(() => false),
      tryResolveApproval: vi.fn(() => ({
        delivered: true as const,
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
      {
        refreshProofBundle,
      },
    );
    const created = await missionService.createFromText({
      text: "Re-request board packet circulation approval after non-approval outcomes",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const createdMissionId = created.mission.id;
    const payload = {
      missionId: createdMissionId,
      reportKind: "board_packet" as const,
      sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
      sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
      artifactId: "33333333-3333-4333-8333-333333333333",
      companyKey: "acme" as const,
      draftOnlyStatus: "draft_only" as const,
      summary: "Draft board packet for acme from the completed finance memo.",
      freshnessSummary: "Cash posture remains stale.",
      limitationsSummary:
        "This board packet remains delivery-free until review is completed.",
      resolution: null,
      circulationRecord: null,
      circulationCorrections: [],
    };

    const firstRequest = await approvalService.requestReportCirculationApproval({
      missionId: createdMissionId,
      payload,
      requestedBy: "finance-operator",
    });
    const duplicatePending =
      await approvalService.requestReportCirculationApproval({
        missionId: createdMissionId,
        payload,
        requestedBy: "finance-operator",
      });

    expect(firstRequest.created).toBe(true);
    expect(duplicatePending).toEqual({
      approval: firstRequest.approval,
      created: false,
    });

    await approvalService.resolveApproval({
      approvalId: firstRequest.approval.id,
      decision: "decline",
      rationale: "Board materials need another draft before circulation review.",
      resolvedBy: "finance-reviewer",
    });

    const secondRequest =
      await approvalService.requestReportCirculationApproval({
        missionId: createdMissionId,
        payload,
        requestedBy: "finance-operator",
      });
    const duplicateSecond =
      await approvalService.requestReportCirculationApproval({
        missionId: createdMissionId,
        payload,
        requestedBy: "finance-operator",
      });

    expect(secondRequest.created).toBe(true);
    expect(secondRequest.approval.id).not.toBe(firstRequest.approval.id);
    expect(duplicateSecond).toEqual({
      approval: secondRequest.approval,
      created: false,
    });

    await approvalService.resolveApproval({
      approvalId: secondRequest.approval.id,
      decision: "cancel",
      rationale: "Operator withdrew this circulation review request.",
      resolvedBy: "finance-operator",
    });

    const thirdRequest =
      await approvalService.requestReportCirculationApproval({
        missionId: createdMissionId,
        payload,
        requestedBy: "finance-operator",
      });
    const approvals = await approvalRepository.listApprovalsByMissionId(
      createdMissionId,
    );

    expect(thirdRequest.created).toBe(true);
    expect(thirdRequest.approval.id).not.toBe(secondRequest.approval.id);
    expect(approvals.map((approval) => approval.status)).toEqual([
      "declined",
      "cancelled",
      "pending",
    ]);
  });

  it("records one circulation log on an approved board-packet circulation approval and replays it", async () => {
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
    const refreshProofBundle = vi.fn(
      async (): Promise<ProofBundleManifest> =>
        buildProofBundleManifest(createdMissionId, "board_packet"),
    );
    const liveSessionRegistry = {
      awaitApprovalResolution: vi.fn(),
      hasTaskSession: vi.fn(() => false),
      tryResolveApproval: vi.fn(() => ({
        delivered: true as const,
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
      {
        refreshProofBundle,
      },
    );
    const created = await missionService.createFromText({
      text: "Record one board packet as already circulated outside Pocket CFO",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const createdMissionId = created.mission.id;
    const payload = {
      missionId: createdMissionId,
      reportKind: "board_packet" as const,
      sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
      sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
      artifactId: "33333333-3333-4333-8333-333333333333",
      companyKey: "acme" as const,
      draftOnlyStatus: "draft_only" as const,
      summary: "Draft board packet for acme from the completed finance memo.",
      freshnessSummary: "Cash posture remains stale.",
      limitationsSummary:
        "This board packet remains delivery-free until review is completed.",
      resolution: null,
      circulationRecord: null,
      circulationCorrections: [],
    };
    const request = await approvalService.requestReportCirculationApproval({
      missionId: createdMissionId,
      payload,
      requestedBy: "finance-operator",
    });

    await approvalService.resolveApproval({
      approvalId: request.approval.id,
      decision: "accept",
      rationale: "Approved for internal circulation readiness.",
      resolvedBy: "finance-reviewer",
    });

    const logged = await approvalService.recordReportCirculationLog({
      approvalId: request.approval.id,
      circulationRecord: {
        circulatedAt: "2026-04-21T09:10:00.000Z",
        circulatedBy: "finance-operator",
        circulationChannel: "email",
        circulationNote: "Circulated from the finance mailbox after approval.",
        summary:
          "External circulation was logged by finance-operator at 2026-04-21T09:10:00.000Z via email. Circulation note: Circulated from the finance mailbox after approval.",
      },
    });
    const duplicate = await approvalService.recordReportCirculationLog({
      approvalId: request.approval.id,
      circulationRecord: {
        circulatedAt: "2026-04-21T09:10:00.000Z",
        circulatedBy: "finance-operator",
        circulationChannel: "email",
        circulationNote: "Circulated from the finance mailbox after approval.",
        summary:
          "External circulation was logged by finance-operator at 2026-04-21T09:10:00.000Z via email. Circulation note: Circulated from the finance mailbox after approval.",
      },
    });
    const updatedApproval = await approvalRepository.getApprovalById(
      request.approval.id,
    );
    const replay = await replayService.getMissionEvents(createdMissionId);

    expect(logged.created).toBe(true);
    expect(duplicate.created).toBe(false);
    expect(updatedApproval?.payload).toMatchObject({
      resolution: {
        decision: "accept",
        rationale: "Approved for internal circulation readiness.",
        resolvedBy: "finance-reviewer",
      },
      circulationRecord: {
        circulatedAt: "2026-04-21T09:10:00.000Z",
        circulatedBy: "finance-operator",
        circulationChannel: "email",
        circulationNote: "Circulated from the finance mailbox after approval.",
      },
    });
    expect(refreshProofBundle).toHaveBeenCalledTimes(1);
    expect(replay).toContainEqual(
      expect.objectContaining({
        type: "approval.circulation_logged",
        payload: expect.objectContaining({
          approvalId: request.approval.id,
          missionId: createdMissionId,
          circulationRecord: expect.objectContaining({
            circulatedAt: "2026-04-21T09:10:00.000Z",
            circulatedBy: "finance-operator",
            circulationChannel: "email",
          }),
        }),
      }),
    );
  });

  it("appends one board-packet circulation correction without mutating the original record", async () => {
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
    const refreshProofBundle = vi.fn(
      async (): Promise<ProofBundleManifest> =>
        buildProofBundleManifest(createdMissionId, "board_packet"),
    );
    const liveSessionRegistry = {
      awaitApprovalResolution: vi.fn(),
      hasTaskSession: vi.fn(() => false),
      tryResolveApproval: vi.fn(() => ({
        delivered: true as const,
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
      {
        refreshProofBundle,
      },
    );
    const created = await missionService.createFromText({
      text: "Correct one existing board packet circulation record",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const createdMissionId = created.mission.id;
    const payload = {
      missionId: createdMissionId,
      reportKind: "board_packet" as const,
      sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
      sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
      artifactId: "33333333-3333-4333-8333-333333333333",
      companyKey: "acme" as const,
      draftOnlyStatus: "draft_only" as const,
      summary: "Draft board packet for acme from the completed finance memo.",
      freshnessSummary: "Cash posture remains stale.",
      limitationsSummary:
        "This board packet remains delivery-free until review is completed.",
      resolution: null,
      circulationRecord: null,
      circulationCorrections: [],
    };
    const request = await approvalService.requestReportCirculationApproval({
      missionId: createdMissionId,
      payload,
      requestedBy: "finance-operator",
    });

    await approvalService.resolveApproval({
      approvalId: request.approval.id,
      decision: "accept",
      rationale: "Approved for internal circulation readiness.",
      resolvedBy: "finance-reviewer",
    });

    await approvalService.recordReportCirculationLog({
      approvalId: request.approval.id,
      circulationRecord: {
        circulatedAt: "2026-04-21T09:10:00.000Z",
        circulatedBy: "finance-operator",
        circulationChannel: "email",
        circulationNote: "Circulated from the finance mailbox after approval.",
        summary:
          "External circulation was logged by finance-operator at 2026-04-21T09:10:00.000Z via email. Circulation note: Circulated from the finance mailbox after approval.",
      },
    });

    const correction = {
      correctionKey: "board-packet-correction-1",
      correctedAt: "2026-04-21T09:20:00.000Z",
      correctedBy: "finance-operator",
      correctionReason:
        "Corrected the original send timestamp after mailbox review",
      circulatedAt: "2026-04-21T09:12:00.000Z",
      circulatedBy: "board-chair@example.com",
      circulationChannel: null,
      circulationNote: "Corrected after finance mailbox audit.",
      summary:
        "Circulation record correction was appended by finance-operator at 2026-04-21T09:20:00.000Z. Corrected values: circulatedAt -> 2026-04-21T09:12:00.000Z; circulatedBy -> board-chair@example.com; circulationNote -> Corrected after finance mailbox audit.. Reason: Corrected the original send timestamp after mailbox review.",
    };
    const recorded = await approvalService.recordReportCirculationLogCorrection({
      approvalId: request.approval.id,
      circulationCorrection: correction,
    });
    const duplicate =
      await approvalService.recordReportCirculationLogCorrection({
        approvalId: request.approval.id,
        circulationCorrection: correction,
      });
    const updatedApproval = await approvalRepository.getApprovalById(
      request.approval.id,
    );
    const replay = await replayService.getMissionEvents(createdMissionId);

    expect(recorded.created).toBe(true);
    expect(duplicate.created).toBe(false);
    expect(updatedApproval?.payload).toMatchObject({
      circulationRecord: {
        circulatedAt: "2026-04-21T09:10:00.000Z",
        circulatedBy: "finance-operator",
        circulationChannel: "email",
        circulationNote: "Circulated from the finance mailbox after approval.",
      },
      circulationCorrections: [
        expect.objectContaining({
          correctionKey: "board-packet-correction-1",
          correctedAt: "2026-04-21T09:20:00.000Z",
          circulatedAt: "2026-04-21T09:12:00.000Z",
          circulatedBy: "board-chair@example.com",
          circulationChannel: null,
          circulationNote: "Corrected after finance mailbox audit.",
        }),
      ],
    });
    expect(replay).toContainEqual(
      expect.objectContaining({
        type: "approval.circulation_log_corrected",
        payload: expect.objectContaining({
          approvalId: request.approval.id,
          correctionCount: 1,
          missionId: createdMissionId,
          circulationCorrection: expect.objectContaining({
            correctionKey: "board-packet-correction-1",
            correctedAt: "2026-04-21T09:20:00.000Z",
          }),
        }),
      }),
    );
  });

  it("records one release log on an approved lender-update release approval and replays it", async () => {
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
    const refreshProofBundle = vi.fn(
      async (): Promise<ProofBundleManifest> =>
        buildProofBundleManifest(createdMissionId),
    );
    const liveSessionRegistry = {
      awaitApprovalResolution: vi.fn(),
      hasTaskSession: vi.fn(() => false),
      tryResolveApproval: vi.fn(() => ({
        delivered: true as const,
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
      {
        refreshProofBundle,
      },
    );
    const created = await missionService.createFromText({
      text: "Record one lender update as already released outside Pocket CFO",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const createdMissionId = created.mission.id;
    const payload = {
      missionId: createdMissionId,
      reportKind: "lender_update" as const,
      sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
      sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
      artifactId: "33333333-3333-4333-8333-333333333333",
      companyKey: "acme" as const,
      draftOnlyStatus: "draft_only" as const,
      summary: "Draft lender update for acme from the completed finance memo.",
      freshnessSummary: "Cash posture remains stale.",
      limitationsSummary:
        "This lender update remains delivery-free until review is completed.",
      resolution: null,
      releaseRecord: null,
    };
    const request = await approvalService.requestReportReleaseApproval({
      missionId: createdMissionId,
      payload,
      requestedBy: "finance-operator",
    });

    await approvalService.resolveApproval({
      approvalId: request.approval.id,
      decision: "accept",
      rationale: "Approved for release readiness.",
      resolvedBy: "finance-reviewer",
    });

    const logged = await approvalService.recordReportReleaseLog({
      approvalId: request.approval.id,
      releaseRecord: {
        releasedAt: "2026-04-20T09:10:00.000Z",
        releasedBy: "finance-operator",
        releaseChannel: "email",
        releaseNote: "Sent from the treasury mailbox after approval.",
        summary:
          "External release was logged by finance-operator at 2026-04-20T09:10:00.000Z via email. Release note: Sent from the treasury mailbox after approval..",
      },
    });
    const duplicate = await approvalService.recordReportReleaseLog({
      approvalId: request.approval.id,
      releaseRecord: {
        releasedAt: "2026-04-20T09:10:00.000Z",
        releasedBy: "finance-operator",
        releaseChannel: "email",
        releaseNote: "Sent from the treasury mailbox after approval.",
        summary:
          "External release was logged by finance-operator at 2026-04-20T09:10:00.000Z via email. Release note: Sent from the treasury mailbox after approval..",
      },
    });
    const updatedApproval = await approvalRepository.getApprovalById(
      request.approval.id,
    );
    const replay = await replayService.getMissionEvents(createdMissionId);

    expect(logged.created).toBe(true);
    expect(duplicate.created).toBe(false);
    expect(updatedApproval?.payload).toMatchObject({
      resolution: {
        decision: "accept",
        rationale: "Approved for release readiness.",
        resolvedBy: "finance-reviewer",
      },
      releaseRecord: {
        releasedAt: "2026-04-20T09:10:00.000Z",
        releasedBy: "finance-operator",
        releaseChannel: "email",
        releaseNote: "Sent from the treasury mailbox after approval.",
      },
    });
    expect(refreshProofBundle).toHaveBeenCalledTimes(1);
    expect(replay).toContainEqual(
      expect.objectContaining({
        type: "approval.release_logged",
        payload: expect.objectContaining({
          approvalId: request.approval.id,
          missionId: createdMissionId,
          releaseRecord: expect.objectContaining({
            releasedAt: "2026-04-20T09:10:00.000Z",
            releasedBy: "finance-operator",
            releaseChannel: "email",
          }),
        }),
      }),
    );
  });

  it("records one release log on an approved diligence-packet release approval and replays it", async () => {
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
    const refreshProofBundle = vi.fn(
      async (): Promise<ProofBundleManifest> =>
        buildProofBundleManifest(createdMissionId, "diligence_packet"),
    );
    const liveSessionRegistry = {
      awaitApprovalResolution: vi.fn(),
      hasTaskSession: vi.fn(() => false),
      tryResolveApproval: vi.fn(() => ({
        delivered: true as const,
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
      {
        refreshProofBundle,
      },
    );
    const created = await missionService.createFromText({
      text: "Record one diligence packet as already released outside Pocket CFO",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const createdMissionId = created.mission.id;
    const payload = {
      missionId: createdMissionId,
      reportKind: "diligence_packet" as const,
      sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
      sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
      artifactId: "33333333-3333-4333-8333-333333333333",
      companyKey: "acme" as const,
      draftOnlyStatus: "draft_only" as const,
      summary: "Draft diligence packet for acme from the completed finance memo.",
      freshnessSummary: "Cash posture remains stale.",
      limitationsSummary:
        "This diligence packet remains delivery-free until review is completed.",
      resolution: null,
      releaseRecord: null,
    };
    const request = await approvalService.requestReportReleaseApproval({
      missionId: createdMissionId,
      payload,
      requestedBy: "finance-operator",
    });

    await approvalService.resolveApproval({
      approvalId: request.approval.id,
      decision: "accept",
      rationale: "Approved for release readiness.",
      resolvedBy: "finance-reviewer",
    });

    const logged = await approvalService.recordReportReleaseLog({
      approvalId: request.approval.id,
      releaseRecord: {
        releasedAt: "2026-04-21T09:10:00.000Z",
        releasedBy: "finance-operator",
        releaseChannel: "secure_portal",
        releaseNote: "Released after diligence counsel review.",
        summary:
          "External release was logged by finance-operator at 2026-04-21T09:10:00.000Z via secure_portal. Release note: Released after diligence counsel review..",
      },
    });
    const duplicate = await approvalService.recordReportReleaseLog({
      approvalId: request.approval.id,
      releaseRecord: {
        releasedAt: "2026-04-21T09:10:00.000Z",
        releasedBy: "finance-operator",
        releaseChannel: "secure_portal",
        releaseNote: "Released after diligence counsel review.",
        summary:
          "External release was logged by finance-operator at 2026-04-21T09:10:00.000Z via secure_portal. Release note: Released after diligence counsel review..",
      },
    });
    const updatedApproval = await approvalRepository.getApprovalById(
      request.approval.id,
    );
    const replay = await replayService.getMissionEvents(createdMissionId);

    expect(logged.created).toBe(true);
    expect(duplicate.created).toBe(false);
    expect(updatedApproval?.payload).toMatchObject({
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
      },
    });
    expect(refreshProofBundle).toHaveBeenCalledTimes(1);
    expect(replay).toContainEqual(
      expect.objectContaining({
        type: "approval.release_logged",
        payload: expect.objectContaining({
          approvalId: request.approval.id,
          missionId: createdMissionId,
          releaseRecord: expect.objectContaining({
            releasedAt: "2026-04-21T09:10:00.000Z",
            releasedBy: "finance-operator",
            releaseChannel: "secure_portal",
          }),
        }),
      }),
    );
  });
});

function buildProofBundleManifest(
  missionId: string,
  reportKind: "board_packet" | "lender_update" | "diligence_packet" =
    "lender_update",
): ProofBundleManifest {
  const reportLabel =
    reportKind === "board_packet"
      ? "board packet"
      : reportKind === "lender_update"
        ? "lender update"
        : "diligence packet";

  return {
    missionId,
    missionTitle: `Draft ${reportLabel} for acme`,
    objective: `Compile one draft ${reportLabel} from stored finance evidence.`,
    sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
    sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
    companyKey: "acme",
    questionKind: "cash_posture",
    policySourceId: null,
    policySourceScope: null,
    answerSummary: "",
    reportKind,
    reportDraftStatus: "draft_only",
    reportPublication: null,
    circulationRecord: null,
    circulationChronology: null,
    circulationReadiness: null,
    releaseRecord: null,
    releaseReadiness: null,
    reportSummary:
      reportKind === "lender_update"
        ? "Draft lender update for acme from the completed finance memo."
        : "Draft diligence packet for acme from the completed finance memo.",
    appendixPresent: false,
    freshnessState: "stale",
    freshnessSummary: "Cash posture remains stale.",
    limitationsSummary:
      reportKind === "lender_update"
        ? "This lender update remains delivery-free until review is completed."
        : "This diligence packet remains delivery-free until review is completed.",
    relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
    relatedWikiPageKeys: ["metrics/cash-posture"],
    targetRepoFullName: null,
    branchName: null,
    pullRequestNumber: null,
    pullRequestUrl: null,
    changeSummary: `Stored ${reportLabel} remains in draft-only posture.`,
    validationSummary: "",
    verificationSummary:
      `Review the stored ${reportLabel} and linked proof bundle.`,
    riskSummary: "",
    rollbackSummary: "",
    latestApproval: null,
    evidenceCompleteness: {
      status: "complete",
      expectedArtifactKinds: [reportKind],
      presentArtifactKinds: [reportKind],
      missingArtifactKinds: [],
      notes: [],
    },
    decisionTrace: [],
    artifactIds: [],
    artifacts: [],
    replayEventCount: 0,
    timestamps: {
      missionCreatedAt: "2026-04-20T09:00:00.000Z",
      latestPlannerEvidenceAt: null,
      latestExecutorEvidenceAt: null,
      latestPullRequestAt: null,
      latestApprovalAt: null,
      latestArtifactAt: "2026-04-20T09:00:00.000Z",
    },
    status: "ready",
  };
}
