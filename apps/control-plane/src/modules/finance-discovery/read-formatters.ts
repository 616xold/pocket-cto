import type {
  FinanceDiscoveryEvidenceSection,
} from "@pocket-cto/domain";
import { readFreshnessLabel } from "@pocket-cto/domain";
import type {
  FinanceDiscoveryAnswerFormatterInput,
  FinanceDiscoveryRouteState,
  FinanceDiscoveryTwinReadMap,
} from "./types";

export function buildFinanceDiscoveryEvidenceSections(
  input: FinanceDiscoveryAnswerFormatterInput,
) {
  const sections: FinanceDiscoveryEvidenceSection[] = input.relatedRoutes.map(
    (route) => ({
      key: route.key,
      title: route.title,
      summary: buildRouteEvidenceSummary(route.readKey, input.twinReads),
      routePath: route.routePath,
    }),
  );

  for (const page of input.wikiPages) {
    sections.push({
      key: `wiki_${page.page.pageKey.replaceAll("/", "_")}`,
      title: `CFO Wiki: ${page.page.title}`,
      summary: page.page.summary,
      pageKey: page.page.pageKey,
    });
  }

  return sections;
}

export function buildFinanceDiscoveryStructuredData(
  input: FinanceDiscoveryAnswerFormatterInput,
  freshnessPosture: {
    reasonSummary: string;
    state: string;
  },
) {
  const uniqueReadKeys = Array.from(
    new Set(input.relatedRoutes.map((route) => route.readKey)),
  );

  return {
    companyKey: input.question.companyKey,
    questionKind: input.question.questionKind,
    operatorPrompt: input.question.operatorPrompt ?? null,
    freshnessPosture,
    routeData: Object.fromEntries(
      uniqueReadKeys.map((readKey) => [
        readKey,
        summarizeTwinRead(readKey, input.twinReads),
      ]),
    ),
    wikiPages: input.wikiPages.map((page) => ({
      pageKey: page.page.pageKey,
      title: page.page.title,
      freshnessState: page.freshnessSummary.state,
      summary: page.page.summary,
    })),
    missingWikiPages: input.missingWikiPages,
  };
}

