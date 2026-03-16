import {
  createMemorySession,
  type PersistenceSession,
  type TransactionalRepository,
} from "../../lib/persistence";
import type {
  TwinEdgeRecord,
  TwinEdgeUpsertInput,
  TwinEntityRecord,
  TwinEntityUpsertInput,
  TwinSyncRunFinishInput,
  TwinSyncRunRecord,
  TwinSyncRunStartInput,
} from "./types";

export interface TwinRepository extends TransactionalRepository {
  getEntityById(
    entityId: string,
    session?: PersistenceSession,
  ): Promise<TwinEntityRecord | null>;

  getSyncRunById(
    runId: string,
    session?: PersistenceSession,
  ): Promise<TwinSyncRunRecord | null>;

  listRepositoryEdges(
    repoFullName: string,
    session?: PersistenceSession,
  ): Promise<TwinEdgeRecord[]>;

  listRepositoryEntities(
    repoFullName: string,
    session?: PersistenceSession,
  ): Promise<TwinEntityRecord[]>;

  listRepositoryRuns(
    repoFullName: string,
    session?: PersistenceSession,
  ): Promise<TwinSyncRunRecord[]>;

  finishSyncRun(
    input: TwinSyncRunFinishInput,
    session?: PersistenceSession,
  ): Promise<TwinSyncRunRecord>;

  startSyncRun(
    input: TwinSyncRunStartInput,
    session?: PersistenceSession,
  ): Promise<TwinSyncRunRecord>;

  upsertEdge(
    input: TwinEdgeUpsertInput,
    session?: PersistenceSession,
  ): Promise<TwinEdgeRecord>;

  upsertEntity(
    input: TwinEntityUpsertInput,
    session?: PersistenceSession,
  ): Promise<TwinEntityRecord>;
}

export class InMemoryTwinRepository implements TwinRepository {
  private readonly entities = new Map<string, TwinEntityRecord>();
  private readonly entitiesByScope = new Map<string, string>();
  private readonly edges = new Map<string, TwinEdgeRecord>();
  private readonly edgesByScope = new Map<string, string>();
  private readonly runs = new Map<string, TwinSyncRunRecord>();

  async transaction<T>(
    operation: (session: PersistenceSession) => Promise<T>,
  ): Promise<T> {
    return operation(createMemorySession());
  }

  async getEntityById(
    entityId: string,
    _session?: PersistenceSession,
  ): Promise<TwinEntityRecord | null> {
    return this.entities.get(entityId) ?? null;
  }

  async getSyncRunById(
    runId: string,
    _session?: PersistenceSession,
  ): Promise<TwinSyncRunRecord | null> {
    return this.runs.get(runId) ?? null;
  }

  async listRepositoryEdges(
    repoFullName: string,
    _session?: PersistenceSession,
  ): Promise<TwinEdgeRecord[]> {
    return sortEdges(
      [...this.edges.values()].filter((edge) => edge.repoFullName === repoFullName),
    );
  }

  async listRepositoryEntities(
    repoFullName: string,
    _session?: PersistenceSession,
  ): Promise<TwinEntityRecord[]> {
    return sortEntities(
      [...this.entities.values()].filter(
        (entity) => entity.repoFullName === repoFullName,
      ),
    );
  }

  async listRepositoryRuns(
    repoFullName: string,
    _session?: PersistenceSession,
  ): Promise<TwinSyncRunRecord[]> {
    return sortRuns(
      [...this.runs.values()].filter((run) => run.repoFullName === repoFullName),
    );
  }

  async finishSyncRun(
    input: TwinSyncRunFinishInput,
    _session?: PersistenceSession,
  ): Promise<TwinSyncRunRecord> {
    const existing = this.runs.get(input.runId);

    if (!existing) {
      throw new Error(`Twin sync run ${input.runId} not found`);
    }

    const updated: TwinSyncRunRecord = {
      ...existing,
      status: input.status,
      completedAt: input.completedAt ?? existing.completedAt ?? existing.startedAt,
      errorSummary: input.errorSummary ?? null,
      stats: input.stats ?? existing.stats,
    };

    this.runs.set(updated.id, updated);
    return updated;
  }

