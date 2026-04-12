import type {
  FinanceReceivablesAgingBucketKey,
  FinanceReceivablesAgingBucketValue,
  SourceFileRecord,
} from "@pocket-cto/domain";
import {
  buildHeaderLookup,
  decodeCsvText,
  getOptionalHeaderIndex,
  parseCsvRows,
  supportsCsvLikeSource,
} from "./csv-utils";
import { FinanceTwinExtractionError } from "./errors";
import {
  getReceivablesAgingBucketDefinition,
  RECEIVABLES_AGING_BUCKET_ORDER,
  sortReceivablesAgingBucketValues,
} from "./receivables-aging-buckets";

const CUSTOMER_LABEL_HEADERS = [
  "customer",
  "customer_name",
  "account_name",
  "account",
];
const CUSTOMER_ID_HEADERS = ["customer_id"];
const DATE_HEADERS = ["as_of", "aging_date", "report_date", "snapshot_date"];
const CURRENCY_HEADERS = ["currency", "currency_code"];

type ExtractedCustomer = {
  customerLabel: string;
  externalCustomerId: string | null;
  identityKey: string;
};

export type ExtractedReceivablesAgingRow = {
  asOfDate: string | null;
  asOfDateSourceColumn: string | null;
  bucketValues: FinanceReceivablesAgingBucketValue[];
  currencyCode: string | null;
  customerIdentityKey: string;
  lineNumber: number;
  rowScopeKey: string;
  sourceLineNumbers: number[];
};

export type ReceivablesAgingExtractionResult = {
  customers: ExtractedCustomer[];
  reportedBucketKeys: FinanceReceivablesAgingBucketKey[];
  rows: ExtractedReceivablesAgingRow[];
};

export function supportsReceivablesAgingCsvSource(
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">,
) {
  return supportsCsvLikeSource(sourceFile);
}

export function looksLikeReceivablesAgingCsv(input: {
  body: Buffer;
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">;
}) {
  if (!supportsReceivablesAgingCsvSource(input.sourceFile)) {
    return false;
  }

  const header = readHeaderRow(input.body);

  if (!header) {
    return false;
  }

  const headerLookup = buildHeaderLookup(header);
  const hasCustomerIdentity =
    getOptionalHeaderIndex(headerLookup, CUSTOMER_LABEL_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, CUSTOMER_ID_HEADERS) !== null;
  const hasBucket =
    RECEIVABLES_AGING_BUCKET_ORDER.some(
      (bucketKey) => getOptionalHeaderIndex(headerLookup, [bucketKey]) !== null,
    );

  return hasCustomerIdentity && hasBucket;
}

