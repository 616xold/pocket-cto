# Replay and evidence

Pocket CTO should produce proof, not just status text.

## Proof bundle contract

Every mission persists a `proof_bundle_manifest` artifact.
Successful GitHub-aware missions should advance that manifest into a decision-ready package with at least:

- objective contract
- change summary
- verification evidence
- risk notes
- rollback or safe fallback notes
- approval trace
- artifact index
- replay entrypoint

During M0, the placeholder proof bundle is persisted explicitly as an
`artifacts.kind = 'proof_bundle_manifest'` record.
The manifest JSON lives under `artifacts.metadata.manifest` so the evidence
ledger can expose the placeholder before real bundle assembly exists.

During M2.5, Pocket CTO stops treating the proof bundle as a mutable notes blob
and instead assembles a final manifest from persisted state inside the evidence
boundary. The manifest now includes:

- mission identity and objective
- target repo full name
- branch name
- PR number and URL when present
- artifact ids plus artifact kinds
- latest approval summary
- validation summary
- concise change summary
- concise verification summary
- concise risk summary
- concise rollback summary
- evidence completeness
- replay event count
- key timestamps for mission creation, planner evidence, executor evidence, PR publication, approval updates, and latest artifact persistence

The manifest status is explicit and deterministic:

- `placeholder` when no meaningful evidence exists beyond the initial placeholder artifact
- `incomplete` when meaningful evidence exists but one or more GitHub-first proof requirements are still missing, or a blocking approval is still pending
- `ready` when `plan`, `diff_summary`, `test_report`, and `pr_link` all exist, the latest executor task succeeded, and there is no pending approval
- `failed` when the latest planner, executor, or mission posture is terminal and non-shippable, or the latest approval resolved to `declined`, `cancelled`, or `expired`

Proof-bundle refresh is triggered narrowly after:

1. planner evidence persistence
2. executor evidence persistence
3. PR-link persistence
4. approval resolution when it changes operator posture

The operator mission-detail read model now exposes that persisted evidence
directly. `GET /missions/:missionId` includes approval summaries and artifact
summaries alongside the proof bundle so the web surface can show the durable
evidence ledger without replaying raw rows client-side. That same response now
also includes concise `approvalCards` derived from persisted approval rows plus
task and proof-bundle context, so the operator-facing card copy remains tied to
durable evidence instead of becoming a hidden UI-only narrative. Approvals are
shown oldest-first for decision-trace readability, and artifacts are shown
oldest-first by `createdAt` so the ledger lines up with replay order.

## Replay event philosophy

Pocket CTO is not full event sourcing in v1.
Relational tables remain the operational source of truth.

However, every important mission or task action must append replay events so that:

- the UI can reconstruct a narrative
- evaluations can score runs
- failures can be debugged later
- polished public replays can be generated

Replay ordering must be deterministic.
The control plane assigns each replay event a mission-local integer ordinal and
the replay list API returns events ordered by that ordinal, not by timestamp
coincidence.

For the M0 text-intake spine, the initial replay order is deliberate:

1. `mission.created`
2. one `task.created` event per materialized task, in task sequence order
3. `mission.status_changed` for `planned -> queued` with
   `reason = "tasks_materialized"`
4. `artifact.created` for the proof-bundle placeholder

That ordering keeps the queued transition visibly tied to task materialization
before later worker or runtime events exist.

For M1.6 live approvals and interrupts, the replay narrative now also includes:

1. `approval.requested` when Codex App Server asks for approval mid-turn
2. `task.status_changed` and `mission.status_changed` into `awaiting_approval`
3. `approval.resolved` when the operator accepts, declines, or cancels
4. `task.status_changed` and `mission.status_changed` back to `running` when the approval is accepted and no other pending approvals remain
5. `runtime.turn_interrupt_requested` when the operator interrupts an active live turn
6. terminal `runtime.turn_completed` plus final `task.status_changed` with `reason = "runtime_turn_interrupted"` when the runtime later reports `interrupted`

This keeps approval trace and operator interrupt intent durable in replay instead of hiding them inside worker memory.

For M1.7 runtime evidence mapping, replay remains compact and artifact-first:

1. `runtime.turn_completed`
2. terminal `task.status_changed`
3. one `artifact.created` per persisted runtime artifact placeholder
4. proof-bundle manifest enrichment in place without separate verbose replay

This keeps replay reconstructable without storing token-by-token runtime text.

For M2.5 proof-bundle manifest assembly, replay stays compact but becomes more
truthful about operator-facing bundle changes:

1. the initial proof-bundle placeholder still appends `artifact.created`
2. later material manifest updates append `proof_bundle.refreshed`
3. refreshes are only emitted for planner evidence, executor evidence, PR-link persistence, and approval resolution
4. no replay event is appended when the assembled manifest is identical to the currently persisted manifest

## Required artifact classes

- plan
- pull request link
- diff summary
- test report
- log excerpt
- screenshot
- benchmark or metrics delta
- rollback note
- approval card
- proof bundle manifest

## Outbox pattern

Use a Postgres outbox table for events that must be delivered asynchronously to:

- web UI projections
- push notifications
- later mobile bridges
- analytics and evaluation sinks

## Repository implementation map

- Domain contracts: `packages/domain/src/proof-bundle.ts`, `packages/domain/src/replay-event.ts`
- DB schema: `packages/db/src/schema/artifacts.ts`, `packages/db/src/schema/outbox.ts`
- Service layer: `apps/control-plane/src/modules/evidence/`
- Replay projection: `apps/control-plane/src/modules/replay/`
