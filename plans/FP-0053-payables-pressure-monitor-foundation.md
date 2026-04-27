# Define F6D payables pressure monitor foundation

## Purpose / Big Picture

This file is the active implementation-ready Finance Plan for Pocket CFO F6D.
The target phase is `F6`, and the first real F6D implementation slice is exactly `F6D-payables-pressure-monitor-foundation`.

The user-visible goal is narrow: after shipped F6A records one deterministic source-backed `cash_posture` monitor result plus alert card, shipped F6B lets an operator manually create or open one investigation mission from one persisted `cash_posture` alert, and shipped F6C adds one deterministic `collections_pressure` monitor result plus optional alert card, Pocket CFO should add one third monitor family.
The first F6D monitor family is exactly `payables_pressure`.
It should read stored Finance Twin payables-aging or payables-posture state for one `companyKey`, record one deterministic monitor result with `monitorKind = "payables_pressure"`, and expose one optional operator alert card only when source-backed conditions warrant it.

Payables comes next because it is already a shipped finance discovery family, it is grounded in stored payables-aging and payables-posture state, it is a common recurring CFO operating monitor, and it naturally complements `cash_posture` and `collections_pressure` without requiring bank, accounting, tax, legal, delivery, or payment writes.
Repo truth does not show policy or covenant monitoring as strictly safer for F6D.
Policy/covenant threshold monitoring can follow later only when source-backed or operator-owned thresholds are named explicitly.

This is a docs-and-plan contract.
Do not treat FP-0053 as shipped implementation.
FP-0050 remains the shipped F6A record, FP-0051 remains the shipped F6B record, and FP-0052 remains the shipped F6C record.
GitHub connector work is explicitly out of scope.

F6D must stay deterministic, runtime-free, delivery-free, non-autonomous, and human-reviewable.
It must not create investigations, run F6B handoffs, use runtime-Codex, send notifications, invoke Slack or email, perform bank/accounting/tax/legal writes, generate payment instructions, recommend vendor payments, produce LLM-generated finance advice, create reports, add approval kinds, or widen into a broad monitoring platform.

## Progress

- [x] 2026-04-27T12:58:20Z Audit shipped F6A/F6B/F6C records, active docs, monitoring bounded context, payables-aging/payables-posture source posture, proof-bundle boundary, runtime-Codex boundary, delivery-free posture, and current validation ladder.
- [x] 2026-04-27T12:58:20Z Create FP-0053 as the single active F6D implementation-ready contract while preserving FP-0050, FP-0051, and FP-0052 as shipped records.
- [x] 2026-04-27T12:58:20Z Refresh active docs so the next implementation thread can start the narrow `payables_pressure` monitor from FP-0053 rather than re-planning F6D or widening into multi-monitor work.
- [x] 2026-04-27T13:07:38Z Run the docs-and-plan validation ladder through `pnpm ci:repro:current` and record the green result.
- [x] 2026-04-27T13:50:22Z Implement `F6D-payables-pressure-monitor-foundation` without adding investigations, delivery, runtime-Codex, approvals, reports, payment behavior, or broad monitoring-platform behavior.
- [x] 2026-04-27T13:50:22Z Add narrow payables-pressure evaluator, service, route, operator UI/API, migration, smoke, and regression tests while preserving F6A/F6B/F6C behavior.
- [x] 2026-04-27T13:50:22Z Run narrow domain, control-plane monitoring, and web monitoring/API specs after implementation; all passed.
- [x] 2026-04-27T13:58:30Z Run and record the full F6D implementation validation ladder after code changes exist; narrow specs, migration, baseline smokes, new payables smoke, twin guardrails, lint, typecheck, test, and `pnpm ci:repro:current` all passed.

## Surprises & Discoveries

The shipped monitoring bounded context already has the right first shape for F6D.
`apps/control-plane/src/modules/monitoring/**` owns deterministic evaluation, persistence, run/latest routes, formatting, and alert-card posture for F6A and F6C.
F6D should extend that bounded context rather than creating a second alert system.

