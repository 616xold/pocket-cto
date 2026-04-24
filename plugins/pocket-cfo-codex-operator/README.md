# Pocket CFO Codex Operator

Reusable Codex plugin / skills bundle for the Pocket CFO repository.

Install one mode only.

## Plugin marketplace mode

Copy `install-as-plugin/.agents` and `install-as-plugin/plugins` into the repo root, restart Codex, open Plugins, and install/enable `pocket-cfo-codex-operator`.

## Repo-scoped skills mode

Copy `install-as-repo-skills/.agents/skills` into the repo root as `.agents/skills`.

Bundled skills:
- execplan-orchestrator
- finance-plan-orchestrator
- modular-architecture-guard
- source-provenance-guard
- cfo-wiki-maintainer
- evidence-bundle-auditor
- github-app-integration-guard
- f6-monitoring-semantics-guard
- validation-ladder-composer
- pocket-cfo-handoff-auditor

Recommended thread opener:

```text
Use the pocket-cfo-codex-operator plugin.
Invoke the relevant Pocket CFO skills for this slice.
Do not use GitHub Connector Guard unless explicitly requested.
```
