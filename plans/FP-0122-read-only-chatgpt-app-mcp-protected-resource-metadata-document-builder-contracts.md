# FP-0122 read-only ChatGPT App MCP protected-resource metadata document-builder contracts

## Purpose / Big Picture

FP-0122 is a local/proof-only/read-only contract foundation for protected-resource metadata document-builder and future route-response contract work after FP-0121.

The target phase is V2AP. This slice exists because FP-0118 proved protected-resource metadata and auth challenge readiness contracts, FP-0119 planned protected-resource metadata route implementation sequencing, FP-0120 proved canonical public MCP resource URI and `authorization_servers` readiness contracts, and FP-0121 planned protected-resource metadata route implementation readiness without implementing routes.

The next safe step is not route implementation. FP-0122 implements only pure domain contracts and proof tooling for a protected-resource metadata document-builder. It does not add a protected-resource metadata endpoint. It does not add route paths. It does not implement WWW-Authenticate route behavior. It does not implement OAuth. It does not implement token/session. It does not implement auth middleware. It does not deploy remote MCP. It does not add deployment config. It does not add Apps SDK resources. It does not change /mcp behavior. It does not add public ChatGPT App behavior, app submission, public assets, listing copy, generated public prose, DB queries, schemas, migrations, package scripts, fixtures, sample data, source packs, provider calls, OpenAI API/model calls, external communications, source mutation, finance writes, generated finance advice, runtime-Codex finance output, autonomous action, or FP-0123. It does not create FP-0123. FP-0123 absent remains a proof condition.

Post-merge hardening keeps that same local/proof-only/read-only boundary and closes one contract gap: canonical resource URI and `authorization_servers` inputs now fail closed when URL userinfo, username/password credentials, Basic/Bearer-style authority material, API-key-like tokens, JWT-looking material, or secret-like authority/path text appears in metadata-builder inputs or adjacent canonical URI validation.

## Progress

