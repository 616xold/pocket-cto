import type {
  TwinCodeownersFile,
  TwinEdge,
  TwinEntity,
  TwinKindCountMap,
  TwinOwnerPrincipal,
  TwinOwnershipPatternShape,
  TwinOwnershipRule,
  TwinRepositoryOwnersView,
  TwinRepositoryOwnershipRulesView,
  TwinRepositoryOwnershipSyncResult,
  TwinRepositorySummary,
  TwinSyncRun,
} from "@pocket-cto/domain";

export function buildTwinRepositoryOwnershipRulesView(input: {
  codeownersFileEntity: TwinEntity | null;
  latestRun: TwinSyncRun | null;
  ownerEntities: TwinEntity[];
  repository: TwinRepositorySummary;
  ruleEntities: TwinEntity[];
}): TwinRepositoryOwnershipRulesView {
  return {
    repository: input.repository,
    latestRun: input.latestRun,
    codeownersFile: readCodeownersFile(input.codeownersFileEntity),
    ruleCount: input.ruleEntities.length,
    ownerCount: input.ownerEntities.length,
    rules: input.ruleEntities
      .map(readOwnershipRule)
      .sort((left, right) => {
        return (
          left.sourceFilePath.localeCompare(right.sourceFilePath) ||
          left.ordinal - right.ordinal
        );
      }),
  };
}

export function buildTwinRepositoryOwnersView(input: {
  codeownersFileEntity: TwinEntity | null;
  latestRun: TwinSyncRun | null;
  ownerEntities: TwinEntity[];
  repository: TwinRepositorySummary;
  ruleAssignOwnerEdges: TwinEdge[];
}): TwinRepositoryOwnersView {
  const assignedRuleCounts = new Map<string, number>();

  for (const edge of input.ruleAssignOwnerEdges) {
    assignedRuleCounts.set(
      edge.toEntityId,
      (assignedRuleCounts.get(edge.toEntityId) ?? 0) + 1,
    );
  }

  return {
    repository: input.repository,
    latestRun: input.latestRun,
    codeownersFile: readCodeownersFile(input.codeownersFileEntity),
    ownerCount: input.ownerEntities.length,
    owners: input.ownerEntities
      .map((entity) => readOwnerPrincipal(entity, assignedRuleCounts))
      .sort((left, right) => left.handle.localeCompare(right.handle)),
  };
}

export function buildTwinRepositoryOwnershipSyncResult(input: {
  codeownersFilePath: string | null;
  edgeCount: number;
  edges: TwinEdge[];
  entityCount: number;
  entities: TwinEntity[];
  ownerCount: number;
  repository: TwinRepositorySummary;
  ruleCount: number;
  syncRun: TwinSyncRun;
}): TwinRepositoryOwnershipSyncResult {
  return {
    repository: input.repository,
    syncRun: input.syncRun,
    codeownersFilePath: input.codeownersFilePath,
    ruleCount: input.ruleCount,
    ownerCount: input.ownerCount,
    entityCount: input.entityCount,
    edgeCount: input.edgeCount,
    entityCountsByKind: buildKindCounts(input.entities),
    edgeCountsByKind: buildKindCounts(input.edges),
  };
}

function buildKindCounts(items: Array<{ kind: string }>): TwinKindCountMap {
  const counts: TwinKindCountMap = {};

  for (const item of items) {
    counts[item.kind] = (counts[item.kind] ?? 0) + 1;
  }

  return counts;
}

export function readCodeownersFile(
  entity: TwinEntity | null,
): TwinCodeownersFile | null {
  if (!entity) {
    return null;
  }

  return {
    path: readString(entity.payload, "path") ?? entity.stableKey,
    precedenceSlot:
      readCodeownersPrecedenceSlot(entity.payload.precedenceSlot) ??
      "repository_root",
    lineCount: readNonNegativeInteger(entity.payload, "lineCount") ?? 0,
    sizeBytes: readNonNegativeInteger(entity.payload, "sizeBytes") ?? 0,
    ruleCount: readNonNegativeInteger(entity.payload, "ruleCount") ?? 0,
    ownerCount: readNonNegativeInteger(entity.payload, "ownerCount") ?? 0,
  };
}

function readOwnerPrincipal(
  entity: TwinEntity,
  assignedRuleCounts: Map<string, number>,
): TwinOwnerPrincipal {
  return {
    id: entity.id,
    handle: readString(entity.payload, "handle") ?? entity.stableKey,
    principalKind:
      readOwnerPrincipalKind(entity.payload.principalKind) ?? "unknown",
    assignedRuleCount: assignedRuleCounts.get(entity.id) ?? 0,
    observedAt: entity.observedAt,
    sourceRunId: entity.sourceRunId,
    updatedAt: entity.updatedAt,
  };
}

export function readOwnershipRule(entity: TwinEntity): TwinOwnershipRule {
  return {
    id: entity.id,
    sourceFilePath:
      readString(entity.payload, "sourceFilePath") ?? "CODEOWNERS",
    ordinal: readPositiveInteger(entity.payload, "ordinal") ?? 1,
    lineNumber: readPositiveInteger(entity.payload, "lineNumber") ?? 1,
    rawPattern: readString(entity.payload, "rawPattern") ?? entity.title,
    rawOwners: readStringArray(entity.payload, "rawOwners"),
    normalizedOwners: readStringArray(entity.payload, "normalizedOwners"),
    patternShape:
      readOwnershipPatternShape(entity.payload.patternShape) ?? "ambiguous",
    observedAt: entity.observedAt,
    sourceRunId: entity.sourceRunId,
    updatedAt: entity.updatedAt,
  };
}

function readCodeownersPrecedenceSlot(value: unknown) {
  return value === "github_dotgithub" ||
    value === "repository_root" ||
    value === "docs"
    ? value
    : null;
}

function readOwnerPrincipalKind(value: unknown) {
  return value === "github_user_or_org" ||
    value === "github_team" ||
    value === "email" ||
    value === "unknown"
    ? value
    : null;
}

function readOwnershipPatternShape(
  value: unknown,
): TwinOwnershipPatternShape | null {
  return value === "directory_like" ||
    value === "file_like" ||
    value === "ambiguous"
    ? value
    : null;
}

function readPositiveInteger(payload: Record<string, unknown>, key: string) {
  const value = payload[key];

  return Number.isInteger(value) && typeof value === "number" && value > 0
    ? value
    : null;
}

function readNonNegativeInteger(payload: Record<string, unknown>, key: string) {
  const value = payload[key];

  return Number.isInteger(value) && typeof value === "number" && value >= 0
    ? value
    : null;
}

function readString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readStringArray(payload: Record<string, unknown>, key: string) {
  const value = payload[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (candidate): candidate is string =>
      typeof candidate === "string" && candidate.length > 0,
  );
}
