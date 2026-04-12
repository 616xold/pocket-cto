import {
  FinanceBankAccountInventoryViewSchema,
  FinanceCashPostureViewSchema,
  FinanceBalanceBridgePrerequisitesViewSchema,
  FinanceAccountBridgeReadinessViewSchema,
  FinanceAccountCatalogViewSchema,
  FinanceCollectionsPostureViewSchema,
  FinanceContractsViewSchema,
  FinanceGeneralLedgerBalanceProofViewSchema,
  FinanceCompanyKeySchema,
  FinanceGeneralLedgerActivityLineageViewSchema,
  FinanceGeneralLedgerViewSchema,
  FinanceLineageDrillViewSchema,
  FinanceObligationCalendarViewSchema,
  FinancePayablesAgingViewSchema,
  FinancePayablesPostureViewSchema,
  FinanceReceivablesAgingViewSchema,
  FinanceReconciliationReadinessViewSchema,
  FinanceTwinLineageTargetKindSchema,
  FinanceSnapshotViewSchema,
  FinanceTwinCompanySummarySchema,
  FinanceTwinSyncInputSchema,
  FinanceTwinSyncResultSchema,
} from "@pocket-cto/domain";
import { z } from "zod";

export const financeTwinCompanyKeyParamsSchema = z.object({
  companyKey: FinanceCompanyKeySchema,
});

export const financeTwinSyncParamsSchema =
  financeTwinCompanyKeyParamsSchema.extend({
    sourceFileId: z.string().uuid(),
  });

export const financeTwinSyncBodySchema = FinanceTwinSyncInputSchema;

export const financeTwinLineageParamsSchema =
  financeTwinCompanyKeyParamsSchema.extend({
    targetId: z.string().uuid(),
    targetKind: FinanceTwinLineageTargetKindSchema,
  });

export const financeTwinLineageQuerySchema = z.object({
  syncRunId: z.string().uuid().optional(),
});

export const financeTwinGeneralLedgerActivityLineageParamsSchema =
  financeTwinCompanyKeyParamsSchema.extend({
    ledgerAccountId: z.string().uuid(),
  });

export const financeTwinGeneralLedgerBalanceProofParamsSchema =
  financeTwinCompanyKeyParamsSchema.extend({
    ledgerAccountId: z.string().uuid(),
  });

export const financeTwinGeneralLedgerActivityLineageQuerySchema = z.object({
  syncRunId: z.string().uuid().optional(),
});

export const financeTwinGeneralLedgerBalanceProofQuerySchema = z.object({
  syncRunId: z.string().uuid().optional(),
});

export {
  FinanceBankAccountInventoryViewSchema,
  FinanceCashPostureViewSchema,
  FinanceBalanceBridgePrerequisitesViewSchema,
  FinanceAccountBridgeReadinessViewSchema,
  FinanceAccountCatalogViewSchema,
  FinanceCollectionsPostureViewSchema,
  FinanceContractsViewSchema,
  FinanceGeneralLedgerBalanceProofViewSchema,
  FinanceGeneralLedgerActivityLineageViewSchema,
  FinanceGeneralLedgerViewSchema,
  FinanceLineageDrillViewSchema,
  FinanceObligationCalendarViewSchema,
  FinancePayablesAgingViewSchema,
  FinancePayablesPostureViewSchema,
  FinanceReceivablesAgingViewSchema,
  FinanceReconciliationReadinessViewSchema,
  FinanceSnapshotViewSchema,
  FinanceTwinCompanySummarySchema,
  FinanceTwinSyncResultSchema,
};
