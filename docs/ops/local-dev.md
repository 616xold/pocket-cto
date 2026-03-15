# Local development

## Services

The local stack uses:

- Postgres
- MinIO
- OpenTelemetry Collector

## Commands

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
```

## Control-plane modes

API-only mode keeps the current default behavior and is the safest day-to-day path when you only need the API plus web:

```bash
pnpm dev
```

If you only want the API server without the web app in API-only mode:

```bash
pnpm dev:control-plane
```

Embedded worker mode co-locates the worker inside the control-plane server process so the HTTP approval-resolution and task-interrupt routes can reach the live in-memory session registry:

```bash
pnpm dev:embedded
```

If you only want the control-plane package entrypoint in embedded mode:

```bash
pnpm --filter @pocket-cto/control-plane dev:embedded
```

Standalone worker mode keeps the API server and worker split across processes:

```bash
pnpm dev:control-plane
pnpm dev:worker
```

In embedded mode, do not also start `pnpm dev:worker` for the same repo and database unless you are explicitly testing the single-process limitation.

## Operator action feedback

The web mission detail now surfaces approval-resolution and task-interrupt feedback inline.
Successful actions revalidate the mission detail page after the route returns.
Normal route failures stay visible in the page instead of surfacing as raw thrown errors, including:

- `501 live_control_unavailable` when the server is not running in embedded-worker mode
- `409 approval_conflict` when an approval is no longer pending
- `409 task_conflict` when the active live turn is already gone or the interrupt cannot be delivered

The local operator label used for those actions is explicit instead of hardcoded.
Set `POCKET_CTO_WEB_OPERATOR_NAME` in your local `.env` if you want approval and interrupt records to show a different operator name than the default `Local web operator`.

## CI environment

GitHub Actions does not commit or generate a repo `.env` file.
CI runs on branch pushes, pull requests, and manual `workflow_dispatch` reruns so branch work shows status before it reaches `main`.
CI also supplies safe external workspace defaults: `WORKSPACE_ROOT=/tmp/pocket-cto-workspaces` and `POCKET_CTO_SOURCE_REPO_ROOT=${{ github.workspace }}`.
CI injects the required config env directly in the workflow, provisions a Postgres service, creates both `pocket_cto` and `pocket_cto_test`, and migrates both databases before running tests.
Use `pnpm ci:static` and `pnpm ci:integration-db` locally when you want to mirror the GitHub Actions path from a clean checkout.
Use `pnpm ci:repro:current` when you need a temp worktree that applies the exact current unstaged snapshot and then runs the same CI commands from scratch.
Those CI scripts expect runner-style env to be present in the shell; `.env` stays local-only for development and should remain uncommitted.
Local development still uses `cp .env.example .env`.
If you add a DB enum or other migration that affects tests, run `pnpm run db:migrate:ci` as well so both `DATABASE_URL` and `TEST_DATABASE_URL` stay aligned.

## Real-model eval lane

Pocket CTO now includes a manual real-LLM eval lane for prompt and artifact quality.
It is intentionally outside CI.
`pnpm ci:static`, `pnpm ci:integration-db`, `pnpm test`, and `pnpm check` do not run any paid model calls.

Required env for live evals:

- `OPENAI_API_KEY`
- `OPENAI_EVALS_ENABLED=true`
- `OPENAI_EVAL_MODEL` defaults to `gpt-5-mini`
- `OPENAI_EVAL_GRADER_MODEL` defaults to `gpt-5-mini`
- `OPENAI_EVAL_REFERENCE_MODEL` defaults to `gpt-5-codex` and is only used when you add `--with-reference`

Checked-in datasets live under `evals/datasets/`.
The grading rubric lives under `evals/rubrics/quality-rubric.md`.
Timestamped result files are written to the gitignored `evals/results/` directory as JSONL.
This harness calls the OpenAI Responses API directly.
It does not create a hosted OpenAI Evals run, so you should expect local JSONL artifacts and CLI output here rather than a hosted Evals dashboard entry.

Check the local eval configuration before spending tokens:

```bash
pnpm eval:doctor
```

`pnpm eval:doctor` prints whether `OPENAI_API_KEY` is present, where it came from when that can be detected (`shell env`, `loaded .env`, or `unknown`), whether `OPENAI_EVALS_ENABLED` is true, the candidate or grader or reference models, the effective live-vs-dry-run mode, and the results directory.

Run the lane manually from the repo root:

```bash
pnpm eval:planner -- --dry-run
pnpm eval:executor -- --dry-run
pnpm eval:compiler -- --dry-run
pnpm eval:all -- --dry-run
```

Run live evals only when you explicitly opt in:

```bash
OPENAI_EVALS_ENABLED=true pnpm eval:planner
OPENAI_EVALS_ENABLED=true pnpm eval:executor
OPENAI_EVALS_ENABLED=true pnpm eval:compiler
OPENAI_EVALS_ENABLED=true pnpm eval:all
```

Optional reference runs use a second model pass for comparison:

```bash
OPENAI_EVALS_ENABLED=true pnpm eval:planner -- --limit 1 --with-reference
```

If either the key or opt-in flag is missing, the live eval scripts fail fast with a clear message.
Use `--dry-run` when you want to exercise dataset loading, prompt generation, grading flow, and result writing without paid calls.

To intentionally prove the live path with one seeded planner sample:

```bash
OPENAI_EVALS_ENABLED=true pnpm eval:smoke:planner
OPENAI_EVALS_ENABLED=true pnpm eval:smoke:executor
```

The smoke commands refuse to proceed if they would become a dry run.
On success each one writes a results file under `evals/results/` and prints a compact summary with the mode, dataset, prompt version, git provenance, output path, response ids, and token usage when the API returns that metadata.

To compare two saved runs locally:

```bash
pnpm eval:compare -- --a evals/results/<older>.jsonl --b evals/results/<newer>.jsonl
```

That helper answers the practical prompt-iteration questions:
did the overall score go up or down, which dimensions moved, and which candidate or grader models produced the two runs.

## Git and repo hygiene

Before making the first commit in a fresh checkout:

```bash
cp .env.example .env
pnpm repo:hygiene
```

Keep `pnpm-lock.yaml`, `packages/db/drizzle/*.sql`, `packages/db/drizzle/meta/**`, and `apps/web/next-env.d.ts` committed.
Do not commit local runtime artifacts such as `node_modules/`, `dist/`, `.next/`, `artifacts-local/`, logs, machine-local env files, or any external workspace-root directories created for task worktrees.

## Workspace isolation

Before M2 GitHub integration lands, Pocket CTO manages exactly one local source repo root for workspace creation.
Set `POCKET_CTO_SOURCE_REPO_ROOT` to an absolute local git repo path when you want the worker to operate on another checkout.
If it is unset, the worker dogfoods against the current repo root resolved by `git rev-parse --show-toplevel`.

Worktrees are created under `WORKSPACE_ROOT`.
If `WORKSPACE_ROOT` is unset or blank, Pocket CTO derives a safe default sibling directory outside the source repo:

```text
<source-repo-parent>/<source-repo-name>.workspaces
```

If `WORKSPACE_ROOT` is relative, it is resolved from the source repo parent directory, not from inside the repo checkout.
Pocket CTO rejects any resolved workspace root that equals the source repo root or sits inside it.
Each claimed task uses a deterministic path of the form:

```text
<workspace-root>/<mission-id>/<task.sequence>-<task.role>
```

To inspect created worktrees:

```bash
SOURCE_REPO_ROOT="${POCKET_CTO_SOURCE_REPO_ROOT:-$(git rev-parse --show-toplevel)}"

if [ -n "${WORKSPACE_ROOT:-}" ]; then
  case "$WORKSPACE_ROOT" in
    /*) RESOLVED_WORKSPACE_ROOT="$WORKSPACE_ROOT" ;;
    *) RESOLVED_WORKSPACE_ROOT="$(dirname "$SOURCE_REPO_ROOT")/$WORKSPACE_ROOT" ;;
  esac
else
  RESOLVED_WORKSPACE_ROOT="$(dirname "$SOURCE_REPO_ROOT")/$(basename "$SOURCE_REPO_ROOT").workspaces"
fi

git -C "$SOURCE_REPO_ROOT" worktree list
find "$RESOLVED_WORKSPACE_ROOT" -maxdepth 2 -mindepth 2 -type d
```

## Live approval limitation

M1.6 approval continuity is intentionally single-process.
The worker keeps the active app-server client, pending approval responders, and interrupt handles in an in-memory registry keyed by `taskId`.

That means:

- durable approval rows and replay survive worker restarts
- live turn continuation does not survive worker restarts
- approval resolution and interrupt operations must reach the same process that owns the active turn
- the HTTP control surface works only when the control-plane server runs with `CONTROL_PLANE_EMBEDDED_WORKER=true`, which `pnpm dev:embedded` sets for you locally
- accepted approvals only move task or mission state back to `running` after the live response handoff succeeds
- if a durable approval resolution outlives its live session, Pocket CTO records `payload.liveContinuation.status = "delivery_failed"` on that approval row instead of faking a resumed turn
- the web action panel now explains those live-control limitations inline and keeps the last success or failure message visible after a submit

If the worker restarts while a task is awaiting approval, the durable audit trail remains intact, but Pocket CTO cannot honestly resume that already-live turn.

## Running specific apps

```bash
pnpm dev:control-plane
pnpm dev:web
pnpm dev:embedded
pnpm dev:worker
```

## Mission Spine API Acceptance

Start the control-plane API in one terminal:

```bash
pnpm dev:control-plane
```

Create a mission from text in another terminal:

```bash
curl -i http://localhost:4000/missions/text \
  -H 'content-type: application/json' \
  -d '{
    "text": "Implement passkeys for sign-in",
    "requestedBy": "operator"
  }'
```

Expected status: `201 Created`

Expected response shape:

```json
{
  "mission": {
    "id": "<mission-uuid>",
    "type": "build",
    "status": "queued",
    "title": "Implement passkeys for sign-in",
    "objective": "Implement passkeys for sign-in"
  },
  "tasks": [
    {
      "id": "<task-uuid>",
      "role": "planner",
      "sequence": 0,
      "status": "pending",
      "attemptCount": 0
    },
    {
      "id": "<task-uuid>",
      "role": "executor",
      "sequence": 1,
      "status": "pending",
      "attemptCount": 0
    }
  ],
  "proofBundle": {
    "missionId": "<mission-uuid>",
    "objective": "Implement passkeys for sign-in",
    "status": "placeholder",
    "changeSummary": "",
    "verificationSummary": "",
    "riskSummary": "",
    "rollbackSummary": "",
    "decisionTrace": [],
    "artifactIds": [],
    "replayEventCount": 0
  }
}
```

Copy the returned `mission.id` into `MISSION_ID`, then fetch the mission detail:

```bash
MISSION_ID=<mission-uuid>

curl -i "http://localhost:4000/missions/$MISSION_ID"
```

Expected status: `200 OK`

Expected response shape:

```json
{
  "mission": {
    "id": "<mission-uuid>",
    "status": "queued"
  },
  "tasks": [
    {
      "sequence": 0,
      "role": "planner",
      "status": "pending",
      "attemptCount": 0
    },
    {
      "sequence": 1,
      "role": "executor",
      "status": "pending",
      "attemptCount": 0
    }
  ],
  "proofBundle": {
    "missionId": "<mission-uuid>",
    "status": "placeholder"
  },
  "approvals": [],
  "artifacts": [
    {
      "id": "<artifact-uuid>",
      "kind": "proof_bundle_manifest",
      "taskId": null,
      "uri": "pocket-cto://missions/<mission-uuid>/proof-bundle-manifest",
      "createdAt": "<timestamp>",
      "summary": "Proof bundle placeholder manifest persisted."
    }
  ],
  "liveControl": {
    "enabled": false,
    "limitation": "single_process_only",
    "mode": "api_only"
  }
}
```

The richer mission-detail read model is now the preferred operator fetch.
It includes:

- `approvals`: summary-shaped approval rows in oldest-first order
- `artifacts`: summary-shaped artifact ledger entries in oldest-first order by `createdAt`
- `liveControl`: whether the current control-plane process can resolve approvals or interrupt active turns directly

`GET /missions/:missionId/approvals` still exists for the narrow approval ledger surface, but the web mission detail page now reads approvals and artifacts from `GET /missions/:missionId` so the operator view stays coherent.

Fetch the replay events:

```bash
curl -i "http://localhost:4000/missions/$MISSION_ID/events"
```

Expected status: `200 OK`

Expected response shape:

```json
[
  { "sequence": 1, "type": "mission.created" },
  { "sequence": 2, "type": "task.created" },
  { "sequence": 3, "type": "task.created" },
  {
    "sequence": 4,
    "type": "mission.status_changed",
    "payload": {
      "from": "planned",
      "to": "queued",
      "reason": "tasks_materialized"
    }
  },
  { "sequence": 5, "type": "artifact.created" }
]
```

## Worker Claim Acceptance

Keep the API running in one terminal:

```bash
pnpm dev:control-plane
```

Create a mission and capture the returned mission id:

```bash
MISSION_ID=$(curl -s http://localhost:4000/missions/text \
  -H 'content-type: application/json' \
  -d '{
    "text": "Implement passkeys for sign-in",
    "requestedBy": "operator"
  }' | jq -r '.mission.id')
```

Run exactly one worker tick in another terminal:

```bash
pnpm --filter @pocket-cto/control-plane exec tsx src/worker.ts --once
```

Expected worker log shape:

```json
{
  "event": "worker.tick",
  "outcome": "claimed",
  "role": "planner",
  "sequence": 0
}
```

Inspect the mission detail after the claim:

## Planner Artifact Note

After M1.4, the first successful planner worker tick now persists more than replay:

- `mission_tasks.summary` becomes a concise planner summary
- a second `artifact.created` replay entry appears for `artifacts.kind = 'plan'`
- the placeholder proof-bundle manifest references that plan artifact id and adds one planner decision-trace line

You can inspect the summary through `GET /missions/:missionId`.
The persisted plan artifact currently lives in the database evidence ledger, so local DB inspection should show:

```text
artifacts.kind = 'plan'
artifacts.task_id = <planner-task-id>
artifacts.uri = pocket-cto://missions/<mission-id>/tasks/<task-id>/plan
```

Planner execution remains strictly read-only in this milestone.
The worker should not request or attempt file mutation, patch application, installs, formatter runs, or git changes.

## Executor Guardrails Note

After M1.5, the later successful executor worker tick now does more than “read the repo”:

- it resolves the latest relevant planner `plan` artifact before execution
- it runs with a `workspaceWrite` turn policy rooted at the executor workspace
- it validates local changes with changed-path capture plus `git diff --check`
- it updates `mission_tasks.summary` with a concise change and validation summary

If `mission.spec.constraints.allowedPaths` is non-empty, every changed file must stay under one of those paths relative to the executor workspace root.
If the executor changes an out-of-scope path, makes no file changes at all, or `git diff --check` fails, the task now ends `failed` with an explicit summary instead of silently succeeding.
If a post-turn planner evidence or executor validation step fails after the runtime turn already completed, the task still terminalizes, clears `codexTurnId`, and releases the workspace lease instead of remaining stranded in `running`.

This is still a narrow local-only executor slice.

- M1.5 ends with controlled workspace mutation and local validation hooks
- M1.6 will add approval persistence
- M1.7 adds richer runtime-to-evidence artifact plumbing

```bash
curl -i "http://localhost:4000/missions/$MISSION_ID"
```

Expected status: `200 OK`

Expected task state change:

```json
{
  "tasks": [
    {
      "sequence": 0,
      "role": "planner",
      "status": "claimed",
      "attemptCount": 1
    },
    {
      "sequence": 1,
      "role": "executor",
      "status": "pending",
      "attemptCount": 0
    }
  ]
}
```

Inspect replay after the worker tick:

```bash
curl -i "http://localhost:4000/missions/$MISSION_ID/events"
```

Expected new tail event:

```json
{
  "sequence": 6,
  "type": "task.status_changed",
  "payload": {
    "from": "pending",
    "to": "claimed",
    "reason": "worker_claimed"
  }
}
```

## Executor Evidence Placeholder Note

After M1.7, a successful executor worker tick now persists more than replay and
`mission_tasks.summary`:

- `artifacts.kind = 'diff_summary'` captures changed-path and local diff posture
- `artifacts.kind = 'test_report'` captures local executor validation results as a placeholder verification artifact
- terminalized executor failures can also persist `artifacts.kind = 'log_excerpt'`
- replay appends one `artifact.created` entry for each persisted runtime artifact
- the proof-bundle manifest moves to `status = 'ready'` once runtime evidence artifacts exist and references their artifact ids

Local DB inspection should show deterministic URIs of the form:

```text
pocket-cto://missions/<mission-id>/tasks/<task-id>/diff-summary
pocket-cto://missions/<mission-id>/tasks/<task-id>/test-report
pocket-cto://missions/<mission-id>/tasks/<task-id>/log-excerpt
```

M2.4 now adds a real GitHub publish path for successful executor runs.
When GitHub App env is configured and the mission resolves to an active synced
repository row, Pocket CTO can now:

- commit validated executor changes locally on the deterministic task branch
- push that branch through the GitHub App installation token
- open a draft pull request against the repository registry `defaultBranch`
- persist `artifacts.kind = 'pr_link'` and append one more `artifact.created` replay entry

The `pr_link` artifact stores the draft PR URL as its `uri` and keeps additive
metadata such as `repoFullName`, `branchName`, `prNumber`, `baseBranch`,
`headBranch`, `draft`, and `publishedAt`.

For a long-running local worker loop instead of a single tick:

```bash
WORKER_POLL_INTERVAL_MS=5000 pnpm dev:worker
```

M0 intentionally stops here. The mission remains `queued`, the worker only
claims one runnable task per tick, and M1 will attach Codex thread plus turn
lifecycle to claimed tasks before mission `queued -> running` begins.

Invalid body requests must return a stable `400` shape:

```bash
curl -i http://localhost:4000/missions/text \
  -H 'content-type: application/json' \
  -d '{"text":""}'
```

Expected status: `400 Bad Request`

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Invalid request",
    "details": [
      {
        "path": "text",
        "message": "String must contain at least 1 character(s)"
      }
    ]
  }
}
```

Invalid UUID params must also return a stable `400` shape:

```bash
curl -i http://localhost:4000/missions/not-a-uuid
curl -i http://localhost:4000/missions/not-a-uuid/events
```

Expected status: `400 Bad Request`

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Invalid request",
    "details": [
      {
        "path": "missionId",
        "message": "Invalid uuid"
      }
    ]
  }
}
```

Unknown mission IDs must return a stable `404` shape:

```bash
curl -i http://localhost:4000/missions/11111111-1111-4111-8111-111111111111
curl -i http://localhost:4000/missions/11111111-1111-4111-8111-111111111111/events
```

Expected status: `404 Not Found`

```json
{
  "error": {
    "code": "mission_not_found",
    "message": "Mission not found"
  }
}
```

## Test database setup

DB-backed tests must use a dedicated test database.
They resolve `TEST_DATABASE_URL` first and otherwise derive a safe default by
switching the `DATABASE_URL` database name to a `*_test` suffix.
The test helper refuses to run against a non-test database name.

Create the local test database once:

```bash
psql postgres://postgres:postgres@localhost:5432/postgres \
  -c 'CREATE DATABASE pocket_cto_test;'
```

Then keep this in `.env`:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/pocket_cto
TEST_DATABASE_URL=postgres://postgres:postgres@localhost:5432/pocket_cto_test
```

Apply the schema to both databases:

```bash
pnpm db:migrate
DATABASE_URL=postgres://postgres:postgres@localhost:5432/pocket_cto_test \
  pnpm db:migrate
```

With that in place, DB-backed control-plane tests can run safely:

```bash
pnpm --filter @pocket-cto/control-plane test
```

## Notes

The worker and API entrypoints live in the same `apps/control-plane` package but run as separate scripts.
That keeps the repo simple while preserving process boundaries.

## GitHub App and webhook setup (M2.1 / M2.2)

Pocket CTO now has a real GitHub App auth surface plus webhook ingress.
This path stays GitHub App-only.
Do not use PATs or `gh` CLI shortcuts for the control-plane integration path.

Required now for live installation sync:

- `GITHUB_APP_ID`
- `GITHUB_APP_PRIVATE_KEY_BASE64`

Required now for live webhook ingress:

- `GITHUB_WEBHOOK_SECRET`

Optional for later slices:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

Local setup steps:

1. Create or reuse a GitHub App and install it on the target owner or repository.
2. Copy the app id into `GITHUB_APP_ID`.
3. Base64-encode the downloaded private-key PEM into one line and copy it into `GITHUB_APP_PRIVATE_KEY_BASE64`.
4. Choose a webhook secret in the GitHub App settings and copy the same value into `GITHUB_WEBHOOK_SECRET`.

On macOS the private-key step looks like:

```bash
base64 -i path/to/pocket-cto.private-key.pem | tr -d '\n'
```

Current M2.4 permission and event expectations are:

- repository permissions expected now:
  `Metadata` read-only
  `Contents` write
  `Pull requests` write
- webhook events currently consumed in code: `installation`, `installation_repositories`, `issues`, `issue_comment`
- `issues` and `issue_comment` are durably accepted as ingress envelopes only; they do not create missions yet
- issue-to-mission intake is still a future milestone

Once the control-plane API is running, the current GitHub debug and ingress surface is:

```bash
curl -i http://localhost:4000/github/installations
curl -i -X POST http://localhost:4000/github/installations/sync
curl -i http://localhost:4000/github/repositories
curl -i http://localhost:4000/github/repositories/616xold/pocket-cto
curl -i http://localhost:4000/github/installations/12345/repositories
curl -i -X POST http://localhost:4000/github/repositories/sync
curl -i -X POST http://localhost:4000/github/installations/12345/repositories/sync
curl -i http://localhost:4000/github/webhooks/deliveries
curl -i http://localhost:4000/github/webhooks/deliveries/local-delivery-1
```

```text
GET /github/installations
POST /github/installations/sync
GET /github/repositories
GET /github/repositories/:owner/:repo
GET /github/installations/:installationId/repositories
POST /github/repositories/sync
POST /github/installations/:installationId/repositories/sync
POST /github/webhooks
GET /github/webhooks/deliveries
GET /github/webhooks/deliveries/:deliveryId
```

When the GitHub App auth env is configured, the installation sync route fetches current installations from GitHub and upserts them into Postgres.
The repository sync routes mint installation access tokens through the same GitHub App cache and call GitHub `GET /installation/repositories` to reconcile the durable repository registry.
When those env vars are missing, the sync routes return a machine-readable `github_app_not_configured` error instead of silently falling back to PATs.
When the installation id in an installation-scoped repository route is unknown, the route returns `github_installation_not_found`.
When `GITHUB_WEBHOOK_SECRET` is missing, `POST /github/webhooks` returns `github_webhook_not_configured`.

### Repository registry routes

The M2.3 repository registry is intentionally one small, durable read surface.
Use it to inspect which repositories Pocket CTO currently believes each installation can see:

- `GET /github/repositories`
- `GET /github/repositories/:owner/:repo`
- `GET /github/installations/:installationId/repositories`

Use the sync routes when you want to reconcile that registry against GitHub:

- `POST /github/repositories/sync`
- `POST /github/installations/:installationId/repositories/sync`

Repository summaries include:

- `installationId`
- `githubRepositoryId`
- `fullName`
- `ownerLogin`
- `name`
- `defaultBranch`
- `visibility`
- `archived`
- `disabled`
- `isActive`
- `lastSyncedAt`
- `removedFromInstallationAt`

Examples:

```bash
curl -i http://localhost:4000/github/repositories
curl -i http://localhost:4000/github/repositories/616xold/pocket-cto
curl -i http://localhost:4000/github/installations/12345/repositories
curl -i -X POST http://localhost:4000/github/repositories/sync
curl -i -X POST http://localhost:4000/github/installations/12345/repositories/sync
```

Registry state semantics stay explicit:

- `isActive = true` means the latest manual sync or `installation_repositories` webhook still sees that repository for the installation.
- `isActive = false` means the latest reconciliation no longer sees the repository for that installation, but Pocket CTO keeps the row for auditability and can reactivate it later if GitHub shows it again.
- `removedFromInstallationAt` records when Pocket CTO most recently marked the repository inactive.

Write-readiness is intentionally narrower than simple visibility:

- `GET /github/repositories/:owner/:repo` returns one repository summary plus a `writeReadiness` object.
- `writeReadiness.ready = true` means Pocket CTO can deterministically use that repository as a future GitHub App write target.
- `writeReadiness.failureCode = inactive` means the registry row exists but the latest reconciliation no longer sees it for the installation.
- `writeReadiness.failureCode = archived` means GitHub still reports the repository as archived.
- `writeReadiness.failureCode = disabled` means GitHub still reports the repository as disabled.
- `writeReadiness.failureCode = installation_unavailable` means the repository row exists, but Pocket CTO no longer has a persisted installation record it can use for installation-token minting.

### Branch and draft PR publish

Executor publish now happens after local validation, not inside the model turn.
The current M2.4 write path is:

1. resolve one writable repository from mission context and the durable repository registry
2. keep the existing deterministic task branch `pocket-cto/<missionId>/<task.sequence>-<task.role>`
3. fail explicitly if that remote branch already exists
4. commit validated worktree changes locally
5. push with `git` over HTTPS using a process-local auth header derived from the installation token
6. create a draft PR against `defaultBranch`
7. persist a `pr_link` artifact and link it into the proof bundle

Local smoke coverage for this slice is the DB-backed orchestrator spec:

```bash
pnpm --filter @pocket-cto/control-plane exec vitest run \
  src/modules/orchestrator/drizzle-service.spec.ts \
  -t "publishes a successful executor run to a draft PR and persists the pr_link artifact"
```

That smoke uses a temp local git repo, a temp local worktree root, a temp bare
remote for the branch push, and mocked GitHub API calls for branch preflight and
draft PR creation.

If live GitHub App env is present and you want a manual smoke instead of the
mocked test path, make sure all of these are true first:

- `POST /github/installations/sync` has persisted the installation
- `POST /github/repositories/sync` has persisted the target repository row
- the mission `primaryRepo` matches that synced repository full name
- the repository `writeReadiness.ready` is `true`

Expected live result for a successful executor publish:

- one new remote branch with the deterministic task branch name
- one new draft PR against the registry `defaultBranch`
- one persisted `pr_link` artifact
- one extra `artifact.created` replay event for that PR artifact

### Required webhook headers

Pocket CTO expects GitHub-style JSON webhook requests with these headers:

- `Content-Type: application/json`
- `X-GitHub-Delivery`
- `X-GitHub-Event`
- `X-Hub-Signature-256`

Missing `X-GitHub-Delivery`, `X-GitHub-Event`, or `X-Hub-Signature-256` returns a machine-readable `400`.
An invalid signature returns a machine-readable `401`.

### Read-only delivery debug routes

Persisted webhook deliveries are now inspectable without querying Postgres manually.
The read surface stays compact and summary-shaped:

- `GET /github/webhooks/deliveries`
- `GET /github/webhooks/deliveries/:deliveryId`

Optional query filters on the list route:

- `eventName`
- `handledAs`
- `installationId`

Each delivery summary includes:

- `deliveryId`
- `eventName`
- `action`
- `installationId`
- `handledAs`
- `receivedAt`
- `persistedAt`
- `payloadPreview`

These routes are read-only and do not return the full raw payload by default.
That keeps the debug surface small while still making `issues` and `issue_comment` envelopes inspectable during local development.

Examples:

```bash
curl -i 'http://localhost:4000/github/webhooks/deliveries?eventName=issues&handledAs=issue_envelope_recorded'
curl -i http://localhost:4000/github/webhooks/deliveries/local-delivery-1
```

### Local tunnel workflow

1. Start the API with `pnpm dev:control-plane` or the full stack with `pnpm dev`.
2. Start a public tunnel to `http://localhost:4000`.
3. Point the GitHub App webhook URL at `<public-url>/github/webhooks`.
4. Trigger an `installation`, `installation_repositories`, `issues`, or `issue_comment` event from GitHub.
5. Watch the delivery result in the GitHub App deliveries UI and the local control-plane logs.

Examples:

```bash
ngrok http 4000
```

```bash
cloudflared tunnel --url http://localhost:4000
```

### Local signed curl workflow

When you want to test the route without a public tunnel, sign the exact JSON body with the webhook secret and send it locally:

```bash
BODY='{
  "action":"created",
  "installation":{
    "id":12345,
    "app_id":98765,
    "target_id":6161234,
    "target_type":"Organization",
    "account":{"id":6161234,"login":"616xold","type":"Organization"},
    "suspended_at":null,
    "permissions":{"metadata":"read"}
  }
}'

SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$GITHUB_WEBHOOK_SECRET" -hex | sed 's/^.* //')

curl -i http://localhost:4000/github/webhooks \
  -H 'content-type: application/json' \
  -H 'x-github-delivery: local-delivery-1' \
  -H 'x-github-event: installation' \
  -H "x-hub-signature-256: sha256=$SIG" \
  --data-binary "$BODY"
```

### Safe retry and redelivery

Webhook deliveries are keyed durably by `X-GitHub-Delivery`.
Pocket CTO records the first successfully processed delivery and will not repeat side effects for the same delivery id.

For safe retries:

- in GitHub's deliveries UI, use the built-in redelivery action when you want GitHub to resend the same delivery payload and delivery id
- in local curl tests, resend the exact same body with the exact same `x-github-delivery` value to exercise the duplicate path
- a duplicate delivery returns success with `duplicate: true` instead of replaying installation or repository updates
- the debug routes make it easy to confirm the stored `handledAs`, `receivedAt`, `persistedAt`, and `payloadPreview` values after the first delivery and after any redelivery
- if you need a brand new delivery for testing, change `x-github-delivery` to a new value

## Environment variables

Document any new env var in `.env.example` immediately after adding it.
