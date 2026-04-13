import { describe, expect, it } from "vitest";
import type { FinanceCompanyRecord, FinanceReportingPeriodRecord } from "@pocket-cto/domain";
import { buildPeriodPageKey, buildWikiPageRegistry } from "./page-registry";

describe("buildWikiPageRegistry", () => {
  const company: FinanceCompanyRecord = {
    id: "11111111-1111-4111-8111-111111111111",
    companyKey: "acme",
    displayName: "Acme Holdings",
    createdAt: "2026-04-13T10:00:00.000Z",
    updatedAt: "2026-04-13T10:00:00.000Z",
  };

  it("returns the deterministic F3A registry with canonical page keys", () => {
    const periods: FinanceReportingPeriodRecord[] = [
      {
        id: "22222222-2222-4222-8222-222222222222",
        companyId: company.id,
        periodKey: "2026-03",
        label: "March 2026",
        periodStart: "2026-03-01",
        periodEnd: "2026-03-31",
        createdAt: "2026-04-13T10:00:00.000Z",
        updatedAt: "2026-04-13T10:00:00.000Z",
      },
      {
        id: "33333333-3333-4333-8333-333333333333",
        companyId: company.id,
        periodKey: "2026-02",
        label: "February 2026",
        periodStart: "2026-02-01",
        periodEnd: "2026-02-28",
        createdAt: "2026-04-13T10:00:00.000Z",
        updatedAt: "2026-04-13T10:00:00.000Z",
      },
    ];

    expect(buildPeriodPageKey("2026-03")).toBe("periods/2026-03/index");
    expect(buildWikiPageRegistry(company, periods)).toEqual([
      expect.objectContaining({ pageKey: "company/overview", pageKind: "company_overview" }),
      expect.objectContaining({ pageKey: "index", pageKind: "index" }),
      expect.objectContaining({ pageKey: "log", pageKind: "log" }),
      expect.objectContaining({
        pageKey: "periods/2026-02/index",
        pageKind: "period_index",
        temporalStatus: "historical",
      }),
      expect.objectContaining({
        pageKey: "periods/2026-03/index",
        pageKind: "period_index",
        temporalStatus: "current",
      }),
      expect.objectContaining({ pageKey: "sources/coverage", pageKind: "source_coverage" }),
    ]);
  });
});
