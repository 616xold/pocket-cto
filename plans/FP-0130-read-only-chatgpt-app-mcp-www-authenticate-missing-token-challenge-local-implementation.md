# FP-0130 add local missing-token WWW-Authenticate challenge

## Purpose / Big Picture

FP-0130 is the first narrow implementation slice after the shipped FP-0129 WWW-Authenticate challenge implementation sequencing record.

The target phase is V2AX read-only ChatGPT App/MCP local missing-token challenge implementation. The user-visible proof point is that the existing local `/mcp` route can emit a bounded `401 Unauthorized` `WWW-Authenticate: Bearer` challenge with `resource_metadata` only when app construction explicitly supplies a local/proof-gated/missing-token-only dependency. Default `buildApp()` and default `/mcp` behavior remain unchanged.

This slice is local-only, read-only, proof-gated, and missing-token-only. It is not token validation, token parsing, OAuth, token/session storage, auth middleware, remote MCP deployment, Apps SDK resource implementation, public app behavior, app submission, DB/schema/package work, source mutation, finance write, provider work, OpenAI API/model work, generated public prose, or autonomous action.

## Progress

- [x] 2026-05-17T23:51:10Z: Invoked the requested repo-local `pocket-cfo-codex-operator` skills: Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor. GitHub Connector Guard was not invoked because GitHub connector product behavior is out of scope.
- [x] 2026-05-17T23:51:10Z: Confirmed the branch is `codex/v2ax-read-only-chatgpt-app-mcp-www-authenticate-missing-token-challenge-local-implementation-v1`, the worktree was clean before edits, and PR #304 is merged to `main`.
- [x] 2026-05-17T23:51:10Z: Confirmed FP-0130 and FP-0131 were absent before opening this plan.
- [x] 2026-05-17T23:51:10Z: Ran pre-edit baseline gates for FP-0128 token-validation readiness, FP-0127 WWW-Authenticate challenge contracts, FP-0125 protected-resource metadata local route, FP-0123 route-input evidence, FP-0122 builder, FP-0120 canonical resource/auth-server readiness, the FP-0107 route-adapter proof, and focused control-plane route/app specs; all passed before implementation edits.
- [x] 2026-05-17T23:51:10Z: Applied the directly stale FP-0129 closeout/doc freshness correction in this branch after confirming PR #304 was merged.
- [x] 2026-05-17T23:51:10Z: Reviewed official MCP, RFC 9728, and OpenAI Apps SDK web docs as read-only protocol/platform context. OpenAI Developers exposed only OpenAI Platform API-key setup tools, so no OpenAI Developers doc tool, API-key flow, OpenAI API call, or model call was used.
- [x] 2026-05-17T23:51:10Z: Opened FP-0130 as the one active implementation plan for this slice.
- [x] 2026-05-18T00:28:00Z: Implemented explicit dependency typing, pure domain helper, existing `/mcp` route wiring, app wiring, and focused domain/control-plane specs.
- [x] 2026-05-18T00:28:00Z: Added the direct missing-token challenge proof command and bridged prior proof gates so exact FP-0130 is accepted while FP-0131 remains absent.
- [x] 2026-05-18T00:28:00Z: Refreshed directly stale active docs and `plugins.md` where they still described FP-0130 as absent/future-only after this slice.
- [x] 2026-05-18T01:33:00Z: Strict same-branch QA found two stale proof-test/bridge assumptions from earlier no-header slices; patched them on this same branch to allow only the exact FP-0130 missing-token seam while preserving no token runtime.
- [x] 2026-05-18T00:41:40Z: Ran strict same-branch QA and final validation; all requested proof tools, focused specs, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current` passed before the initial FP-0130 commit, push, and PR #305 publication.
- [x] 2026-05-18T00:59:08Z: PR #305 `integration-db` failed because a route-input spec inferred the FP-0130 `/mcp` route seam from dirty local `git status`; GitHub Actions checks out a clean PR tree, so the expected changed route path was empty. Patched the spec to use an explicit simulated FP-0130 route-seam branch-diff path while still reading the committed route source and preserving the no metadata-route/token/auth runtime boundaries.
- [x] 2026-05-18T00:59:08Z: Post-correction validation passed for `git diff --check`, the route-input proof, the focused route-input spec, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`, including the clean-checkout `ci:integration-db` reproduction.

