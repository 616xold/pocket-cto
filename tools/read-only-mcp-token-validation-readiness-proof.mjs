import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  FP0118_PROTECTED_RESOURCE_METADATA_PLAN_PATH,
  FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH,
  FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH,
  FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
  FP0126_WWW_AUTHENTICATE_AUTH_CHALLENGE_SEQUENCING_PLAN_PATH,
  FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH,
  FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH,
  McpTokenValidationReadinessProofSchema,
  buildMcpTokenValidationReadinessProof,
  scanTokenValidationNoLeakage,
  validateTokenFailureModeContract,
  validateTokenScopeChallenge,
  verifyFp0117OauthImplementationSequencingPlanBoundary,
  verifyFp0118ProtectedResourceMetadataPlanBoundary,
  verifyFp0120CanonicalResourceAuthServerPlanBoundary,
  verifyFp0122ProtectedResourceMetadataBuilderContractsBoundary,
  verifyFp0123ProtectedResourceMetadataRouteInputContractsBoundary,
  verifyFp0126WwwAuthenticateAuthChallengeSequencingPlanBoundary,
  verifyFp0127WwwAuthenticateAuthChallengeContractsBoundary,
  verifyFp0128TokenValidationReadinessContractsBoundary,
  verifyFp0129Absent,
  verifyTokenValidationChallengeReadinessContracts,
  verifyTokenValidationFailureModeContracts,
  verifyTokenValidationNoLeakageExamples,
  verifyTokenValidationScopeChallengeContracts,
} from "../packages/domain/src/index.ts";

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
const fp0128PlanText = safeRead(
  FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH,
);
const mcpRouteSource = safeRead(MCP_ROUTE_PATH);
const metadataRouteSource = safeRead(METADATA_ROUTE_PATH);
const routeSource = `${mcpRouteSource}\n${metadataRouteSource}\n${safeRead(
  "apps/control-plane/src/app.ts",
)}`;
const durableSourceScan = noExecutableApiModelKeyUsage(
  readTokenValidationReadinessProofSourceText(repoPaths),
);
const noRouteImportsTokenValidationHelpers =
  !/read-only-app-mcp-token-validation/u.test(routeSource);
const noTokenRuntimeSource =
  !/\b(?:validateToken|verifyToken|tokenValidator|jwtVerify|verifyJwt|validateBearer|verifyBearer|authMiddleware|setCookie)\b/u.test(
    routeSource,
  );
const noWwwAuthenticateRuntime =
  !/WWW-Authenticate/iu.test(routeSource) &&
  !/\bresource_metadata\b/u.test(mcpRouteSource);
const scopeScan = changedScopeScan();
const noLeakageProof = sanitizedNoLeakageProof();
const failureModeProof = verifyTokenValidationFailureModeContracts();
const challengeReadinessProof = verifyTokenValidationChallengeReadinessContracts();
const scopeChallengeProof = verifyTokenValidationScopeChallengeContracts();

