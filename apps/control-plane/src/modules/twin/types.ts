import { z } from "zod";
import { TwinJsonObjectSchema } from "@pocket-cto/domain";
import type {
  TwinEdgeSchema,
  TwinEntitySchema,
  TwinSyncRunSchema,
} from "@pocket-cto/domain";

export const TwinEntityUpsertInputSchema = z.object({
  repoFullName: z.string().min(1),
  kind: z.string().min(1),
  stableKey: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().nullable().optional(),
  payload: TwinJsonObjectSchema.optional(),
  observedAt: z.string().datetime({ offset: true }),
  staleAfter: z.string().datetime({ offset: true }).nullable().optional(),
  sourceRunId: z.string().uuid().nullable().optional(),
});

export const TwinEdgeUpsertInputSchema = z.object({
  repoFullName: z.string().min(1),
  kind: z.string().min(1),
  fromEntityId: z.string().uuid(),
  toEntityId: z.string().uuid(),
  payload: TwinJsonObjectSchema.optional(),
  observedAt: z.string().datetime({ offset: true }),
  sourceRunId: z.string().uuid().nullable().optional(),
});

export const TwinSyncRunStartInputSchema = z.object({
  repoFullName: z.string().min(1),
  extractor: z.string().min(1),
  startedAt: z.string().datetime({ offset: true }).optional(),
  stats: TwinJsonObjectSchema.optional(),
});

export const TwinSyncRunTerminalStatusSchema = z.enum(["succeeded", "failed"]);

export const TwinSyncRunFinishInputSchema = z.object({
  runId: z.string().uuid(),
  status: TwinSyncRunTerminalStatusSchema,
  completedAt: z.string().datetime({ offset: true }).optional(),
  stats: TwinJsonObjectSchema.optional(),
  errorSummary: z.string().nullable().optional(),
});

export type TwinEntityRecord = z.infer<typeof TwinEntitySchema>;
export type TwinEdgeRecord = z.infer<typeof TwinEdgeSchema>;
export type TwinSyncRunRecord = z.infer<typeof TwinSyncRunSchema>;
export type TwinEntityUpsertInput = z.infer<typeof TwinEntityUpsertInputSchema>;
export type TwinEdgeUpsertInput = z.infer<typeof TwinEdgeUpsertInputSchema>;
export type TwinSyncRunStartInput = z.infer<
  typeof TwinSyncRunStartInputSchema
>;
export type TwinSyncRunFinishInput = z.infer<
  typeof TwinSyncRunFinishInputSchema
>;
