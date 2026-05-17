# Pocket CFO Codex Operator Guide

This guide is for Codex and human operators working in this repository. The human-facing product overview is [README.md](README.md).

## Active Docs Order

Read active docs in this order before meaningful work:

1. [START_HERE.md](START_HERE.md)
2. [README.md](README.md)
3. [CODEX_README.md](CODEX_README.md)
4. [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md)
5. [docs/V2_BOUNDARY.md](docs/V2_BOUNDARY.md)
6. [docs/ACTIVE_DOCS.md](docs/ACTIVE_DOCS.md)
7. [SECURITY.md](SECURITY.md)
8. [PRIVACY.md](PRIVACY.md)
9. [CONTRIBUTING.md](CONTRIBUTING.md)
10. [AGENTS.md](AGENTS.md)
11. [PLANS.md](PLANS.md)
12. [WORKFLOW.md](WORKFLOW.md)
13. [plans/ROADMAP.md](plans/ROADMAP.md)
14. the unfinished `plans/FP-*.md` file if one exists
15. [docs/security/finance-data-threat-model.md](docs/security/finance-data-threat-model.md)
16. [docs/security/read-only-agent-threat-model.md](docs/security/read-only-agent-threat-model.md)
17. [docs/demo/demo-data-policy.md](docs/demo/demo-data-policy.md)
18. [docs/demo/local-demo-operator-journey.md](docs/demo/local-demo-operator-journey.md)
19. [docs/ops/self-host-baseline.md](docs/ops/self-host-baseline.md)
20. [docs/ops/local-dev.md](docs/ops/local-dev.md)
21. [docs/ops/source-ingest-and-cfo-wiki.md](docs/ops/source-ingest-and-cfo-wiki.md)
22. [docs/ops/codex-app-server.md](docs/ops/codex-app-server.md)
23. [docs/benchmarks/seeded-missions.md](docs/benchmarks/seeded-missions.md)
24. [evals/README.md](evals/README.md)

Read [docs/ops/github-app-setup.md](docs/ops/github-app-setup.md) only when GitHub connector work is explicitly in scope.

## Starting A Codex Local Thread

Open the repository root in the Codex app and start one local thread per slice. A good first prompt asks Codex to:

- read the active docs order above
- identify the active unfinished Finance Plan, if any
- confirm the current branch and clean worktree
- state the active phase and forbidden scopes
- implement only the next unchecked slice
- update the active Finance Plan as work progresses
- run the validation ladder named by the plan

Do not start from archived Pocket CTO material or from chat memory.

## Branch Naming Pattern

Use `codex/<phase-and-slice>-local-vN` unless the user gives an exact branch. Do not create a new branch when the user says the current branch is already correct.

## Finance Plan Lifecycle

Meaningful work uses exactly one active `plans/FP-*.md` file.

- If an unfinished FP exists, continue that plan.
- If no unfinished FP exists, read the latest shipped closeout or handoff record and create the next Finance Plan before code changes.
- Do not create the next FP number during closeout unless the active plan explicitly asks for it.
- Update `Progress`, `Surprises & Discoveries`, `Decision Log`, `Validation and Acceptance`, `Artifacts and Notes`, and `Outcomes & Retrospective` before declaring the slice shipped.

## Deciding Whether An Unfinished FP Exists

Use the active docs first, then inspect `plans/FP-*.md`.

An FP is unfinished when it says it is active, has unchecked implementation/closeout boxes, or its retrospective says the implementation has not started or has not shipped. A shipped FP is historical truth, not a new implementation mandate.

For F11, [plans/FP-0078-public-repo-hygiene-and-v2-transition.md](plans/FP-0078-public-repo-hygiene-and-v2-transition.md) is the public repo hygiene and V2 transition record. Continue it while it is unfinished; after closeout, treat it as shipped history. Do not create FP-0079 in the F11 slice.

## Required Operator Guards

Invoke the Pocket CFO operator guards that match the slice:

- `$finance-plan-orchestrator`
- `$modular-architecture-guard`
- `$source-provenance-guard`
- `$cfo-wiki-maintainer`
- `$evidence-bundle-auditor`
- `$f6-monitoring-semantics-guard`
- `$validation-ladder-composer`
- `$pocket-cfo-handoff-auditor`

