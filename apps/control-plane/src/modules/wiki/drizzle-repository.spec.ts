import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createTestDb, resetTestDatabase, closeTestDatabase } from "../../test/database";
import { DrizzleFinanceTwinRepository } from "../finance-twin/drizzle-repository";
import { DrizzleSourceRepository } from "../sources/drizzle-repository";
import { CfoWikiCompileAlreadyRunningError } from "./errors";
import { DrizzleCfoWikiRepository } from "./drizzle-repository";

describe("DrizzleCfoWikiRepository", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it("persists compile runs, pages, links, and refs additively", async () => {
    const db = createTestDb();
    const financeRepository = new DrizzleFinanceTwinRepository(db);
    const sourceRepository = new DrizzleSourceRepository(db);
    const wikiRepository = new DrizzleCfoWikiRepository(db);
    const company = await financeRepository.upsertCompany({
      companyKey: "acme",
      displayName: "Acme Holdings",
    });
    const source = await sourceRepository.createSource({
      kind: "document",
      originKind: "manual",
      name: "Board deck",
      description: null,
      createdBy: "finance-operator",
    });
    const snapshot = await sourceRepository.createSnapshot({
      sourceId: source.id,
      version: 1,
      originalFileName: "board-deck.md",
      mediaType: "text/markdown",
      sizeBytes: 128,
      checksumSha256:
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      storageKind: "object_store",
      storageRef: "s3://bucket/board-deck.md",
      capturedAt: "2026-04-13T11:59:00.000Z",
      ingestStatus: "ready",
    });
    const sourceFile = await sourceRepository.createSourceFile({
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      originalFileName: "board-deck.md",
      mediaType: "text/markdown",
      sizeBytes: 128,
      checksumSha256:
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      storageKind: "object_store",
      storageRef: "s3://bucket/board-deck.md",
      createdBy: "finance-operator",
      capturedAt: "2026-04-13T11:59:00.000Z",
    });
    const startedAt = "2026-04-13T12:00:00.000Z";
    const compileRun = await wikiRepository.startCompileRun({
      companyId: company.id,
      companyKey: company.companyKey,
      startedAt,
      triggeredBy: "operator",
      triggerKind: "manual",
      compilerVersion: "test",
    });

    await expect(
      wikiRepository.startCompileRun({
        companyId: company.id,
        companyKey: company.companyKey,
        startedAt: "2026-04-13T12:01:00.000Z",
        triggeredBy: "operator",
        triggerKind: "manual",
        compilerVersion: "test",
      }),
    ).rejects.toBeInstanceOf(CfoWikiCompileAlreadyRunningError);

    const binding = await wikiRepository.upsertSourceBinding({
      companyId: company.id,
      sourceId: source.id,
      includeInCompile: true,
      documentRole: "board_material",
      boundBy: "finance-operator",
    });
    const extracts = await wikiRepository.upsertDocumentExtracts({
      companyId: company.id,
      extracts: [
        {
          sourceId: source.id,
          sourceSnapshotId: snapshot.id,
          sourceFileId: sourceFile.id,
          extractStatus: "extracted",
          documentKind: "markdown_text",
          title: "Board deck",
          headingOutline: [{ depth: 1, text: "Board deck" }],
          excerptBlocks: [{ heading: "Board deck", text: "Revenue grew 20%." }],
          extractedText: "# Board deck\n\nRevenue grew 20%.",
          renderedMarkdown: "# Board deck\n\nRevenue grew 20%.",
          warnings: [],
          errorSummary: null,
          parserVersion: "test",
          inputChecksumSha256:
            "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          extractedAt: "2026-04-13T12:00:01.000Z",
        },
      ],
    });

    await wikiRepository.transaction(async (session) => {
      await wikiRepository.replaceCompiledState(
        {
          companyId: company.id,
          compileRunId: compileRun.id,
          pages: [
            {
              pageKey: "index",
              pageKind: "index",
              ownershipKind: "compiler_owned",
              temporalStatus: "current",
              title: "Index",
              summary: "Index summary",
              markdownBody: "# Index",
              freshnessSummary: {
                state: "missing",
                summary: "Missing",
              },
              limitations: [],
              lastCompiledAt: "2026-04-13T12:00:02.000Z",
            },
            {
              pageKey: "company/overview",
              pageKind: "company_overview",
              ownershipKind: "compiler_owned",
              temporalStatus: "current",
              title: "Company overview",
              summary: "Overview summary",
              markdownBody: "# Company overview",
              freshnessSummary: {
                state: "missing",
                summary: "Missing",
              },
              limitations: [],
              lastCompiledAt: "2026-04-13T12:00:02.000Z",
            },
          ],
          links: [
            {
              fromPageKey: "index",
              toPageKey: "company/overview",
              linkKind: "navigation",
              label: "Company overview",
            },
          ],
          refs: [
            {
              pageKey: "index",
              refKind: "twin_fact",
              targetKind: "company",
              targetId: company.id,
              label: "Company record",
              locator: "acme",
              excerpt: "Company key acme.",
              notes: "Stored company record.",
            },
          ],
        },
        session,
      );

      await wikiRepository.finishCompileRun(
        {
          compileRunId: compileRun.id,
          completedAt: "2026-04-13T12:00:02.000Z",
          status: "succeeded",
          stats: {
            pageCount: 2,
            linkCount: 1,
            refCount: 1,
          },
          errorSummary: null,
        },
        session,
      );
    });

    const [pages, latestCompileRun, indexPage] = await Promise.all([
      wikiRepository.listPagesByCompanyId(company.id),
      wikiRepository.getLatestSuccessfulCompileRunByCompanyId(company.id),
      wikiRepository.getPageByCompanyIdAndPageKey(company.id, "index"),
    ]);
    const [bindings, storedExtracts] = await Promise.all([
      wikiRepository.listSourceBindingsByCompanyId(company.id),
      wikiRepository.listDocumentExtractsByCompanyId(company.id),
    ]);

    expect(pages).toHaveLength(2);
    expect(binding.includeInCompile).toBe(true);
    expect(bindings).toHaveLength(1);
    expect(extracts).toHaveLength(1);
    expect(storedExtracts[0]?.sourceSnapshotId).toBe(snapshot.id);
    expect(latestCompileRun).toMatchObject({
      id: compileRun.id,
      status: "succeeded",
    });
    expect(indexPage).toMatchObject({
      pageKey: "index",
      pageKind: "index",
    });

    const [links, refs] = await Promise.all([
      wikiRepository.listLinksByPageId(indexPage!.id),
      wikiRepository.listRefsByPageId(indexPage!.id),
    ]);

    expect(links).toHaveLength(1);
    expect(refs).toHaveLength(1);
  });

  it("preserves filed pages across compiler-owned replacement and persists lint/export runs", async () => {
    const db = createTestDb();
    const financeRepository = new DrizzleFinanceTwinRepository(db);
    const wikiRepository = new DrizzleCfoWikiRepository(db);
    const company = await financeRepository.upsertCompany({
      companyKey: "acme",
      displayName: "Acme Holdings",
    });
    const compileRun = await wikiRepository.startCompileRun({
      companyId: company.id,
      companyKey: company.companyKey,
      startedAt: "2026-04-13T12:10:00.000Z",
      triggeredBy: "operator",
      triggerKind: "manual",
      compilerVersion: "test",
    });

    await wikiRepository.createFiledPage({
      companyId: company.id,
      page: {
        pageKey: "filed/board-deck-notes",
        pageKind: "filed_artifact",
        ownershipKind: "filed_artifact",
        temporalStatus: "current",
        title: "Board deck notes",
        summary: "Collections remain tight.",
        markdownBody: "# Board deck notes",
        freshnessSummary: {
          state: "missing",
          summary: "Filed pages do not carry compiler freshness.",
        },
        limitations: [],
        lastCompiledAt: "2026-04-13T12:09:00.000Z",
        filedMetadata: {
          filedAt: "2026-04-13T12:09:00.000Z",
          filedBy: "finance-operator",
          provenanceKind: "manual_markdown_artifact",
          provenanceSummary: "Filed after board review.",
        },
      },
    });

    const pagesAfterCompile = await wikiRepository.transaction(async (session) => {
      const pages = await wikiRepository.replaceCompiledState(
        {
          companyId: company.id,
          compileRunId: compileRun.id,
          pages: [
            {
              pageKey: "index",
              pageKind: "index",
              ownershipKind: "compiler_owned",
              temporalStatus: "current",
              title: "Index",
              summary: "Index summary",
              markdownBody: "# Index",
              freshnessSummary: {
                state: "fresh",
                summary: "Fresh",
              },
              limitations: [],
              lastCompiledAt: "2026-04-13T12:10:01.000Z",
            },
          ],
          links: [],
          refs: [],
        },
        session,
      );
      await wikiRepository.finishCompileRun(
        {
          compileRunId: compileRun.id,
          completedAt: "2026-04-13T12:10:01.000Z",
          status: "succeeded",
          stats: { pageCount: 1 },
          errorSummary: null,
        },
        session,
      );

      return pages;
    });
    const lintRun = await wikiRepository.startLintRun({
      companyId: company.id,
      companyKey: company.companyKey,
      startedAt: "2026-04-13T12:11:00.000Z",
      triggeredBy: "finance-operator",
      linterVersion: "test",
    });
    await wikiRepository.replaceLintFindings({
      companyId: company.id,
      lintRunId: lintRun.id,
      findings: [
        {
          pageId: null,
          pageKey: "index",
          pageTitle: "Index",
          findingKind: "missing_refs",
          message: "Page has no refs.",
          details: {},
        },
      ],
    });
    await wikiRepository.finishLintRun({
      lintRunId: lintRun.id,
      completedAt: "2026-04-13T12:11:01.000Z",
      status: "succeeded",
      stats: { findingCount: 1 },
      errorSummary: null,
    });
    const exportRun = await wikiRepository.startExportRun({
      companyId: company.id,
      companyKey: company.companyKey,
      startedAt: "2026-04-13T12:12:00.000Z",
      triggeredBy: "finance-operator",
      exporterVersion: "test",
      bundleRootPath: "acme-cfo-wiki",
    });
    await wikiRepository.finishExportRun({
      exportRunId: exportRun.id,
      completedAt: "2026-04-13T12:12:01.000Z",
      status: "succeeded",
      pageCount: 2,
      fileCount: 3,
      manifest: {
        bundleRootPath: "acme-cfo-wiki",
        generatedAt: "2026-04-13T12:12:01.000Z",
        companyKey: "acme",
        companyDisplayName: "Acme Holdings",
        indexPath: "index.md",
        logPath: "log.md",
        pageCount: 2,
        fileCount: 3,
        limitations: [],
        pages: [],
      },
      files: [],
      errorSummary: null,
    });

    expect(
      pagesAfterCompile.some((page) => page.pageKey === "filed/board-deck-notes"),
    ).toBe(true);
    expect(await wikiRepository.getLatestLintRunByCompanyId(company.id)).toMatchObject({
      status: "succeeded",
    });
    expect(await wikiRepository.listLintFindingsByRunId(lintRun.id)).toHaveLength(1);
    expect(await wikiRepository.getExportRunById(exportRun.id)).toMatchObject({
      status: "succeeded",
      bundleRootPath: "acme-cfo-wiki",
    });
  });

  it("deduplicates document extracts that share one source snapshot within a single upsert batch", async () => {
    const db = createTestDb();
    const financeRepository = new DrizzleFinanceTwinRepository(db);
    const sourceRepository = new DrizzleSourceRepository(db);
    const wikiRepository = new DrizzleCfoWikiRepository(db);
    const company = await financeRepository.upsertCompany({
      companyKey: "acme",
      displayName: "Acme Holdings",
    });
    const source = await sourceRepository.createSource({
      kind: "document",
      originKind: "manual",
      name: "Policy",
      description: null,
      createdBy: "finance-operator",
    });
    const snapshot = await sourceRepository.createSnapshot({
      sourceId: source.id,
      version: 1,
      originalFileName: "policy.md",
      mediaType: "text/markdown",
      sizeBytes: 128,
      checksumSha256:
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      storageKind: "object_store",
      storageRef: "s3://bucket/policy.md",
      capturedAt: "2026-04-13T12:10:00.000Z",
      ingestStatus: "ready",
    });
    const sourceFile = await sourceRepository.createSourceFile({
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      originalFileName: "policy.md",
      mediaType: "text/markdown",
      sizeBytes: 128,
      checksumSha256:
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      storageKind: "object_store",
      storageRef: "s3://bucket/policy.md",
      createdBy: "finance-operator",
      capturedAt: "2026-04-13T12:10:00.000Z",
    });

    const extracts = await wikiRepository.upsertDocumentExtracts({
      companyId: company.id,
      extracts: [
        {
          sourceId: source.id,
          sourceSnapshotId: snapshot.id,
          sourceFileId: sourceFile.id,
          extractStatus: "extracted",
          documentKind: "markdown_text",
          title: "Policy",
          headingOutline: [{ depth: 1, text: "Policy" }],
          excerptBlocks: [{ heading: "Policy", text: "Initial extract." }],
          extractedText: "# Policy\n\nInitial extract.",
          renderedMarkdown: "# Policy\n\nInitial extract.",
          warnings: [],
          errorSummary: null,
          parserVersion: "test",
          inputChecksumSha256:
            "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          extractedAt: "2026-04-13T12:10:01.000Z",
        },
        {
          sourceId: source.id,
          sourceSnapshotId: snapshot.id,
          sourceFileId: sourceFile.id,
          extractStatus: "extracted",
          documentKind: "markdown_text",
          title: "Policy Current",
          headingOutline: [{ depth: 1, text: "Policy Current" }],
          excerptBlocks: [
            { heading: "Policy Current", text: "Latest extract." },
          ],
          extractedText: "# Policy Current\n\nLatest extract.",
          renderedMarkdown: "# Policy Current\n\nLatest extract.",
          warnings: [],
          errorSummary: null,
          parserVersion: "test",
          inputChecksumSha256:
            "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          extractedAt: "2026-04-13T12:10:02.000Z",
        },
      ],
    });
    const storedExtracts = await wikiRepository.listDocumentExtractsByCompanyId(
      company.id,
    );

    expect(extracts).toHaveLength(1);
    expect(storedExtracts).toHaveLength(1);
    expect(storedExtracts[0]).toMatchObject({
      sourceSnapshotId: snapshot.id,
      title: "Policy Current",
    });
  });
});
