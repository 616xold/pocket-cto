# Codex App Server integration notes

Pocket CFO still uses Codex App Server as a primary runtime seam.

The key change is not the transport.
The key change is what the surrounding control plane asks the runtime to do.

## Role in Pocket CFO

The runtime seam should stay narrow and generic.

The control plane owns:

- finance mission semantics
- source-registry rules
- Finance Twin reads and writes
- wiki filing policy
- report artifact policy
- approval policy meaning

The runtime package owns:

- session lifecycle
- thread and turn transport
- approval request plumbing
- structural event extraction
- result normalization

## Good uses during the pivot

Codex is especially valuable for:

- wiki maintenance from already-registered evidence
- investigation or analysis writeups
- memo drafting
- evidence summary drafting
- report formatting assistance

Codex should **not** be treated as the raw source of financial truth.

## First F4 posture

The first F4 finance discovery answer path should **not** depend on runtime-codex.

For F4A, the control plane should:

- accept a typed company-scoped finance discovery mission
- read stored Finance Twin plus stored CFO Wiki state
- assemble the first answer deterministically and read-only
- persist the answer artifact and finance-ready proof bundle without creating a runtime thread

Codex remains valuable after that first answer path exists for:

- later investigative writeups
- wiki filing or durable note drafting
- memo or packet drafting in F5
- evidence-summary or formatting assistance when a deterministic answer already exists

## Current F5 posture

The latest shipped F5 records are `plans/FP-0044-release-log-and-first-diligence-packet-release-record-foundation.md` for F5C4D, `plans/FP-0045-board-packet-review-or-circulation-readiness-foundation.md` for F5C4E, `plans/FP-0046-circulation-log-and-first-board-packet-circulation-record-foundation.md` for F5C4F, `plans/FP-0047-board-packet-circulation-record-correction-and-chronology-foundation.md` for F5C4G, `plans/FP-0048-board-packet-circulation-actor-correction-and-chronology-hardening.md` for F5C4H, and `plans/FP-0049-board-packet-circulation-note-reset-and-effective-record-hardening.md` for F5C4I.
The shipped F5A through F5C4I slices already create first-class reporting missions from completed discovery missions, assemble one draft `finance_memo` plus one linked `evidence_appendix`, expose those stored bodies directly, reuse the existing CFO Wiki filed-page plus markdown export seams for the finance-memo path, compile draft `board_packet`, `lender_update`, and `diligence_packet` artifacts from completed reporting work without creating a runtime thread, resolve one finance-facing `report_release` approval into explicit release-readiness for both `lender_update` and `diligence_packet` without live runtime continuation, record one operator-entered release record for both `lender_update` and `diligence_packet` without introducing system delivery, resolve one board-facing `report_circulation` approval into explicit circulation-ready posture for `board_packet`, record one operator-entered external circulation record for that approved board packet without introducing system delivery, and now support explicit `circulationNote` clear-to-absent correction on that same board seam.

For shipped F5C4B, the control plane and operator surface now:

- keep numeric and factual authority in stored evidence, not in runtime output
- start only from one completed `reporting` mission with `reportKind = "lender_update"`, one stored `lender_update` artifact, and release-readiness already at `approved_for_release`
- keep `mission.type = "reporting"` and `reportKind = "lender_update"`
- reuse the existing `report_release` approval seam as the preferred release-record anchor
- add release logging and one explicit release-record posture only
- avoid live runtime continuation assumptions for finance review approvals
- keep the slice deterministic, runtime-free, and delivery-free
- keep actual send, distribute, publish, broader packet widening, bounded runtime-codex drafting, and non-markdown output formats out of the first F5C4B slice

For shipped F5C4D, the control plane and operator surface now:

