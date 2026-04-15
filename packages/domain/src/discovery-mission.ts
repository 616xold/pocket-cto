import { z } from "zod";
import { CfoWikiPageKeySchema } from "./cfo-wiki";
import { FinanceCompanyKeySchema } from "./finance-twin";
import {
  TwinBlastRadiusImpactedDirectorySchema,
  TwinBlastRadiusImpactedManifestSchema,
  TwinBlastRadiusLimitationSchema,
  TwinBlastRadiusQuestionKindSchema,
  TwinBlastRadiusRelatedMappedCiJobSchema,
  TwinBlastRadiusRelatedTestSuiteSchema,
  TwinBlastRadiusTargetOwnersSchema,
  TwinRepositoryBlastRadiusFreshnessBlockSchema,
  TwinRepositoryFreshnessRollupSchema,
} from "./twin";

export const FINANCE_DISCOVERY_QUESTION_KINDS = [
  "cash_posture",
  "collections_pressure",
  "payables_pressure",
  "spend_posture",
  "obligation_calendar_review",
  "policy_lookup",
] as const;

export const FINANCE_DISCOVERY_STORED_STATE_QUESTION_KINDS = [
  "cash_posture",
  "collections_pressure",
  "payables_pressure",
  "spend_posture",
  "obligation_calendar_review",
] as const;

export const FINANCE_DISCOVERY_QUESTION_KIND_LABELS = {
  policy_lookup: "Policy lookup",
  cash_posture: "Cash posture",
  collections_pressure: "Collections pressure",
  payables_pressure: "Payables pressure",
  spend_posture: "Spend posture",
  obligation_calendar_review: "Obligation calendar review",
} satisfies Record<(typeof FINANCE_DISCOVERY_QUESTION_KINDS)[number], string>;

const FRESHNESS_LABELS = {
  failed: "Failed",
  fresh: "Fresh",
  missing: "Missing",
  mixed: "Mixed",
  never_synced: "Never synced",
  pending_answer: "Pending answer",
  stale: "Stale",
} as const;

export const FinanceDiscoveryQuestionKindSchema = z.enum(
  FINANCE_DISCOVERY_QUESTION_KINDS,
);
export const FinanceDiscoveryStoredStateQuestionKindSchema = z.enum(
  FINANCE_DISCOVERY_STORED_STATE_QUESTION_KINDS,
);
export const LegacyDiscoveryQuestionKindSchema =
  TwinBlastRadiusQuestionKindSchema;
export const DiscoveryQuestionKindSchema = z.union([
  FinanceDiscoveryQuestionKindSchema,
  LegacyDiscoveryQuestionKindSchema,
]);

export const LegacyDiscoveryMissionQuestionSchema = z
  .object({
    repoFullName: z.string().min(1),
    questionKind: TwinBlastRadiusQuestionKindSchema,
    changedPaths: z.array(z.string().min(1)).min(1),
  })
  .strict();

const FinanceDiscoveryQuestionBaseShape = {
  companyKey: FinanceCompanyKeySchema,
  operatorPrompt: z.string().trim().min(1).nullable().optional(),
} as const;

export const FinanceStoredStateDiscoveryQuestionSchema = z
  .object({
    ...FinanceDiscoveryQuestionBaseShape,
    questionKind: FinanceDiscoveryStoredStateQuestionKindSchema,
  })
  .strict();

export const FinancePolicyLookupQuestionSchema = z
  .object({
    ...FinanceDiscoveryQuestionBaseShape,
    questionKind: z.literal("policy_lookup"),
    policySourceId: z.string().uuid(),
  })
  .strict();

export const FinanceDiscoveryQuestionSchema = z.union([
  FinanceStoredStateDiscoveryQuestionSchema,
  FinancePolicyLookupQuestionSchema,
]);

export const CreateFinanceStoredStateDiscoveryMissionInputSchema =
  FinanceStoredStateDiscoveryQuestionSchema.extend({
    requestedBy: z.string().default("operator"),
  }).strict();

export const CreateFinancePolicyLookupMissionInputSchema =
  FinancePolicyLookupQuestionSchema.extend({
    requestedBy: z.string().default("operator"),
  }).strict();

export const CreateFinanceDiscoveryMissionInputSchema = z.union([
  CreateFinanceStoredStateDiscoveryMissionInputSchema,
  CreateFinancePolicyLookupMissionInputSchema,
]);

export const FinanceDiscoveryFreshnessStateSchema = z.enum([
  "fresh",
  "stale",
  "missing",
  "mixed",
  "failed",
]);

export const FinanceDiscoveryFreshnessPostureSchema = z
  .object({
    state: FinanceDiscoveryFreshnessStateSchema,
    reasonSummary: z.string().min(1),
  })
  .strict();

export const FinanceDiscoveryRelatedRouteSchema = z
  .object({
    label: z.string().min(1),
    routePath: z.string().min(1),
  })
  .strict();

