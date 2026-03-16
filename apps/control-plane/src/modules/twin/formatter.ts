import type {
  TwinEdge,
  TwinEdgeListView,
  TwinEntity,
  TwinEntityListView,
  TwinKindCountMap,
  TwinRepositoryMetadataSummary,
  TwinRepositoryMetadataSyncResult,
  TwinRepositorySummary,
  TwinSyncRun,
  TwinSyncRunListView,
} from "@pocket-cto/domain";
import type { GitHubRepositoryDetailResult } from "../github-app/schema";

export function toTwinRepositorySummary(
  detail: GitHubRepositoryDetailResult,
): TwinRepositorySummary {
  return {
    fullName: detail.repository.fullName,
    installationId: detail.repository.installationId,
    defaultBranch: detail.repository.defaultBranch,
    archived: detail.repository.archived,
    disabled: detail.repository.disabled,
    isActive: detail.repository.isActive,
    writeReadiness: detail.writeReadiness,
  };
}

export function buildTwinEntityListView(input: {
  entities: TwinEntity[];
  repository: TwinRepositorySummary;
}): TwinEntityListView {
  return {
    repository: input.repository,
    entityCount: input.entities.length,
    entities: input.entities,
  };
}

export function buildTwinEdgeListView(input: {
  edges: TwinEdge[];
  repository: TwinRepositorySummary;
}): TwinEdgeListView {
  return {
    repository: input.repository,
    edgeCount: input.edges.length,
    edges: input.edges,
  };
}

export function buildTwinSyncRunListView(input: {
  repository: TwinRepositorySummary;
  runs: TwinSyncRun[];
}): TwinSyncRunListView {
  return {
    repository: input.repository,
    runCount: input.runs.length,
    runs: input.runs,
  };
}

export function buildTwinRepositoryMetadataSummary(input: {
  edges: TwinEdge[];
  entities: TwinEntity[];
  latestRun: TwinSyncRun | null;
  repository: TwinRepositorySummary;
}): TwinRepositoryMetadataSummary {
  return {
    repository: input.repository,
    latestRun: input.latestRun,
    entityCount: input.entities.length,
    edgeCount: input.edges.length,
    entityCountsByKind: buildKindCounts(input.entities),
    edgeCountsByKind: buildKindCounts(input.edges),
    metadata: {
      repository: readRepositoryMetadata(input.entities),
      defaultBranch: readDefaultBranch(input.entities),
      rootReadme: readRootReadme(input.entities),
      manifests: readManifestMetadata(input.entities),
      directories: readDirectoryMetadata(input.entities),
    },
  };
}

export function buildTwinRepositoryMetadataSyncResult(input: {
  edges: TwinEdge[];
  entities: TwinEntity[];
  repository: TwinRepositorySummary;
  syncRun: TwinSyncRun;
}): TwinRepositoryMetadataSyncResult {
  return {
    repository: input.repository,
    syncRun: input.syncRun,
    entityCount: input.entities.length,
    edgeCount: input.edges.length,
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

function readRepositoryMetadata(entities: TwinEntity[]) {
  const entity = entities.find((candidate) => candidate.kind === "repository");

  if (!entity) {
    return null;
  }

  return {
    fullName: readString(entity.payload, "fullName") ?? entity.title,
    defaultBranch:
      readString(entity.payload, "defaultBranch") ?? entity.summary ?? "unknown",
    visibility: readVisibility(entity.payload.visibility),
    archived: readNullableBoolean(entity.payload, "archived"),
    disabled: readNullableBoolean(entity.payload, "disabled"),
    isActive: readBoolean(entity.payload, "isActive") ?? true,
  };
}

function readDefaultBranch(entities: TwinEntity[]) {
  const entity = entities.find(
    (candidate) => candidate.kind === "default_branch",
  );

  if (!entity) {
    return null;
  }

  return {
    name: readString(entity.payload, "name") ?? entity.title,
  };
}

function readRootReadme(entities: TwinEntity[]) {
  const entity = entities.find((candidate) => candidate.kind === "root_readme");

  if (!entity) {
    return null;
  }

  return {
    path: readString(entity.payload, "path") ?? entity.title,
    sizeBytes: readNonNegativeInteger(entity.payload, "sizeBytes") ?? 0,
    lineCount: readNonNegativeInteger(entity.payload, "lineCount") ?? 0,
  };
}

function readManifestMetadata(entities: TwinEntity[]) {
  return entities
    .filter((candidate) => candidate.kind === "package_manifest")
    .map((entity) => ({
      path: readString(entity.payload, "path") ?? entity.stableKey,
      packageName: readNullableString(entity.payload, "packageName"),
      private: readNullableBoolean(entity.payload, "private"),
      hasWorkspaces: readBoolean(entity.payload, "hasWorkspaces") ?? false,
      scriptNames: readStringArray(entity.payload, "scriptNames"),
    }))
    .sort((left, right) => left.path.localeCompare(right.path));
}

function readDirectoryMetadata(entities: TwinEntity[]) {
  return entities
    .filter((candidate) => candidate.kind === "workspace_directory")
    .map((entity) => ({
      path: readString(entity.payload, "path") ?? entity.stableKey,
      label: readString(entity.payload, "label") ?? entity.title,
      classification:
        readString(entity.payload, "classification") ?? "workspace_group",
    }))
    .sort((left, right) => left.path.localeCompare(right.path));
}

function readBoolean(
  payload: Record<string, unknown>,
  key: string,
) {
  const value = payload[key];
  return typeof value === "boolean" ? value : null;
}

function readNonNegativeInteger(
  payload: Record<string, unknown>,
  key: string,
) {
  const value = payload[key];
  return Number.isInteger(value) && typeof value === "number" && value >= 0
    ? value
    : null;
}

function readNullableBoolean(
  payload: Record<string, unknown>,
  key: string,
) {
  const value = payload[key];
  return typeof value === "boolean" ? value : null;
}

function readNullableString(
  payload: Record<string, unknown>,
  key: string,
) {
  const value = payload[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readString(
  payload: Record<string, unknown>,
  key: string,
) {
  return readNullableString(payload, key);
}

function readStringArray(
  payload: Record<string, unknown>,
  key: string,
) {
  const value = payload[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string" && item.length > 0)
    .sort((left, right) => left.localeCompare(right));
}

function readVisibility(value: unknown): "private" | "public" | null {
  return value === "private" || value === "public" ? value : null;
}
