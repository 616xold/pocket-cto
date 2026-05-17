import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import {
  FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  FP0118_PROTECTED_RESOURCE_METADATA_PLAN_PATH,
  FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH,
  FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH,
  FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
  FP0126_WWW_AUTHENTICATE_AUTH_CHALLENGE_SEQUENCING_PLAN_PATH,
  FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH,
  McpWwwAuthenticateAuthChallengeProofSchema,
  buildMcpWwwAuthenticateAuthChallengeProof,
  buildWwwAuthenticateAuthChallengeContract,
  deriveWwwAuthenticateResourceMetadataReferenceContract,
  isFp0117OauthSequencingNoOpenAiProofSourcePath,
  isFp0118ProtectedResourceMetadataNoOpenAiProofSourcePath,
  scanWwwAuthenticateNoTokenLeakage,
  validateWwwAuthenticatePublicResourceMetadataReferenceCandidate,
  validateWwwAuthenticateScopeChallenge,
  verifyFp0117OauthImplementationSequencingPlanBoundary,
  verifyFp0118ProtectedResourceMetadataPlanBoundary,
  verifyFp0120CanonicalResourceAuthServerPlanBoundary,
  verifyFp0122ProtectedResourceMetadataBuilderContractsBoundary,
  verifyFp0123ProtectedResourceMetadataRouteInputContractsBoundary,
  verifyFp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlan,
  verifyFp0126WwwAuthenticateAuthChallengeSequencingPlanBoundary,
  verifyFp0127AbsentOrLocalWwwAuthenticateAuthChallengeContracts,
  verifyFp0127WwwAuthenticateAuthChallengeContractsBoundary,
  verifyFp0128Absent,
} from "../packages/domain/src/index.ts";

const FP0125_PLAN =
  "plans/FP-0125-read-only-chatgpt-app-mcp-protected-resource-metadata-local-route-implementation.md";
const FP0124_PLAN =
  "plans/FP-0124-read-only-chatgpt-app-mcp-protected-resource-metadata-route-implementation-master-plan.md";
const FP0107_PLAN =
  "plans/FP-0107-read-only-chatgpt-app-mcp-local-fastify-mcp-route-adapter-foundation.md";
const FP0106_PLAN =
  "plans/FP-0106-read-only-chatgpt-app-mcp-protocol-envelope-tool-dispatch-proof-contracts.md";
const FP0100_PLAN =
  "plans/FP-0100-read-only-chatgpt-app-mcp-public-app-security-boundary-contracts-foundation.md";
const MCP_ROUTE_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts";
const METADATA_ROUTE_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.ts";

const repoPaths = repoFilePaths();
const changedPaths = changedFilePaths();
const fp0127PlanText = safeRead(
  FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH,
);
const mcpRouteSource = safeRead(MCP_ROUTE_PATH);
const metadataRouteSource = safeRead(METADATA_ROUTE_PATH);
const changedExecutableSource = readChangedExecutableSource();
const durableNoOpenAiScan = noExecutableApiModelKeyUsage(
  readWwwAuthenticateProofSourceText(repoPaths),
);
const changedNoOpenAiScan = noExecutableApiModelKeyUsage(
  changedExecutableSource,
);
const scopeScan = changedScopeScan();
const scopeChallengeHardeningProof = verifyScopeChallengeHardening();
const noTokenLeakageHardeningProof = verifyNoTokenLeakageHardening();
const publicResourceMetadataReferenceHardeningProof =
  verifyPublicResourceMetadataReferenceHardening();
const contract = buildWwwAuthenticateAuthChallengeContract();

