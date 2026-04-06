# EP-0003 - Bootstrap Codex App Server threads for claimed tasks

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this submilestone, a claimed mission task that does not yet have a Codex thread can start a real Codex App Server session over stdio, complete the `initialize` plus `initialized` handshake, call `thread/start`, persist the returned `codexThreadId` on the task, and append a machine-readable `runtime.thread_started` replay event.
This is the first real M1 proof that Pocket CTO can hand a persisted task to the Codex runtime without jumping ahead to turn execution, approvals, workspaces, or GitHub.

The operator-visible proof is narrow and deliberate.
After creating a queued mission and running one worker tick, the planner task should remain `claimed`, should now include a non-null `codexThreadId`, and the mission replay should include exactly one `runtime.thread_started` event for that task.

## Progress

- [x] (2026-03-10T22:18Z) Audited the runtime release-candidate worktree against the shipped M1.1 bootstrap slice and recorded the current handoff explicitly: this plan remains the historical bootstrap milestone, while the actual release-candidate behavior is now governed by `plans/EP-0005-turn-lifecycle-and-replay.md` because the real local binary cannot later-session resume a fresh no-turn thread.
- [x] (2026-03-09T19:05Z) Read `START_HERE.md`, `README.md`, `AGENTS.md`, `PLANS.md`, `plans/ROADMAP.md`, `plans/EP-0001-mission-spine.md`, the Codex runtime docs, the state machine and replay docs, and the current runtime, mission, replay, orchestrator, worker, and DB schema modules named in the prompt.
- [x] (2026-03-09T19:05Z) Verified the local Codex binary protocol surface with `codex app-server --help` and `codex app-server generate-ts --out tmp/codex-app-server-schema`, then compared the generated bindings and OpenAI's February 4, 2026 Codex App Server article against `packages/codex-runtime/src/protocol.ts` and `packages/codex-runtime/src/client.ts`.
- [x] (2026-03-09T19:21Z) Implemented the M1.1 bootstrap slice across `packages/codex-runtime`, `apps/control-plane/src/modules/runtime-codex/`, the mission repository, and the orchestrator so claimed tasks now initialize Codex App Server, start a thread, persist `codexThreadId`, and append `runtime.thread_started` without widening task or mission statuses.
- [x] (2026-03-09T19:21Z) Added focused tests covering the fake app-server bootstrap handshake, typed runtime parsing, DB-backed worker bootstrap success, duplicate-thread prevention, and the claimed-without-thread failure posture.
- [x] (2026-03-09T19:21Z) Updated docs plus the EP-0001 handoff note, created a local `.env` from `.env.example` for DB-backed validation, ran the required package commands, and completed one real local Codex bootstrap acceptance.
- [x] (2026-03-09T21:31Z) Renumbered this plan from `EP-0002` to `EP-0003` after the repo-bootstrap hygiene slice claimed `EP-0002`, and updated repo references so the Codex runtime bootstrap handoff remains unambiguous.

## Surprises & Discoveries

- Observation: The checked-in runtime protocol types are a handwritten subset that does not match the locally generated App Server bindings for the bootstrap methods.
  Evidence: `packages/codex-runtime/src/protocol.ts` defines `clientInfo` without `title`, treats `thread/start` as untyped `unknown`, models `Thread` as `{ id, title?, ephemeral?, path? }`, and omits the generated `InitializeResponse`, `ThreadStartResponse`, `ThreadStartedNotification`, and stable enums for approval policy and sandbox mode.

- Observation: The local Codex CLI still supports `codex app-server generate-ts`, so this slice can anchor protocol changes to the installed binary instead of guessing from stale examples.
  Evidence: `codex app-server generate-ts --out tmp/codex-app-server-schema` succeeded and produced `InitializeParams.ts`, `InitializeResponse.ts`, `ClientRequest.ts`, `ServerNotification.ts`, and the `v2/Thread*` plus `v2/Turn*` bindings under `tmp/codex-app-server-schema/`.

- Observation: Pocket CTO's default config is already slightly out of date with the local CLI surface.
  Evidence: `.env.example` sets `CODEX_APP_SERVER_ARGS=app-server --stdio`, but `codex app-server --help` on 2026-03-09 shows stdio is the default transport and exposes `--listen stdio://`; the generated bindings also use approval and sandbox values like `"untrusted"` and `"workspace-write"` instead of the repo's current defaults `"unlessTrusted"` and `"workspaceWrite"`.

