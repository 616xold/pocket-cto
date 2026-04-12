# Add the F2H balance-bridge-prerequisites read model and diagnostic hardening

## Purpose / Big Picture

This plan implements the next narrow **F2H Finance Twin** slice for Pocket CFO.

The user-visible goal is to add one backend-first balance-bridge-prerequisites read model on top of the shipped F2A through F2G work, while fixing the remaining F2G and F2F truthfulness lag now visible on fetched `origin/main`.
Operators should be able to see, at company and account scope, why a numeric balance bridge is still blocked even when matched-period account-bridge readiness exists, which persisted source-backed balance proof is missing, how chart-of-accounts context sharpens blocked-proof diagnostics, and why the route still refuses any direct bridge number or variance claim.

This slice stays intentionally narrow and additive.
It does not add another extractor family, does not redesign sync history, does not widen into wiki, discovery UX, reports, monitoring, controls, connector APIs, AR or AP aging, bank or card feeds, contracts, or any F3 through F6 implementation.

## Progress

- [x] 2026-04-12T12:50:40Z Complete preflight against fetched `origin/main`, confirm the exact branch name, confirm a clean worktree, verify `gh` auth, and verify local Postgres plus object storage availability.
- [x] 2026-04-12T12:50:40Z Read the active repo guidance, roadmap, shipped F2A through F2G Finance Plans, scoped AGENTS files, and required ops docs; inspect the finance-twin, source, route, service, smoke, and test seams before planning.
- [x] 2026-04-12T12:50:40Z Create the active F2H Finance Plan in `plans/FP-0016-balance-bridge-prerequisites-and-diagnostic-hardening.md` before code changes.
- [x] 2026-04-12T14:12:30Z Implement the additive balance-bridge-prerequisites route and assembler using only persisted latest-successful F2 state from raw-source-backed syncs.
- [x] 2026-04-12T14:12:30Z Fix the confirmed diagnostic-versus-limitation mismatch, stale finance-twin limitations copy, and merged-doc truthfulness lag for active F2H guidance.
- [x] 2026-04-12T14:12:30Z Add focused tests plus a packaged balance-bridge-prerequisites smoke, then run the required validation ladder in the requested order and publish only if every required command is green.

## Surprises & Discoveries

The current F2G account-bridge route already avoids fake numeric bridge output, but it still treats matched-period readiness as the highest finance-twin bridge state even though there is no persisted source-backed opening-balance or ending-balance proof in the general-ledger slice yet.

The current persisted F2 shape appears sufficient for a narrow F2H read model without a schema change.
The repo already persists the latest successful chart-of-accounts, trial-balance, general-ledger, sync-run, and lineage state needed to explain blocked proof truthfully, even if the result remains a strict prerequisites or blocked-proof view.

The shared-source alignment message is still being surfaced as a blocking limitation in reconciliation and account-bridge when `sameSourceSnapshot` and `sameSyncRun` are already documented by code as diagnostic-only facts under the per-file upload model.

The current general-ledger extractor captures source-declared period context but does not yet capture explicit source-backed opening-balance or ending-balance proof fields.
F2H should therefore default to truthful missing-proof reporting instead of stretching activity totals into balance proof.

The root active docs are stale after the F2G merge.
`README.md`, `START_HERE.md`, and `docs/ops/local-dev.md` still describe F2G as the active next slice rather than merged baseline plus active F2H work.

## Decision Log

Decision: treat F2H as a backend-first finance-twin read-model and truthfulness slice rather than another extractor or reporting slice.
Rationale: the user explicitly wants a narrow additive prerequisites view and explicit blocked-proof diagnostics on top of shipped persisted state.

Decision: prefer no DB migration.
Rationale: the existing persisted F2 state already appears sufficient to build a truthful prerequisites read model that can say proof is missing rather than inventing it.

Decision: add one dedicated balance-bridge-prerequisites route instead of widening the existing reconciliation or account-bridge routes into a broader overloaded contract.
Rationale: keeping the new proof-gating surface separate makes the stricter truth boundary easier to review and keeps existing routes stable.

