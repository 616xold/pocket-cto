# Add the F2K bank-account-summary extractor and truthful cash-posture read models

## Purpose / Big Picture

This plan implements the next narrow **F2K Finance Twin** slice for Pocket CFO.

The user-visible goal is to add the first breadth finance source family after the core F2A through F2J arc: a deterministic `bank_account_summary_csv` ingest path plus backend-first bank-account inventory and cash-posture reads for one company. Operators should be able to see which bank accounts exist in the latest successful bank-summary slice, which balances were explicitly reported, whether those balances are statement or ledger, available, or unspecified, what dates are known or missing, and how every persisted bank summary row traces back to raw-source provenance.

This slice stays intentionally narrow and additive. It does not add bank transactions, reconciliation, FX conversion, AR or AP aging, card feeds, wiki/report generation, discovery UX, monitoring, controls, connector APIs, or any F3 through F6 work. GitHub connector work is explicitly out of scope, and the engineering-twin path remains intact.

## Progress

- [x] 2026-04-12T17:33:04Z Complete preflight against fetched `origin/main`, confirm the exact branch name, confirm a clean worktree, verify `gh` auth, and verify local Postgres plus object storage availability.
- [x] 2026-04-12T17:33:04Z Read the active repo guidance, roadmap, shipped F2A through F2J Finance Plans, scoped AGENTS files, required ops docs, and the current finance-twin and source-registry implementation seams before planning.
- [x] 2026-04-12T17:33:04Z Create the active F2K Finance Plan in `plans/FP-0019-bank-account-summary-and-cash-posture.md` before code changes.
- [x] 2026-04-12T18:28:00Z Implement the additive `bank_account_summary_csv` domain contracts, DB schema, repository wiring, extractor dispatch, sync persistence, latest-successful bank-summary snapshot assembly, and backend-first `/bank-accounts` plus `/cash-posture` routes.
- [x] 2026-04-12T18:28:00Z Add focused extractor, repository, domain-schema, service, and smoke coverage for ambiguous generic balances, conflicting duplicate rows, lineage refs, mixed as-of dates, mixed balance types, and no-cross-currency cash posture.
- [x] 2026-04-12T18:43:00Z Repair `README.md`, `START_HERE.md`, and `docs/ops/local-dev.md` so merged F2J baseline, active F2K guidance, and the packaged local proof list are truthful again.
- [x] 2026-04-12T18:43:00Z Implement additive bank-account-summary contracts, schema, extractor dispatch, persistence, read models, tests, smoke coverage, and root-doc truthfulness fixes.
- [x] 2026-04-12T19:07:00Z Run the full requested validation ladder, including all requested finance smokes, the engineering-twin regression trio, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current`, fixing one in-scope `import type` lint issue along the way.

## Surprises & Discoveries

The current finance-twin seam is already well-shaped for F2K: `FinanceTwinService` reads stored raw bytes from `SourceFileStorage.read()`, extractor dispatch is content-driven, sync runs persist source, snapshot, and file refs, and route-visible lineage drill behavior already exists for other finance targets.

The main active-doc lag is real. `README.md`, `START_HERE.md`, and `docs/ops/local-dev.md` still describe F2I or F2J as the current edge instead of merged F2J baseline plus active F2K guidance.

The current domain and persistence model has no bank-account or cash-posture state yet, which is good for scope control. F2K can stay additive by introducing one narrow persisted bank-summary family instead of mutating trial-balance, general-ledger, or reconciliation semantics.

The current limitation copy in `apps/control-plane/src/modules/finance-twin/summary.ts` already centralizes route-visible surface wording, so a truthful F2K copy update should remain small and reviewable.

The root-doc lag was fixable without touching `plans/FP-0018-balance-proof-lineage-and-f2i-polish.md`, so the merged-status cleanup stayed confined to the active docs and the new F2K plan.

## Decision Log

Decision: implement one new extractor family named `bank_account_summary_csv`.
Rationale: the user explicitly wants one new deterministic finance source family only, and bank account summaries are the narrowest truthful next breadth slice.

Decision: keep F1 raw ingest authoritative and immutable by reading stored raw bytes through the existing source-storage seam.
Rationale: the user explicitly forbids using ingest receipt previews, `sampleRows`, or shallow source summaries for Finance Twin state.

Decision: persist bank-account identity separately from bank-summary observations.
Rationale: bank accounts are a reusable company dimension, while balances, balance semantics, and dates belong to slice-scoped summary rows.

Decision: preserve ambiguous balance fields as `unspecified` rather than relabeling them as `statement`, `ledger`, or `available`.
Rationale: F2K must stay truthful about source semantics and must not strengthen weak evidence silently.

Decision: keep cash posture currency-bucketed and balance-type-bucketed, with no company-wide cross-currency total.
Rationale: the user explicitly forbids fake FX conversion and unlabeled cross-currency cash totals.

Decision: keep routes backend-first and minimal by adding `GET /finance-twin/companies/:companyKey/bank-accounts` and `GET /finance-twin/companies/:companyKey/cash-posture`.
Rationale: the user requires these routes and explicitly does not want pagination or broad query surfaces in this slice.

Decision: keep the existing company summary and snapshot contracts unchanged instead of widening `latestSuccessfulSlices` or overall finance freshness for F2K.
Rationale: bank-account summary and cash posture can ship as additive bank-specific read models without perturbing the already-merged F2A through F2J summary semantics, which keeps the diff CI-safe and easier to review.

Decision: GitHub connector work stays out of scope.
Rationale: this slice is a finance-twin and doc-truthfulness slice, not connector work, and the user explicitly told us not to use GitHub Connector Guard here.

## Context and Orientation

Pocket CFO has already shipped F1 raw source registration and immutable file ingest plus F2A through F2J additive finance-twin slices: trial-balance sync, chart-of-accounts sync, general-ledger sync, company snapshot and lineage, reconciliation readiness, reporting-window truth, account-bridge readiness, balance-bridge prerequisites, source-backed balance proof, and balance-proof lineage drill.

The repo already provides the key seams F2K should reuse:

- `packages/domain/src/finance-twin.ts` for pure finance-twin contracts and route schemas
- `packages/db/src/schema/finance-twin.ts` plus `packages/db/drizzle/**` for additive persisted finance state
- `apps/control-plane/src/modules/finance-twin/` for extractor dispatch, persistence orchestration, read-model assembly, diagnostics, and route transport
- `apps/control-plane/src/modules/sources/` for immutable raw-source registration, storage, and metadata lookup
- `apps/control-plane/src/bootstrap.ts`, `apps/control-plane/src/lib/types.ts`, and `apps/control-plane/src/app.ts` for container and route wiring
- `apps/control-plane/src/test/database.ts` for DB reset coverage
- `tools/` and root `package.json` for packaged local smoke paths

GitHub connector work is out of scope. The engineering twin remains in place and must keep its reproducibility tests green unchanged. Replay behavior is unchanged in this slice, but provenance, freshness, diagnostics, limitations, and route-visible proof wording are first-class because F2K changes operator-visible cash and bank read surfaces.

## Plan of Work

Implement this slice in six bounded passes.

First, extend the finance-twin domain contracts with one new extractor key plus additive persisted bank-account and bank-summary records, bank-account inventory view, cash-posture view, and currency-bucket contracts. Keep the schemas explicit about balance semantics, known-versus-unknown dates, lineage refs, freshness, diagnostics, and limitations.

Second, add the smallest additive DB schema needed for persisted bank-account identity and bank-summary rows. Keep the schema additive-first, keep unique scopes deterministic, and preserve explicit lineage through the existing `finance_twin_lineage` table instead of burying provenance in JSON.

Third, add one deterministic `bank_account_summary_csv` extractor and wire it into finance-twin extractor dispatch. The extractor should only accept explicit recognized headers, should fail truthfully on conflicting duplicate rows for the same account and balance type inside one slice, and should preserve ambiguous balance fields as `unspecified`.

Fourth, extend the finance-twin repository and service seams to persist bank accounts and bank summary rows transactionally, store slice stats on sync runs, and assemble latest-successful bank-summary snapshots plus cash-posture read models from persisted state only.

Fifth, expose the new backend-first routes with thin transport code and focused assemblers. The bank-account route should surface persisted accounts, explicit balances, dates, and lineage refs. The cash-posture route should surface truthful currency buckets, coverage summaries, diagnostics, freshness, and limitations without fake cross-currency totals or fake date unification.

Sixth, update focused tests, add one packaged local bank-summary or cash-posture smoke, and repair the stale root docs plus any in-scope limitations copy so merged F2J baseline and active F2K guidance are truthful again.

## Concrete Steps

1. Keep `plans/FP-0019-bank-account-summary-and-cash-posture.md` current throughout the slice, updating `Progress`, `Decision Log`, `Surprises & Discoveries`, and `Outcomes & Retrospective` after meaningful milestones.

2. Extend `packages/domain/src/finance-twin.ts` and `packages/domain/src/index.ts` to cover:
   - `bank_account_summary_csv` in the extractor-key enum
   - additive bank-account and bank-summary record schemas
   - additive lineage target kind for bank-summary rows if needed
   - one bank-account inventory view
   - one cash-posture view with currency buckets, coverage summary, diagnostics, and limitations
   - explicit balance semantic enum such as `statement_or_ledger`, `available`, and `unspecified`
   - route-visible lineage refs for persisted bank-summary rows

3. Add additive DB schema under `packages/db/src/schema/finance-twin.ts` and export it from `packages/db/src/schema/index.ts`.
   The narrow expected persisted shape is:
   - `finance_bank_accounts`
   - `finance_bank_account_summaries`
   - additive enum values or columns needed for balance semantics and known date fields

4. Generate or author the forward-only migration under `packages/db/drizzle/` and update `packages/db/drizzle/meta/` as needed.
   Keep the change additive-first and do not mutate or delete existing finance or engineering tables.

5. Extend `apps/control-plane/src/modules/finance-twin/` with bounded modules that keep routes thin, likely including:
   - `bank-account-summary-csv.ts`
   - `bank-account-summary-csv.spec.ts`
   - one small bank-account or cash-posture assembler module if the service would otherwise grow too far
   - repository and mapper additions for bank-account persistence and read models
   - route and schema additions for the new GET endpoints

6. Preserve raw-source authority by building bank-summary sync only from stored raw bytes, source metadata, sync runs, and persisted lineage.
   Do not derive cash posture from ingest receipts, source previews, sample rows, trial balances, or general-ledger activity.

7. Implement minimum extractor behavior that accepts likely headers for:
   - account identity: `account_name`, `account`, `bank_account`, `account_number_last4`, `last4`, `account_id`
   - institution: `bank`, `bank_name`, `institution`
   - date fields: `as_of`, `balance_date`, `statement_date`, `snapshot_date`
   - explicit statement or ledger fields: `statement_balance`, `ledger_balance`, `closing_balance`, `ending_balance`
   - explicit available fields: `available_balance`
   - ambiguous generic fields: `balance`, `current_balance`

8. Keep extractor truthfulness strict:
   - generic balance fields stay `unspecified`
   - no transaction detail is inferred
   - no bank reconciliation is inferred
   - conflicting duplicate rows for the same account and balance type in one slice fail
   - identical duplicates may be deduped deterministically

9. Add route behavior for:
   - `GET /finance-twin/companies/:companyKey/bank-accounts`
   - `GET /finance-twin/companies/:companyKey/cash-posture`

10. Route-visible bank-account rows should include at minimum:
    - bank-account identity
    - institution or bank label when present
    - currency
    - explicit reported balances grouped by semantic type
    - known or unknown as-of data
    - lineage ref or direct proof of source row provenance

11. Route-visible cash-posture output should include at minimum:
    - company
    - latest successful bank-summary slice
    - freshness
    - currency buckets
    - coverage summary
    - diagnostics
    - limitations

12. Add or update focused tests covering:
    - `bank_account_summary_csv` extraction from raw bytes
    - ambiguous generic balance handling as `unspecified`
    - no cross-currency company total
    - mixed balance-type bucket behavior
    - mixed as-of date detection
    - conflicting duplicate-row failure
    - bank-summary lineage refs or route-visible source-row provenance
    - route-level bank-account and cash-posture behavior in `src/app.spec.ts`

13. Add `tools/finance-twin-bank-account-summary-smoke.mjs` and a root script in `package.json`.
    The packaged proof should show that:
    - a stored raw bank-summary CSV syncs through the finance twin
    - bank-account inventory is read from persisted state
    - cash posture stays bucketed by currency and balance semantic
    - ambiguous balances remain `unspecified`
    - lineage is drillable back to source, snapshot, and source-file boundaries

14. Update the stale active docs in:
    - `README.md`
    - `START_HERE.md`
    - `docs/ops/local-dev.md`
    - `plans/FP-0018-balance-proof-lineage-and-f2i-polish.md` only if a tiny merged-status note is strictly necessary
    - `apps/control-plane/src/modules/finance-twin/summary.ts` for truthful route-visible limitations copy if needed

15. Run validation in this exact order:

```bash
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/finance-twin/bank-account-summary-csv.spec.ts src/modules/finance-twin/extractor-dispatch.spec.ts src/modules/finance-twin/drizzle-repository.spec.ts src/modules/finance-twin/service.spec.ts src/app.spec.ts
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
pnpm run smoke:finance-twin-bank-account-summary:local
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

16. If and only if every required validation command is green, create exactly one local commit:

```bash
git commit -m "feat: add finance twin bank account summaries"
```

17. If fully green and edits were made, confirm the branch remains `codex/f2k-bank-account-summary-and-cash-posture-local-v1`, show the requested git status commands, push that exact branch, verify the remote head, and create or report the PR into `main` with the requested title and body.

## Validation and Acceptance

Required validation order:

```bash
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/finance-twin/bank-account-summary-csv.spec.ts src/modules/finance-twin/extractor-dispatch.spec.ts src/modules/finance-twin/drizzle-repository.spec.ts src/modules/finance-twin/service.spec.ts src/app.spec.ts
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
pnpm run smoke:finance-twin-bank-account-summary:local
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Acceptance is met when all of the following are true:

- a deterministic `bank_account_summary_csv` extractor exists and reads stored raw source bytes rather than ingest receipt summaries
- the Finance Twin persists bank-account identity and bank-summary state instead of keeping parsing output transient
- `GET /finance-twin/companies/:companyKey/bank-accounts` exists and is route-backed
- `GET /finance-twin/companies/:companyKey/cash-posture` exists and is route-backed
- source lineage remains explicit through source, snapshot, and source-file boundaries for persisted bank-summary facts
- cash posture does not sum across currencies into one company-wide number
- cash posture does not mix statement or ledger, available, and unspecified balances into one unlabeled number
- generic balance fields remain `unspecified` and are not relabeled as stronger semantics
- mixed or missing as-of dates stay explicit in diagnostics or limitations rather than being flattened into one fake cash date
- existing summary, snapshot, reconciliation, account-bridge, balance-bridge-prerequisites, source-backed-balance-proof, and balance-proof-lineage surfaces remain truthful and understandable
- F1 source-ingest behavior still works
- F2A through F2J behavior still works
- engineering-twin reproducibility tests still pass unchanged
- `README.md`, `START_HERE.md`, and `docs/ops/local-dev.md` truthfully describe merged F2J baseline and active F2K guidance

Provenance, freshness, replay, and limitation posture:
this slice must keep raw sources immutable, keep bank-summary facts lineaged to stored source evidence, surface stale, partial, undated, and mixed-date posture plainly, and avoid implying transaction-level accuracy, reconciliation, FX-normalized totals, or stronger balance semantics than the source explicitly provides.

## Idempotence and Recovery

This slice is additive-first and safe to retry when followed carefully.

- Re-running finance syncs for the same stored bank-summary file should deterministically replace or upsert the same slice-scoped derived state without mutating the raw source bytes.
- Re-running targeted tests and smokes should be safe because the control-plane test DB reset truncates persisted finance state between cases.
- If the new extractor is too permissive or ambiguous, tighten header matching and conflict handling instead of weakening truthfulness or broadening scope.
- If a DB migration is wrong, fix it additively, rerun the narrowest migration step needed, and then restart the validation ladder from the requested order.
- If validation fails outside this slice or outside the known narrow engineering-twin reproducibility surface, stop and report the blocker instead of widening scope.

## Artifacts and Notes

Expected artifacts from this slice:

- one active F2K Finance Plan
- additive finance-twin domain and DB contracts for bank-account summaries and cash posture
- one new deterministic extractor family for `bank_account_summary_csv`
- route-backed bank-account inventory and cash-posture views
- focused tests and one packaged local bank-summary smoke
- truthful root-doc and limitation-copy updates
- one clean commit, push, and PR only if the full validation ladder is green

Evidence-bundle note:
this slice changes operator-visible finance read surfaces, so the resulting route contracts must keep sources, freshness, gaps, assumptions, and limitations visible enough for a human to review without re-reading the chat. It does not introduce new mission artifacts, replay categories, or external approval flows.

## Interfaces and Dependencies

Package and runtime boundaries:

- `@pocket-cto/domain` remains the source of truth for finance-twin contracts
- `@pocket-cto/db` remains limited to schema and DB helpers
- `apps/control-plane` owns raw-byte extraction, persistence orchestration, read-model assembly, and HTTP transport
- `apps/web` stays out of scope unless a tiny read-only surface becomes strictly unavoidable, which is not planned for F2K

Configuration expectations:

- reuse the existing Postgres and S3-compatible object-store configuration
- add no new environment variables unless implementation proves one is strictly unavoidable
- keep internal `@pocket-cto/*` package names unchanged

Upstream and downstream notes:

- F1 source ingest remains the only authoritative raw-source entry point
- F2K should become the truthful bank and cash layer that later F4 or F5 slices may cite, but F2K itself must not start discovery-answer, memo, packet, or monitoring work
- GitHub connector work is explicitly out of scope

## Outcomes & Retrospective

F2K shipped as the narrowest truthful bank breadth slice on top of the merged F2A through F2J foundation. The repo now has one deterministic `bank_account_summary_csv` family, persisted bank-account and bank-summary state, backend-first `/bank-accounts` and `/cash-posture` reads, and packaged local proof for mixed-date, mixed-balance-type, and ambiguous-balance handling without FX conversion, fake transaction detail, or fake reconciliation.

The additive shape held up well under regression coverage. Existing finance summary, snapshot, reconciliation, account-bridge, balance-proof, and engineering-twin reproducibility paths stayed green after the new bank-summary state landed, which validates the decision to keep F2K bank-specific instead of widening the shared company summary contracts.
