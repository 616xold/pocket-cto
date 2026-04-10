# Extend the F2B finance twin with chart-of-accounts sync and F2A truthfulness polish

## Purpose / Big Picture

This plan implements the next narrow **F2B Finance Twin** slice for Pocket CFO.

The user-visible goal is to add a second real finance extractor family for `chart_of_accounts_csv`, persist truthful account-catalog state from immutable stored raw bytes, make freshness and summary semantics explicit per implemented finance slice, and correct the active-doc polish gaps left behind after the merged F2A trial-balance work.

This slice stays intentionally narrow and additive.
It extends the existing F2A finance-twin foundation, but it does not begin AR or AP aging, bank summaries, expense feeds, contracts, CFO Wiki compilation, finance discovery-answer UX, memo or report generation, monitoring, close or control work, connector APIs, or any package-scope rename.

## Progress

- [x] 2026-04-10T12:29:45Z Complete preflight against fetched `origin/main`, confirm `HEAD` matches fetched `origin/main`, confirm the exact branch name, confirm a clean worktree, verify `gh` auth, and verify local Postgres plus object storage availability.
- [x] 2026-04-10T12:29:45Z Read the active repo guidance, roadmap, F1 and F2 plans, scoped AGENTS files, and local-dev plus source-ingest docs; inspect the finance-twin, source-ingest, bootstrap, app, schema, and smoke seams before planning.
- [x] 2026-04-10T12:29:45Z Create the active F2B Finance Plan in `plans/FP-0010-chart-of-accounts-and-f2a-polish.md` before code changes.
- [x] 2026-04-10T12:51:53Z Implement additive finance-twin contracts, schema, persistence, extractor dispatch, tests, and smoke support for `chart_of_accounts_csv`, while tightening summary and freshness truthfulness.
- [x] 2026-04-10T12:51:53Z Update `plans/FP-0009-finance-twin-foundation-and-first-extractor.md`, `START_HERE.md`, and `docs/ops/local-dev.md` so the active-doc boundary matches the merged repo state truthfully.
- [x] 2026-04-10T12:51:53Z Run the required validation ladder in the requested order, fix only in-scope failures, and confirm the slice is ready for exactly one commit, push, and PR because every required validation is green.
- [x] 2026-04-10T12:58:34Z Complete the strict QA follow-up, isolate the packaged finance smokes by default company key, and rerun the focused finance, smoke, engineering-twin, and `pnpm ci:repro:current` validations on the corrected head.

## Surprises & Discoveries

- Observation: the current F2A implementation already uses `SourceFileStorage.read()` against stored raw source bytes, so the raw-source authority seam is present and should be reused rather than redesigned.
  Evidence: `apps/control-plane/src/modules/finance-twin/service.ts` reads `sourceFile.storageRef` and never relies on ingest receipt summaries.

- Observation: the current finance summary contract is ambiguous because `coverage.reportingPeriodCount` and `coverage.ledgerAccountCount` are company-wide totals, while `coverage.trialBalanceLineCount` and `coverage.lineageCount` describe only the latest successful trial-balance run.
  Evidence: `apps/control-plane/src/modules/finance-twin/service.ts` combines company-level counts with `listTrialBalanceLinesBySyncRunId()` and `countLineageBySyncRunId()` under one `coverage` block.

- Observation: `finance_ledger_accounts` is a useful shared account dimension, but by itself it cannot prove chart-of-accounts coverage because F2A already creates ledger accounts from trial-balance data.
  Evidence: `trial_balance_csv` upserts `finance_ledger_accounts` directly, so a second persisted account-catalog slice needs its own queryable state to distinguish catalog coverage from trial-balance-derived account presence.

- Observation: the active docs still lag the merged repo state in a few specific places.
  Evidence: `START_HERE.md` still points fresh Codex runs at `FP-0001`, `docs/ops/local-dev.md` still reads as F1-first, and `plans/FP-0009-finance-twin-foundation-and-first-extractor.md` still presents publish status as unfinished despite the merged F2A code already being present on fetched `origin/main`.

- Observation: the generated migration needed a small manual hardening step because the local dev database already contained the new enum label before the finalized migration was applied.
  Evidence: `pnpm db:migrate` failed locally with `enum label "chart_of_accounts_csv" already exists` until the migration used `ALTER TYPE ... ADD VALUE IF NOT EXISTS`, after which both local migration and `pnpm ci:repro:current` succeeded cleanly.

