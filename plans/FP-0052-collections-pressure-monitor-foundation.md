# F6C collections pressure monitor shipped record

## Purpose / Big Picture

This file is the shipped FP-0052 record for Pocket CFO F6C.
The target phase is `F6`, and the shipped F6C implementation slice is exactly `F6C-collections-pressure-monitor-foundation`.

The user-visible goal was narrow: after shipped F6A records one deterministic source-backed `cash_posture` monitor result plus alert card, and shipped F6B lets an operator manually create or open one investigation mission from one persisted `cash_posture` alert, Pocket CFO adds one second monitor family.
The first F6C monitor family is exactly `collections_pressure`.
It reads stored Finance Twin receivables-aging or collections-posture state for one `companyKey`, records one deterministic monitor result with `monitorKind = "collections_pressure"`, and exposes one optional operator alert card only when source-backed conditions warrant it.

Collections comes first because it is already a shipped finance discovery family, it is grounded in stored receivables-aging and collections-posture state, it is a common recurring CFO operating monitor, and it naturally complements `cash_posture` without requiring bank, accounting, tax, legal, or delivery writes.
Repo truth does not show `payables_pressure` as strictly safer: the shipped payables posture is similarly source-backed, but collections has an equally truthful stored-state substrate and is the narrower second-monitor complement requested for F6C.

This plan started as a docs-and-plan contract and now records the shipped F6C implementation slice.
Do not treat FP-0050, FP-0051, or FP-0052 as current implementation contracts.
FP-0050 remains the shipped F6A record, FP-0051 remains the shipped F6B record, and FP-0052 remains the shipped F6C record.
F6D planning should begin only in a new Finance Plan.
GitHub connector work is explicitly out of scope.

F6C must stay deterministic, runtime-free, delivery-free, non-autonomous, and human-reviewable.
It must not create investigations, run F6B handoffs, use runtime-Codex, send notifications, invoke Slack or email, perform bank/accounting/tax/legal writes, produce LLM-generated advice, create reports, add approval kinds, or widen into a broad monitoring platform.

## Progress

- [x] 2026-04-27T10:58:28Z Audit shipped F6A/F6B records, active docs, monitoring bounded context, source/freshness posture, proof-bundle boundary, runtime-Codex boundary, collections/payables source posture, and current validation ladder.
- [x] 2026-04-27T10:58:28Z Create FP-0052 as the single F6C implementation-ready contract at the time while preserving FP-0050 and FP-0051 as shipped records.
- [x] 2026-04-27T10:58:28Z Refresh active docs so the implementation thread could start the narrow `collections_pressure` monitor implementation from FP-0052 rather than re-planning F6C or widening into multi-monitor work.
- [x] 2026-04-27T11:05:28Z Run the docs-and-plan validation ladder through `pnpm ci:repro:current` and record the green result.
- [x] 2026-04-27T11:38:56Z Run a tiny post-merge local-dev freshness polish so the source-registry-to-finance-twin loop pointed discovery, reporting, and monitoring work through the then-current FP-0052 F6C contract instead of stale F5 wording.
- [x] 2026-04-27T12:03:32Z Implement `F6C-collections-pressure-monitor-foundation`: widen monitoring contracts and DB enum, add one deterministic `collections_pressure` evaluator, run/latest routes, operator alert-card posture, and packaged local smoke while keeping collections investigation-free, runtime-free, delivery-free, report-free, approval-free, and non-autonomous.
- [x] 2026-04-27T12:11:28Z Run and record the full F6C implementation validation ladder after code changes exist, including narrow collections monitor specs, migration, baseline smokes, new collections smoke, twin guardrails, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.
- [x] 2026-04-27T12:40:48Z Run a docs-only post-merge closeout that marks FP-0052 and F6C as shipped across secondary docs and leaves F6D as planning-only with no FP-0053.

## Surprises & Discoveries

