import {
  CfoWikiCompileRequestSchema,
  type CfoWikiCompileRequest,
  type CfoWikiPageKey,
  type CfoWikiPageRecord,
} from "@pocket-cto/domain";
import { FinanceCompanyNotFoundError } from "../finance-twin/errors";
import type { FinanceTwinRepository } from "../finance-twin/repository";
import type { SourceRepository } from "../sources/repository";
import { buildCfoWikiCompanySummary, buildCfoWikiCompileResult, buildCfoWikiPageView } from "./formatter";
import { CfoWikiPageNotFoundError } from "./errors";
import type { CfoWikiRepository } from "./repository";
import { compileCfoWikiFoundation } from "./compiler/compile";
import { loadWikiCompileState } from "./compiler/compile-state";

const DEFAULT_COMPILER_VERSION = "f3a-foundation-v1";
const MAX_ERROR_SUMMARY_LENGTH = 500;

export class CfoWikiService {
  private readonly compileFoundation: typeof compileCfoWikiFoundation;
  private readonly compilerVersion: string;
  private readonly now: () => Date;

  constructor(
    private readonly input: {
      financeTwinRepository: Pick<
        FinanceTwinRepository,
        | "countLedgerAccountsByCompanyId"
        | "countReportingPeriodsByCompanyId"
        | "getCompanyByKey"
        | "getLatestSuccessfulSyncRunByCompanyIdAndExtractorKey"
        | "getLatestSyncRunByCompanyIdAndExtractorKey"
        | "getReportingPeriodById"
        | "listReportingPeriodsByCompanyId"
      >;
      sourceRepository: Pick<
        SourceRepository,
        "getSnapshotById" | "getSourceById" | "getSourceFileById"
      >;
      wikiRepository: CfoWikiRepository;
      now?: () => Date;
      compilerVersion?: string;
      compileFoundation?: typeof compileCfoWikiFoundation;
    },
  ) {
    this.compileFoundation = input.compileFoundation ?? compileCfoWikiFoundation;
    this.compilerVersion = input.compilerVersion ?? DEFAULT_COMPILER_VERSION;
    this.now = input.now ?? (() => new Date());
  }

  async compileCompanyWiki(
    companyKey: string,
    input: CfoWikiCompileRequest,
  ) {
    const request = CfoWikiCompileRequestSchema.parse(input);
    const company = await this.requireCompany(companyKey);
    const existingPages = await this.input.wikiRepository.listPagesByCompanyId(
      company.id,
    );
    const startedAt = this.now().toISOString();
    const compileRun = await this.input.wikiRepository.startCompileRun({
      companyId: company.id,
      companyKey: company.companyKey,
      startedAt,
      triggeredBy: request.triggeredBy,
      triggerKind: "manual",
      compilerVersion: this.compilerVersion,
    });

    try {
      const priorRuns = await this.input.wikiRepository.listCompileRunsByCompanyId(
        company.id,
      );
      const state = await loadWikiCompileState({
        company,
        financeTwinRepository: this.input.financeTwinRepository,
        now: this.now(),
        priorCompletedRuns: priorRuns.filter(
          (run) => run.id !== compileRun.id && run.status !== "running",
        ),
        sourceRepository: this.input.sourceRepository,
      });
      const compiledAt = this.now().toISOString();
      const compiled = this.compileFoundation({
        compiledAt,
        currentRun: {
          id: compileRun.id,
          startedAt: compileRun.startedAt,
          triggeredBy: compileRun.triggeredBy,
        },
        state,
      });
      const changedPageKeys = diffChangedPageKeys(existingPages, compiled.pages);
      const persisted = await this.input.wikiRepository.transaction(
        async (session) => {
          const pages = await this.input.wikiRepository.replaceCompiledState(
            {
              companyId: company.id,
              compileRunId: compileRun.id,
              pages: compiled.pages,
              links: compiled.links,
              refs: compiled.refs,
            },
            session,
          );
          const finishedRun = await this.input.wikiRepository.finishCompileRun(
            {
              compileRunId: compileRun.id,
              completedAt: compiledAt,
              status: "succeeded",
              stats: compiled.stats,
              errorSummary: null,
            },
            session,
          );

          return {
            finishedRun,
            pages,
          };
        },
      );

      return buildCfoWikiCompileResult({
        changedPageKeys,
        company,
        compileRun: persisted.finishedRun,
        freshnessSummary: compiled.freshnessSummary,
        limitations: compiled.limitations,
        pages: persisted.pages,
      });
    } catch (error) {
      await this.markCompileFailed(compileRun.id, error);
      throw error;
    }
  }

  async getCompanySummary(companyKey: string) {
    const company = await this.requireCompany(companyKey);
    const [pages, latestSuccessfulCompileRun, compileRuns] = await Promise.all([
      this.input.wikiRepository.listPagesByCompanyId(company.id),
      this.input.wikiRepository.getLatestSuccessfulCompileRunByCompanyId(
        company.id,
      ),
      this.input.wikiRepository.listCompileRunsByCompanyId(company.id),
    ]);
    const latestCompileRun = compileRuns.at(-1) ?? null;

    return buildCfoWikiCompanySummary({
      company,
      freshnessSummary: pages.find((page) => page.pageKey === "index")
        ?.freshnessSummary ?? null,
      latestSuccessfulCompileRun,
      limitations: buildReadLimitations({
        latestCompileRun,
        latestSuccessfulCompileRun,
        pageLimitations: pages.flatMap((page) => page.limitations),
        pages,
      }),
      pages,
    });
  }

