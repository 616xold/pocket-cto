# Add F3B CFO Wiki document pages, bindings, and backlinks

## Purpose / Big Picture

This plan defines and executes the first narrow **F3B CFO Wiki** implementation slice for Pocket CFO.

The user-visible goal is to let one company explicitly bind document sources into the CFO Wiki, persist deterministic document extracts from stored raw bytes, compile compiler-owned source digest pages with backlinks, and keep route-visible freshness, evidence, temporal status, and limitations truthful without widening into generic RAG, vector search, OCR, freeform authorship, or later F3/F4/F5/F6 work.

F3B matters now because F3A already shipped the wiki compile spine. The next narrow win is not concept sprawl or UI polish. It is adding the smallest truthful document-aware layer on top of the existing persisted compile, page, link, and ref model while preserving raw-source immutability, Finance Twin authority for structured facts, and the engineering-twin reproducibility baseline.

GitHub connector work is explicitly out of scope for this slice.

## Progress

- [x] 2026-04-13T21:38:13Z Complete preflight against fetched `origin/main`, confirm the exact requested branch, clean worktree, authenticated `gh`, and available local Postgres plus object storage before any edits.
- [x] 2026-04-13T21:38:13Z Read the active docs, F2 handoff, F3A implementation plan, ops docs, AGENTS guidance, and the current wiki/source/finance-twin seams before defining the F3B contract.
- [x] 2026-04-13T21:38:13Z Audit `FP-0026` for the one stale rationale line, confirm it is still stale after the shipped F3A doc refresh, and narrow the wording truthfully.
- [x] 2026-04-13T21:38:13Z Create `plans/FP-0027-cfo-wiki-document-page-compiler-and-backlinks.md` as the active execution plan before code changes.
- [x] 2026-04-13T22:10:23Z Add the additive wiki schema and domain contracts for company-scoped source bindings, deterministic document extracts, source digest pages, and backlink-aware page views.
- [x] 2026-04-13T22:10:23Z Implement the F3B wiki service, repository, compiler, extraction, routes, and smoke coverage while preserving the F3A compile spine and single-running-compile-per-company rule.
- [x] 2026-04-13T22:10:23Z Run the required F3B validation ladder, fix only in-scope failures, and confirm the full requested bar through `pnpm ci:repro:current` before publish.

## Surprises & Discoveries

- Observation: F3A already gives this slice the key persistence and safety seams it needs.
  Evidence: `apps/control-plane/src/modules/wiki/service.ts`, `repository.ts`, and `drizzle-repository.ts` already provide single-running compile enforcement, transactional compiled-state replacement, and failed-compile preservation of prior successful pages.

- Observation: the current source registry remains authoritative and immutable, but it is still not company-keyed.
  Evidence: `packages/domain/src/source-registry.ts` and `packages/db/src/schema/sources.ts` model source, snapshot, file, checksum, and storage identity without `companyId`, so F3B needs an explicit company-scoped wiki binding layer instead of heuristic scope inference.

- Observation: existing ingest receipts are intentionally shallow and cannot become document-page truth.
  Evidence: `apps/control-plane/src/modules/sources/parsers/markdown-parser.ts` stores a compact receipt summary, and `docs/ops/source-ingest-and-cfo-wiki.md` plus the user’s contract both forbid treating those receipts as authoritative page content.

- Observation: the repo does not currently ship a deterministic PDF text extractor dependency.
  Evidence: the audit over `package.json` and the codebase found no PDF text extraction library; current source ingest falls back to metadata-only behavior for PDFs and other unsupported formats.

- Observation: existing page views expose outgoing links only, so route-backed backlinks need a small additive extension to the persisted-view contract.
  Evidence: `packages/domain/src/cfo-wiki.ts`, `apps/control-plane/src/modules/wiki/formatter.ts`, and `routes.ts` currently return `links` but no incoming-link view even though `cfo_wiki_page_links` already persists a directed graph.

