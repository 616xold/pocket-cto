import { and, asc, desc, eq, inArray } from "drizzle-orm";
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
  GitHubInstallationRepositoriesMarkInactive,
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
    const installationRow = await this.getInstallationRow(installationId, session);

    if (!installationRow) {
      return;
    }

    const now = new Date();

    await executor
      .update(repositories)
      .set({
        installationRefId: null,
        isActive: false,
        lastSyncedAt: now,
        removedFromInstallationAt: now,
        updatedAt: now,
      })
      .where(eq(repositories.installationId, installationId));

    await executor
      .delete(githubInstallations)
      .where(eq(githubInstallations.id, installationRow.id));
  }

  async getInstallationByInstallationId(
    installationId: string,
    session?: PersistenceSession,
  ) {
    const row = await this.getInstallationRow(installationId, session);
    return row ? mapGitHubInstallationRow(row) : null;
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
      .orderBy(desc(repositories.isActive), asc(repositories.fullName));

    return rows.map(mapRepositoryRow);
  }

  async listRepositoriesByInstallation(
    installationId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select()
      .from(repositories)
      .where(eq(repositories.installationId, installationId))
      .orderBy(desc(repositories.isActive), asc(repositories.fullName));

    return rows.map(mapRepositoryRow);
  }

  async markInstallationRepositoriesInactive(
    input: GitHubInstallationRepositoriesMarkInactive,
    session?: PersistenceSession,
  ) {
    if (input.githubRepositoryIds.length === 0) {
      return;
    }

    const executor = this.getExecutor(session);

    await executor
      .update(repositories)
      .set({
        isActive: false,
        lastSyncedAt: input.lastSyncedAt
          ? new Date(input.lastSyncedAt)
          : new Date(input.markedInactiveAt),
        removedFromInstallationAt: new Date(input.markedInactiveAt),
        updatedAt: new Date(input.markedInactiveAt),
      })
      .where(
        and(
          eq(repositories.installationId, input.installationId),
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
              installationId: input.installationId,
              installationRefId: installationRow.id,
              fullName: repository.fullName,
              ownerLogin: repository.ownerLogin,
              name: repository.name,
              defaultBranch: repository.defaultBranch,
              isPrivate: repository.isPrivate,
              archived: repository.archived,
              disabled: repository.disabled,
              isActive: true,
              lastSyncedAt: input.lastSyncedAt
                ? new Date(input.lastSyncedAt)
                : existing.lastSyncedAt,
              removedFromInstallationAt: null,
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
            installationId: input.installationId,
            installationRefId: installationRow.id,
            githubRepositoryId: repository.githubRepositoryId,
            fullName: repository.fullName,
            ownerLogin: repository.ownerLogin,
            name: repository.name,
            defaultBranch: repository.defaultBranch,
            isPrivate: repository.isPrivate,
            archived: repository.archived,
            disabled: repository.disabled,
            isActive: true,
            lastSyncedAt: input.lastSyncedAt
              ? new Date(input.lastSyncedAt)
              : null,
            removedFromInstallationAt: null,
            language: repository.language,
          })
          .returning();

        return mapRepositoryRow(getRequiredRow(row));
      }),
    );

    return rows.sort(compareRepositories);
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
    installationId: row.installationId,
    installationRefId: row.installationRefId,
    githubRepositoryId: row.githubRepositoryId,
    fullName: row.fullName,
    ownerLogin: row.ownerLogin,
    name: row.name,
    defaultBranch: row.defaultBranch,
    isPrivate: row.isPrivate,
    archived: row.archived,
    disabled: row.disabled,
    isActive: row.isActive,
    lastSyncedAt: row.lastSyncedAt?.toISOString() ?? null,
    removedFromInstallationAt: row.removedFromInstallationAt?.toISOString() ?? null,
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

function compareRepositories(
  left: PersistedGitHubRepository,
  right: PersistedGitHubRepository,
) {
  if (left.isActive !== right.isActive) {
    return left.isActive ? -1 : 1;
  }

  return left.fullName.localeCompare(right.fullName);
}
