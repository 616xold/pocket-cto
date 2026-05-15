# FP-0115 read-only ChatGPT App MCP remote host implementation sequencing master plan

## Purpose

FP-0115 is a docs-and-plan plus proof-gate compatibility slice for remote MCP host implementation sequencing and provider/host readiness after FP-0114. It decides what must be proven before a later implementation plan may open remote MCP host work.

FP-0115 does not implement a remote MCP host. It does not add deployment config. It does not expose the local `/mcp` route remotely. It does not implement OAuth. It does not implement token/session. It does not implement auth middleware. It does not change route behavior. It does not add any new route path. It does not add Apps SDK resources. It does not add public app behavior, app submission, screenshots, public assets, listing copy, generated public prose, DB queries, schemas, migrations, package scripts, fixtures, datasets, source packs, provider calls, OpenAI API/model calls, source mutation, finance writes, generated finance advice, runtime-Codex finance output, external communications, or autonomous action.

Public app submission remains future-only. FP-0116 remains absent.

## Progress

- [x] 2026-05-15T17:28:24Z: Confirmed the branch is `codex/v2ai-read-only-chatgpt-app-mcp-remote-host-implementation-sequencing-master-plan-local-v1`, PR #281 / FP-0114 is merged into current branch history, FP-0115 and FP-0116 were absent before this slice, and the working tree was clean.
- [x] 2026-05-15T17:28:24Z: Ran the baseline proof ladder and focused route/domain specs before editing; all required preflight proof tools passed.
- [x] 2026-05-15T17:28:24Z: Used official MCP and OpenAI Apps SDK docs, plus read-only Vercel documentation search as future provider context only; no provider, project, deployment, OpenAI API/model, or key setup tools were used.
- [x] 2026-05-15T17:28:24Z: Created FP-0115 as the single docs-only remote MCP host implementation sequencing plan and added proof-gate compatibility for exactly this path while keeping FP-0116 absent.
- [x] 2026-05-15T17:28:24Z: Added same-branch FP-0114 proof-durability polish through a durable repository-inventory scan for remote runtime/deployment-config/public-surface absence.
- [x] 2026-05-15T17:57:04Z: Ran focused validation, strict same-branch QA, full validation, and `pnpm ci:repro:current`; all passed before this closeout update. Because this closeout edits the plan, the required post-closeout validation rerun will be performed before the single commit, push, and PR.
- [x] 2026-05-15T18:06:48Z: Same-branch QA found and corrected one proof-durability gap so simulated public listing/app-submission markdown paths now fail the repository-inventory scan before any general markdown allowance. No route, runtime, deployment, OAuth/session/auth, Apps SDK, app-submission, DB, package-script, public-asset, provider, OpenAI/model, source, or finance behavior changed.

## Surprises / Discoveries

- OpenAI Developers read-only docs tooling was not exposed as a usable documentation connector in this thread, so official web docs were used for OpenAI Apps SDK context.
- Vercel documentation search was available and used only for future host/provider comparison context. No Vercel project, deployment, environment, or account tools were used.
- FP-0114 proof durability needed a repository-inventory scan because branch-diff-only checks are not enough after merge.
- Same-branch QA showed the durable scan needed to reject public listing/app-submission markdown paths before allowing general markdown documentation paths.

## Decision Log

