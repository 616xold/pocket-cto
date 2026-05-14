# FP-0107 read-only ChatGPT App/MCP local Fastify route adapter foundation

Status: shipped local-only route-adapter implementation slice closed 2026-05-11; post-merge transport hardening correction validated 2026-05-14.

## Purpose / Big Picture

FP-0107 implements the first local-only, thin `apps/control-plane` Fastify `/mcp` route adapter shell for the future public read-only ChatGPT App/MCP path. `POST /mcp` remains the only JSON-RPC request entrypoint; `GET /mcp` is handled only as an SSE-unavailable Streamable HTTP boundary.

This slice exists because FP-0104 named `/mcp` as the only future public ChatGPT-facing endpoint path, FP-0105 selected `apps/control-plane` Fastify as the future route owner family, and FP-0106 defined the MCP protocol envelope, `ping` liveness, and read-only tool-dispatch proof contracts. The FP-0106 `ping` compatibility hardening is shipped, so the next safe step is one local route adapter shell that handles protocol shape only.

FP-0107 is route-driven but local/control-plane only. It is not remote MCP deployment. It is not public ChatGPT App implementation. It is not Apps SDK iframe/resource implementation. It is not OAuth implementation. It is not token/session implementation. It is not app submission. It is not public asset, listing, screenshot, provider, certification, deployment, external communication, OpenAI API/model, source mutation, finance write, generated finance advice, runtime-Codex finance output, or autonomous-action work.

Replay and evidence-bundle implications: this slice creates no mission state transition, ingest action, report action, approval, source mutation, Finance Twin write, CFO Wiki write, EvidenceIndex mutation, provider job, delivery record, app-submission artifact, public asset, or durable finance output. No replay event is added because the route shell returns protocol responses and fail-closed refusals only. The future read-only evidence tool dispatch remains blocked until a later Finance Plan proves the service dispatch layer.

GitHub connector product behavior is out of scope. Routine `git` and `gh` CLI repository operations for branch, push, and PR creation are allowed by this plan but do not make GitHub a Pocket CFO product center.

## Progress

- [x] 2026-05-11T16:29:16Z - Invoked the repo-local Pocket CFO operator plugin guards: Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor. GitHub Connector Guard was not invoked because GitHub connector product behavior is out of scope.
- [x] 2026-05-11T16:29:16Z - Ran preflight on branch `codex/v2aa-read-only-chatgpt-app-mcp-local-fastify-mcp-route-adapter-foundation-local-v1`; PR #270 is merged, FP-0106 exists and is shipped, FP-0107 and FP-0108 were absent, the tree was clean, and the requested baseline proof tools passed before edits.
- [x] 2026-05-11T16:29:16Z - Used official MCP and OpenAI web docs as read-only protocol/platform context only. No OpenAI Developers key setup, OpenAI API key, OpenAI API call, model call, app-submission workflow, public asset generation, or artifact upload was used.
- [x] 2026-05-11T17:00:49Z - Added the initial local-only Fastify `/mcp` route adapter shell with POST handling and focused control-plane specs. The route validates JSON-RPC shape and handles `initialize`, `ping`, `notifications/initialized`, `tools/list`, structured fail-closed errors, and fail-closed `tools/call`.
- [x] 2026-05-11T17:00:49Z - Added `tools/read-only-mcp-route-adapter-proof.mjs` with direct Fastify injection coverage and machine-readable boundary fields for FP-0107.
- [x] 2026-05-11T17:00:49Z - Applied the minimum proof-gate bridge so exactly this FP-0107 local route adapter shell is accepted while FP-0108 remains absent and prior public-app/endpoint/security boundaries remain intact.
- [x] 2026-05-11T17:00:49Z - Refreshed directly stale active docs and `plugins.md` where shipped-state text needed to acknowledge FP-0107 while keeping real dispatch, OAuth/token/session, remote MCP, Apps SDK resources, public app behavior, submission, and public assets future-only.
- [x] 2026-05-11T17:10:07Z - Ran focused validation and strict same-branch QA: control-plane route/service specs, focused domain specs, all existing proof gates, the new route-adapter proof, one-route/no-GET scan, FP-0108 absence scan, and forbidden runtime-scope scans passed.
- [x] 2026-05-11T17:10:07Z - Ran final validation before this closeout edit: `git diff --check`, all existing 11 proof tools, `tools/read-only-mcp-route-adapter-proof.mjs`, focused control-plane specs, focused domain specs, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current` passed.
- [x] 2026-05-11T17:10:07Z - Recorded the required post-closeout validation command set to run after this final plan edit and before commit: `git diff --check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.
- [x] 2026-05-14 - Invoked the requested repo-local Pocket CFO operator guards for the post-merge correction: Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor. GitHub Connector Guard was not invoked because GitHub connector product behavior is out of scope.
- [x] 2026-05-14 - Ran same-branch preflight on `codex/v2aa-read-only-chatgpt-app-mcp-local-fastify-mcp-route-adapter-transport-hardening-local-v1`: PR #272 and PR #271 are merged, FP-0107 exists and is shipped, FP-0108 is absent, required route module files and proof tools exist, the tree was clean, GitHub CLI auth and Docker services were available, and all required baseline proof gates passed before edits.
- [x] 2026-05-14 - Used official MCP Streamable HTTP transport, Base Protocol, Lifecycle, Ping, and Tools docs plus official OpenAI Apps SDK MCP server/connect/security docs as read-only protocol/platform context. No OpenAI Developers key setup, OpenAI API key, OpenAI API call, model call, app-submission workflow, public asset generation, artifact upload, or dependency installation was used.
- [x] 2026-05-14 - Hardened the local `/mcp` route shell: `GET /mcp` now returns HTTP 405 with `Allow: POST` and no SSE stream; accepted JSON-RPC notifications over POST return HTTP 202 Accepted with no body; and non-local Origin headers fail closed with HTTP 403 while absent and loopback origins remain allowed for local CLI/test clients.
- [x] 2026-05-14 - Updated focused route specs and `tools/read-only-mcp-route-adapter-proof.mjs` with Streamable HTTP, 202-notification, no-SSE, Origin-boundary, invalid-Origin fail-closed, and FP-0108-absence proof fields.
- [x] 2026-05-14 - Ran the full requested validation ladder: `git diff --check`; all required proof tools; focused domain specs; focused control-plane route/service specs; `pnpm lint`; `pnpm typecheck`; `pnpm test`; and `pnpm ci:repro:current` all passed.
- [x] 2026-05-14 - Completed code, docs, proof, and validation closeout for the same-branch correction. Commit, push, and PR creation remain local thread repository operations after the required post-closeout rerun.

