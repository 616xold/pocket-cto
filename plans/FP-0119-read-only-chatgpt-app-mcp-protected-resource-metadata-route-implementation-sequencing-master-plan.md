# FP-0119 read-only ChatGPT App MCP protected-resource metadata route implementation sequencing

## Purpose / Big Picture

FP-0119 is a docs-and-plan plus proof-gate compatibility master plan for protected-resource metadata route implementation sequencing and `WWW-Authenticate` `resource_metadata` challenge sequencing after FP-0118.

This slice exists because FP-0118 shipped local/proof-only/read-only protected-resource metadata and auth challenge readiness contracts. FP-0118 proves metadata document shape, canonical resource URI dependency, `authorization_servers`, `scopes_supported`, `bearer_methods_supported`, `WWW-Authenticate` `resource_metadata` readiness, scope challenge readiness, token failure challenge posture, no-token-leakage, protected-resource route deferral, `WWW-Authenticate` route deferral, and no-runtime posture. FP-0118 does not implement a protected-resource metadata route and does not change `/mcp` auth failure behavior.

FP-0119 does not implement protected-resource metadata routes, does not implement `WWW-Authenticate` challenge behavior, does not implement OAuth, does not implement token/session storage, does not implement auth middleware, does not change `/mcp` route behavior, does not add route paths, does not deploy remote MCP, does not add deployment config, does not add Apps SDK resources, does not add public app behavior, and does not create FP-0120. Public app submission remains future-only. FP-0120 remains absent.

## Progress

- [x] 2026-05-16T10:48:50Z: Invoked Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor from the repo-local Pocket CFO operator bundle. GitHub Connector Guard was not invoked because GitHub connector product behavior is out of scope.
- [x] 2026-05-16T10:48:50Z: Confirmed work is on `codex/v2am-read-only-chatgpt-app-mcp-protected-resource-metadata-route-implementation-sequencing-master-plan-local-v1`, the worktree was clean before edits, PR #286 is merged, FP-0118 exists and is shipped, FP-0119 was absent, FP-0120 was absent, and the active docs support FP-0118 as shipped local/proof-only protected-resource metadata/auth challenge contracts.
- [x] 2026-05-16T10:48:50Z: Ran the required pre-edit proof ladder. All existing direct proof tools listed by this plan passed before FP-0119 edits.
- [x] 2026-05-16T10:48:50Z: Used official MCP, RFC 9728, and OpenAI Apps SDK documentation as read-only research context. No OpenAI Developers read-only docs MCP tool was callable in this thread, so official web docs were used. No OpenAI API, model, key setup, provider, deployment, app-submission, artifact-upload, source mutation, or finance-write workflow was used.
- [x] 2026-05-16T11:05:54Z: Applied FP-0118 route/path proof-durability polish for general no-new-route-path repository inventory checks, including dirty-worktree/branch-diff path scanning and route-like inventory coverage for `apps/web/app/**/route.ts`, `apps/web/pages/api/**`, `apps/control-plane/src/**/routes.ts`, and backend/control-plane route-like module names.
- [x] 2026-05-16T11:05:54Z: Bridged proof gates so exactly this FP-0119 docs-only protected-resource metadata route sequencing plan is accepted while FP-0120 remains absent. The bridge keeps route behavior, route expansion, protected-resource metadata routes, `WWW-Authenticate` route behavior, OAuth/token/session/auth middleware, remote MCP deployment, deployment config, Apps SDK resources, app submission, DB/schema/package/data/source-pack/public-asset/provider/OpenAI/source/finance/autonomous scopes blocked.
- [x] 2026-05-16T11:05:54Z: Refreshed directly stale active docs, security/demo policy docs, roadmap, and `plugins.md` so FP-0118 is shipped, FP-0119 is active as docs-and-plan/proof-gate-only sequencing, and FP-0120 remains absent.
- [x] 2026-05-16T11:05:54Z: Ran focused validation, strict same-branch QA, all required proof tools, focused domain/control-plane specs, `pnpm lint`, corrected one literal-type test helper found by `pnpm typecheck`, reran `pnpm typecheck`, ran `pnpm test`, and ran `pnpm ci:repro:current` successfully before this closeout edit.
- [x] 2026-05-16T11:43:00Z: Re-ran strict same-branch QA after the earlier `pnpm ci:repro:current` timeout. `git diff --check`, all required proof tools, focused domain specs, focused control-plane route/service/dispatcher/app-wiring specs, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current` passed on the FP-0119 dirty tree. The earlier `src/modules/evals/codex-subscription-client.spec.ts` worker timeout is treated as transient validation infrastructure behavior, not an FP-0119 product or proof-gate defect.
- [x] 2026-05-16T12:19:06Z: Started targeted post-merge FP-0119 / FP-0118 route-inventory proof durability hardening on `codex/v2am-read-only-chatgpt-app-mcp-protected-resource-metadata-route-sequencing-proof-durability-hardening-local-v1` after confirming PR #287 was merged, FP-0119 existed, FP-0120 was absent, required proof tools were present, local Postgres/object storage were available, and the baseline direct proof ladder passed.
- [x] 2026-05-16T12:19:06Z: Hardened `noNewRoutePathRepositoryInventoryVerified` so the proof still uses branch-diff plus dirty-worktree route-like changed-path scanning, and now also compares the current repository route-like inventory against the explicit known-safe shipped route inventory. Added `knownSafeRouteInventoryVerified`, `noUnexpectedRouteLikeRepositoryPaths`, and `fp0119PostmergeRouteInventoryProofVerified` proof fields plus focused simulations for protected-resource metadata route paths, WWW-Authenticate route-source behavior, a new public control-plane route, known-safe routes, and unrelated docs paths. Focused protected-resource metadata proof and domain spec passed before this plan note.
- [x] 2026-05-16T12:26:24Z: Full validation passed for the hardening tree before this closeout note: `git diff --check`, all required direct proof tools, focused domain and control-plane specs, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`. Because this is a post-validation plan closeout edit, the required post-closeout rerun subset must pass before commit.

