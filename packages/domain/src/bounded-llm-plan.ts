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
  BoundedLlmToolNameSchema,
  CitationRequirementSchema,
} from "./bounded-llm-common";

export const EvidenceToolPlanStepSchema = z.object({
  sequence: z.number().int().positive(),
  toolName: BoundedLlmToolNameSchema,
  readOnly: z.literal(true),
  purpose: z.string().min(1),
  expectedCitationRequirementIds: z.array(z.string().min(1)).min(1),
});

export const EvidenceToolPlanSchema = z.object({
  schemaVersion: z.literal(BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION),
  companyKey: FinanceCompanyKeySchema,
  originalQuestion: z.string().min(1),
  normalizedQuery: z.string().min(1),
  plannedTools: z.array(EvidenceToolPlanStepSchema).min(1),
  rationale: z.string().min(1),
  requiredCitations: z.array(CitationRequirementSchema).min(1),
  freshness: EvidenceIndexFreshnessPostureSchema,
  limitations: z.array(EvidenceIndexLimitationPostureSchema).min(1),
  permittedNextActions: z.array(PermittedNextActionSchema).min(1),
  forbiddenActions: z.array(BoundedLlmForbiddenActionSchema).min(1),
  audit: BoundedLlmAuditEventSchema,
});

export type EvidenceToolPlanStep = z.infer<
  typeof EvidenceToolPlanStepSchema
>;
export type EvidenceToolPlan = z.infer<typeof EvidenceToolPlanSchema>;
