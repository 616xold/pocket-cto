import { describe, expect, it } from "vitest";
import { extractCardExpenseCsv } from "./card-expense-csv";
import type { FinanceTwinExtractionError } from "./errors";

describe("card-expense CSV extractor", () => {
  it("extracts explicit spend rows while preserving separate amount, date, and weak status semantics", () => {
    const extracted = extractCardExpenseCsv({
      body: Buffer.from(
        [
          "transaction_id,merchant,employee,card_name,card_last4,category,memo,amount,posted_amount,transaction_amount,currency,transaction_date,posted_date,expense_date,report_date,as_of,status,state,reimbursable,pending",
          "TX-100,Delta Air,Alex Jones,Corporate Travel,1234,travel,Flight to NYC,500.00,505.00,495.00,usd,2026-04-01,2026-04-03,2026-04-02,2026-04-04,2026-04-05,submitted,in_review,true,false",
          ",Coffee House,Alex Jones,Team Card,9876,meals,Team coffee,12.50,,,USD,2026-04-01,,,,,pending,,false,true",
          ",Coffee House,Alex Jones,Team Card,9876,meals,Team coffee,12.50,,,USD,2026-04-01,,,,,pending,,false,true",
        ].join("\n"),
      ),
      sourceFile: {
        mediaType: "text/csv",
        originalFileName: "card-expense.csv",
      },
    });

    expect(extracted.rows).toHaveLength(3);
    expect(extracted.rows[0]).toMatchObject({
      explicitRowIdentity: "TX-100",
      explicitRowIdentitySourceField: "transaction_id",
      merchantLabel: "Delta Air",
      employeeLabel: "Alex Jones",
      cardLabel: "Corporate Travel",
      cardLast4: "1234",
      amount: "500.00",
      postedAmount: "505.00",
      transactionAmount: "495.00",
      currencyCode: "USD",
      transactionDate: "2026-04-01",
      postedDate: "2026-04-03",
      expenseDate: "2026-04-02",
      reportDate: "2026-04-04",
      asOfDate: "2026-04-05",
      status: "submitted",
      state: "in_review",
      reimbursable: true,
      pending: false,
      sourceLineNumbers: [2],
    });
    expect(extracted.rows[1]).toMatchObject({
      explicitRowIdentity: null,
      rowScopeKey: "line:3",
      amount: "12.50",
      postedAmount: null,
      transactionAmount: null,
      transactionDate: "2026-04-01",
      postedDate: null,
      status: "pending",
      state: null,
      reimbursable: false,
      pending: true,
    });
    expect(extracted.rows[2]).toMatchObject({
      explicitRowIdentity: null,
      rowScopeKey: "line:4",
      sourceLineNumbers: [4],
    });
  });

  it("fails when duplicate rows with the same explicit identity conflict", () => {
    expect(() =>
      extractCardExpenseCsv({
        body: Buffer.from(
          [
            "transaction_id,merchant,amount,currency,transaction_date,status",
            "TX-100,Delta Air,500.00,USD,2026-04-01,submitted",
            "TX-100,Delta Air,550.00,USD,2026-04-01,submitted",
          ].join("\n"),
        ),
        sourceFile: {
          mediaType: "text/csv",
          originalFileName: "card-expense.csv",
        },
      }),
    ).toThrowError(
      expect.objectContaining<Partial<FinanceTwinExtractionError>>({
        code: "card_expense_row_conflict",
      }),
    );
  });

  it("fails when equivalent currency columns disagree on the same row", () => {
    expect(() =>
      extractCardExpenseCsv({
        body: Buffer.from(
          [
            "transaction_id,merchant,amount,currency,currency_code,transaction_date",
            "TX-100,Delta Air,500.00,USD,EUR,2026-04-01",
          ].join("\n"),
        ),
        sourceFile: {
          mediaType: "text/csv",
          originalFileName: "card-expense.csv",
        },
      }),
    ).toThrowError(
      expect.objectContaining<Partial<FinanceTwinExtractionError>>({
        code: "card_expense_field_conflict",
      }),
    );
  });
});
