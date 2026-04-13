import {
  CfoWikiBindSourceRequestSchema,
  CfoWikiCompileRequestSchema,
  CfoWikiCreateFiledPageRequestSchema,
  CfoWikiExportRequestSchema,
  CfoWikiLintRequestSchema,
  type CfoWikiBindSourceRequest,
  type CfoWikiCompileRequest,
  type CfoWikiCreateFiledPageRequest,
  type CfoWikiExportRequest,
  type CfoWikiLintRequest,
  type CfoWikiPageKey,
  type CfoWikiPageRecord,
} from "@pocket-cto/domain";
import { FinanceCompanyNotFoundError } from "../finance-twin/errors";
import type { FinanceTwinRepository } from "../finance-twin/repository";
import { SourceNotFoundError } from "../sources/errors";
import type { SourceRepository } from "../sources/repository";
import type { SourceFileStorage } from "../sources/storage";
import {
  buildCfoWikiCompanySourceListView,
  buildCfoWikiCompanySummary,
  buildCfoWikiCompileResult,
  buildCfoWikiExportDetailView,
  buildCfoWikiExportListView,
  buildCfoWikiFiledPageListView,
  buildCfoWikiLintSummary,
  buildCfoWikiPageView,
  buildCfoWikiSourceBindingView,
} from "./formatter";
import {
  buildBoundSourceListLimitations,
  loadBoundSourceSummaries,
} from "./bound-sources";
import {
  CfoWikiExportRunNotFoundError,
  CfoWikiPageNotFoundError,
  CfoWikiSourceBindingUnsupportedError,
} from "./errors";
import type { CfoWikiRepository } from "./repository";
import { compileCfoWikiPages } from "./compiler/compile";
import { loadWikiCompileState } from "./compiler/compile-state";
import { buildCfoWikiExportBundle } from "./export-bundle";
import { buildFiledPageInput } from "./filed-pages";
import { emptyLintFindingCounts, lintCfoWikiState } from "./lint";

const DEFAULT_COMPILER_VERSION = "f3c-lint-export-v1";
const DEFAULT_LINTER_VERSION = "f3c-wiki-lint-v1";
const DEFAULT_EXPORTER_VERSION = "f3c-wiki-export-v1";
const MAX_ERROR_SUMMARY_LENGTH = 500;

