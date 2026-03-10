# EP-0005 - Map Codex turns and structural item replay for claimed tasks

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this change, Pocket CTO can take a previously claimed mission task, either bootstrap a fresh Codex thread or resume a persisted one, start exactly one short-lived read-only turn, observe the structural turn and item lifecycle from Codex App Server, persist the active turn id, and append machine-readable replay events that show what the runtime actually did.
The operator-visible proof is concrete: a queued mission can advance to `running` only when the first real turn starts, a task can move `claimed -> running -> succeeded` or `claimed -> running -> failed` based on terminal turn outcomes, replay shows `runtime.turn_started`, `runtime.item_started`, `runtime.item_completed`, and `runtime.turn_completed`, and the task record stores both `codexThreadId` and the currently active `codexTurnId` while the turn is in flight.

This slice is intentionally narrow.
It does not create workspaces, worktrees, Git branches, approvals, PRs, or artifact generation beyond replay.
The turn input must stay explicitly read-only so M1.2 proves runtime control semantics without smuggling real file mutation into the system before M1.3 through M1.5 land.

## Progress

- [x] (2026-03-10T22:33Z) Ran the broader release-candidate gates `pnpm ci:static` and `pnpm ci:integration-db`. Both completed the substantive runtime checks and then failed only at the repo-level `ci:clean-tree` guard because this runtime slice is intentionally still uncommitted while the staging boundary is being audited.
- [x] (2026-03-10T22:18Z) Audited the full dirty runtime worktree for release-candidate staging, classified the runtime commit boundary, confirmed the fake fixture remains the default test runtime, and identified only one narrow remaining drift item: `plans/EP-0003-codex-runtime-bootstrap.md` needed an explicit historical handoff note so the current same-session first-turn behavior is not mistaken for the older M1.1 bootstrap-only posture.
- [x] (2026-03-10T22:10Z) Re-ran the required package validation commands and refreshed manual acceptance evidence for the compatibility-polish prompt. The current worktree still satisfies the observed real-runtime gap without additional runtime-code edits, so this pass only updated the active ExecPlan after confirming the fake and real read-only first-turn paths still complete through same-session bootstrap.
- [x] (2026-03-10T10:52Z) Re-read the required repo docs, plans, runtime wrappers, mission persistence modules, orchestrator modules, and fake app-server fixture for the M1.2 compatibility-polish prompt, then re-verified the local binary with `codex app-server --help`, `codex app-server generate-ts --out tmp/codex-app-server-schema-m1.2-polish`, and fresh no-turn cross-session probes before deciding whether any runtime code still needed to move.
- [x] (2026-03-10T00:48Z) Re-ran the real local runtime verification with `codex app-server --help`, `codex app-server generate-ts --out tmp/codex-app-server-schema-m1.2-polish`, and two raw stdio probes for `thread/start` in session A followed by `thread/resume` or direct `turn/start` in session B against a fresh no-turn thread.
- [x] (2026-03-10T01:07Z) Confirmed the installed local binary still rejects both cross-session `thread/resume` (`no rollout found for thread id ...`) and direct `turn/start` (`thread not found: ...`) for a fresh no-turn thread, then narrowed the implementation to same-session first-turn bootstrap plus a pre-first-turn replacement fallback.
- [x] (2026-03-10T01:09Z) Split the control-plane runtime path into `runtime-codex/service.ts`, `runtime-codex/turn-lifecycle.ts`, `runtime-codex/resume-fallback.ts`, `orchestrator/service.ts`, and `orchestrator/runtime-phase.ts`, added typed request-error handling in `packages/codex-runtime`, and introduced replay-backed first-turn detection plus compare-and-swap thread replacement.
- [x] (2026-03-10T01:10Z) Added `runtime.thread_replaced` replay typing and migration `packages/db/drizzle/0003_overrated_tana_nile.sql`, updated the fake app-server fixture for resume-gap simulation, and expanded protocol plus DB-backed tests for same-session bootstrap, direct `turn/start` fallback, replacement-thread fallback, and the no-replacement-after-prior-turn guard.
- [x] (2026-03-10T01:10Z) Rebuilt `@pocket-cto/domain`, `@pocket-cto/db`, and `@pocket-cto/codex-runtime` declarations after the additive contract changes so `@pocket-cto/control-plane` typecheck sees the new replay enums and runtime exports.
- [x] (2026-03-10T01:14Z) Re-ran `pnpm db:generate`, `pnpm db:migrate`, `DATABASE_URL=postgres://postgres:postgres@localhost:5432/pocket_cto_test pnpm --filter @pocket-cto/db db:migrate`, `pnpm --filter @pocket-cto/codex-runtime test`, `pnpm --filter @pocket-cto/codex-runtime typecheck`, `pnpm --filter @pocket-cto/control-plane test`, `pnpm --filter @pocket-cto/control-plane typecheck`, and `pnpm --filter @pocket-cto/control-plane lint` after the compatibility fix and migration.
- [x] (2026-03-10T01:14Z) Ran one manual fake-fixture acceptance and one manual real local `codex app-server` acceptance through the control-plane path. Both completed a first read-only turn via same-session bootstrap without requiring `thread/resume`.
- [x] (2026-03-09T22:07Z) Read the required repository docs, runtime docs, architecture docs, active plans, runtime protocol/client modules, mission and replay domain contracts, DB schema, orchestrator modules, runtime-codex modules, and fake app-server fixture named in the prompt.
- [x] (2026-03-09T22:07Z) Verified the installed Codex App Server surface with `codex app-server --help` and `codex app-server generate-ts --out tmp/codex-app-server-schema-m1.2`, then compared the generated bindings plus the current official Codex protocol article against the repo's M1.1 runtime wrapper for `thread/resume`, `turn/start`, `turn/completed`, `item/started`, `item/completed`, and terminal-interaction or delta notifications.
- [x] (2026-03-09T22:10Z) Created this ExecPlan with the verified gap analysis, edit surface, additive persistence design, validation commands, and recovery posture for M1.2.
- [x] (2026-03-09T22:19Z) Expanded `packages/codex-runtime` and the fake app-server fixture for `thread/resume`, `turn/completed`, `item/started`, `item/completed`, and small terminal-interaction coverage, then updated the protocol-level fixture tests to prove resume plus structural turn lifecycle parsing without a real `codex` binary.
- [x] (2026-03-09T22:28Z) Added additive `mission_tasks.codex_turn_id` persistence with a partial unique index, generated `packages/db/drizzle/0002_nifty_khan.sql`, applied the migration to both the local dev and test databases, and updated mission repository mappings plus helpers for claimed-task precedence and active-turn attachment or clearing.
- [x] (2026-03-09T22:35Z) Reworked the control-plane orchestrator and runtime-codex modules so the worker now prioritizes claimed recovery buckets, bootstraps threads on one tick, runs one read-only resumed turn on a later tick, persists `codexTurnId` at `turn/started`, maps structural item replay, and clears terminal turn state while updating mission and task statuses.
- [x] (2026-03-09T22:38Z) Added focused in-memory and DB-backed control-plane coverage for precedence, active-turn persistence, successful turn lifecycle replay, and failing terminal turn handling, then passed the required package test, typecheck, and lint commands.
- [x] (2026-03-09T22:38Z) Updated the ops doc and M0 handoff note to reflect the M1.2 lifecycle and explicit read-only safety posture.
- [x] (2026-03-09T22:23Z) Ran one manual control-plane acceptance against the fake app-server fixture and one additional read-only control-plane acceptance against the real local `codex` binary. The fake path completed successfully with structural replay; the real path bootstrapped a thread but failed on `thread/resume` because the installed CLI returned `no rollout found for thread id ...` for a freshly bootstrapped no-turn thread.

