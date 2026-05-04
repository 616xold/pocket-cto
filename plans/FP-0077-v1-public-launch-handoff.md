# Plan v1 public launch handoff

## Purpose / Big Picture

This is the active Finance Plan contract for the Pocket CFO F10/v1 public launch handoff planning slice.
The target phase is `F10`, and the slice is exactly `F10-v1-public-launch-handoff`.

The user-visible goal is narrow: after shipped F6A through F6Z, shipped F7 launch-readiness, shipped F8 future-scope triage, and shipped F9 read-only product UI launch polish, Pocket CFO needs one implementation-ready public launch handoff contract that a later reviewed thread can execute without widening product behavior.
F10 is not a product feature slice.
This plan is docs-and-validation only.
It must add no product runtime behavior.

Repo truth supports creating this FP-0077 contract because FP-0076 is the shipped F9 product UI launch-polish record, FP-0075 is the shipped F8/v1 future-scope triage record, FP-0074 is the shipped F7/v1 launch-readiness record, FP-0073 is the shipped F6Z final F6/v1 exit audit and handoff record, FP-0050 through FP-0073 are shipped F6 records, the shipped source-pack proof spine remains the required proof gate, shipped F6P/F6Q/F6S/F6T safety boundaries remain internal and non-provider/non-certifying/no-send, shipped monitor families remain fixed at four, shipped discovery families remain fixed at six, and no route, schema, migration, monitor evaluator, mission behavior, runtime-Codex, delivery, report, approval, certification, provider call, source mutation, finance write, external action, generated prose, or product runtime behavior is required to define this handoff.

GitHub connector work is explicitly out of scope.
Do not invoke GitHub Connector Guard for F10.

## Progress

- [x] 2026-05-04T17:50:55Z Invoked Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor; did not invoke GitHub Connector Guard.
- [x] 2026-05-04T17:50:55Z Ran preflight against fetched `origin/main`, confirmed branch `codex/f10-v1-public-launch-handoff-master-plan-local-v1`, confirmed local `HEAD` matched `origin/main`, confirmed a clean worktree before edits, confirmed GitHub auth/repo access, and confirmed Docker Postgres plus object storage were up.
- [x] 2026-05-04T17:50:55Z Read the active doc spine, shipped FP-0076/F9 record, shipped FP-0075/F8 record, shipped FP-0074/F7 record, shipped FP-0073/F6Z record, package scripts, app/web product surfaces, source-pack manifests and proof tools, and relevant source, wiki, Finance Twin, monitoring, close/control, delivery-readiness, provider-boundary, certification-boundary, human-confirmation, certification-safety, reporting, approvals, outbox, and proof-tool boundaries.
- [x] 2026-05-04T17:50:55Z Evaluated candidate directions and decided the safest next direction is this F10/v1 public launch handoff planning contract, not one narrow F9 closeout correction alone, not deeper document precision/PDF/OCR/vector-search planning, not F6V provider integration planning, not F6X actual certification planning, and not a no-new-plan hold.
- [x] 2026-05-04T17:50:55Z Created this FP-0077 v1 public launch handoff contract without adding code, UI, routes, schema, migrations, package scripts, smoke commands, eval datasets, fixtures, implementation scaffolding, provider integrations, credential scaffolding, outbox send behavior, approval workflow, report-release behavior, certification behavior, product runtime behavior, source mutation, finance writes, generated prose, or autonomous action.
- [x] 2026-05-04T18:00:28Z Refreshed only directly stale active docs and FP-0076 shipped-record wording so FP-0077 is the active F10 planning contract, FP-0076 remains the shipped F9 record, FP-0050 through FP-0073 remain shipped F6 records, FP-0074 remains shipped F7, FP-0075 remains shipped F8, and F10 implementation/F6V/F6X/deeper PDF-OCR-vector/deployment/external comms/later work remain future-plan-only.
- [x] 2026-05-04T18:06:15Z Ran the full final docs-and-plan validation ladder serially. All six source-pack proofs, all required CFO Wiki, Finance Twin, policy lookup, monitoring, close/control, delivery-readiness, operator-readiness, acknowledgement, discovery-family, web, domain, control-plane, twin-sync, lint, typecheck, test, and `pnpm ci:repro:current` commands passed with logs under `/tmp/pocket-cfo-f10-validation.20260504T180208Z.84471`.
- [ ] Start F10 implementation or public launch handoff closeout only in a later thread after this FP-0077 planning contract is reviewed and merged.

## Surprises & Discoveries

