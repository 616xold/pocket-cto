# FP-0124 read-only ChatGPT App MCP protected-resource metadata route implementation master plan

## Purpose / Big Picture

FP-0124 is a docs-and-plan plus proof-gate compatibility master plan for protected-resource metadata route implementation sequencing after FP-0123 route-input evidence contracts.

The target phase is V2AR. This slice exists because FP-0121 planned protected-resource metadata route implementation readiness without implementing routes, FP-0122 shipped a pure protected-resource metadata document builder and deferred route-response contract with credential/userinfo hardening, and FP-0123 shipped pure proof-only route-input evidence bundle and route-path decision contracts.

FP-0124 plans future protected-resource metadata route implementation only. It does not implement the route in the FP-0124 slice, does not add route paths, does not register a protected-resource metadata endpoint, and did not implement WWW-Authenticate route behavior, implement OAuth, implement token/session, implement auth middleware, deploy remote MCP, add deployment config, change `/mcp` behavior, or add Apps SDK resources, public ChatGPT App behavior, app submission, DB queries, schemas, migrations, package scripts, fixtures, sample data, source packs, public assets, listing copy, generated public prose, OpenAI API/model calls, provider calls, external communications, source mutation, finance writes, generated finance advice, runtime-Codex finance output, autonomous action, or FP-0125 in the FP-0124 slice. FP-0125 absence was a proof condition for FP-0124 and the later FP-0125 successor slice is limited to the narrow local-only explicit-dependency route implementation authorized here.

## Progress

