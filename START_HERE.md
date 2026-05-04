# Start here

This repository is already structured so you can open it in the Codex app and keep the Pocket CFO pivot moving without losing the existing control-plane spine.

Before doing anything else, read `docs/ACTIVE_DOCS.md`.

## First run in Codex

Open the repository root in the Codex app.

Then start a fresh thread and give Codex this prompt:

```text
Read docs/ACTIVE_DOCS.md, README.md, AGENTS.md, PLANS.md, plans/ROADMAP.md, and docs/ops/source-ingest-and-cfo-wiki.md.
Determine whether an unfinished plans/FP-*.md file exists.
If one exists, summarize the active phase, the archive boundary, and the next unchecked slice of that plan, then implement only that slice.
If none exists, summarize the latest shipped phase, identify the next roadmap phase, create the next Finance Plan before code changes, and then implement only that plan.
Keep internal package scope unchanged, preserve repo hygiene, update the Finance Plan Progress and Decision Log as you work, and run the narrowest meaningful validation after each step.
```

## Recommended operating pattern

Use **one Codex thread per slice**.

Suggested thread naming:

- `F0-pivot-foundation`
- `F1-source-registry-bridge`
- `F2A-finance-twin-trial-balance`
- `F2B-chart-of-accounts`
- `F2C-general-ledger-and-hardening`
- `F2D-cross-slice-finance-snapshot-and-lineage`
- `F2E-reconciliation-readiness-and-snapshot-hardening`
- `F2F-reporting-window-truth-and-period-scoped-reconciliation`
- `F2G-account-bridge-readiness-and-f2f-polish`
- `F2H-balance-bridge-prerequisites-and-diagnostic-hardening`
- `F2I-source-backed-balance-proof-and-snapshot-polish`
- `F2J-balance-proof-lineage-and-f2i-polish`
- `F2K-bank-account-summary-and-cash-posture`
- `F2L-receivables-aging-and-collections-posture`
- `F2M-payables-aging-and-payables-posture`
- `F2N-contract-metadata-and-obligation-calendar`
- `F2O-card-expense-and-spend-posture`
- `F2P-final-f2-exit-audit-and-polish`
- `F2Q-final-f2-handoff-and-plan-chain-polish`
- `F3-cfo-wiki-master-plan-and-doc-refresh`
- `F3A-cfo-wiki-foundation-and-page-registry`
- `F3B-cfo-wiki-document-page-compiler-and-backlinks`
- `F3C-cfo-wiki-lint-export-and-durable-filing`
- `F3D-cfo-wiki-concept-metric-and-policy-pages`
- `F4-finance-discovery-master-plan-and-doc-refresh`
- `F4A-finance-discovery-foundation-and-first-answer`
- `F4B-finance-discovery-supported-posture-and-obligation-families`
- `F4C1-finance-policy-lookup`
- `F4C2-discovery-quality-hardening-and-evals`
- `F5-master-plan-and-doc-refresh`
- `F5A-reporting-mission-foundation-and-first-finance-memo`
- `F5B-draft-report-body-filed-artifact-and-markdown-export-hardening`
- `F5C-master-plan-and-doc-refresh`
- `F5C1-board-packet-specialization-and-draft-review-foundation`
- `F5C2-lender-update-specialization-and-draft-review-foundation`
- `F5C3-diligence-packet-specialization-and-draft-review-foundation`
- `F5C4-master-plan-and-doc-refresh`
- `F5C4A-approval-review-and-first-lender-update-release-readiness`
- `F5C4B-release-log-and-first-lender-update-release-record-foundation`
- `F5C4C-diligence-packet-approval-review-and-release-readiness`
- `F5C4D-release-log-and-first-diligence-packet-release-record-foundation`
- `F5C4E-board-packet-review-or-circulation-readiness-foundation`
- `F5C4F-circulation-log-and-first-board-packet-circulation-record-foundation`
- `F5C4G-board-packet-circulation-record-correction-and-chronology-foundation`
- `F5C4H-board-packet-circulation-actor-correction-and-chronology-hardening`
- `F5C4I-board-packet-circulation-note-reset-and-effective-record-hardening`
- `F6-monitoring-and-controls`
- `F6A-monitoring-foundation-and-first-cash-posture-alert`
- `F6B-alert-to-investigation-mission-foundation`
- `F6C-collections-pressure-monitor-foundation`
- `F6D-payables-pressure-monitor-foundation`
- `F6E-policy-covenant-threshold-monitor-foundation`
- `F6F-monitor-demo-replay-and-stack-pack-foundation`
- `F6G-non-cash-alert-to-investigation-generalization-foundation`
- `F6H-close-control-checklist-foundation`
- `F6I-stack-pack-expansion-and-close-control-demo-foundation`
- `F6J-operator-notification-readiness-foundation`
- `F6K-close-control-acknowledgement-foundation`
- `F6L-source-pack-expansion-foundation`
- `F6M-external-notification-delivery-planning-foundation`
- `F6N-close-control-review-summary-foundation`
- `F6O-receivables-payables-source-pack-foundation`
- `F6P-external-provider-boundary-foundation`
- `F6Q-close-control-certification-boundary-foundation`
- `F6R-contract-obligation-source-pack-foundation`
- `F6S-external-delivery-human-confirmation-boundary-foundation`
- `F6U-ledger-reconciliation-source-pack-foundation`
- `F6T-close-control-certification-safety-foundation`
- `F6W-policy-covenant-document-source-pack-foundation`
- `F6Y-board-lender-document-source-pack-foundation`
- `F6Z-final-f6-v1-exit-audit-and-handoff`

