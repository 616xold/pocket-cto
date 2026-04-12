# Add F2M payables-aging ingest and truthful payables-posture reads

## Purpose / Big Picture

This plan implements the next narrow **F2M Finance Twin** breadth slice for Pocket CFO.

The user-visible goal is to add one deterministic `payables_aging_csv` source family on top of the shipped F2A through F2L backbone so the Finance Twin can persist vendor-facing payables-aging state, expose a route-backed payables-aging inventory, and expose a backend-first payables-posture read that stays explicit about currencies, exact bucket semantics, known-versus-unknown dates, source lineage, and limitations.

This slice stays intentionally narrow and additive.
It does not widen into bill ingestion, payment forecasting, reserve logic, DPO, contract metadata, card or expense exports, CFO Wiki compilation, discovery-answer UX, memo or report generation, monitoring, controls, connector APIs, or any F3 through F6 work.
It also absorbs the known root-doc truthfulness lag now visible after the merged F2L work.

## Progress

- [x] 2026-04-12T20:26:14Z Complete preflight against fetched `origin/main`, confirm `HEAD` matches fetched `origin/main`, confirm the exact branch name, confirm a clean worktree, verify `gh` auth, and verify local Postgres plus object storage availability.
- [x] 2026-04-12T20:26:14Z Read the active repo guidance, roadmap, shipped F2A through F2L Finance Plans, scoped AGENTS files, required ops docs, and inspect the current finance-twin plus source-registry seams before planning.
- [x] 2026-04-12T20:26:14Z Create the active F2M Finance Plan in `plans/FP-0021-payables-aging-and-payables-posture.md` before code changes.
- [x] 2026-04-12T20:26:14Z Implement additive payables-aging contracts, schema, extractor dispatch, persistence, read models, targeted tests, packaged smoke coverage, and truthful doc updates.
- [x] 2026-04-12T20:26:14Z Run the required validation ladder in the requested order, fix only in-scope failures, and confirm every required command is green before commit, push, or PR work.
- [x] 2026-04-12T20:26:14Z Create the one requested local commit, push `codex/f2m-payables-aging-and-payables-posture-local-v1`, verify the remote head, and create PR `#80` into `main`.
- [x] 2026-04-12T20:49:00Z Landed additive `payables_aging_csv` contracts, schema, repository persistence, service reads, routes, packaged smoke coverage, and stale-root-doc updates without widening into bill detail, payment forecasting, reserve logic, DPO, or non-finance slices.
- [x] 2026-04-12T20:49:00Z Generated and applied the additive migration for `finance_vendors` and `finance_payables_aging_rows`, then ran the requested targeted tests, all finance smokes, unchanged engineering-twin sync tests, repo lint, repo typecheck, repo test, and `pnpm ci:repro:current` successfully.
- [x] 2026-04-12T20:56:20Z Ran the requested strict QA pass on the shipped F2M branch, confirmed the payables routes are real persisted-state reads from the raw-source-backed sync path, confirmed the F2L doc lag cleanup remained truthful, and corrected the stale active-plan release bookkeeping before a narrow follow-up repro run.

## Surprises & Discoveries

The current repo already has the exact additive breadth pattern F2M should reuse.
`FinanceTwinService` reads stored raw bytes through `SourceFileStorage.read()`, extractor dispatch is family-specific, latest-successful slice reads are built from persisted sync-run state plus persisted row tables, and bank plus receivables routes already carry route-visible lineage refs and explicit limitations.

The shared summary route intentionally still stops at trial balance, chart of accounts, and general ledger.
Later breadth slices land as dedicated backend-first routes plus refreshed shared limitations copy, so F2M should follow the same pattern instead of widening the core summary contract more than necessary.

The root active docs are stale after the F2L merge.
`README.md`, `START_HERE.md`, and `docs/ops/local-dev.md` still describe F2L as the active next slice rather than merged baseline plus active F2M work.

The existing slice-alignment and shared-source notes are already diagnostic-only under the current per-file source model.
F2M should preserve that posture and must not reintroduce those notes as blockers in existing finance reads or the new payables routes.

Adding a new finance-twin read surface widened a few typed mock and lineage-count fixtures outside the finance-twin module.
The fallout stayed narrow: existing `FinanceTwinServicePort` test doubles needed stubbed payables methods, and one legacy posture spec needed the expanded lineage-count shape.

