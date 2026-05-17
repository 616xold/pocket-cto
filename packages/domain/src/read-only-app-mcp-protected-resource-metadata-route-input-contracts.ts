import { z } from "zod";
import { MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH } from "./read-only-app-mcp-canonical-resource-contracts";
import {
  McpProtectedResourceMetadataBuilderDocumentSchema,
} from "./read-only-app-mcp-protected-resource-metadata-builder-contracts";
import type { McpProtectedResourceMetadataBuilderInputSchema } from "./read-only-app-mcp-protected-resource-metadata-builder-contracts";

const trueLiteral = z.literal(true);
const falseLiteral = z.literal(false);

export const MCP_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_SCHEMA_VERSION =
  "v2aq.read-only-app-mcp-protected-resource-metadata-route-input.v1";

export const FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH =
  "plans/FP-0123-read-only-chatgpt-app-mcp-protected-resource-metadata-route-input-evidence-contracts.md";

export const FP0124_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLAN_PATH =
  "plans/FP-0124-read-only-chatgpt-app-mcp-protected-resource-metadata-route-implementation-master-plan.md";

export const FP0124_PLAN_PREFIX = "FP-0124";

export const FP0125_PLAN_PREFIX = "FP-0125";

export const FP0125_PROTECTED_RESOURCE_METADATA_LOCAL_ROUTE_IMPLEMENTATION_PLAN_PATH =
  "plans/FP-0125-read-only-chatgpt-app-mcp-protected-resource-metadata-local-route-implementation.md";

export const FP0125_PROTECTED_RESOURCE_METADATA_LOCAL_ROUTE_MODULE_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.ts";

export const MCP_ROUTE_INPUT_EXPECTED_MCP_METADATA_ROUTE_PATH =
  `${MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH}/mcp`;

export const McpProtectedResourceMetadataRouteInputContractKindSchema = z.enum([
  "McpProtectedResourceMetadataRouteInputProofContract",
  "McpProtectedResourceMetadataRouteInputEvidenceBundleBoundary",
  "McpProtectedResourceMetadataRouteInputCanonicalUriEvidenceBoundary",
  "McpProtectedResourceMetadataRouteInputAuthorizationServerEvidenceBoundary",
  "McpProtectedResourceMetadataRouteInputPathDecisionBoundary",
  "McpProtectedResourceMetadataRouteInputBuilderOutputBoundary",
  "McpProtectedResourceMetadataRouteInputNoTokenLeakageBoundary",
  "McpProtectedResourceMetadataRouteInputCompanyBindingPrerequisiteBoundary",
  "McpProtectedResourceMetadataRouteInputMcpUnchangedBoundary",
  "McpProtectedResourceMetadataRouteInputNoRuntimeBoundary",
]);

const BaseRouteInputContractSchema = z
  .object({
    schemaVersion: z.literal(
      MCP_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_SCHEMA_VERSION,
    ),
    contractKind: McpProtectedResourceMetadataRouteInputContractKindSchema,
    localProofOnly: trueLiteral,
    readOnly: trueLiteral,
    implementationAdded: falseLiteral,
  })
  .strict();

export const McpProtectedResourceMetadataRouteInputProofContractSchema =
  BaseRouteInputContractSchema.extend({
    contractKind: z.literal(
      "McpProtectedResourceMetadataRouteInputProofContract",
    ),
    contractOnly: trueLiteral,
    noRouteBehaviorChange: trueLiteral,
    noNewRoutePath: trueLiteral,
    noProtectedResourceMetadataRouteImplementation: trueLiteral,
    noWwwAuthenticateRouteBehaviorImplementation: trueLiteral,
    noOauthImplementation: trueLiteral,
    noTokenSessionImplementation: trueLiteral,
    noAuthMiddlewareImplementation: trueLiteral,
    noRemoteMcpDeployment: trueLiteral,
    noDeploymentConfig: trueLiteral,
    noAppsSdkResourceImplementation: trueLiteral,
    noAppSubmission: trueLiteral,
    noDbQueriesAdded: trueLiteral,
    noSchemaMigrationsAdded: trueLiteral,
    noPackageScriptsAdded: trueLiteral,
    noPublicAssets: trueLiteral,
    noListingCopy: trueLiteral,
    noGeneratedPublicProse: trueLiteral,
    noOpenAiApiCalls: trueLiteral,
    noModelCalls: trueLiteral,
    noOpenAiClientOrKeyUsage: trueLiteral,
    noProviderCalls: trueLiteral,
    noExternalCommunications: trueLiteral,
    noSourceMutation: trueLiteral,
    noFinanceWrite: trueLiteral,
  }).strict();