- start only from one completed `reporting` mission with `reportKind = "diligence_packet"`, one stored `diligence_packet` artifact, and release-readiness already at `approved_for_release`
- keep `mission.type = "reporting"` and `reportKind = "diligence_packet"`
- widen the existing mission-scoped `reporting/release-log` seam from lender-update-only to lender-update-plus-diligence, and no broader
- reuse the existing `report_release` approval seam as the preferred persistence anchor
- add release logging and one explicit release-record posture only
- keep the slice deterministic, runtime-free, and delivery-free
- keep board-packet review or circulation posture, actual delivery, and bounded runtime-codex drafting out of the first F5C4D slice

For shipped F5C4E, the repo now:

- start only from one completed `reporting` mission with `reportKind = "board_packet"` and one stored `board_packet` artifact
- keep `mission.type = "reporting"` and `reportKind = "board_packet"`
- reuse the existing approvals bounded context but add one internal-facing `report_circulation` approval kind rather than reusing `report_release`
- add review request, approval resolution, and one circulation-ready posture only
- keep the slice deterministic, runtime-free, and delivery-free
- keep circulation logging, actual delivery, and bounded runtime-codex drafting out of the shipped F5C4E slice

Later F5 slices may use runtime-codex only in a bounded role such as draft phrasing or formatting assistance once the deterministic diligence approval, diligence release-log, board circulation-readiness, board circulation-log, and any still-justified board actor-correction foundation already exist.
Even then, runtime-codex must not invent finance facts, override stored numbers, or become the approval authority layer.

## Current F6 posture

`plans/FP-0050-monitoring-foundation-and-first-cash-posture-alert.md` is the shipped first-F6A implementation record.
F6A stays runtime-free: the first `cash_posture` monitor reads stored source-backed Finance Twin cash-posture state, evaluates deterministic freshness, missing-source, failed-source, coverage, and data-quality posture, records one monitor result, and exposes one operator-visible alert card only when conditions warrant it.

`plans/FP-0051-alert-to-investigation-mission-foundation.md` is the shipped F6B implementation record.
F6B remains runtime-free: the first handoff lets an operator manually create or open one deterministic investigation mission from one persisted `cash_posture` alert, carrying the existing alert-card source lineage, freshness or missing-source posture, severity rationale, limitations, proof posture, and human-review next step.

`plans/FP-0052-collections-pressure-monitor-foundation.md` is the shipped F6C implementation record.
F6C remains runtime-free: the shipped monitor adds exactly one deterministic `collections_pressure` monitor result plus optional alert card from stored receivables-aging or collections-posture Finance Twin state, without creating investigations or delivery behavior.

`plans/FP-0053-payables-pressure-monitor-foundation.md` is the shipped F6D implementation record.
F6D remains runtime-free: the shipped monitor adds exactly one deterministic `payables_pressure` monitor result plus optional alert card from stored payables-aging or payables-posture Finance Twin state, without creating investigations, payment instructions, vendor-payment recommendations, reports, approvals, runtime-Codex drafting, or delivery behavior.

`plans/FP-0054-policy-covenant-threshold-monitor-foundation.md` is the shipped F6E implementation record.
F6E remains runtime-free: the shipped monitor adds exactly one deterministic `policy_covenant_threshold` monitor result plus optional alert card from stored CFO Wiki policy-document posture, deterministic policy extracts, policy pages, policy-corpus posture, and explicit comparable Finance Twin posture only, without creating investigations, legal or policy advice, payment instructions, reports, approvals, runtime-Codex drafting, or delivery behavior.

`plans/FP-0055-monitor-demo-replay-and-stack-pack-foundation.md` is the shipped F6F implementation record.
F6F remains runtime-free: the shipped demo replay registers checked-in source fixtures, runs existing deterministic sync/wiki/monitor paths, compares expected outputs, and demonstrates the shipped monitor handoff boundary where applicable without creating runtime-Codex monitoring findings or investigation writeups.

`plans/FP-0056-non-cash-alert-investigation-generalization-foundation.md` is the shipped F6G implementation record.
F6G remains runtime-free: the first non-cash handoff copies stored `collections_pressure` alert posture into a taskless mission for human review only, without runtime-Codex monitoring findings or investigation writeups.

