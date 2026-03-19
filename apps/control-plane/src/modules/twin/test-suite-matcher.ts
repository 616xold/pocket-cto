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
  const unmappedJobs: StoredWorkflowJobForTestSuites[] = [];

  for (const job of sortJobs(input.jobs)) {
    let matched = false;

    for (const step of job.steps) {
      if (step.kind !== "run") {
        continue;
      }

      for (const invocation of extractScriptInvocations(step.value)) {
        const suite = resolveSuiteFromInvocation(invocation, indexes);

        if (!suite) {
          continue;
        }

        const match = {
          jobEntityId: job.entityId,
          jobStableKey: job.stableKey,
          manifestPath: suite.manifestPath,
          matchedBy: invocation.kind,
          matchedCommand: normalizeWhitespace(invocation.rawCommand),
          scriptKey: suite.scriptKey,
          suiteStableKey: suite.stableKey,
        } satisfies MatchedTestSuiteJob;
        matchesByScope.set(`${job.entityId}::${suite.stableKey}`, match);
        matched = true;
      }
    }

    if (!matched) {
      unmappedJobs.push(job);
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
) {
  if (invocation.kind === "root_script") {
    return indexes.rootSuites.get(invocation.scriptKey) ?? null;
  }

  if (invocation.kind === "package_filter") {
    return getUniqueSuite(
      indexes.suitesByPackageName.get(
        `${invocation.packageName}::${invocation.scriptKey}`,
      ) ?? [],
    );
  }

  return getUniqueSuite(
    indexes.suitesByManifestDir.get(
      `${invocation.manifestDir}::${invocation.scriptKey}`,
    ) ?? [],
  );
}

function getUniqueSuite(suites: DerivedTestSuite[]) {
  return suites.length === 1 ? suites[0] : null;
}

function extractScriptInvocations(command: string): ScriptInvocation[] {
  const invocations: ScriptInvocation[] = [];

  for (const segment of splitCommandSegments(command)) {
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
      continue;
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
      continue;
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
      continue;
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
  }

  return invocations;
}

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
