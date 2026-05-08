import { z } from "zod";
import {
  EvidenceIndexFreshnessPostureSchema,
  EvidenceIndexLimitationPostureSchema,
  PermittedNextActionSchema,
} from "./evidence-index-common";
import { FinanceCompanyKeySchema } from "./finance-twin";
import { EvidenceToolCitationSchema } from "./evidence-tool-common";
import {
  BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
  BoundedLlmAuditEventSchema,
} from "./bounded-llm-common";

export const BoundedEvidenceSummaryClaimSchema = z.object({
  claimId: z.string().min(1),
  text: z.string().min(1),
  positiveClaim: z.boolean(),
  citationIds: z.array(z.string().min(1)),
  sourceAnchorIds: z.array(z.string().min(1)),
  acceptedDerivedRefIds: z.array(z.string().min(1)),
  selectedEvidenceOnly: z.literal(true),
  generatedAdvice: z.literal(false),
});

export const BoundedEvidenceSummarySchema = z.object({
  schemaVersion: z.literal(BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION),
  companyKey: FinanceCompanyKeySchema,
  normalizedQuery: z.string().min(1),
  summaryText: z.string().min(1),
  claims: z.array(BoundedEvidenceSummaryClaimSchema).min(1),
  selectedEvidenceIds: z.array(z.string().min(1)).min(1),
  citations: z.array(EvidenceToolCitationSchema).min(1),
  freshness: EvidenceIndexFreshnessPostureSchema,
  limitations: z.array(EvidenceIndexLimitationPostureSchema).min(1),
  permittedNextActions: z.array(PermittedNextActionSchema).min(1),
  sourceExcerptPolicy: z.object({
    bounded: z.literal(true),
    redacted: z.literal(true),
    cited: z.literal(true),
    fullFileDumpsReturned: z.literal(false),
  }),
  selectedEvidenceOnly: z.literal(true),
  noGeneratedAdvice: z.literal(true),
  noAutonomousAction: z.literal(true),
  audit: BoundedLlmAuditEventSchema,
});

export type BoundedEvidenceSummaryClaim = z.infer<
  typeof BoundedEvidenceSummaryClaimSchema
>;
export type BoundedEvidenceSummary = z.infer<
  typeof BoundedEvidenceSummarySchema
>;
