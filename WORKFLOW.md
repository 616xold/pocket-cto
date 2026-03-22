---
name: pocket-cto-repo-workflow
workspace:
  root: .workspaces
  strategy: git-worktree
tracker:
  kind: github
  mode: webhook-plus-reconcile
agent:
  runtime: codex-app-server
  default_model: ${CODEX_DEFAULT_MODEL}
  max_turns: 12
  approval_policy: unlessTrusted
  sandbox: workspaceWrite
  network_access: restricted
policies:
  allow_auto_merge: false
  allow_deploy: false
  require_proof_bundle: true
  require_replay_events: true
  require_human_approval_for:
    - merge
    - rollback
    - deploy
    - network-escalation
hooks:
  before_run: |
    test -f package.json && echo "workspace ready"
  after_run: |
    echo "collect evidence and replay metadata"
---

# Pocket CTO repository workflow contract

This file exists for two reasons.

First, Pocket CTO itself is designed around a repository-owned workflow contract.
Second, the project should be able to dogfood that contract later.

## Intent

When an agent works on this repo, it should:

1. respect the modular package boundaries
2. keep work inside the assigned workspace or worktree
3. update the active ExecPlan while working
4. run validation before proposing completion
5. emit or preserve replay-relevant artifacts whenever new mission behavior is implemented

## Acceptance defaults

Unless an ExecPlan says otherwise, a code task in this repo is only complete when:

- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm test` passes
- touched docs are updated
- the active ExecPlan is updated
- new mission lifecycle behavior is covered by replay/event tests
- proof bundle expectations are documented for new mission outputs

## Notes

This is a seed contract.
Pocket CTO itself will later consume and enforce contracts in this shape for target repositories.
The local eval lane remains manual and outside CI: use `openai_responses` when you need official reported eval artifacts and `codex_subscription` when you want cheaper local prompt tuning through the supported Codex app-server path.
