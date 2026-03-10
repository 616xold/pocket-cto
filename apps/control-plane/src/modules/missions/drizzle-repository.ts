import { and, asc, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import {
  artifacts,
  type Db,
  type DbTransaction,
  missionInputs,
  missions,
  missionTasks,
} from "@pocket-cto/db";
import {
  createDbSession,
  getDbExecutor as getSessionExecutor,
  type PersistenceSession,
} from "../../lib/persistence";
import type {
  MissionRecord,
  MissionTaskRecord,
  ProofBundleManifest,
} from "@pocket-cto/domain";
import type {
  AddMissionInput,
  CreateMissionInput,
  CreateTaskInput,
  MissionRepository,
} from "./repository";
import {
  mapArtifactRow,
  mapMissionRow,
  mapMissionTaskRow,
  readProofBundleManifest,
} from "./repository-mappers";

export class DrizzleMissionRepository implements MissionRepository {
  constructor(private readonly db: Db) {}

  async transaction<T>(
    operation: (session: PersistenceSession) => Promise<T>,
  ): Promise<T> {
    return this.db.transaction(async (tx: DbTransaction) =>
      operation(createDbSession(tx)),
    );
  }

  async createMission(input: CreateMissionInput, session?: PersistenceSession) {
    const executor = this.getExecutor(session);
    const [createdMission] = await executor
      .insert(missions)
      .values({
        type: input.type,
        status: "planned",
        title: input.title,
        objective: input.objective,
        sourceKind: input.sourceKind,
        sourceRef: input.sourceRef,
        createdBy: input.createdBy,
        primaryRepo: input.primaryRepo,
        spec: input.spec,
      })
      .returning();

    return mapMissionRow(
      getRequiredRow(createdMission, "Mission insert did not return a row"),
    );
  }

  async addMissionInput(
    input: AddMissionInput,
    session?: PersistenceSession,
  ): Promise<void> {
    const executor = this.getExecutor(session);
    await executor.insert(missionInputs).values({
      missionId: input.missionId,
      rawText: input.rawText,
      compilerName: input.compilerName,
      compilerVersion: input.compilerVersion,
      compilerConfidence: input.compilerConfidence,
      compilerOutput: input.compilerOutput,
    });
  }

  async createTask(input: CreateTaskInput, session?: PersistenceSession) {
    const executor = this.getExecutor(session);
    const [createdTask] = await executor
      .insert(missionTasks)
      .values({
        missionId: input.missionId,
        role: input.role,
        sequence: input.sequence,
        status: input.status,
        dependsOnTaskId: input.dependsOnTaskId ?? null,
      })
      .returning();

    return mapMissionTaskRow(
      getRequiredRow(createdTask, "Mission task insert did not return a row"),
    );
  }

  async updateMissionStatus(
    missionId: string,
    status: MissionRecord["status"],
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [updatedMission] = await executor
      .update(missions)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(missions.id, missionId))
      .returning();

    return mapMissionRow(
      getRequiredRow(updatedMission, `Mission ${missionId} was not updated`),
    );
  }

  async claimNextRunnableTask(session?: PersistenceSession) {
    const executor = this.getExecutor(session);
    // Claim order is deterministic across queued and running missions: oldest
    // mission first, then the lowest task sequence inside that mission, then
    // stable UUID tie-breakers.
    const pendingTasks = await executor
      .select({
        task: missionTasks,
      })
      .from(missionTasks)
      .innerJoin(missions, eq(missionTasks.missionId, missions.id))
      .where(
        and(
          eq(missionTasks.status, "pending"),
          inArray(missions.status, ["queued", "running"]),
        ),
      )
      .orderBy(
        asc(missions.createdAt),
        asc(missions.id),
        asc(missionTasks.sequence),
        asc(missionTasks.id),
      );

    const dependencyIds = pendingTasks.flatMap(({ task }) =>
      task.dependsOnTaskId ? [task.dependsOnTaskId] : [],
    );
    const dependencyStatuses = dependencyIds.length
      ? await executor
          .select({
            id: missionTasks.id,
            status: missionTasks.status,
          })
          .from(missionTasks)
          .where(inArray(missionTasks.id, dependencyIds))
      : [];
    const dependencyStatusById = new Map(
      dependencyStatuses.map((task) => [task.id, task.status]),
    );

    const candidate = pendingTasks.find(({ task }) => {
      if (!task.dependsOnTaskId) {
        return true;
      }

      return dependencyStatusById.get(task.dependsOnTaskId) === "succeeded";
    });

    if (!candidate) {
      return null;
    }

    const [claimedTask] = await executor
      .update(missionTasks)
      .set({
        status: "claimed",
        attemptCount: sql`${missionTasks.attemptCount} + 1`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(missionTasks.id, candidate.task.id),
          eq(missionTasks.status, "pending"),
        ),
      )
      .returning();

    return claimedTask ? mapMissionTaskRow(claimedTask) : null;
  }

  async findOldestClaimedTaskReadyForTurn(session?: PersistenceSession) {
    return this.findOldestClaimedTask(
      and(
        sql`${missionTasks.codexThreadId} is not null`,
        isNull(missionTasks.codexTurnId),
      ),
      session,
    );
  }

  async findOldestClaimedTaskWithoutThread(session?: PersistenceSession) {
    return this.findOldestClaimedTask(isNull(missionTasks.codexThreadId), session);
  }

  async getTaskById(taskId: string, session?: PersistenceSession) {
    const executor = this.getExecutor(session);
    const [task] = await executor
      .select()
      .from(missionTasks)
      .where(eq(missionTasks.id, taskId))
      .limit(1);

    return task ? mapMissionTaskRow(task) : null;
  }

  async attachCodexThreadId(
    taskId: string,
    threadId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [updatedTask] = await executor
      .update(missionTasks)
      .set({
        codexThreadId: threadId,
        updatedAt: new Date(),
      })
      .where(
        and(eq(missionTasks.id, taskId), isNull(missionTasks.codexThreadId)),
      )
      .returning();

    if (updatedTask) {
      return mapMissionTaskRow(updatedTask);
    }

    const existingTask = await this.getTaskById(taskId, session);

    if (!existingTask) {
      throw new Error(`Task ${taskId} was not found for thread attachment`);
    }

    return existingTask;
  }

  async replaceCodexThreadId(
    taskId: string,
    expectedCurrentThreadId: string,
    newThreadId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [updatedTask] = await executor
      .update(missionTasks)
      .set({
        codexThreadId: newThreadId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(missionTasks.id, taskId),
          eq(missionTasks.codexThreadId, expectedCurrentThreadId),
        ),
      )
      .returning();

    if (updatedTask) {
      return mapMissionTaskRow(updatedTask);
    }

    const existingTask = await this.getTaskById(taskId, session);

    if (!existingTask) {
      throw new Error(`Task ${taskId} was not found for thread replacement`);
    }

    throw new Error(
      `Task ${taskId} thread mismatch during replacement: expected ${expectedCurrentThreadId}, got ${existingTask.codexThreadId ?? "null"}`,
    );
  }

  async attachCodexTurnId(
    taskId: string,
    turnId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [updatedTask] = await executor
      .update(missionTasks)
      .set({
        codexTurnId: turnId,
        updatedAt: new Date(),
      })
      .where(and(eq(missionTasks.id, taskId), isNull(missionTasks.codexTurnId)))
      .returning();

    if (updatedTask) {
      return mapMissionTaskRow(updatedTask);
    }

    const existingTask = await this.getTaskById(taskId, session);

    if (!existingTask) {
      throw new Error(`Task ${taskId} was not found for turn attachment`);
    }

    return existingTask;
  }

  async clearCodexTurnId(taskId: string, session?: PersistenceSession) {
    const executor = this.getExecutor(session);
    const [updatedTask] = await executor
      .update(missionTasks)
      .set({
        codexTurnId: null,
        updatedAt: new Date(),
      })
      .where(eq(missionTasks.id, taskId))
      .returning();

    return mapMissionTaskRow(
      getRequiredRow(updatedTask, `Task ${taskId} was not updated`),
    );
  }

  async updateTaskStatus(
    taskId: string,
    status: MissionTaskRecord["status"],
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [updatedTask] = await executor
      .update(missionTasks)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(missionTasks.id, taskId))
      .returning();

    return mapMissionTaskRow(
      getRequiredRow(updatedTask, `Task ${taskId} was not updated`),
    );
  }

  async getMissionById(missionId: string, session?: PersistenceSession) {
    const executor = this.getExecutor(session);
    const [mission] = await executor
      .select()
      .from(missions)
      .where(eq(missions.id, missionId))
      .limit(1);

    return mission ? mapMissionRow(mission) : null;
  }

  async getTasksByMissionId(missionId: string, session?: PersistenceSession) {
    const executor = this.getExecutor(session);
    const tasks = await executor
      .select()
      .from(missionTasks)
      .where(eq(missionTasks.missionId, missionId))
      .orderBy(missionTasks.sequence);

    return tasks.map(mapMissionTaskRow);
  }

  async getProofBundleByMissionId(
    missionId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [artifact] = await executor
      .select()
      .from(artifacts)
      .where(
        and(
          eq(artifacts.missionId, missionId),
          eq(artifacts.kind, "proof_bundle_manifest"),
        ),
      )
      .orderBy(desc(artifacts.createdAt), desc(artifacts.id))
      .limit(1);

    if (!artifact) {
      return null;
    }

    return readProofBundleManifest(artifact.metadata);
  }

  async saveProofBundle(
    bundle: ProofBundleManifest,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [artifact] = await executor
      .insert(artifacts)
      .values({
        missionId: bundle.missionId,
        taskId: null,
        kind: "proof_bundle_manifest",
        uri: buildProofBundleUri(bundle.missionId),
        mimeType: "application/json",
        metadata: {
          manifest: bundle,
        },
      })
      .returning();

    return mapArtifactRow(
      getRequiredRow(artifact, "Proof bundle insert did not return a row"),
    );
  }

  private getExecutor(session?: PersistenceSession) {
    return getSessionExecutor(session) ?? this.db;
  }

  private async findOldestClaimedTask(
    predicate: ReturnType<typeof and>,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [candidate] = await executor
      .select({
        task: missionTasks,
      })
      .from(missionTasks)
      .innerJoin(missions, eq(missionTasks.missionId, missions.id))
      .where(
        and(
          eq(missionTasks.status, "claimed"),
          inArray(missions.status, ["queued", "running"]),
          predicate,
        ),
      )
      .orderBy(
        asc(missions.createdAt),
        asc(missions.id),
        asc(missionTasks.sequence),
        asc(missionTasks.id),
      )
      .limit(1);

    return candidate ? mapMissionTaskRow(candidate.task) : null;
  }
}

function buildProofBundleUri(missionId: string) {
  return `pocket-cto://missions/${missionId}/proof-bundle-manifest`;
}

function getRequiredRow<T>(row: T | undefined, message: string): T {
  if (!row) {
    throw new Error(message);
  }

  return row;
}
