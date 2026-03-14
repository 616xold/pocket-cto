# EP-0009 - Persist runtime approvals and support live turn interrupts

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this slice, Pocket CTO can stop pretending runtime approvals are an out-of-band concern.
When Codex App Server asks for approval during an active turn, the control plane will persist a durable approval row plus replay, move the task and mission into `awaiting_approval`, keep the live turn parked in a narrow in-memory session registry, accept or decline that approval through a thin control-plane route, and then either resume the live turn honestly or let it terminalize honestly.

This same slice also adds operator interrupts for active turns.
An operator will be able to target an active task turn, persist the interrupt intent, call `turn/interrupt` on the correct live client, and later see a specific interrupted terminal path in replay and task state instead of a generic runtime failure.

The operator-visible proof is concrete.
One fake-runtime file-change approval request should persist a `pending` approval row and `approval.requested` replay, move the task and mission to `awaiting_approval`, resume after acceptance with `approval.resolved`, and end with truthful terminal replay.
One fake-runtime interrupt should persist the interrupt intent, end with `runtime_turn_interrupted`, and leave the task explicitly `cancelled`.

This plan is intentionally bounded to roadmap submilestone `M1.6 approval record creation for runtime approval requests`.
It does not add GitHub integration, richer artifact plumbing beyond approval persistence needs, multi-process approval durability, UI-heavy approval screens, or M1.7 artifact mapping.

## Progress

- [x] (2026-03-12T21:51Z) Re-read the required repo docs, architecture docs, ops docs, M1.2 through M1.5 ExecPlans, runtime wrapper files, mission persistence files, orchestrator files, approvals placeholder, and fake app-server fixture named in the prompt.
- [x] (2026-03-12T21:51Z) Verified the local CLI surface with `codex app-server --help` and `codex app-server generate-ts --out tmp/codex-app-server-schema-m1.6`, then compared the generated stable bindings plus the current official Codex App Server docs against the repo runtime wrapper for approval requests, `serverRequest/resolved`, and `turn/interrupt`.
- [x] (2026-03-12T21:51Z) Drafted this ExecPlan with the verified M1.6 gap analysis, bounded edit surface, validation commands, approval-session strategy, replay implications, and recovery posture.
- [x] (2026-03-12T22:08Z) Expanded `@pocket-cto/codex-runtime` to parse inbound server-initiated JSON-RPC requests, type file-change and command-execution approval surfaces, emit typed `serverRequest/resolved` notifications, and answer those requests through low-level request or response mechanics kept entirely inside the runtime package.
- [x] (2026-03-12T22:18Z) Added a real approvals bounded context plus a single-process in-memory live session registry, wired approval-aware task or mission state transitions and replay, and exposed resolve or interrupt operations on the worker command surface that owns the live runtime session.
- [x] (2026-03-12T22:26Z) Extended the fake app-server fixture, added protocol-level and DB-backed tests for approval acceptance, approval decline, and interrupt terminalization, and fixed the observed turn-start versus approval-request race by serializing server-request handling behind earlier turn lifecycle persistence.
- [x] (2026-03-12T22:31Z) Updated the ops docs and approvals README, generated additive replay migration `packages/db/drizzle/0005_cynical_human_robot.sql`, ran the required validation commands, ran one manual file-change approval acceptance plus one manual interrupt acceptance with the fake fixture, and recorded the resulting evidence below.
- [x] (2026-03-13T19:00Z) Hardened approval resolution so accepted decisions only move task or mission state back to `running` after the live app-server response handoff succeeds, and added a durable `payload.liveContinuation.status = "delivery_failed"` marker when that handoff is already gone.
- [x] (2026-03-13T19:00Z) Hardened approval cancellation and interrupt error reporting around the same live-session seam, then replaced the DB-backed approval polling helpers with a shared 5-second wait helper that reports the last observed state on timeout.
- [x] (2026-03-13T19:00Z) Added a focused approval-service durability spec for live-handoff failure and re-ran the DB-backed approval or interrupt suite against the hardened behavior before the full validation pass.
- [x] (2026-03-14T01:15Z) Added a shared single-process control kernel for the API and worker entrypoints, thin approval or interrupt HTTP routes, and explicit `live_control_unavailable` semantics when the current process does not own the live in-memory session registry.
- [x] (2026-03-14T01:15Z) Added route-level control-surface tests plus DB-backed fake-runtime HTTP approval-resolution and interrupt integration coverage, then updated the ops docs and local-dev guidance for embedded-worker mode.
- [x] (2026-03-14T11:40Z) Promoted `CONTROL_PLANE_EMBEDDED_WORKER` into typed config, routed server container selection through that typed flag, added explicit `dev:embedded` scripts, and emitted startup logs that state `api_only`, `embedded_worker`, or `standalone_worker` directly.
- [x] (2026-03-14T11:40Z) Added focused server-mode tests for typed config parsing and container selection, then refreshed the local-dev and app-server docs so the single-process operator loop is obvious without reading raw env wiring.
- [x] (2026-03-14T12:05Z) Updated the operator-facing mission action copy to point at `pnpm dev:embedded`, then re-ran the required runtime and control-plane validation commands plus a web typecheck for the small UI hint change.

