# FP-0112 read-only ChatGPT App MCP remote/public deployment OAuth readiness master plan

## Purpose / Big Picture

FP-0112 is a docs-and-plan plus proof-gate compatibility record for remote/public MCP deployment and OAuth readiness. It exists because FP-0107 shipped the local `/mcp` route shell, FP-0108 shipped read-only evidence dispatch contracts, FP-0109 shipped the local injected evidence dispatch adapter, FP-0110 planned default local evidence dispatch enablement, and FP-0111 shipped explicit app-construction wiring so local dispatch can be enabled only when a dependency is explicitly supplied.

This plan decides the next public exposure boundary before any implementation starts. FP-0112 plans remote/public MCP deployment and oauth readiness only. FP-0112 is not remote MCP deployment. FP-0112 is not OAuth implementation. FP-0112 is not token/session implementation. FP-0112 is not Apps SDK iframe/resource implementation. FP-0112 is not public ChatGPT App implementation. FP-0112 is not app submission. FP-0112 is not route expansion. FP-0112 is not a new endpoint. FP-0112 is not DB query implementation. FP-0112 is not schema or migration work. FP-0112 is not package script work. FP-0112 is not OpenAI API/model integration. FP-0112 is not provider/certification/deployment execution. FP-0112 is not external communications. FP-0112 is not source mutation. FP-0112 is not a finance write. FP-0112 is not runtime-Codex finance output. FP-0112 is not autonomous action. FP-0113 remains absent.

The core verdict is conservative: current local `/mcp` route must not be exposed remotely as-is. Current default local dispatch wiring is not enough for public exposure. Public app implementation and public app submission remain future-only.

## Progress

