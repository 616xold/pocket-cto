# Define F6E policy covenant threshold monitor foundation

## Purpose / Big Picture

This file is the shipped Finance Plan record for the Pocket CFO F6E implementation slice.
The target phase is `F6`, and the first implementation slice is exactly `F6E-policy-covenant-threshold-monitor-foundation`.

The user-visible goal is narrow: after shipped F6A records one deterministic `cash_posture` monitor result plus optional alert card, shipped F6B supports one manual cash-alert investigation handoff, shipped F6C adds one deterministic `collections_pressure` monitor, and shipped F6D adds one deterministic `payables_pressure` monitor, Pocket CFO should add one fourth monitor family.
The first F6E monitor family is exactly `policy_covenant_threshold`.
It should read stored policy or covenant threshold posture for one `companyKey` from existing CFO Wiki policy-document bindings, stored deterministic policy extracts, compiler-owned policy pages, policy-corpus posture, and any explicit comparable Finance Twin posture already available.
It should persist one deterministic monitor result with `monitorKind = "policy_covenant_threshold"` plus one optional operator alert card only when source-backed conditions warrant it.

F6E is implementation-ready only because repo truth already supports a narrow source-backed policy substrate: explicit `policy_document` bindings, stored deterministic document extracts, compiler-owned policy pages at `policies/<sourceId>`, `concepts/policy-corpus`, source-digest history, source freshness or missing-source posture, and the shipped `policy_lookup` discovery family.
Repo truth does not support broad covenant-risk scoring, legal interpretation, generic policy chat, corpus-wide retrieval, or autonomous control enforcement.
Therefore the first implementation must fail closed: `threshold_breach` and `threshold_approaching` can appear only when an explicit stored threshold fact and an explicit comparable stored actual posture share a deterministic basis.
If that basis is missing, stale, unsupported, failed, partial, conflicting, unit-mismatched, or interpretive, the monitor should report `missing_source`, `failed_source`, `stale_source`, `coverage_gap`, or `data_quality_gap` instead of inventing a threshold conclusion.

This is the shipped F6E implementation record.
FP-0050 remains the shipped F6A record, FP-0051 remains the shipped F6B record, FP-0052 remains the shipped F6C record, and FP-0053 remains the shipped F6D record.
Do not create FP-0055 during this slice.
GitHub connector work is explicitly out of scope.

F6E must stay deterministic, runtime-free, delivery-free, non-autonomous, and human-reviewable.
It must not create investigations, generalize F6B, use runtime-Codex, send notifications, invoke Slack or email, perform bank/accounting/tax/legal writes, generate policy or legal advice, create payment instructions, produce LLM-generated advice, create reports, add approval kinds, add a discovery family, or widen into a broad monitoring platform.

## Progress

- [x] 2026-04-27T14:43:05Z Audit shipped F6A/F6B/F6C/F6D records, active docs, monitoring bounded context, CFO Wiki policy posture, `policy_lookup` proof posture, source freshness, proof boundaries, runtime-Codex boundary, delivery-free posture, and current validation ladder.
- [x] 2026-04-27T14:43:05Z Confirm repo truth supports a narrow policy/covenant threshold monitor contract only if the implementation fails closed to explicit stored threshold facts and explicit comparable stored posture.
- [x] 2026-04-27T14:43:05Z Create FP-0054 as the single active F6E implementation-ready contract while preserving FP-0050, FP-0051, FP-0052, and FP-0053 as shipped records.
- [x] 2026-04-27T14:43:05Z Refresh active docs so the next implementation thread can start the narrow `policy_covenant_threshold` monitor from FP-0054 rather than re-planning F6E or widening into multi-monitor work.
- [x] 2026-04-27T14:50:59Z Run the docs-and-plan validation ladder through `pnpm ci:repro:current` and record the green result.
- [x] 2026-04-27T15:59:00Z Implement `F6E-policy-covenant-threshold-monitor-foundation` without adding investigations, delivery, runtime-Codex, approvals, reports, legal interpretation, policy advice, payment behavior, or broad monitoring-platform behavior.
- [x] 2026-04-27T15:59:00Z Add the fourth monitor family, `policy_covenant_threshold`, with exact grammar threshold extraction for `collections_past_due_share` and `payables_past_due_share` only.
- [x] 2026-04-27T15:59:00Z Add additive monitor-kind persistence, run/latest routes, operator monitoring read model, and the packaged `pnpm smoke:policy-covenant-threshold-monitor:local` proof.
- [x] 2026-04-27T16:16:07Z Run the full F6E implementation validation ladder through `pnpm ci:repro:current` and record the green result after modularity and diagnostic-polish fixes.
- [x] 2026-04-27T17:32:23Z Run a strict F6E QA pass and tighten the policy/covenant evaluator so stale or failed policy-source posture blocks threshold-breach or threshold-approaching conclusions.
- [x] 2026-04-27T17:37:58Z Rerun the required QA validation ladder, including packaged F6 monitor smokes, twin guardrails, lint, typecheck, test, and `pnpm ci:repro:current`, on the corrected tree.

