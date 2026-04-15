import { describe, expect, it } from "vitest";
import {
  CfoWikiPageViewSchema,
  FinanceBankAccountInventoryViewSchema,
  FinanceCashPostureViewSchema,
  type FinanceBankAccountInventoryView,
  type FinanceCashPostureView,
  type FinanceCollectionsPostureView,
  type FinanceContractsView,
  type FinanceObligationCalendarView,
  type FinancePayablesAgingView,
  type FinancePayablesPostureView,
  type FinanceReceivablesAgingView,
  type FinanceSpendItemsView,
  type FinanceSpendPostureView,
} from "@pocket-cto/domain";
import { FinanceCompanyNotFoundError } from "../finance-twin/errors";
import { CfoWikiPageNotFoundError } from "../wiki/errors";
import { FinanceDiscoveryService } from "./service";

type TestWikiPageKey =
  | "company/overview"
  | "concepts/contract-obligations"
  | "concepts/cash"
  | "concepts/payables"
  | "concepts/receivables"
  | "concepts/spend"
  | "metrics/collections-posture"
  | "metrics/obligation-calendar"
  | "metrics/cash-posture"
  | "metrics/payables-aging"
  | "metrics/payables-posture"
  | "metrics/receivables-aging"
  | "metrics/spend-posture";

const SUPPORTED_FAMILY_CASES = [
  {
    questionKind: "cash_posture" as const,
    expectedPageKeys: ["metrics/cash-posture", "concepts/cash", "company/overview"],
    expectedRoutePaths: [
      "/finance-twin/companies/acme/cash-posture",
      "/finance-twin/companies/acme/bank-accounts",
    ],
    summaryText: "Stored cash posture",
  },
  {
    questionKind: "collections_pressure" as const,
    expectedPageKeys: [
      "metrics/collections-posture",
      "metrics/receivables-aging",
      "concepts/receivables",
      "company/overview",
    ],
    expectedRoutePaths: [
      "/finance-twin/companies/acme/collections-posture",
      "/finance-twin/companies/acme/receivables-aging",
    ],
    summaryText: "Stored collections pressure",
  },
  {
    questionKind: "payables_pressure" as const,
    expectedPageKeys: [
      "metrics/payables-posture",
      "metrics/payables-aging",
      "concepts/payables",
      "company/overview",
    ],
    expectedRoutePaths: [
      "/finance-twin/companies/acme/payables-posture",
      "/finance-twin/companies/acme/payables-aging",
    ],
    summaryText: "Stored payables pressure",
  },
  {
    questionKind: "spend_posture" as const,
    expectedPageKeys: ["metrics/spend-posture", "concepts/spend", "company/overview"],
    expectedRoutePaths: [
      "/finance-twin/companies/acme/spend-posture",
      "/finance-twin/companies/acme/spend-items",
    ],
    summaryText: "Stored spend posture",
  },
  {
    questionKind: "obligation_calendar_review" as const,
    expectedPageKeys: [
      "metrics/obligation-calendar",
      "concepts/contract-obligations",
      "company/overview",
    ],
    expectedRoutePaths: [
      "/finance-twin/companies/acme/obligation-calendar",
      "/finance-twin/companies/acme/contracts",
    ],
    summaryText: "Stored obligation calendar review",
  },
] as const;

