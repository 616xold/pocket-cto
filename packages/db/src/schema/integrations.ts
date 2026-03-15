import { jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./shared";

export const githubInstallations = pgTable(
  "github_installations",
  {
    id: id(),
    installationId: text("installation_id").notNull(),
    appId: text("app_id"),
    accountLogin: text("account_login").notNull(),
    accountType: text("account_type").notNull(),
    targetType: text("target_type"),
    targetId: text("target_id"),
    suspendedAt: timestamp("suspended_at", { withTimezone: true }),
    permissions: jsonb("permissions").notNull().default({}),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    installationIdUnique: uniqueIndex(
      "github_installations_installation_id_key",
    ).on(table.installationId),
  }),
);

export const repositories = pgTable("repositories", {
  id: id(),
  installationRefId: uuid("installation_ref_id").references(
    () => githubInstallations.id,
    { onDelete: "cascade" },
  ),
  fullName: text("full_name").notNull(),
  defaultBranch: text("default_branch").notNull().default("main"),
  language: text("language"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});
