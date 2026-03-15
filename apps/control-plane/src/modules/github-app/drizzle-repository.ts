import { and, asc, eq, inArray } from "drizzle-orm";
import {
  githubInstallations,
  repositories,
  type Db,
  type DbTransaction,
} from "@pocket-cto/db";
import {
  createDbSession,
  getDbExecutor,
  type PersistenceSession,
} from "../../lib/persistence";
import type {
  GitHubInstallationRepositoriesRemove,
  GitHubInstallationRepositoriesUpdate,
  GitHubInstallationUpsert,
  PersistedGitHubInstallation,
  PersistedGitHubRepository,
} from "./types";
import type { GitHubAppRepository } from "./repository";

export class DrizzleGitHubAppRepository implements GitHubAppRepository {
  constructor(private readonly db: Db) {}

  async transaction<T>(
    operation: (session: PersistenceSession) => Promise<T>,
  ): Promise<T> {
    return this.db.transaction(async (tx: DbTransaction) =>
      operation(createDbSession(tx)),
    );
  }

  async deleteInstallation(
    installationId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);

    await executor
      .delete(githubInstallations)
      .where(eq(githubInstallations.installationId, installationId));
  }

  async listInstallations(session?: PersistenceSession) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select()
      .from(githubInstallations)
      .orderBy(
        asc(githubInstallations.accountLogin),
        asc(githubInstallations.installationId),
      );

    return rows.map(mapGitHubInstallationRow);
  }

  async listRepositories(session?: PersistenceSession) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select()
      .from(repositories)
      .orderBy(asc(repositories.fullName));

    return rows.map(mapRepositoryRow);
  }

  async removeInstallationRepositories(
    input: GitHubInstallationRepositoriesRemove,
    session?: PersistenceSession,
  ) {
    if (input.githubRepositoryIds.length === 0) {
      return;
    }

    const executor = this.getExecutor(session);
    const installationRow = await this.getInstallationRow(
      input.installationId,
      session,
    );

    if (!installationRow) {
      return;
    }

    await executor
      .delete(repositories)
      .where(
        and(
          eq(repositories.installationRefId, installationRow.id),
          inArray(repositories.githubRepositoryId, input.githubRepositoryIds),
        ),
      );
  }

  async upsertInstallation(
    installation: GitHubInstallationUpsert,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .insert(githubInstallations)
      .values({
        installationId: installation.installationId,
        appId: installation.appId,
        accountLogin: installation.accountLogin,
        accountType: installation.accountType,
        targetType: installation.targetType,
        targetId: installation.targetId,
        suspendedAt: installation.suspendedAt
          ? new Date(installation.suspendedAt)
          : null,
        permissions: installation.permissions,
        lastSyncedAt: installation.lastSyncedAt
          ? new Date(installation.lastSyncedAt)
          : undefined,
      })
      .onConflictDoUpdate({
        target: githubInstallations.installationId,
        set: {
          appId: installation.appId,
          accountLogin: installation.accountLogin,
          accountType: installation.accountType,
          targetType: installation.targetType,
          targetId: installation.targetId,
          suspendedAt: installation.suspendedAt
            ? new Date(installation.suspendedAt)
            : null,
          permissions: installation.permissions,
          ...(installation.lastSyncedAt
            ? {
                lastSyncedAt: new Date(installation.lastSyncedAt),
              }
            : {}),
          updatedAt: new Date(),
        },
      })
      .returning();

    return mapGitHubInstallationRow(getRequiredRow(row));
  }

  async upsertInstallationRepositories(
    input: GitHubInstallationRepositoriesUpdate,
    session?: PersistenceSession,
  ) {
    if (input.repositories.length === 0) {
      return [];
    }

    const executor = this.getExecutor(session);
    const installationRow = await this.getInstallationRow(
      input.installationId,
      session,
    );

    if (!installationRow) {
      throw new Error(
        `GitHub installation ${input.installationId} must exist before repositories can be linked`,
      );
    }

    const rows = await Promise.all(
      input.repositories.map(async (repository) => {
        const [existing] = await executor
          .select()
          .from(repositories)
          .where(
            eq(repositories.githubRepositoryId, repository.githubRepositoryId),
          )
          .limit(1);

        if (existing) {
          const [row] = await executor
            .update(repositories)
            .set({
              installationRefId: installationRow.id,
              fullName: repository.fullName,
              defaultBranch: repository.defaultBranch,
              language: repository.language,
              updatedAt: new Date(),
            })
            .where(eq(repositories.id, existing.id))
            .returning();

          return mapRepositoryRow(getRequiredRow(row));
        }

        const [row] = await executor
          .insert(repositories)
          .values({
            installationRefId: installationRow.id,
            githubRepositoryId: repository.githubRepositoryId,
            fullName: repository.fullName,
            defaultBranch: repository.defaultBranch,
            language: repository.language,
          })
          .returning();

        return mapRepositoryRow(getRequiredRow(row));
      }),
    );

    return rows.sort((left, right) => left.fullName.localeCompare(right.fullName));
  }

  private getExecutor(session?: PersistenceSession) {
    return getDbExecutor(session) ?? this.db;
  }

  private async getInstallationRow(
    installationId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .select()
      .from(githubInstallations)
      .where(eq(githubInstallations.installationId, installationId))
      .limit(1);

    return row ?? null;
  }
}

function mapGitHubInstallationRow(
  row: typeof githubInstallations.$inferSelect,
): PersistedGitHubInstallation {
  return {
    id: row.id,
    installationId: row.installationId,
    appId: row.appId,
    accountLogin: row.accountLogin,
    accountType: row.accountType,
    targetType: row.targetType,
    targetId: row.targetId,
    suspendedAt: row.suspendedAt?.toISOString() ?? null,
    permissions: normalizePermissions(row.permissions),
    lastSyncedAt: row.lastSyncedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapRepositoryRow(
  row: typeof repositories.$inferSelect,
): PersistedGitHubRepository {
  if (!row.githubRepositoryId) {
    throw new Error("GitHub repository row is missing githubRepositoryId");
  }

  return {
    id: row.id,
    installationRefId: row.installationRefId,
    githubRepositoryId: row.githubRepositoryId,
    fullName: row.fullName,
    defaultBranch: row.defaultBranch,
    language: row.language ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function normalizePermissions(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

function getRequiredRow<T>(row: T | undefined) {
  if (!row) {
    throw new Error("GitHub repository write did not return a row");
  }

  return row;
}
