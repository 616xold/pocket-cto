# Workspaces bounded context

This module owns task-isolated workspace lifecycle for the control plane.
Keep git command execution, deterministic naming, lease handling, and workspace persistence here instead of spreading them across orchestrator or runtime modules.

Current responsibilities:

- resolve the single local source repo root used before M2 GitHub integration
- create or reuse deterministic git worktrees per task
- persist workspace records and `mission_tasks.workspace_id`
- enforce lease ownership and expiry rules
- provide the runtime `cwd` used by worker execution
