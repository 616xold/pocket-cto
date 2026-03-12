# Codex App Server integration notes

Pocket CTO uses Codex App Server as the worker runtime.

## Mental model

- a mission contains one or more tasks
- each task can own one persisted Codex thread id
- a claimed task can temporarily own one active Codex turn id
- replay records structural runtime lifecycle, not every token delta
- approvals and file-changing execution are later milestones

M1.4 keeps the runtime surface narrow but makes planner output useful.
The worker now ensures one persisted workspace record and one deterministic local git worktree per claimed task before runtime bootstrap or turn execution starts.
Planner turns now use a dedicated read-only planner prompt assembled from the mission contract, workspace context, and repository workflow policy when `WORKFLOW.md` exists at the workspace root.
Non-planner turns still remain on the generic read-only placeholder path.
Pocket CTO does not yet create approval records, PRs, or artifact bundles beyond replay.

## Protocol alignment notes

Pocket CTO's runtime wrapper is aligned to the local Codex CLI checked on 2026-03-10 with:

- `codex app-server --help`
- `codex app-server generate-ts --out tmp/codex-app-server-schema-m1.2-polish`

The checked-in wrapper now covers the M1.2 subset needed by the control plane:

- `initialize` and `initialized`
- `thread/start`
- `thread/resume`
- `turn/start`
- `turn/completed`
- `item/started`
- `item/completed`

The generated schema also exposes `item/commandExecution/terminalInteraction` and several delta notifications.
Pocket CTO parses the small stable subset above for M1.2 and keeps replay driven by structural item start and completion events rather than token or text deltas.
For M1.4, Pocket CTO also extracts completed textual outputs from `item/completed` payloads for `plan` and `agentMessage` items so the planner task can persist a compact plan artifact without storing every token delta.

The current local wire envelope is method or id based and does not require a `jsonrpc` field.
Pocket CTO accepts both forms for safety, but writes the current stable field set used by the installed `codex` binary.

The wrapper still normalizes the repo's earlier legacy config spellings:

- `unlessTrusted` -> `untrusted`
- `workspaceWrite` -> `workspace-write`
- `readOnly` -> `read-only`
- `dangerFullAccess` -> `danger-full-access`

## Pocket CTO environment defaults

The local bootstrap env remains:

```bash
CODEX_APP_SERVER_COMMAND=codex
CODEX_APP_SERVER_ARGS=app-server
CODEX_DEFAULT_MODEL=gpt-5.2-codex
CODEX_DEFAULT_APPROVAL_POLICY=untrusted
CODEX_DEFAULT_SANDBOX=workspace-write
CODEX_DEFAULT_SERVICE_NAME=pocket-cto-control-plane
```

`CODEX_APP_SERVER_COMMAND` and `CODEX_APP_SERVER_ARGS` are parsed separately with shell-style quoting support before the process is spawned.

## Workspace cwd contract

Before runtime bootstrap or turn execution, Pocket CTO now ensures a task workspace with:

- one persisted `workspaces` row per task
- deterministic path `WORKSPACE_ROOT/<missionId>/<task.sequence>-<task.role>`
- deterministic branch `pocket-cto/<missionId>/<task.sequence>-<task.role>`
- one local git worktree created from the single pre-M2 source repo root

The source repo root is resolved from `POCKET_CTO_SOURCE_REPO_ROOT` when set.
If unset, Pocket CTO dogfoods against the current repo resolved by `git rev-parse --show-toplevel`.
If `WORKSPACE_ROOT` is unset or blank, Pocket CTO uses a sibling `<repo-name>.workspaces` directory outside that source repo.
If `WORKSPACE_ROOT` is relative, it is resolved from the source repo parent directory.
Pocket CTO rejects any workspace root that resolves to the source repo root itself or to a path nested inside it.

Runtime `cwd` now comes from the persisted workspace root, not from the control-plane process directory.
That applies to same-session bootstrap for threadless claimed tasks and to later resumed-thread or replacement-thread paths.

## Fresh-thread resume compatibility

The installed local Codex binary still exposes `thread/resume` in the generated schema, but real local behavior on March 10, 2026 has an important gap:

- session A can `thread/start` and return a thread id
- session B cannot `thread/resume` that fresh no-turn thread yet and returns `no rollout found for thread id ...`
- session B also cannot `turn/start` directly against that stored thread id and returns `thread not found: ...`