The shipped monitoring bounded context already has the right first shape for F6C.
`apps/control-plane/src/modules/monitoring/**` owns deterministic evaluation, persistence, run/latest routes, formatting, and alert-card posture for F6A.
F6C should extend that bounded context rather than creating a second alert system.

The monitoring domain and DB enum were cash-only at the start of implementation.
F6C widens `MonitorKindSchema` and the `monitor_kind` enum additively to exactly `cash_posture` and `collections_pressure`, with one additive migration.
F6B investigation seeds remain `cash_posture`-only.

Collections and payables have symmetric stored-state posture in the Finance Twin.
`FinanceTwinService.getCollectionsPosture(companyKey)` reads persisted receivables-aging state and exposes freshness, latest attempted sync, latest successful source, coverage, diagnostics, currency buckets, and limitations.
`FinanceTwinService.getPayablesPosture(companyKey)` does the same for payables.
No repo fact made payables strictly safer than collections for the second monitor.

The shipped F6B handoff is intentionally cash-alert-specific.
F6C must not modify `POST /missions/monitoring-investigations` or create collections investigations.
A collections alert-to-investigation path can be deferred unless a later plan proves a narrow, safe reason to add it.

Validation caught two narrow web type polish issues after the collections UI landed: the collections alert-card fixture needed a complete lineage target-count shape, and the hidden cash investigation input needed to serialize a string value only.
Both fixes stayed inside the F6C operator read-model surface and did not change the collections investigation-free behavior.

## Decision Log

Decision: the first real F6C scope is `F6C-collections-pressure-monitor-foundation`.
Rationale: F6C needed one implementation-ready contract, not a broad monitoring platform or a multi-monitor expansion.

Decision: the first F6C monitor family is exactly `collections_pressure`.
Rationale: `collections_pressure` is a shipped finance discovery family, is backed by shipped receivables-aging and collections-posture Finance Twin reads, and complements the shipped `cash_posture` monitor without requiring external writes.

Decision: the F6C input contract is one `companyKey` plus stored Finance Twin receivables-aging or collections-posture state.
Rationale: the monitor must start from source-backed stored state, explicit source freshness or missing-source posture, source lineage refs, and limitations. It must not start from generic chat, `finance_memo`, `board_packet`, `lender_update`, `diligence_packet`, a `cash_posture` monitor rerun, or an F6B investigation mission.

Decision: the F6C output contract is one deterministic monitor result plus one optional alert card.
Rationale: the durable proof point is a persisted monitor finding with `monitorKind = "collections_pressure"`, deterministic severity, source lineage, freshness or missing-source posture, deterministic rationale, limitations, proof posture, and a human-review next step.

Decision: F6C reuses the F6A monitoring bounded context.
Rationale: monitor results already persist in `monitor_results`, and the operator alert-card pattern already exists. A second alert system would weaken the source-truth and audit boundary.

Decision: F6C does not create investigations.
Rationale: FP-0051 already shipped the first manual alert-to-investigation handoff for one persisted `cash_posture` alert. Collections alert-to-investigation should remain deferred until a later named plan proves a narrow need.

Decision: F6C stays deterministic, runtime-free, delivery-free, and non-autonomous.
Rationale: the monitor is a deterministic read over stored state. It must not use runtime-Codex, notification delivery, scheduled external sends, LLM advice, autonomous remediation, bank writes, accounting writes, tax filings, legal advice, or external communication releases.

Decision: F6C preserves F5 and shipped F6A/F6B behavior.
Rationale: no reporting approval, release, circulation, correction, report conversion, F6B mission behavior, new discovery family, new approval kind, or packet/report path belongs in the second monitor foundation.

Decision: later F6 slices are named but not created here.
Rationale: likely later slices are `F6D-payables_pressure-monitor-foundation`, `F6E-policy-or-covenant-threshold-monitor-foundation`, and `F6F-monitor-demo-replay-and-stack-pack-foundation`. They must not be created as FP-0053 or implemented in this slice.

## Context and Orientation

Pocket CFO has shipped:

