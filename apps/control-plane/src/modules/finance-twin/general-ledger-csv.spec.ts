import { describe, expect, it } from "vitest";
import { FinanceTwinExtractionError } from "./errors";
import {
  extractGeneralLedgerCsv,
  looksLikeGeneralLedgerCsv,
  supportsGeneralLedgerCsvSource,
} from "./general-ledger-csv";

describe("general-ledger CSV extractor", () => {
  it("parses raw CSV bytes into explicit journal entries and journal lines", () => {
    const extracted = extractGeneralLedgerCsv({
      body: Buffer.from(
        [
          "journal_id,transaction_date,period_start,period_end,period_key,account_code,account_name,debit,credit,currency_code,memo",
          "J-100,2026-03-31,2026-03-01,2026-03-31,2026-03,1000,Cash,100.00,0.00,USD,Seed funding received",
          "J-100,2026-03-31,2026-03-01,2026-03-31,2026-03,3000,Common Stock,0.00,100.00,USD,Seed funding received",
          "J-101,2026-04-01,2026-03-01,2026-03-31,2026-03,6100,,25.00,0.00,USD,Office expense",
        ].join("\n"),
      ),
      sourceFile: {
        mediaType: "text/csv",
        originalFileName: "general-ledger.csv",
      },
    });

    expect(extracted.sourceDeclaredPeriod).toEqual({
      contextKind: "period_window",
      periodKey: "2026-03",
      periodStart: "2026-03-01",
      periodEnd: "2026-03-31",
      asOf: null,
    });
    expect(extracted.entries).toEqual([
      {
        externalEntryId: "J-100",
        transactionDate: "2026-03-31",
        entryDescription: null,
        lines: [
          {
            accountCode: "1000",
            accountName: "Cash",
            accountType: null,
            debitAmount: "100.00",
            creditAmount: "0.00",
            currencyCode: "USD",
            lineDescription: "Seed funding received",
            lineNumber: 2,
          },
          {
            accountCode: "3000",
            accountName: "Common Stock",
            accountType: null,
            debitAmount: "0.00",
            creditAmount: "100.00",
            currencyCode: "USD",
            lineDescription: "Seed funding received",
            lineNumber: 3,
          },
        ],
      },
      {
        externalEntryId: "J-101",
        transactionDate: "2026-04-01",
        entryDescription: null,
        lines: [
          {
            accountCode: "6100",
            accountName: null,
            accountType: null,
            debitAmount: "25.00",
            creditAmount: "0.00",
            currencyCode: "USD",
            lineDescription: "Office expense",
            lineNumber: 4,
          },
        ],
      },
    ]);
  });

  it("returns null source-declared period context when only journal activity dates are present", () => {
    const extracted = extractGeneralLedgerCsv({
      body: Buffer.from(
        [
          "journal_id,transaction_date,account_code,debit,credit",
          "J-100,2026-03-31,1000,10.00,0.00",
        ].join("\n"),
      ),
      sourceFile: {
        mediaType: "text/csv",
        originalFileName: "general-ledger.csv",
      },
    });

    expect(extracted.sourceDeclaredPeriod).toBeNull();
  });

  it("rejects conflicting source-declared period values", () => {
    expect(() =>
      extractGeneralLedgerCsv({
        body: Buffer.from(
          [
            "journal_id,transaction_date,period_end,account_code,debit,credit",
            "J-100,2026-03-31,2026-03-31,1000,10.00,0.00",
            "J-101,2026-03-31,2026-04-30,1000,0.00,10.00",
          ].join("\n"),
        ),
        sourceFile: {
          mediaType: "text/csv",
          originalFileName: "general-ledger.csv",
        },
      }),
    ).toThrowError(FinanceTwinExtractionError);
  });

  it("rejects files that lack a stable journal identity column", () => {
    expect(() =>
      extractGeneralLedgerCsv({
        body: Buffer.from(
          [
            "transaction_date,account_code,debit,credit",
            "2026-03-31,1000,10.00,0.00",
          ].join("\n"),
        ),
        sourceFile: {
          mediaType: "text/csv",
          originalFileName: "general-ledger.csv",
        },
      }),
    ).toThrowError(FinanceTwinExtractionError);
  });

  it("uses the media type or file extension to recognize supported CSV sources", () => {
    expect(
      supportsGeneralLedgerCsvSource({
        mediaType: "text/csv",
        originalFileName: "general-ledger.txt",
      }),
    ).toBe(true);
    expect(
      supportsGeneralLedgerCsvSource({
        mediaType: "application/octet-stream",
        originalFileName: "general-ledger.csv",
      }),
    ).toBe(true);
    expect(
      looksLikeGeneralLedgerCsv({
        body: Buffer.from(
          [
            "journal_id,transaction_date,account_code,debit,credit",
            "J-100,2026-03-31,1000,10.00,0.00",
          ].join("\n"),
        ),
        sourceFile: {
          mediaType: "text/csv",
          originalFileName: "general-ledger.csv",
        },
      }),
    ).toBe(true);
  });
});