function buildRouteEvidenceSummary(
  readKey: FinanceDiscoveryRouteState["readKey"],
  twinReads: FinanceDiscoveryTwinReadMap,
) {
  switch (readKey) {
    case "bankAccounts": {
      const bankAccounts = twinReads.bankAccounts;
      if (!bankAccounts) {
        return "No stored bank-account inventory route result is available yet for this company.";
      }

      return `Read ${bankAccounts.accountCount} persisted bank account${pluralize(
        bankAccounts.accountCount,
      )} with ${bankAccounts.accounts.flatMap((account) => account.reportedBalances).length} reported balance row${pluralize(
        bankAccounts.accounts.flatMap((account) => account.reportedBalances).length,
      )}. ${buildFreshnessSummary(bankAccounts.freshness)}`;
    }
    case "cashPosture": {
      const cashPosture = twinReads.cashPosture;
      if (!cashPosture) {
        return "No stored cash-posture route result is available yet for this company.";
      }

      return `Read ${cashPosture.coverageSummary.reportedBalanceCount} persisted bank-summary balance${pluralize(
        cashPosture.coverageSummary.reportedBalanceCount,
      )} across ${cashPosture.coverageSummary.currencyBucketCount} currency bucket${pluralize(
        cashPosture.coverageSummary.currencyBucketCount,
      )}. ${buildFreshnessSummary(cashPosture.freshness)}`;
    }
    case "collectionsPosture": {
      const collectionsPosture = twinReads.collectionsPosture;
      if (!collectionsPosture) {
        return "No stored collections-posture route result is available yet for this company.";
      }

      return `Read ${collectionsPosture.coverageSummary.rowCount} persisted receivables-aging row${pluralize(
        collectionsPosture.coverageSummary.rowCount,
      )} across ${collectionsPosture.coverageSummary.currencyBucketCount} currency bucket${pluralize(
        collectionsPosture.coverageSummary.currencyBucketCount,
      )}. ${buildFreshnessSummary(collectionsPosture.freshness)}`;
    }
    case "contracts": {
      const contracts = twinReads.contracts;
      if (!contracts) {
        return "No stored contracts route result is available yet for this company.";
      }

      return `Read ${contracts.contractCount} persisted contract${pluralize(
        contracts.contractCount,
      )}. ${buildFreshnessSummary(contracts.freshness)}`;
    }
    case "obligationCalendar": {
      const obligationCalendar = twinReads.obligationCalendar;
      if (!obligationCalendar) {
        return "No stored obligation-calendar route result is available yet for this company.";
      }

      return `Read ${obligationCalendar.coverageSummary.obligationCount} upcoming obligation${pluralize(
        obligationCalendar.coverageSummary.obligationCount,
      )} across ${obligationCalendar.coverageSummary.currencyBucketCount} currency bucket${pluralize(
        obligationCalendar.coverageSummary.currencyBucketCount,
      )}. ${buildFreshnessSummary(obligationCalendar.freshness)}`;
    }
    case "payablesAging": {
      const payablesAging = twinReads.payablesAging;
      if (!payablesAging) {
        return "No stored payables-aging route result is available yet for this company.";
      }

      return `Read ${payablesAging.rows.length} persisted payables-aging row${pluralize(
        payablesAging.rows.length,
      )} across ${payablesAging.vendorCount} vendor${pluralize(
        payablesAging.vendorCount,
      )}. ${buildFreshnessSummary(payablesAging.freshness)}`;
    }
    case "payablesPosture": {
      const payablesPosture = twinReads.payablesPosture;
      if (!payablesPosture) {
        return "No stored payables-posture route result is available yet for this company.";
      }

      return `Read ${payablesPosture.coverageSummary.rowCount} persisted payables-aging row${pluralize(
        payablesPosture.coverageSummary.rowCount,
      )} across ${payablesPosture.coverageSummary.currencyBucketCount} currency bucket${pluralize(
        payablesPosture.coverageSummary.currencyBucketCount,
      )}. ${buildFreshnessSummary(payablesPosture.freshness)}`;
    }
    case "receivablesAging": {
      const receivablesAging = twinReads.receivablesAging;
      if (!receivablesAging) {
        return "No stored receivables-aging route result is available yet for this company.";
      }

      return `Read ${receivablesAging.rows.length} persisted receivables-aging row${pluralize(
        receivablesAging.rows.length,
      )} across ${receivablesAging.customerCount} customer${pluralize(
        receivablesAging.customerCount,
      )}. ${buildFreshnessSummary(receivablesAging.freshness)}`;
    }
    case "spendItems": {
      const spendItems = twinReads.spendItems;
      if (!spendItems) {
        return "No stored spend-items route result is available yet for this company.";
      }

      return `Read ${spendItems.rowCount} persisted spend row${pluralize(
        spendItems.rowCount,
      )}. ${buildFreshnessSummary(spendItems.freshness)}`;
    }
    case "spendPosture": {
      const spendPosture = twinReads.spendPosture;
      if (!spendPosture) {
        return "No stored spend-posture route result is available yet for this company.";
      }

      return `Read ${spendPosture.coverageSummary.rowCount} persisted spend row${pluralize(
        spendPosture.coverageSummary.rowCount,
      )} across ${spendPosture.coverageSummary.currencyBucketCount} currency bucket${pluralize(
        spendPosture.coverageSummary.currencyBucketCount,
      )}. ${buildFreshnessSummary(spendPosture.freshness)}`;
    }
  }
}

function buildFreshnessSummary(freshness: {
  reasonSummary: string;
  state: string;
}) {
  return `Freshness: ${readFreshnessLabel(freshness.state)}. ${freshness.reasonSummary}`;
}

