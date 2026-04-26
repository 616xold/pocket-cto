import { and, desc, eq } from "drizzle-orm";
import { monitorResults, type Db } from "@pocket-cto/db";
import type { MonitorKind, MonitorResult } from "@pocket-cto/domain";
import { MonitorResultSchema } from "@pocket-cto/domain";
import type { MonitoringRepository } from "./repository";

export class DrizzleMonitoringRepository implements MonitoringRepository {
  constructor(private readonly db: Db) {}

  async getLatestMonitorResult(input: {
    companyKey: string;
    monitorKind: MonitorKind;
  }) {
    const [row] = await this.db
      .select()
      .from(monitorResults)
      .where(
        and(
          eq(monitorResults.companyKey, input.companyKey),
          eq(monitorResults.monitorKind, input.monitorKind),
        ),
      )
      .orderBy(desc(monitorResults.createdAt), desc(monitorResults.id))
      .limit(1);

    return row ? mapMonitorResultRow(row) : null;
  }

  async upsertMonitorResult(result: MonitorResult) {
    const existing = await this.getMonitorResultByScope(result);

    if (existing) {
      return this.updateExistingMonitorResult(result, existing);
    }

    const stored = canonicalizeMonitorResultForScope(result, null);
    const [row] = await this.db
      .insert(monitorResults)
      .values({
        id: stored.id,
        alertCard: stored.alertCard,
        companyId: stored.companyId,
        companyKey: stored.companyKey,
        conditionDetails: stored.conditions,
        createdAt: new Date(stored.createdAt),
        limitations: stored.limitations,
        monitorKind: stored.monitorKind,
        proofBundlePosture: stored.proofBundlePosture,
        resultJson: stored,
        runKey: stored.runKey,
        severity: stored.severity,
        sourceFreshnessPosture: stored.sourceFreshnessPosture,
        sourceLineageRefs: stored.sourceLineageRefs,
        status: stored.status,
        triggeredBy: stored.triggeredBy,
        updatedAt: new Date(),
      })
      .onConflictDoNothing({
        target: [
          monitorResults.companyId,
          monitorResults.monitorKind,
          monitorResults.runKey,
        ],
      })
      .returning();

    if (row) {
      return mapMonitorResultRow(row);
    }

    const conflicted = await this.getMonitorResultByScope(result);
    if (!conflicted) {
      throw new Error("Monitor result upsert conflict did not return a row");
    }

    return this.updateExistingMonitorResult(result, conflicted);
  }

  private async getMonitorResultByScope(result: MonitorResult) {
    const [row] = await this.db
      .select()
      .from(monitorResults)
      .where(
        and(
          eq(monitorResults.companyId, result.companyId),
          eq(monitorResults.monitorKind, result.monitorKind),
          eq(monitorResults.runKey, result.runKey),
        ),
      )
      .limit(1);

    return row ? mapMonitorResultRow(row) : null;
  }

  private async updateExistingMonitorResult(
    result: MonitorResult,
    existing: MonitorResult,
  ) {
    const stored = canonicalizeMonitorResultForScope(result, existing);
    const [row] = await this.db
      .update(monitorResults)
      .set({
        alertCard: stored.alertCard,
        companyKey: stored.companyKey,
        conditionDetails: stored.conditions,
        limitations: stored.limitations,
        proofBundlePosture: stored.proofBundlePosture,
        resultJson: stored,
        severity: stored.severity,
        sourceFreshnessPosture: stored.sourceFreshnessPosture,
        sourceLineageRefs: stored.sourceLineageRefs,
        status: stored.status,
        triggeredBy: stored.triggeredBy,
        updatedAt: new Date(),
      })
      .where(eq(monitorResults.id, existing.id))
      .returning();

    if (!row) {
      throw new Error("Monitor result update did not return a row");
    }

    return mapMonitorResultRow(row);
  }
}

function canonicalizeMonitorResultForScope(
  result: MonitorResult,
  existing: MonitorResult | null,
) {
  const createdAt = existing?.createdAt ?? result.createdAt;

  return MonitorResultSchema.parse({
    ...result,
    alertCard: result.alertCard
      ? {
          ...result.alertCard,
          createdAt,
        }
      : null,
    createdAt,
    id: existing?.id ?? result.id,
  });
}

function mapMonitorResultRow(row: typeof monitorResults.$inferSelect) {
  return MonitorResultSchema.parse({
    ...asRecord(row.resultJson),
    alertCard: row.alertCard,
    companyId: row.companyId,
    companyKey: row.companyKey,
    conditions: row.conditionDetails,
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    limitations: row.limitations,
    monitorKind: row.monitorKind,
    proofBundlePosture: row.proofBundlePosture,
    runKey: row.runKey,
    severity: row.severity,
    sourceFreshnessPosture: row.sourceFreshnessPosture,
    sourceLineageRefs: row.sourceLineageRefs,
    status: row.status,
    triggeredBy: row.triggeredBy,
  });
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
