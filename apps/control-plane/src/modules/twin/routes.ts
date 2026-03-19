import type { FastifyInstance } from "fastify";
import type { TwinServicePort } from "../../lib/types";
import { parseTwinRepositoryParams } from "./schema";

export async function registerTwinRoutes(
  app: FastifyInstance,
  deps: {
    twinService: TwinServicePort;
  },
) {
  app.post(
    "/twin/repositories/:owner/:repo/workflows-sync",
    async (request) => {
      const params = parseTwinRepositoryParams(request.params);
      return deps.twinService.syncRepositoryWorkflows(
        `${params.owner}/${params.repo}`,
      );
    },
  );

  app.post(
    "/twin/repositories/:owner/:repo/test-suites-sync",
    async (request) => {
      const params = parseTwinRepositoryParams(request.params);
      return deps.twinService.syncRepositoryTestSuites(
        `${params.owner}/${params.repo}`,
      );
    },
  );

  app.get("/twin/repositories/:owner/:repo/workflows", async (request) => {
    const params = parseTwinRepositoryParams(request.params);
    return deps.twinService.getRepositoryWorkflows(
      `${params.owner}/${params.repo}`,
    );
  });

  app.get("/twin/repositories/:owner/:repo/test-suites", async (request) => {
    const params = parseTwinRepositoryParams(request.params);
    return deps.twinService.getRepositoryTestSuites(
      `${params.owner}/${params.repo}`,
    );
  });

  app.get("/twin/repositories/:owner/:repo/ci-summary", async (request) => {
    const params = parseTwinRepositoryParams(request.params);
    return deps.twinService.getRepositoryCiSummary(
      `${params.owner}/${params.repo}`,
    );
  });

  app.get("/twin/repositories/:owner/:repo/freshness", async (request) => {
    const params = parseTwinRepositoryParams(request.params);
    return deps.twinService.getRepositoryFreshness(
      `${params.owner}/${params.repo}`,
    );
  });

  app.post(
    "/twin/repositories/:owner/:repo/ownership-sync",
    async (request) => {
      const params = parseTwinRepositoryParams(request.params);
      return deps.twinService.syncRepositoryOwnership(
        `${params.owner}/${params.repo}`,
      );
    },
  );

  app.get(
    "/twin/repositories/:owner/:repo/ownership-rules",
    async (request) => {
      const params = parseTwinRepositoryParams(request.params);
      return deps.twinService.getRepositoryOwnershipRules(
        `${params.owner}/${params.repo}`,
      );
    },
  );

  app.get("/twin/repositories/:owner/:repo/owners", async (request) => {
    const params = parseTwinRepositoryParams(request.params);
    return deps.twinService.getRepositoryOwners(
      `${params.owner}/${params.repo}`,
    );
  });

  app.get(
    "/twin/repositories/:owner/:repo/ownership-summary",
    async (request) => {
      const params = parseTwinRepositoryParams(request.params);
      return deps.twinService.getRepositoryOwnershipSummary(
        `${params.owner}/${params.repo}`,
      );
    },
  );

  app.post("/twin/repositories/:owner/:repo/metadata-sync", async (request) => {
    const params = parseTwinRepositoryParams(request.params);
    return deps.twinService.syncRepositoryMetadata(
      `${params.owner}/${params.repo}`,
    );
  });

  app.post("/twin/repositories/:owner/:repo/docs-sync", async (request) => {
    const params = parseTwinRepositoryParams(request.params);
    return deps.twinService.syncRepositoryDocs(
      `${params.owner}/${params.repo}`,
    );
  });

  app.post("/twin/repositories/:owner/:repo/runbooks-sync", async (request) => {
    const params = parseTwinRepositoryParams(request.params);
    return deps.twinService.syncRepositoryRunbooks(
      `${params.owner}/${params.repo}`,
    );
  });

  app.get("/twin/repositories/:owner/:repo/summary", async (request) => {
    const params = parseTwinRepositoryParams(request.params);
    return deps.twinService.getRepositoryMetadataSummary(
      `${params.owner}/${params.repo}`,
    );
  });

  app.get("/twin/repositories/:owner/:repo/docs", async (request) => {
    const params = parseTwinRepositoryParams(request.params);
    return deps.twinService.getRepositoryDocs(`${params.owner}/${params.repo}`);
  });

  app.get("/twin/repositories/:owner/:repo/doc-sections", async (request) => {
    const params = parseTwinRepositoryParams(request.params);
    return deps.twinService.getRepositoryDocSections(
      `${params.owner}/${params.repo}`,
    );
  });

  app.get("/twin/repositories/:owner/:repo/runbooks", async (request) => {
    const params = parseTwinRepositoryParams(request.params);
    return deps.twinService.getRepositoryRunbooks(
      `${params.owner}/${params.repo}`,
    );
  });

  app.get("/twin/repositories/:owner/:repo/entities", async (request) => {
    const params = parseTwinRepositoryParams(request.params);
    return deps.twinService.listRepositoryEntities(
      `${params.owner}/${params.repo}`,
    );
  });

  app.get("/twin/repositories/:owner/:repo/edges", async (request) => {
    const params = parseTwinRepositoryParams(request.params);
    return deps.twinService.listRepositoryEdges(
      `${params.owner}/${params.repo}`,
    );
  });

  app.get("/twin/repositories/:owner/:repo/runs", async (request) => {
    const params = parseTwinRepositoryParams(request.params);
    return deps.twinService.listRepositoryRuns(
      `${params.owner}/${params.repo}`,
    );
  });
}
