---
name: pocket-cfo-repo-workflow
workspace:
  root: .workspaces
  strategy: git-worktree
tracker:
  kind: source-registry-bridge
  mode: file-first
agent:
  runtime: codex-app-server
  default_model: ${CODEX_DEFAULT_MODEL}
  max_turns: 12
  approval_policy: unlessTrusted
  sandbox: workspaceWrite
  network_access: restricted
policies:
  allow_auto_merge: false
  allow_external_writes: false
  require_proof_bundle: true
  require_replay_events: true
  require_source_provenance: true
  require_freshness_posture: true
  require_human_approval_for:
    - external-report-release
    - policy-override
    - rollback
    - network-escalation
hooks:
  before_run: |
    test -f package.json && echo "workspace ready"
  after_run: |
    echo "collect evidence, provenance, and freshness metadata"
---

# Pocket CFO repository workflow contract

This file exists for two reasons.

First, Pocket CFO is designed around a repository-owned workflow contract.
Second, the project should be able to dogfood that contract later.

## Intent

When an agent works on this repo, it should:

1. respect modular package boundaries
2. keep work inside the assigned workspace or sandbox
3. update the active Finance Plan while working
4. preserve the active-doc boundary
5. run validation before proposing completion
6. emit or preserve replay-relevant artifacts whenever new mission behavior is implemented
7. never treat raw source files as mutable working memory

## Transition note

The repo still uses git-worktree-backed workspaces in the current codebase.
During the Pocket CFO pivot, that implementation is expected to generalize toward source and artifact sandboxes, but the repo must stay green while that happens.
Do not force a giant workspace rewrite inside the docs-reset phase.

## Acceptance defaults

Unless a Finance Plan says otherwise, a code task in this repo is only complete when:

- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm test` passes
- touched docs are updated
- the active Finance Plan is updated
- replay implications are covered for new mission or ingest behavior
- provenance and freshness expectations are explicit for new finance-facing outputs
- limitations are visible instead of being buried in chat

## Notes

This is the seed contract for Pocket CFO.

The active product path is:

- file-first source ingest
- deterministic twin state
- compiled wiki maintenance
- finance discovery and reporting
- evidence-linked outputs with human review where needed

GitHub connector work is allowed only when a Finance Plan says it is in scope and keeps the connector behind the generic source-registry boundary.
