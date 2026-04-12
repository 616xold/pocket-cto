# Add the F2O card-expense extractor and truthful spend-posture read models

## Purpose / Big Picture

This plan implements the next narrow **F2O Finance Twin** breadth slice for Pocket CFO.

The user-visible goal is to add one deterministic `card_expense_csv` extractor family on top of the shipped F2A through F2N baseline, persist truthful card and expense row state from immutable stored raw bytes, and expose backend-first spend-item plus spend-posture reads for one company. Operators should be able to see which explicit spend rows exist in the latest successful card or expense slice, which explicit amounts, dates, merchants, employees, card labels, categories, and weak status helpers those exports actually reported, what those amounts and dates do and do not mean, and how every spend row traces back to raw-source provenance.

This slice stays intentionally narrow and additive. It does not infer spend from the general ledger, ingest receipts, or vague documents. It does not add reimbursement inference, approval state, policy scoring, fraud logic, accrual logic, payment forecasting, wiki or report generation, discovery-answer UX, monitoring, controls, connector APIs, or any F3 through F6 implementation. GitHub connector work is explicitly out of scope, and the engineering-twin path remains intact.

## Progress

- [x] 2026-04-12T22:56:54Z Complete preflight against fetched `origin/main`, confirm `HEAD` matches fetched `origin/main`, confirm the exact branch name, verify a clean worktree, verify `gh` auth, and verify local Postgres plus object storage availability.
- [x] 2026-04-12T22:56:54Z Read the active repo guidance, roadmap, shipped F2A through F2N Finance Plans, scoped AGENTS files, required ops docs, and inspect the current finance-twin plus source-registry seams before planning.
- [x] 2026-04-12T22:56:54Z Create the active F2O Finance Plan in `plans/FP-0023-card-expense-and-spend-posture.md` before code changes.
- [x] 2026-04-12T23:13:54Z Implement additive domain contracts, DB schema, extractor dispatch, persisted spend-row sync, spend-item inventory, spend-posture assembly, focused tests, packaged smoke coverage, and root-doc truthfulness fixes.
- [x] 2026-04-12T23:20:48Z Run the required validation ladder in the requested order, fix only in-scope failures, and confirm every required command is green before commit, push, or PR work.
- [ ] 2026-04-12T22:56:54Z Create the one requested local commit, push `codex/f2o-card-expense-and-spend-posture-local-v1`, verify the remote head, and create or report the PR into `main`.

## Surprises & Discoveries

The current repo already has the breadth-slice seams F2O should reuse. `FinanceTwinService` reads stored raw bytes through `SourceFileStorage.read()`, extractor dispatch is family-specific, sync runs persist slice-scoped stats, and bank, receivables, payables, and contract routes already carry route-visible lineage refs plus explicit limitations.

The root active docs are stale again after the merged F2N work. `README.md`, `START_HERE.md`, and `docs/ops/local-dev.md` still describe a narrower shipped surface or the wrong active next slice.

The later F2 breadth slices intentionally land as dedicated backend-first reads rather than widening the shared finance summary contract aggressively. F2O should follow that pattern and refresh summary limitation wording instead of turning the summary view into a broad spend analytics surface.

The existing posture builders already model the truthfulness rules F2O needs: currency buckets stay separate, mixed or missing dates stay explicit, and weak source semantics remain weak instead of being upgraded into stronger accounting claims.

The dedicated test database does not pick up schema changes from the normal local `pnpm db:migrate` path automatically. DB-backed control-plane specs still require applying the new Drizzle migration against `TEST_DATABASE_URL` before `resetTestDatabase()` can truncate the new table safely.

Adding the new `spendRowCount` lineage target expanded a shared typed fixture shape used by older posture specs. The only knock-on regression was two missing zero-valued test fields, which kept the fix additive and local to those fixtures.

## Decision Log

Decision: implement exactly one new extractor family named `card_expense_csv`.
Rationale: the user explicitly allows one new deterministic finance source family only, and card or expense CSV exports are the next truthful breadth slice after contract metadata.

Decision: keep F1 raw ingest authoritative and immutable by building F2O only from stored raw bytes, source metadata, persisted sync outputs, and persisted Finance Twin state.
Rationale: the user explicitly forbids using ingest receipt previews, `sampleRows`, or shallow parser summaries for spend state.

