import {
  MCP_PROTECTED_RESOURCE_METADATA_BUILDER_ALLOWED_SCOPES,
  MCP_PROTECTED_RESOURCE_METADATA_BUILDER_BEARER_METHODS,
  MCP_PROTECTED_RESOURCE_METADATA_BUILDER_FORBIDDEN_METADATA_TOKENS,
  MCP_PROTECTED_RESOURCE_METADATA_BUILDER_FORBIDDEN_SCOPE_TOKENS,
  MCP_PROTECTED_RESOURCE_METADATA_BUILDER_PERMITTED_METADATA_FIELDS,
  McpProtectedResourceMetadataBuilderDocumentSchema,
  McpProtectedResourceMetadataBuilderInputSchema,
  McpProtectedResourceMetadataRouteResponseContractSchema,
  type McpProtectedResourceMetadataBuilderDocument,
  type McpProtectedResourceMetadataBuilderInput,
  type McpProtectedResourceMetadataRouteResponseContract,
} from "./read-only-app-mcp-protected-resource-metadata-builder-contracts";
import { validateMcpCanonicalPublicResourceUriCandidate } from "./read-only-app-mcp-canonical-resource-validator";

export type McpProtectedResourceMetadataBuilderInputValidation = {
  accepted: boolean;
  canonicalUriAccepted: boolean;
  authorizationServersAccepted: boolean;
  scopesAccepted: boolean;
  bearerMethodsAccepted: boolean;
  noTokenLeakageAccepted: boolean;
  permittedOutputShapeAccepted: boolean;
  rejectionReasons: readonly string[];
};

export function validateProtectedResourceMetadataBuilderInput(
  input: unknown,
): McpProtectedResourceMetadataBuilderInputValidation {
  const parsed = McpProtectedResourceMetadataBuilderInputSchema.safeParse(input);
  if (!parsed.success) {
    return rejected(["input_shape_invalid"]);
  }

  const canonicalUriAccepted =
    validateMcpCanonicalPublicResourceUriCandidate(
      parsed.data.canonicalResourceUri,
    ).accepted && !hasForbiddenMetadataToken(parsed.data.canonicalResourceUri);
  const authorizationServersAccepted = parsed.data.authorizationServers.every(
    validateAuthorizationServer,
  );
  const scopesAccepted = validateScopes(parsed.data.scopesSupported);
  const bearerMethodsAccepted = validateBearerMethods(
    parsed.data.bearerMethodsSupported,
  );
  const noTokenLeakageAccepted = noTokenLeakage(parsed.data);
  const permittedOutputShapeAccepted = sameList(
    [...MCP_PROTECTED_RESOURCE_METADATA_BUILDER_PERMITTED_METADATA_FIELDS],
    Object.keys(buildCandidateDocument(parsed.data)),
  );
  const rejectionReasons = [
    canonicalUriAccepted ? "" : "canonical_resource_uri_unaccepted",
    authorizationServersAccepted ? "" : "authorization_servers_unaccepted",
    scopesAccepted ? "" : "scopes_supported_unaccepted",
    bearerMethodsAccepted ? "" : "bearer_methods_supported_unaccepted",
    noTokenLeakageAccepted ? "" : "token_or_private_material_detected",
    permittedOutputShapeAccepted ? "" : "metadata_output_shape_unaccepted",
  ].filter(Boolean);

  return {
    accepted: rejectionReasons.length === 0,
    authorizationServersAccepted,
    bearerMethodsAccepted,
    canonicalUriAccepted,
    noTokenLeakageAccepted,
    permittedOutputShapeAccepted,
    rejectionReasons,
    scopesAccepted,
  };
}

export function buildProtectedResourceMetadataDocument(
  input: McpProtectedResourceMetadataBuilderInput,
): McpProtectedResourceMetadataBuilderDocument {
  const validation = validateProtectedResourceMetadataBuilderInput(input);
  if (!validation.accepted) {
    throw new Error(
      `Protected-resource metadata builder input rejected: ${validation.rejectionReasons.join(", ")}`,
    );
  }

  return McpProtectedResourceMetadataBuilderDocumentSchema.parse(
    buildCandidateDocument(input),
  );
}

export function deriveProtectedResourceMetadataRouteResponseContract(
  input: McpProtectedResourceMetadataBuilderInput,
): McpProtectedResourceMetadataRouteResponseContract {
  return McpProtectedResourceMetadataRouteResponseContractSchema.parse({
    deferredUntilFutureFinancePlan: true,
    localProofOnly: true,
    metadataDocument: buildProtectedResourceMetadataDocument(input),
    routeBehaviorImplemented: false,
    routeRegistered: false,
    routeResponseContractOnly: true,
    wwwAuthenticateBehaviorImplemented: false,
  });
}

