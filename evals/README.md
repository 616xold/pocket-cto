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
14. active F6B manual alert-to-investigation planning, recorded in `plans/FP-0051-alert-to-investigation-mission-foundation.md`, without an eval dataset until implementation ships
15. wiki compilation quality
16. provenance, freshness disclosure, and contradiction handling

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
- keep F6B implementation work anchored to `plans/FP-0051-alert-to-investigation-mission-foundation.md`: one persisted `cash_posture` alert monitor result in, one manual operator-created investigation mission out, with the existing alert-card source lineage, freshness or missing-source posture, severity rationale, limitations, proof posture, and human-review next step carried forward; do not add a broader F6 eval dataset until that handoff behavior exists
- use `pnpm smoke:cash-posture-monitor:local` as the current narrow F6A truth source before adding any broader F6 eval dataset

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