- [x] 2026-05-16T20:06:53Z: Invoked Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor from the repo-local Pocket CFO operator bundle. GitHub Connector Guard was not invoked because GitHub connector product behavior is out of scope.
- [x] 2026-05-16T20:06:53Z: Confirmed work is on `codex/v2ap-read-only-chatgpt-app-mcp-protected-resource-metadata-document-builder-contracts-local-v1`, PR #291 is merged, FP-0121 exists, FP-0122 and FP-0123 were absent before this slice, and the existing proof ladder passed before edits.
- [x] 2026-05-16T20:06:53Z: Used official MCP, RFC 9728, and OpenAI Apps SDK web documentation as read-only context. OpenAI Developers tool discovery exposed only API-key setup tools, so no OpenAI API key setup, API call, model call, provider call, upload, deployment, screenshot, public asset, or app-submission workflow was used.
- [x] 2026-05-16T20:21:23Z: Created pure domain protected-resource metadata builder contracts, builder functions, focused specs, and direct proof tooling.
- [x] 2026-05-16T20:21:23Z: Bridged existing proof gates so exact FP-0122 local builder contracts are accepted while FP-0123 remains absent.
- [x] 2026-05-16T20:30:00Z: Refreshed directly stale active docs and `plugins.md` so FP-0121 is shipped and FP-0122 was then the active contract/proof slice.
- [x] 2026-05-16T20:35:37Z: Focused validation, strict same-branch QA, final validation, and `pnpm ci:repro:current` passed before this closeout edit. This closeout edit requires the documented post-validation rerun set before the one commit, push, and PR.
- [x] 2026-05-16T21:48:18Z: Started targeted post-merge FP-0122 credential/userinfo hardening correction on `codex/v2ap-read-only-chatgpt-app-mcp-protected-resource-metadata-builder-credential-hardening-local-v1` after confirming PR #292 is merged to `main`, the branch is at shipped `origin/main`, the worktree was clean, GitHub auth and local Postgres/MinIO were available, FP-0122 and required proof tools exist, FP-0123 is absent, and the requested baseline proof ladder passed before edits.
- [x] 2026-05-16T21:48:18Z: Hardened canonical resource URI and metadata-builder `authorization_servers` validation so URL userinfo credentials, Basic/Bearer-style authority material, API-key-like tokens, JWT-looking material, and secret-like authority/path text fail closed while preserving the credential-free provider-neutral accepted examples.
- [x] 2026-05-16T21:48:18Z: Added focused builder/canonical validation specs and proof fields for `canonicalUriNoUserinfoCredentialsBoundaryVerified`, `authorizationServersNoUserinfoCredentialsBoundaryVerified`, `protectedResourceMetadataBuilderNoCredentialBearingUrlsVerified`, `protectedResourceMetadataBuilderSecretPatternScanVerified`, and `fp0122PostmergeCredentialLeakageHardeningVerified`.
- [x] 2026-05-16T21:48:18Z: Focused pre-closeout checks passed for the updated builder/canonical specs plus `tools/read-only-mcp-protected-resource-metadata-builder-proof.mjs` and `tools/read-only-mcp-canonical-resource-auth-server-proof.mjs`.
- [x] 2026-05-16T21:59:54Z: Full correction validation passed before closeout: `git diff --check`, all requested read-only proof gates, requested domain/control-plane Vitest slices, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`. This post-validation closeout edit requires only the documented rerun set before the one commit, push, and PR.

## Surprises & Discoveries

- Active docs from the FP-0121 merge still described FP-0121 as active and FP-0122 absent. Because PR #291 is merged and the baseline proofs passed, this is a directly stale docs refresh to handle inside FP-0122, not a reason to widen into route implementation.
- OpenAI Developers was available as a plugin family, but tool discovery exposed only OpenAI Platform API-key setup tools. Official web docs were used instead, and no key or API flow was opened.

## Decision Log

- Decision: FP-0122 is contract/proof work only. The builder may produce a bounded metadata object and a deferred route-response contract, but it must not register or implement a route.
- Decision: The builder requires an accepted canonical public MCP resource URI candidate from the FP-0120 validator. Placeholder, localhost, tunnel, selector-bearing, query-bearing, fragment-bearing, workspace/tenant-template, companyKey-in-URI, user selector, or org selector candidates fail closed.
- Decision: `authorization_servers` must be non-empty, HTTPS, exact, stable, and provider-neutral. Provider resolution remains unresolved until a later plan explicitly chooses provider/authorization-server ownership.
- Decision: `scopes_supported` remains read-only and least-privilege. Broad, wildcard, admin, write, mutation, provider, and `offline_access` scopes are rejected.
- Decision: `bearer_methods_supported` includes header bearer usage and preserves the existing header-only posture by rejecting query-string bearer usage and other non-header methods.
- Decision: The metadata document shape is bounded to `resource`, `authorization_servers`, `scopes_supported`, and `bearer_methods_supported`; tokens, cookies, sessions, OAuth secrets, provider credentials, raw finance data, raw source dumps, and companyKey authority are prohibited in metadata, examples, logs, structured proof output, and route-response contracts.
- Decision: Protected-resource metadata route implementation, WWW-Authenticate behavior, OAuth/token/session/auth middleware, authenticated company binding implementation, remote MCP deployment, deployment config, Apps SDK resources, public app behavior, and app submission remain future-only.
- Decision: Public ChatGPT App submission must wait. FP-0122 creates no public app behavior, listing copy, submission assets, screenshots, review credentials, or external communications.
- Decision: Credential-bearing URLs are invalid metadata-builder inputs. The builder and adjacent canonical URI validator reject URL userinfo credentials, username/password values, client-secret-like userinfo, Basic/Bearer-style URI material, JWT-looking material, and secret-like authority/path text for `canonicalResourceUri` and `authorization_servers`.
- Decision: Secret-like path and authority scanning is a contract/proof guard only. It does not create runtime auth, OAuth, token/session handling, middleware, route behavior, provider calls, logging behavior, DB state, or public app behavior.

## Context and Orientation

FP-0121 is shipped as docs-and-plan/proof-gate-only protected-resource metadata route implementation readiness planning. It requires canonical URI/auth-server evidence, metadata document tests, route tests, no-token-leakage proof, `/mcp` unchanged-behavior proof, and authenticated company-binding gates before any route implementation can start.

FP-0120 is shipped as local/proof-only/read-only canonical resource/auth-server readiness contracts. It keeps the exact stable HTTPS canonical public MCP resource URI decision deferred, rejects selector/query/fragment/local tunnel authority, requires provider-neutral `authorization_servers`, and proves RFC 9728 metadata URL derivation fails closed for invalid canonical URI candidates.

FP-0118 is shipped as local/proof-only protected-resource metadata/auth challenge readiness contracts. FP-0117 is shipped OAuth/token/session/auth implementation sequencing. FP-0107 is the shipped local `/mcp` route adapter shell. FP-0106 and FP-0100 remain the protocol-envelope and public-security boundaries.

Official research ledger:

- MCP Authorization specification (`https://modelcontextprotocol.io/specification/draft/basic/authorization`): used for protected-resource metadata discovery, required `authorization_servers`, canonical server URI/resource parameter, access token header usage, query-string token prohibition, audience/resource validation, token passthrough prohibition, scope challenge posture, and `WWW-Authenticate resource_metadata` context.
- MCP Transports specification (`https://modelcontextprotocol.io/specification/draft/basic/transports`): used for Streamable HTTP posture and the reason `/mcp` route behavior remains unchanged in this slice.
- MCP Security Best Practices (`https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices`): used for confused deputy, token passthrough, SSRF, logging/audit, and scope-minimization context.
- RFC 9728 OAuth 2.0 Protected Resource Metadata (`https://www.rfc-editor.org/rfc/rfc9728`): used for protected-resource metadata field semantics, `resource`, `authorization_servers`, `scopes_supported`, `bearer_methods_supported`, metadata response validation, and well-known route derivation context.
- OpenAI Apps SDK Authentication (`https://developers.openai.com/apps-sdk/build/auth`): used for future ChatGPT Apps custom auth context and protected-resource metadata expectations only.
- OpenAI Apps SDK Security & Privacy (`https://developers.openai.com/apps-sdk/guides/security-privacy`): used for least privilege, explicit consent, data handling, logging redaction, prompt-injection, and auth posture context only.
- OpenAI Apps SDK Deploy (`https://developers.openai.com/apps-sdk/deploy`) and Submit (`https://developers.openai.com/apps-sdk/deploy/submission`): used only as future remote host and submission context. FP-0122 does not deploy, connect, test a public app, or submit an app.

