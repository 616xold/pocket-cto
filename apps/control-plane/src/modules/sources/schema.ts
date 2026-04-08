import {
  CreateSourceInputSchema,
  RegisterSourceFileMetadataSchema,
} from "@pocket-cto/domain";
import { z } from "zod";

export const createSourceSchema = CreateSourceInputSchema;
export const registerSourceFileMetadataSchema = RegisterSourceFileMetadataSchema;

export const listSourcesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const sourceIdParamsSchema = z.object({
  sourceId: z.string().uuid(),
});

export const sourceFileIdParamsSchema = z.object({
  sourceFileId: z.string().uuid(),
});
