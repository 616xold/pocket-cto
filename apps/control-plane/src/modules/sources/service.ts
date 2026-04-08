import { createHash } from "node:crypto";
import {
  CreateSourceInputSchema,
  RegisterSourceFileMetadataSchema,
  SourceFileDetailViewSchema,
  SourceFileListViewSchema,
  SourceDetailViewSchema,
  SourceListViewSchema,
  type CreateSourceInput,
  type RegisterSourceFileMetadata,
  type SourceFileDetailView,
  type SourceFileListView,
  type SourceFileSummary,
  type SourceDetailView,
  type SourceListView,
  type SourceSnapshotRecord,
  type SourceSummary,
} from "@pocket-cto/domain";
import { SourceFileNotFoundError, SourceNotFoundError } from "./errors";
import type { SourceRepository } from "./repository";
import type { SourceFileStorage } from "./storage";

export class SourceRegistryService {
  private readonly now: () => Date;

  constructor(
    private readonly repository: SourceRepository,
    private readonly storage: SourceFileStorage,
    now?: () => Date,
  ) {
    this.now = now ?? (() => new Date());
  }

  async createSource(input: CreateSourceInput): Promise<SourceDetailView> {
    const parsed = CreateSourceInputSchema.parse(input);
    const capturedAt = parsed.snapshot.capturedAt ?? this.now().toISOString();

    const detail = await this.repository.transaction(async (session) => {
      const source = await this.repository.createSource(
        {
          kind: parsed.kind,
          originKind: parsed.originKind,
          name: parsed.name,
          description: parsed.description ?? null,
          createdBy: parsed.createdBy,
        },
        session,
      );

      const snapshot = await this.repository.createSnapshot(
        {
          sourceId: source.id,
          version: 1,
          originalFileName: parsed.snapshot.originalFileName,
          mediaType: parsed.snapshot.mediaType,
          sizeBytes: parsed.snapshot.sizeBytes,
          checksumSha256: parsed.snapshot.checksumSha256,
          storageKind: parsed.snapshot.storageKind,
          storageRef: parsed.snapshot.storageRef,
          capturedAt,
          ingestStatus: parsed.snapshot.ingestStatus,
        },
        session,
      );

      return {
        source,
        snapshots: [snapshot],
      };
    });

    return SourceDetailViewSchema.parse(detail);
  }

  async getSource(sourceId: string): Promise<SourceDetailView> {
    const source = await this.repository.getSourceById(sourceId);

    if (!source) {
      throw new SourceNotFoundError(sourceId);
    }

    return SourceDetailViewSchema.parse({
      source,
      snapshots: await this.repository.listSnapshotsBySourceId(sourceId),
    });
  }

  async listSources(input: { limit: number }): Promise<SourceListView> {
    const sources = await this.repository.listSources(input);
    const snapshots = await this.repository.listSnapshotsBySourceIds(
      sources.map((source) => source.id),
    );
    const snapshotsBySourceId = groupSnapshotsBySourceId(snapshots);
    const summaries: SourceSummary[] = sources.map((source) => {
      const sourceSnapshots = snapshotsBySourceId.get(source.id) ?? [];

      return {
        ...source,
        latestSnapshot: sourceSnapshots[0] ?? null,
        snapshotCount: sourceSnapshots.length,
      };
    });

    return SourceListViewSchema.parse({
      limit: input.limit,
      sourceCount: summaries.length,
      sources: summaries,
    });
  }

