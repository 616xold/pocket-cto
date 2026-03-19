import type { TwinCiUnmappedJobReasonCode } from "@pocket-cto/domain";
import { posix } from "node:path";

export type StoredManifestForTestSuites = {
  entityId: string;
  packageName: string | null;
  path: string;
  scriptNames: string[];
  stableKey: string;
};

export type StoredWorkflowJobForTestSuites = {
  entityId: string;
  key: string;
  name: string | null;
  sourceFilePath: string;
  stableKey: string;
  steps: Array<{
    kind: "run" | "uses";
    name: string | null;
    value: string;
  }>;
  workflowStableKey: string;
};

export type DerivedTestSuite = {
  manifestEntityId: string;
  manifestPath: string;
  manifestStableKey: string;
  packageName: string | null;
  scriptKey: string;
  stableKey: string;
};

export type MatchedTestSuiteJob = {
  jobEntityId: string;
  jobStableKey: string;
  manifestPath: string;
  matchedBy: "manifest_dir" | "package_filter" | "root_script";
  matchedCommand: string;
  scriptKey: string;
  suiteStableKey: string;
};

export type ExplainedUnmappedTestSuiteJob = StoredWorkflowJobForTestSuites & {
  reasonCode: TwinCiUnmappedJobReasonCode;
  reasonSummary: string;
};

type ScriptInvocation =
  | {
      kind: "manifest_dir";
      manifestDir: string;
      rawCommand: string;
      scriptKey: string;
    }
  | {
      kind: "package_filter";
      packageName: string;
      rawCommand: string;
      scriptKey: string;
    }
  | {
      kind: "root_script";
      rawCommand: string;
      scriptKey: string;
    };

type InvocationResolution =
  | {
      status: "matched";
      suite: DerivedTestSuite;
    }
  | {
      status: "ambiguous";
    }
  | {
      status: "missing_suite";
    };

type UnmappedReasonCandidate = {
  priority: number;
  reasonCode: TwinCiUnmappedJobReasonCode;
  reasonSummary: string;
};

export function buildTestSuiteStableKey(
  manifestPath: string,
  scriptKey: string,
) {
  return `${manifestPath}#script:${scriptKey}`;
}

export function deriveTestSuites(
  manifests: StoredManifestForTestSuites[],
): DerivedTestSuite[] {
  return manifests
    .flatMap((manifest) =>
      manifest.scriptNames
        .filter(isDeterministicTestScriptKey)
        .map<DerivedTestSuite>((scriptKey) => ({
          manifestEntityId: manifest.entityId,
          manifestPath: manifest.path,
          manifestStableKey: manifest.stableKey,
          packageName: manifest.packageName,
          scriptKey,
          stableKey: buildTestSuiteStableKey(manifest.path, scriptKey),
        })),
    )
    .sort((left, right) => {
      return (
        left.manifestPath.localeCompare(right.manifestPath) ||
        left.scriptKey.localeCompare(right.scriptKey)
      );
    });
}

