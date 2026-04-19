import type {
  MissionRecord,
  MissionTaskRecord,
  MissionTaskStatus,
  TaskStatusChangeReason,
} from "@pocket-cto/domain";
import type { PersistenceSession } from "../../lib/persistence";
import { truncate } from "../evidence/text";
import type { ProofBundleAssemblyService } from "../evidence/proof-bundle-assembly";
import {
  buildTaskStartedMissionStatusChangedPayload,
  buildTaskTerminalizedMissionStatusChangedPayload,
} from "../missions/events";
import type { MissionRepository } from "../missions/repository";
import {
  buildBoardPacketArtifact,
  buildDiligencePacketArtifact,
  buildEvidenceAppendixArtifact,
  buildFinanceMemoArtifact,
  buildLenderUpdateArtifact,
} from "../reporting/artifact";
import type { ReportingService } from "../reporting/service";
import type { ReplayService } from "../replay/service";
import {
  buildTaskStatusChangedPayload,
  taskStatusChangeReasons,
} from "./events";

const TASK_SUMMARY_MAX_LENGTH = 240;

export class ReportingOrchestratorPhase {
  constructor(
    private readonly missionRepository: Pick<
      MissionRepository,
      | "getMissionById"
      | "getTaskById"
      | "saveArtifact"
      | "transaction"
      | "updateMissionStatus"
      | "updateTaskStatus"
      | "updateTaskSummary"
    >,
    private readonly replayService: Pick<ReplayService, "append">,
    private readonly reportingService: Pick<ReportingService, "compileDraftReport">,
    private readonly proofBundleAssembly?: Pick<
      ProofBundleAssemblyService,
      "refreshProofBundle"
    >,
  ) {}

  async executeClaimedReportingTask(taskId: string) {
    const { mission, task } = await this.markTaskRunning(taskId);

    try {
      const compiled = await this.reportingService.compileDraftReport(mission);
      return this.completeReportingTask({
        compiled,
        mission,
        task,
      });
    } catch (error) {
      return this.failTask(task.id, buildReportingFailureSummary(error));
    }
  }

  private async markTaskRunning(taskId: string) {
    return this.missionRepository.transaction(async (session) => {
      const task = await this.getRequiredTask(taskId, session);
      const mission = await this.getRequiredMission(task.missionId, session);

      if (task.status !== "claimed") {
        throw new Error(`Task ${taskId} must be claimed before reporting execution`);
      }

      if (mission.status === "queued") {
        const runningMission = await this.missionRepository.updateMissionStatus(
          mission.id,
          "running",
          session,
        );

        await this.replayService.append(
          {
            missionId: mission.id,
            type: "mission.status_changed",
            payload: buildTaskStartedMissionStatusChangedPayload(
              mission.status,
              runningMission.status,
            ),
          },
          session,
        );
      }

      const runningTask = await this.missionRepository.updateTaskStatus(
        taskId,
        "running",
        session,
      );

      await this.appendTaskStatusChanged(
        runningTask,
        task.status,
        runningTask.status,
        taskStatusChangeReasons.taskStarted,
        session,
      );

      return {
        mission,
        task: runningTask,
      };
    });
  }

  private async completeReportingTask(input: {
    compiled: Awaited<ReturnType<ReportingService["compileDraftReport"]>>;
    mission: MissionRecord;
    task: MissionTaskRecord;
  }) {
    return this.missionRepository.transaction(async (session) => {
      const task = await this.getRequiredTask(input.task.id, session);
      const mission = await this.getRequiredMission(task.missionId, session);
      const artifactDrafts =
        input.compiled.reportKind === "board_packet"
          ? [
              buildBoardPacketArtifact({
                boardPacket: input.compiled.boardPacket,
                missionId: mission.id,
                taskId: task.id,
              }),
            ]
          : input.compiled.reportKind === "lender_update"
            ? [
                buildLenderUpdateArtifact({
                  lenderUpdate: input.compiled.lenderUpdate,
                  missionId: mission.id,
                  taskId: task.id,
                }),
              ]
            : input.compiled.reportKind === "diligence_packet"
              ? [
                  buildDiligencePacketArtifact({
                    diligencePacket: input.compiled.diligencePacket,
                    missionId: mission.id,
                    taskId: task.id,
                  }),
                ]
          : [
              buildFinanceMemoArtifact({
                memo: input.compiled.financeMemo,
                missionId: mission.id,
                taskId: task.id,
              }),
              buildEvidenceAppendixArtifact({
                evidenceAppendix: input.compiled.evidenceAppendix,
                missionId: mission.id,
                taskId: task.id,
              }),
            ];

      for (const artifactDraft of artifactDrafts) {
        const artifact = await this.missionRepository.saveArtifact(
          artifactDraft,
          session,
        );
        await this.replayService.append(
          {
            missionId: mission.id,
            taskId: task.id,
            type: "artifact.created",
            payload: {
              artifactId: artifact.id,
              kind: artifact.kind,
            },
          },
          session,
        );
      }

      await this.missionRepository.updateTaskSummary(
        task.id,
        truncate(readTaskSummary(input.compiled), TASK_SUMMARY_MAX_LENGTH),
        session,
      );
      const succeededTask = await this.missionRepository.updateTaskStatus(
        task.id,
        "succeeded",
        session,
      );

      await this.appendTaskStatusChanged(
        succeededTask,
        task.status,
        succeededTask.status,
        taskStatusChangeReasons.taskCompleted,
        session,
      );
      await this.persistMissionTerminalStatus({
        mission,
        session,
        task: succeededTask,
      });
      await this.proofBundleAssembly?.refreshProofBundle({
        missionId: mission.id,
        session,
        trigger: "reporting_artifacts",
      });

      return succeededTask;
    });
  }

