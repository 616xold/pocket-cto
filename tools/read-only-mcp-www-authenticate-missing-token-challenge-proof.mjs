import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH,
  FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH,
  FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
  FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH,
  FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH,
  FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH,
  MCP_TOOL_ALLOWLIST,
  MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE,
  MCP_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_HEADER,
  buildMcpWwwAuthenticateLocalProofGatedMissingTokenChallengeDependency,
  buildProtectedResourceMetadataRouteInputEvidenceBundle,
  textHasMcpWwwAuthenticateMissingTokenChallengeNoPrivateMaterial,
  validRouteInput,
  verifyFp0120CanonicalResourceAuthServerPlanBoundary,
  verifyFp0122ProtectedResourceMetadataBuilderContractsBoundary,
  verifyFp0123ProtectedResourceMetadataRouteInputContractsBoundary,
  verifyFp0127WwwAuthenticateAuthChallengeContractsBoundary,
  verifyFp0128TokenValidationReadinessContractsBoundary,
  verifyFp0129WwwAuthenticateChallengeImplementationSequencingPlanBoundary,
  verifyFp0130LocalMissingTokenChallengeImplementationBoundary,
  verifyFp0131Absent,
} from "../packages/domain/src/index.ts";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { createInMemoryContainer } from "../apps/control-plane/src/bootstrap.ts";
import { READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH } from "../apps/control-plane/src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.ts";

const FP0125_PLAN =
  "plans/FP-0125-read-only-chatgpt-app-mcp-protected-resource-metadata-local-route-implementation.md";
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
const executableChangedSource = changedExecutableSource();
const mcpRouteSource = safeRead(MCP_ROUTE_PATH);
const metadataRouteSource = safeRead(METADATA_ROUTE_PATH);
const appProof = await verifyAppBehavior();
const sourceProof = verifySourceAndScope();
const planProof = verifyPlanBoundaries();