## Surprises & Discoveries

- The baseline proof gate still reflected the FP-0106 no-route posture before this plan was opened, so FP-0107 had to bridge those proof surfaces deliberately instead of silently weakening them.
- The new route-adapter proof initially caught one closeout wording gap in this plan: it required the exact fail-closed `tools/call` boundary to be recorded plainly. The plan now records that tools/call stays fail-closed until a later dispatch Finance Plan.
- The post-merge correction found that the shipped local shell needed to account for MCP Streamable HTTP GET semantics without opening SSE, and needed HTTP 202 for accepted JSON-RPC notifications plus an Origin-header boundary for DNS-rebinding protection.

## Decision Log

- 2026-05-11 - FP-0107 implemented exactly one local Fastify route path: `/mcp`.
- 2026-05-14 - Post-merge hardening supersedes the earlier "GET absent" decision: `POST /mcp` remains the only JSON-RPC request entrypoint, while `GET /mcp` is registered only to return HTTP 405 Method Not Allowed with `Allow: POST`, no body, and no SSE stream.
- 2026-05-11 - `tools/call` stays fail-closed for every V2G read-only tool in this slice. Real read-only evidence service dispatch is deferred to a later Finance Plan.
- 2026-05-11 - The route adapter must not add auth, token, session, OAuth, deployment, Apps SDK resources, app submission, source mutation, finance writes, provider calls, external communications, OpenAI API/model calls, generated finance advice, runtime-Codex finance output, public assets, screenshots, listing copy, schemas, migrations, package scripts, fixtures, sample data, public demo data, or source packs.
- 2026-05-14 - Accepted JSON-RPC notifications, including `notifications/initialized`, return HTTP 202 Accepted with no body and perform no state mutation.
- 2026-05-14 - Local Origin-header validation is a route-adapter safety boundary only: absent Origin is allowed for local CLI/test clients, loopback/local origins are allowed, and non-local or malformed Origin headers fail closed with HTTP 403. No deployment-origin configuration, OAuth, token, session, or remote MCP behavior is added.
- 2026-05-11 - The proof-gate bridge allows only the exact FP-0107 plan, the exact `apps/control-plane/src/modules/read-only-app-mcp-endpoint/` route-adapter module, `apps/control-plane/src/app.ts` registration, the new direct route-adapter proof, and minimal existing proof/domain/doc refreshes.
- 2026-05-11 - Existing proof fields with historical names such as `fp0107Absent` now mean "absent or exactly this allowed FP-0107 local route-adapter shell" for compatibility with prior proof JSON schemas.
- 2026-05-11 - No replay event was added because this route adapter shell creates no mission state transition, ingest action, report action, approval, evidence mutation, source mutation, Finance Twin write, provider job, external delivery, or durable finance output.

## Context and Orientation

