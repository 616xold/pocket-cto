import type {
  ArtifactRecord,
  MissionRecord,
  MissionTaskRecord,
  ProofBundleManifest,
} from "@pocket-cto/domain";
import {
  createMemorySession,
  type PersistenceSession,
  type TransactionalRepository,
} from "../../lib/persistence";
import { isTaskRunnable } from "../orchestrator/task-state-machine";
import type { ExecutorPlannerArtifactRecord } from "./planner-artifact";
import { readPlannerArtifactMetadata } from "./planner-artifact";

export type CreateMissionInput = {
  type: MissionRecord["type"];
  title: string;
  objective: string;
  sourceKind: MissionRecord["sourceKind"];
  sourceRef: string | null;
  createdBy: string;
  primaryRepo: string | null;
  spec: MissionRecord["spec"];
};

export type AddMissionInput = {
  missionId: string;
  rawText: string;
  compilerName: string;
  compilerVersion: string;
  compilerConfidence: number;
  compilerOutput: Record<string, unknown>;
};

export type CreateTaskInput = {
  missionId: string;
  role: MissionTaskRecord["role"];
  sequence: number;
  status: MissionTaskRecord["status"];
  dependsOnTaskId?: string | null;
};

export type CreateArtifactInput = {
  kind: ArtifactRecord["kind"];
  metadata?: Record<string, unknown>;
  mimeType?: string | null;
  missionId: string;
  sha256?: string | null;
  taskId?: string | null;
  uri: string;
};

export interface MissionRepository extends TransactionalRepository {
  createMission(
    input: CreateMissionInput,
    session?: PersistenceSession,
  ): Promise<MissionRecord>;

  addMissionInput(
    input: AddMissionInput,
    session?: PersistenceSession,
  ): Promise<void>;

  createTask(
    input: CreateTaskInput,
    session?: PersistenceSession,
  ): Promise<MissionTaskRecord>;

  updateMissionStatus(
    missionId: string,
    status: MissionRecord["status"],
    session?: PersistenceSession,
  ): Promise<MissionRecord>;

  claimNextRunnableTask(
    session?: PersistenceSession,
  ): Promise<MissionTaskRecord | null>;

  findOldestClaimedTaskReadyForTurn(
    session?: PersistenceSession,
  ): Promise<MissionTaskRecord | null>;

  findOldestClaimedTaskWithoutThread(
    session?: PersistenceSession,
  ): Promise<MissionTaskRecord | null>;

  getTaskById(
    taskId: string,
    session?: PersistenceSession,
  ): Promise<MissionTaskRecord | null>;

  getLatestPlannerArtifactForExecutor(
    taskId: string,
    session?: PersistenceSession,
  ): Promise<ExecutorPlannerArtifactRecord | null>;

  attachCodexThreadId(
    taskId: string,
    threadId: string,
    session?: PersistenceSession,
  ): Promise<MissionTaskRecord>;

  replaceCodexThreadId(
    taskId: string,
    expectedCurrentThreadId: string,
    newThreadId: string,
    session?: PersistenceSession,
  ): Promise<MissionTaskRecord>;

  attachCodexTurnId(
    taskId: string,
    turnId: string,
    session?: PersistenceSession,
  ): Promise<MissionTaskRecord>;

  clearCodexTurnId(
    taskId: string,
    session?: PersistenceSession,
  ): Promise<MissionTaskRecord>;

  updateTaskSummary(
    taskId: string,
    summary: string | null,
    session?: PersistenceSession,
  ): Promise<MissionTaskRecord>;

  updateTaskStatus(
    taskId: string,
    status: MissionTaskRecord["status"],
    session?: PersistenceSession,
  ): Promise<MissionTaskRecord>;

  getMissionById(
    missionId: string,
    session?: PersistenceSession,
  ): Promise<MissionRecord | null>;

  getTasksByMissionId(
    missionId: string,
    session?: PersistenceSession,
  ): Promise<MissionTaskRecord[]>;

