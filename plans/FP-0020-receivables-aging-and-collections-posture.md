# Add the F2L receivables-aging extractor and truthful collections-posture read models

## Purpose / Big Picture

This plan implements the next narrow **F2L Finance Twin** breadth slice for Pocket CFO.

The user-visible goal is to add one deterministic `receivables_aging_csv` extractor family on top of the shipped F2A through F2K baseline, persist truthful receivables-aging state from immutable stored raw bytes, and expose backend-first receivables-aging plus collections-posture reads for one company. Operators should be able to see which customers exist in the latest successful receivables-aging slice, which explicit bucket labels the source actually reported, which dates are known or unknown, how much collections posture can be summarized truthfully without invoice-level invention, and how every persisted receivables-aging row traces back to raw-source provenance.

This slice stays intentionally narrow and additive. It does not add AP aging, invoice-level ingestion, DSO, reserves, collection forecasts, wiki or report generation, discovery-answer UX, monitoring, controls, connector APIs, package-scope rename work, or any F3 through F6 implementation. GitHub connector work is explicitly out of scope, and the engineering-twin path remains intact.

## Progress

- [x] 2026-04-12T18:55:01Z Complete preflight against fetched `origin/main`, confirm `HEAD` matches fetched `origin/main`, confirm the exact branch name, verify a clean worktree, verify `gh` auth, and verify local Postgres plus object storage availability.
- [x] 2026-04-12T18:55:01Z Read the active repo guidance, roadmap, shipped F2A through F2K Finance Plans, scoped AGENTS files, required ops docs, and the current finance-twin plus source-registry seams before planning.
- [x] 2026-04-12T18:55:01Z Create the active F2L Finance Plan in `plans/FP-0020-receivables-aging-and-collections-posture.md` before code changes.
- [x] 2026-04-12T20:19:00Z Implement additive receivables-aging contracts, schema, extractor dispatch, persistence, read models, targeted tests, packaged smoke coverage, and root-doc truthfulness fixes.
- [x] 2026-04-12T20:19:00Z Generate and apply the additive receivables-aging DB migration for both the local development database and the derived test database before DB-backed specs.
- [x] 2026-04-12T20:19:00Z Prove the new extractor, repository, service, and shared domain or schema seams with focused green tests before broader regression.
- [x] 2026-04-12T20:29:10Z Run the required validation ladder in the requested order, fix only in-scope failures, and confirm every required command is green, including `pnpm ci:repro:current`.
- [ ] 2026-04-12T20:29:10Z Create the one requested local commit, push `codex/f2l-receivables-aging-and-collections-posture-local-v1`, verify the remote head, and create or report the PR into `main`.

## Surprises & Discoveries

The current F2K bank slice already proved the key shape F2L should reuse: `FinanceTwinService` reads stored raw bytes through `SourceFileStorage.read()`, extractor dispatch is content-driven, sync runs persist slice-scoped stats, and route-visible lineage refs already exist for backend-first finance reads.

The shared finance summary contract still intentionally stops at trial balance, chart of accounts, and general ledger, while later breadth slices use dedicated read models. That is useful for F2L because receivables-aging and collections-posture can remain additive routes rather than forcing a large shared summary-contract expansion.

The current root docs are stale after the F2K merge. `README.md`, `START_HERE.md`, and `docs/ops/local-dev.md` still describe F2K as the active next slice rather than merged baseline plus active F2L guidance.

The current route-visible limitations copy in `apps/control-plane/src/modules/finance-twin/summary.ts` still names bank-account summary and cash posture as the current edge. F2L should refresh that wording so it truthfully includes receivables-aging and collections-posture without implying invoice detail, DSO, reserve logic, or expected cash timing.

The derived test database does not auto-pick up new schema changes when only the primary local database is migrated. F2L needs an explicit second migration pass against `TEST_DATABASE_URL` before DB-backed repository or service specs can reset their tables successfully.

One post-typecheck runtime bug appeared during the final receivables-aging smoke rerun: the mapper initially imported `FinanceReceivablesAgingBucketValueSchema` as a type-only symbol, which erased the runtime parser. The fix stayed narrow to the repository-mapper import and the smoke turned green immediately afterward.