The active phase is V2AA, the first local implementation slice after the shipped FP-0106 protocol-envelope/tool-dispatch proof contracts. FP-0107 depends on shipped FP-0106, FP-0105, FP-0104, FP-0103, and FP-0100 boundaries. It must update proof gates so those records remain true as shipped history while the new route adapter is accepted as the one named successor implementation slice.

Official Model Context Protocol sources used:

- Model Context Protocol Streamable HTTP transport, version 2025-06-18, `https://modelcontextprotocol.io/specification/2025-06-18/basic/transports`: used to confirm the `/mcp` endpoint must account for POST and GET, accepted JSON-RPC notifications return HTTP 202 with no body, unsupported SSE GET can fail with HTTP 405, and servers must validate Origin headers to mitigate DNS rebinding.
- Model Context Protocol Base Protocol, version 2025-06-18, `https://modelcontextprotocol.io/specification/2025-06-18/basic`: used to confirm MCP messages follow JSON-RPC 2.0, requests require string or integer IDs, responses preserve the same ID and contain exactly result or error, and notifications must not receive responses.
- Model Context Protocol Lifecycle, version 2025-06-18, `https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle`: used to confirm `initialize` and `notifications/initialized` lifecycle semantics while preserving no state mutation in the local shell.
- Model Context Protocol Ping utility, version 2025-06-18, `https://modelcontextprotocol.io/specification/2025-06-18/basic/utilities/ping`: used to confirm `ping` is a liveness JSON-RPC request and requires an empty JSON-RPC result.
- Model Context Protocol Tools, version 2025-06-18, `https://modelcontextprotocol.io/specification/2025-06-18/server/tools`: used to align `tools/list`, `tools/call`, tool annotations, and structured tool results while keeping real dispatch blocked.

Official OpenAI sources used:

- OpenAI Apps SDK MCP server docs, `https://developers.openai.com/apps-sdk/concepts/mcp-server`: used as read-only platform context that Apps SDK MCP servers list tools, call tools, may return components/resources, and can use Streamable HTTP, while FP-0107 avoids Apps SDK resources and remote deployment.
- OpenAI Apps SDK Connect from ChatGPT docs, `https://developers.openai.com/apps-sdk/deploy/connect-chatgpt`: used as read-only platform context that ChatGPT connector setup points at the public `/mcp` endpoint over HTTPS, while FP-0107 remains local-only and does not deploy.
- OpenAI Apps SDK Security & Privacy guide, `https://developers.openai.com/apps-sdk/guides/security-privacy`: used as read-only platform context for connector security posture, while FP-0107 remains local-only and does not implement OAuth, sessions, deployment, resources, or submission.

OpenAI Developers MCP/plugin read-only docs tools were not exposed as callable tools in this thread. OpenAI Platform key setup was not used.

## Plan of Work

Implement the route shell under `apps/control-plane/src/modules/read-only-app-mcp-endpoint/` with the repository's route/schema/service/formatter split. Keep `POST /mcp` as the only JSON-RPC request entrypoint and handle `GET /mcp` only as an SSE-unavailable HTTP 405 boundary. Keep `tools/list` sourced from existing domain V2G descriptor/allowlist contracts. Keep `tools/call` fail-closed through structured MCP tool results/refusals.

Add a direct proof command that exercises the route locally through Fastify injection and scans the changed tree for forbidden runtime scope. Bridge existing proof tools only where needed so the new route shell is allowed and FP-0108 remains absent. Update active docs only where current shipped-state text would otherwise say route implementation is still wholly blocked.

## Concrete Steps

1. Create the new module files:
   - `apps/control-plane/src/modules/read-only-app-mcp-endpoint/schema.ts`
   - `apps/control-plane/src/modules/read-only-app-mcp-endpoint/formatter.ts`
   - `apps/control-plane/src/modules/read-only-app-mcp-endpoint/service.ts`
   - `apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts`
   - focused route/service specs as needed
2. Register the route in `apps/control-plane/src/app.ts` only.
3. Add and harden `tools/read-only-mcp-route-adapter-proof.mjs` with machine-readable JSON fields required by the prompt, including Streamable HTTP GET/SSE-unavailable, HTTP 202 notification, Origin-boundary, invalid-Origin fail-closed, no-SSE, and FP-0108 absence checks.
4. Apply minimum domain/proof-tool bridge changes for exact FP-0107 route adapter acceptance.
5. Refresh directly stale active docs and `plugins.md` only if scans show they still describe FP-0107 as absent or all route implementation as blocked.
6. Run focused validation and strict same-branch QA.
7. Update this plan's progress, decision log, validation results, and retrospective.
8. Run final validation, commit exactly once, push the requested branch, and create the requested PR.

## Validation and Acceptance

Acceptance is observable when:

- `POST /mcp` exists locally in `apps/control-plane` as the only JSON-RPC request entrypoint.
- `GET /mcp` exists only as an SSE-unavailable transport boundary that returns HTTP 405, `Allow: POST`, and no `text/event-stream` response.
- Valid `initialize` returns a minimal read-only server/capabilities response.
- Valid `ping` returns `{}` as a JSON-RPC result.
- `notifications/initialized` returns HTTP 202 Accepted with no body and mutates no state.
- Non-local or malformed Origin headers fail closed with HTTP 403; absent Origin and loopback/local Origin headers remain allowed for local clients.
- `tools/list` returns the exact V2G read-only allowlist and annotations from domain contracts.
- `tools/call` fails closed for every tool in this slice, invalid tool names, and invalid arguments.
- Malformed JSON-RPC and unknown methods return structured JSON-RPC errors.
- No route returns raw full-file dumps, generated finance advice, source mutation, finance writes, provider calls, external communications, OpenAI API/model calls, OAuth/token/session behavior, remote MCP behavior, Apps SDK resources, app-submission behavior, or public assets.
- Existing proof gates accept exactly FP-0107 and still reject FP-0108.

Required validation ladder:

- `git diff --check`
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
- focused domain specs for read-only app/MCP protocol, endpoint route ownership, endpoint architecture, public security, descriptor/envelope, and benchmark/community as touched
- focused control-plane route specs for `read-only-app-mcp-endpoint`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

If any post-validation closeout edit is made, rerun at minimum `git diff --check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.

## Idempotence and Recovery

The route shell is additive. If validation fails, patch this same branch and rerun the relevant focused commands before broad validation. If the proof bridge accepts anything beyond the exact FP-0107 local route shell, narrow it before commit. If unrelated dirty files appear, stop and report them. If Docker-backed or repo-wide validation fails due to missing services rather than product behavior, record the exact blocker and do not claim the ladder is green.

Rollback is straightforward before merge: remove the new FP-0107 plan, route module files, route registration, direct proof command, and proof/doc bridge updates. No schema, data, source, provider, deployment, or external state should require recovery.

## Artifacts and Notes

Expected new artifacts:

- One active Finance Plan: `plans/FP-0107-read-only-chatgpt-app-mcp-local-fastify-mcp-route-adapter-foundation.md`
- One local control-plane route module folder: `apps/control-plane/src/modules/read-only-app-mcp-endpoint/`
- One direct proof command: `tools/read-only-mcp-route-adapter-proof.mjs`

No migrations, package scripts, smoke aliases, fixtures, sample data, public demo data, source packs, public assets, screenshots, generated images, listing copy, app-submission artifacts, or app-submission prose are expected.

## Interfaces and Dependencies

The route shell depends on:

- Fastify in `apps/control-plane`
- Zod for local request validation
- Existing domain read-only MCP allowlist/descriptor/protocol contracts

The route shell does not depend on:

- database schema changes
- object storage
- providers
- OpenAI APIs or models
- OAuth/token/session storage
- Apps SDK iframe/resources
- remote MCP deployment
- new package dependencies

No new environment variables are added.

## Outcomes & Retrospective

FP-0107 shipped exactly one local/control-plane Fastify `/mcp` route-adapter shell. After the post-merge hardening correction, `POST /mcp` remains the only JSON-RPC request entrypoint, `GET /mcp` is handled only as SSE-unavailable HTTP 405 with `Allow: POST`, accepted JSON-RPC notifications return HTTP 202 Accepted with no body, and non-local Origin headers fail closed for DNS-rebinding protection. The adapter validates JSON-RPC 2.0 request shape, handles `initialize`, `ping`, `notifications/initialized`, and `tools/list`, and keeps `tools/call` fail-closed for every V2G read-only tool until a later Finance Plan proves a safe evidence dispatch layer.

The proof-gate bridge accepts the exact FP-0107 route-adapter shell and active-doc refresh while preserving FP-0106 protocol envelope/tool-dispatch contracts, FP-0105 route ownership, FP-0104 endpoint readiness, FP-0103 endpoint architecture, FP-0100 public-app security, V2G descriptor/envelope, and FP-0108 absence boundaries.

Validation for the post-merge hardening correction passed: `git diff --check`; all required proof tools; focused control-plane route/service specs; focused domain specs; `pnpm lint`; `pnpm typecheck`; `pnpm test`; and `pnpm ci:repro:current`. Because this closeout section is a post-validation doc edit, the required post-closeout rerun is `git diff --check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current` after this final plan edit and before commit.

Next recommendation: after this correction validates and merges, start real read-only evidence tool dispatch only as the next narrow Finance Plan after FP-0107, with service-layer proof of provenance, freshness, limitations, source excerpt limits, raw-full-file-dump refusal, and replay/audit implications. Public ChatGPT App submission, Apps SDK resources, OAuth/token/session, remote MCP deployment, provider/certification/deployment, public assets, and app-submission artifacts should wait.
