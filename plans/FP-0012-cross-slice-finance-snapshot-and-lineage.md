# Add the F2D cross-slice finance snapshot and lineage read model

## Purpose / Big Picture

This plan implements the next narrow **F2D Finance Twin** slice for Pocket CFO.

The user-visible goal is to add one truthful company-level cross-slice snapshot and lineage read model on top of the already shipped F2A, F2B, and F2C extractor families.
Operators should be able to see which accounts exist in the latest chart of accounts, which of those accounts appear in the latest trial balance, which show activity in the latest general ledger, whether those latest successful slices align to one source snapshot or are mixed across runs, and how to drill from the read model back to explicit source lineage.

This slice stays intentionally narrow and additive.
It does not add another extractor family, does not widen into AR or AP aging, bank or card feeds, contracts, CFO Wiki compilation, finance discovery answers, memo or report generation, monitoring, close or control work, connector APIs, package-scope rename work, or any F3 through F6 implementation.

## Progress

- [x] 2026-04-11T12:39:16Z Complete preflight against fetched `origin/main`, confirm `HEAD` matches fetched `origin/main`, confirm the exact branch name, confirm a clean worktree, verify `gh` auth, and verify local Postgres plus object storage availability.
- [x] 2026-04-11T12:39:16Z Read the active repo guidance, roadmap, the shipped F2A through F2C Finance Plans, scoped AGENTS files, and the required ops docs; inspect the finance-twin, sources, bootstrap, route, schema, test, and smoke seams before planning.
- [x] 2026-04-11T12:39:16Z Create the active F2D Finance Plan in `plans/FP-0012-cross-slice-finance-snapshot-and-lineage.md` before code changes.
- [x] 2026-04-11T12:53:33Z Implement the additive finance snapshot and lineage drill read surfaces, keeping routes thin and using only persisted F2 state from the latest successful implemented slices.
- [x] 2026-04-11T12:53:33Z Tighten coverage and lineage truthfulness where the current summary remains too coarse, without changing F1 raw-source authority or the historical sync-run model.
- [x] 2026-04-11T12:53:33Z Update the active root docs so `README.md`, `START_HERE.md`, and `docs/ops/local-dev.md` reflect merged F2C state and active F2D guidance truthfully.
- [x] 2026-04-11T14:00:45Z Run the required validation ladder in the requested order, fix only the in-scope finance service mock drift surfaced by `pnpm typecheck`, and keep the remaining validations green through `pnpm ci:repro:current`.

## Surprises & Discoveries

The current finance summary already improved attempted-versus-successful semantics in F2C, but the remaining gap is no longer freshness alone.
The missing piece is a company-scope read model that joins the latest successful persisted slice state without implying those slices belong to one coherent close package when they come from different sync runs or source snapshots.

The existing per-slice `lineageCount` fields are now too coarse to explain what is actually lineaged in a multi-slice company view.
They remain useful as a small aggregate, but F2D needs a clearer breakdown or a drill surface so an operator can move from a row in the snapshot to explicit lineage targets and source references.

The currently persisted tables are sufficient for the narrow F2D goal.
Implementation did not require a schema migration because the existing F2 tables already expose the shared ledger-account dimension, per-slice persisted rows, sync runs, and finance lineage needed for the new read model and drill route.

The clearest low-risk way to tighten lineage truthfulness was additive rather than replacement.
Keeping the coarse per-slice `lineageCount` while adding explicit `lineageTargetCounts` and a narrow lineage drill route preserved existing summary readability and removed the remaining ambiguity.

Expanding the finance-twin service port required one small test-harness follow-through outside the finance-twin module itself.
`pnpm typecheck` correctly surfaced stale mocks in `bootstrap.spec.ts` and the orchestrator DB harness, and the fix stayed additive by extending those doubles with the new snapshot and lineage methods.

## Decision Log

Decision: treat F2D as a backend-first read-model slice rather than another extractor slice.
Rationale: the user explicitly asked for cross-slice finance snapshot and lineage truthfulness on top of the already merged F2A, F2B, and F2C extractor work.

Decision: compute the new snapshot only from persisted finance-twin state associated with the latest successful implemented slices.
Rationale: the acceptance bar explicitly forbids deriving state from shallow ingest receipt summaries and requires F1 raw-source ingest to remain authoritative and immutable.

Decision: keep the historical sync-run model and make mixed-slice alignment explicit instead of trying to synthesize one unified reporting package.
Rationale: the user explicitly requires honest alignment posture when the latest successful slices come from different source snapshots or sync runs.