Decision: persist spend rows directly in one additive table instead of widening into receipt, policy, reimbursement, or risk submodels.
Rationale: the acceptance bar only requires deterministic spend-row state and truthful spend-posture reads, and a narrower persisted model keeps the diff additive and reviewable.

Decision: preserve explicit amount, date, and weak status semantics separately rather than silently strengthening them.
Rationale: the user explicitly forbids upgrading generic `amount`, `status`, or date fields into stronger semantics like posted, settled, reimbursable, approved, accrued, or forecast.

Decision: fail extraction when duplicate rows with the same explicit row identity disagree within one slice.
Rationale: the user explicitly prefers truthful failure over picking a winner when one exported slice contains conflicting claims for the same spend row.

Decision: GitHub connector work remains out of scope.
Rationale: this slice is finance-twin extraction, persistence, provenance, and backend-read work only.

## Context and Orientation

Pocket CFO has already shipped F1 raw source registration and immutable file ingest plus F2A through F2N additive finance-twin slices: trial-balance sync, chart-of-accounts sync, general-ledger sync, snapshot and lineage, reconciliation readiness, reporting-window truth, account-bridge readiness, balance-bridge prerequisites, source-backed balance proof, balance-proof lineage drill, bank-account inventory, cash posture, receivables-aging, collections posture, payables-aging, payables posture, contract inventory, and obligation calendar.

The repo already provides the seams F2O should reuse:

- `packages/domain/src/finance-twin.ts` and `packages/domain/src/index.ts` for pure finance-twin contracts and route schemas
- `packages/db/src/schema/finance-twin.ts`, `packages/db/src/schema/index.ts`, and `packages/db/drizzle/**` for additive persisted finance state
- `apps/control-plane/src/modules/finance-twin/` for extractor dispatch, persistence orchestration, latest-successful slice reads, lineage, diagnostics, and route transport
- `apps/control-plane/src/modules/sources/**` for immutable raw-source registration, storage, and metadata lookup
- `apps/control-plane/src/bootstrap.ts`, `apps/control-plane/src/lib/types.ts`, `apps/control-plane/src/lib/http-errors.ts`, `apps/control-plane/src/app.ts`, and `apps/control-plane/src/test/database.ts` for app wiring and regression coverage
- `tools/` and root `package.json` for packaged local smoke proofs

GitHub connector work is out of scope. The engineering twin remains in place and must keep its reproducibility tests green unchanged. Replay behavior is unchanged in this slice, but provenance, freshness, route-visible diagnostics, and operator-facing limitations are first-class because F2O adds spend evidence surfaces.

## Plan of Work

Implement this slice in six bounded passes.

First, extend the finance-twin domain contracts with one new extractor key, one additive spend-row record, one latest-successful card-expense slice summary, one spend-items view, and one spend-posture view with per-currency buckets, coverage, diagnostics, and limitations. Keep the contracts explicit about weak versus strong amount, date, and status semantics.

Second, add the smallest additive DB schema needed for persisted spend rows and any related lineage-target wiring. Keep the schema additive-first, avoid receipt or policy tables, and preserve source-backed row provenance through `finance_twin_lineage`.

Third, add one deterministic `card_expense_csv` extractor and wire it into finance-twin extractor dispatch. The extractor should only accept explicit recognized headers, preserve separate explicit date and amount fields, fail truthfully on conflicting duplicate identities, and avoid heuristic dedupe when no explicit identity exists.

Fourth, extend the finance-twin repository and service seams so card-expense sync persists spend rows transactionally, stores slice stats on sync runs, and assembles latest-successful spend-item plus spend-posture reads from persisted state only.

Fifth, expose the new backend-first routes with thin transport code and focused assemblers. Spend items should surface row-level lineage refs. Spend posture should surface truthful currency buckets, coverage, diagnostics, freshness, and limitations without cross-currency totals, fake as-of unification, fake reimbursement or approval state, fake accrual logic, or fake forecasts.

Sixth, update focused tests, add one packaged local spend smoke, and repair the stale root docs plus in-scope limitation wording so merged F2N baseline and active F2O guidance are truthful again.

## Concrete Steps

1. Keep `plans/FP-0023-card-expense-and-spend-posture.md` current throughout the slice, updating `Progress`, `Decision Log`, `Surprises & Discoveries`, and `Outcomes & Retrospective` after meaningful milestones.

