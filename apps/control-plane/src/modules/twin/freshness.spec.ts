import { describe, expect, it } from "vitest";
import {
  buildTwinFreshnessRollupForEntries,
  buildTwinFreshnessSlice,
} from "./freshness";

describe("twin freshness", () => {
  it("keeps never-synced slices explicit when no successful snapshot exists", () => {
    const freshness = buildTwinFreshnessSlice({
      slice: "metadata",
      latestRun: null,
      latestSuccessfulRun: null,
      now: new Date("2026-03-19T22:45:00.000Z"),
    });

    expect(freshness).toMatchObject({
      state: "never_synced",
      scorePercent: 0,
      latestRunId: null,
      latestRunStatus: null,
      ageSeconds: null,
      staleAfterSeconds: 21_600,
      reasonCode: "not_synced",
    });
  });

  it("crosses from fresh to stale deterministically from the latest successful run age", () => {
    const freshRun = createRun({
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      extractor: "repository_metadata",
      completedAt: "2026-03-19T17:00:00.000Z",
      status: "succeeded",
    });
    const staleRun = createRun({
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      extractor: "repository_metadata",
      completedAt: "2026-03-19T15:00:00.000Z",
      status: "succeeded",
    });

    expect(
      buildTwinFreshnessSlice({
        slice: "metadata",
        latestRun: freshRun,
        latestSuccessfulRun: freshRun,
        now: new Date("2026-03-19T22:45:00.000Z"),
      }),
    ).toMatchObject({
      state: "fresh",
      scorePercent: 100,
      ageSeconds: 20_700,
      reasonCode: "latest_successful_sync_fresh",
    });
    expect(
      buildTwinFreshnessSlice({
        slice: "metadata",
        latestRun: staleRun,
        latestSuccessfulRun: staleRun,
        now: new Date("2026-03-19T22:45:00.000Z"),
      }),
    ).toMatchObject({
      state: "stale",
      scorePercent: 50,
      ageSeconds: 27_900,
      reasonCode: "latest_successful_sync_stale",
    });
  });

  it("makes the latest failed run explicit while still carrying the last successful age", () => {
    const latestSuccessfulRun = createRun({
      id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      extractor: "repository_docs",
      completedAt: "2026-03-19T10:00:00.000Z",
      status: "succeeded",
    });
    const latestFailedRun = createRun({
      id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      extractor: "repository_docs",
      completedAt: "2026-03-19T22:00:00.000Z",
      startedAt: "2026-03-19T21:55:00.000Z",
      status: "failed",
    });

    const freshness = buildTwinFreshnessSlice({
      slice: "docs",
      latestRun: latestFailedRun,
      latestSuccessfulRun,
      now: new Date("2026-03-19T22:45:00.000Z"),
    });

    expect(freshness).toMatchObject({
      state: "failed",
      latestRunId: latestFailedRun.id,
      latestRunStatus: "failed",
      latestSuccessfulRunId: latestSuccessfulRun.id,
      ageSeconds: 45_900,
      reasonCode: "latest_run_failed",
    });
  });

  it("keeps the repository rollup conservative", () => {
    const staleMetadata = buildTwinFreshnessSlice({
      slice: "metadata",
      latestRun: createRun({
        id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
        extractor: "repository_metadata",
        completedAt: "2026-03-19T10:00:00.000Z",
        status: "succeeded",
      }),
      latestSuccessfulRun: createRun({
        id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
        extractor: "repository_metadata",
        completedAt: "2026-03-19T10:00:00.000Z",
        status: "succeeded",
      }),
      now: new Date("2026-03-19T22:45:00.000Z"),
    });
    const freshWorkflows = buildTwinFreshnessSlice({
      slice: "workflows",
      latestRun: createRun({
        id: "ffffffff-ffff-4fff-8fff-ffffffffffff",
        extractor: "repository_workflows",
        completedAt: "2026-03-19T21:00:00.000Z",
        status: "succeeded",
      }),
      latestSuccessfulRun: createRun({
        id: "ffffffff-ffff-4fff-8fff-ffffffffffff",
        extractor: "repository_workflows",
        completedAt: "2026-03-19T21:00:00.000Z",
        status: "succeeded",
      }),
      now: new Date("2026-03-19T22:45:00.000Z"),
    });

    const staleRollup = buildTwinFreshnessRollupForEntries([
      {
        sliceName: "metadata",
        slice: staleMetadata,
      },
      {
        sliceName: "workflows",
        slice: freshWorkflows,
      },
    ]);

    expect(staleRollup).toMatchObject({
      state: "stale",
      scorePercent: 50,
      staleSliceCount: 1,
      blockingSlices: ["metadata"],
      reasonCode: "rollup_stale",
    });

    const failedRollup = buildTwinFreshnessRollupForEntries([
      {
        sliceName: "metadata",
        slice: staleMetadata,
      },
      {
        sliceName: "docs",
        slice: buildTwinFreshnessSlice({
          slice: "docs",
          latestRun: createRun({
            id: "99999999-9999-4999-8999-999999999999",
            extractor: "repository_docs",
            completedAt: "2026-03-19T22:30:00.000Z",
            status: "failed",
          }),
          latestSuccessfulRun: null,
          now: new Date("2026-03-19T22:45:00.000Z"),
        }),
      },
    ]);

    expect(failedRollup).toMatchObject({
      state: "failed",
      scorePercent: 0,
      failedSliceCount: 1,
      blockingSlices: ["metadata", "docs"],
      reasonCode: "rollup_failed",
    });
  });
});

function createRun(input: {
  completedAt: string | null;
  extractor: string;
  id: string;
  startedAt?: string;
  status: "failed" | "running" | "succeeded";
}) {
  return {
    id: input.id,
    repoFullName: "616xold/pocket-cto",
    extractor: input.extractor,
    status: input.status,
    startedAt: input.startedAt ?? "2026-03-19T09:55:00.000Z",
    completedAt: input.completedAt,
    stats: {},
    errorSummary: input.status === "failed" ? "sync failed" : null,
    createdAt: input.startedAt ?? "2026-03-19T09:55:00.000Z",
  } as const;
}
