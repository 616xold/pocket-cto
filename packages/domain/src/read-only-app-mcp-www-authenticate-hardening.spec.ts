import { describe, expect, it } from "vitest";
import {
  MCP_WWW_AUTHENTICATE_ALLOWED_SCOPE_CHALLENGES,
  MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE,
  deriveWwwAuthenticateResourceMetadataReferenceContract,
  scanWwwAuthenticateNoTokenLeakage,
  validateWwwAuthenticatePublicResourceMetadataReferenceCandidate,
  validateWwwAuthenticateScopeChallenge,
} from "./read-only-app-mcp-www-authenticate";

describe("FP-0127 WWW-Authenticate post-merge proof hardening", () => {
  it("accepts only explicit read-only least-privilege scopes", () => {
    const validation = validateWwwAuthenticateScopeChallenge(
      MCP_WWW_AUTHENTICATE_ALLOWED_SCOPE_CHALLENGES,
    );

    expect(validation.accepted).toBe(true);
    expect(validation.readOnlyLeastPrivilege).toBe(true);
    expect(validation.forbiddenMatches).toEqual([]);
    expect(validation.rejectedScopes).toEqual([]);
  });

  it("rejects forbidden scope tokens across delimiters and case variants", () => {
    const forbiddenScopes = [
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
    ];

    for (const scope of forbiddenScopes) {
      const validation = validateWwwAuthenticateScopeChallenge([scope]);
      expect(validation.accepted, scope).toBe(false);
      expect(validation.forbiddenMatches, scope).toEqual([scope]);
      expect(validation.rejectionReasons, scope).toContain(
        "forbidden_scope_token_detected",
      );
    }
  });

  it("rejects scopes that are not forbidden by token but are outside the allowlist", () => {
    const validation = validateWwwAuthenticateScopeChallenge(["finance:read"]);

    expect(validation.accepted).toBe(false);
    expect(validation.forbiddenMatches).toEqual([]);
    expect(validation.rejectedScopes).toEqual(["finance:read"]);
    expect(validation.rejectionReasons).toContain(
      "scope_not_in_read_only_allowlist",
    );
  });

  it("passes safe absence wording but rejects realistic token leakage shapes", () => {
    const openAiApiKeyName = ["OPENAI", "API", "KEY"].join("_");
    const safeText = [
      "No token values, cookies, sessions, credentials, client secrets, authorization headers, raw finance data, raw source dumps, provider credentials, OpenAI keys, companyKey authority, or app submission copy appear in examples.",
      `${openAiApiKeyName} must be absent from proof examples.`,
      "WWW-Authenticate examples prohibit bearer token material.",
    ].join("\n");
    const leakingExamples = [
      "Authorization: Bearer abcdefghijklmnopqrstuvwxyz",
      "Bearer abcdefghijklmnopqrstuvwxyz",
      "Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==",
      `${openAiApiKeyName}=sk-project123456789`,
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
    ];

    expect(scanWwwAuthenticateNoTokenLeakage(safeText).accepted).toBe(true);
    for (const text of leakingExamples) {
      const scan = scanWwwAuthenticateNoTokenLeakage(text);
      expect(scan.accepted, text).toBe(false);
      expect(scan.matches.length, text).toBeGreaterThan(0);
    }
  });

  it("keeps the local proof reference exact and never authorizes runtime header emission", () => {
    const localReference =
      deriveWwwAuthenticateResourceMetadataReferenceContract();
    const validFutureReference =
      deriveWwwAuthenticateResourceMetadataReferenceContract({
        publicCanonicalUrlProofAvailable: true,
        referenceMode: "public_runtime_canonical_url",
        resourceMetadataReference:
          "https://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/mcp",
      });

    expect(localReference.reference).toBe(
      MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE,
    );
    expect(localReference.localProofOnly).toBe(true);
    expect(localReference.runtimeHeaderEmissionAllowed).toBe(false);
    expect(validFutureReference.publicRuntimeReferenceAllowed).toBe(true);
    expect(validFutureReference.runtimeHeaderEmissionAllowed).toBe(false);
  });

  it("rejects unsafe public resource_metadata reference candidates even when proof is claimed", () => {
    const invalidCandidates = [
      "http://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/mcp",
      "https://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/mcp?companyKey=acme",
      "https://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/mcp#fragment",
      "https://user:pass@mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/mcp",
      "https://localhost:3000/.well-known/oauth-protected-resource/mcp",
      "https://127.0.0.1/.well-known/oauth-protected-resource/mcp",
      "https://pocket-cfo.ngrok-free.app/.well-known/oauth-protected-resource/mcp",
      "https://your-mcp.example.com/.well-known/oauth-protected-resource/mcp",
      "https://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/mcp/companyKey",
      "https://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/mcp/user",
      "https://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/mcp/org",
      "https://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/mcp/workspace",
      "https://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/mcp/tenant",
      "https://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/mcp/access_token/abc123secret",
      "https://mcp.canonical-finance-host.com/arbitrary-https-string",
    ];

    for (const candidate of invalidCandidates) {
      const validation =
        validateWwwAuthenticatePublicResourceMetadataReferenceCandidate(
          candidate,
        );
      const reference =
        deriveWwwAuthenticateResourceMetadataReferenceContract({
          publicCanonicalUrlProofAvailable: true,
          referenceMode: "public_runtime_canonical_url",
          resourceMetadataReference: candidate,
        });

      expect(validation.accepted, candidate).toBe(false);
      expect(reference.publicRuntimeReferenceAllowed, candidate).toBe(false);
      expect(reference.runtimeHeaderEmissionAllowed, candidate).toBe(false);
      expect(reference.reference, candidate).toBeNull();
    }
  });

});
