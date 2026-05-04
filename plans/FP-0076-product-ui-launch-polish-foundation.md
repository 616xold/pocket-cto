# Plan product UI launch polish foundation

## Purpose / Big Picture

This is the shipped Finance Plan record for the Pocket CFO F9 product UI launch-polish foundation slice.
The target phase is `F9`, and the slice is exactly `F9-product-ui-launch-polish-foundation`.

The user-visible goal is narrow: after shipped F6A through F6Z, shipped F7, and shipped F8 future-scope triage, Pocket CFO needs one read-only product UI launch-polish pass that makes existing app/web surfaces safer and clearer for v1.
This plan originally created the F9 implementation-ready contract; this same FP-0076 record now governs the F9 implementation slice.
The implementation may update only existing app/web read-only copy, navigation labels, documentation links, warnings, and status-surface truthfulness plus directly adjacent docs freshness.
It must add no backend runtime behavior.

Repo truth supports executing this FP-0076 contract because FP-0075 is the shipped F8/v1 future-scope triage and roadmap-hardening record, FP-0074 is the shipped F7/v1 launch-readiness and active-doc hardening record, FP-0073 is the shipped F6Z final F6/v1 exit audit and handoff record, FP-0050 through FP-0073 are shipped F6 records, the shipped source-pack proof spine remains the required proof gate, shipped F6P/F6Q/F6S/F6T safety boundaries remain internal and non-provider/non-certifying/no-send, shipped monitor families remain fixed at four, shipped discovery families remain fixed at six, and F9 UI polish is narrowed to read-only navigation, copy, links, warnings, and status-surface truth.

GitHub connector work is explicitly out of scope.
Do not invoke GitHub Connector Guard for F9.

## Progress

- [x] 2026-05-04T15:58:56Z Invoked Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor; did not invoke GitHub Connector Guard.
- [x] 2026-05-04T15:58:56Z Ran preflight against fetched `origin/main`, confirmed branch `codex/f9-product-ui-launch-polish-master-plan-local-v1`, confirmed local `HEAD` matched `origin/main`, confirmed a clean worktree before edits, confirmed GitHub auth/repo access, and confirmed Docker Postgres plus object storage were up.
- [x] 2026-05-04T15:58:56Z Read the active doc spine, shipped FP-0075/F8 record, shipped FP-0074/F7 record, shipped FP-0073/F6Z record, package scripts, app/web product surfaces, source-pack manifests and proof tools, and the source, wiki, Finance Twin, monitoring, close/control, delivery-readiness, provider-boundary, certification-boundary, human-confirmation, certification-safety, reporting, approvals, and outbox boundary modules.
- [x] 2026-05-04T15:58:56Z Evaluated candidate directions and decided the safest next direction is this F9 product UI launch-polish foundation plan, not deeper PDF/OCR/vector-search planning, F6V provider integration planning, F6X actual certification planning, v1 public launch handoff planning, or a no-new-plan hold.
- [x] 2026-05-04T15:58:56Z Created this FP-0076 product UI launch-polish foundation contract without adding code, UI, routes, schema, migrations, package scripts, smoke commands, eval datasets, fixtures, implementation scaffolding, provider integrations, credential scaffolding, outbox send behavior, approval workflow, report-release behavior, certification behavior, product runtime behavior, source mutation, finance writes, generated prose, or autonomous action.
- [x] 2026-05-04T15:58:56Z Refreshed only adjacent active docs so FP-0075 was shipped F8, FP-0076 was created as the F9 planning contract in that planning slice, and all later provider/certification/document-precision/public-launch work remained future-only.
- [x] 2026-05-04T16:09:26Z Ran the full final validation ladder serially. All six source-pack proofs, all required CFO Wiki, Finance Twin, monitoring, close/control, delivery-readiness, operator-readiness, acknowledgement, discovery-family, domain, control-plane, twin-sync, lint, typecheck, test, and `pnpm ci:repro:current` commands passed with logs under `/tmp/pocket-cfo-f9-validation.20260504T160559Z.62685`.
- [x] 2026-05-04T17:06:28Z Re-invoked Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor; did not invoke GitHub Connector Guard.
- [x] 2026-05-04T17:06:28Z Ran implementation preflight against fetched `origin/main`, confirmed branch `codex/f9-product-ui-launch-polish-foundation-local-v1`, confirmed local `HEAD` matched `origin/main`, confirmed a clean worktree before edits, confirmed GitHub auth/repo access, and confirmed Docker Postgres plus object storage were up.
- [x] 2026-05-04T17:06:28Z Re-read FP-0076, active docs, prior shipped FP-0075/F8, FP-0074/F7, FP-0073/F6Z records, package scripts, app/web surfaces, and relevant source, wiki, Finance Twin, monitoring, close/control, delivery-readiness, provider-boundary, certification-boundary, human-confirmation, certification-safety, reporting, approvals, outbox, and proof-tool boundaries.
- [x] 2026-05-04T17:06:28Z Inventoried app/web product copy and found stale F1-era source/home copy plus status-surface labels that could understate shipped source-backed proof/readiness surfaces or over-imply delivery/certification/action posture without additional read-only boundary language.
- [x] 2026-05-04T17:11:08Z Patched only read-only app/web copy, navigation, warning, and status-surface text on existing home, sources, missions, monitoring, close/control, acknowledgement-readiness, operator-readiness, and delivery-readiness surfaces plus matching web specs. Added no backend code, routes, API client methods, schema, migrations, scripts, smokes, fixtures, provider setup, credential UI, delivery/send UI, approval controls, report-release/circulation controls, certification controls, runtime-Codex controls, source-mutation controls, finance-action controls, or autonomous-action controls.
- [x] 2026-05-04T17:11:08Z Ran web validation and the full serial DB-backed validation ladder before docs closeout. `pnpm --filter @pocket-cto/web exec vitest run`, `pnpm --filter @pocket-cto/web typecheck`, all six source-pack proofs, all required CFO Wiki, Finance Twin, monitoring, close/control, delivery-readiness, operator-readiness, acknowledgement, discovery-family, domain, control-plane, twin-sync, lint, typecheck, test, and `pnpm ci:repro:current` commands passed. Logs are under `/tmp/pocket-cfo-f9-ui-validation.20260504T171108Z.3808`.
- [x] 2026-05-04T17:20:00Z Refreshed only directly adjacent stale docs so FP-0076 is the shipped F9 product UI launch-polish record, FP-0050 through FP-0073 remain shipped F6 records, FP-0074 remains shipped F7, FP-0075 remains shipped F8, no FP-0077 was created during F9, and F6V/F6X/deeper PDF-OCR-vector/v1 public launch handoff implementation/F10 implementation/later work remained future-plan-only.
- [x] 2026-05-04T17:22:46Z Ran the required post-closeout minimum validation set. `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current` passed with logs under `/tmp/pocket-cfo-f9-ui-postclose-validation.20260504T172246Z.27540`.

