import type {
  FinanceGeneralLedgerSourceDeclaredPeriod,
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

const JOURNAL_ID_HEADERS = [
  "journal_id",
  "entry_id",
  "transaction_id",
  "entry_number",
  "journal_number",
  "transaction_number",
];
const TRANSACTION_DATE_HEADERS = [
  "posting_date",
  "transaction_date",
  "entry_date",
  "journal_date",
  "date",
];
const ACCOUNT_CODE_HEADERS = [
  "account_code",
  "account_number",
  "account",
  "code",
  "gl_code",
];
const ACCOUNT_NAME_HEADERS = [
  "account_name",
  "account_description",
  "account_title",
  "gl_account_name",
];
const ACCOUNT_TYPE_HEADERS = ["account_type", "gl_account_type"];
const PERIOD_START_HEADERS = [
  "period_start",
  "period_start_date",
  "reporting_period_start",
  "report_period_start",
];
const PERIOD_END_HEADERS = [
  "period_end",
  "period_end_date",
  "reporting_period_end",
  "report_period_end",
];
const PERIOD_KEY_HEADERS = [
  "period_key",
  "reporting_period",
  "reporting_period_key",
  "report_period",
];
const AS_OF_HEADERS = ["as_of", "as_of_date"];
const DEBIT_HEADERS = ["debit", "debit_amount", "debits"];
const CREDIT_HEADERS = ["credit", "credit_amount", "credits"];
const CURRENCY_HEADERS = ["currency", "currency_code"];
const ENTRY_DESCRIPTION_HEADERS = [
  "journal_description",
  "entry_description",
  "transaction_description",
];
const LINE_DESCRIPTION_HEADERS = [
  "line_description",
  "line_memo",
  "line_note",
  "memo",
  "description",
];

type ExtractedLedgerAccount = {
  accountCode: string;
  accountName: string | null;
  accountType: string | null;
};

type ExtractedGeneralLedgerLine = {
  accountCode: string;
  accountName: string | null;
  accountType: string | null;
  creditAmount: string;
  currencyCode: string | null;
  debitAmount: string;
  lineDescription: string | null;
  lineNumber: number;
};

export type GeneralLedgerExtractionResult = {
  entries: Array<{
    entryDescription: string | null;
    externalEntryId: string;
    lines: ExtractedGeneralLedgerLine[];
    transactionDate: string;
  }>;
  sourceDeclaredPeriod: FinanceGeneralLedgerSourceDeclaredPeriod | null;
};

export function supportsGeneralLedgerCsvSource(
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">,
) {
  return supportsCsvLikeSource(sourceFile);
}

export function looksLikeGeneralLedgerCsv(input: {
  body: Buffer;
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">;
}) {
  if (!supportsGeneralLedgerCsvSource(input.sourceFile)) {
    return false;
  }

  const header = readHeaderRow(input.body);

  if (!header) {
    return false;
  }

  const headerLookup = buildHeaderLookup(header);
  const hasJournalId =
    getOptionalHeaderIndex(headerLookup, JOURNAL_ID_HEADERS) !== null;
  const hasTransactionDate =
    getOptionalHeaderIndex(headerLookup, TRANSACTION_DATE_HEADERS) !== null;
  const hasAccountCode =
    getOptionalHeaderIndex(headerLookup, ACCOUNT_CODE_HEADERS) !== null;
  const hasAmountColumn =
    getOptionalHeaderIndex(headerLookup, DEBIT_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, CREDIT_HEADERS) !== null;

  return hasJournalId && hasTransactionDate && hasAccountCode && hasAmountColumn;
}

export function extractGeneralLedgerCsv(input: {
  body: Buffer;
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">;
}): GeneralLedgerExtractionResult {
  if (!supportsGeneralLedgerCsvSource(input.sourceFile)) {
    throw new FinanceTwinExtractionError(
      "general_ledger_not_csv",
      "The general-ledger extractor only supports CSV-like source files in F2C.",
    );
  }

  const rows = readCsvRows(input.body);
  const header = rows[0];

  if (!header) {
    throw new FinanceTwinExtractionError(
      "general_ledger_empty_csv",
      "General-ledger CSV did not include a header row.",
    );
  }

  const headerLookup = buildHeaderLookup(header);
  const journalIdIndex = getRequiredHeaderIndex(
    headerLookup,
    JOURNAL_ID_HEADERS,
    "journal identity",
  );
  const transactionDateIndex = getRequiredHeaderIndex(
    headerLookup,
    TRANSACTION_DATE_HEADERS,
    "transaction date",
  );
  const accountCodeIndex = getRequiredHeaderIndex(
    headerLookup,
    ACCOUNT_CODE_HEADERS,
    "account code",
  );
  const debitIndex = getOptionalHeaderIndex(headerLookup, DEBIT_HEADERS);
  const creditIndex = getOptionalHeaderIndex(headerLookup, CREDIT_HEADERS);

  if (debitIndex === null && creditIndex === null) {
    throw new FinanceTwinExtractionError(
      "general_ledger_missing_amount_column",
      "General-ledger CSV must include at least one debit or credit column.",
    );
  }

  const accountNameIndex = getOptionalHeaderIndex(
    headerLookup,
    ACCOUNT_NAME_HEADERS,
  );
  const periodStartIndex = getOptionalHeaderIndex(
    headerLookup,
    PERIOD_START_HEADERS,
  );
  const periodEndIndex = getOptionalHeaderIndex(
    headerLookup,
    PERIOD_END_HEADERS,
  );
  const periodKeyIndex = getOptionalHeaderIndex(headerLookup, PERIOD_KEY_HEADERS);
  const asOfIndex = getOptionalHeaderIndex(headerLookup, AS_OF_HEADERS);
  const accountTypeIndex = getOptionalHeaderIndex(
    headerLookup,
    ACCOUNT_TYPE_HEADERS,
  );
  const currencyIndex = getOptionalHeaderIndex(headerLookup, CURRENCY_HEADERS);
  const entryDescriptionIndex = getOptionalHeaderIndex(
    headerLookup,
    ENTRY_DESCRIPTION_HEADERS,
  );
  const lineDescriptionIndex = getOptionalHeaderIndex(
    headerLookup,
    LINE_DESCRIPTION_HEADERS,
  );

  const accountsByCode = new Map<string, ExtractedLedgerAccount>();
  const sourceDeclaredPeriodStarts = new Set<string>();
  const sourceDeclaredPeriodEnds = new Set<string>();
  const sourceDeclaredPeriodKeys = new Set<string>();
  const sourceDeclaredAsOfDates = new Set<string>();
  const entriesById = new Map<
    string,
    {
      entryDescription: string | null;
      externalEntryId: string;
      firstLineNumber: number;
      lines: Array<{
        accountCode: string;
        creditAmount: string;
        currencyCode: string | null;
        debitAmount: string;
        lineDescription: string | null;
        lineNumber: number;
      }>;
      transactionDate: string;
    }
  >();

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    const lineNumber = rowIndex + 1;

    if (row.every((value) => value.trim().length === 0)) {
      continue;
    }

    const externalEntryId = requireCell(
      row[journalIdIndex],
      "journal identity",
      lineNumber,
    );
    const transactionDate = parseIsoDate(
      requireCell(row[transactionDateIndex], "transaction date", lineNumber),
      "transaction date",
      lineNumber,
    );
    const accountCode = requireCell(
      row[accountCodeIndex],
      "account code",
      lineNumber,
    );
    const accountName =
      accountNameIndex === null ? null : readOptionalCell(row[accountNameIndex]);
    const sourceDeclaredPeriodStart =
      periodStartIndex === null
        ? null
        : readOptionalIsoDate(row[periodStartIndex], "period start", lineNumber);
    const sourceDeclaredPeriodEnd =
      periodEndIndex === null
        ? null
        : readOptionalIsoDate(row[periodEndIndex], "period end", lineNumber);
    const sourceDeclaredPeriodKey =
      periodKeyIndex === null ? null : readOptionalCell(row[periodKeyIndex]);
    const sourceDeclaredAsOf =
      asOfIndex === null
        ? null
        : readOptionalIsoDate(row[asOfIndex], "as-of date", lineNumber);
    const accountType =
      accountTypeIndex === null ? null : readOptionalCell(row[accountTypeIndex]);
    const debitAmount =
      debitIndex === null
        ? 0n
        : parseNonNegativeMoney(row[debitIndex], "debit amount", lineNumber);
    const creditAmount =
      creditIndex === null
        ? 0n
        : parseNonNegativeMoney(row[creditIndex], "credit amount", lineNumber);
    const currencyCode =
      currencyIndex === null ? null : normalizeCurrency(row[currencyIndex]);
    const entryDescription =
      entryDescriptionIndex === null
        ? null
        : readOptionalCell(row[entryDescriptionIndex]);
    const lineDescription =
      lineDescriptionIndex === null
        ? null
        : readOptionalCell(row[lineDescriptionIndex]);

    if (debitAmount === 0n && creditAmount === 0n) {
      throw new FinanceTwinExtractionError(
        "general_ledger_missing_amount",
        `General-ledger CSV row ${lineNumber} must include a debit or credit amount.`,
      );
    }

    const mergedAccount = mergeLedgerAccount({
      existing: accountsByCode.get(accountCode) ?? null,
      incoming: {
        accountCode,
        accountName,
        accountType,
      },
      lineNumber,
    });

    accountsByCode.set(accountCode, mergedAccount);
    if (sourceDeclaredPeriodStart) {
      sourceDeclaredPeriodStarts.add(sourceDeclaredPeriodStart);
    }
    if (sourceDeclaredPeriodEnd) {
      sourceDeclaredPeriodEnds.add(sourceDeclaredPeriodEnd);
    }
    if (sourceDeclaredPeriodKey) {
      sourceDeclaredPeriodKeys.add(sourceDeclaredPeriodKey);
    }
    if (sourceDeclaredAsOf) {
      sourceDeclaredAsOfDates.add(sourceDeclaredAsOf);
    }

    const existingEntry = entriesById.get(externalEntryId);

    if (
      existingEntry &&
      existingEntry.transactionDate !== transactionDate
    ) {
      throw new FinanceTwinExtractionError(
        "general_ledger_entry_date_conflict",
        `General-ledger CSV row ${lineNumber} conflicts with the earlier transaction date for journal ${externalEntryId}.`,
      );
    }

    if (
      existingEntry?.entryDescription &&
      entryDescription &&
      existingEntry.entryDescription !== entryDescription
    ) {
      throw new FinanceTwinExtractionError(
        "general_ledger_entry_description_conflict",
        `General-ledger CSV row ${lineNumber} conflicts with the earlier description for journal ${externalEntryId}.`,
      );
    }

    const entry =
      existingEntry ??
      {
        externalEntryId,
        transactionDate,
        entryDescription,
        firstLineNumber: lineNumber,
        lines: [],
      };

    entry.entryDescription = entry.entryDescription ?? entryDescription;
    entry.lines.push({
      accountCode,
      debitAmount: formatMoney(debitAmount),
      creditAmount: formatMoney(creditAmount),
      currencyCode,
      lineDescription,
      lineNumber,
    });
    entriesById.set(externalEntryId, entry);
  }

  if (entriesById.size === 0) {
    throw new FinanceTwinExtractionError(
      "general_ledger_no_rows",
      "General-ledger CSV did not include any non-empty data rows.",
    );
  }

  return {
    sourceDeclaredPeriod: resolveSourceDeclaredPeriod({
      asOfDates: sourceDeclaredAsOfDates,
      periodEnds: sourceDeclaredPeriodEnds,
      periodKeys: sourceDeclaredPeriodKeys,
      periodStarts: sourceDeclaredPeriodStarts,
    }),
    entries: Array.from(entriesById.values())
      .sort((left, right) => {
        return (
          left.transactionDate.localeCompare(right.transactionDate) ||
          left.firstLineNumber - right.firstLineNumber ||
          left.externalEntryId.localeCompare(right.externalEntryId)
        );
      })
      .map((entry) => ({
        externalEntryId: entry.externalEntryId,
        transactionDate: entry.transactionDate,
        entryDescription: entry.entryDescription,
        lines: entry.lines.map((line) => {
          const account = accountsByCode.get(line.accountCode);

          if (!account) {
            throw new Error(
              `General-ledger account ${line.accountCode} was not available after extraction`,
            );
          }

          return {
            accountCode: line.accountCode,
            accountName: account.accountName,
            accountType: account.accountType,
            debitAmount: line.debitAmount,
            creditAmount: line.creditAmount,
            currencyCode: line.currencyCode,
            lineDescription: line.lineDescription,
            lineNumber: line.lineNumber,
          };
        }),
      })),
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
        "general_ledger_unterminated_quote",
        "General-ledger CSV ended while a quoted field was still open.",
      );
    }

    throw error;
  }
}

