import {
  buildCfoWikiMarkdownPath,
  CfoWikiCompanySourceListViewSchema,
  CfoWikiCompanySummarySchema,
  CfoWikiCompileResultSchema,
  CfoWikiExportDetailViewSchema,
  CfoWikiExportListViewSchema,
  CfoWikiFiledPageListViewSchema,
  CfoWikiLintSummarySchema,
  CfoWikiPageViewSchema,
  CfoWikiSourceBindingViewSchema,
  type CfoWikiCompileRunRecord,
  type CfoWikiDocumentExtractRecord,
  type CfoWikiExportRunRecord,
  type CfoWikiFreshnessSummary,
  type CfoWikiLintFindingCounts,
  type CfoWikiLintFindingRecord,
  type CfoWikiLintRunRecord,
  type CfoWikiPageKindCounts,
  type CfoWikiPageLinkRecord,
  type CfoWikiPageRecord,
  type CfoWikiPageRefRecord,
  type CfoWikiSourceBindingRecord,
  type FinanceCompanyRecord,
  type SourceFileRecord,
  type SourceRecord,
  type SourceSnapshotRecord,
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
  backlinks: CfoWikiPageLinkRecord[];
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
    backlinks: input.backlinks.map((link) => {
      const source = pagesById.get(link.fromPageId);

      if (!source) {
        throw new Error(
          `CFO Wiki page backlink ${link.id} points from missing page ${link.fromPageId}`,
        );
      }

      return {
        ...link,
        fromPageKey: source.pageKey,
        fromMarkdownPath: buildCfoWikiMarkdownPath(source.pageKey),
        fromTitle: source.title,
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
    source_digest: 0,
    filed_artifact: 0,
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

export function buildCfoWikiSourceBindingView(input: {
  binding: CfoWikiSourceBindingRecord;
  company: FinanceCompanyRecord;
  latestExtract: CfoWikiDocumentExtractRecord | null;
  latestSnapshot: SourceSnapshotRecord | null;
  latestSourceFile: SourceFileRecord | null;
  limitations: string[];
  source: SourceRecord;
}) {
  return CfoWikiSourceBindingViewSchema.parse({
    companyId: input.company.id,
    companyKey: input.company.companyKey,
    companyDisplayName: input.company.displayName,
    source: {
      binding: input.binding,
      source: input.source,
      latestSnapshot: input.latestSnapshot,
      latestSourceFile: input.latestSourceFile,
      latestExtract: input.latestExtract,
      limitations: input.limitations,
    },
  });
}

export function buildCfoWikiCompanySourceListView(input: {
  company: FinanceCompanyRecord;
  limitations: string[];
  sources: Array<{
    binding: CfoWikiSourceBindingRecord;
    latestExtract: CfoWikiDocumentExtractRecord | null;
    latestSnapshot: SourceSnapshotRecord | null;
    latestSourceFile: SourceFileRecord | null;
    limitations: string[];
    source: SourceRecord;
  }>;
}) {
  return CfoWikiCompanySourceListViewSchema.parse({
    companyId: input.company.id,
    companyKey: input.company.companyKey,
    companyDisplayName: input.company.displayName,
    sourceCount: input.sources.length,
    sources: input.sources,
    limitations: input.limitations,
  });
}

export function buildCfoWikiLintSummary(input: {
  company: FinanceCompanyRecord;
  findingCount: number;
  findingCountsByKind: CfoWikiLintFindingCounts;
  findings: CfoWikiLintFindingRecord[];
  latestLintRun: CfoWikiLintRunRecord | null;
  limitations: string[];
}) {
  return CfoWikiLintSummarySchema.parse({
    companyId: input.company.id,
    companyKey: input.company.companyKey,
    companyDisplayName: input.company.displayName,
    latestLintRun: input.latestLintRun,
    findingCount: input.findingCount,
    findingCountsByKind: input.findingCountsByKind,
    findings: input.findings,
    limitations: input.limitations,
  });
}

export function buildCfoWikiExportListView(input: {
  company: FinanceCompanyRecord;
  exports: CfoWikiExportRunRecord[];
  limitations: string[];
}) {
  return CfoWikiExportListViewSchema.parse({
    companyId: input.company.id,
    companyKey: input.company.companyKey,
    companyDisplayName: input.company.displayName,
    exportCount: input.exports.length,
    exports: input.exports,
    limitations: input.limitations,
  });
}

export function buildCfoWikiExportDetailView(input: {
  company: FinanceCompanyRecord;
  exportRun: CfoWikiExportRunRecord;
  limitations: string[];
}) {
  return CfoWikiExportDetailViewSchema.parse({
    companyId: input.company.id,
    companyKey: input.company.companyKey,
    companyDisplayName: input.company.displayName,
    exportRun: input.exportRun,
    limitations: input.limitations,
  });
}

export function buildCfoWikiFiledPageListView(input: {
  company: FinanceCompanyRecord;
  limitations: string[];
  pages: CfoWikiPageRecord[];
}) {
  return CfoWikiFiledPageListViewSchema.parse({
    companyId: input.company.id,
    companyKey: input.company.companyKey,
    companyDisplayName: input.company.displayName,
    pageCount: input.pages.length,
    pages: buildPageInventory(input.pages),
    limitations: input.limitations,
  });
}
