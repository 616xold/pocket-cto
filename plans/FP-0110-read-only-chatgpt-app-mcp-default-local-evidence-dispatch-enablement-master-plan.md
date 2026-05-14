# FP-0110 read-only ChatGPT App MCP default local evidence dispatch enablement master plan

## Purpose / Big Picture

FP-0110 is the docs-and-plan plus proof-gate compatibility master plan for default local evidence dispatch enablement in the existing `/mcp` route.

Target phase: V2AD read-only ChatGPT App/MCP default local evidence dispatch enablement planning.

This is planning plus proof-gate compatibility only. This is not default dispatch runtime enablement. This is not route expansion. This is not a new endpoint. This is not DB query implementation. This is not schema or migration work. This is not remote MCP deployment. This is not OAuth implementation. This is not token/session implementation. This is not Apps SDK iframe/resource implementation. This is not public ChatGPT App implementation. This is not app submission. This is not OpenAI API/model integration. This is not provider, certification, deployment, or external communications work. This is not source mutation. This is not a finance write. This is not autonomous action.

FP-0109 shipped the local-only, read-only, dependency-injected evidence dispatch adapter for the existing `/mcp` `tools/call` service path. It enforces expected `companyKey`, honors declared arguments or fails closed, mirrors `structuredContent` with bounded JSON text, and keeps default route registration fail-closed unless a dispatcher is explicitly injected.

FP-0110 decides how a later implementation plan may safely enable default local evidence dispatch without enabling it here. The primary decision is that current repo truth is sufficient to plan default local evidence dispatch enablement, but not sufficient to open runtime default wiring in this slice. Default route behavior must remain fail-closed until a later implementation Finance Plan explicitly opens the wiring and passes the proof gates defined here.

Replay and evidence-bundle implications: this slice creates no mission state transition, ingest action, report action, approval, durable product finance output, source mutation, Finance Twin write, CFO Wiki write, evidence bundle, provider job, certification record, delivery record, default evidence dispatcher runtime, public endpoint behavior, remote MCP server, Apps SDK resource, app submission, OpenAI API/model call, or autonomous action. No replay event is added because FP-0110 is docs-and-plan plus proof-gate compatibility only.

## Progress

- [x] 2026-05-14T22:10:23Z - Invoked the requested repo-local Pocket CFO operator skills before work: Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor. GitHub Connector Guard was not invoked because GitHub connector product behavior is out of scope.
- [x] 2026-05-14T22:10:23Z - Confirmed the working branch is `codex/v2ad-read-only-chatgpt-app-mcp-default-local-evidence-dispatch-enablement-master-plan-local-v1` and the worktree started clean.
- [x] 2026-05-14T22:10:23Z - Confirmed PR #275 is merged, FP-0109 exists and is shipped, the FP-0109 context/envelope hardening exists, FP-0110 and FP-0111 were absent before this slice, active docs support FP-0109 as a shipped local injected evidence dispatch adapter, and the route still defaults `tools/call` to fail-closed unless a dispatcher is explicitly injected.
- [x] 2026-05-14T22:10:23Z - Ran all required baseline proof tools before edits; all passed.
- [x] 2026-05-14T22:10:23Z - Used official Model Context Protocol and OpenAI Apps SDK web docs as read-only current platform context only. The OpenAI Developers plugin exposed only API-key setup tools in this thread, so no read-only docs tool was available; no OpenAI Platform key setup, OpenAI API call, model call, upload, or dependency installation was used.
- [x] 2026-05-14T22:10:23Z - Created this FP-0110 plan as the only allowed FP-0110 file.
- [x] 2026-05-14T22:34:13Z - Added the minimum proof-gate bridge so exactly this FP-0110 docs-only default local evidence dispatch enablement plan is accepted while FP-0111 remains absent.
- [x] 2026-05-14T22:34:13Z - Refreshed directly stale active docs and plugin inventory for FP-0110 without opening runtime, data, source, public-app, or provider scope.
- [x] 2026-05-14T22:34:13Z - Ran focused validation, strict same-branch QA, and final validation before this closeout edit; all passed. This closeout edit requires the final-tail validation rerun before the one commit, push, and PR creation.