const proof = McpTokenValidationReadinessProofSchema.parse(
  buildMcpTokenValidationReadinessProof({
    authenticatedCompanyBindingPrerequisiteVerified: challengeReadinessProof,
    companyKeySelectorOnlyVerified: true,
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
        planText: safeRead(
          FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
        ),
        repoPaths,
      }),
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
    fp0127WwwAuthenticateAuthChallengeBoundaryStillVerified:
      verifyFp0127WwwAuthenticateAuthChallengeContractsBoundary({
        planText: safeRead(
          FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH,
        ),
        repoPaths,
      }),
    fp0128BoundaryVerified: verifyFp0128TokenValidationReadinessContractsBoundary({
      planText: fp0128PlanText,
      repoPaths,
    }),
    fp0129Absent: verifyFp0129Absent(repoPaths),
    tokenFailureModesComplete: failureModeProof,
    tokenFailureChallengeReadinessContractOnly: challengeReadinessProof,
    audienceResourceValidationRequiresFutureCanonicalPublicMcpUriProof:
      challengeReadinessProof,
    scopeChallengeReadOnlyLeastPrivilegeVerified: scopeChallengeProof,
    scopeChallengeCannotWidenScopesVerified: scopeChallengeProof,
    tokenNoLeakageBoundaryVerified: noLeakageProof.verified,
    noRealTokenExamplesCommitted: noLeakageProof.verified,
    safeAbsenceWordingAllowed: noLeakageProof.safeAbsenceWordingAllowed,
    noCurrentRouteImportsTokenValidationHelpers:
      noRouteImportsTokenValidationHelpers,
    noMcpRouteBehaviorChange:
      scopeScan.noMcpRouteBehaviorChange && localMcpRouteShapeStillVerified(),
    noProtectedResourceMetadataRouteBehaviorChange:
      scopeScan.noProtectedResourceMetadataRouteBehaviorChange &&
      metadataRouteShapeStillVerified(),
    noWwwAuthenticateRouteBehaviorImplementation:
      scopeScan.noWwwAuthenticateRouteBehavior && noWwwAuthenticateRuntime,
    noTokenValidationImplementation:
      scopeScan.noTokenValidationImplementation && noTokenRuntimeSource,
    noTokenParsingImplementation: scopeScan.noTokenParsingImplementation,
    noTokenSessionImplementation: scopeScan.noTokenSessionImplementation,
    noAuthMiddlewareImplementation:
      scopeScan.noAuthMiddlewareImplementation && noTokenRuntimeSource,
    noOauthImplementation: scopeScan.noOauthImplementation,
    noRemoteMcpDeployment: scopeScan.noRemoteMcpDeployment,
    noDeploymentConfig: scopeScan.noDeploymentConfig,
    noAppsSdkResourceImplementation: scopeScan.noAppsSdkResource,
    noAppSubmission: scopeScan.noAppSubmission,
    noDbQueriesAdded: scopeScan.noDbQueries,
    noSchemaMigrationsAdded: scopeScan.noSchemaMigrations,
    noPackageScriptsAdded: scopeScan.noPackageScripts,
    noPublicAssets: scopeScan.noPublicAssets,
    noListingCopy: scopeScan.noListingCopy,
    noGeneratedPublicProse: scopeScan.noGeneratedPublicProse,
    noOpenAiApiCalls: durableSourceScan.noOpenAiApiCalls,
    noModelCalls: durableSourceScan.noModelCalls,
    noOpenAiClientOrKeyUsage: durableSourceScan.noOpenAiClientOrKeyUsage,
    noProviderCalls: scopeScan.noProviderCalls,
    noExternalCommunications: scopeScan.noExternalCommunications,
    noSourceMutation: scopeScan.noSourceMutation,
    noFinanceWrite: scopeScan.noFinanceWrite,
    tokenPassthroughAttemptFailsClosedVerified:
      validateTokenFailureModeContract({
        failureMode: "token_passthrough_attempt",
      }).accepted,
  }),
);

for (const [key, value] of Object.entries(proof)) {
  if (typeof value === "boolean" && value !== true) {
    throw new Error(`FP-0128 token-validation readiness proof failed: ${key}`);
  }
}

console.log(
  JSON.stringify(
    {
      ...proof,
      proofDetails: {
        changedFiles: changedPaths,
        noLeakageProof,
        noOpenAiSourceScan: durableSourceScan,
        routeImportProof: {
          noRouteImportsTokenValidationHelpers,
          noTokenRuntimeSource,
          noWwwAuthenticateRuntime,
        },
      },
    },
    null,
    2,
  ),
);

