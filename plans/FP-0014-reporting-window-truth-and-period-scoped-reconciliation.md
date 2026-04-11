# Harden F2F reporting-window truth for period-scoped reconciliation

## Purpose / Big Picture

This plan implements the next narrow **F2F Finance Twin** slice for Pocket CFO.

The user-visible goal is to harden reporting-window truth for trial-balance-versus-general-ledger reconciliation on top of the shipped F2A through F2E work, while fixing the merged-doc truthfulness lag now visible after the F2E merge.
Operators should be able to tell whether the latest successful general-ledger slice carries explicit source-declared reporting-window context, how that context relates to the latest successful trial-balance period when it exists, when the repo is falling back to activity-window-only semantics, and what limitations still block a stronger reconciliation claim.

This slice stays intentionally narrow and additive.
It does not add another extractor family, does not widen into AR or AP aging, bank or card feeds, contracts, CFO Wiki compilation, finance discovery-answer UX, reports, monitoring, controls, connector APIs, package-scope rename work, or any F3 through F6 implementation.

## Progress

- [x] 2026-04-11T21:56:34Z Complete preflight against fetched `origin/main`, confirm `HEAD` matches fetched `origin/main`, confirm the exact branch name, confirm a clean worktree, verify `gh` auth, and verify local Postgres plus object storage availability.
- [x] 2026-04-11T21:56:34Z Read the active repo guidance, roadmap, shipped F2A through F2E Finance Plans, scoped AGENTS files, and required ops docs; inspect the finance-twin, source, schema, bootstrap, route, smoke, and test seams before planning.
- [x] 2026-04-11T21:56:34Z Create the active F2F Finance Plan in `plans/FP-0014-reporting-window-truth-and-period-scoped-reconciliation.md` before code changes.
- [x] 2026-04-11T22:14:12Z Implement additive general-ledger period-context capture, period-scoped reconciliation truth, and the smallest alignment-diagnostic wording cleanup needed for F2F.
- [x] 2026-04-11T22:14:12Z Update the stale active docs so `README.md`, `START_HERE.md`, and `docs/ops/local-dev.md` reflect merged F2E state and active F2F guidance truthfully.
- [x] 2026-04-11T22:14:12Z Run the required validation ladder in the requested order with a dedicated F2F period-context smoke, keep the slice migration-free, and confirm the full repo plus reproducibility gates are green before commit/push/PR work.

## Surprises & Discoveries

The current F2E reconciliation route is already careful enough to avoid a fake balance variance, but it still evaluates the general-ledger side through `earliestEntryDate` and `latestEntryDate`, which are activity-window facts rather than explicit source-declared reporting-period facts.

The current `general_ledger_csv` extractor does not capture any source-declared period metadata today.
It only extracts journal identity, transaction dates, account data, and debit or credit amounts, so any stronger period-comparability claim must be added deliberately in F2F rather than inferred from existing state.

The existing persisted shape may already be sufficient for the narrow F2F goal.
`finance_twin_sync_runs.stats` is persisted state tied to raw-source-backed sync output, so this slice may be able to store optional general-ledger period context there and surface it through additive read-model contracts without introducing a new table or migration.

The current `sameSyncRun` and `sameSourceSnapshot` fields appear diagnostic under the normal per-file source and sync model rather than expected positive comparability signals.
F2F should preserve them as truthful diagnostics where they still help, but should not let route copy or docs imply that they are the primary success condition for comparison quality.

The root active docs are stale again after the F2E merge.
`README.md`, `START_HERE.md`, and `docs/ops/local-dev.md` still describe F2E as the active next slice rather than merged baseline plus active F2F work.

The current persisted seams were enough for F2F without a schema change.
Persisting optional general-ledger period context inside the existing finance-twin sync-run stats gave this slice a source-backed and reviewable place to carry explicit reporting-window truth without widening the DB schema.

The dedicated F2F smoke was worth keeping separate from the existing reconciliation smoke.
The existing reconciliation smoke still proves the honest activity-window-only fallback, while the new period-context smoke proves the stronger exact-match path when explicit source-declared fields are present.

## Decision Log

Decision: treat F2F as a backend-first Finance Twin truthfulness slice rather than another extractor or reporting workflow slice.
Rationale: the user explicitly wants stronger reporting-window truth and period-scoped comparability, not broader finance surface area.

Decision: preserve the existing extractor family count and extend only `general_ledger_csv` with optional explicit period-context capture.
Rationale: the user explicitly forbids adding another extractor family in this slice.

Decision: prefer additive domain and control-plane changes over schema churn, and use the existing persisted sync-run stats seam if it can carry source-declared general-ledger period context truthfully.
Rationale: the current gap is read-model truth rather than obvious relational storage absence, and the user explicitly prefers the narrowest reviewable F2F diff.

