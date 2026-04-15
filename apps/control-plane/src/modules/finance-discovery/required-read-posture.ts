import type { FinanceDiscoveryFreshnessState } from "@pocket-cto/domain";
import type { FinanceDiscoveryAnswerFormatterInput } from "./types";

export type FinanceDiscoveryRequiredReadPosture = {
  label: string;
  reasonSummary: string;
  state: FinanceDiscoveryFreshnessState;
};

export function collectRequiredReadPosture(
  input: FinanceDiscoveryAnswerFormatterInput,
): FinanceDiscoveryRequiredReadPosture[] {
  const seenReadKeys = new Set<string>();

  return input.relatedRoutes.flatMap((route) => {
    if (seenReadKeys.has(route.readKey)) {
      return [];
    }

    seenReadKeys.add(route.readKey);
    const twinRead = input.twinReads[route.readKey];

    if (!twinRead) {
      return [
        {
          label: route.label,
          reasonSummary: `No stored ${route.label.toLowerCase()} route result is available yet for ${input.question.companyKey}.`,
          state: "missing" as const,
        },
      ];
    }

    return [
      {
        label: route.label,
        reasonSummary: twinRead.freshness.reasonSummary,
        state: twinRead.freshness.state,
      },
    ];
  });
}

export function buildRequiredReadGapLimitations(
  input: FinanceDiscoveryAnswerFormatterInput,
) {
  return collectRequiredReadPosture(input)
    .filter((entry) => entry.state === "missing" || entry.state === "failed")
    .map((entry) =>
      entry.state === "missing"
        ? `Required Finance Twin read ${entry.label} is missing for ${input.question.companyKey}: ${entry.reasonSummary}`
        : `Required Finance Twin read ${entry.label} is in failed freshness posture for ${input.question.companyKey}: ${entry.reasonSummary}`,
    );
}