## Decision Log

Decision: implement one new extractor family named `receivables_aging_csv`.
Rationale: the user explicitly allows one new deterministic finance source family only, and receivables aging is the narrowest truthful collections-working-capital extension after the bank breadth slice.

Decision: keep F1 raw ingest authoritative and immutable by reading stored raw bytes through the existing source-storage seam.
Rationale: the user explicitly forbids using ingest receipt previews, `sampleRows`, or shallow parser summaries for receivables-aging state.

Decision: persist customer identity separately from receivables-aging rows.
Rationale: customers are a reusable company dimension, while aging buckets, currencies, dates, and row-level provenance belong to slice-scoped receivables-aging observations.

Decision: preserve exact recognized bucket labels instead of forcing one universal aging scheme.
Rationale: the user explicitly forbids silently relabeling weak or ambiguous bucket columns into stronger semantics.

Decision: keep the shared company summary contract unchanged apart from truthful limitations copy, and ship F2L through dedicated receivables-aging plus collections-posture routes.
Rationale: F2K already established the pattern of additive breadth routes without perturbing the core F2A through F2J summary semantics, which keeps the diff safer and easier to review.

Decision: make collections posture currency-bucketed and date-explicit, with no company-wide cross-currency total and no fake as-of unification.
Rationale: the user explicitly forbids cross-currency summing, silent date flattening, collection forecasts, reserve logic, and DSO in this slice.

Decision: treat overlapping or partial bucket semantics conservatively in collections posture.
Rationale: rows that only provide partial rollups such as `over_90` or overlapping mixes such as detailed buckets plus `past_due` should remain explicit and diagnostic rather than being coerced into stronger totals.

Decision: store reported receivables-aging bucket keys on sync-run stats instead of adding a separate slice-metadata table.
Rationale: the routes need to truthfully expose which exact bucket columns the source reported, including zero-only columns, and sync-run stats are the smallest additive persisted seam that preserves that fact without widening the data model further.

Decision: GitHub connector work remains out of scope.
Rationale: this slice is finance-twin extraction, provenance, and backend-read work only.

## Context and Orientation

Pocket CFO has already shipped F1 raw source registration and immutable file ingest plus F2A through F2K additive finance-twin slices: trial-balance sync, chart-of-accounts sync, general-ledger sync, snapshot and lineage, reconciliation readiness, reporting-window truth, account-bridge readiness, balance-bridge prerequisites, source-backed balance proof, balance-proof lineage drill, bank-account inventory, and cash posture.

The repo already provides the seams F2L should reuse:

- `packages/domain/src/finance-twin.ts` for pure finance-twin contracts and route schemas
- `packages/db/src/schema/finance-twin.ts` plus `packages/db/drizzle/**` for additive persisted finance state
- `apps/control-plane/src/modules/finance-twin/` for extractor dispatch, persistence orchestration, read-model assembly, diagnostics, and route transport
- `apps/control-plane/src/modules/sources/**` for immutable raw-source registration, storage, and metadata lookup
- `apps/control-plane/src/bootstrap.ts`, `apps/control-plane/src/lib/types.ts`, `apps/control-plane/src/lib/http-errors.ts`, `apps/control-plane/src/app.ts`, and `apps/control-plane/src/test/database.ts` for wiring and regression coverage
- `tools/` and root `package.json` for packaged local smoke proofs

GitHub connector work is out of scope. The engineering twin remains in place and must keep its reproducibility tests green unchanged. Replay behavior is unchanged in this slice, but provenance, freshness, diagnostics, limitations, and operator-visible wording are first-class because F2L adds backend-visible collections evidence surfaces.

## Plan of Work

Implement this slice in six bounded passes.

First, extend the finance-twin domain contracts with one new extractor key plus additive customer and receivables-aging record schemas, a latest-successful receivables-aging slice snapshot, one receivables-aging inventory view, and one collections-posture view. Keep the contracts explicit about bucket labels, currencies, known-versus-unknown as-of dates, lineage refs, freshness, diagnostics, and limitations.

Second, add the smallest additive DB schema needed for persisted customer identity and receivables-aging rows. Keep the schema additive-first, preserve explicit lineage through `finance_twin_lineage`, and avoid invoice tables or broader working-capital redesign.

