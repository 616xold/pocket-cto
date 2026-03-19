import { describe, expect, it } from "vitest";
import {
  matchJobsToTestSuites,
  type DerivedTestSuite,
  type StoredWorkflowJobForTestSuites,
} from "./test-suite-matcher";

describe("test suite matcher unmapped-job reasons", () => {
  it("keeps jobs without clear test invocations unmapped with a no_test_invocation reason", () => {
    const result = matchJobsToTestSuites({
      jobs: [
        createJob("opaque", [
          {
            kind: "run",
            name: null,
            value: "pnpm ci:integration-db",
          },
        ]),
      ],
      suites: [createSuite("package.json", "test")],
    });

    expect(result.matches).toHaveLength(0);
    expect(result.unmappedJobs).toEqual([
      expect.objectContaining({
        key: "opaque",
        reasonCode: "no_test_invocation",
        reasonSummary:
          "No run command clearly invokes a stored manifest test script.",
      }),
    ]);
  });

  it("keeps direct test-runner commands unmapped with an unsupported_invocation_shape reason", () => {
    const result = matchJobsToTestSuites({
      jobs: [
        createJob("vitest-direct", [
          {
            kind: "run",
            name: null,
            value: "pnpm exec vitest run",
          },
        ]),
      ],
      suites: [createSuite("package.json", "test")],
    });

    expect(result.matches).toHaveLength(0);
    expect(result.unmappedJobs).toEqual([
      expect.objectContaining({
        key: "vitest-direct",
        reasonCode: "unsupported_invocation_shape",
        reasonSummary:
          'Found test-oriented command "pnpm exec vitest run", but it does not use a supported package-manager script invocation shape.',
      }),
    ]);
  });

  it("keeps ambiguous deterministic invocations unmapped with an ambiguous_test_invocation reason", () => {
    const result = matchJobsToTestSuites({
      jobs: [
        createJob("ambiguous", [
          {
            kind: "run",
            name: null,
            value: "pnpm --filter @pocket-cto/web test",
          },
        ]),
      ],
      suites: [
        createSuite("apps/web/package.json", "test", "@pocket-cto/web"),
        createSuite("packages/web/package.json", "test", "@pocket-cto/web"),
      ],
    });

    expect(result.matches).toHaveLength(0);
    expect(result.unmappedJobs).toEqual([
      expect.objectContaining({
        key: "ambiguous",
        reasonCode: "ambiguous_test_invocation",
        reasonSummary:
          'Command "pnpm --filter @pocket-cto/web test" matched more than one stored test suite for script "test".',
      }),
    ]);
  });

  it("keeps supported invocations without a known suite unmapped with a test_invocation_without_known_suite reason", () => {
    const result = matchJobsToTestSuites({
      jobs: [
        createJob("missing-suite", [
          {
            kind: "run",
            name: null,
            value: "pnpm test:integration",
          },
        ]),
      ],
      suites: [createSuite("package.json", "test")],
    });

    expect(result.matches).toHaveLength(0);
    expect(result.unmappedJobs).toEqual([
      expect.objectContaining({
        key: "missing-suite",
        reasonCode: "test_invocation_without_known_suite",
        reasonSummary:
          'Command "pnpm test:integration" invokes script "test:integration" through a supported shape, but no stored test suite matches it.',
      }),
    ]);
  });
});

function createSuite(
  manifestPath: string,
  scriptKey: string,
  packageName: string | null = null,
): DerivedTestSuite {
  return {
    manifestEntityId: `${manifestPath}#entity`,
    manifestPath,
    manifestStableKey: manifestPath,
    packageName,
    scriptKey,
    stableKey: `${manifestPath}#script:${scriptKey}`,
  };
}

function createJob(
  key: string,
  steps: StoredWorkflowJobForTestSuites["steps"],
): StoredWorkflowJobForTestSuites {
  return {
    entityId: `${key}-entity`,
    key,
    name: null,
    sourceFilePath: ".github/workflows/ci.yml",
    stableKey: `.github/workflows/ci.yml#job:${key}`,
    steps,
    workflowStableKey: ".github/workflows/ci.yml#workflow:CI",
  };
}
