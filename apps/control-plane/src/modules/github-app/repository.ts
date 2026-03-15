import {
  createMemorySession,
  type PersistenceSession,
  type TransactionalRepository,
} from "../../lib/persistence";
import type {
  GitHubInstallationRepositoriesRemove,
  GitHubInstallationRepositoriesUpdate,
  GitHubInstallationUpsert,
  PersistedGitHubInstallation,
  PersistedGitHubRepository,
} from "./types";

export interface GitHubAppRepository extends TransactionalRepository {
  deleteInstallation(
    installationId: string,
    session?: PersistenceSession,
  ): Promise<void>;

  listInstallations(
    session?: PersistenceSession,
  ): Promise<PersistedGitHubInstallation[]>;

  listRepositories(
    session?: PersistenceSession,
  ): Promise<PersistedGitHubRepository[]>;

  removeInstallationRepositories(
    input: GitHubInstallationRepositoriesRemove,
    session?: PersistenceSession,
  ): Promise<void>;

  upsertInstallation(
    installation: GitHubInstallationUpsert,
    session?: PersistenceSession,
  ): Promise<PersistedGitHubInstallation>;

  upsertInstallationRepositories(
    input: GitHubInstallationRepositoriesUpdate,
    session?: PersistenceSession,
  ): Promise<PersistedGitHubRepository[]>;
}

export class InMemoryGitHubAppRepository implements GitHubAppRepository {
  private readonly installations = new Map<string, PersistedGitHubInstallation>();
  private readonly repositories = new Map<string, PersistedGitHubRepository>();

  async transaction<T>(
    operation: (session: PersistenceSession) => Promise<T>,
  ): Promise<T> {
    return operation(createMemorySession());
  }

  async deleteInstallation(installationId: string) {
    const installation = this.installations.get(installationId);

    if (!installation) {
      return;
    }

    this.installations.delete(installationId);

    for (const [githubRepositoryId, repository] of this.repositories.entries()) {
      if (repository.installationRefId === installation.id) {
        this.repositories.delete(githubRepositoryId);
      }
    }
  }

  async listInstallations() {
    return [...this.installations.values()].sort((left, right) => {
      return (
        left.accountLogin.localeCompare(right.accountLogin) ||
        left.installationId.localeCompare(right.installationId)
      );
    });
  }

  async listRepositories() {
    return [...this.repositories.values()].sort((left, right) => {
      return left.fullName.localeCompare(right.fullName);
    });
  }

  async removeInstallationRepositories(input: GitHubInstallationRepositoriesRemove) {
    for (const githubRepositoryId of input.githubRepositoryIds) {
      const repository = this.repositories.get(githubRepositoryId);

      if (!repository) {
        continue;
      }

      const installation = [...this.installations.values()].find(
        (candidate) => candidate.id === repository.installationRefId,
      );
      if (!installation || installation.installationId !== input.installationId) {
        continue;
      }

      this.repositories.delete(githubRepositoryId);
    }
  }

  async upsertInstallation(installation: GitHubInstallationUpsert) {
    const existing = this.installations.get(installation.installationId);
    const now = new Date().toISOString();
    const nextRecord: PersistedGitHubInstallation = {
      id: existing?.id ?? crypto.randomUUID(),
      installationId: installation.installationId,
      appId: installation.appId,
      accountLogin: installation.accountLogin,
      accountType: installation.accountType,
      targetType: installation.targetType,
      targetId: installation.targetId,
      suspendedAt: installation.suspendedAt,
      permissions: installation.permissions,
      lastSyncedAt: installation.lastSyncedAt ?? existing?.lastSyncedAt ?? null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    this.installations.set(installation.installationId, nextRecord);

    return nextRecord;
  }

  async upsertInstallationRepositories(input: GitHubInstallationRepositoriesUpdate) {
    const installation = this.installations.get(input.installationId);

    if (!installation) {
      throw new Error(
        `GitHub installation ${input.installationId} must exist before repositories can be linked`,
      );
    }

    const upsertedRepositories: PersistedGitHubRepository[] = [];

    for (const repository of input.repositories) {
      const existing = this.repositories.get(repository.githubRepositoryId);
      const now = new Date().toISOString();
      const nextRecord: PersistedGitHubRepository = {
        id: existing?.id ?? crypto.randomUUID(),
        installationRefId: installation.id,
        githubRepositoryId: repository.githubRepositoryId,
        fullName: repository.fullName,
        defaultBranch: repository.defaultBranch,
        language: repository.language,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };

      this.repositories.set(repository.githubRepositoryId, nextRecord);
      upsertedRepositories.push(nextRecord);
    }

    return upsertedRepositories;
  }
}