## Surprises & Discoveries

- Observation: The current repo already reserves replay event types `approval.requested` and `approval.resolved`, includes an `approvals` table, and documents `awaiting_approval` in the mission and task state machine, but the approvals module is still only a placeholder.
  Evidence: `packages/db/src/schema/artifacts.ts`, `packages/db/src/schema/replay.ts`, `packages/domain/src/replay-event.ts`, `docs/architecture/state-machine.md`, and `apps/control-plane/src/modules/approvals/README.md`.

- Observation: The checked-in runtime wrapper only models inbound notifications and client-initiated request responses; it does not model inbound server-initiated JSON-RPC requests at all.
  Evidence: `packages/codex-runtime/src/client.ts` treats stdout frames as success, error, known notification, or generic notification, and `packages/codex-runtime/src/protocol.ts` only exposes `KnownServerNotificationSchema` for inbound typed messages.

- Observation: The generated stable `m1.6` schema already exposes the approval request surfaces needed for this milestone without using experimental flags.
  Evidence: `tmp/codex-app-server-schema-m1.6/ServerRequest.ts` includes `item/fileChange/requestApproval`, `item/commandExecution/requestApproval`, and `item/permissions/requestApproval`; `tmp/codex-app-server-schema-m1.6/ServerNotification.ts` includes `serverRequest/resolved`; and `tmp/codex-app-server-schema-m1.6/ClientRequest.ts` includes `turn/interrupt`.

- Observation: The generated stable file-change approval request shape is intentionally smaller than command-execution approval and carries no `approvalId`, only `threadId`, `turnId`, `itemId`, optional `reason`, and optional `grantRoot`.
  Evidence: `tmp/codex-app-server-schema-m1.6/v2/FileChangeRequestApprovalParams.ts`.

- Observation: The generated stable command-execution approval request shape already carries enough information to support both plain command approvals and managed-network escalation decisions cleanly in one bounded context.
  Evidence: `tmp/codex-app-server-schema-m1.6/v2/CommandExecutionRequestApprovalParams.ts` includes `approvalId`, `itemId`, `reason`, `command`, `cwd`, `availableDecisions`, `networkApprovalContext`, and proposed policy-amendment fields.

- Observation: The current worker runtime path already keeps a live client open during a turn and already exposes outbound `turn/interrupt`, so a narrow in-memory approval-session registry fits the existing lifecycle better than a fake stateless request-response layer.
  Evidence: `apps/control-plane/src/modules/runtime-codex/service.ts` keeps the client open through `observeTurnLifecycle(...)`, and `packages/codex-runtime/src/client.ts` already has `interruptTurn(...)`.

- Observation: The working tree already contains uncommitted orchestrator and EP-0008 changes unrelated to this new plan, so M1.6 must build on the current working state rather than resetting files.
  Evidence: `git status --short` shows modifications in `apps/control-plane/src/modules/orchestrator/{drizzle-service.spec.ts,service.spec.ts,service.ts,worker.ts}` and `plans/EP-0008-executor-guardrails-and-validation-hooks.md`.

- Observation: Approval requests can arrive quickly enough after `turn/started` that the approval persistence path races the `claimed -> running` task transition unless the turn lifecycle serializes server requests behind earlier queued notifications.
  Evidence: the first DB-backed approval acceptance run persisted `approval.requested` while leaving the executor task in `running`, because the approval handler observed the task before the `onTurnStarted` persistence chain had settled; waiting on `notificationChain` inside `turn-lifecycle.ts` eliminated the race and made the `running -> awaiting_approval` transition deterministic.

- Observation: `pnpm db:migrate` only migrates `DATABASE_URL`, while the DB-backed control-plane specs reset and reuse `resolveTestDatabaseUrl(...)`.
  Evidence: the new replay type `runtime.turn_interrupt_requested` passed app-database migration but still failed in the DB-backed suite until `pnpm run db:migrate:ci` migrated both `pocket_cto` and `pocket_cto_test`.

- Observation: The fake app-server fixture must respect turn approval policy and sandbox posture or it will ask planners for mutation approvals that Pocket CTO should never see in M1.6.
  Evidence: the first file-change approval spec stalled on the planner task until the fixture was changed to emit approval requests only for writable, non-`never` turns and to apply a small real workspace edit on accepted file-change approvals so executor validation can pass honestly.

