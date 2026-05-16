# FP-0121 read-only ChatGPT App MCP protected-resource metadata route implementation planning

## Purpose / Big Picture

FP-0121 is a docs-and-plan plus proof-gate compatibility master plan for protected-resource metadata route implementation readiness after FP-0120.

The target phase is V2AO. This slice exists because FP-0118 proved protected-resource metadata and auth challenge readiness contracts, FP-0119 planned protected-resource metadata route implementation sequencing and decided route implementation should not start from current repo truth, and FP-0120 proved canonical public MCP resource URI and `authorization_servers` readiness contracts while keeping the exact canonical URI and authorization server/provider unresolved.

FP-0121 is planning plus proof-gate compatibility only. It plans future protected-resource metadata route implementation readiness. It does not implement the route. It does not add route paths. It does not implement WWW-Authenticate route behavior. It does not implement OAuth. It does not implement token/session. It does not implement auth middleware. It does not deploy remote MCP. It does not add deployment config. It does not add Apps SDK resources. It does not create FP-0122. It does not add public ChatGPT App behavior, app submission, public assets, listing copy, generated public prose, DB queries, schemas, migrations, package scripts, fixtures, sample data, source packs, provider calls, OpenAI API/model calls, external communications, source mutation, finance writes, generated finance advice, runtime-Codex finance output, or autonomous action.

## Progress

- [x] 2026-05-16T18:06:10Z: Invoked Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor from the repo-local Pocket CFO operator bundle. GitHub Connector Guard was not invoked because GitHub connector product behavior is out of scope.
- [x] 2026-05-16T18:06:10Z: Confirmed work is on `codex/v2ao-read-only-chatgpt-app-mcp-protected-resource-metadata-route-implementation-planning-local-v1`, the worktree was clean before edits, PR #289 and the FP-0120 proof-hardening correction are merged, FP-0120 exists and is shipped, FP-0121 was absent, FP-0122 was absent, and active docs support FP-0120 as shipped local/proof-only canonical resource/auth-server readiness contracts.
- [x] 2026-05-16T18:06:10Z: Ran the baseline direct proof ladder before edits. The listed proof tools passed and continued to prove `/mcp` route adapter existence, default `buildApp()` fail-closed behavior without explicit dependency, explicit local read-only dispatch through app construction, FP-0121 absence, and FP-0122 absence.
- [x] 2026-05-16T18:06:10Z: Used official MCP, RFC 9728, and OpenAI web documentation as read-only research context. OpenAI Developers exposed only OpenAI Platform API-key setup tools in this thread, not read-only docs tools, so no OpenAI Platform key setup, OpenAI API/model call, provider call, upload, app submission, deployment, or screenshot workflow was used.
- [x] 2026-05-16T19:20:37Z: Continued the same FP-0121 branch after validation stopped at `tools/read-only-mcp-evidence-tool-dispatch-adapter-proof.mjs` on `noDbQueriesAdded`. Classified the issue as stale proof-gate compatibility for the exact FP-0121 docs/proof-only path, not network instability and not DB/runtime drift.
- [x] 2026-05-16T19:20:37Z: Patched only proof-gate compatibility boundaries so the FP-0109 evidence dispatch adapter proof and FP-0107 route adapter proof accept the exact FP-0121 plan while keeping DB query, schema/migration, package script, route behavior, protected-resource metadata route, WWW-Authenticate behavior, OAuth/token/session/auth middleware, remote deployment, Apps SDK resource, public app, app-submission, source mutation, and finance-write rejection active.
- [x] 2026-05-16T19:20:37Z: Reran the corrected failed proof, the full direct proof ladder, focused domain specs, focused control-plane `/mcp` route/service/dispatcher/app-wiring specs, and strict same-branch QA. These passed before final validation.

## Surprises & Discoveries

- OpenAI Developers was present as an installed plugin family, but tool discovery exposed only OpenAI Platform API-key setup tools. Per slice policy, official web docs were used instead.
- The current MCP authorization documentation says protected-resource metadata discovery may be by `WWW-Authenticate resource_metadata` or a well-known URI, and MCP clients must support both. That supports keeping route publication and `/mcp` auth challenge behavior as separate implementation lanes.
- RFC 9728 path derivation remains decisive for a canonical protected resource with a path. If the future canonical public MCP resource URI ends in `/mcp`, the derived metadata route is `GET /.well-known/oauth-protected-resource/mcp`; if a later plan proves host-root canonical resource identity, the root metadata path is `GET /.well-known/oauth-protected-resource`; dual path remains deferred unless a future proof justifies both.