const proof = McpWwwAuthenticateAuthChallengeProofSchema.parse(
  buildMcpWwwAuthenticateAuthChallengeProof({
    fp0100PublicSecurityBoundaryStillVerified: docsBoundary(FP0100_PLAN, [
      "public-app security boundary",
      "local/proof-only",
      "no endpoints",
    ]),
    fp0106ProtocolEnvelopeBoundaryStillVerified: docsBoundary(FP0106_PLAN, [
      "mcp protocol envelope",
      "tools/call",
      "no openai api/model calls",
    ]),
    fp0107RouteAdapterBoundaryStillVerified:
      docsBoundary(FP0107_PLAN, ["local/control-plane", "post /mcp"]) &&
      localMcpRouteShapeStillVerified(),
    fp0117OauthImplementationSequencingBoundaryStillVerified:
      verifyFp0117OauthImplementationSequencingPlanBoundary({
        planText: safeRead(FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH),
        repoPaths,
      }),
    fp0118ProtectedResourceMetadataBoundaryStillVerified:
      verifyFp0118ProtectedResourceMetadataPlanBoundary({
        planText: safeRead(FP0118_PROTECTED_RESOURCE_METADATA_PLAN_PATH),
        repoPaths,
      }),
    fp0120CanonicalResourceAuthServerBoundaryStillVerified:
      verifyFp0120CanonicalResourceAuthServerPlanBoundary({
        planText: safeRead(FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH),
        repoPaths,
      }),
    fp0122ProtectedResourceMetadataBuilderBoundaryStillVerified:
      verifyFp0122ProtectedResourceMetadataBuilderContractsBoundary({
        planText: safeRead(FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH),
        repoPaths,
      }),
    fp0123RouteInputEvidenceBoundaryStillVerified:
      verifyFp0123ProtectedResourceMetadataRouteInputContractsBoundary({
        planText: safeRead(FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH),
        repoPaths,
      }),
    fp0124RouteImplementationPlanningBoundaryStillVerified:
      verifyFp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlan(
        {
          planText: safeRead(FP0124_PLAN),
          repoPaths,
        },
      ),
    fp0125EvidenceCoherenceBoundaryStillVerified: docsBoundary(FP0125_PLAN, [
      "evidence-coherence hardening",
      "semantic agreement between canonical uri evidence",
    ]),
    fp0125ProtectedResourceMetadataLocalRouteBoundaryStillVerified:
      metadataRouteShapeStillVerified(),
    fp0126WwwAuthenticateAuthChallengeSequencingBoundaryStillVerified:
      verifyFp0126WwwAuthenticateAuthChallengeSequencingPlanBoundary({
        planText: safeRead(
          FP0126_WWW_AUTHENTICATE_AUTH_CHALLENGE_SEQUENCING_PLAN_PATH,
        ),
        repoPaths,
      }),
    fp0127AbsentOrLocalWwwAuthenticateAuthChallengeContractsVerified:
      verifyFp0127AbsentOrLocalWwwAuthenticateAuthChallengeContracts({
        planText: fp0127PlanText,
        repoPaths,
      }),
    fp0127BoundaryVerified:
      verifyFp0127WwwAuthenticateAuthChallengeContractsBoundary({
        planText: fp0127PlanText,
        repoPaths,
      }),
    fp0128Absent: verifyFp0128Absent(repoPaths),
    fp0127PostmergeChallengeContractHardeningVerified:
      scopeChallengeHardeningProof.verified &&
      scopeChallengeHardeningProof.acceptedMeansReadOnlyLeastPrivilege &&
      noTokenLeakageHardeningProof.verified &&
      publicResourceMetadataReferenceHardeningProof.verified &&
      publicResourceMetadataReferenceHardeningProof.noRuntimeHeaderEmission,
    noAppSubmission: scopeScan.noAppSubmission,
    noAppSubmissionFromFp0127: scopeScan.noAppSubmission,
    noAppsSdkResourceFromFp0127: scopeScan.noAppsSdkResource,
    noAppsSdkResourceImplementation: scopeScan.noAppsSdkResource,
    noAuthMiddlewareImplementation: scopeScan.noAuthMiddlewareImplementation,
    noAuthMiddlewareImplementationFromFp0127:
      scopeScan.noAuthMiddlewareImplementation,
    noDbQueriesAdded: scopeScan.noDbQueries,
    noDbQueriesFromFp0127: scopeScan.noDbQueries,
    noDeploymentConfig: scopeScan.noDeploymentConfig,
    noDeploymentConfigFromFp0127: scopeScan.noDeploymentConfig,
    noExternalCommunications: scopeScan.noExternalCommunications,
    noFinanceWrite: scopeScan.noFinanceWrite,
    noGeneratedPublicProse: scopeScan.noGeneratedPublicProse,
    noListingCopy: scopeScan.noListingCopy,
    noListingCopyGeneratedPublicProseFromFp0127:
      scopeScan.noListingCopy && scopeScan.noGeneratedPublicProse,
    noMcpRouteBehaviorChange:
      scopeScan.noMcpRouteBehaviorChange && localMcpRouteShapeStillVerified(),
    noMcpRouteBehaviorChangeFromFp0127:
      scopeScan.noMcpRouteBehaviorChange && localMcpRouteShapeStillVerified(),
    noModelCalls:
      changedNoOpenAiScan.noModelCalls && durableNoOpenAiScan.noModelCalls,
    noOauthImplementation: scopeScan.noOauthImplementation,
    noOauthImplementationFromFp0127: scopeScan.noOauthImplementation,
    noOpenAiApiCalls:
      changedNoOpenAiScan.noOpenAiApiCalls &&
      durableNoOpenAiScan.noOpenAiApiCalls,
    noOpenAiApiCallsFromFp0127:
      changedNoOpenAiScan.noOpenAiApiCalls &&
      durableNoOpenAiScan.noOpenAiApiCalls,
    noOpenAiClientOrKeyUsage:
      changedNoOpenAiScan.noOpenAiClientOrKeyUsage &&
      durableNoOpenAiScan.noOpenAiClientOrKeyUsage,
    noPackageScriptsAdded: scopeScan.noPackageScripts,
    noPackageScriptsFromFp0127: scopeScan.noPackageScripts,
    noProtectedResourceMetadataRouteBehaviorChange:
      scopeScan.noProtectedResourceMetadataRouteBehaviorChange &&
      metadataRouteShapeStillVerified(),
    noProtectedResourceMetadataRouteBehaviorChangeFromFp0127:
      scopeScan.noProtectedResourceMetadataRouteBehaviorChange &&
      metadataRouteShapeStillVerified(),
    noProviderCalls: scopeScan.noProviderCalls,
    noProviderExternalCallsFromFp0127:
      scopeScan.noProviderCalls && scopeScan.noExternalCommunications,
    noPublicAssets: scopeScan.noPublicAssets,
    noPublicAssetsSubmissionArtifactsFromFp0127:
      scopeScan.noPublicAssets && scopeScan.noAppSubmission,
    noRemoteMcpDeployment: scopeScan.noRemoteMcpDeployment,
    noRemoteMcpDeploymentFromFp0127: scopeScan.noRemoteMcpDeployment,
    noSchemaMigrationsAdded: scopeScan.noSchemaMigrations,
    noSchemaMigrationsFromFp0127: scopeScan.noSchemaMigrations,
    noSourceMutation: scopeScan.noSourceMutation,
    noSourceMutationFinanceWriteFromFp0127:
      scopeScan.noSourceMutation && scopeScan.noFinanceWrite,
    noTokenSessionImplementation: scopeScan.noTokenSessionImplementation,
    noTokenSessionImplementationFromFp0127:
      scopeScan.noTokenSessionImplementation,
    noTokenValidationImplementation:
      scopeScan.noTokenValidationImplementation,
    noTokenValidationImplementationFromFp0127:
      scopeScan.noTokenValidationImplementation,
    noWwwAuthenticateRouteBehaviorFromFp0127:
      scopeScan.noWwwAuthenticateRouteBehavior &&
      routeSourcesHaveNoWwwAuthenticateRuntime(),
    noWwwAuthenticateRouteBehaviorImplementation:
      scopeScan.noWwwAuthenticateRouteBehavior &&
      routeSourcesHaveNoWwwAuthenticateRuntime(),
    wwwAuthenticateAuthChallengeContractsFoundationVerified:
      contract.runtimeBehaviorImplemented === false,
    wwwAuthenticateNoRuntimeHeaderEmissionStillVerified:
      contract.referenceContract.runtimeHeaderEmissionAllowed === false &&
      publicResourceMetadataReferenceHardeningProof.noRuntimeHeaderEmission,
    wwwAuthenticateNoTokenLeakagePatternScanVerified:
      noTokenLeakageHardeningProof.verified,
    wwwAuthenticatePublicResourceMetadataReferenceCandidateValidationVerified:
      publicResourceMetadataReferenceHardeningProof.verified,
    wwwAuthenticateScopeChallengeAcceptedMeansReadOnlyLeastPrivilege:
      scopeChallengeHardeningProof.acceptedMeansReadOnlyLeastPrivilege,
    wwwAuthenticateScopeChallengeDelimiterHardeningVerified:
      scopeChallengeHardeningProof.verified,
  }),
);