The current monitoring domain and DB enum support exactly `cash_posture` and `collections_pressure`.
F6D implementation will need one additive widening to `payables_pressure`, including the existing `monitor_results` persistence path.
That widening belongs to the implementation thread, not this docs-and-plan slice.

Payables and collections have symmetric stored-state posture in the Finance Twin.
`FinanceTwinService.getPayablesPosture(companyKey)` reads persisted payables-aging state and exposes freshness, latest attempted sync, latest successful source, coverage, diagnostics, currency buckets, and limitations.
`FinanceTwinService.getPayablesAging(companyKey)` exposes row-level vendor aging state and source lineage.
No repo fact made policy/covenant monitoring strictly safer for F6D.

The shipped F6B handoff is intentionally cash-alert-specific.
F6D must not modify `POST /missions/monitoring-investigations` or create payables investigations.
A non-cash alert-to-investigation path can be deferred unless a later named plan proves a concrete operator need and a narrow safe shape.

The implementation thread confirmed that the existing monitoring repository and alert-card shape can carry `payables_pressure` without table-shape changes.
The only persistence change needed is the additive `monitor_kind` enum value plus one generated migration.
The payables evaluator had to be stricter than simple ratio math: when stored diagnostics report partial rollups, total/detail conflicts, mixed past-due bases, missing total basis, or mixed date posture, F6D reports coverage or data-quality posture instead of computing overdue concentration.

## Decision Log

Decision: the first real F6D scope is `F6D-payables-pressure-monitor-foundation`.
Rationale: F6D needs one implementation-ready third-monitor contract, not a broad monitoring platform or multi-monitor expansion.

Decision: the first F6D monitor family is exactly `payables_pressure`.
Rationale: `payables_pressure` is a shipped finance discovery family, is backed by shipped payables-aging and payables-posture Finance Twin reads, and complements shipped `cash_posture` and `collections_pressure` monitoring without requiring external writes.

Decision: the F6D input contract is one `companyKey` plus stored Finance Twin payables-aging or payables-posture state.
Rationale: the monitor must start from source-backed stored state, explicit source freshness or missing-source posture, source lineage refs, and limitations.
It must not start from generic chat, `finance_memo`, `board_packet`, `lender_update`, `diligence_packet`, a `cash_posture` monitor rerun, a `collections_pressure` monitor rerun, or an F6B investigation mission.

Decision: the F6D output contract is one deterministic monitor result plus one optional operator alert card.
Rationale: the durable proof point is a persisted monitor finding with `monitorKind = "payables_pressure"`, deterministic severity, source lineage, freshness or missing-source posture, deterministic rationale, limitations, proof posture, and a human-review next step.

Decision: F6D condition kinds remain narrow.
Rationale: the implementation should use only `missing_source`, `failed_source`, `stale_source`, `coverage_gap`, `overdue_concentration`, and `data_quality_gap`.
Those conditions are already part of the shipped monitoring condition vocabulary and can truthfully cover payables source posture without adding advice or remediation.

Decision: F6D reuses the F6A/F6C monitoring bounded context.
Rationale: monitor results already persist in `monitor_results`, and the operator alert-card pattern already exists.
A second alert system would weaken source-truth and audit boundaries.

Decision: F6D does not create investigations.
Rationale: FP-0051 shipped the first manual alert-to-investigation handoff for one persisted `cash_posture` alert only.
Payables alert-to-investigation should remain deferred unless a later named plan proves it narrow and safe.

Decision: F6D stays deterministic, runtime-free, delivery-free, and non-autonomous.
Rationale: the monitor is a deterministic read over stored state.
It must not use runtime-Codex, notification delivery, scheduled external sends, LLM advice, autonomous remediation, bank writes, accounting writes, tax filings, legal advice, payment instructions, vendor-payment recommendations, or external communication releases.