## Surprises & Discoveries

- Observation: The tracked plans directory already contains `plans/EP-0004-ci-hermetic-hardening.md`, so the next free ExecPlan number in the current repo state is `EP-0005`, not `EP-0004` as stated in the prompt.
  Evidence: `ls -1 plans` shows `EP-0001`, `EP-0002`, `EP-0003`, and `EP-0004-ci-hermetic-hardening.md`.

- Observation: The installed Codex App Server schema already exposes the exact lifecycle surface M1.2 needs: `thread/resume`, `turn/start`, `turn/completed`, `item/started`, `item/completed`, and `item/commandExecution/terminalInteraction`.
  Evidence: `tmp/codex-app-server-schema-m1.2/ClientRequest.ts`, `tmp/codex-app-server-schema-m1.2/ServerNotification.ts`, and the generated `v2/*` bindings for `ThreadResume*`, `Turn*`, and `Item*`.

- Observation: The repo's M1.1 runtime wrapper stops short of the terminal turn lifecycle and structural item notifications even though `turn/start` already exists at the client method layer.
  Evidence: `packages/codex-runtime/src/protocol.ts` currently parses `thread/started`, `turn/started`, and `error`, but not `turn/completed`, `item/started`, or `item/completed`.

- Observation: The worker currently only considers `pending` tasks and therefore cannot prioritize already claimed tasks that need a thread bootstrap or a new turn before claiming fresh work.
  Evidence: `apps/control-plane/src/modules/missions/drizzle-repository.ts` implements `claimNextRunnableTask()` with `mission_tasks.status = 'pending'`, and `apps/control-plane/src/modules/orchestrator/service.ts` only handles the freshly claimed result.

