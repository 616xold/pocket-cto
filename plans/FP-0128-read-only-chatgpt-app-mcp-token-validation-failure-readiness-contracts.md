# FP-0128 read-only ChatGPT App MCP token-validation failure readiness contracts

## Purpose / Big Picture

FP-0128 is a local/proof-only/read-only contract foundation for future token-validation failure-mode and auth-challenge readiness in the read-only ChatGPT App MCP path.

This slice implements pure domain contracts, focused specs, and direct proof tooling only. It does not validate tokens, parse real tokens, store tokens, create sessions, add auth middleware, emit WWW-Authenticate headers, change `/mcp`, change the protected-resource metadata route, implement OAuth, add routes, deploy remote MCP, add deployment config, add Apps SDK resources, prepare public app submission, add DB queries, schema or migration work, package scripts, fixtures, sample data, source packs, public assets, listing copy, generated public prose, OpenAI API/model calls, provider calls, source mutation, finance writes, generated finance advice, runtime-Codex finance output, external communications, or autonomous action.

The target phase is V2AV read-only ChatGPT App/MCP token-validation failure readiness contracts. The user-visible purpose is not runtime auth. The proof point is that before any future route may emit a challenge or validate a token, the repo has an auditable contract for token failure taxonomy, audience/resource prerequisites, scope challenge prerequisites, authenticated user/org/company binding prerequisites, no token passthrough, no token storage/runtime, no token leakage, future-only status mapping, refusal/challenge separation, and no runtime implementation.

## Progress

- [x] 2026-05-17T20:57:43Z: Invoked the requested Pocket CFO operator skills from the repo-local `pocket-cfo-codex-operator` bundle: Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor. GitHub Connector Guard was not invoked because GitHub connector product behavior is out of scope.
- [x] 2026-05-17T20:57:43Z: Confirmed the branch is `codex/v2av-read-only-chatgpt-app-mcp-token-validation-failure-readiness-contracts-local-v1` and the worktree was clean before edits.
- [x] 2026-05-17T20:57:43Z: Confirmed PR #300 is merged into `main`, FP-0127 exists and is shipped, FP-0128 and FP-0129 were absent, GitHub auth is available, and local Postgres/MinIO services are running.
- [x] 2026-05-17T20:57:43Z: Ran the required pre-edit proof ladder; all existing read-only MCP/public/security/evidence proof tools named by this slice passed before edits. Baseline log: `/tmp/fp0128-baseline-proofs-1779051413.log`.
- [x] 2026-05-17T20:57:43Z: Reviewed official MCP, RFC 9728, and OpenAI Apps SDK web docs as read-only protocol context. OpenAI Developers exposed only API-key setup tooling in this thread, so no OpenAI Developers docs connector, OpenAI API-key setup, OpenAI API call, or model call was used.
- [x] 2026-05-17T20:57:43Z: Opened FP-0128 as a local/proof-only/read-only contracts and proof slice with no runtime auth, route behavior, token/session, deployment, public app, DB, source, or finance-write scope.
- [x] 2026-05-17T20:57:43Z: Added pure domain token-validation readiness contracts, builders, validation helpers, proof helpers, and focused specs under `packages/domain/src/read-only-app-mcp-token-validation*.ts`.
- [x] 2026-05-17T20:57:43Z: Added `tools/read-only-mcp-token-validation-readiness-proof.mjs` with machine-readable JSON proof output for FP-0128 token-validation readiness and preserved prior boundaries.
- [x] 2026-05-17T20:57:43Z: Bridged existing proof gates so exact FP-0128 local/proof-only token-validation readiness contracts are accepted while FP-0129 remains absent.
- [x] 2026-05-17T20:57:43Z: Refreshed directly stale active docs and `plugins.md` that still described FP-0128 as absent or future-only.
- [x] 2026-05-17T21:36:38Z: Ran strict same-branch QA and final validation. Changed files are limited to domain contracts/specs/proof helpers, proof tools, FP-0128, and directly stale docs; no route behavior, package/schema/data/source/finance-write, deployment, OpenAI/provider, public app, or FP-0129 work was added.
- [ ] Commit exactly once, push, and publish the PR.

