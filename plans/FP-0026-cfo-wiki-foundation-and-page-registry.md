# Build the F3A CFO Wiki foundation and page registry

## Purpose / Big Picture

This plan defines and executes the first real **F3 CFO Wiki** implementation slice for Pocket CFO.

The user-visible goal is to make the first F3 code slice straightforward for a fresh contributor: add a backend-first, twin-grounded CFO Wiki foundation that can compile a small deterministic markdown knowledge layer for one company without inventing a second truth graph, a generic RAG system, or a freeform document summarizer.

F3A matters now because broad F2 Finance Twin breadth is already shipped through F2O. The next product gain is not another extractor family. It is a durable compiled wiki layer that turns authoritative raw-source inventory plus Finance Twin state into reviewable markdown pages with explicit provenance, freshness posture, and visible gaps.

GitHub connector work is explicitly out of scope for this slice.
This plan is the active F3A implementation contract and must stay current while the wiki domain, schema, routes, compile flow, tests, smoke path, and narrow active-doc polish land.

## Progress

- [x] 2026-04-13T18:34:13Z Audit the active docs, roadmap, prior F2 closeout and handoff plans, and the legacy engineering-twin docs surfaces before drafting the first concrete F3 contract.
- [x] 2026-04-13T18:34:13Z Create `plans/FP-0026-cfo-wiki-foundation-and-page-registry.md` and refresh the smallest truthful doc set so a fresh F3A implementation thread can start without ambiguity.
- [x] 2026-04-13T18:40:53Z Run the required docs-and-plan validation ladder for this master-plan slice and confirm `pnpm smoke:source-ingest:local`, every requested finance-twin smoke, the engineering-twin Vitest trio, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current` all pass without needing in-scope code changes.
- [x] 2026-04-13T18:49:31Z Complete the strict QA pass for this planning slice, correct the one stale present-tense context statement inside `FP-0026`, and rerun `pnpm ci:repro:current` after the plan-only polish.
- [x] 2026-04-13T19:52:48Z Start the implementation thread against fetched `origin/main`, confirm the required branch, clean repo state, Docker-backed dependencies, and active-skill loadout, then tighten this plan for canonical page keys, partial-state compile rules, single-running-compile semantics, no-runtime-codex or no-freeform-LLM enforcement, and the minimal deterministic link or ref enums before code edits.
- [x] 2026-04-13T21:28:44Z Implement the F3A wiki bounded context, additive schema, backend-first compile routes, deterministic compiler-owned page registry, and minimal active-doc refresh described in this plan.
- [x] 2026-04-13T21:28:44Z Run the F3A validation ladder, add `pnpm smoke:cfo-wiki-foundation:local`, and confirm the new wiki surface plus the required reproducibility path are fully green before publish.

## Surprises & Discoveries

- Observation: the active docs already establish the four-layer model and the mandatory `index.md` plus `log.md` rule, but they stop short of an implementation contract for compile runs, page registry state, evidence refs, and F3 slice boundaries.
  Evidence: `docs/ops/source-ingest-and-cfo-wiki.md` correctly defines raw sources, the Finance Twin, the CFO Wiki, and mission outputs, yet it does not currently define the F3A page registry, compile-run model, or the F3A versus F3B versus F3C cut.

- Observation: the legacy engineering-twin docs and runbook sync path is useful as a structural reference for deterministic discovery, parsing, and persisted sync runs, but it cannot become the active CFO Wiki design.
  Evidence: `apps/control-plane/src/modules/twin/docs-sync.ts`, `docs-discovery.ts`, `docs-parser.ts`, and `runbook-sync.ts` already show additive run, entity, and parser patterns, while `apps/control-plane/src/modules/twin/README.md` remains explicitly repository-scoped engineering-twin scaffolding.

- Observation: the current source-registry and Finance Twin contracts are already strong enough to support a first wiki foundation slice without adding another extractor.
  Evidence: `packages/domain/src/source-registry.ts`, `packages/domain/src/finance-twin.ts`, `packages/db/src/schema/sources.ts`, `packages/db/src/schema/finance-twin.ts`, and `apps/control-plane/src/modules/finance-twin/service.ts` plus `routes.ts` already expose authoritative source identity, checksums, sync-run lineage, company state, reporting periods, and broad F2 read surfaces.

- Observation: there is no current unfinished F2 implementation plan that should block F3 planning.
  Evidence: the active F2 closeout and handoff are recorded in `plans/FP-0024-final-f2-exit-audit-and-polish.md` and `plans/FP-0025-final-f2-handoff-and-plan-chain-polish.md`, and the remaining unchecked boxes in older plans are historical publication remnants rather than a live F3 blocker.

- Observation: company-linked source coverage is not modeled directly in the source-registry tables today.
  Evidence: `sources`, `source_snapshots`, and `source_files` are authoritative and immutable but do not carry `companyId`, so F3A must derive company-specific source coverage from finance-twin sync runs plus linked source, snapshot, and file records instead of inventing a second ownership graph.

- Observation: the DB package cannot import `packages/domain/src` directly during declaration bootstrap without breaking the repo typecheck boundary.
  Evidence: the first F3A typecheck failed when `packages/db/src/schema/wiki.ts` imported wiki string-union types from `@pocket-cto/domain`, so the additive schema now keeps local DB-only type annotations while the authoritative runtime and route contracts remain in `packages/domain/src/cfo-wiki.ts`.

- Observation: wildcard page routing needed explicit decoding plus canonical page-key validation to preserve slash-delimited keys truthfully.
  Evidence: F3A page reads now accept encoded keys like `periods%2F2026-03-31%2Findex` and reject non-canonical keys instead of flattening routes or silently accepting invalid page identities.

## Decision Log

- Decision: define F3 as a **twin-grounded compiled wiki**, not a generic RAG layer and not a second authoritative knowledge graph.
  Rationale: raw sources remain authoritative for document claims, the Finance Twin remains authoritative for structured finance facts, and the wiki exists to compile those layers into durable operator-readable markdown.

- Decision: lock the F3 sequence into three implementation slices: `F3A`, `F3B`, and `F3C`.
  Rationale: the repo needs a concrete progression that starts with deterministic registry and compile infrastructure, adds document-aware synthesis only after the foundation exists, and postpones lint or export concerns until the wiki has stable pages to inspect.

- Decision: make `index.md` and `log.md` compiler-mandatory from the first F3A slice.
  Rationale: the CFO Wiki must always preserve navigation coverage and an append-only compile ledger, even before broader document synthesis exists.

- Decision: treat compiled pages as **compiler-owned** and separate from any future human-authored filed notes or filed mission outputs.
  Rationale: F3A needs stable reproducible pages, and later durable notes or filed outputs must remain explicit page kinds with clear provenance instead of silently mutating compiled pages into mixed-authority sources.

- Decision: F3A compiles only from Finance Twin state and source inventory, not from broad document text synthesis.
  Rationale: the first implementation slice should be deterministic, additive, and grounded in already-shipped evidence layers before introducing constrained synthesis or deeper document extraction.

- Decision: canonical F3A page keys are slash-delimited keys without `.md`, specifically `index`, `log`, `company/overview`, `periods/<periodKey>/index`, and `sources/coverage`.
  Rationale: page keys must stay stable for persisted reads, links, refs, and route-backed retrieval while the markdown file path remains a deterministic derived view.

- Decision: F3A must still compile when the company exists but Finance Twin state is partial or absent.
  Rationale: the truthful behavior is to persist `index`, `log`, `company/overview`, and `sources/coverage` with visible gaps and limitations, while compiling `periods/<periodKey>/index` only for reporting periods that actually exist in stored Finance Twin state.

- Decision: allow only one `running` wiki compile per company at a time and fail a competing request truthfully with a conflict.
  Rationale: overlapping compile runs would race the compiler-owned page layer and violate the reviewable, deterministic F3A contract.

- Decision: F3A is fully deterministic and may not invoke runtime-codex, prompt assembly, model calls, or any freeform LLM synthesis path.
  Rationale: this slice exists to ship the evidence spine first, and the authority boundary becomes blurry if freeform generation enters before the persisted wiki foundation exists.

- Decision: keep the first link taxonomy and ref target taxonomy intentionally narrow.
  Rationale: F3A only needs deterministic navigation plus a small, reviewable reference model, so `navigation` and optional `related` are sufficient link kinds, and `company`, `reporting_period`, `source_snapshot`, `source_file`, and `finance_slice` are sufficient ref target kinds for this slice.

- Decision: explicitly defer vector search, vector databases, PageIndex or QMD dependencies, and PDF-heavy deep read to later F3 work.
  Rationale: none of those are required to land the first reviewable wiki foundation, and making them day-one dependencies would slow F3 without improving the authoritative evidence spine.

- Decision: keep GitHub connector work out of scope and forbid repo semantics from leaking into the new wiki bounded context.
  Rationale: the user requested it, and the active product center is finance evidence rather than repository metadata.

- Decision: derive F3A company source coverage from persisted Finance Twin sync runs rather than inventing a company edge inside the raw source registry.
  Rationale: the raw source layer remains authoritative and immutable today, but it is not company-keyed, so the wiki must compile visible company coverage from the already-persisted sync lineage it actually has.

- Decision: make persisted compile runs, pages, links, and refs the explicit F3A review surface while leaving replay-event emission deferred.
  Rationale: the slice needs a reviewable evidence spine now, and the persisted wiki artifacts plus compile-run summary are enough to reconstruct what changed without overcommitting to a replay shape that is not yet ready.

- Decision: refresh only the smallest active-doc surface that becomes stale as F3A lands.
  Rationale: `FP-0026` needs implementation-tightening now, `README.md` still omits this active plan from the repo map, and later doc touch points should stay limited to the explicit F3A shipped-state clarifications requested by the user.

- Decision: polish `FP-0026` during QA so its context describes the refreshed repo state truthfully instead of preserving one stale present-tense statement from the pre-refresh audit.
  Rationale: the active plan is now part of the active-doc surface, so its orientation needs to match the repo state after the doc refresh lands.

## Context and Orientation

Pocket CFO has already shipped F1 raw-source ingest and broad F2 Finance Twin breadth through F2O.
The next new implementation phase is F3, and this plan plus the accompanying doc refresh now make that phase concrete enough for a clean handoff.
This plan turns F3 into a concrete execution contract while preserving the active-doc boundary and leaving current code truthful.

The relevant repo truths for F3A are:

- `packages/domain/src/source-registry.ts` and `packages/db/src/schema/sources.ts` already define immutable source identity, snapshot identity, checksums, storage refs, and ingest runs.
- `packages/domain/src/finance-twin.ts`, `packages/db/src/schema/finance-twin.ts`, and `apps/control-plane/src/modules/finance-twin/**` already define the structured finance truth layer and the backend-first read surface.
- `apps/control-plane/src/modules/twin/docs-sync.ts`, `docs-discovery.ts`, `docs-parser.ts`, and `runbook-sync.ts` are legacy structural references only. Reuse their additive run and parser patterns where useful, but do not import repository or GitHub product assumptions into the wiki design.
- `plans/FP-0026-cfo-wiki-foundation-and-page-registry.md`, `plans/ROADMAP.md`, `docs/ops/source-ingest-and-cfo-wiki.md`, and `START_HERE.md` now define the implementation-ready F3A contract, slice map, and handoff rules for the first wiki build slice.

The full F3 slice map is locked as follows:

- `F3A — CFO Wiki foundation and page registry`
  - new wiki bounded context
  - compile runs
  - page registry
  - page links
  - page refs
  - deterministic pages:
    - `index.md`
    - `log.md`
    - `company/overview.md`
    - `periods/<periodKey>/index.md`
    - `sources/coverage.md`
  - compile from Finance Twin state and source inventory only
  - no broad document synthesis yet

- `F3B — document page compiler, backlinks, and doc-aware pages`
  - markdown or text and extractable PDF document handling
  - policy pages
  - metric pages
  - concept pages
  - source digest pages
  - constrained synthesis inside deterministic templates
  - explicit backlinks and related-page graph
  - unsupported scans or images stay visible as gaps

- `F3C — wiki lint, export, and durable filing`
  - lint runs and findings
  - missing refs
  - uncited numbers
  - stale pages
  - broken backlinks
  - duplicate concepts
  - missing definitions
  - conflicts against twin facts
  - deterministic export to Obsidian-friendly layout
  - later durable filing of markdown artifacts back into the wiki

The implementation target for **this plan** is the first slice only: `F3A`.
F4 finance discovery, F5 reporting or packet compilation, and F6 monitoring remain out of scope.

## Plan of Work

Implement F3A in five bounded passes.

First, introduce a new CFO Wiki domain contract in `packages/domain` plus an additive wiki schema in `packages/db`.
Those contracts must define compile runs, compiler-owned pages, page links, page refs, evidence classes, page temporal status, and initial page kinds without altering raw-source or Finance Twin authority.

Second, add a new backend-only wiki bounded context under `apps/control-plane/src/modules/wiki/**`.
Keep routes thin, services orchestration-only, repositories persistence-only, and compiler logic separate from transport or formatting concerns.
The wiki module should read from the existing source-registry and Finance Twin surfaces rather than duplicating ingestion or extraction logic.

Third, implement a deterministic compile pipeline for one company.
That compile should create a run record, read source inventory and Finance Twin state, build the F3A page registry, render deterministic markdown skeletons, attach refs and links, upsert compiler-owned pages, ensure `index.md` and `log.md` exist, and finish the compile run with replay-aware metadata.

Fourth, expose a backend-first route surface for manual compile and page reads.
The first routes should support compile initiation plus direct reads of the company wiki root, `index.md`, `log.md`, and individual page records.
No wiki UI should ship in F3A.

Fifth, prove the slice with targeted tests, the existing finance smoke ladder, and a new F3A smoke path that validates deterministic compile output from seeded source-registry and Finance Twin state.

## Concrete Steps

1. Add a new pure domain contract file at `packages/domain/src/cfo-wiki.ts` and export it through `packages/domain/src/index.ts`.
   Define, at minimum:
   - page kind enum for `index`, `log`, `company_overview`, `period_index`, and `source_coverage`
   - page ownership enum with `compiler_owned` now and room for later filed page kinds
   - page temporal status enum with `current`, `historical`, and `superseded`
   - evidence or ref class enum with `twin_fact`, `source_excerpt`, `compiled_inference`, and `ambiguous`
   - compile run status enum with `running`, `succeeded`, and `failed`
   - record and view schemas for compile runs, pages, page links, page refs, compile requests, compile results, and company-level wiki summaries

2. Add an additive DB schema file at `packages/db/src/schema/wiki.ts` and export it from the schema barrel.
   The first schema should create four primary tables:
   - `cfo_wiki_compile_runs`
   - `cfo_wiki_pages`
   - `cfo_wiki_page_links`
   - `cfo_wiki_page_refs`

3. Make the F3A schema target these minimum fields.

   `cfo_wiki_compile_runs` should include:
   - `id`
   - `companyId`
   - `status`
   - `startedAt`
   - `completedAt`
   - `triggeredBy`
   - `triggerKind`
   - `compilerVersion`
   - `stats`
   - `errorSummary`

   `cfo_wiki_pages` should include:
   - `id`
   - `companyId`
   - `compileRunId`
   - `pageKey`
   - `pageKind`
   - `ownershipKind`
   - `temporalStatus`
   - `title`
   - `summary`
   - `markdownBody`
   - `freshnessSummary`
   - `limitations`
   - `lastCompiledAt`
   - additive indexes on `companyId`, `pageKey`, `pageKind`, and `temporalStatus`

   `cfo_wiki_page_links` should include:
   - `id`
   - `companyId`
   - `compileRunId`
   - `fromPageId`
   - `toPageId`
   - `linkKind`
   - `label`
   - `createdAt`

   `cfo_wiki_page_refs` should include:
   - `id`
   - `companyId`
   - `compileRunId`
   - `pageId`
   - `refKind`
   - `targetKind`
   - `targetId`
   - `label`
   - `locator`
   - `excerpt`
   - `notes`
   - `createdAt`

   The F3A data model must stay additive.
   It should not modify existing source-registry or Finance Twin tables.

4. Add a new wiki bounded context at `apps/control-plane/src/modules/wiki/` with this initial module split:
   - `routes.ts`
   - `schema.ts`
   - `service.ts`
   - `repository.ts`
   - `formatter.ts`
   - `events.ts`
   - `compiler/compile.ts`
   - `compiler/page-registry.ts`
   - `compiler/deterministic-pages.ts`
   - `compiler/refs.ts`
   - `compiler/links.ts`

5. Keep F3A compile inputs narrow.
   The compiler may read:
   - source inventory and snapshot metadata from the existing sources module or repository
   - Finance Twin company, reporting-period, freshness, and slice state from the existing finance-twin module or repository
   - existing successful wiki pages only when needed to preserve deterministic `log.md` continuity

   The compiler may not:
   - parse broad document bodies for synthesis
   - introduce a second extraction pipeline
   - fetch from vector infrastructure
   - invoke runtime-codex or any LLM API
   - use prompt-built or freeform summary generation
   - depend on GitHub repository metadata

6. Build the F3A deterministic page registry with exactly these initial compiler-owned page keys:
   - `index`
   - `log`
   - `company/overview`
   - `periods/<periodKey>/index` for each reporting period present in Finance Twin state
   - `sources/coverage`

   The rendered markdown file path must be derived deterministically from the canonical page key:
   - `index` -> `index.md`
   - `log` -> `log.md`
   - every other key -> `<pageKey>.md`

   The plan for each page is:
   - `index.md`: top-level navigation, coverage summary, freshness posture, and links to deterministic child pages
   - `log.md`: append-only compile ledger with run timestamp, scope, status, and high-level change summary
   - `company/overview.md`: company identity, current finance coverage, active limitations, and links to periods and source coverage
   - `periods/<periodKey>/index.md`: period-specific inventory of available Finance Twin slices, freshness posture, and current versus historical context
   - `sources/coverage.md`: authoritative source inventory coverage, missing-source gaps, unsupported-source visibility, and links back to relevant periods or overview pages

7. Keep the first page-graph taxonomy minimal and deterministic.
   - link kinds should stay at `navigation` plus optional `related`
   - ref target kinds should stay at `company`, `reporting_period`, `source_snapshot`, `source_file`, and `finance_slice`
   - broad relationship taxonomies or generic entity-resolution layers are out of scope for F3A

8. Make the first compile pipeline explicit in code:
   - create a compile run row
   - reject a competing compile truthfully if the company already has a `running` wiki compile
   - load the company, source inventory, Finance Twin state, and reporting periods
   - derive deterministic page registry entries
   - render markdown skeletons from deterministic templates
   - attach page refs and page links
   - replace pages, links, and refs transactionally only after the deterministic render succeeds
   - append the new compile entry into `log.md`
   - mark the compile run `succeeded` or `failed`

   If the company exists but Finance Twin state is partial or absent:
   - still compile `index`, `log`, `company/overview`, and `sources/coverage`
   - compile `periods/<periodKey>/index` only for stored reporting periods
   - surface missing periods and missing slice coverage as limitations instead of raising a hard error

9. Treat evidence refs as first-class from day one.
   F3A should primarily emit:
   - `twin_fact` refs for structured Finance Twin facts
   - `ambiguous` refs where coverage or evidence is missing or conflicting

   `source_excerpt` and `compiled_inference` must exist in the contract now so F3B can extend them later, but F3A should only use them where the source inventory already supports truthful deterministic labeling.

10. Make temporal state explicit.
   Every compiler-owned page must choose one of:
   - `current`
   - `historical`
   - `superseded`

   F3A must not hide older periods or prior compiled understanding by deleting them.
   If the page changes meaning over time, preserve the status rather than inventing “forgetting” semantics.

11. Add the first backend-first route surface in `apps/control-plane/src/modules/wiki/routes.ts`:
   - `POST /cfo-wiki/companies/:companyKey/compile`
   - `GET /cfo-wiki/companies/:companyKey`
   - `GET /cfo-wiki/companies/:companyKey/index`
   - `GET /cfo-wiki/companies/:companyKey/log`
   - `GET /cfo-wiki/companies/:companyKey/pages/<wildcard-or-encoded-pageKey>`

    The route contract should preserve canonical page keys with slash delimiters rather than flattening them, and should return page metadata, markdown content, refs, links, compile-run summary, freshness posture, and visible limitations.

12. Wire replay or explicit compile evidence in `apps/control-plane/src/modules/wiki/events.ts`.
    A successful F3A compile should be reconstructable by a human.
    If the first implementation cannot emit the final replay shape safely, it must at least persist compile-run identity, operator trigger, timestamps, stats, and page-change summary explicitly enough for later replay integration.

13. Add targeted tests near the new module boundaries and keep them deterministic.
    Minimum expected test areas for F3A are:
    - domain schemas for the new wiki contract
    - DB schema registration and repository behavior
    - deterministic page-registry generation
    - compile service behavior for a seeded company
    - compile service behavior for partial or absent Finance Twin state
    - concurrent running compile rejection
    - failure does not erase prior successful pages
    - route validation and serialization
    - wildcard or encoded page-key handling

14. Add a local smoke command during this F3A implementation slice with the shape:

```bash
pnpm smoke:cfo-wiki-foundation:local
```

    That smoke should seed or reuse stored raw bytes plus Finance Twin state, trigger a compile, and prove that the deterministic F3A pages and refs exist.

## Validation and Acceptance

This F3A code slice must validate in this order:

```bash
pnpm --filter @pocket-cto/domain exec vitest run src/cfo-wiki.spec.ts
pnpm --filter @pocket-cto/db exec vitest run src/schema.spec.ts
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/wiki/**/*.spec.ts src/app.spec.ts
pnpm smoke:source-ingest:local
pnpm smoke:finance-twin:local
pnpm smoke:finance-twin-account-catalog:local
pnpm smoke:finance-twin-general-ledger:local
pnpm smoke:finance-twin-snapshot:local
pnpm smoke:finance-twin-reconciliation:local
pnpm smoke:finance-twin-period-context:local
pnpm smoke:finance-twin-account-bridge:local
pnpm smoke:finance-twin-balance-bridge-prerequisites:local
pnpm smoke:finance-twin-source-backed-balance-proof:local
pnpm smoke:finance-twin-balance-proof-lineage:local
pnpm smoke:finance-twin-bank-account-summary:local
pnpm smoke:finance-twin-receivables-aging:local
pnpm smoke:finance-twin-payables-aging:local
pnpm smoke:finance-twin-contract-metadata:local
pnpm smoke:finance-twin-card-expense:local
pnpm smoke:cfo-wiki-foundation:local
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Acceptance for this F3A implementation slice is met when all of the following are true:

- one company can run a deterministic CFO Wiki compile from stored source inventory plus Finance Twin state
- compile runs persist status, timestamps, stats, and visible failure summaries
- `index.md` and `log.md` always exist after a successful compile
- `company/overview.md`, `periods/<periodKey>/index.md`, and `sources/coverage.md` compile deterministically from current stored state
- pages are clearly marked `compiler_owned`
- page temporal status is explicit as `current`, `historical`, or `superseded`
- page refs distinguish `twin_fact`, `source_excerpt`, `compiled_inference`, and `ambiguous`, even if F3A only populates a subset heavily
- backlinks or page links are persisted for the deterministic page graph
- freshness posture and limitations are visible in the read surface
- unsupported or missing evidence stays visible rather than being summarized away
- a competing compile request for the same company while one run is `running` fails truthfully with a conflict
- a failed compile leaves the prior successful pages readable
- no vector DB, no PageIndex or QMD dependency, no PDF-heavy deep read dependency, no wiki UI, and no F4 discovery implementation are required for acceptance

Provenance, freshness, replay, and evidence posture:
F3A must keep raw sources authoritative, keep the Finance Twin authoritative for structured facts, label compiled inferences explicitly, preserve ambiguous or missing coverage, and make compile runs reviewable enough that a later thread can understand what changed and why.

