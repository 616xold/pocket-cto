import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import Fastify from "../apps/control-plane/node_modules/fastify/fastify.js";
import {
  MCP_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_SCHEMA_VERSION,
  McpProtectedResourceMetadataRouteInputEvidenceBundleSchema,
  buildProtectedResourceMetadataRouteInputEvidenceBundle,
  validRouteInput,
  validateProtectedResourceMetadataRouteInputEvidenceBundleSemanticCoherence,
  FP0126_WWW_AUTHENTICATE_AUTH_CHALLENGE_SEQUENCING_PLAN_PATH,
  FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH,
  FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH,
  verifyFp0117OauthImplementationSequencingPlanBoundary,
  verifyFp0118ProtectedResourceMetadataPlanBoundary,
  verifyFp0120CanonicalResourceAuthServerPlanBoundary,
  verifyFp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanning,
  verifyFp0121ProtectedResourceMetadataRouteImplementationPlanningBoundary,
  verifyFp0122ProtectedResourceMetadataBuilderContractsBoundary,
  verifyFp0123ProtectedResourceMetadataRouteInputContractsBoundary,
  verifyFp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlan,
  verifyFp0126AbsentOrDocsOnlyWwwAuthenticateAuthChallengeSequencingPlan,
  verifyFp0126WwwAuthenticateAuthChallengeSequencingPlanBoundary,
  verifyFp0127AbsentOrLocalWwwAuthenticateAuthChallengeContracts,
  verifyFp0127WwwAuthenticateAuthChallengeContractsBoundary,
  verifyFp0128AbsentOrLocalTokenValidationReadinessContracts,
  verifyFp0128TokenValidationReadinessContractsBoundary,
  verifyFp0129AbsentOrDocsOnlyWwwAuthenticateChallengeImplementationSequencingPlan,
  verifyFp0129WwwAuthenticateChallengeImplementationSequencingPlanBoundary,
  verifyFp0130AbsentOrLocalMissingTokenChallengeImplementation,
  verifyFp0131Absent,
} from "../packages/domain/src/index.ts";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { createInMemoryContainer } from "../apps/control-plane/src/bootstrap.ts";
import { registerHttpErrorHandler } from "../apps/control-plane/src/lib/http-errors.ts";
import {
  READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
  registerReadOnlyAppMcpProtectedResourceMetadataRoute,
} from "../apps/control-plane/src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.ts";
import { registerReadOnlyAppMcpEndpointRoutes } from "../apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts";

const FP0125_PLAN =
  "plans/FP-0125-read-only-chatgpt-app-mcp-protected-resource-metadata-local-route-implementation.md";
const FP0126_PLAN = FP0126_WWW_AUTHENTICATE_AUTH_CHALLENGE_SEQUENCING_PLAN_PATH;
const FP0127_PLAN =
  "plans/FP-0127-read-only-chatgpt-app-mcp-www-authenticate-auth-challenge-contracts-foundation.md";
const FP0128_PLAN = FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH;
const FP0129_PLAN =
  FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH;
const FP0130_PLAN =
  FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH;
const FP0124_PLAN =
  "plans/FP-0124-read-only-chatgpt-app-mcp-protected-resource-metadata-route-implementation-master-plan.md";
const FP0123_PLAN =
  "plans/FP-0123-read-only-chatgpt-app-mcp-protected-resource-metadata-route-input-evidence-contracts.md";
const FP0122_PLAN =
  "plans/FP-0122-read-only-chatgpt-app-mcp-protected-resource-metadata-document-builder-contracts.md";
const FP0121_PLAN =
  "plans/FP-0121-read-only-chatgpt-app-mcp-protected-resource-metadata-route-implementation-planning.md";
const FP0120_PLAN =
  "plans/FP-0120-read-only-chatgpt-app-mcp-canonical-resource-auth-server-readiness-contracts.md";
const FP0118_PLAN =
  "plans/FP-0118-read-only-chatgpt-app-mcp-protected-resource-metadata-auth-challenge-readiness-contracts.md";
const FP0117_PLAN =
  "plans/FP-0117-read-only-chatgpt-app-mcp-oauth-token-session-auth-implementation-sequencing-master-plan.md";
const FP0107_PLAN =
  "plans/FP-0107-read-only-chatgpt-app-mcp-local-fastify-mcp-route-adapter-foundation.md";
const FP0106_PLAN =
  "plans/FP-0106-read-only-chatgpt-app-mcp-protocol-envelope-tool-dispatch-proof-contracts.md";
const FP0100_PLAN =
  "plans/FP-0100-read-only-chatgpt-app-mcp-public-app-security-boundary-contracts-foundation.md";
const ROUTE_MODULE =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.ts";
const MCP_ROUTE_MODULE =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts";

const repoPaths = repoFilePaths();
const changedPaths = changedFilePaths();
const validEvidenceBundle =
  buildProtectedResourceMetadataRouteInputEvidenceBundle(validRouteInput);
const routeSource = safeRead(ROUTE_MODULE);
const mcpRouteSource = safeRead(MCP_ROUTE_MODULE);
const executableChangedSource = changedPaths
  .filter((path) => /\.(?:ts|tsx|js|mjs|cjs)$/u.test(path))
  .filter((path) => !path.endsWith(".spec.ts"))
  .filter((path) => !path.startsWith("tools/"))
  .map(safeRead)
  .join("\n");

const appProof = await withStdoutSilenced(verifyAppBehavior);
const sourceProof = verifySourceBoundaries();
const repositoryProof = verifyRepositoryBoundaries();
const planProof = verifyPlanBoundaries();

