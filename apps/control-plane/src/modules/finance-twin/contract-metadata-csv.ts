import type {
  FinanceContractObligationType,
  FinanceContractSourceFieldMap,
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

const CONTRACT_ID_HEADERS = ["contract_id"];
const CONTRACT_LABEL_HEADERS = [
  "contract",
  "contract_name",
  "agreement",
  "agreement_name",
];
const COUNTERPARTY_HEADERS = [
  "counterparty",
  "customer",
  "vendor",
  "supplier",
  "partner",
];
const CONTRACT_TYPE_HEADERS = ["contract_type"];
const AGREEMENT_TYPE_HEADERS = ["agreement_type"];
const STATUS_HEADERS = ["status"];
const START_DATE_HEADERS = ["start_date"];
const EFFECTIVE_DATE_HEADERS = ["effective_date"];
const END_DATE_HEADERS = ["end_date"];
const EXPIRATION_DATE_HEADERS = ["expiration_date"];
const RENEWAL_DATE_HEADERS = ["renewal_date"];
const NOTICE_DEADLINE_HEADERS = ["notice_deadline"];
const NEXT_PAYMENT_DATE_HEADERS = ["next_payment_date"];
const AS_OF_HEADERS = ["as_of", "report_date", "snapshot_date"];
const AMOUNT_HEADERS = ["amount"];
const PAYMENT_AMOUNT_HEADERS = ["payment_amount"];
const CURRENCY_HEADERS = ["currency", "currency_code"];
const AUTO_RENEW_HEADERS = ["auto_renew", "renews_automatically"];

type ExtractedContract = {
  agreementType: string | null;
  amount: string | null;
  autoRenew: boolean | null;
  contractIdentityKey: string;
  contractLabel: string;
  contractType: string | null;
  counterpartyLabel: string | null;
  currencyCode: string | null;
  effectiveDate: string | null;
  endDate: string | null;
  expirationDate: string | null;
  externalContractId: string | null;
  knownAsOfDates: string[];
  lineNumber: number;
  nextPaymentDate: string | null;
  noticeDeadline: string | null;
  paymentAmount: string | null;
  renewalDate: string | null;
  sourceFieldMap: FinanceContractSourceFieldMap;
  sourceLineNumbers: number[];
  startDate: string | null;
  status: string | null;
  unknownAsOfObservationCount: number;
};

export type ExtractedContractObligation = {
  amount: string | null;
  currencyCode: string | null;
  dueDate: string;
  lineNumber: number;
  obligationScopeKey: string;
  obligationType: FinanceContractObligationType;
  sourceField: string;
  sourceLineNumbers: number[];
};

export type ContractMetadataExtractionResult = {
  contracts: ExtractedContract[];
  obligations: Array<
    ExtractedContractObligation & {
      contractIdentityKey: string;
    }
  >;
};

export function supportsContractMetadataCsvSource(
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">,
) {
  return supportsCsvLikeSource(sourceFile);
}

export function looksLikeContractMetadataCsv(input: {
  body: Buffer;
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">;
}) {
  if (!supportsContractMetadataCsvSource(input.sourceFile)) {
    return false;
  }

  const header = readHeaderRow(input.body);

  if (!header) {
    return false;
  }

  const headerLookup = buildHeaderLookup(header);
  const hasContractIdentity =
    getOptionalHeaderIndex(headerLookup, CONTRACT_ID_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, CONTRACT_LABEL_HEADERS) !== null;
  const hasContractSignal =
    getOptionalHeaderIndex(headerLookup, COUNTERPARTY_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, CONTRACT_TYPE_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, AGREEMENT_TYPE_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, STATUS_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, START_DATE_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, EFFECTIVE_DATE_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, END_DATE_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, EXPIRATION_DATE_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, RENEWAL_DATE_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, NOTICE_DEADLINE_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, NEXT_PAYMENT_DATE_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, AS_OF_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, AMOUNT_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, PAYMENT_AMOUNT_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, CURRENCY_HEADERS) !== null ||
    getOptionalHeaderIndex(headerLookup, AUTO_RENEW_HEADERS) !== null;

  return hasContractIdentity && hasContractSignal;
}

export function extractContractMetadataCsv(input: {
  body: Buffer;
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">;
}): ContractMetadataExtractionResult {
  if (!supportsContractMetadataCsvSource(input.sourceFile)) {
    throw new FinanceTwinExtractionError(
      "contract_metadata_not_csv",
      "The contract-metadata extractor only supports CSV-like source files in F2N.",
    );
  }

  const rows = readCsvRows(input.body);
  const header = rows[0];

  if (!header) {
    throw new FinanceTwinExtractionError(
      "contract_metadata_empty_csv",
      "Contract-metadata CSV did not include a header row.",
    );
  }

  const headerLookup = buildHeaderLookup(header);

  if (
    getOptionalHeaderIndex(headerLookup, CONTRACT_ID_HEADERS) === null &&
    getOptionalHeaderIndex(headerLookup, CONTRACT_LABEL_HEADERS) === null
  ) {
    throw new FinanceTwinExtractionError(
      "contract_metadata_missing_contract_identity",
      "Contract-metadata CSV must include at least one explicit contract identity column.",
    );
  }

  const contractsByIdentity = new Map<string, ExtractedContract>();

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    const lineNumber = rowIndex + 1;

    if (row.every((value) => value.trim().length === 0)) {
      continue;
    }

    const contract = readContractRow({ headerLookup, lineNumber, row });
    const existing = contractsByIdentity.get(contract.contractIdentityKey);

    contractsByIdentity.set(
      contract.contractIdentityKey,
      existing ? mergeContract(existing, contract, lineNumber) : contract,
    );
  }

  if (contractsByIdentity.size === 0) {
    throw new FinanceTwinExtractionError(
      "contract_metadata_no_rows",
      "Contract-metadata CSV did not include any usable non-empty contract rows.",
    );
  }

  const contracts = Array.from(contractsByIdentity.values()).sort((left, right) => {
    return (
      left.contractLabel.localeCompare(right.contractLabel) ||
      (left.externalContractId ?? "").localeCompare(right.externalContractId ?? "") ||
      left.lineNumber - right.lineNumber
    );
  });
  const obligations = contracts.flatMap((contract) => {
    return buildObligations(contract).map((obligation) => ({
      ...obligation,
      contractIdentityKey: contract.contractIdentityKey,
    }));
  });

  return {
    contracts,
    obligations,
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
        "contract_metadata_unterminated_quote",
        "Contract-metadata CSV ended while a quoted field was still open.",
      );
    }

    throw error;
  }
}

