---
name: github-app-integration-guard
description: Use when implementing GitHub webhooks, repository sync, installation auth, or repo-content ingestion. Enforces GitHub App-first integration, least privilege, webhook signature verification, installation-token caching, and connector-only scope inside Pocket CFO.
---

# GitHub App Integration Guard

Pocket CFO is **not** GitHub-first anymore.
GitHub remains useful, but only as an optional connector.

This skill keeps the integration secure, modular, and out of the product center.

## Trigger when

Use this skill when touching:

- webhook ingestion
- GitHub App authentication
- installation token generation or caching
- repository-content sync
- branch, commit, pull request, or check-run integration
- GitHub-specific env vars or permissions
- migration code that bridges legacy GitHub modules into a generic source-registry boundary

Do not use this skill when touching:

- unrelated UI work
- generic finance mission domain types
- source-registry code with no GitHub dependency

## Rules

1. Prefer a GitHub App over PAT-based flows.
2. Keep GitHub behind a connector boundary, not in the primary finance domain model.
3. Verify webhook signatures before processing payloads.
4. Scope installation tokens to the minimum repositories and permissions needed.
5. Cache installation tokens until expiry and refresh on demand.
6. Keep transport, auth, and repo operations in separate modules.
7. Make webhook handling idempotent.
8. Persist installation metadata and external ids explicitly.
9. Emit replay or outbox events for user-visible GitHub side effects.
10. Document any new app permissions and webhook subscriptions.
11. Do not let GitHub assumptions leak into mission intake, proof bundles, or the source-of-truth model.

## Suggested module split

- `webhook-routes.ts` for Fastify transport only
- `signature.ts` for webhook verification
- `auth.ts` for JWT and installation-token logic
- `client.ts` for GitHub API operations
- `repository.ts` for local persistence
- `service.ts` for orchestration-facing behavior

## Final checks

Before finishing, verify:

- no webhook path performs business logic inline
- app permissions are documented
- installation tokens are not stored as long-lived secrets
- repo access is installation-scoped
- the active Finance Plan explains why GitHub work is needed for Pocket CFO
- GitHub remains a connector, not the product identity
