import type { FastifyInstance } from "fastify";
import type { MonitoringServicePort } from "../../lib/types";
import {
  monitoringCompanyKeyParamsSchema,
  runMonitorBodySchema,
} from "./schema";

export async function registerMonitoringRoutes(
  app: FastifyInstance,
  deps: { monitoringService: MonitoringServicePort },
) {
  app.post(
    "/monitoring/companies/:companyKey/cash-posture/run",
    async (request, reply) => {
      const params = monitoringCompanyKeyParamsSchema.parse(request.params);
      const body = runMonitorBodySchema.parse(request.body ?? {});
      const result = await deps.monitoringService.runCashPostureMonitor({
        companyKey: params.companyKey,
        runKey: body.runKey ?? body.idempotencyKey ?? null,
        triggeredBy: body.triggeredBy ?? body.runBy ?? "operator",
      });

      reply.code(201);
      return result;
    },
  );

  app.get(
    "/monitoring/companies/:companyKey/cash-posture/latest",
    async (request) => {
      const params = monitoringCompanyKeyParamsSchema.parse(request.params);
      return deps.monitoringService.getLatestCashPostureMonitorResult(
        params.companyKey,
      );
    },
  );

  app.post(
    "/monitoring/companies/:companyKey/collections-pressure/run",
    async (request, reply) => {
      const params = monitoringCompanyKeyParamsSchema.parse(request.params);
      const body = runMonitorBodySchema.parse(request.body ?? {});
      const result = await deps.monitoringService.runCollectionsPressureMonitor(
        {
          companyKey: params.companyKey,
          runKey: body.runKey ?? body.idempotencyKey ?? null,
          triggeredBy: body.triggeredBy ?? body.runBy ?? "operator",
        },
      );

      reply.code(201);
      return result;
    },
  );

  app.get(
    "/monitoring/companies/:companyKey/collections-pressure/latest",
    async (request) => {
      const params = monitoringCompanyKeyParamsSchema.parse(request.params);
      return deps.monitoringService.getLatestCollectionsPressureMonitorResult(
        params.companyKey,
      );
    },
  );

  app.post(
    "/monitoring/companies/:companyKey/payables-pressure/run",
    async (request, reply) => {
      const params = monitoringCompanyKeyParamsSchema.parse(request.params);
      const body = runMonitorBodySchema.parse(request.body ?? {});
      const result = await deps.monitoringService.runPayablesPressureMonitor({
        companyKey: params.companyKey,
        runKey: body.runKey ?? body.idempotencyKey ?? null,
        triggeredBy: body.triggeredBy ?? body.runBy ?? "operator",
      });

      reply.code(201);
      return result;
    },
  );

  app.get(
    "/monitoring/companies/:companyKey/payables-pressure/latest",
    async (request) => {
      const params = monitoringCompanyKeyParamsSchema.parse(request.params);
      return deps.monitoringService.getLatestPayablesPressureMonitorResult(
        params.companyKey,
      );
    },
  );
}
