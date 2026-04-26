# Define F6A monitoring foundation and first cash posture alert

## Purpose / Big Picture

This file is the active F6 implementation contract created by the F6 master-plan-and-doc-refresh slice.
`plans/FP-0049-board-packet-circulation-note-reset-and-effective-record-hardening.md` remains the shipped F5C4I record.
The target phase is `F6`, and the next execution slice is `F6A-monitoring-foundation-and-first-cash-posture-alert`.

The user-visible goal is narrow: after the shipped F5A through F5C4I baseline already covers finance memos, board packets, lender updates, diligence packets, external release approval and logs for lender updates and diligence packets, and internal board-packet circulation approval, log, correction, actor, and note-reset posture, Pocket CFO should begin F6 with one deterministic source-backed monitor.
The first monitor family is exactly `cash_posture`.
It should read existing stored Finance Twin or finance-discovery posture for one `companyKey`, record one deterministic monitor result, and expose one operator-visible alert-card posture only when the stored state shows a freshness threshold breach, missing source, failed source, or equivalent source-backed cash-posture gap.

F6A must not invent finance facts, create autonomous finance actions, reopen F5 reporting or approval semantics, invoke runtime-codex, create investigation missions, send notifications, move money, book journals, file taxes, or publish external communications.
GitHub connector work is explicitly out of scope.
This plan is implementation-ready, but the thread that created it is docs-and-plan-only and must not add runtime code, routes, schema, migrations, package scripts, smoke commands, eval datasets, or scaffolding.

## Progress

- [x] 2026-04-24T01:36:02Z Audit the shipped F5A through F5C4I baseline, active docs, source/freshness posture, proof-bundle boundaries, runtime-codex boundary, and current cash-posture Finance Twin/discovery seams.
- [x] 2026-04-24T01:36:02Z Create this FP-0050 contract as the single active first-F6 implementation plan while leaving FP-0049 as the shipped F5C4I record.
- [x] 2026-04-24T01:36:02Z Refresh the active docs so future threads continue FP-0050 rather than treating F5 or a broad F6 umbrella as active scope.
- [x] 2026-04-24T01:44:06Z Run the docs-and-plan validation ladder from this plan-refresh thread and record the result here.
- [x] 2026-04-26T18:57:00Z Implement the first F6A slice: one pure `cash_posture` monitor contract, additive `monitor_results` persistence, a monitoring bounded context, run/latest HTTP routes, an operator alert-card read model, and `pnpm smoke:cash-posture-monitor:local`.
- [x] 2026-04-26T19:08:08Z Complete and record the full F6A validation ladder from the implementation thread, including `pnpm smoke:cash-posture-monitor:local` and `pnpm ci:repro:current`.

## Surprises & Discoveries

- Observation: there is no checked-in monitoring module or monitor contract today.
  Evidence: repo search found no `monitor_result`, alert-card, or F6A implementation surface outside the operator plugin skills and high-level roadmap wording.

- Observation: the shipped cash-posture read already has the right first monitor input substrate.
  Evidence: `packages/domain/src/finance-twin.ts` defines `FinanceCashPostureViewSchema` with company, latest attempted sync, latest successful bank-summary slice, freshness, coverage, diagnostics, and limitations, while `apps/control-plane/src/modules/finance-twin/routes.ts` exposes `/finance-twin/companies/:companyKey/cash-posture` and `/finance-twin/companies/:companyKey/bank-accounts`.

- Observation: the shipped discovery family set must remain unchanged for F6A.
  Evidence: `packages/domain/src/discovery-mission.ts` and `apps/control-plane/src/modules/finance-discovery/family-registry.ts` list exactly `cash_posture`, `collections_pressure`, `payables_pressure`, `spend_posture`, `obligation_calendar_review`, and `policy_lookup`.

