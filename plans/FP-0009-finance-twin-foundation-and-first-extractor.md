# Start the F2A finance twin foundation with one raw-byte trial-balance extractor

## Purpose / Big Picture

This plan implements the first real **F2A Finance Twin** slice for Pocket CFO.

The user-visible goal is to move from F1 source registry and raw ingest into an actual persisted finance-twin path that can read one uploaded finance source from immutable storage, deterministically extract structured finance state, preserve explicit source lineage, expose a truthful freshness posture, and return a backend summary view.

This slice is intentionally narrow.
It starts Finance Twin persistence and sync behavior, but it does not begin CFO Wiki compilation, finance discovery-answer UX, memo/report compilation, monitoring, approvals expansion, close/control flows, connector APIs, or any package-scope rename.

## Progress

- [x] 2026-04-09T22:44:56Z Complete preflight against fetched `origin/main`, confirm the exact branch name, confirm a clean worktree, verify `gh` auth, and verify local Postgres plus object storage availability.
- [x] 2026-04-09T22:44:56Z Read the active repo guidance, roadmap, F0/F1 Finance Plans, scoped AGENTS files, and source-ingest ops guidance; inspect the current source-registry, raw-ingest, twin, bootstrap, app, and test seams before planning.
- [x] 2026-04-09T22:44:56Z Implement additive finance-twin contracts, schema, migration, control-plane module, and local smoke for the first real finance extractor family.
- [x] 2026-04-10T00:07:56Z Run the required validation ladder, fix only in-scope failures, and confirm the full slice is green through `pnpm ci:repro:current`.
- [x] 2026-04-10T12:45:19Z F2A is now shipped on fetched `origin/main`, so the earlier branch-local publish placeholder is no longer active work in this plan.

## Surprises & Discoveries

- Observation: F1 ingest receipts are intentionally summary-level and are not sufficient as the source of truth for Finance Twin extraction.
  Evidence: the current CSV ingest parser stores compact `sampleRows` receipt summaries, while the user explicitly forbids building the finance twin from shallow receipt summaries rather than the stored raw bytes.

- Observation: F1 already provides the truthful lower-level seams this slice needs.
  Evidence: `SourceRegistryService` persists immutable `source_files`, `source_snapshots`, `provenance_records`, and `source_ingest_runs`, while `SourceFileStorage` already supports both object-store writes and raw-byte reads.

- Observation: the existing engineering twin has useful sync-run and freshness patterns, but its persisted scope is repo-centric and should not be mutated into finance semantics for F2A.
  Evidence: `packages/domain/src/twin.ts`, `packages/db/src/schema/twin.ts`, and `apps/control-plane/src/modules/twin/**` all anchor on `repoFullName`, repository routes, and engineering slice names.

## Decision Log

- Decision: create a new additive `finance-twin` bounded context instead of widening or mutating the engineering twin module.
  Rationale: the user explicitly prefers additive finance-twin code, and the existing twin tables and routes remain repo-centric.

- Decision: use one persisted `companyKey` as the explicit single-company v1 scope, with the smallest truthful company record rather than a broader company-admin subsystem.
  Rationale: F2A needs a stable persisted scope key, but not a larger operator-management system.

- Decision: ship the first extractor family as raw-byte `trial_balance_csv`.
  Rationale: this is the narrowest real finance source family that can populate company, reporting period, ledger account, trial-balance line, lineage, and freshness in one slice without widening into PDFs, XLSX, or broader accounting surfaces.

- Decision: compute finance freshness from persisted finance sync runs and summary coverage rather than inventing a separate background freshness writer in F2A.
  Rationale: persisted sync runs are enough to surface truthful `fresh`, `stale`, `failed`, or `missing` posture for the implemented trial-balance slice.

- Decision: make source-to-entity lineage first-class through a dedicated finance lineage table rather than burying provenance in JSON payloads.
  Rationale: the user explicitly requires queryable lineage at least through source snapshot and file boundaries.

- Decision: GitHub connector work is explicitly out of scope.
  Rationale: this slice starts Finance Twin behavior on top of F1 file-first ingest and must not promote GitHub back into the product center.

## Context and Orientation

Pocket CFO has completed F1 source registry, immutable raw-file ingest, deterministic parser dispatch, operator source inventory, and packaged source smokes.
The repo now has the raw evidence spine needed for F2A, but it does not yet persist finance-specific twin state.

The relevant bounded contexts for this slice are:

- `packages/domain` for finance-twin contracts and summary schemas
- `packages/db` for additive finance-twin tables and the forward-only migration
- `apps/control-plane/src/modules/finance-twin/` for extractor selection, raw-byte CSV parsing, persistence orchestration, freshness rollup, and routes
- `apps/control-plane/src/bootstrap.ts`, `apps/control-plane/src/lib/types.ts`, and `apps/control-plane/src/app.ts` for container and route wiring
- `apps/control-plane/src/test/database.ts` for DB reset coverage
- `tools/finance-twin-smoke.mjs` and root `package.json` for the packaged local proof

