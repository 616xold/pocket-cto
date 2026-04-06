CREATE TYPE "public"."source_kind" AS ENUM('document', 'spreadsheet', 'dataset', 'image', 'archive', 'other');--> statement-breakpoint
CREATE TYPE "public"."source_origin_kind" AS ENUM('manual', 'connector');--> statement-breakpoint
CREATE TYPE "public"."source_snapshot_ingest_status" AS ENUM('registered', 'queued', 'processing', 'ready', 'failed');--> statement-breakpoint
CREATE TYPE "public"."source_snapshot_storage_kind" AS ENUM('local_path', 'external_url', 'object_store', 'connector_ref');--> statement-breakpoint
CREATE TABLE "source_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"original_file_name" text NOT NULL,
	"media_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"checksum_sha256" text NOT NULL,
	"storage_kind" "source_snapshot_storage_kind" NOT NULL,
	"storage_ref" text NOT NULL,
	"captured_at" timestamp with time zone NOT NULL,
	"ingest_status" "source_snapshot_ingest_status" DEFAULT 'registered' NOT NULL,
	"ingest_error_summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "source_kind" NOT NULL,
	"origin_kind" "source_origin_kind" DEFAULT 'manual' NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_by" text DEFAULT 'operator' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "source_snapshots" ADD CONSTRAINT "source_snapshots_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "source_snapshots_source_version_key" ON "source_snapshots" USING btree ("source_id","version");--> statement-breakpoint
CREATE INDEX "source_snapshots_source_id_idx" ON "source_snapshots" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "sources_kind_updated_at_idx" ON "sources" USING btree ("kind","updated_at");