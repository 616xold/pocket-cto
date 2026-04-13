import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createTestDb, resetTestDatabase, closeTestDatabase } from "../../test/database";
import { DrizzleFinanceTwinRepository } from "../finance-twin/drizzle-repository";
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
    const wikiRepository = new DrizzleCfoWikiRepository(db);
    const company = await financeRepository.upsertCompany({
      companyKey: "acme",
      displayName: "Acme Holdings",
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

    expect(pages).toHaveLength(2);
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
});
