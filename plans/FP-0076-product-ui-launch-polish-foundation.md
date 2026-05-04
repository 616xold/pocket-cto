# Plan product UI launch polish foundation

## Purpose / Big Picture

This is the active Finance Plan for the Pocket CFO F9 product UI launch-polish foundation slice.
The target phase is `F9`, and the slice is exactly `F9-product-ui-launch-polish-foundation`.

The user-visible goal is narrow: after shipped F6A through F6Z, shipped F7, and shipped F8 future-scope triage, Pocket CFO needs one implementation-ready contract for a later product UI launch-polish pass.
This plan does not implement product UI changes.
It is docs-and-validation only.
It must add no product runtime behavior.

Repo truth supports creating this FP-0076 contract because FP-0075 is the shipped F8/v1 future-scope triage and roadmap-hardening record, FP-0074 is the shipped F7/v1 launch-readiness and active-doc hardening record, FP-0073 is the shipped F6Z final F6/v1 exit audit and handoff record, FP-0050 through FP-0073 are shipped F6 records, the shipped source-pack proof spine remains the required proof gate, shipped F6P/F6Q/F6S/F6T safety boundaries remain internal and non-provider/non-certifying/no-send, shipped monitor families remain fixed at four, shipped discovery families remain fixed at six, and future UI polish can be narrowed to read-only navigation, copy, links, warnings, and status-surface truth.

GitHub connector work is explicitly out of scope.
Do not invoke GitHub Connector Guard for F9.

## Progress

- [x] 2026-05-04T15:58:56Z Invoked Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor; did not invoke GitHub Connector Guard.
- [x] 2026-05-04T15:58:56Z Ran preflight against fetched `origin/main`, confirmed branch `codex/f9-product-ui-launch-polish-master-plan-local-v1`, confirmed local `HEAD` matched `origin/main`, confirmed a clean worktree before edits, confirmed GitHub auth/repo access, and confirmed Docker Postgres plus object storage were up.
- [x] 2026-05-04T15:58:56Z Read the active doc spine, shipped FP-0075/F8 record, shipped FP-0074/F7 record, shipped FP-0073/F6Z record, package scripts, app/web product surfaces, source-pack manifests and proof tools, and the source, wiki, Finance Twin, monitoring, close/control, delivery-readiness, provider-boundary, certification-boundary, human-confirmation, certification-safety, reporting, approvals, and outbox boundary modules.
- [x] 2026-05-04T15:58:56Z Evaluated candidate directions and decided the safest next direction is this F9 product UI launch-polish foundation plan, not deeper PDF/OCR/vector-search planning, F6V provider integration planning, F6X actual certification planning, v1 public launch handoff planning, or a no-new-plan hold.
- [x] 2026-05-04T15:58:56Z Created this FP-0076 product UI launch-polish foundation contract without adding code, UI, routes, schema, migrations, package scripts, smoke commands, eval datasets, fixtures, implementation scaffolding, provider integrations, credential scaffolding, outbox send behavior, approval workflow, report-release behavior, certification behavior, product runtime behavior, source mutation, finance writes, generated prose, or autonomous action.
- [x] 2026-05-04T15:58:56Z Refreshed only adjacent active docs so FP-0075 is shipped F8, FP-0076 is the active F9 planning contract created by this slice, and all later provider/certification/document-precision/public-launch work remains future-only.
- [x] 2026-05-04T16:09:26Z Ran the full final validation ladder serially. All six source-pack proofs, all required CFO Wiki, Finance Twin, monitoring, close/control, delivery-readiness, operator-readiness, acknowledgement, discovery-family, domain, control-plane, twin-sync, lint, typecheck, test, and `pnpm ci:repro:current` commands passed with logs under `/tmp/pocket-cfo-f9-validation.20260504T160559Z.62685`.

## Surprises & Discoveries

FP-0075 is complete and should now be treated as the shipped F8 future-scope triage and roadmap-hardening record.
Some active docs still described FP-0075 as active F8 or said no FP-0076 existed without qualifying that statement as pre-F9; this slice must correct only that adjacent freshness wording.

