# Define F6B alert-to-investigation mission foundation

## Purpose / Big Picture

This file is the active implementation-ready Finance Plan for the next Pocket CFO F6 slice.
The target phase is `F6`, and the implementation slice is exactly `F6B-alert-to-investigation-mission-foundation`.

The user-visible goal is narrow: after shipped F6A records one deterministic source-backed `cash_posture` monitor result and one operator-visible alert-card posture, Pocket CFO should let the operator manually create or open one investigation mission from that existing alert.
The investigation handoff starts from stored monitor evidence, not from generic chat, report artifacts, or a new monitor family.

This plan is the first F6B contract.
It does not implement F6B in the plan-refresh slice.
It leaves `plans/FP-0050-monitoring-foundation-and-first-cash-posture-alert.md` as the shipped F6A record and leaves `plans/FP-0049-board-packet-circulation-note-reset-and-effective-record-hardening.md` as the shipped F5C4I record.
GitHub connector work is explicitly out of scope.

F6B must stay deterministic, source-backed, runtime-free, delivery-free, non-autonomous, and human-initiated.
It must not create missions automatically when monitors alert, run monitors on a schedule, send notifications, invoke runtime-codex, write investigation prose with an LLM, invent finance facts, create external actions, turn alerts into reports, add a second alert system, or reopen F5 reporting and approval lifecycles.

## Progress

- [x] 2026-04-26T21:33:22Z Audit shipped F6A monitor contracts, mission domain shape, proof-bundle boundaries, runtime-codex boundaries, alert-card UI, and active docs for F6B planning.
- [x] 2026-04-26T21:33:22Z Create FP-0051 as the single active implementation-ready F6B contract while preserving FP-0050 as the shipped F6A record and FP-0049 as the shipped F5C4I record.
- [x] 2026-04-26T21:33:22Z Refresh the smallest active-doc set needed to point the next thread at FP-0051 instead of stale FP-0050-next wording.
- [ ] Implement `F6B-alert-to-investigation-mission-foundation` in a later coding thread only after reading this plan.
- [ ] Run the implementation validation ladder after F6B code exists.

## Surprises & Discoveries

The existing mission domain already includes `MissionSourceKindSchema` value `alert`.
That means F6B probably does not need a broad new mission source family.
The preferred first implementation should use `sourceKind = "alert"` and a source ref tied to the persisted monitor result.

The existing `MissionTypeSchema` does not include `investigation`.
Because F6B is a human-reviewable follow-up analysis over stored alert evidence, the preferred first implementation should reuse `mission.type = "discovery"` rather than adding a new top-level mission family.
If implementation proves `discovery` cannot truthfully represent this handoff, the plan must be updated before adding any new mission type.

The F6A monitor result contract already carries the required alert seed: persisted result `id`, `companyKey`, `monitorKind = "cash_posture"`, `status = "alert"`, alert severity, conditions, source freshness or missing-source posture, lineage refs, limitations, proof posture, runtime boundary, and human-review next step.
F6B should copy or reference that deterministic posture rather than generating new analysis.

The current proof-bundle manifest is mission-shaped and already supports finance discovery/reporting fields, but it does not yet have monitor-investigation-specific fields.
The implementation should add only the narrow monitor-investigation fields needed for mission list/detail/proof visibility, or store the seed as a deterministic artifact if that is smaller.
Do not use report approval or report release fields for investigations.

## Decision Log

Decision: the first real F6B scope is `F6B-alert-to-investigation-mission-foundation`.
Rationale: the next thread needs one narrow implementation slice, not a broad monitoring workflow platform.

Decision: the F6B input contract starts from one persisted F6A `monitor_result`.
Rationale: the alert already exists as source-backed stored state. F6B must not start from generic chat, `finance_memo`, `board_packet`, `lender_update`, `diligence_packet`, or a new monitor kind.

Decision: F6B is manual alert-to-investigation handoff only.
Rationale: an operator explicitly chooses to create or open an investigation from an alert. Monitor runs must not automatically create missions, scheduled automation is out of scope, notifications are out of scope, and runtime-codex investigation writeups are out of scope.