GitHub connector product behavior is out of scope. Routine `git`, push, and PR publication may happen after validation.

## Plan of Work

Create exactly one Finance Plan file for FP-0122. Add pure domain contracts and builder functions under `packages/domain/src/read-only-app-mcp-protected-resource-metadata-builder*.ts`, plus focused specs. Add one direct proof command at `tools/read-only-mcp-protected-resource-metadata-builder-proof.mjs`.

Bridge the minimum proof gates so exactly `plans/FP-0122-read-only-chatgpt-app-mcp-protected-resource-metadata-document-builder-contracts.md` is accepted while FP-0123 remains absent. The bridge must prove FP-0122 only authorizes local/proof-only protected-resource metadata document-builder and route-response contract work. It must not authorize route behavior changes, route expansion, protected-resource metadata route implementation, WWW-Authenticate route behavior, OAuth implementation, token/session implementation, auth middleware, remote MCP deployment, deployment config, Apps SDK resources, app submission, DB queries, schemas/migrations, package scripts, fixtures, sample data, source packs, provider calls, OpenAI API/model calls, public assets, listing copy, generated public prose, source mutation, finance writes, generated finance advice, autonomous action, or public app implementation.

Refresh only directly stale active docs and `plugins.md` so FP-0121 is shipped, FP-0122 is shipped as the local/proof-only/read-only builder-contract slice with this post-merge credential/userinfo hardening correction, FP-0123 remains absent, and protected-resource metadata route implementation still waits.

## Concrete Steps

1. Keep work on `codex/v2ap-read-only-chatgpt-app-mcp-protected-resource-metadata-document-builder-contracts-local-v1`.
2. Confirm preflight gates and baseline proof tools before edits.
3. Add this exact FP-0122 plan and no FP-0123 file.
4. Add pure builder contracts, validation, document builder, route-response deferred contract derivation, and focused specs.
5. Add `tools/read-only-mcp-protected-resource-metadata-builder-proof.mjs`.
6. Update proof-gate bridge helpers, schemas, tools, and specs so exact FP-0122 is accepted while FP-0123 remains absent.
7. Refresh directly stale active docs and `plugins.md`.
8. Run focused validation, strict same-branch QA, full validation, closeout updates, final reruns if needed, exactly one commit, push, and PR.