  async registerSourceFile(
    sourceId: string,
    metadata: RegisterSourceFileMetadata,
    body: Buffer,
  ): Promise<SourceFileDetailView> {
    const parsed = RegisterSourceFileMetadataSchema.parse(metadata);
    const source = await this.repository.getSourceById(sourceId);

    if (!source) {
      throw new SourceNotFoundError(sourceId);
    }

    const recordedAt = this.now().toISOString();
    const capturedAt = parsed.capturedAt ?? recordedAt;
    const checksumSha256 = createHash("sha256").update(body).digest("hex");
    const storedFile = await this.storage.write({
      body,
      checksumSha256,
      mediaType: parsed.mediaType,
      originalFileName: parsed.originalFileName,
      sourceId,
    });

    const detail = await this.repository.transaction(async (session) => {
      const nextVersion =
        (await this.repository.getLatestSnapshotVersion(sourceId, session)) + 1;
      const snapshot = await this.repository.createSnapshot(
        {
          sourceId,
          version: nextVersion,
          originalFileName: parsed.originalFileName,
          mediaType: parsed.mediaType,
          sizeBytes: body.byteLength,
          checksumSha256,
          storageKind: storedFile.storageKind,
          storageRef: storedFile.storageRef,
          capturedAt,
          ingestStatus: "registered",
        },
        session,
      );
      const sourceFile = await this.repository.createSourceFile(
        {
          sourceId,
          sourceSnapshotId: snapshot.id,
          originalFileName: parsed.originalFileName,
          mediaType: parsed.mediaType,
          sizeBytes: body.byteLength,
          checksumSha256,
          storageKind: storedFile.storageKind,
          storageRef: storedFile.storageRef,
          createdBy: parsed.createdBy,
          capturedAt,
        },
        session,
      );
      const provenanceRecord = await this.repository.createProvenanceRecord(
        {
          sourceId,
          sourceSnapshotId: snapshot.id,
          sourceFileId: sourceFile.id,
          kind: "source_file_registered",
          recordedBy: parsed.createdBy,
          recordedAt,
        },
        session,
      );

      return {
        provenanceRecords: [provenanceRecord],
        snapshot,
        sourceFile,
      };
    });

    return SourceFileDetailViewSchema.parse(detail);
  }

  async listSourceFiles(sourceId: string): Promise<SourceFileListView> {
    const source = await this.repository.getSourceById(sourceId);

    if (!source) {
      throw new SourceNotFoundError(sourceId);
    }

    const [sourceFiles, snapshots] = await Promise.all([
      this.repository.listSourceFilesBySourceId(sourceId),
      this.repository.listSnapshotsBySourceId(sourceId),
    ]);
    const snapshotVersionById = new Map(
      snapshots.map((snapshot) => [snapshot.id, snapshot.version]),
    );
    const files: SourceFileSummary[] = sourceFiles.map((sourceFile) => {
      const snapshotVersion = snapshotVersionById.get(sourceFile.sourceSnapshotId);

      if (!snapshotVersion) {
        throw new Error(
          `Source file ${sourceFile.id} is missing its linked snapshot version`,
        );
      }

      return {
        ...sourceFile,
        snapshotVersion,
      };
    });

    return SourceFileListViewSchema.parse({
      fileCount: files.length,
      files,
      sourceId,
    });
  }

  async getSourceFile(sourceFileId: string): Promise<SourceFileDetailView> {
    const sourceFile = await this.repository.getSourceFileById(sourceFileId);

    if (!sourceFile) {
      throw new SourceFileNotFoundError(sourceFileId);
    }

    const [snapshot, provenanceRecords] = await Promise.all([
      this.repository.getSnapshotById(sourceFile.sourceSnapshotId),
      this.repository.listProvenanceRecordsBySourceFileId(sourceFile.id),
    ]);

    if (!snapshot) {
      throw new Error(
        `Source file ${sourceFile.id} is missing its linked snapshot`,
      );
    }

    return SourceFileDetailViewSchema.parse({
      provenanceRecords,
      snapshot,
      sourceFile,
    });
  }
}

function groupSnapshotsBySourceId(snapshots: SourceSnapshotRecord[]) {
  const grouped = new Map<string, SourceSnapshotRecord[]>();

  for (const snapshot of snapshots) {
    const existing = grouped.get(snapshot.sourceId) ?? [];
    existing.push(snapshot);
    grouped.set(snapshot.sourceId, existing);
  }

  return grouped;
}