Decision: reuse the existing mission engine and list/detail patterns.
Rationale: `mission.type = "discovery"` plus `sourceKind = "alert"` can truthfully represent a follow-up investigation without creating a broad new mission family. A new mission source kind should not be added unless `alert` proves insufficient.

Decision: if a mission input shape is needed, keep it narrow and tied to one monitor result.
Rationale: a minimal `monitorInvestigation` input can carry `monitorResultId`, `companyKey`, `monitorKind = "cash_posture"`, severity, conditions, freshness/missing-source posture, lineage summary, limitations, proof posture, and human-review next step without widening discovery questions or reporting inputs.

Decision: F6B must not invent finance facts or write new natural-language analysis.
Rationale: the investigation seed can summarize deterministic fields already present on the alert card, but it must not add LLM-authored remediation, advice, cash recommendations, runway, burn, covenant interpretation, or legal/tax/accounting conclusions.

Decision: F6B stays runtime-free and delivery-free.
Rationale: no runtime-codex drafting, no runtime-codex investigation writeups, no email, Slack, external notification, send, distribute, publish, payment, journal booking, tax filing, legal advice, or autonomous monitoring language belongs in the first handoff slice.

Decision: F6B must not add monitor families or reopen F5.
Rationale: collections, payables, policy, covenant, runway, burn, concentration, and anomaly monitors are later slices. F5 report release, circulation, correction, approval, and artifact lifecycles remain shipped records and are not inputs to this handoff.

Decision: no new approval kind is expected for F6B.
Rationale: the handoff itself is a direct human-initiated operator action. A separate approval would add workflow ceremony without proving a needed safety boundary. If implementation proves an acknowledgement is unavoidable, this plan must be amended with the concrete reason before touching approvals.

Decision: later F6 slices are likely F6C collections or payables pressure monitor foundation, F6D policy or covenant threshold monitor foundation, and F6E monitor demo replay and stack-pack foundation.
Rationale: those are separate product questions and must not be implemented or created as new Finance Plans in this slice.

Decision: preserve current module vocabulary.
Rationale: monitoring remains under `apps/control-plane/src/modules/monitoring/**`, missions remain under `apps/control-plane/src/modules/missions/**`, and this plan does not rename `modules/twin/**`, `modules/reporting/**`, or the `@pocket-cto/*` package scope.

## Context and Orientation

Pocket CFO has shipped:

- F1 raw source registration and immutable file ingest
- F2A through F2O deterministic Finance Twin breadth
- F3A through F3D deterministic CFO Wiki compilation, lint/export, concepts, metrics, and policy pages
- F4A through F4C2 deterministic finance discovery for the shipped families only
- F5A through F5C4I deterministic reporting, packet, release, circulation, correction, actor, and note-reset posture
- F6A deterministic `cash_posture` monitoring over stored Finance Twin cash-posture state only

FP-0050 is the shipped F6A implementation record.
F6A now supports:

- `packages/domain/src/monitoring.ts` with a pure `cash_posture` monitor result and alert-card contract
- `apps/control-plane/src/modules/monitoring/**` with run/latest services and repository persistence
- `POST /monitoring/companies/:companyKey/cash-posture/run`
- `GET /monitoring/companies/:companyKey/cash-posture/latest`
- `apps/web/components/monitoring-alert-card.tsx` and `apps/web/app/monitoring/**`
- `pnpm smoke:cash-posture-monitor:local`

The F6B implementation should read a persisted monitor result, not rerun the monitor as part of mission creation.
It should create or open one mission only after an operator action from an existing alert card.

Relevant current contracts:

- `packages/domain/src/monitoring.ts` for `MonitorResult`, `MonitorAlertCard`, source freshness posture, lineage refs, limitations, proof posture, and runtime boundary
- `packages/domain/src/mission.ts` for `MissionTypeSchema`, `MissionSourceKindSchema`, and `MissionSpecInputSchema`
- `packages/domain/src/mission-detail.ts` and `packages/domain/src/mission-list.ts` for operator-visible read models
- `packages/domain/src/proof-bundle.ts` for mission proof-bundle posture
- `apps/control-plane/src/modules/monitoring/**` for the monitor-result repository and F6A service
- `apps/control-plane/src/modules/missions/**` for typed mission creation, replay, list/detail read models, and placeholder proof bundles
- `apps/control-plane/src/modules/evidence/**` for proof-bundle assembly and evidence summaries
- `apps/web/app/monitoring/**`, `apps/web/app/missions/**`, `apps/web/components/monitoring-alert-card.tsx`, `apps/web/components/mission-card.tsx`, and `apps/web/components/mission-list-card.tsx` for operator UI patterns

