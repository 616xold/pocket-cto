import type { SourceFileRecord } from "@pocket-cto/domain";
import {
  buildHeaderLookup,
  decodeCsvText,
  getOptionalHeaderIndex,
  parseCsvRows,
  supportsCsvLikeSource,
} from "./csv-utils";
import { FinanceTwinExtractionError } from "./errors";

const ACCOUNT_LABEL_HEADERS = ["account_name", "account", "bank_account"];
const ACCOUNT_ID_HEADERS = ["account_id"];
const ACCOUNT_LAST4_HEADERS = ["account_number_last4", "last4"];
const INSTITUTION_HEADERS = ["bank", "bank_name", "institution"];
const DATE_HEADERS = ["as_of", "balance_date", "statement_date", "snapshot_date"];
const STATEMENT_OR_LEDGER_BALANCE_HEADERS = [
  "statement_balance",
  "ledger_balance",
  "closing_balance",
  "ending_balance",
];
const AVAILABLE_BALANCE_HEADERS = ["available_balance"];
const UNSPECIFIED_BALANCE_HEADERS = ["balance", "current_balance"];
const CURRENCY_HEADERS = ["currency", "currency_code"];

type ExtractedBankAccount = {
  accountLabel: string;
  accountNumberLast4: string | null;
  externalAccountId: string | null;
  identityKey: string;
  institutionName: string | null;
};

type ExtractedBankAccountSummary = {
  accountIdentityKey: string;
  asOfDate: string | null;
  asOfDateSourceColumn: string | null;
  balanceAmount: string;
  balanceSourceColumn: string;
  balanceType: "statement_or_ledger" | "available" | "unspecified";
  currencyCode: string | null;
  lineNumber: number;
};

export type BankAccountSummaryExtractionResult = {
  accounts: ExtractedBankAccount[];
  summaries: ExtractedBankAccountSummary[];
};

export function supportsBankAccountSummaryCsvSource(
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">,
) {
  return supportsCsvLikeSource(sourceFile);
}

export function looksLikeBankAccountSummaryCsv(input: {
  body: Buffer;
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">;
}) {
  if (!supportsBankAccountSummaryCsvSource(input.sourceFile)) {
    return false;
  }

  const header = readHeaderRow(input.body);

  if (!header) {
    return false;
  }

  const headerLookup = buildHeaderLookup(header);
  const hasAccountIdentity =
    getOptionalHeaderIndex(headerLookup, ACCOUNT_LABEL_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, ACCOUNT_ID_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, ACCOUNT_LAST4_HEADERS) !== null;
  const hasBalanceField =
    getOptionalHeaderIndex(
      headerLookup,
      STATEMENT_OR_LEDGER_BALANCE_HEADERS,
    ) !== null ||
    getOptionalHeaderIndex(headerLookup, AVAILABLE_BALANCE_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, UNSPECIFIED_BALANCE_HEADERS) !== null;

  return hasAccountIdentity && hasBalanceField;
}