function summarizeTwinRead(
  readKey: FinanceDiscoveryRouteState["readKey"],
  twinReads: FinanceDiscoveryTwinReadMap,
) {
  switch (readKey) {
    case "bankAccounts": {
      const bankAccounts = twinReads.bankAccounts;
      return bankAccounts
        ? {
            accountCount: bankAccounts.accountCount,
            diagnostics: bankAccounts.diagnostics,
            latestAttemptedSyncRunId: bankAccounts.latestAttemptedSyncRun?.id ?? null,
            latestSuccessfulSyncRunId:
              bankAccounts.latestSuccessfulSlice.latestSyncRun?.id ?? null,
          }
        : null;
    }
    case "cashPosture": {
      const cashPosture = twinReads.cashPosture;
      return cashPosture
        ? {
            coverageSummary: cashPosture.coverageSummary,
            currencyBuckets: cashPosture.currencyBuckets,
            diagnostics: cashPosture.diagnostics,
            latestAttemptedSyncRunId: cashPosture.latestAttemptedSyncRun?.id ?? null,
            latestSuccessfulSyncRunId:
              cashPosture.latestSuccessfulBankSummarySlice.latestSyncRun?.id ?? null,
          }
        : null;
    }
    case "collectionsPosture": {
      const collectionsPosture = twinReads.collectionsPosture;
      return collectionsPosture
        ? {
            coverageSummary: collectionsPosture.coverageSummary,
            currencyBuckets: collectionsPosture.currencyBuckets,
            diagnostics: collectionsPosture.diagnostics,
            latestAttemptedSyncRunId:
              collectionsPosture.latestAttemptedSyncRun?.id ?? null,
            latestSuccessfulSyncRunId:
              collectionsPosture.latestSuccessfulReceivablesAgingSlice.latestSyncRun
                ?.id ?? null,
          }
        : null;
    }
    case "contracts": {
      const contracts = twinReads.contracts;
      return contracts
        ? {
            contractCount: contracts.contractCount,
            diagnostics: contracts.diagnostics,
            latestAttemptedSyncRunId: contracts.latestAttemptedSyncRun?.id ?? null,
            latestSuccessfulSyncRunId:
              contracts.latestSuccessfulSlice.latestSyncRun?.id ?? null,
          }
        : null;
    }
    case "obligationCalendar": {
      const obligationCalendar = twinReads.obligationCalendar;
      return obligationCalendar
        ? {
            coverageSummary: obligationCalendar.coverageSummary,
            currencyBuckets: obligationCalendar.currencyBuckets,
            diagnostics: obligationCalendar.diagnostics,
            latestAttemptedSyncRunId:
              obligationCalendar.latestAttemptedSyncRun?.id ?? null,
            latestSuccessfulSyncRunId:
              obligationCalendar.latestSuccessfulContractMetadataSlice.latestSyncRun
                ?.id ?? null,
          }
        : null;
    }
    case "payablesAging": {
      const payablesAging = twinReads.payablesAging;
      return payablesAging
        ? {
            rowCount: payablesAging.rows.length,
            vendorCount: payablesAging.vendorCount,
            diagnostics: payablesAging.diagnostics,
            latestAttemptedSyncRunId:
              payablesAging.latestAttemptedSyncRun?.id ?? null,
            latestSuccessfulSyncRunId:
              payablesAging.latestSuccessfulSlice.latestSyncRun?.id ?? null,
          }
        : null;
    }
    case "payablesPosture": {
      const payablesPosture = twinReads.payablesPosture;
      return payablesPosture
        ? {
            coverageSummary: payablesPosture.coverageSummary,
            currencyBuckets: payablesPosture.currencyBuckets,
            diagnostics: payablesPosture.diagnostics,
            latestAttemptedSyncRunId:
              payablesPosture.latestAttemptedSyncRun?.id ?? null,
            latestSuccessfulSyncRunId:
              payablesPosture.latestSuccessfulPayablesAgingSlice.latestSyncRun
                ?.id ?? null,
          }
        : null;
    }
    case "receivablesAging": {
      const receivablesAging = twinReads.receivablesAging;
      return receivablesAging
        ? {
            customerCount: receivablesAging.customerCount,
            rowCount: receivablesAging.rows.length,
            diagnostics: receivablesAging.diagnostics,
            latestAttemptedSyncRunId:
              receivablesAging.latestAttemptedSyncRun?.id ?? null,
            latestSuccessfulSyncRunId:
              receivablesAging.latestSuccessfulSlice.latestSyncRun?.id ?? null,
          }
        : null;
    }
    case "spendItems": {
      const spendItems = twinReads.spendItems;
      return spendItems
        ? {
            rowCount: spendItems.rowCount,
            diagnostics: spendItems.diagnostics,
            latestAttemptedSyncRunId: spendItems.latestAttemptedSyncRun?.id ?? null,
            latestSuccessfulSyncRunId:
              spendItems.latestSuccessfulSlice.latestSyncRun?.id ?? null,
          }
        : null;
    }
    case "spendPosture": {
      const spendPosture = twinReads.spendPosture;
      return spendPosture
        ? {
            coverageSummary: spendPosture.coverageSummary,
            currencyBuckets: spendPosture.currencyBuckets,
            diagnostics: spendPosture.diagnostics,
            latestAttemptedSyncRunId:
              spendPosture.latestAttemptedSyncRun?.id ?? null,
            latestSuccessfulSyncRunId:
              spendPosture.latestSuccessfulCardExpenseSlice.latestSyncRun?.id ?? null,
          }
        : null;
    }
  }
}

function pluralize(count: number) {
  return count === 1 ? "" : "s";
}