  getProofBundleByMissionId(
    missionId: string,
    session?: PersistenceSession,
  ): Promise<ProofBundleManifest | null>;

  listArtifactsByMissionId(
    missionId: string,
    session?: PersistenceSession,
  ): Promise<ArtifactRecord[]>;

  saveProofBundle(
    bundle: ProofBundleManifest,
    session?: PersistenceSession,
  ): Promise<ArtifactRecord>;

  saveArtifact(
    input: CreateArtifactInput,
    session?: PersistenceSession,
  ): Promise<ArtifactRecord>;

  upsertProofBundle(
    bundle: ProofBundleManifest,
    session?: PersistenceSession,
  ): Promise<ArtifactRecord>;
}

export class InMemoryMissionRepository implements MissionRepository {
  private readonly missions = new Map<string, MissionRecord>();
  private readonly inputs: AddMissionInput[] = [];
  private readonly tasks = new Map<string, MissionTaskRecord[]>();
  private readonly artifactLedger: ArtifactRecord[] = [];
  private readonly proofBundles = new Map<
    string,
    {
      artifact: ArtifactRecord;
      bundle: ProofBundleManifest;
    }
  >();

  async transaction<T>(
    operation: (session: PersistenceSession) => Promise<T>,
  ): Promise<T> {
    return operation(createMemorySession());
  }

  async createMission(input: CreateMissionInput): Promise<MissionRecord> {
    const now = new Date().toISOString();
    const mission: MissionRecord = {
      id: crypto.randomUUID(),
      type: input.type,
      status: "planned",
      title: input.title,
      objective: input.objective,
      sourceKind: input.sourceKind,
      sourceRef: input.sourceRef,
      createdBy: input.createdBy,
      primaryRepo: input.primaryRepo,
      spec: input.spec,
      createdAt: now,
      updatedAt: now,
    };

    this.missions.set(mission.id, mission);
    return mission;
  }

  async addMissionInput(input: AddMissionInput): Promise<void> {
    this.inputs.push(input);
  }

  async createTask(input: CreateTaskInput): Promise<MissionTaskRecord> {
    const now = new Date().toISOString();
    const task: MissionTaskRecord = {
      id: crypto.randomUUID(),
      missionId: input.missionId,
      role: input.role,
      sequence: input.sequence,
      status: input.status,
      attemptCount: 0,
      codexThreadId: null,
      codexTurnId: null,
      workspaceId: null,
      dependsOnTaskId: input.dependsOnTaskId ?? null,
      summary: null,
      createdAt: now,
      updatedAt: now,
    };

    const existingTasks = this.tasks.get(input.missionId) ?? [];
    existingTasks.push(task);
    this.tasks.set(input.missionId, existingTasks);

    return task;
  }

  async updateMissionStatus(
    missionId: string,
    status: MissionRecord["status"],
  ): Promise<MissionRecord> {
    const existingMission = this.missions.get(missionId);

    if (!existingMission) {
      throw new Error(`Mission ${missionId} not found`);
    }

    const updatedMission: MissionRecord = {
      ...existingMission,
      status,
      updatedAt: new Date().toISOString(),
    };

    this.missions.set(missionId, updatedMission);

    return updatedMission;
  }

  async claimNextRunnableTask(): Promise<MissionTaskRecord | null> {
    const candidate = this.findNextRunnableTask();

    if (!candidate) {
      return null;
    }

    return this.replaceTask(candidate.id, {
      status: "claimed",
      attemptCount: candidate.attemptCount + 1,
      updatedAt: new Date().toISOString(),
    });
  }

  async findOldestClaimedTaskReadyForTurn(): Promise<MissionTaskRecord | null> {
    return this.findClaimedTask(
      (task) =>
        task.status === "claimed" &&
        task.codexThreadId !== null &&
        task.codexTurnId === null,
    );
  }

  async findOldestClaimedTaskWithoutThread(): Promise<MissionTaskRecord | null> {
    return this.findClaimedTask(
      (task) => task.status === "claimed" && task.codexThreadId === null,
    );
  }

