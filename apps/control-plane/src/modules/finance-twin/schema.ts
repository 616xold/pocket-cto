import {
  FinanceAccountCatalogViewSchema,
  FinanceCompanyKeySchema,
  FinanceTwinCompanySummarySchema,
  FinanceTwinSyncInputSchema,
  FinanceTwinSyncResultSchema,
} from "@pocket-cto/domain";
import { z } from "zod";

export const financeTwinCompanyKeyParamsSchema = z.object({
  companyKey: FinanceCompanyKeySchema,
});

export const financeTwinSyncParamsSchema = financeTwinCompanyKeyParamsSchema.extend({
  sourceFileId: z.string().uuid(),
});

export const financeTwinSyncBodySchema = FinanceTwinSyncInputSchema;

export {
  FinanceAccountCatalogViewSchema,
  FinanceTwinCompanySummarySchema,
  FinanceTwinSyncResultSchema,
};
