import type {
  FinancePayablesAgingBucketKey,
  FinancePayablesAgingBucketValue,
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
  getPayablesAgingBucketDefinition,
  PAYABLES_AGING_BUCKET_ORDER,
  sortPayablesAgingBucketValues,
} from "./payables-aging-buckets";

const VENDOR_SPECIFIC_LABEL_HEADERS = [
  "vendor",
  "vendor_name",
  "supplier",
  "supplier_name",
];
const SHARED_LABEL_HEADERS = ["account_name", "account"];
const VENDOR_LABEL_HEADERS = [
  ...VENDOR_SPECIFIC_LABEL_HEADERS,
  ...SHARED_LABEL_HEADERS,
];
const VENDOR_ID_HEADERS = ["vendor_id"];
const DATE_HEADERS = ["as_of", "aging_date", "report_date", "snapshot_date"];
const CURRENCY_HEADERS = ["currency", "currency_code"];
const PAYABLES_FILENAME_HINTS = [
  "accounts payable",
  "accounts-payable",
  "accounts_payable",
  "ap aging",
  "ap-aging",
  "ap_aging",
  "payable",
  "vendor",
  "supplier",
];

type ExtractedVendor = {
  externalVendorId: string | null;
  identityKey: string;
  vendorLabel: string;
};

export type ExtractedPayablesAgingRow = {
  asOfDate: string | null;
  asOfDateSourceColumn: string | null;
  bucketValues: FinancePayablesAgingBucketValue[];
  currencyCode: string | null;
  lineNumber: number;
  rowScopeKey: string;
  sourceLineNumbers: number[];
  vendorIdentityKey: string;
};

export type PayablesAgingExtractionResult = {
  reportedBucketKeys: FinancePayablesAgingBucketKey[];
  rows: ExtractedPayablesAgingRow[];
  vendors: ExtractedVendor[];
};

export function supportsPayablesAgingCsvSource(
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">,
) {
  return supportsCsvLikeSource(sourceFile);
}

export function looksLikePayablesAgingCsv(input: {
  body: Buffer;
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">;
}) {
  if (!supportsPayablesAgingCsvSource(input.sourceFile)) {
    return false;
  }

  const header = readHeaderRow(input.body);

  if (!header) {
    return false;
  }

  const headerLookup = buildHeaderLookup(header);
  const hasVendorSpecificIdentity =
    getOptionalHeaderIndex(headerLookup, VENDOR_SPECIFIC_LABEL_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, VENDOR_ID_HEADERS) !== null;
  const hasSharedIdentity =
    getOptionalHeaderIndex(headerLookup, SHARED_LABEL_HEADERS) !== null;
  const hasBucket = PAYABLES_AGING_BUCKET_ORDER.some(
    (bucketKey) => getOptionalHeaderIndex(headerLookup, [bucketKey]) !== null,
  );

  return (
    hasBucket &&
    (hasVendorSpecificIdentity ||
      (hasSharedIdentity &&
        fileNameSuggestsPayables(input.sourceFile.originalFileName)))
  );
}