  private async failTask(taskId: string, summary: string) {
    return this.missionRepository.transaction(async (session) => {
      const task = await this.getRequiredTask(taskId, session);
      const mission = await this.getRequiredMission(task.missionId, session);

      if (task.status !== "claimed" && task.status !== "running") {
        return task;
      }

      await this.missionRepository.updateTaskSummary(
        taskId,
        truncate(summary, TASK_SUMMARY_MAX_LENGTH),
        session,
      );
      const failedTask = await this.missionRepository.updateTaskStatus(
        taskId,
        "failed",
        session,
      );

      await this.appendTaskStatusChanged(
        failedTask,
        task.status,
        failedTask.status,
        taskStatusChangeReasons.reportingCompileFailed,
        session,
      );
      await this.persistMissionTerminalStatus({
        mission,
        session,
        task: failedTask,
      });
      await this.proofBundleAssembly?.refreshProofBundle({
        missionId: mission.id,
        session,
        trigger: "reporting_artifacts",
      });

      return failedTask;
    });
  }

  private async appendTaskStatusChanged(
    task: MissionTaskRecord,
    from: MissionTaskStatus,
    to: MissionTaskStatus,
    reason: TaskStatusChangeReason,
    session: PersistenceSession,
  ) {
    await this.replayService.append(
      {
        missionId: task.missionId,
        taskId: task.id,
        type: "task.status_changed",
        payload: buildTaskStatusChangedPayload(from, to, reason),
      },
      session,
    );
  }

  private async persistMissionTerminalStatus(input: {
    mission: MissionRecord;
    session: PersistenceSession;
    task: MissionTaskRecord;
  }) {
    const nextMissionStatus = resolveMissionTerminalStatus({
      currentMissionStatus: input.mission.status,
      missionType: input.mission.type,
      taskRole: input.task.role,
      taskStatus: input.task.status,
    });

    if (!nextMissionStatus || nextMissionStatus === input.mission.status) {
      return;
    }

    const terminalMission = await this.missionRepository.updateMissionStatus(
      input.mission.id,
      nextMissionStatus,
      input.session,
    );

    await this.replayService.append(
      {
        missionId: input.mission.id,
        type: "mission.status_changed",
        payload: buildTaskTerminalizedMissionStatusChangedPayload(
          input.mission.status,
          terminalMission.status,
        ),
      },
      input.session,
    );
  }

  private async getRequiredMission(
    missionId: string,
    session?: PersistenceSession,
  ) {
    const mission = await this.missionRepository.getMissionById(missionId, session);

    if (!mission) {
      throw new Error(`Mission ${missionId} not found`);
    }

    return mission;
  }

  private async getRequiredTask(taskId: string, session?: PersistenceSession) {
    const task = await this.missionRepository.getTaskById(taskId, session);

    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    return task;
  }
}

function readTaskSummary(
  compiled: Awaited<ReturnType<ReportingService["compileDraftReport"]>>,
) {
  if (compiled.reportKind === "board_packet") {
    return compiled.boardPacket.packetSummary;
  }

  if (compiled.reportKind === "lender_update") {
    return compiled.lenderUpdate.updateSummary;
  }

  if (compiled.reportKind === "diligence_packet") {
    return compiled.diligencePacket.packetSummary;
  }

  return compiled.financeMemo.memoSummary;
}

function buildReportingFailureSummary(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Reporting execution failed.";

  return `Reporting execution failed: ${message}`;
}

function resolveMissionTerminalStatus(input: {
  currentMissionStatus: MissionRecord["status"];
  missionType: MissionRecord["type"];
  taskRole: MissionTaskRecord["role"];
  taskStatus: MissionTaskRecord["status"];
}) {
  if (input.taskStatus === "failed") {
    return "failed" as const;
  }

  if (input.taskStatus === "cancelled") {
    return "cancelled" as const;
  }

  if (
    input.missionType === "reporting" &&
    input.taskRole === "scout" &&
    input.taskStatus === "succeeded"
  ) {
    return "succeeded" as const;
  }

  return null;
}
