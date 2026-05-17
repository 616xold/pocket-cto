import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  FP0118_PROTECTED_RESOURCE_METADATA_PLAN_PATH,
  FP0119_PROTECTED_RESOURCE_METADATA_ROUTE_SEQUENCING_PLAN_PATH,
  FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH,
  FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
  FP0126_WWW_AUTHENTICATE_AUTH_CHALLENGE_SEQUENCING_PLAN_PATH,
  MCP_PROTECTED_RESOURCE_METADATA_KNOWN_SAFE_ROUTE_LIKE_PATHS,
  MCP_PROTECTED_RESOURCE_METADATA_OPTIONAL_FP0125_ROUTE_LIKE_PATHS,
  MCP_PROTECTED_RESOURCE_METADATA_BEARER_METHODS,
  MCP_PROTECTED_RESOURCE_METADATA_TOKEN_LEAKAGE_SURFACES,
  MCP_PROTECTED_RESOURCE_TOKEN_FAILURE_MODES,
  McpNoTokenLeakageMetadataBoundarySchema,
  McpProtectedResourceAuthorizationServersBoundarySchema,
  McpProtectedResourceBearerMethodsBoundarySchema,
  McpProtectedResourceCanonicalUriDependencyBoundarySchema,
  McpProtectedResourceMetadataDocumentBoundarySchema,
  McpProtectedResourceMetadataProofSchema,
  McpProtectedResourceNoRuntimeBoundarySchema,
  McpProtectedResourceRouteDeferredBoundarySchema,
  McpProtectedResourceScopesBoundarySchema,
  McpScopeChallengeReadinessBoundarySchema,
  McpTokenFailureChallengeBoundarySchema,
  McpWwwAuthenticateChallengeBoundarySchema,
  McpWwwAuthenticateRouteDeferredBoundarySchema,
  buildMcpProtectedResourceMetadataContracts,
  buildMcpProtectedResourceMetadataProof,
  isFp0118ProtectedResourceMetadataNoOpenAiProofSourcePath,
  listMcpProtectedResourceMetadataRouteLikeRepositoryPaths,
  textHasProtectedResourceTokenLeakage,
  validateMcpProtectedResourceCanonicalUriCandidate,
  validateMcpProtectedResourceMetadataDocumentCandidate,
  validateMcpProtectedResourceScopes,
  verifyFp0118AbsentOrLocalProtectedResourceMetadataContracts,
  verifyFp0118ProtectedResourceMetadataPlanBoundary,
  verifyFp0119AbsentOrDocsOnlyProtectedResourceMetadataRouteSequencingPlan,
  verifyFp0119PlanningTextRequiredTopics,
  verifyFp0119ProtectedResourceMetadataRouteSequencingPlanBoundary,
  verifyFp0122AbsentOrLocalProtectedResourceMetadataBuilderContracts,
  verifyFp0122ProtectedResourceMetadataBuilderContractsBoundary,
  verifyFp0123AbsentOrLocalProtectedResourceMetadataRouteInputContracts,
  verifyFp0123ProtectedResourceMetadataRouteInputContractsBoundary,
  verifyFp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlan,
  verifyFp0126AbsentOrDocsOnlyWwwAuthenticateAuthChallengeSequencingPlan,
  verifyFp0126PlanningTextRequiredTopics,
  verifyFp0126WwwAuthenticateAuthChallengeSequencingPlanBoundary,
  verifyMcpProtectedResourceMetadataNoOpenAiApiSourceScan,
  verifyMcpProtectedResourceMetadataRepositoryInventory,
} from "./read-only-app-mcp-protected-resource-metadata";
import {
  FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH,
  verifyFp0127AbsentOrLocalWwwAuthenticateAuthChallengeContracts,
  verifyFp0127WwwAuthenticateAuthChallengeContractsBoundary,
  verifyFp0128Absent,
} from "./read-only-app-mcp-www-authenticate";
import {
  FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH,
  FP0121_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLANNING_PLAN_PATH,
  verifyFp0120AbsentOrLocalCanonicalResourceAuthServerContracts,
  verifyFp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanning,
  verifyFp0121PlanningTextRequiredTopics,
  verifyFp0121ProtectedResourceMetadataRouteImplementationPlanningBoundary,
} from "./read-only-app-mcp-canonical-resource";
import {
  FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  verifyFp0117AbsentOrDocsOnlyOauthImplementationSequencingPlan,
  verifyFp0117OauthImplementationSequencingPlanBoundary,
} from "./read-only-app-mcp-remote-host-resource";

const fp0123RouteInputSourceScanExcludedPaths = new Set([
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input-inventory-rules.ts",
  "tools/read-only-mcp-protected-resource-metadata-route-input-proof.mjs",
]);

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));

function verified(value: boolean): true {
  expect(value).toBe(true);
  return true;
}

