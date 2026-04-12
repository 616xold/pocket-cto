import type {
  FinanceSpendSourceFieldMap,
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

const EXPLICIT_ROW_ID_HEADERS = [
  "transaction_id",
  "expense_id",
  "card_txn_id",
  "statement_txn_id",
  "reference_id",
];
const MERCHANT_HEADERS = ["merchant"];
const VENDOR_HEADERS = ["vendor"];
const EMPLOYEE_HEADERS = ["employee"];
const CARDHOLDER_HEADERS = ["cardholder"];
const CATEGORY_HEADERS = ["category"];
const MEMO_HEADERS = ["memo"];
const DESCRIPTION_HEADERS = ["description"];
const DEPARTMENT_HEADERS = ["department"];
const CARD_NAME_HEADERS = ["card_name"];
const CARD_LAST4_HEADERS = ["card_last4"];
const AMOUNT_HEADERS = ["amount"];
const POSTED_AMOUNT_HEADERS = ["posted_amount"];
const TRANSACTION_AMOUNT_HEADERS = ["transaction_amount"];
const CURRENCY_HEADERS = ["currency", "currency_code"];
const TRANSACTION_DATE_HEADERS = ["transaction_date"];
const POSTED_DATE_HEADERS = ["posted_date"];
const EXPENSE_DATE_HEADERS = ["expense_date"];
const REPORT_DATE_HEADERS = ["report_date"];
const AS_OF_DATE_HEADERS = ["as_of"];
const STATUS_HEADERS = ["status"];
const STATE_HEADERS = ["state"];
const REIMBURSABLE_HEADERS = ["reimbursable"];
const PENDING_HEADERS = ["pending"];

type ExtractedSpendRow = {
  amount: string | null;
  asOfDate: string | null;
  cardLabel: string | null;
  cardLast4: string | null;
  cardholderLabel: string | null;
  categoryLabel: string | null;
  currencyCode: string | null;
  department: string | null;
  description: string | null;
  employeeLabel: string | null;
  expenseDate: string | null;
  explicitRowIdentity: string | null;
  explicitRowIdentitySourceField: string | null;
  lineNumber: number;
  memo: string | null;
  merchantLabel: string | null;
  pending: boolean | null;
  postedAmount: string | null;
  postedDate: string | null;
  reimbursable: boolean | null;
  reportDate: string | null;
  rowScopeKey: string;
  sourceFieldMap: FinanceSpendSourceFieldMap;
  sourceLineNumbers: number[];
  state: string | null;
  status: string | null;
  transactionAmount: string | null;
  transactionDate: string | null;
  vendorLabel: string | null;
};

export type CardExpenseExtractionResult = {
  rows: ExtractedSpendRow[];
};

export function supportsCardExpenseCsvSource(
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">,
) {
  return supportsCsvLikeSource(sourceFile);
}

export function looksLikeCardExpenseCsv(input: {
  body: Buffer;
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">;
}) {
  if (!supportsCardExpenseCsvSource(input.sourceFile)) {
    return false;
  }

  const header = readHeaderRow(input.body);

  if (!header) {
    return false;
  }

  const headerLookup = buildHeaderLookup(header);
  const hasAmountSignal =
    getOptionalHeaderIndex(headerLookup, AMOUNT_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, POSTED_AMOUNT_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, TRANSACTION_AMOUNT_HEADERS) !== null;
  const hasSpendSignal =
    getOptionalHeaderIndex(headerLookup, EXPLICIT_ROW_ID_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, MERCHANT_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, EMPLOYEE_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, CARDHOLDER_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, CATEGORY_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, MEMO_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, DESCRIPTION_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, DEPARTMENT_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, CARD_NAME_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, CARD_LAST4_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, TRANSACTION_DATE_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, POSTED_DATE_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, EXPENSE_DATE_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, REPORT_DATE_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, STATUS_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, STATE_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, REIMBURSABLE_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, PENDING_HEADERS) !== null;

  return hasAmountSignal && hasSpendSignal;
}

export function extractCardExpenseCsv(input: {
  body: Buffer;
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">;
}): CardExpenseExtractionResult {
  if (!supportsCardExpenseCsvSource(input.sourceFile)) {
    throw new FinanceTwinExtractionError(
      "card_expense_not_csv",
      "The card-expense extractor only supports CSV-like source files in F2O.",
    );
  }

  const rows = readCsvRows(input.body);
  const header = rows[0];

  if (!header) {
    throw new FinanceTwinExtractionError(
      "card_expense_empty_csv",
      "Card-expense CSV did not include a header row.",
    );
  }

  const headerLookup = buildHeaderLookup(header);
  const hasAmountHeader =
    getOptionalHeaderIndex(headerLookup, AMOUNT_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, POSTED_AMOUNT_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, TRANSACTION_AMOUNT_HEADERS) !== null;

  if (!hasAmountHeader) {
    throw new FinanceTwinExtractionError(
      "card_expense_missing_amount_field",
      "Card-expense CSV must include at least one explicit amount column.",
    );
  }

  const rowsByScopeKey = new Map<string, ExtractedSpendRow>();

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    const lineNumber = rowIndex + 1;

    if (row.every((value) => value.trim().length === 0)) {
      continue;
    }

    const spendRow = readSpendRow({
      headerLookup,
      lineNumber,
      row,
    });
    const existing = rowsByScopeKey.get(spendRow.rowScopeKey);

    rowsByScopeKey.set(
      spendRow.rowScopeKey,
      existing ? mergeDuplicateRows(existing, spendRow) : spendRow,
    );
  }

  if (rowsByScopeKey.size === 0) {
    throw new FinanceTwinExtractionError(
      "card_expense_no_rows",
      "Card-expense CSV did not include any usable non-empty spend rows.",
    );
  }

  return {
    rows: Array.from(rowsByScopeKey.values()).sort(
      (left, right) => left.lineNumber - right.lineNumber,
    ),
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
        "card_expense_unterminated_quote",
        "Card-expense CSV ended while a quoted field was still open.",
      );
    }

    throw error;
  }
}

