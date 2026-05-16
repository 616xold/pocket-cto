# FP-0120 read-only ChatGPT App MCP canonical resource auth-server readiness contracts

## Purpose / Big Picture

FP-0120 is a local/proof-only/read-only contract foundation for the future protected-resource metadata route implementation path. It decides what can be proved now about the canonical public MCP resource URI, `authorization_servers`, RFC 9728 protected-resource metadata route derivation, `WWW-Authenticate` `resource_metadata` URL readiness, local tunnel authority, and route/runtime absence.

This slice exists because FP-0119 shipped protected-resource metadata route implementation sequencing and decided route implementation should not start from current repo truth. FP-0119 requires a stable HTTPS canonical public MCP resource URI, route-path derivation tests, metadata document tests, no-token-leakage gates, local `/mcp` unchanged-behavior gates, and authenticated company binding before any route implementation lane opens.

FP-0120 does not choose a production host/provider or authorization server. It does not implement protected-resource metadata routes, `WWW-Authenticate` behavior, OAuth, token/session storage, auth middleware, remote MCP deployment, deployment config, Apps SDK resources, public app behavior, app submission, DB queries, schemas, migrations, package scripts, fixtures, sample data, source packs, public assets, listing copy, generated public prose, OpenAI API/model calls, provider calls, external communications, source mutation, finance writes, generated finance advice, runtime-Codex finance output, autonomous action, or FP-0121.

## Progress

