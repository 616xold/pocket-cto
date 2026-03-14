import type {
  CommandExecutionRequestApprovalParams,
  CommandExecutionRequestApprovalResponse,
  FileChangeRequestApprovalParams,
  FileChangeRequestApprovalResponse,
  JsonRpcId,
} from "@pocket-cto/codex-runtime";
import type {
  ApprovalDecision,
  ApprovalKind,
  ApprovalRecord,
  ApprovalStatus,
  MissionRecord,
  MissionTaskRecord,
  RuntimeApprovalRequestMethod,
} from "@pocket-cto/domain";
import type { PersistenceSession } from "../../lib/persistence";
import { MissionNotFoundError } from "../../lib/http-errors";
import {
  buildApprovalRequestedMissionStatusChangedPayload,
  buildApprovalResolvedMissionStatusChangedPayload,
} from "../missions/events";
import type { MissionRepository } from "../missions/repository";
import {
  buildTaskStatusChangedPayload,
  taskStatusChangeReasons,
} from "../orchestrator/events";
import type { ReplayService } from "../replay/service";
import type { InMemoryRuntimeSessionRegistry } from "../runtime-codex/live-session-registry";
import type { RuntimeCodexApprovalResponse } from "../runtime-codex/types";
import {
  buildApprovalRequestedPayload,
  buildApprovalResolvedPayload,
} from "./events";
import {
  ApprovalContinuationLostError,
  ApprovalNotFoundError,
  ApprovalNotPendingError,
} from "./errors";
import {
  readRuntimeApprovalPayload,
  withApprovalContinuationFailurePayload,
} from "./payload";
import type { ApprovalRepository } from "./repository";
import { UnsupportedPermissionsApprovalError } from "../runtime-codex/errors";

export type ResolveApprovalInput = {
  approvalId: string;
  decision: ApprovalDecision;
  rationale?: string | null;
  resolvedBy: string;
};

export type CancelPendingTaskApprovalsInput = {
  rationale?: string | null;
  resolvedBy: string;
  taskId: string;
};

export class ApprovalService {
  constructor(
    private readonly approvalRepository: ApprovalRepository,
    private readonly missionRepository: Pick<
      MissionRepository,
      | "getMissionById"
      | "getTaskById"
      | "transaction"
      | "updateMissionStatus"
      | "updateTaskStatus"
    >,
    private readonly replayService: Pick<ReplayService, "append">,
    private readonly liveSessionRegistry: Pick<
      InMemoryRuntimeSessionRegistry,
      | "awaitApprovalResolution"
      | "hasTaskSession"
      | "tryResolveApproval"
    >,
  ) {}

  async requestFileChangeApproval(
    input: {
      requestId: JsonRpcId;
      taskId: string;
    } & FileChangeRequestApprovalParams,
  ): Promise<FileChangeRequestApprovalResponse> {
    return this.requestRuntimeApproval({
      details: {
        grantRoot: input.grantRoot ?? null,
        reason: input.reason ?? null,
      },
      itemId: input.itemId,
      kind: "file_change",
      requestId: input.requestId,
      requestMethod: "item/fileChange/requestApproval",
      taskId: input.taskId,
      threadId: input.threadId,
      turnId: input.turnId,
    }) as Promise<FileChangeRequestApprovalResponse>;
  }

  async requestCommandExecutionApproval(
    input: {
      requestId: JsonRpcId;
      taskId: string;
    } & CommandExecutionRequestApprovalParams,
  ): Promise<CommandExecutionRequestApprovalResponse> {
    return this.requestRuntimeApproval({
      details: {
        additionalPermissions: input.additionalPermissions ?? null,
        approvalId: input.approvalId ?? null,
        availableDecisions: input.availableDecisions ?? null,
        command: input.command ?? null,
        commandActions: input.commandActions ?? null,
        cwd: input.cwd ?? null,
        networkApprovalContext: input.networkApprovalContext ?? null,
        proposedExecpolicyAmendment: input.proposedExecpolicyAmendment ?? null,
        proposedNetworkPolicyAmendments:
          input.proposedNetworkPolicyAmendments ?? null,
        reason: input.reason ?? null,
        skillMetadata: input.skillMetadata ?? null,
      },
      itemId: input.itemId,
      kind: mapCommandApprovalKind(input),
      requestId: input.requestId,
      requestMethod: "item/commandExecution/requestApproval",
      taskId: input.taskId,
      threadId: input.threadId,
      turnId: input.turnId,
    }) as Promise<CommandExecutionRequestApprovalResponse>;
  }