describe("FinanceDiscoveryService", () => {
  it("builds a deterministic cash-posture answer from stored finance and wiki state", async () => {
    const service = new FinanceDiscoveryService({
      cfoWikiService: {
        async getPage(companyKey, pageKey) {
          return buildWikiPage({
            companyKey,
            pageKey: pageKey as TestWikiPageKey,
            title:
              pageKey === "metrics/cash-posture"
                ? "Cash posture"
                : pageKey === "concepts/cash"
                  ? "Cash"
                  : "Company overview",
          });
        },
      },
      financeTwinService: createFinanceTwinService(),
    });

    const answer = await service.answerQuestion({
      companyKey: "acme",
      questionKind: "cash_posture",
      operatorPrompt: "What is our current cash posture?",
    });

    expect(answer.answerSummary).toContain("Stored cash posture for acme covers 4 bank accounts");
    expect(answer.freshnessPosture).toEqual({
      state: "fresh",
      reasonSummary: "Stored bank-account summary state is fresh.",
    });
    expect(answer.relatedRoutes.map((route) => route.routePath)).toEqual([
      "/finance-twin/companies/acme/cash-posture",
      "/finance-twin/companies/acme/bank-accounts",
    ]);
    expect(answer.relatedWikiPages.map((page) => page.pageKey)).toEqual([
      "metrics/cash-posture",
      "concepts/cash",
      "company/overview",
    ]);
    expect(answer.evidenceSections.map((section) => section.key)).toEqual([
      "cash_posture_route",
      "bank_account_inventory_route",
      "wiki_metrics_cash-posture",
      "wiki_concepts_cash",
      "wiki_company_overview",
    ]);
    expect(answer.bodyMarkdown).toContain("## Freshness posture");
    expect(answer.bodyMarkdown).toContain("## Evidence sections");
  });

  it("persists a truthful limited answer when the stored cash posture is stale and partial", async () => {
    const service = new FinanceDiscoveryService({
      cfoWikiService: {
        async getPage(companyKey, pageKey) {
          return buildWikiPage({
            companyKey,
            pageKey: pageKey as TestWikiPageKey,
            title: "Cash posture",
          });
        },
      },
      financeTwinService: createFinanceTwinService({
        async getBankAccounts() {
          return buildBankAccountsView({
            accountCount: 0,
            accounts: [],
            limitations: ["No successful bank-account-summary slice exists yet for this company."],
          });
        },
        async getCashPosture() {
          return buildCashPostureView({
            currencyBuckets: [],
            freshness: {
              state: "stale",
              reasonSummary:
                "The latest bank-account summary sync is older than the freshness threshold.",
            },
            coverageSummary: {
              bankAccountCount: 0,
              reportedBalanceCount: 0,
              statementOrLedgerBalanceCount: 0,
              availableBalanceCount: 0,
              unspecifiedBalanceCount: 0,
              datedBalanceCount: 0,
              undatedBalanceCount: 0,
              currencyBucketCount: 0,
              mixedAsOfDateCurrencyBucketCount: 0,
            },
            limitations: [
              "No successful bank-account-summary slice exists yet for this company.",
            ],
          });
        },
      }),
    });

    const answer = await service.answerQuestion({
      companyKey: "acme",
      questionKind: "cash_posture",
    });

    expect(answer.freshnessPosture.state).toBe("stale");
    expect(answer.answerSummary).toContain("is limited");
    expect(answer.limitations).toContain(
      "No persisted bank-account summary rows are available yet for acme.",
    );
  });

  it("keeps missing related wiki pages visible without failing the answer", async () => {
    const service = new FinanceDiscoveryService({
      cfoWikiService: {
        async getPage(companyKey, pageKey) {
          if (pageKey === "company/overview") {
            throw new CfoWikiPageNotFoundError(companyKey, pageKey);
          }

          return buildWikiPage({
            companyKey,
            pageKey: pageKey as TestWikiPageKey,
            title: pageKey === "metrics/cash-posture" ? "Cash posture" : "Cash",
          });
        },
      },
      financeTwinService: createFinanceTwinService(),
    });

    const answer = await service.answerQuestion({
      companyKey: "acme",
      questionKind: "cash_posture",
    });

    expect(answer.relatedWikiPages.map((page) => page.pageKey)).toEqual([
      "metrics/cash-posture",
      "concepts/cash",
    ]);
    expect(answer.limitations).toContain(
      "CFO Wiki page company/overview is not available yet for acme.",
    );
  });

  it.each(SUPPORTED_FAMILY_CASES)(
    "keeps missing finance twin state visible for $questionKind",
    async ({ questionKind }) => {
      const service = new FinanceDiscoveryService({
        cfoWikiService: {
          async getPage(companyKey, pageKey) {
            return buildWikiPage({
              companyKey,
              pageKey: pageKey as TestWikiPageKey,
              title: buildWikiTitle(pageKey as TestWikiPageKey),
            });
          },
        },
        financeTwinService: createFinanceTwinService({
          async getBankAccounts(companyKey) {
            throw new FinanceCompanyNotFoundError(companyKey);
          },
          async getCashPosture(companyKey) {
            throw new FinanceCompanyNotFoundError(companyKey);
          },
          async getCollectionsPosture(companyKey) {
            throw new FinanceCompanyNotFoundError(companyKey);
          },
          async getContracts(companyKey) {
            throw new FinanceCompanyNotFoundError(companyKey);
          },
          async getObligationCalendar(companyKey) {
            throw new FinanceCompanyNotFoundError(companyKey);
          },
          async getPayablesAging(companyKey) {
            throw new FinanceCompanyNotFoundError(companyKey);
          },
          async getPayablesPosture(companyKey) {
            throw new FinanceCompanyNotFoundError(companyKey);
          },
          async getReceivablesAging(companyKey) {
            throw new FinanceCompanyNotFoundError(companyKey);
          },
          async getSpendItems(companyKey) {
            throw new FinanceCompanyNotFoundError(companyKey);
          },
          async getSpendPosture(companyKey) {
            throw new FinanceCompanyNotFoundError(companyKey);
          },
        }),
      });

      const answer = await service.answerQuestion({
        companyKey: "missing-company",
        questionKind,
      });

      expect(answer.freshnessPosture).toEqual({
        state: "missing",
        reasonSummary: expect.stringContaining("No stored Finance Twin"),
      });
      expect(answer.answerSummary).toContain("No stored");
      expect(answer.limitations.some((entry) => entry.includes("missing-company"))).toBe(
        true,
      );
    },
  );

  it.each(SUPPORTED_FAMILY_CASES)(
    "builds a deterministic supported-family answer for $questionKind",
    async ({ expectedPageKeys, expectedRoutePaths, questionKind, summaryText }) => {
      const service = new FinanceDiscoveryService({
        cfoWikiService: {
          async getPage(companyKey, pageKey) {
            return buildWikiPage({
              companyKey,
              pageKey: pageKey as TestWikiPageKey,
              title: buildWikiTitle(pageKey as TestWikiPageKey),
            });
          },
        },
        financeTwinService: createFinanceTwinService(),
      });

      const answer = await service.answerQuestion({
        companyKey: "acme",
        questionKind,
      });

      expect(answer.answerSummary).toContain(summaryText);
      expect(answer.relatedRoutes.map((route) => route.routePath)).toEqual(
        expectedRoutePaths,
      );
      expect(answer.relatedWikiPages.map((page) => page.pageKey)).toEqual(
        expectedPageKeys,
      );
      expect(answer.evidenceSections.length).toBeGreaterThanOrEqual(
        expectedPageKeys.length + 2,
      );
      expect(answer.limitations.length).toBeGreaterThan(0);
      expect(answer.bodyMarkdown).toContain("# ");
      expect(answer.bodyMarkdown).toContain("## Limitations");
    },
  );
});