- F1 raw source registration and immutable file ingest
- F2A through F2O deterministic Finance Twin breadth, including receivables-aging and collections-posture support
- F3A through F3D deterministic CFO Wiki compilation, lint/export, concepts, metrics, and policy pages
- F4A through F4C2 deterministic finance discovery for exactly six shipped families
- F5A through F5C4I deterministic reporting, packet, approval, release, circulation, correction, actor, and note-reset posture
- F6A deterministic `cash_posture` monitoring over stored Finance Twin cash-posture state only
- F6B manual alert-to-investigation handoff from one persisted alerting `cash_posture` monitor result

The shipped discovery families remain exactly:

- `cash_posture`
- `collections_pressure`
- `payables_pressure`
- `spend_posture`
- `obligation_calendar_review`
- `policy_lookup`

The relevant existing implementation seams for F6C are:

- `packages/domain/src/monitoring.ts` for monitor result, alert card, condition, proof posture, runtime boundary, and investigation seed contracts
- `packages/domain/src/finance-twin.ts` for `FinanceCollectionsPostureView`, `FinanceReceivablesAgingView`, freshness, lineage, coverage, diagnostics, and limitations schemas
- `packages/db/src/schema/monitoring.ts` for additive `monitor_results` persistence
- `apps/control-plane/src/modules/finance-twin/**` for stored receivables-aging and collections-posture reads
- `apps/control-plane/src/modules/monitoring/**` for deterministic monitor evaluation, persistence, routes, and formatting
- `apps/web/app/monitoring/**` and `apps/web/components/monitoring-alert-card.tsx` for the current operator monitoring read model
- `tools/cash-posture-monitor-smoke.mjs`, `tools/finance-twin-receivables-aging-smoke.mjs`, and `tools/finance-discovery-supported-families-smoke.mjs` for current proof patterns

No GitHub connector work is in scope.
No new environment variables are expected.
No stack-pack or plugin changes are expected in F6C; demo replay and stack-pack work is deferred to F6F.

## Plan of Work

First, widen the monitoring domain contract additively.
The implementation should allow `monitorKind = "collections_pressure"` alongside the shipped `cash_posture` kind, while preserving current cash monitor behavior and discovery-family vocabulary.
Condition kinds should remain narrow: `missing_source`, `failed_source`, `stale_source`, `coverage_gap`, `overdue_concentration`, and `data_quality_gap`.

Second, extend the existing monitoring bounded context.
The preferred implementation shape is to add collections-specific evaluation in `apps/control-plane/src/modules/monitoring/**`, reusing the existing repository, formatter, service, and route patterns.
The route layer must stay thin: parse input, call service, serialize output.
SQL stays in the repository, and deterministic condition/severity logic stays in evaluator or formatting helpers.

Third, persist the collections monitor result in the existing `monitor_results` table.
The implementation should add the new monitor kind additively and keep the existing idempotent `(companyId, monitorKind, runKey)` retry behavior.
The result JSON must carry source freshness posture, source lineage refs, limitations, proof posture, runtime boundary, replay posture, deterministic severity rationale, human-review next step, and the optional alert card.

Fourth, expose the smallest operator read model.
The operator surface should show a collections alert card only when the latest persisted `collections_pressure` result has `status = "alert"`.
It may reuse the existing monitoring page or add a narrow collections view, but it must not introduce notification controls, investigation creation, report conversion, approvals, or a broad monitoring dashboard.

Fifth, add one narrow implementation proof in the later implementation thread.
That proof should create source-backed receivables-aging or collections-posture state, run the collections monitor, assert alert and no-alert posture, assert source lineage/freshness/limitations/proof/human-review posture, and assert no mission, report artifact, runtime-Codex thread, outbox delivery, approval, or autonomous finance action is created.

## Concrete Steps