Third, add one deterministic `receivables_aging_csv` extractor and wire it into finance-twin extractor dispatch. The extractor should only accept explicit recognized headers, preserve exact bucket labels, fail truthfully on conflicting duplicate customer-and-bucket observations inside one slice, and avoid strengthening weak semantics.

Fourth, extend the finance-twin repository and service seams so receivables-aging sync persists customers and aging rows transactionally, stores slice stats on sync runs, and assembles latest-successful receivables-aging plus collections-posture reads from persisted state only.

Fifth, expose the new backend-first routes with thin transport code and focused assemblers. The receivables-aging route should surface customer rows, explicit bucket values, dates, and lineage refs. The collections-posture route should surface truthful currency buckets, coverage summaries, diagnostics, freshness, and limitations without cross-currency totals, fake as-of unification, invoice detail, or forecast logic.

Sixth, update focused tests, add one packaged local receivables-aging smoke, and repair the stale root docs plus in-scope limitations copy so merged F2K baseline and active F2L guidance are truthful again.

## Concrete Steps

1. Keep `plans/FP-0020-receivables-aging-and-collections-posture.md` current throughout the slice, updating `Progress`, `Decision Log`, `Surprises & Discoveries`, and `Outcomes & Retrospective` after meaningful milestones.

2. Extend `packages/domain/src/finance-twin.ts` and `packages/domain/src/index.ts` to cover:
   - `receivables_aging_csv` in the extractor-key enum
   - additive `FinanceCustomerRecord`
   - additive `FinanceReceivablesAgingRowRecord`
   - additive lineage target kinds for `customer` and `receivables_aging_row` if needed
   - additive receivables-aging bucket contracts that preserve exact recognized labels
   - one latest-successful receivables-aging slice shape
   - one receivables-aging inventory or customer-aging view
   - one collections-posture view with currency buckets, coverage summary, diagnostics, and limitations

3. Add additive DB schema under `packages/db/src/schema/finance-twin.ts` and export it from `packages/db/src/schema/index.ts`.
   The narrow expected persisted shape is:
   - `finance_customers`
   - `finance_receivables_aging_rows`
   - additive enum values or JSON columns needed for bucket labels and dates

4. Generate or author the forward-only migration under `packages/db/drizzle/` and update `packages/db/drizzle/meta/` as needed.
   Keep the change additive-first and do not mutate or delete existing finance or engineering tables.

5. Extend `apps/control-plane/src/modules/finance-twin/` with bounded modules that keep routes thin, likely including:
   - `receivables-aging-csv.ts`
   - `receivables-aging-csv.spec.ts`
   - `receivables-aging.ts`
   - `collections-posture.ts`
   - repository and mapper additions for customer plus aging persistence and reads
   - route and schema additions for the new GET endpoints

6. Preserve raw-source authority by building receivables-aging sync only from stored raw bytes, source metadata, sync runs, and persisted lineage.
   Do not derive receivables state from ingest receipts, source previews, sample rows, trial balances, or general-ledger activity.

7. Implement minimum extractor behavior that accepts likely headers for:
   - customer identity: `customer`, `customer_name`, `customer_id`, `account`, `account_name`
   - date fields: `as_of`, `aging_date`, `report_date`, `snapshot_date`
   - currency fields: `currency`, `currency_code`
   - aging buckets: `current`, `0_30`, `1_30`, `31_60`, `61_90`, `91_120`, `120_plus`, `over_90`, `over_120`, `past_due`, `total`

8. Keep extractor truthfulness strict:
   - exact recognized bucket labels stay exact
   - no invoice detail is inferred
   - no collection forecast is inferred
   - no DSO or reserve logic is inferred
   - conflicting duplicate rows for the same customer and bucket in one slice fail
   - identical duplicates may be deduped deterministically
   - missing as-of dates remain explicit rather than synthesized

9. Add route behavior for:
   - `GET /finance-twin/companies/:companyKey/receivables-aging`
   - `GET /finance-twin/companies/:companyKey/collections-posture`