- Observation: The current control-plane runtime adapter is only a thin getter around the low-level client, so bootstrap orchestration, env parsing, duplicate-thread checks, persistence, and replay emission do not exist yet.
  Evidence: `apps/control-plane/src/modules/runtime-codex/adapter.ts` currently exports only `RuntimeCodexAdapter.getClient()`.

- Observation: The installed Codex binary currently uses the generated method or id envelope directly and does not emit a `jsonrpc` field on real `initialize` responses.
  Evidence: the first real manual bootstrap attempt on 2026-03-09 returned `{"id":"...","result":{"userAgent":"Codex Desktop/0.108.0-alpha.12 ..."}}`, which failed until the client parser and request writer were aligned to the local stable envelope.

## Decision Log

- Decision: Use the locally generated App Server bindings as the source of truth for the M1.1 bootstrap method and notification shapes, with the current OpenAI Codex App Server docs used only as a cross-check.
  Rationale: The user explicitly asked for verification against the installed binary first, and `generate-ts` succeeded locally, so matching that surface minimizes silent drift.
  Date/Author: 2026-03-09 / Codex

- Decision: Keep low-level stdio process management and JSON-RPC parsing inside `packages/codex-runtime`, but move Pocket CTO bootstrap policy into a dedicated `runtime-codex` service in the control plane.
  Rationale: This preserves the architecture boundary from `AGENTS.md`: the runtime package knows the protocol, while the control plane decides when to initialize, how to parse env defaults, when to persist `codexThreadId`, and when to append replay.
  Date/Author: 2026-03-09 / Codex

- Decision: Accept both current stable protocol values and the repo's legacy config spellings when parsing bootstrap defaults, then normalize to the current protocol values before sending `thread/start`.
  Rationale: The repo already ships `unlessTrusted` and `workspaceWrite` defaults, and a hard break in M1.1 would create avoidable local setup failures for no product gain.
  Date/Author: 2026-03-09 / Codex

- Decision: Leave a claimed task in `claimed` with `codexThreadId = null` when bootstrap fails before `thread/start` succeeds, and append no `runtime.thread_started` event in that case.
  Rationale: This matches the prompt's temporary M1.1 failure posture and keeps retry or recovery logic out of scope until M1.2.
  Date/Author: 2026-03-09 / Codex

- Decision: Accept both the earlier JSON-RPC-style envelope and the current local envelope without `jsonrpc`, but write the current stable field set used by the installed `codex` binary.
  Rationale: `generate-ts` plus the successful local manual bootstrap showed that the current installed app server does not require `jsonrpc`, so the runtime wrapper should match the real binary while staying tolerant of earlier fixtures.
  Date/Author: 2026-03-09 / Codex

- Decision: Renumber this runtime bootstrap plan to `EP-0003`.
  Rationale: The repo already had a completed `EP-0002` hygiene plan, and keeping plan filenames unique is more important than preserving the original provisional runtime-plan number.
  Date/Author: 2026-03-09 / Codex

## Context and Orientation

The existing M0 spine already persists missions, tasks, ordered replay events, and proof-bundle placeholders.
`apps/control-plane/src/modules/orchestrator/service.ts` claims exactly one runnable task per tick and appends `task.status_changed` replay for `pending -> claimed`, while `apps/control-plane/src/modules/orchestrator/worker.ts` only logs the outcome.

The next missing boundary is the runtime handoff for claimed tasks.
That work spans two layers.
`packages/codex-runtime/` owns stdio process startup, JSON-RPC framing, method schemas, response parsing, and runtime events such as stderr lines and server notifications.
`apps/control-plane/src/modules/runtime-codex/` must own Pocket CTO bootstrap policy: parsing `CODEX_APP_SERVER_COMMAND` plus `CODEX_APP_SERVER_ARGS`, sending `initialize`, sending `initialized`, calling `thread/start`, and returning parsed thread metadata for persistence.

