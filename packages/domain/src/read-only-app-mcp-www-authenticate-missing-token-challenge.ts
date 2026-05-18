import { z } from "zod";
import {
  MCP_WWW_AUTHENTICATE_CHALLENGE_SCHEME,
  MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE,
  MCP_WWW_AUTHENTICATE_RESOURCE_METADATA_PARAMETER,
} from "./read-only-app-mcp-www-authenticate-contracts";
import { scanWwwAuthenticateNoTokenLeakage } from "./read-only-app-mcp-www-authenticate-leakage-validation";

const trueLiteral = z.literal(true);

export const MCP_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_SCHEMA_VERSION =
  "v2ax.read-only-app-mcp-www-authenticate-missing-token-challenge.v1";

export const MCP_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_AUTHORIZATION_HEADER_BEHAVIOR =
  "fail_closed_no_token_validation_runtime" as const;

export const MCP_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_HEADER =
  `${MCP_WWW_AUTHENTICATE_CHALLENGE_SCHEME} ${MCP_WWW_AUTHENTICATE_RESOURCE_METADATA_PARAMETER}="${MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE}"`;

export const McpWwwAuthenticateLocalProofGatedMissingTokenChallengeDependencySchema =
  z
    .object({
      schemaVersion: z.literal(
        MCP_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_SCHEMA_VERSION,
      ),
      authorizationHeaderBehavior: z.literal(
        MCP_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_AUTHORIZATION_HEADER_BEHAVIOR,
      ),
      explicitDependencyOnly: trueLiteral,
      localOnly: trueLiteral,
      missingTokenOnly: trueLiteral,
      noAppSubmission: trueLiteral,
      noAppsSdkResourceImplementation: trueLiteral,
      noAuthMiddlewareImplementation: trueLiteral,
      noDbQueriesAdded: trueLiteral,
      noDeploymentConfig: trueLiteral,
      noFinanceWrite: trueLiteral,
      noNewRoutePath: trueLiteral,
      noOauthImplementation: trueLiteral,
      noOpenAiApiCalls: trueLiteral,
      noPackageScriptsAdded: trueLiteral,
      noProtectedResourceMetadataRouteBehaviorChange: trueLiteral,
      noProviderCalls: trueLiteral,
      noRemoteMcpDeployment: trueLiteral,
      noSchemaMigrationsAdded: trueLiteral,
      noSourceMutation: trueLiteral,
      noTokenMaterialInChallenge: trueLiteral,
      noTokenParsingRuntime: trueLiteral,
      noTokenSessionStorage: trueLiteral,
      noTokenValidationRuntime: trueLiteral,
      proofGated: trueLiteral,
      readOnly: trueLiteral,
      resourceMetadataReference: z.literal(
        MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE,
      ),
      wwwAuthenticate: z.literal(
        MCP_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_HEADER,
      ),
    })
    .strict();

export type McpWwwAuthenticateLocalProofGatedMissingTokenChallengeDependency =
  z.infer<
    typeof McpWwwAuthenticateLocalProofGatedMissingTokenChallengeDependencySchema
  >;

export const McpWwwAuthenticateMissingTokenChallengeBodySchema = z
  .object({
    error: z.literal("authorization_required"),
    explicitDependencyOnly: trueLiteral,
    localOnly: trueLiteral,
    message: z.literal(
      "Authorization is required for this local read-only MCP preview.",
    ),
    missingTokenOnly: trueLiteral,
    readOnly: trueLiteral,
    resourceMetadata: z.literal(
      MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE,
    ),
  })
  .strict();

export type McpWwwAuthenticateMissingTokenChallengeBody = z.infer<
  typeof McpWwwAuthenticateMissingTokenChallengeBodySchema
>;

export const McpWwwAuthenticateAuthorizationHeaderNoValidationBodySchema = z
  .object({
    error: z.literal("token_validation_runtime_not_implemented"),
    failClosed: trueLiteral,
    localOnly: trueLiteral,
    message: z.literal(
      "Authorization was supplied, but this local read-only MCP preview does not implement token validation.",
    ),
    noTokenParsingRuntime: trueLiteral,
    noTokenValidationRuntime: trueLiteral,
    readOnly: trueLiteral,
  })
  .strict();

export type McpWwwAuthenticateAuthorizationHeaderNoValidationBody = z.infer<
  typeof McpWwwAuthenticateAuthorizationHeaderNoValidationBodySchema
