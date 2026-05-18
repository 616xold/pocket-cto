import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import Fastify from "fastify";
import { afterEach, describe, expect, it } from "vitest";
import {
  MCP_TOOL_ALLOWLIST,
  MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE,
  MCP_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_HEADER,
  buildMcpWwwAuthenticateLocalProofGatedMissingTokenChallengeDependency,
} from "@pocket-cto/domain";
import { registerHttpErrorHandler } from "../../lib/http-errors";
import { registerReadOnlyAppMcpEndpointRoutes } from "./routes";

const repoRoot = fileURLToPath(new URL("../../../../../", import.meta.url));

describe("read-only app MCP endpoint routes", () => {
  const apps: Array<ReturnType<typeof Fastify>> = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
  });

  it("accepts POST /mcp initialize and returns read-only capabilities", async () => {
    const app = await buildTestApp(apps);

    const response = await app.inject({
      method: "POST",
      payload: {
        id: "init-1",
        jsonrpc: "2.0",
        method: "initialize",
      },
      url: "/mcp",
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["www-authenticate"]).toBeUndefined();
    expect(response.json()).toMatchObject({
      id: "init-1",
      jsonrpc: "2.0",
      result: {
        capabilities: {
          tools: {
            listChanged: false,
          },
        },
      },
    });
  });

  it("accepts POST /mcp ping and returns an empty result", async () => {
    const app = await buildTestApp(apps);

    const response = await app.inject({
      method: "POST",
      payload: {
        id: "ping-1",
        jsonrpc: "2.0",
        method: "ping",
      },
      url: "/mcp",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      id: "ping-1",
      jsonrpc: "2.0",
      result: {},
    });
  });

  it("handles initialized notification as accepted without a body", async () => {
    const app = await buildTestApp(apps);

    const response = await app.inject({
      method: "POST",
      payload: {
        jsonrpc: "2.0",
        method: "notifications/initialized",
      },
      url: "/mcp",
    });

    expect(response.statusCode).toBe(202);
    expect(response.headers["www-authenticate"]).toBeUndefined();
    expect(response.body).toBe("");
  });

  it("returns the exact V2G allowlist from tools/list", async () => {
    const app = await buildTestApp(apps);

    const response = await app.inject({
      method: "POST",
      payload: {
        id: "tools-1",
        jsonrpc: "2.0",
        method: "tools/list",
      },
      url: "/mcp",
    });

    expect(response.statusCode).toBe(200);
    expect(
      response.json().result.tools.map((tool: { name: string }) => tool.name),
    ).toEqual([...MCP_TOOL_ALLOWLIST]);
  });

  it("keeps tools/call fail-closed for valid tools, invalid tools, and invalid args", async () => {
    const app = await buildTestApp(apps);

    const validToolResponse = await app.inject({
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
    const invalidToolResponse = await app.inject({
      method: "POST",
      payload: {
        id: "call-2",
        jsonrpc: "2.0",
        method: "tools/call",
        params: {
          arguments: {},
          name: "send_report",
        },
      },
      url: "/mcp",
    });
    const invalidArgsResponse = await app.inject({
      method: "POST",
      payload: {
        id: "call-3",
        jsonrpc: "2.0",
        method: "tools/call",
        params: {
          arguments: {
            companyKey: "acme",
          },
          name: "search_evidence",
        },
      },
      url: "/mcp",
    });

    expect(validToolResponse.statusCode).toBe(200);
    expect(validToolResponse.json()).toMatchObject({
      result: {
        isError: true,
        structuredContent: {
          refusalReason:
            "tool_dispatch_not_implemented_until_later_finance_plan",
        },
      },
    });
    expect(invalidToolResponse.json()).toMatchObject({
      error: {
        code: -32602,
      },
    });
    expect(invalidArgsResponse.json()).toMatchObject({
      error: {
        code: -32602,
      },
    });
  });

  it("returns structured JSON-RPC errors for malformed envelopes and unknown methods", async () => {
    const app = await buildTestApp(apps);

    const malformedResponse = await app.inject({
      method: "POST",
      payload: {
        id: "bad-1",
        method: "initialize",
      },
      url: "/mcp",
    });
    const unknownMethodResponse = await app.inject({
      method: "POST",
      payload: {
        id: "bad-2",
        jsonrpc: "2.0",
        method: "resources/list",
      },
      url: "/mcp",
    });

    expect(malformedResponse.statusCode).toBe(200);
    expect(malformedResponse.json()).toMatchObject({
      error: {
        code: -32600,
      },
      id: null,
      jsonrpc: "2.0",
    });
    expect(unknownMethodResponse.statusCode).toBe(200);
    expect(unknownMethodResponse.json()).toMatchObject({
      error: {
        code: -32601,
      },
      id: "bad-2",
      jsonrpc: "2.0",
    });
  });

  it("handles GET /mcp as SSE unavailable", async () => {
    const app = await buildTestApp(apps);

    const response = await app.inject({
      headers: {
        accept: "text/event-stream",
      },
      method: "GET",
      url: "/mcp",
    });

    expect(app.hasRoute({ method: "GET", url: "/mcp" })).toBe(true);
    expect(response.statusCode).toBe(405);
    expect(response.headers.allow).toBe("POST");
    expect(response.headers["www-authenticate"]).toBeUndefined();
    expect(String(response.headers["content-type"] ?? "")).not.toContain(
      "text/event-stream",
    );
    expect(response.body).toBe("");
  });

  it("fails closed for non-local Origin headers", async () => {
    const app = await buildTestApp(apps);

    const postResponse = await app.inject({
      headers: {
        origin: "https://attacker.example",
      },
      method: "POST",
      payload: {
        id: "init-origin-blocked",
        jsonrpc: "2.0",
        method: "initialize",
      },
      url: "/mcp",
    });
    const getResponse = await app.inject({
      headers: {
        accept: "text/event-stream",
        origin: "https://attacker.example",
      },
      method: "GET",
      url: "/mcp",
    });

    expect(postResponse.statusCode).toBe(403);
    expect(postResponse.json()).toMatchObject({
      failClosed: true,
      localRouteAdapterOnly: true,
      reason: "invalid_origin",
    });
    expect(getResponse.statusCode).toBe(403);
    expect(getResponse.json()).toMatchObject({
      failClosed: true,
      localRouteAdapterOnly: true,
      reason: "invalid_origin",
    });
  });

  it("allows absent and loopback Origin headers for local clients", async () => {
    const app = await buildTestApp(apps);

    const absentOriginResponse = await app.inject({
      method: "POST",
      payload: {
        id: "init-absent-origin",
        jsonrpc: "2.0",
        method: "initialize",
      },
      url: "/mcp",
    });
    const localhostOriginResponse = await app.inject({
      headers: {
        origin: "http://localhost:3000",
      },
      method: "POST",
      payload: {
        id: "init-localhost-origin",
        jsonrpc: "2.0",
        method: "initialize",
      },
      url: "/mcp",
    });
    const loopbackOriginResponse = await app.inject({
      headers: {
        origin: "http://127.0.0.1:3000",
      },
      method: "POST",
      payload: {
        id: "init-loopback-origin",
        jsonrpc: "2.0",
        method: "initialize",
      },
      url: "/mcp",
    });

    expect(absentOriginResponse.statusCode).toBe(200);
    expect(absentOriginResponse.headers["www-authenticate"]).toBeUndefined();
    expect(localhostOriginResponse.statusCode).toBe(200);
    expect(loopbackOriginResponse.statusCode).toBe(200);
  });

  it("keeps default POST /mcp behavior unchanged without the explicit missing-token challenge dependency", async () => {
    const app = await buildTestApp(apps);

    const initializeResponse = await app.inject({
      method: "POST",
      payload: {
        id: "init-default-no-challenge",
        jsonrpc: "2.0",
        method: "initialize",
      },
      url: "/mcp",
    });
    const pingResponse = await app.inject({
      method: "POST",
      payload: {
        id: "ping-default-no-challenge",
        jsonrpc: "2.0",
        method: "ping",
      },
      url: "/mcp",
    });
    const toolsListResponse = await app.inject({
      method: "POST",
      payload: {
        id: "tools-default-no-challenge",
        jsonrpc: "2.0",
        method: "tools/list",
      },
      url: "/mcp",
    });

    expect(initializeResponse.statusCode).toBe(200);
    expect(initializeResponse.headers["www-authenticate"]).toBeUndefined();
    expect(initializeResponse.json()).toMatchObject({
      id: "init-default-no-challenge",
      result: {
        capabilities: {
          tools: {
            listChanged: false,
          },
        },
      },
    });
    expect(pingResponse.statusCode).toBe(200);
    expect(pingResponse.headers["www-authenticate"]).toBeUndefined();
    expect(pingResponse.json()).toEqual({
      id: "ping-default-no-challenge",
      jsonrpc: "2.0",
      result: {},
    });
    expect(toolsListResponse.statusCode).toBe(200);
    expect(toolsListResponse.headers["www-authenticate"]).toBeUndefined();
    expect(
      toolsListResponse
        .json()
        .result.tools.map((tool: { name: string }) => tool.name),
    ).toEqual([...MCP_TOOL_ALLOWLIST]);
  });

  it("emits a bounded missing-token challenge only when the explicit local proof-gated dependency is present", async () => {
    let serviceCalls = 0;
    const app = await buildTestApp(apps, {
      readOnlyAppMcpEndpointService: {
        handle() {
          serviceCalls += 1;
          throw new Error("missing-token challenge must run before dispatch");
        },
      },
      readOnlyAppMcpLocalProofGatedMissingTokenChallenge:
        buildMcpWwwAuthenticateLocalProofGatedMissingTokenChallengeDependency(),
    });

    const response = await app.inject({
      method: "POST",
      payload: {
        id: "init-explicit-missing-token",
        jsonrpc: "2.0",
        method: "initialize",
      },
      url: "/mcp",
    });
    const body = response.json();
    const serialized = JSON.stringify(body);

    expect(serviceCalls).toBe(0);
    expect(response.statusCode).toBe(401);
    expect(response.headers["www-authenticate"]).toBe(
      MCP_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_HEADER,
    );
    expect(response.headers["www-authenticate"]).toBe(
      `Bearer resource_metadata="${MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE}"`,
    );
    expect(String(response.headers["www-authenticate"])).not.toMatch(
      /access_token|client_secret|companyKey|cookie|localhost|ngrok|org\/|password|session|tenant\/|token\/|user\/|workspace\//iu,
    );
    expect(body).toEqual({
      error: "authorization_required",
      explicitDependencyOnly: true,
      localOnly: true,
      message:
        "Authorization is required for this local read-only MCP preview.",
      missingTokenOnly: true,
      readOnly: true,
      resourceMetadata: MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE,
    });
    expect(serialized).not.toMatch(
      /Bearer\s+[A-Za-z0-9._~+/-]{8,}|access_token|client_secret|companyKey|cookie|credential|generatedAdvice|generated_advice|internal|password|proof|rawFinance|raw_finance|rawSource|raw_source|refresh_token|secret|session/u,
    );
    expect(body.jsonrpc).toBeUndefined();
  });

  it("fails closed without authenticating when Authorization is present in explicit missing-token mode", async () => {
    let serviceCalls = 0;
    const suppliedAuthorization = "Bearer supplied-token-material";
    const app = await buildTestApp(apps, {
      readOnlyAppMcpEndpointService: {
        handle() {
          serviceCalls += 1;
          throw new Error("Authorization-present preview must not dispatch");
        },
      },
      readOnlyAppMcpLocalProofGatedMissingTokenChallenge:
        buildMcpWwwAuthenticateLocalProofGatedMissingTokenChallengeDependency(),
    });

    const response = await app.inject({
      headers: {
        authorization: suppliedAuthorization,
      },
      method: "POST",
      payload: {
        id: "init-explicit-authorization-present",
        jsonrpc: "2.0",
        method: "initialize",
      },
      url: "/mcp",
    });

    expect(serviceCalls).toBe(0);
    expect(response.statusCode).toBe(401);
    expect(response.headers["www-authenticate"]).toBeUndefined();
    expect(response.body).not.toContain(suppliedAuthorization);
    expect(response.body).not.toContain("supplied-token-material");
    expect(response.json()).toEqual({
      error: "token_validation_runtime_not_implemented",
      failClosed: true,
      localOnly: true,
      message:
        "Authorization was supplied, but this local read-only MCP preview does not implement token validation.",
      noTokenParsingRuntime: true,
      noTokenValidationRuntime: true,
      readOnly: true,
    });
  });

  it("preserves GET /mcp and Origin boundaries when the explicit challenge dependency is present", async () => {
    const app = await buildTestApp(apps, {
      readOnlyAppMcpLocalProofGatedMissingTokenChallenge:
        buildMcpWwwAuthenticateLocalProofGatedMissingTokenChallengeDependency(),
    });

    const getResponse = await app.inject({
      headers: {
        accept: "text/event-stream",
      },
      method: "GET",
      url: "/mcp",
    });
    const originRejectedResponse = await app.inject({
      headers: {
        origin: "https://attacker.example",
      },
      method: "POST",
      payload: {
        id: "init-origin-before-challenge",
        jsonrpc: "2.0",
        method: "initialize",
      },
      url: "/mcp",
    });

    expect(getResponse.statusCode).toBe(405);
    expect(getResponse.headers.allow).toBe("POST");
    expect(getResponse.headers["www-authenticate"]).toBeUndefined();
    expect(getResponse.body).toBe("");
    expect(originRejectedResponse.statusCode).toBe(403);
    expect(originRejectedResponse.headers["www-authenticate"]).toBeUndefined();
    expect(originRejectedResponse.json()).toMatchObject({
      failClosed: true,
      localRouteAdapterOnly: true,
      reason: "invalid_origin",
    });
  });

  it("does not add forbidden local route-adapter implementation scope", () => {
    const source = [
      "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts",
      "apps/control-plane/src/modules/read-only-app-mcp-endpoint/service.ts",
      "apps/control-plane/src/modules/read-only-app-mcp-endpoint/formatter.ts",
      "apps/control-plane/src/modules/read-only-app-mcp-endpoint/schema.ts",
    ]
      .map((path) => readRepoFile(path))
      .join("\n");
    const keyName = ["OPENAI", "API", "KEY"].join("_");
    const packageName = ["open", "ai"].join("");

    expect(source).not.toMatch(new RegExp(`\\b${keyName}\\b`, "u"));
    expect(source).not.toMatch(
      new RegExp(`from\\s+["']${packageName}["']`, "u"),
    );
    expect(source).not.toMatch(
      /\b(?:oauth|token exchange|session handler)\b/iu,
    );
    expect(source).not.toMatch(/\b(?:registerResource|ui:\/\/|McpServer)\b/u);
    expect(source).not.toMatch(/\b(?:fetch|providerConnect|sendReport)\s*\(/u);
    expect(source).not.toMatch(
      /\b(?:createMission|uploadSource|updateLedger)\s*\(/u,
    );
  });
});

async function buildTestApp(
  apps: Array<ReturnType<typeof Fastify>>,
  deps: Parameters<typeof registerReadOnlyAppMcpEndpointRoutes>[1] = {},
) {
  const app = Fastify();
  apps.push(app);
  registerHttpErrorHandler(app);
  await registerReadOnlyAppMcpEndpointRoutes(app, deps);
  return app;
}

function readRepoFile(path: string) {
  const absolutePath = join(repoRoot, path);
  if (!existsSync(absolutePath)) return "";
  return readFileSync(absolutePath, "utf8");
}
