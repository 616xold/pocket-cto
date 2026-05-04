# Plan v1 future-scope triage and roadmap hardening

## Purpose / Big Picture

This is the shipped Finance Plan record for the Pocket CFO F8/v1 future-scope triage and roadmap-hardening slice.
The target phase is `F8`, and the slice is exactly `F8-v1-future-scope-triage-and-roadmap-hardening`.

The user-visible goal is narrow: after shipped F6A through F6Z and shipped F7, Pocket CFO needs one implementation-ready future-scope decision contract that says what may be planned next and what must stay blocked.
F8 is not a product feature slice.
It is docs-and-validation only.
It must add no product runtime behavior.

Repo truth supports creating this FP-0075 contract because FP-0074 is the shipped F7/v1 launch-readiness and active-doc hardening record, FP-0073 is the shipped F6Z final F6/v1 exit audit and handoff record, all six shipped source-pack proofs passed in the current F8 readiness gate, shipped F6T/F6S/F6P/F6Q safety-boundary posture passed and remains non-certifying/non-provider/no-send, shipped close/control surfaces passed, shipped monitor families remain exactly four, shipped discovery families remain exactly six, and F6V provider integration plus F6X actual certification can remain future-plan-only.

GitHub connector work is explicitly out of scope.
Do not invoke GitHub Connector Guard for F8.

## Progress

- [x] 2026-05-04T15:20:28Z Invoked Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor; did not invoke GitHub Connector Guard.
- [x] 2026-05-04T15:20:28Z Ran preflight against fetched `origin/main`, confirmed branch `codex/f8-v1-future-scope-triage-and-roadmap-hardening-local-v1`, confirmed local `HEAD` matched `origin/main`, confirmed a clean worktree before edits, confirmed GitHub auth/repo access, and confirmed Docker Postgres plus object storage were up.
- [x] 2026-05-04T15:20:28Z Read the active doc spine, shipped FP-0074 F7 record, shipped FP-0073 F6Z record, shipped FP-0072/F6Y, FP-0071/F6W, and FP-0070/F6T records, package scripts, source-pack manifests and proof tools, and the source, wiki, Finance Twin, monitoring, close/control, safety-boundary, reporting, approval, outbox, and runtime-Codex boundary docs/code.
- [x] 2026-05-04T15:20:28Z Ran the pre-plan F8 readiness gate. All six source-pack proofs passed; policy/covenant monitor, close/control checklist, delivery-readiness, operator-readiness, close/control acknowledgement, monitor demo replay, supported discovery families, focused domain safety specs, and focused control-plane safety specs passed with logs under `/tmp/pocket-cfo-f8-readiness.09awIk`.
- [x] 2026-05-04T15:20:28Z Evaluated candidate directions and decided the safest next direction is F8/v1 future-scope triage and roadmap hardening, not product UI launch polish planning, deeper PDF/OCR/vector-search planning, F6V provider integration planning, F6X actual certification planning, or a no-new-plan hold.
- [x] 2026-05-04T15:20:28Z Created this FP-0075 future-scope decision contract without adding code, routes, schema, migrations, package scripts, smoke commands, eval datasets, fixtures, implementation scaffolding, provider integrations, credential scaffolding, outbox send behavior, UI, approval workflow, report-release behavior, certification behavior, or product runtime behavior.
- [x] 2026-05-04T15:34:42Z Refreshed only directly adjacent active docs so README, START_HERE, ACTIVE_DOCS, ROADMAP, local-dev, source-ingest/CFO Wiki, Codex App Server, seeded-missions, evals, and one tiny FP-0074 handoff clarification agreed that FP-0075 was the then-active F8 future-scope triage contract while F8 implementation, F6V, F6X, UI launch polish, PDF/OCR/vector-search work, provider work, certification, delivery, report release, approvals, runtime-Codex, source mutation, finance writes, and autonomous action remained blocked.
- [x] 2026-05-04T15:34:42Z Ran the full final validation ladder serially. All six source-pack proofs, all required CFO Wiki, Finance Twin, monitoring, close/control, delivery-readiness, operator-readiness, acknowledgement, discovery-family, domain, control-plane, twin-sync, lint, typecheck, test, and `pnpm ci:repro:current` commands passed with logs under `/tmp/pocket-cfo-f8-final-validation.qeNtQA`.
- [x] 2026-05-04T15:58:56Z Applied a tiny F9-adjacent freshness correction so this record is described as shipped F8; FP-0076 did not exist during F8 and may now exist only as the later F9 product UI launch-polish foundation plan.