function createFinanceTwinService(
  overrides?: Partial<{
    getBankAccounts: (companyKey: string) => Promise<FinanceBankAccountInventoryView>;
    getCashPosture: (companyKey: string) => Promise<FinanceCashPostureView>;
    getCollectionsPosture: (
      companyKey: string,
    ) => Promise<FinanceCollectionsPostureView>;
    getContracts: (companyKey: string) => Promise<FinanceContractsView>;
    getObligationCalendar: (
      companyKey: string,
    ) => Promise<FinanceObligationCalendarView>;
    getPayablesAging: (companyKey: string) => Promise<FinancePayablesAgingView>;
    getPayablesPosture: (companyKey: string) => Promise<FinancePayablesPostureView>;
    getReceivablesAging: (
      companyKey: string,
    ) => Promise<FinanceReceivablesAgingView>;
    getSpendItems: (companyKey: string) => Promise<FinanceSpendItemsView>;
    getSpendPosture: (companyKey: string) => Promise<FinanceSpendPostureView>;
  }>,
) {
  return {
    async getBankAccounts(_companyKey: string) {
      return buildBankAccountsView();
    },
    async getCashPosture(_companyKey: string) {
      return buildCashPostureView();
    },
    async getCollectionsPosture(_companyKey: string) {
      return buildCollectionsPostureView();
    },
    async getContracts(_companyKey: string) {
      return buildContractsView();
    },
    async getObligationCalendar(_companyKey: string) {
      return buildObligationCalendarView();
    },
    async getPayablesAging(_companyKey: string) {
      return buildPayablesAgingView();
    },
    async getPayablesPosture(_companyKey: string) {
      return buildPayablesPostureView();
    },
    async getReceivablesAging(_companyKey: string) {
      return buildReceivablesAgingView();
    },
    async getSpendItems(_companyKey: string) {
      return buildSpendItemsView();
    },
    async getSpendPosture(_companyKey: string) {
      return buildSpendPostureView();
    },
    ...overrides,
  };
}

