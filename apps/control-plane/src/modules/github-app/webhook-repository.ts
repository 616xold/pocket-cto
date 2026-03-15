import {
  createMemorySession,
  type PersistenceSession,
  type TransactionalRepository,
} from "../../lib/persistence";
import type {
  GitHubWebhookDeliveryInsert,
  GitHubWebhookDeliveryLookupFilters,
  GitHubWebhookOutcome,
  PersistedGitHubWebhookDelivery,
} from "./webhook-types";

export type GitHubWebhookDeliveryCreateResult =
  | {
      duplicate: false;
      delivery: PersistedGitHubWebhookDelivery;
    }
  | {
      duplicate: true;
      delivery: PersistedGitHubWebhookDelivery;
    };

export interface GitHubWebhookRepository extends TransactionalRepository {
  createDeliveryIfAbsent(
    input: GitHubWebhookDeliveryInsert,
    session?: PersistenceSession,
  ): Promise<GitHubWebhookDeliveryCreateResult>;

  finalizeDelivery(
    input: {
      deliveryId: string;
      outcome: GitHubWebhookOutcome;
      processedAt: string;
    },
    session?: PersistenceSession,
  ): Promise<PersistedGitHubWebhookDelivery>;

  getDeliveryByDeliveryId(
    deliveryId: string,
    session?: PersistenceSession,
  ): Promise<PersistedGitHubWebhookDelivery | null>;

  listDeliveries(
    filters?: GitHubWebhookDeliveryLookupFilters,
    session?: PersistenceSession,
  ): Promise<PersistedGitHubWebhookDelivery[]>;
}

export class InMemoryGitHubWebhookRepository
  implements GitHubWebhookRepository
{
  private readonly deliveries = new Map<string, PersistedGitHubWebhookDelivery>();

  async transaction<T>(
    operation: (session: PersistenceSession) => Promise<T>,
  ): Promise<T> {
    return operation(createMemorySession());
  }

  async createDeliveryIfAbsent(input: GitHubWebhookDeliveryInsert) {
    const existing = this.deliveries.get(input.deliveryId);

    if (existing) {
      return {
        duplicate: true,
        delivery: existing,
      } satisfies GitHubWebhookDeliveryCreateResult;
    }

    const now = new Date().toISOString();
    const delivery: PersistedGitHubWebhookDelivery = {
      id: crypto.randomUUID(),
      deliveryId: input.deliveryId,
      eventName: input.eventName,
      action: input.action,
      installationId: input.installationId,
      outcome: null,
      payload: input.payload,
      processedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    this.deliveries.set(input.deliveryId, delivery);

    return {
      duplicate: false,
      delivery,
    } satisfies GitHubWebhookDeliveryCreateResult;
  }

  async finalizeDelivery(input: {
    deliveryId: string;
    outcome: GitHubWebhookOutcome;
    processedAt: string;
  }) {
    const existing = this.deliveries.get(input.deliveryId);

    if (!existing) {
      throw new Error(
        `GitHub webhook delivery ${input.deliveryId} must exist before finalization`,
      );
    }

    const finalized: PersistedGitHubWebhookDelivery = {
      ...existing,
      outcome: input.outcome,
      processedAt: input.processedAt,
      updatedAt: input.processedAt,
    };

    this.deliveries.set(input.deliveryId, finalized);

    return finalized;
  }

  async getDeliveryByDeliveryId(deliveryId: string) {
    return this.deliveries.get(deliveryId) ?? null;
  }

  async listDeliveries(filters: GitHubWebhookDeliveryLookupFilters = {}) {
    const filtered = Array.from(this.deliveries.values())
      .filter((delivery) => {
        if (filters.eventName && delivery.eventName !== filters.eventName) {
          return false;
        }

        if (filters.handledAs && delivery.outcome !== filters.handledAs) {
          return false;
        }

        if (
          filters.installationId &&
          delivery.installationId !== filters.installationId
        ) {
          return false;
        }

        return true;
      })
      .sort((left, right) => {
        const byCreatedAt =
          Date.parse(right.createdAt) - Date.parse(left.createdAt);

        if (byCreatedAt !== 0) {
          return byCreatedAt;
        }

        return right.deliveryId.localeCompare(left.deliveryId);
      });

    return filtered.slice(0, filters.limit ?? filtered.length);
  }
}