## Surprises & Discoveries

The shipped F7 record is fresh enough to support this future-scope triage contract.
It correctly says FP-0074 is shipped, F7 added no product runtime behavior, and no FP-0075 was created during F7.
This FP-0075 file is the later future-plan candidate that F7 deferred to; it does not rewrite F7 or start implementation.

The current strongest proof posture remains the six direct source-pack proofs.
They verify raw fixture immutability, normalized expected-output posture, fixed monitor/discovery family boundaries, and absence of product-runtime side effects from source-pack proof paths.

The safety-boundary stack remains internal and review-oriented.
F6P is provider-boundary/readiness only, F6Q is certification-boundary/readiness only, F6S is human-confirmation/delivery-preflight only, and F6T is certification-safety/readiness only.
None of those shipped surfaces is actual provider integration, delivery, outbox send, approval, report release, certification, close complete, sign-off, attestation, legal/audit opinion, assurance, runtime-Codex behavior, source mutation, finance write, or autonomous action.

No current evidence requires UI polish, document-precision work, provider setup, or actual certification to start before roadmap hardening.
Those candidate directions remain future-only until a later plan proves exact scope and boundaries.

The only stale doc language found during closeout was historical F7 wording that said no FP-0075 existed without qualifying that as true during F7.
The correction was intentionally narrow and did not rewrite FP-0074 beyond the handoff clarification needed now that FP-0075 exists.

## Decision Log

Decision: proceed with `F8-v1-future-scope-triage-and-roadmap-hardening`.
Rationale: the current readiness gate passed, active docs support a post-F7 future-scope decision, and the slice can remain docs-and-validation-only without product runtime behavior.

Decision: F8 is not a product feature slice.
Rationale: this plan must harden future-scope truth only. It must not add routes, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, UI, mission behavior, monitor families, discovery families, runtime-Codex, delivery, provider behavior, approval workflow, report release, certification, source mutation, finance writes, generated product prose, or autonomous actions.

Decision: F8 does not implement F6V provider integration.
Rationale: F6V remains future-plan-only until a later plan proves provider security, compliance posture, human confirmation, observability, retry behavior, safe failure modes, credential boundaries, provider-job boundaries, outbox boundaries, and no autonomous send.

Decision: F8 does not implement F6X actual certification.
Rationale: F6X remains future-plan-only until a later plan proves operator need, legal boundaries, evidence boundaries, review gates, assurance constraints, non-advice constraints, and non-legal-opinion boundaries.

Decision: F8 does not implement product UI launch polish.
Rationale: product UI launch polish may be planned later only if a future plan names exact UX scope and avoids provider, certification, delivery, approval, report-release, legal/audit, generated-prose, finance-action, and autonomous-action behavior.

Decision: F8 does not implement deeper document precision, PDF, OCR, or vector search.
Rationale: those may be planned later only if a future plan proves a source/evidence gap and keeps provenance, freshness, limitations, and no-generated-prose boundaries intact.

Decision: F8 preserves shipped F6 and F7.
Rationale: no F6A/F6C/F6D/F6E monitor evaluator changes, no F6B/F6G mission handoff changes, no F6H checklist changes, no F6J readiness changes, no F6K acknowledgement changes, no F6L/F6O/F6R/F6U/F6W/F6Y source-pack behavior changes, no F6M delivery-readiness changes, no F6N review-summary changes, no F6P provider-boundary changes, no F6Q certification-boundary changes, no F6S human-confirmation changes, no F6T certification-safety changes, no F6Z final audit rewrite, and no broad FP-0074 rewrite belong in F8.

