import type { FastifyInstance } from "fastify";
import type { GitHubWebhookServicePort } from "../../lib/types";
import { GitHubWebhookPayloadParseError } from "./errors";
import { parseGitHubWebhookHeaders } from "./webhook-schema";

const JSON_CONTENT_TYPE = /^application\/json\b/u;

export async function registerGitHubWebhookRoutes(
  app: FastifyInstance,
  deps: {
    githubWebhookService: GitHubWebhookServicePort;
  },
) {
  await app.register(async (instance) => {
    instance.removeAllContentTypeParsers();
    instance.addContentTypeParser(
      JSON_CONTENT_TYPE,
      { parseAs: "buffer" },
      (_request, body, done) => {
        done(null, body);
      },
    );

    instance.post("/github/webhooks", async (request, reply) => {
      const headers = parseGitHubWebhookHeaders(request.headers);
      const rawBody = requireBuffer(request.body);
      const result = await deps.githubWebhookService.ingest({
        ...headers,
        rawBody,
      });

      reply.code(result.duplicate ? 200 : 202);
      return result;
    });
  });
}

function requireBuffer(body: unknown) {
  if (Buffer.isBuffer(body)) {
    return body;
  }

  throw new GitHubWebhookPayloadParseError();
}
