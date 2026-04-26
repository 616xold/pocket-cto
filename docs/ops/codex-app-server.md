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

The Codex App Server should not draft monitoring findings, run natural-language autonomous monitoring, create investigation writeups, send notifications, publish messages, or perform remediation in F6A.
Investigation missions are deferred to F6B unless FP-0050 is explicitly amended in a later thread.

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
The shipped F6A record is now `plans/FP-0050-monitoring-foundation-and-first-cash-posture-alert.md`. Do not create FP-0051, investigation missions, or runtime-codex monitoring behavior from this doc alone.

## Transition note

The current repo still contains Pocket CTO-era terminology around planners, executors, and git worktrees.
That remains acceptable while the finance-discovery slices continue retargeting the control plane around the stable runtime seam.

Do not force a giant runtime rewrite during the finance-discovery transition.
Keep the seam stable while the finance slices land around it.
