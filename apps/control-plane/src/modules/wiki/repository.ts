import type {
  CfoWikiDocumentExtractRecord,
  CfoWikiDocumentExtractStatus,
  CfoWikiDocumentKind,
  CfoWikiDocumentRole,
  CfoWikiExcerptBlock,
  CfoWikiCompileRunRecord,
  CfoWikiCompileRunStatus,
  CfoWikiCompileTriggerKind,
  CfoWikiCompileRunStats,
  CfoWikiExportFile,
  CfoWikiExportManifest,
  CfoWikiExportRunRecord,
  CfoWikiExportRunStatus,
  CfoWikiFiledArtifactMetadata,
  CfoWikiFreshnessSummary,
  CfoWikiHeadingOutlineEntry,
  CfoWikiLinkKind,
  CfoWikiLintFindingKind,
  CfoWikiLintFindingRecord,
  CfoWikiLintRunRecord,
  CfoWikiLintRunStatus,
  CfoWikiPageKind,
  CfoWikiPageLinkRecord,
  CfoWikiPageOwnershipKind,
  CfoWikiPageRecord,
  CfoWikiPageRefRecord,
  CfoWikiPageTemporalStatus,
  CfoWikiRefKind,
  CfoWikiRefTargetKind,
  CfoWikiSourceBindingRecord,
} from "@pocket-cto/domain";
import {
  createMemorySession,
  type PersistenceSession,
  type TransactionalRepository,
} from "../../lib/persistence";
import { CfoWikiCompileAlreadyRunningError } from "./errors";

export type StartCfoWikiCompileRunInput = {
  companyId: string;
  companyKey: string;
  startedAt: string;
  triggeredBy: string;
  triggerKind: CfoWikiCompileTriggerKind;
  compilerVersion: string;
};

export type FinishCfoWikiCompileRunInput = {
  compileRunId: string;
  completedAt: string;
  status: CfoWikiCompileRunStatus;
  stats: CfoWikiCompileRunStats;
  errorSummary: string | null;
};

export type PersistCfoWikiPageInput = {
  pageKey: string;
  pageKind: CfoWikiPageKind;
  ownershipKind: CfoWikiPageOwnershipKind;
  temporalStatus: CfoWikiPageTemporalStatus;
  title: string;
  summary: string;
  markdownBody: string;
  freshnessSummary: CfoWikiFreshnessSummary;
  limitations: string[];
  lastCompiledAt: string;
  filedMetadata?: CfoWikiFiledArtifactMetadata | null;
};

export type PersistCfoWikiPageLinkInput = {
  fromPageKey: string;
  toPageKey: string;
  linkKind: CfoWikiLinkKind;
  label: string;
};

export type PersistCfoWikiPageRefInput = {
  pageKey: string;
  refKind: CfoWikiRefKind;
  targetKind: CfoWikiRefTargetKind;
  targetId: string;
  label: string;
  locator: string | null;
  excerpt: string | null;
  notes: string | null;
};

export type UpsertCfoWikiSourceBindingInput = {
  companyId: string;
  sourceId: string;
  includeInCompile: boolean;
  documentRole: CfoWikiDocumentRole | null;
  boundBy: string;
};

export type PersistCfoWikiDocumentExtractInput = {
  sourceId: string;
  sourceSnapshotId: string;
  sourceFileId: string | null;
  extractStatus: CfoWikiDocumentExtractStatus;
  documentKind: CfoWikiDocumentKind;
  title: string | null;
  headingOutline: CfoWikiHeadingOutlineEntry[];
  excerptBlocks: CfoWikiExcerptBlock[];
  extractedText: string | null;
  renderedMarkdown: string | null;
  warnings: string[];
  errorSummary: string | null;
  parserVersion: string;
  inputChecksumSha256: string;
  extractedAt: string;
};

export type StartCfoWikiLintRunInput = {
  companyId: string;
  companyKey: string;
  startedAt: string;
  triggeredBy: string;
  linterVersion: string;
};

export type FinishCfoWikiLintRunInput = {
  lintRunId: string;
  completedAt: string;
  status: CfoWikiLintRunStatus;
  stats: CfoWikiCompileRunStats;
  errorSummary: string | null;
};

export type PersistCfoWikiLintFindingInput = {
  pageId: string | null;
  pageKey: string | null;
  pageTitle: string | null;
  findingKind: CfoWikiLintFindingKind;
  message: string;
  details: Record<string, unknown>;
};