const proof = {
  schemaVersion:
    "v2as.read-only-app-mcp-protected-resource-metadata-local-route.v1",
  localProofOnly: true,
  protectedResourceMetadataLocalRouteImplementationVerified:
    appProof.explicitEvidenceDependencyEnablesMetadataRoute &&
    appProof.metadataResponseBoundedFieldsVerified &&
    appProof.metadataResponseNoTokenLeakageVerified,
  exactMetadataRoutePathVerified:
    READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH ===
    "/.well-known/oauth-protected-resource/mcp",
  metadataRouteGetOnlyVerified: appProof.metadataRouteGetOnlyVerified,
  buildAppDefaultMetadataRouteAbsent:
    appProof.buildAppDefaultMetadataRouteAbsent,
  explicitRouteInputEvidenceDependencyVerified:
    appProof.explicitRouteInputEvidenceDependencyVerified,
  explicitEvidenceDependencyEnablesMetadataRoute:
    appProof.explicitEvidenceDependencyEnablesMetadataRoute,
  invalidEvidenceDependencyFailsClosedBeforeRouteRegistration:
    appProof.invalidEvidenceDependencyFailsClosedBeforeRouteRegistration,
  routeInputEvidenceSemanticCoherenceVerified:
    appProof.routeInputEvidenceSemanticCoherenceVerified,
  routeInputEvidenceSchemaVersionVerified:
    appProof.routeInputEvidenceSchemaVersionVerified,
  metadataDocumentResourceMatchesCanonicalUriEvidence:
    appProof.metadataDocumentResourceMatchesCanonicalUriEvidence,
  pathDecisionCanonicalUriMatchesEvidence:
    appProof.pathDecisionCanonicalUriMatchesEvidence,
  pathDecisionMetadataUrlMatchesEvidence:
    appProof.pathDecisionMetadataUrlMatchesEvidence,
  routePathMatchesPathDecision: appProof.routePathMatchesPathDecision,
  metadataDocumentAuthorizationServersMatchEvidence:
    appProof.metadataDocumentAuthorizationServersMatchEvidence,
  metadataDocumentScopesRemainReadOnly:
    appProof.metadataDocumentScopesRemainReadOnly,
  metadataDocumentBearerMethodsRemainHeaderOnly:
    appProof.metadataDocumentBearerMethodsRemainHeaderOnly,
  mismatchedRouteInputEvidenceFailsClosedBeforeRegistration:
    appProof.mismatchedRouteInputEvidenceFailsClosedBeforeRegistration,
  noSchemaOnlyEvidenceAcceptance: appProof.noSchemaOnlyEvidenceAcceptance,
  metadataRouteMutatingMethodsRejected:
    appProof.metadataRouteMutatingMethodsRejected,
  metadataResponseBoundedFieldsVerified:
    appProof.metadataResponseBoundedFieldsVerified,
  metadataResponseNoTokenLeakageVerified:
    appProof.metadataResponseNoTokenLeakageVerified,
  routeDoesNotConstructMetadataFromRuntimeConfig:
    sourceProof.routeDoesNotConstructMetadataFromRuntimeConfig,
  routeDoesNotUseDbQueries: sourceProof.routeDoesNotUseDbQueries,
  routeDoesNotUseOpenAiApi: sourceProof.routeDoesNotUseOpenAiApi,
  routeDoesNotUseProviderCalls: sourceProof.routeDoesNotUseProviderCalls,
  routeDoesNotUseSourceMutation: sourceProof.routeDoesNotUseSourceMutation,
  routeDoesNotUseFinanceWrite: sourceProof.routeDoesNotUseFinanceWrite,
  mcpRouteBehaviorUnchanged: appProof.mcpRouteBehaviorUnchanged,
  mcpRouteBehaviorStillUnchanged: appProof.mcpRouteBehaviorUnchanged,
  noWwwAuthenticateRouteBehaviorImplementation:
    appProof.noWwwAuthenticateRouteBehaviorImplementation &&
    sourceProof.noWwwAuthenticateRouteBehaviorImplementation,
  noOauthImplementation: sourceProof.noOauthImplementation,
  noTokenSessionImplementation: sourceProof.noTokenSessionImplementation,
  noAuthMiddlewareImplementation: sourceProof.noAuthMiddlewareImplementation,
  noRemoteMcpDeployment: repositoryProof.noRemoteMcpDeployment,
  noDeploymentConfig: repositoryProof.noDeploymentConfig,
  noAppsSdkResourceImplementation:
    repositoryProof.noAppsSdkResourceImplementation,
  noAppSubmission: repositoryProof.noAppSubmission,
  noPackageScriptsAdded: repositoryProof.noPackageScriptsAdded,
  noSchemaMigrationsAdded: repositoryProof.noSchemaMigrationsAdded,
  noDbQueriesFromFp0126: repositoryProof.noDbQueriesFromFp0126,
  noSchemaMigrationsFromFp0126: repositoryProof.noSchemaMigrationsAdded,
  noPackageScriptsFromFp0126: repositoryProof.noPackageScriptsAdded,
  noOpenAiApiCallsFromFp0126: repositoryProof.noOpenAiApiCallsFromFp0126,
  noProviderExternalCallsFromFp0126:
    repositoryProof.noProviderExternalCallsFromFp0126,
  noSourceMutationFinanceWriteFromFp0126:
    repositoryProof.noSourceMutationFinanceWriteFromFp0126,
  noPublicAssets: repositoryProof.noPublicAssets,
  noPublicAssetsSubmissionArtifactsFromFp0126:
    repositoryProof.noPublicAssets &&
    repositoryProof.noAppSubmission &&
    repositoryProof.noGeneratedPublicProse,
  noListingCopy: repositoryProof.noListingCopy,
  noGeneratedPublicProse: repositoryProof.noGeneratedPublicProse,
  fp0125BoundaryVerified: planProof.fp0125BoundaryVerified,
  fp0126AbsentOrDocsOnlyWwwAuthenticateAuthChallengeSequencingPlanVerified:
    planProof.fp0126AbsentOrDocsOnlyWwwAuthenticateAuthChallengeSequencingPlanVerified,
  fp0127AbsentOrLocalWwwAuthenticateAuthChallengeContractsVerified:
    planProof.fp0127AbsentOrLocalWwwAuthenticateAuthChallengeContractsVerified,
  fp0128AbsentOrLocalTokenValidationReadinessContractsVerified:
    planProof.fp0128AbsentOrLocalTokenValidationReadinessContractsVerified,
  fp0128TokenValidationReadinessBoundaryStillVerified:
    planProof.fp0128TokenValidationReadinessBoundaryStillVerified,
  fp0129AbsentOrDocsOnlyWwwAuthenticateChallengeImplementationSequencingPlanVerified:
    planProof.fp0129AbsentOrDocsOnlyWwwAuthenticateChallengeImplementationSequencingPlanVerified,
  fp0130AbsentOrLocalMissingTokenChallengeImplementationVerified:
    planProof.fp0130AbsentOrLocalMissingTokenChallengeImplementationVerified,
  fp0131Absent: planProof.fp0131Absent,
  wwwAuthenticateChallengeImplementationSequencingPlanBoundaryVerified:
    planProof.wwwAuthenticateChallengeImplementationSequencingPlanBoundaryVerified,
  wwwAuthenticateAuthChallengeContractsFoundationVerified:
    planProof.wwwAuthenticateAuthChallengeContractsFoundationVerified,
  wwwAuthenticateAuthChallengeSequencingBoundaryVerified:
    planProof.wwwAuthenticateAuthChallengeSequencingBoundaryVerified,
  noMcpRouteBehaviorChangeFromFp0126: appProof.mcpRouteBehaviorUnchanged,
  noWwwAuthenticateBehaviorFromFp0126:
    appProof.noWwwAuthenticateRouteBehaviorImplementation &&
    sourceProof.noWwwAuthenticateRouteBehaviorImplementation,
  noOauthImplementationFromFp0126: sourceProof.noOauthImplementation,
  noTokenSessionImplementationFromFp0126:
    sourceProof.noTokenSessionImplementation,
  noAuthMiddlewareImplementationFromFp0126:
    sourceProof.noAuthMiddlewareImplementation,
  noRemoteMcpDeploymentFromFp0126: repositoryProof.noRemoteMcpDeployment,
  noDeploymentConfigFromFp0126: repositoryProof.noDeploymentConfig,
  noAppsSdkResourceFromFp0126: repositoryProof.noAppsSdkResourceImplementation,
  noAppSubmissionFromFp0126: repositoryProof.noAppSubmission,
  noMcpRouteBehaviorChangeFromFp0127: appProof.mcpRouteBehaviorUnchanged,
  noProtectedResourceMetadataRouteBehaviorChangeFromFp0127:
    appProof.explicitEvidenceDependencyEnablesMetadataRoute &&
    appProof.metadataResponseBoundedFieldsVerified &&
    appProof.metadataResponseNoTokenLeakageVerified,
  noWwwAuthenticateRouteBehaviorFromFp0127:
    appProof.noWwwAuthenticateRouteBehaviorImplementation &&
    sourceProof.noWwwAuthenticateRouteBehaviorImplementation,
  noTokenValidationImplementationFromFp0127:
    sourceProof.noTokenValidationImplementation,
  noOauthImplementationFromFp0127: sourceProof.noOauthImplementation,
  noTokenSessionImplementationFromFp0127:
    sourceProof.noTokenSessionImplementation,
  noAuthMiddlewareImplementationFromFp0127:
    sourceProof.noAuthMiddlewareImplementation,
  noRemoteMcpDeploymentFromFp0127: repositoryProof.noRemoteMcpDeployment,
  noDeploymentConfigFromFp0127: repositoryProof.noDeploymentConfig,
  noAppsSdkResourceFromFp0127: repositoryProof.noAppsSdkResourceImplementation,
  noAppSubmissionFromFp0127: repositoryProof.noAppSubmission,
  noDbQueriesFromFp0127: repositoryProof.noDbQueriesFromFp0126,
  noSchemaMigrationsFromFp0127: repositoryProof.noSchemaMigrationsAdded,
  noPackageScriptsFromFp0127: repositoryProof.noPackageScriptsAdded,
  noOpenAiApiCallsFromFp0127: repositoryProof.noOpenAiApiCallsFromFp0126,
  noProviderExternalCallsFromFp0127:
    repositoryProof.noProviderExternalCallsFromFp0126,
  noSourceMutationFinanceWriteFromFp0127:
    repositoryProof.noSourceMutationFinanceWriteFromFp0126,
  noPublicAssetsSubmissionArtifactsFromFp0127:
    repositoryProof.noPublicAssets &&
    repositoryProof.noAppSubmission &&
    repositoryProof.noGeneratedPublicProse,
  noListingCopyGeneratedPublicProseFromFp0127:
    repositoryProof.noListingCopy && repositoryProof.noGeneratedPublicProse,
  fp0125ProtectedResourceMetadataLocalRouteBoundaryStillVerified:
    planProof.fp0125BoundaryVerified,
  fp0125EvidenceCoherenceBoundaryStillVerified:
    appProof.routeInputEvidenceSemanticCoherenceVerified &&
    appProof.mismatchedRouteInputEvidenceFailsClosedBeforeRegistration &&
    appProof.noSchemaOnlyEvidenceAcceptance,
  fp0124RouteImplementationPlanningBoundaryStillVerified:
    planProof.fp0124RouteImplementationPlanningBoundaryStillVerified,
  fp0123RouteInputEvidenceBoundaryStillVerified:
    planProof.fp0123RouteInputEvidenceBoundaryStillVerified,
  fp0122ProtectedResourceMetadataBuilderBoundaryStillVerified:
    planProof.fp0122ProtectedResourceMetadataBuilderBoundaryStillVerified,
  fp0121ProtectedResourceMetadataRoutePlanningBoundaryStillVerified:
    planProof.fp0121ProtectedResourceMetadataRoutePlanningBoundaryStillVerified,
  fp0120CanonicalResourceAuthServerBoundaryStillVerified:
    planProof.fp0120CanonicalResourceAuthServerBoundaryStillVerified,
  fp0118ProtectedResourceMetadataBoundaryStillVerified:
    planProof.fp0118ProtectedResourceMetadataBoundaryStillVerified,
  fp0117OauthImplementationSequencingBoundaryStillVerified:
    planProof.fp0117OauthImplementationSequencingBoundaryStillVerified,
  fp0107RouteAdapterBoundaryStillVerified:
    planProof.fp0107RouteAdapterBoundaryStillVerified,
  fp0106ProtocolEnvelopeBoundaryStillVerified:
    planProof.fp0106ProtocolEnvelopeBoundaryStillVerified,
  fp0100PublicSecurityBoundaryStillVerified:
    planProof.fp0100PublicSecurityBoundaryStillVerified,
  fp0125EvidenceCoherenceHardeningVerified:
    appProof.routeInputEvidenceSemanticCoherenceVerified &&
    appProof.mismatchedRouteInputEvidenceFailsClosedBeforeRegistration &&
    appProof.noSchemaOnlyEvidenceAcceptance &&
    appProof.metadataRouteMutatingMethodsRejected &&
    appProof.mcpRouteBehaviorUnchanged,
};

