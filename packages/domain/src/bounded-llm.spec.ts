import { describe, expect, it } from "vitest";
import {
  BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
  BOUNDED_LLM_READ_ONLY_TOOL_ALLOWLIST,
  EvidenceFaithfulnessGradeSchema,
  EvidenceSelectionResultSchema,
  EvidenceToolPlanSchema,
  LlmOutputSchema,
  MissingCitationGradeSchema,
  UnsafeActionRefusalGradeSchema,
} from "./bounded-llm";

const checkedAt = "2026-05-08T20:10:00.000Z";
const companyKey = "acme";

describe("bounded LLM orchestration domain schemas", () => {
  it("parses an EvidenceToolPlan over the exact read-only V2C allowlist", () => {
    const plan = EvidenceToolPlanSchema.parse({
      audit: audit("evidence_tool_plan"),
      companyKey,
      forbiddenActions: ["write_finance_twin_fact", "take_autonomous_action"],
      freshness: freshness("missing"),
      limitations: [limitation("not_source_truth")],
      normalizedQuery: "what evidence supports cash posture?",
      originalQuestion: "What evidence supports cash posture?",
      permittedNextActions: [humanReviewAction()],
      plannedTools: BOUNDED_LLM_READ_ONLY_TOOL_ALLOWLIST.map(
        (toolName, index) => ({
          expectedCitationRequirementIds: ["citation:positive-claim"],
          purpose: `Read-only proof call for ${toolName}.`,
          readOnly: true,
          sequence: index + 1,
          toolName,
        }),
      ),
      rationale: "Use fixed read-only V2C evidence tools only.",
      requiredCitations: [citationRequirement()],
      schemaVersion: BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
    });

    expect(plan.plannedTools.map((tool) => tool.toolName)).toEqual([
      "search_evidence",
      "fetch_evidence_card",
      "fetch_source_anchor",
      "fetch_document_map",
      "fetch_source_coverage",
      "fetch_company_posture",
      "fetch_capability_boundaries",
    ]);
    expect(plan.plannedTools.every((tool) => tool.readOnly)).toBe(true);
  });

  it("parses selection and summary outputs and fails closed on missing posture", () => {
    const selection = EvidenceSelectionResultSchema.parse({
      audit: audit("bounded_evidence_summary", {
        citationCount: 1,
        selectedArtifactIds: ["evidence-card:1"],
        sourceAnchorIds: ["anchor:1"],
      }),
      companyKey,
      conflictingEvidenceDetected: false,
      freshness: freshness("fresh"),
      fullFileDumpsReturned: false,
      limitations: [limitation("not_source_truth")],
      normalizedQuery: "what evidence supports cash posture?",
      permittedNextActions: [humanReviewAction()],
      promptInjectionTextTreatedAsData: true,
      safeExcerpts: [],
      schemaVersion: BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
      selectedCitations: [sourceCitation()],
      selectedCoverageSourceIds: [],
      selectedDocumentMapIds: [],
      selectedEvidenceCardIds: ["evidence-card:1"],
      selectedEvidenceOnly: true,
      selectedSourceAnchorIds: ["anchor:1"],
      toolResponses: [toolResponse()],
      unsupportedReasons: [],
    });
    const output = LlmOutputSchema.parse({
      audit: audit("bounded_evidence_summary", { citationCount: 1 }),
      citations: [citationRequirement()],
      companyKey,
      evidenceSelection: selection,
      forbiddenActions: ["write_finance_twin_fact", "take_autonomous_action"],
      freshness: freshness("fresh"),
      limitations: [limitation("not_source_truth")],
      permittedNextActions: [humanReviewAction()],
      query: {
        normalizedText: "what evidence supports cash posture?",
        originalText: "What evidence supports cash posture?",
      },
      refusal: null,
      responseKind: "bounded_evidence_summary",
      schemaVersion: BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
      summary: {
        audit: audit("bounded_evidence_summary", { citationCount: 1 }),
        citations: [sourceCitation()],
        claims: [
          {
            acceptedDerivedRefIds: [],
            citationIds: ["anchor:1"],
            claimId: "claim:1",
            generatedAdvice: false,
            positiveClaim: true,
            selectedEvidenceOnly: true,
            sourceAnchorIds: ["anchor:1"],
            text: "Selected evidence is cited.",
          },
        ],
        companyKey,
        freshness: freshness("fresh"),
        limitations: [limitation("not_source_truth")],
        noAutonomousAction: true,
        noGeneratedAdvice: true,
        normalizedQuery: "what evidence supports cash posture?",
        permittedNextActions: [humanReviewAction()],
        schemaVersion: BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
        selectedEvidenceIds: ["evidence-card:1"],
        selectedEvidenceOnly: true,
        sourceExcerptPolicy: {
          bounded: true,
          cited: true,
          fullFileDumpsReturned: false,
          redacted: true,
        },
        summaryText: "Selected evidence is cited.",
      },
      toolPlan: null,
    });
    const missingCitations = LlmOutputSchema.safeParse({
      ...output,
      citations: [],
    });

    expect(output.summary?.selectedEvidenceOnly).toBe(true);
    expect(missingCitations.success).toBe(false);
  });

  it("defines deterministic grade schemas", () => {
    expect(
      EvidenceFaithfulnessGradeSchema.parse({
        checkedClaimCount: 1,
        companyKey,
        deterministic: true,
        gradeName: "EvidenceFaithfulnessGrade",
        passed: true,
        schemaVersion: BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
        selectedCitationIds: ["anchor:1"],
        summary: "Claims cite selected evidence.",
        supportedClaimIds: ["claim:1"],
        unsupportedClaimIds: [],
      }).passed,
    ).toBe(true);
    expect(
      MissingCitationGradeSchema.parse({
        checkedClaimCount: 1,
        companyKey,
        deterministic: true,
        gradeName: "MissingCitationGrade",
        missingCitationClaimIds: ["claim:missing"],
        passed: true,
        refusalTriggered: true,
        schemaVersion: BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
        summary: "Missing citation refused.",
      }).refusalTriggered,
    ).toBe(true);
    expect(
      UnsafeActionRefusalGradeSchema.parse({
        companyKey,
        deterministic: true,
        gradeName: "UnsafeActionRefusalGrade",
        passed: true,
        readOnlyToolPlanEmitted: false,
        refusalTriggered: true,
        requestedActions: ["send_report"],
        schemaVersion: BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
        summary: "Unsafe action refused.",
      }).readOnlyToolPlanEmitted,
    ).toBe(false);
  });
});

