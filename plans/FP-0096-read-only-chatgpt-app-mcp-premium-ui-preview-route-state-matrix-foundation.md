# FP-0096 - Read-only ChatGPT App MCP Premium UI Preview Route State Matrix Foundation

## Purpose / Big Picture

Target phase: `V2P`.

Exact slice: `V2P-read-only-chatgpt-app-mcp-premium-ui-preview-route-state-matrix-foundation-local-v1`.

Status: shipped local/proof-only/read-only premium UI preview route state-matrix implementation slice, created and closed 2026-05-10.

FP-0096 is the first implementation slice after shipped FP-0095. It extends the existing local read-only preview route at `apps/web/app/read-only-app-mcp-preview/page.tsx` with a state matrix using shipped FP-0091 and FP-0092 components plus in-memory synthetic contract-shaped examples only.

This slice writes actual route/UI code. This slice still does not implement a public ChatGPT App. This slice does not implement Apps SDK iframe/UI resources. This slice does not add a second app route. This slice does not add API endpoints, web API routes, backend/control-plane routes, remote MCP, OAuth, app submission, OpenAI API/model calls, deployment, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, sample data, public source packs, screenshots, generated images, public listing assets, app-submission assets, or public app artifacts.

FP-0096 does not add OAuth. FP-0096 does not add app submission. FP-0096 does not add OpenAI API/model calls. FP-0096 adds no API endpoints, no backend route, no public assets, no app-submission assets, and no generated images.

The user-visible purpose is local observability only: a human can view answer, refusal, empty, loading, error, and privacy/no-runtime postures in one local route before any public app work. The route must not fetch data, call APIs, POST, render forms, render buttons, create upload controls, use server actions, or expose mutation controls.

Authority model remains unchanged:

- raw sources remain authoritative for document claims
- the Finance Twin remains authoritative for structured finance facts
- the CFO Wiki remains compiled and derived
- EvidenceIndex remains the source anchor, document map, evidence card, source coverage, freshness, and limitation layer
- V2C tools remain local/internal read-only evidence contracts
- V2E remains local/internal proof-only bounded orchestration
- V2F remains docs/proof-only benchmark/community contracts with no datasets or real finance data
- V2G remains local proof-only read-only ChatGPT App/MCP contracts, descriptors, and response envelopes
- FP-0091 remains the shipped local/proof-only/read-only component foundation
- FP-0092 remains the shipped local/proof-only/read-only composition/accessibility foundation
- FP-0094 remains the shipped single local/proof-only/read-only preview route foundation
- FP-0095 remains the shipped docs-only state-matrix and visual QA readiness plan

GitHub connector product behavior is explicitly out of scope. Routine `git`, `gh`, push, and PR operations for this repository do not invoke GitHub Connector Guard.

Replay and evidence-bundle implications: this slice creates no mission state transition, ingest action, report action, approval, durable product finance output, source mutation, Finance Twin write, CFO Wiki write, evidence bundle, provider job, certification record, delivery record, endpoint, backend route, or app/MCP runtime behavior. The route displays synthetic in-memory proof objects only and is not source truth.

## Progress