- Observation: `ApprovalService.resolveApproval()` still committed `approval.resolved` and the accepted `awaiting_approval -> running` state transition before the live registry handoff was attempted, so a lost live session could leave durable state looking resumed when nothing had actually resumed.
  Evidence: the pre-hardening flow in `apps/control-plane/src/modules/approvals/service.ts` updated the approval row and resumed mission or task state inside the transaction, then called `liveSessionRegistry.resolveApproval(...)` afterward.

- Observation: the DB-backed approval or interrupt specs still depended on a 1-second total polling window and one raw `delay(1)` check, which is enough to reintroduce flakes under slower CI scheduling.
  Evidence: `apps/control-plane/src/modules/orchestrator/drizzle-service.spec.ts` used `waitFor()` with `100 * 10ms` defaults plus a direct `await delay(1)` after approval resolution before this hardening pass.

- Observation: the worker-owned approval registry does not block an HTTP operator surface as long as the API and worker are intentionally co-located in the same process and share one bootstrap-built service graph.
  Evidence: `apps/control-plane/src/bootstrap.ts` now builds one kernel that can supply the API-only app surface or an embedded app plus worker pair, and the DB-backed `app.inject` approval or interrupt tests pass only when that embedded container owns the same in-memory registry as the live fake runtime.

- Observation: runtime `item/permissions/requestApproval` carries a grant payload shape that does not fit Pocket CTO's existing decision-based approval records cleanly in M1.6.
  Evidence: `packages/codex-runtime/src/protocol.ts` defines `PermissionsRequestApprovalResponseSchema` as granted permissions plus scope rather than a simple accept or decline decision, so the M1.6 worker now rejects that request explicitly with an operator-visible unsupported-surface error instead of pretending it can persist or resume it.

- Observation: the earlier embedded-worker surface was honest at the route layer, but the deciding flag still bypassed typed config and the developer path still depended on remembering a raw shell prefix.
  Evidence: before this hardening pass, `apps/control-plane/src/server.ts` read `process.env.CONTROL_PLANE_EMBEDDED_WORKER` directly, `.env.example` did not declare it, and the root package scripts offered no dedicated embedded-mode command.

## Decision Log

- Decision: Create this plan as `EP-0009`.
  Rationale: `plans/` already contains `EP-0001` through `EP-0008`, so `EP-0009` is the next free tracked number and matches the requested target path.
  Date/Author: 2026-03-12 / Codex

- Decision: Treat the generated stable app-server schema as the source of truth for M1.6, with the public Codex App Server docs used to confirm behavior and terminology.
  Rationale: The prompt explicitly requires local verification against the current CLI plus official docs, and the generated stable bindings provide the exact wire-level payloads Pocket CTO must parse and answer.
  Date/Author: 2026-03-12 / Codex

- Decision: Support `item/fileChange/requestApproval` as the required minimum, and add `item/commandExecution/requestApproval` plus `item/permissions/requestApproval` only when the mapping fits cleanly into the existing approval kinds for this milestone.
  Rationale: The prompt requires file-change approvals at minimum and permits command or network approval support when clean; the stable schema exposes both in a way that can map to `file_change`, `command`, and `network_escalation` without widening into unrelated surfaces.
  Date/Author: 2026-03-12 / Codex

- Decision: Implement approval continuity with a single-process in-memory live session registry keyed by active task id plus active request id, not with fake multi-process durability.
  Rationale: Approval requests arrive mid-turn on a live app-server session. The current runtime design already owns a live client for the active turn, so the narrowest honest design is an in-memory registry that holds resolver callbacks and interrupt handles while keeping durable source-of-truth state in Postgres replay and approval rows.
  Date/Author: 2026-03-12 / Codex

- Decision: Add a dedicated approvals bounded context under `apps/control-plane/src/modules/approvals/` with route, schema, service, repository, and mapping layers instead of embedding approval persistence into orchestrator or runtime modules.
  Rationale: `AGENTS.md` and the approvals placeholder both reserve this context, and M1.6 introduces transport, business logic, persistence, and replay concerns that should stay modular.
  Date/Author: 2026-03-12 / Codex

- Decision: Use an explicit approval-policy resolver for task-role and mutation posture decisions instead of hard-coding more branching into runtime or orchestrator code.
  Rationale: M1.6 changes executor approval posture while keeping planner read-only with `approvalPolicy = never`. A dedicated resolver makes the rule explicit and keeps later milestones from hiding policy in scattered conditionals.
  Date/Author: 2026-03-12 / Codex

- Decision: When an active turn later completes with terminal status `interrupted`, map the final task status to `cancelled` with a new explicit task-status reason such as `runtime_turn_interrupted`.
  Rationale: The prompt prefers `cancelled`, and mapping this to generic runtime failure would erase the operator-intent distinction that replay and evidence need to preserve.
  Date/Author: 2026-03-12 / Codex

- Decision: Keep approval resolution and interrupt handling on the worker command surface for M1.6 instead of adding HTTP routes in the API process.
  Rationale: the live continuation lives in the worker process's in-memory session registry. An API-process route would imply cross-process continuity that Pocket CTO does not honestly have yet.
  Date/Author: 2026-03-12 / Codex

