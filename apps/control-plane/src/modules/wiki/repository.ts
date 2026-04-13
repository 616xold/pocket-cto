import type {
  CfoWikiCompileRunRecord,
  CfoWikiCompileRunStatus,
  CfoWikiCompileTriggerKind,
  CfoWikiCompileRunStats,
  CfoWikiFreshnessSummary,
  CfoWikiLinkKind,
  CfoWikiPageKind,
  CfoWikiPageLinkRecord,
  CfoWikiPageOwnershipKind,
  CfoWikiPageRecord,
  CfoWikiPageRefRecord,
  CfoWikiPageTemporalStatus,
  CfoWikiRefKind,
  CfoWikiRefTargetKind,
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
  listPagesByCompanyId(
    companyId: string,
    session?: PersistenceSession,
  ): Promise<CfoWikiPageRecord[]>;
  listLinksByPageId(
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
      .filter((page) => page.companyId === input.companyId)
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
      if (page.companyId === input.companyId) {
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

    return insertedPages.sort((left, right) => left.pageKey.localeCompare(right.pageKey));
  }

  async getPageByCompanyIdAndPageKey(companyId: string, pageKey: string) {
    return (
      [...this.pages.values()].find(
        (page) => page.companyId === companyId && page.pageKey === pageKey,
      ) ?? null
    );
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

  async listRefsByPageId(pageId: string) {
    return [...this.refs.values()]
      .filter((ref) => ref.pageId === pageId)
      .sort((left, right) => left.label.localeCompare(right.label));
  }
}
