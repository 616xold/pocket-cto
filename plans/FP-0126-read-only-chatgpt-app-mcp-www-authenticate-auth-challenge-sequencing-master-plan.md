# FP-0126 read-only ChatGPT App MCP WWW-Authenticate auth-challenge sequencing master plan

## Purpose / Big Picture

FP-0126 is a docs-and-plan plus proof-gate compatibility master plan for future WWW-Authenticate resource_metadata auth-challenge behavior sequencing after the FP-0125 protected-resource metadata local route.

FP-0126 plans future WWW-Authenticate resource_metadata auth-challenge behavior sequencing only. It does not implement WWW-Authenticate behavior, does not change /mcp behavior, and does not add OAuth/token/session/auth middleware. It does not add remote MCP, deployment config, Apps SDK resources, public app behavior, app submission. It does not add DB queries, schemas, migrations, package scripts, public assets, listing copy, generated public prose, OpenAI API/model calls, provider calls, source mutation, finance writes, or autonomous action.

The compelling proof point for this slice is compatibility, not runtime auth. FP-0126 let the repo accept exactly one plan for the next auth-challenge sequencing lane while keeping FP-0125 local-only metadata route behavior unchanged and leaving FP-0127 not yet created at FP-0126 closeout.

## Progress

- [x] 2026-05-17T14:28:17Z: Confirmed the requested branch and clean worktree before edits.
- [x] 2026-05-17T14:28:17Z: Confirmed PR #297 merged, FP-0125 exists and is shipped, FP-0126 and FP-0127 were absent before this slice, and required FP-0125 local route proof tools existed.
- [x] 2026-05-17T14:28:17Z: Ran pre-edit FP-0125 local route, route-input, route-adapter, and protocol-envelope proofs and confirmed default buildApp metadata route absence, explicit valid dependency route registration, unchanged /mcp behavior, and FP-0125 evidence-coherence proof.
- [x] 2026-05-17T14:28:17Z: Reviewed official MCP Authorization, MCP Transports, MCP Security Best Practices, RFC 9728, and OpenAI Apps SDK Authentication/Security docs as read-only protocol context.
- [x] 2026-05-17T14:28:17Z: Opened FP-0126 as docs-and-plan/proof-gate compatibility only, with no runtime route/auth implementation scope.
- [x] 2026-05-17T14:28:17Z: Added the proof-gate bridge accepting exactly this FP-0126 plan while FP-0127 stayed absent at FP-0126 closeout.
- [x] 2026-05-17T14:28:17Z: Refreshed directly stale docs and plugin notes that still described FP-0126 as absent/future-only.
- [x] 2026-05-17T14:28:17Z: Completed same-branch validation after plan, proof bridge, docs refresh, and closeout.
- [x] 2026-05-17T14:46:22Z: Corrected the FP-0126 proof helper type narrowing found by `pnpm typecheck` and reran the full validation ladder through `pnpm ci:repro:current`.

## Surprises & Discoveries

- Official MCP Authorization and RFC 9728 both make the WWW-Authenticate resource_metadata challenge a protected-resource metadata discovery mechanism, but using it changes auth-failure behavior. That keeps it separate from the FP-0125 local metadata route.
- OpenAI Apps SDK authentication docs connect protected-resource metadata, OAuth, token verification, and runtime WWW-Authenticate challenge behavior. FP-0126 therefore keeps runtime challenges behind a later auth/token validation lane instead of treating the local metadata route as enough.
- MCP Transports requires preserving the local HTTP transport posture, including POST request handling, notifications, Origin validation, and GET 405 behavior when SSE is not implemented. FP-0126 records those as future challenge-implementation regression gates.
- Same-branch QA found a TypeScript-only helper narrowing defect in the FP-0126 proof bridge. The correction was limited to the helper return shape and did not change route behavior, metadata route behavior, or any runtime auth posture.

## Decision Log

