import {
  MCP_CANONICAL_RESOURCE_REJECTED_CREDENTIAL_URI_TOKENS,
  MCP_CANONICAL_RESOURCE_REJECTED_LOCAL_TUNNEL_HOST_TOKENS,
  MCP_CANONICAL_RESOURCE_REJECTED_SELECTOR_TOKENS,
  MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH,
} from "./read-only-app-mcp-canonical-resource-contracts";
import {
  MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE,
  McpWwwAuthenticateChallengeReferenceModeSchema,
  type McpWwwAuthenticateChallengeReferenceMode,
} from "./read-only-app-mcp-www-authenticate-contracts";

export type McpWwwAuthenticatePublicResourceMetadataReferenceCandidateValidation =
  {
    accepted: boolean;
    httpsVerified: boolean;
    metadataPathVerified: boolean;
    noCompanyKeyUserOrgWorkspaceTenantSelectors: boolean;
    noFragment: boolean;
    noLocalhostAuthority: boolean;
    noLocalTunnelAuthority: boolean;
    noPlaceholder: boolean;
    noQuery: boolean;
    noTokenSecretMaterial: boolean;
    noUserinfoCredentials: boolean;
    rejectionReasons: readonly string[];
  };

export type McpWwwAuthenticateResourceMetadataReferenceContract = {
  candidateValidation:
    | McpWwwAuthenticatePublicResourceMetadataReferenceCandidateValidation
    | null;
  localProofOnly: boolean;
  mode: McpWwwAuthenticateChallengeReferenceMode;
  publicRuntimeReferenceAllowed: boolean;
  reason: string;
  reference: string | null;
  runtimeHeaderEmissionAllowed: boolean;
};

type ReferenceInput = {
  publicCanonicalUrlProofAvailable?: boolean;
  referenceMode?: McpWwwAuthenticateChallengeReferenceMode;
  resourceMetadataReference?: string;
};

const metadataRoutePaths = [
  MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH,
  `${MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH}/mcp`,
] as const;
const openAiApiKeyName = ["OPENAI", "API", "KEY"].join("_");
const secretNamePattern = new RegExp(
  `\\b(?:${openAiApiKeyName}|api_key|access_token|refresh_token|client_secret|session|cookie|x-api-key)\\b`,
  "iu",
);

export function deriveWwwAuthenticateResourceMetadataReferenceContract(
  input: ReferenceInput = {},
): McpWwwAuthenticateResourceMetadataReferenceContract {
  const mode = McpWwwAuthenticateChallengeReferenceModeSchema.parse(
    input.referenceMode ?? "local_proof_metadata_route_path",
  );

  if (mode === "local_proof_metadata_route_path") {
    return {
      candidateValidation: null,
      localProofOnly: true,
      mode,
      publicRuntimeReferenceAllowed: false,
      reason: "local proof may reference the exact local metadata route path",
      reference: MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE,
      runtimeHeaderEmissionAllowed: false,
    };
  }

  const candidateValidation =
    typeof input.resourceMetadataReference === "string"
      ? validateWwwAuthenticatePublicResourceMetadataReferenceCandidate(
          input.resourceMetadataReference,
        )
      : null;
  const publicReferenceAllowed =
    input.publicCanonicalUrlProofAvailable === true &&
    candidateValidation?.accepted === true;

  return {
    candidateValidation,
    localProofOnly: false,
    mode,
    publicRuntimeReferenceAllowed: publicReferenceAllowed,
    reason: publicReferenceAllowed
      ? "future public canonical URL proof supplied for a strict metadata reference candidate"
      : publicReferenceBlockedReason(input, candidateValidation),
    reference: publicReferenceAllowed ? input.resourceMetadataReference! : null,
    runtimeHeaderEmissionAllowed: false,
  };
}