## Validation and Acceptance

Validation commands:

- `git diff --check`
- `pnpm exec tsx tools/read-only-mcp-protected-resource-metadata-builder-proof.mjs`
- `pnpm exec tsx tools/read-only-mcp-canonical-resource-auth-server-proof.mjs`
- `pnpm exec tsx tools/read-only-mcp-protected-resource-metadata-proof.mjs`
- `pnpm exec tsx tools/read-only-mcp-oauth-implementation-sequencing-proof.mjs`
- `pnpm exec tsx tools/read-only-mcp-remote-host-resource-boundary-proof.mjs`
- `pnpm exec tsx tools/read-only-mcp-remote-host-readiness-proof.mjs`
- `pnpm exec tsx tools/read-only-mcp-oauth-security-boundary-proof.mjs`
- `pnpm exec tsx tools/read-only-mcp-default-local-evidence-dispatch-proof.mjs`
- `pnpm exec tsx tools/read-only-mcp-evidence-tool-dispatch-adapter-proof.mjs`
- `pnpm exec tsx tools/read-only-mcp-evidence-tool-dispatch-proof.mjs`
- `pnpm exec tsx tools/read-only-mcp-route-adapter-proof.mjs`
- `pnpm exec tsx tools/read-only-mcp-protocol-envelope-proof.mjs`
- `pnpm exec tsx tools/read-only-endpoint-route-ownership-proof.mjs`
- `pnpm exec tsx tools/read-only-endpoint-architecture-proof.mjs`
- `pnpm exec tsx tools/read-only-public-app-security-boundary-proof.mjs`
- `pnpm exec tsx tools/read-only-mcp-descriptor-response-envelope-proof.mjs`
- `pnpm exec tsx tools/read-only-chatgpt-app-mcp-proof.mjs`
- `pnpm exec tsx tools/benchmark-community-pack-proof.mjs`
- `pnpm exec tsx tools/bounded-llm-orchestration-proof.mjs`
- `pnpm exec tsx tools/read-only-evidence-app-proof.mjs`
- `pnpm exec tsx tools/document-precision-foundation-proof.mjs`
- `pnpm exec tsx tools/evidence-index-foundation-proof.mjs`
- `pnpm --filter @pocket-cto/domain exec vitest run src/benchmark-community.spec.ts src/read-only-app-mcp.spec.ts src/read-only-app-mcp-descriptor.spec.ts src/read-only-app-mcp-public-security.spec.ts src/read-only-app-mcp-endpoint-architecture.spec.ts src/read-only-app-mcp-endpoint-route-ownership.spec.ts src/read-only-app-mcp-protocol-envelope.spec.ts src/read-only-app-mcp-evidence-tool-dispatch.spec.ts src/read-only-app-mcp-oauth-security.spec.ts src/read-only-app-mcp-remote-host-readiness.spec.ts src/read-only-app-mcp-remote-host-resource.spec.ts src/read-only-app-mcp-protected-resource-metadata.spec.ts src/read-only-app-mcp-protected-resource-metadata-builder.spec.ts src/read-only-app-mcp-canonical-resource-proof.spec.ts src/read-only-app-mcp-canonical-resource-validation.spec.ts`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/read-only-app-mcp-endpoint/routes.spec.ts src/modules/read-only-app-mcp-endpoint/service.spec.ts src/modules/read-only-app-mcp-endpoint/evidence-dispatcher.spec.ts src/app.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

Acceptance requires exactly one FP-0122 path, FP-0123 absent, pure local/proof-only protected-resource metadata builder contracts, successful builder output only for accepted canonical URI plus non-empty provider-neutral authorization servers, read-only least-privilege scopes, header-only bearer methods, no-token-leakage, deferred route-response contract, no route behavior change, no new route path, no protected-resource metadata route, no WWW-Authenticate behavior, no OAuth/token/session/auth middleware, no remote MCP deployment, no deployment config, no Apps SDK resources, no public app behavior, no app submission, no DB/schema/package/data/asset/source-pack changes, no OpenAI API/model/provider calls, no source mutation, no finance writes, no autonomous action, preserved `/mcp` route/default local dispatch posture, and preserved FP-0121/0120/0118/0117/0107/0106/0100 boundaries.

