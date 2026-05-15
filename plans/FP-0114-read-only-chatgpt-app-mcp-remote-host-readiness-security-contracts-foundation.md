# FP-0114 read-only ChatGPT App MCP remote host readiness security contracts foundation

## Purpose / Big Picture

FP-0114 is the V2AH local/proof-only/read-only remote MCP host readiness and public transport/security contract foundation for the future remote/public read-only ChatGPT App/MCP path.

This slice exists because FP-0112 shipped remote/public MCP deployment and OAuth readiness planning, and FP-0113 shipped local/proof-only OAuth, token/session, user/org/company binding, and public MCP security contracts. Those shipped records still keep OAuth implementation, token/session implementation, auth middleware, remote MCP deployment, Apps SDK resources, public app behavior, app submission, DB work, provider calls, OpenAI API/model calls, source mutation, finance writes, and public assets future-only. Before any remote MCP host can be created, the repo needs local contracts that prove the host-readiness boundary is explicit.

FP-0114 is contract/proof work only. It is not remote MCP deployment. It is not OAuth implementation. It is not token/session implementation. It is not auth middleware. It is not a route behavior change. It is not a new endpoint. It is not a `/mcp` route behavior change. It is not Apps SDK iframe/resource implementation, public ChatGPT App implementation, app submission, DB query implementation, schema or migration work, package script work, OpenAI API/model integration, provider/certification/deployment execution, external communications, source mutation, finance writes, generated finance advice, runtime-Codex finance output, public assets, sample data, source packs, or autonomous action. FP-0115 remains absent.

The proof point is not that Pocket CFO is remotely accessible. The proof point is that the repo can prove what a future remote host must satisfy before any public read-only MCP surface is exposed.

## Progress

- [x] 2026-05-15T16:10:40Z: Invoked the repo-local pocket-cfo-codex-operator skills requested for this slice: Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor.
- [x] 2026-05-15T16:10:40Z: Confirmed work is on `codex/v2ah-read-only-chatgpt-app-mcp-remote-host-readiness-security-contracts-foundation-local-v1`.
- [x] 2026-05-15T16:10:40Z: Confirmed PR #280 is merged, FP-0113 exists and is shipped, FP-0114 and FP-0115 were absent before this slice, and the required baseline proof tools passed before edits.
- [x] 2026-05-15T16:10:40Z: Tool discovery exposed OpenAI Platform key-setup tools but no read-only OpenAI Developers docs tool; used official OpenAI Apps SDK web docs and official MCP web docs only as read-only protocol/security context.
- [x] 2026-05-15T16:10:40Z: Created this FP-0114 plan as the single allowed remote MCP host readiness contract foundation artifact.
- [x] 2026-05-15T16:30:22Z: Added pure domain remote-host readiness contracts, builders, proof schema, proof output, exports, and focused specs under `packages/domain/src/read-only-app-mcp-remote-host-readiness*.ts`.
- [x] 2026-05-15T16:30:22Z: Added `tools/read-only-mcp-remote-host-readiness-proof.mjs` with machine-readable local/proof-only FP-0114 JSON and durable proof-source scans for no OpenAI API/model/client/key usage.
- [x] 2026-05-15T16:30:22Z: Applied the minimal proof-gate bridge so the exact FP-0114 plan is accepted, FP-0115 remains absent, and FP-0113/0112/0111/0110/0109/0108/0107/0106/0100 boundaries remain intact.
- [x] 2026-05-15T16:30:22Z: Refreshed directly stale active docs and `plugins.md` to describe FP-0114 as shipped local/proof-only/read-only contract work, with no route, runtime, deployment, app-submission, source, finance-write, or public-asset change.
- [x] 2026-05-15T16:30:22Z: Focused validation passed before final validation: all proof tools, 10 focused domain spec files with 100 tests, and 4 focused control-plane route/service/dispatcher/app-wiring spec files with 85 tests.
- [x] 2026-05-15T16:30:22Z: Pre-final strict QA found the changed files limited to domain contracts/specs, proof tools, plan/docs/plugin refresh, and no route behavior change, new route path, remote deployment, deployment config, OAuth/token/session/auth middleware implementation, Apps SDK resource, app submission, DB/schema/migration/package script, public asset, source mutation, finance write, provider call, OpenAI API/model/client/key use, or FP-0115.
- [x] 2026-05-15T16:40:17Z: Final validation passed after the proof-import correction: `git diff --check`, all proof tools including `tools/read-only-mcp-remote-host-readiness-proof.mjs`, focused domain specs, focused control-plane specs, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.

## Surprises & Discoveries

