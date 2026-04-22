# Seeded finance missions

Pocket CFO should benchmark trusted finance work, not generic “AI CFO” vibes.

This file defines the first seeded mission families the product should benchmark and grade, including the shipped F4A through F4C2 discovery baseline below.

## Why these matter

The product thesis is evidence-native finance discovery and decision support.
Seeded missions should therefore stress:

- provenance
- freshness honesty
- numeric consistency
- limitation handling
- artifact quality
- reproducibility

## Recommended seeded mission families

### 1. Source registration and ingest proof

Input:
A mixed bundle of finance exports and docs.

Success:
The system registers each file as source truth, records checksums and ingest status, and emits an operator-readable ingest proof artifact.

### 2. F4A cash-posture answer

Input:
Stored bank-account summary state plus the related deterministic wiki context.

Success:
The system returns a typed `cash_posture` answer with freshness posture, route-backed evidence, related wiki pages, and clear limitations.

### 3. F4B posture, aging, spend, and obligation answers

Input:
Stored receivables-aging, payables-aging, spend, or contract-obligation state plus the related deterministic wiki context.

Success:
The system answers narrow typed questions such as `collections_pressure`, `payables_pressure`, `spend_posture`, or `obligation_calendar_review` from stored state with explicit freshness and limitations.

### 4. F4C policy lookup

Input:
One explicit `policySourceId` bound as `policy_document` for the company plus the stored deterministic wiki state for that same source; generic SOP docs or board materials do not count unless they are intentionally bound that way.

Success:
The system answers a typed `policy_lookup` question from the scoped policy page, same-source digest history when useful, `concepts/policy-corpus` when useful, and bound-source extract status, with a truthful limited answer whenever the latest extract is missing, unsupported, or failed.

### 5. F5A draft finance memo compilation

Input:
A completed discovery mission plus its stored `discovery_answer`, proof bundle, and relevant route or wiki context.

Success:
The system creates a first-class reporting mission that produces one draft `finance_memo` plus one linked `evidence_appendix`, with linked evidence, freshness notes, visible limitations, and explicit draft-only posture.

### 6. F5B draft report body, filed artifact, and markdown export posture

Input:
One completed reporting mission that already stores a draft `finance_memo`, a linked `evidence_appendix`, and company-scoped CFO Wiki state with the existing filed-page and export seams.

Success:
The system renders the stored memo and appendix bodies directly in mission detail, lets an operator explicitly file those stored drafts into the CFO Wiki through the existing filed-page route, and shows filing plus markdown export posture separately from proof readiness.

### 7. F5C1 board packet specialization and draft review foundation

Input:
One completed reporting mission that already stores a draft `finance_memo`, a linked `evidence_appendix`, and the carried freshness, limitations, route, and wiki context from completed reporting work.

Success:
The system creates one draft `board_packet` from that completed reporting mission only, keeps `mission.type = "reporting"` and specializes through `reportKind`, preserves carried freshness and limitations, and presents the packet as review-ready draft output without lender or diligence specialization, release workflow, runtime-codex drafting, or PDF or slide export.

### 8. F5C2 lender update specialization and draft review foundation

Input:
One completed reporting mission that already stores a draft `finance_memo`, a linked `evidence_appendix`, and the carried freshness, limitations, route, and wiki context from completed reporting work.

Success:
The system creates one draft `lender_update` from that completed reporting mission only, keeps `mission.type = "reporting"` and specializes through `reportKind`, preserves carried freshness and limitations, and presents the packet as review-ready draft output without diligence specialization, release workflow, runtime-codex drafting, filing or export expansion, or PDF or slide export.

### 9. F5C3 diligence packet specialization and draft review foundation

Input:
One completed reporting mission that already stores a draft `finance_memo`, a linked `evidence_appendix`, and the carried freshness, limitations, route, and wiki context from completed reporting work.

Success:
The system creates one draft `diligence_packet` from that completed reporting mission only, keeps `mission.type = "reporting"` and specializes through `reportKind`, preserves carried freshness and limitations, and presents the packet as review-ready draft output without approval-release workflow, runtime-codex drafting, filing or export expansion, or PDF or slide export.

### 10. F5C4A approval review and first lender update release readiness

Input:
One completed `reporting` mission with `reportKind = "lender_update"`, one stored `lender_update` artifact, and the carried freshness, limitations, route, and wiki context from completed reporting work.

Success:
The system persists one finance-facing `report_release` approval request for that completed lender-update reporting mission, resolves it without live runtime continuation, derives release-readiness as `not_requested`, `pending_review`, `approved_for_release`, or `not_approved_for_release`, and presents that reviewer trace without send, distribute, publish, release-log, runtime-codex drafting, or PDF or slide export behavior.

### 11. F5C4B release log and first lender update release record foundation

Input:
One completed `reporting` mission with `reportKind = "lender_update"`, one stored `lender_update` artifact, derived release-readiness already at `approved_for_release`, and the carried freshness, limitations, route, and wiki context from completed reporting work.

Success:
The system records one explicit external-release record for that already-approved lender update, surfaces one release-logged posture plus `releasedAt`, `releasedBy`, and minimal release-channel metadata, preserves the original approval trace, and does so without send, distribute, publish, broader packet approval widening, runtime-codex drafting, or PDF or slide export behavior.