- Decision: Remote MCP host implementation cannot start from current repo truth. FP-0113 and FP-0114 provide local/proof-only contracts, not deployable OAuth/session/auth middleware, a named host owner, canonical public resource URI, deployment config, or public exposure proof.
- Decision: The current local `/mcp` route can not be exposed remotely as-is. The local route remains a local Fastify route adapter and proof surface only.
- Decision: A future host should not simply reuse the existing `apps/control-plane` Fastify route as public infrastructure. The preferred future lane is a public gateway or separate remote MCP server package that wraps the existing read-only service contracts after OAuth, token/session, auth middleware, Origin/CORS/CSP, logging, rate-limit, rollback, and provider gates are proven.
- Decision: Future host owner remains unresolved. `apps/control-plane` stays the local route owner. A later plan must choose whether public host ownership lives in `apps/control-plane`, a separate package, or a gateway/runtime boundary.
- Decision: The future host provider must remain provider-neutral. No provider is named by FP-0115.
- Decision: The canonical public path remains `/mcp`, but exact canonical resource URI is not implemented. A later implementation plan must prove the exact HTTPS origin, resource/audience URI, and public `/mcp` path before deployment config is allowed.
- Decision: For the single-company V2 boundary, prefer one universal MCP server URL with authenticated user/org/company binding over workspace or tenant template URLs. Do not put `companyKey` in the public URL authority model.
- Decision: `companyKey` remains a requested selector only. FP-0113 authenticated user/org/company binding gates every future remote exposure.
- Decision: Deployment config may be added only after a later Finance Plan proves host owner, provider, exact canonical resource URI, HTTPS/TLS, Origin/CORS/CSP, auth, logging redaction, rate-limit/abuse controls, observability/audit correlation, rollback/incident response, no-real-finance-data posture, and durable proof tooling.
- Decision: OAuth/token/session/auth middleware implementation may start only after a later Finance Plan turns FP-0113 contracts into implementation scope with token audience/resource validation, no token passthrough, session storage/redaction, revocation/rotation/failure modes, company binding, and route fail-closed tests.
- Decision: GET SSE streaming, health/readiness endpoints, and public observability endpoints stay future-only until transport, exposure, auth, privacy, abuse-control, and logging proof tools exist.
- Decision: Apps SDK resources, public app behavior, listing assets, screenshots, app submission, generated public prose, and public assets stay future-only until a dedicated submission/readiness plan exists.
- Decision: No real finance data, public demo data, source packs, raw dumps, or private finance exposure may appear in future remote-host reviews, fixtures, assets, telemetry, logs, screenshots, or submission materials.
- Decision: Public remote host implementation needs proof tools for no route behavior change, no new route path, no remote runtime drift, no deployment config drift, canonical URI, HTTPS/TLS, Origin validation, CORS, CSP, rate limits, abuse controls, logging redaction, observability/audit correlation, rollback, auth fail-closed behavior, no OpenAI API/model calls, no provider calls, no source mutation, and no finance writes.
- Decision: FP-0116, if opened later, may only be a narrow prerequisite implementation or proof-correction slice selected from the gates above. It must not combine remote deployment, OAuth/session implementation, Apps SDK resources, and app submission in one slice.
- Decision: Permanently forbidden before an explicit named submission/execution plan: provider calls, finance writes, source mutation, payment instructions, certification or delivery, external communications, generated finance advice, uncited model output, autonomous action, and app-submission artifacts.

## Candidate Host/Provider Analysis

Candidate host/provider analysis:

- Existing `apps/control-plane` Fastify host: preserves current route/service boundaries and local proof coverage, but must remain local-only for now. It lacks public auth middleware, token/session runtime, stable public origin, provider hardening, and deployment proof. Not remotely exposable as-is.
- Separate future MCP server package: strongest modular boundary for public transport, OAuth/session/auth middleware, provider config, deployment proof, and public exposure tests. It can depend on domain contracts and a narrow service interface without turning the control plane into a public app host. This is the leading implementation candidate after prerequisites are green.
- Vercel or similar serverless/edge hosting: viable future provider class only after exact transport, streaming/SSE expectations, request duration, logging, secret handling, origin/CORS/CSP, rollback, and public resource URI are proven. Provider remains unresolved and no Vercel project/deployment/config work is authorized.
- Reverse-proxy or tunnel-only preview for development: useful only as a temporary local development diagnostic after auth and origin gates exist. It must never become production proof, public submission proof, or a route-exposure shortcut.
- Unresolved / hold: current decision is hold. Remote implementation should wait until the proof gates in this plan are satisfied.

## Official Research Ledger

- MCP specification 2025-11-25, Transports: used for Streamable HTTP, single MCP endpoint, POST/GET/SSE compatibility, Origin validation, and local-vs-remote transport context.
- MCP specification 2025-11-25, Authorization: used for OAuth/resource/audience readiness, canonical resource URI, and token validation prerequisites.
- MCP Security Best Practices: used for confused-deputy, token passthrough, SSRF, session hijacking, Origin, least-privilege, and fail-closed security context.
- MCP specification 2025-11-25, Tools: used only as read-only tool contract context for future public tool exposure.
- OpenAI Apps SDK, Deploy your app: used for future hosted MCP server/deployment readiness context only.
- OpenAI Apps SDK, Connect from ChatGPT: used for future public MCP server URL and ChatGPT connection prerequisites only.
- OpenAI Apps SDK, Security & Privacy: used for future CSP, data handling, privacy, auth, and least-privilege planning context.
- OpenAI Apps SDK, Test your integration: used only as future validation context; no test integration or public app runtime was created.
- OpenAI Apps SDK, Submit and maintain your app plus app submission guidelines: used only as future submission blocker context; no submission assets, listing copy, screenshots, generated public prose, or app materials were created.
- Vercel documentation search: used only for future provider/host comparison around serverless function config, response streaming, request logging, and deployment-provider constraints. No Vercel project/deployment tools were used and no provider was selected.