function buildCashPostureView(input?: {
  coverageSummary?: Partial<FinanceCashPostureView["coverageSummary"]>;
  currencyBuckets?: FinanceCashPostureView["currencyBuckets"];
  freshness?: {
    reasonSummary: string;
    state: FinanceCashPostureView["freshness"]["state"];
  };
  limitations?: string[];
}): FinanceCashPostureView {
  return FinanceCashPostureViewSchema.parse({
    company: {
      id: "11111111-1111-4111-8111-111111111111",
      companyKey: "acme",
      displayName: "Acme",
      createdAt: "2026-04-15T00:00:00.000Z",
      updatedAt: "2026-04-15T00:00:00.000Z",
    },
    latestAttemptedSyncRun: null,
    latestSuccessfulBankSummarySlice: {
      latestSource: null,
      latestSyncRun: null,
      coverage: {
        bankAccountCount: 4,
        summaryRowCount: 4,
        lineageCount: 4,
      },
      summary: null,
    },
    freshness: {
      state: input?.freshness?.state ?? "fresh",
      latestSyncRunId: null,
      latestSyncStatus: null,
      latestCompletedAt: null,
      latestSuccessfulSyncRunId: null,
      latestSuccessfulCompletedAt: null,
      ageSeconds: null,
      staleAfterSeconds: 86400,
      reasonCode: "test",
      reasonSummary:
        input?.freshness?.reasonSummary ?? "Stored bank-account summary state is fresh.",
    },
    currencyBuckets:
      input?.currencyBuckets ??
      [
        {
          currency: "USD",
          statementOrLedgerBalanceTotal: "1200.00",
          availableBalanceTotal: "1400.00",
          unspecifiedBalanceTotal: "250.00",
          accountCount: 3,
          datedAccountCount: 2,
          undatedAccountCount: 1,
          mixedAsOfDates: true,
          earliestAsOfDate: "2026-04-10",
          latestAsOfDate: "2026-04-11",
        },
        {
          currency: "EUR",
          statementOrLedgerBalanceTotal: "300.00",
          availableBalanceTotal: "0.00",
          unspecifiedBalanceTotal: "0.00",
          accountCount: 1,
          datedAccountCount: 1,
          undatedAccountCount: 0,
          mixedAsOfDates: false,
          earliestAsOfDate: "2026-04-09",
          latestAsOfDate: "2026-04-09",
        },
      ],
    coverageSummary: {
      bankAccountCount: 4,
      reportedBalanceCount: 4,
      statementOrLedgerBalanceCount: 2,
      availableBalanceCount: 1,
      unspecifiedBalanceCount: 1,
      datedBalanceCount: 3,
      undatedBalanceCount: 1,
      currencyBucketCount: 2,
      mixedAsOfDateCurrencyBucketCount: 1,
      ...input?.coverageSummary,
    },
    diagnostics: [],
    limitations: input?.limitations ?? [
      "Cash posture is grouped by reported currency only; this route does not perform FX conversion or emit one company-wide cash total.",
    ],
  });
}