1. Widen the pure monitoring contract.
   Expected files in the implementation thread:
   - `packages/domain/src/monitoring.ts`
   - `packages/domain/src/monitoring.spec.ts`
   - `packages/domain/src/index.ts` only if exports need adjustment

   Required contract behavior:
   - accept `monitorKind = "collections_pressure"`
   - preserve `monitorKind = "cash_posture"` behavior
   - keep result status as `no_alert` or `alert`
   - keep severity deterministic and finite: `none`, `info`, `warning`, `critical`
   - include condition kind `overdue_concentration` only for source-backed collections posture, not generic advice
   - keep alert cards nullable and only present for alerting results
   - keep runtime boundary fields false for runtime-Codex, delivery, investigation creation, and autonomous finance actions

2. Add additive DB support only for the new monitor kind.
   Expected files in the implementation thread:
   - `packages/db/src/schema/monitoring.ts`
   - one additive migration generated by `pnpm db:generate`
   - narrow schema or repository specs if needed

   Persistence must:
   - reuse `monitor_results`
   - keep raw sources immutable
   - avoid destructive schema changes
   - keep idempotent retry behavior by company, monitor kind, and run key

3. Add collections monitor evaluation in the monitoring bounded context.
   Expected files in the implementation thread:
   - `apps/control-plane/src/modules/monitoring/evaluator.ts` or a split evaluator helper
   - `apps/control-plane/src/modules/monitoring/formatter.ts`
   - `apps/control-plane/src/modules/monitoring/service.ts`
   - `apps/control-plane/src/modules/monitoring/schema.ts`
   - `apps/control-plane/src/modules/monitoring/routes.ts`
   - adjacent specs

   The service must:
   - accept one `companyKey`
   - read stored collections posture through `FinanceTwinService.getCollectionsPosture(companyKey)`
   - optionally read `getReceivablesAging(companyKey)` only if the implementation needs row-level lineage or coverage already persisted in the Finance Twin
   - never read generic chat, report artifacts, cash monitor reruns, or F6B investigation missions as inputs
   - produce one monitor result with deterministic severity and optional alert card
   - record replay posture or an explicit reason if monitor results remain non-mission replay records

4. Define deterministic collections conditions and severity.
   Required first condition behavior:
   - `missing_source`: no successful receivables-aging slice exists; severity `critical`
   - `failed_source`: latest attempted receivables-aging sync failed; severity `critical`
   - `stale_source`: latest successful receivables-aging slice is outside the freshness window; severity `warning`
   - `coverage_gap`: no rows, no customers, no currency buckets, or no source-backed totals sufficient to evaluate collections posture; severity `critical` for no coverage and `warning` for partial coverage
   - `overdue_concentration`: source-backed past-due receivables are concentrated in a currency bucket using explicit non-overlapping totals only; severity `warning` at or above a 50 percent past-due share and `critical` at or above a 75 percent past-due share
   - `data_quality_gap`: stored diagnostics such as mixed as-of dates, unknown currency, partial rollups, total/detail conflicts, or missing explicit date; severity `info` or `warning` by deterministic diagnostic classification

   `overdue_concentration` must not fire when the stored denominator or past-due basis is missing or partial.
   In that case F6C should report `coverage_gap` or `data_quality_gap` rather than inventing a ratio.

5. Add one narrow HTTP read/run surface if needed by the operator UI and smoke.
   Preferred routes:
   - `POST /monitoring/companies/:companyKey/collections-pressure/run`
   - `GET /monitoring/companies/:companyKey/collections-pressure/latest`

   The routes must not contain SQL, prompt assembly, monitor math, investigation creation, report conversion, approval behavior, or delivery logic.

6. Add the operator alert-card read model.
   Expected files in the implementation thread:
   - `apps/web/lib/api.ts`
   - `apps/web/app/monitoring/**`
   - `apps/web/components/monitoring-alert-card.tsx` or a narrow reusable monitor alert card split
   - adjacent specs

   The UI must:
   - expose source lineage, freshness or missing-source posture, deterministic severity rationale, limitations, proof posture, and human-review next step
   - not show create/open investigation for `collections_pressure` in F6C
   - not show email, Slack, webhook, send, publish, pay, book, file, approval, or report-conversion controls

