import type {
  TwinBlastRadiusImpactedDirectory,
  TwinBlastRadiusImpactedManifest,
  TwinBlastRadiusOwnershipState,
  TwinBlastRadiusRelatedMappedCiJob,
  TwinBlastRadiusRelatedTestSuite,
  TwinBlastRadiusTargetOwners,
  TwinOwnershipAppliedRule,
  TwinRepositoryBlastRadiusQuery,
  TwinRepositoryBlastRadiusQueryResult,
  TwinRepositoryCiSummary,
  TwinRepositoryFreshnessView,
  TwinRepositoryMetadataSummary,
  TwinRepositoryOwnershipSummary,
} from "@pocket-cto/domain";
import {
  buildAnswerSummary,
  buildCiCoverageLimitations,
  buildFreshnessLimitations,
  buildMatchingLimitations,
  buildOwnershipLimitations,
} from "./blast-radius-limitations";
import {
  collectDirectoryMatches,
  collectPrimaryManifestMatches,
  normalizeChangedPaths,
} from "./blast-radius-paths";

type OwnershipDetails = {
  appliedRule: TwinOwnershipAppliedRule | null;
  effectiveOwners: string[];
  ownershipState: TwinBlastRadiusOwnershipState;
};

export function buildTwinRepositoryBlastRadiusQueryResult(input: {
  ciSummary: TwinRepositoryCiSummary;
  freshnessView: TwinRepositoryFreshnessView;
  metadataSummary: TwinRepositoryMetadataSummary;
  ownershipSummary: TwinRepositoryOwnershipSummary;
  query: TwinRepositoryBlastRadiusQuery;
}): TwinRepositoryBlastRadiusQueryResult {
  const changedPaths = normalizeChangedPaths(input.query.changedPaths);
  const impactedDirectories = collectDirectoryMatches(
    changedPaths,
    input.metadataSummary.metadata.directories,
  ).map((directory) => ({
    ...directory,
    ...resolveDirectoryOwnership(input.ownershipSummary, directory.path),
  }));
  const impactedManifests = collectPrimaryManifestMatches(
    changedPaths,
    input.metadataSummary.metadata.manifests,
  ).map((manifest) => {
    const relatedTestSuites = input.ciSummary.testSuites.filter(
      (suite) => suite.manifestPath === manifest.path,
    );

    return {
      ...manifest,
      ...resolveManifestOwnership(input.ownershipSummary, manifest.path),
      relatedTestSuiteCount: relatedTestSuites.length,
      relatedMappedCiJobCount: new Set(
        relatedTestSuites.flatMap((suite) =>
          suite.matchedJobs.map((job) => job.jobStableKey),
        ),
      ).size,
    } satisfies TwinBlastRadiusImpactedManifest;
  });
  const unmatchedPaths = changedPaths.filter((changedPath) => {
    return (
      !impactedDirectories.some((directory) =>
        directory.matchedChangedPaths.includes(changedPath),
      ) &&
      !impactedManifests.some((manifest) =>
        manifest.matchedChangedPaths.includes(changedPath),
      )
    );
  });
  const relatedTestSuites = buildRelatedTestSuites(
    impactedManifests,
    input.ciSummary,
  );
  const relatedMappedCiJobs = aggregateMappedJobs(relatedTestSuites);
  const ciCoverageLimitations = buildCiCoverageLimitations({
    ciSummary: input.ciSummary,
    impactedManifests,
  });
  const limitations = [
    ...buildFreshnessLimitations(input.freshnessView),
    ...buildOwnershipLimitations({
      impactedDirectories,
      impactedManifests,
      ownershipSummary: input.ownershipSummary,
    }),
    ...buildMatchingLimitations({
      impactedDirectories,
      impactedManifests,
      unmatchedPaths,
    }),
    ...ciCoverageLimitations,
  ];

  return {
    repository: input.metadataSummary.repository,
    queryEcho: {
      questionKind: input.query.questionKind,
      changedPaths,
    },
    unmatchedPaths,
    impactedDirectories,
    impactedManifests,
    ownersByTarget: buildOwnersByTarget(impactedDirectories, impactedManifests),
    relatedTestSuites,
    relatedMappedCiJobs,
    ciCoverageLimitations,
    freshness: {
      rollup: input.freshnessView.rollup,
      slices: input.freshnessView.slices,
    },
    limitations,
    answerSummary: buildAnswerSummary({
      changedPathCount: changedPaths.length,
      impactedDirectoryCount: impactedDirectories.length,
      impactedManifestCount: impactedManifests.length,
      limitationCount: limitations.length,
      relatedMappedCiJobCount: relatedMappedCiJobs.length,
      relatedTestSuiteCount: relatedTestSuites.length,
      unmatchedPathCount: unmatchedPaths.length,
    }),
  };
}