- Observation: Once the first turn starts and the mission transitions to `running`, later pending tasks would stop being claimable unless the runnable-task rule was widened beyond `queued`.
  Evidence: the first in-memory precedence spec failed until both `isTaskRunnable()` and the Drizzle pending-task query accepted missions in `queued` or `running`.

- Observation: The installed local Codex binary on 2026-03-09 does not currently resume a freshly bootstrapped thread that has never completed a turn.
  Evidence: manual raw-protocol probes and the real read-only control-plane acceptance both returned `{"error":{"code":-32600,"message":"no rollout found for thread id ..."}}` on `thread/resume` immediately after `thread/start` in a later short-lived session.

- Observation: The same installed local binary also rejects direct `turn/start` in a later short-lived session against that same fresh no-turn thread.
  Evidence: the explicit March 10, 2026 probe returned `{"error":{"code":-32600,"message":"thread not found: ..."}}` after session A `thread/start` and session B direct `turn/start`.

- Observation: `z.object({ result: z.unknown() })` in the low-level protocol wrapper was not sufficient to require the presence of the `result` key.
  Evidence: the first `resume-gap-direct-turn-success` fixture test misclassified a JSON-RPC error as a success with `result = undefined` until `JsonRpcSuccessSchema` added an explicit own-property check.

## Decision Log

- Decision: Use `mission_tasks.codex_turn_id` as the active-turn persistence shape, with a partial unique index on non-null values.
  Rationale: The user explicitly preferred this additive design, and one active turn per task is a narrow, inspectable state shape that keeps runtime lifecycle persistence in the task record until broader workspace or approval tables exist.
  Date/Author: 2026-03-09 / Codex

- Decision: Preserve unique ExecPlan numbering by creating this plan as `EP-0005`.
  Rationale: Overwriting or renaming the existing tracked `EP-0004-ci-hermetic-hardening.md` would trample unrelated work and create unnecessary cross-plan churn.
  Date/Author: 2026-03-09 / Codex

- Decision: Treat structural item lifecycle events, not token or text delta notifications, as the replay source of truth for M1.2.
  Rationale: The milestone goal is control semantics and replay legibility, not full-fidelity streaming. `item/started` plus `item/completed` are stable, machine-readable, and compact enough for evaluation.
  Date/Author: 2026-03-09 / Codex

- Decision: Keep the runtime connection short-lived but open through terminal turn completion.
  Rationale: The prompt forbids a daemonized long-lived connection, but M1.2 still needs to observe the lifecycle of one turn and its structural items end to end.
  Date/Author: 2026-03-09 / Codex

- Decision: Make M1.2 turn inputs explicitly read-only in a dedicated builder module under `apps/control-plane/src/modules/runtime-codex/`.
  Rationale: Prompt safety is part of the milestone contract, and burying the text inline in orchestrator code would make later M1.4 and M1.5 replacement harder and less auditable.
  Date/Author: 2026-03-09 / Codex

- Decision: Transition mission `queued -> running` only when the first runtime turn actually starts, using replay reason `runtime_turn_started`.
  Rationale: That matches the architecture doc and prevents thread bootstrap alone from being misrepresented as real task execution.
  Date/Author: 2026-03-09 / Codex

- Decision: Keep the existing M1.1 behavior that a newly claimed pending task also bootstraps its thread in the same tick, but defer `turn/start` to the next claimed-task recovery tick.
  Rationale: This was the first M1.2 shape before the real-runtime compatibility gap was reverified.
  Date/Author: 2026-03-09 / Codex