function readContractRow(input: {
  headerLookup: Map<string, number>;
  lineNumber: number;
  row: string[];
}): ExtractedContract {
  const contractIdentity = readIdentityField({
    headerLookup: input.headerLookup,
    idHeaders: CONTRACT_ID_HEADERS,
    labelHeaders: CONTRACT_LABEL_HEADERS,
    lineNumber: input.lineNumber,
    row: input.row,
  });
  const counterparty = readOptionalStringField({
    headerLookup: input.headerLookup,
    headers: COUNTERPARTY_HEADERS,
    lineNumber: input.lineNumber,
    row: input.row,
    fieldLabel: "counterparty",
  });
  const contractType = readOptionalStringField({
    headerLookup: input.headerLookup,
    headers: CONTRACT_TYPE_HEADERS,
    lineNumber: input.lineNumber,
    row: input.row,
    fieldLabel: "contract type",
  });
  const agreementType = readOptionalStringField({
    headerLookup: input.headerLookup,
    headers: AGREEMENT_TYPE_HEADERS,
    lineNumber: input.lineNumber,
    row: input.row,
    fieldLabel: "agreement type",
  });
  const status = readOptionalStringField({
    headerLookup: input.headerLookup,
    headers: STATUS_HEADERS,
    lineNumber: input.lineNumber,
    row: input.row,
    fieldLabel: "status",
  });
  const startDate = readOptionalDateField(input, START_DATE_HEADERS, "start date");
  const effectiveDate = readOptionalDateField(
    input,
    EFFECTIVE_DATE_HEADERS,
    "effective date",
  );
  const endDate = readOptionalDateField(input, END_DATE_HEADERS, "end date");
  const expirationDate = readOptionalDateField(
    input,
    EXPIRATION_DATE_HEADERS,
    "expiration date",
  );
  const renewalDate = readOptionalDateField(
    input,
    RENEWAL_DATE_HEADERS,
    "renewal date",
  );
  const noticeDeadline = readOptionalDateField(
    input,
    NOTICE_DEADLINE_HEADERS,
    "notice deadline",
  );
  const nextPaymentDate = readOptionalDateField(
    input,
    NEXT_PAYMENT_DATE_HEADERS,
    "next payment date",
  );
  const asOfDate = readOptionalDateField(input, AS_OF_HEADERS, "observation date");
  const amount = readOptionalMoneyField(input, AMOUNT_HEADERS, "amount");
  const paymentAmount = readOptionalMoneyField(
    input,
    PAYMENT_AMOUNT_HEADERS,
    "payment amount",
  );
  const currency = readOptionalCurrencyField(input);
  const autoRenew = readOptionalBooleanField(input);

  return {
    agreementType: agreementType.value,
    amount: amount.value,
    autoRenew: autoRenew.value,
    contractIdentityKey: contractIdentity.identityKey,
    contractLabel: contractIdentity.contractLabel,
    contractType: contractType.value,
    counterpartyLabel: counterparty.value,
    currencyCode: currency.value,
    effectiveDate: effectiveDate.value,
    endDate: endDate.value,
    expirationDate: expirationDate.value,
    externalContractId: contractIdentity.externalContractId,
    knownAsOfDates: asOfDate.value ? [asOfDate.value] : [],
    lineNumber: input.lineNumber,
    nextPaymentDate: nextPaymentDate.value,
    noticeDeadline: noticeDeadline.value,
    paymentAmount: paymentAmount.value,
    renewalDate: renewalDate.value,
    sourceFieldMap: {
      agreementType: agreementType.sourceField,
      amount: amount.sourceField,
      asOfDate: asOfDate.sourceField,
      autoRenew: autoRenew.sourceField,
      contractIdentity: contractIdentity.sourceField,
      contractType: contractType.sourceField,
      counterparty: counterparty.sourceField,
      currencyCode: currency.sourceField,
      effectiveDate: effectiveDate.sourceField,
      endDate: endDate.sourceField,
      expirationDate: expirationDate.sourceField,
      nextPaymentDate: nextPaymentDate.sourceField,
      noticeDeadline: noticeDeadline.sourceField,
      paymentAmount: paymentAmount.sourceField,
      renewalDate: renewalDate.sourceField,
      startDate: startDate.sourceField,
      status: status.sourceField,
    },
    sourceLineNumbers: [input.lineNumber],
    startDate: startDate.value,
    status: status.value,
    unknownAsOfObservationCount: asOfDate.value ? 0 : 1,
  };
}