## Surprises & Discoveries

FP-0075 remains complete and should continue to be treated as the shipped F8 future-scope triage and roadmap-hardening record.
During implementation closeout, directly adjacent docs still described FP-0076 as an active docs-only planning contract or as future implementation scope.
This slice corrected only that adjacent freshness wording after the first validation ladder passed.

The current web app already has several older action surfaces for source ingest, mission creation, reporting approvals, report release or circulation logging, and monitor investigation handoff.
That existing product reality did not require F9 to add new action controls.
F9 implementation was limited to read-only launch-polish surfaces: navigation labels, active-doc/product truth links, status copy, warnings, and stale-copy clarification.

The F6 safety-boundary surfaces are not product action permission surfaces.
F6P is provider-boundary/readiness only, F6Q is certification-boundary/readiness only, F6S is human-confirmation/delivery-preflight only, and F6T is certification-safety/readiness only.
F9 must not make those surfaces look like provider setup, delivery, approval, release, close completion, sign-off, attestation, legal/audit opinion, or actual certification.

No current evidence required F6V provider integration, F6X actual certification, deeper PDF/OCR/vector search, v1 public launch handoff implementation, F10 implementation, or later work to start before this F9 read-only UI launch-polish record shipped.

## Decision Log

Decision: proceed with `F9-product-ui-launch-polish-foundation`.
Rationale: shipped F8, F7, and F6Z records supported one planning slice, and the implementation was narrowed to read-only product-surface hardening without new runtime behavior.

Decision: F9 is not provider integration.
Rationale: F9 must not add or plan credential setup, provider connections, provider calls, provider jobs, outbox sends, notification providers, delivery scheduling, auto-send, external send controls, or provider-boundary runtime behavior.

Decision: F9 is not certification.
Rationale: F9 must not add or plan actual certification, certified status, close-complete status, sign-off, attestation, assurance, legal opinion, audit opinion, approval workflow, report release, report circulation, or certification-boundary runtime behavior.

Decision: F9 is not generated prose or runtime-Codex.
Rationale: F9 must not add or plan UI for runtime-Codex drafting, generated notification prose, generated report prose, generated advice, generated customer-contact instructions, generated finance actions, or generic AI chat behavior.

Decision: F9 preserves shipped source/proof posture.
Rationale: F9 implementation did not change source-pack proofs, source registry behavior, Finance Twin behavior, CFO Wiki behavior, monitoring behavior, close/control behavior, delivery-readiness behavior, provider-boundary behavior, certification-boundary behavior, human-confirmation behavior, certification-safety behavior, reporting behavior, approval behavior, outbox behavior, monitor families, or discovery families.

