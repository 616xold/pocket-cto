import { and, asc, desc, eq, sql } from "drizzle-orm";
import {
  cfoWikiDocumentExtracts,
  cfoWikiCompileRuns,
  cfoWikiExportRuns,
  cfoWikiLintFindings,
  cfoWikiLintRuns,
  cfoWikiPages,
  cfoWikiPageLinks,
  cfoWikiPageRefs,
  cfoWikiSourceBindings,
  type Db,
  type DbTransaction,
} from "@pocket-cto/db";
import {
  type CfoWikiDocumentExtractRecord,
  type CfoWikiExportRunRecord,
  type CfoWikiLintFindingRecord,
  type CfoWikiLintRunRecord,
  CfoWikiFreshnessSummarySchema,
  type CfoWikiCompileRunRecord,
  type CfoWikiPageLinkRecord,
  type CfoWikiPageRecord,
  type CfoWikiPageRefRecord,
  type CfoWikiSourceBindingRecord,
} from "@pocket-cto/domain";
import {
  createDbSession,
  getDbExecutor,
  type PersistenceSession,
} from "../../lib/persistence";
import { CfoWikiCompileAlreadyRunningError } from "./errors";
import type {
  CfoWikiRepository,
  FinishCfoWikiExportRunInput,
  FinishCfoWikiCompileRunInput,
  FinishCfoWikiLintRunInput,
  PersistCfoWikiDocumentExtractInput,
  PersistCfoWikiLintFindingInput,
  PersistCfoWikiPageLinkInput,
  PersistCfoWikiPageRefInput,
  PersistCfoWikiPageInput,
  StartCfoWikiExportRunInput,
  StartCfoWikiCompileRunInput,
  StartCfoWikiLintRunInput,
  UpsertCfoWikiSourceBindingInput,
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

  async startLintRun(
    input: StartCfoWikiLintRunInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .insert(cfoWikiLintRuns)
      .values({
        companyId: input.companyId,
        status: "running",
        startedAt: new Date(input.startedAt),
        completedAt: null,
        triggeredBy: input.triggeredBy,
        linterVersion: input.linterVersion,
        stats: {},
        errorSummary: null,
      })
      .returning();

    if (!row) {
      throw new Error("CFO Wiki lint run insert did not return a row");
    }

    return mapLintRunRow(row);
  }

  async finishLintRun(
    input: FinishCfoWikiLintRunInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .update(cfoWikiLintRuns)
      .set({
        completedAt: new Date(input.completedAt),
        errorSummary: input.errorSummary,
        stats: input.stats,
        status: input.status,
        updatedAt: new Date(),
      })
      .where(eq(cfoWikiLintRuns.id, input.lintRunId))
      .returning();

    if (!row) {
      throw new Error(`CFO Wiki lint run ${input.lintRunId} was not found`);
    }

    return mapLintRunRow(row);
  }

  async getLatestLintRunByCompanyId(
    companyId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .select()
      .from(cfoWikiLintRuns)
      .where(eq(cfoWikiLintRuns.companyId, companyId))
      .orderBy(desc(cfoWikiLintRuns.startedAt))
      .limit(1);

    return row ? mapLintRunRow(row) : null;
  }

  async listLintFindingsByRunId(
    lintRunId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select()
      .from(cfoWikiLintFindings)
      .where(eq(cfoWikiLintFindings.lintRunId, lintRunId))
      .orderBy(asc(cfoWikiLintFindings.createdAt), asc(cfoWikiLintFindings.message));

    return rows.map((row) => mapLintFindingRow(row));
  }

  async replaceLintFindings(
    input: {
      companyId: string;
      lintRunId: string;
      findings: PersistCfoWikiLintFindingInput[];
    },
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    await executor
      .delete(cfoWikiLintFindings)
      .where(eq(cfoWikiLintFindings.lintRunId, input.lintRunId));

    if (input.findings.length === 0) {
      return [] satisfies CfoWikiLintFindingRecord[];
    }

    const rows = await executor
      .insert(cfoWikiLintFindings)
      .values(
        input.findings.map((finding) => ({
          companyId: input.companyId,
          lintRunId: input.lintRunId,
          pageId: finding.pageId,
          pageKey: finding.pageKey,
          pageTitle: finding.pageTitle,
          findingKind: finding.findingKind,
          message: finding.message,
          details: finding.details,
        })),
      )
      .returning();

    return rows.map((row) => mapLintFindingRow(row));
  }

  async startExportRun(
    input: StartCfoWikiExportRunInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .insert(cfoWikiExportRuns)
      .values({
        companyId: input.companyId,
        status: "running",
        startedAt: new Date(input.startedAt),
        completedAt: null,
        triggeredBy: input.triggeredBy,
        exporterVersion: input.exporterVersion,
        bundleRootPath: input.bundleRootPath,
        pageCount: 0,
        fileCount: 0,
        manifest: null,
        files: [],
        errorSummary: null,
      })
      .returning();

    if (!row) {
      throw new Error("CFO Wiki export run insert did not return a row");
    }

    return mapExportRunRow(row);
  }

  async finishExportRun(
    input: FinishCfoWikiExportRunInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .update(cfoWikiExportRuns)
      .set({
        completedAt: new Date(input.completedAt),
        status: input.status,
        pageCount: input.pageCount,
        fileCount: input.fileCount,
        manifest: input.manifest,
        files: input.files,
        errorSummary: input.errorSummary,
        updatedAt: new Date(),
      })
      .where(eq(cfoWikiExportRuns.id, input.exportRunId))
      .returning();

    if (!row) {
      throw new Error(`CFO Wiki export run ${input.exportRunId} was not found`);
    }

    return mapExportRunRow(row);
  }

  async listExportRunsByCompanyId(
    companyId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select()
      .from(cfoWikiExportRuns)
      .where(eq(cfoWikiExportRuns.companyId, companyId))
      .orderBy(desc(cfoWikiExportRuns.startedAt));

    return rows.map((row) => mapExportRunRow(row));
  }

  async getExportRunById(
    exportRunId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .select()
      .from(cfoWikiExportRuns)
      .where(eq(cfoWikiExportRuns.id, exportRunId))
      .limit(1);

    return row ? mapExportRunRow(row) : null;
  }

  async upsertSourceBinding(
    input: UpsertCfoWikiSourceBindingInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .insert(cfoWikiSourceBindings)
      .values({
        companyId: input.companyId,
        sourceId: input.sourceId,
        includeInCompile: input.includeInCompile,
        documentRole: input.documentRole,
        boundBy: input.boundBy,
      })
      .onConflictDoUpdate({
        target: [cfoWikiSourceBindings.companyId, cfoWikiSourceBindings.sourceId],
        set: {
          includeInCompile: input.includeInCompile,
          documentRole: input.documentRole,
          boundBy: input.boundBy,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!row) {
      throw new Error("CFO Wiki source binding upsert did not return a row");
    }

    return mapSourceBindingRow(row);
  }

  async getSourceBindingByCompanyIdAndSourceId(
    companyId: string,
    sourceId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .select()
      .from(cfoWikiSourceBindings)
      .where(
        and(
          eq(cfoWikiSourceBindings.companyId, companyId),
          eq(cfoWikiSourceBindings.sourceId, sourceId),
        ),
      )
      .limit(1);

    return row ? mapSourceBindingRow(row) : null;
  }

  async listSourceBindingsByCompanyId(
    companyId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select()
      .from(cfoWikiSourceBindings)
      .where(eq(cfoWikiSourceBindings.companyId, companyId))
      .orderBy(asc(cfoWikiSourceBindings.sourceId));

    return rows.map((row) => mapSourceBindingRow(row));
  }

  async upsertDocumentExtracts(
    input: {
      companyId: string;
      extracts: PersistCfoWikiDocumentExtractInput[];
    },
    session?: PersistenceSession,
  ) {
    const dedupedExtracts = [
      ...new Map(
        input.extracts.map((extract) => [extract.sourceSnapshotId, extract] as const),
      ).values(),
    ];

    if (dedupedExtracts.length === 0) {
      return [] satisfies CfoWikiDocumentExtractRecord[];
    }

    const executor = this.getExecutor(session);
    const rows = await executor
      .insert(cfoWikiDocumentExtracts)
      .values(
        dedupedExtracts.map((extract) => ({
          companyId: input.companyId,
          sourceId: extract.sourceId,
          sourceSnapshotId: extract.sourceSnapshotId,
          sourceFileId: extract.sourceFileId,
          extractStatus: extract.extractStatus,
          documentKind: extract.documentKind,
          title: extract.title,
          headingOutline: extract.headingOutline,
          excerptBlocks: extract.excerptBlocks,
          extractedText: extract.extractedText,
          renderedMarkdown: extract.renderedMarkdown,
          warnings: extract.warnings,
          errorSummary: extract.errorSummary,
          parserVersion: extract.parserVersion,
          inputChecksumSha256: extract.inputChecksumSha256,
          extractedAt: new Date(extract.extractedAt),
        })),
      )
      .onConflictDoUpdate({
        target: [
          cfoWikiDocumentExtracts.companyId,
          cfoWikiDocumentExtracts.sourceSnapshotId,
        ],
        set: {
          sourceId: sql`excluded.source_id`,
          sourceFileId: sql`excluded.source_file_id`,
          extractStatus: sql`excluded.extract_status`,
          documentKind: sql`excluded.document_kind`,
          title: sql`excluded.title`,
          headingOutline: sql`excluded.heading_outline`,
          excerptBlocks: sql`excluded.excerpt_blocks`,
          extractedText: sql`excluded.extracted_text`,
          renderedMarkdown: sql`excluded.rendered_markdown`,
          warnings: sql`excluded.warnings`,
          errorSummary: sql`excluded.error_summary`,
          parserVersion: sql`excluded.parser_version`,
          inputChecksumSha256: sql`excluded.input_checksum_sha256`,
          extractedAt: sql`excluded.extracted_at`,
          updatedAt: new Date(),
        },
      })
      .returning();

    return rows
      .map((row) => mapDocumentExtractRow(row))
      .sort((left, right) =>
        left.sourceSnapshotId.localeCompare(right.sourceSnapshotId),
      );
  }

  async listDocumentExtractsByCompanyId(
    companyId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select()
      .from(cfoWikiDocumentExtracts)
      .where(eq(cfoWikiDocumentExtracts.companyId, companyId))
      .orderBy(
        asc(cfoWikiDocumentExtracts.sourceId),
        asc(cfoWikiDocumentExtracts.sourceSnapshotId),
      );

    return rows.map((row) => mapDocumentExtractRow(row));
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
      .where(
        and(
          eq(cfoWikiPages.companyId, input.companyId),
          eq(cfoWikiPages.ownershipKind, "compiler_owned"),
        ),
      );

    if (input.pages.length > 0) {
      await executor
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
            filedMetadata: page.filedMetadata ?? null,
          })),
        );
    }
    const allPages = await this.listPagesByCompanyId(input.companyId, session);
    const pageIdByKey = new Map(
      allPages.map((page) => [page.pageKey, page.id] as const),
    );

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

    return allPages.sort((left, right) => left.pageKey.localeCompare(right.pageKey));
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

  async createFiledPage(
    input: {
      companyId: string;
      page: PersistCfoWikiPageInput;
    },
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .insert(cfoWikiPages)
      .values({
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
        lastCompiledAt: new Date(input.page.lastCompiledAt),
        filedMetadata: input.page.filedMetadata ?? null,
      })
      .returning();

    if (!row) {
      throw new Error("CFO Wiki filed page insert did not return a row");
    }

    return mapPageRow(row);
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

  async listBacklinksByPageId(pageId: string, session?: PersistenceSession) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select()
      .from(cfoWikiPageLinks)
      .where(eq(cfoWikiPageLinks.toPageId, pageId))
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

function mapLintRunRow(
  row: typeof cfoWikiLintRuns.$inferSelect,
): CfoWikiLintRunRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    status: row.status,
    startedAt: row.startedAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
    triggeredBy: row.triggeredBy,
    linterVersion: row.linterVersion,
    stats: row.stats,
    errorSummary: row.errorSummary,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapExportRunRow(
  row: typeof cfoWikiExportRuns.$inferSelect,
): CfoWikiExportRunRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    status: row.status,
    startedAt: row.startedAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
    triggeredBy: row.triggeredBy,
    exporterVersion: row.exporterVersion,
    bundleRootPath: row.bundleRootPath,
    pageCount: row.pageCount,
    fileCount: row.fileCount,
    manifest: row.manifest ?? null,
    files: row.files,
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
    filedMetadata: row.filedMetadata ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapSourceBindingRow(
  row: typeof cfoWikiSourceBindings.$inferSelect,
): CfoWikiSourceBindingRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    sourceId: row.sourceId,
    includeInCompile: row.includeInCompile,
    documentRole: row.documentRole,
    boundBy: row.boundBy,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapDocumentExtractRow(
  row: typeof cfoWikiDocumentExtracts.$inferSelect,
): CfoWikiDocumentExtractRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    sourceId: row.sourceId,
    sourceSnapshotId: row.sourceSnapshotId,
    sourceFileId: row.sourceFileId,
    extractStatus: row.extractStatus,
    documentKind: row.documentKind,
    title: row.title,
    headingOutline: row.headingOutline,
    excerptBlocks: row.excerptBlocks,
    extractedText: row.extractedText,
    renderedMarkdown: row.renderedMarkdown,
    warnings: row.warnings,
    errorSummary: row.errorSummary,
    parserVersion: row.parserVersion,
    inputChecksumSha256: row.inputChecksumSha256,
    extractedAt: row.extractedAt.toISOString(),
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

function mapLintFindingRow(
  row: typeof cfoWikiLintFindings.$inferSelect,
): CfoWikiLintFindingRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    lintRunId: row.lintRunId,
    pageId: row.pageId,
    pageKey: row.pageKey,
    pageTitle: row.pageTitle,
    findingKind: row.findingKind,
    message: row.message,
    details: row.details,
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