## Plan of Work

First, add the narrow domain contract for a monitor-alert investigation seed.
The preferred shape is an additive schema that represents one `cash_posture` alert handoff from one persisted monitor result.
It should not add a new discovery question family, report kind, approval kind, monitor kind, or top-level mission type.

Second, add one mission-creation path that reuses the mission engine.
The preferred service entry point is a typed method such as `createMonitorInvestigation`.
It should validate the input monitor result exists, is `monitorKind = "cash_posture"`, has `status = "alert"`, has an alert card, belongs to the requested `companyKey`, and already includes the required source/freshness/proof/limitation posture.
The mission should use `mission.type = "discovery"`, `sourceKind = "alert"`, `sourceRef = "pocket-cfo://monitor-results/<monitorResultId>"`, and no primary repo.

Third, keep the route thin.
The preferred HTTP surface is a mission-owned manual action such as `POST /missions/monitoring-investigations`, with a body containing `monitorResultId`, `companyKey`, and `requestedBy`.
The route should parse input, call the mission service, and serialize the result.
It must not contain SQL, monitor evaluation logic, prompt assembly, or finance analysis.

Fourth, make the operator surface explicit and manual.
The monitoring alert card may show a create/open investigation action only when the latest persisted result is an alert.
The action should create or open the mission and redirect to mission detail.
There should be no scheduled run, no background mission creation, no notification subscribe/send UI, no report conversion, and no approval action.

Fifth, expose deterministic seed posture in mission detail/list/proof.
The mission read models should show enough context for a human to understand the alert handoff:
monitor result id, company key, monitor kind, severity, condition summaries, source freshness or missing-source posture, lineage summary, limitations, proof posture, and human-review next step.
If the smallest implementation is to persist a deterministic artifact instead of widening the proof bundle, record that decision in this plan before coding.

## Concrete Steps

1. Add the F6B domain contract.
   Expected files:
   - `packages/domain/src/monitoring.ts` or a narrow adjacent domain file
   - `packages/domain/src/mission.ts`
   - `packages/domain/src/mission-detail.ts`
   - `packages/domain/src/mission-list.ts`
   - narrow adjacent specs

   The contract must carry:
   - `monitorResultId`
   - `companyKey`
   - `monitorKind = "cash_posture"`
   - `alertSeverity`
   - condition summaries and condition kinds
   - source freshness or missing-source posture
   - source lineage summary or refs
   - limitations
   - proof posture
   - human-review next step

2. Add one monitor-result lookup seam.
   Expected files:
   - `apps/control-plane/src/modules/monitoring/repository.ts`
   - `apps/control-plane/src/modules/monitoring/drizzle-repository.ts`
   - `apps/control-plane/src/modules/monitoring/service.ts` only if the reader belongs there
   - narrow repository specs

   The lookup must read stored monitor results only.
   It must not rerun the monitor, mutate raw sources, refresh the Finance Twin, create a new alert, or recalculate severity in F6B.

3. Add the mission creation service path.
   Expected files:
   - `apps/control-plane/src/modules/missions/schema.ts`
   - `apps/control-plane/src/modules/missions/service.ts`
   - a narrow helper such as `apps/control-plane/src/modules/missions/monitor-investigation.ts`
   - `apps/control-plane/src/modules/missions/events.ts` only if a specific replay reason helper is useful
   - narrow adjacent specs

   The implementation should:
   - reject non-alert monitor results
   - reject monitor kinds other than `cash_posture`
   - reject alert handoff if the stored alert card is missing required posture
   - create one mission only through an explicit operator request
   - append normal mission replay through the existing `mission.created`, `task.created`, `mission.status_changed`, and `artifact.created` path
   - avoid runtime-codex, delivery, notifications, report artifacts, approvals, and external actions

