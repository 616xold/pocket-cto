# Add F3C CFO Wiki lint, export, and durable filing

## Purpose / Big Picture

This plan defines and executes the next narrow **F3C CFO Wiki** implementation slice for Pocket CFO.

The user-visible goal is to let one company run persisted wiki lint against stored wiki state, run deterministic markdown export from stored wiki state, and add only the smallest safe durable filing seam if compiler-owned replacement is first made ownership-aware. This slice matters now because F3A and F3B already shipped the compile spine and document-aware source digest pages; the next useful gain is wiki quality and portability, not broader page families, generic RAG, or UI work.

GitHub connector work is explicitly out of scope for this slice.

## Progress

- [x] 2026-04-13T23:17:17Z Complete preflight against fetched `origin/main`, confirm the exact requested branch, clean repo state, authenticated `gh`, and available local Postgres plus object storage before any edits.
- [x] 2026-04-13T23:17:17Z Read the active docs, roadmap, F3A and F3B plans, AGENTS guidance, and the current wiki or source or finance-twin seams before defining the F3C contract.
- [x] 2026-04-13T23:17:17Z Audit the current wiki compile replacement path and confirm durable filing is unsafe until compiler-owned replacement preserves non-compiler-owned pages.
- [x] 2026-04-13T23:17:17Z Create `plans/FP-0028-cfo-wiki-lint-export-and-durable-filing.md` as the active execution plan before code changes.
- [x] 2026-04-13T23:17:17Z Apply the required truthful doc polish in `FP-0027`, `docs/ops/source-ingest-and-cfo-wiki.md`, and any other minimal active docs this shipped F3C slice makes stale.
- [x] 2026-04-13T23:17:17Z Add additive wiki persistence and route-backed behavior for lint runs, lint findings, export runs, and ownership-safe compile replacement with durable filing only if the preservation path stays small and deterministic.
- [x] 2026-04-13T23:17:17Z Add focused domain, DB, repository, service, route, and smoke coverage for persisted lint, export, and the ownership-safe durable filing seam that shipped.
- [x] 2026-04-13T23:36:21Z Run focused wiki validation: domain schema, DB schema, wiki route plus service plus repository specs, and the packaged `pnpm smoke:cfo-wiki-lint-export:local` proof all passed after migrating both `DATABASE_URL` and `TEST_DATABASE_URL`.
- [x] 2026-04-14T00:36:57Z Mark the stale final validation-and-publish checkbox as historical completion because the repo state and active docs now treat F3C as shipped context rather than an active publish branch.

## Surprises & Discoveries

- Observation: the current compiled-state replacement deletes every company page, not only compiler-owned pages.
  Evidence: `apps/control-plane/src/modules/wiki/drizzle-repository.ts` and `apps/control-plane/src/modules/wiki/repository.ts` currently delete all `cfo_wiki_pages` rows for a company inside `replaceCompiledState`, which would erase any future filed page unless ownership boundaries change first.

- Observation: the existing wiki bounded context already has the right shape for F3C to stay modular.
  Evidence: `apps/control-plane/src/modules/wiki/service.ts`, `repository.ts`, `drizzle-repository.ts`, `routes.ts`, `formatter.ts`, and `compiler/**` already separate transport, orchestration, persistence, deterministic rendering, and route-visible formatting.

- Observation: export can stay deterministic without widening into a new artifact system if the first slice persists explicit export-run metadata plus a stored bundle reference.
  Evidence: current page keys, markdown paths, and route-backed page state already give F3C deterministic file names and portable markdown content without requiring vector indexes, vault sync, or runtime-codex.

- Observation: lint must inspect persisted page, link, ref, compile-run, extract, and freshness state rather than scanning markdown strings in isolation.
  Evidence: the stored wiki layer already persists enough reviewable structure in `cfo_wiki_pages`, `cfo_wiki_page_links`, `cfo_wiki_page_refs`, `cfo_wiki_compile_runs`, `cfo_wiki_source_bindings`, and `cfo_wiki_document_extracts` to support deterministic route-backed linting.