const proof = {
  schemaVersion:
    "v2ax.read-only-app-mcp-www-authenticate-missing-token-challenge-proof.v1",
  localOnly: true,
  explicitDependencyOnly: true,
  missingTokenChallengeImplementationVerified:
    appProof.defaultBuildAppMcpBehaviorUnchanged &&
    appProof.explicitDependencyEnablesMissingTokenChallenge &&
    appProof.missingAuthorizationReturns401Challenge,
  defaultBuildAppMcpBehaviorUnchanged:
    appProof.defaultBuildAppMcpBehaviorUnchanged,
  explicitDependencyEnablesMissingTokenChallenge:
    appProof.explicitDependencyEnablesMissingTokenChallenge,
  missingAuthorizationReturns401Challenge:
    appProof.missingAuthorizationReturns401Challenge,
  wwwAuthenticateBearerChallengeShapeVerified:
    appProof.wwwAuthenticateBearerChallengeShapeVerified,
  resourceMetadataReferenceVerified: appProof.resourceMetadataReferenceVerified,
  noTokenMaterialInChallengeVerified:
    appProof.noTokenMaterialInChallengeVerified,
  authorizationHeaderDoesNotAuthenticate:
    appProof.authorizationHeaderDoesNotAuthenticate,
  noTokenParsingRuntime: sourceProof.noTokenParsingRuntime,
  noTokenValidationRuntime: sourceProof.noTokenValidationRuntime,
  noTokenSessionStorage: sourceProof.noTokenSessionStorage,
  noAuthMiddlewareImplementation: sourceProof.noAuthMiddlewareImplementation,
  noOauthImplementation: sourceProof.noOauthImplementation,
  noProtectedResourceMetadataRouteBehaviorChange:
    appProof.noProtectedResourceMetadataRouteBehaviorChange &&
    sourceProof.noProtectedResourceMetadataRouteBehaviorChange,
  noNewRoutePath: sourceProof.noNewRoutePath,
  noRemoteMcpDeployment: sourceProof.noRemoteMcpDeployment,
  noDeploymentConfig: sourceProof.noDeploymentConfig,
  noAppsSdkResourceImplementation:
    sourceProof.noAppsSdkResourceImplementation,
  noAppSubmission: sourceProof.noAppSubmission,
  noDbQueriesAdded: sourceProof.noDbQueriesAdded,
  noSchemaMigrationsAdded: sourceProof.noSchemaMigrationsAdded,
  noPackageScriptsAdded: sourceProof.noPackageScriptsAdded,
  noPublicAssets: sourceProof.noPublicAssets,
  noListingCopy: sourceProof.noListingCopy,
  noGeneratedPublicProse: sourceProof.noGeneratedPublicProse,
  noOpenAiApiCalls: sourceProof.noOpenAiApiCalls,
  noModelCalls: sourceProof.noModelCalls,
  noProviderCalls: sourceProof.noProviderCalls,
  noExternalCommunications: sourceProof.noExternalCommunications,
  noSourceMutation: sourceProof.noSourceMutation,
  noFinanceWrite: sourceProof.noFinanceWrite,
  fp0130BoundaryVerified: planProof.fp0130BoundaryVerified,
  fp0131Absent: planProof.fp0131Absent,
  fp0129ChallengeImplementationSequencingBoundaryStillVerified:
    planProof.fp0129ChallengeImplementationSequencingBoundaryStillVerified,
  fp0128TokenValidationReadinessBoundaryStillVerified:
    planProof.fp0128TokenValidationReadinessBoundaryStillVerified,
  fp0127WwwAuthenticateAuthChallengeBoundaryStillVerified:
    planProof.fp0127WwwAuthenticateAuthChallengeBoundaryStillVerified,
  fp0125ProtectedResourceMetadataLocalRouteBoundaryStillVerified:
    planProof.fp0125ProtectedResourceMetadataLocalRouteBoundaryStillVerified,
  fp0123RouteInputEvidenceBoundaryStillVerified:
    planProof.fp0123RouteInputEvidenceBoundaryStillVerified,
  fp0122ProtectedResourceMetadataBuilderBoundaryStillVerified:
    planProof.fp0122ProtectedResourceMetadataBuilderBoundaryStillVerified,
  fp0120CanonicalResourceAuthServerBoundaryStillVerified:
    planProof.fp0120CanonicalResourceAuthServerBoundaryStillVerified,
  fp0107RouteAdapterBoundaryStillVerified:
    planProof.fp0107RouteAdapterBoundaryStillVerified,
  fp0106ProtocolEnvelopeBoundaryStillVerified:
    planProof.fp0106ProtocolEnvelopeBoundaryStillVerified,
  fp0100PublicSecurityBoundaryStillVerified:
    planProof.fp0100PublicSecurityBoundaryStillVerified,
};

for (const [key, value] of Object.entries(proof)) {
  if (typeof value === "boolean" && value !== true) {
    throw new Error(`FP-0130 missing-token challenge proof failed: ${key}`);
  }
}

console.log(
  JSON.stringify(
    {
      ...proof,
      proofDetails: {
        appProof,
        changedPaths,
        planProof,
        sourceProof,
      },
    },
    null,
    2,
  ),
);

