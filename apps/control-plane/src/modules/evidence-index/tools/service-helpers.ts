import {
  EvidenceFetchResultSchema,
  EvidenceSearchResultSchema,
  type AppMode,
  type CompanyPostureFetch,
  type DocumentMap,
  type EvidenceCard,
  type EvidenceFetchResult,
  type EvidenceIndexFreshnessPosture,
  type EvidenceIndexLimitationPosture,
  type EvidenceReference,
  type EvidenceToolCitation,
  type EvidenceToolName,
  type EvidenceToolResponse,
  type PermittedNextAction,
  type SourceAnchor,
} from "@pocket-cto/domain";
import { V2C_FORBIDDEN_ACTIONS } from "./manifest";
import { buildSafeExcerpt } from "./policies";
import { buildEvidenceToolResponse } from "./response";
import type { EvidenceToolArtifactStore } from "./store";

export type EvidenceToolContext = {
  appMode: AppMode;
  companyKey: string;
  generatedAt: string;
  store: EvidenceToolArtifactStore;
};

export function buildToolResponse<T>(
  context: EvidenceToolContext,
  input: Omit<
    Parameters<typeof buildEvidenceToolResponse<T>>[0],
    "appMode" | "companyKey" | "freshness" | "timestamp"
  > & {
    freshness?: EvidenceIndexFreshnessPosture;
  },
) {
  return buildEvidenceToolResponse<T>({
    appMode: context.appMode,
    companyKey: context.companyKey,
    freshness: input.freshness ?? defaultFreshness(context),
    timestamp: context.generatedAt,
    ...input,
  });
}

export function buildFetchResponse<T>(
  context: EvidenceToolContext,
  input: {
    artifact: T;
    artifactId: string;
    artifactKind: EvidenceFetchResult<T>["artifactKind"];
    citations: EvidenceToolCitation[];
    freshness: EvidenceIndexFreshnessPosture;
    limitations: EvidenceIndexLimitationPosture[];
    permittedNextActions: PermittedNextAction[];
    toolName: EvidenceToolName;
  },
): EvidenceToolResponse<EvidenceFetchResult<T>> {
  const result = EvidenceFetchResultSchema.parse({
    artifact: input.artifact,
    artifactId: input.artifactId,
    artifactKind: input.artifactKind,
    capabilityBoundaries: context.store.capabilityBoundaries,
    citations: input.citations,
    forbiddenActions: V2C_FORBIDDEN_ACTIONS,
    freshness: input.freshness,
    limitations: input.limitations,
    permittedNextActions: input.permittedNextActions,
    unsupportedReason: null,
  }) as EvidenceFetchResult<T>;

  return buildToolResponse(context, {
    artifactIds: [input.artifactId],
    capabilityBoundaries: context.store.capabilityBoundaries,
    citations: input.citations,
    limitations: input.limitations,
    ok: true,
    permittedNextActions: input.permittedNextActions,
    result,
    toolName: input.toolName,
  });
}

export function buildUnsupportedResponse<T>(
  context: EvidenceToolContext,
  toolName: EvidenceToolName,
  artifactId: string,
): EvidenceToolResponse<T> {
  return buildToolResponse<T>(context, {
    artifactIds: [artifactId],
    citations: [],
    limitations: [
      {
        affectedAnchorIds: [],
        affectedSourceIds: [],
        code: "source_not_indexed",
        severity: "blocking",
        summary:
          "Requested artifact is missing, unsupported, stale, or not indexed in the read-only EvidenceIndex store.",
      },
    ],
    ok: false,
    permittedNextActions: [
      {
        action: "request_human_review",
        label: "Ask a human to inspect source coverage before using this result.",
        targetId: artifactId,
      },
    ],
    result: null,
    toolName,
    unsupportedReason:
      "Requested artifact is not available from the local read-only evidence contract.",
  });
}

export function safeExcerptsForAnchor(
  store: EvidenceToolArtifactStore,
  anchor: SourceAnchor,
) {
  return store.documentMaps.flatMap((map) =>
    map.sourceSections
      .filter((section) => section.anchorId === anchor.id)
      .map((section) => buildSafeExcerpt({ anchor, text: section.excerpt })),
  );
}

export function findAnchor(store: EvidenceToolArtifactStore, anchorId: string) {
  return store.sourceAnchors.find((anchor) => anchor.id === anchorId);
}

export function defaultFreshness(context: EvidenceToolContext) {
  return (
    context.store.evidenceCards[0]?.freshness ?? {
      checkedAt: context.generatedAt,
      compiledAt: null,
      extractedAt: null,
      sourceCapturedAt: null,
      state: "missing",
      summary: "No read-only EvidenceIndex artifact was available.",
    }
  );
}

export function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function documentMapForCard(card: EvidenceCard, maps: DocumentMap[]) {
  const sourceDocumentId = card.sourceAnchors[0]?.sourceDocumentId;
  return maps.find((map) => map.sourceDocument.id === sourceDocumentId);
}

export function postureRefs(posture: CompanyPostureFetch): EvidenceReference[] {
  return [
    ...posture.financeTwinRefs,
    ...posture.cfoWikiRefs,
    ...posture.missionAnswerRefs,
    ...posture.proofBundleRefs,
  ];
}

export function toSearchResult(input: {
  card: EvidenceCard;
  includeExcerpts: boolean;
  rank: number;
  store: EvidenceToolArtifactStore;
}) {
  return EvidenceSearchResultSchema.parse({
    capabilityBoundarySummary:
      input.card.limitations.find((limitation) => limitation.severity === "blocking")
        ?.summary ?? null,
    documentMapId:
      documentMapForCard(input.card, input.store.documentMaps)?.id ?? null,
    evidenceCardId: input.card.id,
    freshness: input.card.freshness,
    id: `search-result:${input.card.id}`,
    limitations: input.card.limitations,
    matchedFields: ["claimText"],
    permittedNextActions: input.card.permittedNextActions,
    rank: input.rank,
    resultKind: "evidence_card",
    safeExcerpts: input.includeExcerpts
      ? input.card.sourceAnchors.flatMap((anchor) =>
          safeExcerptsForAnchor(input.store, anchor),
        )
      : [],
    sourceAnchorIds: input.card.sourceAnchors.map((anchor) => anchor.id),
    title: input.card.claimType,
  });
}

export function citationsForAnchorIds(
  store: EvidenceToolArtifactStore,
  anchorIds: string[],
) {
  return anchorIds
    .map((anchorId) => findAnchor(store, anchorId))
    .filter((anchor): anchor is SourceAnchor => anchor !== undefined)
    .map((anchor) => citationsForAnchors([anchor])[0]!);
}

export function citationsForAnchors(anchors: SourceAnchor[]) {
  return anchors.map((anchor) => ({
    checksumSha256: anchor.checksumSha256,
    citationType: "source_anchor" as const,
    id: anchor.id,
    locator: anchor.locator.value,
    sourceAnchorId: anchor.id,
    sourceId: anchor.sourceId,
    sourceSnapshotId: anchor.sourceSnapshotId,
    summary: "Tool result cites an existing SourceAnchor.",
  }));
}
