import { z } from "zod";
import { FinanceCompanyKeySchema } from "@pocket-cto/domain";

export const monitoringCompanyKeyParamsSchema = z
  .object({
    companyKey: FinanceCompanyKeySchema,
  })
  .strict();

export const runCashPostureMonitorBodySchema = z
  .object({
    idempotencyKey: z.string().trim().min(1).optional(),
    runBy: z.string().trim().min(1).optional(),
    runKey: z.string().trim().min(1).optional(),
    triggeredBy: z.string().trim().min(1).optional(),
  })
  .strict();