## Decision Log

- Decision: Protected-resource metadata route implementation should not start from current repo truth yet. FP-0121 may only plan readiness because the exact stable HTTPS canonical public resource URI remains deferred and authorization server/provider remains unresolved.
- Decision: Implementation must not start while the canonical public URI is still deferred. A future implementation lane needs the canonical URI prerequisite proved as an exact stable HTTPS URI without query, fragment, local tunnel, placeholder, workspace, tenant, user, org, or unauthenticated company selector authority.
- Decision: Implementation must not start while `authorization_servers` or provider remains unresolved. The authorization_servers prerequisite is a non-empty issuer list tied to the protected resource metadata document, plus provider-neutral evidence for how the list is generated, tested, and reviewed.
- Decision: The exact route path decision remains deferred. Current contract evidence favors the `/mcp`-derived metadata path `/.well-known/oauth-protected-resource/mcp` if the canonical resource is `https://.../mcp`; the root metadata path is only valid if the canonical resource is host root; dual publication remains future-only.
- Decision: A local-only protected-resource metadata route should not be added before the remote/public host and canonical URI exist unless a later Finance Plan proves it is contract-only, local-only, not exposed, and safer than waiting. FP-0121 does not authorize that exception.
- Decision: WWW-Authenticate route behavior remains a later separate implementation lane because it changes `/mcp` unauthenticated, invalid-token, wrong-scope, and token-failure responses.
- Decision: The future route tests must exist before route code is added. They must prove exact accepted path, method, content type, cache posture, no token material, fail-closed invalid canonical URI behavior, no root/derived ambiguity, no route expansion, and no `/mcp` behavior change.
- Decision: The future metadata document tests must exist before route code is added. They must prove `resource`, non-empty `authorization_servers`, read-only `scopes_supported`, header-only `bearer_methods_supported`, no private finance data, no token leakage, stable serialization, and RFC 9728-compatible path derivation.
- Decision: The future no-token-leakage proof must exist before route code is added. It must cover metadata JSON, headers, logs, proof output, evidence bundles, UI props, docs examples, app-submission artifacts, and structured tool results.
- Decision: The future local /mcp unchanged-behavior proof must exist before route code is added. It must prove `POST /mcp`, `GET /mcp`, local Origin fail-closed behavior, notification 202 behavior, default `buildApp()` fail-closed behavior, and explicit app-construction local dispatch are unchanged.
- Decision: Canonical URI/auth-server evidence must exist before route code is added. The evidence must point to the exact canonical resource URI, authorization server issuer set, provider-neutral ownership, route derivation result, and authenticated company binding gate.
- Decision: FP-0122 remains absent. If every gate is satisfied later, FP-0122 may open only one narrow protected-resource metadata route implementation lane and must keep WWW-Authenticate behavior, OAuth/token/session/auth middleware, remote deployment, Apps SDK resources, public app behavior, and app submission separate unless explicitly re-planned.
- Decision: Public ChatGPT App submission must wait. App submission and public listing work require public host, OAuth/security, submission materials, review credentials, privacy/security review, and human approval that are not part of FP-0121.

## Context and Orientation

FP-0120 is shipped as local/proof-only/read-only canonical resource/auth-server readiness contracts with post-merge proof hardening. It proves canonical public MCP resource URI requirements, deferred exact stable HTTPS URI decision, no selector/query/fragment/local-tunnel authority, required but unresolved provider-neutral `authorization_servers`, RFC 9728 route-path derivation, `WWW-Authenticate resource_metadata` URL readiness, durable route inventory, validation-gated metadata URL derivation, and no-route-runtime posture.

FP-0119 is shipped as docs-and-plan/proof-gate compatibility for protected-resource metadata route implementation sequencing and WWW-Authenticate challenge sequencing. FP-0118 is shipped as local/proof-only protected-resource metadata/auth challenge readiness contracts. FP-0117 is shipped OAuth/token/session/auth implementation sequencing. FP-0116 is shipped remote host owner/canonical URI/resource metadata contracts. FP-0113 is shipped OAuth/token/session/user-org/company binding security contracts. FP-0107 is the shipped local `/mcp` route-adapter shell. FP-0106 and FP-0100 remain the protocol-envelope and public-security boundaries.

Official research ledger:

- MCP Authorization specification (`https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization` and current draft page): used for protected-resource metadata requirements, required `authorization_servers`, resource indicators, canonical server URI/resource parameter, access token header handling, audience/resource validation, token passthrough prohibition, status-code posture, scope challenge handling, and `WWW-Authenticate resource_metadata` discovery.
- RFC 9728 OAuth 2.0 Protected Resource Metadata (`https://www.rfc-editor.org/rfc/rfc9728`): used for protected-resource metadata field semantics, `resource`, `authorization_servers`, `scopes_supported`, `bearer_methods_supported`, well-known route derivation, metadata response semantics, security considerations, and path-vs-root derivation.
- MCP Transports specification (`https://modelcontextprotocol.io/specification/draft/basic/transports`): used for Streamable HTTP single endpoint posture, POST/GET `/mcp` behavior, GET SSE or 405 posture, Origin validation, localhost binding, header/body consistency, and proper authentication recommendations.
- MCP Security Best Practices (`https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices`): used for confused deputy posture, token passthrough prohibition, audience validation, consent, token storage, logging redaction, least privilege, and fail-closed public exposure planning.
- OpenAI Developer Mode docs (`https://developers.openai.com/api/docs/guides/developer-mode`): used for future ChatGPT developer-mode context, remote MCP protocol/authentication support, and why this slice does not connect or test a public app.
- OpenAI MCP docs (`https://developers.openai.com/api/docs/mcp`): used for future custom MCP safety context, privacy overreach and prompt-injection risks, and why read-only, no-write, no-provider boundaries remain mandatory.
- OpenAI Apps in ChatGPT help (`https://help.openai.com/en/articles/11487775`) and Build with Apps SDK help (`https://help.openai.com/en/articles/12515353-build-with-the-apps-sdk`): used for future Apps SDK packaging, workspace/developer-mode, and privacy-policy expectations only.
- OpenAI Submit and maintain your app docs (`https://developers.openai.com/apps-sdk/deploy/submission`): used only as future submission context. FP-0121 creates no app-submission assets, listing copy, screenshots, public app behavior, review credentials, or external communication.
- OpenAI App Developer Terms (`https://openai.com/policies/developer-apps-terms/`): used for safety boundary context around security, misleading behavior, policy compliance, and prohibited autonomous financial transactions.

GitHub connector product behavior is out of scope. Routine `git`, push, and PR publication may happen after validation.

## Plan of Work

Create exactly one Finance Plan file for FP-0121 and keep it docs-and-plan/proof-gate only.

Bridge the minimum proof gates so exactly `plans/FP-0121-read-only-chatgpt-app-mcp-protected-resource-metadata-route-implementation-planning.md` is accepted while FP-0122 remains absent. The bridge must prove FP-0121 only plans protected-resource metadata route implementation readiness and does not authorize route behavior changes, route expansion, protected-resource metadata route implementation, WWW-Authenticate route behavior, OAuth implementation, token/session implementation, auth middleware, remote MCP deployment, deployment config, Apps SDK resources, public app behavior, app submission, DB queries, schemas, migrations, package scripts, fixtures, sample data, source packs, OpenAI API/model calls, provider calls, public assets, listing copy, generated public prose, source mutation, finance writes, generated finance advice, runtime-Codex finance output, or autonomous action.

Refresh only directly stale active docs and `plugins.md` so FP-0120 is shipped, FP-0121 is the active docs-only readiness plan, FP-0122 remains absent, and public app submission remains future-only.

## Concrete Steps

1. Keep work on `codex/v2ao-read-only-chatgpt-app-mcp-protected-resource-metadata-route-implementation-planning-local-v1`.
2. Confirm preflight gates and baseline proof tools before edits.
3. Add this exact FP-0121 plan and no FP-0122 file.
4. Add proof-gate bridge helpers and fields for FP-0121 exact-path acceptance plus FP-0122 absence.
5. Add focused specs proving FP-0121 is docs-and-plan/proof-gate only, includes canonical URI prerequisite, authorization_servers prerequisite, exact route path decision, route tests, metadata document tests, no-token-leakage, local /mcp unchanged-behavior, authenticated company binding, and FP-0122 absence.
6. Refresh directly stale active docs and `plugins.md`.
7. Run focused validation, strict same-branch QA, full validation, closeout updates, final reruns if needed, exactly one commit, push, and PR.

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
- `pnpm --filter @pocket-cto/domain exec vitest run src/benchmark-community.spec.ts src/read-only-app-mcp.spec.ts src/read-only-app-mcp-descriptor.spec.ts src/read-only-app-mcp-public-security.spec.ts src/read-only-app-mcp-endpoint-architecture.spec.ts src/read-only-app-mcp-endpoint-route-ownership.spec.ts src/read-only-app-mcp-protocol-envelope.spec.ts src/read-only-app-mcp-evidence-tool-dispatch.spec.ts src/read-only-app-mcp-oauth-security.spec.ts src/read-only-app-mcp-remote-host-readiness.spec.ts src/read-only-app-mcp-remote-host-resource.spec.ts src/read-only-app-mcp-protected-resource-metadata.spec.ts src/read-only-app-mcp-canonical-resource-proof.spec.ts src/read-only-app-mcp-canonical-resource-validation.spec.ts`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/read-only-app-mcp-endpoint/routes.spec.ts src/modules/read-only-app-mcp-endpoint/service.spec.ts src/modules/read-only-app-mcp-endpoint/evidence-dispatcher.spec.ts src/app.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

