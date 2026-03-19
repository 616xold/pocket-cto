import type {
  TwinDocFileSummary,
  TwinDocSectionSummary,
  TwinEdge,
  TwinEntity,
  TwinKindCountMap,
  TwinRepositoryDocSectionsView,
  TwinRepositoryDocsSyncResult,
  TwinRepositoryDocsView,
  TwinRepositorySummary,
  TwinSyncRun,
} from "@pocket-cto/domain";

export function buildTwinRepositoryDocsSyncResult(input: {
  docFileCount: number;
  docSectionCount: number;
  edgeCount: number;
  edges: TwinEdge[];
  entities: TwinEntity[];
  entityCount: number;
  repository: TwinRepositorySummary;
  syncRun: TwinSyncRun;
}): TwinRepositoryDocsSyncResult {
  return {
    repository: input.repository,
    syncRun: input.syncRun,
    docsState: input.docFileCount === 0 ? "no_docs" : "docs_available",
    docFileCount: input.docFileCount,
    docSectionCount: input.docSectionCount,
    entityCount: input.entityCount,
    edgeCount: input.edgeCount,
    entityCountsByKind: buildKindCounts(input.entities),
    edgeCountsByKind: buildKindCounts(input.edges),
  };
}

export function buildTwinRepositoryDocsView(input: {
  docFileEntities: TwinEntity[];
  docSectionEntities: TwinEntity[];
  docsState: "docs_available" | "no_docs" | "not_synced";
  latestRun: TwinSyncRun | null;
  repository: TwinRepositorySummary;
}): TwinRepositoryDocsView {
  if (input.docsState !== "docs_available") {
    return {
      repository: input.repository,
      latestRun: input.latestRun,
      docsState: input.docsState,
      counts: {
        docFileCount: 0,
        docSectionCount: 0,
      },
      docs: [],
    };
  }

  const docs = input.docFileEntities
    .map(readDocFile)
    .sort((left, right) => left.path.localeCompare(right.path));

  return {
    repository: input.repository,
    latestRun: input.latestRun,
    docsState: "docs_available",
    counts: {
      docFileCount: docs.length,
      docSectionCount: input.docSectionEntities.length,
    },
    docs,
  };
}

export function buildTwinRepositoryDocSectionsView(input: {
  docFileEntities: TwinEntity[];
  docSectionEntities: TwinEntity[];
  docsState: "docs_available" | "no_docs" | "not_synced";
  latestRun: TwinSyncRun | null;
  repository: TwinRepositorySummary;
}): TwinRepositoryDocSectionsView {
  if (input.docsState !== "docs_available") {
    return {
      repository: input.repository,
      latestRun: input.latestRun,
      docsState: input.docsState,
      counts: {
        docFileCount: 0,
        docSectionCount: 0,
      },
      sections: [],
    };
  }

  const sections = input.docSectionEntities
    .map(readDocSection)
    .sort((left, right) => {
      return (
        left.sourceFilePath.localeCompare(right.sourceFilePath) ||
        left.ordinal - right.ordinal ||
        left.stableKey.localeCompare(right.stableKey)
      );
    });

  return {
    repository: input.repository,
    latestRun: input.latestRun,
    docsState: "docs_available",
    counts: {
      docFileCount: input.docFileEntities.length,
      docSectionCount: sections.length,
    },
    sections,
  };
}

function buildKindCounts(items: Array<{ kind: string }>): TwinKindCountMap {
  const counts: TwinKindCountMap = {};

  for (const item of items) {
    counts[item.kind] = (counts[item.kind] ?? 0) + 1;
  }

  return counts;
}

function readDocFile(entity: TwinEntity): TwinDocFileSummary {
  return {
    path: readString(entity.payload, "path") ?? entity.stableKey,
    title: readString(entity.payload, "titleFallback") ?? entity.title,
    headingCount: readNonNegativeInteger(entity.payload, "headingCount") ?? 0,
    lineCount: readNonNegativeInteger(entity.payload, "lineCount") ?? 0,
    sizeBytes: readNonNegativeInteger(entity.payload, "sizeBytes") ?? 0,
    modifiedAt: readNullableDatetime(entity.payload, "modifiedAt"),
  };
}

function readDocSection(entity: TwinEntity): TwinDocSectionSummary {
  return {
    stableKey: entity.stableKey,
    sourceFilePath:
      readString(entity.payload, "sourceFilePath") ?? entity.stableKey,
    headingText: readString(entity.payload, "headingText") ?? entity.title,
    headingLevel: readHeadingLevel(entity.payload, "headingLevel") ?? 1,
    anchor: readString(entity.payload, "anchor") ?? entity.stableKey,
    headingPath: readString(entity.payload, "headingPath") ?? entity.title,
    ordinal: readPositiveInteger(entity.payload, "ordinal") ?? 1,
    excerpt: readNullableString(entity.payload, "excerpt"),
  };
}

function readHeadingLevel(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return Number.isInteger(value) &&
    typeof value === "number" &&
    value >= 1 &&
    value <= 6
    ? value
    : null;
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

function readPositiveInteger(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return Number.isInteger(value) && typeof value === "number" && value > 0
    ? value
    : null;
}

function readNullableDatetime(
  payload: Record<string, unknown>,
  key: string,
) {
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
