CREATE TYPE "public"."cfo_wiki_compile_run_status" AS ENUM('running', 'succeeded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."cfo_wiki_compile_trigger_kind" AS ENUM('manual');--> statement-breakpoint
CREATE TYPE "public"."cfo_wiki_link_kind" AS ENUM('navigation', 'related');--> statement-breakpoint
CREATE TYPE "public"."cfo_wiki_page_kind" AS ENUM('index', 'log', 'company_overview', 'period_index', 'source_coverage');--> statement-breakpoint
CREATE TYPE "public"."cfo_wiki_page_ownership_kind" AS ENUM('compiler_owned');--> statement-breakpoint
CREATE TYPE "public"."cfo_wiki_page_temporal_status" AS ENUM('current', 'historical', 'superseded');--> statement-breakpoint
CREATE TYPE "public"."cfo_wiki_ref_kind" AS ENUM('twin_fact', 'source_excerpt', 'compiled_inference', 'ambiguous');--> statement-breakpoint
CREATE TYPE "public"."cfo_wiki_ref_target_kind" AS ENUM('company', 'reporting_period', 'source_snapshot', 'source_file', 'finance_slice');--> statement-breakpoint
CREATE TABLE "cfo_wiki_compile_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"status" "cfo_wiki_compile_run_status" NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"triggered_by" text DEFAULT 'operator' NOT NULL,
	"trigger_kind" "cfo_wiki_compile_trigger_kind" DEFAULT 'manual' NOT NULL,
	"compiler_version" text NOT NULL,
	"stats" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"error_summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cfo_wiki_page_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"compile_run_id" uuid NOT NULL,
	"from_page_id" uuid NOT NULL,
	"to_page_id" uuid NOT NULL,
	"link_kind" "cfo_wiki_link_kind" NOT NULL,
	"label" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cfo_wiki_page_refs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"compile_run_id" uuid NOT NULL,
	"page_id" uuid NOT NULL,
	"ref_kind" "cfo_wiki_ref_kind" NOT NULL,
	"target_kind" "cfo_wiki_ref_target_kind" NOT NULL,
	"target_id" text NOT NULL,
	"label" text NOT NULL,
	"locator" text,
	"excerpt" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cfo_wiki_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"compile_run_id" uuid NOT NULL,
	"page_key" text NOT NULL,
	"page_kind" "cfo_wiki_page_kind" NOT NULL,
	"ownership_kind" "cfo_wiki_page_ownership_kind" DEFAULT 'compiler_owned' NOT NULL,
	"temporal_status" "cfo_wiki_page_temporal_status" NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"markdown_body" text NOT NULL,
	"freshness_summary" jsonb NOT NULL,
	"limitations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"last_compiled_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cfo_wiki_compile_runs" ADD CONSTRAINT "cfo_wiki_compile_runs_company_id_finance_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."finance_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cfo_wiki_page_links" ADD CONSTRAINT "cfo_wiki_page_links_company_id_finance_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."finance_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cfo_wiki_page_links" ADD CONSTRAINT "cfo_wiki_page_links_compile_run_id_cfo_wiki_compile_runs_id_fk" FOREIGN KEY ("compile_run_id") REFERENCES "public"."cfo_wiki_compile_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cfo_wiki_page_links" ADD CONSTRAINT "cfo_wiki_page_links_from_page_id_cfo_wiki_pages_id_fk" FOREIGN KEY ("from_page_id") REFERENCES "public"."cfo_wiki_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cfo_wiki_page_links" ADD CONSTRAINT "cfo_wiki_page_links_to_page_id_cfo_wiki_pages_id_fk" FOREIGN KEY ("to_page_id") REFERENCES "public"."cfo_wiki_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cfo_wiki_page_refs" ADD CONSTRAINT "cfo_wiki_page_refs_company_id_finance_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."finance_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cfo_wiki_page_refs" ADD CONSTRAINT "cfo_wiki_page_refs_compile_run_id_cfo_wiki_compile_runs_id_fk" FOREIGN KEY ("compile_run_id") REFERENCES "public"."cfo_wiki_compile_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cfo_wiki_page_refs" ADD CONSTRAINT "cfo_wiki_page_refs_page_id_cfo_wiki_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."cfo_wiki_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cfo_wiki_pages" ADD CONSTRAINT "cfo_wiki_pages_company_id_finance_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."finance_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cfo_wiki_pages" ADD CONSTRAINT "cfo_wiki_pages_compile_run_id_cfo_wiki_compile_runs_id_fk" FOREIGN KEY ("compile_run_id") REFERENCES "public"."cfo_wiki_compile_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cfo_wiki_compile_runs_company_started_idx" ON "cfo_wiki_compile_runs" USING btree ("company_id","started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "cfo_wiki_compile_runs_company_running_key" ON "cfo_wiki_compile_runs" USING btree ("company_id") WHERE "cfo_wiki_compile_runs"."status" = 'running';--> statement-breakpoint
CREATE INDEX "cfo_wiki_page_links_company_from_page_idx" ON "cfo_wiki_page_links" USING btree ("company_id","from_page_id");--> statement-breakpoint
CREATE INDEX "cfo_wiki_page_links_company_to_page_idx" ON "cfo_wiki_page_links" USING btree ("company_id","to_page_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cfo_wiki_page_links_company_link_key" ON "cfo_wiki_page_links" USING btree ("company_id","from_page_id","to_page_id","link_kind","label");--> statement-breakpoint
CREATE INDEX "cfo_wiki_page_refs_company_page_idx" ON "cfo_wiki_page_refs" USING btree ("company_id","page_id");--> statement-breakpoint
CREATE INDEX "cfo_wiki_page_refs_target_lookup_idx" ON "cfo_wiki_page_refs" USING btree ("company_id","target_kind","target_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cfo_wiki_pages_company_page_key_key" ON "cfo_wiki_pages" USING btree ("company_id","page_key");--> statement-breakpoint
CREATE INDEX "cfo_wiki_pages_company_page_kind_idx" ON "cfo_wiki_pages" USING btree ("company_id","page_kind");--> statement-breakpoint
CREATE INDEX "cfo_wiki_pages_company_temporal_status_idx" ON "cfo_wiki_pages" USING btree ("company_id","temporal_status");