7. Add one implementation smoke only in the implementation thread.
   Expected future files:
   - `tools/collections-pressure-monitor-smoke.mjs`
   - a package script such as `pnpm smoke:collections-pressure-monitor:local`

   The smoke should prove:
   - missing or failed receivables-aging source state produces an alerting monitor result and alert card
   - stale source, coverage gap, overdue concentration, and data-quality posture produce deterministic conditions where source-backed state warrants them
   - fresh supported collections posture without alert conditions produces `no_alert`
   - repeated run keys reuse the stored monitor result identity
   - no runtime-Codex thread, mission, report artifact, approval, outbox event, notification, delivery action, bank/accounting/tax/legal write, or autonomous finance action is created

8. Refresh docs after implementation only where behavior actually changes.
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

This docs-and-plan thread must run the requested preserved validation ladder:

- `pnpm smoke:source-ingest:local`
- `pnpm smoke:finance-twin:local`
- `pnpm smoke:finance-twin-receivables-aging:local`
- `pnpm smoke:finance-discovery-supported-families:local`
- `pnpm smoke:cash-posture-monitor:local`
- `pnpm smoke:cash-posture-alert-investigation:local`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

F6C implementation acceptance is observable only if all of the following are true:

- one `companyKey` can be monitored for `collections_pressure` using stored Finance Twin receivables-aging or collections-posture state only
- one deterministic `monitor_result` persists with `monitorKind = "collections_pressure"`
- an alert card appears only when deterministic source-backed conditions warrant it
- every alert card includes source lineage, freshness or missing-source posture, deterministic rationale, limitations, proof posture, and a human-review next step
- severity is deterministic and based only on stored state, explicit freshness, coverage, diagnostics, and code-owned overdue concentration thresholds
- no new discovery family is added
- no `finance_memo`, `board_packet`, `lender_update`, or `diligence_packet` is used as a monitor input
- no `cash_posture` monitor rerun or F6B investigation mission is used as a monitor input
- no investigation mission is created in F6C
- no runtime-Codex, email, Slack, webhook, notification delivery, send, publish, payment, journal booking, tax filing, legal advice, LLM-generated advice, or autonomous remediation is added
- F5 reporting and approval semantics remain unchanged
- F6A `cash_posture` monitoring and F6B manual `cash_posture` alert handoff remain green

Implementation validation recorded on 2026-04-27:

- `pnpm --filter @pocket-cto/domain exec vitest run src/monitoring.spec.ts`
- `zsh -lc "cd apps/control-plane && pnpm exec vitest run src/modules/monitoring/**/*.spec.ts"`
- `zsh -lc "cd apps/web && pnpm exec vitest run app/monitoring/**/*.spec.tsx components/monitoring-alert-card.spec.tsx lib/api.spec.ts"`
- `pnpm --filter @pocket-cto/domain exec vitest run src/monitoring.spec.ts src/finance-twin.spec.ts src/proof-bundle.spec.ts`
- `zsh -lc "cd apps/control-plane && pnpm exec vitest run src/modules/monitoring/**/*.spec.ts src/modules/finance-twin/**/*.spec.ts src/modules/evidence/**/*.spec.ts src/app.spec.ts"`
- `zsh -lc "cd apps/web && pnpm exec vitest run app/monitoring/**/*.spec.tsx components/monitoring-alert-card.spec.tsx lib/api.spec.ts"`
- `pnpm db:migrate`
- `pnpm smoke:source-ingest:local`
- `pnpm smoke:finance-twin:local`
- `pnpm smoke:finance-twin-receivables-aging:local`
- `pnpm smoke:finance-discovery-supported-families:local`
- `pnpm smoke:cash-posture-monitor:local`
- `pnpm smoke:cash-posture-alert-investigation:local`
- `pnpm smoke:collections-pressure-monitor:local`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

All commands passed.

## Idempotence and Recovery

