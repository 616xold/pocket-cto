import type { TwinRepositoryMetadataSyncResult } from "@pocket-cto/domain";
import type { GitHubRepositoryDetailResult } from "../github-app/schema";
import {
  buildTwinRepositoryMetadataSyncResult,
  toTwinRepositorySummary,
} from "./formatter";
import type {
  RepositoryMetadataEntityDraft,
  RepositoryMetadataSnapshot,
  TwinRepositoryMetadataExtractor,
} from "./repository-metadata-extractor";
import type { TwinRepository } from "./repository";
import type { TwinRepositorySourceResolver } from "./source-resolver";
import type {
  TwinEdgeRecord,
  TwinEntityRecord,
  TwinSyncRunRecord,
} from "./types";

type TwinRepositoryRegistryPort = {
  getRepository(fullName: string): Promise<GitHubRepositoryDetailResult>;
  resolveWritableRepository(fullName: string): Promise<unknown>;
};

export const metadataExtractorName = "repository_metadata";

export async function syncRepositoryMetadata(input: {
  metadataExtractor: TwinRepositoryMetadataExtractor;
  now: () => Date;
  repoFullName: string;
  repository: TwinRepository;
  repositoryRegistry: TwinRepositoryRegistryPort;
  sourceResolver: TwinRepositorySourceResolver;
}): Promise<TwinRepositoryMetadataSyncResult> {
  const detail = await input.repositoryRegistry.getRepository(
    input.repoFullName,
  );
  const run = await startRepositoryMetadataRun(input);
  let snapshot: RepositoryMetadataSnapshot | null = null;

  try {
    const source = await input.sourceResolver.resolveRepositorySource(
      input.repoFullName,
    );
    snapshot = await input.metadataExtractor.extract({
      repository: detail.repository,
      repoRoot: source.repoRoot,
    });
    const persisted = await persistMetadataSnapshot({
      observedAt: run.startedAt,
      repoFullName: input.repoFullName,
      repository: input.repository,
      runId: run.id,
      snapshot,
    });
    const finishedRun = await finishRepositoryMetadataRun({
      errorSummary: null,
      now: input.now,
      repository: input.repository,
      run,
      status: "succeeded",
      stats: buildSyncStats(
        snapshot,
        persisted.entities.length,
        persisted.edges.length,
      ),
    });

    return buildTwinRepositoryMetadataSyncResult({
      repository: toTwinRepositorySummary(detail),
      syncRun: finishedRun,
      entities: persisted.entities,
      edges: persisted.edges,
    });
  } catch (error) {
    await finishRepositoryMetadataRun({
      errorSummary: toErrorSummary(error),
      now: input.now,
      repository: input.repository,
      run,
      status: "failed",
      stats: buildSyncStats(snapshot, 0, 0),
    });
    throw error;
  }
}

async function finishRepositoryMetadataRun(input: {
  errorSummary: string | null;
  now: () => Date;
  repository: TwinRepository;
  run: TwinSyncRunRecord;
  stats: Record<string, number>;
  status: "failed" | "succeeded";
}) {
  return input.repository.finishSyncRun({
    runId: input.run.id,
    status: input.status,
    completedAt: input.now().toISOString(),
    errorSummary: input.errorSummary,
    stats: input.stats,
  });
}

async function persistMetadataSnapshot(input: {
  observedAt: string;
  repoFullName: string;
  repository: TwinRepository;
  runId: string;
  snapshot: RepositoryMetadataSnapshot;
}) {
  return input.repository.transaction(async (session) => {
    const entityIdByKey = new Map<string, string>();
    const entities: TwinEntityRecord[] = [];
    const edges: TwinEdgeRecord[] = [];

    for (const entityDraft of input.snapshot.entities) {
      const entity = await input.repository.upsertEntity(
        {
          repoFullName: input.repoFullName,
          kind: entityDraft.kind,
          stableKey: entityDraft.stableKey,
          title: entityDraft.title,
          summary: entityDraft.summary,
          payload: entityDraft.payload,
          observedAt: input.observedAt,
          sourceRunId: input.runId,
        },
        session,
      );

      entityIdByKey.set(buildEntityKey(entityDraft), entity.id);
      entities.push(entity);
    }

    for (const edgeDraft of input.snapshot.edges) {
      const edge = await input.repository.upsertEdge(
        {
          repoFullName: input.repoFullName,
          kind: edgeDraft.kind,
          fromEntityId: getRequiredEntityId(entityIdByKey, {
            kind: edgeDraft.fromKind,
            stableKey: edgeDraft.fromStableKey,
          }),
          toEntityId: getRequiredEntityId(entityIdByKey, {
            kind: edgeDraft.toKind,
            stableKey: edgeDraft.toStableKey,
          }),
          payload: edgeDraft.payload,
          observedAt: input.observedAt,
          sourceRunId: input.runId,
        },
        session,
      );

      edges.push(edge);
    }

    return {
      edges,
      entities,
    };
  });
}

async function startRepositoryMetadataRun(input: {
  now: () => Date;
  repoFullName: string;
  repository: TwinRepository;
  repositoryRegistry: TwinRepositoryRegistryPort;
}) {
  await input.repositoryRegistry.resolveWritableRepository(input.repoFullName);

  return input.repository.startSyncRun({
    repoFullName: input.repoFullName,
    extractor: metadataExtractorName,
    startedAt: input.now().toISOString(),
    stats: {},
  });
}

function buildEntityKey(
  input: Pick<RepositoryMetadataEntityDraft, "kind" | "stableKey">,
) {
  return `${input.kind}::${input.stableKey}`;
}

function buildSyncStats(
  snapshot: RepositoryMetadataSnapshot | null,
  entityCount: number,
  edgeCount: number,
) {
  return {
    entityCount,
    edgeCount,
    manifestCount: snapshot?.manifests ?? 0,
    directoryCount: snapshot?.directories ?? 0,
  };
}

function getRequiredEntityId(
  entityIdByKey: Map<string, string>,
  input: Pick<RepositoryMetadataEntityDraft, "kind" | "stableKey">,
) {
  const entityId = entityIdByKey.get(buildEntityKey(input));

  if (!entityId) {
    throw new Error(
      `Twin metadata entity ${input.kind}:${input.stableKey} was not persisted`,
    );
  }

  return entityId;
}

function toErrorSummary(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
