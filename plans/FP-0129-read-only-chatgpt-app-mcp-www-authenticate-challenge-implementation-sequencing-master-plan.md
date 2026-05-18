# FP-0129 read-only ChatGPT App MCP WWW-Authenticate challenge implementation sequencing master plan

## Purpose / Big Picture

FP-0129 is a docs-and-plan plus proof-gate compatibility master plan for sequencing future `WWW-Authenticate` `resource_metadata` challenge implementation after FP-0128.

This slice decides whether challenge implementation may start from current repo truth and what must remain blocked. It does not implement `WWW-Authenticate` headers, change any route, change `/mcp`, change protected-resource metadata route behavior, validate tokens, parse real tokens, implement OAuth, store tokens or sessions, add auth middleware, deploy remote MCP, add deployment config, add Apps SDK resources, prepare app submission, add DB queries, change schema or migrations, add package scripts, add fixtures or data, add source packs, call OpenAI APIs/models, call providers, mutate sources, write finance state, generate finance advice, create public assets, write listing copy, generate public prose, or take autonomous action.

The target phase is V2AW read-only ChatGPT App/MCP WWW-Authenticate challenge implementation sequencing. The user-visible purpose is not runtime auth. The proof point is that the repo can now truthfully say which challenge route implementation lane may open next, which token-validation cases must wait, and which public/remote/app-submission blockers remain.

## Progress

- [x] 2026-05-17T22:39:34Z: Invoked the requested repo-local `pocket-cfo-codex-operator` skills: Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor. GitHub Connector Guard was not invoked because GitHub connector product behavior is out of scope.
- [x] 2026-05-17T22:39:34Z: Confirmed the branch is `codex/v2aw-read-only-chatgpt-app-mcp-www-authenticate-challenge-implementation-sequencing-master-plan-local-v1`, the worktree was clean before edits, PR #302 is merged to `main`, FP-0128 exists and is shipped, FP-0129 was absent, and FP-0130 was absent.
- [x] 2026-05-17T22:39:34Z: Ran the required pre-edit proof ladder. All 19 existing proof tools named by this slice passed before edits. Baseline log: `/tmp/fp0129-baseline-proofs-1779057450.log`.
- [x] 2026-05-17T22:39:34Z: Confirmed OpenAI Developers tooling exposed only OpenAI Platform API-key setup tools, not read-only docs tools. No OpenAI Developers tool, OpenAI API key flow, OpenAI API call, or model call was used.
- [x] 2026-05-17T22:39:34Z: Reviewed official MCP, RFC 9728, and OpenAI Apps SDK web docs as read-only protocol/platform context.
- [x] 2026-05-17T22:39:34Z: Opened FP-0129 as a docs-and-plan/proof-gate compatibility slice only.
- [x] 2026-05-17T22:53:32Z: Added the minimum proof-gate bridge so exactly this FP-0129 plan is accepted while FP-0130 remains absent.
- [x] 2026-05-17T22:53:32Z: Refreshed directly stale active docs and `plugins.md` where they still described FP-0129 as absent or future-only.
- [x] 2026-05-17T22:53:32Z: Ran focused validation. Domain FP-0128/FP-0127/metadata specs passed with 47 tests. Control-plane `/mcp`, protected-resource metadata route, service, dispatcher, and app specs passed with 114 tests. All 19 requested proof tools passed after the bridge.
- [x] 2026-05-17T22:53:32Z: Ran strict same-branch QA. Changed files are limited to docs/proof-gate compatibility scope, route diffs are empty, exactly one FP-0129 plan exists, FP-0130 is absent, and no package, DB, schema, migration, deployment, public asset, fixture, sample data, source-pack, provider, OpenAI, source-mutation, or finance-write path drift was found.
- [x] 2026-05-17T22:55:02Z: Final validation initially exposed one FP-0123 route-input proof allowlist compatibility gap for the exact FP-0129 plan path. Patched the existing protected-resource metadata route-input proof-gate bridge on this branch, added focused spec coverage, and reran the failed route-input proof/spec successfully.
- [x] 2026-05-17T22:55:44Z: Restarted final validation and found the expected upstream FP-0128 token-validation durability allowlist needed to recognize the route-input bridge spec/helper touched by this slice. Patched the token-validation proof inventory only.
- [x] 2026-05-17T22:56:31Z: Restarted final validation and found the older FP-0122 protected-resource metadata builder proof tool also needed the exact FP-0129 plan path in its local docs/proof allowlist. Patched that proof tool only.
- [x] 2026-05-17T22:57:10Z: Added the FP-0122 builder proof tool path to the FP-0128 token-validation inventory after that exact proof-gate tool changed during compatibility QA.
- [x] 2026-05-17T22:58:40Z: Restarted final validation and found the FP-0107 route-adapter proof tool also needed the exact FP-0129 plan path in its changed-file allowlist. Patched that proof tool and added its exact tool path to the FP-0128 token-validation inventory.
- [x] 2026-05-17T23:07:07Z: Final validation passed after same-branch compatibility corrections: `git diff --check`, all 19 requested proof tools, focused domain specs with 65 tests, focused control-plane route/app specs with 114 tests, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.
- [x] 2026-05-17T23:16:17Z: PR #304 merged to `main`; FP-0129 is shipped as a docs-and-plan plus proof-gate compatibility record.

