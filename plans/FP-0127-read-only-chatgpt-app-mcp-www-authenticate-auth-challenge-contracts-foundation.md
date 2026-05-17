# FP-0127 read-only ChatGPT App MCP WWW-Authenticate auth-challenge contracts foundation

## Purpose / Big Picture

FP-0127 is a local/proof-only/read-only contract foundation for future WWW-Authenticate `resource_metadata` auth-challenge behavior in the read-only ChatGPT App MCP path.

This slice implements pure domain contracts, focused specs, and direct proof tooling only. It does not emit WWW-Authenticate headers, does not change `/mcp`, does not expand the protected-resource metadata route, and does not implement OAuth, token validation, token/session storage, auth middleware, remote MCP deployment, deployment config, Apps SDK resources, public app behavior, app submission, DB queries, schema or migration work, package scripts, provider calls, OpenAI API/model calls, source mutation, finance writes, generated finance advice, runtime-Codex finance output, external communications, or autonomous action.

The target phase is V2AU read-only ChatGPT App/MCP WWW-Authenticate auth-challenge contracts foundation. The user-visible purpose is not runtime auth. The proof point is that a future route implementation now has a bounded contract for what it must prove before any route may emit a Bearer challenge with `resource_metadata`.

## Progress

- [x] 2026-05-17T15:25:26Z: Invoked the requested Pocket CFO operator skills from the repo-local `pocket-cfo-codex-operator` bundle: Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor. GitHub Connector Guard was not invoked because GitHub connector product behavior is out of scope.
- [x] 2026-05-17T15:25:26Z: Confirmed the branch is `codex/v2au-read-only-chatgpt-app-mcp-www-authenticate-auth-challenge-contracts-foundation-local-v1` and the worktree was clean before edits.
- [x] 2026-05-17T15:25:26Z: Confirmed PR #299 is merged into `main`, FP-0126 exists and is shipped, FP-0127 and FP-0128 were absent, and the active docs still describe FP-0126 as shipped docs/proof-gate-only auth-challenge sequencing.
- [x] 2026-05-17T15:25:26Z: Ran the required pre-edit proof ladder; all existing read-only MCP/public/security/evidence proof tools named by this slice passed before edits.
- [x] 2026-05-17T15:25:26Z: Reviewed official MCP, RFC 9728, and OpenAI Apps SDK web docs as read-only protocol context. OpenAI Developers exposed only API-key setup tooling in this thread, so no OpenAI Developers docs connector, OpenAI API key setup, OpenAI API call, or model call was used.
- [x] 2026-05-17T15:25:26Z: Created pure domain WWW-Authenticate auth-challenge contract schemas, builders, plan-boundary helpers, proof schema, exports, and focused specs under `packages/domain/src/read-only-app-mcp-www-authenticate*.ts`.
- [x] 2026-05-17T15:25:26Z: Added the direct machine-readable proof command `tools/read-only-mcp-www-authenticate-auth-challenge-proof.mjs`.
- [x] 2026-05-17T15:25:26Z: Bridged existing proof gates so exact FP-0127 local/proof-only WWW-Authenticate auth-challenge contracts are accepted while FP-0128 remains absent.
- [x] 2026-05-17T15:25:26Z: Refreshed directly stale active docs, security/demo docs, roadmap, plugin notes, and FP-0126 historical wording so they no longer describe FP-0127 absence as current truth.
- [x] 2026-05-17T16:09:36Z: Ran focused validation, strict same-branch QA, and final validation through all required proof tools, focused domain/control-plane specs, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`; all passed before closeout.
- [x] 2026-05-17T20:20:22Z: Started the targeted post-merge FP-0127 proof-contract hardening correction from shipped PR #300 on the required same branch after confirming PR #300 was merged, the worktree was clean, local Postgres/MinIO were up, GitHub auth was valid, FP-0127 existed, FP-0128 was absent, and the required baseline proof ladder passed.
- [x] 2026-05-17T20:20:22Z: Hardened the FP-0127 domain/proof surface so scope challenge acceptance now means no forbidden delimiter/case token and every scope is in the read-only allowlist, no-token-leakage scans detect realistic auth/token/secret/header/session/JWT/OpenAI-key shapes while preserving safe absence wording, and public `resource_metadata` reference candidates must be strict HTTPS protected-resource metadata URLs without query, fragment, userinfo, localhost/tunnel/placeholder/selector/token-like material.
- [x] 2026-05-17T20:20:22Z: Added focused FP-0127 hardening specs and proof-detail output for delimiter/case forbidden-scope examples, unlisted read-like scope rejection, realistic no-token-leakage examples, public candidate rejection, no runtime header emission, no route helper imports, unchanged route behavior, FP-0128 absence, and prior-boundary preservation.
- [x] 2026-05-17T20:20:22Z: Updated existing proof-gate OpenAI-source scanners only to recognize detector-regex definitions as proof code rather than API/model/key usage. No runtime OpenAI/API/model behavior was added.
- [x] 2026-05-17T20:20:22Z: Focused validation passed after the correction: the FP-0127 proof, FP-0125 local route proof, FP-0123 route-input proof, FP-0122 builder proof, FP-0120 canonical proof, FP-0118 protected-resource metadata proof, the focused domain proof/spec ladder including the new hardening specs, and focused control-plane route/app specs.
- [x] 2026-05-17T20:34:23Z: Strict same-branch QA passed: changed files remained in domain/proof/docs/plugin scope, no route/runtime route files changed, no route behavior or new route path was added, no WWW-Authenticate runtime behavior was added, no protected-resource metadata route behavior changed, no OAuth/token/session/auth middleware/token validation runtime was added, no remote MCP/deployment config/DB/schema/package/data/assets/OpenAI/provider/source/finance-write scope was added, and FP-0128 remained absent.
- [x] 2026-05-17T20:34:23Z: Final validation passed: `git diff --check`, all requested proof tools including `tools/read-only-mcp-www-authenticate-auth-challenge-proof.mjs`, focused FP-0127/domain/control-plane specs, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`. Final validation log: `/tmp/fp0127-hardening-final-1779049589.log`.
- [x] 2026-05-17T20:38:41Z: Post-closeout validation subset passed after the final plan closeout edit: `git diff --check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`. Post-closeout validation log: `/tmp/fp0127-hardening-post-closeout-1779050076.log`.
- [ ] Commit once, push, and create the PR.

