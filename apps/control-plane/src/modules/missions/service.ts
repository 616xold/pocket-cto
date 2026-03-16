import type {
  ApprovalRecord,
  CreateMissionFromTextInput,
  MissionDetailView,
  MissionListItem,
  MissionListView,
  MissionRecord,
  MissionSourceKind,
  MissionStatus,
  MissionTaskRecord,
  ProofBundleManifest,
} from "@pocket-cto/domain";
import { CreateMissionFromTextInputSchema } from "@pocket-cto/domain";
import { MissionNotFoundError } from "../../lib/http-errors";
import { buildMissionDetailView } from "./detail-view";
import { buildInitialTaskRolesForMission } from "../orchestrator/task-state-machine";
import type { EvidenceService } from "../evidence/service";
import type { ReplayService } from "../replay/service";
import type { MissionCompiler } from "./compiler";
import { buildQueuedMissionStatusChangedPayload } from "./events";
import type { MissionRepository } from "./repository";

export type MissionDetail = MissionDetailView;
export type MissionList = MissionListView;

const DEFAULT_MISSION_LIST_LIMIT = 20;
const MAX_OBJECTIVE_EXCERPT_LENGTH = 160;

export class MissionService {
  constructor(
    private readonly compiler: MissionCompiler,
    private readonly repository: MissionRepository,
    private readonly replayService: ReplayService,
    private readonly evidenceService: EvidenceService,
    private readonly readModelDeps: {
      approvalReader?: {
        listMissionApprovals(missionId: string): Promise<ApprovalRecord[]>;
      };
    } = {},
  ) {}

  async createFromText(rawInput: CreateMissionFromTextInput) {
    const input = CreateMissionFromTextInputSchema.parse(rawInput);
    const compilation = await this.compiler.compileFromText({
      text: input.text,
    });
    const roles = buildInitialTaskRolesForMission(compilation.spec);

    return this.repository.transaction(async (session) => {
      const mission = await this.repository.createMission(
        {
          type: compilation.spec.type,
          title: compilation.spec.title,
          objective: compilation.spec.objective,
          sourceKind: input.sourceKind,
          sourceRef: input.sourceRef ?? null,
          createdBy: input.requestedBy,
          primaryRepo: compilation.spec.repos[0] ?? null,
          spec: compilation.spec,
        },
        session,
      );

      await this.repository.addMissionInput(
        {
          missionId: mission.id,
          rawText: input.text,
          compilerName: compilation.compilerName,
          compilerVersion: compilation.compilerVersion,
          compilerConfidence: compilation.confidence,
          compilerOutput: compilation.spec as unknown as Record<
            string,
            unknown
          >,
        },
        session,
      );

      await this.replayService.append(
        {
          missionId: mission.id,
          type: "mission.created",
          payload: { title: mission.title, type: mission.type },
        },
        session,
      );

      const tasks: MissionTaskRecord[] = [];

      for (const [sequence, role] of roles.entries()) {
        const dependsOnTaskId =
          sequence === 0 ? null : (tasks[sequence - 1]?.id ?? null);
        const task = await this.repository.createTask(
          {
            missionId: mission.id,
            role,
            sequence,
            status: "pending",
            dependsOnTaskId,
          },
          session,
        );

        tasks.push(task);

        await this.replayService.append(
          {
            missionId: mission.id,
            taskId: task.id,
            type: "task.created",
            payload: { role: task.role, sequence: task.sequence },
          },
          session,
        );
      }

      const queuedMission = await this.repository.updateMissionStatus(
        mission.id,
        "queued",
        session,
      );

      await this.replayService.append(
        {
          missionId: mission.id,
          type: "mission.status_changed",
          payload: buildQueuedMissionStatusChangedPayload(
            mission.status,
            queuedMission.status,
          ),
        },
        session,
      );

      const proofBundle = this.evidenceService.createPlaceholder(queuedMission);
      const proofBundleArtifact = await this.repository.saveProofBundle(
        proofBundle,
        session,
      );

      await this.replayService.append(
        {
          missionId: mission.id,
          type: "artifact.created",
          payload: {
            artifactId: proofBundleArtifact.id,
            kind: proofBundleArtifact.kind,
          },
        },
        session,
      );

      return {
        mission: queuedMission,
        tasks,
        proofBundle,
      };
    });
  }

  async getMissionDetail(missionId: string) {
    const mission = await this.repository.getMissionById(missionId);
    if (!mission) {
      throw new MissionNotFoundError(missionId);
    }

    const [tasks, proofBundle, artifacts, approvals] = await Promise.all([
      this.repository.getTasksByMissionId(missionId),
      this.repository.getProofBundleByMissionId(missionId),
      this.repository.listArtifactsByMissionId(missionId),
      this.readModelDeps.approvalReader?.listMissionApprovals(missionId) ??
        Promise.resolve([]),
    ]);

    return buildMissionDetailView({
      approvals,
      artifacts,
      liveControl: {
        enabled: false,
        limitation: "single_process_only",
        mode: "api_only",
      },
      mission,
      proofBundle:
        proofBundle ?? this.evidenceService.createPlaceholder(mission),
      tasks,
    });
  }

