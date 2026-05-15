# FP-0118 read-only ChatGPT App MCP protected-resource metadata auth challenge readiness contracts

## Purpose / Big Picture

FP-0118 is a local/proof-only/read-only contract slice for protected-resource metadata and auth-challenge readiness on the future remote/public read-only ChatGPT App/MCP path.

This slice exists because FP-0117 decided OAuth/token/session/auth implementation cannot start from current repo truth and that protected-resource metadata plus `WWW-Authenticate` `resource_metadata` readiness should be the first safe OAuth-adjacent lane. FP-0116 proved the remote host owner, canonical URI, and protected-resource metadata boundary, but did not implement metadata document shape contracts. FP-0113 proved OAuth/token/session/user-org/company binding contracts, but did not implement protected-resource metadata or challenge behavior.

FP-0118 implements pure domain contracts and proof tooling only. It does not add protected-resource metadata routes, does not implement route behavior, does not add `WWW-Authenticate` route behavior, and does not add OAuth, token/session storage, auth middleware, remote MCP deployment, deployment config, Apps SDK resources, public app behavior, app submission, DB queries, schemas, migrations, package scripts, fixtures, sample data, source packs, public assets, listing copy, generated public prose, OpenAI API/model calls, provider calls, external communications, source mutation, finance writes, generated finance advice, runtime-Codex finance output, or autonomous action.

## Progress

- [x] 2026-05-15T21:57:37Z: Invoked Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor from the repo-local Pocket CFO operator bundle. GitHub Connector Guard was not invoked because GitHub connector product behavior is out of scope.
- [x] 2026-05-15T21:57:37Z: Confirmed work is on `codex/v2al-read-only-chatgpt-app-mcp-protected-resource-metadata-auth-challenge-readiness-contracts-local-v1`, the worktree was clean before edits, PR #284 / FP-0117 is merged, FP-0117 is shipped, FP-0118 and FP-0119 were absent, and the active docs support FP-0117 as shipped docs/proof-only OAuth/token/session/auth implementation sequencing.
- [x] 2026-05-15T21:57:37Z: Ran the required pre-edit proof ladder. All existing direct proof tools listed by this plan passed before FP-0118 edits.
- [x] 2026-05-15T21:57:37Z: Used official MCP/IETF/OpenAI documentation as read-only research context. No OpenAI Developers read-only docs tool was exposed; official web docs were used instead. No OpenAI API, model, key setup, provider, deployment, app-submission, artifact-upload, source mutation, or finance-write workflow was used.
- [x] 2026-05-15T22:11:39Z: Created pure protected-resource metadata/auth challenge readiness domain contracts and focused specs.
- [x] 2026-05-15T22:11:39Z: Added `tools/read-only-mcp-protected-resource-metadata-proof.mjs`.
- [x] 2026-05-15T22:11:39Z: Bridged existing proof gates so the exact FP-0118 local/proof-only contract path is accepted while FP-0119 remains absent.
- [x] 2026-05-15T22:11:39Z: Refreshed directly stale README/CODEX/START/ACTIVE_DOCS/PROJECT_STATE/V2_BOUNDARY/ROADMAP/security/demo/plugin docs for the FP-0118 contract boundary.
- [x] 2026-05-15T22:24:58Z: Completed focused validation, strict same-branch QA, and final validation. A narrow typecheck correction in the focused FP-0118 spec kept proof inputs literal-true instead of loosening the contract. All direct proof tools, focused specs, `git diff --check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current` passed after the correction.
- [x] 2026-05-15T22:24:58Z: Confirmed no FP-0119 exists; no route behavior, route path, protected-resource metadata route, `WWW-Authenticate` route behavior, OAuth/token/session/auth middleware, remote MCP deployment, deployment config, Apps SDK resource, public app behavior, app submission, DB/schema/package/data/asset/source-pack, OpenAI/model/provider, source mutation, finance write, generated finance advice, runtime-Codex finance output, external communication, or autonomous-action scope was added.
- [x] 2026-05-15T22:24:58Z: Committed once, pushed the branch, and opened PR #286.
- [x] 2026-05-15T22:37:36Z: Same-branch QA found and corrected one proof-durability issue: the direct FP-0118 proof tool now audits committed branch-diff paths from `origin/main...HEAD` plus dirty worktree paths, so forbidden package/script/route/runtime changes remain visible after the PR branch is committed.

## Surprises & Discoveries