## Surprises & Discoveries

- The OpenAI Developers plugin family is installed, but tool discovery exposed only OpenAI Platform API-key setup tools. Those are not read-only docs tools and were not used.
- Official MCP Authorization and RFC 9728 make `WWW-Authenticate: Bearer ... resource_metadata="..."` a protected-resource metadata discovery mechanism, but using it is still runtime auth-failure behavior. FP-0127 therefore stays contract-only and keeps route emission future-only.
- OpenAI Apps SDK authentication docs connect protected-resource metadata, OAuth metadata, token verification, runtime challenges, and tool-level auth UI. That reinforces the boundary that FP-0127 must not implement token validation, OAuth, `_meta["mcp/www_authenticate"]`, Apps SDK resources, or public app behavior.
- The post-merge hardening added detector regexes for OpenAI-key-shaped examples. Existing proof-gate source scanners needed a narrow compatibility clarification so detector definitions are not mistaken for actual OpenAI API/model/key usage. The scans still reject executable imports, clients, model calls, key reads, and endpoint use.

## Decision Log

- Decision: FP-0127 may start because PR #299 is merged, FP-0126 is shipped, FP-0127 and FP-0128 were absent, active docs support FP-0126 as shipped docs/proof-gate-only sequencing, and all required pre-edit proof tools passed.
- Decision: WWW-Authenticate challenge behavior remains future-only and must not be emitted by any route in this slice.
- Decision: Future challenge behavior must be tied to protected-resource metadata and cannot exist without a metadata URL decision.
- Decision: A future challenge must use the Bearer scheme and include a `resource_metadata` reference.
- Decision: The local proof contract may reference `/.well-known/oauth-protected-resource/mcp` only as local proof data. Public runtime behavior must wait for future canonical public URL proof and a later implementation plan.
- Decision: The contract must not authorize challenges on `initialize`, `ping`, `tools/list`, `tools/call`, or any other `/mcp` behavior in this slice.
- Decision: Missing-token and invalid-token challenge postures are contract-only. Malformed, expired, wrong-audience, wrong-scope, wrong-org, revoked, and replayed token postures remain in a future token-validation lane.
- Decision: Scope challenge guidance is contract-only, read-only, least-privilege, and must not create or widen scopes. Write, admin, mutation, offline, provider, wildcard, and broad finance scopes are rejected.
- Decision: Challenge examples must not contain token values, cookies, sessions, credentials, client secrets, authorization headers, raw finance data, raw source dumps, companyKey authority, prompt text, proof internals, provider credentials, OpenAI keys, or app-submission copy.
- Decision: FP-0125 metadata route behavior and evidence-coherence hardening, `/mcp` behavior, FP-0126 sequencing posture, FP-0124/0123/0122/0120/0118/0117/0107/0106/0100 boundaries, and FP-0128 absence must remain proven.
- Decision: Proof-gate bridge fields accept exactly this FP-0127 contracts foundation and do not relax FP-0126 sequencing, FP-0125 metadata route, FP-0125 evidence-coherence, `/mcp`, OAuth/token/session/auth, remote/public host, public app, DB/schema/package, OpenAI/provider, source, finance-write, or autonomous-action guardrails.
- Decision: Directly stale docs may describe FP-0127 as shipped contract-only work, but public ChatGPT App implementation, WWW-Authenticate route behavior, token validation runtime, public submission, and FP-0128 remain future-only.
- Decision: Scope challenge `accepted` now means both no forbidden scope token was found across colon, dot, slash, underscore, hyphen, whitespace, wildcard, or case variants and every scope is exactly in the read-only least-privilege allowlist.
- Decision: No-token-leakage validation now includes realistic value-shaped auth/token/secret/header/session/JWT/OpenAI-key patterns while allowing explicit absence/prohibition wording so docs and proof text can safely state what must not appear.
- Decision: Public `resource_metadata` reference candidate validation now rejects arbitrary HTTPS strings and unsafe URL material even when future public canonical URL proof is claimed. Runtime header emission remains false.
- Decision: Existing FP-0117, FP-0118, and FP-0123 proof-source scanners may treat detector-regex definitions as safe proof code, but this does not relax executable OpenAI/API/model/key usage checks.