  async startSyncRun(
    input: TwinSyncRunStartInput,
    _session?: PersistenceSession,
  ): Promise<TwinSyncRunRecord> {
    const startedAt = input.startedAt ?? new Date().toISOString();
    const run: TwinSyncRunRecord = {
      id: crypto.randomUUID(),
      repoFullName: input.repoFullName,
      extractor: input.extractor,
      status: "running",
      startedAt,
      completedAt: null,
      stats: input.stats ?? {},
      errorSummary: null,
      createdAt: startedAt,
    };

    this.runs.set(run.id, run);
    return run;
  }

  async upsertEdge(
    input: TwinEdgeUpsertInput,
    _session?: PersistenceSession,
  ): Promise<TwinEdgeRecord> {
    const scopeKey = buildEdgeScopeKey(input);
    const existingId = this.edgesByScope.get(scopeKey);
    const existing = existingId ? this.edges.get(existingId) : null;
    const now = new Date().toISOString();
    const next: TwinEdgeRecord = {
      id: existing?.id ?? crypto.randomUUID(),
      repoFullName: input.repoFullName,
      kind: input.kind,
      fromEntityId: input.fromEntityId,
      toEntityId: input.toEntityId,
      payload: input.payload ?? {},
      observedAt: input.observedAt,
      sourceRunId: input.sourceRunId ?? null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    this.edges.set(next.id, next);
    this.edgesByScope.set(scopeKey, next.id);
    return next;
  }

  async upsertEntity(
    input: TwinEntityUpsertInput,
    _session?: PersistenceSession,
  ): Promise<TwinEntityRecord> {
    const scopeKey = buildEntityScopeKey(input);
    const existingId = this.entitiesByScope.get(scopeKey);
    const existing = existingId ? this.entities.get(existingId) : null;
    const now = new Date().toISOString();
    const next: TwinEntityRecord = {
      id: existing?.id ?? crypto.randomUUID(),
      repoFullName: input.repoFullName,
      kind: input.kind,
      stableKey: input.stableKey,
      title: input.title,
      summary: input.summary ?? null,
      payload: input.payload ?? {},
      observedAt: input.observedAt,
      staleAfter: input.staleAfter ?? null,
      sourceRunId: input.sourceRunId ?? null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    this.entities.set(next.id, next);
    this.entitiesByScope.set(scopeKey, next.id);
    return next;
  }
}

function buildEntityScopeKey(input: {
  repoFullName: string;
  kind: string;
  stableKey: string;
}) {
  return `${input.repoFullName}::${input.kind}::${input.stableKey}`;
}

function buildEdgeScopeKey(input: {
  repoFullName: string;
  kind: string;
  fromEntityId: string;
  toEntityId: string;
}) {
  return `${input.repoFullName}::${input.kind}::${input.fromEntityId}::${input.toEntityId}`;
}

function sortEntities(entities: TwinEntityRecord[]) {
  return entities.sort((left, right) => {
    return (
      right.observedAt.localeCompare(left.observedAt) ||
      right.updatedAt.localeCompare(left.updatedAt) ||
      left.kind.localeCompare(right.kind) ||
      left.stableKey.localeCompare(right.stableKey)
    );
  });
}

function sortEdges(edges: TwinEdgeRecord[]) {
  return edges.sort((left, right) => {
    return (
      right.observedAt.localeCompare(left.observedAt) ||
      right.updatedAt.localeCompare(left.updatedAt) ||
      left.kind.localeCompare(right.kind) ||
      left.fromEntityId.localeCompare(right.fromEntityId) ||
      left.toEntityId.localeCompare(right.toEntityId)
    );
  });
}

function sortRuns(runs: TwinSyncRunRecord[]) {
  return runs.sort((left, right) => {
    return (
      right.startedAt.localeCompare(left.startedAt) ||
      right.createdAt.localeCompare(left.createdAt) ||
      left.id.localeCompare(right.id)
    );
  });
}
