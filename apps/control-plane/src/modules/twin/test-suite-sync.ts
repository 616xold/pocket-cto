import type { TwinRepositoryTestSuiteSyncResult } from "@pocket-cto/domain";
import type { GitHubRepositoryDetailResult } from "../github-app/schema";
import { toTwinRepositorySummary } from "./formatter";
import type { TwinRepository } from "./repository";
import { buildTwinRepositoryTestSuiteSyncResult } from "./test-suite-formatter";
import {
  deriveTestSuites,
  matchJobsToTestSuites,
  type StoredManifestForTestSuites,
  type StoredWorkflowJobForTestSuites,
} from "./test-suite-matcher";
import type {
  TwinEdgeRecord,
  TwinEntityRecord,
  TwinSyncRunRecord,
} from "./types";
import { workflowExtractorName } from "./workflow-sync";

type TwinRepositoryRegistryPort = {
  getRepository(fullName: string): Promise<GitHubRepositoryDetailResult>;
  resolveWritableRepository(fullName: string): Promise<unknown>;
};

type TestSuiteEntityDraft = {
  kind: string;
  payload: Record<string, unknown>;
  stableKey: string;
  summary: string | null;
  title: string;
};

type TestSuiteEdgeDraft = {
  fromEntityId: string;
  kind: string;
  payload: Record<string, unknown>;
  toStableKey: string;
};

type TestSuiteSnapshot = {
  edges: TestSuiteEdgeDraft[];
  entities: TestSuiteEntityDraft[];
  jobCount: number;
  mappedJobCount: number;
  testSuiteCount: number;
  unmappedJobCount: number;
};

export const testSuiteExtractorName = "repository_test_suites";

export const testSuiteTwinEntityKinds = ["test_suite"] as const;

export const testSuiteTwinEdgeKinds = [
  "package_manifest_declares_test_suite",
  "ci_job_runs_test_suite",
] as const;

export async function syncRepositoryTestSuites(input: {
  now: () => Date;
  repoFullName: string;
  repository: TwinRepository;
  repositoryRegistry: TwinRepositoryRegistryPort;
}): Promise<TwinRepositoryTestSuiteSyncResult> {
  const detail = await input.repositoryRegistry.getRepository(
    input.repoFullName,
  );
  const run = await startTestSuiteRun(input);
  let snapshot: TestSuiteSnapshot | null = null;

  try {
    const [entities, runs] = await Promise.all([
      input.repository.listRepositoryEntities(input.repoFullName),
      input.repository.listRepositoryRuns(input.repoFullName),
    ]);
    snapshot = extractTestSuiteSnapshot({
      entities,
      runs,
    });
    const persisted = await persistTestSuiteSnapshot({
      observedAt: run.startedAt,
      repoFullName: input.repoFullName,
      repository: input.repository,
      runId: run.id,
      snapshot,
    });
    const finishedRun = await finishTestSuiteRun({
      errorSummary: null,
      now: input.now,
      repository: input.repository,
      run,
      stats: buildTestSuiteSyncStats(
        snapshot,
        persisted.entities.length,
        persisted.edges.length,
      ),
      status: "succeeded",
    });

    return buildTwinRepositoryTestSuiteSyncResult({
      edgeCount: persisted.edges.length,
      edges: persisted.edges,
      entities: persisted.entities,
      entityCount: persisted.entities.length,
      jobCount: snapshot.jobCount,
      mappedJobCount: snapshot.mappedJobCount,
      repository: toTwinRepositorySummary(detail),
      syncRun: finishedRun,
      testSuiteCount: snapshot.testSuiteCount,
      unmappedJobCount: snapshot.unmappedJobCount,
    });
  } catch (error) {
    await finishTestSuiteRun({
      errorSummary: toErrorSummary(error),
      now: input.now,
      repository: input.repository,
      run,
      stats: buildTestSuiteSyncStats(snapshot, 0, 0),
      status: "failed",
    });
    throw error;
  }
}

function extractTestSuiteSnapshot(input: {
  entities: TwinEntityRecord[];
  runs: TwinSyncRunRecord[];
}): TestSuiteSnapshot {
  const manifests = readLatestMetadataManifestSnapshot(input);
  const jobs = readLatestWorkflowJobSnapshot(input);
  const suites = deriveTestSuites(manifests);
  const matched = matchJobsToTestSuites({
    jobs,
    suites,
  });
  const matchedJobIds = new Set(
    matched.matches.map((candidate) => candidate.jobEntityId),
  );

  return {
    edges: [
      ...suites.map<TestSuiteEdgeDraft>((suite) => ({
        fromEntityId: suite.manifestEntityId,
        kind: "package_manifest_declares_test_suite",
        payload: {
          manifestPath: suite.manifestPath,
          scriptKey: suite.scriptKey,
        },
        toStableKey: suite.stableKey,
      })),
      ...matched.matches.map<TestSuiteEdgeDraft>((match) => ({
        fromEntityId: match.jobEntityId,
        kind: "ci_job_runs_test_suite",
        payload: {
          manifestPath: match.manifestPath,
          matchedBy: match.matchedBy,
          matchedCommand: match.matchedCommand,
          scriptKey: match.scriptKey,
        },
        toStableKey: match.suiteStableKey,
      })),
    ],
    entities: suites.map<TestSuiteEntityDraft>((suite) => ({
      kind: "test_suite",
      payload: {
        manifestPath: suite.manifestPath,
        manifestStableKey: suite.manifestStableKey,
        packageName: suite.packageName,
        scriptKey: suite.scriptKey,
      },
      stableKey: suite.stableKey,
      summary: "Stored test suite derived from a package manifest test script.",
      title: suite.packageName
        ? `${suite.packageName} ${suite.scriptKey}`
        : `${suite.manifestPath} ${suite.scriptKey}`,
    })),
    jobCount: jobs.length,
    mappedJobCount: matchedJobIds.size,
    testSuiteCount: suites.length,
    unmappedJobCount: matched.unmappedJobs.length,
  };
}