`plans/FP-0057-close-control-checklist-foundation.md` is the shipped F6H implementation record.
The shipped F6H checklist remains runtime-free: it derives deterministic checklist items from stored Finance Twin posture, stored CFO Wiki policy/source posture, and latest persisted monitor results as context only, and does not ask the Codex App Server to draft close/control writeups.

`plans/FP-0058-stack-pack-expansion-and-close-control-demo-foundation.md` is the shipped F6I implementation record.
F6I remains runtime-free: it extends the existing checked-in demo stack-pack expected outputs and deterministic replay proof with normalized close/control checklist posture, without asking the Codex App Server to draft monitoring findings, investigation writeups, checklist prose, notifications, or remediation.

`plans/FP-0059-operator-notification-readiness-foundation.md` is the shipped F6J record.
`plans/FP-0060-close-control-acknowledgement-foundation.md` is the shipped F6K record.
F6J remains runtime-free and delivery-free: it adds one deterministic internal operator attention/readiness read model over shipped stored state, but it must not ask the Codex App Server to draft notifications, monitoring findings, investigation writeups, close/control prose, remediation, delivery text, or external communications.
F6K is shipped as internal close/control acknowledgement readiness only and does not ask the Codex App Server to draft acknowledgements, approvals, close-complete statements, certification language, delivery text, reports, or finance-action instructions.
`plans/FP-0061-source-pack-expansion-foundation.md` is the shipped F6L record for one bank/card source-pack foundation.
F6L remains runtime-free and delivery-free: it proves checked-in bank-account-summary and card-expense source-pack posture through existing source registry and Finance Twin routes only, via `pnpm exec tsx tools/bank-card-source-pack-proof.mjs`, without asking the Codex App Server to interpret source truth, draft source-pack prose, generate monitor findings, create reports, send notifications, or take finance actions.
`plans/FP-0062-external-notification-delivery-planning-foundation.md` is the shipped F6M record.
F6M remains runtime-free and delivery-free: the shipped implementation derives a deterministic internal delivery-readiness read model from shipped F6J/F6K posture, and it must not ask the Codex App Server to draft notification prose, delivery text, approval language, close/certification language, reports, legal or policy advice, payment instructions, collection/customer-contact instructions, or external communications.
`plans/FP-0063-close-control-review-summary-foundation.md` is the shipped F6N record.
F6N remains runtime-free: the shipped close/control review summary derives deterministic internal review posture from shipped F6H/F6J/F6K/F6M reads only, and it does not ask the Codex App Server to draft certification language, close-complete statements, sign-off, attestation, report release text, delivery text, approval language, legal or audit opinion, policy advice, payment instructions, collection/customer-contact instructions, generated prose, or external communications.
`plans/FP-0064-receivables-payables-source-pack-foundation.md` is the shipped F6O record.
F6O remains runtime-free and delivery-free: it proves checked-in receivables-aging and payables-aging source-pack posture through existing source registry and Finance Twin routes only, via `pnpm exec tsx tools/receivables-payables-source-pack-proof.mjs`, without asking the Codex App Server to interpret source truth, draft source-pack prose, generate monitor findings, create reports, create approvals, send notifications, create collection/customer-contact instructions, create payment behavior, or take finance actions.
`plans/FP-0065-external-provider-boundary-foundation.md` is the shipped F6P record.
F6P remains runtime-free and delivery-free: it derives a deterministic internal provider-boundary/readiness result from shipped F6M/F6N read posture only, without asking the Codex App Server to draft provider prose, call providers, create provider credentials, create provider jobs, create reports, create approvals, send notifications, mutate sources, or take finance actions.
`plans/FP-0066-close-control-certification-boundary-foundation.md` is the shipped F6Q record.
F6Q remains runtime-free and delivery-free: it derives a deterministic internal close/control certification-boundary/readiness result from shipped F6N/F6P read posture only, without asking the Codex App Server to draft certification language, close-complete statements, sign-off, attestation, legal opinion, audit opinion, approval language, report release text, delivery text, provider text, generated prose, advice, instructions, external communications, or finance actions.
`plans/FP-0067-contract-obligation-source-pack-foundation.md` is the shipped F6R record.
F6R remains runtime-free and delivery-free: it proves checked-in contract-metadata source-pack posture through existing source registry and Finance Twin contract/obligation routes only, via `pnpm exec tsx tools/contract-obligation-source-pack-proof.mjs`, without asking the Codex App Server to interpret source truth, draft source-pack prose, create reports, create approvals, call providers, send notifications, or take finance actions.
`plans/FP-0068-external-delivery-human-confirmation-boundary-foundation.md` is the shipped F6S record.
F6S remains runtime-free and delivery-free: it derives a deterministic internal human-confirmation / delivery-preflight boundary from shipped F6M/F6P/F6Q/F6N read posture only, without asking the Codex App Server to draft delivery text, generated prose, provider text, approval language, certification language, report release text, external communications, or finance actions.
`plans/FP-0069-ledger-reconciliation-source-pack-foundation.md` is the shipped F6U record.
F6U remains runtime-free and delivery-free: it proves checked-in chart-of-accounts, trial-balance, and general-ledger source-pack posture through existing source registry and Finance Twin sync/read/reconciliation routes only, via `pnpm exec tsx tools/ledger-reconciliation-source-pack-proof.mjs`, without asking the Codex App Server to interpret source truth, draft source-pack prose, generate monitor findings, create reports, create approvals, certify, call providers, send notifications, or take finance actions.
`plans/FP-0070-close-control-certification-safety-foundation.md` is the shipped F6T implementation record.
F6T remains runtime-free and delivery-free: the shipped implementation derives deterministic internal certification-safety/readiness posture from shipped F6Q/F6S/F6N read services through `GET /close-control/companies/:companyKey/certification-safety`, but it does not ask the Codex App Server to draft certification language, close-complete statements, sign-off, attestation, legal opinion, audit opinion, assurance, approval language, report release text, delivery text, provider text, generated prose, advice, instructions, external communications, or finance actions.
`plans/FP-0071-policy-covenant-document-source-pack-foundation.md` is the shipped F6W implementation record.
F6W remains runtime-free and delivery-free: it proves checked-in policy/covenant document source-pack posture through existing source registry and CFO Wiki bind/compile/read routes only, via `pnpm exec tsx tools/policy-covenant-document-source-pack-proof.mjs`, without asking the Codex App Server to interpret source truth, draft source-pack prose, create reports, create approvals, certify, call providers, send notifications, or take finance actions.
`plans/FP-0072-board-lender-document-source-pack-foundation.md` is the shipped F6Y implementation record.
F6Y remains runtime-free and delivery-free: it proves checked-in board/lender document source-pack posture through existing source registry and CFO Wiki routes only, via `pnpm exec tsx tools/board-lender-document-source-pack-proof.mjs`, without asking the Codex App Server to draft board packets, lender updates, source-pack truth, delivery text, certification language, legal/audit opinions, generated prose, provider text, approval language, reports, external communications, or finance actions.
`plans/FP-0073-final-f6-v1-exit-audit-and-handoff.md` is the shipped F6Z final audit/handoff record.
F6Z remains docs-and-validation-only: it did not ask the Codex App Server to draft audit conclusions, certification language, provider text, report-release text, delivery text, generated prose, external communications, or finance actions.

