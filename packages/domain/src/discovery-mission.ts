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
] as const;

export const FinanceDiscoveryQuestionKindSchema = z.enum(
  FINANCE_DISCOVERY_QUESTION_KINDS,
);
export const LegacyDiscoveryQuestionKindSchema = TwinBlastRadiusQuestionKindSchema;
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

export const FinanceDiscoveryQuestionSchema = z
  .object({
    companyKey: FinanceCompanyKeySchema,
    questionKind: FinanceDiscoveryQuestionKindSchema,
    operatorPrompt: z.string().trim().min(1).nullable().optional(),
  })
  .strict();

export const CreateFinanceDiscoveryMissionInputSchema =
  FinanceDiscoveryQuestionSchema.extend({
    requestedBy: z.string().default("operator"),
  }).strict();

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

export const FinanceDiscoveryAnswerArtifactMetadataSchema = z
  .object({
    source: z.literal("stored_finance_twin_and_cfo_wiki"),
    summary: z.string().min(1),
    companyKey: FinanceCompanyKeySchema,
    questionKind: FinanceDiscoveryQuestionKindSchema,
    answerSummary: z.string().min(1),
    freshnessPosture: FinanceDiscoveryFreshnessPostureSchema,
    limitations: z.array(z.string().min(1)),
    relatedRoutes: z.array(FinanceDiscoveryRelatedRouteSchema),
    relatedWikiPages: z.array(FinanceDiscoveryRelatedWikiPageSchema),
    evidenceSections: z.array(FinanceDiscoveryEvidenceSectionSchema),
    bodyMarkdown: z.string().min(1),
    structuredData: z.record(z.string(), z.unknown()).default({}),
  })
  .strict();

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
export const DiscoveryAnswerArtifactMetadataSchema =
  z.union([
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

export function isFinanceDiscoveryAnswerArtifactMetadata(
  metadata: DiscoveryAnswerArtifactMetadata | null | undefined,
): metadata is FinanceDiscoveryAnswerArtifactMetadata {
  return metadata?.source === "stored_finance_twin_and_cfo_wiki";
}
