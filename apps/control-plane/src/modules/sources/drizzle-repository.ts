import { asc, desc, eq, inArray } from "drizzle-orm";
import {
  sourceSnapshots,
  sources,
  type Db,
  type DbTransaction,
} from "@pocket-cto/db";
import {
  createDbSession,
  getDbExecutor,
  type PersistenceSession,
} from "../../lib/persistence";
import { mapSourceRow, mapSourceSnapshotRow } from "./repository-mappers";
import type {
  CreateSourceRecordInput,
  CreateSourceSnapshotRecordInput,
  SourceRepository,
} from "./repository";

export class DrizzleSourceRepository implements SourceRepository {
  constructor(private readonly db: Db) {}

  async transaction<T>(
    operation: (session: PersistenceSession) => Promise<T>,
  ): Promise<T> {
    return this.db.transaction(async (tx: DbTransaction) =>
      operation(createDbSession(tx)),
    );
  }

  async createSource(
    input: CreateSourceRecordInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .insert(sources)
      .values({
        kind: input.kind,
        originKind: input.originKind,
        name: input.name,
        description: input.description,
        createdBy: input.createdBy,
      })
      .returning();

    if (!row) {
      throw new Error("Source insert did not return a row");
    }

    return mapSourceRow(row);
  }

  async createSnapshot(
    input: CreateSourceSnapshotRecordInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .insert(sourceSnapshots)
      .values({
        sourceId: input.sourceId,
        version: input.version,
        originalFileName: input.originalFileName,
        mediaType: input.mediaType,
        sizeBytes: input.sizeBytes,
        checksumSha256: input.checksumSha256,
        storageKind: input.storageKind,
        storageRef: input.storageRef,
        capturedAt: new Date(input.capturedAt),
        ingestStatus: input.ingestStatus,
        ingestErrorSummary: input.ingestErrorSummary ?? null,
      })
      .returning();

    if (!row) {
      throw new Error("Source snapshot insert did not return a row");
    }

    await executor
      .update(sources)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(sources.id, input.sourceId));

    return mapSourceSnapshotRow(row);
  }

  async getSourceById(sourceId: string, session?: PersistenceSession) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .select()
      .from(sources)
      .where(eq(sources.id, sourceId))
      .limit(1);

    return row ? mapSourceRow(row) : null;
  }

  async listSources(
    input: { limit: number },
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select()
      .from(sources)
      .orderBy(desc(sources.updatedAt), desc(sources.createdAt), asc(sources.name))
      .limit(input.limit);

    return rows.map(mapSourceRow);
  }

  async listSnapshotsBySourceId(
    sourceId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select()
      .from(sourceSnapshots)
      .where(eq(sourceSnapshots.sourceId, sourceId))
      .orderBy(
        desc(sourceSnapshots.version),
        desc(sourceSnapshots.capturedAt),
        desc(sourceSnapshots.createdAt),
      );

    return rows.map(mapSourceSnapshotRow);
  }

  async listSnapshotsBySourceIds(
    sourceIds: string[],
    session?: PersistenceSession,
  ) {
    if (sourceIds.length === 0) {
      return [];
    }

    const executor = this.getExecutor(session);
    const rows = await executor
      .select()
      .from(sourceSnapshots)
      .where(inArray(sourceSnapshots.sourceId, sourceIds))
      .orderBy(
        desc(sourceSnapshots.version),
        desc(sourceSnapshots.capturedAt),
        desc(sourceSnapshots.createdAt),
      );

    return rows.map(mapSourceSnapshotRow);
  }

  private getExecutor(session?: PersistenceSession) {
    return getDbExecutor(session) ?? this.db;
  }
}