- Decision: Serialize inbound server-request handling behind already-queued turn lifecycle notifications before persisting the approval request.
  Rationale: this preserves the intended event order so `turn/started` persistence lands before `approval.requested`, making `running -> awaiting_approval` explicit and replayable instead of racing against the task-start transaction.
  Date/Author: 2026-03-12 / Codex

- Decision: Defer the accepted `awaiting_approval -> running` transition until after the live approval response is actually handed back to the waiting app-server session, and record `payload.liveContinuation.status = "delivery_failed"` when that handoff is already gone.
  Rationale: this keeps durable state from silently claiming that work resumed before the live handoff succeeded, while staying honest about the M1.6 single-process limitation instead of pretending restart-safe continuity exists.
  Date/Author: 2026-03-13 / Codex

- Decision: Keep the DB-backed approval and interrupt specs on polling, but move them to a shared helper with a 5-second timeout, 25ms interval, and last-observation timeout diagnostics instead of ad hoc 1-second loops and blind sleeps.
  Rationale: the fake runtime and DB-backed worker flow are already integration-heavy enough that a deterministic internal signal would widen the seam more than needed for this hardening pass; a safer shared wait helper narrows the timing surface without hiding failures.
  Date/Author: 2026-03-13 / Codex

- Decision: Expose operator approval resolution and task interruption over HTTP only when the control-plane server is running in embedded-worker mode, and return `live_control_unavailable` from the same routes when the current process is API-only.
  Rationale: this keeps the new operator command surface honest about the single-process live-session limitation while still giving the MVP a real human-usable API for approvals and interrupts.
  Date/Author: 2026-03-14 / Codex

- Decision: Reject runtime `item/permissions/requestApproval` explicitly in M1.6 instead of storing a partial approval row that Pocket CTO cannot resume correctly.
  Rationale: the stable permissions approval response is a granted-permissions payload, not the decision-based shape Pocket CTO persists for file-change or command approvals, so a truthful unsupported-surface failure is narrower and safer for this milestone.
  Date/Author: 2026-03-14 / Codex

- Decision: Keep embedded-worker enablement as one explicit typed config flag, `CONTROL_PLANE_EMBEDDED_WORKER`, with a default of `false`, then surface it through dedicated `dev:embedded` scripts instead of more raw shell-only instructions.
  Rationale: the HTTP approval or interrupt surface only works when the API process owns the live in-memory registry, so one explicit typed flag plus dedicated commands makes that mode easy to run locally without implying that API-only or standalone-worker modes changed semantics.
  Date/Author: 2026-03-14 / Codex

## Context and Orientation

Pocket CTO already has the M0 mission spine, M1.2 structural runtime replay, M1.3 isolated task workspaces, M1.4 planner evidence, and M1.5 guarded executor turns.
The worker can claim one task, ensure one task workspace, run one live Codex turn, persist `codexThreadId` and `codexTurnId`, append structural replay, and terminalize planner or executor outcomes honestly.

What M1.6 still lacks is the live approval seam.
The domain and DB layers already know that approvals exist, but the runtime wrapper cannot parse server-initiated approval requests, the control plane has no approval repository or service, there is no route to resolve an approval or interrupt a live turn, and no module persists mission or task transitions into `awaiting_approval`.
Today, if the runtime were to ask for approval, Pocket CTO would treat the inbound request as an untyped notification or protocol error and would have no way to answer it.

Repository boundaries for this slice must remain:

- `packages/codex-runtime/` for JSON-RPC parsing, request or response mechanics, typed app-server approval request surfaces, and low-level resolve or reject helpers.
- `packages/domain/` for additive replay payload typing, approval decision schemas if shared, and explicit status-change reasons.
- `packages/db/` only for additive schema or exported-enum changes if the current approvals table or replay enum needs them.
- `apps/control-plane/src/modules/approvals/` for approval persistence, replay append policy, session-resolution logic, and thin HTTP route handling.
- `apps/control-plane/src/modules/runtime-codex/` for approval-aware live-turn observation, live session registry ownership, and active-turn interrupt integration.
- `apps/control-plane/src/modules/orchestrator/` for task or mission lifecycle transitions and worker-facing runtime classification only.
- `apps/control-plane/src/modules/missions/` for task or mission status persistence helpers and any mission-wide pending-approval queries that belong with mission state.

The official runtime references consulted before implementation are the public Codex App Server docs at `https://developers.openai.com/codex/app-server/` and the current public approvals guidance linked from that page.
The local stable schema generated on 2026-03-12 confirms the exact M1.6 wire surface Pocket CTO should implement:

- server-initiated JSON-RPC requests:
  `item/fileChange/requestApproval`
  `item/commandExecution/requestApproval`
  `item/permissions/requestApproval`
- server notification:
  `serverRequest/resolved`
