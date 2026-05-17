import {
  MCP_WWW_AUTHENTICATE_ALLOWED_SCOPE_CHALLENGES,
  MCP_WWW_AUTHENTICATE_CHALLENGE_SCHEME,
  MCP_WWW_AUTHENTICATE_RESOURCE_METADATA_PARAMETER,
  type McpWwwAuthenticateChallengeReferenceMode,
} from "./read-only-app-mcp-www-authenticate-contracts";
import { scanWwwAuthenticateNoTokenLeakage } from "./read-only-app-mcp-www-authenticate-leakage-validation";
import { deriveWwwAuthenticateResourceMetadataReferenceContract } from "./read-only-app-mcp-www-authenticate-reference-validation";
import { validateWwwAuthenticateScopeChallenge } from "./read-only-app-mcp-www-authenticate-scope-validation";

export type McpWwwAuthenticateAuthChallengeContractInput = {
  challengeScheme?: string;
  resourceMetadataParameter?: string;
  resourceMetadataReference?: string;
  referenceMode?: McpWwwAuthenticateChallengeReferenceMode;
  publicCanonicalUrlProofAvailable?: boolean;
  runtimeHeaderEmissionRequested?: boolean;
  scopes?: readonly string[];
  exampleText?: string;
};

export {
  scanWwwAuthenticateNoTokenLeakage,
  textHasWwwAuthenticateNoTokenLeakage,
  type McpWwwAuthenticateNoTokenLeakageMatch,
  type McpWwwAuthenticateNoTokenLeakageScan,
} from "./read-only-app-mcp-www-authenticate-leakage-validation";
export {
  deriveWwwAuthenticateResourceMetadataReferenceContract,
  validateWwwAuthenticatePublicResourceMetadataReferenceCandidate,
  type McpWwwAuthenticatePublicResourceMetadataReferenceCandidateValidation,
  type McpWwwAuthenticateResourceMetadataReferenceContract,
} from "./read-only-app-mcp-www-authenticate-reference-validation";
export {
  validateWwwAuthenticateScopeChallenge,
  type McpWwwAuthenticateScopeChallengeValidation,
} from "./read-only-app-mcp-www-authenticate-scope-validation";

export function validateWwwAuthenticateAuthChallengeContractInput(
  input: McpWwwAuthenticateAuthChallengeContractInput = {},
) {
  const referenceContract =
    deriveWwwAuthenticateResourceMetadataReferenceContract(input);
  const scopes = input.scopes ?? MCP_WWW_AUTHENTICATE_ALLOWED_SCOPE_CHALLENGES;
  const scopeChallenge = validateWwwAuthenticateScopeChallenge(scopes);
  const noLeakageScan = scanWwwAuthenticateNoTokenLeakage(
    input.exampleText ?? "contract-only missing-token and invalid-token posture",
  );

  return {
    challengeShapeAccepted:
      (input.challengeScheme ?? MCP_WWW_AUTHENTICATE_CHALLENGE_SCHEME) ===
        MCP_WWW_AUTHENTICATE_CHALLENGE_SCHEME &&
      (input.resourceMetadataParameter ??
        MCP_WWW_AUTHENTICATE_RESOURCE_METADATA_PARAMETER) ===
        MCP_WWW_AUTHENTICATE_RESOURCE_METADATA_PARAMETER,
    noLeakageScan,
    referenceContract,
    scopeChallenge,
  };
}
