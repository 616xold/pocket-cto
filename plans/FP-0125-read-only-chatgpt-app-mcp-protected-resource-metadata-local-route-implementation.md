# FP-0125 read-only ChatGPT App MCP protected-resource metadata local route implementation

FP-0125 is a narrow local-only/read-only/proof-gated implementation slice for the future read-only ChatGPT App MCP path.

It implements exactly one protected-resource metadata GET route, `/.well-known/oauth-protected-resource/mcp`, and only when app/container construction supplies an explicit FP-0123 protected-resource metadata route-input evidence bundle. Default `buildApp()` must not register this route. The route must emit only the bounded FP-0122 metadata document fields: `resource`, `authorization_servers`, `scopes_supported`, and `bearer_methods_supported`.

FP-0125 does not implement WWW-Authenticate behavior, OAuth, token/session storage, auth middleware, remote MCP deployment, deployment config, Apps SDK resources, public ChatGPT App behavior, app submission, DB queries, schemas, migrations, package scripts, fixtures, sample data, source packs, public assets, listing copy, generated public prose, OpenAI API/model calls, provider calls, external communications, source mutation, finance writes, generated finance advice, runtime-Codex finance output, autonomous action, or FP-0126.

## Progress

- [x] 2026-05-17T01:53:00Z: Confirmed preflight gates: exact requested branch, clean worktree, GitHub auth, PR #296 merged, local Postgres and MinIO available, FP-0124 present and shipped, FP-0125/FP-0126 absent before this slice, and required proof tools present.
- [x] 2026-05-17T01:53:00Z: Ran the required baseline proof ladder before edits; all direct proof commands from route-input proof through evidence-index foundation passed.
- [x] 2026-05-17T01:58:00Z: Opened FP-0125 with the local-only/read-only explicit-dependency route boundary and no public/OAuth/deployment scope.
- [x] 2026-05-17T02:12:00Z: Added explicit app/container dependency typing and route registration while preserving default `buildApp()` metadata-route absence.
- [x] 2026-05-17T02:18:00Z: Added the protected-resource metadata route module plus focused route/app tests for valid explicit evidence, missing evidence, invalid/stale prerequisite evidence, bounded response fields, GET-only behavior, and unchanged `/mcp` behavior.
- [x] 2026-05-17T02:30:00Z: Added the FP-0125 local route proof command and proof-gate bridge so exactly this local metadata route and plan are accepted while FP-0126 remains absent.
- [x] 2026-05-17T02:44:00Z: Refreshed directly stale docs, `plugins.md`, and FP-0124 shipped-state wording only where they still described FP-0125 as absent/future-only.
- [x] 2026-05-17T11:24:48Z: Ran final validation and strict same-branch QA. `git diff --check`, the new local-route proof, every required existing proof command, focused domain specs, focused control-plane specs, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current` passed. Commit, push, and PR publication remain next operational steps.
- [x] 2026-05-17T13:57:22Z: Started the targeted post-merge FP-0125 evidence-coherence hardening correction after confirming PR #297 is merged, the required branch is at shipped `origin/main`, the worktree was clean, GitHub auth and local Postgres/MinIO were available, FP-0125 and required proof tools exist, FP-0126 is absent, and the requested baseline proof ladder passed before edits.
- [x] 2026-05-17T13:57:22Z: Added semantic coherence validation before local metadata route registration so schema-valid bundles fail closed when the FP-0122 metadata document, FP-0123 canonical URI evidence, route-path decision, authorization-server evidence, exact route path, schema version, read-only scopes, or header-only bearer posture disagree. Focused validation and strict same-branch QA passed.
- [x] 2026-05-17T14:05:59Z: Final validation passed for the hardening correction: `git diff --check`, all requested read-only MCP/public/security/evidence proof commands, requested focused domain/control-plane Vitest slices, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`. Because this is a post-validation closeout edit, the documented post-closeout rerun set is required before commit.

## Official Research Ledger

- MCP Authorization specification, version 2025-11-25: protocol context for protected resource metadata discovery, `authorization_servers`, well-known metadata location, `resource`, resource indicators, token handling, and the fact that WWW-Authenticate challenge behavior is a separate mechanism not implemented in this slice.
- RFC 9728, OAuth 2.0 Protected Resource Metadata: protocol context for the protected-resource metadata document fields and well-known URI derivation.
- MCP Transports specification, version 2025-06-18: protocol context for preserving the existing `/mcp` Streamable HTTP posture, POST request behavior, optional GET/SSE posture, notification 202 behavior, and Origin validation boundary.
- MCP Security Best Practices: security context for fail-closed authorization-adjacent behavior and confused-deputy/token-handling boundaries.
- OpenAI Apps SDK Authentication: future ChatGPT App auth context that authenticated MCP servers are expected to follow the MCP authorization spec; this slice does not implement OAuth.
- OpenAI Apps SDK Security & Privacy: future app security context for least privilege, explicit consent, and avoiding secrets/tokens in surfaces; this slice emits bounded metadata only.
- OpenAI Apps SDK Deploy and Connect from ChatGPT: future deployment/connect context only; this slice does not deploy, tunnel, submit, or create public app behavior.