- Observation: the requested `pnpm --filter @pocket-cto/control-plane exec vitest run 'src/modules/wiki/**/*.spec.ts' src/app.spec.ts` form did not expand the wiki glob under `pnpm exec` during implementation, so the final F3B validation used both the quoted command and a direct in-package wiki-spec invocation.
  Evidence: the quoted command repeatedly reported only `src/app.spec.ts`, while `cd apps/control-plane && pnpm exec vitest run src/modules/wiki/**/*.spec.ts` ran the full wiki spec set and passed before the slice shipped.

- Observation: repeated F3B smoke runs can collide if the smoke tool reuses a fixed company key.
  Evidence: the first draft of `tools/cfo-wiki-document-pages-smoke.mjs` reused `acme-docs`, which caused a uniqueness conflict on rerun; suffixing the fixture company key with the per-run tag restored deterministic local reruns without mutating prior state.

- Observation: ignored generated declaration files under `packages/domain/src` can poison the repo-wide lint step even though they are not tracked.
  Evidence: `pnpm lint` initially failed on ignored `packages/domain/src/*.d.ts` files created locally during earlier work; deleting those ignored artifacts restored the clean lint result without any checked-in change.

## Decision Log

- Decision: keep the F3B scope to company-scoped source bindings, deterministic markdown or plain-text extracts, source digest pages, and backlink-aware page reads.
  Rationale: the user explicitly wants the narrowest truthful document-aware slice, and broad concept, metric, policy, lint, export, discovery, reporting, or UI work would dilute reviewability.

- Decision: add an explicit wiki-owned binding table keyed by `companyId` plus `sourceId`.
  Rationale: company scope must not be inferred from source names, filenames, creator fields, or sync lineage once document pages become first-class inputs.

- Decision: persist document extracts inside the wiki bounded context rather than mutating source-registry or Finance Twin tables.
  Rationale: raw source storage stays authoritative and immutable, the Finance Twin stays authoritative for structured finance facts, and the wiki keeps its derived compiler-owned extract cache separate.

- Decision: compile source digest page keys as `sources/<sourceId>/snapshots/<version>`.
  Rationale: the page key must remain canonical, slash-delimited, and stable across reads while making current versus superseded snapshot pages explicit.

- Decision: keep F3B deterministic and synchronous with no runtime-codex, no model calls, no prompt-built synthesis, no embeddings, no vector DB, no OCR, and no wiki UI.
  Rationale: this slice is about truthful extraction, persisted markdown pages, and evidence-aware navigation rather than expanding the product surface.

- Decision: treat markdown and plain-text documents as the only supported extraction inputs in this first F3B implementation unless local deterministic PDF extraction proves clearly workable during implementation.
  Rationale: the repo does not currently include a PDF text extractor, and unsupported PDFs are still acceptable for this slice if they remain visible as gaps instead of fake digests.

- Decision: preserve F3A foundation pages exactly as canonical pages while extending the compile registry and source-coverage surfaces additively.
  Rationale: the user explicitly requires the shipped F3A routes and pages to remain intact and authoritative.

- Decision: add route-backed backlinks to page views instead of inventing a second page-graph API.
  Rationale: `GET /cfo-wiki/companies/:companyKey/pages/*` is already the canonical read surface, and document pages should expose their incoming and outgoing graph context there.

- Decision: keep GitHub connector work explicitly out of scope and do not use GitHub Connector Guard in this slice.
  Rationale: the user instructed it directly, and the relevant seams are wholly inside sources, Finance Twin, and wiki modules.

- Decision: treat PDFs as unsupported coverage in this first shipped F3B slice even though the extract model reserves `pdf_text` for a future deterministic extractor.
  Rationale: the repo does not currently ship a deterministic PDF text extraction dependency, and surfacing unsupported gaps is truer than pretending text extraction support exists.

- Decision: make the new F3B smoke tool use a per-run company key derived from its run tag.
  Rationale: the smoke should be safely rerunnable against a persistent local Docker-backed environment without colliding with a previous successful run.

## Context and Orientation

Pocket CFO has already shipped:

- F1 authoritative raw-source registration, snapshots, files, checksums, and immutable storage refs
- broad F2 Finance Twin breadth through F2O
- F3A deterministic CFO Wiki compile runs, compiler-owned pages, links, refs, and route-backed reads for one company