Decision: keep `sameSyncRun` and `sameSourceSnapshot` diagnostic-only and move or suppress their wording where it is currently presented as a blocking limitation.
Rationale: under the current per-file upload model those fields are useful facts but not expected positive prerequisites for healthy shared-source finance flows.

Decision: represent missing general-ledger balance proof explicitly at account scope instead of inferring it from activity totals.
Rationale: the user explicitly forbids treating general-ledger activity totals as opening-balance or ending-balance proof.

Decision: keep GitHub connector work explicitly out of scope, and keep the engineering-twin module intact.
Rationale: this slice is about truthful Finance Twin reads and active-doc cleanup, not connector or engineering-twin redesign.

Decision: use `$evidence-bundle-auditor` only for the route-visible diagnostic and limitations-copy changes in this slice.
Rationale: the slice touches operator-visible limitation and proof wording, but it does not add a broader mission-output or artifact compiler path.

## Context and Orientation

Pocket CFO has already shipped F1 raw-source ingest plus F2A trial-balance sync, F2B chart-of-accounts sync, F2C general-ledger sync, F2D snapshot and lineage reads, F2E reconciliation readiness plus activity-lineage drill behavior, F2F reporting-window truth hardening, and F2G matched-period account-bridge readiness.
The repo now has immutable source registration, stored raw-file reads, deterministic CSV extraction for `trial_balance_csv`, `chart_of_accounts_csv`, and `general_ledger_csv`, persisted finance companies and slice state, sync runs with persisted stats, lineage, summary, snapshot, account-catalog, general-ledger, reconciliation, activity-lineage, and account-bridge routes.

The relevant bounded contexts for this slice are:

- `plans/` for the active F2H plan and a tiny merged-status note in `FP-0015` only if strictly necessary
- `packages/domain` for additive balance-bridge-prerequisites contracts and any small supporting diagnostic or blocked-proof structures
- `packages/db` only if implementation proves a real persisted query gap that cannot be solved through the existing latest-successful state
- `apps/control-plane/src/modules/finance-twin/` for the new read-model assembler, service method, route wiring, diagnostic-versus-limitation cleanup, and focused tests
- `apps/control-plane/src/modules/sources/**` only if one tiny metadata helper is strictly required
- `apps/control-plane/src/bootstrap.ts`, `apps/control-plane/src/lib/types.ts`, `apps/control-plane/src/lib/http-errors.ts`, `apps/control-plane/src/app.ts`, and `apps/control-plane/src/test/database.ts` for wiring and regression coverage
- `tools/finance-twin-account-bridge-smoke.mjs`, `tools/finance-twin-period-context-smoke.mjs`, `tools/finance-twin-balance-bridge-prerequisites-smoke.mjs`, and `package.json` for packaged local proof
- `README.md`, `START_HERE.md`, and `docs/ops/local-dev.md` for truthful active guidance

GitHub connector work is out of scope.
The engineering twin remains in place and must keep its reproducibility tests green unchanged.
Replay and evidence behavior should stay unchanged unless this slice needs a tiny note clarifying that persisted finance sync plus lineage state remains the current finance evidence spine for these backend reads.

## Plan of Work

Implement this slice in five bounded passes.

First, extend the finance-twin domain contracts so the repo can name a dedicated balance-bridge-prerequisites view, a stricter prerequisites status block, a small coverage summary, and per-account blocked-proof diagnostics that distinguish trial-balance ending-balance evidence from missing general-ledger opening or ending balance proof.

Second, add one bounded finance-twin assembler for the new view that joins the latest successful chart-of-accounts, trial-balance, and general-ledger state already materialized by the service, computes strict prerequisites gating, and keeps general-ledger balance-proof fields explicit and nullable unless persisted source-backed proof actually exists.

Third, expose the new backend route with thin transport code and a small service method, preserving the existing reconciliation and account-bridge routes and reusing the current latest-successful read state rather than re-querying raw sources or widening into a broad query layer.