describe("FP-0118 protected-resource metadata auth challenge readiness contracts", () => {
  it("accepts exact FP-0118 through FP-0123 route-input paths while FP-0124 remains absent", () => {
    const repoPaths = repoFilePaths();
    const fp0118Hits = repoPaths.filter((path) => /(^|\/)FP-0118/u.test(path));
    const fp0119Hits = repoPaths.filter((path) => /(^|\/)FP-0119/u.test(path));
    const fp0120Hits = repoPaths.filter((path) => /(^|\/)FP-0120/u.test(path));
    const fp0121Hits = repoPaths.filter((path) => /(^|\/)FP-0121/u.test(path));
    const fp0122Hits = repoPaths.filter((path) => /(^|\/)FP-0122/u.test(path));
    const planText = safeRead(FP0118_PROTECTED_RESOURCE_METADATA_PLAN_PATH);
    const fp0119PlanText = safeRead(
      FP0119_PROTECTED_RESOURCE_METADATA_ROUTE_SEQUENCING_PLAN_PATH,
    );
    const fp0120PlanText = safeRead(
      FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH,
    );
    const fp0121PlanText = safeRead(
      FP0121_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLANNING_PLAN_PATH,
    );
    const fp0122PlanText = safeRead(
      FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH,
    );
    const fp0123PlanText = safeRead(
      FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
    );
    const fp0123Hits = repoPaths.filter((path) => /(^|\/)FP-0123/u.test(path));
    const proof = buildMcpProtectedResourceMetadataProof({
      fp0118AbsentOrLocalProtectedResourceMetadataContractsVerified: verified(
        verifyFp0118AbsentOrLocalProtectedResourceMetadataContracts({
          planText,
          repoPaths,
        }),
      ),
      fp0118BoundaryVerified: verified(
        verifyFp0118ProtectedResourceMetadataPlanBoundary({
          planText,
          repoPaths,
        }),
      ),
      fp0119AbsentOrDocsOnlyProtectedResourceMetadataRouteSequencingPlanVerified:
        verified(
          verifyFp0119AbsentOrDocsOnlyProtectedResourceMetadataRouteSequencingPlan(
            {
              planText: fp0119PlanText,
              repoPaths,
            },
          ),
        ),
      fp0120AbsentOrLocalCanonicalResourceAuthServerContractsVerified: verified(
        verifyFp0120AbsentOrLocalCanonicalResourceAuthServerContracts({
          planText: fp0120PlanText,
          repoPaths,
        }),
      ),
      fp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanningVerified:
        verified(
          verifyFp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanning(
            {
              planText: fp0121PlanText,
              repoPaths,
            },
          ),
        ),
      fp0122AbsentOrLocalProtectedResourceMetadataBuilderContractsVerified:
        verified(
          verifyFp0122AbsentOrLocalProtectedResourceMetadataBuilderContracts({
            planText: fp0122PlanText,
            repoPaths,
          }),
        ),
      fp0123AbsentOrLocalProtectedResourceMetadataRouteInputContractsVerified:
        verified(
          verifyFp0123AbsentOrLocalProtectedResourceMetadataRouteInputContracts(
            {
              planText: fp0123PlanText,
              repoPaths,
            },
          ),
        ),
      fp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanVerified:
        verified(
          verifyFp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlan(
            repoPaths,
          ),
        ),
      protectedResourceMetadataBuilderContractsFoundationVerified: verified(
        verifyFp0122ProtectedResourceMetadataBuilderContractsBoundary({
          planText: fp0122PlanText,
          repoPaths,
        }),
      ),
      protectedResourceMetadataRouteImplementationPlanningBoundaryVerified:
        verified(
          verifyFp0121ProtectedResourceMetadataRouteImplementationPlanningBoundary(
            {
              planText: fp0121PlanText,
              repoPaths,
            },
          ),
        ),
      protectedResourceMetadataRouteSequencingPlanBoundaryVerified: verified(
        verifyFp0119ProtectedResourceMetadataRouteSequencingPlanBoundary({
          planText: fp0119PlanText,
          repoPaths,
        }),
      ),
    });

    expect(fp0118Hits).toEqual([FP0118_PROTECTED_RESOURCE_METADATA_PLAN_PATH]);
    expect(fp0119Hits).toEqual([
      FP0119_PROTECTED_RESOURCE_METADATA_ROUTE_SEQUENCING_PLAN_PATH,
    ]);
    expect(fp0120Hits).toEqual([
      FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH,
    ]);
    expect(fp0121Hits).toEqual([
      FP0121_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLANNING_PLAN_PATH,
    ]);
    expect(fp0122Hits).toEqual([
      FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH,
    ]);
    expect(fp0123Hits).toEqual([
      FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
    ]);
    expect(proof.fp0118BoundaryVerified).toBe(true);
    expect(
      proof.fp0118AbsentOrLocalProtectedResourceMetadataContractsVerified,
    ).toBe(true);
    expect(
      proof.fp0119AbsentOrDocsOnlyProtectedResourceMetadataRouteSequencingPlanVerified,
    ).toBe(true);
    expect(
      proof.fp0120AbsentOrLocalCanonicalResourceAuthServerContractsVerified,
    ).toBe(true);
    expect(
      proof.fp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanningVerified,
    ).toBe(true);
    expect(
      proof.fp0122AbsentOrLocalProtectedResourceMetadataBuilderContractsVerified,
    ).toBe(true);
    expect(
      proof.fp0123AbsentOrLocalProtectedResourceMetadataRouteInputContractsVerified,
    ).toBe(true);
    expect(
      proof.fp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanVerified,
    ).toBe(true);
    expect(
      verifyFp0123ProtectedResourceMetadataRouteInputContractsBoundary({
        planText: fp0123PlanText,
        repoPaths,
      }),
    ).toBe(true);
    expect(
      proof.protectedResourceMetadataBuilderContractsFoundationVerified,
    ).toBe(true);
    expect(
      proof.protectedResourceMetadataRouteImplementationPlanningBoundaryVerified,
    ).toBe(true);
    expect(
      Object.values(
        verifyFp0121PlanningTextRequiredTopics(fp0121PlanText),
      ).every(Boolean),
    ).toBe(true);
    expect(
      proof.protectedResourceMetadataRouteSequencingPlanBoundaryVerified,
    ).toBe(true);
    expect(
      McpProtectedResourceMetadataProofSchema.safeParse({
        ...proof,
        fp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanVerified: false,
      }).success,
    ).toBe(false);
  });

  it("accepts FP-0126 sequencing plus exact FP-0127 local WWW-Authenticate contracts while FP-0128 remains absent", () => {
    const repoPaths = repoFilePaths();
    const planText = safeRead(
      FP0126_WWW_AUTHENTICATE_AUTH_CHALLENGE_SEQUENCING_PLAN_PATH,
    );
    const fp0127PlanText = safeRead(
      FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH,
    );
    const fp0126Hits = repoPaths.filter((path) => /(^|\/)FP-0126/u.test(path));
    const fp0127Hits = repoPaths.filter((path) => /(^|\/)FP-0127/u.test(path));
    const topics = verifyFp0126PlanningTextRequiredTopics(planText);
    const proof = buildMcpProtectedResourceMetadataProof({
      fp0126AbsentOrDocsOnlyWwwAuthenticateAuthChallengeSequencingPlanVerified:
        verified(
          verifyFp0126AbsentOrDocsOnlyWwwAuthenticateAuthChallengeSequencingPlan(
            {
              planText,
              repoPaths,
            },
          ),
        ),
      fp0127AbsentOrLocalWwwAuthenticateAuthChallengeContractsVerified:
        verified(
          verifyFp0127AbsentOrLocalWwwAuthenticateAuthChallengeContracts({
            planText: fp0127PlanText,
            repoPaths,
          }),
        ),
      fp0128Absent: verified(verifyFp0128Absent(repoPaths)),
      wwwAuthenticateAuthChallengeContractsFoundationVerified: verified(
        verifyFp0127WwwAuthenticateAuthChallengeContractsBoundary({
          planText: fp0127PlanText,
          repoPaths,
        }),
      ),
      wwwAuthenticateAuthChallengeSequencingBoundaryVerified: verified(
        verifyFp0126WwwAuthenticateAuthChallengeSequencingPlanBoundary({
          planText,
          repoPaths,
        }),
      ),
    });

    expect(fp0126Hits).toEqual([
      FP0126_WWW_AUTHENTICATE_AUTH_CHALLENGE_SEQUENCING_PLAN_PATH,
    ]);
    expect(fp0127Hits).toEqual([
      FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH,
    ]);
    expect(Object.values(topics).every(Boolean)).toBe(true);
    expect(
      proof.fp0126AbsentOrDocsOnlyWwwAuthenticateAuthChallengeSequencingPlanVerified,
    ).toBe(true);
    expect(
      proof.fp0127AbsentOrLocalWwwAuthenticateAuthChallengeContractsVerified,
    ).toBe(true);
    expect(proof.fp0128Absent).toBe(true);
    expect(
      proof.wwwAuthenticateAuthChallengeContractsFoundationVerified,
    ).toBe(true);
    expect(proof.wwwAuthenticateAuthChallengeSequencingBoundaryVerified).toBe(
      true,
    );
    expect(proof.noMcpRouteBehaviorChangeFromFp0126).toBe(true);
    expect(proof.noWwwAuthenticateBehaviorFromFp0126).toBe(true);
    expect(proof.noOauthImplementationFromFp0126).toBe(true);
    expect(proof.noTokenSessionImplementationFromFp0126).toBe(true);
    expect(proof.noAuthMiddlewareImplementationFromFp0126).toBe(true);
    expect(proof.noRemoteMcpDeploymentFromFp0126).toBe(true);
    expect(proof.noDeploymentConfigFromFp0126).toBe(true);
    expect(proof.noAppsSdkResourceFromFp0126).toBe(true);
    expect(proof.noAppSubmissionFromFp0126).toBe(true);
    expect(proof.noDbQueriesFromFp0126).toBe(true);
    expect(proof.noSchemaMigrationsFromFp0126).toBe(true);
    expect(proof.noPackageScriptsFromFp0126).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0126).toBe(true);
    expect(proof.noProviderExternalCallsFromFp0126).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0126).toBe(true);
    expect(proof.noPublicAssetsSubmissionArtifactsFromFp0126).toBe(true);
    expect(proof.noMcpRouteBehaviorChangeFromFp0127).toBe(true);
    expect(
      proof.noProtectedResourceMetadataRouteBehaviorChangeFromFp0127,
    ).toBe(true);
    expect(proof.noWwwAuthenticateRouteBehaviorFromFp0127).toBe(true);
    expect(proof.noTokenValidationImplementationFromFp0127).toBe(true);
    expect(proof.noOauthImplementationFromFp0127).toBe(true);
    expect(proof.noTokenSessionImplementationFromFp0127).toBe(true);
    expect(proof.noAuthMiddlewareImplementationFromFp0127).toBe(true);
    expect(proof.noRemoteMcpDeploymentFromFp0127).toBe(true);
    expect(proof.noDeploymentConfigFromFp0127).toBe(true);
    expect(proof.noAppsSdkResourceFromFp0127).toBe(true);
    expect(proof.noAppSubmissionFromFp0127).toBe(true);
    expect(proof.noDbQueriesFromFp0127).toBe(true);
    expect(proof.noSchemaMigrationsFromFp0127).toBe(true);
    expect(proof.noPackageScriptsFromFp0127).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0127).toBe(true);
    expect(proof.noProviderExternalCallsFromFp0127).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0127).toBe(true);
    expect(proof.noPublicAssetsSubmissionArtifactsFromFp0127).toBe(true);
    expect(proof.noListingCopyGeneratedPublicProseFromFp0127).toBe(true);
    expect(
      verifyFp0126AbsentOrDocsOnlyWwwAuthenticateAuthChallengeSequencingPlan({
        planText,
        repoPaths: [
          ...repoPaths,
          "plans/FP-0126-duplicate-auth-challenge-plan.md",
        ],
      }),
    ).toBe(false);
    expect(
      verifyFp0127AbsentOrLocalWwwAuthenticateAuthChallengeContracts({
        planText: fp0127PlanText,
        repoPaths: [
          ...repoPaths,
          "plans/FP-0127-read-only-chatgpt-app-mcp-www-authenticate-implementation.md",
        ],
      }),
    ).toBe(false);
    expect(
      McpProtectedResourceMetadataProofSchema.safeParse({
        ...proof,
        noWwwAuthenticateBehaviorFromFp0126: false,
      }).success,
    ).toBe(false);
  });

  it("proves FP-0121 is docs-and-plan route implementation readiness only", () => {
    const proof = buildMcpProtectedResourceMetadataProof();

    expect(
      proof.fp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanningVerified,
    ).toBe(true);
    expect(
      proof.fp0122AbsentOrLocalProtectedResourceMetadataBuilderContractsVerified,
    ).toBe(true);
    expect(
      proof.fp0123AbsentOrLocalProtectedResourceMetadataRouteInputContractsVerified,
    ).toBe(true);
    expect(
      proof.fp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanVerified,
    ).toBe(true);
    expect(
      proof.protectedResourceMetadataBuilderContractsFoundationVerified,
    ).toBe(true);
    expect(
      proof.protectedResourceMetadataRouteImplementationPlanningBoundaryVerified,
    ).toBe(true);
    expect(proof.noRouteBehaviorChangeFromFp0121).toBe(true);
    expect(proof.noNewRoutePathFromFp0121).toBe(true);
    expect(proof.noProtectedResourceMetadataRouteFromFp0121).toBe(true);
    expect(proof.noWwwAuthenticateRouteBehaviorFromFp0121).toBe(true);
    expect(proof.noOauthImplementationFromFp0121).toBe(true);
    expect(proof.noTokenSessionImplementationFromFp0121).toBe(true);
    expect(proof.noAuthMiddlewareImplementationFromFp0121).toBe(true);
    expect(proof.noRemoteMcpDeploymentFromFp0121).toBe(true);
    expect(proof.noDeploymentConfigFromFp0121).toBe(true);
    expect(proof.noAppsSdkResourceFromFp0121).toBe(true);
    expect(proof.noPublicAppImplementationFromFp0121).toBe(true);
    expect(proof.noAppSubmissionFromFp0121).toBe(true);
    expect(proof.noDbQueriesFromFp0121).toBe(true);
    expect(proof.noSchemaMigrationsFromFp0121).toBe(true);
    expect(proof.noPackageScriptsFromFp0121).toBe(true);
    expect(proof.noFixturesSampleDataSourcePacksFromFp0121).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0121).toBe(true);
    expect(proof.noProviderExternalCallsFromFp0121).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0121).toBe(true);
    expect(proof.noPublicAssetsSubmissionArtifactsFromFp0121).toBe(true);
    expect(proof.noListingCopyGeneratedPublicProseFromFp0121).toBe(true);
    expect(proof.fp0120CanonicalResourceAuthServerBoundaryStillVerified).toBe(
      true,
    );
    expect(
      McpProtectedResourceMetadataProofSchema.safeParse({
        ...proof,
        noProtectedResourceMetadataRouteFromFp0121: false,
      }).success,
    ).toBe(false);
  });

  it("proves FP-0119 is docs-and-plan route sequencing only", () => {
    const planText = safeRead(
      FP0119_PROTECTED_RESOURCE_METADATA_ROUTE_SEQUENCING_PLAN_PATH,
    );
    const topics = verifyFp0119PlanningTextRequiredTopics(planText);
    const proof = buildMcpProtectedResourceMetadataProof({
      ...fp0119NoRuntimeScope(),
      protectedResourceMetadataRouteSequencingPlanBoundaryVerified: verified(
        verifyFp0119ProtectedResourceMetadataRouteSequencingPlanBoundary({
          planText,
          repoPaths: repoFilePaths(),
        }),
      ),
    });

    expect(Object.values(topics).every(Boolean)).toBe(true);
    expect(
      proof.protectedResourceMetadataRouteSequencingPlanBoundaryVerified,
    ).toBe(true);
    expect(proof.noRouteBehaviorChangeFromFp0119).toBe(true);
    expect(proof.noNewRoutePathFromFp0119).toBe(true);
    expect(proof.noProtectedResourceMetadataRouteFromFp0119).toBe(true);
    expect(proof.noWwwAuthenticateRouteBehaviorFromFp0119).toBe(true);
    expect(proof.noOauthImplementationFromFp0119).toBe(true);
    expect(proof.noTokenSessionImplementationFromFp0119).toBe(true);
    expect(proof.noAuthMiddlewareImplementationFromFp0119).toBe(true);
    expect(proof.noRemoteMcpDeploymentFromFp0119).toBe(true);
    expect(proof.noDeploymentConfigFromFp0119).toBe(true);
    expect(proof.noAppsSdkResourceFromFp0119).toBe(true);
    expect(proof.noAppSubmissionFromFp0119).toBe(true);
    expect(proof.noDbQueriesFromFp0119).toBe(true);
    expect(proof.noSchemaMigrationsFromFp0119).toBe(true);
    expect(proof.noPackageScriptsFromFp0119).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0119).toBe(true);
    expect(proof.noProviderExternalCallsFromFp0119).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0119).toBe(true);
    expect(proof.noPublicAssetsSubmissionArtifactsFromFp0119).toBe(true);
    expect(proof.noListingCopyGeneratedPublicProseFromFp0119).toBe(true);
  });

  it("keeps FP-0118 local/proof-only and rejects route/runtime implementation scope", () => {
    const contracts = buildMcpProtectedResourceMetadataContracts();
    const proof = buildMcpProtectedResourceMetadataProof();

    expect(
      McpProtectedResourceMetadataProofSchema.safeParse(proof).success,
    ).toBe(true);
    expect(proof.localProofOnly).toBe(true);
    expect(proof.noRouteBehaviorChange).toBe(true);
    expect(proof.noNewRoutePath).toBe(true);
    expect(proof.noProtectedResourceMetadataRouteImplementation).toBe(true);
    expect(proof.noWwwAuthenticateRouteBehaviorImplementation).toBe(true);
    expect(proof.noOauthImplementation).toBe(true);
    expect(proof.noTokenSessionImplementation).toBe(true);
    expect(proof.noAuthMiddlewareImplementation).toBe(true);
    expect(proof.noRemoteMcpDeployment).toBe(true);
    expect(proof.noDeploymentConfig).toBe(true);
    expect(proof.noAppsSdkResourceImplementation).toBe(true);
    expect(proof.noAppSubmission).toBe(true);
    expect(proof.noDbQueriesAdded).toBe(true);
    expect(proof.noSchemaMigrationsAdded).toBe(true);
    expect(proof.noPackageScriptsAdded).toBe(true);
    expect(proof.noPublicAssets).toBe(true);
    expect(proof.noListingCopy).toBe(true);
    expect(proof.noGeneratedPublicProse).toBe(true);
    expect(proof.noOpenAiApiCalls).toBe(true);
    expect(proof.noModelCalls).toBe(true);
    expect(proof.noOpenAiClientOrKeyUsage).toBe(true);
    expect(proof.noProviderCalls).toBe(true);
    expect(proof.noExternalCommunications).toBe(true);
    expect(proof.noSourceMutation).toBe(true);
    expect(proof.noFinanceWrite).toBe(true);
    expect(
      McpProtectedResourceNoRuntimeBoundarySchema.safeParse(
        contracts.noRuntimeBoundary,
      ).success,
    ).toBe(true);
  });

  it("requires the protected-resource metadata document fields and canonical public resource URI dependency", () => {
    const contracts = buildMcpProtectedResourceMetadataContracts();
    const validDocument = {
      authorization_servers: ["https://auth.pocket-cfo.test"],
      bearer_methods_supported: ["header"],
      resource: "https://mcp.pocket-cfo.test/mcp",
      scopes_supported: ["pocket-cfo:evidence.read"],
    };

    expect(
      McpProtectedResourceMetadataDocumentBoundarySchema.safeParse(
        contracts.documentBoundary,
      ).success,
    ).toBe(true);
    expect(contracts.documentBoundary.requiredMetadataFields).toEqual([
      "resource",
      "authorization_servers",
      "scopes_supported",
      "bearer_methods_supported",
    ]);
    expect(
      validateMcpProtectedResourceMetadataDocumentCandidate(validDocument)
        .metadataDocumentVerified,
    ).toBe(true);
    expect(
      validateMcpProtectedResourceMetadataDocumentCandidate({
        ...validDocument,
        bearer_methods_supported: ["header", "query"],
      }).bearerMethodsHeaderNoQueryVerified,
    ).toBe(false);
    expect(
      validateMcpProtectedResourceMetadataDocumentCandidate({
        ...validDocument,
        authorization_servers: [],
      }).authorizationServersNonEmptyVerified,
    ).toBe(false);
    expect(
      validateMcpProtectedResourceMetadataDocumentCandidate({
        ...validDocument,
        resource: "http://127.0.0.1:3000/mcp",
      }).resourceCanonicalUriDependencyVerified,
    ).toBe(false);
  });

  it("rejects placeholder, local, selector, query, fragment, and non-/mcp resource URI candidates", () => {
    expect(
      validateMcpProtectedResourceCanonicalUriCandidate(
        "https://mcp.pocket-cfo.test/mcp",
      ).canonicalResourceUriCandidateVerified,
    ).toBe(true);

    for (const resource of [
      "https://example.com/mcp",
      "http://mcp.pocket-cfo.test/mcp",
      "https://localhost:3000/mcp",
      "https://mcp.pocket-cfo.test/mcp?companyKey=acme",
      "https://mcp.pocket-cfo.test/mcp#fragment",
      "https://mcp.pocket-cfo.test/{tenant}/mcp",
      "https://mcp.pocket-cfo.test/other",
    ]) {
      expect(
        validateMcpProtectedResourceCanonicalUriCandidate(resource)
          .canonicalResourceUriCandidateVerified,
      ).toBe(false);
    }

    expect(
      McpProtectedResourceCanonicalUriDependencyBoundarySchema.safeParse({
        ...buildMcpProtectedResourceMetadataContracts()
          .canonicalUriDependencyBoundary,
        placeholderResourceAllowed: true,
      }).success,
    ).toBe(false);
  });

  it("keeps authorization server selection unresolved but required before implementation", () => {
    const contracts = buildMcpProtectedResourceMetadataContracts();

    expect(
      contracts.authorizationServersBoundary.authorizationServersMustBeNonEmpty,
    ).toBe(true);
    expect(contracts.authorizationServersBoundary.providerSelected).toBe(false);
    expect(
      contracts.authorizationServersBoundary.authorizationServerSelectionStatus,
    ).toBe("unresolved_hold");
    expect(
      McpProtectedResourceAuthorizationServersBoundarySchema.safeParse({
        ...contracts.authorizationServersBoundary,
        providerSelected: true,
      }).success,
    ).toBe(false);
  });

  it("requires least-privilege read-only scopes and treats challenged scopes as authoritative", () => {
    const contracts = buildMcpProtectedResourceMetadataContracts();

    expect(validateMcpProtectedResourceScopes(["evidence:read"])).toMatchObject(
      {
        rejectedScopePatterns: [],
        scopesLeastPrivilegeReadOnlyVerified: true,
      },
    );
    for (const scopes of [
      ["*"],
      ["finance:write"],
      ["provider:read"],
      ["admin:read"],
      ["offline_access"],
      ["finance"],
    ]) {
      expect(
        validateMcpProtectedResourceScopes(scopes)
          .scopesLeastPrivilegeReadOnlyVerified,
      ).toBe(false);
    }
    expect(
      McpProtectedResourceScopesBoundarySchema.safeParse(
        contracts.scopesBoundary,
      ).success,
    ).toBe(true);
    expect(
      McpScopeChallengeReadinessBoundarySchema.safeParse(
        contracts.scopeChallengeReadinessBoundary,
      ).success,
    ).toBe(true);
    expect(
      contracts.scopeChallengeReadinessBoundary
        .challengedScopesAuthoritativeForCurrentRequest,
    ).toBe(true);
    expect(
      contracts.scopeChallengeReadinessBoundary
        .scopesSupportedNotAssumedAuthoritativeForChallenge,
    ).toBe(true);
  });

  it("requires header bearer method posture and rejects query-string token usage", () => {
    const contracts = buildMcpProtectedResourceMetadataContracts();

    expect(contracts.bearerMethodsBoundary.requiredBearerMethods).toEqual([
      ...MCP_PROTECTED_RESOURCE_METADATA_BEARER_METHODS,
    ]);
    expect(contracts.bearerMethodsBoundary.queryStringBearerTokensAllowed).toBe(
      false,
    );
    expect(
      McpProtectedResourceBearerMethodsBoundarySchema.safeParse({
        ...contracts.bearerMethodsBoundary,
        queryStringBearerTokensAllowed: true,
      }).success,
    ).toBe(false);
  });

  it("keeps WWW-Authenticate, discovery, and token-failure challenge behavior contract-only", () => {
    const contracts = buildMcpProtectedResourceMetadataContracts();

    expect(
      McpWwwAuthenticateChallengeBoundarySchema.safeParse(
        contracts.wwwAuthenticateChallengeBoundary,
      ).success,
    ).toBe(true);
    expect(
      contracts.wwwAuthenticateChallengeBoundary
        .challengeMustIncludeResourceMetadata,
    ).toBe(true);
    expect(
      contracts.wwwAuthenticateChallengeBoundary
        .challengeRouteBehaviorImplemented,
    ).toBe(false);
    expect(
      McpTokenFailureChallengeBoundarySchema.safeParse(
        contracts.tokenFailureChallengeBoundary,
      ).success,
    ).toBe(true);
    expect(contracts.tokenFailureChallengeBoundary.failureModes).toEqual([
      ...MCP_PROTECTED_RESOURCE_TOKEN_FAILURE_MODES,
    ]);
    expect(
      McpTokenFailureChallengeBoundarySchema.safeParse({
        ...contracts.tokenFailureChallengeBoundary,
        tokenFailureChallengeImplementationFutureOnly: false,
      }).success,
    ).toBe(false);
  });

  it("covers no-token-leakage surfaces for metadata, evidence, docs, and proof output", () => {
    const contracts = buildMcpProtectedResourceMetadataContracts();

    expect(contracts.noTokenLeakageBoundary.forbiddenSurfaces).toEqual([
      ...MCP_PROTECTED_RESOURCE_METADATA_TOKEN_LEAKAGE_SURFACES,
    ]);
    expect(
      McpNoTokenLeakageMetadataBoundarySchema.safeParse({
        ...contracts.noTokenLeakageBoundary,
        forbiddenSurfaces:
          MCP_PROTECTED_RESOURCE_METADATA_TOKEN_LEAKAGE_SURFACES.slice(1),
      }).success,
    ).toBe(false);
    expect(textHasProtectedResourceTokenLeakage("Bearer abc.def.ghi")).toBe(
      false,
    );
    expect(
      textHasProtectedResourceTokenLeakage(
        `Authorization: Bearer ${"x".repeat(24)}`,
      ),
    ).toBe(true);
  });

  it("proves local route posture and repository inventory remain unchanged", () => {
    const routeLikeRepositoryPaths =
      listMcpProtectedResourceMetadataRouteLikeRepositoryPaths(repoFilePaths());
    const inventory = verifyMcpProtectedResourceMetadataRepositoryInventory({
      repoPaths: repoFilePaths(),
      routeSourceText: safeRead(
        "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts",
      ),
    });
    const contracts = buildMcpProtectedResourceMetadataContracts();

    expect(inventory.protectedResourceRouteRepositoryInventoryVerified).toBe(
      true,
    );
    expect(routeLikeRepositoryPaths).toEqual(
      [
        ...MCP_PROTECTED_RESOURCE_METADATA_KNOWN_SAFE_ROUTE_LIKE_PATHS,
        ...MCP_PROTECTED_RESOURCE_METADATA_OPTIONAL_FP0125_ROUTE_LIKE_PATHS,
      ].sort(),
    );
    expect(inventory.noNewRoutePathRepositoryInventoryVerified).toBe(true);
    expect(inventory.knownSafeRouteInventoryVerified).toBe(true);
    expect(inventory.noUnexpectedRouteLikeRepositoryPaths).toBe(true);
    expect(inventory.unexpectedRouteLikeRepositoryPaths).toEqual([]);
    expect(inventory.missingKnownSafeRouteLikeRepositoryPaths).toEqual([]);
    expect(inventory.fp0118RouteInventoryDurabilityVerified).toBe(true);
    expect(inventory.fp0118PostmergeProofDurabilityVerified).toBe(true);
    expect(inventory.fp0119PostmergeRouteInventoryProofVerified).toBe(true);
    expect(inventory.wwwAuthenticateRouteRepositoryInventoryVerified).toBe(
      true,
    );
    expect(inventory.oauthRuntimeRepositoryInventoryVerified).toBe(true);
    expect(inventory.tokenSessionRepositoryInventoryVerified).toBe(true);
    expect(inventory.authMiddlewareRepositoryInventoryVerified).toBe(true);
    expect(inventory.remoteMcpDeploymentRepositoryInventoryVerified).toBe(true);
    expect(
      McpProtectedResourceRouteDeferredBoundarySchema.safeParse(
        contracts.routeDeferredBoundary,
      ).success,
    ).toBe(true);
    expect(
      McpWwwAuthenticateRouteDeferredBoundarySchema.safeParse(
        contracts.wwwAuthenticateRouteDeferredBoundary,
      ).success,
    ).toBe(true);
  });

  it("rejects simulated route inventory, WWW-Authenticate route behavior, OAuth, token/session, and auth middleware", () => {
    const currentSafeRoutePaths = [
      ...MCP_PROTECTED_RESOURCE_METADATA_KNOWN_SAFE_ROUTE_LIKE_PATHS,
    ];

    expect(
      verifyMcpProtectedResourceMetadataRepositoryInventory({
        repoPaths: [
          ...currentSafeRoutePaths,
          "apps/web/app/.well-known/oauth-protected-resource/route.ts",
        ],
      }).protectedResourceRouteRepositoryInventoryVerified,
    ).toBe(false);
    expect(
      verifyMcpProtectedResourceMetadataRepositoryInventory({
        repoPaths: [
          ...currentSafeRoutePaths,
          "apps/web/app/.well-known/oauth-protected-resource/route.ts",
        ],
      }).noNewRoutePathRepositoryInventoryVerified,
    ).toBe(false);
    expect(
      verifyMcpProtectedResourceMetadataRepositoryInventory({
        repoPaths: [
          ...currentSafeRoutePaths,
          "apps/web/app/.well-known/oauth-protected-resource/route.ts",
        ],
      }).noUnexpectedRouteLikeRepositoryPaths,
    ).toBe(false);
    expect(
      verifyMcpProtectedResourceMetadataRepositoryInventory({
        repoPaths: [
          ...currentSafeRoutePaths,
          "apps/web/app/protected-resource-metadata/route.ts",
        ],
      }).protectedResourceRouteRepositoryInventoryVerified,
    ).toBe(false);
    expect(
      verifyMcpProtectedResourceMetadataRepositoryInventory({
        repoPaths: [
          ...currentSafeRoutePaths,
          "apps/web/app/protected-resource-metadata/route.ts",
        ],
      }).fp0119PostmergeRouteInventoryProofVerified,
    ).toBe(false);
    expect(
      verifyMcpProtectedResourceMetadataRepositoryInventory({
        repoPaths: [
          ...currentSafeRoutePaths,
          "apps/web/pages/api/oauth-protected-resource.ts",
        ],
      }).protectedResourceRouteRepositoryInventoryVerified,
    ).toBe(false);
    expect(
      verifyMcpProtectedResourceMetadataRepositoryInventory({
        repoPaths: currentSafeRoutePaths,
        routeSourceText:
          'reply.header("WWW-Authenticate", "Bearer resource_metadata=...")',
      }).wwwAuthenticateRouteRepositoryInventoryVerified,
    ).toBe(false);
    expect(
      verifyMcpProtectedResourceMetadataRepositoryInventory({
        repoPaths: [
          ...currentSafeRoutePaths,
          "apps/control-plane/src/modules/new-public-route/routes.ts",
        ],
      }),
    ).toMatchObject({
      knownSafeRouteInventoryVerified: false,
      noNewRoutePathRepositoryInventoryVerified: false,
      noUnexpectedRouteLikeRepositoryPaths: false,
    });
    expect(
      verifyMcpProtectedResourceMetadataRepositoryInventory({
        repoPaths: [
          "apps/control-plane/src/modules/read-only-app-mcp-endpoint/oauth.ts",
          "apps/control-plane/src/modules/read-only-app-mcp-endpoint/token-session-store.ts",
          "apps/control-plane/src/modules/read-only-app-mcp-endpoint/auth-middleware.ts",
        ],
      }),
    ).toMatchObject({
      authMiddlewareRepositoryInventoryVerified: false,
      oauthRuntimeRepositoryInventoryVerified: false,
      tokenSessionRepositoryInventoryVerified: false,
    });
    expect(
      verifyMcpProtectedResourceMetadataRepositoryInventory({
        repoPaths: [],
        routeSourceText:
          'reply.header("WWW-Authenticate", "Bearer resource_metadata=...")',
      }).wwwAuthenticateRouteRepositoryInventoryVerified,
    ).toBe(false);
    expect(
      verifyMcpProtectedResourceMetadataRepositoryInventory({
        changedPaths: ["docs/notes/fp-0119-safe-doc.md"],
        repoPaths: [...currentSafeRoutePaths, "docs/notes/fp-0119-safe-doc.md"],
      }),
    ).toMatchObject({
      fp0118RouteInventoryDurabilityVerified: true,
      fp0119PostmergeRouteInventoryProofVerified: true,
      knownSafeRouteInventoryVerified: true,
      noNewRoutePathRepositoryInventoryVerified: true,
      noUnexpectedRouteLikeRepositoryPaths: true,
      protectedResourceRouteRepositoryInventoryVerified: true,
      wwwAuthenticateRouteRepositoryInventoryVerified: true,
    });
    expect(
      verifyMcpProtectedResourceMetadataRepositoryInventory({
        repoPaths: currentSafeRoutePaths,
      }),
    ).toMatchObject({
      fp0119PostmergeRouteInventoryProofVerified: true,
      knownSafeRouteInventoryVerified: true,
      noUnexpectedRouteLikeRepositoryPaths: true,
    });
  });

  it("preserves prior FP-0117, FP-0116, FP-0113, FP-0107, FP-0106, and FP-0100 boundaries", () => {
    const repoPaths = repoFilePaths();
    const fp0117Text = safeRead(
      FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
    );
    const proof = buildMcpProtectedResourceMetadataProof({
      fp0100PublicSecurityBoundaryStillVerified: verified(
        docsBoundary(
          "plans/FP-0100-read-only-chatgpt-app-mcp-public-app-security-boundary-contracts-foundation.md",
          ["public-app security boundary", "local/proof-only"],
        ),
      ),
      fp0106ProtocolEnvelopeBoundaryStillVerified: verified(
        docsBoundary(
          "plans/FP-0106-read-only-chatgpt-app-mcp-protocol-envelope-tool-dispatch-proof-contracts.md",
          ["protocol envelope", "tools/call"],
        ),
      ),
      fp0107RouteAdapterBoundaryStillVerified: verified(
        docsBoundary(
          "plans/FP-0107-read-only-chatgpt-app-mcp-local-fastify-mcp-route-adapter-foundation.md",
          ["local/control-plane", "post /mcp"],
        ),
      ),
      fp0113OauthSecurityBoundaryStillVerified: verified(
        docsBoundary(
          "plans/FP-0113-read-only-chatgpt-app-mcp-oauth-token-session-security-contracts-foundation.md",
          ["token passthrough is forbidden", "companykey"],
        ),
      ),
      fp0116RemoteHostResourceBoundaryStillVerified: verified(
        docsBoundary(
          "plans/FP-0116-read-only-chatgpt-app-mcp-remote-host-owner-canonical-uri-resource-metadata-contracts.md",
          ["canonical resource uri", "protected-resource metadata"],
        ),
      ),
      fp0117OauthImplementationSequencingBoundaryStillVerified: verified(
        verifyFp0117AbsentOrDocsOnlyOauthImplementationSequencingPlan({
          planText: fp0117Text,
          repoPaths,
        }) &&
          verifyFp0117OauthImplementationSequencingPlanBoundary({
            planText: fp0117Text,
            repoPaths,
          }),
      ),
    });

    expect(proof.fp0117OauthImplementationSequencingBoundaryStillVerified).toBe(
      true,
    );
    expect(proof.fp0116RemoteHostResourceBoundaryStillVerified).toBe(true);
    expect(proof.fp0113OauthSecurityBoundaryStillVerified).toBe(true);
    expect(proof.fp0107RouteAdapterBoundaryStillVerified).toBe(true);
    expect(proof.fp0106ProtocolEnvelopeBoundaryStillVerified).toBe(true);
    expect(proof.fp0100PublicSecurityBoundaryStillVerified).toBe(true);
  });

  it("scans FP-0118 proof sources for executable OpenAI/API/model/key usage", () => {
    const sourceText = repoFilePaths()
      .filter(isFp0118ProtectedResourceMetadataNoOpenAiProofSourcePath)
      .filter((path) => !isFp0123RouteInputSourceScanExcludedPath(path))
      .map((path) => safeRead(path))
      .join("\n");
    const scan = verifyMcpProtectedResourceMetadataNoOpenAiApiSourceScan({
      sourceText,
    });

    expect(scan.forbiddenExecutableMatches).toEqual([]);
    expect(scan.protectedResourceMetadataNoOpenAiApiSourceScanVerified).toBe(
      true,
    );
  });
});