- Decision: FP-0126 may start from current repo truth only as WWW-Authenticate resource_metadata auth-challenge behavior sequencing. Runtime challenge implementation cannot start from current repo truth because OAuth/token/session/auth middleware, token validation runtime, public canonical host, and company binding remain absent.
- Decision: /mcp may not emit auth challenge behavior before a later implementation Finance Plan explicitly authorizes the behavior change. /mcp initialize/ping/tools/list/tools/call behavior remains unchanged.
- Decision: Challenge behavior cannot be implemented as local-only fail-closed runtime behavior without a later token validation/auth boundary. A future contract may define missing-token challenge posture, but FP-0126 does not implement it.
- Decision: Token failure statuses remain in a later token-validation lane. Missing-token can be planned as the first candidate challenge case; malformed-token, expired-token, wrong-audience, wrong-scope, and wrong-org require token-validation runtime before implementation.
- Decision: Token validation runtime remains future-only.
- Decision: missing-token, malformed-token, expired-token, wrong-audience, wrong-scope, and wrong-org behavior can be named as future contract cases, but only missing-token is plausibly challenge-lane planning before token validation exists.
- Decision: scope challenge behavior remains contract-only until public-host scopes are finalized. The challenged scope set must come from the later request/auth context rather than from static guesses.
- Decision: For local proof gates only, the resource_metadata local proof value may reference the local metadata route path `/.well-known/oauth-protected-resource/mcp`; public behavior must use the future public canonical URL once host ownership is decided. The local value is not the future public canonical URL.
- Decision: FP-0125 metadata route remains unchanged. FP-0125 evidence-coherence hardening remains preserved.
- Decision: /mcp initialize/ping/tools/list/tools/call behavior remains unchanged until a later implementation FP authorizes and proves a route behavior change.
- Decision: A future challenge implementation must include focused tests for missing token challenge, invalid token challenge, no token leakage, exact resource_metadata URL, no challenge on initialize if not authorized by later plan, and preservation of notifications / Origin / GET 405 behavior.
- Decision: OAuth/token/session/auth middleware, token validation runtime, remote MCP deployment, public host, Apps SDK resources, and app submission remain future-only.
- Decision: Remote MCP deployment remains future-only.
- Decision: Apps SDK resources remain future-only.
- Decision: Public app submission remains future-only.
- Decision: FP-0124 route implementation planning boundary remains preserved, FP-0123 route-input evidence boundary remains preserved, FP-0122 metadata builder boundary remains preserved, FP-0120 canonical resource/auth-server boundary remains preserved, FP-0118 protected-resource metadata boundary remains preserved, FP-0117 OAuth sequencing boundary remains preserved, FP-0107 route adapter boundary remains preserved, FP-0106 protocol envelope boundary remains preserved, and FP-0100 public security boundary remains preserved.
- Decision: FP-0127 was absent at FP-0126 closeout; successor auth-challenge contract work requires its own named Finance Plan.

## Context and Orientation

FP-0125 shipped exactly one local-only/read-only protected-resource metadata GET route at `/.well-known/oauth-protected-resource/mcp`, registered only when app construction supplies explicit valid FP-0123 route-input evidence. Default `buildApp()` remains metadata-route absent. FP-0125 also preserves /mcp behavior and adds no WWW-Authenticate behavior.

FP-0124 and FP-0118 deliberately kept WWW-Authenticate resource_metadata challenge behavior separate because it changes /mcp auth-failure behavior. FP-0126 keeps that separation and prepares proof gates so the repo can discuss challenge sequencing without accidentally shipping route behavior.

Official read-only protocol context:

- MCP Authorization, 2025-11-25: protected-resource metadata discovery can use either WWW-Authenticate resource_metadata on 401 or a well-known URI; scope challenges are authoritative for the current request and token audience validation matters.
- MCP Transports, 2025-11-25: Streamable HTTP keeps a single MCP endpoint path, Origin validation, POST request handling, notification 202 behavior, and GET 405 when SSE is not offered.
- MCP Security Best Practices: token passthrough is forbidden, token audience separation matters, and scope minimization should use precise challenges rather than broad catalogs.
- RFC 9728: defines the resource_metadata WWW-Authenticate parameter and protected-resource metadata discovery.
- OpenAI Apps SDK Authentication and Security/Privacy docs: ChatGPT needs protected-resource metadata, OAuth metadata, token verification, and runtime auth signaling before OAuth UI/public auth behavior is safe.

