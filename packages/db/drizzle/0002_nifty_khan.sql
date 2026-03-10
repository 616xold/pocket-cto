ALTER TYPE "public"."replay_event_type" ADD VALUE 'runtime.turn_completed' BEFORE 'runtime.item_started';--> statement-breakpoint
ALTER TABLE "mission_tasks" ADD COLUMN "codex_turn_id" text;--> statement-breakpoint
CREATE UNIQUE INDEX "mission_tasks_codex_turn_id_key" ON "mission_tasks" USING btree ("codex_turn_id") WHERE "mission_tasks"."codex_turn_id" is not null;