import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  FP0116_REMOTE_HOST_RESOURCE_PLAN_PATH,
  MCP_PUBLIC_MCP_ENDPOINT_PATH,
  MCP_REMOTE_HOST_OWNER_FAMILIES,
  MCP_REMOTE_HOST_PREFERRED_OWNER_FAMILIES,
  McpOauthImplementationSequencingProofSchema,
  McpCanonicalResourceUriContractBoundarySchema,
  McpProtectedResourceMetadataBoundarySchema,
  McpPublicMcpEndpointPathBoundarySchema,
  McpRemoteHostOwnerDecisionBoundarySchema,
  McpRemoteHostProviderNeutralBoundarySchema,
  McpRemoteHostResourceProofSchema,
  buildMcpOauthImplementationSequencingProof,
  buildMcpRemoteHostResourceContracts,
  buildMcpRemoteHostResourceProof,
  isFp0117OauthSequencingNoOpenAiProofSourcePath,
  validateMcpCanonicalResourceUriCandidate,
  verifyFp0116RemoteHostResourcePlanBoundary,
  verifyFp0117AbsentOrDocsOnlyOauthImplementationSequencingPlan,
  verifyFp0117Absent,
  verifyFp0117OauthImplementationSequencingPlanBoundary,
  verifyFp0117OauthImplementationSequencingRepositoryInventory,
  verifyFp0117OauthSequencingNoOpenAiApiSourceScan,
  verifyFp0117PlanningTextRequiredTopics,
} from "./read-only-app-mcp-remote-host-resource";
import {
  FP0118_PROTECTED_RESOURCE_METADATA_PLAN_PATH,
  FP0119_PROTECTED_RESOURCE_METADATA_ROUTE_SEQUENCING_PLAN_PATH,
  verifyFp0118AbsentOrLocalProtectedResourceMetadataContracts,
  verifyFp0118ProtectedResourceMetadataPlanBoundary,
  verifyFp0119AbsentOrDocsOnlyProtectedResourceMetadataRouteSequencingPlan,
} from "./read-only-app-mcp-protected-resource-metadata";
import {
  FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH,
  FP0121_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLANNING_PLAN_PATH,
  verifyFp0120AbsentOrLocalCanonicalResourceAuthServerContracts,
  verifyFp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanning,
  verifyFp0121ProtectedResourceMetadataRouteImplementationPlanningBoundary,
  verifyFp0122Absent,
} from "./read-only-app-mcp-canonical-resource";
import { verifyMcpRemoteHostReadinessRepositoryInventory } from "./read-only-app-mcp-remote-host-readiness";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));

