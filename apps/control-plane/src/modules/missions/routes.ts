import type { FastifyInstance } from "fastify";
import type { CreateDiscoveryMissionInput } from "@pocket-cto/domain";
import type {
  MissionReportingActionServicePort,
  MissionServicePort,
  OperatorControlAvailability,
} from "../../lib/types";
import {
  createAnalysisMissionSchema,
  createBoardPacketMissionSchema,
  createDiscoveryMissionSchema,
  createDiligencePacketMissionSchema,
  createLenderUpdateMissionSchema,
  exportReportingMissionMarkdownSchema,
  fileReportingMissionArtifactsSchema,
  createMissionFromTextSchema,
  createReportingMissionSchema,
  listMissionsQuerySchema,
  missionIdParamsSchema,
  recordReportingReleaseLogSchema,
  requestReportingCirculationApprovalSchema,
  requestReportingReleaseApprovalSchema,
} from "./schema";

export async function registerMissionRoutes(
  app: FastifyInstance,
  deps: {
    liveControl: OperatorControlAvailability;
    missionReportingActionsService: MissionReportingActionServicePort;
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

  app.post("/missions/reporting", async (request, reply) => {
    const body = createReportingMissionSchema.parse(request.body);
    const created = await deps.missionService.createReporting(body);
    reply.code(201);
    return created;
  });

  app.post("/missions/reporting/board-packets", async (request, reply) => {
    const body = createBoardPacketMissionSchema.parse(request.body);
    const created = await deps.missionService.createBoardPacket(body);
    reply.code(201);
    return created;
  });

  app.post("/missions/reporting/lender-updates", async (request, reply) => {
    const body = createLenderUpdateMissionSchema.parse(request.body);
    const created = await deps.missionService.createLenderUpdate(body);
    reply.code(201);
    return created;
  });

  app.post("/missions/reporting/diligence-packets", async (request, reply) => {
    const body = createDiligencePacketMissionSchema.parse(request.body);
    const created = await deps.missionService.createDiligencePacket(body);
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

  app.post(
    "/missions/:missionId/reporting/filed-artifacts",
    async (request, reply) => {
      const params = missionIdParamsSchema.parse(request.params);
      const body = fileReportingMissionArtifactsSchema.parse(
        request.body ?? {},
      );
      const filed =
        await deps.missionReportingActionsService.fileDraftArtifacts(
          params.missionId,
          body,
        );

      reply.code(201);
      return filed;
    },
  );

  app.post("/missions/:missionId/reporting/export", async (request, reply) => {
    const params = missionIdParamsSchema.parse(request.params);
    const body = exportReportingMissionMarkdownSchema.parse(request.body ?? {});
    const exported =
      await deps.missionReportingActionsService.exportMarkdownBundle(
        params.missionId,
        body,
      );

    reply.code(201);
    return exported;
  });

  app.post(
    "/missions/:missionId/reporting/circulation-approval",
    async (request, reply) => {
      const params = missionIdParamsSchema.parse(request.params);
      const body = requestReportingCirculationApprovalSchema.parse(
        request.body ?? {},
      );
      const result =
        await deps.missionReportingActionsService.requestCirculationApproval(
          params.missionId,
          body,
        );

      reply.code(result.created ? 201 : 200);
      return result;
    },
  );

  app.post(
    "/missions/:missionId/reporting/release-approval",
    async (request, reply) => {
      const params = missionIdParamsSchema.parse(request.params);
      const body = requestReportingReleaseApprovalSchema.parse(
        request.body ?? {},
      );
      const result =
        await deps.missionReportingActionsService.requestReleaseApproval(
          params.missionId,
          body,
        );

      reply.code(result.created ? 201 : 200);
      return result;
    },
  );

  app.post(
    "/missions/:missionId/reporting/release-log",
    async (request, reply) => {
      const params = missionIdParamsSchema.parse(request.params);
      const body = recordReportingReleaseLogSchema.parse(request.body ?? {});
      const result = await deps.missionReportingActionsService.recordReleaseLog(
        params.missionId,
        body,
      );

      reply.code(result.created ? 201 : 200);
      return result;
    },
  );
}