## Surprises & Discoveries

- FP-0128 already hardened the token-validation readiness proof so current-repo inventory is scanned in addition to clean-worktree changed paths. FP-0129 should build on that durability instead of adding route code.
- OpenAI Developers is installed as a plugin family, but the only exposed tools in this thread are API-key setup tools. Those are out of scope for FP-0129.
- MCP Authorization requires protected resource metadata and says `401 Unauthorized` responses can carry the metadata URL in a `WWW-Authenticate` `resource_metadata` parameter. It also requires presented tokens to be intended for the MCP server.
- RFC 9728 defines protected resource metadata and the use of `WWW-Authenticate` to inform clients of metadata. Its security considerations recommend audience-restricted access tokens and resource indicators for multi-resource clients.
- MCP Security Best Practices treats token passthrough as a forbidden anti-pattern and recommends precise, least-privilege scope challenges instead of broad scope catalogs.
- OpenAI Apps SDK Authentication expects authenticated MCP servers to verify token signature, issuer, expiry/not-before, audience/resource, and scopes before attaching identity or returning `401` with a `WWW-Authenticate` challenge. FP-0129 records this as future runtime work only.
- The FP-0123 route-input durability proof needed a compatibility bridge for the exact FP-0129 docs-only plan path. The correction stayed in proof-gate code and did not change any route behavior.
- The FP-0128 token-validation durability inventory also needed to recognize the FP-0123 route-input bridge helper/spec paths introduced during QA correction. This stayed in proof-gate compatibility code.
- The FP-0122 builder proof tool had its own local allowlist and needed the exact FP-0129 plan path to keep older protected-resource metadata proof gates compatible.
- The FP-0107 route-adapter proof tool also had its own local changed-file allowlist and needed the exact FP-0129 plan path. No `/mcp` route source changed.

## Decision Log

