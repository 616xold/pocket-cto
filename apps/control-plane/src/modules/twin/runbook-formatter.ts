import type {
  TwinEntity,
  TwinFreshnessSummary,
  TwinKindCountMap,
  TwinRepositoryRunbooksSyncResult,
  TwinRepositoryRunbooksView,
  TwinRepositorySummary,
  TwinRunbookDocumentSummary,
  TwinRunbookStepSummary,
  TwinSyncRun,
} from "@pocket-cto/domain";

export function buildTwinRepositoryRunbooksSyncResult(input: {
  commandFamilyCounts: Record<string, number>;
  edgeCount: number;
  edges: Array<{ kind: string }>;
  entities: TwinEntity[];
  entityCount: number;
  repository: TwinRepositorySummary;
  runbookDocumentCount: number;
  runbookStepCount: number;
  syncRun: TwinSyncRun;
}): TwinRepositoryRunbooksSyncResult {
  return {
    repository: input.repository,
    syncRun: input.syncRun,
    runbookState:
      input.runbookDocumentCount === 0 ? "no_runbooks" : "runbooks_available",
    runbookDocumentCount: input.runbookDocumentCount,
    runbookStepCount: input.runbookStepCount,
    entityCount: input.entityCount,
    edgeCount: input.edgeCount,
    entityCountsByKind: buildKindCounts(input.entities),
    edgeCountsByKind: buildKindCounts(input.edges),
    commandFamilyCounts: input.commandFamilyCounts,
  };
}

export function buildTwinRepositoryRunbooksView(input: {
  freshness: TwinFreshnessSummary;
  latestRun: TwinSyncRun | null;
  repository: TwinRepositorySummary;
  runbookDocumentEntities: TwinEntity[];
  runbookState: "not_synced" | "no_runbooks" | "runbooks_available";
  runbookStepEntities: TwinEntity[];
}): TwinRepositoryRunbooksView {
  if (input.runbookState !== "runbooks_available") {
    return {
      repository: input.repository,
      latestRun: input.latestRun,
      freshness: input.freshness,
      runbookState: input.runbookState,
      counts: {
        runbookDocumentCount: 0,
        runbookStepCount: 0,
        commandFamilyCounts: {},
      },
      runbooks: [],
    };
  }

  const steps = input.runbookStepEntities
    .map(readRunbookStep)
    .sort((left, right) => {
      return (
        left.sourceDocPath.localeCompare(right.sourceDocPath) ||
        left.ordinal - right.ordinal ||
        left.stableKey.localeCompare(right.stableKey)
      );
    });
  const stepsByPath = new Map<string, TwinRunbookStepSummary[]>();

  for (const step of steps) {
    const existing = stepsByPath.get(step.sourceDocPath) ?? [];
    existing.push(step);
    stepsByPath.set(step.sourceDocPath, existing);
  }

  const runbooks = input.runbookDocumentEntities
    .map((entity) => readRunbookDocument(entity, stepsByPath))
    .sort((left, right) => left.path.localeCompare(right.path));

  return {
    repository: input.repository,
    latestRun: input.latestRun,
    freshness: input.freshness,
    runbookState: "runbooks_available",
    counts: {
      runbookDocumentCount: runbooks.length,
      runbookStepCount: steps.length,
      commandFamilyCounts: buildCommandFamilyCounts(steps),
    },
    runbooks,
  };
}

function buildKindCounts(items: Array<{ kind: string }>): TwinKindCountMap {
  const counts: TwinKindCountMap = {};

  for (const item of items) {
    counts[item.kind] = (counts[item.kind] ?? 0) + 1;
  }

  return counts;
}

function readRunbookDocument(
  entity: TwinEntity,
  stepsByPath: Map<string, TwinRunbookStepSummary[]>,
): TwinRunbookDocumentSummary {
  const path = readString(entity.payload, "path") ?? entity.stableKey;
  const steps = stepsByPath.get(path) ?? [];

  return {
    path,
    title: readString(entity.payload, "title") ?? entity.title,
    classificationReason:
      readString(entity.payload, "classificationReason") ?? "unknown",
    headingCount: readNonNegativeInteger(entity.payload, "headingCount") ?? 0,
    lineCount: readNonNegativeInteger(entity.payload, "lineCount") ?? 0,
    sizeBytes: readNonNegativeInteger(entity.payload, "sizeBytes") ?? 0,
    modifiedAt: readNullableDatetime(entity.payload, "modifiedAt"),
    stepCount: steps.length,
    commandFamilyCounts: buildCommandFamilyCounts(steps),
    steps,
  };
}

function readRunbookStep(entity: TwinEntity): TwinRunbookStepSummary {
  return {
    stableKey: entity.stableKey,
    sourceDocPath: readString(entity.payload, "sourceDocPath") ?? "",
    ordinal: readPositiveInteger(entity.payload, "ordinal") ?? 1,
    headingContext:
      readString(entity.payload, "headingContext") ?? entity.title,
    commandText: readString(entity.payload, "commandText") ?? "",
    commandFamily: readCommandFamily(entity.payload, "commandFamily"),
    purposeLabel: readNullableString(entity.payload, "purposeLabel"),
  };
}

function buildCommandFamilyCounts(
  steps: Array<Pick<TwinRunbookStepSummary, "commandFamily">>,
) {
  const counts: Record<string, number> = {};

  for (const step of steps) {
    counts[step.commandFamily] = (counts[step.commandFamily] ?? 0) + 1;
  }

  return counts;
}

function readCommandFamily(
  payload: Record<string, unknown>,
  key: string,
): TwinRunbookStepSummary["commandFamily"] {
  const value = payload[key];

  return value === "curl" ||
    value === "pnpm" ||
    value === "node" ||
    value === "git" ||
    value === "docker" ||
    value === "other"
    ? value
    : "other";
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

function readPositiveInteger(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return Number.isInteger(value) && typeof value === "number" && value > 0
    ? value
    : null;
}

function readString(payload: Record<string, unknown>, key: string) {
  return readNullableString(payload, key);
}
