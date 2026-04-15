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
  | "concepts/policy-corpus"
  | "concepts/payables"
  | "concepts/receivables"
  | "concepts/spend"
  | "metrics/collections-posture"
  | "metrics/obligation-calendar"
  | "metrics/cash-posture"
  | "metrics/payables-aging"
  | "metrics/payables-posture"
  | "metrics/receivables-aging"
  | "metrics/spend-posture"
  | `policies/${string}`
  | `sources/${string}/snapshots/${number}`;

const SUPPORTED_FAMILY_CASES = [
  {
    questionKind: "cash_posture" as const,
    expectedPageKeys: [
      "metrics/cash-posture",
      "concepts/cash",
      "company/overview",
    ],
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
    expectedPageKeys: [
      "metrics/spend-posture",
      "concepts/spend",
      "company/overview",
    ],
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

    expect(answer.answerSummary).toContain(
      "Stored cash posture for acme covers 4 bank accounts",
    );
    expect(answer.freshnessPosture.state).toBe("fresh");
    expect(answer.freshnessPosture.reasonSummary).toContain(
      "All required Finance Twin reads for cash posture are Fresh for acme.",
    );
    expect(answer.freshnessPosture.reasonSummary).toContain(
      "Cash posture is Fresh: Stored bank-account summary state is fresh.",
    );
    expect(answer.freshnessPosture.reasonSummary).toContain(
      "Bank account inventory is Fresh: Stored bank-account summary state is fresh.",
    );
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
    expect(answer.bodyMarkdown).toContain("- State: Fresh");
    expect(answer.evidenceSections[0]?.summary).toContain("Freshness: Fresh.");
    expect(answer.bodyMarkdown).toContain("## Evidence sections");
  });

  it("persists a truthful mixed freshness answer when one required cash read is stale and another remains available", async () => {
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
            limitations: [
              "No successful bank-account-summary slice exists yet for this company.",
            ],
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

    expect(answer.freshnessPosture.state).toBe("mixed");
    expect(answer.freshnessPosture.reasonSummary).toContain(
      "Required Finance Twin reads for cash posture do not agree for acme.",
    );
    expect(answer.freshnessPosture.reasonSummary).toContain(
      "Cash posture is Stale:",
    );
    expect(answer.freshnessPosture.reasonSummary).toContain(
      "Bank account inventory is Fresh:",
    );
    expect(answer.answerSummary).toContain("is limited");
    expect(answer.limitations).toContain(
      "No persisted bank-account summary rows are available yet for acme.",
    );
  });

  it("rolls multi-read freshness up to mixed when a supported family depends on disagreeing twin reads", async () => {
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
        async getReceivablesAging() {
          return {
            ...buildReceivablesAgingView(),
            freshness: buildFreshnessSummary({
              reasonSummary:
                "Stored receivables-aging coverage is stale relative to the freshness threshold.",
              state: "stale",
            }),
          };
        },
      }),
    });

    const answer = await service.answerQuestion({
      companyKey: "acme",
      questionKind: "collections_pressure",
    });

    expect(answer.freshnessPosture).toEqual({
      state: "mixed",
      reasonSummary: expect.stringContaining(
        "Required Finance Twin reads for collections pressure do not agree for acme.",
      ),
    });
    expect(answer.freshnessPosture.reasonSummary).toContain(
      "Collections posture is Fresh: Stored finance slice state is fresh.",
    );
    expect(answer.freshnessPosture.reasonSummary).toContain(
      "Receivables aging is Stale: Stored receivables-aging coverage is stale relative to the freshness threshold.",
    );
  });

  it("adds an explicit limitation when a required supported-family read is missing", async () => {
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
        async getReceivablesAging() {
          return {
            ...buildReceivablesAgingView(),
            customerCount: 0,
            freshness: buildFreshnessSummary({
              reasonSummary:
                "No successful receivables-aging sync has completed yet for this company.",
              state: "missing",
            }),
            rows: [],
          };
        },
      }),
    });

    const answer = await service.answerQuestion({
      companyKey: "acme",
      questionKind: "collections_pressure",
    });

    expect(answer.freshnessPosture.state).toBe("mixed");
    expect(answer.limitations).toContain(
      "Required Finance Twin read Receivables aging is missing for acme: No successful receivables-aging sync has completed yet for this company.",
    );
  });

  it("adds an explicit limitation when a required supported-family read is stale", async () => {
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
        async getReceivablesAging() {
          return {
            ...buildReceivablesAgingView(),
            freshness: buildFreshnessSummary({
              reasonSummary:
                "Stored receivables-aging coverage is stale relative to the freshness threshold.",
              state: "stale",
            }),
          };
        },
      }),
    });

    const answer = await service.answerQuestion({
      companyKey: "acme",
      questionKind: "collections_pressure",
    });

    expect(answer.freshnessPosture.state).toBe("mixed");
    expect(answer.limitations).toContain(
      "Required Finance Twin read Receivables aging is stale for acme: Stored receivables-aging coverage is stale relative to the freshness threshold.",
    );
  });

  it("adds an explicit limitation when a required supported-family read is freshness-failed", async () => {
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
        async getPayablesAging() {
          return {
            ...buildPayablesAgingView(),
            freshness: buildFreshnessSummary({
              reasonSummary:
                "The latest payables-aging sync failed after an earlier successful snapshot was stored.",
              state: "failed",
            }),
          };
        },
      }),
    });

    const answer = await service.answerQuestion({
      companyKey: "acme",
      questionKind: "payables_pressure",
    });

    expect(answer.freshnessPosture.state).toBe("mixed");
    expect(answer.limitations).toContain(
      "Required Finance Twin read Payables aging is in failed freshness posture for acme: The latest payables-aging sync failed after an earlier successful snapshot was stored.",
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

      expect(answer.freshnessPosture.state).toBe("missing");
      expect(answer.freshnessPosture.reasonSummary).toContain(
        "All required Finance Twin reads for",
      );
      expect(answer.freshnessPosture.reasonSummary).toContain(
        "are Missing for missing-company.",
      );
      expect(answer.answerSummary).toContain("No stored");
      expect(
        answer.limitations.some((entry) =>
          entry.includes("Required Finance Twin read"),
        ),
      ).toBe(true);
      expect(
        answer.limitations.some((entry) => entry.includes("missing-company")),
      ).toBe(true);
    },
  );

  it.each(SUPPORTED_FAMILY_CASES)(
    "builds a deterministic supported-family answer for $questionKind",
    async ({
      expectedPageKeys,
      expectedRoutePaths,
      questionKind,
      summaryText,
    }) => {
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

  it("builds a deterministic scoped policy-lookup answer from stored wiki state and explicit bound-source metadata", async () => {
    const policySourceId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const service = new FinanceDiscoveryService({
      cfoWikiService: {
        async getPage(companyKey, pageKey) {
          if (pageKey === `policies/${policySourceId}`) {
            return buildWikiPage({
              companyKey,
              pageKey,
              summary:
                "Travel and expense policy sets explicit approval thresholds for higher-value spend.",
              title: "Travel and expense policy",
            });
          }

          if (pageKey === `sources/${policySourceId}/snapshots/2`) {
            return buildWikiPage({
              companyKey,
              pageKey,
              pageKind: "source_digest",
              summary:
                "Latest deterministic source digest confirms the current approved policy revision.",
              title: "Travel policy source digest",
            });
          }

          return buildWikiPage({
            companyKey,
            pageKey: pageKey as TestWikiPageKey,
            summary:
              "The policy corpus remains limited to explicit `policy_document` bindings and their deterministic extracts.",
            title: "Policy corpus",
          });
        },
        async listCompanySources(companyKey) {
          return buildCompanySourceList(companyKey, [
            buildBoundPolicySource({
              latestExtract: {
                extractStatus: "extracted",
              },
              latestSnapshotVersion: 2,
              sourceId: policySourceId,
              sourceName: "Travel and expense policy",
            }),
          ]) as never;
        },
      },
      financeTwinService: createFinanceTwinService(),
    });

    const answer = await service.answerQuestion({
      companyKey: "acme",
      operatorPrompt: "Which approval thresholds are visible for this policy?",
      policySourceId,
      questionKind: "policy_lookup",
    });

    expect(answer.questionKind).toBe("policy_lookup");
    expect(answer.policySourceId).toBe(policySourceId);
    expect(answer.answerSummary).toContain(
      `Stored policy lookup for acme is scoped to policy source ${policySourceId}.`,
    );
    expect(answer.relatedRoutes.map((route) => route.routePath)).toEqual([
      `/cfo-wiki/companies/acme/pages/${encodeURIComponent(`policies/${policySourceId}`)}`,
      `/cfo-wiki/companies/acme/pages/${encodeURIComponent(`sources/${policySourceId}/snapshots/2`)}`,
      `/cfo-wiki/companies/acme/pages/${encodeURIComponent("concepts/policy-corpus")}`,
    ]);
    expect(answer.relatedWikiPages.map((page) => page.pageKey)).toEqual([
      `policies/${policySourceId}`,
      `sources/${policySourceId}/snapshots/2`,
      "concepts/policy-corpus",
    ]);
    expect(answer.evidenceSections.map((section) => section.key)).toEqual([
      "scoped_policy_page",
      "bound_source_status",
      "scoped_source_digest",
      "policy_corpus_boundary",
    ]);
    expect(answer.bodyMarkdown).toContain("## Question");
    expect(answer.bodyMarkdown).toContain(`- Policy source id: \`${policySourceId}\``);
    expect(answer.limitations).toContain(
      `This answer is scoped only to policy source ${policySourceId}; it does not search across other policies or unrelated company documents.`,
    );
  });

  it.each([
    {
      caseLabel: "missing extract",
      expectedFreshnessState: "missing",
      expectedLimitation:
        "Policy source aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa has no persisted deterministic extract for latest snapshot version 2.",
      latestExtract: null,
    },
    {
      caseLabel: "failed extract",
      expectedFreshnessState: "failed",
      expectedLimitation: "The latest policy extract failed deterministically.",
      latestExtract: {
        errorSummary: "The latest policy extract failed deterministically.",
        extractStatus: "failed" as const,
      },
    },
    {
      caseLabel: "unsupported extract",
      expectedFreshnessState: "missing",
      expectedLimitation:
        "Policy source aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa has an unsupported deterministic extract for its latest stored snapshot, so this answer cannot rely on compiled policy prose for that snapshot.",
      latestExtract: {
        extractStatus: "unsupported" as const,
      },
    },
  ])(
    "persists a truthful limited policy-lookup answer for $caseLabel",
    async ({ expectedFreshnessState, expectedLimitation, latestExtract }) => {
      const policySourceId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
      const service = new FinanceDiscoveryService({
        cfoWikiService: {
          async getPage(companyKey, pageKey) {
            if (pageKey === "concepts/policy-corpus") {
              return buildWikiPage({
                companyKey,
                pageKey,
                summary:
                  "The policy corpus remains limited to explicit `policy_document` bindings and their deterministic extracts.",
                title: "Policy corpus",
              });
            }

            throw new CfoWikiPageNotFoundError(companyKey, pageKey);
          },
          async listCompanySources(companyKey) {
            return buildCompanySourceList(companyKey, [
              buildBoundPolicySource({
                latestExtract,
                latestSnapshotVersion: 2,
                sourceId: policySourceId,
                sourceName: "Travel and expense policy",
              }),
            ]) as never;
          },
        },
        financeTwinService: createFinanceTwinService(),
      });

      const answer = await service.answerQuestion({
        companyKey: "acme",
        policySourceId,
        questionKind: "policy_lookup",
      });

      expect(answer.questionKind).toBe("policy_lookup");
      expect(answer.policySourceId).toBe(policySourceId);
      expect(answer.freshnessPosture.state).toBe(expectedFreshnessState);
      expect(answer.answerSummary).toContain("is limited");
      expect(answer.relatedRoutes.map((route) => route.routePath)).toContain(
        "/cfo-wiki/companies/acme/sources",
      );
      expect(answer.relatedWikiPages.map((page) => page.pageKey)).toEqual([
        "concepts/policy-corpus",
      ]);
      expect(answer.limitations).toContain(expectedLimitation);
      expect(answer.limitations).toContain(
        `CFO Wiki page policies/${policySourceId} is not available yet for acme.`,
      );
      expect(answer.evidenceSections[0]?.summary).toContain(
        `Compiled policy page policies/${policySourceId} is not currently available`,
      );
      expect(answer.bodyMarkdown).toContain("## Limitations");
    },
  );
});