- Decision: Start the first read-only turn in the same short-lived session whenever a claimed task has no persisted thread id.
  Rationale: The real local binary still cannot resume or directly address a fresh no-turn thread across sessions, so same-session bootstrap plus first-turn execution is the narrowest way to make real local first-turn execution reliable without abandoning durable thread ids.
  Date/Author: 2026-03-10 / Codex

- Decision: Use replay history, not task status alone, as the source of truth for “has this task ever started a turn?”.
  Rationale: Querying `runtime.turn_started` on the task keeps the recovery guard additive and explicit, and prevents the replacement fallback from running after a task has already entered real execution once.
  Date/Author: 2026-03-10 / Codex

- Decision: Record pre-first-turn replacement explicitly with `runtime.thread_replaced`, and record the chosen turn path with `runtime.turn_started.payload.recoveryStrategy`.
  Rationale: The replacement fallback changes durable thread mapping, so replay must show the old thread id, new thread id, and machine-readable reason, while the turn-start payload makes resumed, direct, replacement, and same-session bootstrap paths visible in compact replay.
  Date/Author: 2026-03-10 / Codex

## Context and Orientation

The M0 mission spine and M1.1 bootstrap are already in place.
`apps/control-plane/src/modules/missions/service.ts` creates queued missions, materializes ordered tasks, and persists an evidence placeholder.
`apps/control-plane/src/modules/orchestrator/service.ts` still claims one runnable task per tick and appends `task.status_changed` for `pending -> claimed`, but the runtime execution path now handles same-session first-turn bootstrap plus recovery of previously stranded pre-first-turn threads.

The runtime boundary remains intentionally split.
`packages/codex-runtime/` owns transport startup, request wiring, JSON parsing, and protocol schemas.
`apps/control-plane/src/modules/runtime-codex/` owns Pocket CTO policy: env-derived defaults, safe turn input construction, thread resume or turn start sequencing, and mapping observed runtime notifications into replay-worthy lifecycle events.
Task and mission persistence must stay behind the mission repository interface in `apps/control-plane/src/modules/missions/`.
Replay append behavior must stay explicit through `packages/domain/src/replay-event.ts` and `apps/control-plane/src/modules/replay/service.ts`.

This plan only covers roadmap submilestone `M1.2 thread and turn lifecycle mapping`.
It does not widen into M1.3 workspace isolation, M1.4 planner prompts, M1.5 executor prompts, M1.6 approvals, M1.7 artifacts, M2 GitHub integration, or any file-changing runtime behavior.

The intended edit surface for this slice is:

- `plans/EP-0005-turn-lifecycle-and-replay.md`
- `plans/EP-0001-mission-spine.md`
- `docs/ops/codex-app-server.md`
- `packages/codex-runtime/src/protocol.ts`
- `packages/codex-runtime/src/client.ts`
- `packages/codex-runtime/src/protocol.spec.ts`
- `packages/codex-runtime/src/index.ts`
- `packages/domain/src/mission-task.ts`
- `packages/domain/src/replay-event.ts`
- `packages/domain/src/index.ts`
- `packages/db/src/schema/missions.ts`
- `packages/db/src/schema/replay.ts`
- `apps/control-plane/src/bootstrap.ts`
- `apps/control-plane/src/lib/types.ts`
- `apps/control-plane/src/modules/missions/repository.ts`
- `apps/control-plane/src/modules/missions/drizzle-repository.ts`
- `apps/control-plane/src/modules/missions/repository-mappers.ts`
- `apps/control-plane/src/modules/orchestrator/events.ts`
- `apps/control-plane/src/modules/orchestrator/service.ts`
- `apps/control-plane/src/modules/orchestrator/worker.ts`
- `apps/control-plane/src/modules/orchestrator/service.spec.ts`
- `apps/control-plane/src/modules/orchestrator/drizzle-service.spec.ts`
- `apps/control-plane/src/modules/runtime-codex/adapter.ts`
- `apps/control-plane/src/modules/runtime-codex/config.ts`
- `apps/control-plane/src/modules/runtime-codex/events.ts`
- `apps/control-plane/src/modules/runtime-codex/service.ts`
- new small modules under `apps/control-plane/src/modules/runtime-codex/` for turn input building and lifecycle event mapping
- `packages/testkit/src/runtime/fake-codex-app-server.mjs`
- generated migration files under `packages/db/drizzle/`