Fourth, fix the confirmed truthfulness lag by removing shared-source diagnostic copy from blocking limitations where it is diagnostic-only, hardening stale finance-twin limitations copy, and updating the merged root docs so active guidance now points to F2H.

Fifth, add focused tests plus one packaged local balance-bridge-prerequisites smoke that prove strict prerequisites gating, no-fake-balance-bridge behavior, blocked-proof diagnostics, chart-of-accounts enrichment, and unchanged F1 plus F2A through F2G behavior.

## Concrete Steps

1. Keep `plans/FP-0016-balance-bridge-prerequisites-and-diagnostic-hardening.md` current throughout the slice, updating `Progress`, `Decision Log`, `Surprises & Discoveries`, and `Outcomes & Retrospective` after meaningful milestones.

2. Extend `packages/domain/src/finance-twin.ts` and `packages/domain/src/index.ts` to cover:
   - `FinanceBalanceBridgePrerequisitesView`
   - a strict `balanceBridgePrerequisites` status block with `state`, `reasonCode`, `reasonSummary`, `basis`, `windowRelation`, `sameSource`, `sameSourceSnapshot`, `sameSyncRun`, and `sharedSourceId`
   - a small per-account balance-proof structure that can explicitly say whether trial-balance ending-balance evidence exists and whether source-backed general-ledger opening-balance or ending-balance proof exists or remains missing
   - per-account blocked-reason codes and any small `diagnostics` or `notes` field needed to keep diagnostic-only wording out of blocking limitations

3. Prefer no DB migration.
   Only extend `packages/db/src/schema/finance-twin.ts`, `packages/db/src/schema/index.ts`, and `packages/db/drizzle/**` if implementation proves the current persisted state cannot support truthful account-level blocked-proof reporting.

4. Extend `apps/control-plane/src/modules/finance-twin/` with bounded modules that keep routes thin, likely including:
   - a dedicated `balance-bridge-prerequisites.ts` assembler
   - small service extensions for `getBalanceBridgePrerequisites()`
   - additive schema and route support for `GET /finance-twin/companies/:companyKey/reconciliation/trial-balance-vs-general-ledger/balance-bridge-prerequisites`
   - the smallest required shared helper change if reconciliation and account-bridge limitation handling should reuse one diagnostic-suppression rule

5. Preserve the raw-source authority seam by building the new view only from persisted Finance Twin slice state plus explicit source metadata.
   Do not derive balance proof, diagnostics, or bridge claims from source-ingest receipt previews, sample rows, or filename heuristics.

6. Make balance-bridge prerequisites stricter than F2G account-bridge readiness.
   The preferred prerequisites gate is:
   - successful trial-balance slice exists
   - successful general-ledger slice exists
   - matched-period account-bridge readiness is `matched_period_ready`
   - source-backed general-ledger opening-balance or ending-balance proof exists for the account according to the implemented design
   - no inference from general-ledger activity totals alone

7. Keep `sameSyncRun` and `sameSourceSnapshot` diagnostic-only in the new route and the touched existing routes.
   Preserve them in the contract, but do not require them to be true for positive prerequisites-ready state and do not let their explanatory copy appear as a blocking limitation when no real blocker depends on them.

8. Surface explicit account-level proof posture in the new route at minimum:
   - trial-balance ending-balance evidence present or absent
   - general-ledger opening-balance proof present or absent
   - general-ledger ending-balance proof present or absent
   - matched-period account-bridge readiness present or absent
   - deterministic blocked reason when proof is missing
   - chart-of-accounts enrichment where it truthfully sharpens missing, inactive, or overlap diagnostics

9. Verify the current general-ledger period-context resolver remains explicit and tested for ambiguous source-declared metadata.
   If this slice touches it, keep ambiguity explicit and do not silently collapse conflicting or incomplete source-declared fields.

10. Update the stale active docs and route-visible limitations copy in:
    - `README.md`
    - `START_HERE.md`
    - `docs/ops/local-dev.md`
    - `apps/control-plane/src/modules/finance-twin/summary.ts`
    - `plans/FP-0015-account-bridge-readiness-and-f2f-polish.md` only if a tiny merged-status note is strictly necessary