Decision: F6D preserves F5 and shipped F6A/F6B/F6C behavior.
Rationale: no reporting approval, release, circulation, correction, report conversion, F6B mission behavior, collections monitor change, new discovery family, new approval kind, or packet/report path belongs in this third-monitor foundation.

Decision: likely later F6 slices are named but not created here.
Rationale: likely later slices are `F6E-policy-covenant-threshold-monitor-foundation`, `F6F-monitor-demo-replay-and-stack-pack-foundation`, and `F6G-non-cash-alert-to-investigation-generalization` only if a concrete operator need is proven.
Do not create those plans during F6D.

Decision: F6D uses one additive `monitor_kind` enum migration and keeps `monitor_results` table shape unchanged.
Rationale: the existing result JSON, source freshness, lineage, proof posture, alert card, and idempotent company/kind/run-key persistence already carry the payables monitor evidence without a new persistence model.

Decision: payables overdue concentration is blocked by unsafe diagnostics.
Rationale: FP-0053 requires source-backed computable totals only; partial rollups, total/detail conflicts, mixed bases, missing total basis, and mixed date posture are better reported as `coverage_gap` or `data_quality_gap` than turned into a ratio.

## Context and Orientation

Pocket CFO has shipped:

- F1 raw source registration and immutable file ingest
- F2A through F2O deterministic Finance Twin breadth, including payables-aging and payables-posture support
- F3A through F3D deterministic CFO Wiki compilation, lint/export, concepts, metrics, and policy pages
- F4A through F4C2 deterministic finance discovery for exactly six shipped families
- F5A through F5C4I deterministic reporting, packet, approval, release, circulation, correction, actor, and note-reset posture
- F6A deterministic `cash_posture` monitoring over stored Finance Twin cash-posture state only
- F6B manual alert-to-investigation handoff from one persisted alerting `cash_posture` monitor result
- F6C deterministic `collections_pressure` monitoring over stored receivables-aging or collections-posture state only

The shipped discovery families remain exactly:

- `cash_posture`
- `collections_pressure`
- `payables_pressure`
- `spend_posture`
- `obligation_calendar_review`
- `policy_lookup`

The current backend monitoring surface is:

- `POST /monitoring/companies/:companyKey/cash-posture/run`
- `GET /monitoring/companies/:companyKey/cash-posture/latest`
- `POST /monitoring/companies/:companyKey/collections-pressure/run`
- `GET /monitoring/companies/:companyKey/collections-pressure/latest`
- `POST /missions/monitoring-investigations` for persisted alerting `cash_posture` results only

The relevant existing implementation seams for F6D are:

- `packages/domain/src/monitoring.ts` for monitor result, alert card, condition, proof posture, runtime boundary, and cash-only investigation seed contracts
- `packages/domain/src/finance-twin.ts` for `FinancePayablesPostureView`, `FinancePayablesAgingView`, freshness, lineage, coverage, diagnostics, and limitations schemas
- `packages/db/src/schema/monitoring.ts` for additive `monitor_results` persistence
- `apps/control-plane/src/modules/finance-twin/**` for stored payables-aging and payables-posture reads
- `apps/control-plane/src/modules/monitoring/**` for deterministic monitor evaluation, persistence, routes, and formatting
- `apps/web/app/monitoring/**` and `apps/web/components/monitoring-alert-card.tsx` for the current operator monitoring read model
- `tools/cash-posture-monitor-smoke.mjs`, `tools/collections-pressure-monitor-smoke.mjs`, `tools/finance-twin-payables-aging-smoke.mjs`, and `tools/finance-discovery-supported-families-smoke.mjs` for current proof patterns

No GitHub connector work is in scope.
No new environment variables are expected.
No stack-pack changes are expected before F6F.

## Plan of Work

First, widen the monitoring domain contract additively.
The implementation should allow `monitorKind = "payables_pressure"` alongside the shipped `cash_posture` and `collections_pressure` kinds, while preserving current cash and collections monitor behavior and discovery-family vocabulary.
Condition kinds should remain exactly the existing narrow set: `missing_source`, `failed_source`, `stale_source`, `coverage_gap`, `overdue_concentration`, and `data_quality_gap`.

