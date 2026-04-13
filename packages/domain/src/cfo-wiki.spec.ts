import { describe, expect, it } from "vitest";
import {
  CfoWikiBindSourceRequestSchema,
  CfoWikiCompileResultSchema,
  CfoWikiCompileRunRecordSchema,
  CfoWikiCompileRequestSchema,
  CfoWikiCompanySourceListViewSchema,
  CfoWikiDocumentExtractRecordSchema,
  CfoWikiCreateFiledPageRequestSchema,
  CfoWikiPageKeySchema,
  CfoWikiLintSummarySchema,
  CfoWikiExportDetailViewSchema,
  buildCfoWikiSourceDigestPageKey,
  buildCfoWikiFiledPageKey,
  buildCfoWikiMarkdownPath,
} from "./cfo-wiki";

describe("cfo wiki domain schemas", () => {
  it("accepts canonical F3A page keys without markdown suffixes", () => {
    expect(CfoWikiPageKeySchema.parse("index")).toBe("index");
    expect(CfoWikiPageKeySchema.parse("company/overview")).toBe(
      "company/overview",
    );
    expect(CfoWikiPageKeySchema.parse("periods/2026-03-31/index")).toBe(
      "periods/2026-03-31/index",
    );
    expect(
      CfoWikiPageKeySchema.parse(
        "sources/11111111-1111-4111-8111-111111111111/snapshots/2",
      ),
    ).toBe("sources/11111111-1111-4111-8111-111111111111/snapshots/2");
    expect(CfoWikiPageKeySchema.parse("filed/board-deck-notes")).toBe(
      "filed/board-deck-notes",
    );
    expect(() => CfoWikiPageKeySchema.parse("company/overview.md")).toThrow();
  });

  it("defaults the compile request to a manual operator trigger", () => {
    const parsed = CfoWikiCompileRequestSchema.parse({});
    expect(parsed.triggeredBy).toBe("operator");
  });

  it("derives markdown paths from canonical page keys", () => {
    expect(buildCfoWikiMarkdownPath("index")).toBe("index.md");
    expect(buildCfoWikiMarkdownPath("sources/coverage")).toBe(
      "sources/coverage.md",
    );
    expect(buildCfoWikiMarkdownPath(buildCfoWikiFiledPageKey("board-deck-notes"))).toBe(
      "filed/board-deck-notes.md",
    );
    expect(
      buildCfoWikiMarkdownPath(
        buildCfoWikiSourceDigestPageKey(
          "11111111-1111-4111-8111-111111111111",
          2,
        ),
      ),
    ).toBe("sources/11111111-1111-4111-8111-111111111111/snapshots/2.md");
  });

  it("defaults the bind request to an operator-owned included binding", () => {
    expect(CfoWikiBindSourceRequestSchema.parse({})).toEqual({
      boundBy: "operator",
      includeInCompile: true,
    });
  });

  it("requires explicit filed-page inputs and keeps provenance explicit", () => {
    expect(
      CfoWikiCreateFiledPageRequestSchema.parse({
        title: "Board deck notes",
        markdownBody: "Collections remain tight.",
        filedBy: "finance-operator",
      }),
    ).toEqual({
      title: "Board deck notes",
      markdownBody: "Collections remain tight.",
      filedBy: "finance-operator",
      provenanceSummary: "Manually filed markdown artifact.",
    });
  });

  it("parses persisted document extracts and bound-source list views", () => {
    const extract = CfoWikiDocumentExtractRecordSchema.parse({
      id: "11111111-1111-4111-8111-111111111111",
      companyId: "22222222-2222-4222-8222-222222222222",
      sourceId: "33333333-3333-4333-8333-333333333333",
      sourceSnapshotId: "44444444-4444-4444-8444-444444444444",
      sourceFileId: "55555555-5555-4555-8555-555555555555",
      extractStatus: "extracted",
      documentKind: "markdown_text",
      title: "Board Deck",
      headingOutline: [{ depth: 1, text: "Highlights" }],
      excerptBlocks: [{ heading: "Highlights", text: "Revenue grew 20%." }],
      extractedText: "# Highlights\n\nRevenue grew 20%.",
      renderedMarkdown: "# Highlights\n\nRevenue grew 20%.",
      warnings: [],
      errorSummary: null,
      parserVersion: "f3b-document-extract-v1",
      inputChecksumSha256:
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      extractedAt: "2026-04-13T21:00:01.000Z",
      createdAt: "2026-04-13T21:00:01.000Z",
      updatedAt: "2026-04-13T21:00:01.000Z",
    });

    const parsed = CfoWikiCompanySourceListViewSchema.parse({
      companyId: extract.companyId,
      companyKey: "acme",
      companyDisplayName: "Acme Holdings",
      sourceCount: 1,
      sources: [
        {
          binding: {
            id: "66666666-6666-4666-8666-666666666666",
            companyId: extract.companyId,
            sourceId: extract.sourceId,
            includeInCompile: true,
            documentRole: "board_material",
            boundBy: "finance-operator",
            createdAt: "2026-04-13T21:00:00.000Z",
            updatedAt: "2026-04-13T21:00:00.000Z",
          },
          source: {
            id: extract.sourceId,
            kind: "document",
            originKind: "manual",
            name: "April board deck",
            description: null,
            createdBy: "finance-operator",
            createdAt: "2026-04-13T20:59:00.000Z",
            updatedAt: "2026-04-13T21:00:00.000Z",
          },
          latestSnapshot: {
            id: extract.sourceSnapshotId,
            sourceId: extract.sourceId,
            version: 2,
            originalFileName: "april-board-deck.md",
            mediaType: "text/markdown",
            sizeBytes: 128,
            checksumSha256:
              "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            storageKind: "object_store",
            storageRef: "s3://bucket/sources/april-board-deck.md",
            capturedAt: "2026-04-13T21:00:00.000Z",
            ingestStatus: "ready",
            ingestErrorSummary: null,
            createdAt: "2026-04-13T21:00:00.000Z",
            updatedAt: "2026-04-13T21:00:00.000Z",
          },
          latestSourceFile: {
            id: extract.sourceFileId,
            sourceId: extract.sourceId,
            sourceSnapshotId: extract.sourceSnapshotId,
            originalFileName: "april-board-deck.md",
            mediaType: "text/markdown",
            sizeBytes: 128,
            checksumSha256:
              "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            storageKind: "object_store",
            storageRef: "s3://bucket/sources/april-board-deck.md",
            createdBy: "finance-operator",
            capturedAt: "2026-04-13T21:00:00.000Z",
            createdAt: "2026-04-13T21:00:00.000Z",
          },
          latestExtract: extract,
          limitations: [],
        },
      ],
      limitations: [],
    });

    expect(parsed.sources[0]?.latestExtract?.documentKind).toBe("markdown_text");
  });

  it("parses a compile result with persisted run and page inventory state", () => {
    const run = CfoWikiCompileRunRecordSchema.parse({
      id: "11111111-1111-4111-8111-111111111111",
      companyId: "22222222-2222-4222-8222-222222222222",
      status: "succeeded",
      startedAt: "2026-04-13T19:00:00.000Z",
      completedAt: "2026-04-13T19:00:01.000Z",
      triggeredBy: "finance-operator",
      triggerKind: "manual",
      compilerVersion: "f3a-deterministic-v1",
      stats: {
        pageCount: 4,
      },
      errorSummary: null,
      createdAt: "2026-04-13T19:00:00.000Z",
      updatedAt: "2026-04-13T19:00:01.000Z",
    });

    const parsed = CfoWikiCompileResultSchema.parse({
      companyId: run.companyId,
      companyKey: "acme",
      companyDisplayName: "Acme Holdings",
      compileRun: run,
      changedPageKeys: ["index", "company/overview"],
      pageInventory: [
        {
          pageKey: "index",
          markdownPath: "index.md",
          pageKind: "index",
          temporalStatus: "current",
          title: "CFO Wiki Index",
          summary: "Top-level navigation for the deterministic F3A wiki.",
          freshnessSummary: {
            state: "mixed",
            summary: "One implemented finance slice is present and others are still missing.",
          },
          limitations: ["Only deterministic F3A pages are available."],
          lastCompiledAt: "2026-04-13T19:00:01.000Z",
        },
      ],
      pageCount: 1,
      pageCountsByKind: {
        index: 1,
        log: 0,
        company_overview: 0,
        period_index: 0,
        source_coverage: 0,
        source_digest: 0,
        filed_artifact: 0,
      },
      freshnessSummary: {
        state: "mixed",
        summary: "One implemented finance slice is present and others are still missing.",
      },
      limitations: ["Only deterministic F3A pages are available."],
    });

    expect(parsed.compileRun.compilerVersion).toBe("f3a-deterministic-v1");
    expect(parsed.pageInventory[0]?.pageKey).toBe("index");
  });

  it("parses lint and export views with persisted route-backed state", () => {
    const lintSummary = CfoWikiLintSummarySchema.parse({
      companyId: "11111111-1111-4111-8111-111111111111",
      companyKey: "acme",
      companyDisplayName: "Acme Holdings",
      latestLintRun: {
        id: "22222222-2222-4222-8222-222222222222",
        companyId: "11111111-1111-4111-8111-111111111111",
        status: "succeeded",
        startedAt: "2026-04-13T19:00:00.000Z",
        completedAt: "2026-04-13T19:00:01.000Z",
        triggeredBy: "finance-operator",
        linterVersion: "f3c-wiki-lint-v1",
        stats: { findingCount: 1 },
        errorSummary: null,
        createdAt: "2026-04-13T19:00:00.000Z",
        updatedAt: "2026-04-13T19:00:01.000Z",
      },
      findingCount: 1,
      findingCountsByKind: {
        missing_refs: 1,
        uncited_numeric_claim: 0,
        orphan_page: 0,
        stale_page: 0,
        broken_link: 0,
        unsupported_document_gap: 0,
        duplicate_title: 0,
      },
      findings: [
        {
          id: "33333333-3333-4333-8333-333333333333",
          companyId: "11111111-1111-4111-8111-111111111111",
          lintRunId: "22222222-2222-4222-8222-222222222222",
          pageId: null,
          pageKey: "index",
          pageTitle: "Index",
          findingKind: "missing_refs",
          message: "Page has no refs.",
          details: {},
          createdAt: "2026-04-13T19:00:01.000Z",
        },
      ],
      limitations: [],
    });
    const exportDetail = CfoWikiExportDetailViewSchema.parse({
      companyId: "11111111-1111-4111-8111-111111111111",
      companyKey: "acme",
      companyDisplayName: "Acme Holdings",
      exportRun: {
        id: "44444444-4444-4444-8444-444444444444",
        companyId: "11111111-1111-4111-8111-111111111111",
        status: "succeeded",
        startedAt: "2026-04-13T19:10:00.000Z",
        completedAt: "2026-04-13T19:10:01.000Z",
        triggeredBy: "finance-operator",
        exporterVersion: "f3c-wiki-export-v1",
        bundleRootPath: "acme-cfo-wiki",
        pageCount: 1,
        fileCount: 2,
        manifest: {
          bundleRootPath: "acme-cfo-wiki",
          generatedAt: "2026-04-13T19:10:01.000Z",
          companyKey: "acme",
          companyDisplayName: "Acme Holdings",
          indexPath: "index.md",
          logPath: "log.md",
          pageCount: 1,
          fileCount: 2,
          limitations: [],
          pages: [
            {
              pageKey: "index",
              markdownPath: "index.md",
              pageKind: "index",
              ownershipKind: "compiler_owned",
              temporalStatus: "current",
              title: "Index",
            },
          ],
        },
        files: [
          {
            path: "index.md",
            contentType: "text/markdown",
            sha256:
              "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            sizeBytes: 8,
            body: "# Index\n",
          },
          {
            path: "manifest.json",
            contentType: "application/json",
            sha256:
              "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            sizeBytes: 2,
            body: "{}",
          },
        ],
        errorSummary: null,
        createdAt: "2026-04-13T19:10:00.000Z",
        updatedAt: "2026-04-13T19:10:01.000Z",
      },
      limitations: [],
    });

    expect(lintSummary.findingCountsByKind.missing_refs).toBe(1);
    expect(exportDetail.exportRun.bundleRootPath).toBe("acme-cfo-wiki");
  });
});