11. Add or update focused tests covering:
    - domain schema parsing for the new balance-bridge-prerequisites contracts
    - service-level prerequisites gating and blocked-proof behavior
    - explicit no-fake-balance-bridge and no-fake-variance behavior
    - account-level missing-proof and overlap diagnostics
    - chart-of-accounts enrichment for missing and inactive diagnostics
    - diagnostic-versus-limitation truthfulness behavior
    - general-ledger period-context ambiguity behavior if touched
    - route-level contract behavior in `src/app.spec.ts`

12. Add `tools/finance-twin-balance-bridge-prerequisites-smoke.mjs` and wire the root script in `package.json`.
    Update existing smokes only where truthfulness wording or the new route requires it.
    The packaged proof should show that:
    - finance reads still depend on persisted state from raw-source-backed syncs
    - the new route refuses any numeric balance bridge or variance
    - matched-period account overlap can exist while balance proof still remains blocked
    - per-account proof gaps and blocked reasons are explicit and reviewable

13. Run validation in this exact order:

```bash
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/finance-twin/service.spec.ts src/app.spec.ts src/modules/finance-twin/general-ledger-csv.spec.ts
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
pnpm run smoke:finance-twin-balance-bridge-prerequisites:local
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

14. If and only if every required validation command is green, create exactly one local commit:

```bash
git commit -m "feat: add finance twin balance bridge prerequisites"
```

15. If fully green and edits were made, confirm the branch remains `codex/f2h-balance-bridge-prerequisites-and-diagnostic-hardening-local-v1`, show `git branch --show-current`, `git log --oneline -3`, and `git status --short --untracked-files=all`, push that exact branch, verify the remote head, and create or report the PR into `main` with the requested title and body.

## Validation and Acceptance

Required validation order:

```bash
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/finance-twin/service.spec.ts src/app.spec.ts src/modules/finance-twin/general-ledger-csv.spec.ts
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
pnpm run smoke:finance-twin-balance-bridge-prerequisites:local
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Acceptance is met when all of the following are true:

- a new route-backed balance-bridge-prerequisites view exists for one company
- the new view is built only from persisted Finance Twin state associated with the latest successful implemented slices
- the route does not compute a direct balance variance or any fake numeric bridge
- the route explains, at account scope, whether trial-balance ending-balance evidence exists and whether source-backed general-ledger opening-balance or ending-balance proof exists or remains missing
- positive prerequisites-ready state only appears when matched-period account-bridge readiness exists and explicit source-backed balance proof is present
- `sameSyncRun` and `sameSourceSnapshot` remain diagnostic-only and are not used as required positive prerequisites
- shared-source diagnostic wording is no longer presented as a blocking limitation where the code itself treats those fields as diagnostic-only
- summary, snapshot, period-context, reconciliation, and account-bridge semantics remain explicit and understandable after the slice
- F1 source-ingest behavior still works
- F2A trial-balance behavior still works
- F2B chart-of-accounts and account-catalog behavior still works
- F2C general-ledger behavior still works
- F2D snapshot and lineage behavior still works
- F2E reconciliation and activity-lineage behavior still works except for any intentional truthfulness correction
- F2F period-context behavior still works except for any intentional truthfulness correction
- F2G account-bridge behavior still works except for any intentional truthfulness correction
- engineering-twin reproducibility tests still pass unchanged
- `README.md`, `START_HERE.md`, and `docs/ops/local-dev.md` describe merged F2G state and active F2H guidance truthfully

Provenance, freshness, replay, and limitation posture:
this slice must keep raw sources immutable, keep source lineage queryable, surface missing, stale, mixed, ambiguous, or blocked-proof conditions plainly, and avoid implying that trial-balance ending balances, general-ledger activity totals, and source-declared periods are interchangeable.
No new CFO Wiki, report, approval, mission-output, monitoring, or connector behavior is in scope here.

## Idempotence and Recovery

This slice is additive-first and safe to retry when followed carefully.