- Observation: F5 reporting and approval lifecycles are already closed enough for F6A planning.
  Evidence: FP-0049 records F5C4I as shipped, and current active docs describe the completed F5A through F5C4I reporting/circulation/release baseline without a later active F5 contract.

- Observation: the implementation did not need a replay event helper.
  Evidence: monitor results are company-scoped persisted records in `monitor_results`; each result records `replayPosture.state = not_appended` with the reason that F6A monitor results are not mission replay events.

- Observation: the clean reproduced Next.js build caught one page-signature polish issue in the new monitoring page.
  Evidence: `pnpm ci:repro:current` initially failed because `apps/web/app/monitoring/page.tsx` allowed object-shaped `searchParams`; the implementation now uses the Next 15 promise-shaped page prop, and the rerun passed.

## Decision Log

- Decision: the first real F6 scope is `F6A-monitoring-foundation-and-first-cash-posture-alert`.
  Rationale: the repo needs one implementation-ready first-F6 slice, not a broad monitoring platform.

- Decision: the first monitoring family is exactly `cash_posture`.
  Rationale: `cash_posture` is already a shipped Finance Twin read and shipped discovery family, so F6A can stay source-backed without adding new extractors or new discovery families.

- Decision: F6A starts from stored finance state, not generic chat and not report artifacts.
  Rationale: the monitor input contract is one `companyKey` plus one source-backed Finance Twin cash-posture or finance-discovery posture, explicit freshness or missing-source posture, and no invented facts. `finance_memo`, `board_packet`, `lender_update`, and `diligence_packet` are not primary monitor inputs.

- Decision: F6A defines one deterministic monitor result concept and one alert-card read model.
  Rationale: the first monitoring proof should be a persisted, reviewable finding over stored state; alert cards are operator read models, not advice, not accounting action, and not external messages.

- Decision: investigation missions are deferred to F6B.
  Rationale: alert-to-investigation requires a separate mission contract and human-review path. F6A should stop at monitor result plus alert card.

- Decision: F6A is runtime-free and delivery-free.
  Rationale: source-backed monitoring does not need runtime-codex drafting, natural-language autonomous monitoring, email, Slack, external notification, remediation, sending, distributing, publishing, paying, booking, or filing.

- Decision: F6A preserves current module vocabulary and avoids a broad rename wave.
  Rationale: if implementation adds `apps/control-plane/src/modules/monitoring/**`, it should be a new bounded context only. Existing `modules/twin/**`, `modules/reporting/**`, package scopes, and reporting vocabulary stay unchanged.

- Decision: F6A severity is deterministic and source-backed.
  Rationale: the first severity map should depend only on existing freshness, sync, coverage, diagnostics, and explicit threshold posture. F6A must not invent a cash target, runway, burn, covenant, or finance recommendation.

- Decision: later F6 slices are likely `F6B-alert-to-investigation-mission-foundation`, `F6C-collections-or-payables-pressure-monitor-foundation`, `F6D-policy-or-covenant-threshold-monitor-foundation`, and `F6E-monitor-demo-replay-and-stack-pack-foundation`.
  Rationale: those are separate product questions and must not be created as FP-0051 or implemented in this planning slice.

- Decision: F6A persists monitor results in one additive `monitor_results` table.
  Rationale: recurring monitoring needs idempotent, reviewable state. The first implementation stores the full monitor result JSON plus condition details, source freshness posture, lineage refs, limitations, proof-bundle posture, alert-card posture, company, monitor kind, run key, trigger, status, severity, and timestamps.

- Decision: F6A adds both a run route and a latest-read route.
  Rationale: `POST /monitoring/companies/:companyKey/cash-posture/run` proves deterministic execution, while `GET /monitoring/companies/:companyKey/cash-posture/latest` is the smallest truthful operator UI read surface for the latest persisted result.

- Decision: F6A records source-backed proof posture without pretending alerts are missions or reports.
  Rationale: alert results expose `source_backed` or a `limited_by_*` monitor proof posture, not a mission proof bundle. The monitor result also records that runtime-codex, delivery actions, investigation missions, and autonomous finance actions were not used.

