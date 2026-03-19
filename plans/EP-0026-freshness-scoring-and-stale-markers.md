# EP-0026 - Compute twin freshness scoring and expose stale markers for existing repository slices

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture

After this slice, Pocket CTO can answer a direct operator question that it cannot answer today: "How fresh is the stored twin for this repository, and which slices are stale, missing, or failed?"
Operators will be able to call one dedicated repository freshness route and see deterministic freshness state for metadata, ownership, workflows, test suites, docs, and runbooks, plus a conservative repository rollup.
The existing stored summary surfaces will also stop hiding stale or missing data by exposing one concise freshness block where it materially helps.

This plan covers roadmap submilestone `M3.6 freshness scoring and stale markers`.
It intentionally stops before blast-radius answering, docs indexing redesign, CI parsing redesign, new extraction passes, or broader twin schema changes.

## Progress

- [x] (2026-03-19T22:44:23Z) Read the required repo instructions, roadmap, M3.2 through M3.5 ExecPlans, the named skills, the requested twin source files, and ran the required inspections `rg -n "latestRun|SyncRun|observedAt|staleAfter|fresh|freshness|stale|no_codeowners_file|not_synced|workflowState|testSuiteState|docsState|runbookState|ownershipState" apps packages docs plans`, `git status --short`, and `git diff --name-only HEAD`.
- [x] (2026-03-19T22:44:23Z) Captured the required in-thread `M3.6 freshness gap` note, confirming that the twin already persists deterministic per-slice sync runs and stored read models, but still lacks explicit freshness state, stale thresholds, failed-run visibility, and a repository rollup.
- [x] (2026-03-19T22:44:23Z) Created EP-0026 before coding so the freshness policy, route surface, validation matrix, and evidence expectations stay explicit and resumable.
- [x] (2026-03-19T23:04:11Z) Implemented additive freshness contracts plus a dedicated `GET /twin/repositories/:owner/:repo/freshness` route, added a small `freshness.ts` policy module, threaded freshness through `TwinService`, and attached one concise freshness block to the existing summary, ownership, CI, docs, and runbooks surfaces without widening twin persistence.
- [x] (2026-03-19T23:04:11Z) Added focused freshness tests for explicit never-synced slices, deterministic fresh-to-stale transitions, latest-failed-run visibility, conservative rollup behavior, and freshness blocks on the existing summary routes.
- [x] (2026-03-19T23:04:11Z) Updated `docs/ops/local-dev.md`, passed the full required validation matrix, and fetched a live freshness read from already-persisted twin state for the installed repo after confirming the GitHub App env was present locally.

## Surprises & Discoveries

- Observation: every required M3.6 input already exists in persisted twin state.
  Evidence: `twin_sync_runs` already records extractor, status, started or completed times, stats, and error summaries, while each current twin read surface already derives explicit success or empty-snapshot state such as `no_codeowners_file`, `no_workflow_files`, `no_docs`, `no_runbooks`, and `no_test_suites`.

- Observation: the existing summary routes intentionally stop short of freshness, so M3.6 should reuse their state derivation instead of inventing a second interpretation layer.
  Evidence: `apps/control-plane/src/modules/twin/service.ts` already has private read-snapshot helpers for ownership, workflows, test suites, docs, and runbooks, but no shared freshness assessment or repository rollup method.

- Observation: M3.6 can stay additive-first and likely avoid schema changes.
  Evidence: the prompt explicitly prefers read-model and route changes over new persistence, and the existing twin tables plus sync-run stats already provide the needed age, status, and empty-snapshot signals.

- Observation: the live GitHub App installation available in this workspace only exposes `616xold/pocket-cto`, while the local checkout resolves to `616xold/pocket-cto-starter`.
  Evidence: `POST /github/repositories/sync` followed by `GET /github/repositories` returned exactly `616xold/pocket-cto`, and source-backed M3.6 smoke attempts against `616xold/pocket-cto` failed with `twin_source_unavailable` plus `actualRepoFullName = 616xold/pocket-cto-starter`.