- Observation: the packaged local finance smokes originally shared one default company key, which let a prior chart-of-accounts smoke make the trial-balance smoke look more complete than that command alone proved.
  Evidence: rerunning `pnpm smoke:finance-twin:local` after `pnpm smoke:finance-twin-account-catalog:local` showed `chartOfAccounts` freshness as `fresh` for the shared default company instead of isolating the trial-balance slice.

## Decision Log

- Decision: keep this slice inside the additive `finance-twin` bounded context rather than widening or mutating the engineering twin.
  Rationale: the user explicitly requires the engineering-twin path to remain intact and the finance-twin seams already exist from F2A.

- Decision: implement `chart_of_accounts_csv` as the second real extractor family and keep PDF or XLSX work out of scope.
  Rationale: this is the user-preferred family and the narrowest deterministic extension that stays reviewable.

- Decision: preserve `finance_ledger_accounts` as the normalized shared account dimension, but add the smallest separate persisted account-catalog state needed to make catalog coverage, freshness, and lineage explicit.
  Rationale: account rows created from trial-balance syncs alone cannot truthfully stand in for a chart-of-accounts slice.

- Decision: replace the ambiguous top-level `coverage` contract with more explicit summary naming that separates company totals from latest-successful slice snapshots.
  Rationale: the current F2A summary mixes company-wide totals with latest-successful-run counts and makes coverage look broader than it is.

- Decision: compute freshness separately for `trialBalance` and `chartOfAccounts`, and make `overall` an explicit rollup of the implemented slices rather than shorthand for trial-balance freshness alone.
  Rationale: by F2B there are two real finance slices, so overall posture must not silently inherit trial-balance semantics.

- Decision: GitHub connector work remains explicitly out of scope.
  Rationale: this slice builds on F1 raw-source ingest and F2 finance sync, not connector expansion.

## Context and Orientation

Pocket CFO has already completed F1 raw-source ingest and the first merged F2A finance-twin slice.
The current repo state includes:

- immutable source registration, storage, and provenance through `apps/control-plane/src/modules/sources/**`
- additive finance-twin contracts and schema for company scope, reporting periods, ledger accounts, trial-balance lines, sync runs, lineage, and a backend summary route
- a packaged local finance-twin smoke driven through the Docker-backed local environment

The relevant bounded contexts for this slice are:

- `plans/` for the active F2B plan and the truthful closeout update to `FP-0009`
- `packages/domain` for finance-twin contracts, summary schemas, extractor keys, and slice-specific freshness or read models
- `packages/db` for additive finance-twin schema changes and the forward-only migration
- `apps/control-plane/src/modules/finance-twin/` for extractor selection, raw-byte CSV parsing, persistence orchestration, freshness rollup, routes, and tests
- `apps/control-plane/src/modules/sources/` only if a tiny hook is needed for extractor selection or test setup
- `apps/control-plane/src/bootstrap.ts`, `apps/control-plane/src/lib/types.ts`, `apps/control-plane/src/lib/http-errors.ts`, and `apps/control-plane/src/app.ts` for container and route wiring
- `apps/control-plane/src/test/database.ts` for test DB reset coverage
- `tools/finance-twin-smoke.mjs` and possibly `tools/finance-twin-account-catalog-smoke.mjs` plus root `package.json` for packaged local proof
- `START_HERE.md` and `docs/ops/local-dev.md` for truthful active guidance

GitHub connector work is out of scope.
The engineering twin module stays in place and must keep its existing reproducibility tests green.
Replay and evidence behavior should stay unchanged unless this slice must add a small documented truthfulness note that the current sync-run model is the finance-twin evidence spine for now.

## Plan of Work

Implement this slice in five bounded passes.

First, extend the domain contracts so the finance twin can name both extractor families, persist slice-specific account-catalog state, and return a more explicit summary or account-catalog read model with separate freshness for `trialBalance` and `chartOfAccounts`.

Second, add additive database support for persisted chart-of-accounts state and any required lineage target kinds, while keeping `finance_ledger_accounts` as the shared dimension and avoiding destructive changes to the F2A tables.

Third, extend the finance-twin control-plane module with deterministic extractor selection, a raw-byte `chart_of_accounts_csv` parser, repository operations for persisted catalog state, and a service flow that records sync runs, source lineage, and truthful per-slice freshness from stored raw bytes.

