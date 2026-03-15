import {
  createMemorySession,
  type PersistenceSession,
  type TransactionalRepository,
} from "../../lib/persistence";
import type {
  GitHubInstallationRepositoriesMarkInactive,
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

  getInstallationByInstallationId(
    installationId: string,
    session?: PersistenceSession,
  ): Promise<PersistedGitHubInstallation | null>;

  listInstallations(
    session?: PersistenceSession,
  ): Promise<PersistedGitHubInstallation[]>;

  listRepositories(
    session?: PersistenceSession,
  ): Promise<PersistedGitHubRepository[]>;

  listRepositoriesByInstallation(
    installationId: string,
    session?: PersistenceSession,
  ): Promise<PersistedGitHubRepository[]>;

  markInstallationRepositoriesInactive(
    input: GitHubInstallationRepositoriesMarkInactive,
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

  async deleteInstallation(
    installationId: string,
    _session?: PersistenceSession,
  ) {
    const installation = this.installations.get(installationId);

    if (!installation) {
      return;
    }

    const now = new Date().toISOString();

    for (const [githubRepositoryId, repository] of this.repositories.entries()) {
      if (repository.installationId !== installationId) {
        continue;
      }

      this.repositories.set(githubRepositoryId, {
        ...repository,
        installationRefId: null,
        isActive: false,
        lastSyncedAt: now,
        removedFromInstallationAt: now,
        updatedAt: now,
      });
    }

    this.installations.delete(installationId);
  }

  async getInstallationByInstallationId(
    installationId: string,
    _session?: PersistenceSession,
  ) {
    return this.installations.get(installationId) ?? null;
  }

  async listInstallations(_session?: PersistenceSession) {
    return [...this.installations.values()].sort((left, right) => {
      return (
        left.accountLogin.localeCompare(right.accountLogin) ||
        left.installationId.localeCompare(right.installationId)
      );
    });
  }

  async listRepositories(_session?: PersistenceSession) {
    return sortRepositories([...this.repositories.values()]);
  }

  async listRepositoriesByInstallation(
    installationId: string,
    _session?: PersistenceSession,
  ) {
    return sortRepositories(
      [...this.repositories.values()].filter(
        (repository) => repository.installationId === installationId,
      ),
    );
  }

  async markInstallationRepositoriesInactive(
    input: GitHubInstallationRepositoriesMarkInactive,
    _session?: PersistenceSession,
  ) {
    for (const githubRepositoryId of input.githubRepositoryIds) {
      const repository = this.repositories.get(githubRepositoryId);

      if (!repository) {
        continue;
      }

      if (repository.installationId !== input.installationId) {
        continue;
      }

      this.repositories.set(githubRepositoryId, {
        ...repository,
        isActive: false,
        lastSyncedAt: input.lastSyncedAt ?? repository.lastSyncedAt,
        removedFromInstallationAt: input.markedInactiveAt,
        updatedAt: input.markedInactiveAt,
      });
    }
  }

  async upsertInstallation(
    installation: GitHubInstallationUpsert,
    _session?: PersistenceSession,
  ) {
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

  async upsertInstallationRepositories(
    input: GitHubInstallationRepositoriesUpdate,
    _session?: PersistenceSession,
  ) {
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
        installationId: input.installationId,
        installationRefId: installation.id,
        githubRepositoryId: repository.githubRepositoryId,
        fullName: repository.fullName,
        ownerLogin: repository.ownerLogin,
        name: repository.name,
        defaultBranch: repository.defaultBranch,
        isPrivate: repository.isPrivate,
        archived: repository.archived,
        disabled: repository.disabled,
        isActive: true,
        lastSyncedAt: input.lastSyncedAt ?? existing?.lastSyncedAt ?? null,
        removedFromInstallationAt: null,
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

function sortRepositories(repositories: PersistedGitHubRepository[]) {
  return repositories.sort((left, right) => {
    if (left.isActive !== right.isActive) {
      return left.isActive ? -1 : 1;
    }

    return left.fullName.localeCompare(right.fullName);
  });
}