- client request:
  `turn/interrupt`

The intended edit surface for this slice is:

- `plans/EP-0009-approval-persistence-and-interrupts.md`
- `plans/EP-0008-executor-guardrails-and-validation-hooks.md` only for minimal handoff notes if needed
- `docs/ops/codex-app-server.md`
- `docs/ops/local-dev.md`
- `packages/codex-runtime/src/protocol.ts`
- `packages/codex-runtime/src/client.ts`
- `packages/codex-runtime/src/errors.ts`
- `packages/codex-runtime/src/index.ts`
- `packages/codex-runtime/src/protocol.spec.ts`
- `packages/domain/src/replay-event.ts`
- `packages/domain/src/index.ts`
- `packages/db/src/schema/replay.ts` and `packages/db/src/schema/artifacts.ts` only if additive typing or exported enums need refresh
- `apps/control-plane/src/app.ts`
- `apps/control-plane/src/bootstrap.ts`
- `apps/control-plane/src/lib/types.ts`
- new small modules under `apps/control-plane/src/modules/approvals/`
- `apps/control-plane/src/modules/missions/repository.ts`
- `apps/control-plane/src/modules/missions/drizzle-repository.ts`
- `apps/control-plane/src/modules/missions/repository-mappers.ts` only if approval rows or new queries need mapping helpers
- `apps/control-plane/src/modules/missions/events.ts`
- `apps/control-plane/src/modules/orchestrator/events.ts`
- `apps/control-plane/src/modules/orchestrator/runtime-phase.ts`
- `apps/control-plane/src/modules/orchestrator/service.ts`
- `apps/control-plane/src/modules/orchestrator/worker.ts`
- `apps/control-plane/src/modules/runtime-codex/config.ts`
- `apps/control-plane/src/modules/runtime-codex/service.ts`
- `apps/control-plane/src/modules/runtime-codex/turn-lifecycle.ts`
- `apps/control-plane/src/modules/runtime-codex/types.ts`
- new small modules under `apps/control-plane/src/modules/runtime-codex/` such as an approval-policy resolver and live session registry
- `packages/testkit/src/runtime/fake-codex-app-server.mjs`
- focused specs under `packages/codex-runtime/src/` and `apps/control-plane/src/modules/`

This slice does not change GitHub App permissions, webhook expectations, or stack packs.
It now does include one explicit typed local server-mode flag, `CONTROL_PLANE_EMBEDDED_WORKER`, because the M1.6 HTTP operator surface needs an honest way to advertise whether the current API process owns the live in-memory session registry.
It does need explicit docs that approval continuity across worker restart is not yet guaranteed.

## Plan of Work

First, expand `@pocket-cto/codex-runtime` so it can distinguish inbound server requests from notifications and responses.
That means adding typed protocol schemas for the stable approval request methods, adding response payload schemas for file-change and command-execution approval decisions, and teaching the client to route server requests through a handler registry instead of misclassifying them.
This same layer should parse `serverRequest/resolved`, keep `turn/interrupt`, and preserve the existing request-response mechanics behind the package boundary.

Next, add a narrow live session registry inside the control plane runtime boundary.
The registry should track one active turn session per task, expose approval responders keyed by task id plus request id, and expose one interrupt path keyed by task id.
The runtime service should register the live client before starting the turn, hold approval callbacks while the turn is awaiting a decision, and remove them once `serverRequest/resolved` or terminal completion arrives.
The registry must stay explicitly single-process and in-memory for M1.6, with docs that worker restart can strand live approvals even though durable approval rows and replay remain intact.

Then, turn `apps/control-plane/src/modules/approvals/` into a real bounded context.
This module should persist pending approval rows in the existing `approvals` table, map runtime approval requests into `approval_kind`, append `approval.requested` replay, update approval rows on resolution, append `approval.resolved`, and expose service methods for resolve and interrupt flows.
It should also own mission or task transitions into and out of `awaiting_approval` while coordinating with mission-repository queries that answer whether other pending approvals still exist for a mission.

After that, wire approval-aware orchestration and policy.
An approval-policy resolver should keep planner turns on `approvalPolicy = never` and allow executor mutation turns to request approval in the narrow M1.6 cases.
`OrchestratorRuntimePhase` should make the `running -> awaiting_approval` and `awaiting_approval -> running` transitions explicit and replayable for both task and mission state.
Interrupt intent should also be persisted through replay and later map terminal `interrupted` turns to `cancelled` with a specific reason, not a generic runtime failure.

Finally, add a thin resolve or interrupt command surface and focused tests.
For M1.6 that surface can live on the worker, because that process owns the live app-server client and session registry.
Protocol-level tests should prove that the fake app-server can emit approval requests and that the client can answer them.
DB-backed control-plane tests should prove pending approval persistence, awaiting-approval transitions, acceptance resumption, decline terminalization, and interrupt terminalization.
After that, update docs, record manual acceptance evidence, and run the required validation commands.