F6C implementation must be retry-safe.
Rerunning the same collections monitor input with the same run key should preserve one logical monitor result identity and avoid misleading duplicate alerts, following the F6A persistence pattern.

If the implementation writes a monitor result and then fails, the persistence path should roll back transactionally where possible.
Raw sources, source snapshots, source files, Finance Twin facts, CFO Wiki pages, reports, approvals, and investigation missions must not be mutated to make monitoring pass.

Rollback should revert the additive F6C domain, DB enum/migration, monitoring service, route, UI, and smoke changes while leaving FP-0050, FP-0051, existing `cash_posture` monitor behavior, existing F6B mission handoff behavior, F5 reporting/approval behavior, raw sources, and Finance Twin state intact.

If collections source state is missing, stale, failed, partial, inconsistent, or insufficient for an overdue concentration ratio, the monitor should report that posture instead of inventing a collections-risk conclusion.

## Artifacts and Notes

This FP-0052 record contains:

- `plans/FP-0052-collections-pressure-monitor-foundation.md`
- docs updates that identify FP-0052 as the shipped F6C implementation record
- widened monitoring domain contract
- additive monitor-kind persistence support
- one deterministic collections monitor evaluator
- one run/latest collections monitor route pair if needed
- one operator-visible collections alert-card read model
- one narrow collections monitor smoke
- active docs refreshed only for behavior that actually ships

Do not create FP-0053 in this slice.

## Interfaces and Dependencies

Package boundaries remain unchanged:

- `packages/domain` owns pure monitoring contracts and Finance Twin schemas
- `packages/db` owns additive monitor result persistence and migrations only
- `apps/control-plane/src/modules/finance-twin` remains the owner of receivables-aging and collections-posture source-backed reads
- `apps/control-plane/src/modules/monitoring` owns deterministic monitor evaluation, persistence orchestration, and HTTP surfaces
- `apps/control-plane/src/modules/missions` remains untouched for F6C
- `apps/control-plane/src/modules/evidence` may be referenced for proof posture language but should not turn monitor alerts into reporting proof bundles
- `apps/web` owns operator read models and explicit operator actions only

Runtime-Codex stays out of scope:

- no runtime-Codex drafting
- no runtime-Codex investigation writeups
- no natural-language autonomous monitoring
- no runtime-owned finance facts

Delivery stays out of scope:

- no email
- no Slack
- no webhooks
- no notifications
- no send, distribute, publish, pay, book, file, release, tax filing, legal advice, or external action

Current module vocabulary stays stable:

- monitoring remains under `apps/control-plane/src/modules/monitoring/**`
- finance-twin reads remain under `apps/control-plane/src/modules/finance-twin/**`
- missions remain under `apps/control-plane/src/modules/missions/**`
- do not rename `modules/twin/**`
- do not rename `modules/reporting/**`
- do not rename `@pocket-cto/*`
- do not delete GitHub or engineering-twin modules as part of F6C

No new environment variables are expected.
No stack-pack changes are expected before F6F.
GitHub connector work is out of scope.

## Outcomes & Retrospective

This plan now records the F6C collections-pressure monitor implementation.
FP-0050 and FP-0051 remain shipped records, F6C adds exactly one second monitor family, and at F6C closeout F6D had not started.
F6D planning was required to begin only in a new Finance Plan.
Later docs-and-plan work created `plans/FP-0053-payables-pressure-monitor-foundation.md` as the active F6D implementation-ready contract; FP-0052 remains the shipped F6C historical record and should not be reopened for payables implementation.

The implementation preserves F6A cash monitoring and F6B cash-alert investigation behavior while adding `collections_pressure` run/latest routes, persistence, deterministic evaluator semantics, operator read model support, and a packaged local smoke.
Collections alerts remain investigation-free in F6C and do not use runtime-Codex, delivery, reports, approvals, bank/accounting/tax/legal writes, notifications, or autonomous remediation.
The full F6C validation ladder passed through `pnpm ci:repro:current`, and later F6D implementation should use FP-0053 rather than continuing implementation under FP-0052.
