import type { FastifyInstance } from "fastify";
import type { ReplayServicePort } from "../../lib/types";
import { replayMissionParamsSchema } from "./schema";

export async function registerReplayRoutes(
  app: FastifyInstance,
  deps: { replayService: ReplayServicePort },
) {
  app.get("/missions/:missionId/events", async (request) => {
    const { missionId } = replayMissionParamsSchema.parse(request.params);
    return deps.replayService.getMissionEvents(missionId);
  });
}