- Decision: FP-0129 may start because PR #302 is merged, FP-0128 is shipped, FP-0129 and FP-0130 were absent, active docs support FP-0128 as shipped proof-only token-validation readiness contracts, and FP-0128/FP-0127/FP-0125/local route/proof tools all passed before edits.
- Decision: WWW-Authenticate challenge implementation can start next only as a narrow later implementation plan after FP-0129 validation is green. FP-0129 itself does not implement any header or route behavior.
- Decision: Missing-token challenge behavior may be the first future implementation candidate before token-validation runtime, but only as a no-token, no-real-token, local-only route emission slice that proves no token parsing, no token validation, no token/session storage, no auth middleware, no protected-resource metadata route drift, and no `/mcp` dispatch drift.
- Decision: Invalid-token challenge behavior must not implement semantic token validation before token-validation runtime exists. A future slice may only emit a generic invalid-token challenge if it is based on an already-fail-closed route posture and proves it does not parse, decode, introspect, store, forward, or verify real tokens. Malformed, expired, wrong-audience, wrong-resource, wrong-scope, wrong-org, revoked, replayed, and token-passthrough-attempt cases remain in the later token-validation runtime lane.
- Decision: Local challenge behavior may reference the local protected-resource metadata route path `/.well-known/oauth-protected-resource/mcp` only for local/proof-only behavior with an explicit dependency on the existing FP-0125 route evidence posture. Public runtime challenge references are blocked until canonical public URL proof, remote/public host readiness, HTTPS/TLS, and authorization-server readiness are complete.
- Decision: Challenge behavior must not attach to `/mcp` `initialize`, `ping`, `tools/list`, or `tools/call` until auth middleware exists. Before auth middleware, `/mcp` methods keep their existing JSON-RPC refusal behavior.
- Decision: Challenge emission is an HTTP auth boundary. JSON-RPC refusal semantics remain separate from auth challenge emission. A future challenge route slice must prove whether it runs before JSON-RPC dispatch, after failed auth middleware, or on a separate local auth guard path without changing existing refusal envelopes.
- Decision: Protected-resource metadata route behavior remains unchanged. FP-0129 may reference the shipped route path and metadata fields but may not change registration, response fields, evidence-bundle dependency, or default `buildApp()` absence.
- Decision: Route emission requires an explicit later implementation Finance Plan. FP-0130 remains absent in this slice.
- Decision: Required future implementation tests include no-token-leakage, no-real-token examples, no-auth-runtime, no-route-drift, protected-resource metadata route unchanged, `/mcp` unchanged, no new route path, no token parsing/validation/session/auth middleware, no OAuth, no remote/deployment config, no DB/schema/package/data/source-pack/public asset/OpenAI/provider/source/finance-write scope, and exact challenge header contract tests.
- Decision: Token validation runtime, token parsing, OAuth, token/session storage, auth middleware, remote MCP, deployment config, Apps SDK resources, public app behavior, app submission, provider/certification/deployment execution, source mutation, finance writes, and external communications remain future-only.

## Context and Orientation

FP-0127 shipped local/proof-only WWW-Authenticate auth-challenge contracts. It proves future Bearer challenge shape, required `resource_metadata` reference posture, local-vs-public metadata reference boundaries, missing/invalid token contract posture, later token failure modes, least-privilege scope challenge guidance, no-token-leakage, unchanged `/mcp`, and no-runtime posture.

FP-0128 shipped local/proof-only token-validation failure readiness contracts. It proves token-validation runtime deferral, token parsing deferral, token/session storage deferral, auth middleware deferral, token failure taxonomy, audience/resource validation prerequisites, read-only scope challenge prerequisites, authenticated user/org/company binding, client `companyKey` selector-only posture, token passthrough prohibition, no-token-leakage, no-runtime posture, and FP-0127 contract preservation.

FP-0125 shipped a local-only protected-resource metadata route at `/.well-known/oauth-protected-resource/mcp`, registered only when app construction supplies a valid FP-0123 route-input evidence bundle. Default `buildApp()` does not register the metadata route, and `/mcp` behavior remains unchanged.

Official read-only protocol and platform context used by this plan:

