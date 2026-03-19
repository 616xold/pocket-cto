import type { TwinRepositoryRunbooksSyncResult } from "@pocket-cto/domain";
import type {
  GitHubRepositoryDetailResult,
  GitHubRepositorySummary,
} from "../github-app/schema";
import { discoverDocumentationFiles } from "./docs-discovery";
import { parseDocumentationFile } from "./docs-parser";
import { toTwinRepositorySummary } from "./formatter";
import type { TwinRepository } from "./repository";
import { classifyRunbookDocuments } from "./runbook-classifier";
import { buildTwinRepositoryRunbooksSyncResult } from "./runbook-formatter";
import { extractRunbookDocument } from "./runbook-parser";
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

type RunbookEntityDraft = {
  kind: string;
  payload: Record<string, unknown>;
  stableKey: string;
  summary: string | null;
  title: string;
};

type RunbookEdgeDraft = {
  fromKind: string;
  fromStableKey: string;
  kind: string;
  payload: Record<string, unknown>;
  toKind: string;
  toStableKey: string;
};

type RunbookSnapshot = {
  commandFamilyCounts: Record<string, number>;
  edges: RunbookEdgeDraft[];
  entities: RunbookEntityDraft[];
  runbookDocumentCount: number;
  runbookStepCount: number;
};

export const runbookExtractorName = "repository_runbooks";

export const runbookTwinEntityKinds = [
  "runbook_document",
  "runbook_step",
] as const;

export const runbookTwinEdgeKinds = [
  "repository_has_runbook_document",
  "runbook_document_contains_step",
] as const;

export async function syncRepositoryRunbooks(input: {
  now: () => Date;
  repoFullName: string;
  repository: TwinRepository;
  repositoryRegistry: TwinRepositoryRegistryPort;
  sourceResolver: TwinRepositorySourceResolver;
}): Promise<TwinRepositoryRunbooksSyncResult> {
  const detail = await input.repositoryRegistry.getRepository(input.repoFullName);
  const run = await startRunbookRun(input);
  let snapshot: RunbookSnapshot | null = null;

  try {
    const source = await input.sourceResolver.resolveRepositorySource(
      input.repoFullName,
    );
    snapshot = await extractRunbookSnapshot({
      repoRoot: source.repoRoot,
      repository: detail.repository,
    });
    const persisted = await persistRunbookSnapshot({
      observedAt: run.startedAt,
      repoFullName: input.repoFullName,
      repository: input.repository,
      runId: run.id,
      snapshot,
    });
    const finishedRun = await finishRunbookRun({
      errorSummary: null,
      now: input.now,
      repository: input.repository,
      run,
      stats: buildRunbookSyncStats(
        snapshot,
        persisted.entities.length,
        persisted.edges.length,
      ),
      status: "succeeded",
    });

    return buildTwinRepositoryRunbooksSyncResult({
      commandFamilyCounts: snapshot.commandFamilyCounts,
      edgeCount: persisted.edges.length,
      edges: persisted.edges,
      entities: persisted.entities,
      entityCount: persisted.entities.length,
      repository: toTwinRepositorySummary(detail),
      runbookDocumentCount: snapshot.runbookDocumentCount,
      runbookStepCount: snapshot.runbookStepCount,
      syncRun: finishedRun,
    });
  } catch (error) {
    await finishRunbookRun({
      errorSummary: toErrorSummary(error),
      now: input.now,
      repository: input.repository,
      run,
      stats: buildRunbookSyncStats(snapshot, 0, 0),
      status: "failed",
    });
    throw error;
  }
}