## Implementation Gates Before Remote Host Work

Remote MCP host implementation may start only when all of these are true:

- FP-0113 OAuth/security contracts have implementation scope in a later plan, including user/org/company binding, token audience/resource validation, token passthrough prohibition, fail-closed missing/invalid token behavior, token/session storage and redaction, revocation/rotation, and companyKey selector demotion.
- FP-0114 remote host readiness contracts remain green and the durable repository-inventory proof confirms no unauthorized remote runtime, deployment config, public host config, Apps SDK resource runtime, app-submission assets, public assets, OpenAI API/model/client/key usage, provider calls, source mutation, or finance writes.
- Exact canonical MCP resource URI is named and proven as an HTTPS URI with no query string or fragment.
- Public `/mcp` path requirements are proven without adding route expansion or changing local route behavior.
- Stable HTTPS/TLS, DNS trust model, Origin validation, CORS allowlist, CSP/resource-domain policy, rate-limit/abuse controls, logging redaction, observability/audit correlation, rollback/incident response, and exposure-disable controls are all in proof tools.
- No-real-finance-data, no-public-demo-data, no source packs, no raw dumps, no private finance-data exposure, no public app assets, and no submission artifacts are preserved.
- Focused route/service/dispatcher/app-wiring specs still prove default `buildApp()` fails closed without explicit app construction dependency and explicit dependency injection enables local read-only dispatch only.

## Scope Controls

Allowed in FP-0115:

- This exact plan file.
- Minimal proof-gate compatibility fields/helpers/specs.
- Same-branch FP-0114 proof-durability polish.
- Directly stale active-doc and plugin docs refresh.

Forbidden in FP-0115:

- Route behavior changes, new route paths, remote MCP deployment, deployment config, provider execution, OAuth implementation, token/session implementation, auth middleware, Apps SDK resources, public app behavior, app submission, public assets, generated public prose, screenshots, DB queries, schemas, migrations, package scripts, fixtures, datasets, source packs, OpenAI API/model calls, provider calls, external communications, source mutation, finance writes, generated finance advice, runtime-Codex finance output, and autonomous action.

## Validation Ladder

Focused validation:

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

Final validation:

- `git diff --check`
- all focused proof tools above
- all focused specs above
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

## Acceptance

- Exactly one FP-0115 path exists: `plans/FP-0115-read-only-chatgpt-app-mcp-remote-host-implementation-sequencing-master-plan.md`.
- FP-0115 is docs-and-plan/proof-gate only.
- FP-0116 remains absent.
- FP-0114, FP-0113, FP-0112, FP-0111, FP-0109, FP-0108, FP-0107, FP-0106, and FP-0100 boundaries remain intact.
- Current local `/mcp` route behavior remains unchanged and is not remotely exposed as-is.
- Proof tools reject simulated remote MCP runtime, deployment config, and public asset paths.
- Active docs and plugin docs do not imply public deployment, public app submission, OAuth/session/auth implementation, Apps SDK resources, or route expansion has shipped.

## Replay / Evidence Notes

This slice changes planning and proof gates only. It does not ingest sources, mutate raw source files, write finance state, run provider actions, create mission output, release external communications, or create a finance artifact. No replay event is required beyond the plan progress/decision log and validation evidence recorded here.

## Closeout

FP-0115 is closed as a docs-and-plan plus proof-gate compatibility slice. It created exactly one FP-0115 plan, preserved FP-0116 absence, kept `/mcp` route behavior local/proof-only, kept public app submission future-only, and added FP-0114 durable repository-inventory proof polish without adding remote MCP deployment, deployment config, OAuth/token/session/auth middleware, Apps SDK resources, public app behavior, DB work, OpenAI API/model calls, provider calls, source mutation, finance writes, public assets, or autonomous action.

Remaining after this plan is not remote host implementation. The next allowed work is either one narrow FP-0115 proof-gate correction if validation later finds a gap, or a separately named future Finance Plan that first satisfies the prerequisites listed above. Public ChatGPT App submission must wait for a dedicated submission/readiness plan.
