import type {
  TwinEdge,
  TwinEntity,
  TwinKindCountMap,
  TwinRepositorySummary,
  TwinRepositoryWorkflowSyncResult,
  TwinRepositoryWorkflowsView,
  TwinSyncRun,
  TwinWorkflowFileSummary,
  TwinWorkflowJobPermissions,
  TwinWorkflowJobStep,
  TwinWorkflowJobSummary,
  TwinWorkflowRunsOn,
  TwinWorkflowSummary,
  TwinWorkflowTriggerSummary,
} from "@pocket-cto/domain";

export function buildTwinRepositoryWorkflowSyncResult(input: {
  edgeCount: number;
  edges: TwinEdge[];
  entities: TwinEntity[];
  entityCount: number;
  jobCount: number;
  repository: TwinRepositorySummary;
  syncRun: TwinSyncRun;
  workflowCount: number;
  workflowFileCount: number;
}): TwinRepositoryWorkflowSyncResult {
  return {
    repository: input.repository,
    syncRun: input.syncRun,
    workflowState:
      input.workflowFileCount === 0
        ? "no_workflow_files"
        : "workflows_available",
    workflowFileCount: input.workflowFileCount,
    workflowCount: input.workflowCount,
    jobCount: input.jobCount,
    entityCount: input.entityCount,
    edgeCount: input.edgeCount,
    entityCountsByKind: buildKindCounts(input.entities),
    edgeCountsByKind: buildKindCounts(input.edges),
  };
}

