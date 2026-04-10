import { describe, expect, it } from "vitest";
import { FinanceTwinExtractionError } from "./errors";
import {
  extractChartOfAccountsCsv,
  looksLikeChartOfAccountsCsv,
  supportsChartOfAccountsCsvSource,
} from "./chart-of-accounts-csv";

describe("chart-of-accounts CSV extractor", () => {
  it("parses raw CSV bytes into persisted account-catalog rows", () => {
    const extracted = extractChartOfAccountsCsv({
      body: Buffer.from(
        [
          "account_code,account_name,account_type,detail_type,parent_account_code,is_active,description",
          "1000,Cash,asset,current_asset,,true,Operating cash",
          "1100,Petty Cash,asset,current_asset,1000,false,Small cash drawer",
        ].join("\n"),
      ),
      sourceFile: {
        mediaType: "text/csv",
        originalFileName: "chart-of-accounts.csv",
      },
    });

    expect(extracted.accounts).toEqual([
      {
        accountCode: "1000",
        accountName: "Cash",
        accountType: "asset",
        detailType: "current_asset",
        description: "Operating cash",
        parentAccountCode: null,
        isActive: true,
        lineNumber: 2,
      },
      {
        accountCode: "1100",
        accountName: "Petty Cash",
        accountType: "asset",
        detailType: "current_asset",
        description: "Small cash drawer",
        parentAccountCode: "1000",
        isActive: false,
        lineNumber: 3,
      },
    ]);
  });

  it("rejects conflicting duplicate account rows", () => {
    expect(() =>
      extractChartOfAccountsCsv({
        body: Buffer.from(
          [
            "account_code,account_name,account_type",
            "1000,Cash,asset",
            "1000,Cash and Cash Equivalents,asset",
          ].join("\n"),
        ),
        sourceFile: {
          mediaType: "text/csv",
          originalFileName: "chart-of-accounts.csv",
        },
      }),
    ).toThrowError(FinanceTwinExtractionError);
  });

  it("uses metadata columns or filename hints to recognize supported account catalogs", () => {
    expect(
      supportsChartOfAccountsCsvSource({
        mediaType: "text/csv",
        originalFileName: "chart-of-accounts.txt",
      }),
    ).toBe(true);
    expect(
      looksLikeChartOfAccountsCsv({
        body: Buffer.from(
          [
            "account_code,account_name",
            "1000,Cash",
          ].join("\n"),
        ),
        sourceFile: {
          mediaType: "text/csv",
          originalFileName: "coa.csv",
        },
      }),
    ).toBe(true);
  });
});