There is no expected impact on `WORKFLOW.md`, stack packs, GitHub App permissions, webhook expectations, or new environment variables in this slice.

## Plan of Work

First, align `packages/codex-runtime` with the installed app-server lifecycle needed for M1.2.
That means adding typed `thread/resume` request and response support, extending known notification parsing to include `turn/completed`, `item/started`, and `item/completed`, and keeping only the smallest stable delta or terminal-interaction coverage needed for later observability without making replay depend on deltas.

Next, add additive persistence for active turns and claimed-task recovery.
`mission_tasks` needs a nullable `codex_turn_id`, repository methods to attach and clear it, and deterministic selection logic that prefers already claimed tasks needing bootstrap or turn resumption over newly claimed pending tasks, while still processing only one task per tick in a stable sort order.

Then, add a small read-only turn-input builder and a runtime service that performs the short-lived lifecycle:
initialize, initialized, bootstrap thread if needed, resume the persisted thread when needed, start one turn, observe runtime notifications, and return a structured summary of turn start, structural item lifecycle, and terminal completion.
The orchestrator should own the policy and persistence decisions around that summary: mission or task status changes, replay event appends, turn-id persistence, and terminal cleanup.

Finally, extend the fake app-server fixture, add narrow protocol and DB-backed integration tests, update docs with the exact M1.2 lifecycle, and record validation plus manual acceptance evidence here.

## Concrete Steps

Run these commands from the repository root as needed:

    codex app-server --help
    mkdir -p tmp/codex-app-server-schema-m1.2
    codex app-server generate-ts --out tmp/codex-app-server-schema-m1.2
    pnpm db:generate
    pnpm db:migrate
    pnpm --filter @pocket-cto/codex-runtime test
    pnpm --filter @pocket-cto/codex-runtime typecheck
    pnpm --filter @pocket-cto/control-plane test
    pnpm --filter @pocket-cto/control-plane typecheck
    pnpm --filter @pocket-cto/control-plane lint

If local execution remains possible after tests, also run:

    pnpm --filter @pocket-cto/codex-runtime test -- --runInBand

or an equivalent one-off acceptance command for the fake fixture, then a real local read-only acceptance if `codex` is installed and authenticated.

Implementation order:

1. Keep this ExecPlan current with discoveries, decisions, and progress as implementation proceeds.
2. Expand runtime protocol schemas and client methods in `packages/codex-runtime`.
3. Extend the fake app-server fixture to emit resume, turn, item, and terminal notifications.
4. Add `codex_turn_id` persistence and repository helpers, then generate and apply the migration.
5. Add claimed-task recovery ordering and single-task-per-tick orchestration behavior.
6. Implement the safe read-only turn input builder and runtime lifecycle service.
7. Map turn or item lifecycle into replay and task or mission status transitions.
8. Add focused protocol-level and DB-backed tests.
9. Update docs and handoff notes.
10. Run the required validation commands and record exact results.

## Validation and Acceptance

Success for M1.2 is demonstrated when all of these are true:

1. A protocol-level fake app-server test proves the runtime client can:
   - bootstrap or resume a thread
   - start a turn
   - parse `turn/started`
   - parse `turn/completed`
   - parse `item/started`
   - parse `item/completed`
2. A DB-backed control-plane test proves worker precedence is:
   - oldest claimed task with `codexThreadId = null`
   - then oldest claimed task with `codexThreadId != null` and `codexTurnId = null`
   - only then a newly claimed pending runnable task
3. A DB-backed control-plane test proves a claimed task with an existing thread and no active turn:
   - resumes the thread
   - starts one turn
   - persists `codexTurnId` while the turn is active
   - appends `runtime.turn_started`, `runtime.item_started`, `runtime.item_completed`, and `runtime.turn_completed`
4. The first real turn start for a queued mission transitions the mission to `running` and appends `mission.status_changed` with `reason = "runtime_turn_started"`.
5. A successful turn transitions the task `claimed -> running -> succeeded`, clears `codexTurnId`, and appends a machine-readable terminal replay event.
6. A failed or interrupted turn clears `codexTurnId`, marks the task `failed`, and appends `runtime.turn_completed` plus the failing `task.status_changed`.
7. No test depends on a real `codex` binary.
8. `docs/ops/codex-app-server.md` documents the M1.2 lifecycle and the explicit read-only safety posture.