The Codex App Server should not draft monitoring findings, run natural-language autonomous monitoring, create investigation writeups, draft close/control checklist prose, draft acknowledgement prose, draft close/control review-summary prose, draft source-pack truth, draft provider-boundary prose, draft certification-boundary prose, draft certification-safety prose, draft F6Z audit conclusions, draft notification messages, send notifications, publish messages, create payment instructions, recommend vendor payments, create collection instructions, interpret policy or legal obligations, or perform remediation in F6A, F6B, F6C, F6D, F6E, F6F, F6G, F6H, F6I, F6J, F6K, F6L, the shipped F6M delivery-readiness boundary, the shipped F6N review-summary foundation, the shipped F6O source-pack foundation, the shipped F6P provider-boundary foundation, the shipped F6Q certification-boundary foundation, the shipped F6R source-pack foundation, the shipped F6S human-confirmation boundary, the shipped F6U source-pack foundation, the shipped F6T certification-safety foundation, the shipped F6W source-pack foundation, the shipped F6Y source-pack foundation, or the shipped F6Z final audit/handoff record.

## Prompt ownership

Build product prompts in control-plane modules such as:

- missions
- wiki
- reporting
- approvals
- monitoring

Do not hard-code Pocket CFO product logic into the runtime transport wrapper.