## Surprises & Discoveries

- OpenAI Developers is available as an installed plugin family, but the OpenAI docs MCP tools named by the built-in `openai-docs` skill were not callable in this thread. The user policy for this slice allows official web docs when OpenAI Developers read-only docs are not exposed, so the research ledger uses official MCP, RFC, and OpenAI web documentation only.
- RFC 9728 derives the protected-resource metadata URL by inserting `/.well-known/oauth-protected-resource` between the host and any path/query component of the protected resource identifier. Because FP-0116 and FP-0118 currently require the canonical public MCP resource URI to use public `/mcp`, the route path that matches current repo truth is future-only `GET /.well-known/oauth-protected-resource/mcp`, unless a later plan changes the canonical resource identifier to host root or explicitly proves dual publication.
- OpenAI Apps SDK Authentication docs use `GET https://your-mcp.example.com/.well-known/oauth-protected-resource` as the plain-language example when the canonical MCP resource is the host root, and also allow advertising the metadata URL in `WWW-Authenticate` on 401 responses. That does not override RFC 9728 path derivation for a resource identifier with `/mcp`.
- Legacy FP-0107 and FP-0109 proof tools had explicit changed-file allowlists that treated the single new FP-0119 plan path as out of scope. The fix was limited to adding the exported FP-0119 plan path constant to those proof-only allowlists; no route/runtime behavior was changed.

## Decision Log

- Decision: Protected-resource metadata route implementation cannot start from current repo truth as an implementation slice. The repo still lacks a named stable HTTPS canonical public resource URI, a chosen authorization server issuer set, authenticated company binding runtime, route-path derivation tests, and no-leakage route proof gates.
- Decision: Protected-resource metadata route implementation must not be local-only before remote host/canonical URI implementation by default. A future plan may only open a contract-only local readiness route if it proves no public exposure, no route behavior change to `/mcp`, no real finance data, and no token material.
- Decision: Route behavior should be implemented after the canonical public resource URI is decided. A contract-only local readiness route remains a possible later exception only if a future Finance Plan proves it is safer than waiting.
- Decision: `WWW-Authenticate` `resource_metadata` challenge behavior should be a later or separate implementation lane because it changes `/mcp` unauthenticated, invalid-token, wrong-scope, and token-failure behavior.
- Decision: The exact future route path allowed by current repo truth and RFC 9728 is `GET /.well-known/oauth-protected-resource/mcp` for a canonical protected resource identifier ending in `/mcp`. The root `GET /.well-known/oauth-protected-resource` path is future-only and only allowed if a later plan changes the canonical resource identifier to host root or explicitly proves dual publication.
- Decision: `.well-known/oauth-protected-resource` route behavior is not in FP-0119 scope. It may be in scope only for a future named plan after route-path derivation, canonical public resource URI, metadata document tests, no-token-leakage gates, and `/mcp` unchanged-behavior gates are green.
- Decision: FP-0120 remains absent. A future FP-0120 may open only a narrow protected-resource metadata route readiness or implementation plan after FP-0119 proof gates are satisfied; it must not include `WWW-Authenticate` behavior unless it explicitly proves the `/mcp` auth-failure behavior change.
- Decision: Post-merge route durability must not depend only on branch-diff or dirty-worktree paths. The FP-0119 / FP-0118 proof now treats the current repository route-like inventory as durable evidence by comparing it to the shipped known-safe route inventory and failing on any unexpected route-like path, including a clean post-merge worktree.