10. Route-visible receivables-aging rows should include at minimum:
    - customer identity
    - currency
    - known or unknown as-of date
    - exact reported bucket values
    - explicit total when present or derivable from non-overlapping explicit buckets only if that choice remains truthful
    - lineage ref or direct proof of source-row provenance

11. Route-visible collections-posture output should include at minimum:
    - company
    - latest successful receivables-aging slice
    - freshness
    - currency buckets
    - coverage summary
    - diagnostics
    - limitations

12. Keep collections-posture truth conservative:
    - no cross-currency company total
    - current totals only when `current` is explicit
    - past-due totals only when a row provides one non-overlapping full past-due basis
    - partial rollups such as `over_90` and `over_120` remain explicit diagnostics, not full past-due replacements
    - mixed dated and undated rows remain explicit

13. Add or update focused tests covering:
    - `receivables_aging_csv` extraction from raw bytes
    - ambiguous bucket handling without silent strengthening
    - mixed as-of-date and mixed bucket-semantics collections-posture behavior
    - no cross-currency company total
    - conflicting duplicate-row failure
    - lineage refs or route-visible source-row provenance
    - route-level receivables-aging and collections-posture behavior in `src/app.spec.ts`

14. Add `tools/finance-twin-receivables-aging-smoke.mjs` and a root script in `package.json`.
    The packaged proof should show that:
    - a stored raw receivables-aging CSV syncs through the finance twin
    - receivables-aging inventory is read from persisted state
    - collections posture stays bucketed by currency and truthful bucket semantics
    - mixed or missing as-of dates remain explicit
    - lineage is drillable back to source, snapshot, and source-file boundaries

15. Update the stale active docs in:
    - `README.md`
    - `START_HERE.md`
    - `docs/ops/local-dev.md`
    - `plans/FP-0019-bank-account-summary-and-cash-posture.md` only if a tiny merged-status note is strictly necessary
    - `apps/control-plane/src/modules/finance-twin/summary.ts` for truthful route-visible limitations copy if needed

16. Run validation in this exact order:

```bash
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/finance-twin/receivables-aging-csv.spec.ts src/modules/finance-twin/extractor-dispatch.spec.ts src/modules/finance-twin/drizzle-repository.spec.ts src/modules/finance-twin/service.spec.ts src/app.spec.ts
pnpm --filter @pocket-cto/domain exec vitest run src/finance-twin.spec.ts
pnpm --filter @pocket-cto/db exec vitest run src/schema.spec.ts
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
pnpm run smoke:finance-twin-receivables-aging:local
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

17. If and only if every required validation command is green, create exactly one local commit:

```bash
git commit -m "feat: add finance twin receivables aging"
```

18. If fully green and edits were made, confirm the branch remains `codex/f2l-receivables-aging-and-collections-posture-local-v1`, show `git branch --show-current`, `git log --oneline -3`, and `git status --short --untracked-files=all`, push that exact branch, verify the remote head, and create or report the PR into `main` with the requested title and body.

## Validation and Acceptance

Required validation order:

```bash
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/finance-twin/receivables-aging-csv.spec.ts src/modules/finance-twin/extractor-dispatch.spec.ts src/modules/finance-twin/drizzle-repository.spec.ts src/modules/finance-twin/service.spec.ts src/app.spec.ts
pnpm --filter @pocket-cto/domain exec vitest run src/finance-twin.spec.ts
pnpm --filter @pocket-cto/db exec vitest run src/schema.spec.ts
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
pnpm run smoke:finance-twin-receivables-aging:local
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Acceptance is met when all of the following are true:

- a deterministic `receivables_aging_csv` extractor exists and reads stored raw source bytes rather than ingest receipt summaries
- the Finance Twin persists customer identity and receivables-aging state instead of keeping parsing output transient
- `GET /finance-twin/companies/:companyKey/receivables-aging` exists and is route-backed
- `GET /finance-twin/companies/:companyKey/collections-posture` exists and is route-backed
- source lineage remains explicit through source, snapshot, and source-file boundaries for persisted receivables-aging facts
- collections posture does not sum across currencies into one company-wide number
- collections posture does not silently relabel weak bucket semantics into stronger ones
- mixed or missing as-of dates stay explicit in diagnostics or limitations rather than being flattened into one fake receivables date
- existing summary, snapshot, reconciliation, account-bridge, balance-bridge-prerequisites, source-backed-balance-proof, balance-proof-lineage, bank-account inventory, and cash-posture surfaces remain truthful and understandable
- F1 source-ingest behavior still works
- F2A through F2K behavior still works
- engineering-twin reproducibility tests still pass unchanged
- `README.md`, `START_HERE.md`, and `docs/ops/local-dev.md` truthfully describe merged F2K baseline and active F2L guidance

