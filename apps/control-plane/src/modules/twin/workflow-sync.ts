import type { TwinRepositoryWorkflowSyncResult } from "@pocket-cto/domain";
import type {
  GitHubRepositoryDetailResult,
  GitHubRepositorySummary,
} from "../github-app/schema";
import { toTwinRepositorySummary } from "./formatter";
import type { TwinRepository } from "./repository";
import type { TwinRepositorySourceResolver } from "./source-resolver";
import type {
  TwinEdgeRecord,
  TwinEntityRecord,
  TwinSyncRunRecord,
} from "./types";
import { discoverWorkflowFiles } from "./workflow-discovery";
import { buildTwinRepositoryWorkflowSyncResult } from "./workflow-formatter";
import { parseWorkflowFile } from "./workflow-parser";

type TwinRepositoryRegistryPort = {
  getRepository(fullName: string): Promise<GitHubRepositoryDetailResult>;
  resolveWritableRepository(fullName: string): Promise<unknown>;
};

type WorkflowEntityDraft = {
  kind: string;
  payload: Record<string, unknown>;
  stableKey: string;
  summary: string | null;
  title: string;
};

type WorkflowEdgeDraft = {
  fromKind: string;
  fromStableKey: string;
  kind: string;
  payload: Record<string, unknown>;
  toKind: string;
  toStableKey: string;
};

type WorkflowSnapshot = {
  edges: WorkflowEdgeDraft[];
  entities: WorkflowEntityDraft[];
  jobCount: number;
  workflowCount: number;
  workflowFileCount: number;
};

export const workflowExtractorName = "repository_workflows";

export const workflowTwinEntityKinds = [
  "ci_workflow_file",
  "ci_workflow",
  "ci_job",
] as const;

export const workflowTwinEdgeKinds = [
  "repository_has_ci_workflow_file",
  "workflow_file_defines_workflow",
  "workflow_contains_job",
] as const;

export async function syncRepositoryWorkflows(input: {
  now: () => Date;
  repoFullName: string;
  repository: TwinRepository;
  repositoryRegistry: TwinRepositoryRegistryPort;
  sourceResolver: TwinRepositorySourceResolver;
}): Promise<TwinRepositoryWorkflowSyncResult> {
  const detail = await input.repositoryRegistry.getRepository(
    input.repoFullName,
  );
  const run = await startWorkflowRun(input);
  let snapshot: WorkflowSnapshot | null = null;

  try {
    const source = await input.sourceResolver.resolveRepositorySource(
      input.repoFullName,
    );
    snapshot = await extractWorkflowSnapshot({
      repoRoot: source.repoRoot,
      repository: detail.repository,
    });
    const persisted = await persistWorkflowSnapshot({
      observedAt: run.startedAt,
      repoFullName: input.repoFullName,
      repository: input.repository,
      runId: run.id,
      snapshot,
    });
    const finishedRun = await finishWorkflowRun({
      errorSummary: null,
      now: input.now,
      repository: input.repository,
      run,
      status: "succeeded",
      stats: buildWorkflowSyncStats(
        snapshot,
        persisted.entities.length,
        persisted.edges.length,
      ),
    });

    return buildTwinRepositoryWorkflowSyncResult({
      edgeCount: persisted.edges.length,
      edges: persisted.edges,
      entities: persisted.entities,
      entityCount: persisted.entities.length,
      jobCount: snapshot.jobCount,
      repository: toTwinRepositorySummary(detail),
      syncRun: finishedRun,
      workflowCount: snapshot.workflowCount,
      workflowFileCount: snapshot.workflowFileCount,
    });
  } catch (error) {
    await finishWorkflowRun({
      errorSummary: toErrorSummary(error),
      now: input.now,
      repository: input.repository,
      run,
      status: "failed",
      stats: buildWorkflowSyncStats(snapshot, 0, 0),
    });
    throw error;
  }
}

