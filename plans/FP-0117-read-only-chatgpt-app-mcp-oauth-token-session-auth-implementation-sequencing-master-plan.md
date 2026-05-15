# FP-0117 read-only ChatGPT App MCP OAuth token session auth implementation sequencing master plan

## Purpose / Big Picture

FP-0117 is a docs-and-plan plus proof-gate compatibility slice for OAuth/token/session/auth implementation sequencing after FP-0116. It decides what can start, what must wait, and what proof gates must exist before any future runtime auth work opens.

This slice is planning and proof-gate compatibility only. It plans OAuth/token/session/auth implementation sequencing, protected-resource metadata readiness, WWW-Authenticate `resource_metadata` challenge readiness, authorization-server discovery, scope challenge handling, audience/resource validation, token failure modes, token/session storage/redaction/revocation/rotation/replay prerequisites, auth middleware prerequisites, and authenticated company binding gates without implementing them.

FP-0117 does not implement OAuth. It does not implement token/session storage. It does not implement auth middleware. It does not add protected-resource metadata routes. It does not implement WWW-Authenticate behavior. It does not change `/mcp` route behavior. It does not add route paths. It does not deploy remote MCP. It does not add deployment config. It does not add Apps SDK resources, public app behavior, public app submission, public assets, listing copy, generated public prose, DB queries, schemas, migrations, package scripts, fixtures, sample data, source packs, OpenAI API/model calls, provider calls, external communications, source mutation, finance writes, generated finance advice, runtime-Codex finance output, or autonomous action.

Public app behavior remains future-only. Public app submission remains future-only. FP-0118 remains absent.

## Progress

- [x] 2026-05-15T20:28:42Z: Invoked Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor from the repo-local Pocket CFO operator bundle. GitHub Connector Guard was not invoked because GitHub connector product behavior is out of scope.
- [x] 2026-05-15T20:28:42Z: Confirmed PR #283 / FP-0116 is merged into local main history, FP-0116 is shipped, FP-0117 and FP-0118 were absent before this slice, and the branch was corrected to `codex/v2ak-read-only-chatgpt-app-mcp-oauth-token-session-auth-implementation-sequencing-master-plan-local-v1`.
- [x] 2026-05-15T20:28:42Z: Ran the required baseline proof ladder before editing; all existing proof tools passed.
- [x] 2026-05-15T20:28:42Z: Used official MCP and OpenAI Apps SDK web docs as read-only planning context. No OpenAI API, model, key setup, provider, deployment, app-submission, or artifact-upload tool was used.
- [x] 2026-05-15T21:46:30Z: Added the FP-0117 plan, proof-gate bridge helpers, direct proof tool, focused specs, and directly stale docs/plugin refresh without changing route behavior, route paths, protected-resource metadata routes, WWW-Authenticate behavior, OAuth/token/session/auth middleware, deployment, Apps SDK resources, DB/schema/package surfaces, public assets, provider calls, source mutation, finance writes, generated finance advice, runtime-Codex finance output, autonomous action, or FP-0118.
- [x] 2026-05-15T21:46:30Z: Ran all direct proof tools, focused domain specs, focused control-plane `/mcp` route/default-dispatch specs, and strict same-branch QA scope checks; the bridge accepted exactly one FP-0117 docs-only plan while preserving FP-0116/0115/0114/0113/0112/0111/0109/0107/0106/0100 boundaries.
- [x] 2026-05-15T21:56:45Z: Final validation passed: `git diff --check`, all direct proof tools including `tools/read-only-mcp-oauth-implementation-sequencing-proof.mjs`, focused domain specs, focused control-plane `/mcp` route/default-dispatch specs, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.
- [x] 2026-05-15T21:35:23Z: Post-merge hardening correction started on `codex/v2ak-read-only-chatgpt-app-mcp-oauth-token-session-auth-sequencing-proof-hardening-local-v1` after PR #284 was confirmed merged to `main`, FP-0118 was confirmed absent, required local services were available, and the baseline direct proof ladder passed.
- [x] 2026-05-15T21:35:23Z: Refreshed the official research ledger from older MCP 2025-06-18 references to current official MCP 2025-11-25/latest Authorization, Transports, Security Best Practices, and Tools pages plus current OpenAI Apps SDK docs. No OpenAI API/model/key, provider, connector, deployment, app-submission, source mutation, finance write, or public asset workflow was used.
- [x] 2026-05-15T21:35:23Z: Hardened the FP-0117 direct proof to keep changed-file PR validation while also adding durable repository-inventory proof for OAuth/token/session/auth runtime absence, protected-resource metadata route absence, WWW-Authenticate route behavior absence, and no executable OpenAI/API/model/key usage across FP-0117-adjacent proof/runtime surfaces.
- [x] 2026-05-15T21:44:50Z: Final hardening validation passed before this closeout update: `git diff --check`, all direct proof tools, focused domain specs, focused control-plane `/mcp` route/default-dispatch specs, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.
- [x] 2026-05-15T21:44:50Z: Post-closeout minimum rerun passed after this plan edit: `git diff --check`, `tools/read-only-mcp-oauth-implementation-sequencing-proof.mjs`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.