- [x] 2026-05-16T12:51:28Z: Invoked Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor from the repo-local Pocket CFO operator bundle. GitHub Connector Guard was not invoked because GitHub connector product behavior is out of scope.
- [x] 2026-05-16T12:51:28Z: Confirmed work is on `codex/v2an-read-only-chatgpt-app-mcp-canonical-resource-auth-server-readiness-contracts-local-v1`, the worktree was clean before edits, PR #287 is merged, FP-0119 exists, FP-0120 was absent, FP-0121 was absent, and current active docs support FP-0119 as protected-resource metadata route sequencing only but are directly stale about shipped-vs-active status.
- [x] 2026-05-16T12:51:28Z: Ran the required pre-edit direct proof ladder and a focused `/mcp` app-wiring check. The listed proof tools passed before edits, default `buildApp()` remains fail-closed for `/mcp` `tools/call`, and explicit injected app construction still enables local read-only evidence dispatch.
- [x] 2026-05-16T17:24:08Z: Added pure domain contracts, validators, proof schemas, builders, focused specs, and `tools/read-only-mcp-canonical-resource-auth-server-proof.mjs` for local/proof-only canonical public MCP resource URI and `authorization_servers` readiness. No route files, route paths, OAuth/session/auth middleware, deployment config, Apps SDK resources, DB/schema/package-script files, source artifacts, provider calls, OpenAI API/model calls, public assets, or finance writes were added.
- [x] 2026-05-16T17:24:08Z: Applied the minimum proof-gate bridge so FP-0118/FP-0117-era gates accept exactly this FP-0120 local canonical resource/auth-server contract foundation while FP-0121 remains absent and FP-0119/0118/0117/0116/0113/0107/0106/0100 boundaries remain verified.
- [x] 2026-05-16T17:24:08Z: Refreshed directly stale README/CODEX/START/ACTIVE_DOCS/PROJECT_STATE/V2_BOUNDARY/ROADMAP/security/demo/plugin docs to mark FP-0119 shipped, FP-0120 active, FP-0121 absent, and protected-resource route/OAuth/remote/public-app/submission work blocked until later plan gates.
- [x] 2026-05-16T17:24:08Z: Ran the full requested validation ladder before closeout. `git diff --check`, the new FP-0120 proof, all existing proof tools, focused domain specs, focused control-plane route/service/dispatcher/app-wiring specs, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current` passed.

## Surprises & Discoveries

- OpenAI Developers exposed only OpenAI Platform API-key setup tools in this thread, not read-only docs search. Per slice policy, official web documentation is used instead. No OpenAI Platform key setup, OpenAI API, model call, provider call, upload, app submission, deployment, or screenshot workflow is used.
- Current active docs still describe FP-0119 as active and FP-0120 as absent. Because PR #287 is merged and FP-0120 is now the requested successor, those docs are directly stale and must be refreshed in this same branch without widening runtime scope.

## Decision Log

- Decision: FP-0120 keeps the canonical public MCP resource URI decision deferred. A future implementation plan may choose it only when an exact stable HTTPS value and public host/owner context are proved.
- Decision: The canonical resource URI is required before protected-resource metadata route implementation. It must be exact, stable, HTTPS, query-free, fragment-free, non-placeholder, non-local, non-tunnel, and free of `companyKey`, user/org selectors, workspace/tenant template values, and unauthenticated selector authority.
- Decision: `authorization_servers` is required and must be non-empty before implementation, but provider/auth-server selection remains unresolved and provider-neutral now.
- Decision: RFC 9728 path derivation is a contract-only helper in FP-0120. A canonical resource ending in `/mcp` derives to `/.well-known/oauth-protected-resource/mcp`; a host-root canonical resource derives to `/.well-known/oauth-protected-resource`.
- Decision: `WWW-Authenticate` `resource_metadata` must point at the derived protected-resource metadata URL, but FP-0120 does not add `WWW-Authenticate` route behavior.
- Decision: FP-0121 remains absent. Protected-resource metadata route implementation planning should wait for FP-0120 proof results and should not start if this slice uncovers a route/runtime gap.
- Decision: FP-0120 validation found no route/runtime gap. The next safe step is protected-resource metadata route implementation planning only if it stays narrow and starts from these contracts; public ChatGPT App submission must still wait.

## Context and Orientation

FP-0119 is shipped protected-resource metadata route implementation sequencing and proof-gate compatibility only. It decides route implementation cannot start from current repo truth until canonical public resource URI, route tests, metadata document tests, no-token-leakage gates, and local `/mcp` unchanged-behavior gates are green. It keeps `WWW-Authenticate` behavior in a later or separate lane.

FP-0118 is shipped local/proof-only/read-only protected-resource metadata/auth challenge readiness contracts. FP-0117 is shipped OAuth/token/session/auth implementation sequencing. FP-0116 is shipped remote host owner, canonical URI, public `/mcp`, protected-resource metadata, and provider-neutral contracts. FP-0113 is shipped OAuth/token/session/user-org/company binding security contracts. FP-0107 is the shipped local `/mcp` route-adapter shell. FP-0106 and FP-0100 remain prior protocol-envelope and public-security boundaries.

Official research ledger:

- MCP Authorization specification, draft current (`https://modelcontextprotocol.io/specification/draft/basic/authorization`): used for MCP protected-resource metadata, required `authorization_servers`, `WWW-Authenticate` `resource_metadata`, resource indicators, canonical server URI/resource parameter, token audience/resource validation, scope challenges, and token passthrough prohibition.
- RFC 9728 OAuth 2.0 Protected Resource Metadata (`https://www.ietf.org/rfc/rfc9728.html`): used for protected-resource metadata field semantics, HTTPS resource identifier, no fragment posture, well-known path derivation, metadata validation, `authorization_servers`, `WWW-Authenticate` `resource_metadata`, and authorization-server/audience security considerations.
- MCP Transports specification, draft current (`https://modelcontextprotocol.io/specification/draft/basic/transports`): used for Streamable HTTP single endpoint posture, `/mcp` POST endpoint context, Origin validation, localhost binding, and proper authentication recommendations.
- MCP Security Best Practices (`https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices`): used for token audience validation, token passthrough prohibition, OAuth metadata URL SSRF risk, HTTPS URL posture, least privilege, and fail-closed exposure planning.
- OpenAI Apps SDK Authentication (`https://developers.openai.com/apps-sdk/build/auth`): used for future ChatGPT OAuth expectations, canonical MCP resource value, `authorization_servers`, protected-resource metadata hosting, and `resource` parameter behavior.
- OpenAI Apps SDK Security & Privacy (`https://developers.openai.com/apps-sdk/guides/security-privacy`): used for least-privilege scopes, no secrets/tokens in component props, logging redaction, malformed/expired token rejection, and review posture.
- OpenAI Apps SDK Deploy, Connect from ChatGPT, Test your integration, and Submit and maintain docs (`https://developers.openai.com/apps-sdk/deploy`, `https://developers.openai.com/apps-sdk/deploy/connect-chatgpt`, `https://developers.openai.com/apps-sdk/deploy/testing`, `https://developers.openai.com/apps-sdk/deploy/submission`): used only as future host/developer-mode/testing/submission context. FP-0120 does not deploy, connect, test in ChatGPT, submit, or create public assets.

## Plan of Work

Create pure domain contracts and focused specs under `packages/domain/src/read-only-app-mcp-canonical-resource*.ts`.

Add `tools/read-only-mcp-canonical-resource-auth-server-proof.mjs` to emit machine-readable JSON proving the new contracts and all absence boundaries.

Bridge only the minimum existing proof gates that still required FP-0120 absence, so they accept exactly this local/proof-only/read-only FP-0120 plan while FP-0121 remains absent.

Refresh directly stale active docs and `plugins.md` so FP-0119 is shipped, FP-0120 is the active local/proof-only canonical resource/auth-server readiness contract slice, and public app submission remains future-only.

## Concrete Steps

1. Keep work on `codex/v2an-read-only-chatgpt-app-mcp-canonical-resource-auth-server-readiness-contracts-local-v1`.
2. Add this exact plan and no FP-0121 plan.
3. Add canonical resource/auth-server readiness schemas, builders, validators, route-derivation helpers, plan-boundary verifiers, and proof schema.
4. Add focused domain specs for FP-0120 path acceptance, FP-0121 absence, canonical URI validation, route derivation, `WWW-Authenticate` metadata URL matching, auth-server/provider neutrality, and runtime absence.
5. Add direct proof tooling and JSON output.
6. Bridge FP-0118/FP-0117 proof gates so FP-0120 is accepted only as this local contract foundation.
7. Refresh directly stale docs/plugin references.
8. Run focused validation, full validation, closeout updates, final reruns if needed, exactly one commit, push, and PR.