Pocket CTO therefore treats pre-first-turn recovery as a real compatibility case, not a theoretical one.
The durable task-to-thread model stays in place, but first-turn execution now avoids stranding new work on an unusable fresh thread id.

## Bootstrap and first turn

For a claimed task with `codexThreadId = null`, Pocket CTO now performs bootstrap and the first read-only turn in the same short-lived stdio session:

1. ensure the task has a persisted workspace row, lease, branch, and git worktree
2. spawn the configured Codex App Server command
3. send `initialize`
4. send `initialized`
5. send `thread/start` with `cwd = workspace.rootPath`
6. persist `mission_tasks.codex_thread_id`
7. append `runtime.thread_started`
8. send `turn/start`
9. persist `mission_tasks.codex_turn_id` on `turn/started`
10. stream structural item replay until terminal completion
11. clear `mission_tasks.codex_turn_id`
12. release the workspace lease but keep the worktree on disk
13. stop the short-lived client

This keeps new or previously threadless claimed tasks off the broken cross-session pre-turn resume path.
If bootstrap fails before `thread/start` succeeds, the task stays `claimed`, `codexThreadId` stays `null`, and no `runtime.thread_started` replay event is appended.

## M1.2 turn lifecycle contract

Once a claimed task already has `codexThreadId` and no active `codexTurnId`, Pocket CTO performs this exact sequence:

1. open a fresh short-lived client
2. send `initialize`
3. send `initialized`
4. try `thread/resume` for the persisted thread id
5. if resume fails with the known fresh-thread gap and the task has never emitted `runtime.turn_started`, try direct `turn/start`
6. if direct `turn/start` also fails with `thread not found`, start a replacement thread in that same session, atomically swap `mission_tasks.codex_thread_id`, append `runtime.thread_replaced`, then start the turn on the replacement thread
7. keep the client open through structural notifications for that turn
8. stop the client after the turn reaches terminal completion

Worker precedence is deterministic and one-task-at-a-time:

1. oldest claimed task with `codexThreadId = null`
2. then oldest claimed task with `codexThreadId != null` and `codexTurnId = null`
3. only then a newly claimed pending runnable task

Stable ordering inside each bucket is:

- `missions.created_at ASC`
- `missions.id ASC`
- `mission_tasks.sequence ASC`
- `mission_tasks.id ASC`

### Turn start mapping

When `turn/started` arrives for the matching claimed task:

1. persist `mission_tasks.codex_turn_id`
2. append `runtime.turn_started` with `recoveryStrategy`
3. if the mission is still `queued`, transition it to `running` and append `mission.status_changed` with `reason = "runtime_turn_started"`
4. transition the task `claimed -> running` and append `task.status_changed` with `reason = "runtime_turn_started"`

If the first-turn recovery path had to replace the stored thread, Pocket CTO also appends:

- `runtime.thread_replaced`

That payload includes:

- `missionId`
- `taskId`
- `oldThreadId`
- `newThreadId`
- `reasonCode = "resume_unavailable"`

### Structural item mapping

For the active turn, Pocket CTO appends:

- `runtime.item_started`
- `runtime.item_completed`

Each payload is machine-readable and includes:

- `missionId`
- `taskId`
- `threadId`
- `turnId`
- `itemId`
- `itemType`

### Terminal completion mapping

When `turn/completed` arrives:

1. append `runtime.turn_completed` with the terminal status
2. clear `mission_tasks.codex_turn_id`
3. on `status = "completed"`, transition the task `running -> succeeded` with `reason = "runtime_turn_completed"`
4. on `status = "failed"` or `status = "interrupted"`, transition the task `running -> failed` with `reason = "runtime_turn_failed"`
5. release the workspace lease but keep the worktree on disk
6. stop the short-lived client

M1.2 does not change final mission completion or approval semantics yet.
The first real turn moves the mission to `running`; later mission terminal states remain a later slice.

## Read-only safety posture

M1.4 planner turns are explicitly read-only, and all other roles remain on the generic read-only placeholder path.
Pocket CTO now does three things on purpose:

- it builds planner turn input through dedicated planner-context and planner-prompt modules
- it keeps non-planner turn input on a generic read-only placeholder module
- it overrides the turn with `approvalPolicy = "never"` and a read-only sandbox policy

The resulting planner prompt tells Codex:

- do not create, edit, rename, delete, or stage files
- do not apply patches, installs, generators, formatters, or change git state
- do not request or attempt approvals for mutating actions
- if a tool would mutate state, skip it and explain why
- return concise structured sections for objective understanding, context, risks, proposed steps, validation, and executor handoff

