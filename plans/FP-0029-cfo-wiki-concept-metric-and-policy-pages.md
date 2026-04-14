# Add F3D CFO Wiki concept, metric-definition, and policy pages

## Purpose / Big Picture

This plan defines and executes the next narrow **F3D CFO Wiki** implementation slice for Pocket CFO.

The user-visible goal is to add deterministic higher-level knowledge pages on top of the shipped F3A foundation, F3B document-page compiler, and F3C lint/export/filed-artifact layer without widening into generic RAG, vector search, OCR, freeform wiki authorship, runtime-codex, or later F4/F5/F6 work.

F3D matters now because the wiki already has a stable compile spine, document bindings, source digest pages, lint, export, and ownership-safe filed artifacts. The next truthful gain is a compiler-owned page family for concept hubs, metric definitions, and policy overviews that stays grounded in stored Finance Twin state plus stored deterministic wiki state rather than inventing a second truth graph.

GitHub connector work is explicitly out of scope for this slice.

## Progress

- [x] 2026-04-14T00:36:57Z Complete preflight against fetched `origin/main`, confirm the exact requested branch, clean repo state, authenticated `gh`, and available local Postgres plus object storage before any edits.
- [x] 2026-04-14T00:36:57Z Read the active docs, prior F3 plans, ops docs, AGENTS guidance, and the current wiki/source/finance-twin seams before defining the F3D contract.
- [x] 2026-04-14T00:36:57Z Create `plans/FP-0029-cfo-wiki-concept-metric-and-policy-pages.md` and apply the smallest truthful pre-code plan/doc polish in `plans/ROADMAP.md` plus `plans/FP-0028-cfo-wiki-lint-export-and-durable-filing.md`.
- [x] 2026-04-14T02:03:00Z Extend the wiki domain, additive schema, compiler state, deterministic registries, renderers, refs, links, and smoke tooling for compiler-owned `concept`, `metric_definition`, and `policy` pages while preserving the shipped F3A/F3B/F3C routes and ownership boundaries.
- [x] 2026-04-14T02:03:00Z Add focused domain, DB, repository, compiler, route, and smoke coverage for canonical page keys, summary counts, deterministic registries, policy-document gaps, and route-backed reads.
- [x] 2026-04-14T02:16:38Z Complete the F3D QA rerun set requested in the follow-up audit pass: domain/wiki schema specs, focused wiki registry and policy-gap specs, the full smoke ladder from F1 through F3D, and the twin workflow-sync/test-suite-sync/codeowners validations all passed.
- [x] 2026-04-14T01:52:21Z Finish the full publish validation ladder for the existing F3D worktree: rerun the wiki specs, full smoke ladder, twin sync validations, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`, then tighten the remaining active-doc wording so the branch is ready for one publish commit plus push or PR.

## Surprises & Discoveries

- Observation: the current F3A/F3B/F3C bounded context already has the right seams for F3D to stay additive.
  Evidence: `apps/control-plane/src/modules/wiki/service.ts`, `repository.ts`, `drizzle-repository.ts`, `compiler/compile-state.ts`, `compiler/page-registry.ts`, `compiler/render.ts`, `compiler/links.ts`, and `compiler/refs.ts` already separate compile-state loading, deterministic registry construction, rendering, relationship building, and persistence.

- Observation: the roadmap is stale about the F3 slice map even though the active docs and README already say F3D is the next narrow thread.
  Evidence: `plans/ROADMAP.md` still places concept, metric, and policy pages inside `F3B`, while `README.md`, `START_HERE.md`, and the user contract clearly treat them as the next slice after shipped F3C.

- Observation: `FP-0028` still reads as if final validation and publish are pending even though the repo state and active docs already describe F3C as shipped.
  Evidence: `plans/FP-0028-cfo-wiki-lint-export-and-durable-filing.md` still has an unchecked publish-validation progress item and an in-progress retrospective despite the current root docs treating F3C as merged context.

- Observation: source bindings already carry the exact explicit policy boundary F3D needs.
  Evidence: `packages/domain/src/cfo-wiki.ts`, `packages/db/src/schema/wiki.ts`, `apps/control-plane/src/modules/wiki/service.ts`, and `bound-sources.ts` already persist `includeInCompile` and `documentRole`, including `policy_document`, so policy pages can stay explicit and non-heuristic.

- Observation: the existing wiki compiler does not currently need freeform measure output or route expansion to support metric-definition pages.
  Evidence: `compiler/compile-state.ts` already loads Finance Twin slice freshness and reporting-period linkage, and the new metric-definition pages can stay definition-first, route-backed, and evidence-aware without querying novel numeric surfaces.

- Observation: the only additive persistence change needed for F3D is the wiki page-kind enum expansion.
  Evidence: `packages/db/drizzle/0029_careless_stardust.sql` only adds `concept`, `metric_definition`, and `policy` values to `cfo_wiki_page_kind`; the existing page, link, ref, and compile-run tables already support the new compiler-owned families.

- Observation: the current control-plane wiki specs already covered most of the route and persistence surface once expectations were updated for fixed knowledge-page counts.
  Evidence: the existing `routes.spec.ts`, `service.spec.ts`, and `compiler/page-registry.spec.ts` needed only narrow truthfulness updates, while the new `knowledge-pages.spec.ts` covers extracted, unsupported, and failed policy-page behavior end to end.

- Observation: the strict QA pass found the F3D behavior green, but the branch still has not been committed or pushed.
  Evidence: `git status --short --untracked-files=all` still shows the full F3D patch set as local changes, and `gh pr list --head codex/f3d-cfo-wiki-concept-metric-and-policy-pages-local-v1 --json url,state,title` returned no PR for the branch.

## Decision Log

- Decision: keep F3D scoped to compiler-owned `concept`, `metric_definition`, and `policy` pages only.
  Rationale: the user explicitly wants the narrowest truthful higher-level wiki layer and forbids widening into generic search, freeform authorship, runtime-codex, new extractors, or later F4/F5/F6 behavior.

- Decision: drive concept pages and metric-definition pages from fixed code-owned registries.
  Rationale: deterministic registries keep the wiki reviewable, prevent heuristic topic mining, and make page coverage explicit instead of silently expanding into unsupported finance areas.

- Decision: compile policy pages only for bound document sources where `includeInCompile=true` and `documentRole === policy_document`.
  Rationale: policy scope must be explicit and source-backed; filenames, titles, or vague document names are not enough to justify a policy page.

- Decision: keep the existing route surface and canonical slash-delimited page-key model.
  Rationale: `GET /cfo-wiki/companies/:companyKey/pages/*` already supports route-backed page reads, so F3D should extend canonical keys and counts rather than introduce a new public API unless a truly minimal addition proves necessary.

- Decision: use stored deterministic document extracts plus source digest state for policy pages and never invent legal or approval conclusions.
  Rationale: policy pages should expose headings, excerpts, freshness, limitations, and explicit gaps without crossing the product safety boundary into interpretation or control conclusions.

- Decision: preserve the F3C ownership boundary where compiler-owned refreshes replace only compiler-owned pages and never mutate filed artifacts.
  Rationale: F3D extends the compiler-owned family but must not regress the durability guarantees already shipped for filed artifact pages.

- Decision: keep GitHub connector work out of scope and do not use GitHub Connector Guard in this slice.
  Rationale: the user instructed it directly, and all required work stays inside the finance evidence, Finance Twin, and wiki path.

- Decision: package F3D with one smoke that proves concept, metric-definition, and policy pages together rather than splitting those proofs into multiple scripts.
  Rationale: the new `tools/cfo-wiki-concept-metric-policy-smoke.mjs` script keeps the surface reviewable while still proving the fixed registries, explicit policy binding scope, and visible unsupported-gap behavior in one Docker-backed flow.

- Decision: rerun the full publish validation ladder in this continuation before committing the branch.
  Rationale: the F3D implementation was behavior-green but still unpublished, so the safest closeout was to rerun the exact intended publish bar, confirm repo-wide static and repro health, then publish from one fully green signal.

## Context and Orientation

Pocket CFO has already shipped:

- F1 authoritative raw-source registration, snapshots, files, checksums, and immutable storage refs
- broad F2 Finance Twin breadth through F2O
- F3A deterministic wiki compile runs, compiler-owned foundation pages, links, refs, and route-backed reads
- F3B explicit company-scoped document bindings, deterministic document extracts, source digest pages, and backlinks
- F3C persisted lint runs, deterministic export runs, and ownership-safe filed artifact preservation

The active-doc boundary for this slice is:

- `README.md`
- `START_HERE.md`
- `AGENTS.md`
- `PLANS.md`
- `WORKFLOW.md`
- `plans/ROADMAP.md`
- `plans/FP-0026-cfo-wiki-foundation-and-page-registry.md`
- `plans/FP-0027-cfo-wiki-document-page-compiler-and-backlinks.md`
- `plans/FP-0028-cfo-wiki-lint-export-and-durable-filing.md`
- this plan: `plans/FP-0029-cfo-wiki-concept-metric-and-policy-pages.md`
- `docs/ops/source-ingest-and-cfo-wiki.md`
- `docs/ops/local-dev.md`
- `docs/ops/codex-app-server.md`

The relevant bounded contexts are:

- `packages/domain/src/cfo-wiki.ts` for pure wiki contracts, page kinds, canonical page keys, and route-visible schemas
- `packages/db/src/schema/wiki.ts` plus `packages/db/drizzle/**` for additive wiki persistence only
- `apps/control-plane/src/modules/wiki/**` for compiler state, registry construction, page rendering, refs, links, routes, formatting, and smoke-safe deterministic behavior
- `apps/control-plane/src/modules/sources/**` for authoritative source, snapshot, raw-file identity, and stored raw-byte reads
- `apps/control-plane/src/modules/finance-twin/**` for existing company, reporting-period, freshness, and supported metric-family seams only

GitHub connector work is out of scope.
The engineering-twin modules remain intact and their reproducibility validations must stay green unchanged.

## Plan of Work

Implement F3D in six bounded passes.

First, extend the pure wiki contracts and additive DB schema for the new compiler-owned page kinds and canonical page keys. Keep the internal `@pocket-cto/*` package scope unchanged and avoid any destructive schema churn.

Second, add fixed deterministic registries for the initial supported concept and metric-definition pages. Those registries should live in code, stay narrow, and explicitly map only to already-shipped Finance Twin or wiki-backed coverage.

Third, extend compile-state loading and the page registry so concept pages, metric-definition pages, and policy pages become first-class compiler-owned pages alongside the shipped F3A/F3B/F3C families. Policy pages must use only explicit `policy_document` bindings and the latest bound snapshot plus stored deterministic extract state.

Fourth, extend page rendering, link construction, and ref construction so every new F3D page exposes title, page kind, canonical key, deterministic summary, freshness posture, limitations, evidence refs, related links, and backlinks. Keep routes thin and avoid new public endpoints unless a very small truthful addition becomes unavoidable.

Fifth, add focused tests plus a packaged `pnpm smoke:cfo-wiki-concept-metric-policy:local` proof. The smoke should prove concept, metric-definition, and policy pages together while keeping existing F1/F2/F3 smokes untouched.

Sixth, apply only the smallest truthful doc refresh after the code lands so root guidance reflects the shipped F3D surface and the next narrow work after it without claiming broader wiki capabilities.

## Concrete Steps

1. Extend `packages/domain/src/cfo-wiki.ts`, `packages/domain/src/index.ts`, and `packages/domain/src/cfo-wiki.spec.ts` with:
   - page kind support for `concept`, `metric_definition`, and `policy`
   - canonical page-key support for `concepts/<conceptKey>`, `metrics/<metricKey>`, and `policies/<sourceId>`
   - any narrow helper builders needed for those canonical keys
   - page-kind counts and route-visible schemas updated for the new families

2. Extend `packages/db/src/schema/wiki.ts`, `packages/db/src/schema/index.ts`, `packages/db/src/schema.spec.ts`, and add an additive migration under `packages/db/drizzle/**` for the expanded page-kind enum only.
   Do not add destructive schema changes or new tables unless implementation proves a tiny additive table is truly necessary.

3. Add the fixed deterministic F3D registries inside `apps/control-plane/src/modules/wiki/compiler/**` for these initial keys only:
   - concepts: `cash`, `receivables`, `payables`, `spend`, `contract-obligations`, `policy-corpus`
   - metric definitions: `cash-posture`, `receivables-aging`, `collections-posture`, `payables-aging`, `payables-posture`, `spend-posture`, `obligation-calendar`

4. Extend compile-state and registry construction to:
   - preserve the single-running-compile-per-company rule
   - load current compiler-owned wiki state, bound document sources, deterministic extracts, and Finance Twin slice freshness
   - derive policy-page candidates only from bound `policy_document` sources with `includeInCompile=true`
   - add deterministic concept, metric-definition, and policy registry entries while preserving all shipped F3A/F3B/F3C pages

5. Extend rendering, links, and refs so:
   - concept pages act as deterministic hubs over related metric-definition pages, policy pages, source digest pages, and foundation pages
   - metric-definition pages describe supported measure families, source support, freshness rules, and limitations without inventing numeric answers
   - policy pages describe the latest bound snapshot, extract support status, heading outline and excerpts when available, and visible unsupported or failed gaps when not
   - related links and backlinks remain explicit and canonical

6. Keep public route behavior on the existing surfaces:
   - `GET /cfo-wiki/companies/:companyKey`
   - `GET /cfo-wiki/companies/:companyKey/index`
   - `GET /cfo-wiki/companies/:companyKey/log`
   - `GET /cfo-wiki/companies/:companyKey/pages/*`
   - existing compile, bind, lint, export, and filed-page routes

7. Add or update focused tests in:
   - `packages/domain/src/cfo-wiki.spec.ts`
   - `packages/db/src/schema.spec.ts`
   - `apps/control-plane/src/modules/wiki/**/*.spec.ts`
   - `apps/control-plane/src/app.spec.ts`
   - `packages/testkit/**` only if a tiny shared fixture clearly reduces duplication

8. Add `tools/cfo-wiki-concept-metric-policy-smoke.mjs`, register `smoke:cfo-wiki-concept-metric-policy:local` in `package.json`, and document the alias in `docs/ops/local-dev.md`.

9. After code lands, apply only the smallest truthful doc updates in:
   - `README.md`
   - `docs/ops/source-ingest-and-cfo-wiki.md`
   - `docs/ops/local-dev.md`
   - `START_HERE.md` only if F3D or next-step wording is stale after what actually ships

## Validation and Acceptance

Run validation in this order:

```bash
pnpm --filter @pocket-cto/domain exec vitest run src/cfo-wiki.spec.ts
pnpm --filter @pocket-cto/db exec vitest run src/schema.spec.ts
bash -lc "cd apps/control-plane && pnpm exec vitest run src/modules/wiki/**/*.spec.ts src/app.spec.ts"
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
pnpm smoke:cfo-wiki-concept-metric-policy:local
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Acceptance for this slice is met when all of the following are true:

- one active F3D Finance Plan exists and stays current during implementation
- compiler-owned `concept`, `metric_definition`, and `policy` page kinds exist
- `GET /cfo-wiki/companies/:companyKey/pages/*` serves `concepts/<conceptKey>`, `metrics/<metricKey>`, and `policies/<sourceId>`
- concept pages compile deterministically from fixed code-owned registries plus stored Finance Twin/wiki state only
- metric-definition pages compile deterministically from fixed code-owned registries plus stored Finance Twin/wiki state only
- policy pages compile only for explicit `policy_document` bindings and use stored deterministic extracts plus source digest state
- unsupported, failed, or missing policy extract coverage stays visible as a gap instead of fake policy prose
- existing F3A/F3B/F3C pages still compile and remain readable
- existing F1, broad F2 through F2O, and engineering-twin reproducibility behavior remain intact
- no runtime-codex, freeform LLM synthesis, embeddings, vector search, OCR, deep-read dependency, or wiki UI are added

Provenance, freshness, and limitation posture for this slice:

- raw sources remain immutable and authoritative
- concept and metric-definition pages must stay definition-first and visibly limited to what the stored product already supports
- policy pages must expose source linkage, snapshot identity, extract status, freshness posture, and limitations plainly
- missing policy coverage, missing metric availability, and unsupported concept backing must remain visible instead of being hidden

