import type { FastifyInstance, FastifyReply } from "fastify";
import {
  assertMcpWwwAuthenticateLocalProofGatedMissingTokenChallengeDependency,
  buildMcpWwwAuthenticateAuthorizationHeaderNoValidationResponse,
  buildMcpWwwAuthenticateMissingTokenChallengeResponse,
  type McpWwwAuthenticateLocalProofGatedMissingTokenChallengeDependency,
} from "@pocket-cto/domain";
import {
  ReadOnlyAppMcpEndpointService,
  type ReadOnlyAppMcpEndpointResult,
} from "./service";
import {
  validateLocalMcpOriginHeader,
  type McpOriginValidationResult,
} from "./schema";

export async function registerReadOnlyAppMcpEndpointRoutes(
  app: FastifyInstance,
  deps: {
    readOnlyAppMcpEndpointService?: Pick<
      ReadOnlyAppMcpEndpointService,
      "handle"
    >;
    readOnlyAppMcpLocalProofGatedMissingTokenChallenge?: McpWwwAuthenticateLocalProofGatedMissingTokenChallengeDependency;
  } = {},
) {
  const service =
    deps.readOnlyAppMcpEndpointService ?? new ReadOnlyAppMcpEndpointService();
  const missingTokenChallenge =
    deps.readOnlyAppMcpLocalProofGatedMissingTokenChallenge === undefined
      ? null
      : assertMcpWwwAuthenticateLocalProofGatedMissingTokenChallengeDependency(
          deps.readOnlyAppMcpLocalProofGatedMissingTokenChallenge,
        );

  app.get("/mcp", async (request, reply) => {
    const originValidation = validateLocalMcpOriginHeader(
      request.headers.origin,
    );
    if (!originValidation.allowed) {
      return sendOriginRejected(reply, originValidation);
    }

    return reply.header("Allow", "POST").code(405).send();
  });

  app.post("/mcp", async (request, reply) => {
    const originValidation = validateLocalMcpOriginHeader(
      request.headers.origin,
    );
    if (!originValidation.allowed) {
      return sendOriginRejected(reply, originValidation);
    }

    if (missingTokenChallenge) {
      if (request.headers.authorization === undefined) {
        const challenge =
          buildMcpWwwAuthenticateMissingTokenChallengeResponse(
            missingTokenChallenge,
          );
        return reply
          .header("WWW-Authenticate", challenge.wwwAuthenticate)
          .code(challenge.statusCode)
          .send(challenge.body);
      }

      const failClosed =
        buildMcpWwwAuthenticateAuthorizationHeaderNoValidationResponse();
      return reply.code(failClosed.statusCode).send(failClosed.body);
    }

    const response: ReadOnlyAppMcpEndpointResult = service.handle(request.body);

    if (response === null) {
      return reply.code(202).send();
    }

    return response;
  });
}

function sendOriginRejected(
  reply: FastifyReply,
  validation: Extract<McpOriginValidationResult, { allowed: false }>,
) {
  return reply.code(403).send({
    error: "Forbidden Origin header",
    failClosed: true,
    localRouteAdapterOnly: true,
    reason: validation.reason,
  });
}