Decision: allowed F9 implementation work is read-only product-surface hardening only.
Rationale: this implementation may clarify navigation labels, active-doc/product truth links, source-backed proof/status copy, and warning copy that delivery/provider/certification/legal/audit actions remain future-only.
It must not add new UI action controls.

Decision: execute F9 product UI launch polish in FP-0076 instead of creating FP-0077.
Rationale: the current implementation prompt explicitly authorizes the read-only F9 UI/copy/navigation/status polish under FP-0076 and forbids creating FP-0077.

Decision: F9 shipped read-only app/web product-surface truthfulness only.
Rationale: the implementation changed existing navigation, copy, warning, and status surfaces plus matching web specs, while preserving all backend runtime, evidence, source, Finance Twin, CFO Wiki, monitoring, close/control, delivery-readiness, provider-boundary, certification-boundary, human-confirmation, certification-safety, reporting, approval, outbox, source-pack, monitor-family, discovery-family, mission, and safety-boundary behavior.

Decision: likely later candidate slices are named but not created here.
Rationale: possible later work includes deeper document precision/PDF/OCR/vector search if a source/evidence gap is proven, F6V actual provider integration, F6X actual certification, v1 public launch handoff implementation, F10 implementation, and later roadmap slices.
No FP-0077 was created during F9.

## Context and Orientation

Pocket CFO has shipped F6A through F6Z, shipped F7, and shipped F8.
FP-0050 through FP-0073 are shipped F6 records.
FP-0073 is the shipped F6Z final F6/v1 exit audit and handoff record.
FP-0074 is the shipped F7/v1 launch-readiness and active-doc hardening record.
FP-0075 is the shipped F8/v1 future-scope triage and roadmap-hardening record.
This FP-0076 file is the shipped F9 product UI launch-polish foundation implementation record.

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
Refresh only stale wording that still describes FP-0076 as active before implementation after validation passes, or stale UI/docs wording that underclaims shipped F6/F7/F8 posture.

Second, implement the F9 UI launch-polish slice without widening runtime behavior.
Touch app/web only for read-only navigation, copy, link, warning, and status-surface polish.
Do not add backend code, routes, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, API client methods, UI action controls, provider setup, delivery/send, report-release/circulation controls, approval controls, certification controls, runtime-Codex drafting, generated-prose product output, source mutation controls, finance-action controls, payment controls, legal/policy advice UI, customer-contact instruction UI, or autonomous-action UI.

Third, do not start adjacent future work.
F6V provider integration, F6X actual certification, deeper document precision/PDF/OCR/vector search, and v1 public launch handoff remain future-plan-only.

Fourth, run the full validation ladder on the final UI/docs tree.
Validation proves F9 changed only read-only product-surface truthfulness and did not drift away from shipped runtime truth.

## Concrete Steps

1. Keep exactly one F9 plan/record:
   - `plans/FP-0076-product-ui-launch-polish-foundation.md`

2. Patch existing app/web surfaces only where stale or risky read-only wording is present:
   - `apps/web/app/**` for read-only page copy/navigation/status-surface polish only
   - `apps/web/components/**` for read-only copy/status-surface polish only
   - `apps/web/lib/**` only if needed to clarify stale read-only copy and without adding API methods or runtime behavior

3. Apply the embedded docs freshness correction only where needed after validation passes:
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

4. Do not edit backend product runtime code.
   Specifically do not add or change backend routes, web API routes, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, source-pack manifests, proof tools, monitor evaluators, mission behavior, runtime-Codex behavior, provider integrations, credentials, provider jobs, outbox send behavior, UI action controls, approval workflows, report-release behavior, report-circulation behavior, certification behavior, close-complete behavior, source mutation behavior, finance writes, generated product prose, or autonomous actions.

5. Record F9 implementation decisions:
   - F9 is read-only UI/copy/navigation/status-surface launch polish in this thread.
   - F9 is not provider integration.
   - F9 is not certification.
   - F9 is not generated prose or runtime-Codex.
   - F9 implementation is read-only product-surface hardening only.
   - F6V/F6X/deeper PDF-OCR-vector/v1 public launch handoff implementation remain future-only.
   - No FP-0077 is created during F9.

6. Record validation and closeout in this Progress section, Surprises & Discoveries, Decision Log, Validation and Acceptance, Artifacts and Notes, and Outcomes & Retrospective.

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