export function matchJobsToTestSuites(input: {
  jobs: StoredWorkflowJobForTestSuites[];
  suites: DerivedTestSuite[];
}) {
  const indexes = buildSuiteIndexes(input.suites);
  const matchesByScope = new Map<string, MatchedTestSuiteJob>();
  const unmappedJobs: ExplainedUnmappedTestSuiteJob[] = [];

  for (const job of sortJobs(input.jobs)) {
    let matched = false;
    let reason: UnmappedReasonCandidate | null = null;

    for (const step of job.steps) {
      if (step.kind !== "run") {
        continue;
      }

      for (const segment of splitCommandSegments(step.value)) {
        const invocations = extractScriptInvocationsFromSegment(segment);

        if (invocations.length === 0) {
          if (isUnsupportedTestInvocationShape(segment)) {
            reason = chooseHigherPriorityReason(
              reason,
              buildUnsupportedInvocationReason(segment),
            );
          }
          continue;
        }

        for (const invocation of invocations) {
          const resolution = resolveSuiteFromInvocation(invocation, indexes);

          if (resolution.status === "matched") {
            const match = {
              jobEntityId: job.entityId,
              jobStableKey: job.stableKey,
              manifestPath: resolution.suite.manifestPath,
              matchedBy: invocation.kind,
              matchedCommand: normalizeWhitespace(invocation.rawCommand),
              scriptKey: resolution.suite.scriptKey,
              suiteStableKey: resolution.suite.stableKey,
            } satisfies MatchedTestSuiteJob;
            matchesByScope.set(
              `${job.entityId}::${resolution.suite.stableKey}`,
              match,
            );
            matched = true;
            continue;
          }

          reason = chooseHigherPriorityReason(
            reason,
            resolution.status === "ambiguous"
              ? buildAmbiguousInvocationReason(invocation)
              : buildMissingSuiteReason(invocation),
          );
        }
      }
    }

    if (!matched) {
      unmappedJobs.push({
        ...job,
        ...(reason ?? buildNoTestInvocationReason()),
      });
    }
  }

  return {
    matches: [...matchesByScope.values()].sort((left, right) => {
      return (
        left.suiteStableKey.localeCompare(right.suiteStableKey) ||
        left.jobStableKey.localeCompare(right.jobStableKey)
      );
    }),
    unmappedJobs,
  };
}

export function explainUnmappedJobs(input: {
  jobs: StoredWorkflowJobForTestSuites[];
  suites: DerivedTestSuite[];
}) {
  const indexes = buildSuiteIndexes(input.suites);

  return sortJobs(input.jobs).map((job) => explainUnmappedJob(job, indexes));
}

function buildSuiteIndexes(suites: DerivedTestSuite[]) {
  const rootSuites = new Map<string, DerivedTestSuite>();
  const suitesByPackageName = new Map<string, DerivedTestSuite[]>();
  const suitesByManifestDir = new Map<string, DerivedTestSuite[]>();

  for (const suite of suites) {
    if (suite.manifestPath === "package.json") {
      rootSuites.set(suite.scriptKey, suite);
    }

    if (suite.packageName) {
      const packageKey = `${suite.packageName}::${suite.scriptKey}`;
      suitesByPackageName.set(packageKey, [
        ...(suitesByPackageName.get(packageKey) ?? []),
        suite,
      ]);
    }

    const manifestDir = normalizeManifestDir(posix.dirname(suite.manifestPath));
    const dirKey = `${manifestDir}::${suite.scriptKey}`;
    suitesByManifestDir.set(dirKey, [
      ...(suitesByManifestDir.get(dirKey) ?? []),
      suite,
    ]);
  }

  return {
    rootSuites,
    suitesByManifestDir,
    suitesByPackageName,
  };
}

function resolveSuiteFromInvocation(
  invocation: ScriptInvocation,
  indexes: ReturnType<typeof buildSuiteIndexes>,
): InvocationResolution {
  if (invocation.kind === "root_script") {
    const suite = indexes.rootSuites.get(invocation.scriptKey) ?? null;
    return suite === null
      ? {
          status: "missing_suite",
        }
      : {
          status: "matched",
          suite,
        };
  }

  if (invocation.kind === "package_filter") {
    return resolveSuiteCandidates(
      indexes.suitesByPackageName.get(
        `${invocation.packageName}::${invocation.scriptKey}`,
      ) ?? [],
    );
  }

  return resolveSuiteCandidates(
    indexes.suitesByManifestDir.get(
      `${invocation.manifestDir}::${invocation.scriptKey}`,
    ) ?? [],
  );
}

function resolveSuiteCandidates(
  suites: DerivedTestSuite[],
): InvocationResolution {
  if (suites.length === 1) {
    return {
      status: "matched",
      suite: suites[0]!,
    };
  }

  if (suites.length === 0) {
    return {
      status: "missing_suite",
    };
  }

  return {
    status: "ambiguous",
  };
}