export const McpProtectedResourceMetadataRouteInputEvidenceBundleBoundarySchema =
  BaseRouteInputContractSchema.extend({
    contractKind: z.literal(
      "McpProtectedResourceMetadataRouteInputEvidenceBundleBoundary",
    ),
    routeInputEvidenceBundleOnly: trueLiteral,
    routeRuntimeInputAllowed: falseLiteral,
    requiresCanonicalUriEvidence: trueLiteral,
    requiresAuthorizationServerEvidence: trueLiteral,
    requiresBuilderOutputOrBuilderValidInput: trueLiteral,
    requiresNoTokenLeakageProof: trueLiteral,
    requiresCompanyBindingPrerequisite: trueLiteral,
    requiresMcpUnchangedPrerequisite: trueLiteral,
  }).strict();

export const McpProtectedResourceMetadataRouteInputCanonicalUriEvidenceBoundarySchema =
  BaseRouteInputContractSchema.extend({
    contractKind: z.literal(
      "McpProtectedResourceMetadataRouteInputCanonicalUriEvidenceBoundary",
    ),
    acceptedFp0120CanonicalUriRequired: trueLiteral,
    credentialBearingUriAllowed: falseLiteral,
    userinfoCredentialsAllowed: falseLiteral,
    queryStringAllowed: falseLiteral,
    fragmentAllowed: falseLiteral,
    selectorAuthorityAllowed: falseLiteral,
    localTunnelAllowed: falseLiteral,
  }).strict();

export const McpProtectedResourceMetadataRouteInputAuthorizationServerEvidenceBoundarySchema =
  BaseRouteInputContractSchema.extend({
    contractKind: z.literal(
      "McpProtectedResourceMetadataRouteInputAuthorizationServerEvidenceBoundary",
    ),
    credentialFreeAuthorizationServersRequired: trueLiteral,
    authorizationServersMustBeNonEmpty: trueLiteral,
    authorizationServersMustBeHttps: trueLiteral,
    providerNeutralUntilLaterPlan: trueLiteral,
    unsafeScopesAllowed: falseLiteral,
    queryBearerMethodAllowed: falseLiteral,
  }).strict();

export const McpProtectedResourceMetadataRouteInputPathDecisionBoundarySchema =
  BaseRouteInputContractSchema.extend({
    contractKind: z.literal(
      "McpProtectedResourceMetadataRouteInputPathDecisionBoundary",
    ),
    routePathDerivedFromCanonicalResourceUri: trueLiteral,
    rfc9728WellKnownPath: z.literal(
      MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH,
    ),
    mcpCanonicalResourcePath: z.literal("/mcp"),
    expectedMcpDerivedRoutePath: z.literal(
      MCP_ROUTE_INPUT_EXPECTED_MCP_METADATA_ROUTE_PATH,
    ),
    routeImplementationAdded: falseLiteral,
  }).strict();

export const McpProtectedResourceMetadataRouteInputBuilderOutputBoundarySchema =
  BaseRouteInputContractSchema.extend({
    contractKind: z.literal(
      "McpProtectedResourceMetadataRouteInputBuilderOutputBoundary",
    ),
    fp0122BuilderOutputOrBuilderValidInputRequired: trueLiteral,
    invalidBuilderOutputAllowed: falseLiteral,
    routeResponseContractOnly: trueLiteral,
    routeRegistered: falseLiteral,
  }).strict();

