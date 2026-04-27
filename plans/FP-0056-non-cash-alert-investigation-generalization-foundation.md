# Define F6G non-cash alert investigation generalization foundation

## Purpose / Big Picture

This file is the active Finance Plan contract for Pocket CFO F6G.
The target phase is `F6`, and the implementation slice is exactly `F6G-non-cash-alert-to-investigation-generalization-foundation`.

The user-visible goal is narrow: after shipped F6A through F6F, Pocket CFO should generalize the shipped manual alert-to-investigation handoff beyond cash only, but only where the stored monitor result already carries enough deterministic source posture to seed a taskless human-review mission safely.
Repo truth supports that next move for a first non-cash family because shipped `collections_pressure`, `payables_pressure`, and `policy_covenant_threshold` monitor results already persist source freshness or missing-source posture, lineage refs, limitations, proof posture, deterministic severity rationale, human-review next steps, runtime-free posture, and alert cards when alerting.

F6G should not implement a broad all-non-cash investigation platform.
The first implementation should preserve existing `cash_posture` behavior and add exactly one non-cash family: `collections_pressure`.
Collections comes first because it is operationally close to cash, is backed by stored receivables-aging or collections-posture Finance Twin state, carries source-backed lineage and freshness posture, and can remain a human-review follow-up without collection instructions, legal advice, delivery, payment behavior, report conversion, or autonomous remediation.

`payables_pressure` is technically close to the same seed shape, but it has a sharper payment-instruction and vendor-payment recommendation boundary, so it stays out of the first F6G implementation.
`policy_covenant_threshold` carries enough monitor-source posture for review, but policy/covenant investigations risk legal or policy advice unless a later plan proves safer copy, UX, and acceptance boundaries, so it stays out of F6G implementation.

This is a docs-and-plan contract.
This slice creates no code, routes, schema, migrations, package scripts, smoke commands, eval datasets, runtime behavior, delivery behavior, report behavior, approval behavior, payment behavior, legal or policy advice, or implementation scaffolding.
FP-0050 through FP-0055 remain shipped F6A through F6F records.
GitHub connector work is explicitly out of scope.

## Progress

- [x] 2026-04-27T22:52:07Z Invoke the requested Pocket CFO operator plugin guards and audit the shipped F6A through F6F docs, monitoring contracts, mission handoff path, proof-bundle posture, UI read models, demo replay boundary, and validation aliases.
- [x] 2026-04-27T22:52:07Z Decide that F6G is justified as a narrow `collections_pressure` first non-cash handoff rather than falling back to F6H close/control planning.
- [x] 2026-04-27T22:52:07Z Create FP-0056 as the single active implementation-ready F6G contract while preserving FP-0050 through FP-0055 as shipped records.
- [x] 2026-04-27T22:52:07Z Refresh the active-doc spine so the next implementation thread starts from FP-0056 and does not reopen F6F or start F6H or later.
- [x] 2026-04-27T23:00:58Z Run the docs-and-plan validation ladder requested for this slice.
- [ ] Later implementation: widen the shipped manual monitor-investigation handoff to `collections_pressure` only, preserving existing cash behavior and keeping payables and policy/covenant investigations absent.

## Surprises & Discoveries

The shipped monitor result schema already carries the seed posture needed for a manual investigation handoff across monitor families.
`packages/domain/src/monitoring.ts` defines `MonitorResult`, `MonitorAlertCard`, source freshness posture, source lineage refs, limitations, proof posture, deterministic severity rationale, runtime boundary, and human-review next step for all shipped monitor kinds.

The shipped F6B seed remains intentionally cash-only today.
`MonitorInvestigationSeedSchema` uses `monitorKind: z.literal("cash_posture")`, `apps/control-plane/src/modules/missions/monitor-investigation.ts` rejects any stored result whose `monitorKind` is not `cash_posture`, and `apps/web/components/monitoring-alert-card.tsx` shows `Create/open investigation` only for cash alerts.

The mission read models can carry a generalized seed without adding runtime work.
Mission detail, mission list, and proof-bundle schemas already expose `monitorInvestigation` as copied seed posture, and F6B already creates a taskless succeeded mission with no discovery answer, no report view, no approvals, no runnable tasks, and only a `proof_bundle_manifest` artifact.

