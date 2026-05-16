import { describe, expect, it } from "vitest";
import {
  MCP_CANONICAL_RESOURCE_INVALID_METADATA_DERIVATION_CANDIDATES,
  MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH,
  deriveMcpProtectedResourceMetadataUrl,
  invalidCanonicalUriCandidatesFailClosedBeforeDerivation,
  tryDeriveMcpProtectedResourceMetadataUrlFromCanonicalUri,
  validateMcpCanonicalPublicResourceUriCandidate,
  validateMcpWwwAuthenticateResourceMetadataUrl,
} from "./read-only-app-mcp-canonical-resource";

describe("FP-0120 canonical public resource URI validation", () => {
  it("requires an exact stable HTTPS URI without placeholders", () => {
    expect(
      validateMcpCanonicalPublicResourceUriCandidate(
        "https://mcp.canonical-finance-host.com/mcp",
      ),
    ).toMatchObject({
      accepted: true,
      exactStableHttpsVerified: true,
      httpsVerified: true,
      noPlaceholder: true,
    });

    for (const uri of [
      "http://mcp.canonical-finance-host.com/mcp",
      "https://example.com/mcp",
      "https://mcp.example.com/mcp",
      "https://your-mcp.example.com/mcp",
      "https://mcp.placeholder-host.com/mcp",
      "not a url",
    ]) {
      expect(validateMcpCanonicalPublicResourceUriCandidate(uri).accepted).toBe(
        false,
      );
    }
  });

  it("rejects query strings, fragments, and unauthenticated selectors", () => {
    for (const uri of [
      "https://mcp.canonical-finance-host.com/mcp?companyKey=acme",
      "https://mcp.canonical-finance-host.com/mcp#fragment",
      "https://companykey.canonical-finance-host.com/mcp",
      "https://mcp.canonical-finance-host.com/companyKey/acme/mcp",
      "https://mcp.canonical-finance-host.com/users/sohaib/mcp",
      "https://mcp.canonical-finance-host.com/org/acme/mcp",
      "https://mcp.canonical-finance-host.com/workspace/acme/mcp",
      "https://mcp.canonical-finance-host.com/{tenant}/mcp",
      "https://mcp.canonical-finance-host.com/:tenant/mcp",
      "https://mcp.canonical-finance-host.com/[workspace]/mcp",
    ]) {
      const result = validateMcpCanonicalPublicResourceUriCandidate(uri);

      expect(result.accepted).toBe(false);
      expect(
        result.noQuery &&
          result.noFragment &&
          result.noCompanyKeyUserOrgSelectors &&
          result.noWorkspaceTenantTemplateValues &&
          result.noUnauthenticatedSelectorAuthority,
      ).toBe(false);
    }
  });

  it("rejects URL userinfo credentials before metadata derivation", () => {
    for (const uri of [
      "https://user:pass@mcp.canonical-finance-host.com/mcp",
      "https://client_secret@mcp.canonical-finance-host.com/mcp",
      "https://bearer-token@mcp.canonical-finance-host.com/mcp",
      "https://jwt@mcp.canonical-finance-host.com/mcp",
    ]) {
      const result = validateMcpCanonicalPublicResourceUriCandidate(uri);

      expect(result.accepted, uri).toBe(false);
      expect(result.noUserinfoCredentials).toBe(false);
      expect(
        tryDeriveMcpProtectedResourceMetadataUrlFromCanonicalUri(uri),
      ).toMatchObject({
        derivation: null,
        derived: false,
        validation: { accepted: false },
      });
    }
  });

  it("rejects secret-like authority and path material", () => {
    for (const uri of [
      "https://api-key.canonical-finance-host.com/mcp",
      "https://mcp.canonical-finance-host.com/private_key/mcp",
      "https://mcp.canonical-finance-host.com/basic/mcp",
      "https://mcp.canonical-finance-host.com/bearer/mcp",
    ]) {
      const result = validateMcpCanonicalPublicResourceUriCandidate(uri);

      expect(result.accepted, uri).toBe(false);
      expect(result.noCredentialLikeAuthorityOrPath).toBe(false);
    }
  });

  it("rejects localhost, local network placeholders, and tunnel authorities", () => {
    for (const uri of [
      "https://localhost:3000/mcp",
      "https://127.0.0.1:3000/mcp",
      "https://0.0.0.0:3000/mcp",
      "https://mcp.ngrok-free.app/mcp",
      "https://abc.ngrok.io/mcp",
      "https://pocket-cfo.loca.lt/mcp",
      "https://mcp.trycloudflare.com/mcp",
      "https://pocket-cfo.localhost.run/mcp",
    ]) {
      const result = validateMcpCanonicalPublicResourceUriCandidate(uri);

      expect(result.accepted).toBe(false);
      expect(
        result.noLocalhostAuthority && result.noLocalTunnelAuthority,
      ).toBe(false);
    }
  });

  it("derives RFC 9728 protected-resource metadata route paths", () => {
    expect(
      deriveMcpProtectedResourceMetadataUrl(
        "https://mcp.canonical-finance-host.com/mcp",
      ),
    ).toEqual({
      canonicalResourceUri: "https://mcp.canonical-finance-host.com/mcp",
      metadataRoutePath: "/.well-known/oauth-protected-resource/mcp",
      metadataUrl:
        "https://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/mcp",
      rfc9728WellKnownPath: MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH,
    });
    expect(
      deriveMcpProtectedResourceMetadataUrl(
        "https://mcp.canonical-finance-host.com",
      ),
    ).toMatchObject({
      metadataRoutePath: "/.well-known/oauth-protected-resource",
      metadataUrl:
        "https://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource",
    });
  });

  it("requires WWW-Authenticate resource_metadata URL to match the derived URL", () => {
    const canonicalResourceUri = "https://mcp.canonical-finance-host.com/mcp";
    const derived =
      "https://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/mcp";

    expect(
      validateMcpWwwAuthenticateResourceMetadataUrl({
        canonicalResourceUri,
        resourceMetadataUrl: derived,
      }).resourceMetadataUrlMatchesDerived,
    ).toBe(true);
    expect(
      validateMcpWwwAuthenticateResourceMetadataUrl({
        canonicalResourceUri,
        resourceMetadataUrl:
          "https://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource",
      }).resourceMetadataUrlMatchesDerived,
    ).toBe(false);
  });

  it("fails closed before derivation for invalid canonical URI candidates", () => {
    const invalidDerivation =
      invalidCanonicalUriCandidatesFailClosedBeforeDerivation(
        MCP_CANONICAL_RESOURCE_INVALID_METADATA_DERIVATION_CANDIDATES,
      );

    expect(
      tryDeriveMcpProtectedResourceMetadataUrlFromCanonicalUri(
        "https://mcp.canonical-finance-host.com/mcp",
      ),
    ).toMatchObject({
      derivation: {
        metadataRoutePath: "/.well-known/oauth-protected-resource/mcp",
        metadataUrl:
          "https://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/mcp",
      },
      derived: true,
      validation: { accepted: true },
    });
    expect(
      invalidDerivation.invalidCanonicalUriMetadataDerivationFailsClosed,
    ).toBe(true);

    for (const candidate of MCP_CANONICAL_RESOURCE_INVALID_METADATA_DERIVATION_CANDIDATES) {
      expect(
        tryDeriveMcpProtectedResourceMetadataUrlFromCanonicalUri(candidate),
      ).toMatchObject({
        derivation: null,
        derived: false,
        validation: { accepted: false },
      });
      expect(() => deriveMcpProtectedResourceMetadataUrl(candidate)).toThrow(
        /invalid canonical MCP resource URI/u,
      );
    }
  });
});