## Decision Log

Decision: add one new extractor family named `payables_aging_csv`.
Rationale: the user explicitly allows one new deterministic finance source family only, and payables aging is the next narrow working-capital breadth slice after bank summaries and receivables aging.

Decision: preserve raw-source authority by building F2M only from stored raw bytes, source metadata, persisted sync outputs, and persisted Finance Twin state.
Rationale: the user explicitly forbids deriving payables state from ingest receipt previews, `sampleRows`, general-ledger guesses, or vague documents.

Decision: persist vendor identity separately from payables-aging rows.
Rationale: vendors are a reusable company dimension, while bucket amounts, currencies, as-of dates, and source-row provenance belong to slice-scoped payables-aging observations.

Decision: preserve exact recognized bucket labels and weak semantics instead of normalizing everything into one stronger scheme.
Rationale: the user explicitly forbids silently relabeling ambiguous bucket columns into stronger semantics.

Decision: keep payables posture currency-bucketed and date-explicit, with no company-wide cross-currency total and no fake as-of unification.
Rationale: the user explicitly forbids cross-currency summing, silent date flattening, bill detail, expected payment timing, reserve logic, and DPO in this slice.

Decision: keep GitHub connector work explicitly out of scope, and keep the engineering-twin path intact.
Rationale: F2M is finance-twin extraction, provenance, and backend-read work only.

Decision: allow shared `account` or `account_name` headers for payables aging only when the source filename also carries a payables-specific hint.
Rationale: this preserves the recommended minimal header flexibility without increasing extractor collisions against bank summaries, trial balances, or receivables aging.

## Context and Orientation

Pocket CFO has already shipped F1 raw source registration and immutable file ingest plus F2A through F2L additive finance-twin slices: trial-balance sync, chart-of-accounts sync, general-ledger sync, snapshot and lineage, reconciliation readiness, reporting-window truth, account-bridge readiness, balance-bridge prerequisites, source-backed balance proof, balance-proof lineage drill, bank-account inventory, cash posture, receivables-aging, and collections posture.

The repo already provides the seams F2M should reuse:

- `packages/domain/src/finance-twin.ts` for pure finance-twin contracts and route schemas
- `packages/db/src/schema/finance-twin.ts` plus `packages/db/drizzle/**` for additive persisted finance state
- `apps/control-plane/src/modules/finance-twin/` for extractor dispatch, persistence orchestration, latest-successful slice reads, lineage, diagnostics, and route transport
- `apps/control-plane/src/modules/sources/**` for immutable raw-source registration, storage, and metadata lookup
- `apps/control-plane/src/bootstrap.ts`, `apps/control-plane/src/lib/types.ts`, `apps/control-plane/src/lib/http-errors.ts`, `apps/control-plane/src/app.ts`, and `apps/control-plane/src/test/database.ts` for wiring and regression coverage
- `tools/` and root `package.json` for packaged local smoke proofs

GitHub connector work is out of scope.
The engineering twin remains in place and must keep its reproducibility tests green unchanged.
Replay behavior is unchanged in this slice, but provenance, freshness, diagnostics, limitations, and route-visible wording are first-class because F2M adds operator-visible payables evidence surfaces.

## Plan of Work

Implement this slice in six bounded passes.

First, extend the finance-twin domain contracts with one new extractor key plus additive vendor and payables-aging row schemas, a latest-successful payables-aging slice shape, one payables-aging inventory view, and one payables-posture view.
Keep the contracts explicit about exact bucket labels, currencies, known-versus-unknown as-of dates, lineage refs, freshness, diagnostics, and limitations.

Second, add the smallest additive DB schema needed for persisted vendor identity and payables-aging rows.
Keep the schema additive-first, preserve explicit lineage through `finance_twin_lineage`, and avoid bill tables or broader AP redesign.

Third, add one deterministic `payables_aging_csv` extractor and wire it into finance-twin extractor dispatch.
The extractor should only accept explicit recognized headers, preserve exact bucket labels, fail truthfully on conflicting duplicate vendor-and-bucket observations inside one slice, and avoid strengthening weak semantics.

Fourth, extend the finance-twin repository and service seams so payables-aging sync persists vendors and aging rows transactionally, stores slice stats on sync runs, and assembles latest-successful payables-aging plus payables-posture reads from persisted state only.