export function validateWwwAuthenticatePublicResourceMetadataReferenceCandidate(
  candidate: string,
): McpWwwAuthenticatePublicResourceMetadataReferenceCandidateValidation {
  const trimmed = candidate.trim();

  try {
    const parsed = new URL(trimmed);
    const decodedCandidate = safeDecode(trimmed);
    const host = parsed.hostname.toLowerCase();
    const pathname = safeDecode(parsed.pathname);
    const searchable = normalizeSearchToken(
      `${host}/${pathname}/${parsed.username}/${parsed.password}`,
    );
    const httpsVerified = parsed.protocol === "https:";
    const metadataPathVerified = metadataRoutePaths.includes(
      pathname as (typeof metadataRoutePaths)[number],
    );
    const noQuery = parsed.search === "";
    const noFragment = parsed.hash === "";
    const noUserinfoCredentials =
      parsed.username === "" && parsed.password === "";
    const noLocalhostAuthority = !isLocalhostAuthority(host);
    const noLocalTunnelAuthority = !isLocalTunnelAuthority(host);
    const noPlaceholder = !hasPlaceholder(trimmed, host, searchable);
    const noCompanyKeyUserOrgWorkspaceTenantSelectors =
      !hasSelectorToken(searchable) && !hasSelectorTemplate(decodedCandidate);
    const noTokenSecretMaterial = !hasTokenSecretLikeMaterial(
      decodedCandidate,
    );
    const rejectionReasons = [
      httpsVerified ? "" : "resource_metadata_reference_must_be_https",
      metadataPathVerified
        ? ""
        : "resource_metadata_reference_path_must_be_exact_metadata_path",
      noQuery ? "" : "resource_metadata_reference_query_rejected",
      noFragment ? "" : "resource_metadata_reference_fragment_rejected",
      noUserinfoCredentials
        ? ""
        : "resource_metadata_reference_userinfo_rejected",
      noLocalhostAuthority
        ? ""
        : "resource_metadata_reference_localhost_rejected",
      noLocalTunnelAuthority
        ? ""
        : "resource_metadata_reference_tunnel_rejected",
      noPlaceholder
        ? ""
        : "resource_metadata_reference_placeholder_rejected",
      noCompanyKeyUserOrgWorkspaceTenantSelectors
        ? ""
        : "resource_metadata_reference_selector_rejected",
      noTokenSecretMaterial
        ? ""
        : "resource_metadata_reference_token_or_secret_rejected",
    ].filter(Boolean);

    return {
      accepted: rejectionReasons.length === 0,
      httpsVerified,
      metadataPathVerified,
      noCompanyKeyUserOrgWorkspaceTenantSelectors,
      noFragment,
      noLocalhostAuthority,
      noLocalTunnelAuthority,
      noPlaceholder,
      noQuery,
      noTokenSecretMaterial,
      noUserinfoCredentials,
      rejectionReasons,
    };
  } catch {
    return invalidPublicReferenceValidation();
  }
}

function publicReferenceBlockedReason(
  input: ReferenceInput,
  candidateValidation:
    | McpWwwAuthenticatePublicResourceMetadataReferenceCandidateValidation
    | null,
) {
  if (input.publicCanonicalUrlProofAvailable !== true) {
    return "public runtime reference is blocked until future canonical public URL proof";
  }
  if (typeof input.resourceMetadataReference !== "string") {
    return "public runtime reference candidate is missing";
  }
  return `public runtime reference candidate rejected: ${
    candidateValidation?.rejectionReasons.join(", ") ?? "invalid_url"
  }`;
}

function invalidPublicReferenceValidation(): McpWwwAuthenticatePublicResourceMetadataReferenceCandidateValidation {
  return {
    accepted: false,
    httpsVerified: false,
    metadataPathVerified: false,
    noCompanyKeyUserOrgWorkspaceTenantSelectors: false,
    noFragment: false,
    noLocalhostAuthority: false,
    noLocalTunnelAuthority: false,
    noPlaceholder: false,
    noQuery: false,
    noTokenSecretMaterial: false,
    noUserinfoCredentials: false,
    rejectionReasons: ["resource_metadata_reference_invalid_url"],
  };
}

function isLocalhostAuthority(host: string) {
  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "::1" ||
    host === "[::1]" ||
    host === "0.0.0.0" ||
    host.startsWith("127.")
  );
}

function isLocalTunnelAuthority(host: string) {
  return MCP_CANONICAL_RESOURCE_REJECTED_LOCAL_TUNNEL_HOST_TOKENS.some(
    (token) =>
      host === token || host.endsWith(`.${token}`) || host.includes(token),
  );
}

function hasPlaceholder(original: string, host: string, searchable: string) {
  return (
    /[{}<>]/u.test(original) ||
    host === "example.com" ||
    host.endsWith(".example.com") ||
    searchable.includes("placeholder") ||
    searchable.includes("yourmcp") ||
    searchable.includes("sample")
  );
}

function hasSelectorToken(searchable: string) {
  return MCP_CANONICAL_RESOURCE_REJECTED_SELECTOR_TOKENS.map(
    normalizeSearchToken,
  ).some((token) => searchable.includes(token));
}

function hasSelectorTemplate(value: string) {
  return /(?:\{[^}]*(?:workspace|tenant|company|org|user)[^}]*\}|<[^>]*(?:workspace|tenant|company|org|user)[^>]*>|\$\{[^}]*(?:workspace|tenant|company|org|user)[^}]*\}|(?:^|\/)(?::|\[)(?:workspace|tenant|company|org|user))/iu.test(
    value,
  );
}

function hasTokenSecretLikeMaterial(value: string) {
  const normalized = normalizeSearchToken(value);
  return (
    MCP_CANONICAL_RESOURCE_REJECTED_CREDENTIAL_URI_TOKENS.map(
      normalizeSearchToken,
    ).some((token) => normalized.includes(token)) ||
    secretNamePattern.test(value) ||
    /\b(?:bearer|basic)\s+[A-Za-z0-9._~+/-]{8,}={0,2}\b/iu.test(value) ||
    /\bsk-[A-Za-z0-9][A-Za-z0-9_-]{8,}\b/u.test(value) ||
    /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/u.test(
      value,
    )
  );
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeSearchToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/gu, "");
}