describe("FP-0116 remote host owner and resource metadata contracts", () => {
  it("accepts exactly one FP-0116 path and the docs-only FP-0117 successor path", () => {
    const repoPaths = repoFilePaths();
    const fp0116Hits = repoPaths.filter((path) => /(^|\/)FP-0116/u.test(path));
    const fp0117Hits = repoPaths.filter((path) => /(^|\/)FP-0117/u.test(path));
    const fp0116BoundaryVerified = verifyFp0116RemoteHostResourcePlanBoundary({
      planText: safeRead(FP0116_REMOTE_HOST_RESOURCE_PLAN_PATH),
      repoPaths,
    });
    const proof = buildMcpRemoteHostResourceProof({
      fp0116AbsentOrLocalRemoteHostResourceContractsVerified:
        fp0116BoundaryVerified,
      fp0116BoundaryVerified,
      fp0117Absent: verifyFp0117Absent(repoPaths),
    });

    expect(fp0116Hits).toEqual([FP0116_REMOTE_HOST_RESOURCE_PLAN_PATH]);
    expect(fp0117Hits).toEqual([
      FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
    ]);
    expect(proof.fp0116BoundaryVerified).toBe(true);
    expect(proof.fp0116AbsentOrLocalRemoteHostResourceContractsVerified).toBe(
      true,
    );
    expect(proof.fp0117Absent).toBe(true);
    expect(
      McpRemoteHostResourceProofSchema.safeParse({
        ...proof,
        fp0117Absent: false,
      }).success,
    ).toBe(false);
  });

  it("accepts exact FP-0117 through FP-0121 planning bridge while FP-0122 remains absent", () => {
    const repoPaths = repoFilePaths();
    const planText = safeRead(FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH);
    const fp0118PlanText = safeRead(FP0118_PROTECTED_RESOURCE_METADATA_PLAN_PATH);
    const fp0119PlanText = safeRead(
      FP0119_PROTECTED_RESOURCE_METADATA_ROUTE_SEQUENCING_PLAN_PATH,
    );
    const fp0120PlanText = safeRead(
      FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH,
    );
    const fp0121PlanText = safeRead(
      FP0121_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLANNING_PLAN_PATH,
    );
    const topics = verifyFp0117PlanningTextRequiredTopics(planText);
    const proof = buildMcpOauthImplementationSequencingProof({
      ...topics,
      fp0117AbsentOrDocsOnlyOauthImplementationSequencingPlanVerified:
        verifyFp0117AbsentOrDocsOnlyOauthImplementationSequencingPlan({
          planText,
          repoPaths,
        }),
      fp0118AbsentOrLocalProtectedResourceMetadataContractsVerified:
        verifyFp0118AbsentOrLocalProtectedResourceMetadataContracts({
          planText: fp0118PlanText,
          repoPaths,
        }),
      fp0119AbsentOrDocsOnlyProtectedResourceMetadataRouteSequencingPlanVerified:
        verifyFp0119AbsentOrDocsOnlyProtectedResourceMetadataRouteSequencingPlan(
          {
            planText: fp0119PlanText,
            repoPaths,
          },
        ),
      fp0120AbsentOrLocalCanonicalResourceAuthServerContractsVerified:
        verifyFp0120AbsentOrLocalCanonicalResourceAuthServerContracts({
          planText: fp0120PlanText,
          repoPaths,
        }),
      fp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanningVerified:
        verifyFp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanning(
          {
            planText: fp0121PlanText,
            repoPaths,
          },
        ),
      fp0122Absent: verifyFp0122Absent(repoPaths),
      protectedResourceMetadataRouteImplementationPlanningBoundaryVerified:
        verifyFp0121ProtectedResourceMetadataRouteImplementationPlanningBoundary(
          {
            planText: fp0121PlanText,
            repoPaths,
          },
        ),
      oauthImplementationSequencingPlanBoundaryVerified:
        verifyFp0117OauthImplementationSequencingPlanBoundary({
          planText,
          repoPaths,
        }),
      protectedResourceMetadataContractsFoundationVerified:
        verifyFp0118ProtectedResourceMetadataPlanBoundary({
          planText: fp0118PlanText,
          repoPaths,
        }),
    });

    expect(repoPaths.filter((path) => /(^|\/)FP-0117/u.test(path))).toEqual([
      FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
    ]);
    expect(repoPaths.filter((path) => /(^|\/)FP-0118/u.test(path))).toEqual([
      FP0118_PROTECTED_RESOURCE_METADATA_PLAN_PATH,
    ]);
    expect(repoPaths.filter((path) => /(^|\/)FP-0119/u.test(path))).toEqual([
      FP0119_PROTECTED_RESOURCE_METADATA_ROUTE_SEQUENCING_PLAN_PATH,
    ]);
    expect(repoPaths.filter((path) => /(^|\/)FP-0120/u.test(path))).toEqual([
      FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH,
    ]);
    expect(repoPaths.filter((path) => /(^|\/)FP-0121/u.test(path))).toEqual([
      FP0121_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLANNING_PLAN_PATH,
    ]);
    expect(repoPaths.filter((path) => /(^|\/)FP-0122/u.test(path))).toEqual([]);
    expect(
      proof.fp0117AbsentOrDocsOnlyOauthImplementationSequencingPlanVerified,
    ).toBe(true);
    expect(
      proof.fp0118AbsentOrLocalProtectedResourceMetadataContractsVerified,
    ).toBe(true);
    expect(proof.protectedResourceMetadataContractsFoundationVerified).toBe(
      true,
    );
    expect(
      proof
        .fp0119AbsentOrDocsOnlyProtectedResourceMetadataRouteSequencingPlanVerified,
    ).toBe(true);
    expect(
      proof.fp0120AbsentOrLocalCanonicalResourceAuthServerContractsVerified,
    ).toBe(true);
    expect(
      proof
        .fp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanningVerified,
    ).toBe(true);
    expect(proof.fp0122Absent).toBe(true);
    expect(
      proof.protectedResourceMetadataRouteImplementationPlanningBoundaryVerified,
    ).toBe(true);
    expect(proof.noRouteBehaviorChangeFromFp0117).toBe(true);
    expect(proof.noNewRoutePathFromFp0117).toBe(true);
    expect(proof.noProtectedResourceMetadataRouteFromFp0117).toBe(true);
    expect(proof.noWwwAuthenticateRouteBehaviorFromFp0117).toBe(true);
    expect(proof.oauthImplementationRepositoryInventoryVerified).toBe(true);
    expect(proof.tokenSessionRepositoryInventoryVerified).toBe(true);
    expect(proof.authMiddlewareRepositoryInventoryVerified).toBe(true);
    expect(
      proof.protectedResourceMetadataRouteRepositoryInventoryVerified,
    ).toBe(true);
    expect(proof.wwwAuthenticateRouteBehaviorRepositoryInventoryVerified).toBe(
      true,
    );
    expect(proof.oauthSequencingNoOpenAiApiSourceScanVerified).toBe(true);
    expect(proof.fp0117PostmergeProofDurabilityVerified).toBe(true);
    expect(proof.noOauthImplementationFromFp0117).toBe(true);
    expect(proof.noTokenSessionImplementationFromFp0117).toBe(true);
    expect(proof.noAuthMiddlewareImplementationFromFp0117).toBe(true);
    expect(proof.noRemoteMcpDeploymentFromFp0117).toBe(true);
    expect(proof.noDeploymentConfigFromFp0117).toBe(true);
    expect(proof.noAppsSdkResourceFromFp0117).toBe(true);
    expect(proof.noAppSubmissionFromFp0117).toBe(true);
    expect(proof.noDbQueriesFromFp0117).toBe(true);
    expect(proof.noSchemaMigrationsFromFp0117).toBe(true);
    expect(proof.noPackageScriptsFromFp0117).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0117).toBe(true);
    expect(proof.noProviderExternalCallsFromFp0117).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0117).toBe(true);
    expect(proof.noPublicAssetsSubmissionArtifactsFromFp0117).toBe(true);
    expect(proof.noListingCopyGeneratedPublicProseFromFp0117).toBe(true);
    expect(proof.noRouteBehaviorChangeFromFp0118).toBe(true);
    expect(proof.noNewRoutePathFromFp0118).toBe(true);
    expect(proof.noProtectedResourceMetadataRouteFromFp0118).toBe(true);
    expect(proof.noWwwAuthenticateRouteBehaviorFromFp0118).toBe(true);
    expect(proof.noOauthImplementationFromFp0118).toBe(true);
    expect(proof.noTokenSessionImplementationFromFp0118).toBe(true);
    expect(proof.noAuthMiddlewareImplementationFromFp0118).toBe(true);
    expect(proof.noRemoteMcpDeploymentFromFp0118).toBe(true);
    expect(proof.noDeploymentConfigFromFp0118).toBe(true);
    expect(proof.noAppsSdkResourceFromFp0118).toBe(true);
    expect(proof.noAppSubmissionFromFp0118).toBe(true);
    expect(proof.noDbQueriesFromFp0118).toBe(true);
    expect(proof.noSchemaMigrationsFromFp0118).toBe(true);
    expect(proof.noPackageScriptsFromFp0118).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0118).toBe(true);
    expect(proof.noProviderExternalCallsFromFp0118).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0118).toBe(true);
    expect(proof.noPublicAssetsSubmissionArtifactsFromFp0118).toBe(true);
    expect(proof.noListingCopyGeneratedPublicProseFromFp0118).toBe(true);
    expect(proof.planningTextIncludesProtectedResourceMetadata).toBe(true);
    expect(proof.planningTextIncludesWwwAuthenticateResourceMetadata).toBe(
      true,
    );
    expect(proof.planningTextIncludesAuthorizationServerDiscovery).toBe(true);
    expect(proof.planningTextIncludesScopeChallenge).toBe(true);
    expect(proof.planningTextIncludesAudienceResourceValidation).toBe(true);
    expect(proof.planningTextIncludesTokenFailureModes).toBe(true);
    expect(proof.planningTextIncludesNoTokenPassthrough).toBe(true);
    expect(proof.planningTextIncludesAuthenticatedCompanyBinding).toBe(true);
    expect(proof.fp0116RemoteHostResourceBoundaryStillVerified).toBe(true);
    expect(
      proof.fp0115RemoteHostImplementationSequencingBoundaryStillVerified,
    ).toBe(true);
    expect(proof.fp0114RemoteHostReadinessBoundaryStillVerified).toBe(true);
    expect(proof.fp0113OauthSecurityBoundaryStillVerified).toBe(true);
    expect(proof.fp0112RemotePublicOauthReadinessBoundaryStillVerified).toBe(
      true,
    );
    expect(proof.fp0111DefaultLocalDispatchWiringStillVerified).toBe(true);
    expect(proof.fp0109AdapterBoundaryStillVerified).toBe(true);
    expect(proof.fp0108DispatchContractsStillVerified).toBe(true);
    expect(proof.fp0107RouteAdapterBoundaryStillVerified).toBe(true);
    expect(proof.fp0106ProtocolEnvelopeBoundaryStillVerified).toBe(true);
    expect(proof.fp0100PublicSecurityBoundaryStillVerified).toBe(true);
    expect(
      McpOauthImplementationSequencingProofSchema.safeParse({
        ...proof,
        noOauthImplementationFromFp0117: false,
      }).success,
    ).toBe(false);
  });

  it("adds durable FP-0117 repository-inventory proof for current repo truth", () => {
    const inventory =
      verifyFp0117OauthImplementationSequencingRepositoryInventory({
        repoPaths: repoFilePaths(),
        routeSourceText: safeRead(
          "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts",
        ),
      });
    const sourceScan = verifyFp0117OauthSequencingNoOpenAiApiSourceScan({
      sourceText: readFp0117NoOpenAiProofSources(),
    });

    expect(inventory.oauthImplementationRepositoryInventoryVerified).toBe(true);
    expect(inventory.tokenSessionRepositoryInventoryVerified).toBe(true);
    expect(inventory.authMiddlewareRepositoryInventoryVerified).toBe(true);
    expect(
      inventory.protectedResourceMetadataRouteRepositoryInventoryVerified,
    ).toBe(true);
    expect(
      inventory.wwwAuthenticateRouteBehaviorRepositoryInventoryVerified,
    ).toBe(true);
    expect(sourceScan.oauthSequencingNoOpenAiApiSourceScanVerified).toBe(true);
    expect(sourceScan.forbiddenExecutableMatches).toEqual([]);
  });

  it("rejects simulated protected-resource metadata and WWW-Authenticate route surfaces", () => {
    const protectedResourceMetadataPath =
      "apps/control-plane/src/modules/read-only-app-mcp-endpoint/protected-resource-metadata/route.ts";
    const wwwAuthenticatePath =
      "apps/control-plane/src/modules/read-only-app-mcp-endpoint/www-authenticate.ts";

    expect(
      verifyFp0117OauthImplementationSequencingRepositoryInventory({
        repoPaths: [protectedResourceMetadataPath],
      }).protectedResourceMetadataRouteRepositoryInventoryVerified,
    ).toBe(false);
    expect(
      verifyFp0117OauthImplementationSequencingRepositoryInventory({
        repoPaths: [wwwAuthenticatePath],
      }).wwwAuthenticateRouteBehaviorRepositoryInventoryVerified,
    ).toBe(false);
    expect(
      verifyFp0117OauthImplementationSequencingRepositoryInventory({
        repoPaths: [],
        routeSourceText:
          'reply.header("WWW-Authenticate", "Bearer resource_metadata=...")',
      }).wwwAuthenticateRouteBehaviorRepositoryInventoryVerified,
    ).toBe(false);
  });

  it("rejects simulated OAuth, token/session, and auth middleware runtime paths", () => {
    const inventory =
      verifyFp0117OauthImplementationSequencingRepositoryInventory({
        repoPaths: [
          "apps/control-plane/src/modules/read-only-app-mcp-endpoint/oauth.ts",
          "apps/control-plane/src/modules/read-only-app-mcp-endpoint/token-session-store.ts",
          "apps/control-plane/src/modules/read-only-app-mcp-endpoint/auth-middleware.ts",
        ],
      });

    expect(inventory.oauthImplementationRepositoryInventoryVerified).toBe(
      false,
    );
    expect(inventory.tokenSessionRepositoryInventoryVerified).toBe(false);
    expect(inventory.authMiddlewareRepositoryInventoryVerified).toBe(false);
    expect(inventory.fp0117PostmergeProofDurabilityVerified).toBe(false);
  });

  it("rejects executable OpenAI import, API, model, key, and endpoint patterns while allowing safe proof text", () => {
    const openAiClientName = ["Open", "AI"].join("");
    const openAiVariable = ["open", "ai"].join("");
    const responsesCreate = ["responses", "create"].join(".");
    const chatCompletions = ["chat", "completions"].join(".");
    const modelCreate = ["model", "create"].join(".");
    const modelsCreate = ["models", "create"].join(".");
    const modelCaller = ["call", "Model"].join("");
    const forbiddenSamples = [
      `import OpenAI from ${quoted("openai")};`,
      `const sdk = require(${quoted("openai")});`,
      `const sdk = await import(${quoted("openai")});`,
      `const client = new ${openAiClientName}();`,
      `${openAiVariable}.${responsesCreate}({});`,
      `client.${responsesCreate}({});`,
      `client.${chatCompletions}.create({});`,
      `const key = process.env.${["OPENAI", "API", "KEY"].join("_")};`,
      `const url = "https://${["api", "openai", "com"].join(".")}/v1";`,
      `${modelCreate}({});`,
      `${modelsCreate}({});`,
      `${modelCaller}(input);`,
    ];

    for (const sourceText of forbiddenSamples) {
      expect(
        verifyFp0117OauthSequencingNoOpenAiApiSourceScan({
          sourceText,
        }).oauthSequencingNoOpenAiApiSourceScanVerified,
      ).toBe(false);
    }

    expect(
      verifyFp0117OauthSequencingNoOpenAiApiSourceScan({
        sourceText:
          "No OpenAI API/model/key usage is authorized in this proof text.",
      }).oauthSequencingNoOpenAiApiSourceScanVerified,
    ).toBe(true);
  });

  it("keeps host owner unresolved, blocks implementation, and prefers separate package or gateway candidates", () => {
    const contracts = buildMcpRemoteHostResourceContracts();
    const proof = buildMcpRemoteHostResourceProof();

    expect(
      contracts.remoteHostOwnerDecisionBoundary.currentLocalRouteOwner,
    ).toBe("apps/control-plane");
    expect(
      contracts.remoteHostOwnerDecisionBoundary
        .currentLocalRouteRemoteExposeableAsIs,
    ).toBe(false);
    expect(
      contracts.remoteHostOwnerDecisionBoundary.hostOwnerDecisionStatus,
    ).toBe("unresolved_hold");
    expect(
      contracts.remoteHostOwnerDecisionBoundary
        .implementationBlockedUntilOwnerNamed,
    ).toBe(true);
    expect(
      contracts.remoteHostOwnerCandidateAnalysisBoundary
        .allowedFutureHostFamilies,
    ).toEqual([...MCP_REMOTE_HOST_OWNER_FAMILIES]);
    expect(
      contracts.remoteHostOwnerCandidateAnalysisBoundary
        .preferredCandidateFamilies,
    ).toEqual([...MCP_REMOTE_HOST_PREFERRED_OWNER_FAMILIES]);
    expect(
      McpRemoteHostOwnerDecisionBoundarySchema.safeParse({
        ...contracts.remoteHostOwnerDecisionBoundary,
        implementationBlockedUntilOwnerNamed: false,
      }).success,
    ).toBe(false);
    expect(proof.remoteHostOwnerDecisionBoundaryVerified).toBe(true);
  });

  it("keeps provider neutral and rejects provider execution or deployment config", () => {
    const contracts = buildMcpRemoteHostResourceContracts();
    const proof = buildMcpRemoteHostResourceProof();

    expect(contracts.remoteHostProviderNeutralBoundary.providerNeutral).toBe(
      true,
    );
    expect(contracts.remoteHostProviderNeutralBoundary.providerSelected).toBe(
      false,
    );
    expect(
      McpRemoteHostProviderNeutralBoundarySchema.safeParse({
        ...contracts.remoteHostProviderNeutralBoundary,
        providerSelected: true,
      }).success,
    ).toBe(false);
    expect(proof.remoteHostProviderNeutralBoundaryVerified).toBe(true);
    expect(proof.noProviderCalls).toBe(true);
    expect(proof.noDeploymentConfig).toBe(true);
  });

  it("requires a canonical HTTPS resource URI and rejects placeholders, selectors, query strings, fragments, and non-/mcp paths", () => {
    const contracts = buildMcpRemoteHostResourceContracts();

    expect(
      contracts.canonicalResourceUriContractBoundary
        .canonicalResourceUriRequiredBeforeRemoteImplementation,
    ).toBe(true);
    expect(
      contracts.canonicalResourceUriContractBoundary
        .canonicalResourceUriImplemented,
    ).toBe(false);
    expect(
      validateMcpCanonicalResourceUriCandidate({
        uri: "https://mcp.pocket-cfo.app/mcp",
      }).accepted,
    ).toBe(true);

    const rejectedUris = [
      "http://mcp.pocket-cfo.app/mcp",
      "https://mcp.pocket-cfo.app/mcp?companyKey=acme",
      "https://mcp.pocket-cfo.app/mcp#fragment",
      "https://companyKey.pocket-cfo.app/mcp",
      "https://{workspace}.pocket-cfo.app/mcp",
      "https://tenant.pocket-cfo.app/mcp",
      "https://mcp.pocket-cfo.app/acme/mcp",
      "https://mcp.pocket-cfo.app/not-mcp",
      "https://localhost/mcp",
      "https://example.com/mcp",
    ];

    for (const uri of rejectedUris) {
      expect(
        validateMcpCanonicalResourceUriCandidate({
          rejectedSelectorTokens: ["acme"],
          uri,
        }).accepted,
      ).toBe(false);
    }
    expect(
      McpCanonicalResourceUriContractBoundarySchema.safeParse({
        ...contracts.canonicalResourceUriContractBoundary,
        queryStringAllowed: true,
      }).success,
    ).toBe(false);
  });

  it("keeps public /mcp as the only future public MCP endpoint path without changing route behavior", () => {
    const contracts = buildMcpRemoteHostResourceContracts();
    const proof = buildMcpRemoteHostResourceProof();

    expect(
      contracts.publicMcpEndpointPathBoundary.onlyFuturePublicMcpEndpointPath,
    ).toBe(MCP_PUBLIC_MCP_ENDPOINT_PATH);
    expect(contracts.publicMcpEndpointPathBoundary.routePathAdded).toBe(false);
    expect(
      McpPublicMcpEndpointPathBoundarySchema.safeParse({
        ...contracts.publicMcpEndpointPathBoundary,
        onlyFuturePublicMcpEndpointPath: "/mcp/public",
      }).success,
    ).toBe(false);
    expect(proof.noRouteBehaviorChange).toBe(true);
    expect(proof.noNewRoutePath).toBe(true);
  });

  it("requires protected-resource metadata, resource metadata challenge behavior, auth-server discovery, scope challenge, and audience/resource validation", () => {
    const contracts = buildMcpRemoteHostResourceContracts();
    const proof = buildMcpRemoteHostResourceProof();

    expect(
      contracts.protectedResourceMetadataBoundary
        .protectedResourceMetadataRequiredBeforePublicExposure,
    ).toBe(true);
    expect(
      contracts.wwwAuthenticateResourceMetadataBoundary
        .wwwAuthenticateResourceMetadataRequired,
    ).toBe(true);
    expect(
      contracts.authorizationServerDiscoveryBoundary
        .authorizationServerDiscoveryRequired,
    ).toBe(true);
    expect(
      contracts.scopeChallengeBoundary.scopeChallengeHandlingRequired,
    ).toBe(true);
    expect(
      contracts.audienceResourceValidationPrerequisiteBoundary
        .audienceResourceValidationRequired,
    ).toBe(true);
    expect(
      McpProtectedResourceMetadataBoundarySchema.safeParse({
        ...contracts.protectedResourceMetadataBoundary,
        protectedResourceMetadataImplemented: true,
      }).success,
    ).toBe(false);
    expect(proof.protectedResourceMetadataBoundaryVerified).toBe(true);
    expect(proof.wwwAuthenticateResourceMetadataBoundaryVerified).toBe(true);
    expect(proof.authorizationServerDiscoveryBoundaryVerified).toBe(true);
    expect(proof.scopeChallengeBoundaryVerified).toBe(true);
    expect(proof.audienceResourceValidationPrerequisiteBoundaryVerified).toBe(
      true,
    );
  });

  it("requires authenticated company binding and rejects workspace or tenant URL authority", () => {
    const contracts = buildMcpRemoteHostResourceContracts();
    const proof = buildMcpRemoteHostResourceProof();

    expect(
      contracts.authenticatedCompanyBindingPrerequisiteBoundary
        .authenticatedSecurityBoundaryRequired,
    ).toBe(true);
    expect(
      contracts.authenticatedCompanyBindingPrerequisiteBoundary
        .unauthenticatedCompanyKeyAuthorityAllowed,
    ).toBe(false);
    expect(
      contracts.workspaceTenantUrlRejectedBoundary
        .workspaceTenantTemplateUrlAllowed,
    ).toBe(false);
    expect(proof.authenticatedCompanyBindingPrerequisiteBoundaryVerified).toBe(
      true,
    );
    expect(proof.workspaceTenantUrlRejectedBoundaryVerified).toBe(true);
  });

  it("keeps local tunnel preview development-only and preserves no-runtime/no-deployment scope", () => {
    const contracts = buildMcpRemoteHostResourceContracts();
    const proof = buildMcpRemoteHostResourceProof();

    expect(
      contracts.localTunnelPreviewOnlyBoundary
        .localTunnelPreviewDevelopmentOnly,
    ).toBe(true);
    expect(
      contracts.localTunnelPreviewOnlyBoundary
        .localTunnelCountsAsPublicDeploymentProof,
    ).toBe(false);
    expect(proof.localTunnelPreviewOnlyBoundaryVerified).toBe(true);
    expect(proof.remoteHostNoRuntimeBoundaryVerified).toBe(true);
    expect(proof.noRemoteMcpDeployment).toBe(true);
    expect(proof.noOauthImplementation).toBe(true);
    expect(proof.noTokenSessionImplementation).toBe(true);
    expect(proof.noAuthMiddlewareImplementation).toBe(true);
    expect(proof.noAppsSdkResourceImplementation).toBe(true);
    expect(proof.noDbQueriesAdded).toBe(true);
    expect(proof.noSchemaMigrationsAdded).toBe(true);
    expect(proof.noPackageScriptsAdded).toBe(true);
    expect(proof.noPublicAssets).toBe(true);
    expect(proof.noListingCopy).toBe(true);
    expect(proof.noGeneratedPublicProse).toBe(true);
    expect(proof.noOpenAiApiCalls).toBe(true);
    expect(proof.noModelCalls).toBe(true);
    expect(proof.noProviderCalls).toBe(true);
    expect(proof.noSourceMutation).toBe(true);
    expect(proof.noFinanceWrite).toBe(true);
  });

  it("tightens durable repository-inventory scan for unsafe markdown, remote runtime, deployment config, and public assets while allowing known safe docs", () => {
    const currentInventory = verifyMcpRemoteHostReadinessRepositoryInventory({
      proofSourceText: readRemoteHostReadinessSources(),
      repoPaths: repoFilePaths(),
    });
    expect(
      currentInventory.fp0114RemoteHostReadinessPostmergeProofDurabilityVerified,
    ).toBe(true);

    const safeDocs = [
      "docs/ACTIVE_DOCS.md",
      FP0116_REMOTE_HOST_RESOURCE_PLAN_PATH,
      "README.md",
    ];
    for (const path of safeDocs) {
      expect(
        verifyMcpRemoteHostReadinessRepositoryInventory({
          repoPaths: [path],
        }).fp0114RemoteHostReadinessPostmergeProofDurabilityVerified,
      ).toBe(true);
    }

    const unsafePaths = [
      "public-host.md",
      "remote-host-config.md",
      "generated-public-prose.md",
      "listing-copy.md",
      "submission-assets/app-description.md",
      "apps/web/public/listing-copy/generated-public-prose.md",
      "apps/remote-mcp-server/src/server.ts",
      "vercel.json",
    ];
    for (const path of unsafePaths) {
      expect(
        verifyMcpRemoteHostReadinessRepositoryInventory({
          repoPaths: [path],
        }).fp0114RemoteHostReadinessPostmergeProofDurabilityVerified,
      ).toBe(false);
    }
  });

  it("keeps prior FP-0115, FP-0114, FP-0113, FP-0112, FP-0111, FP-0109, FP-0108, FP-0107, FP-0106, and FP-0100 boundaries intact", () => {
    const proof = buildMcpRemoteHostResourceProof();

    expect(McpRemoteHostResourceProofSchema.safeParse(proof).success).toBe(
      true,
    );
    expect(
      proof.fp0115RemoteHostImplementationSequencingBoundaryStillVerified,
    ).toBe(true);
    expect(proof.fp0114RemoteHostReadinessBoundaryStillVerified).toBe(true);
    expect(proof.fp0113OauthSecurityBoundaryStillVerified).toBe(true);
    expect(proof.fp0112RemotePublicOauthReadinessBoundaryStillVerified).toBe(
      true,
    );
    expect(proof.fp0111DefaultLocalDispatchWiringStillVerified).toBe(true);
    expect(proof.fp0109AdapterBoundaryStillVerified).toBe(true);
    expect(proof.fp0108DispatchContractsStillVerified).toBe(true);
    expect(proof.fp0107RouteAdapterBoundaryStillVerified).toBe(true);
    expect(proof.fp0106ProtocolEnvelopeBoundaryStillVerified).toBe(true);
    expect(proof.fp0100PublicSecurityBoundaryStillVerified).toBe(true);
  });
});

function safeRead(path: string) {
  try {
    return readFileSync(join(repoRoot, path), "utf8");
  } catch {
    return "";
  }
}

function readRemoteHostReadinessSources() {
  return repoFilePaths()
    .filter((path) =>
      /^packages\/domain\/src\/read-only-app-mcp-remote-host-readiness.*\.ts$/u.test(
        path,
      ),
    )
    .map(safeRead)
    .join("\n");
}

function readFp0117NoOpenAiProofSources() {
  return repoFilePaths()
    .filter(isFp0117OauthSequencingNoOpenAiProofSourcePath)
    .map(safeRead)
    .join("\n");
}

function quoted(value: string) {
  return `"${value}"`;
}

function repoFilePaths() {
  const results: string[] = [];
  const skippedDirectories = new Set([
    ".git",
    ".next",
    ".turbo",
    "coverage",
    "dist",
    "node_modules",
  ]);

  function walk(directory: string, prefix = "") {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && skippedDirectories.has(entry.name)) continue;
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      const absolutePath = join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(absolutePath, relativePath);
      } else {
        results.push(relativePath);
      }
    }
  }

  walk(repoRoot);
  return results.sort();
}