Use `$execplan-orchestrator` only for a separate step-by-step execution document when the user or plan asks for one.

## When GitHub Connector Guard Is In Scope

`$github-app-integration-guard` is in scope only for product GitHub connector behavior: connector modules, GitHub app setup, webhook behavior, issue/PR ingestion, GitHub-backed source boundaries, or GitHub app docs.

Routine repository operations such as `git status`, `git commit`, `git push`, and opening a PR with `gh` are not product GitHub connector behavior. Keep GitHub as an optional connector, not the Pocket CFO product center.

## Validation Ladder Rules

Use the active Finance Plan's validation ladder. For F11, run the required DB-backed source-pack proofs, CFO Wiki smokes, Finance Twin smokes, monitoring/readiness smokes, package specs, web tests, lint, typecheck, test, and `pnpm ci:repro:current`.

If validation fails:

- do not widen scope
- do not add runtime behavior to make docs pass
- record the exact failing command and log location
- recommend the narrowest corrective slice
- do not publish a partially green branch

After FP closeout edits, rerun at minimum:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

## Keeping Plans Current

Update the active FP after meaningful progress and at closeout. Record:

- what changed
- what stayed out of scope
- validation commands run, skipped, or rerun
- surprises that affect sequence
- replay/evidence implications
- exact next recommendation

Docs-only slices should explicitly say they created no mission replay events and no product runtime behavior.

## Forbidden Scopes

Do not add product runtime behavior without an active plan. For docs-only closeout or QA slices, do not add code, UI, backend routes, web API routes, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, monitor families, discovery families, implementation scaffolding, provider integration, certification, deployment, external communications, source mutation, finance writes, generated product prose, or autonomous action.