- [x] 2026-05-17T00:41:34Z: Invoked Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor from the repo-local Pocket CFO operator bundle. GitHub Connector Guard was not invoked because GitHub connector product behavior is out of scope.
- [x] 2026-05-17T00:41:34Z: Confirmed preflight gates: exact requested branch, clean worktree, GitHub auth, PR #294 merged, local Postgres and MinIO available, FP-0123 present, FP-0124 and FP-0125 absent before this slice, and required proof tools present.
- [x] 2026-05-17T00:41:34Z: Ran the required baseline proof ladder before edits; all direct proof commands from route-input proof through evidence-index foundation passed.
- [x] 2026-05-17T00:41:34Z: Used official MCP, RFC 9728, and OpenAI Apps SDK documentation as read-only research context only. No OpenAI API key setup, API call, model call, provider call, upload, deployment, ChatGPT connector creation, testing workflow, app submission, public asset generation, or external communication was used.
- [x] 2026-05-17T01:16:56Z: Created the FP-0124 proof-gate bridge so exactly this FP-0124 docs-only route implementation master plan was accepted while FP-0125 remained absent during the FP-0124 slice.
- [x] 2026-05-17T01:16:56Z: Refreshed only directly stale active docs and `plugins.md` for FP-0124 active planning truth, FP-0125 absence, and future-only public app/submission posture.
- [x] 2026-05-17T01:16:56Z: Ran the required proof ladder, focused validation, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`; all were green before this closeout edit.
- [x] 2026-05-17T01:23:37Z: PR #296 merged FP-0124 as shipped docs-and-plan/proof-gate-only route implementation planning. Later FP-0125 work may only proceed under the narrow local-only successor boundary recorded below.

## Surprises & Discoveries

- Current repo truth is stronger than FP-0121 because FP-0122 now provides a bounded credential-hardened metadata document builder, and FP-0123 now provides explicit route-input evidence bundle contracts. That makes a future local-only route implementation slice possible, but only if it uses explicit dependency injection and fail-closed registration.
- Official MCP authorization guidance treats protected-resource metadata well-known discovery and `WWW-Authenticate resource_metadata` discovery as separate mechanisms clients must support. That supports keeping the future metadata route and future `/mcp` challenge behavior in separate implementation lanes.
- RFC 9728 path derivation remains decisive. For a canonical protected resource ending in `/mcp`, the metadata path is the `/mcp`-derived well-known path, not the host-root path.
- The first `pnpm ci:repro:current` attempt reached the integration database test phase and timed out once in an existing validation git-client spec. The isolated spec passed locally, and a full `pnpm ci:repro:current` rerun passed without code or test changes, so this was treated as transient validation noise rather than FP-0124 scope.

## Decision Log

- Decision: Protected-resource metadata route implementation may start next only as a narrow local-only/proof-only/read-only implementation slice after FP-0124 validation is green. It must not be public, remote, canonical-production, OAuth, token/session, auth middleware, WWW-Authenticate, Apps SDK resource, app-submission, DB, schema, package-script, provider, OpenAI API/model, source mutation, finance write, or autonomous-action work.
- Decision: Public or remote route implementation cannot start while the exact stable public canonical URI, provider, and authorization server ownership remain unresolved.
- Decision: A local-only route implementation can start before public canonical URI/provider/auth-server selection only if it receives an explicit FP-0123 route-input evidence bundle dependency at app construction time and remains unavailable by default.
- Decision: The future local route path should use the FP-0123 `/mcp`-derived route path decision, `/.well-known/oauth-protected-resource/mcp`, because current repo truth names `/mcp` as the MCP endpoint. The host-root metadata path is deferred unless a later plan proves host-root resource identity. Dual path publication is deferred and not authorized.
- Decision: The future local route should attach to the existing control-plane Fastify app only as a thin route module under explicit dependency injection. Public host ownership, future gateway, or future remote MCP server ownership remains unresolved for public exposure.
- Decision: The future route module must not construct metadata documents from raw config, environment variables, DB queries, request state, or chat context. It must receive a prebuilt FP-0123 route-input evidence bundle, including valid FP-0122 builder output or builder-valid input evidence.
- Decision: Route registration must fail closed if the explicit evidence bundle dependency is absent, invalid, stale, missing canonical URI evidence, missing authorization server evidence, missing valid builder output evidence, missing no-token-leakage proof, missing authenticated company binding prerequisite evidence, or missing /mcp unchanged behavior evidence.
- Decision: The future route response may expose only the bounded FP-0122 metadata document fields: `resource`, `authorization_servers`, `scopes_supported`, and `bearer_methods_supported`. It must not expose tokens, cookies, sessions, credentials, companyKey authority, raw finance data, raw source dumps, private source material, proof internals, or generated finance advice.
- Decision: No-token-leakage checks must run before route registration and remain enforced inside the FP-0122/FP-0123 domain builders. Registration should reject a bundle that has not already proved no-token-leakage.
- Decision: Authenticated company binding blocks public/default route exposure, OAuth/token/session behavior, evidence-tool authority, and any company-scoped runtime behavior. It does not block a future local-only metadata route proof slice if the evidence bundle explicitly records company binding as required, unimplemented, and not used as unauthenticated authority.
- Decision: /mcp unchanged behavior is necessary but not sufficient for local route implementation. A future implementation must also prove exact route path, explicit evidence dependency, bounded metadata response, no-token-leakage, company-binding prerequisite, route-response tests, and absence of OAuth/WWW-Authenticate/runtime widening.
- Decision: WWW-Authenticate `resource_metadata` behavior remains a separate later lane because it changes `/mcp` 401/403/token-failure behavior and belongs with OAuth/token/session/auth middleware readiness.
- Decision: FP-0125 may open only one narrow local-only protected-resource metadata route implementation slice if every FP-0124 proof gate is green. FP-0125 remained absent in this slice and was later opened only under that successor boundary.
- Decision: Public ChatGPT App submission must wait for public host, OAuth/security, Apps SDK resources if any, validation in ChatGPT, submission materials, review credentials, privacy/security review, and explicit human approval in a future plan.

## Context and Orientation

FP-0123 is shipped as local/proof-only/read-only protected-resource metadata route-input evidence bundle and route-path decision contracts. It proves accepted canonical URI evidence, credential-free `authorization_servers` evidence, FP-0122 builder output or builder-valid input, no-token-leakage, authenticated company-binding prerequisite, `/mcp` unchanged prerequisite, route implementation deferral, WWW-Authenticate behavior deferral, and no-runtime posture.

FP-0122 is shipped as local/proof-only/read-only protected-resource metadata document-builder and deferred route-response contracts with credential/userinfo hardening. It bounds the metadata document to `resource`, `authorization_servers`, `scopes_supported`, and `bearer_methods_supported`.

FP-0121 is shipped as docs-and-plan/proof-gate-only protected-resource metadata route implementation readiness planning. FP-0120 is shipped as local/proof-only/read-only canonical resource/auth-server readiness contracts with route-inventory and validation-gated metadata URL derivation hardening. FP-0118, FP-0117, FP-0107, FP-0106, and FP-0100 remain shipped boundaries and must stay intact.

Official research ledger:

- MCP Authorization specification, current 2025-11-25 page (`https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization`): used for protected-resource metadata requirements, `authorization_servers`, authorization server discovery, resource indicators, token audience validation, token passthrough prohibition, token storage cautions, token failure status codes, scope challenges, and `WWW-Authenticate resource_metadata` behavior.
- RFC 9728 OAuth 2.0 Protected Resource Metadata (`https://www.rfc-editor.org/rfc/rfc9728.html`): used for metadata field semantics, HTTP GET metadata response semantics, well-known path derivation, host-root versus path-derived routes, `resource`, `authorization_servers`, `scopes_supported`, `bearer_methods_supported`, and metadata security posture.
- MCP Transports specification (`https://modelcontextprotocol.io/specification/2025-06-18/basic/transports`): used for Streamable HTTP single endpoint posture, POST and GET `/mcp` behavior, 405 GET/SSE deferral posture, Origin validation, localhost binding, and authentication recommendation context.
- MCP Security Best Practices (`https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices`): used for token passthrough prohibition, token audience validation, OAuth metadata SSRF risks, HTTPS posture, logging/audit, least privilege, and fail-closed public exposure planning.
- OpenAI Apps SDK Authentication (`https://developers.openai.com/apps-sdk/build/auth`): used for future Apps SDK OAuth context, protected-resource metadata hosting, `securitySchemes`, `_meta["mcp/www_authenticate"]`, and token verification responsibilities only.
- OpenAI Apps SDK Security & Privacy (`https://developers.openai.com/apps-sdk/guides/security-privacy`): used for least privilege, explicit consent, server-side validation, audit logs, token/secret exclusion from structured content, PII redaction, prompt-injection, and write-action caution only.
- OpenAI Apps SDK Deploy your app (`https://developers.openai.com/apps-sdk/deploy`): used only as future stable HTTPS host and `/mcp` deployment context. FP-0124 does not deploy.
- OpenAI Apps SDK Connect from ChatGPT (`https://developers.openai.com/apps-sdk/deploy/connect-chatgpt`): used only as future connector context requiring a reachable HTTPS public `/mcp` endpoint. FP-0124 does not connect from ChatGPT.
- OpenAI Apps SDK Test your integration (`https://developers.openai.com/apps-sdk/deploy/testing`): used only as future validation context for MCP Inspector, developer mode, mobile layout, and API Playground. FP-0124 does not test in ChatGPT.
- OpenAI Apps SDK Submit and maintain your app (`https://developers.openai.com/apps-sdk/deploy/submission`): used only as future submission context. FP-0124 creates no submission assets and does not submit an app.

