import { describe, expect, it } from "vitest";
import type {
  TwinRepositoryCiSummary,
  TwinRepositoryFreshnessView,
  TwinFreshnessSlice,
  TwinRepositoryMetadataSummary,
  TwinRepositoryOwnershipSummary,
  TwinRepositorySummary,
  TwinSyncRun,
} from "@pocket-cto/domain";
import { buildTwinRepositoryBlastRadiusQueryResult } from "./blast-radius-query";

const repository = {
  fullName: "616xold/pocket-cto",
  installationId: "12345",
  defaultBranch: "main",
  archived: false,
  disabled: false,
  isActive: true,
  writeReadiness: {
    ready: true,
    failureCode: null,
  },
} satisfies TwinRepositorySummary;

const successfulRun = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  repoFullName: repository.fullName,
  extractor: "repository_metadata",
  status: "succeeded",
  startedAt: "2026-03-20T00:00:00.000Z",
  completedAt: "2026-03-20T00:01:00.000Z",
  stats: {},
  errorSummary: null,
  createdAt: "2026-03-20T00:00:00.000Z",
} satisfies TwinSyncRun;

describe("buildTwinRepositoryBlastRadiusQueryResult", () => {
  it("maps paths conservatively, uses nearest manifests, and keeps unmatched paths explicit", () => {
    const result = buildTwinRepositoryBlastRadiusQueryResult({
      query: {
        questionKind: "auth_change",
        changedPaths: [
          "apps/web/lib/auth.ts",
          "packages/domain/src/twin.ts",
          "scripts/unknown.ts",
        ],
      },
      metadataSummary: createMetadataSummary(),
      ownershipSummary: createOwnershipSummary(),
      ciSummary: createCiSummary(),
      freshnessView: createFreshnessView(),
    });

    expect(result.queryEcho.changedPaths).toEqual([
      "apps/web/lib/auth.ts",
      "packages/domain/src/twin.ts",
      "scripts/unknown.ts",
    ]);
    expect(result.unmatchedPaths).toEqual(["scripts/unknown.ts"]);
    expect(result.impactedDirectories).toEqual([
      expect.objectContaining({
        path: "apps",
        matchedChangedPaths: ["apps/web/lib/auth.ts"],
        ownershipState: "owned",
        effectiveOwners: ["@platform"],
      }),
      expect.objectContaining({
        path: "packages",
        matchedChangedPaths: ["packages/domain/src/twin.ts"],
        ownershipState: "unowned",
        effectiveOwners: [],
      }),
    ]);
    expect(result.impactedManifests).toEqual([
      expect.objectContaining({
        path: "apps/web/package.json",
        matchedChangedPaths: ["apps/web/lib/auth.ts"],
        ownershipState: "owned",
        effectiveOwners: ["@web-team"],
        relatedTestSuiteCount: 1,
        relatedMappedCiJobCount: 1,
      }),
      expect.objectContaining({
        path: "packages/domain/package.json",
        matchedChangedPaths: ["packages/domain/src/twin.ts"],
        ownershipState: "unowned",
        effectiveOwners: [],
        relatedTestSuiteCount: 1,
        relatedMappedCiJobCount: 0,
      }),
    ]);
    expect(result.relatedTestSuites).toEqual([
      expect.objectContaining({
        manifestPath: "apps/web/package.json",
        scriptKey: "test:auth",
        impactedByChangedPaths: ["apps/web/lib/auth.ts"],
      }),
      expect.objectContaining({
        manifestPath: "packages/domain/package.json",
        scriptKey: "test",
        impactedByChangedPaths: ["packages/domain/src/twin.ts"],
      }),
    ]);
    expect(result.relatedMappedCiJobs).toEqual([
      expect.objectContaining({
        jobKey: "web-auth",
        manifestPaths: ["apps/web/package.json"],
        scriptKeys: ["test:auth"],
      }),
    ]);
    expect(result.ciCoverageLimitations).toEqual([
      expect.objectContaining({
        code: "manifest_without_mapped_ci_jobs",
        manifestPaths: ["packages/domain/package.json"],
      }),
      expect.objectContaining({
        code: "repo_has_unmapped_ci_jobs",
        jobKeys: ["opaque"],
        reasonCodes: ["no_test_invocation"],
      }),
    ]);
  });

  it("surfaces owners only when effective ownership exists", () => {
    const result = buildTwinRepositoryBlastRadiusQueryResult({
      query: {
        questionKind: "auth_change",
        changedPaths: ["apps/web/lib/auth.ts"],
      },
      metadataSummary: createMetadataSummary(),
      ownershipSummary: {
        ...createOwnershipSummary(),
        ownershipState: "not_synced",
        ownedDirectories: [],
        ownedManifests: [],
        unownedDirectories: [],
        unownedManifests: [],
      },
      ciSummary: createCiSummary(),
      freshnessView: createFreshnessView(),
    });

    expect(result.impactedDirectories[0]).toMatchObject({
      path: "apps",
      ownershipState: "unknown",
      effectiveOwners: [],
      appliedRule: null,
    });
    expect(result.impactedManifests[0]).toMatchObject({
      path: "apps/web/package.json",
      ownershipState: "unknown",
      effectiveOwners: [],
      appliedRule: null,
    });
    expect(result.limitations).toContainEqual(
      expect.objectContaining({
        code: "ownership_not_synced",
      }),
    );
  });

  it("makes stale or failed freshness explicit in limitations", () => {
    const failedFreshnessView = createFreshnessView({
      metadataState: "failed",
      metadataReasonSummary:
        "Latest repository metadata sync failed before any successful snapshot was stored.",
      rollupState: "failed",
      rollupReasonSummary:
        "Latest failed twin syncs block freshness for: metadata.",
      blockingSlices: ["metadata"],
    });

    const result = buildTwinRepositoryBlastRadiusQueryResult({
      query: {
        questionKind: "auth_change",
        changedPaths: ["apps/web/lib/auth.ts"],
      },
      metadataSummary: createMetadataSummary(),
      ownershipSummary: createOwnershipSummary(),
      ciSummary: createCiSummary(),
      freshnessView: failedFreshnessView,
    });

    expect(result.limitations).toContainEqual(
      expect.objectContaining({
        code: "repository_freshness_failed",
        sliceNames: ["metadata"],
      }),
    );
    expect(result.limitations).toContainEqual(
      expect.objectContaining({
        code: "metadata_freshness_failed",
      }),
    );
  });
});

