import {
  BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
  BoundedEvidenceSummarySchema,
  LlmOutputSchema,
  type BoundedEvidenceSummaryClaim,
  type EvidenceSelectionResult,
  type LlmOutput,
} from "@pocket-cto/domain";
import {
  V2E_FORBIDDEN_ACTIONS,
  buildAuditEvent,
  defaultCitationRequirements,
  fixedReadOnlyToolNames,
  normalizeQuestion,
} from "./policy";
import { missingCitationRefusalOutput } from "./refusals";

export type BoundedSummaryInput = {
  claimOverrides?: BoundedEvidenceSummaryClaim[];
  companyKey: string;
  originalText: string;
  query: string;
  selection: EvidenceSelectionResult;
  timestamp: string;
};

export function buildBoundedEvidenceSummaryOutput(
  input: BoundedSummaryInput,
): LlmOutput {
  const normalizedQuery = normalizeQuestion(input.query);
  const claims = input.claimOverrides ?? [claimFromSelection(input.selection)];
  const missingClaimIds = claims
    .filter((claim) => claim.positiveClaim)
    .filter(
      (claim) =>
        claim.citationIds.length === 0 ||
        (claim.sourceAnchorIds.length === 0 &&
          claim.acceptedDerivedRefIds.length === 0),
    )
    .map((claim) => claim.claimId);

  if (missingClaimIds.length > 0) {
    return missingCitationRefusalOutput({
      companyKey: input.companyKey,
      missingClaimIds,
      normalizedQuery,
      originalText: input.originalText,
      timestamp: input.timestamp,
    });
  }

  const audit = buildAuditEvent({
    citationCount: input.selection.selectedCitations.length,
    companyKey: input.companyKey,
    normalizedQuery,
    plannedToolNames: fixedReadOnlyToolNames(),
    redactionCount: input.selection.safeExcerpts.reduce(
      (sum, excerpt) => sum + excerpt.redactions.length,
      0,
    ),
    responseKind: "bounded_evidence_summary",
    selectedArtifactIds: [
      ...input.selection.selectedEvidenceCardIds,
      ...input.selection.selectedDocumentMapIds,
      ...input.selection.selectedCoverageSourceIds,
    ],
    sourceAnchorIds: input.selection.selectedSourceAnchorIds,
    timestamp: input.timestamp,
  });
  const summary = BoundedEvidenceSummarySchema.parse({
    audit,
    citations: input.selection.selectedCitations,
    claims,
    companyKey: input.companyKey,
    freshness: input.selection.freshness,
    limitations: input.selection.limitations,
    noAutonomousAction: true,
    noGeneratedAdvice: true,
    normalizedQuery,
    permittedNextActions: input.selection.permittedNextActions,
    schemaVersion: BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
    selectedEvidenceIds: selectedEvidenceIds(input.selection),
    selectedEvidenceOnly: true,
    sourceExcerptPolicy: {
      bounded: true,
      cited: true,
      fullFileDumpsReturned: false,
      redacted: true,
    },
    summaryText:
      "Bounded local proof summary: selected V2C evidence has cited source or accepted derived refs; limitations remain attached.",
  });

  return LlmOutputSchema.parse({
    audit,
    citations: defaultCitationRequirements(),
    companyKey: input.companyKey,
    evidenceSelection: input.selection,
    forbiddenActions: V2E_FORBIDDEN_ACTIONS,
    freshness: input.selection.freshness,
    limitations: input.selection.limitations,
    permittedNextActions: input.selection.permittedNextActions,
    query: {
      normalizedText: normalizedQuery,
      originalText: input.originalText,
    },
    refusal: null,
    responseKind: "bounded_evidence_summary",
    schemaVersion: BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
    summary,
    toolPlan: null,
  });
}

function claimFromSelection(
  selection: EvidenceSelectionResult,
): BoundedEvidenceSummaryClaim {
  const derivedRefIds = selection.selectedCitations
    .filter((citation) => citation.citationType !== "source_anchor")
    .map((citation) => citation.id);

  return {
    acceptedDerivedRefIds: derivedRefIds,
    citationIds: selection.selectedCitations.map((citation) => citation.id),
    claimId: "claim:selected-evidence-supported",
    generatedAdvice: false,
    positiveClaim: true,
    selectedEvidenceOnly: true,
    sourceAnchorIds: selection.selectedSourceAnchorIds,
    text: "Selected evidence is available only through cited V2C read-only responses.",
  };
}

function selectedEvidenceIds(selection: EvidenceSelectionResult) {
  return [
    ...selection.selectedEvidenceCardIds,
    ...selection.selectedDocumentMapIds,
    ...selection.selectedCoverageSourceIds,
    ...selection.selectedSourceAnchorIds,
  ].filter((id, index, all) => all.indexOf(id) === index);
}
