# Replay and evidence

Pocket CTO should produce proof, not just status text.

## Proof bundle contract

Every successful mission should emit a proof bundle manifest with at least:

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

## Required artifact classes

- plan
- pull request link
- diff summary
- test report
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
