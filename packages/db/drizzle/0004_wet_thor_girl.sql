CREATE UNIQUE INDEX "mission_tasks_workspace_id_key" ON "mission_tasks" USING btree ("workspace_id") WHERE "mission_tasks"."workspace_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "workspaces_task_id_key" ON "workspaces" USING btree ("task_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workspaces_root_path_key" ON "workspaces" USING btree ("root_path");--> statement-breakpoint
CREATE UNIQUE INDEX "workspaces_branch_name_key" ON "workspaces" USING btree ("branch_name") WHERE "workspaces"."branch_name" is not null;