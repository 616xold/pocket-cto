import type { FastifyInstance } from "fastify";
import type { GitHubAppServicePort } from "../../lib/types";
import { syncGitHubInstallationsBodySchema } from "./schema";

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
}
