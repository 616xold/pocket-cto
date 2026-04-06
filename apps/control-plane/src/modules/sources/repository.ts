import type {
  SourceKind,
  SourceOriginKind,
  SourceRecord,
  SourceSnapshotIngestStatus,
  SourceSnapshotRecord,
  SourceSnapshotStorageKind,
} from "@pocket-cto/domain";
import {
  createMemorySession,
  type PersistenceSession,
  type TransactionalRepository,
} from "../../lib/persistence";

export type CreateSourceRecordInput = {
  kind: SourceKind;
  originKind: SourceOriginKind;
  name: string;
  description: string | null;
  createdBy: string;
};

export type CreateSourceSnapshotRecordInput = {
  sourceId: string;
  version: number;
  originalFileName: string;
  mediaType: string;
  sizeBytes: number;
  checksumSha256: string;
  storageKind: SourceSnapshotStorageKind;
  storageRef: string;
  capturedAt: string;
  ingestStatus: SourceSnapshotIngestStatus;
  ingestErrorSummary?: string | null;
};

export interface SourceRepository extends TransactionalRepository {
  createSource(
    input: CreateSourceRecordInput,
    session?: PersistenceSession,
  ): Promise<SourceRecord>;

  createSnapshot(
    input: CreateSourceSnapshotRecordInput,
    session?: PersistenceSession,
  ): Promise<SourceSnapshotRecord>;

  getSourceById(
    sourceId: string,
    session?: PersistenceSession,
  ): Promise<SourceRecord | null>;

  listSources(
    input: { limit: number },
    session?: PersistenceSession,
  ): Promise<SourceRecord[]>;

  listSnapshotsBySourceId(
    sourceId: string,
    session?: PersistenceSession,
  ): Promise<SourceSnapshotRecord[]>;

  listSnapshotsBySourceIds(
    sourceIds: string[],
    session?: PersistenceSession,
  ): Promise<SourceSnapshotRecord[]>;
}

export class InMemorySourceRepository implements SourceRepository {
  private readonly sources = new Map<string, SourceRecord>();
  private readonly snapshots = new Map<string, SourceSnapshotRecord>();

  async transaction<T>(
    operation: (session: PersistenceSession) => Promise<T>,
  ): Promise<T> {
    return operation(createMemorySession());
  }

  async createSource(input: CreateSourceRecordInput): Promise<SourceRecord> {
    const now = new Date().toISOString();
    const source: SourceRecord = {
      id: crypto.randomUUID(),
      kind: input.kind,
      originKind: input.originKind,
      name: input.name,
      description: input.description,
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    this.sources.set(source.id, source);
    return source;
  }

  async createSnapshot(
    input: CreateSourceSnapshotRecordInput,
  ): Promise<SourceSnapshotRecord> {
    const now = new Date().toISOString();
    const snapshot: SourceSnapshotRecord = {
      id: crypto.randomUUID(),
      sourceId: input.sourceId,
      version: input.version,
      originalFileName: input.originalFileName,
      mediaType: input.mediaType,
      sizeBytes: input.sizeBytes,
      checksumSha256: input.checksumSha256,
      storageKind: input.storageKind,
      storageRef: input.storageRef,
      capturedAt: input.capturedAt,
      ingestStatus: input.ingestStatus,
      ingestErrorSummary: input.ingestErrorSummary ?? null,
      createdAt: now,
      updatedAt: now,
    };

    this.snapshots.set(snapshot.id, snapshot);
    const source = this.sources.get(input.sourceId);

    if (source) {
      this.sources.set(source.id, {
        ...source,
        updatedAt: now,
      });
    }

    return snapshot;
  }

  async getSourceById(sourceId: string): Promise<SourceRecord | null> {
    return this.sources.get(sourceId) ?? null;
  }

  async listSources(input: { limit: number }): Promise<SourceRecord[]> {
    return [...this.sources.values()]
      .sort(sortSources)
      .slice(0, input.limit);
  }

  async listSnapshotsBySourceId(
    sourceId: string,
  ): Promise<SourceSnapshotRecord[]> {
    return [...this.snapshots.values()]
      .filter((snapshot) => snapshot.sourceId === sourceId)
      .sort(sortSnapshots);
  }

  async listSnapshotsBySourceIds(
    sourceIds: string[],
  ): Promise<SourceSnapshotRecord[]> {
    if (sourceIds.length === 0) {
      return [];
    }

    const sourceIdSet = new Set(sourceIds);

    return [...this.snapshots.values()]
      .filter((snapshot) => sourceIdSet.has(snapshot.sourceId))
      .sort(sortSnapshots);
  }
}

function sortSources(left: SourceRecord, right: SourceRecord) {
  return (
    right.updatedAt.localeCompare(left.updatedAt) ||
    right.createdAt.localeCompare(left.createdAt) ||
    left.name.localeCompare(right.name)
  );
}

function sortSnapshots(
  left: SourceSnapshotRecord,
  right: SourceSnapshotRecord,
) {
  return (
    right.version - left.version ||
    right.capturedAt.localeCompare(left.capturedAt) ||
    right.createdAt.localeCompare(left.createdAt)
  );
}