Fifth, expose the new backend-first routes with thin transport code and focused assemblers.
The payables-aging route should surface vendor rows, exact bucket values, dates, and lineage refs.
The payables-posture route should surface truthful currency buckets, coverage summaries, diagnostics, freshness, and limitations without cross-currency totals, fake as-of unification, bill detail, payment timing, reserve logic, or DPO.

Sixth, update focused tests, add one packaged local payables smoke, and repair the stale root docs plus in-scope limitations copy so merged F2L baseline and active F2M guidance are truthful again.

## Concrete Steps

1. Keep `plans/FP-0021-payables-aging-and-payables-posture.md` current throughout the slice, updating `Progress`, `Decision Log`, `Surprises & Discoveries`, and `Outcomes & Retrospective` after meaningful milestones.

2. Extend `packages/domain/src/finance-twin.ts` and `packages/domain/src/index.ts` to cover:
   - `payables_aging_csv` in the extractor-key enum
   - additive `FinanceVendorRecord`
   - additive `FinancePayablesAgingRowRecord`
   - additive lineage target kinds for `vendor` and `payables_aging_row` if needed
   - additive payables-aging bucket contracts that preserve exact recognized labels and weak semantics
   - one latest-successful payables-aging slice shape
   - one payables-aging inventory view
   - one payables-posture view with currency buckets, coverage summary, diagnostics, and limitations

3. Add additive DB schema under `packages/db/src/schema/finance-twin.ts` and export it from `packages/db/src/schema/index.ts`.
   The narrow expected persisted shape is:
   - `finance_vendors`
   - `finance_payables_aging_rows`
   - additive enum values or JSON columns needed for payables bucket labels and dates

4. Generate or author the forward-only migration under `packages/db/drizzle/` and update `packages/db/drizzle/meta/` as needed.
   Keep the change additive-first and do not mutate or delete existing finance or engineering tables.

5. Extend `apps/control-plane/src/modules/finance-twin/` with bounded modules that keep routes thin, likely including:
   - `payables-aging-csv.ts`
   - `payables-aging-csv.spec.ts`
   - `payables-aging.ts`
   - `payables-posture.ts`
   - repository and mapper additions for vendor plus aging persistence and reads
   - route and schema additions for the new GET endpoints

6. Preserve raw-source authority by building payables-aging sync only from stored raw bytes, source metadata, sync runs, and persisted lineage.
   Do not derive payables state from ingest receipts, source previews, sample rows, trial balances, or general-ledger activity.

7. Implement minimum extractor behavior that accepts likely headers for:
   - vendor identity: `vendor`, `vendor_name`, `vendor_id`, `supplier`, `supplier_name`, `account`, `account_name`
   - date fields: `as_of`, `aging_date`, `report_date`, `snapshot_date`
   - currency fields: `currency`, `currency_code`
   - aging buckets: `current`, `0_30`, `1_30`, `31_60`, `61_90`, `91_120`, `120_plus`, `over_90`, `over_120`, `past_due`, `total`

8. Keep extractor truthfulness strict:
   - exact recognized bucket labels stay exact
   - weak bucket semantics remain weak
   - no bill detail is inferred
   - no payment forecast or expected payment timing is inferred
   - no DPO, reserve, or accrual logic is inferred
   - conflicting duplicate rows for the same vendor, currency, as-of date, and bucket in one slice fail
   - identical duplicates may be deduped deterministically
   - missing as-of dates remain explicit rather than synthesized

9. Add route behavior for:
   - `GET /finance-twin/companies/:companyKey/payables-aging`
   - `GET /finance-twin/companies/:companyKey/payables-posture`

10. Route-visible payables-aging rows should include at minimum:
    - vendor identity
    - currency
    - known or unknown as-of date
    - exact reported bucket values
    - explicit total when present or derivable from non-overlapping explicit buckets only if that remains truthful
    - lineage ref or direct proof of source-row provenance

11. Route-visible payables-posture output should include at minimum:
    - company
    - latest successful payables-aging slice
    - freshness
    - currency buckets
    - coverage summary
    - diagnostics
    - limitations

