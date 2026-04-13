import { and, asc, desc, eq } from "drizzle-orm";
import {
  cfoWikiCompileRuns,
  cfoWikiPages,
  cfoWikiPageLinks,
  cfoWikiPageRefs,
  type Db,
  type DbTransaction,
} from "@pocket-cto/db";
import {
  CfoWikiFreshnessSummarySchema,
  type CfoWikiCompileRunRecord,
  type CfoWikiPageLinkRecord,
  type CfoWikiPageRecord,
  type CfoWikiPageRefRecord,
} from "@pocket-cto/domain";
import {
  createDbSession,
  getDbExecutor,
  type PersistenceSession,
} from "../../lib/persistence";
import { CfoWikiCompileAlreadyRunningError } from "./errors";
import type {
  CfoWikiRepository,
  FinishCfoWikiCompileRunInput,
  PersistCfoWikiPageLinkInput,
  PersistCfoWikiPageRefInput,
  PersistCfoWikiPageInput,
  StartCfoWikiCompileRunInput,
} from "./repository";

export class DrizzleCfoWikiRepository implements CfoWikiRepository {
  constructor(private readonly db: Db) {}

  async transaction<T>(
    operation: (session: PersistenceSession) => Promise<T>,
  ): Promise<T> {
    return this.db.transaction(async (tx: DbTransaction) =>
      operation(createDbSession(tx)),
    );
  }

  async startCompileRun(
    input: StartCfoWikiCompileRunInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);

    try {
      const [row] = await executor
        .insert(cfoWikiCompileRuns)
        .values({
          companyId: input.companyId,
          status: "running",
          startedAt: new Date(input.startedAt),
          completedAt: null,
          triggeredBy: input.triggeredBy,
          triggerKind: input.triggerKind,
          compilerVersion: input.compilerVersion,
          stats: {},
          errorSummary: null,
        })
        .returning();

      if (!row) {
        throw new Error("CFO Wiki compile run insert did not return a row");
      }

      return mapCompileRunRow(row);
    } catch (error) {
      if (isRunningCompileConflict(error)) {
        throw new CfoWikiCompileAlreadyRunningError(input.companyKey);
      }

      throw error;
    }
  }

  async finishCompileRun(
    input: FinishCfoWikiCompileRunInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .update(cfoWikiCompileRuns)
      .set({
        completedAt: new Date(input.completedAt),
        errorSummary: input.errorSummary,
        stats: input.stats,
        status: input.status,
        updatedAt: new Date(),
      })
      .where(eq(cfoWikiCompileRuns.id, input.compileRunId))
      .returning();

    if (!row) {
      throw new Error(`CFO Wiki compile run ${input.compileRunId} was not found`);
    }

    return mapCompileRunRow(row);
  }

  async getCompileRunById(
    compileRunId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .select()
      .from(cfoWikiCompileRuns)
      .where(eq(cfoWikiCompileRuns.id, compileRunId))
      .limit(1);

    return row ? mapCompileRunRow(row) : null;
  }

  async getLatestSuccessfulCompileRunByCompanyId(
    companyId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .select()
      .from(cfoWikiCompileRuns)
      .where(
        and(
          eq(cfoWikiCompileRuns.companyId, companyId),
          eq(cfoWikiCompileRuns.status, "succeeded"),
        ),
      )
      .orderBy(desc(cfoWikiCompileRuns.startedAt))
      .limit(1);

    return row ? mapCompileRunRow(row) : null;
  }

  async listCompileRunsByCompanyId(
    companyId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select()
      .from(cfoWikiCompileRuns)
      .where(eq(cfoWikiCompileRuns.companyId, companyId))
      .orderBy(asc(cfoWikiCompileRuns.startedAt));

    return rows.map((row) => mapCompileRunRow(row));
  }

  async replaceCompiledState(
    input: {
      companyId: string;
      compileRunId: string;
      pages: PersistCfoWikiPageInput[];
      links: PersistCfoWikiPageLinkInput[];
      refs: PersistCfoWikiPageRefInput[];
    },
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);

    await executor
      .delete(cfoWikiPages)
      .where(eq(cfoWikiPages.companyId, input.companyId));

    const pageRows = input.pages.length
      ? await executor
          .insert(cfoWikiPages)
          .values(
            input.pages.map((page) => ({
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
              lastCompiledAt: new Date(page.lastCompiledAt),
            })),
          )
          .returning()
      : [];
    const pages = pageRows.map((row) => mapPageRow(row));
    const pageIdByKey = new Map(pages.map((page) => [page.pageKey, page.id] as const));

    if (input.links.length > 0) {
      await executor.insert(cfoWikiPageLinks).values(
        input.links.map((link) => ({
          companyId: input.companyId,
          compileRunId: input.compileRunId,
          fromPageId: requirePageId(pageIdByKey, link.fromPageKey, "link source"),
          toPageId: requirePageId(pageIdByKey, link.toPageKey, "link target"),
          linkKind: link.linkKind,
          label: link.label,
        })),
      );
    }

    if (input.refs.length > 0) {
      await executor.insert(cfoWikiPageRefs).values(
        input.refs.map((ref) => ({
          companyId: input.companyId,
          compileRunId: input.compileRunId,
          pageId: requirePageId(pageIdByKey, ref.pageKey, "ref page"),
          refKind: ref.refKind,
          targetKind: ref.targetKind,
          targetId: ref.targetId,
          label: ref.label,
          locator: ref.locator,
          excerpt: ref.excerpt,
          notes: ref.notes,
        })),
      );
    }

    return pages.sort((left, right) => left.pageKey.localeCompare(right.pageKey));
  }

  async getPageByCompanyIdAndPageKey(
    companyId: string,
    pageKey: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .select()
      .from(cfoWikiPages)
      .where(
        and(
          eq(cfoWikiPages.companyId, companyId),
          eq(cfoWikiPages.pageKey, pageKey),
        ),
      )
      .limit(1);

    return row ? mapPageRow(row) : null;
  }

  async listPagesByCompanyId(companyId: string, session?: PersistenceSession) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select()
      .from(cfoWikiPages)
      .where(eq(cfoWikiPages.companyId, companyId))
      .orderBy(asc(cfoWikiPages.pageKey));

    return rows.map((row) => mapPageRow(row));
  }

  async listLinksByPageId(pageId: string, session?: PersistenceSession) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select()
      .from(cfoWikiPageLinks)
      .where(eq(cfoWikiPageLinks.fromPageId, pageId))
      .orderBy(asc(cfoWikiPageLinks.label));

    return rows.map((row) => mapPageLinkRow(row));
  }

  async listRefsByPageId(pageId: string, session?: PersistenceSession) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select()
      .from(cfoWikiPageRefs)
      .where(eq(cfoWikiPageRefs.pageId, pageId))
      .orderBy(asc(cfoWikiPageRefs.label));

    return rows.map((row) => mapPageRefRow(row));
  }

  private getExecutor(session?: PersistenceSession) {
    return getDbExecutor(session) ?? this.db;
  }
}