export type StartCfoWikiExportRunInput = {
  companyId: string;
  companyKey: string;
  startedAt: string;
  triggeredBy: string;
  exporterVersion: string;
  bundleRootPath: string;
};

export type FinishCfoWikiExportRunInput = {
  exportRunId: string;
  completedAt: string;
  status: CfoWikiExportRunStatus;
  pageCount: number;
  fileCount: number;
  manifest: CfoWikiExportManifest | null;
  files: CfoWikiExportFile[];
  errorSummary: string | null;
};

export interface CfoWikiRepository extends TransactionalRepository {
  startCompileRun(
    input: StartCfoWikiCompileRunInput,
    session?: PersistenceSession,
  ): Promise<CfoWikiCompileRunRecord>;
  finishCompileRun(
    input: FinishCfoWikiCompileRunInput,
    session?: PersistenceSession,
  ): Promise<CfoWikiCompileRunRecord>;
  getCompileRunById(
    compileRunId: string,
    session?: PersistenceSession,
  ): Promise<CfoWikiCompileRunRecord | null>;
  getLatestSuccessfulCompileRunByCompanyId(
    companyId: string,
    session?: PersistenceSession,
  ): Promise<CfoWikiCompileRunRecord | null>;
  startLintRun(
    input: StartCfoWikiLintRunInput,
    session?: PersistenceSession,
  ): Promise<CfoWikiLintRunRecord>;
  finishLintRun(
    input: FinishCfoWikiLintRunInput,
    session?: PersistenceSession,
  ): Promise<CfoWikiLintRunRecord>;
  getLatestLintRunByCompanyId(
    companyId: string,
    session?: PersistenceSession,
  ): Promise<CfoWikiLintRunRecord | null>;
  listLintFindingsByRunId(
    lintRunId: string,
    session?: PersistenceSession,
  ): Promise<CfoWikiLintFindingRecord[]>;
  replaceLintFindings(
    input: {
      companyId: string;
      lintRunId: string;
      findings: PersistCfoWikiLintFindingInput[];
    },
    session?: PersistenceSession,
  ): Promise<CfoWikiLintFindingRecord[]>;
  startExportRun(
    input: StartCfoWikiExportRunInput,
    session?: PersistenceSession,
  ): Promise<CfoWikiExportRunRecord>;
  finishExportRun(
    input: FinishCfoWikiExportRunInput,
    session?: PersistenceSession,
  ): Promise<CfoWikiExportRunRecord>;
  listExportRunsByCompanyId(
    companyId: string,
    session?: PersistenceSession,
  ): Promise<CfoWikiExportRunRecord[]>;
  getExportRunById(
    exportRunId: string,
    session?: PersistenceSession,
  ): Promise<CfoWikiExportRunRecord | null>;
  upsertSourceBinding(
    input: UpsertCfoWikiSourceBindingInput,
    session?: PersistenceSession,
  ): Promise<CfoWikiSourceBindingRecord>;
  getSourceBindingByCompanyIdAndSourceId(
    companyId: string,
    sourceId: string,
    session?: PersistenceSession,
  ): Promise<CfoWikiSourceBindingRecord | null>;
  listSourceBindingsByCompanyId(
    companyId: string,
    session?: PersistenceSession,
  ): Promise<CfoWikiSourceBindingRecord[]>;
  upsertDocumentExtracts(
    input: {
      companyId: string;
      extracts: PersistCfoWikiDocumentExtractInput[];
    },
    session?: PersistenceSession,
  ): Promise<CfoWikiDocumentExtractRecord[]>;
  listDocumentExtractsByCompanyId(
    companyId: string,
    session?: PersistenceSession,
  ): Promise<CfoWikiDocumentExtractRecord[]>;
  listCompileRunsByCompanyId(
    companyId: string,
    session?: PersistenceSession,
  ): Promise<CfoWikiCompileRunRecord[]>;
  replaceCompiledState(
    input: {
      companyId: string;
      compileRunId: string;
      pages: PersistCfoWikiPageInput[];
      links: PersistCfoWikiPageLinkInput[];
      refs: PersistCfoWikiPageRefInput[];
    },
    session?: PersistenceSession,
  ): Promise<CfoWikiPageRecord[]>;
  getPageByCompanyIdAndPageKey(
    companyId: string,
    pageKey: string,
    session?: PersistenceSession,
  ): Promise<CfoWikiPageRecord | null>;
  createFiledPage(
    input: {
      companyId: string;
      page: PersistCfoWikiPageInput;
    },
    session?: PersistenceSession,
  ): Promise<CfoWikiPageRecord>;
  listPagesByCompanyId(
    companyId: string,
    session?: PersistenceSession,
  ): Promise<CfoWikiPageRecord[]>;
  listLinksByPageId(
    pageId: string,
    session?: PersistenceSession,
  ): Promise<CfoWikiPageLinkRecord[]>;
  listBacklinksByPageId(
    pageId: string,
    session?: PersistenceSession,
  ): Promise<CfoWikiPageLinkRecord[]>;
  listRefsByPageId(
    pageId: string,
    session?: PersistenceSession,
  ): Promise<CfoWikiPageRefRecord[]>;
}