function getRequiredHeaderIndex(
  headerLookup: Map<string, number>,
  candidateHeaders: string[],
  label: string,
) {
  const index = getOptionalHeaderIndex(headerLookup, candidateHeaders);

  if (index === null) {
    throw new FinanceTwinExtractionError(
      "general_ledger_missing_column",
      `General-ledger CSV is missing the required ${label} column.`,
    );
  }

  return index;
}

function requireCell(value: string | undefined, label: string, lineNumber: number) {
  const normalized = value?.trim();

  if (!normalized) {
    throw new FinanceTwinExtractionError(
      "general_ledger_missing_cell",
      `General-ledger CSV row ${lineNumber} is missing ${label}.`,
    );
  }

  return normalized;
}

function readOptionalCell(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function readOptionalIsoDate(
  value: string | undefined,
  label: string,
  lineNumber: number,
) {
  const normalized = readOptionalCell(value);
  return normalized === null
    ? null
    : parseIsoDate(normalized, label, lineNumber);
}

function parseIsoDate(value: string, label: string, lineNumber: number) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) {
    throw new FinanceTwinExtractionError(
      "general_ledger_invalid_date",
      `General-ledger CSV row ${lineNumber} has an invalid ${label}: ${value}.`,
    );
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new FinanceTwinExtractionError(
      "general_ledger_invalid_date",
      `General-ledger CSV row ${lineNumber} has an invalid ${label}: ${value}.`,
    );
  }

  return value;
}