function readSpendRow(input: {
  headerLookup: Map<string, number>;
  lineNumber: number;
  row: string[];
}): ExtractedSpendRow {
  const identity = readPrimaryIdentity(input);
  const merchantLabel = readOptionalStringField({
    ...input,
    fieldLabel: "merchant",
    headers: MERCHANT_HEADERS,
  });
  const vendorLabel = readOptionalStringField({
    ...input,
    fieldLabel: "vendor",
    headers: VENDOR_HEADERS,
  });
  const employeeLabel = readOptionalStringField({
    ...input,
    fieldLabel: "employee",
    headers: EMPLOYEE_HEADERS,
  });
  const cardholderLabel = readOptionalStringField({
    ...input,
    fieldLabel: "cardholder",
    headers: CARDHOLDER_HEADERS,
  });
  const categoryLabel = readOptionalStringField({
    ...input,
    fieldLabel: "category",
    headers: CATEGORY_HEADERS,
  });
  const memo = readOptionalStringField({
    ...input,
    fieldLabel: "memo",
    headers: MEMO_HEADERS,
  });
  const description = readOptionalStringField({
    ...input,
    fieldLabel: "description",
    headers: DESCRIPTION_HEADERS,
  });
  const department = readOptionalStringField({
    ...input,
    fieldLabel: "department",
    headers: DEPARTMENT_HEADERS,
  });
  const cardLabel = readOptionalStringField({
    ...input,
    fieldLabel: "card name",
    headers: CARD_NAME_HEADERS,
  });
  const cardLast4 = readOptionalStringField({
    ...input,
    fieldLabel: "card last4",
    headers: CARD_LAST4_HEADERS,
  });
  const amount = readOptionalMoneyField({
    ...input,
    fieldLabel: "amount",
    headers: AMOUNT_HEADERS,
  });
  const postedAmount = readOptionalMoneyField({
    ...input,
    fieldLabel: "posted amount",
    headers: POSTED_AMOUNT_HEADERS,
  });
  const transactionAmount = readOptionalMoneyField({
    ...input,
    fieldLabel: "transaction amount",
    headers: TRANSACTION_AMOUNT_HEADERS,
  });
  const currency = readOptionalFieldValue({
    fieldLabel: "currency",
    headerLookup: input.headerLookup,
    headers: CURRENCY_HEADERS,
    lineNumber: input.lineNumber,
    parse: (value) => value.trim().toUpperCase(),
    row: input.row,
  });
  const transactionDate = readOptionalDateField({
    ...input,
    fieldLabel: "transaction date",
    headers: TRANSACTION_DATE_HEADERS,
  });
  const postedDate = readOptionalDateField({
    ...input,
    fieldLabel: "posted date",
    headers: POSTED_DATE_HEADERS,
  });
  const expenseDate = readOptionalDateField({
    ...input,
    fieldLabel: "expense date",
    headers: EXPENSE_DATE_HEADERS,
  });
  const reportDate = readOptionalDateField({
    ...input,
    fieldLabel: "report date",
    headers: REPORT_DATE_HEADERS,
  });
  const asOfDate = readOptionalDateField({
    ...input,
    fieldLabel: "as_of",
    headers: AS_OF_DATE_HEADERS,
  });
  const status = readOptionalStringField({
    ...input,
    fieldLabel: "status",
    headers: STATUS_HEADERS,
  });
  const state = readOptionalStringField({
    ...input,
    fieldLabel: "state",
    headers: STATE_HEADERS,
  });
  const reimbursable = readOptionalBooleanField({
    ...input,
    fieldLabel: "reimbursable",
    headers: REIMBURSABLE_HEADERS,
  });
  const pending = readOptionalBooleanField({
    ...input,
    fieldLabel: "pending",
    headers: PENDING_HEADERS,
  });

  return {
    amount,
    asOfDate,
    cardLabel,
    cardLast4,
    cardholderLabel,
    categoryLabel,
    currencyCode: currency.value,
    department,
    description,
    employeeLabel,
    expenseDate,
    explicitRowIdentity: identity?.value ?? null,
    explicitRowIdentitySourceField: identity?.header ?? null,
    lineNumber: input.lineNumber,
    memo,
    merchantLabel,
    pending,
    postedAmount,
    postedDate,
    reimbursable,
    reportDate,
    rowScopeKey: identity
      ? `identity:${identity.header}:${normalizeIdentityValue(identity.value)}`
      : `line:${input.lineNumber}`,
    sourceFieldMap: {
      explicitRowIdentity: identity?.header ?? null,
      merchantLabel: merchantLabel ? MERCHANT_HEADERS[0] ?? null : null,
      vendorLabel: vendorLabel ? VENDOR_HEADERS[0] ?? null : null,
      employeeLabel: employeeLabel ? EMPLOYEE_HEADERS[0] ?? null : null,
      cardholderLabel: cardholderLabel ? CARDHOLDER_HEADERS[0] ?? null : null,
      categoryLabel: categoryLabel ? CATEGORY_HEADERS[0] ?? null : null,
      memo: memo ? MEMO_HEADERS[0] ?? null : null,
      description: description ? DESCRIPTION_HEADERS[0] ?? null : null,
      department: department ? DEPARTMENT_HEADERS[0] ?? null : null,
      cardLabel: cardLabel ? CARD_NAME_HEADERS[0] ?? null : null,
      cardLast4: cardLast4 ? CARD_LAST4_HEADERS[0] ?? null : null,
      amount: amount ? AMOUNT_HEADERS[0] ?? null : null,
      postedAmount: postedAmount ? POSTED_AMOUNT_HEADERS[0] ?? null : null,
      transactionAmount:
        transactionAmount ? TRANSACTION_AMOUNT_HEADERS[0] ?? null : null,
      currencyCode: currency.header,
      transactionDate: transactionDate
        ? (TRANSACTION_DATE_HEADERS[0] ?? null)
        : null,
      postedDate: postedDate ? (POSTED_DATE_HEADERS[0] ?? null) : null,
      expenseDate: expenseDate ? (EXPENSE_DATE_HEADERS[0] ?? null) : null,
      reportDate: reportDate ? (REPORT_DATE_HEADERS[0] ?? null) : null,
      asOfDate: asOfDate ? (AS_OF_DATE_HEADERS[0] ?? null) : null,
      status: status ? STATUS_HEADERS[0] ?? null : null,
      state: state ? STATE_HEADERS[0] ?? null : null,
      reimbursable:
        reimbursable !== null ? (REIMBURSABLE_HEADERS[0] ?? null) : null,
      pending: pending !== null ? (PENDING_HEADERS[0] ?? null) : null,
    },
    sourceLineNumbers: [input.lineNumber],
    state,
    status,
    transactionAmount,
    transactionDate,
    vendorLabel,
  };
}

