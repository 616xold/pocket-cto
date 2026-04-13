CREATE TYPE "public"."cfo_wiki_export_run_status" AS ENUM('running', 'succeeded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."cfo_wiki_lint_finding_kind" AS ENUM('missing_refs', 'uncited_numeric_claim', 'orphan_page', 'stale_page', 'broken_link', 'unsupported_document_gap', 'duplicate_title');--> statement-breakpoint
CREATE TYPE "public"."cfo_wiki_lint_run_status" AS ENUM('running', 'succeeded', 'failed');--> statement-breakpoint
ALTER TYPE "public"."cfo_wiki_page_kind" ADD VALUE 'filed_artifact';--> statement-breakpoint
ALTER TYPE "public"."cfo_wiki_page_ownership_kind" ADD VALUE 'filed_artifact';--> statement-breakpoint
CREATE TABLE "cfo_wiki_export_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"status" "cfo_wiki_export_run_status" NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"triggered_by" text DEFAULT 'operator' NOT NULL,
	"exporter_version" text NOT NULL,
	"bundle_root_path" text NOT NULL,
	"page_count" integer DEFAULT 0 NOT NULL,
	"file_count" integer DEFAULT 0 NOT NULL,
	"manifest" jsonb,
	"files" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"error_summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cfo_wiki_lint_findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"lint_run_id" uuid NOT NULL,
	"page_id" uuid,
	"page_key" text,
	"page_title" text,
	"finding_kind" "cfo_wiki_lint_finding_kind" NOT NULL,
	"message" text NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cfo_wiki_lint_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"status" "cfo_wiki_lint_run_status" NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"triggered_by" text DEFAULT 'operator' NOT NULL,
	"linter_version" text NOT NULL,
	"stats" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"error_summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cfo_wiki_pages" DROP CONSTRAINT "cfo_wiki_pages_compile_run_id_cfo_wiki_compile_runs_id_fk";
--> statement-breakpoint
ALTER TABLE "cfo_wiki_pages" ALTER COLUMN "compile_run_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "cfo_wiki_pages" ADD COLUMN "filed_metadata" jsonb;--> statement-breakpoint
ALTER TABLE "cfo_wiki_export_runs" ADD CONSTRAINT "cfo_wiki_export_runs_company_id_finance_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."finance_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cfo_wiki_lint_findings" ADD CONSTRAINT "cfo_wiki_lint_findings_company_id_finance_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."finance_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cfo_wiki_lint_findings" ADD CONSTRAINT "cfo_wiki_lint_findings_lint_run_id_cfo_wiki_lint_runs_id_fk" FOREIGN KEY ("lint_run_id") REFERENCES "public"."cfo_wiki_lint_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cfo_wiki_lint_findings" ADD CONSTRAINT "cfo_wiki_lint_findings_page_id_cfo_wiki_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."cfo_wiki_pages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cfo_wiki_lint_runs" ADD CONSTRAINT "cfo_wiki_lint_runs_company_id_finance_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."finance_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cfo_wiki_export_runs_company_started_idx" ON "cfo_wiki_export_runs" USING btree ("company_id","started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "cfo_wiki_export_runs_company_running_key" ON "cfo_wiki_export_runs" USING btree ("company_id") WHERE "cfo_wiki_export_runs"."status" = 'running';--> statement-breakpoint
CREATE INDEX "cfo_wiki_lint_findings_company_run_idx" ON "cfo_wiki_lint_findings" USING btree ("company_id","lint_run_id");--> statement-breakpoint
CREATE INDEX "cfo_wiki_lint_findings_company_kind_idx" ON "cfo_wiki_lint_findings" USING btree ("company_id","finding_kind");--> statement-breakpoint
CREATE INDEX "cfo_wiki_lint_findings_company_page_key_idx" ON "cfo_wiki_lint_findings" USING btree ("company_id","page_key");--> statement-breakpoint
CREATE INDEX "cfo_wiki_lint_runs_company_started_idx" ON "cfo_wiki_lint_runs" USING btree ("company_id","started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "cfo_wiki_lint_runs_company_running_key" ON "cfo_wiki_lint_runs" USING btree ("company_id") WHERE "cfo_wiki_lint_runs"."status" = 'running';--> statement-breakpoint
ALTER TABLE "cfo_wiki_pages" ADD CONSTRAINT "cfo_wiki_pages_compile_run_id_cfo_wiki_compile_runs_id_fk" FOREIGN KEY ("compile_run_id") REFERENCES "public"."cfo_wiki_compile_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cfo_wiki_pages_company_ownership_idx" ON "cfo_wiki_pages" USING btree ("company_id","ownership_kind");