function buildObligations(
  contract: ExtractedContract,
): ExtractedContractObligation[] {
  const obligations: ExtractedContractObligation[] = [];
  const pushObligation = (
    obligationType: FinanceContractObligationType,
    dueDate: string | null,
    sourceField: string | null,
    amount: string | null,
    currencyCode: string | null,
  ) => {
    if (!dueDate || !sourceField) {
      return;
    }

    obligations.push({
      amount,
      currencyCode,
      dueDate,
      lineNumber: contract.lineNumber,
      obligationScopeKey: `${obligationType}::${dueDate}::${amount ?? "__unknown__"}::${currencyCode ?? "__unknown__"}::${sourceField}`,
      obligationType,
      sourceField,
      sourceLineNumbers: contract.sourceLineNumbers.slice(),
    });
  };

  pushObligation(
    "renewal",
    contract.renewalDate,
    contract.sourceFieldMap.renewalDate,
    null,
    null,
  );
  pushObligation(
    "expiration",
    contract.expirationDate,
    contract.sourceFieldMap.expirationDate,
    null,
    null,
  );
  pushObligation(
    "end_date",
    contract.endDate,
    contract.sourceFieldMap.endDate,
    null,
    null,
  );
  pushObligation(
    "notice_deadline",
    contract.noticeDeadline,
    contract.sourceFieldMap.noticeDeadline,
    null,
    null,
  );
  pushObligation(
    "scheduled_payment",
    contract.nextPaymentDate,
    contract.sourceFieldMap.nextPaymentDate,
    contract.paymentAmount,
    contract.paymentAmount ? contract.currencyCode : null,
  );

  return obligations;
}