## Idempotence and Recovery

F3A should be safe to retry.

- Re-running a compile for the same company should create a new compile run and deterministically converge on the same page keys when the underlying source inventory and Finance Twin state have not changed.
- Compile writes should be transactional where practical so a failed compile does not leave half-written pages, links, or refs as the only visible state.
- Prior successful pages should remain readable until a newer compile succeeds.
- New wiki tables and routes must be additive and isolated from existing source-registry and Finance Twin contracts so rollback means disabling or reverting the new wiki slice without mutating existing F1 or F2 data.
- If deterministic page generation overclaims unsupported evidence, narrow the page output immediately and preserve the limitation in the page body rather than inventing certainty.
- If the future F3A smoke or validation ladder fails outside the wiki slice or outside the known narrow engineering-twin reproducibility surface, stop and report the blocker instead of widening scope.

## Artifacts and Notes

Artifacts expected from this F3A implementation slice:

- this active F3A Finance Plan, kept current as implementation proceeds
- `packages/domain/src/cfo-wiki.ts`
- `packages/db/src/schema/wiki.ts`
- additive DB generation and migration artifacts
- `apps/control-plane/src/modules/wiki/**`
- deterministic F3A compiler-owned markdown pages and their persisted metadata
- `tools/cfo-wiki-foundation-smoke.mjs`
- `pnpm smoke:cfo-wiki-foundation:local`