## Context and Orientation

Pocket CFO has shipped the full current evidence spine through:

- F1 raw source registration and immutable file ingest
- F2A through F2O deterministic Finance Twin breadth, including bank-account summary and cash posture
- F3A through F3D deterministic CFO Wiki compilation, lint/export, concepts, metrics, and policy pages
- F4A through F4C2 deterministic finance discovery for exactly six shipped families
- F5A through F5C4I deterministic reporting, memo, packet, approval, release, circulation, correction, actor, and note-reset posture

FP-0049 is the shipped F5C4I record.
FP-0050 is now the single active implementation contract.
There is no active later-F5 contract after FP-0049, and this plan must not reopen F5 report, approval, circulation, release, correction, export, or runtime-codex behavior.

The relevant existing implementation seams for F6A are:

- `packages/domain/src/finance-twin.ts` for existing cash-posture, freshness, source, sync, and lineage schemas
- `packages/domain/src/discovery-mission.ts` for the shipped discovery family vocabulary, which must not grow in F6A
- `packages/domain/src/proof-bundle.ts` for mission proof-bundle vocabulary, which F6A should reference carefully without pretending alerts are missions
- `apps/control-plane/src/modules/finance-twin/**` for the stored cash-posture and bank-account reads
- `apps/control-plane/src/modules/finance-discovery/**` for existing freshness, limitation, related-route, and evidence formatting patterns
- `apps/control-plane/src/modules/evidence/**` for proof posture language and replay expectations
- `apps/web/components/**` and `apps/web/app/missions/**` for existing operator read-model patterns

GitHub connector work is out of scope.
Runtime-codex work is out of scope.
No new environment variables are expected for F6A unless the implementation explicitly proves that deterministic operator-configured thresholds need them; prefer stored config or code-owned defaults over env for product semantics.

## Plan of Work

First, add a small monitoring domain contract.
It should define a `monitor_result` concept, a `cash_posture` monitor kind, deterministic severity and condition vocabulary, source lineage refs, source freshness posture, limitations, proof-bundle posture, and a human-review next step.
This contract should not add a new discovery family and should not reuse report artifacts as monitor inputs.

Second, add one control-plane monitoring bounded context after planning.
The preferred implementation shape is `apps/control-plane/src/modules/monitoring/**` with thin `routes.ts`, `schema.ts`, `service.ts`, `repository.ts`, `formatter.ts`, and `events.ts` files if persistence, HTTP, formatting, and replay are all needed.
The route layer should parse input, call the service, and serialize output only.
SQL belongs in the repository, and deterministic severity logic belongs in the service or a small domain helper.

Third, persist one monitor result additively.
The likely persistence shape is an additive `monitor_results` table keyed by company, monitor kind, run key or idempotency key, and created time.
The persisted result should include the deterministic status, alert-card posture, source freshness summary, source lineage refs, limitations, proof-bundle posture, and replay metadata.
If the next implementation proves persistence is unnecessary for the first observable alert card, it must record that reason in this plan before choosing a read-only implementation.

Fourth, expose one alert-card read model in the operator UI only.
The alert card should appear only when conditions warrant it and must include source lineage, source freshness or missing-source posture, deterministic severity rationale, limitations, proof-bundle posture, and a recommended human-review action.
The action should be wording such as "review cash-posture source coverage and refresh source ingest if needed", not a payment, filing, send, or remediation action.

Fifth, add a narrow validation proof in the implementation thread.
The first smoke should prove only the deterministic cash-posture monitor result and alert-card posture from stored state.
Do not add eval datasets or multi-monitor coverage in F6A unless this plan is explicitly amended with a narrow reason.

## Concrete Steps

