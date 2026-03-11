import {
  createMemorySession,
  type PersistenceSession,
  type TransactionalRepository,
} from "../../lib/persistence";
import type { WorkspaceRecord } from "./types";

export type CreateWorkspaceInput = {
  branchName: string;
  leaseExpiresAt: string;
  leaseOwner: string;
  missionId: string;
  repo: string;
  rootPath: string;
  sandboxMode: string;
  taskId: string;
};

export type ActivateWorkspaceLeaseInput = {
  leaseExpiresAt: string;
  leaseOwner: string;
  sandboxMode: string;
  taskId: string;
  workspaceId: string;
};

export interface WorkspaceRepository extends TransactionalRepository {
  activateWorkspaceLease(
    input: ActivateWorkspaceLeaseInput,
    session?: PersistenceSession,
  ): Promise<WorkspaceRecord>;

  createWorkspace(
    input: CreateWorkspaceInput,
    session?: PersistenceSession,
  ): Promise<WorkspaceRecord>;

  findByTaskId(
    taskId: string,
    session?: PersistenceSession,
  ): Promise<WorkspaceRecord | null>;

  releaseWorkspaceLease(
    taskId: string,
    session?: PersistenceSession,
  ): Promise<WorkspaceRecord | null>;
}

export class InMemoryWorkspaceRepository implements WorkspaceRepository {
  private readonly workspaceIdsByTaskId = new Map<string, string>();
  private readonly workspaces = new Map<string, WorkspaceRecord>();

  async transaction<T>(
    operation: (session: PersistenceSession) => Promise<T>,
  ): Promise<T> {
    return operation(createMemorySession());
  }

  async activateWorkspaceLease(
    input: ActivateWorkspaceLeaseInput,
  ): Promise<WorkspaceRecord> {
    const workspace = this.workspaces.get(input.workspaceId);

    if (!workspace || workspace.taskId !== input.taskId) {
      throw new Error(
        `Workspace ${input.workspaceId} was not found for task ${input.taskId}`,
      );
    }

    const updatedWorkspace: WorkspaceRecord = {
      ...workspace,
      leaseOwner: input.leaseOwner,
      leaseExpiresAt: input.leaseExpiresAt,
      sandboxMode: input.sandboxMode,
      isActive: true,
      updatedAt: new Date().toISOString(),
    };

    this.workspaces.set(updatedWorkspace.id, updatedWorkspace);
    this.workspaceIdsByTaskId.set(input.taskId, updatedWorkspace.id);

    return updatedWorkspace;
  }

  async createWorkspace(input: CreateWorkspaceInput): Promise<WorkspaceRecord> {
    const existingWorkspace = await this.findByTaskId(input.taskId);
    if (existingWorkspace) {
      return existingWorkspace;
    }

    const now = new Date().toISOString();
    const workspace: WorkspaceRecord = {
      id: crypto.randomUUID(),
      missionId: input.missionId,
      taskId: input.taskId,
      repo: input.repo,
      rootPath: input.rootPath,
      branchName: input.branchName,
      sandboxMode: input.sandboxMode,
      leaseOwner: input.leaseOwner,
      leaseExpiresAt: input.leaseExpiresAt,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    this.workspaces.set(workspace.id, workspace);
    this.workspaceIdsByTaskId.set(input.taskId, workspace.id);

    return workspace;
  }

  async findByTaskId(taskId: string): Promise<WorkspaceRecord | null> {
    const workspaceId = this.workspaceIdsByTaskId.get(taskId);
    return workspaceId ? (this.workspaces.get(workspaceId) ?? null) : null;
  }

  async releaseWorkspaceLease(taskId: string): Promise<WorkspaceRecord | null> {
    const workspace = await this.findByTaskId(taskId);

    if (!workspace) {
      return null;
    }

    const releasedWorkspace: WorkspaceRecord = {
      ...workspace,
      leaseOwner: null,
      leaseExpiresAt: null,
      isActive: false,
      updatedAt: new Date().toISOString(),
    };

    this.workspaces.set(releasedWorkspace.id, releasedWorkspace);
    return releasedWorkspace;
  }
}