function parseNonNegativeMoney(
  value: string | undefined,
  label: string,
  lineNumber: number,
) {
  const cents = parseMoneyToCents(value, label, lineNumber);

  if (cents < 0n) {
    throw new FinanceTwinExtractionError(
      "general_ledger_negative_amount",
      `General-ledger CSV row ${lineNumber} has a negative ${label}, which F2C does not accept.`,
    );
  }

  return cents;
}

function parseMoneyToCents(
  value: string | undefined,
  label: string,
  lineNumber: number,
) {
  const normalized = value?.trim() ?? "";

  if (normalized.length === 0) {
    return 0n;
  }

  const parenthesized = normalized.startsWith("(") && normalized.endsWith(")");
  const negative = parenthesized || normalized.startsWith("-");
  const bare = normalized
    .replace(/^\(/u, "")
    .replace(/\)$/u, "")
    .replace(/^-+/u, "")
    .replace(/,/gu, "");

  if (!/^\d+(\.\d{1,2})?$/u.test(bare)) {
    throw new FinanceTwinExtractionError(
      "general_ledger_invalid_amount",
      `General-ledger CSV row ${lineNumber} has an invalid ${label}: ${normalized}.`,
    );
  }

  const [wholePart = "0", fractionalPart = ""] = bare.split(".");
  const cents =
    BigInt(wholePart) * 100n + BigInt((fractionalPart + "00").slice(0, 2));

  return negative ? -cents : cents;
}

