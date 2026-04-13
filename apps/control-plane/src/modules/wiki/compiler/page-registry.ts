import type {
  CfoWikiPageKind,
  CfoWikiPageKey,
  CfoWikiPageTemporalStatus,
  FinanceCompanyRecord,
  FinanceCompanyTotals,
  FinanceFreshnessSummary,
  FinanceReportingPeriodRecord,
  FinanceTwinExtractorKey,
  FinanceTwinSyncRunRecord,
  SourceFileRecord,
  SourceRecord,
  SourceSnapshotRecord,
} from "@pocket-cto/domain";

export type WikiSliceDescriptor = {
  extractorKey: FinanceTwinExtractorKey;
  label: string;
  pageLabel: string;
  sliceKey: string;
};

export type WikiSliceState = {
  descriptor: WikiSliceDescriptor;
  freshness: FinanceFreshnessSummary;
  latestAttemptedRun: FinanceTwinSyncRunRecord | null;
  latestAttemptedSource: {
    source: SourceRecord;
    snapshot: SourceSnapshotRecord;
    sourceFile: SourceFileRecord;
  } | null;
  latestSuccessfulRun: FinanceTwinSyncRunRecord | null;
  latestSuccessfulSource: {
    source: SourceRecord;
    snapshot: SourceSnapshotRecord;
    sourceFile: SourceFileRecord;
  } | null;
  reportingPeriod: FinanceReportingPeriodRecord | null;
};

export type WikiCompileState = {
  company: FinanceCompanyRecord;
  companyTotals: FinanceCompanyTotals;
  derivedSourceCoverageLimitation: string;
  generalLimitations: string[];
  overallFreshnessSummary: {
    state: "fresh" | "stale" | "missing" | "mixed" | "failed";
    summary: string;
  };
  priorCompletedRuns: Array<{
    completedAt: string | null;
    errorSummary: string | null;
    id: string;
    startedAt: string;
    stats: Record<string, unknown>;
    status: "running" | "succeeded" | "failed";
    triggeredBy: string;
  }>;
  reportingPeriods: FinanceReportingPeriodRecord[];
  slices: WikiSliceState[];
};

export type WikiRegistryEntry = {
  pageKey: CfoWikiPageKey;
  pageKind: CfoWikiPageKind;
  period: FinanceReportingPeriodRecord | null;
  temporalStatus: CfoWikiPageTemporalStatus;
  title: string;
};

export const WIKI_SLICE_DESCRIPTORS: WikiSliceDescriptor[] = [
  {
    sliceKey: "trial_balance",
    extractorKey: "trial_balance_csv",
    label: "Trial balance CSV",
    pageLabel: "trial balance",
  },
  {
    sliceKey: "chart_of_accounts",
    extractorKey: "chart_of_accounts_csv",
    label: "Chart of accounts CSV",
    pageLabel: "chart of accounts",
  },
  {
    sliceKey: "general_ledger",
    extractorKey: "general_ledger_csv",
    label: "General ledger CSV",
    pageLabel: "general ledger",
  },
  {
    sliceKey: "bank_account_summary",
    extractorKey: "bank_account_summary_csv",
    label: "Bank account summary CSV",
    pageLabel: "bank account summary",
  },
  {
    sliceKey: "receivables_aging",
    extractorKey: "receivables_aging_csv",
    label: "Receivables aging CSV",
    pageLabel: "receivables aging",
  },
  {
    sliceKey: "payables_aging",
    extractorKey: "payables_aging_csv",
    label: "Payables aging CSV",
    pageLabel: "payables aging",
  },
  {
    sliceKey: "contract_metadata",
    extractorKey: "contract_metadata_csv",
    label: "Contract metadata CSV",
    pageLabel: "contract metadata",
  },
  {
    sliceKey: "card_expense",
    extractorKey: "card_expense_csv",
    label: "Card expense CSV",
    pageLabel: "card expense",
  },
] as const;

export function buildPeriodPageKey(periodKey: string): CfoWikiPageKey {
  return `periods/${periodKey}/index`;
}

export function buildWikiPageRegistry(
  company: FinanceCompanyRecord,
  reportingPeriods: FinanceReportingPeriodRecord[],
): WikiRegistryEntry[] {
  const latestPeriodEnd =
    [...reportingPeriods]
      .sort((left, right) => right.periodEnd.localeCompare(left.periodEnd))[0]
      ?.periodEnd ?? null;
  const pages: WikiRegistryEntry[] = [
    {
      pageKey: "index",
      pageKind: "index",
      period: null,
      temporalStatus: "current",
      title: `${company.displayName} CFO Wiki Index`,
    },
    {
      pageKey: "log",
      pageKind: "log",
      period: null,
      temporalStatus: "current",
      title: `${company.displayName} CFO Wiki Compile Log`,
    },
    {
      pageKey: "company/overview",
      pageKind: "company_overview",
      period: null,
      temporalStatus: "current",
      title: `${company.displayName} Company Overview`,
    },
    {
      pageKey: "sources/coverage",
      pageKind: "source_coverage",
      period: null,
      temporalStatus: "current",
      title: `${company.displayName} Source Coverage`,
    },
    ...reportingPeriods.map((period) => ({
      pageKey: buildPeriodPageKey(period.periodKey),
      pageKind: "period_index" as const,
      period,
      temporalStatus:
        latestPeriodEnd !== null && period.periodEnd < latestPeriodEnd
          ? ("historical" as const)
          : ("current" as const),
      title: `${company.displayName} Period ${period.label}`,
    })),
  ];

  return pages.sort((left, right) => left.pageKey.localeCompare(right.pageKey));
}