The active-doc boundary for this slice is:

- `README.md`
- `START_HERE.md`
- `AGENTS.md`
- `PLANS.md`
- `WORKFLOW.md`
- `plans/ROADMAP.md`
- `plans/FP-0025-final-f2-handoff-and-plan-chain-polish.md`
- `plans/FP-0026-cfo-wiki-foundation-and-page-registry.md`
- this plan: `plans/FP-0027-cfo-wiki-document-page-compiler-and-backlinks.md`
- `docs/ops/source-ingest-and-cfo-wiki.md`
- `docs/ops/local-dev.md`
- `docs/ops/codex-app-server.md`

The relevant bounded contexts are:

- `packages/domain/src/cfo-wiki.ts` for pure wiki contracts and route-visible schemas
- `packages/db/src/schema/wiki.ts` for additive wiki persistence only
- `apps/control-plane/src/modules/wiki/**` for binding, extract, compile, link, ref, and route orchestration
- `apps/control-plane/src/modules/sources/**` for authoritative raw-source identity plus object-store reads
- `apps/control-plane/src/modules/finance-twin/**` only for existing company and reporting-period lookup seams

GitHub connector work is out of scope.
The engineering-twin modules remain intact and their reproducibility validations must stay green unchanged.

## Plan of Work

Implement F3B in six bounded passes.

First, extend the wiki domain and DB schema additively for source bindings, document extracts, source digest page kinds, expanded page keys, and backlink-aware page views. Keep the new contracts pure in `packages/domain`, persistence-only in `packages/db`, and do not change existing source-registry or Finance Twin tables.

Second, add wiki repository support for bindings, extracts, and backlinks while preserving the existing compile-run and page-replacement behavior. This includes upsert or list methods for source bindings and document extracts plus incoming-link reads for page views.

Third, implement deterministic document extraction inside the wiki bounded context. Read stored raw bytes through the existing source-file storage seam, support markdown and plain text deterministically, cache extracts by checksum plus parser version, and persist `unsupported` or `failed` states truthfully for unsupported or unreadable files instead of inventing page content.

Fourth, extend the wiki compile-state loader and compiler so bound document sources participate in the compile. The compile should resolve all bound document snapshots, reuse or refresh extract state, extend the page registry with source digest pages, render deterministic markdown bodies, and add related links plus backlinks for current and superseded document pages while keeping the F3A pages intact.

Fifth, expose the narrow route surface for F3B bindings and reads:

- `POST /cfo-wiki/companies/:companyKey/sources/:sourceId/bind`
- `GET /cfo-wiki/companies/:companyKey/sources`
- existing compile, company summary, index, log, and page routes with additive F3B serialization

Sixth, prove the slice with targeted unit or integration tests, the new document-pages smoke path, the existing finance-twin and F3A smokes, the engineering-twin reproducibility checks, and the full repo validation ladder required by the user.

## Concrete Steps

1. Extend `packages/domain/src/cfo-wiki.ts` and `packages/domain/src/index.ts` with:
   - page kind support for `source_digest`
   - page key support for `sources/<sourceId>/snapshots/<version>`
   - source-binding schemas and views
   - document-extract schemas and views
   - bound-source list schemas with latest snapshot and extract summaries
   - page-view support for backlinks
   - any narrow document-role or extract-status enums needed for truthful F3B routing

2. Extend `packages/db/src/schema/wiki.ts`, `packages/db/src/schema/index.ts`, and `packages/db/src/schema.spec.ts` with additive F3B tables and enums:
   - `cfo_wiki_source_bindings`
   - `cfo_wiki_document_extracts`
   - page-kind and any status enums needed for `source_digest` and extract state
   - indexes or unique constraints for `companyId + sourceId` bindings and `companyId + sourceSnapshotId` extract caching

3. Generate and check in the additive Drizzle migration under `packages/db/drizzle/**`.
   Do not make destructive schema changes.

4. Extend `apps/control-plane/src/modules/wiki/repository.ts` and `drizzle-repository.ts` with:
   - binding upsert and list methods
   - extract upsert and list methods
   - incoming-link or backlink reads
   - page replacement that still swaps only on successful compile