function formatMoney(cents: bigint) {
  const absolute = cents < 0n ? -cents : cents;
  const sign = cents < 0n ? "-" : "";
  const whole = absolute / 100n;
  const fraction = (absolute % 100n).toString().padStart(2, "0");
  return `${sign}${whole.toString()}.${fraction}`;
}

function normalizeCurrency(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized.toUpperCase() : null;
}

function resolveSourceDeclaredPeriod(input: {
  asOfDates: Set<string>;
  periodEnds: Set<string>;
  periodKeys: Set<string>;
  periodStarts: Set<string>;
}): FinanceGeneralLedgerSourceDeclaredPeriod | null {
  const periodStart = getSingleOptionalValue(
    input.periodStarts,
    "period start",
  );
  const periodEnd = getSingleOptionalValue(input.periodEnds, "period end");
  const periodKey = getSingleOptionalValue(input.periodKeys, "period key");
  const asOf = getSingleOptionalValue(input.asOfDates, "as-of date");

  if (periodEnd !== null && asOf !== null && periodEnd !== asOf) {
    throw new FinanceTwinExtractionError(
      "general_ledger_period_context_conflict",
      "General-ledger CSV included conflicting source-declared period end and as-of dates.",
    );
  }

  if (periodStart !== null && periodEnd === null && asOf === null) {
    throw new FinanceTwinExtractionError(
      "general_ledger_period_context_incomplete",
      "General-ledger CSV included a source-declared period start without a matching period end or as-of date.",
    );
  }

  if (periodStart !== null && periodEnd !== null) {
    return {
      contextKind: "period_window",
      periodKey,
      periodStart,
      periodEnd,
      asOf,
    };
  }

  if (periodEnd !== null) {
    return {
      contextKind: "period_end_only",
      periodKey,
      periodStart: null,
      periodEnd,
      asOf,
    };
  }

  if (asOf !== null) {
    return {
      contextKind: "as_of",
      periodKey,
      periodStart: null,
      periodEnd: null,
      asOf,
    };
  }

  if (periodKey !== null) {
    return {
      contextKind: "period_key_only",
      periodKey,
      periodStart: null,
      periodEnd: null,
      asOf: null,
    };
  }

  return null;
}