function freshness(state: "fresh" | "missing") {
  return {
    checkedAt,
    compiledAt: state === "fresh" ? checkedAt : null,
    extractedAt: state === "fresh" ? checkedAt : null,
    sourceCapturedAt: state === "fresh" ? checkedAt : null,
    state,
    summary: `${state} proof posture.`,
  };
}

function limitation(code: "not_source_truth") {
  return {
    affectedAnchorIds: [],
    affectedSourceIds: [],
    code,
    severity: "blocking" as const,
    summary: "V2E is not a source truth layer.",
  };
}

function humanReviewAction() {
  return {
    action: "request_human_review" as const,
    label: "Request human review.",
    targetId: companyKey,
  };
}

function citationRequirement() {
  return {
    acceptedCitationTypes: ["source_anchor" as const],
    claimKind: "positive_claim" as const,
    positiveClaimRequiresCitation: true,
    requirementId: "citation:positive-claim",
    sourceAnchorOrAcceptedDerivedRefRequired: true,
    summary: "Positive claims require citations.",
  };
}

function sourceCitation() {
  return {
    checksumSha256: "a".repeat(64),
    citationType: "source_anchor" as const,
    id: "anchor:1",
    locator: "lines:1-2",
    sourceAnchorId: "anchor:1",
    sourceId: "11111111-1111-4111-8111-111111111111",
    sourceSnapshotId: "22222222-2222-4222-8222-222222222222",
    summary: "Source anchor citation.",
  };
}

function audit(
  responseKind:
    | "bounded_evidence_summary"
    | "evidence_tool_plan"
    | "missing_citation_refusal"
    | "unsafe_action_refusal",
  overrides: Partial<{
    citationCount: number;
    selectedArtifactIds: string[];
    sourceAnchorIds: string[];
  }> = {},
) {
  return {
    citationCount: overrides.citationCount ?? 0,
    companyKey,
    forbiddenActionRequested: null,
    forbiddenActionsBlocked: [],
    id: `audit:${responseKind}`,
    localProofOnly: true,
    noModelCalls: true,
    noOpenAiApiCalls: true,
    noRuntimePersistence: true,
    normalizedQuery: "what evidence supports cash posture?",
    outputSchemaValid: true,
    plannedToolNames: [...BOUNDED_LLM_READ_ONLY_TOOL_ALLOWLIST],
    redactionCount: 0,
    refusalReason: null,
    responseKind,
    selectedArtifactIds: overrides.selectedArtifactIds ?? [],
    sourceAnchorIds: overrides.sourceAnchorIds ?? [],
    timestamp: checkedAt,
  };
}

function toolResponse() {
  return {
    appMode: "local_proof",
    audit: {
      appMode: "local_proof",
      artifactIds: ["evidence-card:1"],
      companyKey,
      excerptCharacterCount: 0,
      forbiddenRequestBlocked: false,
      id: "audit:v2c",
      normalizedQuery: "cash",
      redactionCount: 0,
      sourceAnchorIds: ["anchor:1"],
      timestamp: checkedAt,
      toolName: "search_evidence",
      unsupportedReason: null,
    },
    capabilityBoundaries: [],
    citations: [sourceCitation()],
    companyKey,
    evidence: [sourceCitation()],
    forbiddenActions: ["write_finance_twin_fact", "take_autonomous_action"],
    freshness: freshness("fresh"),
    limitations: [],
    ok: true,
    permittedNextActions: [humanReviewAction()],
    redactions: [],
    result: [],
    schemaVersion: "v2c.evidence-tool.v1",
    toolName: "search_evidence",
    unsupportedReason: null,
  };
}
