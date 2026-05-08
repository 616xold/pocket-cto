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
  BoundedLlmQuerySchema,
  BoundedLlmResponseKindSchema,
  CitationRequirementSchema,
} from "./bounded-llm-common";
import { EvidenceToolPlanSchema } from "./bounded-llm-plan";
import { EvidenceSelectionResultSchema } from "./bounded-llm-selection";
import { BoundedEvidenceSummarySchema } from "./bounded-llm-summary";
import { BoundedLlmRefusalSchema } from "./bounded-llm-refusal";

export const LlmOutputSchema = z
  .object({
    schemaVersion: z.literal(BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION),
    companyKey: FinanceCompanyKeySchema,
    responseKind: BoundedLlmResponseKindSchema,
    query: BoundedLlmQuerySchema,
    toolPlan: EvidenceToolPlanSchema.nullable(),
    evidenceSelection: EvidenceSelectionResultSchema.nullable(),
    summary: BoundedEvidenceSummarySchema.nullable(),
    refusal: BoundedLlmRefusalSchema.nullable(),
    citations: z.array(CitationRequirementSchema).min(1),
    freshness: EvidenceIndexFreshnessPostureSchema,
    limitations: z.array(EvidenceIndexLimitationPostureSchema).min(1),
    permittedNextActions: z.array(PermittedNextActionSchema).min(1),
    forbiddenActions: z.array(BoundedLlmForbiddenActionSchema).min(1),
    audit: BoundedLlmAuditEventSchema,
  })
  .superRefine((output, ctx) => {
    if (output.responseKind === "evidence_tool_plan" && !output.toolPlan) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Evidence tool plan output requires toolPlan.",
        path: ["toolPlan"],
      });
    }

    if (output.responseKind === "bounded_evidence_summary") {
      if (!output.evidenceSelection) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Bounded summary requires evidenceSelection.",
          path: ["evidenceSelection"],
        });
      }
      if (!output.summary) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Bounded summary requires summary.",
          path: ["summary"],
        });
      }
    }

    if (output.responseKind.endsWith("_refusal") && !output.refusal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Refusal output requires refusal posture.",
        path: ["refusal"],
      });
    }

    for (const [index, claim] of output.summary?.claims.entries() ?? []) {
      const hasAcceptedRef =
        claim.sourceAnchorIds.length > 0 || claim.acceptedDerivedRefIds.length > 0;
      if (claim.positiveClaim && (!hasAcceptedRef || claim.citationIds.length === 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Positive summary claim requires SourceAnchor or accepted derived refs.",
          path: ["summary", "claims", index, "citationIds"],
        });
      }
    }
  });

export type LlmOutput = z.infer<typeof LlmOutputSchema>;
