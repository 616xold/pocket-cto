import { execFileSync } from "node:child_process";
import { createHmac } from "node:crypto";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

const DEFAULT_CONTROL_PLANE_URL = "http://localhost:4000";
const DEFAULT_WEB_URL = "http://localhost:3000";

async function main() {
  loadNearestEnvFile();

  const options = parseArgs(process.argv.slice(2));
  const controlPlaneUrl = stripTrailingSlash(
    options.controlPlaneUrl ??
      process.env.NEXT_PUBLIC_CONTROL_PLANE_URL ??
      process.env.CONTROL_PLANE_URL ??
      DEFAULT_CONTROL_PLANE_URL,
  );
  const webUrl = stripTrailingSlash(
    options.webUrl ?? process.env.PUBLIC_APP_URL ?? DEFAULT_WEB_URL,
  );
  const webhookSecret = options.webhookSecret ?? process.env.GITHUB_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error(
      "GITHUB_WEBHOOK_SECRET is required. Set it in .env or pass --webhook-secret.",
    );
  }

  await expectOkJson(`${controlPlaneUrl}/health`, "control-plane health check");

  const repositoryContext = await resolveRepositoryContext({
    controlPlaneUrl,
    requestedFullName: options.repoFullName,
  });

  const now = new Date();
  const timeTag = now.toISOString().replace(/[-:.TZ]/gu, "");
  const issueNumber = parsePositiveInteger(
    options.issueNumber ?? String(Number(timeTag.slice(-6)) || 1),
    "--issue-number",
  );
  const issueId = options.issueId ?? `${Date.now()}`;
  const deliveryId =
    options.deliveryId ?? `local-issue-intake-smoke-${timeTag}`;
  const title =
    options.title ??
    `Local signed issue intake smoke ${now.toISOString()}`;
  const body =
    options.body ??
    [
      "This is a truthful local signed ingress replay for the M2.7 issue-intake smoke.",
      "It exercises the existing /github/webhooks route without claiming to be a live GitHub-hosted delivery.",
      "Expected proof: issue intake list, idempotent create-mission, mission list presence, and mission detail page load.",
    ].join("\n\n");
  const senderLogin = options.senderLogin ?? "local-issue-intake-smoke";
  const issueUrl = `https://github.com/${repositoryContext.fullName}/issues/${issueNumber}`;
  const payload = buildIssuePayload({
    body,
    githubRepositoryId: repositoryContext.githubRepositoryId,
    installationId: repositoryContext.installationId,
    issueId,
    issueNumber,
    issueUrl,
    language: repositoryContext.language,
    repoFullName: repositoryContext.fullName,
    title,
    visibility: repositoryContext.visibility,
    senderLogin,
  });
  const rawBody = JSON.stringify(payload);
  const signature = createWebhookSignature(webhookSecret, rawBody);

  const ingressResponse = await postJsonRaw(`${controlPlaneUrl}/github/webhooks`, {
    body: rawBody,
    headers: {
      "content-type": "application/json",
      "x-github-delivery": deliveryId,
      "x-github-event": "issues",
      "x-hub-signature-256": signature,
    },
  });

  assert(
    ingressResponse.status === 202,
    `Expected first webhook ingest to return 202, received ${ingressResponse.status}`,
  );
  assert(
    ingressResponse.json?.handledAs === "issue_envelope_recorded",
    "Webhook ingress did not persist the issue envelope as issue_envelope_recorded",
  );

  const issueList = await expectOkJson(
    `${controlPlaneUrl}/github/intake/issues`,
    "issue intake list",
  );
  const intakeIssue = issueList.issues?.find((issue) => issue.deliveryId === deliveryId);
  assert(
    intakeIssue,
    `Persisted intake item ${deliveryId} was not returned by GET /github/intake/issues`,
  );

  const firstCreate = await postJsonRaw(
    `${controlPlaneUrl}/github/intake/issues/${encodeURIComponent(deliveryId)}/create-mission`,
    {
      body: JSON.stringify({}),
      headers: {
        "content-type": "application/json",
      },
    },
  );
  const secondCreate = await postJsonRaw(
    `${controlPlaneUrl}/github/intake/issues/${encodeURIComponent(deliveryId)}/create-mission`,
    {
      body: JSON.stringify({}),
      headers: {
        "content-type": "application/json",
      },
    },
  );

  assert(
    firstCreate.status === 201,
    `Expected first create-mission to return 201, received ${firstCreate.status}`,
  );
  assert(
    secondCreate.status === 200,
    `Expected repeated create-mission to return 200, received ${secondCreate.status}`,
  );
  assert(
    firstCreate.json?.outcome === "created",
    "First create-mission did not report outcome=created",
  );
  assert(
    secondCreate.json?.outcome === "already_bound",
    "Repeated create-mission did not report outcome=already_bound",
  );

  const missionId = firstCreate.json?.mission?.id;
  assert(
    typeof missionId === "string" && missionId.length > 0,
    "Mission id was missing from create-mission response",
  );
  assert(
    secondCreate.json?.mission?.id === missionId,
    "Repeated create-mission did not return the same mission id",
  );

  const missionList = await expectOkJson(
    `${controlPlaneUrl}/missions?sourceKind=github_issue`,
    "mission list",
  );
  const listedMission = missionList.missions?.find((mission) => mission.id === missionId);
  assert(
    listedMission,
    `Mission ${missionId} was not returned by GET /missions?sourceKind=github_issue`,
  );

  const missionDetail = await expectOkJson(
    `${controlPlaneUrl}/missions/${missionId}`,
    "mission detail",
  );
  assert(
    missionDetail.mission?.sourceKind === "github_issue",
    `Expected sourceKind github_issue, received ${missionDetail.mission?.sourceKind ?? "unknown"}`,
  );
  assert(
    missionDetail.mission?.sourceRef === issueUrl,
    `Expected sourceRef ${issueUrl}, received ${missionDetail.mission?.sourceRef ?? "unknown"}`,
  );
  assert(
    missionDetail.mission?.primaryRepo === repositoryContext.fullName,
    `Expected primaryRepo ${repositoryContext.fullName}, received ${missionDetail.mission?.primaryRepo ?? "unknown"}`,
  );
  assert(
    Array.isArray(missionDetail.mission?.spec?.repos) &&
      missionDetail.mission.spec.repos.includes(repositoryContext.fullName),
    `Mission spec.repos did not include ${repositoryContext.fullName}`,
  );

  const missionPage = await fetch(`${webUrl}/missions/${encodeURIComponent(missionId)}`, {
    redirect: "follow",
    headers: {
      accept: "text/html",
    },
  });
  const missionPageHtml = await missionPage.text();

  assert(
    missionPage.ok,
    `Mission detail page ${webUrl}/missions/${missionId} returned ${missionPage.status}`,
  );
  assert(
    missionPageHtml.includes(title),
    "Mission detail page rendered but did not include the mission title",
  );

  const result = {
    mode: "local_signed_ingress_replay",
    controlPlaneUrl,
    webUrl,
    deliveryId,
    issueId,
    issueNumber,
    repoFullName: repositoryContext.fullName,
    missionId,
    issueSourceRef: issueUrl,
    ingress: {
      status: ingressResponse.status,
      handledAs: ingressResponse.json.handledAs,
    },
    createMission: {
      firstOutcome: firstCreate.json.outcome,
      secondOutcome: secondCreate.json.outcome,
    },
  };

  console.log(JSON.stringify(result, null, 2));
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const entry = argv[index];

    if (!entry?.startsWith("--")) {
      throw new Error(`Unexpected argument: ${entry}`);
    }

    const trimmed = entry.slice(2);
    const [rawKey, inlineValue] = trimmed.split("=", 2);
    const key = toCamelCase(rawKey);

    if (!key) {
      throw new Error(`Invalid argument: ${entry}`);
    }

    if (inlineValue !== undefined) {
      parsed[key] = inlineValue;
      continue;
    }

    const nextValue = argv[index + 1];
    if (!nextValue || nextValue.startsWith("--")) {
      throw new Error(`Missing value for --${rawKey}`);
    }

    parsed[key] = nextValue;
    index += 1;
  }

  return parsed;
}