export function extractReceivablesAgingCsv(input: {
  body: Buffer;
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">;
}): ReceivablesAgingExtractionResult {
  if (!supportsReceivablesAgingCsvSource(input.sourceFile)) {
    throw new FinanceTwinExtractionError(
      "receivables_aging_not_csv",
      "The receivables-aging extractor only supports CSV-like source files in F2L.",
    );
  }

  const rows = readCsvRows(input.body);
  const header = rows[0];

  if (!header) {
    throw new FinanceTwinExtractionError(
      "receivables_aging_empty_csv",
      "Receivables-aging CSV did not include a header row.",
    );
  }

  const headerLookup = buildHeaderLookup(header);
  const labelColumns = collectColumns(headerLookup, CUSTOMER_LABEL_HEADERS);
  const customerIdIndex = getOptionalHeaderIndex(headerLookup, CUSTOMER_ID_HEADERS);
  const dateColumns = collectColumns(headerLookup, DATE_HEADERS);
  const currencyColumns = collectColumns(headerLookup, CURRENCY_HEADERS);
  const bucketColumns = RECEIVABLES_AGING_BUCKET_ORDER.flatMap((bucketKey) => {
    const index = getOptionalHeaderIndex(headerLookup, [bucketKey]);
    return index === null ? [] : [{ bucketKey, index }];
  });

  if (labelColumns.length === 0 && customerIdIndex === null) {
    throw new FinanceTwinExtractionError(
      "receivables_aging_missing_customer",
      "Receivables-aging CSV must include at least one customer identity column.",
    );
  }

  if (bucketColumns.length === 0) {
    throw new FinanceTwinExtractionError(
      "receivables_aging_missing_bucket",
      "Receivables-aging CSV must include at least one recognized aging bucket column.",
    );
  }

  const customersByIdentity = new Map<string, ExtractedCustomer>();
  const rowsByScope = new Map<
    string,
    ExtractedReceivablesAgingRow & {
      bucketValuesByKey: Map<
        FinanceReceivablesAgingBucketKey,
        FinanceReceivablesAgingBucketValue
      >;
    }
  >();

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    const lineNumber = rowIndex + 1;

    if (row.every((value) => value.trim().length === 0)) {
      continue;
    }

    const customer = readCustomer({
      customerId: indexCell(row, customerIdIndex),
      labelColumns,
      lineNumber,
      row,
    });
    const bucketValues = readBucketValues({
      bucketColumns,
      lineNumber,
      row,
    });

    if (bucketValues.length === 0) {
      throw new FinanceTwinExtractionError(
        "receivables_aging_missing_amount",
        `Receivables-aging CSV row ${lineNumber} must include at least one recognized aging bucket amount.`,
      );
    }

    customersByIdentity.set(
      customer.identityKey,
      mergeCustomer({
        existing: customersByIdentity.get(customer.identityKey) ?? null,
        incoming: customer,
        lineNumber,
      }),
    );

    const asOf = readOptionalDate({
      columns: dateColumns,
      lineNumber,
      row,
    });
    const currency = readOptionalCurrency({
      columns: currencyColumns,
      lineNumber,
      row,
    });
    const rowScopeKey = `${currency.value ?? "__unknown__"}::${asOf.value ?? "__unknown__"}`;
    const scopeKey = `${customer.identityKey}::${rowScopeKey}`;
    const existing = rowsByScope.get(scopeKey);

    if (!existing) {
      rowsByScope.set(scopeKey, {
        asOfDate: asOf.value,
        asOfDateSourceColumn: asOf.sourceColumn,
        bucketValues,
        bucketValuesByKey: new Map(
          bucketValues.map((bucketValue) => [bucketValue.bucketKey, bucketValue]),
        ),
        currencyCode: currency.value,
        customerIdentityKey: customer.identityKey,
        lineNumber,
        rowScopeKey,
        sourceLineNumbers: [lineNumber],
      });
      continue;
    }

    mergeReceivablesAgingRow({
      existing,
      incoming: bucketValues,
      lineNumber,
    });
  }

  if (rowsByScope.size === 0) {
    throw new FinanceTwinExtractionError(
      "receivables_aging_no_rows",
      "Receivables-aging CSV did not include any usable non-empty customer aging rows.",
    );
  }

  return {
    customers: Array.from(customersByIdentity.values()).sort((left, right) => {
      return (
        left.customerLabel.localeCompare(right.customerLabel) ||
        (left.externalCustomerId ?? "").localeCompare(
          right.externalCustomerId ?? "",
        ) ||
        left.identityKey.localeCompare(right.identityKey)
      );
    }),
    reportedBucketKeys: bucketColumns.map((column) => column.bucketKey),
    rows: Array.from(rowsByScope.values())
      .map(({ bucketValuesByKey: _bucketValuesByKey, ...row }) => ({
        ...row,
        bucketValues: sortReceivablesAgingBucketValues(row.bucketValues),
        sourceLineNumbers: row.sourceLineNumbers.slice().sort((left, right) => {
          return left - right;
        }),
      }))
      .sort((left, right) => {
        return (
          left.lineNumber - right.lineNumber ||
          left.customerIdentityKey.localeCompare(right.customerIdentityKey)
        );
      }),
  };
}

function readHeaderRow(body: Buffer) {
  return readCsvRows(body)[0] ?? null;
}

function readCsvRows(body: Buffer) {
  try {
    return parseCsvRows(decodeCsvText(body));
  } catch (error) {
    if (error instanceof Error) {
      throw new FinanceTwinExtractionError(
        "receivables_aging_unterminated_quote",
        "Receivables-aging CSV ended while a quoted field was still open.",
      );
    }

    throw error;
  }
}