2. Extend `packages/domain/src/finance-twin.ts` and `packages/domain/src/index.ts` to cover:
   - `card_expense_csv` in the extractor-key enum
   - additive `FinanceSpendRowRecord`
   - additive lineage target kind for `spend_row`
   - one latest-successful card-expense slice shape
   - one spend-item inventory view
   - one spend-posture view with currency buckets, coverage summary, diagnostics, and limitations

3. Add additive DB schema under `packages/db/src/schema/finance-twin.ts` and export it from `packages/db/src/schema/index.ts`.
   The narrow expected persisted shape is:
   - `finance_spend_rows`
   - additive enum or column changes needed for weak amount, date, and status-source semantics

4. Generate or author the forward-only migration under `packages/db/drizzle/` and update `packages/db/drizzle/meta/` as needed.
   Keep the change additive-first and do not mutate or delete existing finance or engineering tables.

5. Extend `apps/control-plane/src/modules/finance-twin/` with bounded modules that keep routes thin, likely including:
   - `card-expense-csv.ts`
   - `card-expense-csv.spec.ts`
   - `spend-items.ts`
   - `spend-posture.ts`
   - repository and mapper additions for spend-row persistence and reads
   - route and schema additions for the new GET endpoints

6. Preserve raw-source authority by building card-expense sync only from stored raw bytes, source metadata, sync runs, and persisted lineage.
   Do not derive spend state from ingest receipts, source previews, sample rows, filenames alone, or other finance slices.

7. Implement minimum extractor behavior that accepts likely explicit headers for:
   - row identity: `transaction_id`, `expense_id`, `card_txn_id`, `statement_txn_id`, `reference_id`
   - labels: `merchant`, `vendor`, `employee`, `cardholder`, `category`, `memo`, `description`, `department`, `card_name`, `card_last4`
   - dates: `transaction_date`, `posted_date`, `expense_date`, `report_date`, `as_of`
   - amounts: `amount`, `posted_amount`, `transaction_amount`
   - currency: `currency`, `currency_code`
   - weak status helpers: `status`, `state`, `reimbursable`, `pending`

8. Keep extractor truthfulness strict:
   - no spend inference from the general ledger or vague documents
   - no receipt parsing or receipt-detail invention
   - no reimbursement, approval, policy, fraud, accrual, or forecast inference
   - generic labels remain generic
   - `transaction_date` and `posted_date` stay separate when both exist
   - conflicting duplicate rows for the same explicit identity fail
   - rows without explicit identity are not deduped heuristically

9. Add route behavior for:
   - `GET /finance-twin/companies/:companyKey/spend-items`
   - `GET /finance-twin/companies/:companyKey/spend-posture`

10. Route-visible spend rows should include at minimum:
    - explicit row identity or null
    - merchant or vendor labels
    - employee or cardholder labels
    - category, memo, description, department, card label, and last4 when reported
    - separate explicit amount fields and their source semantics
    - separate explicit date fields and their source semantics
    - weak status helpers when reported
    - lineage ref or direct proof of source-row provenance

11. Route-visible spend-posture output should include at minimum:
    - company
    - latest successful card-expense slice
    - freshness
    - currency buckets
    - coverage summary
    - diagnostics
    - limitations

12. Keep spend-posture truth conservative:
    - no cross-currency company total
    - no fake as-of unification when dates differ
    - no silent upgrade of generic amount fields
    - no silent upgrade of generic date fields
    - no policy scoring, reimbursement inference, fraud logic, accrual logic, or payment forecasting
    - mixed dated and undated rows remain explicit

13. Add or update focused tests covering:
    - `card_expense_csv` extraction from raw bytes
    - ambiguous amount, date, and status handling without silent strengthening
    - mixed-date and mixed-semantics spend-posture behavior
    - no-cross-currency-summing behavior
    - conflicting duplicate-row failure
    - row lineage refs or route-visible source-row provenance
    - route-level spend-item and spend-posture behavior in `src/app.spec.ts`

14. Add `tools/finance-twin-card-expense-smoke.mjs` and a root script in `package.json`.
    The packaged proof should show that:
    - a stored raw card-expense CSV syncs through the finance twin
    - spend items are read from persisted state
    - spend posture stays explicit about currencies, amount semantics, dates, and limitations
    - missing or mixed dates do not produce a fake company-wide spend date
    - lineage is drillable back to source, snapshot, and source-file boundaries

