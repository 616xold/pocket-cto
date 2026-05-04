# Pocket CFO evals

The eval harness architecture from Pocket CTO is worth keeping.
What changes is the dataset and rubric content.

## What to optimize for

Pocket CFO evals should reward:

- evidence-grounded finance answers
- honest freshness posture
- clear assumptions
- numeric consistency
- limitation handling
- report or memo quality when reporting is in scope

## What not to optimize for

Do not optimize for generic “sounds like a CFO” vibes.
Do not let uncited confidence score well.

## Early pivot reality

The repo may still expose legacy planner or executor eval commands while the finance vertical is landing.
That is acceptable during the transition.

When using those commands during the pivot:

- treat the harness as generic infrastructure
- swap in finance-oriented prompts and rubrics when the relevant slices land
- keep product runtime and eval runtime separate

## Target finance eval families

1. deterministic finance discovery answers for the shipped F4A through F4C2 baseline, with `cash_posture` as the first F4A family, `collections_pressure`, `payables_pressure`, `spend_posture`, and `obligation_calendar_review` shipped in F4B, explicit-source `policy_lookup` shipped in F4C1, and F4C2 discovery-quality hardening already shipped for the current six-family baseline
2. later posture, aging, spend, and obligation answers that stay grounded in already-shipped Finance Twin reads
3. source-scoped `policy_lookup` from explicit `policySourceId`, explicit `policy_document` bindings, and stored deterministic extracts
4. shipped F5A draft finance memo compilation from a completed discovery mission, its stored `discovery_answer`, and its linked evidence appendix
5. shipped F5B draft report body visibility, explicit filed artifact reuse, and markdown export posture from stored reporting artifacts plus the existing CFO Wiki seams
6. shipped F5C1 draft `board_packet` specialization from one completed reporting mission with stored `finance_memo` plus stored `evidence_appendix`
7. shipped F5C2 draft `lender_update` specialization from one completed reporting mission with stored `finance_memo` plus stored `evidence_appendix`
8. shipped F5C3 draft `diligence_packet` specialization from one completed reporting mission with stored `finance_memo` plus stored `evidence_appendix`
9. shipped F5C4A lender-update review, approval, and release-readiness posture from one completed reporting mission with stored `lender_update` evidence and no delivery side effect
10. shipped F5C4B lender-update release logging and first release-record posture from one completed approved-for-release reporting mission with stored `lender_update` evidence and no delivery automation
11. shipped F5C4C diligence-packet review, approval, and release-readiness posture from one completed reporting mission with stored `diligence_packet` evidence and no release-log or delivery side effect
12. shipped F5C4D diligence-packet release logging and first release-record posture from one completed approved-for-release reporting mission with stored `diligence_packet` evidence and no delivery automation
13. shipped F6A deterministic `cash_posture` monitor result and alert-card posture from stored source-backed Finance Twin cash-posture state, recorded in `plans/FP-0050-monitoring-foundation-and-first-cash-posture-alert.md`
14. shipped F6B manual alert-to-investigation handoff, recorded in `plans/FP-0051-alert-to-investigation-mission-foundation.md`
15. shipped F6C collections-pressure monitor result and optional alert-card posture, recorded in `plans/FP-0052-collections-pressure-monitor-foundation.md`
16. shipped F6D payables-pressure monitor result and optional alert-card posture, recorded in `plans/FP-0053-payables-pressure-monitor-foundation.md`, with `pnpm smoke:payables-pressure-monitor:local` as the narrow deterministic proof
17. shipped F6E policy/covenant threshold monitor result and optional alert-card posture, recorded in `plans/FP-0054-policy-covenant-threshold-monitor-foundation.md`, with `pnpm smoke:policy-covenant-threshold-monitor:local` as the narrow deterministic proof
18. shipped F6F monitor demo replay and stack-pack foundation, recorded in `plans/FP-0055-monitor-demo-replay-and-stack-pack-foundation.md`, with `pnpm smoke:monitor-demo-replay:local` as the deterministic replay proof and no model-scored benchmark dataset yet
19. shipped F6G collections-first non-cash alert-to-investigation handoff, recorded in `plans/FP-0056-non-cash-alert-investigation-generalization-foundation.md`, with `pnpm smoke:collections-pressure-alert-investigation:local` as the narrow deterministic proof and no broader eval dataset yet
20. shipped F6H deterministic close/control checklist foundation, recorded in `plans/FP-0057-close-control-checklist-foundation.md`, with `pnpm smoke:close-control-checklist:local` as the narrow deterministic proof and no broader eval dataset yet
21. shipped F6I stack-pack expansion and close/control demo foundation, recorded in `plans/FP-0058-stack-pack-expansion-and-close-control-demo-foundation.md`, which extends the existing deterministic demo replay proof with normalized close/control checklist expected output and no model-scored benchmark dataset
22. shipped F6J internal operator attention/readiness foundation, recorded in `plans/FP-0059-operator-notification-readiness-foundation.md`, with `pnpm smoke:operator-readiness:local` as the narrow deterministic proof and no delivery or notification-provider eval dataset
23. shipped F6K internal close/control acknowledgement-readiness foundation, recorded in `plans/FP-0060-close-control-acknowledgement-foundation.md`, with `pnpm smoke:close-control-acknowledgement:local` as the narrow deterministic proof and no approval, close-complete, delivery, runtime-Codex, or model-scored benchmark dataset
24. shipped F6L bank/card source-pack foundation, recorded in `plans/FP-0061-source-pack-expansion-foundation.md`, with direct deterministic proof `pnpm exec tsx tools/bank-card-source-pack-proof.mjs` and no eval dataset, runtime-Codex, delivery, monitor family, or discovery family added
25. shipped F6M internal delivery-readiness boundary foundation, recorded in `plans/FP-0062-external-notification-delivery-planning-foundation.md`, with `pnpm smoke:delivery-readiness:local` as the narrow deterministic proof and no external delivery, provider, outbox, approval, report, runtime-Codex, generated-prose, or model-scored benchmark dataset
26. shipped F6N internal close/control review-summary foundation, recorded in `plans/FP-0063-close-control-review-summary-foundation.md`, with narrow domain/control-plane specs as the deterministic proof and no certification, close-complete status, sign-off, attestation, approval, report release/circulation, external delivery, runtime-Codex, generated prose, monitor rerun, source mutation, F6O implementation, or model-scored benchmark dataset
27. shipped F6O receivables/payables source-pack foundation, recorded in `plans/FP-0064-receivables-payables-source-pack-foundation.md`, with direct deterministic proof `pnpm exec tsx tools/receivables-payables-source-pack-proof.mjs` and no eval dataset, runtime-Codex, delivery, report, approval, monitor family, or discovery family added
28. shipped F6P internal external-provider-boundary/readiness foundation, recorded in `plans/FP-0065-external-provider-boundary-foundation.md`, with narrow domain/control-plane specs as the deterministic proof and no eval dataset, actual external delivery, provider call, provider credential, provider job, outbox send, report, approval, mission creation, monitor rerun, source mutation, runtime-Codex, generated prose, finance action, monitor family, or discovery family added
29. shipped F6Q internal close/control certification-boundary/readiness foundation, recorded in `plans/FP-0066-close-control-certification-boundary-foundation.md`, with narrow domain/control-plane specs as the deterministic proof and no eval dataset, actual certification, close-complete status, sign-off, attestation, legal opinion, audit opinion, assurance, approval, report release, report circulation, external delivery, provider call, provider credential, provider job, outbox send, mission creation, monitor rerun, source mutation, runtime-Codex, generated prose, finance action, F6R implementation in that slice, monitor family, or discovery family added
30. shipped F6R contract/obligation source-pack foundation, recorded in `plans/FP-0067-contract-obligation-source-pack-foundation.md`, with direct deterministic proof `pnpm exec tsx tools/contract-obligation-source-pack-proof.mjs` and no eval dataset, route, schema, package script, smoke alias, runtime-Codex, delivery, provider call, report, approval, certification, finance action, monitor family, or discovery family added
31. shipped F6U ledger/reconciliation source-pack foundation, recorded in `plans/FP-0069-ledger-reconciliation-source-pack-foundation.md`, with direct deterministic proof `pnpm exec tsx tools/ledger-reconciliation-source-pack-proof.mjs` and no eval dataset, route, schema, package script, smoke alias, runtime-Codex, delivery, provider call, report, approval, certification, finance action, monitor family, or discovery family added
32. shipped F6T close/control certification-safety foundation, recorded in `plans/FP-0070-close-control-certification-safety-foundation.md`, with narrow domain/control-plane specs as deterministic proof and no eval dataset, schema, package script, smoke alias, runtime-Codex, delivery, provider call, provider credential, provider job, outbox send, report creation/release/circulation, approval, actual certification, certified status, close complete, sign-off, attestation, assurance, legal/audit opinion, generated prose, source mutation, finance action, monitor family, or discovery family added
33. shipped F6W policy/covenant document source-pack foundation, recorded in `plans/FP-0071-policy-covenant-document-source-pack-foundation.md`, with direct deterministic proof `pnpm exec tsx tools/policy-covenant-document-source-pack-proof.mjs` and no eval dataset, route, schema, package script, smoke alias, UI, runtime-Codex, delivery, notification provider, provider call, provider credential, provider job, outbox send, report, approval, certification, finance action, generated prose, source mutation outside proof upload/bind/compile setup, monitor family, or discovery family added
34. shipped F6Y board/lender document source-pack foundation, recorded in `plans/FP-0072-board-lender-document-source-pack-foundation.md`, with direct deterministic proof `pnpm exec tsx tools/board-lender-document-source-pack-proof.mjs` and no eval dataset, route, schema, package script, smoke alias, UI, runtime-Codex, delivery, notification provider, provider call, provider credential, provider job, outbox send, report, board packet, lender update, approval, certification, finance action, generated prose, source mutation outside proof upload/bind/compile setup, monitor family, or discovery family added
35. shipped F6Z final F6/v1 exit audit and handoff record, recorded in `plans/FP-0073-final-f6-v1-exit-audit-and-handoff.md`, with docs-and-validation-only scope and no eval dataset, route, schema, package script, smoke alias, fixture, product runtime behavior, provider integration, delivery, outbox send, report release/circulation, approval, actual certification, runtime-Codex, generated prose, source mutation, finance action, monitor family, or discovery family added
36. shipped F7/v1 launch-readiness and active-doc hardening record, recorded in `plans/FP-0074-v1-launch-readiness-and-active-doc-hardening.md`, with docs-and-validation-only scope and no eval dataset, model-scored benchmark dataset, route, schema, package script, smoke alias, fixture, product runtime behavior, provider integration, delivery, outbox send, report release/circulation, approval, actual certification, runtime-Codex, generated prose, source mutation, finance action, monitor family, discovery family, FP-0075 during F7, or autonomous action added
37. shipped F8/v1 future-scope triage and roadmap-hardening record, recorded in `plans/FP-0075-v1-future-scope-triage-and-roadmap-hardening.md`, with docs-and-validation-only scope and no eval dataset, model-scored benchmark dataset, route, schema, package script, smoke alias, fixture, product runtime behavior, provider integration, delivery, outbox send, report release/circulation, approval, actual certification, runtime-Codex, generated prose, source mutation, finance action, monitor family, discovery family, FP-0076 during F8, or autonomous action added
38. shipped F9 product UI launch-polish foundation, recorded in `plans/FP-0076-product-ui-launch-polish-foundation.md`, with read-only app/web navigation, copy, warning, and status-surface truthfulness only and no eval dataset, model-scored benchmark dataset, backend route, web API route, schema, package script, smoke alias, fixture, product runtime behavior, UI action controls, provider integration, delivery, outbox send, report release/circulation, approval, actual certification, runtime-Codex, generated prose, source mutation, finance action, monitor family, discovery family, FP-0077 during F9, or autonomous action added
39. active F10/v1 public launch handoff planning contract, recorded in `plans/FP-0077-v1-public-launch-handoff.md`, with docs-and-validation-only scope and no eval dataset, model-scored benchmark dataset, backend route, web API route, schema, package script, smoke alias, fixture, product runtime behavior, UI, provider integration, delivery, outbox send, report creation/release/circulation, approval workflow, actual certification, runtime-Codex, generated prose, source mutation, finance action, monitor family, discovery family, deployment/external comms, FP-0078, or autonomous action added
40. wiki compilation quality
41. provenance, freshness disclosure, and contradiction handling

