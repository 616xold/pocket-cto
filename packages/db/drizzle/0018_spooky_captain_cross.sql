ALTER TYPE "public"."finance_twin_extractor_key" ADD VALUE IF NOT EXISTS 'chart_of_accounts_csv';--> statement-breakpoint
ALTER TYPE "public"."finance_twin_lineage_target_kind" ADD VALUE IF NOT EXISTS 'account_catalog_entry';--> statement-breakpoint
CREATE TABLE "finance_account_catalog_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"ledger_account_id" uuid NOT NULL,
	"sync_run_id" uuid NOT NULL,
	"line_number" integer NOT NULL,
	"detail_type" text,
	"description" text,
	"parent_account_code" text,
	"is_active" boolean,
	"observed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "finance_account_catalog_entries" ADD CONSTRAINT "finance_account_catalog_entries_company_id_finance_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."finance_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_account_catalog_entries" ADD CONSTRAINT "finance_account_catalog_entries_ledger_account_id_finance_ledger_accounts_id_fk" FOREIGN KEY ("ledger_account_id") REFERENCES "public"."finance_ledger_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_account_catalog_entries" ADD CONSTRAINT "finance_account_catalog_entries_sync_run_id_finance_twin_sync_runs_id_fk" FOREIGN KEY ("sync_run_id") REFERENCES "public"."finance_twin_sync_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "finance_account_catalog_entries_sync_run_ledger_account_key" ON "finance_account_catalog_entries" USING btree ("sync_run_id","ledger_account_id");--> statement-breakpoint
CREATE INDEX "finance_account_catalog_entries_company_sync_idx" ON "finance_account_catalog_entries" USING btree ("company_id","sync_run_id");
