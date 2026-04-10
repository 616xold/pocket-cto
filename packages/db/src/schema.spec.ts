import { describe, expect, it } from "vitest";
import {
  financeAccountCatalogEntries,
  financeCompanies,
  financeLedgerAccounts,
  financeReportingPeriods,
  financeTrialBalanceLines,
  financeTwinLineage,
  financeTwinSyncRuns,
  missionTasks,
  missions,
  provenanceRecords,
  sourceFiles,
  sourceIngestRuns,
  sourceSnapshots,
  sources,
} from "./schema";

describe("db schema exports", () => {
  it("exposes core tables", () => {
    expect(missions).toBeDefined();
    expect(missionTasks).toBeDefined();
    expect(sources).toBeDefined();
    expect(sourceSnapshots).toBeDefined();
    expect(sourceFiles).toBeDefined();
    expect(provenanceRecords).toBeDefined();
    expect(sourceIngestRuns).toBeDefined();
    expect(financeAccountCatalogEntries).toBeDefined();
    expect(financeCompanies).toBeDefined();
    expect(financeReportingPeriods).toBeDefined();
    expect(financeLedgerAccounts).toBeDefined();
    expect(financeTwinSyncRuns).toBeDefined();
    expect(financeTrialBalanceLines).toBeDefined();
    expect(financeTwinLineage).toBeDefined();
  });
});