The demo replay proves the non-cash boundary deliberately.
`pnpm smoke:monitor-demo-replay:local` verifies the four shipped monitors and asserts that collections, payables, and policy/covenant monitor results do not currently create investigations.
F6G should change that boundary only for the first planned family and should update the replay expectation only if the future implementation plan explicitly includes it.

The safest first F6G family is `collections_pressure`.
The shipped collections smoke asserts source lineage, source freshness, limitations, proof posture, deterministic severity rationale, human-review next step, idempotent run-key behavior, and absence of missions, reports, approvals, delivery, runtime-Codex threads, notifications, investigations, and autonomous finance action.
That makes it a close match for the shipped F6B seed pattern without crossing payment or policy/legal boundaries.

## Decision Log

Decision: proceed with F6G rather than switching to F6H first.
Rationale: repo truth supports one narrow non-cash investigation handoff now; delaying to close/control would leave the shipped monitor alert cards without a safe manual follow-up path even though collections alert evidence already carries the required deterministic posture.

Decision: F6G is manual operator-initiated only.
Rationale: the F6B pattern is safe because the operator explicitly creates or opens the mission from an alert card. F6G should keep that shape.

Decision: F6G must not create missions automatically when a monitor alerts.
Rationale: monitor results are deterministic findings over stored state, not autonomous workflow triggers.

Decision: F6G must not schedule monitors.
Rationale: scheduling is a separate adoption-loop and notification problem and is not needed for the handoff contract.

Decision: F6G must not send notifications.
Rationale: notification and delivery semantics are out of scope until a later named plan proves a safe operator-review path.

Decision: F6G must not run runtime-Codex or write investigation prose with an LLM.
Rationale: the handoff mission should copy stored monitor posture only. It should not generate analysis, advice, or remediation text.

Decision: F6G must not create reports or approvals.
Rationale: alert investigation handoff is not report conversion, release readiness, circulation readiness, or a new approval kind.

Decision: F6G must not add delivery or outbox send behavior.
Rationale: the product safety boundary keeps external communication release separate from internal review posture.

Decision: F6G must not create payment instructions, vendor-payment recommendations, collection actions, legal advice, policy advice, or autonomous remediation.
Rationale: the mission is a source-backed review package, not an instruction engine.

Decision: preserve existing cash-only behavior and widen only where deterministic source posture supports it.
Rationale: `cash_posture` create/open idempotency, source refs, proof-bundle posture, and UI behavior must remain green. F6G adds only the approved non-cash family.

Decision: start with exactly one non-cash monitor family, `collections_pressure`.
Rationale: full generalization across collections, payables, and policy/covenant is too broad for one safe implementation slice. Collections is source-backed and close to cash; payables and policy/covenant remain excluded in the first F6G implementation.

Decision: define later slices without creating them.
Rationale: likely later work is `F6H-close-control-checklist-foundation`, `F6I-stack-pack-expansion`, and `F6J-notification-delivery-planning` only if a future plan proves safety. This docs slice creates no FP-0057 and starts none of that implementation.

## Context and Orientation

Pocket CFO has shipped:

- F6A deterministic `cash_posture` monitor result and alert card
- F6B manual taskless investigation handoff from one persisted alerting `cash_posture` monitor result
- F6C deterministic `collections_pressure` monitor result and alert card while remaining investigation-free
- F6D deterministic `payables_pressure` monitor result and alert card while remaining investigation-free, payment-free, and delivery-free
- F6E deterministic `policy_covenant_threshold` monitor result and alert card while remaining investigation-free, legal-advice-free, policy-advice-free, and delivery-free
- F6F one deterministic monitor demo replay and one Pocket CFO demo stack-pack foundation that proves the shipped cash-only handoff and non-cash investigation absence

The current backend monitoring surface is:

- `POST /monitoring/companies/:companyKey/cash-posture/run`
- `GET /monitoring/companies/:companyKey/cash-posture/latest`
- `POST /monitoring/companies/:companyKey/collections-pressure/run`
- `GET /monitoring/companies/:companyKey/collections-pressure/latest`
- `POST /monitoring/companies/:companyKey/payables-pressure/run`
- `GET /monitoring/companies/:companyKey/payables-pressure/latest`
- `POST /monitoring/companies/:companyKey/policy-covenant-threshold/run`
- `GET /monitoring/companies/:companyKey/policy-covenant-threshold/latest`
- `POST /missions/monitoring-investigations` for persisted alerting `cash_posture` monitor results only

The relevant implementation seams for the future F6G implementation are:

- `packages/domain/src/monitoring.ts` for monitor kinds, monitor results, alert cards, runtime boundaries, and the current cash-only monitor investigation seed
- `packages/domain/src/mission.ts`, `packages/domain/src/mission-detail.ts`, `packages/domain/src/mission-list.ts`, and `packages/domain/src/proof-bundle.ts` for mission input, mission read models, and proof-bundle seed posture
- `apps/control-plane/src/modules/monitoring/**` for persisted monitor result reads
- `apps/control-plane/src/modules/missions/monitor-investigation.ts`, `service.ts`, `routes.ts`, and `schema.ts` for the manual create/open handoff
- `apps/control-plane/src/modules/evidence/**` only for proof posture and artifact summary conventions, not for report conversion
- `apps/web/components/monitoring-alert-card.tsx`, `apps/web/components/mission-card.tsx`, and `apps/web/components/mission-list-card.tsx` for operator read models
- `tools/cash-posture-alert-investigation-smoke.mjs`, `tools/collections-pressure-monitor-smoke.mjs`, and `tools/monitor-demo-replay-smoke.mjs` for current proof patterns

GitHub connector work is out of scope.
No new environment variables are expected.
No runtime-Codex behavior is expected.
No stack-pack expansion is expected in F6G.

## Plan of Work

First, widen the pure monitor-investigation seed contract from cash-only to an explicit allowlist that includes `cash_posture` and `collections_pressure`.
The widening should keep a finite union or helper, not a loose `MonitorKindSchema`, so `payables_pressure` and `policy_covenant_threshold` remain rejected in the first F6G implementation.

Second, generalize the mission handoff helper without changing the taskless lifecycle.
The helper should continue to read one stored monitor result by id, require `status = "alert"`, require an alert card, validate company key and required posture, copy the stored evidence into the mission seed, and create or open one mission by `sourceKind = "alert"` and `sourceRef = "pocket-cfo://monitor-results/<monitorResultId>"`.

Third, keep the route and service surface unchanged unless implementation proves a tiny name change is required.
`POST /missions/monitoring-investigations` can remain the manual action route because the input is already generic by `monitorResultId` and `companyKey`.
The route must stay thin.

Fourth, update the operator read model so collections alerts expose the same create/open action as cash alerts.
The UI copy must remain review-oriented, not action-oriented: "Create/open investigation" is acceptable, while "send collection notice", "contact customer", "collect payment", or similar action wording is not.

Fifth, add a future implementation proof that collections alerts can create/open a taskless deterministic investigation mission and that payables and policy/covenant alerts still cannot.
The future proof should also keep `pnpm smoke:monitor-demo-replay:local` aligned with the new boundary if the replay fixture produces a collections alert.

## Concrete Steps

1. Widen the domain seed allowlist.
   Expected future implementation files:
   - `packages/domain/src/monitoring.ts`
   - `packages/domain/src/monitoring.spec.ts`
   - `packages/domain/src/mission-detail.spec.ts`
   - `packages/domain/src/mission-list.spec.ts`
   - `packages/domain/src/proof-bundle.spec.ts`

   Required behavior:
   - `MonitorInvestigationSeedSchema.monitorKind` accepts `cash_posture` and `collections_pressure` only
   - existing cash seeds remain valid and unchanged
   - `payables_pressure` remains invalid for F6G first implementation
   - `policy_covenant_threshold` remains invalid for F6G first implementation
   - the seed continues to require alert status, alert severity, condition details, source freshness, source lineage refs, limitations, proof posture, human-review next step, runtime boundary, source ref, and monitor/alert timestamps

2. Generalize the control-plane handoff helper.
   Expected future implementation files:
   - `apps/control-plane/src/modules/missions/monitor-investigation.ts`
   - `apps/control-plane/src/modules/missions/service.ts` only if copy or method names need narrow updates
   - `apps/control-plane/src/modules/missions/routes.spec.ts`
   - `apps/control-plane/src/modules/missions/service.spec.ts`
   - `apps/control-plane/src/modules/missions/detail-view.spec.ts`
   - `apps/control-plane/src/modules/missions/drizzle-service.spec.ts` if source-ref idempotency coverage needs a collections case

   Required behavior:
   - read the stored monitor result only; do not rerun any monitor
   - reject non-alert results
   - reject malformed or posture-incomplete results
   - reject payables and policy/covenant results in this first F6G slice
   - preserve one mission per alert source ref
   - keep created mission status `succeeded`, `mission.type = "discovery"`, `sourceKind = "alert"`, no tasks, no discovery answer, no report, no approval, no outbox event, and no runtime-Codex thread
   - keep replay limited to mission creation, status change, and proof-bundle artifact creation for the handoff mission

