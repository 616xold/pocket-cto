import type { FastifyInstance } from "fastify";
import type { GitHubAppServicePort } from "../../lib/types";
import {
  parseGitHubInstallationParams,
  parseGitHubRepositoryParams,
  syncGitHubInstallationsBodySchema,
  syncGitHubRepositoriesBodySchema,
} from "./schema";

export async function registerGitHubAppRoutes(
  app: FastifyInstance,
  deps: {
    githubAppService: GitHubAppServicePort;
  },
) {
  app.get("/github/installations", async () => {
    return {
      installations: await deps.githubAppService.listInstallations(),
    };
  });

  app.post("/github/installations/sync", async (request) => {
    syncGitHubInstallationsBodySchema.parse(request.body ?? {});
    return deps.githubAppService.syncInstallations();
  });

  app.get("/github/repositories", async () => {
    return deps.githubAppService.listRepositories();
  });

  app.get("/github/repositories/:owner/:repo", async (request) => {
    const params = parseGitHubRepositoryParams(request.params);
    return deps.githubAppService.getRepository(`${params.owner}/${params.repo}`);
  });

  app.get("/github/installations/:installationId/repositories", async (request) => {
    const params = parseGitHubInstallationParams(request.params);
    return deps.githubAppService.listInstallationRepositories(
      params.installationId,
    );
  });

  app.post("/github/repositories/sync", async (request) => {
    syncGitHubRepositoriesBodySchema.parse(request.body ?? {});
    return deps.githubAppService.syncRepositories();
  });

  app.post(
    "/github/installations/:installationId/repositories/sync",
    async (request) => {
      syncGitHubRepositoriesBodySchema.parse(request.body ?? {});
      const params = parseGitHubInstallationParams(request.params);
      return deps.githubAppService.syncInstallationRepositories(
        params.installationId,
      );
    },
  );
}