- Observation: the repo still had durable twin state for the installed live repo even though the current checkout could not safely resync it.
  Evidence: `GET /twin/repositories/616xold/pocket-cto/freshness` returned stored slice assessments, including one failed metadata slice, one stale ownership slice, and four fresh slices.

## Decision Log

- Decision: compute freshness from existing sync runs plus existing stored slice state instead of adding new tables or forcing new extraction passes.
  Rationale: the prompt requires deterministic answers from already-persisted truth and explicitly says not to widen extraction slices or require rescans just to answer freshness.
  Date/Author: 2026-03-19 / Codex

- Decision: use latest successful completed run age as the primary staleness signal, but make the latest failed run win visibly for slice state.
  Rationale: the prompt requires latest successful age as the primary freshness signal and also requires failed latest runs to be explicit, so the freshness model must keep both facts visible instead of collapsing them.
  Date/Author: 2026-03-19 / Codex

- Decision: keep successful-but-empty slices visible through reason codes rather than inventing separate empty-content freshness states.
  Rationale: existing operator-facing states such as `no_codeowners_file`, `no_docs`, and `no_workflow_files` are already truthful read-model outcomes. Reusing them as freshness reasons keeps the state model small while still surfacing missing data honestly.
  Date/Author: 2026-03-19 / Codex

- Decision: keep the repository rollup conservative and deterministic.
  Rationale: M3.7 blast-radius work should not start from an optimistic freshness posture. Any failed, stale, or never-synced slice must keep the rollup visibly below "fresh".
  Date/Author: 2026-03-19 / Codex

- Decision: use the four-state model `never_synced`, `fresh`, `stale`, and `failed`, and do not add a separate `unavailable` state in M3.6.
  Rationale: all required M3.6 truth can already be expressed from persisted run history plus stored slice state. Missing content stays visible through reason codes such as `no_codeowners_file` or `no_docs`, while transport or source-resolution failures remain route errors rather than persisted slice states.
  Date/Author: 2026-03-19 / Codex

- Decision: set fixed conservative stale windows per slice to `metadata = 21600`, `ownership = 43200`, `workflows = 43200`, `testSuites = 43200`, `docs = 86400`, and `runbooks = 86400` seconds.
  Rationale: repository metadata changes fastest and operator trust falls quickly when it is stale, ownership and CI structure should refresh at least twice daily, and docs or runbooks can tolerate a one-day window without hiding staleness.
  Date/Author: 2026-03-19 / Codex

- Decision: use per-slice score mapping `fresh = 100`, `stale = 50`, `never_synced = 0`, and `failed = 0`, and compute rollup score as the minimum slice score.
  Rationale: the prompt asked for a conservative deterministic rollup where any failed or never-synced critical slice is visibly blocking. The minimum score rule keeps that behavior explicit and easy to test.
  Date/Author: 2026-03-19 / Codex

- Decision: choose rollup precedence `failed > never_synced > stale > fresh` and mark every non-fresh slice as a blocking slice.
  Rationale: the operator should immediately see the most severe freshness problem first, while still keeping all non-fresh slices visible for follow-up.
  Date/Author: 2026-03-19 / Codex

- Decision: do not add replay events for this slice.
  Rationale: freshness scoring changes twin read models and operator visibility, not mission or task lifecycle state. The durable evidence surface for M3.6 is the stored sync-run history, the new freshness route, the updated summary surfaces, and validation proof.
  Date/Author: 2026-03-19 / Codex

## Context and Orientation

Pocket CTO exits M3.5 with a repo-scoped twin bounded context under `apps/control-plane/src/modules/twin/` that already owns:

- registry-backed repository targeting through the GitHub App repository registry
- truthful local source resolution for scan-based slices
- repo-scoped sync-run lifecycle persistence
- idempotent twin entity and edge persistence
- stored metadata, ownership, workflow, test-suite, docs, and runbook views

