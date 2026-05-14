import type { McpToolName } from "./read-only-app-mcp-boundaries";

export const EVIDENCE_TOOL_DISPATCH_SCHEMA_VERSION =
  "v2ab.read-only-app-mcp-evidence-tool-dispatch.v1";

export const FP0108_EVIDENCE_TOOL_DISPATCH_PLAN_PATH =
  "plans/FP-0108-read-only-chatgpt-app-mcp-read-only-evidence-tool-dispatch-contracts.md";

export const FP0109_EVIDENCE_DISPATCH_ADAPTER_PLAN_PATH =
  "plans/FP-0109-read-only-chatgpt-app-mcp-read-only-evidence-tool-dispatch-adapter-implementation.md";

export const FP0110_DEFAULT_LOCAL_EVIDENCE_DISPATCH_ENABLEMENT_PLAN_PATH =
  "plans/FP-0110-read-only-chatgpt-app-mcp-default-local-evidence-dispatch-enablement-master-plan.md";

export const EVIDENCE_TOOL_DISPATCH_RESPONSE_REQUIRED_FIELDS = [
  "structuredContent",
  "evidence",
  "sourceAnchors",
  "freshness",
  "limitations",
  "permittedNextActions",
  "refusalReason",
  "capabilityBoundary",
] as const;

export const EVIDENCE_TOOL_DISPATCH_ARGUMENT_FIELDS_BY_TOOL = {
  fetch_capability_boundaries: ["companyKey"],
  fetch_company_posture: ["companyKey", "periodKey"],
  fetch_document_map: ["companyKey", "documentMapId"],
  fetch_evidence_card: ["companyKey", "evidenceCardId"],
  fetch_source_anchor: ["companyKey", "sourceAnchorId"],
  fetch_source_coverage: ["companyKey", "sourceId"],
  search_evidence: ["companyKey", "query", "limit"],
} as const satisfies Record<McpToolName, readonly string[]>;

export const EVIDENCE_TOOL_DISPATCH_REQUIRED_ARGUMENTS_BY_TOOL = {
  fetch_capability_boundaries: ["companyKey"],
  fetch_company_posture: ["companyKey"],
  fetch_document_map: ["companyKey", "documentMapId"],
  fetch_evidence_card: ["companyKey", "evidenceCardId"],
  fetch_source_anchor: ["companyKey", "sourceAnchorId"],
  fetch_source_coverage: ["companyKey", "sourceId"],
  search_evidence: ["companyKey", "query"],
} as const satisfies Record<McpToolName, readonly string[]>;

export const EVIDENCE_TOOL_DISPATCH_OPTIONAL_ARGUMENTS_BY_TOOL = {
  fetch_capability_boundaries: [],
  fetch_company_posture: ["periodKey"],
  fetch_document_map: [],
  fetch_evidence_card: [],
  fetch_source_anchor: [],
  fetch_source_coverage: [],
  search_evidence: ["limit"],
} as const satisfies Record<McpToolName, readonly string[]>;

export const EVIDENCE_TOOL_DISPATCH_SERVICE_BY_TOOL = {
  fetch_capability_boundaries:
    "ReadOnlyEvidenceToolService.fetchCapabilityBoundaries",
  fetch_company_posture: "ReadOnlyEvidenceToolService.fetchCompanyPosture",
  fetch_document_map: "ReadOnlyEvidenceToolService.fetchDocumentMap",
  fetch_evidence_card: "ReadOnlyEvidenceToolService.fetchEvidenceCard",
  fetch_source_anchor: "ReadOnlyEvidenceToolService.fetchSourceAnchor",
  fetch_source_coverage: "ReadOnlyEvidenceToolService.fetchSourceCoverage",
  search_evidence: "ReadOnlyEvidenceToolService.searchEvidence",
} as const satisfies Record<McpToolName, string>;

export const EVIDENCE_TOOL_DISPATCH_SERVICE_LANES = [
  "evidence_index_artifacts",
  "source_registry_authority",
  "finance_twin_read_models",
  "cfo_wiki_compiled_read_models",
  "mission_answer_refs",
  "proof_bundle_refs",
] as const;

export const EVIDENCE_TOOL_DISPATCH_SERVICE_LANES_BY_TOOL = {
  fetch_capability_boundaries: ["evidence_index_artifacts"],
  fetch_company_posture: [
    "evidence_index_artifacts",
    "source_registry_authority",
    "finance_twin_read_models",
    "cfo_wiki_compiled_read_models",
    "mission_answer_refs",
    "proof_bundle_refs",
  ],
  fetch_document_map: ["evidence_index_artifacts", "source_registry_authority"],
  fetch_evidence_card: [
    "evidence_index_artifacts",
    "source_registry_authority",
  ],
  fetch_source_anchor: [
    "evidence_index_artifacts",
    "source_registry_authority",
  ],
  fetch_source_coverage: [
    "evidence_index_artifacts",
    "source_registry_authority",
  ],
  search_evidence: ["evidence_index_artifacts", "source_registry_authority"],
} as const satisfies Record<
  McpToolName,
  readonly (typeof EVIDENCE_TOOL_DISPATCH_SERVICE_LANES)[number][]
>;

export const EVIDENCE_TOOL_DISPATCH_REFUSAL_REASONS = [
  "missing_evidence",
  "missing_citation",
  "unsupported_evidence",
  "stale_evidence",
  "conflicting_evidence",
  "company_key_mismatch",
  "unsupported_argument",
  "prompt_injection",
  "raw_full_file_dump_request",
  "generated_finance_advice",
  "source_mutation",
  "finance_write",
  "provider_call",
  "external_communication",
  "openai_api_model_call",
  "autonomous_action",
  "dispatch_runtime_absent",
] as const;
