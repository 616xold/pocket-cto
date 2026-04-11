import {
  FinanceSliceAlignmentViewSchema,
  type FinanceSliceAlignmentView,
  type FinanceTwinSourceRef,
} from "@pocket-cto/domain";

export function buildFinanceSliceAlignment(input: {
  latestSources: Array<FinanceTwinSourceRef | null>;
  implementedSliceCount: number;
  subjectLabel: string;
  viewLabel: string;
}): FinanceSliceAlignmentView {
  const availableSources = input.latestSources.filter(
    (source): source is FinanceTwinSourceRef => source !== null,
  );
  const distinctSourceIds = new Set(
    availableSources.map((source) => source.sourceId),
  );
  const distinctSyncRunIds = new Set(
    availableSources.map((source) => source.syncRunId),
  );
  const distinctSourceSnapshotIds = new Set(
    availableSources.map((source) => source.sourceSnapshotId),
  );
  const sameSource = availableSources.length > 0 && distinctSourceIds.size === 1;
  const sameSyncRun = availableSources.length > 0 && distinctSyncRunIds.size === 1;
  const sameSourceSnapshot =
    availableSources.length > 0 && distinctSourceSnapshotIds.size === 1;
  const sharedSourceId = sameSource ? (availableSources[0]?.sourceId ?? null) : null;
  const sharedSyncRunId = sameSyncRun
    ? (availableSources[0]?.syncRunId ?? null)
    : null;
  const sharedSourceSnapshotId = sameSourceSnapshot
    ? (availableSources[0]?.sourceSnapshotId ?? null)
    : null;
  const availableSliceCount = availableSources.length;

  if (availableSliceCount === 0) {
    return FinanceSliceAlignmentViewSchema.parse({
      state: "empty",
      implementedSliceCount: input.implementedSliceCount,
      availableSliceCount,
      distinctSourceCount: 0,
      distinctSyncRunCount: 0,
      distinctSourceSnapshotCount: 0,
      sameSource: false,
      sameSyncRun: false,
      sameSourceSnapshot: false,
      sharedSourceId: null,
      sharedSyncRunId: null,
      sharedSourceSnapshotId: null,
      reasonCode: "no_successful_slices",
      reasonSummary: `No successful ${input.subjectLabel} exist yet for this company.`,
    });
  }

  if (availableSliceCount < input.implementedSliceCount) {
    return FinanceSliceAlignmentViewSchema.parse({
      state: "partial",
      implementedSliceCount: input.implementedSliceCount,
      availableSliceCount,
      distinctSourceCount: distinctSourceIds.size,
      distinctSyncRunCount: distinctSyncRunIds.size,
      distinctSourceSnapshotCount: distinctSourceSnapshotIds.size,
      sameSource,
      sameSyncRun,
      sameSourceSnapshot,
      sharedSourceId,
      sharedSyncRunId,
      sharedSourceSnapshotId,
      reasonCode: "missing_successful_slice",
      reasonSummary: `The ${input.viewLabel} is partial because one or more implemented ${input.subjectLabel} do not have a successful sync yet.`,
    });
  }

  if (sameSource) {
    return FinanceSliceAlignmentViewSchema.parse({
      state: "shared_source",
      implementedSliceCount: input.implementedSliceCount,
      availableSliceCount,
      distinctSourceCount: distinctSourceIds.size,
      distinctSyncRunCount: distinctSyncRunIds.size,
      distinctSourceSnapshotCount: distinctSourceSnapshotIds.size,
      sameSource,
      sameSyncRun,
      sameSourceSnapshot,
      sharedSourceId,
      sharedSyncRunId,
      sharedSourceSnapshotId,
      reasonCode: "shared_source",
      reasonSummary: buildSharedSourceSummary({
        sameSourceSnapshot,
        sameSyncRun,
        subjectLabel: input.subjectLabel,
      }),
    });
  }

  return FinanceSliceAlignmentViewSchema.parse({
    state: "mixed",
    implementedSliceCount: input.implementedSliceCount,
    availableSliceCount,
    distinctSourceCount: distinctSourceIds.size,
    distinctSyncRunCount: distinctSyncRunIds.size,
    distinctSourceSnapshotCount: distinctSourceSnapshotIds.size,
    sameSource,
    sameSyncRun,
    sameSourceSnapshot,
    sharedSourceId,
    sharedSyncRunId,
    sharedSourceSnapshotId,
    reasonCode: "mixed_sources",
    reasonSummary: `The latest successful ${input.subjectLabel} are mixed across different registered sources.`,
  });
}

function buildSharedSourceSummary(input: {
  sameSourceSnapshot: boolean;
  sameSyncRun: boolean;
  subjectLabel: string;
}) {
  if (input.sameSourceSnapshot && input.sameSyncRun) {
    return `The latest successful ${input.subjectLabel} share one registered source, one source snapshot, and one sync run.`;
  }

  if (input.sameSourceSnapshot) {
    return `The latest successful ${input.subjectLabel} share one registered source and one source snapshot, but span different sync runs.`;
  }

  if (input.sameSyncRun) {
    return `The latest successful ${input.subjectLabel} share one registered source and one sync run, but span different source snapshots.`;
  }

  return `The latest successful ${input.subjectLabel} share one registered source, but span different uploaded file snapshots and sync runs. Under the current per-file upload flow, sameSourceSnapshot and sameSyncRun are diagnostic fields rather than expected positive comparison signals.`;
}
