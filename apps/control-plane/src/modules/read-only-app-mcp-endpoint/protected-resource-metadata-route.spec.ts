import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import Fastify from "fastify";
import { afterEach, describe, expect, it } from "vitest";
import {
  MCP_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_SCHEMA_VERSION,
  MCP_TOOL_ALLOWLIST,
  buildProtectedResourceMetadataRouteInputEvidenceBundle,
  validRouteInput,
  validateProtectedResourceMetadataRouteInputEvidenceBundleSemanticCoherence,
} from "@pocket-cto/domain";
import { registerHttpErrorHandler } from "../../lib/http-errors";
import {
  READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
  registerReadOnlyAppMcpProtectedResourceMetadataRoute,
} from "./protected-resource-metadata-route";
import { registerReadOnlyAppMcpEndpointRoutes } from "./routes";

const repoRoot = fileURLToPath(new URL("../../../../../", import.meta.url));

describe("read-only app MCP protected-resource metadata route", () => {
  const apps: Array<ReturnType<typeof Fastify>> = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
  });

  it("does not register the metadata route when the evidence dependency is missing", async () => {
    const app = await buildMetadataRouteApp(apps);

    const response = await app.inject({
      method: "GET",
      url: READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
    });

    expect(
      app.hasRoute({
        method: "GET",
        url: READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
      }),
    ).toBe(false);
    expect(response.statusCode).toBe(404);
  });

  it("registers exactly the local GET metadata route when valid FP-0123 evidence is supplied", async () => {
    const app = await buildMetadataRouteApp(apps, validEvidenceBundle());

    const response = await app.inject({
      method: "GET",
      url: READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
    });
    const postResponse = await app.inject({
      method: "POST",
      url: READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
    });
    const putResponse = await app.inject({
      method: "PUT",
      url: READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
    });
    const patchResponse = await app.inject({
      method: "PATCH",
      url: READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
    });
    const deleteResponse = await app.inject({
      method: "DELETE",
      url: READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
    });
    const headResponse = await app.inject({
      method: "HEAD",
      url: READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
    });
    const rootResponse = await app.inject({
      method: "GET",
      url: "/.well-known/oauth-protected-resource",
    });

    expect(
      app.hasRoute({
        method: "GET",
        url: READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
      }),
    ).toBe(true);
    expect(
      app.hasRoute({
        method: "POST",
        url: READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
      }),
    ).toBe(false);
    expect(
      app.hasRoute({
        method: "HEAD",
        url: READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
      }),
    ).toBe(false);
    expect(response.statusCode).toBe(200);
    expect(String(response.headers["content-type"] ?? "")).toContain(
      "application/json",
    );
    expect(response.headers["www-authenticate"]).toBeUndefined();
    expect(Object.keys(response.json()).sort()).toEqual([
      "authorization_servers",
      "bearer_methods_supported",
      "resource",
      "scopes_supported",
    ]);
    expect(response.json()).toEqual(
      validEvidenceBundle().builderOutput.document,
    );
    expect([
      postResponse.statusCode,
      putResponse.statusCode,
      patchResponse.statusCode,
      deleteResponse.statusCode,
    ]).toEqual([404, 404, 404, 404]);
    expect(headResponse.statusCode).toBe(404);
    expect(rootResponse.statusCode).toBe(404);
  });

  it("emits no private, proof, raw source, raw finance, or generated-advice fields", async () => {
    const app = await buildMetadataRouteApp(apps, validEvidenceBundle());

    const response = await app.inject({
      method: "GET",
      url: READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(collectPrivateSurfaceHits(body)).toEqual([]);
    expect(JSON.stringify(body)).not.toMatch(
      /access_token|client_secret|companyKey|cookie|credential|generatedAdvice|generated_advice|internal|password|proof|rawFinance|raw_finance|rawSource|raw_source|refresh_token|secret|session/u,
    );
  });

  it.each([
    [
      "stale canonical URI evidence",
      (bundle: ReturnType<typeof validEvidenceBundle>) => ({
        ...bundle,
        canonicalUriEvidence: {
          ...bundle.canonicalUriEvidence,
          accepted: false,
        },
      }),
    ],
    [
      "missing canonical URI evidence",
      (bundle: ReturnType<typeof validEvidenceBundle>) =>
        withoutKey(bundle, "canonicalUriEvidence"),
    ],
    [
      "stale authorization server evidence",
      (bundle: ReturnType<typeof validEvidenceBundle>) => ({
        ...bundle,
        authorizationServerEvidence: {
          ...bundle.authorizationServerEvidence,
          accepted: false,
        },
      }),
    ],
    [
      "missing authorization server evidence",
      (bundle: ReturnType<typeof validEvidenceBundle>) =>
        withoutKey(bundle, "authorizationServerEvidence"),
    ],
    [
      "stale builder output evidence",
      (bundle: ReturnType<typeof validEvidenceBundle>) => ({
        ...bundle,
        builderOutput: {
          ...bundle.builderOutput,
          accepted: false,
        },
      }),
    ],
    [
      "missing builder output evidence",
      (bundle: ReturnType<typeof validEvidenceBundle>) =>
        withoutKey(bundle, "builderOutput"),
    ],
    [
      "stale no-token-leakage evidence",
      (bundle: ReturnType<typeof validEvidenceBundle>) => ({
        ...bundle,
        noTokenLeakage: {
          ...bundle.noTokenLeakage,
          accepted: false,
        },
      }),
    ],
    [
      "missing no-token-leakage evidence",
      (bundle: ReturnType<typeof validEvidenceBundle>) =>
        withoutKey(bundle, "noTokenLeakage"),
    ],
    [
      "missing authenticated company-binding prerequisite evidence",
      (bundle: ReturnType<typeof validEvidenceBundle>) =>
        withoutKey(bundle, "companyBindingPrerequisite"),
    ],
    [
      "missing /mcp unchanged prerequisite evidence",
      (bundle: ReturnType<typeof validEvidenceBundle>) =>
        withoutKey(bundle, "mcpUnchanged"),
    ],
  ])("fails closed before route registration for %s", async (_name, mutate) => {
    const app = Fastify();
    apps.push(app);

    await expect(
      registerReadOnlyAppMcpProtectedResourceMetadataRoute(app, {
        routeInputEvidenceBundle: mutate(validEvidenceBundle()),
      }),
    ).rejects.toThrow(/metadata route evidence dependency/u);
    expect(
      app.hasRoute({
        method: "GET",
        url: READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
      }),
    ).toBe(false);
  });

  it("verifies schema version and semantic coherence for a valid evidence bundle", () => {
    const coherence =
      validateProtectedResourceMetadataRouteInputEvidenceBundleSemanticCoherence(
        validEvidenceBundle(),
      );

    expect(validEvidenceBundle().schemaVersion).toBe(
      MCP_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_SCHEMA_VERSION,
    );
    expect(coherence.routeInputEvidenceSchemaVersionVerified).toBe(true);
    expect(coherence.metadataDocumentResourceMatchesCanonicalUriEvidence).toBe(
      true,
    );
    expect(coherence.pathDecisionCanonicalUriMatchesEvidence).toBe(true);
    expect(coherence.pathDecisionMetadataUrlMatchesEvidence).toBe(true);
    expect(coherence.routePathMatchesPathDecision).toBe(true);
    expect(
      coherence.metadataDocumentAuthorizationServersMatchEvidence,
    ).toBe(true);
    expect(coherence.metadataDocumentScopesRemainReadOnly).toBe(true);
    expect(coherence.metadataDocumentBearerMethodsRemainHeaderOnly).toBe(true);
    expect(coherence.routeInputEvidenceSemanticCoherenceVerified).toBe(true);
  });

  it.each([
    [
      "mismatched document.resource",
      (bundle: ReturnType<typeof validEvidenceBundle>) => ({
        ...bundle,
        builderOutput: {
          ...bundle.builderOutput,
          document: {
            ...bundle.builderOutput.document,
            resource: "https://mcp.canonical-finance-host.com/other",
          },
        },
      }),
    ],
    [
      "mismatched pathDecision.canonicalResourceUri",
      (bundle: ReturnType<typeof validEvidenceBundle>) => ({
        ...bundle,
        pathDecision: {
          ...bundle.pathDecision,
          canonicalResourceUri:
            "https://mcp.canonical-finance-host.com/other",
        },
      }),
    ],
    [
      "mismatched pathDecision.metadataUrl",
      (bundle: ReturnType<typeof validEvidenceBundle>) => ({
        ...bundle,
        pathDecision: {
          ...bundle.pathDecision,
          metadataUrl:
            "https://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/other",
        },
      }),
    ],
    [
      "mismatched metadataRoutePath",
      (bundle: ReturnType<typeof validEvidenceBundle>) => ({
        ...bundle,
        pathDecision: {
          ...bundle.pathDecision,
          metadataRoutePath:
            "/.well-known/oauth-protected-resource/other",
        },
      }),
    ],
    [
      "mismatched authorization_servers",
      (bundle: ReturnType<typeof validEvidenceBundle>) => ({
        ...bundle,
        builderOutput: {
          ...bundle.builderOutput,
          document: {
            ...bundle.builderOutput.document,
            authorization_servers: [
              "https://other-auth.canonical-finance-host.com",
            ],
          },
        },
      }),
    ],
    [
      "non-read-only scope in document",
      (bundle: ReturnType<typeof validEvidenceBundle>) => ({
        ...bundle,
        builderOutput: {
          ...bundle.builderOutput,
          document: {
            ...bundle.builderOutput.document,
            scopes_supported: ["mcp:read", "finance:write"],
          },
        },
      }),
    ],
    [
      "query bearer method in document",
      (bundle: ReturnType<typeof validEvidenceBundle>) => ({
        ...bundle,
        builderOutput: {
          ...bundle.builderOutput,
          document: {
            ...bundle.builderOutput.document,
            bearer_methods_supported: ["query"],
          },
        },
      }),
    ],
    [
      "wrong schemaVersion",
      (bundle: ReturnType<typeof validEvidenceBundle>) => ({
        ...bundle,
        schemaVersion: "v2aq.read-only-app-mcp-protected-resource-metadata-route-input.v0",
      }),
    ],
    [
      "schema-valid but semantically incoherent evidence",
      (bundle: ReturnType<typeof validEvidenceBundle>) => ({
        ...bundle,
        canonicalUriEvidence: {
          ...bundle.canonicalUriEvidence,
          metadataUrl:
            "https://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/other",
        },
      }),
    ],
  ] satisfies Array<
    [string, (bundle: ReturnType<typeof validEvidenceBundle>) => unknown]
  >)(
    "fails closed before route registration for %s",
    async (_name, mutate) => {
      const app = Fastify();
      apps.push(app);

      await expect(
        registerReadOnlyAppMcpProtectedResourceMetadataRoute(app, {
          routeInputEvidenceBundle: mutate(validEvidenceBundle()),
        }),
      ).rejects.toThrow(/metadata route evidence dependency/u);
      expect(
        app.hasRoute({
          method: "GET",
          url: READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH,
        }),
      ).toBe(false);
    },
  );

  it("keeps existing /mcp behavior unchanged when the metadata route is registered", async () => {
    const app = Fastify();
    apps.push(app);
    registerHttpErrorHandler(app);
    await registerReadOnlyAppMcpEndpointRoutes(app);
    await registerReadOnlyAppMcpProtectedResourceMetadataRoute(app, {
      routeInputEvidenceBundle: validEvidenceBundle(),
    });

    const getResponse = await app.inject({
      headers: {
        accept: "text/event-stream",
      },
      method: "GET",
      url: "/mcp",
    });
    const initializeResponse = await app.inject({
      method: "POST",
      payload: {
        id: "init-1",
        jsonrpc: "2.0",
        method: "initialize",
      },
      url: "/mcp",
    });
    const pingResponse = await app.inject({
      method: "POST",
      payload: {
        id: "ping-1",
        jsonrpc: "2.0",
        method: "ping",
      },
      url: "/mcp",
    });
    const toolsListResponse = await app.inject({
      method: "POST",
      payload: {
        id: "tools-1",
        jsonrpc: "2.0",
        method: "tools/list",
      },
      url: "/mcp",
    });
    const toolCallResponse = await app.inject({
      method: "POST",
      payload: {
        id: "call-1",
        jsonrpc: "2.0",
        method: "tools/call",
        params: {
          arguments: {
            companyKey: "acme",
            query: "cash posture",
          },
          name: "search_evidence",
        },
      },
      url: "/mcp",
    });
    const notificationResponse = await app.inject({
      method: "POST",
      payload: {
        jsonrpc: "2.0",
        method: "notifications/initialized",
      },
      url: "/mcp",
    });
    const originRejectedResponse = await app.inject({
      headers: {
        origin: "https://attacker.example",
      },
      method: "POST",
      payload: {
        id: "origin-1",
        jsonrpc: "2.0",
        method: "initialize",
      },
      url: "/mcp",
    });

    expect(getResponse.statusCode).toBe(405);
    expect(getResponse.headers.allow).toBe("POST");
    expect(getResponse.body).toBe("");
    expect(getResponse.headers["www-authenticate"]).toBeUndefined();
    expect(initializeResponse.statusCode).toBe(200);
    expect(initializeResponse.json()).toMatchObject({
      id: "init-1",
      result: {
        capabilities: {
          tools: {
            listChanged: false,
          },
        },
      },
    });
    expect(pingResponse.json()).toEqual({
      id: "ping-1",
      jsonrpc: "2.0",
      result: {},
    });
    expect(
      toolsListResponse
        .json()
        .result.tools.map((tool: { name: string }) => tool.name),
    ).toEqual([...MCP_TOOL_ALLOWLIST]);
    expect(toolCallResponse.json()).toMatchObject({
      result: {
        isError: true,
        structuredContent: {
          refusalReason:
            "tool_dispatch_not_implemented_until_later_finance_plan",
        },
      },
    });
    expect(notificationResponse.statusCode).toBe(202);
    expect(notificationResponse.body).toBe("");
    expect(originRejectedResponse.statusCode).toBe(403);
    expect(originRejectedResponse.json()).toMatchObject({
      failClosed: true,
      localRouteAdapterOnly: true,
      reason: "invalid_origin",
    });
  });

  it("does not add forbidden metadata route implementation scope", () => {
    const source = readRepoFile(
      "apps/control-plane/src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.ts",
    );
    const keyName = ["OPENAI", "API", "KEY"].join("_");
    const packageName = ["open", "ai"].join("");

    expect(source).not.toMatch(new RegExp(`\\b${keyName}\\b`, "u"));
    expect(source).not.toMatch(
      new RegExp(`from\\s+["']${packageName}["']`, "u"),
    );
    expect(source).not.toMatch(
      /\b(?:createServerContainer|process\.env|select\s*\(|insert\s*\(|update\s*\(|delete\s*\(|fetch\s*\(|providerConnect|sendReport|uploadSource|updateLedger|writeFinanceTwin|autonomousAction)\b/u,
    );
    expect(source).not.toMatch(
      /\b(?:oauthCallback|authorizeUrl|tokenExchange|authMiddleware|authorizationMiddleware|routeGuard|verifyBearer|setCookie|tokenStore|sessionStore|refreshTokenStore)\s*\(/u,
    );
    expect(source).not.toMatch(/\b(?:registerResource|ui:\/\/|McpServer)\b/u);
  });
});

async function buildMetadataRouteApp(
  apps: Array<ReturnType<typeof Fastify>>,
  routeInputEvidenceBundle?: unknown,
) {
  const app = Fastify();
  apps.push(app);
  registerHttpErrorHandler(app);
  await registerReadOnlyAppMcpProtectedResourceMetadataRoute(app, {
    routeInputEvidenceBundle,
  });
  return app;
}

function validEvidenceBundle() {
  return buildProtectedResourceMetadataRouteInputEvidenceBundle(validRouteInput);
}

function withoutKey<T extends Record<string, unknown>, K extends keyof T>(
  input: T,
  key: K,
) {
  const copy = { ...input };
  delete copy[key];
  return copy;
}

function collectPrivateSurfaceHits(input: unknown, path = "$"): string[] {
  if (Array.isArray(input)) {
    return input.flatMap((value, index) =>
      collectPrivateSurfaceHits(value, `${path}[${index}]`),
    );
  }
  if (!input || typeof input !== "object") return [];

  return Object.entries(input).flatMap(([key, value]) => {
    const nextPath = `${path}.${key}`;
    const keyHit =
      /access_token|client_secret|companyKey|cookie|credential|generatedAdvice|generated_advice|internal|password|proof|rawFinance|raw_finance|rawSource|raw_source|refresh_token|secret|session/u.test(
        key,
      )
        ? [nextPath]
        : [];

    return [...keyHit, ...collectPrivateSurfaceHits(value, nextPath)];
  });
}

function readRepoFile(path: string) {
  const absolutePath = join(repoRoot, path);
  if (!existsSync(absolutePath)) return "";
  return readFileSync(absolutePath, "utf8");
}