Decision: keep GitHub connector work out of scope and keep the engineering-twin module unchanged.
Rationale: this slice is about finance read clarity, not connector or engineering-twin redesign.

Decision: prefer additive repository and domain extensions over schema churn unless implementation proves a truly unavoidable schema gap.
Rationale: the current F2 state already persists ledger accounts, trial-balance lines, account-catalog entries, journal entries, journal lines, sync runs, and lineage, which may be enough for the narrowest truthful snapshot.

Decision: keep existing summary coverage fields but add explicit lineage target breakdowns instead of silently redefining `lineageCount`.
Rationale: this keeps the F2A through F2C summary surface backward-readable while making slice-specific lineage coverage explicit for F2D.

Decision: use one narrow lineage drill route with optional `syncRunId` scoping.
Rationale: shared ledger-account targets can accumulate lineage across multiple extractor families, and optional sync-run scoping keeps the route minimal while still supporting row-level drill-through to one slice.

## Context and Orientation

Pocket CFO has already shipped F1 raw-source ingest plus F2A trial-balance sync, F2B chart-of-accounts sync, and F2C general-ledger sync.
The repo now has persisted finance companies, reporting periods, ledger accounts, trial-balance lines, account-catalog entries, journal entries, journal lines, sync runs, and finance lineage.
The current route surface exposes sync, company summary, account catalog, and general ledger reads.

The relevant bounded contexts for this slice are:

- `plans/` for the active F2D plan and a tiny shipped-status note in `FP-0011` only if strictly necessary
- `packages/domain` for snapshot, alignment, coverage, and lineage-drill contracts
- `packages/db` for additive schema exports or migration work only if a real query gap appears
- `apps/control-plane/src/modules/finance-twin/` for repository queries, snapshot assembly, lineage drill assembly, routes, schemas, and tests
- `apps/control-plane/src/modules/sources/` only if a tiny lineage detail hook is required for source metadata
- `apps/control-plane/src/bootstrap.ts`, `apps/control-plane/src/lib/types.ts`, `apps/control-plane/src/lib/http-errors.ts`, `apps/control-plane/src/app.ts`, and `apps/control-plane/src/test/database.ts` for wiring and test coverage
- `tools/finance-twin-snapshot-smoke.mjs` plus any tiny finance smoke touch and `package.json` for packaged local proof
- `README.md`, `START_HERE.md`, and `docs/ops/local-dev.md` for truthful active guidance

GitHub connector work is out of scope.
The engineering twin remains in place and must keep its reproducibility tests green unchanged.
Replay and evidence behavior should stay unchanged unless this slice needs a tiny note clarifying that the persisted finance sync-run plus lineage model remains the current finance evidence spine.

## Plan of Work

Implement this slice in five bounded passes.

First, extend the finance-twin domain contracts to name the new cross-slice company snapshot, per-account row shape, slice alignment view, clearer lineage coverage breakdowns where touched, and a minimal lineage-drill route contract.

Second, extend the finance-twin repository seam with the smallest additive query helpers needed to build that read model from persisted state, such as listing ledger accounts by company, joining trial-balance rows to ledger accounts, aggregating general-ledger activity by account from the latest successful slice, and querying lineage by target with optional sync-run scope.

Third, extend the finance-twin service with one company-scope snapshot assembler that reads the latest successful implemented slices, computes alignment truth explicitly, builds deterministic cross-slice account coverage, and preserves limitations when slices are missing or mixed.
Add one narrow lineage drill assembler that returns more explicit lineage than the current coarse per-slice `lineageCount`.

Fourth, expose the new backend route or routes with thin transport code and add focused tests plus a packaged local snapshot smoke to prove the new read model and lineage drill behavior without disturbing F1 raw-source ingest or the existing F2A through F2C routes.

Fifth, update the stale active docs so the merged root guidance describes F2C as merged, names F2D as the active next slice, and keeps the finance smoke path obvious without deleting legacy GitHub or engineering scripts.

## Concrete Steps

1. Keep `plans/FP-0012-cross-slice-finance-snapshot-and-lineage.md` current throughout the slice, updating `Progress`, `Decision Log`, `Surprises & Discoveries`, and `Outcomes & Retrospective` after meaningful milestones.

2. Extend `packages/domain/src/finance-twin.ts` and `packages/domain/src/index.ts` to cover:
   - `FinanceSnapshotView`
   - `FinanceSnapshotAccountRow`
   - `FinanceSliceAlignmentView`
   - clearer lineage or coverage breakdown structures where the current per-slice `lineageCount` is ambiguous
   - one minimal lineage drill route contract