Second, extend the existing monitoring bounded context.
The preferred implementation shape is to add payables-specific evaluation in `apps/control-plane/src/modules/monitoring/**`, reusing the existing repository, formatter, service, and route patterns.
The route layer must stay thin: parse input, call service, serialize output.
SQL stays in the repository, and deterministic condition/severity logic stays in evaluator or formatting helpers.

Third, persist the payables monitor result in the existing `monitor_results` table.
The implementation should add the new monitor kind additively and keep the existing idempotent `(companyId, monitorKind, runKey)` retry behavior.
The result JSON must carry source freshness posture, source lineage refs, limitations, proof posture, runtime boundary, replay posture, deterministic severity rationale, human-review next step, and the optional alert card.

Fourth, expose the smallest operator read model.
The operator surface should show a payables alert card only when the latest persisted `payables_pressure` result has `status = "alert"`.
It may reuse the existing monitoring page or add a narrow payables section, but it must not introduce notification controls, investigation creation, payment actions, report conversion, approvals, or a broad monitoring dashboard.

Fifth, add one narrow implementation proof in the later implementation thread.
That proof should create source-backed payables-aging or payables-posture state, run the payables monitor, assert alert and no-alert posture, assert source lineage/freshness/limitations/proof/human-review posture, and assert no mission, report artifact, runtime-Codex thread, outbox delivery, approval, payment instruction, notification, or autonomous finance action is created.

## Concrete Steps

1. Widen the pure monitoring contract.
   Expected future files in the implementation thread:
   - `packages/domain/src/monitoring.ts`
   - `packages/domain/src/monitoring.spec.ts`
   - `packages/domain/src/index.ts` only if exports need adjustment

   Required contract behavior:
   - accept `monitorKind = "payables_pressure"`
   - preserve `monitorKind = "cash_posture"` and `monitorKind = "collections_pressure"` behavior
   - keep result status as `no_alert` or `alert`
   - keep severity deterministic and finite: `none`, `info`, `warning`, `critical`
   - include `overdue_concentration` only for source-backed payables posture, not generic vendor-payment advice
   - keep alert cards nullable and only present for alerting results
   - keep runtime boundary fields false for runtime-Codex, delivery, investigation creation, and autonomous finance actions

2. Add additive DB support only for the new monitor kind.
   Expected future files in the implementation thread:
   - `packages/db/src/schema/monitoring.ts`
   - one additive migration generated by `pnpm db:generate`
   - narrow schema or repository specs if needed

   Persistence must:
   - reuse `monitor_results`
   - keep raw sources immutable
   - avoid destructive schema changes
   - keep idempotent retry behavior by company, monitor kind, and run key

3. Add payables monitor evaluation in the monitoring bounded context.
   Expected future files in the implementation thread:
   - `apps/control-plane/src/modules/monitoring/payables-evaluator.ts` or an equivalent split helper
   - `apps/control-plane/src/modules/monitoring/formatter.ts`
   - `apps/control-plane/src/modules/monitoring/service.ts`
   - `apps/control-plane/src/modules/monitoring/schema.ts`
   - `apps/control-plane/src/modules/monitoring/routes.ts`
   - adjacent specs

   The service must:
   - accept one `companyKey`
   - read stored payables posture through `FinanceTwinService.getPayablesPosture(companyKey)`
   - optionally read `getPayablesAging(companyKey)` only if the implementation needs row-level lineage or coverage already persisted in the Finance Twin
   - never read generic chat, report artifacts, cash monitor reruns, collections monitor reruns, or F6B investigation missions as inputs
   - produce one monitor result with deterministic severity and optional alert card
   - record replay posture or an explicit reason if monitor results remain non-mission replay records