  async listMissionApprovals(missionId: string) {
    await this.getRequiredMission(missionId);
    return this.approvalRepository.listApprovalsByMissionId(missionId);
  }

  async resolveApproval(input: ResolveApprovalInput) {
    const resolution = await this.missionRepository.transaction(
      async (session) => {
        const approval = await this.getRequiredApproval(input.approvalId, session);
        const approvalContext = readRuntimeApprovalPayload(approval);

        if (approval.status !== "pending") {
          throw new ApprovalNotPendingError(approval.id, approval.status);
        }

        const nextStatus = mapDecisionToApprovalStatus(input.decision);
        const updated = await this.approvalRepository.updateApproval(
          {
            approvalId: approval.id,
            payload: {
              ...approval.payload,
              resolution: {
                decision: input.decision,
                rationale: input.rationale ?? null,
                resolvedBy: input.resolvedBy,
              },
            },
            rationale: input.rationale ?? null,
            resolvedBy: input.resolvedBy,
            status: nextStatus,
          },
          session,
        );

        await this.replayService.append(
          {
            actor: input.resolvedBy,
            missionId: updated.missionId,
            taskId: updated.taskId,
            type: "approval.resolved",
            payload: buildApprovalResolvedPayload({
              approvalId: updated.id,
              decision: input.decision,
              details: approvalContext.details,
              itemId: approvalContext.itemId,
              kind: updated.kind,
              missionId: updated.missionId,
              rationale: input.rationale ?? null,
              requestId: approvalContext.requestId,
              requestMethod: approvalContext.requestMethod,
              resolvedBy: input.resolvedBy,
              status: updated.status,
              taskId: approvalContext.taskId,
              threadId: approvalContext.threadId,
              turnId: approvalContext.turnId,
            }),
          },
          session,
        );

        return {
          approval: updated,
          approvalContext,
          shouldAttemptLiveDelivery: true,
          shouldResumeTaskAndMission: isAcceptedDecision(input.decision),
        };
      },
    );

    if (!resolution.shouldAttemptLiveDelivery) {
      return resolution.approval;
    }

    const liveDelivery = this.liveSessionRegistry.tryResolveApproval({
      approvalId: resolution.approval.id,
      response: buildRuntimeApprovalResponse(
        resolution.approvalContext.requestMethod,
        input.decision,
      ),
    });

    if (!liveDelivery.delivered) {
      const strandedApproval = await this.recordLiveContinuationFailure({
        approvalId: resolution.approval.id,
        errorMessage: liveDelivery.error.message,
      });

      throw new ApprovalContinuationLostError(
        strandedApproval,
        `Approval ${resolution.approval.id} was durably resolved as ${resolution.approval.status}, but the live runtime continuation could not be resumed: ${liveDelivery.error.message}`,
      );
    }

    if (resolution.shouldResumeTaskAndMission) {
      await this.resumeTaskAndMissionAfterDeliveredResolution(
        resolution.approval.missionId,
        resolution.approvalContext.taskId,
      );
    }

    return resolution.approval;
  }

