# FP-0091 - Read-only ChatGPT App MCP Premium UI Component Foundation

## Purpose / Big Picture

Target phase: `V2K`.

Exact slice: `V2K-read-only-chatgpt-app-mcp-premium-ui-component-foundation-local-v1`.

Status: shipped local/proof-only/read-only UI component implementation slice, created and shipped 2026-05-09.

This Finance Plan implements the first real local premium UI component foundation after shipped FP-0090. This slice writes actual UI component code. It is still strictly local, proof-only, read-only, and component-only.

This slice does not implement a public ChatGPT App. This slice does not implement Apps SDK iframe/UI resources. This slice does not add routes. This slice does not add endpoints. This slice does not add remote MCP. This slice does not add OAuth. This slice does not add app submission. This slice does not add OpenAI API/model calls. This slice does not deploy anything.

The user-visible purpose is to create reusable local React components that can display a future V2G app/MCP response-envelope shape with evidence, citations, source anchors, freshness, limitations, permitted next review steps, forbidden actions, privacy boundaries, no-runtime boundaries, and fail-closed refusal states. The components are not wired into a route and do not become product runtime behavior by themselves.

Authority model remains unchanged:

- raw sources remain authoritative for document claims
- the Finance Twin remains authoritative for structured finance facts
- the CFO Wiki remains compiled and derived
- EvidenceIndex remains the source anchor, document map, evidence card, source coverage, freshness, and limitation layer
- V2C tools remain local/internal read-only evidence contracts
- V2D Evidence Atlas remains the shipped read-only local operator UI foundation
- V2E remains local/internal proof-only bounded orchestration
- V2F remains docs/proof-only benchmark/community posture with no datasets or real finance data
- V2G remains local proof-only read-only ChatGPT App/MCP contracts, descriptors, and response envelopes
- FP-0088, FP-0089, and FP-0090 remain shipped readiness records

GitHub connector product behavior is explicitly out of scope. Routine `git`, `gh`, push, and PR operations for this repository do not invoke GitHub Connector Guard.

Replay and evidence-bundle implications: this slice creates no mission state transition, ingest action, report action, approval, durable product runtime output, source mutation, Finance Twin write, CFO Wiki write, evidence bundle, provider job, certification record, delivery record, endpoint, route, or app runtime behavior. The component tests use in-memory contract-shaped examples only.

## Progress