3. Preserve or lightly generalize proof-bundle wording.
   Expected future implementation files:
   - `apps/control-plane/src/modules/missions/monitor-investigation.ts`
   - `apps/control-plane/src/modules/missions/detail-view.ts`
   - `apps/web/components/mission-card.tsx`
   - `apps/web/components/mission-list-card.tsx`

   Required behavior:
   - proof-bundle summaries should say "monitor-alert investigation" rather than "cash-only" where the seed can be collections
   - collection-specific copy should say review receivables-aging source coverage, freshness, limitations, and collections posture before any external collections action
   - no generated investigation prose is created
   - limitations remain copied from the stored monitor result

4. Update the operator action.
   Expected future implementation files:
   - `apps/web/components/monitoring-alert-card.tsx`
   - `apps/web/components/monitoring-alert-card.spec.tsx`
   - `apps/web/app/monitoring/page.spec.tsx` if the page fixture needs an action assertion

   Required behavior:
   - show create/open investigation for `cash_posture` and `collections_pressure` alert cards with monitor result ids
   - do not show the action for `payables_pressure` or `policy_covenant_threshold`
   - do not add notification, send, publish, report, approval, payment, legal, policy-advice, or collection-action controls

5. Add a narrow future implementation proof.
   Expected future implementation files:
   - `tools/collections-pressure-alert-investigation-smoke.mjs` or a comparably narrow smoke
   - `package.json` alias only in the future implementation thread
   - optional update to `tools/monitor-demo-replay-smoke.mjs` only if the demo expected boundary needs to reflect the shipped F6G behavior

   Required proof:
   - one persisted alerting `collections_pressure` monitor result creates or opens exactly one taskless investigation mission by explicit operator action
   - repeated create/open returns the same mission
   - non-alert collections results are rejected
   - payables and policy/covenant alert results are rejected
   - cash alert handoff remains green
   - the seed copies source freshness, lineage, limitations, proof posture, deterministic rationale, conditions, and human-review next step from the stored monitor result
   - no runtime-Codex thread, report artifact, approval, outbox delivery, notification, payment instruction, vendor-payment recommendation, collection instruction, legal or policy advice, or autonomous finance action is created

6. Refresh docs after future implementation only where behavior changes.
   Expected future implementation docs:
   - `README.md`
   - `START_HERE.md`
   - `docs/ACTIVE_DOCS.md`
   - `plans/ROADMAP.md`
   - `docs/ops/local-dev.md`
   - `docs/ops/source-ingest-and-cfo-wiki.md` only if its F6 boundary becomes stale
   - `docs/ops/codex-app-server.md` only if runtime-Codex boundary wording becomes stale
   - `evals/README.md` and `docs/benchmarks/seeded-missions.md` only if a new smoke or benchmark statement is added

## Validation and Acceptance

This docs-and-plan slice must run:

- `pnpm smoke:monitor-demo-replay:local`
- `pnpm smoke:cash-posture-alert-investigation:local`
- `pnpm smoke:collections-pressure-monitor:local`
- `pnpm smoke:payables-pressure-monitor:local`
- `pnpm smoke:policy-covenant-threshold-monitor:local`
- `pnpm smoke:finance-discovery-supported-families:local`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

Future F6G implementation acceptance is observable only if all of the following are true:

- an operator can manually create or open one taskless investigation mission from one persisted alerting `collections_pressure` monitor result
- existing `cash_posture` create/open behavior remains unchanged
- `payables_pressure` and `policy_covenant_threshold` remain rejected by the investigation handoff in F6G first implementation
- no monitor run automatically creates a mission
- no scheduled monitor automation, notification, delivery, runtime-Codex investigation writeup, LLM-authored prose, report conversion, approval kind, payment instruction, vendor-payment recommendation, collection instruction, legal advice, policy advice, or external action is added
- mission detail, mission list, and proof-bundle views expose source freshness, source lineage, limitations, proof posture, deterministic severity rationale, conditions, and human-review next step copied from stored monitor evidence
- replay implications are covered by the taskless mission replay events or an explicit recorded reason if an implementation chooses a different proof path
- F5 reporting and approval lifecycles remain unchanged
- shipped F6 monitor smokes, F6F demo replay, and finance-discovery supported-family smoke remain green

