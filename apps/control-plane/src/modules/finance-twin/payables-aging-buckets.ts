import type {
  FinancePayablesAgingBucketKey,
  FinancePayablesAgingBucketValue,
} from "@pocket-cto/domain";

type PayablesAgingBucketDefinition = {
  bucketClass: FinancePayablesAgingBucketValue["bucketClass"];
};

export type PayablesAgingDetailBucketKey = Extract<
  FinancePayablesAgingBucketKey,
  "0_30" | "1_30" | "31_60" | "61_90" | "91_120" | "120_plus"
>;

export type PayablesAgingPartialRollupBucketKey = Extract<
  FinancePayablesAgingBucketKey,
  "over_90" | "over_120"
>;

export const PAYABLES_AGING_BUCKET_ORDER: FinancePayablesAgingBucketKey[] = [
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

export const PAYABLES_AGING_DETAIL_BUCKET_KEYS: PayablesAgingDetailBucketKey[] =
  ["0_30", "1_30", "31_60", "61_90", "91_120", "120_plus"];

export const PAYABLES_AGING_PARTIAL_ROLLUP_BUCKET_KEYS: PayablesAgingPartialRollupBucketKey[] =
  ["over_90", "over_120"];

const PAYABLES_AGING_BUCKET_DEFINITIONS: Record<
  FinancePayablesAgingBucketKey,
  PayablesAgingBucketDefinition
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

export function getPayablesAgingBucketDefinition(
  bucketKey: FinancePayablesAgingBucketKey,
) {
  return PAYABLES_AGING_BUCKET_DEFINITIONS[bucketKey];
}

export function comparePayablesAgingBucketKeys(
  left: FinancePayablesAgingBucketKey,
  right: FinancePayablesAgingBucketKey,
) {
  return (
    PAYABLES_AGING_BUCKET_ORDER.indexOf(left) -
    PAYABLES_AGING_BUCKET_ORDER.indexOf(right)
  );
}

export function sortPayablesAgingBucketValues(
  bucketValues: FinancePayablesAgingBucketValue[],
) {
  return bucketValues.slice().sort((left, right) => {
    return (
      comparePayablesAgingBucketKeys(left.bucketKey, right.bucketKey) ||
      left.sourceColumn.localeCompare(right.sourceColumn)
    );
  });
}

export function isPayablesAgingDetailBucketKey(
  bucketKey: FinancePayablesAgingBucketKey,
): bucketKey is PayablesAgingDetailBucketKey {
  return PAYABLES_AGING_DETAIL_BUCKET_KEYS.includes(
    bucketKey as PayablesAgingDetailBucketKey,
  );
}

export function isPayablesAgingPartialRollupBucketKey(
  bucketKey: FinancePayablesAgingBucketKey,
): bucketKey is PayablesAgingPartialRollupBucketKey {
  return PAYABLES_AGING_PARTIAL_ROLLUP_BUCKET_KEYS.includes(
    bucketKey as PayablesAgingPartialRollupBucketKey,
  );
}
