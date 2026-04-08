import type { FastifyInstance } from "fastify";
import type { SourceServicePort } from "../../lib/types";
import { SourceFilePayloadParseError } from "./errors";
import {
  createSourceSchema,
  listSourcesQuerySchema,
  registerSourceFileMetadataSchema,
  sourceFileIdParamsSchema,
  sourceIdParamsSchema,
} from "./schema";

const OCTET_STREAM_CONTENT_TYPE = /^application\/octet-stream\b/u;

export async function registerSourceRoutes(
  app: FastifyInstance,
  deps: { sourceService: SourceServicePort },
) {
  await app.register(async (instance) => {
    instance.addContentTypeParser(
      OCTET_STREAM_CONTENT_TYPE,
      { parseAs: "buffer" },
      (_request, body, done) => {
        done(null, body);
      },
    );

    instance.post("/sources/:sourceId/files", async (request, reply) => {
      const { sourceId } = sourceIdParamsSchema.parse(request.params);
      const metadata = registerSourceFileMetadataSchema.parse(request.query);
      const created = await deps.sourceService.registerSourceFile(
        sourceId,
        metadata,
        requireBuffer(request.body),
      );

      reply.code(201);
      return created;
    });
  });

  app.get("/sources", async (request) => {
    const query = listSourcesQuerySchema.parse(request.query);
    return deps.sourceService.listSources(query);
  });

  app.post("/sources", async (request, reply) => {
    const body = createSourceSchema.parse(request.body);
    const created = await deps.sourceService.createSource(body);
    reply.code(201);
    return created;
  });

  app.get("/sources/:sourceId", async (request) => {
    const { sourceId } = sourceIdParamsSchema.parse(request.params);
    return deps.sourceService.getSource(sourceId);
  });

  app.get("/sources/:sourceId/files", async (request) => {
    const { sourceId } = sourceIdParamsSchema.parse(request.params);
    return deps.sourceService.listSourceFiles(sourceId);
  });

  app.get("/sources/files/:sourceFileId", async (request) => {
    const { sourceFileId } = sourceFileIdParamsSchema.parse(request.params);
    return deps.sourceService.getSourceFile(sourceFileId);
  });
}

function requireBuffer(body: unknown) {
  if (Buffer.isBuffer(body)) {
    return body;
  }

  throw new SourceFilePayloadParseError();
}
