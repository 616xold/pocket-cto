# Add the F1 source-registry foundation beside the legacy GitHub module

## Purpose / Big Picture

This plan implements the first additive **F1 source registry** slice for Pocket CFO.

The user-visible goal is small but important: the control plane should gain a real generic source-registry seam that can register finance source truth without depending on GitHub-first product assumptions.
This slice does not ingest binaries, build the Finance Twin, compile the CFO Wiki, or touch the web UI.
It creates the minimum trustworthy boundary that later F1, F2, and F3 work can extend.

## Progress

- [x] 2026-04-06T23:20:59Z Read the active repo guidance, AGENTS files, roadmap, F0 Finance Plan, and source-provenance guidance to scope the first additive F1 slice.
- [x] 2026-04-06T23:22:41Z Define the smallest additive domain, schema, and control-plane surface that proves a generic source-registry boundary exists beside the legacy GitHub module.
- [x] 2026-04-06T23:30:56Z Implement additive domain contracts, DB schema and migration, and a new `apps/control-plane/src/modules/sources/` module with minimal list, create, and read routes.
- [x] 2026-04-06T23:31:57Z Add deterministic in-memory and DB-backed tests for the new source-registry slice.
- [x] 2026-04-06T23:35:03Z Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and update this plan with outcomes. A single local commit remains the final completion step.

## Surprises & Discoveries

- Observation: the current repo has no generic source-registry module or schema yet.
  Evidence: `packages/domain/src/`, `packages/db/src/schema/`, and `apps/control-plane/src/modules/` still center the current persisted boundaries on missions, replay, approvals, twin state, workspaces, and the legacy GitHub connector.

- Observation: replay is currently mission-scoped rather than source-scoped.
  Evidence: the persisted replay seam and service contracts only address `missions` plus `replay_events`, so adding truthful source-registration replay in this slice would require a broader event-model expansion than the requested first foundation.

- Observation: local validation required bootstrapping dependencies and explicit environment variables.
  Evidence: the fresh worktree started without installed packages, `docker` was unavailable locally, and the shared lint, typecheck, and test tasks require the standard runtime configuration to be present even though this slice does not add new environment settings.

## Decision Log

- Decision: create a new active Finance Plan for this F1 slice instead of overloading the completed F0 plan.
  Rationale: the requested work changes code, schema, and runtime boundaries across multiple packages, so it needs its own executable document.

- Decision: the first registry foundation will model `sources` and immutable `source_snapshots`, with stable IDs, checksums, explicit storage references, and ingest status, but no binary upload or parser-dispatch pipeline yet.
  Rationale: this is the smallest trustworthy seam that satisfies source-provenance rules without widening into later F1/F2 work.

- Decision: GitHub connector work is explicitly out of scope.
  Rationale: the new source-registry boundary must land beside the legacy GitHub module without deleting or renaming it.

- Decision: source registration in this slice will not append replay events.
  Rationale: replay is still mission-bound today, and adding a source-domain replay ledger would widen the slice beyond the requested additive foundation. This limitation will remain explicit in code and plan notes.

## Context and Orientation

Pocket CFO is now the active guidance layer, but the codebase still carries legacy Pocket CTO package names and GitHub-era modules during the transition.
That is expected for this slice.

The relevant bounded contexts are:

- `packages/domain` for pure source-registry contracts
- `packages/db` for additive source tables and migrations
- `apps/control-plane/src/modules/sources/` for the new registry transport, orchestration, and persistence module
- `apps/control-plane/src/app.ts`, `apps/control-plane/src/bootstrap.ts`, and `apps/control-plane/src/lib/types.ts` for container and route wiring

GitHub connector work is out of scope.
Finance Twin, CFO Wiki, reports, monitoring, and web UI work are out of scope.
The active-doc boundary should remain unchanged in this slice unless implementation reveals conflicting active guidance.

## Plan of Work

Implement the source-registry foundation in three bounded steps.

First, add domain contracts that define a source record, immutable snapshots, ingest status, and the minimal create/list/read views.
Second, add additive database tables and a forward-only migration for those records.
Third, add a new `sources` control-plane module with a thin route layer, validated request schemas, a service that creates a source plus initial snapshot transactionally, and both in-memory plus Drizzle repositories.

Keep the module intentionally small.
The goal is to prove the boundary exists, not to finish ingest.

## Concrete Steps

1. Create `plans/FP-0002-source-registry-foundation.md` as the active Finance Plan for this slice and keep it updated while work proceeds.

