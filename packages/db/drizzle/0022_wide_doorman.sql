ALTER TYPE "public"."finance_twin_extractor_key" ADD VALUE 'receivables_aging_csv';--> statement-breakpoint
ALTER TYPE "public"."finance_twin_lineage_target_kind" ADD VALUE 'customer' BEFORE 'trial_balance_line';--> statement-breakpoint
ALTER TYPE "public"."finance_twin_lineage_target_kind" ADD VALUE 'receivables_aging_row' BEFORE 'trial_balance_line';--> statement-breakpoint
CREATE TABLE "finance_customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"identity_key" text NOT NULL,
	"customer_label" text NOT NULL,
	"external_customer_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance_receivables_aging_rows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"sync_run_id" uuid NOT NULL,
	"row_scope_key" text NOT NULL,
	"line_number" integer NOT NULL,
	"source_line_numbers" jsonb NOT NULL,
	"currency_code" text,
	"as_of_date" date,
	"as_of_date_source_column" text,
	"bucket_values" jsonb NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "finance_customers" ADD CONSTRAINT "finance_customers_company_id_finance_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."finance_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_receivables_aging_rows" ADD CONSTRAINT "finance_receivables_aging_rows_company_id_finance_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."finance_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_receivables_aging_rows" ADD CONSTRAINT "finance_receivables_aging_rows_customer_id_finance_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."finance_customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_receivables_aging_rows" ADD CONSTRAINT "finance_receivables_aging_rows_sync_run_id_finance_twin_sync_runs_id_fk" FOREIGN KEY ("sync_run_id") REFERENCES "public"."finance_twin_sync_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "finance_customers_company_identity_key_key" ON "finance_customers" USING btree ("company_id","identity_key");--> statement-breakpoint
CREATE INDEX "finance_customers_company_customer_label_idx" ON "finance_customers" USING btree ("company_id","customer_label");--> statement-breakpoint
CREATE UNIQUE INDEX "finance_receivables_aging_rows_sync_run_customer_scope_key" ON "finance_receivables_aging_rows" USING btree ("sync_run_id","customer_id","row_scope_key");--> statement-breakpoint
CREATE INDEX "finance_receivables_aging_rows_company_sync_idx" ON "finance_receivables_aging_rows" USING btree ("company_id","sync_run_id");--> statement-breakpoint
CREATE INDEX "finance_receivables_aging_rows_customer_id_idx" ON "finance_receivables_aging_rows" USING btree ("customer_id");