export function extractPayablesAgingCsv(input: {
  body: Buffer;
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">;
}): PayablesAgingExtractionResult {
  if (!supportsPayablesAgingCsvSource(input.sourceFile)) {
    throw new FinanceTwinExtractionError(
      "payables_aging_not_csv",
      "The payables-aging extractor only supports CSV-like source files in F2M.",
    );
  }

  const rows = readCsvRows(input.body);
  const header = rows[0];

  if (!header) {
    throw new FinanceTwinExtractionError(
      "payables_aging_empty_csv",
      "Payables-aging CSV did not include a header row.",
    );
  }

  const headerLookup = buildHeaderLookup(header);
  const labelColumns = collectColumns(headerLookup, VENDOR_LABEL_HEADERS);
  const vendorIdIndex = getOptionalHeaderIndex(headerLookup, VENDOR_ID_HEADERS);
  const dateColumns = collectColumns(headerLookup, DATE_HEADERS);
  const currencyColumns = collectColumns(headerLookup, CURRENCY_HEADERS);
  const bucketColumns = PAYABLES_AGING_BUCKET_ORDER.flatMap((bucketKey) => {
    const index = getOptionalHeaderIndex(headerLookup, [bucketKey]);
    return index === null ? [] : [{ bucketKey, index }];
  });

  if (labelColumns.length === 0 && vendorIdIndex === null) {
    throw new FinanceTwinExtractionError(
      "payables_aging_missing_vendor",
      "Payables-aging CSV must include at least one vendor identity column.",
    );
  }

  if (bucketColumns.length === 0) {
    throw new FinanceTwinExtractionError(
      "payables_aging_missing_bucket",
      "Payables-aging CSV must include at least one recognized aging bucket column.",
    );
  }

  const vendorsByIdentity = new Map<string, ExtractedVendor>();
  const rowsByScope = new Map<
    string,
    ExtractedPayablesAgingRow & {
      bucketValuesByKey: Map<
        FinancePayablesAgingBucketKey,
        FinancePayablesAgingBucketValue
      >;
    }
  >();

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    const lineNumber = rowIndex + 1;

    if (row.every((value) => value.trim().length === 0)) {
      continue;
    }

    const vendor = readVendor({
      labelColumns,
      lineNumber,
      row,
      vendorId: indexCell(row, vendorIdIndex),
    });
    const bucketValues = readBucketValues({
      bucketColumns,
      lineNumber,
      row,
    });

    if (bucketValues.length === 0) {
      throw new FinanceTwinExtractionError(
        "payables_aging_missing_amount",
        `Payables-aging CSV row ${lineNumber} must include at least one recognized aging bucket amount.`,
      );
    }

    vendorsByIdentity.set(
      vendor.identityKey,
      mergeVendor({
        existing: vendorsByIdentity.get(vendor.identityKey) ?? null,
        incoming: vendor,
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
    const scopeKey = `${vendor.identityKey}::${rowScopeKey}`;
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
        lineNumber,
        rowScopeKey,
        sourceLineNumbers: [lineNumber],
        vendorIdentityKey: vendor.identityKey,
      });
      continue;
    }

    mergePayablesAgingRow({
      existing,
      incoming: bucketValues,
      lineNumber,
    });
  }

  if (rowsByScope.size === 0) {
    throw new FinanceTwinExtractionError(
      "payables_aging_no_rows",
      "Payables-aging CSV did not include any usable non-empty vendor aging rows.",
    );
  }

  return {
    vendors: Array.from(vendorsByIdentity.values()).sort((left, right) => {
      return (
        left.vendorLabel.localeCompare(right.vendorLabel) ||
        (left.externalVendorId ?? "").localeCompare(right.externalVendorId ?? "") ||
        left.identityKey.localeCompare(right.identityKey)
      );
    }),
    reportedBucketKeys: bucketColumns.map((column) => column.bucketKey),
    rows: Array.from(rowsByScope.values())
      .map(({ bucketValuesByKey: _bucketValuesByKey, ...row }) => ({
        ...row,
        bucketValues: sortPayablesAgingBucketValues(row.bucketValues),
        sourceLineNumbers: row.sourceLineNumbers
          .slice()
          .sort((left, right) => left - right),
      }))
      .sort((left, right) => {
        return (
          left.lineNumber - right.lineNumber ||
          left.vendorIdentityKey.localeCompare(right.vendorIdentityKey)
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
        "payables_aging_unterminated_quote",
        "Payables-aging CSV ended while a quoted field was still open.",
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

function readVendor(input: {
  labelColumns: { header: string; index: number }[];
  lineNumber: number;
  row: string[];
  vendorId: string | undefined;
}): ExtractedVendor {
  const labelEntries = input.labelColumns.flatMap((column) => {
    const value = readOptionalCell(input.row[column.index]);
    return value === null ? [] : [{ header: column.header, value }];
  });
  const distinctLabels = Array.from(
    new Map(labelEntries.map((entry) => [normalizeIdentityValue(entry.value), entry])),
  ).map(([, entry]) => entry);
  const externalVendorId = readOptionalCell(input.vendorId);

  if (distinctLabels.length > 1) {
    throw new FinanceTwinExtractionError(
      "payables_aging_vendor_conflict",
      `Payables-aging CSV row ${input.lineNumber} includes conflicting vendor label columns.`,
    );
  }

  const vendorLabel = distinctLabels[0]?.value ?? externalVendorId;

  if (!vendorLabel) {
    throw new FinanceTwinExtractionError(
      "payables_aging_missing_vendor",
      `Payables-aging CSV row ${input.lineNumber} is missing vendor identity.`,
    );
  }

  return {
    externalVendorId,
    identityKey: externalVendorId
      ? `vendor_id:${normalizeIdentityValue(externalVendorId)}`
      : `vendor_label:${normalizeIdentityValue(vendorLabel)}`,
    vendorLabel,
  };
}

function readBucketValues(input: {
  bucketColumns: { bucketKey: FinancePayablesAgingBucketKey; index: number }[];
  lineNumber: number;
  row: string[];
}) {
  const bucketValues: FinancePayablesAgingBucketValue[] = [];

  for (const column of input.bucketColumns) {
    const rawValue = readOptionalCell(input.row[column.index]);

    if (rawValue === null) {
      continue;
    }

    bucketValues.push({
      bucketKey: column.bucketKey,
      bucketClass: getPayablesAgingBucketDefinition(column.bucketKey)
        .bucketClass,
      amount: formatMoney(
        parseMoney(rawValue, column.bucketKey, input.lineNumber),
      ),
      sourceColumn: column.bucketKey,
    });
  }

  return sortPayablesAgingBucketValues(bucketValues);
}

function readOptionalDate(input: {
  columns: { header: string; index: number }[];
  lineNumber: number;
  row: string[];
}) {
  return readConsistentOptionalValue({
    columns: input.columns,
    conflictCode: "payables_aging_date_conflict",
    conflictLabel: "date",
    lineNumber: input.lineNumber,
    parse: (value, header, lineNumber) => parseIsoDate(value, header, lineNumber),
    row: input.row,
  });
}

function readOptionalCurrency(input: {
  columns: { header: string; index: number }[];
  lineNumber: number;
  row: string[];
}) {
  return readConsistentOptionalValue({
    columns: input.columns,
    conflictCode: "payables_aging_currency_conflict",
    conflictLabel: "currency",
    lineNumber: input.lineNumber,
    parse: (value) => normalizeCurrency(value),
    row: input.row,
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
      : [
          {
            parsed: input.parse(value, column.header, input.lineNumber),
            sourceColumn: column.header,
          },
        ];
  });
  const distinctValues = Array.from(
    new Map(values.map((entry) => [String(entry.parsed), entry])),
  ).map(([, entry]) => entry);

  if (distinctValues.length > 1) {
    throw new FinanceTwinExtractionError(
      input.conflictCode,
      `Payables-aging CSV row ${input.lineNumber} includes conflicting ${input.conflictLabel} columns.`,
    );
  }

  return {
    sourceColumn: distinctValues[0]?.sourceColumn ?? null,
    value: distinctValues[0]?.parsed ?? null,
  };
}

function mergeVendor(input: {
  existing: ExtractedVendor | null;
  incoming: ExtractedVendor;
  lineNumber: number;
}) {
  if (!input.existing) {
    return input.incoming;
  }

  if (
    input.existing.vendorLabel !== input.incoming.vendorLabel ||
    input.existing.externalVendorId !== input.incoming.externalVendorId
  ) {
    throw new FinanceTwinExtractionError(
      "payables_aging_vendor_conflict",
      `Payables-aging CSV row ${input.lineNumber} conflicts with the earlier vendor identity for the same vendor key.`,
    );
  }

  return input.existing;
}

function mergePayablesAgingRow(input: {
  existing: ExtractedPayablesAgingRow & {
    bucketValuesByKey: Map<
      FinancePayablesAgingBucketKey,
      FinancePayablesAgingBucketValue
    >;
  };
  incoming: FinancePayablesAgingBucketValue[];
  lineNumber: number;
}) {
  for (const bucketValue of input.incoming) {
    const existingValue = input.existing.bucketValuesByKey.get(bucketValue.bucketKey);

    if (!existingValue) {
      input.existing.bucketValuesByKey.set(bucketValue.bucketKey, bucketValue);
      input.existing.bucketValues = sortPayablesAgingBucketValues([
        ...input.existing.bucketValuesByKey.values(),
      ]);
      continue;
    }

    if (
      existingValue.amount !== bucketValue.amount ||
      existingValue.sourceColumn !== bucketValue.sourceColumn
    ) {
      throw new FinanceTwinExtractionError(
        "payables_aging_row_conflict",
        `Payables-aging CSV row ${input.lineNumber} conflicts with another row for the same vendor, currency, as-of date, and bucket.`,
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
      "payables_aging_invalid_date",
      `Payables-aging CSV row ${lineNumber} has an invalid ${label}: ${value}.`,
    );
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new FinanceTwinExtractionError(
      "payables_aging_invalid_date",
      `Payables-aging CSV row ${lineNumber} has an invalid ${label}: ${value}.`,
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
      "payables_aging_invalid_amount",
      `Payables-aging CSV row ${lineNumber} has an invalid ${label} amount: ${value}.`,
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

function fileNameSuggestsPayables(fileName: string) {
  const normalized = fileName.trim().toLowerCase().replace(/[^a-z0-9]+/gu, " ");
  return PAYABLES_FILENAME_HINTS.some((hint) => normalized.includes(hint));
}