for (const [key, value] of Object.entries(proof)) {
  if (typeof value === "boolean" && value !== true) {
    throw new Error(`FP-0125 local route proof failed: ${key}`);
  }
}

console.log(JSON.stringify(proof, null, 2));

async function verifyAppBehavior() {
  const apps = [];
  try {
    const defaultApp = await buildApp({
      container: createInMemoryContainer(),
    });
    apps.push(defaultApp);
    const defaultResponse = await defaultApp.inject({
      method: "GET",
      url: READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
    });

    const explicitApp = await buildApp({
      container: {
        ...createInMemoryContainer(),
        readOnlyAppMcpProtectedResourceMetadataRouteInputEvidenceBundle:
          validEvidenceBundle,
      },
    });
    apps.push(explicitApp);

    const metadataResponse = await explicitApp.inject({
      method: "GET",
      url: READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
    });
    const metadataMutatingResponses = await Promise.all(
      ["POST", "PUT", "PATCH", "DELETE"].map((method) =>
        explicitApp.inject({
          method,
          url: READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
        }),
      ),
    );
    const metadataHeadResponse = await explicitApp.inject({
      method: "HEAD",
      url: READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
    });
    const rootMetadataResponse = await explicitApp.inject({
      method: "GET",
      url: "/.well-known/oauth-protected-resource",
    });

    const invalidApp = Fastify();
    apps.push(invalidApp);
    let invalidDependencyRejected = false;
    try {
      await registerReadOnlyAppMcpProtectedResourceMetadataRoute(invalidApp, {
        routeInputEvidenceBundle: {
          ...validEvidenceBundle,
          noTokenLeakage: {
            ...validEvidenceBundle.noTokenLeakage,
            accepted: false,
          },
        },
      });
    } catch {
      invalidDependencyRejected = true;
    }
    const mismatchedEvidenceRejected = await Promise.all(
      mismatchedEvidenceBundles().map((bundle) =>
        routeRegistrationRejectedBeforeRegistration(bundle, apps),
      ),
    );
    const schemaOnlyIncoherentBundle = {
      ...validEvidenceBundle,
      canonicalUriEvidence: {
        ...validEvidenceBundle.canonicalUriEvidence,
        metadataUrl:
          "https://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/other",
      },
    };
    const noSchemaOnlyEvidenceAcceptance =
      McpProtectedResourceMetadataRouteInputEvidenceBundleSchema.safeParse(
        schemaOnlyIncoherentBundle,
      ).success &&
      (await routeRegistrationRejectedBeforeRegistration(
        schemaOnlyIncoherentBundle,
        apps,
      ));

    const mcpApp = Fastify();
    apps.push(mcpApp);
    registerHttpErrorHandler(mcpApp);
    await registerReadOnlyAppMcpEndpointRoutes(mcpApp);
    await registerReadOnlyAppMcpProtectedResourceMetadataRoute(mcpApp, {
      routeInputEvidenceBundle: validEvidenceBundle,
    });
    const mcpGetResponse = await mcpApp.inject({
      headers: {
        accept: "text/event-stream",
      },
      method: "GET",
      url: "/mcp",
    });
    const initializeResponse = await mcpApp.inject({
      method: "POST",
      payload: {
        id: "init-proof",
        jsonrpc: "2.0",
        method: "initialize",
      },
      url: "/mcp",
    });
    const pingResponse = await mcpApp.inject({
      method: "POST",
      payload: {
        id: "ping-proof",
        jsonrpc: "2.0",
        method: "ping",
      },
      url: "/mcp",
    });
    const toolsListResponse = await mcpApp.inject({
      method: "POST",
      payload: {
        id: "tools-proof",
        jsonrpc: "2.0",
        method: "tools/list",
      },
      url: "/mcp",
    });
    const notificationResponse = await mcpApp.inject({
      method: "POST",
      payload: {
        jsonrpc: "2.0",
        method: "notifications/initialized",
      },
      url: "/mcp",
    });
    const originResponse = await mcpApp.inject({
      headers: {
        origin: "https://attacker.example",
      },
      method: "POST",
      payload: {
        id: "origin-proof",
        jsonrpc: "2.0",
        method: "initialize",
      },
      url: "/mcp",
    });

    const metadataBody = metadataResponse.json();
    const boundedFieldNames = Object.keys(metadataBody).sort();
    const mcpListBody = toolsListResponse.json();
    const semanticCoherence =
      validateProtectedResourceMetadataRouteInputEvidenceBundleSemanticCoherence(
        validEvidenceBundle,
      );

    return {
      buildAppDefaultMetadataRouteAbsent:
        !defaultApp.hasRoute({
          method: "GET",
          url: READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
        }) && defaultResponse.statusCode === 404,
      explicitRouteInputEvidenceDependencyVerified:
        validEvidenceBundle.routeInputEvidenceBundleOnly &&
        validEvidenceBundle.builderOutput.builderOutputValid,
      explicitEvidenceDependencyEnablesMetadataRoute:
        explicitApp.hasRoute({
          method: "GET",
          url: READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
        }) && metadataResponse.statusCode === 200,
      invalidEvidenceDependencyFailsClosedBeforeRouteRegistration:
        invalidDependencyRejected &&
        !invalidApp.hasRoute({
          method: "GET",
          url: READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
        }),
      routeInputEvidenceSemanticCoherenceVerified:
        semanticCoherence.routeInputEvidenceSemanticCoherenceVerified,
      routeInputEvidenceSchemaVersionVerified:
        validEvidenceBundle.schemaVersion ===
          MCP_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_SCHEMA_VERSION &&
        semanticCoherence.routeInputEvidenceSchemaVersionVerified,
      metadataDocumentResourceMatchesCanonicalUriEvidence:
        semanticCoherence.metadataDocumentResourceMatchesCanonicalUriEvidence,
      pathDecisionCanonicalUriMatchesEvidence:
        semanticCoherence.pathDecisionCanonicalUriMatchesEvidence,
      pathDecisionMetadataUrlMatchesEvidence:
        semanticCoherence.pathDecisionMetadataUrlMatchesEvidence,
      routePathMatchesPathDecision:
        semanticCoherence.routePathMatchesPathDecision,
      metadataDocumentAuthorizationServersMatchEvidence:
        semanticCoherence.metadataDocumentAuthorizationServersMatchEvidence,
      metadataDocumentScopesRemainReadOnly:
        semanticCoherence.metadataDocumentScopesRemainReadOnly,
      metadataDocumentBearerMethodsRemainHeaderOnly:
        semanticCoherence.metadataDocumentBearerMethodsRemainHeaderOnly,
      mismatchedRouteInputEvidenceFailsClosedBeforeRegistration:
        mismatchedEvidenceRejected.every(Boolean),
      noSchemaOnlyEvidenceAcceptance,
      metadataResponseBoundedFieldsVerified:
        metadataResponse.statusCode === 200 &&
        JSON.stringify(boundedFieldNames) ===
          JSON.stringify([
            "authorization_servers",
            "bearer_methods_supported",
            "resource",
            "scopes_supported",
          ]) &&
        metadataBody.resource ===
          validEvidenceBundle.builderOutput.document.resource &&
        JSON.stringify(metadataBody.authorization_servers) ===
          JSON.stringify(
            validEvidenceBundle.builderOutput.document.authorization_servers,
          ) &&
        JSON.stringify(metadataBody.scopes_supported) ===
          JSON.stringify(
            validEvidenceBundle.builderOutput.document.scopes_supported,
          ) &&
        JSON.stringify(metadataBody.bearer_methods_supported) ===
          JSON.stringify(
            validEvidenceBundle.builderOutput.document.bearer_methods_supported,
          ),
      metadataResponseNoTokenLeakageVerified:
        metadataResponse.headers["www-authenticate"] === undefined &&
        privateSurfaceHits(metadataBody).length === 0,
      metadataRouteGetOnlyVerified:
        !explicitApp.hasRoute({
          method: "POST",
          url: READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
        }) &&
        !explicitApp.hasRoute({
          method: "HEAD",
          url: READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
        }) &&
        metadataHeadResponse.statusCode === 404 &&
        metadataMutatingResponses.every(
          (response) => response.statusCode === 404,
        ) &&
        rootMetadataResponse.statusCode === 404,
      metadataRouteMutatingMethodsRejected: metadataMutatingResponses.every(
        (response) => response.statusCode === 404,
      ),
      mcpRouteBehaviorUnchanged:
        mcpGetResponse.statusCode === 405 &&
        mcpGetResponse.headers.allow === "POST" &&
        mcpGetResponse.body === "" &&
        initializeResponse.statusCode === 200 &&
        initializeResponse.json().result.capabilities.tools.listChanged ===
          false &&
        JSON.stringify(pingResponse.json()) ===
          JSON.stringify({
            id: "ping-proof",
            jsonrpc: "2.0",
            result: {},
          }) &&
        Array.isArray(mcpListBody.result.tools) &&
        notificationResponse.statusCode === 202 &&
        notificationResponse.body === "" &&
        originResponse.statusCode === 403 &&
        initializeResponse.headers["www-authenticate"] === undefined &&
        pingResponse.headers["www-authenticate"] === undefined &&
        toolsListResponse.headers["www-authenticate"] === undefined &&
        notificationResponse.headers["www-authenticate"] === undefined,
      noWwwAuthenticateRouteBehaviorImplementation:
        metadataResponse.headers["www-authenticate"] === undefined &&
        mcpGetResponse.headers["www-authenticate"] === undefined,
    };
  } finally {
    await Promise.all(apps.map((app) => app.close()));
  }
}