## Surprises & Discoveries

The preflight gate was green. The repo already had the shipped FP-0109 local evidence dispatch adapter with the targeted hardening correction, and the existing `/mcp` route still defaulted to fail-closed without an injected dispatcher.

The OpenAI Developers plugin did not expose a read-only documentation search tool in this thread. It exposed API-key setup tools only, which are out of scope and were not used. Official web docs were used directly as read-only protocol and security context.

Official MCP docs still support the FP-0109 envelope posture: `tools/call` returns a `CallToolResult` with `content`, optional `structuredContent`, and optional `isError`; structured content should also be mirrored as serialized JSON text for backwards compatibility; and an MCP endpoint that does not offer an SSE stream may return HTTP 405 for GET. Official OpenAI Apps SDK reference and security/privacy docs reinforce that tool results visible to UI can include `structuredContent`, `content`, and `_meta`, and that apps should use least privilege, validate server-side, avoid secrets/tokens in structured content, and redact sensitive logs.

Running `pnpm test` concurrently with `pnpm ci:repro:current` interfered with DB-backed suites that share local database state. The concurrent results were discarded as an invalid validation attempt. Both broad gates were rerun sequentially, and the sequential reruns passed.

## Decision Log

Decision: FP-0110 is docs-and-plan plus proof-gate compatibility only.
Rationale: enabling default local dispatch changes runtime behavior and must wait for a later implementation Finance Plan.

Decision: current repo truth is sufficient to plan default local evidence dispatch enablement, but not sufficient to enable it now.
Rationale: FP-0109 proves the injected adapter and route fail-closed default. It does not decide the safe local service construction point, company binding source, local config shape, or future auth/session boundary.

Decision: default local evidence dispatch must be enabled through explicit app construction in a later implementation plan, not through hidden route-level construction in FP-0110.
Rationale: routes stay thin. The future app/server construction layer may assemble a single-company read-only evidence service and pass an explicit dispatcher dependency into the existing route/service path. The route file itself must not construct DB queries, evidence services, providers, OpenAI clients, OAuth/session handlers, local config readers, or source loaders by default.

Decision: explicit dependency injection remains required in FP-0110.
Rationale: `registerReadOnlyAppMcpEndpointRoutes` and `ReadOnlyAppMcpEndpointService` must continue to fail closed by default until FP-0111 or another later implementation plan explicitly opens local runtime wiring.

Decision: the allowed evidence artifact source for future default local dispatch is the existing local read-only evidence/source-authority lanes only: EvidenceIndex artifacts, Source Registry/source authority, Finance Twin read models, CFO Wiki compiled read models, mission answer refs, and proof bundle refs.
Rationale: raw source files, source snapshots, checksums, provenance, freshness posture, and derived twin/wiki/proof state remain the authority. Default dispatch must not create public demo data, fixture data, source packs, provider calls, raw file dumps, or model-derived source truth.

Decision: for the next local implementation slice, company context must be bound from explicit app construction input.
Rationale: a single expected `companyKey` must be selected before dispatcher construction and injected into the adapter/service context. Every tool argument `companyKey` must match that expected context. Mismatches, missing company context, ambiguous company context, and multi-company context must fail closed before evidence service calls.

Decision: future local config is deferred unless the implementation plan proves it is read-only, local-only, explicit, and does not bypass app construction or company binding.
Rationale: hidden config lookup inside the route would weaken route thinness and make no-real-finance-data posture harder to prove. A future local config object may be acceptable only as explicit app construction input.

Decision: future session/auth context is deferred to remote/public lanes.
Rationale: OAuth, token, session, public ChatGPT App behavior, remote MCP deployment, Apps SDK resources, and app submission remain future-only. They are not required for local default dispatch enablement planning.