function buildBankAccountsView(input?: {
  accountCount?: number;
  accounts?: FinanceBankAccountInventoryView["accounts"];
  limitations?: string[];
}): FinanceBankAccountInventoryView {
  return FinanceBankAccountInventoryViewSchema.parse({
    company: {
      id: "11111111-1111-4111-8111-111111111111",
      companyKey: "acme",
      displayName: "Acme",
      createdAt: "2026-04-15T00:00:00.000Z",
      updatedAt: "2026-04-15T00:00:00.000Z",
    },
    latestAttemptedSyncRun: null,
    latestSuccessfulSlice: {
      latestSource: null,
      latestSyncRun: null,
      coverage: {
        bankAccountCount: 4,
        summaryRowCount: 4,
        lineageCount: 4,
        lineageTargetCounts: undefined,
      },
      summary: null,
    },
    freshness: {
      state: "fresh",
      latestSyncRunId: null,
      latestSyncStatus: null,
      latestCompletedAt: null,
      latestSuccessfulSyncRunId: null,
      latestSuccessfulCompletedAt: null,
      ageSeconds: null,
      staleAfterSeconds: 86400,
      reasonCode: "test",
      reasonSummary: "Stored bank-account summary state is fresh.",
    },
    accountCount: input?.accountCount ?? 4,
    accounts:
      input?.accounts ??
      [
        {
          bankAccount: {
            id: "22222222-2222-4222-8222-222222222222",
            companyId: "11111111-1111-4111-8111-111111111111",
            accountLabel: "Operating Checking",
            institutionName: "Acme Bank",
            externalAccountId: "bank-account-1",
            accountNumberLast4: "1234",
            createdAt: "2026-04-15T00:00:00.000Z",
            updatedAt: "2026-04-15T00:00:00.000Z",
          },
          reportedBalances: [
            {
              summary: {
                id: "33333333-3333-4333-8333-333333333333",
                companyId: "11111111-1111-4111-8111-111111111111",
                bankAccountId: "22222222-2222-4222-8222-222222222222",
                syncRunId: "44444444-4444-4444-8444-444444444444",
                lineNumber: 1,
                balanceType: "statement_or_ledger",
                balanceAmount: "1200.00",
                currencyCode: "USD",
                asOfDate: "2026-04-11",
                asOfDateSourceColumn: "as_of_date",
                balanceSourceColumn: "balance",
                observedAt: "2026-04-15T00:00:00.000Z",
                createdAt: "2026-04-15T00:00:00.000Z",
                updatedAt: "2026-04-15T00:00:00.000Z",
              },
              lineageRef: {
                targetKind: "bank_account_summary",
                targetId: "33333333-3333-4333-8333-333333333333",
                syncRunId: "44444444-4444-4444-8444-444444444444",
              },
            },
          ],
          currencyCodes: ["USD"],
          knownAsOfDates: ["2026-04-11"],
          unknownAsOfDateBalanceCount: 0,
          hasMixedAsOfDates: false,
        },
      ],
    diagnostics: [],
    limitations: input?.limitations ?? [],
  });
}

function buildWikiPage(input: {
  companyKey: string;
  pageKey: TestWikiPageKey;
  title: string;
}) {
  return CfoWikiPageViewSchema.parse({
    companyId: "11111111-1111-4111-8111-111111111111",
    companyKey: input.companyKey,
    companyDisplayName: "Acme",
    page: {
      id: "55555555-5555-4555-8555-555555555555",
      companyId: "11111111-1111-4111-8111-111111111111",
      compileRunId: "66666666-6666-4666-8666-666666666666",
      pageKey: input.pageKey,
      pageKind: input.pageKey.startsWith("metrics/")
        ? "metric_definition"
        : input.pageKey.startsWith("concepts/")
          ? "concept"
          : "company_overview",
      ownershipKind: "compiler_owned",
      temporalStatus: "current",
      title: input.title,
      summary: `${input.title} summary`,
      markdownBody: `# ${input.title}`,
      freshnessSummary: {
        state: "fresh",
        summary: "Page freshness is current.",
      },
      limitations: [],
      lastCompiledAt: "2026-04-15T00:00:00.000Z",
      filedMetadata: null,
      createdAt: "2026-04-15T00:00:00.000Z",
      updatedAt: "2026-04-15T00:00:00.000Z",
      markdownPath: `${input.pageKey}.md`,
    },
    links: [],
    backlinks: [],
    refs: [],
    latestCompileRun: null,
    freshnessSummary: {
      state: "fresh",
      summary: "Page freshness is current.",
    },
    limitations: [],
  });
}

function buildWikiTitle(pageKey: TestWikiPageKey) {
  switch (pageKey) {
    case "company/overview":
      return "Company overview";
    case "concepts/cash":
      return "Cash";
    case "concepts/contract-obligations":
      return "Contract Obligations";
    case "concepts/payables":
      return "Payables";
    case "concepts/receivables":
      return "Receivables";
    case "concepts/spend":
      return "Spend";
    case "metrics/cash-posture":
      return "Cash posture";
    case "metrics/collections-posture":
      return "Collections posture";
    case "metrics/obligation-calendar":
      return "Obligation calendar";
    case "metrics/payables-aging":
      return "Payables aging";
    case "metrics/payables-posture":
      return "Payables posture";
    case "metrics/receivables-aging":
      return "Receivables aging";
    case "metrics/spend-posture":
      return "Spend posture";
  }
}