function mismatchedEvidenceBundles() {
  return [
    {
      ...validEvidenceBundle,
      builderOutput: {
        ...validEvidenceBundle.builderOutput,
        document: {
          ...validEvidenceBundle.builderOutput.document,
          resource: "https://mcp.canonical-finance-host.com/other",
        },
      },
    },
    {
      ...validEvidenceBundle,
      pathDecision: {
        ...validEvidenceBundle.pathDecision,
        canonicalResourceUri: "https://mcp.canonical-finance-host.com/other",
      },
    },
    {
      ...validEvidenceBundle,
      pathDecision: {
        ...validEvidenceBundle.pathDecision,
        metadataUrl:
          "https://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/other",
      },
    },
    {
      ...validEvidenceBundle,
      pathDecision: {
        ...validEvidenceBundle.pathDecision,
        metadataRoutePath: "/.well-known/oauth-protected-resource/other",
      },
    },
    {
      ...validEvidenceBundle,
      builderOutput: {
        ...validEvidenceBundle.builderOutput,
        document: {
          ...validEvidenceBundle.builderOutput.document,
          authorization_servers: [
            "https://other-auth.canonical-finance-host.com",
          ],
        },
      },
    },
    {
      ...validEvidenceBundle,
      builderOutput: {
        ...validEvidenceBundle.builderOutput,
        document: {
          ...validEvidenceBundle.builderOutput.document,
          scopes_supported: ["mcp:read", "finance:write"],
        },
      },
    },
    {
      ...validEvidenceBundle,
      builderOutput: {
        ...validEvidenceBundle.builderOutput,
        document: {
          ...validEvidenceBundle.builderOutput.document,
          bearer_methods_supported: ["query"],
        },
      },
    },
    {
      ...validEvidenceBundle,
      schemaVersion:
        "v2aq.read-only-app-mcp-protected-resource-metadata-route-input.v0",
    },
  ];
}

