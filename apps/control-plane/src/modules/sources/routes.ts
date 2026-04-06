import type { FastifyInstance } from "fastify";
import type { SourceServicePort } from "../../lib/types";
import {
  createSourceSchema,
  listSourcesQuerySchema,
  sourceIdParamsSchema,
} from "./schema";

export async function registerSourceRoutes(
  app: FastifyInstance,
  deps: { sourceService: SourceServicePort },
) {
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
}
