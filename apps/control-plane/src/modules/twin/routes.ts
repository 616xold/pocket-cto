import type { FastifyInstance } from "fastify";
import type { TwinServicePort } from "../../lib/types";
import { parseTwinRepositoryParams } from "./schema";

export async function registerTwinRoutes(
  app: FastifyInstance,
  deps: {
    twinService: TwinServicePort;
  },
) {
  app.post("/twin/repositories/:owner/:repo/metadata-sync", async (request) => {
    const params = parseTwinRepositoryParams(request.params);
    return deps.twinService.syncRepositoryMetadata(
      `${params.owner}/${params.repo}`,
    );
  });

  app.get("/twin/repositories/:owner/:repo/summary", async (request) => {
    const params = parseTwinRepositoryParams(request.params);
    return deps.twinService.getRepositoryMetadataSummary(
      `${params.owner}/${params.repo}`,
    );
  });

  app.get("/twin/repositories/:owner/:repo/entities", async (request) => {
    const params = parseTwinRepositoryParams(request.params);
    return deps.twinService.listRepositoryEntities(`${params.owner}/${params.repo}`);
  });

  app.get("/twin/repositories/:owner/:repo/edges", async (request) => {
    const params = parseTwinRepositoryParams(request.params);
    return deps.twinService.listRepositoryEdges(`${params.owner}/${params.repo}`);
  });

  app.get("/twin/repositories/:owner/:repo/runs", async (request) => {
    const params = parseTwinRepositoryParams(request.params);
    return deps.twinService.listRepositoryRuns(`${params.owner}/${params.repo}`);
  });
}
