import type {
  CfoWikiDocumentExtractStatus,
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
import {
  buildCfoWikiConceptPageKey,
  buildCfoWikiMetricDefinitionPageKey,
  buildCfoWikiPolicyPageKey,
  buildCfoWikiSourceDigestPageKey,
} from "@pocket-cto/domain";
import {
  buildConceptPageTitle,
  buildMetricDefinitionPageTitle,
  type WikiConceptDefinition,
  type WikiMetricDefinition,
  WIKI_CONCEPT_DEFINITIONS,
  WIKI_METRIC_DEFINITIONS,
} from "./knowledge-registry";
import type { WikiDocumentSourceState, WikiDocumentSnapshotState } from "./document-state";

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
  compiledDocumentSources: WikiDocumentSourceState[];
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
  conceptDefinition: WikiConceptDefinition | null;
  documentSource: WikiDocumentSourceState | null;
  documentSnapshot: WikiDocumentSnapshotState | null;
  metricDefinition: WikiMetricDefinition | null;
  pageKey: CfoWikiPageKey;
  pageKind: Exclude<CfoWikiPageKind, "filed_artifact">;
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
  compiledDocumentSources: WikiDocumentSourceState[],
): WikiRegistryEntry[] {
  const latestPeriodEnd =
    [...reportingPeriods]
      .sort((left, right) => right.periodEnd.localeCompare(left.periodEnd))[0]
      ?.periodEnd ?? null;
  const pages: WikiRegistryEntry[] = [
    {
      conceptDefinition: null,
      documentSource: null,
      pageKey: "index",
      documentSnapshot: null,
      metricDefinition: null,
      pageKind: "index",
      period: null,
      temporalStatus: "current",
      title: `${company.displayName} CFO Wiki Index`,
    },
    {
      conceptDefinition: null,
      documentSource: null,
      pageKey: "log",
      documentSnapshot: null,
      metricDefinition: null,
      pageKind: "log",
      period: null,
      temporalStatus: "current",
      title: `${company.displayName} CFO Wiki Compile Log`,
    },
    {
      conceptDefinition: null,
      documentSource: null,
      pageKey: "company/overview",
      documentSnapshot: null,
      metricDefinition: null,
      pageKind: "company_overview",
      period: null,
      temporalStatus: "current",
      title: `${company.displayName} Company Overview`,
    },
    {
      conceptDefinition: null,
      documentSource: null,
      pageKey: "sources/coverage",
      documentSnapshot: null,
      metricDefinition: null,
      pageKind: "source_coverage",
      period: null,
      temporalStatus: "current",
      title: `${company.displayName} Source Coverage`,
    },
    ...reportingPeriods.map((period) => ({
      conceptDefinition: null,
      documentSource: null,
      documentSnapshot: null,
      metricDefinition: null,
      pageKey: buildPeriodPageKey(period.periodKey),
      pageKind: "period_index" as const,
      period,
      temporalStatus:
        latestPeriodEnd !== null && period.periodEnd < latestPeriodEnd
          ? ("historical" as const)
          : ("current" as const),
      title: `${company.displayName} Period ${period.label}`,
    })),
    ...buildConceptRegistryEntries(company),
    ...buildMetricDefinitionRegistryEntries(company),
    ...buildPolicyRegistryEntries(compiledDocumentSources),
    ...buildSourceDigestRegistryEntries(compiledDocumentSources),
  ];

  return pages.sort((left, right) => left.pageKey.localeCompare(right.pageKey));
}

function buildSourceDigestRegistryEntries(
  compiledDocumentSources: WikiDocumentSourceState[],
) {
  return compiledDocumentSources.flatMap((documentSource) =>
    documentSource.snapshots.map((snapshotState) => ({
      conceptDefinition: null,
      documentSource,
      documentSnapshot: snapshotState,
      metricDefinition: null,
      pageKey: buildCfoWikiSourceDigestPageKey(
        documentSource.source.id,
        snapshotState.snapshot.version,
      ),
      pageKind: "source_digest" as const,
      period: null,
      temporalStatus: snapshotState.temporalStatus,
      title: buildSourceDigestTitle(documentSource, snapshotState),
    })),
  );
}

function buildConceptRegistryEntries(company: FinanceCompanyRecord) {
  return WIKI_CONCEPT_DEFINITIONS.map((definition) => ({
    conceptDefinition: definition,
    documentSource: null,
    documentSnapshot: null,
    metricDefinition: null,
    pageKey: buildCfoWikiConceptPageKey(definition.conceptKey),
    pageKind: "concept" as const,
    period: null,
    temporalStatus: "current" as const,
    title: buildConceptPageTitle(company.displayName, definition),
  }));
}

function buildMetricDefinitionRegistryEntries(company: FinanceCompanyRecord) {
  return WIKI_METRIC_DEFINITIONS.map((definition) => ({
    conceptDefinition: null,
    documentSource: null,
    documentSnapshot: null,
    metricDefinition: definition,
    pageKey: buildCfoWikiMetricDefinitionPageKey(definition.metricKey),
    pageKind: "metric_definition" as const,
    period: null,
    temporalStatus: "current" as const,
    title: buildMetricDefinitionPageTitle(company.displayName, definition),
  }));
}

function buildPolicyRegistryEntries(
  compiledDocumentSources: WikiDocumentSourceState[],
) {
  return compiledDocumentSources
    .filter((documentSource) => documentSource.binding.documentRole === "policy_document")
    .map((documentSource) => ({
      conceptDefinition: null,
      documentSource,
      documentSnapshot: documentSource.snapshots[0] ?? null,
      metricDefinition: null,
      pageKey: buildCfoWikiPolicyPageKey(documentSource.source.id),
      pageKind: "policy" as const,
      period: null,
      temporalStatus: "current" as const,
      title: buildPolicyTitle(documentSource),
    }));
}

function buildSourceDigestTitle(
  documentSource: WikiDocumentSourceState,
  snapshotState: WikiDocumentSnapshotState,
) {
  const extractTitle = snapshotState.extract.title;
  const baseTitle =
    extractTitle && extractTitle.length > 0
      ? extractTitle
      : documentSource.source.name;
  const statusSuffix = buildSourceDigestStatusSuffix(
    snapshotState.extract.extractStatus,
  );

  return `${baseTitle} Snapshot v${snapshotState.snapshot.version}${statusSuffix}`;
}

function buildPolicyTitle(documentSource: WikiDocumentSourceState) {
  const latestSnapshot = documentSource.snapshots[0];
  const baseTitle =
    latestSnapshot?.extract.title && latestSnapshot.extract.title.length > 0
      ? latestSnapshot.extract.title
      : documentSource.source.name;

  return `Policy: ${baseTitle}`;
}

function buildSourceDigestStatusSuffix(
  extractStatus: CfoWikiDocumentExtractStatus,
) {
  if (extractStatus === "extracted") {
    return "";
  }

  return extractStatus === "unsupported" ? " (Unsupported)" : " (Failed)";
}
