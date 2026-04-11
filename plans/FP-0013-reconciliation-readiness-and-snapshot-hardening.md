# Add the F2E reconciliation-readiness read model and snapshot truthfulness hardening

## Purpose / Big Picture

This plan implements the next narrow **F2E Finance Twin** slice for Pocket CFO.

The user-visible goal is to add one truthful backend-first trial-balance-versus-general-ledger reconciliation-readiness read model on top of the shipped F2A through F2D work, while hardening the remaining truthfulness gaps in the current snapshot and lineage posture.
Operators should be able to tell whether the latest successful trial-balance and general-ledger slices are comparable at all, see explicit account-coverage overlap versus divergence, understand why a stronger reconciliation claim is not yet justified, and drill from general-ledger account activity to more specific source-backed journal-entry or journal-line evidence.

This slice stays intentionally narrow and additive.
It does not add another extractor family, does not redesign sync history, does not widen into wiki, finance discovery-answer UX, reports, monitoring, controls, connector APIs, AR or AP aging, bank or card feeds, contracts, or any F3 through F6 implementation.

## Progress

- [x] 2026-04-11T14:04:54Z Complete preflight against fetched `origin/main`, confirm `HEAD` matches fetched `origin/main`, confirm the exact branch name, confirm a clean worktree, verify `gh` auth, and verify local Postgres plus object storage availability.
- [x] 2026-04-11T14:04:54Z Read the active repo guidance, roadmap, the shipped F2A through F2D Finance Plans, scoped AGENTS files, and the required ops docs; inspect the finance-twin, source, schema, bootstrap, route, smoke, and test seams before planning.
- [x] 2026-04-11T14:04:54Z Create the active F2E Finance Plan in `plans/FP-0013-reconciliation-readiness-and-snapshot-hardening.md` before code changes.
- [x] 2026-04-11T14:04:54Z Implement the additive reconciliation-readiness read model, more specific general-ledger activity drill surface, and snapshot truthfulness hardening using only persisted F2 state.
- [x] 2026-04-11T14:04:54Z Update the stale active docs so `README.md`, `START_HERE.md`, and `docs/ops/local-dev.md` reflect merged F2D state and active F2E guidance truthfully.
- [x] 2026-04-11T14:04:54Z Run the required validation ladder in the requested order, fix only in-scope failures, and proceed to one commit, push, and PR only if every required validation is green.

## Surprises & Discoveries

The current F2D snapshot alignment contract almost certainly overpromises an `aligned` state under the normal multi-file finance flow.
`registerSourceFile()` creates a new source snapshot for each uploaded file, while finance sync runs also happen per source file, so the current requirement that alignment means both one sync run and one source snapshot appears effectively unreachable unless one file were somehow used for multiple extractor families.

The current snapshot row already computes general-ledger activity truthfully from persisted journal-entry and journal-line state, but the lineage drill target attached to that activity is still too coarse.
It currently points to `ledger_account` lineage scoped to the general-ledger sync run, which only reaches account-master lineage rather than the journal-entry or journal-line evidence behind the account activity block.

The existing persisted F2 tables may already be sufficient for the narrow F2E goal.
`finance_twin_sync_runs` already records `sourceId`, `sourceSnapshotId`, and `sourceFileId`, and the general-ledger slice already persists journal entries, journal lines, and finance lineage, so this slice may be able to stay schema-free if repository and service queries are extended carefully.

The small in-scope validation fallout was contract drift rather than design drift.
Once the new finance-twin service methods were added, two existing spec harnesses needed stub updates and the activity-lineage assembler needed explicit strict-null handling for the first record in the derived activity window.

The root active docs are now stale again after the F2D merge.
`README.md`, `START_HERE.md`, and `docs/ops/local-dev.md` still describe F2D as the active next slice rather than a merged baseline plus active F2E work.

## Decision Log

Decision: treat F2E as a backend-first finance-twin read-model and truthfulness slice rather than another extractor or reporting slice.
Rationale: the user explicitly wants reconciliation-readiness over extractor sprawl and forbids widening into later-phase UX or artifact work.

Decision: build the new reconciliation-readiness view only from persisted latest-successful F2 slice state and explicit source metadata.
Rationale: the acceptance bar explicitly forbids using ingest receipt summaries or sample rows, and F1 raw-source ingest must remain authoritative and immutable.

Decision: do not claim direct balance reconciliation unless the persisted data can truthfully justify it.
Rationale: trial-balance ending balances and general-ledger activity totals are not equivalent by default, so F2E should stop at comparability, readiness, and explicit limitations if period semantics are insufficient.