export const McpProtectedResourceMetadataRouteInputNoTokenLeakageBoundarySchema =
  BaseRouteInputContractSchema.extend({
    contractKind: z.literal(
      "McpProtectedResourceMetadataRouteInputNoTokenLeakageBoundary",
    ),
    tokenValuesAllowed: falseLiteral,
    cookiesSessionsSecretsCredentialsAllowed: falseLiteral,
    rawFinanceDataAllowed: falseLiteral,
    rawSourceDumpsAllowed: falseLiteral,
    credentialBearingUrlsAllowed: falseLiteral,
    companyKeyAuthorityAllowed: falseLiteral,
  }).strict();

export const McpProtectedResourceMetadataRouteInputCompanyBindingPrerequisiteBoundarySchema =
  BaseRouteInputContractSchema.extend({
    contractKind: z.literal(
      "McpProtectedResourceMetadataRouteInputCompanyBindingPrerequisiteBoundary",
    ),
    authenticatedCompanyBindingRequired: trueLiteral,
    authenticatedCompanyBindingImplemented: falseLiteral,
    unauthenticatedCompanyKeyAuthorityAllowed: falseLiteral,
    prerequisiteFlagRequired: trueLiteral,
  }).strict();

export const McpProtectedResourceMetadataRouteInputMcpUnchangedBoundarySchema =
  BaseRouteInputContractSchema.extend({
    contractKind: z.literal(
      "McpProtectedResourceMetadataRouteInputMcpUnchangedBoundary",
    ),
    localMcpRouteUnchangedRequired: trueLiteral,
    localMcpRouteBehaviorChanged: falseLiteral,
    protectedResourceMetadataRouteRegistered: falseLiteral,
    wwwAuthenticateBehaviorImplemented: falseLiteral,
    prerequisiteFlagRequired: trueLiteral,
  }).strict();

export const McpProtectedResourceMetadataRouteInputNoRuntimeBoundarySchema =
  BaseRouteInputContractSchema.extend({
    contractKind: z.literal(
      "McpProtectedResourceMetadataRouteInputNoRuntimeBoundary",
    ),
    noRouteRuntime: trueLiteral,
    noProtectedResourceMetadataRouteRuntime: trueLiteral,
    noWwwAuthenticateRuntime: trueLiteral,
    noOauthRuntime: trueLiteral,
    noTokenSessionRuntime: trueLiteral,
    noAuthMiddlewareRuntime: trueLiteral,
    noRemoteMcpRuntime: trueLiteral,
    noAppsSdkResourceRuntime: trueLiteral,
    noDbRuntime: trueLiteral,
  }).strict();

export const McpProtectedResourceMetadataRouteInputBuilderInputSchema = z
  .object({
    canonicalResourceUri: z.string().min(1),
    authorizationServers: z.array(z.string()).min(1),
    scopesSupported: z.array(z.string()).min(1),
    bearerMethodsSupported: z.array(z.enum(["header", "body", "query"])).min(1),
    canonicalUriEvidenceAccepted: z.boolean(),
    authorizationServerEvidenceAccepted: z.boolean(),
    builderOutput: McpProtectedResourceMetadataBuilderDocumentSchema.optional(),
    noTokenLeakageAccepted: z.boolean(),
    authenticatedCompanyBindingPrerequisiteAccepted: z.boolean(),
    mcpUnchangedBehaviorPrerequisiteAccepted: z.boolean(),
    routeImplementationDeferred: z.boolean(),
    wwwAuthenticateBehaviorDeferred: z.boolean(),
  })
  .strict();

export const McpProtectedResourceMetadataRoutePathDecisionSchema = z
  .object({
    canonicalResourceUri: z.string().min(1),
    metadataUrl: z.string().min(1),
    metadataRoutePath: z.string().min(1),
    rfc9728WellKnownPath: z.literal(
      MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH,
    ),
    routePathDerivedFromCanonicalResourceUri: trueLiteral,
    expectedForMcpCanonicalResource: z.literal(
      MCP_ROUTE_INPUT_EXPECTED_MCP_METADATA_ROUTE_PATH,
    ),
    routeImplementationDeferred: trueLiteral,
  })
  .strict();

