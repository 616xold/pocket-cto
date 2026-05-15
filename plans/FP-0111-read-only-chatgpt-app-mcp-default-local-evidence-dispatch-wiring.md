# FP-0111 read-only ChatGPT App MCP default local evidence dispatch wiring

## Purpose / Big Picture

FP-0111 is the narrow local implementation slice that wires the existing `/mcp` route to an explicitly supplied read-only MCP endpoint service at app construction time.

Target phase: V2AE read-only ChatGPT App/MCP default local evidence dispatch wiring.

This is local-only. This is read-only. This is explicit-dependency wiring only. This is not route expansion. This is not a new endpoint. This is not DB query implementation. This is not schema or migration work. This is not remote MCP deployment. This is not OAuth implementation. This is not token/session implementation. This is not Apps SDK iframe/resource implementation. This is not public ChatGPT App implementation. This is not app submission. This is not OpenAI API/model integration. This is not provider, certification, deployment, or external communications work. This is not source mutation. This is not a finance write. This is not generated finance advice. This is not runtime-Codex finance output. This is not autonomous action.

FP-0107 shipped the local `/mcp` route shell. FP-0108 shipped read-only evidence dispatch contracts. FP-0109 shipped the local injected evidence dispatch adapter and hardening for expected `companyKey`, declared arguments, `fetch_source_coverage` `sourceId`, unsupported `periodKey`, and bounded `structuredContent` text mirroring. FP-0110 shipped docs-and-plan plus proof-gate compatibility for default local evidence dispatch enablement, but did not enable it.

FP-0111 opens only the first default local wiring step: `buildApp({ container })` may receive an explicit MCP endpoint service dependency and pass it into the already-existing `/mcp` route registration. Default `buildApp()` remains fail-closed when no explicit dependency is present.

Replay and evidence-bundle implications: this slice changes local route dependency wiring only. It creates no mission state transition, ingest action, report action, approval, durable product finance output, source mutation, Finance Twin write, CFO Wiki write, evidence bundle, provider job, certification record, delivery record, public endpoint behavior, remote MCP server, Apps SDK resource, app submission, OpenAI API/model call, or autonomous action. No replay event is added because no mission-facing state changes.

GitHub connector work is explicitly out of scope. Routine `git`, `gh pr view`, `git push`, and `gh pr create` CLI actions are repository workflow actions, not product GitHub connector behavior.

## Progress

- [x] 2026-05-15T11:28:44Z - Invoked the requested repo-local Pocket CFO operator skills before work: Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor. GitHub Connector Guard was not invoked because GitHub connector product behavior is out of scope.
- [x] 2026-05-15T11:28:44Z - Confirmed the working branch is `codex/v2ae-read-only-chatgpt-app-mcp-default-local-evidence-dispatch-wiring-local-v1`.
- [x] 2026-05-15T11:28:44Z - Confirmed PR #276 and PR #277 are merged to `main`, FP-0110 exists and is shipped, FP-0111 and FP-0112 were absent before this slice, and active docs support FP-0110 as shipped docs-only default local evidence dispatch enablement planning.
- [x] 2026-05-15T11:28:44Z - Confirmed the existing `/mcp` route adapter exists, `buildApp()` registers it without an injected service by default, default `tools/call` remains fail-closed before edits, `ReadOnlyAppMcpEndpointService` supports an optional injected dispatcher, and `LocalReadOnlyEvidenceToolDispatchAdapter` exists with company/source/text-mirror hardening.
- [x] 2026-05-15T11:28:44Z - Ran all required baseline proof tools before code edits; all passed after correcting a zsh wrapper variable name that failed before any repo proof command executed.
- [x] 2026-05-15T11:28:44Z - Used official Model Context Protocol and OpenAI Apps SDK web docs as read-only current platform context only. No OpenAI Platform key setup, OpenAI API call, model call, upload, or dependency installation was used.
- [x] 2026-05-15T11:28:44Z - Created this FP-0111 plan as the only allowed FP-0111 file.
- [x] 2026-05-15T12:24:40Z - Added explicit optional `readOnlyAppMcpEndpointService` typing to app construction and passed it from `buildApp({ container })` into the existing `/mcp` route registration without adding routes or constructing evidence services in route code.
- [x] 2026-05-15T12:40:40Z - Added focused app wiring tests proving default fail-closed behavior without injection, exact V2G local dispatch through the existing service/adapter path with injection, source-coverage `sourceId` handling, and companyKey mismatch fail-closed before evidence service calls.
- [x] 2026-05-15T12:41:10Z - Added `tools/read-only-mcp-default-local-evidence-dispatch-proof.mjs` and updated proof-gate bridge compatibility so exactly one FP-0111 plan is accepted while FP-0112 remains absent and FP-0110/0109/0108/0107/0106/0100 boundaries remain intact.
- [x] 2026-05-15T12:41:10Z - Hardened proof-source scans for no OpenAI/API/model/key usage across the requested app, endpoint, evidence-index, domain, and proof-tool surfaces.
- [x] 2026-05-15T12:40:40Z - Focused validation passed for all required proof tools, focused domain specs, and focused control-plane route/service/dispatcher/app-wiring specs before final doc closeout refresh.
- [x] 2026-05-15T12:48:30Z - Refreshed directly stale current-state docs, security/demo docs, roadmap, and plugin inventory for FP-0111 without opening public, remote, OAuth/session, Apps SDK, data, source, finance-write, provider, OpenAI/model, or route-expansion scope.