function buildReceivablesAgingView(): FinanceReceivablesAgingView {
  return {
    company: buildCompanyRecord(),
    latestAttemptedSyncRun: null,
    latestSuccessfulSlice: {
      latestSource: null,
      latestSyncRun: null,
      coverage: {
        customerCount: 3,
        rowCount: 4,
        lineageCount: 4,
        lineageTargetCounts: buildLineageTargetCounts({
          customerCount: 3,
          receivablesAgingRowCount: 4,
        }),
      },
      summary: null,
    },
    freshness: buildFreshnessSummary(),
    customerCount: 3,
    rows: [
      {
        customer: {
          id: "customer-1",
          companyId: "11111111-1111-4111-8111-111111111111",
          customerLabel: "Alpha Co",
          externalCustomerId: "C-100",
          createdAt: "2026-04-15T00:00:00.000Z",
          updatedAt: "2026-04-15T00:00:00.000Z",
        },
        receivablesAgingRow: {
          id: "receivable-row-1",
          companyId: "11111111-1111-4111-8111-111111111111",
          customerId: "customer-1",
          syncRunId: "receivables-sync-1",
          lineNumber: 1,
          sourceLineNumbers: [1],
          currencyCode: "USD",
          asOfDate: "2026-04-30",
          knownAsOfDates: ["2026-04-30"],
          unknownAsOfObservationCount: 0,
          bucketValues: [],
          sourceFieldMap: {},
          observedAt: "2026-04-15T00:00:00.000Z",
          createdAt: "2026-04-15T00:00:00.000Z",
          updatedAt: "2026-04-15T00:00:00.000Z",
        } as never,
        reportedTotalAmount: "120.00",
        lineageRef: {
          targetKind: "receivables_aging_row",
          targetId: "receivable-row-1",
          syncRunId: "receivables-sync-1",
        },
      },
    ],
    diagnostics: [],
    limitations: [],
  } as FinanceReceivablesAgingView;
}

function buildCollectionsPostureView(): FinanceCollectionsPostureView {
  return {
    company: buildCompanyRecord(),
    latestAttemptedSyncRun: null,
    latestSuccessfulReceivablesAgingSlice: {
      latestSource: null,
      latestSyncRun: null,
      coverage: {
        customerCount: 3,
        rowCount: 4,
        lineageCount: 4,
        lineageTargetCounts: buildLineageTargetCounts({
          customerCount: 3,
          receivablesAgingRowCount: 4,
        }),
      },
      summary: null,
    },
    freshness: buildFreshnessSummary(),
    currencyBuckets: [
      {
        currency: "USD",
        totalReceivables: "200.00",
        currentBucketTotal: "100.00",
        pastDueBucketTotal: "100.00",
        exactBucketTotals: [],
        customerCount: 2,
        datedCustomerCount: 1,
        undatedCustomerCount: 1,
        mixedAsOfDates: true,
        earliestAsOfDate: "2026-04-29",
        latestAsOfDate: "2026-04-30",
      },
    ],
    coverageSummary: {
      customerCount: 3,
      rowCount: 4,
      currencyBucketCount: 1,
      datedRowCount: 3,
      undatedRowCount: 1,
      rowsWithExplicitTotalCount: 4,
      rowsWithCurrentBucketCount: 3,
      rowsWithComputablePastDueCount: 4,
      rowsWithPartialPastDueOnlyCount: 0,
    },
    diagnostics: [],
    limitations: [],
  } as FinanceCollectionsPostureView;
}

function buildPayablesAgingView(): FinancePayablesAgingView {
  return {
    company: buildCompanyRecord(),
    latestAttemptedSyncRun: null,
    latestSuccessfulSlice: {
      latestSource: null,
      latestSyncRun: null,
      coverage: {
        vendorCount: 3,
        rowCount: 4,
        lineageCount: 4,
        lineageTargetCounts: buildLineageTargetCounts({
          payablesAgingRowCount: 4,
          vendorCount: 3,
        }),
      },
      summary: null,
    },
    freshness: buildFreshnessSummary(),
    vendorCount: 3,
    rows: [
      {
        vendor: {
          id: "vendor-1",
          companyId: "11111111-1111-4111-8111-111111111111",
          vendorLabel: "Paper Supply Co",
          externalVendorId: "V-100",
          createdAt: "2026-04-15T00:00:00.000Z",
          updatedAt: "2026-04-15T00:00:00.000Z",
        },
        payablesAgingRow: {
          id: "payable-row-1",
          companyId: "11111111-1111-4111-8111-111111111111",
          vendorId: "vendor-1",
          syncRunId: "payables-sync-1",
          lineNumber: 1,
          sourceLineNumbers: [1],
          currencyCode: "USD",
          asOfDate: "2026-04-30",
          knownAsOfDates: ["2026-04-30"],
          unknownAsOfObservationCount: 0,
          bucketValues: [],
          sourceFieldMap: {},
          observedAt: "2026-04-15T00:00:00.000Z",
          createdAt: "2026-04-15T00:00:00.000Z",
          updatedAt: "2026-04-15T00:00:00.000Z",
        } as never,
        reportedTotalAmount: "120.00",
        lineageRef: {
          targetKind: "payables_aging_row",
          targetId: "payable-row-1",
          syncRunId: "payables-sync-1",
        },
      },
    ],
    diagnostics: [],
    limitations: [],
  } as FinancePayablesAgingView;
}