function collectColumns(headerLookup: Map<string, number>, headers: string[]) {
  return headers.flatMap((header) => {
    const index = getOptionalHeaderIndex(headerLookup, [header]);
    return index === null ? [] : [{ header, index }];
  });
}

function indexCell(row: string[], index: number | null) {
  return index === null ? undefined : row[index];
}

function readCustomer(input: {
  customerId: string | undefined;
  labelColumns: { header: string; index: number }[];
  lineNumber: number;
  row: string[];
}): ExtractedCustomer {
  const labelEntries = input.labelColumns.flatMap((column) => {
    const value = readOptionalCell(input.row[column.index]);
    return value === null ? [] : [{ header: column.header, value }];
  });
  const distinctLabels = Array.from(
    new Map(labelEntries.map((entry) => [normalizeIdentityValue(entry.value), entry])),
  ).map(([, entry]) => entry);
  const externalCustomerId = readOptionalCell(input.customerId);

  if (distinctLabels.length > 1) {
    throw new FinanceTwinExtractionError(
      "receivables_aging_customer_conflict",
      `Receivables-aging CSV row ${input.lineNumber} includes conflicting customer label columns.`,
    );
  }

  const customerLabel = distinctLabels[0]?.value ?? externalCustomerId;

  if (!customerLabel) {
    throw new FinanceTwinExtractionError(
      "receivables_aging_missing_customer",
      `Receivables-aging CSV row ${input.lineNumber} is missing customer identity.`,
    );
  }

  return {
    customerLabel,
    externalCustomerId,
    identityKey: externalCustomerId
      ? `customer_id:${normalizeIdentityValue(externalCustomerId)}`
      : `customer_label:${normalizeIdentityValue(customerLabel)}`,
  };
}

function readBucketValues(input: {
  bucketColumns: { bucketKey: FinanceReceivablesAgingBucketKey; index: number }[];
  lineNumber: number;
  row: string[];
}) {
  const bucketValues: FinanceReceivablesAgingBucketValue[] = [];

  for (const column of input.bucketColumns) {
    const rawValue = readOptionalCell(input.row[column.index]);

    if (rawValue === null) {
      continue;
    }

    bucketValues.push({
      bucketKey: column.bucketKey,
      bucketClass: getReceivablesAgingBucketDefinition(column.bucketKey)
        .bucketClass,
      amount: formatMoney(parseMoney(rawValue, column.bucketKey, input.lineNumber)),
      sourceColumn: column.bucketKey,
    });
  }

  return sortReceivablesAgingBucketValues(bucketValues);
}

function readOptionalDate(input: {
  columns: { header: string; index: number }[];
  lineNumber: number;
  row: string[];
}) {
  return readConsistentOptionalValue({
    columns: input.columns,
    lineNumber: input.lineNumber,
    parse: (value, header, lineNumber) => parseIsoDate(value, header, lineNumber),
    row: input.row,
    conflictCode: "receivables_aging_date_conflict",
    conflictLabel: "date",
  });
}

function readOptionalCurrency(input: {
  columns: { header: string; index: number }[];
  lineNumber: number;
  row: string[];
}) {
  return readConsistentOptionalValue({
    columns: input.columns,
    lineNumber: input.lineNumber,
    parse: (value) => normalizeCurrency(value),
    row: input.row,
    conflictCode: "receivables_aging_currency_conflict",
    conflictLabel: "currency",
  });
}

function readConsistentOptionalValue<T>(input: {
  columns: { header: string; index: number }[];
  conflictCode: string;
  conflictLabel: string;
  lineNumber: number;
  parse: (value: string, header: string, lineNumber: number) => T;
  row: string[];
}) {
  const values = input.columns.flatMap((column) => {
    const value = readOptionalCell(input.row[column.index]);
    return value === null
      ? []
      : [{ parsed: input.parse(value, column.header, input.lineNumber), sourceColumn: column.header }];
  });
  const distinctValues = Array.from(
    new Map(values.map((entry) => [String(entry.parsed), entry])),
  ).map(([, entry]) => entry);

  if (distinctValues.length > 1) {
    throw new FinanceTwinExtractionError(
      input.conflictCode,
      `Receivables-aging CSV row ${input.lineNumber} includes conflicting ${input.conflictLabel} columns.`,
    );
  }

  return {
    sourceColumn: distinctValues[0]?.sourceColumn ?? null,
    value: distinctValues[0]?.parsed ?? null,
  };
}