4. Define deterministic payables conditions and severity.
   Required first condition behavior:
   - `missing_source`: no successful payables-aging slice exists; severity `critical`
   - `failed_source`: latest attempted payables-aging sync failed; severity `critical`
   - `stale_source`: latest successful payables-aging slice is outside the freshness window; severity `warning`
   - `coverage_gap`: no rows, no vendors, no currency buckets, or no source-backed totals sufficient to evaluate payables posture; severity `critical` for no coverage and `warning` for partial coverage
   - `overdue_concentration`: source-backed past-due payables are concentrated in a currency bucket using explicit non-overlapping totals only; severity `warning` at or above a 50 percent past-due share and `critical` at or above a 75 percent past-due share
   - `data_quality_gap`: stored diagnostics such as mixed as-of dates, unknown currency, partial rollups, total/detail conflicts, or missing explicit date; severity `info` or `warning` by deterministic diagnostic classification

   `overdue_concentration` must not fire when the stored denominator or past-due basis is missing or partial.
   In that case F6D should report `coverage_gap` or `data_quality_gap` rather than inventing a ratio.

5. Add one narrow HTTP read/run surface if needed by the operator UI and smoke.
   Preferred future routes:
   - `POST /monitoring/companies/:companyKey/payables-pressure/run`
   - `GET /monitoring/companies/:companyKey/payables-pressure/latest`

   The routes must not contain SQL, prompt assembly, monitor math, investigation creation, report conversion, approval behavior, delivery logic, payment logic, or vendor-payment recommendations.

6. Add the operator alert-card read model.
   Expected future files in the implementation thread:
   - `apps/web/lib/api.ts`
   - `apps/web/app/monitoring/**`
   - `apps/web/components/monitoring-alert-card.tsx` or a narrow reusable monitor alert card split
   - adjacent specs

   The UI must:
   - expose source lineage, freshness or missing-source posture, deterministic severity rationale, limitations, proof posture, and human-review next step
   - not show create/open investigation for `payables_pressure` in F6D
   - not show email, Slack, webhook, notification, send, publish, pay, book, file, approval, report-conversion, or vendor-payment controls

7. Add one implementation smoke only in the implementation thread.
   Expected future files:
   - `tools/payables-pressure-monitor-smoke.mjs`
   - a package script such as `pnpm smoke:payables-pressure-monitor:local`

   The smoke should prove:
   - missing or failed payables-aging source state produces an alerting monitor result and alert card
   - stale source, coverage gap, overdue concentration, and data-quality posture produce deterministic conditions where source-backed state warrants them
   - fresh supported payables posture without alert conditions produces `no_alert`
   - repeated run keys reuse the stored monitor result identity
   - no runtime-Codex thread, mission, report artifact, approval, outbox event, notification, delivery action, bank/accounting/tax/legal write, payment instruction, vendor-payment recommendation, or autonomous finance action is created

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
- `pnpm smoke:finance-twin-payables-aging:local`
- `pnpm smoke:finance-discovery-supported-families:local`
- `pnpm smoke:cash-posture-monitor:local`
- `pnpm smoke:cash-posture-alert-investigation:local`
- `pnpm smoke:collections-pressure-monitor:local`
- `pnpm smoke:payables-pressure-monitor:local`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

F6D implementation acceptance is observable only if all of the following are true:

- one `companyKey` can be monitored for `payables_pressure` using stored Finance Twin payables-aging or payables-posture state only
- one deterministic `monitor_result` persists with `monitorKind = "payables_pressure"`
- an alert card appears only when deterministic source-backed conditions warrant it
- every alert card includes source lineage, freshness or missing-source posture, deterministic rationale, limitations, proof posture, and a human-review next step
- severity is deterministic and based only on stored state, explicit freshness, coverage, diagnostics, and code-owned overdue concentration thresholds
- no new discovery family is added
- no `finance_memo`, `board_packet`, `lender_update`, or `diligence_packet` is used as a monitor input
- no `cash_posture` monitor rerun, `collections_pressure` monitor rerun, or F6B investigation mission is used as a monitor input
- no investigation mission is created in F6D
- no runtime-Codex, email, Slack, webhook, notification delivery, send, publish, payment, payment instruction, vendor-payment recommendation, journal booking, tax filing, legal advice, LLM-generated advice, or autonomous remediation is added
- F5 reporting and approval semantics remain unchanged
- F6A `cash_posture` monitoring, F6B manual `cash_posture` alert handoff, and F6C `collections_pressure` monitoring remain green

