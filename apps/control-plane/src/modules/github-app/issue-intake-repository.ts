import {
  createMemorySession,
  type PersistenceSession,
  type TransactionalRepository,
} from "../../lib/persistence";

export type GitHubIssueMissionBindingReservationInput = {
  repoFullName: string;
  issueNumber: number;
  issueId: string;
  issueNodeId: string | null;
  latestSourceDeliveryId: string;
};

export type PersistedGitHubIssueMissionBinding = {
  id: string;
  repoFullName: string;
  issueNumber: number;
  issueId: string;
  issueNodeId: string | null;
  missionId: string | null;
  latestSourceDeliveryId: string;
  createdAt: string;
  updatedAt: string;
};

export type GitHubIssueMissionBindingReservationResult =
  | {
      duplicate: false;
      binding: PersistedGitHubIssueMissionBinding;
    }
  | {
      duplicate: true;
      binding: PersistedGitHubIssueMissionBinding;
    };

export interface GitHubIssueIntakeRepository extends TransactionalRepository {
  createBindingReservationIfAbsent(
    input: GitHubIssueMissionBindingReservationInput,
    session?: PersistenceSession,
  ): Promise<GitHubIssueMissionBindingReservationResult>;

  attachMissionToBinding(
    input: {
      bindingId: string;
      latestSourceDeliveryId: string;
      missionId: string;
    },
    session?: PersistenceSession,
  ): Promise<PersistedGitHubIssueMissionBinding>;

  updateBindingLatestSourceDelivery(
    input: {
      bindingId: string;
      latestSourceDeliveryId: string;
    },
    session?: PersistenceSession,
  ): Promise<PersistedGitHubIssueMissionBinding>;

  listBindingsByIssueIds(
    issueIds: string[],
    session?: PersistenceSession,
  ): Promise<PersistedGitHubIssueMissionBinding[]>;
}

export class InMemoryGitHubIssueIntakeRepository
  implements GitHubIssueIntakeRepository
{
  private readonly bindings = new Map<string, PersistedGitHubIssueMissionBinding>();

  async transaction<T>(
    operation: (session: PersistenceSession) => Promise<T>,
  ): Promise<T> {
    return operation(createMemorySession());
  }

  async createBindingReservationIfAbsent(
    input: GitHubIssueMissionBindingReservationInput,
  ): Promise<GitHubIssueMissionBindingReservationResult> {
    const existing = this.bindings.get(input.issueId);

    if (existing) {
      return {
        duplicate: true,
        binding: existing,
      };
    }

    const now = new Date().toISOString();
    const binding: PersistedGitHubIssueMissionBinding = {
      id: crypto.randomUUID(),
      repoFullName: input.repoFullName,
      issueNumber: input.issueNumber,
      issueId: input.issueId,
      issueNodeId: input.issueNodeId,
      missionId: null,
      latestSourceDeliveryId: input.latestSourceDeliveryId,
      createdAt: now,
      updatedAt: now,
    };

    this.bindings.set(input.issueId, binding);

    return {
      duplicate: false,
      binding,
    };
  }

  async attachMissionToBinding(input: {
    bindingId: string;
    latestSourceDeliveryId: string;
    missionId: string;
  }) {
    const existing = this.findBindingById(input.bindingId);

    if (!existing) {
      throw new Error(`GitHub issue binding ${input.bindingId} was not found`);
    }

    const updated: PersistedGitHubIssueMissionBinding = {
      ...existing,
      missionId: input.missionId,
      latestSourceDeliveryId: input.latestSourceDeliveryId,
      updatedAt: new Date().toISOString(),
    };

    this.bindings.set(updated.issueId, updated);

    return updated;
  }

  async updateBindingLatestSourceDelivery(input: {
    bindingId: string;
    latestSourceDeliveryId: string;
  }) {
    const existing = this.findBindingById(input.bindingId);

    if (!existing) {
      throw new Error(`GitHub issue binding ${input.bindingId} was not found`);
    }

    const updated: PersistedGitHubIssueMissionBinding = {
      ...existing,
      latestSourceDeliveryId: input.latestSourceDeliveryId,
      updatedAt: new Date().toISOString(),
    };

    this.bindings.set(updated.issueId, updated);

    return updated;
  }

  async listBindingsByIssueIds(issueIds: string[]) {
    return issueIds
      .map((issueId) => this.bindings.get(issueId) ?? null)
      .filter(
        (binding): binding is PersistedGitHubIssueMissionBinding =>
          binding !== null,
      );
  }

  private findBindingById(bindingId: string) {
    for (const binding of this.bindings.values()) {
      if (binding.id === bindingId) {
        return binding;
      }
    }

    return null;
  }
}