Persistence remains under the mission repository boundary.
`apps/control-plane/src/modules/missions/repository.ts` and `drizzle-repository.ts` currently create tasks with `codexThreadId = null` but do not expose a narrow updater for later attachment.
Replay stays explicit through `apps/control-plane/src/modules/replay/service.ts` and `packages/domain/src/replay-event.ts`.

This plan only covers M1.1.
It does not start a turn, does not create workspaces or worktrees, does not add GitHub integration, does not persist approvals, and does not widen into artifact or proof-bundle generation beyond the new replay event for thread bootstrap.

## Plan of Work

First, update `packages/codex-runtime/src/protocol.ts` so the bootstrap subset matches the local generated bindings for `initialize`, `initialized`, `thread/start`, `thread/started`, and the current `turn/start` contracts that already exist in the package.
That includes explicit request and response schemas, stable enums or unions for approval policy and sandbox mode, and parsed thread metadata instead of `unknown`.

Next, harden `packages/codex-runtime/src/client.ts` into a reusable stdio client for real bootstrap.
The client needs idempotent `start()`, graceful `stop()`, safe line-based JSON parsing, rejection of pending requests if the child exits, and emitted events for stderr plus server notifications.
Bootstrap-facing methods should return parsed initialize and thread-start results, not raw `unknown`.

Then add a dedicated control-plane bootstrap service under `apps/control-plane/src/modules/runtime-codex/`.
That service should build the runtime client from env, normalize bootstrap defaults, initialize the app server, call `thread/start`, and return parsed thread metadata without starting a turn.
The orchestrator should use that service after a task is claimed, skip bootstrap if `codexThreadId` already exists, persist the thread id through a small additive mission-repository method, and append `runtime.thread_started` only after persistence succeeds.

Finally, add focused tests at both layers, update `docs/ops/codex-app-server.md` with the exact Pocket CTO bootstrap contract, make the smallest EP-0001 handoff update needed, and record manual acceptance evidence here.

The intended edit surface for this slice is:

- `plans/EP-0003-codex-runtime-bootstrap.md`
- `plans/EP-0001-mission-spine.md`
- `docs/ops/codex-app-server.md`
- `packages/codex-runtime/src/protocol.ts`
- `packages/codex-runtime/src/client.ts`
- `packages/codex-runtime/src/protocol.spec.ts`
- `packages/codex-runtime/src/index.ts`
- `packages/domain/src/replay-event.ts`
- `packages/domain/src/index.ts`
- `apps/control-plane/src/bootstrap.ts`
- `apps/control-plane/src/lib/types.ts`
- `apps/control-plane/src/modules/missions/repository.ts`
- `apps/control-plane/src/modules/missions/drizzle-repository.ts`
- `apps/control-plane/src/modules/missions/repository-mappers.ts` if needed for new persistence reads
- `apps/control-plane/src/modules/orchestrator/service.ts`
- `apps/control-plane/src/modules/orchestrator/worker.ts`
- `apps/control-plane/src/modules/orchestrator/drizzle-service.spec.ts`
- `apps/control-plane/src/modules/runtime-codex/adapter.ts`
- `apps/control-plane/src/modules/runtime-codex/` new bootstrap-oriented modules and tests
- `.env.example` and `packages/config/src/index.ts` only if bootstrap-default normalization or documentation needs explicit support

There is no planned impact on `WORKFLOW.md`, stack packs, GitHub App permissions, or webhook expectations in this slice.

## Concrete Steps

Run these commands from the repository root as needed:

    codex app-server --help
    mkdir -p tmp/codex-app-server-schema
    codex app-server generate-ts --out tmp/codex-app-server-schema
    pnpm --filter @pocket-cto/codex-runtime test
    pnpm --filter @pocket-cto/codex-runtime typecheck
    pnpm --filter @pocket-cto/control-plane test
    pnpm --filter @pocket-cto/control-plane typecheck
    pnpm --filter @pocket-cto/control-plane lint

Implementation order:

1. Update this ExecPlan with the protocol gap analysis, scope, decisions, and acceptance criteria.
2. Align the runtime protocol schemas and client methods in `packages/codex-runtime`.
3. Add a small fake app-server fixture test proving `initialize` plus `thread/start`.
4. Add a dedicated bootstrap service under `apps/control-plane/src/modules/runtime-codex/`.
5. Extend the mission repository with a narrow `codexThreadId` attachment method.
6. Integrate bootstrap into the orchestrator flow after task claim without widening task or mission statuses.
7. Add DB-backed control-plane tests for success, duplicate-thread prevention, and bootstrap failure posture.
8. Update docs and the EP-0001 handoff note.
9. Run the required validation commands and, if the local Codex binary is usable, do one real manual bootstrap acceptance.