## Surprises & Discoveries

- The local branch was missing the requested trailing `1`; it was renamed before any file edits.
- OpenAI Developers was available as an installed plugin family, but no callable read-only docs tool was exposed in this thread. Official OpenAI web docs were used instead.
- Current repo truth supports a sequencing plan but not OAuth/token/session/auth implementation. FP-0116 supplies local/proof-only resource contracts; it does not supply a canonical public resource URI implementation, protected-resource metadata route behavior, auth server, token validation runtime, token/session store, or auth middleware.
- Post-merge proof durability needed a correction because the original direct proof used changed-file state for several absence checks. That is useful before commit/PR, but a clean merged tree needs repository-inventory scans so FP-0118 can depend on a durable proof source.

## Decision Log

- Decision: OAuth/token/session/auth implementation cannot start from current repo truth. The repo must first prove protected-resource metadata, WWW-Authenticate `resource_metadata`, canonical public resource URI, auth-server discovery, scope challenge handling, audience/resource validation, fail-closed token behavior, token/session storage controls, and company binding gates.
- Decision: Protected-resource metadata should be the first OAuth-adjacent implementation lane, but not in FP-0117. The next safe work is a protected-resource metadata and auth challenge readiness/proof plan. Actual route implementation remains future-only until a later plan opens it explicitly.
- Decision: WWW-Authenticate `resource_metadata` challenge behavior should land before token validation runtime. A token validator without a discoverable protected-resource metadata challenge would make ChatGPT/OAuth failure behavior ambiguous.
- Decision: Token validation cannot start before a canonical public resource URI is implemented. The default is no token validation before an exact stable HTTPS canonical public resource uri exists and can be used consistently as the OAuth `resource` audience.
- Decision: The auth server/provider cannot be named now. Provider and auth server selection remain unresolved and provider-neutral.
- Decision: OAuth provider/config stays provider-neutral. No Auth0, Okta, Cognito, custom IdP, Vercel, or other provider is selected by FP-0117.
- Decision: Token/session storage cannot be implemented before storage, redaction, revocation, rotation, replay protection, deletion, and no-token-leakage gates exist.
- Decision: Auth middleware cannot attach to `/mcp` before fail-closed tests exist for missing, expired, malformed, wrong-audience, wrong-scope, wrong-org, revoked, and replayed tokens.
- Decision: Scopes must be minimized. No wildcard scopes, write scopes, provider scopes, offline access, or broad finance scopes are allowed by default. Initial candidate names remain deferred, but the expected shape is one or more read-only evidence scopes tied to the V2G read-only tool surface.
- Decision: Missing/expired/malformed/wrong-audience/wrong-scope/wrong-org tokens must fail closed. Missing, expired, malformed, and wrong-audience tokens should challenge or reject as unauthorized; wrong-scope and wrong-org posture must be explicit and must not disclose finance data.
- Decision: Authenticated company binding gates companyKey. `companyKey` remains a requested selector only; authority must come from authenticated user/org/company binding, not URL authority, prompt text, model text, `_meta`, or client-provided selector text.
- Decision: Public protected-resource metadata endpoints cannot be added without remote deployment by default. A later plan may prove a local-only route behavior slice, but FP-0117 does not authorize that route.
- Decision: The safest sequence is future FP-0118 protected-resource metadata and auth challenge contract/readiness planning if opened later, then protected-resource metadata route implementation only if explicitly opened, then token validation contracts, token/session storage/redaction/revocation/rotation/replay contracts, auth middleware fail-closed implementation, and only later remote host runtime/deployment after host and auth gates.
- Decision: Route expansion, remote MCP deployment, deployment config, Apps SDK resources, public app behavior, app submission, public assets, listing copy, generated public prose, provider calls, finance writes, source mutation, payment instructions, certification/delivery, external communications, generated finance advice, uncited model output, runtime-Codex finance output, autonomous action, and app-submission artifacts remain future-only or permanently forbidden until a named plan opens them.
- Decision: FP-0118 remains absent in this slice.
- Decision: FP-0117 proof gates now use both changed-file scans and durable repository-inventory scans. Changed-file scans remain useful for PR validation; repository inventory is the source for post-merge absence proof.
- Decision: Executable OpenAI client/import/API/model/key patterns remain forbidden in FP-0117-adjacent proof/runtime sources. Documentation or proof text may describe absence or prohibition, but executable imports, clients, env-key reads, endpoint calls, model calls, and API calls are rejected.

