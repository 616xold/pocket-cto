# Codex Plugins

This file records the plugins available in this Codex local thread and the repo-local Pocket CFO plugin used for the FP-0130 missing-token WWW-Authenticate challenge implementation slice.

## Repo-local plugin used

- `pocket-cfo-codex-operator`
  - Marketplace entry: `.agents/plugins/marketplace.json`
  - Bundle path: `plugins/pocket-cfo-codex-operator/`
  - Skills invoked for this FP-0130 local-only/read-only explicit-dependency missing-token `WWW-Authenticate` challenge slice covering existing `/mcp` route wiring, default `buildApp()` and default `/mcp` preservation, Authorization-present fail-closed no-token-validation posture, FP-0129 sequencing preservation, FP-0128 token-validation readiness preservation, FP-0127 WWW-Authenticate auth-challenge preservation, FP-0126 sequencing preservation, FP-0125 protected-resource metadata route and evidence-coherence preservation, no OAuth/token/session/auth middleware or token validation runtime, no remote/public/App SDK/app-submission scope, FP-0131 absence, proof-gate bridge, direct stale-doc refresh, validation, and handoff:
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
- OpenAI Developers was available only as an installed plugin family; tool discovery exposed only OpenAI Platform API-key setup tools, not callable read-only docs. It was not used to create API keys, call OpenAI APIs, call models, or widen app/runtime scope. Official OpenAI web docs were used as read-only platform context for MCP authorization, Apps SDK authentication, security/privacy, deploy, and submission posture only. Official Model Context Protocol web docs and RFC 9728 were used as read-only protocol/security context for transports, authorization, canonical resource URI, protected-resource metadata fields, resource indicators, WWW-Authenticate resource metadata behavior, Origin validation, token handling, token passthrough prohibition, bearer methods, route derivation, and MCP security best practices. Vercel documentation search and Vercel project/deployment tools were not used.
- No Figma, app-submission, design-generation, OpenAI API/model-call, artifact-upload, dependency-installation, or public-asset generation plugin workflow was used for this slice.
