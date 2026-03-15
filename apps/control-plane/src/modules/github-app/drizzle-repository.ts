import { asc } from "drizzle-orm";
import {
  createDbSession,
  getDbExecutor,
  type PersistenceSession,
} from "../../lib/persistence";
import {
  githubInstallations,
  type Db,
  type DbTransaction,
} from "@pocket-cto/db";
import type {
  GitHubInstallationUpsert,
  PersistedGitHubInstallation,
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
        lastSyncedAt: new Date(installation.lastSyncedAt),
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
          lastSyncedAt: new Date(installation.lastSyncedAt),
          updatedAt: new Date(),
        },
      })
      .returning();

    return mapGitHubInstallationRow(getRequiredRow(row));
  }

  private getExecutor(session?: PersistenceSession) {
    return getDbExecutor(session) ?? this.db;
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
    throw new Error("GitHub installation upsert did not return a row");
  }

  return row;
}