## Surprises & Discoveries

The preflight gate was green. FP-0110 is present and shipped, FP-0111 and FP-0112 were absent, and the existing `/mcp` route still defaults `tools/call` to a structured fail-closed result unless an endpoint service or dispatcher is injected through the service path.

The first baseline proof wrapper used `commands` as a shell variable name and zsh expanded it as a reserved command table. The wrapper failed before any repo proof command ran. The same proof list was rerun with a bash shell and a non-reserved variable name, and all baseline proof tools passed.

`plugins.md` is directly stale because it records the repo-local plugin usage for FP-0110 rather than FP-0111. It may be refreshed in this slice without widening runtime scope.

The first draft of the new proof scanned all changed specs and proof helpers for DB-ish or token/session words. That was too broad for a proof-gate bridge because specs and historical boundary text contain those words while the runtime app-wiring surface does not. The proof was narrowed to scan runtime app construction and endpoint modules for runtime-forbidden patterns while keeping path-level package/schema/migration/data/asset checks broad.

The endpoint-architecture inventory proof treated the new app-wiring spec as possible public app endpoint runtime because the spec exercises `/mcp` and contains unrelated historical action strings. The bridge now recognizes app construction specs as local proof surface while runtime app and route files remain checked for forbidden endpoint/public-app markers.

Official MCP docs support preserving this slice's current transport and tool-result posture: Streamable HTTP uses one MCP endpoint path for POST and GET, servers must validate `Origin`, notifications accepted by the server return HTTP 202 with no body, GET without SSE may return HTTP 405, `tools/call` carries a tool name and arguments, `CallToolResult` contains `content`, optional `structuredContent`, and optional `isError`, and structured content should be mirrored as serialized JSON text for backwards compatibility.

Official OpenAI Apps SDK docs were used only as security and visibility context. The Apps SDK reference says UI tool-result messages include `structuredContent`, `content`, and `_meta`, and the component bridge reads structured content. The Security & Privacy guide reinforces least privilege, explicit consent for writes, server-side validation, audit logs, structured-content minimization, no secrets/tokens in component props, and log redaction. FP-0111 does not implement Apps SDK resources, OAuth, public app behavior, or write tools.

## Decision Log

Decision: FP-0111 enables local evidence dispatch only through explicit app construction input.
Rationale: the safest first runtime step is to let `buildApp({ container })` pass an explicitly supplied MCP endpoint service to the existing route registration. The route remains thin and no hidden local service construction is added.

Decision: the app container receives an optional, explicitly named MCP endpoint service dependency.
Rationale: `ReadOnlyAppMcpEndpointService` already owns JSON-RPC method handling and already supports an injected evidence dispatcher. A prebuilt endpoint service can carry the existing `LocalReadOnlyEvidenceToolDispatchAdapter` path without constructing evidence stores, source loaders, DB clients, providers, OpenAI clients, config readers, OAuth/session handlers, or remote MCP services in the route.