### 12. F5C4C diligence-packet approval review and release readiness

Input:
One completed `reporting` mission with `reportKind = "diligence_packet"`, one stored `diligence_packet` artifact, and the carried freshness, limitations, route, and wiki context from completed reporting work.

Success:
The system persists one finance-facing `report_release` approval request for that completed diligence-packet reporting mission, resolves it without live runtime continuation, derives release-readiness as `not_requested`, `pending_review`, `approved_for_release`, or `not_approved_for_release`, and presents that reviewer trace without send, distribute, publish, release-log, board-packet circulation widening, runtime-codex drafting, or PDF or slide export behavior.

### 13. F5C4D release log and first diligence-packet release record foundation

Input:
One completed `reporting` mission with `reportKind = "diligence_packet"`, one stored `diligence_packet` artifact, derived release-readiness already at `approved_for_release`, and the carried freshness, limitations, route, and wiki context from completed reporting work.

Success:
The system records one explicit external-release record for that already-approved diligence packet, surfaces one release-logged posture plus `releasedAt`, `releasedBy`, and minimal release-channel metadata, preserves the original approval trace, and does so without send, distribute, publish, board-packet circulation widening, runtime-codex drafting, or PDF or slide export behavior.

### 14. F5C4E board-packet review or circulation-readiness foundation

Input:
One completed `reporting` mission with `reportKind = "board_packet"`, one stored `board_packet` artifact, and the carried freshness, limitations, route, and wiki context from completed reporting work.

Success:
The system persists one finance-facing `report_circulation` approval request for that completed board-packet reporting mission, resolves it without live runtime continuation, derives circulation readiness as `not_requested`, `pending_review`, `approved_for_circulation`, or `not_approved_for_circulation`, and presents that reviewer trace without circulation logging, send, distribute, publish, runtime-codex drafting, or PDF or slide export behavior.

### 15. F5C4F circulation log and first board-packet circulation-record foundation

Input:
One completed `reporting` mission with `reportKind = "board_packet"`, one stored `board_packet` artifact, derived circulation readiness already at `approved_for_circulation`, and the carried freshness, limitations, route, and wiki context from completed reporting work.

Success:
The system records one explicit circulation record for that already-approved board packet, surfaces one circulated posture plus `circulatedAt`, `circulatedBy`, and minimal circulation-channel metadata, preserves the original approval trace, and does so without send, distribute, publish, runtime-codex drafting, or PDF or slide export behavior.

## Blocked for now

These discovery families should stay out of the shipped F4A through F4C2 baseline and out of early seeded-finance grading until new deterministic Finance Twin support exists:

- `receivables_aging_review`
- `payables_aging_review`
- `runway`
- `burn_variance`
- `concentration`
- `covenant_risk`
- `anomaly_review`
- `spend_exceptions` based on policy scoring or exception inference

## Rubric dimensions

Each seeded mission should be graded on:

- groundedness
- citation completeness
- freshness disclosure
- numeric consistency
- limitation honesty
- artifact completeness
- rerun reproducibility
- operator touch time

## Implementation note

During the early pivot, the repo may still carry legacy engineering eval commands.
Keep the eval harness architecture, but replace the scenarios and rubrics with finance-oriented datasets as F4/F5 land.
The current finance-native eval-hook proof for the shipped F4A through F4C2 discovery baseline is `pnpm eval:finance-discovery-quality`, which reuses the deterministic `pnpm smoke:finance-discovery-quality:local` ladder rather than a model-scored runtime eval.
The shipped F5C3 reporting benchmark contract now lives in `plans/FP-0040-diligence-packet-specialization-and-draft-review-foundation.md`.
The shipped F5C4A reporting benchmark contract now lives in `plans/FP-0041-approval-review-and-first-lender-update-release-readiness.md`.
The shipped F5C4B reporting benchmark contract now lives in `plans/FP-0042-release-log-and-first-lender-update-release-record-foundation.md`.
The shipped F5C4C reporting benchmark contract now lives in `plans/FP-0043-diligence-packet-approval-review-and-release-readiness.md`.
The shipped F5C4D reporting benchmark contract now lives in `plans/FP-0044-release-log-and-first-diligence-packet-release-record-foundation.md`.
The shipped F5C4E reporting benchmark contract now lives in `plans/FP-0045-board-packet-review-or-circulation-readiness-foundation.md`.
The shipped F5C4F reporting benchmark contract now lives in `plans/FP-0046-circulation-log-and-first-board-packet-circulation-record-foundation.md`.
The latest shipped reporting benchmark contract now lives in `plans/FP-0047-board-packet-circulation-record-correction-and-chronology-foundation.md`, which adds immutable circulation-record correction plus chronology on the existing `report_circulation` seam.
`plans/FP-0048-board-packet-circulation-actor-correction-and-chronology-hardening.md` is now the active F5C4H benchmark contract and already covers shipped optional corrected `circulatedBy` plus derived effective actor chronology on that same seam only; keep any remaining board work inside that narrow boundary.
