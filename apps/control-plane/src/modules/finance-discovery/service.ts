import type {
  CfoWikiPageKey,
  CfoWikiPageView,
  FinanceDiscoveryQuestion,
} from "@pocket-cto/domain";
import { FinanceDiscoveryQuestionSchema } from "@pocket-cto/domain";
import { FinanceCompanyNotFoundError } from "../finance-twin/errors";
import type { FinanceTwinService } from "../finance-twin/service";
import { CfoWikiPageNotFoundError } from "../wiki/errors";
import type { CfoWikiService } from "../wiki/service";
import { buildFinanceDiscoveryAnswerMetadata } from "./formatter";
import {
  getFinanceDiscoveryFamily,
  type FinanceDiscoveryTwinReadKey,
} from "./family-registry";
import type { FinanceDiscoveryTwinReadMap } from "./types";

const EMPTY_TWIN_READS: FinanceDiscoveryTwinReadMap = {
  bankAccounts: null,
  cashPosture: null,
  collectionsPosture: null,
  contracts: null,
  obligationCalendar: null,
  payablesAging: null,
  payablesPosture: null,
  receivablesAging: null,
  spendItems: null,
  spendPosture: null,
};

const TWIN_READ_LABELS: Record<FinanceDiscoveryTwinReadKey, string> = {
  bankAccounts: "bank-account inventory",
  cashPosture: "cash-posture state",
  collectionsPosture: "collections-posture state",
  contracts: "contract inventory",
  obligationCalendar: "obligation-calendar state",
  payablesAging: "payables-aging inventory",
  payablesPosture: "payables-posture state",
  receivablesAging: "receivables-aging inventory",
  spendItems: "spend-item inventory",
  spendPosture: "spend-posture state",
};

export class FinanceDiscoveryService {
  constructor(
    private readonly deps: {
      cfoWikiService: Pick<CfoWikiService, "getPage">;
      financeTwinService: Pick<
        FinanceTwinService,
        | "getBankAccounts"
        | "getCashPosture"
        | "getCollectionsPosture"
        | "getContracts"
        | "getObligationCalendar"
        | "getPayablesAging"
        | "getPayablesPosture"
        | "getReceivablesAging"
        | "getSpendItems"
        | "getSpendPosture"
      >;
    },
  ) {}

  async answerQuestion(rawQuestion: FinanceDiscoveryQuestion) {
    const question = FinanceDiscoveryQuestionSchema.parse(rawQuestion);
    const family = getFinanceDiscoveryFamily(question.questionKind);
    const extraLimitations: string[] = [];
    const twinReads = await this.readTwinState(question, family.relatedRoutes, extraLimitations);
    const { missingWikiPages, wikiPages } = await this.readWikiPages({
      companyKey: question.companyKey,
      displayLabel: family.displayLabel,
      extraLimitations,
      pageKeys: family.relatedWikiPageKeys,
    });

    return buildFinanceDiscoveryAnswerMetadata({
      extraLimitations,
      family,
      missingWikiPages,
      question,
      relatedRoutes: family.relatedRoutes.map((route) => ({
        ...route,
        routePath: buildRoutePath(question.companyKey, route.routePathSuffix),
      })),
      twinReads,
      wikiPages,
    });
  }

  private async readTwinState(
    question: FinanceDiscoveryQuestion,
    routes: ReadonlyArray<{ readKey: FinanceDiscoveryTwinReadKey }>,
    extraLimitations: string[],
  ) {
    const uniqueReadKeys = Array.from(new Set(routes.map((route) => route.readKey)));
    const entries = await Promise.all(
      uniqueReadKeys.map(async (readKey) => [
        readKey,
        await this.readTwinResult(readKey, question.companyKey, extraLimitations),
      ] as const),
    );

    return entries.reduce(
      (state, [readKey, result]) => ({
        ...state,
        [readKey]: result,
      }),
      EMPTY_TWIN_READS,
    );
  }

  private async readTwinResult(
    readKey: FinanceDiscoveryTwinReadKey,
    companyKey: string,
    extraLimitations: string[],
  ) {
    try {
      switch (readKey) {
        case "bankAccounts":
          return await this.deps.financeTwinService.getBankAccounts(companyKey);
        case "cashPosture":
          return await this.deps.financeTwinService.getCashPosture(companyKey);
        case "collectionsPosture":
          return await this.deps.financeTwinService.getCollectionsPosture(companyKey);
        case "contracts":
          return await this.deps.financeTwinService.getContracts(companyKey);
        case "obligationCalendar":
          return await this.deps.financeTwinService.getObligationCalendar(companyKey);
        case "payablesAging":
          return await this.deps.financeTwinService.getPayablesAging(companyKey);
        case "payablesPosture":
          return await this.deps.financeTwinService.getPayablesPosture(companyKey);
        case "receivablesAging":
          return await this.deps.financeTwinService.getReceivablesAging(companyKey);
        case "spendItems":
          return await this.deps.financeTwinService.getSpendItems(companyKey);
        case "spendPosture":
          return await this.deps.financeTwinService.getSpendPosture(companyKey);
      }
    } catch (error) {
      if (error instanceof FinanceCompanyNotFoundError) {
        extraLimitations.push(
          `Finance Twin company ${companyKey} does not exist yet, so no stored ${TWIN_READ_LABELS[readKey]} could be read.`,
        );
        return null;
      }

      throw error;
    }
  }

  private async readWikiPages(input: {
    companyKey: string;
    displayLabel: string;
    extraLimitations: string[];
    pageKeys: readonly CfoWikiPageKey[];
  }): Promise<{
    missingWikiPages: CfoWikiPageKey[];
    wikiPages: CfoWikiPageView[];
  }> {
    const results = await Promise.all(
      input.pageKeys.map(async (pageKey) => {
        try {
          const page = await this.deps.cfoWikiService.getPage(
            input.companyKey,
            pageKey,
          );
          return {
            kind: "page" as const,
            page,
          };
        } catch (error) {
          if (
            error instanceof CfoWikiPageNotFoundError ||
            error instanceof FinanceCompanyNotFoundError
          ) {
            return {
              kind: "missing" as const,
              pageKey,
            };
          }

          throw error;
        }
      }),
    );

    const wikiPages = results.flatMap((result) =>
      result.kind === "page" ? [result.page] : [],
    );
    const missingWikiPages = results.flatMap((result) =>
      result.kind === "missing" ? [result.pageKey] : [],
    );

    if (missingWikiPages.length > 0) {
      input.extraLimitations.push(
        `CFO Wiki coverage is partial for ${input.companyKey}; one or more expected ${input.displayLabel} pages are not available yet.`,
      );
    }

    return {
      missingWikiPages,
      wikiPages,
    };
  }
}

function buildRoutePath(companyKey: string, routePathSuffix: string) {
  return `/finance-twin/companies/${companyKey}/${routePathSuffix}`;
}