## Validation and Acceptance

These checks remain the acceptance evidence for the narrow M1.1 bootstrap slice only.
The current runtime release candidate has advanced under `plans/EP-0005-turn-lifecycle-and-replay.md`: newly claimed or threadless tasks now bootstrap and start the first read-only turn in the same short-lived session because the real local binary does not yet support cross-session resume or direct `turn/start` for a fresh no-turn thread.

Success for M1.1 is demonstrated when all of the following are true:

1. A protocol-level fake app-server test shows the runtime client can:
   - start a stdio child once
   - send `initialize` with `clientInfo.name`, `clientInfo.title`, and `clientInfo.version`
   - send `initialized`
   - parse a typed `thread/start` response
   - surface server notifications and stderr lines
2. A control-plane DB-backed test shows one worker tick on a queued mission:
   - claims the planner task
   - bootstraps a Codex thread
   - persists `codexThreadId`
   - leaves the task state at `claimed`
   - appends exactly one `runtime.thread_started` replay event
3. A control-plane test proves a claimed task with an existing `codexThreadId` does not start another thread.
4. A control-plane test proves bootstrap failure before thread creation leaves the task `claimed`, `codexThreadId = null`, and appends no `runtime.thread_started` replay event.
5. `docs/ops/codex-app-server.md` describes the exact Pocket CTO bootstrap contract and manual acceptance commands for both the fake app server and a real local Codex binary.

Manual acceptance should include:

    pnpm --filter @pocket-cto/codex-runtime test
    pnpm --filter @pocket-cto/codex-runtime typecheck
    pnpm --filter @pocket-cto/control-plane test
    pnpm --filter @pocket-cto/control-plane typecheck
    pnpm --filter @pocket-cto/control-plane lint

If the local binary is available, also run one real bootstrap script or test invocation and record:

- the exact command used
- whether `initialize` succeeded
- the returned thread id

## Idempotence and Recovery

The runtime client should make `start()` and `stop()` safe to call more than once.
If the child process exits unexpectedly, all pending requests must reject so the control-plane service can fail fast instead of hanging.

Bootstrap retries are intentionally simple in M1.1.
If the worker already claimed a task and bootstrap fails before `thread/start` returns successfully, leave the task as `claimed` with no thread id and no `runtime.thread_started` replay.
This makes a later explicit retry path possible without inventing broad retry machinery here.

If the worker sees a claimed task that already has `codexThreadId`, it must skip thread creation and avoid appending a duplicate replay event.
Rollback for this slice is additive: revert the runtime bootstrap integration and the new replay payload type, then rerun the test suite.
No destructive schema migration is expected.

## Artifacts and Notes

Protocol gap notes captured during planning:

- Local CLI help on 2026-03-09 exposes `codex app-server [OPTIONS] [COMMAND]` with `generate-ts` and default stdio transport.
- Generated `InitializeParams` expects `clientInfo: { name, title, version }` and `capabilities: { experimentalApi, optOutNotificationMethods? } | null`.
- Generated `InitializeResponse` is `{ userAgent: string }`.
- Generated `ThreadStartParams` includes typed fields such as `model`, `cwd`, `approvalPolicy`, `sandbox`, `serviceName`, `ephemeral`, `experimentalRawEvents`, and `persistExtendedHistory`.
- Generated `ThreadStartResponse` is `{ thread, model, modelProvider, serviceTier, cwd, approvalPolicy, sandbox, reasoningEffort }`.
- Generated server notifications include `thread/started` and `turn/started`.
- OpenAI's February 4, 2026 article confirms the intended bootstrap sequence `initialize -> initialized -> thread/start -> turn/start` for app connectivity, which matches the repo's staged M1.1 then M1.2 split.

Evidence expectations for this slice:

- replay includes an explicit `runtime.thread_started` event payload with `threadId`, `taskId`, and known runtime metadata
- docs show the exact bootstrap request path
- tests prove both success and the temporary failure posture

