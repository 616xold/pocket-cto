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
  ReportCirculationApprovalCirculationCorrection,
  ReportCirculationApprovalCirculationRecord,
  ReportCirculationApprovalPayload,
  ReportReleaseApprovalPayload,
  ReportReleaseApprovalReleaseRecord,
  RuntimeApprovalRequestMethod,
} from "@pocket-cto/domain";
import type { PersistenceSession } from "../../lib/persistence";
import { AppHttpError, MissionNotFoundError } from "../../lib/http-errors";
import {
  buildApprovalRequestedMissionStatusChangedPayload,
  buildApprovalResolvedMissionStatusChangedPayload,
} from "../missions/events";
import type { MissionRepository } from "../missions/repository";
import type { ProofBundleAssemblyService } from "../evidence/proof-bundle-assembly";
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
  readReportCirculationApprovalPayload,
  readReportReleaseApprovalPayload,
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

export type RequestReportReleaseApprovalInput = {
  missionId: string;
  payload: ReportReleaseApprovalPayload;
  requestedBy: string;
};

export type RequestReportReleaseApprovalResult = {
  approval: ApprovalRecord;
  created: boolean;
};

export type RequestReportCirculationApprovalInput = {
  missionId: string;
  payload: ReportCirculationApprovalPayload;
  requestedBy: string;
};

export type RequestReportCirculationApprovalResult = {
  approval: ApprovalRecord;
  created: boolean;
};

export type RecordReportReleaseLogInput = {
  approvalId: string;
  releaseRecord: ReportReleaseApprovalReleaseRecord;
};

export type RecordReportReleaseLogResult = {
  approval: ApprovalRecord;
  created: boolean;
};

export type RecordReportCirculationLogInput = {
  approvalId: string;
  circulationRecord: ReportCirculationApprovalCirculationRecord;
};

export type RecordReportCirculationLogResult = {
  approval: ApprovalRecord;
  created: boolean;
};

export type RecordReportCirculationLogCorrectionInput = {
  approvalId: string;
  circulationCorrection: ReportCirculationApprovalCirculationCorrection;
};