GitHub connector product behavior is out of scope. Routine `git`, push, and PR publication may happen after validation.

## Plan of Work

Create exactly one Finance Plan file for FP-0124 and keep it docs-and-plan/proof-gate compatibility only.

Bridge the minimum proof gates so exactly `plans/FP-0124-read-only-chatgpt-app-mcp-protected-resource-metadata-route-implementation-master-plan.md` was accepted while FP-0125 remained absent during the FP-0124 slice. The bridge must prove FP-0124 only plans future protected-resource metadata route implementation and does not authorize route behavior changes, route expansion, protected-resource metadata route implementation, WWW-Authenticate route behavior, OAuth implementation, token/session implementation, auth middleware, remote MCP deployment, deployment config, Apps SDK resources, public app behavior, app submission, DB queries, schemas, migrations, package scripts, fixtures, sample data, source packs, provider calls, OpenAI API/model calls, public assets, listing copy, generated public prose, source mutation, finance writes, generated finance advice, runtime-Codex finance output, or autonomous action.

Refresh only directly stale active docs and `plugins.md` so FP-0124 was recorded as the active docs-only route implementation sequencing plan, FP-0125 remained absent during that slice, and public app submission remained future-only.

## Concrete Steps

1. Keep work on `codex/v2ar-read-only-chatgpt-app-mcp-protected-resource-metadata-route-implementation-master-plan-local-v1`.
2. Add this exact FP-0124 plan and no FP-0125 file.
3. Add proof-gate bridge helpers and fields for FP-0124 exact-path acceptance plus FP-0125 absence.
4. Add focused specs proving FP-0124 is docs-and-plan/proof-gate only, includes route-input evidence bundle dependency, canonical URI evidence, authorization server evidence, builder output, no-token-leakage, `/mcp` unchanged behavior, authenticated company binding prerequisite, route path decision, deferred WWW-Authenticate behavior, and FP-0125 absence.
5. Refresh directly stale active docs and `plugins.md`.
6. Run focused validation, strict same-branch QA, full validation, closeout updates, final reruns if needed, exactly one commit, push, and PR.

## Validation and Acceptance

Validation commands:

- `git diff --check`
- `pnpm exec tsx tools/read-only-mcp-protected-resource-metadata-route-input-proof.mjs`
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
- `pnpm --filter @pocket-cto/domain exec vitest run src/benchmark-community.spec.ts src/read-only-app-mcp.spec.ts src/read-only-app-mcp-descriptor.spec.ts src/read-only-app-mcp-public-security.spec.ts src/read-only-app-mcp-endpoint-architecture.spec.ts src/read-only-app-mcp-endpoint-route-ownership.spec.ts src/read-only-app-mcp-protocol-envelope.spec.ts src/read-only-app-mcp-evidence-tool-dispatch.spec.ts src/read-only-app-mcp-oauth-security.spec.ts src/read-only-app-mcp-remote-host-readiness.spec.ts src/read-only-app-mcp-remote-host-resource.spec.ts src/read-only-app-mcp-protected-resource-metadata.spec.ts src/read-only-app-mcp-protected-resource-metadata-builder.spec.ts src/read-only-app-mcp-protected-resource-metadata-route-input.spec.ts src/read-only-app-mcp-canonical-resource-proof.spec.ts src/read-only-app-mcp-canonical-resource-validation.spec.ts`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/read-only-app-mcp-endpoint/routes.spec.ts src/modules/read-only-app-mcp-endpoint/service.spec.ts src/modules/read-only-app-mcp-endpoint/evidence-dispatcher.spec.ts src/app.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

Acceptance requires exactly one FP-0124 path, FP-0125 absent, FP-0124 docs-and-plan/proof-gate only, no route behavior change, no new route path, no protected-resource metadata route, no WWW-Authenticate route behavior, no OAuth/token/session/auth middleware, no remote MCP deployment, no deployment config, no Apps SDK resources, no public app behavior, no app submission, no DB queries, no schemas/migrations, no package scripts, no fixtures/datasets/source packs, no public assets, no listing copy, no generated public prose, no OpenAI API/model calls, no provider/external calls, no source mutation, no finance writes, no generated finance advice, no runtime-Codex finance output, no autonomous action, preserved FP-0123/0122/0121/0120/0118/0117/0107/0106/0100 boundaries, and a concrete recommendation that public ChatGPT App submission must wait.

If a post-validation doc closeout edit is made, rerun:

- `git diff --check`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

## Idempotence and Recovery

This is docs/proof-gate compatibility only. There are no migrations, provider resources, OAuth registrations, tokens, sessions, source artifacts, finance writes, deployment configs, route files, public assets, Apps SDK resources, app-submission artifacts, or runtime state to roll back.

If validation fails, patch only the FP-0124 plan, proof-gate bridge, focused specs, or directly stale docs on this branch. If validation reveals a broader shipped-boundary defect, stop and recommend the smallest safer corrective slice instead of widening FP-0124.

## Artifacts and Notes

Expected artifacts are this FP-0124 plan, focused proof-gate bridge updates, focused specs, directly stale active-doc/plugin refresh, and validation evidence.

Replay implication: FP-0124 does not ingest sources, mutate raw source files, create mission outputs, change mission state, release communications, write finance state, or create runtime-Codex finance output. No mission replay event is required beyond plan progress, decision log, proof output, and final validation evidence.

Provenance/freshness/limitations implication: FP-0124 does not answer finance questions or compile reports. It preserves the future requirement that route/tool outputs expose provenance, freshness posture, and limitations when relevant, and that metadata, auth challenges, logs, proof output, public docs, app-submission artifacts, and structured tool results must not contain token material, private finance data, raw source dumps, generated finance advice, or unauthenticated company authority.

## Interfaces and Dependencies

Primary module touch is `packages/domain` proof-gate helpers and specs. Direct proof tooling under `tools/` may change only for proof-gate bridge compatibility. `apps/control-plane` route files are validation context only and must not change.

No new environment variables, package scripts, route paths, schemas, migrations, DB queries, fixtures, datasets, sample data, source packs, public assets, provider configs, OpenAI API/model integrations, Apps SDK resources, OAuth/session/auth middleware, deployment files, public app behavior, app submission assets, or external communications are introduced.

## Outcomes & Retrospective

FP-0124 plans protected-resource metadata route implementation sequencing only. It decides a future FP-0125 may open a narrow local-only route implementation slice only if it uses explicit FP-0123 route-input evidence bundle dependency injection, fails closed when evidence is absent or invalid, emits only the bounded FP-0122 metadata document fields, proves no-token-leakage before registration, keeps `/mcp` behavior unchanged, records authenticated company binding as a prerequisite rather than unauthenticated authority, and keeps WWW-Authenticate behavior separate.

Validation before this closeout edit passed for the full FP-0124 ladder: `git diff --check`, all required proof tools, focused domain specs, focused control-plane specs, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`. This final plan edit requires the documented post-closeout subset rerun before commit.

FP-0124 shipped through PR #296 as docs-and-plan/proof-gate-only route implementation planning. It authorized only a future narrow FP-0125 local-only explicit-dependency protected-resource metadata route implementation lane; it did not authorize public/remote route publication, `/mcp` behavior change, WWW-Authenticate behavior, OAuth/token/session/auth middleware, remote MCP deployment, deployment config, Apps SDK resource, public app behavior, app submission, DB/schema/package/fixture/source-pack/public-asset/listing-copy/generated-public-prose/OpenAI/provider/source-mutation/finance-write/autonomous-action work.