- Re-running targeted tests, smokes, and sync operations should be safe because the test DB reset truncates finance-twin state between cases.
- Re-running a finance sync for the same uploaded source should update derived slice state deterministically without mutating the raw source bytes.
- If the new blocked-proof contract proves too broad, revert the uncommitted balance-bridge-prerequisites files, keep the plan updates, and rerun the focused finance validations before expanding to the full ladder.
- If validation fails outside this slice or outside the known narrow engineering-twin reproducibility surface, stop and report the blocker instead of widening scope.

## Artifacts and Notes

Expected artifacts from this slice:

- one active F2H Finance Plan
- additive balance-bridge-prerequisites contracts in `packages/domain`
- one additive finance-twin route plus assembler in `apps/control-plane/src/modules/finance-twin/`
- focused tests for service, route, domain, and general-ledger period-context truthfulness where touched
- one packaged local balance-bridge-prerequisites smoke
- truthful updates to the affected root docs and finance-twin limitations copy

Replay and evidence note:
this slice continues to rely on persisted finance sync runs and lineage as the evidence spine for backend reads, but it does not add new replay events, evidence bundles, CFO Wiki compilation, or report-generation behavior.

Freshness and limitation note:
the new route must expose freshness, comparability, blocked-proof diagnostics, and limitations in a way that stops at prerequisites and diagnostics whenever persisted source-backed balance proof is missing.

## Interfaces and Dependencies

Package and runtime boundaries:

- `@pocket-cto/domain` remains the source of truth for additive balance-bridge-prerequisites contracts
- `@pocket-cto/db` remains limited to schema and DB helpers, and is expected to stay unchanged unless a real persisted query gap appears
- `apps/control-plane` owns the new read-model assembler, service orchestration, route transport, and the diagnostic-versus-limitation hardening
- the new route should reuse the existing latest-successful read state, period-context seam, and activity-lineage seam instead of re-querying raw source or adding a broad query API

Configuration expectations:
no new environment variables are expected for this slice.

Upstream and downstream dependencies:

- upstream source authority remains `apps/control-plane/src/modules/sources/**` plus immutable stored source files
- downstream packaged proofs include the existing source-ingest and finance-twin smokes plus the new balance-bridge-prerequisites smoke
- GitHub connector and engineering-twin modules remain outside the active operator path and must not be deleted in this slice

## Outcomes & Retrospective

F2H shipped as a backend-first additive read-model slice with no schema migration.
The new route, `GET /finance-twin/companies/:companyKey/reconciliation/trial-balance-vs-general-ledger/balance-bridge-prerequisites`, now explains why a numeric bridge is still blocked even when matched-period account-bridge readiness exists, and it stays explicit that persisted general-ledger activity totals do not count as opening-balance or ending-balance proof.

The slice also hardens truthfulness in the existing finance-twin reads.
Shared-source `sameSourceSnapshot` and `sameSyncRun` messaging now remains available as diagnostics instead of being presented as blocking limitations in reconciliation and account-bridge, and the finance-twin limitations copy and root active docs now reflect merged F2G state plus active F2H guidance truthfully.

Validation outcome:

- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/finance-twin/service.spec.ts src/app.spec.ts src/modules/finance-twin/general-ledger-csv.spec.ts`
- `pnpm --filter @pocket-cto/domain exec vitest run src/finance-twin.spec.ts`
- `pnpm --filter @pocket-cto/db exec vitest run src/schema.spec.ts`
- `pnpm smoke:source-ingest:local`
- `pnpm smoke:finance-twin:local`
- `pnpm smoke:finance-twin-account-catalog:local`
- `pnpm smoke:finance-twin-general-ledger:local`
- `pnpm smoke:finance-twin-snapshot:local`
- `pnpm smoke:finance-twin-reconciliation:local`
- `pnpm smoke:finance-twin-period-context:local`
- `pnpm smoke:finance-twin-account-bridge:local`
- `pnpm smoke:finance-twin-balance-bridge-prerequisites:local`
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm ci:repro:current`

No F3 through F6 work was started, no new extractor family was added, F1 raw-source authority remained intact, and the engineering-twin reproducibility surface stayed green unchanged.