Broad F2 Finance Twin work now runs through F2O.
`F2P-final-f2-exit-audit-and-polish` and `F2Q-final-f2-handoff-and-plan-chain-polish` are the historical closeout and handoff threads for that completed breadth.
The first F3 thread is the master-plan and active-doc refresh slice.
`F3A-cfo-wiki-foundation-and-page-registry` is now the shipped CFO Wiki foundation slice.
`F3B-cfo-wiki-document-page-compiler-and-backlinks` is now the shipped first document-aware wiki slice.
`F3C-cfo-wiki-lint-export-and-durable-filing` is now the shipped wiki quality, export, and filed-artifact slice.
`F3D-cfo-wiki-concept-metric-and-policy-pages` is now the shipped deterministic knowledge-page slice.
`F4-finance-discovery-master-plan-and-doc-refresh` is the planning and active-doc slice that creates the first implementation-ready F4 contract.
`plans/FP-0030-finance-discovery-foundation-and-first-answer.md`, `plans/FP-0031-finance-discovery-supported-posture-and-obligation-families.md`, `plans/FP-0032-finance-discovery-polish-and-compatibility.md`, `plans/FP-0033-finance-discovery-baseline-closeout-polish.md`, and `plans/FP-0034-finance-discovery-final-artifact-and-doc-polish.md` are now shipped.
`plans/FP-0035-finance-policy-lookup-and-discovery-quality-hardening.md` now serves as the shipped final F4 record, including the narrow finance-native eval-hook closeout.
`F4C1-finance-policy-lookup` is now the shipped explicit-source policy lookup slice.
`F4C2-discovery-quality-hardening-and-evals` is now the shipped discovery-quality hardening slice.
`plans/FP-0036-reporting-mission-foundation-and-first-finance-memo.md` now records the landed first F5A implementation slice.
`plans/FP-0037-draft-report-body-filed-artifact-and-markdown-export-hardening.md` now serves as the shipped F5B record.
`plans/FP-0038-board-packet-specialization-and-draft-review-foundation.md` now serves as the shipped F5C1 record.
`plans/FP-0039-lender-update-specialization-and-draft-review-foundation.md` now serves as the shipped F5C2 record.
`plans/FP-0040-diligence-packet-specialization-and-draft-review-foundation.md` is now the shipped F5C3 record.
`plans/FP-0041-approval-review-and-first-lender-update-release-readiness.md` is now the shipped F5C4A record.
`plans/FP-0042-release-log-and-first-lender-update-release-record-foundation.md` is now the shipped F5C4B record.
`plans/FP-0043-diligence-packet-approval-review-and-release-readiness.md` is now the shipped F5C4C record.
`plans/FP-0044-release-log-and-first-diligence-packet-release-record-foundation.md` is now the shipped F5C4D implementation record.
`plans/FP-0045-board-packet-review-or-circulation-readiness-foundation.md` is now the shipped F5C4E record.
`plans/FP-0046-circulation-log-and-first-board-packet-circulation-record-foundation.md` is now the shipped F5C4F implementation record.
`plans/FP-0047-board-packet-circulation-record-correction-and-chronology-foundation.md` is now the shipped F5C4G implementation record.
`plans/FP-0048-board-packet-circulation-actor-correction-and-chronology-hardening.md` is now the shipped F5C4H record and already includes the first shipped board-packet actor-correction slice.
`plans/FP-0049-board-packet-circulation-note-reset-and-effective-record-hardening.md` is now the shipped F5C4I record and closes the previously remaining explicit `circulationNote` clear-to-absent gap on the existing seam.
`plans/FP-0050-monitoring-foundation-and-first-cash-posture-alert.md` now records the shipped first F6A implementation slice: one deterministic `cash_posture` monitor result plus one operator-visible alert-card posture from stored source-backed state only, with no F6B investigation mission, runtime-codex, delivery, or reporting/approval reopening.
`plans/FP-0051-alert-to-investigation-mission-foundation.md` now records the shipped first F6B implementation slice: an operator can manually create or open one taskless deterministic investigation mission from one persisted alerting `cash_posture` monitor result.
`plans/FP-0052-collections-pressure-monitor-foundation.md` now records the shipped F6C implementation slice for exactly one `collections_pressure` monitor over stored receivables-aging or collections-posture Finance Twin state. F6C does not create investigations for collections alerts.
`plans/FP-0053-payables-pressure-monitor-foundation.md` now records the shipped F6D implementation slice for exactly one `payables_pressure` monitor over stored payables-aging or payables-posture Finance Twin state. F6D does not create investigations for payables alerts and does not add payment recommendations, payment instructions, delivery, runtime-codex, approvals, reports, or autonomous finance action.
`plans/FP-0054-policy-covenant-threshold-monitor-foundation.md` now records the shipped F6E implementation slice for exactly one `policy_covenant_threshold` monitor over stored CFO Wiki policy-document posture, deterministic policy extracts, policy pages, policy-corpus posture, and explicit comparable Finance Twin posture only. F6E does not create investigations for policy/covenant threshold alerts and does not add delivery, runtime-codex, approvals, reports, legal or policy advice, payment behavior, new discovery families, or autonomous finance action.
`plans/FP-0055-monitor-demo-replay-and-stack-pack-foundation.md` is now the shipped F6F implementation record. It adds one deterministic monitor demo replay and one stack-pack foundation only; it did not start F6G, F6H, F6I, new monitor families, delivery, runtime-codex, approval, report-conversion, payment, legal, or policy-advice behavior.
`plans/FP-0056-non-cash-alert-investigation-generalization-foundation.md` is now the shipped F6G implementation record. It widens the manual alert-to-investigation handoff to persisted alerting `collections_pressure` monitor results only, preserves shipped cash handoff behavior, and keeps payables, policy/covenant, runtime-codex, delivery, reports, approvals, payment behavior, legal or policy advice, collection instructions, customer-contact instructions, and autonomous finance action out of scope.
`plans/FP-0057-close-control-checklist-foundation.md` is now the shipped F6H record. It adds one deterministic, source-backed close/control checklist foundation from stored Finance Twin source posture, stored CFO Wiki policy/source posture, and latest persisted monitor results as context only; it did not add F6I, monitor families, discovery families, monitor reruns, investigations, runtime-Codex, delivery, approvals, reports, accounting, bank, tax, legal, payment, collection-instruction, customer-contact, or autonomous-action behavior.
`plans/FP-0058-stack-pack-expansion-and-close-control-demo-foundation.md` is now the shipped F6I record. It extends the existing `pocket-cfo-monitor-demo` stack-pack with normalized close/control checklist expected output and updates the existing monitor demo replay proof only. It did not add monitor families, discovery families, routes, schema, migrations, package scripts, eval datasets, runtime-Codex, delivery, reports, approvals, payment behavior, legal or policy advice, collection/customer-contact instructions, or autonomous actions.
`plans/FP-0059-operator-notification-readiness-foundation.md` is now the shipped F6J record. It adds one deterministic internal operator attention/readiness read model over shipped stored state only, with no external delivery, notification provider, outbox send behavior, reports, approvals, runtime-Codex, mission creation, monitor reruns, monitor-family or discovery-family expansion, or autonomous finance action. `plans/FP-0060-close-control-acknowledgement-foundation.md` is now the shipped F6K record. It adds one deterministic read-only internal close/control acknowledgement-readiness read model over shipped checklist posture and operator-readiness posture only, with no approval, close-complete status, external delivery, notification provider, outbox send behavior, report, mission creation, monitor rerun, runtime-Codex, payment behavior, legal/policy advice, collection/customer-contact instruction, autonomous finance action, monitor-family expansion, or discovery-family expansion. `plans/FP-0061-source-pack-expansion-foundation.md` is now the shipped F6L record for one bank/card source-pack foundation. It adds one checked-in bank/card source-pack manifest and fixture proof at `pnpm exec tsx tools/bank-card-source-pack-proof.mjs`, and it did not add routes, schema, package scripts, smoke aliases, eval datasets, runtime-Codex, delivery, reports, approvals, monitor/discovery families, mission behavior, checklist/readiness/acknowledgement behavior, finance writes, legal/policy advice, collection/customer-contact instructions, or autonomous action. `plans/FP-0062-external-notification-delivery-planning-foundation.md` is now the shipped F6M record for one deterministic internal delivery-readiness boundary foundation over F6J/F6K posture only; it did not implement external delivery, notification providers, outbox sends, scheduled notifications, auto-send, approvals, reports, runtime-Codex drafting, generated notification prose, mission creation, monitor reruns, source mutation, finance writes, payment behavior, legal/policy advice, collection/customer-contact instruction, autonomous action, new monitor families, or new discovery families. `plans/FP-0063-close-control-review-summary-foundation.md` is now the shipped F6N record for one deterministic internal close/control review-summary foundation over shipped F6H/F6J/F6K/F6M posture only; it did not add certification, close complete, sign-off, attestation, approval, report release, report circulation, external delivery, provider calls, outbox sends, runtime-Codex, generated prose, mission creation, monitor reruns, source mutation, finance actions, legal/policy/payment/collection/customer-contact instruction, autonomous action, monitor-family expansion, discovery-family expansion, or F6O implementation. `plans/FP-0064-receivables-payables-source-pack-foundation.md` is now the shipped F6O record for one receivables/payables source-pack foundation with direct proof `pnpm exec tsx tools/receivables-payables-source-pack-proof.mjs`; it did not add routes, schema, package scripts, smoke aliases, eval datasets, runtime-Codex, delivery, notification providers, reports, approvals, monitor/discovery families, mission behavior, checklist/readiness/acknowledgement/delivery-readiness/review-summary behavior, finance writes, legal/policy advice, collection/customer-contact instructions, generated prose, source mutation outside proof upload/sync setup, or autonomous action. `plans/FP-0065-external-provider-boundary-foundation.md` is now the shipped F6P record for one deterministic internal external-provider-boundary/readiness foundation only. F6P added `GET /external-provider-boundary/companies/:companyKey` and remained read-only, provider-call-free, provider-credential-free, provider-job-free, outbox-send-free, report-free, approval-free, generated-prose-free, source-mutation-free, runtime-Codex-free, finance-action-free, and monitor/discovery-family-free. `plans/FP-0066-close-control-certification-boundary-foundation.md` is now the shipped F6Q record for one deterministic internal close/control certification-boundary/readiness foundation only. F6Q added `GET /close-control/companies/:companyKey/certification-boundary` and remained read-only, no-schema, certification-free, close-complete-free, sign-off-free, attestation-free, legal-opinion-free, audit-opinion-free, assurance-free, approval-free, report-release-free, report-circulation-free, delivery-free, provider-call-free, provider-credential-free, provider-job-free, outbox-send-free, generated-prose-free, source-mutation-free, runtime-Codex-free, finance-action-free, and monitor/discovery-family-free. `plans/FP-0067-contract-obligation-source-pack-foundation.md` is now the shipped F6R record for one contract/obligation source-pack foundation with direct proof `pnpm exec tsx tools/contract-obligation-source-pack-proof.mjs`; it did not add routes, schema, migrations, package scripts, smoke aliases, eval datasets, runtime-Codex, delivery, provider calls, reports, approvals, certification, close complete, sign-off, attestation, legal/audit opinions, finance writes, advice, customer-contact instructions, generated prose, monitor/discovery families, or F6S/F6T/F6U. `plans/FP-0068-external-delivery-human-confirmation-boundary-foundation.md` is now the shipped F6S record for one deterministic internal external-delivery human-confirmation / delivery-preflight boundary foundation through `GET /external-delivery/companies/:companyKey/human-confirmation-boundary`; it did not add actual external delivery, provider calls, provider credentials, provider jobs, outbox sends, email, Slack, SMS, webhook, scheduled delivery, auto-send, generated notification prose, approvals, report creation, report release/circulation, certification, close-complete status, sign-off, attestation, legal/audit opinion, mission creation, monitor reruns/results, source mutation, runtime-Codex, finance writes, advice/instructions, autonomous action, new monitor family, or new discovery family. `plans/FP-0069-ledger-reconciliation-source-pack-foundation.md` is now the shipped F6U record for one ledger/reconciliation source-pack foundation with direct proof `pnpm exec tsx tools/ledger-reconciliation-source-pack-proof.mjs`; it added exactly one checked-in chart-of-accounts/trial-balance/general-ledger fixture and manifest family using existing source registry and Finance Twin routes only, and it did not add routes, schema, migrations, package scripts, smoke aliases, eval datasets, runtime-Codex, delivery, provider calls, provider credentials, provider jobs, outbox sends, reports, approvals, certification, close-complete status, sign-off, attestation, legal/audit opinions, payment behavior, finance writes, advice, customer-contact instructions, generated prose, source mutation outside proof upload/sync setup, monitor/discovery families, or autonomous action. `plans/FP-0070-close-control-certification-safety-foundation.md` is now the shipped F6T record for one deterministic internal close/control certification-safety/readiness foundation through `GET /close-control/companies/:companyKey/certification-safety`; it did not add actual certification, certified status, close complete, sign-off, attestation, assurance, legal/audit opinion, approval, report creation, report release/circulation, external delivery, provider calls, provider credentials, provider jobs, outbox sends, email, Slack, SMS, webhook, scheduled delivery, auto-send, generated notification prose, mission creation, monitor reruns/results, source mutation, runtime-Codex, finance writes, payment behavior, advice/instructions, customer-contact instruction, autonomous action, new monitor family, or new discovery family. `plans/FP-0071-policy-covenant-document-source-pack-foundation.md` is now the shipped F6W record for one policy/covenant document source-pack foundation with direct proof `pnpm exec tsx tools/policy-covenant-document-source-pack-proof.mjs`; it did not add routes, schema, migrations, package scripts, smoke aliases, eval datasets, UI, runtime-Codex, delivery, notification providers, provider calls, provider credentials, provider jobs, outbox sends, reports, approvals, certification, certified status, close complete, sign-off, attestation, assurance, legal/audit opinion, monitor/discovery families, mission behavior, checklist/readiness/acknowledgement/delivery-readiness/review-summary/provider-boundary/certification-boundary/human-confirmation/certification-safety behavior, payment behavior, legal/policy advice, collection/customer-contact instruction, generated prose, source mutation outside proof upload/bind/compile setup, finance writes, or autonomous action. `plans/FP-0072-board-lender-document-source-pack-foundation.md` is now the shipped F6Y record for one board/lender document source-pack foundation with direct proof `pnpm exec tsx tools/board-lender-document-source-pack-proof.mjs`; it did not add routes, schema, migrations, package scripts, smoke aliases, eval datasets, UI, runtime-Codex, delivery, notification providers, provider calls, provider credentials, provider jobs, outbox sends, reports, board packets, lender updates, approvals, certification, certified status, close complete, sign-off, attestation, assurance, legal/audit opinion, monitor/discovery families, mission behavior, checklist/readiness/acknowledgement/delivery-readiness/review-summary/provider-boundary/certification-boundary/human-confirmation/certification-safety behavior, payment behavior, legal/policy/board/lender advice, collection/customer-contact instruction, generated prose, source mutation outside proof upload/bind/compile setup, finance writes, or autonomous action. `plans/FP-0073-final-f6-v1-exit-audit-and-handoff.md` is now the shipped F6Z final audit/handoff record; it is docs-and-validation-only and added no product runtime behavior. F6V provider integration, F6X actual certification, and later planning must wait for future Finance Plans.