FP-0076 is fresh enough to support this F10 planning contract, but its closeout still contained narrow stale post-implementation Git/PR wording and wording that could imply FP-0077 remained absent after F9.
This slice corrected only that adjacent wording to shipped-record wording.
The correction does not reopen F9 and does not justify a separate F9 docs-only PR.

The shipped F9 UI work was read-only product-surface truthfulness only.
It changed app/web navigation, copy, links, warnings, and status-surface text, but it did not add backend code, routes, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, product runtime behavior, provider integration, delivery, approvals, report release, certification, runtime-Codex, source mutation, finance writes, monitor families, discovery families, mission behavior, generated prose, or autonomous actions.

The strongest current public-launch evidence spine is still deterministic validation, not a launch artifact.
The six direct source-pack proofs verify raw fixture immutability, normalized expected-output posture, fixed monitor/discovery family boundaries, source lineage, freshness, limitations, and absence of product-runtime side effects from source-pack proof paths.

The safety-boundary stack remains internal and review-oriented.
F6M delivery-readiness is not actual delivery.
F6P provider-boundary is not provider integration.
F6Q certification-boundary is not actual certification.
F6S human-confirmation is not send, approval, provider, outbox, report release, or certification behavior.
F6T certification-safety is not actual certification, legal/audit opinion, assurance, attestation, sign-off, or close complete.

No current evidence requires provider integration, actual certification, deeper PDF/OCR/vector search, public launch external communications, deployment work, report release, approval workflow, generated prose, source mutation, finance writes, or autonomous action before this handoff contract is reviewed.

## Decision Log

Decision: proceed with `F10-v1-public-launch-handoff`.
Rationale: shipped F6Z, F7, F8, and F9 records are present and fresh enough, active docs support a post-F9 handoff plan, and the slice can remain docs-and-validation-only without product runtime behavior.

Decision: F10 is not a product feature slice.
Rationale: this plan defines a public launch handoff contract only. It must not add routes, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, UI, monitor families, discovery families, mission behavior, runtime-Codex, delivery, provider behavior, approval workflow, report release, certification, source mutation, finance writes, generated product prose, or autonomous actions.

Decision: F10 is not provider integration.
Rationale: F6V remains future-plan-only until a later plan proves provider security, compliance posture, human confirmation, observability, retry behavior, safe failure modes, credential boundaries, provider-job boundaries, outbox boundaries, and no autonomous send.

Decision: F10 is not certification.
Rationale: F6X remains future-plan-only until a later plan proves operator need, legal boundaries, evidence boundaries, review gates, assurance constraints, non-advice constraints, and non-legal-opinion boundaries.

Decision: F10 is not deeper document precision, PDF, OCR, or vector search.
Rationale: those may be planned later only if a future plan proves a source/evidence gap and keeps provenance, freshness, limitations, no-generated-prose, no-advice, and no-autonomous-action boundaries intact.

Decision: F10 is not product UI implementation.
Rationale: F9 already shipped read-only app/web product UI launch-polish. Any later product UI work requires a future plan with exact UX scope and the same high-liability action boundaries.

Decision: F10 preserves shipped F6/F7/F8/F9.
Rationale: no F6A/F6C/F6D/F6E monitor evaluator changes, no F6B/F6G mission handoff changes, no F6H checklist changes, no F6J readiness changes, no F6K acknowledgement changes, no F6L/F6O/F6R/F6U/F6W/F6Y source-pack behavior changes, no F6M delivery-readiness changes, no F6N review-summary changes, no F6P provider-boundary changes, no F6Q certification-boundary changes, no F6S human-confirmation changes, no F6T certification-safety changes, no F6Z final audit/handoff rewrite beyond tiny stale-line polish if needed, and no broad FP-0074/FP-0075/FP-0076 rewrite belong in F10.

Decision: v1 public launch handoff outputs are plan contracts and active-doc agreement only.
Rationale: F10 may define a launch handoff checklist as a plan contract, align active docs to shipped product truth, and require direct proof/smoke commands without adding scripts. It must not create a public launch artifact, launch announcement, report artifact, board packet, lender update, certification artifact, close-complete artifact, provider setup, delivery artifact, generated launch copy, or external communication.

Decision: likely later candidate slices are named but not created here.
Rationale: possible later work includes F10 implementation/v1 public launch handoff closeout after this plan is reviewed and merged, deeper document precision/PDF/OCR/vector search if a source/evidence gap is proven, F6V actual provider integration, F6X actual certification, and public launch deployment or external communications only if a later roadmap/Finance Plan names exact scope.
Do not create FP-0078 in this slice.

## Context and Orientation