5. Add or extend wiki compiler modules under `apps/control-plane/src/modules/wiki/**` to keep responsibilities split cleanly, likely including:
   - binding resolution
   - deterministic document extraction
   - source digest registry or rendering helpers
   - backlink-aware link construction
   - source digest refs

6. Wire the wiki service to:
   - require a real company key
   - bind only real document sources
   - preserve the single-running compile rule
   - resolve bound snapshots and their current versus superseded status
   - reuse cached extracts when checksum plus parser version match
   - persist extracted, unsupported, or failed extract rows
   - compile and read source digest pages without erasing prior success when a later compile fails

7. Extend `apps/control-plane/src/modules/wiki/routes.ts`, `schema.ts`, `errors.ts`, `formatter.ts`, `service.ts`, `app.ts`, `bootstrap.ts`, and `lib/types.ts` only as needed for the new F3B route and serialization surface.

8. Add or update tests in:
   - `packages/domain/src/cfo-wiki.spec.ts`
   - `packages/db/src/schema.spec.ts`
   - `apps/control-plane/src/modules/wiki/**/*.spec.ts`
   - `apps/control-plane/src/app.spec.ts`
   - `packages/testkit/**` only if tiny shared wiki or source fixtures truly reduce duplication

9. Add `tools/cfo-wiki-document-pages-smoke.mjs` and the root `package.json` smoke alias `smoke:cfo-wiki-document-pages:local`.

10. Apply only the smallest truthful active-doc polish after the code lands:
   - keep `README.md` truthful if the shipped-state text or repo map becomes stale
   - add the new smoke alias in `docs/ops/local-dev.md`
   - add only the narrow shipped-state clarification to `docs/ops/source-ingest-and-cfo-wiki.md`
   - update `START_HERE.md` only if F3B or F3C sequencing wording becomes stale after what actually ships

## Validation and Acceptance

Run validation in this order:

```bash
pnpm --filter @pocket-cto/domain exec vitest run src/cfo-wiki.spec.ts
pnpm --filter @pocket-cto/db exec vitest run src/schema.spec.ts
pnpm --filter @pocket-cto/control-plane exec vitest run 'src/modules/wiki/**/*.spec.ts' src/app.spec.ts
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
pnpm smoke:cfo-wiki-document-pages:local
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Acceptance for this slice is met when all of the following are true:

- one active F3B Finance Plan exists and stays current during implementation
- a company can explicitly bind one or more document sources by `sourceId`
- compile-time document inputs come only from bound sources of kind `document`
- deterministic markdown or plain-text extracts are persisted from stored raw bytes
- source digest pages are compiler-owned, persisted, and readable through existing page routes
- current versus superseded source snapshot pages are visible through temporal status and links
- route-visible page reads expose backlinks or incoming links for the new document pages
- unsupported PDFs, scans, image-only files, or unreadable docs remain visible as unsupported or failed coverage rather than fake digests
- existing F1, F2A-F2O, and F3A behavior still works unchanged
- engineering-twin reproducibility tests still pass unchanged
- no runtime-codex, no model synthesis, no embeddings, no vector search, no OCR, and no wiki UI are added

Provenance, freshness, evidence, and limitation posture for F3B:

- raw files remain immutable and authoritative
- document extract rows must carry source, snapshot, file, checksum, parser version, and extracted-at identity
- source digest pages must surface freshness posture, limitations, unsupported gaps, and evidence refs plainly
- the CFO Wiki remains derived and compiler-owned rather than a second truth graph
- replay remains unchanged unless a narrow in-scope reason emerges and is recorded here

## Idempotence and Recovery

This slice should be safe to retry.

- Binding upserts must be idempotent by `companyId + sourceId`.
- Re-running compile should reuse unchanged extracts when checksum plus parser version match.
- If extraction fails for one bound source, preserve the prior successful wiki pages and surface the failure rather than deleting prior output.
- If a schema or migration step fails, stop and fix only the additive F3B schema shape instead of rewriting old migrations.
- If a validation failure is outside this slice or outside the known narrow engineering-twin reproducibility surface, stop and report it rather than widening scope.

## Artifacts and Notes

Expected artifacts from this slice:

- this active F3B Finance Plan, kept current as work proceeds
- additive wiki binding and extract schema plus migration
- deterministic source digest pages and backlink-aware page views
- one new packaged smoke tool for document pages
- truthful minimal active-doc updates reflecting the shipped F3B scope
- one green validation record across the full required ladder before publish

Evidence-bundle note:
this slice changes operator-visible wiki outputs, so page bodies and route payloads must keep sources, freshness posture, limitations, unsupported coverage, and temporal status visible enough that a human reviewer can understand them outside chat.

## Outcome

F3B shipped in the narrow backend-first shape this plan targeted.

- Explicit company-scoped wiki source bindings now live inside the wiki bounded context and are exposed through bind plus list routes.
- Deterministic markdown and plain-text extracts now persist separately from raw-source storage, keyed by company plus snapshot, with parser-version and checksum-based cache reuse.
- Compiler-owned `source_digest` pages now persist for bound document snapshots, expose current versus superseded temporal status, and surface evidence, freshness posture, limitations, unsupported coverage, related links, and backlinks through the existing page route.
- F3A foundation pages and compile behavior remain intact, failed recompiles do not erase prior successful wiki output, and the single-running-compile-per-company guard remains in place.
- PDFs, scans, image-only files, and other unreadable documents remain visible as unsupported coverage rather than fake digests in this slice.

Validation completed green for the requested bar:

- focused domain, DB, wiki, route, repository, and engineering-twin vitest coverage
- the full local smoke ladder, including the new `pnpm smoke:cfo-wiki-document-pages:local`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

Remaining work is intentionally deferred.
The next F3 slice should move to F3C wiki lint, export, and durable filing on top of the now-shipped document-aware compiler layer rather than widening this PR into deeper document intelligence or later roadmap phases.

## Interfaces and Dependencies

Primary interfaces changed by this slice:

- wiki domain contracts in `packages/domain`
- additive wiki schema and Drizzle migration in `packages/db`
- wiki service, repository, compiler, routes, and tests in `apps/control-plane/src/modules/wiki/**`
- app container wiring in `apps/control-plane/src/bootstrap.ts`, `app.ts`, and `lib/types.ts`
- root smoke registration in `package.json`

Key dependencies and seams:

- raw bytes are read only through the existing `SourceFileStorage` seam
- source identity, snapshots, files, and checksums remain sourced from `SourceRepository`
- company and reporting-period lookup remain sourced from `FinanceTwinRepository`
- no new environment variables are expected
- internal `@pocket-cto/*` package scope remains unchanged

## Outcomes & Retrospective

F3B shipped in the narrow backend-first shape this plan targeted.

- Explicit company-scoped wiki source bindings now live inside the wiki bounded context and are exposed through bind plus list routes.
- Deterministic markdown and plain-text extracts now persist separately from raw-source storage, keyed by company plus snapshot, with parser-version and checksum-based cache reuse.
- Compiler-owned `source_digest` pages now persist for bound document snapshots, expose current versus superseded temporal status, and surface evidence, freshness posture, limitations, unsupported coverage, related links, and backlinks through the existing page route.
- F3A foundation pages and compile behavior remain intact, failed recompiles do not erase prior successful wiki output, and the single-running-compile-per-company guard remains in place.
- PDFs, scans, image-only files, and other unreadable documents remain visible as unsupported coverage rather than fake digests in this slice.

Validation completed green for the requested bar:

- focused domain, DB, wiki, route, repository, and engineering-twin Vitest coverage
- the full local smoke ladder, including `pnpm smoke:cfo-wiki-document-pages:local`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

Remaining work is intentionally deferred.
The next F3 slice should move to F3C wiki lint, export, and durable filing on top of the now-shipped document-aware compiler layer rather than widening this historical F3B slice.

If implementation proves that deterministic PDF text extraction is not safely supportable with the current repo dependencies, this slice should still ship by marking PDFs unsupported explicitly and recommending the next narrow continuation or F3C follow-up from a truthful baseline rather than widening the scope.
