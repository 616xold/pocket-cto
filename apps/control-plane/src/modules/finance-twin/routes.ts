import type { FastifyInstance } from "fastify";
import type { FinanceTwinServicePort } from "../../lib/types";
import {
  financeTwinCompanyKeyParamsSchema,
  financeTwinGeneralLedgerBalanceProofParamsSchema,
  financeTwinGeneralLedgerBalanceProofQuerySchema,
  financeTwinGeneralLedgerActivityLineageParamsSchema,
  financeTwinGeneralLedgerActivityLineageQuerySchema,
  financeTwinLineageParamsSchema,
  financeTwinLineageQuerySchema,
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

  app.get("/finance-twin/companies/:companyKey/snapshot", async (request) => {
    const params = financeTwinCompanyKeyParamsSchema.parse(request.params);
    return deps.financeTwinService.getCompanySnapshot(params.companyKey);
  });

  app.get(
    "/finance-twin/companies/:companyKey/reconciliation/trial-balance-vs-general-ledger/balance-bridge-prerequisites",
    async (request) => {
      const params = financeTwinCompanyKeyParamsSchema.parse(request.params);
      return deps.financeTwinService.getBalanceBridgePrerequisites(
        params.companyKey,
      );
    },
  );

  app.get(
    "/finance-twin/companies/:companyKey/reconciliation/trial-balance-vs-general-ledger/account-bridge",
    async (request) => {
      const params = financeTwinCompanyKeyParamsSchema.parse(request.params);
      return deps.financeTwinService.getAccountBridgeReadiness(
        params.companyKey,
      );
    },
  );

  app.get(
    "/finance-twin/companies/:companyKey/reconciliation/trial-balance-vs-general-ledger",
    async (request) => {
      const params = financeTwinCompanyKeyParamsSchema.parse(request.params);
      return deps.financeTwinService.getReconciliationReadiness(
        params.companyKey,
      );
    },
  );

  app.get(
    "/finance-twin/companies/:companyKey/bank-accounts",
    async (request) => {
      const params = financeTwinCompanyKeyParamsSchema.parse(request.params);
      return deps.financeTwinService.getBankAccounts(params.companyKey);
    },
  );

  app.get(
    "/finance-twin/companies/:companyKey/cash-posture",
    async (request) => {
      const params = financeTwinCompanyKeyParamsSchema.parse(request.params);
      return deps.financeTwinService.getCashPosture(params.companyKey);
    },
  );

  app.get(
    "/finance-twin/companies/:companyKey/receivables-aging",
    async (request) => {
      const params = financeTwinCompanyKeyParamsSchema.parse(request.params);
      return deps.financeTwinService.getReceivablesAging(params.companyKey);
    },
  );

  app.get(
    "/finance-twin/companies/:companyKey/collections-posture",
    async (request) => {
      const params = financeTwinCompanyKeyParamsSchema.parse(request.params);
      return deps.financeTwinService.getCollectionsPosture(params.companyKey);
    },
  );

  app.get(
    "/finance-twin/companies/:companyKey/payables-aging",
    async (request) => {
      const params = financeTwinCompanyKeyParamsSchema.parse(request.params);
      return deps.financeTwinService.getPayablesAging(params.companyKey);
    },
  );

  app.get(
    "/finance-twin/companies/:companyKey/payables-posture",
    async (request) => {
      const params = financeTwinCompanyKeyParamsSchema.parse(request.params);
      return deps.financeTwinService.getPayablesPosture(params.companyKey);
    },
  );

  app.get(
    "/finance-twin/companies/:companyKey/account-catalog",
    async (request) => {
      const params = financeTwinCompanyKeyParamsSchema.parse(request.params);
      return deps.financeTwinService.getAccountCatalog(params.companyKey);
    },
  );

  app.get(
    "/finance-twin/companies/:companyKey/general-ledger",
    async (request) => {
      const params = financeTwinCompanyKeyParamsSchema.parse(request.params);
      return deps.financeTwinService.getGeneralLedger(params.companyKey);
    },
  );

  app.get(
    "/finance-twin/companies/:companyKey/general-ledger/accounts/:ledgerAccountId/balance-proof",
    async (request) => {
      const params = financeTwinGeneralLedgerBalanceProofParamsSchema.parse(
        request.params,
      );
      const query = financeTwinGeneralLedgerBalanceProofQuerySchema.parse(
        request.query ?? {},
      );

      return deps.financeTwinService.getGeneralLedgerAccountBalanceProof({
        companyKey: params.companyKey,
        ledgerAccountId: params.ledgerAccountId,
        syncRunId: query.syncRunId,
      });
    },
  );

  app.get(
    "/finance-twin/companies/:companyKey/general-ledger/accounts/:ledgerAccountId/lineage",
    async (request) => {
      const params = financeTwinGeneralLedgerActivityLineageParamsSchema.parse(
        request.params,
      );
      const query = financeTwinGeneralLedgerActivityLineageQuerySchema.parse(
        request.query ?? {},
      );

      return deps.financeTwinService.getGeneralLedgerAccountActivityLineage({
        companyKey: params.companyKey,
        ledgerAccountId: params.ledgerAccountId,
        syncRunId: query.syncRunId,
      });
    },
  );

  app.get(
    "/finance-twin/companies/:companyKey/lineage/:targetKind/:targetId",
    async (request) => {
      const params = financeTwinLineageParamsSchema.parse(request.params);
      const query = financeTwinLineageQuerySchema.parse(request.query ?? {});

      return deps.financeTwinService.getLineageDrill({
        companyKey: params.companyKey,
        targetKind: params.targetKind,
        targetId: params.targetId,
        syncRunId: query.syncRunId,
      });
    },
  );
}