export class CfoWikiService {
  private readonly compilePages: typeof compileCfoWikiPages;
  private readonly compilerVersion: string;
  private readonly exporterVersion: string;
  private readonly linterVersion: string;
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
        | "getSnapshotById"
        | "getSourceById"
        | "getSourceFileById"
        | "listSnapshotsBySourceId"
        | "listSourceFilesBySourceId"
      >;
      sourceFileStorage: Pick<SourceFileStorage, "read">;
      wikiRepository: CfoWikiRepository;
      now?: () => Date;
      compilerVersion?: string;
      compilePages?: typeof compileCfoWikiPages;
      exporterVersion?: string;
      linterVersion?: string;
    },
  ) {
    this.compilePages = input.compilePages ?? compileCfoWikiPages;
    this.compilerVersion = input.compilerVersion ?? DEFAULT_COMPILER_VERSION;
    this.exporterVersion = input.exporterVersion ?? DEFAULT_EXPORTER_VERSION;
    this.linterVersion = input.linterVersion ?? DEFAULT_LINTER_VERSION;
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
    const existingCompilerPages = existingPages.filter(
      (page) => page.ownershipKind === "compiler_owned",
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
        sourceFileStorage: this.input.sourceFileStorage,
        sourceRepository: this.input.sourceRepository,
        wikiRepository: this.input.wikiRepository,
      });
      const compiledAt = this.now().toISOString();
      const compiled = this.compilePages({
        compiledAt,
        currentRun: {
          id: compileRun.id,
          startedAt: compileRun.startedAt,
          triggeredBy: compileRun.triggeredBy,
        },
        state,
      });
      const changedPageKeys = diffChangedPageKeys(
        existingCompilerPages,
        compiled.pages,
      );
      const persisted = await this.input.wikiRepository.transaction(
        async (session) => {
          await this.input.wikiRepository.upsertDocumentExtracts(
            {
              companyId: company.id,
              extracts: compiled.registry
                .map((entry) => entry.documentSnapshot?.extract ?? null)
                .filter((extract): extract is NonNullable<typeof extract> => extract !== null),
            },
            session,
          );
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

  async runCompanyLint(companyKey: string, input: CfoWikiLintRequest) {
    const request = CfoWikiLintRequestSchema.parse(input);
    const company = await this.requireCompany(companyKey);
    const startedAt = this.now().toISOString();
    const lintRun = await this.input.wikiRepository.startLintRun({
      companyId: company.id,
      companyKey: company.companyKey,
      startedAt,
      triggeredBy: request.triggeredBy,
      linterVersion: this.linterVersion,
    });

    try {
      const pages = await this.input.wikiRepository.listPagesByCompanyId(company.id);
      const [refsByPageId, linksByPageId, backlinksByPageId] =
        await loadPageRelationshipMaps(this.input.wikiRepository, pages);
      const linted = lintCfoWikiState({
        backlinksByPageId,
        linksByPageId,
        pages,
        refsByPageId,
      });
      const completedAt = this.now().toISOString();
      const latestLintRun = await this.input.wikiRepository.transaction(
        async (session) => {
          await this.input.wikiRepository.replaceLintFindings(
            {
              companyId: company.id,
              lintRunId: lintRun.id,
              findings: linted.findings,
            },
            session,
          );

          return this.input.wikiRepository.finishLintRun(
            {
              lintRunId: lintRun.id,
              completedAt,
              status: "succeeded",
              stats: {
                findingCount: linted.findingCount,
                pageCount: pages.length,
              },
              errorSummary: null,
            },
            session,
          );
        },
      );
      const findings = await this.input.wikiRepository.listLintFindingsByRunId(
        latestLintRun.id,
      );

      return buildCfoWikiLintSummary({
        company,
        latestLintRun,
        findingCount: findings.length,
        findingCountsByKind: linted.findingCountsByKind,
        findings,
        limitations: buildLintLimitations({
          findings,
          latestLintRun,
          pageCount: pages.length,
        }),
      });
    } catch (error) {
      await this.markLintFailed(lintRun.id, error);
      throw error;
    }
  }

  async getLatestLint(companyKey: string) {
    const company = await this.requireCompany(companyKey);
    const latestLintRun = await this.input.wikiRepository.getLatestLintRunByCompanyId(
      company.id,
    );
    const findings = latestLintRun
      ? await this.input.wikiRepository.listLintFindingsByRunId(latestLintRun.id)
      : [];

    return buildCfoWikiLintSummary({
      company,
      latestLintRun,
      findingCount: findings.length,
      findingCountsByKind: countLintFindingRecords(findings),
      findings,
      limitations: buildLintLimitations({
        findings,
        latestLintRun,
        pageCount: (
          await this.input.wikiRepository.listPagesByCompanyId(company.id)
        ).length,
      }),
    });
  }

  async exportCompanyWiki(companyKey: string, input: CfoWikiExportRequest) {
    const request = CfoWikiExportRequestSchema.parse(input);
    const company = await this.requireCompany(companyKey);
    const startedAt = this.now().toISOString();
    const bundleRootPath = `${company.companyKey}-cfo-wiki`;
    const exportRun = await this.input.wikiRepository.startExportRun({
      companyId: company.id,
      companyKey: company.companyKey,
      startedAt,
      triggeredBy: request.triggeredBy,
      exporterVersion: this.exporterVersion,
      bundleRootPath,
    });

    try {
      const pages = await this.input.wikiRepository.listPagesByCompanyId(company.id);
      const exportedAt = this.now().toISOString();
      const bundle = buildCfoWikiExportBundle({
        company,
        exportedAt,
        limitations: buildExportLimitations(pages),
        pages,
      });
      const latestExportRun = await this.input.wikiRepository.finishExportRun({
        exportRunId: exportRun.id,
        completedAt: exportedAt,
        status: "succeeded",
        pageCount: bundle.pageCount,
        fileCount: bundle.fileCount,
        manifest: bundle.manifest,
        files: bundle.files,
        errorSummary: null,
      });

      return buildCfoWikiExportDetailView({
        company,
        exportRun: latestExportRun,
        limitations: buildExportLimitations(pages),
      });
    } catch (error) {
      await this.markExportFailed(exportRun.id, error);
      throw error;
    }
  }

  async listCompanyExports(companyKey: string) {
    const company = await this.requireCompany(companyKey);
    const exportRuns = await this.input.wikiRepository.listExportRunsByCompanyId(
      company.id,
    );

    return buildCfoWikiExportListView({
      company,
      exports: exportRuns,
      limitations:
        exportRuns.length === 0
          ? ["No persisted CFO Wiki export runs have been stored for this company yet."]
          : [],
    });
  }

  async getCompanyExport(companyKey: string, exportRunId: string) {
    const company = await this.requireCompany(companyKey);
    const exportRun = await this.input.wikiRepository.getExportRunById(exportRunId);

    if (!exportRun || exportRun.companyId !== company.id) {
      throw new CfoWikiExportRunNotFoundError(companyKey, exportRunId);
    }

    return buildCfoWikiExportDetailView({
      company,
      exportRun,
      limitations: exportRun.errorSummary
        ? [exportRun.errorSummary]
        : buildExportDetailLimitations(exportRun),
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

    const [links, backlinks, refs] = await Promise.all([
      this.input.wikiRepository.listLinksByPageId(page.id),
      this.input.wikiRepository.listBacklinksByPageId(page.id),
      this.input.wikiRepository.listRefsByPageId(page.id),
    ]);
    const latestCompileRun = compileRuns.at(-1) ?? latestSuccessfulCompileRun;

    return buildCfoWikiPageView({
      backlinks,
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

  async bindCompanySource(
    companyKey: string,
    sourceId: string,
    input: CfoWikiBindSourceRequest,
  ) {
    const request = CfoWikiBindSourceRequestSchema.parse(input);
    const company = await this.requireCompany(companyKey);
    const source = await this.input.sourceRepository.getSourceById(sourceId);

    if (!source) {
      throw new SourceNotFoundError(sourceId);
    }

    if (source.kind !== "document") {
      throw new CfoWikiSourceBindingUnsupportedError(source.id, source.kind);
    }

    const binding = await this.input.wikiRepository.upsertSourceBinding({
      companyId: company.id,
      sourceId: source.id,
      includeInCompile: request.includeInCompile,
      documentRole: request.documentRole ?? null,
      boundBy: request.boundBy,
    });
    const sources = await loadBoundSourceSummaries({
      companyId: company.id,
      sourceRepository: this.input.sourceRepository,
      wikiRepository: this.input.wikiRepository,
    });
    const summary = sources.find((candidate) => candidate.binding.id === binding.id);

    if (!summary) {
      throw new Error(`Missing bound-source summary for binding ${binding.id}`);
    }

    return buildCfoWikiSourceBindingView({
      binding,
      company,
      latestExtract: summary.latestExtract,
      latestSnapshot: summary.latestSnapshot,
      latestSourceFile: summary.latestSourceFile,
      limitations: summary.limitations,
      source: summary.source,
    });
  }

  async listCompanySources(companyKey: string) {
    const company = await this.requireCompany(companyKey);
    const sources = await loadBoundSourceSummaries({
      companyId: company.id,
      sourceRepository: this.input.sourceRepository,
      wikiRepository: this.input.wikiRepository,
    });

    return buildCfoWikiCompanySourceListView({
      company,
      limitations: buildBoundSourceListLimitations(sources.length),
      sources,
    });
  }

  async createFiledPage(
    companyKey: string,
    input: CfoWikiCreateFiledPageRequest,
  ) {
    const request = CfoWikiCreateFiledPageRequestSchema.parse(input);
    const company = await this.requireCompany(companyKey);
    const existingPages = await this.input.wikiRepository.listPagesByCompanyId(
      company.id,
    );
    const filedAt = this.now().toISOString();
    const page = buildFiledPageInput({
      existingPages,
      filedAt,
      request,
    });
    const created = await this.input.wikiRepository.createFiledPage({
      companyId: company.id,
      page,
    });

    return this.getPage(companyKey, created.pageKey);
  }

  async listFiledPages(companyKey: string) {
    const company = await this.requireCompany(companyKey);
    const pages = (
      await this.input.wikiRepository.listPagesByCompanyId(company.id)
    ).filter((page) => page.ownershipKind === "filed_artifact");

    return buildCfoWikiFiledPageListView({
      company,
      pages,
      limitations:
        pages.length === 0
          ? ["No filed artifact pages have been stored for this company yet."]
          : [
              "Filed artifact pages are durable operator-filed markdown and remain separate from compiler-owned wiki pages.",
            ],
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

  private async markLintFailed(lintRunId: string, error: unknown) {
    try {
      await this.input.wikiRepository.finishLintRun({
        lintRunId,
        completedAt: this.now().toISOString(),
        status: "failed",
        stats: {},
        errorSummary: truncateErrorSummary(error),
      });
    } catch {
      // Preserve the original lint error when failure bookkeeping also fails.
    }
  }

  private async markExportFailed(exportRunId: string, error: unknown) {
    try {
      await this.input.wikiRepository.finishExportRun({
        exportRunId,
        completedAt: this.now().toISOString(),
        status: "failed",
        pageCount: 0,
        fileCount: 0,
        manifest: null,
        files: [],
        errorSummary: truncateErrorSummary(error),
      });
    } catch {
      // Preserve the original export error when failure bookkeeping also fails.
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

async function loadPageRelationshipMaps(
  wikiRepository: Pick<
    CfoWikiRepository,
    "listBacklinksByPageId" | "listLinksByPageId" | "listRefsByPageId"
  >,
  pages: CfoWikiPageRecord[],
) {
  const refsByPageId = new Map<string, Awaited<ReturnType<typeof wikiRepository.listRefsByPageId>>[number][]>();
  const linksByPageId = new Map<string, Awaited<ReturnType<typeof wikiRepository.listLinksByPageId>>[number][]>();
  const backlinksByPageId = new Map<string, Awaited<ReturnType<typeof wikiRepository.listBacklinksByPageId>>[number][]>();

  await Promise.all(
    pages.map(async (page) => {
      const [refs, links, backlinks] = await Promise.all([
        wikiRepository.listRefsByPageId(page.id),
        wikiRepository.listLinksByPageId(page.id),
        wikiRepository.listBacklinksByPageId(page.id),
      ]);
      refsByPageId.set(page.id, refs);
      linksByPageId.set(page.id, links);
      backlinksByPageId.set(page.id, backlinks);
    }),
  );

  return [refsByPageId, linksByPageId, backlinksByPageId] as const;
}

function countLintFindingRecords(
  findings: Array<{
    findingKind: keyof ReturnType<typeof emptyLintFindingCounts>;
  }>,
) {
  return findings.reduce(
    (counts, finding) => {
      counts[finding.findingKind] += 1;
      return counts;
    },
    emptyLintFindingCounts(),
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

function buildLintLimitations(input: {
  findings: Array<{ findingKind: string }>;
  latestLintRun: { errorSummary: string | null; status: string } | null;
  pageCount: number;
}) {
  const limitations: string[] = [];

  if (input.pageCount === 0) {
    limitations.push(
      "No persisted CFO Wiki pages exist for this company yet, so lint can only confirm empty stored wiki state.",
    );
  }

  if (!input.latestLintRun) {
    limitations.push(
      "No persisted CFO Wiki lint run has been stored for this company yet.",
    );
  }

  if (input.latestLintRun?.status === "failed" && input.latestLintRun.errorSummary) {
    limitations.push(input.latestLintRun.errorSummary);
  }

  if (input.findings.length === 0 && input.latestLintRun?.status === "succeeded") {
    limitations.push(
      "No deterministic lint findings were produced for the current stored wiki state.",
    );
  }

  return [...new Set(limitations)];
}

function buildExportLimitations(pages: CfoWikiPageRecord[]) {
  const limitations = [
    "CFO Wiki export is deterministic and markdown-first in this F3C slice; it does not add search indexes, vector indexes, or external vault sync.",
  ];

  if (pages.length === 0) {
    limitations.push(
      "No persisted CFO Wiki pages exist for this company yet, so the export bundle contains only a manifest.",
    );
  }

  if (pages.some((page) => page.ownershipKind === "filed_artifact")) {
    limitations.push(
      "Filed artifact pages are exported alongside compiler-owned pages but remain explicit separate ownership kinds in the manifest.",
    );
  }

  return limitations;
}

function buildExportDetailLimitations(input: { files: Array<{ body: string }>; manifest: unknown }) {
  const limitations = [
    "Export detail returns the deterministic markdown bundle persisted for this run; it does not imply any external sync beyond this stored export record.",
  ];

  if (input.files.length === 0 || input.manifest === null) {
    limitations.push(
      "This export run does not include a persisted bundle payload.",
    );
  }

  return limitations;
}

function truncateErrorSummary(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return message.slice(0, MAX_ERROR_SUMMARY_LENGTH);
}
