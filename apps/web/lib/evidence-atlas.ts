import {
  EvidenceIndexCoverageStatusSchema,
  EvidenceIndexFreshnessStateSchema,
  EvidenceIndexLimitationCodeSchema,
  ForbiddenToolActionSchema,
  type DocumentMap,
  type EvidenceCard,
  type EvidenceIndexLimitationPosture,
  type ForbiddenToolAction,
  type SafeSourceExcerpt,
  type SourceCoverageMatrix,
  type SourceListView,
} from "@pocket-cto/domain";

export type EvidenceAtlasTimelineStatus =
  | "available"
  | "internal_only"
  | "missing"
  | "read_only";

export type EvidenceAtlasTimelineStep = {
  id: string;
  label: string;
  status: EvidenceAtlasTimelineStatus;
  summary: string;
};

export type EvidenceAtlasAnswerAnatomy = {
  claimSummary: string;
  evidenceRefs: string[];
  limitationSummaries: string[];
  freshnessSummary: string;
};

export type EvidenceAtlasReadModel = {
  answerAnatomy: EvidenceAtlasAnswerAnatomy | null;
  companyKey: string;
  documentMaps: DocumentMap[];
  evidenceCards: EvidenceCard[];
  forbiddenActions: ForbiddenToolAction[];
  generatedAt: string;
  limitationCodes: string[];
  limitations: EvidenceIndexLimitationPosture[];
  safeExcerpts: SafeSourceExcerpt[];
  sourceCount: number | null;
  sourceListLimit: number | null;
  sourceCoverageMatrix: SourceCoverageMatrix | null;
  sourceInventorySummary: string;
  statusLegend: string[];
  freshnessLegend: string[];
  timeline: EvidenceAtlasTimelineStep[];
};

type BuildEvidenceAtlasReadModelInput = {
  companyKey: string;
  generatedAt?: string;
  sourceList: SourceListView | null;
};

export function buildEvidenceAtlasReadModel({
  companyKey,
  generatedAt = new Date().toISOString(),
  sourceList,
}: BuildEvidenceAtlasReadModelInput): EvidenceAtlasReadModel {
  const sourceInventoryAvailable = sourceList !== null;
  const sourceCount = sourceList?.sourceCount ?? null;
  const sourceListLimit = sourceList?.limit ?? null;
  const limitations = buildAtlasFoundationLimitations();

  return {
    answerAnatomy: null,
    companyKey,
    documentMaps: [],
    evidenceCards: [],
    forbiddenActions: [...ForbiddenToolActionSchema.options],
    freshnessLegend: [...EvidenceIndexFreshnessStateSchema.options],
    generatedAt,
    limitationCodes: [...EvidenceIndexLimitationCodeSchema.options],
    limitations,
    safeExcerpts: [],
    sourceCount,
    sourceListLimit,
    sourceCoverageMatrix: null,
    sourceInventorySummary: readSourceInventorySummary(
      sourceInventoryAvailable,
      sourceCount,
      sourceListLimit,
    ),
    statusLegend: [...EvidenceIndexCoverageStatusSchema.options],
    timeline: buildTimeline({
      sourceCount,
      sourceListLimit,
      sourceInventoryAvailable,
    }),
  };
}

function readSourceInventorySummary(
  sourceInventoryAvailable: boolean,
  sourceCount: number | null,
  sourceListLimit: number | null,
) {
  if (!sourceInventoryAvailable) {
    return "The existing source-list read model is unavailable, so atlas coverage stays in a missing state.";
  }

  if (sourceCount === 0) {
    return "The existing source-list read model is reachable, but no source records are displayed in the current limited view.";
  }

  const limitSummary =
    sourceListLimit === null ? "limited source-list view" : `limit ${sourceListLimit}`;

  return `The existing source-list read model is reachable with ${sourceCount} displayed source record${
    sourceCount === 1 ? "" : "s"
  } from the current ${limitSummary}; this is not a total source inventory count. EvidenceIndex and V2C artifacts are not exposed through a web read route in this foundation.`;
}

function buildTimeline(input: {
  sourceCount: number | null;
  sourceListLimit: number | null;
  sourceInventoryAvailable: boolean;
}): EvidenceAtlasTimelineStep[] {
  const sourceInventorySuffix =
    input.sourceCount === null
      ? "."
      : ` with ${input.sourceCount} displayed records from the limited source-list view${
          input.sourceListLimit === null ? "" : ` (limit ${input.sourceListLimit})`
        }.`;

  return [
    {
      id: "raw_source_inventory",
      label: "Raw source registry",
      status: input.sourceInventoryAvailable ? "available" : "missing",
      summary: input.sourceInventoryAvailable
        ? `Existing source inventory is reachable${sourceInventorySuffix}`
        : "Existing source inventory could not be loaded from the current web read model.",
    },
    {
      id: "evidence_index_artifacts",
      label: "EvidenceIndex / document maps",
      status: "missing",
      summary:
        "No existing web read route exposes live EvidenceIndex coverage, document maps, anchors, or evidence cards to this UI.",
    },
    {
      id: "v2c_evidence_tools",
      label: "V2C evidence tools",
      status: "internal_only",
      summary:
        "The shipped V2C search/fetch/inspect contract remains local/internal and read-only; it is not registered as a public or web action surface.",
    },
    {
      id: "evidence_atlas_ui",
      label: "Evidence Atlas UI",
      status: "read_only",
      summary:
        "This route visualizes existing contracts and absence boundaries only. It creates no evidence, source truth, mission state, report, approval, or finance write.",
    },
  ];
}

function buildAtlasFoundationLimitations(): EvidenceIndexLimitationPosture[] {
  return [
    {
      affectedAnchorIds: [],
      affectedSourceIds: [],
      code: "missing_document_extract",
      severity: "blocking",
      summary:
        "Live EvidenceIndex and V2C artifacts are not exposed through an existing app/web read route, so this foundation renders missing atlas data instead of inventing source claims.",
    },
    {
      affectedAnchorIds: [],
      affectedSourceIds: [],
      code: "not_source_truth",
      severity: "blocking",
      summary:
        "The Evidence Atlas is visualization only; raw sources, Finance Twin, CFO Wiki, EvidenceIndex, V2C responses, mission answers, and proof bundles remain authoritative.",
    },
  ];
}