- Observation: DB-backed control-plane wiki specs still require the repo-standard test-database migration pass even after `pnpm db:migrate` succeeds locally.
  Evidence: the first repository-spec rerun failed on missing relation `cfo_wiki_export_runs` until `pnpm db:migrate:ci` migrated `TEST_DATABASE_URL` as well as `DATABASE_URL`.

## Decision Log

- Decision: keep F3C scoped to persisted lint, deterministic export, and the smallest safe durable filing seam only.
  Rationale: the user explicitly forbids widening into concept pages, metric pages, generic RAG, vector search, UI work, runtime-codex, or later F4/F5/F6 behavior.

- Decision: make lint findings deterministic and narrow.
  Rationale: reviewability matters more than cleverness in this slice, so the first shipped rules should focus on missing refs, uncited numeric claims, orphan pages, stale pages, broken links, unsupported document gaps, and duplicate titles.

- Decision: make export markdown-first and Obsidian-friendly with deterministic paths derived from canonical page keys.
  Rationale: Rowboat-style portability is useful here, and the existing page-key contract already defines stable file paths without introducing a second editable source-of-truth layer.

- Decision: only ship durable filing if compile replacement becomes ownership-aware first.
  Rationale: a filed page that can be erased by the next compile would violate the non-negotiable truthfulness rules for this slice.

- Decision: keep filed pages explicit and separate from compiler-owned pages if they land.
  Rationale: compiler-owned pages must remain reproducible derived state, while filed pages must remain preserved artifacts with explicit provenance and route-visible limitations.

- Decision: ship the first durable filing seam in this slice because ownership-safe replacement stayed narrow and deterministic.
  Rationale: scoping `replaceCompiledState` to compiler-owned pages only preserved filed artifacts cleanly without widening into report filing, mission filing, or generic wiki authoring.

- Decision: keep replay unchanged unless a small, clearly in-scope filing seam needs an explicit recorded reason.
  Rationale: lint and export are synchronous wiki maintenance actions with durable persisted runs of their own, and the current repo contract allows that explicit review surface when mission state is unchanged.

- Decision: keep GitHub connector work out of scope and do not use GitHub Connector Guard.
  Rationale: the slice is entirely inside the finance evidence, source, and wiki path.

## Context and Orientation

Pocket CFO has already shipped F1 raw-source ingest, broad F2 Finance Twin breadth through F2O, F3A wiki foundation, and the first narrow F3B document-page compiler slice.

The active-doc boundary for this slice is:

- `README.md`
- `START_HERE.md`
- `AGENTS.md`
- `PLANS.md`
- `WORKFLOW.md`
- `plans/ROADMAP.md`
- `plans/FP-0026-cfo-wiki-foundation-and-page-registry.md`
- `plans/FP-0027-cfo-wiki-document-page-compiler-and-backlinks.md`
- this plan: `plans/FP-0028-cfo-wiki-lint-export-and-durable-filing.md`
- `docs/ops/source-ingest-and-cfo-wiki.md`
- `docs/ops/local-dev.md`
- `docs/ops/codex-app-server.md`

The relevant bounded contexts are:

- `packages/domain/src/cfo-wiki.ts` for pure wiki contracts and route-visible schemas
- `packages/db/src/schema/wiki.ts` plus `packages/db/drizzle/**` for additive wiki persistence only
- `apps/control-plane/src/modules/wiki/**` for lint, export, filed-page safety, compile replacement, routes, and deterministic formatting
- `apps/control-plane/src/modules/sources/**` only for authoritative source, snapshot, source-file, and raw-byte reads
- `apps/control-plane/src/modules/finance-twin/**` only for existing company, freshness, and reporting-period lookup seams

GitHub connector work remains out of scope.
The engineering-twin modules remain intact and their reproducibility validations must stay green unchanged.

## Plan of Work

Implement F3C in six bounded passes.

First, extend the domain and DB contracts additively for persisted lint runs, lint findings, export runs, and an ownership boundary that can distinguish compiler-owned pages from safe filed pages if filing lands. Keep all raw-source and Finance Twin authority boundaries intact.

Second, make compiled-state replacement ownership-aware so compiler refreshes replace only compiler-owned pages and preserve any future filed pages. If that preservation step becomes messy or unsafe, stop durable filing and ship lint plus export only.