- OpenAI Developers is available as an installed plugin family in this Codex thread, but no callable read-only documentation tool was exposed for this slice. Official OpenAI web docs were used instead.
- The MCP Authorization specification is current at version 2025-11-25 latest and requires MCP servers using auth to implement OAuth 2.0 Protected Resource Metadata for authorization-server discovery.
- RFC 9728 defines the exact protected-resource metadata fields FP-0118 needs to model: `resource`, `authorization_servers`, `scopes_supported`, and `bearer_methods_supported`.
- The existing FP-0117 proof source hardening was reusable; FP-0118 only needed a narrow bridge so exact FP-0118 contracts are accepted while FP-0119 remains absent.
- The first final `pnpm typecheck` run found that dynamic spec booleans were not assignable to literal `true` proof fields. The correction was kept inside the focused FP-0118 spec by asserting each dynamic check and returning literal `true`, preserving strict contract typing.
- Same-branch QA found that `tools/read-only-mcp-protected-resource-metadata-proof.mjs` used `git status` alone for changed-file scope checks. That was sufficient before the first commit but not durable for clean committed PR branches, so the tool now unions `origin/main...HEAD` branch-diff paths with dirty worktree paths.

## Decision Log

- Decision: Protected-resource metadata is required before any public token-protected exposure, but FP-0118 does not implement a protected-resource metadata route.
- Decision: `WWW-Authenticate` `resource_metadata` challenge behavior is required for future unauthenticated/invalid-token discovery, but FP-0118 does not implement route behavior.
- Decision: The future metadata document shape must include at least `resource`, `authorization_servers`, `scopes_supported`, and `bearer_methods_supported`.
- Decision: `resource` must depend on the future exact stable HTTPS canonical public MCP resource URI from FP-0116. Placeholder URLs, current local route URLs, workspace/tenant templates, query strings, fragments, and `companyKey` authority are rejected.
- Decision: `authorization_servers` must be non-empty before implementation, but provider/auth-server selection remains unresolved and provider-neutral in FP-0118.
- Decision: `scopes_supported` must remain least-privilege and read-only only. Wildcard, write, provider, admin, offline-access, and broad finance scopes are not allowed by this contract.
- Decision: `bearer_methods_supported` must include header bearer usage and must forbid query-string token use.
- Decision: `WWW-Authenticate` challenges must include `resource_metadata` and may include scope guidance, but this stays contract-only and future-only.
- Decision: Missing, invalid, expired, malformed, wrong-audience, wrong-scope, wrong-org, revoked, or replayed token challenge behavior remains contract-only and future-only.
- Decision: Scope challenge handling must treat challenged scopes as authoritative for the current request, rather than deriving authority from `scopes_supported`.
- Decision: Authenticated company binding remains prerequisite. `companyKey` is a selector only and cannot be authority.
- Decision: Token passthrough remains forbidden.
- Decision: No token leakage is allowed in logs, UI props, metadata examples, evidence, structured tool results, docs examples, proof outputs, or public/app submission artifacts.
- Decision: Local `/mcp` route behavior remains unchanged, no new route path is added, no protected-resource metadata route is added, no `WWW-Authenticate` route behavior is added, and FP-0119 remains absent.
- Decision: FP-0118 direct proof changed-file scope checks must be durable on both dirty QA worktrees and clean committed PR branches. The direct proof tool therefore treats `origin/main...HEAD` as the committed PR scope and unions it with worktree status paths.

## Context and Orientation

FP-0117 is the shipped docs-and-plan plus proof-gate compatibility record for OAuth/token/session/auth implementation sequencing. It says protected-resource metadata/auth challenge readiness should lead the next auth-adjacent lane, but it does not implement the lane.

FP-0116 is the shipped local/proof-only/read-only remote host owner, canonical resource URI, public `/mcp` path, protected-resource metadata, and provider-neutral boundary contract foundation. It keeps host ownership unresolved, current `apps/control-plane` `/mcp` local-only, canonical resource URI future-only, and protected-resource metadata route behavior future-only.

FP-0113 is the shipped local/proof-only OAuth/token/session security contract foundation. It requires authenticated user/org/company binding, demotes `companyKey` to a selector, forbids token passthrough, requires minimized scopes and audience validation, and keeps OAuth/token/session/auth middleware future-only.

Official research ledger:

- MCP Authorization specification, version 2025-11-25 latest (`https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization`): used for protected-resource metadata requirements, `authorization_servers`, `WWW-Authenticate` `resource_metadata`, scope challenges, authorization-server discovery, resource indicators, canonical server URI, access token handling, token failure status codes, audience/resource validation, token handling, token passthrough prohibition, and least-privilege scope posture.
- RFC 9728 OAuth 2.0 Protected Resource Metadata (`https://www.rfc-editor.org/rfc/rfc9728.html`): used for exact metadata document field semantics for `resource`, `authorization_servers`, `scopes_supported`, and `bearer_methods_supported`, plus well-known metadata discovery and `WWW-Authenticate` metadata discovery posture.
- MCP Transports specification, version 2025-11-25 latest (`https://modelcontextprotocol.io/specification/2025-11-25/basic/transports`): used for Streamable HTTP, single endpoint posture, POST/GET behavior, GET SSE or 405 posture, Origin validation, and the recommendation that HTTP transports use MCP Authorization.
- MCP Security Best Practices current docs (`https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices`): used for token passthrough prohibition, confused-deputy posture, SSRF precautions around OAuth metadata URLs, least-privilege and token/audience validation posture, session security, prompt-injection posture, and fail-closed public exposure planning.
- MCP Tools specification, version 2025-11-25 latest (`https://modelcontextprotocol.io/specification/2025-11-25/server/tools`): used only as read-only tool context for preserving the existing V2G read-only tool surface, input validation, access control, output sanitization, and structured result posture.
- OpenAI Apps SDK Authentication docs (`https://developers.openai.com/apps-sdk/build/auth`): used for future ChatGPT OAuth expectations, protected-resource metadata hosting/discovery, `WWW-Authenticate` `resource_metadata` challenge examples, resource/audience validation, missing/stale token handling, and authentication-flow testing context.
- OpenAI Apps SDK Security & Privacy docs (`https://developers.openai.com/apps-sdk/guides/security-privacy`): used for least privilege, consent, server-side validation, data minimization, token/secret avoidance in component props, logging redaction, and audit posture.
- OpenAI Apps SDK Deploy your app docs (`https://developers.openai.com/apps-sdk/deploy`): used only as future remote host/deployment context. FP-0118 does not deploy.
- OpenAI Apps SDK Connect from ChatGPT docs (`https://developers.openai.com/apps-sdk/deploy/connect-chatgpt`): used only as future connector/developer-mode context. FP-0118 does not connect an app.
- OpenAI Apps SDK Test your integration docs (`https://developers.openai.com/apps-sdk/deploy/testing`): used only as future validation context. FP-0118 does not run ChatGPT developer-mode or MCP Inspector validation.
- OpenAI Apps SDK Submit and maintain your app docs (`https://developers.openai.com/apps-sdk/deploy/submission`): used only as future submission context. FP-0118 creates no submission assets or listing copy.

## Plan of Work

Create one protected-resource metadata/auth challenge readiness contract family under `packages/domain/src/read-only-app-mcp-protected-resource-metadata*.ts`. Keep the code pure, deterministic, and local/proof-only.

Add focused specs proving the metadata document boundary, canonical resource URI dependency, authorization server requirements, least-privilege read-only scopes, header bearer method posture, `WWW-Authenticate` readiness, metadata discovery, scope challenge behavior, token failure challenge posture, no-token-leakage, route deferral, `WWW-Authenticate` route deferral, no-runtime posture, and no forbidden implementation scope.

Add `tools/read-only-mcp-protected-resource-metadata-proof.mjs` with machine-readable JSON output and bridge the minimum existing proof gates so exact FP-0118 is accepted while FP-0119 remains absent.

Patch only directly stale active docs and `plugins.md` after implementation, keeping FP-0118 as local/proof-only/read-only contract work and public app submission future-only.

## Concrete Steps

1. Keep work on `codex/v2al-read-only-chatgpt-app-mcp-protected-resource-metadata-auth-challenge-readiness-contracts-local-v1`.
2. Add this exact plan and no FP-0119 plan.
3. Add protected-resource metadata/auth challenge readiness contract schemas, builders, proof schema, and plan/inventory verification helpers.
4. Add focused specs under `packages/domain/src/read-only-app-mcp-protected-resource-metadata.spec.ts`.
5. Add `tools/read-only-mcp-protected-resource-metadata-proof.mjs`.
6. Update the minimum proof-gate bridge in existing FP-0117/FP-0116/FP-0113/FP-0107/FP-0106/FP-0100 proof surfaces as needed so exact FP-0118 is accepted and FP-0119 remains absent.
7. Refresh directly stale docs and `plugins.md` only if the current text still describes FP-0118 as absent instead of active/shipped contract work.
8. Run focused validation, strict QA, full validation, closeout updates, final reruns, one commit, push, and PR.

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