This is temporary and explicit.

- M1.3 now provides workspace isolation and deterministic worktree management
- M1.4 now introduces a real planner prompt and planner-output persistence
- M1.5 will introduce a real executor prompt

Until those milestones land, turn execution remains intentionally safe and read-only.

## Planner output capture

Completed planner turns still use structural lifecycle replay as the operator narrative, but M1.4 adds one narrow result-shape extension for evidence:

- `RuntimeCodexRunTurnResult.completedTextOutputs`
- `RuntimeCodexRunTurnResult.completedAgentMessages`
- `RuntimeCodexRunTurnResult.finalAgentMessageText`

`completedTextOutputs` is populated from completed `plan` and `agentMessage` items in completion order.
`completedAgentMessages` and `finalAgentMessageText` remain compatibility fields derived from the `agentMessage` subset only.
Pocket CTO does not persist token deltas or every runtime message.

Planner evidence deterministically builds the persisted planner body from completed `plan` and `agentMessage` outputs by:

- trimming empty blocks
- collapsing identical adjacent blocks
- concatenating the remaining blocks in completion order with blank lines between them

Planner artifact metadata records the capture strategy plus the ordered source item ids and types that contributed to the persisted body.

Planner evidence then uses that selected planner body to:

- derive a concise `mission_tasks.summary`
- persist one `artifacts.kind = 'plan'` row with the planner text body in metadata
- append `artifact.created` for that plan artifact
- optionally enrich the placeholder proof-bundle manifest with the new plan artifact id and one decision-trace line

## Replay contract

M1.2 runtime replay now includes:

- `runtime.thread_replaced`
- `runtime.thread_started`
- `runtime.turn_started`
- `runtime.item_started`
- `runtime.item_completed`
- `runtime.turn_completed`

Replay remains structural and compact.
Pocket CTO does not persist every token delta in M1.2.
`item/started` and `item/completed` are the source of truth for item lifecycle, while `turn/completed` is the source of truth for terminal turn state.
M1.4 planner artifact persistence reads ordered completed textual outputs from the runtime result, but replay itself remains structural and compact.
`runtime.turn_started.payload.recoveryStrategy` records whether the turn came from same-session bootstrap, a resumed thread, direct `turn/start`, or a replacement-thread fallback.
`runtime.thread_started.payload.cwd` records the workspace root used for thread bootstrap.

## Persistence contract

Task runtime state now uses:

- `mission_tasks.codex_thread_id`
- `mission_tasks.codex_turn_id`
- `mission_tasks.workspace_id`

Workspace isolation state now uses:

- `workspaces.repo`
- `workspaces.root_path`
- `workspaces.branch_name`
- `workspaces.lease_owner`
- `workspaces.lease_expires_at`
- `workspaces.is_active`

`codex_turn_id` is nullable and only populated while the task has an active turn.
The schema adds a partial unique index on non-null turn ids so one active persisted turn maps to at most one task.

## Package map

- protocol types: `packages/codex-runtime/src/protocol.ts`
- stdio client wrapper: `packages/codex-runtime/src/client.ts`
- runtime policy and read-only turn input: `apps/control-plane/src/modules/runtime-codex/`
- worker lifecycle decisions: `apps/control-plane/src/modules/orchestrator/`
- task persistence: `apps/control-plane/src/modules/missions/`

## Manual acceptance

### Fake app-server turn lifecycle

Run:

```bash
pnpm --filter @pocket-cto/codex-runtime test
pnpm --filter @pocket-cto/codex-runtime typecheck
pnpm --filter @pocket-cto/control-plane test
pnpm --filter @pocket-cto/control-plane typecheck
pnpm --filter @pocket-cto/control-plane lint
```

The protocol-level and DB-backed tests should prove:

- `thread/resume` works
- `turn/start` works
- `turn/completed` is parsed
- `item/started` and `item/completed` are parsed
- the mission moves `queued -> running` on first real turn start
- the task moves `claimed -> running -> succeeded` on successful completion
- a failing fake turn clears `codexTurnId` and marks the task failed

### Real local read-only acceptance

If the local `codex` binary is available and authenticated, run a one-off script or command that:

1. bootstraps or resumes a thread
2. starts one read-only turn
3. records the observed item lifecycle
4. confirms no file mutations were requested or attempted

Record:

- the exact command used
- the thread id
- the turn id
- the first and last runtime item types observed
- whether any file mutations were requested or attempted
