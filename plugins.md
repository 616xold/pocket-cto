# Codex Plugins

This file records the plugins available in this Codex local thread and the repo-local Pocket CFO plugin used for the FP-0117 OAuth/token/session/auth implementation sequencing, post-merge proof/source hardening, and proof-gate compatibility slice.

## Repo-local plugin used

- `pocket-cfo-codex-operator`
  - Marketplace entry: `.agents/plugins/marketplace.json`
  - Bundle path: `plugins/pocket-cfo-codex-operator/`
  - Skills invoked for this FP-0117 docs-and-plan plus proof-gate compatibility master plan, OAuth/token/session/auth implementation sequencing, protected-resource metadata readiness planning, post-merge proof/source hardening, doc-refresh, validation, and handoff slice:
    - Finance Plan Orchestrator
    - Modular Architecture Guard
    - Source Provenance Guard
    - CFO Wiki Maintainer
    - Evidence Bundle Auditor
    - F6 Monitoring Semantics Guard
    - Validation Ladder Composer
    - Pocket CFO Handoff Auditor
  - GitHub Connector Guard was not invoked because GitHub connector product behavior was out of scope.

## Installed Codex plugins available in this thread

- Browser
- Build iOS Apps
- Build macOS Apps
- Build Web Apps
- ChatGPT Apps
- Codex Security
- Documents
- Figma
- Game Studio
- GitHub
- Gmail
- OpenAI Developers
- Presentations
- Spreadsheets
- Test Android Apps

## Notes

- Routine `git` and `gh` CLI operations may be used for repository and PR metadata after validation.
- OpenAI Developers was available only as an installed plugin family; no callable read-only docs tool was exposed for this slice. It was not used to create API keys, call OpenAI APIs, call models, or widen app/runtime scope. Official OpenAI web docs were used as read-only platform context for Apps SDK authentication, deploy, Connect from ChatGPT, Security & Privacy, testing, and submission/maintain readiness. Official current/latest Model Context Protocol web docs were used as read-only protocol/security context for transports, tools, authorization, canonical resource URI, protected-resource metadata, resource indicators, WWW-Authenticate resource metadata behavior, Origin validation, token handling, token passthrough prohibition, and MCP security best practices. Vercel documentation search and Vercel project/deployment tools were not used.
- No Figma, app-submission, design-generation, OpenAI API/model-call, artifact-upload, dependency-installation, or public-asset generation plugin workflow was used for this slice.