4. Add one thin route if needed by the operator surface or smoke.
   Expected files:
   - `apps/control-plane/src/modules/missions/routes.ts`
   - route specs

   Preferred route:
   - `POST /missions/monitoring-investigations`

   Preferred body:
   - `monitorResultId`
   - `companyKey`
   - `requestedBy`

   The route should call the mission service only.

5. Add the operator action and read-model display.
   Expected files:
   - `apps/web/lib/api.ts`
   - `apps/web/app/monitoring/**`
   - `apps/web/app/missions/**`
   - `apps/web/components/monitoring-alert-card.tsx`
   - `apps/web/components/mission-card.tsx`
   - `apps/web/components/mission-list-card.tsx`
   - narrow adjacent specs

   The UI should:
   - show a manual create/open investigation action only from an alert card
   - redirect to the created or existing mission detail
   - show the deterministic alert seed posture in mission detail/list
   - avoid notification, send, publish, report, approval, payment, journal, tax, or legal-action controls

6. Refresh docs only after implementation changes behavior.
   Expected docs:
   - `README.md`
   - `START_HERE.md`
   - `docs/ACTIVE_DOCS.md`
   - `plans/ROADMAP.md`
   - `docs/ops/local-dev.md`
   - optional active docs only if their F6B guidance becomes stale

No package script, smoke command, eval dataset, migration, schema, route, or runtime code is added by this plan-refresh slice.
Those are future implementation choices only after this plan is active.

## Validation and Acceptance

This docs-and-plan thread should run the preserved confidence ladder after the plan and active-doc refresh:

- `pnpm smoke:source-ingest:local`
- `pnpm smoke:finance-twin:local`
- `pnpm smoke:finance-twin-account-catalog:local`
- `pnpm smoke:finance-twin-general-ledger:local`
- `pnpm smoke:finance-twin-snapshot:local`
- `pnpm smoke:finance-twin-reconciliation:local`
- `pnpm smoke:finance-twin-period-context:local`
- `pnpm smoke:finance-twin-account-bridge:local`
- `pnpm smoke:finance-twin-balance-bridge-prerequisites:local`
- `pnpm smoke:finance-twin-source-backed-balance-proof:local`
- `pnpm smoke:finance-twin-balance-proof-lineage:local`
- `pnpm smoke:finance-twin-bank-account-summary:local`
- `pnpm smoke:finance-twin-receivables-aging:local`
- `pnpm smoke:finance-twin-payables-aging:local`
- `pnpm smoke:finance-twin-contract-metadata:local`
- `pnpm smoke:finance-twin-card-expense:local`
- `pnpm smoke:cfo-wiki-foundation:local`
- `pnpm smoke:cfo-wiki-document-pages:local`
- `pnpm smoke:cfo-wiki-lint-export:local`
- `pnpm smoke:cfo-wiki-concept-metric-policy:local`
- `pnpm smoke:finance-discovery-answer:local`
- `pnpm smoke:finance-discovery-supported-families:local`
- `pnpm smoke:finance-policy-lookup:local`
- `pnpm smoke:finance-discovery-quality:local`
- `pnpm eval:finance-discovery-quality`
- `pnpm smoke:finance-memo:local`
- `pnpm smoke:finance-report-filed-artifact:local`
- `pnpm smoke:board-packet:local`
- `pnpm smoke:board-packet-circulation-approval:local`
- `pnpm smoke:board-packet-circulation-log:local`
- `pnpm smoke:board-packet-circulation-log-correction:local`
- `pnpm smoke:board-packet-circulation-actor-correction:local`
- `pnpm smoke:board-packet-circulation-note-reset:local`
- `pnpm smoke:lender-update:local`
- `pnpm smoke:diligence-packet:local`
- `pnpm smoke:lender-update-release-approval:local`
- `pnpm smoke:lender-update-release-log:local`
- `pnpm smoke:diligence-packet-release-approval:local`
- `pnpm smoke:diligence-packet-release-log:local`
- `pnpm smoke:cash-posture-monitor:local`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

