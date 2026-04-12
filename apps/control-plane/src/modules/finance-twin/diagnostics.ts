import type { FinanceSliceAlignmentView } from "@pocket-cto/domain";

export function buildSharedSourceDiagnostics(
  sliceAlignment: FinanceSliceAlignmentView,
) {
  if (
    sliceAlignment.state === "shared_source" &&
    (!sliceAlignment.sameSourceSnapshot || !sliceAlignment.sameSyncRun)
  ) {
    return [sliceAlignment.reasonSummary];
  }

  return [];
}

export function dedupeMessages(messages: string[]) {
  return Array.from(new Set(messages));
}
