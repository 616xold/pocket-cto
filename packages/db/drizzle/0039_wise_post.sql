CREATE TYPE "public"."monitor_alert_severity" AS ENUM('none', 'info', 'warning', 'critical');--> statement-breakpoint
CREATE TYPE "public"."monitor_kind" AS ENUM('cash_posture');--> statement-breakpoint
CREATE TYPE "public"."monitor_result_status" AS ENUM('no_alert', 'alert');--> statement-breakpoint
CREATE TABLE "monitor_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"company_key" text NOT NULL,
	"monitor_kind" "monitor_kind" NOT NULL,
	"run_key" text NOT NULL,
	"triggered_by" text NOT NULL,
	"status" "monitor_result_status" NOT NULL,
	"severity" "monitor_alert_severity" NOT NULL,
	"condition_details" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source_freshness_posture" jsonb NOT NULL,
	"source_lineage_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"limitations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"proof_bundle_posture" jsonb NOT NULL,
	"alert_card" jsonb,
	"result_json" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "monitor_results" ADD CONSTRAINT "monitor_results_company_id_finance_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."finance_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "monitor_results_company_kind_run_key" ON "monitor_results" USING btree ("company_id","monitor_kind","run_key");--> statement-breakpoint
CREATE INDEX "monitor_results_company_kind_created_idx" ON "monitor_results" USING btree ("company_id","monitor_kind","created_at");--> statement-breakpoint
CREATE INDEX "monitor_results_company_key_kind_created_idx" ON "monitor_results" USING btree ("company_key","monitor_kind","created_at");