for (const [key, value] of Object.entries(proof)) {
  if (typeof value === "boolean" && value !== true) {
    throw new Error(`FP-0127 WWW-Authenticate proof failed: ${key}`);
  }
}

console.log(
  JSON.stringify(
    {
      ...proof,
      proofDetails: {
        noTokenLeakageHardeningProof,
        publicResourceMetadataReferenceHardeningProof,
        scopeChallengeHardeningProof,
      },
    },
    null,
    2,
  ),
);

function verifyScopeChallengeHardening() {
  const allowedReadOnlyScopes = validateWwwAuthenticateScopeChallenge([
    "mcp:read",
    "evidence:read",
  ]);
  const forbiddenExamples = [
    "finance:write",
    "finance.write",
    "finance/write",
    "finance_write",
    "write-finance",
    "admin.read",
    "mutation:source",
    "source_mutation",
    "provider.read",
    "offline-access",
    "offline access",
    "delete:evidence",
    "update:ledger",
    "create:journal",
    "*",
    "Finance:Write",
    "PROVIDER.READ",
  ].map((scope) => ({
    scope,
    validation: validateWwwAuthenticateScopeChallenge([scope]),
  }));
  const unlistedReadLikeScope = validateWwwAuthenticateScopeChallenge([
    "finance:read",
  ]);

  return {
    acceptedMeansReadOnlyLeastPrivilege:
      allowedReadOnlyScopes.accepted === true &&
      allowedReadOnlyScopes.readOnlyLeastPrivilege === true &&
      unlistedReadLikeScope.accepted === false &&
      unlistedReadLikeScope.rejectedScopes.includes("finance:read") &&
      unlistedReadLikeScope.rejectionReasons.includes(
        "scope_not_in_read_only_allowlist",
      ),
    allowedReadOnlyScopes,
    forbiddenExamples,
    unlistedReadLikeScope,
    verified:
      allowedReadOnlyScopes.accepted === true &&
      forbiddenExamples.every(
        ({ validation }) =>
          validation.accepted === false &&
          validation.forbiddenMatches.length > 0 &&
          validation.rejectionReasons.includes(
            "forbidden_scope_token_detected",
          ),
      ),
  };
}