function readPrimaryIdentity(input: {
  headerLookup: Map<string, number>;
  lineNumber: number;
  row: string[];
}) {
  for (const header of EXPLICIT_ROW_ID_HEADERS) {
    const index = getOptionalHeaderIndex(input.headerLookup, [header]);

    if (index === null) {
      continue;
    }

    const value = readOptionalCell(input.row[index]);

    if (value !== null) {
      return { header, value };
    }
  }

  return null;
}

function mergeDuplicateRows(
  existing: ExtractedSpendRow,
  incoming: ExtractedSpendRow,
) {
  const existingComparable = JSON.stringify(buildComparableRow(existing));
  const incomingComparable = JSON.stringify(buildComparableRow(incoming));

  if (existingComparable !== incomingComparable) {
    throw new FinanceTwinExtractionError(
      "card_expense_row_conflict",
      `Card-expense CSV row ${incoming.lineNumber} conflicts with another row that reported the same explicit identity.`,
    );
  }

  return {
    ...existing,
    sourceLineNumbers: Array.from(
      new Set([...existing.sourceLineNumbers, ...incoming.sourceLineNumbers]),
    ).sort((left, right) => left - right),
  };
}

function buildComparableRow(row: ExtractedSpendRow) {
  const { lineNumber: _lineNumber, sourceLineNumbers: _sourceLineNumbers, ...rest } = row;
  return rest;
}