async function routeRegistrationRejectedBeforeRegistration(
  routeInputEvidenceBundle,
  apps,
) {
  const app = Fastify();
  apps.push(app);
  let rejected = false;
  try {
    await registerReadOnlyAppMcpProtectedResourceMetadataRoute(app, {
      routeInputEvidenceBundle,
    });
  } catch {
    rejected = true;
  }

  return (
    rejected &&
    !app.hasRoute({
      method: "GET",
      url: READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
    })
  );
}

async function withStdoutSilenced(callback) {
  const originalWrite = process.stdout.write;
  process.stdout.write = () => true;
  try {
    return await callback();
  } finally {
    process.stdout.write = originalWrite;
  }
}

function verifySourceBoundaries() {
  return {
    routeDoesNotConstructMetadataFromRuntimeConfig:
      !/\b(?:process\.env|createServerContainer|runtimeConfig|envConfig)\b/u.test(
        routeSource,
      ),
    routeDoesNotUseDbQueries:
      !/\b(?:from\s+["']drizzle|drizzle\s*\(|select\s*\(|insert\s*\(|update\s*\(|delete\s*\(|sql`)\b/u.test(
        routeSource,
      ),
    routeDoesNotUseOpenAiApi: !new RegExp(
      `\\b(?:${["OPENAI", "API", "KEY"].join("_")}|new\\s+OpenAI|from\\s+["']openai["']|responses\\.create|chat\\.completions|client\\.responses|api\\.openai\\.com)\\b`,
      "u",
    ).test(routeSource),
    routeDoesNotUseProviderCalls:
      !/\b(?:providerConnect|callProvider|createProviderJob|deploy|fetch)\s*\(/u.test(
        routeSource,
      ),
    routeDoesNotUseSourceMutation:
      !/\b(?:uploadSource|mutateSource|rewriteSource|deleteSource)\s*\(/u.test(
        routeSource,
      ),
    routeDoesNotUseFinanceWrite:
      !/\b(?:writeFinanceTwin|updateLedger|financeWrite|postLedger|createJournalEntry)\s*\(/u.test(
        routeSource,
      ),
    noWwwAuthenticateRouteBehaviorImplementation:
      !/WWW-Authenticate|www-authenticate|resource_metadata\s*=|reply\.header\s*\(/iu.test(
        routeSource,
      ),
    noOauthImplementation:
      !/\b(?:oauthCallback|authorizeUrl|tokenExchange|authorizationCode|pkceVerifier)\s*\(/u.test(
        executableChangedSource,
      ),
    noTokenSessionImplementation:
      !/\b(?:tokenStore|sessionStore|sessionHandler|refreshTokenStore|setCookie)\s*\(/u.test(
        executableChangedSource,
      ),
    noTokenValidationImplementation:
      !/\b(?:validateToken|verifyToken|tokenValidator|jwtVerify|verifyJwt|validateBearer|verifyBearer)\s*\(/u.test(
        executableChangedSource,
      ),
    noAuthMiddlewareImplementation:
      !/\b(?:authMiddleware|authorizationMiddleware|routeGuard|verifyBearer|requireAuth|authenticateRequest)\s*\(/u.test(
        executableChangedSource,
      ),
  };
}

function verifyRepositoryBoundaries() {
  return {
    noRemoteMcpDeployment: !changedPaths.some((path) =>
      /(?:^|\/)(?:apps\/remote-mcp-server|remote-mcp|public-mcp|mcp-server|vercel\.json|netlify\.toml|render\.ya?ml|fly\.toml|Dockerfile|docker-compose\.ya?ml)$/iu.test(
        path,
      ),
    ),
    noDeploymentConfig: !changedPaths.some((path) =>
      /(?:^|\/)(?:vercel\.json|netlify\.toml|render\.ya?ml|fly\.toml|railway\.json|railway\.toml|wrangler\.toml|apphosting\.ya?ml|Dockerfile|docker-compose\.ya?ml|\.github\/workflows\/.*\.ya?ml)$/iu.test(
        path,
      ),
    ),
    noAppsSdkResourceImplementation:
      !changedPaths.some((path) =>
        /(?:apps-sdk|appssdk|app-submission|submission-assets|iframe|component-resource)/iu.test(
          path,
        ),
      ) &&
      !/\b(?:registerResource|componentResource|iframe)\s*\(/u.test(
        routeSource,
      ),
    noAppSubmission: !changedPaths.some((path) =>
      /(?:app-submission|submission-assets|public-listing|store-listing|listing-copy|screenshots)/iu.test(
        path,
      ),
    ),
    noPackageScriptsAdded:
      !changedPaths.includes("package.json") &&
      !changedPaths.some((path) => /\/package\.json$/u.test(path)),
    noSchemaMigrationsAdded: !changedPaths.some(
      (path) =>
        /^packages\/db\//u.test(path) ||
        /(?:^|\/)migrations?\//iu.test(path) ||
        /\.(?:sql)$/iu.test(path),
    ),
    noPublicAssets: !changedPaths.some((path) =>
      /\.(?:png|jpe?g|gif|webp|svg|ico|avif|mp4|mov|pdf)$/iu.test(path),
    ),
    noListingCopy: !changedPaths.some((path) =>
      /(?:listing-copy|public-listing|store-listing)/iu.test(path),
    ),
    noGeneratedPublicProse: !changedPaths.some((path) =>
      /(?:generated-public-prose|public-listing|store-listing)/iu.test(path),
    ),
    noDbQueriesFromFp0126:
      !changedPaths.some((path) => /^packages\/db\//u.test(path)) &&
      !/\b(?:from\s+["']drizzle|drizzle\s*\(|select\s*\(|insert\s*\(|update\s*\(|delete\s*\(|sql`)\b/u.test(
        executableChangedSource,
      ),
    noOpenAiApiCallsFromFp0126:
      !/\b(?:openai\s*\(|new\s+OpenAI|responses\.create|chat\.completions|client\.responses|api\.openai\.com)\b/iu.test(
        executableChangedSource,
      ),
    noProviderExternalCallsFromFp0126:
      !/\b(?:providerConnect|callProvider|createProviderJob|deploy|sendEmail|sendReport|contactCustomer|externalMessage)\s*\(/u.test(
        executableChangedSource,
      ),
    noSourceMutationFinanceWriteFromFp0126:
      !/\b(?:uploadSource|mutateSource|rewriteSource|deleteSource|writeFinanceTwin|updateLedger|financeWrite|postLedger|createJournalEntry)\s*\(/u.test(
        executableChangedSource,
      ),
  };
}

function verifyPlanBoundaries() {
  const fp0125Hits = repoPaths.filter((path) => path.includes("FP-0125"));
  const fp0125PlanText = safeRead(FP0125_PLAN);
  const fp0126PlanText = safeRead(FP0126_PLAN);
  const fp0127PlanText = safeRead(FP0127_PLAN);
  const fp0125TextBoundary =
    fp0125PlanText.includes("local-only/read-only/proof-gated") &&
    fp0125PlanText.includes("explicit FP-0123") &&
    fp0125PlanText.includes("/.well-known/oauth-protected-resource/mcp") &&
    fp0125PlanText.includes("does not implement WWW-Authenticate") &&
    fp0125PlanText.includes("does not implement OAuth");

  return {
    fp0125BoundaryVerified:
      fp0125Hits.length === 1 &&
      fp0125Hits[0] === FP0125_PLAN &&
      fp0125TextBoundary,
    fp0126AbsentOrDocsOnlyWwwAuthenticateAuthChallengeSequencingPlanVerified:
      verifyFp0126AbsentOrDocsOnlyWwwAuthenticateAuthChallengeSequencingPlan({
        planText: fp0126PlanText,
        repoPaths,
      }),
    fp0127AbsentOrLocalWwwAuthenticateAuthChallengeContractsVerified:
      verifyFp0127AbsentOrLocalWwwAuthenticateAuthChallengeContracts({
        planText: fp0127PlanText,
        repoPaths,
      }),
    fp0128AbsentOrLocalTokenValidationReadinessContractsVerified:
      verifyFp0128AbsentOrLocalTokenValidationReadinessContracts({
        planText: safeRead(FP0128_PLAN),
        repoPaths,
      }),
    fp0128TokenValidationReadinessBoundaryStillVerified:
      verifyFp0128TokenValidationReadinessContractsBoundary({
        planText: safeRead(FP0128_PLAN),
        repoPaths,
      }),
    fp0129AbsentOrDocsOnlyWwwAuthenticateChallengeImplementationSequencingPlanVerified:
      verifyFp0129AbsentOrDocsOnlyWwwAuthenticateChallengeImplementationSequencingPlan(
        {
          planText: safeRead(FP0129_PLAN),
          repoPaths,
        },
      ),
    fp0130AbsentOrLocalMissingTokenChallengeImplementationVerified:
      verifyFp0130AbsentOrLocalMissingTokenChallengeImplementation({
        planText: safeRead(FP0130_PLAN),
        repoPaths,
      }),
    fp0131Absent: verifyFp0131Absent(repoPaths),
    wwwAuthenticateChallengeImplementationSequencingPlanBoundaryVerified:
      verifyFp0129WwwAuthenticateChallengeImplementationSequencingPlanBoundary({
        planText: safeRead(FP0129_PLAN),
        repoPaths,
      }),
    wwwAuthenticateAuthChallengeContractsFoundationVerified:
      verifyFp0127WwwAuthenticateAuthChallengeContractsBoundary({
        planText: fp0127PlanText,
        repoPaths,
      }),
    wwwAuthenticateAuthChallengeSequencingBoundaryVerified:
      verifyFp0126WwwAuthenticateAuthChallengeSequencingPlanBoundary({
        planText: fp0126PlanText,
        repoPaths,
      }),
    fp0124RouteImplementationPlanningBoundaryStillVerified:
      verifyFp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlan(
        {
          planText: safeRead(FP0124_PLAN),
          repoPaths,
        },
      ),
    fp0123RouteInputEvidenceBoundaryStillVerified:
      verifyFp0123ProtectedResourceMetadataRouteInputContractsBoundary({
        planText: safeRead(FP0123_PLAN),
        repoPaths,
      }),
    fp0122ProtectedResourceMetadataBuilderBoundaryStillVerified:
      verifyFp0122ProtectedResourceMetadataBuilderContractsBoundary({
        planText: safeRead(FP0122_PLAN),
        repoPaths,
      }),
    fp0121ProtectedResourceMetadataRoutePlanningBoundaryStillVerified:
      verifyFp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanning(
        {
          planText: safeRead(FP0121_PLAN),
          repoPaths,
        },
      ) &&
      verifyFp0121ProtectedResourceMetadataRouteImplementationPlanningBoundary({
        planText: safeRead(FP0121_PLAN),
        repoPaths,
      }),
    fp0120CanonicalResourceAuthServerBoundaryStillVerified:
      verifyFp0120CanonicalResourceAuthServerPlanBoundary({
        planText: safeRead(FP0120_PLAN),
        repoPaths,
      }),
    fp0118ProtectedResourceMetadataBoundaryStillVerified:
      verifyFp0118ProtectedResourceMetadataPlanBoundary({
        planText: safeRead(FP0118_PLAN),
        repoPaths,
      }),
    fp0117OauthImplementationSequencingBoundaryStillVerified:
      verifyFp0117OauthImplementationSequencingPlanBoundary({
        planText: safeRead(FP0117_PLAN),
        repoPaths,
      }),
    fp0107RouteAdapterBoundaryStillVerified:
      docsBoundary(FP0107_PLAN, ["local-only", "post /mcp"]) &&
      countMatches(mcpRouteSource, /app\.post\("\/mcp"/gu) === 1 &&
      countMatches(mcpRouteSource, /app\.get\("\/mcp"/gu) === 1,
    fp0106ProtocolEnvelopeBoundaryStillVerified: docsBoundary(FP0106_PLAN, [
      "protocol envelope",
      "tools/call",
      "no openai api/model calls",
    ]),
    fp0100PublicSecurityBoundaryStillVerified: docsBoundary(FP0100_PLAN, [
      "public-app security boundary",
      "local/proof-only",
      "no endpoints",
    ]),
  };
}

function privateSurfaceHits(input, path = "$") {
  if (Array.isArray(input)) {
    return input.flatMap((value, index) =>
      privateSurfaceHits(value, `${path}[${index}]`),
    );
  }
  if (!input || typeof input !== "object") return [];
  return Object.entries(input).flatMap(([key, value]) => {
    const nextPath = `${path}.${key}`;
    const keyHits =
      /access_token|client_secret|companyKey|cookie|credential|generatedAdvice|generated_advice|internal|password|proof|rawFinance|raw_finance|rawSource|raw_source|refresh_token|secret|session/u.test(
        key,
      )
        ? [nextPath]
        : [];
    return [...keyHits, ...privateSurfaceHits(value, nextPath)];
  });
}

function docsBoundary(path, requiredTexts) {
  if (!repoPaths.includes(path) || !existsSync(path)) return false;
  const normalized = safeRead(path).toLowerCase().replace(/`/gu, "");
  return requiredTexts.every((requiredText) =>
    normalized.includes(requiredText),
  );
}

function changedFilePaths() {
  const dirty = execFileSync(
    "git",
    ["status", "--short", "--untracked-files=all"],
    {
      encoding: "utf8",
    },
  )
    .split("\n")
    .filter((line) => line.trim())
    .map((line) =>
      line
        .replace(/^.. /u, "")
        .replace(/.* -> /u, "")
        .trim(),
    );

  let branchDiff = [];
  try {
    branchDiff = execFileSync(
      "git",
      ["diff", "--name-only", "origin/main...HEAD"],
      {
        encoding: "utf8",
      },
    )
      .split("\n")
      .filter(Boolean);
  } catch {
    branchDiff = [];
  }

  return sortUnique([...dirty, ...branchDiff]);
}

function repoFilePaths() {
  const results = [];
  const skipped = new Set([
    ".git",
    ".next",
    ".turbo",
    "coverage",
    "dist",
    "node_modules",
  ]);

  function walk(directory, prefix = "") {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && skipped.has(entry.name)) continue;
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      const absolutePath = `${directory}/${entry.name}`;
      if (entry.isDirectory()) walk(absolutePath, relativePath);
      else results.push(relativePath);
    }
  }

  walk(process.cwd());
  return results.sort();
}

function safeRead(relativePath) {
  return readFileSync(relativePath, "utf8");
}

function countMatches(text, pattern) {
  return text.match(pattern)?.length ?? 0;
}

function sortUnique(values) {
  return [...new Set(values)].sort();
}