  async getTaskById(taskId: string): Promise<MissionTaskRecord | null> {
    for (const tasks of this.tasks.values()) {
      const task = tasks.find((candidate) => candidate.id === taskId);
      if (task) {
        return task;
      }
    }

    return null;
  }

  async getLatestPlannerArtifactForExecutor(
    taskId: string,
  ): Promise<ExecutorPlannerArtifactRecord | null> {
    const task = await this.getTaskById(taskId);

    if (!task) {
      return null;
    }

    const dependencyArtifact = task.dependsOnTaskId
      ? this.findPlannerArtifactByTaskId(task.missionId, task.dependsOnTaskId)
      : null;

    if (dependencyArtifact) {
      return {
        ...dependencyArtifact,
        justification: `Using dependency task ${dependencyArtifact.sourceTaskSequence} plan artifact ${dependencyArtifact.artifactId}.`,
        resolution: "dependency_task",
      };
    }

    const latestMissionPlannerArtifact = this.findLatestMissionPlannerArtifact(
      task.missionId,
    );

    if (!latestMissionPlannerArtifact) {
      return null;
    }

    return {
      ...latestMissionPlannerArtifact,
      justification: task.dependsOnTaskId
        ? `Dependency task ${task.dependsOnTaskId} has no plan artifact; falling back to latest planner task plan artifact ${latestMissionPlannerArtifact.artifactId}.`
        : `Task has no dependency plan artifact; using latest planner task plan artifact ${latestMissionPlannerArtifact.artifactId}.`,
      resolution: "mission_latest_planner",
    };
  }

  async attachCodexThreadId(
    taskId: string,
    threadId: string,
  ): Promise<MissionTaskRecord> {
    const existingTask = await this.getTaskById(taskId);

    if (!existingTask) {
      throw new Error(`Task ${taskId} not found`);
    }

    if (existingTask.codexThreadId) {
      return existingTask;
    }

    return this.replaceTask(taskId, {
      codexThreadId: threadId,
      updatedAt: new Date().toISOString(),
    });
  }

  async replaceCodexThreadId(
    taskId: string,
    expectedCurrentThreadId: string,
    newThreadId: string,
  ): Promise<MissionTaskRecord> {
    const existingTask = await this.getTaskById(taskId);

    if (!existingTask) {
      throw new Error(`Task ${taskId} not found`);
    }

    if (existingTask.codexThreadId !== expectedCurrentThreadId) {
      throw new Error(
        `Task ${taskId} thread mismatch during replacement: expected ${expectedCurrentThreadId}, got ${existingTask.codexThreadId ?? "null"}`,
      );
    }

    return this.replaceTask(taskId, {
      codexThreadId: newThreadId,
      updatedAt: new Date().toISOString(),
    });
  }

  async attachCodexTurnId(
    taskId: string,
    turnId: string,
  ): Promise<MissionTaskRecord> {
    const existingTask = await this.getTaskById(taskId);

    if (!existingTask) {
      throw new Error(`Task ${taskId} not found`);
    }

    if (existingTask.codexTurnId) {
      return existingTask;
    }

    return this.replaceTask(taskId, {
      codexTurnId: turnId,
      updatedAt: new Date().toISOString(),
    });
  }

  async clearCodexTurnId(taskId: string): Promise<MissionTaskRecord> {
    return this.replaceTask(taskId, {
      codexTurnId: null,
      updatedAt: new Date().toISOString(),
    });
  }

