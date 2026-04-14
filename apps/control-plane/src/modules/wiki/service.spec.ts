import { describe, expect, it } from "vitest";
import { SourceRegistryService } from "../sources/service";
import { InMemorySourceRepository } from "../sources/repository";
import { InMemorySourceFileStorage } from "../sources/storage";
import { FinanceTwinService } from "../finance-twin/service";
import { InMemoryFinanceTwinRepository } from "../finance-twin/repository";
import { CfoWikiCompileAlreadyRunningError } from "./errors";
import { InMemoryCfoWikiRepository } from "./repository";
import { CfoWikiService } from "./service";

describe("CfoWikiService", () => {
  it("compiles the deterministic F3 wiki foundation plus F3D knowledge pages for one company", async () => {
    const context = createWikiTestContext();

    await seedTrialBalanceSlice(context, {
      companyKey: "acme",
      companyName: "Acme Holdings",
      createdBy: "finance-operator",
    });

    const compiled = await context.wikiService.compileCompanyWiki("acme", {
      triggeredBy: "operator",
    });
    const periodPageKey = compiled.pageInventory.find(
      (page) => page.pageKind === "period_index",
    )?.pageKey;
    const companySummary = await context.wikiService.getCompanySummary("acme");
    const periodPage = await context.wikiService.getPage(
      "acme",
      periodPageKey ?? "periods/2026-03/index",
    );

    expect(periodPageKey).toBeDefined();
    expect(compiled).toMatchObject({
      companyKey: "acme",
      pageCount: 18,
      pageCountsByKind: {
        index: 1,
        log: 1,
        company_overview: 1,
        period_index: 1,
        source_coverage: 1,
        source_digest: 0,
        concept: 6,
        metric_definition: 7,
        policy: 0,
      },
      compileRun: {
        status: "succeeded",
      },
    });
    expect(compiled.changedPageKeys).toEqual(
      expect.arrayContaining([
        "company/overview",
        "index",
        "log",
        periodPageKey!,
        "sources/coverage",
      ]),
    );
    expect(companySummary).toMatchObject({
      companyKey: "acme",
      pageCount: 18,
      pageCountsByKind: {
        period_index: 1,
        source_digest: 0,
        concept: 6,
        metric_definition: 7,
        policy: 0,
      },
      latestSuccessfulCompileRun: {
        status: "succeeded",
      },
    });
    expect(periodPage).toMatchObject({
      companyKey: "acme",
      page: {
        pageKey: periodPageKey,
        pageKind: "period_index",
      },
      latestCompileRun: {
        status: "succeeded",
      },
    });
    expect(["fresh", "missing", "mixed"]).toContain(periodPage.freshnessSummary.state);
    expect(periodPage.page.markdownBody).toContain("## Matching Finance Slice Coverage");
    expect(periodPage.links.length).toBeGreaterThan(0);
    expect(periodPage.refs.some((ref) => ref.refKind === "twin_fact")).toBe(
      true,
    );
  });

  it("still compiles the non-period pages and fixed knowledge pages when Finance Twin state is absent", async () => {
    const context = createWikiTestContext();

    await context.financeRepository.upsertCompany({
      companyKey: "partial-co",
      displayName: "Partial Co",
    });

    const compiled = await context.wikiService.compileCompanyWiki("partial-co", {
      triggeredBy: "operator",
    });
    const overviewPage = await context.wikiService.getPage(
      "partial-co",
      "company/overview",
    );

    expect(compiled).toMatchObject({
      companyKey: "partial-co",
      pageCount: 17,
      pageCountsByKind: {
        period_index: 0,
        source_digest: 0,
        concept: 6,
        metric_definition: 7,
        policy: 0,
      },
    });
    expect(compiled.changedPageKeys).toEqual(
      expect.arrayContaining([
        "company/overview",
        "index",
        "log",
        "sources/coverage",
      ]),
    );
    expect(overviewPage.limitations).toContain(
      "No Finance Twin slice has completed successfully for this company yet, so the wiki surfaces missing coverage instead of synthesized facts.",
    );
    expect(overviewPage.page.markdownBody).toContain(
      "No Finance Twin reporting periods are stored yet",
    );
  });

  it("rejects a concurrent running compile for the same company", async () => {
    const context = createWikiTestContext();
    const company = await context.financeRepository.upsertCompany({
      companyKey: "busy-co",
      displayName: "Busy Co",
    });

    await context.wikiRepository.startCompileRun({
      companyId: company.id,
      companyKey: company.companyKey,
      startedAt: context.now().toISOString(),
      triggeredBy: "operator",
      triggerKind: "manual",
      compilerVersion: "test",
    });

    await expect(
      context.wikiService.compileCompanyWiki("busy-co", {
        triggeredBy: "operator",
      }),
    ).rejects.toBeInstanceOf(CfoWikiCompileAlreadyRunningError);
  });

  it("records a failed compile without erasing the prior successful pages", async () => {
    const context = createWikiTestContext();

    await seedTrialBalanceSlice(context, {
      companyKey: "acme",
      companyName: "Acme Holdings",
      createdBy: "finance-operator",
    });

    await context.wikiService.compileCompanyWiki("acme", {
      triggeredBy: "operator",
    });

    const failingService = new CfoWikiService({
      financeTwinRepository: context.financeRepository,
      sourceFileStorage: context.sourceStorage,
      sourceRepository: context.sourceRepository,
      wikiRepository: context.wikiRepository,
      now: context.now,
      compilePages: () => {
        throw new Error("forced compile failure");
      },
      compilerVersion: "test",
    });

    await expect(
      failingService.compileCompanyWiki("acme", {
        triggeredBy: "operator",
      }),
    ).rejects.toThrow("forced compile failure");

    const summary = await context.wikiService.getCompanySummary("acme");
    const indexPage = await context.wikiService.getIndexPage("acme");

    expect(summary.pageCount).toBe(18);
    expect(indexPage.latestCompileRun?.status).toBe("failed");
    expect(indexPage.limitations.some((limitation) => limitation.includes("latest CFO Wiki compile failed"))).toBe(true);
  });

  it("persists deterministic lint findings and export bundle metadata from stored wiki state", async () => {
    const context = createWikiTestContext();

    await seedTrialBalanceSlice(context, {
      companyKey: "acme",
      companyName: "Acme Holdings",
      createdBy: "finance-operator",
    });
    await context.wikiService.compileCompanyWiki("acme", {
      triggeredBy: "operator",
    });

    const linted = await context.wikiService.runCompanyLint("acme", {
      triggeredBy: "finance-operator",
    });
    const exported = await context.wikiService.exportCompanyWiki("acme", {
      triggeredBy: "finance-operator",
    });

    expect(linted.latestLintRun?.status).toBe("succeeded");
    expect(linted.findingCount).toBeGreaterThanOrEqual(0);
    expect(exported.exportRun.status).toBe("succeeded");
    expect(exported.exportRun.fileCount).toBeGreaterThan(0);
    expect(exported.exportRun.manifest?.bundleRootPath).toBe("acme-cfo-wiki");
  });

  it("preserves filed artifact pages across later compiler-owned replacement", async () => {
    const context = createWikiTestContext();

    await seedTrialBalanceSlice(context, {
      companyKey: "acme",
      companyName: "Acme Holdings",
      createdBy: "finance-operator",
    });
    await context.wikiService.compileCompanyWiki("acme", {
      triggeredBy: "operator",
    });
    await context.wikiService.createFiledPage("acme", {
      title: "Board deck notes",
      markdownBody: "Collections remain tight.",
      filedBy: "finance-operator",
      provenanceSummary: "Filed after board review.",
    });

    await context.wikiService.compileCompanyWiki("acme", {
      triggeredBy: "operator",
    });

    const filedPage = await context.wikiService.getPage(
      "acme",
      "filed/board-deck-notes",
    );
    const summary = await context.wikiService.getCompanySummary("acme");

    expect(filedPage.page.ownershipKind).toBe("filed_artifact");
    expect(filedPage.page.filedMetadata?.filedBy).toBe("finance-operator");
    expect(
      summary.pages.some((page) => page.pageKey === "filed/board-deck-notes"),
    ).toBe(true);
  });
});