Decision: no-real-finance-data and no-public-demo-data posture is preserved.
Rationale: FP-0110 creates no data, fixtures, source packs, sample company data, demo exports, public assets, screenshots, listing copy, app-submission artifacts, uploads, source mutations, or finance writes. Any future local dispatch proof must run over synthetic/in-memory or already-existing local proof artifacts only and must not expose raw private finance data.

Decision: FP-0111 remains absent in this slice.
Rationale: FP-0110 is the master plan and proof-gate bridge. Creating the implementation plan before FP-0110 closes would blur the active plan boundary.

Decision: public ChatGPT App submission must wait.
Rationale: default local evidence dispatch is only one local runtime step. Public app behavior still requires future OAuth/token/session, remote MCP, Apps SDK/resource, public app implementation, security/privacy, testing, and submission plans.

## Context and Orientation

FP-0107 shipped exactly one local/control-plane Fastify `/mcp` route-adapter shell. `POST /mcp` is the JSON-RPC request entrypoint. `GET /mcp` is handled only as SSE unavailable with HTTP 405 and `Allow: POST`. Accepted notifications return HTTP 202 with no body. Non-local `Origin` headers fail closed. `initialize`, `ping`, `notifications/initialized`, `tools/list`, structured JSON-RPC errors, and fail-closed `tools/call` are handled.

FP-0108 shipped local/proof-only/read-only evidence tool dispatch contracts for exact V2G tool mappings, strict arguments, evidence/refusal envelopes, freshness/source-anchor requirements, future read-only dependency lanes, and no runtime/no route behavior change boundaries.

FP-0109 shipped the local-only/read-only/dependency-injected adapter from the exact V2G tools to `ReadOnlyEvidenceToolService`. It enforces expected `companyKey`, honors declared arguments or fails closed, maps unsupported or missing evidence to structured refusals, mirrors `structuredContent` with bounded JSON text, and preserves default route fail-closed behavior when no dispatcher is injected.

FP-0110 plans how default local dispatch may be opened later without eroding the shipped safety spine:

- FP-0109 adapter boundary remains intact.
- FP-0108 dispatch contracts remain intact.
- FP-0107 route adapter boundary remains intact.
- FP-0106 protocol envelope boundary remains intact.
- FP-0100 public security boundary remains intact.
- FP-0111 remains absent.

Official docs used as read-only context:

- Model Context Protocol specification 2025-11-25, "Tools" page, purpose: confirm `tools/call`, tool result `structuredContent`, optional output schema, and the backwards-compatible serialized JSON `TextContent` mirror for structured content.
- Model Context Protocol specification 2025-11-25, "Schema Reference" page, purpose: confirm `CallToolRequest`, `CallToolResult`, `content`, `structuredContent`, `isError`, and tool-originated error posture inside result objects.
- Model Context Protocol specification 2025-11-25, "Transports" page, purpose: confirm an MCP endpoint without an SSE stream may return HTTP 405 for GET. FP-0110 does not change GET behavior.
- OpenAI Apps SDK, "Reference" page, purpose: confirm ChatGPT Apps SDK UI bridge visibility for tool result `structuredContent`, `content`, and `_meta`. FP-0110 does not add Apps SDK resources.
- OpenAI Apps SDK, "Security & Privacy" page, purpose: confirm least privilege, explicit consent for writes, prompt-injection assumptions, server-side validation, audit logging, structured-content minimization, secret/token avoidance, and log redaction context. FP-0110 does not implement OAuth, public app behavior, or external calls.

GitHub connector work is explicitly out of scope. Routine `git`, `gh pr view`, `git push`, and `gh pr create` CLI actions are repository workflow actions, not product GitHub connector behavior.

## Plan of Work

Create exactly one FP-0110 plan file. Update only proof-gate compatibility code and focused domain specs needed to accept exactly one docs-only FP-0110 plan while keeping FP-0111 absent and preserving FP-0109, FP-0108, FP-0107, FP-0106, and FP-0100 boundaries.

