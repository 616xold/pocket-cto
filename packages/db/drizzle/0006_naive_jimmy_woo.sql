ALTER TABLE "github_installations" ADD COLUMN "app_id" text;--> statement-breakpoint
ALTER TABLE "github_installations" ADD COLUMN "target_type" text;--> statement-breakpoint
ALTER TABLE "github_installations" ADD COLUMN "target_id" text;--> statement-breakpoint
ALTER TABLE "github_installations" ADD COLUMN "suspended_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "github_installations" ADD COLUMN "permissions" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "github_installations" ADD COLUMN "last_synced_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "github_installations_installation_id_key" ON "github_installations" USING btree ("installation_id");