## Idempotence and Recovery

F6G implementation must be retry-safe.
Repeated create/open actions for the same collections monitor result should open the same mission by `sourceKind = "alert"` and `sourceRef = "pocket-cfo://monitor-results/<monitorResultId>"`, matching the shipped F6B behavior.

Raw sources, source snapshots, source files, Finance Twin facts, CFO Wiki pages, monitor results, report artifacts, approvals, and delivery records must not be mutated to make the handoff pass.
If the stored monitor result is missing, non-alerting, malformed, unsupported by the F6G allowlist, stale in a way that the alert card already discloses, or missing required posture, the handoff should reject with a clear invalid-request response.

Rollback for future implementation should revert only the additive F6G domain, mission-service, route/spec, UI, smoke, and docs changes while leaving FP-0050 through FP-0055, shipped cash monitoring, shipped cash handoff, shipped collections/payables/policy monitors, F6F demo replay, F5 reporting/approval behavior, raw sources, CFO Wiki state, and Finance Twin state intact.

## Artifacts and Notes

This docs-and-plan slice produces:

- `plans/FP-0056-non-cash-alert-investigation-generalization-foundation.md`
- active-doc updates that identify FP-0056 as the active implementation-ready F6G contract
- no code, routes, schema, migrations, package scripts, smoke commands, eval datasets, runtime behavior, delivery behavior, reports, approvals, payment behavior, legal or policy advice, or implementation scaffolding

Do not create FP-0057 in this slice.
Do not start F6G implementation in this docs-and-plan slice.
Do not start F6H, F6I, or F6J implementation.

## Interfaces and Dependencies

Package boundaries must remain unchanged:

- `packages/domain` owns pure monitor-investigation seed contracts and shared schemas
- `packages/db` should not need a schema change if the existing mission source-ref uniqueness covers collections handoff idempotency
- `apps/control-plane/src/modules/monitoring` owns stored monitor result reads and must not rerun monitors during handoff creation
- `apps/control-plane/src/modules/missions` owns manual handoff mission creation, proof-bundle posture, list/detail read models, and mission replay
- `apps/control-plane/src/modules/evidence` remains proof-summary support only and must not turn alert investigations into reports
- `apps/web` owns operator actions and read models only

Runtime-Codex stays out of scope:

- no runtime-Codex drafting
- no runtime-Codex investigation writeups
- no natural-language autonomous monitoring
- no runtime-owned finance facts

Delivery and autonomous action stay out of scope:

- no email
- no Slack
- no webhooks
- no notifications
- no send, distribute, publish, pay, book, file, release, tax filing, legal advice, policy advice, collection instruction, payment instruction, vendor-payment recommendation, or external action

Later slices are named but not created here:

- `F6H-close-control-checklist-foundation`
- `F6I-stack-pack-expansion`
- `F6J-notification-delivery-planning`, only if a future plan proves safe

Current module vocabulary stays stable.
Do not rename `modules/twin/**`, `modules/reporting/**`, or `@pocket-cto/*`.
Do not delete GitHub or engineering-twin modules as part of F6G.
No new environment variables are expected.

## Outcomes & Retrospective

FP-0056 is the active implementation-ready F6G contract.
This docs-and-plan slice concluded that F6G should start next, but only as a manual source-backed `collections_pressure` alert-to-investigation handoff.
F6H close/control checklist foundation is a valid later slice, but repo truth does not require it to precede the collections-first F6G handoff.

The requested docs-and-plan validation ladder passed on 2026-04-27, including `pnpm ci:repro:current`.
The validation evidence confirmed that shipped F6A through F6F behavior remains green, non-cash investigations are still intentionally absent in the current code, and the implementation-ready F6G contract can start from this plan without adding runtime, delivery, report, approval, payment, legal-advice, policy-advice, collection-instruction, or autonomous-action behavior.

What remains:

- implement the first F6G slice in a later thread from this plan
- keep payables and policy/covenant investigations out of the first F6G implementation
- keep runtime-Codex, delivery, notifications, approvals, reporting, payment behavior, legal or policy advice, collection instructions, and autonomous action out of scope until a later named Finance Plan explicitly changes that boundary
