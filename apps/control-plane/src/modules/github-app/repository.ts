import {
  createMemorySession,
  type PersistenceSession,
  type TransactionalRepository,
} from "../../lib/persistence";
import type {
  GitHubInstallationUpsert,
  PersistedGitHubInstallation,
} from "./types";

export interface GitHubAppRepository extends TransactionalRepository {
  listInstallations(
    session?: PersistenceSession,
  ): Promise<PersistedGitHubInstallation[]>;

  upsertInstallation(
    installation: GitHubInstallationUpsert,
    session?: PersistenceSession,
  ): Promise<PersistedGitHubInstallation>;
}

export class InMemoryGitHubAppRepository implements GitHubAppRepository {
  private readonly installations = new Map<string, PersistedGitHubInstallation>();

  async transaction<T>(
    operation: (session: PersistenceSession) => Promise<T>,
  ): Promise<T> {
    return operation(createMemorySession());
  }

  async listInstallations() {
    return [...this.installations.values()].sort((left, right) => {
      return (
        left.accountLogin.localeCompare(right.accountLogin) ||
        left.installationId.localeCompare(right.installationId)
      );
    });
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
      lastSyncedAt: installation.lastSyncedAt,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    this.installations.set(installation.installationId, nextRecord);

    return nextRecord;
  }
}
