import { z } from "zod";

export const TwinJsonObjectSchema = z.record(z.string(), z.unknown()).default({});

export const TwinRepositoryWriteReadinessFailureCodeSchema = z.enum([
  "inactive",
  "archived",
  "disabled",
  "installation_unavailable",
]);

export const TwinRepositoryWriteReadinessSchema = z.object({
  ready: z.boolean(),
  failureCode: TwinRepositoryWriteReadinessFailureCodeSchema.nullable(),
});

export const TwinRepositorySummarySchema = z.object({
  fullName: z.string().min(1),
  installationId: z.string().min(1),
  defaultBranch: z.string().min(1),
  archived: z.boolean().nullable(),
  disabled: z.boolean().nullable(),
  isActive: z.boolean(),
  writeReadiness: TwinRepositoryWriteReadinessSchema,
});

export const TwinSyncRunStatusSchema = z.enum([
  "running",
  "succeeded",
  "failed",
]);

export const TwinSyncRunSchema = z.object({
  id: z.string().uuid(),
  repoFullName: z.string().min(1),
  extractor: z.string().min(1),
  status: TwinSyncRunStatusSchema,
  startedAt: z.string().datetime({ offset: true }),
  completedAt: z.string().datetime({ offset: true }).nullable(),
  stats: TwinJsonObjectSchema,
  errorSummary: z.string().nullable(),
  createdAt: z.string().datetime({ offset: true }),
});

