import { describe, expect, it } from "vitest";
import { buildCfoWikiExportBundle } from "./export-bundle";

describe("buildCfoWikiExportBundle", () => {
  it("renders a deterministic markdown-first bundle plus manifest", () => {
    const bundle = buildCfoWikiExportBundle({
      company: {
        id: "11111111-1111-4111-8111-111111111111",
        companyKey: "acme",
        displayName: "Acme Holdings",
        createdAt: "2026-04-13T12:00:00.000Z",
        updatedAt: "2026-04-13T12:00:00.000Z",
      },
      exportedAt: "2026-04-13T12:05:00.000Z",
      limitations: [],
      pages: [
        {
          id: "22222222-2222-4222-8222-222222222222",
          companyId: "11111111-1111-4111-8111-111111111111",
          compileRunId: "33333333-3333-4333-8333-333333333333",
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
          lastCompiledAt: "2026-04-13T12:04:00.000Z",
          filedMetadata: null,
          createdAt: "2026-04-13T12:04:00.000Z",
          updatedAt: "2026-04-13T12:04:00.000Z",
        },
      ],
    });

    expect(bundle.bundleRootPath).toBe("acme-cfo-wiki");
    expect(bundle.pageCount).toBe(1);
    expect(bundle.fileCount).toBe(2);
    expect(bundle.files.map((file) => file.path)).toEqual([
      "index.md",
      "manifest.json",
    ]);
    expect(bundle.manifest.pages[0]?.markdownPath).toBe("index.md");
  });
});