Today each slice can answer whether the latest successful snapshot contains data, but the system still cannot answer whether that snapshot is fresh enough to trust.
This is the exact gap M3.6 must close.

The key current files are:

- `apps/control-plane/src/modules/twin/service.ts` for stored snapshot derivation and public service methods
- `apps/control-plane/src/modules/twin/routes.ts` for thin HTTP transport
- `apps/control-plane/src/modules/twin/formatter.ts`
- `apps/control-plane/src/modules/twin/ownership-summary-formatter.ts`
- `apps/control-plane/src/modules/twin/test-suite-formatter.ts`
- `apps/control-plane/src/modules/twin/docs-formatter.ts`
- `apps/control-plane/src/modules/twin/runbook-formatter.ts`
- `apps/control-plane/src/modules/twin/repository.ts`
- `apps/control-plane/src/modules/twin/drizzle-repository.ts`
- `apps/control-plane/src/lib/types.ts`
- `packages/domain/src/twin.ts`
- `docs/ops/local-dev.md`

The expected M3.6 edit surface is:

- `plans/EP-0026-freshness-scoring-and-stale-markers.md`
- `packages/domain/src/twin.ts`
- `apps/control-plane/src/lib/types.ts`
- `apps/control-plane/src/modules/twin/schema.ts`
- `apps/control-plane/src/modules/twin/routes.ts`
- `apps/control-plane/src/modules/twin/service.ts`
- `apps/control-plane/src/modules/twin/formatter.ts`
- `apps/control-plane/src/modules/twin/ownership-summary-formatter.ts`
- `apps/control-plane/src/modules/twin/test-suite-formatter.ts`
- `apps/control-plane/src/modules/twin/docs-formatter.ts`
- `apps/control-plane/src/modules/twin/runbook-formatter.ts`
- `apps/control-plane/src/modules/twin/freshness.ts`
- focused twin freshness specs and any required test-double updates in `bootstrap.spec.ts` or orchestrator specs
- `docs/ops/local-dev.md`

No new environment variables are expected.
No new GitHub App permissions or webhook subscriptions are expected.
`WORKFLOW.md` should remain accurate without edits because this slice stays additive and route-driven.

## Plan of Work

First, add shared freshness contracts in `packages/domain/src/twin.ts`.
Those contracts should define the freshness state model, route response schema for the dedicated repository freshness surface, concise freshness blocks for existing summary routes, and the slice names that M3.6 scores.
The state model should stay small and explicit.

Next, add a small twin freshness module under `apps/control-plane/src/modules/twin/`.
That module should:

- hold the explicit stale-after policy for each scored slice
- compute per-slice freshness from the latest run, latest successful run, current time, and existing stored slice state
- keep failed latest runs explicit
- keep successful-but-empty snapshots explicit through reason codes
- build a conservative repository rollup over the six scored slices

Then, thread that logic through `TwinService`.
Add `getRepositoryFreshness(repoFullName)` as the dedicated read path.
Reuse the existing read-snapshot helpers rather than rescanning the repo or widening persistence.
Where needed, enrich those helpers so they return the latest successful run in addition to the current route state.

After the dedicated route works, add one concise freshness block to the existing read surfaces where it materially helps:

- `GET /twin/repositories/:owner/:repo/summary`
- `GET /twin/repositories/:owner/:repo/ownership-summary`
- `GET /twin/repositories/:owner/:repo/ci-summary`
- `GET /twin/repositories/:owner/:repo/docs`
- `GET /twin/repositories/:owner/:repo/runbooks`

Finally, add focused tests, update `docs/ops/local-dev.md` with the new route and state meanings, keep this ExecPlan current, run the full validation matrix, and, if GitHub env is available, collect one real freshness read from stored twin state.

## Concrete Steps