Evidence-bundle note:
the wiki itself is a durable evidence-facing artifact layer, so its pages must always expose source or twin grounding, freshness posture, limitations, and ambiguity clearly enough that another operator can review them outside chat.

## Interfaces and Dependencies

Primary package and module boundaries for F3A:

- `packages/domain`: pure CFO Wiki contracts only
- `packages/db`: additive wiki schema only
- `apps/control-plane/src/modules/wiki`: transport, service, repository, compiler, formatting, and events for the wiki bounded context
- existing `apps/control-plane/src/modules/finance-twin/**`: source of structured finance state
- existing `apps/control-plane/src/modules/sources/**` or source repositories: source inventory and snapshot metadata

Upstream dependencies:

- source identity, checksum, and snapshot truth from `source-registry`
- structured finance facts, periods, lineage, and freshness from `finance-twin`

Downstream or adjacent dependencies:

- later F3B document compilers will extend page kinds and richer refs
- later F3C lint or export will inspect the stored page registry rather than re-parsing markdown ad hoc
- later F4 or F5 slices may read compiled wiki pages, but they are not part of F3A acceptance

Route surface planned for F3A:

- `POST /cfo-wiki/companies/:companyKey/compile`
- `GET /cfo-wiki/companies/:companyKey`
- `GET /cfo-wiki/companies/:companyKey/index`
- `GET /cfo-wiki/companies/:companyKey/log`
- `GET /cfo-wiki/companies/:companyKey/pages/<wildcard-or-encoded-pageKey>`

Expected out-of-scope items for F3A:

- no vector DB
- no PageIndex or QMD dependency yet
- no PDF-heavy deep read as a hard dependency yet
- no wiki UI yet
- no F4 discovery implementation
- no new Finance Twin extractor
- no deletion of GitHub or engineering-twin modules

No new environment variables are expected for F3A.
If implementation proves otherwise, document them in the active docs during this slice.

## Outcomes & Retrospective

Current outcome:
the initial planning and doc-refresh work is complete, and this plan is now the live execution record for the implementation thread that adds the deterministic F3A wiki foundation.

What changed from the pre-existing repo state:

- F3 is defined as a twin-grounded compiled wiki rather than a generic roadmap placeholder.
- the three-slice `F3A` / `F3B` / `F3C` map is locked in explicitly.
- the active plan now carries the concrete implementation contract for canonical page keys, partial-state compile behavior, single-running-compile safety, route shape, and the no-LLM rule.

What remains:
finish the additive wiki domain, schema, bounded context, deterministic compile flow, backend-first route surface, smoke path, validation ladder, and publication steps for F3A.