- Official MCP transport docs require one Streamable HTTP MCP endpoint path that supports POST and GET, while also requiring Origin validation and proper authentication for HTTP transport. That confirms FP-0114 can name `/mcp` as the only future public MCP endpoint path while still refusing remote exposure of the current local route.
- Official MCP authorization docs define canonical server URI requirements and token audience/resource validation. That confirms the future remote host needs an exact canonical resource URI before implementation.
- Official OpenAI Apps SDK connect docs expect a public HTTPS `/mcp` endpoint for ChatGPT connectors. That is future context only; no connector was created and no remote endpoint was exposed.
- OpenAI Developers read-only documentation tooling was not exposed in this thread. Official web docs were used instead, and no OpenAI API key setup, API call, model call, upload, connector creation, or app submission workflow was used.

## Decision Log

- Decision: Remote MCP deployment is future-only and not implemented by FP-0114.
- Decision: The local `/mcp` route behavior is unchanged.
- Decision: The current local `/mcp` route must not be exposed remotely as-is.
- Decision: Remote host creation requires a later named implementation plan.
- Decision: Stable HTTPS host and TLS requirements are future implementation prerequisites.
- Decision: Canonical MCP resource URI must be exact before remote implementation.
- Decision: `/mcp` remains the only future public MCP endpoint path.
- Decision: POST and GET Streamable HTTP transport semantics must remain compatible with official MCP transport docs.
- Decision: GET SSE streaming remains unimplemented and future-only unless a later plan opens it.
- Decision: Origin validation remains required.
- Decision: CORS policy must be explicit before remote exposure.
- Decision: CSP and resource-domain policy must be explicit before Apps SDK resources or widgets.
- Decision: Rate limits and abuse controls are required before remote exposure.
- Decision: Logging redaction must exclude tokens, cookies, sessions, OAuth material, raw prompts, raw source files, evidence dumps, provider credentials, object-store dumps, DB dumps, OpenAI keys, and private finance data.
- Decision: Observability and audit correlation must preserve evidence/proof boundaries and must not leak raw finance data.
- Decision: Rollback and incident-response planning must exist before remote deployment.
- Decision: Health/readiness checks remain future-only and may not create a route in FP-0114.
- Decision: No real finance data, public demo data, raw dumps, source packs, or private finance-data exposure are allowed.
- Decision: OAuth/security contracts from FP-0113 remain prerequisites.
- Decision: No provider calls, external communications, source mutation, finance writes, generated finance advice, app submission artifacts, public assets, or autonomous action are authorized.
- Decision: FP-0115 remains absent.

## Context and Orientation

The shipped local stack remains:

- FP-0100: local proof-only public-app security boundaries.
- FP-0106: local proof-only MCP protocol envelope and tool-dispatch proof contracts.
- FP-0107: local Fastify `/mcp` route shell with POST-only JSON-RPC request entrypoint, GET 405 SSE-unavailable boundary, local Origin fail-closed posture, and default fail-closed `tools/call`.
- FP-0108: local proof-only evidence tool dispatch contracts.
- FP-0109: local injected read-only evidence dispatch adapter.
- FP-0111: explicit app-construction wiring where default `buildApp()` remains fail-closed without an explicit MCP endpoint dependency.
- FP-0112: docs-and-plan proof-gate compatibility for remote/public MCP deployment and OAuth readiness.
- FP-0113: local/proof-only OAuth/token/session/user-org/company/security contracts.

FP-0114 adds only pure domain contracts, focused specs, one direct proof command, proof-source scans, and minimal proof-gate bridge compatibility so that FP-0114 is accepted while FP-0115 remains absent.

Official read-only research used:

- MCP specification, "Transports" (2025-11-25): used to confirm Streamable HTTP, single MCP endpoint path, POST/GET semantics, optional SSE, Origin validation, localhost binding guidance, proper authentication, session header semantics, and protocol-version header expectations.
- MCP specification, "Authorization" (2025-11-25): used to confirm OAuth 2.1 context, canonical server URI/resource indicator requirements, bearer-token handling, audience/resource validation, token passthrough prohibition, and HTTPS communication posture.
- MCP docs, "Security Best Practices": used to confirm confused-deputy, token passthrough, SSRF, session hijacking, local MCP server, and scope-minimization risks that a future remote host must plan around.
- MCP specification, "Tools" (2025-11-25): used only as read-only tool context for `tools/list`, `tools/call`, model-controlled tool posture, validation, human-in-the-loop, and audit expectations.
- OpenAI Apps SDK, "Deploy your app": used only as future deployment context for stable hosting and remote MCP server readiness. No deployment tool or action was used.
- OpenAI Apps SDK, "Connect from ChatGPT": used only as future connector context for a reachable HTTPS public `/mcp` endpoint. No connector was created.
- OpenAI Apps SDK, "Security & Privacy": used to confirm least privilege, explicit consent, validation, audit logs, and sensitive-data handling for future public app readiness.
- OpenAI Apps SDK, "Test your integration": used only as future validation context for tool correctness, authentication-flow tests, MCP Inspector-style local testing, and HTTPS connector validation. No inspector dependency was installed or run.
- OpenAI Apps SDK, "Submit and maintain your app": used only to confirm public distribution and app submission remain later review flows. No submission material was created.
- OpenAI Apps SDK, "App submission guidelines": used only as future public-review context. No listing copy, assets, screenshots, or app-submission artifacts were created.

