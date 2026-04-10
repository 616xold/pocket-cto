import type { SourceFileRecord } from "@pocket-cto/domain";
import {
  buildHeaderLookup,
  decodeCsvText,
  getOptionalHeaderIndex,
  parseCsvRows,
  supportsCsvLikeSource,
} from "./csv-utils";
import { FinanceTwinExtractionError } from "./errors";

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
  "description",
  "name",
];
const ACCOUNT_TYPE_HEADERS = ["account_type", "type"];
const DETAIL_TYPE_HEADERS = ["detail_type", "detail", "subtype", "sub_type"];
const DESCRIPTION_HEADERS = ["description", "memo", "notes"];
const PARENT_ACCOUNT_CODE_HEADERS = [
  "parent_account_code",
  "parent_code",
  "parent_account",
  "parent",
];
const ACTIVE_HEADERS = ["is_active", "active", "enabled", "posting"];
const STATUS_HEADERS = ["status", "account_status"];
const FILE_NAME_HINT = /(chart[-_ ]?of[-_ ]?accounts|coa)/iu;

export type ChartOfAccountsExtractionResult = {
  accounts: Array<{
    accountCode: string;
    accountName: string;
    accountType: string | null;
    detailType: string | null;
    description: string | null;
    parentAccountCode: string | null;
    isActive: boolean | null;
    lineNumber: number;
  }>;
};

export function supportsChartOfAccountsCsvSource(
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">,
) {
  return supportsCsvLikeSource(sourceFile);
}

export function looksLikeChartOfAccountsCsv(input: {
  body: Buffer;
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">;
}) {
  if (!supportsChartOfAccountsCsvSource(input.sourceFile)) {
    return false;
  }

  const header = readHeaderRow(input.body);

  if (!header) {
    return false;
  }

  const headerLookup = buildHeaderLookup(header);
  const hasRequiredColumns =
    getOptionalHeaderIndex(headerLookup, ACCOUNT_CODE_HEADERS) !== null &&
    getOptionalHeaderIndex(headerLookup, ACCOUNT_NAME_HEADERS) !== null;
  const hasCatalogMetadata =
    getOptionalHeaderIndex(headerLookup, ACCOUNT_TYPE_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, DETAIL_TYPE_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, DESCRIPTION_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, PARENT_ACCOUNT_CODE_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, ACTIVE_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, STATUS_HEADERS) !== null;

  return (
    hasRequiredColumns &&
    (hasCatalogMetadata ||
      FILE_NAME_HINT.test(input.sourceFile.originalFileName))
  );
}