export function textHasProtectedResourceMetadataBuilderTokenLeakage(
  text: string,
) {
  return hasForbiddenMetadataToken(text);
}

function buildCandidateDocument(
  input: McpProtectedResourceMetadataBuilderInput,
) {
  return {
    resource: input.canonicalResourceUri,
    authorization_servers: [...input.authorizationServers],
    scopes_supported: [...input.scopesSupported],
    bearer_methods_supported: [...input.bearerMethodsSupported],
  };
}

function validateAuthorizationServer(value: string) {
  if (hasForbiddenMetadataToken(value)) return false;

  try {
    const url = new URL(value);
    const normalized = value.toLowerCase();
    const host = url.hostname.toLowerCase();
    const path = url.pathname.toLowerCase();

    return (
      url.protocol === "https:" &&
      url.search === "" &&
      url.hash === "" &&
      !hasPlaceholder(normalized, host) &&
      !hasLocalOrTunnelHost(host) &&
      !hasSelectorOrTemplate(`${host}${path}`, value) &&
      !hasProviderSpecificAuthority(`${host}${path}`)
    );
  } catch {
    return false;
  }
}

function validateScopes(scopes: readonly string[]) {
  return (
    scopes.length > 0 &&
    scopes.every((scope) =>
      MCP_PROTECTED_RESOURCE_METADATA_BUILDER_ALLOWED_SCOPES.includes(
        scope as (typeof MCP_PROTECTED_RESOURCE_METADATA_BUILDER_ALLOWED_SCOPES)[number],
      ),
    ) &&
    !scopes.some((scope) =>
      MCP_PROTECTED_RESOURCE_METADATA_BUILDER_FORBIDDEN_SCOPE_TOKENS.some(
        (token) => normalize(scope).includes(normalize(token)),
      ),
    )
  );
}

function validateBearerMethods(methods: readonly string[]) {
  return (
    methods.length > 0 &&
    methods.includes(MCP_PROTECTED_RESOURCE_METADATA_BUILDER_BEARER_METHODS[0]) &&
    methods.every(
      (method) =>
        method === MCP_PROTECTED_RESOURCE_METADATA_BUILDER_BEARER_METHODS[0],
    )
  );
}

function noTokenLeakage(input: McpProtectedResourceMetadataBuilderInput) {
  return !hasForbiddenMetadataToken(JSON.stringify(input));
}

function hasForbiddenMetadataToken(value: string) {
  const normalized = normalize(value);
  return MCP_PROTECTED_RESOURCE_METADATA_BUILDER_FORBIDDEN_METADATA_TOKENS.some(
    (token) => normalized.includes(normalize(token)),
  );
}

function hasPlaceholder(value: string, host: string) {
  return (
    /[{}<>]/u.test(value) ||
    host === "example.com" ||
    host.endsWith(".example.com") ||
    value.includes("placeholder") ||
    value.includes("your-") ||
    value.includes("sample")
  );
}

function hasLocalOrTunnelHost(host: string) {
  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "::1" ||
    host === "0.0.0.0" ||
    host.startsWith("127.") ||
    /(?:ngrok|ngrok-free\.app|loca\.lt|localtunnel|trycloudflare\.com|localhost\.run|serveo\.net)/u.test(
      host,
    )
  );
}

function hasSelectorOrTemplate(searchable: string, original: string) {
  return (
    /(?:companykey|company-key|company_key|workspace|tenant|org|organization|user)/u.test(
      normalize(searchable),
    ) ||
    /(?:\{[^}]*(?:workspace|tenant|company|org|user)[^}]*\}|<[^>]*(?:workspace|tenant|company|org|user)[^>]*>|\$\{[^}]*(?:workspace|tenant|company|org|user)[^}]*\}|\/:(?:workspace|tenant|company|org|user)|\/\[(?:workspace|tenant|company|org|user)\])/iu.test(
      original,
    )
  );
}

function hasProviderSpecificAuthority(searchable: string) {
  return /(?:auth0|okta|cognito|entra|azure|google|microsoft|clerk|supabase|workos)/u.test(
    normalize(searchable),
  );
}

function sameList(left: readonly string[], right: readonly string[]) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function rejected(
  rejectionReasons: readonly string[],
): McpProtectedResourceMetadataBuilderInputValidation {
  return {
    accepted: false,
    authorizationServersAccepted: false,
    bearerMethodsAccepted: false,
    canonicalUriAccepted: false,
    noTokenLeakageAccepted: false,
    permittedOutputShapeAccepted: false,
    rejectionReasons,
    scopesAccepted: false,
  };
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9:=*._/-]/gu, "");
}
