CREATE TABLE "github_issue_mission_bindings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repo_full_name" text NOT NULL,
	"issue_number" integer NOT NULL,
	"issue_id" text NOT NULL,
	"issue_node_id" text,
	"mission_id" uuid,
	"latest_source_delivery_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "github_issue_mission_bindings" ADD CONSTRAINT "github_issue_mission_bindings_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "github_issue_mission_bindings_issue_id_key" ON "github_issue_mission_bindings" USING btree ("issue_id");--> statement-breakpoint
CREATE UNIQUE INDEX "github_issue_mission_bindings_repo_issue_key" ON "github_issue_mission_bindings" USING btree ("repo_full_name","issue_number");--> statement-breakpoint
CREATE UNIQUE INDEX "github_issue_mission_bindings_mission_id_key" ON "github_issue_mission_bindings" USING btree ("mission_id") WHERE "github_issue_mission_bindings"."mission_id" is not null;