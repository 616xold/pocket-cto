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
pnpm dev:worker   # optional until runtime execution work lands
```

## CI environment

GitHub Actions does not commit or generate a repo `.env` file.
CI runs on branch pushes, pull requests, and manual `workflow_dispatch` reruns so branch work shows status before it reaches `main`.
CI injects the required config env directly in the workflow, provisions a Postgres service, creates both `pocket_cto` and `pocket_cto_test`, and migrates both databases before running tests.
Use `pnpm ci:static` and `pnpm ci:integration-db` locally when you want to mirror the GitHub Actions path from a clean checkout.
Use `pnpm ci:repro:current` when you need a temp worktree that applies the exact current unstaged snapshot and then runs the same CI commands from scratch.
Those CI scripts expect runner-style env to be present in the shell; `.env` stays local-only for development and should remain uncommitted.
Local development still uses `cp .env.example .env`.

## Git and repo hygiene

Before making the first commit in a fresh checkout:

```bash
cp .env.example .env
pnpm repo:hygiene
```

Keep `pnpm-lock.yaml`, `packages/db/drizzle/*.sql`, `packages/db/drizzle/meta/**`, and `apps/web/next-env.d.ts` committed.
Do not commit local runtime artifacts such as `node_modules/`, `dist/`, `.next/`, `.workspaces/`, `artifacts-local/`, logs, or machine-local env files.

## Workspace isolation

Before M2 GitHub integration lands, Pocket CTO manages exactly one local source repo root for workspace creation.
Set `POCKET_CTO_SOURCE_REPO_ROOT` to an absolute local git repo path when you want the worker to operate on another checkout.
If it is unset, the worker dogfoods against the current repo root resolved by `git rev-parse --show-toplevel`.

Worktrees are created under `WORKSPACE_ROOT`, which defaults to `.workspaces`.
Each claimed task uses a deterministic path of the form:

```text
.workspaces/<mission-id>/<task.sequence>-<task.role>
```

To inspect created worktrees:

```bash
git -C "${POCKET_CTO_SOURCE_REPO_ROOT:-$(git rev-parse --show-toplevel)}" worktree list
find .workspaces -maxdepth 2 -mindepth 2 -type d
```

## Running specific apps

```bash
pnpm dev:control-plane
pnpm dev:web
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
  }
}
```

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

## Environment variables

Document any new env var in `.env.example` immediately after adding it.