function repoFilePaths() {
  const paths: string[] = [];
  const visit = (relativeDir: string) => {
    for (const entry of readdirSync(join(repoRoot, relativeDir), {
      withFileTypes: true,
    })) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      const relativePath = relativeDir
        ? `${relativeDir}/${entry.name}`
        : entry.name;
      if (entry.isDirectory()) visit(relativePath);
      else paths.push(relativePath);
    }
  };
  visit("");
  return paths.sort();
}

function safeRead(relativePath: string) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function isFp0123RouteInputSourceScanExcludedPath(path: string) {
  return (
    path.endsWith(".spec.ts") ||
    fp0123RouteInputSourceScanExcludedPaths.has(path)
  );
}

function docsBoundary(relativePath: string, requiredText: readonly string[]) {
  const normalized = safeRead(relativePath).toLowerCase().replace(/`/gu, "");
  return requiredText.every((text) => normalized.includes(text));
}

function fp0119NoRuntimeScope() {
  return {
    noAppSubmissionFromFp0119: true,
    noAppsSdkResourceFromFp0119: true,
    noAuthMiddlewareImplementationFromFp0119: true,
    noDbQueriesFromFp0119: true,
    noDeploymentConfigFromFp0119: true,
    noListingCopyGeneratedPublicProseFromFp0119: true,
    noNewRoutePathFromFp0119: true,
    noOauthImplementationFromFp0119: true,
    noOpenAiApiCallsFromFp0119: true,
    noPackageScriptsFromFp0119: true,
    noProtectedResourceMetadataRouteFromFp0119: true,
    noProviderExternalCallsFromFp0119: true,
    noPublicAssetsSubmissionArtifactsFromFp0119: true,
    noRemoteMcpDeploymentFromFp0119: true,
    noRouteBehaviorChangeFromFp0119: true,
    noSchemaMigrationsFromFp0119: true,
    noSourceMutationFinanceWriteFromFp0119: true,
    noTokenSessionImplementationFromFp0119: true,
    noWwwAuthenticateRouteBehaviorFromFp0119: true,
  } as const;
}
