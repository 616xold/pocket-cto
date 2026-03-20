import { z } from "zod";
import {
  TwinBlastRadiusLimitationSchema,
  TwinBlastRadiusQuestionKindSchema,
  TwinBlastRadiusRelatedMappedCiJobSchema,
  TwinBlastRadiusRelatedTestSuiteSchema,
  TwinBlastRadiusTargetOwnersSchema,
  TwinRepositoryBlastRadiusFreshnessBlockSchema,
  TwinBlastRadiusImpactedDirectorySchema,
  TwinBlastRadiusImpactedManifestSchema,
  TwinRepositoryFreshnessRollupSchema,
} from "./twin";

export const DiscoveryMissionQuestionSchema = z
  .object({
    repoFullName: z.string().min(1),
    questionKind: TwinBlastRadiusQuestionKindSchema,
    changedPaths: z.array(z.string().min(1)).min(1),
  })
  .strict();

export const CreateDiscoveryMissionInputSchema = DiscoveryMissionQuestionSchema.extend(
  {
    requestedBy: z.string().default("operator"),
  },
).strict();

export const DiscoveryAnswerArtifactMetadataSchema = z
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

export const DiscoveryAnswerSummarySchema = z
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

export type DiscoveryMissionQuestion = z.infer<
  typeof DiscoveryMissionQuestionSchema
>;
export type CreateDiscoveryMissionInput = z.infer<
  typeof CreateDiscoveryMissionInputSchema
>;
export type DiscoveryAnswerArtifactMetadata = z.infer<
  typeof DiscoveryAnswerArtifactMetadataSchema
>;
export type DiscoveryAnswerSummary = z.infer<
  typeof DiscoveryAnswerSummarySchema
>;