Run these commands from the repository root as needed:

    rg -n "latestRun|SyncRun|observedAt|staleAfter|fresh|freshness|stale|no_codeowners_file|not_synced|workflowState|testSuiteState|docsState|runbookState|ownershipState" apps packages docs plans
    git status --short
    git diff --name-only HEAD
    pnpm db:generate
    pnpm db:migrate
    pnpm run db:migrate:ci
    pnpm repo:hygiene
    pnpm lint
    pnpm typecheck
    pnpm build
    pnpm test
    pnpm ci:repro:current

Useful narrow commands during implementation:

    pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/freshness.spec.ts src/modules/twin/service.spec.ts src/modules/twin/routes.spec.ts src/modules/twin/docs-routes.spec.ts src/modules/twin/runbook-routes.spec.ts src/modules/twin/test-suite-routes.spec.ts
    rg -n "freshness|stale|latestRun|latestWorkflowRun|latestTestSuiteRun|ownershipState|workflowState|testSuiteState|docsState|runbookState" apps/control-plane/src/modules/twin packages/domain/src docs/ops/local-dev.md

If live GitHub env is present after implementation:

    curl -X POST http://localhost:4000/github/installations/sync
    curl -X POST http://localhost:4000/github/repositories/sync
    curl http://localhost:4000/twin/repositories/616xold/pocket-cto/freshness

If no recent real twin state exists, first reuse the existing checked-in sync routes and smoke helpers for metadata, ownership, CI, docs, and runbooks so freshness reads from actual stored snapshots instead of empty state.
Record only the repository rollup, per-slice states, reason codes, ages, stale-after values, and safe run identifiers.
Do not print secrets or raw auth headers.

## Validation and Acceptance

Success for M3.6 is demonstrated when all of the following are true:

1. `GET /twin/repositories/:owner/:repo/freshness` returns one deterministic freshness assessment for each of these slices: `metadata`, `ownership`, `workflows`, `test_suites`, `docs`, and `runbooks`.
2. Each slice freshness result includes at least `state`, `latestRunId`, `latestRunStatus`, `latestCompletedAt`, `ageSeconds` when available, `staleAfterSeconds`, and `reasonCode` or `reasonSummary`.
3. Never-synced slices are explicit instead of implied by empty route payloads.
4. A latest failed run is explicit even when an older successful run exists.
5. Latest successful run age crosses from fresh to stale deterministically against explicit thresholds.
6. Successful-but-empty snapshots stay visible through explicit reasons such as `no_codeowners_file`, `no_workflow_files`, `no_test_suites`, `no_docs`, or `no_runbooks`.
7. The repository freshness rollup is conservative and deterministic across all six scored slices.
8. Existing summary surfaces that materially help operators now expose one concise freshness block without duplicating the full dedicated freshness payload.
9. Focused tests prove the never-synced state, the fresh-to-stale threshold transition, the failed-latest-run case, conservative rollup behavior, and freshness visibility on existing summary routes.
10. `docs/ops/local-dev.md` documents the freshness route and the chosen state meanings honestly.
11. The full validation matrix plus `pnpm ci:repro:current` passes after the slice lands.

Human acceptance after implementation should look like:

    curl -i http://localhost:4000/twin/repositories/OWNER/REPO/freshness
    curl -i http://localhost:4000/twin/repositories/OWNER/REPO/summary
    curl -i http://localhost:4000/twin/repositories/OWNER/REPO/ownership-summary
    curl -i http://localhost:4000/twin/repositories/OWNER/REPO/ci-summary
    curl -i http://localhost:4000/twin/repositories/OWNER/REPO/docs
    curl -i http://localhost:4000/twin/repositories/OWNER/REPO/runbooks

The dedicated freshness route should show a repository rollup plus per-slice assessments.
The summary routes should each expose one concise freshness block that makes stale, failed, or missing data visible without requiring the operator to inspect raw runs.

## Idempotence and Recovery