## Surprises & Discoveries

- FP-0129 still had stale closeout wording saying post-closeout validation, commit, push, and PR publication remained pending. PR #304 merged on 2026-05-17, so this branch corrected that shipped-state wording before implementation.
- OpenAI Developers is installed as a plugin family, but the exposed OpenAI tool surface in this thread is API-key setup only. It is not a read-only docs surface and was not used.
- MCP Authorization and RFC 9728 support a `401 Unauthorized` `WWW-Authenticate` challenge carrying a `resource_metadata` reference. They also require real token validation, audience/resource binding, and token-passthrough prohibition for actual authenticated servers. FP-0130 implements none of that runtime.
- OpenAI Apps SDK Authentication expects authenticated MCP servers to perform full resource-server checks once ChatGPT sends a bearer token. FP-0130 deliberately fails closed when an `Authorization` header is present instead of treating it as authenticated.
- Earlier no-header proof checks needed exact FP-0130 bridge compatibility after the route seam landed. The correction remained proof/test-only and did not broaden token-validation, OAuth, metadata-route, or public-app behavior.
- PR #305 CI exposed that one proof spec was too coupled to a dirty local worktree. The stable fix is to simulate the exact FP-0130 route-seam branch diff inside the proof test and continue reading the committed route implementation for route-count, challenge-seam, and metadata-route drift assertions.

## Decision Log

- Decision: FP-0130 may start because PR #304 is merged, FP-0129 is shipped after same-branch freshness polish, FP-0130/FP-0131 were absent, active docs support FP-0129 as a shipped sequencing record, and all required pre-edit proof gates passed.
- Decision: The explicit app/container dependency will be named to make the local/proof-gated/missing-token-only boundary obvious. It will be absent by default and passed into the existing `/mcp` route registration only through `buildApp({ container })`.
- Decision: Missing `Authorization` on `POST /mcp` emits a bounded `401` challenge only when the explicit dependency is present and valid. The challenge uses the shipped local metadata route reference `/.well-known/oauth-protected-resource/mcp`.
- Decision: Requests with any `Authorization` header fail closed with a bounded no-token-validation-runtime response in the explicit challenge mode. They do not authenticate, and the route does not parse, decode, validate, introspect, store, forward, or rely on the header value.
- Decision: `GET /mcp`, default `POST /mcp` JSON-RPC handling, notifications, Origin validation, initialized/ping/tools/list/tools/call semantics, and the protected-resource metadata route behavior remain unchanged.
- Decision: This slice may add proof-gate compatibility for exact FP-0130 and must keep FP-0131 absent. It must not broaden prior proof gates into general future-plan acceptance.

## Context and Orientation

FP-0125 shipped the local protected-resource metadata route at `/.well-known/oauth-protected-resource/mcp`, registered only when app construction supplies valid FP-0123 route-input evidence. Default `buildApp()` leaves that route absent.

FP-0127 shipped proof-only WWW-Authenticate contract helpers for Bearer `resource_metadata` challenge shape, no-token-leakage, local-vs-public metadata reference posture, and no-runtime boundaries.

FP-0128 shipped proof-only token-validation failure readiness contracts and hardened inventory scans proving no token validation/parsing/session/auth runtime.

FP-0129 shipped the sequencing decision that missing-token challenge behavior may be the first implementation candidate before token-validation runtime, but only as a local, explicit-dependency, missing-token route-emission slice with no token runtime.