- Model Context Protocol Authorization specification, draft/basic page crawled during this slice: protocol context for protected-resource metadata, `WWW-Authenticate` `resource_metadata`, resource indicators, canonical MCP resource URI, token audience/resource validation, scope challenge handling, and token passthrough prohibition.
- Model Context Protocol Transports specification, draft/basic page crawled during this slice: protocol context for preserving Streamable HTTP `/mcp`, POST shape, Origin validation, localhost-only local posture, and JSON-RPC response separation.
- Model Context Protocol Security Best Practices page crawled during this slice: security context for token passthrough prohibition, scope minimization, precise scope challenges, confused-deputy risks, and local server protection.
- RFC 9728, OAuth 2.0 Protected Resource Metadata, April 2025: standards context for protected resource metadata, obtaining metadata, `WWW-Authenticate` use, metadata validation, scopes, audience-restricted access tokens, resource indicators, and metadata publication risks.
- OpenAI Apps SDK Authentication page crawled during this slice: platform context for authenticated MCP servers, token verification expectations, mTLS client identification, OAuth provider preference, and future `401` challenge posture.
- OpenAI Apps SDK Connect from ChatGPT, Test your integration, Submit and maintain your app, Security & Privacy, and App submission guidelines pages crawled during this slice: platform context for HTTPS/public `/mcp`, developer-mode testing, submission prerequisites, public endpoint review, screenshots/assets/listing fields, and why those remain future-only here.

## Plan of Work

1. Create exactly one FP-0129 plan file with a narrow docs/proof-gate compatibility boundary.
2. Add proof-gate helpers that accept either FP-0129 absence or exactly this docs-only plan while requiring FP-0130 absence.
3. Update minimum proof schemas/tools that currently require FP-0129 absence so they instead prove the exact FP-0129 docs-only boundary.
4. Add focused specs proving the plan decisions, forbidden scopes, and preserved prior boundaries.
5. Refresh directly stale active docs and `plugins.md` only where they still say FP-0129 is absent or future-only.
6. Run focused validation, strict same-branch QA, final validation, closeout, one commit, push, and PR.

## Concrete Steps

1. Add `plans/FP-0129-read-only-chatgpt-app-mcp-www-authenticate-challenge-implementation-sequencing-master-plan.md`.
2. Add FP-0129/FP-0130 constants and plan-boundary helpers under the existing read-only ChatGPT App/MCP proof modules.
3. Update `McpTokenValidationReadinessProofSchema`, `McpWwwAuthenticateAuthChallengeProofSchema`, protected-resource metadata proof schemas, OAuth sequencing proof schema, and their proof tools only as needed for the FP-0129 bridge.
4. Add focused Vitest coverage under existing domain specs for exact FP-0129 path acceptance, FP-0130 absence, docs/proof-only boundary, planning text decisions, forbidden scope absence, no-route/no-runtime/no-token/no-OAuth/no-deployment/no-public-app guarantees, JSON-RPC refusal separation, and preserved FP-0128/0127/0126/0125/0123/0122/0120/0118/0117/0107/0106/0100 boundaries.
5. Patch directly stale active docs if review shows they still identify FP-0129 as absent after this slice.

## Validation and Acceptance

Acceptance requires:

- exactly one FP-0129 file exists at `plans/FP-0129-read-only-chatgpt-app-mcp-www-authenticate-challenge-implementation-sequencing-master-plan.md`
- FP-0129 is docs-and-plan/proof-gate only
- FP-0129 plans future WWW-Authenticate challenge implementation sequencing only
- FP-0130 remains absent
- no `/mcp` route behavior changed
- no protected-resource metadata route behavior changed
- no WWW-Authenticate route behavior or header emission exists
- no route path is added
- no token validation runtime, token parsing runtime, OAuth, token/session storage, or auth middleware exists
- no remote MCP deployment, deployment config, Apps SDK resource, public app behavior, app submission, DB queries, schema/migration, package scripts, fixtures, sample data, source packs, public assets, listing copy, generated public prose, OpenAI API/model calls, provider calls, source mutation, finance writes, generated finance advice, external communications, or autonomous action exists
- planning text includes missing-token and invalid-token sequencing
- planning text keeps malformed, expired, wrong-audience, wrong-resource, wrong-scope, wrong-org, revoked, replayed, and token-passthrough-attempt modes in the later token-validation runtime lane
- planning text says public `resource_metadata` runtime references wait for canonical public URL proof and remote/public host readiness
- planning text separates JSON-RPC refusal semantics from auth challenge emission
- planning text keeps protected-resource metadata route behavior unchanged
- FP-0128 token-validation readiness, FP-0127 WWW-Authenticate challenge contracts, FP-0126 sequencing, FP-0125 metadata route/evidence posture, FP-0123 route-input evidence, FP-0122 builder, FP-0120 canonical resource/auth-server readiness, FP-0118 metadata readiness, FP-0117 OAuth sequencing, FP-0107 route adapter, FP-0106 protocol envelope, and FP-0100 public security boundaries remain proven

