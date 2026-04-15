import type { CfoWikiPageKey, CfoWikiPageView, FinanceDiscoveryQuestion } from "@pocket-cto/domain";
import type {
  FinanceBankAccountInventoryView,
  FinanceCashPostureView,
  FinanceCollectionsPostureView,
  FinanceContractsView,
  FinanceObligationCalendarView,
  FinancePayablesAgingView,
  FinancePayablesPostureView,
  FinanceReceivablesAgingView,
  FinanceSpendItemsView,
  FinanceSpendPostureView,
} from "@pocket-cto/domain";
import type {
  FinanceDiscoveryFamilyDefinition,
  FinanceDiscoveryTwinReadKey,
} from "./family-registry";

export type FinanceDiscoveryTwinReadMap = {
  bankAccounts: FinanceBankAccountInventoryView | null;
  cashPosture: FinanceCashPostureView | null;
  collectionsPosture: FinanceCollectionsPostureView | null;
  contracts: FinanceContractsView | null;
  obligationCalendar: FinanceObligationCalendarView | null;
  payablesAging: FinancePayablesAgingView | null;
  payablesPosture: FinancePayablesPostureView | null;
  receivablesAging: FinanceReceivablesAgingView | null;
  spendItems: FinanceSpendItemsView | null;
  spendPosture: FinanceSpendPostureView | null;
};

export type FinanceDiscoveryRouteState = FinanceDiscoveryFamilyDefinition["relatedRoutes"][number] & {
  routePath: string;
};

export type FinanceDiscoveryTwinReadResult<TKey extends FinanceDiscoveryTwinReadKey> =
  FinanceDiscoveryTwinReadMap[TKey];

export type FinanceDiscoveryAnswerFormatterInput = {
  extraLimitations: string[];
  family: FinanceDiscoveryFamilyDefinition;
  missingWikiPages: CfoWikiPageKey[];
  question: FinanceDiscoveryQuestion;
  relatedRoutes: FinanceDiscoveryRouteState[];
  twinReads: FinanceDiscoveryTwinReadMap;
  wikiPages: CfoWikiPageView[];
};