## Context and Orientation

FP-0126 shipped docs-and-plan plus proof-gate compatibility for future WWW-Authenticate `resource_metadata` auth-challenge sequencing. It kept `/mcp` unchanged and kept route challenge behavior, OAuth/token/session/auth middleware, token validation, remote MCP, Apps SDK resources, public app behavior, and app submission future-only.

FP-0125 shipped the local protected-resource metadata route at `/.well-known/oauth-protected-resource/mcp`, registered only when app construction supplies a valid and semantically coherent FP-0123 route-input evidence bundle. Default `buildApp()` does not register the metadata route, and `/mcp` behavior remains unchanged.

Official read-only protocol context used by this plan:

- Model Context Protocol Authorization specification, version 2025-11-25: protocol context for protected-resource metadata discovery, `WWW-Authenticate` `resource_metadata`, scope challenge posture, resource indicators, token handling, audience validation, and authorization error status lanes.
- Model Context Protocol Transports specification, version 2025-11-25: protocol context for preserving Streamable HTTP POST/GET posture, Origin validation, notification 202 behavior, and single `/mcp` endpoint semantics.
- Model Context Protocol Security Best Practices: protocol context for token passthrough prohibition and least-privilege scope challenge posture.
- RFC 9728, OAuth 2.0 Protected Resource Metadata: protocol context for protected-resource metadata fields, well-known URL derivation, resource metadata validation, and the `resource_metadata` WWW-Authenticate parameter.
- OpenAI Apps SDK Authentication: platform context for protected-resource metadata, OAuth metadata, Bearer `resource_metadata` challenge examples, token audience/scope validation, and the fact that ChatGPT auth UI requires both metadata and runtime auth signaling.
- OpenAI Apps SDK Security & Privacy: platform context for avoiding secrets/tokens in app surfaces, redacting logs, and rejecting malformed or expired tokens in a later implementation lane.
- OpenAI Apps SDK Deploy, Connect from ChatGPT, Test your integration, Submit and maintain your app, and App submission guidelines: platform context for why remote HTTPS MCP, developer-mode testing, OAuth validation, public submission, screenshots/assets/listing copy, and review endpoints remain future-only.

## Plan of Work

1. Add modular domain contracts under `packages/domain/src/read-only-app-mcp-www-authenticate*.ts`.
2. Add pure helper functions for building, validating, and deriving contract-only `resource_metadata` reference posture without emitting HTTP headers.
3. Add focused domain specs for exact FP-0127 path acceptance, FP-0128 absence, Bearer challenge shape, `resource_metadata` requirement, local-vs-public metadata reference posture, missing/invalid token contract posture, future-only token failure modes, read-only least-privilege scope challenge guidance, no-token-leakage, no runtime behavior, and preserved `/mcp` and FP-0125 boundaries.
4. Add `tools/read-only-mcp-www-authenticate-auth-challenge-proof.mjs` with machine-readable JSON fields named by this plan.
5. Update only the minimal proof gates that currently require FP-0127 absence so they accept exactly this FP-0127 contracts foundation and still require FP-0128 absence.
6. Refresh only directly stale active docs and plugin notes.
7. Run focused validation, strict same-branch QA, final validation, and closeout.

