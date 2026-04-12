import { describe, expect, it } from "vitest";
import { extractFinanceTwinSource } from "./extractor-dispatch";

describe("finance twin extractor dispatch", () => {
  it("detects trial-balance CSV without colliding with other finance families", () => {
    const extracted = extractFinanceTwinSource({
      body: Buffer.from(
        [
          "account_code,account_name,period_end,debit,credit",
          "1000,Cash,2026-03-31,125000.00,0.00",
        ].join("\n"),
      ),
      sourceFile: {
        mediaType: "text/csv",
        originalFileName: "trial-balance.csv",
      },
    });

    expect(extracted?.extractorKey).toBe("trial_balance_csv");
  });

  it("detects chart-of-accounts CSV without colliding with trial balance", () => {
    const extracted = extractFinanceTwinSource({
      body: Buffer.from(
        [
          "account_code,account_name,account_type,detail_type,parent_account_code,is_active",
          "1000,Cash,asset,current_asset,,true",
        ].join("\n"),
      ),
      sourceFile: {
        mediaType: "text/csv",
        originalFileName: "chart-of-accounts.csv",
      },
    });

    expect(extracted?.extractorKey).toBe("chart_of_accounts_csv");
  });

  it("detects general-ledger CSV before trial-balance-style amount columns can collide", () => {
    const extracted = extractFinanceTwinSource({
      body: Buffer.from(
        [
          "journal_id,transaction_date,period_end,account_code,account_name,debit,credit",
          "J-100,2026-03-31,2026-03-31,1000,Cash,100.00,0.00",
          "J-100,2026-03-31,2026-03-31,3000,Common Stock,0.00,100.00",
        ].join("\n"),
      ),
      sourceFile: {
        mediaType: "text/csv",
        originalFileName: "general-ledger.csv",
      },
    });

    expect(extracted?.extractorKey).toBe("general_ledger_csv");
  });

  it("detects bank-account-summary CSV before generic balance columns can be mistaken for other finance slices", () => {
    const extracted = extractFinanceTwinSource({
      body: Buffer.from(
        [
          "account_name,bank,last4,statement_balance,available_balance,currency,as_of",
          "Operating Checking,First National,1234,1200.00,1000.00,USD,2026-04-10",
        ].join("\n"),
      ),
      sourceFile: {
        mediaType: "text/csv",
        originalFileName: "bank-account-summary.csv",
      },
    });

    expect(extracted?.extractorKey).toBe("bank_account_summary_csv");
  });

  it("detects receivables-aging CSV before generic customer balance fields can be mistaken for trial balance or chart data", () => {
    const extracted = extractFinanceTwinSource({
      body: Buffer.from(
        [
          "customer_name,customer_id,as_of,current,past_due,total,currency",
          "Alpha Co,C-100,2026-04-30,100.00,20.00,120.00,USD",
        ].join("\n"),
      ),
      sourceFile: {
        mediaType: "text/csv",
        originalFileName: "receivables-aging.csv",
      },
    });

    expect(extracted?.extractorKey).toBe("receivables_aging_csv");
  });

  it("detects payables-aging CSV before generic vendor balance fields can be mistaken for bank, trial balance, or chart data", () => {
    const extracted = extractFinanceTwinSource({
      body: Buffer.from(
        [
          "account_name,currency,report_date,current,31_60,past_due,total",
          "Paper Supply Co,USD,2026-04-30,100.00,20.00,20.00,120.00",
        ].join("\n"),
      ),
      sourceFile: {
        mediaType: "text/csv",
        originalFileName: "accounts-payable-aging.csv",
      },
    });

    expect(extracted?.extractorKey).toBe("payables_aging_csv");
  });

  it("detects contract-metadata CSV without colliding with other finance families", () => {
    const extracted = extractFinanceTwinSource({
      body: Buffer.from(
        [
          "contract_id,contract_name,counterparty,status,renewal_date,next_payment_date,payment_amount,currency",
          "C-100,Master Services Agreement,Acme Customer,active,2026-11-01,2026-05-15,500.00,USD",
        ].join("\n"),
      ),
      sourceFile: {
        mediaType: "text/csv",
        originalFileName: "contract-metadata.csv",
      },
    });

    expect(extracted?.extractorKey).toBe("contract_metadata_csv");
  });
});
