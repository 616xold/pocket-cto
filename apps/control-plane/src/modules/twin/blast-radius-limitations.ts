import type {
  TwinBlastRadiusImpactedDirectory,
  TwinBlastRadiusImpactedManifest,
  TwinBlastRadiusLimitation,
  TwinFreshnessSliceName,
  TwinRepositoryCiSummary,
  TwinRepositoryFreshnessView,
  TwinRepositoryOwnershipSummary,
} from "@pocket-cto/domain";

export function buildCiCoverageLimitations(input: {
  ciSummary: TwinRepositoryCiSummary;
  impactedManifests: TwinBlastRadiusImpactedManifest[];
}): TwinBlastRadiusLimitation[] {
  const limitations: TwinBlastRadiusLimitation[] = [];

  if (input.ciSummary.workflowState !== "workflows_available") {
    limitations.push({
      code: `workflow_state_${input.ciSummary.workflowState}`,
      summary:
        input.ciSummary.workflowState === "not_synced"
          ? "Stored workflow data has not been synced, so mapped CI job coverage may be incomplete."
          : "Stored workflow data reports no workflow files, so mapped CI job coverage is unavailable.",
      changedPaths: [],
      targetPaths: [],
      manifestPaths: [],
      jobKeys: [],
      reasonCodes: [],
      sliceNames: ["workflows"],
    });
  }

  if (input.ciSummary.testSuiteState !== "test_suites_available") {
    limitations.push({
      code: `test_suite_state_${input.ciSummary.testSuiteState}`,
      summary:
        input.ciSummary.testSuiteState === "not_synced"
          ? "Stored test-suite data has not been synced, so manifest-to-test coverage is unknown."
          : "Stored test-suite data reports no test suites, so manifest-to-test coverage is unavailable.",
      changedPaths: [],
      targetPaths: [],
      manifestPaths: [],
      jobKeys: [],
      reasonCodes: [],
      sliceNames: ["testSuites"],
    });
  }

  for (const manifest of input.impactedManifests) {
    if (manifest.relatedTestSuiteCount === 0) {
      limitations.push({
        code: "manifest_without_stored_test_suites",
        summary: `No stored test suites are linked to impacted manifest "${manifest.path}".`,
        changedPaths: manifest.matchedChangedPaths,
        targetPaths: [manifest.path],
        manifestPaths: [manifest.path],
        jobKeys: [],
        reasonCodes: [],
        sliceNames: ["testSuites"],
      });
      continue;
    }

    if (manifest.relatedMappedCiJobCount === 0) {
      limitations.push({
        code: "manifest_without_mapped_ci_jobs",
        summary: `No stored mapped CI jobs are linked to the impacted test suites for manifest "${manifest.path}".`,
        changedPaths: manifest.matchedChangedPaths,
        targetPaths: [manifest.path],
        manifestPaths: [manifest.path],
        jobKeys: [],
        reasonCodes: [],
        sliceNames: ["workflows", "testSuites"],
      });
    }
  }

  if (input.ciSummary.unmappedJobs.length > 0 && input.impactedManifests.length > 0) {
    limitations.push({
      code: "repo_has_unmapped_ci_jobs",
      summary: `The stored CI snapshot still has ${input.ciSummary.unmappedJobs.length} explicit unmapped job(s), so coverage remains conservative.`,
      changedPaths: [],
      targetPaths: [],
      manifestPaths: [],
      jobKeys: input.ciSummary.unmappedJobs.map((job) => job.jobKey).sort(),
      reasonCodes: [...new Set(input.ciSummary.unmappedJobs.map((job) => job.reasonCode))].sort(),
      sliceNames: ["workflows", "testSuites"],
    });
  }

  return limitations;
}

export function buildFreshnessLimitations(
  freshnessView: TwinRepositoryFreshnessView,
): TwinBlastRadiusLimitation[] {
  const limitations: TwinBlastRadiusLimitation[] = [];

  if (freshnessView.rollup.state !== "fresh") {
    limitations.push({
      code: `repository_freshness_${freshnessView.rollup.state}`,
      summary: freshnessView.rollup.reasonSummary,
      changedPaths: [],
      targetPaths: [],
      manifestPaths: [],
      jobKeys: [],
      reasonCodes: [],
      sliceNames: freshnessView.rollup.blockingSlices,
    });
  }

  for (const sliceName of ["metadata", "ownership", "workflows", "testSuites"] as const) {
    const slice = freshnessView.slices[sliceName];

    if (slice.state === "fresh") {
      continue;
    }

    limitations.push({
      code: `${sliceName}_freshness_${slice.state}`,
      summary: slice.reasonSummary,
      changedPaths: [],
      targetPaths: [],
      manifestPaths: [],
      jobKeys: [],
      reasonCodes: [],
      sliceNames: [sliceName satisfies TwinFreshnessSliceName],
    });
  }

  return limitations;
}