The current web app already has several older action surfaces for source ingest, mission creation, reporting approvals, report release or circulation logging, and monitor investigation handoff.
That existing product reality does not require F9 to add new action controls.
Future F9 implementation must be limited to read-only launch-polish surfaces: navigation labels, active-doc/product truth links, status copy, warnings, and stale-copy clarification.

The F6 safety-boundary surfaces are not product action permission surfaces.
F6P is provider-boundary/readiness only, F6Q is certification-boundary/readiness only, F6S is human-confirmation/delivery-preflight only, and F6T is certification-safety/readiness only.
F9 must not make those surfaces look like provider setup, delivery, approval, release, close completion, sign-off, attestation, legal/audit opinion, or actual certification.

No current evidence requires F6V provider integration, F6X actual certification, deeper PDF/OCR/vector search, or v1 public launch handoff to start before a read-only UI launch-polish implementation contract exists.

## Decision Log

Decision: proceed with `F9-product-ui-launch-polish-foundation`.
Rationale: shipped F8, F7, and F6Z records support one docs-and-validation-only planning slice, and the future implementation can be narrowed to read-only product-surface hardening without new runtime behavior.

Decision: F9 is not provider integration.
Rationale: F9 must not add or plan credential setup, provider connections, provider calls, provider jobs, outbox sends, notification providers, delivery scheduling, auto-send, external send controls, or provider-boundary runtime behavior.

Decision: F9 is not certification.
Rationale: F9 must not add or plan actual certification, certified status, close-complete status, sign-off, attestation, assurance, legal opinion, audit opinion, approval workflow, report release, report circulation, or certification-boundary runtime behavior.

Decision: F9 is not generated prose or runtime-Codex.
Rationale: F9 must not add or plan UI for runtime-Codex drafting, generated notification prose, generated report prose, generated advice, generated customer-contact instructions, generated finance actions, or generic AI chat behavior.

Decision: F9 preserves shipped source/proof posture.
Rationale: future implementation must not change source-pack proofs, source registry behavior, Finance Twin behavior, CFO Wiki behavior, monitoring behavior, close/control behavior, delivery-readiness behavior, provider-boundary behavior, certification-boundary behavior, human-confirmation behavior, certification-safety behavior, reporting behavior, approval behavior, outbox behavior, monitor families, or discovery families.

Decision: allowed future UI work is read-only product-surface hardening only.
Rationale: likely safe future implementation may clarify navigation labels, active-doc/product truth links, source-backed proof/status copy, and warning copy that delivery/provider/certification/legal/audit actions remain future-only.
It must not add new UI action controls.

Decision: likely later candidate slices are named but not created here.
Rationale: possible later work includes F9 implementation/product UI launch polish after FP-0076 is reviewed and merged, deeper document precision/PDF/OCR/vector search if a source/evidence gap is proven, F6V actual provider integration, F6X actual certification, and v1 public launch handoff.
Do not create FP-0077 in this slice.

## Context and Orientation

Pocket CFO has shipped F6A through F6Z, shipped F7, and shipped F8.
FP-0050 through FP-0073 are shipped F6 records.
FP-0073 is the shipped F6Z final F6/v1 exit audit and handoff record.
FP-0074 is the shipped F7/v1 launch-readiness and active-doc hardening record.
FP-0075 is the shipped F8/v1 future-scope triage and roadmap-hardening record.
This FP-0076 file is the active F9 product UI launch-polish foundation contract.

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

The app/web product surface currently includes operator home, source inventory/detail, mission list/detail, monitoring, close/control checklist, acknowledgement readiness, operator readiness, and delivery readiness pages.
Several current pages expose existing source, mission, reporting, approval, and monitor-investigation actions from shipped earlier slices.
F9 implementation must not add new action controls and must not treat existing status/readiness pages as permission to deliver, certify, approve, release, call providers, mutate sources, write finance state, or invoke runtime-Codex.

