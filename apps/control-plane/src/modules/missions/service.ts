import type {
  ApprovalRecord,
  CreateMissionFromTextInput,
  MissionDetailView,
  MissionTaskRecord,
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
}