F6B implementation acceptance is observable only if all of the following are true:

- one operator action can create or open one investigation mission from one persisted `cash_posture` alert monitor result
- non-alert monitor results cannot create investigation missions
- monitor results from any monitor kind other than `cash_posture` cannot create investigation missions
- the mission carries `monitorResultId`, `companyKey`, monitor kind, alert severity, conditions, source freshness or missing-source posture, lineage summary, limitations, proof posture, and human-review next step
- the mission is deterministic and source-backed by the stored monitor result and alert card
- the mission is created only by explicit operator action
- no monitor run automatically creates a mission
- no scheduled monitor automation, notification, delivery, runtime-codex investigation writeup, report conversion, approval kind, accounting write, bank write, tax filing, legal advice, or external action is added
- F5 reporting and approval lifecycles remain unchanged

## Idempotence and Recovery

The implementation should be retry-safe.
If the operator clicks create/open more than once for the same `monitorResultId`, F6B should open the existing investigation mission or deterministically avoid duplicate active missions for the same alert.
The preferred uniqueness scope is one company, one `cash_posture` monitor result, and one investigation mission.

If mission creation fails, the transaction should not leave a partial mission without its input and placeholder proof bundle.
Raw sources and monitor results must not be mutated to make the handoff pass.
If the stored monitor result is missing, stale, non-alerting, malformed, or lacks the alert-card posture required by this plan, the service should reject the handoff with a clear invalid-request response.

Rollback should revert the additive F6B domain, mission-service, route, UI, and test changes while leaving FP-0050, the F6A monitor result persistence, F5 reporting/approval behavior, raw sources, and Finance Twin state intact.

## Artifacts and Notes

Expected F6B implementation artifacts:

- one narrow domain contract or mission input for monitor-alert investigation handoff
- one stored mission with `sourceKind = "alert"` and a monitor-result source ref
- one mission detail/list read-model posture for the deterministic alert seed
- one proof-bundle or mission artifact posture that references the monitor result without pretending the alert is a report
- narrow service, route, and UI specs
- active docs refreshed only for behavior that actually ships

This plan-refresh slice produces no runtime artifact, route, schema, migration, package script, smoke command, eval dataset, or implementation scaffold.

## Interfaces and Dependencies

Package boundaries remain unchanged:

- `packages/domain` owns pure monitor-investigation contracts and shared schemas
- `packages/db` owns persistence only if implementation adds a uniqueness link between monitor results and missions
- `apps/control-plane/src/modules/monitoring` owns monitor-result storage and reads
- `apps/control-plane/src/modules/missions` owns investigation mission creation, list/detail read models, and mission replay
- `apps/control-plane/src/modules/evidence` owns proof-bundle assembly only if monitor-investigation posture is added to proof bundles
- `apps/web` owns operator actions and read models only

Runtime-codex remains out of scope:

- no runtime-codex drafting
- no runtime-codex investigation writeups
- no natural-language autonomous monitoring
- no runtime-owned finance facts

Delivery remains out of scope:

- no email
- no Slack
- no external notification
- no send, distribute, publish, pay, book, file, release, tax filing, or legal action

Current module vocabulary stays stable:

- monitoring remains under `apps/control-plane/src/modules/monitoring/**`
- missions remain under `apps/control-plane/src/modules/missions/**`
- do not rename `modules/twin/**`
- do not rename `modules/reporting/**`
- do not rename `@pocket-cto/*`
- do not delete GitHub or engineering-twin modules as part of F6B

No new environment variables are expected.
No stack-pack or plugin changes are expected.
No GitHub connector work is in scope.

## Outcomes & Retrospective

This docs-and-plan slice is expected to end with FP-0051 as the active implementation contract and no F6B runtime behavior implemented.
The next Codex thread should start F6B implementation from this plan only.

What remains:

- implement the narrow monitor-alert investigation mission contract
- add the manual create/open investigation operator path
- prove idempotent handoff from one persisted `cash_posture` alert
- keep runtime-codex, delivery, notifications, approvals, reporting, new monitor families, and external actions out of scope