GitHub connector work is out of scope.
The engineering twin module remains in place and must keep passing its reproducibility tests unchanged.
No active-doc boundary change is intended beyond keeping this Finance Plan current unless implementation exposes a direct conflict.

## Plan of Work

Implement this slice in four bounded passes.

First, add pure finance-twin contracts for companies, reporting periods, ledger accounts, trial-balance lines, finance sync runs, finance freshness, finance lineage, and the summary view.
Second, add additive finance-twin schema and a forward-only migration with explicit company scope plus lineage links back to source, snapshot, and source-file IDs.
Third, add a dedicated `apps/control-plane/src/modules/finance-twin/` module that reads the raw CSV bytes through the existing source-storage seam, selects the first extractor family deterministically, persists finance state transactionally, and exposes sync plus summary routes.
Fourth, add focused tests and a local smoke that prove one uploaded trial-balance CSV can create finance-twin state end to end without breaking the finished F1 path or the existing engineering twin guard rails.

Keep routes thin, keep CSV parsing and mapping logic inside the finance-twin module, and keep cross-module dependencies explicit and minimal.

## Concrete Steps

1. Create and maintain `plans/FP-0009-finance-twin-foundation-and-first-extractor.md` as the active F2A Finance Plan.

2. Add additive finance-twin contracts under `packages/domain/src/finance-twin.ts` and export them from `packages/domain/src/index.ts`.
   The initial contract should include:
   - company and reporting-period records
   - ledger-account and trial-balance-line records
   - finance sync-run records and extractor keys
   - finance lineage records that link back to source, snapshot, and source-file IDs
   - finance freshness summary and summary-route response shapes
   - sync input for a source file plus explicit `companyKey`

3. Add additive DB schema under `packages/db/src/schema/finance-twin.ts` and export it from `packages/db/src/schema/index.ts`.
   Model the smallest truthful persisted shape for:
   - `finance_companies`
   - `finance_reporting_periods`
   - `finance_ledger_accounts`
   - `finance_trial_balance_lines`
   - `finance_twin_sync_runs`
   - `finance_twin_lineage`

4. Generate or author the forward-only Drizzle migration under `packages/db/drizzle/` and update `packages/db/drizzle/meta/` as needed.

5. Add `apps/control-plane/src/modules/finance-twin/` with the F2A implementation, likely including:
   - `schema.ts`
   - `routes.ts`
   - `service.ts`
   - `repository.ts`
   - `drizzle-repository.ts`
   - `repository-mappers.ts`
   - `freshness.ts`
   - `errors.ts`
   - `extractors/trial-balance-csv.ts`

6. Wire the new module through:
   - `apps/control-plane/src/bootstrap.ts`
   - `apps/control-plane/src/lib/types.ts`
   - `apps/control-plane/src/app.ts`
   - `apps/control-plane/src/test/database.ts`

7. Add deterministic tests covering:
   - finance-twin domain schema parsing
   - DB schema export coverage
   - trial-balance CSV extractor behavior from raw bytes
   - service-level finance sync behavior, including company scope, reporting period creation, ledger-account upserts, trial-balance persistence, lineage, and freshness
   - DB-backed repository persistence
   - app-level sync and summary route behavior

8. Add a packaged local smoke in `tools/finance-twin-smoke.mjs` and a root script, then prove:
   - a source can still be registered and uploaded through F1 routes
   - the finance-twin sync route can read that uploaded raw file and persist Finance Twin state
   - the summary route returns truthful lineage and freshness information

9. Run validation in this exact order:

   ```bash
   pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/finance-twin/*.spec.ts src/app.spec.ts
   pnpm smoke:source-ingest:local
   pnpm smoke:finance-twin:local
   pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm ci:repro:current
   ```

10. If and only if the full validation ladder is green, create exactly one local commit:

   ```bash
   git commit -m "feat: start F2 finance twin slice"
   ```

11. If green, confirm the branch name and requested git status/log commands, push `codex/f2a-finance-twin-foundation-and-first-extractor-local-v1`, verify the remote head, and create or report the PR into `main` with the requested title and body.

## Validation and Acceptance

Required validation commands, in order:

```bash
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/finance-twin/*.spec.ts src/app.spec.ts
pnpm smoke:source-ingest:local
pnpm smoke:finance-twin:local
pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm ci:repro:current
```

Acceptance is met when all of the following are true:

- the repo contains a new additive `finance-twin` bounded context in the control plane
- `packages/domain` defines finance-twin contracts for company scope, reporting periods, ledger accounts, trial-balance lines, lineage, freshness, and summary views
- `packages/db` persists additive finance-twin tables through a forward-only migration
- one deterministic raw-byte trial-balance CSV extractor can sync a stored `source_file` into persisted finance-twin state
- the persisted state is explicitly linked back to source, snapshot, and source-file lineage through queryable columns or rows
- a backend summary route exposes the implemented finance slice and surfaces `fresh`, `stale`, `failed`, or `missing` truthfully
- the packaged local smoke proves one uploaded source can produce Finance Twin state end to end
- F1 source-ingest behavior still works unchanged
- the engineering twin reproducibility tests still pass unchanged
- limitations remain explicit: no CFO Wiki, no finance discovery answers, no reports, no monitoring, no close/control, and no GitHub deletion work

