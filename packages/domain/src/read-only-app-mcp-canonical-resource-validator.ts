import {
  MCP_CANONICAL_RESOURCE_REJECTED_CREDENTIAL_URI_TOKENS,
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
  noUserinfoCredentials: boolean;
  noCredentialLikeAuthorityOrPath: boolean;
};

export type McpProtectedResourceMetadataUrlDerivation = {
  canonicalResourceUri: string;
  metadataUrl: string;
  metadataRoutePath: string;
  rfc9728WellKnownPath: typeof MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH;
};

export type McpProtectedResourceMetadataUrlDerivationAttempt =
  | {
      derived: true;
      derivation: McpProtectedResourceMetadataUrlDerivation;
      validation: McpCanonicalPublicResourceUriValidation & { accepted: true };
    }
  | {
      derived: false;
      derivation: null;
      validation: McpCanonicalPublicResourceUriValidation;
    };

export const MCP_CANONICAL_RESOURCE_INVALID_METADATA_DERIVATION_CANDIDATES = [
  "https://mcp.canonical-finance-host.com/mcp?companyKey=acme",
  "https://mcp.canonical-finance-host.com/mcp#fragment",
  "https://mcp.canonical-finance-host.com/companyKey/acme/mcp",
  "https://mcp.canonical-finance-host.com/user/sohaib/mcp",
  "https://mcp.canonical-finance-host.com/org/acme/mcp",
  "https://mcp.canonical-finance-host.com/workspace/acme/mcp",
  "https://mcp.canonical-finance-host.com/{tenant}/mcp",
  "https://user:pass@mcp.canonical-finance-host.com/mcp",
  "https://client_secret@mcp.canonical-finance-host.com/mcp",
  "https://bearer-token@mcp.canonical-finance-host.com/mcp",
  "https://jwt@mcp.canonical-finance-host.com/mcp",
  "https://localhost:3000/mcp",
  "https://pocket-cfo.ngrok-free.app/mcp",
  "https://your-mcp.example.com/mcp",
] as const;

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
    const noUserinfoCredentials =
      parsed.username === "" && parsed.password === "";
    const noCredentialLikeAuthorityOrPath =
      !hasCredentialLikeAuthorityOrPath(parsed);
    const exactStableHttpsVerified =
      httpsVerified &&
      noPlaceholder &&
      noQuery &&
      noFragment &&
      noLocalhostAuthority &&
      noLocalTunnelAuthority &&
      noUserinfoCredentials &&
      noCredentialLikeAuthorityOrPath;

    return {
      accepted:
        exactStableHttpsVerified &&
        noCompanyKeyUserOrgSelectors &&
        noWorkspaceTenantTemplateValues &&
        noUnauthenticatedSelectorAuthority,
      exactStableHttpsVerified,
      httpsVerified,
      noCredentialLikeAuthorityOrPath,
      noCompanyKeyUserOrgSelectors,
      noFragment,
      noLocalTunnelAuthority,
      noLocalhostAuthority,
      noPlaceholder,
      noQuery,
      noUnauthenticatedSelectorAuthority,
      noUserinfoCredentials,
      noWorkspaceTenantTemplateValues,
    };
  } catch {
    return invalidCanonicalUriValidation();
  }
}

export function deriveMcpProtectedResourceMetadataUrl(
  canonicalResourceUri: string,
): McpProtectedResourceMetadataUrlDerivation {
  const derivationAttempt =
    tryDeriveMcpProtectedResourceMetadataUrlFromCanonicalUri(
      canonicalResourceUri,
    );

  if (!derivationAttempt.derived) {
    throw new Error(
      "Cannot derive protected-resource metadata URL from an invalid canonical MCP resource URI candidate",
    );
  }

  return derivationAttempt.derivation;
}

export function tryDeriveMcpProtectedResourceMetadataUrlFromCanonicalUri(
  canonicalResourceUri: string,
): McpProtectedResourceMetadataUrlDerivationAttempt {
  const validation = validateMcpCanonicalPublicResourceUriCandidate(
    canonicalResourceUri,
  );

  if (!validation.accepted) {
    return {
      derivation: null,
      derived: false,
      validation,
    };
  }

  const parsed = new URL(canonicalResourceUri);
  const pathSuffix = parsed.pathname === "/" ? "" : parsed.pathname;
  const metadataUrl = `${parsed.origin}${MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH}${pathSuffix}`;
  const metadataPath = new URL(metadataUrl).pathname;

  return {
    derivation: {
      canonicalResourceUri,
      metadataRoutePath: metadataPath,
      metadataUrl,
      rfc9728WellKnownPath: MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH,
    },
    derived: true,
    validation: validation as McpCanonicalPublicResourceUriValidation & {
      accepted: true;
    },
  };
}

export function validateMcpWwwAuthenticateResourceMetadataUrl(input: {
  canonicalResourceUri: string;
  resourceMetadataUrl: string;
}) {
  const derivationAttempt =
    tryDeriveMcpProtectedResourceMetadataUrlFromCanonicalUri(
      input.canonicalResourceUri,
    );

  if (!derivationAttempt.derived) {
    return {
      canonicalResourceUriAccepted: false,
      derivedMetadataUrl: null,
      resourceMetadataUrlMatchesDerived: false,
    };
  }

  const derived = derivationAttempt.derivation;

  return {
    canonicalResourceUriAccepted: true,
    derivedMetadataUrl: derived.metadataUrl,
    resourceMetadataUrlMatchesDerived:
      input.resourceMetadataUrl === derived.metadataUrl,
  };
}

export function invalidCanonicalUriCandidatesFailClosedBeforeDerivation(
  candidates: readonly string[],
) {
  const results = candidates.map((candidate) => ({
    candidate,
    derivationAttempt:
      tryDeriveMcpProtectedResourceMetadataUrlFromCanonicalUri(candidate),
    validation: validateMcpCanonicalPublicResourceUriCandidate(candidate),
  }));

  return {
    invalidCanonicalUriMetadataDerivationFailsClosed: results.every(
      ({ derivationAttempt, validation }) =>
        validation.accepted === false &&
        derivationAttempt.derived === false &&
        derivationAttempt.derivation === null,
    ),
    rejectedCandidates: results.map(({ candidate }) => candidate),
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
    noUserinfoCredentials: false,
    noCredentialLikeAuthorityOrPath: false,
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

function hasCredentialLikeAuthorityOrPath(url: URL): boolean {
  const authorityAndPath = [
    url.username,
    url.password,
    url.hostname,
    url.pathname,
  ]
    .map(safeDecode)
    .join("/");
  const normalized = normalizeToken(authorityAndPath);

  return (
    MCP_CANONICAL_RESOURCE_REJECTED_CREDENTIAL_URI_TOKENS.map(
      normalizeToken,
    ).some((token) => normalized.includes(token)) ||
    hasJwtLikeMaterial(authorityAndPath)
  );
}

function hasJwtLikeMaterial(value: string): boolean {
  return /(?:^|[^A-Za-z0-9_-])[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}(?:$|[^A-Za-z0-9_-])/u.test(
    value,
  );
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/gu, "");
}