function mergeContract(
  existing: ExtractedContract,
  incoming: ExtractedContract,
  lineNumber: number,
): ExtractedContract {
  return {
    agreementType: mergeOptionalValue(
      existing.agreementType,
      incoming.agreementType,
      "agreement type",
      lineNumber,
    ),
    amount: mergeOptionalValue(existing.amount, incoming.amount, "amount", lineNumber),
    autoRenew: mergeOptionalValue(
      existing.autoRenew,
      incoming.autoRenew,
      "auto-renew",
      lineNumber,
    ),
    contractIdentityKey: existing.contractIdentityKey,
    contractLabel: mergeOptionalValue(
      existing.contractLabel,
      incoming.contractLabel,
      "contract label",
      lineNumber,
    ) ?? incoming.contractLabel,
    contractType: mergeOptionalValue(
      existing.contractType,
      incoming.contractType,
      "contract type",
      lineNumber,
    ),
    counterpartyLabel: mergeOptionalValue(
      existing.counterpartyLabel,
      incoming.counterpartyLabel,
      "counterparty",
      lineNumber,
    ),
    currencyCode: mergeOptionalValue(
      existing.currencyCode,
      incoming.currencyCode,
      "currency",
      lineNumber,
    ),
    effectiveDate: mergeOptionalValue(
      existing.effectiveDate,
      incoming.effectiveDate,
      "effective date",
      lineNumber,
    ),
    endDate: mergeOptionalValue(existing.endDate, incoming.endDate, "end date", lineNumber),
    expirationDate: mergeOptionalValue(
      existing.expirationDate,
      incoming.expirationDate,
      "expiration date",
      lineNumber,
    ),
    externalContractId: mergeOptionalValue(
      existing.externalContractId,
      incoming.externalContractId,
      "contract id",
      lineNumber,
    ),
    knownAsOfDates: Array.from(
      new Set([...existing.knownAsOfDates, ...incoming.knownAsOfDates]),
    ).sort(),
    lineNumber: Math.min(existing.lineNumber, incoming.lineNumber),
    nextPaymentDate: mergeOptionalValue(
      existing.nextPaymentDate,
      incoming.nextPaymentDate,
      "next payment date",
      lineNumber,
    ),
    noticeDeadline: mergeOptionalValue(
      existing.noticeDeadline,
      incoming.noticeDeadline,
      "notice deadline",
      lineNumber,
    ),
    paymentAmount: mergeOptionalValue(
      existing.paymentAmount,
      incoming.paymentAmount,
      "payment amount",
      lineNumber,
    ),
    renewalDate: mergeOptionalValue(
      existing.renewalDate,
      incoming.renewalDate,
      "renewal date",
      lineNumber,
    ),
    sourceFieldMap: mergeSourceFieldMap(
      existing.sourceFieldMap,
      incoming.sourceFieldMap,
    ),
    sourceLineNumbers: Array.from(
      new Set([...existing.sourceLineNumbers, ...incoming.sourceLineNumbers]),
    ).sort((left, right) => left - right),
    startDate: mergeOptionalValue(
      existing.startDate,
      incoming.startDate,
      "start date",
      lineNumber,
    ),
    status: mergeOptionalValue(existing.status, incoming.status, "status", lineNumber),
    unknownAsOfObservationCount:
      existing.unknownAsOfObservationCount + incoming.unknownAsOfObservationCount,
  };
}