1. Add the F6A domain contract.
   Expected files:
   - `packages/domain/src/monitoring.ts`
   - `packages/domain/src/index.ts`
   - narrow adjacent domain specs

   The contract should define:
   - monitor kind: `cash_posture`
   - monitor result source: stored Finance Twin or stored discovery posture only
   - result status: enough to distinguish no alert from alert
   - severity: deterministic, finite, and source-backed
   - condition kinds: missing source, failed source, stale source, coverage gap, and any explicitly named threshold breach that is backed by existing stored freshness thresholds or operator-owned config
   - source lineage refs for the cash-posture and bank-account summary state that caused the result
   - source freshness posture, including missing-source posture
   - limitations summary
   - proof-bundle posture for the monitor result
   - recommended human-review action

2. Add additive persistence only if the implementation stores monitor results.
   Expected files if persistence is used:
   - `packages/db/src/schema.ts`
   - one additive migration generated by `pnpm db:generate`
   - `apps/control-plane/src/modules/monitoring/repository.ts`
   - `apps/control-plane/src/modules/monitoring/drizzle-repository.ts`

   Persistence must:
   - avoid destructive schema changes
   - keep raw sources immutable
   - keep monitor results derived from stored state
   - support idempotent retries by a deterministic run key or explicit idempotency key

3. Add the control-plane monitoring bounded context.
   Expected files:
   - `apps/control-plane/src/modules/monitoring/schema.ts`
   - `apps/control-plane/src/modules/monitoring/service.ts`
   - `apps/control-plane/src/modules/monitoring/formatter.ts`
   - `apps/control-plane/src/modules/monitoring/events.ts`
   - `apps/control-plane/src/modules/monitoring/routes.ts` only if an HTTP surface is needed for the operator UI or smoke
   - narrow adjacent specs

   The service must:
   - accept one `companyKey`
   - read existing cash-posture and bank-account state through `FinanceTwinService`
   - evaluate deterministic conditions without runtime-codex
   - produce one monitor result and one optional alert-card read model
   - include source lineage, freshness, limitations, proof-bundle posture, and human-review next step
   - append replay for a meaningful monitor result or record an explicit reason if a read-only result is not replayed

4. Add the operator read model only after the control-plane result exists.
   Expected files:
   - `apps/web/lib/api.ts`
   - `apps/web/components/monitoring-alert-card.tsx`
   - `apps/web/app/monitoring/page.tsx` or an existing operator page only if that is the smallest truthful surface
   - narrow adjacent specs

   The UI must:
   - show the alert card only inside Pocket CFO
   - show severity, rationale, freshness posture, source lineage, limitations, proof posture, and human-review next step
   - avoid send, Slack, email, publish, pay, book, file, or external-release controls

5. Add one deterministic implementation proof.
   Expected files:
   - `tools/cash-posture-monitor-smoke.mjs` or an equivalently named narrow smoke
   - `package.json` alias only in the implementation thread
   - no eval dataset in F6A unless this plan is amended

   The smoke should prove:
   - missing or stale cash-posture source state produces a monitor result and alert card
   - fresh supported cash-posture state produces a monitor result without an alert card, or an explicitly non-alerting status
   - the result includes source lineage, freshness posture, deterministic severity rationale, limitations, proof-bundle posture, and human-review next step
   - no runtime-codex thread, report artifact, delivery action, accounting write, bank write, tax filing, or external notification is created

6. Refresh docs after F6A implementation only where behavior changed.
   Expected docs:
   - `README.md`
   - `START_HERE.md`
   - `docs/ACTIVE_DOCS.md`
   - `plans/ROADMAP.md`
   - `docs/ops/local-dev.md`
   - `docs/ops/source-ingest-and-cfo-wiki.md`
   - `docs/ops/codex-app-server.md`
   - `evals/README.md`
   - `docs/benchmarks/seeded-missions.md`

## Validation and Acceptance

The docs-and-plan thread that creates FP-0050 should run the preserved confidence ladder:

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
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

The F6A implementation thread added:

