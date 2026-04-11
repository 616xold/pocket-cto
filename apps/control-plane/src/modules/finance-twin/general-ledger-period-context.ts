import {
  FinanceGeneralLedgerPeriodContextViewSchema,
  FinanceGeneralLedgerSourceDeclaredPeriodSchema,
  type FinanceGeneralLedgerPeriodContextView,
  type FinanceGeneralLedgerSourceDeclaredPeriod,
  type FinanceGeneralLedgerSummary,
  type FinanceTwinSyncRunRecord,
} from "@pocket-cto/domain";
import { z } from "zod";

const GENERAL_LEDGER_PERIOD_CONTEXT_STATS_KEY = "generalLedgerPeriodContext";

const PersistedGeneralLedgerPeriodContextStatsSchema = z.object({
  sourceDeclaredPeriod: FinanceGeneralLedgerSourceDeclaredPeriodSchema.nullable(),
});

export function buildPersistedGeneralLedgerPeriodContextStats(input: {
  sourceDeclaredPeriod: FinanceGeneralLedgerSourceDeclaredPeriod | null;
}) {
  if (input.sourceDeclaredPeriod === null) {
    return {};
  }

  return {
    [GENERAL_LEDGER_PERIOD_CONTEXT_STATS_KEY]:
      PersistedGeneralLedgerPeriodContextStatsSchema.parse({
        sourceDeclaredPeriod: input.sourceDeclaredPeriod,
      }),
  };
}

export function buildFinanceGeneralLedgerPeriodContext(input: {
  latestSuccessfulRun: FinanceTwinSyncRunRecord | null;
  summary: FinanceGeneralLedgerSummary | null;
}): FinanceGeneralLedgerPeriodContextView {
  const sourceDeclaredPeriod =
    input.latestSuccessfulRun === null
      ? null
      : readSourceDeclaredPeriodFromStats(input.latestSuccessfulRun.stats);
  const activityWindowEarliestEntryDate =
    input.summary?.earliestEntryDate ?? null;
  const activityWindowLatestEntryDate = input.summary?.latestEntryDate ?? null;

  if (sourceDeclaredPeriod !== null) {
    return FinanceGeneralLedgerPeriodContextViewSchema.parse({
      basis: "source_declared_period",
      sourceDeclaredPeriod,
      activityWindowEarliestEntryDate,
      activityWindowLatestEntryDate,
      reasonCode: buildSourceDeclaredReasonCode(sourceDeclaredPeriod),
      reasonSummary: buildSourceDeclaredReasonSummary(sourceDeclaredPeriod),
    });
  }

  if (
    activityWindowEarliestEntryDate !== null &&
    activityWindowLatestEntryDate !== null
  ) {
    return FinanceGeneralLedgerPeriodContextViewSchema.parse({
      basis: "activity_window_only",
      sourceDeclaredPeriod: null,
      activityWindowEarliestEntryDate,
      activityWindowLatestEntryDate,
      reasonCode: "activity_window_only",
      reasonSummary:
        "The latest successful general-ledger slice does not carry explicit source-declared reporting-period fields, so only the observed journal activity window is available.",
    });
  }

  return FinanceGeneralLedgerPeriodContextViewSchema.parse({
    basis: "missing_context",
    sourceDeclaredPeriod: null,
    activityWindowEarliestEntryDate: null,
    activityWindowLatestEntryDate: null,
    reasonCode:
      input.latestSuccessfulRun === null
        ? "missing_general_ledger_slice"
        : "missing_general_ledger_window",
    reasonSummary:
      input.latestSuccessfulRun === null
        ? "No successful general-ledger slice exists yet, so period context is unavailable."
        : "The latest successful general-ledger slice does not yet expose source-declared period context or an activity window.",
  });
}

function readSourceDeclaredPeriodFromStats(
  stats: Record<string, unknown>,
): FinanceGeneralLedgerSourceDeclaredPeriod | null {
  const parsed = PersistedGeneralLedgerPeriodContextStatsSchema.safeParse(
    stats[GENERAL_LEDGER_PERIOD_CONTEXT_STATS_KEY],
  );

  return parsed.success ? parsed.data.sourceDeclaredPeriod ?? null : null;
}

function buildSourceDeclaredReasonCode(
  sourceDeclaredPeriod: FinanceGeneralLedgerSourceDeclaredPeriod,
) {
  switch (sourceDeclaredPeriod.contextKind) {
    case "period_window":
      return "source_declared_period_window";
    case "period_end_only":
      return "source_declared_period_end_only";
    case "as_of":
      return "source_declared_as_of";
    case "period_key_only":
      return "source_declared_period_key_only";
  }
}

function buildSourceDeclaredReasonSummary(
  sourceDeclaredPeriod: FinanceGeneralLedgerSourceDeclaredPeriod,
) {
  switch (sourceDeclaredPeriod.contextKind) {
    case "period_window":
      return "The latest successful general-ledger slice includes explicit source-declared period start and period end fields.";
    case "period_end_only":
      return "The latest successful general-ledger slice includes an explicit source-declared period end, but not a full source-declared reporting window.";
    case "as_of":
      return "The latest successful general-ledger slice includes an explicit source-declared as-of date, but not a full source-declared reporting window.";
    case "period_key_only":
      return "The latest successful general-ledger slice includes an explicit source-declared period key, but not enough source-declared dates to form a reporting window.";
  }
}
