# FP-0116 read-only ChatGPT App MCP remote host owner, canonical URI, and resource metadata contracts

## Purpose / Big Picture

FP-0116 is a local/proof-only/read-only contract slice for future remote MCP host ownership, canonical MCP resource URI, public `/mcp` endpoint path, OAuth protected-resource metadata, WWW-Authenticate resource metadata behavior, and provider-neutral host boundaries.

This slice exists because FP-0115 decided that remote MCP host implementation cannot start from current repo truth. The repo still needs durable contracts that either name the future host owner or prove implementation remains blocked, require an exact canonical resource URI before remote implementation, keep public `/mcp` as the only future MCP endpoint path, and preserve FP-0113/FP-0114 OAuth and remote-host prerequisites before any public exposure.

FP-0116 does not deploy remote MCP. It does not add deployment config. It does not expose the local `/mcp` route remotely. It does not implement OAuth, token/session handling, auth middleware, Apps SDK resources, public ChatGPT App behavior, app submission, public assets, listing copy, generated public prose, DB queries, schemas, migrations, package scripts, fixtures, sample data, source packs, OpenAI API/model calls, provider calls, external communications, source mutation, finance writes, generated finance advice, runtime-Codex finance output, or autonomous action.

Public app submission remains future-only. FP-0117 remains absent.

## Progress

- [x] 2026-05-15T18:51:47Z: Invoked Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor from the repo-local Pocket CFO operator bundle. GitHub Connector Guard was not invoked because GitHub connector product behavior is out of scope.
- [x] 2026-05-15T18:51:47Z: Confirmed branch `codex/v2aj-read-only-chatgpt-app-mcp-remote-host-owner-canonical-uri-resource-metadata-contracts-local-v1`, PR #282 merged, FP-0115 shipped, FP-0116 absent, FP-0117 absent, and the pre-edit worktree clean.
- [x] 2026-05-15T18:51:47Z: Ran required baseline proof tools and focused control-plane `/mcp` route/app-wiring specs before editing; all passed.
- [x] 2026-05-15T18:51:47Z: Used official MCP and OpenAI Apps SDK web docs as read-only protocol/platform context because OpenAI Developers exposed only API-key setup tooling in this thread. Used Vercel documentation search only as future provider/host comparison context; no Vercel project, deployment, or provider action was used.
- [x] 2026-05-15T19:10:05Z: Implemented pure domain resource/owner/canonical-URI/protected-resource metadata contracts and focused specs.
- [x] 2026-05-15T19:10:05Z: Added direct proof command `tools/read-only-mcp-remote-host-resource-boundary-proof.mjs`.
- [x] 2026-05-15T19:10:05Z: Applied FP-0114/FP-0115 durable repository-inventory polish and bridged proof gates so FP-0116 is accepted while FP-0117 remains absent.
- [x] 2026-05-15T19:10:05Z: Refreshed directly stale active docs, security/demo docs, roadmap, and plugin ledger for the FP-0116 shipped contract boundary.
- [x] 2026-05-15T19:20:47Z: Ran strict validation through `pnpm ci:repro:current`; all required proof tools, focused specs, lint, typecheck, full tests, and clean-worktree reproduction passed before closeout.
- [x] 2026-05-15T19:20:47Z: Same-branch QA confirmed changes stayed within domain/proof/docs scope, preserved local `/mcp` route behavior, added no route path, and added no remote runtime, deployment config, OAuth/token/session/auth middleware, Apps SDK resource, app submission, DB/schema/package/data/source-pack/public-asset/listing-copy/generated-public-prose/OpenAI/provider/source/finance/autonomous-action scope.
- [x] 2026-05-15T19:31:18Z: Same-branch QA freshness correction recorded the already-created commit, pushed branch, and PR #283. No runtime, route, deployment, OAuth/token/session/auth, Apps SDK, app-submission, DB/schema/package/data/source-pack/public-asset/provider/OpenAI/source/finance/autonomous-action scope was added by this QA correction.

## Surprises & Discoveries

- OpenAI Developers did not expose a read-only documentation search tool in this thread. It exposed API-key setup tools only, which were not used. Official OpenAI web docs were used instead.
- Vercel documentation search returned MCP, function, streaming, protected deployment, and CLI docs relevant only as future provider context. It did not change the provider-neutral decision.

## Decision Log