This slice is read-model and route oriented, so it should be safe to retry.
Freshness answers must always derive from already-persisted twin state and the current clock; no destructive persistence or cleanup pass is needed.

If a formatter or service change fails validation, revert the new freshness module, route wiring, domain contracts, docs, tests, and this ExecPlan together.
Existing twin rows should be left intact because M3.6 does not depend on destructive schema changes or row rewrites.
If implementation unexpectedly proves a schema change is required, stop, record the blocker here, and land it only through the repo migration workflow with additive-first rollback guidance.

## Artifacts and Notes

Required pre-coding gap note captured in-thread:

1. The twin already persists deterministic sync runs and stored summaries for metadata, ownership, workflows, test suites, docs, and runbooks.
2. What is missing is explicit freshness truth: age-based stale interpretation, failed-latest-run visibility, never-synced visibility, and a conservative repository rollup.
3. Planned edits are constrained to the new ExecPlan, shared domain contracts, twin service or route or formatter seams, focused tests, and local-dev docs.
4. The chosen strategy is run-history plus existing stored-state interpretation, fixed conservative stale thresholds, one dedicated freshness route, and one concise freshness block on the summary surfaces that most need it.

Validation results, exact changed files, and live freshness output will be appended here as work proceeds.

Replay and evidence implications:

- no new mission replay events are expected because this slice does not change mission or task lifecycle behavior
- the durable evidence surface is the existing sync-run history plus the new freshness route and updated summary surfaces
- final closeout must still state objective, change summary, validation evidence, risks, rollback guidance, and whether M3.7 can now start cleanly

## Interfaces and Dependencies

Important existing interfaces and modules for this slice:

- `TwinService` and `TwinServicePort`
- twin read-model formatters under `apps/control-plane/src/modules/twin/`
- shared twin contracts in `packages/domain/src/twin.ts`
- current sync-run persistence in `apps/control-plane/src/modules/twin/repository.ts` and `drizzle-repository.ts`
- current route transport in `apps/control-plane/src/modules/twin/routes.ts`
- app wiring and test doubles in `apps/control-plane/src/bootstrap.ts`, `bootstrap.spec.ts`, and `apps/control-plane/src/modules/orchestrator/drizzle-service.spec.ts`

New or expanded interfaces expected by the end of this slice:

- a shared freshness state contract
- a dedicated repository freshness route response contract
- concise freshness-block contracts for summary routes
- `TwinService.getRepositoryFreshness(...)`
- one new twin freshness helper module for policy plus deterministic scoring

No new environment variables are expected.
No new GitHub App permissions or webhook subscriptions are expected.

## Outcomes & Retrospective

M3.6 landed as an additive read-model slice with no schema change.
Freshness now derives only from persisted `twin_sync_runs` plus the existing stored twin slice state, and operators can read that truth through one dedicated route plus concise summary freshness blocks on the existing twin surfaces.

Chosen freshness state model:

- `never_synced`: no successful run exists yet for the slice
- `fresh`: latest successful run age is within the slice freshness window
- `stale`: latest successful run exists but is older than the slice freshness window
- `failed`: the latest run failed, even if an older successful snapshot still exists

Chosen stale-after policy:

- `metadata`: `21600` seconds
- `ownership`: `43200` seconds
- `workflows`: `43200` seconds
- `testSuites`: `43200` seconds
- `docs`: `86400` seconds
- `runbooks`: `86400` seconds

Chosen scoring and rollup rules:

- Per-slice state comes from latest run plus latest successful run.
- No latest run or no successful run yet yields `never_synced`.
- Latest failed run yields `failed` and still carries the last successful completion time and age when available.
- Otherwise latest successful age `>` stale window yields `stale`; age within the window yields `fresh`.
- Successful-but-empty snapshots stay in the same four-state model and surface explicit reason codes such as `no_codeowners_file`, `no_workflow_files`, `no_test_suites`, `no_docs`, and `no_runbooks`.
- Per-slice scores are `fresh = 100`, `stale = 50`, `never_synced = 0`, `failed = 0`.
- Repository rollup precedence is `failed > never_synced > stale > fresh`.
- Repository rollup score is the minimum slice score, and every non-fresh slice is included in `blockingSlices`.