## Idempotence and Recovery

F6D implementation must be retry-safe.
Rerunning the same payables monitor input with the same run key should preserve one logical monitor result identity and avoid misleading duplicate alerts, following the F6A/F6C persistence pattern.

If the implementation writes a monitor result and then fails, the persistence path should roll back transactionally where possible.
Raw sources, source snapshots, source files, Finance Twin facts, CFO Wiki pages, reports, approvals, and investigation missions must not be mutated to make monitoring pass.

Rollback should revert the additive F6D domain, DB enum/migration, monitoring service, route, UI, and smoke changes while leaving FP-0050, FP-0051, FP-0052, existing `cash_posture` monitor behavior, existing F6B mission handoff behavior, existing `collections_pressure` monitor behavior, F5 reporting/approval behavior, raw sources, and Finance Twin state intact.

If payables source state is missing, stale, failed, partial, inconsistent, or insufficient for an overdue concentration ratio, the monitor should report that posture instead of inventing a payables-risk conclusion.

## Artifacts and Notes

This FP-0053 F6D implementation slice produces:

- widened monitoring domain contract
- additive monitor-kind persistence support
- one deterministic payables monitor evaluator
- one run/latest payables monitor route pair
- one operator-visible payables alert-card read model
- one narrow payables monitor smoke
- active docs refreshed for the shipped F6D behavior

The implementation does not produce runtime-Codex, delivery, investigation, approval, report, payment-instruction, vendor-payment recommendation, bank/accounting/tax/legal write, or stack-pack changes.

Do not create FP-0054 in this slice.

## Interfaces and Dependencies

Package boundaries must remain unchanged:

- `packages/domain` owns pure monitoring contracts and Finance Twin schemas
- `packages/db` owns additive monitor result persistence and migrations only
- `apps/control-plane/src/modules/finance-twin` remains the owner of payables-aging and payables-posture source-backed reads
- `apps/control-plane/src/modules/monitoring` owns deterministic monitor evaluation, persistence orchestration, and HTTP surfaces
- `apps/control-plane/src/modules/missions` remains untouched for F6D
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
- no send, distribute, publish, pay, book, file, release, tax filing, legal advice, payment instruction, vendor-payment recommendation, or external action

Current module vocabulary stays stable:

- monitoring remains under `apps/control-plane/src/modules/monitoring/**`
- finance-twin reads remain under `apps/control-plane/src/modules/finance-twin/**`
- missions remain under `apps/control-plane/src/modules/missions/**`
- do not rename `modules/twin/**`
- do not rename `modules/reporting/**`
- do not rename `@pocket-cto/*`
- do not delete GitHub or engineering-twin modules as part of F6D

No new environment variables are expected.
No stack-pack changes are expected before F6F.
GitHub connector work is out of scope.

## Outcomes & Retrospective

This implementation slice ships FP-0053 as the F6D payables-pressure monitor foundation.
The repo now supports one deterministic `payables_pressure` monitor result plus optional alert card over stored payables-aging or payables-posture state.

FP-0050, FP-0051, and FP-0052 remain shipped records.
F6D preserves F6A cash monitoring, F6B cash-alert investigation behavior, and F6C collections monitoring while adding only the narrow payables monitor foundation.
Validation passed locally with the required F6D ladder, including the new `pnpm smoke:payables-pressure-monitor:local` proof and `pnpm ci:repro:current`.
F6E, F6F, and F6G remain named later slices only; do not create those plans from this slice.
F6E planning should start next only through a new Finance Plan, and no F6E implementation has started here.