function verifyNoTokenLeakageHardening() {
  const openAiKeyName = ["OPENAI", "API", "KEY"].join("_");
  const safeExamples = [
    "contract-only missing-token posture with read-only scope guidance",
    "No token values, cookies, sessions, credentials, or raw finance data are included.",
    `${openAiKeyName} must be absent from proof examples.`,
  ].map((text) => ({
    scan: scanWwwAuthenticateNoTokenLeakage(text),
    text,
  }));
  const leakingExamples = [
    "Authorization: Bearer abcdefghijklmnopqrstuvwxyz",
    "Bearer abcdefghijklmnopqrstuvwxyz",
    "Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==",
    `${openAiKeyName}=sk-project123456789`,
    "sk-project123456789",
    "api_key=abc123secret",
    "access_token=abc123secret",
    "refresh_token=abc123secret",
    "client_secret=abc123secret",
    "session=abc123secret",
    "cookie: session=abc123secret",
    "x-api-key: abc123secret",
    "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature123456789",
    "companyKey as authority",
    "raw finance data",
    "raw source dump",
    "provider credential",
    "app submission copy",
  ].map((text) => ({
    scan: scanWwwAuthenticateNoTokenLeakage(text),
    text,
  }));

  return {
    leakingExamples,
    safeExamples,
    verified:
      safeExamples.every(({ scan }) => scan.accepted) &&
      leakingExamples.every(
        ({ scan }) => scan.accepted === false && scan.matches.length > 0,
      ),
  };
}