- Decision: Future remote host owner remains unresolved for this slice. Implementation stays blocked until a later Finance Plan names and proves one owner family.
- Decision: Current `apps/control-plane` Fastify `/mcp` route owner remains local-only. The current local route must not be exposed remotely as-is.
- Decision: Future remote host family must be one of existing `apps/control-plane` Fastify host, separate future MCP server package, gateway/wrapper around existing local service contracts, or unresolved/hold.
- Decision: Separate future MCP server package or gateway/wrapper remains the preferred candidate unless a later plan proves `apps/control-plane` is safe for public hosting.
- Decision: Provider remains provider-neutral. FP-0116 selects no Vercel or other provider.
- Decision: Canonical MCP resource URI is required before remote implementation. It must be HTTPS, exact, stable, query-free, fragment-free, and must not encode `companyKey`, workspace, tenant, org, or other user-controlled selectors.
- Decision: Public `/mcp` remains the only future public MCP endpoint path.
- Decision: OAuth protected-resource metadata and WWW-Authenticate `resource_metadata` behavior are required before token-protected public exposure.
- Decision: Authorization-server discovery, scope challenge handling, audience/resource validation, and no token passthrough remain prerequisites from FP-0113 and FP-0114.
- Decision: User/org/company binding must come from the authenticated security boundary, not URL authority, prompt text, model text, `_meta`, or unauthenticated `companyKey`.
- Decision: Workspace/tenant template URLs are rejected in the current single-company V2 boundary unless a later plan proves multi-company V2 scope.
- Decision: Local tunnels such as ngrok are development-only preview tools and not public deployment proof.
- Decision: Remote host implementation, deployment config, OAuth/token/session/auth middleware, Apps SDK resources, app submission, public assets, listing copy, generated public prose, provider execution, and FP-0117 remain blocked.

## Context and Orientation

FP-0112 planned remote/public MCP deployment and OAuth readiness. FP-0113 shipped local/proof-only OAuth, token/session, user/org/company binding, and public MCP security contracts. FP-0114 shipped local/proof-only remote MCP host readiness and public transport/security contracts. FP-0115 shipped remote MCP host implementation sequencing and provider/host readiness planning, and explicitly held implementation because host owner, provider, canonical resource URI, protected-resource metadata, OAuth/token/session/auth middleware, and deployment prerequisites remain unproven.

FP-0116 is the next narrow contract slice. It is not the remote host implementation slice.

Official research ledger:

- MCP specification, Transports: used for Streamable HTTP, single endpoint, POST/GET/SSE transport context, and Origin/security requirements.
- MCP specification, Authorization: used for protected-resource metadata, resource indicators, canonical resource URI, authorization server discovery, WWW-Authenticate `resource_metadata`, scope challenge, and audience/resource validation prerequisites.
- MCP Security Best Practices: used for token passthrough prohibition, confused-deputy prevention, least privilege, session/auth security posture, DNS rebinding/Origin context, and fail-closed public exposure requirements.
- MCP specification, Tools: used only as read-only tool context for preserving the existing V2G read-only tool surface.
- OpenAI Apps SDK, Deploy your app: used only as future hosted MCP server/deployment readiness context.
- OpenAI Apps SDK, Connect from ChatGPT: used only as future ChatGPT connection and public MCP server URL context.
- OpenAI Apps SDK, Security & Privacy: used only as future CSP, auth, privacy, and least-privilege context.
- OpenAI Apps SDK, Test your integration: used only as future integration-test context; no app runtime or public integration was created.
- OpenAI Apps SDK, Submit and maintain your app: used only as future submission blocker context; no submission materials were created.
- Vercel documentation search: used only for future provider/host comparison around MCP, functions, streaming, protected deployments, and CLI context. No Vercel project/deployment tools were used and no provider was selected.

## Plan of Work

Add pure domain contracts under `packages/domain/src/read-only-app-mcp-remote-host-resource*.ts` for host owner decisions, provider neutrality, canonical resource URI rules, public `/mcp` path posture, protected-resource metadata, WWW-Authenticate resource metadata, authorization-server discovery, scope challenge, audience/resource validation, authenticated company binding, workspace/tenant URL rejection, local tunnel preview-only posture, and no-runtime/no-deployment scope.

Add focused specs proving the contract decisions and URI rejection rules. Add a direct proof tool that prints machine-readable JSON for FP-0116 and verifies no runtime, deployment, OAuth/session/auth, Apps SDK, DB, package, provider, source, finance, or app-submission scope was added.

Bridge existing proof gates so exactly one FP-0116 plan is accepted while FP-0117 remains absent. Tighten FP-0114/FP-0115 repository-inventory durability so arbitrary Markdown outside known safe documentation locations does not bypass public-host/deployment/submission checks.

## Concrete Steps

