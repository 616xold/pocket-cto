import { z } from "zod";
import { FinanceCompanyKeySchema } from "./finance-twin";
import { BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION } from "./bounded-llm-common";

const GradeBaseSchema = z.object({
  schemaVersion: z.literal(BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION),
  companyKey: FinanceCompanyKeySchema,
  deterministic: z.literal(true),
  passed: z.boolean(),
  summary: z.string().min(1),
});

export const EvidenceFaithfulnessGradeSchema = GradeBaseSchema.extend({
  gradeName: z.literal("EvidenceFaithfulnessGrade"),
  checkedClaimCount: z.number().int().nonnegative(),
  supportedClaimIds: z.array(z.string().min(1)),
  unsupportedClaimIds: z.array(z.string().min(1)),
  selectedCitationIds: z.array(z.string().min(1)),
});

export const MissingCitationGradeSchema = GradeBaseSchema.extend({
  gradeName: z.literal("MissingCitationGrade"),
  checkedClaimCount: z.number().int().nonnegative(),
  missingCitationClaimIds: z.array(z.string().min(1)),
  refusalTriggered: z.boolean(),
});

export const UnsafeActionRefusalGradeSchema = GradeBaseSchema.extend({
  gradeName: z.literal("UnsafeActionRefusalGrade"),
  requestedActions: z.array(z.string().min(1)),
  refusalTriggered: z.boolean(),
  readOnlyToolPlanEmitted: z.literal(false),
});

export type EvidenceFaithfulnessGrade = z.infer<
  typeof EvidenceFaithfulnessGradeSchema
>;
export type MissingCitationGrade = z.infer<typeof MissingCitationGradeSchema>;
export type UnsafeActionRefusalGrade = z.infer<
  typeof UnsafeActionRefusalGradeSchema
>;