Official read-only protocol and platform context used by this plan:

- Model Context Protocol Authorization specification, 2025-06-18: protocol context for HTTP authorization, bearer token placement, token validation/audience requirements, token-passthrough prohibition, and authorization error status posture.
- Model Context Protocol Transports specification, draft/current pages: protocol context for preserving Streamable HTTP `/mcp`, POST/GET method posture, Origin validation, and local transport boundaries.
- Model Context Protocol Security Best Practices, 2025-06-18: security context for token passthrough prohibition, scope minimization, precise challenges, and local server protection.
- RFC 9728, OAuth 2.0 Protected Resource Metadata, April 2025: standards context for protected-resource metadata, `resource_metadata`, `WWW-Authenticate`, metadata route derivation, validation, and publication risk.
- OpenAI Apps SDK Authentication: platform context for `401` challenges, `resource_metadata`, bearer token attachment, and future token verification responsibility.
- OpenAI Apps SDK Deploy your app, Connect from ChatGPT, Test your integration, Submit and maintain your app, App submission guidelines, and Security & Privacy: platform context for why public HTTPS `/mcp`, developer-mode testing, submission prerequisites, CSP, listing/review requirements, secrets/data handling, and public app behavior remain out of scope.

GitHub connector product behavior is out of scope. Routine `git`, `gh`, push, and PR operations are repository operations, not product GitHub connector work.

## Plan of Work

Implement one local route-behavior seam in the existing control-plane `/mcp` route. Keep the domain helper pure, app wiring explicit, and routes thin.

The domain package owns the explicit dependency schema, bounded challenge header construction, response body contracts, and no-leakage checks. `apps/control-plane/src/lib/types.ts` exposes the optional dependency in the app container. `apps/control-plane/src/app.ts` passes it into the existing route registration. `apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts` applies only the missing-token challenge and authorization-present fail-closed behavior before JSON-RPC dispatch, and only when the dependency is present and valid.

## Concrete Steps

1. Add a pure `packages/domain/src/read-only-app-mcp-www-authenticate-missing-token-challenge.ts` helper under the existing WWW-Authenticate bounded context.
2. Export the helper through `packages/domain/src/read-only-app-mcp-www-authenticate.ts`.
3. Add optional `readOnlyAppMcpLocalProofGatedMissingTokenChallenge` typing to `apps/control-plane/src/lib/types.ts`.
4. Pass that dependency from `buildApp({ container })` to `registerReadOnlyAppMcpEndpointRoutes` in `apps/control-plane/src/app.ts`.
5. Update `apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts` to validate the explicit dependency at registration and gate `POST /mcp` before dispatch only in explicit challenge mode.
6. Add focused domain, route, and app specs for default behavior unchanged, explicit missing-token challenge, authorization-present fail-closed posture, no protected-resource metadata drift, no new route path, no token/OAuth/auth/storage runtime, no forbidden scope, and FP-0131 absence.
7. Add `tools/read-only-mcp-www-authenticate-missing-token-challenge-proof.mjs`.
8. Update existing proof-gate bridges only as needed so exact FP-0130 is accepted and FP-0131 remains absent.
9. Refresh directly stale active docs and `plugins.md` only if they still describe FP-0130 as absent/future-only after implementation.
10. Close out FP-0130, run final validation, commit once, push, and create the PR.

## Validation and Acceptance

Acceptance requires:

- exactly one FP-0130 file exists at `plans/FP-0130-read-only-chatgpt-app-mcp-www-authenticate-missing-token-challenge-local-implementation.md`
- FP-0131 remains absent
- default `buildApp()` does not emit `WWW-Authenticate`
- default `GET /mcp` remains `405` with `Allow: POST`
- default `POST /mcp` initialize, ping, tools/list, tools/call, notifications, local dispatch, and Origin boundary remain unchanged
- explicit valid dependency enables only missing-token `POST /mcp` challenge behavior
- missing `Authorization` returns bounded `401` with exact Bearer `resource_metadata` challenge referencing `/.well-known/oauth-protected-resource/mcp`
- challenge body and header contain no token values, cookies, sessions, credentials, client secrets, authorization-header values, companyKey authority, user/org selectors, raw finance/source dumps, proof internals, listing/app-submission copy, generated public prose, generated finance advice, provider credentials, or OpenAI keys
- requests with an `Authorization` header fail closed and do not authenticate
- no token parsing, decoding, validation, introspection, storage, session handling, forwarding, OAuth, auth middleware, remote MCP deployment, deployment config, Apps SDK resource, app submission, DB query, schema/migration, package script, fixture, source pack, public asset, OpenAI API/model call, provider call, source mutation, finance write, external communication, generated public prose, or autonomous action is added
- protected-resource metadata route behavior remains unchanged
- no new route path, root metadata route, or dual metadata route is added
- FP-0129/0128/0127/0125/0123/0122/0120/0107/0106/0100 boundaries remain proven

Validation command set:

```bash
git diff --check
pnpm exec tsx tools/read-only-mcp-www-authenticate-missing-token-challenge-proof.mjs
pnpm exec tsx tools/read-only-mcp-token-validation-readiness-proof.mjs
pnpm exec tsx tools/read-only-mcp-www-authenticate-auth-challenge-proof.mjs
pnpm exec tsx tools/read-only-mcp-protected-resource-metadata-local-route-proof.mjs
pnpm exec tsx tools/read-only-mcp-protected-resource-metadata-route-input-proof.mjs
pnpm exec tsx tools/read-only-mcp-protected-resource-metadata-builder-proof.mjs
pnpm exec tsx tools/read-only-mcp-canonical-resource-auth-server-proof.mjs
pnpm exec tsx tools/read-only-mcp-protected-resource-metadata-proof.mjs
pnpm exec tsx tools/read-only-mcp-oauth-implementation-sequencing-proof.mjs
pnpm exec tsx tools/read-only-mcp-route-adapter-proof.mjs
pnpm exec tsx tools/read-only-public-app-security-boundary-proof.mjs
pnpm exec tsx tools/read-only-mcp-protocol-envelope-proof.mjs
pnpm exec tsx tools/read-only-endpoint-route-ownership-proof.mjs
pnpm exec tsx tools/read-only-endpoint-architecture-proof.mjs
pnpm exec tsx tools/read-only-chatgpt-app-mcp-proof.mjs
pnpm exec tsx tools/benchmark-community-pack-proof.mjs
pnpm exec tsx tools/bounded-llm-orchestration-proof.mjs
pnpm exec tsx tools/read-only-evidence-app-proof.mjs
pnpm exec tsx tools/document-precision-foundation-proof.mjs
pnpm exec tsx tools/evidence-index-foundation-proof.mjs
pnpm --filter @pocket-cto/domain exec vitest run src/read-only-app-mcp-token-validation.spec.ts src/read-only-app-mcp-www-authenticate.spec.ts src/read-only-app-mcp-www-authenticate-boundary-hardening.spec.ts src/read-only-app-mcp-protected-resource-metadata.spec.ts src/read-only-app-mcp-protected-resource-metadata-route-input.spec.ts
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/read-only-app-mcp-endpoint/routes.spec.ts src/modules/read-only-app-mcp-endpoint/service.spec.ts src/modules/read-only-app-mcp-endpoint/evidence-dispatcher.spec.ts src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.spec.ts src/app.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

If a post-validation doc closeout edit is made, rerun at minimum `git diff --check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.

## Idempotence and Recovery

This slice is idempotent because the new behavior is entirely gated by an explicit dependency that is absent by default. Retrying the implementation should preserve default route behavior and only replace the exact bounded helper, tests, docs, and proof command.

