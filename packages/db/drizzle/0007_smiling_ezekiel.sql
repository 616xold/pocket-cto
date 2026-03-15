CREATE TYPE "public"."github_webhook_outcome" AS ENUM('installation_state_updated', 'installation_repositories_updated', 'issue_envelope_recorded', 'issue_comment_envelope_recorded', 'ignored_event');--> statement-breakpoint
CREATE TABLE "github_webhook_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"delivery_id" text NOT NULL,
	"event_name" text NOT NULL,
	"action" text,
	"installation_id" text,
	"outcome" "github_webhook_outcome",
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "repositories" ADD COLUMN "github_repository_id" text;--> statement-breakpoint
CREATE UNIQUE INDEX "github_webhook_deliveries_delivery_id_key" ON "github_webhook_deliveries" USING btree ("delivery_id");--> statement-breakpoint
CREATE UNIQUE INDEX "repositories_github_repository_id_key" ON "repositories" USING btree ("github_repository_id") WHERE "repositories"."github_repository_id" is not null;