## Surprises & Discoveries

The shipped CFO Wiki and policy lookup surfaces are enough to plan F6E, but only for a fail-closed monitor.
`apps/control-plane/src/modules/wiki/**` already exposes bound policy sources, latest snapshot metadata, latest deterministic extract status, policy page freshness, policy-corpus posture, limitations, and source gaps.
`apps/control-plane/src/modules/finance-discovery/policy-lookup.ts` already proves source-scoped policy answers without generic retrieval or runtime-Codex.

The repo does not currently have a structured covenant-risk or threshold-fact domain model.
The implementation must not pretend one exists.
If the first threshold reader derives facts from stored deterministic policy text, it must keep every extracted threshold tied to source id, snapshot id, source file id, policy page key, excerpt text, parser/version posture, and visible limitations.

The current monitoring lineage schema is Finance-Twin-sync shaped.
Policy documents are CFO Wiki/source-snapshot shaped.
F6E may need an additive monitoring lineage posture that can cite policy source snapshots, document extracts, policy page keys, and compile runs without faking a Finance Twin sync run.

The shipped discovery family list must remain unchanged.
F6E adds a monitor kind, not a `covenant_risk` discovery family and not a broader policy advice path.

The shipped F6B handoff is intentionally cash-alert-specific.
F6E must not create investigations or widen `POST /missions/monitoring-investigations`.
Non-cash alert-to-investigation generalization remains later only if a concrete operator need is proven.

Implementation inspection found a safe first comparable actual basis in stored Finance Twin collections/payables posture: `collections_past_due_share` and `payables_past_due_share` can be computed from one fresh, source-backed, single-currency posture bucket when the numerator, denominator, coverage, freshness, and lineage are explicit and non-conflicting.
The implementation therefore supports only those two metric keys and fails closed for generic covenant names, unsupported units, ambiguous grammar, stale or failed posture, missing actuals, partial coverage, and conflicting bases.

Implementation validation found two polish issues before commit: the first evaluator draft had grown past the repo modularity preference, and unsupported metric or unit diagnostics could repeat when the same deterministic threshold line appeared through both policy page and extract surfaces.
The final implementation keeps the public evaluator facade but splits extraction, shared types, comparable actual reading, and result assembly into focused monitoring modules, and it de-duplicates extraction diagnostics without changing fail-closed behavior.

Post-PR QA found one narrow fail-closed defect inside the F6E evaluator: stale policy-corpus or policy-page posture could still coexist with a threshold conclusion when an exact threshold fact and comparable actual were otherwise present.
The correction keeps the stale or failed source alert, preserves policy source and threshold-fact lineage for review, and skips comparable-actual reads plus `threshold_breach` or `threshold_approaching` conclusions until policy-source freshness is usable.

## Decision Log

Decision: the first real F6E scope is `F6E-policy-covenant-threshold-monitor-foundation`.
Rationale: the next thread needs one implementation-ready fourth-monitor contract, not a broad monitoring platform or a policy/legal workflow.

Decision: the first F6E monitor family is exactly `policy_covenant_threshold`.
Rationale: `policy_lookup` is already a shipped discovery family, policy/CFO Wiki source posture already exists, and a threshold monitor complements cash, collections, and payables monitoring without adding external writes.