## Context and Orientation

FP-0118 is shipped as local/proof-only/read-only protected-resource metadata/auth challenge readiness contracts. It keeps protected-resource metadata route implementation, `WWW-Authenticate` route behavior, OAuth/token/session/auth middleware, remote MCP deployment, deployment config, route behavior changes, Apps SDK resources, public app behavior, app submission, DB work, OpenAI API/model calls, provider calls, source mutation, finance writes, public assets, and FP-0119 absent.

FP-0117 is shipped as docs-and-plan plus proof-gate compatibility for OAuth/token/session/auth implementation sequencing. It decides OAuth/token/session/auth implementation cannot start from current repo truth and that protected-resource metadata plus `WWW-Authenticate` `resource_metadata` readiness should lead the auth-adjacent lane.

FP-0116 is shipped as local/proof-only/read-only remote host owner, canonical resource URI, public `/mcp`, protected-resource metadata, and provider-neutral contracts. It requires a future exact stable HTTPS canonical resource URI and keeps workspace/tenant template URLs rejected.

FP-0113 is shipped as local/proof-only OAuth/token/session/user-org/company binding security contracts. It requires authenticated user/org/company binding, treats `companyKey` as a selector only, requires minimized scopes and audience/resource validation, forbids token passthrough, and keeps OAuth/token/session/auth middleware future-only.

Official research ledger:

- MCP Authorization specification, version 2025-11-25 latest (`https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization`): used for protected-resource metadata requirements, `authorization_servers`, `WWW-Authenticate` `resource_metadata`, authorization-server discovery, resource indicators, access token handling, audience/resource validation, token passthrough prohibition, token failure status codes, and scope challenge handling.
- RFC 9728 OAuth 2.0 Protected Resource Metadata (`https://www.rfc-editor.org/rfc/rfc9728`): used for protected-resource metadata path derivation, `resource`, `authorization_servers`, `scopes_supported`, `bearer_methods_supported`, metadata response validation, `WWW-Authenticate` `resource_metadata`, and audience-restricted access token/resource indicator posture.
- MCP Transports specification, version 2025-11-25 latest (`https://modelcontextprotocol.io/specification/2025-11-25/basic/transports`): used for Streamable HTTP, single MCP endpoint posture, POST/GET behavior, GET SSE or 405 posture, Origin validation, localhost binding, and auth recommendation.
- MCP Security Best Practices (`https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices`): used for token passthrough prohibition, confused deputy posture, SSRF precautions around OAuth metadata URLs, least privilege, token/audience validation, session security, prompt-injection posture, and fail-closed public exposure planning.
- OpenAI Apps SDK Authentication docs (`https://developers.openai.com/apps-sdk/build/auth`): used for future ChatGPT OAuth expectations, protected-resource metadata hosting/discovery, `WWW-Authenticate` `resource_metadata` challenges, resource/audience validation, missing/stale token handling, authorization server discovery, and OAuth-flow testing context.
- OpenAI Apps SDK Security & Privacy docs (`https://developers.openai.com/apps-sdk/guides/security-privacy`): used for least privilege, consent, server-side validation, data minimization, token/secret avoidance in component props, logging redaction, and human confirmation for irreversible operations.
- OpenAI Apps SDK Deploy your app docs (`https://developers.openai.com/apps-sdk/deploy`): used only as future remote host/deployment context. FP-0119 does not deploy.
- OpenAI Apps SDK Connect from ChatGPT docs (`https://developers.openai.com/apps-sdk/deploy/connect-chatgpt`): used only as future connector/developer-mode context. FP-0119 does not connect an app.
- OpenAI Apps SDK Test your integration docs (`https://developers.openai.com/apps-sdk/deploy/testing`): used only as future validation context. FP-0119 does not run ChatGPT developer-mode or MCP Inspector validation.
- OpenAI Apps SDK Submit and maintain your app docs (`https://developers.openai.com/apps-sdk/deploy/submission`): used only as future submission context. FP-0119 creates no submission assets, listing copy, screenshots, public assets, or app-submission materials.

## Plan of Work

Create exactly one Finance Plan file for FP-0119 and keep it docs-and-plan/proof-gate only.

