import { describe, expect, it } from "vitest";
import {
  MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH,
  deriveMcpProtectedResourceMetadataUrl,
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
      deriveMcpProtectedResourceMetadataUrl("https://mcp.example.com/mcp"),
    ).toEqual({
      canonicalResourceUri: "https://mcp.example.com/mcp",
      metadataRoutePath: "/.well-known/oauth-protected-resource/mcp",
      metadataUrl:
        "https://mcp.example.com/.well-known/oauth-protected-resource/mcp",
      rfc9728WellKnownPath: MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH,
    });
    expect(
      deriveMcpProtectedResourceMetadataUrl("https://mcp.example.com"),
    ).toMatchObject({
      metadataRoutePath: "/.well-known/oauth-protected-resource",
      metadataUrl: "https://mcp.example.com/.well-known/oauth-protected-resource",
    });
  });

  it("requires WWW-Authenticate resource_metadata URL to match the derived URL", () => {
    const canonicalResourceUri = "https://mcp.example.com/mcp";
    const derived =
      "https://mcp.example.com/.well-known/oauth-protected-resource/mcp";

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
          "https://mcp.example.com/.well-known/oauth-protected-resource",
      }).resourceMetadataUrlMatchesDerived,
    ).toBe(false);
  });
});
