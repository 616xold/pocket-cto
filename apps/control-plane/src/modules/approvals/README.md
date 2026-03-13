# Approvals bounded context

This module owns Pocket CTO approval persistence for live Codex runtime requests.

Current responsibilities in M1.6:

- persist runtime approval requests into the `approvals` table
- map Codex approval surfaces to Pocket CTO approval kinds
- append `approval.requested` and `approval.resolved` replay events
- transition tasks and missions into and out of `awaiting_approval`
- resume accepted approvals only after the live app-server response handoff succeeds
- resolve or cancel approvals against the live in-memory runtime session registry

Current approval mappings:

- `item/fileChange/requestApproval` -> `file_change`
- `item/commandExecution/requestApproval` -> `command`
- `item/commandExecution/requestApproval` with network escalation context -> `network_escalation`

Current non-goals:

- multi-process approval continuity
- worker-restart recovery for live approval sessions
- UI workflows or long-lived operator inbox state

The durable source of truth is still Postgres replay plus the `approvals` row.
The live continuation is intentionally single-process and in-memory for M1.6.
If Pocket CTO loses the live continuation after durably resolving an approval, it records
`payload.liveContinuation.status = "delivery_failed"` on that approval row and does not
pretend the task resumed.
