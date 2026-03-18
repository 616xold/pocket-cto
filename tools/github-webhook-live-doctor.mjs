import { execFileSync } from "node:child_process"
import {
  expectOkJson,
  loadNearestEnvFile,
  parseArgs,
  stripTrailingSlash,
} from "./m2-exit-utils.mjs"

const DEFAULT_CONTROL_PLANE_URL = "http://localhost:4000"
const DOCTOR_MODE = "github_issue_live_doctor"
const SAFE_ENV_NAMES = [
  "GITHUB_APP_ID",
  "GITHUB_APP_PRIVATE_KEY_BASE64",
  "GITHUB_WEBHOOK_SECRET",
]

async function main() {
  loadNearestEnvFile()

  const options = parseArgs(process.argv.slice(2).filter((entry) => entry !== "--"))
  const controlPlaneUrl = stripTrailingSlash(
    options.controlPlaneUrl ??
      process.env.NEXT_PUBLIC_CONTROL_PLANE_URL ??
      process.env.CONTROL_PLANE_URL ??
      DEFAULT_CONTROL_PLANE_URL,
  )
  const environment = readEnvironmentPresence()
  const health = await readHealth(controlPlaneUrl)
  const tunnel = readTunnelProcesses()

  if (!health.reachable) {
    console.log(
      JSON.stringify(
        {
          checkedAt: new Date().toISOString(),
          controlPlaneUrl,
          controlPlaneHealth: health,
          environment,
          liveSmokeReadiness: {
            blocker: "control_plane_unreachable",
            blockers: ["control_plane_unreachable"],
            explanation:
              "The local control-plane health endpoint is not reachable, so the doctor cannot verify GitHub App sync or webhook delivery posture.",
            ready: false,
          },
          mode: DOCTOR_MODE,
          recentPersistedIssueDeliveries: {
            count: 0,
            installationScopedCount: 0,
            items: [],
          },
          repoFullName: options.repoFullName ?? null,
          tunnel,
        },
        null,
        2,
      ),
    )
    return
  }

  const installationSync = await postJson(
    `${controlPlaneUrl}/github/installations/sync`,
    {},
    "github installation sync",
  )
  const installationsList = await getJson(
    `${controlPlaneUrl}/github/installations`,
    "github installation list",
  )
  const repositorySync = await postJson(
    `${controlPlaneUrl}/github/repositories/sync`,
    {},
    "github repository sync",
  )
  const repositoriesList = await getJson(
    `${controlPlaneUrl}/github/repositories`,
    "github repository list",
  )
  const repositoryResolution = resolveRepositoryContext({
    repositories: repositoriesList.repositories ?? [],
    requestedFullName: options.repoFullName,
  })
  const installations = installationsList.installations ?? []
  const installation =
    repositoryResolution.repository &&
    typeof repositoryResolution.repository.installationId === "string"
      ? installations.find(
          (entry) =>
            entry.installationId === repositoryResolution.repository.installationId,
        ) ?? null
      : null
  const issuePermission = installation?.permissions?.issues ?? null
  const deliveries = await getJson(
    buildIssuesDeliveryUrl(
      controlPlaneUrl,
      repositoryResolution.repository?.installationId ?? null,
    ),
    "issues webhook delivery list",
  )
  const recentPersistedIssueDeliveries = summarizeIssueDeliveries(
    deliveries.deliveries ?? [],
    repositoryResolution.repository?.fullName ?? null,
  )
  const blockers = []

  if (!environment.ready) {
    blockers.push("github_env_missing")
  }

  if (!installationSync.ok || !repositorySync.ok) {
    blockers.push("github_sync_failed")
  }

  if (!repositoryResolution.repository) {
    blockers.push(repositoryResolution.blocker)
  }

  if (!installation) {
    blockers.push("installation_not_found")
  }

  if (installation && issuePermission !== "write") {
    blockers.push("issues_write_missing")
  }

  if (!tunnel.running) {
    blockers.push("webhook_routing_missing")
  }

  const ready = blockers.length === 0
  const blocker = blockers[0] ?? null

  console.log(
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        controlPlaneUrl,
        controlPlaneHealth: health,
        environment,
        installationSync,
        installations: {
          count: installations.length,
          items: installations.map((entry) => ({
            accountLogin: entry.accountLogin,
            installationId: entry.installationId,
            issuesPermission: entry.permissions?.issues ?? null,
          })),
        },
        liveSmokeReadiness: {
          blocker,
          blockers,
          explanation: buildReadinessExplanation({
            blocker,
            issuePermission,
            recentPersistedIssueDeliveries,
            repositoryResolution,
            tunnel,
          }),
          ready,
        },
        mode: DOCTOR_MODE,
        recentPersistedIssueDeliveries,
        repoFullName: repositoryResolution.repository?.fullName ?? null,
        repositoryResolution: {
          blocker: repositoryResolution.blocker,
          strategy: repositoryResolution.strategy,
        },
        repositorySync,
        targetInstallation: installation
          ? {
              accountLogin: installation.accountLogin,
              installationId: installation.installationId,
              issuesPermission: issuePermission,
            }
          : null,
        tunnel,
      },
      null,
      2,
    ),
  )
}

function readEnvironmentPresence() {
  const values = Object.fromEntries(
    SAFE_ENV_NAMES.map((name) => [name, Boolean(process.env[name]?.trim())]),
  )

  return {
    ready: SAFE_ENV_NAMES.every((name) => values[name]),
    values,
  }
}