Decision: F6E starts from stored policy/CFO Wiki and explicit stored posture, not generic chat or report artifacts.
Rationale: the input contract is one `companyKey`, stored policy or covenant threshold state from existing CFO Wiki policy documents and explicit Finance Twin posture when comparable, source freshness or missing-source posture, source lineage refs, and limitations. `finance_memo`, `board_packet`, `lender_update`, `diligence_packet`, monitor reruns, and F6B investigation missions are not inputs.

Decision: threshold conclusions are allowed only when explicit and comparable.
Rationale: `threshold_breach` and `threshold_approaching` must require an explicit stored threshold fact, an explicit stored actual value or status, compatible units and scope, deterministic comparison rules, and source lineage for both sides. Otherwise the result must expose source, coverage, or data-quality posture.

Decision: F6E reuses the shipped monitoring bounded context and `monitor_results`.
Rationale: `apps/control-plane/src/modules/monitoring/**`, existing persisted monitor results, and the alert-card read model already carry deterministic results and proof posture. F6E must not create a second alert system.

Decision: F6E does not create investigations.
Rationale: FP-0051 shipped a manual alert-to-investigation handoff for one persisted alerting `cash_posture` result only. Policy/covenant alert investigation is deferred unless a later plan proves a concrete operator need.

Decision: F6E stays deterministic, runtime-free, delivery-free, and non-autonomous.
Rationale: monitoring is a deterministic read over stored source, wiki, twin, and proof state. It must not use runtime-Codex, notification delivery, scheduled external sends, LLM advice, autonomous remediation, bank writes, accounting writes, tax filings, legal advice, policy advice, payment instructions, or external communication releases.

Decision: F6E preserves F5 and shipped F6A/F6B/F6C/F6D behavior.
Rationale: no reporting approval, release, circulation, correction, report conversion, F6B mission behavior, existing cash/collections/payables monitor behavior, discovery family, approval kind, or packet/report path belongs in this fourth-monitor foundation.

Decision: likely later F6 slices are named but not created here.
Rationale: likely later slices are `F6F-monitor-demo-replay-and-stack-pack-foundation`, `F6G-non-cash-alert-to-investigation-generalization` only if a concrete operator need is proven, and `F6H-additional-monitor-families` only if source-backed and explicitly scoped. Do not create those plans during F6E.

Decision: F6E threshold facts use exact deterministic grammar only.
Rationale: the shipped evaluator parses only `Pocket CFO threshold: <metric_key> <operator> <value> percent` lines from stored deterministic policy extracts or policy pages, with operators `<=`, `<`, `>=`, and `>`, so vague policy prose cannot become a breach or approaching-threshold conclusion.

Decision: F6E adds policy/source lineage variants instead of faking Finance Twin sync lineage.
Rationale: policy source refs, threshold fact refs, and comparable actual refs carry different provenance. The monitor contract now has narrow additive lineage variants for CFO Wiki policy source posture and extracted threshold facts while preserving the existing Finance-Twin-shaped lineage for cash, collections, and payables monitors.

Decision: keep the policy/covenant evaluator public surface small and split the implementation by responsibility.
Rationale: `policy-covenant-evaluator.ts` stays as the compatibility facade, while extraction, comparable actual reading, result assembly, and shared F6E types live in separate monitoring modules so the implementation does not collapse source posture, threshold grammar, Finance Twin math, and alert-card assembly into one file.

Decision: stale or failed CFO Wiki policy-source posture blocks threshold comparisons.
Rationale: F6E threshold conclusions require usable source freshness on the policy side as well as explicit comparable Finance Twin actual posture. When policy-corpus or policy-page freshness is stale or failed, the monitor reports source posture and lineage only, rather than adding `threshold_breach` or `threshold_approaching`.

## Context and Orientation

Pocket CFO has shipped:

- F1 raw source registration and immutable file ingest
- F2A through F2O deterministic Finance Twin breadth
- F3A through F3D deterministic CFO Wiki compilation, lint/export, concepts, metric definitions, and policy pages
- F4A through F4C2 deterministic finance discovery for exactly six shipped families, including explicit-source `policy_lookup`
- F5A through F5C4I deterministic reporting, packet, approval, release, circulation, correction, actor, and note-reset posture
- F6A deterministic `cash_posture` monitoring over stored Finance Twin cash-posture state only
- F6B manual alert-to-investigation handoff from one persisted alerting `cash_posture` monitor result
- F6C deterministic `collections_pressure` monitoring over stored receivables-aging or collections-posture state only
- F6D deterministic `payables_pressure` monitoring over stored payables-aging or payables-posture state only

