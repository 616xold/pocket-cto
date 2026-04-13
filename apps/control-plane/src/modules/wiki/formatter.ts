import {
  buildCfoWikiMarkdownPath,
  CfoWikiCompanySummarySchema,
  CfoWikiCompileResultSchema,
  CfoWikiPageViewSchema,
  type CfoWikiCompileRunRecord,
  type CfoWikiFreshnessSummary,
  type CfoWikiPageKindCounts,
  type CfoWikiPageLinkRecord,
  type CfoWikiPageRecord,
  type CfoWikiPageRefRecord,
  type FinanceCompanyRecord,
} from "@pocket-cto/domain";

export function buildCfoWikiCompanySummary(input: {
  company: FinanceCompanyRecord;
  freshnessSummary: CfoWikiFreshnessSummary | null;
  latestSuccessfulCompileRun: CfoWikiCompileRunRecord | null;
  limitations: string[];
  pages: CfoWikiPageRecord[];
}) {
  return CfoWikiCompanySummarySchema.parse({
    companyId: input.company.id,
    companyKey: input.company.companyKey,
    companyDisplayName: input.company.displayName,
    latestSuccessfulCompileRun: input.latestSuccessfulCompileRun,
    pageCount: input.pages.length,
    pageCountsByKind: buildPageKindCounts(input.pages),
    pages: buildPageInventory(input.pages),
    freshnessSummary: input.freshnessSummary,
    limitations: input.limitations,
  });
}

export function buildCfoWikiPageView(input: {
  company: FinanceCompanyRecord;
  freshnessSummary: CfoWikiFreshnessSummary;
  latestCompileRun: CfoWikiCompileRunRecord | null;
  limitations: string[];
  links: CfoWikiPageLinkRecord[];
  page: CfoWikiPageRecord;
  pages: CfoWikiPageRecord[];
  refs: CfoWikiPageRefRecord[];
}) {
  const pagesById = new Map(input.pages.map((page) => [page.id, page] as const));

  return CfoWikiPageViewSchema.parse({
    companyId: input.company.id,
    companyKey: input.company.companyKey,
    companyDisplayName: input.company.displayName,
    page: {
      ...input.page,
      markdownPath: buildCfoWikiMarkdownPath(input.page.pageKey),
    },
    links: input.links.map((link) => {
      const target = pagesById.get(link.toPageId);

      if (!target) {
        throw new Error(
          `CFO Wiki page link ${link.id} points to missing page ${link.toPageId}`,
        );
      }

      return {
        ...link,
        toPageKey: target.pageKey,
        toMarkdownPath: buildCfoWikiMarkdownPath(target.pageKey),
        toTitle: target.title,
      };
    }),
    refs: input.refs,
    latestCompileRun: input.latestCompileRun,
    freshnessSummary: input.freshnessSummary,
    limitations: input.limitations,
  });
}

export function buildCfoWikiCompileResult(input: {
  changedPageKeys: string[];
  company: FinanceCompanyRecord;
  compileRun: CfoWikiCompileRunRecord;
  freshnessSummary: CfoWikiFreshnessSummary;
  limitations: string[];
  pages: CfoWikiPageRecord[];
}) {
  return CfoWikiCompileResultSchema.parse({
    companyId: input.company.id,
    companyKey: input.company.companyKey,
    companyDisplayName: input.company.displayName,
    compileRun: input.compileRun,
    changedPageKeys: input.changedPageKeys,
    pageInventory: buildPageInventory(input.pages),
    pageCount: input.pages.length,
    pageCountsByKind: buildPageKindCounts(input.pages),
    freshnessSummary: input.freshnessSummary,
    limitations: input.limitations,
  });
}

export function buildPageKindCounts(
  pages: Array<Pick<CfoWikiPageRecord, "pageKind">>,
) {
  const counts: CfoWikiPageKindCounts = {
    index: 0,
    log: 0,
    company_overview: 0,
    period_index: 0,
    source_coverage: 0,
  };

  for (const page of pages) {
    counts[page.pageKind] += 1;
  }

  return counts;
}

export function buildPageInventory(pages: CfoWikiPageRecord[]) {
  return pages.map((page) => ({
    pageKey: page.pageKey,
    markdownPath: buildCfoWikiMarkdownPath(page.pageKey),
    pageKind: page.pageKind,
    temporalStatus: page.temporalStatus,
    title: page.title,
    summary: page.summary,
    freshnessSummary: page.freshnessSummary,
    limitations: page.limitations,
    lastCompiledAt: page.lastCompiledAt,
  }));
}