Decision: default `buildApp()` remains fail-closed.
Rationale: when no explicit MCP endpoint service is supplied, the existing route default service path still returns the FP-0107/FP-0110 fail-closed `tools/call` refusal.

Decision: no new route path or GET behavior change is authorized.
Rationale: FP-0111 is a wiring slice only. `POST /mcp` stays the only JSON-RPC request entrypoint, and `GET /mcp` remains SSE unavailable with HTTP 405 and `Allow: POST`.

Decision: no evidence source construction is added.
Rationale: evidence/source truth remains the source registry, EvidenceIndex, Finance Twin, CFO Wiki, mission answers, and proof bundles. FP-0111 does not add DB queries, schemas, migrations, fixtures, sample data, source packs, source mutation, finance writes, provider calls, external calls, OpenAI clients, OpenAI API calls, or model calls.

Decision: public ChatGPT App submission must wait.
Rationale: this local wiring slice does not add OAuth/token/session, remote MCP deployment, Apps SDK resources, public app behavior, app submission, public assets, or listing copy.

## Context and Orientation

Current route shape before FP-0111:

- `apps/control-plane/src/app.ts` calls `registerReadOnlyAppMcpEndpointRoutes(app)` without dependencies.
- `apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts` registers only `GET /mcp` and `POST /mcp`.
- `routes.ts` uses `ReadOnlyAppMcpEndpointService` and does not construct `ReadOnlyEvidenceToolService`.
- `ReadOnlyAppMcpEndpointService` accepts `evidenceToolDispatcher?: ReadOnlyEvidenceToolDispatcher`.
- `LocalReadOnlyEvidenceToolDispatchAdapter` maps the exact V2G tool allowlist to `ReadOnlyEvidenceToolService` and enforces the shipped FP-0109 boundaries.

Official docs used as read-only context:

- Model Context Protocol specification 2025-11-25, "Tools" page, purpose: confirm `tools/list`, `tools/call`, tool `inputSchema`, `CallToolResult` `content`, `structuredContent`, `isError`, structured-content text mirroring, and tool input validation/security expectations.
- Model Context Protocol specification 2025-11-25, "Schema Reference" page, purpose: confirm `CallToolRequest`, `CallToolRequestParams`, `CallToolResult`, `content`, `structuredContent`, `isError`, and protocol-vs-tool execution error posture.
- Model Context Protocol specification 2025-11-25, "Transports" page, purpose: confirm Streamable HTTP single endpoint, Origin validation, POST JSON-RPC, accepted notification HTTP 202, and GET HTTP 405 without SSE.
- OpenAI Apps SDK, "Reference" page, purpose: confirm ChatGPT UI bridge visibility for tool result `structuredContent`, `content`, and `_meta`. FP-0111 does not add Apps SDK UI/resources.
- OpenAI Apps SDK, "Security & Privacy" page, purpose: confirm least privilege, explicit consent for writes, prompt-injection assumptions, server-side validation, audit logging, structured-content minimization, secret/token avoidance, and log redaction context. FP-0111 does not implement OAuth, public app behavior, or external calls.

## Plan of Work

Implement only explicit app construction dependency wiring:

- Add an optional MCP endpoint service port to `AppContainer`.
- Pass `container.readOnlyAppMcpEndpointService` from `buildApp({ container })` into `registerReadOnlyAppMcpEndpointRoutes`.
- Keep `buildApp()` with no explicit dependency fail-closed.
- Keep route paths unchanged.
- Keep `GET /mcp`, notification 202, Origin boundary, initialize, ping, tools/list, exact V2G allowlist, invalid tool/args fail-closed behavior, companyKey enforcement, sourceId handling, unsupported periodKey fail-closed behavior, bounded structured-content text mirror, no raw dump, no generated finance advice, no mutation/write/provider/external/OpenAI/model behavior.
- Add a direct proof command at `tools/read-only-mcp-default-local-evidence-dispatch-proof.mjs`.
- Update minimum proof gates so exactly one FP-0111 plan is accepted and FP-0112 remains absent.
- Refresh directly stale active docs and `plugins.md` only if needed.

