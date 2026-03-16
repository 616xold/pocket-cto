import { eq, inArray } from "drizzle-orm";
import {
  githubIssueMissionBindings,
  type Db,
  type DbTransaction,
} from "@pocket-cto/db";
import {
  createDbSession,
  getDbExecutor,
  type PersistenceSession,
} from "../../lib/persistence";
import type {
  GitHubIssueIntakeRepository,
  GitHubIssueMissionBindingReservationInput,
  GitHubIssueMissionBindingReservationResult,
  PersistedGitHubIssueMissionBinding,
} from "./issue-intake-repository";

export class DrizzleGitHubIssueIntakeRepository
  implements GitHubIssueIntakeRepository
{
  constructor(private readonly db: Db) {}

  async transaction<T>(
    operation: (session: PersistenceSession) => Promise<T>,
  ): Promise<T> {
    return this.db.transaction(async (tx: DbTransaction) =>
      operation(createDbSession(tx)),
    );
  }

  async createBindingReservationIfAbsent(
    input: GitHubIssueMissionBindingReservationInput,
    session?: PersistenceSession,
  ): Promise<GitHubIssueMissionBindingReservationResult> {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .insert(githubIssueMissionBindings)
      .values({
        repoFullName: input.repoFullName,
        issueNumber: input.issueNumber,
        issueId: input.issueId,
        issueNodeId: input.issueNodeId,
        latestSourceDeliveryId: input.latestSourceDeliveryId,
      })
      .onConflictDoNothing({
        target: githubIssueMissionBindings.issueId,
      })
      .returning();

    if (row) {
      return {
        duplicate: false,
        binding: mapBindingRow(row),
      };
    }

    const existing = await this.listBindingsByIssueIds([input.issueId], session);
    if (existing.length === 0) {
      throw new Error(
        `GitHub issue binding ${input.issueId} could not be reloaded after a duplicate insert`,
      );
    }

    return {
      duplicate: true,
      binding: existing[0]!,
    };
  }

  async attachMissionToBinding(
    input: {
      bindingId: string;
      latestSourceDeliveryId: string;
      missionId: string;
    },
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .update(githubIssueMissionBindings)
      .set({
        latestSourceDeliveryId: input.latestSourceDeliveryId,
        missionId: input.missionId,
        updatedAt: new Date(),
      })
      .where(eq(githubIssueMissionBindings.id, input.bindingId))
      .returning();

    return mapBindingRow(
      getRequiredRow(row, `GitHub issue binding ${input.bindingId} was not updated`),
    );
  }

  async updateBindingLatestSourceDelivery(
    input: {
      bindingId: string;
      latestSourceDeliveryId: string;
    },
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .update(githubIssueMissionBindings)
      .set({
        latestSourceDeliveryId: input.latestSourceDeliveryId,
        updatedAt: new Date(),
      })
      .where(eq(githubIssueMissionBindings.id, input.bindingId))
      .returning();

    return mapBindingRow(
      getRequiredRow(row, `GitHub issue binding ${input.bindingId} was not updated`),
    );
  }

  async listBindingsByIssueIds(
    issueIds: string[],
    session?: PersistenceSession,
  ) {
    if (issueIds.length === 0) {
      return [];
    }

    const executor = this.getExecutor(session);
    const rows = await executor
      .select()
      .from(githubIssueMissionBindings)
      .where(inArray(githubIssueMissionBindings.issueId, issueIds));

    return rows.map(mapBindingRow);
  }

  private getExecutor(session?: PersistenceSession) {
    return getDbExecutor(session) ?? this.db;
  }
}

function mapBindingRow(
  row: typeof githubIssueMissionBindings.$inferSelect,
): PersistedGitHubIssueMissionBinding {
  return {
    id: row.id,
    repoFullName: row.repoFullName,
    issueNumber: row.issueNumber,
    issueId: row.issueId,
    issueNodeId: row.issueNodeId,
    missionId: row.missionId,
    latestSourceDeliveryId: row.latestSourceDeliveryId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function getRequiredRow<T>(row: T | undefined, message: string) {
  if (!row) {
    throw new Error(message);
  }

  return row;
}