export class InMemoryCfoWikiRepository implements CfoWikiRepository {
  private readonly compileRuns = new Map<string, CfoWikiCompileRunRecord>();
  private readonly lintRuns = new Map<string, CfoWikiLintRunRecord>();
  private readonly lintFindings = new Map<string, CfoWikiLintFindingRecord>();
  private readonly exportRuns = new Map<string, CfoWikiExportRunRecord>();
  private readonly sourceBindings = new Map<string, CfoWikiSourceBindingRecord>();
  private readonly sourceBindingsByScope = new Map<string, string>();
  private readonly documentExtracts = new Map<string, CfoWikiDocumentExtractRecord>();
  private readonly documentExtractsByScope = new Map<string, string>();
  private readonly pages = new Map<string, CfoWikiPageRecord>();
  private readonly links = new Map<string, CfoWikiPageLinkRecord>();
  private readonly refs = new Map<string, CfoWikiPageRefRecord>();

  async transaction<T>(
    operation: (session: PersistenceSession) => Promise<T>,
  ): Promise<T> {
    return operation(createMemorySession());
  }

  async startCompileRun(input: StartCfoWikiCompileRunInput) {
    const running = [...this.compileRuns.values()].find(
      (run) => run.companyId === input.companyId && run.status === "running",
    );

    if (running) {
      throw new CfoWikiCompileAlreadyRunningError(input.companyKey);
    }

    const now = input.startedAt;
    const compileRun: CfoWikiCompileRunRecord = {
      id: crypto.randomUUID(),
      companyId: input.companyId,
      status: "running",
      startedAt: input.startedAt,
      completedAt: null,
      triggeredBy: input.triggeredBy,
      triggerKind: input.triggerKind,
      compilerVersion: input.compilerVersion,
      stats: {},
      errorSummary: null,
      createdAt: now,
      updatedAt: now,
    };

    this.compileRuns.set(compileRun.id, compileRun);
    return compileRun;
  }

  async finishCompileRun(input: FinishCfoWikiCompileRunInput) {
    const existing = this.compileRuns.get(input.compileRunId);

    if (!existing) {
      throw new Error(`CFO Wiki compile run ${input.compileRunId} was not found`);
    }

    const compileRun: CfoWikiCompileRunRecord = {
      ...existing,
      completedAt: input.completedAt,
      errorSummary: input.errorSummary,
      stats: input.stats,
      status: input.status,
      updatedAt: input.completedAt,
    };

    this.compileRuns.set(compileRun.id, compileRun);
    return compileRun;
  }

  async getCompileRunById(compileRunId: string) {
    return this.compileRuns.get(compileRunId) ?? null;
  }

  async getLatestSuccessfulCompileRunByCompanyId(companyId: string) {
    return (
      [...this.compileRuns.values()]
        .filter((run) => run.companyId === companyId && run.status === "succeeded")
        .sort((left, right) => right.startedAt.localeCompare(left.startedAt))[0] ??
      null
    );
  }

  async startLintRun(input: StartCfoWikiLintRunInput) {
    const running = [...this.lintRuns.values()].find(
      (run) => run.companyId === input.companyId && run.status === "running",
    );

    if (running) {
      throw new Error(`A CFO Wiki lint run is already running for ${input.companyKey}`);
    }

    const now = input.startedAt;
    const lintRun: CfoWikiLintRunRecord = {
      id: crypto.randomUUID(),
      companyId: input.companyId,
      status: "running",
      startedAt: input.startedAt,
      completedAt: null,
      triggeredBy: input.triggeredBy,
      linterVersion: input.linterVersion,
      stats: {},
      errorSummary: null,
      createdAt: now,
      updatedAt: now,
    };

    this.lintRuns.set(lintRun.id, lintRun);
    return lintRun;
  }