Pocket CFO has shipped F6A through F6Z, shipped F7, shipped F8, and shipped F9.
FP-0050 through FP-0073 are shipped F6 records.
FP-0073 is the shipped F6Z final F6/v1 exit audit and handoff record.
FP-0074 is the shipped F7/v1 launch-readiness and active-doc hardening record.
FP-0075 is the shipped F8/v1 future-scope triage and roadmap-hardening record.
FP-0076 is the shipped F9 product UI launch-polish foundation record.
This FP-0077 file is the active F10/v1 public launch handoff planning contract.

The shipped source-pack proof spine is:

- F6L bank/card source-pack proof: `pnpm exec tsx tools/bank-card-source-pack-proof.mjs`
- F6O receivables/payables source-pack proof: `pnpm exec tsx tools/receivables-payables-source-pack-proof.mjs`
- F6R contract/obligation source-pack proof: `pnpm exec tsx tools/contract-obligation-source-pack-proof.mjs`
- F6U ledger/reconciliation source-pack proof: `pnpm exec tsx tools/ledger-reconciliation-source-pack-proof.mjs`
- F6W policy/covenant document source-pack proof: `pnpm exec tsx tools/policy-covenant-document-source-pack-proof.mjs`
- F6Y board/lender document source-pack proof: `pnpm exec tsx tools/board-lender-document-source-pack-proof.mjs`

The shipped monitor families remain exactly:

- `cash_posture`
- `collections_pressure`
- `payables_pressure`
- `policy_covenant_threshold`

The shipped finance-discovery families remain exactly:

- `cash_posture`
- `collections_pressure`
- `payables_pressure`
- `spend_posture`
- `obligation_calendar_review`
- `policy_lookup`

F10 depends on shipped source registry, Finance Twin, CFO Wiki, monitoring, close/control, delivery-readiness, provider-boundary, certification-boundary, human-confirmation, certification-safety, reporting, approvals, evidence, outbox boundaries, source-pack proofs, and F9 read-only UI posture as validation context only.

No GitHub connector work is in scope.
No new environment variables are expected.
No runtime-Codex behavior is expected.
No route, schema, migration, package script, smoke alias, eval dataset, fixture, monitor family, discovery family, product UI implementation, mission behavior, report artifact, approval workflow, delivery behavior, provider integration, provider credential storage, provider job, outbox send, payment behavior, finance write, legal/policy advice, collection/customer-contact instruction, actual certification, close-complete status, sign-off, attestation, legal opinion, audit opinion, assurance, generated product prose, source mutation, or autonomous action belongs in F10.

## Plan of Work

First, preserve shipped F6/F7/F8/F9 truth.
Refresh only stale wording that directly misstates shipped F9 or the new active FP-0077 handoff contract.
The known FP-0076 closeout stale sentence may be replaced with shipped-record wording.

Second, define one public launch handoff contract.
The contract is this FP-0077 file only.
It narrows F10 to docs-and-validation-only public launch handoff planning and states which later candidate slices may be considered without creating them.

Third, refresh only directly adjacent active docs.
README, START_HERE, ACTIVE_DOCS, ROADMAP, local-dev, source-ingest/CFO Wiki, Codex App Server, seeded-missions, and evals may be touched only where they otherwise imply FP-0077 is absent, F10 is still merely future-only, F9 is awaiting PR review/merge, or source/CFO Wiki/runtime/eval docs imply provider, delivery, certification, report release, approval, generated prose, runtime-Codex finance actions, product-runtime eval behavior, or autonomous action.

Fourth, run the full validation ladder on the final docs-and-plan tree.
Because F10 is docs-and-validation-only, validation proves that the plan and active docs did not drift away from shipped runtime truth.

## Concrete Steps

1. Create exactly one active F10 Finance Plan:
   - `plans/FP-0077-v1-public-launch-handoff.md`

2. Apply the embedded F9 freshness correction only where needed:
   - `plans/FP-0076-product-ui-launch-polish-foundation.md`

3. Refresh active docs only where directly stale:
   - `README.md`
   - `START_HERE.md`
   - `docs/ACTIVE_DOCS.md`
   - `plans/ROADMAP.md`
   - `docs/ops/local-dev.md` only if directly stale
   - `docs/ops/source-ingest-and-cfo-wiki.md` only if directly stale
   - `docs/ops/codex-app-server.md` only if directly stale
   - `docs/benchmarks/seeded-missions.md` only if directly stale
   - `evals/README.md` only if directly stale

