import {
  CapabilityBoundaryFetchSchema,
  CompanyPostureFetchSchema,
  DocumentMapFetchSchema,
  SourceAnchorFetchSchema,
  SourceCoverageFetchSchema,
  type AppMode,
  type CapabilityBoundaryFetch,
  type CompanyPostureFetch,
  type DocumentMapFetch,
  type EvidenceCard,
  type EvidenceFetchResult,
  type EvidenceSearchResult,
  type EvidenceToolName,
  type EvidenceToolResponse,
  type SourceAnchorFetch,
  type SourceCoverageFetch,
} from "@pocket-cto/domain";
import {
  V2C_FORBIDDEN_ACTIONS,
  isV2CForbiddenAction,
  isV2CReadOnlyToolName,
} from "./manifest";
import { buildCitation, buildSafeExcerpt } from "./policies";
import {
  buildFetchResponse,
  buildToolResponse,
  buildUnsupportedResponse,
  citationsForAnchorIds,
  citationsForAnchors,
  findAnchor,
  normalize,
  postureRefs,
  safeExcerptsForAnchor,
  sanitizeDocumentMapForFetch,
  toSearchResult,
} from "./service-helpers";
import {
  buildEvidenceToolArtifactStore,
  type EvidenceToolArtifactStore,
  type EvidenceToolArtifactStoreInput,
} from "./store";

export type EvidenceToolServiceInput = EvidenceToolArtifactStoreInput & {
  appMode: AppMode;
  companyKey: string;
  generatedAt: string;
};

export class ReadOnlyEvidenceToolService {
  private readonly appMode: AppMode;
  private readonly companyKey: string;
  private readonly generatedAt: string;
  private readonly store: EvidenceToolArtifactStore;

  constructor(input: EvidenceToolServiceInput) {
    this.appMode = input.appMode;
    this.companyKey = input.companyKey;
    this.generatedAt = input.generatedAt;
    this.store = buildEvidenceToolArtifactStore(input);
  }

  searchEvidence(input: {
    includeExcerpts?: boolean;
    limit?: number;
    query: string;
  }): EvidenceToolResponse<EvidenceSearchResult[]> {
    const query = normalize(input.query);
    const results = this.store.evidenceCards
      .filter((card) => normalize(card.claimText).includes(query))
      .slice(0, Math.max(1, Math.min(input.limit ?? 10, 25)))
      .map((card, index) =>
        toSearchResult({
          card,
          includeExcerpts: input.includeExcerpts === true,
          rank: index + 1,
          store: this.store,
        }),
      );

    return this.response({
      artifactIds: results.map((result) => result.id),
      citations: citationsForAnchorIds(
        this.store,
        results.flatMap((result) => result.sourceAnchorIds),
      ),
      excerptCharacterCount: results
        .flatMap((result) => result.safeExcerpts)
        .reduce((sum, excerpt) => sum + excerpt.characterCount, 0),
      limitations: results.flatMap((result) => result.limitations),
      normalizedQuery: query,
      ok: results.length > 0,
      permittedNextActions: results.flatMap(
        (result) => result.permittedNextActions,
      ),
      redactions: results.flatMap((result) =>
        result.safeExcerpts.flatMap((excerpt) => excerpt.redactions),
      ),
      result: results,
      toolName: "search_evidence",
      unsupportedReason:
        results.length === 0
          ? "No source-backed EvidenceIndex artifact matched the query."
          : null,
    });
  }

  fetchEvidenceCard(input: {
    evidenceCardId: string;
  }): EvidenceToolResponse<EvidenceFetchResult<EvidenceCard>> {
    const card = this.store.evidenceCards.find(
      (candidate) => candidate.id === input.evidenceCardId,
    );
    if (!card) return this.unsupported("fetch_evidence_card", input.evidenceCardId);

    return buildFetchResponse(this.context(), {
      artifact: card,
      artifactId: card.id,
      artifactKind: "evidence_card",
      citations: citationsForAnchors(card.sourceAnchors),
      freshness: card.freshness,
      limitations: card.limitations,
      permittedNextActions: card.permittedNextActions,
      toolName: "fetch_evidence_card",
    });
  }

  fetchSourceAnchor(input: {
    sourceAnchorId: string;
  }): EvidenceToolResponse<SourceAnchorFetch> {
    const anchor = findAnchor(this.store, input.sourceAnchorId);
    if (!anchor) return this.unsupported("fetch_source_anchor", input.sourceAnchorId);

    const safeExcerpt = safeExcerptsForAnchor(this.store, anchor)[0] ?? null;
    const result = SourceAnchorFetchSchema.parse({
      citation: citationsForAnchors([anchor])[0],
      safeExcerpt,
      sourceAnchor: anchor,
    });

    return this.response({
      artifactIds: [anchor.id],
      citations: [result.citation],
      excerptCharacterCount: safeExcerpt?.characterCount ?? 0,
      limitations: anchor.limitations,
      ok: true,
      permittedNextActions: [],
      redactions: safeExcerpt?.redactions ?? [],
      result,
      toolName: "fetch_source_anchor",
    });
  }