function createWikiTestContext() {
  let tick = 0;
  const baseTime = new Date("2026-04-13T12:00:00.000Z");
  const now = () => new Date(baseTime.getTime() + tick++ * 1000);
  const sourceRepository = new InMemorySourceRepository();
  const sourceStorage = new InMemorySourceFileStorage();
  const sourceService = new SourceRegistryService(
    sourceRepository,
    sourceStorage,
    now,
  );
  const financeRepository = new InMemoryFinanceTwinRepository();
  const financeTwinService = new FinanceTwinService({
    financeTwinRepository: financeRepository,
    sourceFileStorage: sourceStorage,
    sourceRepository,
    now,
  });
  const wikiRepository = new InMemoryCfoWikiRepository();
  const wikiService = new CfoWikiService({
    financeTwinRepository: financeRepository,
    sourceFileStorage: sourceStorage,
    sourceRepository,
    wikiRepository,
    now,
    compilerVersion: "test",
  });

  return {
    financeRepository,
    financeTwinService,
    now,
    sourceRepository,
    sourceStorage,
    sourceService,
    wikiRepository,
    wikiService,
  };
}

async function seedTrialBalanceSlice(
  context: ReturnType<typeof createWikiTestContext>,
  input: {
    companyKey: string;
    companyName: string;
    createdBy: string;
  },
) {
  const created = await context.sourceService.createSource({
    kind: "dataset",
    name: `${input.companyName} trial balance`,
    createdBy: input.createdBy,
    originKind: "manual",
    snapshot: {
      originalFileName: `${input.companyKey}-trial-balance-link.txt`,
      mediaType: "text/plain",
      sizeBytes: 18,
      checksumSha256:
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      storageKind: "external_url",
      storageRef: `https://example.com/${input.companyKey}/trial-balance`,
      ingestStatus: "registered",
    },
  });
  const registered = await context.sourceService.registerSourceFile(
    created.source.id,
    {
      originalFileName: `${input.companyKey}-trial-balance.csv`,
      mediaType: "text/csv",
      createdBy: input.createdBy,
    },
    Buffer.from(
      [
        "account_code,account_name,period_end,debit,credit,currency_code,account_type",
        "1000,Cash,2026-03-31,125000.00,0.00,USD,asset",
        "2000,Accounts Payable,2026-03-31,0.00,42000.00,USD,liability",
      ].join("\n"),
    ),
  );

  return context.financeTwinService.syncCompanySourceFile(
    input.companyKey,
    registered.sourceFile.id,
    {
      companyName: input.companyName,
    },
  );
}