4. Do not edit product runtime code.
   Specifically do not add or change routes, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, source-pack manifests, proof tools, monitor evaluators, mission behavior, runtime-Codex behavior, provider integrations, credentials, provider jobs, outbox send behavior, UI, approval workflows, report-release behavior, report-circulation behavior, certification behavior, close-complete behavior, source mutation behavior, finance writes, generated product prose, or autonomous actions.

5. Record F10 handoff decisions:
   - F10 is docs-and-validation-only public launch handoff planning.
   - F10 is not provider integration.
   - F10 is not certification.
   - F10 is not deeper document precision, PDF, OCR, or vector search.
   - F10 is not product UI implementation.
   - F10 preserves shipped F6/F7/F8/F9 behavior.
   - F6V/F6X/deeper PDF-OCR-vector/deployment/external comms remain future-only.
   - No FP-0078 is created.

6. Record validation and closeout in this Progress section, Surprises & Discoveries, Decision Log, Validation and Acceptance, Artifacts and Notes, and Outcomes & Retrospective before this planning PR is ready.

## Validation and Acceptance

Run DB-backed smokes serially:

- `pnpm exec tsx tools/board-lender-document-source-pack-proof.mjs`
- `pnpm exec tsx tools/policy-covenant-document-source-pack-proof.mjs`
- `pnpm exec tsx tools/ledger-reconciliation-source-pack-proof.mjs`
- `pnpm exec tsx tools/bank-card-source-pack-proof.mjs`
- `pnpm exec tsx tools/receivables-payables-source-pack-proof.mjs`
- `pnpm exec tsx tools/contract-obligation-source-pack-proof.mjs`
- `pnpm smoke:cfo-wiki-foundation:local`
- `pnpm smoke:cfo-wiki-document-pages:local`
- `pnpm smoke:cfo-wiki-lint-export:local`
- `pnpm smoke:cfo-wiki-concept-metric-policy:local`
- `pnpm smoke:finance-twin-account-catalog:local`
- `pnpm smoke:finance-twin-general-ledger:local`
- `pnpm smoke:finance-twin:local`
- `pnpm smoke:finance-twin-reconciliation:local`
- `pnpm smoke:finance-twin-account-bridge:local`
- `pnpm smoke:finance-twin-balance-bridge-prerequisites:local`
- `pnpm smoke:finance-twin-balance-proof-lineage:local`
- `pnpm smoke:finance-twin-period-context:local`
- `pnpm smoke:finance-twin-source-backed-balance-proof:local`
- `pnpm smoke:finance-policy-lookup:local`
- `pnpm smoke:policy-covenant-threshold-monitor:local`
- `pnpm smoke:close-control-checklist:local`
- `pnpm smoke:delivery-readiness:local`
- `pnpm smoke:operator-readiness:local`
- `pnpm smoke:close-control-acknowledgement:local`
- `pnpm smoke:monitor-demo-replay:local`
- `pnpm smoke:finance-discovery-supported-families:local`
- `pnpm --filter @pocket-cto/web exec vitest run`
- `pnpm --filter @pocket-cto/web typecheck`
- `pnpm --filter @pocket-cto/domain exec vitest run src/cfo-wiki.spec.ts src/source-registry.spec.ts src/finance-twin.spec.ts src/monitoring.spec.ts src/close-control.spec.ts src/close-control-certification-safety.spec.ts src/external-delivery-human-confirmation-boundary.spec.ts src/close-control-certification-boundary.spec.ts src/external-provider-boundary.spec.ts src/close-control-review-summary.spec.ts src/delivery-readiness.spec.ts src/proof-bundle.spec.ts`
- `zsh -lc "cd apps/control-plane && pnpm exec vitest run src/modules/wiki/**/*.spec.ts src/modules/sources/**/*.spec.ts src/modules/finance-twin/**/*.spec.ts src/modules/finance-discovery/**/*.spec.ts src/modules/monitoring/**/*.spec.ts src/modules/close-control/**/*.spec.ts src/modules/close-control-certification-safety/**/*.spec.ts src/modules/external-delivery-human-confirmation-boundary/**/*.spec.ts src/modules/close-control-certification-boundary/**/*.spec.ts src/modules/external-provider-boundary/**/*.spec.ts src/modules/close-control-review-summary/**/*.spec.ts src/modules/delivery-readiness/**/*.spec.ts src/modules/missions/**/*.spec.ts src/modules/approvals/**/*.spec.ts src/modules/evidence/**/*.spec.ts src/modules/reporting/**/*.spec.ts src/app.spec.ts"`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

Acceptance requires:

