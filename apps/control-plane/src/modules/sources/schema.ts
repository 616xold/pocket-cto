import { CreateSourceInputSchema } from "@pocket-cto/domain";
import { z } from "zod";

export const createSourceSchema = CreateSourceInputSchema;

export const listSourcesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const sourceIdParamsSchema = z.object({
  sourceId: z.string().uuid(),
});