Acceptance requires exactly one FP-0118 plan path, no FP-0119 path, local/proof-only/read-only contracts, required metadata document fields, canonical resource URI dependency, non-empty future `authorization_servers` before implementation, least-privilege read-only scopes, header bearer use with query-token prohibition, `WWW-Authenticate` `resource_metadata` readiness, authoritative challenged scopes, token failure challenge future posture, no-token-leakage surfaces, preserved authenticated company binding, token passthrough prohibition, unchanged local `/mcp` route behavior, no new route path, no protected-resource metadata route, no `WWW-Authenticate` route behavior, no OAuth/token/session/auth middleware, no remote MCP/deployment config, no Apps SDK resource/public app/submission, no DB/schema/package/data/asset/source-pack changes, no OpenAI/model/provider/external calls, no source mutation, no finance write, and preserved FP-0117/0116/0115/0114/0113/0112/0111/0109/0107/0106/0100 boundaries.

## Idempotence and Recovery

All work is additive docs/domain/proof tooling. There are no migrations, provider state, OAuth state, token/session state, source artifacts, finance writes, deployment files, public assets, routes, or runtime state to roll back.

If validation fails, patch only the FP-0118 protected-resource metadata proof-contract surface on this branch. If an older proof gate fails because FP-0118 is not yet accepted, update only the minimum proof-gate bridge. If validation reveals a broader shipped-boundary defect, stop and recommend the smallest safer corrective slice rather than widening FP-0118.

## Artifacts and Notes

Expected artifacts are this FP-0118 plan, pure domain contracts/builders/proof schema, focused specs, `tools/read-only-mcp-protected-resource-metadata-proof.mjs`, minimal proof-gate bridge updates, directly stale active-doc/plugin refresh, and validation evidence.

Replay implication: this slice changes plans, domain proof contracts, docs, and proof tooling only. It does not ingest sources, mutate raw source files, create mission outputs, change mission state, release communications, write finance state, or create runtime-Codex finance output. No mission replay event is required beyond plan progress, decision log, proof output, and final validation evidence.

Provenance/freshness/limitations implication: this slice does not answer finance questions or compile reports. It preserves the requirement that any future mission-facing output expose provenance, freshness posture, and limitations. Future auth-protected read-only results must continue to treat raw sources, Finance Twin, CFO Wiki, and evidence bundles as the source of truth and must not leak tokens into evidence or structured tool results.

## Interfaces and Dependencies

Primary module is `packages/domain`, with direct proof tooling under `tools/`. Existing `apps/control-plane` `/mcp` route files are validation context only and must not change.

No new environment variables, package scripts, route paths, schemas, migrations, DB queries, fixtures, datasets, sample data, source packs, public assets, provider configs, OpenAI API/model integrations, Apps SDK resources, OAuth/session/auth middleware, or deployment files are introduced.

GitHub connector product behavior is out of scope. Routine `git`, push, and PR publication may happen after validation.

## Outcomes & Retrospective

FP-0118 shipped its local/proof-only/read-only protected-resource metadata and auth-challenge readiness contract foundation on the working branch. The slice adds pure domain contracts and direct proof tooling for metadata document shape, canonical resource URI dependency, authorization-server requirements, least-privilege read-only scopes, bearer method posture, `WWW-Authenticate` `resource_metadata` readiness, metadata discovery, scope challenge readiness, token failure challenge posture, no-token-leakage, protected-resource route deferral, `WWW-Authenticate` route deferral, and no-runtime posture.

The proof-gate bridge accepts exactly the FP-0118 plan path while FP-0119 remains absent, and preserves FP-0117 OAuth/token/session/auth sequencing, FP-0116 remote host resource contracts, FP-0113 OAuth/token/session/user-org/company binding contracts, FP-0111 explicit local evidence dispatch wiring, FP-0109 local evidence dispatch adapter, FP-0107 route adapter, FP-0106 protocol envelope, and FP-0100 public security boundaries.

Validation passed with the full direct proof ladder, focused domain and control-plane specs, `git diff --check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`. `pnpm ci:repro:current` also ran the integration-db path because local Postgres was reachable.

Same-branch QA corrected the direct proof tool so branch-diff scope checks remain durable after commit instead of depending only on a dirty worktree. The correction did not add routes, runtime behavior, protected-resource metadata route behavior, `WWW-Authenticate` behavior, OAuth/token/session/auth middleware, deployment config, Apps SDK resources, package scripts, DB/schema/data/source-pack changes, OpenAI/model/provider calls, source mutation, finance writes, autonomous action, or FP-0119.

Recommended next step: protected-resource metadata route implementation planning may start next only as a new narrow Finance Plan after this contract PR is merged. Public ChatGPT App submission must wait until later route implementation, auth challenge behavior, OAuth/token/session/auth middleware, canonical public resource URI, authenticated company binding runtime, remote host/deployment posture, Apps SDK resource posture, and submission-readiness plans are separately proven.
