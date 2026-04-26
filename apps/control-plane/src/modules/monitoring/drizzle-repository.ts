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
    const [row] = await this.db
      .insert(monitorResults)
      .values({
        id: result.id,
        alertCard: result.alertCard,
        companyId: result.companyId,
        companyKey: result.companyKey,
        conditionDetails: result.conditions,
        limitations: result.limitations,
        monitorKind: result.monitorKind,
        proofBundlePosture: result.proofBundlePosture,
        resultJson: result,
        runKey: result.runKey,
        severity: result.severity,
        sourceFreshnessPosture: result.sourceFreshnessPosture,
        sourceLineageRefs: result.sourceLineageRefs,
        status: result.status,
        triggeredBy: result.triggeredBy,
      })
      .onConflictDoUpdate({
        target: [
          monitorResults.companyId,
          monitorResults.monitorKind,
          monitorResults.runKey,
        ],
        set: {
          alertCard: result.alertCard,
          companyKey: result.companyKey,
          conditionDetails: result.conditions,
          limitations: result.limitations,
          proofBundlePosture: result.proofBundlePosture,
          resultJson: result,
          severity: result.severity,
          sourceFreshnessPosture: result.sourceFreshnessPosture,
          sourceLineageRefs: result.sourceLineageRefs,
          status: result.status,
          triggeredBy: result.triggeredBy,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!row) {
      throw new Error("Monitor result upsert did not return a row");
    }

    return mapMonitorResultRow(row);
  }
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
