import type {
  ApprovalRecord,
  CreateDiscoveryMissionInput,
  CreateMissionFromTextInput,
  MissionDetailView,
  MissionListItem,
  MissionListView,
  MissionRecord,
  MissionSpec,
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
import type { PersistenceSession } from "../../lib/persistence";
import type { ReplayService } from "../replay/service";
import type { MissionCompilationResult, MissionCompiler } from "./compiler";
import { buildDiscoveryMissionCreationInput } from "./discovery";
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
    const primaryRepo = normalizeOptionalString(input.primaryRepo);
    const spec =
      primaryRepo === null
        ? compilation.spec
        : {
            ...compilation.spec,
            repos: [primaryRepo],
          };

    return this.createFromCompilation(
      {
        compilation,
        createdBy: input.requestedBy,
        primaryRepo: primaryRepo ?? spec.repos[0] ?? null,
        rawText: input.text,
        sourceKind: input.sourceKind,
        sourceRef: input.sourceRef ?? null,
        spec,
      },
      undefined,
    );
  }

  async createDiscovery(rawInput: CreateDiscoveryMissionInput) {
    return this.createFromCompilation(
      buildDiscoveryMissionCreationInput(rawInput),
      undefined,
    );
  }

  async createFromGitHubIssue(
    input: {
      issueBody?: string | null;
      issueTitle: string;
      primaryRepo: string;
      requestedBy: string;
      sourceRef: string;
    },
    options?: {
      session?: PersistenceSession;
    },
  ) {
    const compilerText = buildGitHubIssueCompilerText(
      input.issueTitle,
      input.issueBody,
    );
    const compilation = await this.compiler.compileFromText({
      text: compilerText,
    });
    const spec = buildGitHubIssueMissionSpec({
      compilerSpec: compilation.spec,
      issueBody: input.issueBody,
      issueTitle: input.issueTitle,
      primaryRepo: input.primaryRepo,
    });

    return this.createFromCompilation(
      {
        compilation,
        createdBy: input.requestedBy,
        primaryRepo: input.primaryRepo,
        rawText: compilerText,
        sourceKind: "github_issue",
        sourceRef: input.sourceRef,
        spec,
      },
      options?.session,
    );
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

  private async createFromCompilation(
    input: {
      compilation: MissionCompilationResult;
      compilerOutput?: Record<string, unknown>;
      createdBy: string;
      primaryRepo: string | null;
      rawText: string;
      sourceKind: MissionSourceKind;
      sourceRef: string | null;
      spec: MissionSpec;
    },
    session?: PersistenceSession,
  ) {
    const createMission = async (activeSession: PersistenceSession) => {
      const roles = buildInitialTaskRolesForMission(input.spec);
      const mission = await this.repository.createMission(
        {
          type: input.spec.type,
          title: input.spec.title,
          objective: input.spec.objective,
          sourceKind: input.sourceKind,
          sourceRef: input.sourceRef,
          createdBy: input.createdBy,
          primaryRepo: input.primaryRepo,
          spec: input.spec,
        },
        activeSession,
      );

      await this.repository.addMissionInput(
        {
          missionId: mission.id,
          rawText: input.rawText,
          compilerName: input.compilation.compilerName,
          compilerVersion: input.compilation.compilerVersion,
          compilerConfidence: input.compilation.confidence,
          compilerOutput:
            input.compilerOutput ??
            (input.spec as unknown as Record<string, unknown>),
        },
        activeSession,
      );

      await this.replayService.append(
        {
          missionId: mission.id,
          type: "mission.created",
          payload: { title: mission.title, type: mission.type },
        },
        activeSession,
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
          activeSession,
        );

        tasks.push(task);

        await this.replayService.append(
          {
            missionId: mission.id,
            taskId: task.id,
            type: "task.created",
            payload: { role: task.role, sequence: task.sequence },
          },
          activeSession,
        );
      }

      const queuedMission = await this.repository.updateMissionStatus(
        mission.id,
        "queued",
        activeSession,
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
        activeSession,
      );

      const proofBundle = this.evidenceService.createPlaceholder(queuedMission);
      const proofBundleArtifact = await this.repository.saveProofBundle(
        proofBundle,
        activeSession,
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
        activeSession,
      );

      return {
        mission: queuedMission,
        tasks,
        proofBundle,
      };
    };

    if (session) {
      return createMission(session);
    }

    return this.repository.transaction(createMission);
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

function normalizeOptionalString(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
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

function buildGitHubIssueCompilerText(
  issueTitle: string,
  issueBody: string | null | undefined,
) {
  const normalizedTitle = issueTitle.trim();
  const normalizedBody = issueBody?.trim() ?? "";

  return normalizedBody.length > 0
    ? `${normalizedTitle}\n\n${normalizedBody}`
    : normalizedTitle;
}

function buildGitHubIssueMissionSpec(input: {
  compilerSpec: MissionSpec;
  issueBody: string | null | undefined;
  issueTitle: string;
  primaryRepo: string;
}): MissionSpec {
  const objective = buildGitHubIssueObjective(input.issueTitle, input.issueBody);

  return {
    ...input.compilerSpec,
    objective,
    repos: [input.primaryRepo],
    title: input.issueTitle.trim(),
  };
}

function buildGitHubIssueObjective(
  issueTitle: string,
  issueBody: string | null | undefined,
) {
  const normalizedTitle = issueTitle.trim();
  const normalizedBody = issueBody?.trim() ?? "";

  return normalizedBody.length > 0
    ? `${normalizedTitle}\n\n${normalizedBody}`
    : normalizedTitle;
}
