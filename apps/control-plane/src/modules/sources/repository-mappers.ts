import type {
  provenanceRecords,
  sourceFiles,
  sourceSnapshots,
  sources,
} from "@pocket-cto/db";
import type {
  ProvenanceRecord,
  SourceFileRecord,
  SourceRecord,
  SourceSnapshotRecord,
} from "@pocket-cto/domain";

type SourceRow = typeof sources.$inferSelect;
type SourceSnapshotRow = typeof sourceSnapshots.$inferSelect;
type SourceFileRow = typeof sourceFiles.$inferSelect;
type ProvenanceRecordRow = typeof provenanceRecords.$inferSelect;

export function mapSourceRow(row: SourceRow): SourceRecord {
  return {
    id: row.id,
    kind: row.kind,
    originKind: row.originKind,
    name: row.name,
    description: row.description,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapSourceSnapshotRow(
  row: SourceSnapshotRow,
): SourceSnapshotRecord {
  return {
    id: row.id,
    sourceId: row.sourceId,
    version: row.version,
    originalFileName: row.originalFileName,
    mediaType: row.mediaType,
    sizeBytes: row.sizeBytes,
    checksumSha256: row.checksumSha256,
    storageKind: row.storageKind,
    storageRef: row.storageRef,
    capturedAt: row.capturedAt.toISOString(),
    ingestStatus: row.ingestStatus,
    ingestErrorSummary: row.ingestErrorSummary,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapSourceFileRow(row: SourceFileRow): SourceFileRecord {
  return {
    id: row.id,
    sourceId: row.sourceId,
    sourceSnapshotId: row.sourceSnapshotId,
    originalFileName: row.originalFileName,
    mediaType: row.mediaType,
    sizeBytes: row.sizeBytes,
    checksumSha256: row.checksumSha256,
    storageKind: row.storageKind,
    storageRef: row.storageRef,
    createdBy: row.createdBy,
    capturedAt: row.capturedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapProvenanceRecordRow(
  row: ProvenanceRecordRow,
): ProvenanceRecord {
  return {
    id: row.id,
    sourceId: row.sourceId,
    sourceSnapshotId: row.sourceSnapshotId,
    sourceFileId: row.sourceFileId,
    kind: row.kind,
    recordedBy: row.recordedBy,
    recordedAt: row.recordedAt.toISOString(),
  };
}
