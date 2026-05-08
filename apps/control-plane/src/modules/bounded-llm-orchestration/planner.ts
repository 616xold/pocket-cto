import {
  BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
  BOUNDED_LLM_READ_ONLY_TOOL_ALLOWLIST,
  EvidenceToolPlanSchema,
  LlmOutputSchema,
  type EvidenceToolPlan,
  type LlmOutput,
} from "@pocket-cto/domain";
import {
  V2E_FORBIDDEN_ACTIONS,
  boundaryLimitations,
  buildAuditEvent,
  defaultCitationRequirements,
  detectUnsafeActions,
  fixedReadOnlyToolNames,
  humanReviewAction,
  normalizeQuestion,
  planFreshness,
} from "./policy";
import {
  unsafeActionRefusalOutput,
  unsupportedEvidenceRefusalOutput,
} from "./refusals";

export type QueryPlannerInput = {
  companyKey: string;
  question: string;
  timestamp: string;
};

export class QueryPlanner {
  plan(input: QueryPlannerInput): LlmOutput {
    const normalizedQuery = normalizeQuestion(input.question);
    if (normalizedQuery.length === 0) {
      return unsupportedEvidenceRefusalOutput({
        companyKey: input.companyKey,
        normalizedQuery: "empty query",
        originalText: input.question,
        reasons: ["outside_tool_coverage"],
        timestamp: input.timestamp,
      });
    }

    const unsafeActions = detectUnsafeActions(normalizedQuery);
    if (unsafeActions.length > 0) {
      return unsafeActionRefusalOutput({
        companyKey: input.companyKey,
        normalizedQuery,
        originalText: input.question,
        requestedActions: unsafeActions,
        timestamp: input.timestamp,
      });
    }

    const plannedToolNames = fixedReadOnlyToolNames();
    const audit = buildAuditEvent({
      companyKey: input.companyKey,
      normalizedQuery,
      plannedToolNames,
      responseKind: "evidence_tool_plan",
      timestamp: input.timestamp,
    });
    const freshness = planFreshness(input.timestamp);
    const limitations = boundaryLimitations();
    const permittedNextActions = [humanReviewAction(input.companyKey)];
    const requiredCitations = defaultCitationRequirements();
    const toolPlan: EvidenceToolPlan = EvidenceToolPlanSchema.parse({
      audit,
      companyKey: input.companyKey,
      forbiddenActions: V2E_FORBIDDEN_ACTIONS,
      freshness,
      limitations,
      normalizedQuery,
      originalQuestion: input.question,
      permittedNextActions,
      plannedTools: BOUNDED_LLM_READ_ONLY_TOOL_ALLOWLIST.map(
        (toolName, index) => ({
          expectedCitationRequirementIds: requiredCitations.map(
            (requirement) => requirement.requirementId,
          ),
          purpose: purposeForTool(toolName),
          readOnly: true,
          sequence: index + 1,
          toolName,
        }),
      ),
      rationale:
        "Plan only the fixed local/internal read-only V2C evidence tools before any bounded summary.",
      requiredCitations,
      schemaVersion: BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
    });

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
        normalizedText: normalizedQuery,
        originalText: input.question,
      },
      refusal: null,
      responseKind: "evidence_tool_plan",
      schemaVersion: BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
      summary: null,
      toolPlan,
    });
  }
}

function purposeForTool(toolName: (typeof BOUNDED_LLM_READ_ONLY_TOOL_ALLOWLIST)[number]) {
  switch (toolName) {
    case "search_evidence":
      return "Find existing source-backed EvidenceIndex artifacts.";
    case "fetch_evidence_card":
      return "Fetch selected EvidenceCard detail with citations.";
    case "fetch_source_anchor":
      return "Fetch selected SourceAnchor and bounded excerpt posture.";
    case "fetch_document_map":
      return "Fetch selected DocumentMap or precision map posture.";
    case "fetch_source_coverage":
      return "Inspect source coverage, freshness, and limitations.";
    case "fetch_company_posture":
      return "Inspect read-only Finance Twin, CFO Wiki, and proof refs.";
    case "fetch_capability_boundaries":
      return "Verify read-only capability and forbidden-action posture.";
  }
}