Third, add deterministic lint orchestration inside the wiki bounded context. Lint should load stored pages, links, refs, compile context, document extracts, and freshness posture; compute a small deterministic finding set; persist the lint run and findings; and expose the latest route-backed summary and findings.

Fourth, add deterministic markdown export inside the wiki bounded context. Export should load stored wiki state, derive stable markdown paths from canonical page keys, render a portable folder tree plus manifest, persist the export run and stored bundle reference, and expose list plus detail routes.

Fifth, if ownership-safe after the replacement change, add one narrow filed-page path that persists a markdown page with explicit provenance and keeps it preserved across later compiles. Do not integrate filing with missions, reports, or freeform wiki editing in this slice.

Sixth, prove the slice with targeted tests, a new smoke tool, the full existing finance and wiki smoke ladder, the engineering-twin reproducibility trio, repo-wide static checks, and `pnpm ci:repro:current`.

## Concrete Steps

1. Extend `packages/domain/src/cfo-wiki.ts`, `packages/domain/src/index.ts`, and `packages/domain/src/cfo-wiki.spec.ts` with:
   - page ownership support for `compiler_owned` and, only if shipped, `filed_artifact`
   - lint run, lint finding, export run, export summary, export detail, and filed-page route schemas
   - narrow lint kind enums such as `missing_refs`, `uncited_numeric_claim`, `orphan_page`, `stale_page`, `broken_link`, `unsupported_document_gap`, and `duplicate_title`
   - deterministic export metadata schemas and any filed-page provenance schemas needed if filing lands

2. Extend `packages/db/src/schema/wiki.ts`, `packages/db/src/schema/index.ts`, `packages/db/src/schema.spec.ts`, and add an additive migration under `packages/db/drizzle/**` for:
   - `cfo_wiki_lint_runs`
   - `cfo_wiki_lint_findings`
   - `cfo_wiki_export_runs`
   - ownership-safe page persistence updates needed for filed-page preservation if filing lands

3. Split the wiki implementation cleanly under `apps/control-plane/src/modules/wiki/**`, likely adding or extending small modules such as:
   - `lint.ts` or `lint/`
   - `export.ts` or `export/`
   - `filed-pages.ts` only if filing lands safely
   - repository helpers for ownership-aware replacement, lint persistence, export persistence, and filed-page reads or writes
   - formatter and schema helpers for new route payloads

4. Update `apps/control-plane/src/modules/wiki/service.ts`, `repository.ts`, `drizzle-repository.ts`, `routes.ts`, `schema.ts`, `formatter.ts`, `errors.ts`, `app.ts`, `bootstrap.ts`, and `lib/types.ts` only as needed to add:
   - `POST /cfo-wiki/companies/:companyKey/lint`
   - `GET /cfo-wiki/companies/:companyKey/lint`
   - `POST /cfo-wiki/companies/:companyKey/export`
   - `GET /cfo-wiki/companies/:companyKey/exports`
   - `GET /cfo-wiki/companies/:companyKey/exports/:exportRunId`
   - optionally, only if safe, `POST /cfo-wiki/companies/:companyKey/filed-pages` and `GET /cfo-wiki/companies/:companyKey/filed-pages`

5. Keep lint and export deterministic:
   - lint must inspect persisted page, link, ref, compile-run, extract, and freshness state
   - export paths must derive from canonical page keys
   - export output must be markdown-first plus manifest metadata
   - no runtime-codex, no prompt-built synthesis, no embeddings, no vector DB, no OCR, and no UI

6. Add or update focused tests in:
   - `packages/domain/src/cfo-wiki.spec.ts`
   - `packages/db/src/schema.spec.ts`
   - `apps/control-plane/src/modules/wiki/**/*.spec.ts`
   - `apps/control-plane/src/app.spec.ts`
   - `packages/testkit/**` only if a tiny shared wiki fixture clearly reduces duplication

7. Add `tools/cfo-wiki-lint-export-smoke.mjs` and register `smoke:cfo-wiki-lint-export:local` in `package.json`, then document the new alias in `docs/ops/local-dev.md`.

