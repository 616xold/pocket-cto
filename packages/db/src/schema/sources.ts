import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./shared";

export const sourceKindEnum = pgEnum("source_kind", [
  "document",
  "spreadsheet",
  "dataset",
  "image",
  "archive",
  "other",
]);

export const sourceOriginKindEnum = pgEnum("source_origin_kind", [
  "manual",
  "connector",
]);

export const sourceSnapshotStorageKindEnum = pgEnum(
  "source_snapshot_storage_kind",
  ["local_path", "external_url", "object_store", "connector_ref"],
);

export const sourceSnapshotIngestStatusEnum = pgEnum(
  "source_snapshot_ingest_status",
  ["registered", "queued", "processing", "ready", "failed"],
);

export const sources = pgTable(
  "sources",
  {
    id: id(),
    kind: sourceKindEnum("kind").notNull(),
    originKind: sourceOriginKindEnum("origin_kind").notNull().default("manual"),
    name: text("name").notNull(),
    description: text("description"),
    createdBy: text("created_by").notNull().default("operator"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    kindUpdatedAtIndex: index("sources_kind_updated_at_idx").on(
      table.kind,
      table.updatedAt,
    ),
  }),
);

export const sourceSnapshots = pgTable(
  "source_snapshots",
  {
    id: id(),
    sourceId: uuid("source_id")
      .references(() => sources.id, { onDelete: "cascade" })
      .notNull(),
    version: integer("version").notNull(),
    originalFileName: text("original_file_name").notNull(),
    mediaType: text("media_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    checksumSha256: text("checksum_sha256").notNull(),
    storageKind: sourceSnapshotStorageKindEnum("storage_kind").notNull(),
    storageRef: text("storage_ref").notNull(),
    capturedAt: timestamp("captured_at", { withTimezone: true }).notNull(),
    ingestStatus: sourceSnapshotIngestStatusEnum("ingest_status")
      .notNull()
      .default("registered"),
    ingestErrorSummary: text("ingest_error_summary"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    sourceVersionUnique: uniqueIndex("source_snapshots_source_version_key").on(
      table.sourceId,
      table.version,
    ),
    sourceSnapshotLookupIndex: index("source_snapshots_source_id_idx").on(
      table.sourceId,
    ),
  }),
);