  async getIndexPage(companyKey: string) {
    return this.getPage(companyKey, "index");
  }

  async getLogPage(companyKey: string) {
    return this.getPage(companyKey, "log");
  }

  async getPage(companyKey: string, pageKey: CfoWikiPageKey) {
    const company = await this.requireCompany(companyKey);
    const [page, pages, latestSuccessfulCompileRun, compileRuns] =
      await Promise.all([
        this.input.wikiRepository.getPageByCompanyIdAndPageKey(
          company.id,
          pageKey,
        ),
        this.input.wikiRepository.listPagesByCompanyId(company.id),
        this.input.wikiRepository.getLatestSuccessfulCompileRunByCompanyId(
          company.id,
        ),
        this.input.wikiRepository.listCompileRunsByCompanyId(company.id),
      ]);

    if (!page) {
      throw new CfoWikiPageNotFoundError(companyKey, pageKey);
    }

    const [links, refs] = await Promise.all([
      this.input.wikiRepository.listLinksByPageId(page.id),
      this.input.wikiRepository.listRefsByPageId(page.id),
    ]);
    const latestCompileRun = compileRuns.at(-1) ?? latestSuccessfulCompileRun;

    return buildCfoWikiPageView({
      company,
      freshnessSummary: page.freshnessSummary,
      latestCompileRun,
      limitations: buildReadLimitations({
        latestCompileRun,
        latestSuccessfulCompileRun,
        pageLimitations: page.limitations,
        pages,
      }),
      links,
      page,
      pages,
      refs,
    });
  }

  private async requireCompany(companyKey: string) {
    const company = await this.input.financeTwinRepository.getCompanyByKey(
      companyKey,
    );

    if (!company) {
      throw new FinanceCompanyNotFoundError(companyKey);
    }

    return company;
  }

  private async markCompileFailed(compileRunId: string, error: unknown) {
    try {
      await this.input.wikiRepository.finishCompileRun({
        compileRunId,
        completedAt: this.now().toISOString(),
        status: "failed",
        stats: {},
        errorSummary: truncateErrorSummary(error),
      });
    } catch {
      // Preserve the original compile error when failure bookkeeping also fails.
    }
  }
}

function diffChangedPageKeys(
  existingPages: CfoWikiPageRecord[],
  nextPages: Array<
    Pick<
      CfoWikiPageRecord,
      | "freshnessSummary"
      | "limitations"
      | "markdownBody"
      | "pageKey"
      | "summary"
      | "temporalStatus"
      | "title"
    >
  >,
) {
  const existingByKey = new Map(
    existingPages.map((page) => [page.pageKey, page] as const),
  );

  return nextPages
    .filter((page) => hasPageChanged(existingByKey.get(page.pageKey), page))
    .map((page) => page.pageKey);
}

function hasPageChanged(
  existing: CfoWikiPageRecord | undefined,
  next: Pick<
    CfoWikiPageRecord,
    | "freshnessSummary"
    | "limitations"
    | "markdownBody"
    | "summary"
    | "temporalStatus"
    | "title"
  >,
) {
  if (!existing) {
    return true;
  }

  return (
    existing.title !== next.title ||
    existing.summary !== next.summary ||
    existing.markdownBody !== next.markdownBody ||
    existing.temporalStatus !== next.temporalStatus ||
    JSON.stringify(existing.freshnessSummary) !==
      JSON.stringify(next.freshnessSummary) ||
    JSON.stringify(existing.limitations) !== JSON.stringify(next.limitations)
  );
}

function buildReadLimitations(input: {
  latestCompileRun: { completedAt: string | null; errorSummary: string | null; id: string; status: string } | null;
  latestSuccessfulCompileRun: { completedAt: string | null; id: string } | null;
  pageLimitations: string[];
  pages: CfoWikiPageRecord[];
}) {
  const limitations = [...input.pageLimitations];

  if (input.pages.length === 0) {
    limitations.push(
      "No successful CFO Wiki compile has been stored for this company yet.",
    );
  }

  if (
    input.latestCompileRun?.status === "failed" &&
    input.latestCompileRun.id !== input.latestSuccessfulCompileRun?.id
  ) {
    limitations.push(
      `The latest CFO Wiki compile failed${input.latestCompileRun.completedAt ? ` at ${input.latestCompileRun.completedAt}` : ""}, so current pages still reflect the last successful compile.${input.latestCompileRun.errorSummary ? ` Error summary: ${input.latestCompileRun.errorSummary}` : ""}`,
    );
  }

  return [...new Set(limitations)];
}

function truncateErrorSummary(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return message.slice(0, MAX_ERROR_SUMMARY_LENGTH);
}