async function persistTestSuiteSnapshot(input: {
  observedAt: string;
  repoFullName: string;
  repository: TwinRepository;
  runId: string;
  snapshot: TestSuiteSnapshot;
}) {
  return input.repository.transaction(async (session) => {
    const suiteEntityIdByStableKey = new Map<string, string>();
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

      suiteEntityIdByStableKey.set(entityDraft.stableKey, entity.id);
      entities.push(entity);
    }

    for (const edgeDraft of input.snapshot.edges) {
      const toEntityId = suiteEntityIdByStableKey.get(edgeDraft.toStableKey);

      if (!toEntityId) {
        throw new Error(
          `Twin test suite ${edgeDraft.toStableKey} was not persisted`,
        );
      }

      const edge = await input.repository.upsertEdge(
        {
          repoFullName: input.repoFullName,
          kind: edgeDraft.kind,
          fromEntityId: edgeDraft.fromEntityId,
          toEntityId,
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

function readLatestMetadataManifestSnapshot(input: {
  entities: TwinEntityRecord[];
  runs: TwinSyncRunRecord[];
}) {
  const latestSucceededMetadataRun =
    input.runs.find(
      (candidate) =>
        candidate.extractor === "repository_metadata" &&
        candidate.status === "succeeded",
    ) ?? null;

  if (!latestSucceededMetadataRun) {
    return [];
  }

  return input.entities
    .filter(
      (candidate) =>
        candidate.sourceRunId === latestSucceededMetadataRun.id &&
        candidate.kind === "package_manifest",
    )
    .map<StoredManifestForTestSuites>((entity) => ({
      entityId: entity.id,
      packageName: readNullableString(entity.payload, "packageName"),
      path: readString(entity.payload, "path") ?? entity.stableKey,
      scriptNames: readStringArray(entity.payload, "scriptNames"),
      stableKey: entity.stableKey,
    }))
    .sort((left, right) => left.path.localeCompare(right.path));
}

function readLatestWorkflowJobSnapshot(input: {
  entities: TwinEntityRecord[];
  runs: TwinSyncRunRecord[];
}) {
  const latestSucceededWorkflowRun =
    input.runs.find(
      (candidate) =>
        candidate.extractor === workflowExtractorName &&
        candidate.status === "succeeded",
    ) ?? null;

  if (!latestSucceededWorkflowRun) {
    return [];
  }

  return input.entities
    .filter(
      (candidate) =>
        candidate.sourceRunId === latestSucceededWorkflowRun.id &&
        candidate.kind === "ci_job",
    )
    .map<StoredWorkflowJobForTestSuites>((entity) => ({
      entityId: entity.id,
      key: readString(entity.payload, "jobKey") ?? entity.title,
      name: readNullableString(entity.payload, "name"),
      sourceFilePath:
        readString(entity.payload, "sourceFilePath") ?? entity.stableKey,
      stableKey: entity.stableKey,
      steps: readSteps(entity.payload.steps),
      workflowStableKey:
        readString(entity.payload, "workflowStableKey") ?? entity.stableKey,
    }))
    .sort((left, right) => {
      return (
        left.sourceFilePath.localeCompare(right.sourceFilePath) ||
        left.key.localeCompare(right.key)
      );
    });
}

async function startTestSuiteRun(input: {
  now: () => Date;
  repoFullName: string;
  repository: TwinRepository;
  repositoryRegistry: TwinRepositoryRegistryPort;
}) {
  await input.repositoryRegistry.resolveWritableRepository(input.repoFullName);

  return input.repository.startSyncRun({
    repoFullName: input.repoFullName,
    extractor: testSuiteExtractorName,
    startedAt: input.now().toISOString(),
    stats: {},
  });
}

async function finishTestSuiteRun(input: {
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

function buildTestSuiteSyncStats(
  snapshot: TestSuiteSnapshot | null,
  entityCount: number,
  edgeCount: number,
) {
  return {
    edgeCount,
    entityCount,
    jobCount: snapshot?.jobCount ?? 0,
    mappedJobCount: snapshot?.mappedJobCount ?? 0,
    testSuiteCount: snapshot?.testSuiteCount ?? 0,
    unmappedJobCount: snapshot?.unmappedJobCount ?? 0,
  };
}

function readSteps(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((candidate) => {
      const step = asObject(candidate);
      const kind = step.kind;
      const rawValue = step.value;

      if (
        (kind !== "run" && kind !== "uses") ||
        typeof rawValue !== "string" ||
        rawValue.trim().length === 0
      ) {
        return null;
      }

      return {
        kind,
        name: readNullableString(step, "name"),
        value: rawValue.trim(),
      };
    })
    .filter(
      (step): step is StoredWorkflowJobForTestSuites["steps"][number] =>
        step !== null,
    );
}

function readNullableString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readString(payload: Record<string, unknown>, key: string) {
  return readNullableString(payload, key);
}

function readStringArray(payload: Record<string, unknown>, key: string) {
  const value = payload[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is string => typeof item === "string" && item.length > 0,
    )
    .sort((left, right) => left.localeCompare(right));
}

function asObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function toErrorSummary(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