function extractScriptInvocationsFromSegment(
  segment: string,
): ScriptInvocation[] {
  const invocations: ScriptInvocation[] = [];

  const filterMatch = segment.match(
    /^pnpm\s+(?:--filter|-F)(?:=|\s+)(?<filter>"[^"]+"|'[^']+'|\S+)\s+(?:(?:run|run-script)\s+)?(?<script>test(?::[A-Za-z0-9:_-]+)?)\b/u,
  );

  if (filterMatch?.groups?.filter && filterMatch.groups.script) {
    invocations.push({
      kind: "package_filter",
      packageName: unquote(filterMatch.groups.filter),
      rawCommand: segment,
      scriptKey: filterMatch.groups.script,
    });
    return invocations;
  }

  const dirMatch = segment.match(
    /^pnpm\s+(?:-C|--dir)(?:=|\s+)(?<dir>"[^"]+"|'[^']+'|\S+)\s+(?:(?:run|run-script)\s+)?(?<script>test(?::[A-Za-z0-9:_-]+)?)\b/u,
  );

  if (dirMatch?.groups?.dir && dirMatch.groups.script) {
    invocations.push({
      kind: "manifest_dir",
      manifestDir: normalizeManifestDir(unquote(dirMatch.groups.dir)),
      rawCommand: segment,
      scriptKey: dirMatch.groups.script,
    });
    return invocations;
  }

  const pnpmLikeRootMatch = segment.match(
    /^(?<pm>pnpm|npm|bun)\s+(?:(?:run|run-script)\s+)?(?<script>test(?::[A-Za-z0-9:_-]+)?)\b/u,
  );

  if (pnpmLikeRootMatch?.groups?.script) {
    invocations.push({
      kind: "root_script",
      rawCommand: segment,
      scriptKey: pnpmLikeRootMatch.groups.script,
    });
    return invocations;
  }

  const yarnRootMatch = segment.match(
    /^yarn\s+(?<script>test(?::[A-Za-z0-9:_-]+)?)\b/u,
  );

  if (yarnRootMatch?.groups?.script) {
    invocations.push({
      kind: "root_script",
      rawCommand: segment,
      scriptKey: yarnRootMatch.groups.script,
    });
  }

  return invocations;
}

function explainUnmappedJob(
  job: StoredWorkflowJobForTestSuites,
  indexes: ReturnType<typeof buildSuiteIndexes>,
): ExplainedUnmappedTestSuiteJob {
  let reason: UnmappedReasonCandidate | null = null;

  for (const step of job.steps) {
    if (step.kind !== "run") {
      continue;
    }

    for (const segment of splitCommandSegments(step.value)) {
      const invocations = extractScriptInvocationsFromSegment(segment);

      if (invocations.length === 0) {
        if (isUnsupportedTestInvocationShape(segment)) {
          reason = chooseHigherPriorityReason(
            reason,
            buildUnsupportedInvocationReason(segment),
          );
        }
        continue;
      }

      for (const invocation of invocations) {
        const resolution = resolveSuiteFromInvocation(invocation, indexes);

        if (resolution.status === "matched") {
          continue;
        }

        reason = chooseHigherPriorityReason(
          reason,
          resolution.status === "ambiguous"
            ? buildAmbiguousInvocationReason(invocation)
            : buildMissingSuiteReason(invocation),
        );
      }
    }
  }

  return {
    ...job,
    ...(reason ?? buildNoTestInvocationReason()),
  };
}

function chooseHigherPriorityReason(
  current: UnmappedReasonCandidate | null,
  next: UnmappedReasonCandidate,
) {
  if (current === null || next.priority > current.priority) {
    return next;
  }

  return current;
}

function buildNoTestInvocationReason(): UnmappedReasonCandidate {
  return {
    priority: 1,
    reasonCode: "no_test_invocation",
    reasonSummary:
      "No run command clearly invokes a stored manifest test script.",
  };
}

