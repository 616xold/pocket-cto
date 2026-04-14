import type { CfoWikiPageKey } from "@pocket-cto/domain";
import type { PersistCfoWikiPageRefInput } from "../repository";
import type { WikiCompileState, WikiRegistryEntry, WikiSliceState } from "./page-registry";
import { buildSourceDigestPageRefs } from "./source-digest-refs";

export function buildWikiPageRefs(input: {
  registry: WikiRegistryEntry[];
  state: WikiCompileState;
}) {
  const refs: PersistCfoWikiPageRefInput[] = [];

  for (const entry of input.registry) {
    refs.push(buildCompanyRef(entry.pageKey, input.state));

    if (entry.pageKey === "index" || entry.pageKey === "log") {
      refs.push(...buildSharedSliceRefs(entry.pageKey, input.state.slices));
    }

    if (entry.period) {
      refs.push(...buildSharedSliceRefs(entry.pageKey, input.state.slices));
      refs.push({
        pageKey: entry.pageKey,
        refKind: "twin_fact",
        targetKind: "reporting_period",
        targetId: entry.period.id,
        label: `Reporting period ${entry.period.label}`,
        locator: entry.period.periodKey,
        excerpt: `Period key ${entry.period.periodKey}; ends ${entry.period.periodEnd}.`,
        notes: entry.period.periodStart
          ? `Period starts ${entry.period.periodStart} and ends ${entry.period.periodEnd}.`
          : `Period end ${entry.period.periodEnd}; no stored start date.`,
      });

      refs.push(
        ...input.state.slices.flatMap((slice) =>
          buildPeriodSpecificRefs(entry.pageKey, entry.period!.id, slice),
        ),
      );
      continue;
    }

    if (entry.conceptDefinition) {
      const relevantSlices = input.state.slices.filter((slice) =>
        entry.conceptDefinition?.extractorKeys.includes(
          slice.descriptor.extractorKey,
        ),
      );

      refs.push(...buildDefinitionSliceRefs(entry.pageKey, relevantSlices));

      if (entry.conceptDefinition.includeAllPolicyPages) {
        refs.push(
          ...input.state.compiledDocumentSources.flatMap((documentSource) =>
            buildCurrentPolicySourceRefs(entry.pageKey, documentSource),
          ),
        );
      }

      continue;
    }

    if (entry.metricDefinition) {
      const relevantSlices = input.state.slices.filter((slice) =>
        entry.metricDefinition?.extractorKeys.includes(
          slice.descriptor.extractorKey,
        ),
      );

      refs.push(...buildDefinitionSliceRefs(entry.pageKey, relevantSlices));
      refs.push(
        ...relevantSlices.flatMap((slice) =>
          buildSourceCoverageRefs(entry.pageKey, slice),
        ),
      );
      continue;
    }

    if (entry.pageKey === "company/overview") {
      refs.push(...buildSharedSliceRefs(entry.pageKey, input.state.slices));
      refs.push(
        ...input.state.reportingPeriods.map((period) => ({
          pageKey: entry.pageKey,
          refKind: "twin_fact" as const,
          targetKind: "reporting_period" as const,
          targetId: period.id,
          label: `Stored reporting period ${period.label}`,
          locator: period.periodKey,
          excerpt: `Reporting period ${period.periodKey} ends ${period.periodEnd}.`,
          notes: period.periodStart
            ? `Stored period window ${period.periodStart} to ${period.periodEnd}.`
            : `Stored period end ${period.periodEnd} without an explicit start date.`,
        })),
      );
    }

    if (entry.pageKey === "sources/coverage") {
      refs.push(...buildSharedSliceRefs(entry.pageKey, input.state.slices));
      refs.push(
        ...input.state.slices.flatMap((slice) => buildSourceCoverageRefs(entry.pageKey, slice)),
      );
    }

    if (
      (entry.pageKind === "source_digest" || entry.pageKind === "policy") &&
      entry.documentSource &&
      entry.documentSnapshot
    ) {
      refs.push(
        ...buildSourceDigestPageRefs(
          entry.pageKey,
          entry.documentSource,
          entry.documentSnapshot,
        ),
      );
    }
  }

  return dedupeRefs(refs);
}

function buildCompanyRef(pageKey: CfoWikiPageKey, state: WikiCompileState) {
  return {
    pageKey,
    refKind: "twin_fact" as const,
    targetKind: "company" as const,
    targetId: state.company.id,
    label: `${state.company.displayName} company record`,
    locator: state.company.companyKey,
    excerpt: `Company key ${state.company.companyKey}.`,
    notes: `Stored company record ${state.company.displayName} anchors this compiler-owned wiki.`,
  };
}

function buildSharedSliceRefs(
  pageKey: CfoWikiPageKey,
  slices: WikiCompileState["slices"],
) {
  return slices.map((slice) => buildSliceCoverageRef(pageKey, slice));
}