Fourth, add focused tests plus a packaged local smoke path that prove account-catalog persistence, explicit lineage, and non-regression for existing F1 ingest and F2A trial-balance sync behavior.

Fifth, update the stale active docs and FP-0009 wording so the repo’s active guidance matches the merged code state honestly without claiming later finance phases are implemented.

## Concrete Steps

1. Keep `plans/FP-0010-chart-of-accounts-and-f2a-polish.md` current throughout the slice, updating `Progress`, `Decision Log`, `Surprises & Discoveries`, and `Outcomes & Retrospective` after meaningful milestones.

2. Extend `packages/domain/src/finance-twin.ts` and `packages/domain/src/index.ts` to cover:
   - extractor keys for both `trial_balance_csv` and `chart_of_accounts_csv`
   - lineage target kinds needed for persisted account-catalog rows
   - separate freshness slices for `trialBalance` and `chartOfAccounts`
   - explicit summary structures that separate company totals from latest-successful per-slice coverage
   - a small account-catalog read model if a dedicated backend route is added

3. Extend `packages/db/src/schema/finance-twin.ts`, `packages/db/src/schema/index.ts`, and `packages/db/drizzle/**` with additive support for persisted account-catalog state.
   The preferred minimal shape is:
   - keep `finance_ledger_accounts` as the shared account dimension
   - add a dedicated persisted account-catalog table keyed to company, ledger account, and sync run so chart-of-accounts coverage is queryable independently of trial-balance-derived account rows
   - add any small supporting columns or enums only when needed for truthful state and lineage

4. Extend `apps/control-plane/src/modules/finance-twin/` with bounded modules that keep routes thin and extraction deterministic, likely including:
   - `chart-of-accounts-csv.ts`
   - service and repository extensions for account-catalog persistence
   - freshness rollup updates
   - a tiny extractor-selection helper if the current direct trial-balance call becomes ambiguous
   - a small account-catalog route only if it materially improves observability of persisted state

5. Preserve the raw-source authority seam by reading stored source bytes through `SourceFileStorage.read()` for both extractor families.
   Do not derive chart-of-accounts state from ingest receipt summaries or any shallow parser samples.

6. Add or update focused tests covering:
   - domain schema parsing for the new summary and account-catalog contracts
   - DB schema export coverage
   - `chart_of_accounts_csv` extractor behavior from raw bytes
   - service-level sync behavior, including persisted account-catalog state, source lineage, and slice-specific freshness
   - repository persistence for account-catalog rows
   - app-level sync, summary, and any added account-catalog read route behavior

7. Update the packaged local proof by either extending `tools/finance-twin-smoke.mjs` or adding `tools/finance-twin-account-catalog-smoke.mjs`, then wire the root `package.json` script if needed.
   The packaged proof should show that:
   - F1 source ingest still stores the raw file immutably
   - finance sync still reads from stored source bytes directly
   - chart-of-accounts state is persisted and queryable
   - summary freshness and coverage semantics stay explicit per slice

8. Correct the stale active docs and F2A plan wording in:
   - `plans/FP-0009-finance-twin-foundation-and-first-extractor.md`
   - `START_HERE.md`
   - `docs/ops/local-dev.md`

9. Run validation in this exact order:

   ```bash
   pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/finance-twin/*.spec.ts
   pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/finance-twin/service.spec.ts src/modules/finance-twin/drizzle-repository.spec.ts src/modules/finance-twin/trial-balance-csv.spec.ts src/app.spec.ts
   pnpm smoke:source-ingest:local
   pnpm smoke:finance-twin:local
   pnpm smoke:finance-twin-account-catalog:local
   pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm ci:repro:current
   ```

   If the dedicated account-catalog smoke is folded into the existing finance-twin smoke, document that decision here and run the equivalent packaged proof instead of inventing a redundant command.

10. If and only if every required validation command is green, create exactly one local commit:

   ```bash
   git commit -m "feat: extend finance twin with account catalog"
   ```

11. If fully green and edits were made, confirm the branch remains `codex/f2b-chart-of-accounts-and-f2a-polish-local-v1`, show the requested git status or log commands, push that exact branch, verify the remote head, and create or report the PR into `main` with the requested title and body.

## Validation and Acceptance

Required validation order:

```bash
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/finance-twin/*.spec.ts
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/finance-twin/service.spec.ts src/modules/finance-twin/drizzle-repository.spec.ts src/modules/finance-twin/trial-balance-csv.spec.ts src/app.spec.ts
pnpm smoke:source-ingest:local
pnpm smoke:finance-twin:local
pnpm smoke:finance-twin-account-catalog:local
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Acceptance is met when all of the following are true:

- a deterministic `chart_of_accounts_csv` extractor exists and syncs from stored raw source bytes rather than ingest receipt summaries
- the Finance Twin persists explicit account-catalog state that is queryable separately from trial-balance-only account presence
- source lineage for the new path remains explicit through source, snapshot, and source-file IDs
- freshness is separate and truthful for `trialBalance` and `chartOfAccounts`
- the finance summary or read model no longer hides mixed semantics behind one ambiguous `coverage` block
- `plans/FP-0009-finance-twin-foundation-and-first-extractor.md`, `START_HERE.md`, and `docs/ops/local-dev.md` reflect the merged repo state truthfully
- F1 source-ingest behavior still works
- F2A trial-balance sync still works
- engineering-twin reproducibility tests still pass unchanged

Provenance, freshness, replay, and limitation posture:
this slice must keep raw sources immutable, keep source lineage queryable, surface stale or missing slice coverage plainly, and avoid implying broader finance completeness than the implemented `trialBalance` plus `chartOfAccounts` slices actually support.
No new CFO Wiki, report, approval, or mission-output behavior is in scope here.

## Idempotence and Recovery

This slice is additive-first and safe to retry when followed carefully.

- Re-running targeted tests, smokes, and sync operations should be safe because the test DB reset truncates finance-twin state between cases.
- Re-running a finance sync for the same uploaded source should update the derived slice state deterministically without mutating the raw source bytes.
- If the schema or migration shape is wrong, revert the uncommitted finance-twin files, regenerate or rewrite the migration cleanly, and rerun the focused finance validations before expanding to the full ladder.
- If validation fails outside this slice or outside the known narrow engineering-twin reproducibility surface, stop and report the blocker instead of widening scope.

## Artifacts and Notes

Expected artifacts from this slice:

- one active F2B Finance Plan
- truthful updates to the earlier F2A plan and the affected active docs
- additive finance-twin domain and DB changes for account-catalog persistence
- deterministic `chart_of_accounts_csv` extractor support
- focused tests for extractor, repository, service, route, and smoke behavior
- packaged local smoke evidence for persisted finance-twin account-catalog state
- one clean commit, push, and PR only if the full validation ladder is green

Documentation boundary note:
the active-doc boundary itself is unchanged, but the listed active docs need truthfulness updates so new Codex runs start from the current F2 state rather than stale F0 or F1 framing.

## Interfaces and Dependencies

Package and runtime boundaries:

- `@pocket-cto/domain` remains the source of truth for finance-twin contracts
- `@pocket-cto/db` remains limited to schema and DB helpers
- `apps/control-plane` owns raw-byte extraction, repository orchestration, freshness rollup, and HTTP transport
- `apps/web` remains out of scope unless one tiny backend-first read surface proves insufficient and a tiny read-only UI is clearly necessary, which is not currently planned

Runtime expectations:

- reuse the existing Postgres and S3-compatible object-store configuration from F1 and F2A
- keep internal `@pocket-cto/*` package names unchanged
- add no new environment variables unless a truly unavoidable need emerges and is documented in the active docs in the same slice

Downstream dependency note:
this slice should become the truthful base for later F2 finance-summary expansion, but it must not begin F3, F4, F5, or F6 behavior.

## Outcomes & Retrospective

This slice shipped as the intended narrow F2B extension.

Implemented outcome:
`chart_of_accounts_csv` now syncs from immutable stored raw bytes, persists explicit account-catalog state and lineage alongside the shared ledger-account dimension, exposes separate `trialBalance` and `chartOfAccounts` freshness, and replaces the earlier ambiguous summary coverage block with clearer company-total versus latest-successful-slice semantics.

Truthfulness and docs outcome:
the merged F2A plan and active docs now describe the repo state honestly, including the merged F2A status, current first-run guidance, and the current local smoke posture for source ingest plus finance-twin sync.

Validation outcome:
focused finance-twin tests, source-ingest smoke, finance-twin smoke, the new account-catalog smoke, the requested engineering-twin reproducibility tests, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current` all passed in this slice.

QA follow-up outcome:
the packaged finance smokes now use distinct default company keys so the trial-balance smoke and the account-catalog smoke each prove their own slice without cross-contaminating route freshness or summary output in the shared local environment.