export function buildTwinRepositoryWorkflowsView(input: {
  fileEntities: TwinEntity[];
  fileWorkflowEdges: TwinEdge[];
  jobEntities: TwinEntity[];
  latestRun: TwinSyncRun | null;
  repository: TwinRepositorySummary;
  workflowEntities: TwinEntity[];
  workflowJobEdges: TwinEdge[];
  workflowState: "no_workflow_files" | "not_synced" | "workflows_available";
}): TwinRepositoryWorkflowsView {
  if (input.workflowState !== "workflows_available") {
    return {
      repository: input.repository,
      latestRun: input.latestRun,
      workflowState: input.workflowState,
      counts: {
        workflowFileCount: 0,
        workflowCount: 0,
        jobCount: 0,
      },
      workflows: [],
    };
  }

  const fileById = new Map(
    input.fileEntities.map((entity) => [entity.id, readWorkflowFile(entity)]),
  );
  const workflowById = new Map(
    input.workflowEntities.map((entity) => [entity.id, readWorkflow(entity)]),
  );
  const jobById = new Map(
    input.jobEntities.map((entity) => [entity.id, readWorkflowJob(entity)]),
  );
  const jobsByWorkflowId = new Map<string, TwinWorkflowJobSummary[]>();

  for (const edge of input.workflowJobEdges) {
    const job = jobById.get(edge.toEntityId);

    if (!job) {
      continue;
    }

    const existingJobs = jobsByWorkflowId.get(edge.fromEntityId) ?? [];
    existingJobs.push(job);
    jobsByWorkflowId.set(edge.fromEntityId, existingJobs);
  }

  const workflows = input.fileWorkflowEdges
    .map((edge) => {
      const file = fileById.get(edge.fromEntityId);
      const workflow = workflowById.get(edge.toEntityId);

      if (!file || !workflow) {
        return null;
      }

      return {
        file,
        workflow,
        jobs: sortWorkflowJobs(jobsByWorkflowId.get(edge.toEntityId) ?? []),
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((left, right) => {
      return (
        left.file.path.localeCompare(right.file.path) ||
        left.workflow.resolvedName.localeCompare(right.workflow.resolvedName)
      );
    });

  return {
    repository: input.repository,
    latestRun: input.latestRun,
    workflowState: "workflows_available",
    counts: {
      workflowFileCount: input.fileEntities.length,
      workflowCount: input.workflowEntities.length,
      jobCount: input.jobEntities.length,
    },
    workflows,
  };
}

function buildKindCounts(items: Array<{ kind: string }>): TwinKindCountMap {
  const counts: TwinKindCountMap = {};

  for (const item of items) {
    counts[item.kind] = (counts[item.kind] ?? 0) + 1;
  }

  return counts;
}

function readWorkflowFile(entity: TwinEntity): TwinWorkflowFileSummary {
  return {
    path: readString(entity.payload, "path") ?? entity.stableKey,
    sizeBytes: readNonNegativeInteger(entity.payload, "sizeBytes") ?? 0,
    lineCount: readNonNegativeInteger(entity.payload, "lineCount") ?? 0,
    modifiedAt: readNullableDatetime(entity.payload, "modifiedAt"),
  };
}

function readWorkflow(entity: TwinEntity): TwinWorkflowSummary {
  return {
    stableKey: entity.stableKey,
    sourceFilePath:
      readString(entity.payload, "sourceFilePath") ??
      readString(entity.payload, "path") ??
      entity.stableKey,
    name: readNullableString(entity.payload, "name"),
    resolvedName: readString(entity.payload, "resolvedName") ?? entity.title,
    triggerSummary: readWorkflowTriggerSummary(entity.payload.triggerSummary),
  };
}

function readWorkflowJob(entity: TwinEntity): TwinWorkflowJobSummary {
  return {
    stableKey: entity.stableKey,
    key: readString(entity.payload, "jobKey") ?? entity.title,
    name: readNullableString(entity.payload, "name"),
    runsOn: readRunsOn(entity.payload.runsOn),
    needs: readStringArray(entity.payload, "needs"),
    permissions: readPermissions(entity.payload.permissions),
    steps: readSteps(entity.payload.steps),
  };
}

function readWorkflowTriggerSummary(
  value: unknown,
): TwinWorkflowTriggerSummary {
  const payload = asObject(value);

  return {
    eventNames: readStringArray(payload, "eventNames"),
    hasSchedule: readBoolean(payload, "hasSchedule") ?? false,
    scheduleCount: readNonNegativeInteger(payload, "scheduleCount") ?? 0,
    hasWorkflowDispatch: readBoolean(payload, "hasWorkflowDispatch") ?? false,
    hasWorkflowCall: readBoolean(payload, "hasWorkflowCall") ?? false,
  };
}

function readRunsOn(value: unknown): TwinWorkflowRunsOn {
  const payload = asObject(value);

  return {
    labels: readStringArray(payload, "labels"),
    group: readNullableString(payload, "group"),
  };
}

function readPermissions(value: unknown): TwinWorkflowJobPermissions | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const payload = value as Record<string, unknown>;
  const scopesValue = payload.scopes;
  const scopes =
    scopesValue &&
    typeof scopesValue === "object" &&
    !Array.isArray(scopesValue)
      ? Object.fromEntries(
          Object.entries(scopesValue)
            .filter(
              (entry): entry is [string, string] =>
                typeof entry[1] === "string" && entry[1].trim().length > 0,
            )
            .sort((left, right) => left[0].localeCompare(right[0])),
        )
      : {};

  return {
    mode: readNullableString(payload, "mode"),
    scopes,
  };
}

function readSteps(value: unknown): TwinWorkflowJobStep[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((step) => {
      const payload = asObject(step);
      const kind = payload.kind;
      const rawValue = payload.value;

      if (
        (kind !== "run" && kind !== "uses") ||
        typeof rawValue !== "string" ||
        rawValue.trim().length === 0
      ) {
        return null;
      }

      return {
        kind,
        value: rawValue.trim(),
        name: readNullableString(payload, "name"),
      };
    })
    .filter((step): step is TwinWorkflowJobStep => step !== null);
}

function sortWorkflowJobs(jobs: TwinWorkflowJobSummary[]) {
  return jobs.sort((left, right) => {
    return (
      left.key.localeCompare(right.key) ||
      left.stableKey.localeCompare(right.stableKey)
    );
  });
}

function readBoolean(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "boolean" ? value : null;
}

function readNonNegativeInteger(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return Number.isInteger(value) && typeof value === "number" && value >= 0
    ? value
    : null;
}

function readNullableDatetime(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" && value.length > 0 ? value : null;
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