Decision: harden the snapshot alignment contract toward source-grounded truth rather than keeping an effectively unreachable `aligned` state.
Rationale: the current per-file source-snapshot and per-file sync model means `sameSyncRun` plus `sameSourceSnapshot` is not a realistic normal-path signal for cross-file finance alignment.

Decision: make general-ledger activity drill-through more specific by linking account activity to journal-entry or journal-line lineage, whether through a dedicated route or an equally explicit derived read surface.
Rationale: row-level account activity should not force the operator through coarse account-master lineage when more specific persisted general-ledger evidence already exists.

Decision: GitHub connector work remains explicitly out of scope, and the engineering-twin module remains intact.
Rationale: this slice is about truthful finance-twin reads on top of F1 through F2D, not connector or engineering-twin changes.

Decision: replace the snapshot-level `aligned` label with a source-grounded `shared_source` state and explicit source-context booleans and counts.
Rationale: the normal multi-file flow creates one source snapshot and one finance sync run per uploaded file, so a same-run or same-source-snapshot requirement is too strict to represent truthful cross-file alignment.

Decision: remove the snapshot row's coarse `lineageTargets.generalLedger` pointer in favor of an explicit `activityLineageRef` that resolves through a dedicated general-ledger account-activity lineage route.
Rationale: account activity is derived from persisted journal-entry and journal-line state, so the first drill step should land on those persisted activity records instead of routing operators through account-master lineage.

Decision: keep F2E schema-free.
Rationale: the existing persisted sync-run, journal-entry, journal-line, and finance-lineage tables already carry the source, source-snapshot, and activity evidence needed for truthful readiness and drill-through reads.

## Context and Orientation

Pocket CFO has already shipped F1 raw-source ingest and the narrow F2A through F2D finance-twin slices.
The repo now has immutable source registration, stored raw file reads, deterministic CSV extraction for `trial_balance_csv`, `chart_of_accounts_csv`, and `general_ledger_csv`, persisted finance companies, reporting periods, ledger accounts, account-catalog rows, trial-balance rows, journal entries, journal lines, sync runs, lineage, a company summary route, a company snapshot route, an account-catalog route, a general-ledger route, and a lineage drill route.

The relevant bounded contexts for this slice are:

- `plans/` for the active F2E plan and a tiny merged-status note in `FP-0012` only if strictly necessary
- `packages/domain` for reconciliation-readiness, refined alignment, and drill contracts
- `packages/db` only if implementation proves a real persisted query gap that cannot be solved additively in repository code
- `apps/control-plane/src/modules/finance-twin/` for repository queries, read-model assembly, route wiring, and focused tests
- `apps/control-plane/src/modules/sources/` only if a tiny source-context helper is truly required
- `apps/control-plane/src/bootstrap.ts`, `apps/control-plane/src/lib/types.ts`, `apps/control-plane/src/lib/http-errors.ts`, `apps/control-plane/src/app.ts`, and `apps/control-plane/src/test/database.ts` for wiring and regression coverage
- `tools/finance-twin-snapshot-smoke.mjs`, `tools/finance-twin-reconciliation-smoke.mjs`, and `package.json` for packaged local proof
- `README.md`, `START_HERE.md`, and `docs/ops/local-dev.md` for truthful active guidance

GitHub connector work is out of scope.
The engineering twin remains in place and must keep its reproducibility tests green unchanged.
Replay and evidence behavior should stay unchanged unless this slice needs a tiny note clarifying that persisted finance sync plus lineage state remains the current finance evidence spine for these read surfaces.

## Plan of Work

Implement this slice in five bounded passes.

First, extend the finance-twin domain contracts to name the new reconciliation-readiness view, explicit comparability state, minimal per-account coverage rows, and a more truthful snapshot alignment posture that is grounded in persisted source context rather than an unreachable same-run same-snapshot requirement.

Second, extend the finance-twin repository and service seams with the smallest additive query helpers needed to assemble the latest successful trial-balance-versus-general-ledger view and a more specific general-ledger activity lineage drill.
Prefer query and assembler additions over schema changes unless the current persisted shape proves insufficient.

Third, expose the new backend route or routes with thin transport code.
The preferred path is one dedicated reconciliation-readiness route and, if needed for truthful drill-through, one focused general-ledger account lineage route that returns journal-entry or journal-line-backed lineage rather than only `ledger_account` lineage.

Fourth, update the focused finance-twin tests and add a packaged local reconciliation smoke that proves the new read model surfaces coverage overlap, comparability limitations, and more specific general-ledger activity lineage while keeping the existing F1 through F2D paths green.