Do not extend V2D beyond the shipped FP-0084 read-only Evidence Atlas UI boundary, do not expand V2E beyond the shipped FP-0085 local/internal proof-only bounded LLM orchestration foundation, do not expand V2F beyond the shipped FP-0086 docs/proof-only benchmark/community manifest foundation, and do not expand V2G beyond the shipped FP-0087 local proof-only read-only ChatGPT App/MCP contract and descriptor/envelope foundation. FP-0086 shipped SafeDemoDataPolicy first, CommunityPackManifest and BenchmarkTask contracts without datasets, and a direct proof command without package scripts or smoke aliases. FP-0087 shipped pure domain contracts, local proof-only MCP descriptors, app/MCP response-envelope contracts, and direct proof commands only; it does not authorize public app implementation or submission. FP-0088 is shipped only as a premium UI/security readiness plan plus narrow proof-gate compatibility bridge. FP-0089 is shipped only as a premium UI design-system readiness plan plus narrow proof-gate compatibility bridge. FP-0090 is shipped only as a premium UI implementation readiness plan plus narrow proof-gate compatibility bridge. FP-0091 is shipped only as a local/proof-only/read-only premium UI component foundation under `apps/web/components/read-only-app-mcp/**`; it does not authorize routes, endpoints, remote MCP, Apps SDK iframe/UI resources, OAuth, app submission, OpenAI API/model calls, data files, scripts, or public app runtime behavior. FP-0092 is shipped only as local/proof-only/read-only premium UI composition and accessibility hardening under `apps/web/components/read-only-app-mcp/**`; it does not authorize routes, endpoints, remote MCP, Apps SDK iframe/UI resources, OAuth, app submission, OpenAI API/model calls, data files, scripts, public app runtime behavior, source mutation, finance writes, generated product prose, runtime-Codex finance output, or autonomous action. FP-0093 is shipped as docs-only local UI preview route planning and did not authorize route code itself. FP-0094 is shipped only as exactly one local/proof-only/read-only preview route at `apps/web/app/read-only-app-mcp-preview/page.tsx`; it does not authorize web API routes, backend routes, endpoints, remote MCP, Apps SDK iframe/UI resources, OAuth, app submission, public app implementation, OpenAI API/model calls, data files, scripts, source mutation, finance writes, generated product prose, runtime-Codex finance output, autonomous action, screenshots, images, public assets, or additional route/runtime behavior. FP-0095 is shipped only as a docs-and-plan plus proof-gate compatibility master-plan for future local preview route state-matrix and premium visual QA hardening. FP-0096 is shipped only as local/proof-only/read-only state-matrix rendering on the existing preview route; it does not authorize additional routes, endpoints, remote MCP, Apps SDK iframe/UI resources, OAuth, app submission, OpenAI API/model calls, screenshots, generated images, public assets, product runtime behavior, source mutation, finance writes, generated product prose, runtime-Codex finance output, or autonomous action. FP-0097 is shipped only as local/proof-only/read-only screenshotless visual QA/accessibility hardening on the existing preview route; it does not authorize additional routes, endpoints, remote MCP, Apps SDK iframe/UI resources, OAuth, app submission, OpenAI API/model calls, screenshots, generated images, public assets, product runtime behavior, source mutation, finance writes, generated product prose, runtime-Codex finance output, or autonomous action. FP-0098 is shipped only as a docs-and-plan plus proof-gate compatibility public-app readiness/security/submission-boundary master plan; it does not authorize public app implementation, Apps SDK iframe/resources, remote MCP deployment, endpoints, OAuth, app submission, screenshots, listing assets, OpenAI API/model calls, source mutation, finance writes, generated product prose, runtime-Codex finance output, product runtime behavior, or autonomous action. FP-0099 is shipped only as a docs-and-plan plus proof-gate compatibility public-app security threat-model/platform-boundary master plan; it does not authorize endpoints, OAuth, remote MCP deployment, Apps SDK iframe/resources, public app implementation, app submission, screenshots, generated images, public assets, listing copy, app-submission artifacts, OpenAI API/model calls, source mutation, finance writes, generated product prose, runtime-Codex finance output, product runtime behavior, or autonomous action. FP-0100 is shipped only as local/proof-only public-app security boundary contracts plus proof-gate compatibility; it does not authorize product code, UI, routes, endpoints, remote MCP, Apps SDK iframe/resource registration, OAuth, app submission, public app implementation, OpenAI API/model calls, data files, screenshots, generated images, public assets, listing copy, app-submission artifacts, source mutation, finance writes, generated product prose, runtime-Codex finance output, product runtime behavior, or autonomous action. Do not add eval datasets, fixtures, sample data, source-pack behavior, package scripts, smoke aliases, model calls, public ChatGPT App, remote MCP deployment, Apps SDK UI, OAuth, app submission, F6V, F6X, deeper PDF/OCR/vector/PageIndex/OpenAI file-search work, iOS, OpenClaw, deployment, or external communications from shipped docs alone.

FP-0101 is shipped only as a docs-and-plan plus proof-gate compatibility public ChatGPT App/MCP implementation sequencing and platform-readiness master plan. It defines future lane order and acceptance gates only; it does not authorize endpoint implementation, OAuth, remote MCP deployment, Apps SDK iframe/resource implementation, public app implementation, app submission, screenshots, generated images, public assets, listing copy, app-submission artifacts, OpenAI API/model calls, source mutation, finance writes, generated product prose, runtime-Codex finance output, provider/certification/deployment work, external communications, product runtime behavior, or autonomous action.

FP-0102 is shipped only as a docs-and-plan plus proof-gate compatibility endpoint/OAuth/remote-MCP architecture and security-readiness master plan. It defines future endpoint, OAuth/token/session, remote MCP, descriptor/tool allowlist, privacy/security, and proof gates only; it does not authorize endpoint implementation, OAuth implementation, token/session implementation, remote MCP server implementation or deployment, Apps SDK iframe/resource implementation, public ChatGPT App implementation, app submission, screenshots, generated images, public assets, listing copy, app-submission artifacts, OpenAI API/model calls, source mutation, finance writes, generated product prose, runtime-Codex finance output, provider/certification/deployment work, external communications, product runtime behavior, or autonomous action.