async function readHealth(controlPlaneUrl) {
  try {
    const response = await fetch(`${controlPlaneUrl}/health`, {
      headers: {
        accept: "application/json",
      },
    })
    const text = await response.text()

    return {
      bodyPreview: text.slice(0, 240),
      reachable: response.ok,
      status: response.status,
    }
  } catch (error) {
    return {
      bodyPreview: error instanceof Error ? error.message : String(error),
      reachable: false,
      status: null,
    }
  }
}

function readTunnelProcesses() {
  try {
    const stdout = execFileSync("/bin/sh", ["-lc", "pgrep -fl 'ngrok|cloudflared' || true"], {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    })
    const processes = stdout
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter(Boolean)

    return {
      processes,
      running: processes.length > 0,
    }
  } catch (error) {
    return {
      processes: [],
      running: false,
      warning: error instanceof Error ? error.message : String(error),
    }
  }
}

async function getJson(url, description) {
  try {
    return await expectOkJson(url, description)
  } catch (error) {
    throw new Error(
      `${description} failed: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

async function postJson(url, body, description) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    })
    const text = await response.text()

    return {
      bodyPreview: text.slice(0, 240),
      ok: response.ok,
      status: response.status,
    }
  } catch (error) {
    return {
      bodyPreview: error instanceof Error ? error.message : String(error),
      ok: false,
      status: null,
    }
  }
}

function resolveRepositoryContext(input) {
  const activeRepositories = input.repositories.filter((repository) => repository.isActive)

  if (input.requestedFullName) {
    const matched = activeRepositories.find(
      (repository) => repository.fullName === input.requestedFullName,
    )

    return matched
      ? {
          blocker: null,
          repository: matched,
          strategy: "requested_full_name",
        }
      : {
          blocker: "requested_repo_not_synced",
          repository: null,
          strategy: "requested_full_name",
        }
  }

  if (activeRepositories.length === 1) {
    return {
      blocker: null,
      repository: activeRepositories[0],
      strategy: "single_active_repo",
    }
  }

  const gitRemoteFullName = tryResolveGitRemoteFullName()
  if (gitRemoteFullName) {
    const matched = activeRepositories.find(
      (repository) => repository.fullName === gitRemoteFullName,
    )

    if (matched) {
      return {
        blocker: null,
        repository: matched,
        strategy: "git_remote_match",
      }
    }
  }

  return activeRepositories.length === 0
    ? {
        blocker: "no_active_synced_repo",
        repository: null,
        strategy: "none",
      }
    : {
        blocker: "multiple_active_repos_require_explicit_choice",
        repository: null,
        strategy: "ambiguous",
      }
}

function tryResolveGitRemoteFullName() {
  try {
    const remoteUrl = execFileSync("git", ["remote", "get-url", "origin"], {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim()
    const sshMatch = remoteUrl.match(/^git@github\.com:([^/]+\/[^/.]+?)(?:\.git)?$/u)

    if (sshMatch?.[1]) {
      return sshMatch[1]
    }

    const httpsMatch = remoteUrl.match(
      /^https:\/\/github\.com\/([^/]+\/[^/.]+?)(?:\.git)?$/u,
    )

    if (httpsMatch?.[1]) {
      return httpsMatch[1]
    }

    return null
  } catch {
    return null
  }
}

function buildIssuesDeliveryUrl(controlPlaneUrl, installationId) {
  const url = new URL(`${controlPlaneUrl}/github/webhooks/deliveries`)
  url.searchParams.set("eventName", "issues")
  url.searchParams.set("handledAs", "issue_envelope_recorded")

  if (installationId) {
    url.searchParams.set("installationId", installationId)
  }

  return url.toString()
}

function summarizeIssueDeliveries(deliveries, repoFullName) {
  const filtered = repoFullName
    ? deliveries.filter(
        (delivery) => delivery.payloadPreview?.repositoryFullName === repoFullName,
      )
    : deliveries
  const items = filtered.slice(0, 5).map((delivery) => ({
    deliveryId: delivery.deliveryId,
    issueNumber: delivery.payloadPreview?.issueNumber ?? null,
    issueTitle: delivery.payloadPreview?.issueTitle ?? null,
    receivedAt: delivery.receivedAt,
  }))

  return {
    count: deliveries.length,
    installationScopedCount: filtered.length,
    items,
  }
}

function buildReadinessExplanation(input) {
  switch (input.blocker) {
    case "github_env_missing":
      return "Required GitHub App env vars are missing locally, so the live smoke cannot authenticate truthfully."
    case "github_sync_failed":
      return "The local control plane is reachable, but GitHub installation or repository sync failed through the existing App routes."
    case "requested_repo_not_synced":
    case "no_active_synced_repo":
    case "multiple_active_repos_require_explicit_choice":
      return "The control plane could not resolve one truthful active synced repository for the live smoke target."
    case "installation_not_found":
      return "The target repository resolved, but its installation record was not available through GET /github/installations."
    case "issues_write_missing":
      return `The target installation does not report issues:write. Reported issues permission: ${input.issuePermission ?? "none"}.`
    case "webhook_routing_missing":
      return input.recentPersistedIssueDeliveries.installationScopedCount > 0
        ? "The product path already has persisted issue deliveries locally, but no ngrok/cloudflared tunnel process is running now, so a new live GitHub-hosted issue is still blocked on webhook routing."
        : "The control plane and GitHub App checks are healthy, but no ngrok/cloudflared tunnel process is running, so a new live GitHub-hosted issue would not be able to reach /github/webhooks."
    default:
      return input.repositoryResolution.repository
        ? `The local control plane, GitHub App sync, issues:write permission, and tunnel posture all look ready for a live smoke against ${input.repositoryResolution.repository.fullName}.`
        : "The local control plane appears ready for a live smoke."
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