async function verifyAppBehavior() {
  const apps = [];
  const explicitDependency =
    buildMcpWwwAuthenticateLocalProofGatedMissingTokenChallengeDependency();
  const metadataEvidenceBundle =
    buildProtectedResourceMetadataRouteInputEvidenceBundle(validRouteInput);

  try {
    const defaultApp = await buildApp({
      container: createInMemoryContainer(),
    });
    const explicitApp = await buildApp({
      container: {
        ...createInMemoryContainer(),
        readOnlyAppMcpLocalProofGatedMissingTokenChallenge: explicitDependency,
      },
    });
    const metadataApp = await buildApp({
      container: {
        ...createInMemoryContainer(),
        readOnlyAppMcpProtectedResourceMetadataRouteInputEvidenceBundle:
          metadataEvidenceBundle,
      },
    });
    apps.push(defaultApp, explicitApp, metadataApp);

    const defaultGet = await defaultApp.inject({
      headers: { accept: "text/event-stream" },
      method: "GET",
      url: "/mcp",
    });
    const defaultInitialize = await defaultApp.inject({
      method: "POST",
      payload: {
        id: "default-init",
        jsonrpc: "2.0",
        method: "initialize",
      },
      url: "/mcp",
    });
    const defaultPing = await defaultApp.inject({
      method: "POST",
      payload: { id: "default-ping", jsonrpc: "2.0", method: "ping" },
      url: "/mcp",
    });
    const defaultToolsList = await defaultApp.inject({
      method: "POST",
      payload: { id: "default-tools", jsonrpc: "2.0", method: "tools/list" },
      url: "/mcp",
    });
    const defaultToolsCall = await defaultApp.inject({
      method: "POST",
      payload: {
        id: "default-call",
        jsonrpc: "2.0",
        method: "tools/call",
        params: {
          arguments: { companyKey: "acme", query: "cash posture" },
          name: "search_evidence",
        },
      },
      url: "/mcp",
    });
    const defaultNotification = await defaultApp.inject({
      method: "POST",
      payload: { jsonrpc: "2.0", method: "notifications/initialized" },
      url: "/mcp",
    });
    const defaultOriginRejected = await defaultApp.inject({
      headers: { origin: "https://attacker.example" },
      method: "POST",
      payload: { id: "origin", jsonrpc: "2.0", method: "initialize" },
      url: "/mcp",
    });
    const explicitMissingAuthorization = await explicitApp.inject({
      method: "POST",
      payload: {
        id: "explicit-missing",
        jsonrpc: "2.0",
        method: "initialize",
      },
      url: "/mcp",
    });
    const explicitAuthorizationValue = "Bearer proof-token-material";
    const explicitAuthorizationPresent = await explicitApp.inject({
      headers: { authorization: explicitAuthorizationValue },
      method: "POST",
      payload: {
        id: "explicit-present",
        jsonrpc: "2.0",
        method: "initialize",
      },
      url: "/mcp",
    });
    const explicitGet = await explicitApp.inject({
      headers: { accept: "text/event-stream" },
      method: "GET",
      url: "/mcp",
    });
    const metadataResponse = await metadataApp.inject({
      method: "GET",
      url: READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
    });
    const rootMetadataResponse = await metadataApp.inject({
      method: "GET",
      url: "/.well-known/oauth-protected-resource",
    });

    const defaultTools = defaultToolsList
      .json()
      .result.tools.map((tool) => tool.name);
    const metadataBody = metadataResponse.json();
    const expectedMetadataBody = metadataEvidenceBundle.builderOutput.document;
    const challengeText = [
      explicitMissingAuthorization.headers["www-authenticate"],
      explicitMissingAuthorization.body,
      explicitAuthorizationPresent.body,
    ].join("\n");

    return {
      authorizationHeaderDoesNotAuthenticate:
        explicitAuthorizationPresent.statusCode === 401 &&
        explicitAuthorizationPresent.headers["www-authenticate"] ===
          undefined &&
        !explicitAuthorizationPresent.body.includes(explicitAuthorizationValue) &&
        !explicitAuthorizationPresent.body.includes("proof-token-material") &&
        explicitAuthorizationPresent.json().error ===
          "token_validation_runtime_not_implemented",
      defaultBuildAppMcpBehaviorUnchanged:
        defaultGet.statusCode === 405 &&
        defaultGet.headers.allow === "POST" &&
        defaultGet.headers["www-authenticate"] === undefined &&
        defaultGet.body === "" &&
        defaultInitialize.statusCode === 200 &&
        defaultInitialize.headers["www-authenticate"] === undefined &&
        defaultInitialize.json().result.capabilities.tools.listChanged ===
          false &&
        defaultPing.statusCode === 200 &&
        defaultPing.headers["www-authenticate"] === undefined &&
        JSON.stringify(defaultPing.json()) ===
          JSON.stringify({ id: "default-ping", jsonrpc: "2.0", result: {} }) &&
        JSON.stringify(defaultTools) === JSON.stringify([...MCP_TOOL_ALLOWLIST]) &&
        defaultToolsCall.statusCode === 200 &&
        defaultToolsCall.json().result.isError === true &&
        defaultToolsCall.json().result.structuredContent.refusalReason ===
          "tool_dispatch_not_implemented_until_later_finance_plan" &&
        defaultNotification.statusCode === 202 &&
        defaultNotification.body === "" &&
        defaultOriginRejected.statusCode === 403,
      explicitDependencyEnablesMissingTokenChallenge:
        explicitMissingAuthorization.statusCode === 401 &&
        explicitGet.statusCode === 405 &&
        explicitGet.headers["www-authenticate"] === undefined,
      missingAuthorizationReturns401Challenge:
        explicitMissingAuthorization.statusCode === 401,
      noProtectedResourceMetadataRouteBehaviorChange:
        metadataResponse.statusCode === 200 &&
        metadataResponse.headers["www-authenticate"] === undefined &&
        JSON.stringify(Object.keys(metadataBody).sort()) ===
          JSON.stringify([
            "authorization_servers",
            "bearer_methods_supported",
            "resource",
            "scopes_supported",
          ]) &&
        metadataBody.resource === expectedMetadataBody.resource &&
        JSON.stringify(metadataBody.authorization_servers) ===
          JSON.stringify(expectedMetadataBody.authorization_servers) &&
        JSON.stringify(metadataBody.bearer_methods_supported) ===
          JSON.stringify(expectedMetadataBody.bearer_methods_supported) &&
        JSON.stringify(metadataBody.scopes_supported) ===
          JSON.stringify(expectedMetadataBody.scopes_supported) &&
        rootMetadataResponse.statusCode === 404,
      noTokenMaterialInChallengeVerified:
        textHasMcpWwwAuthenticateMissingTokenChallengeNoPrivateMaterial(
          challengeText,
        ) &&
        !/proof-token-material|access_token|client_secret|companyKey|cookie|password|rawFinance|rawSource|refresh_token|session/u.test(
          challengeText,
        ),
      resourceMetadataReferenceVerified:
        explicitMissingAuthorization.json().resourceMetadata ===
          MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE &&
        !String(explicitMissingAuthorization.headers["www-authenticate"]).match(
          /localhost|127\.0\.0\.1|ngrok|companyKey|user\/|org\/|tenant\/|workspace\//iu,
        ),
      wwwAuthenticateBearerChallengeShapeVerified:
        explicitMissingAuthorization.headers["www-authenticate"] ===
        MCP_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_HEADER,
    };
  } finally {
    await Promise.all(apps.map((app) => app.close()));
  }
}