8. Apply only the smallest truthful active-doc updates this slice makes necessary:
   - mark `FP-0027` as historical shipped context instead of an unfinished active plan
   - refresh `docs/ops/source-ingest-and-cfo-wiki.md` so shipped F3B capabilities are present-tense and F3C is described accurately
   - refresh `README.md` and `START_HERE.md` only if the shipped F3C surface or next-slice wording becomes stale

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
pnpm smoke:cfo-wiki-lint-export:local
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Acceptance for this slice is met when all of the following are true:

- one active F3C Finance Plan exists and stays current during implementation
- persisted wiki lint runs and lint findings exist
- one company can run lint against stored wiki state and retrieve route-backed findings
- at least one narrow deterministic lint set ships and stays reviewable
- persisted wiki export runs exist
- one company can run deterministic markdown export and retrieve route-backed export metadata plus a stored bundle reference
- existing F3A and F3B compiler-owned pages still compile and remain route-backed
- broad F2 and source-ingest behavior remain intact
- engineering-twin reproducibility checks remain green unchanged
- durable filing only ships if compile replacement preserves filed pages across later compiles
- no runtime-codex, freeform LLM synthesis, embeddings, vector search, OCR, or wiki UI are added

Provenance, freshness, and limitation posture for this slice:

- lint findings must remain traceable to persisted wiki state rather than freeform markdown scanning alone
- export metadata must make bundle scope, timestamps, and limitations explicit
- filed pages, if shipped, must carry explicit provenance and remain clearly distinct from compiler-owned pages
- stale coverage, missing refs, unsupported document gaps, and weak evidence must stay visible in routes and exports

## Idempotence and Recovery

This slice should be safe to retry.

- lint reruns must create additive persisted runs and findings instead of mutating prior successful history in place
- export reruns must create additive persisted runs with deterministic output for the same stored wiki state
- compiler refresh must preserve non-compiler pages if filing lands
- if filing cannot be made ownership-safe without widening the slice, stop at lint plus export and record the durable-filing seam here rather than forcing it
- if a schema step fails, fix only the additive F3C shape instead of rewriting older migrations
- if a validation failure is outside this slice or the known narrow engineering-twin reproducibility surface, stop and report it rather than widening scope

## Artifacts and Notes

Expected artifacts from this slice:

- this active F3C Finance Plan, kept current as work proceeds
- additive wiki lint and export schema plus migration
- deterministic lint service and export service inside the wiki bounded context
- a packaged `pnpm smoke:cfo-wiki-lint-export:local` proof
- minimal truthful doc updates reflecting the shipped F3C surface
- if safe, a narrow filed-page route-backed seam with explicit provenance and preserved ownership

Evidence-bundle note:
this slice changes operator-visible wiki quality and portability surfaces, so route payloads and exported manifests must keep freshness posture, limitations, and source or state linkage visible enough for a human reviewer to trust what did and did not ship.

## Interfaces and Dependencies

Primary interfaces expected to change:

- wiki domain contracts in `packages/domain`
- additive wiki schema and migration in `packages/db`
- wiki repository, service, routes, formatter, and compiler-adjacent helpers in `apps/control-plane/src/modules/wiki/**`
- app container wiring in `apps/control-plane/src/bootstrap.ts`, `app.ts`, and `lib/types.ts`
- root smoke registration in `package.json`

Key dependencies and seams:

- raw bytes continue to flow only through the existing `SourceFileStorage` seam
- company and reporting-period truth continue to come from the existing Finance Twin repository seam
- export bundle storage should reuse existing local or object-store-safe patterns rather than inventing a new external system
- no new environment variables are expected unless explicit artifact storage metadata needs one, in which case the active docs must be updated in the same slice
- internal `@pocket-cto/*` package scope remains unchanged

## Outcomes & Retrospective

Historical shipped context.

The repo state now reflects the intended F3C implementation shape: persisted lint runs and findings, deterministic markdown-first export runs, and a narrow filed-artifact seam preserved across later compiler-owned compiles. `README.md`, `START_HERE.md`, and the active F3 sequencing now treat F3C as shipped, so the next active implementation plan is the narrow F3D concept, metric-definition, and policy-page slice rather than further F3C publish work.