Decision: distinguish source-declared period context from activity-window evidence in both code and outputs.
Rationale: the user explicitly forbids treating journal activity dates as equivalent to a source-declared general-ledger reporting period.

Decision: keep `sameSyncRun` and `sameSourceSnapshot` only as diagnostic truth unless implementation proves they still drive a material contract.
Rationale: under the current per-file source model they are typically negative even for healthy multi-file finance flows, so F2F should not overemphasize them as expected comparability signals.

Decision: keep GitHub connector work out of scope and keep the engineering-twin module unchanged.
Rationale: this slice is finance-twin read-model hardening on top of the existing raw-source ingest and finance-twin persistence spine.

Decision: persist optional general-ledger source-declared period context in `finance_twin_sync_runs.stats` instead of adding a new table or migration.
Rationale: F2F only needs additive truth for the latest successful general-ledger slice and reconciliation read model, and the existing persisted sync-run stats seam already stores source-backed deterministic extraction facts.

Decision: add a small dedicated period-context smoke rather than overloading the existing reconciliation smoke with both fallback and explicit-period proofs.
Rationale: keeping both proofs separate makes the activity-window-only semantics and the source-declared-period semantics easier to review and less brittle.

## Context and Orientation

Pocket CFO has already shipped F1 raw-source ingest plus F2A trial-balance sync, F2B chart-of-accounts sync, F2C general-ledger sync, F2D snapshot and lineage reads, and F2E reconciliation-readiness plus activity-lineage drill behavior.
The repo now has immutable source registration, stored raw file reads, deterministic CSV extraction for `trial_balance_csv`, `chart_of_accounts_csv`, and `general_ledger_csv`, persisted finance companies and slice state, sync runs with persisted stats, lineage, a company summary route, a company snapshot route, an account-catalog route, a general-ledger route, a reconciliation route, and lineage drill routes.

The relevant bounded contexts for this slice are:

- `plans/` for the active F2F plan and a tiny merged-status note in `FP-0013` only if strictly necessary
- `packages/domain` for additive general-ledger period-context and reconciliation truth contracts
- `packages/db` only if implementation proves a real persisted query gap that cannot be handled through existing sync-run-backed persisted state
- `apps/control-plane/src/modules/finance-twin/` for extractor parsing, sync persistence, latest-successful slice assembly, reconciliation truth assembly, routes, and focused tests
- `apps/control-plane/src/modules/sources/**` only if one tiny metadata helper is strictly required
- `apps/control-plane/src/bootstrap.ts`, `apps/control-plane/src/lib/types.ts`, `apps/control-plane/src/lib/http-errors.ts`, `apps/control-plane/src/app.ts`, and `apps/control-plane/src/test/database.ts` for wiring and regression coverage
- `tools/finance-twin-reconciliation-smoke.mjs`, `tools/finance-twin-snapshot-smoke.mjs`, and `tools/finance-twin-period-context-smoke.mjs` if a dedicated packaged proof is needed
- `README.md`, `START_HERE.md`, and `docs/ops/local-dev.md` for truthful active guidance

GitHub connector work is out of scope.
The engineering twin remains in place and must keep its reproducibility tests green unchanged.
Replay and evidence behavior should stay unchanged unless this slice needs a tiny note clarifying that persisted finance sync plus lineage state remains the current finance evidence spine for these reads.

## Plan of Work

Implement this slice in five bounded passes.

First, extend the general-ledger extractor and finance-twin domain contracts so the latest successful general-ledger slice can expose optional source-declared reporting-period context separately from activity-window facts.

Second, extend the finance-twin sync persistence flow so any explicit general-ledger period context discovered during deterministic extraction is persisted with the sync result in a source-backed, additive way.
Prefer existing `finance_twin_sync_runs.stats` if it is sufficient and truthful.

Third, extend the latest-successful general-ledger slice read model and the reconciliation assembler so they surface explicit comparison basis and window relation, distinguishing source-declared-period comparisons from activity-window-only fallback and from missing-context cases.

Fourth, add focused tests and one packaged proof path that demonstrate optional explicit period-context extraction, honest fallback when explicit period context is absent, period-scoped relation reporting, and no-fake-period-claim behavior while keeping F1 and F2A through F2E behavior green.

Fifth, update the stale active docs so fresh Codex runs start from merged F2E state and active F2F guidance without reviving GitHub or engineering-twin work as the operator path.

## Concrete Steps

1. Keep `plans/FP-0014-reporting-window-truth-and-period-scoped-reconciliation.md` current throughout the slice, updating `Progress`, `Decision Log`, `Surprises & Discoveries`, and `Outcomes & Retrospective` after meaningful milestones.

