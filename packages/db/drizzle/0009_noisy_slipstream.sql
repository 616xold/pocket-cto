ALTER TABLE "repositories" DROP CONSTRAINT "repositories_installation_ref_id_github_installations_id_fk";
--> statement-breakpoint
ALTER TABLE "repositories" ADD COLUMN "installation_id" text;--> statement-breakpoint
ALTER TABLE "repositories" ADD COLUMN "owner_login" text;--> statement-breakpoint
ALTER TABLE "repositories" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "repositories" ADD COLUMN "is_private" boolean;--> statement-breakpoint
ALTER TABLE "repositories" ADD COLUMN "archived" boolean;--> statement-breakpoint
ALTER TABLE "repositories" ADD COLUMN "disabled" boolean;--> statement-breakpoint
ALTER TABLE "repositories" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "repositories" ADD COLUMN "last_synced_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "repositories" ADD COLUMN "removed_from_installation_at" timestamp with time zone;--> statement-breakpoint
UPDATE "repositories" AS "repositories"
SET
  "installation_id" = "github_installations"."installation_id",
  "owner_login" = split_part("repositories"."full_name", '/', 1),
  "name" = CASE
    WHEN position('/' in "repositories"."full_name") > 0
      THEN split_part("repositories"."full_name", '/', 2)
    ELSE "repositories"."full_name"
  END,
  "last_synced_at" = COALESCE("repositories"."last_synced_at", "repositories"."updated_at")
FROM "github_installations"
WHERE "repositories"."installation_ref_id" = "github_installations"."id";--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "repositories"
    WHERE "installation_id" IS NULL
       OR "owner_login" IS NULL
       OR "name" IS NULL
  ) THEN
    RAISE EXCEPTION 'Repository registry migration could not backfill required repository columns';
  END IF;
END
$$;--> statement-breakpoint
ALTER TABLE "repositories" ALTER COLUMN "installation_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "repositories" ALTER COLUMN "owner_login" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "repositories" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_installation_ref_id_github_installations_id_fk" FOREIGN KEY ("installation_ref_id") REFERENCES "public"."github_installations"("id") ON DELETE set null ON UPDATE no action;
