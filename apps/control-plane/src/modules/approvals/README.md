# Approvals bounded context

This module owns Pocket CFO approval persistence for both live Codex runtime requests and the shipped finance-facing reporting review path.

Current responsibilities:

- persist approval requests into the `approvals` table
- map Codex approval surfaces to runtime approval kinds
- persist one finance-facing `report_release` approval against one completed `lender_update` reporting mission with one stored `lender_update` artifact
- append `approval.requested`, `approval.resolved`, and `approval.release_logged` replay events when the finance-facing path uses them
- transition tasks and missions into and out of `awaiting_approval` for runtime-gated work only
- resume accepted runtime approvals only after the live app-server response handoff succeeds
- resolve or cancel runtime approvals against the live in-memory runtime session registry
- resolve `report_release` approvals as persisted, idempotent operator decisions without any live runtime continuation
- record one lender-update release log on the existing approved `report_release` seam without claiming delivery automation
- back the thin HTTP operator routes for mission approval listing, approval resolution, and finance-release-log persistence

Current approval mappings:

- `item/fileChange/requestApproval` -> `file_change`
- `item/commandExecution/requestApproval` -> `command`
- `item/commandExecution/requestApproval` with network escalation context -> `network_escalation`
- one completed `lender_update` reporting mission -> `report_release`
- `item/permissions/requestApproval` -> rejected explicitly as unsupported

Current non-goals:

- multi-process approval continuity for live runtime sessions
- worker-restart recovery for live runtime sessions
- generic approval inbox or report-release dashboard widening
- actual report delivery, PDF export, or slide export
- `diligence_packet` approval review or release-readiness until `plans/FP-0043-diligence-packet-approval-review-and-release-readiness.md` lands
- board-packet review or circulation-readiness widening

The durable source of truth is still Postgres replay plus the `approvals` row.
Live continuation remains intentionally single-process and in-memory for runtime approvals only.
The HTTP control surface only needs embedded-worker live control when resolving runtime-gated approvals that must resume a paused session.
`report_release` approvals are taskless, replay-backed, and safe to resolve in `api_only` mode because they do not resume a live runtime turn or claim delivery happened.
Today the shipped finance-facing scope is still lender-update-only for approval request, approval resolution, and release logging.
The active next plan is `plans/FP-0043-diligence-packet-approval-review-and-release-readiness.md`, which widens review and release-readiness to `diligence_packet` without changing the runtime-free and delivery-free boundary.