function getSingleOptionalValue(values: Set<string>, label: string) {
  if (values.size > 1) {
    throw new FinanceTwinExtractionError(
      "general_ledger_period_context_conflict",
      `General-ledger CSV included conflicting source-declared ${label} values.`,
    );
  }

  return Array.from(values)[0] ?? null;
}

function mergeLedgerAccount(input: {
  existing: ExtractedLedgerAccount | null;
  incoming: ExtractedLedgerAccount;
  lineNumber: number;
}) {
  if (
    input.existing?.accountName &&
    input.incoming.accountName &&
    input.existing.accountName !== input.incoming.accountName
  ) {
    throw new FinanceTwinExtractionError(
      "general_ledger_account_conflict",
      `General-ledger CSV row ${input.lineNumber} conflicts with an earlier account name for ${input.incoming.accountCode}.`,
    );
  }

  if (
    input.existing?.accountType &&
    input.incoming.accountType &&
    input.existing.accountType !== input.incoming.accountType
  ) {
    throw new FinanceTwinExtractionError(
      "general_ledger_account_conflict",
      `General-ledger CSV row ${input.lineNumber} conflicts with an earlier account type for ${input.incoming.accountCode}.`,
    );
  }

  return {
    accountCode: input.incoming.accountCode,
    accountName: input.existing?.accountName ?? input.incoming.accountName,
    accountType: input.existing?.accountType ?? input.incoming.accountType,
  } satisfies ExtractedLedgerAccount;
}