12. Keep payables-posture truth conservative:
    - no cross-currency company total
    - current totals only when `current` is explicit
    - past-due totals only when a row provides one non-overlapping full past-due basis
    - partial rollups such as `over_90` and `over_120` remain explicit diagnostics, not full past-due replacements
    - mixed dated and undated rows remain explicit
    - mixed explicit dates within one currency bucket remain diagnostic rather than flattened into one fake payables date

13. Add or update focused tests covering:
    - `payables_aging_csv` extraction from raw bytes
    - ambiguous bucket handling without silent strengthening
    - mixed as-of-date and mixed bucket-semantics payables-posture behavior
    - no cross-currency company total
    - conflicting duplicate-row failure
    - lineage refs or route-visible source-row provenance
    - route-level payables-aging and payables-posture behavior in `src/app.spec.ts`

14. Add `tools/finance-twin-payables-aging-smoke.mjs` and a root script in `package.json`.
    The packaged proof should show that:
    - a stored raw payables-aging CSV syncs through the finance twin
    - payables-aging inventory is read from persisted state
    - payables posture stays bucketed by currency and truthful bucket semantics
    - mixed or missing as-of dates remain explicit
    - lineage is drillable back to source, snapshot, and source-file boundaries

15. Update the stale active docs in:
    - `README.md`
    - `START_HERE.md`
    - `docs/ops/local-dev.md`
    - `plans/FP-0020-receivables-aging-and-collections-posture.md` only if a tiny merged-status note is strictly necessary
    - `apps/control-plane/src/modules/finance-twin/summary.ts` for truthful route-visible limitations copy

16. Run validation in this exact order:

```bash
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/finance-twin/payables-aging-csv.spec.ts src/modules/finance-twin/extractor-dispatch.spec.ts src/modules/finance-twin/drizzle-repository.spec.ts src/modules/finance-twin/service.spec.ts src/app.spec.ts
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
pnpm smoke:finance-twin-receivables-aging:local
pnpm run smoke:finance-twin-payables-aging:local
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

17. If and only if every required validation command is green, create exactly one local commit:

```bash
git commit -m "feat: add finance twin payables aging"
```

18. If fully green and edits were made, confirm the branch remains `codex/f2m-payables-aging-and-payables-posture-local-v1`, show `git branch --show-current`, `git log --oneline -3`, and `git status --short --untracked-files=all`, push that exact branch, verify the remote head, and create or report the PR into `main` with the requested title and body.

## Validation and Acceptance

Required validation order:

```bash
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/finance-twin/payables-aging-csv.spec.ts src/modules/finance-twin/extractor-dispatch.spec.ts src/modules/finance-twin/drizzle-repository.spec.ts src/modules/finance-twin/service.spec.ts src/app.spec.ts
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
pnpm smoke:finance-twin-receivables-aging:local
pnpm run smoke:finance-twin-payables-aging:local
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Acceptance is met when all of the following are true:

- a deterministic `payables_aging_csv` extractor exists and reads stored raw source bytes rather than ingest receipt summaries
- the Finance Twin persists vendor identity and payables-aging state instead of keeping parsing output transient
- `GET /finance-twin/companies/:companyKey/payables-aging` exists and is route-backed
- `GET /finance-twin/companies/:companyKey/payables-posture` exists and is route-backed
- source lineage remains explicit through source, snapshot, and source-file boundaries for persisted payables-aging facts
- payables posture does not sum across currencies into one company-wide number
- payables posture does not silently relabel weak bucket semantics into stronger ones
- mixed or missing as-of dates stay explicit in diagnostics or limitations rather than being flattened into one fake payables date
- existing summary, snapshot, reconciliation, account-bridge, balance-bridge-prerequisites, source-backed-balance-proof, balance-proof-lineage, bank-account inventory, cash-posture, receivables-aging, and collections-posture surfaces remain truthful and understandable
- F1 source-ingest behavior still works
- F2A through F2L behavior still works
- engineering-twin reproducibility tests still pass unchanged
- `README.md`, `START_HERE.md`, and `docs/ops/local-dev.md` truthfully describe merged F2L baseline and active F2M guidance

Provenance, freshness, replay, evidence, and limitation posture:
this slice must keep raw sources immutable, keep payables-aging facts lineaged to stored source evidence, surface stale, partial, undated, mixed-date, overlapping-bucket, and non-comparable bucket posture plainly, and avoid implying bill-level accuracy, expected payment timing, reserve logic, DPO, or stronger bucket semantics than the source explicitly provides.
Because this slice changes operator-visible finance read surfaces, the resulting contracts must keep sources, freshness, assumptions, gaps, conflicts, and limitations visible enough for a human reviewer to evaluate the result without re-reading the chat.