2. Extend `packages/domain/src/finance-twin.ts` and `packages/domain/src/index.ts` to cover:
   - a small general-ledger period-context view that separates source-declared period facts from activity-window facts
   - additive latest-successful general-ledger slice fields so summary, snapshot, and reconciliation surfaces can expose that context truthfully
   - additive reconciliation comparability fields such as explicit basis and window relation, or an equivalently small truthful contract

3. Prefer no DB migration.
   If the current persisted state is sufficient, keep `packages/db/src/schema/finance-twin.ts`, `packages/db/src/schema/index.ts`, and `packages/db/drizzle/**` unchanged.
   Only add a migration if implementation proves there is a real persisted query gap that cannot be handled cleanly through existing sync-run-backed persisted state.

4. Extend `apps/control-plane/src/modules/finance-twin/general-ledger-csv.ts` so `general_ledger_csv` can deterministically capture optional explicit source-declared period fields when they are present.
   Keep this optional and deterministic.
   Do not require period fields for extraction to succeed.
   Do not invent period context from transaction dates alone.

5. Extend `apps/control-plane/src/modules/finance-twin/service.ts` so successful general-ledger syncs persist optional explicit period-context facts alongside existing sync-run stats and so the latest-successful general-ledger slice can read them back truthfully.

6. Extend the reconciliation assembler and any small supporting helpers under `apps/control-plane/src/modules/finance-twin/` so the route can explicitly say whether its comparison basis is:
   - source-declared period context
   - activity-window-only context
   - missing or insufficient context

7. Surface at least these F2F comparison outcomes in the reconciliation read model:
   - exact match
   - subset
   - outside
   - unknown

8. Verify whether `sameSyncRun` and `sameSourceSnapshot` are only diagnostic fields under the current per-file source and sync model.
   If they are, keep them only as diagnostic truth and add the smallest truthful wording or limitation update needed in route output or docs so they are not framed as expected positive signals.

9. Add or update focused tests covering:
   - optional general-ledger source-declared period-context extraction behavior
   - no-fake-period-claim behavior when explicit general-ledger period context is absent
   - reconciliation basis and window-relation behavior for source-declared-period comparisons
   - truthful activity-window-only fallback semantics
   - any alignment-diagnostic wording fix made in this slice
   - route-level contract behavior in `src/app.spec.ts`

10. Update the packaged proof surface by extending `tools/finance-twin-reconciliation-smoke.mjs` and, if cleaner, adding `tools/finance-twin-period-context-smoke.mjs`.
    The packaged proof should show that:
    - finance reads still depend on persisted state from raw-source-backed syncs
    - explicit general-ledger period context is surfaced when present
    - activity-window-only fallback is explicit when explicit period context is absent
    - no fake balance variance or fake direct period equivalence is claimed

11. Update the stale active docs in:
    - `README.md`
    - `START_HERE.md`
    - `docs/ops/local-dev.md`
    - `plans/FP-0013-reconciliation-readiness-and-snapshot-hardening.md` only if a tiny merged-status note is strictly necessary

12. Run validation in this exact order:

   ```bash
   pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/finance-twin/general-ledger-csv.spec.ts src/modules/finance-twin/service.spec.ts src/app.spec.ts
   pnpm --filter @pocket-cto/domain exec vitest run src/finance-twin.spec.ts
   pnpm --filter @pocket-cto/db exec vitest run src/schema.spec.ts
   pnpm smoke:source-ingest:local
   pnpm smoke:finance-twin:local
   pnpm smoke:finance-twin-account-catalog:local
   pnpm smoke:finance-twin-general-ledger:local
   pnpm smoke:finance-twin-snapshot:local
   pnpm smoke:finance-twin-reconciliation:local
   pnpm run smoke:finance-twin-period-context:local
   pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm ci:repro:current
   ```

   If the period-context proof is folded into an updated reconciliation smoke instead of a dedicated command, document that decision here and run the equivalent packaged proof instead of inventing redundant coverage.

13. If and only if every required validation command is green, create exactly one local commit:

   ```bash
   git commit -m "feat: harden finance twin reporting window truth"
   ```

14. If fully green and edits were made, confirm the branch remains `codex/f2f-reporting-window-truth-and-period-scoped-reconciliation-local-v1`, show `git branch --show-current`, `git log --oneline -3`, and `git status --short --untracked-files=all`, push that exact branch, verify the remote head, and create or report the PR into `main` with the requested title and body.

## Validation and Acceptance

Required validation order:

```bash
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/finance-twin/general-ledger-csv.spec.ts src/modules/finance-twin/service.spec.ts src/app.spec.ts
pnpm --filter @pocket-cto/domain exec vitest run src/finance-twin.spec.ts
pnpm --filter @pocket-cto/db exec vitest run src/schema.spec.ts
pnpm smoke:source-ingest:local
pnpm smoke:finance-twin:local
pnpm smoke:finance-twin-account-catalog:local
pnpm smoke:finance-twin-general-ledger:local
pnpm smoke:finance-twin-snapshot:local
pnpm smoke:finance-twin-reconciliation:local
pnpm run smoke:finance-twin-period-context:local
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Acceptance is met when all of the following are true:

- the repo gains stronger general-ledger period-context truth without adding a new extractor family
- the latest successful general-ledger slice can expose explicit source-declared period context when present and explicit activity-window fallback when it is absent
- the reconciliation view clearly identifies whether its comparison basis is source-declared period context, activity-window-only context, or insufficient context
- the reconciliation view distinguishes at minimum exact-match, subset, outside, and unknown relation outcomes without faking direct balance reconciliation
- the route still does not compute a fake balance variance
- summary, snapshot, and reconciliation semantics remain explicit and understandable after the F2F change
- `sameSyncRun` and `sameSourceSnapshot` are treated only as diagnostic truth if that is what the current per-file source model supports
- F1 source-ingest behavior still works
- F2A trial-balance behavior still works
- F2B chart-of-accounts and account-catalog behavior still works
- F2C general-ledger behavior still works
- F2D snapshot and lineage behavior still works
- F2E reconciliation and activity-lineage behavior still works except where a tiny truthfulness correction is intentional and documented
- engineering-twin reproducibility tests still pass unchanged
- `README.md`, `START_HERE.md`, and `docs/ops/local-dev.md` describe merged F2E state and active F2F guidance truthfully

Provenance, freshness, replay, and limitation posture:
this slice must keep raw sources immutable, keep lineage queryable, surface stale, partial, or missing context plainly, and avoid implying that trial-balance ending balances and general-ledger activity totals or journal dates are equivalent to one another.
No new CFO Wiki, report, approval, mission-output, monitoring, or connector behavior is in scope here.

## Idempotence and Recovery

This slice is additive-first and safe to retry when followed carefully.

- Re-running targeted tests, smokes, and read-only finance-twin routes should be safe because the test DB reset truncates finance-twin state between cases.
- Re-running finance syncs for the same uploaded source should keep producing persisted derived state deterministically without mutating raw source bytes.
- If the general-ledger period-context contract is wrong, revert the uncommitted finance-twin files, keep the plan updates, and rerun the focused finance validations before expanding to the full ladder.
- If a schema change becomes truly necessary, make it additive, migrate the local databases before DB-backed tests, and rerun the validation ladder from the requested order.
- If validation fails outside this slice or outside the known narrow engineering-twin reproducibility surface, stop and report the blocker instead of widening scope.

## Artifacts and Notes

Expected artifacts from this slice:

- one active F2F Finance Plan
- additive finance-twin domain and control-plane truthfulness changes for general-ledger period context and reconciliation basis
- focused extractor, service, route, and smoke test coverage
- truthful root-doc updates for merged F2E plus active F2F guidance
- one clean commit, push, and PR only if the full validation ladder is green

Documentation boundary note:
the active-doc boundary itself is unchanged, but the listed active docs need truthfulness updates so fresh Codex runs start from the current merged F2 baseline and the active F2F slice instead of stale F2E-next wording.

## Interfaces and Dependencies

Package and runtime boundaries:

- `@pocket-cto/domain` remains the source of truth for finance-twin contracts
- `@pocket-cto/db` remains limited to schema and DB helpers unless a real persisted query gap appears
- `apps/control-plane` owns extractor parsing, sync persistence, read-model assembly, limitations posture, and HTTP transport
- `apps/web` remains out of scope unless a tiny read-only surface becomes strictly unavoidable, which is not currently planned

Runtime expectations:

- reuse the existing Postgres and S3-compatible object-store configuration from F1 and the shipped F2 slices
- keep internal `@pocket-cto/*` package names unchanged
- add no new environment variables unless a truly unavoidable need emerges and is documented in the same slice

Downstream dependency note:
this slice should become the truthful base for the next narrow F2 read-model extension, but it must not begin F3, F4, F5, or F6 behavior.

## Outcomes & Retrospective

This section will be completed as implementation and validation progress.
The intended shipped outcome is an additive F2F hardening slice that preserves raw-source authority, makes general-ledger period-context truth explicit, keeps reconciliation basis honest, and updates the root active docs so merged F2E status and active F2F guidance match the current repo reality.