## Approval and sandbox posture

As the product pivots:

- read-only analysis or lint tasks may run with a `never` approval posture
- write-capable tasks such as wiki filing or report artifact generation should request approval when the slice requires it
- network access should remain restricted by default
- runtime actions that change external communication posture must stay human-reviewable

For F5A through shipped F5C4F, draft report compilation, body exposure, finance-memo filing/export posture, the first three packet specializations, lender-update and diligence release logging, explicit release-record posture, and board circulation approval plus circulation-log posture should stay deterministic and draft-only or delivery-free as appropriate.
The most recent later-F5 shipped step is F5C4I: it keeps the original board `circulationRecord` immutable, appends correction history on the existing `report_circulation` seam, allows corrected actor attribution, and now also allows explicit `circulationNote` clear-to-absent correction in the derived effective chronology without broader delivery, export, or runtime-codex widening.
The shipped F6A record is now `plans/FP-0050-monitoring-foundation-and-first-cash-posture-alert.md`. The shipped F6B record is now `plans/FP-0051-alert-to-investigation-mission-foundation.md`. The shipped F6C record is now `plans/FP-0052-collections-pressure-monitor-foundation.md`. The shipped F6D record is now `plans/FP-0053-payables-pressure-monitor-foundation.md`. The shipped F6E record is now `plans/FP-0054-policy-covenant-threshold-monitor-foundation.md`. The shipped F6F record is now `plans/FP-0055-monitor-demo-replay-and-stack-pack-foundation.md`. The shipped F6G record is now `plans/FP-0056-non-cash-alert-investigation-generalization-foundation.md`. The shipped F6H record is now `plans/FP-0057-close-control-checklist-foundation.md`. The shipped F6I record is now `plans/FP-0058-stack-pack-expansion-and-close-control-demo-foundation.md`. The shipped F6J record is now `plans/FP-0059-operator-notification-readiness-foundation.md`. The shipped F6K record is now `plans/FP-0060-close-control-acknowledgement-foundation.md`. The shipped F6L record is now `plans/FP-0061-source-pack-expansion-foundation.md`. The shipped F6M record is now `plans/FP-0062-external-notification-delivery-planning-foundation.md` for internal delivery-readiness only. The shipped F6N record is `plans/FP-0063-close-control-review-summary-foundation.md` for an internal review summary only. The shipped F6O record is `plans/FP-0064-receivables-payables-source-pack-foundation.md` for a direct receivables/payables source-pack proof only. The shipped F6P record is `plans/FP-0065-external-provider-boundary-foundation.md` for an internal provider-boundary/readiness result only. The shipped F6Q record is `plans/FP-0066-close-control-certification-boundary-foundation.md` for an internal certification-boundary/readiness result only. The shipped F6R record is `plans/FP-0067-contract-obligation-source-pack-foundation.md` for a direct contract/obligation source-pack proof only, with proof command `pnpm exec tsx tools/contract-obligation-source-pack-proof.mjs`. The shipped F6S record is `plans/FP-0068-external-delivery-human-confirmation-boundary-foundation.md` for one deterministic internal external-delivery human-confirmation / delivery-preflight boundary only. The shipped F6U record is `plans/FP-0069-ledger-reconciliation-source-pack-foundation.md` for one deterministic ledger/reconciliation source-pack proof only, with proof command `pnpm exec tsx tools/ledger-reconciliation-source-pack-proof.mjs`. The shipped F6T record is `plans/FP-0070-close-control-certification-safety-foundation.md` for one deterministic internal certification-safety/readiness foundation only, through `GET /close-control/companies/:companyKey/certification-safety`. The shipped F6W record is `plans/FP-0071-policy-covenant-document-source-pack-foundation.md` for one deterministic policy/covenant document source-pack proof only, with direct proof command `pnpm exec tsx tools/policy-covenant-document-source-pack-proof.mjs`. The shipped F6Y record is `plans/FP-0072-board-lender-document-source-pack-foundation.md` for one deterministic board/lender document source-pack proof only, with direct proof command `pnpm exec tsx tools/board-lender-document-source-pack-proof.mjs`. The shipped F6Z record is `plans/FP-0073-final-f6-v1-exit-audit-and-handoff.md` for final audit/handoff only. `plans/FP-0074-v1-launch-readiness-and-active-doc-hardening.md` is the shipped F7 record for launch-readiness and active-doc hardening only. F6S, F6U, F6T, F6W, and F6Y shipped from their named plans and remain read-only/no-schema from the product runtime perspective; F6T is runtime-free, delivery-free, and non-certifying, while F6W and F6Y are runtime-Codex-free, delivery-free, provider-free, report-free, approval-free, certification-free, generated-prose-free, and non-autonomous. F6Z and F7 remain docs-and-validation-only. Do not create runtime-codex monitoring behavior, acknowledgement drafting, review-summary drafting, source-pack drafting, provider-boundary drafting, certification-boundary drafting, certification-safety drafting, F6Z audit-conclusion drafting, F7 launch-readiness drafting, notification prose, notification delivery, notification-provider behavior, outbox sends, scheduled delivery, auto-send, automatic mission creation, payables investigations, policy/covenant investigations, approvals, report creation, report release, report circulation, report conversion, actual certification, certified status, close-complete statements, sign-off, attestation, assurance, legal opinion, audit opinion, payment behavior, payment instructions, vendor-payment recommendations, legal or policy advice, collection instructions, customer-contact instructions, provider calls, provider credentials, provider jobs, generated prose, source mutation, autonomous action, F6V, F6X, F8, v1 launch polish, or later work from this doc alone. F6V, F6X, F8, v1 launch polish, and later planning must wait for future Finance Plans or roadmap updates.
`plans/FP-0074-v1-launch-readiness-and-active-doc-hardening.md` remains docs-and-validation-only. It did not add runtime-Codex finance actions, launch-readiness drafting, notification prose, external communication prose, provider integration, actual certification, delivery, report release, approval workflow, source mutation, finance writes, generated prose, FP-0075 during F7, or autonomous action.
`plans/FP-0075-v1-future-scope-triage-and-roadmap-hardening.md` is the shipped F8/v1 future-scope triage record. It remains docs-and-validation-only and did not add runtime-Codex finance actions, future-scope drafting, notification prose, external communication prose, provider integration, actual certification, delivery, report release, approval workflow, source mutation, finance writes, generated prose, FP-0076 during F8, F8 implementation, or autonomous action.
`plans/FP-0076-product-ui-launch-polish-foundation.md` is the active F9 product UI launch-polish foundation contract. It is docs-and-validation-only and does not add runtime-Codex finance actions, product UI drafting, notification prose, external communication prose, provider integration, actual certification, delivery, report release, approval workflow, source mutation, finance writes, generated prose, UI action controls, F9 implementation, or autonomous action.

## Transition note

The current repo still contains Pocket CTO-era terminology around planners, executors, and git worktrees.
That remains acceptable while the finance-discovery slices continue retargeting the control plane around the stable runtime seam.

Do not force a giant runtime rewrite during the finance-discovery transition.
Keep the seam stable while the finance slices land around it.
