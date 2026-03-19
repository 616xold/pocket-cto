import type {
  TwinCiMatchedJob,
  TwinCiUnmappedJob,
  TwinEdge,
  TwinEntity,
  TwinFreshnessSummary,
  TwinKindCountMap,
  TwinRepositoryCiSummary,
  TwinRepositorySummary,
  TwinRepositoryTestSuiteSyncResult,
  TwinRepositoryTestSuitesView,
  TwinSyncRun,
  TwinTestSuiteSummary,
  TwinTestSuiteState,
} from "@pocket-cto/domain";
import {
  explainUnmappedJobs,
  type DerivedTestSuite,
  type StoredWorkflowJobForTestSuites,
} from "./test-suite-matcher";

export function buildTwinRepositoryTestSuiteSyncResult(input: {
  edgeCount: number;
  edges: TwinEdge[];
  entities: TwinEntity[];
  entityCount: number;
  jobCount: number;
  mappedJobCount: number;
  repository: TwinRepositorySummary;
  syncRun: TwinSyncRun;
  testSuiteCount: number;
  unmappedJobCount: number;
}): TwinRepositoryTestSuiteSyncResult {
  return {
    repository: input.repository,
    syncRun: input.syncRun,
    testSuiteState:
      input.testSuiteCount === 0 ? "no_test_suites" : "test_suites_available",
    testSuiteCount: input.testSuiteCount,
    jobCount: input.jobCount,
    mappedJobCount: input.mappedJobCount,
    unmappedJobCount: input.unmappedJobCount,
    entityCount: input.entityCount,
    edgeCount: input.edgeCount,
    entityCountsByKind: buildKindCounts(input.entities),
    edgeCountsByKind: buildKindCounts(input.edges),
  };
}

export function buildTwinRepositoryTestSuitesView(input: {
  jobEntities: TwinEntity[];
  jobSuiteEdges: TwinEdge[];
  latestRun: TwinSyncRun | null;
  repository: TwinRepositorySummary;
  testSuiteEntities: TwinEntity[];
  testSuiteState: TwinTestSuiteState;
  workflowEntities: TwinEntity[];
  workflowState: "no_workflow_files" | "not_synced" | "workflows_available";
}): TwinRepositoryTestSuitesView {
  const projection = projectCiLinkage(input);

  return {
    repository: input.repository,
    latestRun: input.latestRun,
    testSuiteState: input.testSuiteState,
    counts: {
      testSuiteCount: projection.testSuites.length,
      mappedJobCount: projection.mappedJobCount,
      unmappedJobCount: projection.unmappedJobs.length,
    },
    testSuites: projection.testSuites,
    unmappedJobs: projection.unmappedJobs,
  };
}

export function buildTwinRepositoryCiSummary(input: {
  freshness: TwinFreshnessSummary;
  jobEntities: TwinEntity[];
  jobSuiteEdges: TwinEdge[];
  latestTestSuiteRun: TwinSyncRun | null;
  latestWorkflowRun: TwinSyncRun | null;
  repository: TwinRepositorySummary;
  testSuiteEntities: TwinEntity[];
  testSuiteState: TwinTestSuiteState;
  workflowEntities: TwinEntity[];
  workflowFileCount: number;
  workflowCount: number;
  workflowState: "no_workflow_files" | "not_synced" | "workflows_available";
}): TwinRepositoryCiSummary {
  const projection = projectCiLinkage(input);

  return {
    repository: input.repository,
    latestWorkflowRun: input.latestWorkflowRun,
    latestTestSuiteRun: input.latestTestSuiteRun,
    freshness: input.freshness,
    workflowState: input.workflowState,
    testSuiteState: input.testSuiteState,
    counts: {
      workflowFileCount: input.workflowFileCount,
      workflowCount: input.workflowCount,
      jobCount: input.jobEntities.length,
      testSuiteCount: projection.testSuites.length,
      mappedJobCount: projection.mappedJobCount,
      unmappedJobCount: projection.unmappedJobs.length,
    },
    testSuites: projection.testSuites,
    unmappedJobs: projection.unmappedJobs,
  };
}

