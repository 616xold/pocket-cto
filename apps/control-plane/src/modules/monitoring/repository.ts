import type { MonitorKind, MonitorResult } from "@pocket-cto/domain";
import { MonitorResultSchema } from "@pocket-cto/domain";

export interface MonitoringRepository {
  getLatestMonitorResult(input: {
    companyKey: string;
    monitorKind: MonitorKind;
  }): Promise<MonitorResult | null>;

  upsertMonitorResult(result: MonitorResult): Promise<MonitorResult>;
}

export class InMemoryMonitoringRepository implements MonitoringRepository {
  private readonly results = new Map<string, MonitorResult>();

  async getLatestMonitorResult(input: {
    companyKey: string;
    monitorKind: MonitorKind;
  }) {
    const results = [...this.results.values()]
      .filter(
        (result) =>
          result.companyKey === input.companyKey &&
          result.monitorKind === input.monitorKind,
      )
      .sort((left, right) => {
        const createdCompare = right.createdAt.localeCompare(left.createdAt);
        return createdCompare === 0 ? right.id.localeCompare(left.id) : createdCompare;
      });

    return results[0] ?? null;
  }

  async upsertMonitorResult(result: MonitorResult) {
    const key = buildScopeKey(result);
    const existing = this.results.get(key);
    const stored = MonitorResultSchema.parse({
      ...result,
      id: existing?.id ?? result.id,
      createdAt: existing?.createdAt ?? result.createdAt,
      alertCard:
        result.alertCard && existing
          ? {
              ...result.alertCard,
              createdAt: existing.createdAt,
            }
          : result.alertCard,
    });

    this.results.set(key, stored);
    return stored;
  }
}

function buildScopeKey(result: MonitorResult) {
  return `${result.companyId}::${result.monitorKind}::${result.runKey}`;
}