The shipped discovery families remain exactly:

- `cash_posture`
- `collections_pressure`
- `payables_pressure`
- `spend_posture`
- `obligation_calendar_review`
- `policy_lookup`

F6E must not add a discovery family.
In particular, `covenant_risk` remains blocked as a discovery family until deterministic support exists, and F6E must not use that blocked family as a back door.

The current backend monitoring surface is:

- `POST /monitoring/companies/:companyKey/cash-posture/run`
- `GET /monitoring/companies/:companyKey/cash-posture/latest`
- `POST /monitoring/companies/:companyKey/collections-pressure/run`
- `GET /monitoring/companies/:companyKey/collections-pressure/latest`
- `POST /monitoring/companies/:companyKey/payables-pressure/run`
- `GET /monitoring/companies/:companyKey/payables-pressure/latest`
- `POST /missions/monitoring-investigations` for persisted alerting `cash_posture` results only

The relevant existing implementation seams for F6E are:

- `packages/domain/src/monitoring.ts` for monitor result, alert card, condition, proof posture, runtime boundary, and cash-only investigation seed contracts
- `packages/domain/src/cfo-wiki.ts` for policy pages, bound policy sources, document extracts, source excerpts, freshness, and limitations schemas
- `packages/domain/src/discovery-mission.ts` for the shipped six-family discovery vocabulary, which must stay unchanged
- `packages/db/src/schema/monitoring.ts` for additive `monitor_results` persistence
- `apps/control-plane/src/modules/wiki/**` for source-scoped policy pages, source bindings, extracts, freshness, compile runs, and policy-corpus posture
- `apps/control-plane/src/modules/finance-discovery/policy-lookup.ts` for deterministic source-scoped policy evidence patterns
- `apps/control-plane/src/modules/monitoring/**` for deterministic monitor evaluation, persistence, routes, and formatting
- `apps/web/app/monitoring/**` and `apps/web/components/monitoring-alert-card.tsx` for the current operator monitoring read model
- `tools/finance-policy-lookup-smoke.mjs`, `tools/cfo-wiki-concept-metric-policy-smoke.mjs`, `tools/finance-discovery-supported-families-smoke.mjs`, and the shipped F6 monitor smokes for proof patterns

No GitHub connector work is in scope.
No new environment variables are expected.
No stack-pack changes are expected before F6F.

## Plan of Work

First, widen the pure monitoring contract additively.
The implementation should allow `monitorKind = "policy_covenant_threshold"` alongside shipped `cash_posture`, `collections_pressure`, and `payables_pressure`, while preserving current monitor behavior and discovery-family vocabulary.
Condition kinds should remain narrow and may include `missing_source`, `failed_source`, `stale_source`, `coverage_gap`, `data_quality_gap`, `threshold_breach`, and `threshold_approaching`.

Second, define the policy/covenant threshold input reader inside the monitoring bounded context.
The reader should start from one `companyKey` and load only stored CFO Wiki policy state and explicit comparable Finance Twin posture.
The preferred source posture is:

- company-scoped `policy_document` bindings from the existing CFO Wiki bound-source route/repository seam
- latest stored snapshots and raw source file ids for those bindings
- latest deterministic extracts and excerpt blocks
- compiler-owned policy pages at `policies/<sourceId>`
- `concepts/policy-corpus`
- source-digest pages for the same sources when useful
- explicit Finance Twin values only when a deterministic threshold comparison needs a comparable observed value

Third, persist the F6E monitor result in the existing `monitor_results` table.
The implementation should add the new monitor kind additively and keep the existing idempotent `(companyId, monitorKind, runKey)` retry behavior.
The result JSON must carry source freshness or missing-source posture, policy source lineage refs, limitations, proof posture, runtime boundary, replay posture, deterministic severity rationale, human-review next step, and the optional alert card.

Fourth, expose the smallest operator read model.
The operator surface should show a policy/covenant threshold alert card only when the latest persisted `policy_covenant_threshold` result has `status = "alert"`.
It may reuse the existing monitoring page or add a narrow fourth section, but it must not introduce notification controls, investigation creation, report conversion, approvals, policy advice, legal advice, remediation controls, or a broad monitoring dashboard.