export type RecordReportCirculationLogCorrectionResult = {
  approval: ApprovalRecord;
  created: boolean;
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
      "awaitApprovalResolution" | "hasTaskSession" | "tryResolveApproval"
    >,
    private readonly proofBundleAssembly?: Pick<
      ProofBundleAssemblyService,
      "refreshProofBundle"
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

  async getApprovalById(approvalId: string) {
    return this.getRequiredApproval(approvalId);
  }

  async requestReportReleaseApproval(
    input: RequestReportReleaseApprovalInput,
  ): Promise<RequestReportReleaseApprovalResult> {
    if (input.payload.missionId !== input.missionId) {
      throw invalidRequest(
        "missionId",
        "The report release approval payload must target the same mission as the request route.",
      );
    }

    return this.missionRepository.transaction(async (session) => {
      await this.getRequiredMission(input.missionId, session);
      const approvals = await this.approvalRepository.listApprovalsByMissionId(
        input.missionId,
        session,
      );
      const existingApproval = readExistingFinanceReportApprovalForRequest(
        approvals,
        "report_release",
      );

      if (existingApproval) {
        return {
          approval: existingApproval,
          created: false,
        };
      }

      const createdApproval = await this.approvalRepository.createApproval(
        {
          kind: "report_release",
          missionId: input.missionId,
          payload: input.payload,
          requestedBy: input.requestedBy,
          status: "pending",
          taskId: null,
        },
        session,
      );

      await this.replayService.append(
        {
          actor: input.requestedBy,
          missionId: input.missionId,
          taskId: null,
          type: "approval.requested",
          payload: buildApprovalRequestedPayload({
            approvalId: createdApproval.id,
            details: input.payload,
            itemId: null,
            kind: createdApproval.kind,
            missionId: input.missionId,
            requestId: null,
            requestMethod: null,
            taskId: null,
            threadId: null,
            turnId: null,
          }),
        },
        session,
      );

      return {
        approval: createdApproval,
        created: true,
      };
    });
  }

  async requestReportCirculationApproval(
    input: RequestReportCirculationApprovalInput,
  ): Promise<RequestReportCirculationApprovalResult> {
    if (input.payload.missionId !== input.missionId) {
      throw invalidRequest(
        "missionId",
        "The report circulation approval payload must target the same mission as the request route.",
      );
    }

    return this.missionRepository.transaction(async (session) => {
      await this.getRequiredMission(input.missionId, session);
      const approvals = await this.approvalRepository.listApprovalsByMissionId(
        input.missionId,
        session,
      );
      const existingApproval = readExistingFinanceReportApprovalForRequest(
        approvals,
        "report_circulation",
      );

      if (existingApproval) {
        return {
          approval: existingApproval,
          created: false,
        };
      }

      const createdApproval = await this.approvalRepository.createApproval(
        {
          kind: "report_circulation",
          missionId: input.missionId,
          payload: input.payload,
          requestedBy: input.requestedBy,
          status: "pending",
          taskId: null,
        },
        session,
      );

      await this.replayService.append(
        {
          actor: input.requestedBy,
          missionId: input.missionId,
          taskId: null,
          type: "approval.requested",
          payload: buildApprovalRequestedPayload({
            approvalId: createdApproval.id,
            details: input.payload,
            itemId: null,
            kind: createdApproval.kind,
            missionId: input.missionId,
            requestId: null,
            requestMethod: null,
            taskId: null,
            threadId: null,
            turnId: null,
          }),
        },
        session,
      );

      return {
        approval: createdApproval,
        created: true,
      };
    });
  }

  async recordReportReleaseLog(
    input: RecordReportReleaseLogInput,
  ): Promise<RecordReportReleaseLogResult> {
    return this.missionRepository.transaction(async (session) => {
      const approval = await this.getRequiredApproval(
        input.approvalId,
        session,
      );

      if (approval.kind !== "report_release") {
        throw invalidRequest(
          "approvalId",
          `Approval ${approval.id} is ${approval.kind}, not report_release.`,
        );
      }

      if (approval.status !== "approved") {
        throw invalidRequest(
          "approvalId",
          `Approval ${approval.id} must already be approved before external release can be logged.`,
        );
      }

      const payload = readReportReleaseApprovalPayload(approval);

      if (payload.releaseRecord) {
        return {
          approval,
          created: false,
        };
      }

      const updated = await this.approvalRepository.updateApproval(
        {
          approvalId: approval.id,
          payload: {
            ...approval.payload,
            releaseRecord: input.releaseRecord,
          },
          rationale: approval.rationale,
          resolvedBy: approval.resolvedBy,
          status: approval.status,
        },
        session,
      );

      await this.replayService.append(
        {
          actor: input.releaseRecord.releasedBy,
          missionId: updated.missionId,
          taskId: null,
          type: "approval.release_logged",
          payload: {
            approvalId: updated.id,
            missionId: updated.missionId,
            releaseRecord: input.releaseRecord,
          },
        },
        session,
      );

      return {
        approval: updated,
        created: true,
      };
    });
  }

  async recordReportCirculationLog(
    input: RecordReportCirculationLogInput,
  ): Promise<RecordReportCirculationLogResult> {
    return this.missionRepository.transaction(async (session) => {
      const approval = await this.getRequiredApproval(
        input.approvalId,
        session,
      );

      if (approval.kind !== "report_circulation") {
        throw invalidRequest(
          "approvalId",
          `Approval ${approval.id} is ${approval.kind}, not report_circulation.`,
        );
      }

      if (approval.status !== "approved") {
        throw invalidRequest(
          "approvalId",
          `Approval ${approval.id} must already be approved before external circulation can be logged.`,
        );
      }

      const payload = readReportCirculationApprovalPayload(approval);

      if (payload.circulationRecord) {
        return {
          approval,
          created: false,
        };
      }

      const updated = await this.approvalRepository.updateApproval(
        {
          approvalId: approval.id,
          payload: {
            ...approval.payload,
            circulationRecord: input.circulationRecord,
          },
          rationale: approval.rationale,
          resolvedBy: approval.resolvedBy,
          status: approval.status,
        },
        session,
      );

      await this.replayService.append(
        {
          actor: input.circulationRecord.circulatedBy,
          missionId: updated.missionId,
          taskId: null,
          type: "approval.circulation_logged",
          payload: {
            approvalId: updated.id,
            circulationRecord: input.circulationRecord,
            missionId: updated.missionId,
          },
        },
        session,
      );

      return {
        approval: updated,
        created: true,
      };
    });
  }

  async recordReportCirculationLogCorrection(
    input: RecordReportCirculationLogCorrectionInput,
  ): Promise<RecordReportCirculationLogCorrectionResult> {
    return this.missionRepository.transaction(async (session) => {
      const approval = await this.getRequiredApproval(
        input.approvalId,
        session,
      );

      if (approval.kind !== "report_circulation") {
        throw invalidRequest(
          "approvalId",
          `Approval ${approval.id} is ${approval.kind}, not report_circulation.`,
        );
      }

      if (approval.status !== "approved") {
        throw invalidRequest(
          "approvalId",
          `Approval ${approval.id} must already be approved before a circulation correction can be logged.`,
        );
      }

      const payload = readReportCirculationApprovalPayload(approval);

      if (!payload.circulationRecord) {
        throw invalidRequest(
          "approvalId",
          `Approval ${approval.id} does not yet store the original circulation record required before corrections can append chronology.`,
        );
      }

      const existingCorrection = payload.circulationCorrections.find(
        (correction) =>
          correction.correctionKey ===
          input.circulationCorrection.correctionKey,
      );

      if (existingCorrection) {
        if (
          reportCirculationCorrectionEquals(
            existingCorrection,
            input.circulationCorrection,
          )
        ) {
          return {
            approval,
            created: false,
          };
        }

        throw invalidRequest(
          "approvalId",
          `Approval ${approval.id} already stores a different circulation correction for correctionKey ${input.circulationCorrection.correctionKey}.`,
        );
      }

      const circulationCorrections = [
        ...payload.circulationCorrections,
        input.circulationCorrection,
      ];
      const updated = await this.approvalRepository.updateApproval(
        {
          approvalId: approval.id,
          payload: {
            ...payload,
            circulationCorrections,
          },
          rationale: approval.rationale,
          resolvedBy: approval.resolvedBy,
          status: approval.status,
        },
        session,
      );

      await this.replayService.append(
        {
          actor: input.circulationCorrection.correctedBy,
          missionId: updated.missionId,
          taskId: null,
          type: "approval.circulation_log_corrected",
          payload: {
            approvalId: updated.id,
            circulationCorrection: input.circulationCorrection,
            correctionCount: circulationCorrections.length,
            missionId: updated.missionId,
          },
        },
        session,
      );

      return {
        approval: updated,
        created: true,
      };
    });
  }

  async resolveApproval(input: ResolveApprovalInput) {
    const resolution = await this.missionRepository.transaction(
      async (session) => {
        const approval = await this.getRequiredApproval(
          input.approvalId,
          session,
        );

        if (approval.status !== "pending") {
          throw new ApprovalNotPendingError(approval.id, approval.status);
        }

        if (
          (approval.kind === "report_release" ||
            approval.kind === "report_circulation") &&
          input.decision === "accept_for_session"
        ) {
          throw invalidRequest(
            "decision",
            `${approval.kind === "report_release" ? "Report release" : "Report circulation"} approvals do not support \`accept_for_session\`; use \`accept\`, \`decline\`, or \`cancel\`.`,
          );
        }

        const nextStatus = mapDecisionToApprovalStatus(input.decision);

        if (
          approval.kind === "report_release" ||
          approval.kind === "report_circulation"
        ) {
          const approvalContext =
            approval.kind === "report_release"
              ? readReportReleaseApprovalPayload(approval)
              : readReportCirculationApprovalPayload(approval);
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
              taskId: null,
              type: "approval.resolved",
              payload: buildApprovalResolvedPayload({
                approvalId: updated.id,
                decision: input.decision,
                details: approvalContext,
                itemId: null,
                kind: updated.kind,
                missionId: updated.missionId,
                rationale: input.rationale ?? null,
                requestId: null,
                requestMethod: null,
                resolvedBy: input.resolvedBy,
                status: updated.status,
                taskId: null,
                threadId: null,
                turnId: null,
              }),
            },
            session,
          );

          return {
            approval: updated,
            approvalContext: null,
            shouldAttemptLiveDelivery: false,
            shouldResumeTaskAndMission: false,
          };
        }

        const approvalContext = readRuntimeApprovalPayload(approval);
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

    if (!resolution.shouldAttemptLiveDelivery || !resolution.approvalContext) {
      await this.proofBundleAssembly?.refreshProofBundle({
        missionId: resolution.approval.missionId,
        trigger: "approval_resolution",
      });

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

    await this.proofBundleAssembly?.refreshProofBundle({
      missionId: resolution.approval.missionId,
      trigger: "approval_resolution",
    });

    return resolution.approval;
  }

  async cancelPendingApprovalsForTask(input: CancelPendingTaskApprovalsInput) {
    const approvalsToCancel =
      await this.approvalRepository.listPendingApprovalsByTaskId(input.taskId);

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
          const cancelledApproval =
            await this.approvalRepository.updateApproval(
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

    const resolvedApprovals = await Promise.all(
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

    await Promise.all(
      Array.from(
        new Set(resolvedApprovals.map((approval) => approval.missionId)),
      ).map((missionId) =>
        this.proofBundleAssembly?.refreshProofBundle({
          missionId,
          trigger: "approval_resolution",
        }),
      ),
    );

    return resolvedApprovals;
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

    const approval = await this.missionRepository.transaction(
      async (session) => {
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
          const awaitingMission =
            await this.missionRepository.updateMissionStatus(
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
      },
    );

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

    if (
      mission.status === "awaiting_approval" &&
      pendingMissionApprovals === 0
    ) {
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
      const approval = await this.getRequiredApproval(
        input.approvalId,
        session,
      );

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

function readSortedReportApprovals(
  approvals: ApprovalRecord[],
  kind: "report_release" | "report_circulation",
) {
  return [...approvals]
    .filter((approval) => approval.kind === kind)
    .sort(
      (left, right) =>
        left.createdAt.localeCompare(right.createdAt) ||
        left.id.localeCompare(right.id),
    );
}

function readExistingFinanceReportApprovalForRequest(
  approvals: ApprovalRecord[],
  kind: "report_release" | "report_circulation",
) {
  const sameKindApprovals = readSortedReportApprovals(approvals, kind);
  const pendingApproval =
    [...sameKindApprovals]
      .reverse()
      .find((approval) => approval.status === "pending") ?? null;

  if (pendingApproval) {
    return pendingApproval;
  }

  const latestApproval = sameKindApprovals.at(-1) ?? null;

  if (!latestApproval) {
    return null;
  }

  if (latestApproval.status === "approved") {
    return latestApproval;
  }

  return null;
}

function reportCirculationCorrectionEquals(
  left: ReportCirculationApprovalCirculationCorrection,
  right: ReportCirculationApprovalCirculationCorrection,
) {
  return (
    left.correctionKey === right.correctionKey &&
    left.correctedAt === right.correctedAt &&
    left.correctedBy === right.correctedBy &&
    left.correctionReason === right.correctionReason &&
    left.circulatedAt === right.circulatedAt &&
    left.circulatedBy === right.circulatedBy &&
    left.circulationChannel === right.circulationChannel &&
    left.circulationNote === right.circulationNote &&
    left.summary === right.summary
  );
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

function mapDecisionToApprovalStatus(
  decision: ApprovalDecision,
): ApprovalStatus {
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

function invalidRequest(path: string, message: string) {
  return new AppHttpError(400, {
    error: {
      code: "invalid_request",
      message: "Invalid request",
      details: [
        {
          path,
          message,
        },
      ],
    },
  });
}
