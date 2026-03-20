import type {
  DiscoveryMissionQuestion,
  MissionRecord,
  MissionTaskRecord,
  MissionTaskStatus,
  TaskStatusChangeReason,
  TwinRepositoryBlastRadiusQueryResult,
} from "@pocket-cto/domain";
import type { PersistenceSession } from "../../lib/persistence";
import { truncate } from "../evidence/text";
import { buildDiscoveryAnswerArtifact } from "../evidence/discovery-answer";
import type { ProofBundleAssemblyService } from "../evidence/proof-bundle-assembly";
import {
  buildTaskStartedMissionStatusChangedPayload,
  buildTaskTerminalizedMissionStatusChangedPayload,
} from "../missions/events";
import type { MissionRepository } from "../missions/repository";
import type { ReplayService } from "../replay/service";
import type { TwinService } from "../twin/service";
import {
  buildTaskStatusChangedPayload,
  taskStatusChangeReasons,
} from "./events";

const TASK_SUMMARY_MAX_LENGTH = 240;

export class DiscoveryOrchestratorPhase {
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
    private readonly twinService: Pick<TwinService, "queryRepositoryBlastRadius">,
    private readonly proofBundleAssembly?: Pick<
      ProofBundleAssemblyService,
      "refreshProofBundle"
    >,
  ) {}

  async executeClaimedDiscoveryTask(taskId: string) {
    const { mission, question, task } = await this.markTaskRunning(taskId);

    try {
      const result = await this.twinService.queryRepositoryBlastRadius(
        question.repoFullName,
        {
          questionKind: question.questionKind,
          changedPaths: question.changedPaths,
        },
      );
      const unavailableSummary = buildUnavailableDiscoverySummary(result);

      return unavailableSummary
        ? await this.failTask(task.id, unavailableSummary)
        : await this.completeTask({
            mission,
            result,
            task,
          });
    } catch (error) {
      return this.failTask(task.id, buildDiscoveryFailureSummary(error));
    }
  }

  private async markTaskRunning(taskId: string) {
    return this.missionRepository.transaction(async (session) => {
      const task = await this.getRequiredTask(taskId, session);
      const mission = await this.getRequiredMission(task.missionId, session);
      const question = readDiscoveryQuestion(mission);

      if (!question) {
        throw new Error(
          `Discovery mission ${mission.id} is missing a persisted discovery question`,
        );
      }

      if (task.status !== "claimed") {
        throw new Error(`Task ${taskId} must be claimed before discovery execution`);
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
        question,
        task: runningTask,
      };
    });
  }

  private async completeTask(input: {
    mission: MissionRecord;
    result: TwinRepositoryBlastRadiusQueryResult;
    task: MissionTaskRecord;
  }) {
    return this.missionRepository.transaction(async (session) => {
      const task = await this.getRequiredTask(input.task.id, session);
      const mission = await this.getRequiredMission(task.missionId, session);
      const artifactDraft = buildDiscoveryAnswerArtifact({
        mission,
        result: input.result,
        task,
      });
      const artifact = await this.missionRepository.saveArtifact(artifactDraft, session);

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

      await this.missionRepository.updateTaskSummary(
        task.id,
        truncate(input.result.answerSummary, TASK_SUMMARY_MAX_LENGTH),
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
        task: succeededTask,
        session,
      });

      await this.proofBundleAssembly?.refreshProofBundle({
        missionId: mission.id,
        session,
        trigger: "discovery_answer",
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
        taskStatusChangeReasons.discoveryQueryFailed,
        session,
      );
      await this.persistMissionTerminalStatus({
        mission,
        task: failedTask,
        session,
      });
      await this.proofBundleAssembly?.refreshProofBundle({
        missionId: mission.id,
        session,
        trigger: "discovery_answer",
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

function readDiscoveryQuestion(
  mission: MissionRecord,
): DiscoveryMissionQuestion | null {
  return mission.spec.input?.discoveryQuestion ?? null;
}

function buildUnavailableDiscoverySummary(
  result: TwinRepositoryBlastRadiusQueryResult,
) {
  if (result.freshness.slices.metadata.state === "never_synced") {
    return `Discovery answer unavailable: ${result.repository.fullName} has no stored metadata twin state yet.`;
  }

  if (
    result.impactedDirectories.length === 0 &&
    result.impactedManifests.length === 0
  ) {
    return `Discovery answer unavailable: stored twin state could not match ${result.queryEcho.changedPaths.join(", ")} to any persisted directories or manifests.`;
  }

  return null;
}

function buildDiscoveryFailureSummary(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Discovery execution failed.";

  return `Discovery execution failed: ${message}`;
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
    input.missionType === "discovery" &&
    input.taskRole === "scout" &&
    input.taskStatus === "succeeded"
  ) {
    return "succeeded" as const;
  }

  return null;
}
