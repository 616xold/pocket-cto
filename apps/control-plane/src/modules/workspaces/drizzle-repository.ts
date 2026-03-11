import { and, eq } from "drizzle-orm";
import {
  missionTasks,
  type Db,
  type DbTransaction,
  workspaces,
} from "@pocket-cto/db";
import {
  createDbSession,
  getDbExecutor,
  type PersistenceSession,
} from "../../lib/persistence";
import type {
  ActivateWorkspaceLeaseInput,
  CreateWorkspaceInput,
  WorkspaceRepository,
} from "./repository";
import { mapWorkspaceRow } from "./repository-mappers";

export class DrizzleWorkspaceRepository implements WorkspaceRepository {
  constructor(private readonly db: Db) {}

  async transaction<T>(
    operation: (session: PersistenceSession) => Promise<T>,
  ): Promise<T> {
    return this.db.transaction(async (tx: DbTransaction) =>
      operation(createDbSession(tx)),
    );
  }

  async activateWorkspaceLease(
    input: ActivateWorkspaceLeaseInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [updatedWorkspace] = await executor
      .update(workspaces)
      .set({
        leaseOwner: input.leaseOwner,
        leaseExpiresAt: input.leaseExpiresAt,
        sandboxMode: input.sandboxMode,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(workspaces.id, input.workspaceId),
          eq(workspaces.taskId, input.taskId),
        ),
      )
      .returning();

    if (!updatedWorkspace) {
      throw new Error(
        `Workspace ${input.workspaceId} was not found for task ${input.taskId}`,
      );
    }

    await executor
      .update(missionTasks)
      .set({
        updatedAt: new Date(),
        workspaceId: input.workspaceId,
      })
      .where(eq(missionTasks.id, input.taskId));

    return mapWorkspaceRow(updatedWorkspace);
  }

  async createWorkspace(
    input: CreateWorkspaceInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [createdWorkspace] = await executor
      .insert(workspaces)
      .values({
        missionId: input.missionId,
        taskId: input.taskId,
        repo: input.repo,
        rootPath: input.rootPath,
        branchName: input.branchName,
        sandboxMode: input.sandboxMode,
        leaseOwner: input.leaseOwner,
        leaseExpiresAt: input.leaseExpiresAt,
        isActive: true,
      })
      .returning();

    if (!createdWorkspace) {
      throw new Error(
        `Workspace insert did not return a row for task ${input.taskId}`,
      );
    }

    await executor
      .update(missionTasks)
      .set({
        updatedAt: new Date(),
        workspaceId: createdWorkspace.id,
      })
      .where(eq(missionTasks.id, input.taskId));

    return mapWorkspaceRow(createdWorkspace);
  }

  async findByTaskId(taskId: string, session?: PersistenceSession) {
    const executor = this.getExecutor(session);
    const [workspace] = await executor
      .select()
      .from(workspaces)
      .where(eq(workspaces.taskId, taskId))
      .limit(1);

    return workspace ? mapWorkspaceRow(workspace) : null;
  }

  async releaseWorkspaceLease(
    taskId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [workspace] = await executor
      .update(workspaces)
      .set({
        leaseOwner: null,
        leaseExpiresAt: null,
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(workspaces.taskId, taskId))
      .returning();

    return workspace ? mapWorkspaceRow(workspace) : null;
  }

  private getExecutor(session?: PersistenceSession) {
    return getDbExecutor(session) ?? this.db;
  }
}