async function resolveRepositoryContext(input) {
  const repositoryList = await expectOkJson(
    `${input.controlPlaneUrl}/github/repositories`,
    "github repository list",
  );
  const activeRepositories = (repositoryList.repositories ?? []).filter(
    (repository) => repository.isActive,
  );

  if (input.requestedFullName) {
    const matched = activeRepositories.find(
      (repository) => repository.fullName === input.requestedFullName,
    );
    if (!matched) {
      throw new Error(
        `Active synced repository ${input.requestedFullName} was not found. Pass a synced full name or sync repositories first.`,
      );
    }

    return matched;
  }

  if (activeRepositories.length === 1) {
    return activeRepositories[0];
  }

  const gitRemoteFullName = tryResolveGitRemoteFullName();
  if (gitRemoteFullName) {
    const matched = activeRepositories.find(
      (repository) => repository.fullName === gitRemoteFullName,
    );
    if (matched) {
      return matched;
    }
  }

  if (activeRepositories.length === 0) {
    throw new Error(
      "No active synced repositories are available. Sync repositories first or pass --repo-full-name for a synced repo.",
    );
  }

  throw new Error(
    "Multiple active synced repositories were found. Pass --repo-full-name to choose the truthful target repo for the local replay.",
  );
}

function tryResolveGitRemoteFullName() {
  try {
    const remoteUrl = execFileSync("git", ["remote", "get-url", "origin"], {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();

    const sshMatch = remoteUrl.match(/^git@github\.com:([^/]+\/[^/.]+?)(?:\.git)?$/u);
    if (sshMatch?.[1]) {
      return sshMatch[1];
    }

    const httpsMatch = remoteUrl.match(
      /^https:\/\/github\.com\/([^/]+\/[^/.]+?)(?:\.git)?$/u,
    );
    if (httpsMatch?.[1]) {
      return httpsMatch[1];
    }

    return null;
  } catch {
    return null;
  }
}

function buildIssuePayload(input) {
  const [ownerLogin = "unknown", name = "unknown"] = input.repoFullName.split("/");

  return {
    action: "opened",
    installation: {
      id: input.installationId,
    },
    repository: {
      id: input.githubRepositoryId,
      full_name: input.repoFullName,
      name,
      owner: {
        login: ownerLogin,
      },
      default_branch: "main",
      private: input.visibility === "private",
      archived: false,
      disabled: false,
      language: input.language ?? "TypeScript",
    },
    sender: {
      login: input.senderLogin,
    },
    issue: {
      id: input.issueId,
      node_id: `LOCAL_${input.issueId}`,
      number: input.issueNumber,
      title: input.title,
      body: input.body,
      state: "open",
      html_url: input.issueUrl,
      comments: 0,
    },
  };
}

function createWebhookSignature(secret, body) {
  const digest = createHmac("sha256", secret).update(body).digest("hex");
  return `sha256=${digest}`;
}

async function expectOkJson(url, label) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
    },
  });
  const json = await readJson(response);

  assert(response.ok, `${label} failed with ${response.status}`);

  return json;
}

async function postJsonRaw(url, input) {
  const response = await fetch(url, {
    method: "POST",
    headers: input.headers,
    body: input.body,
  });

  return {
    status: response.status,
    json: await readJson(response),
  };
}

async function readJson(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Expected JSON response from ${response.url}, received: ${text.slice(0, 240)}`,
    );
  }
}

function parsePositiveInteger(value, label) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer`);
  }

  return parsed;
}

function stripTrailingSlash(value) {
  return value.replace(/\/+$/u, "");
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/gu, (_match, letter) => letter.toUpperCase());
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function loadNearestEnvFile() {
  if (typeof process.loadEnvFile !== "function") {
    return;
  }

  let currentDirectory = process.cwd();

  while (true) {
    const envPath = join(currentDirectory, ".env");
    if (existsSync(envPath)) {
      process.loadEnvFile(envPath);
      return;
    }

    const parentDirectory = dirname(currentDirectory);
    if (parentDirectory === currentDirectory) {
      return;
    }

    currentDirectory = parentDirectory;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
