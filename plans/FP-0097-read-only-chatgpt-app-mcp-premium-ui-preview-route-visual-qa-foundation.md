# FP-0097 - Read-only ChatGPT App MCP Premium UI Preview Route Visual QA Foundation

## Purpose / Big Picture

Target phase: `V2Q`.

Exact slice: `V2Q-read-only-chatgpt-app-mcp-premium-ui-preview-route-visual-qa-foundation-local-v1`.

Status: shipped local/proof-only/read-only premium UI preview route visual QA and accessibility hardening slice, created and closed 2026-05-10.

FP-0097 is the first implementation slice after shipped FP-0096. It hardens the existing local read-only preview route at `apps/web/app/read-only-app-mcp-preview/page.tsx` with screenshotless visual QA assertions, accessibility checks, and component-contract polish where required. It uses shipped FP-0091 and FP-0092 components and the shipped FP-0096 state-matrix route only.

This slice writes route, component, and test hardening code. This slice still does not implement a public ChatGPT App. This slice does not implement Apps SDK iframe/UI resources. This slice does not add a second app route. This slice does not add API endpoints, web API routes, backend/control-plane routes, remote MCP, OAuth, app submission, OpenAI API/model calls, deployment, schema, migrations, package scripts, smoke aliases, eval datasets, fixtures, sample data, public source packs, screenshots, generated images, public listing assets, app-submission assets, or public app artifacts.

FP-0097 does not add OAuth. FP-0097 does not add app submission. FP-0097 does not add OpenAI API/model calls. FP-0097 adds no API endpoints, no backend route, no public assets, no app-submission assets, and no generated images.

The user-visible purpose is local visual and accessibility confidence only: a human can inspect one local preview route whose DOM proves typography hierarchy, spacing rhythm, panel hierarchy, responsive structure, labelled status states, and no-action/no-runtime posture before any public app work.

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
- FP-0096 remains the shipped existing-route local state-matrix foundation

GitHub connector product behavior is explicitly out of scope. Routine `git`, `gh`, push, and PR operations for this repository do not invoke GitHub Connector Guard.

Replay and evidence-bundle implications: this slice creates no mission state transition, ingest action, report action, approval, durable product finance output, source mutation, Finance Twin write, CFO Wiki write, evidence bundle, provider job, certification record, delivery record, endpoint, backend route, or app/MCP runtime behavior. The route displays synthetic in-memory proof objects only and is not source truth.

## Progress

