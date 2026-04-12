CREATE TYPE "public"."finance_bank_balance_type" AS ENUM('statement_or_ledger', 'available', 'unspecified');--> statement-breakpoint
ALTER TYPE "public"."finance_twin_extractor_key" ADD VALUE 'bank_account_summary_csv';--> statement-breakpoint
ALTER TYPE "public"."finance_twin_lineage_target_kind" ADD VALUE 'bank_account' BEFORE 'trial_balance_line';--> statement-breakpoint
ALTER TYPE "public"."finance_twin_lineage_target_kind" ADD VALUE 'bank_account_summary' BEFORE 'trial_balance_line';--> statement-breakpoint
CREATE TABLE "finance_bank_account_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"bank_account_id" uuid NOT NULL,
	"sync_run_id" uuid NOT NULL,
	"line_number" integer NOT NULL,
	"balance_type" "finance_bank_balance_type" NOT NULL,
	"balance_amount" numeric(18, 2) NOT NULL,
	"currency_code" text,
	"as_of_date" date,
	"as_of_date_source_column" text,
	"balance_source_column" text NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance_bank_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"identity_key" text NOT NULL,
	"account_label" text NOT NULL,
	"institution_name" text,
	"external_account_id" text,
	"account_number_last4" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "finance_bank_account_summaries" ADD CONSTRAINT "finance_bank_account_summaries_company_id_finance_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."finance_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_bank_account_summaries" ADD CONSTRAINT "finance_bank_account_summaries_bank_account_id_finance_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."finance_bank_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_bank_account_summaries" ADD CONSTRAINT "finance_bank_account_summaries_sync_run_id_finance_twin_sync_runs_id_fk" FOREIGN KEY ("sync_run_id") REFERENCES "public"."finance_twin_sync_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_bank_accounts" ADD CONSTRAINT "finance_bank_accounts_company_id_finance_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."finance_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "finance_bank_account_summaries_sync_run_account_balance_type_key" ON "finance_bank_account_summaries" USING btree ("sync_run_id","bank_account_id","balance_type");--> statement-breakpoint
CREATE INDEX "finance_bank_account_summaries_company_sync_idx" ON "finance_bank_account_summaries" USING btree ("company_id","sync_run_id");--> statement-breakpoint
CREATE INDEX "finance_bank_account_summaries_bank_account_id_idx" ON "finance_bank_account_summaries" USING btree ("bank_account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "finance_bank_accounts_company_identity_key_key" ON "finance_bank_accounts" USING btree ("company_id","identity_key");--> statement-breakpoint
CREATE INDEX "finance_bank_accounts_company_account_label_idx" ON "finance_bank_accounts" USING btree ("company_id","account_label");