## Concrete Steps

Run these commands from the repository root as needed:

    codex app-server --help
    codex app-server generate-ts --out tmp/codex-app-server-schema-m1.6
    pnpm db:generate
    pnpm db:migrate
    pnpm --filter @pocket-cto/codex-runtime test
    pnpm --filter @pocket-cto/codex-runtime typecheck
    pnpm --filter @pocket-cto/control-plane test
    pnpm --filter @pocket-cto/control-plane typecheck
    pnpm --filter @pocket-cto/control-plane lint

If local execution remains possible after tests, also run manual acceptance through the fake runtime fixture and record:

- approval id
- approval kind
- task status before and after approval
- mission status before and after approval
- request id
- whether the live turn resumed
- final task status after interrupt
- replay event sequence around approval or interrupt

Implementation order:

1. Keep this ExecPlan current with discoveries, decisions, validation evidence, and remaining gaps.
2. Expand the runtime protocol and client in `packages/codex-runtime` for inbound server requests, typed approval request params, response payloads, and `serverRequest/resolved`.
3. Extend the fake app-server fixture so tests can emit mid-turn file-change approval requests, command or permission approval requests if supported, `serverRequest/resolved`, and interrupted terminal turns.
4. Add the approvals bounded context with repository, service, and schema modules.
5. Add the in-memory live session registry plus interrupt plumbing in `runtime-codex/`.
6. Add approval-policy resolution and wire approval-aware runtime orchestration plus replay-backed task or mission transitions.
7. Add command-surface, protocol-level, and DB-backed integration coverage.
8. Update docs and any minimal EP-0008 handoff notes.
9. Run the required validation and manual acceptance commands, then record exact results here.

## Validation and Acceptance

Success for M1.6 is demonstrated when all of these are true:

1. `@pocket-cto/codex-runtime` can parse and route server-initiated JSON-RPC requests for at least `item/fileChange/requestApproval`, and it keeps `turn/interrupt` support plus `serverRequest/resolved` parsing.
2. A protocol-level fake-fixture test proves a live turn can receive a file-change approval request mid-turn, answer it, observe `serverRequest/resolved`, and then reach terminal completion without requiring a real `codex` binary.
3. If supported in the current stable schema and added cleanly, command-execution or permission approval requests are also parsed and typed.
4. A DB-backed control-plane test proves that an approval request persists one `approvals` row with `status = pending`, the mapped `kind`, and payload fields that include `requestId`, `threadId`, `turnId`, `itemId`, and request-specific details where relevant.
5. The same test proves `approval.requested` replay is appended and the task plus mission move to `awaiting_approval` with explicit `task.status_changed` and `mission.status_changed` reasons such as `approval_requested`.
6. Resolving an approval as accepted or accepted-for-session updates the approval row, appends `approval.resolved`, returns the task to `running`, returns the mission to `running` when no other pending approvals remain, and lets the same live turn resume before terminalization.
7. Resolving an approval as declined or cancelled updates the approval row, appends `approval.resolved`, and does not fake successful continuation; the later terminal task outcome must match what the runtime actually does.
8. Interrupting an active task turn uses the live session registry to call `turn/interrupt`, appends replay for the operator interrupt intent, and later terminalizes with explicit `runtime_turn_interrupted` handling rather than `runtime_turn_failed`.
9. The preferred explicit final task state for interrupted turns is `cancelled`.
10. The new resolve-approval and interrupt-task command surfaces stay thin, with service logic in the approvals and runtime modules.
11. `docs/ops/codex-app-server.md` documents the approval plus interrupt lifecycle, and `docs/ops/local-dev.md` documents the single-process registry limitation honestly.

Manual acceptance should show at least:

- one file-change approval request accepted and resumed
- one interrupt accepted and terminalized as interrupted or cancelled
- no dependency on a real Codex binary

## Idempotence and Recovery

The M1.6 persistence path should remain additive.
The existing `approvals` table and replay enums already exist, so schema work should be avoided unless the implementation discovers one small additive field or enum export is truly required.
If schema generation or migration reports no changes, record that explicitly and continue.

Approval persistence must be safe to retry at the HTTP and service layer.
If a duplicate resolve call arrives after the approval row is already terminal, the service should return the current durable state instead of creating duplicate replay or duplicate session resolutions.
If a live approval session is missing because the worker restarted, the durable approval row and replay should still show that the request existed, and the response path should fail explicitly rather than pretending continuity exists.

Interrupts should also be safe to retry narrowly.
If the active turn is already terminal or the session registry no longer holds that task id, the interrupt service should report that the live session no longer exists and should not fabricate an interrupted terminalization.

Rollback for this slice is straightforward.
Revert the runtime protocol expansion, approvals bounded context, live session registry, and additive replay typing together.
Because multi-process durability is intentionally deferred, there should be no hidden background recovery path to unwind.