function readIdentityField(input: {
  headerLookup: Map<string, number>;
  idHeaders: string[];
  labelHeaders: string[];
  lineNumber: number;
  row: string[];
}) {
  const externalContractId = readOptionalStringField({
    headerLookup: input.headerLookup,
    headers: input.idHeaders,
    lineNumber: input.lineNumber,
    row: input.row,
    fieldLabel: "contract id",
  });
  const contractLabel = readOptionalStringField({
    headerLookup: input.headerLookup,
    headers: input.labelHeaders,
    lineNumber: input.lineNumber,
    row: input.row,
    fieldLabel: "contract label",
  });
  const resolvedLabel = contractLabel.value ?? externalContractId.value;

  if (!resolvedLabel) {
    throw new FinanceTwinExtractionError(
      "contract_metadata_missing_contract_identity",
      `Contract-metadata CSV row ${input.lineNumber} is missing contract identity.`,
    );
  }

  return {
    contractLabel: resolvedLabel,
    externalContractId: externalContractId.value,
    identityKey: externalContractId.value
      ? `contract_id:${normalizeIdentityValue(externalContractId.value)}`
      : `contract_label:${normalizeIdentityValue(resolvedLabel)}`,
    sourceField: contractLabel.sourceField ?? externalContractId.sourceField,
  };
}

function readOptionalStringField(input: {
  headerLookup: Map<string, number>;
  headers: string[];
  lineNumber: number;
  row: string[];
  fieldLabel: string;
}) {
  return readConsistentOptionalValue({
    columns: collectColumns(input.headerLookup, input.headers),
    lineNumber: input.lineNumber,
    row: input.row,
    fieldLabel: input.fieldLabel,
    parse: (value) => value,
  });
}

function readOptionalDateField(
  input: { headerLookup: Map<string, number>; lineNumber: number; row: string[] },
  headers: string[],
  fieldLabel: string,
) {
  return readConsistentOptionalValue({
    columns: collectColumns(input.headerLookup, headers),
    lineNumber: input.lineNumber,
    row: input.row,
    fieldLabel,
    parse: (value, header, lineNumber) => parseIsoDate(value, header, lineNumber),
  });
}

function readOptionalMoneyField(
  input: { headerLookup: Map<string, number>; lineNumber: number; row: string[] },
  headers: string[],
  fieldLabel: string,
) {
  return readConsistentOptionalValue({
    columns: collectColumns(input.headerLookup, headers),
    lineNumber: input.lineNumber,
    row: input.row,
    fieldLabel,
    parse: (value, header, lineNumber) => formatMoney(parseMoney(value, header, lineNumber)),
  });
}

function readOptionalCurrencyField(input: {
  headerLookup: Map<string, number>;
  lineNumber: number;
  row: string[];
}) {
  return readConsistentOptionalValue({
    columns: collectColumns(input.headerLookup, CURRENCY_HEADERS),
    lineNumber: input.lineNumber,
    row: input.row,
    fieldLabel: "currency",
    parse: (value) => normalizeCurrency(value),
  });
}

function readOptionalBooleanField(input: {
  headerLookup: Map<string, number>;
  lineNumber: number;
  row: string[];
}) {
  return readConsistentOptionalValue({
    columns: collectColumns(input.headerLookup, AUTO_RENEW_HEADERS),
    lineNumber: input.lineNumber,
    row: input.row,
    fieldLabel: "auto-renew",
    parse: (value, header, lineNumber) => parseBoolean(value, header, lineNumber),
  });
}

function collectColumns(headerLookup: Map<string, number>, headers: string[]) {
  return headers.flatMap((header) => {
    const index = getOptionalHeaderIndex(headerLookup, [header]);
    return index === null ? [] : [{ header, index }];
  });
}