function verifySourceAndScope() {
  const routePathChanged = changedPaths.includes(MCP_ROUTE_PATH);
  const explicitChallengeRouteShape =
    countMatches(mcpRouteSource, /app\.post\("\/mcp"/gu) === 1 &&
    countMatches(mcpRouteSource, /app\.get\("\/mcp"/gu) === 1 &&
    /readOnlyAppMcpLocalProofGatedMissingTokenChallenge/u.test(
      mcpRouteSource,
    ) &&
    /(?:reply\s*)?\.header\(\s*["']WWW-Authenticate["']\s*,\s*challenge\.wwwAuthenticate\s*\)/u.test(
      mcpRouteSource,
    ) &&
    !/app\.(?:get|post|put|patch|delete)\("\/mcp\//u.test(mcpRouteSource);
  const metadataRouteShape =
    countMatches(metadataRouteSource, /app\.get\(/gu) === 1 &&
    /READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH/u.test(
      metadataRouteSource,
    ) &&
    !/WWW-Authenticate/iu.test(metadataRouteSource);

  return {
    noAppSubmission: !changedPaths.some((path) =>
      /(?:app-submission|submission-assets|public-listing|store-listing|listing-copy|screenshots)/iu.test(
        path,
      ),
    ),
    noAppsSdkResourceImplementation:
      !changedPaths.some((path) =>
        /(?:apps-sdk|app-submission|submission-assets)/iu.test(path),
      ) &&
      !/\b(?:registerResource|ui:\/\/|componentResource|iframe)\b/u.test(
        executableChangedSource,
      ),
    noAuthMiddlewareImplementation:
      !/\b(?:authMiddleware|authorizationMiddleware|routeGuard|verifyBearer|requireAuth|authenticateRequest|setCookie)\s*\(/u.test(
        executableChangedSource,
      ),
    noDbQueriesAdded:
      !changedPaths.some((path) => /^packages\/db\//u.test(path)) &&
      !/\b(?:from\s+["']drizzle|drizzle\s*\(|select\s*\(|insert\s*\(|update\s*\(|delete\s*\(|sql`)\b/u.test(
        executableChangedSource,
      ),
    noDeploymentConfig: !changedPaths.some((path) =>
      /(?:^|\/)(?:vercel\.json|netlify\.toml|render\.ya?ml|fly\.toml|railway\.json|railway\.toml|wrangler\.toml|apphosting\.ya?ml|Dockerfile|docker-compose\.ya?ml|\.github\/workflows\/.*\.ya?ml)$/iu.test(
        path,
      ),
    ),
    noExternalCommunications:
      !/\b(?:sendEmail|sendReport|contactCustomer|externalMessage)\s*\(/u.test(
        executableChangedSource,
      ),
    noFinanceWrite:
      !/\b(?:writeFinanceTwin|updateLedger|financeWrite|postLedger|createJournalEntry)\s*\(/u.test(
        executableChangedSource,
      ),
    noGeneratedPublicProse: !changedPaths.some((path) =>
      /(?:generated-public-prose|public-listing|store-listing)/iu.test(path),
    ),
    noListingCopy: !changedPaths.some((path) =>
      /(?:listing-copy|public-listing|store-listing)/iu.test(path),
    ),
    noModelCalls:
      !/\b(?:model\s*\.\s*create|models\s*\.\s*create|call\s*Model)\b/u.test(
        executableChangedSource,
      ),
    noNewRoutePath:
      explicitChallengeRouteShape &&
      metadataRouteShape &&
      !changedPaths.some(
        (path) =>
          /(?:^|\/)route\.ts$/u.test(path) &&
          path !== MCP_ROUTE_PATH &&
          path !== METADATA_ROUTE_PATH,
      ) &&
      !/app\.(?:get|post|put|patch|delete)\("\/\.well-known\/oauth-protected-resource"/u.test(
        mcpRouteSource,
      ),
    noOauthImplementation:
      !/\b(?:oauthCallback|authorizeUrl|tokenExchange|authorizationCode|pkceVerifier)\s*\(/u.test(
        executableChangedSource,
      ),
    noOpenAiApiCalls:
      !/\b(?:from\s+["']openai["']|require\s*\(\s*["']openai["']|new\s+OpenAI|responses\s*\.\s*create|chat\s*\.\s*completions|api\.openai\.com)\b/u.test(
        executableChangedSource,
      ),
    noPackageScriptsAdded:
      !changedPaths.includes("package.json") &&
      !changedPaths.some((path) => /\/package\.json$/u.test(path)),
    noProtectedResourceMetadataRouteBehaviorChange: metadataRouteShape,
    noProviderCalls:
      !/\b(?:providerConnect|callProvider|createProviderJob|deploy)\s*\(/u.test(
        executableChangedSource,
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
        executableChangedSource,
      ),
    noSchemaMigrationsAdded: !changedPaths.some(
      (path) =>
        /^packages\/db\//u.test(path) ||
        /(?:^|\/)migrations?\//iu.test(path) ||
        /\.(?:sql)$/iu.test(path),
    ),
    noSourceMutation:
      !/\b(?:uploadSource|mutateSource|rewriteSource|deleteSource)\s*\(/u.test(
        executableChangedSource,
      ),
    noTokenParsingRuntime:
      !/\b(?:decodeToken|parseToken|parseJwt|decodeJwt|jwtDecode|introspectToken)\s*\(/u.test(
        executableChangedSource,
      ),
    noTokenSessionStorage:
      !/\b(?:tokenStore|sessionStore|sessionHandler|refreshTokenStore|setCookie)\s*\(/u.test(
        executableChangedSource,
      ),
    noTokenValidationRuntime:
      !/\b(?:validateToken|verifyToken|tokenValidator|jwtVerify|verifyJwt|validateBearer|verifyBearer)\s*\(/u.test(
        executableChangedSource,
      ),
  };
}

function verifyPlanBoundaries() {
  return {
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
      countMatches(mcpRouteSource, /app\.post\("\/mcp"/gu) === 1 &&
      countMatches(mcpRouteSource, /app\.get\("\/mcp"/gu) === 1,
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
    fp0125ProtectedResourceMetadataLocalRouteBoundaryStillVerified:
      docsBoundary(FP0125_PLAN, [
        "local-only/read-only",
        "/.well-known/oauth-protected-resource/mcp",
      ]) &&
      countMatches(metadataRouteSource, /app\.get\(/gu) === 1 &&
      !/WWW-Authenticate/iu.test(metadataRouteSource),
    fp0127WwwAuthenticateAuthChallengeBoundaryStillVerified:
      verifyFp0127WwwAuthenticateAuthChallengeContractsBoundary({
        planText: safeRead(
          FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH,
        ),
        repoPaths,
      }),
    fp0128TokenValidationReadinessBoundaryStillVerified:
      verifyFp0128TokenValidationReadinessContractsBoundary({
        planText: safeRead(
          FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH,
        ),
        repoPaths,
      }),
    fp0129ChallengeImplementationSequencingBoundaryStillVerified:
      verifyFp0129WwwAuthenticateChallengeImplementationSequencingPlanBoundary({
        planText: safeRead(
          FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
        ),
        repoPaths,
      }),
    fp0130BoundaryVerified:
      verifyFp0130LocalMissingTokenChallengeImplementationBoundary({
        planText: safeRead(
          FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH,
        ),
        repoPaths,
      }),
    fp0131Absent: verifyFp0131Absent(repoPaths),
  };
}

function docsBoundary(path, requiredTexts) {
  if (!existsSync(path)) return false;
  const normalized = normalize(safeRead(path));
  return requiredTexts.every((requiredText) =>
    normalized.includes(normalize(requiredText)),
  );
}

function changedExecutableSource() {
  return changedPaths
    .filter((path) => /\.(?:ts|tsx|js|mjs|cjs)$/u.test(path))
    .filter((path) => !path.endsWith(".spec.ts"))
    .filter((path) => !path.startsWith("tools/"))
    .filter((path) => !/^packages\/domain\/src\/.*(?:inventory|proof).*\.ts$/u.test(path))
    .filter((path) => existsSync(path))
    .map(safeRead)
    .join("\n");
}

function changedFilePaths() {
  const dirtyPaths = readGitLines(["status", "--short", "--untracked-files=all"])
    .map((line) =>
      line
        .replace(/^[A-Z?! ]{1,2}\s+/u, "")
        .replace(/.* -> /u, "")
        .trim(),
    )
    .filter(Boolean);
  const branchDiffPaths = readGitLines(["diff", "--name-only", "origin/main...HEAD"]);
  const headDiffPaths = readGitLines(["diff", "--name-only", "HEAD"]);
  return [...new Set([...branchDiffPaths, ...headDiffPaths, ...dirtyPaths])]
    .filter(Boolean)
    .sort();
}

function readGitLines(args) {
  try {
    return execFileSync("git", args, { encoding: "utf8" })
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function repoFilePaths(dir = process.cwd(), prefix = "") {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git" || entry.name === "node_modules") return [];
    const absolutePath = join(dir, entry.name);
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return repoFilePaths(absolutePath, relativePath);
    return [relativePath];
  });
}

function safeRead(path) {
  return readFileSync(path, "utf8");
}

function countMatches(value, pattern) {
  return value.match(pattern)?.length ?? 0;
}

function normalize(value) {
  return value.toLowerCase().replace(/[`'"]/gu, "").replace(/\s+/gu, " ");
}