## Surprises & Discoveries

- OpenAI Developers is installed as a plugin family, but tool discovery exposed only OpenAI Platform API-key setup tooling. That tooling is intentionally out of scope and was not used.
- MCP Authorization, version 2025-11-25, explicitly ties protected resource authorization to resource indicators, canonical MCP resource URI, token audience/resource validation, protected-resource metadata, token handling, error statuses, and scope challenge handling. FP-0128 records those as future prerequisites only.
- MCP Security Best Practices explicitly treats token passthrough as a forbidden authorization anti-pattern. FP-0128 therefore makes no-passthrough a contract boundary, not a runtime forwarding path.
- OpenAI Apps SDK Authentication expects authenticated MCP servers to verify access tokens on each request and to provide protected-resource metadata or advertise it through auth challenges. FP-0128 does not implement that verification or challenge behavior.
- Existing older proof gates were intentionally narrow about future FP files. FP-0128 needed proof-gate bridge updates so those gates accept exactly the new token-validation readiness plan, contracts, specs, and proof command while still rejecting FP-0129 and runtime auth expansion.

## Decision Log

- Decision: FP-0128 may start because PR #300 is merged, FP-0127 is shipped, FP-0128 and FP-0129 were absent, active docs support FP-0127 as shipped local/proof-only WWW-Authenticate auth-challenge contracts, and all required pre-edit proof tools passed.
- Decision: Token validation runtime remains future-only and not implemented.
- Decision: Token parsing remains future-only and not implemented. The contracts may model failure modes but must not parse real tokens or decode token material.
- Decision: Token/session storage remains future-only and absent.
- Decision: Auth middleware remains future-only and absent.
- Decision: WWW-Authenticate runtime challenge behavior remains future-only and absent.
- Decision: Token failure taxonomy is proof-only and includes `missing_token`, `invalid_token`, `malformed_token`, `expired_token`, `wrong_audience`, `wrong_resource`, `wrong_scope`, `wrong_org`, `revoked_token`, `replayed_token`, and `token_passthrough_attempt`.
- Decision: Audience/resource validation requires future canonical public MCP resource URI proof before any runtime token validation can start.
- Decision: Scope validation requires least-privilege read-only scopes. Scope challenge guidance cannot create, widen, or suggest write, admin, mutation, offline, provider, wildcard, broad finance, or unlisted scopes.
- Decision: Authenticated user/org/company binding is a prerequisite before client `companyKey` can be treated as a selector. Client-supplied `companyKey` remains selector-only and is not authority.
- Decision: Token passthrough is forbidden. Future code must fail closed rather than transit upstream or downstream tokens.
- Decision: Token leakage is forbidden in logs, UI props, metadata examples, evidence, structured tool results, docs examples, proof outputs, error messages, and challenge examples. No real token examples may be committed.
- Decision: Current routes must not import token-validation helpers in this slice.
- Decision: Future status mapping and refusal/challenge separation are contract-only. FP-0128 must not emit route responses or headers.
- Decision: FP-0127 auth-challenge contracts, FP-0126 sequencing, FP-0125 metadata route and evidence coherence, `/mcp`, and prior FP-0123/0122/0120/0118/0117/0107/0106/0100 boundaries must remain proven.
- Decision: FP-0129 remains absent.
- Decision: Existing proof gates may be updated only to recognize the exact FP-0128 plan path, token-validation domain/proof files, and direct proof command. They must not permit route behavior, protected-resource metadata behavior changes, WWW-Authenticate runtime behavior, OAuth, token/session runtime, deployment, public app, DB/schema/package/source/finance writes, or FP-0129.

## Context and Orientation

FP-0127 shipped local/proof-only WWW-Authenticate auth-challenge contracts. It proves future Bearer challenge shape, `resource_metadata` reference posture, missing/invalid token challenge posture, future-only token failure modes, read-only least-privilege scope guidance, no-token-leakage, unchanged `/mcp`, and no-runtime boundaries.

