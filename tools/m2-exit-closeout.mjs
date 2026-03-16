import { createPrivateKey, createSign } from "node:crypto";
import {
  loadNearestEnvFile,
  parseArgs,
} from "./m2-exit-utils.mjs";

const DEFAULT_INSTALLATION_ID = "116452352";
const DEFAULT_REPO_FULL_NAME = "616xold/pocket-cto";
const DEFAULT_TARGETS = [
  {
    branchName: "pocket-cto/48c7da65-7e60-4d59-af90-b834348d0f06/1-executor",
    label: "text-intake happy-path build mission",
    prNumber: 26,
  },
  {
    branchName: "pocket-cto/26eeea81-206e-4212-9b0b-82e4b1e1ff3e/1-executor",
    label: "GitHub issue-intake happy-path build mission",
    prNumber: 27,
  },
  {
    branchName: "pocket-cto/942e73d4-14cb-4e59-9c9b-7934cb1be618/1-executor",
    label: "approval-involved happy-path build mission",
    prNumber: 28,
  },
];
const GITHUB_ACCEPT_HEADER = "application/vnd.github+json";
const GITHUB_API_VERSION = "2022-11-28";
const USER_AGENT = "pocket-cto-m2-exit-closeout";

async function main() {
  loadNearestEnvFile();

  const options = parseArgs(process.argv.slice(2).filter((entry) => entry !== "--"));
  const mode = normalizeMode(options.mode ?? "check");
  const repoFullName = options.repoFullName ?? DEFAULT_REPO_FULL_NAME;
  const installationId = options.installationId ?? DEFAULT_INSTALLATION_ID;
  const appId = requireEnv("GITHUB_APP_ID");
  const privateKeyBase64 = requireEnv("GITHUB_APP_PRIVATE_KEY_BASE64");
  const token = await createInstallationAccessToken({
    appId,
    installationId,
    privateKeyBase64,
  });

  const results = [];
  const manualCleanup = [];

  for (const target of DEFAULT_TARGETS) {
    const result = await inspectTarget({
      repoFullName,
      target,
      token,
    });

    if (mode === "apply") {
      await applyCleanup({
        repoFullName,
        result,
        target,
        token,
      });
      const finalState = await inspectTarget({
        repoFullName,
        target,
        token,
      });
      finalState.actions = result.actions;
      results.push(finalState);
      collectManualCleanup(finalState, manualCleanup);
      continue;
    }

    results.push(result);
    collectManualCleanup(result, manualCleanup);
  }

  console.log(
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        installationId,
        manualCleanup,
        mode,
        repoFullName,
        results,
      },
      null,
      2,
    ),
  );
}

function normalizeMode(value) {
  if (value !== "check" && value !== "apply") {
    throw new Error(`--mode must be check or apply. Received: ${value}`);
  }

  return value;
}

function requireEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

async function createInstallationAccessToken(input) {
  const appJwt = createAppJwt({
    appId: input.appId,
    privateKeyBase64: input.privateKeyBase64,
  });
  const response = await fetch(
    `https://api.github.com/app/installations/${encodeURIComponent(input.installationId)}/access_tokens`,
    {
      method: "POST",
      headers: {
        Accept: GITHUB_ACCEPT_HEADER,
        Authorization: `Bearer ${appJwt}`,
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
        "X-GitHub-Api-Version": GITHUB_API_VERSION,
      },
      body: JSON.stringify({}),
    },
  );

  const body = await parseResponseBody(response);
  if (!response.ok || !body?.token) {
    throw new Error(
      `Failed to create installation token (${response.status}): ${JSON.stringify(body)}`,
    );
  }

  return body.token;
}

function createAppJwt(input) {
  const privateKeyPem = Buffer.from(input.privateKeyBase64, "base64")
    .toString("utf8")
    .trim();
  const privateKey = createPrivateKey(privateKeyPem);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const header = toBase64Url(
    JSON.stringify({
      alg: "RS256",
      typ: "JWT",
    }),
  );
  const payload = toBase64Url(
    JSON.stringify({
      exp: nowSeconds + 9 * 60,
      iat: nowSeconds - 60,
      iss: input.appId,
    }),
  );
  const signingInput = `${header}.${payload}`;
  const signature = createSign("RSA-SHA256")
    .update(signingInput)
    .end()
    .sign(privateKey)
    .toString("base64url");

  return `${signingInput}.${signature}`;
}

function toBase64Url(value) {
  return Buffer.from(value).toString("base64url");
}

async function inspectTarget(input) {
  const pullRequest = await getPullRequest({
    prNumber: input.target.prNumber,
    repoFullName: input.repoFullName,
    token: input.token,
  });
  const branch = await getBranchRef({
    branchName: input.target.branchName,
    repoFullName: input.repoFullName,
    token: input.token,
  });

  return {
    actions: [],
    branch: {
      exists: branch !== null,
      sha: branch?.object?.sha ?? null,
    },
    branchName: input.target.branchName,
    label: input.target.label,
    pr: pullRequest
      ? {
          authorLogin: pullRequest.user?.login ?? null,
          draft: pullRequest.draft ?? null,
          headRef: pullRequest.head?.ref ?? null,
          state: pullRequest.state ?? null,
          title: pullRequest.title ?? null,
        }
      : null,
    prNumber: input.target.prNumber,
    safeToClose:
      pullRequest !== null &&
      pullRequest.state === "open" &&
      pullRequest.draft === true &&
      pullRequest.head?.ref === input.target.branchName &&
      pullRequest.user?.login === "pocket-cto[bot]",
    safeToDeleteBranch:
      branch !== null &&
      (pullRequest === null || pullRequest.state === "closed"),
  };
}

