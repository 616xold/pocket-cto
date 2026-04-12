import { describe, expect, it } from "vitest";
import {
  financeAccountCatalogEntries,
  financeBankAccounts,
  financeBankAccountSummaries,
  financeCompanies,
  financeContractObligations,
  financeContracts,
  financeCustomers,
  financeGeneralLedgerBalanceProofs,
  financeJournalEntries,
  financeJournalLines,
  financeLedgerAccounts,
  financePayablesAgingRows,
  financeReceivablesAgingRows,
  financeReportingPeriods,
  financeTrialBalanceLines,
  financeTwinLineage,
  financeTwinSyncRuns,
  financeVendors,
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
    expect(financeBankAccounts).toBeDefined();
    expect(financeBankAccountSummaries).toBeDefined();
    expect(financeCompanies).toBeDefined();
    expect(financeContractObligations).toBeDefined();
    expect(financeContracts).toBeDefined();
    expect(financeCustomers).toBeDefined();
    expect(financeReportingPeriods).toBeDefined();
    expect(financeLedgerAccounts).toBeDefined();
    expect(financeVendors).toBeDefined();
    expect(financePayablesAgingRows).toBeDefined();
    expect(financeReceivablesAgingRows).toBeDefined();
    expect(financeGeneralLedgerBalanceProofs).toBeDefined();
    expect(financeJournalEntries).toBeDefined();
    expect(financeJournalLines).toBeDefined();
    expect(financeTwinSyncRuns).toBeDefined();
    expect(financeTrialBalanceLines).toBeDefined();
    expect(financeTwinLineage).toBeDefined();
  });
});