  async finishLintRun(input: FinishCfoWikiLintRunInput) {
    const existing = this.lintRuns.get(input.lintRunId);

    if (!existing) {
      throw new Error(`CFO Wiki lint run ${input.lintRunId} was not found`);
    }

    const lintRun: CfoWikiLintRunRecord = {
      ...existing,
      completedAt: input.completedAt,
      errorSummary: input.errorSummary,
      stats: input.stats,
      status: input.status,
      updatedAt: input.completedAt,
    };

    this.lintRuns.set(lintRun.id, lintRun);
    return lintRun;
  }

  async getLatestLintRunByCompanyId(companyId: string) {
    return (
      [...this.lintRuns.values()]
        .filter((run) => run.companyId === companyId)
        .sort((left, right) => right.startedAt.localeCompare(left.startedAt))[0] ??
      null
    );
  }

  async listLintFindingsByRunId(lintRunId: string) {
    return [...this.lintFindings.values()]
      .filter((finding) => finding.lintRunId === lintRunId)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  }

  async replaceLintFindings(input: {
    companyId: string;
    lintRunId: string;
    findings: PersistCfoWikiLintFindingInput[];
  }) {
    for (const finding of [...this.lintFindings.values()]) {
      if (finding.lintRunId === input.lintRunId) {
        this.lintFindings.delete(finding.id);
      }
    }

    const createdAt = new Date().toISOString();
    const records = input.findings.map((finding) => {
      const record: CfoWikiLintFindingRecord = {
        id: crypto.randomUUID(),
        companyId: input.companyId,
        lintRunId: input.lintRunId,
        pageId: finding.pageId,
        pageKey: finding.pageKey,
        pageTitle: finding.pageTitle,
        findingKind: finding.findingKind,
        message: finding.message,
        details: finding.details,
        createdAt,
      };

      this.lintFindings.set(record.id, record);
      return record;
    });

    return records;
  }

  async startExportRun(input: StartCfoWikiExportRunInput) {
    const running = [...this.exportRuns.values()].find(
      (run) => run.companyId === input.companyId && run.status === "running",
    );

    if (running) {
      throw new Error(`A CFO Wiki export run is already running for ${input.companyKey}`);
    }

    const now = input.startedAt;
    const exportRun: CfoWikiExportRunRecord = {
      id: crypto.randomUUID(),
      companyId: input.companyId,
      status: "running",
      startedAt: input.startedAt,
      completedAt: null,
      triggeredBy: input.triggeredBy,
      exporterVersion: input.exporterVersion,
      bundleRootPath: input.bundleRootPath,
      pageCount: 0,
      fileCount: 0,
      manifest: null,
      files: [],
      errorSummary: null,
      createdAt: now,
      updatedAt: now,
    };

    this.exportRuns.set(exportRun.id, exportRun);
    return exportRun;
  }

  async finishExportRun(input: FinishCfoWikiExportRunInput) {
    const existing = this.exportRuns.get(input.exportRunId);

    if (!existing) {
      throw new Error(`CFO Wiki export run ${input.exportRunId} was not found`);
    }

    const exportRun: CfoWikiExportRunRecord = {
      ...existing,
      completedAt: input.completedAt,
      status: input.status,
      pageCount: input.pageCount,
      fileCount: input.fileCount,
      manifest: input.manifest,
      files: input.files,
      errorSummary: input.errorSummary,
      updatedAt: input.completedAt,
    };

    this.exportRuns.set(exportRun.id, exportRun);
    return exportRun;
  }

  async listExportRunsByCompanyId(companyId: string) {
    return [...this.exportRuns.values()]
      .filter((run) => run.companyId === companyId)
      .sort((left, right) => left.startedAt.localeCompare(right.startedAt));
  }

  async getExportRunById(exportRunId: string) {
    return this.exportRuns.get(exportRunId) ?? null;
  }