export const FinanceDiscoveryRelatedWikiPageSchema = z
  .object({
    pageKey: CfoWikiPageKeySchema,
    title: z.string().min(1),
  })
  .strict();

export const FinanceDiscoveryEvidenceSectionSchema = z
  .object({
    key: z.string().min(1),
    title: z.string().min(1),
    summary: z.string().min(1),
    routePath: z.string().min(1).optional(),
    pageKey: CfoWikiPageKeySchema.optional(),
  })
  .strict();

const FinanceDiscoveryAnswerArtifactMetadataBaseSchema = z.object({
  source: z.literal("stored_finance_twin_and_cfo_wiki"),
  summary: z.string().min(1),
  companyKey: FinanceCompanyKeySchema,
  answerSummary: z.string().min(1),
  freshnessPosture: FinanceDiscoveryFreshnessPostureSchema,
  limitations: z.array(z.string().min(1)),
  relatedRoutes: z.array(FinanceDiscoveryRelatedRouteSchema),
  relatedWikiPages: z.array(FinanceDiscoveryRelatedWikiPageSchema),
  evidenceSections: z.array(FinanceDiscoveryEvidenceSectionSchema),
  bodyMarkdown: z.string().min(1),
  structuredData: z.record(z.string(), z.unknown()).default({}),
});

export const FinanceStoredStateDiscoveryAnswerArtifactMetadataSchema =
  FinanceDiscoveryAnswerArtifactMetadataBaseSchema.extend({
    questionKind: FinanceDiscoveryStoredStateQuestionKindSchema,
    policySourceId: z.null().default(null),
  }).strict();

export const FinancePolicyLookupAnswerArtifactMetadataSchema =
  FinanceDiscoveryAnswerArtifactMetadataBaseSchema.extend({
    questionKind: z.literal("policy_lookup"),
    policySourceId: z.string().uuid(),
  }).strict();

export const FinanceDiscoveryAnswerArtifactMetadataSchema = z.union([
  FinanceStoredStateDiscoveryAnswerArtifactMetadataSchema,
  FinancePolicyLookupAnswerArtifactMetadataSchema,
]);

export const LegacyDiscoveryAnswerArtifactMetadataSchema = z
  .object({
    source: z.literal("stored_twin_blast_radius_query"),
    summary: z.string().min(1),
    repoFullName: z.string().min(1),
    questionKind: TwinBlastRadiusQuestionKindSchema,
    changedPaths: z.array(z.string().min(1)).min(1),
    answerSummary: z.string().min(1),
    impactedDirectories: z.array(TwinBlastRadiusImpactedDirectorySchema),
    impactedManifests: z.array(TwinBlastRadiusImpactedManifestSchema),
    ownersByTarget: z.array(TwinBlastRadiusTargetOwnersSchema),
    relatedTestSuites: z.array(TwinBlastRadiusRelatedTestSuiteSchema),
    relatedMappedCiJobs: z.array(TwinBlastRadiusRelatedMappedCiJobSchema),
    freshness: TwinRepositoryBlastRadiusFreshnessBlockSchema,
    freshnessRollup: TwinRepositoryFreshnessRollupSchema,
    limitations: z.array(TwinBlastRadiusLimitationSchema),
  })
  .strict();

export const FinanceDiscoveryAnswerSummarySchema = z
  .object({
    companyKey: FinanceCompanyKeySchema,
    questionKind: FinanceDiscoveryQuestionKindSchema,
    policySourceId: z.string().uuid().nullable().default(null),
    answerSummary: z.string().min(1),
    freshnessState: FinanceDiscoveryFreshnessStateSchema,
    limitationCount: z.number().int().nonnegative(),
    relatedRouteCount: z.number().int().nonnegative(),
    relatedWikiPageCount: z.number().int().nonnegative(),
    evidenceSectionCount: z.number().int().nonnegative(),
  })
  .strict();

export const LegacyDiscoveryAnswerSummarySchema = z
  .object({
    repoFullName: z.string().min(1),
    questionKind: TwinBlastRadiusQuestionKindSchema,
    changedPaths: z.array(z.string().min(1)),
    answerSummary: z.string().min(1),
    impactedDirectoryCount: z.number().int().nonnegative(),
    impactedManifestCount: z.number().int().nonnegative(),
    relatedTestSuiteCount: z.number().int().nonnegative(),
    relatedMappedCiJobCount: z.number().int().nonnegative(),
    freshnessRollup: TwinRepositoryFreshnessRollupSchema,
    limitationCount: z.number().int().nonnegative(),
  })
  .strict();

export const DiscoveryMissionQuestionSchema = z.union([
  FinanceDiscoveryQuestionSchema,
  LegacyDiscoveryMissionQuestionSchema,
]);
export const CreateDiscoveryMissionInputSchema =
  CreateFinanceDiscoveryMissionInputSchema;