Fifth, add one narrow implementation proof in the later implementation thread.
That proof should seed policy-document source posture, compile the CFO Wiki, run the policy/covenant threshold monitor, assert source posture and threshold comparison behavior only where explicit stored facts support it, assert fail-closed coverage or data-quality posture where they do not, and assert no mission, report artifact, runtime-Codex thread, outbox delivery, notification, approval, payment/legal/accounting write, or autonomous finance action is created.

## Concrete Steps

1. Widen the pure monitoring contract.
   Expected implementation files:
   - `packages/domain/src/monitoring.ts`
   - `packages/domain/src/monitoring.spec.ts`
   - `packages/domain/src/index.ts` only if exports need adjustment

   Required contract behavior:
   - accept `monitorKind = "policy_covenant_threshold"`
   - preserve `monitorKind = "cash_posture"`, `monitorKind = "collections_pressure"`, and `monitorKind = "payables_pressure"` behavior
   - keep result status as `no_alert` or `alert`
   - keep severity deterministic and finite: `none`, `info`, `warning`, `critical`
   - add only narrow condition kinds needed for F6E: `threshold_breach` and `threshold_approaching` in addition to source, coverage, and data-quality conditions
   - keep alert cards nullable and present only for alerting results
   - keep runtime boundary fields false for runtime-Codex, delivery, investigation creation, and autonomous finance actions
   - if policy/CFO Wiki lineage cannot fit the existing Finance-Twin-sync-shaped lineage schema truthfully, add an explicit policy/source lineage shape rather than faking a sync run

2. Add additive DB support only for the new monitor kind.
   Expected implementation files:
   - `packages/db/src/schema/monitoring.ts`
   - one additive migration generated by `pnpm db:generate`
   - narrow schema or repository specs if needed

   Persistence must:
   - reuse `monitor_results`
   - keep raw sources immutable
   - avoid destructive schema changes
   - keep idempotent retry behavior by company, monitor kind, and run key
   - avoid a second alert table or alert system

3. Add policy/covenant threshold evaluation in the monitoring bounded context.
   Expected implementation files:
   - `apps/control-plane/src/modules/monitoring/policy-covenant-threshold-evaluator.ts` or an equivalent split helper
   - `apps/control-plane/src/modules/monitoring/formatter.ts`
   - `apps/control-plane/src/modules/monitoring/service.ts`
   - `apps/control-plane/src/modules/monitoring/schema.ts`
   - `apps/control-plane/src/modules/monitoring/routes.ts`
   - adjacent specs

   The service must:
   - accept one `companyKey`
   - read stored policy posture through existing CFO Wiki service/repository seams
   - read explicit Finance Twin posture only when needed for a deterministic same-basis comparison
   - never read generic chat, report artifacts, cash/collections/payables monitor reruns, or F6B investigation missions as inputs
   - produce one monitor result with deterministic severity and optional alert card
   - record replay posture or an explicit reason if monitor results remain non-mission replay records

4. Define deterministic policy/covenant conditions and severity.
   Required first condition behavior:
   - `missing_source`: no included `policy_document` source or no stored policy/covenant threshold source posture exists; severity `critical`
   - `failed_source`: the latest bound policy source extract or required wiki compile posture failed; severity `critical`
   - `stale_source`: the latest bound policy source or required comparable posture is outside the freshness posture available to the implementation; severity `warning`
   - `coverage_gap`: no extract, no policy page, no threshold candidate, missing comparable actual posture, missing source file, or missing source lineage; severity `critical` for no usable coverage and `warning` for partial coverage
   - `data_quality_gap`: ambiguous threshold wording, multiple conflicting thresholds, missing units, incompatible units, unsupported source type, failed compile gap, or source/excerpt conflict; severity `info` or `warning` by deterministic classification
   - `threshold_approaching`: explicit stored actual posture is within a code-owned margin of an explicit stored threshold on a compatible basis; severity `warning`
   - `threshold_breach`: explicit stored actual posture crosses an explicit stored threshold on a compatible basis; severity `critical`

   The implementation must not infer policy advice, covenant compliance, legal meaning, control failure, approval state, payment action, or remediation from weak signals.
   If the stored basis is not comparable, F6E should report `coverage_gap` or `data_quality_gap` rather than inventing a threshold conclusion.