1. Create FP-0116 as the only new Finance Plan.
2. Implement remote-host resource contracts and pure proof builders in `packages/domain`.
3. Add focused domain specs for host owner, provider neutrality, canonical URI validation, protected-resource metadata, and no-runtime posture.
4. Add `tools/read-only-mcp-remote-host-resource-boundary-proof.mjs`.
5. Update existing proof-gate bridge fields so FP-0116 local proof-only contracts are accepted and FP-0117 remains absent.
6. Apply FP-0114/FP-0115 durable repository-inventory scan hardening for unsafe Markdown, remote runtime, deployment config, and public asset paths.
7. Refresh active docs and `plugins.md` only where directly stale.
8. Run validation and same-branch QA. If QA finds a defect, patch this branch and rerun required gates.
9. Close out FP-0116, rerun final validation, commit once, push, and open one PR.

## Validation and Acceptance

Validation commands:

- `git diff --check`
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
- `pnpm --filter @pocket-cto/domain exec vitest run src/benchmark-community.spec.ts src/read-only-app-mcp.spec.ts src/read-only-app-mcp-descriptor.spec.ts src/read-only-app-mcp-public-security.spec.ts src/read-only-app-mcp-endpoint-architecture.spec.ts src/read-only-app-mcp-endpoint-route-ownership.spec.ts src/read-only-app-mcp-protocol-envelope.spec.ts src/read-only-app-mcp-evidence-tool-dispatch.spec.ts src/read-only-app-mcp-oauth-security.spec.ts src/read-only-app-mcp-remote-host-readiness.spec.ts src/read-only-app-mcp-remote-host-resource.spec.ts`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/read-only-app-mcp-endpoint/routes.spec.ts src/modules/read-only-app-mcp-endpoint/service.spec.ts src/modules/read-only-app-mcp-endpoint/evidence-dispatcher.spec.ts src/app.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

Acceptance requires exactly one FP-0116 plan path, FP-0117 absence, pure domain/proof/docs changes only, no `/mcp` route behavior change, no new route path, no remote deployment or deployment config, no OAuth/token/session/auth middleware implementation, no Apps SDK resource/public app/app submission files, no DB/schema/package/data/source-pack changes, no public assets/listing copy/generated public prose, no OpenAI API/model/client/key usage, no provider/external calls, no source mutation, no finance writes, and preserved FP-0115, FP-0114, FP-0113, FP-0112, FP-0111, FP-0109, FP-0107, FP-0106, and FP-0100 boundaries.

## Idempotence and Recovery

All changes are additive domain/proof/docs changes. If validation fails, do not widen scope. Correct only the failing FP-0116 contract/proof/doc surface on this branch and rerun the failed command plus required downstream validation. If proof gates show FP-0115/FP-0114/FP-0113 readiness is not intact, stop and recommend the smallest proof-gate correction slice instead of remote host implementation.

No migrations, runtime services, provider state, uploaded artifacts, source mutations, or finance writes are created, so rollback is normal git revert of this contract slice.

## Artifacts and Notes

Expected artifacts are the FP-0116 plan, domain contract files, focused specs, direct proof command, minimal proof-gate bridge edits, direct stale doc/plugin refresh where required, and final validation evidence.

Replay implication: this slice changes planning/proof contracts only. It does not ingest sources, mutate raw source files, create finance artifacts, change mission state, release outputs, or write finance state. No replay event is required beyond the plan progress, decision log, and proof output.

Provenance/freshness/limitations implication: this slice does not answer finance questions or compile reports. It preserves the requirement that future mission-facing outputs expose provenance, freshness posture, and limitations when remote/public read-only paths eventually exist.

## Interfaces and Dependencies

Primary module is `packages/domain`, with direct proof tooling under `tools/`. The existing `apps/control-plane` `/mcp` route is read-only context only and must not change.

No new environment variables, package scripts, routes, schemas, migrations, fixtures, source packs, public assets, provider configs, OpenAI API/model integrations, Apps SDK resources, OAuth/session/auth middleware, or deployment files are introduced.

GitHub connector product behavior is out of scope. GitHub CLI may be used only for routine branch, push, and PR publication after validation.

## Outcomes & Retrospective

Implementation artifacts are in place and remain local/proof-only. FP-0116 adds pure domain contracts and direct proof tooling for remote host owner decision/blocking, provider neutrality, canonical resource URI prerequisites, public `/mcp` path posture, protected-resource metadata, WWW-Authenticate `resource_metadata`, authorization-server discovery, scope challenge handling, audience/resource validation, authenticated company binding, workspace/tenant URL rejection, local tunnel preview-only posture, and no-runtime/no-deployment boundaries.

The proof-gate bridge accepts exactly the FP-0116 plan path while keeping FP-0117 absent. FP-0114/FP-0115 repository inventory checks now reject arbitrary unsafe Markdown, remote runtime paths, deployment config, and public listing/submission-like paths outside known safe docs.

Final validation and same-branch QA passed before the single implementation commit. The branch was pushed and PR #283 was created; this QA pass only corrected the closeout freshness note above.
