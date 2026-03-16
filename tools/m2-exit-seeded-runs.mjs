import {
  DEFAULT_CONTROL_PLANE_URL,
  DEFAULT_POLL_INTERVAL_MS,
  DEFAULT_TIMEOUT_MS,
  asError,
  expectOkJson,
  loadNearestEnvFile,
  parseArgs,
  postJson,
  readPositiveInteger,
  stripTrailingSlash,
} from "./m2-exit-utils.mjs";
import {
  resolveRepositoryContext,
  runGitHubIssueMission,
  runTextMission,
} from "./m2-exit-runner.mjs";

async function main() {
  loadNearestEnvFile();

  const options = parseArgs(process.argv.slice(2));
  const controlPlaneUrl = stripTrailingSlash(
    options.controlPlaneUrl ??
      process.env.CONTROL_PLANE_URL ??
      process.env.NEXT_PUBLIC_CONTROL_PLANE_URL ??
      DEFAULT_CONTROL_PLANE_URL,
  );
  const operator = options.operator ?? "m2-exit-seeded-runner";
  const repoFullName = options.repoFullName ?? null;
  const webhookSecret = options.webhookSecret ?? process.env.GITHUB_WEBHOOK_SECRET;
  const timeoutMs = readPositiveInteger(
    options.timeoutMs ?? String(DEFAULT_TIMEOUT_MS),
    "--timeout-ms",
  );
  const pollIntervalMs = readPositiveInteger(
    options.pollIntervalMs ?? String(DEFAULT_POLL_INTERVAL_MS),
    "--poll-interval-ms",
  );

  if (!webhookSecret) {
    throw new Error(
      "GITHUB_WEBHOOK_SECRET is required. Set it in .env or pass --webhook-secret.",
    );
  }

  const startedAt = new Date().toISOString();
  await expectOkJson(`${controlPlaneUrl}/health`, "control-plane health");
  await postJson(`${controlPlaneUrl}/github/installations/sync`, {});
  await postJson(`${controlPlaneUrl}/github/repositories/sync`, {});

  const repository = await resolveRepositoryContext({
    controlPlaneUrl,
    requestedFullName: repoFullName,
  });
  const runs = [];

  for (const definition of buildRunDefinitions({ operator, repository })) {
    try {
      const run =
        definition.intakeType === "github_issue"
          ? await runGitHubIssueMission({
              controlPlaneUrl,
              definition,
              pollIntervalMs,
              timeoutMs,
              webhookSecret,
            })
          : await runTextMission({
              controlPlaneUrl,
              definition,
              pollIntervalMs,
              timeoutMs,
            });
      runs.push(run);
    } catch (error) {
      runs.push({
        label: definition.label,
        intakeType: definition.intakeType,
        missionId: null,
        repoFullName: repository.fullName,
        requestedChangePath: definition.changePath,
        status: "error",
        error: asError(error, "Seeded run failed").message,
      });
    }
  }

  console.log(
    JSON.stringify(
      {
        controlPlaneUrl,
        generatedAt: new Date().toISOString(),
        manualCleanup: runs
          .filter((run) => run.status !== "error" && (run.branchName || run.prUrl))
          .map((run) => ({
            branchName: run.branchName ?? null,
            label: run.label,
            prNumber: run.prNumber ?? null,
            prUrl: run.prUrl ?? null,
            repoFullName: run.repoFullName ?? null,
          })),
        operator,
        repository: {
          defaultBranch: repository.defaultBranch,
          fullName: repository.fullName,
          installationId: repository.installationId,
          sourceRepoRoot: process.env.POCKET_CTO_SOURCE_REPO_ROOT ?? null,
        },
        runs,
        seededRunStrategy:
          "Three real local M2 runs against an embedded control plane: text intake, signed GitHub issue intake, and an approval-seeking text run that auto-accepts any live pending approval through the existing approval route.",
        startedAt,
      },
      null,
      2,
    ),
  );
}

function buildRunDefinitions(input) {
  const runTag = new Date().toISOString().replace(/[-:.TZ]/gu, "").slice(0, 14);

  return [
    {
      approvalMode: "none",
      changePath: `docs/benchmarks/m2-exit/text-${runTag}.md`,
      intakeType: "text",
      label: "text-intake happy-path build mission",
      prompt:
        `Create docs/benchmarks/m2-exit/text-${runTag}.md with a short heading and two bullet points noting that the M2 text intake seeded run succeeded. Keep the change limited to that file.`,
      requestedBy: input.operator,
      repository: input.repository,
      slug: "text",
    },
    {
      approvalMode: "none",
      changePath: `docs/benchmarks/m2-exit/issue-${runTag}.md`,
      intakeType: "github_issue",
      issueBody:
        `Create docs/benchmarks/m2-exit/issue-${runTag}.md with a short heading and two bullet points noting that the M2 GitHub issue intake seeded run succeeded. Keep the change limited to that file.`,
      issueTitle: `Seeded M2 issue-intake run ${runTag}`,
      label: "GitHub issue-intake happy-path build mission",
      requestedBy: input.operator,
      repository: input.repository,
      slug: "issue",
    },
    {
      approvalMode: "auto_accept",
      changePath: `docs/benchmarks/m2-exit/approval-${runTag}.md`,
      intakeType: "text",
      label: "approval-involved happy-path build mission",
      prompt:
        `Inspect README.md and package.json with shell commands, then create docs/benchmarks/m2-exit/approval-${runTag}.md with a short heading and two bullet points noting that the M2 approval seeded run succeeded. Keep the change limited to that file.`,
      requestedBy: input.operator,
      repository: input.repository,
      slug: "approval",
    },
  ];
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