function readConsistentOptionalValue<T>(input: {
  columns: { header: string; index: number }[];
  fieldLabel: string;
  lineNumber: number;
  parse: (value: string, header: string, lineNumber: number) => T;
  row: string[];
}) {
  const values = input.columns.flatMap((column) => {
    const value = readOptionalCell(input.row[column.index]);
    return value === null
      ? []
      : [{ parsed: input.parse(value, column.header, input.lineNumber), sourceField: column.header }];
  });
  const distinctValues = Array.from(
    new Map(values.map((entry) => [String(entry.parsed), entry])),
  ).map(([, entry]) => entry);

  if (distinctValues.length > 1) {
    throw new FinanceTwinExtractionError(
      "contract_metadata_field_conflict",
      `Contract-metadata CSV row ${input.lineNumber} includes conflicting ${input.fieldLabel} columns.`,
    );
  }

  return {
    sourceField: distinctValues[0]?.sourceField ?? null,
    value: distinctValues[0]?.parsed ?? null,
  };
}

function mergeOptionalValue<T>(
  existing: T | null,
  incoming: T | null,
  fieldLabel: string,
  lineNumber: number,
) {
  if (existing !== null && incoming !== null && existing !== incoming) {
    throw new FinanceTwinExtractionError(
      "contract_metadata_contract_conflict",
      `Contract-metadata CSV row ${lineNumber} conflicts with the earlier ${fieldLabel} for the same contract.`,
    );
  }

  return existing ?? incoming;
}

function mergeSourceFieldMap(
  existing: FinanceContractSourceFieldMap,
  incoming: FinanceContractSourceFieldMap,
): FinanceContractSourceFieldMap {
  return {
    agreementType: existing.agreementType ?? incoming.agreementType,
    amount: existing.amount ?? incoming.amount,
    asOfDate: existing.asOfDate ?? incoming.asOfDate,
    autoRenew: existing.autoRenew ?? incoming.autoRenew,
    contractIdentity: existing.contractIdentity ?? incoming.contractIdentity,
    contractType: existing.contractType ?? incoming.contractType,
    counterparty: existing.counterparty ?? incoming.counterparty,
    currencyCode: existing.currencyCode ?? incoming.currencyCode,
    effectiveDate: existing.effectiveDate ?? incoming.effectiveDate,
    endDate: existing.endDate ?? incoming.endDate,
    expirationDate: existing.expirationDate ?? incoming.expirationDate,
    nextPaymentDate: existing.nextPaymentDate ?? incoming.nextPaymentDate,
    noticeDeadline: existing.noticeDeadline ?? incoming.noticeDeadline,
    paymentAmount: existing.paymentAmount ?? incoming.paymentAmount,
    renewalDate: existing.renewalDate ?? incoming.renewalDate,
    startDate: existing.startDate ?? incoming.startDate,
    status: existing.status ?? incoming.status,
  };
}

function normalizeIdentityValue(value: string) {
  return value.trim().replace(/\s+/gu, " ").toLowerCase();
}

function readOptionalCell(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function parseIsoDate(value: string, header: string, lineNumber: number) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) {
    throw new FinanceTwinExtractionError(
      "contract_metadata_invalid_date",
      `Contract-metadata CSV row ${lineNumber} has an invalid ${header}: ${value}.`,
    );
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new FinanceTwinExtractionError(
      "contract_metadata_invalid_date",
      `Contract-metadata CSV row ${lineNumber} has an invalid ${header}: ${value}.`,
    );
  }

  return value;
}

function parseMoney(value: string, header: string, lineNumber: number) {
  if (!/^-?\d+(?:\.\d{1,2})?$/u.test(value)) {
    throw new FinanceTwinExtractionError(
      "contract_metadata_invalid_amount",
      `Contract-metadata CSV row ${lineNumber} has an invalid ${header}: ${value}.`,
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

function normalizeCurrency(value: string) {
  return value.trim().toUpperCase();
}

function parseBoolean(value: string, header: string, lineNumber: number) {
  const normalized = value.trim().toLowerCase();

  if (["true", "yes", "y", "1"].includes(normalized)) {
    return true;
  }

  if (["false", "no", "n", "0"].includes(normalized)) {
    return false;
  }

  throw new FinanceTwinExtractionError(
    "contract_metadata_invalid_boolean",
    `Contract-metadata CSV row ${lineNumber} has an invalid ${header}: ${value}.`,
  );
}
