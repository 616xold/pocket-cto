import { describe, expect, it } from "vitest";
import { extractReceivablesAgingCsv } from "./receivables-aging-csv";
import type { FinanceTwinExtractionError } from "./errors";

describe("receivables-aging CSV extractor", () => {
  it("extracts deterministic customer aging rows, preserves exact bucket labels, and dedupes identical duplicates", () => {
    const extracted = extractReceivablesAgingCsv({
      body: Buffer.from(
        [
          "customer_name,customer_id,currency_code,aging_date,current,31_60,over_90,past_due,total",
          "Alpha Co,C-100,USD,2026-04-30,100.00,20.00,,20.00,120.00",
          "Alpha Co,C-100,USD,2026-04-30,100.00,20.00,,20.00,120.00",
          "Beta Co,C-200,EUR,2026-04-29,,,50.00,,50.00",
        ].join("\n"),
      ),
      sourceFile: {
        mediaType: "text/csv",
        originalFileName: "receivables-aging.csv",
      },
    });

    expect(extracted.customers).toHaveLength(2);
    expect(extracted.reportedBucketKeys).toEqual([
      "current",
      "31_60",
      "over_90",
      "past_due",
      "total",
    ]);
    expect(extracted.rows).toHaveLength(2);
    expect(extracted.rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          customerIdentityKey: "customer_id:c-100",
          currencyCode: "USD",
          asOfDate: "2026-04-30",
          lineNumber: 2,
          sourceLineNumbers: [2, 3],
          bucketValues: [
            {
              bucketKey: "current",
              bucketClass: "current",
              amount: "100.00",
              sourceColumn: "current",
            },
            {
              bucketKey: "31_60",
              bucketClass: "past_due_detail",
              amount: "20.00",
              sourceColumn: "31_60",
            },
            {
              bucketKey: "past_due",
              bucketClass: "past_due_total",
              amount: "20.00",
              sourceColumn: "past_due",
            },
            {
              bucketKey: "total",
              bucketClass: "total",
              amount: "120.00",
              sourceColumn: "total",
            },
          ],
        }),
        expect.objectContaining({
          customerIdentityKey: "customer_id:c-200",
          currencyCode: "EUR",
          asOfDate: "2026-04-29",
          bucketValues: [
            {
              bucketKey: "over_90",
              bucketClass: "past_due_partial_rollup",
              amount: "50.00",
              sourceColumn: "over_90",
            },
            {
              bucketKey: "total",
              bucketClass: "total",
              amount: "50.00",
              sourceColumn: "total",
            },
          ],
        }),
      ]),
    );
  });

  it("fails when duplicate rows conflict for the same customer, currency, date, and bucket", () => {
    expect(() =>
      extractReceivablesAgingCsv({
        body: Buffer.from(
          [
            "customer_name,currency,as_of,current,total",
            "Alpha Co,USD,2026-04-30,120.00,120.00",
            "Alpha Co,USD,2026-04-30,130.00,130.00",
          ].join("\n"),
        ),
        sourceFile: {
          mediaType: "text/csv",
          originalFileName: "receivables-aging.csv",
        },
      }),
    ).toThrowError(
      expect.objectContaining<Partial<FinanceTwinExtractionError>>({
        code: "receivables_aging_row_conflict",
      }),
    );
  });
});
