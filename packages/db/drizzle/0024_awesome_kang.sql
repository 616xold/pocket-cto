CREATE TYPE "public"."finance_contract_obligation_type" AS ENUM('renewal', 'expiration', 'end_date', 'notice_deadline', 'scheduled_payment');--> statement-breakpoint
ALTER TYPE "public"."finance_twin_extractor_key" ADD VALUE 'contract_metadata_csv';--> statement-breakpoint
ALTER TYPE "public"."finance_twin_lineage_target_kind" ADD VALUE 'contract' BEFORE 'trial_balance_line';--> statement-breakpoint
ALTER TYPE "public"."finance_twin_lineage_target_kind" ADD VALUE 'contract_obligation' BEFORE 'trial_balance_line';--> statement-breakpoint
CREATE TABLE "finance_contract_obligations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"contract_id" uuid NOT NULL,
	"sync_run_id" uuid NOT NULL,
	"obligation_scope_key" text NOT NULL,
	"line_number" integer NOT NULL,
	"source_line_numbers" jsonb NOT NULL,
	"obligation_type" "finance_contract_obligation_type" NOT NULL,
	"due_date" date NOT NULL,
	"amount" numeric(18, 2),
	"currency_code" text,
	"source_field" text NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"sync_run_id" uuid NOT NULL,
	"contract_identity_key" text NOT NULL,
	"line_number" integer NOT NULL,
	"source_line_numbers" jsonb NOT NULL,
	"contract_label" text NOT NULL,
	"external_contract_id" text,
	"counterparty_label" text,
	"contract_type" text,
	"agreement_type" text,
	"status" text,
	"start_date" date,
	"effective_date" date,
	"end_date" date,
	"expiration_date" date,
	"renewal_date" date,
	"notice_deadline" date,
	"next_payment_date" date,
	"known_as_of_dates" jsonb NOT NULL,
	"unknown_as_of_observation_count" integer DEFAULT 0 NOT NULL,
	"amount" numeric(18, 2),
	"payment_amount" numeric(18, 2),
	"currency_code" text,
	"auto_renew" boolean,
	"source_field_map" jsonb NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "finance_contract_obligations" ADD CONSTRAINT "finance_contract_obligations_company_id_finance_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."finance_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_contract_obligations" ADD CONSTRAINT "finance_contract_obligations_contract_id_finance_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."finance_contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_contract_obligations" ADD CONSTRAINT "finance_contract_obligations_sync_run_id_finance_twin_sync_runs_id_fk" FOREIGN KEY ("sync_run_id") REFERENCES "public"."finance_twin_sync_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_contracts" ADD CONSTRAINT "finance_contracts_company_id_finance_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."finance_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_contracts" ADD CONSTRAINT "finance_contracts_sync_run_id_finance_twin_sync_runs_id_fk" FOREIGN KEY ("sync_run_id") REFERENCES "public"."finance_twin_sync_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "finance_contract_obligations_sync_run_contract_scope_key" ON "finance_contract_obligations" USING btree ("sync_run_id","contract_id","obligation_scope_key");--> statement-breakpoint
CREATE INDEX "finance_contract_obligations_company_sync_idx" ON "finance_contract_obligations" USING btree ("company_id","sync_run_id");--> statement-breakpoint
CREATE INDEX "finance_contract_obligations_contract_due_date_idx" ON "finance_contract_obligations" USING btree ("contract_id","due_date");--> statement-breakpoint
CREATE UNIQUE INDEX "finance_contracts_sync_run_contract_identity_key" ON "finance_contracts" USING btree ("sync_run_id","contract_identity_key");--> statement-breakpoint
CREATE INDEX "finance_contracts_company_sync_idx" ON "finance_contracts" USING btree ("company_id","sync_run_id");--> statement-breakpoint
CREATE INDEX "finance_contracts_contract_label_idx" ON "finance_contracts" USING btree ("company_id","contract_label");