async function extractWorkflowSnapshot(input: {
  repoRoot: string;
  repository: GitHubRepositorySummary;
}): Promise<WorkflowSnapshot> {
  const discoveredFiles = await discoverWorkflowFiles(input.repoRoot);

  if (discoveredFiles.length === 0) {
    return {
      edges: [],
      entities: [],
      jobCount: 0,
      workflowCount: 0,
      workflowFileCount: 0,
    };
  }

  const parsedFiles = discoveredFiles.map((file) => ({
    file,
    parsed: parseWorkflowFile({
      content: file.content,
      path: file.path,
    }),
  }));
  const entities: WorkflowEntityDraft[] = [
    buildRepositoryEntityDraft(input.repository),
  ];
  const edges: WorkflowEdgeDraft[] = [];
  let jobCount = 0;

  for (const { file, parsed } of parsedFiles) {
    entities.push({
      kind: "ci_workflow_file",
      payload: {
        lineCount: file.lineCount,
        modifiedAt: file.modifiedAt,
        path: file.path,
        sizeBytes: file.sizeBytes,
      },
      stableKey: file.path,
      summary: "Discovered workflow definition file under .github/workflows.",
      title: file.path,
    });
    entities.push({
      kind: "ci_workflow",
      payload: {
        name: parsed.name,
        resolvedName: parsed.resolvedName,
        sourceFilePath: file.path,
        triggerSummary: parsed.triggerSummary,
      },
      stableKey: parsed.stableKey,
      summary: "Stored CI workflow summary parsed from a workflow file.",
      title: parsed.resolvedName,
    });
    edges.push({
      fromKind: "repository",
      fromStableKey: "repository",
      kind: "repository_has_ci_workflow_file",
      payload: {
        path: file.path,
      },
      toKind: "ci_workflow_file",
      toStableKey: file.path,
    });
    edges.push({
      fromKind: "ci_workflow_file",
      fromStableKey: file.path,
      kind: "workflow_file_defines_workflow",
      payload: {
        path: file.path,
      },
      toKind: "ci_workflow",
      toStableKey: parsed.stableKey,
    });

    for (const job of parsed.jobs) {
      jobCount += 1;
      entities.push({
        kind: "ci_job",
        payload: {
          jobKey: job.key,
          name: job.name,
          needs: job.needs,
          permissions: job.permissions,
          runsOn: job.runsOn,
          sourceFilePath: file.path,
          steps: job.steps,
          workflowStableKey: parsed.stableKey,
        },
        stableKey: job.stableKey,
        summary: "Stored CI job summary parsed from a workflow definition.",
        title: job.name ?? job.key,
      });
      edges.push({
        fromKind: "ci_workflow",
        fromStableKey: parsed.stableKey,
        kind: "workflow_contains_job",
        payload: {
          jobKey: job.key,
          path: file.path,
        },
        toKind: "ci_job",
        toStableKey: job.stableKey,
      });
    }
  }

  return {
    edges,
    entities,
    jobCount,
    workflowCount: parsedFiles.length,
    workflowFileCount: discoveredFiles.length,
  };
}

async function persistWorkflowSnapshot(input: {
  observedAt: string;
  repoFullName: string;
  repository: TwinRepository;
  runId: string;
  snapshot: WorkflowSnapshot;
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

async function startWorkflowRun(input: {
  now: () => Date;
  repoFullName: string;
  repository: TwinRepository;
  repositoryRegistry: TwinRepositoryRegistryPort;
}) {
  await input.repositoryRegistry.resolveWritableRepository(input.repoFullName);

  return input.repository.startSyncRun({
    repoFullName: input.repoFullName,
    extractor: workflowExtractorName,
    startedAt: input.now().toISOString(),
    stats: {},
  });
}

async function finishWorkflowRun(input: {
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

function buildWorkflowSyncStats(
  snapshot: WorkflowSnapshot | null,
  entityCount: number,
  edgeCount: number,
) {
  return {
    edgeCount,
    entityCount,
    jobCount: snapshot?.jobCount ?? 0,
    workflowCount: snapshot?.workflowCount ?? 0,
    workflowFileCount: snapshot?.workflowFileCount ?? 0,
  };
}

function buildRepositoryEntityDraft(
  repository: GitHubRepositorySummary,
): WorkflowEntityDraft {
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

function buildEntityKey(
  input: Pick<WorkflowEntityDraft, "kind" | "stableKey">,
) {
  return `${input.kind}::${input.stableKey}`;
}

function getRequiredEntityId(
  entityIdByKey: Map<string, string>,
  input: Pick<WorkflowEntityDraft, "kind" | "stableKey">,
) {
  const entityId = entityIdByKey.get(buildEntityKey(input));

  if (!entityId) {
    throw new Error(
      `Twin workflow entity ${input.kind}:${input.stableKey} was not persisted`,
    );
  }

  return entityId;
}

function toErrorSummary(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