function projectCiLinkage(input: {
  jobEntities: TwinEntity[];
  jobSuiteEdges: TwinEdge[];
  testSuiteEntities: TwinEntity[];
  testSuiteState: TwinTestSuiteState;
  workflowEntities: TwinEntity[];
  workflowState: "no_workflow_files" | "not_synced" | "workflows_available";
}) {
  if (input.testSuiteState === "not_synced") {
    return {
      mappedJobCount: 0,
      testSuites: [] as TwinTestSuiteSummary[],
      unmappedJobs: [] as TwinCiUnmappedJob[],
    };
  }

  const workflowByStableKey = new Map(
    input.workflowEntities.map((entity) => {
      const workflow = readWorkflowEntity(entity);
      return [workflow.stableKey, workflow];
    }),
  );
  const jobsById = new Map(
    input.jobEntities.map((entity) => {
      const job = readJobEntity(entity);
      return [job.entityId, job];
    }),
  );
  const suitesById = new Map(
    input.testSuiteEntities.map((entity) => {
      const suite = readTestSuiteEntity(entity);
      return [suite.entityId, suite];
    }),
  );
  const matchedJobsBySuiteId = new Map<string, TwinCiMatchedJob[]>();
  const mappedJobIds = new Set<string>();

  for (const edge of input.jobSuiteEdges) {
    const job = jobsById.get(edge.fromEntityId);
    const suite = suitesById.get(edge.toEntityId);

    if (!job || !suite) {
      continue;
    }

    const workflow = workflowByStableKey.get(job.workflowStableKey);
    const matchedJob: TwinCiMatchedJob = {
      jobStableKey: job.stableKey,
      workflowStableKey: job.workflowStableKey,
      workflowName: workflow?.resolvedName ?? job.sourceFilePath,
      workflowFilePath: job.sourceFilePath,
      jobKey: job.key,
      jobName: job.name,
    };

    matchedJobsBySuiteId.set(edge.toEntityId, [
      ...(matchedJobsBySuiteId.get(edge.toEntityId) ?? []),
      matchedJob,
    ]);
    mappedJobIds.add(job.entityId);
  }

  const testSuites =
    input.testSuiteState === "test_suites_available"
      ? [...suitesById.values()]
          .map<TwinTestSuiteSummary>((suite) => ({
            stableKey: suite.stableKey,
            manifestPath: suite.manifestPath,
            packageName: suite.packageName,
            scriptKey: suite.scriptKey,
            matchedJobs: sortMatchedJobs(
              matchedJobsBySuiteId.get(suite.entityId) ?? [],
            ),
          }))
          .sort((left, right) => {
            return (
              left.manifestPath.localeCompare(right.manifestPath) ||
              left.scriptKey.localeCompare(right.scriptKey)
            );
          })
      : [];
  const derivedSuites = [...suitesById.values()].map<DerivedTestSuite>(
    (suite) => ({
      manifestEntityId: suite.entityId,
      manifestPath: suite.manifestPath,
      manifestStableKey: suite.stableKey,
      packageName: suite.packageName,
      scriptKey: suite.scriptKey,
      stableKey: suite.stableKey,
    }),
  );
  const unmappedJobs =
    input.workflowState === "workflows_available"
      ? explainUnmappedJobs({
          jobs: [...jobsById.values()]
            .filter((job) => !mappedJobIds.has(job.entityId))
            .map<StoredWorkflowJobForTestSuites>((job) => ({
              entityId: job.entityId,
              key: job.key,
              name: job.name,
              sourceFilePath: job.sourceFilePath,
              stableKey: job.stableKey,
              steps: job.steps.map((step) => ({
                kind: step.kind,
                name: step.name,
                value: step.value,
              })),
              workflowStableKey: job.workflowStableKey,
            })),
          suites: derivedSuites,
        })
          .map<TwinCiUnmappedJob>((job) => {
            const workflow = workflowByStableKey.get(job.workflowStableKey);
            return {
              jobStableKey: job.stableKey,
              workflowStableKey: job.workflowStableKey,
              workflowName: workflow?.resolvedName ?? job.sourceFilePath,
              workflowFilePath: job.sourceFilePath,
              jobKey: job.key,
              jobName: job.name,
              reasonCode: job.reasonCode,
              reasonSummary: job.reasonSummary,
              runCommands: job.steps
                .filter((step) => step.kind === "run")
                .map((step) => step.value)
                .sort((left, right) => left.localeCompare(right)),
            };
          })
          .sort((left, right) => {
            return (
              left.workflowFilePath.localeCompare(right.workflowFilePath) ||
              left.jobKey.localeCompare(right.jobKey) ||
              left.jobStableKey.localeCompare(right.jobStableKey)
            );
          })
      : [];

  return {
    mappedJobCount: mappedJobIds.size,
    testSuites,
    unmappedJobs,
  };
}

function buildKindCounts(items: Array<{ kind: string }>): TwinKindCountMap {
  const counts: TwinKindCountMap = {};

  for (const item of items) {
    counts[item.kind] = (counts[item.kind] ?? 0) + 1;
  }

  return counts;
}

function readWorkflowEntity(entity: TwinEntity) {
  return {
    stableKey: entity.stableKey,
    resolvedName: readString(entity.payload, "resolvedName") ?? entity.title,
  };
}

function readJobEntity(entity: TwinEntity) {
  return {
    entityId: entity.id,
    key: readString(entity.payload, "jobKey") ?? entity.title,
    name: readNullableString(entity.payload, "name"),
    steps: readWorkflowSteps(entity.payload.steps),
    sourceFilePath:
      readString(entity.payload, "sourceFilePath") ?? entity.stableKey,
    stableKey: entity.stableKey,
    workflowStableKey:
      readString(entity.payload, "workflowStableKey") ?? entity.stableKey,
  };
}

function readTestSuiteEntity(entity: TwinEntity) {
  return {
    entityId: entity.id,
    manifestPath:
      readString(entity.payload, "manifestPath") ?? entity.stableKey,
    packageName: readNullableString(entity.payload, "packageName"),
    scriptKey: readString(entity.payload, "scriptKey") ?? entity.title,
    stableKey: entity.stableKey,
  };
}

function readWorkflowSteps(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((step) => {
      const payload = asObject(step);

      if (
        (payload.kind !== "run" && payload.kind !== "uses") ||
        typeof payload.value !== "string"
      ) {
        return null;
      }

      return {
        kind: payload.kind,
        name: readNullableString(payload, "name"),
        value: payload.value.trim(),
      };
    })
    .filter(
      (
        step,
      ): step is {
        kind: "run" | "uses";
        name: string | null;
        value: string;
      } => step !== null && step.value.length > 0,
    );
}

function sortMatchedJobs(jobs: TwinCiMatchedJob[]) {
  return [...jobs].sort((left, right) => {
    return (
      left.workflowFilePath.localeCompare(right.workflowFilePath) ||
      left.workflowName.localeCompare(right.workflowName) ||
      left.jobKey.localeCompare(right.jobKey) ||
      left.jobStableKey.localeCompare(right.jobStableKey)
    );
  });
}

function readNullableString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readString(payload: Record<string, unknown>, key: string) {
  return readNullableString(payload, key);
}

function asObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