15. Update the stale active docs in:
    - `README.md`
    - `START_HERE.md`
    - `docs/ops/local-dev.md`
    - `plans/FP-0022-contract-metadata-and-obligation-calendar.md` only if a tiny merged-status note is strictly necessary
    - `apps/control-plane/src/modules/finance-twin/summary.ts` for truthful limitation wording

16. Run validation in this exact order:

```bash
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/finance-twin/card-expense-csv.spec.ts src/modules/finance-twin/extractor-dispatch.spec.ts src/modules/finance-twin/drizzle-repository.spec.ts src/modules/finance-twin/service.spec.ts src/app.spec.ts
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
pnpm smoke:finance-twin-payables-aging:local
pnpm smoke:finance-twin-contract-metadata:local
pnpm smoke:finance-twin-card-expense:local
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

17. If and only if every required validation command is green, create exactly one local commit:

```bash
git commit -m "feat: add finance twin card expense posture"
```

18. If fully green and edits were made, confirm the branch remains `codex/f2o-card-expense-and-spend-posture-local-v1`, show `git branch --show-current`, `git log --oneline -3`, and `git status --short --untracked-files=all`, push that exact branch, verify the remote head, and create or report the PR into `main` with the requested title and body.

## Validation and Acceptance

Required validation order:

```bash
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/finance-twin/card-expense-csv.spec.ts src/modules/finance-twin/extractor-dispatch.spec.ts src/modules/finance-twin/drizzle-repository.spec.ts src/modules/finance-twin/service.spec.ts src/app.spec.ts
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
pnpm smoke:finance-twin-payables-aging:local
pnpm smoke:finance-twin-contract-metadata:local
pnpm smoke:finance-twin-card-expense:local
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Acceptance requires all of the following to be true:

- A deterministic `card_expense_csv` extractor syncs from stored raw source bytes instead of ingest receipt previews.
- The Finance Twin persists real spend-row state and assembles reads from persisted slice state only.
- `GET /finance-twin/companies/:companyKey/spend-items` and `GET /finance-twin/companies/:companyKey/spend-posture` return truthful backend-first views.
- Spend-posture totals stay currency-bucketed, keep mixed or missing dates explicit, and avoid silent strengthening of amount or date semantics.
- Lineage for the new spend path is explicit and drillable at least through source, snapshot, and source-file boundaries.
- Existing F1 ingest, F2A through F2N finance-twin reads, and engineering-twin reproducibility tests remain green.
- Root docs are truthful now that F2N is merged and F2O is the active next slice.

## Idempotence and Recovery

This slice is additive-first. Safe retry means rerunning the same raw-source-backed sync against immutable source bytes and allowing the current sync run to replace only the persisted spend rows for that sync-run scope. If extraction fails because duplicate explicit identities conflict, the failure should remain visible on the sync run instead of partially persisting guessed winners.

Rollback should use a normal git revert of the F2O commit plus a forward DB migration if needed; do not mutate or delete raw source files, snapshots, or object-store blobs in place. If a migration lands and must be backed out locally, prefer restoring the previous app code and adding a new follow-up migration rather than editing history.

## Artifacts and Notes

Expected slice artifacts:

- `plans/FP-0023-card-expense-and-spend-posture.md`
- additive finance-twin domain and DB contracts for spend rows
- deterministic `card_expense_csv` extractor and focused tests
- spend-item and spend-posture routes plus lineage-ready read models
- `tools/finance-twin-card-expense-smoke.mjs`
- truthful root-doc updates for merged F2N and active F2O guidance

This slice does not create CFO Wiki pages, discovery answers, memos, reports, or external communications.

## Interfaces and Dependencies

Package and runtime seams involved in this slice:

- `@pocket-cto/domain` for pure schemas and types
- `@pocket-cto/db` for additive Postgres schema and migration state
- `@pocket-cto/control-plane` finance-twin modules for extractor, repository, service, posture builders, and routes
- existing source-registry storage and metadata seams for immutable raw-source access
- local Docker-backed Postgres and object storage for tests and smoke commands

No new external connector APIs, env vars, or GitHub-specific runtime seams should be introduced in F2O.

## Outcomes & Retrospective

Pending implementation.
Update this section with what shipped, what changed from the original plan, validation status, and whether broad F2 should stop here or continue with one more tiny slice.
