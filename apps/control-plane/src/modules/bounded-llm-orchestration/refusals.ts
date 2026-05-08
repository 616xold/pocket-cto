import {
  BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
  LlmOutputSchema,
  type BoundedLlmForbiddenAction,
  type LlmOutput,
  type UnsupportedEvidenceRefusal,
} from "@pocket-cto/domain";
import {
  V2E_FORBIDDEN_ACTIONS,
  boundaryLimitations,
  buildAuditEvent,
  defaultCitationRequirements,
  humanReviewAction,
  planFreshness,
} from "./policy";

type RefusalInput = {
  companyKey: string;
  normalizedQuery: string;
  originalText: string;
  timestamp: string;
};

export function unsafeActionRefusalOutput(
  input: RefusalInput & {
    requestedActions: BoundedLlmForbiddenAction[];
  },
): LlmOutput {
  const audit = buildAuditEvent({
    companyKey: input.companyKey,
    forbiddenActionRequested: input.requestedActions.join(","),
    forbiddenActionsBlocked: input.requestedActions,
    normalizedQuery: input.normalizedQuery,
    refusalReason: "Unsafe action requested.",
    responseKind: "unsafe_action_refusal",
    timestamp: input.timestamp,
  });
  const freshness = planFreshness(input.timestamp);
  const limitations = boundaryLimitations();
  const permittedNextActions = [humanReviewAction(input.companyKey)];
  const refusal = {
    audit,
    companyKey: input.companyKey,
    forbiddenActions: V2E_FORBIDDEN_ACTIONS,
    freshness,
    limitations,
    normalizedQuery: input.normalizedQuery,
    permittedNextActions,
    readOnlyToolPlanEmitted: false,
    refusalReason:
      "The query requests behavior outside the local/internal read-only V2E proof boundary.",
    refusalType: "unsafe_action_refusal" as const,
    requestedActions: input.requestedActions,
    schemaVersion: BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
  };

  return LlmOutputSchema.parse({
    audit,
    citations: defaultCitationRequirements(),
    companyKey: input.companyKey,
    evidenceSelection: null,
    forbiddenActions: V2E_FORBIDDEN_ACTIONS,
    freshness,
    limitations,
    permittedNextActions,
    query: {
      normalizedText: input.normalizedQuery,
      originalText: input.originalText,
    },
    refusal,
    responseKind: "unsafe_action_refusal",
    schemaVersion: BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
    summary: null,
    toolPlan: null,
  });
}

export function unsupportedEvidenceRefusalOutput(
  input: RefusalInput & {
    artifactIds?: string[];
    reasons: UnsupportedEvidenceRefusal["unsupportedEvidenceReasons"];
  },
): LlmOutput {
  const audit = buildAuditEvent({
    companyKey: input.companyKey,
    normalizedQuery: input.normalizedQuery,
    refusalReason: "Evidence missing, stale, unsupported, failed, or outside coverage.",
    responseKind: "unsupported_evidence_refusal",
    selectedArtifactIds: input.artifactIds ?? [],
    timestamp: input.timestamp,
  });
  const freshness = planFreshness(input.timestamp);
  const limitations = boundaryLimitations();
  const permittedNextActions = [humanReviewAction(input.companyKey)];
  const refusal = {
    audit,
    companyKey: input.companyKey,
    forbiddenActions: V2E_FORBIDDEN_ACTIONS,
    freshness,
    limitations,
    normalizedQuery: input.normalizedQuery,
    permittedNextActions,
    refusalReason:
      "Selected evidence cannot support a bounded summary under the V2E contract.",
    refusalType: "unsupported_evidence_refusal" as const,
    schemaVersion: BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
    unsupportedArtifactIds: input.artifactIds ?? [],
    unsupportedEvidenceReasons: input.reasons,
  };

  return LlmOutputSchema.parse({
    audit,
    citations: defaultCitationRequirements(),
    companyKey: input.companyKey,
    evidenceSelection: null,
    forbiddenActions: V2E_FORBIDDEN_ACTIONS,
    freshness,
    limitations,
    permittedNextActions,
    query: {
      normalizedText: input.normalizedQuery,
      originalText: input.originalText,
    },
    refusal,
    responseKind: "unsupported_evidence_refusal",
    schemaVersion: BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
    summary: null,
    toolPlan: null,
  });
}

export function missingCitationRefusalOutput(
  input: RefusalInput & {
    missingClaimIds: string[];
  },
): LlmOutput {
  const audit = buildAuditEvent({
    companyKey: input.companyKey,
    normalizedQuery: input.normalizedQuery,
    refusalReason: "Positive claim lacks accepted citation refs.",
    responseKind: "missing_citation_refusal",
    timestamp: input.timestamp,
  });
  const freshness = planFreshness(input.timestamp);
  const limitations = boundaryLimitations();
  const permittedNextActions = [humanReviewAction(input.companyKey)];
  const requiredCitations = defaultCitationRequirements();
  const refusal = {
    audit,
    companyKey: input.companyKey,
    forbiddenActions: V2E_FORBIDDEN_ACTIONS,
    freshness,
    limitations,
    missingClaimIds: input.missingClaimIds,
    normalizedQuery: input.normalizedQuery,
    permittedNextActions,
    refusalReason:
      "A positive claim is missing a SourceAnchor or accepted derived ref.",
    refusalType: "missing_citation_refusal" as const,
    requiredCitations,
    schemaVersion: BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
  };

  return LlmOutputSchema.parse({
    audit,
    citations: requiredCitations,
    companyKey: input.companyKey,
    evidenceSelection: null,
    forbiddenActions: V2E_FORBIDDEN_ACTIONS,
    freshness,
    limitations,
    permittedNextActions,
    query: {
      normalizedText: input.normalizedQuery,
      originalText: input.originalText,
    },
    refusal,
    responseKind: "missing_citation_refusal",
    schemaVersion: BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
    summary: null,
    toolPlan: null,
  });
}