If validation finds route drift, remove or narrow the route change and rerun focused route/app specs plus all proof gates. If a prior proof gate rejects exact FP-0130, patch only the proof-gate bridge needed for exact FP-0130 and FP-0131 absence. If unrelated dirty files, missing services, missing proof tools, or auth failures appear, stop and report the smallest safer correction.

Rollback is straightforward: remove the FP-0130 helper, route wiring, tests, proof command, and direct docs refresh, then restore the FP-0129 shipped-state correction only if the branch is being abandoned before commit.

## Artifacts and Notes

Expected artifacts:

- `plans/FP-0130-read-only-chatgpt-app-mcp-www-authenticate-missing-token-challenge-local-implementation.md`
- domain missing-token challenge helper and specs
- control-plane route/app wiring and specs
- `tools/read-only-mcp-www-authenticate-missing-token-challenge-proof.mjs`
- direct active-doc/plugin freshness updates only if stale after implementation

Replay implication: this route/auth-adjacent slice does not create mission state changes, ingest actions, reports, approvals, monitoring outputs, external communications, source mutations, or finance writes. No replay event is required.

Evidence/provenance implication: the slice emits only an auth challenge and bounded non-financial failure bodies. It does not create finance answers, CFO Wiki output, derived twin state, evidence bundles, source snapshots, freshness posture changes, or limitations about company data. It preserves the existing protected-resource metadata route as the only local metadata evidence surface.

No new environment variables, package scripts, migrations, fixtures, source packs, public assets, screenshots, images, app-submission assets, provider calls, OpenAI API/model calls, or external artifacts are added.

## Interfaces and Dependencies

Domain boundary: pure contracts/helpers under `packages/domain/src/read-only-app-mcp-www-authenticate*`.

Control-plane boundary: app construction typing/wiring in `apps/control-plane/src/lib/types.ts` and `apps/control-plane/src/app.ts`, plus thin route behavior in `apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts`.

Runtime dependency: the route may only use the explicit `readOnlyAppMcpLocalProofGatedMissingTokenChallenge` object supplied by app construction. It must not read config/env, call DB, call providers, call OpenAI, load sources, mutate evidence, write finance state, or construct protected-resource metadata.

Upstream proof dependencies: FP-0129, FP-0128, FP-0127, FP-0125, FP-0123, FP-0122, FP-0120, FP-0107, FP-0106, and FP-0100 must remain proven. FP-0131 must remain absent.

## Outcomes & Retrospective

FP-0130 implemented the local-only/read-only explicit-dependency missing-token `WWW-Authenticate` challenge seam for existing `POST /mcp`.

The implementation keeps default `buildApp()` and default `/mcp` behavior unchanged. The challenge dependency is absent by default and must be supplied through explicit app construction input before any challenge can be emitted. Missing `Authorization` returns a bounded `401` Bearer `resource_metadata` challenge only in explicit challenge mode. Authorization-present requests fail closed with a bounded no-token-validation-runtime response and do not authenticate.

The slice preserved the protected-resource metadata route posture, added no route path, and added no token parsing, token validation, token/session storage, OAuth, auth middleware, remote MCP deployment, deployment config, Apps SDK resources, app submission, DB/schema/package/data/source-pack/public-asset/OpenAI/provider/source/finance-write/autonomous-action scope, or FP-0131.

Same-branch FP-0129 closeout freshness polish was applied because the shipped FP-0129 record still described post-closeout publication work as pending even though PR #304 was merged.

PR #305 initially failed `integration-db` because a route-input spec depended on dirty local `git status` to identify the FP-0130 `/mcp` route seam. The CI correction replaces that brittle dirty-worktree assertion with an explicit simulated FP-0130 route-seam branch-diff input while preserving committed route-source checks and all no-token-runtime/no-metadata-route-drift boundaries.

Post-correction validation passed locally, including the clean-checkout `pnpm ci:repro:current` run that exercises `ci:integration-db`.
