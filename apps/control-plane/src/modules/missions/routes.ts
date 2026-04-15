import type { FastifyInstance } from "fastify";
import type { CreateDiscoveryMissionInput } from "@pocket-cto/domain";
import type { MissionServicePort, OperatorControlAvailability } from "../../lib/types";
import {
  createAnalysisMissionSchema,
  createDiscoveryMissionSchema,
  createMissionFromTextSchema,
  listMissionsQuerySchema,
  missionIdParamsSchema,
} from "./schema";

export async function registerMissionRoutes(
  app: FastifyInstance,
  deps: {
    liveControl: OperatorControlAvailability;
    missionService: MissionServicePort;
  },
) {
  app.get("/missions", async (request) => {
    const query = listMissionsQuerySchema.parse(request.query);
    return deps.missionService.listMissions(query);
  });

  app.post("/missions/text", async (request, reply) => {
    const body = createMissionFromTextSchema.parse(request.body);
    const created = await deps.missionService.createFromText(body);
    reply.code(201);
    return created;
  });

  app.post("/missions/analysis", async (request, reply) => {
    const body = createAnalysisMissionSchema.parse(request.body);
    const created = await deps.missionService.createAnalysis(
      body as CreateDiscoveryMissionInput,
    );
    reply.code(201);
    return created;
  });

  app.post("/missions/discovery", async (request, reply) => {
    const body = createDiscoveryMissionSchema.parse(request.body);
    const created = await deps.missionService.createAnalysis(
      body as CreateDiscoveryMissionInput,
    );
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
