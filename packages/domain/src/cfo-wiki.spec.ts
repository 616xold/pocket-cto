import { describe, expect, it } from "vitest";
import {
  CfoWikiCompileResultSchema,
  CfoWikiCompileRunRecordSchema,
  CfoWikiCompileRequestSchema,
  CfoWikiPageKeySchema,
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
});
