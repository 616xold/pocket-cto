import { describe, expect, it } from "vitest";
import { extractContractMetadataCsv } from "./contract-metadata-csv";
import type { FinanceTwinExtractionError } from "./errors";

describe("contract-metadata CSV extractor", () => {
  it("extracts deterministic contract facts, preserves weak semantics, and only emits explicit obligations", () => {
    const extracted = extractContractMetadataCsv({
      body: Buffer.from(
        [
          "contract_id,contract_name,counterparty,contract_type,status,renewal_date,notice_deadline,next_payment_date,payment_amount,amount,currency,as_of,end_date,auto_renew",
          "C-100,Master Services Agreement,Acme Customer,msa,active,2026-11-01,2026-10-01,2026-05-15,500.00,12000.00,USD,2026-04-30,2026-12-31,true",
          "C-100,Master Services Agreement,Acme Customer,msa,active,2026-11-01,2026-10-01,2026-05-15,500.00,12000.00,USD,2026-04-30,2026-12-31,true",
          "L-200,Office Lease,Landlord LLC,lease,active,,,2026-06-01,,24000.00,EUR,2026-04-29,2027-01-31,false",
          "NDA-1,NDA,Partner Co,confidentiality,draft,,,,,,GBP,,,",
        ].join("\n"),
      ),
      sourceFile: {
        mediaType: "text/csv",
        originalFileName: "contract-metadata.csv",
      },
    });

    expect(extracted.contracts).toHaveLength(3);
    expect(extracted.obligations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          contractIdentityKey: "contract_id:c-100",
          obligationType: "renewal",
          dueDate: "2026-11-01",
          amount: null,
          currencyCode: null,
          sourceField: "renewal_date",
        }),
        expect.objectContaining({
          contractIdentityKey: "contract_id:c-100",
          obligationType: "notice_deadline",
          dueDate: "2026-10-01",
          amount: null,
          currencyCode: null,
          sourceField: "notice_deadline",
        }),
        expect.objectContaining({
          contractIdentityKey: "contract_id:c-100",
          obligationType: "scheduled_payment",
          dueDate: "2026-05-15",
          amount: "500.00",
          currencyCode: "USD",
          sourceField: "next_payment_date",
        }),
        expect.objectContaining({
          contractIdentityKey: "contract_id:c-100",
          obligationType: "end_date",
          dueDate: "2026-12-31",
          amount: null,
          currencyCode: null,
          sourceField: "end_date",
        }),
        expect.objectContaining({
          contractIdentityKey: "contract_id:l-200",
          obligationType: "scheduled_payment",
          dueDate: "2026-06-01",
          amount: null,
          currencyCode: null,
          sourceField: "next_payment_date",
        }),
      ]),
    );
    expect(
      extracted.contracts.find(
        (contract) => contract.contractIdentityKey === "contract_id:c-100",
      ),
    ).toMatchObject({
      contractLabel: "Master Services Agreement",
      contractType: "msa",
      status: "active",
      knownAsOfDates: ["2026-04-30"],
      sourceLineNumbers: [2, 3],
      amount: "12000.00",
      paymentAmount: "500.00",
      currencyCode: "USD",
      autoRenew: true,
    });
    expect(
      extracted.obligations.some(
        (obligation) => obligation.contractIdentityKey === "contract_label:nda" ,
      ),
    ).toBe(false);
  });

  it("fails when duplicate contract rows conflict for the same contract identity", () => {
    expect(() =>
      extractContractMetadataCsv({
        body: Buffer.from(
          [
            "contract_id,contract_name,status,renewal_date",
            "C-100,Master Services Agreement,active,2026-11-01",
            "C-100,Master Services Agreement,expired,2026-11-01",
          ].join("\n"),
        ),
        sourceFile: {
          mediaType: "text/csv",
          originalFileName: "contract-metadata.csv",
        },
      }),
    ).toThrowError(
      expect.objectContaining<Partial<FinanceTwinExtractionError>>({
        code: "contract_metadata_contract_conflict",
      }),
    );
  });

  it("fails when one row includes conflicting weak field aliases", () => {
    expect(() =>
      extractContractMetadataCsv({
        body: Buffer.from(
          [
            "contract_name,counterparty,partner,renewal_date",
            "MSA,Acme Customer,Another Partner,2026-11-01",
          ].join("\n"),
        ),
        sourceFile: {
          mediaType: "text/csv",
          originalFileName: "contract-metadata.csv",
        },
      }),
    ).toThrowError(
      expect.objectContaining<Partial<FinanceTwinExtractionError>>({
        code: "contract_metadata_field_conflict",
      }),
    );
  });
});