`plans/FP-0071-policy-covenant-document-source-pack-foundation.md` is the shipped F6W record. It shipped one fixture/manifest/proof-oriented policy/covenant document source-pack family with document role `policy_document`, source kind `document`, media types `text/markdown` and `text/plain`, existing source registry plus CFO Wiki bind/compile/read routes only, no new monitor or discovery families, and no product runtime behavior.
`plans/FP-0072-board-lender-document-source-pack-foundation.md` is the shipped F6Y record. It shipped one board/lender document source-pack family only, with existing `board_material` and `lender_document` roles, source kind `document`, deterministic markdown/plain-text source paths, existing source registry plus CFO Wiki bind/compile/read routes, direct proof `pnpm exec tsx tools/board-lender-document-source-pack-proof.mjs`, no product runtime behavior, and no F6V/F6X/F6Z implementation.
`plans/FP-0073-final-f6-v1-exit-audit-and-handoff.md` is the shipped F6Z final audit/handoff record. It closed the final F6/v1 audit as docs-and-validation only, and it did not start provider integration, actual certification, report release, delivery, approvals, runtime-Codex, source mutation, finance writes, or autonomous action.
`plans/FP-0074-v1-launch-readiness-and-active-doc-hardening.md` is the shipped F7/v1 launch-readiness and active-doc hardening record. It is docs-and-validation-only, added no product runtime behavior, created no FP-0075 during F7, and did not start F6V provider integration, F6X actual certification, or later high-liability work.
`plans/FP-0075-v1-future-scope-triage-and-roadmap-hardening.md` is the shipped F8/v1 future-scope triage record. It is docs-and-validation-only and did not start F8 implementation, F6V provider integration, F6X actual certification, product UI launch polish, deeper PDF/OCR/vector search, delivery, approval, report release, runtime-Codex, source mutation, finance writes, or autonomous action.
`plans/FP-0076-product-ui-launch-polish-foundation.md` is the active F9 product UI launch-polish foundation contract. It is docs-and-validation-only in this thread; do not start F9 implementation, F6V provider integration, F6X actual certification, deeper PDF/OCR/vector search, v1 public launch handoff, delivery, approval, report release, runtime-Codex, generated prose, source mutation, finance writes, or autonomous action from this planning slice.