- [x] 2026-05-10T12:58:43Z - Invoked the requested Pocket CFO operator skills: Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor.
- [x] 2026-05-10T12:58:43Z - Confirmed GitHub Connector Guard is out of scope because GitHub connector product behavior is not part of this slice.
- [x] 2026-05-10T12:58:43Z - Ran preflight against fetched `origin/main` on branch `codex/v2q-read-only-chatgpt-app-mcp-premium-ui-preview-route-visual-qa-foundation-local-v1`; the repo started clean, `HEAD` matched `origin/main`, GitHub auth/repo access worked, PR #258 was merged, Docker Postgres/MinIO were available, FP-0096 existed and shipped, FP-0097 was absent, FP-0098 was absent, the single FP-0094/FP-0096 preview route existed with noindex/nofollow/noarchive metadata, and required proof tools existed.
- [x] 2026-05-10T12:58:43Z - Read required active docs, shipped FP-0094 through FP-0096 records, plugin inventory, package metadata, existing preview route, read-only app/MCP components, app/web route and lib inventory, V2F/V2G domain contracts, proof tools, and active boundary docs before edits.
- [x] 2026-05-10T12:58:43Z - Ran baseline proof gates before edits; all seven required proof commands passed and proved `fp0097Absent: true`, which is expected pre-edit state before this local preview route visual QA successor.
- [x] 2026-05-10T12:58:43Z - Created this FP-0097 plan as the only allowed FP-0097 file.
- [x] 2026-05-10T14:17:00Z - Implemented local route/component hardening: screenshotless DOM/style visual QA assertions, accessibility assertions, text-labelled state matrix posture, a first-class conflicting-evidence refusal label, and source-export refusal copy that avoids raw-dump-looking panels.
- [x] 2026-05-10T14:18:00Z - Updated the minimum V2F/V2G proof-gate bridge so FP-0097 is accepted only as the existing-route local visual QA/accessibility foundation while FP-0098 remains absent.
- [x] 2026-05-10T14:18:00Z - Ran strict same-branch QA confirming exactly one preview route, no adjacent API/backend route, no forms/buttons/POST/fetch/server actions/uploads/action controls/raw-dump content panels/advice CTAs/screenshots/images/public assets/OpenAI API/model calls/OAuth/app submission, and no FP-0098.
- [x] 2026-05-10T14:23:00Z - Ran final validation through `git diff --check`, all seven proof tools, web vitest/typecheck, focused domain specs, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`; all passed before closeout.
- [x] 2026-05-10T14:23:00Z - Closed FP-0097 as shipped and refreshed only directly stale active docs/plugin notes from active to shipped wording.

## Surprises & Discoveries

Baseline V2F/V2G gates still prove FP-0097 absence after shipped FP-0096. That is correct pre-edit behavior. This slice must replace the hard FP-0097 absence posture with an exact FP-0097 local preview route visual QA and accessibility hardening boundary while keeping FP-0098 absent.

The domain V2G proof posture already records `conflicting_evidence` as fail-closed, while the route-facing UI component reason union inherited from FP-0091/FP-0092 did not expose a first-class conflicting-evidence refusal reason. FP-0097 may add that local read-only component-contract hardening if it stays inside the existing component/route boundary and does not add runtime behavior.

During strict QA, the visible raw-dump refusal title was softened to a source-export refusal label. The internal `raw_full_file_dump_request` contract remains fail-closed, but the rendered local route no longer presents a raw-dump-looking panel.

Official web/plugin research used in this slice:

- No new official web research has been used.
- No OpenAI Developers tool has been used to create API keys, call OpenAI APIs, call models, or widen app/runtime scope.
- No OpenAI API key has been created or used.
- No OpenAI API/model call has been made.
- No Build Web Apps, Codex Security, Figma, app-submission, design-generation, artifact-upload, dependency-installation, screenshot-generation, image-generation, public-asset, or upload plugin workflow has been used.

## Decision Log

Decision: FP-0097 is safe to create as a local visual QA/accessibility implementation slice.
Rationale: PR #258 is merged, FP-0096 is shipped as the existing-route state-matrix foundation, the route has noindex/nofollow/noarchive metadata, required proof gates passed before edits, and the work can stay one route/component hardening plus tests.

Decision: keep exactly one local preview route at `apps/web/app/read-only-app-mcp-preview/page.tsx`.
Rationale: FP-0094 and FP-0096 already own the only local preview route. Adding another route would weaken the local-only boundary.

Decision: use screenshotless visual QA.
Rationale: this slice must not create screenshot binaries, generated images, public assets, app-submission assets, or design exports. DOM, text, class, data-attribute, and inline style assertions are sufficient for this local foundation.

Decision: no replay event is added.
Rationale: this slice changes a local read-only preview page, tests, docs, and proof-gate validation only. It does not change product runtime finance state, mission state, source state, reports, approvals, or evidence artifacts.

Decision: expose conflicting evidence and source-export refusals as visible text labels.
Rationale: state status must not rely on color alone. The internal contract can keep exact refusal reasons while the route uses operator-safe labels that do not imply raw source dumps or runtime action.

## Context and Orientation

FP-0091 shipped the first local/proof-only/read-only premium UI component foundation under `apps/web/components/read-only-app-mcp/**`. FP-0092 shipped the local/proof-only/read-only composition/accessibility hardening layer over those components. FP-0094 shipped exactly one local preview route at `/read-only-app-mcp-preview` and static noindex/nofollow/noarchive metadata. FP-0095 shipped docs-only state-matrix and visual QA readiness. FP-0096 shipped the existing-route local state matrix.

FP-0097 hardens that same local route with route/component visual QA and accessibility proof. It is still not a public ChatGPT App, Apps SDK iframe/UI resource, remote MCP server, OAuth flow, app submission, endpoint, provider integration, certification path, deployment path, external communication, source mutation, finance write, generated product prose surface, runtime-Codex finance output, or autonomous action.

## Plan of Work

Allowed files for this slice:

- `plans/FP-0097-read-only-chatgpt-app-mcp-premium-ui-preview-route-visual-qa-foundation.md`
- `plans/FP-0096-read-only-chatgpt-app-mcp-premium-ui-preview-route-state-matrix-foundation.md` only for tiny shipped-state wording polish if directly stale
- `apps/web/app/read-only-app-mcp-preview/page.tsx`
- `apps/web/app/read-only-app-mcp-preview/page.spec.tsx`
- `apps/web/components/read-only-app-mcp/**`
- `apps/web/components/read-only-app-mcp/**/*.spec.tsx`
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
- no FP-0098
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
- harden screenshotless visual QA assertions for typography hierarchy, spacing rhythm, panel hierarchy, evidence cards appear before citations/source anchors/freshness/limitations/permitted/forbidden/privacy/no-runtime sections, state status labels, no status by color alone, narrow/wide layout posture, and no screenshot/image/public asset files
- harden accessibility assertions for exactly one main landmark, unique section IDs, no duplicate heading IDs, coherent heading order, aria labels for state matrix groups, loading state has aria-busy, refusal/error states include text reason labels, and privacy/no-runtime boundaries are labelled regions or sections
- harden copy assertions against advice-like CTAs, forbidden action prompts, public-launch wording, public demo data claims, and app-submission copy
- harden route source assertions against fetch, POST, forms, buttons/action controls, server actions, API/backend routes, OpenAI API/model calls, `process.env`, `OPENAI_API_KEY`, OAuth, app submission artifacts, raw full-file dump content panels, screenshots, image assets, or public assets
- update the minimum V2F/V2G proof-gate bridge so exactly this FP-0097 local preview route visual QA foundation is accepted while FP-0098 remains absent

Proof-gate bridge fields must prove:

- `fp0097AbsentOrLocalPreviewRouteVisualQaBoundaryVerified`
- `fp0098Absent`
- `localPreviewRouteVisualQaFoundationVerified`
- `noAdditionalRoutesFromFp0097`
- `noApiRoutesFromFp0097`
- `noBackendRoutesFromFp0097`
- `noEndpointsFromFp0097`
- `noAppsSdkIframeFromFp0097`
- `noOauthSubmissionFromFp0097`
- `noPublicAppImplementationFromFp0097`
- `noOpenAiApiCallsFromFp0097`
- `noSourceMutationFinanceWriteFromFp0097`
- `noScreenshotAssetsFromFp0097`
- `noPublicAssetsFromFp0097`
- `routeMetadataNoIndexBoundaryVerified`
- `screenshotlessVisualQaVerified`
- `accessibilityStateMatrixVerified`

## Concrete Steps

1. Run preflight and baseline proof gates.
2. Confirm baseline proof gates prove FP-0097 absence and treat that as expected pre-edit state.
3. Create this plan as the only FP-0097 file.
4. Apply tiny FP-0096 shipped-state wording polish if directly stale.
5. Harden the existing local preview route/component tests for screenshotless visual QA and accessibility.
6. Update minimal V2F/V2G proof schemas, builders, proof tools, and focused specs so the exact FP-0097 route visual QA foundation is accepted while FP-0098 remains absent.
7. Refresh only directly stale active docs and `plugins.md` if required.
8. Run focused validation.
9. Run strict same-branch QA over the route directory, changed-file list, FP-0097/FP-0098 plan names, API/backend/public asset paths, and route source.
10. Run final validation.
11. Mark this FP-0097 route visual QA foundation shipped and update directly stale active docs.
12. If closeout docs are edited after validation, rerun the required post-closeout validation.
13. Commit exactly once, push the requested branch, and open the requested PR.

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
- Confirm no forms, buttons, POST, fetch, server actions, uploads, forbidden action controls, raw-dump content panels, advice-like CTA copy, screenshots, images, app-submission assets, public assets, OpenAI API/model calls, OAuth, or app submission.
- Confirm no FP-0098.
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

Final validation completed on 2026-05-10:

- `git diff --check` passed
- all seven proof tools passed with `fp0097AbsentOrLocalPreviewRouteVisualQaBoundaryVerified`, `fp0098Absent`, `localPreviewRouteVisualQaFoundationVerified`, `routeMetadataNoIndexBoundaryVerified`, `screenshotlessVisualQaVerified`, and `accessibilityStateMatrixVerified` true
- `pnpm --filter @pocket-cto/web exec vitest run` passed: 31 files, 165 tests
- `pnpm --filter @pocket-cto/web typecheck` passed
- `pnpm --filter @pocket-cto/domain exec vitest run src/benchmark-community.spec.ts src/read-only-app-mcp.spec.ts src/read-only-app-mcp-descriptor.spec.ts` passed: 3 files, 25 tests
- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test` passed
- `pnpm ci:repro:current` passed, including static build, integration DB tests, and clean-tree checks in a temporary worktree