export const DiscoveryAnswerArtifactMetadataSchema = z.union([
  FinanceDiscoveryAnswerArtifactMetadataSchema,
  LegacyDiscoveryAnswerArtifactMetadataSchema,
]);
export const DiscoveryAnswerSummarySchema = z.union([
  FinanceDiscoveryAnswerSummarySchema,
  LegacyDiscoveryAnswerSummarySchema,
]);

export type FinanceDiscoveryQuestion = z.infer<
  typeof FinanceDiscoveryQuestionSchema
>;
export type FinanceDiscoveryQuestionKind = z.infer<
  typeof FinanceDiscoveryQuestionKindSchema
>;
export type FinanceDiscoveryStoredStateQuestionKind = z.infer<
  typeof FinanceDiscoveryStoredStateQuestionKindSchema
>;
export type FinanceStoredStateDiscoveryQuestion = z.infer<
  typeof FinanceStoredStateDiscoveryQuestionSchema
>;
export type FinancePolicyLookupQuestion = z.infer<
  typeof FinancePolicyLookupQuestionSchema
>;
export type LegacyDiscoveryMissionQuestion = z.infer<
  typeof LegacyDiscoveryMissionQuestionSchema
>;
export type DiscoveryMissionQuestion =
  | FinanceDiscoveryQuestion
  | LegacyDiscoveryMissionQuestion;
export type CreateFinanceDiscoveryMissionInput = z.infer<
  typeof CreateFinanceDiscoveryMissionInputSchema
>;
export type CreateDiscoveryMissionInput = CreateFinanceDiscoveryMissionInput;
export type FinanceDiscoveryFreshnessState = z.infer<
  typeof FinanceDiscoveryFreshnessStateSchema
>;
export type FinanceDiscoveryFreshnessPosture = z.infer<
  typeof FinanceDiscoveryFreshnessPostureSchema
>;
export type FinanceDiscoveryRelatedRoute = z.infer<
  typeof FinanceDiscoveryRelatedRouteSchema
>;
export type FinanceDiscoveryRelatedWikiPage = z.infer<
  typeof FinanceDiscoveryRelatedWikiPageSchema
>;
export type FinanceDiscoveryEvidenceSection = z.infer<
  typeof FinanceDiscoveryEvidenceSectionSchema
>;
export type FinanceDiscoveryAnswerArtifactMetadata = z.infer<
  typeof FinanceDiscoveryAnswerArtifactMetadataSchema
>;
export type LegacyDiscoveryAnswerArtifactMetadata = z.infer<
  typeof LegacyDiscoveryAnswerArtifactMetadataSchema
>;
export type DiscoveryAnswerArtifactMetadata =
  | FinanceDiscoveryAnswerArtifactMetadata
  | LegacyDiscoveryAnswerArtifactMetadata;
export type FinanceDiscoveryAnswerSummary = z.infer<
  typeof FinanceDiscoveryAnswerSummarySchema
>;
export type LegacyDiscoveryAnswerSummary = z.infer<
  typeof LegacyDiscoveryAnswerSummarySchema
>;
export type DiscoveryAnswerSummary =
  | FinanceDiscoveryAnswerSummary
  | LegacyDiscoveryAnswerSummary;

export function isFinanceDiscoveryQuestionKind(
  value: string | null | undefined,
): value is FinanceDiscoveryQuestionKind {
  return (
    typeof value === "string" &&
    FINANCE_DISCOVERY_QUESTION_KINDS.includes(
      value as FinanceDiscoveryQuestionKind,
    )
  );
}

export function isFinanceDiscoveryQuestion(
  question: DiscoveryMissionQuestion | null | undefined,
): question is FinanceDiscoveryQuestion {
  return (
    typeof question === "object" &&
    question !== null &&
    "companyKey" in question
  );
}

export function isFinancePolicyLookupQuestion(
  question: DiscoveryMissionQuestion | null | undefined,
): question is FinancePolicyLookupQuestion {
  return (
    isFinanceDiscoveryQuestion(question) &&
    question.questionKind === "policy_lookup"
  );
}

export function isFinanceDiscoveryAnswerArtifactMetadata(
  metadata: DiscoveryAnswerArtifactMetadata | null | undefined,
): metadata is FinanceDiscoveryAnswerArtifactMetadata {
  return metadata?.source === "stored_finance_twin_and_cfo_wiki";
}

export function readFinanceDiscoveryQuestionKindLabel(
  questionKind: FinanceDiscoveryQuestionKind,
) {
  return FINANCE_DISCOVERY_QUESTION_KIND_LABELS[questionKind];
}

export function readFreshnessLabel(state: string | null | undefined) {
  if (!state) {
    return "Not recorded yet.";
  }

  return (
    FRESHNESS_LABELS[state as keyof typeof FRESHNESS_LABELS] ??
    state
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}