Validation evidence captured during implementation:

- `pnpm --filter @pocket-cto/codex-runtime test` passed after the runtime fixture test proved `initialize`, `initialized`, `thread/start`, `thread/started`, stderr events, and client start idempotence.
- `pnpm --filter @pocket-cto/codex-runtime typecheck` passed after aligning the runtime protocol and client types with the local app-server bindings.
- `pnpm --filter @pocket-cto/control-plane test` passed with 17 tests, including the new DB-backed orchestrator cases for success, duplicate-thread prevention, and bootstrap failure posture.
- `pnpm --filter @pocket-cto/control-plane typecheck` passed after rebuilding the referenced workspace packages and adding the new repository method to the rollback-only mission-repository test double.
- `pnpm --filter @pocket-cto/control-plane lint` passed after the runtime-codex modules, orchestrator integration, and docs-adjacent config changes landed.
- Real local bootstrap acceptance passed with:
  - command: `pnpm exec tsx --eval '(async () => { ... new CodexAppServerClient({ command: "codex", args: ["app-server"] }) ... })();'`
  - `initialize` succeeded with `userAgent = "Codex Desktop/0.108.0-alpha.12 (Mac OS 15.7.4; arm64) dumb (pocket-cto-control-plane; 0.1.0)"`
  - returned `threadId = "019cd40b-75c7-7db0-8b99-014b2260bf6c"`

## Interfaces and Dependencies

Important interfaces and modules for this slice:

- `CodexAppServerClient` in `packages/codex-runtime/src/client.ts`
- bootstrap protocol schemas in `packages/codex-runtime/src/protocol.ts`
- replay contracts in `packages/domain/src/replay-event.ts`
- `MissionRepository` in `apps/control-plane/src/modules/missions/repository.ts`
- `OrchestratorService` and `OrchestratorWorker` in `apps/control-plane/src/modules/orchestrator/`
- new bootstrap service under `apps/control-plane/src/modules/runtime-codex/`
- `ReplayService.append()` in `apps/control-plane/src/modules/replay/service.ts`

Important runtime dependencies:

- `zod` for protocol parsing
- Node `child_process` for stdio transport
- `eventemitter3` for runtime event emission
- `drizzle-orm` for DB-backed task persistence
- `vitest` for protocol-level and control-plane tests

Important environment variables:

- `CODEX_APP_SERVER_COMMAND`
- `CODEX_APP_SERVER_ARGS`
- `CODEX_DEFAULT_MODEL`
- `CODEX_DEFAULT_APPROVAL_POLICY`
- `CODEX_DEFAULT_SANDBOX`
- existing database and worker env values already used by the control plane

## Outcomes & Retrospective

M1.1 landed as a narrow runtime bootstrap slice instead of a partial turn-execution slice.
The worker now claims exactly one runnable task, calls a dedicated control-plane bootstrap service, initializes a short-lived Codex App Server session, sends `initialized`, starts a thread, persists `mission_tasks.codex_thread_id`, and appends a machine-readable `runtime.thread_started` replay event.

The boundary stayed within the intended modules.
Low-level process management and protocol parsing live in `packages/codex-runtime`.
Control-plane runtime policy lives under `apps/control-plane/src/modules/runtime-codex/`.
Task persistence stayed behind the mission repository boundary, and the worker entrypoint remained thin.

The most important late discovery was the real local wire format.
The locally installed `codex` binary omits `jsonrpc` on the wire even though the earlier wrapper assumed JSON-RPC strictly, so the final client now matches the actual installed binary and the manual bootstrap acceptance succeeded against it.

The main remaining gap to M1.2 is turn lifecycle and longer-lived runtime state.
Pocket CTO can now create and persist Codex threads for claimed tasks, but it does not yet start turns, map runtime item events into replay, persist approvals, recover orphaned threads after post-start persistence failures, or move missions from `queued` to `running`.

That statement is now historical.
The current runtime release candidate has since landed those M1.2 lifecycle changes in `plans/EP-0005-turn-lifecycle-and-replay.md`, including same-session first-turn bootstrap, `codexTurnId` persistence, structural item replay, and the narrow pre-first-turn replacement fallback for the real local fresh-thread resume gap.