  async cancelPendingApprovalsForTask(input: CancelPendingTaskApprovalsInput) {
    const approvalsToCancel = await this.approvalRepository.listPendingApprovalsByTaskId(
      input.taskId,
    );

    if (approvalsToCancel.length === 0) {
      return [];
    }

    const updatedApprovals = await this.missionRepository.transaction(
      async (session) => {
        const updated: ApprovalRecord[] = [];

        for (const approval of approvalsToCancel) {
          const approvalContext = readRuntimeApprovalPayload(approval);
          const nextPayload = {
            ...approval.payload,
            resolution: {
              decision: "cancel",
              rationale: input.rationale ?? null,
              resolvedBy: input.resolvedBy,
            },
          };
          const cancelledApproval = await this.approvalRepository.updateApproval(
            {
              approvalId: approval.id,
              payload: nextPayload,
              rationale: input.rationale ?? null,
              resolvedBy: input.resolvedBy,
              status: "cancelled",
            },
            session,
          );

          await this.replayService.append(
            {
              actor: input.resolvedBy,
              missionId: cancelledApproval.missionId,
              taskId: cancelledApproval.taskId,
              type: "approval.resolved",
              payload: buildApprovalResolvedPayload({
                approvalId: cancelledApproval.id,
                decision: "cancel",
                details: approvalContext.details,
                itemId: approvalContext.itemId,
                kind: cancelledApproval.kind,
                missionId: cancelledApproval.missionId,
                rationale: input.rationale ?? null,
                requestId: approvalContext.requestId,
                requestMethod: approvalContext.requestMethod,
                resolvedBy: input.resolvedBy,
                status: cancelledApproval.status,
                taskId: approvalContext.taskId,
                threadId: approvalContext.threadId,
                turnId: approvalContext.turnId,
              }),
            },
            session,
          );

          updated.push(cancelledApproval);
        }

        return updated;
      },
    );

    return Promise.all(
      updatedApprovals.map(async (approval) => {
        const delivery = this.liveSessionRegistry.tryResolveApproval({
          approvalId: approval.id,
          response: buildRuntimeApprovalResponse(
            readRuntimeApprovalPayload(approval).requestMethod,
            "cancel",
          ),
        });

        if (delivery.delivered) {
          return approval;
        }

        return this.recordLiveContinuationFailure({
          approvalId: approval.id,
          errorMessage: delivery.error.message,
        });
      }),
    );
  }

  private async requestRuntimeApproval(input: {
    details: Record<string, unknown>;
    itemId: string | null;
    kind: ApprovalKind;
    requestId: JsonRpcId;
    requestMethod: Extract<
      RuntimeApprovalRequestMethod,
      | "item/commandExecution/requestApproval"
      | "item/fileChange/requestApproval"
    >;
    taskId: string;
    threadId: string;
    turnId: string;
  }) {
    if (!this.liveSessionRegistry.hasTaskSession(input.taskId)) {
      throw new Error(
        `Task ${input.taskId} does not have a live runtime session for approval continuity`,
      );
    }

    const approval = await this.missionRepository.transaction(async (session) => {
      const task = await this.getRequiredTask(input.taskId, session);
      const mission = await this.getRequiredMission(task.missionId, session);
      const createdApproval = await this.approvalRepository.createApproval(
        {
          kind: input.kind,
          missionId: task.missionId,
          payload: {
            details: input.details,
            itemId: input.itemId,
            requestId: input.requestId,
            requestMethod: input.requestMethod,
            threadId: input.threadId,
            turnId: input.turnId,
          },
          requestedBy: "system",
          status: "pending",
          taskId: task.id,
        },
        session,
      );

      await this.replayService.append(
        {
          missionId: task.missionId,
          taskId: task.id,
          type: "approval.requested",
          payload: buildApprovalRequestedPayload({
            approvalId: createdApproval.id,
            details: input.details,
            itemId: input.itemId,
            kind: createdApproval.kind,
            missionId: task.missionId,
            requestId: input.requestId,
            requestMethod: input.requestMethod,
            taskId: task.id,
            threadId: input.threadId,
            turnId: input.turnId,
          }),
        },
        session,
      );

      if (task.status === "running") {
        const awaitingTask = await this.missionRepository.updateTaskStatus(
          task.id,
          "awaiting_approval",
          session,
        );

        await this.replayService.append(
          {
            missionId: task.missionId,
            taskId: task.id,
            type: "task.status_changed",
            payload: buildTaskStatusChangedPayload(
              task.status,
              awaitingTask.status,
              taskStatusChangeReasons.approvalRequested,
            ),
          },
          session,
        );
      }

      if (mission.status === "running") {
        const awaitingMission = await this.missionRepository.updateMissionStatus(
          mission.id,
          "awaiting_approval",
          session,
        );

        await this.replayService.append(
          {
            missionId: mission.id,
            type: "mission.status_changed",
            payload: buildApprovalRequestedMissionStatusChangedPayload(
              mission.status,
              awaitingMission.status,
            ),
          },
          session,
        );
      }

      return createdApproval;
    });

    return this.liveSessionRegistry.awaitApprovalResolution({
      approvalId: approval.id,
      method: input.requestMethod,
      requestId: input.requestId,
      taskId: input.taskId,
    });
  }

