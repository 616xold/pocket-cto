ALTER TYPE "public"."finance_twin_extractor_key" ADD VALUE 'card_expense_csv';--> statement-breakpoint
ALTER TYPE "public"."finance_twin_lineage_target_kind" ADD VALUE 'spend_row' BEFORE 'trial_balance_line';--> statement-breakpoint
CREATE TABLE "finance_spend_rows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"sync_run_id" uuid NOT NULL,
	"row_scope_key" text NOT NULL,
	"line_number" integer NOT NULL,
	"source_line_numbers" jsonb NOT NULL,
	"explicit_row_identity" text,
	"explicit_row_identity_source_field" text,
	"merchant_label" text,
	"vendor_label" text,
	"employee_label" text,
	"cardholder_label" text,
	"category_label" text,
	"memo" text,
	"description" text,
	"department" text,
	"card_label" text,
	"card_last4" text,
	"amount" numeric(18, 2),
	"posted_amount" numeric(18, 2),
	"transaction_amount" numeric(18, 2),
	"currency_code" text,
	"transaction_date" date,
	"posted_date" date,
	"expense_date" date,
	"report_date" date,
	"as_of_date" date,
	"status" text,
	"state" text,
	"reimbursable" boolean,
	"pending" boolean,
	"source_field_map" jsonb NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "finance_spend_rows" ADD CONSTRAINT "finance_spend_rows_company_id_finance_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."finance_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_spend_rows" ADD CONSTRAINT "finance_spend_rows_sync_run_id_finance_twin_sync_runs_id_fk" FOREIGN KEY ("sync_run_id") REFERENCES "public"."finance_twin_sync_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "finance_spend_rows_sync_run_row_scope_key" ON "finance_spend_rows" USING btree ("sync_run_id","row_scope_key");--> statement-breakpoint
CREATE INDEX "finance_spend_rows_company_sync_idx" ON "finance_spend_rows" USING btree ("company_id","sync_run_id");--> statement-breakpoint
CREATE INDEX "finance_spend_rows_posted_date_idx" ON "finance_spend_rows" USING btree ("company_id","posted_date");--> statement-breakpoint
CREATE INDEX "finance_spend_rows_transaction_date_idx" ON "finance_spend_rows" USING btree ("company_id","transaction_date");