Apply FP-0118 proof-durability polish so the direct protected-resource metadata proof scans branch-diff plus dirty worktree paths and includes a general no-new-route-path repository inventory covering `apps/web/app/**/route.ts`, `apps/web/pages/api/**`, `apps/control-plane/src/**/routes.ts`, and backend/control-plane route-like module names. Preserve explicit protected-resource metadata route checks and `WWW-Authenticate` route behavior checks.

Bridge the minimum proof gates so exactly this FP-0119 plan path is accepted while FP-0120 remains absent. The bridge must prove FP-0119 plans protected-resource metadata route implementation sequencing and `WWW-Authenticate` sequencing only, and does not authorize route behavior changes, route expansion, protected-resource metadata route implementation, `WWW-Authenticate` route behavior, OAuth implementation, token/session implementation, auth middleware, remote MCP deployment, deployment config, Apps SDK resources, public app behavior, app submission, DB queries, schemas, migrations, package scripts, fixtures, sample data, source packs, OpenAI API/model calls, provider calls, public assets, listing copy, generated public prose, source mutation, finance writes, generated finance advice, runtime-Codex finance output, or autonomous action.

Refresh only directly stale active docs and `plugins.md` so the active boundary says FP-0118 is shipped and FP-0119 is the active docs-only route sequencing plan.

## Concrete Steps

1. Keep work on `codex/v2am-read-only-chatgpt-app-mcp-protected-resource-metadata-route-implementation-sequencing-master-plan-local-v1`.
2. Add this exact plan and no FP-0120 plan.
3. Add FP-0118 route inventory proof fields: `noNewRoutePathRepositoryInventoryVerified` and `fp0118RouteInventoryDurabilityVerified`.
4. Add focused route inventory tests proving simulated `apps/web/app/.well-known/oauth-protected-resource/route.ts`, `apps/web/app/protected-resource-metadata/route.ts`, `apps/web/pages/api/oauth-protected-resource.ts`, and `/mcp` route-source `WWW-Authenticate` behavior fail, while unrelated docs paths pass.
5. Add proof-gate bridge fields for FP-0119 docs-only sequencing and FP-0120 absence.
6. Add focused planning tests proving FP-0119 includes protected-resource metadata route sequencing, `WWW-Authenticate` sequencing, canonical URI prerequisite, route tests, metadata document tests, no token leakage, authenticated company binding, and FP-0120 absence.
7. Refresh directly stale active docs and `plugins.md`.
8. Run focused validation, strict same-branch QA, full validation, closeout updates, final reruns if needed, one commit, push, and PR.

## Validation and Acceptance

Validation commands:

- `git diff --check`
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
- `pnpm --filter @pocket-cto/domain exec vitest run src/benchmark-community.spec.ts src/read-only-app-mcp.spec.ts src/read-only-app-mcp-descriptor.spec.ts src/read-only-app-mcp-public-security.spec.ts src/read-only-app-mcp-endpoint-architecture.spec.ts src/read-only-app-mcp-endpoint-route-ownership.spec.ts src/read-only-app-mcp-protocol-envelope.spec.ts src/read-only-app-mcp-evidence-tool-dispatch.spec.ts src/read-only-app-mcp-oauth-security.spec.ts src/read-only-app-mcp-remote-host-readiness.spec.ts src/read-only-app-mcp-remote-host-resource.spec.ts src/read-only-app-mcp-protected-resource-metadata.spec.ts`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/read-only-app-mcp-endpoint/routes.spec.ts src/modules/read-only-app-mcp-endpoint/service.spec.ts src/modules/read-only-app-mcp-endpoint/evidence-dispatcher.spec.ts src/app.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

Acceptance requires exactly one FP-0119 path, FP-0120 absent, FP-0119 docs-and-plan/proof-gate only, no route behavior change, no new route path, no protected-resource metadata route, no `WWW-Authenticate` route behavior, no OAuth/token/session/auth middleware, no remote MCP deployment, no deployment config, no Apps SDK resources, no public app behavior, no app submission, no DB queries, no schemas/migrations, no package scripts, no fixtures/datasets/source packs, no public assets, no listing copy, no generated public prose, no OpenAI API/model calls, no provider/external calls, no source mutation, no finance writes, no generated finance advice, no runtime-Codex finance output, no autonomous action, preserved local `/mcp` behavior, preserved default fail-closed `buildApp()`, and preserved FP-0118/0117/0116/0113/0107/0106/0100 boundaries.

## Idempotence and Recovery