## Context and Orientation

FP-0112 planned remote/public MCP deployment and OAuth readiness. FP-0113 shipped local/proof-only OAuth, token/session, user/org/company binding, and public MCP security contracts. FP-0114 shipped remote MCP host readiness and public transport/security contracts. FP-0115 shipped remote host implementation sequencing and provider/host readiness planning. FP-0116 shipped remote host owner, canonical resource URI, public `/mcp` path, protected-resource metadata, WWW-Authenticate `resource_metadata`, authorization-server discovery, scope challenge, audience/resource validation, authenticated company binding, workspace/tenant URL rejection, local tunnel preview-only, and provider-neutral host boundary contracts.

FP-0116 still keeps OAuth implementation, token/session implementation, auth middleware, protected-resource metadata route behavior, remote deployment, deployment config, Apps SDK resources, public app behavior, and app submission future-only. FP-0117 preserves that boundary while deciding the next auth-adjacent sequence.

Official research ledger:

- MCP Authorization specification, version 2025-11-25 latest (`https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization`): used for protected-resource metadata, `authorization_servers`, `WWW-Authenticate` `resource_metadata`, OAuth authorization-server discovery, `resource` indicators, canonical server URI, access token requirements, token handling, token failure status codes, audience/resource validation, scope challenge handling, token storage, refresh-token rotation, and token passthrough prohibition.
- MCP Transports specification, version 2025-11-25 latest (`https://modelcontextprotocol.io/specification/2025-11-25/basic/transports`): used for Streamable HTTP, single MCP endpoint, POST/GET behavior, Origin validation, localhost binding, session header posture, protocol-version header posture, and the auth recommendation for HTTP transports.
- MCP Security Best Practices current docs page (`https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices`): used for confused deputy, token passthrough, SSRF, scope minimization, session/auth security, prompt-injection, and fail-closed public exposure planning.
- MCP Tools specification, version 2025-11-25 latest (`https://modelcontextprotocol.io/specification/2025-11-25/server/tools`): used only as read-only tool context for preserving the existing V2G read-only tool surface, structured tool result posture, validation, security considerations, and human-review posture.
- OpenAI Apps SDK Authentication docs (`https://developers.openai.com/apps-sdk/build/auth`): used for Apps SDK OAuth expectations, protected-resource metadata, resource parameter echoing, auth-server metadata, ChatGPT client registration choices, and challenge behavior.
- OpenAI Apps SDK Security & Privacy docs (`https://developers.openai.com/apps-sdk/guides/security-privacy`): used for least privilege, consent, server-side validation, data handling, token/secret avoidance in component props, logging redaction, and audit posture.
- OpenAI Apps SDK Deploy your app docs (`https://developers.openai.com/apps-sdk/deploy`): used only as future remote host/deployment context; local tunnels stay development-only and stable HTTPS remains a future prerequisite.
- OpenAI Apps SDK Connect from ChatGPT docs (`https://developers.openai.com/apps-sdk/deploy/connect-chatgpt`): used only as future connector/developer-mode context; no connector was created.
- OpenAI Apps SDK Test your integration docs (`https://developers.openai.com/apps-sdk/deploy/testing`): used only as future validation context for tool correctness, auth-flow tests, and ChatGPT developer-mode checks.
- OpenAI Apps SDK Submit and maintain your app docs (`https://developers.openai.com/apps-sdk/deploy/submission`): used only as future submission context; no app submission materials were created.

## Plan of Work

Create exactly one FP-0117 plan and a minimum proof-gate bridge that allows that plan while FP-0118 remains absent. The bridge must prove the plan is docs-and-plan/proof-gate only and does not authorize implementation.

Add focused domain proof helpers and specs for the FP-0117 plan boundary. Add `tools/read-only-mcp-oauth-implementation-sequencing-proof.mjs` to check the exact FP-0117 path, the absence of FP-0118, required planning text, changed-file scope, and durable post-merge repository-inventory proof.

Refresh only directly stale active docs and plugin ledger text. The stale boundary is that active docs currently stop at FP-0116 and say FP-0117 is absent. They must now say FP-0117 exists only as a docs/proof sequencing plan and does not implement runtime auth or public app behavior.

## Concrete Steps

