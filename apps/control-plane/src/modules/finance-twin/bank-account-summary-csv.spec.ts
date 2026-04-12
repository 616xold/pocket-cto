import { describe, expect, it } from "vitest";
import { extractBankAccountSummaryCsv } from "./bank-account-summary-csv";
import type { FinanceTwinExtractionError } from "./errors";

describe("bank-account-summary CSV extractor", () => {
  it("extracts deterministic bank-account summaries and keeps generic balances unspecified", () => {
    const extracted = extractBankAccountSummaryCsv({
      body: Buffer.from(
        [
          "account_name,bank,last4,statement_balance,available_balance,current_balance,currency,as_of",
          "Operating Checking,First National,1234,1200.00,1000.00,,USD,2026-04-10",
          "Reserve,First National,5678,,,250.00,USD,",
          "Reserve,First National,5678,,,250.00,USD,",
        ].join("\n"),
      ),
      sourceFile: {
        mediaType: "text/csv",
        originalFileName: "bank-account-summary.csv",
      },
    });

    expect(extracted.accounts).toHaveLength(2);
    expect(extracted.summaries).toHaveLength(3);
    expect(extracted.summaries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          accountIdentityKey: "label_last4:operating checking|1234",
          balanceAmount: "1200.00",
          balanceSourceColumn: "statement_balance",
          balanceType: "statement_or_ledger",
          currencyCode: "USD",
          asOfDate: "2026-04-10",
        }),
        expect.objectContaining({
          accountIdentityKey: "label_last4:operating checking|1234",
          balanceAmount: "1000.00",
          balanceSourceColumn: "available_balance",
          balanceType: "available",
          currencyCode: "USD",
          asOfDate: "2026-04-10",
        }),
        expect.objectContaining({
          accountIdentityKey: "label_last4:reserve|5678",
          balanceAmount: "250.00",
          balanceSourceColumn: "current_balance",
          balanceType: "unspecified",
          currencyCode: "USD",
          asOfDate: null,
        }),
      ]),
    );
  });

  it("fails when duplicate rows conflict for the same account and balance family", () => {
    expect(() =>
      extractBankAccountSummaryCsv({
        body: Buffer.from(
          [
            "account_name,bank,last4,statement_balance,currency,as_of",
            "Operating Checking,First National,1234,1200.00,USD,2026-04-10",
            "Operating Checking,First National,1234,1300.00,USD,2026-04-10",
          ].join("\n"),
        ),
        sourceFile: {
          mediaType: "text/csv",
          originalFileName: "bank-account-summary.csv",
        },
      }),
    ).toThrowError(
      expect.objectContaining<Partial<FinanceTwinExtractionError>>({
        code: "bank_account_summary_balance_conflict",
      }),
    );
  });

  it("fails when one row contains conflicting date columns", () => {
    expect(() =>
      extractBankAccountSummaryCsv({
        body: Buffer.from(
          [
            "account_name,last4,balance,as_of,statement_date,currency",
            "Operating Checking,1234,1200.00,2026-04-10,2026-04-11,USD",
          ].join("\n"),
        ),
        sourceFile: {
          mediaType: "text/csv",
          originalFileName: "bank-account-summary.csv",
        },
      }),
    ).toThrowError(
      expect.objectContaining<Partial<FinanceTwinExtractionError>>({
        code: "bank_account_summary_date_conflict",
      }),
    );
  });
});