function buildUnsupportedInvocationReason(
  segment: string,
): UnmappedReasonCandidate {
  const command = summarizeCommand(segment);

  return {
    priority: 2,
    reasonCode: "unsupported_invocation_shape",
    reasonSummary: `Found test-oriented command "${command}", but it does not use a supported package-manager script invocation shape.`,
  };
}

function buildMissingSuiteReason(
  invocation: ScriptInvocation,
): UnmappedReasonCandidate {
  return {
    priority: 3,
    reasonCode: "test_invocation_without_known_suite",
    reasonSummary: `Command "${summarizeCommand(invocation.rawCommand)}" invokes script "${invocation.scriptKey}" through a supported shape, but no stored test suite matches it.`,
  };
}

function buildAmbiguousInvocationReason(
  invocation: ScriptInvocation,
): UnmappedReasonCandidate {
  return {
    priority: 4,
    reasonCode: "ambiguous_test_invocation",
    reasonSummary: `Command "${summarizeCommand(invocation.rawCommand)}" matched more than one stored test suite for script "${invocation.scriptKey}".`,
  };
}

function isUnsupportedTestInvocationShape(segment: string) {
  const normalized = normalizeWhitespace(segment);

  return unsupportedTestInvocationPatterns.some((pattern) =>
    pattern.test(normalized),
  );
}

function summarizeCommand(command: string) {
  const normalized = normalizeWhitespace(command);
  return normalized.length > 140
    ? `${normalized.slice(0, 137).trimEnd()}...`
    : normalized;
}

const unsupportedTestInvocationPatterns = [
  /^(?:pnpm|npm|yarn|bun)\s+.+\btest(?::[A-Za-z0-9:_-]+)?\b/u,
  /^(?:(?:pnpm|npm|yarn|bun)\s+(?:exec|dlx)\s+)?vitest\b/u,
  /^(?:(?:pnpm|npm|yarn|bun)\s+(?:exec|dlx)\s+|npx\s+)?jest\b/u,
  /^(?:(?:pnpm|npm|yarn|bun)\s+(?:exec|dlx)\s+)?playwright\s+test\b/u,
  /^(?:(?:pnpm|npm|yarn|bun)\s+(?:exec|dlx)\s+)?cypress\s+(?:run|open)\b/u,
  /^(?:(?:pnpm|npm|yarn|bun)\s+(?:exec\s+)?|npx\s+)?turbo\s+test\b/u,
] as const;

function splitCommandSegments(command: string) {
  return command
    .split(/(?:\r?\n|&&|\|\||;)/u)
    .map(stripLeadingEnvAssignments)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
}

function stripLeadingEnvAssignments(segment: string) {
  let trimmed = segment.trim();

  while (/^[A-Za-z_][A-Za-z0-9_]*=(?:"[^"]*"|'[^']*'|\S+)\s+/u.test(trimmed)) {
    trimmed = trimmed.replace(
      /^[A-Za-z_][A-Za-z0-9_]*=(?:"[^"]*"|'[^']*'|\S+)\s+/u,
      "",
    );
  }

  return trimmed;
}

function normalizeManifestDir(value: string) {
  const normalized = posix.normalize(value.replace(/\\/gu, "/"));

  if (normalized === "." || normalized === "./") {
    return ".";
  }

  return normalized.replace(/^\.\/+/u, "").replace(/\/+$/u, "") || ".";
}

function normalizeWhitespace(value: string) {
  return value.trim().replace(/\s+/gu, " ");
}

function sortJobs(jobs: StoredWorkflowJobForTestSuites[]) {
  return [...jobs].sort((left, right) => {
    return (
      left.sourceFilePath.localeCompare(right.sourceFilePath) ||
      left.key.localeCompare(right.key) ||
      left.stableKey.localeCompare(right.stableKey)
    );
  });
}

function unquote(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function isDeterministicTestScriptKey(scriptKey: string) {
  return scriptKey === "test" || scriptKey.startsWith("test:");
}
