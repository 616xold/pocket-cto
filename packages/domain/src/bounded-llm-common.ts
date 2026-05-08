import { z } from "zod";
import { FinanceCompanyKeySchema } from "./finance-twin";
import {
  EvidenceIndexIdSchema,
  EvidenceIndexLimitationPostureSchema,
  PermittedNextActionSchema,
} from "./evidence-index-common";
import {
  EvidenceToolCitationSchema,
  EvidenceToolNameSchema,
} from "./evidence-tool-common";

export const BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION =
  "v2e.bounded-llm-orchestration.v1";

export const BOUNDED_LLM_READ_ONLY_TOOL_ALLOWLIST = [
  "search_evidence",
  "fetch_evidence_card",
  "fetch_source_anchor",
  "fetch_document_map",
  "fetch_source_coverage",
  "fetch_company_posture",
  "fetch_capability_boundaries",
] as const;

export const BoundedLlmToolNameSchema = z.enum(
  BOUNDED_LLM_READ_ONLY_TOOL_ALLOWLIST,
);

export const BoundedLlmForbiddenActionSchema = z.enum([
  "create",
  "update",
  "delete",
  "create_mission",
  "upload_source",
  "sync_source",
  "mutate_source",
  "update_ledger",
  "write_finance_twin_fact",
  "write_accounting_record",
  "write_bank_record",
  "send_report",
  "release_report",
  "circulate_report",
  "approve_report",
  "certify_close",
  "mark_close_complete",
  "sign_off",
  "attest",
  "assure",
  "provider_connect",
  "provider_call",
  "provider_job",
  "create_provider_job",
  "contact_customer",
  "contact_vendor",
  "issue_payment_instruction",
  "collect_payment",
  "pay",
  "move_money",
  "file_tax",
  "give_legal_advice",
  "give_audit_opinion",
  "generate_finance_advice",
  "generate_external_communication",
  "release_external_communication",
  "use_runtime_codex_as_finance_output",
  "run_ocr",
  "run_vector_search",
  "use_openai_file_search",
  "use_page_index",
  "take_autonomous_action",
  "deploy_public_app",
]);

export const BoundedLlmResponseKindSchema = z.enum([
  "evidence_tool_plan",
  "bounded_evidence_summary",
  "missing_citation_refusal",
  "unsupported_evidence_refusal",
  "unsafe_action_refusal",
]);

export const BoundedLlmQuerySchema = z.object({
  originalText: z.string().min(1),
  normalizedText: z.string().min(1),
});

export const CitationRequirementSchema = z.object({
  requirementId: z.string().min(1),
  claimKind: z.enum(["positive_claim", "limitation", "refusal_boundary"]),
  acceptedCitationTypes: z
    .array(EvidenceToolCitationSchema.shape.citationType)
    .min(1),
  positiveClaimRequiresCitation: z.literal(true),
  sourceAnchorOrAcceptedDerivedRefRequired: z.literal(true),
  summary: z.string().min(1),
});

export const BoundedLlmAuditEventSchema = z.object({
  id: z.string().min(1),
  timestamp: z.string().datetime({ offset: true }),
  companyKey: FinanceCompanyKeySchema,
  normalizedQuery: z.string().min(1),
  responseKind: BoundedLlmResponseKindSchema,
  localProofOnly: z.literal(true),
  noOpenAiApiCalls: z.literal(true),
  noModelCalls: z.literal(true),
  noRuntimePersistence: z.literal(true),
  plannedToolNames: z.array(EvidenceToolNameSchema),
  selectedArtifactIds: z.array(z.string().min(1)),
  sourceAnchorIds: z.array(EvidenceIndexIdSchema),
  citationCount: z.number().int().nonnegative(),
  redactionCount: z.number().int().nonnegative(),
  refusalReason: z.string().min(1).nullable(),
  forbiddenActionRequested: z.string().min(1).nullable(),
  forbiddenActionsBlocked: z.array(BoundedLlmForbiddenActionSchema),
  outputSchemaValid: z.boolean(),
});

export const BoundedLlmRequiredPostureSchema = z.object({
  citations: z.array(CitationRequirementSchema).min(1),
  limitations: z.array(EvidenceIndexLimitationPostureSchema).min(1),
  permittedNextActions: z.array(PermittedNextActionSchema).min(1),
  forbiddenActions: z.array(BoundedLlmForbiddenActionSchema).min(1),
  audit: BoundedLlmAuditEventSchema,
});

export type BoundedLlmToolName = z.infer<typeof BoundedLlmToolNameSchema>;
export type BoundedLlmForbiddenAction = z.infer<
  typeof BoundedLlmForbiddenActionSchema
>;
export type BoundedLlmResponseKind = z.infer<
  typeof BoundedLlmResponseKindSchema
>;
export type BoundedLlmQuery = z.infer<typeof BoundedLlmQuerySchema>;
export type CitationRequirement = z.infer<typeof CitationRequirementSchema>;
export type BoundedLlmAuditEvent = z.infer<
  typeof BoundedLlmAuditEventSchema
>;