5. Add one narrow HTTP read/run surface if needed by the operator UI and smoke.
   Preferred routes:
   - `POST /monitoring/companies/:companyKey/policy-covenant-threshold/run`
   - `GET /monitoring/companies/:companyKey/policy-covenant-threshold/latest`

   The routes must stay thin.
   They must not contain SQL, prompt assembly, monitor math, investigation creation, report conversion, approval behavior, delivery logic, policy advice, legal advice, payment logic, or remediation logic.

6. Add the operator alert-card read model.
   Expected implementation files:
   - `apps/web/lib/api.ts`
   - `apps/web/app/monitoring/**`
   - `apps/web/components/monitoring-alert-card.tsx` or a narrow reusable monitor alert-card split
   - adjacent specs

   The UI must:
   - expose source lineage, freshness or missing-source posture, deterministic severity rationale, limitations, proof posture, and human-review next step
   - not show create/open investigation for `policy_covenant_threshold` in F6E
   - not show email, Slack, webhook, notification, send, publish, pay, book, file, approval, report-conversion, legal, policy-advice, or remediation controls

7. Add one implementation smoke only in the implementation thread.
   Expected future files:
   - `tools/policy-covenant-threshold-monitor-smoke.mjs`
   - a package script such as `pnpm smoke:policy-covenant-threshold-monitor:local`

   The smoke should prove:
   - missing policy/covenant threshold source state produces an alerting monitor result and alert card
   - failed, unsupported, stale, coverage-gap, and data-quality posture produce deterministic conditions where stored state warrants them
   - explicit stored threshold facts and explicit comparable stored posture produce deterministic `threshold_approaching` or `threshold_breach` only when the basis is source-backed
   - clean supported posture without alert conditions produces `no_alert`
   - repeated run keys reuse the stored monitor result identity
   - no runtime-Codex thread, mission, report artifact, approval, outbox event, notification, delivery action, bank/accounting/tax/legal write, policy advice, payment instruction, or autonomous finance action is created

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

This docs-and-plan thread must run the requested validation ladder:

- `pnpm smoke:source-ingest:local`
- `pnpm smoke:finance-policy-lookup:local`
- `pnpm smoke:cfo-wiki-concept-metric-policy:local`
- `pnpm smoke:finance-discovery-supported-families:local`
- `pnpm smoke:cash-posture-monitor:local`
- `pnpm smoke:collections-pressure-monitor:local`
- `pnpm smoke:payables-pressure-monitor:local`
- `pnpm smoke:cash-posture-alert-investigation:local`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

F6E implementation acceptance is observable only if all of the following are true:

- one `companyKey` can be monitored for `policy_covenant_threshold` using stored CFO Wiki policy-document state, stored deterministic extracts, policy pages, policy-corpus posture, and explicit comparable Finance Twin posture only
- one deterministic `monitor_result` persists with `monitorKind = "policy_covenant_threshold"`
- an alert card appears only when deterministic source-backed conditions warrant it
- every alert card includes source lineage, freshness or missing-source posture, deterministic rationale, limitations, proof posture, and a human-review next step
- severity is deterministic and based only on stored state, explicit freshness, missing-source posture, coverage, data-quality diagnostics, and explicit comparable threshold facts
- `threshold_breach` and `threshold_approaching` fire only when the threshold fact and observed posture are explicit, stored, cited, and comparable
- no new discovery family is added
- no `finance_memo`, `board_packet`, `lender_update`, or `diligence_packet` is used as a monitor input
- no cash, collections, or payables monitor rerun is used as a monitor input
- no F6B investigation mission is used as a monitor input
- no investigation mission is created in F6E
- no runtime-Codex, email, Slack, webhook, notification delivery, send, publish, payment, payment instruction, vendor-payment recommendation, journal booking, tax filing, legal advice, policy advice, LLM-generated advice, or autonomous remediation is added
- F5 reporting and approval semantics remain unchanged
- F6A `cash_posture` monitoring, F6B manual `cash_posture` alert handoff, F6C `collections_pressure` monitoring, and F6D `payables_pressure` monitoring remain green

## Idempotence and Recovery