- exactly one F9 Finance Plan exists: `plans/FP-0076-product-ui-launch-polish-foundation.md`
- no FP-0077 was created during F9
- FP-0075 is preserved as the shipped F8 future-scope triage record
- FP-0074 is preserved as the shipped F7 record
- FP-0050 through FP-0073 are preserved as shipped F6 records
- F9 remains read-only product UI launch-polish only in this thread
- F9 implementation is narrowed to read-only navigation/copy/link/warning/status-surface hardening only
- no backend code, backend route, web API route, schema, migration, package script, smoke alias, eval dataset, fixture, provider integration, credential scaffold, outbox send behavior, approval workflow, report-release behavior, certification behavior, product runtime behavior, source mutation, finance write, generated prose, monitor family, discovery family, or autonomous action is added
- F6V provider integration, F6X actual certification, deeper PDF/OCR/vector search, and v1 public launch handoff implementation remain future-plan-only during F9
- shipped source-pack proofs and safety-boundary smokes/specs pass on the final tree

Implementation validation passed before docs closeout with logs under `/tmp/pocket-cfo-f9-ui-validation.20260504T171108Z.3808`.
Post-closeout minimum validation passed with logs under `/tmp/pocket-cfo-f9-ui-postclose-validation.20260504T172246Z.27540`.

## Idempotence and Recovery

This slice is retry-safe because it is read-only UI/docs polish only.
If validation fails, do not create product behavior to make it pass.
Record the failing command, keep the log path, and recommend the smallest corrective closeout slice.

If a docs edit proves too broad, revert only that docs edit and keep FP-0076 focused.
Do not delete shipped FP-0050 through FP-0075 records.
Do not delete GitHub modules, engineering-twin modules, source-pack fixtures, proof tools, reporting modules, approval modules, outbox placeholders, runtime-Codex transport code, or historical F5/F6/F7/F8 records.

Replay implication for F9 is explicit absence.
Read-only UI copy and docs edits create no mission replay events.
The validation ladder may create local proof setup state in the development database, but F9 must not add mission replay events, monitor result semantics, report artifacts, approvals, release/circulation records, delivery/outbox/provider records, certification records, generated product prose, source mutation behavior, finance writes, or autonomous-action records.

## Artifacts and Notes

Expected artifacts are:

- this FP-0076 product UI launch-polish foundation implementation record
- read-only app/web copy/navigation/status-surface truthfulness edits
- minimal active-doc freshness edits
- validation logs
- a final human handoff that names the branch, commit, PR, changed files, validation results, gaps, and next recommendation

This slice must not create backend code artifacts, migration artifacts, package scripts, smoke aliases, eval datasets, fixtures, provider configuration, outbox behavior, new UI screens, approval workflows, report-release behavior, certification artifacts, close-complete artifacts, generated product prose artifacts, source mutations, finance writes, or autonomous actions.

## Interfaces and Dependencies

F9 depends on shipped source registry, Finance Twin, CFO Wiki, monitoring, close/control, delivery-readiness, provider-boundary, certification-boundary, human-confirmation, certification-safety, reporting, approvals, evidence, and outbox boundary posture as validation context only.

The Codex App Server remains a narrow runtime seam.
F9 must not add runtime-Codex monitoring behavior, acknowledgement drafting, review-summary drafting, source-pack drafting, provider-boundary drafting, certification-boundary drafting, certification-safety drafting, product UI drafting, notification prose, external communication prose, generated report prose, generated advice, or finance-action instructions.

Internal package scope remains `@pocket-cto/*`.
No new environment variables are expected.
No GitHub connector work is expected.

## Outcomes & Retrospective

This slice produced one shipped F9 product UI launch-polish foundation record, read-only app/web product-surface truthfulness edits, matching web spec updates, and minimal adjacent active-doc freshness edits.
Implementation validation before docs closeout passed with logs under `/tmp/pocket-cfo-f9-ui-validation.20260504T171108Z.3808`.
Post-closeout minimum validation passed with logs under `/tmp/pocket-cfo-f9-ui-postclose-validation.20260504T172246Z.27540`.

No backend code, backend route, web API route, schema, migration, package script, smoke alias, eval dataset, fixture, implementation scaffold outside read-only UI copy/navigation/status polish, provider integration, credential scaffold, outbox send behavior, delivery behavior, approval workflow, report-release behavior, report-circulation behavior, certification behavior, close-complete behavior, product runtime behavior, source mutation, finance write, generated product prose, monitor family, discovery family, mission behavior, or autonomous action was added.
No FP-0077 was created during F9.

F9 shipped as read-only app/web product UI launch-polish; PR review/merge is complete in the shipped record.
FP-0077 now exists as the later F10/v1 public launch handoff planning contract, while F6V provider integration, F6X actual certification, deeper PDF/OCR/vector search, implementation, deployment/external comms, and later work remain future-plan-only until a later reviewed plan names exact scope.