async function applyCleanup(input) {
  if (input.result.safeToClose) {
    const closed = await closePullRequest({
      prNumber: input.target.prNumber,
      repoFullName: input.repoFullName,
      token: input.token,
    });
    input.result.actions.push({
      action: "close_pull_request",
      outcome: closed.state === "closed" ? "closed" : "unchanged",
    });
  } else if (input.result.pr?.state === "closed") {
    input.result.actions.push({
      action: "close_pull_request",
      outcome: "already_closed",
    });
  } else {
    input.result.actions.push({
      action: "close_pull_request",
      outcome: "skipped_not_safe",
    });
  }

  const pullRequestAfterClose = await getPullRequest({
    prNumber: input.target.prNumber,
    repoFullName: input.repoFullName,
    token: input.token,
  });
  const branchExists = await getBranchRef({
    branchName: input.target.branchName,
    repoFullName: input.repoFullName,
    token: input.token,
  });
  const branchSafeToDelete =
    branchExists !== null &&
    (pullRequestAfterClose === null || pullRequestAfterClose.state === "closed");

  if (branchSafeToDelete) {
    const deleted = await deleteBranchRef({
      branchName: input.target.branchName,
      repoFullName: input.repoFullName,
      token: input.token,
    });
    input.result.actions.push({
      action: "delete_branch",
      outcome: deleted ? "deleted" : "already_missing",
    });
    return;
  }

  input.result.actions.push({
    action: "delete_branch",
    outcome: branchExists === null ? "already_missing" : "skipped_not_safe",
  });
}

function collectManualCleanup(result, manualCleanup) {
  if (result.pr?.state === "open") {
    manualCleanup.push({
      item: "pull_request",
      label: result.label,
      prNumber: result.prNumber,
      reason: "PR is still open after inspection or cleanup attempt.",
    });
  }

  if (result.branch.exists) {
    manualCleanup.push({
      branchName: result.branchName,
      item: "branch",
      label: result.label,
      reason: "Branch still exists after inspection or cleanup attempt.",
    });
  }
}

async function getPullRequest(input) {
  const response = await fetch(
    `https://api.github.com/repos/${encodeRepoPath(input.repoFullName)}/pulls/${input.prNumber}`,
    {
      headers: buildInstallationHeaders(input.token),
    },
  );

  if (response.status === 404) {
    return null;
  }

  const body = await parseResponseBody(response);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch pull request #${input.prNumber} (${response.status}): ${JSON.stringify(body)}`,
    );
  }

  return body;
}

async function closePullRequest(input) {
  const response = await fetch(
    `https://api.github.com/repos/${encodeRepoPath(input.repoFullName)}/pulls/${input.prNumber}`,
    {
      method: "PATCH",
      headers: {
        ...buildInstallationHeaders(input.token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        state: "closed",
      }),
    },
  );

  const body = await parseResponseBody(response);
  if (!response.ok) {
    throw new Error(
      `Failed to close pull request #${input.prNumber} (${response.status}): ${JSON.stringify(body)}`,
    );
  }

  return body;
}

async function getBranchRef(input) {
  const response = await fetch(
    `https://api.github.com/repos/${encodeRepoPath(input.repoFullName)}/git/ref/heads/${encodeGitRef(input.branchName)}`,
    {
      headers: buildInstallationHeaders(input.token),
    },
  );

  if (response.status === 404) {
    return null;
  }

  const body = await parseResponseBody(response);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch branch ${input.branchName} (${response.status}): ${JSON.stringify(body)}`,
    );
  }

  return body;
}

async function deleteBranchRef(input) {
  const response = await fetch(
    `https://api.github.com/repos/${encodeRepoPath(input.repoFullName)}/git/refs/heads/${encodeGitRef(input.branchName)}`,
    {
      method: "DELETE",
      headers: buildInstallationHeaders(input.token),
    },
  );

  if (response.status === 404) {
    return false;
  }

  if (response.status !== 204) {
    const body = await parseResponseBody(response);
    throw new Error(
      `Failed to delete branch ${input.branchName} (${response.status}): ${JSON.stringify(body)}`,
    );
  }

  return true;
}

function buildInstallationHeaders(token) {
  return {
    Accept: GITHUB_ACCEPT_HEADER,
    Authorization: `Bearer ${token}`,
    "User-Agent": USER_AGENT,
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
  };
}

function encodeRepoPath(fullName) {
  return fullName
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function encodeGitRef(ref) {
  return ref
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

async function parseResponseBody(response) {
  const rawBody = await response.text();

  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
