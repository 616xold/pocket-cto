import {
  CreateSourceInputSchema,
  SourceDetailViewSchema,
  SourceListViewSchema,
  type CreateSourceInput,
  type SourceDetailView,
  type SourceListView,
  type SourceSnapshotRecord,
  type SourceSummary,
} from "@pocket-cto/domain";
import { SourceNotFoundError } from "./errors";
import type { SourceRepository } from "./repository";

export class SourceRegistryService {
  private readonly now: () => Date;

  constructor(
    private readonly repository: SourceRepository,
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
