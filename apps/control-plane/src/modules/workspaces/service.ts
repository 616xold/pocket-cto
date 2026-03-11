import type { PersistenceSession } from "../../lib/persistence";
import { buildWorkspaceDefinition } from "./naming";
import type { WorkspaceGitManager } from "./git-manager";
import type { WorkspaceRepository } from "./repository";
import type { WorkspaceServiceConfig } from "./config";
import type { WorkspaceRecord, WorkspaceTaskTarget } from "./types";

export class WorkspaceService {
  constructor(
    private readonly repository: WorkspaceRepository,
    private readonly gitManager: Pick<WorkspaceGitManager, "ensureWorktree">,
    private readonly config: WorkspaceServiceConfig,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async ensureTaskWorkspace(
    input: {
      sandboxMode: string;
      task: WorkspaceTaskTarget;
    },
    session?: PersistenceSession,
  ): Promise<WorkspaceRecord> {
    const definition = buildWorkspaceDefinition({
      sourceRepoRoot: this.config.sourceRepoRoot,
      task: input.task,
      workspaceRoot: this.config.workspaceRoot,
    });
    const existingWorkspace = await this.repository.findByTaskId(
      input.task.id,
      session,
    );

    if (existingWorkspace) {
      this.assertWorkspaceMatchesDefinition(existingWorkspace, definition, input.task);
      this.assertLeaseAvailable(existingWorkspace);
      await this.gitManager.ensureWorktree({
        branchName: definition.branchName,
        repoRoot: definition.repo,
        worktreePath: definition.rootPath,
      });

      return this.withSession(session, async (activeSession) =>
        this.repository.activateWorkspaceLease(
          {
            leaseExpiresAt: this.buildLeaseExpiresAt(),
            leaseOwner: this.config.leaseOwner,
            sandboxMode: input.sandboxMode,
            taskId: input.task.id,
            workspaceId: existingWorkspace.id,
          },
          activeSession,
        ),
      );
    }

    await this.gitManager.ensureWorktree({
      branchName: definition.branchName,
      repoRoot: definition.repo,
      worktreePath: definition.rootPath,
    });

    return this.withSession(session, async (activeSession) =>
      this.repository.createWorkspace(
        {
          branchName: definition.branchName,
          leaseExpiresAt: this.buildLeaseExpiresAt(),
          leaseOwner: this.config.leaseOwner,
          missionId: input.task.missionId,
          repo: definition.repo,
          rootPath: definition.rootPath,
          sandboxMode: input.sandboxMode,
          taskId: input.task.id,
        },
        activeSession,
      ),
    );
  }

  async releaseTaskWorkspaceLease(
    taskId: string,
    session?: PersistenceSession,
  ): Promise<WorkspaceRecord | null> {
    return this.withSession(session, async (activeSession) =>
      this.repository.releaseWorkspaceLease(taskId, activeSession),
    );
  }

  private assertLeaseAvailable(workspace: WorkspaceRecord) {
    if (
      workspace.isActive &&
      workspace.leaseOwner &&
      workspace.leaseOwner !== this.config.leaseOwner &&
      workspace.leaseExpiresAt &&
      new Date(workspace.leaseExpiresAt).getTime() > this.now().getTime()
    ) {
      throw new Error(
        `Workspace ${workspace.id} is leased by ${workspace.leaseOwner} until ${workspace.leaseExpiresAt}`,
      );
    }
  }

  private assertWorkspaceMatchesDefinition(
    workspace: WorkspaceRecord,
    definition: {
      branchName: string;
      repo: string;
      rootPath: string;
    },
    task: WorkspaceTaskTarget,
  ) {
    if (workspace.repo !== definition.repo) {
      throw new Error(
        `Workspace ${workspace.id} repo mismatch: expected ${definition.repo}, got ${workspace.repo}`,
      );
    }

    if (workspace.rootPath !== definition.rootPath) {
      throw new Error(
        `Workspace ${workspace.id} root path mismatch: expected ${definition.rootPath}, got ${workspace.rootPath}`,
      );
    }

    if (workspace.branchName !== definition.branchName) {
      throw new Error(
        `Workspace ${workspace.id} branch mismatch: expected ${definition.branchName}, got ${workspace.branchName ?? "null"}`,
      );
    }

    if (task.workspaceId && task.workspaceId !== workspace.id) {
      throw new Error(
        `Task ${task.id} is linked to workspace ${task.workspaceId}, expected ${workspace.id}`,
      );
    }
  }

  private buildLeaseExpiresAt() {
    return new Date(this.now().getTime() + this.config.leaseDurationMs).toISOString();
  }

  private async withSession<T>(
    session: PersistenceSession | undefined,
    operation: (activeSession: PersistenceSession) => Promise<T>,
  ): Promise<T> {
    if (session) {
      return operation(session);
    }

    return this.repository.transaction(operation);
  }
}