Acceptance evidence:

- exactly one FP-0097 file exists at `plans/FP-0097-read-only-chatgpt-app-mcp-premium-ui-preview-route-visual-qa-foundation.md`
- FP-0098 remains absent
- exactly one local preview route remains at `apps/web/app/read-only-app-mcp-preview/page.tsx`
- no adjacent route/API route exists for this preview route
- route metadata preserves noindex/nofollow/noarchive
- route and component tests prove screenshotless visual QA and accessibility posture through DOM/text/style/data-attribute assertions
- proof gates accept only this local read-only preview route visual QA foundation
- existing FP-0096 route state-matrix boundary remains intact
- existing FP-0095 docs-only boundary remains intact
- existing FP-0094 local preview route foundation boundary remains intact
- existing FP-0092 and FP-0091 local UI boundaries remain intact
- public app implementation and public app submission remain future-only

## Idempotence and Recovery

Rerunning this slice should find this exact FP-0097 file and update it rather than creating another FP-0097 or FP-0098.

If proof gates fail because FP-0097 is present, patch only the proof-gate bridge so the exact local preview route visual QA/accessibility foundation is accepted. Do not widen into endpoint implementation, public app, Apps SDK iframe/UI resources, OAuth, submission, remote MCP, provider, deployment, OpenAI API/model, source mutation, or finance-write behavior.