Provenance, freshness, replay, and limitation posture:
this slice must keep raw sources immutable, keep receivables-aging facts lineaged to stored source evidence, surface stale, partial, undated, mixed-date, overlapping-bucket, and non-comparable bucket posture plainly, and avoid implying invoice-level accuracy, expected collection timing, reserve logic, DSO, or stronger bucket semantics than the source explicitly provides.

## Idempotence and Recovery

This slice is additive-first and safe to retry when followed carefully.

- Re-running finance syncs for the same stored receivables-aging file should deterministically replace or upsert the same slice-scoped derived state without mutating the raw source bytes.
- Re-running targeted tests and smokes should be safe because the control-plane test DB reset truncates persisted finance state between cases.
- If the new extractor is too permissive or ambiguous, tighten header matching and bucket aggregation rules instead of weakening truthfulness or broadening scope.
- If a DB migration is wrong, fix it additively, rerun the narrowest migration step needed, and then restart the validation ladder from the requested order.
- If validation fails outside this slice or outside the known narrow engineering-twin reproducibility surface, stop and report the blocker instead of widening scope.

## Artifacts and Notes

Expected artifacts from this slice:

- one active F2L Finance Plan
- additive finance-twin domain and DB contracts for customers and receivables-aging rows
- one new deterministic extractor family for `receivables_aging_csv`
- route-backed receivables-aging and collections-posture views
- focused tests and one packaged local receivables-aging smoke
- truthful root-doc and limitation-copy updates
- one clean commit, push, and PR only if the full validation ladder is green

Evidence-bundle note:
this slice changes operator-visible finance read surfaces, so the resulting route contracts must keep sources, freshness, assumptions, gaps, and limitations visible enough for a human to review without re-reading the chat. It does not introduce new mission artifacts, replay categories, or external approval flows.

## Interfaces and Dependencies

Package and runtime boundaries:

- `@pocket-cto/domain` remains the source of truth for finance-twin contracts
- `@pocket-cto/db` remains limited to schema and DB helpers
- `apps/control-plane` owns raw-byte extraction, persistence orchestration, read-model assembly, and HTTP transport
- `apps/web` stays out of scope unless a tiny read-only surface becomes strictly unavoidable, which is not planned for F2L

Configuration expectations:

- reuse the existing Postgres and S3-compatible object-store configuration
- add no new environment variables unless implementation proves one is strictly unavoidable
- keep internal `@pocket-cto/*` package names unchanged

Upstream and downstream notes:

- F1 source ingest remains the only authoritative raw-source entry point
- F2L should become the truthful receivables and collections layer that later F4 or F5 slices may cite, but F2L itself must not start discovery-answer, memo, packet, or monitoring work
- GitHub connector work is explicitly out of scope

## Outcomes & Retrospective

Implementation is in place for the additive F2L path: one deterministic `receivables_aging_csv` extractor, persisted customer and receivables-aging row state, backend-first `/receivables-aging` plus `/collections-posture` reads, focused tests, one packaged local smoke, and refreshed root-doc guidance for merged F2K plus active F2L repo truth.

The main mid-slice surprise was operational rather than architectural: the derived test database needed its own explicit migration run before DB-backed specs could reset the new receivables-aging tables. Once that was applied, the focused extractor, repository, service, and shared contract specs all went green. A later validation pass also caught one narrow runtime import mistake in the bucket-value mapper, which was fixed without widening the design and immediately re-proved by the receivables-aging smoke.

The full requested validation ladder is now green: targeted finance-twin specs, domain and DB specs, existing F2A through F2K smokes, the new receivables-aging smoke, engineering-twin regression specs, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`.

Remaining work is the requested git publication sequence only: one clean commit, push the existing branch, verify the remote head, and create or report the PR into `main`.