function readOptionalStringField(input: {
  fieldLabel: string;
  headerLookup: Map<string, number>;
  headers: string[];
  lineNumber: number;
  normalize?: (value: string) => string;
  row: string[];
}) {
  const resolved = readOptionalFieldValue({
    fieldLabel: input.fieldLabel,
    headerLookup: input.headerLookup,
    headers: input.headers,
    lineNumber: input.lineNumber,
    parse: (value) => (input.normalize ? input.normalize(value) : value.trim()),
    row: input.row,
  });

  return resolved.value;
}

function readOptionalDateField(input: {
  fieldLabel: string;
  headerLookup: Map<string, number>;
  headers: string[];
  lineNumber: number;
  row: string[];
}) {
  return readOptionalFieldValue({
    fieldLabel: input.fieldLabel,
    headerLookup: input.headerLookup,
    headers: input.headers,
    lineNumber: input.lineNumber,
    parse: (value) => parseIsoDate(value, input.fieldLabel, input.lineNumber),
    row: input.row,
  }).value;
}

function readOptionalMoneyField(input: {
  fieldLabel: string;
  headerLookup: Map<string, number>;
  headers: string[];
  lineNumber: number;
  row: string[];
}) {
  return readOptionalFieldValue({
    fieldLabel: input.fieldLabel,
    headerLookup: input.headerLookup,
    headers: input.headers,
    lineNumber: input.lineNumber,
    parse: (value) => formatMoney(parseMoney(value, input.fieldLabel, input.lineNumber)),
    row: input.row,
  }).value;
}

