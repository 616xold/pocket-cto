import { z } from "zod";
import {
  EvidenceIndexFreshnessPostureSchema,
  EvidenceIndexLimitationPostureSchema,
  PermittedNextActionSchema,
} from "./evidence-index-common";
import { FinanceCompanyKeySchema } from "./finance-twin";
import {
  BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
  BoundedLlmAuditEventSchema,
  BoundedLlmForbiddenActionSchema,
  CitationRequirementSchema,
} from "./bounded-llm-common";

const RefusalBaseSchema = z.object({
  schemaVersion: z.literal(BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION),
  companyKey: FinanceCompanyKeySchema,
  normalizedQuery: z.string().min(1),
  refusalReason: z.string().min(1),
  freshness: EvidenceIndexFreshnessPostureSchema,
  limitations: z.array(EvidenceIndexLimitationPostureSchema).min(1),
  permittedNextActions: z.array(PermittedNextActionSchema).min(1),
  forbiddenActions: z.array(BoundedLlmForbiddenActionSchema).min(1),
  audit: BoundedLlmAuditEventSchema,
});

export const MissingCitationRefusalSchema = RefusalBaseSchema.extend({
  refusalType: z.literal("missing_citation_refusal"),
  missingClaimIds: z.array(z.string().min(1)).min(1),
  requiredCitations: z.array(CitationRequirementSchema).min(1),
});

export const UnsupportedEvidenceReasonSchema = z.enum([
  "missing",
  "stale",
  "unsupported",
  "failed",
  "conflicting",
  "outside_tool_coverage",
  "source_not_indexed",
  "no_selected_evidence",
]);

export const UnsupportedEvidenceRefusalSchema = RefusalBaseSchema.extend({
  refusalType: z.literal("unsupported_evidence_refusal"),
  unsupportedEvidenceReasons: z.array(UnsupportedEvidenceReasonSchema).min(1),
  unsupportedArtifactIds: z.array(z.string().min(1)),
});

export const UnsafeActionRefusalSchema = RefusalBaseSchema.extend({
  refusalType: z.literal("unsafe_action_refusal"),
  requestedActions: z.array(BoundedLlmForbiddenActionSchema).min(1),
  readOnlyToolPlanEmitted: z.literal(false),
});

export const BoundedLlmRefusalSchema = z.union([
  MissingCitationRefusalSchema,
  UnsupportedEvidenceRefusalSchema,
  UnsafeActionRefusalSchema,
]);

export type MissingCitationRefusal = z.infer<
  typeof MissingCitationRefusalSchema
>;
export type UnsupportedEvidenceRefusal = z.infer<
  typeof UnsupportedEvidenceRefusalSchema
>;
export type UnsafeActionRefusal = z.infer<typeof UnsafeActionRefusalSchema>;
export type BoundedLlmRefusal = z.infer<typeof BoundedLlmRefusalSchema>;