function buildSliceCoverageRef(
  pageKey: CfoWikiPageKey,
  slice: WikiSliceState,
): PersistCfoWikiPageRefInput {
  if (slice.latestSuccessfulRun) {
    return {
      pageKey,
      refKind: "compiled_inference",
      targetKind: "finance_slice",
      targetId: slice.descriptor.sliceKey,
      label: `${slice.descriptor.label} coverage is available`,
      locator: slice.descriptor.extractorKey,
      excerpt: `${slice.freshness.state} coverage from sync run ${slice.latestSuccessfulRun.id}.`,
      notes: slice.reportingPeriod
        ? `Latest successful ${slice.descriptor.pageLabel} sync maps to reporting period ${slice.reportingPeriod.periodKey}.`
        : `Latest successful ${slice.descriptor.pageLabel} sync is linked without a stored reporting period.`,
    };
  }

  if (slice.latestAttemptedRun) {
    return {
      pageKey,
      refKind: "ambiguous",
      targetKind: "finance_slice",
      targetId: slice.descriptor.sliceKey,
      label: `${slice.descriptor.label} has no successful stored coverage`,
      locator: slice.descriptor.extractorKey,
      excerpt: `Latest attempted sync status is ${slice.latestAttemptedRun.status}.`,
      notes:
        slice.latestAttemptedRun.errorSummary ??
        `The CFO Wiki compiler exposes the missing ${slice.descriptor.pageLabel} coverage instead of synthesizing a replacement.`,
    };
  }

  return {
    pageKey,
    refKind: "ambiguous",
    targetKind: "finance_slice",
    targetId: slice.descriptor.sliceKey,
    label: `${slice.descriptor.label} has no recorded sync coverage`,
    locator: slice.descriptor.extractorKey,
    excerpt: "No sync attempt is stored for this finance slice.",
    notes:
      "The CFO Wiki compiler surfaces a visible gap when no source-linked Finance Twin slice has been recorded yet.",
  };
}

function buildSourceCoverageRefs(
  pageKey: CfoWikiPageKey,
  slice: WikiSliceState,
) {
  const refs: PersistCfoWikiPageRefInput[] = [];

  if (slice.latestSuccessfulSource) {
    refs.push(
      buildSourceFileRef(pageKey, "source_excerpt", slice, "latest successful"),
      buildSourceSnapshotRef(
        pageKey,
        "source_excerpt",
        slice,
        "latest successful",
      ),
    );
  }

  if (
    slice.latestAttemptedSource &&
    slice.latestAttemptedSource.sourceFile.id !==
      slice.latestSuccessfulSource?.sourceFile.id
  ) {
    refs.push(
      buildSourceFileRef(pageKey, "ambiguous", slice, "latest attempted"),
      buildSourceSnapshotRef(pageKey, "ambiguous", slice, "latest attempted"),
    );
  }

  return refs;
}

function buildDefinitionSliceRefs(
  pageKey: CfoWikiPageKey,
  slices: WikiSliceState[],
) {
  return slices.map((slice) => buildSliceCoverageRef(pageKey, slice));
}

function buildCurrentPolicySourceRefs(
  pageKey: CfoWikiPageKey,
  documentSource: WikiCompileState["compiledDocumentSources"][number],
) {
  if (documentSource.binding.documentRole !== "policy_document") {
    return [] as PersistCfoWikiPageRefInput[];
  }

  const latestSnapshot = documentSource.snapshots[0];

  if (!latestSnapshot) {
    return [] as PersistCfoWikiPageRefInput[];
  }

  return buildSourceDigestPageRefs(pageKey, documentSource, latestSnapshot);
}

function buildPeriodSpecificRefs(
  pageKey: CfoWikiPageKey,
  reportingPeriodId: string,
  slice: WikiSliceState,
) {
  if (slice.reportingPeriod?.id !== reportingPeriodId) {
    return [] as PersistCfoWikiPageRefInput[];
  }

  const refs = [buildSliceCoverageRef(pageKey, slice)];

  if (slice.latestSuccessfulSource) {
    refs.push(
      buildSourceFileRef(pageKey, "source_excerpt", slice, "period-linked"),
    );
  }

  return refs;
}

function buildSourceFileRef(
  pageKey: CfoWikiPageKey,
  refKind: PersistCfoWikiPageRefInput["refKind"],
  slice: WikiSliceState,
  sourceLabel: string,
): PersistCfoWikiPageRefInput {
  const source = slice.latestSuccessfulSource ?? slice.latestAttemptedSource;

  if (!source) {
    throw new Error("Missing source inventory record for source ref rendering");
  }

  return {
    pageKey,
    refKind,
    targetKind: "source_file",
    targetId: source.sourceFile.id,
    label: `${slice.descriptor.label} ${sourceLabel} source file`,
    locator: source.sourceFile.originalFileName,
    excerpt: `Registered raw file ${source.sourceFile.originalFileName} captured ${source.sourceFile.capturedAt}.`,
    notes:
      "This compiler-owned ref uses stored source inventory metadata only here; it does not parse the document body.",
  };
}

function buildSourceSnapshotRef(
  pageKey: CfoWikiPageKey,
  refKind: PersistCfoWikiPageRefInput["refKind"],
  slice: WikiSliceState,
  sourceLabel: string,
): PersistCfoWikiPageRefInput {
  const source = slice.latestSuccessfulSource ?? slice.latestAttemptedSource;

  if (!source) {
    throw new Error("Missing source inventory record for source ref rendering");
  }

  return {
    pageKey,
    refKind,
    targetKind: "source_snapshot",
    targetId: source.snapshot.id,
    label: `${slice.descriptor.label} ${sourceLabel} source snapshot`,
    locator: `version ${source.snapshot.version}`,
    excerpt: `Snapshot version ${source.snapshot.version} captured ${source.snapshot.capturedAt}.`,
    notes: `Snapshot checksum ${truncateChecksum(
      source.snapshot.checksumSha256,
    )}; storage kind ${source.snapshot.storageKind}.`,
  };
}

function dedupeRefs(refs: PersistCfoWikiPageRefInput[]) {
  const seen = new Set<string>();

  return refs.filter((ref) => {
    const key = [
      ref.pageKey,
      ref.refKind,
      ref.targetKind,
      ref.targetId,
      ref.label,
      ref.locator ?? "",
    ].join("::");

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function truncateChecksum(checksum: string) {
  return checksum.length <= 16 ? checksum : `${checksum.slice(0, 16)}...`;
}
