import { asc, desc, eq } from "drizzle-orm";
import {
  twinEdges,
  twinEntities,
  twinSyncRuns,
  type Db,
  type DbTransaction,
} from "@pocket-cto/db";
import {
  createDbSession,
  getDbExecutor,
  type PersistenceSession,
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
import type { TwinRepository } from "./repository";

export class DrizzleTwinRepository implements TwinRepository {
  constructor(private readonly db: Db) {}

  async transaction<T>(
    operation: (session: PersistenceSession) => Promise<T>,
  ): Promise<T> {
    return this.db.transaction(async (tx: DbTransaction) =>
      operation(createDbSession(tx)),
    );
  }

  async getEntityById(
    entityId: string,
    session?: PersistenceSession,
  ): Promise<TwinEntityRecord | null> {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .select()
      .from(twinEntities)
      .where(eq(twinEntities.id, entityId))
      .limit(1);

    return row ? mapTwinEntityRow(row) : null;
  }

  async getSyncRunById(
    runId: string,
    session?: PersistenceSession,
  ): Promise<TwinSyncRunRecord | null> {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .select()
      .from(twinSyncRuns)
      .where(eq(twinSyncRuns.id, runId))
      .limit(1);

    return row ? mapTwinSyncRunRow(row) : null;
  }

  async listRepositoryEdges(
    repoFullName: string,
    session?: PersistenceSession,
  ): Promise<TwinEdgeRecord[]> {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select()
      .from(twinEdges)
      .where(eq(twinEdges.repoFullName, repoFullName))
      .orderBy(
        desc(twinEdges.observedAt),
        desc(twinEdges.updatedAt),
        asc(twinEdges.kind),
        asc(twinEdges.fromEntityId),
        asc(twinEdges.toEntityId),
      );

    return rows.map(mapTwinEdgeRow);
  }

  async listRepositoryEntities(
    repoFullName: string,
    session?: PersistenceSession,
  ): Promise<TwinEntityRecord[]> {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select()
      .from(twinEntities)
      .where(eq(twinEntities.repoFullName, repoFullName))
      .orderBy(
        desc(twinEntities.observedAt),
        desc(twinEntities.updatedAt),
        asc(twinEntities.kind),
        asc(twinEntities.stableKey),
      );

    return rows.map(mapTwinEntityRow);
  }

  async listRepositoryRuns(
    repoFullName: string,
    session?: PersistenceSession,
  ): Promise<TwinSyncRunRecord[]> {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select()
      .from(twinSyncRuns)
      .where(eq(twinSyncRuns.repoFullName, repoFullName))
      .orderBy(
        desc(twinSyncRuns.startedAt),
        desc(twinSyncRuns.createdAt),
        asc(twinSyncRuns.id),
      );

    return rows.map(mapTwinSyncRunRow);
  }

  async finishSyncRun(
    input: TwinSyncRunFinishInput,
    session?: PersistenceSession,
  ): Promise<TwinSyncRunRecord> {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .update(twinSyncRuns)
      .set({
        status: input.status,
        completedAt: input.completedAt
          ? new Date(input.completedAt)
          : new Date(),
        stats: input.stats ?? undefined,
        errorSummary: input.errorSummary ?? null,
      })
      .where(eq(twinSyncRuns.id, input.runId))
      .returning();

    return mapTwinSyncRunRow(
      getRequiredRow(row, `Twin sync run ${input.runId} was not updated`),
    );
  }

  async startSyncRun(
    input: TwinSyncRunStartInput,
    session?: PersistenceSession,
  ): Promise<TwinSyncRunRecord> {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .insert(twinSyncRuns)
      .values({
        repoFullName: input.repoFullName,
        extractor: input.extractor,
        status: "running",
        startedAt: input.startedAt ? new Date(input.startedAt) : new Date(),
        stats: input.stats ?? {},
      })
      .returning();

    return mapTwinSyncRunRow(
      getRequiredRow(row, "Twin sync run insert did not return a row"),
    );
  }

  async upsertEdge(
    input: TwinEdgeUpsertInput,
    session?: PersistenceSession,
  ): Promise<TwinEdgeRecord> {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .insert(twinEdges)
      .values({
        fromEntityId: input.fromEntityId,
        toEntityId: input.toEntityId,
        relationType: input.kind,
        sourceRef: input.sourceRunId ?? null,
        weight: 1,
        repoFullName: input.repoFullName,
        kind: input.kind,
        payload: input.payload ?? {},
        observedAt: new Date(input.observedAt),
        sourceRunId: input.sourceRunId ?? null,
      })
      .onConflictDoUpdate({
        target: [
          twinEdges.repoFullName,
          twinEdges.kind,
          twinEdges.fromEntityId,
          twinEdges.toEntityId,
        ],
        set: {
          relationType: input.kind,
          sourceRef: input.sourceRunId ?? null,
          payload: input.payload ?? {},
          observedAt: new Date(input.observedAt),
          sourceRunId: input.sourceRunId ?? null,
          updatedAt: new Date(),
        },
      })
      .returning();

    return mapTwinEdgeRow(
      getRequiredRow(row, "Twin edge upsert did not return a row"),
    );
  }

  async upsertEntity(
    input: TwinEntityUpsertInput,
    session?: PersistenceSession,
  ): Promise<TwinEntityRecord> {
    const executor = this.getExecutor(session);
    const legacyType = toLegacyTwinEntityType(input.kind);
    const [row] = await executor
      .insert(twinEntities)
      .values({
        type: legacyType,
        key: input.stableKey,
        title: input.title,
        repo: input.repoFullName,
        freshnessStatus: "unknown",
        lastObservedAt: input.observedAt,
        metadata: input.payload ?? {},
        repoFullName: input.repoFullName,
        kind: input.kind,
        stableKey: input.stableKey,
        summary: input.summary ?? null,
        payload: input.payload ?? {},
        observedAt: new Date(input.observedAt),
        staleAfter: input.staleAfter ? new Date(input.staleAfter) : null,
        sourceRunId: input.sourceRunId ?? null,
      })
      .onConflictDoUpdate({
        target: [
          twinEntities.repoFullName,
          twinEntities.kind,
          twinEntities.stableKey,
        ],
        set: {
          type: legacyType,
          key: input.stableKey,
          title: input.title,
          repo: input.repoFullName,
          freshnessStatus: "unknown",
          lastObservedAt: input.observedAt,
          metadata: input.payload ?? {},
          summary: input.summary ?? null,
          payload: input.payload ?? {},
          observedAt: new Date(input.observedAt),
          staleAfter: input.staleAfter ? new Date(input.staleAfter) : null,
          sourceRunId: input.sourceRunId ?? null,
          updatedAt: new Date(),
        },
      })
      .returning();

    return mapTwinEntityRow(
      getRequiredRow(row, "Twin entity upsert did not return a row"),
    );
  }

  private getExecutor(session?: PersistenceSession) {
    return getDbExecutor(session) ?? this.db;
  }
}

function mapTwinEntityRow(
  row: typeof twinEntities.$inferSelect,
): TwinEntityRecord {
  return {
    id: row.id,
    repoFullName: row.repoFullName,
    kind: row.kind,
    stableKey: row.stableKey,
    title: row.title,
    summary: row.summary,
    payload: readJsonObject(row.payload),
    observedAt: row.observedAt.toISOString(),
    staleAfter: row.staleAfter ? row.staleAfter.toISOString() : null,
    sourceRunId: row.sourceRunId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapTwinEdgeRow(row: typeof twinEdges.$inferSelect): TwinEdgeRecord {
  return {
    id: row.id,
    repoFullName: row.repoFullName,
    kind: row.kind,
    fromEntityId: row.fromEntityId,
    toEntityId: row.toEntityId,
    payload: readJsonObject(row.payload),
    observedAt: row.observedAt.toISOString(),
    sourceRunId: row.sourceRunId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapTwinSyncRunRow(
  row: typeof twinSyncRuns.$inferSelect,
): TwinSyncRunRecord {
  return {
    id: row.id,
    repoFullName: row.repoFullName,
    extractor: row.extractor,
    status: row.status,
    startedAt: row.startedAt.toISOString(),
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    stats: readJsonObject(row.stats),
    errorSummary: row.errorSummary,
    createdAt: row.createdAt.toISOString(),
  };
}

const legacyTwinEntityTypes = [
  "repository",
  "service",
  "package",
  "owner",
  "testSuite",
  "ciJob",
  "runbook",
  "dashboard",
  "flag",
  "doc",
] as const;

function readJsonObject(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function toLegacyTwinEntityType(
  kind: string,
): (typeof legacyTwinEntityTypes)[number] {
  if (kind === "runbook_document" || kind === "runbook_step") {
    return "runbook";
  }

  if (kind === "test_suite") {
    return "testSuite";
  }

  if (kind === "ci_job") {
    return "ciJob";
  }

  if (kind === "owner_principal") {
    return "owner";
  }

  return legacyTwinEntityTypes.includes(
    kind as (typeof legacyTwinEntityTypes)[number],
  )
    ? (kind as (typeof legacyTwinEntityTypes)[number])
    : "doc";
}

function getRequiredRow<T>(row: T | undefined, message: string): T {
  if (!row) {
    throw new Error(message);
  }

  return row;
}