OpenAI Developers was not exposed as a read-only docs connector in this thread; tool discovery exposed only OpenAI Platform API-key setup tools. Those tools were not used.

## Plan of Work

1. Create FP-0126 as a plan/proof-gate compatibility record only.
2. Add proof helpers that accept exactly one FP-0126 docs-only WWW-Authenticate resource_metadata auth-challenge sequencing plan and require FP-0127 absence.
3. Bridge the FP-0125 local route proof and related proof tools so they preserve the shipped metadata route, evidence-coherence hardening, and /mcp behavior while allowing this single plan.
4. Add focused domain tests for exact FP-0126 acceptance, FP-0127 absence, no runtime/auth/deployment/source/finance scope, and unchanged prior boundaries.
5. Refresh only directly stale active docs and plugin notes.
6. Run strict same-branch validation, patch defects on this branch if any, and commit once after validation is green.

## Concrete Steps

1. Add FP-0126 plan constants and verification helpers in the domain proof surface.
2. Update proof tools to expose:
   - `fp0126AbsentOrDocsOnlyWwwAuthenticateAuthChallengeSequencingPlanVerified`
   - `fp0127Absent`
   - `wwwAuthenticateAuthChallengeSequencingBoundaryVerified`
   - `noMcpRouteBehaviorChangeFromFp0126`
   - `noWwwAuthenticateBehaviorFromFp0126`
   - `noOauthImplementationFromFp0126`
   - `noTokenSessionImplementationFromFp0126`
   - `noAuthMiddlewareImplementationFromFp0126`
   - `noRemoteMcpDeploymentFromFp0126`
   - `noDeploymentConfigFromFp0126`
   - `noAppsSdkResourceFromFp0126`
   - `noAppSubmissionFromFp0126`
   - `noDbQueriesFromFp0126`
   - `noSchemaMigrationsFromFp0126`
   - `noPackageScriptsFromFp0126`
   - `noOpenAiApiCallsFromFp0126`
   - `noProviderExternalCallsFromFp0126`
   - `noSourceMutationFinanceWriteFromFp0126`
   - `noPublicAssetsSubmissionArtifactsFromFp0126`
   - `fp0125ProtectedResourceMetadataLocalRouteBoundaryStillVerified`
   - `fp0125EvidenceCoherenceBoundaryStillVerified`
3. Keep existing prior-boundary gates for FP-0124, FP-0123, FP-0122, FP-0120, FP-0118, FP-0117, FP-0107, FP-0106, and FP-0100 green.
4. Add focused tests proving exactly one FP-0126 path is accepted, FP-0127 was absent at FP-0126 closeout, FP-0126 is docs-and-plan/proof-gate only, no /mcp route behavior changed, no protected-resource metadata route behavior changed, no WWW-Authenticate header behavior was added, no OAuth/token/session/auth middleware was added, no remote MCP/deployment config was added, no DB/schema/package/data/source-pack/public-asset/OpenAI/provider/source/finance-write scope exists, FP-0125 route remains exact and explicit-dependency-only, FP-0125 evidence-coherence proof remains green, and existing prior boundaries remain intact.

## Validation and Acceptance

Acceptance requires:

- exactly one FP-0126 plan path
- FP-0127 was absent at FP-0126 closeout
- FP-0126 is docs-and-plan/proof-gate compatibility only
- no /mcp route behavior change
- no protected-resource metadata route behavior change
- no WWW-Authenticate header behavior
- no OAuth/token/session/auth middleware
- no remote MCP or deployment config
- no Apps SDK resource, public app behavior, or app submission
- no DB query, schema, migration, package script, fixture, sample data, source pack, public asset, listing copy, generated public prose, OpenAI API/model call, provider call, source mutation, finance write, or autonomous action
- FP-0125 exact local metadata route and explicit-dependency-only posture remain proven
- FP-0125 evidence-coherence hardening remains proven
- prior FP-0124, FP-0123, FP-0122, FP-0120, FP-0118, FP-0117, FP-0107, FP-0106, and FP-0100 boundaries remain proven