function createMetadataSummary(): TwinRepositoryMetadataSummary {
  return {
    repository,
    latestRun: successfulRun,
    freshness: createFreshnessSummary(),
    entityCount: 4,
    edgeCount: 2,
    entityCountsByKind: {
      package_manifest: 2,
      workspace_directory: 2,
    },
    edgeCountsByKind: {
      repository_contains_manifest: 2,
      repository_contains_directory: 2,
    },
    metadata: {
      repository: {
        fullName: repository.fullName,
        defaultBranch: "main",
        visibility: "private",
        archived: false,
        disabled: false,
        isActive: true,
      },
      defaultBranch: {
        name: "main",
      },
      rootReadme: null,
      manifests: [
        {
          path: "apps/web/package.json",
          packageName: "@web/app",
          private: true,
          hasWorkspaces: false,
          scriptNames: ["test:auth"],
        },
        {
          path: "packages/domain/package.json",
          packageName: "@domain/core",
          private: false,
          hasWorkspaces: false,
          scriptNames: ["test"],
        },
      ],
      directories: [
        {
          path: "apps",
          label: "Apps",
          classification: "application_group",
        },
        {
          path: "packages",
          label: "Packages",
          classification: "package_group",
        },
      ],
    },
  };
}

function createOwnershipSummary(): TwinRepositoryOwnershipSummary {
  return {
    repository,
    latestRun: {
      ...successfulRun,
      extractor: "repository_ownership",
    },
    freshness: createFreshnessSummary(),
    ownershipState: "effective_ownership_available",
    codeownersFile: {
      path: ".github/CODEOWNERS",
      precedenceSlot: "github_dotgithub",
      lineCount: 2,
      sizeBytes: 20,
      ruleCount: 2,
      ownerCount: 2,
    },
    counts: {
      ruleCount: 2,
      ownerCount: 2,
      directoryCount: 2,
      manifestCount: 2,
      ownedDirectoryCount: 1,
      ownedManifestCount: 1,
      unownedDirectoryCount: 1,
      unownedManifestCount: 1,
    },
    ownedDirectories: [
      {
        path: "apps",
        label: "Apps",
        classification: "application_group",
        effectiveOwners: ["@platform"],
        appliedRule: {
          sourceFilePath: ".github/CODEOWNERS",
          ordinal: 1,
          rawPattern: "apps/",
          patternShape: "directory_like",
        },
      },
    ],
    ownedManifests: [
      {
        path: "apps/web/package.json",
        packageName: "@web/app",
        private: true,
        hasWorkspaces: false,
        scriptNames: ["test:auth"],
        effectiveOwners: ["@web-team"],
        appliedRule: {
          sourceFilePath: ".github/CODEOWNERS",
          ordinal: 2,
          rawPattern: "apps/web/",
          patternShape: "directory_like",
        },
      },
    ],
    unownedDirectories: [
      {
        path: "packages",
        label: "Packages",
        classification: "package_group",
      },
    ],
    unownedManifests: [
      {
        path: "packages/domain/package.json",
        packageName: "@domain/core",
        private: false,
        hasWorkspaces: false,
        scriptNames: ["test"],
      },
    ],
  };
}