export const McpProtectedResourceMetadataRouteInputEvidenceBundleSchema = z
  .object({
    schemaVersion: z.literal(
      MCP_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_SCHEMA_VERSION,
    ),
    localProofOnly: trueLiteral,
    readOnly: trueLiteral,
    routeInputEvidenceBundleOnly: trueLiteral,
    routeImplementationStillDeferred: trueLiteral,
    wwwAuthenticateBehaviorStillDeferred: trueLiteral,
    canonicalUriEvidence: z
      .object({
        accepted: trueLiteral,
        canonicalResourceUri: z.string().min(1),
        credentialFree: trueLiteral,
        metadataUrl: z.string().min(1),
      })
      .strict(),
    authorizationServerEvidence: z
      .object({
        accepted: trueLiteral,
        authorizationServers: z.array(z.string()).min(1),
        credentialFree: trueLiteral,
        providerNeutralUntilLaterPlan: trueLiteral,
      })
      .strict(),
    pathDecision: McpProtectedResourceMetadataRoutePathDecisionSchema,
    builderOutput: z
      .object({
        accepted: trueLiteral,
        builderInputAccepted: trueLiteral,
        builderOutputValid: trueLiteral,
        document: McpProtectedResourceMetadataBuilderDocumentSchema,
        routeRegistered: falseLiteral,
        routeResponseContractOnly: trueLiteral,
      })
      .strict(),
    noTokenLeakage: z
      .object({
        accepted: trueLiteral,
        tokenValuesDetected: falseLiteral,
        cookiesSessionsSecretsCredentialsDetected: falseLiteral,
        rawFinanceDataDetected: falseLiteral,
        rawSourceDumpsDetected: falseLiteral,
        credentialBearingUrlsDetected: falseLiteral,
        companyKeyAuthorityDetected: falseLiteral,
      })
      .strict(),
    companyBindingPrerequisite: z
      .object({
        accepted: trueLiteral,
        authenticatedCompanyBindingRequired: trueLiteral,
        authenticatedCompanyBindingImplemented: falseLiteral,
        unauthenticatedCompanyKeyAuthorityAllowed: falseLiteral,
      })
      .strict(),
    mcpUnchanged: z
      .object({
        accepted: trueLiteral,
        localMcpRouteUnchangedRequired: trueLiteral,
        localMcpRouteBehaviorChanged: falseLiteral,
        protectedResourceMetadataRouteRegistered: falseLiteral,
        wwwAuthenticateBehaviorImplemented: falseLiteral,
      })
      .strict(),
    noRuntime: z
      .object({
        accepted: trueLiteral,
        noRouteRuntime: trueLiteral,
        noProtectedResourceMetadataRouteRuntime: trueLiteral,
        noWwwAuthenticateRuntime: trueLiteral,
        noOauthRuntime: trueLiteral,
        noTokenSessionRuntime: trueLiteral,
        noAuthMiddlewareRuntime: trueLiteral,
        noRemoteMcpRuntime: trueLiteral,
        noAppsSdkResourceRuntime: trueLiteral,
        noDbRuntime: trueLiteral,
      })
      .strict(),
  })
  .strict();

export type McpProtectedResourceMetadataRouteInputContractKind = z.infer<
  typeof McpProtectedResourceMetadataRouteInputContractKindSchema
>;

export type McpProtectedResourceMetadataRouteInputBuilderInput = z.infer<
  typeof McpProtectedResourceMetadataRouteInputBuilderInputSchema
>;

export type McpProtectedResourceMetadataRoutePathDecision = z.infer<
  typeof McpProtectedResourceMetadataRoutePathDecisionSchema
>;

export type McpProtectedResourceMetadataRouteInputEvidenceBundle = z.infer<
  typeof McpProtectedResourceMetadataRouteInputEvidenceBundleSchema
>;

export type McpProtectedResourceMetadataRouteInputBuilderValidInput = z.infer<
  typeof McpProtectedResourceMetadataBuilderInputSchema
>;