- [x] 2026-05-09T19:28:36Z - Invoked the requested Pocket CFO operator skills: Finance Plan Orchestrator, Modular Architecture Guard, Source Provenance Guard, CFO Wiki Maintainer, Evidence Bundle Auditor, F6 Monitoring Semantics Guard, Validation Ladder Composer, and Pocket CFO Handoff Auditor.
- [x] 2026-05-09T19:28:36Z - Confirmed GitHub Connector Guard is out of scope because GitHub connector product behavior is not part of this slice.
- [x] 2026-05-09T19:28:36Z - Ran preflight against fetched `origin/main` on branch `codex/v2k-read-only-chatgpt-app-mcp-premium-ui-component-foundation-local-v1`; the repo started clean, `HEAD` matched `origin/main`, GitHub auth/repo access worked, PR #250 was merged, Docker Postgres/MinIO were available, FP-0090 existed, FP-0091 was absent, FP-0092 was absent, and required V2 proof tools existed.
- [x] 2026-05-09T19:28:36Z - Read required active docs, shipped FP-0087 through FP-0090 records, security/privacy/demo/self-host docs, package metadata, V2F/V2G domain contracts, proof tools, and existing app/web component patterns before edits.
- [x] 2026-05-09T19:28:36Z - Ran baseline V2A/V2B/V2C/V2E/V2F/V2G proof gates before edits; all passed.
- [x] 2026-05-09T19:28:36Z - Confirmed baseline V2F/V2G gates proved `fp0091Absent: true`, which is expected pre-edit state before this local component-only successor.
- [x] 2026-05-09T19:28:36Z - Created this FP-0091 plan as the only allowed FP-0091 file.
- [x] 2026-05-09T20:15:00+01:00 - Implemented the local read-only component foundation under `apps/web/components/read-only-app-mcp/**` with in-memory component tests only.
- [x] 2026-05-09T20:25:00+01:00 - Updated the minimal V2F/V2G proof schemas, builders, proof tools, and focused specs so the exact FP-0091 local UI component boundary is accepted while FP-0092 remains absent.
- [x] 2026-05-09T20:35:00+01:00 - Refreshed directly stale active docs, ROADMAP, and tiny FP-0090 shipped-state wording so FP-0090 was shipped and FP-0091 was opened as local component-only implementation.
- [x] 2026-05-09T20:48:00+01:00 - Ran focused validation and strict same-branch QA; no route, endpoint, schema, migration, package-script, fixture, sample-data, source-pack, Apps SDK, OAuth, app-submission, OpenAI API/model, source-mutation, finance-write, autonomous-action, raw-dump-panel, or advice-like CTA defect was found.
- [x] 2026-05-09T21:00:08+01:00 - Same-branch QA tightened the local state matrix by adding named missing-citation, unsupported-evidence, stale-evidence, and unsafe-action refusal states plus component tests; no runtime, route, endpoint, Apps SDK, OAuth, submission, source mutation, or finance-write scope was added.
- [x] 2026-05-09T20:50:35+01:00 - Ran final validation successfully, including `git diff --check`, all required V2 proof tools, web tests/typecheck, focused domain proof specs, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.
- [x] 2026-05-09T20:50:35+01:00 - Closed out this plan and directly stale active docs so FP-0091 is shipped and FP-0092 remains absent.
- [x] 2026-05-09T21:05:16+01:00 - Reran same-branch QA correction validation successfully, including `git diff --check`, all required V2 proof tools, web tests/typecheck, focused domain proof specs, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.
- [x] 2026-05-09T21:09:59+01:00 - Added `plugins.md` at the user's request as a documentation-only inventory of installed/used Codex plugins; this does not change product runtime, UI behavior, app/MCP scope, source data, or finance state.
- [x] 2026-05-09T21:14:28+01:00 - Updated `plugins.md` to include the newly installed OpenAI Developers plugin as documentation-only inventory; no API key creation, OpenAI API/model call, app runtime, public app, or product scope was used.
- [x] 2026-05-09T20:52:16Z - Post-merge QA found one local UI hierarchy hardening defect: positive evidence composition could render freshness before citations/source anchors. Patched the same FP-0091 branch by adding a dedicated `FreshnessSummaryPanel`, moving positive freshness display after source anchors in the component proof composition, and strengthening component/proof checks without adding routes, endpoints, runtime behavior, source mutation, finance writes, OpenAI API/model calls, public app work, or FP-0092.
- [x] 2026-05-09T20:58:44Z - Reran post-correction validation successfully: `git diff --check`, all seven required direct proof tools, focused web component spec, web package tests/typecheck, focused domain specs, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`. The first focused web spec wrapper used a repo-root path and failed before discovery; it was immediately rerun with the package-relative path and passed.

## Surprises & Discoveries

The shipped FP-0090 bridge still proves FP-0091 absence before edits. That is correct pre-edit behavior. This slice must replace the hard FP-0091 absence posture with an exact FP-0091 local UI component boundary while keeping FP-0092 absent.

Existing app/web component tests use `renderToStaticMarkup` from `react-dom/server`, which fits this slice because the components are local, server-renderable, read-only, and do not need browser APIs, form submissions, route changes, fetches, or server actions.

No new official web research was needed during this implementation. FP-0091 inherits the official OpenAI and Apple source context already recorded in shipped FP-0090 for UI/security/accessibility posture. Repo truth, shipped Finance Plans, current code, and local proof gates remain the implementation authority.

## Decision Log

Decision: FP-0091 is a real UI implementation slice, but only for local React components.
Rationale: PR #250 is merged, FP-0090 shipped the implementation readiness boundary, required proof gates passed before edits, and the new code can stay inside `apps/web/components/read-only-app-mcp/**` without adding routes, endpoints, data files, app runtime, Apps SDK resources, OAuth, submission, model calls, source mutation, or finance writes.

Decision: implement `SourceAnchorPanel` instead of a drawer.
Rationale: drawer behavior can imply app runtime interactivity. A static source-anchor panel preserves the local component contract while still making citations and source anchors visible.

Decision: component examples remain in tests only.
Rationale: the slice must not add fixtures, sample data, eval datasets, public demo data, or source packs. In-memory contract-shaped examples are enough to prove rendering and boundary posture.

Decision: component copy is evidence navigation copy, not finance advice.
Rationale: the UI can explain evidence, freshness, limitations, and refusal posture, but it must not create advice-like CTAs, generated finance conclusions, or action-looking controls for forbidden actions.

Decision: explicit refusal-state components cover every fail-closed QA state.
Rationale: the generic refusal panel can render every refusal reason, but same-branch QA benefits from named local components and tests for missing citation, unsupported evidence, stale evidence, prompt injection, raw full-file dump requests, and unsafe action refusals.

Decision: proof gates must accept exactly one FP-0091 file and reject FP-0092.
Rationale: the successor bridge should be stronger than simple absence. It must prove FP-0091 authorizes only local read-only UI components and still rejects routes, endpoints, remote MCP, Apps SDK iframe/UI resources, OAuth, app submission, public app implementation, OpenAI API/model calls, source mutation, finance writes, generated product prose, runtime-Codex finance output, and autonomous action.

Decision: positive evidence freshness belongs in a dedicated panel after citations and source anchors.
Rationale: the shipped hierarchy requires answer status, evidence cards, citations/source anchors, then freshness. Keeping positive freshness inside the answer or evidence-card headers could make DOM order drift from the plan. Refusal panels may still carry fail-closed freshness posture as part of refusal status.

Decision: no replay event is added.
Rationale: this slice changes local components, tests, docs, and proof-gate validation only. It does not change product runtime state, mission state, source state, reports, approvals, or evidence artifacts.

## Context and Orientation

Current shipped V2 foundation:

- FP-0080 shipped V2A EvidenceIndex and document-map foundation.
- FP-0081 shipped V2B document precision adapter foundation.
- FP-0082 shipped V2C local/internal read-only evidence-tool contracts.
- FP-0083 shipped OSS demo, self-host, security, privacy, and contribution baseline docs.
- FP-0084 shipped read-only Evidence Atlas UI foundation.
- FP-0085 shipped local/internal proof-only bounded LLM orchestration.
- FP-0086 shipped docs/proof-only benchmark/community manifest foundation with SafeDemoDataPolicy and no datasets.
- FP-0087 shipped local proof-only read-only ChatGPT App/MCP contracts, descriptors, response envelopes, allowlists, forbidden actions, refusal boundaries, privacy/no-runtime posture, deferred OAuth/submission/provider boundaries, and direct proof tools.
- FP-0088 shipped docs-only premium UI/security readiness and proof-gate compatibility.
- FP-0089 shipped docs-only premium UI design-system readiness and proof-gate compatibility.
- FP-0090 shipped docs-only premium UI implementation readiness and proof-gate compatibility.

FP-0091 opens the first narrow actual UI component implementation after FP-0090. It does not open a public app, Apps SDK iframe/UI resources, route wiring, endpoint wiring, OAuth, submission, OpenAI API/model use, provider/certification/deployment work, external communications, source mutation, finance writes, generated product prose, runtime-Codex finance output, or autonomous action.

Official web research used in this slice:

- No new official web research was used.
- Shipped FP-0090 recorded official OpenAI Apps SDK overview, UX principles, UI guidelines, security/privacy, Developer Mode, MCP, submission, app-submission guidelines, and Apple Human Interface Guidelines accessibility, color, layout, and typography as planning context. FP-0091 uses that shipped context only and does not implement Apps SDK UI.

## Plan of Work

Allowed files for this slice:

- `plans/FP-0091-read-only-chatgpt-app-mcp-premium-ui-component-foundation.md`
- `apps/web/components/read-only-app-mcp/**`
- `apps/web/components/read-only-app-mcp/**/*.spec.tsx`
- `apps/web/components/read-only-app-mcp/**/*.test.tsx`
- `apps/web/lib/read-only-app-mcp-ui.ts` only if a tiny pure helper is required
- `packages/domain/src/read-only-app-mcp*.ts` only for proof-gate fields or direct proof compatibility
- `packages/domain/src/benchmark-community*.ts` only for proof-gate fields or direct proof compatibility
- `packages/domain/src/read-only-app-mcp*.spec.ts` only for proof-gate tests
- `packages/domain/src/benchmark-community*.spec.ts` only for proof-gate tests
- `tools/read-only-mcp-descriptor-response-envelope-proof.mjs`
- `tools/read-only-chatgpt-app-mcp-proof.mjs`
- `tools/benchmark-community-pack-proof.mjs`
- directly stale active docs and tiny FP-0090 shipped-state wording if required

Forbidden behavior:

- no app routes
- no web API routes
- no backend/control-plane routes
- no endpoints
- no remote MCP server
- no Apps SDK iframe/UI resource registration
- no OAuth
- no app submission
- no schema or migrations
- no package scripts or smoke aliases
- no eval datasets, fixtures, sample data, public demo data, or source packs
- no source-pack fixture edits
- no FP-0092
- no public app implementation
- no OpenAI API/model calls
- no provider/certification/deployment/external communications
- no source mutation
- no finance writes
- no generated product prose or runtime-Codex finance output
- no autonomous action

Components to implement:

- `AppShell`
- `EvidenceAnswerPanel`
- `RefusalPanel`
- `EvidenceCardStack`
- `CitationRail`
- `SourceAnchorPanel`
- `FreshnessBadge`
- `FreshnessSummaryPanel`
- `LimitationCallout`
- `PermittedNextActionsPanel`
- `ForbiddenActionsPanel`
- `PrivacyBoundaryPanel`
- `NoRuntimeBoundaryPanel`
- `PromptInjectionWarningState`
- `RawFullFileDumpRefusalState`
- `EmptyEvidenceState`
- `LoadingEvidenceState`
- `ErrorAndUnsupportedState`

Evidence hierarchy to preserve:

1. answer or refusal status
2. evidence cards
3. citations/source anchors
4. freshness
5. limitations
6. permitted next actions
7. forbidden actions
8. privacy and no-runtime boundary

## Concrete Steps

1. Run preflight and baseline proof gates.
2. Confirm baseline proof gates prove FP-0091 absence and treat that as expected pre-edit state.
3. Create this plan as the only FP-0091 file.
4. Add local read-only UI components under `apps/web/components/read-only-app-mcp/**`.
5. Add focused component tests for all primary states using in-memory contract-shaped examples only.
6. Update minimal V2F/V2G proof schemas, builders, tools, and specs so FP-0091 and local component files are accepted while FP-0092 remains rejected.
7. Refresh only directly stale active docs and tiny FP-0090 shipped-state wording if required.
8. Run focused validation.
9. Run strict same-branch QA over changed files and patch only this slice if needed.
10. Run final validation.
11. Update this plan and directly stale active docs to mark FP-0091 shipped.
12. If closeout edits are made, rerun the minimum post-closeout validation.
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

- Search changed files for routes, endpoints, schema, migrations, package scripts, eval datasets, fixtures, sample data, source packs, OpenAI API/model calls, OAuth, app submission, provider/deployment, source mutation, finance writes, autonomous action, and public app implementation.
- Confirm no app routes were added or edited.
- Confirm no API routes or backend routes were added.
- Confirm no forms, POSTs, server actions, upload controls, mission create controls, provider connect controls, payment controls, report release controls, approval controls, certification controls, source mutation controls, finance write controls, or autonomous controls exist in the FP-0091 UI component files.
- Confirm no action-looking controls for forbidden actions.
- Confirm no raw full text or page dump panels.
- Confirm no advice-like CTA copy.
- Confirm no FP-0092.
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

- exactly one FP-0091 file exists at `plans/FP-0091-read-only-chatgpt-app-mcp-premium-ui-component-foundation.md`
- FP-0092 remains absent
- all required local UI components exist under `apps/web/components/read-only-app-mcp/**`
- component tests cover answer, refusal, evidence cards, citations, source anchors, freshness, limitations, permitted/forbidden actions, privacy/no-runtime boundaries, prompt-injection warning, raw-full-file-dump refusal, empty, loading, error, and unsupported states
- proof gates accept FP-0091 only as a local read-only UI component foundation
- proof gates still reject public app implementation, public app submission, remote MCP, Apps SDK iframe/UI resources, OAuth, endpoints, OpenAI API/model calls, provider/certification/deployment, source mutation, finance writes, generated product prose, runtime-Codex finance output, and autonomous action

## Idempotence and Recovery

Rerunning this slice should find this exact FP-0091 file and update it rather than creating another FP-0091 or FP-0092.

If proof gates fail because FP-0091 is present, patch only the proof-gate bridge so the exact local component-only plan is accepted. Do not widen into route, endpoint, public app, Apps SDK iframe/UI, OAuth, submission, remote MCP, provider, deployment, OpenAI API/model, source mutation, or finance-write behavior.

If component validation fails, patch only `apps/web/components/read-only-app-mcp/**` or the minimal proof/spec bridge that owns the failure.

If validation fails after a correction, report the exact failing command and recommend the smallest safer corrective slice:

- FP-0091 local UI component contract correction
- FP-0090 proof-boundary correction
- FP-0089 design-system correction
- V2G descriptor/envelope proof correction
- hold UI implementation until proof gates can accept local component-only code

## Artifacts and Notes

This plan records no new source files, sample data, fixtures, eval datasets, screenshots, generated images, public listing assets, app submission materials, app metadata, OAuth material, endpoints, routes, provider credentials, or deployment artifacts.

Component tests use in-memory examples only. Those examples are synthetic proof objects and not finance source truth.

## Interfaces and Dependencies

The slice depends on:

- shipped FP-0090 premium UI implementation readiness record
- shipped FP-0089 premium UI design-system readiness record
- shipped FP-0088 premium UI/security readiness record
- shipped FP-0087 local proof-only read-only app/MCP contracts and descriptor/envelope proof gates
- shipped FP-0086 benchmark/community proof gate
- shipped V2A through V2E direct proof spine
- React and React DOM already present in `apps/web`
- Vitest already present in repo tooling

No new dependencies, package scripts, environment variables, runtime routes, endpoints, MCP servers, OAuth clients, OpenAI clients, providers, schema, migrations, fixtures, datasets, source packs, or public app assets are introduced.

## Outcomes & Retrospective

Outcome: FP-0091 shipped the first local/proof-only/read-only premium UI component foundation after FP-0090. The shipped component surface is limited to `apps/web/components/read-only-app-mcp/**`, focused tests, the exact proof-gate bridge, this plan, and directly stale docs.

Validation outcome: green. Focused and final validation passed, including the required V2 proof tools, web tests/typecheck, focused domain proof specs, repo lint/typecheck/test, `git diff --check`, and `pnpm ci:repro:current`. The same-branch QA correction revalidated the same ladder successfully.

Scope outcome must remain: local UI component code only; no app routes, API routes, backend routes, endpoints, remote MCP server, Apps SDK iframe/UI resource registration, OAuth, app submission, schema, migration, package script, smoke alias, eval dataset, fixture, sample data, public demo data, source pack, OpenAI API/model call, vector/file-search, OCR, PageIndex, provider/certification/delivery/deployment, external communication, source mutation, finance write, generated product prose, runtime-Codex finance output, autonomous action, FP-0092, or public app implementation.

Remaining work is intentionally future-plan-only: route integration, Apps SDK iframe/UI resources, remote MCP, OAuth, app submission, public app implementation, provider/certification/deployment, screenshots/listing assets, and any public distribution work.
