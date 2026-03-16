import type { FastifyInstance } from "fastify";
import type { GitHubIssueIntakeServicePort } from "../../lib/types";
import { parseGitHubIssueIntakeDeliveryParams } from "./issue-intake-schema";

export async function registerGitHubIssueIntakeRoutes(
  app: FastifyInstance,
  deps: {
    githubIssueIntakeService: GitHubIssueIntakeServicePort;
  },
) {
  app.get("/github/intake/issues", async () => {
    return deps.githubIssueIntakeService.listIssues();
  });

  app.post("/github/intake/issues/:deliveryId/create-mission", async (request, reply) => {
    const params = parseGitHubIssueIntakeDeliveryParams(request.params);
    const result = await deps.githubIssueIntakeService.createMissionFromDelivery(
      params.deliveryId,
    );

    reply.code(result.outcome === "created" ? 201 : 200);
    return result;
  });
}