This is docs/proof-gate compatibility only. There are no migrations, provider state, OAuth state, token/session state, source artifacts, finance writes, deployment files, route files, public assets, Apps SDK resources, or runtime state to roll back.

If validation fails, patch only the FP-0119 protected-resource metadata route sequencing proof-gate bridge or FP-0118 protected-resource metadata proof-contract durability surface on this branch. If validation reveals a broader shipped-boundary defect, stop and recommend the smallest safer corrective slice instead of widening FP-0119.

## Artifacts and Notes

Expected artifacts are this FP-0119 plan, focused proof-gate bridge updates, focused FP-0118 route/path proof-durability polish, directly stale active-doc/plugin refresh, and validation evidence.

Replay implication: this slice changes plans, docs, domain proof contracts, and proof tooling only. It does not ingest sources, mutate raw source files, create mission outputs, change mission state, release communications, write finance state, or create runtime-Codex finance output. No mission replay event is required beyond plan progress, decision log, proof output, and final validation evidence.

Provenance/freshness/limitations implication: this slice does not answer finance questions or compile reports. It preserves the requirement that any future mission-facing output expose provenance, freshness posture, and limitations. Future protected route outputs must still treat raw sources, Finance Twin, CFO Wiki, and evidence bundles as source truth and must not leak tokens or real finance data into metadata, logs, evidence, structured tool results, or public/app submission artifacts.

## Interfaces and Dependencies

Primary module touch is `packages/domain` proof-gate helpers and specs. Direct proof tooling under `tools/` may change only for proof-gate bridge compatibility and FP-0118 route/path proof-durability polish. `apps/control-plane` route files are validation context only and must not change.

No new environment variables, package scripts, route paths, schemas, migrations, DB queries, fixtures, datasets, sample data, source packs, public assets, provider configs, OpenAI API/model integrations, Apps SDK resources, OAuth/session/auth middleware, deployment files, public app behavior, app submission assets, or external communications are introduced.

GitHub connector product behavior is out of scope. Routine `git`, push, and PR publication may happen after validation.

## Outcomes & Retrospective

FP-0119 decides protected-resource metadata route implementation should not start from current repo truth. A future route implementation lane must first prove the stable HTTPS canonical public resource URI, exact RFC 9728 route path derivation, route tests, metadata document tests, no-token-leakage gates, local `/mcp` unchanged-behavior gates, and authenticated company binding. A contract-only local readiness route remains possible only if a future named Finance Plan proves it is safer than waiting for public canonical URI work.

The proof-gate bridge accepts exactly `plans/FP-0119-read-only-chatgpt-app-mcp-protected-resource-metadata-route-implementation-sequencing-master-plan.md` while keeping FP-0120 absent. It proves FP-0119 is docs-and-plan/proof-gate only and does not authorize route behavior changes, route expansion, protected-resource metadata route implementation, `WWW-Authenticate` route behavior, OAuth implementation, token/session implementation, auth middleware, remote MCP deployment, deployment config, Apps SDK resources, public app behavior, app submission, DB queries, schemas/migrations, package scripts, fixtures, sample data, source packs, public assets, listing copy, generated public prose, OpenAI API/model calls, provider/external calls, source mutation, finance writes, generated finance advice, runtime-Codex finance output, or autonomous action.

FP-0118 proof durability now includes `noNewRoutePathRepositoryInventoryVerified` and `fp0118RouteInventoryDurabilityVerified`, with tests proving simulated protected-resource metadata route files and route-source `WWW-Authenticate` behavior fail while unrelated docs paths pass. The post-merge hardening correction further adds an explicit known-safe shipped route-like inventory, `knownSafeRouteInventoryVerified`, `noUnexpectedRouteLikeRepositoryPaths`, and `fp0119PostmergeRouteInventoryProofVerified`, so a clean merged tree fails if an unapproved route-like path appears. Strict same-branch QA confirmed the changed files are docs/proof-gate only, no route file changed, no route path was added, no package/DB/deployment/runtime asset scope changed, and no FP-0120 file exists.

Validation before the first closeout edit passed: all required proof tools, focused domain specs, focused control-plane route/service/dispatcher/app-wiring specs, `git diff --check`, `pnpm lint`, `pnpm typecheck` after the literal-type helper correction, `pnpm test`, and `pnpm ci:repro:current`. A later `pnpm ci:repro:current` run timed out once in `src/modules/evals/codex-subscription-client.spec.ts`; same-branch QA reran the full required ladder and `pnpm ci:repro:current` passed, so no FP-0119 correction was needed beyond recording the validation durability outcome. Public ChatGPT App submission must wait.
