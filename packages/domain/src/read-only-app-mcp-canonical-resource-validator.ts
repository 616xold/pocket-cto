import {
  MCP_CANONICAL_RESOURCE_REJECTED_LOCAL_TUNNEL_HOST_TOKENS,
  MCP_CANONICAL_RESOURCE_REJECTED_SELECTOR_TOKENS,
  MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH,
} from "./read-only-app-mcp-canonical-resource-contracts";

export type McpCanonicalPublicResourceUriValidation = {
  accepted: boolean;
  exactStableHttpsVerified: boolean;
  httpsVerified: boolean;
  noPlaceholder: boolean;
  noQuery: boolean;
  noFragment: boolean;
  noCompanyKeyUserOrgSelectors: boolean;
  noWorkspaceTenantTemplateValues: boolean;
  noLocalhostAuthority: boolean;
  noLocalTunnelAuthority: boolean;
  noUnauthenticatedSelectorAuthority: boolean;
};

export type McpProtectedResourceMetadataUrlDerivation = {
  canonicalResourceUri: string;
  metadataUrl: string;
  metadataRoutePath: string;
  rfc9728WellKnownPath: typeof MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH;
};

export function validateMcpCanonicalPublicResourceUriCandidate(
  uri: string,
): McpCanonicalPublicResourceUriValidation {
  const trimmed = uri.trim();

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();
    const searchable = normalizeToken(`${host}${path}`);
    const httpsVerified = parsed.protocol === "https:";
    const noPlaceholder = !hasPlaceholder(trimmed, host, searchable);
    const noQuery = parsed.search === "";
    const noFragment = parsed.hash === "";
    const noCompanyKeyUserOrgSelectors = !hasSelectorToken(searchable);
    const noWorkspaceTenantTemplateValues =
      !hasWorkspaceTenantTemplate(trimmed) && !hasSelectorTemplate(path);
    const noLocalhostAuthority = !isLocalhostAuthority(host);
    const noLocalTunnelAuthority = !isLocalTunnelAuthority(host);
    const noUnauthenticatedSelectorAuthority =
      noCompanyKeyUserOrgSelectors && noWorkspaceTenantTemplateValues;
    const exactStableHttpsVerified =
      httpsVerified &&
      noPlaceholder &&
      noQuery &&
      noFragment &&
      noLocalhostAuthority &&
      noLocalTunnelAuthority;

    return {
      accepted:
        exactStableHttpsVerified &&
        noCompanyKeyUserOrgSelectors &&
        noWorkspaceTenantTemplateValues &&
        noUnauthenticatedSelectorAuthority,
      exactStableHttpsVerified,
      httpsVerified,
      noCompanyKeyUserOrgSelectors,
      noFragment,
      noLocalTunnelAuthority,
      noLocalhostAuthority,
      noPlaceholder,
      noQuery,
      noUnauthenticatedSelectorAuthority,
      noWorkspaceTenantTemplateValues,
    };
  } catch {
    return invalidCanonicalUriValidation();
  }
}

export function deriveMcpProtectedResourceMetadataUrl(
  canonicalResourceUri: string,
): McpProtectedResourceMetadataUrlDerivation {
  const parsed = new URL(canonicalResourceUri);
  const pathSuffix = parsed.pathname === "/" ? "" : parsed.pathname;
  const metadataUrl = `${parsed.origin}${MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH}${pathSuffix}${parsed.search}`;
  const metadataPath = new URL(metadataUrl).pathname;

  return {
    canonicalResourceUri,
    metadataRoutePath: metadataPath,
    metadataUrl,
    rfc9728WellKnownPath: MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH,
  };
}

export function validateMcpWwwAuthenticateResourceMetadataUrl(input: {
  canonicalResourceUri: string;
  resourceMetadataUrl: string;
}) {
  const derived = deriveMcpProtectedResourceMetadataUrl(
    input.canonicalResourceUri,
  );

  return {
    derivedMetadataUrl: derived.metadataUrl,
    resourceMetadataUrlMatchesDerived:
      input.resourceMetadataUrl === derived.metadataUrl,
  };
}

function invalidCanonicalUriValidation(): McpCanonicalPublicResourceUriValidation {
  return {
    accepted: false,
    exactStableHttpsVerified: false,
    httpsVerified: false,
    noCompanyKeyUserOrgSelectors: false,
    noFragment: false,
    noLocalTunnelAuthority: false,
    noLocalhostAuthority: false,
    noPlaceholder: false,
    noQuery: false,
    noUnauthenticatedSelectorAuthority: false,
    noWorkspaceTenantTemplateValues: false,
  };
}

function hasPlaceholder(
  original: string,
  host: string,
  searchable: string,
): boolean {
  return (
    /[{}<>]/u.test(original) ||
    host === "example.com" ||
    host.endsWith(".example.com") ||
    searchable.includes("placeholder") ||
    searchable.includes("your") ||
    searchable.includes("sample")
  );
}

function hasSelectorToken(searchable: string): boolean {
  return MCP_CANONICAL_RESOURCE_REJECTED_SELECTOR_TOKENS.map(normalizeToken).some(
    (token) => searchable.includes(token),
  );
}

function hasWorkspaceTenantTemplate(value: string): boolean {
  return /(?:\{[^}]*(?:workspace|tenant|company|org|user)[^}]*\}|<[^>]*(?:workspace|tenant|company|org|user)[^>]*>|\$\{[^}]*(?:workspace|tenant|company|org|user)[^}]*\})/iu.test(
    value,
  );
}

function hasSelectorTemplate(path: string): boolean {
  return /(?:^|\/)(?::|\[)(?:workspace|tenant|company|org|user)/iu.test(path);
}

function isLocalhostAuthority(host: string): boolean {
  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "::1" ||
    host === "0.0.0.0" ||
    host.startsWith("127.")
  );
}

function isLocalTunnelAuthority(host: string): boolean {
  return MCP_CANONICAL_RESOURCE_REJECTED_LOCAL_TUNNEL_HOST_TOKENS.some(
    (token) => host === token || host.endsWith(`.${token}`) || host.includes(token),
  );
}

function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/gu, "");
}