  async upsertSourceBinding(input: UpsertCfoWikiSourceBindingInput) {
    const scopeKey = buildSourceBindingScopeKey(input.companyId, input.sourceId);
    const existingId = this.sourceBindingsByScope.get(scopeKey);
    const existing = existingId
      ? (this.sourceBindings.get(existingId) ?? null)
      : null;
    const now = new Date().toISOString();
    const binding: CfoWikiSourceBindingRecord = existing
      ? {
          ...existing,
          boundBy: input.boundBy,
          documentRole: input.documentRole,
          includeInCompile: input.includeInCompile,
          updatedAt: now,
        }
      : {
          id: crypto.randomUUID(),
          companyId: input.companyId,
          sourceId: input.sourceId,
          includeInCompile: input.includeInCompile,
          documentRole: input.documentRole,
          boundBy: input.boundBy,
          createdAt: now,
          updatedAt: now,
        };

    this.sourceBindings.set(binding.id, binding);
    this.sourceBindingsByScope.set(scopeKey, binding.id);
    return binding;
  }

  async getSourceBindingByCompanyIdAndSourceId(companyId: string, sourceId: string) {
    const bindingId = this.sourceBindingsByScope.get(
      buildSourceBindingScopeKey(companyId, sourceId),
    );
    return bindingId ? (this.sourceBindings.get(bindingId) ?? null) : null;
  }

  async listSourceBindingsByCompanyId(companyId: string) {
    return [...this.sourceBindings.values()]
      .filter((binding) => binding.companyId === companyId)
      .sort((left, right) => left.sourceId.localeCompare(right.sourceId));
  }

  async upsertDocumentExtracts(input: {
    companyId: string;
    extracts: PersistCfoWikiDocumentExtractInput[];
  }) {
    const persisted = input.extracts.map((extract) => {
      const scopeKey = buildDocumentExtractScopeKey(
        input.companyId,
        extract.sourceSnapshotId,
      );
      const existingId = this.documentExtractsByScope.get(scopeKey);
      const existing = existingId
        ? (this.documentExtracts.get(existingId) ?? null)
        : null;
      const record: CfoWikiDocumentExtractRecord = existing
        ? {
            ...existing,
            ...extract,
            companyId: input.companyId,
            updatedAt: extract.extractedAt,
          }
        : {
            id: crypto.randomUUID(),
            companyId: input.companyId,
            ...extract,
            createdAt: extract.extractedAt,
            updatedAt: extract.extractedAt,
          };

      this.documentExtracts.set(record.id, record);
      this.documentExtractsByScope.set(scopeKey, record.id);
      return record;
    });

    return persisted.sort((left, right) =>
      left.sourceSnapshotId.localeCompare(right.sourceSnapshotId),
    );
  }

  async listDocumentExtractsByCompanyId(companyId: string) {
    return [...this.documentExtracts.values()]
      .filter((extract) => extract.companyId === companyId)
      .sort((left, right) =>
        compareDocumentExtracts(
          `${left.sourceId}::${left.sourceSnapshotId}`,
          `${right.sourceId}::${right.sourceSnapshotId}`,
        ),
      );
  }

  async listCompileRunsByCompanyId(companyId: string) {
    return [...this.compileRuns.values()]
      .filter((run) => run.companyId === companyId)
      .sort((left, right) => left.startedAt.localeCompare(right.startedAt));
  }