## Concrete Steps

1. Create `packages/domain/src/read-only-app-mcp-www-authenticate-contracts.ts` for constants and Zod proof contract schemas.
2. Create `packages/domain/src/read-only-app-mcp-www-authenticate.ts` for pure builders and validators.
3. Create `packages/domain/src/read-only-app-mcp-www-authenticate-proof.ts` for proof schema, proof builder, FP-0127/FP-0128 plan boundary helpers, and no-token-leakage/scope checks.
4. Export the new domain surface from `packages/domain/src/index.ts`.
5. Add `packages/domain/src/read-only-app-mcp-www-authenticate.spec.ts`.
6. Add `tools/read-only-mcp-www-authenticate-auth-challenge-proof.mjs`.
7. Update only existing proof tools and proof schemas needed to accept exact FP-0127 while preserving all previous boundaries.
8. Patch directly stale docs if validation or active-doc review shows they still say FP-0127 is absent/future-only after this slice.

## Validation and Acceptance

Acceptance requires:

- exactly one FP-0127 file exists at `plans/FP-0127-read-only-chatgpt-app-mcp-www-authenticate-auth-challenge-contracts-foundation.md`
- FP-0128 remains absent
- FP-0127 authorizes only local/proof-only/read-only WWW-Authenticate auth-challenge contracts
- no `/mcp` route behavior change
- no protected-resource metadata route behavior change or expansion
- no WWW-Authenticate header emission or runtime route behavior
- no OAuth, token validation runtime, token/session storage, or auth middleware
- no remote MCP deployment, deployment config, Apps SDK resource, public app behavior, app submission, public assets, listing copy, generated public prose, or public submission material
- no DB query, schema, migration, package script, fixture, sample data, source pack, provider call, OpenAI API/model call, source mutation, finance write, generated finance advice, runtime-Codex finance output, external communication, or autonomous action
- Bearer challenge shape and `resource_metadata` reference posture are contract-only and bounded
- local proof data may reference `/.well-known/oauth-protected-resource/mcp`; public challenge references remain blocked until future canonical public URL proof
- missing/invalid token challenge postures are contract-only; malformed/expired/wrong-audience/wrong-scope/wrong-org/revoked/replayed token modes remain future-only
- scope challenge guidance is read-only and least-privilege and rejects write/admin/mutation/offline/provider scopes
- no-token-leakage boundaries cover tokens, cookies, sessions, credentials, client secrets, authorization headers, raw finance data, raw source dumps, companyKey authority, prompt text, proof internals, provider credentials, OpenAI keys, and app-submission copy
- FP-0126 sequencing posture, FP-0125 route/evidence posture, `/mcp`, and prior FP-0124/0123/0122/0120/0118/0117/0107/0106/0100 boundaries remain proven

Validation command set:

