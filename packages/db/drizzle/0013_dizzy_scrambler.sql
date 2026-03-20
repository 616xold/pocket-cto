DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumlabel = 'manual_discovery'
      AND enumtypid = 'public.mission_source_kind'::regtype
  ) THEN
    ALTER TYPE "public"."mission_source_kind" ADD VALUE 'manual_discovery' BEFORE 'github_issue';
  END IF;
END
$$;--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumlabel = 'discovery_answer'
      AND enumtypid = 'public.artifact_kind'::regtype
  ) THEN
    ALTER TYPE "public"."artifact_kind" ADD VALUE 'discovery_answer' BEFORE 'pr_link';
  END IF;
END
$$;