Exact changed files for this milestone slice:

- `plans/EP-0026-freshness-scoring-and-stale-markers.md`
- `packages/domain/src/twin.ts`
- `apps/control-plane/src/lib/types.ts`
- `apps/control-plane/src/modules/twin/schema.ts`
- `apps/control-plane/src/modules/twin/routes.ts`
- `apps/control-plane/src/modules/twin/service.ts`
- `apps/control-plane/src/modules/twin/formatter.ts`
- `apps/control-plane/src/modules/twin/ownership-summary-formatter.ts`
- `apps/control-plane/src/modules/twin/test-suite-formatter.ts`
- `apps/control-plane/src/modules/twin/docs-formatter.ts`
- `apps/control-plane/src/modules/twin/runbook-formatter.ts`
- `apps/control-plane/src/modules/twin/metadata-sync.ts`
- `apps/control-plane/src/modules/twin/freshness.ts`
- `apps/control-plane/src/modules/twin/freshness.spec.ts`
- `apps/control-plane/src/modules/twin/routes.spec.ts`
- `apps/control-plane/src/modules/twin/docs-routes.spec.ts`
- `apps/control-plane/src/modules/twin/runbook-routes.spec.ts`
- `apps/control-plane/src/modules/twin/test-suite-routes.spec.ts`
- `apps/control-plane/src/bootstrap.spec.ts`
- `apps/control-plane/src/modules/orchestrator/drizzle-service.spec.ts`
- `docs/ops/local-dev.md`

Validation results:

- `pnpm db:generate` passed with no schema changes to generate
- `pnpm db:migrate` passed
- `pnpm run db:migrate:ci` passed
- `pnpm repo:hygiene` passed
- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm build` passed
- `pnpm test` passed
- `pnpm ci:repro:current` passed, including clean-tree verification in a temporary worktree

Live evidence:

- GitHub App env was present in the local `.env`; no secrets were printed.
- The synced live installation exposed `616xold/pocket-cto`, not `616xold/pocket-cto-starter`.
- Because the local checkout resolves to `616xold/pocket-cto-starter`, source-backed live resync for `616xold/pocket-cto` would have been dishonest and correctly failed with `twin_source_unavailable`.
- Reusing already-persisted twin state, `GET /twin/repositories/616xold/pocket-cto/freshness` returned:
  - rollup: `failed`, score `0`, reason `rollup_failed`, blocking slices `metadata`, `ownership`
  - metadata: `failed`, latest run `failed`, age `2727`, stale-after `21600`, reason `latest_run_failed`
  - ownership: `stale`, latest run `succeeded`, age `77363`, stale-after `43200`, reason `no_codeowners_file`
  - workflows: `fresh`, latest run `succeeded`, age `2727`, stale-after `43200`
  - testSuites: `fresh`, latest run `succeeded`, age `2727`, stale-after `43200`
  - docs: `fresh`, latest run `succeeded`, age `1744`, stale-after `86400`
  - runbooks: `fresh`, latest run `succeeded`, age `1744`, stale-after `86400`

Risks and rollback:

- Freshness windows are intentionally conservative and hard-coded in M3.6, so future tuning may still be needed once operator behavior is observed.
- The live proof in this session reused existing stored state because the installed repo and local checkout did not match; that is honest evidence for route behavior, but not a fresh end-to-end extraction run.
- Rollback is straightforward: remove the new freshness contracts, helper module, route wiring, formatter additions, summary freshness blocks, tests, docs, and this ExecPlan update together. No schema rollback is required.

M3.7 can now start cleanly.
The twin can expose stale or failed repository slices explicitly, and blast-radius work can build on deterministic freshness truth instead of implicit empty-state guesses.
