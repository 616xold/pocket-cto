import type { TwinRepositoryDocsSyncResult } from "@pocket-cto/domain";
import type {
  GitHubRepositoryDetailResult,
  GitHubRepositorySummary,
} from "../github-app/schema";
import { discoverDocumentationFiles } from "./docs-discovery";
import { parseDocumentationFile } from "./docs-parser";
import { buildTwinRepositoryDocsSyncResult } from "./docs-formatter";
import { toTwinRepositorySummary } from "./formatter";
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

type DocsEntityDraft = {
  kind: string;
  payload: Record<string, unknown>;
  stableKey: string;
  summary: string | null;
  title: string;
};

type DocsEdgeDraft = {
  fromKind: string;
  fromStableKey: string;
  kind: string;
  payload: Record<string, unknown>;
  toKind: string;
  toStableKey: string;
};

type DocsSnapshot = {
  docFileCount: number;
  docSectionCount: number;
  edges: DocsEdgeDraft[];
  entities: DocsEntityDraft[];
};

export const docsExtractorName = "repository_docs";

export const docsTwinEntityKinds = ["doc_file", "doc_section"] as const;

export const docsTwinEdgeKinds = [
  "repository_has_doc_file",
  "doc_file_contains_section",
] as const;

export async function syncRepositoryDocs(input: {
  now: () => Date;
  repoFullName: string;
  repository: TwinRepository;
  repositoryRegistry: TwinRepositoryRegistryPort;
  sourceResolver: TwinRepositorySourceResolver;
}): Promise<TwinRepositoryDocsSyncResult> {
  const detail = await input.repositoryRegistry.getRepository(input.repoFullName);
  const run = await startDocsRun(input);
  let snapshot: DocsSnapshot | null = null;

  try {
    const source = await input.sourceResolver.resolveRepositorySource(
      input.repoFullName,
    );
    snapshot = await extractDocsSnapshot({
      repoRoot: source.repoRoot,
      repository: detail.repository,
    });
    const persisted = await persistDocsSnapshot({
      observedAt: run.startedAt,
      repoFullName: input.repoFullName,
      repository: input.repository,
      runId: run.id,
      snapshot,
    });
    const finishedRun = await finishDocsRun({
      errorSummary: null,
      now: input.now,
      repository: input.repository,
      run,
      stats: buildDocsSyncStats(
        snapshot,
        persisted.entities.length,
        persisted.edges.length,
      ),
      status: "succeeded",
    });

    return buildTwinRepositoryDocsSyncResult({
      docFileCount: snapshot.docFileCount,
      docSectionCount: snapshot.docSectionCount,
      edgeCount: persisted.edges.length,
      edges: persisted.edges,
      entities: persisted.entities,
      entityCount: persisted.entities.length,
      repository: toTwinRepositorySummary(detail),
      syncRun: finishedRun,
    });
  } catch (error) {
    await finishDocsRun({
      errorSummary: toErrorSummary(error),
      now: input.now,
      repository: input.repository,
      run,
      stats: buildDocsSyncStats(snapshot, 0, 0),
      status: "failed",
    });
    throw error;
  }
}

async function extractDocsSnapshot(input: {
  repoRoot: string;
  repository: GitHubRepositorySummary;
}): Promise<DocsSnapshot> {
  const discoveredFiles = await discoverDocumentationFiles(input.repoRoot);
  const parsedFiles = discoveredFiles.map((file) => parseDocumentationFile(file));
  const entities: DocsEntityDraft[] = [buildRepositoryEntityDraft(input.repository)];
  const edges: DocsEdgeDraft[] = [];
  let docSectionCount = 0;

  for (const file of parsedFiles) {
    entities.push({
      kind: "doc_file",
      payload: {
        contentDigest: file.contentDigest,
        headingCount: file.headingCount,
        lineCount: file.lineCount,
        modifiedAt: file.modifiedAt,
        path: file.path,
        sizeBytes: file.sizeBytes,
        titleFallback: file.titleFallback,
      },
      stableKey: file.path,
      summary: "Stored repository documentation file within the approved docs scope.",
      title: file.titleFallback,
    });
    edges.push({
      fromKind: "repository",
      fromStableKey: "repository",
      kind: "repository_has_doc_file",
      payload: {
        path: file.path,
      },
      toKind: "doc_file",
      toStableKey: file.path,
    });

    for (const section of file.sections) {
      docSectionCount += 1;
      entities.push({
        kind: "doc_section",
        payload: {
          anchor: section.anchor,
          excerpt: section.excerpt,
          headingLevel: section.headingLevel,
          headingPath: section.headingPath,
          headingText: section.headingText,
          ordinal: section.ordinal,
          sourceFilePath: section.sourceFilePath,
        },
        stableKey: section.stableKey,
        summary: "Stored Markdown heading section extracted from repository documentation.",
        title: section.headingPath,
      });
      edges.push({
        fromKind: "doc_file",
        fromStableKey: file.path,
        kind: "doc_file_contains_section",
        payload: {
          anchor: section.anchor,
          ordinal: section.ordinal,
        },
        toKind: "doc_section",
        toStableKey: section.stableKey,
      });
    }
  }

  return {
    docFileCount: parsedFiles.length,
    docSectionCount,
    edges,
    entities,
  };
}

async function persistDocsSnapshot(input: {
  observedAt: string;
  repoFullName: string;
  repository: TwinRepository;
  runId: string;
  snapshot: DocsSnapshot;
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

async function startDocsRun(input: {
  now: () => Date;
  repoFullName: string;
  repository: TwinRepository;
  repositoryRegistry: TwinRepositoryRegistryPort;
}) {
  await input.repositoryRegistry.resolveWritableRepository(input.repoFullName);

  return input.repository.startSyncRun({
    repoFullName: input.repoFullName,
    extractor: docsExtractorName,
    startedAt: input.now().toISOString(),
    stats: {},
  });
}

async function finishDocsRun(input: {
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

function buildRepositoryEntityDraft(
  repository: GitHubRepositorySummary,
): DocsEntityDraft {
  return {
    kind: "repository",
    payload: {
      archived: repository.archived,
      defaultBranch: repository.defaultBranch,
      disabled: repository.disabled,
      fullName: repository.fullName,
      isActive: repository.isActive,
      visibility: repository.visibility,
    },
    stableKey: "repository",
    summary: "Synced repository registry metadata.",
    title: repository.fullName,
  };
}

function buildEntityKey(input: Pick<DocsEntityDraft, "kind" | "stableKey">) {
  return `${input.kind}::${input.stableKey}`;
}

function getRequiredEntityId(
  entityIdByKey: Map<string, string>,
  input: Pick<DocsEntityDraft, "kind" | "stableKey">,
) {
  const entityId = entityIdByKey.get(buildEntityKey(input));

  if (!entityId) {
    throw new Error(`Twin docs entity ${input.kind}:${input.stableKey} was not persisted`);
  }

  return entityId;
}

function buildDocsSyncStats(
  snapshot: DocsSnapshot | null,
  entityCount: number,
  edgeCount: number,
) {
  return {
    docFileCount: snapshot?.docFileCount ?? 0,
    docSectionCount: snapshot?.docSectionCount ?? 0,
    edgeCount,
    entityCount,
  };
}

function toErrorSummary(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
