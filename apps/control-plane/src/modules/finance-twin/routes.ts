import type { FastifyInstance } from "fastify";
import type { FinanceTwinServicePort } from "../../lib/types";
import {
  financeTwinCompanyKeyParamsSchema,
  financeTwinSyncBodySchema,
  financeTwinSyncParamsSchema,
} from "./schema";

export async function registerFinanceTwinRoutes(
  app: FastifyInstance,
  deps: { financeTwinService: FinanceTwinServicePort },
) {
  app.post(
    "/finance-twin/companies/:companyKey/source-files/:sourceFileId/sync",
    async (request, reply) => {
      const params = financeTwinSyncParamsSchema.parse(request.params);
      const body = financeTwinSyncBodySchema.parse(request.body ?? {});
      const created = await deps.financeTwinService.syncCompanySourceFile(
        params.companyKey,
        params.sourceFileId,
        body,
      );

      reply.code(201);
      return created;
    },
  );

  app.get("/finance-twin/companies/:companyKey/summary", async (request) => {
    const params = financeTwinCompanyKeyParamsSchema.parse(request.params);
    return deps.financeTwinService.getCompanySummary(params.companyKey);
  });

  app.get(
    "/finance-twin/companies/:companyKey/account-catalog",
    async (request) => {
      const params = financeTwinCompanyKeyParamsSchema.parse(request.params);
      return deps.financeTwinService.getAccountCatalog(params.companyKey);
    },
  );
}