```bash
git diff --check
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
pnpm --filter @pocket-cto/domain exec vitest run src/benchmark-community.spec.ts src/read-only-app-mcp.spec.ts src/read-only-app-mcp-descriptor.spec.ts src/read-only-app-mcp-public-security.spec.ts src/read-only-app-mcp-endpoint-architecture.spec.ts src/read-only-app-mcp-endpoint-route-ownership.spec.ts src/read-only-app-mcp-protocol-envelope.spec.ts src/read-only-app-mcp-evidence-tool-dispatch.spec.ts src/read-only-app-mcp-oauth-security.spec.ts src/read-only-app-mcp-remote-host-readiness.spec.ts src/read-only-app-mcp-remote-host-resource.spec.ts src/read-only-app-mcp-protected-resource-metadata.spec.ts src/read-only-app-mcp-protected-resource-metadata-builder.spec.ts src/read-only-app-mcp-protected-resource-metadata-route-input.spec.ts src/read-only-app-mcp-canonical-resource-proof.spec.ts src/read-only-app-mcp-canonical-resource-validation.spec.ts src/read-only-app-mcp-www-authenticate.spec.ts
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/read-only-app-mcp-endpoint/routes.spec.ts src/modules/read-only-app-mcp-endpoint/service.spec.ts src/modules/read-only-app-mcp-endpoint/evidence-dispatcher.spec.ts src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.spec.ts src/app.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

## Idempotence and Recovery

This slice is idempotent because it adds no route behavior, no runtime auth, no remote deployment, no database state, no source ingestion, and no finance write. If validation fails for FP-0127 contract/proof/spec/type reasons, patch the same branch and rerun the required gates. If unrelated dirty files, missing local services, missing proof tools, auth failures, or out-of-scope validation failures appear, stop and report the smallest safer correction. If FP-0128 appears, remove it from this slice and rerun proof gates.

## Artifacts and Notes

- Plan artifact: `plans/FP-0127-read-only-chatgpt-app-mcp-www-authenticate-auth-challenge-contracts-foundation.md`
- Domain artifacts: `packages/domain/src/read-only-app-mcp-www-authenticate*.ts`
- Proof artifact: `tools/read-only-mcp-www-authenticate-auth-challenge-proof.mjs`
- No raw sources, source snapshots, uploaded exports, PDFs, source documents, finance evidence, generated public assets, app-submission assets, screenshots, or external artifacts are created or mutated.
- Replay implication: no mission state changes, ingest actions, reports, approvals, monitor outputs, or finance write actions occur. No replay event is required for this proof-only domain slice.
- Evidence/provenance implication: the slice proves auth-challenge contract boundaries and preserved evidence posture only. It does not create finance answers and does not alter freshness, source lineage, or derived twin state.
- GitHub connector work is out of scope. Routine `git`, `gh`, push, and PR operations are repository operations, not product GitHub connector behavior.

## Interfaces and Dependencies

FP-0127 depends on shipped FP-0126 WWW-Authenticate auth-challenge sequencing, FP-0125 protected-resource metadata local route and evidence-coherence hardening, FP-0124 route implementation planning, FP-0123 route-input evidence contracts, FP-0122 metadata builder contracts, FP-0120 canonical resource/auth-server readiness, FP-0118 protected-resource metadata readiness, FP-0117 OAuth implementation sequencing, FP-0107 local `/mcp` route adapter, FP-0106 protocol envelope, and FP-0100 public security boundaries.

The only implementation interface introduced is pure domain/proof TypeScript and one direct proof command. No route/runtime module may import or call these helpers in this slice.

## Outcomes & Retrospective

FP-0127 shipped a local/proof-only/read-only WWW-Authenticate `resource_metadata` auth-challenge contract foundation. The slice added pure domain schemas, builders, validation helpers, plan-boundary helpers, focused specs, and a direct machine-readable proof command for Bearer challenge shape, bounded `resource_metadata` reference posture, local-vs-public metadata reference posture, missing/invalid token contract posture, future-only token failure modes, read-only least-privilege scope guidance, no-token-leakage, unchanged `/mcp`, and no-runtime boundaries.

The proof-gate bridge now accepts exactly one FP-0127 plan path while FP-0128 remains absent. It preserves FP-0126 WWW-Authenticate sequencing, FP-0125 protected-resource metadata local route behavior and evidence-coherence hardening, FP-0124 route implementation planning, FP-0123 route-input evidence contracts, FP-0122 metadata builder contracts, FP-0120 canonical resource/auth-server readiness, FP-0118 protected-resource metadata readiness, FP-0117 OAuth sequencing, FP-0107 route adapter, FP-0106 protocol envelope, and FP-0100 public security boundaries.

Strict QA confirmed the changed files stay in domain/proof/docs scope. No `/mcp` route behavior changed, no protected-resource metadata route behavior changed, no WWW-Authenticate header emission or route behavior was implemented, no OAuth/token/session/auth middleware or token validation runtime was added, no remote/public/App SDK/app-submission work was added, no DB/schema/package/data/source-pack/public-asset/OpenAI/provider/source/finance-write scope was added, and no FP-0128 was created.

Validation before closeout passed: `git diff --check`, all required read-only MCP/public/security/evidence proof tools including `tools/read-only-mcp-www-authenticate-auth-challenge-proof.mjs`, the focused domain spec command, the focused control-plane route/app spec command, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.

The post-merge hardening correction tightened the proof contract before FP-0128 token-validation readiness can rely on FP-0127. It preserved the local/proof-only/read-only boundary while adding proof-visible rejection reasons and examples for forbidden scope delimiters/case variants, realistic token leakage patterns, strict public `resource_metadata` reference candidates, and continued runtime header-emission absence. It also preserved FP-0126 sequencing, FP-0125 metadata route behavior, FP-0123 route-input evidence, FP-0122 builder contracts, FP-0120 canonical readiness, FP-0118 metadata readiness, FP-0117 OAuth sequencing, FP-0107 route adapter, FP-0106 protocol envelope, and FP-0100 public security boundaries.

Remaining before repository publication: commit once, push, and create the PR. Next recommendation remains to begin FP-0128 token-validation readiness contracts only after this hardening branch lands. WWW-Authenticate route behavior and public ChatGPT App submission should wait.