- 2026-05-15T13:27:21Z: Invoked the repo-local pocket-cfo-codex-operator skills requested for this slice: Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor.
- 2026-05-15T13:27:21Z: Confirmed work is on `codex/v2af-read-only-chatgpt-app-mcp-remote-public-deployment-oauth-readiness-master-plan-local-v1`.
- 2026-05-15T13:27:21Z: Confirmed PR #278 merged, FP-0111 exists as shipped, FP-0112 and FP-0113 were absent before this slice, active docs reflected FP-0111 local-only explicit dependency wiring, and baseline proof tools passed before edits.
- 2026-05-15T13:27:21Z: Used official OpenAI Apps SDK and MCP protocol/security docs as read-only planning context because an OpenAI Developers docs MCP tool was not exposed in this session.
- 2026-05-15T13:27:21Z: Created this FP-0112 plan as the single allowed remote/public MCP OAuth readiness planning artifact.
- 2026-05-15T13:43:45Z: Added the FP-0112 proof-gate bridge and directly stale active-doc/plugin refresh without changing route behavior, remote MCP deployment, OAuth/token/session implementation, Apps SDK resources, app submission, DB/schema/package scripts, public assets, provider/OpenAI calls, source mutation, finance writes, runtime-Codex finance output, autonomous action, or FP-0113.
- 2026-05-15T13:43:45Z: Completed validation through proof tools, focused domain/control-plane specs, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`; all passed after a same-branch proof-script helper correction.
- 2026-05-15T13:51:40Z: Same-branch QA found and corrected one stale `docs/ACTIVE_DOCS.md` shipped-state paragraph that still summarized only through FP-0110/FP-0111; no runtime, route, deployment, OAuth/token/session, Apps SDK, app-submission, DB, schema, package-script, asset, provider, source, finance-write, autonomous-action, or FP-0113 scope was added.

## Surprises & Discoveries

- The already-shipped local `/mcp` shell and FP-0111 app-construction wiring prove only local explicit dispatch enablement. They do not establish public host security, authenticated user/org/company binding, token lifecycle handling, remote transport posture, logging redaction, abuse controls, or app submission readiness.
- Official Apps SDK docs treat authentication as expected for customer-specific data, and official MCP guidance treats token validation, HTTPS, Origin validation, and secure token storage as protocol/security boundaries. That confirms this repo should plan these gates before remote exposure.
- No product runtime path needs to change for this slice. Any route, auth, session, DB, Apps SDK resource, deployment, or public asset change would be a scope violation.

## Decision Log

- Decision: Remote/public MCP implementation cannot start from current repo truth. Planning can start; implementation is blocked until later contracts prove host, auth, tenant binding, transport, rate-limit, logging, rollback, and no-real-finance-data gates.
- Decision: The current local `/mcp` route must not be exposed remotely as-is. Its local Origin hardening, POST-only request entrypoint, GET 405 SSE-unavailable boundary, and fail-closed default dispatch posture are necessary local proofs but not public host readiness.
- Decision: Current FP-0111 default local dispatch wiring is not enough for public exposure. Explicit app construction dependency is a local safety boundary, not a substitute for OAuth, user identity, org boundary, RBAC, token/session lifecycle, public host controls, or tenant-safe `companyKey` binding.
- Decision: Before a remote MCP host is created, the repo needs a remote host readiness contract proving HTTPS/TLS, trusted host/domain inventory, transport semantics, Origin/CORS policy, CSP policy for future resources, rate limits, abuse controls, logging redaction, observability, rollback, public exposure inventory, no-public-demo-data posture, no raw dumps, no source packs, and no private finance data disclosure.
- Decision: Before OAuth/token/session implementation starts, the repo needs a contract for OAuth 2.1 authorization server/resource metadata, consent, admin approval, org boundary, RBAC, scopes, audience validation, refresh-token/offline-access policy, token storage, token redaction in logs, revocation, and fail-closed handling for missing, expired, malformed, wrong-audience, wrong-scope, or mismatched-org tokens.
- Decision: Before Apps SDK iframe/resource work starts, the repo needs remote host and OAuth/security contracts plus CSP/resource-domain rules, no-token/no-secret component metadata rules, no private finance data in component props, and explicit read-only UI behavior.
- Decision: Before public ChatGPT App behavior starts, the repo needs remote MCP host proof, OAuth/token/session proof, company/user/org binding proof, evidence/freshness/limitations envelope proof, privacy/security review, and no-real-finance-data/no-public-demo-data proof.
- Decision: Before app submission, listing, screenshots, logos, public assets, test prompts, review responses, or generated public prose starts, the repo needs a later app-submission plan after remote MCP, OAuth/security, and public behavior contracts are accepted.
- Decision: `companyKey` binding changes for public/remote usage. Local proof accepts an expected `companyKey`; public usage must derive user/org/company authorization server-side from authenticated identity and approved org membership. Any client-supplied `companyKey` becomes a requested selector that must match the authenticated binding or fail closed.
- Decision: No real finance data, no public demo data, no raw dumps, no source packs, no private source snapshots, and no private finance-data exposure remain preserved. Public readiness must be proven without fixtures, datasets, sample data, source packs, screenshots, or public assets in this slice.
- Decision: Permanently forbidden until a later named plan explicitly proves otherwise: provider calls, finance writes, source mutation, payment instructions, certification/delivery, external communications, generated finance advice, uncited model output, autonomous action, and app-submission artifacts before a submission plan.
- Decision: FP-0113 should be an OAuth/security contract foundation rather than remote MCP implementation. User identity, token lifecycle, org/RBAC, `companyKey` binding, redaction, and fail-closed token refusal are the riskiest prerequisites; public host work should follow those contracts instead of preceding them.

## Context and Orientation

The shipped local route path remains `/mcp`. FP-0107 owns the local Fastify route adapter shell. FP-0108 owns read-only evidence dispatch contracts. FP-0109 owns the local injected evidence dispatch adapter. FP-0110 owns planning for default local dispatch enablement. FP-0111 owns explicit app-construction wiring that lets a supplied read-only MCP endpoint service reach the existing route while default `buildApp()` remains fail-closed.

FP-0112 does not alter that stack. It creates a readiness master plan and updates proof gates so exactly one FP-0112 path is allowed while FP-0113 remains absent. The proof bridge must continue to prove no route behavior change, no remote MCP deployment, no OAuth/token/session implementation, no Apps SDK resource implementation, no app submission, no DB query implementation, no schema/migration work, no OpenAI API/model call, no provider/external call, no source mutation, no finance write, and no public assets/submission artifacts from FP-0112.

Official read-only research used:

- OpenAI Apps SDK, "Apps SDK" home and navigation: used to confirm the current Apps SDK build/deploy/auth/submission surface names and that MCP apps in ChatGPT are a distinct public platform path.
- OpenAI Apps SDK, "Build your MCP server": used to confirm the MCP server/tool/resource framing, UI metadata/CSP/domain concepts, and future server exposure context.
- OpenAI Apps SDK, "Authentication": used to confirm customer-specific data should authenticate users and authenticated MCP servers are expected to implement OAuth 2.1 conforming to the MCP authorization spec.
- OpenAI Apps SDK, "Security & Privacy": used to confirm least-privilege, consent, validation, logging/redaction, no-token/no-secret component posture, and data minimization context for future public surfaces.
- OpenAI Apps SDK, "Submit and maintain your app": used to confirm submission needs server details, OAuth credentials if selected, app metadata, screenshots, test prompts/responses, and review fields; FP-0112 therefore keeps submission assets future-only.
- MCP specification, "Transports": used to confirm Streamable HTTP context, Origin validation, localhost-only local binding guidance, proper authentication for connections, and GET/SSE transport posture.
- MCP specification, "Tools": used to confirm `tools/list` and `tools/call` stay the relevant read-only tool surface and that structured tool result handling remains the future dispatch shape.
- MCP specification, "Authorization": used to confirm OAuth 2.1, HTTPS, redirect URI, PKCE, token storage, refresh-token rotation, audience/resource validation, and fail-closed metadata expectations.
- MCP security best practices, "Security Best Practices": used to confirm token passthrough is forbidden, confused-deputy/session/SSRF risks matter, and public MCP servers must validate tokens instead of treating client-supplied credentials as authority.

No OpenAI Developers docs MCP tool was exposed. No OpenAI Platform key setup, OpenAI API, model call, provider call, Vercel deployment/project tool, GitHub Connector Guard, Figma/design-generation tool, Gmail, Booking, Coursera, Adobe, upload, public asset generation, or dependency install was used.

## Plan of Work

1. Preserve the shipped local route and dispatch boundaries from FP-0107 through FP-0111.
2. Add this single FP-0112 Finance Plan as docs-and-plan plus proof-gate compatibility only.
3. Add a narrow proof-gate bridge that accepts exactly this FP-0112 path and keeps FP-0113 absent.
4. Refresh directly stale active docs and plugin usage notes to point at FP-0112 as the current shipped planning boundary after validation.
5. Run the full proof ladder, focused domain/control-plane specs, lint, typecheck, test, and current reproducibility command.

## Concrete Steps

- Create `plans/FP-0112-read-only-chatgpt-app-mcp-remote-public-deployment-oauth-readiness-master-plan.md`.
- Add proof fields for `fp0112AbsentOrDocsOnlyRemotePublicMcpOauthReadinessPlanVerified`, `fp0113Absent`, `remotePublicMcpOauthReadinessPlanBoundaryVerified`, `noRouteBehaviorChangeFromFp0112`, `noRemoteMcpDeploymentFromFp0112`, `noOauthTokenSessionFromFp0112`, `noAppsSdkResourceFromFp0112`, `noAppSubmissionFromFp0112`, `noDbQueriesFromFp0112`, `noSchemaMigrationsFromFp0112`, `noOpenAiApiCallsFromFp0112`, `noProviderExternalCallsFromFp0112`, `noSourceMutationFinanceWriteFromFp0112`, and `noPublicAssetsSubmissionArtifactsFromFp0112`.
- Keep `fp0111DefaultLocalDispatchWiringStillVerified`, `fp0110DefaultDispatchPlanBoundaryStillVerified`, `fp0109AdapterBoundaryStillVerified`, `fp0108DispatchContractsStillVerified`, `fp0107RouteAdapterBoundaryStillVerified`, `fp0106ProtocolEnvelopeBoundaryStillVerified`, and `fp0100PublicSecurityBoundaryStillVerified` logically intact through their current proof names.
- Do not edit `/mcp` route behavior, app construction behavior, endpoint implementation, DB access, schemas, migrations, package scripts, fixtures, datasets, source packs, public assets, OAuth/token/session code, Apps SDK resources, app submission artifacts, OpenAI API/model calls, provider/external calls, source mutation, finance writes, runtime-Codex finance output, or autonomous action.

## Validation and Acceptance

Acceptance requires:

- Exactly one FP-0112 plan exists at the named path.
- No FP-0113 exists.
- FP-0112 is proven docs-and-plan/proof-gate compatibility only.
- `/mcp` route behavior is unchanged.
- Default `buildApp()` remains fail-closed without an explicit read-only MCP endpoint service.
- Explicit app construction dependency still enables local read-only dispatch.
- FP-0110, FP-0109, FP-0108, FP-0107, FP-0106, and FP-0100 boundaries remain verified.
- Public app implementation and public app submission remain future-only.

Commands to run:

- `git diff --check`
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
- `pnpm --filter @pocket-cto/domain exec vitest run src/benchmark-community.spec.ts src/read-only-app-mcp.spec.ts src/read-only-app-mcp-descriptor.spec.ts src/read-only-app-mcp-public-security.spec.ts src/read-only-app-mcp-endpoint-architecture.spec.ts src/read-only-app-mcp-endpoint-route-ownership.spec.ts src/read-only-app-mcp-protocol-envelope.spec.ts src/read-only-app-mcp-evidence-tool-dispatch.spec.ts`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/read-only-app-mcp-endpoint/routes.spec.ts src/modules/read-only-app-mcp-endpoint/service.spec.ts src/modules/read-only-app-mcp-endpoint/evidence-dispatcher.spec.ts src/app.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

## Idempotence and Recovery

This slice is idempotent because it adds one plan path and proof-gate compatibility fields only. If validation fails, do not widen scope. Patch only the proof-gate bridge or stale docs on this branch, then rerun the same validation. If local route/dispatch wiring fails, stop and use the smallest corrective slice: FP-0111 local wiring correction, FP-0110 default-dispatch planning proof correction, FP-0109 adapter correction, FP-0107 route adapter correction, or hold remote/public planning until local dispatch wiring can be proven.

Do not recover by adding routes, deployment, OAuth/token/session implementation, Apps SDK resources, app submission assets, DB queries, data files, OpenAI API/model calls, provider calls, external communications, source mutation, finance writes, or FP-0113.

## Artifacts and Notes

- New plan artifact: `plans/FP-0112-read-only-chatgpt-app-mcp-remote-public-deployment-oauth-readiness-master-plan.md`.
- Proof bridge artifacts remain limited to domain proof helpers/specs and existing proof scripts.
- Docs refresh artifacts are limited to directly stale active docs and plugin notes.
- No source evidence, finance source file, raw export, PDF, source snapshot, evidence bundle, finance twin state, CFO wiki compiled artifact, report, provider artifact, public asset, screenshot, listing copy, or app-submission artifact is created or mutated.

## Interfaces and Dependencies

FP-0112 depends on:

- FP-0100 public security boundary contracts.
- FP-0106 protocol envelope/tool-dispatch proof contracts.
- FP-0107 local `/mcp` route adapter shell.
- FP-0108 evidence tool dispatch contracts.
- FP-0109 local injected read-only evidence dispatch adapter.
- FP-0110 default local evidence dispatch enablement planning.
- FP-0111 explicit app-construction local dispatch wiring.
- Official OpenAI Apps SDK and MCP protocol/security docs as read-only planning context.

No new runtime interface is introduced. No route, endpoint, schema, migration, package script, OpenAI API/model integration, provider integration, deployment host, OAuth provider, token store, session store, Apps SDK iframe/resource, public asset, or app-submission interface is added.

## Outcomes & Retrospective

FP-0112 delivered a single readiness master plan and proof-gate bridge that lets the repo name the next risk boundary without crossing it. The plan says remote/public MCP and OAuth contract implementation may start only as a future named Finance Plan with narrow proof contracts, not as deployment or public app behavior.

Closeout verdict: FP-0112 is docs-and-plan plus proof-gate compatibility only. The shipped local `/mcp` route and FP-0111 explicit local dispatch wiring remain intact; the current local route must not be exposed remotely as-is; public app implementation and public app submission remain future-only; no FP-0113 was created.

Recommended next slice: FP-0113 should be a local/proof-only OAuth/security contract foundation covering user identity, admin consent, org boundary, RBAC, scope/audience validation, refresh-token/offline-access policy, token storage/redaction/revocation, missing/expired/malformed token refusal, and authenticated `companyKey` binding. Remote MCP host implementation and public ChatGPT App submission should wait until those contracts are accepted.