1. Keep work on `codex/v2ak-read-only-chatgpt-app-mcp-oauth-token-session-auth-implementation-sequencing-master-plan-local-v1`.
2. Create this exact plan file and no FP-0118 file.
3. Add proof-gate compatibility helpers/specs under `packages/domain/src/read-only-app-mcp*`.
4. Add the new direct proof tool `tools/read-only-mcp-oauth-implementation-sequencing-proof.mjs`.
5. Bridge existing FP-0116/0115/0114/0113/0112/0111/0110/0109/0108/0107/0106/0100 proof gates so the exact FP-0117 docs-only plan is accepted.
6. Refresh directly stale docs and `plugins.md`.
7. Run focused validation, strict same-branch QA, full validation, closeout updates, final reruns, one commit, push, and PR.

## Validation and Acceptance

Validation commands:

- `git diff --check`
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
- `pnpm --filter @pocket-cto/domain exec vitest run src/benchmark-community.spec.ts src/read-only-app-mcp.spec.ts src/read-only-app-mcp-descriptor.spec.ts src/read-only-app-mcp-public-security.spec.ts src/read-only-app-mcp-endpoint-architecture.spec.ts src/read-only-app-mcp-endpoint-route-ownership.spec.ts src/read-only-app-mcp-protocol-envelope.spec.ts src/read-only-app-mcp-evidence-tool-dispatch.spec.ts src/read-only-app-mcp-oauth-security.spec.ts src/read-only-app-mcp-remote-host-readiness.spec.ts src/read-only-app-mcp-remote-host-resource.spec.ts`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/read-only-app-mcp-endpoint/routes.spec.ts src/modules/read-only-app-mcp-endpoint/service.spec.ts src/modules/read-only-app-mcp-endpoint/evidence-dispatcher.spec.ts src/app.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

Acceptance requires exactly one FP-0117 path, no FP-0118 path, docs/proof-only changes, no route behavior change, no new route path, no protected-resource metadata route, no WWW-Authenticate route behavior, no OAuth implementation, no token/session implementation, no auth middleware, no remote MCP deployment, no deployment config, no Apps SDK resource, no app submission, no DB query, no schema/migration, no package script, no fixture/dataset/sample/source pack, no public asset, no listing copy, no generated public prose, no OpenAI API/model call, no provider call, no external communication, no source mutation, no finance write, no generated finance advice, no runtime-Codex finance output, no autonomous action, and preserved FP-0116/0115/0114/0113/0112/0111/0110/0109/0108/0107/0106/0100 boundaries.

## Idempotence and Recovery

All changes are additive docs/proof-gate compatibility changes. There are no migrations, provider state, source artifacts, finance writes, runtime auth state, token/session state, route changes, deployment files, or public app artifacts to roll back.

If validation fails, patch only the FP-0117 plan/proof/doc compatibility surface on this branch. If proof gates show current FP-0116/0115/0114/0113/0112/0111/0109/0107/0106/0100 boundaries are not intact, stop and recommend the smallest proof-gate correction slice instead of implementation.

## Artifacts and Notes

Expected artifacts are this FP-0117 plan, proof-gate helper/spec updates, `tools/read-only-mcp-oauth-implementation-sequencing-proof.mjs`, durable repository-inventory/source-scan hardening, directly stale active-doc/plugin refresh, and validation evidence.

Replay implication: this slice changes planning and proof gates only. It does not ingest sources, mutate raw source files, create mission outputs, change mission state, release communications, or write finance state. No replay event is required beyond plan progress, decision log, proof output, and final validation evidence.

Provenance/freshness/limitations implication: this slice does not answer finance questions or compile reports. It preserves the requirement that future mission-facing outputs expose provenance, freshness posture, and limitations. Any future auth-protected read-only result must keep those fields and must not turn model output into source truth.

## Interfaces and Dependencies

Primary module is `packages/domain`, with direct proof tooling under `tools/`. Existing `apps/control-plane` `/mcp` route files are validation context only and must not change.

No new environment variables, package scripts, route paths, schemas, migrations, DB queries, fixtures, datasets, sample data, source packs, public assets, provider configs, OpenAI API/model integrations, Apps SDK resources, OAuth/session/auth middleware, or deployment files are introduced.

GitHub connector product behavior is out of scope. Routine `git`, push, and PR publication may happen after validation.

## Outcomes & Retrospective

FP-0117 shipped through PR #284 and received a targeted post-merge proof/source hardening correction. The outcome remains a single docs-and-plan plus proof-gate compatibility record that says protected-resource metadata/auth challenge planning should start next, but only as a narrow future plan. No OAuth/token/session/auth runtime, protected-resource metadata route, WWW-Authenticate behavior, route expansion, OpenAI API/model/key usage, provider call, source mutation, finance write, public app behavior, app submission, or FP-0118 was added. No further FP-0117 correction is currently known. Public ChatGPT App submission must wait.