export function buildOwnershipLimitations(input: {
  impactedDirectories: TwinBlastRadiusImpactedDirectory[];
  impactedManifests: TwinBlastRadiusImpactedManifest[];
  ownershipSummary: TwinRepositoryOwnershipSummary;
}): TwinBlastRadiusLimitation[] {
  const impactedTargetPaths = [
    ...input.impactedDirectories.map((directory) => directory.path),
    ...input.impactedManifests.map((manifest) => manifest.path),
  ];

  if (impactedTargetPaths.length === 0) {
    return [];
  }

  if (input.ownershipSummary.ownershipState === "not_synced") {
    return [{
      code: "ownership_not_synced",
      summary: "Stored ownership data has not been synced, so impacted target owners are unknown.",
      changedPaths: [],
      targetPaths: impactedTargetPaths.sort(),
      manifestPaths: input.impactedManifests.map((manifest) => manifest.path).sort(),
      jobKeys: [],
      reasonCodes: [],
      sliceNames: ["ownership"],
    }];
  }

  const unownedTargets = [
    ...input.impactedDirectories
      .filter((directory) => directory.ownershipState === "unowned")
      .map((directory) => directory.path),
    ...input.impactedManifests
      .filter((manifest) => manifest.ownershipState === "unowned")
      .map((manifest) => manifest.path),
  ].sort();

  return unownedTargets.length === 0
    ? []
    : [{
        code:
          input.ownershipSummary.ownershipState === "no_codeowners_file"
            ? "no_codeowners_file"
            : "impacted_targets_unowned",
        summary:
          input.ownershipSummary.ownershipState === "no_codeowners_file"
            ? "The stored ownership snapshot found no CODEOWNERS file, so impacted targets remain explicitly unowned."
            : "Some impacted targets remain explicitly unowned in the stored ownership snapshot.",
        changedPaths: [],
        targetPaths: unownedTargets,
        manifestPaths: input.impactedManifests
          .filter((manifest) => manifest.ownershipState === "unowned")
          .map((manifest) => manifest.path)
          .sort(),
        jobKeys: [],
        reasonCodes: [],
        sliceNames: ["ownership"],
      }];
}

export function buildMatchingLimitations(input: {
  impactedDirectories: TwinBlastRadiusImpactedDirectory[];
  impactedManifests: TwinBlastRadiusImpactedManifest[];
  unmatchedPaths: string[];
}): TwinBlastRadiusLimitation[] {
  const limitations: TwinBlastRadiusLimitation[] = [];

  if (input.unmatchedPaths.length > 0) {
    limitations.push({
      code: "unmatched_changed_paths",
      summary: "Some changed paths do not map to any stored workspace directory or primary package manifest target.",
      changedPaths: input.unmatchedPaths,
      targetPaths: [],
      manifestPaths: [],
      jobKeys: [],
      reasonCodes: [],
      sliceNames: ["metadata"],
    });
  }

  if (input.impactedDirectories.length === 0 && input.impactedManifests.length === 0) {
    limitations.push({
      code: "no_stored_targets_matched",
      summary: "No stored blast-radius targets matched the changed paths.",
      changedPaths: input.unmatchedPaths,
      targetPaths: [],
      manifestPaths: [],
      jobKeys: [],
      reasonCodes: [],
      sliceNames: ["metadata"],
    });
  }

  return limitations;
}

export function buildAnswerSummary(input: {
  changedPathCount: number;
  impactedDirectoryCount: number;
  impactedManifestCount: number;
  limitationCount: number;
  relatedMappedCiJobCount: number;
  relatedTestSuiteCount: number;
  unmatchedPathCount: number;
}) {
  return `This stored auth_change query maps ${input.changedPathCount} changed path(s) to ${input.impactedDirectoryCount} workspace director${input.impactedDirectoryCount === 1 ? "y" : "ies"} and ${input.impactedManifestCount} primary manifest(s), with ${input.relatedTestSuiteCount} related test suite(s), ${input.relatedMappedCiJobCount} mapped CI job(s), ${input.unmatchedPathCount} unmatched path(s), and ${input.limitationCount} explicit limitation(s).`;
}
