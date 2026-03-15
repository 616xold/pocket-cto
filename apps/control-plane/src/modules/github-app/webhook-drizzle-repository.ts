import { asc, eq } from "drizzle-orm";
import {
  githubWebhookDeliveries,
  type Db,
  type DbTransaction,
} from "@pocket-cto/db";
import {
  createDbSession,
  getDbExecutor,
  type PersistenceSession,
} from "../../lib/persistence";
import type {
  GitHubWebhookDeliveryInsert,
  GitHubWebhookOutcome,
  PersistedGitHubWebhookDelivery,
} from "./webhook-types";
import type {
  GitHubWebhookDeliveryCreateResult,
  GitHubWebhookRepository,
} from "./webhook-repository";

export class DrizzleGitHubWebhookRepository implements GitHubWebhookRepository {
  constructor(private readonly db: Db) {}

  async transaction<T>(
    operation: (session: PersistenceSession) => Promise<T>,
  ): Promise<T> {
    return this.db.transaction(async (tx: DbTransaction) =>
      operation(createDbSession(tx)),
    );
  }

  async createDeliveryIfAbsent(
    input: GitHubWebhookDeliveryInsert,
    session?: PersistenceSession,
  ): Promise<GitHubWebhookDeliveryCreateResult> {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .insert(githubWebhookDeliveries)
      .values({
        deliveryId: input.deliveryId,
        eventName: input.eventName,
        action: input.action,
        installationId: input.installationId,
        payload: input.payload,
      })
      .onConflictDoNothing({
        target: githubWebhookDeliveries.deliveryId,
      })
      .returning();

    if (row) {
      return {
        duplicate: false,
        delivery: mapDeliveryRow(row),
      };
    }

    const existing = await this.getDeliveryByDeliveryId(input.deliveryId, session);
    if (!existing) {
      throw new Error(
        `GitHub webhook delivery ${input.deliveryId} could not be reloaded after a duplicate insert`,
      );
    }

    return {
      duplicate: true,
      delivery: existing,
    };
  }

  async finalizeDelivery(
    input: {
      deliveryId: string;
      outcome: GitHubWebhookOutcome;
      processedAt: string;
    },
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .update(githubWebhookDeliveries)
      .set({
        outcome: input.outcome,
        processedAt: new Date(input.processedAt),
        updatedAt: new Date(input.processedAt),
      })
      .where(eq(githubWebhookDeliveries.deliveryId, input.deliveryId))
      .returning();

    return mapDeliveryRow(getRequiredRow(row));
  }

  async getDeliveryByDeliveryId(
    deliveryId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .select()
      .from(githubWebhookDeliveries)
      .where(eq(githubWebhookDeliveries.deliveryId, deliveryId))
      .orderBy(asc(githubWebhookDeliveries.createdAt))
      .limit(1);

    return row ? mapDeliveryRow(row) : null;
  }

  private getExecutor(session?: PersistenceSession) {
    return getDbExecutor(session) ?? this.db;
  }
}

function mapDeliveryRow(
  row: typeof githubWebhookDeliveries.$inferSelect,
): PersistedGitHubWebhookDelivery {
  return {
    id: row.id,
    deliveryId: row.deliveryId,
    eventName: row.eventName,
    action: row.action,
    installationId: row.installationId,
    outcome: row.outcome,
    payload: normalizePayload(row.payload),
    processedAt: row.processedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function normalizePayload(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function getRequiredRow<T>(row: T | undefined) {
  if (!row) {
    throw new Error("GitHub webhook delivery write did not return a row");
  }

  return row;
}