>;

export function buildMcpWwwAuthenticateLocalProofGatedMissingTokenChallengeDependency(): McpWwwAuthenticateLocalProofGatedMissingTokenChallengeDependency {
  return McpWwwAuthenticateLocalProofGatedMissingTokenChallengeDependencySchema.parse(
    {
      schemaVersion:
        MCP_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_SCHEMA_VERSION,
      authorizationHeaderBehavior:
        MCP_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_AUTHORIZATION_HEADER_BEHAVIOR,
      explicitDependencyOnly: true,
      localOnly: true,
      missingTokenOnly: true,
      noAppSubmission: true,
      noAppsSdkResourceImplementation: true,
      noAuthMiddlewareImplementation: true,
      noDbQueriesAdded: true,
      noDeploymentConfig: true,
      noFinanceWrite: true,
      noNewRoutePath: true,
      noOauthImplementation: true,
      noOpenAiApiCalls: true,
      noPackageScriptsAdded: true,
      noProtectedResourceMetadataRouteBehaviorChange: true,
      noProviderCalls: true,
      noRemoteMcpDeployment: true,
      noSchemaMigrationsAdded: true,
      noSourceMutation: true,
      noTokenMaterialInChallenge: true,
      noTokenParsingRuntime: true,
      noTokenSessionStorage: true,
      noTokenValidationRuntime: true,
      proofGated: true,
      readOnly: true,
      resourceMetadataReference:
        MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE,
      wwwAuthenticate: MCP_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_HEADER,
    },
  );
}

export function assertMcpWwwAuthenticateLocalProofGatedMissingTokenChallengeDependency(
  input: unknown,
): McpWwwAuthenticateLocalProofGatedMissingTokenChallengeDependency {
  const dependency =
    McpWwwAuthenticateLocalProofGatedMissingTokenChallengeDependencySchema.parse(
      input,
    );
  assertNoPrivateChallengeMaterial(
    dependency.wwwAuthenticate,
    buildMcpWwwAuthenticateMissingTokenChallengeBody(),
  );
  return dependency;
}

export function buildMcpWwwAuthenticateMissingTokenChallengeResponse(
  dependency: McpWwwAuthenticateLocalProofGatedMissingTokenChallengeDependency,
) {
  const body = buildMcpWwwAuthenticateMissingTokenChallengeBody();
  assertNoPrivateChallengeMaterial(dependency.wwwAuthenticate, body);

  return {
    body,
    statusCode: 401 as const,
    wwwAuthenticate: dependency.wwwAuthenticate,
  };
}

export function buildMcpWwwAuthenticateAuthorizationHeaderNoValidationResponse() {
  const body =
    McpWwwAuthenticateAuthorizationHeaderNoValidationBodySchema.parse({
      error: "token_validation_runtime_not_implemented",
      failClosed: true,
      localOnly: true,
      message:
        "Authorization was supplied, but this local read-only MCP preview does not implement token validation.",
      noTokenParsingRuntime: true,
      noTokenValidationRuntime: true,
      readOnly: true,
    });
  assertNoPrivateChallengeMaterial("", body);

  return {
    body,
    statusCode: 401 as const,
  };
}

export function textHasMcpWwwAuthenticateMissingTokenChallengeNoPrivateMaterial(
  text: string,
) {
  return scanWwwAuthenticateNoTokenLeakage(text).accepted;
}

function buildMcpWwwAuthenticateMissingTokenChallengeBody() {
  return McpWwwAuthenticateMissingTokenChallengeBodySchema.parse({
    error: "authorization_required",
    explicitDependencyOnly: true,
    localOnly: true,
    message: "Authorization is required for this local read-only MCP preview.",
    missingTokenOnly: true,
    readOnly: true,
    resourceMetadata: MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE,
  });
}

function assertNoPrivateChallengeMaterial(
  header: string,
  body:
    | McpWwwAuthenticateMissingTokenChallengeBody
    | McpWwwAuthenticateAuthorizationHeaderNoValidationBody,
) {
  const scan = scanWwwAuthenticateNoTokenLeakage(
    `${header}\n${JSON.stringify(body)}`,
  );
  if (!scan.accepted) {
    throw new Error(
      `MCP WWW-Authenticate missing-token challenge contains forbidden material: ${scan.rejectionReasons.join(
        ", ",
      )}`,
    );
  }
}