  private async resumeTaskAndMissionIfReady(
    mission: MissionRecord,
    task: MissionTaskRecord,
    session: PersistenceSession,
  ) {
    if (task.status === "awaiting_approval") {
      const runningTask = await this.missionRepository.updateTaskStatus(
        task.id,
        "running",
        session,
      );

      await this.replayService.append(
        {
          missionId: task.missionId,
          taskId: task.id,
          type: "task.status_changed",
          payload: buildTaskStatusChangedPayload(
            task.status,
            runningTask.status,
            taskStatusChangeReasons.approvalResolved,
          ),
        },
        session,
      );
    }

    const pendingMissionApprovals =
      await this.approvalRepository.countPendingApprovalsByMissionId(
        mission.id,
        session,
      );

    if (mission.status === "awaiting_approval" && pendingMissionApprovals === 0) {
      const runningMission = await this.missionRepository.updateMissionStatus(
        mission.id,
        "running",
        session,
      );

      await this.replayService.append(
        {
          missionId: mission.id,
          type: "mission.status_changed",
          payload: buildApprovalResolvedMissionStatusChangedPayload(
            mission.status,
            runningMission.status,
          ),
        },
        session,
      );
    }
  }

  private async resumeTaskAndMissionAfterDeliveredResolution(
    missionId: string,
    taskId: string,
  ) {
    await this.missionRepository.transaction(async (session) => {
      const task = await this.getRequiredTask(taskId, session);
      const mission = await this.getRequiredMission(missionId, session);

      await this.resumeTaskAndMissionIfReady(mission, task, session);
    });
  }

  private async recordLiveContinuationFailure(input: {
    approvalId: string;
    errorMessage: string;
  }) {
    return this.missionRepository.transaction(async (session) => {
      const approval = await this.getRequiredApproval(input.approvalId, session);

      return this.approvalRepository.updateApproval(
        {
          approvalId: approval.id,
          payload: withApprovalContinuationFailurePayload(approval, {
            attemptedAt: new Date().toISOString(),
            errorMessage: input.errorMessage,
          }),
          rationale: approval.rationale,
          resolvedBy: approval.resolvedBy,
          status: approval.status,
        },
        session,
      );
    });
  }

  private async getRequiredApproval(
    approvalId: string,
    session?: PersistenceSession,
  ) {
    const approval = await this.approvalRepository.getApprovalById(
      approvalId,
      session,
    );

    if (!approval) {
      throw new ApprovalNotFoundError(approvalId);
    }

    return approval;
  }

  private async getRequiredMission(
    missionId: string,
    session?: PersistenceSession,
  ) {
    const mission = await this.missionRepository.getMissionById(
      missionId,
      session,
    );

    if (!mission) {
      throw new MissionNotFoundError(missionId);
    }

    return mission;
  }

  private async getRequiredTask(taskId: string, session?: PersistenceSession) {
    const task = await this.missionRepository.getTaskById(taskId, session);

    if (!task) {
      throw new Error(`Task ${taskId} was not found`);
    }

    return task;
  }
}

function mapCommandApprovalKind(
  input: CommandExecutionRequestApprovalParams,
): ApprovalKind {
  if (
    input.networkApprovalContext ||
    input.additionalPermissions?.network ||
    (input.proposedNetworkPolicyAmendments?.length ?? 0) > 0
  ) {
    return "network_escalation";
  }

  return "command";
}

function mapDecisionToApprovalStatus(decision: ApprovalDecision): ApprovalStatus {
  switch (decision) {
    case "accept":
    case "accept_for_session":
      return "approved";
    case "decline":
      return "declined";
    case "cancel":
      return "cancelled";
  }
}

function isAcceptedDecision(decision: ApprovalDecision) {
  return decision === "accept" || decision === "accept_for_session";
}

function buildRuntimeApprovalResponse(
  requestMethod: RuntimeApprovalRequestMethod,
  decision: ApprovalDecision,
): RuntimeCodexApprovalResponse["response"] {
    switch (requestMethod) {
      case "item/fileChange/requestApproval":
        return {
          decision: mapDecisionToRuntimeDecision(decision),
      };
    case "item/commandExecution/requestApproval":
      return {
        decision: mapDecisionToRuntimeDecision(decision),
      };
      case "item/permissions/requestApproval":
        throw new UnsupportedPermissionsApprovalError();
    }
}

function mapDecisionToRuntimeDecision(decision: ApprovalDecision) {
  switch (decision) {
    case "accept":
      return "accept";
    case "accept_for_session":
      return "acceptForSession";
    case "decline":
      return "decline";
    case "cancel":
      return "cancel";
  }
}
