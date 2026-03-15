import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./shared";

export const githubWebhookOutcomeEnum = pgEnum("github_webhook_outcome", [
  "installation_state_updated",
  "installation_repositories_updated",
  "issue_envelope_recorded",
  "issue_comment_envelope_recorded",
  "ignored_event",
]);

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
    { onDelete: "set null" },
  ),
  installationId: text("installation_id").notNull(),
  githubRepositoryId: text("github_repository_id"),
  fullName: text("full_name").notNull(),
  ownerLogin: text("owner_login").notNull(),
  name: text("name").notNull(),
  defaultBranch: text("default_branch").notNull().default("main"),
  isPrivate: boolean("is_private"),
  archived: boolean("archived"),
  disabled: boolean("disabled"),
  isActive: boolean("is_active").notNull().default(true),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  removedFromInstallationAt: timestamp("removed_from_installation_at", {
    withTimezone: true,
  }),
  language: text("language"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => ({
  githubRepositoryIdUnique: uniqueIndex(
    "repositories_github_repository_id_key",
  ).on(table.githubRepositoryId),
}));

export const githubWebhookDeliveries = pgTable(
  "github_webhook_deliveries",
  {
    id: id(),
    deliveryId: text("delivery_id").notNull(),
    eventName: text("event_name").notNull(),
    action: text("action"),
    installationId: text("installation_id"),
    outcome: githubWebhookOutcomeEnum("outcome"),
    payload: jsonb("payload").notNull().default({}),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    deliveryIdUnique: uniqueIndex(
      "github_webhook_deliveries_delivery_id_key",
    ).on(table.deliveryId),
  }),
);
