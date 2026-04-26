import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { financeCompanies } from "./finance-twin";
import { createdAt, id, updatedAt } from "./shared";

export const monitorKindEnum = pgEnum("monitor_kind", ["cash_posture"]);

export const monitorResultStatusEnum = pgEnum("monitor_result_status", [
  "no_alert",
  "alert",
]);

export const monitorAlertSeverityEnum = pgEnum("monitor_alert_severity", [
  "none",
  "info",
  "warning",
  "critical",
]);

export const monitorResults = pgTable(
  "monitor_results",
  {
    id: id(),
    companyId: uuid("company_id")
      .references(() => financeCompanies.id, { onDelete: "cascade" })
      .notNull(),
    companyKey: text("company_key").notNull(),
    monitorKind: monitorKindEnum("monitor_kind").notNull(),
    runKey: text("run_key").notNull(),
    triggeredBy: text("triggered_by").notNull(),
    status: monitorResultStatusEnum("status").notNull(),
    severity: monitorAlertSeverityEnum("severity").notNull(),
    conditionDetails: jsonb("condition_details")
      .$type<Record<string, unknown>[]>()
      .notNull()
      .default([]),
    sourceFreshnessPosture: jsonb("source_freshness_posture")
      .$type<Record<string, unknown>>()
      .notNull(),
    sourceLineageRefs: jsonb("source_lineage_refs")
      .$type<Record<string, unknown>[]>()
      .notNull()
      .default([]),
    limitations: jsonb("limitations").$type<string[]>().notNull().default([]),
    proofBundlePosture: jsonb("proof_bundle_posture")
      .$type<Record<string, unknown>>()
      .notNull(),
    alertCard: jsonb("alert_card").$type<Record<string, unknown> | null>(),
    resultJson: jsonb("result_json")
      .$type<Record<string, unknown>>()
      .notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    companyKindRunUnique: uniqueIndex(
      "monitor_results_company_kind_run_key",
    ).on(table.companyId, table.monitorKind, table.runKey),
    companyKindCreatedIndex: index("monitor_results_company_kind_created_idx").on(
      table.companyId,
      table.monitorKind,
      table.createdAt,
    ),
    companyKeyKindCreatedIndex: index(
      "monitor_results_company_key_kind_created_idx",
    ).on(table.companyKey, table.monitorKind, table.createdAt),
  }),
);