The post-merge hardening correction additionally requires credential-bearing URL userinfo to fail closed for canonical resource URI candidates and `authorization_servers`; secret-like authority/path material including `api_key`, `apikey`, `accesskey`, `password`, `passwd`, `secret`, `jwt`, `id_token`, `sessionid`, `session_id`, `credential`, `private_key`, `bearer`, and `basic` to fail closed; accepted metadata output to remain limited to `resource`, `authorization_servers`, `scopes_supported`, and `bearer_methods_supported`; the route-response contract to remain deferred with no route registration; route files to remain unchanged; and proof output to include `canonicalUriNoUserinfoCredentialsBoundaryVerified`, `authorizationServersNoUserinfoCredentialsBoundaryVerified`, `protectedResourceMetadataBuilderNoCredentialBearingUrlsVerified`, `protectedResourceMetadataBuilderSecretPatternScanVerified`, and `fp0122PostmergeCredentialLeakageHardeningVerified`.

## Idempotence and Recovery

This slice has no migrations, provider resources, OAuth registrations, tokens, sessions, source artifacts, finance writes, deployment configs, route files, public assets, Apps SDK resources, or runtime state to roll back.

If validation fails, patch only the FP-0122 builder proof-contracts, proof-gate bridge, or directly stale docs on this same branch. If validation reveals a broader shipped-boundary defect, stop and recommend the smallest safer corrective slice instead of widening FP-0122.

## Artifacts and Notes

Expected artifacts are this FP-0122 plan, pure domain builder contracts/functions/specs, direct proof tooling, proof-gate bridge updates, directly stale active-doc/plugin refresh, and validation evidence.

Replay implication: FP-0122 does not ingest sources, mutate raw source files, create mission outputs, change mission state, release communications, write finance state, or create runtime-Codex finance output. No mission replay event is required beyond plan progress, decision log, proof output, and final validation evidence.

Provenance/freshness/limitations implication: FP-0122 does not answer finance questions or compile reports. It preserves the future requirement that route/tool outputs expose provenance, freshness posture, and limitations when relevant, and that metadata, auth challenges, logs, proof output, public docs, and app-submission artifacts must not contain token material, private finance data, raw source dumps, or generated finance advice.

## Interfaces and Dependencies

Primary module touch is `packages/domain`. The builder reuses the FP-0120 canonical URI validator and remains pure TypeScript. Direct proof tooling under `tools/` may change only for proof-gate bridge compatibility. `apps/control-plane` route files are validation context only and must not change.

No new environment variables, package scripts, route paths, schemas, migrations, DB queries, fixtures, datasets, sample data, source packs, public assets, provider configs, OpenAI API/model integrations, Apps SDK resources, OAuth/session/auth middleware, deployment files, public app behavior, app submission assets, or external communications are introduced.

## Outcomes & Retrospective

FP-0122 produced a local/proof-only protected-resource metadata document-builder contract foundation without adding routes, route paths, protected-resource metadata route behavior, `WWW-Authenticate` behavior, OAuth/token/session/auth middleware, remote MCP deployment, deployment config, Apps SDK resources, public app behavior, app submission, DB queries, schemas, migrations, package scripts, fixtures, datasets, source packs, public assets, listing copy, generated public prose, OpenAI API/model calls, provider calls, external communications, source mutation, finance writes, generated finance advice, runtime-Codex finance output, autonomous action, or FP-0123.

The post-merge hardening correction closes the credential-bearing URL proof gap while preserving the same boundary: canonical resource URI validation now rejects URL userinfo credentials, and the metadata builder rejects credential-bearing or secret-like `canonicalResourceUri` and `authorization_servers` URI material before any bounded metadata document or deferred route-response contract can be produced.

Focused validation, all proof tools, lint, typecheck, full tests, and `pnpm ci:repro:current` passed before the original closeout edit. The post-merge hardening correction passed the focused pre-closeout builder/canonical specs and proof checks, then passed the full requested proof ladder, requested Vitest slices, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current` before this final closeout note. Because this note is a post-validation doc edit, the required rerun set remains: `git diff --check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.

Commit, push, and PR publication are the remaining procedural actions after post-closeout validation. Their exact identifiers will be reported in the final response.