The OpenAI Developers read-only docs connector was not exposed in this Codex session; tool discovery only surfaced OpenAI Platform key setup tooling, which was intentionally not used. The official web docs above were used only as context.

## Decisions

- Decision: The only new route path authorized by FP-0125 is `/.well-known/oauth-protected-resource/mcp`, derived from the shipped FP-0123 route-path decision for the `/mcp` endpoint.
- Decision: The route is registered only through explicit dependency injection. Missing evidence is a no-op so default app construction remains route-absent; invalid evidence throws before route registration.
- Decision: The route serializes only the already-built FP-0122 metadata document inside the FP-0123 evidence bundle. It does not construct metadata from config, environment variables, DB queries, request state, prompts, providers, OpenAI calls, source files, or chat/user text.
- Decision: Authenticated company binding remains a prerequisite recorded in the FP-0123 bundle. It is not authority, not middleware, and not a `companyKey` route selector.
- Decision: WWW-Authenticate behavior remains separate and unimplemented. FP-0125 only adds the well-known metadata GET route.
- Decision: Route registration must now reject schema-valid but semantically incoherent FP-0123 route-input bundles before registering GET `/.well-known/oauth-protected-resource/mcp`.
- Decision: The metadata route disables Fastify's automatic HEAD shadow for this path; HEAD remains unregistered and mutating methods remain rejected, with no custom HEAD behavior added.

## Implementation Steps

1. Add optional protected-resource metadata route-input evidence dependency typing to the app container.
2. Add a thin protected-resource metadata route module that validates the FP-0123 evidence bundle and registers GET `/.well-known/oauth-protected-resource/mcp` only after validation.
3. Wire `buildApp()` to pass the optional dependency into route registration while preserving default route absence.
4. Add focused tests for default absence, explicit valid registration, invalid/stale/missing fail-closed cases, bounded response fields, no token/private material leakage, GET-only metadata route behavior, and unchanged `/mcp` behavior.
5. Add `tools/read-only-mcp-protected-resource-metadata-local-route-proof.mjs`.
6. Bridge existing proof gates so exactly this FP-0125 local route and plan are accepted while FP-0126 remains absent.
7. Refresh only directly stale active docs and `plugins.md`, plus tiny FP-0124 shipped-state closeout wording if still stale.

## Acceptance

Acceptance requires exactly one FP-0125 plan file, exactly one protected-resource metadata route path, no root or dual metadata route, default `buildApp()` route absence, explicit valid and semantically coherent evidence route registration, schema-valid but semantically incoherent evidence fail-closed before registration, bounded metadata response fields only, no token/cookie/session/credential/companyKey/proof/internal/raw finance/raw source/generated advice fields, mutating metadata-route methods rejected, unchanged `/mcp` GET/POST/notification/Origin/local dispatch behavior, no WWW-Authenticate route behavior, no OAuth/token/session/auth middleware, no remote MCP/deployment config, no Apps SDK resources/public app/app submission/public assets/listing/generated public prose, no DB/schema/migration/package/data/source-pack/provider/OpenAI/source/finance-write/autonomous-action scope, FP-0126 absence, and preserved FP-0124/0123/0122/0121/0120/0118/0117/0107/0106/0100 boundaries.

## Validation Ladder

- `git diff --check`
- `pnpm exec tsx tools/read-only-mcp-protected-resource-metadata-local-route-proof.mjs`
- All existing read-only MCP/public/security/evidence proof commands named in the FP-0125 request.
- Focused domain specs for protected-resource metadata, builder, route-input, canonical-resource, endpoint architecture, endpoint ownership, protocol envelope, evidence dispatch, public security, and related proof contracts.
- Focused control-plane specs for `/mcp` routes, service, evidence dispatcher, protected-resource metadata route, and app wiring.
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

## Closeout

Implementation and validation are complete for the local-only/read-only protected-resource metadata route at `/.well-known/oauth-protected-resource/mcp`.

Strict same-branch QA confirmed the slice added exactly one local metadata route path behind explicit FP-0123 route-input evidence dependency, preserved default `buildApp()` route absence, preserved `/mcp` GET/POST/notification/Origin/local dispatch behavior, emitted only bounded FP-0122 metadata fields, kept invalid evidence fail-closed before registration, left FP-0126 absent, and did not add WWW-Authenticate route behavior, OAuth/token/session/auth middleware, remote MCP/deployment config, Apps SDK resources, public app behavior, app submission, DB/schema/migration/package/data/source-pack/provider/OpenAI/source/finance-write/autonomous-action scope, public assets, listing copy, or generated public prose.

Commit, push, and PR publication remain the only pending operational steps.

The targeted post-merge evidence-coherence hardening correction preserves the same local-only/read-only route boundary while requiring semantic agreement between canonical URI evidence, path decision, authorization-server evidence, and bounded FP-0122 metadata document before route registration. It adds no new route, root metadata route, dual metadata route, `/mcp` behavior change, WWW-Authenticate behavior, OAuth/token/session/auth middleware, remote MCP deployment, deployment config, Apps SDK resources, public app behavior, app submission, DB/schema/package/data/source-pack work, OpenAI/model/provider calls, source mutation, finance write, generated advice, runtime-Codex finance output, autonomous action, or FP-0126.