Allowed files for this slice are limited to the user-named app wiring, read-only MCP endpoint tests/proofs, minimal domain proof-gate helpers/specs, the single FP-0111 plan, and directly stale active docs/plugin inventory.

Forbidden behavior:

- no new route paths
- no GET `/mcp` behavior change
- no SSE streaming
- no health route
- no DB queries
- no route-level evidence store or evidence service construction
- no hidden config construction
- no schemas or migrations
- no package scripts
- no fixtures, eval datasets, sample data, public demo data, or source packs
- no public assets, screenshots, generated images, listing copy, or app-submission artifacts
- no OAuth, token, or session implementation
- no remote MCP implementation or deployment
- no Apps SDK iframe/resource implementation
- no public ChatGPT App implementation
- no app submission
- no OpenAI API/model calls
- no provider calls
- no external communications
- no source mutation
- no finance write
- no generated finance advice
- no runtime-Codex finance output
- no autonomous action
- no FP-0112

## Concrete Steps

1. Run preflight and read the active docs, FP-0110, route/service/dispatcher code, specs, package scripts, plugin instructions, and proof tools.
2. Run baseline proof gates and confirm FP-0111 and FP-0112 absence.
3. Use only official MCP/OpenAI docs as read-only protocol/security context and record source names and purposes here.
4. Create exactly one Finance Plan at `plans/FP-0111-read-only-chatgpt-app-mcp-default-local-evidence-dispatch-wiring.md`.
5. Add explicit optional MCP endpoint service typing in `apps/control-plane/src/lib/types.ts`.
6. Pass that explicit dependency from `apps/control-plane/src/app.ts` into `registerReadOnlyAppMcpEndpointRoutes`.
7. Add focused app wiring specs proving default fail-closed and explicit service-injected local dispatch.
8. Add or adjust focused route/service/dispatcher specs only as needed to prove unchanged route behavior and existing hardening.
9. Add `tools/read-only-mcp-default-local-evidence-dispatch-proof.mjs`.
10. Update minimum proof-gate bridge tools/specs so FP-0111 is accepted and FP-0112 remains absent while prior boundaries remain intact.
11. Refresh directly stale active docs and `plugins.md` only if needed.
12. Run focused validation.
13. Run strict same-branch QA and patch the same branch if a defect is found.
14. Run final validation.
15. If a post-validation closeout edit is made, rerun the required final-tail validation.
16. Commit exactly once, push the requested branch, and create the requested PR if authentication permits.

## Validation and Acceptance

Baseline proof gates passed before edits:

```bash
pnpm exec tsx tools/read-only-mcp-evidence-tool-dispatch-adapter-proof.mjs
pnpm exec tsx tools/read-only-mcp-evidence-tool-dispatch-proof.mjs
pnpm exec tsx tools/read-only-mcp-route-adapter-proof.mjs
pnpm exec tsx tools/read-only-mcp-protocol-envelope-proof.mjs
pnpm exec tsx tools/read-only-endpoint-route-ownership-proof.mjs
pnpm exec tsx tools/read-only-endpoint-architecture-proof.mjs
pnpm exec tsx tools/read-only-public-app-security-boundary-proof.mjs
pnpm exec tsx tools/read-only-mcp-descriptor-response-envelope-proof.mjs
pnpm exec tsx tools/read-only-chatgpt-app-mcp-proof.mjs
pnpm exec tsx tools/benchmark-community-pack-proof.mjs
pnpm exec tsx tools/bounded-llm-orchestration-proof.mjs
pnpm exec tsx tools/read-only-evidence-app-proof.mjs
pnpm exec tsx tools/document-precision-foundation-proof.mjs
pnpm exec tsx tools/evidence-index-foundation-proof.mjs
```

Focused validation:

```bash
pnpm exec tsx tools/read-only-mcp-default-local-evidence-dispatch-proof.mjs
pnpm exec tsx tools/read-only-mcp-evidence-tool-dispatch-adapter-proof.mjs
pnpm exec tsx tools/read-only-mcp-evidence-tool-dispatch-proof.mjs
pnpm exec tsx tools/read-only-mcp-route-adapter-proof.mjs
pnpm exec tsx tools/read-only-mcp-protocol-envelope-proof.mjs
pnpm exec tsx tools/read-only-endpoint-route-ownership-proof.mjs
pnpm exec tsx tools/read-only-endpoint-architecture-proof.mjs
pnpm exec tsx tools/read-only-public-app-security-boundary-proof.mjs
pnpm exec tsx tools/read-only-mcp-descriptor-response-envelope-proof.mjs
pnpm exec tsx tools/read-only-chatgpt-app-mcp-proof.mjs
pnpm exec tsx tools/benchmark-community-pack-proof.mjs
pnpm exec tsx tools/bounded-llm-orchestration-proof.mjs
pnpm exec tsx tools/read-only-evidence-app-proof.mjs
pnpm exec tsx tools/document-precision-foundation-proof.mjs
pnpm exec tsx tools/evidence-index-foundation-proof.mjs
pnpm --filter @pocket-cto/domain exec vitest run src/benchmark-community.spec.ts src/read-only-app-mcp.spec.ts src/read-only-app-mcp-descriptor.spec.ts src/read-only-app-mcp-public-security.spec.ts src/read-only-app-mcp-endpoint-architecture.spec.ts src/read-only-app-mcp-endpoint-route-ownership.spec.ts src/read-only-app-mcp-protocol-envelope.spec.ts src/read-only-app-mcp-evidence-tool-dispatch.spec.ts
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/read-only-app-mcp-endpoint/routes.spec.ts src/modules/read-only-app-mcp-endpoint/service.spec.ts src/modules/read-only-app-mcp-endpoint/evidence-dispatcher.spec.ts src/app.spec.ts
```

Strict same-branch QA:

- confirm changed files are limited to app wiring, endpoint tests, proof/domain bridge helpers, docs, and plugin inventory
- confirm no new route path
- confirm default route behavior remains safe without injection
- confirm explicit app construction dependency enables local dispatch through the existing service/adapter path
- confirm no DB queries, schemas, migrations, package scripts, fixtures, datasets, source packs, public assets, OpenAI API/model calls, provider calls, external communications, source mutation, finance writes, OAuth/session, remote MCP, Apps SDK resources, app submission, or FP-0112

Final validation:

```bash
git diff --check
pnpm exec tsx tools/read-only-mcp-default-local-evidence-dispatch-proof.mjs
pnpm exec tsx tools/read-only-mcp-evidence-tool-dispatch-adapter-proof.mjs
pnpm exec tsx tools/read-only-mcp-evidence-tool-dispatch-proof.mjs
pnpm exec tsx tools/read-only-mcp-route-adapter-proof.mjs
pnpm exec tsx tools/read-only-mcp-protocol-envelope-proof.mjs
pnpm exec tsx tools/read-only-endpoint-route-ownership-proof.mjs
pnpm exec tsx tools/read-only-endpoint-architecture-proof.mjs
pnpm exec tsx tools/read-only-public-app-security-boundary-proof.mjs
pnpm exec tsx tools/read-only-mcp-descriptor-response-envelope-proof.mjs
pnpm exec tsx tools/read-only-chatgpt-app-mcp-proof.mjs
pnpm exec tsx tools/benchmark-community-pack-proof.mjs
pnpm exec tsx tools/bounded-llm-orchestration-proof.mjs
pnpm exec tsx tools/read-only-evidence-app-proof.mjs
pnpm exec tsx tools/document-precision-foundation-proof.mjs
pnpm exec tsx tools/evidence-index-foundation-proof.mjs
pnpm --filter @pocket-cto/domain exec vitest run src/benchmark-community.spec.ts src/read-only-app-mcp.spec.ts src/read-only-app-mcp-descriptor.spec.ts src/read-only-app-mcp-public-security.spec.ts src/read-only-app-mcp-endpoint-architecture.spec.ts src/read-only-app-mcp-endpoint-route-ownership.spec.ts src/read-only-app-mcp-protocol-envelope.spec.ts src/read-only-app-mcp-evidence-tool-dispatch.spec.ts
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/read-only-app-mcp-endpoint/routes.spec.ts src/modules/read-only-app-mcp-endpoint/service.spec.ts src/modules/read-only-app-mcp-endpoint/evidence-dispatcher.spec.ts src/app.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Acceptance is observable when:

- `buildApp()` without explicit MCP endpoint dependency keeps default `tools/call` fail-closed
- `buildApp({ container })` with an explicit MCP endpoint service dependency enables local read-only dispatch
- no injected dependency means no evidence service call
- injected dependency maps exact V2G tools through the existing service/adapter path
- route behavior remains unchanged for GET 405, POST JSON-RPC, notification 202, Origin boundary, initialize, ping, and tools/list
- invalid tool and invalid args fail closed
- companyKey mismatch fails closed before evidence service calls
- source coverage `sourceId` is honored or fails closed
- structuredContent text mirror remains bounded
- no new route path exists
- route file does not instantiate evidence service/store
- app wiring files do not import DB clients, providers, OpenAI clients, source loaders, OAuth/session, remote MCP, or Apps SDK resources
- proof gates accept exactly FP-0111 and reject FP-0112

## Idempotence and Recovery

This slice is additive and local. Re-running the proof tools and specs should be deterministic.

If validation fails, do not widen scope. Patch only the FP-0111 wiring, proof bridge, or focused test defect on this same branch. If the route needs expansion, DB queries, schema/migration, OAuth/token/session, remote MCP, Apps SDK resources, public assets, OpenAI API/model calls, provider calls, source mutation, or finance writes to pass, stop and recommend the smallest safer corrective slice instead of implementing it.

Rollback is straightforward: remove the optional app container dependency, remove the `buildApp` route-registration pass-through, remove the new proof tool, and restore proof gates to their pre-FP-0111 state. No persisted product data or schema state is affected.

## Artifacts and Notes

Expected artifacts:

- one FP-0111 plan file
- narrow app/container wiring
- focused specs
- direct proof command `tools/read-only-mcp-default-local-evidence-dispatch-proof.mjs`
- minimum proof-gate bridge updates
- directly stale active docs/plugin inventory refresh, if needed

No archive boundary changes are expected. No new environment variables are introduced. No package scripts are added.

## Interfaces and Dependencies

Primary interface:

- `buildApp(options?: { container?: AppContainer })`

New optional dependency:

- `AppContainer.readOnlyAppMcpEndpointService?: Pick<ReadOnlyAppMcpEndpointService, "handle">`

Existing route dependency:

- `registerReadOnlyAppMcpEndpointRoutes(app, { readOnlyAppMcpEndpointService })`

Existing service/adapter path:

- `ReadOnlyAppMcpEndpointService({ evidenceToolDispatcher })`
- `LocalReadOnlyEvidenceToolDispatchAdapter({ evidenceService, expectedCompanyKey })`

No DB, provider, OpenAI, source loader, OAuth/token/session, remote MCP, or Apps SDK dependency is added.

## Outcomes & Retrospective

Implementation is complete pending final full validation, commit, push, and PR creation.

The wiring is intentionally small: `AppContainer` now has an optional read-only MCP endpoint service port, and `buildApp({ container })` passes that explicit dependency into `registerReadOnlyAppMcpEndpointRoutes`. The route module still owns only transport registration and does not construct evidence stores, DB clients, providers, OpenAI clients, source loaders, config readers, OAuth/session handlers, remote MCP services, or Apps SDK resources.

The default posture is unchanged: `buildApp()` without the explicit dependency still returns the existing fail-closed `tools/call` refusal. When a supplied `ReadOnlyAppMcpEndpointService` is wired with the existing `LocalReadOnlyEvidenceToolDispatchAdapter`, exact V2G tools dispatch through the existing local read-only service/adapter path.

Direct proof-source hardening now verifies no executable OpenAI import/client/key/API/model patterns across the requested app wiring, endpoint, evidence-index, domain dispatch/envelope, and proof-tool surfaces.

Focused validation before final doc closeout passed for all required proof tools, focused domain specs, and focused control-plane route/service/dispatcher/app-wiring specs. Final broad validation and repo workflow status are recorded in the handoff/final response after the post-closeout validation pass.

No archive boundary changed. Public/remote MCP deployment planning should wait; the next safe step is only a narrow follow-up local correction if final validation reveals one, otherwise public ChatGPT App submission remains blocked behind future OAuth/token/session, remote MCP, Apps SDK resource, public app implementation, security/privacy/testing, and submission plans.