function createFinanceTwinService(
  overrides?: Partial<{
    getBankAccounts: (
      companyKey: string,
    ) => Promise<FinanceBankAccountInventoryView>;
    getCashPosture: (companyKey: string) => Promise<FinanceCashPostureView>;
    getCollectionsPosture: (
      companyKey: string,
    ) => Promise<FinanceCollectionsPostureView>;
    getContracts: (companyKey: string) => Promise<FinanceContractsView>;
    getObligationCalendar: (
      companyKey: string,
    ) => Promise<FinanceObligationCalendarView>;
    getPayablesAging: (companyKey: string) => Promise<FinancePayablesAgingView>;
    getPayablesPosture: (
      companyKey: string,
    ) => Promise<FinancePayablesPostureView>;
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
        input?.freshness?.reasonSummary ??
        "Stored bank-account summary state is fresh.",
    },
    currencyBuckets: input?.currencyBuckets ?? [
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
    accounts: input?.accounts ?? [
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
  freshnessSummary?: {
    state: "failed" | "fresh" | "missing" | "mixed" | "stale";
    summary: string;
  };
  limitations?: string[];
  markdownBody?: string;
  pageKind?: "company_overview" | "concept" | "metric_definition" | "policy" | "source_digest";
  summary?: string;
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
      pageKind:
        input.pageKind ??
        (input.pageKey.startsWith("metrics/")
          ? "metric_definition"
          : input.pageKey.startsWith("concepts/")
            ? "concept"
            : input.pageKey.startsWith("policies/")
              ? "policy"
              : input.pageKey.startsWith("sources/")
                ? "source_digest"
                : "company_overview"),
      ownershipKind: "compiler_owned",
      temporalStatus: "current",
      title: input.title,
      summary: input.summary ?? `${input.title} summary`,
      markdownBody: input.markdownBody ?? `# ${input.title}`,
      freshnessSummary:
        input.freshnessSummary ?? {
          state: "fresh",
          summary: "Page freshness is current.",
        },
      limitations: input.limitations ?? [],
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
    freshnessSummary:
      input.freshnessSummary ?? {
        state: "fresh",
        summary: "Page freshness is current.",
      },
    limitations: input.limitations ?? [],
  });
}

