DROP INDEX "repositories_github_repository_id_key";--> statement-breakpoint
CREATE UNIQUE INDEX "repositories_github_repository_id_key" ON "repositories" USING btree ("github_repository_id");