Refresh only directly stale active docs and `plugins.md`.

Forbidden behavior:

- no `/mcp` route behavior change
- no default evidence dispatch runtime enablement
- no route expansion
- no new endpoint
- no DB queries
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
- no FP-0111

### Required Planning Decisions

Default local dispatch can be planned from current repo truth, but it cannot be enabled in FP-0110.

The exact allowed source of evidence artifacts for future local default dispatch is the existing local read-only evidence/source-authority lanes only: EvidenceIndex artifacts, Source Registry/source authority, Finance Twin read models, CFO Wiki compiled read models, mission answer refs, and proof bundle refs. Raw source files remain immutable and authoritative; derived artifacts remain bounded and provenance-aware.

Evidence artifacts for future default local dispatch should come through explicit app construction input that creates or receives a local read-only evidence service and company-bound dispatcher. Already-existing service construction may be reused if a later implementation plan proves it is local-only, read-only, single-company, and does not add DB queries or schema changes. Hidden route-level construction is forbidden. A future local config object is deferred unless it is explicit app construction input. A future session/auth boundary is remote/public-only and deferred.

Company key binding must use an expected `companyKey` selected before dispatcher construction. The expected `companyKey` must be injected into the adapter/service context. Every tool call `companyKey` argument must match it. Missing, mismatched, multi-company, or ambiguous company context fails closed before evidence service calls.

No-real-finance-data and no-public-demo-data posture is preserved by adding no data and by requiring future proofs to demonstrate bounded structured result envelopes, freshness/limitations, no raw dumps, no public assets, and no synthetic/public source packs unless a later named plan explicitly opens them.

Route registration may not construct the dispatcher by default in FP-0110. Explicit dependency injection remains required. A future FP-0111 implementation may propose app/bootstrap-level construction and dependency injection, but the route file must remain transport-only and fail-closed without the explicit dependency.

### Proof-Gate Bridge

The minimum proof-gate bridge must prove:

- exactly one FP-0110 file exists at `plans/FP-0110-read-only-chatgpt-app-mcp-default-local-evidence-dispatch-enablement-master-plan.md`
- FP-0111 remains absent
- FP-0110 is docs-and-plan/proof-gate only
- FP-0110 plans default local evidence dispatch enablement only
- FP-0110 does not change route behavior
- FP-0110 does not enable default dispatch runtime
- FP-0110 adds no DB queries, schemas, migrations, package scripts, fixtures, datasets, source packs, public assets, OpenAI API/model calls, provider calls, external communications, source mutation, finance writes, OAuth/token/session, remote MCP, Apps SDK resources, public app behavior, app submission, generated finance advice, runtime-Codex finance output, or autonomous action
- FP-0109 adapter boundary remains intact
- FP-0108 dispatch contracts remain intact
- FP-0107 route adapter boundary remains intact
- FP-0106 protocol envelope boundary remains intact
- FP-0100 public security boundary remains intact

Proof fields:

- `fp0110AbsentOrDocsOnlyDefaultLocalDispatchEnablementPlanVerified`
- `fp0111Absent`
- `defaultLocalEvidenceDispatchEnablementPlanBoundaryVerified`
- `noRouteBehaviorChangeFromFp0110`
- `noDefaultDispatchRuntimeFromFp0110`
- `noDbQueriesFromFp0110`
- `noSchemaMigrationsFromFp0110`
- `noOauthTokenSessionFromFp0110`
- `noRemoteMcpDeploymentFromFp0110`
- `noAppsSdkResourceFromFp0110`
- `noOpenAiApiCallsFromFp0110`
- `noSourceMutationFinanceWriteFromFp0110`
- `fp0109AdapterBoundaryStillVerified`
- `fp0108DispatchContractsStillVerified`
- `fp0107RouteAdapterBoundaryStillVerified`
- `fp0100PublicSecurityBoundaryStillVerified`

### Future FP-0111 Implementation Boundary