FP-0103 is shipped only as a local/proof-only/read-only endpoint architecture proof-contract foundation. It adds pure domain contracts, focused specs, direct proof tooling, and proof-gate compatibility for endpoint inventory deferral, future endpoint path preconditions, endpoint trust model, future transport/TLS requirements, request/response envelope requirements, evidence/freshness/limitations fields, refusal/failure posture, read-only allowlist preservation, and no-runtime/no-route/no-endpoint posture. It does not authorize endpoint implementation, route implementation, web API/backend/control-plane route implementation, OAuth/token/session implementation, remote MCP implementation or deployment, Apps SDK iframe/resource implementation, public ChatGPT App implementation, app submission, screenshots, generated images, public assets, listing copy, app-submission artifacts, OpenAI API/model calls, source mutation, finance writes, generated product prose, runtime-Codex finance output, provider/certification/deployment work, external communications, product runtime behavior, or autonomous action.

FP-0104 is shipped only as a docs-and-plan plus proof-gate compatibility endpoint implementation readiness and exact future endpoint inventory master plan. It names `/mcp` as the only future ChatGPT-facing endpoint path that is safe to name from current repo truth and official docs, records route ownership questions, request/response envelope requirements, refusal/failure posture, auth boundary, transport/TLS future requirement, logging posture, deployment deferral, and proof gates. It does not authorize endpoint implementation, route implementation, web API/backend/control-plane route implementation, OAuth/token/session implementation, remote MCP implementation or deployment, Apps SDK iframe/resource implementation, public ChatGPT App implementation, app submission, screenshots, generated images, public assets, listing copy, app-submission artifacts, OpenAI API/model calls, source mutation, finance writes, generated product prose, runtime-Codex finance output, provider/certification/deployment work, external communications, product runtime behavior, or autonomous action.

FP-0105 is shipped only as a local/proof-only/read-only endpoint route ownership and transport-adapter proof-contract foundation. It names `apps/control-plane` Fastify as the documentation-only future `/mcp` route owner family, defines transport-adapter, thin-handler, read-only service/tool dispatch, envelope/refusal, auth-deferral, logging-redaction, deployment-deferral, rollback, no-route, no-runtime, no-OAuth/token/session, no-remote-MCP, no-Apps-SDK-resource, and no-OpenAI-API/model boundaries. It does not authorize endpoint implementation, route implementation, web API/backend/control-plane route implementation, OAuth/token/session implementation, remote MCP implementation or deployment, Apps SDK iframe/resource implementation, public ChatGPT App implementation, app submission, screenshots, generated images, public assets, listing copy, app-submission artifacts, OpenAI API/model calls, source mutation, finance writes, generated product prose, runtime-Codex finance output, provider/certification/deployment work, external communications, product runtime behavior, or autonomous action.

FP-0106 is shipped only as a local/proof-only/read-only MCP protocol envelope and tool-dispatch proof-contract foundation. It defines the future `/mcp` protocol envelope, required future MCP method families, the `ping` liveness utility boundary, rejected MCP method families, exact V2G read-only tool dispatch, structured evidence/refusal envelopes, argument validation, invalid-tool fail-closed behavior, auth deferral, logging redaction, no-route/no-runtime/no-endpoint posture, no-OpenAI-API/model boundaries, and the pre-FP-0107 successor boundary. It does not authorize endpoint implementation, route implementation, web API/backend/control-plane route implementation, OAuth/token/session implementation, remote MCP implementation or deployment, Apps SDK iframe/resource implementation, public ChatGPT App implementation, app submission, screenshots, generated images, public assets, listing copy, app-submission artifacts, OpenAI API/model calls, source mutation, finance writes, generated product prose, runtime-Codex finance output, provider/certification/deployment work, external communications, product runtime behavior, or autonomous action.

FP-0107 is shipped only as a local/control-plane Fastify `/mcp` route-adapter shell. `POST /mcp` is the only JSON-RPC request entrypoint; `GET /mcp` is handled only as SSE-unavailable HTTP 405 with `Allow: POST`; accepted JSON-RPC notifications return HTTP 202 with no body; non-local Origin headers fail closed. It handles protocol shape for `initialize`, `ping`, `notifications/initialized`, `tools/list`, structured JSON-RPC errors, and fail-closed `tools/call` without adding OAuth/token/session handling, remote MCP deployment, Apps SDK iframe/resource implementation, public ChatGPT App behavior, app submission, public assets, listing copy, screenshots, OpenAI API/model calls, source mutation, finance writes, provider calls, external communications, generated finance advice, runtime-Codex finance output, or autonomous action. Real read-only evidence tool dispatch remains blocked until a later named Finance Plan proves the service layer.