## Idempotence and Recovery

This slice is additive-first and safe to retry when followed carefully.

- Re-running the F2A sync on the same source file should update or replace the targeted trial-balance facts deterministically for the same company and reporting period rather than silently mutating raw source files.
- Re-running tests is safe because the control-plane test DB reset truncates persisted state between cases and will be extended to cover the new finance tables.
- If the migration or repository shape is wrong, restore uncommitted files, regenerate the migration cleanly, and rerun the targeted validations before rejoining the full ladder.
- If validation fails outside this slice or the known narrow engineering-twin reproducibility surface, stop without publishing and report the exact blocker rather than widening scope.

## Artifacts and Notes

Expected artifacts from this slice:

- one active F2A Finance Plan
- additive finance-twin contracts in `packages/domain`
- additive finance-twin schema and migration in `packages/db`
- a dedicated `apps/control-plane/src/modules/finance-twin/` module
- focused tests for extractor, repository, service, route, and smoke behavior
- one packaged local finance-twin smoke
- one clean commit, push, and PR only if the full validation ladder is green

Replay and evidence note:
this slice persists finance sync runs and source lineage, but it does not yet add source-domain replay events, finance evidence bundles, CFO Wiki compilation, or report-generation behavior.
Those later-phase capabilities remain explicitly out of scope.

Freshness and limitation note:
freshness in F2A applies only to the implemented trial-balance slice and must not imply broader finance coverage than the persisted facts actually support.

## Interfaces and Dependencies

Package and runtime boundaries:

- `@pocket-cto/domain` remains the source of truth for finance-twin contracts
- `@pocket-cto/db` remains limited to schema and DB helpers
- `apps/control-plane` owns raw-byte extraction, repository orchestration, freshness rollup, and HTTP transport
- the F2A finance-twin module may depend on the existing source repository and source-storage abstractions to read stored raw source truth, but it must not mutate raw files or source snapshots in place

Configuration expectations:

- reuse the existing Postgres and S3-compatible object-store configuration from F1
- add no new environment variables unless implementation proves one is strictly unavoidable
- keep internal `@pocket-cto/*` package names unchanged

Downstream dependency note:
this slice should become the truthful foundation for later F2 summary/query expansion and later F3/F4/F5/F6 work, but it must not begin those phases here.

## Outcomes & Retrospective

This slice is implemented and fully validated locally.

Implemented scope:

- Added additive finance-twin contracts in `packages/domain/src/finance-twin.ts` for company scope, reporting periods, ledger accounts, trial-balance lines, sync runs, lineage, freshness, and summary views.
- Added additive finance-twin schema in `packages/db/src/schema/finance-twin.ts` plus the forward-only migration `packages/db/drizzle/0017_broad_jetstream.sql`.
- Added a dedicated `apps/control-plane/src/modules/finance-twin/` bounded context for deterministic raw-byte `trial_balance_csv` extraction, persistence, lineage, freshness rollup, and thin sync plus summary routes.
- Added a packaged local smoke in `tools/finance-twin-smoke.mjs` and the root script `pnpm smoke:finance-twin:local`.
- Kept the engineering twin module intact and kept F1 source-ingest as the authoritative raw-source path.

Validation outcomes:

- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/finance-twin/trial-balance-csv.spec.ts src/modules/finance-twin/service.spec.ts src/app.spec.ts` passed.
- `pnpm --filter @pocket-cto/domain exec vitest run src/finance-twin.spec.ts` passed.
- `pnpm --filter @pocket-cto/db exec vitest run src/schema.spec.ts` passed.
- `pnpm run db:migrate:ci` passed.
- `pnpm smoke:source-ingest:local` passed.
- `pnpm smoke:finance-twin:local` passed.
- `pnpm --filter @pocket-cto/control-plane exec vitest run src/modules/twin/workflow-sync.spec.ts src/modules/twin/test-suite-sync.spec.ts src/modules/twin/codeowners-discovery.spec.ts` passed unchanged.
- `pnpm lint` passed after one in-scope type-import fix in `apps/control-plane/src/test/database.ts`.
- `pnpm typecheck` passed after in-scope fixture and container-shape fixes.
- `pnpm test` passed.
- `pnpm ci:repro:current` passed from a clean temporary worktree rooted at `c095aea1b72e3fa959663b30544e228812cfcd35`.

Scope and truthfulness notes:

- The implemented extractor family is limited to `trial_balance_csv`.
- Freshness is truthful only for the implemented finance trial-balance slice.
- No CFO Wiki, finance discovery-answer UX, memo/report generation, monitoring, close/control, connector expansion, or GitHub deletion work was added.
- No active-doc boundary change was required for this slice.

Remaining work:
none inside this plan.
F2A is merged and this plan now serves as the truthful implementation record for the shipped first finance-twin extractor.