If FP-0110 gates pass, a later FP-0111 implementation may open only a narrow local default dispatch wiring slice:

- construct or receive a local read-only evidence dispatch service at explicit app/server construction time
- bind exactly one expected `companyKey`
- inject the existing FP-0109 adapter/dispatcher into the existing `/mcp` service path
- keep the route file thin and transport-only
- keep default fail-closed behavior when construction input is absent, missing, ambiguous, or multi-company
- add no new route path, DB query, schema, migration, package script, fixture, dataset, source pack, public asset, OAuth/session, remote MCP, Apps SDK resource, app submission, OpenAI API/model call, provider call, external communication, source mutation, finance write, generated finance advice, runtime-Codex finance output, or autonomous action unless a future plan explicitly names and proves the exception

FP-0111 must not be created in FP-0110.

## Concrete Steps

1. Run preflight.
2. Read first files from the prompt, repo-local plugin skills, active docs spine, FP-0109/0108/0107/0106/0100 records, plugin inventory, package metadata, route/service/dispatcher proof surfaces, and proof tools.
3. Run baseline proof gates and confirm FP-0110/FP-0111 absence.
4. Use official MCP/OpenAI docs only for current tool-dispatch/default-enablement context and record source names and purposes in this plan.
5. Create exactly one Finance Plan at `plans/FP-0110-read-only-chatgpt-app-mcp-default-local-evidence-dispatch-enablement-master-plan.md`.
6. Update minimum proof-gate bridge fields/tools/specs.
7. Refresh directly stale active docs and `plugins.md`.
8. Run focused validation: all proof tools, focused domain specs, and focused control-plane route/service/dispatcher specs proving route still defaults fail-closed.
9. Run strict same-branch QA.
10. Run final validation.
11. If a post-validation closeout edit is made, rerun the required final-tail validation.
12. Commit exactly once, push the requested branch, and create the requested PR.

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
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/read-only-app-mcp-endpoint/routes.spec.ts src/modules/read-only-app-mcp-endpoint/service.spec.ts src/modules/read-only-app-mcp-endpoint/evidence-dispatcher.spec.ts
```

Focused validation results:

- all proof tools passed
- focused domain specs passed: 8 files, 80 tests
- focused control-plane route/service/dispatcher specs passed: 3 files, 26 tests

Strict same-branch QA:

- confirm changed files are docs/proof-gate only
- confirm exactly one FP-0110 file exists
- confirm FP-0111 remains absent
- confirm no route behavior changed
- confirm no default dispatch wiring
- confirm no DB queries, schemas, migrations, package scripts, fixtures, datasets, sample data, source packs, public assets, OpenAI API/model calls, provider calls, external communications, source mutation, finance writes, OAuth/token/session, remote MCP, Apps SDK resources, public app behavior, app submission, generated finance advice, runtime-Codex finance output, or autonomous action
- confirm FP-0109/0108/0107/0106/0100 boundaries remain intact

Strict same-branch QA results:

- changed files remained docs/proof-gate only
- exactly one FP-0110 plan file exists
- FP-0111 remains absent
- `/mcp` route behavior stayed unchanged and default-fail-closed without an injected dispatcher
- no default dispatch wiring, DB query, schema, migration, package script, fixture, dataset, sample data, source pack, public asset, OpenAI API/model call, provider call, external communication, source mutation, finance write, OAuth/token/session, remote MCP, Apps SDK resource, public app behavior, app submission, generated finance advice, runtime-Codex finance output, or autonomous action was added

Final validation:

```bash
git diff --check
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
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/read-only-app-mcp-endpoint/routes.spec.ts src/modules/read-only-app-mcp-endpoint/service.spec.ts src/modules/read-only-app-mcp-endpoint/evidence-dispatcher.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Final validation results before this closeout edit:

- `git diff --check` passed
- all proof tools passed
- focused domain specs passed: 8 files, 80 tests
- focused control-plane route/service/dispatcher specs passed: 3 files, 26 tests
- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test` passed sequentially after the discarded concurrent attempt: 8 successful package tasks; control-plane suite reported 136 files and 738 tests
- `pnpm ci:repro:current` passed sequentially after the discarded concurrent attempt

Because this closeout text is a post-validation doc edit, the required final-tail validation must be rerun before committing:

```bash
git diff --check
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Acceptance is observable when the proof tools emit machine-readable JSON accepting exactly this FP-0110 docs-only plan, rejecting FP-0111, and proving no runtime, route, data, source, finance-write, OpenAI/model, provider, OAuth/session, remote-MCP, Apps-SDK, public-app, asset, app-submission, or autonomous-action scope opened.

## Idempotence and Recovery

The slice is additive and docs/proof-gate only. If validation fails, patch this same branch inside the FP-0110 allowed files and rerun the failing focused checks plus required final validation.

If the plan file is accidentally duplicated, delete the duplicate and keep only `plans/FP-0110-read-only-chatgpt-app-mcp-default-local-evidence-dispatch-enablement-master-plan.md`.

If FP-0111 is accidentally created, delete it and rerun proof gates. FP-0111 is not allowed in this slice.

If route behavior, default dispatch wiring, DB access, schema/migration/package script changes, fixtures/data/source packs, public assets, OAuth/session, remote MCP, Apps SDK resources, app submission, OpenAI API/model calls, providers, external communications, source mutation, finance writes, generated finance advice, runtime-Codex finance output, or autonomous actions appear, revert only the FP-0110 changes that opened that boundary and narrow back to planning/proof compatibility before proceeding.

## Artifacts and Notes

Actual artifacts:

- `plans/FP-0110-read-only-chatgpt-app-mcp-default-local-evidence-dispatch-enablement-master-plan.md`
- domain proof-gate fields/helpers/spec updates under `packages/domain/src/read-only-app-mcp-evidence-tool-dispatch*.ts`
- direct proof-tool bridge edits for the evidence dispatch, adapter, and route adapter proof gates
- directly stale active-doc, security/demo boundary, roadmap, and `plugins.md` refreshes

No raw sources are changed. No generated finance advice, source mutation, finance write, provider call, external communication, OpenAI API/model call, public asset, screenshot, listing copy, app submission artifact, fixture, sample data, dataset, source pack, migration, DB query, package script, route behavior change, default dispatch wiring, OAuth/session, remote MCP, Apps SDK resource, public app behavior, runtime-Codex finance output, or autonomous action is created.

## Interfaces and Dependencies

FP-0110 depends on the shipped FP-0109 local injected evidence dispatch adapter, shipped FP-0108 dispatch contracts, shipped FP-0107 route adapter shell, shipped FP-0106 protocol envelope contracts, and shipped FP-0100 public security boundary contracts.

No new environment variables are introduced. Internal `@pocket-cto/*` package scope remains unchanged.

Future FP-0111, if opened later, must use explicit app construction input and existing local read-only evidence/source-authority lanes. Route files must stay thin. Any future local config object must be explicit input to app construction, not hidden route behavior. OAuth/token/session and remote/public ChatGPT App boundaries remain future-only.

## Outcomes & Retrospective

FP-0110 is complete as a docs-and-plan plus proof-gate compatibility slice. It created the master plan for default local evidence dispatch enablement without enabling runtime default dispatch. It preserved the FP-0109 local injected evidence dispatch adapter boundary, FP-0108 dispatch contracts, FP-0107 route adapter boundary, FP-0106 protocol envelope boundary, FP-0100 public security boundary, and the existing default fail-closed `/mcp` route posture.

No FP-0110 correction is currently needed. Default local evidence dispatch implementation may start next only as one narrow FP-0111 local wiring plan after this branch is merged and the final-tail validation remains green. Public ChatGPT App submission should wait through local default dispatch, OAuth/token/session, remote MCP, Apps SDK/resource, public app implementation, security/privacy/testing, and submission plans.