function verifyPublicResourceMetadataReferenceHardening() {
  const localReference = deriveWwwAuthenticateResourceMetadataReferenceContract();
  const validFutureReference =
    deriveWwwAuthenticateResourceMetadataReferenceContract({
      publicCanonicalUrlProofAvailable: true,
      referenceMode: "public_runtime_canonical_url",
      resourceMetadataReference:
        "https://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/mcp",
    });
  const invalidCandidates = [
    "http://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/mcp",
    "https://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/mcp?companyKey=acme",
    "https://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/mcp#fragment",
    "https://user:pass@mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/mcp",
    "https://localhost:3000/.well-known/oauth-protected-resource/mcp",
    "https://127.0.0.1/.well-known/oauth-protected-resource/mcp",
    "https://pocket-cfo.ngrok-free.app/.well-known/oauth-protected-resource/mcp",
    "https://your-mcp.example.com/.well-known/oauth-protected-resource/mcp",
    "https://mcp.canonical-finance-host.com/companyKey/acme/.well-known/oauth-protected-resource/mcp",
    "https://mcp.canonical-finance-host.com/user/acme/.well-known/oauth-protected-resource/mcp",
    "https://mcp.canonical-finance-host.com/org/acme/.well-known/oauth-protected-resource/mcp",
    "https://mcp.canonical-finance-host.com/workspace/acme/.well-known/oauth-protected-resource/mcp",
    "https://mcp.canonical-finance-host.com/tenant/acme/.well-known/oauth-protected-resource/mcp",
    "https://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/mcp/access_token/abc123secret",
    "https://mcp.canonical-finance-host.com/arbitrary-https-string",
  ].map((candidate) => ({
    candidate,
    referenceContract: deriveWwwAuthenticateResourceMetadataReferenceContract({
      publicCanonicalUrlProofAvailable: true,
      referenceMode: "public_runtime_canonical_url",
      resourceMetadataReference: candidate,
    }),
    validation:
      validateWwwAuthenticatePublicResourceMetadataReferenceCandidate(candidate),
  }));

  return {
    invalidCandidates,
    localReference,
    noRuntimeHeaderEmission:
      localReference.runtimeHeaderEmissionAllowed === false &&
      validFutureReference.runtimeHeaderEmissionAllowed === false &&
      invalidCandidates.every(
        ({ referenceContract }) =>
          referenceContract.runtimeHeaderEmissionAllowed === false,
      ),
    validFutureReference,
    verified:
      localReference.reference ===
        "/.well-known/oauth-protected-resource/mcp" &&
      localReference.runtimeHeaderEmissionAllowed === false &&
      validFutureReference.publicRuntimeReferenceAllowed === true &&
      validFutureReference.runtimeHeaderEmissionAllowed === false &&
      invalidCandidates.every(
        ({ referenceContract, validation }) =>
          validation.accepted === false &&
          referenceContract.publicRuntimeReferenceAllowed === false &&
          referenceContract.reference === null,
      ),
  };
}