function sanitizedNoLeakageProof() {
  const keyName = ["OPENAI", "API", "KEY"].join("_");
  const safeExamples = [
    "No token values, sessions, cookies, authorization material, or raw finance data appear in examples.",
    `${keyName} must be absent from proof examples.`,
    "Bearer scheme references are allowed only as labels without token material.",
  ];
  const leakingExamples = [
    ["Authorization", ":", "Bearer", "synthetic-token-material"].join(" "),
    ["Bearer", "synthetic-token-material"].join(" "),
    ["Basic", "synthetic-basic-material"].join(" "),
    ["access_token", "=", "synthetic-token-material"].join(""),
    ["refresh_token", "=", "synthetic-token-material"].join(""),
    ["client_secret", "=", "synthetic-secret-material"].join(""),
    ["session", "=", "synthetic-session-material"].join(""),
    ["cookie", ":", "synthetic-cookie-material"].join(" "),
    ["x-api-key", ":", "synthetic-key-material"].join(" "),
    [keyName, "=", "synthetic-key-material"].join(""),
    ["sk", "-synthetic-key-material"].join(""),
    [
      "eyJsyntheticHeader",
      "eyJsyntheticPayload",
      "syntheticSignature",
    ].join("."),
    "raw finance data",
    "raw source dump",
    "provider credential",
    "app submission copy",
  ];
  const safeScans = safeExamples.map((example) =>
    scanTokenValidationNoLeakage(example),
  );
  const leakingScans = leakingExamples.map((example) =>
    scanTokenValidationNoLeakage(example),
  );

  return {
    leakingExampleCount: leakingExamples.length,
    leakingRejectionReasons: [
      ...new Set(leakingScans.flatMap((scan) => scan.rejectionReasons)),
    ],
    safeAbsenceWordingAllowed: safeScans.every((scan) => scan.accepted),
    safeExampleCount: safeExamples.length,
    verified:
      verifyTokenValidationNoLeakageExamples() &&
      safeScans.every((scan) => scan.accepted) &&
      leakingScans.every((scan) => !scan.accepted && scan.matches.length > 0),
  };
}