function buildWikiTitle(pageKey: TestWikiPageKey) {
  switch (pageKey) {
    case "company/overview":
      return "Company overview";
    case "concepts/cash":
      return "Cash";
    case "concepts/policy-corpus":
      return "Policy corpus";
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
    default:
      return "Wiki page";
  }
}

function buildCompanySourceList(companyKey: string, sources: unknown[]) {
  return {
    companyId: "11111111-1111-4111-8111-111111111111",
    companyKey,
    companyDisplayName: "Acme",
    sourceCount: sources.length,
    sources,
    limitations: [],
  };
}

function buildBoundPolicySource(input: {
  latestExtract:
    | null
    | {
        errorSummary?: string;
        extractStatus: "extracted" | "failed" | "unsupported";
      };
  latestSnapshotVersion: number;
  sourceId: string;
  sourceName: string;
}) {
  return {
    binding: {
      id: "99999999-9999-4999-8999-999999999999",
      companyId: "11111111-1111-4111-8111-111111111111",
      sourceId: input.sourceId,
      includeInCompile: true,
      documentRole: "policy_document",
      boundBy: "operator",
      createdAt: "2026-04-15T00:00:00.000Z",
      updatedAt: "2026-04-15T00:00:00.000Z",
    },
    source: {
      id: input.sourceId,
      kind: "document",
      originKind: "manual",
      name: input.sourceName,
      description: "Scoped policy source",
      createdBy: "operator",
      createdAt: "2026-04-15T00:00:00.000Z",
      updatedAt: "2026-04-15T00:00:00.000Z",
    },
    latestSnapshot: {
      id: "88888888-8888-4888-8888-888888888888",
      sourceId: input.sourceId,
      version: input.latestSnapshotVersion,
      originalFileName: "policy.md",
      mediaType: "text/markdown",
      sizeBytes: 512,
      checksumSha256:
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      storageKind: "local_path",
      storageRef: "/tmp/policy.md",
      capturedAt: "2026-04-15T00:00:00.000Z",
      ingestStatus: "registered",
      createdAt: "2026-04-15T00:00:00.000Z",
      updatedAt: "2026-04-15T00:00:00.000Z",
    },
    latestSourceFile: {
      id: "77777777-7777-4777-8777-777777777777",
      sourceId: input.sourceId,
      snapshotId: "88888888-8888-4888-8888-888888888888",
      storagePath: "/tmp/policy.md",
      originalFileName: "policy.md",
      mediaType: "text/markdown",
      sizeBytes: 512,
      checksumSha256:
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      createdBy: "operator",
      capturedAt: "2026-04-15T00:00:00.000Z",
      createdAt: "2026-04-15T00:00:00.000Z",
      updatedAt: "2026-04-15T00:00:00.000Z",
    },
    latestExtract:
      input.latestExtract === null
        ? null
        : {
            id: "66666666-6666-4666-8666-666666666666",
            companyId: "11111111-1111-4111-8111-111111111111",
            sourceId: input.sourceId,
            sourceSnapshotId: "88888888-8888-4888-8888-888888888888",
            sourceFileId: "77777777-7777-4777-8777-777777777777",
            extractStatus: input.latestExtract.extractStatus,
            documentKind:
              input.latestExtract.extractStatus === "unsupported"
                ? "unsupported_document"
                : "markdown_text",
            title: input.sourceName,
            headingOutline: [],
            excerptBlocks: [],
            extractedText:
              input.latestExtract.extractStatus === "unsupported"
                ? null
                : "# Policy",
            renderedMarkdown:
              input.latestExtract.extractStatus === "unsupported"
                ? null
                : "# Policy",
            warnings: [],
            errorSummary: input.latestExtract.errorSummary ?? null,
            parserVersion: "test",
            inputChecksumSha256:
              "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            extractedAt: "2026-04-15T00:00:00.000Z",
            createdAt: "2026-04-15T00:00:00.000Z",
            updatedAt: "2026-04-15T00:00:00.000Z",
          },
    limitations: [],
  };
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

function buildFreshnessSummary(input?: {
  reasonSummary?: string;
  state?: "failed" | "fresh" | "missing" | "stale";
}) {
  return {
    state: input?.state ?? ("fresh" as const),
    latestSyncRunId: null,
    latestSyncStatus: null,
    latestCompletedAt: null,
    latestSuccessfulSyncRunId: null,
    latestSuccessfulCompletedAt: null,
    ageSeconds: null,
    staleAfterSeconds: 86400,
    reasonCode: "test",
    reasonSummary:
      input?.reasonSummary ?? "Stored finance slice state is fresh.",
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
