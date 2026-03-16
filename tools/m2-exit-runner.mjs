import {
  buildRunTag,
  createWebhookSignature,
  expectOkJson,
  postJson,
  postJsonRaw,
  requireString,
  wait,
} from "./m2-exit-utils.mjs";

const TERMINAL_MISSION_STATUSES = new Set(["cancelled", "failed", "succeeded"]);

export async function resolveRepositoryContext(input) {
  const repositoryList = await expectOkJson(
    `${input.controlPlaneUrl}/github/repositories`,
    "github repository list",
  );
  const repositories = Array.isArray(repositoryList?.repositories)
    ? repositoryList.repositories.filter((repository) => repository.isActive)
    : [];

  if (input.requestedFullName) {
    const repository = repositories.find(
      (candidate) => candidate.fullName === input.requestedFullName,
    );

    if (!repository) {
      throw new Error(`Active synced repository ${input.requestedFullName} was not found.`);
    }

    return repository;
  }

  if (repositories.length !== 1) {
    throw new Error(
      `Expected exactly one active synced repository, found ${repositories.length}. Pass --repo-full-name owner/repo.`,
    );
  }

  return repositories[0];
}

export async function runTextMission(input) {
  const created = await postJson(`${input.controlPlaneUrl}/missions/text`, {
    primaryRepo: input.definition.repository.fullName,
    requestedBy: input.definition.requestedBy,
    text: input.definition.prompt,
  });
  const missionId = requireString(created?.mission?.id, `${input.definition.label} mission id`);
  const observed = await waitForMission({
    approvalMode: input.definition.approvalMode,
    controlPlaneUrl: input.controlPlaneUrl,
    label: input.definition.label,
    missionId,
    pollIntervalMs: input.pollIntervalMs,
    requestedBy: input.definition.requestedBy,
    timeoutMs: input.timeoutMs,
  });

  return {
    ...observed,
    label: input.definition.label,
    intakeType: input.definition.intakeType,
    missionId,
    prompt: input.definition.prompt,
    requestedChangePath: input.definition.changePath,
  };
}

export async function runGitHubIssueMission(input) {
  const deliveryId = `m2-exit-${input.definition.slug}-${buildRunTag()}`;
  const issueNumber = Number(deliveryId.replace(/\D/gu, "").slice(-6) || "1");
  const issueId = Date.now();
  const issueUrl = `https://github.com/${input.definition.repository.fullName}/issues/${issueNumber}`;
  const rawBody = JSON.stringify(
    buildIssuePayload({
      body: input.definition.issueBody,
      issueId,
      issueNumber,
      issueTitle: input.definition.issueTitle,
      issueUrl,
      repository: input.definition.repository,
      senderLogin: input.definition.requestedBy,
    }),
  );
  const ingest = await postJsonRaw(`${input.controlPlaneUrl}/github/webhooks`, {
    body: rawBody,
    headers: {
      "content-type": "application/json",
      "x-github-delivery": deliveryId,
      "x-github-event": "issues",
      "x-hub-signature-256": createWebhookSignature(input.webhookSecret, rawBody),
    },
  });
  const firstCreate = await postJson(
    `${input.controlPlaneUrl}/github/intake/issues/${encodeURIComponent(deliveryId)}/create-mission`,
    {},
  );
  const secondCreate = await postJson(
    `${input.controlPlaneUrl}/github/intake/issues/${encodeURIComponent(deliveryId)}/create-mission`,
    {},
  );
  const missionId = requireString(firstCreate?.mission?.id, `${input.definition.label} mission id`);
  const observed = await waitForMission({
    approvalMode: input.definition.approvalMode,
    controlPlaneUrl: input.controlPlaneUrl,
    label: input.definition.label,
    missionId,
    pollIntervalMs: input.pollIntervalMs,
    requestedBy: input.definition.requestedBy,
    timeoutMs: input.timeoutMs,
  });

  return {
    ...observed,
    createMissionOutcomes: {
      first: firstCreate?.outcome ?? null,
      second: secondCreate?.outcome ?? null,
    },
    delivery: {
      deliveryId,
      handledAs: ingest?.handledAs ?? null,
      issueNumber,
      issueSourceRef: issueUrl,
    },
    intakeType: input.definition.intakeType,
    issueIntakeCreateIdempotent:
      firstCreate?.outcome === "created" &&
      secondCreate?.outcome === "already_bound" &&
      secondCreate?.mission?.id === missionId,
    label: input.definition.label,
    missionId,
    requestedChangePath: input.definition.changePath,
  };
}

