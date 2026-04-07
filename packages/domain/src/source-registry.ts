import { z } from "zod";

export const SourceKindSchema = z.enum([
  "document",
  "spreadsheet",
  "dataset",
  "image",
  "archive",
  "other",
]);

export const SourceOriginKindSchema = z.enum(["manual", "connector"]);

export const SourceSnapshotStorageKindSchema = z.enum([
  "local_path",
  "external_url",
  "object_store",
  "connector_ref",
]);

export const SourceSnapshotIngestStatusSchema = z.enum([
  "registered",
  "queued",
  "processing",
  "ready",
  "failed",
]);

export const SourceChecksumSha256Schema = z
  .string()
  .trim()
  .regex(/^[a-fA-F0-9]{64}$/, "Invalid SHA-256 checksum")
  .transform((value) => value.toLowerCase());

export const SourceRecordSchema = z.object({
  id: z.string().uuid(),
  kind: SourceKindSchema,
  originKind: SourceOriginKindSchema,
  name: z.string().min(1),
  description: z.string().nullable(),
  createdBy: z.string().min(1),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const SourceSnapshotRecordSchema = z.object({
  id: z.string().uuid(),
  sourceId: z.string().uuid(),
  version: z.number().int().positive(),
  originalFileName: z.string().min(1),
  mediaType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  checksumSha256: SourceChecksumSha256Schema,
  storageKind: SourceSnapshotStorageKindSchema,
  storageRef: z.string().min(1),
  capturedAt: z.string().datetime({ offset: true }),
  ingestStatus: SourceSnapshotIngestStatusSchema,
  ingestErrorSummary: z.string().nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const CreateSourceSnapshotInputSchema = z.object({
  originalFileName: z.string().trim().min(1),
  mediaType: z.string().trim().min(1),
  sizeBytes: z.number().int().nonnegative(),
  checksumSha256: SourceChecksumSha256Schema,
  storageKind: SourceSnapshotStorageKindSchema,
  storageRef: z.string().trim().min(1),
  capturedAt: z.string().datetime({ offset: true }).optional(),
  ingestStatus: SourceSnapshotIngestStatusSchema.default("registered"),
});

export const CreateSourceInputSchema = z.object({
  kind: SourceKindSchema,
  originKind: SourceOriginKindSchema.default("manual"),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).nullable().optional(),
  createdBy: z.string().trim().min(1).default("operator"),
  snapshot: CreateSourceSnapshotInputSchema,
});

export const SourceSummarySchema = SourceRecordSchema.extend({
  latestSnapshot: SourceSnapshotRecordSchema.nullable(),
  snapshotCount: z.number().int().nonnegative(),
});

export const SourceListViewSchema = z.object({
  limit: z.number().int().positive(),
  sourceCount: z.number().int().nonnegative(),
  sources: z.array(SourceSummarySchema),
});

export const SourceDetailViewSchema = z.object({
  source: SourceRecordSchema,
  snapshots: z.array(SourceSnapshotRecordSchema),
});

export type SourceKind = z.infer<typeof SourceKindSchema>;
export type SourceOriginKind = z.infer<typeof SourceOriginKindSchema>;
export type SourceSnapshotStorageKind = z.infer<
  typeof SourceSnapshotStorageKindSchema
>;
export type SourceSnapshotIngestStatus = z.infer<
  typeof SourceSnapshotIngestStatusSchema
>;
export type SourceRecord = z.infer<typeof SourceRecordSchema>;
export type SourceSnapshotRecord = z.infer<typeof SourceSnapshotRecordSchema>;
export type CreateSourceInput = z.infer<typeof CreateSourceInputSchema>;
export type CreateSourceSnapshotInput = z.infer<
  typeof CreateSourceSnapshotInputSchema
>;
export type SourceSummary = z.infer<typeof SourceSummarySchema>;
export type SourceListView = z.infer<typeof SourceListViewSchema>;
export type SourceDetailView = z.infer<typeof SourceDetailViewSchema>;