Manual acceptance evidence should include:

- exact command used
- thread id
- turn id
- first and last runtime item types observed
- whether any file mutations were requested or attempted

## Idempotence and Recovery

The migration is additive.
If it fails locally, fix the schema and rerun `pnpm db:generate` plus `pnpm db:migrate` against the local dev and test databases.
Do not hand-edit partially migrated tables.

Runtime lifecycle retry posture is intentionally narrow in M1.2.
The worker processes only one task per tick and uses persisted state to decide what to do next:

- if a claimed task has no thread id, bootstrap the thread first
- if it has a thread id and no turn id, resume the thread and start one turn
- if it already has a turn id, treat that as an active or interrupted lifecycle that must not be duplicated by this slice

If the process fails before turn start persistence, the task remains claimed and eligible for the next deterministic retry path.
If terminal turn handling fails after the app server emitted completion, the task should remain recoverable by inspecting replay and the persisted turn id.
Rollback is straightforward: revert the additive runtime lifecycle integration, the new replay payloads, and the additive schema migration together.

## Artifacts and Notes

Protocol verification notes captured before implementation:

- `codex app-server --help` on 2026-03-09 confirms the local CLI still exposes `generate-ts` and defaults to `stdio://`.
- The generated `ClientRequest` union includes `thread/resume` and `turn/start`.
- The generated `ServerNotification` union includes `turn/started`, `turn/completed`, `item/started`, `item/completed`, `item/commandExecution/terminalInteraction`, and several delta notifications.
- The generated `v2/Turn` type notes that `items` are only populated on `thread/resume` or `thread/fork`; lifecycle notifications return the `Turn` with `items = []`.
- The current official Codex protocol article shows the staged flow `initialize -> initialized -> thread/start -> turn/start`, then documents `turn/started`, `turn/completed`, and item-level notifications during execution.

Evidence expectations for this slice:

- replay preserves the mission objective via the existing proof-bundle placeholder and mission detail view
- replay shows explicit runtime change summary through turn and item lifecycle events
- validation commands provide verification evidence
- risks and rollback guidance remain visible in this plan and the final report
- decision trace remains reconstructable from ordered replay and the documented status transitions

Manual acceptance evidence captured during implementation:

- Fake control-plane acceptance succeeded with:
  - command: `pnpm exec tsx --eval '... fake app-server control-plane harness ...'`
  - `threadId = "thread_manual_fake_1"`
  - `turnId = "turn_fake_123"`
  - `firstItemType = "plan"`
  - `lastItemType = "agentMessage"`
  - `thread/resume = not attempted (same-session bootstrap)`
  - `direct turn/start fallback needed = false`
  - no file mutations requested or attempted by the fixture
- Real local read-only acceptance succeeded with:
  - command: `pnpm exec tsx --eval '... real local codex control-plane harness ...'`
  - `threadId = "019cd54e-6332-7fc3-ae2b-9d1421473dfc"`
  - `turnId = "019cd54e-6336-7340-915f-282c8009130d"`
  - `firstItemType = "userMessage"`
  - `lastItemType = "agentMessage"`
  - `thread/resume = not attempted (same-session bootstrap)`
  - `direct turn/start fallback needed = false`
  - no file mutations were requested or attempted; the read-only turn only emitted reasoning, user-message, agent-message, and read-only command-execution items
- Compatibility-polish fake acceptance rerun succeeded with:
  - command: `RUNTIME_KIND=fake pnpm exec tsx --eval '... in-memory orchestrator acceptance harness ...'`
  - `threadId = "thread_fake_123"`
  - `turnId = "turn_fake_123"`
  - `firstItemType = "plan"`
  - `lastItemType = "agentMessage"`
  - `thread/resume = not attempted (same-session bootstrap)`
  - `direct turn/start fallback needed = false`
  - no file mutations were requested or attempted by the fixture
- Compatibility-polish real local acceptance rerun succeeded with:
  - command: `REAL_ACCEPTANCE_CWD=/tmp/pocket-cto-real-acceptance pnpm exec tsx --eval '... direct runtime acceptance harness ...'`
  - `threadId = "019cd9cc-9736-7373-904b-03ef0cbf615a"`
  - `turnId = "019cd9cc-983b-7681-99fa-4b4c75d8368e"`
  - `firstItemType = "userMessage"`
  - `lastItemType = "agentMessage"`
  - `thread/resume = not attempted (same-session bootstrap)`
  - `direct turn/start fallback needed = false`
  - no file mutations were requested or attempted; the narrow read-only acceptance only emitted `userMessage`, `reasoning`, and `agentMessage` item types from an empty temp working directory