async function waitForMission(input) {
  const approvalIdsResolved = new Set();
  const startedAt = Date.now();
  let approvalRequired = false;
  let lastDetail = null;

  while (Date.now() - startedAt <= input.timeoutMs) {
    const detail = await expectOkJson(
      `${input.controlPlaneUrl}/missions/${encodeURIComponent(input.missionId)}`,
      `${input.label} mission detail`,
    );
    lastDetail = detail;
    const pendingApprovals = Array.isArray(detail.approvals)
      ? detail.approvals.filter((approval) => approval.status === "pending")
      : [];

    if (pendingApprovals.length > 0) {
      approvalRequired = true;
    }

    if (input.approvalMode === "auto_accept") {
      for (const approval of pendingApprovals) {
        if (!approval?.id || approvalIdsResolved.has(approval.id)) {
          continue;
        }

        await postJson(
          `${input.controlPlaneUrl}/approvals/${encodeURIComponent(approval.id)}/resolve`,
          {
            decision: "accept",
            rationale: `Accepted during seeded run ${input.label}.`,
            resolvedBy: input.requestedBy,
          },
        );
        approvalIdsResolved.add(approval.id);
      }
    }

    if (TERMINAL_MISSION_STATUSES.has(detail?.mission?.status)) {
      return finalizeObservedMission({
        approvalIdsResolved,
        approvalRequired,
        controlPlaneUrl: input.controlPlaneUrl,
        detail,
        missionId: input.missionId,
      });
    }

    await wait(input.pollIntervalMs);
  }

  return {
    approvalRequired,
    approvalResolvedIds: [...approvalIdsResolved],
    approvals: summarizeApprovals(lastDetail?.approvals),
    artifacts: summarizeArtifacts(lastDetail?.artifacts),
    artifactIds: Array.isArray(lastDetail?.proofBundle?.artifactIds)
      ? lastDetail.proofBundle.artifactIds
      : [],
    branchName: lastDetail?.proofBundle?.branchName ?? null,
    decisionTrace: lastDetail?.proofBundle?.decisionTrace ?? [],
    finalMissionStatus: lastDetail?.mission?.status ?? null,
    finalTaskStatuses: summarizeTaskStatuses(lastDetail?.tasks),
    proofBundleStatus: lastDetail?.proofBundle?.status ?? null,
    prNumber: lastDetail?.proofBundle?.pullRequestNumber ?? null,
    prUrl: lastDetail?.proofBundle?.pullRequestUrl ?? null,
    repoFullName:
      lastDetail?.proofBundle?.targetRepoFullName ?? lastDetail?.mission?.primaryRepo ?? null,
    replay: {
      eventCount: 0,
      lastEventTypes: [],
    },
    status: "timed_out",
  };
}

async function finalizeObservedMission(input) {
  const events = await expectOkJson(
    `${input.controlPlaneUrl}/missions/${encodeURIComponent(input.missionId)}/events`,
    "mission replay",
  );
  const prArtifact = Array.isArray(input.detail.artifacts)
    ? input.detail.artifacts.find((artifact) => artifact.kind === "pr_link")
    : null;

  return {
    approvalRequired: input.approvalRequired,
    approvalResolvedIds: [...input.approvalIdsResolved],
    approvals: summarizeApprovals(input.detail.approvals),
    artifacts: summarizeArtifacts(input.detail.artifacts),
    artifactIds: Array.isArray(input.detail.proofBundle?.artifactIds)
      ? input.detail.proofBundle.artifactIds
      : [],
    branchName:
      input.detail.proofBundle?.branchName ?? prArtifact?.metadata?.branchName ?? null,
    decisionTrace: input.detail.proofBundle?.decisionTrace ?? [],
    finalMissionStatus: input.detail.mission?.status ?? null,
    finalTaskStatuses: summarizeTaskStatuses(input.detail.tasks),
    proofBundleStatus: input.detail.proofBundle?.status ?? null,
    prNumber:
      input.detail.proofBundle?.pullRequestNumber ?? prArtifact?.metadata?.prNumber ?? null,
    prUrl: input.detail.proofBundle?.pullRequestUrl ?? prArtifact?.uri ?? null,
    repoFullName:
      input.detail.proofBundle?.targetRepoFullName ??
      prArtifact?.metadata?.repoFullName ??
      input.detail.mission?.primaryRepo ??
      null,
    replay: {
      eventCount: Array.isArray(events) ? events.length : 0,
      lastEventTypes: Array.isArray(events)
        ? events.slice(-8).map((event) => event.type)
        : [],
    },
    status: "completed",
  };
}

function buildIssuePayload(input) {
  const [ownerLogin = "unknown", name = "unknown"] = input.repository.fullName.split("/");

  return {
    action: "opened",
    installation: {
      id: Number(input.repository.installationId),
    },
    issue: {
      id: input.issueId,
      node_id: `LOCAL_${input.issueId}`,
      number: input.issueNumber,
      title: input.issueTitle,
      body: input.body,
      state: "open",
      html_url: input.issueUrl,
      comments: 0,
    },
    repository: {
      id: Number(input.repository.githubRepositoryId),
      full_name: input.repository.fullName,
      name,
      owner: {
        login: ownerLogin,
      },
      default_branch: input.repository.defaultBranch,
      private: input.repository.visibility !== "public",
      archived: false,
      disabled: false,
      language: input.repository.language ?? "TypeScript",
    },
    sender: {
      login: input.senderLogin,
    },
  };
}

function summarizeApprovals(approvals) {
  return Array.isArray(approvals)
    ? approvals.map((approval) => ({
        id: approval.id,
        kind: approval.kind,
        status: approval.status,
      }))
    : [];
}

function summarizeArtifacts(artifacts) {
  return Array.isArray(artifacts)
    ? artifacts.map((artifact) => ({
        id: artifact.id,
        kind: artifact.kind,
        summary: artifact.summary ?? null,
        taskId: artifact.taskId ?? null,
        uri: artifact.uri ?? null,
      }))
    : [];
}

function summarizeTaskStatuses(tasks) {
  return Array.isArray(tasks)
    ? tasks.map((task) => ({
        id: task.id,
        role: task.role,
        sequence: task.sequence,
        status: task.status,
      }))
    : [];
}