export const TwinEntitySchema = z.object({
  id: z.string().uuid(),
  repoFullName: z.string().min(1),
  kind: z.string().min(1),
  stableKey: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().nullable(),
  payload: TwinJsonObjectSchema,
  observedAt: z.string().datetime({ offset: true }),
  staleAfter: z.string().datetime({ offset: true }).nullable(),
  sourceRunId: z.string().uuid().nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const TwinEdgeSchema = z.object({
  id: z.string().uuid(),
  repoFullName: z.string().min(1),
  kind: z.string().min(1),
  fromEntityId: z.string().uuid(),
  toEntityId: z.string().uuid(),
  payload: TwinJsonObjectSchema,
  observedAt: z.string().datetime({ offset: true }),
  sourceRunId: z.string().uuid().nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const TwinEntityListViewSchema = z.object({
  repository: TwinRepositorySummarySchema,
  entityCount: z.number().int().nonnegative(),
  entities: z.array(TwinEntitySchema),
});

export const TwinEdgeListViewSchema = z.object({
  repository: TwinRepositorySummarySchema,
  edgeCount: z.number().int().nonnegative(),
  edges: z.array(TwinEdgeSchema),
});

export const TwinSyncRunListViewSchema = z.object({
  repository: TwinRepositorySummarySchema,
  runCount: z.number().int().nonnegative(),
  runs: z.array(TwinSyncRunSchema),
});

export const TwinKindCountMapSchema = z.record(
  z.string(),
  z.number().int().nonnegative(),
);

export const TwinRepositoryMetadataRepositorySchema = z.object({
  fullName: z.string().min(1),
  defaultBranch: z.string().min(1),
  visibility: z.enum(["private", "public"]).nullable(),
  archived: z.boolean().nullable(),
  disabled: z.boolean().nullable(),
  isActive: z.boolean(),
});

export const TwinRepositoryMetadataBranchSchema = z.object({
  name: z.string().min(1),
});

export const TwinRepositoryMetadataReadmeSchema = z.object({
  path: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  lineCount: z.number().int().nonnegative(),
});

export const TwinRepositoryMetadataManifestSchema = z.object({
  path: z.string().min(1),
  packageName: z.string().min(1).nullable(),
  private: z.boolean().nullable(),
  hasWorkspaces: z.boolean(),
  scriptNames: z.array(z.string()),
});

export const TwinRepositoryMetadataDirectorySchema = z.object({
  path: z.string().min(1),
  label: z.string().min(1),
  classification: z.string().min(1),
});

export const TwinCodeownersPrecedenceSlotSchema = z.enum([
  "github_dotgithub",
  "repository_root",
  "docs",
]);

export const TwinOwnershipPatternShapeSchema = z.enum([
  "directory_like",
  "file_like",
  "ambiguous",
]);

export const TwinOwnerPrincipalKindSchema = z.enum([
  "github_user_or_org",
  "github_team",
  "email",
  "unknown",
]);

export const TwinCodeownersFileSchema = z.object({
  path: z.string().min(1),
  precedenceSlot: TwinCodeownersPrecedenceSlotSchema,
  lineCount: z.number().int().nonnegative(),
  sizeBytes: z.number().int().nonnegative(),
  ruleCount: z.number().int().nonnegative(),
  ownerCount: z.number().int().nonnegative(),
});

export const TwinOwnershipRuleSchema = z.object({
  id: z.string().uuid(),
  sourceFilePath: z.string().min(1),
  ordinal: z.number().int().positive(),
  lineNumber: z.number().int().positive(),
  rawPattern: z.string().min(1),
  rawOwners: z.array(z.string().min(1)),
  normalizedOwners: z.array(z.string().min(1)),
  patternShape: TwinOwnershipPatternShapeSchema,
  observedAt: z.string().datetime({ offset: true }),
  sourceRunId: z.string().uuid().nullable(),
  updatedAt: z.string().datetime({ offset: true }),
});

export const TwinOwnerPrincipalSchema = z.object({
  id: z.string().uuid(),
  handle: z.string().min(1),
  principalKind: TwinOwnerPrincipalKindSchema,
  assignedRuleCount: z.number().int().nonnegative(),
  observedAt: z.string().datetime({ offset: true }),
  sourceRunId: z.string().uuid().nullable(),
  updatedAt: z.string().datetime({ offset: true }),
});

export const TwinRepositoryMetadataSummarySchema = z.object({
  repository: TwinRepositorySummarySchema,
  latestRun: TwinSyncRunSchema.nullable(),
  entityCount: z.number().int().nonnegative(),
  edgeCount: z.number().int().nonnegative(),
  entityCountsByKind: TwinKindCountMapSchema,
  edgeCountsByKind: TwinKindCountMapSchema,
  metadata: z.object({
    repository: TwinRepositoryMetadataRepositorySchema.nullable(),
    defaultBranch: TwinRepositoryMetadataBranchSchema.nullable(),
    rootReadme: TwinRepositoryMetadataReadmeSchema.nullable(),
    manifests: z.array(TwinRepositoryMetadataManifestSchema),
    directories: z.array(TwinRepositoryMetadataDirectorySchema),
  }),
});

export const TwinRepositoryMetadataSyncResultSchema = z.object({
  repository: TwinRepositorySummarySchema,
  syncRun: TwinSyncRunSchema,
  entityCount: z.number().int().nonnegative(),
  edgeCount: z.number().int().nonnegative(),
  entityCountsByKind: TwinKindCountMapSchema,
  edgeCountsByKind: TwinKindCountMapSchema,
});

export const TwinRepositoryOwnershipRulesViewSchema = z.object({
  repository: TwinRepositorySummarySchema,
  latestRun: TwinSyncRunSchema.nullable(),
  codeownersFile: TwinCodeownersFileSchema.nullable(),
  ruleCount: z.number().int().nonnegative(),
  ownerCount: z.number().int().nonnegative(),
  rules: z.array(TwinOwnershipRuleSchema),
});

export const TwinRepositoryOwnersViewSchema = z.object({
  repository: TwinRepositorySummarySchema,
  latestRun: TwinSyncRunSchema.nullable(),
  codeownersFile: TwinCodeownersFileSchema.nullable(),
  ownerCount: z.number().int().nonnegative(),
  owners: z.array(TwinOwnerPrincipalSchema),
});

export const TwinOwnershipSummaryStateSchema = z.enum([
  "not_synced",
  "no_codeowners_file",
  "effective_ownership_available",
]);

export const TwinOwnershipAppliedRuleSchema = z.object({
  sourceFilePath: z.string().min(1),
  ordinal: z.number().int().positive(),
  rawPattern: z.string().min(1),
  patternShape: TwinOwnershipPatternShapeSchema,
});

export const TwinOwnedDirectorySchema = TwinRepositoryMetadataDirectorySchema.extend({
  effectiveOwners: z.array(z.string().min(1)),
  appliedRule: TwinOwnershipAppliedRuleSchema,
});

export const TwinOwnedManifestSchema = TwinRepositoryMetadataManifestSchema.extend({
  effectiveOwners: z.array(z.string().min(1)),
  appliedRule: TwinOwnershipAppliedRuleSchema,
});

export const TwinRepositoryOwnershipSummaryCountsSchema = z.object({
  ruleCount: z.number().int().nonnegative(),
  ownerCount: z.number().int().nonnegative(),
  directoryCount: z.number().int().nonnegative(),
  manifestCount: z.number().int().nonnegative(),
  ownedDirectoryCount: z.number().int().nonnegative(),
  ownedManifestCount: z.number().int().nonnegative(),
  unownedDirectoryCount: z.number().int().nonnegative(),
  unownedManifestCount: z.number().int().nonnegative(),
});

export const TwinRepositoryOwnershipSummarySchema = z.object({
  repository: TwinRepositorySummarySchema,
  latestRun: TwinSyncRunSchema.nullable(),
  ownershipState: TwinOwnershipSummaryStateSchema,
  codeownersFile: TwinCodeownersFileSchema.nullable(),
  counts: TwinRepositoryOwnershipSummaryCountsSchema,
  ownedDirectories: z.array(TwinOwnedDirectorySchema),
  ownedManifests: z.array(TwinOwnedManifestSchema),
  unownedDirectories: z.array(TwinRepositoryMetadataDirectorySchema),
  unownedManifests: z.array(TwinRepositoryMetadataManifestSchema),
});

export const TwinRepositoryOwnershipSyncResultSchema = z.object({
  repository: TwinRepositorySummarySchema,
  syncRun: TwinSyncRunSchema,
  codeownersFilePath: z.string().min(1).nullable(),
  ruleCount: z.number().int().nonnegative(),
  ownerCount: z.number().int().nonnegative(),
  entityCount: z.number().int().nonnegative(),
  edgeCount: z.number().int().nonnegative(),
  entityCountsByKind: TwinKindCountMapSchema,
  edgeCountsByKind: TwinKindCountMapSchema,
});

export type TwinJsonObject = z.infer<typeof TwinJsonObjectSchema>;
export type TwinRepositoryWriteReadinessFailureCode = z.infer<
  typeof TwinRepositoryWriteReadinessFailureCodeSchema
>;
export type TwinRepositoryWriteReadiness = z.infer<
  typeof TwinRepositoryWriteReadinessSchema
>;
export type TwinRepositorySummary = z.infer<
  typeof TwinRepositorySummarySchema
>;
export type TwinSyncRunStatus = z.infer<typeof TwinSyncRunStatusSchema>;
export type TwinSyncRun = z.infer<typeof TwinSyncRunSchema>;
export type TwinEntity = z.infer<typeof TwinEntitySchema>;
export type TwinEdge = z.infer<typeof TwinEdgeSchema>;
export type TwinEntityListView = z.infer<typeof TwinEntityListViewSchema>;
export type TwinEdgeListView = z.infer<typeof TwinEdgeListViewSchema>;
export type TwinSyncRunListView = z.infer<typeof TwinSyncRunListViewSchema>;
export type TwinKindCountMap = z.infer<typeof TwinKindCountMapSchema>;
export type TwinRepositoryMetadataRepository = z.infer<
  typeof TwinRepositoryMetadataRepositorySchema
>;
export type TwinRepositoryMetadataBranch = z.infer<
  typeof TwinRepositoryMetadataBranchSchema
>;
export type TwinRepositoryMetadataReadme = z.infer<
  typeof TwinRepositoryMetadataReadmeSchema
>;
export type TwinRepositoryMetadataManifest = z.infer<
  typeof TwinRepositoryMetadataManifestSchema
>;
export type TwinRepositoryMetadataDirectory = z.infer<
  typeof TwinRepositoryMetadataDirectorySchema
>;
export type TwinCodeownersPrecedenceSlot = z.infer<
  typeof TwinCodeownersPrecedenceSlotSchema
>;
export type TwinOwnershipPatternShape = z.infer<
  typeof TwinOwnershipPatternShapeSchema
>;
export type TwinOwnerPrincipalKind = z.infer<
  typeof TwinOwnerPrincipalKindSchema
>;
export type TwinCodeownersFile = z.infer<typeof TwinCodeownersFileSchema>;
export type TwinOwnershipRule = z.infer<typeof TwinOwnershipRuleSchema>;
export type TwinOwnerPrincipal = z.infer<typeof TwinOwnerPrincipalSchema>;
export type TwinOwnershipSummaryState = z.infer<
  typeof TwinOwnershipSummaryStateSchema
>;
export type TwinOwnershipAppliedRule = z.infer<
  typeof TwinOwnershipAppliedRuleSchema
>;
export type TwinOwnedDirectory = z.infer<typeof TwinOwnedDirectorySchema>;
export type TwinOwnedManifest = z.infer<typeof TwinOwnedManifestSchema>;
export type TwinRepositoryOwnershipSummaryCounts = z.infer<
  typeof TwinRepositoryOwnershipSummaryCountsSchema
>;
export type TwinRepositoryOwnershipSummary = z.infer<
  typeof TwinRepositoryOwnershipSummarySchema
>;
export type TwinRepositoryMetadataSummary = z.infer<
  typeof TwinRepositoryMetadataSummarySchema
>;
export type TwinRepositoryMetadataSyncResult = z.infer<
  typeof TwinRepositoryMetadataSyncResultSchema
>;
export type TwinRepositoryOwnershipRulesView = z.infer<
  typeof TwinRepositoryOwnershipRulesViewSchema
>;
export type TwinRepositoryOwnersView = z.infer<
  typeof TwinRepositoryOwnersViewSchema
>;
export type TwinRepositoryOwnershipSyncResult = z.infer<
  typeof TwinRepositoryOwnershipSyncResultSchema
>;