Validation command set:

```bash
git diff --check
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

## Idempotence and Recovery

This slice is idempotent because it creates one plan and proof-gate compatibility helpers only. It adds no route behavior, no token runtime, no auth middleware, no deployment, no database state, no source ingestion, and no finance write.

If validation fails for FP-0129 plan text or proof-gate bridge reasons, patch this same branch and rerun the required gates. If unrelated dirty files, missing services, missing proof tools, or auth failures appear, stop and report the smallest safer correction. If FP-0130 appears, remove it from this slice and rerun proof gates.

## Artifacts and Notes

- Plan artifact: `plans/FP-0129-read-only-chatgpt-app-mcp-www-authenticate-challenge-implementation-sequencing-master-plan.md`
- Proof-gate artifacts: existing read-only ChatGPT App/MCP domain proof helpers and direct proof tools, updated only for bridge compatibility.
- No raw sources, source snapshots, uploaded exports, PDFs, source documents, finance evidence, generated public assets, app-submission assets, screenshots, or external artifacts are created or mutated.
- Replay implication: no mission state changes, ingest actions, reports, approvals, monitor outputs, or finance write actions occur. No replay event is required for this docs/proof-gate slice.
- Evidence/provenance implication: the slice proves auth/challenge sequencing and preserved evidence posture only. It does not create finance answers and does not alter freshness, source lineage, raw evidence, CFO Wiki output, or derived twin state.
- GitHub connector work is out of scope. Routine `git`, `gh`, push, and PR operations are repository operations, not product GitHub connector behavior.
- No new environment variables, package scripts, app routes, backend routes, migrations, fixtures, source packs, public assets, deployment config, OpenAI API/model integration, or provider integration are added.

## Interfaces and Dependencies

FP-0129 depends on shipped FP-0128 token-validation readiness contracts, FP-0127 WWW-Authenticate auth-challenge contracts, FP-0126 WWW-Authenticate challenge sequencing, FP-0125 protected-resource metadata local route and evidence-coherence posture, FP-0123 route-input evidence contracts, FP-0122 metadata builder contracts, FP-0120 canonical resource/auth-server readiness, FP-0118 protected-resource metadata readiness, FP-0117 OAuth implementation sequencing, FP-0107 local `/mcp` route adapter, FP-0106 protocol envelope, and FP-0100 public security boundaries.

The only interface introduced is proof-gate compatibility around a docs-only plan path. No route/runtime module may import or call these helpers in this slice.

## Outcomes & Retrospective

FP-0129 is opened as a docs-and-plan plus proof-gate compatibility master plan only. It decides that a later narrow WWW-Authenticate challenge route implementation may be considered next, but only for missing-token first and possibly generic invalid-token challenge behavior under strict no-token-runtime constraints. Semantic token-validation failures remain in the later token-validation runtime lane.

FP-0129 closes as a docs-and-plan plus proof-gate compatibility master plan. It authorizes no route behavior, no `WWW-Authenticate` header emission, no token validation/parsing/session/auth runtime, no OAuth implementation, no remote/public deployment, no Apps SDK resource, no app submission, no DB/schema/package/data/source-pack/public-asset/OpenAI/provider/source/finance-write work, and no autonomous action. PR #304 merged on 2026-05-17, so this plan is a shipped historical record; FP-0130 is the follow-on missing-token implementation slice.