Acceptance requires exactly one FP-0121 path, FP-0122 absent, FP-0121 docs-and-plan/proof-gate only, no route behavior change, no new route path, no protected-resource metadata route, no WWW-Authenticate route behavior, no OAuth/token/session/auth middleware, no remote MCP deployment, no deployment config, no Apps SDK resources, no public app behavior, no app submission, no DB queries, no schemas/migrations, no package scripts, no fixtures/datasets/source packs, no public assets, no listing copy, no generated public prose, no OpenAI API/model calls, no provider/external calls, no source mutation, no finance writes, no generated finance advice, no runtime-Codex finance output, no autonomous action, preserved local `/mcp` behavior, preserved default fail-closed `buildApp()`, preserved explicit app-construction local read-only dispatch, preserved FP-0120/0119/0118/0117/0116/0113/0107/0106/0100 boundaries, and a concrete recommendation that route implementation waits unless a future FP-0122 satisfies every gate.

## Idempotence and Recovery

This is docs/proof-gate compatibility only. There are no migrations, provider resources, OAuth registrations, tokens, sessions, source artifacts, finance writes, deployment configs, route files, public assets, Apps SDK resources, or runtime state to roll back.

If validation fails, patch only the FP-0121 protected-resource metadata route implementation planning proof-gate bridge or directly stale docs on this branch. If validation reveals a broader shipped-boundary defect, stop and recommend the smallest safer corrective slice instead of widening FP-0121.

## Artifacts and Notes

Expected artifacts are this FP-0121 plan, focused proof-gate bridge updates, focused specs, directly stale active-doc/plugin refresh, and validation evidence.

Replay implication: FP-0121 does not ingest sources, mutate raw source files, create mission outputs, change mission state, release communications, write finance state, or create runtime-Codex finance output. No mission replay event is required beyond plan progress, decision log, proof output, and final validation evidence.

Provenance/freshness/limitations implication: FP-0121 does not answer finance questions or compile reports. It preserves the future requirement that route/tool outputs expose provenance, freshness posture, and limitations when relevant, and that metadata, auth challenges, logs, proof output, public docs, and app-submission artifacts must not contain token material, private finance data, raw source dumps, or generated finance advice.

## Interfaces and Dependencies

Primary module touch is `packages/domain` proof-gate helpers and specs. Direct proof tooling under `tools/` may change only for proof-gate bridge compatibility. `apps/control-plane` route files are validation context only and must not change.

No new environment variables, package scripts, route paths, schemas, migrations, DB queries, fixtures, datasets, sample data, source packs, public assets, provider configs, OpenAI API/model integrations, Apps SDK resources, OAuth/session/auth middleware, deployment files, public app behavior, app submission assets, or external communications are introduced.

## Outcomes & Retrospective

FP-0121 plans protected-resource metadata route implementation readiness only. It decides route implementation should not start next unless a future FP-0122 first satisfies the exact canonical HTTPS URI, non-empty `authorization_servers`, provider/auth-server ownership, exact route path, route tests, metadata document tests, no-token-leakage proof, local `/mcp` unchanged-behavior proof, authenticated company binding, and no-public/submission/deployment/OAuth widening gates.

The proof-gate bridge is intended to accept exactly this FP-0121 docs-only plan while keeping FP-0122 absent and preserving FP-0120, FP-0119, FP-0118, FP-0117, FP-0116, FP-0113, FP-0107, FP-0106, and FP-0100 boundaries.

Closeout validation and commit/PR details will be recorded after final validation passes.