## Idempotence and Recovery

This slice is additive-first and safe to retry when followed carefully.

- Re-running finance syncs for the same stored payables-aging file should deterministically replace or upsert the same slice-scoped derived state without mutating the raw source bytes.
- Re-running targeted tests and smokes should be safe because the control-plane test DB reset truncates persisted finance state between cases.
- If the new extractor is too permissive or ambiguous, tighten header matching and bucket aggregation rules instead of weakening truthfulness or broadening scope.
- If a DB migration is wrong, fix it additively, rerun the narrowest migration step needed, and then restart the validation ladder from the requested order.
- If validation fails outside this slice or outside the known narrow engineering-twin reproducibility surface, stop and report the blocker instead of widening scope.

## Artifacts and Notes

Expected artifacts from this slice:

- one active F2M Finance Plan
- additive finance-twin domain and DB contracts for vendors and payables-aging rows
- one new deterministic extractor family for `payables_aging_csv`
- route-backed payables-aging and payables-posture views
- focused tests and one packaged local payables-aging smoke
- truthful root-doc and limitation-copy updates
- one clean commit, push, and PR only if the full validation ladder is green

Replay note:
this slice continues to rely on persisted finance sync runs and lineage as the current finance evidence spine for backend reads, but it does not add new replay categories or reporting workflows.

Documentation boundary note:
the active-doc boundary itself is unchanged, but the listed active docs need truthfulness updates so fresh Codex runs start from the current merged F2 baseline and active F2M slice instead of stale F2L-next wording.

## Interfaces and Dependencies

Package and runtime boundaries:

- `@pocket-cto/domain` remains the source of truth for finance-twin contracts
- `@pocket-cto/db` remains limited to schema and DB helpers
- `apps/control-plane` owns raw-byte extraction, persistence orchestration, read-model assembly, and HTTP transport
- `apps/web` stays out of scope unless a tiny read-only surface becomes strictly unavoidable, which is not planned for F2M

Configuration expectations:

- reuse the existing Postgres and S3-compatible object-store configuration
- add no new environment variables unless implementation proves one is strictly unavoidable
- keep internal `@pocket-cto/*` package names unchanged

Upstream and downstream notes:

- F1 source ingest remains the only authoritative raw-source entry point
- F2M should become the truthful payables and payables-posture layer that later F4 or F5 slices may cite, but F2M itself must not start discovery-answer, memo, packet, or monitoring work
- GitHub connector work is explicitly out of scope

## Outcomes & Retrospective

F2M shipped as the next additive Finance Twin breadth slice after bank-account summaries and receivables aging.
The repo now has one deterministic `payables_aging_csv` extractor that reads stored raw source bytes, persists vendor plus payables-aging row state, records vendor and row lineage, and exposes backend-first `/finance-twin/companies/:companyKey/payables-aging` plus `/finance-twin/companies/:companyKey/payables-posture` reads.

The resulting payables posture stays intentionally conservative.
It preserves exact reported bucket labels, avoids silent strengthening of weak bucket semantics, keeps cross-currency totals out of scope, surfaces mixed or missing as-of dates as diagnostics and limitations, and does not claim bill detail, expected payment timing, reserve logic, accrual logic, or DPO.

The slice also closed the active-doc lag that reopened after F2L merged.
`README.md`, `START_HERE.md`, `docs/ops/local-dev.md`, and the shared finance-twin limitations copy now describe merged F2L baseline truthfully and point new local runs at active F2M scope.

Validation stayed fully green after narrow in-scope follow-up fixes.
The only notable fallout was additive type-shape maintenance in a few existing mocks and lineage-count fixtures, which confirms the new read-model seam stayed reviewable and did not require widening into unrelated product areas.

The QA pass found one narrow bookkeeping miss after the initial ship: the active Finance Plan still showed the commit/push/PR step as incomplete even though the branch and PR were already live.
That did not affect product behavior, provenance, or route truthfulness, but it did leave the active execution record stale, so the fix is limited to the plan itself plus a follow-up repro check.