function buildPayablesPostureView(): FinancePayablesPostureView {
  return {
    company: buildCompanyRecord(),
    latestAttemptedSyncRun: null,
    latestSuccessfulPayablesAgingSlice: {
      latestSource: null,
      latestSyncRun: null,
      coverage: {
        vendorCount: 3,
        rowCount: 4,
        lineageCount: 4,
        lineageTargetCounts: buildLineageTargetCounts({
          payablesAgingRowCount: 4,
          vendorCount: 3,
        }),
      },
      summary: null,
    },
    freshness: buildFreshnessSummary(),
    currencyBuckets: [
      {
        currency: "USD",
        totalPayables: "200.00",
        currentBucketTotal: "100.00",
        pastDueBucketTotal: "100.00",
        exactBucketTotals: [],
        vendorCount: 2,
        datedVendorCount: 1,
        undatedVendorCount: 1,
        mixedAsOfDates: true,
        earliestAsOfDate: "2026-04-29",
        latestAsOfDate: "2026-04-30",
      },
    ],
    coverageSummary: {
      vendorCount: 3,
      rowCount: 4,
      currencyBucketCount: 1,
      datedRowCount: 3,
      undatedRowCount: 1,
      rowsWithExplicitTotalCount: 4,
      rowsWithCurrentBucketCount: 3,
      rowsWithComputablePastDueCount: 4,
      rowsWithPartialPastDueOnlyCount: 0,
    },
    diagnostics: [],
    limitations: [],
  } as FinancePayablesPostureView;
}

function buildSpendItemsView(): FinanceSpendItemsView {
  return {
    company: buildCompanyRecord(),
    latestAttemptedSyncRun: null,
    latestSuccessfulSlice: {
      latestSource: null,
      latestSyncRun: null,
      coverage: {
        rowCount: 5,
        lineageCount: 5,
        lineageTargetCounts: buildLineageTargetCounts({
          spendRowCount: 5,
        }),
      },
      summary: null,
    },
    freshness: buildFreshnessSummary(),
    rowCount: 5,
    rows: [],
    diagnostics: [],
    limitations: [],
  } as FinanceSpendItemsView;
}

function buildSpendPostureView(): FinanceSpendPostureView {
  return {
    company: buildCompanyRecord(),
    latestAttemptedSyncRun: null,
    latestSuccessfulCardExpenseSlice: {
      latestSource: null,
      latestSyncRun: null,
      coverage: {
        rowCount: 5,
        lineageCount: 5,
        lineageTargetCounts: buildLineageTargetCounts({
          spendRowCount: 5,
        }),
      },
      summary: null,
    },
    freshness: buildFreshnessSummary(),
    currencyBuckets: [
      {
        currency: "USD",
        reportedAmountTotal: "512.50",
        postedAmountTotal: "545.00",
        transactionAmountTotal: "534.00",
        rowCount: 4,
        datedRowCount: 4,
        undatedRowCount: 0,
        mixedPostedDates: true,
        mixedTransactionDates: true,
        earliestPostedDate: "2026-04-03",
        latestPostedDate: "2026-04-04",
        earliestTransactionDate: "2026-04-01",
        latestTransactionDate: "2026-04-02",
      },
    ],
    coverageSummary: {
      rowCount: 5,
      currencyBucketCount: 1,
      datedRowCount: 4,
      undatedRowCount: 1,
      rowsWithExplicitRowIdentityCount: 4,
      rowsWithReportedAmountCount: 4,
      rowsWithPostedAmountCount: 3,
      rowsWithTransactionAmountCount: 3,
      rowsWithMerchantOrVendorCount: 5,
      rowsWithEmployeeOrCardholderCount: 4,
    },
    diagnostics: [],
    limitations: [],
  } as FinanceSpendPostureView;
}

