import type { FastifyInstance } from "fastify";
import type { MissionServicePort, OperatorControlAvailability } from "../../lib/types";
import { createMissionFromTextSchema, missionIdParamsSchema } from "./schema";

export async function registerMissionRoutes(
  app: FastifyInstance,
  deps: {
    liveControl: OperatorControlAvailability;
    missionService: MissionServicePort;
  },
) {
  app.post("/missions/text", async (request, reply) => {
    const body = createMissionFromTextSchema.parse(request.body);
    const created = await deps.missionService.createFromText(body);
    reply.code(201);
    return created;
  });

  app.get("/missions/:missionId", async (request) => {
    const params = missionIdParamsSchema.parse(request.params);
    return {
      ...(await deps.missionService.getMissionDetail(params.missionId)),
      liveControl: deps.liveControl,
    };
  });
}