  async listMissions(input?: {
    limit?: number;
    sourceKind?: MissionSourceKind | null;
    status?: MissionStatus | null;
  }): Promise<MissionList> {
    const filters = normalizeListFilters(input);
    const missions = await this.repository.listMissions({
      limit: filters.limit,
      sourceKind: filters.sourceKind ?? undefined,
      status: filters.status ?? undefined,
    });

    const summaries = await Promise.all(
      missions.map(async (mission) => {
        const [tasks, proofBundle, approvals] = await Promise.all([
          this.repository.getTasksByMissionId(mission.id),
          this.repository.getProofBundleByMissionId(mission.id),
          this.readModelDeps.approvalReader?.listMissionApprovals(mission.id) ??
            Promise.resolve([]),
        ]);

        return summarizeMission({
          approvals,
          mission,
          proofBundle:
            proofBundle ?? this.evidenceService.createPlaceholder(mission),
          tasks,
        });
      }),
    );

    return {
      filters,
      missions: summaries,
    };
  }
}

function normalizeListFilters(input?: {
  limit?: number;
  sourceKind?: MissionSourceKind | null;
  status?: MissionStatus | null;
}) {
  const requestedLimit = input?.limit;
  const normalizedLimit =
    typeof requestedLimit === "number" &&
    Number.isInteger(requestedLimit) &&
    requestedLimit > 0
      ? requestedLimit
      : DEFAULT_MISSION_LIST_LIMIT;

  return {
    limit: normalizedLimit,
    sourceKind: input?.sourceKind ?? null,
    status: input?.status ?? null,
  } satisfies MissionList["filters"];
}

function summarizeMission(input: {
  approvals: ApprovalRecord[];
  mission: MissionRecord;
  proofBundle: ProofBundleManifest;
  tasks: MissionTaskRecord[];
}): MissionListItem {
  const latestTask = readLatestTask(input.tasks);

  return {
    id: input.mission.id,
    createdAt: input.mission.createdAt,
    latestTask: latestTask
      ? {
          id: latestTask.id,
          role: latestTask.role,
          sequence: latestTask.sequence,
          status: latestTask.status,
          updatedAt: latestTask.updatedAt,
        }
      : null,
    objectiveExcerpt: buildObjectiveExcerpt(input.mission.objective),
    pendingApprovalCount: input.approvals.filter(
      (approval) => approval.status === "pending",
    ).length,
    primaryRepo: input.mission.primaryRepo,
    proofBundleStatus: input.proofBundle.status,
    pullRequestNumber: input.proofBundle.pullRequestNumber,
    pullRequestUrl: input.proofBundle.pullRequestUrl,
    sourceKind: input.mission.sourceKind,
    sourceRef: input.mission.sourceRef,
    status: input.mission.status,
    title: input.mission.title,
    updatedAt: readMissionUpdatedAt({
      latestTask,
      missionUpdatedAt: input.mission.updatedAt,
      proofBundle: input.proofBundle,
    }),
  };
}

function readLatestTask(tasks: MissionTaskRecord[]) {
  return [...tasks].sort((left, right) => {
    return (
      right.updatedAt.localeCompare(left.updatedAt) ||
      right.sequence - left.sequence ||
      right.id.localeCompare(left.id)
    );
  })[0] ?? null;
}

function readMissionUpdatedAt(input: {
  latestTask: MissionTaskRecord | null;
  missionUpdatedAt: string;
  proofBundle: ProofBundleManifest;
}) {
  return (
    [
      input.missionUpdatedAt,
      input.latestTask?.updatedAt ?? null,
      input.proofBundle.timestamps.latestArtifactAt,
      input.proofBundle.timestamps.latestApprovalAt,
      input.proofBundle.timestamps.latestExecutorEvidenceAt,
      input.proofBundle.timestamps.latestPlannerEvidenceAt,
      input.proofBundle.timestamps.latestPullRequestAt,
    ]
      .filter((value): value is string => Boolean(value))
      .sort((left, right) => right.localeCompare(left))[0] ??
    input.missionUpdatedAt
  );
}

function buildObjectiveExcerpt(objective: string) {
  if (objective.length <= MAX_OBJECTIVE_EXCERPT_LENGTH) {
    return objective;
  }

  return `${objective
    .slice(0, MAX_OBJECTIVE_EXCERPT_LENGTH - 3)
    .trimEnd()}...`;
}