F6E implementation must be retry-safe.
Rerunning the same policy/covenant threshold monitor input with the same run key should preserve one logical monitor result identity and avoid misleading duplicate alerts, following the shipped F6A/F6C/F6D persistence pattern.

If the implementation writes a monitor result and then fails, the persistence path should roll back transactionally where possible.
Raw sources, source snapshots, source files, deterministic policy extracts, CFO Wiki pages, Finance Twin facts, reports, approvals, and investigation missions must not be mutated to make monitoring pass.

Rollback should revert the additive F6E domain, DB enum/migration, monitoring service, route, UI, and smoke changes while leaving FP-0050, FP-0051, FP-0052, FP-0053, existing cash/collections/payables monitor behavior, existing F6B mission handoff behavior, F5 reporting/approval behavior, raw sources, CFO Wiki state, and Finance Twin state intact.

If policy/covenant source state is missing, stale, failed, unsupported, partial, conflicting, unit-mismatched, or insufficient for a threshold comparison, the monitor should report that posture instead of inventing a threshold breach, covenant risk conclusion, legal interpretation, or policy recommendation.

## Artifacts and Notes

This implementation slice produces:

- `plans/FP-0054-policy-covenant-threshold-monitor-foundation.md`
- widened monitoring domain contract
- additive monitor-kind persistence support
- one deterministic policy/covenant threshold evaluator
- one run/latest policy/covenant threshold monitor route pair
- one operator-visible policy/covenant threshold alert-card read model
- one narrow policy/covenant threshold monitor smoke
- active-doc updates that identify FP-0054 as the shipped F6E implementation record

Do not create FP-0055 during this slice.

## Interfaces and Dependencies

Package boundaries must remain unchanged:

- `packages/domain` owns pure monitoring contracts, CFO Wiki schemas, and Finance Twin schemas
- `packages/db` owns additive monitor result persistence and migrations only
- `apps/control-plane/src/modules/wiki` remains the owner of policy source binding, deterministic extract, policy page, policy-corpus, and compile-run source posture
- `apps/control-plane/src/modules/finance-twin` remains the owner of any explicit comparable structured posture used for threshold comparisons
- `apps/control-plane/src/modules/monitoring` owns deterministic monitor evaluation, persistence orchestration, and HTTP surfaces
- `apps/control-plane/src/modules/missions` remains untouched for F6E
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
- no send, distribute, publish, pay, book, file, release, tax filing, legal advice, policy advice, payment instruction, vendor-payment recommendation, or external action

Current module vocabulary stays stable:

- monitoring remains under `apps/control-plane/src/modules/monitoring/**`
- wiki reads remain under `apps/control-plane/src/modules/wiki/**`
- finance-twin reads remain under `apps/control-plane/src/modules/finance-twin/**`
- missions remain under `apps/control-plane/src/modules/missions/**`
- do not rename `modules/twin/**`
- do not rename `modules/reporting/**`
- do not rename `@pocket-cto/*`
- do not delete GitHub or engineering-twin modules as part of F6E

No new environment variables are expected.
No stack-pack changes are expected before F6F.
GitHub connector work is out of scope.

## Outcomes & Retrospective

This slice ships FP-0054 as the first real F6E implementation.

FP-0050, FP-0051, FP-0052, and FP-0053 remain shipped records.
F6E adds exactly one fourth monitor family, `policy_covenant_threshold`, over stored policy/CFO Wiki source posture and explicit comparable stored threshold facts only.
F6E does not create investigations for policy/covenant threshold alerts and does not add delivery, runtime-Codex, report conversion, approvals, legal or policy advice, payment behavior, new discovery families, or autonomous remediation.
F6F, F6G, and F6H remain named later slices only; F6F planning should start next only as a new Finance Plan if the user wants demo replay and stack-pack work.

Implementation validation passed on 2026-04-27 with the full requested ladder: domain monitoring/proof specs, control-plane monitoring/wiki/discovery/finance-twin/evidence/app specs, web monitoring/API specs, additive DB migration, source ingest, finance policy lookup, CFO Wiki concept/metric/policy, supported finance-discovery families, cash/collections/payables monitor smokes, cash alert-to-investigation smoke, the new policy/covenant threshold monitor smoke, twin guardrail specs, lint, typecheck, test, and `pnpm ci:repro:current`.