## Artifacts and Notes

Pre-implementation M1.6 gap notes captured from the verified local schema and current code:

1. Exact approval surfaces already present in the repo:
   the DB schema already has `approvals.kind`, `approvals.status`, `approvals.payload`, and replay event enums for `approval.requested` plus `approval.resolved`; the mission and task state machine already includes `awaiting_approval`; the runtime client already supports outbound `turn/interrupt`; and the worker runtime path already keeps one live client open for the duration of a turn.
2. Exact protocol gap in `packages/codex-runtime`:
   the client cannot currently parse or answer inbound server-initiated JSON-RPC requests, so stable approval methods such as `item/fileChange/requestApproval` and `item/commandExecution/requestApproval` have no typed handler path, no typed response path, and no `serverRequest/resolved` handling.
3. Exact persistence gap in the control plane:
   the approvals bounded context is still a placeholder, there is no approval repository or service, there is no mission or task transition logic into `awaiting_approval`, there is no persisted approval-resolution path, and there is no durable interrupt-intent replay.
4. Exact files intended for the first pass:
   `packages/codex-runtime/src/{protocol.ts,client.ts,index.ts,errors.ts,protocol.spec.ts}`, `apps/control-plane/src/{app.ts,bootstrap.ts,lib/types.ts}`, new `apps/control-plane/src/modules/approvals/*`, `apps/control-plane/src/modules/{missions,orchestrator,runtime-codex}/*` where approval state touches existing task flow, `packages/domain/src/replay-event.ts`, `packages/testkit/src/runtime/fake-codex-app-server.mjs`, and the two ops docs.
5. Approval-session strategy to implement:
   one single-process in-memory registry will hold the live client, current task id, current thread and turn ids, and a map of active request ids to resolver callbacks; approval rows and replay remain durable in Postgres, but approval continuity across worker restart is explicitly not guaranteed in M1.6.

Official protocol references checked before implementation:

- local CLI:
  `codex app-server --help`
  `codex app-server generate-ts --out tmp/codex-app-server-schema-m1.6`
- public docs:
  `https://developers.openai.com/codex/app-server/`

Validation results captured after implementation:

- `codex app-server --help`
  Result: confirmed the local CLI still exposes `generate-ts` and the app-server command surface needed for schema verification.
- `codex app-server generate-ts --out tmp/codex-app-server-schema-m1.6`
  Result: generated the stable bindings used to confirm `item/fileChange/requestApproval`, `item/commandExecution/requestApproval`, `item/permissions/requestApproval`, `serverRequest/resolved`, and `turn/interrupt`. The generated directory was removed after verification.
- `pnpm db:generate`
  Result: generated additive migration `packages/db/drizzle/0005_cynical_human_robot.sql` for the new replay enum value.
- `pnpm db:migrate`
  Result: migrated the primary local database successfully.
- `pnpm run db:migrate:ci`
  Result: migrated both `pocket_cto` and `pocket_cto_test`, which was required for the DB-backed interrupt suite to recognize `runtime.turn_interrupt_requested`.
- `pnpm --filter @pocket-cto/codex-runtime test`
  Result: passed.
- `pnpm --filter @pocket-cto/codex-runtime typecheck`
  Result: passed.
- `pnpm --filter @pocket-cto/config build`
  Result: refreshed the local referenced package output after this workspace still held stale `@pocket-cto/config` project-reference artifacts from before the new flag was added; no tracked files changed.
- `pnpm --filter @pocket-cto/control-plane test`
  Result: passed with 23 files and 80 tests after the typed embedded-mode config and bootstrap selection coverage was added.
- `pnpm --filter @pocket-cto/control-plane typecheck`
  Result: passed.
- `pnpm --filter @pocket-cto/control-plane lint`
  Result: passed.
- `pnpm --filter @pocket-cto/web typecheck`
  Result: passed after updating the mission action hint to advertise `pnpm dev:embedded`.