FP-0108 is shipped only as a local/proof-only/read-only evidence tool dispatch contract foundation for the future `/mcp` `tools/call` implementation. It defines exact V2G tool-to-service mappings, strict argument schemas, future read-only evidence/source-authority dependency lanes, structured evidence/refusal envelopes, freshness and source-anchor requirements, no raw full-file dump, no generated finance advice, no source mutation, no finance write, no provider/external/OpenAI/model calls, no runtime dispatch, and no route behavior change. FP-0107 `tools/call` remains fail-closed until a later implementation Finance Plan opens dispatch.

FP-0109 is shipped only as a local-only/read-only/dependency-injected evidence tool dispatch adapter for the existing `/mcp` `tools/call` service path. It maps the exact V2G tools to `ReadOnlyEvidenceToolService`, enforces the expected `companyKey` before dispatch, honors declared arguments or fails closed including `fetch_source_coverage` `sourceId` and unsupported `periodKey`, mirrors `structuredContent` with bounded JSON text, preserves structured evidence/refusal envelopes, keeps default app registration fail-closed unless a dispatcher is explicitly injected, and adds no route path, GET behavior change, DB query, schema/migration, package script, fixture, sample data, source pack, public asset, OAuth/token/session handling, remote MCP deployment, Apps SDK resource, public ChatGPT App behavior, app submission, provider/external/OpenAI/model call, source mutation, finance write, generated finance advice, or autonomous action.

FP-0110 is shipped only as a docs-and-plan plus proof-gate compatibility master plan for future default local evidence dispatch enablement. It decides that default local dispatch may be planned from current repo truth but must not be enabled until a later implementation Finance Plan proves explicit app construction, single-company `companyKey` binding, local read-only evidence artifact sourcing, no-real-finance-data/no-public-demo-data posture, and default fail-closed behavior when construction input is absent or ambiguous. It adds no runtime dispatch, route behavior change, endpoint, DB query, schema/migration, package script, fixture, sample data, source pack, public asset, OAuth/token/session handling, remote MCP deployment, Apps SDK resource, public ChatGPT App behavior, app submission, OpenAI API/model call, provider call, external communication, source mutation, finance write, generated finance advice, runtime-Codex finance output, autonomous action, or FP-0111.

FP-0111 is shipped only as a local-only/read-only explicit app-construction wiring slice for default local evidence dispatch. It lets `buildApp({ container })` pass a supplied read-only MCP endpoint service into the existing `/mcp` route and keeps default `buildApp()` fail-closed when that dependency is absent. It adds no route path, GET behavior change, endpoint, DB query, schema/migration, package script, fixture, sample data, source pack, public asset, OAuth/token/session handling, remote MCP deployment, Apps SDK resource, public ChatGPT App behavior, app submission, OpenAI API/model call, provider call, external communication, source mutation, finance write, generated finance advice, runtime-Codex finance output, autonomous action, or remote/public readiness implementation.

FP-0112 is shipped only as a docs-and-plan plus proof-gate compatibility master plan for remote/public MCP deployment and OAuth readiness. It decides the current local `/mcp` route must not be exposed remotely as-is and current default local dispatch wiring is not enough for public exposure. It adds no route behavior change, remote MCP deployment, OAuth/token/session implementation, Apps SDK resource, public ChatGPT App behavior, app submission, screenshots, public assets, listing copy, DB query, schema/migration, package script, fixture, sample data, source pack, OpenAI API/model call, provider call, external communication, source mutation, finance write, generated finance advice, runtime-Codex finance output, autonomous action, or FP-0113.