function mapCompileRunRow(
  row: typeof cfoWikiCompileRuns.$inferSelect,
): CfoWikiCompileRunRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    status: row.status,
    startedAt: row.startedAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
    triggeredBy: row.triggeredBy,
    triggerKind: row.triggerKind,
    compilerVersion: row.compilerVersion,
    stats: row.stats,
    errorSummary: row.errorSummary,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapPageRow(row: typeof cfoWikiPages.$inferSelect): CfoWikiPageRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    compileRunId: row.compileRunId,
    pageKey: row.pageKey,
    pageKind: row.pageKind,
    ownershipKind: row.ownershipKind,
    temporalStatus: row.temporalStatus,
    title: row.title,
    summary: row.summary,
    markdownBody: row.markdownBody,
    freshnessSummary: CfoWikiFreshnessSummarySchema.parse(row.freshnessSummary),
    limitations: row.limitations,
    lastCompiledAt: row.lastCompiledAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapPageLinkRow(
  row: typeof cfoWikiPageLinks.$inferSelect,
): CfoWikiPageLinkRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    compileRunId: row.compileRunId,
    fromPageId: row.fromPageId,
    toPageId: row.toPageId,
    linkKind: row.linkKind,
    label: row.label,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapPageRefRow(
  row: typeof cfoWikiPageRefs.$inferSelect,
): CfoWikiPageRefRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    compileRunId: row.compileRunId,
    pageId: row.pageId,
    refKind: row.refKind,
    targetKind: row.targetKind,
    targetId: row.targetId,
    label: row.label,
    locator: row.locator,
    excerpt: row.excerpt,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
  };
}

function requirePageId(
  pageIdByKey: Map<string, string>,
  pageKey: string,
  label: string,
) {
  const pageId = pageIdByKey.get(pageKey);

  if (!pageId) {
    throw new Error(`Unknown CFO Wiki ${label} page key ${pageKey}`);
  }

  return pageId;
}

function isRunningCompileConflict(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505" &&
    "constraint" in error &&
    error.constraint === "cfo_wiki_compile_runs_company_running_key"
  );
}
