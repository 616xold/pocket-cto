import { z } from "zod";
import { BENCHMARK_COMMUNITY_SCHEMA_VERSION } from "./benchmark-community-policy";

export const BenchmarkAuthorityLayerSchema = z.enum([
  "raw_sources",
  "finance_twin",
  "cfo_wiki",
  "evidence_index",
  "v2c_evidence_tools",
  "v2d_evidence_atlas",
  "v2e_bounded_orchestration",
  "v2f_benchmark_community_contracts",
]);

export const BenchmarkNoRuntimeBoundarySchema = z.object({
  schemaVersion: z.literal(BENCHMARK_COMMUNITY_SCHEMA_VERSION),
  localProofOnly: z.literal(true),
  noProductRuntime: z.literal(true),
  noUiAdded: z.literal(true),
  noRoutesAdded: z.literal(true),
  noSchemaMigrationsAdded: z.literal(true),
  noPackageScriptsAdded: z.literal(true),
  noSmokeAliasesAdded: z.literal(true),
  noEvalDatasetsAdded: z.literal(true),
  noFixturesAdded: z.literal(true),
  noSampleDataAdded: z.literal(true),
  noPublicDemoDataAdded: z.literal(true),
  noPublicSourcePacksAdded: z.literal(true),
  noSourcePackMutation: z.literal(true),
  noOpenAiApiCalls: z.literal(true),
  noModelCalls: z.literal(true),
  noVectorFileSearch: z.literal(true),
  noOcr: z.literal(true),
  noPageIndex: z.literal(true),
  noPublicChatGptApp: z.literal(true),
  noRemoteMcpDeployment: z.literal(true),
  noAppsSdkUi: z.literal(true),
  noOauth: z.literal(true),
  noAppSubmission: z.literal(true),
  noProviderCalls: z.literal(true),
  noCertification: z.literal(true),
  noDelivery: z.literal(true),
  noDeployment: z.literal(true),
  noExternalCommunications: z.literal(true),
  noSourceMutation: z.literal(true),
  noFinanceWrite: z.literal(true),
  noGeneratedAdvice: z.literal(true),
  noRuntimeCodex: z.literal(true),
  noAutonomousAction: z.literal(true),
});

export const ArchitectureMapSchema = z.object({
  schemaVersion: z.literal(BENCHMARK_COMMUNITY_SCHEMA_VERSION),
  authorityLayers: z.array(BenchmarkAuthorityLayerSchema).min(8),
  rawSourcesAuthoritativeForDocumentClaims: z.literal(true),
  financeTwinAuthoritativeForStructuredFacts: z.literal(true),
  cfoWikiCompiledDerived: z.literal(true),
  evidenceIndexReadOnlyAnchorTraceCardCoverageLimitationLayer: z.literal(true),
  v2cToolsLocalInternalReadOnlyContract: z.literal(true),
  v2dAtlasVisualizationOnly: z.literal(true),
  v2eBoundedOrchestrationLocalInternalProofOnly: z.literal(true),
  v2fContractsNotTruthRuntimeOrData: z.literal(true),
  benchmarkArtifactsNotProductRuntime: z.literal(true),
});

export const ContributorChallengeSchema = z.object({
  schemaVersion: z.literal(BENCHMARK_COMMUNITY_SCHEMA_VERSION),
  challengeName: z.string().min(1),
  readOnlyProofOnly: z.literal(true),
  syntheticOnlyRequiredBeforeAnyFutureData: z.literal(true),
  noPublicLaunchImplied: z.literal(true),
  noSaasDeploymentImplied: z.literal(true),
  noProviderIntegrationImplied: z.literal(true),
  noCertificationImplied: z.literal(true),
  noLegalAuditTaxAdviceImplied: z.literal(true),
  noFinanceWritesImplied: z.literal(true),
  noAutonomousActionImplied: z.literal(true),
});

export type BenchmarkAuthorityLayer = z.infer<
  typeof BenchmarkAuthorityLayerSchema
>;
export type BenchmarkNoRuntimeBoundary = z.infer<
  typeof BenchmarkNoRuntimeBoundarySchema
>;
export type ArchitectureMap = z.infer<typeof ArchitectureMapSchema>;
export type ContributorChallenge = z.infer<typeof ContributorChallengeSchema>;