- `CONTROL_PLANE_EMBEDDED_WORKER=true` config hardening
  Result: the flag now parses through `@pocket-cto/config`, `.env.example`, bootstrap container selection, startup logs, and dedicated `dev:embedded` scripts instead of a direct `process.env` read in `src/server.ts`.
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/orchestrator/drizzle-service.spec.ts --repeat 5`
  Result: the installed Vitest version rejected `--repeat` as an unknown option, so the same DB-backed spec was re-run five times through a small local Node loop instead.
- repeated `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/orchestrator/drizzle-service.spec.ts`
  Result: passed 5 out of 5 consecutive runs, including the approval acceptance, decline, and interrupt paths that had been timing-sensitive.

Manual acceptance evidence captured with the fake app-server fixture and no real `codex` binary:

- File-change approval acceptance:
  approval id `b33292c7-87a6-4239-ba7d-b816a13d65cd`, kind `file_change`, request id `approval_file_change_1`, task `awaiting_approval -> running` before terminalization, mission `awaiting_approval -> running`, live turn resumed `true`, final task status `succeeded`, replay window `22:approval.requested`, `23:task.status_changed`, `24:mission.status_changed`, `25:approval.resolved`, `26:task.status_changed`, `27:mission.status_changed`, `28:runtime.item_started`, `29:runtime.item_completed`.
- Interrupt acceptance:
  task status before interrupt `running`, mission status before interrupt `running`, thread id `thread_fake_123`, turn id `turn_fake_123`, final task status `cancelled`, replay window `11:runtime.item_started`, `12:runtime.turn_interrupt_requested`, `13:runtime.turn_completed`, `14:task.status_changed`.

## Interfaces and Dependencies

Important existing interfaces and modules for this slice:

- `ReplayEventTypeSchema`, `MissionStatusChangeReasonSchema`, and `TaskStatusChangeReasonSchema` in `packages/domain/src/replay-event.ts`
- `MissionTaskStatusSchema` in `packages/domain/src/mission-task.ts`
- `approvals` in `packages/db/src/schema/artifacts.ts`
- `replayEvents` in `packages/db/src/schema/replay.ts`
- `CodexAppServerClient`, `KnownServerNotification`, `TurnInterruptParams`, `ThreadItem`, and JSON-RPC schemas in `packages/codex-runtime/src/`
- `MissionRepository`, `ReplayService`, `OrchestratorRuntimePhase`, `CodexRuntimeService`, and `WorkspaceService` in `apps/control-plane/src/modules/`

Expected new or expanded interfaces:

- typed approval request and response schemas in `@pocket-cto/codex-runtime`
- an approval-session registry interface under `runtime-codex/`
- approval repository or service interfaces under `modules/approvals/`
- explicit task or mission status reasons for approval-requested, approval-resolved resume, and interrupted terminalization if the existing unions are insufficient

External or runtime dependencies:

- local `codex app-server` for schema verification only
- fake app-server fixture for automated tests and manual acceptance
- existing Postgres dev and test databases
- one server-mode env flag for local embedded worker operation: `CONTROL_PLANE_EMBEDDED_WORKER=true`
- root and package-local embedded developer commands:
  `pnpm dev:embedded`
  `pnpm --filter @pocket-cto/control-plane dev:embedded`

## Outcomes & Retrospective

M1.6 now finishes with truthful durable approval persistence, explicit `awaiting_approval` state transitions, and narrow live-turn interrupt support without widening into GitHub or artifact-heavy follow-on work.

`@pocket-cto/codex-runtime` now accepts inbound server-initiated approval requests, typed file-change and command-execution approval responses, and `serverRequest/resolved` notifications while keeping low-level JSON-RPC mechanics inside the package boundary.
The control plane now persists runtime approvals, appends `approval.requested` and `approval.resolved`, resolves or cancels live approvals through a single-process session registry, and records operator interrupt intent through `runtime.turn_interrupt_requested`.
Planner turns remain `approvalPolicy = "never"`, while executor mutation turns now use an explicit policy resolver that returns `on-request`.
The durability hardening pass also means accepted approvals do not move task or mission state back to `running` until the live response handoff succeeds, and a lost live handoff now leaves an explicit `payload.liveContinuation.status = "delivery_failed"` marker instead of a silent false-positive resume.
The DB-backed approval or interrupt coverage now uses one shared 5-second wait helper with last-observation timeout reporting, and the full DB-heavy spec stayed green across five consecutive reruns.
The operator loop is now materially more complete as well: the API can list persisted approvals for a mission, resolve an approval through `POST /approvals/:approvalId/resolve`, and interrupt an active task through `POST /tasks/:taskId/interrupt` when the server is running with an embedded worker and therefore owns the live in-memory session registry for that process.
When the server is running in API-only mode, those same routes now fail honestly with `live_control_unavailable` instead of implying cross-process continuity that Pocket CTO does not have yet.
The embedded control mode is also easier to run and reason about locally now: the flag is typed in shared config, `.env.example` documents its safe default, the repo root exposes `pnpm dev:embedded`, and both the server and standalone worker log the active control mode at startup.
The web mission page now surfaces the persisted mission approvals, whether the current control-plane process has live control enabled, and the concrete `pnpm dev:embedded` hint when it does not, so operators can see the limitation without hunting through docs or replay.
Runtime permissions approvals also fail more honestly now: Pocket CTO rejects that unsupported surface explicitly in M1.6 instead of surfacing a generic missing-handler surprise.

The known intentional limitation for the end of this slice is single-process approval continuity.
If the worker restarts mid-approval, the approval row and replay should still explain what happened, but the live turn cannot yet be resumed automatically.

If this lands cleanly, M1.7 can start from a more honest base because approval traces and interrupt outcomes will already be durable and replayable instead of hidden inside runtime memory.