## Validation and Acceptance

Validation commands:

- `git diff --check`
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
- `pnpm --filter @pocket-cto/domain exec vitest run src/read-only-app-mcp-canonical-resource*.spec.ts src/read-only-app-mcp-protected-resource-metadata.spec.ts src/read-only-app-mcp-remote-host-resource.spec.ts src/read-only-app-mcp-oauth-security.spec.ts src/read-only-app-mcp-remote-host-readiness.spec.ts src/read-only-app-mcp-protocol-envelope.spec.ts src/read-only-app-mcp-endpoint-route-ownership.spec.ts src/read-only-app-mcp-endpoint-architecture.spec.ts src/read-only-app-mcp-public-security.spec.ts src/read-only-app-mcp-evidence-tool-dispatch.spec.ts src/read-only-app-mcp.spec.ts src/read-only-app-mcp-descriptor.spec.ts src/benchmark-community.spec.ts`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/read-only-app-mcp-endpoint/routes.spec.ts src/modules/read-only-app-mcp-endpoint/service.spec.ts src/modules/read-only-app-mcp-endpoint/evidence-dispatcher.spec.ts src/app.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

Acceptance requires exactly one FP-0120 path, FP-0121 absent, canonical resource/auth-server contracts verified, provider neutrality preserved, RFC 9728 route derivation verified, no local tunnel authority, no route runtime, no route behavior change, no new route path, no protected-resource metadata route, no `WWW-Authenticate` route behavior, no OAuth/token/session/auth middleware, no remote MCP deployment, no deployment config, no Apps SDK resource, no app submission, no DB query, no schema/migration, no package script, no public asset, no OpenAI API/model/client/key usage, no provider/external call, no source mutation, no finance write, preserved local `/mcp`, preserved authenticated company-binding prerequisites, and preserved FP-0119/0118/0117/0116/0113/0107/0106/0100 boundaries.

## Idempotence and Recovery

This slice is pure contracts, docs, specs, and proof tooling. There are no migrations, provider resources, OAuth registrations, tokens, sessions, source artifacts, finance writes, deployment configs, route files, public assets, Apps SDK resources, or runtime state to roll back.

If validation fails, patch only the FP-0120 domain contracts, proof tooling, proof-gate bridge, or directly stale docs in this branch and rerun the required ladder. If validation reveals route/runtime implementation is needed, stop and recommend a narrower corrective slice rather than widening FP-0120.

## Artifacts and Notes

Expected artifacts are this plan, pure domain contract/proof files, focused specs, one direct proof command, minimal proof-gate bridge updates, directly stale doc/plugin refresh, and validation evidence.

Replay implication: FP-0120 does not ingest sources, mutate raw source files, create mission outputs, change mission state, release communications, write finance state, or create runtime-Codex finance output. No mission replay event is required beyond plan progress, decision log, proof output, and final validation evidence.

Provenance/freshness/limitations implication: FP-0120 does not answer finance questions or compile reports. It preserves future requirements that route/tool outputs expose provenance, freshness posture, and limitations when relevant, and that token/auth metadata never becomes finance source truth.

## Interfaces and Dependencies

Primary module touch is `packages/domain` proof contracts and specs. Direct proof tooling under `tools/` may change for FP-0120 and proof-gate bridge compatibility only. `apps/control-plane` route files are validation context only and must not change.

No new environment variables, package scripts, route paths, schemas, migrations, DB queries, fixtures, datasets, sample data, source packs, public assets, provider configs, OpenAI API/model integrations, Apps SDK resources, OAuth/session/auth middleware, deployment files, public app behavior, app submission assets, or external communications are introduced.

GitHub connector product behavior is out of scope. Routine `git`, push, and PR publication may happen after validation.

## Outcomes & Retrospective

FP-0120 is implemented as a local/proof-only/read-only contract and proof foundation. It establishes canonical public MCP resource URI requirements, deferred host/provider decision posture, `authorization_servers` readiness, provider neutrality, RFC 9728 route path derivation, `WWW-Authenticate` `resource_metadata` URL matching, no-local-tunnel authority, and no-route-runtime posture.

Validation passed before closeout:

- `git diff --check`
- `pnpm exec tsx tools/read-only-mcp-canonical-resource-auth-server-proof.mjs`
- all existing proof tools listed in this plan
- focused domain specs, including the new canonical resource/auth-server specs
- focused control-plane route/service/dispatcher/app-wiring specs
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

Remaining work is future-lane only: a protected-resource metadata route implementation plan may start next if it treats FP-0120 as the contract floor and separately proves exact canonical HTTPS URI, route behavior, metadata document tests, no-token-leakage gates, and authenticated company binding. Public ChatGPT App submission, OAuth implementation, remote deployment, provider selection, and external release remain blocked.