Validation command set:

```bash
git diff --check
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
pnpm --filter @pocket-cto/domain exec vitest run src/benchmark-community.spec.ts src/read-only-app-mcp.spec.ts src/read-only-app-mcp-descriptor.spec.ts src/read-only-app-mcp-public-security.spec.ts src/read-only-app-mcp-endpoint-architecture.spec.ts src/read-only-app-mcp-endpoint-route-ownership.spec.ts src/read-only-app-mcp-protocol-envelope.spec.ts src/read-only-app-mcp-evidence-tool-dispatch.spec.ts src/read-only-app-mcp-oauth-security.spec.ts src/read-only-app-mcp-remote-host-readiness.spec.ts src/read-only-app-mcp-remote-host-resource.spec.ts src/read-only-app-mcp-protected-resource-metadata.spec.ts src/read-only-app-mcp-protected-resource-metadata-builder.spec.ts src/read-only-app-mcp-protected-resource-metadata-route-input.spec.ts src/read-only-app-mcp-canonical-resource-proof.spec.ts src/read-only-app-mcp-canonical-resource-validation.spec.ts
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/read-only-app-mcp-endpoint/routes.spec.ts src/modules/read-only-app-mcp-endpoint/service.spec.ts src/modules/read-only-app-mcp-endpoint/evidence-dispatcher.spec.ts src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.spec.ts src/app.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

## Idempotence and Recovery

This plan is idempotent because it adds no route behavior, no auth runtime, no deployment, no database state, no source ingestion, and no finance write. If validation fails, patch the same branch and rerun the relevant proof ladder before final validation. If unrelated dirty files appear, stop and report the conflict. If FP-0127 appears, remove it from this slice and rerun proof gates; FP-0127 must remain absent.

## Artifacts and Notes

- Plan artifact: `plans/FP-0126-read-only-chatgpt-app-mcp-www-authenticate-auth-challenge-sequencing-master-plan.md`
- Proof artifacts: domain FP-0126 boundary helpers and updated existing proof tools only.
- Research artifacts: official web docs only; no OpenAI Developers read-only docs connector was exposed. OpenAI Platform API-key setup tools were not used.
- No source files, uploaded exports, PDFs, source documents, finance evidence, source snapshots, or derived finance artifacts were mutated.

## Interfaces and Dependencies

- Depends on shipped FP-0125 local metadata route and evidence-coherence hardening.
- Depends on shipped FP-0124 route implementation planning boundary.
- Depends on shipped FP-0123 route-input evidence boundary.
- Depends on shipped FP-0122 metadata builder boundary.
- Depends on shipped FP-0120 canonical resource/auth-server boundary.
- Depends on shipped FP-0118 protected-resource metadata/auth-challenge readiness contracts.
- Depends on shipped FP-0117 OAuth/token/session/auth implementation sequencing.
- Depends on shipped FP-0107 route adapter, FP-0106 protocol envelope, and FP-0100 public security boundaries.
- Does not depend on remote MCP, public host, deployment config, Apps SDK resources, app submission, DB/schema/migration work, package script changes, provider calls, OpenAI API/model calls, source mutation, finance writes, or external communications.

## Outcomes & Retrospective

FP-0126 records the next safe auth-adjacent step as sequencing and compatibility only. It kept the shipped FP-0125 protected-resource metadata local route exact and explicit-dependency-only, preserved default buildApp metadata route absence, kept /mcp behavior unchanged, kept WWW-Authenticate behavior absent, kept OAuth/token/session/auth middleware absent, kept remote/public/App SDK/app submission work absent, and left FP-0127 not yet created at FP-0126 closeout.

The next slice after FP-0126 was expected to be a narrow contracts-only successor if the team wanted to prepare WWW-Authenticate challenge implementation contracts. Runtime implementation should not start until a later plan resolves token validation, authenticated company binding, public canonical URL, exact scope semantics, and route behavior authorization. Public ChatGPT App submission should wait.