## F4 staging

Early F4 evals should distinguish what the repo can truthfully support from what belongs to later deterministic work.

Shipped today:

- discovery evals can cover `cash_posture`, `collections_pressure`, `payables_pressure`, `spend_posture`, `obligation_calendar_review`, and source-scoped `policy_lookup`
- eval prompts should require twin/wiki-grounded answers with explicit freshness and limitations
- runtime-codex, vector retrieval, OCR, deep-read, and report compilation should stay out of scope
- `pnpm smoke:finance-discovery-quality:local` remains the deterministic source-of-truth quality smoke for the shipped F4A through F4C2 baseline
- `pnpm eval:finance-discovery-quality` now reuses that deterministic smoke to write a finance-native report under `evals/results/finance-discovery-quality/` without fake candidate, grader, reference, or provider metadata

For later phases:

- keep `policy_lookup` eval prompts explicitly source-scoped and grounded in stored deterministic policy pages plus extract status
- do not grade generic corpus-wide semantic policy search as if it already exists
- add later discovery families only when the repo can already ground them deterministically
- keep F5 memo and shipped board-packet, lender-update, and diligence-packet evals anchored to the shipped F5A through F5C3 contracts
- keep the shipped diligence-packet eval scope anchored to `plans/FP-0040-diligence-packet-specialization-and-draft-review-foundation.md`: one completed reporting mission with stored `finance_memo` plus stored `evidence_appendix` in, one deterministic draft `diligence_packet` out, with explicit freshness, limitations, review-ready posture, and no runtime-codex fact invention
- keep the shipped F5C4A eval scope anchored to `plans/FP-0041-approval-review-and-first-lender-update-release-readiness.md`: one completed `lender_update` reporting mission plus one stored `lender_update` artifact in, one finance-facing `report_release` review trace and derived release-readiness posture out, with no send, distribute, publish, or runtime-codex fact invention
- keep the shipped F5C4B eval scope anchored to `plans/FP-0042-release-log-and-first-lender-update-release-record-foundation.md`: one completed approved-for-release `lender_update` reporting mission plus one stored `lender_update` artifact in, one explicit release record plus release-logged posture out, with no send, distribute, publish, or runtime-codex fact invention
- keep the shipped F5C4C eval scope anchored to `plans/FP-0043-diligence-packet-approval-review-and-release-readiness.md`: one completed `diligence_packet` reporting mission plus one stored `diligence_packet` artifact in, one finance-facing `report_release` review trace and derived release-readiness posture out, with no send, distribute, publish, release logging, or runtime-codex fact invention
- keep the shipped F5C4D eval scope anchored to `plans/FP-0044-release-log-and-first-diligence-packet-release-record-foundation.md`: one completed approved-for-release `diligence_packet` reporting mission plus one stored `diligence_packet` artifact in, one explicit release record plus release-logged posture out, with no send, distribute, publish, or runtime-codex fact invention
- keep the shipped F5C4E eval scope anchored to `plans/FP-0045-board-packet-review-or-circulation-readiness-foundation.md`: one completed `board_packet` reporting mission plus one stored `board_packet` artifact in, one finance-facing `report_circulation` review trace and derived circulation-ready posture out, with no circulation log, send, distribute, publish, or runtime-codex fact invention
- keep the shipped F5C4F eval scope anchored to `plans/FP-0046-circulation-log-and-first-board-packet-circulation-record-foundation.md`: one completed approved-for-circulation `board_packet` reporting mission plus one stored `board_packet` artifact in, one explicit circulation record plus circulated posture out, with no send, distribute, publish, or runtime-codex fact invention
- keep the shipped F5C4G eval scope anchored to `plans/FP-0047-board-packet-circulation-record-correction-and-chronology-foundation.md`: one completed approved-for-circulation `board_packet` reporting mission plus one stored `board_packet` artifact and one existing circulation record in, one append-only correction entry plus derived effective-circulation and chronology posture out, with no send, distribute, publish, or runtime-codex fact invention
- `plans/FP-0048-board-packet-circulation-actor-correction-and-chronology-hardening.md` is the shipped F5C4H record and covers append-only actor-attribution correction plus derived effective actor chronology on the existing `report_circulation` seam
- keep the shipped F5C4I eval scope anchored to `plans/FP-0049-board-packet-circulation-note-reset-and-effective-record-hardening.md`: one completed approved-for-circulation `board_packet` reporting mission plus one stored `board_packet` artifact, one existing circulation record, and append-only corrections in, explicit `circulationNote` clear-to-absent semantics plus truthful effective-note chronology out, with no send, distribute, publish, or runtime-codex fact invention
- grade the shipped note-reset truth on the existing seam, but do not widen grading into multi-packet circulation, actual delivery, PDF export, slide or Marp export, or runtime-codex drafting behavior
- keep the shipped F6A eval scope anchored to `plans/FP-0050-monitoring-foundation-and-first-cash-posture-alert.md`: one `companyKey` plus stored source-backed cash-posture state in, one deterministic monitor result plus optional operator alert-card posture out, with source lineage, freshness or missing-source posture, deterministic severity rationale, limitations, proof-bundle posture, human-review next step, and no investigation mission, runtime-codex, delivery, accounting action, bank action, tax filing, legal advice, or new discovery family
- keep the shipped F6B handoff anchored to `plans/FP-0051-alert-to-investigation-mission-foundation.md`: one persisted `cash_posture` alert monitor result in, one manual operator-created investigation mission out, with the existing alert-card source lineage, freshness or missing-source posture, severity rationale, limitations, proof posture, and human-review next step carried forward
- use `pnpm smoke:cash-posture-monitor:local`, `pnpm smoke:cash-posture-alert-investigation:local`, `pnpm smoke:collections-pressure-monitor:local`, `pnpm smoke:collections-pressure-alert-investigation:local`, `pnpm smoke:payables-pressure-monitor:local`, `pnpm smoke:policy-covenant-threshold-monitor:local`, `pnpm smoke:monitor-demo-replay:local`, `pnpm smoke:close-control-checklist:local`, `pnpm smoke:operator-readiness:local`, `pnpm smoke:close-control-acknowledgement:local`, `pnpm smoke:delivery-readiness:local`, direct F6N/F6P/F6Q/F6S domain/control-plane specs, `pnpm exec tsx tools/bank-card-source-pack-proof.mjs`, `pnpm exec tsx tools/receivables-payables-source-pack-proof.mjs`, `pnpm exec tsx tools/contract-obligation-source-pack-proof.mjs`, `pnpm exec tsx tools/ledger-reconciliation-source-pack-proof.mjs`, `pnpm exec tsx tools/policy-covenant-document-source-pack-proof.mjs`, and `pnpm exec tsx tools/board-lender-document-source-pack-proof.mjs` as the current shipped F6 truth sources; `plans/FP-0052-collections-pressure-monitor-foundation.md` records the shipped F6C implementation, `plans/FP-0053-payables-pressure-monitor-foundation.md` records the shipped F6D implementation, `plans/FP-0054-policy-covenant-threshold-monitor-foundation.md` records the shipped F6E implementation, `plans/FP-0055-monitor-demo-replay-and-stack-pack-foundation.md` records the shipped F6F deterministic demo replay, `plans/FP-0056-non-cash-alert-investigation-generalization-foundation.md` is the shipped F6G collections-first handoff record, `plans/FP-0057-close-control-checklist-foundation.md` is the shipped F6H checklist record, `plans/FP-0058-stack-pack-expansion-and-close-control-demo-foundation.md` is the shipped F6I replay proof expansion, `plans/FP-0059-operator-notification-readiness-foundation.md` is the shipped F6J readiness record, `plans/FP-0060-close-control-acknowledgement-foundation.md` is the shipped F6K acknowledgement-readiness record, `plans/FP-0061-source-pack-expansion-foundation.md` is the shipped F6L bank/card source-pack record, `plans/FP-0062-external-notification-delivery-planning-foundation.md` is the shipped F6M delivery-readiness record, `plans/FP-0063-close-control-review-summary-foundation.md` is the shipped F6N review-summary record, `plans/FP-0064-receivables-payables-source-pack-foundation.md` is the shipped F6O receivables/payables source-pack record, `plans/FP-0067-contract-obligation-source-pack-foundation.md` is the shipped F6R contract/obligation source-pack record, `plans/FP-0069-ledger-reconciliation-source-pack-foundation.md` is the shipped F6U ledger/reconciliation source-pack record, `plans/FP-0071-policy-covenant-document-source-pack-foundation.md` is the shipped F6W policy/covenant document source-pack record, and `plans/FP-0072-board-lender-document-source-pack-foundation.md` is the shipped F6Y board/lender document source-pack record without a broader source-pack eval dataset; `plans/FP-0073-final-f6-v1-exit-audit-and-handoff.md` is the shipped F6Z final audit/handoff record and adds no eval dataset

Do not treat these as early F4 supported families:

- `receivables_aging_review`
- `payables_aging_review`
- `runway`
- `burn_variance`
- `concentration`
- `covenant_risk`
- `anomaly_review`
- `spend_exceptions` based on policy scoring or exception inference

## Minimum grading questions

A good finance eval should ask:

- Was the answer grounded in the provided evidence?
- Were stale or missing inputs disclosed?
- Were assumptions clearly marked?
- Were important limitations preserved?
- Could a human review or reuse the output outside chat?

## Policy

Evals are for measurement and iteration.
They are not a substitute for the product’s evidence and approval contracts.