If route validation fails, patch only `apps/web/app/read-only-app-mcp-preview/page.tsx`, `apps/web/app/read-only-app-mcp-preview/page.spec.tsx`, or the minimum component/proof bridge that owns the failure.

If validation fails after a correction, report the exact failing command and recommend the smallest safer corrective slice:

- FP-0097 route visual QA boundary correction
- FP-0096 state-matrix route correction
- FP-0094 route boundary correction
- FP-0092 composition/accessibility correction
- hold public app work until local UI visual QA boundaries can be proven

## Artifacts and Notes

No screenshots, generated images, public assets, app-submission assets, fixture files, sample data, eval datasets, source packs, migrations, package scripts, smoke aliases, environment variables, API routes, backend routes, endpoints, OpenAI API calls, or model calls are planned.

The only route artifact remains the existing local Next.js page and its focused tests.

## Interfaces and Dependencies

Runtime dependencies are unchanged.

Internal package names remain `@pocket-cto/*`; no package-scope rename is part of this slice.

The route depends only on local React components and in-memory synthetic contract-shaped examples. It does not fetch data, call APIs, use server actions, read environment variables, use `OPENAI_API_KEY`, or start app/MCP runtime behavior.

## Outcomes & Retrospective

FP-0097 shipped the local/proof-only/read-only premium UI preview route visual QA and accessibility foundation on the existing `/read-only-app-mcp-preview` route.

The slice preserved the single-route boundary and noindex/nofollow/noarchive metadata, added screenshotless typography/spacing/panel/responsive DOM-style assertions, hardened accessibility coverage for landmarks, headings, labelled groups, busy state, status labels, and privacy/no-runtime regions, and bridged V2F/V2G proof gates for the exact FP-0097 boundary while keeping FP-0098 absent.

No additional app route, web API route, backend route, endpoint, remote MCP server, Apps SDK iframe/UI resource, OAuth, app submission, schema, migration, package script, smoke alias, eval dataset, fixture, sample data, source pack, OpenAI API/model call, provider/certification/deployment/external communication, source mutation, finance write, generated product prose, runtime-Codex finance output, autonomous action, screenshot, generated image, public asset, or public app implementation was added.

Recommended next step: keep public ChatGPT App submission waiting. Same-branch visual QA has already run for FP-0097; the only appropriate next local work would be a narrow route/UI correction if review finds a concrete defect.