FP-0126 shipped docs-and-plan plus proof-gate compatibility for future WWW-Authenticate `resource_metadata` auth-challenge sequencing. It kept token failure statuses in a later token-validation lane.

FP-0125 shipped the local protected-resource metadata route at `/.well-known/oauth-protected-resource/mcp`, registered only when app construction supplies a valid and semantically coherent FP-0123 route-input evidence bundle. Default `buildApp()` does not register the metadata route, and `/mcp` behavior remains unchanged.

Official read-only protocol context used by this plan:

- Model Context Protocol Authorization specification, version 2025-11-25: protocol context for protected-resource metadata discovery, resource indicators, canonical MCP resource URI, token audience/resource validation, token handling, token error status lanes, and scope challenge handling.
- Model Context Protocol Transports specification, version 2025-11-25: protocol context for preserving the current Streamable HTTP `/mcp` route shape, Origin validation posture, POST/GET semantics, and local transport behavior.
- Model Context Protocol Security Best Practices: protocol/security context for token passthrough prohibition, confused-deputy risks, session hijacking concerns, and scope minimization.
- RFC 9728, OAuth 2.0 Protected Resource Metadata: protocol context for protected-resource metadata, resource metadata validation, well-known URL derivation, and the `resource_metadata` challenge parameter.
- OpenAI Apps SDK Authentication: platform context for authenticated MCP servers, protected-resource metadata, OAuth metadata, access-token verification, and auth challenge signaling.
- OpenAI Apps SDK Security & Privacy, Deploy your app, Connect from ChatGPT, Test your integration, Submit and maintain your app, and App submission guidelines: platform context for keeping secrets out of app surfaces and for why remote HTTPS MCP, developer-mode testing, public submission, screenshots/assets/listing copy, and review endpoints remain future-only.

## Plan of Work

1. Add modular domain contracts under `packages/domain/src/read-only-app-mcp-token-validation*.ts`.
2. Add pure helper functions for building token-validation readiness contracts, validating failure-mode contracts, and deriving challenge readiness without parsing tokens or emitting headers.
3. Add focused domain specs for exact FP-0128 path acceptance, FP-0129 absence, local/proof-only posture, required failure modes, runtime deferrals, route import absence, audience/resource prerequisites, scope prerequisites, company binding, companyKey selector-only posture, token passthrough fail-closed posture, token leakage rejection, safe absence wording, and prior-boundary preservation.
4. Add `tools/read-only-mcp-token-validation-readiness-proof.mjs` with machine-readable JSON fields named by this plan.
5. Update only the minimal proof gates that currently require FP-0128 absence so they accept exactly this FP-0128 contracts foundation and still require FP-0129 absence.
6. Refresh only directly stale active docs and plugin notes if needed.
7. Run focused validation, strict same-branch QA, final validation, closeout, one commit, push, and PR publication.

## Concrete Steps

1. Create `packages/domain/src/read-only-app-mcp-token-validation-contracts.ts` for constants and Zod proof contract schemas.
2. Create `packages/domain/src/read-only-app-mcp-token-validation.ts` for pure builders and validators.
3. Create `packages/domain/src/read-only-app-mcp-token-validation-proof.ts` for proof schema, proof builder, FP-0128/FP-0129 plan-boundary helpers, and no-leakage/status-mapping/readiness proof helpers.
4. Export the new domain surface from `packages/domain/src/index.ts`.
5. Add `packages/domain/src/read-only-app-mcp-token-validation.spec.ts`.
6. Add `tools/read-only-mcp-token-validation-readiness-proof.mjs`.
7. Update only existing proof tools and proof schemas needed to accept exact FP-0128 while preserving all previous boundaries.
8. Patch directly stale docs if active-doc review shows they still say FP-0128 is absent/future-only after this slice.

## Validation and Acceptance

Acceptance requires:

- exactly one FP-0128 plan path exists
- FP-0129 remains absent
- FP-0128 authorizes only local/proof-only/read-only token-validation failure-mode readiness contracts
- all required failure modes are modeled
- token validation runtime, token parsing runtime, token/session storage, auth middleware, and WWW-Authenticate runtime behavior remain unimplemented
- no current route imports token-validation helpers
- no `/mcp` route behavior change
- no protected-resource metadata route behavior change
- no new route path
- no OAuth implementation
- no remote MCP deployment or deployment config
- no Apps SDK resource, public app behavior, app submission, public assets, listing copy, generated public prose, or public submission material
- no DB query, schema, migration, package script, fixture, sample data, source pack, provider call, OpenAI API/model call, OpenAI client/key usage, source mutation, finance write, generated finance advice, runtime-Codex finance output, external communication, or autonomous action
- audience/resource validation requires future canonical public MCP resource URI proof
- wrong-audience and wrong-resource remain contract-only
- wrong-scope and scope challenge guidance remain read-only and least-privilege
- companyKey remains selector-only and not authority
- token passthrough attempts fail closed by contract
- no-token-leakage boundaries cover bearer/basic/authorization material, access or refresh token fields, client-secret fields, session/cookie/api-key material, OpenAI-key-shaped material, JWT-like material, raw finance/source/provider examples, and app-submission examples while allowing safe absence/prohibition wording
- FP-0127 challenge contracts, FP-0126 sequencing, FP-0125 route/evidence posture, `/mcp`, and prior FP-0123/0122/0120/0118/0117/0107/0106/0100 boundaries remain proven

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
pnpm --filter @pocket-cto/domain exec vitest run src/benchmark-community.spec.ts src/read-only-app-mcp.spec.ts src/read-only-app-mcp-descriptor.spec.ts src/read-only-app-mcp-public-security.spec.ts src/read-only-app-mcp-endpoint-architecture.spec.ts src/read-only-app-mcp-endpoint-route-ownership.spec.ts src/read-only-app-mcp-protocol-envelope.spec.ts src/read-only-app-mcp-evidence-tool-dispatch.spec.ts src/read-only-app-mcp-oauth-security.spec.ts src/read-only-app-mcp-remote-host-readiness.spec.ts src/read-only-app-mcp-remote-host-resource.spec.ts src/read-only-app-mcp-protected-resource-metadata.spec.ts src/read-only-app-mcp-protected-resource-metadata-builder.spec.ts src/read-only-app-mcp-protected-resource-metadata-route-input.spec.ts src/read-only-app-mcp-canonical-resource-proof.spec.ts src/read-only-app-mcp-canonical-resource-validation.spec.ts src/read-only-app-mcp-www-authenticate.spec.ts src/read-only-app-mcp-www-authenticate-boundary-hardening.spec.ts src/read-only-app-mcp-token-validation.spec.ts
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/read-only-app-mcp-endpoint/routes.spec.ts src/modules/read-only-app-mcp-endpoint/service.spec.ts src/modules/read-only-app-mcp-endpoint/evidence-dispatcher.spec.ts src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.spec.ts src/app.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

## Idempotence and Recovery

This slice is idempotent because it adds no route behavior, no token runtime, no auth middleware, no deployment, no database state, no source ingestion, and no finance write. If validation fails for FP-0128 contract/proof/spec/type reasons, patch this same branch and rerun the required gates. If unrelated dirty files, missing local services, missing proof tools, auth failures, or out-of-scope validation failures appear, stop and report the smallest safer correction. If FP-0129 appears, remove it from this slice and rerun proof gates.

## Artifacts and Notes