  fetchDocumentMap(input: {
    documentMapId?: string;
    sourceId?: string;
  }): EvidenceToolResponse<DocumentMapFetch> {
    const map = this.store.documentMaps.find(
      (candidate) =>
        candidate.id === input.documentMapId ||
        candidate.sourceDocument.sourceId === input.sourceId,
    );
    if (!map) {
      return this.unsupported(
        "fetch_document_map",
        input.documentMapId ?? input.sourceId ?? "missing",
      );
    }

    const safeExcerpts = map.sourceSections
      .map((section) => {
        const anchor = findAnchor(this.store, section.anchorId);
        return anchor ? buildSafeExcerpt({ anchor, text: section.excerpt }) : null;
      })
      .filter((excerpt): excerpt is NonNullable<typeof excerpt> => excerpt !== null);
    const result = DocumentMapFetchSchema.parse({
      citations: citationsForAnchors(map.sourceAnchors),
      documentMap: sanitizeDocumentMapForFetch(this.store, map),
      safeExcerpts,
    });

    return this.response({
      artifactIds: [map.id],
      citations: result.citations,
      excerptCharacterCount: safeExcerpts.reduce(
        (sum, excerpt) => sum + excerpt.characterCount,
        0,
      ),
      limitations: map.limitations,
      ok: true,
      permittedNextActions: [],
      redactions: safeExcerpts.flatMap((excerpt) => excerpt.redactions),
      result,
      toolName: "fetch_document_map",
    });
  }

  fetchSourceCoverage(): EvidenceToolResponse<SourceCoverageFetch> {
    const matrix = this.store.sourceCoverageMatrices[0];
    if (!matrix) return this.unsupported("fetch_source_coverage", this.companyKey);

    const result = SourceCoverageFetchSchema.parse({
      citations: matrix.entries.map((entry) =>
        buildCitation({
          citationType: "source_coverage",
          id: entry.sourceId,
          sourceId: entry.sourceId,
          summary: `Coverage status is ${entry.coverageStatus}.`,
        }),
      ),
      sourceCoverageMatrix: matrix,
    });

    return this.response({
      artifactIds: matrix.entries.map((entry) => entry.sourceId),
      capabilityBoundaries: matrix.capabilityBoundaries,
      citations: result.citations,
      limitations: matrix.entries.flatMap((entry) => entry.limitations),
      ok: true,
      permittedNextActions: [],
      result,
      toolName: "fetch_source_coverage",
    });
  }

  fetchCompanyPosture(): EvidenceToolResponse<CompanyPostureFetch> {
    const result = CompanyPostureFetchSchema.parse({
      cfoWikiRefs: this.store.cfoWikiRefs,
      companyKey: this.companyKey,
      documentMapCount: this.store.documentMaps.length,
      evidenceCardCount: this.store.evidenceCards.length,
      financeTwinRefs: this.store.financeTwinRefs,
      missionAnswerRefs: this.store.missionAnswerRefs,
      proofBundleRefs: this.store.proofBundleRefs,
      sourceAnchorCount: this.store.sourceAnchors.length,
      sourceCoverageEntryCount: this.store.sourceCoverageMatrices.reduce(
        (sum, matrix) => sum + matrix.entries.length,
        0,
      ),
    });

    return this.response({
      artifactIds: postureRefs(result).map((ref) => ref.id),
      citations: postureRefs(result).map((ref) =>
        buildCitation({
          citationType: ref.refKind,
          id: ref.id,
          summary: ref.summary,
        }),
      ),
      limitations: [],
      ok: true,
      permittedNextActions: [],
      result,
      toolName: "fetch_company_posture",
    });
  }

  fetchCapabilityBoundaries(input: {
    requestedAction?: string | null;
  }): EvidenceToolResponse<CapabilityBoundaryFetch> {
    const requestedAction = input.requestedAction ?? null;
    const readOnlyToolRequested =
      requestedAction !== null && isV2CReadOnlyToolName(requestedAction);
    const forbiddenActionRequested =
      requestedAction !== null && isV2CForbiddenAction(requestedAction);
    const blocked =
      requestedAction !== null &&
      (forbiddenActionRequested || !readOnlyToolRequested);
    const result = CapabilityBoundaryFetchSchema.parse({
      capabilityBoundaries: this.store.capabilityBoundaries,
      citations: this.store.capabilityBoundaries.map((boundary) =>
        buildCitation({
          citationType: "capability_boundary",
          id: boundary.code,
          summary: boundary.summary,
        }),
      ),
      forbiddenActions: V2C_FORBIDDEN_ACTIONS,
      noWriteToolsRegistered: true,
      readOnlyToolsOnly: true,
      requestedAction,
      requestedActionAllowed: requestedAction === null || readOnlyToolRequested,
    });

    return this.response({
      capabilityBoundaries: this.store.capabilityBoundaries,
      citations: result.citations,
      forbiddenRequestBlocked: blocked,
      limitations: this.store.capabilityBoundaries,
      ok: true,
      permittedNextActions: [],
      result,
      toolName: "fetch_capability_boundaries",
      unsupportedReason: blocked
        ? `Requested action ${requestedAction} is not permitted by the V2C read-only evidence-tool contract.`
        : null,
    });
  }

  private response<T>(input: Parameters<typeof buildToolResponse<T>>[1]) {
    return buildToolResponse<T>(this.context(), input);
  }

  private unsupported<T>(
    toolName: EvidenceToolName,
    artifactId: string,
  ): EvidenceToolResponse<T> {
    return buildUnsupportedResponse<T>(this.context(), toolName, artifactId);
  }

  private context() {
    return {
      appMode: this.appMode,
      companyKey: this.companyKey,
      generatedAt: this.generatedAt,
      store: this.store,
    };
  }
}