export function extractBankAccountSummaryCsv(input: {
  body: Buffer;
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">;
}): BankAccountSummaryExtractionResult {
  if (!supportsBankAccountSummaryCsvSource(input.sourceFile)) {
    throw new FinanceTwinExtractionError(
      "bank_account_summary_not_csv",
      "The bank-account-summary extractor only supports CSV-like source files in F2K.",
    );
  }

  const rows = readCsvRows(input.body);
  const header = rows[0];

  if (!header) {
    throw new FinanceTwinExtractionError(
      "bank_account_summary_empty_csv",
      "Bank-account-summary CSV did not include a header row.",
    );
  }

  const headerLookup = buildHeaderLookup(header);
  const accountLabelIndex = getOptionalHeaderIndex(
    headerLookup,
    ACCOUNT_LABEL_HEADERS,
  );
  const accountIdIndex = getOptionalHeaderIndex(headerLookup, ACCOUNT_ID_HEADERS);
  const accountLast4Index = getOptionalHeaderIndex(
    headerLookup,
    ACCOUNT_LAST4_HEADERS,
  );
  const institutionIndex = getOptionalHeaderIndex(
    headerLookup,
    INSTITUTION_HEADERS,
  );
  const currencyIndex = getOptionalHeaderIndex(headerLookup, CURRENCY_HEADERS);
  const dateColumns = collectColumns(headerLookup, DATE_HEADERS);
  const statementOrLedgerColumns = collectColumns(
    headerLookup,
    STATEMENT_OR_LEDGER_BALANCE_HEADERS,
  );
  const availableColumns = collectColumns(headerLookup, AVAILABLE_BALANCE_HEADERS);
  const unspecifiedColumns = collectColumns(
    headerLookup,
    UNSPECIFIED_BALANCE_HEADERS,
  );

  if (
    accountLabelIndex === null &&
    accountIdIndex === null &&
    accountLast4Index === null
  ) {
    throw new FinanceTwinExtractionError(
      "bank_account_summary_missing_identity",
      "Bank-account-summary CSV must include at least one account identity column.",
    );
  }

  if (
    statementOrLedgerColumns.length === 0 &&
    availableColumns.length === 0 &&
    unspecifiedColumns.length === 0
  ) {
    throw new FinanceTwinExtractionError(
      "bank_account_summary_missing_balance",
      "Bank-account-summary CSV must include at least one recognized balance column.",
    );
  }

  const accountsByIdentity = new Map<string, ExtractedBankAccount>();
  const summariesByKey = new Map<string, ExtractedBankAccountSummary>();

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    const lineNumber = rowIndex + 1;

    if (row.every((value) => value.trim().length === 0)) {
      continue;
    }

    const accountLabel = resolveAccountLabel({
      accountId: readOptionalCell(indexCell(row, accountIdIndex)),
      accountLabel: readOptionalCell(indexCell(row, accountLabelIndex)),
      accountNumberLast4:
        accountLast4Index === null
          ? null
          : normalizeLast4(indexCell(row, accountLast4Index), lineNumber),
      lineNumber,
    });
    const accountNumberLast4 =
      accountLast4Index === null
        ? null
        : normalizeLast4(indexCell(row, accountLast4Index), lineNumber);
    const externalAccountId = readOptionalCell(indexCell(row, accountIdIndex));
    const institutionName = readOptionalCell(indexCell(row, institutionIndex));
    const identityKey = buildAccountIdentityKey({
      accountLabel,
      accountNumberLast4,
      externalAccountId,
      institutionName,
    });

    accountsByIdentity.set(
      identityKey,
      mergeAccount({
        existing: accountsByIdentity.get(identityKey) ?? null,
        incoming: {
          accountLabel,
          accountNumberLast4,
          externalAccountId,
          identityKey,
          institutionName,
        },
        lineNumber,
      }),
    );

    const currencyCode =
      currencyIndex === null ? null : normalizeCurrency(indexCell(row, currencyIndex));
    const asOf = readOptionalDateFromColumns({
      columns: dateColumns,
      lineNumber,
      row,
    });
    const balances = [
      readBalanceFamily({
        balanceType: "statement_or_ledger",
        columns: statementOrLedgerColumns,
        currencyCode,
        asOf,
        identityKey,
        lineNumber,
        row,
      }),
      readBalanceFamily({
        balanceType: "available",
        columns: availableColumns,
        currencyCode,
        asOf,
        identityKey,
        lineNumber,
        row,
      }),
      readBalanceFamily({
        balanceType: "unspecified",
        columns: unspecifiedColumns,
        currencyCode,
        asOf,
        identityKey,
        lineNumber,
        row,
      }),
    ].filter((value): value is ExtractedBankAccountSummary => value !== null);

    for (const balance of balances) {
      const key = `${balance.accountIdentityKey}::${balance.balanceType}`;
      const existing = summariesByKey.get(key);

      if (!existing) {
        summariesByKey.set(key, balance);
        continue;
      }

      if (
        existing.balanceAmount !== balance.balanceAmount ||
        existing.currencyCode !== balance.currencyCode ||
        existing.asOfDate !== balance.asOfDate
      ) {
        throw new FinanceTwinExtractionError(
          "bank_account_summary_balance_conflict",
          `Bank-account-summary CSV includes conflicting ${balance.balanceType} values for one account in the same slice.`,
        );
      }
    }
  }

  if (accountsByIdentity.size === 0 || summariesByKey.size === 0) {
    throw new FinanceTwinExtractionError(
      "bank_account_summary_no_rows",
      "Bank-account-summary CSV did not include any usable non-empty balance rows.",
    );
  }

  return {
    accounts: Array.from(accountsByIdentity.values()).sort((left, right) => {
      return (
        left.accountLabel.localeCompare(right.accountLabel) ||
        (left.institutionName ?? "").localeCompare(right.institutionName ?? "") ||
        left.identityKey.localeCompare(right.identityKey)
      );
    }),
    summaries: Array.from(summariesByKey.values()).sort((left, right) => {
      return (
        left.lineNumber - right.lineNumber ||
        left.balanceType.localeCompare(right.balanceType) ||
        left.accountIdentityKey.localeCompare(right.accountIdentityKey)
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
        "bank_account_summary_unterminated_quote",
        "Bank-account-summary CSV ended while a quoted field was still open.",
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

function resolveAccountLabel(input: {
  accountId: string | null;
  accountLabel: string | null;
  accountNumberLast4: string | null;
  lineNumber: number;
}) {
  if (input.accountLabel) {
    return input.accountLabel;
  }

  if (input.accountNumberLast4) {
    return `Account ••••${input.accountNumberLast4}`;
  }

  if (input.accountId) {
    return `Account ${input.accountId}`;
  }

  throw new FinanceTwinExtractionError(
    "bank_account_summary_missing_account_label",
    `Bank-account-summary CSV row ${input.lineNumber} is missing bank account identity fields.`,
  );
}

function buildAccountIdentityKey(input: {
  accountLabel: string;
  accountNumberLast4: string | null;
  externalAccountId: string | null;
  institutionName: string | null;
}) {
  const normalizedLabel = normalizeKeyPart(input.accountLabel);
  const normalizedInstitution = normalizeKeyPart(input.institutionName);

  if (input.externalAccountId) {
    return `external:${normalizeKeyPart(input.externalAccountId)}`;
  }

  if (input.accountNumberLast4 && normalizedLabel) {
    return `label_last4:${normalizedLabel}|${input.accountNumberLast4}`;
  }

  if (input.accountNumberLast4 && normalizedInstitution) {
    return `institution_last4:${normalizedInstitution}|${input.accountNumberLast4}`;
  }

  if (normalizedInstitution && normalizedLabel) {
    return `institution_label:${normalizedInstitution}|${normalizedLabel}`;
  }

  if (normalizedLabel) {
    return `label:${normalizedLabel}`;
  }

  if (input.accountNumberLast4) {
    return `last4:${input.accountNumberLast4}`;
  }

  throw new FinanceTwinExtractionError(
    "bank_account_summary_missing_identity",
    "Bank-account-summary CSV could not derive a deterministic bank account identity.",
  );
}

function mergeAccount(input: {
  existing: ExtractedBankAccount | null;
  incoming: ExtractedBankAccount;
  lineNumber: number;
}) {
  if (!input.existing) {
    return input.incoming;
  }

  const externalAccountId = mergeOptionalText({
    existing: input.existing.externalAccountId,
    incoming: input.incoming.externalAccountId,
    label: "account id",
    lineNumber: input.lineNumber,
  });
  const accountNumberLast4 = mergeOptionalText({
    existing: input.existing.accountNumberLast4,
    incoming: input.incoming.accountNumberLast4,
    label: "account last4",
    lineNumber: input.lineNumber,
  });
  const institutionName = mergeOptionalText({
    existing: input.existing.institutionName,
    incoming: input.incoming.institutionName,
    label: "institution",
    lineNumber: input.lineNumber,
  });

  return {
    ...input.existing,
    accountLabel:
      input.existing.accountLabel.length >= input.incoming.accountLabel.length
        ? input.existing.accountLabel
        : input.incoming.accountLabel,
    externalAccountId,
    accountNumberLast4,
    institutionName,
  };
}

function mergeOptionalText(input: {
  existing: string | null;
  incoming: string | null;
  label: string;
  lineNumber: number;
}) {
  if (!input.existing) {
    return input.incoming;
  }

  if (!input.incoming || input.existing === input.incoming) {
    return input.existing;
  }

  throw new FinanceTwinExtractionError(
    "bank_account_summary_account_conflict",
    `Bank-account-summary CSV row ${input.lineNumber} conflicts with an earlier ${input.label} for the same account.`,
  );
}

function readBalanceFamily(input: {
  balanceType: ExtractedBankAccountSummary["balanceType"];
  columns: Array<{ header: string; index: number }>;
  currencyCode: string | null;
  asOf: { value: string | null; sourceColumn: string | null };
  identityKey: string;
  lineNumber: number;
  row: string[];
}) {
  let resolved: { amount: string; sourceColumn: string } | null = null;

  for (const column of input.columns) {
    const amount = readOptionalMoney(indexCell(input.row, column.index), {
      label: `${input.balanceType} balance`,
      lineNumber: input.lineNumber,
    });

    if (amount === null) {
      continue;
    }

    if (resolved && resolved.amount !== amount) {
      throw new FinanceTwinExtractionError(
        "bank_account_summary_balance_conflict",
        `Bank-account-summary CSV row ${input.lineNumber} includes conflicting ${input.balanceType} balance fields.`,
      );
    }

    if (!resolved) {
      resolved = {
        amount,
        sourceColumn: column.header,
      };
    }
  }

  if (!resolved) {
    return null;
  }

  return {
    accountIdentityKey: input.identityKey,
    asOfDate: input.asOf.value,
    asOfDateSourceColumn: input.asOf.sourceColumn,
    balanceAmount: resolved.amount,
    balanceSourceColumn: resolved.sourceColumn,
    balanceType: input.balanceType,
    currencyCode: input.currencyCode,
    lineNumber: input.lineNumber,
  } satisfies ExtractedBankAccountSummary;
}

function readOptionalDateFromColumns(input: {
  columns: Array<{ header: string; index: number }>;
  lineNumber: number;
  row: string[];
}) {
  let resolved: { sourceColumn: string | null; value: string | null } = {
    sourceColumn: null,
    value: null,
  };

  for (const column of input.columns) {
    const raw = readOptionalCell(indexCell(input.row, column.index));

    if (raw === null) {
      continue;
    }

    const value = parseIsoDate(raw, "as-of date", input.lineNumber);

    if (resolved.value !== null && resolved.value !== value) {
      throw new FinanceTwinExtractionError(
        "bank_account_summary_date_conflict",
        `Bank-account-summary CSV row ${input.lineNumber} includes conflicting date fields.`,
      );
    }

    if (resolved.value === null) {
      resolved = {
        sourceColumn: column.header,
        value,
      };
    }
  }

  return resolved;
}

function readOptionalCell(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeLast4(value: string | undefined, lineNumber: number) {
  const normalized = readOptionalCell(value);

  if (normalized === null) {
    return null;
  }

  const digits = normalized.replace(/\D/gu, "");

  if (digits.length !== 4) {
    throw new FinanceTwinExtractionError(
      "bank_account_summary_invalid_last4",
      `Bank-account-summary CSV row ${lineNumber} has an invalid account last4 value: ${normalized}.`,
    );
  }

  return digits;
}

function normalizeCurrency(value: string | undefined) {
  const normalized = readOptionalCell(value);
  return normalized ? normalized.toUpperCase() : null;
}

function normalizeKeyPart(value: string | null) {
  return value?.trim().toLowerCase().replace(/\s+/gu, " ") ?? "";
}

function parseIsoDate(value: string, label: string, lineNumber: number) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) {
    throw new FinanceTwinExtractionError(
      "bank_account_summary_invalid_date",
      `Bank-account-summary CSV row ${lineNumber} has an invalid ${label}: ${value}.`,
    );
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new FinanceTwinExtractionError(
      "bank_account_summary_invalid_date",
      `Bank-account-summary CSV row ${lineNumber} has an invalid ${label}: ${value}.`,
    );
  }

  return value;
}

function readOptionalMoney(
  value: string | undefined,
  input: { label: string; lineNumber: number },
) {
  const normalized = value?.trim() ?? "";

  if (normalized.length === 0) {
    return null;
  }

  return formatMoney(parseMoneyToCents(normalized, input));
}

function parseMoneyToCents(
  value: string,
  input: { label: string; lineNumber: number },
) {
  const parenthesized = value.startsWith("(") && value.endsWith(")");
  const negative = parenthesized || value.startsWith("-");
  const bare = value
    .replace(/^\(/u, "")
    .replace(/\)$/u, "")
    .replace(/^-+/u, "")
    .replace(/,/gu, "");

  if (!/^\d+(\.\d{1,2})?$/u.test(bare)) {
    throw new FinanceTwinExtractionError(
      "bank_account_summary_invalid_amount",
      `Bank-account-summary CSV row ${input.lineNumber} has an invalid ${input.label}: ${value}.`,
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