- Plan artifact: `plans/FP-0128-read-only-chatgpt-app-mcp-token-validation-failure-readiness-contracts.md`
- Domain artifacts: `packages/domain/src/read-only-app-mcp-token-validation*.ts`
- Proof artifact: `tools/read-only-mcp-token-validation-readiness-proof.mjs`
- No raw sources, source snapshots, uploaded exports, PDFs, source documents, finance evidence, generated public assets, app-submission assets, screenshots, or external artifacts are created or mutated.
- Replay implication: no mission state changes, ingest actions, reports, approvals, monitor outputs, or finance write actions occur. No replay event is required for this proof-only domain slice.
- Evidence/provenance implication: the slice proves auth-readiness contract boundaries and preserved evidence posture only. It does not create finance answers and does not alter freshness, source lineage, or derived twin state.
- GitHub connector work is out of scope. Routine `git`, `gh`, push, and PR operations are repository operations, not product GitHub connector behavior.
- No new environment variables, package scripts, app routes, backend routes, migrations, fixtures, source packs, or public assets are added.

## Interfaces and Dependencies

FP-0128 depends on shipped FP-0127 WWW-Authenticate auth-challenge contracts, FP-0126 WWW-Authenticate auth-challenge sequencing, FP-0125 protected-resource metadata local route and evidence-coherence hardening, FP-0123 route-input evidence contracts, FP-0122 metadata builder contracts, FP-0120 canonical resource/auth-server readiness, FP-0118 protected-resource metadata readiness, FP-0117 OAuth implementation sequencing, FP-0107 local `/mcp` route adapter, FP-0106 protocol envelope, and FP-0100 public security boundaries.

The only implementation interface introduced is pure domain/proof TypeScript and one direct proof command. No route/runtime module may import or call these helpers in this slice.

## Outcomes & Retrospective

FP-0128 has implemented the local/proof-only/read-only token-validation readiness contract foundation. It adds token-validation deferral, token parsing deferral, token/session storage deferral, auth middleware deferral, token failure taxonomy, audience/resource validation prerequisites, scope validation prerequisites, authenticated company binding, client `companyKey` selector-only posture, token passthrough prohibition, no-token-leakage, and no-runtime proof contracts.

The proof-gate bridge recognizes exactly this FP-0128 plan path, token-validation domain/proof files, focused specs, directly stale docs, and direct proof command. It keeps FP-0129 absent and keeps FP-0127, FP-0126, FP-0125, FP-0123, FP-0122, FP-0120, FP-0118, FP-0117, FP-0107, FP-0106, and FP-0100 boundaries in force.

Docs refreshed in this slice: `plugins.md`, `README.md`, `CODEX_README.md`, `START_HERE.md`, `docs/ACTIVE_DOCS.md`, `docs/PROJECT_STATE.md`, `docs/V2_BOUNDARY.md`, `docs/security/read-only-agent-threat-model.md`, `docs/security/finance-data-threat-model.md`, `docs/demo/demo-data-policy.md`, and `plans/ROADMAP.md`.

Closeout validation passed before this closeout edit:

- `git diff --check`: passed.
- `pnpm exec tsx tools/read-only-mcp-token-validation-readiness-proof.mjs`: passed.
- Full proof ladder across the 19 requested proof tools: passed. Final proof log: `/tmp/fp0128-final-proof-ladder-after-export-fix-1779053405.log`.
- Focused domain specs: 19 files passed, 199 tests passed.
- Focused control-plane read-only `/mcp` route/app specs: 5 files passed, 114 tests passed.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed after resolving a package-barrel export collision by selectively exporting the FP-0128 helper surface and leaving colliding contract names in their dedicated module.
- `pnpm test`: passed across 8 workspace tasks; domain 43 files / 372 tests, control-plane 137 files / 770 tests, web 31 files / 165 tests, plus db/config/codex-runtime/stack-packs/testkit package tests.
- `pnpm ci:repro:current`: passed in a clean temp worktree, including frozen install, static checks, build, clean-tree, DB migrations, full test, and final clean-tree.

Because this paragraph is a post-validation closeout edit, the required post-closeout rerun set is `git diff --check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current` before commit.

The required next decision is: start WWW-Authenticate challenge implementation planning only under a new narrow Finance Plan after the post-closeout rerun remains green; no FP-0128 correction is expected unless that rerun finds a same-branch defect; public ChatGPT App submission must wait.