## Review ritual

After each slice:

1. review the diff
2. confirm the touched files still respect package and module boundaries
3. confirm the active Finance Plan was updated
4. confirm stale or historical docs were not accidentally revived as active truth
5. run the listed validation commands
6. only then move to the next slice

## Use the Pocket CFO Codex plugin

Explicitly invoke these when useful:

- `$finance-plan-orchestrator`
- `$execplan-orchestrator`
- `$modular-architecture-guard`
- `$source-provenance-guard`
- `$cfo-wiki-maintainer`
- `$evidence-bundle-auditor`
- `$f6-monitoring-semantics-guard`
- `$validation-ladder-composer`
- `$pocket-cfo-handoff-auditor`

Use `$github-app-integration-guard` only when touching the optional GitHub connector path.

Example:

```text
$source-provenance-guard Add the source registry snapshot repository and checksum handling. Keep raw sources immutable and make lineage explicit in both schema and service code.
```

## What not to do first

Do not start with:

- a giant repo-wide rename of `@pocket-cto/*`
- deleting all GitHub modules in one shot
- finance connector sprawl
- autonomous accounting or banking actions
- vague “AI CFO” chat features
- deck polish before discovery, provenance, and freshness are real
- replacing deterministic twin logic with freeform LLM answers

## The correct first success

The first success in a new thread is not guessing from stale plans or restarting F0 work.

The first success is:

> Codex identifies whether an unfinished Finance Plan exists, respects the active-vs-archive boundary, and either continues that narrow unfinished slice or creates the next-phase plan before coding.

Once that is solid, the next active finance slice can proceed safely.