The generated `tmp/codex-app-server-schema-m1.2` and `tmp/codex-app-server-schema-m1.2-polish` directories are verification input only and must remain uncommitted.

## Interfaces and Dependencies

Important runtime interfaces for this slice:

- `CodexAppServerClient` in `packages/codex-runtime/src/client.ts`
- protocol contracts in `packages/codex-runtime/src/protocol.ts`
- `MissionRepository` in `apps/control-plane/src/modules/missions/repository.ts`
- `ReplayService` in `apps/control-plane/src/modules/replay/service.ts`
- `OrchestratorService` and `OrchestratorWorker` in `apps/control-plane/src/modules/orchestrator/`
- runtime policy modules under `apps/control-plane/src/modules/runtime-codex/`

Important domain and persistence interfaces:

- `MissionTaskRecord` in `packages/domain/src/mission-task.ts`
- replay payload schemas in `packages/domain/src/replay-event.ts`
- `mission_tasks` in `packages/db/src/schema/missions.ts`
- `replay_events` in `packages/db/src/schema/replay.ts`

Important libraries and tools:

- `zod`
- `drizzle-orm`
- `vitest`
- Node `child_process`
- the local `codex` CLI only for schema verification and optional real acceptance

Environment and policy notes:

- no new required env variables are expected
- `CODEX_DEFAULT_SANDBOX` and turn inputs must remain read-only for manual acceptance
- M1.3 will introduce workspace isolation
- M1.4 and M1.5 will introduce real planner and executor prompts

## Outcomes & Retrospective

M1.2 landed as a narrow runtime control slice instead of a file-changing execution slice.
Pocket CTO now persists `codexTurnId` on tasks, starts the first read-only turn in the same short-lived session that bootstraps a fresh thread, resumes persisted threads when that is actually possible, and falls back through direct `turn/start` or pre-first-turn thread replacement when the real local runtime exposes the fresh-thread resume gap. Replay now includes `runtime.thread_replaced` when the durable thread mapping has to be swapped, and `runtime.turn_started.payload.recoveryStrategy` makes the chosen turn path explicit.

The most important orchestration change is deterministic recovery order.
Each worker tick now prefers claimed tasks that still need a thread bootstrap, then claimed tasks that already have a thread but no turn, and only then claims fresh pending work.
Newly claimed tasks or previously threadless claimed tasks now complete the first turn in that same tick, which removes the real local runtime’s fresh-thread stranding case.
Previously stranded claimed tasks with a stored thread id still take precedence over fresh work, and the replacement fallback is explicitly limited to tasks that have never emitted `runtime.turn_started`.

Validation passed for the required package commands:

- `pnpm --filter @pocket-cto/codex-runtime test`
- `pnpm --filter @pocket-cto/codex-runtime typecheck`
- `pnpm db:generate`
- `pnpm db:migrate`
- `DATABASE_URL=postgres://postgres:postgres@localhost:5432/pocket_cto_test pnpm --filter @pocket-cto/db db:migrate`
- `pnpm --filter @pocket-cto/control-plane test`
- `pnpm --filter @pocket-cto/control-plane typecheck`
- `pnpm --filter @pocket-cto/control-plane lint`

The broader repo gates were also exercised for release-candidate confidence:

- `pnpm ci:static` completed repo hygiene, lint, typecheck, and build work, then failed only at `ci:clean-tree` because the audited runtime slice is still intentionally dirty and unstaged.
- `pnpm ci:integration-db` completed database preparation, migrations, and the repo test matrix, then failed only at `ci:clean-tree` for that same dirty-worktree reason.

The precise remaining gap to M1.3 is unchanged and now easier to see: Pocket CTO still lacks workspace isolation and git-worktree management, so planner or executor turns cannot safely mutate files yet even though thread, turn, and replay lifecycle control is now in place.
That said, the runtime control surface itself is now robust enough for M1.3 to start cleanly: first-turn execution no longer depends on cross-session fresh-thread resume working on the local binary, and previously stranded pre-first-turn tasks have a deterministic recovery path.