Decision: likely future candidate slices are named but not created here.
Rationale: possible later work includes F6V actual provider integration, F6X actual certification, F9 product UI launch polish if roadmap-approved, F9 document precision/PDF/OCR/vector search if a source/evidence gap is proven, and v1 public launch handoff if a future roadmap/Finance Plan names concrete scope.
Do not create FP-0076 in this slice.

Decision: qualify historical F7 "no FP-0075" statements as "during F7".
Rationale: FP-0074 remains the shipped F7 record and did not create FP-0075, but this F8 slice does create FP-0075; active docs should not imply both current states at once.

## Context and Orientation

Pocket CFO has shipped F6A through F6Z and shipped F7.
FP-0050 through FP-0073 are shipped F6 records.
FP-0073 is the shipped F6Z final F6/v1 exit audit and handoff record.
FP-0074 is the shipped F7/v1 launch-readiness and active-doc hardening record.
This FP-0075 file is the shipped F8 future-scope triage and roadmap-hardening record.

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

No GitHub connector work is in scope.
No new environment variables are expected.
No runtime-Codex behavior is expected.
No route, schema, migration, package script, smoke alias, eval dataset, fixture, monitor family, discovery family, report artifact, approval workflow, delivery behavior, provider integration, provider credential storage, provider job, outbox send, payment behavior, finance write, legal/policy advice, collection/customer-contact instruction, actual certification, close-complete status, sign-off, attestation, legal opinion, audit opinion, assurance, generated product prose, source mutation, or autonomous action belongs in F8.

## Plan of Work

First, preserve the shipped F6/F7 truth.
Use current repo truth and the pre-plan readiness gate to confirm FP-0074 is shipped, FP-0073 is shipped, the source-pack proof spine remains green, safety-boundary posture remains green, and the fixed monitor/discovery families have not widened.

Second, create one future-scope decision contract.
The contract is this FP-0075 file only.
It narrows F8 to docs-and-validation-only roadmap hardening and states which later candidate slices may be considered without creating them.

Third, refresh only directly adjacent active docs.
Allowed docs are README.md, START_HERE.md, docs/ACTIVE_DOCS.md, plans/ROADMAP.md, docs/ops/local-dev.md, docs/ops/source-ingest-and-cfo-wiki.md, docs/ops/codex-app-server.md, docs/benchmarks/seeded-missions.md, evals/README.md, and one tiny FP-0074 handoff clarification if needed.
Docs should say FP-0075 is the shipped F8 future-scope triage record while F8 implementation, F6V provider integration, F6X actual certification, product UI launch polish, PDF/OCR/vector search, public launch handoff, and later high-liability work did not start here.

Fourth, run the full validation ladder on the final docs-and-plan tree.
Because F8 is docs-and-validation-only, validation proves that the plan and active docs did not drift away from shipped runtime truth.

## Concrete Steps

1. Keep the new active plan as exactly:
   - `plans/FP-0075-v1-future-scope-triage-and-roadmap-hardening.md`

2. Refresh active docs only where they directly misstate current future-scope truth:
   - `README.md`
   - `START_HERE.md`
   - `docs/ACTIVE_DOCS.md`
   - `plans/ROADMAP.md`
   - `docs/ops/local-dev.md` only if directly stale
   - `docs/ops/source-ingest-and-cfo-wiki.md` only if directly stale
   - `docs/ops/codex-app-server.md` only if directly stale
   - `docs/benchmarks/seeded-missions.md` only if directly stale
   - `evals/README.md` only if directly stale
   - `plans/FP-0074-v1-launch-readiness-and-active-doc-hardening.md` only for a tiny handoff clarification if needed

3. Do not edit product runtime code.
   Specifically do not add or change routes, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, source-pack manifests, proof tools, monitor evaluators, mission behavior, runtime-Codex behavior, provider integrations, credentials, provider jobs, outbox send behavior, UI, approval workflows, report-release behavior, report-circulation behavior, certification behavior, close-complete behavior, source mutation behavior, finance writes, generated product prose, or autonomous actions.

