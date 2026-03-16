CREATE TYPE "public"."twin_sync_run_status" AS ENUM('running', 'succeeded', 'failed');--> statement-breakpoint
CREATE TABLE "twin_sync_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repo_full_name" text NOT NULL,
	"extractor" text NOT NULL,
	"status" "twin_sync_run_status" NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"stats" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"error_summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "twin_edges" ADD COLUMN "repo_full_name" text;--> statement-breakpoint
ALTER TABLE "twin_edges" ADD COLUMN "kind" text;--> statement-breakpoint
ALTER TABLE "twin_edges" ADD COLUMN "payload" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "twin_edges" ADD COLUMN "observed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "twin_edges" ADD COLUMN "source_run_id" uuid;--> statement-breakpoint
ALTER TABLE "twin_entities" ADD COLUMN "repo_full_name" text;--> statement-breakpoint
ALTER TABLE "twin_entities" ADD COLUMN "kind" text;--> statement-breakpoint
ALTER TABLE "twin_entities" ADD COLUMN "stable_key" text;--> statement-breakpoint
ALTER TABLE "twin_entities" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "twin_entities" ADD COLUMN "payload" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "twin_entities" ADD COLUMN "observed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "twin_entities" ADD COLUMN "stale_after" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "twin_entities" ADD COLUMN "source_run_id" uuid;--> statement-breakpoint
UPDATE "twin_entities"
SET
	"repo_full_name" = COALESCE("repo", 'legacy/unknown'),
	"kind" = "type"::text,
	"stable_key" = "key",
	"summary" = NULL,
	"payload" = COALESCE("metadata", '{}'::jsonb),
	"observed_at" = CASE
		WHEN "last_observed_at" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T'
			THEN "last_observed_at"::timestamp with time zone
		ELSE "created_at"
	END
WHERE
	"repo_full_name" IS NULL
	OR "kind" IS NULL
	OR "stable_key" IS NULL
	OR "observed_at" IS NULL;--> statement-breakpoint
ALTER TABLE "twin_entities" ALTER COLUMN "repo_full_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "twin_entities" ALTER COLUMN "kind" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "twin_entities" ALTER COLUMN "stable_key" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "twin_entities" ALTER COLUMN "observed_at" SET NOT NULL;--> statement-breakpoint
UPDATE "twin_edges"
SET
	"repo_full_name" = COALESCE(source_entity."repo_full_name", target_entity."repo_full_name", 'legacy/unknown'),
	"kind" = "twin_edges"."relation_type",
	"payload" = COALESCE("twin_edges"."payload", '{}'::jsonb),
	"observed_at" = "twin_edges"."created_at"
FROM "twin_entities" AS source_entity,
	"twin_entities" AS target_entity
WHERE
	source_entity."id" = "twin_edges"."from_entity_id"
	AND target_entity."id" = "twin_edges"."to_entity_id"
	AND (
		"twin_edges"."repo_full_name" IS NULL
		OR "twin_edges"."kind" IS NULL
		OR "twin_edges"."observed_at" IS NULL
	);--> statement-breakpoint
ALTER TABLE "twin_edges" ALTER COLUMN "repo_full_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "twin_edges" ALTER COLUMN "kind" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "twin_edges" ALTER COLUMN "observed_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "twin_edges" ADD CONSTRAINT "twin_edges_source_run_id_twin_sync_runs_id_fk" FOREIGN KEY ("source_run_id") REFERENCES "public"."twin_sync_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "twin_entities" ADD CONSTRAINT "twin_entities_source_run_id_twin_sync_runs_id_fk" FOREIGN KEY ("source_run_id") REFERENCES "public"."twin_sync_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "twin_edges_repo_full_name_kind_from_to_key" ON "twin_edges" USING btree ("repo_full_name","kind","from_entity_id","to_entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "twin_entities_repo_full_name_kind_stable_key_key" ON "twin_entities" USING btree ("repo_full_name","kind","stable_key");