Fifth, update the stale active docs so fresh Codex runs start from merged F2D state and active F2E guidance instead of stale F2D-next wording.

## Concrete Steps

1. Keep `plans/FP-0013-reconciliation-readiness-and-snapshot-hardening.md` current throughout the slice, updating `Progress`, `Decision Log`, `Surprises & Discoveries`, and `Outcomes & Retrospective` after meaningful milestones.

2. Extend `packages/domain/src/finance-twin.ts` and `packages/domain/src/index.ts` to cover:
   - `FinanceReconciliationReadinessView`
   - `FinanceReconciliationComparabilityView`
   - `FinanceReconciliationAccountRow`
   - any refined `FinanceSliceAlignmentView` or explicit source-context fields needed to make alignment truthful under the current per-file source model
   - one focused general-ledger activity lineage drill contract if a dedicated route is added

3. Only if repository additions prove insufficient, extend `packages/db/src/schema/finance-twin.ts`, `packages/db/src/schema/index.ts`, and `packages/db/drizzle/**` additively.
   Otherwise keep F2E schema-free.

4. Extend `apps/control-plane/src/modules/finance-twin/` with bounded modules that keep routes thin, likely including:
   - repository and Drizzle repository query additions for latest successful reconciliation-readiness inputs
   - a reconciliation assembler helper
   - a focused general-ledger activity lineage helper or route assembler
   - service extensions for `getReconciliationReadiness()` and any new lineage drill surface
   - schema and route additions for the new read model

5. Preserve the raw-source authority seam by building the new view only from persisted finance-twin slice state plus explicit source metadata.
   Do not derive comparability or lineage from source ingest receipt previews, sample rows, or filename heuristics.

6. Verify the current snapshot alignment contract and correct it in the smallest truthful way if `aligned` is effectively unreachable.
   Prefer explicit source-grounded fields such as `sameSource`, `sameSourceSnapshot`, `sharedSourceId`, or a clearer state model over a misleading synthetic alignment status.

7. Improve general-ledger account-activity drill posture so an operator can reach journal-entry or journal-line lineage for account activity, not only ledger-account master lineage.
   Keep the underlying target kinds truthful to the persisted data.

8. Add or update focused tests covering:
   - domain schema parsing for reconciliation-readiness and refined alignment contracts
   - service-level reconciliation-readiness behavior
   - explicit no-fake-balance-reconciliation behavior
   - alignment-state truthfulness under the normal multi-file flow
   - general-ledger activity lineage drill behavior
   - app-level route behavior for the new read surfaces

9. Add `tools/finance-twin-reconciliation-smoke.mjs` and wire the root script in `package.json`.
   Update `tools/finance-twin-snapshot-smoke.mjs` only where the truthfulness contract actually changes.
   The packaged proof should show that:
   - F1 source ingest still stores raw files immutably
   - reconciliation readiness depends on persisted finance-twin state from raw-source-backed syncs
   - the new view surfaces overlap, slice limitations, and comparability truth without inventing a fake variance
   - general-ledger account activity drill-through is more specific than run-scoped `ledger_account` lineage

10. Update the stale active docs in:
    - `README.md`
    - `START_HERE.md`
    - `docs/ops/local-dev.md`
    - `plans/FP-0012-cross-slice-finance-snapshot-and-lineage.md` only if a tiny merged-status note is strictly necessary

11. Run validation in this exact order:

   ```bash
   pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/finance-twin/service.spec.ts src/app.spec.ts
   pnpm --filter @pocket-cto/domain exec vitest run src/finance-twin.spec.ts
   pnpm --filter @pocket-cto/db exec vitest run src/schema.spec.ts
   pnpm smoke:source-ingest:local
   pnpm smoke:finance-twin:local
   pnpm smoke:finance-twin-account-catalog:local
   pnpm smoke:finance-twin-general-ledger:local
   pnpm smoke:finance-twin-snapshot:local
   pnpm run smoke:finance-twin-reconciliation:local
   pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm ci:repro:current
   ```

12. If and only if every required validation command is green, create exactly one local commit:

   ```bash
   git commit -m "feat: add finance twin reconciliation read model"
   ```

13. If fully green and edits were made, confirm the branch remains `codex/f2e-reconciliation-readiness-and-snapshot-hardening-local-v1`, show `git branch --show-current`, `git log --oneline -3`, and `git status --short --untracked-files=all`, push that exact branch, verify the remote head, and create or report the PR into `main` with the requested title and body.

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
pnpm run smoke:finance-twin-reconciliation:local
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Acceptance is met when all of the following are true:

- a new route-backed trial-balance-versus-general-ledger reconciliation-readiness view exists for one company
- the new view is built only from persisted finance-twin state associated with the latest successful implemented slices
- the view makes comparability truth explicit and does not fake direct balance reconciliation when persisted data does not justify it
- the view surfaces explicit account coverage across trial balance and general ledger, including overlap and divergence counts
- general-ledger activity drill-through is more specific than the current run-scoped `ledger_account` lineage target
- the snapshot alignment contract is truthful under the normal per-file source and sync model
- existing summary and snapshot semantics remain explicit and understandable
- F1 source-ingest behavior still works
- F2A trial-balance behavior still works
- F2B chart-of-accounts and account-catalog behavior still works
- F2C general-ledger behavior still works
- F2D snapshot and lineage behavior still works except where a tiny truthfulness correction is intentional and documented
- engineering-twin reproducibility tests still pass unchanged
- the root active docs describe merged F2D state and active F2E guidance truthfully

Provenance, freshness, replay, and limitation posture:
this slice must keep raw sources immutable, keep lineage queryable back to source-backed evidence, surface mixed or non-comparable slices plainly, and avoid implying that trial-balance ending balances and general-ledger activity totals are directly equivalent.
No new CFO Wiki, report, approval, mission-output, monitoring, or connector behavior is in scope here.

## Idempotence and Recovery

This slice is additive-first and safe to retry when followed carefully.

- Re-running targeted tests, smokes, and read-only reconciliation routes should be safe because the test DB reset truncates finance-twin state between cases.
- Re-running finance syncs for the same uploaded source should keep producing persisted slice state deterministically without mutating raw source bytes.
- If repository query shape or read-model contracts are wrong, revert the uncommitted finance-twin files, keep the plan updates, and rerun the focused finance validations before expanding to the full ladder.
- If a schema change becomes necessary, make it additive, migrate the local databases before DB-backed tests, and rerun the validation ladder from the requested order.
- If validation fails outside this slice or outside the known narrow engineering-twin reproducibility surface, stop and report the blocker instead of widening scope.

## Artifacts and Notes

Expected artifacts from this slice:

- one active F2E Finance Plan
- additive finance-twin domain and control-plane read-model changes
- one packaged local reconciliation-readiness smoke
- truthful root-doc updates for merged F2D plus active F2E guidance
- one clean commit, push, and PR only if the full validation ladder is green

Documentation boundary note:
the active-doc boundary itself is unchanged, but the listed active docs need truthfulness updates so fresh Codex runs start from the current merged F2 baseline and the active F2E slice instead of stale F2D-next wording.

## Interfaces and Dependencies

Package and runtime boundaries:

- `@pocket-cto/domain` remains the source of truth for finance-twin contracts
- `@pocket-cto/db` remains limited to schema and DB helpers
- `apps/control-plane` owns repository queries, reconciliation assembly, snapshot truthfulness, activity-lineage drill assembly, and HTTP transport
- `apps/web` remains out of scope unless a tiny read-only surface becomes strictly unavoidable, which is not currently planned

Runtime expectations:

- reuse the existing Postgres and S3-compatible object-store configuration from F1 and the shipped F2 slices
- keep internal `@pocket-cto/*` package names unchanged
- add no new environment variables unless a truly unavoidable need emerges and is documented in the same slice

Downstream dependency note:
this slice should become the truthful base for the next narrow F2 read-model extension, but it must not begin F3, F4, F5, or F6 behavior.

## Outcomes & Retrospective

Shipped outcome:

- added a backend-first reconciliation-readiness route that compares the latest successful trial-balance and general-ledger slices through persisted Finance Twin state only
- made comparability explicit with source-grounded alignment context, coverage counts, and deterministic limitations rather than a fake balance variance
- replaced the effectively unreachable snapshot `aligned` posture with a truthful source-grounded `shared_source` state and explicit alignment booleans or counts
- replaced the snapshot row's coarse general-ledger lineage pointer with an activity lineage reference that drills through journal-entry and journal-line lineage
- kept the slice schema-free and additive, preserving the raw-source ingest authority seam and the existing engineering-twin path
- updated `README.md`, `START_HERE.md`, and `docs/ops/local-dev.md` so merged F2D state and active F2E guidance are truthful again

Validation outcome:

- all requested focused finance-twin tests, domain tests, DB tests, finance smokes, engineering-twin regression tests, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm ci:repro:current` completed successfully
- the only fixes required during validation were one unused spec variable, strict-null guards in the activity-lineage assembler, and adding the new finance-twin service methods to existing test harness stubs