- exactly one active F10 Finance Plan exists: `plans/FP-0077-v1-public-launch-handoff.md`
- no FP-0078 exists
- FP-0076 is preserved as the shipped F9 record with only tiny stale closeout wording corrected if needed
- FP-0075 is preserved as the shipped F8 future-scope triage record
- FP-0074 is preserved as the shipped F7 record
- FP-0050 through FP-0073 are preserved as shipped F6 records
- F10 remains docs-and-validation-only public launch handoff planning
- no code, UI, route, schema, migration, package script, smoke alias, eval dataset, fixture, monitor family, discovery family, mission behavior, runtime-Codex, delivery, provider, outbox, approval, report, certification, close-complete, source mutation, finance write, generated product prose, or autonomous action is added
- shipped monitor families remain exactly `cash_posture`, `collections_pressure`, `payables_pressure`, and `policy_covenant_threshold`
- shipped discovery families remain exactly `cash_posture`, `collections_pressure`, `payables_pressure`, `spend_posture`, `obligation_calendar_review`, and `policy_lookup`
- F6V provider integration, F6X actual certification, deeper PDF/OCR/vector search, public launch deployment/external comms, and later high-liability work remain future-plan-only
- shipped source-pack proofs and safety-boundary smokes/specs pass on the final tree

## Idempotence and Recovery

This slice is retry-safe because it is docs-and-validation-only.
If validation fails, do not create product behavior to make it pass.
Record the failing command, keep the log path, and recommend the smallest corrective planning or closeout slice.

If a docs edit proves too broad, revert only that docs edit and keep FP-0077 focused.
Do not delete shipped FP-0050 through FP-0076 records.
Do not delete GitHub modules, engineering-twin modules, source-pack fixtures, proof tools, reporting modules, approval modules, outbox placeholders, runtime-Codex transport code, or historical F5/F6/F7/F8/F9 records.

Replay implication for F10 is explicit absence.
Docs-only plan and active-doc edits create no mission replay events.
The validation ladder may create local proof setup state in the development database, but F10 must not add mission replay events, monitor result semantics, report artifacts, approvals, release/circulation records, delivery/outbox/provider records, certification records, generated product prose, source mutation behavior, finance writes, or autonomous-action records.

## Artifacts and Notes

Artifacts created by this slice are:

- this FP-0077 v1 public launch handoff planning contract
- tiny FP-0076 shipped-F9 closeout wording polish if still needed
- minimal active-doc freshness edits
- validation logs under `/tmp/pocket-cfo-f10-validation.20260504T180208Z.84471`
- a final human handoff that names the branch, commit, PR, changed files, validation results, gaps, and next recommendation

This slice must not create code artifacts, migration artifacts, package scripts, smoke aliases, eval datasets, fixtures, provider configuration, outbox behavior, UI screens, approval workflows, report-release behavior, certification artifacts, close-complete artifacts, generated product prose artifacts, source mutations, finance writes, public launch artifacts, public launch announcements, board packets, lender updates, diligence packets, provider setup, delivery artifacts, or autonomous actions.

## Interfaces and Dependencies

F10 depends on shipped source registry, Finance Twin, CFO Wiki, monitoring, close/control, delivery-readiness, provider-boundary, certification-boundary, human-confirmation, certification-safety, reporting, approvals, evidence, and outbox boundary posture as validation context only.

The Codex App Server remains a narrow runtime seam.
F10 must not add runtime-Codex monitoring behavior, acknowledgement drafting, review-summary drafting, source-pack drafting, provider-boundary drafting, certification-boundary drafting, certification-safety drafting, public launch drafting, notification prose, external communication prose, generated report prose, generated advice, generated launch copy, or finance-action instructions.

Internal package scope remains `@pocket-cto/*`.
No new environment variables are expected.
No GitHub connector work is expected.

## Outcomes & Retrospective

This planning slice produced one active F10/v1 public launch handoff contract, minimal active-doc freshness edits, and no product runtime behavior.
Final validation passed with logs under `/tmp/pocket-cfo-f10-validation.20260504T180208Z.84471`.
The validation ladder verified the shipped source-pack proof posture, shipped F9 read-only UI posture by web specs/typecheck, shipped safety-boundary posture, active-doc truthfulness, fixed monitor-family posture, fixed discovery-family posture, and repo-wide reproducibility.

F10 implementation must not start from this planning thread.
The next implementation step should be the F10/v1 public launch handoff closeout only after FP-0077 is reviewed and merged.
F6V provider integration, F6X actual certification, deeper PDF/OCR/vector search, public launch deployment/external communications, and later high-liability work remain future-plan-only.
