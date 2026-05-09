import { z } from "zod";
import { READ_ONLY_APP_MCP_SCHEMA_VERSION } from "./read-only-app-mcp-boundaries";

const trueLiteral = z.literal(true);

export const AppAuthorityBoundarySchema = z
  .object({
    rawSourcesAuthoritativeForDocumentClaims: trueLiteral,
    financeTwinAuthoritativeForStructuredFacts: trueLiteral,
    cfoWikiCompiledDerived: trueLiteral,
    evidenceIndexReadOnlyAnchorTraceCardCoverageLimitationLayer: trueLiteral,
    v2cToolsLocalInternalReadOnlyContract: trueLiteral,
    v2dAtlasVisualizationOnly: trueLiteral,
    v2eBoundedOrchestrationLocalInternalProofOnly: trueLiteral,
    v2fSafeDemoDataPolicyInherited: trueLiteral,
    appMcpArtifactsNotSourceTruth: trueLiteral,
    appMcpArtifactsNotFinanceTwinTruth: trueLiteral,
    appMcpArtifactsNotCfoWikiTruth: trueLiteral,
    appMcpArtifactsNotEvidenceIndexTruth: trueLiteral,
    appMcpArtifactsNotProductRuntimeTruth: trueLiteral,
  })
  .strict();

export const AppNoRuntimeBoundarySchema = z
  .object({
    schemaVersion: z.literal(READ_ONLY_APP_MCP_SCHEMA_VERSION),
    localProofOnly: trueLiteral,
    noProductRuntime: trueLiteral,
    noPublicChatGptApp: trueLiteral,
    noRemoteMcpDeployment: trueLiteral,
    noMcpServerRuntime: trueLiteral,
    noAppsSdkUi: trueLiteral,
    noOauth: trueLiteral,
    noAppSubmission: trueLiteral,
    noEndpointsAdded: trueLiteral,
    noRoutesAdded: trueLiteral,
    noUiAdded: trueLiteral,
    noSchemaMigrationsAdded: trueLiteral,
    noPackageScriptsAdded: trueLiteral,
    noSmokeAliasesAdded: trueLiteral,
    noEvalDatasetsAdded: trueLiteral,
    noFixturesAdded: trueLiteral,
    noSampleDataAdded: trueLiteral,
    noPublicDemoDataAdded: trueLiteral,
    noPublicSourcePacksAdded: trueLiteral,
    noSourcePackMutation: trueLiteral,
    noOpenAiApiCalls: trueLiteral,
    noModelCalls: trueLiteral,
    noHostedTools: trueLiteral,
    noVectorFileSearch: trueLiteral,
    noOcr: trueLiteral,
    noPageIndex: trueLiteral,
    noProviderCalls: trueLiteral,
    noCertification: trueLiteral,
    noDelivery: trueLiteral,
    noDeployment: trueLiteral,
    noExternalCommunications: trueLiteral,
    noReportRelease: trueLiteral,
    noReportCirculation: trueLiteral,
    noApproval: trueLiteral,
    noPaymentInstruction: trueLiteral,
    noCustomerContact: trueLiteral,
    noLegalAdvice: trueLiteral,
    noAuditOpinion: trueLiteral,
    noTaxFiling: trueLiteral,
    noSourceMutation: trueLiteral,
    noFinanceWrite: trueLiteral,
    noGeneratedAdvice: trueLiteral,
    noGeneratedProductProse: trueLiteral,
    noRuntimeCodex: trueLiteral,
    noAutonomousAction: trueLiteral,
  })
  .strict();

export function buildAppNoRuntimeBoundary(
  overrides: Partial<
    Record<keyof z.infer<typeof AppNoRuntimeBoundarySchema>, unknown>
  > = {},
) {
  return AppNoRuntimeBoundarySchema.parse({
    localProofOnly: true,
    noAppSubmission: true,
    noAppsSdkUi: true,
    noApproval: true,
    noAuditOpinion: true,
    noAutonomousAction: true,
    noCertification: true,
    noCustomerContact: true,
    noDelivery: true,
    noDeployment: true,
    noEndpointsAdded: true,
    noEvalDatasetsAdded: true,
    noExternalCommunications: true,
    noFinanceWrite: true,
    noFixturesAdded: true,
    noGeneratedAdvice: true,
    noGeneratedProductProse: true,
    noHostedTools: true,
    noLegalAdvice: true,
    noMcpServerRuntime: true,
    noModelCalls: true,
    noOauth: true,
    noOcr: true,
    noOpenAiApiCalls: true,
    noPackageScriptsAdded: true,
    noPageIndex: true,
    noPaymentInstruction: true,
    noProductRuntime: true,
    noProviderCalls: true,
    noPublicChatGptApp: true,
    noPublicDemoDataAdded: true,
    noPublicSourcePacksAdded: true,
    noRemoteMcpDeployment: true,
    noReportCirculation: true,
    noReportRelease: true,
    noRoutesAdded: true,
    noRuntimeCodex: true,
    noSampleDataAdded: true,
    noSchemaMigrationsAdded: true,
    noSmokeAliasesAdded: true,
    noSourceMutation: true,
    noSourcePackMutation: true,
    noTaxFiling: true,
    noUiAdded: true,
    noVectorFileSearch: true,
    schemaVersion: READ_ONLY_APP_MCP_SCHEMA_VERSION,
    ...overrides,
  });
}

export function buildAppAuthorityBoundary() {
  return AppAuthorityBoundarySchema.parse({
    appMcpArtifactsNotCfoWikiTruth: true,
    appMcpArtifactsNotEvidenceIndexTruth: true,
    appMcpArtifactsNotFinanceTwinTruth: true,
    appMcpArtifactsNotProductRuntimeTruth: true,
    appMcpArtifactsNotSourceTruth: true,
    cfoWikiCompiledDerived: true,
    evidenceIndexReadOnlyAnchorTraceCardCoverageLimitationLayer: true,
    financeTwinAuthoritativeForStructuredFacts: true,
    rawSourcesAuthoritativeForDocumentClaims: true,
    v2cToolsLocalInternalReadOnlyContract: true,
    v2dAtlasVisualizationOnly: true,
    v2eBoundedOrchestrationLocalInternalProofOnly: true,
    v2fSafeDemoDataPolicyInherited: true,
  });
}

export type AppNoRuntimeBoundary = z.infer<typeof AppNoRuntimeBoundarySchema>;
export type AppAuthorityBoundary = z.infer<typeof AppAuthorityBoundarySchema>;