function createCiSummary(): TwinRepositoryCiSummary {
  return {
    repository,
    latestWorkflowRun: {
      ...successfulRun,
      extractor: "repository_workflows",
    },
    latestTestSuiteRun: {
      ...successfulRun,
      extractor: "repository_test_suites",
    },
    freshness: createFreshnessSummary(),
    workflowState: "workflows_available",
    testSuiteState: "test_suites_available",
    counts: {
      workflowFileCount: 1,
      workflowCount: 1,
      jobCount: 2,
      testSuiteCount: 2,
      mappedJobCount: 1,
      unmappedJobCount: 1,
    },
    testSuites: [
      {
        stableKey: "apps/web/package.json#script:test:auth",
        manifestPath: "apps/web/package.json",
        packageName: "@web/app",
        scriptKey: "test:auth",
        matchedJobs: [
          {
            jobStableKey: ".github/workflows/ci.yml#job:web-auth",
            workflowStableKey: ".github/workflows/ci.yml#workflow:CI",
            workflowName: "CI",
            workflowFilePath: ".github/workflows/ci.yml",
            jobKey: "web-auth",
            jobName: "Web auth",
          },
        ],
      },
      {
        stableKey: "packages/domain/package.json#script:test",
        manifestPath: "packages/domain/package.json",
        packageName: "@domain/core",
        scriptKey: "test",
        matchedJobs: [],
      },
    ],
    unmappedJobs: [
      {
        jobStableKey: ".github/workflows/ci.yml#job:opaque",
        workflowStableKey: ".github/workflows/ci.yml#workflow:CI",
        workflowName: "CI",
        workflowFilePath: ".github/workflows/ci.yml",
        jobKey: "opaque",
        jobName: null,
        reasonCode: "no_test_invocation",
        reasonSummary:
          "No run command clearly invokes a stored manifest test script.",
        runCommands: ["pnpm ci:integration-db"],
      },
    ],
  };
}

function createFreshnessView(input?: {
  blockingSlices?: Array<
    "metadata" | "ownership" | "workflows" | "testSuites" | "docs" | "runbooks"
  >;
  metadataReasonSummary?: string;
  metadataState?: "failed" | "fresh" | "never_synced" | "stale";
  rollupReasonSummary?: string;
  rollupState?: "failed" | "fresh" | "never_synced" | "stale";
}): TwinRepositoryFreshnessView {
  const metadataState = input?.metadataState ?? "fresh";
  const rollupState = input?.rollupState ?? "fresh";

  return {
    repository,
    rollup: {
      state: rollupState,
      scorePercent: rollupState === "fresh" ? 100 : 0,
      latestRunStatus: metadataState === "failed" ? "failed" : "succeeded",
      ageSeconds: 120,
      staleAfterSeconds: 21_600,
      reasonCode: rollupState === "fresh" ? "rollup_fresh" : "rollup_failed",
      reasonSummary:
        input?.rollupReasonSummary ??
        "All scored twin slices are within their freshness windows.",
      freshSliceCount: 6,
      staleSliceCount: 0,
      failedSliceCount: rollupState === "failed" ? 1 : 0,
      neverSyncedSliceCount: 0,
      blockingSlices: input?.blockingSlices ?? [],
    },
    slices: {
      metadata: createFreshnessSlice(
        metadataState,
        input?.metadataReasonSummary ??
          "Latest successful repository metadata sync is within the 6 hour freshness window.",
      ),
      ownership: createFreshnessSlice(
        "fresh",
        "Latest successful ownership sync is within the 12 hour freshness window.",
      ),
      workflows: createFreshnessSlice(
        "fresh",
        "Latest successful workflows sync is within the 12 hour freshness window.",
      ),
      testSuites: createFreshnessSlice(
        "fresh",
        "Latest successful test suites sync is within the 12 hour freshness window.",
      ),
      docs: createFreshnessSlice(
        "fresh",
        "Latest successful docs sync is within the 24 hour freshness window.",
      ),
      runbooks: createFreshnessSlice(
        "fresh",
        "Latest successful runbooks sync is within the 24 hour freshness window.",
      ),
    },
  };
}

function createFreshnessSlice(
  state: "failed" | "fresh" | "never_synced" | "stale",
  reasonSummary: string,
): TwinFreshnessSlice {
  return {
    state,
    scorePercent: state === "fresh" ? 100 : state === "stale" ? 50 : 0,
    latestRunId: successfulRun.id,
    latestRunStatus: state === "failed" ? ("failed" as const) : ("succeeded" as const),
    latestCompletedAt: successfulRun.completedAt,
    latestSuccessfulRunId: state === "failed" ? null : successfulRun.id,
    latestSuccessfulCompletedAt:
      state === "failed" ? null : successfulRun.completedAt,
    ageSeconds: state === "never_synced" ? null : 120,
    staleAfterSeconds: 21_600,
    reasonCode:
      state === "fresh"
        ? "latest_successful_sync_fresh"
        : state === "stale"
          ? "latest_successful_sync_stale"
          : state === "failed"
            ? "latest_run_failed"
            : "not_synced",
    reasonSummary,
  };
}

function createFreshnessSummary() {
  return {
    state: "fresh" as const,
    scorePercent: 100,
    latestRunStatus: "succeeded" as const,
    ageSeconds: 120,
    staleAfterSeconds: 21_600,
    reasonCode: "latest_successful_sync_fresh",
    reasonSummary:
      "Latest successful repository metadata sync is within the 6 hour freshness window.",
  };
}