function mergeCustomer(input: {
  existing: ExtractedCustomer | null;
  incoming: ExtractedCustomer;
  lineNumber: number;
}) {
  if (!input.existing) {
    return input.incoming;
  }

  if (
    input.existing.customerLabel !== input.incoming.customerLabel ||
    input.existing.externalCustomerId !== input.incoming.externalCustomerId
  ) {
    throw new FinanceTwinExtractionError(
      "receivables_aging_customer_conflict",
      `Receivables-aging CSV row ${input.lineNumber} conflicts with the earlier customer identity for the same customer key.`,
    );
  }

  return input.existing;
}

function mergeReceivablesAgingRow(input: {
  existing: ExtractedReceivablesAgingRow & {
    bucketValuesByKey: Map<
      FinanceReceivablesAgingBucketKey,
      FinanceReceivablesAgingBucketValue
    >;
  };
  incoming: FinanceReceivablesAgingBucketValue[];
  lineNumber: number;
}) {
  for (const bucketValue of input.incoming) {
    const existingValue = input.existing.bucketValuesByKey.get(bucketValue.bucketKey);

    if (!existingValue) {
      input.existing.bucketValuesByKey.set(bucketValue.bucketKey, bucketValue);
      input.existing.bucketValues = sortReceivablesAgingBucketValues([
        ...input.existing.bucketValuesByKey.values(),
      ]);
      continue;
    }

    if (
      existingValue.amount !== bucketValue.amount ||
      existingValue.sourceColumn !== bucketValue.sourceColumn
    ) {
      throw new FinanceTwinExtractionError(
        "receivables_aging_row_conflict",
        `Receivables-aging CSV row ${input.lineNumber} conflicts with another row for the same customer, currency, as-of date, and bucket.`,
      );
    }
  }

  if (!input.existing.sourceLineNumbers.includes(input.lineNumber)) {
    input.existing.sourceLineNumbers.push(input.lineNumber);
  }
}

function readOptionalCell(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeIdentityValue(value: string) {
  return value.trim().replace(/\s+/gu, " ").toLowerCase();
}

function parseIsoDate(value: string, label: string, lineNumber: number) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) {
    throw new FinanceTwinExtractionError(
      "receivables_aging_invalid_date",
      `Receivables-aging CSV row ${lineNumber} has an invalid ${label}: ${value}.`,
    );
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new FinanceTwinExtractionError(
      "receivables_aging_invalid_date",
      `Receivables-aging CSV row ${lineNumber} has an invalid ${label}: ${value}.`,
    );
  }

  return value;
}

function normalizeCurrency(value: string) {
  return value.trim().toUpperCase();
}

function parseMoney(value: string, label: string, lineNumber: number) {
  const normalized = value.trim().replace(/,/gu, "");

  if (!/^-?\d+(?:\.\d{1,2})?$/u.test(normalized)) {
    throw new FinanceTwinExtractionError(
      "receivables_aging_invalid_amount",
      `Receivables-aging CSV row ${lineNumber} has an invalid ${label} amount: ${value}.`,
    );
  }

  const negative = normalized.startsWith("-");
  const absolute = negative ? normalized.slice(1) : normalized;
  const [wholePart = "0", fractionalPart = "00"] = absolute.split(".");
  const cents =
    BigInt(wholePart) * 100n + BigInt((fractionalPart + "00").slice(0, 2));

  return negative ? -cents : cents;
}

function formatMoney(cents: bigint) {
  const absolute = cents < 0n ? -cents : cents;
  const whole = absolute / 100n;
  const fraction = (absolute % 100n).toString().padStart(2, "0");
  return `${cents < 0n ? "-" : ""}${whole.toString()}.${fraction}`;
}