- [x] 2026-05-10T11:44:27Z - Invoked the requested Pocket CFO operator skills: Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor.
- [x] 2026-05-10T11:44:27Z - Confirmed GitHub Connector Guard is out of scope because GitHub connector product behavior is not part of this slice.
- [x] 2026-05-10T11:44:27Z - Ran preflight against fetched `origin/main` on branch `codex/v2p-read-only-chatgpt-app-mcp-premium-ui-preview-route-state-matrix-foundation-local-v1`; the repo started clean, `HEAD` matched `origin/main`, GitHub auth/repo access worked, PR #257 and PR #256 were merged, Docker Postgres/MinIO were available, FP-0095 existed, FP-0096 was absent, FP-0097 was absent, the single FP-0094 preview route existed with noindex/nofollow/noarchive metadata, and required proof tools existed.
- [x] 2026-05-10T11:44:27Z - Read required active docs, shipped FP-0092 through FP-0095 records, plugin inventory, package metadata, existing preview route, read-only app/MCP components, app/web route and lib inventory, V2F/V2G domain contracts, proof tools, and active boundary docs before edits.
- [x] 2026-05-10T11:44:27Z - Ran baseline proof gates before edits; all seven required proof commands passed and proved `fp0096Absent: true`, which is expected pre-edit state before this local preview route state-matrix successor.
- [x] 2026-05-10T11:44:27Z - Created this FP-0096 plan as the only allowed FP-0096 file.
- [x] 2026-05-10T13:05:00Z - Extended the existing local preview route with the synthetic state matrix while preserving static noindex/nofollow/noarchive metadata and adding no second route, fetch, POST, form, button, server action, upload, endpoint, or public app behavior.
- [x] 2026-05-10T13:05:00Z - Updated focused route tests and the minimum V2F/V2G proof-gate bridge so the exact FP-0096 local state-matrix foundation is accepted while FP-0097 remains absent.
- [x] 2026-05-10T13:05:00Z - Refreshed directly stale active docs and `plugins.md` to mark FP-0095 shipped and FP-0096 active before validation.
- [x] 2026-05-10T13:05:00Z - Ran focused validation: all seven proof tools passed, `pnpm --filter @pocket-cto/web exec vitest run` passed, `pnpm --filter @pocket-cto/web typecheck` passed, and focused domain specs passed after narrowing a test helper path to the repo root.
- [x] 2026-05-10T13:05:00Z - Ran strict same-branch QA over the route directory, changed-file list, FP-0096/FP-0097 plan names, API/backend/public asset paths, and route source; no forbidden route, API/backend route, public asset, FP-0097, control, transport, OpenAI API/model, OAuth, app-submission, or mutation implementation was found.
- [x] 2026-05-10T13:21:00Z - Ran final validation before closeout: `git diff --check`, all seven proof tools, web vitest/typecheck, focused domain specs, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current` passed.
- [x] 2026-05-10T13:21:00Z - Closed this plan as shipped and refreshed directly stale active docs to mark FP-0096 shipped.
- [x] 2026-05-10T13:25:00Z - Published commit `72cd251649f617e5e4aec926572e1916e895e4fc`, pushed branch `codex/v2p-read-only-chatgpt-app-mcp-premium-ui-preview-route-state-matrix-foundation-local-v1`, and opened PR #258.
- [x] 2026-05-10T13:45:00Z - Ran same-branch QA over PR #258 and found only this stale closeout wording; no runtime, route, app/MCP, source, finance-write, public-asset, or FP-0097 scope leak was found.

## Surprises & Discoveries

Baseline V2F/V2G gates still prove FP-0096 absence after shipped FP-0095. That is correct pre-edit behavior. This slice must replace the hard FP-0096 absence posture with an exact FP-0096 local preview route state-matrix foundation boundary while keeping FP-0097 absent.

FP-0095 still carried "ready for PR review" wording after PR #257 merged. This slice may apply a tiny shipped-state wording polish so FP-0095 remains a shipped docs-only readiness record rather than the active implementation plan.

The existing read-only app/MCP UI components already support answer, missing citation, unsupported evidence, stale evidence, prompt-injection, raw full-file dump, unsafe action, empty evidence, loading evidence, error/unsupported, privacy, and no-runtime states. The component type union does not expose a first-class `conflicting_evidence` render reason, although the V2G proof posture records conflicting evidence as fail-closed. FP-0096 should not widen the component contract just to force that state into the route; it should record the current support boundary in the matrix.

Official web/plugin research used in this slice:

- No new official web research has been used.
- No OpenAI Developers tool has been used to create API keys, call OpenAI APIs, call models, or widen app/runtime scope.
- No OpenAI API key has been created or used.
- No OpenAI API/model call has been made.
- No Build Web Apps, Codex Security, Figma, app-submission, design-generation, artifact-upload, dependency-installation, screenshot-generation, image-generation, public-asset, or upload plugin workflow has been used.

## Decision Log

Decision: FP-0096 is safe to create as a local route implementation slice.
Rationale: PR #257 and PR #256 are merged, FP-0095 is shipped as docs-only state-matrix readiness, FP-0094 is shipped as the single local preview route foundation, required proof gates passed before edits, and the implementation can stay one route extension plus tests.

Decision: use the existing route at `apps/web/app/read-only-app-mcp-preview/page.tsx`.
Rationale: FP-0094 already owns the local preview route. Adding another route would weaken the local-only route boundary.

Decision: use in-memory synthetic contract-shaped examples only.
Rationale: this route is not a source registry, benchmark pack, fixture, sample data, public demo, or runtime app surface.

Decision: no replay event is added.
Rationale: this slice changes a local read-only preview page, tests, docs, and proof-gate validation only. It does not change product runtime finance state, mission state, source state, reports, approvals, or evidence artifacts.

## Context and Orientation

FP-0091 shipped the first local/proof-only/read-only premium UI component foundation under `apps/web/components/read-only-app-mcp/**`. FP-0092 shipped the local/proof-only/read-only composition/accessibility hardening layer over those components. FP-0093 shipped the docs-only local preview-route master-plan. FP-0094 shipped exactly one local preview route at `/read-only-app-mcp-preview` and later added noindex/noarchive route metadata during post-merge QA. FP-0095 shipped docs-only state-matrix and visual QA readiness.

FP-0096 implements the first local preview route state-matrix foundation. It is still not a public ChatGPT App, Apps SDK iframe/UI resource, remote MCP server, OAuth flow, app submission, endpoint, provider integration, certification path, deployment path, external communication, source mutation, finance write, generated product prose surface, runtime-Codex finance output, or autonomous action.

## Plan of Work

Allowed files for this slice:

- `plans/FP-0096-read-only-chatgpt-app-mcp-premium-ui-preview-route-state-matrix-foundation.md`
- `plans/FP-0095-read-only-chatgpt-app-mcp-premium-ui-preview-route-state-matrix-master-plan.md` only for tiny shipped-state wording polish if directly stale
- `apps/web/app/read-only-app-mcp-preview/page.tsx`
- `apps/web/app/read-only-app-mcp-preview/page.spec.tsx`
- `apps/web/components/read-only-app-mcp/**` only if a tiny local component/helper is necessary inside the existing component scope
- `apps/web/components/read-only-app-mcp/**/*.spec.tsx` only for directly related proof coverage
- `apps/web/lib/read-only-app-mcp-ui.ts` only if a tiny pure helper is required
- `packages/domain/src/read-only-app-mcp*.ts` only for proof-gate fields or direct proof compatibility
- `packages/domain/src/benchmark-community*.ts` only for proof-gate fields or direct proof compatibility
- `packages/domain/src/read-only-app-mcp*.spec.ts` only for proof-gate tests
- `packages/domain/src/benchmark-community*.spec.ts` only for proof-gate tests
- `tools/read-only-mcp-descriptor-response-envelope-proof.mjs`
- `tools/read-only-chatgpt-app-mcp-proof.mjs`
- `tools/benchmark-community-pack-proof.mjs`
- `plugins.md` and directly stale active docs only if required

Forbidden behavior:

- no second app route
- no web API routes
- no backend/control-plane routes
- no endpoints
- no remote MCP server
- no Apps SDK iframe/UI resource registration
- no OAuth
- no app submission
- no schema or migrations
- no package scripts or smoke aliases
- no eval datasets, fixtures, sample data, public demo data, public source packs, or source-pack mutations
- no FP-0097
- no public app implementation
- no OpenAI API/model calls
- no provider/certification/deployment/external communications
- no source mutation
- no finance writes
- no generated product prose or runtime-Codex finance output
- no autonomous action
- no screenshot binaries, generated images, public listing assets, app-submission assets, or public assets

Implementation goals:

- preserve route-level static metadata with `title`, `robots.index=false`, `robots.follow=false`, and `robots.noarchive=true`
- render a local preview route state matrix using shipped FP-0091/FP-0092 components and in-memory synthetic contract-shaped examples only
- include answer state, missing citation refusal, unsupported evidence refusal, stale evidence refusal, prompt-injection warning state, raw full-file dump refusal state, unsafe action refusal state, empty evidence state, loading evidence state, error/unsupported state, privacy/no-runtime boundary state, and current conflicting-evidence support-boundary posture
- preserve answer-state evidence hierarchy: answer/refusal status, evidence cards, citations/source anchors, freshness, limitations, permitted next actions, forbidden actions, privacy/no-runtime boundary
- prove no fetch, POST, forms, buttons/action-looking controls, server actions, API/backend routes, OpenAI API/model calls, OAuth, app submission artifacts, raw full-file dump panels, advice-like CTA copy, screenshot/image/public asset files, public demo/source-pack/fixture/sample data files, `process.env`, or `OPENAI_API_KEY` usage

Proof-gate bridge fields must prove:

- `fp0096AbsentOrLocalPreviewRouteStateMatrixBoundaryVerified`
- `fp0097Absent`
- `localPreviewRouteStateMatrixFoundationVerified`
- `noAdditionalRoutesFromFp0096`
- `noApiRoutesFromFp0096`
- `noBackendRoutesFromFp0096`
- `noEndpointsFromFp0096`
- `noAppsSdkIframeFromFp0096`
- `noOauthSubmissionFromFp0096`
- `noPublicAppImplementationFromFp0096`
- `noOpenAiApiCallsFromFp0096`
- `noSourceMutationFinanceWriteFromFp0096`
- `noScreenshotAssetsFromFp0096`
- `noPublicAssetsFromFp0096`
- `routeMetadataNoIndexBoundaryVerified`

## Concrete Steps

1. Run preflight and baseline proof gates.
2. Confirm baseline proof gates prove FP-0096 absence and treat that as expected pre-edit state.
3. Create this plan as the only FP-0096 file.
4. Apply the tiny FP-0095 shipped-state wording polish if directly stale.
5. Extend the existing local preview route with state-matrix sections using synthetic in-memory examples only.
6. Update focused route tests.
7. Update minimal V2F/V2G proof schemas, builders, proof tools, and focused specs so the exact FP-0096 route state-matrix foundation is accepted while FP-0097 remains absent.
8. Refresh only directly stale active docs and `plugins.md` if required.
9. Run focused validation.
10. Run strict same-branch QA over changed files and patch only this slice if needed.
11. Run final validation.
12. Mark this FP-0096 route state-matrix foundation shipped and update directly stale active docs.
13. If closeout docs are edited after validation, rerun the required post-closeout validation.
14. Commit exactly once, push the requested branch, and open the requested PR.

## Validation and Acceptance

Baseline proof gates run before edits:

```bash
pnpm exec tsx tools/read-only-mcp-descriptor-response-envelope-proof.mjs
pnpm exec tsx tools/read-only-chatgpt-app-mcp-proof.mjs
pnpm exec tsx tools/benchmark-community-pack-proof.mjs
pnpm exec tsx tools/bounded-llm-orchestration-proof.mjs
pnpm exec tsx tools/read-only-evidence-app-proof.mjs
pnpm exec tsx tools/document-precision-foundation-proof.mjs
pnpm exec tsx tools/evidence-index-foundation-proof.mjs
```

Required focused validation after edits:

```bash
pnpm exec tsx tools/read-only-mcp-descriptor-response-envelope-proof.mjs
pnpm exec tsx tools/read-only-chatgpt-app-mcp-proof.mjs
pnpm exec tsx tools/benchmark-community-pack-proof.mjs
pnpm exec tsx tools/bounded-llm-orchestration-proof.mjs
pnpm exec tsx tools/read-only-evidence-app-proof.mjs
pnpm exec tsx tools/document-precision-foundation-proof.mjs
pnpm exec tsx tools/evidence-index-foundation-proof.mjs
pnpm --filter @pocket-cto/web exec vitest run
pnpm --filter @pocket-cto/web typecheck
pnpm --filter @pocket-cto/domain exec vitest run src/benchmark-community.spec.ts src/read-only-app-mcp.spec.ts src/read-only-app-mcp-descriptor.spec.ts
```

Strict same-branch QA:

- Confirm exactly one app route exists for this preview route and no additional app routes were added.
- Confirm no API/backend route was added.
- Confirm no forms, buttons, POST, fetch, server actions, uploads, forbidden action controls, raw-dump panels, advice-like CTA copy, screenshots, images, app-submission assets, public assets, OpenAI API/model calls, OAuth, or app submission.
- Confirm no FP-0097.
- Patch on this same branch if QA finds a defect, then rerun required validation.

Required final validation:

```bash
git diff --check
pnpm exec tsx tools/read-only-mcp-descriptor-response-envelope-proof.mjs
pnpm exec tsx tools/read-only-chatgpt-app-mcp-proof.mjs
pnpm exec tsx tools/benchmark-community-pack-proof.mjs
pnpm exec tsx tools/bounded-llm-orchestration-proof.mjs
pnpm exec tsx tools/read-only-evidence-app-proof.mjs
pnpm exec tsx tools/document-precision-foundation-proof.mjs
pnpm exec tsx tools/evidence-index-foundation-proof.mjs
pnpm --filter @pocket-cto/web exec vitest run
pnpm --filter @pocket-cto/web typecheck
pnpm --filter @pocket-cto/domain exec vitest run src/benchmark-community.spec.ts src/read-only-app-mcp.spec.ts src/read-only-app-mcp-descriptor.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Acceptance evidence:

- exactly one FP-0096 file exists at `plans/FP-0096-read-only-chatgpt-app-mcp-premium-ui-preview-route-state-matrix-foundation.md`
- FP-0097 remains absent
- exactly one local preview route remains at `apps/web/app/read-only-app-mcp-preview/page.tsx`
- no adjacent route/API route exists for this preview route
- route metadata preserves noindex/nofollow/noarchive
- route renders the required state matrix with synthetic in-memory examples only
- proof gates accept only this local read-only preview route state-matrix foundation
- existing FP-0095 docs-only boundary remains intact
- existing FP-0094 local preview route foundation boundary remains intact
- existing FP-0092 and FP-0091 local UI boundaries remain intact
- public app implementation and public app submission remain future-only

## Idempotence and Recovery

Rerunning this slice should find this exact FP-0096 file and update it rather than creating another FP-0096 or FP-0097.

If proof gates fail because FP-0096 is present, patch only the proof-gate bridge so the exact local preview route state-matrix foundation is accepted. Do not widen into endpoint implementation, public app, Apps SDK iframe/UI resources, OAuth, submission, remote MCP, provider, deployment, OpenAI API/model, source mutation, or finance-write behavior.

If route validation fails, patch only `apps/web/app/read-only-app-mcp-preview/page.tsx`, `apps/web/app/read-only-app-mcp-preview/page.spec.tsx`, or the minimum component/proof bridge that owns the failure.