4. Record future-scope decisions:
   - F8 is docs-and-validation-only roadmap/future-scope planning.
   - F6V provider integration remains future-plan-only.
   - F6X actual certification remains future-plan-only.
   - Product UI launch polish remains future-only.
   - Deeper document precision/PDF/OCR/vector search remains future-only.
   - F9 candidate labels may be named but not created.
   - No FP-0076 is created during F8.

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

- exactly one shipped F8 Finance Plan record exists: `plans/FP-0075-v1-future-scope-triage-and-roadmap-hardening.md`
- no FP-0076 was created during F8
- F8 remains narrowed to docs-and-validation-only future-scope triage and roadmap hardening
- no code, route, schema, migration, package script, smoke alias, eval dataset, fixture, UI, monitor family, discovery family, mission behavior, runtime-Codex, delivery, provider, outbox, approval, report, certification, close-complete, source mutation, finance write, generated product prose, or autonomous action is added
- active docs agree that FP-0050 through FP-0073 are shipped F6 records, FP-0074 is shipped F7, and FP-0075 is shipped F8 future-scope triage
- F6V provider integration and F6X actual certification remain future-plan-only
- shipped source-pack proofs and safety-boundary smokes/specs pass on the final tree

## Idempotence and Recovery

This slice is retry-safe because it is docs-and-validation-only.
If validation fails, do not create product behavior to make it pass.
Record the failing command, keep the log path, and recommend the smallest corrective closeout slice.

If a docs edit proves too broad, revert only that docs edit and keep FP-0075 focused.
Do not delete shipped FP-0050 through FP-0074 records.
Do not delete GitHub modules, engineering-twin modules, source-pack fixtures, proof tools, reporting modules, approval modules, outbox placeholders, runtime-Codex transport code, or historical F5/F6/F7 records.

Replay implication for F8 is explicit absence.
The validation ladder may create local proof setup state in the development database, but F8 must not add mission replay events, monitor result semantics, report artifacts, approvals, release/circulation records, delivery/outbox/provider records, certification records, generated product prose, source mutation behavior, finance writes, or autonomous-action records.

## Artifacts and Notes

Expected artifacts are:

- this shipped FP-0075 future-scope triage record
- minimal active-doc freshness edits
- validation logs
- a final human handoff that names the branch, commit, PR, changed files, validation results, gaps, and next recommendation

This slice must not create code artifacts, migration artifacts, package scripts, smoke aliases, eval datasets, fixtures, provider configuration, outbox behavior, UI screens, approval workflows, report-release behavior, certification artifacts, close-complete artifacts, generated product prose artifacts, source mutations, finance writes, or autonomous actions.

## Interfaces and Dependencies

F8 depends on shipped source registry, Finance Twin, CFO Wiki, monitoring, close/control, delivery-readiness, provider-boundary, certification-boundary, human-confirmation, certification-safety, reporting, approvals, evidence, and outbox boundary posture as validation context only.

The Codex App Server remains a narrow runtime seam.
F8 must not add runtime-Codex monitoring behavior, acknowledgement drafting, review-summary drafting, source-pack drafting, provider-boundary drafting, certification-boundary drafting, certification-safety drafting, future-scope drafting, launch-readiness drafting, notification prose, external communication prose, or finance-action instructions.

Internal package scope remains `@pocket-cto/*`.
No new environment variables are expected.
No GitHub connector work is expected.

## Outcomes & Retrospective

This slice produced one shipped F8 future-scope triage record and minimal adjacent active-doc freshness edits only.
Final validation passed with logs under `/tmp/pocket-cfo-f8-final-validation.qeNtQA`.

No code, route, schema, migration, package script, smoke alias, eval dataset, fixture, implementation scaffold, provider integration, credential scaffold, outbox send behavior, UI, approval workflow, report-release behavior, certification behavior, product runtime behavior, source mutation, finance write, generated product prose, or autonomous action was added.
No FP-0076 was created during F8.

F8 implementation must not start from this slice.
The next implementation step should be another future Finance Plan only after a human chooses the specific candidate direction and proves its exact boundaries.
