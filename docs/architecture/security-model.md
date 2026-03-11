# Security model

Pocket CTO v1 assumes a single operator and one trust boundary.

That is a deliberate product decision, not an omission.

## v1 posture

- one operator
- one environment owner
- GitHub App permissions scoped to selected repositories
- isolated workspaces per mission task
- no automatic merge or deploy
- human approval for merge, rollback, deploy, and privilege escalation
- network access restricted by default
- evidence and replay preserved for review

## Why single-operator first

The fastest way to build something trustworthy is to harden a narrow trust boundary before pretending the system is ready for hostile multi-tenant use.

## Approval lattice

From least privilege to most privilege:

1. `read-only`
2. `patch-only`
3. `merge-eligible`
4. `deploy-eligible`

A mission should move right only when the mission type, evidence, and approvals justify it.

## Workspace rules

- one workspace or worktree per mission task
- no shared mutable workspace across unrelated missions
- keep the workspace inside `WORKSPACE_ROOT`
- keep `WORKSPACE_ROOT` itself outside the source repo checkout
- reject any workspace root that equals or is nested inside the source repo root
- reject any path escape
- attach lease ownership to running tasks

## GitHub integration rules

- use a GitHub App
- avoid personal access tokens as a durable integration mechanism
- request only the permissions required by the current milestone
- use webhooks as primary ingress and a reconciler as a safety net

## Repository implementation map

- workspace logic: `apps/control-plane/src/modules/workspaces/`
- approval logic: `apps/control-plane/src/modules/approvals/`
- GitHub integration: `apps/control-plane/src/modules/github/`