function changedScopeScan() {
  return {
    noAppSubmission: !changedPaths.some((path) =>
      /(?:app-submission|submission-assets|public-listing|store-listing|listing-copy|screenshots)/iu.test(
        path,
      ),
    ),
    noAppsSdkResource:
      !changedPaths.some((path) =>
        /(?:apps-sdk|app-submission|submission-assets)/iu.test(path),
      ) && !/\b(?:registerResource|ui:\/\/|componentResource|iframe)\b/u.test(changedExecutableSource),
    noAuthMiddlewareImplementation:
      !/\b(?:authMiddleware|authorizationMiddleware|routeGuard|verifyBearer|requireAuth|authenticateRequest|setCookie)\s*\(/u.test(
        changedExecutableSource,
      ),
    noDbQueries:
      !changedPaths.some((path) => /^packages\/db\//u.test(path)) &&
      !/\b(?:from\s+["']drizzle|drizzle\s*\(|select\s*\(|insert\s*\(|update\s*\(|delete\s*\(|sql`)\b/u.test(
        changedExecutableSource,
      ),
    noDeploymentConfig: !changedPaths.some((path) =>
      /(?:^|\/)(?:vercel\.json|netlify\.toml|render\.ya?ml|fly\.toml|railway\.json|railway\.toml|wrangler\.toml|apphosting\.ya?ml|Dockerfile|docker-compose\.ya?ml|\.github\/workflows\/.*\.ya?ml)$/iu.test(
        path,
      ),
    ),
    noExternalCommunications:
      !/\b(?:sendEmail|sendReport|contactCustomer|externalMessage)\s*\(/u.test(
        changedExecutableSource,
      ),
    noFinanceWrite:
      !/\b(?:writeFinanceTwin|updateLedger|financeWrite|postLedger|createJournalEntry)\s*\(/u.test(
        changedExecutableSource,
      ),
    noGeneratedPublicProse: !changedPaths.some((path) =>
      /(?:generated-public-prose|public-listing|store-listing)/iu.test(path),
    ),
    noListingCopy: !changedPaths.some((path) =>
      /(?:listing-copy|public-listing|store-listing)/iu.test(path),
    ),
    noMcpRouteBehaviorChange: !changedPaths.includes(MCP_ROUTE_PATH),
    noOauthImplementation:
      !/\b(?:oauthCallback|authorizeUrl|tokenExchange|authorizationCode|pkceVerifier)\s*\(/u.test(
        changedExecutableSource,
      ),
    noPackageScripts:
      !changedPaths.includes("package.json") &&
      !changedPaths.some((path) => /\/package\.json$/u.test(path)),
    noProtectedResourceMetadataRouteBehaviorChange:
      !changedPaths.includes(METADATA_ROUTE_PATH),
    noProviderCalls:
      !/\b(?:providerConnect|callProvider|createProviderJob|deploy)\s*\(/u.test(
        changedExecutableSource,
      ),
    noPublicAssets: !changedPaths.some((path) =>
      /\.(?:png|jpe?g|gif|webp|svg|ico|avif|mp4|mov|pdf)$/iu.test(path),
    ),
    noRemoteMcpDeployment:
      !changedPaths.some((path) =>
        /(?:^|\/)(?:apps\/remote-mcp-server|remote-mcp|public-mcp|mcp-server|vercel\.json|netlify\.toml|render\.ya?ml|fly\.toml|Dockerfile|docker-compose\.ya?ml)$/iu.test(
          path,
        ),
      ) &&
      !/\b(?:remoteMcpRuntime|mcpServerRuntime|startRemoteMcp|listen\s*\(|deploy\s*\()\b/u.test(
        changedExecutableSource,
      ),
    noSchemaMigrations: !changedPaths.some(
      (path) =>
        /^packages\/db\//u.test(path) ||
        /(?:^|\/)migrations?\//iu.test(path) ||
        /\.(?:sql)$/iu.test(path),
    ),
    noSourceMutation:
      !/\b(?:uploadSource|mutateSource|rewriteSource|deleteSource)\s*\(/u.test(
        changedExecutableSource,
      ),
    noTokenSessionImplementation:
      !/\b(?:tokenStore|sessionStore|sessionHandler|refreshTokenStore|setCookie)\s*\(/u.test(
        changedExecutableSource,
      ),
    noTokenValidationImplementation:
      !/\b(?:validateToken|verifyToken|tokenValidator|jwtVerify|verifyJwt|validateBearer|verifyBearer)\s*\(/u.test(
        changedExecutableSource,
      ),
    noWwwAuthenticateRouteBehavior:
      !changedPaths.some(isRouteLikeRuntimePath) &&
      routeSourcesHaveNoWwwAuthenticateRuntime(),
  };
}

function noExecutableApiModelKeyUsage(sourceText) {
  const envKey = ["OPENAI", "API", "KEY"].join("_");
  const apiHost = ["api", "openai", "com"].join(".");
  const patterns = [
    {
      key: "noOpenAiApiCalls",
      name: "static-openai-import",
      pattern: /(?:^|[^\w])import\s+(?:[^;\n]*?\s+from\s+)?["']openai["']/u,
    },
    {
      key: "noOpenAiApiCalls",
      name: "openai-require",
      pattern: /\brequire\s*\(\s*["']openai["']\s*\)/u,
    },
    {
      key: "noOpenAiApiCalls",
      name: "dynamic-openai-import",
      pattern: /\bimport\s*\(\s*["']openai["']\s*\)/u,
    },
    { key: "noOpenAiClientOrKeyUsage", name: "openai-client", pattern: /\bnew\s+OpenAI\b/u },
    { key: "noOpenAiApiCalls", name: "openai-member-call", pattern: /\bopenai\s*\./iu },
    { key: "noOpenAiApiCalls", name: "responses-create", pattern: /\bresponses\s*\.\s*create\b/u },
    { key: "noOpenAiApiCalls", name: "chat-completions", pattern: /\bchat\s*\.\s*completions\b/u },
    {
      key: "noOpenAiClientOrKeyUsage",
      name: "openai-env-key",
      pattern: new RegExp(
        `(?:\\b${envKey}\\b|\\bprocess\\s*\\.\\s*env\\s*\\.\\s*${envKey}\\b|\\bprocess\\s*\\.\\s*env\\s*\\[\\s*["']${envKey}["']\\s*\\])`,
        "u",
      ),
    },
    {
      key: "noOpenAiApiCalls",
      name: "openai-api-host",
      pattern: new RegExp(`\\b${escapeRegExp(apiHost)}\\b`, "u"),
    },
    { key: "noModelCalls", name: "model-create", pattern: /\bmodel\s*\.\s*create\b/u },
    { key: "noModelCalls", name: "models-create", pattern: /\bmodels\s*\.\s*create\b/u },
    { key: "noModelCalls", name: "call-model", pattern: /\bcall\s*Model\b/u },
  ];
  const matches = sourceText.split("\n").flatMap((line, index) => {
    if (isSafeDocsOrProofAbsenceText(line)) return [];
    return patterns
      .filter(({ pattern }) => pattern.test(line))
      .map(({ key, name }) => ({ key, lineNumber: index + 1, name }));
  });

  return {
    matches,
    noModelCalls: !matches.some((match) => match.key === "noModelCalls"),
    noOpenAiApiCalls: !matches.some((match) => match.key === "noOpenAiApiCalls"),
    noOpenAiClientOrKeyUsage: !matches.some(
      (match) => match.key === "noOpenAiClientOrKeyUsage",
    ),
  };
}

function readWwwAuthenticateProofSourceText(paths) {
  return paths
    .filter(isFp0127NoOpenAiProofSourcePath)
    .filter((path) => !path.endsWith(".spec.ts"))
    .map(safeRead)
    .join("\n");
}

function isFp0127NoOpenAiProofSourcePath(path) {
  const normalized = normalizePath(path);
  return (
    normalized === "apps/control-plane/src/app.ts" ||
    normalized === "apps/control-plane/src/lib/types.ts" ||
    normalized.startsWith(
      "apps/control-plane/src/modules/read-only-app-mcp-endpoint/",
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-www-authenticate.*\.ts$/u.test(
      normalized,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-protected-resource-metadata.*\.ts$/u.test(
      normalized,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-protected-resource-metadata-route-input.*\.ts$/u.test(
      normalized,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-oauth-implementation-sequencing.*\.ts$/u.test(
      normalized,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-canonical-resource.*\.ts$/u.test(
      normalized,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-public-security.*\.ts$/u.test(
      normalized,
    ) ||
    isFp0117OauthSequencingNoOpenAiProofSourcePath(normalized) ||
    isFp0118ProtectedResourceMetadataNoOpenAiProofSourcePath(normalized) ||
    /^tools\/read-only-mcp-.*\.mjs$/u.test(normalized) ||
    normalized === "tools/benchmark-community-pack-proof.mjs"
  );
}

function readChangedExecutableSource() {
  return changedPaths
    .filter((path) => /\.(?:ts|tsx|js|mjs|cjs)$/u.test(path))
    .filter((path) => !path.endsWith(".spec.ts"))
    .filter((path) => !path.startsWith("tools/"))
    .filter((path) => !/^packages\/domain\/src\/.*inventory.*\.ts$/u.test(path))
    .filter((path) => !/^packages\/domain\/src\/.*proof.*\.ts$/u.test(path))
    .map(safeRead)
    .join("\n");
}

function routeSourcesHaveNoWwwAuthenticateRuntime() {
  return (
    !/WWW-Authenticate|www-authenticate|resource_metadata\s*=/iu.test(
      mcpRouteSource,
    ) &&
    !/WWW-Authenticate|www-authenticate/iu.test(metadataRouteSource)
  );
}

function localMcpRouteShapeStillVerified() {
  return (
    countMatches(mcpRouteSource, /app\.post\("\/mcp"/gu) === 1 &&
    countMatches(mcpRouteSource, /app\.get\("\/mcp"/gu) === 1 &&
    !/app\.(?:get|post|put|patch|delete)\("\/mcp\//u.test(mcpRouteSource) &&
    routeSourcesHaveNoWwwAuthenticateRuntime()
  );
}

function metadataRouteShapeStillVerified() {
  return (
    metadataRouteSource.includes(
      "READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH",
    ) &&
    metadataRouteSource.includes(
      "MCP_ROUTE_INPUT_EXPECTED_MCP_METADATA_ROUTE_PATH",
    ) &&
    !/app\.(?:post|put|patch|delete)\(\s*READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH/u.test(
      metadataRouteSource,
    ) &&
    !/WWW-Authenticate|www-authenticate/iu.test(metadataRouteSource)
  );
}

function docsBoundary(path, requiredTexts) {
  if (!repoPaths.includes(path) || !existsSync(path)) return false;
  const normalized = normalize(safeRead(path));
  return requiredTexts.every((requiredText) =>
    normalized.includes(requiredText),
  );
}

function changedFilePaths() {
  const output = execFileSync("git", ["diff", "--name-only", "HEAD"], {
    encoding: "utf8",
  });
  return output.split("\n").filter(Boolean).map(normalizePath).sort();
}

function repoFilePaths(dir = process.cwd(), prefix = "") {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git" || entry.name === "node_modules") return [];
    const absolutePath = `${dir}/${entry.name}`;
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return repoFilePaths(absolutePath, relativePath);
    return [normalizePath(relativePath)];
  });
}

function safeRead(path) {
  return readFileSync(path, "utf8");
}

function isRouteLikeRuntimePath(path) {
  return (
    /^apps\/web\/app\/(?:.*\/)?route\.ts$/u.test(path) ||
    path.startsWith("apps/web/pages/api/") ||
    /^apps\/control-plane\/src\/.*\/routes\.ts$/u.test(path) ||
    /^apps\/control-plane\/src\/.*(?:route|router|controller)\.ts$/u.test(path)
  );
}

function isSafeDocsOrProofAbsenceText(line) {
  const trimmed = line.trim();
  const normalized = trimmed.toLowerCase();
  const envKey = ["OPENAI", "API", "KEY"].join("_");
  if (!normalized) return true;
  if (
    new RegExp(
      `(?:name:\\s*["']openai-|pattern:\\s*\\/.*${envKey}|\\/.*${envKey}.*\\.test\\(|openai-api-key)`,
      "u",
    ).test(trimmed)
  ) {
    return true;
  }
  const docsLike =
    /^(?:[-*#>]|\/\/|\/\*|\*|["'`])/.test(trimmed) ||
    /^(?:no|not|never|without|does not|do not|must not|prohibit|prohibited|forbid|forbidden|reject|rejected|absence|absent|future-only)\b/u.test(
      normalized,
    );
  const mentionsSurface =
    /(?:openai|api key|model|responses|chat\.completions|callmodel|api\.openai\.com)/u.test(
      normalized,
    );
  const namesAbsence =
    /(?:no|not|never|without|does not|do not|must not|prohibit|prohibited|forbid|forbidden|reject|rejected|absence|absent|future-only|unauthorized)/u.test(
      normalized,
    );
  return docsLike && mentionsSurface && namesAbsence;
}

function countMatches(value, pattern) {
  return value.match(pattern)?.length ?? 0;
}

function normalizePath(path) {
  return path.replace(/\\/gu, "/");
}

function normalize(text) {
  return text.toLowerCase().replace(/\s+/gu, " ").trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