FP-0113 is shipped only as a local/proof-only/read-only OAuth/token/session security contract foundation. It proves deferred OAuth, token/session storage, auth middleware, remote deployment, authenticated user/org/company binding, client `companyKey` selector fail-closed behavior, scope minimization, audience validation, token passthrough prohibition, token failure modes, token storage/redaction/revocation/rotation contract posture, no-token-leakage surfaces, public exposure block, no-real-finance-data posture, and the pre-FP-0114 security prerequisite boundary. It adds no route behavior change, OAuth implementation, token/session implementation, auth middleware, remote MCP deployment, Apps SDK resource, public ChatGPT App behavior, app submission, screenshots, public assets, listing copy, DB query, schema/migration, package script, fixture, sample data, source pack, OpenAI API/model call, provider call, external communication, source mutation, finance write, generated finance advice, runtime-Codex finance output, or autonomous action.

FP-0114 is shipped only as a local/proof-only/read-only remote MCP host readiness security contract foundation. It proves remote deployment deferral, current local `/mcp` non-exposability, stable HTTPS/TLS and canonical MCP resource URI prerequisites, `/mcp` as the only future public MCP endpoint path, Streamable HTTP compatibility, GET SSE deferral, Origin/CORS/CSP requirements, rate-limit/abuse controls, logging redaction, observability/audit correlation, rollback/incident response, health/readiness deferral, no-real-finance-data/no-public-demo-data posture, FP-0113 OAuth/security prerequisites, no remote runtime, and a docs-only FP-0115 successor boundary. It adds no route behavior change, new route path, deployment config, OAuth implementation, token/session implementation, auth middleware, Apps SDK resource, public ChatGPT App behavior, app submission, screenshots, public assets, listing copy, DB query, schema/migration, package script, fixture, sample data, source pack, OpenAI API/model call, provider call, external communication, source mutation, finance write, generated finance advice, runtime-Codex finance output, or autonomous action.

FP-0115 is shipped only as a docs-and-plan plus proof-gate compatibility master plan for remote MCP host implementation sequencing and provider/host readiness. It decides remote MCP host implementation cannot start from current repo truth, the current local `/mcp` route can not be exposed remotely as-is, host/provider ownership remains unresolved/provider-neutral, canonical resource URI and public `/mcp` prerequisites must be proven first, and OAuth/token/session/auth middleware, deployment config, Apps SDK resources, public app behavior, app submission, public assets, screenshots, listing copy, generated public prose, DB queries, schemas, migrations, package scripts, source packs, OpenAI API/model calls, provider calls, source mutation, finance writes, and autonomous action remain future-only.

FP-0116 is shipped only as a local/proof-only/read-only remote host ownership, canonical resource URI, public `/mcp` path, and protected-resource metadata contract foundation. It keeps host owner unresolved and implementation blocked, prefers a future separate MCP server package or gateway/wrapper unless a later plan proves `apps/control-plane` safe for public hosting, preserves provider neutrality, requires an exact stable HTTPS canonical resource URI and OAuth protected-resource metadata before public exposure, rejects workspace/tenant template URLs, treats local tunnels as development-only, and adds no route behavior change, new route path, remote MCP deployment, deployment config, OAuth/token/session/auth middleware implementation, Apps SDK resource, public app behavior, app submission, DB query, schema/migration, package script, source pack, public asset, listing copy, generated public prose, OpenAI API/model call, provider call, source mutation, finance write, or autonomous action.

FP-0117 is shipped only as a docs-and-plan plus proof-gate compatibility master plan for OAuth/token/session/auth implementation sequencing and protected-resource metadata readiness after FP-0116. It plans protected-resource metadata, WWW-Authenticate `resource_metadata`, authorization-server discovery, scope challenge handling, audience/resource validation, token failure modes, token/session storage/redaction/revocation/rotation/replay prerequisites, auth middleware prerequisites, and authenticated company binding gates while adding no route behavior change, route expansion, protected-resource metadata route, WWW-Authenticate behavior, OAuth/token/session/auth middleware implementation, remote MCP deployment, deployment config, Apps SDK resource, public app behavior, app submission, public asset, listing copy, generated public prose, DB query, schema/migration, package script, source pack, OpenAI API/model call, provider call, source mutation, finance write, generated finance advice, runtime-Codex finance output, or autonomous action.