If validation fails after a correction, report the exact failing command and recommend the smallest safer corrective slice:

- FP-0096 route state-matrix boundary correction
- FP-0095 proof-boundary correction
- FP-0094 route boundary correction
- FP-0092 composition/accessibility correction
- hold public app work until local UI boundaries can be proven

## Artifacts and Notes

This plan records no new source files, sample data, fixtures, eval datasets, screenshots, generated images, public listing assets, app submission materials, app metadata, OAuth material, endpoints, provider credentials, deployment artifacts, real finance data, or public source packs.

Route examples are synthetic proof objects and not finance source truth.

## Interfaces and Dependencies

Runtime interfaces changed by this slice:

- one existing local Next.js route page at `apps/web/app/read-only-app-mcp-preview/page.tsx`

Runtime interfaces not changed by this slice:

- no web API routes
- no backend/control-plane routes
- no endpoints
- no MCP server runtime
- no Apps SDK resources
- no OAuth surface
- no app submission surface
- no schema, migration, package script, smoke alias, eval, fixture, sample data, or source-pack interface

Dependencies:

- existing FP-0091/FP-0092 read-only app/MCP UI components
- existing V2F/V2G proof-gate contracts
- existing local validation commands

No new environment variables are added.

## Outcomes & Retrospective

Outcome: shipped and QA-corrected for documentation freshness only. FP-0096 remains a local/proof-only/read-only state-matrix implementation on the existing preview route only.

Validation outcome: final implementation validation passed before publication; same-branch QA validation is rerun after this documentation freshness correction.

Scope outcome must remain: local/proof-only/read-only preview route state-matrix foundation only; no second app route, API route, backend route, endpoint, remote MCP server, Apps SDK iframe/UI resource registration, OAuth, app submission, schema, migration, package script, smoke alias, eval dataset, fixture, sample data, public demo data, public source pack, OpenAI API/model call, vector/file-search, OCR, PageIndex, provider/certification/delivery/deployment, external communication, source mutation, finance write, generated product prose, runtime-Codex finance output, autonomous action, screenshot binary, generated image asset, public asset, FP-0097, or public app implementation.
