import type {
  FinanceReceivablesAgingBucketKey,
  FinanceReceivablesAgingBucketValue,
} from "@pocket-cto/domain";

type ReceivablesAgingBucketDefinition = {
  bucketClass: FinanceReceivablesAgingBucketValue["bucketClass"];
};

export type ReceivablesAgingDetailBucketKey = Extract<
  FinanceReceivablesAgingBucketKey,
  "0_30" | "1_30" | "31_60" | "61_90" | "91_120" | "120_plus"
>;

export type ReceivablesAgingPartialRollupBucketKey = Extract<
  FinanceReceivablesAgingBucketKey,
  "over_90" | "over_120"
>;

export const RECEIVABLES_AGING_BUCKET_ORDER: FinanceReceivablesAgingBucketKey[] = [
  "current",
  "0_30",
  "1_30",
  "31_60",
  "61_90",
  "91_120",
  "120_plus",
  "over_90",
  "over_120",
  "past_due",
  "total",
];

export const RECEIVABLES_AGING_DETAIL_BUCKET_KEYS: ReceivablesAgingDetailBucketKey[] =
  ["0_30", "1_30", "31_60", "61_90", "91_120", "120_plus"];

export const RECEIVABLES_AGING_PARTIAL_ROLLUP_BUCKET_KEYS: ReceivablesAgingPartialRollupBucketKey[] =
  ["over_90", "over_120"];

const RECEIVABLES_AGING_BUCKET_DEFINITIONS: Record<
  FinanceReceivablesAgingBucketKey,
  ReceivablesAgingBucketDefinition
> = {
  current: {
    bucketClass: "current",
  },
  "0_30": {
    bucketClass: "past_due_detail",
  },
  "1_30": {
    bucketClass: "past_due_detail",
  },
  "31_60": {
    bucketClass: "past_due_detail",
  },
  "61_90": {
    bucketClass: "past_due_detail",
  },
  "91_120": {
    bucketClass: "past_due_detail",
  },
  "120_plus": {
    bucketClass: "past_due_detail",
  },
  over_90: {
    bucketClass: "past_due_partial_rollup",
  },
  over_120: {
    bucketClass: "past_due_partial_rollup",
  },
  past_due: {
    bucketClass: "past_due_total",
  },
  total: {
    bucketClass: "total",
  },
};

export function getReceivablesAgingBucketDefinition(
  bucketKey: FinanceReceivablesAgingBucketKey,
) {
  return RECEIVABLES_AGING_BUCKET_DEFINITIONS[bucketKey];
}

export function compareReceivablesAgingBucketKeys(
  left: FinanceReceivablesAgingBucketKey,
  right: FinanceReceivablesAgingBucketKey,
) {
  return (
    RECEIVABLES_AGING_BUCKET_ORDER.indexOf(left) -
    RECEIVABLES_AGING_BUCKET_ORDER.indexOf(right)
  );
}

export function sortReceivablesAgingBucketValues(
  bucketValues: FinanceReceivablesAgingBucketValue[],
) {
  return bucketValues.slice().sort((left, right) => {
    return (
      compareReceivablesAgingBucketKeys(left.bucketKey, right.bucketKey) ||
      left.sourceColumn.localeCompare(right.sourceColumn)
    );
  });
}

export function isReceivablesAgingDetailBucketKey(
  bucketKey: FinanceReceivablesAgingBucketKey,
): bucketKey is ReceivablesAgingDetailBucketKey {
  return RECEIVABLES_AGING_DETAIL_BUCKET_KEYS.includes(
    bucketKey as ReceivablesAgingDetailBucketKey,
  );
}

export function isReceivablesAgingPartialRollupBucketKey(
  bucketKey: FinanceReceivablesAgingBucketKey,
): bucketKey is ReceivablesAgingPartialRollupBucketKey {
  return RECEIVABLES_AGING_PARTIAL_ROLLUP_BUCKET_KEYS.includes(
    bucketKey as ReceivablesAgingPartialRollupBucketKey,
  );
}