No OpenAI API, OpenAI model, OpenAI client, OpenAI API key setup, Vercel deployment/project tool, GitHub Connector Guard, Figma/design-generation workflow, provider call, upload, dependency install, screenshot, image, public asset, app-submission artifact, or external communication was used.

## Plan of Work

1. Preserve the shipped local `/mcp` route and FP-0111 explicit app-construction dispatch posture.
2. Add pure domain remote-host readiness contracts under `packages/domain/src/read-only-app-mcp-remote-host-readiness*.ts`.
3. Add focused domain specs proving deployment deferral, route/path preservation, HTTPS/TLS prerequisites, canonical resource URI, Streamable HTTP compatibility, GET SSE deferral, Origin/CORS/CSP boundaries, rate limiting, logging redaction, observability/audit correlation, rollback/incident response, health/readiness deferral, no-real-finance-data posture, OAuth/security prerequisite preservation, and no remote runtime.
4. Add `tools/read-only-mcp-remote-host-readiness-proof.mjs` to print machine-readable JSON with the FP-0114 proof fields.
5. Update minimal proof-gate bridges so exactly this FP-0114 plan is accepted while FP-0115 remains absent.
6. Keep or extend durable no-OpenAI/API/model/key scans across the requested proof-source set.
7. Refresh only directly stale active docs/plugin notes after validation.
8. Run focused validation, strict same-branch QA, final validation, commit exactly once, push the requested branch, and create the requested PR if auth and validation allow it.

## Concrete Steps

- Add `packages/domain/src/read-only-app-mcp-remote-host-readiness-contracts.ts`.
- Add `packages/domain/src/read-only-app-mcp-remote-host-readiness-builders.ts`.
- Add `packages/domain/src/read-only-app-mcp-remote-host-readiness-proof.ts`.
- Add `packages/domain/src/read-only-app-mcp-remote-host-readiness-proof-schema.ts`.
- Add `packages/domain/src/read-only-app-mcp-remote-host-readiness-types.ts`.
- Add `packages/domain/src/read-only-app-mcp-remote-host-readiness.ts`.
- Add `packages/domain/src/read-only-app-mcp-remote-host-readiness.spec.ts`.
- Export the new module from `packages/domain/src/index.ts`.
- Add `tools/read-only-mcp-remote-host-readiness-proof.mjs`.
- Patch only the minimal existing proof scripts/domain proof fields needed to accept FP-0114 while proving FP-0115 absent and preserving FP-0113/0112/0111/0110/0109/0108/0107/0106/0100 boundaries.
- Patch directly stale docs and `plugins.md` if the implementation makes shipped-state docs stale.

## Validation and Acceptance

Acceptance requires:

- Exactly one FP-0114 plan exists at `plans/FP-0114-read-only-chatgpt-app-mcp-remote-host-readiness-security-contracts-foundation.md`.
- FP-0115 remains absent.
- FP-0114 proves local/proof-only remote MCP host readiness contracts only.
- Remote MCP deployment remains absent.
- The local `/mcp` route behavior is unchanged.
- No new route path is added.
- OAuth implementation remains absent.
- Token/session implementation remains absent.
- Auth middleware remains absent.
- Apps SDK resources, public app implementation, public app submission, DB queries, schemas, migrations, package scripts, fixtures, sample data, source packs, public assets, OpenAI API/model/client/key usage, provider calls, external communications, source mutation, finance writes, generated finance advice, and autonomous action remain absent.
- Prior FP-0113/0112/0111/0110/0109/0108/0107/0106/0100 boundaries remain verified.

Commands to run:

- `git diff --check`
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
- `pnpm --filter @pocket-cto/domain exec vitest run src/benchmark-community.spec.ts src/read-only-app-mcp.spec.ts src/read-only-app-mcp-descriptor.spec.ts src/read-only-app-mcp-public-security.spec.ts src/read-only-app-mcp-endpoint-architecture.spec.ts src/read-only-app-mcp-endpoint-route-ownership.spec.ts src/read-only-app-mcp-protocol-envelope.spec.ts src/read-only-app-mcp-evidence-tool-dispatch.spec.ts src/read-only-app-mcp-oauth-security.spec.ts src/read-only-app-mcp-remote-host-readiness.spec.ts`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/read-only-app-mcp-endpoint/routes.spec.ts src/modules/read-only-app-mcp-endpoint/service.spec.ts src/modules/read-only-app-mcp-endpoint/evidence-dispatcher.spec.ts src/app.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

## Idempotence and Recovery

This slice is idempotent because it adds one plan path, pure domain contracts, focused specs, direct proof tooling, proof-source scans, and proof-gate bridge compatibility only. If validation fails, do not widen scope. Patch only the FP-0114 contracts, proof bridge, focused specs, or directly stale docs on this same branch, then rerun the required validation.

Do not recover by adding routes, route behavior changes, OAuth implementation, token/session implementation, auth middleware, DB queries, schemas, migrations, package scripts, remote MCP deployment, deployment config, Apps SDK resources, public app behavior, app submission assets, public assets, data files, source packs, OpenAI API/model calls, provider calls, external communications, source mutation, finance writes, generated finance advice, autonomous action, or FP-0115.

If a blocker is outside this scope, stop and recommend the smallest safer corrective slice: FP-0114 remote host readiness proof-contract correction, FP-0113 OAuth/security proof-contract correction, FP-0112 readiness proof-gate bridge correction, FP-0111 local wiring correction, FP-0109 adapter correction, FP-0107 route adapter correction, or hold remote host readiness work until OAuth/security and local dispatch wiring can be proven.

## Artifacts and Notes

- Plan artifact: `plans/FP-0114-read-only-chatgpt-app-mcp-remote-host-readiness-security-contracts-foundation.md`.
- Domain/proof artifacts stay under `packages/domain/src/read-only-app-mcp-remote-host-readiness*.ts` and `tools/read-only-mcp-remote-host-readiness-proof.mjs`.
- Proof-gate bridge changes are limited to existing proof helpers/scripts that already guard the read-only ChatGPT App/MCP sequence.
- No raw source file, source snapshot, source pack, finance twin state, CFO Wiki compiled artifact, evidence bundle, report, provider artifact, public asset, screenshot, listing copy, app-submission artifact, or external artifact is created or mutated.
- Replay implication: no mission state, ingest, report, monitor, source registry, finance twin, or user-facing finance output changes occur, so no replay event is created. The recorded reason is that FP-0114 is local proof-contract work only.
- Provenance/freshness/limitations implication: no finance answer changes occur. The contracts require any future public/customer-specific evidence output to preserve provenance, freshness posture, and limitations after authenticated identity/company binding, host readiness, and public transport/security implementation are completed by later plans.

## Interfaces and Dependencies

FP-0114 depends on shipped FP-0113, FP-0112, FP-0111, FP-0110, FP-0109, FP-0108, FP-0107, FP-0106, and FP-0100 boundaries plus official OpenAI Apps SDK and MCP protocol/security docs as read-only context.

No new runtime interface is introduced. No route, endpoint, auth middleware, OAuth provider, token store, session store, DB schema, migration, package script, deployment host, deployment config, Apps SDK iframe/resource, OpenAI API/model integration, provider integration, public asset, or app-submission interface is added.

GitHub connector product behavior is explicitly out of scope. Routine `git`, `gh`, commit, push, and PR operations are repository operations only and do not make GitHub the Pocket CFO product center.

## Outcomes & Retrospective

FP-0114 implemented the local/proof-only/read-only remote MCP host readiness security contract foundation only. The slice adds no remote MCP runtime, no `/mcp` behavior change, no new route path, no deployment config, no OAuth/token/session/auth middleware implementation, no Apps SDK resource, no public app behavior, no app submission material, no DB query, no schema or migration, no package script, no public asset, no source pack, no OpenAI API/model/client/key use, no provider or external call, no source mutation, no finance write, no generated finance advice, no runtime-Codex finance output, no autonomous action, and no FP-0115.

Strict same-branch QA and final validation found no scope widening. Repository publication remains: one commit, push, and PR if repository authentication stays green.

Recommendation after this slice: remote MCP host implementation planning may start only as a later named Finance Plan that keeps public ChatGPT App submission waiting. The next plan should be narrow and should not implement app submission until host readiness, OAuth/security implementation, transport/security controls, and human review gates have their own green proof ladder.