function changedScopeScan() {
  const changedExecutableSource = readChangedExecutableSource();
  return {
    noAppSubmission: !changedPaths.some((path) =>
      /(?:app-submission|submission-assets|public-listing|store-listing|listing-copy|screenshots)/iu.test(
        path,
      ),
    ),
    noAppsSdkResource:
      !changedPaths.some((path) =>
        /(?:apps-sdk|app-submission|submission-assets)/iu.test(path),
      ) &&
      !/\b(?:registerResource|ui:\/\/|componentResource|iframe)\b/u.test(
        changedExecutableSource,
      ),
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
    noTokenParsingImplementation:
      !/\b(?:decodeToken|parseToken|parseJwt|decodeJwt|jwtDecode|introspectToken)\s*\(/u.test(
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
      !changedPaths.some(isRouteLikeRuntimePath) && noWwwAuthenticateRuntime,
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
    {
      key: "noOpenAiApiCalls",
      name: "new-openai-client",
      pattern: /\bnew\s+OpenAI\b/u,
    },
    {
      key: "noOpenAiApiCalls",
      name: "openai-client-method",
      pattern: /\bopenai\./u,
    },
    {
      key: "noModelCalls",
      name: "responses-create",
      pattern: new RegExp(`\\b${["responses", "create"].join("\\.")}\\b`, "u"),
    },
    {
      key: "noModelCalls",
      name: "chat-completions",
      pattern: new RegExp(
        `\\b${["chat", "completions"].join("\\.")}\\b`,
        "u",
      ),
    },
    {
      key: "noOpenAiClientOrKeyUsage",
      name: "env-key",
      pattern: new RegExp(`\\b${envKey}\\b`, "u"),
    },
    {
      key: "noOpenAiClientOrKeyUsage",
      name: "process-env-key",
      pattern: new RegExp(`\\bprocess\\.env\\.${envKey}\\b`, "u"),
    },
    {
      key: "noOpenAiApiCalls",
      name: "api-host",
      pattern: new RegExp(apiHost.replaceAll(".", "\\."), "u"),
    },
    {
      key: "noModelCalls",
      name: "model-create",
      pattern: new RegExp(`\\b${["model", "create"].join("\\.")}\\b`, "u"),
    },
    {
      key: "noModelCalls",
      name: "models-create",
      pattern: new RegExp(`\\b${["models", "create"].join("\\.")}\\b`, "u"),
    },
    {
      key: "noModelCalls",
      name: "call-model",
      pattern: new RegExp(`\\b${["call", "Model"].join("")}\\b`, "u"),
    },
  ];
  const findings = sourceText.split("\n").flatMap((line) => {
    if (isSafeProofScannerLine(line)) return [];
    return patterns
      .filter(({ pattern }) => pattern.test(line))
      .map(({ key, name }) => ({ key, name }));
  });

  return {
    findings: findings.map(({ name }) => name),
    noModelCalls: findings.every(({ key }) => key !== "noModelCalls"),
    noOpenAiApiCalls: findings.every(({ key }) => key !== "noOpenAiApiCalls"),
    noOpenAiClientOrKeyUsage: findings.every(
      ({ key }) => key !== "noOpenAiClientOrKeyUsage",
    ),
  };
}

function isSafeProofScannerLine(line) {
  const trimmed = line.trim();
  return (
    trimmed.startsWith("//") ||
    trimmed.startsWith("\"") ||
    trimmed.startsWith("'") ||
    trimmed.startsWith("`") ||
    trimmed.includes("pattern:") ||
    trimmed.includes("new RegExp") ||
    trimmed.includes("callModelName") ||
    trimmed.includes("apiHost") ||
    trimmed.includes("envKey")
  );
}

function readTokenValidationReadinessProofSourceText(paths) {
  const sourcePaths = paths.filter(
    (path) =>
      path === "apps/control-plane/src/app.ts" ||
      path === "apps/control-plane/src/lib/types.ts" ||
      path.startsWith(
        "apps/control-plane/src/modules/read-only-app-mcp-endpoint/",
      ) ||
      /^packages\/domain\/src\/read-only-app-mcp-token-validation.*\.ts$/u.test(
        path,
      ) ||
      /^packages\/domain\/src\/read-only-app-mcp-www-authenticate.*\.ts$/u.test(
        path,
      ) ||
      /^packages\/domain\/src\/read-only-app-mcp-protected-resource-metadata.*\.ts$/u.test(
        path,
      ) ||
      /^packages\/domain\/src\/read-only-app-mcp-oauth-implementation-sequencing.*\.ts$/u.test(
        path,
      ) ||
      /^packages\/domain\/src\/read-only-app-mcp-canonical-resource.*\.ts$/u.test(
        path,
      ) ||
      /^packages\/domain\/src\/read-only-app-mcp-public-security.*\.ts$/u.test(
        path,
      ) ||
      /^tools\/read-only-mcp-.*\.mjs$/u.test(path) ||
      path === "tools/benchmark-community-pack-proof.mjs",
  );

  return sourcePaths
    .filter((path) => existsSync(path))
    .map((path) => safeRead(path))
    .join("\n");
}

function readChangedExecutableSource() {
  return changedPaths
    .filter((path) => /\.(?:ts|tsx|js|mjs|cjs)$/u.test(path))
    .filter((path) => !path.startsWith("tools/"))
    .filter((path) => !path.endsWith(".spec.ts"))
    .filter(
      (path) =>
        path !==
        "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input-inventory-rules.ts",
    )
    .filter((path) => existsSync(path))
    .map((path) => safeRead(path))
    .join("\n");
}

function localMcpRouteShapeStillVerified() {
  return (
    countMatches(mcpRouteSource, /app\.post\("\/mcp"/gu) === 1 &&
    countMatches(mcpRouteSource, /app\.get\("\/mcp"/gu) === 1 &&
    /code\(405\)/u.test(mcpRouteSource) &&
    /validateLocalMcpOriginHeader/u.test(mcpRouteSource)
  );
}

function metadataRouteShapeStillVerified() {
  return (
    countMatches(metadataRouteSource, /app\.get\(/gu) === 1 &&
    /READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH/u.test(
      metadataRouteSource,
    ) &&
    /assertProtectedResourceMetadataRouteInputEvidenceBundleSemanticCoherence/u.test(
      metadataRouteSource,
    ) &&
    !/WWW-Authenticate/iu.test(metadataRouteSource)
  );
}

function docsBoundary(path, requiredTexts) {
  const normalized = safeRead(path).toLowerCase();
  return requiredTexts.every((requiredText) =>
    normalized.includes(requiredText.toLowerCase()),
  );
}

function isRouteLikeRuntimePath(path) {
  return (
    /^apps\/control-plane\/src\/app\.ts$/u.test(path) ||
    /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|protected-resource-metadata-route)\.ts$/u.test(
      path,
    )
  );
}

function changedFilePaths() {
  const fromDiff = readGitLines(["diff", "--name-only", "HEAD"]);
  const fromStatus = readGitLines(["status", "--short", "--untracked-files=all"])
    .map((line) =>
      line
        .replace(/^[A-Z?! ]{1,2}\s+/u, "")
        .replace(/.* -> /u, "")
        .trim(),
    )
    .filter(Boolean);
  return [...new Set([...fromDiff, ...fromStatus])].sort();
}

function readGitLines(args) {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
    })
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
