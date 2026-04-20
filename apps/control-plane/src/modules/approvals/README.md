# Approvals bounded context

This module owns Pocket CFO approval persistence for both live Codex runtime requests and the first finance-facing reporting review path.

Current responsibilities:

- persist approval requests into the `approvals` table
- map Codex approval surfaces to runtime approval kinds
- persist one finance-facing `report_release` approval against one completed `lender_update` reporting mission with one stored `lender_update` artifact
- append `approval.requested` and `approval.resolved` replay events
- transition tasks and missions into and out of `awaiting_approval` for runtime-gated work only
- resume accepted runtime approvals only after the live app-server response handoff succeeds
- resolve or cancel runtime approvals against the live in-memory runtime session registry
- resolve `report_release` approvals as persisted, idempotent operator decisions without any live runtime continuation
- back the thin HTTP operator routes for mission approval listing and approval resolution

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
- actual report delivery, release logging, PDF export, or slide export

The durable source of truth is still Postgres replay plus the `approvals` row.
Live continuation remains intentionally single-process and in-memory for runtime approvals only.
The HTTP control surface only needs embedded-worker live control when resolving runtime-gated approvals that must resume a paused session.
`report_release` approvals are taskless, replay-backed, and safe to resolve in `api_only` mode because they do not resume a live runtime turn or claim delivery happened.