No GitHub connector work is in scope.
No new environment variables are expected.
No route, schema, migration, package script, smoke alias, eval dataset, fixture, monitor family, discovery family, product runtime behavior, provider integration, provider credential storage, provider job, outbox send, delivery behavior, approval workflow, report creation, report release, report circulation, payment behavior, accounting write, bank write, tax filing, legal/policy advice, collection/customer-contact instruction, actual certification, close-complete status, sign-off, attestation, legal opinion, audit opinion, assurance, generated prose, source mutation, runtime-Codex, or autonomous action belongs in F9.

## Plan of Work

First, preserve shipped F8/F7/F6 truth.
Refresh only the stale wording that still describes FP-0075 as active or says no FP-0076 exists without naming that as the pre-F9 state.

Second, keep this FP-0076 contract implementation-ready but non-implementing.
The future F9 implementation may touch app/web only after this plan is reviewed and merged, and only for read-only navigation, copy, link, warning, and status-surface polish.

Third, do not start adjacent future work.
F6V provider integration, F6X actual certification, deeper document precision/PDF/OCR/vector search, and v1 public launch handoff remain future-plan-only.

Fourth, run the full validation ladder on the final docs-and-plan tree.
Because F9 foundation is docs-and-validation-only, validation proves the contract and active docs did not drift away from shipped runtime truth.

## Concrete Steps

1. Create exactly one new active plan:
   - `plans/FP-0076-product-ui-launch-polish-foundation.md`

2. Apply the embedded F8 freshness correction only where needed:
   - `plans/FP-0075-v1-future-scope-triage-and-roadmap-hardening.md`
   - `README.md`
   - `START_HERE.md`
   - `docs/ACTIVE_DOCS.md`
   - `plans/ROADMAP.md`
   - `docs/ops/local-dev.md` only if directly stale
   - `docs/ops/source-ingest-and-cfo-wiki.md` only if directly stale
   - `docs/ops/codex-app-server.md` only if directly stale
   - `docs/benchmarks/seeded-missions.md` only if directly stale
   - `evals/README.md` only if directly stale

3. Do not edit product runtime code.
   Specifically do not add or change routes, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, source-pack manifests, proof tools, monitor evaluators, mission behavior, runtime-Codex behavior, provider integrations, credentials, provider jobs, outbox send behavior, UI action controls, approval workflows, report-release behavior, report-circulation behavior, certification behavior, close-complete behavior, source mutation behavior, finance writes, generated product prose, or autonomous actions.

4. Record F9 planning decisions:
   - F9 is docs-and-validation-only in this thread.
   - F9 is not provider integration.
   - F9 is not certification.
   - F9 is not generated prose or runtime-Codex.
   - F9 implementation, if later approved, is read-only product-surface hardening only.
   - F6V/F6X/deeper PDF-OCR-vector/v1 public launch handoff remain future-only.
   - No FP-0077 is created.

5. Record validation and closeout in this Progress section, Surprises & Discoveries, Decision Log, Validation and Acceptance, Artifacts and Notes, and Outcomes & Retrospective.

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
- `pnpm --filter @pocket-cto/domain exec vitest run src/cfo-wiki.spec.ts src/source-registry.spec.ts src/finance-twin.spec.ts src/monitoring.spec.ts src/close-control.spec.ts src/close-control-certification-safety.spec.ts src/external-delivery-human-confirmation-boundary.spec.ts src/close-control-certification-boundary.spec.ts src/external-provider-boundary.spec.ts src/close-control-review-summary.spec.ts src/delivery-readiness.spec.ts src/proof-bundle.spec.ts`
- `zsh -lc "cd apps/control-plane && pnpm exec vitest run src/modules/wiki/**/*.spec.ts src/modules/sources/**/*.spec.ts src/modules/finance-twin/**/*.spec.ts src/modules/finance-discovery/**/*.spec.ts src/modules/monitoring/**/*.spec.ts src/modules/close-control/**/*.spec.ts src/modules/close-control-certification-safety/**/*.spec.ts src/modules/external-delivery-human-confirmation-boundary/**/*.spec.ts src/modules/close-control-certification-boundary/**/*.spec.ts src/modules/external-provider-boundary/**/*.spec.ts src/modules/close-control-review-summary/**/*.spec.ts src/modules/delivery-readiness/**/*.spec.ts src/modules/missions/**/*.spec.ts src/modules/approvals/**/*.spec.ts src/modules/evidence/**/*.spec.ts src/modules/reporting/**/*.spec.ts src/app.spec.ts"`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