function resolveDirectoryOwnership(
  ownershipSummary: TwinRepositoryOwnershipSummary,
  directoryPath: string,
): OwnershipDetails {
  if (ownershipSummary.ownershipState === "not_synced") {
    return unknownOwnership();
  }

  const owned = ownershipSummary.ownedDirectories.find(
    (directory) => directory.path === directoryPath,
  );

  return owned
    ? {
        ownershipState: "owned",
        effectiveOwners: owned.effectiveOwners,
        appliedRule: owned.appliedRule,
      }
    : unownedOwnership();
}

function resolveManifestOwnership(
  ownershipSummary: TwinRepositoryOwnershipSummary,
  manifestPath: string,
): OwnershipDetails {
  if (ownershipSummary.ownershipState === "not_synced") {
    return unknownOwnership();
  }

  const owned = ownershipSummary.ownedManifests.find(
    (manifest) => manifest.path === manifestPath,
  );

  return owned
    ? {
        ownershipState: "owned",
        effectiveOwners: owned.effectiveOwners,
        appliedRule: owned.appliedRule,
      }
    : unownedOwnership();
}

function buildOwnersByTarget(
  directories: TwinBlastRadiusImpactedDirectory[],
  manifests: TwinBlastRadiusImpactedManifest[],
): TwinBlastRadiusTargetOwners[] {
  return [
    ...directories.map<TwinBlastRadiusTargetOwners>((directory) => ({
      targetKind: "workspace_directory",
      targetPath: directory.path,
      ownershipState: directory.ownershipState,
      effectiveOwners: directory.effectiveOwners,
      appliedRule: directory.appliedRule,
    })),
    ...manifests.map<TwinBlastRadiusTargetOwners>((manifest) => ({
      targetKind: "package_manifest",
      targetPath: manifest.path,
      ownershipState: manifest.ownershipState,
      effectiveOwners: manifest.effectiveOwners,
      appliedRule: manifest.appliedRule,
    })),
  ];
}

function buildRelatedTestSuites(
  impactedManifests: TwinBlastRadiusImpactedManifest[],
  ciSummary: TwinRepositoryCiSummary,
): TwinBlastRadiusRelatedTestSuite[] {
  return impactedManifests.flatMap((manifest) =>
    ciSummary.testSuites
      .filter((suite) => suite.manifestPath === manifest.path)
      .map<TwinBlastRadiusRelatedTestSuite>((suite) => ({
        ...suite,
        impactedByChangedPaths: manifest.matchedChangedPaths,
      })),
  );
}

function aggregateMappedJobs(
  suites: TwinBlastRadiusRelatedTestSuite[],
): TwinBlastRadiusRelatedMappedCiJob[] {
  const jobs = new Map<
    string,
    TwinBlastRadiusRelatedMappedCiJob & {
      manifestPathSet: Set<string>;
      scriptKeySet: Set<string>;
    }
  >();

  for (const suite of suites) {
    for (const job of suite.matchedJobs) {
      const existing = jobs.get(job.jobStableKey) ?? {
        ...job,
        manifestPaths: [],
        scriptKeys: [],
        manifestPathSet: new Set<string>(),
        scriptKeySet: new Set<string>(),
      };
      existing.manifestPathSet.add(suite.manifestPath);
      existing.scriptKeySet.add(suite.scriptKey);
      existing.manifestPaths = [...existing.manifestPathSet].sort();
      existing.scriptKeys = [...existing.scriptKeySet].sort();
      jobs.set(job.jobStableKey, existing);
    }
  }

  return [...jobs.values()]
    .map(({ manifestPathSet: _manifestPathSet, scriptKeySet: _scriptKeySet, ...job }) => job)
    .sort((left, right) => left.jobStableKey.localeCompare(right.jobStableKey));
}

function unknownOwnership(): OwnershipDetails {
  return {
    ownershipState: "unknown",
    effectiveOwners: [],
    appliedRule: null,
  };
}

function unownedOwnership(): OwnershipDetails {
  return {
    ownershipState: "unowned",
    effectiveOwners: [],
    appliedRule: null,
  };
}