  async updateTaskStatus(
    taskId: string,
    status: MissionTaskRecord["status"],
  ): Promise<MissionTaskRecord> {
    return this.replaceTask(taskId, {
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  async updateTaskSummary(
    taskId: string,
    summary: string | null,
  ): Promise<MissionTaskRecord> {
    return this.replaceTask(taskId, {
      summary,
      updatedAt: new Date().toISOString(),
    });
  }

  async getMissionById(missionId: string): Promise<MissionRecord | null> {
    return this.missions.get(missionId) ?? null;
  }

  async getTasksByMissionId(missionId: string): Promise<MissionTaskRecord[]> {
    return this.tasks.get(missionId) ?? [];
  }

  async getProofBundleByMissionId(
    missionId: string,
  ): Promise<ProofBundleManifest | null> {
    return this.proofBundles.get(missionId)?.bundle ?? null;
  }

  async listArtifactsByMissionId(missionId: string): Promise<ArtifactRecord[]> {
    return this.artifactLedger
      .filter((artifact) => artifact.missionId === missionId)
      .sort(
        (left, right) =>
          left.createdAt.localeCompare(right.createdAt) ||
          left.id.localeCompare(right.id),
      );
  }

  async saveProofBundle(bundle: ProofBundleManifest): Promise<ArtifactRecord> {
    const artifact = await this.saveArtifact({
      missionId: bundle.missionId,
      kind: "proof_bundle_manifest",
      uri: `pocket-cto://missions/${bundle.missionId}/proof-bundle-manifest`,
      mimeType: "application/json",
      metadata: {
        manifest: bundle,
      },
    });

    this.proofBundles.set(bundle.missionId, { artifact, bundle });
    return artifact;
  }

  async saveArtifact(input: CreateArtifactInput): Promise<ArtifactRecord> {
    const artifact: ArtifactRecord = {
      id: crypto.randomUUID(),
      missionId: input.missionId,
      taskId: input.taskId ?? null,
      kind: input.kind,
      uri: input.uri,
      mimeType: input.mimeType ?? null,
      sha256: input.sha256 ?? null,
      metadata: input.metadata ?? {},
      createdAt: new Date().toISOString(),
    };

    this.artifactLedger.push(artifact);

    if (artifact.kind === "proof_bundle_manifest") {
      const bundle = readProofBundleFromMetadata(artifact.metadata);

      if (bundle) {
        this.proofBundles.set(bundle.missionId, { artifact, bundle });
      }
    }

    return artifact;
  }

  async upsertProofBundle(bundle: ProofBundleManifest): Promise<ArtifactRecord> {
    const existing = this.proofBundles.get(bundle.missionId);

    if (!existing) {
      return this.saveProofBundle(bundle);
    }

    const updatedArtifact: ArtifactRecord = {
      ...existing.artifact,
      metadata: {
        manifest: bundle,
      },
    };

    this.proofBundles.set(bundle.missionId, {
      artifact: updatedArtifact,
      bundle,
    });
    const ledgerIndex = this.artifactLedger.findIndex(
      (artifact) => artifact.id === updatedArtifact.id,
    );

    if (ledgerIndex >= 0) {
      this.artifactLedger[ledgerIndex] = updatedArtifact;
    }

    return updatedArtifact;
  }

  private findNextRunnableTask() {
    const candidates: Array<{
      mission: MissionRecord;
      task: MissionTaskRecord;
    }> = [];

    for (const mission of this.missions.values()) {
      const tasks = this.tasks.get(mission.id) ?? [];
      const tasksById = new Map(tasks.map((task) => [task.id, task]));

      for (const task of tasks) {
        const dependencyStatus = task.dependsOnTaskId
          ? (tasksById.get(task.dependsOnTaskId)?.status ?? null)
          : null;

        if (
          isTaskRunnable({
            missionStatus: mission.status,
            taskStatus: task.status,
            dependencyStatus,
          })
        ) {
          candidates.push({ mission, task });
        }
      }
    }

    candidates.sort((left, right) => {
      return (
        left.mission.createdAt.localeCompare(right.mission.createdAt) ||
        left.mission.id.localeCompare(right.mission.id) ||
        left.task.sequence - right.task.sequence ||
        left.task.id.localeCompare(right.task.id)
      );
    });

    return candidates[0]?.task ?? null;
  }

  private findClaimedTask(
    predicate: (task: MissionTaskRecord, mission: MissionRecord) => boolean,
  ) {
    const candidates: Array<{
      mission: MissionRecord;
      task: MissionTaskRecord;
    }> = [];

    for (const mission of this.missions.values()) {
      if (!["queued", "running"].includes(mission.status)) {
        continue;
      }

      const tasks = this.tasks.get(mission.id) ?? [];

      for (const task of tasks) {
        if (predicate(task, mission)) {
          candidates.push({ mission, task });
        }
      }
    }

    candidates.sort((left, right) => {
      return (
        left.mission.createdAt.localeCompare(right.mission.createdAt) ||
        left.mission.id.localeCompare(right.mission.id) ||
        left.task.sequence - right.task.sequence ||
        left.task.id.localeCompare(right.task.id)
      );
    });

    return candidates[0]?.task ?? null;
  }

  private replaceTask(
    taskId: string,
    patch: Partial<MissionTaskRecord>,
  ): MissionTaskRecord {
    for (const [missionId, tasks] of this.tasks.entries()) {
      const index = tasks.findIndex((candidate) => candidate.id === taskId);
      if (index === -1) {
        continue;
      }

      const existingTask = tasks[index];
      if (!existingTask) {
        break;
      }

      const updatedTask: MissionTaskRecord = {
        ...existingTask,
        ...patch,
      };
      const nextTasks = [...tasks];
      nextTasks[index] = updatedTask;
      this.tasks.set(missionId, nextTasks);

      return updatedTask;
    }

    throw new Error(`Task ${taskId} not found`);
  }

  private findLatestMissionPlannerArtifact(
    missionId: string,
  ): Omit<ExecutorPlannerArtifactRecord, "justification" | "resolution"> | null {
    const plannerTasks = new Map(
      (this.tasks.get(missionId) ?? [])
        .filter((task) => task.role === "planner")
        .map((task) => [task.id, task]),
    );

    for (let index = this.artifactLedger.length - 1; index >= 0; index -= 1) {
      const artifact = this.artifactLedger[index];

      if (
        !artifact ||
        artifact.missionId !== missionId ||
        artifact.kind !== "plan" ||
        !artifact.taskId
      ) {
        continue;
      }

      const plannerTask = plannerTasks.get(artifact.taskId);

      if (!plannerTask) {
        continue;
      }

      const metadata = readPlannerArtifactMetadata(artifact.metadata);

      if (!metadata) {
        continue;
      }

      return {
        artifactId: artifact.id,
        body: metadata.body,
        sourceTaskId: plannerTask.id,
        sourceTaskSequence: plannerTask.sequence,
        summary: plannerTask.summary ?? metadata.summary,
        uri: artifact.uri,
      };
    }

    return null;
  }

  private findPlannerArtifactByTaskId(
    missionId: string,
    plannerTaskId: string,
  ): Omit<ExecutorPlannerArtifactRecord, "justification" | "resolution"> | null {
    const plannerTask = (this.tasks.get(missionId) ?? []).find(
      (task) => task.id === plannerTaskId,
    );

    if (!plannerTask) {
      return null;
    }

    for (let index = this.artifactLedger.length - 1; index >= 0; index -= 1) {
      const artifact = this.artifactLedger[index];

      if (
        !artifact ||
        artifact.missionId !== missionId ||
        artifact.kind !== "plan" ||
        artifact.taskId !== plannerTaskId
      ) {
        continue;
      }

      const metadata = readPlannerArtifactMetadata(artifact.metadata);

      if (!metadata) {
        continue;
      }

      return {
        artifactId: artifact.id,
        body: metadata.body,
        sourceTaskId: plannerTask.id,
        sourceTaskSequence: plannerTask.sequence,
        summary: plannerTask.summary ?? metadata.summary,
        uri: artifact.uri,
      };
    }

    return null;
  }
}

function readProofBundleFromMetadata(
  metadata: Record<string, unknown>,
): ProofBundleManifest | null {
  const manifest = metadata.manifest;

  if (!manifest || typeof manifest !== "object") {
    return null;
  }

  return manifest as ProofBundleManifest;
}