FP-0118 is the shipped V2AL local/proof-only/read-only protected-resource metadata/auth challenge readiness contract slice. It proves protected-resource metadata document shape, canonical resource URI dependency, authorization server requirements, read-only scope posture, bearer method posture, WWW-Authenticate `resource_metadata` challenge readiness, metadata discovery, scope challenge readiness, token failure challenge posture, no-token-leakage, protected-resource route deferral, WWW-Authenticate route deferral, and no-runtime posture while adding no route behavior change, route expansion, protected-resource metadata route, WWW-Authenticate route behavior, OAuth/token/session/auth middleware implementation, remote MCP deployment, deployment config, Apps SDK resource, public app behavior, app submission, public asset, listing copy, generated public prose, DB query, schema/migration, package script, source pack, OpenAI API/model call, provider call, source mutation, finance write, generated finance advice, runtime-Codex finance output, or autonomous action.

FP-0119 is the shipped V2AM docs-and-plan plus proof-gate compatibility slice for protected-resource metadata route implementation sequencing and WWW-Authenticate `resource_metadata` challenge sequencing. FP-0120 is the shipped V2AN local/proof-only/read-only canonical resource/auth-server readiness contract slice with post-merge proof hardening for known-safe route inventory and validation-gated metadata URL derivation. FP-0121 is the shipped V2AO docs-and-plan/proof-gate-only protected-resource metadata route implementation readiness plan. FP-0122 is the shipped V2AP local/proof-only/read-only protected-resource metadata document-builder and deferred route-response contract slice with post-merge credential/userinfo hardening. FP-0123 is the shipped V2AQ local/proof-only/read-only protected-resource metadata route-input evidence bundle and route-path decision contract slice. FP-0124 is the shipped V2AR docs-and-plan/proof-gate-only protected-resource metadata route implementation master plan. FP-0125 is the shipped V2AS local-only/read-only explicit-dependency protected-resource metadata route slice, registering GET `/.well-known/oauth-protected-resource/mcp` only when app construction supplies a valid FP-0123 route-input evidence bundle and keeping default `buildApp()` route-absent. It adds no `/mcp` behavior changes, WWW-Authenticate behavior, OAuth/token/session/auth middleware, remote MCP deployment, deployment config, Apps SDK resources, public app behavior, app submission, public assets, listing copy, generated public prose, DB/schema/package work, OpenAI API/model calls, provider calls, source mutation, finance writes, autonomous action, or FP-0126.

## Internal Package Names

The internal package scope remains `@pocket-cto/*`, and the root package name remains `pocket-cto`. Treat those names as historical implementation scaffolding. Do not rename package scopes, imports, database names, service names, scripts, or root `package.json` without a dedicated future plan.

## Stale Pocket CTO And Engineering Docs

Pocket CTO-era docs and engineering-first modules may remain as historical reference or internal scaffolding. Clarify active/public docs when wording could confuse Pocket CFO direction, but do not rewrite archived history broadly, delete GitHub modules, delete engineering-twin modules, or treat old GitHub-first product assumptions as active truth.

## Avoiding Broad Rewrites

Patch the smallest set of active docs that are directly stale. Move ledger detail into [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md) instead of repeating it everywhere. Prefer links to shipped FP records over copying every phase paragraph into new docs.

## README vs PROJECT_STATE vs V2_BOUNDARY

- [README.md](README.md): human-facing landing page, setup, product definition, architecture, boundaries, roadmap summary, and links to contribution/security/privacy/demo/self-host policy.
- [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md): current shipped-state ledger, fixed family lists, source-pack proof commands, future-only tracks, internal scaffolding note.
- [docs/V2_BOUNDARY.md](docs/V2_BOUNDARY.md): V2 north star, allowed boundaries, forbidden boundaries, LLM/agent rules, phase sequence, acceptance criteria.

## Final Handoff Responses

A final handoff should name:

- verdict
- stale wording fixed
- docs created
- files changed
- validation results
- branch
- commit hash
- push status
- PR status
- exact next recommendation

For Pocket CFO closeouts, include the handoff audit facts without hiding failures or claiming validation that did not pass.

## Runtime Reminder

No runtime or product behavior should be added without an active Finance Plan that names exact scope, evidence contracts, replay implications, validation, and safety boundaries.