## Idempotence and Recovery

This slice should be safe to retry.

- re-running compile must continue to replace only compiler-owned pages and preserve filed artifacts
- concept and metric-definition registries must remain deterministic across reruns for the same stored state
- policy pages must reuse stored extract state when checksum plus parser version match and must not mutate prior successful pages if a later compile fails
- if the additive enum migration fails, fix only the F3D page-kind shape instead of rewriting older migrations
- if a validation failure is outside this slice or the known narrow engineering-twin reproducibility surface, stop and report it rather than widening scope

## Artifacts and Notes

Expected artifacts from this slice:

- this active F3D Finance Plan, kept current as work proceeds
- additive domain and DB support for the new wiki page families
- deterministic concept, metric-definition, and policy compiler behavior inside the wiki bounded context
- a packaged `pnpm smoke:cfo-wiki-concept-metric-policy:local` proof
- minimal truthful doc updates reflecting the shipped F3D surface and the next narrow post-F3D direction

Evidence-bundle note:
this slice changes operator-visible wiki evidence design, route-visible limitations, and policy-source scope, so the resulting pages must keep freshness, explicit gaps, source linkage, and non-goals visible enough for a human reviewer to trust what did and did not ship.

## Interfaces and Dependencies

Primary interfaces expected to change:

- wiki domain contracts in `packages/domain`
- additive wiki schema and migration in `packages/db`
- wiki compiler, repository, service, routes, formatter, and smoke helpers in `apps/control-plane/src/modules/wiki/**`
- app wiring or service ports only if a tiny additive contract change is truly necessary
- root smoke registration in `package.json`

Key dependencies and seams:

- raw bytes continue to flow only through the existing `SourceFileStorage` seam
- company, reporting-period, and slice freshness truth continue to come from existing Finance Twin repository seams
- document-role scope continues to come from persisted wiki source bindings
- no new environment variables are expected
- internal `@pocket-cto/*` package scope remains unchanged

## Outcomes & Retrospective

The repo state now reflects the intended shipped F3D implementation shape:

- the domain and DB schema now recognize `concept`, `metric_definition`, and `policy` compiler-owned pages
- the wiki compiler builds fixed deterministic concept and metric-definition registries plus explicit policy pages from `policy_document` bindings only
- route-backed reads now serve `concepts/<conceptKey>`, `metrics/<metricKey>`, and `policies/<sourceId>` on the existing wildcard page route
- the packaged F3D smoke alias now exists so Docker-backed validation can prove the new page families without widening product scope
- the full validation ladder now passes through `pnpm ci:repro:current`, so the branch is ready for one publish commit, push, and PR without reopening F3 scope

F3D stayed inside the intended fixed-registry plus explicit-policy-binding boundary throughout implementation and closeout.
With F3A through F3D now shipped, the next new major implementation phase should move to F4 finance discovery answers rather than another required F3 continuation.