function buildContractsView(): FinanceContractsView {
  return {
    company: buildCompanyRecord(),
    latestAttemptedSyncRun: null,
    latestSuccessfulSlice: {
      latestSource: null,
      latestSyncRun: null,
      coverage: {
        contractCount: 4,
        obligationCount: 5,
        lineageCount: 9,
        lineageTargetCounts: buildLineageTargetCounts({
          contractCount: 4,
          contractObligationCount: 5,
        }),
      },
      summary: null,
    },
    freshness: buildFreshnessSummary(),
    contractCount: 4,
    contracts: [],
    diagnostics: [],
    limitations: [],
  } as FinanceContractsView;
}

function buildObligationCalendarView(): FinanceObligationCalendarView {
  return {
    company: buildCompanyRecord(),
    latestAttemptedSyncRun: null,
    latestSuccessfulContractMetadataSlice: {
      latestSource: null,
      latestSyncRun: null,
      coverage: {
        contractCount: 4,
        obligationCount: 5,
        lineageCount: 9,
        lineageTargetCounts: buildLineageTargetCounts({
          contractCount: 4,
          contractObligationCount: 5,
        }),
      },
      summary: null,
    },
    freshness: buildFreshnessSummary(),
    upcomingObligations: [],
    currencyBuckets: [
      {
        currency: "USD",
        obligationCount: 1,
        obligationsWithExplicitAmountCount: 1,
        obligationsWithoutExplicitAmountCount: 0,
        explicitAmountTotal: "500.00",
        earliestDueDate: "2026-05-15",
        latestDueDate: "2026-05-15",
      },
    ],
    coverageSummary: {
      contractCount: 4,
      obligationCount: 5,
      currencyBucketCount: 1,
      datedContractCount: 3,
      undatedContractCount: 1,
      obligationsWithExplicitAmountCount: 2,
      obligationsWithoutExplicitAmountCount: 3,
      contractsWithRenewalDateCount: 1,
      contractsWithExpirationDateCount: 0,
      contractsWithEndDateCount: 2,
      contractsWithNoticeDeadlineCount: 1,
      contractsWithScheduledPaymentDateCount: 3,
    },
    diagnostics: [],
    limitations: [],
  } as FinanceObligationCalendarView;
}

function buildCompanyRecord() {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    companyKey: "acme",
    displayName: "Acme",
    createdAt: "2026-04-15T00:00:00.000Z",
    updatedAt: "2026-04-15T00:00:00.000Z",
  };
}

function buildFreshnessSummary() {
  return {
    state: "fresh" as const,
    latestSyncRunId: null,
    latestSyncStatus: null,
    latestCompletedAt: null,
    latestSuccessfulSyncRunId: null,
    latestSuccessfulCompletedAt: null,
    ageSeconds: null,
    staleAfterSeconds: 86400,
    reasonCode: "test",
    reasonSummary: "Stored finance slice state is fresh.",
  };
}

function buildLineageTargetCounts(
  overrides?: Partial<{
    accountCatalogEntryCount: number;
    bankAccountCount: number;
    bankAccountSummaryCount: number;
    contractCount: number;
    contractObligationCount: number;
    customerCount: number;
    generalLedgerBalanceProofCount: number;
    journalEntryCount: number;
    journalLineCount: number;
    ledgerAccountCount: number;
    payablesAgingRowCount: number;
    receivablesAgingRowCount: number;
    reportingPeriodCount: number;
    spendRowCount: number;
    trialBalanceLineCount: number;
    vendorCount: number;
  }>,
) {
  return {
    reportingPeriodCount: 0,
    ledgerAccountCount: 0,
    bankAccountCount: 0,
    bankAccountSummaryCount: 0,
    customerCount: 0,
    receivablesAgingRowCount: 0,
    vendorCount: 0,
    payablesAgingRowCount: 0,
    contractCount: 0,
    contractObligationCount: 0,
    spendRowCount: 0,
    trialBalanceLineCount: 0,
    accountCatalogEntryCount: 0,
    journalEntryCount: 0,
    journalLineCount: 0,
    generalLedgerBalanceProofCount: 0,
    ...overrides,
  };
}