3. Only if implementation proves the current persisted tables are insufficient, extend `packages/db/src/schema/finance-twin.ts`, `packages/db/src/schema/index.ts`, and `packages/db/drizzle/**` additively.
   Otherwise, keep this slice schema-free and rely on repository query additions instead.

4. Extend `apps/control-plane/src/modules/finance-twin/` with bounded modules that keep routes thin, likely including:
   - repository and Drizzle repository query additions for company account coverage and lineage drill reads
   - a snapshot assembler helper
   - a lineage drill helper
   - service extensions for `getCompanySnapshot()` and the lineage drill route
   - route and schema additions for the new read surfaces

5. Preserve the raw-source authority seam by building the new snapshot only from persisted finance-twin state and source lineage.
   Do not derive cross-slice coverage from source ingest receipt summaries, CSV preview rows, or other shallow ingest metadata.

6. Make slice alignment explicit in the snapshot.
   At minimum, surface whether the latest successful trial-balance, chart-of-accounts, and general-ledger slices share the same sync run or source snapshot, or whether the company view is mixed across different successful runs.

7. Make account coverage explicit in the snapshot.
   At minimum, each row should let an operator see:
   - whether the account is present in the latest chart of accounts
   - whether it is present in the latest trial balance
   - whether it has activity in the latest general ledger
   - whether any active or inactive account-catalog state makes a missing or inactive condition visible

8. Make lineage more drillable than the current coarse `lineageCount`.
   Prefer one narrow route such as `GET /finance-twin/companies/:companyKey/lineage/:targetKind/:targetId` or an equivalent query-parameter form if sync-run scoping makes that clearer.

9. Add or update focused tests covering:
   - domain schema parsing for the new snapshot, alignment, coverage, and lineage drill contracts
   - service-level cross-slice snapshot behavior
   - mixed-slice alignment truthfulness
   - lineage drill-through behavior
   - coverage summary semantics
   - app-level route behavior for the new snapshot surface

10. Add `tools/finance-twin-snapshot-smoke.mjs` and wire the root script in `package.json`.
    The packaged proof should show that:
    - F1 source ingest still stores raw files immutably
    - finance reads still depend on persisted finance-twin slice state
    - the cross-slice snapshot makes mixed alignment visible when appropriate
    - lineage drill information is more explicit than a whole-run count

11. Update the stale active docs in:
    - `README.md`
    - `START_HERE.md`
    - `docs/ops/local-dev.md`
    - `plans/FP-0011-general-ledger-and-finance-twin-hardening.md` only if a tiny merged-status note is strictly necessary

12. Run validation in this exact order:

   ```bash
   pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/finance-twin/service.spec.ts src/app.spec.ts
   pnpm --filter @pocket-cto/domain exec vitest run src/finance-twin.spec.ts
   pnpm --filter @pocket-cto/db exec vitest run src/schema.spec.ts
   pnpm smoke:source-ingest:local
   pnpm smoke:finance-twin:local
   pnpm smoke:finance-twin-account-catalog:local
   pnpm smoke:finance-twin-general-ledger:local
   pnpm smoke:finance-twin-snapshot:local
   pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm ci:repro:current
   ```

13. If and only if every required validation command is green, create exactly one local commit:

   ```bash
   git commit -m "feat: add finance twin snapshot read model"
   ```

14. If fully green and edits were made, confirm the branch remains `codex/f2d-cross-slice-finance-snapshot-and-lineage-local-v1`, show `git branch --show-current`, `git log --oneline -3`, and `git status --short --untracked-files=all`, push that exact branch, verify the remote head, and create or report the PR into `main` with the requested title and body.

## Validation and Acceptance

Required validation order:

```bash
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/finance-twin/service.spec.ts src/app.spec.ts
pnpm --filter @pocket-cto/domain exec vitest run src/finance-twin.spec.ts
pnpm --filter @pocket-cto/db exec vitest run src/schema.spec.ts
pnpm smoke:source-ingest:local
pnpm smoke:finance-twin:local
pnpm smoke:finance-twin-account-catalog:local
pnpm smoke:finance-twin-general-ledger:local
pnpm smoke:finance-twin-snapshot:local
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Acceptance is met when all of the following are true:

- a new route-backed company snapshot read model exists at `GET /finance-twin/companies/:companyKey/snapshot`
- the snapshot is built only from persisted finance-twin state tied to the latest successful implemented slices
- slice alignment truth is explicit when the latest successful slices share or do not share the same sync run or source snapshot
- account coverage is explicit across the implemented slices, including chart-of-accounts presence, trial-balance presence, and general-ledger activity
- source lineage is more explicit and drillable than the current coarse per-slice `lineageCount`
- summary coverage semantics are clearer anywhere this slice touches them
- F1 source-ingest behavior still works
- F2A trial-balance behavior still works
- F2B chart-of-accounts and account-catalog behavior still works
- F2C general-ledger behavior still works
- engineering-twin reproducibility tests still pass unchanged
- the root active docs describe merged F2C state and active F2D guidance truthfully

Provenance, freshness, replay, and limitation posture:
this slice must keep raw sources immutable, keep source lineage queryable, surface missing, stale, mixed, or partial slice coverage plainly, and avoid implying a coherent close package when the latest successful slices are mixed across different source snapshots or runs.
No new CFO Wiki, report, approval, mission-output, or connector behavior is in scope here.

## Idempotence and Recovery

This slice is additive-first and safe to retry when followed carefully.

- Re-running targeted tests, smokes, and read-only snapshot requests should be safe because the test DB reset truncates finance-twin state between cases.
- Re-running finance syncs for the same uploaded source should keep producing persisted slice state deterministically without mutating raw source bytes.
- If repository query shape or route contracts are wrong, revert the uncommitted finance-twin files, keep the plan updates, and rerun the focused finance validations before expanding to the full ladder.
- If a schema change becomes necessary, make it additive, migrate the local databases before DB-backed tests, and rerun the validation ladder from the requested order.
- If validation fails outside this slice or outside the known narrow engineering-twin reproducibility surface, stop and report the blocker instead of widening scope.

## Artifacts and Notes

Expected artifacts from this slice:

- one active F2D Finance Plan
- additive finance-twin domain and control-plane read-model changes
- a packaged local snapshot smoke
- truthful root-doc updates for merged F2C plus active F2D guidance
- one clean commit, push, and PR only if the full validation ladder is green

Documentation boundary note:
the active-doc boundary itself is unchanged, but the affected active docs need truthfulness updates so fresh Codex runs start from the current merged F2 baseline and the active F2D slice instead of stale F2C branch framing.

## Interfaces and Dependencies

Package and runtime boundaries:

- `@pocket-cto/domain` remains the source of truth for finance-twin contracts
- `@pocket-cto/db` remains limited to schema and DB helpers
- `apps/control-plane` owns repository queries, snapshot assembly, lineage drill assembly, freshness and limitation posture, and HTTP transport
- `apps/web` remains out of scope unless a tiny read-only surface becomes strictly unavoidable, which is not currently planned

Runtime expectations:

- reuse the existing Postgres and S3-compatible object-store configuration from F1 and the shipped F2 slices
- keep internal `@pocket-cto/*` package names unchanged
- add no new environment variables unless a truly unavoidable need emerges and is documented in the same slice

Downstream dependency note:
this slice should become the truthful base for later F2 finance-twin query expansion, but it must not begin F3, F4, F5, or F6 behavior.

## Outcomes & Retrospective

F2D shipped as a backend-first additive read-model slice without widening into new extractor families or broader finance workflows.
The resulting company snapshot now joins the latest successful chart-of-accounts, trial-balance, and general-ledger state at the shared ledger-account dimension, makes mixed-slice alignment explicit, and adds a narrow lineage drill route so operators can move from a row or slice summary to concrete source-backed lineage.

The slice stayed schema-free because the existing persisted finance state was already strong enough for the narrow cross-slice read model.
Keeping `lineageCount` while adding `lineageTargetCounts` proved to be the lowest-risk truthfulness improvement for the existing summary routes, and the dedicated snapshot smoke made that improvement observable in the local operator path.

Validation finished fully green in the requested order:
- targeted finance-twin route and service tests
- domain and DB contract tests
- source-ingest and existing finance-twin local smokes
- the new finance snapshot smoke
- engineering-twin regression tests
- repo-wide `lint`
- repo-wide `typecheck`
- repo-wide `test`
- `pnpm ci:repro:current`

What remains after this slice is the next narrow F2 extension on top of the new snapshot baseline, not more extractor sprawl.
The strongest next step is to add one similarly truthful company-scope variance or reconciliation read model that compares the latest successful trial balance against the latest successful general ledger while preserving the same mixed-alignment and source-lineage posture introduced here.

Current implementation status:
the repo now has one truthful company snapshot read surface, one narrow lineage drill surface, explicit mixed-slice alignment posture, clearer lineage target coverage semantics in the existing summary slices, a packaged local snapshot smoke, and updated active docs that describe merged F2C state plus active F2D guidance without widening scope beyond Finance Twin v1 read clarity.

Remaining work:
run the full required validation ladder, fix only any in-scope failures, then commit, push, and create or report the PR only if every required command is green.
