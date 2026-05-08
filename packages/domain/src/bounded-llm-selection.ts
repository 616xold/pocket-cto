import { z } from "zod";
import {
  EvidenceIndexFreshnessPostureSchema,
  EvidenceIndexLimitationPostureSchema,
  PermittedNextActionSchema,
} from "./evidence-index-common";
import { FinanceCompanyKeySchema } from "./finance-twin";
import {
  EvidenceToolCitationSchema,
  EvidenceToolResponseSchema,
} from "./evidence-tool-common";
import { SafeSourceExcerptSchema } from "./evidence-tool-results";
import {
  BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
  BoundedLlmAuditEventSchema,
} from "./bounded-llm-common";

export const EvidenceSelectionResultSchema = z.object({
  schemaVersion: z.literal(BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION),
  companyKey: FinanceCompanyKeySchema,
  normalizedQuery: z.string().min(1),
  toolResponses: z.array(EvidenceToolResponseSchema).min(1),
  selectedEvidenceCardIds: z.array(z.string().min(1)),
  selectedSourceAnchorIds: z.array(z.string().min(1)),
  selectedDocumentMapIds: z.array(z.string().min(1)),
  selectedCoverageSourceIds: z.array(z.string().min(1)),
  selectedCitations: z.array(EvidenceToolCitationSchema).min(1),
  safeExcerpts: z.array(SafeSourceExcerptSchema),
  freshness: EvidenceIndexFreshnessPostureSchema,
  limitations: z.array(EvidenceIndexLimitationPostureSchema).min(1),
  permittedNextActions: z.array(PermittedNextActionSchema).min(1),
  unsupportedReasons: z.array(z.string().min(1)),
  conflictingEvidenceDetected: z.literal(false),
  selectedEvidenceOnly: z.literal(true),
  promptInjectionTextTreatedAsData: z.literal(true),
  fullFileDumpsReturned: z.literal(false),
  audit: BoundedLlmAuditEventSchema,
});

export type EvidenceSelectionResult = z.infer<
  typeof EvidenceSelectionResultSchema
>;