- `pnpm smoke:cash-posture-monitor:local`

This proof creates one company from an existing non-bank Finance Twin sync before running the monitor to prove missing-source or coverage-gap alert posture, then creates one clean bank-account-summary company to prove `no_alert` posture. It also asserts the shipped discovery family list remains unchanged and no mission, report artifact, runtime-codex thread, outbox delivery, investigation mission, or autonomous finance action is created.

The implementation thread reran the confidence ladder required by the implementation prompt before this plan was treated as the shipped F6A record.

Acceptance for F6A implementation is observable only if all of the following are true:

- one `companyKey` can be monitored for `cash_posture` using stored Finance Twin or stored discovery posture only
- the monitor records or returns one deterministic monitor result without inventing finance facts
- an alert card appears only when deterministic source-backed conditions warrant it
- every alert card includes source lineage, source freshness or missing-source posture, deterministic severity rationale, limitations summary, proof-bundle posture, and a human-review next step
- no new discovery family is added
- no `finance_memo`, `board_packet`, `lender_update`, or `diligence_packet` is used as the primary monitor input
- no investigation mission is created in F6A
- no runtime-codex drafting, autonomous monitoring language, email, Slack, external notification, send, distribute, publish, payment, journal booking, tax filing, or legal advice behavior is added
- F5 reporting and approval semantics remain unchanged

## Idempotence and Recovery

F6A should be retry-safe.
If monitor results are persisted, the implementation should use an explicit idempotency key or deterministic run key so rerunning the same monitor input does not create misleading duplicate alerts.
If a persistence write fails, the monitor result and replay event should roll back transactionally.

Rollback should consist of reverting the additive monitoring domain, persistence, control-plane, web, and smoke changes while leaving FP-0049 and all shipped F5 reporting/approval behavior intact.
Raw sources must never be rewritten to make monitoring pass.
If source state is missing, stale, failed, partial, or conflicting, the monitor should report that posture instead of mutating evidence.

## Artifacts and Notes

The F6A implementation thread produced:

- one monitoring domain contract
- one additive `monitor_results` persistence path
- one deterministic cash-posture monitor result path
- one operator-visible alert-card read model
- one narrow implementation smoke
- updated active docs and plan progress

No FP-0051 should be created during this slice.

## Interfaces and Dependencies

Package boundaries remain unchanged:

- `packages/domain` owns pure monitoring contracts and shared schemas
- `packages/db` owns additive persistence only if monitor results are stored
- `apps/control-plane/src/modules/finance-twin` remains the source-backed cash-posture read owner
- `apps/control-plane/src/modules/monitoring` may become the new F6 bounded context after planning
- `apps/control-plane/src/modules/evidence` may help format proof posture but should not turn monitor alerts into reporting proof bundles
- `apps/web` stays read-model and operator-action only

The runtime seam stays stable:

- no runtime-codex drafting
- no runtime-codex investigation writeups
- no natural-language autonomous monitoring
- no runtime-owned finance facts

Delivery stays out of scope:

- no email
- no Slack
- no external notification
- no send, distribute, publish, pay, book, file, or release action

The current module vocabulary stays stable.
Do not rename `modules/twin/**`, `modules/reporting/**`, or `@pocket-cto/*`.
Do not delete GitHub or engineering-twin modules as part of F6A.

## Outcomes & Retrospective

The docs-and-plan thread created FP-0050, refreshed the active-doc spine, and left FP-0049 as the shipped F5C4I record.
The implementation thread then added the first source-backed F6A cash-posture monitor while preserving the shipped F5 reporting and approval lifecycles.
Implementation validation is tracked in the Progress section and final handoff for this branch.

FP-0050 now records the first F6A implementation slice once the validation ladder is green.
F6B must still start from a separate explicit Finance Plan; do not create an investigation mission path, additional monitor family, delivery path, runtime-codex drafting path, or threshold-policy monitor by extending this F6A slice.