export function extractChartOfAccountsCsv(input: {
  body: Buffer;
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">;
}): ChartOfAccountsExtractionResult {
  if (!supportsChartOfAccountsCsvSource(input.sourceFile)) {
    throw new FinanceTwinExtractionError(
      "chart_of_accounts_not_csv",
      "The chart-of-accounts extractor only supports CSV-like source files in F2B.",
    );
  }

  const rows = readCsvRows(input.body);
  const header = rows[0];

  if (!header) {
    throw new FinanceTwinExtractionError(
      "chart_of_accounts_empty_csv",
      "Chart-of-accounts CSV did not include a header row.",
    );
  }

  const headerLookup = buildHeaderLookup(header);
  const accountCodeIndex = getRequiredHeaderIndex(
    headerLookup,
    ACCOUNT_CODE_HEADERS,
    "account code",
  );
  const accountNameIndex = getRequiredHeaderIndex(
    headerLookup,
    ACCOUNT_NAME_HEADERS,
    "account name",
  );
  const accountTypeIndex = getOptionalHeaderIndex(
    headerLookup,
    ACCOUNT_TYPE_HEADERS,
  );
  const detailTypeIndex = getOptionalHeaderIndex(
    headerLookup,
    DETAIL_TYPE_HEADERS,
  );
  const descriptionIndex = getOptionalHeaderIndex(
    headerLookup,
    DESCRIPTION_HEADERS,
  );
  const parentAccountCodeIndex = getOptionalHeaderIndex(
    headerLookup,
    PARENT_ACCOUNT_CODE_HEADERS,
  );
  const activeIndex = getOptionalHeaderIndex(headerLookup, ACTIVE_HEADERS);
  const statusIndex = getOptionalHeaderIndex(headerLookup, STATUS_HEADERS);

  const accountsByCode = new Map<
    string,
    ChartOfAccountsExtractionResult["accounts"][number]
  >();

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    const lineNumber = rowIndex + 1;

    if (row.every((value) => value.trim().length === 0)) {
      continue;
    }

    const accountCode = requireCell(
      row[accountCodeIndex],
      "account code",
      lineNumber,
    );
    const accountName = requireCell(
      row[accountNameIndex],
      "account name",
      lineNumber,
    );
    const accountType =
      accountTypeIndex === null ? null : readOptionalCell(row[accountTypeIndex]);
    const detailType =
      detailTypeIndex === null ? null : readOptionalCell(row[detailTypeIndex]);
    const description =
      descriptionIndex === null ? null : readOptionalCell(row[descriptionIndex]);
    const parentAccountCode =
      parentAccountCodeIndex === null
        ? null
        : readOptionalCell(row[parentAccountCodeIndex]);
    const isActive = normalizeActivity({
      activeValue: activeIndex === null ? undefined : row[activeIndex],
      lineNumber,
      statusValue: statusIndex === null ? undefined : row[statusIndex],
    });
    const existingAccount = accountsByCode.get(accountCode);

    if (parentAccountCode === accountCode) {
      throw new FinanceTwinExtractionError(
        "chart_of_accounts_self_parent",
        `Chart-of-accounts CSV row ${lineNumber} sets account ${accountCode} as its own parent.`,
      );
    }

    if (
      existingAccount &&
      (existingAccount.accountName !== accountName ||
        existingAccount.accountType !== accountType ||
        existingAccount.detailType !== detailType ||
        existingAccount.description !== description ||
        existingAccount.parentAccountCode !== parentAccountCode ||
        existingAccount.isActive !== isActive)
    ) {
      throw new FinanceTwinExtractionError(
        "chart_of_accounts_account_conflict",
        `Account ${accountCode} was defined with conflicting catalog fields in the same chart-of-accounts CSV.`,
      );
    }

    accountsByCode.set(accountCode, {
      accountCode,
      accountName,
      accountType,
      detailType,
      description,
      parentAccountCode,
      isActive,
      lineNumber,
    });
  }

  const accounts = Array.from(accountsByCode.values()).sort((left, right) =>
    left.accountCode.localeCompare(right.accountCode),
  );

  if (accounts.length === 0) {
    throw new FinanceTwinExtractionError(
      "chart_of_accounts_no_rows",
      "Chart-of-accounts CSV did not include any non-empty data rows.",
    );
  }

  return { accounts };
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
        "chart_of_accounts_unterminated_quote",
        "Chart-of-accounts CSV ended while a quoted field was still open.",
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
      "chart_of_accounts_missing_column",
      `Chart-of-accounts CSV is missing the required ${label} column.`,
    );
  }

  return index;
}

function requireCell(value: string | undefined, label: string, lineNumber: number) {
  const normalized = value?.trim();

  if (!normalized) {
    throw new FinanceTwinExtractionError(
      "chart_of_accounts_missing_cell",
      `Chart-of-accounts CSV row ${lineNumber} is missing ${label}.`,
    );
  }

  return normalized;
}

function readOptionalCell(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeActivity(input: {
  activeValue: string | undefined;
  lineNumber: number;
  statusValue: string | undefined;
}) {
  const directValue = normalizeBooleanish(input.activeValue);

  if (directValue !== undefined) {
    return directValue;
  }

  const statusValue = normalizeBooleanish(input.statusValue);

  if (statusValue !== undefined) {
    return statusValue;
  }

  const activeRaw = input.activeValue?.trim();
  const statusRaw = input.statusValue?.trim();

  if ((activeRaw && activeRaw.length > 0) || (statusRaw && statusRaw.length > 0)) {
    throw new FinanceTwinExtractionError(
      "chart_of_accounts_invalid_status",
      `Chart-of-accounts CSV row ${input.lineNumber} has an unsupported activity value.`,
    );
  }

  return null;
}

function normalizeBooleanish(value: string | undefined) {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) {
    return undefined;
  }

  if (
    normalized === "active" ||
    normalized === "enabled" ||
    normalized === "open" ||
    normalized === "posting" ||
    normalized === "true" ||
    normalized === "yes" ||
    normalized === "y" ||
    normalized === "1"
  ) {
    return true;
  }

  if (
    normalized === "inactive" ||
    normalized === "disabled" ||
    normalized === "closed" ||
    normalized === "non-posting" ||
    normalized === "false" ||
    normalized === "no" ||
    normalized === "n" ||
    normalized === "0"
  ) {
    return false;
  }

  return undefined;
}