function readOptionalBooleanField(input: {
  fieldLabel: string;
  headerLookup: Map<string, number>;
  headers: string[];
  lineNumber: number;
  row: string[];
}) {
  return readOptionalFieldValue({
    fieldLabel: input.fieldLabel,
    headerLookup: input.headerLookup,
    headers: input.headers,
    lineNumber: input.lineNumber,
    parse: (value) =>
      parseBoolean(value, input.fieldLabel, input.lineNumber),
    row: input.row,
  }).value;
}

function readOptionalFieldValue<T>(input: {
  fieldLabel: string;
  headerLookup: Map<string, number>;
  headers: string[];
  lineNumber: number;
  parse: (value: string, header: string) => T;
  row: string[];
}) {
  const resolved: Array<{ header: string; value: T }> = [];

  for (const header of input.headers) {
    const index = getOptionalHeaderIndex(input.headerLookup, [header]);

    if (index === null) {
      continue;
    }

    const cell = readOptionalCell(input.row[index]);

    if (cell === null) {
      continue;
    }

    resolved.push({
      header,
      value: input.parse(cell, header),
    });
  }

  if (resolved.length === 0) {
    return { header: null, value: null as T | null };
  }

  const [first, ...rest] = resolved;

  if (
    rest.some(
      (entry) => JSON.stringify(entry.value) !== JSON.stringify(first?.value),
    )
  ) {
    throw new FinanceTwinExtractionError(
      "card_expense_field_conflict",
      `Card-expense CSV row ${input.lineNumber} reported conflicting ${input.fieldLabel} values across equivalent source columns.`,
    );
  }

  return {
    header: first?.header ?? null,
    value: first?.value ?? null,
  };
}

function normalizeIdentityValue(value: string) {
  return value.trim().replace(/\s+/gu, " ").toLowerCase();
}

function readOptionalCell(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function parseIsoDate(value: string, fieldLabel: string, lineNumber: number) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) {
    throw new FinanceTwinExtractionError(
      "card_expense_invalid_date",
      `Card-expense CSV row ${lineNumber} has an invalid ${fieldLabel}: ${value}.`,
    );
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new FinanceTwinExtractionError(
      "card_expense_invalid_date",
      `Card-expense CSV row ${lineNumber} has an invalid ${fieldLabel}: ${value}.`,
    );
  }

  return value;
}

function parseMoney(value: string, fieldLabel: string, lineNumber: number) {
  if (!/^-?\d+(?:\.\d{1,2})?$/u.test(value)) {
    throw new FinanceTwinExtractionError(
      "card_expense_invalid_amount",
      `Card-expense CSV row ${lineNumber} has an invalid ${fieldLabel}: ${value}.`,
    );
  }

  const normalized = value.startsWith("-") ? value.slice(1) : value;
  const [wholePart = "0", fractionalPart = "00"] = normalized.split(".");
  const cents =
    BigInt(wholePart) * 100n + BigInt((fractionalPart + "00").slice(0, 2));

  return value.startsWith("-") ? -cents : cents;
}

function formatMoney(cents: bigint) {
  const absolute = cents < 0n ? -cents : cents;
  const whole = absolute / 100n;
  const fraction = (absolute % 100n).toString().padStart(2, "0");
  return `${cents < 0n ? "-" : ""}${whole.toString()}.${fraction}`;
}

function parseBoolean(value: string, fieldLabel: string, lineNumber: number) {
  const normalized = value.trim().toLowerCase();

  if (["true", "yes", "y", "1"].includes(normalized)) {
    return true;
  }

  if (["false", "no", "n", "0"].includes(normalized)) {
    return false;
  }

  throw new FinanceTwinExtractionError(
    "card_expense_invalid_boolean",
    `Card-expense CSV row ${lineNumber} has an invalid ${fieldLabel}: ${value}.`,
  );
}