  async replaceCompiledState(input: {
    companyId: string;
    compileRunId: string;
    pages: PersistCfoWikiPageInput[];
    links: PersistCfoWikiPageLinkInput[];
    refs: PersistCfoWikiPageRefInput[];
  }) {
    const pageIds = [...this.pages.values()]
      .filter(
        (page) =>
          page.companyId === input.companyId &&
          page.ownershipKind === "compiler_owned",
      )
      .map((page) => page.id);
    const pageIdSet = new Set(pageIds);

    for (const link of [...this.links.values()]) {
      if (pageIdSet.has(link.fromPageId) || pageIdSet.has(link.toPageId)) {
        this.links.delete(link.id);
      }
    }

    for (const ref of [...this.refs.values()]) {
      if (pageIdSet.has(ref.pageId)) {
        this.refs.delete(ref.id);
      }
    }

    for (const page of [...this.pages.values()]) {
      if (
        page.companyId === input.companyId &&
        page.ownershipKind === "compiler_owned"
      ) {
        this.pages.delete(page.id);
      }
    }

    const insertedPages = input.pages.map((page) => {
      const record: CfoWikiPageRecord = {
        id: crypto.randomUUID(),
        companyId: input.companyId,
        compileRunId: input.compileRunId,
        pageKey: page.pageKey,
        pageKind: page.pageKind,
        ownershipKind: page.ownershipKind,
        temporalStatus: page.temporalStatus,
        title: page.title,
        summary: page.summary,
        markdownBody: page.markdownBody,
        freshnessSummary: page.freshnessSummary,
        limitations: page.limitations,
        lastCompiledAt: page.lastCompiledAt,
        filedMetadata: page.filedMetadata ?? null,
        createdAt: page.lastCompiledAt,
        updatedAt: page.lastCompiledAt,
      };

      this.pages.set(record.id, record);
      return record;
    });

    const pageIdByKey = new Map(
      insertedPages.map((page) => [page.pageKey, page.id] as const),
    );
    const persistedAt =
      insertedPages[0]?.lastCompiledAt ?? new Date().toISOString();

    for (const link of input.links) {
      const fromPageId = pageIdByKey.get(link.fromPageKey);
      const toPageId = pageIdByKey.get(link.toPageKey);

      if (!fromPageId || !toPageId) {
        throw new Error(`CFO Wiki link references unknown page key`);
      }

      const record: CfoWikiPageLinkRecord = {
        id: crypto.randomUUID(),
        companyId: input.companyId,
        compileRunId: input.compileRunId,
        fromPageId,
        toPageId,
        linkKind: link.linkKind,
        label: link.label,
        createdAt: persistedAt,
      };

      this.links.set(record.id, record);
    }

    for (const ref of input.refs) {
      const pageId = pageIdByKey.get(ref.pageKey);

      if (!pageId) {
        throw new Error(`CFO Wiki ref references unknown page key`);
      }

      const record: CfoWikiPageRefRecord = {
        id: crypto.randomUUID(),
        companyId: input.companyId,
        compileRunId: input.compileRunId,
        pageId,
        refKind: ref.refKind,
        targetKind: ref.targetKind,
        targetId: ref.targetId,
        label: ref.label,
        locator: ref.locator,
        excerpt: ref.excerpt,
        notes: ref.notes,
        createdAt: persistedAt,
      };

      this.refs.set(record.id, record);
    }

    return [...this.pages.values()]
      .filter((page) => page.companyId === input.companyId)
      .sort((left, right) => left.pageKey.localeCompare(right.pageKey));
  }

  async getPageByCompanyIdAndPageKey(companyId: string, pageKey: string) {
    return (
      [...this.pages.values()].find(
        (page) => page.companyId === companyId && page.pageKey === pageKey,
      ) ?? null
    );
  }

  async createFiledPage(input: {
    companyId: string;
    page: PersistCfoWikiPageInput;
  }) {
    const now = input.page.lastCompiledAt;
    const record: CfoWikiPageRecord = {
      id: crypto.randomUUID(),
      companyId: input.companyId,
      compileRunId: null,
      pageKey: input.page.pageKey,
      pageKind: input.page.pageKind,
      ownershipKind: input.page.ownershipKind,
      temporalStatus: input.page.temporalStatus,
      title: input.page.title,
      summary: input.page.summary,
      markdownBody: input.page.markdownBody,
      freshnessSummary: input.page.freshnessSummary,
      limitations: input.page.limitations,
      lastCompiledAt: input.page.lastCompiledAt,
      filedMetadata: input.page.filedMetadata ?? null,
      createdAt: now,
      updatedAt: now,
    };

    this.pages.set(record.id, record);
    return record;
  }

  async listPagesByCompanyId(companyId: string) {
    return [...this.pages.values()]
      .filter((page) => page.companyId === companyId)
      .sort((left, right) => left.pageKey.localeCompare(right.pageKey));
  }

  async listLinksByPageId(pageId: string) {
    return [...this.links.values()]
      .filter((link) => link.fromPageId === pageId)
      .sort((left, right) => left.label.localeCompare(right.label));
  }

  async listBacklinksByPageId(pageId: string) {
    return [...this.links.values()]
      .filter((link) => link.toPageId === pageId)
      .sort((left, right) => left.label.localeCompare(right.label));
  }

  async listRefsByPageId(pageId: string) {
    return [...this.refs.values()]
      .filter((ref) => ref.pageId === pageId)
      .sort((left, right) => left.label.localeCompare(right.label));
  }
}

function buildSourceBindingScopeKey(companyId: string, sourceId: string) {
  return `${companyId}::${sourceId}`;
}

function buildDocumentExtractScopeKey(companyId: string, sourceSnapshotId: string) {
  return `${companyId}::${sourceSnapshotId}`;
}

function compareDocumentExtracts(left: string, right: string) {
  return left.localeCompare(right);
}
