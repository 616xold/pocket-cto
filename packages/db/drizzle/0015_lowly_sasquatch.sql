CREATE TYPE "public"."provenance_record_kind" AS ENUM('source_file_registered');--> statement-breakpoint
CREATE TABLE "provenance_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"source_snapshot_id" uuid NOT NULL,
	"source_file_id" uuid NOT NULL,
	"kind" "provenance_record_kind" DEFAULT 'source_file_registered' NOT NULL,
	"recorded_by" text DEFAULT 'operator' NOT NULL,
	"recorded_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"source_snapshot_id" uuid NOT NULL,
	"original_file_name" text NOT NULL,
	"media_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"checksum_sha256" text NOT NULL,
	"storage_kind" "source_snapshot_storage_kind" NOT NULL,
	"storage_ref" text NOT NULL,
	"created_by" text DEFAULT 'operator' NOT NULL,
	"captured_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "provenance_records" ADD CONSTRAINT "provenance_records_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provenance_records" ADD CONSTRAINT "provenance_records_source_snapshot_id_source_snapshots_id_fk" FOREIGN KEY ("source_snapshot_id") REFERENCES "public"."source_snapshots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provenance_records" ADD CONSTRAINT "provenance_records_source_file_id_source_files_id_fk" FOREIGN KEY ("source_file_id") REFERENCES "public"."source_files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_files" ADD CONSTRAINT "source_files_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_files" ADD CONSTRAINT "source_files_source_snapshot_id_source_snapshots_id_fk" FOREIGN KEY ("source_snapshot_id") REFERENCES "public"."source_snapshots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "provenance_records_source_file_id_idx" ON "provenance_records" USING btree ("source_file_id");--> statement-breakpoint
CREATE INDEX "provenance_records_source_id_idx" ON "provenance_records" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "source_files_source_id_idx" ON "source_files" USING btree ("source_id");--> statement-breakpoint
CREATE UNIQUE INDEX "source_files_source_snapshot_id_key" ON "source_files" USING btree ("source_snapshot_id");