async function extractRunbookSnapshot(input: {
  repoRoot: string;
  repository: GitHubRepositorySummary;
}): Promise<RunbookSnapshot> {
  const discoveredFiles = await discoverDocumentationFiles(input.repoRoot);
  const parsedFiles = discoveredFiles.map((file) => parseDocumentationFile(file));
  const discoveredFileByPath = new Map(
    discoveredFiles.map((file) => [file.path, file]),
  );
  const classifiedDocuments = classifyRunbookDocuments(parsedFiles);
  const entities: RunbookEntityDraft[] = [
    buildRepositoryEntityDraft(input.repository),
  ];
  const edges: RunbookEdgeDraft[] = [];
  const commandFamilyCounts: Record<string, number> = {};
  let runbookStepCount = 0;

  for (const classifiedDocument of classifiedDocuments) {
    const discoveredFile = discoveredFileByPath.get(classifiedDocument.file.path);

    if (!discoveredFile) {
      throw new Error(
        `Runbook source file ${classifiedDocument.file.path} disappeared during classification`,
      );
    }

    const runbookDocument = extractRunbookDocument({
      classificationReason: classifiedDocument.classificationReason,
      discoveredFile,
      parsedFile: classifiedDocument.file,
    });

    entities.push({
      kind: "runbook_document",
      payload: {
        classificationReason: runbookDocument.classificationReason,
        commandFamilyCounts: runbookDocument.commandFamilyCounts,
        contentDigest: runbookDocument.contentDigest,
        headingCount: runbookDocument.headingCount,
        lineCount: runbookDocument.lineCount,
        modifiedAt: runbookDocument.modifiedAt,
        path: runbookDocument.path,
        sizeBytes: runbookDocument.sizeBytes,
        stepCount: runbookDocument.stepCount,
        title: runbookDocument.title,
      },
      stableKey: runbookDocument.path,
      summary:
        "Stored operational runbook document classified from the deterministic docs scope.",
      title: runbookDocument.title,
    });
    edges.push({
      fromKind: "repository",
      fromStableKey: "repository",
      kind: "repository_has_runbook_document",
      payload: {
        classificationReason: runbookDocument.classificationReason,
        path: runbookDocument.path,
      },
      toKind: "runbook_document",
      toStableKey: runbookDocument.path,
    });

    for (const step of runbookDocument.steps) {
      runbookStepCount += 1;
      commandFamilyCounts[step.commandFamily] =
        (commandFamilyCounts[step.commandFamily] ?? 0) + 1;
      entities.push({
        kind: "runbook_step",
        payload: {
          commandFamily: step.commandFamily,
          commandText: step.commandText,
          headingContext: step.headingContext,
          ordinal: step.ordinal,
          purposeLabel: step.purposeLabel,
          sourceDocPath: step.sourceDocPath,
        },
        stableKey: step.stableKey,
        summary:
          "Stored deterministic operational command extracted from a runbook document.",
        title: `${runbookDocument.title} step ${step.ordinal}`,
      });
      edges.push({
        fromKind: "runbook_document",
        fromStableKey: runbookDocument.path,
        kind: "runbook_document_contains_step",
        payload: {
          commandFamily: step.commandFamily,
          ordinal: step.ordinal,
        },
        toKind: "runbook_step",
        toStableKey: step.stableKey,
      });
    }
  }

  return {
    commandFamilyCounts,
    edges,
    entities,
    runbookDocumentCount: classifiedDocuments.length,
    runbookStepCount,
  };
}

async function persistRunbookSnapshot(input: {
  observedAt: string;
  repoFullName: string;
  repository: TwinRepository;
  runId: string;
  snapshot: RunbookSnapshot;
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

async function startRunbookRun(input: {
  now: () => Date;
  repoFullName: string;
  repository: TwinRepository;
  repositoryRegistry: TwinRepositoryRegistryPort;
}) {
  await input.repositoryRegistry.resolveWritableRepository(input.repoFullName);

  return input.repository.startSyncRun({
    repoFullName: input.repoFullName,
    extractor: runbookExtractorName,
    startedAt: input.now().toISOString(),
    stats: {},
  });
}

async function finishRunbookRun(input: {
  errorSummary: string | null;
  now: () => Date;
  repository: TwinRepository;
  run: TwinSyncRunRecord;
  stats: Record<string, unknown>;
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
): RunbookEntityDraft {
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

function buildEntityKey(input: Pick<RunbookEntityDraft, "kind" | "stableKey">) {
  return `${input.kind}::${input.stableKey}`;
}

function getRequiredEntityId(
  entityIdByKey: Map<string, string>,
  input: Pick<RunbookEntityDraft, "kind" | "stableKey">,
) {
  const entityId = entityIdByKey.get(buildEntityKey(input));

  if (!entityId) {
    throw new Error(
      `Twin runbook entity ${input.kind}:${input.stableKey} was not persisted`,
    );
  }

  return entityId;
}

function buildRunbookSyncStats(
  snapshot: RunbookSnapshot | null,
  entityCount: number,
  edgeCount: number,
) {
  return {
    entityCount,
    edgeCount,
    runbookDocumentCount: snapshot?.runbookDocumentCount ?? 0,
    runbookStepCount: snapshot?.runbookStepCount ?? 0,
    commandFamilyCounts: snapshot?.commandFamilyCounts ?? {},
  };
}

function toErrorSummary(error: unknown) {
  return error instanceof Error ? error.message : "Unknown runbook sync failure";
}