Acceptance requires:

- exactly one new active F9 Finance Plan exists: `plans/FP-0076-product-ui-launch-polish-foundation.md`
- no FP-0077 exists
- FP-0075 is preserved as the shipped F8 future-scope triage record
- FP-0074 is preserved as the shipped F7 record
- FP-0050 through FP-0073 are preserved as shipped F6 records
- F9 remains docs-and-validation-only in this thread
- future F9 implementation is narrowed to read-only navigation/copy/link/warning/status-surface hardening only
- no code, UI, route, schema, migration, package script, smoke alias, eval dataset, fixture, provider integration, credential scaffold, outbox send behavior, approval workflow, report-release behavior, certification behavior, product runtime behavior, source mutation, finance write, generated prose, monitor family, discovery family, or autonomous action is added
- F6V provider integration, F6X actual certification, deeper PDF/OCR/vector search, and v1 public launch handoff remain future-plan-only
- shipped source-pack proofs and safety-boundary smokes/specs pass on the final tree

## Idempotence and Recovery

This slice is retry-safe because it is docs-and-validation-only.
If validation fails, do not create product behavior to make it pass.
Record the failing command, keep the log path, and recommend the smallest corrective closeout slice.

If a docs edit proves too broad, revert only that docs edit and keep FP-0076 focused.
Do not delete shipped FP-0050 through FP-0075 records.
Do not delete GitHub modules, engineering-twin modules, source-pack fixtures, proof tools, reporting modules, approval modules, outbox placeholders, runtime-Codex transport code, or historical F5/F6/F7/F8 records.

Replay implication for F9 is explicit absence.
The validation ladder may create local proof setup state in the development database, but F9 must not add mission replay events, monitor result semantics, report artifacts, approvals, release/circulation records, delivery/outbox/provider records, certification records, generated product prose, source mutation behavior, finance writes, or autonomous-action records.

## Artifacts and Notes

Expected artifacts are:

- this active FP-0076 product UI launch-polish foundation contract
- minimal active-doc freshness edits
- validation logs
- a final human handoff that names the branch, commit, PR, changed files, validation results, gaps, and next recommendation

This slice must not create code artifacts, migration artifacts, package scripts, smoke aliases, eval datasets, fixtures, provider configuration, outbox behavior, UI screens, approval workflows, report-release behavior, certification artifacts, close-complete artifacts, generated product prose artifacts, source mutations, finance writes, or autonomous actions.

## Interfaces and Dependencies

F9 depends on shipped source registry, Finance Twin, CFO Wiki, monitoring, close/control, delivery-readiness, provider-boundary, certification-boundary, human-confirmation, certification-safety, reporting, approvals, evidence, and outbox boundary posture as validation context only.

The Codex App Server remains a narrow runtime seam.
F9 must not add runtime-Codex monitoring behavior, acknowledgement drafting, review-summary drafting, source-pack drafting, provider-boundary drafting, certification-boundary drafting, certification-safety drafting, product UI drafting, notification prose, external communication prose, generated report prose, generated advice, or finance-action instructions.

Internal package scope remains `@pocket-cto/*`.
No new environment variables are expected.
No GitHub connector work is expected.

## Outcomes & Retrospective

This slice produced one active F9 product UI launch-polish foundation contract and minimal adjacent active-doc freshness edits only.
Final validation passed with logs under `/tmp/pocket-cfo-f9-validation.20260504T160559Z.62685`.

No code, route, schema, migration, package script, smoke alias, eval dataset, fixture, implementation scaffold, provider integration, credential scaffold, outbox send behavior, UI, approval workflow, report-release behavior, certification behavior, product runtime behavior, source mutation, finance write, generated product prose, or autonomous action should be added.
No FP-0077 should be created.

F9 implementation should start next only after this FP-0076 contract is reviewed and merged.
F6V provider integration, F6X actual certification, deeper PDF/OCR/vector search, and v1 public launch handoff remain future-plan-only.