2. Add additive source-registry contracts in `packages/domain/src/source-registry.ts` and export them from `packages/domain/src/index.ts`.
   The initial contract should include:
   - source kind and origin enums
   - snapshot storage kind and ingest status enums
   - source and source-snapshot records
   - create-source input with one initial snapshot
   - list and detail views for control-plane read surfaces

3. Add additive DB schema in `packages/db/src/schema/sources.ts` and export it from `packages/db/src/schema/index.ts`.
   Model:
   - `sources`
   - `source_snapshots`
   Include explicit checksum, media type, original file name, storage reference, ingest status, and snapshot version.

4. Generate or add the matching forward-only Drizzle migration under `packages/db/drizzle/` and update `packages/db/drizzle/meta/` if generation changes snapshots.

5. Add `apps/control-plane/src/modules/sources/` with:
   - `schema.ts`
   - `routes.ts`
   - `service.ts`
   - `repository.ts`
   - `drizzle-repository.ts`
   - `repository-mappers.ts`
   - `errors.ts`

6. Wire the new module through `apps/control-plane/src/lib/types.ts`, `apps/control-plane/src/bootstrap.ts`, and `apps/control-plane/src/app.ts`.

7. Add deterministic tests for:
   - domain parsing
   - DB schema export coverage
   - source service behavior
   - DB-backed repository persistence
   - HTTP route behavior through the app container

8. Run validation:

   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   ```

9. If validation is green, create exactly one local commit:

   ```bash
   git commit -m "feat: add source registry foundation"
   ```

## Validation and Acceptance

Validation commands:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Acceptance is met when all of the following are true:

- the repo contains a new additive `sources` bounded context in the control plane
- `packages/domain` defines source-registry contracts with explicit source IDs, snapshot IDs, checksum, storage reference, and ingest status
- `packages/db` persists additive `sources` and `source_snapshots` tables with a forward-only migration
- the control plane exposes minimal list, create, and read routes for the source registry
- the legacy GitHub module still compiles unchanged as a separate connector path
- tests cover both in-memory behavior and DB-backed persistence deterministically
- provenance is explicit through source and snapshot records
- freshness and limitations are truthful: ingest status exists, but no parser or Finance Twin freshness behavior is claimed yet

## Idempotence and Recovery

This slice is additive-first and safe to retry.

- Re-running tests is safe because the control-plane test DB reset truncates persisted rows between cases.
- The migration is forward-only; if a local retry fails, restore uncommitted files and regenerate the migration cleanly before re-running validation.
- The new source-registry routes do not mutate legacy GitHub or mission data, so rollback scope stays isolated to the newly added schema and module files.

## Artifacts and Notes

Expected artifacts from this slice:

- one new active Finance Plan for F1
- additive source-registry contracts in `packages/domain`
- additive source-registry tables and migration in `packages/db`
- a new `apps/control-plane/src/modules/sources/` module
- deterministic tests proving the boundary exists
- one clean local commit if validation is green

Replay and evidence note:
this slice creates persisted source-registry state but does not yet append source-domain replay events or evidence bundles.
That limitation is intentional and should remain explicit until a later slice extends replay beyond mission-bound events.

## Interfaces and Dependencies

Package and runtime dependencies:

- `@pocket-cto/domain` remains the source of truth for control-plane contracts
- `@pocket-cto/db` remains limited to schema and DB helpers
- `apps/control-plane` owns concrete source-registry repositories and service orchestration

No new environment variables are expected in this slice.
No active-doc boundary changes are intended.
No stack-pack or skill behavior changes are intended.

## Outcomes & Retrospective

Shipped outcome:
the repo now has an additive generic source-registry seam beside the legacy GitHub connector. `@pocket-cto/domain` defines source and immutable snapshot contracts, `@pocket-cto/db` persists `sources` plus `source_snapshots`, and `apps/control-plane` exposes minimal create, list, and read routes through a dedicated `modules/sources/` boundary.

Scope held:
this slice did not add binary uploads, connector ingest, Finance Twin extraction, CFO Wiki compilation, reports, monitoring, or web UI intake. The legacy GitHub path remains in place and compiles beside the new registry foundation.

Validation results:
`pnpm lint`, `pnpm typecheck`, and `pnpm test` all passed after installing dependencies, generating the additive Drizzle migration, and applying the existing local runtime environment values needed by the monorepo checks.

Replay and evidence posture:
source records and immutable snapshots now persist provenance fields such as checksum, storage reference, and ingest status, but source-domain replay events and evidence bundles are still not implemented. That limitation remains explicit and is the main follow-on constraint for later slices.

Next recommended slice:
add the first file-backed source registration path that stores uploaded artifacts immutably, creates source snapshots through the new registry boundary, and records source-domain replay for registration events without widening into Finance Twin or CFO Wiki work.
